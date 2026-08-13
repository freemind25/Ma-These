@echo off
chcp 65001 >nul 2>&1
title ThesisFrame - Installation et Lancement

echo.
echo  ╔══════════════════════════════════════════════════════════╗
echo  ║            ThesisFrame v1.1.0 - Assistant de these      ║
echo  ║           Installation automatique et lancement          ║
echo  ╚══════════════════════════════════════════════════════════╝
echo.

:: Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERREUR] Node.js n'est pas installe sur votre machine.
    echo.
    echo  Veuillez telecharger et installer Node.js depuis :
    echo  https://nodejs.org
    echo.
    echo  Choisissez la version LTS (recommandee).
    echo  Apres l'installation, relancez ce script.
    echo.
    pause
    exit /b 1
)

:: Show Node.js version
for /f "tokens=*" %%v in ('node --version') do set NODE_VER=%%v
echo  [OK] Node.js version : %NODE_VER%
echo.

:: Step 1: Install dependencies
if exist node_modules (
    echo  [ETAPE 1/3] Dependances deja installees, verification...
    call npm install --prefer-offline 2>nul
) else (
    echo  [ETAPE 1/3] Installation des dependances...
    echo  (cela peut prendre 1-2 minutes)
    call npm install
)
echo.

if %errorlevel% neq 0 (
    echo  [ERREUR] L'installation des dependances a echoue.
    echo  Verifiez votre connexion internet et reessayez.
    pause
    exit /b 1
)
echo  [OK] Dependances installees avec succes.
echo.

:: Step 2: Build
echo  [ETAPE 2/3] Compilation de l'application...
call npm run build
echo.

if %errorlevel% neq 0 (
    echo  [ERREUR] La compilation a echoue.
    echo  Essayez de supprimer le dossier .next et relancez ce script.
    pause
    exit /b 1
)
echo  [OK] Compilation terminee avec succes.
echo.

:: Step 3: Start server
echo  [ETAPE 3/3] Demarrage du serveur...
echo.
echo  ═══════════════════════════════════════════════════════════
echo  ThesisFrame est en cours de demarrage...
echo  Ouverture du navigateur dans quelques secondes...
echo  ═══════════════════════════════════════════════════════════
echo.
echo  Adresse : http://localhost:3000
echo  Pour arreter : Fermez cette fenetre ou Ctrl+C
echo.

:: Start the server and open browser after delay
set NODE_ENV=production
set PORT=3000
set HOSTNAME=127.0.0.1
set DATABASE_URL=file:./db/custom.db

:: Open browser after 8 seconds
start /b cmd /c "timeout /t 8 /nobreak >nul && start http://localhost:3000"

:: Start the Next.js server
node .next/standalone/server.js

pause
