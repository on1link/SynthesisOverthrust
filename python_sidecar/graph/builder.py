# ============================================================
# SynthesisOverthrust — graph/builder.py
# Builds the knowledge graph (B11, SO-12) from real schema:
#   1. Obsidian [[wikilinks]] between vault notes
#   2. Skill prerequisite edges (skill_prerequisites)
#   3. SR co-review patterns (card→item→skill, same-day)
# Skill nodes are skill:{id} — never path-scoped (D26/§9);
# role attribution and colors come from the roles tables.
# ============================================================

from __future__ import annotations
import json
import re
from pathlib import Path
from typing import Optional

import networkx as nx
import structlog

log = structlog.get_logger()

_graph: Optional[nx.DiGraph] = None


async def build_graph() -> nx.DiGraph:
    """Full rebuild: clears kg_nodes/kg_edges, repopulates both stores."""
    global _graph
    G = nx.DiGraph()

    from db import get_db
    db = await get_db()

    # Full-rebuild semantics — no stale accumulation across rebuilds
    await db.execute("DELETE FROM kg_edges")
    await db.execute("DELETE FROM kg_nodes")

    # ── 1. Vault wikilinks ──────────────────────────────────────────────────
    async with db.execute("SELECT path, title FROM vault_index") as cur:
        notes = await cur.fetchall()

    note_paths = {n["path"] for n in notes}

    for note in notes:
        src_path = note["path"]
        await db.execute(
            """INSERT OR IGNORE INTO kg_nodes (id, user_id, label, node_type, weight)
               VALUES (?, 'default', ?, 'note', 1.0)""",
            (src_path, note["title"])
        )
        G.add_node(src_path, node_type="note", label=note["title"])

        try:
            content = Path(src_path).read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        for link in re.findall(r"\[\[([^\]|]+)(?:\|[^\]]*)?\]\]", content):
            dst = _resolve_wikilink(link, src_path, note_paths)
            if not dst:
                continue
            await db.execute(
                """INSERT OR IGNORE INTO kg_nodes (id, user_id, label, node_type, weight)
                   VALUES (?, 'default', ?, 'note', 1.0)""",
                (dst, Path(dst).stem)
            )
            G.add_edge(src_path, dst, edge_type="wikilink", weight=1.0)
            await db.execute(
                """INSERT OR IGNORE INTO kg_edges (source_id, target_id, rel_type, weight)
                   VALUES (?, ?, 'wikilink', 1.0)""",
                (src_path, dst)
            )

    # ── 2. Skill nodes + prerequisite edges ─────────────────────────────────
    async with db.execute("SELECT id, color FROM roles") as cur:
        role_colors = {r["id"]: r["color"] for r in await cur.fetchall()}

    async with db.execute(
        """SELECT s.id, s.name, s.description,
                  GROUP_CONCAT(sr.role_id) AS role_ids
           FROM skills s LEFT JOIN skill_roles sr ON sr.skill_id = s.id
           GROUP BY s.id"""
    ) as cur:
        skill_rows = await cur.fetchall()

    for sk in skill_rows:
        node_id = f"skill:{sk['id']}"
        roles = sorted((sk["role_ids"] or "").split(",")) if sk["role_ids"] else []
        color = role_colors.get(roles[0], "#666") if roles else "#666"
        await db.execute(
            """INSERT OR IGNORE INTO kg_nodes (id, user_id, label, node_type, weight, metadata)
               VALUES (?, 'default', ?, 'skill', 1.0, ?)""",
            (node_id, sk["name"], json.dumps({"roles": roles}))
        )
        G.add_node(node_id, node_type="skill", skill_id=sk["id"],
                   label=sk["name"], roles=roles, color=color)

    # Prereq edges (D27): skill_prerequisites — same source get_skill_levels reads
    async with db.execute(
        "SELECT skill_id, prerequisite_id FROM skill_prerequisites"
    ) as cur:
        prereq_rows = await cur.fetchall()

    for row in prereq_rows:
        src = f"skill:{row['prerequisite_id']}"
        dst = f"skill:{row['skill_id']}"
        G.add_edge(src, dst, edge_type="skill_prereq", weight=2.0)
        await db.execute(
            """INSERT OR IGNORE INTO kg_edges (source_id, target_id, rel_type, weight)
               VALUES (?, ?, 'skill_prereq', 2.0)""",
            (src, dst)
        )

    # ── 3. SR co-review (cards are item-keyed since 005) ────────────────────
    async with db.execute(
        """SELECT DISTINCT t.skill_id AS skill_id, date(r.reviewed_at) AS rev_date
           FROM sr_reviews r
           JOIN sr_cards c    ON c.id = r.card_id
           JOIN topic_items ti ON ti.id = c.item_id
           JOIN topics t      ON t.id = ti.topic_id
           WHERE r.quality >= 3
           ORDER BY rev_date"""
    ) as cur:
        reviews = await cur.fetchall()

    from collections import defaultdict
    by_date: dict[str, list[str]] = defaultdict(list)
    for r in reviews:
        by_date[r["rev_date"]].append(f"skill:{r['skill_id']}")

    for date_nodes in by_date.values():
        for i in range(len(date_nodes) - 1):
            u, v = date_nodes[i], date_nodes[i + 1]
            if u == v:
                continue
            if G.has_edge(u, v):
                G[u][v]["weight"] = G[u][v].get("weight", 1.0) + 0.1
            else:
                G.add_edge(u, v, edge_type="sr_corev", weight=0.3)
            await db.execute(
                """INSERT OR IGNORE INTO kg_edges (source_id, target_id, rel_type, weight)
                   VALUES (?, ?, 'sr_corev', 0.3)""",
                (u, v)
            )

    # concept edges (skill↔note) return with B14 when note tags land in SQLite (D28)

    await db.commit()
    _graph = G
    log.info("Knowledge graph built",
             nodes=G.number_of_nodes(), edges=G.number_of_edges())
    return G


