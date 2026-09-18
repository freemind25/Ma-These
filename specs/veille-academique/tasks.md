# Tasks — veille-academique

Contexte : plan validé par le propriétaire (« go », 2026-09-18) — `specs/veille-academique/plan.md`. Décisions de clarification actives : HAL + arXiv ; « vu » par résultat + raccourci global ; déclenchement 100 % manuel ; rétention 200 résultats.

Périmètre fermé (annonce du plan, article 2) : les fichiers listés par groupe ci-dessous. **Garanties** : `src/app/api/theses-en-ligne/search/route.ts` et `src/app/api/arxiv/search/route.ts` ne sont jamais modifiées (routes épinglées, consommées en auto-fetch) ; `src/components/layout/app-sidebar.tsx` non touché (icône `Binoculars` déjà dans `ICON_MAP`, l.71-77).

## Groupe A — Schéma [BLOQUANT]

- [x] T1 — Ajouter à `prisma/schema.prisma` les modèles **`SavedSearch`** (id, label, source "hal"|"arxiv", query, filters JSON, lastCheckedAt DateTime?, createdAt, updatedAt, relation results, index [source]) et **`SavedSearchResult`** (id, savedSearchId, externalId, title, authors « ; », year Int?, url, abstract String?, seen Boolean @default(false), firstSeenAt DateTime @default(now()), relation cascade, `@@unique([savedSearchId, externalId])`, index [savedSearchId]) — modèles purement additifs, aucune colonne existante modifiée · preuve attendue : `bun run db:push` (alias `prisma db push --accept-data-loss`) précédé d'un dump des comptes de toutes les tables avant et après (`sqlite3`), diff schéma constaté, zéro perte de ligne sur les tables existantes — sorties collées dans `preuves.md` · **recetté (« contiu » = continu, 2026-09-18 — commit `1da1584`)**

Dépendances : aucune. **[BLOQUANT]** — tout le reste consomme ces tables.

## Groupe B — Backend / routes API [DÉPEND DE Groupe A]

