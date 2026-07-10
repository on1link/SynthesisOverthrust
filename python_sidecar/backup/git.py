# ============================================================
# SynthesisOverthrust — backup/git.py
# Git-based auto-backup for vault + SQLite DB snapshots.
# Uses GitPython.
# ============================================================

from __future__ import annotations
import asyncio
import hashlib
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Optional

import structlog

log = structlog.get_logger()

# D29 — repo-root .gitignore. The DB (+ WAL/SHM sidecars) and LanceDB
# vector store are backed up via snapshot_db()/Syncthing respectively,
# never via git.
GITIGNORE_CONTENT = (
    "/synthesis_overthrust.db\n"
    "/synthesis_overthrust.db-wal\n"
    "/synthesis_overthrust.db-shm\n"
    "/lancedb/\n"
    "*.index\n"
    "*.faiss\n"
    "__pycache__/\n"
    ".venv/\n"
)


@dataclass
class CommitResult:
    status:        str   # 'ok' | 'nothing_to_commit' | 'error'
    message:       str
    commit_hash:   Optional[str] = None
    files_changed: int = 0


def _ensure_identity(repo) -> None:
    """Ensure the repo has a resolvable committer identity so local commits
    succeed even on fresh machines / CI runners with no global git config.
    Never clobbers an identity already set at any config level."""
    cr = repo.config_reader()
    has_name  = cr.has_section("user") and cr.has_option("user", "name")
    has_email = cr.has_section("user") and cr.has_option("user", "email")
    if has_name and has_email:
        return
    with repo.config_writer() as cw:
        if not has_name:
            cw.set_value("user", "name", "SynthesisOverthrust")
        if not has_email:
            cw.set_value("user", "email", "backup@synthesisoverthrust.local")


def _get_repo(data_dir: Path):
    """Get or init a git repo at data_dir."""
    import git
    repo_path = data_dir
    is_new = not (repo_path / ".git").exists()
    if is_new:
        git.Repo.init(str(repo_path))
        log.info("Git repo initialised", path=str(repo_path))

    repo = git.Repo(str(repo_path))

    gitignore_path = repo_path / ".gitignore"
    if is_new or not gitignore_path.exists():
        gitignore_path.write_text(GITIGNORE_CONTENT)
    elif "/lancedb/" not in gitignore_path.read_text():
        # One-time upgrade of a pre-D29 .gitignore.
        gitignore_path.write_text(GITIGNORE_CONTENT)

    _ensure_identity(repo)
    return repo


def git_commit(data_dir: str, message: Optional[str] = None) -> CommitResult:
    """Stage all changes and create a commit."""
    try:
        path = Path(data_dir)
        repo = _get_repo(path)

        repo.git.add(A=True)
        if not repo.is_dirty(index=True, working_tree=True, untracked_files=True):
            return CommitResult(status="nothing_to_commit", message="Nothing to commit")

        changed = len(repo.index.diff("HEAD")) if repo.head.is_valid() else 1
        msg     = message or f"synthesis-overthrust auto-backup {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}"
        commit  = repo.index.commit(msg)
        log.info("Git commit", hash=commit.hexsha[:8], files=changed)
        return CommitResult(
            status        = "ok",
            message       = msg,
            commit_hash   = commit.hexsha,
            files_changed = changed,
        )
    except Exception as e:
        log.error("Git commit failed", error=str(e))
        return CommitResult(status="error", message=str(e))


def git_push(data_dir: str) -> str:
    """Push to remote if configured."""
    try:
        repo = _get_repo(Path(data_dir))
        if not repo.remotes:
            return "No remote configured. Add one: git -C <path> remote add origin <url>"
        origin = repo.remotes.origin
        # Explicit refspec — a fresh local branch has no upstream tracking
        # ref yet, and git's "simple" push default refuses to push without one.
        branch = repo.active_branch.name
        origin.push(refspec=f"{branch}:{branch}")
        return "pushed"
    except Exception as e:
        return f"push failed: {e}"


