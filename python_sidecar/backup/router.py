# ============================================================
# SynthesisOverthrust — backup/router.py
# Git backup + Syncthing status endpoints
# ============================================================

from __future__ import annotations
from dataclasses import asdict
from pathlib import Path
from typing import Optional
import asyncio

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from .git import (
    git_commit, git_push, git_log, git_status, git_set_remote,
    snapshot_db, list_snapshots, syncthing_status, syncthing_folders,
)
from config import settings
from db import get_db

router = APIRouter()


def _data_dir() -> str:
    return settings.BACKUP_DIR


class CommitIn(BaseModel):
    message: Optional[str] = None


class SetRemoteIn(BaseModel):
    url: str


async def _log_snapshot(db, name: str) -> None:
    await db.execute(
        "INSERT INTO backup_log (backup_type, target, commit_hash, files_changed, status) VALUES (?,?,?,?,?)",
        ("snapshot", name, None, 0, "ok")
    )


@router.get("/status")
async def backup_status():
    return git_status(_data_dir())


@router.post("/commit")
async def backup_commit(body: CommitIn):
    db = await get_db()

    snapshot_path = await snapshot_db(settings.DB_PATH, _data_dir())
    snapshot_name = Path(snapshot_path).name
    await _log_snapshot(db, snapshot_name)
    await db.commit()

    result = await asyncio.to_thread(git_commit, _data_dir(), body.message)
    await db.execute(
        "INSERT INTO backup_log (backup_type, target, commit_hash, files_changed, status) VALUES (?,?,?,?,?)",
        ("git", "vault+db", result.commit_hash, result.files_changed, result.status)
    )
    await db.commit()

    return {**asdict(result), "snapshot": snapshot_name}


@router.post("/push")
async def backup_push():
    msg = await asyncio.to_thread(git_push, _data_dir())
    return {"result": msg}


@router.post("/set-remote")
async def backup_set_remote(body: SetRemoteIn):
    if not body.url:
        raise HTTPException(422, "url must not be empty")
    result = await asyncio.to_thread(git_set_remote, _data_dir(), body.url)
    return {"result": result}


@router.get("/log")
async def backup_log_endpoint(limit: int = 20):
    return git_log(_data_dir(), limit)


@router.post("/snapshot-db")
async def snapshot_database():
    db = await get_db()
    snapshot_path = await snapshot_db(settings.DB_PATH, _data_dir())
    snapshot_name = Path(snapshot_path).name
    await _log_snapshot(db, snapshot_name)
    await db.commit()
    return {"snapshot": snapshot_path}


@router.get("/snapshots")
async def backup_snapshots():
    return list_snapshots(_data_dir())


@router.get("/syncthing/status")
async def get_syncthing_status(api_key: str = "", url: str = "http://localhost:8384"):
    return syncthing_status(api_key, url)


@router.get("/syncthing/folders")
async def get_syncthing_folders(api_key: str = "", url: str = "http://localhost:8384"):
    return syncthing_folders(api_key, url)
