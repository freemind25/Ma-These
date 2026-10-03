# Plan — Compétences livres vivantes

## État réel constaté

Fichiers lus (chemins exacts) :

- `prisma/schema.prisma` l.317-325 — `model CustomBookSkill` : 7 champs (id, title, author, content, tags, createdAt, updatedAt). Aucun champ description/enabled/source.
- `src/app/api/book-skills/route.ts` l.1-155 — GET (SQL brut, SELECT de colonnes nommées l.31-38, recherche LIKE), POST (zod : title, author, content ≥ 10, tags), DELETE (id ou ids).
- `src/app/api/book-skills/[id]/route.ts` — GET (contenu intégral), PUT, DELETE.
- `src/modules/livres-competences/livres-competences-page.tsx` l.1202-1401 — composant `BookSkillsLibrary` : recherche, cartes (titre, auteur, badges tags, aperçu 300 car., taille), dialog contenu intégral, suppression. **Aucun formulaire de création/édition**. Anomalie l.1356 : `{~Math.round(book.contentLength / 5)}` — le `~` bit-a-bit précède l'entier → affichage négatif (ex. −1001).
- `src/lib/ai/prompt-builder.ts` l.1-60 — `buildPrompt({modules, specialization})` (constantes construites à l'import), `getLevelCalibration(level)` (~100-120 tokens).
- `src/lib/ai/knowledge-core.ts` l.45-58 (13 modules), l.935 `getKnowledgeCore(modules?)`. Budget noyau : 21 794 / 22 000 tokens (worklog, marge ~206) — **aucune marge pour absorber les livres dans le noyau** : l'injection sera un canal séparé, hors noyau.
- `src/app/api/ai-writing/stream/route.ts` l.36-72 — `systemPrompt = SPECIALIZATION_PROMPTS[mode] + getLevelCalibration(...)`, contexte thèse ajouté comme **message système séparé** (l.59-65), puis message utilisateur. Pas d'usage de `db`.
- `src/app/api/ai-writing/route.ts` l.38-70 — même forme, non stream.
- `src/app/api/chapter-draft/stream/route.ts` l.101-133 `buildSystemPrompt(thesisContext, bibliography)` (prompt bespoke, hors noyau), l.136 `CONTINUATION_SYSTEM_PROMPT` (reprise sur troncature), l.326 appel unique.
- Tests : `src/app/api/chapter-draft/stream/route.test.ts` (14 tests, mock `@/lib/db` : chapter + reference uniquement) ; `src/app/api/ai-writing/route.test.ts` et `src/app/api/ai-writing/stream/route.test.ts` existent **sans** mock db (les routes n'utilisent pas db aujourd'hui).
- Aucun test existant pour `/api/book-skills` (aucun `*.test.ts` associé).
- `docs/ARCHITECTURE-CONNAISSANCE.md` existe (documentation du socle IA, à compléter d'une note sur le nouveau canal).

Écart documentation ↔ code : aucun nouveau pour ce cycle ; `ARCHITECTURE-CONNAISSANCE.md` ne mentionne pas les compétences livres (le cycle ajoute la note).

## Approche retenue

Un **canal d'injection séparé** du noyau de connaissance (qui est au plafond), en trois couches :

1. **Bibliothèque pure** `src/lib/ai/book-skills.ts` — fonctions pures, testables sans db :
   - `buildBookSkillsIndex(skills)` : index numéroté léger `[L1] Titre — description (tags)`, plafonné `BOOK_SKILLS_INDEX_BUDGET_CHARS = 1 500` ;
   - `selectBookSkills(skills, budgetChars)` : sélection déterministe (ordre fourni, récence d'abord), chaque ressource prise entière tant que le plafond cumulé `BOOK_SKILLS_CONTENT_BUDGET_CHARS = 12 000` n'est pas dépassé ; les non-retenuess sont marquées « contenu non injecté (budget) » dans l'index ;
   - `buildBookSkillsSection(skills)` : retourne `null` si aucune active (non-régression byte-identique), sinon un bloc délimité « COMPÉTENCES LIVRES ACTIVES » avec index + contenus + règle d'usage (appui méthodologique, **jamais source de citations**).
2. **Accès serveur** `src/lib/ai/book-skills-server.ts` — `getActiveBookSkills()` : `db.customBookSkill.findMany({ where: { enabled: true }, orderBy: { updatedAt: "desc" } })`.
3. **Points d'injection** :
   - `chapter-draft/stream` : troisième paramètre `bookSkillsSection: string | null` de `buildSystemPrompt`, inséré avant « CONTEXTE DE LA THÈSE » ; la continuation (`CONTINUATION_SYSTEM_PROMPT`) reste inchangée (CA-3.6) ;
   - `ai-writing` et `ai-writing/stream` : message système séparé ajouté entre le contexte de thèse et le message utilisateur, même motif que le contexte existant.

Schéma (additif pur) : `description String?`, `source String?`, `enabled Boolean @default(false)` sur `CustomBookSkill`. Opt-in strict : les ressources existantes passent à `false`.

API `/api/book-skills` : colonnes ajoutées au SELECT brut (l.31-38), zod POST/PUT étendu (description ≤ 500, source ≤ 300, enabled booléen).

UI `BookSkillsLibrary` : formulaire de création et d'édition (dialog : titre, auteur, description, provenance, tags, contenu, interrupteur), interrupteur `Switch` sur chaque carte (bascule → PUT), badges « Injectée »/« Hors IA », correction du `~` parasite (CA-4.1).

Docs : une courte section « Canal compétences livres » dans `docs/ARCHITECTURE-CONNAISSANCE.md` (index + budgets + opt-in).

## Alternatives écartées

- **Injecter dans le noyau de connaissance** : budget 21 794 / 22 000 tokens — aucune marge ; le noyau est une source figée distillée, pas un magasin utilisateur. Écarté.
- **Sélection par similarité sémantique** : coût, non-déterminisme, complexité de test. Écarté pour cette itération (hors périmètre spec).
- **Un seul champ `metadata` JSON** : contredit la discipline de schéma du dépôt (colonnes nommées, validation zod explicite). Écarté.
- **Injection dans les flux d'analyse (coherence-check, directeur-chat, verification-publication)** : ces flux consomment le noyau ; élargir toucherait 3 routes transverses sans besoin démontré. Hors périmètre spec.

## Fichiers touchés

| Fichier | Nature | Risque |
|---|---|---|
| `prisma/schema.prisma` | modification (3 champs additifs) | db:push — diff avant/après + preuve de survie des données requis (Article 6) |
| `src/lib/ai/book-skills.ts` | création | nul (nouveau, pur) |
| `src/lib/ai/book-skills-server.ts` | création | nul (nouveau) |
| `src/lib/ai/book-skills.test.ts` | création | nul (nouveau) |
| `src/app/api/chapter-draft/stream/route.ts` | modification (3e paramètre + fetch) | mock db du test à étendre sinon crash |
| `src/app/api/chapter-draft/stream/route.test.ts` | modification (mock `book-skills-server`) | 14 tests existants doivent rester verts |
| `src/app/api/ai-writing/route.ts` | modification (message système + fetch) | test à étendre (mock db nouveau) |
| `src/app/api/ai-writing/stream/route.ts` | modification (idem) | idem |
| `src/app/api/ai-writing/route.test.ts` | modification (mock) | tests existants verts |
| `src/app/api/ai-writing/stream/route.test.ts` | modification (mock) | tests existants verts |
| `src/app/api/book-skills/route.ts` | modification (SELECT + zod) | SQL brut : colonnes à nommer exactement |
| `src/app/api/book-skills/[id]/route.ts` | modification (zod PUT) | 400/404 préservés |
| `src/modules/livres-competences/livres-competences-page.tsx` | modification (formulaires, interrupteur, badges, fix `~`) | fichier 1 401 lignes — éditions ciblées uniquement |

Lignes rouges (aucun commit sans 0 diff) : `src/app/api/theses-en-ligne/search/route.ts`, `src/app/api/arxiv/search/route.ts`, `src/components/layout/app-sidebar.tsx` — non touchées par ce plan.

## Impacts transverses

- Schéma Prisma : db:push additif (Article 6 — diff avant/après + survie des données prouvés).
- Routes API : `/api/book-skills` consommée par le module Livres & compétences ; les champs ajoutés sont optionnels → rétrocompatible.
- Aucune variable d'environnement, aucun build Tauri, aucun quota d'API externe.
- Budget tokens : plafond dur 12 000 car. (~3 000 tokens) de contenu + 1 500 car. d'index, uniquement quand ≥ 1 ressource active — coût 0 sinon.

## Stratégie de vérification

- Tests unitaires pures : `bun run test:run` — `book-skills.test.ts` (vide → null ; index format ; budget : sélection s'arrête, non-retenuess marquées ; ordre récence ; désactivées exclues par l'appelant — couvert en intégration).
- Non-régression : mocks `book-skills-server` → `[]` dans les 3 fichiers de tests de routes → prompts/messages byte-identiques (les assertions de prompt existantes restent vertes).
- API : `curl` POST avec nouveaux champs → 201 avec champs retournés ; GET liste → colonnes présentes ; PUT → 200 ; cas invalides → 400.
- Injection réelle : avec 1 ressource active, appel curl `chapter-draft/stream` avec mock impossible en live → preuve par test vitest sur le contenu du message système (assertion section « COMPÉTENCES LIVRES » présente avec contenu) + recette navigateur : création UI → activation → génération brouillon → observation via dev.log du flux normal.
- Intégrité : `bun run db:push` avec comptes de lignes avant/après (`SELECT COUNT(*)`).

## Risques

- Le test chapter-draft mocke `@/lib/db` sans `customBookSkill` → si la route appelle `db.customBookSkill` directement, crash du test. Mitigation : la route passe par `getActiveBookSkills()` (mock dédié `@/lib/ai/book-skills-server`), le mock db reste inchangé.
- Fichier UI de 1 401 lignes : éditions ciblées (composant `BookSkillsLibrary` l.1202-1401 uniquement), lint après chaque tâche UI.
- `~Math.round` : correction triviale mais dans un fichier déjà touché — annoncée et recettée comme tâche propre (CA-4.1).
- OOM dev box connue (worklog) : en cas de kill du serveur dev pendant la recette, relance `NODE_OPTIONS=--max-old-space-size=1200` documentée.

## Écart découvert à l'exécution (Article 4 — complément du 2026-10-03, Groupe B)

La preuve T2 (GET) a révélé un **bug préexistant, indépendant des champs ajoutés** : `GET /api/book-skills` échouait en 500 (P2010 « Conversion failed: input contains invalid characters ») pour le jeu complet de 58 lignes. Cause racine prouvée par bissection SQL : **8 lignes** créées le 2026-08-23 stockent `createdAt`/`updatedAt` en **texte ISO à 6 décimales** (ex. `2026-08-23T08:16:35.787667`) là où toutes les autres stockent des **entiers epoch-ms** (ex. `1787386113854`) ; le convertisseur Prisma côté Node rejette ces valeurs. La requête ancienne (sans les colonnes ajoutées) échoue à l'identique — le défaut n'est pas introduit par ce cycle.

Correctif retenu (T2a, ajoutée à `tasks.md` Groupe B) : normalisation des 8 valeurs en entiers epoch-ms (parsing ISO en JS, précision sous-millisecondes perdue — sans effet métier), aucune colonne ni ligne ajoutée/supprimée, comptes prouvés avant/après. Alternative écartée : masquer par `CAST(... AS TEXT)` dans la requête — laisserait des dates invalides en base (mine data integrity).
