# ============================================================
# SynthesisOverthrust — sm2/router.py
# FastAPI routes for spaced repetition card management.
#
# Cards are keyed to topic_items (lowest mastery unit).
# A review updates: card schedule (SM-2) → sr_reviews log →
# user_item_mastery upsert → v_node_mastery (view, recomputed).
# ============================================================

from __future__ import annotations
import uuid
from datetime import date
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from .engine import SRCard, review_card, initial_schedule
from db import get_db

router = APIRouter()

# Mastery delta per review quality (practice flow uses +8/−3; SR weighted lower)
MASTERY_DELTA = {0: -4, 1: -3, 2: -2, 3: 2, 4: 4, 5: 6}


# ── Schemas ───────────────────────────────────────────────────────────────────
class CardOut(BaseModel):
    id:           str
    user_id:      str
    item_id:      int
    front:        str
    back:         str
    skill_id:     Optional[str] = None
    skill_name:   Optional[str] = None
    topic_name:   Optional[str] = None
    ease_factor:  float
    interval:     int
    repetitions:  int
    due_date:     str


class ReviewIn(BaseModel):
    card_id: str
    quality: int   # 0-5


class ReviewOut(BaseModel):
    card_id:       str
    quality:       int
    new_ef:        float
    new_interval:  int
    due_date:      str
    again:         bool
    mastery_delta: int
    new_mastery:   int
    node_id:       Optional[str] = None
    node_level:    int = 0


class CreateCardIn(BaseModel):
    item_id: int
    front:   Optional[str] = None
    back:    Optional[str] = None
    user_id: str = "default"


# ── Helpers ───────────────────────────────────────────────────────────────────
_CARD_SELECT = """
    SELECT c.*, t.skill_id, s.name AS skill_name, t.header AS topic_name
    FROM sr_cards c
    JOIN topic_items ti ON ti.id = c.item_id
    JOIN topics t       ON t.id = ti.topic_id
    JOIN skills s       ON s.id = t.skill_id
"""


def _row_to_card_out(row) -> CardOut:
    return CardOut(
        id          = row["id"],
        user_id     = row["user_id"],
        item_id     = row["item_id"],
        front       = row["front"],
        back        = row["back"],
        skill_id    = row["skill_id"],
        skill_name  = row["skill_name"],
        topic_name  = row["topic_name"],
        ease_factor = row["ease_factor"],
        interval    = row["interval"],
        repetitions = row["repetitions"],
        due_date    = row["due_date"],
    )


async def _item_context(db, item_id: int):
    """Return (content, topic_header, skill_name, skill_id) for a topic item."""
    async with db.execute(
        """SELECT ti.content, t.header, s.name AS skill_name, s.id AS skill_id
           FROM topic_items ti
           JOIN topics t ON t.id = ti.topic_id
           JOIN skills s ON s.id = t.skill_id
           WHERE ti.id = ?""",
        (item_id,)
    ) as cur:
        return await cur.fetchone()


async def _insert_card(db, user_id: str, item_id: int, front: str, back: str) -> SRCard:
    card = SRCard(id=str(uuid.uuid4()), user_id=user_id, item_id=item_id)
    initial_schedule(card)
    await db.execute(
        """INSERT INTO sr_cards
           (id, user_id, item_id, front, back, ease_factor, interval, repetitions, due_date)
           VALUES (?,?,?,?,?,?,?,?,?)""",
        (card.id, card.user_id, card.item_id, front, back,
         card.ease_factor, card.interval, card.repetitions,
         card.due_date.isoformat())
    )
    return card


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/due", response_model=List[CardOut])
async def get_due_cards(user_id: str = "default", limit: int = 20):
    """Return cards due for review today (sorted by overdue first)."""
    db = await get_db()
    today = date.today().isoformat()
    async with db.execute(
        _CARD_SELECT + " WHERE c.user_id = ? AND c.due_date <= ? ORDER BY c.due_date ASC LIMIT ?",
        (user_id, today, limit)
    ) as cur:
        rows = await cur.fetchall()
    return [_row_to_card_out(r) for r in rows]


