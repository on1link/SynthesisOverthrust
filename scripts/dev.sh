#!/usr/bin/env bash
# ============================================================
# SynthesisOverthrust v0.1.0-alpha — scripts/dev.sh
# Start full dev environment (sidecar + Tauri)
# ============================================================
# SynthesisOverthrust - Gamified skill acquisition platform
# Copyright (C) 2026 on1link
# 
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <https://www.gnu.org/licenses/>.

#!/bin/bash
set -euo pipefail

CYAN='\033[0;36m'; GOLD='\033[0;33m'; GREEN='\033[0;32m'; NC='\033[0m'
info() { echo -e "${CYAN}[NF]${NC} $*"; }

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# ── Cleanup on exit ───────────────────────────────────────────────────────────
# This ensures BOTH background processes (Tauri and Python) die on Ctrl+C
trap "info 'Shutting down dev environment...'; kill \$(jobs -p) 2>/dev/null || true" EXIT

# ── 1. Start Tauri dev (Background) ───────────────────────────────────────────
info "Starting Tauri 2.0 (compiling Rust & initializing DB)..."
cargo tauri dev &
TAURI_PID=$!

# ── 2. Wait for Tauri DB Migrations ───────────────────────────────────────────
# Rust compilation can take a few seconds. We give it a head start so the 
# database and tables are fully constructed before Python tries to query them.
info "Giving Tauri a head start to run migrations..."
sleep 8 

# ── 3. Start Python sidecar (Background) ──────────────────────────────────────
info "Starting Python sidecar on :7731..."
cd python_sidecar
uv run uvicorn main:app --host 127.0.0.1 --port 7731 --reload &
SIDECAR_PID=$!
cd "$ROOT"

# ── 4. Wait for sidecar health ────────────────────────────────────────────────
info "Waiting for sidecar..."
for i in $(seq 1 30); do
  if curl -sf http://127.0.0.1:7731/health >/dev/null 2>&1; then
    echo -e "${GREEN}[✓]${NC} Sidecar ready!"
    break
  fi
  sleep 1
done

# ── 5. Keep Terminal Alive ────────────────────────────────────────────────────
info "Development environment is live!"
# 'wait' pauses the script here and pipes Tauri's logs to your terminal. 
# It keeps running until you close the Tauri app window or hit Ctrl+C.
wait $TAURI_PID