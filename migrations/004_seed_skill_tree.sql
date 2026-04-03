-- =============================================================
-- SynthesisOverthrust — migrations/004_seed_skill_tree.sql
-- Ensures the new skill-tree schema (roles, difficulties, skills,
-- skill_roles, skill_prerequisites, topics, topic_items) exists
-- and is seeded with the MLE catalog.
-- Safe to run on both fresh DBs and DBs migrated from old schema.
-- =============================================================

-- ── Tables (CREATE IF NOT EXISTS — no-op on fresh DBs where 001 already ran) ─

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

CREATE TABLE IF NOT EXISTS skill_roles (
    skill_id TEXT REFERENCES skills (id) ON DELETE CASCADE,
    role_id TEXT REFERENCES roles (id) ON DELETE CASCADE,
    PRIMARY KEY (skill_id, role_id)
);

CREATE TABLE IF NOT EXISTS skill_prerequisites (
    skill_id TEXT REFERENCES skills (id) ON DELETE CASCADE,
    prerequisite_id TEXT REFERENCES skills (id) ON DELETE CASCADE,
    PRIMARY KEY (skill_id, prerequisite_id)
);

CREATE TABLE IF NOT EXISTS topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    skill_id TEXT REFERENCES skills (id) ON DELETE CASCADE,
    header TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS topic_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER REFERENCES topics (id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    xp_value INTEGER DEFAULT 80,
    sort_order INTEGER DEFAULT 0
);

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

CREATE TABLE IF NOT EXISTS user_skill_unlocks (
    user_id TEXT DEFAULT 'default',
    skill_id TEXT REFERENCES skills (id) ON DELETE CASCADE,
    is_unlocked INTEGER DEFAULT 0,
    unlocked_at TEXT DEFAULT(datetime('now')),
    PRIMARY KEY (user_id, skill_id)
);

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

-- ══════════════════════════════════════════════════════════════════════════════
-- SEED DATA — MLE Skill Catalog (Tier F, 1T, 2T)
-- ══════════════════════════════════════════════════════════════════════════════

-- ── 1. Roles & Difficulties ─────────────────────────────────────────────────

INSERT
    OR
