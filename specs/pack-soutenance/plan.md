# Plan — Pack Soutenance

## État réel constaté

- **Navigation** : `ViewId` = union de 44 ids (`src/lib/stores/app-store.ts` l.8-52) ; `NavigationItem` l.73-80 `{id, label, icon, description, badge?, category?}` ; `NAVIGATION_ITEMS` l.82-410 ; catégories l.54-61. Rendu : imports l.10-53 + switch `CurrentView()` l.59-154 de `src/app/page.tsx`. `ICON_MAP` (`src/components/layout/app-sidebar.tsx` l.71-77) : `ClipboardCheck` présent, `Presentation` absent — **fichier ligne rouge, non modifiable**.
- **IA** : `generateCompletion` (`src/lib/ai/zai-client.ts` l.481-562) avec `AiCompletionOptions` l.152-165 (`maxTokens`, `timeoutMs`, `providerConfig`) ; défaut maxTokens 4096 (l.277/288) → passer explicitement ; circuit breaker 3 échecs/30 s l.59-65. Config serveur : `resolveAiConfig` (`src/lib/ai/resolve-ai-config.ts` l.30-57, cookie httpOnly prioritaire) ; client : `withAiConfig(body)` (`src/hooks/use-ai-config.ts` l.184-190). Leçon du bug `generation-hypotheses` (mode passé mais inexistant → 400) : ici route dédiée, aucun mode `WRITING_MODES` requis.
- **Données** : `Thesis` l.17-37, `Chapter` l.39-62 (`title`, `plainText`, `wordCount`), `ThesisCadrage`/`Field` l.101-142 (`isActive`, `value`) — `prisma/schema.prisma`. `GET /api/thesis/[id]` inclut chapitres + cadrages (route l.15-22). Singleton `db` (`src/lib/db.ts` l.7-13).
- **Persistance 1:1 (pattern retenu)** : `DoctoralToolbox` (schema l.148-162 : `thesisId @unique`, colonnes JSON-string, cascade) + route `/api/thesis/[id]/doctoral-toolbox` (GET null si absent l.7-29, POST 409, PUT conditionnel l.95-112). Zod centralisé `src/lib/api-schemas.ts` (sprint l.273-318).
- **Terrain existant** : mode `defense` (`src/data/ai-writing-modes.ts` l.130-138) + `DEFENSE_PROMPT` (`src/lib/ai/specializations/defense.ts` l.7-33 : 5 blocs, questions jury 5 familles, 20-30 min) ; socle `PRESENTATION_MODULE` (knowledge-core l.855-889). Inspire les prompts, n'est pas modifié.
- **Compteurs** : « 44 modules » — README l.31/106/140, NOTICE l.12/71, NOTE-PRESENTATION l.23 ; AGENTS l.60/241 « 36 » (déjà obsolète). Aucun test n'impose 44 (`app-store.test.ts` l.215-253). → mise à jour centralisée en fin de session par l'orchestrateur (44 → 46), les tâches de ce cycle n'y touchent pas.
- **Tests** : pattern routes = mock `db` + `NextRequest` (ex. `src/app/api/thesis/[id]/chapters/route.test.ts`) ; vitest `src/**/*.test.ts`.

## Approche retenue

1. **Schéma** : modèle `SoutenancePrep` 1:1 (`thesisId @unique`, `slides String @default("[]")` JSON, `speech String @default("")`, `speechDurationMin Int @default(15)`, `questions String @default("[]")` JSON, timestamps, `onDelete: Cascade`) ; `db:push` avec diff avant/après + preuve de survie.
2. **Backend** : `src/lib/api-schemas.ts` (+ `soutenanceSchemas`) ; route `src/app/api/thesis/[id]/soutenance/route.ts` (GET = record ou null ; PUT upsert) ; route `src/app/api/soutenance/generate/route.ts` (POST zod : `thesisId`, `type` enum slides|speech|questions, `durationMin` 10|15|20, validation via `resolveAiConfig`) — construit le contexte thèse côté serveur (cadrage actif + chapitres, plainText tronqué à 1 200 chars/chapitre, plafond total 40 000 chars, titres toujours entiers), prompts dans `src/lib/ai/prompts/soutenance-prompts.ts`, `generateCompletion` maxTokens 2 500 (slides) / 8 000 (discours) / 6 000 (questions), temperature 0.5 ; slides/questions attendus en JSON — extraction du bloc JSON, échec de parse → 502 « réponse non structurée, relancez ».
3. **Frontend** : `src/modules/soutenance/soutenance-page.tsx` — 3 onglets (« Slides », « Discours », « Questions du jury »), react-query (`["soutenance", thesisId]`), états vides, spinners, toasts, boutons « Copier », relance avec confirmation ( AlertDialog) ; enregistrement : `ViewId "soutenance"` + entrée `NAVIGATION_ITEMS` (icône `ClipboardCheck`, catégorie `methodologie`, badge `IA`) + import/case `page.tsx` + entrée guide intégré (`usage-guide-dialog.tsx`).

