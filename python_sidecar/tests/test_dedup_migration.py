# ============================================================
# SynthesisOverthrust — tests/test_dedup_migration.py
# Defect SO-D4: double-applied seed duplicated topic_items.
# Verifies 008 dedups, preserves progress on the canonical row,
# and makes future seed re-runs idempotent via the unique index.
# Run: uv run pytest tests/ -v
# ============================================================

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import sqlite3
from pathlib import Path

import pytest

MIGRATIONS = Path(__file__).resolve().parents[2] / "migrations"


def _apply(conn, *names):
    for n in names:
        conn.executescript((MIGRATIONS / n).read_text())


@pytest.fixture
def polluted_db():
    """Real-world shape: seed applied twice → duplicated items."""
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    _apply(conn, "001_initial.sql",
           "004_seed_skill_tree.sql", "004_seed_skill_tree.sql",   # double seed
           "005_spaced_repetition.sql", "006_fsrs.sql", "007_scout.sql")
    yield conn
    conn.close()


def _dup_count(conn) -> int:
    return conn.execute(
        """SELECT COUNT(*) FROM topic_items ti
           WHERE ti.id <> (SELECT MIN(k.id) FROM topic_items k
                           WHERE k.topic_id = ti.topic_id AND k.content = ti.content)"""
    ).fetchone()[0]


def test_double_seed_reproduces_defect(polluted_db):
    assert _dup_count(polluted_db) > 0    # defect present before 008


def test_008_dedups_and_locks(polluted_db):
    before_unique = polluted_db.execute(
        "SELECT COUNT(DISTINCT topic_id || '|' || content) FROM topic_items"
    ).fetchone()[0]

    _apply(polluted_db, "008_dedup_topic_items.sql")

    assert _dup_count(polluted_db) == 0
    assert polluted_db.execute("SELECT COUNT(*) FROM topic_items").fetchone()[0] == before_unique

    # Unique index in place → a third seed run adds nothing
    _apply(polluted_db, "004_seed_skill_tree.sql")
    assert _dup_count(polluted_db) == 0


def test_008_preserves_progress_on_canonical(polluted_db):
    # Progress recorded against a DUPLICATE id must survive on the canonical id
    dup = polluted_db.execute(
        """SELECT ti.id AS dup_id,
                  (SELECT MIN(k.id) FROM topic_items k
                   WHERE k.topic_id = ti.topic_id AND k.content = ti.content) AS keep_id
           FROM topic_items ti
           WHERE ti.id <> (SELECT MIN(k.id) FROM topic_items k
                           WHERE k.topic_id = ti.topic_id AND k.content = ti.content)
           LIMIT 1"""
    ).fetchone()
    polluted_db.execute(
        "INSERT INTO user_item_mastery (user_id, item_id, mastery) VALUES ('default', ?, 77)",
        (dup["dup_id"],)
    )
    polluted_db.commit()

    _apply(polluted_db, "008_dedup_topic_items.sql")

    row = polluted_db.execute(
        "SELECT mastery FROM user_item_mastery WHERE user_id='default' AND item_id=?",
        (dup["keep_id"],)
    ).fetchone()
    assert row and row["mastery"] == 77
    # No dangling reference to the removed duplicate
    assert polluted_db.execute(
        "SELECT COUNT(*) FROM user_item_mastery WHERE item_id=?", (dup["dup_id"],)
    ).fetchone()[0] == 0


def test_008_canonical_row_wins_on_clash(polluted_db):
    dup = polluted_db.execute(
        """SELECT ti.id AS dup_id,
                  (SELECT MIN(k.id) FROM topic_items k
                   WHERE k.topic_id = ti.topic_id AND k.content = ti.content) AS keep_id
           FROM topic_items ti
           WHERE ti.id <> (SELECT MIN(k.id) FROM topic_items k
                           WHERE k.topic_id = ti.topic_id AND k.content = ti.content)
           LIMIT 1"""
    ).fetchone()
    polluted_db.execute(
        "INSERT INTO user_item_mastery (user_id, item_id, mastery) VALUES "
        "('default', ?, 90), ('default', ?, 10)",
        (dup["keep_id"], dup["dup_id"])
    )
    polluted_db.commit()

    _apply(polluted_db, "008_dedup_topic_items.sql")

    row = polluted_db.execute(
        "SELECT mastery FROM user_item_mastery WHERE user_id='default' AND item_id=?",
        (dup["keep_id"],)
    ).fetchone()
    assert row["mastery"] == 90   # canonical row kept, clashing dup dropped
