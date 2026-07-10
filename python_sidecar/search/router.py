# ============================================================
# SynthesisOverthrust — search/router.py
# Semantic search over the Obsidian vault (B10) on LanceDB
# (D18). Vault path comes from the shared SQLite config table
# (key 'vault_path', written by the Rust set_vault_path
# command), NF_VAULT_PATH as fallback (D19).
# ============================================================

from __future__ import annotations
from typing import List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from config import settings
from db import get_db

router = APIRouter()


class SearchResult(BaseModel):
    path:        str
    title:       str
    tags:        List[str]
    chunk_index: int
    chunk_text:  str
    score:       float


class SearchQuery(BaseModel):
    query: str
    top_k: int = Field(default=6, ge=1, le=50)


async def _vault_path() -> str:
    db = await get_db()
    async with db.execute("SELECT value FROM config WHERE key='vault_path'") as cur:
        row = await cur.fetchone()
    path = (row["value"] if row else "") or settings.VAULT_PATH
    if not path:
        raise HTTPException(409, "vault path not set — pick it in the Vault view first")
    return path


@router.post("/reindex")
async def reindex_vault():
    """Full vault rebuild into the vault_chunks table (D20). Returns counts."""
    from . import store

    path = await _vault_path()
    try:
        return store.reindex(path)
    except NotADirectoryError:
        raise HTTPException(409, f"vault path is not a directory: {path}")
    except ValueError as e:
        raise HTTPException(422, str(e))


@router.post("/query", response_model=List[SearchResult])
async def search_vault(body: SearchQuery):
    """Semantic search over all indexed vault notes."""
    from . import store

    if not body.query.strip():
        raise HTTPException(422, "query must not be empty")
    try:
        return [SearchResult(**r) for r in store.search_chunks(body.query, body.top_k)]
    except FileNotFoundError:
        raise HTTPException(409, "vault not indexed yet — POST /search/reindex first")


@router.get("/related/{skill_id}", response_model=List[SearchResult])
async def find_related_notes(skill_id: str, top_k: int = 5):
    """Vault notes semantically related to a skill (name + topic headers)."""
    from . import store

    db = await get_db()
    async with db.execute(
        """SELECT s.name, GROUP_CONCAT(t.header, ' · ') AS topics
           FROM skills s LEFT JOIN topics t ON t.skill_id = s.id
           WHERE s.id = ? GROUP BY s.id""",
        (skill_id,)
    ) as cur:
        row = await cur.fetchone()
    if row is None:
        raise HTTPException(404, f"unknown skill {skill_id}")

    query = row["name"] + (f" — {row['topics']}" if row["topics"] else "")
    try:
        return [SearchResult(**r) for r in store.search_chunks(query, top_k)]
    except FileNotFoundError:
        raise HTTPException(409, "vault not indexed yet — POST /search/reindex first")


@router.get("/stats")
async def index_stats():
    from . import store
    return store.stats()