def get_graph() -> Optional[nx.DiGraph]:
    return _graph


async def get_or_build_graph() -> nx.DiGraph:
    if _graph is None:
        return await build_graph()
    return _graph


# ── Graph exports ─────────────────────────────────────────────────────────────

def to_d3_json(G: nx.DiGraph) -> dict:
    """Convert graph to D3.js force simulation format."""
    node_index = {n: i for i, n in enumerate(G.nodes())}
    nodes = []
    for node_id, data in G.nodes(data=True):
        nodes.append({
            "id":        node_id,
            "index":     node_index[node_id],
            "label":     data.get("label", node_id.split(":")[-1]),
            "type":      data.get("node_type", "note"),
            "roles":     data.get("roles", []),
            "color":     data.get("color", "#4a5080"),
            "tags":      data.get("tags", []),
            "degree":    G.degree(node_id),
            "in_degree": G.in_degree(node_id),
        })
    links = []
    for src, dst, data in G.edges(data=True):
        links.append({
            "source": node_index[src],
            "target": node_index[dst],
            "type":   data.get("edge_type", "link"),
            "weight": data.get("weight", 1.0),
        })
    return {"nodes": nodes, "links": links}


def graph_stats(G: nx.DiGraph) -> dict:
    if G.number_of_nodes() == 0:
        return {"nodes": 0, "edges": 0}
    try:
        density    = nx.density(G)
        components = nx.number_weakly_connected_components(G)
        centrality = nx.degree_centrality(G)
        top5 = sorted(centrality.items(), key=lambda x: x[1], reverse=True)[:5]
    except Exception:
        density = 0; components = 0; top5 = []
    return {
        "nodes":        G.number_of_nodes(),
        "edges":        G.number_of_edges(),
        "density":      round(density, 4),
        "components":   components,
        "top_nodes":    [{"id": n, "centrality": round(c, 3)} for n, c in top5],
    }


def _resolve_wikilink(link: str, src_path: str, all_paths: set[str]) -> Optional[str]:
    """Resolve an Obsidian [[wikilink]] to a full path."""
    link = link.strip()
    for path in all_paths:
        if Path(path).stem == link or Path(path).name == link:
            return path
    link_lower = link.lower()
    for path in all_paths:
        if link_lower in path.lower():
            return path
    return None
