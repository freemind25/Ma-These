# Preuves — prod-readiness-audit

Méthode : chaque point = commande réelle exécutée, sortie collée, horodatée (fuseau sandbox Etc/GMT-1). Toute preuve impossible en sandbox est une **réserve nommée** (MD-1), jamais simulée.

## Groupe A — Build & CI (2026-09-18, ~12:30-12:45)

### T1 + T1b — `bun run build` : ÉCHEC initial, puis SUCCÈS après corrections minimales

**1re exécution — ÉCHEC (exit 1)** — découverte majeure de l'audit : deux erreurs TypeScript bloquent le build de HEAD `2a8a4e3` (la suite vitest ne typechecke pas, le serveur de dev non plus) :

```
bun run build > /tmp/p1-build.log 2>&1 ; echo "EXIT=$?"     → EXIT=1
✓ Compiled successfully in 25.4s
  Running TypeScript ...
Failed to compile.

./src/lib/veille/run-check.ts:290:5
Type error: Type 'Date | null' is not assignable to type 'Date'.
    > 290 |     checkedAt: updated.lastCheckedAt,

./src/modules/veille-academique/veille-academique-page.tsx:275:41   (2e exécution, 1er point corrigé)
Type error: Type '(id: string) => Promise<boolean>' is not assignable
to type '() => Promise<boolean>'.
```

**T1b — corrections minimales** (annoncées conformément au mandat : « les corrections nécessaires deviennent des tâches dans les groupes correspondants »), commit `e17e233` :
- `src/lib/veille/run-check.ts` l.277-293 : l'horodatage `new Date()` est capturé une fois (`const checkedAt`), écrit et retourné — mêmes valeurs exactes, suppression de l'accès nullable `updated.lastCheckedAt` (introduit au cycle `veille-check-auto` T2).
- `src/modules/veille-academique/veille-academique-page.tsx` l.275 : `onCheck={() => runCheck(selected.id)}` — aligné sur le pattern existant l.308 (`VeilleDetail` attend `() => Promise<boolean>`, cf. l.471) ; régression introduite au cycle `veille-academique` (vue détail).

**3e exécution — SUCCÈS (exit 0)** :

