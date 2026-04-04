-- =============================================================
-- SynthesisOverthrust — migrations/001_initial.sql
-- CONSOLIDATED SCHEMA: Dynamic Bottom-Up Skill Progression
-- =============================================================

-- ── 1. Users & Config (Core) ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT(lower(hex(randomblob (16)))),
    name TEXT NOT NULL DEFAULT 'Learner',
    username TEXT NOT NULL DEFAULT 'Learner',
    xp INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    sp INTEGER NOT NULL DEFAULT 0,
    streak INTEGER NOT NULL DEFAULT 0,
    last_active TEXT,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    daily_xp_goal INTEGER NOT NULL DEFAULT 200,
    onboarding_done INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT(datetime('now'))
);

CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT(datetime('now'))
);

-- ── 2. Static Knowledge Base (The Tree) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    bg_color TEXT NOT NULL,
    bg_alpha TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS difficulties (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    short_label TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS skills (
    id TEXT PRIMARY KEY,
    difficulty_id TEXT REFERENCES difficulties (id),
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    description TEXT
);

-- Maps a skill to multiple roles (Replaces the old 'shared' JSON array)
CREATE TABLE IF NOT EXISTS skill_roles (
    skill_id TEXT REFERENCES skills (id) ON DELETE CASCADE,
    role_id TEXT REFERENCES roles (id) ON DELETE CASCADE,
    PRIMARY KEY (skill_id, role_id)
);

-- Defines node dependencies (Replaces the old 'prereqs' JSON array)
CREATE TABLE IF NOT EXISTS skill_prerequisites (
    skill_id TEXT REFERENCES skills (id) ON DELETE CASCADE,
    prerequisite_id TEXT REFERENCES skills (id) ON DELETE CASCADE,
    PRIMARY KEY (skill_id, prerequisite_id)
);

-- The logical grouping (e.g., "Async / Await")
CREATE TABLE IF NOT EXISTS topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    skill_id TEXT REFERENCES skills (id) ON DELETE CASCADE,
    header TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0
);

-- The actual checklist items/exercises inside a topic
CREATE TABLE IF NOT EXISTS topic_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER REFERENCES topics (id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    xp_value INTEGER DEFAULT 80,
    sort_order INTEGER DEFAULT 0
);

-- ── 3. Dynamic User State (The "Save File") ───────────────────────────────────
-- Tracks progress exclusively at the lowest level (topic_items)
CREATE TABLE IF NOT EXISTS user_item_mastery (
    user_id TEXT DEFAULT 'default',
    item_id INTEGER REFERENCES topic_items (id) ON DELETE CASCADE,
    mastery INTEGER DEFAULT 0 CHECK (
        mastery >= 0
        AND mastery <= 100
    ),
    xp_invested INTEGER DEFAULT 0,
    practice_count INTEGER DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    last_practiced TEXT,
    PRIMARY KEY (user_id, item_id)
);

-- Tracks explicit overrides for the top level (Skill Nodes)
CREATE TABLE IF NOT EXISTS user_skill_unlocks (
    user_id TEXT DEFAULT 'default',
    skill_id TEXT REFERENCES skills (id) ON DELETE CASCADE,
    is_unlocked INTEGER DEFAULT 0,
    unlocked_at TEXT DEFAULT(datetime('now')),
    PRIMARY KEY (user_id, skill_id)
);

-- ── 4. The Bottom-Up Engine (Views) ───────────────────────────────────────────

-- Step A: Roll up items into Topics
CREATE VIEW IF NOT EXISTS v_user_topic_levels AS
SELECT
    COALESCE(uim.user_id, 'default') AS user_id,
    t.skill_id,
    t.id AS topic_id,
    -- Topic Mastery: Average of all its Items
    COALESCE(
        CAST(
            ROUND(AVG(COALESCE(uim.mastery, 0))) AS INTEGER
        ),
        0
    ) AS topic_mastery,
    -- Pass-through stats for the next level up
    SUM(
        CASE
            WHEN uim.mastery >= 80 THEN 1
            ELSE 0
        END
    ) AS mastered_items,
    COALESCE(SUM(uim.xp_invested), 0) AS topic_xp
