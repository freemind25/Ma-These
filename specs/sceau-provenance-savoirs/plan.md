# Plan — Provenance des savoirs

## État réel constaté

Fichiers lus (chemins + lignes réels) :

- `src/lib/ai/knowledge-core.ts` (949 lignes) — 13 modules typés, `getKnowledgeCore(modules?)` ; **aucune constante de version** aujourd'hui. Budget documenté : 65 382 car. / 21 794 tok (`docs/ARCHITECTURE-CONNAISSANCE.md`, `AGENTS.md`).
- `src/lib/ai/book-skills.ts` — bibliothèque pure du canal compétences (plafonds 12 000 / 1 500 car., `buildBookSkillsSection` null si 0 active). C'est le modèle du pattern « pure + accès serveur ».
- `src/app/api/chapter-draft/stream/route.ts` l.332-335 — injection : `buildBookSkillsSection(await getActiveBookSkills())` passé à `buildSystemPrompt` (l.103) ; le stream ne renvoie que le texte, **aucune métadonnée de savoirs**.
- `src/app/api/ai-writing/stream/route.ts` l.59 — même injection, même absence de trace.
- `src/modules/brouillon-chapitre/brouillon-chapitre-page.tsx` l.248-274 — `handleInsert` : `updateChapter.mutate({ id, content, plainText, wordCount })` → PUT ; l'aperçu (`draft`) est un simple string en état local.
- `src/app/api/chapters/[id]/route.ts` l.25-52 — PUT : si le contenu change, crée une `ChapterVersion` de **l'état antérieur** (`author: "doctorant"`), renvoie `versionId`. Point clé de sémantique : la version archivée = ancien contenu ; le contenu courant vit sur `Chapter`.
- `prisma/schema.prisma` l.70-82 — `ChapterVersion { id, chapterId, content, plainText, wordCount, author, createdAt }` ; `Chapter` (au-dessus) — **aucun champ métadonnées sur l'un ni l'autre**. Types primitifs Prisma sans liste → colonne texte JSON.
- `src/modules/editor/components/chapter-history-dialog.tsx` (228 lignes) — fetch `/api/chapters/[id]/versions`, liste (wordCount, author, createdAt, l.29-31) + diff entre deux versions ; n'affiche que les versions archivées, pas l'état courant.
- `src/modules/ai-writing/ai-writing-page.tsx` l.391 — le résultat n'offre que « Copier » (pas de liaison chapitre).

Écart documentation/code : aucun nouveau relevé sur ce périmètre (le Sceau/Truthmark est bien dans `verification-coherence` + `coherence-check`, hors sujet ici).

## Approche retenue

**Principe : chaque état du texte porte sa propre provenance.** Le contenu courant d'un chapitre porte son stamp ; quand il est remplacé, son stamp est archivé **avec lui** dans la version créée. La trace est produite côté serveur à la génération, voyage avec le brouillon, et est persistée uniquement à l'insertion confirmée.

1. **Version du noyau** — constante exportée `KNOWLEDGE_CORE_VERSION` (format `"2026-10-03"`) en tête de `knowledge-core.ts`, tenue à la main, à incrémenter à chaque évolution du socle ; consignée dans `ARCHITECTURE-CONNAISSANCE.md` (CA-4.x).
2. **Stamp pur** — nouveau fichier `src/lib/ai/knowledge-stamp.ts` (pattern book-skills : pur, testable) : `buildKnowledgeStamp({ coreVersion, skills })` → objet sérialisable `{ coreVersion, skills: [{ id, title, mode: "integral" | "index-only" }], generatedAt }` ; `mode` dérivé de la sélection existante (`selectBookSkills`).
3. **Émission à la génération** — les deux streams (`chapter-draft/stream`, `ai-writing/stream`) calculent le stamp à côté de la section injectée et l'émettent en **dernier événement du stream** (type dédié, ex. `{ type: "stamp", stamp }`). Le prompt reste byte-identique (CA-1.3) : le stamp n'y entre jamais. Consommation : le parser client existant ignore les types inconnus — à vérifier avant (fragilité connue des parsers de stream).
4. **Persistance** — colonne additive `stamp String?` (JSON) sur `Chapter` **et** `ChapterVersion`. **Correction du plan pendant l'exécution (Article 4, vérifiée sur `src/app/api/chapters/[id]/route.ts` l.25-52)** : la `ChapterVersion` est créée après le `update` avec `chapter.content` **post-mise-à-jour** — les versions sont des **snapshots du nouvel état** (et non de l'ancien comme écrit ci-avant). Le design s'en trouve simplifié : à changement de contenu, la version créée porte `stamp = stamp transmis` (provenance du contenu snapshoté) et `chapter.stamp = même valeur` ; sans transmission (sauvegarde éditeur) → `null` = « saisie manuelle ». Sans changement de contenu, `chapter.stamp` n'est pas altéré. Données existantes : stamp `null` partout, aucun backfill.
5. **API historique** — `GET /api/chapters/[id]/versions` renvoie `stamp` ; l'UI d'historique affiche aussi l'**état courant** (stamp du chapitre) en tête, puis les versions avec leur stamp.
6. **UI brouillon** — l'événement `stamp` du stream est stocké avec l'aperçu, affiché sous l'aperçu (CA-1.1/1.2/1.3), et transmis au PUT à l'insertion (CA-2.1).
7. **UI assistant d'écriture** — affichage du stamp sous le résultat ; rien de persisté (CA-3.2).
8. **Format d'affichage** (décision déléguée à confirmer) : ligne résumée « Provenance : noyau v2026-10-03 + 2 compétences livres » + détail dépliable (liste des titres, modes).

