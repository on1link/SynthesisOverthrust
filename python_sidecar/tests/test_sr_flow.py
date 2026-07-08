# ============================================================
# SynthesisOverthrust — tests/test_sr_flow.py
# Integration: SR review → user_item_mastery → v_node_mastery.
# Runs migrations 001 + 005 against in-memory SQLite and calls
# the sm2 router endpoints directly.
# Run: uv run pytest tests/ -v
# ============================================================

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from datetime import date
from pathlib import Path

import aiosqlite
import pytest
from fastapi import HTTPException

import db as db_module
from sm2 import router as sr

MIGRATIONS = Path(__file__).resolve().parents[2] / "migrations"


@pytest.fixture
async def test_db(monkeypatch):
    conn = await aiosqlite.connect(":memory:")
    conn.row_factory = aiosqlite.Row
    await conn.execute("PRAGMA foreign_keys = ON")

    for fname in ("001_initial.sql", "005_spaced_repetition.sql"):
        await conn.executescript((MIGRATIONS / fname).read_text())

    # Minimal skill tree: 1 skill → 1 topic → 2 items
    await conn.executescript("""
        INSERT INTO users (id, name, username) VALUES ('default', 'Tester', 'Tester');
        INSERT INTO skills (id, name, icon) VALUES ('pytorch', 'PyTorch', 'fire');
        INSERT INTO topics (id, skill_id, header) VALUES (1, 'pytorch', 'Fundamentals');
        INSERT INTO topic_items (id, topic_id, content) VALUES
            (10, 1, 'Tensors and autograd'),
            (11, 1, 'DataLoaders and datasets');
    """)
    await conn.commit()

    monkeypatch.setattr(db_module, "_db", conn)
    yield conn
    await conn.close()


async def _mastery(db, item_id: int) -> int:
    async with db.execute(
        "SELECT mastery FROM user_item_mastery WHERE user_id='default' AND item_id=?",
        (item_id,)
    ) as cur:
        row = await cur.fetchone()
    return row["mastery"] if row else 0


# ── Card creation ─────────────────────────────────────────────────────────────

async def test_create_card_due_today(test_db):
    card = await sr.create_card(sr.CreateCardIn(item_id=10))
    assert card.item_id == 10
    assert card.due_date == date.today().isoformat()
    assert card.skill_id == "pytorch"
    assert card.topic_name == "Fundamentals"

    due = await sr.get_due_cards()
    assert [c.id for c in due] == [card.id]


async def test_create_card_unknown_item_404(test_db):
    with pytest.raises(HTTPException) as e:
        await sr.create_card(sr.CreateCardIn(item_id=999))
    assert e.value.status_code == 404


async def test_create_card_duplicate_409(test_db):
    await sr.create_card(sr.CreateCardIn(item_id=10))
    with pytest.raises(HTTPException) as e:
        await sr.create_card(sr.CreateCardIn(item_id=10))
    assert e.value.status_code == 409


# ── Review → mastery propagation ──────────────────────────────────────────────

async def test_review_propagates_to_mastery_and_node(test_db):
    # Pre-seed mastery so the +6 crosses a level boundary: 58 → 64.
    # Both items at 58/62 → topic avg 60 → skill level 3 after review.
    await test_db.execute(
        "INSERT INTO user_item_mastery (user_id, item_id, mastery) VALUES "
        "('default', 10, 58), ('default', 11, 62)"
    )
    await test_db.commit()

    card = await sr.create_card(sr.CreateCardIn(item_id=10))
    out = await sr.submit_review(sr.ReviewIn(card_id=card.id, quality=5))

    assert out.again is False
    assert out.mastery_delta == 6
    assert out.new_mastery == 64
    assert await _mastery(test_db, 10) == 64
    assert out.node_id == "pytorch"
    # v_node_mastery: avg(64, 62) = 63 → level 3
    assert out.node_level == 3

    # Review logged
    async with test_db.execute(
        "SELECT quality, mastery_delta FROM sr_reviews WHERE card_id=?", (card.id,)
    ) as cur:
        log = await cur.fetchone()
    assert log["quality"] == 5 and log["mastery_delta"] == 6

    # Counters updated
    async with test_db.execute(
        "SELECT practice_count, correct_count FROM user_item_mastery "
        "WHERE user_id='default' AND item_id=10"
    ) as cur:
        counters = await cur.fetchone()
    assert counters["practice_count"] == 1 and counters["correct_count"] == 1


async def test_failed_review_decreases_mastery_and_resets(test_db):
    await test_db.execute(
        "INSERT INTO user_item_mastery (user_id, item_id, mastery) VALUES ('default', 10, 50)"
    )
    await test_db.commit()

    card = await sr.create_card(sr.CreateCardIn(item_id=10))
    out = await sr.submit_review(sr.ReviewIn(card_id=card.id, quality=0))

    assert out.again is True
    assert out.new_interval == 1
    assert out.mastery_delta == -4
    assert await _mastery(test_db, 10) == 46


async def test_mastery_clamped_at_100(test_db):
    await test_db.execute(
        "INSERT INTO user_item_mastery (user_id, item_id, mastery) VALUES ('default', 10, 99)"
    )
    await test_db.commit()

    card = await sr.create_card(sr.CreateCardIn(item_id=10))
    out = await sr.submit_review(sr.ReviewIn(card_id=card.id, quality=5))
    assert out.new_mastery == 100


async def test_mastery_clamped_at_0(test_db):
    card = await sr.create_card(sr.CreateCardIn(item_id=10))
    out = await sr.submit_review(sr.ReviewIn(card_id=card.id, quality=0))
    assert out.new_mastery == 0


async def test_review_unknown_card_404(test_db):
    with pytest.raises(HTTPException) as e:
        await sr.submit_review(sr.ReviewIn(card_id="nope", quality=4))
    assert e.value.status_code == 404


# ── Backfill ──────────────────────────────────────────────────────────────────

async def test_backfill_creates_cards_for_practiced_items(test_db):
    await test_db.execute(
        "INSERT INTO user_item_mastery (user_id, item_id, mastery) VALUES "
        "('default', 10, 40), ('default', 11, 20)"
    )
    await test_db.commit()

    # Item 10 already has a card — backfill must only cover item 11.
    await sr.create_card(sr.CreateCardIn(item_id=10))
    result = await sr.backfill_cards()
    assert result["created"] == 1

    cards = await sr.get_all_cards()
    assert sorted(c.item_id for c in cards) == [10, 11]

    # Idempotent
    result = await sr.backfill_cards()
    assert result["created"] == 0


async def test_backfill_skips_unpracticed_items(test_db):
    result = await sr.backfill_cards()
    assert result["created"] == 0


# ── Stats ─────────────────────────────────────────────────────────────────────

async def test_stats_shape(test_db):
    card = await sr.create_card(sr.CreateCardIn(item_id=10))
    await sr.submit_review(sr.ReviewIn(card_id=card.id, quality=4))
    stats = await sr.card_stats()
    assert stats["total_cards"] == 1
    assert stats["total_reviews"] == 1
    assert stats["retention"] == "100%"
