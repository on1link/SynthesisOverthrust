# ============================================================
# SynthesisOverthrust — tests/test_backup.py
# Git backup (B12): repo init/.gitignore (D29), snapshot_db via the
# sqlite3 online-backup API, retention, /commit + /snapshot-db logging
# to backup_log, /snapshots listing, /set-remote + /push. Offline:
# all git ops are local (init/commit) or push to a local file://
# bare repo — no network.
# Run: uv run pytest tests/ -v
# ============================================================

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import hashlib
import sqlite3
from pathlib import Path

import aiosqlite
import git as gitpython
import pytest
from fastapi import HTTPException

import db as db_module
from config import settings
from backup import git as backup_git
from backup import router as backup_router

MIGRATIONS = Path(__file__).resolve().parents[2] / "migrations"


@pytest.fixture
async def test_db(monkeypatch):
    """In-memory backup_log store (001 + 003_phase3, which defines
    backup_log), mirroring tests/test_llm.py's fixture shape."""
    conn = await aiosqlite.connect(":memory:")
    conn.row_factory = aiosqlite.Row
    await conn.execute("PRAGMA foreign_keys = ON")

    for fname in ("001_initial.sql", "003_phase3.sql"):
        await conn.executescript((MIGRATIONS / fname).read_text())
    await conn.commit()

    monkeypatch.setattr(db_module, "_db", conn)
    yield conn
    await conn.close()


@pytest.fixture
def backup_env(tmp_path, monkeypatch):
    """A real BACKUP_DIR with a seed vault note + a real SQLite file at
    DB_PATH (separate from the in-memory backup_log store above — this
    is the file snapshot_db() actually copies)."""
    backup_dir = tmp_path / "data"
    backup_dir.mkdir()
    (backup_dir / "notes.md").write_text("# seed note\n")

    db_path = backup_dir / "synthesis_overthrust.db"
    conn = sqlite3.connect(str(db_path))
    conn.execute("CREATE TABLE marker (id INTEGER PRIMARY KEY, value TEXT)")
    conn.execute("INSERT INTO marker (value) VALUES ('hello')")
    conn.commit()
    conn.close()

    monkeypatch.setattr(settings, "BACKUP_DIR", str(backup_dir))
    monkeypatch.setattr(settings, "DB_PATH", str(db_path))
    return backup_dir, db_path


# ── 1. init / .gitignore ─────────────────────────────────────────────────────

async def test_ensure_git_repo_creates_gitignore(tmp_path):
    repo_dir = tmp_path / "repo"
    repo_dir.mkdir()
    await backup_git.ensure_git_repo(str(repo_dir))

    assert (repo_dir / ".git").exists()
    content = (repo_dir / ".gitignore").read_text()
    assert "/lancedb/" in content
    assert "/synthesis_overthrust.db" in content


# ── 2. /commit flow ───────────────────────────────────────────────────────────

async def test_commit_flow_logs_snapshot_and_git(test_db, backup_env):
    backup_dir, _ = backup_env

    result = await backup_router.backup_commit(backup_router.CommitIn(message="test commit"))
    assert result["status"] == "ok"
    assert result["snapshot"]

    snap_dir = backup_dir / "snapshots"
    assert (snap_dir / result["snapshot"]).exists()

    async with test_db.execute(
        "SELECT backup_type, status FROM backup_log ORDER BY rowid"
    ) as cur:
        rows = await cur.fetchall()
    assert sorted(r["backup_type"] for r in rows) == ["git", "snapshot"]
    assert all(r["status"] == "ok" for r in rows)

    log_entries = await backup_router.backup_log_endpoint()
    assert log_entries[0]["message"] == "test commit"


# ── 3. immediate second /commit ──────────────────────────────────────────────
#
# PLAN/REALITY NOTE (flagged, not silently redesigned — see final report):
# the plan's A4 item 3 expects git status 'nothing_to_commit' on an immediate
# second /commit. That's unreachable given A1 + A2 as specified: the D29
# .gitignore does not exclude snapshots/, and A2 mandates snapshot_db() runs
# BEFORE git_commit() on every /commit call — so each call always stages a
# brand-new (distinctly-named, thanks to the retention/consistency fix in A1)
# snapshot file and git always has something to commit. What IS true and
# verified below: the snapshot row is logged again, a new distinct snapshot
# file is created each time, and the git commit succeeds each time ('ok').

