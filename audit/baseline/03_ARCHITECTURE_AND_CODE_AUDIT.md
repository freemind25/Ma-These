# 03 — Audit Architecture & Qualité du Code (Phase 3)

**Audit** : BASELINE AUDIT v1.0 — phase 3 (architecture & code)
**App** : ThesisFrame v1.10.8 — commit audité `2156a8f` (main, synchronisé)
**Date** : 2026-10-09
**Mode** : lecture seule — aucune modification de fichier (hors ce livrable). Chaque verdict est adossé à une commande exécutée pendant ce cycle (sortie clé copiée, expurgée si besoin).
**Méthode** : faits mesurés uniquement. La dette technique n'est classée critique que si son impact réel est démontré.

---

## 1. Architecture réelle

### 1.1 Schéma texte (constaté, pas souhaité)

```
┌─────────────────────────────────────────────────────────────────────┐
│ NAVIGATEUR / TAURI WEBVIEW (desktop Windows, non testable ici)      │
│                                                                     │
│  page.tsx (182 l.) ── 47 imports STATIQUES de modules de vues       │
│    └── switch currentView (47 cases) — SPA sans routage URL         │
│  État : Zustand app-store.ts (491 l., 47 NAVIGATION_ITEMS)          │
│  + useAiConfig (clés IA via cookie httpOnly)                        │
│                                                                     │
│  fetch("/api/…") ─────────────────────────┐                         │
└───────────────────────────────────────────┼─────────────────────────┘
                                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│ PROCESS NODE UNIQUE (next dev -p 3000 / standalone)                 │
│                                                                     │
│  98 fichiers route.ts sous src/app/api/ (55 entrées : 53 groupes    │
│  + route.ts racine "Hello, world!" + son test)                      │
│    │ zod (58 fichiers) ou api-schemas.ts partagé (23 fichiers)      │
│    │ ou validation manuelle (40 fichiers)                           │
│    ▼                                                                │
│  src/lib/db.ts ── PrismaClient (singleton global, log:['query'])    │
│    ▼                                                                │
│  SQLite db/custom.db (30 modèles ; corpus 248 Mo = PDF en blobs)    │
│                                                                     │
│  WORKER IN-PROCESS (src/instrumentation.ts → startJobWorker)        │
│    • singleton globalThis.__tfJobWorker (anti-doublon HMR)          │
│    • setInterval 3 s — 1 job par tick — poll table Job              │
│    • requeueStaleJobs() au boot + sweep 60 s (reprise orphelins)    │
│    • handlers câblés en dur : noop, deep-research, veille-check,    │
│      article-import-ocr                                             │
│    ▼                                                                │
│  OCR Tesseract in-process (vendor/tessdata fra/eng/ara)             │
└───────────────┬─────────────────────────────────────────────────────┘
                ▼ services externes (sortie réseau)
  26 fournisseurs IA (ALL_PROVIDER_IDS, ai-types.ts:324 — clés env-only
  + cookie httpOnly) · OpenAlex(+clé)/CrossRef/HAL/arXiv/theses.fr/CORE
  · Overpass/Nominatim · APInex
```

### 1.2 Points de défaillance uniques (SPOF)

| SPOF | Preuve | Impact réel |
|---|---|---|
| **Un seul process Node** héberge front + API + worker + OCR | `src/instrumentation.ts:8-13` (worker au boot du serveur) | Crash du serveur = perte de tout, MAIS reprise prévue (jobs orphelins requalifiés). OOM historique documenté puis corrigé (défaut ②, preuves RSS plat 2,2-2,36 Go sur 30 pages — worklog). |
| **SQLite fichier unique** `db/custom.db` | `prisma/schema.prisma` datasource `file:./db/custom.db` ; worklog : blobs 162-248 Mo | Tout le corpus (PDF inclus) dans un seul fichier ; **aucune procédure de sauvegarde documentée** — une perte réelle a déjà eu lieu (rollback du 8 oct., backups /tmp purgés ; corpus reconstruit de façon déterministe). |
| **Worker non isolé** | `src/lib/jobs/worker.ts` (350 l., handlers importés directement : deep-research-pipeline, veille, OCR) | Un handler qui fuit de mémoire ou plante impacte le serveur HTTP lui-même. Mitigé par `terminate()` par page OCR + plafond pixels (testé). |

