# ============================================================
# SynthesisOverthrust — tests/test_assess.py
# Agent assessments (B7): mastery gate at MASTERY_SR_CAP (D21),
# checkpoint resume (D24), pass/fail grading + mastery settlement
# (D25). Offline: `_ollama_chat` monkeypatched — no network, no
# model downloads. `catalog_store.search` monkeypatched to raise
# FileNotFoundError (no LanceDB in tests).
# Run: uv run pytest tests/ -v
# ============================================================

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import json
from pathlib import Path

import aiosqlite
import httpx
import pytest
from fastapi import HTTPException

import db as db_module
from assess import router as assess
from catalog import store as catalog_store

MIGRATIONS = Path(__file__).resolve().parents[2] / "migrations"


@pytest.fixture
async def test_db(monkeypatch):
    conn = await aiosqlite.connect(":memory:")
    conn.row_factory = aiosqlite.Row
    await conn.execute("PRAGMA foreign_keys = ON")

    for fname in ("001_initial.sql", "011_assessments.sql"):
        await conn.executescript((MIGRATIONS / fname).read_text())

    # Minimal skill tree: 1 skill → 1 topic → 2 items.
    # Item 10 sits at the cap (assessable); item 11 sits below it.
    await conn.executescript("""
        INSERT INTO users (id, name, username) VALUES ('default', 'Tester', 'Tester');
        INSERT INTO skills (id, name, icon) VALUES ('pytorch', 'PyTorch', 'fire');
        INSERT INTO topics (id, skill_id, header) VALUES (1, 'pytorch', 'Fundamentals');
        INSERT INTO topic_items (id, topic_id, content) VALUES
            (10, 1, 'Tensors and autograd'),
            (11, 1, 'DataLoaders and datasets');
        INSERT INTO user_item_mastery (user_id, item_id, mastery) VALUES
            ('default', 10, 80),
            ('default', 11, 40);
    """)
    await conn.commit()

    monkeypatch.setattr(db_module, "_db", conn)
    yield conn
    await conn.close()


@pytest.fixture(autouse=True)
def no_catalog(monkeypatch):
    """No LanceDB catalog in tests — /start must degrade gracefully (no neighbor framings)."""
    def boom(*args, **kwargs):
        raise FileNotFoundError("catalog table not ingested yet")
    monkeypatch.setattr(catalog_store, "search", boom)


def _fake_ollama(reply: str, capture: list | None = None):
    """Fake for assess.router._ollama_chat — records messages, returns canned text."""
    async def fake(messages, model, stream=False):
        if capture is not None:
            capture.append(messages)
        return reply
    return fake


def _down_ollama():
    async def fake(messages, model, stream=False):
        raise httpx.ConnectError("connection refused")
    return fake


QUESTIONS_JSON = json.dumps([
    {"question": "q1", "framing": "f1"},
    {"question": "q2", "framing": "f2"},
    {"question": "q3", "framing": "f3"},
    {"question": "q4", "framing": "f4"},
])


def _verdicts(score: int, n: int = 4) -> str:
    return json.dumps([{"score": score, "feedback": f"verdict {i}"} for i in range(n)])


# ── /start ────────────────────────────────────────────────────────────────────

async def test_start_below_cap_409(test_db, monkeypatch):
    monkeypatch.setattr(assess, "_ollama_chat", _fake_ollama(QUESTIONS_JSON))
    with pytest.raises(HTTPException) as e:
        await assess.start_assessment(assess.StartIn(item_id=11))
    assert e.value.status_code == 409

    async with test_db.execute("SELECT COUNT(*) AS n FROM assessments") as cur:
        assert (await cur.fetchone())["n"] == 0


async def test_start_unknown_item_404(test_db, monkeypatch):
    monkeypatch.setattr(assess, "_ollama_chat", _fake_ollama(QUESTIONS_JSON))
    with pytest.raises(HTTPException) as e:
        await assess.start_assessment(assess.StartIn(item_id=999))
    assert e.value.status_code == 404


async def test_start_at_cap_creates_assessment(test_db, monkeypatch):
    monkeypatch.setattr(assess, "_ollama_chat", _fake_ollama(QUESTIONS_JSON))
    out = await assess.start_assessment(assess.StartIn(item_id=10))
    assert out["item_id"] == 10
    assert out["mastery_before"] == 80
    assert out["cap"] == 80
    assert len(out["questions"]) == 4

    async with test_db.execute(
        "SELECT status, mastery_before FROM assessments WHERE id=?", (out["assessment_id"],)
    ) as cur:
        row = await cur.fetchone()
    assert row["status"] == "active"
    assert row["mastery_before"] == 80


