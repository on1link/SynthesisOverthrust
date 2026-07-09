# ============================================================
# SynthesisOverthrust — tests/test_scout.py
# Skill Scout: source parsers (fixture payloads), classification
# bands, proposal persistence, correction write-back to BOTH
# LanceDB and SQLite, few-shot accumulation. Offline: fake
# transport + fake embedder.
# Run: uv run pytest tests/ -v
# ============================================================

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import hashlib
import json
from pathlib import Path

import aiosqlite
import pytest
from fastapi import HTTPException

import db as db_module
from catalog import store
from catalog.parser import parse_catalog, to_records
from scout import agent as scout_agent
from scout import router as scout_router
from scout.sources import Candidate, parse_arxiv, parse_hf, fetch_candidates

MIGRATIONS = Path(__file__).resolve().parents[2] / "migrations"

CATALOG_FIXTURE = """\
## Machine Learning Engineer (MLE)
### Tier 2.5
#### SKILL: Generative AI & Large Language Models
`Tier: 2.5T` | `Roles: MLE, AIE`

###### Topic: RAG & Vector Systems
- Chunking strategies
- Vector databases and ANN indexing

###### Topic: Agents
- Agent fundamentals (ReAct, tool use, planning)

### Tier F
#### SKILL: SQL
`Tier: F` | `Roles: MLE, DE`

###### Topic: Window Functions
- PARTITION BY semantics
"""

ARXIV_FIXTURE = """<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <id>http://arxiv.org/abs/2607.01234v1</id>
    <title>HyperRAG: Adaptive  Retrieval\n for Long Contexts</title>
    <summary>We propose a retrieval augmentation method with vector databases.</summary>
  </entry>
  <entry>
    <id>http://arxiv.org/abs/2607.09999v2</id>
    <title>Quantum Basket Weaving</title>
    <summary>A treatise on artisanal crafts.</summary>
  </entry>
</feed>
"""

HF_FIXTURE = json.dumps([
    {"id": "acme/agent-planner-7b", "pipeline_tag": "text-generation",
     "tags": ["agents", "planning", "transformers"]},
    {"modelId": "acme/no-id-fallback", "tags": []},
    {"tags": ["orphan"]},
])


def fake_embedder(texts):
    """Hash-based vectors; identical text → identical vector."""
    out = []
    for t in texts:
        h = hashlib.sha256(t.encode()).digest()
        out.append([b / 255.0 for b in h[:8]])
    return out


@pytest.fixture
async def env(tmp_path, monkeypatch):
    """SQLite (001+005+006+007) + LanceDB seeded from the fixture catalog."""
    conn = await aiosqlite.connect(":memory:")
    conn.row_factory = aiosqlite.Row
    for fname in ("001_initial.sql", "005_spaced_repetition.sql",
                  "006_fsrs.sql", "007_scout.sql"):
        await conn.executescript((MIGRATIONS / fname).read_text())
    await conn.commit()
    monkeypatch.setattr(db_module, "_db", conn)

    lance = str(tmp_path / "lancedb")
    store.ingest(to_records(parse_catalog(CATALOG_FIXTURE)),
                 embedder=fake_embedder, db_path=lance)

    # route all default store access to the tmp DB + fake embedder
    from config import settings
    monkeypatch.setattr(settings, "LANCE_DIR", lance)
    monkeypatch.setattr(store, "default_embedder", fake_embedder)

    yield conn, lance
    await conn.close()


# ── Source parsers ────────────────────────────────────────────────────────────

def test_parse_arxiv_fixture():
    cands = parse_arxiv(ARXIV_FIXTURE)
    assert len(cands) == 2
    assert cands[0].external_id == "2607.01234v1"
    assert cands[0].title == "HyperRAG: Adaptive Retrieval for Long Contexts"
    assert cands[0].url.startswith("http://arxiv.org/abs/")


def test_parse_hf_fixture():
    cands = parse_hf(HF_FIXTURE)
    assert [c.external_id for c in cands] == ["acme/agent-planner-7b", "acme/no-id-fallback"]
    assert "text-generation" in cands[0].summary


async def test_fetch_candidates_uses_injected_transport():
    async def fake_fetch(url):
        return ARXIV_FIXTURE if "arxiv" in url else HF_FIXTURE
    cands = await fetch_candidates(fetch_fn=fake_fetch)
    assert {c.source for c in cands} == {"arxiv", "huggingface"}
    assert len(cands) == 4


# ── Classification bands ──────────────────────────────────────────────────────

def _exact_text_candidate():
    # embed_text identical to a catalog record's embed_text → score 1.0
    return Candidate(source="arxiv", external_id="dup1",
                     title="Generative AI & Large Language Models > RAG & Vector Systems > Chunking strategies",
                     summary="", url="")


def test_classify_covered_band(env):
    prop = scout_agent.classify(_exact_text_candidate(), embedder=fake_embedder)
    assert prop.skip_reason == "covered"
    assert prop.similarity >= scout_agent.COVERED_SIM


