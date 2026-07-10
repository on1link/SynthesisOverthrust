# ============================================================
# SynthesisOverthrust — search/store.py
# LanceDB store for Obsidian vault chunks (B10). Own table,
# distinct from the catalog store; content + metadata ONLY —
# no mastery/FSRS state ever (contexto §4).
# Mirrors catalog/store.py: injectable embedder + db_path.
# ============================================================

from __future__ import annotations
import re
from pathlib import Path
from typing import List, Optional

from config import settings
from catalog.store import Embedder, default_embedder, _connect

TABLE_NAME = "vault_chunks"

_FRONTMATTER_RE = re.compile(r"\A---\n(.*?)\n---\n", re.DOTALL)
_FM_TAGS_RE     = re.compile(r"^tags:\s*\[?([^\]\n]+)\]?\s*$", re.MULTILINE)
_INLINE_TAG_RE  = re.compile(r"(?:^|\s)#([\w/\-]+)")
_H1_RE          = re.compile(r"^#\s+(.+)$", re.MULTILINE)


def chunk_text(text: str, max_words: Optional[int] = None, overlap: Optional[int] = None) -> List[str]:
    """Word-based overlapping chunks (sizes from config unless overridden)."""
    max_words = max_words or settings.CHUNK_SIZE
    overlap   = overlap if overlap is not None else settings.CHUNK_OVERLAP
    words = text.split()
    if not words:
        return []
    if len(words) <= max_words:
        return [" ".join(words)]
    chunks, start = [], 0
    while start < len(words):
        chunks.append(" ".join(words[start:start + max_words]))
        start += max_words - overlap
    return chunks


def parse_note(path: Path) -> dict:
    """Extract title, tags and body text from a markdown note."""
    text = path.read_text(errors="replace")
    tags: set[str] = set()

    fm = _FRONTMATTER_RE.match(text)
    if fm:
        m = _FM_TAGS_RE.search(fm.group(1))
        if m:
            tags |= {t.strip().strip("'\"#") for t in m.group(1).split(",") if t.strip()}
        text = text[fm.end():]

    tags |= {t for t in _INLINE_TAG_RE.findall(text)}
    h1 = _H1_RE.search(text)
    title = h1.group(1).strip() if h1 else path.stem
    return {"title": title, "tags": sorted(tags), "body": text}


def reindex(
    vault_dir: str | Path,
    embedder: Optional[Embedder] = None,
    db_path: Optional[str] = None,
    batch_size: int = 128,
) -> dict:
    """Full rebuild of the vault_chunks table from `vault_dir`/**/*.md (D20)."""
    vault = Path(vault_dir)
    if not vault.is_dir():
        raise NotADirectoryError(str(vault))
    embed = embedder or default_embedder

    rows, notes = [], 0
    for md in sorted(vault.rglob("*.md")):
        note = parse_note(md)
        chunks = chunk_text(note["body"])
        if not chunks:
            continue
        notes += 1
        for i, chunk in enumerate(chunks):
            rows.append({
                "id":          f"{md}#{i}",
                "path":        str(md),
                "title":       note["title"],
                "tags":        "," + ",".join(note["tags"]) + ",",
                "chunk_index": i,
                "chunk_text":  chunk[:2000],
            })

    if not rows:
        raise ValueError(f"no markdown notes with content under {vault}")

    for i in range(0, len(rows), batch_size):
        batch = rows[i:i + batch_size]
        vectors = embed([f"{r['title']}\n{r['chunk_text']}" for r in batch])
        for r, vec in zip(batch, vectors):
            r["vector"] = vec

    db = _connect(db_path)
    db.create_table(TABLE_NAME, data=rows, mode="overwrite")
    return {"indexed_chunks": len(rows), "unique_notes": notes}


def search_chunks(
    query: str,
    top_k: int = 6,
    embedder: Optional[Embedder] = None,
    db_path: Optional[str] = None,
) -> List[dict]:
    """Semantic search over vault chunks. FileNotFoundError before first index."""
    embed = embedder or default_embedder
    db = _connect(db_path)
    if TABLE_NAME not in db.table_names():
        raise FileNotFoundError("vault not indexed yet")
    tbl = db.open_table(TABLE_NAME)

    out = []
    for row in tbl.search(embed([query])[0]).metric("cosine").limit(top_k).to_list():
        out.append({
            "path":        row["path"],
            "title":       row["title"],
            "tags":        [t for t in row["tags"].split(",") if t],
            "chunk_index": row["chunk_index"],
            "chunk_text":  row["chunk_text"],
            "score":       round(1.0 - row.get("_distance", 0.0), 4),
        })
    return out


def stats(db_path: Optional[str] = None) -> dict:
    db = _connect(db_path)
    if TABLE_NAME not in db.table_names():
        return {"indexed": False, "indexed_chunks": 0, "unique_notes": 0}
    df = db.open_table(TABLE_NAME).to_pandas()[["path"]]
    return {"indexed": True, "indexed_chunks": len(df), "unique_notes": int(df["path"].nunique())}
