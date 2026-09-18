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

## Groupe D — Secrets & configuration (2026-09-18, 14:52-15:02)

### T9 — Scan secrets HEAD : ✓ 1 SEUL SECRET RÉEL (le constat connu l.221), base saine

```
git ls-files | rg -i 'api[_-]?key|secret|bearer|sk-…' → 25 fichiers code (après exclusion tool-results/, *.md, tests)
rg '(api[_-]?key|secret|bearer|sk-…)\s*[:=]?\s*["…'][a-zA-Z0-9_-.]{16,}["…']  → AUCUN littéral codé en dur hormis :
src-tauri/src/lib.rs l.221 :  ("OPENALEX_API_KEY", "qsdRrHIuOptAWiFw3ErWLr")   (bloc l.219-223)
```
Injection : si `OPENALEX_API_KEY` absent de l'environnement au lancement, le process Next.js embarqué reçoit la clé en dur → **la clé voyage dans le binaire Tauri et donc dans chaque installeur Windows**. → traitement à la T14 (C-D2, décision propriétaire).

Faux positifs éliminés : `tool-results/` (transcripts d'outils, 2 fichiers) ; `src/lib/ai/hardcoded-keys.ts` — **nom trompeur, comportement sain** : ne contient aucune valeur, lit uniquement `process.env.*` (8 providers + `OPENROUTER_BACKUP_KEY`) ; recommandation hors périmètre : renommer (ex. `env-keys.ts`).

**Scan de la base `db/custom.db`** (versionnée dans git) : aucun pattern `sk-`/`gsk_`/`AIza` ; table `LicenseKey` = **0 ligne** ; les 5 hits `apikey|bearer` = noms de champs/champs vides de config. Aucun secret réel dans la base propriétaire.

### T10 — Scan historique git : verdict **JAMAIS PURGÉE** (le reste de l'historique est propre)

```
git log --all --oneline -S "qsdRrHIuOptAWiFw3ErWLr" →
  1359333  0b1ffc11-2589-4251-b6a2-977baa361415   (import externe : INTRODUCTION)
  2a8a4e3  docs: prod-readiness-audit (mon commit dossier — ajoute une OCCURRENCE CITÉE de la valeur dans specs/…/plan.md, même canal public ; consigné pour transparence)
git grep -c "qsdRrHIuOptAWiFw3ErWLr" HEAD -- src-tauri/src/lib.rs → 1   (encore en HEAD)
```
La clé est donc dans **tous** les objets git depuis `1359333` jusqu'à HEAD — jamais purgée. La purge par réécriture d'histoire est rejetée (plan §4) ; la remédiation efficace reste la **rotation de la clé** chez OpenAlex (option de C-D2).

Autres patterns sur tout l'historique (`sk-[a-z0-9]{25,}`, `gsk_…`, `AIza…`, clés OpenRouter littérales) : **zéro commit**.

### T11 — Artefacts de build locaux : ✓ PROPRES (1 résidu de cache dev consigné)

```
dist-tauri/  → 8 Ko, 1 seul fichier index.html (préparation) — scan -a (binaires inclus) : AUCUN hit
.next/       → 628 Mo — scan -a : 1 hit = .next/dev/cache/turbopack/731ace46/00001322.sst
build/       → inexistant
```
Le hit `.next/dev/...` est le **cache du serveur de développement** (contenu source indexé par Turbopack) — pas un artefact de production (un `next build` régénère `.next/`). Résidu de station de travail ; nettoyage non exécuté (hors périmètre, R4). Aucun artefact distribuable ne contient la clé.

### T12 — Inventaire configuration : 35 VARS CONFIRMÉES · scan Mendeley/piratage NÉGATIF · rapport MD-2 introuvable confirmé

```
rg -o 'process\.env\.[A-Z_][A-Z0-9_]*' src/ | sort -u  → 35 variables (liste complète en preuve)
.env         → 1 variable : DATABASE_URL (chemin SQLite local — PAS un secret) ; fichier versionné dans git (hygiène consignée)
.env.example → ABSENT (ls: cannot access)
```
Les 35 : 19 clés/URLs IA & recherche (ANTHROPIC_API_KEY…SILICONFLOW_API_KEY, CORE_API_KEY, OPENALEX_API_KEY, HF_TOKEN, GITHUB_TOKEN/GITHUB_MODELS_TOKEN…), 7 tunables applicatifs (DIRECTEUR_TIMEOUT_MS, RAG_*_WEIGHT…), 9 infra (NODE_ENV, PORT, NEXT_RUNTIME, TAURI, AI_PROVIDER…). → T13 (C-D1) produira le `.env.example` correspondant sur feu vert.

**Scan frais Mendeley + plateformes piratage** (HEAD + historique + artefacts + base) :

```
URLs https?://…(sci-hub|libgen|z-lib|arab-sci|annas-archive|b-ok|booksc) sur fichiers trackés → 0 hit
mots sci-hub/libgen/z-lib/arab-sci sur HEAD → 0 hit code (seulement mes docs d'audit tasks.md/plan.md)
git log --all -S 'sci-hub' → 2a8a4e3 uniquement (mes docs) ; -S 'libgen' → idem ; -S 'mendeley' → 1359333+90e3783 (parsers importés)+2a8a4e3
custom.db : mendeley ×14 (citations académiques : « Mendeley — a last.fm for research? »,Henning & Reichelt 2008) ; pirat ×43 = « aspirations », « evapotranspiration » ; sci-hub/libgen/z-lib ×0
.next artefacts : hits mendeley = chunks compilés des parsers légitimes
OAuth Mendeley : rg 'oauth' src/ filtré mendeley → AUCUN flux OAuth Mendeley dans le code
```
**Verdict MD-2 confirmé** : aucun lien vers plateforme de piratage, aucun flux OAuth Mendeley dans HEAD, l'historique, les artefacts ou la base. Le « rapport » visé par le mandat (Mendeley OAuth + liens piratage) est **introuvable dans le dépôt** — il s'agit d'un document externe que seul le propriétaire peut fournir pour un contre-examen.

## Groupe E — Fragilités connues (2026-09-18, 15:04-15:12)

### T15 — A.2 OpenAlex quota anonyme : verdict **CONTOURNÉ** (bascule auto prouvée, observée en direct)

```
src/lib/research/academic-fallback.ts l.2-6 : « OpenAlex indisponible (429 / budget épuisé) → bascule
automatique vers CrossRef + HAL avec triangulation des DOI » (registres publics sans clé)
src/lib/research/deep-research-pipeline.ts l.446-452 : déclenchement = 0 résultat curé OU échec détecté
                                      l.454-460 : raison tracée « budget API épuisé / rate-limit »
                                      l.462 : fallbackAcademicSearch() → l.467-476 objet fallback{triggered, providers, corroboratedDois…}
bunx vitest run src/lib/research/openalex.test.ts → 17 passed (17)
```
**Observation réseau EN DIRECT (2026-09-18 15:05)** : `curl api.openalex.org` → **HTTP 429** ; `curl api.crossref.org` → **HTTP 200**. Le scénario exact de la fragilité est actif dans l'environnement et le chemin de repli est joignable — le contournement est branché sur le pipeline réel (l.806). Réserve légère consignée : pas de test unitaire dédié à `academic-fallback.ts` (la curation partagée est couverte par `curation.test.ts`).

### T16 — A.3 maxTokens deep-research : verdict **CORRIGÉ** (réserve : pas de test unitaire dédié)

```
src/lib/research/deep-research-pipeline.ts :
  l.100  isLikelyTruncated()            — détecteur de troncature
  l.121-158  continueIfTruncated()      — passes de continuation (max 2), reprise EXACTE à la dernière phrase
  l.714  maxTokens: 12000               — quota de génération du rapport
  l.837 + l.915 : continueIfTruncated branché sur les DEUX chemins de génération
bunx vitest run src/lib/research → 2 fichiers, 39 passed (39)
```
Le mécanisme correspond à la correction racine décrite au plan (rapport tronqué 24 524 car. du rapport A.3 → prolongation automatique). Réserve consignée : aucune troncature réelle reproductible en sandbox sans appel IA payant — la preuve d'exécution reste le code + l'intégration aux 2 sites + la suite verte.

### T17 — A.7 Overpass : verdict **CORRIGÉ au niveau code** — réserve nommée MD-1 (exécution réelle non observable en sandbox)

```
src/lib/osm-infra.ts :
  l.1466  OVERPASS_ATTEMPTS = 3
  l.1467  OVERPASS_TIMEOUTS_MS = [25_000, 35_000, 45_000]   (timeout progressif)
  l.1468  OVERPASS_BACKOFF_MS = [2_000, 5_000]
  l.1475-1485  boucle : backoff, ALTERNANCE des endpoints (l.1484), timeout réécrit dans la requête [timeout:NN] (l.1488-1491)
  l.1404-1407  endpoints : overpass-api.de (officiel) + maps.mail.ru (miroir)
```
**Tentative d'observation réelle** : `overpass.kumi.systems` → HTTP 000 après 60 s (timeout) ; `overpass-api.de` → HTTP 000 en 0,53 s. **Les endpoints Overpass sont inatteignables depuis ce sandbox** (filtrage réseau — OpenAlex/CrossRef passent, Overpass non). Preuve manquante exacte : un log `[Overpass] Reprise n/2 …` produit par une recherche infra réelle depuis le poste du propriétaire. Acteur pouvant la produire : propriétaire. Pas de test unitaire dédié à la boucle de reprise (constat, recommandation).

### T18 — A.8/A.10 nohup/processus : verdict **CORRIGÉ** (architecture file persistante, preuve log en direct)

```
src/instrumentation.ts : register() → startJobWorker() DANS le process serveur (plus de processus détaché)
src/lib/jobs/worker.ts l.1-13 : boucle orphelins → pending → exécution → done/failed persistés ;
       handlers enregistrés : noop, deep-research, veille (runCheckForSavedSearch)
src/lib/jobs/queue.ts l.95 : requeueStaleJobs(10 min) — reprise des jobs orphelins après redémarrage
rg 'nohup|setsid' src/ → 0 usage en code (3 commentaires expliquant le remplacement)
dev.log l.10 : « [job-worker] Démarrage — file de tâches persistante (A.8) » — le worker TOURNE en ce moment
docs/EXPLOITATION-SERVEUR.md l.10-14 : cause A.8 diagnostiquée EXTERNE (l'environnement d'exécution tue
       les processus détachés à la frontière de session — reproduction contrôlée documentée)
```
Question MD-4 restée ouverte au propriétaire (recette) : quel mécanisme de supervision sur l'infrastructure de PRODUCTION cible (tini/systemd/service manager ?) — le document d'exploitation décrit l'arbre de boot du sandbox de test (tini → start.sh → caddy), pas celui de la cible.

### T19 — A.9 timeout directeur-chat : verdict **CORRIGÉ** (18/18 tests verts)

```
src/app/api/directeur-chat/route.ts :
  l.23  DIRECTEUR_TIMEOUT_MS = env DIRECTEUR_TIMEOUT_MS || 150_000   (défaut 150 s, documenté)
  l.26  DIRECTEUR_RETRY_TIMEOUT_MS = … || 120_000                    (relance plus courte)
  l.44-49  schéma zod : timeoutMs borné min 5_000 / max 180_000      (aucun appel sans limite possible)
  isTimeoutError() + relance automatique à prompt resserré (contexte tronqué, historique plafonné, consigne de concision)
bunx vitest run src/app/api/directeur-chat/route.test.ts → 18 passed (18)
```
Question MD-4 restée ouverte au propriétaire (recette) : la limite de timeout du proxy/hébergeur de la cible de production — si elle est < 150 s, la valeur nominale serait coupée en amont de l'application.

## Groupe F — Desktop (Tauri) (2026-09-18, 15:16-15:22)

### T20 — Capabilities vs usage réel : SUR-PRIVILÈGES CONSTATÉS · CSP null · DB embarquée — aucune modification (MD-5)

**Correction de version d'abord** : le dépôt est en **Tauri v2** — `src-tauri/Cargo.toml` l.13 `tauri-build = { version = "2" }`, l.16 `tauri = { version = "2" }`, `package.json` l.61-62 `@tauri-apps/api ^2` + `@tauri-apps/plugin-shell ^2` (le mandat mentionnait v1.10.7 — écart consigné, le format capabilities/default.json v2 confirme).

```
src-tauri/capabilities/default.json l.5-9 : permissions = ["core:default", "shell:allow-open", "shell:allow-execute"]
rg 'from "@tauri-apps' src/  → AUCUN import de l'API Tauri dans tout le frontend (0 fichier)
rg 'plugin-shell|invoke.*shell' src/  → 0 usage
lib.rs l.127 : .plugin(tauri_plugin_shell::init())   (plugin initialisé côté Rust, jamais appelé côté JS)
lib.rs l.96 : std::process::Command::new("powershell") — Expand-Archive du standalone.zip au premier
              lancement (-NoProfile -NonInteractive, chemins internes) — usage NATIF légitime, pas le plugin
lib.rs l.210 : Command::new(&node_exe) — lancement du serveur embarqué ; l.271 mem::forget(child) — détachement
```

**Verdict par permission** :
| Permission | Usage réel | Verdict |
|---|---|---|
| `core:default` | infrastructure v2 (événements, fenêtre) | **nécessaire** |
| `shell:allow-open` | 0 import JS | **sur-privilège** — à retirer (ou prouver un usage futur documenté) |
| `shell:allow-execute` | 0 import JS ; tout process passe par `std::process::Command` natif côté Rust | **sur-privilège critique** — autorise l'exécution de programmes arbitraires depuis le webview ; surface d'attaque pure en cas d'injection XSS |

**CSP** : `tauri.conf.json` l.27-29 `"csp": null` — confirmé. Aucune politique de contenu : faiblesse defense-in-depth (le contenu sert depuis le serveur local embarqué, ce qui borne l'exposition, mais une CSP explicite reste recommandée).

**Ressources embarquées** (`tauri.conf.json` l.42-46) : `../db/*` → `db/` dans le bundle, `standalone.zip`, `node.exe`. **Constat de confidentialité** : la base propriétaire `custom.db` (données de thèse réelles) est copiée dans CHAQUE installeur NSIS — distribuer le .exe = distribuer la base. Complète le constat d'hygiène du groupe A (binaires versionnés git).

**Recommandations (hors périmètre — aucune modification exécutée)** : (1) retirer `shell:allow-execute` puis `shell:allow-open` et `tauri_plugin_shell::init()` + déps `@tauri-apps/*` si aucun usage prévu ; (2) définir une CSP ; (3) décision produit sur l'embarquement de la DB (séparateur d'installeur / base vierge en distribution / purge avant build).

## Délégation du propriétaire (2026-09-18, 15:28-15:38) — exécution des corrections

Mandat : « vous êtes le spécialiste ici (le choix pris sera nécessairement le plus pertinent), faites le nécessaire. Je valide toutes vos prochaines actions. » → feu vert T13/T14 + choix C-D2 + ré-synchro autorisée. Déclaration Article 2 faite avant exécution ; lignes rouges non touchées.

### T13 — `.env.example` créé (C-D1) : ✓ FAIT

```
.env.example : 32 variables définissables, groupées (BD · IA 20 clés · recherche académique ·
endpoints · tunables A.9/RAG · runtime documentaire), placeholders « your-key-here », AUCUNE valeur réelle.
Correspondance prouvée : diff(inventaire src/ 35 vars, .env.example) =
  35 − 4 runtime documentaires (NODE_ENV, NEXT_RUNTIME, PORT, TAURI — « définies par l'environnement,
  ne pas définir manuellement ») + DATABASE_URL (lue par Prisma, pas par src/) = 32 ✓
DATABASE_URL : valeur par défaut « file:./db/custom.db » (chemin local documenté, pas un secret).
bun run lint → 0 erreur (warnings inchangés)
```

### T14 — clé OpenAlex sortie du code (C-D2 **option a : env-only**) : ✓ FAIT

Choix du spécialiste : (a) — alignée sur le pattern env-only de tous les autres secrets du projet ; desktop sans clé = quota anonyme **couvert par la bascule CrossRef/HAL prouvée en direct (T15)** ; l'option (c) (variable de build) exigerait le pipeline CI non prouvé (R-CI).

```
src-tauri/src/lib.rs l.220-230 : ("OPENALEX_API_KEY", "qsdRrHIu…") → ("OPENALEX_API_KEY", "")
  + commentaire T14/C-D2. Logique du bloc inchangée (default vide = ne pas écraser l'environnement).
grep post-modification sur src/ + src-tauri/ + .env.example + docs/ → 0 occurrence de la valeur.
docs/EXPLOITATION-SERVEUR.md §3 : procédure documentée (var OPENALEX_API_KEY à définir pour un
  quota dédié ; sinon quota anonyme + bascule A.2 ; renvoi .env.example ; recommandation de rotation).
```

**Réserves consignées** : (1) compilation Rust non vérifiable en sandbox (cargo absent — R-CI) ; le diff est une string literal → "" sans effet de type. (2) La valeur reste dans l'historique git (jamais purgée, T10) et dans 2 documents d'audit qui citent le constat (plan.md, preuves.md — même canal que l'historique, exposition inchangée) → **rotation de la clé chez OpenAlex = action propriétaire, seule remédiation effective**.

### Ré-synchronisation `urbanisme-test.db` : ✓ FAIT (épisode transparent consigné)

```
1er essai : DATABASE_URL="file:db/urbanisme-test.db" bun run db:push → INEFFICACE
  → Prisma résout les chemins file: relatifs au DOSSIER DU SCHÉMA (prisma/) : un résidu
    prisma/db/urbanisme-test.db vide a été créé, puis NETTOYÉ (rm -rf prisma/db).
  → Cette erreur VALIDE AVEC PREUVE le garde-fou du test de non-régression
    tests/database-runtime-build.sh (« database path must be absolute ») : la chaîne de
    build réelle (BUILD_DIR absolu) est correcte par construction.
2e essai : DATABASE_URL="file:/home/z/my-project/db/urbanisme-test.db" bun run db:push
  → bunx prisma migrate diff (schéma → urbanisme-test.db) : « No difference detected. » ✓
Intégrité des données (push additif pur, aucune table supprimée) : Thesis 1 · Chapter 7
  (identiques aux données du test de production) · Experiment 0 (table créée, vide).
```

### Retest Overpass (tentative de levée R-OVERPASS) : réserve MAINTENUE

```
curl overpass-api.de/api/interpreter → HTTP 000 en 0,50 s (blocage réseau sandbox, stable)
```
Preuve d'exécution réelle A.7 toujours à produire au poste du propriétaire : log `[Overpass] Reprise n/2`.
