# ============================================================
# SynthesisOverthrust — scout/router.py
# Skill Scout API: run discovery, list proposals, decide
# (approve / edit / reject), few-shot corrections.
#
# Correction write-back (contexto §5, core design): approve or
# edit appends the subtopic to the LanceDB catalog AND upserts
# skills/topics/topic_items in SQLite so it becomes trackable.
# ============================================================

from __future__ import annotations
import json
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from db import get_db
from catalog import store
from catalog.parser import SubtopicRecord, _slug
from .sources import fetch_candidates
from .agent import run_scout

router = APIRouter()


# ── Schemas ───────────────────────────────────────────────────────────────────
class RunIn(BaseModel):
    sources: Optional[List[str]] = None   # default: arxiv + huggingface
    limit:   int = 15


class DecideIn(BaseModel):
    proposal_id: str
    action:      str                      # approve | edit | reject
    # optional overrides when action == "edit"
    skill: Optional[str] = None
    topic: Optional[str] = None
    tier:  Optional[str] = None
    roles: Optional[List[str]] = None


def _row_to_proposal(row) -> dict:
    return {
        "id":          row["id"],
        "source":      row["source"],
        "external_id": row["external_id"],
        "title":       row["title"],
        "summary":     row["summary"],
        "url":         row["url"],
        "proposed": {
            "skill":      row["proposed_skill"],
            "skill_slug": row["proposed_skill_slug"],
            "topic":      row["proposed_topic"],
            "tier":       row["proposed_tier"],
            "roles":      [r for r in (row["proposed_roles"] or "").split(",") if r],
        },
        "similarity":  row["similarity"],
        "neighbors":   json.loads(row["neighbors"] or "[]"),
        "status":      row["status"],
        "correction":  json.loads(row["correction"]) if row["correction"] else None,
        "created_at":  row["created_at"],
        "decided_at":  row["decided_at"],
    }


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/run")
async def scout_run(body: RunIn | None = None):
    """Fetch fresh candidates and store placement proposals."""
    body = body or RunIn()
    if not 1 <= body.limit <= 50:
        raise HTTPException(422, "limit must be 1-50")
    db = await get_db()
    try:
        candidates = await fetch_candidates(sources=body.sources, limit=body.limit)
    except Exception as e:
        raise HTTPException(502, f"source fetch failed: {e}")
    try:
        return await run_scout(db, candidates)
    except FileNotFoundError:
        raise HTTPException(409, "catalog not ingested yet — POST /catalog/ingest first")


@router.get("/proposals")
async def list_proposals(status: str = "pending", limit: int = 50):
    if status not in ("pending", "approved", "edited", "rejected", "all"):
        raise HTTPException(422, "invalid status filter")
    db = await get_db()
    where = "" if status == "all" else "WHERE status = ?"
    args = () if status == "all" else (status,)
    async with db.execute(
        f"SELECT * FROM scout_proposals {where} ORDER BY created_at DESC LIMIT ?",
        (*args, limit)
    ) as cur:
        rows = await cur.fetchall()
    return [_row_to_proposal(r) for r in rows]


@router.post("/decide")
async def decide(body: DecideIn):
    """Apply a user decision; approve/edit writes back to LanceDB + SQLite."""
    if body.action not in ("approve", "edit", "reject"):
        raise HTTPException(422, "action must be approve|edit|reject")

    db = await get_db()
    async with db.execute(
        "SELECT * FROM scout_proposals WHERE id = ?", (body.proposal_id,)
    ) as cur:
        row = await cur.fetchone()
    if not row:
        raise HTTPException(404, f"proposal {body.proposal_id} not found")
    if row["status"] != "pending":
        raise HTTPException(409, f"proposal already decided: {row['status']}")

    if body.action == "reject":
        await db.execute(
            "UPDATE scout_proposals SET status='rejected', decided_at=datetime('now') WHERE id=?",
            (body.proposal_id,)
        )
        await db.commit()
        return {"status": "rejected"}

    # Final placement = proposal, overridden by edits
    skill = (body.skill or row["proposed_skill"] or "").strip()
    topic = (body.topic or row["proposed_topic"] or "").strip()
    tier  = (body.tier or row["proposed_tier"] or "").strip()
    roles = body.roles if body.roles is not None else \
        [r for r in (row["proposed_roles"] or "").split(",") if r]
    if not skill or not topic:
        raise HTTPException(422, "placement needs skill and topic")

    skill_slug = _slug(skill)
    edited = body.action == "edit"

    # 1. SQLite tree upsert (skill → topic → item)
    await db.execute(
        "INSERT OR IGNORE INTO skills (id, name, icon, description) VALUES (?,?,?,?)",
        (skill_slug, skill, "✦", f"Added by Skill Scout ({row['source']})")
    )
    async with db.execute(
        "SELECT id FROM topics WHERE skill_id=? AND header=?", (skill_slug, topic)
    ) as cur:
        t_row = await cur.fetchone()
    if t_row:
        topic_id = t_row["id"]
    else:
        cur = await db.execute(
            "INSERT INTO topics (skill_id, header) VALUES (?,?)", (skill_slug, topic)
        )
        topic_id = cur.lastrowid
    cur = await db.execute(
        "INSERT INTO topic_items (topic_id, content) VALUES (?,?)",
        (topic_id, row["title"])
    )
    item_id = cur.lastrowid

    # 2. LanceDB catalog append
    record = SubtopicRecord(
        id            = f"{skill_slug}/{_slug(topic)}/{_slug(row['title'])[:80]}",
        skill         = skill,
        skill_slug    = skill_slug,
        topic         = topic,
        subtopic      = row["title"],
        tier          = tier,
        roles         = sorted(set(roles)),
        max_level     = None,
        prerequisites = "",
    )
    try:
        store.add_records([record])
    except FileNotFoundError:
        raise HTTPException(409, "catalog not ingested yet — POST /catalog/ingest first")

    # 3. Close the proposal with the final placement (few-shot example)
    correction = {"skill": skill, "topic": topic, "tier": tier,
                  "roles": sorted(set(roles)), "sqlite_item_id": item_id}
    await db.execute(
        """UPDATE scout_proposals
           SET status=?, correction=?, decided_at=datetime('now') WHERE id=?""",
        ("edited" if edited else "approved", json.dumps(correction), body.proposal_id)
    )
    await db.commit()

    return {"status": "edited" if edited else "approved",
            "placement": correction, "lance_id": record.id}


@router.get("/fewshot")
async def fewshot(limit: int = 20):
    """Accumulated corrections — few-shot pool for future classification."""
    db = await get_db()
    async with db.execute(
        """SELECT * FROM scout_proposals
           WHERE status != 'pending'
           ORDER BY decided_at DESC LIMIT ?""",
        (limit,)
    ) as cur:
        rows = await cur.fetchall()
    out = []
    for r in rows:
        final = json.loads(r["correction"]) if r["correction"] else None
        out.append({
            "title":    r["title"],
            "summary":  r["summary"][:200],
            "proposed": {"skill": r["proposed_skill"], "topic": r["proposed_topic"],
                         "tier": r["proposed_tier"]},
            "decision": r["status"],
            "final":    final,
        })
    return out
