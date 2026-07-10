# ============================================================
# SynthesisOverthrust — assess/router.py
# Agent assessments (B7): the only path above MASTERY_SR_CAP (D21).
#   POST /start   → generate an assessment (or resume an active one, D24)
#   POST /submit  → grade answers, raise mastery on pass (D25)
#   GET  /active  → in-progress assessment(s), for UI resume
#   GET  /history → completed assessments for an item
# ============================================================

from __future__ import annotations
import json
import uuid
from typing import List, Optional

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from llm.router import _ollama_chat, _parse_json_array
from config import settings
from db import get_db

router = APIRouter()


def _resolve_assess_model(requested: Optional[str]) -> str:
    """Dedicated assessment model (SO-D5) — small models garble/grade erratically."""
    return requested or settings.ASSESS_MODEL or settings.OLLAMA_MODEL


def _valid_questions(questions: list) -> bool:
    """Reject garbled generations (SO-D5): wrong count, empty/stub questions."""
    if len(questions) != settings.ASSESS_QUESTIONS:
        return False
    for q in questions:
        text = str(q.get("question", "")).strip()
        if len(text.split()) < 8 or "�" in text:
            return False
    return True


# ── Schemas ───────────────────────────────────────────────────────────────────
class StartIn(BaseModel):
    item_id: int
    model:   Optional[str] = None


class SubmitIn(BaseModel):
    assessment_id: str
    answers:       List[str]


# ── /start ────────────────────────────────────────────────────────────────────
@router.post("/start")
async def start_assessment(body: StartIn):
    """
    Start (or resume) an agent assessment for a topic item. Assessments are
    the only way to push mastery past MASTERY_SR_CAP (D21) — SR and practice
    both clamp there. An already-active assessment for this item is returned
    unchanged (checkpoint resume, D24) instead of generating a new one.
    """
    db = await get_db()

    async with db.execute(
        """SELECT ti.content, t.header AS topic, s.name AS skill, s.id AS skill_id
           FROM topic_items ti
           JOIN topics t ON ti.topic_id = t.id
           JOIN skills s ON t.skill_id  = s.id
           WHERE ti.id = ?""",
        (body.item_id,)
    ) as cur:
        ctx = await cur.fetchone()
    if ctx is None:
        raise HTTPException(404, f"Unknown item_id {body.item_id}")

    # Checkpoint resume (D24): an active assessment for this item wins outright
    async with db.execute(
        """SELECT * FROM assessments
           WHERE user_id = ? AND item_id = ? AND status = 'active'""",
        ("default", body.item_id)
    ) as cur:
        active = await cur.fetchone()
    if active:
        return {
            "assessment_id":  active["id"],
            "item_id":        body.item_id,
            "questions":      json.loads(active["questions"]),
            "mastery_before": active["mastery_before"],
            "cap":            settings.MASTERY_SR_CAP,
        }

    # Mastery gate (D21): assessments only unlock once SR/practice hit the cap
    async with db.execute(
        "SELECT mastery FROM user_item_mastery WHERE user_id = ? AND item_id = ?",
        ("default", body.item_id)
    ) as cur:
        m_row = await cur.fetchone()
    current_mastery = m_row["mastery"] if m_row else 0
    cap = settings.MASTERY_SR_CAP
    if current_mastery < cap:
        raise HTTPException(409, f"keep practicing — assessments unlock at mastery {cap}")

    model = _resolve_assess_model(body.model)

    # Variant framings (D23/D9): neighbor subtopics from the catalog feed
    # alternative domain framings into the question prompt.
    from catalog import store as catalog_store
    try:
        neighbors = catalog_store.search(
            f"{ctx['skill']} {ctx['topic']} {ctx['content']}", k=3)
    except FileNotFoundError:
        neighbors = []
    framing_hint = (
        "Alternative domain framings to draw at least one question from: "
        + ", ".join(n["subtopic"] for n in neighbors)
        if neighbors else ""
    )

    prompt = f"""You are assessing mastery of a specific subtopic for an ML engineering learner.
- Skill: {ctx['skill']}
- Topic: {ctx['topic']}
- Subtopic: {ctx['content']}
{framing_hint}

Generate exactly {settings.ASSESS_QUESTIONS} open-ended questions that probe transfer and
edge-case understanding of this subtopic — not rote recall. Each question must come from a
different framing (a different domain, scenario, or angle on the same subtopic).

Hard rules (SO-D5):
- Write all math in plain ASCII: x^2, sqrt(x), cbrt(x), 1/x, ->, infinity.
  NEVER use LaTeX commands or unicode math symbols.
- Every question must be self-contained, well-posed, and answerable in a few
  sentences without external material.

Return ONLY a JSON array (no markdown, no preamble) with this structure:
[
  {{"question": "...", "framing": "..."}}
]
"""

    messages = [
        {"role": "system", "content": "You are a precise examiner. Always respond with valid JSON only."},
        {"role": "user",   "content": prompt},
    ]

    # One corrective retry on garbled output (SO-D5) before giving up.
    questions: list = []
    for attempt in range(2):
        try:
            raw = await _ollama_chat(messages, model)
        except httpx.HTTPError as e:
            raise HTTPException(503, f"Ollama unavailable: {e}. Ensure `ollama serve` is running.")
        questions = _parse_json_array(raw)
        if _valid_questions(questions):
            break
        messages = messages[:2] + [
            {"role": "assistant", "content": raw},
            {"role": "user", "content":
             f"Invalid: I need exactly {settings.ASSESS_QUESTIONS} well-posed questions, "
             "each at least one full sentence, ASCII math only, as a bare JSON array. Regenerate."},
        ]
    else:
        raise HTTPException(502, "Ollama returned no usable questions — try again or switch model.")

    assessment_id = str(uuid.uuid4())
    await db.execute(
        """INSERT INTO assessments
           (id, user_id, item_id, kind, status, questions, mastery_before, model)
           VALUES (?, 'default', ?, 'single', 'active', ?, ?, ?)""",
        (assessment_id, body.item_id, json.dumps(questions), current_mastery, model)
    )
    await db.commit()

    return {
        "assessment_id":  assessment_id,
        "item_id":        body.item_id,
        "questions":      questions,
        "mastery_before": current_mastery,
        "cap":            cap,
    }