- [x] T2 — Créer `src/lib/veille/check-core.ts` : fonctions **pures** (zéro db, zéro fetch) `diffResults(stored, fetched)` → `{ isFirstCheck, newItems }` (premier check = base de référence, aucun « nouveau » — CA-2.1 ; checks suivants = inconnus marqués nouveaux — CA-2.2) et `applyRetention(items, limit = 200)` (fenêtre glissante par `firstSeenAt desc`) · preuve attendue : `bun run lint` 0 erreur sur le fichier, types stricts · **implémenté (commit `834749d`) puis refondu (diffResults filtre les ids vides, parseFiltersJson pur ajouté — commit finalisation) ; lint 0 erreur**
- [x] T3 — Créer `src/app/api/veille/route.ts` : **GET** liste des veilles (label, source, query, lastCheckedAt, compteur non-vus par veille — CA-3.2) + **POST** création (label, source, query, filters ; validation 400) — conventions `src/app/api/thesis/[id]/research-tabs/route.ts` l.7-77 · preuve attendue : curl GET `[]` puis POST 201, GET liste avec la veille créée · **recetté (commits `f528be4` + finalisation) : GET `[]`, POST 201, 3 validations 400 (libellé, source, requête) — preuves.md § recette complémentaire ctrl 1-5, 8**
- [x] T4 — Créer `src/app/api/veille/[id]/route.ts` : **PATCH** renommage (CA-1.1) + **DELETE** suppression avec cascade résultats (CA-1.2) · preuve attendue : curl PATCH 200 (libellé modifié), DELETE 200, GET confirmant disparition · **recetté (commits `0d4f4b0` + finalisation) : renommage 200, renommage vide 400, DELETE + 0 orphelin + 404 sur veille supprimée — preuves.md ctrl 15-19**
- [x] T5 — Créer `src/app/api/veille/[id]/check/route.ts` : **POST** vérification manuelle — charge la veille, auto-fetch de la route de source existante (`/api/theses-en-ligne/search` rows=50 ou `/api/arxiv/search` max=30, origin = `request.nextUrl.origin`, timeout ≤ 20 s, erreur source propagée 502), diff via `check-core`, premier check = base de référence sans « nouveau » (CA-2.1), mise à jour `lastCheckedAt` (CA-2.4), application de la rétention 200 · preuve attendue : curl check n°1 (aucun nouveau) puis check n°2 sur le même jeu, réponse JSON lisible, `lastCheckedAt` mis à jour · **recetté (commits `5a6889f` + finalisation 502 strict) : HAL check 1 base 9 / check 2 dédup / check 3 newCount 1 après éviction simulée ; arXiv base 30 (max=30) ; rétention 210→200 (10 évincés) — preuves.md ctrl 6, 7, 9, 20, 21**
- [x] T6 — Créer `src/app/api/veille/[id]/results/route.ts` : **GET** résultats (non vus d'abord, puis `firstSeenAt desc`) + **PATCH** marquage « vu » (`{ ids: [...] }` ou `{ all: true }` — CA-3.1) · preuve attendue : curl GET avec compteurs, PATCH partiel puis global, compteurs à zéro · **recetté (commits `3bb0834` + finalisation) : ordre non-vu d'abord vérifié, PATCH partiel updated 1, corps invalide 400, global, unreadCount 0 — preuves.md ctrl 10-14**

Dépendances : Groupe A recetté. Ordre interne T2 → T3 → T4 → T5 → T6.

## Groupe C — Frontend / UI : module nouveau + câblage [DÉPEND DE Groupe B]

- [ ] T7 — Créer `src/modules/veille-academique/veille-academique-page.tsx` : liste des veilles (badge source, compteur non-vus — CA-3.2, dernière vérification — CA-2.4, bouton « Vérifier » par veille, renommage, suppression), état vide explicite invitant à créer depuis une recherche (CA-1.3), vue détail (résultats avec badge « nouveau », marquage vu par résultat + bouton « tout marquer comme vu » — CA-3.1, état vide « aucun nouveau résultat depuis le … » — CA-2.3), spinners/états d'erreur · preuve attendue : rendu navigateur du module (état vide puis avec veille), capture `test-snapshots/`
- [ ] T8 — Câbler la navigation : `src/lib/stores/app-store.ts` (union `ViewId` l.9-51 + entrée `NAVIGATION_ITEMS` « Veille académique », catégorie `recherche`, icône `Binoculars`) + `src/app/page.tsx` (import + `case "veille-academique"` dans le switch l.61-150) · preuve attendue : `bun run lint` 0 erreur, module atteignable dans la barre latérale (rendu navigateur)

Dépendances : Groupe B recetté (les appels réels doivent répondre).

## Groupe D — Frontend / UI : boutons « suivre » dans les UIs de recherche existantes [DÉPEND DE Groupe B]

- [ ] T9 — `src/modules/theses-en-ligne/theses-en-ligne-page.tsx` : ajouter « suivre cette recherche » (zone résultats, visible après une recherche) — dialog léger de nommage (défaut = requête courante) puis POST `/api/veille` avec source "hal", query et filtres courants (l.98-110) — toast de confirmation ; aucune autre modification du fichier · preuve attendue : bouton actif en rendu navigateur, veille créée visible dans `/api/veille`
- [ ] T10 — `src/modules/academic-db/arxiv-search.tsx` : même ajout (source "arxiv", query + sort courants) — aucune autre modification du fichier · preuve attendue : idem T9

Dépendances : Groupe B recetté. **Garantie** : les routes de recherche restent inchangées — seule l'UI consommatrice est modifiée.

## Groupe E — Tests / non-régression [DÉPEND DE Groupe B]

- [ ] T11 — Créer `src/lib/veille/check-core.test.ts` : tests vitest épinglant `diffResults` (premier check → aucun nouveau — CA-2.1 ; diff par `externalId` — CA-2.2 ; résultats déjà connus jamais re-marqués) et `applyRetention` (fenêtre 200, les plus récents conservés) — zéro réseau, zéro db · preuve attendue : test ciblé vert, puis suite complète `bun run test:run` intégralement verte (base : 62 fichiers / 1428 tests + nouveaux)

Dépendances : Groupe B recetté (T2). Indépendant des groupes C et D.

---

Dépendances globales : **A [BLOQUANT] → B → {C, D, E}** (C, D, E mutuellement indépendants). Un groupe à la fois : annonce → feu vert → exécution → preuves → commit(s) → compte rendu → recette.
