#!/usr/bin/env bash
set -euo pipefail

# Idempotent cert generation for local dev (Filebeat <-> Logstash TLS PoC)
# - Writes certs into ../certs (relative to this script)
# - Safe to re-run; will skip existing files

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
CERT_DIR="$ROOT_DIR/certs"
OPENSSL_CNF="$CERT_DIR/openssl.cnf"

mkdir -p "$CERT_DIR"

cat > "$OPENSSL_CNF" <<'EOF'
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req

[req_distinguished_name]

[ v3_req ]
subjectAltName = @alt_names

[alt_names]
DNS.1 = logstash
DNS.2 = localhost
DNS.3 = host.docker.internal
IP.1 = 127.0.0.1
IP.2 = ::1
EOF

# Create CA if missing
if [[ ! -f "$CERT_DIR/ca.crt" || ! -f "$CERT_DIR/ca.key" ]]; then
  echo "Creating CA key and certificate..."
  openssl genrsa -out "$CERT_DIR/ca.key" 4096
  openssl req -x509 -new -nodes -key "$CERT_DIR/ca.key" -sha256 -days 3650 -out "$CERT_DIR/ca.crt" -subj "/CN=transcendence-CA"
else
  echo "CA already exists, skipping generation"
fi

# Create Logstash cert if missing
if [[ ! -f "$CERT_DIR/logstash.crt" || ! -f "$CERT_DIR/logstash.key" ]]; then
  echo "Creating Logstash key, CSR, and signed certificate..."
  openssl genrsa -out "$CERT_DIR/logstash.key" 2048
  openssl req -new -key "$CERT_DIR/logstash.key" -out "$CERT_DIR/logstash.csr" -subj "/CN=logstash" -config "$OPENSSL_CNF"
  openssl x509 -req -in "$CERT_DIR/logstash.csr" -CA "$CERT_DIR/ca.crt" -CAkey "$CERT_DIR/ca.key" -CAcreateserial -out "$CERT_DIR/logstash.crt" -days 365 -sha256 -extensions v3_req -extfile "$OPENSSL_CNF"
  rm -f "$CERT_DIR/logstash.csr"
else
  echo "Logstash cert already exists, skipping generation"
fi

# Create Filebeat cert if missing
if [[ ! -f "$CERT_DIR/filebeat.crt" || ! -f "$CERT_DIR/filebeat.key" ]]; then
  echo "Creating Filebeat key, CSR, and signed certificate..."
  openssl genrsa -out "$CERT_DIR/filebeat.key" 2048
  openssl req -new -key "$CERT_DIR/filebeat.key" -out "$CERT_DIR/filebeat.csr" -subj "/CN=filebeat" -config "$OPENSSL_CNF"
  openssl x509 -req -in "$CERT_DIR/filebeat.csr" -CA "$CERT_DIR/ca.crt" -CAkey "$CERT_DIR/ca.key" -CAcreateserial -out "$CERT_DIR/filebeat.crt" -days 365 -sha256 -extensions v3_req -extfile "$OPENSSL_CNF"
  rm -f "$CERT_DIR/filebeat.csr"
else
  echo "Filebeat cert already exists, skipping generation"
fi

# Tighten private key permissions (owner read/write, group read)
if command -v chmod >/dev/null 2>&1; then
  chmod 640 "$CERT_DIR"/*.key || true
fi

echo "Certificates are present in: $CERT_DIR"
ls -l "$CERT_DIR"

# Reminder: certs dir is gitignored; do not commit keys
cat <<'NOTE'

Done. Files created/verified above. These are intended for local dev only.
The `monitor/docker-compose.yml` mounts `./certs` into the Logstash and Filebeat containers.
If you change certs, restart the containers: `docker-compose -f monitor/docker-compose.yml up -d --force-recreate logstash filebeat`

NOTE
