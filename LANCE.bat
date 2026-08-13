@echo off
chcp 65001 >nul 2>&1
title ThesisFrame

echo.
echo  ═══════════════════════════════════════════════════════════
echo  ThesisFrame v1.1.0 - Demarrage rapide
echo  ═══════════════════════════════════════════════════════════
echo.

:: Check if build exists
if not exist .next\standalone\server.js (
    echo  [ERREUR] L'application n'a pas ete compilee.
    echo  Veuillez d'abord double-cliquer sur INSTALL-ET-LANCE.bat
    pause
    exit /b 1
)

echo  Adresse : http://localhost:3000
echo  Pour arreter : Fermez cette fenetre ou Ctrl+C
echo.

set NODE_ENV=production
set PORT=3000
set HOSTNAME=127.0.0.1
set DATABASE_URL=file:./db/custom.db

:: Open browser after 5 seconds
start /b cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:3000"

node .next/standalone/server.js

pause
