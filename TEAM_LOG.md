# TEAM_LOG — SynthesisOverthrust

Running log of the PO → Dev → QA loop (see contexto.md §2).

---

## Iteration 1 — Story SO-1: Spaced-repetition vertical slice (P0)

**Date:** 2026-07-08
**Status:** DONE (QA passed; UI walkthrough in `tauri dev` pending a display session)

### PO — State assessment

Repo state diverges from contexto.md §6 in several places. Recorded here as the
authoritative baseline (contexto §6 describes an older/aspirational schema):

| contexto.md says | repo actually has |
|---|---|
| `skill_subtopics` + `user_subtopic_progress` | `topic_items` + `user_item_mastery` (mastery 0–100 per item) |
| 43 tables / 1 trigger | 35 tables, 3 views, 0 triggers (fresh DB, migrations 001–004) |
| Mastery L1–L10, tiers T1–T6 | mastery 0–100 per item, skill level 0–5 via `v_node_mastery` (20 pts/level) |
| FSRS engine | SM-2 engine (`python_sidecar/sm2/`), tested |

**Broken chain found (standing rule §6.6 violation):** the SR feature is dead end-to-end:

1. `sr_cards` / `sr_reviews` tables exist in **no migration**, yet are queried by
   `sm2/router.py`, `analytics/router.py`, `graph/builder.py`, `main.py:/status`.
2. Sidecar `main.py` has a **syntax error** (line 116: leading space on
   `app.include_router(plugins_router…)`) → sidecar cannot boot at all.
3. SR router not mounted; Rust proxies `sr_create_card`/`sr_submit_review` commented out;
   only `sidecar_status` registered in `main.rs`.
4. Frontend: `api.ts` SR functions commented, `App.tsx` SR view commented,
   `SpacedRepetition.tsx` runs on hardcoded mock cards.
5. Reviews (even in the old sidecar code) never touched `user_item_mastery` —
   no path from review → mastery → skill tree.

### Story SO-1

> As a learner, I review a due SR card and the underlying item's mastery — and the
> parent skill's level in the skill tree — update accordingly.

**Acceptance criteria**
1. Fresh DB boots with `sr_cards` + `sr_reviews` created by a new migration
   (`005_spaced_repetition.sql`); no `ALTER TABLE` added to 001.
2. Sidecar boots clean and serves `/sr/*`.
3. `POST /sr/review` updates the card schedule (SM-2), logs to `sr_reviews`, and
   upserts `user_item_mastery` (clamped 0–100, counters updated).
4. `v_node_mastery.computed_level` reflects the change with no further writes (view).
5. Frontend Review view lists real due cards (item content + topic/skill context),
   submits reviews through the Tauri→sidecar proxy chain, and the skill tree shows
   the updated level on next load.
6. `POST /sr/backfill` creates cards for practiced items lacking one (QA enabler + UI empty-state action).
7. pytest green (SM-2 unit + new review→mastery integration test); migration harness
   passes with new baseline counts.

**Decisions (logged per §9)**
- **D1 — SM-2 kept for this slice, FSRS deferred to SO-2.** contexto settles FSRS, but the
  slice's purpose is pipeline coherence; the SM-2 engine + tests already exist and the
  scheduling engine is swappable behind `/sr/review`. ⚠ Batched question for guide:
  confirm FSRS swap as next story (py-fsrs dep, ratings 1–4 vs current 0–5 UI).
- **D2 — Cards keyed to `topic_items.id`** (`UNIQUE(user_id, item_id)`), not
  node/path. Removes `path_id` from cards — mastery and scheduling are never
  path-scoped (§9). Card carries denormalized `front`/`back` text.
- **D3 — Review mastery deltas:** q0:−4 q1:−3 q2:−2 q3:+2 q4:+4 q5:+6 (practice flow
  uses +8/−3; SR reviews weighted slightly lower). Counts as practice for counters.
- **D4 — contexto §6 schema description marked stale**; this table above is the baseline.

**Known debt (not in this story)**
- `SpacedRepetition.tsx` hardcoded per-node Q&A/name maps → now only fallback; real
  content comes from DB. Full cleanup with catalog ingestion (P1).
- `analytics`, `graph`, `search`, `llm` routers still unmounted.
- `graph/builder.py` references old `sr_cards.node_id` — unmounted, fix when mounting.
- Legacy `neural-forge` naming in scripts (P7).

### Dev — Commits
- `2b79e50` feat: add SR schema and item-keyed review flow with mastery propagation
- `aa53ef3` feat: register SR Tauri commands proxying to sidecar
- `d4a329c` feat: enable Review view backed by real SR cards

### QA — Findings
**Migration harness (all migrations → in-memory SQLite):** 37 tables, 3 views,
17 indexes, 0 triggers, seed 17 skills / 92 items, `PRAGMA integrity_check` ok,
zero errors. **This is the new baseline** (update when schema grows).

**pytest:** 67 passed (28 new: SM-2 unit + SR-flow integration incl. clamping,
404/409/422, backfill idempotency). 15 failures in `test_beta.py`/`test_phase3.py`
are **pre-existing** (verified identical on the pre-change tree) — stale imports
in graph/rooms/plugins tests, unrelated to this story. → Defect SO-D1, next iteration.

**Live sidecar (fresh DB from migrations, `NF_DB_PATH` override):**
- Boots clean, `/health` + `/status` ok (previously: syntax error, dead on arrival).
- `POST /sr/backfill` → created 4 cards with real item content + topic/skill joins.
- `POST /sr/review` q=5 → EF 2.5→2.6, due tomorrow, `sr_reviews` logged,
  item mastery 55→**61**, response carries `node_id`/`node_level` from `v_node_mastery`.
- Break tests: bad card 404, quality 9 → 422, duplicate create 409, unknown item 404. ✓

**Rust:** `cargo check` clean (53 warnings, all pre-existing). sqlx embeds 005 at
compile time; the runtime DB gets it on next app start.

**Frontend:** `tsc --noEmit` — zero errors in touched files. ~120 pre-existing
errors in unrouted prototype views (NewSkills, Analytics, AITutor, …) → SO-D2.
No frontend test runner configured (vitest missing) → SO-D3.

**Gotcha logged:** sidecar env vars use the `NF_` prefix (`NF_DB_PATH`, not `DB_PATH`).

### Defects / follow-ups
- **SO-D1**: 15 stale pre-existing test failures (test_beta/test_phase3).
- **SO-D2**: prototype views fail typecheck; excluded from build but pollute `tsc`.
- **SO-D3**: add vitest + RTL for frontend (contexto DoD expects it).
- **SO-2 (next story candidate)**: FSRS engine swap behind `/sr/review` (guide to confirm).
- UI walkthrough in `tauri dev` on a display session to close AC-5 visually.

---

## Iteration 2 — Story SO-2: FSRS engine swap (guide-confirmed)

**Date:** 2026-07-09
**Status:** DONE (QA passed; UI walkthrough in `tauri dev` still pending a display session)

**Guide decisions (2026-07-09):** ① FSRS confirmed, UI updated accordingly.
② Iteration-1 baseline accepted; contexto §6 stays as-is, TEAM_LOG is authoritative.
③ Catalog (`Synthesis Overthrust Catalog.md`, 218K chars) is to be read only in
per-`##` chunks — chunked to scratchpad with INDEX; structure:
`## Role → ### Tier/SKILL → ###### Topic → - subtopic` bullets. Feeds P1 later.

