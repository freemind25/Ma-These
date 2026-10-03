# Tâches — Compétences livres vivantes

## Groupe A — Schéma `[BLOQUANT]`

- [ ] T1 — Ajouter à `CustomBookSkill` les champs additifs `description String?`, `source String?`, `enabled Boolean @default(false)` · `prisma/schema.prisma` · preuve : diff du schéma avant/après + `bun run db:push` + comptes de lignes avant/après identiques (survie des données).

## Groupe B — Backend / routes API `[DÉPEND DE Groupe A]`

- [ ] T2a — Normaliser en entiers epoch-ms les `createdAt`/`updatedAt` texte (6 décimales) des 8 lignes importées le 2026-08-23 (bug préexistant P2010, cf. plan § Écart) · base de données · preuve : requête complète ancienne + nouvelle OK sous Node, compte 58 inchangé.
- [ ] T2 — Étendre `GET /api/book-skills` : ajouter `description`, `enabled`, `source` au SELECT brut · `src/app/api/book-skills/route.ts` · preuve : curl GET avec champs présents.
- [ ] T3 — Étendre la validation zod POST (description ≤ 500, source ≤ 300, enabled) · `src/app/api/book-skills/route.ts` · preuve : curl POST 201 avec nouveaux champs + 400 sur champ invalide.
- [ ] T4 — Étendre PUT de `/api/book-skills/[id]` (mêmes champs, 400/404 préservés) · `src/app/api/book-skills/[id]/route.ts` · preuve : curl PUT 200 + persistance re-GET.

## Groupe C — IA / injection `[DÉPEND DE Groupe A]`

- [ ] T5 — Créer la bibliothèque pure : `buildBookSkillsIndex`, `selectBookSkills` (plafonds 1 500 / 12 000 car.), `buildBookSkillsSection` (null si vide, règle « jamais source de citations ») · `src/lib/ai/book-skills.ts` · preuve : tests unitaires verts.
- [ ] T6 — Créer `getActiveBookSkills()` (db, `enabled: true`, ordre `updatedAt desc`) · `src/lib/ai/book-skills-server.ts` · preuve : import compilable, lint.
- [ ] T7 — Injecter dans `chapter-draft/stream` : 3e paramètre de `buildSystemPrompt`, continuation inchangée · `src/app/api/chapter-draft/stream/route.ts` + `route.test.ts` (mock) · preuve : tests verts dont assertion « COMPÉTENCES LIVRES » présente avec 1 ressource et absente avec 0.
- [ ] T8 — Injecter dans `ai-writing` et `ai-writing/stream` (message système séparé) · `src/app/api/ai-writing/route.ts`, `src/app/api/ai-writing/stream/route.ts` + leurs tests (mocks) · preuve : tests verts, non-régression [] byte-identique.

## Groupe D — Frontend / UI `[DÉPEND DE Groupe B]`

- [ ] T9 — Formulaire de création et d'édition (dialog : titre, auteur, description, provenance, tags, contenu) + interrupteur « utilisée par l'IA » avec badges « Injectée »/« Hors IA » sur les cartes · `src/modules/livres-competences/livres-competences-page.tsx` · preuve : recette navigateur (créer, éditer, basculer, recharger).
- [ ] T10 — Corriger l'affichage négatif du nombre de mots (`~` parasite) · même fichier · preuve : carte affichant un nombre de mots positif cohérent.

## Groupe E — Tests / non-régression

- [ ] T11 — Suite complète verte + lint 0 erreur · `bun run test:run`, `bun run lint` · preuve : sorties réelles dans preuves.md.
- [ ] T12 — Documentation du canal : note « Compétences livres » dans `docs/ARCHITECTURE-CONNAISSANCE.md` · preuve : fichier relu, cohérent avec les budgets du plan.
