#!/usr/bin/env bash
set -euo pipefail

ES_URL=${ES_URL:-http://localhost:9200}
TEMPLATES_DIR="$(dirname "$0")"

echo "Applying ILM policy 'transcendence-logs-policy' to $ES_URL"
curl -sS -X PUT "$ES_URL/_ilm/policy/transcendence-logs-policy" \
  -H 'Content-Type: application/json' \
  -d @"$TEMPLATES_DIR/ilm/transcendence-logs-policy.json" | jq .

echo "Putting index template 'transcendence-template'"
curl -sS -X PUT "$ES_URL/_index_template/transcendence-template" \
  -H 'Content-Type: application/json' \
  -d @"$TEMPLATES_DIR/templates/transcendence-template.json" | jq .

echo "Creating initial write index and alias 'transcendence-logs-write'"
curl -sS -X PUT "$ES_URL/transcendence-logs-000001" -H 'Content-Type: application/json' -d '{"aliases": {"transcendence-logs-write": {"is_write_index": true}}}' | jq .

echo "Done."
