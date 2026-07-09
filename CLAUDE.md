# SynthesisOverthrust — Cross-Language Blueprint (cache anchor)

Tauri 2.0 desktop app. Three runtimes, one repo. TEAM_LOG.md = iteration truth. contexto.md §6 = stale; trust code + TEAM_LOG.

## Layout
- `src/` — React 18 + TS (vite). Views in `src/views/`, components in `src/components/`, IPC wrappers in `src/api.ts` (single `export const api`).
- `src-tauri/src/` — Rust core. `commands.rs` (Phase 1, direct SQL), `commands_p2.rs` (proxies → sidecar), `commands_p3.rs` (mostly unregistered), `db.rs` (sqlx pool + embedded migrations), `sidecar.rs` (spawns/monitors uvicorn, HTTP get/post helpers).
- `python_sidecar/` — FastAPI on 127.0.0.1:7731. Routers: `sr/` (FSRS), `catalog/` (LanceDB), `scout/` (agent). NOT in src-tauri/binaries; dev-run via uvicorn.
- `migrations/*.sql` — applied by Rust sqlx at app boot (sidecar never applies them). 001 must never gain ALTER TABLE.

## IPC protocol
frontend `invoke()` → Rust `#[tauri::command]` → (p2 only) reqwest HTTP → FastAPI JSON. Tauri converts Rust snake_case args to camelCase on JS side — `src/api.ts` wrappers must pass camelCase keys.

## Package managers — never guess, never mix
- JS: **npm** (package-lock.json). No pnpm/yarn.
- Rust: **cargo** (src-tauri/).
- Python: **uv** (python_sidecar/pyproject.toml + uv.lock). No pip/poetry. Deps: `cd python_sidecar && uv add <pkg>`.

## Hardcoded commands (do not re-derive)
- Full dev stack: `./scripts/dev.sh` (vite + sidecar --reload + tauri)
- Frontend check: `npx tsc --noEmit` · build: `npx vite build`
- Rust check: `cd src-tauri && cargo check`
- Sidecar tests: `cd python_sidecar && uv run pytest tests/ -q`
- Sidecar solo (QA): `cd python_sidecar && NF_DB_PATH=<qa.db> NF_LANCE_DIR=<dir> uv run uvicorn main:app --port 7731`
- Migration harness: `{ cat migrations/*.sql; echo "<count queries>"; } | sqlite3 :memory:`

## Env / data
- Sidecar env prefix `NF_` (NF_DB_PATH, NF_LANCE_DIR, NF_CATALOG_PATH).
- Prod data: `~/.local/share/com.synthesisoverthrust.app/` (SQLite WAL + lancedb/). Port 7731: check `pgrep -af uvicorn` BEFORE live QA — dev.sh sidecar hot-reloads against PROD DB; failed binds are silent (rule Q1).
- Restart services after every iteration (rule Q2).

## Session Hygiene & Context Deflation
- CRITICAL: if active context exceeds 100k tokens or a sidecar task spans >5 turns, immediately issue `/compact` mid-task.
- CRITICAL: when switching work domains (Rust IPC ↔ Python compute ↔ React views), stop and instruct the user to execute `/clear`.
- Never read `Synthesis Overthrust Catalog.md` whole (218K chars) — chunk by `##` or use sidecar `/catalog/search`.
- Never paste raw cargo/pytest output >30 lines — grep/summarize first (see AGENTS.md hooks).
- Read SKILL.md Layer 1 before touching bridge/frontend/backend; deeper layers only on trigger.

## Guardrails (contexto §9, still binding)
No hardcoded paths/roles/tiers. Mastery never path-scoped. No FSRS state in LanceDB. L7+ never reachable via SR alone. Schema change ⇒ run harness + check sidecar queries (§6.6 drift rule).
