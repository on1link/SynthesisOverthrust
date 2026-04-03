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

INSERT
    OR IGNORE INTO users (id, name, username)
VALUES (
        'default',
        'Learner',
        'Learner'
    );

CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT(datetime('now'))
);

INSERT
    OR IGNORE INTO config (key, value)
VALUES ('vault_path', ''),
    ('theme', 'dark'),
    (
        'ollama_url',
        'http://localhost:11434'
    ),
    ('ollama_model', 'llama3');

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

-- =============================================================
-- SynthesisOverthrust — MLE Skill Catalog Inserts (Tier F & 1T)
-- =============================================================

-- ── 1. Roles & Difficulties ───────────────────────────────────────────────────

INSERT
    OR IGNORE INTO roles (
        id,
        name,
        color,
        bg_color,
        bg_alpha,
        sort_order
    )
VALUES (
        'mle',
        'Machine Learning Engineer',
        '#4A90E2',
        '#4A90E2',
        '0.15',
        1
    );

INSERT
    OR IGNORE INTO difficulties (
        id,
        label,
        short_label,
        sort_order
    )
VALUES (
        'tier_f',
        'Foundational',
        'F',
        1
    ),
    (
        'tier_1t',
        'Tier 1 / Entry',
        '1T',
        2
    ),
    (
        'tier_2t',
        'Tier 2 / Semi-senior',
        '2T',
        3
    );

-- ── 2. Skills (Nodes) ─────────────────────────────────────────────────────────

INSERT
    OR IGNORE INTO skills (
        id,
        difficulty_id,
        name,
        icon,
        description
    )
VALUES
    -- Tier F
    ('skill_calculus',       'tier_f',  'Calculus',                '∫',  'Max Level: 10 | Prerequisites: None'),
    ('skill_linalg',         'tier_f',  'Linear Algebra',          '⊹',  'Max Level: 10 | Prerequisites: Calculus Lv 3'),
    ('skill_stats',          'tier_f',  'Statistics',              '📊', 'Max Level: 10 | Prerequisites: Calculus Lv 5'),
    ('skill_discrete_math',  'tier_f',  'Discrete Mathematics',    '🔢', 'Max Level: 10 | Prerequisites: None'),
    ('skill_python',         'tier_f',  'Python',                  '🐍', 'Max Level: 10 | Prerequisites: None'),
    ('skill_sql',            'tier_f',  'SQL',                     '🗄', 'Max Level: 10 | Prerequisites: Discrete Mathematics Lv 5'),
    ('skill_dsa',            'tier_f',  'DSA',                     '🌲', 'Max Level: 10 | Prerequisites: Python Lv 3 OR Discrete Math Lv 4'),
    ('skill_systems',        'tier_f',  'Systems Fundamentals',    '⚙',  'Max Level: 10 | Prerequisites: None'),
    -- Tier 1T
    ('skill_tech_comm',      'tier_1t', 'Technical Communication', '📝', 'Max Level: 5 | Prerequisites: English/German Lv 7'),
    ('skill_nosql',          'tier_1t', 'NoSQL Databases',         '🗃', 'Max Level: 10 | Prerequisites: Systems Lv 5, SQL Lv 5'),
    ('skill_experimentation','tier_1t', 'Experimentation',         '🧪', 'Max Level: 10 | Prerequisites: Statistics Lv 7');

-- Link all these skills to the MLE role
INSERT
    OR IGNORE INTO skill_roles (skill_id, role_id)
VALUES ('skill_calculus', 'mle'),
    ('skill_linalg', 'mle'),
    ('skill_stats', 'mle'),
    ('skill_discrete_math', 'mle'),
    ('skill_python', 'mle'),
    ('skill_sql', 'mle'),
    ('skill_dsa', 'mle'),
    ('skill_systems', 'mle'),
    ('skill_tech_comm', 'mle'),
    ('skill_nosql', 'mle'),
    (
        'skill_experimentation',
        'mle'
    );

-- Define Dependencies (Prerequisites)
INSERT
    OR IGNORE INTO skill_prerequisites (skill_id, prerequisite_id)
VALUES (
        'skill_linalg',
        'skill_calculus'
    ),
    (
        'skill_stats',
        'skill_calculus'
    ),
    (
        'skill_sql',
        'skill_discrete_math'
    ),
    ('skill_dsa', 'skill_python'),
    (
        'skill_nosql',
        'skill_systems'
    ),
    ('skill_nosql', 'skill_sql'),
    (
        'skill_experimentation',
        'skill_stats'
    );

-- ── 3. Topics & Items ─────────────────────────────────────────────────────────

-- ------------------------------------------------------------------------------
-- SKILL: CALCULUS
-- ------------------------------------------------------------------------------
INSERT
    OR IGNORE INTO topics (
        id,
        skill_id,
        header,
        sort_order
    )
