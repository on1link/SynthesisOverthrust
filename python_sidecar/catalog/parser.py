# ============================================================
# SynthesisOverthrust — catalog/parser.py
# Parses `Synthesis Overthrust Catalog.md` into subtopic records.
#
# Structure handled:
#   ## Role Name (CODE)          — role section
#   ### Tier X                   — tier context (F, 1T, 2T, 2.5T, 3T, 4T)
#   ### SKILL: Name / #### SKILL: Name   (both levels occur)
#   `Tier: X` | `Roles: A, B` [| **Max Level: N** | **Prerequisites: ...**]
#   ###### Topic: Name           — topic ("← NEW..." annotations stripped)
#   - bullet                     — subtopic (bold markdown stripped)
#
# Skills repeat across role sections; they are deduped by normalized
# name — roles are unioned, topics/subtopics merged. Role sections
# marked "OUTSIDE TREE" (Career Track) are skipped.
# ============================================================

from __future__ import annotations
import re
from dataclasses import dataclass, field
from typing import Optional

_ROLE_RE = re.compile(r"^##\s+(?P<name>[^#].*?)(?:\((?P<code>[A-Z]{2,4})\))?\s*$")
_TIER_RE = re.compile(r"^###\s+Tier\s+(?P<tier>[\w.]+)\s*$")
_SKILL_RE = re.compile(r"^#{3,4}\s+SKILL:\s*(?P<name>.+?)\s*$")
_TOPIC_RE = re.compile(r"^#{5,6}\s+Topic:\s*(?P<name>.+?)\s*$")
_BULLET_RE = re.compile(r"^\s*-\s+(?P<text>.+?)\s*$")
_META_RE = re.compile(r"^`Tier:\s*(?P<tier>[\w.]+)`\s*\|\s*`Roles:\s*(?P<roles>[^`]+)`")
_MAXLVL_RE = re.compile(r"\*\*Max Level:\s*(?P<n>\d+)\*\*")
_PREREQ_RE = re.compile(r"\*\*Prerequisites:\s*(?P<p>[^*]+)\*\*")
_ANNOT_RE = re.compile(r"\s*←\s*NEW.*$")      # "← NEW", "← NEW topic", …
_BOLD_RE = re.compile(r"\*\*([^*]+)\*\*")


def _slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", text.strip().lower()).strip("_")


def _clean(text: str) -> str:
    text = _ANNOT_RE.sub("", text)
    text = _BOLD_RE.sub(r"\1", text)
    return text.strip().strip(":").strip()


def _norm_tier(tier: str) -> str:
    """Canonical tier labels: F, 1, 2, 2.5, 3, 4 ('1T' → '1')."""
    t = tier.strip()
    return t[:-1] if t.upper().endswith("T") and t.upper() != "T" and t != "F" else t


@dataclass
class Skill:
    name: str
    tier: str = ""
    roles: set = field(default_factory=set)
    max_level: Optional[int] = None
    prerequisites: str = ""
    # topic name -> ordered unique subtopic texts
    topics: dict = field(default_factory=dict)


@dataclass
class SubtopicRecord:
    """One row per unique subtopic — the LanceDB unit."""
    id: str
    skill: str
    skill_slug: str
    topic: str
    subtopic: str
    tier: str
    roles: list
    max_level: Optional[int]
    prerequisites: str

    @property
    def embed_text(self) -> str:
        return f"{self.skill} > {self.topic} > {self.subtopic}"


def parse_catalog(text: str) -> dict[str, Skill]:
    """Parse catalog markdown into skills deduped by normalized name."""
    skills: dict[str, Skill] = {}

    section_role: Optional[str] = None
    section_active = True          # False inside OUTSIDE TREE sections
    tier_ctx = ""
    skill: Optional[Skill] = None
    topic: Optional[str] = None

    for line in text.splitlines():
        m = _ROLE_RE.match(line)
        if m and not line.startswith("###"):
            heading = m.group("name")
            section_role = m.group("code")
            section_active = "OUTSIDE TREE" not in heading.upper()
            tier_ctx, skill, topic = "", None, None
            continue

        if not section_active:
            continue

        m = _TIER_RE.match(line)
        if m:
            tier_ctx = _norm_tier(m.group("tier"))
            continue

        m = _SKILL_RE.match(line)
        if m:
            name = _clean(m.group("name"))
            key = _slug(name)
            skill = skills.setdefault(key, Skill(name=name))
            if not skill.tier:
                skill.tier = tier_ctx
            if section_role:
                skill.roles.add(section_role)
            topic = None
            continue

        if skill is None:
            continue

        m = _META_RE.match(line.strip())
        if m:
            if not skill.tier:
                skill.tier = _norm_tier(m.group("tier"))
            for r in m.group("roles").split(","):
                r = r.strip()
                if r:
                    skill.roles.add(r)
            lvl = _MAXLVL_RE.search(line)
            if lvl and skill.max_level is None:
                skill.max_level = int(lvl.group("n"))
            pre = _PREREQ_RE.search(line)
            if pre and not skill.prerequisites:
                p = pre.group("p").strip()
                skill.prerequisites = "" if p.lower() == "none" else p
            continue

        m = _TOPIC_RE.match(line)
        if m:
            topic = _clean(m.group("name"))
            skill.topics.setdefault(topic, [])
            continue

        if topic is None:
            continue

        m = _BULLET_RE.match(line)
        if m:
            sub = _clean(m.group("text"))
            if sub and sub not in skill.topics[topic]:
                skill.topics[topic].append(sub)

    return skills


def to_records(skills: dict[str, Skill]) -> list[SubtopicRecord]:
    """Flatten skills into one record per unique subtopic."""
    records: list[SubtopicRecord] = []
    for key, sk in skills.items():
        for topic, subs in sk.topics.items():
            t_slug = _slug(topic)
            for sub in subs:
                records.append(SubtopicRecord(
                    id            = f"{key}/{t_slug}/{_slug(sub)[:80]}",
                    skill         = sk.name,
                    skill_slug    = key,
                    topic         = topic,
                    subtopic      = sub,
                    tier          = sk.tier,
                    roles         = sorted(sk.roles),
                    max_level     = sk.max_level,
                    prerequisites = sk.prerequisites,
                ))
    return records


def parse_catalog_file(path) -> list[SubtopicRecord]:
    from pathlib import Path
    return to_records(parse_catalog(Path(path).read_text(encoding="utf-8")))
