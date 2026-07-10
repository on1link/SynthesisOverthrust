# ============================================================
# SynthesisOverthrust — tests/test_llm.py
# LLM router (Ollama tutor): chat persistence + history, vault
# deferral (D11), practice generation into the shared drill
# bank (D13), explain. Offline: `_ollama_chat` monkeypatched —
# no network, no model downloads.
# Run: uv run pytest tests/ -v
# ============================================================

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import json
from pathlib import Path

import aiosqlite
import httpx
import pytest
from fastapi import HTTPException
from pydantic import ValidationError

import db as db_module
from llm import router as llm

MIGRATIONS = Path(__file__).resolve().parents[2] / "migrations"


@pytest.fixture
async def test_db(monkeypatch):
    conn = await aiosqlite.connect(":memory:")
    conn.row_factory = aiosqlite.Row
    await conn.execute("PRAGMA foreign_keys = ON")

    for fname in ("001_initial.sql", "002_phase2.sql", "009_learning_loop.sql"):
        await conn.executescript((MIGRATIONS / fname).read_text())

    # Minimal skill tree: 1 skill → 1 topic → 2 items
    await conn.executescript("""
        INSERT INTO users (id, name, username) VALUES ('default', 'Tester', 'Tester');
        INSERT INTO skills (id, name, icon) VALUES ('pytorch', 'PyTorch', 'fire');
        INSERT INTO topics (id, skill_id, header) VALUES (1, 'pytorch', 'Fundamentals');
        INSERT INTO topic_items (id, topic_id, content) VALUES
            (10, 1, 'Tensors and autograd'),
            (11, 1, 'DataLoaders and datasets');
    """)
    await conn.commit()

    monkeypatch.setattr(db_module, "_db", conn)
    yield conn
    await conn.close()


def _fake_ollama(reply: str, capture: list | None = None):
    """Fake for llm.router._ollama_chat — records messages, returns canned text."""
    async def fake(messages, model, stream=False):
        if capture is not None:
            capture.append(messages)
        return reply
    return fake


def _down_ollama():
    async def fake(messages, model, stream=False):
        raise httpx.ConnectError("connection refused")
    return fake


# ── /chat ─────────────────────────────────────────────────────────────────────

async def test_chat_persists_both_turns(test_db, monkeypatch):
    monkeypatch.setattr(llm, "_ollama_chat", _fake_ollama("Gradients flow backward."))
    out = await llm.chat(llm.ChatIn(
        messages=[llm.ChatMessage(role="user", content="What is backprop?")]
    ))
    assert out["reply"] == "Gradients flow backward."
    assert out["session_id"]
    assert out["model"]

    async with test_db.execute(
        "SELECT role, content FROM llm_conversations WHERE session_id=? ORDER BY created_at",
        (out["session_id"],)
    ) as cur:
        rows = await cur.fetchall()
    assert [(r["role"]) for r in rows] == ["user", "assistant"]
    assert rows[1]["content"] == "Gradients flow backward."


async def test_chat_injects_session_history(test_db, monkeypatch):
    monkeypatch.setattr(llm, "_ollama_chat", _fake_ollama("First answer."))
    first = await llm.chat(llm.ChatIn(
        messages=[llm.ChatMessage(role="user", content="Turn one")]
    ))

    capture: list = []
    monkeypatch.setattr(llm, "_ollama_chat", _fake_ollama("Second answer.", capture))
    await llm.chat(llm.ChatIn(
        messages=[llm.ChatMessage(role="user", content="Turn two")],
        session_id=first["session_id"],
    ))

    sent = capture[0]
    assert sent[0]["role"] == "system"
    contents = [m["content"] for m in sent]
    assert "Turn one" in contents and "First answer." in contents
    assert sent[-1]["content"] == "Turn two"


async def test_chat_skill_context_shapes_system_prompt(test_db, monkeypatch):
    capture: list = []
    monkeypatch.setattr(llm, "_ollama_chat", _fake_ollama("ok", capture))
    await llm.chat(llm.ChatIn(
        messages=[llm.ChatMessage(role="user", content="hi")],
        context_type="skill", skill_id="pytorch",
    ))
    assert "pytorch" in capture[0][0]["content"]


async def test_chat_vault_context_501_until_b10(test_db):
    with pytest.raises(HTTPException) as e:
        await llm.chat(llm.ChatIn(
            messages=[llm.ChatMessage(role="user", content="notes?")],
            context_type="vault",
        ))
    assert e.value.status_code == 501