VALUES (
        101,
        'skill_calculus',
        'Limits & Continuity',
        1
    ),
    (
        102,
        'skill_calculus',
        'Differentiation',
        2
    ),
    (
        103,
        'skill_calculus',
        'Matrix Calculus',
        3
    ),
    (
        104,
        'skill_calculus',
        'Vector Calculus',
        4
    ),
    (
        105,
        'skill_calculus',
        'Optimization',
        5
    );

INSERT
    OR IGNORE INTO topic_items (topic_id, content, sort_order)
VALUES (
        101,
        'Limit definition & evaluation',
        1
    ),
    (
        101,
        'Continuity & differentiability',
        2
    ),
    (101, 'L''Hôpital''s rule', 3),
    (
        102,
        'Derivatives & chain rule',
        1
    ),
    (
        102,
        'Why chain rule = backpropagation',
        2
    ),
    (
        102,
        'Automatic Differentiation (Forward vs. Reverse mode)',
        3
    ),
    (
        103,
        'Numerator/Denominator layout conventions',
        1
    ),
    (
        103,
        'Gradients of traces and determinants',
        2
    ),
    (104, 'Jacobian & Hessian', 1),
    (
        104,
        'Hessian in model sensitivity analysis',
        2
    ),
    (
        105,
        'Gradient descent mechanics',
        1
    ),
    (
        105,
        'Lagrange multipliers (constrained optimization)',
        2
    );

-- ------------------------------------------------------------------------------
-- SKILL: LINEAR ALGEBRA
-- ------------------------------------------------------------------------------
INSERT
    OR IGNORE INTO topics (
        id,
        skill_id,
        header,
        sort_order
    )
VALUES (
        201,
        'skill_linalg',
        'Vectors & Spaces',
        1
    ),
    (
        202,
        'skill_linalg',
        'Matrix Operations',
        2
    ),
    (
        203,
        'skill_linalg',
        'Eigenstructure',
        3
    ),
    (
        204,
        'skill_linalg',
        'Tensors',
        4
    );

INSERT
    OR IGNORE INTO topic_items (topic_id, content, sort_order)
VALUES (
        201,
        'Vector operations, dot & cross product',
        1
    ),
    (
        201,
        'Linear independence & span',
        2
    ),
    (
        202,
        'Broadcasting mechanics',
        1
    ),
    (
        202,
        'Batch operations (tensors as generalized matrices)',
        2
    ),
    (
        203,
        'Eigenvalues & eigenvectors',
        1
    ),
    (
        203,
        'SVD (Singular Value Decomposition)',
        2
    ),
    (203, 'PCA from SVD', 3),
    (
        204,
        'Contraction & Einstein notation',
        1
    );

-- ------------------------------------------------------------------------------
-- SKILL: STATISTICS
-- ------------------------------------------------------------------------------
INSERT
    OR IGNORE INTO topics (
        id,
        skill_id,
        header,
        sort_order
    )
VALUES (
        301,
        'skill_stats',
        'Probability',
        1
    ),
    (
        302,
        'skill_stats',
        'Inferential Statistics',
        2
    ),
    (
        303,
        'skill_stats',
        'Bayesian Statistics Intro',
        3
    ),
    (
        304,
        'skill_stats',
        'Statistical Learning Theory',
        4
    );

INSERT
    OR IGNORE INTO topic_items (topic_id, content, sort_order)
VALUES (
        301,
        'Random variables & distributions',
        1
    ),
    (301, 'Bayes'' theorem', 2),
    (
        301,
        'Prior, likelihood, posterior intro',
        3
    ),
    (
        302,
        'Hypothesis testing (Null vs Alternative)',
        1
    ),
    (
        302,
        'Central Limit Theorem (CLT)',
        2
    ),
    (
        303,
        'Prior & posterior distributions',
        1
    ),
    (303, 'Conjugate priors', 2),
    (
        304,
        'Bias-variance tradeoff',
        1
    ),
    (
        304,
        'MLE (Maximum Likelihood Estimation) & MAP',
        2
    );

-- ------------------------------------------------------------------------------
-- SKILL: PYTHON
-- ------------------------------------------------------------------------------
INSERT
    OR IGNORE INTO topics (
        id,
        skill_id,
        header,
        sort_order
    )
VALUES (
        401,
        'skill_python',
        'Advanced OOP & Structural Typing',
        1
    ),
    (
        402,
        'skill_python',
        'Functional Patterns',
        2
    ),
    (
        403,
        'skill_python',
        'Concurrency & Parallelism',
        3
    ),
    (
        404,
        'skill_python',
        'Essential ML/Data Ecosystem',
        4
    );

INSERT
    OR IGNORE INTO topic_items (topic_id, content, sort_order)