### 1.3 Couplages forts

1. **page.tsx importe statiquement les 47 modules de vues** (`src/app/page.tsx:5-57`) — pas de code splitting par vue : tout le front est dans le bundle initial. Acceptable en local/desktop ; frein si publication web.
2. **Worker à handlers câblés en dur** (`worker.ts:36-40` registre `HANDLERS` dans la closure) — tout nouveau type de job = modification du worker (pas de plugin).
3. **Contrats front/back implicites** hors api-schemas.ts : 40 fichiers de routes sans zod ni api-schemas (mesure §2.7).
4. **app-store unique** (47 ids de navigation) — couplage nav ↔ modules centralisé, mais lisible (491 lignes).

### 1.4 Frontières de confiance

- **Aucune authentification** — par conception, mono-utilisateur local (baseline §2, N/A).
- **Clés IA** : 100 % `process.env` côté serveur (`src/lib/ai/hardcoded-keys.ts`, 80 l., 9 `process.env`, 0 clé littérale — grep `sk-…` : 1 hit = commentaire doc) ; clés utilisateur en **cookie httpOnly** prioritaire (`src/lib/ai/resolve-ai-config.ts:34`, fallback `_aiConfig` body pour compat).
- **Entrée fichiers** : `/api/article-imports` valide taille (pré-contrôle content-length → 413), extension (415), **magic bytes** (415) avant extraction — frontière d'entrée solide.
- **Injection HTML** : 1 seul `dangerouslySetInnerHTML` sur tout le front (shadcn `chart.tsx:83`, composant standard).
- **Zone grise** : l'API n'a ni token CSRF ni restriction d'origine — n'importe quel onglet de la machine peut appeler `/api`. Acceptable en local, **à documenter avant packaging Tauri** (si l'app servait une interface exposée).

---

## 2. Mesures concrètes (commandes réelles, 2026-10-09)

### 2.1 Lint

`bun run lint` → **✖ 244 problems (0 errors, 244 warnings)**

Top 5 règles (extraction `awk '{print $NF}'` sur les lignes warning) :

| # | Règle | Occurrences |
|---|---|---|
| 1 | `@typescript-eslint/no-explicit-any` | 129 |
| 2 | `@typescript-eslint/no-unused-vars` | 39 |
| 3 | `@typescript-eslint/no-non-null-assertion` | 35 |
| 4 | `no-console` | 31 |
| 5 | `react-hooks/exhaustive-deps` | 5 |

(0 erreur : le niveau warning est un choix de config assumé — dette typage visible, non bloquante.)

### 2.2 Tests

`bun run test:run 2>&1 | tail -15` :

```
 Test Files  78 passed (78)
      Tests  1658 passed (1658)
   Duration  18.24s
```

**78 fichiers / 1 658 tests, 100 % verts, 18 s** (up par rapport à la baseline 63/1 452 du 2026-09-18).

### 2.3 Routes API et couverture de tests

- `ls src/app/api/ | wc -l` → **55** (53 groupes de routes + `route.ts` racine "Hello, world!" + `route.test.ts`).
- `find src/app/api -name 'route.ts' | grep -v test | wc -l` → **98 fichiers de route**.
- Fichiers `*.test.ts` sous `src/app/api/` → **52** (colocalisés, ex. `references/bibtex/route.test.ts`).
- Groupes avec ≥ 1 test : **29/53** ; sans aucun test : **24** (veille, translate, theses, stats-recompute, parts, paper2code, osm-infra, legal-refs, jobs, export-docx, experiments, deep-research, core, coherence-check, citation-check, books, book-skills, arxiv, articles, apinex, alignement-preuves, ai-probe, ai-keys, ai-config). Beaucoup de ces groupes sans test sont des proxys vers des API externes (arxiv, apinex, core, books…) ou des wrappers IA.

### 2.4 Poids des plus gros fichiers TS/TSX

`find src -name '*.ts' -o -name '*.tsx' | xargs wc -l | sort -rn | head -12` (total src : **106 840 lignes**) :

```
1939 src/modules/auto-edition/auto-edition-page.tsx
1845 src/lib/api-schemas.test.ts
1836 src/modules/verification-carto/verification-carto-page.tsx
1684 src/modules/livres-competences/livres-competences-page.tsx
1678 src/lib/osm-infra.ts
1665 src/modules/diagrammes/diagrammes-page.tsx
1569 src/modules/article-redaction/article-redaction-page.tsx
1563 src/modules/outils-slr/outils-slr-page.tsx
1425 src/modules/apa-composer/apa-composer-page.tsx
1375 src/modules/onglet-recherche/onglet-recherche-page.tsx
1356 src/modules/verification-methodo/verification-methodo-page.tsx
1340 src/modules/deblocage-ecriture/deblocage-ecriture-page.tsx
```

Les plus gros fichiers sont des **pages de module front** (composants autosuffisants) ; côté lib, `osm-infra.ts` (1 678 l. dont ~930 l. de données de mapping OSM) et `api-schemas.test.ts` (tests).

### 2.5 Injection HTML et typage

- `grep -rn 'dangerouslySetInnerHTML' src --include='*.tsx' | wc -l` → **1** : `src/components/ui/chart.tsx:83` (composant shadcn standard, injection de CSS de thème — top 3 des emplacements inutile, il n'y en a qu'un).
- Dette typage : grep word-boundary `any` dans `src/lib` → **8** occurrences ; sur tout `src/`, le lint compte **129 warnings `no-explicit-any`**, concentrés dans les pages de modules (fichiers >1 300 l. ci-dessus). `src/lib` est globalement typé.

### 2.6 Dépendances & versions majeures

`bun pm ls 2>/dev/null | head -5` → `node_modules (985)` paquets, `bun.lock` présent (320 663 octets).

Extrait package.json : **next ^16.1.1, react ^19.0.0, zod ^4.0.2, zustand ^5.0.6, @prisma/client ^6.11.1, typescript ^5, vitest ^4.1.11, @tauri-apps/api ^2** — toutes les dépendances majeures sont sur les versions majeures actuelles.

### 2.7 Validation d'entrée (mesure globale)

- 98 fichiers route.ts ; **58 importent zod** (`from "zod"` ou `"zod/v4"`), **23 importent `@/lib/api-schemas`** (recouvrement partiel) → **40 fichiers sans zod ni api-schemas** (ex. `article-imports/route.ts` — justifié : multipart avec contrôles dédiés ; mais aussi `ai-probe`, `citation-check`, `search`, `ai-keys`…).
- Codes HTTP mesurés (grep `status: [0-9]{3}` hors tests) : 400×152, 500×150, 404×45, 201×26, 502×23, 422×5, 504×4, 415×3, 503×2, 413×2, 409×2, 401×2, 429×1 — palette riche et sémantique, pas de « tout 200 ».

### 2.8 Variables d'environnement

- `grep -rhoE 'process\.env\.[A-Z_]+' src src-tauri --include='*.ts' | sort -u | wc -l` → **37 vars lues**.
- `.env.example` → **32 vars déclarées** (`^[A-Z_]+=`) + 4 runtime documentées en commentaires (NODE_ENV, NEXT_RUNTIME, PORT, TAURI — « fournies par Next.js, la plateforme ou le launcher Tauri »).
- **Lues mais absentes de .env.example** : `NEXT_RUNTIME, NODE_ENV, OCR_MAX_PAGES, PORT, TAURI, TESSDATA_PATH`. Après déduction des 4 runtime documentées : **2 réellement absentes — `OCR_MAX_PAGES` et `TESSDATA_PATH`** (tunables OCR fonctionnels, utilisés par `worker.ts` / moteur OCR).

### 2.9 Worker Job — démarrage, doublon, reprise

- **Démarrage** : `src/instrumentation.ts:8-13` — `register()` appelé au boot du serveur Next, `if (process.env.NEXT_RUNTIME === "nodejs")` → `startJobWorker()`. (Grep `startJobWorker|initWorker` : 3 hits, un seul point de démarrage.)
- **Anti-doublon** : état global `globalThis.__tfJobWorker ??= { started: false, … }` + `if (state.started) return` (`worker.ts:296-306`) — survit aux recompilations HMR du module.
- **Reprise** : `requeueStaleJobs()` au démarrage (`worker.ts:317-323`, « jobs orphelins requalifiés en attente ») + balayage périodique toutes les 60 s (`STALE_SWEEP_EVERY_MS`, l.237) + claim atomique par `updateMany` conditionnel (`queue.ts:44-67`, commentaire : « garantit qu'un seul worker s'approprie le job »).
- **Cadence** : poll 3 s, **1 job par tick** ; garde anti-empilement veille (`worker.ts:275-283` : au plus 1 job pending/running par veille).

---

## 3. Qualité du code (échantillonnage des plus gros modules)

### 3.1 Cinq points forts (preuves fichier:ligne)

1. **Schémas de validation centralisés partagés** — `src/lib/api-schemas.ts` (488 l., 38 schémas exportés) consommés par 23 fichiers de routes, avec **suite de tests dédiée de 1 845 lignes** (`src/lib/api-schemas.test.ts`, 2ᵉ plus gros fichier du dépôt) : le contrat front/back est testé pour lui-même.
2. **File de jobs persistante de qualité production** — claim atomique `updateMany` conditionnel (`src/lib/jobs/queue.ts:52`), reprise des orphelins au boot et par sweep 60 s (`src/lib/jobs/worker.ts:317-333`), progression persistée (`Job.progress`/`progressNote`, schema l.554-578), `timer.unref()` pour ne pas bloquer l'arrêt (`worker.ts:347-349`).
3. **Erreurs HTTP honnêtes et différenciées** — `src/app/api/article-imports/route.ts:33-70` : 413 par pré-contrôle content-length AVANT parsing, 415 format puis 415 magic bytes (« fichier corrompu ou renommé ? »), 422 extraction (« échoue HONNÊTEMENT », en-tête l.21). Recette réelle : 53 Mo → 413 lisible (worklog).
4. **Tests colocalisés à grande échelle** — 52 fichiers `route.test.ts` dans l'arborescence API, 1 658 tests verts en 18 s ; tests métier significatifs (ex. `ocr-engine.test.ts` : « réduit les images géantes (plafond pixels — garde mémoire OOM) »).
5. **Traçabilité spec → code dans les commentaires** — `src/lib/jobs/worker.ts:1-8`, `src/instrumentation.ts:1-6`, `article-imports/route.ts:18-23`, `worker.ts:272-275` citent les specs et CA (A.8, veille-check-auto T4, import-size-limit CA-2) : la lecture du code renvoie à la preuve.

### 3.2 Cinq faiblesses (preuves fichier:ligne, impact évalué)

1. **Pas de pagination sur les listes** — `src/app/api/references/route.ts:29-32` : `findMany({ where, orderBy })` sans `take` (table entière renvoyée) ; idem `entries`, `articles` ; seuls **5/29 fichiers** à `findMany` paginent (dont `jobs/route.ts:58`, plafonné à 100). Impact réel : faible aujourd'hui (base locale, quelques milliers de lignes max), croissant avec le corpus.
2. **Route scaffold morte livrée** — `src/app/api/route.ts:1-8` : `GET /api` → `{ message: "Hello, world!" }` + son `route.test.ts` : bruit de contrat, aucun appelant (grep `"/api"` hors tests : 0 hit).
3. **Log de requêtes Prisma inconditionnel** — `src/lib/db.ts:6-11` : `new PrismaClient({ log: ['query'] })` activé y compris en production (le conditionnel `NODE_ENV` ne porte que sur le singleton global) : bruit I/O en desktop packagé.
4. **Fuite potentielle de messages d'erreur internes** — `src/app/api/ai-writing/route.ts:100-101` : `return NextResponse.json({ error: message }, { status: 500 })` renvoie `error.message` brut au client (idem motif dans d'autres routes IA). Impact réel faible en mono-utilisateur local (le client EST le propriétaire) ; à durcir si exposition réseau.
5. **Appels externes sans timeout dans osm-infra** — `src/lib/osm-infra.ts` (`executeOverpassQuery` l.1470, `geocodeLocation` l.1613) : 0 occurrence de `signal`/`AbortSignal`/`timeout` dans le fichier, alors que `zai-client.ts`, `veille/run-check.ts`, `research/openalex.ts`, `research/academic-fallback.ts` en utilisent (12 occurrences / 4 fichiers). Impact : une requête Overpass bloquée (endpoint géo-bloqué constaté en baseline : HTTP 000) peut pendre indéfiniment dans la vue OSM.

