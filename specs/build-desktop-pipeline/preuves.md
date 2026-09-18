# Preuves — build-desktop-pipeline (2026-09-18, 15:42-15:52)

## T1 — Workflow créé et versionné : ✓

```
.github/workflows/build-desktop.yml — 102 lignes, YAML VALIDE (parsé yaml.safe_load)
name: build-desktop · job build-windows · runs-on: windows-latest · permissions: contents: write
Déclencheurs : push.tags v* + workflow_dispatch
8 steps : Checkout@v4 · setup-bun@v2 · bun install · Garde-fou drift (lecture seule) ·
          rust-toolchain@stable (x86_64-pc-windows-msvc) · rust-cache@v2 (src-tauri) ·
          tauri-action@v0 (tauriScript: bunx tauri, args --target x86_64-pc-windows-msvc,
          release draft v__VERSION__) · upload-artifact@v4 (nsis/*.exe, if-no-files-found: error)
```

## T2 — Contrats croisés vérifiés par lecture : ✓

```
tauri.conf.json l.8  : "beforeBuildCommand": "bash scripts/build-tauri-prep.sh"  ← tauri-action l'exécute
tauri.conf.json l.10 : "frontendDist": "../dist-tauri"                            ← placeholder versionné (groupe F : 8 Ko, 1 fichier)
tauri.conf.json l.42-46 : resources = ../db/* + ../build/tauri-bundle/standalone.zip + node.exe
                       ← exactement les 2 produits du script de préparation (l.48/l.50 zip ; l.60-71 node.exe)
next.config.ts l.4   : output: "standalone"                                       ← requis par le script l.30-31
package.json l.8     : "build": "prisma generate && next build"                   ← appelé par le script l.22
scripts/build-tauri-prep.sh l.45-48 : branche RUNNER_OS=Windows (PowerShell Compress-Archive) ← runner CI = windows
```

## T3 — Garde-fou drift prouvé localement : ✓ (2 mesures opposées)

```
bunx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-url file:db/custom.db --exit-code
  → « No difference detected. » EXIT=0        (base synchrone → step vert)
copie de drift fabriquée (DROP TABLE Experiment sur copie temporaire, base réelle intacte) :
bunx prisma migrate diff … --to-url file:/tmp/drift-test.db --exit-code
  → « [-] Removed tables - Experiment » EXIT=2 (drift → step ROUGE via set -e)
```
Lecture seule prouvée au cycle prod-readiness-audit (T7) : le garde-fou ne modifie aucune base. La CI échoue AVANT tout build coûteux si un schéma n'a pas été poussé — le défaut exact constaté sur `urbanisme-test.db` pendant l'audit (4 tables en retard) ne peut plus passer inaperçu.

Première mesure de l'audit : DRIFT_EXIT initialement lu « 0 » à cause d'un pipe `| head` (capte le code de head) — re-mesuré proprement : **2**. Consigné pour la discipline de mesure.

## T4 — Verdict : ✓ WORKFLOW PRÊT — run vert = réserve nommée

Preuve manquante exacte : une URL de run GitHub Actions vert du workflow `build-desktop.yml` produisant un artefact `windows-installer` (ou un run en échec dont la cause est externalisée au dépôt). **Acteur : propriétaire** — le sandbox n'a ni remote git, ni cargo, ni Windows ; la chaîne complète hors CI est désormais versionnée et auditable localement (contrats croisés + garde-fou prouvés ici).

**Recette au propriétaire** : (1) pousser le dépôt sur GitHub ; (2) `workflow_dispatch` ou pousser un tag `v1.10.7` ; (3) fournir l'URL du run. Recommandations consignées (hors périmètre) : signature Authenticode de l'installeur ; secret `OPENALEX_API_KEY` à définir côté machines utilisateurs si quota dédié voulu (runtime-only, T14).
