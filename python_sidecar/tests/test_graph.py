# ============================================================
# SynthesisOverthrust — tests/test_graph.py
# Knowledge graph (B11): wikilinks, skill prereq edges, SR
# co-review — on the real schema, skill nodes never path-scoped
# (D26/§9). Offline: tmp vault + in-memory SQLite.
# Run: uv run pytest tests/ -v
# ============================================================

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import re
from pathlib import Path

import aiosqlite
import pytest

import db as db_module
from graph import builder
from graph import router as graph_router

MIGRATIONS = Path(__file__).resolve().parents[2] / "migrations"


@pytest.fixture
async def env(tmp_path, monkeypatch):
    """Tmp vault (3 notes, one wikilink, one dead link) + seeded skill tree."""
    vault = tmp_path / "vault"
    vault.mkdir()
    (vault / "a.md").write_text("# A\n\nSee [[b]] for details.")
    (vault / "b.md").write_text("# B\n\nPlain note.")
    (vault / "c.md").write_text("# C\n\nBroken [[missing]] link.")

    conn = await aiosqlite.connect(":memory:")
    conn.row_factory = aiosqlite.Row
    for fname in ("001_initial.sql", "003_phase3.sql",
                  "005_spaced_repetition.sql", "006_fsrs.sql"):
        await conn.executescript((MIGRATIONS / fname).read_text())

    await conn.executescript(f"""
        INSERT INTO users (id, name, username) VALUES ('default', 'Tester', 'Tester');
        INSERT INTO vault_index (path, title, word_count) VALUES
            ('{vault / "a.md"}', 'A', 5),
            ('{vault / "b.md"}', 'B', 3),
            ('{vault / "c.md"}', 'C', 4);
        INSERT INTO roles (id, name, color, bg_color, bg_alpha, sort_order)
            VALUES ('mle', 'MLE', '#4A90E2', '#4A90E2', '0.15', 1);
        INSERT INTO skills (id, name, icon) VALUES
            ('python', 'Python', 'py'), ('dsa', 'DSA', 'tree');
        INSERT INTO skill_roles (skill_id, role_id) VALUES
            ('python', 'mle'), ('dsa', 'mle');
        INSERT INTO skill_prerequisites (skill_id, prerequisite_id)
            VALUES ('dsa', 'python');
        INSERT INTO topics (id, skill_id, header) VALUES
            (1, 'python', 'Basics'), (2, 'dsa', 'Trees');
        INSERT INTO topic_items (id, topic_id, content) VALUES
            (10, 1, 'Generators'), (20, 2, 'BST invariants');
        INSERT INTO sr_cards (id, item_id, front, due_date) VALUES
            ('card-py', 10, 'Generators?', '2026-07-10'),
            ('card-dsa', 20, 'BST?', '2026-07-10');
        INSERT INTO sr_reviews (card_id, user_id, quality, reviewed_at) VALUES
            ('card-py', 'default', 3, '2026-07-09 10:00:00'),
            ('card-dsa', 'default', 4, '2026-07-09 11:00:00');
    """)
    await conn.commit()
    monkeypatch.setattr(db_module, "_db", conn)
    monkeypatch.setattr(builder, "_graph", None)   # no cross-test cache

    yield conn, vault
    await conn.close()


# ── builder ───────────────────────────────────────────────────────────────────

async def test_wikilink_edges_resolved(env):
    conn, vault = env
    G = await builder.build_graph()
    assert str(vault / "a.md") in G and str(vault / "b.md") in G
    assert G.has_edge(str(vault / "a.md"), str(vault / "b.md"))
    edge = G[str(vault / "a.md")][str(vault / "b.md")]
    assert edge["edge_type"] == "wikilink"
    # dead [[missing]] resolves nowhere → no extra edge from c.md
    assert G.out_degree(str(vault / "c.md")) == 0


async def test_skill_nodes_never_path_scoped(env):
    G = await builder.build_graph()
    skill_ids = [n for n in G.nodes if n.startswith("skill:")]
    assert sorted(skill_ids) == ["skill:dsa", "skill:python"]
    for n in skill_ids:
        assert re.fullmatch(r"skill:[^:]+", n)   # D26: no role/path segment


async def test_skill_node_attrs_from_data(env):
    G = await builder.build_graph()
    node = G.nodes["skill:python"]
    assert node["roles"] == ["mle"]
    assert node["color"] == "#4A90E2"            # from roles table, not hardcoded


async def test_prereq_edge(env):
    G = await builder.build_graph()
    assert G.has_edge("skill:python", "skill:dsa")
    assert G["skill:python"]["skill:dsa"]["edge_type"] == "skill_prereq"


async def test_sr_coreview_bumps_existing_or_adds_edge(env):
    # python→dsa already carries a prereq edge, so same-day co-review must
    # bump its weight (+0.1) rather than duplicate; a fresh pair would get
    # a new sr_corev edge at 0.3. No self-edges either way.
    G = await builder.build_graph()
    fwd = G.get_edge_data("skill:python", "skill:dsa")
    rev = G.get_edge_data("skill:dsa", "skill:python")
    bumped = fwd and fwd["weight"] == pytest.approx(2.1)
    fresh  = rev and rev["edge_type"] == "sr_corev" and rev["weight"] == pytest.approx(0.3)
    assert bumped or fresh
    assert not G.has_edge("skill:python", "skill:python")
    assert not G.has_edge("skill:dsa", "skill:dsa")


async def test_rebuild_is_idempotent(env):
    conn, _ = env
    await builder.build_graph()
    async with conn.execute("SELECT COUNT(*) AS n FROM kg_nodes") as cur:
        nodes1 = (await cur.fetchone())["n"]
    async with conn.execute("SELECT COUNT(*) AS n FROM kg_edges") as cur:
        edges1 = (await cur.fetchone())["n"]

    await builder.build_graph()
    async with conn.execute("SELECT COUNT(*) AS n FROM kg_nodes") as cur:
        assert (await cur.fetchone())["n"] == nodes1
    async with conn.execute("SELECT COUNT(*) AS n FROM kg_edges") as cur:
        assert (await cur.fetchone())["n"] == edges1


async def test_d3_export_shape(env):
    G = await builder.build_graph()
    data = builder.to_d3_json(G)
    n = len(data["nodes"])
    for node in data["nodes"]:
        assert "roles" in node and "path_id" not in node
    for link in data["links"]:
        assert 0 <= link["source"] < n and 0 <= link["target"] < n


# ── router ────────────────────────────────────────────────────────────────────

async def test_router_endpoints(env):
    data = await graph_router.get_graph_data()
    assert data["nodes"] and data["links"]

    stats = await graph_router.get_graph_stats()
    assert stats["nodes"] == len(data["nodes"])

    nbrs = await graph_router.get_neighbours("skill:python", depth=1)
    assert any(n["id"] == "skill:dsa" for n in nbrs["nodes"])

    path = await graph_router.find_path("skill:python", "skill:dsa")
    assert path["path"] and path["length"] >= 1

    missing = await graph_router.get_neighbours("skill:ghost")
    assert missing == {"nodes": [], "links": []}
