# SKILL — Isolated Multi-Language Workflows

## Layer 1 — Routing Index (read this, stop here unless matched)
- Touching `src/api.ts`, `commands_p2.rs`, or FastAPI routers → BRIDGE workflow (Layer 2A).
- Touching `src/views|components` only → FRONTEND workflow (Layer 2B). Do not open Rust or Python files.
- Touching `python_sidecar/**` only → BACKEND workflow (Layer 2C). Do not open src/ or src-tauri/.
- Packaging/release → PACKAGING workflow (Layer 2D).
- Anything else → no skill; act directly.

## Layer 2A — Bridge (IPC) checklist
1. Define/patch FastAPI route (pydantic models = wire truth).
2. Mirror Rust proxy in `commands_p2.rs` (`get`/`post` helpers). Snake_case args.
3. Register in `main.rs` `invoke_handler` list — unregistered commands fail silently at runtime.
4. Wrapper in `src/api.ts`: camelCase invoke keys + TS interface matching pydantic JSON exactly.
5. Verify: `cd src-tauri && cargo check` + `npx tsc --noEmit` + one curl against the route.
6. Serialization test: assert TS interface field names == pydantic field names (json.dumps round-trip in pytest).

## Layer 2B — Frontend checklist
1. Edit view/component. New view: import in App.tsx + `View` union + `VIEWS` map + Sidebar nav entry (all four or it's dead code).
2. `npx tsc --noEmit` (only grep for touched files; the prototype views are known-noisy SO-D2).
3. `npx vite build` for bundle proof.

## Layer 2C — Backend checklist
1. Schema first: new tables = NEW migration file (never edit 001/applied ones — sqlx checksums).
2. Router change → mount in `main.py` (import AND include_router; unmounted imports pull heavy deps).
3. `cd python_sidecar && uv run pytest tests/ -q` — tests inject fake embedders/transports; no network, no model downloads.
4. Migration harness after any schema touch.

## Layer 2D — Sidecar packaging
1. Target naming: Tauri external binaries need platform suffix, e.g. `sidecar-x86_64-pc-windows-msvc.exe`, `sidecar-x86_64-unknown-linux-gnu`; declare under `externalBin` in tauri.conf.json.
2. Current state: NO bundled binary — `sidecar.rs` falls back to spawning uvicorn from `python_sidecar/` (dev-mode assumption). PyInstaller bundling is future work; don't fake it.
3. If bundling: build binary per-target, drop into `src-tauri/binaries/`, match triple exactly (`rustc -vV | grep host`).
4. Smoke: spawn binary, poll `GET /health` (sidecar.rs pattern), then `GET /status`.

## Automated Skills for High-Frequency Processes

### HFP-1 — Sidecar lifecycle (the #1 observed token burn)
Selector (2 lines): invoke ONLY when starting/stopping/checking the sidecar process itself (Q2 restarts, QA boots, port conflicts).
Never invoke for code edits to sidecar modules — that's the BACKEND workflow.

Linear workflow — one command per step, no ad-hoc pkill/nohup:
1. `./scripts/sidecar.sh status` — port owner + pidfile + health in ONE line. If it prints the Q1 WARNING (foreign owner), STOP and hand to human.
2. `./scripts/sidecar.sh restart [db] [lance]` — targeted stop (pidfile only, never `pkill -f`), correct-cwd start, bounded 10s readiness poll. QA always passes explicit db/lance args; omitting them = prod DB, deliberately loud in output.
3. On failure the script prints the last 3 log lines itself — do NOT tail the log again.
Forbidden (all caused real incidents): `pkill -f uvicorn` (exit-144 self-kill, killed own launches), bare `nohup uvicorn` from repo root (ASGI import error), assuming a bind succeeded (silent conflict wrote QA data to prod DB, iteration 4).

Lightweight status without heavy dumps: `curl -sf -m 3 localhost:7731/health` (liveness), `ss -tlnp | grep :7731` (ownership), `grep -o 'path=[^ ]*' <log> | tail -1` (which DB). Never `/status` for liveness (does DB work), never full log reads.

### HFP-2 — IPC contract drift check (the #1 observed rework source)
Selector (2 lines): invoke ONLY after changing a pydantic model, a Rust proxy signature, or an api.ts interface.
Never invoke during pure styling/layout work.

Confirmed drift cases to date: quality→rating (0-5→1-4), XpResult.xp_awarded→xp_gained, Project.project_type/completed_at (phantom), VaultNote.tags (phantom), AnalyticsOverview flat→nested + avg_quality→avg_rating. Root cause: three sources of truth (pydantic, Rust json!, TS interface).

Linear check, greps only:
1. `grep -n "class <Model>" -A 12 python_sidecar/<mod>/router.py` — pydantic = wire truth.
2. `grep -n "interface <Name>" src/api.ts` — field names must match 1:1 (snake_case in bodies).
3. `grep -n "<command_name>" src-tauri/src/commands*.rs` — Rust arg names snake_case; then confirm the api.ts wrapper invokes with camelCase keys (Tauri converts).
4. For Rust-direct commands (no sidecar): `grep -n "json!({" -A 6` on the command — that json! block, not the TS interface, is wire truth.

## Layer 3 — On-Demand References (do NOT load upfront)
Open these ONLY on an explicit compile/payload-mismatch error naming them:
- Tauri config: `grep -n <key> src-tauri/tauri.conf.json` (never cat whole file).
- Python deps: `grep <pkg> python_sidecar/pyproject.toml` (uv.lock is generated — never read).
- IPC schemas: pydantic models live at top of each `python_sidecar/*/router.py` — `grep -n "class .*In\|class .*Out" <router>`.
- TS wire types: `grep -n "interface <Name>" src/api.ts`.
- Registered commands: `grep -n "commands" src-tauri/src/main.rs` (invoke_handler block).
- DB truth: `sqlite3 <db> ".schema <table>"` — never dump full schema.