VALUES (
        401,
        'Dunder methods (Data model)',
        1
    ),
    (
        401,
        'Protocols (PEP 544 - Static Duck Typing)',
        2
    ),
    (
        402,
        'Lambdas & decorators',
        1
    ),
    (
        402,
        'Itertools & Functools',
        2
    ),
    (
        403,
        'AsyncIO fundamentals',
        1
    ),
    (
        403,
        'Threading vs. Multiprocessing vs. Subprocesses',
        2
    ),
    (
        404,
        'Data Analysis: pandas, polars',
        1
    ),
    (
        404,
        'Model Frameworks: scikit-learn, PyTorch',
        2
    );

-- ------------------------------------------------------------------------------
-- SKILL: SQL
-- ------------------------------------------------------------------------------
INSERT
    OR IGNORE INTO topics (
        id,
        skill_id,
        header,
        sort_order
    )
VALUES (
        501,
        'skill_sql',
        'Window Functions',
        1
    ),
    (
        502,
        'skill_sql',
        'Performance & Design',
        2
    ),
    (
        503,
        'skill_sql',
        'Advanced Data Handling for ML',
        3
    );

INSERT
    OR IGNORE INTO topic_items (topic_id, content, sort_order)
VALUES (
        501,
        'ROW_NUMBER, RANK, DENSE_RANK',
        1
    ),
    (
        501,
        'LAG / LEAD (Time-series feature engineering)',
        2
    ),
    (
        502,
        'Query execution plans (EXPLAIN ANALYZE)',
        1
    ),
    (
        502,
        'Indexing strategies (B-Tree, Hash, GIN for JSONB)',
        2
    ),
    (
        503,
        'Vector SQL (pgvector, ANN search)',
        1
    ),
    (
        503,
        'Semi-structured data (JSONB, VARIANT)',
        2
    );

-- ------------------------------------------------------------------------------
-- SKILL: SYSTEM FUNDAMENTALS
-- ------------------------------------------------------------------------------
INSERT
    OR IGNORE INTO topics (
        id,
        skill_id,
        header,
        sort_order
    )
VALUES (
        601,
        'skill_systems',
        'Memory Architecture',
        1
    ),
    (
        602,
        'skill_systems',
        'Hardware Acceleration (MLE Focus)',
        2
    );

INSERT
    OR IGNORE INTO topic_items (topic_id, content, sort_order)
VALUES (601, 'Stack vs heap', 1),
    (
        601,
        'Cache hierarchy (L1/L2/L3, locality)',
        2
    ),
    (
        602,
        'CPU SIMD instructions (AVX, SSE)',
        1
    ),
    (
        602,
        'GPU Architecture basics (SMs, Global vs Shared Memory)',
        2
    );

-- ------------------------------------------------------------------------------
-- SKILL: NOSQL DATABASES (Tier 1T)
-- ------------------------------------------------------------------------------
INSERT
    OR IGNORE INTO topics (
        id,
        skill_id,
        header,
        sort_order
    )
VALUES (
        701,
        'skill_nosql',
        'Distributed Systems Theory',
        1
    ),
    (
        702,
        'skill_nosql',
        'Vector Databases (MLE Priority)',
        2
    );

INSERT
    OR IGNORE INTO topic_items (topic_id, content, sort_order)
VALUES (
        701,
        'CAP Theorem (Consistency, Availability, Partition Tolerance)',
        1
    ),
    (
        701,
        'Replication strategies (Leader-follower, Multi-leader, Leaderless)',
        2
    ),
    (
        702,
        'Vector Indexing (HNSW, IVF-Flat, PQ)',
        1
    ),
    (
        702,
        'Distance metrics (Cosine, Euclidean, Dot Product)',
        2
    ),
    (
        702,
        'Integration with LLM frameworks (LangChain, LlamaIndex) for RAG',
        3
    );

-- ------------------------------------------------------------------------------
-- SKILL: EXPERIMENTATION (Tier 1T)
-- ------------------------------------------------------------------------------
INSERT
    OR IGNORE INTO topics (
        id,
        skill_id,
        header,
        sort_order
    )
VALUES (
        801,
        'skill_experimentation',
        'A/B Testing Foundations',
        1
    ),
    (
        802,
        'skill_experimentation',
        'Sequential & Adaptive Testing',
        2
    );

INSERT
    OR IGNORE INTO topic_items (topic_id, content, sort_order)
VALUES (
        801,
        'Experiment design (units of randomization, metrics)',
        1
    ),
    (
        801,
        'Statistical power & sample size calculation',
        2
    ),
    (
        802,
        'Multi-armed bandits (Epsilon-greedy, UCB, Thompson sampling)',
        1
    ),
    (
        802,
        'Contextual Bandits (Exploration vs. Exploitation in RecSys)',
        2
    );