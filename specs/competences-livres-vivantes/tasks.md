# Tâches — Compétences livres vivantes

## Groupe A — Schéma `[BLOQUANT]`

- [x] T1 — Ajouter à `CustomBookSkill` les champs additifs `description String?`, `source String?`, `enabled Boolean @default(false)` · `prisma/schema.prisma` · preuve : diff du schéma avant/après + `bun run db:push` + comptes de lignes avant/après identiques (survie des données).

## Groupe B — Backend / routes API `[DÉPEND DE Groupe A]`

- [x] T2a — Normaliser en entiers epoch-ms les `createdAt`/`updatedAt` texte (6 décimales) des 8 lignes importées le 2026-08-23 (bug préexistant P2010, cf. plan § Écart) · base de données · preuve : requête complète ancienne + nouvelle OK sous Node, compte 58 inchangé.
- [x] T2 — Étendre `GET /api/book-skills` : ajouter `description`, `enabled`, `source` au SELECT brut · `src/app/api/book-skills/route.ts` · preuve : curl GET avec champs présents.
- [x] T3 — Étendre la validation zod POST (description ≤ 500, source ≤ 300, enabled) · `src/app/api/book-skills/route.ts` · preuve : curl POST 201 avec nouveaux champs + 400 sur champ invalide.
- [x] T4 — Étendre PUT de `/api/book-skills/[id]` (mêmes champs, 400/404 préservés) · `src/app/api/book-skills/[id]/route.ts` · preuve : curl PUT 200 + persistance re-GET.

## Groupe C — IA / injection `[DÉPEND DE Groupe A]`

- [x] T5 — Créer la bibliothèque pure : `buildBookSkillsIndex`, `selectBookSkills` (plafonds 1 500 / 12 000 car.), `buildBookSkillsSection` (null si vide, règle « jamais source de citations ») · `src/lib/ai/book-skills.ts` · preuve : tests unitaires verts.
- [x] T6 — Créer `getActiveBookSkills()` (db, `enabled: true`, ordre `updatedAt desc`) · `src/lib/ai/book-skills-server.ts` · preuve : import compilable, lint.
- [x] T7 — Injecter dans `chapter-draft/stream` : 3e paramètre de `buildSystemPrompt`, continuation inchangée · `src/app/api/chapter-draft/stream/route.ts` + `route.test.ts` (mock) · preuve : tests verts dont assertion « COMPÉTENCES LIVRES » présente avec 1 ressource et absente avec 0.
- [x] T8 — Injecter dans `ai-writing` et `ai-writing/stream` (message système séparé) · `src/app/api/ai-writing/route.ts`, `src/app/api/ai-writing/stream/route.ts` + leurs tests (mocks) · preuve : tests verts, non-régression [] byte-identique.

## Groupe D — Frontend / UI `[DÉPEND DE Groupe B]`

- [x] T9 — Formulaire de création et d'édition (dialog : titre, auteur, description, provenance, tags, contenu) + interrupteur « utilisée par l'IA » avec badges « Injectée »/« Hors IA » sur les cartes · `src/modules/livres-competences/livres-competences-page.tsx` · preuve : recette navigateur (créer, éditer, basculer, recharger).
- [x] T10 — Corriger l'affichage négatif du nombre de mots (`~` parasite) · même fichier · preuve : carte affichant un nombre de mots positif cohérent.

## Groupe E — Tests / non-régression

- [x] T11 — Suite complète verte + lint 0 erreur · `bun run test:run`, `bun run lint` · preuve : sorties réelles dans preuves.md.
- [x] T12 — Documentation du canal : note « Compétences livres » dans `docs/ARCHITECTURE-CONNAISSANCE.md` · preuve : fichier relu, cohérent avec les budgets du plan.


---

## Recette — 2026-10-03 (délégation propriétaire consignée)

Recette exécutée par l'agent sur délégation explicite du propriétaire (« vous êtes le spécialiste, faites pour le mieux… terminez toutes les actions avant de revenir pour moi pour avis »), chaque choix conservateur restant révisable. Preuves : `preuves.md` § Recette (15 contrôles UI/API live, captures `test-snapshots/competences-*.png`, 0 erreur console, mobile 390 px sans scroll horizontal).

Défauts découverts en recette et corrigés dans leur groupe : POST `nullish` (corrigé, re-recetté) ; « readonly database » ponctuel (environnement, serveur relancé).

## Convergence — 2026-10-03

Critères d'acceptation satisfaits : **14/14** (CA-1.1→1.3, CA-2.1→2.3, CA-3.1→3.6, CA-4.1)
Écarts au plan : T2a ajoutée (bug préexistant P2010 — dates texte 6 décimales, 8 lignes normalisées) ; un défaut POST découvert en recette, corrigé dans son groupe.
Dette introduite : aucune (champs additifs, canal séparé du noyau, plafonds d'injection documentés).
Verdict : **CONVERGÉ** (recette déléguée — révisable au retour du propriétaire)
