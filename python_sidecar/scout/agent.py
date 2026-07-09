# ============================================================
# SynthesisOverthrust — scout/agent.py
# Skill Scout classification: candidate → LanceDB nearest
# cluster → proposed placement {skill, topic, tier, roles}.
# No LLM in this slice (TEAM_LOG D8); no raw catalog reads (D9).
# ============================================================

from __future__ import annotations
import json
import uuid
from dataclasses import dataclass
from typing import List, Optional

from catalog import store
from .sources import Candidate

# Novelty bands (cosine score = 1 - distance)
COVERED_SIM = 0.75    # ≥ this → already in catalog, skip
MIN_SIM     = 0.25    # < this → off-catalog noise, skip
TOP_K       = 5


@dataclass
class Proposal:
    id: str
    candidate: Candidate
    skill: str
    skill_slug: str
    topic: str
    tier: str
    roles: List[str]
    similarity: float
    neighbors: List[dict]
    skip_reason: Optional[str] = None   # "covered" | "foreign" when skipped


def classify(candidate: Candidate, embedder=None, db_path=None) -> Proposal:
    """Derive a placement from the candidate's nearest catalog cluster."""
    hits = store.search(candidate.embed_text, k=TOP_K,
                        embedder=embedder, db_path=db_path)

    top = hits[0]["score"] if hits else 0.0
    skip = None
    if not hits or top < MIN_SIM:
        skip = "foreign"
    elif top >= COVERED_SIM:
        skip = "covered"

    # Weighted vote: skill with the highest summed score wins
    weights: dict[str, float] = {}
    for h in hits:
        weights[h["skill_slug"]] = weights.get(h["skill_slug"], 0.0) + h["score"]
    best_slug = max(weights, key=lambda k: weights[k]) if weights else ""
    best_hits = [h for h in hits if h["skill_slug"] == best_slug]
    lead = best_hits[0] if best_hits else {}

    roles = sorted({r for h in best_hits for r in h["roles"]})
    neighbors = [
        {"skill": h["skill"], "topic": h["topic"], "subtopic": h["subtopic"],
         "tier": h["tier"], "score": h["score"]}
        for h in hits
    ]

    return Proposal(
        id          = str(uuid.uuid4()),
        candidate   = candidate,
        skill       = lead.get("skill", ""),
        skill_slug  = best_slug,
        topic       = lead.get("topic", ""),
        tier        = lead.get("tier", ""),
        roles       = roles,
        similarity  = round(top, 4),
        neighbors   = neighbors,
        skip_reason = skip,
    )


async def run_scout(
    db,
    candidates: List[Candidate],
    embedder=None,
    lance_path=None,
) -> dict:
    """Classify candidates and persist new proposals. Returns run summary."""
    proposed = skipped_covered = skipped_foreign = duplicates = 0

    for cand in candidates:
        prop = classify(cand, embedder=embedder, db_path=lance_path)
        if prop.skip_reason == "covered":
            skipped_covered += 1
            continue
        if prop.skip_reason == "foreign":
            skipped_foreign += 1
            continue

        cur = await db.execute(
            """INSERT OR IGNORE INTO scout_proposals
               (id, source, external_id, title, summary, url,
                proposed_skill, proposed_skill_slug, proposed_topic,
                proposed_tier, proposed_roles, similarity, neighbors)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (prop.id, cand.source, cand.external_id, cand.title,
             cand.summary, cand.url,
             prop.skill, prop.skill_slug, prop.topic, prop.tier,
             ",".join(prop.roles), prop.similarity,
             json.dumps(prop.neighbors)),
        )
        if cur.rowcount:
            proposed += 1
        else:
            duplicates += 1   # already proposed/decided earlier — never re-ask
    await db.commit()

    return {
        "candidates":      len(candidates),
        "proposed":        proposed,
        "skipped_covered": skipped_covered,
        "skipped_foreign": skipped_foreign,
        "duplicates":      duplicates,
    }
