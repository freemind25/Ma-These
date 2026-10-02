# Plan — Générateur de brouillon de chapitre

## État réel constaté

- **Chapitres** : `Chapter` (`prisma/schema.prisma` l.39-62 — `content` HTML Tiptap, `plainText`, `wordCount`, `targetWordCount`, `status`) ; **PUT** (pas PATCH) `/api/chapters/[id]` crée **automatiquement** une `ChapterVersion` si le contenu change (`contentWillChange` l.25-30, `db.chapterVersion.create` l.39-47) — garde-fou A.4 gratuit pour l'insertion ; `updateChapterSchema` (`src/lib/api-schemas.ts` l.58-69). Hooks `useThesis`/`useUpdateChapter` (`src/modules/editor/hooks/use-thesis.ts` l.73-197).
- **IA streaming** : `/api/ai-writing/stream` refuse les modes `customEndpoint` (l.37-42), corps `{mode, prompt, context}` (context max 100 000) ; SSE `data: {type:'chunk'}` ; client exemple `ai-writing-page.tsx` l.174-203 (parsing SSE, bouton Arrêter). maxTokens défaut 4096 (`zai-client.ts` l.720/730) → **trop court** pour un chapitre ; pattern long : deep-research `maxTokens: 12000` + `continueIfTruncated` (`src/lib/research/deep-research-pipeline.ts` l.124-158, relance max 2 passes).
- **Références** : bibliothèque **globale** (`GET /api/references`, l.9-45, filtres `search/type/source`) ; `Reference` l.190-217 (`authors` séparés par `;`, `year`, `doi`…) ; citation textuelle « (Nom, année) » = 1ᵉʳ auteur avant virgule + année (`generateInTextCitation`, `apa-composer-page.tsx` l.252-264).
- **Insertion Tiptap** : les modes n'insèrent pas (copie seulement) ; remplacement de contenu = pattern `setContent` (tiptap-editor l.84-93) mais ici via PUT (hors éditeur, page dédiée). Markdown → HTML : **aucune librairie md dans le projet** (à confirmer au moment du code ; sinon convertisseur minimal local h2/h3/p/ul/ol/li/strong/em/blockquote).
- **Navigation** : mêmes points d'enregistrement que le plan pack-soutenance ; `PenTool` présent dans `ICON_MAP` (l.71-77).

## Approche retenue

1. **Backend** : route dédiée `src/app/api/chapter-draft/stream/route.ts` (POST SSE) — corps zod `{chapterId, targetWords (300-8000), referenceIds[] (max 20), _aiConfig}` ; serveur charge chapitre + thèse + cadrage actif + titres des autres chapitres + références sélectionnées (bibliographie listée dans le prompt avec auteur/année/titre) ; prompt strict : structure intro/sections h2/conclusion, **citer uniquement les références fournies au format (Auteur, année)**, interdiction d'en inventer, sortie Markdown ; `generateCompletionStream` `maxTokens: 12 000`, temperature 0.6 ; relance unique si troncature détectée (`continueIfTruncated` adapté, max 1 passe).
2. **Utilitaire** : `src/lib/markdown-to-html.ts` — convertisseur minimal (h2/h3/p/ul/ol/li/strong/em/blockquote), échappement HTML des textes ; testé unitairement.
3. **Frontend** : `src/modules/brouillon-chapitre/brouillon-chapitre-page.tsx` — sélection chapitre (thèse active), longueur cible (préremplie depuis `targetWordCount` du chapitre si ≥ 500), multi-sélection de références avec recherche, génération SSE (affichage en direct + Arrêter), aperçu ReactMarkdown + compteur mots vs cible, rappel des références citées, actions « Copier » et « Insérer dans le chapitre » (AlertDialog : remplacement + mention de la version automatique) → conversion md→HTML + PUT chapitre (`content`, `plainText`, `wordCount` calculé comme l'éditeur l.73-81) → invalidations + toasts. Navigation : `ViewId "brouillon-chapitre"`, icône `PenTool`, catégorie `redaction`, badge `IA` ; import/case `page.tsx` ; entrée guide intégré.

## Alternatives écartées

- **Nouveau mode `WRITING_MODES` + `/api/ai-writing/stream`** : rejeté — nécessiterait de toucher 2 fichiers de modes + compteurs « 26 modes » (README/NOTICE/NOTE) pour un besoin qui n'est pas un « mode d'écriture » ; route dédiée sans impact sur les 26 modes (décision spec n°4).
- **Insertion en appendice** : rejeté (spec) — remplacement explicite + version native.
- **Sources auto (HAL/arXiv) pendant la génération** : rejeté (spec) — bibliothèque du doctorant uniquement.
- **Aperçu diff word-diff** : rejeté — le brouillon remplace un chapitre souvent vide/draft ; dialog de confirmation suffit.

## Fichiers touchés

| Fichier | Nature | Risque |
|---|---|---|
| src/app/api/chapter-draft/stream/route.ts | création | moyen — SSE, tokens, strict citations |
| src/lib/markdown-to-html.ts | création | faible |
| src/lib/markdown-to-html.test.ts | création | — |
| src/app/api/chapter-draft/stream/route.test.ts | création | — |
| src/modules/brouillon-chapitre/brouillon-chapitre-page.tsx | création | moyen — taille |
| src/lib/stores/app-store.ts | modification | faible — ViewId + entrée |
| src/app/page.tsx | modification | faible |
| src/components/layout/usage-guide-dialog.tsx | modification | faible |
| docs/NOTICE-UTILISATION.md | modification | section module (compteurs hors périmètre) |

**Aucun schéma Prisma** (aucun modèle nouveau). **Lignes rouges (0 diff avant chaque commit)** : `src/components/layout/app-sidebar.tsx`, `src/app/api/theses-en-ligne/search/route.ts`, `src/app/api/arxiv/search/route.ts`.

## Impacts transverses

- Aucun schéma, aucune variable d'environnement, aucun build Tauri, aucun quota externe (IA via config existante).
- Navigation : +1 `ViewId` (compteurs centralisés en fin de session).

## Stratégie de vérification

- `bun run lint` ; `bun run test:run` (suite complète + nouveaux tests md→HTML et validation route).
- `curl` POST sans config → 400 propre ; corps zod invalide → 400 détails.
- Navigateur : états vides, sélection chapitre + références, génération en direct, Arrêter, aperçu + compteur, insertion après confirmation → chapitre mis à jour, **historique de versions contenant l'état antérieur** (preuve clé CA-3.3), copie, mobile 390 px, captures `test-snapshots/brouillon-*.png`.

## Risques

- Génération tronquée (12k tokens) → relance unique + message d'état ; compteur vs cible visible.
- Citations inventées → prompt strict + rappel des références autorisées dans le contexte ; vérification navigateur sur un jeu réel.
- Convertisseur md→HTML limité → liste blanche de balises + échappement ; le texte hors liste reste lisible (paragraphes).
- Replacing content → version native prouvée dans l'historique (recette).