### Story SO-2

> As a learner, my reviews are scheduled by FSRS (py-fsrs 6.3.1) instead of SM-2,
> and the review UI offers the four FSRS ratings (Again/Hard/Good/Easy).

**Acceptance criteria**
1. `fsrs` dependency added; scheduling delegated to py-fsrs `Scheduler`
   (default parameters, desired_retention 0.9).
2. Migration 006 adds FSRS state to `sr_cards` (stability, difficulty,
   fsrs_state, step, lapses, due_at) and stability/difficulty logging to
   `sr_reviews`; existing rows backfilled (`due_at` from `due_date`). No 001 edits.
3. `POST /sr/review` takes `rating` 1–4; mastery deltas Again −3 / Hard +1 /
   Good +4 / Easy +6; correct = rating ≥ 2; mastery propagation unchanged.
4. Review UI shows 4 rating buttons (keys 1–4), stability/difficulty replace EF.
5. pytest green (FSRS engine unit + updated flow tests); harness passes.

**Decisions**
- **D5 — module rename `sm2/` → `sr/`** (engine no longer SM-2; imports updated).
- **D6 — rating stored in existing `sr_reviews.quality` column** (1–4 fits the
  0–5 CHECK); `prev_ef`/`new_ef` left NULL by FSRS path; new stability/difficulty
  columns log the FSRS trajectory.
- **D7 — sub-day scheduling kept** (FSRS learning steps 1m/10m): `due_at`
  (full ISO, UTC) drives the due queue; `due_date` kept as date-only mirror for UI.

### Dev — Commits
- `4943bd8` feat: swap SM-2 for FSRS scheduling engine (py-fsrs 6.x)
- `9dc29a1` feat: proxy FSRS rating through sr_submit_review
- `e4e3af1` feat: switch Review UI to four FSRS rating buttons

### QA — Findings
**Harness baseline updated:** 37 tables, 3 views, **18 indexes** (was 17);
`sr_cards` 17 cols, `sr_reviews` 14 cols, integrity ok.

**pytest:** 65 passed — 26 SR (11 FSRS engine unit incl. state transitions,
lapse→Relearning, stability growth; 15 flow) — same 15 pre-existing failures (SO-D1).

**Live sidecar (fresh DB):** backfill → 3 Learning cards due immediately;
Good → S 2.31 / D 2.12, due +10 min (learning step), mastery 55→59;
Again → S 0.78 / D 7.39, lapse counted, mastery 59→56; rating 7 → 422,
bad card → 404; stats deliver avg_stability/avg_difficulty/retention 50%.

**Rust/TS:** `cargo check` clean; `tsc --noEmit` clean on touched files.

**Notes**
- FSRS learning steps (1 m / 10 m) mean fresh cards come due again within the
  session — matches Anki-style relearning; the due queue uses `due_at` (UTC).
- `test_beta.py` TestSM2 group now doubly stale after the sm2→sr rename (SO-D1).
- Catalog chunks live in session scratchpad only; regenerate on demand with the
  split-by-`##` script (structure documented above).

---

## Backlog (guide-triaged 2026-07-09)

Phase 1–3 audit found features that exist as code but are disconnected
(views unrouted, Rust commands unregistered, sidecar routers unmounted).
Guide triaged each:

**Accepted into backlog** (rough PO order after SO-3):
- **B1 Grind view** — route exists component; commands registered.
- **B2 Projects view** — same shape as B1.
- **B3 Vault view** — pairs with B10/B13.
- **B4 Practice problems** — register commands + wire UI.
- **B5 Learning resources** — register commands + UI.
- **B6 Focus sessions** — register command + UI.
- **B7 Agent assessments (L7+)** — large; PO must spec first (ties contexto P3).
- **B8 AI Tutor (Ollama)** — mount llm router, proxies, view.
- **B9 Analytics dashboard** — mount router; SQL must move to FSRS columns.
- **B10 Semantic search over the Obsidian vault** — guide: vault lives in a
  separate directory; scope FAISS/embeddings to that vault path, distinct from
  the LanceDB catalog store.
- **B11 Knowledge graph** — fix `graph/builder.py` (still queries `sr_cards.node_id`).
- **B12 Git backup** — contexto §4 lists backups as settled.
- **B13 Settings view** — without plugin section.
- **B14 Obsidian vault sync** — sync only; no collab, no mobile.

**Parked by guide:** Plugin manager UI (“no thoughts how to use it yet”),
Study rooms (collab), Mobile REST API, Vitals view.

---

## Iteration 3 — Story SO-3: Catalog → LanceDB ingestion + retrieval API (P1)

**Date:** 2026-07-09
**Status:** DONE (QA passed)

### Story SO-3

> As the system, I can parse the full skill catalog, refine it, embed every
> subtopic, store it in LanceDB with metadata, and answer semantic retrieval
> queries through the sidecar — so agents later retrieve ~500 tokens instead
> of reading a 218K-char file.

**Acceptance criteria**
1. Parser handles the real catalog: mixed `###`/`####` SKILL levels, `← NEW`
   annotations stripped, metadata line (`Tier | Roles | Max Level | Prerequisites`),
   bold-markdown bullets, role sections without skills (Career Track) skipped.
2. Skills deduped across role sections by normalized name (roles unioned,
   topics/subtopics merged); output = one record per unique subtopic with
   {skill, topic, subtopic, tier, roles, max_level, prerequisites}.
3. LanceDB table under `DATA_DIR/lancedb` holds subtopic embeddings + metadata
   only — **no mastery/FSRS state** (§4 guardrail).
4. Sidecar `/catalog/ingest` (re)builds the table; `/catalog/search?q=&k=&role=&tier=`
   returns ranked matches; `/catalog/stats` reports counts.
5. Embedder = sentence-transformers `all-MiniLM-L6-v2`, lazily imported;
   tests inject a fake embedder (no model download in CI).
6. Rust proxies registered; pytest green; live ingest + retrieval demo pass.

**Catalog refinements applied (guide license 2026-07-09)**
- AIE `Gen AI` renamed → `Generative AI & Large Language Models` so the
  cross-role dedupe merges it with the MLE skill of the same name.
- NEW topic **LLM Observability & Ops** added (tracing, cost/latency monitoring,
  prompt versioning, production guardrails, semantic caching, feedback loops).
- NEW subtopics: *Context engineering* (Prompting), *Constrained decoding*
  (LLM Inference & Serving).
- `ML Systems L9` → `ML Systems` (mastery level does not belong in a name).
- Applied Fine-Tuning tier corrected `2T` → `2.5T` (sits under Tier 2.5).

### Dev — Commits
- `93b0b6d` feat: add curated skill catalog with LLM-era refinements
- `d8e2003` feat: catalog ingestion into LanceDB with retrieval API (P1)
- `cd9c06e` feat: register catalog_ingest/search/stats Tauri proxies

