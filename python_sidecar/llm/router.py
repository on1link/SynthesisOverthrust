# ============================================================
# SynthesisOverthrust — llm/router.py
# Ollama LLM endpoints:
#   - /chat           → conversational Q&A with context injection
#   - /practice       → generate practice problems for a skill
#   - /explain        → explain a concept at target level
#   - /paper-digest   → summarise arXiv / uploaded paper
#   - /models         → list available Ollama models
# ============================================================

from __future__ import annotations
import json
import re
import uuid
from typing import List, Literal, Optional, AsyncGenerator

import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from config import settings
from db import get_db

# NOTE: vault RAG (search.indexer) deliberately NOT imported — it pulls the
# optional faiss dep and would kill sidecar boot. Lands with B10 (D11).

router = APIRouter()

OLLAMA_BASE = settings.OLLAMA_URL


# ── Schemas ───────────────────────────────────────────────────────────────────
class ChatMessage(BaseModel):
    role:    str      # "user" | "assistant" | "system"
    content: str


class ChatIn(BaseModel):
    messages:     List[ChatMessage]
    session_id:   Optional[str] = None
    model:        Optional[str] = None
    context_type: str = "general"     # "general" | "skill" | "vault"
    skill_id:     Optional[str] = None
    stream:       bool = False


class PracticeIn(BaseModel):
    subtopic_id: str            # topic_items.id (TEXT in practice_problems)
    path_id:     str            # drill-bank scope key (list_practice_problems filter)
    difficulty:  Literal["easy", "medium", "hard"] = "medium"
    count:       int = Field(default=3, ge=1, le=10)
    model:       Optional[str] = None


class ExplainIn(BaseModel):
    concept:        str
    target_level:   str = "intermediate"   # beginner | intermediate | expert
    analogy_domain: Optional[str] = None   # e.g. "cooking", "gaming"
    model:          Optional[str] = None


class DigestIn(BaseModel):
    text:   str        # paper content (pre-extracted)
    title:  Optional[str] = None
    model:  Optional[str] = None


# ── Ollama helpers ────────────────────────────────────────────────────────────
async def _ollama_chat(
    messages: list[dict],
    model:    str,
    stream:   bool = False,
) -> str | AsyncGenerator[str, None]:
    """Call Ollama /api/chat. Returns full text or async generator for streaming."""
    payload = {
        "model":    model,
        "messages": messages,
        "stream":   stream,
        "options": {
            "temperature":  0.7,
            "num_predict":  1024,
            "num_ctx":      4096,
        },
    }
    async with httpx.AsyncClient(timeout=120) as client:
        if stream:
            async def _gen():
                async with client.stream("POST", f"{OLLAMA_BASE}/api/chat", json=payload) as resp:
                    async for line in resp.aiter_lines():
                        if line:
                            import json
                            data = json.loads(line)
                            if token := data.get("message", {}).get("content", ""):
                                yield token
            return _gen()

        resp = await client.post(f"{OLLAMA_BASE}/api/chat", json=payload)
        resp.raise_for_status()
        return resp.json()["message"]["content"]


def _resolve_model(requested: Optional[str]) -> str:
    return requested or settings.OLLAMA_MODEL


# ── /models ───────────────────────────────────────────────────────────────────
@router.get("/models")
async def list_models():
    """List models available in the local Ollama instance."""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(f"{OLLAMA_BASE}/api/tags")
            r.raise_for_status()
            data = r.json()
            return {"models": [m["name"] for m in data.get("models", [])]}
    except Exception as e:
        return {"models": [], "error": str(e), "hint": "Is Ollama running? `ollama serve`"}