@router.get("/all", response_model=List[CardOut])
async def get_all_cards(user_id: str = "default"):
    db = await get_db()
    async with db.execute(
        _CARD_SELECT + " WHERE c.user_id = ? ORDER BY c.due_date ASC",
        (user_id,)
    ) as cur:
        rows = await cur.fetchall()
    return [_row_to_card_out(r) for r in rows]


@router.post("/create", response_model=CardOut)
async def create_card(body: CreateCardIn):
    """Create a new SR card for a topic item."""
    db = await get_db()

    ctx = await _item_context(db, body.item_id)
    if not ctx:
        raise HTTPException(404, f"topic_item {body.item_id} not found")

    async with db.execute(
        "SELECT id FROM sr_cards WHERE user_id = ? AND item_id = ?",
        (body.user_id, body.item_id)
    ) as cur:
        if await cur.fetchone():
            raise HTTPException(409, f"card already exists for item {body.item_id}")

    front = body.front or f"Recall: {ctx['content']}"
    back  = body.back  or f"{ctx['header']} — {ctx['skill_name']}"
    card  = await _insert_card(db, body.user_id, body.item_id, front, back)
    await db.commit()

    return CardOut(
        id=card.id, user_id=card.user_id, item_id=card.item_id,
        front=front, back=back,
        skill_id=ctx["skill_id"], skill_name=ctx["skill_name"], topic_name=ctx["header"],
        ease_factor=card.ease_factor, interval=card.interval,
        repetitions=card.repetitions, due_date=card.due_date.isoformat(),
    )


@router.post("/backfill")
async def backfill_cards(user_id: str = "default"):
    """Create cards for every practiced item (mastery > 0) that has no card yet."""
    db = await get_db()
    async with db.execute(
        """SELECT ti.id AS item_id, ti.content, t.header, s.name AS skill_name
           FROM topic_items ti
           JOIN topics t ON t.id = ti.topic_id
           JOIN skills s ON s.id = t.skill_id
           JOIN user_item_mastery uim
                ON uim.item_id = ti.id AND uim.user_id = ? AND uim.mastery > 0
           WHERE ti.id NOT IN (SELECT item_id FROM sr_cards WHERE user_id = ?)""",
        (user_id, user_id)
    ) as cur:
        rows = list(await cur.fetchall())

    for r in rows:
        await _insert_card(
            db, user_id, r["item_id"],
            f"Recall: {r['content']}",
            f"{r['header']} — {r['skill_name']}",
        )
    await db.commit()
    return {"created": len(rows)}