# ── /submit ───────────────────────────────────────────────────────────────────
@router.post("/submit")
async def submit_assessment(body: SubmitIn):
    """Grade the assessment's answers via one Ollama rubric call and settle mastery."""
    db = await get_db()

    async with db.execute(
        "SELECT * FROM assessments WHERE id = ?", (body.assessment_id,)
    ) as cur:
        row = await cur.fetchone()
    if row is None:
        raise HTTPException(404, f"Unknown assessment_id {body.assessment_id}")
    if row["status"] != "active":
        raise HTTPException(409, f"assessment already {row['status']}")

    questions = json.loads(row["questions"])
    if len(body.answers) != len(questions):
        raise HTTPException(
            422, f"expected {len(questions)} answers, got {len(body.answers)}")

    pairs = "\n\n".join(
        f'Q{i+1} (framing: {q.get("framing", "")}): {q["question"]}\nA{i+1}: {a}'
        for i, (q, a) in enumerate(zip(questions, body.answers))
    )
    prompt = f"""Grade a learner's answers to a mastery assessment. For each question, judge
whether the answer shows real transfer understanding and edge-case awareness for its
framing — not just recall.

Anchored rubric (SO-D5) — score each answer 0-100 on CONTENT, never on style or length:
- 90-100: correct AND addresses edge cases / limits of the idea.
- 70-89: substantially correct, minor gaps or imprecision.
- 40-69: partially correct, a real misconception or a major gap.
- 0-39: wrong or empty.
If a question itself is malformed or unanswerable as written, grade the answer's
reasoning charitably — a reasonable attempt at a flawed question scores at least 60.

{pairs}

Return ONLY a JSON array (no markdown, no preamble), one entry per question in order:
[
  {{"score": 0, "feedback": "..."}}
]
"""
    messages = [
        {"role": "system", "content": "You are a precise examiner. Grade rigorously and respond with valid JSON only."},
        {"role": "user",   "content": prompt},
    ]

    try:
        raw = await _ollama_chat(messages, row["model"])
    except httpx.HTTPError as e:
        raise HTTPException(503, f"Ollama unavailable: {e}. Ensure `ollama serve` is running.")

    verdicts = _parse_json_array(raw)
    if len(verdicts) != len(questions):
        raise HTTPException(502, "Ollama returned a mismatched verdict count — try again or switch model.")

    # Clamp stray model scores into 0-100 (SO-D5)
    for v in verdicts:
        try:
            v["score"] = max(0, min(100, round(float(v.get("score", 0)))))
        except (TypeError, ValueError):
            v["score"] = 0

    score = round(sum(v["score"] for v in verdicts) / len(verdicts))
    passed = score >= settings.ASSESS_PASS_SCORE
    status = "passed" if passed else "failed"

    async with db.execute(
        "SELECT mastery FROM user_item_mastery WHERE user_id = ? AND item_id = ?",
        (row["user_id"], row["item_id"])
    ) as cur:
        m_row = await cur.fetchone()
    current_mastery = m_row["mastery"] if m_row else 0

    if passed:
        cap = settings.MASTERY_SR_CAP
        new_mastery = max(current_mastery, min(100, cap + round(score / 5)))
        await db.execute(
            """INSERT INTO user_item_mastery (user_id, item_id, mastery)
               VALUES (?, ?, ?)
               ON CONFLICT(user_id, item_id) DO UPDATE SET mastery = ?""",
            (row["user_id"], row["item_id"], new_mastery, new_mastery)
        )
        mastery_after = new_mastery
    else:
        mastery_after = current_mastery

    await db.execute(
        """UPDATE assessments
           SET status = ?, answers = ?, verdicts = ?, score = ?,
               mastery_after = ?, completed_at = datetime('now')
           WHERE id = ?""",
        (status, json.dumps(body.answers), json.dumps(verdicts), score,
         mastery_after, row["id"])
    )
    await db.commit()

    # Node info via the same v_node_mastery lookup pattern as sr/router.py
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

    return {
        "status":         status,
        "score":          score,
        "verdicts":       verdicts,
        "mastery_before": row["mastery_before"],
        "mastery_after":  mastery_after,
        "node_id":        node_id,
        "node_level":     node_level,
    }


