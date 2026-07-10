-- ── SO-11 (B7): agent assessments — the only path above MASTERY_SR_CAP ──
CREATE TABLE IF NOT EXISTS assessments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default',
    item_id INTEGER NOT NULL REFERENCES topic_items (id) ON DELETE CASCADE,
    kind TEXT NOT NULL DEFAULT 'single' CHECK (kind IN ('single', 'dual')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (
        status IN ('active', 'passed', 'failed')
    ),
    questions TEXT NOT NULL,            -- JSON array [{question, framing}]
    answers TEXT,                       -- JSON array of user answers
    verdicts TEXT,                      -- JSON array [{score, feedback}]
    score INTEGER,                      -- 0-100 overall
    mastery_before INTEGER NOT NULL,
    mastery_after INTEGER,
    model TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_assessments_item
    ON assessments (user_id, item_id, status);
