#!/usr/bin/env bash
# ============================================================
# SynthesisOverthrust — scripts/sidecar.sh
# Single-command sidecar lifecycle. Replaces the error-prone
# pkill/pgrep/nohup dance (exit-144 self-kills, wrong-cwd ASGI
# failures, silent bind conflicts against the prod DB).
#
#   sidecar.sh start   [db_path] [lance_dir]
#   sidecar.sh stop
#   sidecar.sh restart [db_path] [lance_dir]
#   sidecar.sh status
# ============================================================
set -u

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SIDECAR_DIR="$REPO_DIR/python_sidecar"
PID_FILE="${TMPDIR:-/tmp}/so_sidecar_7731.pid"
LOG_FILE="${TMPDIR:-/tmp}/so_sidecar_7731.log"
PORT=7731

owner_pid() {
  # Who actually owns the port (not just any uvicorn on the box)
  ss -tlnp 2>/dev/null | grep ":$PORT " | grep -oP 'pid=\K[0-9]+' | head -1
}

status() {
  local port_pid file_pid health
  port_pid=$(owner_pid || true)
  file_pid=$(cat "$PID_FILE" 2>/dev/null || true)
  health=$(curl -sf -m 3 "http://localhost:$PORT/health" 2>/dev/null || echo "DOWN")
  echo "port_owner=${port_pid:-none} pidfile=${file_pid:-none} health=$health"
  if [ -n "${port_pid:-}" ] && [ "$port_pid" != "${file_pid:-x}" ]; then
    echo "WARNING: port $PORT owned by a process this script did not start (Q1 rule)."
    echo "         Its DB: $(grep -o 'path=[^ ]*' "$LOG_FILE" 2>/dev/null | tail -1 || echo 'unknown — check its own log')"
    return 2
  fi
  [ "$health" != "DOWN" ]
}

stop() {
  local file_pid
  file_pid=$(cat "$PID_FILE" 2>/dev/null || true)
  if [ -n "$file_pid" ] && kill -0 "$file_pid" 2>/dev/null; then
    kill "$file_pid" 2>/dev/null
    sleep 1
    kill -9 "$file_pid" 2>/dev/null || true
    echo "stopped pid $file_pid"
  else
    echo "no pidfile-owned sidecar running"
  fi
  rm -f "$PID_FILE"
  # Refuse to touch processes we did not start — report instead (Q1)
  local other
  other=$(owner_pid || true)
  [ -n "${other:-}" ] && echo "NOTE: port $PORT still owned by foreign pid $other — human decision required."
  return 0
}

start() {
  local db="${1:-}" lance="${2:-}"
  if [ -n "$(owner_pid || true)" ]; then
    echo "ERROR: port $PORT already bound. Run '$0 status' first."
    return 1
  fi
  cd "$SIDECAR_DIR" || { echo "ERROR: $SIDECAR_DIR missing"; return 1; }
  env ${db:+NF_DB_PATH="$db"} ${lance:+NF_LANCE_DIR="$lance"} \
    nohup uv run uvicorn main:app --host 127.0.0.1 --port $PORT --log-level warning \
    > "$LOG_FILE" 2>&1 &
  echo $! > "$PID_FILE"
  disown
  # Bounded readiness poll: 10 x 1s, then give up loudly
  for _ in $(seq 1 10); do
    sleep 1
    if curl -sf -m 2 "http://localhost:$PORT/health" > /dev/null 2>&1; then
      echo "up pid=$(cat "$PID_FILE") db=${db:-<default prod>} log=$LOG_FILE"
      return 0
    fi
  done
  echo "ERROR: sidecar did not become healthy in 10s. Last log lines:"
  tail -3 "$LOG_FILE"
  return 1
}

case "${1:-status}" in
  start)   shift; start "$@";;
  stop)    stop;;
  restart) shift; stop; start "$@";;
  status)  status;;
  *) echo "usage: $0 {start|stop|restart|status} [db_path] [lance_dir]"; exit 1;;
esac