async def test_start_again_while_active_resumes(test_db, monkeypatch):
    monkeypatch.setattr(assess, "_ollama_chat", _fake_ollama(QUESTIONS_JSON))
    first = await assess.start_assessment(assess.StartIn(item_id=10))
    second = await assess.start_assessment(assess.StartIn(item_id=10))
    assert second["assessment_id"] == first["assessment_id"]

    async with test_db.execute(
        "SELECT COUNT(*) AS n FROM assessments WHERE item_id=10"
    ) as cur:
        assert (await cur.fetchone())["n"] == 1


async def test_start_ollama_down_503_no_row(test_db, monkeypatch):
    monkeypatch.setattr(assess, "_ollama_chat", _down_ollama())
    with pytest.raises(HTTPException) as e:
        await assess.start_assessment(assess.StartIn(item_id=10))
    assert e.value.status_code == 503

    async with test_db.execute("SELECT COUNT(*) AS n FROM assessments") as cur:
        assert (await cur.fetchone())["n"] == 0


# ── /submit ───────────────────────────────────────────────────────────────────

async def test_submit_wrong_answer_count_422(test_db, monkeypatch):
    monkeypatch.setattr(assess, "_ollama_chat", _fake_ollama(QUESTIONS_JSON))
    started = await assess.start_assessment(assess.StartIn(item_id=10))

    with pytest.raises(HTTPException) as e:
        await assess.submit_assessment(assess.SubmitIn(
            assessment_id=started["assessment_id"], answers=["only one"]
        ))
    assert e.value.status_code == 422


async def test_submit_pass_raises_mastery_and_locks(test_db, monkeypatch):
    monkeypatch.setattr(assess, "_ollama_chat", _fake_ollama(QUESTIONS_JSON))
    started = await assess.start_assessment(assess.StartIn(item_id=10))

    monkeypatch.setattr(assess, "_ollama_chat", _fake_ollama(_verdicts(90)))
    out = await assess.submit_assessment(assess.SubmitIn(
        assessment_id=started["assessment_id"], answers=["a", "b", "c", "d"]
    ))
    assert out["status"] == "passed"
    assert out["score"] == 90
    assert out["mastery_before"] == 80
    assert out["mastery_after"] == 98   # cap(80) + round(90/5)=18

    async with test_db.execute(
        "SELECT mastery FROM user_item_mastery WHERE user_id='default' AND item_id=10"
    ) as cur:
        assert (await cur.fetchone())["mastery"] == 98

    async with test_db.execute(
        "SELECT status, completed_at FROM assessments WHERE id=?", (started["assessment_id"],)
    ) as cur:
        row = await cur.fetchone()
    assert row["status"] == "passed"
    assert row["completed_at"] is not None

    # Already completed — a second submit is rejected outright
    with pytest.raises(HTTPException) as e:
        await assess.submit_assessment(assess.SubmitIn(
            assessment_id=started["assessment_id"], answers=["a", "b", "c", "d"]
        ))
    assert e.value.status_code == 409


async def test_submit_fail_leaves_mastery_unchanged(test_db, monkeypatch):
    monkeypatch.setattr(assess, "_ollama_chat", _fake_ollama(QUESTIONS_JSON))
    started = await assess.start_assessment(assess.StartIn(item_id=10))

    monkeypatch.setattr(assess, "_ollama_chat", _fake_ollama(_verdicts(40)))
    out = await assess.submit_assessment(assess.SubmitIn(
        assessment_id=started["assessment_id"], answers=["a", "b", "c", "d"]
    ))
    assert out["status"] == "failed"
    assert out["mastery_after"] == 80

    async with test_db.execute(
        "SELECT mastery FROM user_item_mastery WHERE user_id='default' AND item_id=10"
    ) as cur:
        assert (await cur.fetchone())["mastery"] == 80

    async with test_db.execute(
        "SELECT status FROM assessments WHERE id=?", (started["assessment_id"],)
    ) as cur:
        assert (await cur.fetchone())["status"] == "failed"
