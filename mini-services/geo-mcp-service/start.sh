#!/bin/bash
# Keep-alive wrapper for geo-mcp-service
DIR="$(cd "$(dirname "$0")" && pwd)"
while true; do
  echo "[geo-mcp] Starting..."
  bun "$DIR/index.ts"
 echo "[geo-mcp] Exited with code $?. Restarting in 2s..."
  sleep 2
done
