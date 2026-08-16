# ThesisFrame — Build Desktop (Windows .exe)

## Prérequis

### Pour tous les OS
- [Bun](https://bun.sh/) >= 1.0
- [Node.js](https://nodejs.org/) >= 20 (pour les scripts)

### Pour Windows (.exe / .msi)
- [Rust](https://rustup.rs/) — stable toolchain
- [Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) — « C++ build tools » avec le SDK Windows
- [WebView2 Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) — préinstallé sur Windows 11

## Installation de Rust sur Windows

```powershell
# Télécharger et installer Rust
winget install Rustlang.Rustup
# OU : https://rustup.rs/

# Vérifier l'installation
rustc --version
cargo --version
```

## Build

```bash
# 1. Installer les dépendences
bun install

# 2. Initialiser la base de données
bun run db:push

# 3. Mode développement (navigateur + WebView Tauri)
bun run tauri:dev

# 4. Build production (.exe + .msi)
bun run tauri:build
```

## Artifacts

Après `bun run tauri:build`, les installateurs se trouvent dans :

```
src-tauri/target/release/bundle/
├── nsis/
│   └── ThesisFrame_1.3.0_x64-setup.exe    # Installer NSIS (recommandé)
└── msi/
    └── ThesisFrame_1.3.0_x64_en-US.msi     # Installer MSI
```

## Structure Tauri

```
src-tauri/
├── Cargo.toml          # Config Rust (dependencies, build)
├── build.rs            # Script de build Tauri
├── tauri.conf.json     # Config Tauri v2 (fenêtre, bundle, NSIS)
├── capabilities/
│   └── default.json    # Permissions (shell, open URL)
├── icons/
│   ├── 32x32.png
│   ├── 128x128.png
│   ├── 128x128@2x.png
│   ├── icon.ico
│   └── icon.png
└── src/
    ├── main.rs         # Point d'entrée (windows_subsystem = "windows")
    └── lib.rs          # Logique Tauri (setup, DB path, plugins)
```

## Bundle NSIS (Windows)

- Langues : Français, Anglais (sélecteur affiché)
- Mode d'installation : `currentUser` (pas besoin d'admin)
- Icône : `icon.ico` personnalisé
- Signature : SHA-256 (sans certificat par défaut)

## Notes techniques

- **Frontend** : Next.js standalone build → `.next/standalone/`
- **Database** : SQLite livrée dans le dossier `db/` à côté de l'exécutable
- **Port** : Tauri démarre le serveur Next.js en sidecar sur le port 3000 en interne
- **WebView** : Microsoft Edge WebView2 (système sur Windows 11, installable sur Windows 10)
