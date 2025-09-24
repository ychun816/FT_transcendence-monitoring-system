#!/usr/bin/env bash

### COLOR SETUP ############
BOLD_LIGHT_BLUE="\033[1;94m"
BOLD_ORANGE_BG="\033[1;43m"
RESET="\033[0m"
############################

set -euo pipefail

# Create a message string that includes the current UTC timestamp in ISO 8601 format
MSG="automated smoke $(date -u +%Y-%m-%dT%H:%M:%SZ)"

# Define the directory to store logs, relative to the repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
LOGDIR="$ROOT_DIR/logs/transcendence"

# Create the log directory and any parent directories if they do not exist
mkdir -p "$LOGDIR"

# Define the path of the log file to be written
TESTFILE="$LOGDIR/automated-smoke.log"

# Write a JSON-formatted log entry to the test file, including timestamp, message, and log level
echo "{\"@timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"message\":\"$MSG\",\"level\":\"INFO\"}" > "$TESTFILE"

# Print confirmation that the test file was created
echo -e "${BOLD_LIGHT_BLUE}Wrote test file: $TESTFILE${RESET}"

# Wait for Filebeat to establish a connection to Logstash before querying ES.
# This reduces race conditions where the test queries ES before Filebeat / Logstash
# have completed the hand-off. Two timeouts control behavior and can be overridden
# by environment variables:
# - FILEBEAT_WAIT_SECONDS: how long (seconds) to wait for Filebeat->Logstash connection (default 60)
# - ES_RETRIES: how many times to poll Elasticsearch for the document once connected (default 30)
# - ES_SLEEP: how many seconds to sleep between ES retry attempts (default 2)

FILEBEAT_WAIT_SECONDS=${FILEBEAT_WAIT_SECONDS:-60}
echo -e "${BOLD_LIGHT_BLUE}Waiting up to ${FILEBEAT_WAIT_SECONDS}s for Filebeat -> Logstash connection...${RESET}"

# Compose file used by this repo (monitor/docker-compose.yml from script root)
ROOT_COMPOSE="$ROOT_DIR/docker-compose.yml"
CONNECTED=0
for i in $(seq 1 "$FILEBEAT_WAIT_SECONDS"); do
	# Check recent Filebeat logs for the established-connection message. If docker-compose
	# is not available or logs are not yet present, this will simply retry until timeout.
	if docker-compose -f "$ROOT_COMPOSE" logs --tail=200 filebeat 2>/dev/null | grep -q "Connection to backoff(async(tcp://logstash:5044)) established"; then
		CONNECTED=1
		echo -e "${BOLD_LIGHT_BLUE}Filebeat reported connection to Logstash (attempt $i).${RESET}"
		break
	fi
	sleep 1
done
if [[ "$CONNECTED" -ne 1 ]]; then
	echo -e "${BOLD_LIGHT_BLUE}Timed out waiting for Filebeat->Logstash connection after ${FILEBEAT_WAIT_SECONDS}s; proceeding to query ES anyway.${RESET}"
fi

echo
echo -e "${BOLD_ORANGE_BG}Elasticsearch search for message (retrying up to ${ES_RETRIES:-30} attempts, sleep between attempts configurable via ES_SLEEP)${RESET}"

# Query Elasticsearch for documents that contain the exact message written to the test file
# Retry loop: ES_RETRIES attempts (default 10). Set ES_RETRIES env var to override.
ES_RETRIES_DEFAULT=30
ES_RETRIES=${ES_RETRIES:-$ES_RETRIES_DEFAULT}
ES_SLEEP=${ES_SLEEP:-2}
ES_RESP=""
# Escape double-quotes in the message for safe embedding in the container curl command
ESCAPED_MSG=$(printf '%s' "$MSG" | sed 's/"/\\"/g')
for i in $(seq 1 $ES_RETRIES); do
  # Run the query from inside the elasticsearch container to avoid host networking surprises
  ES_RESP=$(docker-compose -f "$ROOT_COMPOSE" exec -T elasticsearch sh -c "curl -sS -H 'Content-Type: application/json' -XPOST 'http://localhost:9200/_search' -d '{\"query\":{\"match\":{\"message\":\"$ESCAPED_MSG\"}},\"size\":5}'" || true)
  if [[ -n "$ES_RESP" && $(echo "$ES_RESP" | grep -c "$MSG" || true) -gt 0 ]]; then
    echo "Found document in Elasticsearch (attempt $i):"
    echo "$ES_RESP"
    break
  fi
  echo "Attempt $i/$ES_RETRIES: message not yet present in ES, sleeping ${ES_SLEEP}s..."
  sleep $ES_SLEEP
done
if [[ -z "$ES_RESP" || $(echo "$ES_RESP" | grep -c "$MSG" || true) -eq 0 ]]; then
  echo "Elasticsearch did not return the test message after $ES_RETRIES attempts. Last response:"
  echo "$ES_RESP"
fi

echo
echo -e "${BOLD_ORANGE_BG}Tail Filebeat and Logstash logs (last 200 lines each)${RESET}"

# Use docker-compose to show the last 200 lines of logs from the Filebeat and Logstash containers
ROOT_COMPOSE="$ROOT_DIR/docker-compose.yml"
docker-compose -f "$ROOT_COMPOSE" logs --tail=200 filebeat logstash



#### NOTES ############################################################
#set 
# -e: Exit immediately if a command exits with a non-zero status
# -u: Treat unset variables as an error and exit immediately
# -o pipefail: Causes a pipeline to fail if any command in it fails

#curl
# -s: Silent mode (no progress output)
# pretty: Formats JSON response to be human-readable

#docker-compose
# -f monitor/docker-compose.yml: Use a specific docker-compose file
# --tail=200: Show only the last 200 lines
######################################################################
