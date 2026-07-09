-- =============================================================
-- SynthesisOverthrust — migrations/007_scout.sql
-- Skill Scout agent: discovery proposals + correction loop.
-- Decided proposals double as few-shot examples for future
-- agent classification (contexto §5).
-- =============================================================

CREATE TABLE IF NOT EXISTS scout_proposals (
    id TEXT PRIMARY KEY,
    source TEXT NOT NULL,
    external_id TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL DEFAULT '',
    url TEXT NOT NULL DEFAULT '',
    proposed_skill TEXT,
    proposed_skill_slug TEXT,
    proposed_topic TEXT,
    proposed_tier TEXT,
    proposed_roles TEXT NOT NULL DEFAULT '',
    similarity REAL,
    neighbors TEXT NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'approved', 'edited', 'rejected')
    ),
    correction TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    decided_at TEXT,
    UNIQUE (source, external_id)
);

CREATE INDEX IF NOT EXISTS idx_scout_proposals_status
    ON scout_proposals (status, created_at);