(Fait non classé en faiblesse : modules front monolithiques — `auto-edition-page.tsx` 1 939 l., 44 hooks —, mais cohérents et lints propres ; dette de forme, pas de fond.)

---

## 4. API et contrats (4 routes échantillonnées)

| Route | Validation d'entrée | Codes HTTP | Gestion d'erreur | Pagination |
|---|---|---|---|---|
| `references/route.ts` (73 l.) | **zod partagé** `createReferenceSchema.parse` (l.55) + `ZodError → 400 { error, details: flatten() }` (l.61-65) ; GET : filtres type/source/favorites/search construits en `where` | 201 / 400 / 500 | 500 générique loggé (`console.error` l.39, 67) | **Aucune** (l.29-32, sans `take`) |
| `ai-writing/route.ts` (119 l.) | **zod inline** borné : prompt 10-50 000 car., contexte ≤ 100 000 (l.17-23) ; mode vérifié contre registre `WRITING_MODES` → 400 avec liste des modes valides (l.32-37) ; `_aiConfig: z.unknown()` (compat cookie httpOnly) | 400 / 500 | ZodError→400 ; 500 renvoie `error.message` brut (l.100-101 — voir §3.2-4) | n/a (POST unique) ; GET = catalogue des modes |
| `jobs/route.ts` (84 l.) | **zod inline + refine dynamique** : `type` validé contre `getRegisteredJobTypes()` (l.13-17), `payload` en `record(string, unknown)` | 201 (id/type/status/createdAt) / 400 / 500 | ZodError→400 flatten ; 500 générique | GET : `limit` **plafonné à 100** (l.58) + `select` projection explicite (payload/result non exposés) ; pas de cursor/offset |
| `article-imports/route.ts` (201 l.) | **manuelle rigoureuse (FormData)** : content-length pré-contrôlée → 413 (l.33-41), `File` requis → 400 (l.47-49), type détecté → 415 (l.51-57), **magic bytes** → 415 (l.65-70), extraction → 422 avec motif (l.94-103) ; `runtime = "nodejs"` explicite (l.16) | 201 / 400 / 413 / 415 / 422 / 500 | Messages d'erreur actionnables en français, incluant la taille reçue vs max | GET liste / GET ?id / DELETE ?id |