FROM
    topics t
    LEFT JOIN topic_items ti ON ti.topic_id = t.id
    LEFT JOIN user_item_mastery uim ON uim.item_id = ti.id
GROUP BY
    COALESCE(uim.user_id, 'default'),
    t.skill_id,
    t.id;

-- Step B: Roll up Topics into Skills (Normalized equally by topic)
CREATE VIEW IF NOT EXISTS v_user_skill_levels AS
SELECT
    utl.user_id,
    s.id AS skill_id,
    -- 1. Skill Mastery: Average of the TOPIC masteries (Normalized)
    COALESCE(
        CAST(
            ROUND(AVG(utl.topic_mastery)) AS INTEGER
        ),
        0
    ) AS avg_mastery,
    -- 2. Level: 0-5 based on the newly normalized skill mastery (20 mastery = 1 lvl)
    MIN(
        5,
        CAST(
            COALESCE(AVG(utl.topic_mastery), 0) / 20 AS INTEGER
        )
    ) AS current_level,
    -- 3. Aggregated UI stats
    COALESCE(SUM(utl.mastered_items), 0) AS mastered_subtopics,
    COALESCE(SUM(utl.topic_xp), 0) AS xp_invested,
    -- 4. Unlock state
    COALESCE(usu.is_unlocked, 0) AS is_unlocked
FROM
    skills s
    LEFT JOIN v_user_topic_levels utl ON utl.skill_id = s.id
    LEFT JOIN user_skill_unlocks usu ON usu.skill_id = s.id
    AND usu.user_id = utl.user_id
GROUP BY
    utl.user_id,
    s.id,
    usu.is_unlocked;

-- Alias view so commands.rs can query v_node_mastery consistently
CREATE VIEW IF NOT EXISTS v_node_mastery AS
SELECT
    user_id,
    skill_id AS node_id,
    avg_mastery,
    current_level AS computed_level,
    mastered_subtopics AS mastered_count,
    xp_invested,
    is_unlocked
FROM v_user_skill_levels;

-- ── 5. Supporting Tables (App State) ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS activity_log (
    id TEXT PRIMARY KEY DEFAULT(lower(hex(randomblob (16)))),
    user_id TEXT NOT NULL DEFAULT 'default',
    action TEXT NOT NULL,
    details TEXT,
    xp INTEGER DEFAULT 0,
    node_id TEXT,
    path_id TEXT,
    created_at TEXT NOT NULL DEFAULT(datetime('now'))
);

CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY DEFAULT(lower(hex(randomblob (16)))),
    user_id TEXT NOT NULL DEFAULT 'default',
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT(datetime('now'))
);

CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY DEFAULT(lower(hex(randomblob (16)))),
    user_id TEXT NOT NULL DEFAULT 'default',
    title TEXT NOT NULL,
    description TEXT,
    done INTEGER NOT NULL DEFAULT 0,
    xp_reward INTEGER NOT NULL DEFAULT 50,
    due_date TEXT,
    node_id TEXT,
    subtopic_id TEXT,
    path_id TEXT,
    done_at TEXT,
    created_at TEXT NOT NULL DEFAULT(datetime('now'))
);

CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY DEFAULT(lower(hex(randomblob (16)))),
    user_id TEXT NOT NULL DEFAULT 'default',
    title TEXT NOT NULL,
    description TEXT,
    goal_type TEXT NOT NULL DEFAULT 'xp',
    progress INTEGER NOT NULL DEFAULT 0,
    target INTEGER NOT NULL DEFAULT 100,
    target_date TEXT,
    node_id TEXT,
    path_id TEXT,
    done INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT(datetime('now'))
);

CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY DEFAULT(lower(hex(randomblob (16)))),
    user_id TEXT NOT NULL DEFAULT 'default',
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'backlog',
    xp_reward INTEGER NOT NULL DEFAULT 400,
    repo_url TEXT,
    created_at TEXT NOT NULL DEFAULT(datetime('now'))
);

CREATE TABLE IF NOT EXISTS sleep_logs (
    user_id TEXT NOT NULL DEFAULT 'default',
    log_date TEXT NOT NULL,
    hours REAL NOT NULL,
    quality INTEGER NOT NULL,
    energy INTEGER NOT NULL,
    notes TEXT,
    PRIMARY KEY (user_id, log_date)
);

CREATE TABLE IF NOT EXISTS grind_sessions (
    id TEXT PRIMARY KEY DEFAULT(lower(hex(randomblob (16)))),
    user_id TEXT NOT NULL DEFAULT 'default',
    platform TEXT NOT NULL,
    node_id TEXT,
    path_id TEXT,
    subtopic_id TEXT,
    problems_solved INTEGER NOT NULL DEFAULT 0,
    duration_mins INTEGER NOT NULL DEFAULT 0,
    difficulty TEXT,
    notes TEXT,
    xp_reward INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT(datetime('now'))
);

CREATE TABLE IF NOT EXISTS vault_index (
    path TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    word_count INTEGER NOT NULL DEFAULT 0,
    modified_at TEXT NOT NULL DEFAULT(datetime('now'))
);

CREATE TABLE IF NOT EXISTS skill_milestones (
    user_id TEXT NOT NULL DEFAULT 'default',
    node_id TEXT NOT NULL,
    path_id TEXT NOT NULL,
    level INTEGER NOT NULL,
    badge TEXT NOT NULL,
    earned_at TEXT NOT NULL DEFAULT(datetime('now')),
    PRIMARY KEY (
        user_id,
        node_id,
        path_id,
        level
    )
);

-- ── Tables (CREATE IF NOT EXISTS — no-op on fresh DBs where 001 already ran) ─
-- DUPLICATES REMOVED: These tables were already defined above (lines 29-82)
-- They are identical to the original definitions and have been commented out
-- to prevent schema conflicts and maintain clean migration history.

-- CREATE TABLE IF NOT EXISTS roles (
--     id TEXT PRIMARY KEY,
--     name TEXT NOT NULL,
--     color TEXT NOT NULL,
--     bg_color TEXT NOT NULL,
--     bg_alpha TEXT NOT NULL,
--     sort_order INTEGER DEFAULT 0
-- );
--
-- CREATE TABLE IF NOT EXISTS difficulties (
--     id TEXT PRIMARY KEY,
--     label TEXT NOT NULL,
--     short_label TEXT NOT NULL,
--     sort_order INTEGER DEFAULT 0
-- );
--
-- CREATE TABLE IF NOT EXISTS skills (
--     id TEXT PRIMARY KEY,
--     difficulty_id TEXT REFERENCES difficulties (id),
--     name TEXT NOT NULL,
--     icon TEXT NOT NULL,
--     description TEXT
-- );
--
-- CREATE TABLE IF NOT EXISTS skill_roles (
--     skill_id TEXT REFERENCES skills (id) ON DELETE CASCADE,
--     role_id TEXT REFERENCES roles (id) ON DELETE CASCADE,
--     PRIMARY KEY (skill_id, role_id)
-- );
--
-- CREATE TABLE IF NOT EXISTS skill_prerequisites (
--     skill_id TEXT REFERENCES skills (id) ON DELETE CASCADE,
--     prerequisite_id TEXT REFERENCES skills (id) ON DELETE CASCADE,
--     PRIMARY KEY (skill_id, prerequisite_id)
-- );
--
-- CREATE TABLE IF NOT EXISTS topics (
--     id INTEGER PRIMARY KEY AUTOINCREMENT,
--     skill_id TEXT REFERENCES skills (id) ON DELETE CASCADE,
--     header TEXT NOT NULL,
--     sort_order INTEGER DEFAULT 0
-- );
--
-- CREATE TABLE IF NOT EXISTS topic_items (
--     id INTEGER PRIMARY KEY AUTOINCREMENT,
--     topic_id INTEGER REFERENCES topics (id) ON DELETE CASCADE,
--     content TEXT NOT NULL,
--     xp_value INTEGER DEFAULT 80,
--     sort_order INTEGER DEFAULT 0
-- );
--
-- CREATE TABLE IF NOT EXISTS user_item_mastery (
--     user_id TEXT DEFAULT 'default',
--     item_id INTEGER REFERENCES topic_items (id) ON DELETE CASCADE,
--     mastery INTEGER DEFAULT 0 CHECK (
--         mastery >= 0
--         AND mastery <= 100
--     ),
--     xp_invested INTEGER DEFAULT 0,
--     practice_count INTEGER DEFAULT 0,
--     correct_count INTEGER DEFAULT 0,
--     last_practiced TEXT,
--     PRIMARY KEY (user_id, item_id)
-- );
--
-- CREATE TABLE IF NOT EXISTS user_skill_unlocks (
--     user_id TEXT DEFAULT 'default',
--     skill_id TEXT REFERENCES skills (id) ON DELETE CASCADE,
--     is_unlocked INTEGER DEFAULT 0,
--     unlocked_at TEXT DEFAULT(datetime('now')),
--     PRIMARY KEY (user_id, skill_id)
-- );

