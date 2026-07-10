# ============================================================
# SynthesisOverthrust — catalog/sync.py
# Mirrors catalog knowledge (roles, skill→role links, tiers) from
# LanceDB into the SQLite tree so the Skills view can render it.
# Shared by /catalog/sync-tree and the Scout approve path.
#
# Role codes are catalog data, never hardcoded logic: GER/ENG are
# alias spellings of the GL/EL section codes; ALL expands to every
# known role. Display names come from the catalog section headers.
# ============================================================

from __future__ import annotations
import re
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Set

ROLE_ALIASES  = {"GER": "GL", "ENG": "EL"}
ROLE_WILDCARD = "ALL"

# Seeded skills (004) whose display names abbreviate the catalog skill name —
# normalized-name matching misses them, so map seed id → catalog skill_slug.
# Verified same tier on both sides before adding.
SKILL_ALIASES = {
    "skill_deep_learning": "deep_learning",
    "skill_genai_llm":     "generative_ai_large_language_models",
    "skill_adv_pytorch":   "advanced_deep_learning_frameworks_pytorch_core",
}

# Canonical parser tiers → seeded difficulty ids (001/004)
TIER_DIFFICULTY = {
    "F":   "tier_f",
    "1":   "tier_1t",
    "2":   "tier_2t",
    "2.5": "tier_2_5t",
    "3":   "tier_3t",
    "4":   "tier_4t",
}

# Colors for role rows created here (existing rows are never touched).
# Same shape as the 004 seed: color == bg_color, alpha as string.
_ROLE_PALETTE = ["#50E3C2", "#F5A623", "#BD10E0", "#7ED321", "#D0021B", "#4A90E2"]

_ROLE_HEADER_RE = re.compile(r"^##\s+(?P<name>[^#(]+?)\s*\((?P<code>[A-Z]{2,4})\)\s*$")


def role_display_names(catalog_path: str | Path) -> Dict[str, str]:
    """Scan `## Role Name (CODE)` headers — the data source for display names."""
    names: Dict[str, str] = {}
    try:
        for line in Path(catalog_path).read_text().splitlines():
            m = _ROLE_HEADER_RE.match(line)
            if m:
                names[m.group("code")] = m.group("name").strip()
    except OSError:
        pass
    return names


def normalize_roles(codes: Iterable[str], known: Optional[Set[str]] = None) -> Set[str]:
    """Alias-fold role codes and expand the ALL wildcard against `known`."""
    out: Set[str] = set()
    for raw in codes:
        code = raw.strip().upper()
        if not code:
            continue
        code = ROLE_ALIASES.get(code, code)
        if code == ROLE_WILDCARD:
            out |= known or set()
        else:
            out.add(code)
    return out


async def ensure_roles(db, codes: Set[str], names: Dict[str, str]) -> int:
    """INSERT OR IGNORE role rows for codes (lowercase ids). Returns created count."""
    async with db.execute("SELECT COALESCE(MAX(sort_order),0) AS mx FROM roles") as cur:
        next_order = (await cur.fetchone())["mx"] + 1
    created = 0
    for i, code in enumerate(sorted(codes)):
        color = _ROLE_PALETTE[(next_order + i - 1) % len(_ROLE_PALETTE)]
        cur = await db.execute(
            """INSERT OR IGNORE INTO roles (id, name, color, bg_color, bg_alpha, sort_order)
               VALUES (?,?,?,?,?,?)""",
            (code.lower(), names.get(code, code), color, color, "0.15", next_order + i)
        )
        created += cur.rowcount
    return created


async def link_skill(db, skill_id: str, codes: Set[str]) -> int:
    """INSERT OR IGNORE skill_roles links. Returns created count."""
    created = 0
    for code in sorted(codes):
        cur = await db.execute(
            "INSERT OR IGNORE INTO skill_roles (skill_id, role_id) VALUES (?,?)",
            (skill_id, code.lower())
        )
        created += cur.rowcount
    return created


async def set_difficulty(db, skill_id: str, tier: str) -> bool:
    """Fill skills.difficulty_id from a canonical tier if not already set."""
    diff = TIER_DIFFICULTY.get((tier or "").strip())
    if not diff:
        return False
    cur = await db.execute(
        """UPDATE skills SET difficulty_id = ?
           WHERE id = ? AND (difficulty_id IS NULL OR difficulty_id = '')""",
        (diff, skill_id)
    )
    return cur.rowcount > 0
