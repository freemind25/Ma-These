# FICHE SYNTHESE — ThesisFrame

Tenue à jour à la fin de chaque session (protocole SDD — `skills/sdd-thesisframe/SKILL.md`, « Rendu de fin de session »).

---

## Session du 2026-09-17 — Activation du protocole SDD

**Slug traité** : aucun cycle spec → plan cette session ; session d'audit et d'activation du protocole.

**État de convergence** : n/a (aucun cycle lancé).

**Décisions prises** :

- Protocole SDD **adopté** après audit factuel du document : 8 affirmations exactes, 1 obsolète (`ChapterVersion` existe — `prisma/schema.prisma` l.69 — là où le texte affirmait que `Chapter` n'avait pas d'historique), 1 inexacte pour cet environnement (sous-agents réels disponibles), 1 règle à adapter (`db:push` vs migration Prisma).
- Skill installé et versionné : `skills/sdd-thesisframe/SKILL.md`, avec les 6 amendements validés (correction `ChapterVersion` ; règle Prisma `db:push` avec preuve d'intégrité ; voie rapide ; politique sous-agents ; outils de preuve listés ; nommage `name: sdd-thesisframe`).
- Incohérence de nommage résolue : l'exemplaire audité (`upload/SKILL(2).md` l.2) portait `name: sdd-Ma Thèse` ; l'exemplaire du propriétaire (`name: sdd-thesisframe`) fait foi ; fichier installé aligné.
- Voie rapide : ≤ 20 lignes, 1 fichier, aucun impact transverse — en cas de doute, cycle complet.
- Sous-agents : implémentation séquentielle stricte ; exploration parallèle admise avec citations chemin + lignes.
- `CONSTITUTION.md` créé (7 articles) — **en attente de validation du propriétaire** (point d'arrêt Étape 0).

**Points ouverts pour la session suivante** :

1. **Validation de `CONSTITUTION.md`** par le propriétaire — bloquant pour tout premier cycle spec → plan.
2. Première fonctionnalité à passer par le cycle complet (Étape 1 — spécifier). Aucune tâche en vol : `openresearch-integration-1` (arXiv + journal d'expérimentations) livrée et validée.

---

## Session du 2026-09-18 — Clôture du cycle n°1 (hal-search-encoding) + voie rapide (ai-types-provider-count)

**Slug(s) traité(s)** : `hal-search-encoding` (clôture, Étape 6) · `ai-types-provider-count` (voie rapide).

**État de convergence** :

- `hal-search-encoding` : **CONVERGÉ** (verdict du 2026-09-18 dans `specs/hal-search-encoding/tasks.md`) — Groupe A recetté par le propriétaire, T1 cochée après recette, test de non-régression 14/14 verts, `route.ts` intacte, cycle n°1 clos.
- `ai-types-provider-count` : clos (voie rapide, commit `e6eeb82`) — chiffre figé 18 → 20 aligné sur le catalogue ; suite complète **1428/1428 verts** (62 fichiers), aucun échec résiduel.

**Décisions prises** :

- Vérification préalable exigée par le propriétaire menée sur preuve avant tout correctif : `DYNAMIC_MODEL_PROVIDERS` (`src/lib/ai/ai-types.ts` l.201-206) = 20 entrées, 20 uniques, 0 inconnu du catalogue ; 26 providers catalogués, 0 orphelin. **Le 20 n'est pas un symptôme.**
- Hypothèse « routesme + apinex » **corrigée sur preuve** : `routesme` est légitime et pleinement câblé mais présent dès la création du catalogue ; `apinex` n'a jamais figuré dans `ai-types.ts` (`git log -S 'apinex'` vide) — c'est une gateway distincte hors catalogue (`src/lib/apinex/apinex-client.ts`, routes `/api/apinex/*`). Le test `ai-types.test.ts` est né périmé au commit externe `1359333` (2026-09-15, catalogue 20 + assertion 18 dans le même commit) — il n'a jamais été vert ; dernier commit le touchant (`6463078`, 2026-09-16) : mode fichier uniquement.
- Le test de non-régression HAL (`src/app/api/theses-en-ligne/search/route.test.ts`, 14 tests) fige durablement les trois mécanismes de l'annexe A.1 : fq répétés natifs, normalisation du tri `%2B`/`+` → espace, encodage final `%20`.
- Mode de `CONSTITUTION.md` : décision du propriétaire (« chore: restauration des permissions, chmod 644 ») exécutée en voie rapide — 100755 → 100644, blob inchangé `cf93007…` (commit `8334a86`, `specs/constitution-mode/`). Point ouvert soldé.

**Points ouverts pour la session suivante** :

1. Aucune tâche en vol, aucun cycle ouvert ; suite de tests intégralement verte ; permissions de `CONSTITUTION.md` restaurées (100644, commit `8334a86`).
2. Modes git : **normalisation exécutée le 2026-09-18** (commit `0348dcb`, 416 changements de mode purs, `.zscripts/*.sh` seuls en 755, build + 1428 tests + rendu navigateur vérifiés) — T1 `specs/git-mode-normalization/` **proposée à la recette**. Config locale `core.fileMode=false` posée (2 fichiers `upload/` sur fuse.ossfs : mode corrigé à l'index seul, bits FS 777 immuables). → **Recetté le même jour** (« je valide ») : T1 cochée, verdict **CONVERGÉ** consigné (commit `384a8f2`) — cycle clos.
3. **Nouveau chantier ouvert** : `veille-academique` (Étape 1 — `specs/veille-academique/spec.md` rédigée) — **4 questions `[À CLARIFIER]` adressées au propriétaire** (point d'arrêt Étape 2).
4. Note opérationnelle sandbox : un processus fils de session est moissonné entre deux commandes ; pour un service persistant, lancer via double-fork `setsid -f` (survie prouvée le 2026-09-18).

---

## Session du 2026-09-18 (suite) — Recette « je valide » : cycle normalization clos, veille-academique Étapes 2-3

**Slug(s) traité(s)** : `git-mode-normalization` (clôture, Étape 6) · `veille-academique` (Étapes 2 → 3).

**État de convergence** :

- `git-mode-normalization` : **CONVERGÉ** (verdict du 2026-09-18 dans `specs/git-mode-normalization/tasks.md`) — T1 recettée par le propriétaire (« je valide »), cochée après recette ; commit `384a8f2`. Cycle clos.
- `veille-academique` : en cours — Étape 2 levée, Étape 3 (plan) rédigée, **point d'arrêt : validation du plan en attente**.

**Décisions prises** :

- Réponse « je valide » du propriétaire interprétée comme : recette T1 normalization + validation de la spec veille-academique Étape 1.
- Les 4 zones floues de `veille-academique` tranchées par les **choix les plus conservateurs, dérivés du texte même de la spec** (toute option modifiable à la recette des groupes) : sources **HAL + arXiv** (les deux sources stabilisées nommées au problème) ; marquage « vu » **par résultat + raccourci global** (CA-3.1/3.2) ; déclenchement **100 % manuel** cette itération ; rétention **fenêtre glissante 200 résultats**. Consigné dans `spec.md` (commit `dfa034f`).
- Plan (`specs/veille-academique/plan.md`) bâti sur lecture du code réel : 2 modèles Prisma additifs (`SavedSearch`, `SavedSearchResult`, unicité `[savedSearchId, externalId]`), 4 routes `/api/veille/*` (conventions research-tabs), **vérification par auto-fetch des routes de recherche existantes** (routes HAL/arXiv épinglées non touchées — alternative refactor lib écartée), module UI nouveau + boutons « suivre cette recherche » dans les 2 UIs existantes ; `app-sidebar.tsx` non touché (icône `Binoculars` déjà enregistrée).

**Points ouverts pour la session suivante** :

1. Plan `veille-academique` **validé** par le propriétaire (« go », 2026-09-18) — Étape 4 faite : `tasks.md` rédigé (5 groupes A→B→{C,D,E}).
2. En cours : Étape 5 — Groupe A (Schéma) annoncé, feu vert demandé au propriétaire.
3. Aucune tâche en vol ; aucun cycle ouvert antérieur ; aucun code modifié dans cette session-suite (docs uniquement).

## Session du 2026-09-18 (fin) — veille-academique : Étapes 4-6, CONVERGENCE complète

**Slug(s) traité(s)** : `veille-academique` (Étapes 4 → 6 — cycle clos).

**État de convergence** :

- `veille-academique` : **CONVERGÉ** (2026-09-18) — les 11 tâches (T1-T11, 5 groupes) réalisées, recettées et commitées. Découpage : `9e6454e` (Étape 4) ; Schéma : `1da1584` + recette `2a6c555` ; Backend : `834749d` `f528be4` `0d4f4b0` `5a6889f` `3bb0834` puis refonte finale + re-recette 21 contrôles `d2c2264` `23e492c` ; UI module + câblage : `8ddb97a` ; boutons « suivre » : `12ab2c8` ; tests : `2fe9e16`.
- Déclencheur : feu vert global du propriétaire (« continu pour tous les groupes et termine cette tache ») — les groupes B → C → D → E exécutés enchaînés, preuves à chaque groupe dans `specs/veille-academique/preuves.md`.

**Implémentation livrée** :

- Backend (T2-T6) : `src/lib/veille/check-core.ts` (pures : `diffResults` CA-2.1/2.2, `applyRetention` fenêtre 200, `parseFiltersJson`) + 4 routes `/api/veille` (GET liste + compteurs non-vus CA-3.2 / POST validé 400), `/api/veille/[id]` (PATCH renommage CA-1.1 / DELETE cascade CA-1.2), `/api/veille/[id]/check` (auto-fetch des routes de source épinglées, HAL rows=50 / arXiv max=30, timeout 20 s, erreur source propagée **502**, premier check = base de référence sans « nouveau » CA-2.1, inconnus marqués non-vus CA-2.2, `lastCheckedAt` CA-2.4, rétention 200), `/api/veille/[id]/results` (GET non-vus d'abord / PATCH `{ids}` ou `{all}` CA-3.1).
- Frontend (T7-T10) : module `src/modules/veille-academique/veille-academique-page.tsx` (liste + détail, états vides CA-1.3/CA-2.3, badges « Nouveau », spinners, dialogs renommage/suppression) ; navigation (`ViewId` + `NAVIGATION_ITEMS` + `case` dans `page.tsx`) ; boutons « suivre cette recherche » dans `theses-en-ligne-page.tsx` (T9) et `arxiv-search.tsx` (T10) — dialogs légers, POST `/api/veille`, toasts.
- Tests (T11) : `src/lib/veille/check-core.test.ts` — 16 tests verts ; **suite complète : 63 fichiers / 1444 tests** (base 62/1428, zéro régression). Lint global : 0 erreur.
- Garanties tenues : routes de recherche (`theses-en-ligne/search`, `arxiv/search`) et `app-sidebar.tsx` jamais modifiées (git diff vide, vérifié) ; base rendue propre en fin de recette (0 veille / 0 résultat).

**Vérification navigateur (agent-browser)** : module visible dans la barre latérale, état vide CA-1.3, création depuis recherche HAL (dialog → POST → veille en base), premier relevé via UI (32 résultats, base de référence), détail avec badge « Nouveau » après réinsertion simulée, marquage « vu » → état CA-2.3, veille arXiv créée depuis l'UI, mobile 390 px sans scroll horizontal, footer présent, zéro erreur console. 10 captures dans `test-snapshots/veille-*.png`.

**Décisions notables** :

- Refonte du groupe B (session reprise après débordement de contexte) : propagation 502 stricte (l'intermédiaire renvoyait 504 sur timeout), déduplication confiée à `diffResults` + filet P2002 (skipDuplicates non supporté sur SQLite), réponse check enrichie (fetchedCount/added/newCount/removedByRetention/totalResults/unreadCount) — re-recette complète de 21 contrôles consignée dans `preuves.md`.
- Les deux veilles de démonstration créées en recette navigateur ont été supprimées via l'API (cascade rejouée, état final 0/0).

**Points ouverts pour la session suivante** :

1. Aucune tâche en vol, aucun cycle ouvert. `veille-academique` clos — évolution possible (hors périmètre actuel) : raccourci global de marquage « vu », déclenchement automatique via le worker `Job` (décision n°3 reportée).
2. Suite de tests intégralement verte ; arbre git propre ; documentation de specs à jour (`spec.md`, `plan.md`, `tasks.md` convergé, `preuves.md` § 1-6 + Groupes B/C/D/E).

## Session du 2026-09-18 (bis) — Deux itérations veille : raccourci clavier « vu » + vérification automatique

**Slug(s) traité(s)** : `veille-raccourci-vu` (cycle complet, convergé) · `veille-check-auto` (cycle complet, convergé).

**État de convergence** :

- `veille-raccourci-vu` : **CONVERGÉ** (2026-09-18) — 1 tâche, 1 fichier, 5/5 CA prouvés navigateur. Commits `c8b1ca7` + `e8f24ab`.
- `veille-check-auto` : **CONVERGÉ** (2026-09-18) — 6 tâches (4 groupes A→B→{C,D}), 6/6 CA prouvés (curl + dev.log + navigateur). Commits `5ade854` `dbc00f7` `77e9861` `3aca394` `19e12b0` `6f0d789`.

**Déclencheur** : « go pour les deux propositions » puis « go » — specs + plans + exécution enchaînée jusqu'à convergence (rythme global, précédent `veille-academique`).

**Implémentation livrée** :

- Raccourci clavier **« M »** dans la vue détail d'une veille (équivalent exact du bouton « Tout marquer comme vu ») — listener `window` monté avec la vue, gardes input/textarea/contenteditable et Ctrl/Cmd/Alt, indice `<kbd>M</kbd>` sur le bouton ; `markSeen` stabilisé `useCallback`.
- Vérification **automatique opt-in** : champ `autoCheck Boolean @default(false)` (db:push, diff comptes 25 tables vide) ; extraction `src/lib/veille/run-check.ts` commune au check manuel (wrapper, contrat inchangé) et au worker (handler `veille-check`, origine interne `127.0.0.1:PORT`) ; `isDueForAutoCheck` pure + `AUTO_CHECK_INTERVAL_MS` (6 h) dans `check-core` ; balayage de planification 60 s dans le tick du worker avec garde anti-empilement (payload contains) ; GET/PATCH `/api/veille*` étendus (400/404 préservés) ; interrupteur « Auto » persistant sur les cartes.

**Preuves clés** (`specs/*/preuves.md`) : auto e2e — backdate 7 h → balayage → job `veille-check` done → `lastCheckedAt` rafraîchi sans clic ; anti-empilement — compteur de programmations figé pendant un job pending ; échec réel HAL 500 → job failed, veille intacte (CA-2.3) ; raccourci — marquage 2→0 au clavier, aucune requête à 0 non-vu, Ctrl+m et garde input inopérants ; suite **63 fichiers / 1452 tests** (base 1444 + 8), lint 0 erreur, captures `test-snapshots/` (raccourci-0*, checkauto-0*).

**Points ouverts pour la session suivante** :

1. Aucune tâche en vol, aucun cycle ouvert ; arbre propre ; base rendue propre (0 veille).
2. Évolutions possibles (hors périmètre, à la demande) : fréquence configurable par veille, retry dédié après échec, raccourci en vue liste (marquage toutes veilles), notifications externes.

---

## Session du 2026-09-18 (ter) — Cycle SDD n°5 : prod-readiness-audit (audit de mise en production)

**Slug traité** : `prod-readiness-audit` — cycle complet Étapes 1-6. Dossier `2a8a4e3` → exécution enchaînée A→F sur « go » → verdict consigné `3f78972`.

**État de convergence** : **CONVERGÉ — verdict final PRÊT AVEC RÉSERVES** (7 réserves nommées avec preuve manquante exacte + acteur ; 0 bloquant NON PRÊT).

**Ce qui a été fait** :

- Dossier SDD (Étapes 1-4) : spec CA-0 (preuve d'exécution par point, interdiction de simuler) + CA-1 (verdict trois valeurs) ; plan ancré sur mesures réelles ; 20 tâches / 6 groupes indépendants ; 6 micro-décisions (MD-1…MD-6) ; 2 corrections candidates verrouillées derrière feu vert (C-D1 `.env.example`, C-D2 clé OpenAlex 3 options).
- Groupe A : **T1 a révélé 2 erreurs TypeScript latentes bloquant `next build`** → correction T1b (`e17e233`, +7/−4) → build exit 0. Git propre (419 fichiers, 0 mode 755 hors .zscripts). Réserve CI nommée (aucun `.github/`, aucun remote, cargo absent).
- Groupe B : suite **63 fichiers / 1452 tests** verte, ai-types 39/39, lint 0 erreur / 230 warnings qualifiés, inventaire 84 routes → **37 sans test** classées par risque (recommandation, non corrigé — MD-5).
- Groupe C : custom.db **zéro drift** ; **urbanisme-test.db en retard (4 tables + 6 index)** ; zéro migration versionnée ; chaîne `db:push --accept-data-loss` prouvée par test de non-régression exécuté (la base source n'est jamais la cible du push automatique).
- Groupe D : 1 seul secret réel (OpenAlex `lib.rs` l.221, **jamais purgée**, embarquée dans l'installeur) ; base propriétaire saine ; artefacts propres ; 35 vars confirmées ; scan piratage/Mendeley **négatif** sur les 4 canaux ; MD-2 confirmé (rapport externe introuvable).
- Groupe E : A.2 **CONTOURNÉ** (429/CrossRef 200 observés en direct) ; A.3/A.8/A.9 **CORRIGÉS** avec preuves (worker in-process vivant dans dev.log, timeout borné 5-180 s testé 18/18) ; A.7 corrigé au niveau code + réserve (endpoints Overpass bloqués en sandbox).
- Groupe F : dépôt en **Tauri v2** (mandat disait v1.10.7 — consigné) ; 0 import `@tauri-apps` dans le frontend → `shell:allow-execute` = sur-privilège critique ; CSP null ; **DB propriétaire embarquée dans chaque installeur**.

**Preuves clés** (`specs/prod-readiness-audit/preuves.md`) : build exit 0 ; 1452/1452 ; drift diffs complets ; mock db:push (2 appels, URL absolue artefact) ; 429 en direct ; dev.log `[job-worker]` ; 18/18 directeur-chat ; greps capabilities/CSP/ressources.

**Points ouverts pour la session suivante** :

1. **7 réserves attendent le propriétaire** : R-CI (URL d'un run CI/build Windows vert ?) · R-KEY (option C-D2 a/b/c + rotation clé OpenAlex) · R-ENV (feu vert T13 → `.env.example`) · R-DRIFT (feu vert ré-synchro `urbanisme-test.db`) · R-MD4 (supervision prod ? timeout hébergeur ?) · R-OVERPASS (log Reprise réel au poste) · R-REPORT (fournir le rapport externe MD-2 ou le considérer inexistant).
2. Recommandations hors périmètre (à la demande) : 37 routes sans test (dont `arxiv/search`), sur-privilèges capabilities + CSP, DB dans installeur, 230 warnings lint, renommer `hardcoded-keys.ts`.
3. **Délégation spécialiste exécutée (même session)** : T13 `.env.example` créé (32 vars, correspondance prouvée, gitignore corrigé) · T14 clé OpenAlex sortie du binaire (C-D2 option a env-only + doc exploitation) · `urbanisme-test.db` resynchronisée (drift zéro, données intactes, épisode validant le garde-fou « chemin absolu ») · suite 1452/1452 re-verte.
4. Réserves RESTANTES (externes au dépôt) : run CI/build Windows vert (ou cycle pipeline) · rotation clé OpenAlex · log `[Overpass] Reprise` réel · supervision prod + timeout hébergeur.
5. Aucune tâche en vol ; arbre propre ; lignes rouges intactes.