# ── /chat ─────────────────────────────────────────────────────────────────────
@router.post("/chat")
async def chat(body: ChatIn):
    """
    Conversational endpoint with optional vault context injection.
    If context_type='vault', retrieves relevant notes and prepends them.
    """
    model      = _resolve_model(body.model)
    session_id = body.session_id or str(uuid.uuid4())
    db         = await get_db()

    if body.context_type == "vault":
        raise HTTPException(501, "Vault context lands with the vault search slice (B10).")

    # ── Build system prompt ───────────────────────────────────────────────
    system = _system_prompt(body.context_type, body.skill_id)

    # ── Load conversation history from DB ─────────────────────────────────
    async with db.execute(
        """SELECT role, content FROM llm_conversations
           WHERE session_id=? ORDER BY created_at ASC LIMIT 20""",
        (session_id,)
    ) as cur:
        history = [{"role": r["role"], "content": r["content"]} for r in await cur.fetchall()]

    messages = [{"role": "system", "content": system}]
    messages += history
    messages += [{"role": m.role, "content": m.content} for m in body.messages]

    if body.stream:
        gen = await _ollama_chat(messages, model, stream=True)
        return StreamingResponse(gen, media_type="text/event-stream")

    try:
        reply = await _ollama_chat(messages, model, stream=False)
    except httpx.HTTPError as e:
        raise HTTPException(503, f"Ollama unavailable: {e}. Ensure `ollama serve` is running.")

    # ── Persist to DB ─────────────────────────────────────────────────────
    for msg in body.messages:
        await db.execute(
            """INSERT INTO llm_conversations
               (id,user_id,role,content,model,context_type,session_id)
               VALUES (?,?,?,?,?,?,?)""",
            (str(uuid.uuid4()), "default", msg.role, msg.content,
             model, body.context_type, session_id)
        )
    await db.execute(
        """INSERT INTO llm_conversations
           (id,user_id,role,content,model,context_type,session_id)
           VALUES (?,?,?,?,?,?,?)""",
        (str(uuid.uuid4()), "default", "assistant", reply,
         model, body.context_type, session_id)
    )
    await db.commit()

    return {"reply": reply, "session_id": session_id, "model": model}


# ── /practice ─────────────────────────────────────────────────────────────────
@router.post("/practice")
async def generate_practice(body: PracticeIn):
    """
    Generate N practice problems for a subtopic and store them in the
    shared drill bank (`practice_problems`, migration 009) so the existing
    practice flow (`list_practice_problems`) can serve them (D13).
    """
    model = _resolve_model(body.model)
    db    = await get_db()

    # Subtopic context for the prompt — item → topic → skill
    async with db.execute(
        """SELECT ti.content AS subtopic, t.header AS topic, s.name AS skill
           FROM topic_items ti
           JOIN topics t ON ti.topic_id = t.id
           JOIN skills s ON t.skill_id  = s.id
           WHERE ti.id = ?""",
        (body.subtopic_id,)
    ) as cur:
        ctx = await cur.fetchone()
    if ctx is None:
        raise HTTPException(404, f"Unknown subtopic_id {body.subtopic_id}")

    diff_desc = {
        "easy":   "conceptual or recall-based",
        "medium": "application or implementation",
        "hard":   "synthesis, edge-case, or system design",
    }[body.difficulty]

    prompt = f"""You are an expert ML engineering tutor.
Generate exactly {body.count} practice problems for this subtopic:
- Skill: {ctx['skill']}
- Topic: {ctx['topic']}
- Subtopic: {ctx['subtopic']}
- Difficulty: {body.difficulty} ({diff_desc})

Return ONLY a JSON array (no markdown, no preamble) with this structure:
[
  {{
    "problem_text": "...",
    "hints": ["hint 1", "hint 2"],
    "explanation": "full solution / why"
  }}
]
"""

    messages = [
        {"role": "system", "content": "You are a precise ML tutor. Always respond with valid JSON only."},
        {"role": "user",   "content": prompt},
    ]

    try:
        raw = await _ollama_chat(messages, model)
    except httpx.HTTPError as e:
        raise HTTPException(503, f"Ollama unavailable: {e}. Ensure `ollama serve` is running.")

    problems = _parse_json_array(raw)
    if not problems:
        raise HTTPException(502, "Ollama returned no parseable problems — try again or switch model.")

    stored = []
    for p in problems:
        text = str(p.get("problem_text", "")).strip()
        if not text:
            continue
        row = {
            "id":           str(uuid.uuid4()),
            "difficulty":   body.difficulty,
            "problem_text": text,
            "hints":        json.dumps([str(h) for h in p.get("hints", [])]),
            "explanation":  str(p.get("explanation", "")) or None,
        }
        await db.execute(
            """INSERT INTO practice_problems
               (id, subtopic_id, path_id, difficulty, problem_text, hints, explanation)
               VALUES (?,?,?,?,?,?,?)""",
            (row["id"], body.subtopic_id, body.path_id, row["difficulty"],
             row["problem_text"], row["hints"], row["explanation"])
        )
        stored.append(row)
    await db.commit()

    return {"problems": stored, "count": len(stored), "model": model}


def _try_json(text: str):
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return None


