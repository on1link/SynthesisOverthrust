-- =============================================================
-- SynthesisOverthrust — migrations/005_spaced_repetition.sql
-- Spaced-repetition cards + review log.
-- Cards are keyed to topic_items (the lowest mastery unit);
-- scheduling state is per (user, item). Never path-scoped.
-- =============================================================

CREATE TABLE IF NOT EXISTS sr_cards (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default',
    item_id INTEGER NOT NULL REFERENCES topic_items (id) ON DELETE CASCADE,
    front TEXT NOT NULL,
    back TEXT NOT NULL DEFAULT '',
    ease_factor REAL NOT NULL DEFAULT 2.5,
    interval INTEGER NOT NULL DEFAULT 1,
    repetitions INTEGER NOT NULL DEFAULT 0,
    due_date TEXT NOT NULL,
    last_review TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (user_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_sr_cards_due ON sr_cards (user_id, due_date);

CREATE TABLE IF NOT EXISTS sr_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id TEXT NOT NULL REFERENCES sr_cards (id) ON DELETE CASCADE,
    user_id TEXT NOT NULL DEFAULT 'default',
    quality INTEGER NOT NULL CHECK (
        quality >= 0
        AND quality <= 5
    ),
    prev_ef REAL,
    new_ef REAL,
    prev_interval INTEGER,
    new_interval INTEGER,
    mastery_delta INTEGER NOT NULL DEFAULT 0,
    reviewed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sr_reviews_card ON sr_reviews (card_id);

CREATE INDEX IF NOT EXISTS idx_sr_reviews_user_time ON sr_reviews (user_id, reviewed_at);