def test_classify_proposes_with_neighbors(env, monkeypatch):
    # Force mid-band: score below covered threshold, above floor
    monkeypatch.setattr(scout_agent, "COVERED_SIM", 1.01)
    monkeypatch.setattr(scout_agent, "MIN_SIM", 0.0)
    prop = scout_agent.classify(_exact_text_candidate(), embedder=fake_embedder)
    assert prop.skip_reason is None
    assert prop.skill_slug == "generative_ai_large_language_models"
    assert prop.topic == "RAG & Vector Systems"
    assert prop.tier == "2.5"
    assert "AIE" in prop.roles and "MLE" in prop.roles
    assert len(prop.neighbors) >= 1


async def test_run_scout_persists_and_dedupes(env, monkeypatch):
    conn, _ = env
    monkeypatch.setattr(scout_agent, "COVERED_SIM", 1.01)
    monkeypatch.setattr(scout_agent, "MIN_SIM", 0.0)
    cands = [_exact_text_candidate()]

    r1 = await scout_agent.run_scout(conn, cands, embedder=fake_embedder)
    assert r1["proposed"] == 1
    r2 = await scout_agent.run_scout(conn, cands, embedder=fake_embedder)
    assert r2["proposed"] == 0 and r2["duplicates"] == 1   # never re-ask


# ── Decide: correction write-back ─────────────────────────────────────────────

async def _seed_proposal(conn) -> str:
    pid = "prop-1"
    await conn.execute(
        """INSERT INTO scout_proposals
           (id, source, external_id, title, summary, url,
            proposed_skill, proposed_skill_slug, proposed_topic,
            proposed_tier, proposed_roles, similarity, neighbors)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (pid, "arxiv", "2607.01234v1", "HyperRAG: Adaptive Retrieval",
         "retrieval augmentation", "http://arxiv.org/abs/2607.01234v1",
         "Generative AI & Large Language Models",
         "generative_ai_large_language_models",
         "RAG & Vector Systems", "2.5", "AIE,MLE", 0.6, "[]"))
    await conn.commit()
    return pid


async def test_approve_writes_back_to_both_stores(env):
    conn, lance = env
    pid = await _seed_proposal(conn)

    out = await scout_router.decide(scout_router.DecideIn(proposal_id=pid, action="approve"))
    assert out["status"] == "approved"

    # SQLite: skill/topic/item created
    async with conn.execute(
        "SELECT ti.id, ti.content, t.header, t.skill_id FROM topic_items ti "
        "JOIN topics t ON t.id = ti.topic_id WHERE ti.content LIKE 'HyperRAG%'"
    ) as cur:
        item = await cur.fetchone()
    assert item and item["header"] == "RAG & Vector Systems"
    assert item["skill_id"] == "generative_ai_large_language_models"
    assert out["placement"]["sqlite_item_id"] == item["id"]

    # LanceDB: new subtopic retrievable at distance 0 via its embed_text
    hits = store.search(
        "Generative AI & Large Language Models > RAG & Vector Systems > HyperRAG: Adaptive Retrieval",
        k=1, embedder=fake_embedder, db_path=lance)
    assert hits and hits[0]["subtopic"] == "HyperRAG: Adaptive Retrieval"

    # Second decide → 409
    with pytest.raises(HTTPException) as e:
        await scout_router.decide(scout_router.DecideIn(proposal_id=pid, action="approve"))
    assert e.value.status_code == 409


async def test_edit_overrides_placement(env):
    conn, _ = env
    pid = await _seed_proposal(conn)
    out = await scout_router.decide(scout_router.DecideIn(
        proposal_id=pid, action="edit",
        skill="SQL", topic="Window Functions", tier="F", roles=["DE"]))
    assert out["status"] == "edited"
    assert out["placement"]["skill"] == "SQL" and out["placement"]["roles"] == ["DE"]

    async with conn.execute(
        "SELECT t.skill_id FROM topic_items ti JOIN topics t ON t.id=ti.topic_id "
        "WHERE ti.content LIKE 'HyperRAG%'"
    ) as cur:
        row = await cur.fetchone()
    assert row["skill_id"] == "sql"


async def test_reject_records_only(env):
    conn, lance = env
    pid = await _seed_proposal(conn)
    out = await scout_router.decide(scout_router.DecideIn(proposal_id=pid, action="reject"))
    assert out["status"] == "rejected"
    async with conn.execute("SELECT COUNT(*) AS n FROM topic_items WHERE content LIKE 'HyperRAG%'") as cur:
        assert (await cur.fetchone())["n"] == 0


async def test_decide_validation(env):
    with pytest.raises(HTTPException) as e:
        await scout_router.decide(scout_router.DecideIn(proposal_id="nope", action="approve"))
    assert e.value.status_code == 404
    with pytest.raises(HTTPException) as e:
        await scout_router.decide(scout_router.DecideIn(proposal_id="x", action="explode"))
    assert e.value.status_code == 422


# ── Few-shot pool ─────────────────────────────────────────────────────────────

async def test_fewshot_accumulates(env):
    conn, _ = env
    pid = await _seed_proposal(conn)
    await scout_router.decide(scout_router.DecideIn(proposal_id=pid, action="approve"))
    shots = await scout_router.fewshot()
    assert len(shots) == 1
    assert shots[0]["decision"] == "approved"
    assert shots[0]["final"]["topic"] == "RAG & Vector Systems"
