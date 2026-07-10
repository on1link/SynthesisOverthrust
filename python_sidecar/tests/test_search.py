# ============================================================
# SynthesisOverthrust — tests/test_search.py
# Vault semantic search (B10): LanceDB vault_chunks store +
# /search router. Offline: fake embedder, tmp vault + LanceDB.
# Run: uv run pytest tests/ -v
# ============================================================

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import hashlib
from pathlib import Path

import aiosqlite
import pytest
from fastapi import HTTPException

import db as db_module
from search import router as search_router
from search import store as vault_store

MIGRATIONS = Path(__file__).resolve().parents[2] / "migrations"


def fake_embedder(texts):
    out = []
    for t in texts:
        h = hashlib.sha256(t.encode()).digest()
        out.append([b / 255.0 for b in h[:8]])
    return out


@pytest.fixture
def vault(tmp_path):
    """Tmp Obsidian-ish vault: frontmatter tags, inline tags, nested dirs."""
    v = tmp_path / "vault"
    (v / "ml").mkdir(parents=True)
    (v / "attention.md").write_text(
        "---\ntags: [transformers, attention]\n---\n"
        "# Attention Notes\n\nSelf-attention weighs token pairs. #deeplearning\n"
    )
    (v / "ml" / "sql-windows.md").write_text(
        "# Window Functions\n\nPARTITION BY splits rows into frames for ranking.\n"
    )
    (v / "empty.md").write_text("")
    return v


@pytest.fixture
async def env(tmp_path, vault, monkeypatch):
    """In-memory SQLite (config table) + tmp LanceDB routed as default."""
    conn = await aiosqlite.connect(":memory:")
    conn.row_factory = aiosqlite.Row
    await conn.executescript((MIGRATIONS / "001_initial.sql").read_text())
    await conn.execute(
        "INSERT INTO config (key, value) VALUES ('vault_path', ?)", (str(vault),))
    await conn.commit()
    monkeypatch.setattr(db_module, "_db", conn)

    from config import settings
    lance = str(tmp_path / "lance")
    monkeypatch.setattr(settings, "LANCE_DIR", lance)
    # patch the name as bound in search.store (from-import), not catalog.store
    monkeypatch.setattr(vault_store, "default_embedder", fake_embedder)

    yield conn, lance
    await conn.close()


# Exact embed text of the sql-windows chunk (title + chunked body) — the
# hash-based fake embedder only ranks identical text deterministically.
SQL_EMBED_TEXT = "Window Functions\n# Window Functions PARTITION BY splits rows into frames for ranking."


# ── store ─────────────────────────────────────────────────────────────────────

def test_reindex_counts_and_metadata(vault, tmp_path):
    out = vault_store.reindex(vault, embedder=fake_embedder, db_path=str(tmp_path / "l1"))
    assert out == {"indexed_chunks": 2, "unique_notes": 2}   # empty.md skipped

    hits = vault_store.search_chunks(SQL_EMBED_TEXT,
                                     embedder=fake_embedder, db_path=str(tmp_path / "l1"))
    assert hits[0]["title"] == "Window Functions"
    assert hits[0]["path"].endswith("sql-windows.md")

    att = next(h for h in hits if h["title"] == "Attention Notes")
    assert set(att["tags"]) == {"transformers", "attention", "deeplearning"}


def test_search_before_index_raises(tmp_path):
    with pytest.raises(FileNotFoundError):
        vault_store.search_chunks("x", embedder=fake_embedder, db_path=str(tmp_path / "nope"))


def test_reindex_empty_vault_raises(tmp_path):
    empty = tmp_path / "emptyvault"
    empty.mkdir()
    with pytest.raises(ValueError):
        vault_store.reindex(empty, embedder=fake_embedder, db_path=str(tmp_path / "l2"))


def test_chunking_overlap():
    words = " ".join(f"w{i}" for i in range(1000))
    chunks = vault_store.chunk_text(words, max_words=400, overlap=80)
    assert len(chunks) > 1
    assert chunks[0].split()[-80:] == chunks[1].split()[:80]


# ── router ────────────────────────────────────────────────────────────────────

async def test_router_reindex_then_query(env):
    out = await search_router.reindex_vault()
    assert out["indexed_chunks"] == 2 and out["unique_notes"] == 2

    res = await search_router.search_vault(search_router.SearchQuery(query=SQL_EMBED_TEXT))
    assert res[0].title == "Window Functions"
    assert res[0].score > 0.99   # identical embed text → cosine ≈ 1


async def test_router_query_before_index_409(env):
    with pytest.raises(HTTPException) as e:
        await search_router.search_vault(search_router.SearchQuery(query="anything"))
    assert e.value.status_code == 409


async def test_router_empty_query_422(env):
    with pytest.raises(HTTPException) as e:
        await search_router.search_vault(search_router.SearchQuery(query="   "))
    assert e.value.status_code == 422


async def test_router_no_vault_path_409(env):
    conn, _ = env
    await conn.execute("DELETE FROM config WHERE key='vault_path'")
    await conn.commit()
    with pytest.raises(HTTPException) as e:
        await search_router.reindex_vault()
    assert e.value.status_code == 409


async def test_related_notes_by_skill(env):
    conn, _ = env
    await conn.executescript("""
        INSERT INTO skills (id, name, icon) VALUES ('skill_sql', 'SQL', 'db');
        INSERT INTO topics (skill_id, header) VALUES ('skill_sql', 'Window Functions');
    """)
    await search_router.reindex_vault()
    res = await search_router.find_related_notes("skill_sql")
    assert res and any(r.title == "Window Functions" for r in res)

    with pytest.raises(HTTPException) as e:
        await search_router.find_related_notes("skill_ghost")
    assert e.value.status_code == 404


async def test_stats(env):
    s0 = await search_router.index_stats()
    assert s0 == {"indexed": False, "indexed_chunks": 0, "unique_notes": 0}
    await search_router.reindex_vault()
    s1 = await search_router.index_stats()
    assert s1 == {"indexed": True, "indexed_chunks": 2, "unique_notes": 2}
