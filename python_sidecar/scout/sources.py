# ============================================================
# SynthesisOverthrust — scout/sources.py
# Discovery sources for the Skill Scout agent.
#   - arXiv API (Atom XML, no key)
#   - HuggingFace Hub API (JSON, no key)
# `fetch_fn(url) -> str` is injectable so tests run offline.
# ============================================================

from __future__ import annotations
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from typing import Callable, List, Optional

ARXIV_URL = (
    "http://export.arxiv.org/api/query"
    "?search_query=cat:cs.LG+OR+cat:cs.CL+OR+cat:cs.AI"
    "&sortBy=submittedDate&sortOrder=descending&max_results={limit}"
)
HF_URL = "https://huggingface.co/api/models?sort=trendingScore&direction=-1&limit={limit}"

_ATOM = "{http://www.w3.org/2005/Atom}"


@dataclass
class Candidate:
    source: str        # "arxiv" | "huggingface"
    external_id: str
    title: str
    summary: str
    url: str

    @property
    def embed_text(self) -> str:
        return f"{self.title}. {self.summary}".strip()


async def _default_fetch(url: str) -> str:
    import httpx
    async with httpx.AsyncClient(timeout=20, follow_redirects=True) as client:
        resp = await client.get(url, headers={"User-Agent": "SynthesisOverthrust-Scout/0.1"})
        resp.raise_for_status()
        return resp.text


def parse_arxiv(xml_text: str) -> List[Candidate]:
    out: List[Candidate] = []
    root = ET.fromstring(xml_text)
    for entry in root.findall(f"{_ATOM}entry"):
        raw_id = (entry.findtext(f"{_ATOM}id") or "").strip()
        title = " ".join((entry.findtext(f"{_ATOM}title") or "").split())
        summary = " ".join((entry.findtext(f"{_ATOM}summary") or "").split())
        if not raw_id or not title:
            continue
        out.append(Candidate(
            source="arxiv",
            external_id=raw_id.rsplit("/", 1)[-1],
            title=title,
            summary=summary[:600],
            url=raw_id,
        ))
    return out


def parse_hf(json_text: str) -> List[Candidate]:
    import json
    out: List[Candidate] = []
    for model in json.loads(json_text):
        model_id = model.get("id") or model.get("modelId")
        if not model_id:
            continue
        tags = [t for t in model.get("tags", []) if ":" not in t][:8]
        pipeline = model.get("pipeline_tag") or ""
        summary = " · ".join(filter(None, [pipeline, ", ".join(tags)]))
        out.append(Candidate(
            source="huggingface",
            external_id=model_id,
            title=model_id,
            summary=summary[:600],
            url=f"https://huggingface.co/{model_id}",
        ))
    return out


async def fetch_candidates(
    sources: Optional[List[str]] = None,
    limit: int = 15,
    fetch_fn: Optional[Callable] = None,
) -> List[Candidate]:
    fetch = fetch_fn or _default_fetch
    wanted = sources or ["arxiv", "huggingface"]
    out: List[Candidate] = []
    if "arxiv" in wanted:
        out += parse_arxiv(await fetch(ARXIV_URL.format(limit=limit)))
    if "huggingface" in wanted:
        out += parse_hf(await fetch(HF_URL.format(limit=limit)))
    return out
