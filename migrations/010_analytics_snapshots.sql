-- =============================================================
-- SynthesisOverthrust — migrations/010_analytics_snapshots.sql
-- Weekly analytics snapshots (B9). The analytics router's
-- snapshot endpoint referenced this table but no migration
-- created it (§6.6 drift).
-- =============================================================

CREATE TABLE IF NOT EXISTS analytics_snapshots (
    id TEXT NOT NULL,
    user_id TEXT NOT NULL DEFAULT 'default',
    week_start TEXT NOT NULL,
    xp_gained INTEGER NOT NULL DEFAULT 0,
    tasks_done INTEGER NOT NULL DEFAULT 0,
    sessions INTEGER NOT NULL DEFAULT 0,
    skills_leveled INTEGER NOT NULL DEFAULT 0,
    sleep_avg REAL NOT NULL DEFAULT 0,
    top_skill TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, week_start)
);
