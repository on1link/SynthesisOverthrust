# ============================================================
# SynthesisOverthrust — catalog/router.py
# FastAPI routes for catalog ingestion + semantic retrieval.
# Agents must use /catalog/search (≈500 tokens) instead of
# reading the raw catalog file (≈50K tokens).
# ============================================================

from __future__ import annotations
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from config import settings

router = APIRouter()


class IngestIn(BaseModel):
    path: Optional[str] = None   # defaults to settings.CATALOG_PATH


@router.post("/ingest")
async def ingest_catalog(body: IngestIn | None = None):
    """Parse the catalog markdown and (re)build the LanceDB table."""
    from .parser import parse_catalog_file
    from . import store

    path = Path((body.path if body else None) or settings.CATALOG_PATH)
    if not path.exists():
        raise HTTPException(404, f"catalog file not found: {path}")

    records = parse_catalog_file(path)
    if not records:
        raise HTTPException(422, "catalog parsed to zero subtopics")

    count = store.ingest(records)
    skills = len({r.skill_slug for r in records})
    return {"ingested": count, "skills": skills, "source": str(path)}


@router.get("/search")
async def search_catalog(
    q: str,
    k: int = 8,
    role: Optional[str] = None,
    tier: Optional[str] = None,
):
    from . import store

    if not q.strip():
        raise HTTPException(422, "query must not be empty")
    if not 1 <= k <= 50:
        raise HTTPException(422, "k must be 1-50")
    try:
        return store.search(q, k=k, role=role, tier=tier)
    except FileNotFoundError:
        raise HTTPException(409, "catalog not ingested yet — POST /catalog/ingest first")


@router.get("/stats")
async def catalog_stats():
    from . import store
    return store.stats()