REPLACE INTO
    roles (
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
    OR
REPLACE INTO
    difficulties (
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

-- ── 2. Skills (Nodes) ──────────────────────────────────────────────────────

INSERT INTO
    skills (
        id,
        difficulty_id,
        name,
        icon,
        description
    )
VALUES (
        'skill_calculus',
        'tier_f',
        'Calculus',
        '∫',
        'Max Level: 10 | Prerequisites: None'
    ),
    (
        'skill_linalg',
        'tier_f',
        'Linear Algebra',
        '⊹',
        'Max Level: 10 | Prerequisites: Calculus Lv 3'
    ),
    (
        'skill_stats',
        'tier_f',
        'Statistics',
        '📊',
        'Max Level: 10 | Prerequisites: Calculus Lv 5'
    ),
    (
        'skill_discrete_math',
        'tier_f',
        'Discrete Mathematics',
        '🔢',
        'Max Level: 10 | Prerequisites: None'
    ),
    (
        'skill_python',
        'tier_f',
        'Python',
        '🐍',
        'Max Level: 10 | Prerequisites: None'
    ),
    (
        'skill_sql',
        'tier_f',
        'SQL',
        '🗄',
        'Max Level: 10 | Prerequisites: Discrete Mathematics Lv 5'
    ),
    (
        'skill_dsa',
        'tier_f',
        'DSA',
        '🌲',
        'Max Level: 10 | Prerequisites: Python Lv 3 OR Discrete Math Lv 4'
    ),
    (
        'skill_systems',
        'tier_f',
        'Systems Fundamentals',
        '⚙',
        'Max Level: 10 | Prerequisites: None'
    ),
    (
        'skill_tech_comm',
        'tier_1t',
        'Technical Communication',
        '📝',
        'Max Level: 5 | Prerequisites: English/German Lv 7'
    ),
    (
        'skill_nosql',
        'tier_1t',
        'NoSQL Databases',
        '🗃',
        'Max Level: 10 | Prerequisites: Systems Lv 5, SQL Lv 5'
    ),
    (
        'skill_experimentation',
        'tier_1t',
        'Experimentation',
        '🧪',
        'Max Level: 10 | Prerequisites: Statistics Lv 7'
    ) ON CONFLICT (id) DO
UPDATE
SET
    difficulty_id = excluded.difficulty_id,
    name = excluded.name,
    icon = excluded.icon,
    description = excluded.description;

-- ── 3. Skill ↔ Role mappings ────────────────────────────────────────────────

INSERT
    OR
REPLACE INTO
    skill_roles (skill_id, role_id)
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

-- ── 4. Prerequisites ────────────────────────────────────────────────────────

INSERT
    OR
REPLACE INTO
    skill_prerequisites (skill_id, prerequisite_id)
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

-- ── 5. Topics & Items ───────────────────────────────────────────────────────

-- Remove old auto-increment topic_items from 001 (ids < 1000) that will be
-- replaced by explicit-id rows below.  topic rows keep their original ids.
DELETE FROM topic_items WHERE id < 1000;

-- CALCULUS
INSERT INTO
    topics (
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
    ) ON CONFLICT (id) DO
UPDATE
SET
    skill_id = excluded.skill_id,
    header = excluded.header,
    sort_order = excluded.sort_order;

INSERT INTO
    topic_items (
        id,
        topic_id,
        content,
        sort_order
    )
VALUES (
        1001,
        101,
        'Limit definition & evaluation',
        1
    ),
    (
        1002,
        101,
        'Continuity & differentiability',
        2
    ),
    (
        1003,
        101,
        'L''Hôpital''s rule',
        3
    ),
    (
        1004,
        102,
        'Derivatives & chain rule',
        1
    ),
    (
        1005,
        102,
        'Why chain rule = backpropagation',
        2
    ),
    (
        1006,
        102,
        'Automatic Differentiation (Forward vs. Reverse mode)',
        3
    ),
    (
        1007,
        103,
        'Numerator/Denominator layout conventions',
        1
    ),
    (
        1008,
        103,
        'Gradients of traces and determinants',
        2
    ),
    (
        1009,
        104,
        'Jacobian & Hessian',
        1
    ),
    (
        1010,
        104,
        'Hessian in model sensitivity analysis',
        2
    ),
    (
        1011,
        105,
        'Gradient descent mechanics',
        1
    ),
    (
        1012,
        105,
        'Lagrange multipliers (constrained optimization)',
        2
    ) ON CONFLICT (id) DO
UPDATE
SET
    topic_id = excluded.topic_id,
    content = excluded.content,
    sort_order = excluded.sort_order;

-- LINEAR ALGEBRA
INSERT INTO
    topics (
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
    ) ON CONFLICT (id) DO
UPDATE
SET
    skill_id = excluded.skill_id,
    header = excluded.header,
    sort_order = excluded.sort_order;

INSERT INTO
    topic_items (
        id,
        topic_id,
        content,
        sort_order
    )
VALUES (
        2001,
        201,
        'Vector operations, dot & cross product',
        1
    ),
    (
        2002,
        201,
        'Linear independence & span',
        2
    ),
    (
        2003,
        202,
        'Broadcasting mechanics',
        1
    ),
    (
        2004,
        202,
        'Batch operations (tensors as generalized matrices)',
        2
    ),
    (
        2005,
        203,
        'Eigenvalues & eigenvectors',
        1
    ),
    (
        2006,
        203,
        'SVD (Singular Value Decomposition)',
        2
    ),
    (2007, 203, 'PCA from SVD', 3),
    (
        2008,
        204,
        'Contraction & Einstein notation',
        1
    ) ON CONFLICT (id) DO
UPDATE
SET
    topic_id = excluded.topic_id,
    content = excluded.content,
    sort_order = excluded.sort_order;

-- STATISTICS
INSERT INTO
    topics (
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
    ) ON CONFLICT (id) DO
UPDATE
SET
    skill_id = excluded.skill_id,
    header = excluded.header,
    sort_order = excluded.sort_order;

INSERT INTO
    topic_items (
        id,
        topic_id,
        content,
        sort_order
    )
VALUES (
        3001,
        301,
        'Random variables & distributions',
        1
    ),
    (
        3002,
        301,
        'Bayes'' theorem',
        2
    ),
    (
        3003,
        301,
        'Prior, likelihood, posterior intro',
        3
    ),
    (
        3004,
        302,
        'Hypothesis testing (Null vs Alternative)',
        1
    ),
    (
        3005,
        302,
        'Central Limit Theorem (CLT)',
        2
    ),
    (
        3006,
        303,
        'Prior & posterior distributions',
        1
    ),
    (
        3007,
        303,
        'Conjugate priors',
        2
    ),
    (
        3008,
        304,
        'Bias-variance tradeoff',
        1
    ),
    (
        3009,
        304,
        'MLE (Maximum Likelihood Estimation) & MAP',
        2
    ) ON CONFLICT (id) DO
UPDATE
SET
    topic_id = excluded.topic_id,
    content = excluded.content,
    sort_order = excluded.sort_order;

-- PYTHON
INSERT INTO
    topics (
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
    ) ON CONFLICT (id) DO
UPDATE
SET
    skill_id = excluded.skill_id,
    header = excluded.header,
    sort_order = excluded.sort_order;

INSERT INTO
    topic_items (
        id,
        topic_id,
        content,
        sort_order
    )
VALUES (
        4001,
        401,
        'Dunder methods (Data model)',
        1
    ),
    (
        4002,
        401,
        'Protocols (PEP 544 - Static Duck Typing)',
        2
    ),
    (
        4003,
        402,
        'Lambdas & decorators',
        1
    ),
    (
        4004,
        402,
        'Itertools & Functools',
        2
    ),
    (
        4005,
        403,
        'AsyncIO fundamentals',
        1
    ),
    (
        4006,
        403,
        'Threading vs. Multiprocessing vs. Subprocesses',
        2
    ),
    (
        4007,
        404,
        'Data Analysis: pandas, polars',
        1
    ),
    (
        4008,
        404,
        'Model Frameworks: scikit-learn, PyTorch',
        2
    ) ON CONFLICT (id) DO
UPDATE
SET
    topic_id = excluded.topic_id,
    content = excluded.content,
    sort_order = excluded.sort_order;

-- SQL
INSERT INTO
    topics (
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
    ) ON CONFLICT (id) DO
UPDATE
SET
    skill_id = excluded.skill_id,
    header = excluded.header,
    sort_order = excluded.sort_order;

INSERT INTO
    topic_items (
        id,
        topic_id,
        content,
        sort_order
    )
VALUES (
        5001,
        501,
        'ROW_NUMBER, RANK, DENSE_RANK',
        1
    ),
    (
        5002,
        501,
        'LAG / LEAD (Time-series feature engineering)',
        2
    ),
    (
        5003,
        502,
        'Query execution plans (EXPLAIN ANALYZE)',
        1
    ),
    (
        5004,
        502,
        'Indexing strategies (B-Tree, Hash, GIN for JSONB)',
        2
    ),
    (
        5005,
        503,
        'Vector SQL (pgvector, ANN search)',
        1
    ),
    (
        5006,
        503,
        'Semi-structured data (JSONB, VARIANT)',
        2
    ) ON CONFLICT (id) DO
UPDATE
SET
    topic_id = excluded.topic_id,
    content = excluded.content,
    sort_order = excluded.sort_order;

-- SYSTEMS FUNDAMENTALS
INSERT INTO
    topics (
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
    ) ON CONFLICT (id) DO
UPDATE
SET
    skill_id = excluded.skill_id,
    header = excluded.header,
    sort_order = excluded.sort_order;

INSERT INTO
    topic_items (
        id,
        topic_id,
        content,
        sort_order
    )
VALUES (6001, 601, 'Stack vs heap', 1),
    (
        6002,
        601,
        'Cache hierarchy (L1/L2/L3, locality)',
        2
    ),
    (
        6003,
        602,
        'CPU SIMD instructions (AVX, SSE)',
        1
    ),
    (
        6004,
        602,
        'GPU Architecture basics (SMs, Global vs Shared Memory)',
        2
    ) ON CONFLICT (id) DO
UPDATE
SET
    topic_id = excluded.topic_id,
    content = excluded.content,
    sort_order = excluded.sort_order;

-- NOSQL DATABASES (Tier 1T)
INSERT INTO
    topics (
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
    ) ON CONFLICT (id) DO
UPDATE
SET
    skill_id = excluded.skill_id,
    header = excluded.header,
    sort_order = excluded.sort_order;

INSERT INTO
    topic_items (
        id,
        topic_id,
        content,
        sort_order
    )
VALUES (
        7001,
        701,
        'CAP Theorem (Consistency, Availability, Partition Tolerance)',
        1
    ),
    (
        7002,
        701,
        'Replication strategies (Leader-follower, Multi-leader, Leaderless)',
        2
    ),
    (
        7003,
        702,
        'Vector Indexing (HNSW, IVF-Flat, PQ)',
        1
    ),
    (
        7004,
        702,
        'Distance metrics (Cosine, Euclidean, Dot Product)',
        2
    ),
    (
        7005,
        702,
        'Integration with LLM frameworks (LangChain, LlamaIndex) for RAG',
        3
    ) ON CONFLICT (id) DO
UPDATE
SET
    topic_id = excluded.topic_id,
    content = excluded.content,
    sort_order = excluded.sort_order;

-- EXPERIMENTATION (Tier 1T)
INSERT INTO
    topics (
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
    ) ON CONFLICT (id) DO
UPDATE
SET
    skill_id = excluded.skill_id,
    header = excluded.header,
    sort_order = excluded.sort_order;

INSERT INTO
    topic_items (
        id,
        topic_id,
        content,
        sort_order
    )
VALUES (
        8001,
        801,
        'Experiment design (units of randomization, metrics)',
        1
    ),
    (
        8002,
        801,
        'Statistical power & sample size calculation',
        2
    ),
    (
        8003,
        802,
        'Multi-armed bandits (Epsilon-greedy, UCB, Thompson sampling)',
        1
    ),
    (
        8004,
        802,
        'Contextual Bandits (Exploration vs. Exploitation in RecSys)',
        2
    ) ON CONFLICT (id) DO
UPDATE
SET
    topic_id = excluded.topic_id,
    content = excluded.content,
    sort_order = excluded.sort_order;

-- =====================================================================
-- SynthesisOverthrust — MLE Skill Catalog Inserts (Tiers 2, 2.5, 3, 4)
-- =====================================================================

-- ── 1. Difficulties (Tiers) ───────────────────────────────────────────────────

INSERT
    OR IGNORE INTO difficulties (
        id,
        label,
        short_label,
        sort_order
    )
VALUES (
        'tier_2t',
        'Tier 2 / Middle',
        '2T',
        3
    ),
    (
        'tier_2_5t',
        'Tier 2.5 / Senior',
        '2.5T',
        4
    ),
    (
        'tier_3t',
        'Tier 3 / Staff',
        '3T',
        5
    ),
    (
        'tier_4t',
        'Tier 4 / Principal',
        '4T',
        6
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
    -- Tier 2T
    (
        'skill_model_serving',
        'tier_2t',
        'Model Serving & Optimization',
        'server',
        'Max Level: 10 | Prerequisites: Python Lv 6, Systems Lv 5'
    ),
    (
        'skill_deep_learning',
        'tier_2t',
        'Deep Learning Foundations',
        'cpu',
        'Max Level: 10 | Prerequisites: Calculus Lv 7, Linear Algebra Lv 6'
    ),

-- Tier 2.5T
(
    'skill_genai_llm',
    'tier_2_5t',
    'Generative AI & LLMs',
    'message-square',
    'Max Level: 10 | Prerequisites: Deep Learning Lv 8'
),

-- Tier 3T
(
    'skill_adv_pytorch',
    'tier_3t',
    'Advanced PyTorch & Perf. Engineering',
    'zap',
    'Max Level: 10 | Prerequisites: Math Optimization Lv 7, Systems Lv 7, Python Lv 9'
),
(
    'skill_ml_systems',
    'tier_3t',
    'ML Systems',
    'layers',
    'Max Level: 10 | Prerequisites: Model Serving Lv 8'
),

-- Tier 4T
(
    'skill_pretraining_scale',
    'tier_4t',
    'Pretraining at Scale (Research)',
    'globe',
    'Max Level: 10 | Prerequisites: Adv PyTorch Lv 8, ML Systems Lv 9'
);

-- Link all these skills to the MLE role
INSERT
    OR IGNORE INTO skill_roles (skill_id, role_id)
VALUES ('skill_model_serving', 'mle'),
    ('skill_deep_learning', 'mle'),
    ('skill_genai_llm', 'mle'),
    ('skill_adv_pytorch', 'mle'),
    ('skill_ml_systems', 'mle'),
    (
        'skill_pretraining_scale',
        'mle'
    );

-- Define Dependencies (Prerequisites)
INSERT
    OR IGNORE INTO skill_prerequisites (skill_id, prerequisite_id)
VALUES (
        'skill_genai_llm',
        'skill_deep_learning'
    ),
    (
        'skill_ml_systems',
        'skill_model_serving'
    ),
    (
        'skill_adv_pytorch',
        'skill_deep_learning'
    ),
    (
        'skill_pretraining_scale',
        'skill_adv_pytorch'
    ),
    (
        'skill_pretraining_scale',
        'skill_ml_systems'
    );

-- ── 3. Topics & Items ─────────────────────────────────────────────────────────

-- ------------------------------------------------------------------------------
-- SKILL: DEEP LEARNING FOUNDATIONS (Tier 2T)
-- ------------------------------------------------------------------------------
INSERT
    OR IGNORE INTO topics (
        id,
        skill_id,
        header,
        sort_order
    )
VALUES (
        901,
        'skill_deep_learning',
        'DL Frameworks',
        1
    ),
    (
        902,
        'skill_deep_learning',
        'Model Adaptation & Compression',
        2
    );

INSERT
    OR IGNORE INTO topic_items (topic_id, content, sort_order)
VALUES (
        901,
        'PyTorch (tensor ops, autograd, nn.Module, DataLoader, DDP/FSDP)',
        1
    ),
    (
        901,
        'TensorFlow / Keras (sequential/functional API, tf.data, TF Lite)',
        2
    ),
    (
        902,
        'Transfer learning & fine-tuning strategies',
        1
    ),
    (
        902,
        'Knowledge distillation',
        2
    ),
    (
        902,
        'LoRA, adapters (PEFT)',
        3
    ),
    (
        902,
        'Quantization & pruning (GPTQ, QAT, GGUF)',
        4
    );

-- ------------------------------------------------------------------------------
-- SKILL: MODEL SERVING & OPTIMIZATION (Tier 2T)
-- ------------------------------------------------------------------------------
INSERT
    OR IGNORE INTO topics (
        id,
        skill_id,
        header,
        sort_order
    )
VALUES (
        1001,
        'skill_model_serving',
        'Inference Engines',
        1
    ),
    (
        1002,
        'skill_model_serving',
        'Model Compilation',
        2
    );

INSERT
    OR IGNORE INTO topic_items (topic_id, content, sort_order)
VALUES (
        1001,
        'Triton Inference Server architecture',
        1
    ),
    (
        1001,
        'vLLM (PagedAttention, continuous batching)',
        2
    ),
    (
        1001,
        'TensorRT optimizations',
        3
    ),
    (
        1002,
        'ONNX and ONNX Runtime',
        1
    ),
    (
        1002,
        'TorchScript and JIT compilation',
        2
    );

-- ------------------------------------------------------------------------------
-- SKILL: GENERATIVE AI & LLMs (Tier 2.5T)
-- ------------------------------------------------------------------------------
INSERT
    OR IGNORE INTO topics (
        id,
        skill_id,
        header,
        sort_order
    )
VALUES (
        1101,
        'skill_genai_llm',
        'Prompt Engineering',
        1
    ),
    (
        1102,
        'skill_genai_llm',
        'RAG & Vector Systems',
        2
    ),
    (
        1103,
        'skill_genai_llm',
        'LLM Inference & Serving',
        3
    );

INSERT
    OR IGNORE INTO topic_items (topic_id, content, sort_order)
VALUES (
        1101,
        'In-Context Learning (ICL): Zero-shot, Few-shot, Analogical',
        1
    ),
    (
        1101,
        'Programmatic Prompting: DSPy for declarative optimization',
        2
    ),
    (
        1101,
        'Prompt Engineering Tools (LangSmith versioning, injection mitigation)',
        3
    ),
    (
        1102,
        'Chunking & Indexing (Semantic chunking, HNSW, IVF trade-offs)',
        1
    ),
    (
        1102,
        'Retrieval Strategies: Dense vs. Sparse (BM25) vs. Hybrid (RRF)',
        2
    ),
    (1103, 'KV cache mechanics', 1),
    (
        1103,
        'Quantization, speculative decoding, continuous batching',
        2
    ),
    (
        1103,
        'TGI (HuggingFace, tensor parallelism, streaming)',
        3
    );

-- ------------------------------------------------------------------------------
-- SKILL: ADVANCED PYTORCH & PERF. ENGINEERING (Tier 3T)
-- ------------------------------------------------------------------------------
INSERT
    OR IGNORE INTO topics (
        id,
        skill_id,
        header,
        sort_order
    )
VALUES (
        1201,
        'skill_adv_pytorch',
        'Framework Internals',
        1
    ),
    (
        1202,
        'skill_adv_pytorch',
        'Performance Engineering',
        2
    );

INSERT
    OR IGNORE INTO topic_items (topic_id, content, sort_order)
VALUES (
        1201,
        'PyTorch Dispatcher & ATen library',
        1
    ),
    (
        1201,
        'Autograd engine: Custom Function implementation',
        2
    ),
    (
        1201,
        'TorchDynamo & TorchInductor (PyTorch 2.x Compiler stack)',
        3
    ),
    (
        1201,
        'Triton integration for custom kernel development',
        4
    ),
    (
        1202,
        'Profiling with PyTorch Profiler & Kineto',
        1
    ),
    (
        1202,
        'Identifying CPU/GPU bottlenecks (PCIe transfers, SM utilization)',
        2
    );

-- ------------------------------------------------------------------------------
-- SKILL: ML SYSTEMS (Tier 3T)
-- ------------------------------------------------------------------------------
INSERT
    OR IGNORE INTO topics (
        id,
        skill_id,
        header,
        sort_order
    )
VALUES (
        1301,
        'skill_ml_systems',
        'Hardware & Cluster Architecture',
        1
    ),
    (
        1302,
        'skill_ml_systems',
        'RLHF & Alignment',
        2
    );

INSERT
    OR IGNORE INTO topic_items (topic_id, content, sort_order)
VALUES (
        1301,
        'TPU vs. GPU: Tiling strategies and XLA compilation',
        1
    ),
    (
        1301,
        'FlashAttention and Memory-efficient attention mechanisms',
        2
    ),
    (
        1302,
        'PPO for LLMs (reward model + policy training loop)',
        1
    ),
    (
        1302,
        'DPO (direct preference optimization mechanics)',
        2
    ),
    (
        1302,
        'Constitutional AI & RLAIF',
        3
    ),
    (
        1302,
        'Red-teaming & safety evaluation at research depth',
        4
    );

-- ------------------------------------------------------------------------------
-- SKILL: PRETRAINING AT SCALE (Tier 4T)
-- ------------------------------------------------------------------------------
INSERT
    OR IGNORE INTO topics (
        id,
        skill_id,
        header,
        sort_order
    )
VALUES (
        1401,
        'skill_pretraining_scale',
        'Novel Architecture Research',
        1
    ),
    (
        1402,
        'skill_pretraining_scale',
        'Convergence & Scale',
        2
    );

INSERT
    OR IGNORE INTO topic_items (topic_id, content, sort_order)
VALUES (
        1401,
        'Mixture of Experts (MoE) routing & balancing',
        1
    ),
    (
        1401,
        'State-space models (S4, Mamba) vs. Transformers',
        2
    ),
    (
        1401,
        'Diffusion internals: Forward/Reverse process and Score-based modeling',
        3
    ),
    (
        1402,
        'Scaling Laws: Predicting model performance via compute/data parameters',
        1
    ),
    (
        1402,
        'Theoretical limits of quantization and compression',
        2
    );