async def test_second_commit_snapshots_again_and_commits_the_new_snapshot(test_db, backup_env):
    backup_dir, _ = backup_env

    first  = await backup_router.backup_commit(backup_router.CommitIn())
    second = await backup_router.backup_commit(backup_router.CommitIn())

    assert first["status"] == "ok"
    assert second["status"] == "ok"  # new snapshot file each round → always dirty
    assert second["snapshot"] != first["snapshot"]

    snap_dir = backup_dir / "snapshots"
    assert (snap_dir / first["snapshot"]).exists()
    assert (snap_dir / second["snapshot"]).exists()

    async with test_db.execute(
        "SELECT COUNT(*) AS n FROM backup_log WHERE backup_type='snapshot'"
    ) as cur:
        assert (await cur.fetchone())["n"] == 2


# ── 4. snapshot consistency ───────────────────────────────────────────────────

async def test_snapshot_is_consistent_copy(backup_env):
    _, db_path = backup_env

    conn = sqlite3.connect(str(db_path))
    conn.execute("INSERT INTO marker (value) VALUES ('consistency-check')")
    conn.commit()
    conn.close()

    snapshot_path = await backup_git.snapshot_db(str(db_path), str(backup_env[0]))

    snap_conn = sqlite3.connect(snapshot_path)
    rows = snap_conn.execute(
        "SELECT value FROM marker WHERE value='consistency-check'"
    ).fetchall()
    snap_conn.close()
    assert rows == [("consistency-check",)]


# ── 5. retention ──────────────────────────────────────────────────────────────

async def test_snapshot_retention_keeps_last_ten(backup_env):
    backup_dir, db_path = backup_env
    snap_dir = backup_dir / "snapshots"
    snap_dir.mkdir(exist_ok=True)

    fake_names = [f"synthesis_overthrust_20260101_000000_{i:02d}.db" for i in range(12)]
    for name in fake_names:
        (snap_dir / name).write_bytes(b"x")

    await backup_git.snapshot_db(str(db_path), str(backup_dir))

    remaining = sorted(p.name for p in snap_dir.glob("synthesis_overthrust_*.db"))
    assert len(remaining) == 10
    assert fake_names[0] not in remaining
    assert fake_names[1] not in remaining
    assert fake_names[2] not in remaining
    assert fake_names[-1] in remaining


# ── 6. /snapshots list ────────────────────────────────────────────────────────

async def test_list_snapshots_newest_first_with_sha256(backup_env):
    backup_dir, db_path = backup_env

    await backup_git.snapshot_db(str(db_path), str(backup_dir))
    await backup_git.snapshot_db(str(db_path), str(backup_dir))

    result = await backup_router.backup_snapshots()
    assert len(result) == 2
    assert result[0]["name"] > result[1]["name"]  # newest first

    snap_path = backup_dir / "snapshots" / result[0]["name"]
    assert result[0]["sha256"] == hashlib.sha256(snap_path.read_bytes()).hexdigest()
    assert result[0]["size"] == snap_path.stat().st_size


# ── 7. /set-remote + /push (local file:// bare repo) ─────────────────────────

async def test_set_remote_then_push(backup_env, tmp_path):
    backup_dir, _ = backup_env

    # Seed a commit so there's something to push.
    seeded = backup_git.git_commit(str(backup_dir))
    assert seeded.status == "ok"

    bare_dir = tmp_path / "bare.git"
    gitpython.Repo.init(str(bare_dir), bare=True)

    set_result = await backup_router.backup_set_remote(
        backup_router.SetRemoteIn(url=f"file://{bare_dir}")
    )
    assert set_result["result"] == "ok"

    push_result = await backup_router.backup_push()
    assert push_result["result"] == "pushed"

    status = await backup_router.backup_status()
    assert status["has_remote"] is True


# ── 8. /set-remote empty url ──────────────────────────────────────────────────

async def test_set_remote_empty_url_422(backup_env):
    with pytest.raises(HTTPException) as exc:
        await backup_router.backup_set_remote(backup_router.SetRemoteIn(url=""))
    assert exc.value.status_code == 422