async def test_chat_ollama_down_503(test_db, monkeypatch):
    monkeypatch.setattr(llm, "_ollama_chat", _down_ollama())
    with pytest.raises(HTTPException) as e:
        await llm.chat(llm.ChatIn(
            messages=[llm.ChatMessage(role="user", content="hi")]
        ))
    assert e.value.status_code == 503
    # failed turn must not persist
    async with test_db.execute("SELECT COUNT(*) AS n FROM llm_conversations") as cur:
        assert (await cur.fetchone())["n"] == 0


# ── /practice ─────────────────────────────────────────────────────────────────

PROBLEMS_JSON = json.dumps([
    {"problem_text": "Implement autograd for y = x^2.",
     "hints": ["chain rule"], "explanation": "dy/dx = 2x."},
    {"problem_text": "Why detach() before numpy()?",
     "hints": ["graph tracking", "memory"], "explanation": "Tensors on the graph can't convert."},
])


async def test_practice_writes_shared_drill_bank(test_db, monkeypatch):
    monkeypatch.setattr(llm, "_ollama_chat", _fake_ollama(PROBLEMS_JSON))
    out = await llm.generate_practice(llm.PracticeIn(
        subtopic_id="10", path_id="mle", difficulty="hard", count=2
    ))
    assert out["count"] == 2

    # Same filter shape as Rust list_practice_problems (B4 drill flow)
    async with test_db.execute(
        """SELECT difficulty, problem_text, hints, explanation FROM practice_problems
           WHERE subtopic_id='10' AND path_id='mle' AND difficulty='hard'"""
    ) as cur:
        rows = await cur.fetchall()
    assert len(rows) == 2
    assert json.loads(rows[0]["hints"]) == ["chain rule"]
    assert rows[0]["explanation"] == "dy/dx = 2x."


async def test_practice_tolerates_markdown_fences(test_db, monkeypatch):
    fenced = f"```json\n{PROBLEMS_JSON}\n```"
    monkeypatch.setattr(llm, "_ollama_chat", _fake_ollama(fenced))
    out = await llm.generate_practice(llm.PracticeIn(subtopic_id="10", path_id="mle"))
    assert out["count"] == 2


async def test_practice_unknown_subtopic_404(test_db, monkeypatch):
    monkeypatch.setattr(llm, "_ollama_chat", _fake_ollama(PROBLEMS_JSON))
    with pytest.raises(HTTPException) as e:
        await llm.generate_practice(llm.PracticeIn(subtopic_id="999", path_id="mle"))
    assert e.value.status_code == 404


async def test_practice_unparseable_reply_502(test_db, monkeypatch):
    monkeypatch.setattr(llm, "_ollama_chat", _fake_ollama("I cannot answer in JSON, sorry."))
    with pytest.raises(HTTPException) as e:
        await llm.generate_practice(llm.PracticeIn(subtopic_id="10", path_id="mle"))
    assert e.value.status_code == 502
    async with test_db.execute("SELECT COUNT(*) AS n FROM practice_problems") as cur:
        # only the 009 demo seed rows, nothing from the failed call
        assert (await cur.fetchone())["n"] == 5


async def test_practice_rejects_bad_difficulty_and_count(test_db):
    with pytest.raises(ValidationError):
        llm.PracticeIn(subtopic_id="10", path_id="mle", difficulty="Brutal")
    with pytest.raises(ValidationError):
        llm.PracticeIn(subtopic_id="10", path_id="mle", count=0)
    with pytest.raises(ValidationError):
        llm.PracticeIn(subtopic_id="10", path_id="mle", count=11)


# ── /explain ──────────────────────────────────────────────────────────────────

async def test_explain_returns_reply(test_db, monkeypatch):
    capture: list = []
    monkeypatch.setattr(llm, "_ollama_chat", _fake_ollama("Attention weighs tokens.", capture))
    out = await llm.explain_concept(llm.ExplainIn(
        concept="attention", target_level="expert", analogy_domain="cooking"
    ))
    assert out["explanation"] == "Attention weighs tokens."
    assert out["concept"] == "attention"
    prompt = capture[0][1]["content"]
    assert "attention" in prompt and "cooking" in prompt


# ── /models ───────────────────────────────────────────────────────────────────

async def test_models_down_returns_hint_not_error(monkeypatch):
    monkeypatch.setattr(llm, "OLLAMA_BASE", "http://127.0.0.1:1")
    out = await llm.list_models()
    assert out["models"] == []
    assert "ollama serve" in out["hint"]
