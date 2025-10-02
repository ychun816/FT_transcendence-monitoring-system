#!/usr/bin/env bash
set -euo pipefail

# manage_monitor.sh
# Flag-driven wrapper for the monitor compose stack and smoke tests.
# - Keeps individual responsibilities in their own scripts but provides a one-line interface.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# scripts moved into test-scripts/ for better organization
GEN_SCRIPT="$SCRIPT_DIR/test-scripts/generate_certs.sh"
SMOKE_SCRIPT="$SCRIPT_DIR/test-scripts/smoke_test.sh"
RUN_SMOKE_WRAPPER="$SCRIPT_DIR/test-scripts/run_smoke.sh"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml"

usage() {
  cat <<EOF
Usage: $0 [--generate-certs] [--restart] [--smoke] [--run-wrapper] [--all]

Options:
  --generate-certs   Create (idempotent) CA and certs in ./certs
  --restart          Recreate logstash and filebeat containers so they pick up cert changes
  --smoke            Run the smoke test (writes a log, waits, queries ES, tails logs)
  --run-wrapper      Run the existing run_smoke.sh wrapper (calls generator + restart + smoke)
  --all              Equivalent to --generate-certs --restart --smoke
  -h, --help         Show this help

Examples:
  # generate certs only
  $0 --generate-certs

  # full flow: generate certs, restart services, run smoke test
  $0 --all

  # just run the smoke test (fast) if you already have certs and containers up
  $0 --smoke

EOF
  exit 2
}

# Detect a docker-compose command (support both v1 and v2 CLI)
detect_compose_cmd() {
  if command -v docker-compose >/dev/null 2>&1; then
    echo "docker-compose"
  elif docker compose version >/dev/null 2>&1; then
    # docker compose (v2) is present
    echo "docker compose"
  else
    return 1
  fi
}

COMPOSE_CMD="$(detect_compose_cmd || true)"
if [[ -z "$COMPOSE_CMD" ]]; then
  echo "Error: neither 'docker-compose' nor 'docker compose' is available in PATH" >&2
  exit 1
fi

if [[ $# -eq 0 ]]; then
  usage
fi

DO_GEN=false; DO_RESTART=false; DO_SMOKE=false; DO_WRAPPER=false
while [[ $# -gt 0 ]]; do
  case "$1" in
    --generate-certs) DO_GEN=true; shift ;;
    --restart) DO_RESTART=true; shift ;;
    --smoke) DO_SMOKE=true; shift ;;
    --run-wrapper) DO_WRAPPER=true; shift ;;
    --all) DO_GEN=true; DO_RESTART=true; DO_SMOKE=true; shift ;;
    -h|--help) usage ;;
    *) echo "Unknown option: $1"; usage ;;
  esac
done

# Run steps
if $DO_GEN; then
  if [[ -x "$GEN_SCRIPT" ]]; then
    echo "[*] Running certificate generation ($GEN_SCRIPT)"
    "$GEN_SCRIPT"
  else
    echo "Error: generate script not found or not executable: $GEN_SCRIPT" >&2
    exit 1
  fi
fi

if $DO_RESTART; then
  echo "[*] Recreating logstash and filebeat containers using: $COMPOSE_CMD -f $COMPOSE_FILE up -d --force-recreate logstash filebeat"
  # shellcheck disable=SC2086
  $COMPOSE_CMD -f "$COMPOSE_FILE" up -d --force-recreate logstash filebeat

  echo "Waiting a few seconds for containers to spin up..."
  sleep 3

  echo "Listing cert files inside containers (best-effort)"
  # Attempt to list certs inside containers; ignore errors if services not ready
  $COMPOSE_CMD -f "$COMPOSE_FILE" exec -T filebeat ls -l /usr/share/filebeat/certs || true
  $COMPOSE_CMD -f "$COMPOSE_FILE" exec -T logstash ls -l /usr/share/logstash/certs || true
fi

if $DO_SMOKE; then
  if [[ -x "$SMOKE_SCRIPT" ]]; then
    echo "[*] Running smoke test ($SMOKE_SCRIPT)"
    "$SMOKE_SCRIPT"
  else
    echo "Error: smoke test script not found or not executable: $SMOKE_SCRIPT" >&2
    exit 1
  fi
fi

if $DO_WRAPPER; then
  if [[ -x "$RUN_SMOKE_WRAPPER" ]]; then
    echo "[*] Running existing wrapper: $RUN_SMOKE_WRAPPER"
    "$RUN_SMOKE_WRAPPER"
  else
    echo "Error: run_smoke wrapper not found or not executable: $RUN_SMOKE_WRAPPER" >&2
    exit 1
  fi
fi

echo "Done."