def _parse_json_array(raw: str) -> list[dict]:
    """
    Parse an LLM response into a JSON array. Tolerates markdown fences,
    raw LaTeX backslashes (`x \\geq 0` → invalid JSON escape — observed
    from llama3.2:3b in live QA), and a {"problems": [...]} dict wrapper.
    """
    clean = re.sub(r"```json?|```", "", raw).strip()
    # Repair mode: if strict parse fails the model wasn't escaping — treat
    # every backslash as literal except string-structural \" and \\
    # (so \frac survives instead of becoming a form feed). Pairs must be
    # consumed as units or the second backslash of a LaTeX \\ gets doubled.
    repaired = re.sub(r'(\\\\|\\")|\\', lambda m: m.group(1) or "\\\\", clean)
    for candidate in (clean, repaired):
        parsed = _try_json(candidate)
        if parsed is None:
            match  = re.search(r"\[.*\]", candidate, re.DOTALL)
            parsed = _try_json(match.group()) if match else None
        if isinstance(parsed, list):
            return parsed
        if isinstance(parsed, dict):
            for v in parsed.values():
                if isinstance(v, list) and v and isinstance(v[0], dict):
                    return v
    return []


# ── /explain ──────────────────────────────────────────────────────────────────
@router.post("/explain")
async def explain_concept(body: ExplainIn):
    """Explain a concept at a specific depth level, optionally with analogy."""
    model = _resolve_model(body.model)
    analogy_hint = f" Use a {body.analogy_domain} analogy." if body.analogy_domain else ""
    level_map = {
        "beginner":     "Use simple language, no assumed math background.",
        "intermediate": "Assume basic Python and linear algebra knowledge.",
        "expert":       "Use precise technical terminology and mathematical notation.",
    }
    prompt = f"""Explain the concept of **{body.concept}** for a {body.target_level} level ML learner.
{level_map.get(body.target_level, "")}
{analogy_hint}
Structure your answer:
1. Core idea (2-3 sentences)
2. Why it matters in ML/DS
3. A concrete example or code snippet
4. Common misconceptions or gotchas
"""
    messages = [
        {"role": "system", "content": "You are a world-class ML educator. Be precise and clear."},
        {"role": "user",   "content": prompt},
    ]
    try:
        reply = await _ollama_chat(messages, model)
    except httpx.HTTPError as e:
        raise HTTPException(503, f"Ollama unavailable: {e}")

    return {"explanation": reply, "concept": body.concept, "level": body.target_level, "model": model}


# ── /paper-digest ─────────────────────────────────────────────────────────────
@router.post("/paper-digest")
async def digest_paper(body: DigestIn):
    """
    Summarise a research paper into structured notes.
    Input: pre-extracted text (use /ingest/pdf to extract first).
    """
    model = _resolve_model(body.model)
    title_hint = f'Title: "{body.title}"' if body.title else ""
    # Truncate to ~6000 words to fit context window
    text_truncated = " ".join(body.text.split()[:6000])

    prompt = f"""Analyse this ML research paper and produce structured notes.
{title_hint}

PAPER TEXT:
{text_truncated}

Produce a JSON response with:
{{
  "title": "...",
  "one_liner": "One sentence summary",
  "problem": "What problem does it solve?",
  "method": "Key technical approach",
  "results": "Main results / benchmarks",
  "contributions": ["contribution 1", "contribution 2", ...],
  "limitations": "Known limitations",
  "relevance": "Why this matters for ML practitioners",
  "key_concepts": ["concept1", "concept2", ...],
  "obsidian_tags": ["#paper", "#attention", ...]
}}
Respond with valid JSON only. No preamble."""

    messages = [
        {"role": "system", "content": "You are an ML research analyst. Always respond with valid JSON."},
        {"role": "user",   "content": prompt},
    ]
    try:
        raw = await _ollama_chat(messages, model)
    except httpx.HTTPError as e:
        raise HTTPException(503, f"Ollama unavailable: {e}")

    clean = re.sub(r"```json?|```", "", raw).strip()
    try:
        parsed = json.loads(clean)
    except json.JSONDecodeError:
        parsed = {"raw": raw, "parse_error": True}

    return {"digest": parsed, "model": model}


# ── System prompts ────────────────────────────────────────────────────────────
def _system_prompt(context_type: str, skill_id: Optional[str]) -> str:
    base = """You are SynthesisOverthrust's AI tutor — an expert in machine learning engineering,
data engineering, and data science. You are precise, encouraging, and pedagogically sound.
You follow Barbara Oakley's learning principles: chunking, spaced repetition, interleaving,
and recall over re-reading. Keep responses concise and actionable."""

    if context_type == "skill" and skill_id:
        return base + f"\n\nCurrent focus skill: {skill_id}. Tailor your answers to help the learner master this skill."
    if context_type == "vault":
        return base + "\n\nYou have access to the learner's Obsidian vault notes (provided below). Use them to give personalised, context-aware answers."
    return base
