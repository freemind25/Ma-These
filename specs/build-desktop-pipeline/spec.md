# Spec — build-desktop-pipeline

Date : 2026-09-18 · Propriétaire : « go » (délégation active « je valide toutes vos prochaines actions ») · Priorité : résidence de la réserve R-CI du cycle prod-readiness-audit.

## 1. Problème

Le build desktop (installeur Windows NSIS) n'a **aucun pipeline versionné** : `scripts/build-tauri-prep.sh` l.3 référence `.github/workflows/build-desktop.yml` qui **n'existe pas** (référence orpheline consignée au groupe A de l'audit). La chaîne de production desktop est donc non reproductible : elle dépend de gestes manuels non documentés. Réserve R-CI : le build Tauri Windows n'est prouvé nulle part.

## 2. Critères d'acceptation

- **CA-1** : le workflow `.github/workflows/build-desktop.yml` existe, versionné, YAML valide (parsé), et **ressemble au contrat réel** de la chaîne : déclencheurs (tag `v*` + manuel), runner `windows-latest`, bun install, **garde-fou de drift** (`prisma migrate diff --exit-code` sur les 2 bases — comportement prouvé localement : 0 synchrone / 2 drift), toolchain Rust, `tauri-apps/tauri-action@v0` qui exécute `beforeBuildCommand` (`bash scripts/build-tauri-prep.sh`, configuré dans `tauri.conf.json` l.11), cible NSIS, artefact uploadé.
- **CA-2** : chaque contrat croisé du workflow est vérifié par lecture de preuve : (1) `tauri.conf.json` `beforeBuildCommand` → script existant ; (2) le script produit exactement les 2 ressources attendues par `tauri.conf.json` l.42-46 (`standalone.zip`, `node.exe` + `../db/*` du dépôt) ; (3) `next.config.ts` `output: "standalone"` requis par le script.
- **CA-3** : rien d'invérifiable n'est affirmé — le **run vert** reste une réserve nommée (pas de remote git, pas de cargo/Windows en sandbox) : preuve manquante exacte + acteur consignés.
- **CA-4** : le garde-fou drift ne modifie AUCUNE base (`migrate diff` est lecture seule — prouvé au cycle précédent) ; la CI échoue proprement si un schéma n'a pas été poussé, au lieu de distribuer un installeur avec une base désynchronisée (le défaut exact trouvé sur `urbanisme-test.db`).

## 3. Hors périmètre

Créer le dépôt distant / pousser (le propriétaire détient le dépôt) ; runners self-hosted ; signatures de code ( Authenticode) — recommandation consignée, pas implémentée ; builds macOS/Linux (conf cible `nsis` uniquement).