## Alternatives écartées

- **Table `GenerationLog` côté serveur à chaque génération** : trace sans lien au texte réellement inséré, accumulation sans valeur pour le doctorant, schéma plus lourd — rejeté.
- **Stamp uniquement sur `ChapterVersion`** : sémantiquement faux ici — les versions archivent l'ancien contenu ; le stamp du brouillon décrirait un texte qu'il n'a pas produit — rejeté au profit de l'archivage à double colonne.
- **Hash à l'exécution du socle** : ordre des modules fragile, coût runtime, variabilité sans information nouvelle — rejeté (version déclarée).
- **Stamp injecté dans le prompt** (l'IA s'auto-documente) : non contrôlable, risque d'invention de références — viole CA-1.3 et la discipline de citation — rejeté.
- **Modifier le Truthmark** : autre préoccupation (cohérence interne) — hors périmètre.

## Fichiers touchés

| Fichier | Nature | Risque |
|---|---|---|
| `prisma/schema.prisma` | modification (+2 colonnes `stamp String?`) | db:push additif — diff avant/après + preuve de survie des données requis |
| `src/lib/ai/knowledge-core.ts` | modification (+1 constante) | aucun — export seul |
| `src/lib/ai/knowledge-stamp.ts` | **création** (pur) | aucun — nouveau fichier |
| `src/app/api/chapter-draft/stream/route.ts` | modification (émission événement stamp) | parser stream client — vérifier tolérance aux types inconnus |
| `src/app/api/ai-writing/stream/route.ts` | modification (émission événement stamp) | idem |
| `src/app/api/chapters/[id]/route.ts` | modification (zod + archivage stamp) | logique de versionnement — ne pas altérer le comportement existant sans stamp |
| `src/app/api/chapters/[id]/versions/route.ts` | modification (retour stamp) | aucun — champ additionnel |
| `src/modules/brouillon-chapitre/brouillon-chapitre-page.tsx` | modification (affichage + envoi stamp) | flux d'insertion existant à préserver |
| `src/modules/editor/components/chapter-history-dialog.tsx` | modification (état courant + stamps dépliables) | diff existant à ne pas casser |
| `src/modules/ai-writing/ai-writing-page.tsx` | modification (affichage) | aucun |
| `docs/ARCHITECTURE-CONNAISSANCE.md` | modification (version du noyau) | aucun |
| `src/lib/ai/knowledge-stamp.test.ts` + tests API | création/modification | — |

## Impacts transverses

- **Schéma Prisma** : 2 colonnes additives (`Chapter.stamp`, `ChapterVersion.stamp`) — db:push avec preuve de survie (convention cycle 11 : comptes avant/après).
- **Protocole de stream** : 1 type d'événement additionnel — vérifier que les deux consommateurs client tolèrent un type inconnu (sinon mise à jour des parsers).
- Aucune variable d'environnement, aucun build Tauri, aucune API externe, aucun quota.
- **Non-régression prompts** : les prompts des deux flux restent byte-identiques (le stamp vit hors du prompt) — preuve par la suite existante (16/16, 19/19, 14/14 tests).

## Stratégie de vérification

- `bun run test:run` — nouveaux tests : `knowledge-stamp` (0 skill / skills intégral / index-only / sérialisation), PUT avec et sans stamp (archivage correct), versions API.
- `curl` PUT `chapters/[id]` avec `stamp` puis sans `stamp` → vérifier archivage et « saisie manuelle ».
- Navigateur : brouillon avec 1 compétence active → trace dans l'aperçu ; insertion → historique : état courant tracé ; nouvelle sauvegarde manuelle → « saisie manuelle » + version antérieure garde sa trace ; 0 compétence → noyau seul ; mobile 390 px ; 0 erreur console.
- Lignes rouges : `git diff HEAD --stat` sur les 3 fichiers protégés = 0 avant chaque commit.

## Risques

- **Parser de stream client** rejette un type d'événement inconnu → vérifié AVANT le groupe C (lecture du code client ; fallback : émettre le stamp dans un champ de l'événement final existant).
- **Logique d'archivage du PUT** : un stamp transmis mais sans changement de contenu ne crée pas de version (comportement inchangé) — la trace mise à jour reste sur le chapitre ; documenter ce cas dans les tests.
- **Double écriture stamp/null** : les états antérieurs aux cycles précédents ont stamp `null` → l'UI doit distinguer « null = antérieur au stamp » de « saisie manuelle » ? → décision : `null` affiche « saisie manuelle » (approximation acceptable, donnée ancienne non traçable de toute façon).
- Mémoire box (OOM connue) pendant les recompiles lourdes.
