-- =============================================================
-- SynthesisOverthrust — migrations/009_learning_loop.sql
-- B4–B6: tables for practice problems, learning resources and
-- focus sessions. The Rust commands for these existed since
-- Phase 1 but queried tables no migration ever created (§6.6
-- drift). Column sets are derived from those queries.
-- Includes a small demo seed so the UI is exercisable.
-- =============================================================

-- ── B4: practice problems + attempts ─────────────────────────

CREATE TABLE IF NOT EXISTS practice_problems (
    id TEXT PRIMARY KEY,
    subtopic_id TEXT NOT NULL,
    path_id TEXT NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (
        difficulty IN ('easy', 'medium', 'hard')
    ),
    problem_text TEXT NOT NULL,
    hints TEXT NOT NULL DEFAULT '[]',
    explanation TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_practice_problems_lookup
    ON practice_problems (subtopic_id, path_id, difficulty);

CREATE TABLE IF NOT EXISTS practice_attempts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default',
    problem_id TEXT NOT NULL REFERENCES practice_problems (id) ON DELETE CASCADE,
    subtopic_id TEXT NOT NULL,
    path_id TEXT NOT NULL,
    correct INTEGER NOT NULL DEFAULT 0,
    time_taken_s INTEGER NOT NULL DEFAULT 0,
    hint_used INTEGER NOT NULL DEFAULT 0,
    xp_awarded INTEGER NOT NULL DEFAULT 0,
    mastery_delta INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_practice_attempts_user
    ON practice_attempts (user_id, created_at);

-- ── B5: learning resources + progress ────────────────────────

CREATE TABLE IF NOT EXISTS learning_resources (
    id TEXT PRIMARY KEY,
    node_id TEXT,
    path_id TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'course' CHECK (
        type IN ('book', 'course', 'paper', 'video', 'blog', 'tool')
    ),
    title TEXT NOT NULL,
    url TEXT,
    author TEXT,
    est_hours REAL NOT NULL DEFAULT 0,
    is_free INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_learning_resources_node
    ON learning_resources (node_id, path_id);

CREATE TABLE IF NOT EXISTS resource_progress (
    user_id TEXT NOT NULL DEFAULT 'default',
    resource_id TEXT NOT NULL REFERENCES learning_resources (id) ON DELETE CASCADE,
    pct_complete INTEGER NOT NULL DEFAULT 0 CHECK (
        pct_complete >= 0
        AND pct_complete <= 100
    ),
    started_at TEXT,
    finished_at TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, resource_id)
);

-- ── B6: focus sessions ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS focus_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT 'default',
    node_id TEXT,
    subtopic_id TEXT,
    path_id TEXT,
    duration_mins INTEGER NOT NULL,
    session_type TEXT NOT NULL CHECK (
        session_type IN ('pomodoro', 'deep', 'review', 'assessment')
    ),
    notes TEXT,
    xp_reward INTEGER NOT NULL DEFAULT 0,
    started_at TEXT NOT NULL,
    ended_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_focus_sessions_user
    ON focus_sessions (user_id, ended_at);

-- ── Demo seed (Calculus / Limits items 1001–1002, MLE path) ──

INSERT
    OR IGNORE INTO practice_problems (id, subtopic_id, path_id, difficulty, problem_text, hints, explanation)
VALUES
    ('pp_lim_001', '1001', 'mle', 'easy',
     'Evaluate lim(x→0) sin(x)/x and justify the result.',
     '["Squeeze theorem", "Compare sin(x) with x near 0"]',
     'The squeeze theorem with cos(x) ≤ sin(x)/x ≤ 1 gives the limit 1.'),
    ('pp_lim_002', '1001', 'mle', 'medium',
     'Compute lim(x→∞) (1 + 1/x)^x and connect it to a constant used in ML loss functions.',
     '["Take the logarithm first"]',
     'The limit is e; log/exp underlie cross-entropy and softmax.'),
    ('pp_lim_003', '1001', 'mle', 'hard',
     'Show whether f(x) = x·sin(1/x) (f(0)=0) is continuous and differentiable at 0.',
     '["Check the limit definition at 0", "Derivative needs lim of sin(1/h)"]',
     'Continuous at 0 by squeeze; not differentiable — sin(1/h) has no limit.'),
    ('pp_cont_001', '1002', 'mle', 'easy',
     'Give an example of a function continuous everywhere but not differentiable at one point.',
     '["Think absolute value"]',
     '|x| at x=0: continuous, but left/right derivatives differ (-1 vs 1).'),
    ('pp_cont_002', '1002', 'mle', 'medium',
     'Why does ReLU''s non-differentiability at 0 not break gradient descent in practice?',
     '["Subgradients", "Measure of a single point"]',
     'Frameworks use a subgradient (0 or 1) at 0; the point has measure zero.');

INSERT
    OR IGNORE INTO learning_resources (id, node_id, path_id, type, title, url, author, est_hours, is_free)
VALUES
    ('res_calc_001', 'skill_calculus', 'mle', 'course',
     'Essence of Calculus', 'https://www.3blue1brown.com/topics/calculus', '3Blue1Brown', 6, 1),
    ('res_calc_002', 'skill_calculus', 'mle', 'book',
     'Calculus Made Easy', 'https://calculusmadeeasy.org', 'Silvanus Thompson', 20, 1),
    ('res_calc_003', 'skill_calculus', 'mle', 'video',
     'Matrix Calculus for Deep Learning', 'https://explained.ai/matrix-calculus/', 'Parr & Howard', 3, 1),
    ('res_gen_001', NULL, 'mle', 'tool',
     'Wolfram Alpha (limit checker)', 'https://www.wolframalpha.com', NULL, 0, 1);
