# Bug — git-mode-normalization (dette d'import)

## Symptôme

424/433 fichiers suivis sont en mode git **100755** (exécutables) alors que ce sont des fichiers sources non exécutables (220 `.ts`, 114 `.tsx`, 19 `.md`, 18 `.png`, 7 `.txt`, 7 `.json`, 3 `.rs`, 2 `.patch`, 2 `.mjs`, 2 `.db`, 1 `.rar`, 1 `.prisma`, 5 `.sh` hors `.zscripts/`, `Caddyfile`…). Effet : pollutions de diffs (changements de mode parasites dans les patchs), faux signaux à tout futur audit de permissions, incohérence avec les fichiers créés dans l'environnement actuel (tous en 644).

## Reproduction

`git ls-files -s | awk '{print $1}' | sort | uniq -c` → `424 100755`, `9 100644`. Les 9 en 644 sont exactement les fichiers créés dans le sandbox actuel (7 artefacts `specs/`, 1 test HAL, `CONSTITUTION.md` restaurée le 2026-09-18, commit `8334a86`).

## Cause racine

Héritage du **commit d'import externe `1359333` (2026-09-15)** : l'arbre a été inscrit avec un bit exécutable généralisé (umask de la session d'origine). Anomalie cosmétique, zéro effet fonctionnel sur le contenu.

## Correctif proposé

`chmod 644` sur les **416** fichiers 755 hors `.zscripts/*.sh` ; les **8** scripts `.zscripts/*.sh` restent seuls en 755 (critère explicite du propriétaire). Ordre imposé par le propriétaire :

1. avant commit : confirmer l'exclusivité `.zscripts/*.sh` à 755 ;
2. **un seul commit `chore:`**, message explicite sur l'origine (import `1359333`), rien d'autre dans le périmètre ;
3. après commit : build Tauri complet ou, à défaut, `bun run build` pour vérifier qu'aucun script npm/hook ne dépendait implicitement d'un bit d'exécution sur un fichier normalisé.

### Due diligence pré-commit (dépendances au bit d'exécution)

- Exception `upload/` : `upload/LR.rar` et `upload/res.pdf` sont sur un montage **fuse.ossfs** (chmod refusé par le FS : « Operation not permitted ») → mode corrigé au niveau **index git uniquement** (`git update-index --chmod=644`) ; bits FS inchangés (777, propriété root), contenu intact, aucun risque d'exécution (binaires de documents, aucune référence dans les scripts/hooks).

- `scripts/build-tauri-prep.sh` (normalisé) : invoqué uniquement via `bash scripts/build-tauri-prep.sh` (`src-tauri/tauri.conf.json` l.8 `beforeBuildCommand`) — **indépendant du bit**.
- `tests/database-runtime-build.sh`, `tests/python-runtime-build.sh`, `tests/python-runtime-container.sh` (normalisés) : invocations croisées via `bash "$SCRIPT_DIR/…"` — **indépendant du bit**.
- `mini-services/geo-mcp-service/start.sh` (normalisé) : aucune invocation directe trouvée.
- Recherche `./…sh` sur tout le dépôt hors node_modules : **aucune exécution directe** d'un fichier normalisé.
- `package.json` : aucun appel `./` direct ; `build` = `prisma generate && next build` ; hooks `.bin/` de node_modules non suivis par git (bits intacts).
- Build Tauri **complet** : toolchain Rust (cargo/rustc) absente du sandbox → fallback autorisé par le propriétaire : `bun run build`. Le bundle Tauri Windows est produit par GitHub Actions (protocole, Étape 3).

## Test de non-régression

Après commit : `git diff --cached --summary` 100 % `mode change` (zéro contenu), `git ls-files -s` → seuls `.zscripts/*.sh` en 755 ; puis `bun run build` → succès ; `bun run test:run` → 1428/1428 ; dev server redémarré, route `/` rendue (HTTP 200 + capture navigateur).