@router.post("/review", response_model=ReviewOut)
async def submit_review(body: ReviewIn):
    """Submit a review: update card schedule, log it, propagate to item mastery."""
    db = await get_db()

    async with db.execute(
        "SELECT * FROM sr_cards WHERE id = ?", (body.card_id,)
    ) as cur:
        row = await cur.fetchone()
    if not row:
        raise HTTPException(404, f"Card {body.card_id} not found")
    if not 0 <= body.quality <= 5:
        raise HTTPException(422, "quality must be 0-5")

    card = SRCard(
        id          = row["id"],
        user_id     = row["user_id"],
        item_id     = row["item_id"],
        ease_factor = row["ease_factor"],
        interval    = row["interval"],
        repetitions = row["repetitions"],
        due_date    = date.fromisoformat(row["due_date"]),
    )
    result = review_card(card, body.quality)
    delta  = MASTERY_DELTA[body.quality]

    # 1. Persist updated card state
    await db.execute(
        """UPDATE sr_cards
           SET ease_factor = ?, interval = ?, repetitions = ?, due_date = ?,
               last_review = datetime('now')
           WHERE id = ?""",
        (card.ease_factor, card.interval, card.repetitions,
         card.due_date.isoformat(), card.id)
    )
    # 2. Log the review
    await db.execute(
        """INSERT INTO sr_reviews
           (card_id, user_id, quality, prev_ef, new_ef, prev_interval, new_interval, mastery_delta)
           VALUES (?,?,?,?,?,?,?,?)""",
        (result.card_id, row["user_id"], result.quality,
         result.prev_ef, result.new_ef,
         result.prev_interval, result.new_interval, delta)
    )
    # 3. Propagate to item mastery (same upsert shape as Rust practice flow)
    correct = 1 if body.quality >= 3 else 0
    await db.execute(
        """INSERT INTO user_item_mastery
           (user_id, item_id, mastery, practice_count, correct_count, last_practiced)
           VALUES (?, ?, MAX(0, MIN(100, ?)), 1, ?, datetime('now'))
           ON CONFLICT(user_id, item_id) DO UPDATE
              SET mastery        = MAX(0, MIN(100, mastery + ?)),
                  practice_count = practice_count + 1,
                  correct_count  = correct_count + ?,
                  last_practiced = datetime('now')""",
        (row["user_id"], row["item_id"], delta, correct, delta, correct)
    )
    await db.commit()

    # 4. Read back propagated state for the UI
    async with db.execute(
        "SELECT COALESCE(mastery, 0) AS m FROM user_item_mastery WHERE user_id = ? AND item_id = ?",
        (row["user_id"], row["item_id"])
    ) as cur:
        m_row = await cur.fetchone()
    new_mastery = m_row["m"] if m_row else 0

    async with db.execute(
        "SELECT t.skill_id FROM topic_items ti JOIN topics t ON t.id = ti.topic_id WHERE ti.id = ?",
        (row["item_id"],)
    ) as cur:
        node_row = await cur.fetchone()
    node_id = node_row["skill_id"] if node_row else None

    node_level = 0
    if node_id:
        async with db.execute(
            "SELECT COALESCE(computed_level, 0) AS lvl FROM v_node_mastery WHERE user_id = ? AND node_id = ?",
            (row["user_id"], node_id)
        ) as cur:
            lvl_row = await cur.fetchone()
        node_level = lvl_row["lvl"] if lvl_row else 0

    return ReviewOut(
        card_id       = result.card_id,
        quality       = result.quality,
        new_ef        = result.new_ef,
        new_interval  = result.new_interval,
        due_date      = result.due_date.isoformat(),
        again         = result.again,
        mastery_delta = delta,
        new_mastery   = new_mastery,
        node_id       = node_id,
        node_level    = node_level,
    )


@router.get("/stats")
async def card_stats(user_id: str = "default"):
    """Return SR system statistics for the review UI / analytics dashboard."""
    db = await get_db()
    today = date.today().isoformat()
    async with db.execute(
        "SELECT COUNT(*) as total FROM sr_cards WHERE user_id=?", (user_id,)
    ) as cur:
        r = await cur.fetchone()
    total = r["total"] if r else 0
    async with db.execute(
        "SELECT COUNT(*) as due FROM sr_cards WHERE user_id=? AND due_date<=?",
        (user_id, today)
    ) as cur:
        r = await cur.fetchone()
    due = r["due"] if r else 0
    async with db.execute(
        "SELECT AVG(ease_factor) as avg_ef FROM sr_cards WHERE user_id=?", (user_id,)
    ) as cur:
        r = await cur.fetchone()
    avg_ef = (r["avg_ef"] if r else None) or 2.5
    async with db.execute(
        """SELECT COUNT(*) as reviews,
                  AVG(CASE WHEN quality >= 3 THEN 1.0 ELSE 0.0 END) as pass_rate
           FROM sr_reviews WHERE user_id=?""",
        (user_id,)
    ) as cur:
        r = await cur.fetchone()
    reviews   = r["reviews"] if r else 0
    pass_rate = r["pass_rate"] if r else None

    return {
        "total_cards":     total,
        "due_today":       due,
        "avg_ease_factor": round(avg_ef, 3),
        "total_reviews":   reviews,
        "retention":       f"{round(pass_rate * 100)}%" if pass_rate is not None else "—",
    }
