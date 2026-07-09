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
out from under already-imported modules. Pre-existing failures now **14**
(was 15; the SO-D1 batch shrinks as infrastructure heals).

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
