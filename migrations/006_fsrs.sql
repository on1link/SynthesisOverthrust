-- =============================================================
-- SynthesisOverthrust — migrations/006_fsrs.sql
-- FSRS scheduling state (py-fsrs 6.x) on sr_cards + review log.
-- ease_factor / interval columns remain for historical rows but
-- the FSRS path no longer writes them.
-- =============================================================

ALTER TABLE sr_cards ADD COLUMN stability REAL;

ALTER TABLE sr_cards ADD COLUMN difficulty REAL;

-- fsrs.State: 1 = Learning, 2 = Review, 3 = Relearning
ALTER TABLE sr_cards ADD COLUMN fsrs_state INTEGER NOT NULL DEFAULT 1;

ALTER TABLE sr_cards ADD COLUMN step INTEGER NOT NULL DEFAULT 0;

ALTER TABLE sr_cards ADD COLUMN lapses INTEGER NOT NULL DEFAULT 0;

-- Full-precision due timestamp (UTC ISO-8601); due_date stays as the
-- date-only mirror used by the UI.
ALTER TABLE sr_cards ADD COLUMN due_at TEXT;

UPDATE sr_cards
SET due_at = due_date || 'T00:00:00+00:00'
WHERE due_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_sr_cards_due_at ON sr_cards (user_id, due_at);

-- FSRS trajectory logging (prev_ef/new_ef stay NULL on the FSRS path)
ALTER TABLE sr_reviews ADD COLUMN prev_stability REAL;

ALTER TABLE sr_reviews ADD COLUMN new_stability REAL;

ALTER TABLE sr_reviews ADD COLUMN prev_difficulty REAL;

ALTER TABLE sr_reviews ADD COLUMN new_difficulty REAL;
