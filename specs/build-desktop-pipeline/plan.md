# Plan — build-desktop-pipeline

## 1. Contrats réels mesurés (tout a été lu, rien n'est supposé)

| Contrat | Preuve |
|---|---|
| `tauri.conf.json` l.11 `beforeBuildCommand: "bash scripts/build-tauri-prep.sh"` | lu aujourd'hui |
| Le script l.22 appelle `bun run build` (= `prisma generate && next build`, `package.json` l.8) | lu |
| `next.config.ts` l.4 `output: "standalone"` | lu |
| Le script l.48/l.50 produit `build/tauri-bundle/standalone.zip` (PowerShell si `RUNNER_OS=Windows`) | lu |
| Le script l.60-71 copie `node.exe` (Windows uniquement) | lu |
| `tauri.conf.json` l.42-46 : resources = `../db/*`, `../build/tauri-bundle/standalone.zip`, `../build/tauri-bundle/node.exe` | lu (groupe F) |
| `frontendDist: ../dist-tauri` — placeholder statique `dist-tauri/index.html` versionné (8 Ko) | lu (groupe F) |
| Garde-fou : `migrate diff --exit-code` → **0 = synchrone (custom.db)**, **2 = drift (copie fabriquée)**, lecture seule | exécuté aujourd'hui |
| Framework Tauri = **v2** (Cargo.toml l.13/l.16) ; « 1.10.7 » = version du **produit** (`tauri.conf.json` l.4) | lu |
| Clé OpenAlex runtime-only depuis T14 — aucun secret à injecter au build | cycle précédent |

## 2. Décisions de conception

1. **tauri-action** (`tauri-apps/tauri-action@v0`) plutôt que `cargo tauri build` brut : c'est le contrat attendu par le commentaire du script de préparation (« turi-action beforeBuildCommand »), il télécharge NSIS et publie l'artefact.
2. **Déclencheurs** : `push.tags: ['v*']` (release versionnée) + `workflow_dispatch` (build à la demande) — pas de build sur chaque push : le bundle desktop coûte ~20 min de runner.
3. **Garde-fou drift AVANT le build** : échec précoce, message clair, aucune base modifiée.
4. **Upload d'artefact** (`actions/upload-artifact@v4`) en plus du release tauri-action : permet de récupérer l'installeur sans publier de release.
5. Aucune clé API au build (T14 : runtime-only) — le workflow le documente en commentaire.

## 3. Risques

- **R1** : la conf Tauri v2 attend `tauri-action@v0` récent (support v2) — la version majeure @v0 est la branche supportant v2 ; consigné.
- **R2** : le run vert reste invérifiable en sandbox (CA-3) — réserve nommée, acteur : propriétaire (pousser le dépôt, déclencher, récupérer l'URL de run).
- **R3** : `bun` sur runner Windows — `oven-sh/setup-bun@v2` supporte windows-latest.
