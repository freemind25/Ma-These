#!/bin/bash
# build-tauri-prep.sh — Prépare le bundle pour le build Tauri desktop
# Utilisé par .github/workflows/build-desktop.yml (tauri-action beforeBuildCommand)
# Exécution : depuis la racine du projet
set -euo pipefail

echo "=== Tauri Build Prep ==="
echo "Node: $(node --version)"
echo "Bun:  $(bun --version)"
echo "PWD:  $(pwd)"

# 1. Générer le client Prisma
if [ -f "prisma/schema.prisma" ]; then
  echo "[1/6] Generating Prisma client..."
  bunx prisma generate --schema=prisma/schema.prisma
else
  echo "[1/6] Skipping Prisma (no schema found)"
fi

# 2. Build Next.js en mode standalone
echo "[2/6] Building Next.js standalone..."
bun run build

# 3. Préparer le répertoire de bundle
echo "[3/6] Preparing bundle directory..."
rm -rf build/tauri-bundle
mkdir -p build/tauri-bundle/standalone

# 4. Copier le serveur standalone + static + public
cp -r .next/standalone/* build/tauri-bundle/standalone/
cp -r .next/standalone/.next build/tauri-bundle/standalone/
mkdir -p build/tauri-bundle/standalone/.next/static
cp -r .next/static/* build/tauri-bundle/standalone/.next/static/
if [ -d "public" ]; then
  cp -r public build/tauri-bundle/standalone/public
fi

FILE_COUNT=$(find build/tauri-bundle/standalone -type f | wc -l)
echo "  Standalone: $FILE_COUNT fichiers"

# 5. Zipper le standalone
# Le glob Tauri resources ne gère pas les dizaines de milliers de fichiers (node_modules).
# On zippe et on extrait au runtime avec PowerShell.
echo "[5/6] Zipping standalone ($FILE_COUNT files)..."
if [[ "${RUNNER_OS:-}" == "Windows" ]]; then
  # PowerShell : créer standalone.zip contenant le dossier standalone/
  # Commande sur une seule ligne pour éviter les problèmes de parsing bash→PS
  powershell -NoProfile -NonInteractive -Command "Compress-Archive -Path 'build/tauri-bundle/standalone' -DestinationPath 'build/tauri-bundle/standalone.zip' -Force"
else
  (cd build/tauri-bundle/standalone && zip -r ../standalone.zip .)
fi
STANDALONE_ZIP_SIZE=$(du -sh build/tauri-bundle/standalone.zip | cut -f1)
echo "  standalone.zip: $STANDALONE_ZIP_SIZE"

# Supprimer le dossier standalone non-zippé
rm -rf build/tauri-bundle/standalone

# 6. Copier node.exe (Windows uniquement)
echo "[6/6] Copying node.exe..."
if [[ "${RUNNER_OS:-}" == "Windows" ]] || command -v node.exe &>/dev/null; then
  if command -v node.exe &>/dev/null; then
    NODE_BIN=$(command -v node.exe)
  elif command -v node &>/dev/null; then
    NODE_BIN=$(command -v node)
  fi
  if [ -n "${NODE_BIN:-}" ] && [ -f "$NODE_BIN" ]; then
    cp "$NODE_BIN" build/tauri-bundle/node.exe
    echo "  node.exe: $(du -sh build/tauri-bundle/node.exe | cut -f1)"
  else
    echo "  WARNING: node.exe not found in PATH"
  fi
else
  echo "  Not on Windows, skipping node.exe"
fi

echo ""
echo "=== Bundle ready ==="
du -sh build/tauri-bundle/standalone.zip
du -sh build/tauri-bundle/node.exe 2>/dev/null || true
echo "=== Done ==="
