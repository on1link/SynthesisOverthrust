# ============================================================
# SynthesisOverthrust — python_sidecar/db.py
# Async SQLite via aiosqlite. Applies all migrations in order.
# Shared read/write with Rust via WAL mode.
# ============================================================

from __future__ import annotations
import os
import aiosqlite
from pathlib import Path
from config import settings
import structlog

log = structlog.get_logger()

_db: aiosqlite.Connection | None = None


async def get_db() -> aiosqlite.Connection:
    global _db
    if _db is None:
        raise RuntimeError("DB not initialised — call init_db() first")
    return _db


async def init_db() -> None:
    global _db
    
    db_file = Path(settings.DB_PATH)
    
    db_file.parent.mkdir(parents=True, exist_ok=True)
    db_file.touch(exist_ok=True)  # ensure file exists for WAL mode

    _db = await aiosqlite.connect(settings.DB_PATH)
    _db.row_factory = aiosqlite.Row

    # Match Rust PRAGMA settings
    await _db.execute("PRAGMA journal_mode = WAL")
    await _db.execute("PRAGMA foreign_keys = ON")
    await _db.execute("PRAGMA synchronous = NORMAL")
    await _db.execute("PRAGMA cache_size = -16000")

    log.info("Sidecar connected to SQLite database successfully", path=settings.DB_PATH)
