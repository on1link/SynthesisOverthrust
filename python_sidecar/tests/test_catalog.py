# ============================================================
# SynthesisOverthrust — tests/test_catalog.py
# Parser unit tests (fixture + real catalog structure) and
# LanceDB store tests with a fake embedder (no model download).
# Run: uv run pytest tests/ -v
# ============================================================

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import hashlib
from pathlib import Path

import pytest

from catalog.parser import parse_catalog, to_records, parse_catalog_file
from catalog import store

REPO = Path(__file__).resolve().parents[2]
CATALOG = REPO / "Synthesis Overthrust Catalog.md"

FIXTURE = """\
# Synthesis Overthrust — Catalog

## Machine Learning Engineer (MLE)
### Tier F
#### SKILL: Python
`Tier: F` | `Roles: MLE, DS` | **Max Level: 10** | **Prerequisites: None**

###### Topic: Core Language
- Syntax & logic
- **Data Structures** (lists, dicts)

### Tier 1
### SKILL: Deep Learning
`Tier: 1T` | `Roles: MLE`

###### Topic: Training ← NEW topic
- Optimizers (SGD, Adam) ← NEW
- Optimizers (SGD, Adam)

## Artificial Intelligence Engineer (AIE)
### Tier F
#### SKILL: Python
`Tier: F` | `Roles: AIE`

###### Topic: Core Language
- Syntax & logic
- Generators

###### Topic: Concurrency
- AsyncIO

## OUTSIDE TREE — Career Track (milestone-tracked, not SR-assessed)
- Publish a paper
"""


def fake_embedder(texts):
    """Deterministic 8-dim vectors from text hashes."""
    out = []
    for t in texts:
        h = hashlib.sha256(t.encode()).digest()
        vec = [b / 255.0 for b in h[:8]]
        out.append(vec)
    return out


# ── Parser: fixture ───────────────────────────────────────────────────────────

def test_parser_dedupes_skills_across_roles():
    skills = parse_catalog(FIXTURE)
    assert set(skills) == {"python", "deep_learning"}
    py = skills["python"]
    assert py.roles == {"MLE", "DS", "AIE"}          # unioned
    assert py.tier == "F"
    assert py.max_level == 10
    assert py.prerequisites == ""                     # "None" → empty
    # topics merged: Core Language merged, Concurrency added from AIE
    assert set(py.topics) == {"Core Language", "Concurrency"}
    assert py.topics["Core Language"] == [
        "Syntax & logic", "Data Structures (lists, dicts)", "Generators"
    ]


def test_parser_strips_annotations_and_dedupes_bullets():
    skills = parse_catalog(FIXTURE)
    dl = skills["deep_learning"]
    assert dl.tier == "1"                             # heading context, normalized
    assert set(dl.topics) == {"Training"}             # "← NEW topic" stripped
    assert dl.topics["Training"] == ["Optimizers (SGD, Adam)"]  # deduped


def test_parser_skips_outside_tree():
    skills = parse_catalog(FIXTURE)
    for sk in skills.values():
        for subs in sk.topics.values():
            assert "Publish a paper" not in subs


def test_records_shape():
    recs = to_records(parse_catalog(FIXTURE))
    assert len(recs) == 5   # 3 Core Language + 1 Concurrency + 1 Training
    r = next(r for r in recs if r.subtopic == "AsyncIO")
    assert r.skill == "Python" and r.topic == "Concurrency"
    assert r.embed_text == "Python > Concurrency > AsyncIO"
    assert r.roles == ["AIE", "DS", "MLE"]


# ── Parser: real catalog ──────────────────────────────────────────────────────

@pytest.mark.skipif(not CATALOG.exists(), reason="catalog file not present")
def test_real_catalog_structure():
    recs = parse_catalog_file(CATALOG)
    skills = {r.skill_slug for r in recs}
    assert len(skills) >= 80
    assert len(recs) >= 2400
    tiers = {r.tier for r in recs}
    assert tiers <= {"F", "1", "2", "2.5", "3", "4"}
    # refinements present
    genai = [r for r in recs if r.skill_slug == "generative_ai_large_language_models"]
    assert any(r.topic == "LLM Observability & Ops" for r in genai)
    assert {"AIE", "MLE"} <= set(genai[0].roles)
    # no annotation leakage
    assert not any("← NEW" in r.subtopic or "← NEW" in r.topic for r in recs)


# ── Store: fake embedder + tmp LanceDB ────────────────────────────────────────

@pytest.fixture
def lance_dir(tmp_path):
    return str(tmp_path / "lancedb")


def test_ingest_and_search(lance_dir):
    recs = to_records(parse_catalog(FIXTURE))
    n = store.ingest(recs, embedder=fake_embedder, db_path=lance_dir)
    assert n == 5

    # fake embedder is hash-based: query with the exact embed_text → distance 0
    hits = store.search("Python > Concurrency > AsyncIO", k=3,
                        embedder=fake_embedder, db_path=lance_dir)
    assert hits and hits[0]["subtopic"] == "AsyncIO"
    assert hits[0]["roles"] == ["AIE", "DS", "MLE"]
    assert 0.0 <= hits[0]["score"] <= 1.0


def test_search_role_filter(lance_dir):
    recs = to_records(parse_catalog(FIXTURE))
    store.ingest(recs, embedder=fake_embedder, db_path=lance_dir)

    only_mle = store.search("Optimizers", k=5, role="MLE",
                            embedder=fake_embedder, db_path=lance_dir)
    assert only_mle and all("MLE" in h["roles"] for h in only_mle)

    # role code EL must not match MLE via substring
    el = store.search("Optimizers", k=5, role="EL",
                      embedder=fake_embedder, db_path=lance_dir)
    assert el == []


def test_search_tier_filter(lance_dir):
    recs = to_records(parse_catalog(FIXTURE))
    store.ingest(recs, embedder=fake_embedder, db_path=lance_dir)
    hits = store.search("anything", k=5, tier="1T",
                        embedder=fake_embedder, db_path=lance_dir)
    assert hits and all(h["tier"] == "1" for h in hits)


def test_search_before_ingest_raises(lance_dir):
    with pytest.raises(FileNotFoundError):
        store.search("x", embedder=fake_embedder, db_path=lance_dir)


def test_ingest_empty_raises(lance_dir):
    with pytest.raises(ValueError):
        store.ingest([], embedder=fake_embedder, db_path=lance_dir)


def test_stats(lance_dir):
    assert store.stats(db_path=lance_dir)["ingested"] is False
    recs = to_records(parse_catalog(FIXTURE))
    store.ingest(recs, embedder=fake_embedder, db_path=lance_dir)
    s = store.stats(db_path=lance_dir)
    assert s == {"ingested": True, "subtopics": 5, "skills": 2,
                 "by_tier": {"F": 4, "1": 1}}
