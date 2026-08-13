@echo off
REM ============================================================
REM  ThesisFrame - Quick start (development / testing)
REM  Runs the standalone server from the project root.
REM ============================================================

set NODE_ENV=production
set PORT=3000
set HOSTNAME=127.0.0.1
set DATABASE_URL=file:./db/custom.db

node .next/standalone/server.js

pause
