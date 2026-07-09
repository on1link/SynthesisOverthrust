# ============================================================
# SynthesisOverthrust — catalog/store.py
# LanceDB store for the skills catalog: subtopic embeddings +
# metadata ONLY ("what exists"). Mastery/FSRS state never lives
# here (contexto §4).
#
# Roles are stored as a delimited CSV (",AIE,MLE,") so exact-code
# filtering works with LIKE without substring collisions (EL/MLE).
# ============================================================

from __future__ import annotations
from typing import Callable, List, Optional, Sequence

from config import settings
from .parser import SubtopicRecord

TABLE_NAME = "catalog_subtopics"

Embedder = Callable[[Sequence[str]], List[List[float]]]

_model = None


def default_embedder(texts: Sequence[str]) -> List[List[float]]:
    """sentence-transformers embedder, lazily loaded (heavy import)."""
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer(settings.EMBED_MODEL)
    return _model.encode(list(texts), normalize_embeddings=True).tolist()


def _connect(db_path: Optional[str] = None):
    import lancedb
    return lancedb.connect(db_path or settings.LANCE_DIR)


def ingest(
    records: List[SubtopicRecord],
    embedder: Optional[Embedder] = None,
    db_path: Optional[str] = None,
    batch_size: int = 256,
) -> int:
    """(Re)build the catalog table from parsed records. Returns row count."""
    if not records:
        raise ValueError("no records to ingest")
    embed = embedder or default_embedder

    rows = []
    for i in range(0, len(records), batch_size):
        batch = records[i:i + batch_size]
        vectors = embed([r.embed_text for r in batch])
        for r, vec in zip(batch, vectors):
            rows.append({
                "id":            r.id,
                "vector":        vec,
                "skill":         r.skill,
                "skill_slug":    r.skill_slug,
                "topic":         r.topic,
                "subtopic":      r.subtopic,
                "tier":          r.tier,
                "roles":         "," + ",".join(r.roles) + ",",
                "max_level":     r.max_level or 0,
                "prerequisites": r.prerequisites,
            })

    db = _connect(db_path)
    db.create_table(TABLE_NAME, data=rows, mode="overwrite")
    return len(rows)


def search(
    query: str,
    k: int = 8,
    role: Optional[str] = None,
    tier: Optional[str] = None,
    embedder: Optional[Embedder] = None,
    db_path: Optional[str] = None,
) -> List[dict]:
    """Semantic search over subtopics with optional exact role/tier filters."""
    embed = embedder or default_embedder
    db = _connect(db_path)
    if TABLE_NAME not in db.table_names():
        raise FileNotFoundError("catalog table not ingested yet")
    tbl = db.open_table(TABLE_NAME)

    q = tbl.search(embed([query])[0]).metric("cosine").limit(k)
    clauses = []
    if role:
        clauses.append(f"roles LIKE '%,{role.strip().upper()},%'")
    if tier:
        clauses.append(f"tier = '{tier.strip().rstrip('Tt') if tier.strip() != 'F' else 'F'}'")
    if clauses:
        q = q.where(" AND ".join(clauses))

    out = []
    for row in q.to_list():
        out.append({
            "id":            row["id"],
            "skill":         row["skill"],
            "skill_slug":    row["skill_slug"],
            "topic":         row["topic"],
            "subtopic":      row["subtopic"],
            "tier":          row["tier"],
            "roles":         [r for r in row["roles"].split(",") if r],
            "max_level":     row["max_level"] or None,
            "prerequisites": row["prerequisites"],
            "score":         round(1.0 - row.get("_distance", 0.0), 4),
        })
    return out


def stats(db_path: Optional[str] = None) -> dict:
    db = _connect(db_path)
    if TABLE_NAME not in db.table_names():
        return {"ingested": False, "subtopics": 0, "skills": 0}
    tbl = db.open_table(TABLE_NAME)
    df = tbl.to_pandas()[["skill_slug", "tier"]]
    return {
        "ingested":  True,
        "subtopics": len(df),
        "skills":    int(df["skill_slug"].nunique()),
        "by_tier":   {str(k): int(v) for k, v in df["tier"].value_counts().items()},
    }
