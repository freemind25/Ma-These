# Plan — Registre juridique structuré URBANIS-DZ

## État réel constaté (code lu, chemins + lignes vérifiés ce jour)
- `src/lib/ai/book-skills.ts` (122 l.) : `BOOK_SKILLS_INDEX_BUDGET_CHARS = 1_500` (l.11), `BOOK_SKILLS_CONTENT_BUDGET_CHARS = 12_000` (l.14), `BookSkillInput` (l.17), `BookSkillSelection` (l.27), `selectBookSkills` (l.42 — ordre fourni fait foi, ressource entière tant que plafond cumulé OK, sinon `skipped`), `buildBookSkillsIndex` (l.61), `buildBookSkillsSection` (l.90 — **null si 0 active**, garde-fous l.111-114). **Modèle à dupliquer adapté.**
- `src/lib/ai/book-skills-server.ts` (23 l.) : `getActiveBookSkills()` — `findMany({ where: { enabled: true }, orderBy: { updatedAt: "desc" } })`.
- `src/lib/ai/knowledge-stamp.ts` : `KnowledgeStamp { coreVersion, skills[], generatedAt }`, `buildKnowledgeStamp` (dérive integral/index-only via sélection), `formatKnowledgeStampSummary/Detail`. Extension additive `legalRefs?`.
- `src/app/api/ai-writing/stream/route.ts` : l.62-63 injection book-skills, l.67-71 stamp, l.73-75 message système conditionnel, l.103 SSE stamp. Le mode est connu à ce niveau (`mode` validé).
- `src/app/api/chapter-draft/stream/route.ts` : l.350-351 injection, l.353-357 stamp, l.270-273 émission fin de flux. **Non touché** (hors périmètre d'injection).
- Routes CRUD de référence : `src/app/api/book-skills/route.ts` (GET raw SQL preview 300 car. + search, POST zod avec `.nullish()` — fix cycle 11, DELETE ?id/{ids}) + `[id]/route.ts` (GET complet, PUT zod).
- Schéma : `CustomBookSkill` l.319-332 (pattern opt-in `enabled`), `Chapter.stamp` l.49, `ChapterVersion.stamp` l.78.
- UI hôte : `src/modules/livres-competences/livres-competences-page.tsx` — onglets l.691-709 (`evaluation/ressources/progression/ia/bibliotheque`), CRUD dialog + interrupteur déjà implémentés dans l'onglet `bibliotheque` (cycle 11) — **patterns à imiter**.
- Bloc stamp : `src/components/knowledge-stamp-block.tsx` l.14-15, 37, 44 (summary + detail dépliable).
- Capteur budget : `src/lib/ai/knowledge-core.budget.test.ts` identifie les **autoporteurs par nom de fichier** — `legal-refs.ts` n'est pas un prompt autoporteur (pas de spécialisation), donc **non concerné** ; vérifié à l'implémentation.

## Approche retenue
Dupliquer la mécanique book-skills (éprouvée, testée) en `legal-refs.ts` + `legal-refs-server.ts` : sélection déterministe (ordre updatedAt desc), plafond contenu **8 000 car.** (le registre complet §3+§4 ≈ 6 350 car. y tient en entier), index **1 500 car.**. Injection **uniquement** dans `ai-writing/stream` quand `mode === "expertise-urbaine-dz"` (message système après les compétences livres) + extension additive du stamp (`legalRefs[]`). CRUD `/api/legal-refs` calqué sur `/api/book-skills`. Onglet UI dans livres-competences. Seed script (36 entrées §3+§4, fidèles au pack, vigilances conservées verbatim). Le texte injecté d'une entrée est **composé depuis ses champs** (pas de colonne `content` : le registre §7 est de la métadonnée structurée).

## Alternatives écartées
- Injection dans tous les modes/flux → pollue les générations académiques ; scoping au mode = plus conservateur (prompts byte-identiques ailleurs).
- Colonne `content` libre → duplication de la métadonnée ; composition à la volée préférée.
- Modèle `LegalRef` relié à `Thesis` → le registre est global (comme `CustomBookSkill`), pas par thèse.
- Insérer le registre dans KNOWLEDGE_CORE → impossible (marge 206 tok).

## Fichiers touchés
| Fichier | Nature | Risque |
|---|---|---|
| prisma/schema.prisma | modification (modèle `LegalRef` additif) | db:push additif — diff avant/après + survie des données (58 compétences, 7 chapitres, 4/58/1 stamps) exigés |
| src/lib/ai/legal-refs.ts | création | nul (pur) |
| src/lib/ai/legal-refs-server.ts | création | nul |
| src/lib/ai/knowledge-stamp.ts | modification (champ optionnel) | stamps sérialisés existants — champ optionnel, rétrocompatible |
| src/app/api/legal-refs/route.ts + [id]/route.ts | création | nul |
| src/app/api/ai-writing/stream/route.ts | modification (injection conditionnelle + stamp) | prompts des autres modes — byte-identiques exigés (test) |
| src/components/knowledge-stamp-block.tsx | modification (affichage legalRefs si présents) | rétrocompatibilité affichage |
| src/modules/livres-competences/livres-competences-page.tsx | modification (onglet + CRUD) | onglets existants intacts |
| scripts/seed-legal-refs.ts | création | écriture base — idempotent (skip si déjà alimenté) |
| tests (legal-refs.test.ts, knowledge-stamp.test.ts extension, non-régression) | création/modification | baseline 71 fichiers / 1 569 verts |

## Impacts transverses
Schéma Prisma (additif) · aucune route existante modifiée hors ai-writing/stream (conditionnel) · build Tauri non affecté (aucune dep) · aucune variable d'environnement · capteur budget non concerné (vérifié).

## Stratégie de vérification
`bun run test:run` (verts + byte-identique prompt sans registre actif) · `bun run lint` (0 erreur / 231 warnings baseline) · `curl` CRUD `/api/legal-refs` · seed : compte 36 · recette navigateur : onglet → CRUD → activer → génération mode URBANIS-DZ → stamp legalRefs visible → autre mode sans section → mobile 390 px · lignes rouges 0 diff à chaque commit.

## Risques
- db:push : modèle purement additif, aucune colonne modifiée — preuve de survie avant/après.
- Stamp JSON : extension optionnelle — test de lecture d'un ancien stamp sans `legalRefs`.
- UI : onglet ajouté sans toucher aux 5 existants — vérification visuelle des onglets.
