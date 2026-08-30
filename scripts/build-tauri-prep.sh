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
# Le client compilé est requis par le serveur standalone
if [ -f "prisma/schema.prisma" ]; then
  echo "[1/5] Generating Prisma client..."
  bunx prisma generate --schema=prisma/schema.prisma
else
  echo "[1/5] Skipping Prisma (no schema found)"
fi

# 2. Build Next.js en mode standalone
# output: "standalone" dans next.config.ts → produit .next/standalone/
echo "[2/5] Building Next.js standalone..."
bun run build

# 3. Préparer le répertoire de bundle
echo "[3/5] Preparing bundle directory..."
rm -rf build/tauri-bundle
mkdir -p build/tauri-bundle

# 4. Copier le serveur standalone
# .next/standalone/ contient : server.js, node_modules/, package.json
cp -r .next/standalone build/tauri-bundle/standalone

# Next.js standalone ne copie PAS les fichiers statiques — on les ajoute manuellement
mkdir -p build/tauri-bundle/standalone/.next/static
cp -r .next/static/* build/tauri-bundle/standalone/.next/static/

# Copier le répertoire public (logo, etc.)
if [ -d "public" ]; then
  cp -r public build/tauri-bundle/standalone/public
fi

# 5. Copier node.exe (Windows uniquement)
# Sur windows-latest (GitHub Actions), node est installé dans C:\Program Files\nodejs
# Git Bash expose un chemin Unix vers node.exe
if [[ "${RUNNER_OS:-}" == "Windows" ]] || command -v node.exe &>/dev/null; then
  # Trouver node.exe
  if command -v node.exe &>/dev/null; then
    NODE_BIN=$(command -v node.exe)
  elif command -v node &>/dev/null; then
    NODE_BIN=$(command -v node)
  fi
  if [ -n "${NODE_BIN:-}" ] && [ -f "$NODE_BIN" ]; then
    cp "$NODE_BIN" build/tauri-bundle/node.exe
    echo "[5/5] Copied node.exe from $NODE_BIN ($(du -sh build/tauri-bundle/node.exe | cut -f1))"
  else
    echo "[5/5] WARNING: node.exe not found in PATH, desktop build may fail"
  fi
else
  echo "[5/5] Not on Windows, skipping node.exe copy"
fi

echo ""
echo "=== Bundle ready ==="
du -sh build/tauri-bundle/
du -sh build/tauri-bundle/standalone/
ls -la build/tauri-bundle/node.exe 2>/dev/null || echo "(no node.exe — not Windows)"
echo "=== Done ==="