## Alternatives écartées

- **Mode IA + `/api/ai-writing/stream`** : rejeté — sortie non structurée (JSON slides/questions impossible proprement) et leçon d'enregistrement double déjà violée par `generation-hypotheses`.
- **Modèle N:1 par artefact** (pattern ResearchTab) : rejeté — 3 artefacts fixes ne justifient pas 3 tables ni des routes d'entité ; 1:1 JSON est le pattern prouvé de la Boîte doctorale.
- **Streaming du discours** : rejeté — complexité SSE pour un artefact qu'on relit ensuite ; spinner + toasts suffisent (cohérence décision spec n°2).
- **Icône `Presentation`** : rejeté — absente de `ICON_MAP`, et la sidebar est une ligne rouge.

## Fichiers touchés

| Fichier | Nature | Risque |
|---|---|---|
| prisma/schema.prisma | modification | db:push — diff avant/après + preuve de survie des données requis |
| src/lib/api-schemas.ts | modification | faible — additions pures |
| src/app/api/thesis/[id]/soutenance/route.ts | création | faible |
| src/app/api/soutenance/generate/route.ts | création | moyen — parsing JSON IA, limites contexte |
| src/lib/ai/prompts/soutenance-prompts.ts | création | faible |
| src/modules/soutenance/soutenance-page.tsx | création | moyen — taille |
| src/lib/stores/app-store.ts | modification | faible — ViewId + 1 entrée (test ids uniques à maintenir vert) |
| src/app/page.tsx | modification | faible — import + case |
| src/components/layout/usage-guide-dialog.tsx | modification | faible — 1 entrée |
| src/app/api/thesis/[id]/soutenance/route.test.ts | création | — |
| src/app/api/soutenance/generate/route.test.ts | création | — |
| docs/NOTICE-UTILISATION.md | modification | section module (compteurs hors périmètre de ce cycle) |

**Lignes rouges (0 diff exigé avant chaque commit)** : `src/components/layout/app-sidebar.tsx`, `src/app/api/theses-en-ligne/search/route.ts`, `src/app/api/arxiv/search/route.ts`.

## Impacts transverses

- Schéma Prisma : 1 table ajoutée, aucune colonne modifiée → `db:push` sans perte anticipée ; preuve de survie exigée (Article 6).
- Navigation : +1 `ViewId` (46 modules après les deux cycles) ; aucun test n'impose 44.
- Aucune variable d'environnement ; aucun build Tauri ; aucun quota externe (IA via config fournisseur existante).

## Stratégie de vérification

- `bun run lint` (0 erreur) ; `bun run test:run` (suite verte complète).
- `curl` GET/PUT `/api/thesis/[id]/soutenance` (null → PUT → GET persistant → 400 zod).
- `curl` POST `/api/soutenance/generate` sans config → erreur propre ; validation zod 400.
- Navigateur (agent-browser) : module dans la sidebar, 3 onglets, états vides, génération réelle des 3 artefacts si un fournisseur est configuré (sinon états d'erreur propres — consigné), persistance après rechargement, copie, mobile 390 px, captures `test-snapshots/soutenance-*.png`.

## Risques

- Parse JSON IA fragile → extraction de bloc + message d'erreur actionnable (relance).
- Contexte thèse volumineux → troncature prouvée dans preuves (comptage chars).
- `db:push` sur `custom.db` → Article 6 : diff + survie des données avant continuation.
- Régression navigation → suite complète + ids uniques.
