echo "Recreating logstash and filebeat containers to pick up cert changes..."
echo "Waiting up to 30s for logstash and filebeat to become healthy/Up..."
echo "Checking cert files inside filebeat container:"
docker-compose -f "$COMPOSE_FILE" exec -T filebeat ls -l /usr/share/filebeat/certs || true
echo
echo "Checking cert files inside logstash container:"
docker-compose -f "$COMPOSE_FILE" exec -T logstash ls -l /usr/share/logstash/certs || true
#!/usr/bin/env bash
set -euo pipefail

# Combined, flag-driven run_smoke script
# - Inlines the smoke test (writes a test log, waits, queries ES, tails logs)
# - Keeps PKI generation in the separate generate_certs.sh script (callable with --generate-certs)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/docker-compose.yml"
GEN_SCRIPT="$SCRIPT_DIR/generate_certs.sh"

usage() {
  cat <<EOF
Usage: $0 [--generate-certs] [--force] [--restart] [--smoke] [--all] [--yes]

Options:
  --generate-certs   Create (idempotent) CA and certs in ../certs
  --force            Force regenerate certs when used with --generate-certs
  --restart          Recreate logstash and filebeat containers (destructive)
  --smoke            Run the smoke test only (default when no flags provided)
  --all              Equivalent to --generate-certs --restart --smoke
  --yes              Skip interactive confirmations for destructive ops
  -h, --help         Show this help

Examples:
  # fast smoke-only (default)
  $0

  # full dev reset + verify
  $0 --generate-certs --restart --smoke

EOF
  exit 2
}

# Compose wrapper to handle `docker-compose` and `docker compose`
run_compose() {
  if command -v docker-compose >/dev/null 2>&1; then
    docker-compose "$@"
  else
    docker compose "$@"
  fi
}

# Simple helper to prompt unless --yes passed
CONFIRM=true
confirm() {
  if [[ "$CONFIRM" == true ]]; then
    read -r -p "$1 [y/N]: " ans || return 1
    case "$ans" in
      [Yy]|[Yy][Ee][Ss]) return 0 ;;
      *) return 1 ;;
    esac
  else
    return 0
  fi
}

# Parse flags
DO_GEN=false; DO_FORCE=false; DO_RESTART=false; DO_SMOKE=false
# default timeout in seconds for waiting for containers
WAIT_TIMEOUT=30
while [[ $# -gt 0 ]]; do
  case "$1" in
    --generate-certs) DO_GEN=true; shift ;;
    --force) DO_FORCE=true; shift ;;
    --restart) DO_RESTART=true; shift ;;
    --timeout)
      if [[ -n "${2-}" && "${2}" =~ ^[0-9]+$ ]]; then
        WAIT_TIMEOUT="$2"; shift 2
      else
        echo "--timeout requires a numeric argument" >&2; exit 2
      fi ;;
    --smoke) DO_SMOKE=true; shift ;;
    --all) DO_GEN=true; DO_RESTART=true; DO_SMOKE=true; shift ;;
    --yes) CONFIRM=false; shift ;;
    -h|--help) usage ;;
    *) echo "Unknown option: $1" >&2; usage ;;
  esac
done

# Default: if nothing requested, run smoke only
if ! $DO_GEN && ! $DO_RESTART && ! $DO_SMOKE; then
  DO_SMOKE=true
fi

# Preflight
command -v docker >/dev/null 2>&1 || { echo "docker not found in PATH" >&2; exit 1; }

# Run steps
if $DO_GEN; then
  if [[ -x "$GEN_SCRIPT" ]]; then
    echo "[*] Running certificate generation ($GEN_SCRIPT)"
    if $DO_FORCE; then
      # naive force: remove cert files so generator recreates them
      echo "[*] Forcing regeneration: removing existing cert files in ../certs (if any)"
      rm -f "$ROOT_DIR/certs"/*.{key,crt,csr,srl} 2>/dev/null || true
    fi
    "$GEN_SCRIPT"
  else
    echo "Error: generate script not found or not executable: $GEN_SCRIPT" >&2
    exit 1
  fi
fi

if $DO_RESTART; then
  echo "[*] About to recreate logstash and filebeat containers (this is destructive)"
  if ! confirm "Proceed with recreating containers?"; then
    echo "Aborted by user."; exit 1
  fi

  echo "[*] Recreating logstash and filebeat containers using compose file: $COMPOSE_FILE"
  run_compose -f "$COMPOSE_FILE" up -d --force-recreate logstash filebeat

  echo "Waiting up to ${WAIT_TIMEOUT}s for logstash and filebeat to become running..."
  # Wait for Logstash to report healthy via its Docker healthcheck (if present)
  echo "Waiting up to ${WAIT_TIMEOUT}s for logstash to report healthy via docker health status..."
  elapsed=0; interval=3; status="unknown"
  while [ $elapsed -lt $WAIT_TIMEOUT ]; do
    # Use docker inspect directly for portability (works with both docker-compose and docker CLI)
    status=$(docker inspect --format='{{.State.Health.Status}}' logstash 2>/dev/null || echo unknown)
    if [[ "$status" == "healthy" ]]; then
      echo "logstash is healthy"
      break
    fi
    echo "logstash health: $status (waiting)..."
    sleep $interval
    elapsed=$((elapsed + interval))
  done

  if [[ "$status" != "healthy" ]]; then
    echo "Timed out waiting for logstash to become healthy (status=$status). Proceeding, but startup races may occur."
  fi

  # Ensure filebeat container is running (not strictly tied to Logstash health, but useful to confirm startup)
  echo "Waiting up to ${WAIT_TIMEOUT}s for filebeat container to be running..."
  for i in $(seq 1 $WAIT_TIMEOUT); do
    fb_running=$(run_compose -f "$COMPOSE_FILE" ps --services --filter "status=running" | grep -E "^filebeat$" | wc -l || true)
    if [[ "$fb_running" -ge 1 ]]; then
      echo "filebeat is running"
      break
    fi
    sleep 1
  done

  echo
  echo "Listing cert files inside filebeat container (best-effort):"
  run_compose -f "$COMPOSE_FILE" exec -T filebeat ls -l /usr/share/filebeat/certs || true
  echo
  echo "Listing cert files inside logstash container (best-effort):"
  run_compose -f "$COMPOSE_FILE" exec -T logstash ls -l /usr/share/logstash/certs || true
fi

if $DO_SMOKE; then
  # Call the separate smoke test script (keeps responsibilities separate)
  SMOKE_SCRIPT="$SCRIPT_DIR/smoke_test.sh"
  if [[ -x "$SMOKE_SCRIPT" ]]; then
    echo "[*] Running smoke test ($SMOKE_SCRIPT)"
    "$SMOKE_SCRIPT"
  else
    echo "Error: smoke test script not found or not executable: $SMOKE_SCRIPT" >&2
    exit 1
  fi
fi

echo "Done."
