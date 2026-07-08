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