-- ── Views (DROP + CREATE to ensure correct definitions) ──────────────────────

DROP VIEW IF EXISTS v_node_mastery;

DROP VIEW IF EXISTS v_user_skill_levels;

DROP VIEW IF EXISTS v_user_topic_levels;

CREATE VIEW IF NOT EXISTS v_user_topic_levels AS
SELECT
    COALESCE(uim.user_id, 'default') AS user_id,
    t.skill_id,
    t.id AS topic_id,
    COALESCE(
        CAST(
            ROUND(AVG(COALESCE(uim.mastery, 0))) AS INTEGER
        ),
        0
    ) AS topic_mastery,
    SUM(
        CASE
            WHEN uim.mastery >= 80 THEN 1
            ELSE 0
        END
    ) AS mastered_items,
    COALESCE(SUM(uim.xp_invested), 0) AS topic_xp
FROM
    topics t
    LEFT JOIN topic_items ti ON ti.topic_id = t.id
    LEFT JOIN user_item_mastery uim ON uim.item_id = ti.id
GROUP BY
    COALESCE(uim.user_id, 'default'),
    t.skill_id,
    t.id;

CREATE VIEW IF NOT EXISTS v_user_skill_levels AS
SELECT
    utl.user_id,
    s.id AS skill_id,
    COALESCE(
        CAST(
            ROUND(AVG(utl.topic_mastery)) AS INTEGER
        ),
        0
    ) AS avg_mastery,
    MIN(
        5,
        CAST(
            COALESCE(AVG(utl.topic_mastery), 0) / 20 AS INTEGER
        )
    ) AS current_level,
    COALESCE(SUM(utl.mastered_items), 0) AS mastered_subtopics,
    COALESCE(SUM(utl.topic_xp), 0) AS xp_invested,
    COALESCE(usu.is_unlocked, 0) AS is_unlocked
FROM
    skills s
    LEFT JOIN v_user_topic_levels utl ON utl.skill_id = s.id
    LEFT JOIN user_skill_unlocks usu ON usu.skill_id = s.id
    AND usu.user_id = utl.user_id
GROUP BY
    utl.user_id,
    s.id,
    usu.is_unlocked;

CREATE VIEW IF NOT EXISTS v_node_mastery AS
SELECT
    user_id,
    skill_id AS node_id,
    avg_mastery,
    current_level AS computed_level,
    mastered_subtopics AS mastered_count,
    xp_invested,
    is_unlocked
FROM v_user_skill_levels;