def git_set_remote(data_dir: str, url: str) -> str:
    """Create-or-update the 'origin' remote."""
    repo = _get_repo(Path(data_dir))
    names = [r.name for r in repo.remotes]
    if "origin" in names:
        repo.remotes.origin.set_url(url)
    else:
        repo.create_remote("origin", url)
    log.info("Git remote set", url=url)
    return "ok"


def git_log(data_dir: str, limit: int = 20) -> list[dict]:
    """Return recent commit history."""
    try:
        repo    = _get_repo(Path(data_dir))
        commits = []
        for commit in list(repo.iter_commits())[:limit]:
            commits.append({
                "hash":    commit.hexsha[:8],
                "message": commit.message.strip(),
                "author":  str(commit.author),
                "date":    datetime.fromtimestamp(commit.committed_date).isoformat(),
            })
        return commits
    except Exception:
        return []


def git_status(data_dir: str) -> dict:
    """Return working tree status."""
    try:
        repo = _get_repo(Path(data_dir))
        return {
            "dirty":       repo.is_dirty(),
            "untracked":   len(repo.untracked_files),
            "branch":      str(repo.active_branch),
            "has_remote":  bool(repo.remotes),
            "last_commit": git_log(data_dir, 1)[0] if repo.head.is_valid() else None,
        }
    except Exception as e:
        return {"error": str(e)}


def _consistent_copy(src: str, dst: str) -> None:
    """SQLite online-backup API — safe to run against a live WAL-mode DB
    without pausing writers, unlike a raw file copy."""
    import sqlite3
    with sqlite3.connect(src) as source, sqlite3.connect(dst) as target:
        source.backup(target)


async def snapshot_db(db_path: str, backup_dir: str) -> str:
    """Consistent-copy the SQLite DB into backup_dir/snapshots with a
    timestamped name; prune to the last 10."""
    src  = Path(db_path)
    dst  = Path(backup_dir) / "snapshots"
    dst.mkdir(parents=True, exist_ok=True)
    name = f"synthesis_overthrust_{datetime.utcnow().strftime('%Y%m%d_%H%M%S_%f')}.db"
    target = dst / name
    await asyncio.to_thread(_consistent_copy, str(src), str(target))
    log.info("DB snapshot created", file=name)
    # Keep only last 10 snapshots
    snapshots = sorted(dst.glob("synthesis_overthrust_*.db"))
    for old in snapshots[:-10]:
        old.unlink(missing_ok=True)
    return str(target)


def list_snapshots(backup_dir: str) -> list[dict]:
    """List DB snapshots, newest first."""
    dst = Path(backup_dir) / "snapshots"
    if not dst.exists():
        return []
    files = sorted(dst.glob("synthesis_overthrust_*.db"), reverse=True)
    out = []
    for f in files:
        stat = f.stat()
        out.append({
            "name":    f.name,
            "size":    stat.st_size,
            "sha256":  hashlib.sha256(f.read_bytes()).hexdigest(),
            "created": datetime.fromtimestamp(stat.st_mtime).isoformat(),
        })
    return out


async def ensure_git_repo(data_dir: str) -> None:
    """Ensure git repo exists at data_dir (called on startup)."""
    await asyncio.to_thread(_get_repo, Path(data_dir))


# ── Syncthing helpers ─────────────────────────────────────────────────────────

def syncthing_status(api_key: str, url: str = "http://localhost:8384") -> dict:
    """Query Syncthing REST API for sync status."""
    try:
        import httpx
        r = httpx.get(f"{url}/rest/system/status",
                      headers={"X-API-Key": api_key}, timeout=5)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        return {"error": str(e), "hint": "Start Syncthing and check API key in Settings"}


def syncthing_folders(api_key: str, url: str = "http://localhost:8384") -> list:
    """List Syncthing-synced folders."""
    try:
        import httpx
        r = httpx.get(f"{url}/rest/config/folders",
                      headers={"X-API-Key": api_key}, timeout=5)
        r.raise_for_status()
        return r.json()
    except Exception:
        return []
