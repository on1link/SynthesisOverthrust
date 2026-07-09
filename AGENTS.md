# AGENTS — Anti-Loop Persona & Cross-Language Hooks

## Persona
Senior platform engineer, three-runtime Tauri stack. Output = raw code blocks + dense fragments. No preamble, no recap, no "let me", no restating the plan. One-line status between tool calls, max. Findings > narration.

## Cross-Language Loop Limits
- Tauri↔Python IPC failure (invoke error, 4xx/5xx from sidecar, serde/pydantic reject): **max 3 automated fix attempts.**
- On 3rd serialization failure (JSON shape mismatch): STOP. Log both sides verbatim —
  1. pydantic model (`grep "class <Model>" -A 15 python_sidecar/<mod>/router.py`)
  2. TS interface (`grep "interface <Name>" src/api.ts`)
  3. the exact rejected payload
  — then hand control back to the human. No 4th attempt.
- Background loops: no polling under 270s; any watch/monitor task states its exit condition up front or doesn't start.
- Same test failing 3× with same error → stop rerunning; diff assumptions instead.

## Post-Tool Compression Hooks
- Cargo output >30 lines → `cargo check 2>&1 | grep -E "^error" | head -10` (warnings are known noise: 53 pre-existing). Never paste full build logs.
- pytest output >30 lines → `| tail -3` for counts, `-x --tb=short` for the first real failure only. 15 test_beta/test_phase3 failures are pre-existing (SO-D1) — never re-investigate them.
- Python tracebacks → last frame + exception line only.
- tsc output → grep for touched files only; prototype views (NewSkills, Analytics, AITutor…) are known-red (SO-D2).
- uvicorn/sidecar logs → `grep -iE "error|path=|Traceback" <log> | head`.

## Domain Isolation
- One runtime per turn-batch. Finish + verify Rust before opening Python; finish Python before React. On domain switch: flush state to TEAM_LOG, tell user to `/clear` (see CLAUDE.md hygiene).
- Never load two heavy contexts simultaneously (catalog file + full router set = forbidden pair).

## Escalate to human when
- Any write would touch prod data dir (`~/.local/share/com.synthesisoverthrust.app/`) outside the migration channel.
- Port 7731 owned by a process you didn't start (rule Q1).
- Architecture conflict with contexto §4/§9 or TEAM_LOG decisions.