### QA — Findings
**Parse baseline (real file):** 87 unique skills / 442 topics / **2,549 subtopics**
(contexto §6's "~1,200 across 53–56 skills" was stale). Tier histogram:
F 404 · T1 712 · T2 883 · T2.5 320 · T3 103 · T4 127. Role codes found:
AIE, ALL, DE, DS, EL, ENG, GER, GL, MLE — stored as data, never hardcoded.

**pytest:** 76 passed (11 new catalog tests; fake embedder, no downloads).
Same 15 pre-existing failures (SO-D1).

**Live sidecar:** ingest 2,549 rows in ~11 s (MiniLM already cached);
search-before-ingest → 409; empty q / k=99 → 422; bogus role → [].
Retrieval spot-checks all semantically on-target:
- "how does attention work in transformers" → FlashAttention internals /
  self-attention (Gen AI & LLMs, T2.5)
- "deploy LLM cheaply with quantization" + role=AIE → LLM deployment options,
  edge compression
- "window functions" + tier=F → SQL window function subtopics only
- "monitoring LLM cost in production" → MLOps Observability tracing + token-cost
  subtopics (pre-existing skill complements the new LLM Observability & Ops topic)

**Rust:** `cargo check` clean.

**Notes**
- Catalog file now committed (was untracked) — single source for ingestion.
- LanceDB dir: `DATA_DIR/lancedb` (`NF_LANCE_DIR` override); catalog path via
  `NF_CATALOG_PATH`.
- lancedb `table_names()` deprecation warning — cosmetic, revisit on upgrade.
- No UI this story (P1 scope is the retrieval API); Skill Scout (P2) consumes it next.

---

## Iteration 4 — Story SO-4: Skill Scout agent + correction loop (P2)

**Date:** 2026-07-09
**Status:** DONE (QA passed — with one process-level incident, see findings)

### Story SO-4

> As a learner, the Skill Scout discovers new techniques from arXiv and
> HuggingFace, proposes a catalog placement {skill, topic, tier, roles} via
> LanceDB nearest-cluster retrieval, and I approve/edit/reject each proposal
> in the UI — approved corrections write back to BOTH LanceDB and SQLite and
> accumulate as few-shot examples (contexto §5 correction loop).

**Acceptance criteria**
1. `POST /scout/run` fetches recent arXiv (cs.LG/cs.CL) + HuggingFace trending
   items, embeds title+summary, retrieves top-k neighbors from LanceDB, and
   stores proposals with similarity + neighbor explainability.
2. Novelty bands: top-1 score ≥ high threshold → skipped as already-covered;
   below low threshold → skipped as off-catalog; middle band → proposal.
   `UNIQUE(source, external_id)` prevents re-proposing; rejected stay rejected.
3. `POST /scout/decide` (approve/edit/reject): approve/edit appends the new
   subtopic to the LanceDB catalog table AND upserts skills/topics/topic_items
   in SQLite (so it becomes mastery-trackable). Reject only records status.
4. `GET /scout/fewshot` returns accumulated corrections (decided proposals with
   final placements) for future LLM-assisted classification.
5. Scout view in UI (Intelligence section): proposal cards with source link,
   proposed placement, neighbors; Approve / Edit / Reject actions.
6. Tests use injected transport (fixture XML/JSON) + fake embedder — no network,
   no model downloads. Live QA does one real run.

**Decisions**
- **D8 — classifier is nearest-neighbor, no LLM in this slice**: skill = modal
  skill of top-k, topic = best hit's topic in that skill, tier/roles inherited.
  Deterministic and testable; LLM re-ranking is a follow-up once Ollama (B8) lands.
- **D9 — agents never read the raw catalog** (token-efficiency rule §5): Scout
  consumes `/catalog` retrieval only.
- **D10 — cloud-provider changelogs deferred** (RSS scraping brittle; arXiv+HF
  give the highest signal per effort). Backlog as SO-4b.

### Dev — Commits
- `27087a7` feat: Skill Scout agent with correction loop (P2)
- `6cba164` fix: remove test pollution from legacy event_loop fixture and config reload
- `c87f19c` feat: Scout view with approve/edit/reject correction flow

### QA — Findings
**pytest:** 87 passed (11 new scout tests). Root-caused and fixed two latent
test-infrastructure bugs in `test_beta.py` that only bit when suites ran
together: a legacy session-scoped `event_loop` fixture, and
`test_env_override`'s `reload(config)` which swapped the `settings` singleton
out from under already-imported modules. The 15 pre-existing SO-D1 failures
remain (stale imports), but they no longer poison other suites.

**Live run (real arXiv + HuggingFace):** 24 candidates → 24 proposals with
sensible placements (LLM releases → Gen AI & LLMs topics; agents model →
Agents; tabular FM → Python/ML ecosystem). Approve → SQLite item created +
LanceDB record retrievable; reject → status only; double-decide → 409;
rating/action validation → 422/404. Few-shot pool returns decided examples.

**⚠ Incident — QA traffic hit the real app DB.** `scripts/dev.sh` (user-run,
09:41, `uvicorn --reload`) was already bound to port 7731; all live QA curls
this session reached IT, not the NF_DB_PATH-scoped QA sidecars (which failed
to bind, silently). Footprint on the real DB: 24 scout proposals (22 pending,
1 approved: "InternScience/Agents-A1" → Gen AI & LLMs › Agents as
topic_item 8189, also appended to real LanceDB), ~36 sr_cards + 4 sr_reviews
from earlier iterations' QA, small mastery deltas on a few real items. Real
LanceDB got the full catalog ingest (which is the intended production state).
**Guide to decide:** keep the pending proposals (triage them in the Scout
view) or purge; cleanup SQL documented below. Process fix → QA rule Q1.

**Q1 (new QA rule):** before live HTTP QA, verify port ownership
(`pgrep -af uvicorn`) and confirm the sidecar's logged `path=` matches the
QA database. Never assume a fresh bind succeeded.

**Cleanup SQL (if guide wants the QA artifacts gone):**
```sql
DELETE FROM scout_proposals;                          -- or WHERE status='pending'
DELETE FROM topic_items  WHERE id = 8189;             -- approved scout item
DELETE FROM sr_reviews;  DELETE FROM sr_cards;        -- QA review artifacts
```

**⚠ New defect SO-D4 (pre-existing, real DB):** seed migration ran multiple
times against the production DB — `topic_items` ids 8041–8188 duplicate
earlier seed rows (id-less INSERTs are not idempotent). Duplicates dilute
`v_node_mastery` averages with 0-mastery copies. Needs a dedup migration +
idempotent seed guards. High priority next iteration.

---

## Iteration 5 — Defect fix SO-D4: topic_items dedup + idempotent seed

**Date:** 2026-07-09
**Status:** DONE

Root cause: `004_seed_skill_tree.sql` inserts `topic_items` WITHOUT explicit
ids, so its `INSERT OR IGNORE` never ignores (no unique constraint) — every
seed re-run duplicated all 92 items. The real DB had two extra passes
(ids 8041–8188).

**Fix — `008_dedup_topic_items.sql`:**
1. Builds a dup→canonical map (lowest id per `(topic_id, content)` wins).
2. Re-points `user_item_mastery` and `sr_cards` to the canonical item;
   on clash the canonical row wins; orphaned `sr_reviews` cleaned.
3. Deletes duplicates, then adds `UNIQUE INDEX (topic_id, content)` so the
   seed's `OR IGNORE` finally bites — re-runs are now idempotent.

**QA:** 4 new tests (double-seed reproduces defect; 008 dedups and locks;
progress on a duplicate id survives on the canonical id; canonical wins on
clash). Full suite 91 passed / same 15 pre-existing. Harness: double-seed +
full chain + 008 → 92 items, 0 dups, 20 indexes, integrity ok. `cargo check`
re-embeds migrations cleanly — the real DB gets deduped on next app start.

### Dev — Commits
- `13fc528` fix: dedup topic_items and make seed idempotent (SO-D4)

---

## Guide decisions (2026-07-09, post-iteration 5)

- **QA artifacts stay in the real DB** until end of project / first production
  build running at 100% — the pending Scout proposals are live triage material.
  Cleanup SQL from iteration 4 is parked, not executed.
- **Q2 (new rule): restart services after every iteration** — kill stray
  sidecar/uvicorn processes and relaunch cleanly to avoid stale bindings and
  hot-reload drift.

---

## Iteration 6 — Story SO-5: wire Grind, Projects, Vault views (B1–B3)

**Date:** 2026-07-09
**Status:** DONE

> As a learner, the Grind, Projects and Vault views are reachable from the
> sidebar and work against the existing registered Tauri commands.

**Dev**
- App routes + Core nav entries wired for `grind`, `projects`, `vault`
  (Vitals stays parked per triage). `useGameState` already exposed every prop.
- Fixed phantom-field TS errors against the actual Rust payloads:
  - `Projects.tsx` used `project_type`/`completed_at` — `list_projects`
    returns neither; the type lives in `description` (createProject maps it).
  - `Vault.tsx` used `tags` — `vault_index` has no tags column; search now
    falls back to path matching. Tag chips render empty until a tags column
    exists (noted for B14 Obsidian sync).

**QA**
- `tsc --noEmit`: wired files clean (SO-D2 debt shrinks by two components).
- `vite build`: production bundle OK (44 modules).
- Services restarted per Q2 after the iteration.

### Dev — Commits
- `3d6eb13` feat: wire Grind, Projects and Vault views (B1–B3)

---

## Iteration 7 — Story SO-6: learning loop (B4–B6)

**Date:** 2026-07-09
**Status:** DONE

> As a learner, I can drill practice problems per subtopic, track learning
> resources per skill, and log focus sessions — all feeding mastery/XP.

**Drift found (§6.6 again):** all five learning-loop commands existed in Rust
since Phase 1 but queried tables NO migration ever created (`practice_problems`,
`practice_attempts`, `learning_resources`, `resource_progress`,
`focus_sessions`). Commands were also never registered.

**Dev**
- `009_learning_loop.sql`: the five tables (column sets derived from the Rust
  queries = wire truth) + demo seed (5 Calculus/Limits problems, 4 resources).
- Registered all five commands in `main.rs`; `api.ts` wrappers enabled with
  camelCase invoke keys (snake_case arg objects mapped in the wrapper).
- `LearningLoop.tsx`: PracticeCard (subtopic picker → drill → self-grade →
  mastery/XP feedback), ResourcesCard (+25%/done progress), FocusCard
  (pomodoro/deep/review/assessment + duration + notes). Wired into Skills
  detail view and Grind view.

**QA**
- Harness: **43 tables** now (matches contexto §6's original count, amusingly),
  5 problems + 4 resources seeded, integrity ok. `cargo check` clean (009
  embeds). `tsc` clean on touched files; `vite build` OK.
- pytest baseline unchanged (91 passed / 15 pre-existing).
- Note: these commands are Rust-direct (no sidecar), so curl can't smoke them —
  first full-app validation lands with the next `tauri dev` session.

### Dev — Commits
- `fdbbbae` feat: learning loop — practice drills, resources, focus sessions (B4–B6)

---

## Iteration 8 — Story SO-7: Analytics dashboard (B9)

**Date:** 2026-07-09
**Status:** DONE

> As a learner, the Analytics view shows XP trends, SR health, skill velocity
> and sleep correlation — computed from the FSRS-era schema.

**Drift fixed (the router referenced three dead schema generations):**
- `user_skill_levels` + `skill_node_defs` tables never existed → rewritten on
  `v_node_mastery` JOIN `skills` (mastery is path-unscoped; `path_id` removed
  from `SkillVelocity` per §9).
- `sr_cards.node_id/path_id` → card→item→topic→skill join.
- `activity_log.entry_type/description` → actual `action`/`node_id` columns
  (skill XP now attributed via `node_id`, not `description LIKE`).
- SM-2 retention math (`avg_quality/5`) → FSRS pass-rate (rating ≥ 2);
  due queue on `due_at`.
- `analytics_snapshots` table existed in no migration → `010_analytics_snapshots.sql`
  (PK user_id+week_start). Applied its idempotent DDL to the prod DB directly
  so the mounted router works before the next app boot (sqlx will no-op re-run).

**Dev:** router mounted; 4 Rust proxies registered (`analytics_weekly_snapshot`
corrected from GET-macro to POST); `api.ts` wrappers + wire-truth interfaces;
`Analytics.tsx` de-drifted (import style, `avg_rating`, no path colors) and
routed with sidebar entry. SO-D2 debt −1 view.

**QA (live, real DB):** overview → due 25 / retention 75% / top skills from
`v_node_mastery` ✓; skill-velocity → Calculus lv4, 4 reviews avg 2.5 (the
QA reviews, proving the item→skill join) ✓; sleep-correlation → empty-data
insight ✓; weekly snapshot → saved ✓. `cargo check` + `tsc` + `vite build`
clean; pytest baseline unchanged (91/15). Services restarted per Q2.

### Dev — Commits
- `325068a` feat: analytics dashboard on FSRS-era schema (B9)

---

## Iteration 9 — Story SO-8: AI Tutor on Ollama (B8)

**Date:** 2026-07-10
**Status:** DONE (QA passed; UI walkthrough in `tauri dev` pending a display session)

**PO note — B7 deliberately jumped:** B7 (agent assessments) is large, needs its
own spec, and wants LLM infrastructure; B8 lands that infrastructure (Ollama
plumbing) which B7 and D8 (Scout LLM re-ranking) both consume. Ollama verified
installed locally (llama3, qwen3.5:9b, gemma4:e4b, …).

### Story SO-8

> As a learner, I chat with a local Ollama tutor (general or skill-scoped),
> ask for concept explanations, and generate practice problems that land in
> the drillable practice bank — all local, via the sidecar.

**Drift found (§6.6, all four proxies + router):**
- `llm/router.py` `/practice` inserts a phantom `practice_problems` schema
  (`user_id,skill_id,question,answer,model`) — 009's real table is
  `subtopic_id,path_id,difficulty(lowercase CHECK),problem_text,hints,explanation`.
- Top-level `from search.indexer import semantic_search` imports `faiss`
  (optional `cpu` extra) — mounting the router would kill sidecar boot.
- Rust `llm_chat` sends `vault_context` (not in ChatIn); `llm_practice` sends
  2 of 4 required fields; `llm_explain` sends `context` (not in ExplainIn);
  `llm_ingest_paper` posts `file_path` to an endpoint expecting `text`.
- `AITutor.tsx` runs on a hardcoded 5-skill mock array.
- `llm_conversations` (002) matches the chat insert — no migration needed.

**Acceptance criteria**
1. llm router mounted; sidecar boots clean **without faiss** (lazy import).
2. `/llm/chat` persists turns to `llm_conversations`, injects last-20 history
   by `session_id`, returns `{reply, session_id, model}`; Ollama down → 503 hint.
3. `/llm/practice` rewritten to 009 wire truth: `{subtopic_id, path_id,
   difficulty, count, model?}`, names for the prompt derived from
   topic_items→topics→skills join, inserts land in the B4 drill bank.
4. `/llm/explain` `{concept, target_level, analogy_domain?}`; `/llm/models`
   lists local tags, graceful error hint when Ollama down.
5. Rust proxies match pydantic wire (HFP-2 check), registered in main.rs.
6. api.ts wrappers enabled (camelCase invoke keys); AITutor routed under
   Intelligence: Chat/Practice/Explain tabs on real API, skill picker from
   real DB skills, Papers tab renders deferred state.
7. pytest green with fake Ollama (monkeypatched, no network, no downloads).

**Decisions**
- **D11 — vault RAG deferred to B10**: `context_type="vault"` → 501; faiss
  import made lazy. B10 lands the real vault index.
- **D12 — paper-digest/PDF ingestion deferred** to the vault slice (B10/B14):
  multipart upload + PyPDF2 + vault-write belong together. `llm_ingest_paper`
  stays unregistered.
- **D13 — LLM-generated problems write to 009 `practice_problems`** — one
  drill bank (B4 + B8 share it); difficulty normalized to lowercase CHECK.
- **D14 — no streaming through Tauri invoke** (request/response only);
  event-channel streaming is a follow-up if chat latency demands it.

### Dev — Commits
- `8a59905` docs: sidecar lifecycle script + HFP skills + monitor sub-agent
  blueprint (prior-session process hardening, committed at iteration start)
- `df0d817` feat: mount llm router — Ollama tutor endpoints on real schema (B8)
- `350e43e` feat: register llm Tauri proxies matching pydantic wire (B8)
- `96553b2` feat: AI Tutor view on real skills and drill bank (B8)
- `9ab8da1` fix: repair unescaped LaTeX backslashes in LLM practice JSON

### QA — Findings
**pytest:** 106 passed (15 new llm tests: chat persistence + server-side
history, skill-context prompt, vault 501, Ollama-down 503 with no partial
persist, practice→drill-bank writes, LaTeX/fence/dict-wrapper parse repair,
404/422/502). Same 15 pre-existing failures (SO-D1).

**Live sidecar (QA DB via `scripts/sidecar.sh`, Q1 verified `path=` in log
before any call):**
- `/llm/models` → all 9 local Ollama tags.
- `/llm/chat` (llama3.2:3b) → coherent reply; second turn with same
  `session_id` repeated first answer verbatim → server-side history proven;
  4 rows in `llm_conversations`.
- `context_type=vault` → 501; bad difficulty/count → 422; unknown subtopic
  → 404.
- **Defect found & fixed live:** `/llm/practice` → 502 — model emits raw
  LaTeX inside JSON strings (`x \geq 0` = invalid escape; `\frac` silently
  becomes a form feed; piecewise `\\` pairs re-doubled by a naive repair).
  Fix: strict parse → repair pass treating every backslash as literal except
  `\\`/`\"` consumed as pairs (`9ab8da1`). Post-fix: 8/9 live generations
  parse; residual failures (suspected token truncation) return the designed
  502 "try again". After fix: 2 problems generated → landed in
  `practice_problems` and match the exact `list_practice_problems` WHERE
  shape (subtopic+path+difficulty) → drillable from Skills → Practice.
- `/llm/explain` (beginner, cooking analogy) → on-target structured answer.

**Rust/TS:** `cargo check` clean; `tsc --noEmit` clean on touched files;
`vite build` OK. QA sidecar stopped after run (Q2, port left free).

**Notes**
- AITutor mock `SKILLS` array gone — skill/subtopic pickers run on
  `get_skill_levels`/`get_subtopics`; chat sends only the new turn (history
  is server-side per session), which also stops double-persisting old turns.
- Tutor-generated problems feed the same mastery/XP path as B4 drills via
  `submit_practice_attempt` — one drill bank, two entry points.
- `002_phase2.sql` header comment claims 001 defines `practice_problems` —
  stale (009 does); comment-only, no action.
- Ollama default model in sidecar config is `llama3` (installed ✓); UI model
  picker lists all local tags.

---

## Iteration 10 — Story SO-9: Skills/Scout GUI fixes (user-reported)

**Date:** 2026-07-10
**Status:** DONE

> As a learner, the Skills view shows every catalog role, a Scout approval
> becomes a visible skill node, and the Scout list can be filtered and sorted.

**Root causes (user reported all three symptoms):**
1. **Roles missing** — `roles` table held exactly one row (`mle`); 004 never
   seeded the rest. The UI renders whatever the backend returns. Catalog has
   6 real roles (MLE, DS, DE, AIE, GL German Language, EL English Language);
   metadata codes GER/ENG are alias spellings of GL/EL, `ALL` is a wildcard.
2. **Approved Scout proposals invisible** — approve wrote `skills/topics/
   topic_items` but never `skill_roles` (Skills view INNER JOINs it → skill
   dropped) and left `difficulty_id` NULL (matches no tier section). Tier and
   roles went to LanceDB only.
3. **No sort/filter in Scout** — UI hardcoded `scoutProposals("pending")`.

**Decisions**
- **D15 — catalog is the source of truth for the SQLite tree's role layer**:
  new `/catalog/sync-tree` (also auto-runs after `/catalog/ingest`) mirrors
  role rows (display names parsed from catalog section headers), skill_roles
  links and difficulty_id from LanceDB `skill_meta()`. Idempotent.
- **D16 — role code normalization is data, not logic**: GER→GL, ENG→EL,
  ALL→every known role (`catalog/sync.py`), shared by sync-tree and the
  Scout approve path.
- **D17 — three seeded skills carry explicit catalog aliases**
  (`skill_deep_learning`→`deep_learning`, `skill_genai_llm`→
  `generative_ai_large_language_models`, `skill_adv_pytorch`→
  `advanced_deep_learning_frameworks_pytorch_core`) — abbreviated seed names
  defeat normalized-name matching; tiers verified equal before aliasing.

### Dev — Commits
- `43ab975` fix: mirror catalog roles/links/tiers into SQLite tree (SO-9)
- `3296ece` feat: Scout list filters/sort + catalog sync action in Skills (SO-9)

### QA — Findings
**pytest:** 110 passed (4 new: approve links roles+tier, alias+wildcard
normalization, sync-tree match/idempotency, 409 before ingest). Same 15
pre-existing (SO-D1).

**Live (QA DB via sidecar.sh, Q1 verified):** ingest → 2,549 rows,
`tree_sync {roles_created 5, links_created 21, matched 14/17}`; after D17
aliases re-sync → **17/17 matched, 42 skill_roles links, 6 roles** with
catalog display names. Scout approve with `roles="GER,ALL"` →
`generative_ai_large_language_models` visible through the exact Skills-view
JOIN under all 6 roles at `tier_2_5t` (GER folded to gl, ALL expanded).
Second sync run → all-zero counts (idempotent). `cargo check`/`tsc`/`vite
build` clean on touched files. Services stopped after QA (Q2).

**Notes**
- Prod DB effect on first sync (user runs it via ⇄ SYNC CATALOG or next
  ingest): +5 role rows, ~25 skill_roles links, tiers for the 4 scout-created
  skills (they become visible retroactively — including QA item 8189's skill).
- `useGameState.ts` still has an `"mle"` fallback when roles is empty —
  moot once roles exist; cleanup candidate.

---

## Iteration 11 — Story SO-10: vault semantic search (B10)

**Date:** 2026-07-10
**Status:** DONE (QA passed; UI walkthrough in `tauri dev` pending a display session)

> As a learner, I search my Obsidian vault semantically from the Vault view,
> and the AI tutor answers with my own notes as context (unlocks D11).

**Decisions**
- **D18 — LanceDB over FAISS for vault search**: rebuild `search/` on the
  catalog store pattern (own table `vault_chunks`, injectable embedder,
  main deps only). The written-but-unmounted FAISS module needed the
  optional `faiss-cpu` extra, assumed `vault_index` columns that no
  migration created (tags/content_hash), and had a staleness bug. FAISS
  files deleted; `sync/watcher._re_embed_note` must be rewritten for B14.
- **D19 — vault path read from the shared `config` table** (key
  `vault_path`, written by Rust `set_vault_path`), `NF_VAULT_PATH` as
  fallback; 409 with hint when unset.
- **D20 — full rebuild on `/search/reindex`** (no incremental); catalog's
  2.5k rows embed in ~11 s, vaults are smaller. Tags parsed from
  frontmatter/#hashtags into LanceDB metadata only — no SQLite schema
  change, `vault_embeddings` stays dormant.

### Dev — Commits
- `a739428` feat: vault semantic search on LanceDB + tutor vault RAG (B10, SO-10)
- `4cbc8fd` feat: register vault search Tauri proxies (B10)
- `fc6fc74` feat: semantic vault search UI + tutor Vault context (B10)

### QA — Findings
**pytest:** 121 passed (11 new: store reindex/metadata/chunk-overlap/
409-paths, router query/related/stats/vault-path-409; llm vault tests
flipped from 501 to inject-notes + 409-unindexed). Same 15 pre-existing
(SO-D1). Test gotcha logged: monkeypatching `catalog.store.default_embedder`
does NOT reach `search.store`'s from-import binding — patch the name where
it's bound, or the real MiniLM loads mid-test.

**Live (QA DB + scratch vault of 3 notes, Q1/Q2 observed):**
- query before index → 409; reindex → `{indexed_chunks 3, unique_notes 3}`
  (empty notes skipped); stats agree.
- Relevance: "how does multi-head attention work" → Transformer Attention
  0.66 ≫ others; "when should flashcard reviews be scheduled" → FSRS note
  top; sourdough decoy always last. Frontmatter + inline tags merged.
- **D11 payoff:** `/llm/chat context_type=vault` (llama3.2:3b) answered
  "…at the moment predicted retention drops to 90 percent" — verbatim from
  the note. 501 gone.
- `/search/related/skill_genai_llm` returns ranked notes (small-vault scores
  are honest ~0.25 — nothing pretends relevance).

**Rust/TS:** `cargo check`, `tsc --noEmit` (touched files), `vite build`
all clean. No migrations; harness baseline unchanged (43 tables).

**Notes / debt**
- `sync/watcher.py` still references the deleted FAISS indexer — module is
  unmounted; rewrite lands with B14 (vault sync) against `search/store`.
- `SpacedRepetition`-era `vault_embeddings` table (002) now dormant — drop
  or repurpose in a future migration when B14 defines the sync store.
- Backlog remaining after this iteration: **B7** (agent assessments — next
  per guide, PO spec required), B11 knowledge graph, B12 git backup,
  B13 settings, B14 obsidian sync.

---

## Iteration 12 — Story SO-11: agent assessments, phase 1 (B7 / contexto P3)

**Date:** 2026-07-10
**Status:** DONE (QA passed; UI walkthrough in `tauri dev` pending a display session)

> As a learner, once SR and practice have taken an item as far as they can,
> an agent assessment (generated and graded by the local LLM) is the only
> way to push its mastery into the top band — enforcing "L7+ never via SR
> alone" on the real schema.

**Process note:** first iteration run under AGENTS.md **Specialized
Multi-Model Personas** — Fable 5 as Architect-Planner (this spec +
`.claude_plan.md`), Sonnet 5 sub-agents as Code-Executor (SKILL.md Layer 4
routing; feature > 50 LOC).

**Scale reconciliation (contexto L1–L10 vs repo mastery 0–100/level 0–5):**
iteration-1 baseline keeps the repo schema authoritative. Mapping: the
contexto "L7+" band ≡ **item mastery > 80**. SR reviews and practice
attempts clamp at 80 (`MASTERY_SR_CAP`); only assessment passes write
above. Consequence: `v_node_mastery` level 5 (avg 100) is now
assessment-gated by construction — the §9 guardrail holds arithmetically.

**Acceptance criteria**
1. Migration `011_assessments.sql`: `assessments` table (kind-carrying for
   the future two-agent flow), no edits to 001.
2. Sidecar `assess/` router: `POST /assess/start` (eligibility: mastery ≥
   cap, no active assessment for the item; generates domain-variant
   questions via Ollama with catalog-neighbor framings per D9), `POST
   /assess/submit` (LLM-graded rubric → score; pass ≥ threshold lifts
   mastery into 80–100 band), `GET /assess/active`, `GET /assess/history`.
   Ollama down → 503; both steps persist state (row = checkpoint, D24).
3. SR review path (`sr/router.py`) and Rust `submit_practice_attempt`
   clamp mastery writes at the cap (mirrored constant — wire-truth pair).
4. Rust proxies + api.ts wrappers registered; AssessmentCard in the Skills
   detail view (visible when an item sits at the cap): start → answer →
   per-question verdicts + score + new mastery.
5. pytest green offline (fake `_ollama_chat`); cap-clamp regression tests
   for SR; migration harness passes with the new baseline.

**Decisions**
- **D21 — L7+ ≡ mastery >80** (see reconciliation above); cap is
  `MASTERY_SR_CAP = 80` in sidecar config, mirrored as a Rust const in
  `commands.rs` (documented pair, HFP-2 checked).
- **D22 — single-agent assessments only in this slice**; two-agent
  48h-gap certification (contexto L9–L10/T6) deferred to **B7b** —
  `assessments.kind` ('single' now, 'dual' later) keeps the door open.
- **D23 — generation & grading on local Ollama** reusing the llm module's
  `_ollama_chat` + `_parse_json_array`; question prompts pull 3 catalog
  neighbors via LanceDB retrieval (never the raw catalog file, D9).
- **D24 — the assessment row is the checkpoint**: questions/answers/status
  persisted; an interrupted run resumes from `GET /assess/active`.
- **D25 — pass mapping**: score ≥ `ASSESS_PASS_SCORE` (70) →
  `mastery = max(current, 80 + round(score/5))` (score 100 → 100);
  fail records the attempt, mastery unchanged.

### Dev — Commits
- `f875d4a` feat: agent assessments — the only path above the SR mastery cap
  (Phase A, Sonnet 5 executor)
- `6c6bccc` feat: assessment proxies + AssessmentCard in Skills detail
  (Phase B, Sonnet 5 executor)

### QA — Findings (Fable)
**Multi-model process verdict:** worked. Sonnet executed both phases from
`.claude_plan.md` with zero style drift and correctly **halted on a real
plan/design conflict instead of papering over it**: pre-existing
`test_mastery_clamped_at_100` (99 + Easy → 100) tests a scenario D21
deliberately closes. Architect arbitrated — test rewritten as
`test_mastery_above_cap_never_raised_by_sr` (99 stays 99). Second reported
mismatch was a stale plan number: harness was already 44 tables after 010
(iteration-11 note said 43 — corrected), so 011 ⇒ **new baseline 45 tables**.
Plan file deleted after execution (SKILL.md Layer 4 Phase 3).

**pytest:** 130 passed (9 new: eligibility 409/404, generate/store, resume
returns same row, 422 count mismatch, pass lifts 80→98, fail leaves cap,
Ollama-down 503; SR cap regression). Same 15 pre-existing (SO-D1).

**Live (QA DB, llama3.2:3b, Q1/Q2 observed):**
- start below cap → 409; unknown item → 404; start at cap → 4 questions with
  domain-variant framings (physics/engineering/ML variants of the calculus
  item); re-start while active → same assessment id (checkpoint resume ✓).
- Attempt 1: graded 65 → **failed**, mastery 80 → 80, verdicts persisted.
- Attempt 2: graded 80 → **passed**, mastery 80 → **96** — exactly D25's
  `cap + round(score/5)`. History shows both rows; double-submit → 409.
- `user_item_mastery` and `assessments` rows verified directly in the DB.
- Model-quality note (not plumbing): the 3B grader is harsh/erratic (scored
  a correct limit answer 20) and one generated question set contained
  garbled LaTeX (`∞∛x²`). Larger local models (qwen3.5:9b) should be the
  recommended assessment model; UI already lets the user pick. → SO-D5.

**Rust/TS:** `cargo check` 0 errors; `tsc` clean on touched files;
`vite build` OK (47 modules).

**Defects / follow-ups**
- **SO-D5**: assessment prompt hardening + default model guidance —
  question-JSON garbling and grading variance on 3B models.
- **B7b**: two-agent 48h-gap certification (contexto L9–L10/T6) —
  `assessments.kind='dual'` reserved.

---

## Iteration 13 — Defect fixes SO-D5 (assessment hardening) + SO-D6 (sidecar orphans)

**Date:** 2026-07-10
**Status:** DONE

Small-logic defect iteration — under the 50-LOC Layer-4 routing threshold
(mostly prompt copy), so Fable executed directly.

**SO-D5 fix (`8c97fbc`):**
- Generation prompt: ASCII-math-only rule (x^2, sqrt(x), infinity — never
  LaTeX/unicode math) + self-contained-question rule.
- `_valid_questions` gate (exact count, ≥8-word questions, no mojibake) with
  **one corrective retry** feeding the bad output back, then 502 with no row.
- Grading: anchored rubric bands (90+/70+/40+/0, content-not-style) and a
  charitable ≥60 floor for reasonable attempts at malformed questions;
  stray verdict scores clamp into 0–100 (150→100, "90"→90, None→0).
- `ASSESS_MODEL` setting — route assessments to a stronger model than the
  chat default (docs: prefer ≥7B; llama3.2:3b graded a correct answer 20).
- Tests: 4 new (retry path incl. corrective message, 502 on double garble,
  ASSESS_MODEL routing, score clamping) → suite **134 passed** / same 15.
- Live re-check on the SAME 3B model that garbled in iteration 12: 4/4
  well-posed ASCII questions, zero LaTeX/unicode violations.

**SO-D6 found & fixed (`dcf0c1a`)** — a Q1 WARNING during this iteration
exposed it: `sidecar.sh` captured `$!` = the **uv wrapper** pid, so `stop`
killed the wrapper and orphaned the uvicorn child still bound to 7731.
Three orphaned pairs from earlier iterations were identified (all serving
session QA DBs — killed after evidence check; the foreign pid on 8022 was
left alone). Fix: after the readiness poll, the pidfile is re-pointed at the
actual port owner (`ss`-derived); `stop` also `pkill -P`'s children.
Verified: pidfile == port owner, stop leaves zero orphans, port free.

### Dev — Commits
- `8c97fbc` fix: harden assessment generation and grading (SO-D5)
- `dcf0c1a` fix: sidecar.sh pidfile tracked the uv wrapper, not uvicorn (SO-D6)

---

## Iteration 14 — Story SO-12: knowledge graph (B11)

**Date:** 2026-07-10
**Status:** DONE (QA passed; UI walkthrough in `tauri dev` pending a display session)

> As a learner, I see my knowledge as a graph — vault notes wikilinked to
> each other, skills with prerequisite edges, SR co-review patterns — and
> can explore neighbourhoods and paths between concepts.

Multi-model routing: Fable plan (`.claude_plan.md`), Sonnet 5 executes.

**Drift found (§6.6 — builder referenced three dead schema generations):**
- `skill_node_defs` table never existed (same phantom analytics had);
  real source is `skills` JOIN `skill_roles`.
- Node ids `skill:{path_id}:{id}` — **path-scoped, violates §9**; hardcoded
  4-role hex-color map violates "roles as data".
- `sr_cards.node_id/path_id` — dead since 005 (cards keyed to items, D2).
- `vault_index.tags` — column never existed.
- `practice_problems.skill_id` — 009's real column set has none.
- KnowledgeGraph.tsx invokes phantom `kg_get_graph`/`kg_rebuild` commands
  and silently falls back to a MOCK_GRAPH; graph proxies in commands_p3
  were never registered; `graph_rebuild` proxy is GET but route is POST.

**Acceptance criteria**
1. Builder rewritten on the real schema; **skill nodes are `skill:{id}`,
   never path-scoped (§9)**; role attribution + colors come from the
   `roles`/`skill_roles` tables.
2. Graph sources v1: vault wikilinks, skill prerequisite edges, SR
   co-review (card→item→skill, rating ≥ 3, same-day). Rebuild clears and
   repopulates `kg_nodes`/`kg_edges` (003) — no stale accumulation.
3. `/graph/data`, `/stats`, `/neighbours/{id}`, `/path`, `/rebuild` (POST)
   mounted; lazy build on first request.
4. Rust proxies registered (rebuild fixed to POST); api.ts wrappers on
   wire-truth shapes; KnowledgeGraph view de-drifted (no mock, no phantom
   invokes), routed under Intelligence.
5. pytest green offline (tmp vault + in-memory DB); no network.

**Decisions**
- **D26 — graph node ids are path-unscoped** (`skill:{skill_id}`, notes by
  path); roles are node attributes sourced from data.
- **D27 — prereq edge source = the same table/column `get_skill_levels`
  reads** (wire truth; executor verifies in commands.rs).
- **D28 — concept edges (skill↔note) deferred** until note tags live in
  SQLite (B14 vault sync); vault_index has no tags column and LanceDB-side
  matching is too heavy for build time.

**Process note:** plan written by Fable per multi-model routing; the Sonnet
executor spawn was declined by the guide this round, so Fable executed the
plan directly (plan file used as the spec, then deleted per Layer-4 Phase 3).

### Dev — Commits
- `df2254a` feat: knowledge graph on real schema, path-unscoped nodes
- `03a5a7b` feat: register knowledge graph proxies — first commands_p3 wiring
- `19ed9d6` feat: Knowledge Graph view on live data, routed under Intelligence

### QA — Findings
**pytest:** 142 passed (8 new graph tests: wikilink resolution incl. dead
links, D26 no-path-scoped-ids regression (regex-asserted), role/color from
data, prereq edges, co-review bump-vs-add semantics, rebuild idempotency,
d3 export shape, router endpoints). Same 15 pre-existing (SO-D1). One test
expectation corrected during dev: co-review between already-prereq-linked
skills bumps the existing edge weight (+0.1) instead of adding a parallel
sr_corev edge — inherited increment semantics, now documented by the test.

**Live (QA DB + scratch vault, Q1/Q2 observed):** 20 nodes (17 skills +
3 notes), 13 links (12 prereq = exact skill_prerequisites count, 1 wikilink
resolved from `[[attention]]`); zero path-scoped ids; skill color `#4A90E2`
from the roles row. Neighbours(calculus, d1) → stats+linalg; find_path
calculus→stats length 1; calculus→deep_learning honestly "No path found"
(deep_learning has no seeded prereq chain — data, not defect). Double
rebuild → kg_nodes/kg_edges counts stable (20/13).

**Rust/TS:** cargo 0 errors (urlencoding helper shared p2→p3); tsc —
KnowledgeGraph.tsx now CLEAN (leaves the SO-D2 noise list, debt −1);
vite build OK.

**Notes**
- Sidebar Intelligence now: Reviews · Scout · AI Tutor · Graph · Analytics.
- Remaining backlog: B7b, B12 git backup, B13 settings, B14 obsidian sync
  (unlocks D28 concept edges + watcher rewrite debt).

---

## Iteration 15 — Story SO-13: git backup (B12)

**Date:** 2026-07-10
**Status:** DONE (QA passed; UI walkthrough in `tauri dev` pending a display session)

> As a learner, my progression data is backed up: consistent SQLite
> snapshots committed to a local git repo, on demand and nightly, with
> history visible in the app.

**Drift found (§6.6):**
- `backup/router.py` hardcodes the LEGACY data dir
  (`~/.local/share/synthesis-overthrust`, pre-rename) in four endpoints —
  a stray git repo would land next to, not in, the real
  `com.synthesisoverthrust.app` dir. `settings.BACKUP_DIR` exists and is
  correct; only `/status` half-used it behind a needless hasattr.
- `snapshot_db` copies the LIVE WAL database with `shutil.copy2` —
  torn-copy risk mid-write.
- Rust `backup_set_remote` proxy posts to `/backup/set-remote` which does
  not exist in the router.
- Nothing mounted/registered; `ensure_git_repo` lifespan call commented.
- `.gitignore` written at init would commit the live DB and the whole
  LanceDB dir (rebuildable binary churn).

**Acceptance criteria**
1. Router mounted; `ensure_git_repo` on lifespan (failure-guarded); every
   endpoint uses `settings.BACKUP_DIR`/`settings.DB_PATH`.
2. Snapshots use the sqlite3 online-backup API (consistent under WAL);
   retention 10; snapshot logs to `backup_log` (`backup_type='snapshot'`).
3. `/commit` snapshots first, then stages+commits; `.gitignore` excludes
   the live DB (+wal/shm) and `lancedb/`, keeps `snapshots/`.
4. New endpoints: `POST /backup/set-remote` (matches the existing Rust
   proxy) and `GET /backup/snapshots` (name, size, sha256, created — wire
   truth ready for the B13 restore UI).
5. Rust: all backup proxies registered; midnight scheduler triggers a
   commit when `config.auto_git_commit='true'` (startup trigger already
   existed).
6. api.ts wrappers enabled; BackupCard in the Vault view: status
   (branch/dirty/last commit), Backup Now, snapshot count, remote
   set + push.
7. pytest offline (tmp dirs; GitPython local ops; push against a
   `file://` bare repo — no network).

**Decisions**
- **D29 — durable artifact = consistent snapshots, not the live DB**:
  live db + WAL sidecars + `lancedb/` gitignored (racy / rebuildable);
  `snapshots/` committed.
- **D30 — all backup paths from settings** (legacy hardcoded dir was the
  §6.6 offender).
- **D31 — nightly backup piggybacks the existing Rust midnight
  scheduler** behind the `auto_git_commit` config key; no new cron
  machinery.
- **D32 — restore UI deferred to B13** (needs a restart flow); the
  snapshots-list endpoint ships its wire truth (incl. sha256 integrity
  hashes per contexto §4) now.
- Syncthing endpoints stay unregistered (B13 material).

### Dev — Commits
- `cc2ff39` fix: de-drift git backup onto real paths + consistent snapshots
  (Phase A, Sonnet 5 executor)
- `0492ad9` feat: backup proxies, nightly trigger, BackupCard in Vault
  (Phase B, Sonnet 5 executor)

### QA — Findings (Fable)
**Executor mismatches — both good catches:**
1. Plan's "second commit → nothing_to_commit" test was unreachable by the
   plan's own design (every /commit stages a fresh snapshot). Architect
   accepted **always-commits semantics** — Backup Now always yields a
   backup; test documents it. Executor also added microsecond snapshot
   names (second-resolution names silently overwrote rapid backups) and an
   explicit push refspec (fresh branch has no upstream; file:// push
   failed without it).
2. Pre-existing `backup_snapshot_db` proxy was GET against a POST route —
   flagged in Phase B, fixed by architect before it shipped registered.

**pytest:** 150 passed (8 new backup tests: init+gitignore, commit flow
with dual backup_log rows, snapshot consistency via marker row, retention
10, sha256 listing, file:// remote push, 422 empty url). Same 15
pre-existing (SO-D1).

**Live (QA sidecar with NF_BACKUP_DIR scoped to scratch — lifespan would
otherwise git-init the prod dir; Q1/Q2 observed):** repo + D29 .gitignore
auto-created on boot; commit → snapshot (536 KB) + git hash, 2 backup_log
rows; snapshots list with sha256; status branch=main clean; set-remote +
push → commit visible in a bare file:// remote; snapshot passes
`PRAGMA integrity_check` and reads all 92 topic_items.

**Rust/TS:** cargo 0 errors; tsc clean on touched files; vite build OK.

**Notes**
- Live QA for future backup work MUST scope `NF_BACKUP_DIR` — the sidecar
  git-inits `settings.BACKUP_DIR` (prod data dir) on every boot now. Prod
  init is intended behavior for the app itself.
- Remaining backlog: B7b, B13 settings (restore UI per D32 + Syncthing),
  B14 obsidian sync.