# ── /active ───────────────────────────────────────────────────────────────────
@router.get("/active")
async def get_active(item_id: Optional[int] = None):
    """Active assessment(s), for UI resume. Omit item_id to list all active."""
    db = await get_db()
    if item_id is not None:
        async with db.execute(
            """SELECT * FROM assessments
               WHERE user_id = 'default' AND item_id = ? AND status = 'active'""",
            (item_id,)
        ) as cur:
            rows = await cur.fetchall()
    else:
        async with db.execute(
            "SELECT * FROM assessments WHERE user_id = 'default' AND status = 'active'"
        ) as cur:
            rows = await cur.fetchall()

    return [
        {
            "assessment_id":  r["id"],
            "item_id":        r["item_id"],
            "questions":      json.loads(r["questions"]),
            "mastery_before": r["mastery_before"],
            "cap":            settings.MASTERY_SR_CAP,
        }
        for r in rows
    ]


# ── /history ──────────────────────────────────────────────────────────────────
@router.get("/history")
async def get_history(item_id: int):
    """Completed assessments (passed/failed) for an item, newest first."""
    db = await get_db()
    async with db.execute(
        """SELECT id, status, score, created_at, completed_at FROM assessments
           WHERE user_id = 'default' AND item_id = ? AND status != 'active'
           ORDER BY created_at DESC""",
        (item_id,)
    ) as cur:
        rows = await cur.fetchall()

    return [dict(r) for r in rows]
