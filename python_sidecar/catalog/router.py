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
    tree = await sync_tree()  # mirror roles/links/tiers into SQLite (SO-9)
    return {"ingested": count, "skills": skills, "source": str(path), "tree_sync": tree}


@router.post("/sync-tree")
async def sync_tree():
    """
    Mirror catalog knowledge into the SQLite tree so the Skills view can
    render it: role rows for every catalog role code, skill_roles links and
    difficulty_id for each SQLite skill that matches a catalog skill by
    normalized name. Idempotent.
    """
    from db import get_db
    from . import store
    from .parser import _slug
    from .sync import (SKILL_ALIASES, ensure_roles, link_skill, normalize_roles,
                       role_display_names, set_difficulty)

    try:
        meta = store.skill_meta()
    except FileNotFoundError:
        raise HTTPException(409, "catalog not ingested yet — POST /catalog/ingest first")

    names = role_display_names(settings.CATALOG_PATH)
    known = normalize_roles((c for m in meta for c in m["roles"]))
    db = await get_db()
    roles_created = await ensure_roles(db, known, names)

    by_slug = {m["skill_slug"]: m for m in meta}
    async with db.execute("SELECT id, name FROM skills") as cur:
        skills = await cur.fetchall()

    links_created = tiers_set = 0
    unmatched: list[str] = []
    for s in skills:
        m = (by_slug.get(_slug(s["name"])) or by_slug.get(s["id"])
             or by_slug.get(SKILL_ALIASES.get(s["id"], "")))
        if m is None:
            unmatched.append(s["id"])
            continue
        links_created += await link_skill(db, s["id"], normalize_roles(m["roles"], known))
        tiers_set += await set_difficulty(db, s["id"], m["tier"])
    await db.commit()

    return {
        "roles_created": roles_created,
        "links_created": links_created,
        "tiers_set":     tiers_set,
        "matched":       len(skills) - len(unmatched),
        "unmatched":     unmatched,
    }


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