**Constat transversal** : le style de contrat est cohérent (`{ data: … }` / `{ error, details }`), la sémantique HTTP réelle et mesurée (§2.7) ; l'écart principal est l'absence de pagination sur les listes et 40 fichiers sans schéma déclaré.

---

## 5. Base de données

- **Schéma** : `grep -c '^model ' prisma/schema.prisma` → **30 modèles** (Thesis, Chapter, ChapterVersion, Part, ThesisCadrage(+Field/Version), DoctoralToolbox, SoutenancePrep, ResearchTab, Reference, ResearchSource, NotebookEntry, AgileSprint/Story, CustomBookSkill, LegalRef, Article(+Version), ImportedDoc, LicenseKey, ElementAnalyse, TypeAnalyseMethodologique, SessionVerification, DocumentChunk, Experiment(+Run), Job, SavedSearch(+Result)).
- **Contraintes** : `onDelete` → **15 relations** (Cascade/SetNull, ex. schema l.58-59 : Chapter→Thesis Cascade, Chapter→Part SetNull) ; **41 `@@index`** (Job indexé sur `[status]` et `[type]`, l.579-580) ; 2 `@@unique`. Couverture relationnelle saine.
- **Migrations** : `ls prisma/migrations` → **n'existe pas** (0 entrée). Workflow assumé : script `"db:push": "prisma db push --accept-data-loss"` (package.json l.12), documenté dans `.env.example` (« workflow db:push, aucune migration versionnée »). `prisma migrate dev` est proposé (`db:migrate`) mais sans historique de migrations.
- **Risque documenté du `--accept-data-loss`** : toute évolution du schéma peut détruire colonnes/données sans garde-fou ni point de restauration versionné — sur une base contenant le corpus (PDF en blobs, 162-248 Mo constatés en worklog). En pratique le propriétaire travaille sur machine unique et la baseline fige le schéma ; le risque est **réel mais contenu**, conditionné à l'absence de sauvegarde.
- **Sauvegarde** : **aucune procédure documentée** (grep `sauvegarde|backup` dans docs/ et README : uniquement le versioning applicatif ChapterVersion/Cadrage, pas la sauvegarde du fichier db). Les backups constatés dans le worklog étaient ad-hoc sous /tmp et **ont été perdus** lors du rollback du 8 oct. (corpus reconstruit de façon déterministe — preuve qu'une reconstruction est possible, mais coûteuse).
- **Seed** : `"db:seed": "bun prisma/seed.ts"` référence un fichier **absent** (`ls prisma/` → `schema.prisma` uniquement) — script cassé.

---

## 6. Dépendances & reproductibilité

- **Lockfile** : `bun.lock` présent (320 Ko, commité) — installation reproductible ; 985 paquets installés.
- **Scripts npm** : complets et corrects (dev/build/start/lint/test/test:run/coverage/db:*/tauri:*) ; deux défauts : `db:seed` → fichier inexistant (§5) ; `"start"` suppose un build standalone (`node .next/standalone/server.js`) cohérent avec `next build`, non vérifiable dans cet environnement (build interdit — réserve baseline §6.2).
- **README** : section Installation complète (l.166-234) : Prérequis, `bun install`, Variables d'environnement (optionnelles), Scripts disponibles, Tests, Versionnage. Un nouveau poste peut installer l'app à partir du seul README + `.env.example`.
- **`.env.example`** : exemplaire — 32 vars avec placeholders, commentaires d'usage (clés optionnelles, fallback CrossRef+HAL documenté), section runtime séparée ; seuls `OCR_MAX_PAGES` et `TESSDATA_PATH` manquent à l'appel (§2.8).
- **Majeures actuelles** : Next ^16.1.1, React ^19, zod ^4.0.2, zustand ^5, Prisma ^6.11.1, TS ^5, vitest ^4.1.11, Tauri ^2 (§2.6). Aucune dépendance majeure en retard de génération.

---

## 7. Verdicts par domaine

| # | Item | Verdict | Preuve (commande → sortie clé) |
|---|---|---|---|
| 1 | Architecture front (SPA 47 vues, Zustand) | ✅ CONFORME | `page.tsx` 182 l., 47 `case` (grep), 47 ids dans app-store ; baseline : 0 vue morte |
| 2 | Lint | ✅ CONFORME | `bun run lint` → `244 problems (0 errors, 244 warnings)` ; top règle = no-explicit-any 129 (dette admise, niveau warning) |
| 3 | Suite de tests | ✅ CONFORME | `bun run test:run` → `Test Files 78 passed (78) / Tests 1658 passed (1658)` en 18,24 s |
| 4 | Couverture tests des routes API | ⚠️ DÉGRADÉ | 52 `route.test.ts` mais 29/53 groupes couverts ; 24 groupes sans test (jobs, deep-research, arxiv, articles…) — qualité excellente là où ça existe |
| 5 | Validation d'entrée API | ⚠️ DÉGRADÉ | 58/98 fichiers avec zod (+23 api-schemas) ; 40 sans schéma déclaré ; les 4 routes échantillonnées sont bien validées (§4) |
| 6 | Sémantique HTTP & erreurs | ✅ CONFORME | Codes mesurés : 400×152, 404×45, 502×23, 413/415/422/409… ; article-imports 413 avant parsing (route.ts:33-41) |
| 7 | Pagination des listes | ⚠️ DÉGRADÉ | 5/29 fichiers findMany avec `take` ; references/entries/articles sans pagination (references/route.ts:29-32) — impact faible en base locale |
| 8 | Worker file de jobs | ✅ CONFORME | instrumentation.ts:8-13 (démarrage unique) ; anti-doublon globalThis (worker.ts:296-306) ; reprise orphelins boot+sweep 60 s (317-333) ; claim atomique (queue.ts:52) |
| 9 | OCR in-process | ✅ CONFORME | vendor/tessdata fra/eng/ara présents ; test plafond pixels OOM ; correctif RSS validé par mesure (worklog : RSS plat 2,2-2,36 Go / 30 pages) — dette packaging tessdata connue et consignée |
| 10 | Fournisseurs IA (26) | ✅ CONFORME | `ALL_PROVIDER_IDS` ai-types.ts:324 → 26 ids ; hardcoded-keys.ts 100 % process.env (0 clé littérale) ; cookie httpOnly (resolve-ai-config.ts:34) |
| 11 | Sécurité injection (XSS) | ✅ CONFORME | `dangerouslySetInnerHTML` : 1 occurrence (shadcn chart.tsx:83) — N/A auth multi-utilisateurs par conception |
| 12 | Schéma Prisma (modèles/index/onDelete) | ✅ CONFORME | 30 modèles, 15 onDelete, 41 @@index, Job indexé status+type (schema.prisma:579-580) |
| 13 | Migrations DB | ⚠️ DÉGRADÉ | `prisma/migrations` inexistant ; workflow `db push --accept-data-loss` (package.json:12) assumé et documenté (.env.example) — risque de perte de données sans garde-fou, contenu en usage local mono-poste |
| 14 | Sauvegarde des données | ⚠️ DÉGRADÉ | Aucune procédure documentée (grep docs) ; perte réelle au rollback 8 oct. (worklog) ; corpus 248 Mo dans la base — reconstruction déterministe possible mais coûteuse |
| 15 | Environnement / .env.example | ✅ CONFORME | 37 vars lues vs 32 déclarées + 4 runtime documentées en commentaires ; seules OCR_MAX_PAGES / TESSDATA_PATH absentes (tunables OCR) |
| 16 | Reproductibilité install | ✅ CONFORME | bun.lock (320 Ko) + README §Installation (l.166-234) + .env.example ; scripts complets — réserve : db:seed cassé (prisma/seed.ts absent), build non vérifiable ici |
| 17 | Hygiène (code mort, logs) | ⚠️ DÉGRADÉ (léger) | /api "Hello, world!" sans appelant (api/route.ts:1-8) ; Prisma `log:['query']` inconditionnel (db.ts:6-11) ; 31 warnings no-console |
| 18 | Timeouts appels externes | ⚠️ DÉGRADÉ (partiel) | AbortSignal présent dans zai-client/run-check/openalex/academic-fallback (12 occurrences) mais ABSENT de osm-infra.ts (Overpass/Nominatim) — endpoint géo déjà constaté bloqué en baseline |

**Aucun item ❌ CASSÉ.** Les ⚠️ sont tous documentés avec leur impact réel ; aucun n'est bloquant pour l'usage mono-utilisateur local actuel.

---

## 8. Synthèse

L'architecture observée est **cohérente avec la cible déclarée** (desktop local mono-utilisateur) : un process unique, une base SQLite fichier, un worker in-process avec mécanismes de reprise réels, et une frontière de confiance simple (clés serveur-only, cookie httpOnly, validation magique bytes des imports). Les fondations qualité sont au-dessus de la moyenne pour ce type de projet : 1 658 tests verts, lint 0 erreur, schémas zod partagés et testés, file de jobs persistante soignée.

Les marges de progression mesurées se concentrent sur quatre points : **l'absence de pagination** sur les listes (impact croissant avec le corpus), **le workflow DB sans migrations ni sauvegarde documentée** (le seul item où une perte réelle s'est déjà produite), **la couverture de tests inégale par groupe de routes** (24/53 sans test, surtout des proxys externes), et **les timeouts manquants côté osm-infra**. Deux scalpel mineurs : la route scaffold `/api` « Hello, world! » et le `log:['query']` Prisma inconditionnel.