```
bun run build > /tmp/p1-build3.log 2>&1 ; echo "EXIT=$?"    → EXIT=0
▲ Next.js 16.1.3 (Turbopack)
✓ Compiled successfully in 26.4s
  Running TypeScript ...
   [routes listées : ƒ /api/… complet, ƒ Proxy (Middleware)]
○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

**Warnings consignés (MD-3)** — 0 warning bloquant, 2 notes :
1. `⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.` — non bloquant ; le renommage `src/middleware.ts` → `proxy.ts` est une correction **hors périmètre** (transverse) → **recommandation** au rapport final.
2. `Experiments (use with caution): serverActions` — configuration volontaire (`next.config.ts`), consignée.

Effet secondaire documenté : le build écrase `.next/` utilisé par le serveur de dev (page `/` en 000) → redémarrage selon la procédure `docs/EXPLOITATION-SERVEUR.md` (kill + relance), santé prouvée : `curl /` → 200, `curl /api/stats` → 200.

### T2 — Propreté git : ✓ CONFORME

```
git status --short (après commit T1b)      → (vide)
git ls-files -s | rg '^100755' | rg -v '\.zscripts' → (vide)  NB755-hors-zscripts: 0
git show --stat 0348dcb | tail -1          → 419 files changed, 114 insertions(+)
git branch --show-current                  → main
```

Le mandat mentionnait « chmod 410 fichiers » ; le chiffre réel prouvé est **419** (MD-6). Aucun mode 755 hors `.zscripts/*.sh` — la normalisation est bien committée.

### T3 — CI / build Tauri Windows : ✓ RÉSERVE NOMMÉE (preuve impossible ici, MD-1)

```
ls -d .github                    → ls: cannot access '.github': No such file or directory
git remote -v                    → (sortie vide — aucun remote configuré)
rg -n 'build-desktop' scripts/build-tauri-prep.sh
  → 3:# Utilisé par .github/workflows/build-desktop.yml (tauri-action beforeBuildCommand)
which cargo rustc                 → (sortie vide — toolchain Rust absente)
git branch --show-current         → main
```

**Réserve P2** — le point du mandat (« le pipeline GitHub Actions passe de bout en bout, .exe généré et lancé au moins une fois ») est **impossible à prouver depuis ce sandbox** : aucun workflow versionné, aucun remote git, toolchain Rust/Windows absente (même `cargo check` impossible). Preuve manquante exacte : un run CI vert du workflow `build-desktop.yml` (URL du run GitHub) **ou** un build NSIS sur machine Windows avec lancement de l'exe. **Questions au propriétaire (recette)** : (1) le workflow `build-desktop.yml` existe-t-il dans un dépôt distant (le script de préparation le référence) ? (2) si oui, une URL de run vert peut-elle être fournie comme preuve ? (3) si non, sa création est une correction candidate **hors périmètre** de ce cycle (nouvelle annonce requise).

Constat associé (hygiène, sans modification) : binaires versionnés dans git — `upload/LR.rar`, `upload/res.pdf`, `db/custom.db`, `db/urbanisme-test.db`.

### Dépendances du groupe A vérifiées

- Commit T1b : `e17e233` — 2 fichiers, +7/−4.
- Lignes rouges : `theses-en-ligne/search/route.ts`, `arxiv/search/route.ts`, `app-sidebar.tsx` — non touchés (le diff du commit le prouve).

## Groupe B — Tests & qualité (2026-09-18, 14:09-14:12)

### T4 — Suite complète : ✓ VERTE

```
bun run test:run        → EXIT=0
 Test Files  63 passed (63)
      Tests  1452 passed (1452)
   Start at  14:09:30 · Duration 15.21s

bunx vitest run src/lib/ai/ai-types.test.ts → 39 passed (39)
git log --oneline --all -3 -- src/lib/ai/ai-types.test.ts :
  0348dcb chore: normalisation des modes git
  e6eeb82 test: ai-types-provider-count — compte fige aligne sur le catalogue (18 -> 20)
  6463078 (import externe)
```

Le correctif du cycle précédent (`e6eeb82`, 18 → 20) est bien présent en HEAD et le test ciblé est vert (39 tests, y compris le compte figé 20). Aucun échec sur la suite entière.

### T5 — Lint dépôt entier : ✓ 0 ERREUR (230 warnings non bloquants, qualifiés)

```
bun run lint   (= eslint .)   → EXIT=0
✖ 230 problems (0 errors, 230 warnings)
  0 errors and 2 warnings potentially fixable with the `--fix` option.
```

Nature des warnings (extraction du log) : `no-explicit-any` 129 · `no-unused-vars` 39 · `no-non-null-assertion` 35 · `no-console` 17 · `exhaustive-deps` 5 · `no-img-element` 3 · directive eslint-disable inutilisée 1 (le résidu d'extraction ≈ 1). **Conforme au critère du mandat (« 0 erreur bloquante »)** — les warnings sont de la dette de style, aucun ne masque une erreur. Recommandation hors périmètre : un pass `--fix` + traiter `no-explicit-any` progressivement.

### T6 — Inventaire couverture routes API : ✓ INVENTAIRE (aucune correction, MD-5)

Producteur : `git ls-files 'src/app/api' | rg '/route\.ts$'` croisé avec l'existence d'un `route.test.ts` adjacent.

**Total : 84 `route.ts` — 47 avec test — 37 sans test.**

Les 37 sans `route.test.ts`, classées par risque (classification raisonnée sur le code réel, tags vérifiés manuellement) :

**Réseau externe / coût IA (17)** — un échec ou un quota peut impacter l'utilisateur sans être détecté par la suite :
`api/ai-probe`, `api/apinex/balance`, `api/apinex/chat`, `api/apinex/models`, `api/apinex/web-search`, **`api/arxiv/search` (ligne rouge — jamais modifiée, jamais testée)**, `api/books`, `api/citation-check`, `api/coherence-check`, `api/core/search`, `api/deep-research`, `api/osm-infra`, `api/theses/detail`, `api/theses/persons`, `api/theses/search`, `api/translate`

**Mutation de données / file de traitements (18)** :
`api/ai-config`, `api/ai-keys`, `api/alignement-preuves`, `api/book-skills`, `api/book-skills/[id]`, `api/chapters/[id]/versions`, `api/experiments`, `api/experiments/[id]`, `api/experiments/[id]/runs`, `api/experiments/[id]/runs/[runId]`, `api/jobs`, `api/jobs/[id]`, `api/parts/[id]`, `api/stats-recompute`, `api/veille`, `api/veille/[id]`, `api/veille/[id]/check`, `api/veille/[id]/results` (logique métier pure couverte indirectement par `check-core.test.ts`, 24 tests — pas de test de route)

**Lecture / IO local (2)** : `api/theses/stats` (agrégats DB), `api/export-docx` (génération de fichier, sans réseau)

Constat chiffré : le précédent cycle de corrections avait doté `api/theses-en-ligne/search` d'un test (présent : `route.test.ts`, 14 tests) — son équivalent ligne rouge `api/arxiv/search` reste **sans aucun test**. Correction hors périmètre (inventaire demandé) → **recommandation** au rapport final.

## Groupe C — Schéma & données (2026-09-18, 14:45-14:47)

### T7 — Drift schéma/bases : ✓ CUSTOM.DB = ZÉRO DRIFT · ⚠️ URBANISME-TEST.DB = DRIFT (4 tables)

```
ls prisma/migrations          → "No such file or directory"
```
**Constat : aucune migration versionnée** — le projet est 100 % en workflow `db:push`, l'état du schéma n'est garanti que par la commande, pas par un historique.

```
bunx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-url file:db/custom.db
  → No difference detected.   EXIT=0        (base propriétaire : synchrone)

bunx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-url file:db/urbanisme-test.db
  → [-] Removed tables
      - Experiment
      - ExperimentRun
      - SavedSearch
      - SavedSearchResult      EXIT=0        (base de test : EN RETARD)

# diff inverse (confirmation de direction) :
bunx prisma migrate diff --from-url file:db/urbanisme-test.db --to-schema-datamodel prisma/schema.prisma
  → [+] Added tables (les 4 mêmes) + 6 index manquants :
      Experiment(status) · ExperimentRun(experimentId, status) ·
      SavedSearch(source) · SavedSearchResult(savedSearchId, unique savedSearchId+externalId)
```

Métadonnées fichiers : `db/custom.db` — 9 994 240 o, modifié **2026-09-18 11:48** ; `db/urbanisme-test.db` — 491 520 o, modifié **2026-09-16 07:51**. Les tables `Experiment`/`SavedSearch*` ont été poussées sur `custom.db` lors de cycles ultérieurs au 16/09 sans re-synchronisation de la base de test (RAPPORT-CORRECTIONS-ANNEXE-A1-A13.md mentionnait « poussées sur custom.db et urbanisme-test.db » — vrai à la date du rapport, faux aujourd'hui).

**Portée du constat** : `EXPLOITATION-SERVEUR.md` qualifie `urbanisme-test.db` de « base du test de production ». Utilisée telle quelle pour un test de production, toute fonctionnalité Expériences ou Recherches sauvegardées échouera (tables absentes). **Correction candidate (hors liste → question recette)** : ré-exécuter `db:push` sur `urbanisme-test.db`. Aucune modification exécutée (règle du mandat).

### T8 — Cartographie `db: push --accept-data-loss` : ✓ CONFORME AU PLAN (2 écarts de numéro de ligne consignés)

```
package.json l.12 (le mandat disait l.14 — écart consigné) :
  "db:push": "prisma db push --accept-data-loss",

.zscripts/build.sh l.146 (conforme) :
  bash "$SCRIPT_DIR/database-runtime-build.sh"

.zscripts/database-runtime-build.sh (audit complet, 34 lignes) :
  l.8   SOURCE_DB_PATH="$PROJECT_DIR/db/custom.db"
  l.10  TARGET_DB_PATH="$TARGET_DB_DIR/custom.db"          # copie artefact
  l.16  cp -a "$SOURCE_DB_DIR/." "$TARGET_DB_DIR/"         # copie, jamais push
  l.18  (si source absente) « 将初始化空的生产数据库 »        # init vide dans l'artefact
  l.24  DATABASE_URL="file:$TARGET_DB_PATH" bun run db:push # (mandat disait l.27 — écart consigné)
```

**Arbre d'appel** : `.zscripts/build.sh` l.146 → `database-runtime-build.sh` l.24 → `package.json` l.12 (`prisma db push --accept-data-loss`). La cible du push automatique est **exclusivement** la copie dans l'artefact de build ; la base source n'est jamais la cible d'un push (elle n'est que copiée). Le flag `--accept-data-loss` est permanent dans le script npm : tout `bun run db:push` **manuel** s'exécute lui aussi sans prompt — caractérisé comme risque résiduel d'usage, pas de chaîne automatique.

**Test de non-régression** : `tests/database-runtime-build.sh` (75 lignes) **exécuté en sandbox** :

```
bash tests/database-runtime-build.sh   → EXIT=0 · « database runtime build tests passed »
```
Il prouve par mock de `bun` : (1) sans base preview → init vide dans l'artefact, **aucun fichier créé dans le projet** (`test ! -e "$EMPTY_PROJECT/db/custom.db"`) ; (2) avec base preview → données + fichiers adjacents copiés tels quels ; (3) exactement 2 appels db:push, tous deux avec `DATABASE_URL=file:<artefact>` absolu. Le comportement « automatique au build, sur la copie artefact uniquement » est donc **prouvé par test**, pas seulement par lecture.
