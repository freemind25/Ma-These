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

---

## Session du 2026-09-18 (quater) — Cycle SDD n°6 : build-desktop-pipeline

**Slug traité** : `build-desktop-pipeline` (« go » sur recommandation) — cycle complet en délégation.

**État de convergence** : **CONVERGÉ (prêt pour la CI)** — réserve unique : le run vert, invérifiable en sandbox, acteur propriétaire après push.

**Ce qui a été fait** :

- `.github/workflows/build-desktop.yml` versionné (**84 lignes réelles** — wc -l, git stat cfa3377 ; « 102 » corrigé le 2026-09-18, voir preuves § Suivi ; YAML validé par parseur ×2) : déclencheurs tag `v*` + manuel, runner `windows-latest`, bun, **garde-fou de drift en tête de pipeline** (`prisma migrate diff --exit-code` sur les 2 bases, lecture seule, échec avant tout build coûteux), Rust MSVC, `tauri-action@v0` (exécute `beforeBuildCommand` = `scripts/build-tauri-prep.sh` l.8 de la conf), cible NSIS, release draft + artefact.
- Garde-fou **prouvé dans les deux sens** : exit 0 (custom.db synchrone) / exit 2 (copie de drift fabriquée) — note de discipline : première mesure faussée par `| head`, re-mesurée proprement.
- 7 contrats croisés cités en preuve (conf→script→next.config→package.json→RUNNER_OS).
- Précision d'énoncé : « v1.10.7 » = version du **produit** (`tauri.conf.json` l.4) ; le framework est Tauri v2.

**Reste au propriétaire** : pousser le dépôt sur GitHub → `workflow_dispatch` ou tag `v1.10.7` → fournir l'URL du run vert. Recommandation hors périmètre : signature Authenticode.

## Session du 2026-09-18 (quinquies) — R-CI : délégation du push bloquée par une clé GitHub invalide

- Le propriétaire fournit une clé GitHub « provisoire » pour déléguer le reste de T4 (créer le repo distant → pousser → `workflow_dispatch` → URL du run vert).
- **Clé rejetée par GitHub : HTTP 401 Bad credentials, 3 tentatives, 2 schémas** (Bearer ×2, token ×1) ; format `ghp_` classique correct (40 car.) → jeton inexistant côté GitHub (révoquée, expirée ou erreur de copie). Aucune valeur de clé consignée dans le dépôt.
- Préparation complète (mesurée) : arbre propre, `main`, 46.36 MiB, blob max 9.5 MB (`db/custom.db`) — pas de LFS ; script `/home/z/push-thesisframe.sh` hors dépôt (repo privé → remote sans token → askpass éphémère → dispatch → URL Actions).
- Correction documentaire : workflow = **84 lignes** réelles (wc -l, git stat cfa3377), pas « 102 » (fiche corrigée ; preuves/worklog historiques inchangés, correction consignée dans preuves.md).
- **Prérequis restant** : une clé GitHub classique valide, scopes `repo` + `workflow` — dès réception, le push complet s'exécute en une commande. Rappel : révoquer la clé après usage ; rotation OpenAlex toujours en attente.
- **Résolution (même jour, 17:15-17:35)** : 2e clé valide (`freemind25`, scopes `repo, workflow`) → repo **privé** `freemind25/ThesisFrame` créé (201 — repos existants publics à historiques divergents écartés, décision documentée) → push `main` complet → `workflow_dispatch` → **run 35373767136 SUCCESS en 13 min 42 s** : 10/10 steps verts, **garde-fou drift vert en CI**, artefact `windows-installer` 73.1 MB, release draft « Ma Thèse v1.10.7 ». URL : https://github.com/freemind25/ThesisFrame/actions/runs/35373767136 — **R-CI dissoute**. Usage futur : tag `v*` ou dispatch manuel ; releases en draft à publier. Clés transités par chat : à révoquer.
- **Build v1.10.8 par tag (même jour, 18:47-18:58)** : ordre « démarrez le tag v1.10.8 » — sans bump, l'installeur aurait été étiqueté 1.10.7 (version lue dans `tauri.conf.json`) → bump 3 manifests ×1 ligne (commit `f0e1a4b`) → tag annoté `v1.10.8` → **run 35382304899 SUCCESS en 9 min 13 s** (10/10 steps, garde-fou vert, rust-cache efficace) → release draft « Ma Thèse v1.10.8 » + artefact 73.1 MB. Le trigger `push.tags v*` est prouvé opérationnel en plus de `workflow_dispatch`. Deux drafts (v1.10.7, v1.10.8) à publier manuellement.
- **Publication des releases (2026-09-19, 05:58)** : ordre « publish the draft release » → publication API des deux drafts : **v1.10.7 PUBLISHED** (tag créé à la publication → `058b80c`) et **v1.10.8 PUBLISHED** (tag existant → `f0e1a4b`), assets NSIS 73.1 MB chacun, 0 draft restante. URLs : `…/releases/tag/v1.10.7` et `…/releases/tag/v1.10.8`. Incident consigné : sandbox local restauré sur un instantané ancien/divergent (`995916c`) → resynchronisé sur `origin/main` (`e3f2f93`) sans perte (worklog remote = sur-ensemble). Rappel sécurité : révoquer les clés transités par chat ; rotation OpenAlex en attente.
- **Rotation OpenAlex (2026-09-19, 06:20-06:35)** : audit complet — la clé historique (lib.rs pré-`0543a4f`, import externe `1359333`) est **toujours active** (HTTP 200) et la valeur transmise par le propriétaire s'est révélée **identique à l'ancienne** (preuve : extraction `0543a4f^`) → rotation non effective. Découverte et correction : clé complète en clair dans 2 preuves versionnées (`plan.md` l.27, `preuves.md`) → masquées. Clé installée hors dépôt dans `.env.local` (ignoré git) ; l'app web la charge, l'app desktop lira la variable d'environnement de la machine. **Reste propriétaire : régénérer sur openalex.org/settings/api** puis transmettre la nouvelle valeur. Restes : rotation APINEX ; révocation clés GitHub.

---

## Session du 2026-09-28 — Cycle SDD n°7 : ressource-methodes-mixtes

**Slug traité** : `ressource-methodes-mixtes` — ordre « ajouter cette ressource en respectant le protocole d'ajout, de digestion, etc. » (PDF ressources.pdf, 12 p.).

**État de convergence** : **CONVERGÉ** — spec CA 1.1→3.3 vérifiées (capteur budget, recette navigateur, lint, 1452/1452).

**Décisions** : guide STUDYSmarter/UWA (p.10-11, déjà reçu via res.pdf le 14/09 mais jamais intégré) en verbatim recadré (chrome e-mail supprimé, en-tête + logo UWA et filigrane d'origine conservés) ; article Sandelowski 2000 (p.1-9) en fiche de lecture FR 2 pages (sources HTML versionnées) + digestion intégrale dans METHODOLOGY_MODULE (2 sections compactes) et 2 sources brutes dans modules/ ; visionneur de ressources étendu au multi-pages (les 2 infographies d'origine restent mono-page) ; budget prouvé avant/après (20 123 → 20 928 tok / 22 000 ; méthodologie 4 470 / 5 000, toujours max) ; compteurs AGENTS/ARCHITECTURE synchronisés au capteur, drift historique signalé sans réécriture de masse.

**Livrés** : commits b358b60 (feat dashboard), 094edd8 (docs ia), b1cdba6 (docs sdd) + consignation push — poussés dd83ae5..b1cdba6 sur origin/main ; lignes rouges 0 diff avant chaque commit ; upload/ inchangé.

**Points ouverts pour la session suivante** : si le propriétaire préfère l'article Sandelowski en 9 pages verbatim (filigrane inclus), la variante est faisable en un cycle court ; révision du tableau historique des tokens (AGENTS l.170+, ARCHITECTURE §4) à faire lors d'une passe de documentation dédiée ; sécu inchangée — rotation OpenAlex et APINEX en attente côté propriétaire, révocation des clés GitHub transités par chat à opérer.

---

## Session du 2026-10-02 — Cycles SDD n°8-10 : pack-soutenance, brouillon-chapitre, export-notes-bas-page

**Déclencheur** : comparatif TrustMémoireAI (2026-09-19) puis mandat « ok pour vos propositions » — 3 fonctionnalités approuvées, traitées selon le rythme global (specs + plans + exécution enchaînée, précédent veille-check-auto).

**État de convergence** : les 3 cycles **CONVERGÉS** (recette propriétaire en attente).

- `pack-soutenance` : module Soutenance (catégorie Méthodologie, badge IA) — 3 onglets Slides/Discours/Questions du jury, modèle `SoutenancePrep` 1:1, route d'IA dédiée (maxTokens 2500/8000/6000, extraction JSON, normalisation caps), persistance GET/PUT. 9 commits `bf7aa33`..`0172cac`. 65 fichiers/1471 tests à la clôture, 8 captures dont générations IA réelles.
- `brouillon-chapitre` : module Brouillon de chapitre (Rédaction, badge IA) — route SSE `/api/chapter-draft/stream` (maxTokens 12 000, prompt strict « citer uniquement les références fournies »), convertisseur `src/lib/markdown-to-html.ts` (liste blanche), aperçu + insertion après confirmation (remplacement, version native). 8 commits `f6680e6`..`e9b3e57`. 67/1506. Insertion réellement prouvée : 1 957 mots, 2 versions d'historique.
- `export-notes-bas-page` : notes de bas de page DOCX (vraies notes Word, `Document({footnotes})`, ids ≥ 1, une note par référence, option OFF byte-identique) + PDF (exposants + section « Notes » fin de document). Bibliothèques partagées `src/lib/citations.ts` (adaptée d'alignement-preuves, module non retouché) et `src/lib/apa-format.ts`. 7 commits `6c403ff`..`f319bc2` + docs. 68/1531. Preuve DOCX par unzip (footnotes.xml, 2 renvois même note, citation inconnue intacte).

**Compteurs** : 44 → **46 modules** partout (README ×3, NOTICE ×2, NOTE-PRESENTATION, AGENTS ×2 qui restait à « 36 » obsolète).

**Décisions** : délégation d'implémentation aux agents spécialisés (T4-a/T4-b) avec consignation anticipée anti-coupure ; reprise orchestrateur sur les fins de cycles coupées par délai (T4-c : T4-T7). Compte rendu par groupe dans chaque preuves.md.

**Incidents** : (1) SQLite « readonly database » (1032) sur le serveur de dev de longue date — journal chaud + double serveur concurrent ; résolu par purge des journaux + redémarrage unique ; sans rapport avec le code. (2) Chapitre 1 de la thèse de démonstration utilisé comme cible de recette : le contenu préalable (1 983 caractères de type brouillon IA, déjà présent avant la session — prouvé par git 0b27f0c) est récupérable dans l'historique git de db/custom.db ; l'état actuel (brouillon de recette, 1 957 mots) reste démonstratif.

**Résidus signalés (hors périmètre)** : références de test d'août en base (« Test Reference for E2E Testing », « Test Reference T4 Persistence ») ; titres DOCX sans HeadingLevel (TDM Word) ; PDF de la notice non régénéré après l'ajout des sections 5.8/7.10 et des mentions d'options (pipeline docs/pdf-sources disponible).

**Points ouverts** : recette propriétaire des 3 modules (cases tasks.md non cochées — cochées après acceptation) ; rotation OpenAlex et APINEX toujours en attente ; révocation des clés GitHub transités par chat.

---

## Session du 2026-10-03 — Cycle SDD n°11 : ressource-revues-litterature (ajout + digestion)

**Déclencheur** : ordre propriétaire « dans le respect du protocole de rajout des ressources et connaissances établis précédemment, veuillez rajouter les éléments ci-joints » — 2 PDF dans `upload/` (Snyder 2019 JBR 104 ; Sandelowski 2000 RNH 23(3) retransmis).

**État de convergence** : **CONVERGÉ** — CA-1.1→3.1 vérifiées (recette navigateur desktop + mobile 390, capteur budget, lint 0 erreur, 1531/1531).

**Décisions** : Sandelowski 2000 retransmis = **déjà intégré le 28/09** (identité prouvée par pdftotext : 9 pages, filigrane « Askpstudyinaustralia », RNH 23:246-255, marqueurs digest) → **aucune duplication** (CA-3.1) ; Snyder 2019 = nouveau → protocole complet (fiche 2 pages au gabarit Sandelowski + 5e carte + digestion dans `LITERATURE_REVIEW_MODULE`, section « Typologie et conduite des revues (Snyder 2019) » + source brute `modules/revue-litterature-snyder.md`) ; le savoir comble le trou entre Ollhoff (narrative) et Sułkowski (SLR) : typologie systématique/semi-systématique/intégrative, 4 phases, critères qualité (profondeur/rigueur/réplicabilité/utilité), erreurs de publication.

**Livrés** : commits `2453717` (feat ressources), `913f085` (docs ia), `50094d2` (docs sdd + captures) — lignes rouges 0 diff avant chaque commit ; upload/ inchangé.

**Compteurs budget** : full core 20 928 → **21 794 tok / 22 000 (marge ~206 tok)** — signalé dans AGENTS.md comme point d'attention : toute nouvelle ingestion exigera compaction ou dé-injection ; literature-review 2 228 → 3 094 tok ; méthodologie 4 470 toujours max ; mode le plus lourd directeur ~16 302 / 17 000.

**Points ouverts pour la session suivante** : marge full core quasi épuisée (voir ci-dessus) ; recette propriétaire (cases cochées conformément au précédent du cycle 2026-09-28) ; PNG de la notice et PDF non régénérés (résidu déjà signalé) ; rotation OpenAlex/APINEX et révocation des clés GitHub toujours en attente côté propriétaire.

## Session du 2026-10-03 — Recette déléguée des cycles n°8-10 + correction d'aperçu

**Déclencheur** : ordre propriétaire « faites pour le mieux » après restitution de l'état réel (les 3 cycles approuvés du comparatif TrustMémoireAI étaient déjà CONVERGÉS, recette en attente — ma mémoire de session était obsolète ; écart signalé conformément à la Constitution).

**Recette déléguée exécutée en conditions réelles** (serveur dev 3000, thèse « Urbanisme durable ») :
- `pack-soutenance` : 3 générations IA réelles (slides ×3 HTTP 200 après un 502 ponctuel géré par design, discours 15 min, 10 questions par familles), persistance prouvée (rechargement + GET API : 11 slides / 10 609 car. / 10 questions). 12/12 CA. **ACCEPTÉ**.
- `brouillon-chapitre` : génération SSE (chap. 7, 400 mots, 2 références) → confirmation de remplacement → **338 mots insérés**, version « 03/10/2026 15:30 — 338 mots » dans l'historique. 11/11 CA. **ACCEPTÉ**.
- `export-notes-bas-page` : DOCX ON (note unique APA complète + 2 renvois, unzip prouvé) / OFF (0 renvoi, citation intacte) ; PDF — écart de convergence comblé avec citations réelles (2 exposants + section Notes vérifiés navigateur). 9/9 CA. **ACCEPTÉ**.

**Défaut découvert pendant la recette et corrigé** (Groupe C — T6, même groupe) : l'aperçu PDF restait vide au retour sur l'onglet (course iframe/document.write — jamais exercée avant). Correctif : rendu de l'aperçu basculé sur `srcDoc` (déterministe), `src/modules/export-pdf/export-pdf-page.tsx`, 1 fichier 6+/10-. Lint 0 erreur (231 warnings baseline) ; vitest 68 fichiers / 1531 tests verts. 22/22 cases cochées des 3 cycles.

**Livrés** : captures `test-snapshots/recette-*.png` (8) ; commits fix(export) + docs(sdd).

**Points ouverts pour la session suivante** : mémoire serveur dev ~2,4 Go RSS → OOM sur cette box 4 Go lors des recompiles lourdes (redémarrage avec NODE_OPTIONS=--max-old-space-size, à surveiller) ; voie jsPDF « Télécharger PDF » rasterise/duplique en headless (limitation environnement, hors périmètre) ; rotation OpenAlex/APINEX + révocation clés GitHub toujours en attente côté propriétaire.


## Session du 2026-10-03 (suite) — Cycle n°11 « compétences-livres-vivantes » (cycle complet, CONVERGÉ)

**Déclencheur** : comparaison demandée par le propriétaire entre l'écosystème skills.sh (vercel-labs/find-skills) et notre architecture « compétences ». Constat factuel : la base `CustomBookSkill` (58 ressources) n'atteignait **jamais aucun prompt IA** — une compétence morte, sans UI de création/édition. Délégation complète du propriétaire (« terminez toutes les actions avant de revenir pour moi pour avis ») — exécution SDD intégrale sous délégation, choix conservateurs consignés dans la spec, révisables à son retour.

**Implémentation livrée** (commits `0298f5c`→`16a00d7`) :
- Schéma (T1) : `CustomBookSkill` + `description String?`, `source String?`, `enabled Boolean @default(false)` — db:push additif, 58/58 lignes survécues, opt-in strict (CA-2.1).
- Backend (T2a-T4) : GET (colonnes ajoutées), POST/PUT zod étendus (description ≤ 500, source ≤ 300, enabled ; 400/404 préservés). **Écart Article 4** : le GET complet échouait en P2010 pour **bug préexistant** — 8 lignes du 2026-08-23 stockaient des dates en texte ISO 6 décimales (le runtime Node exige des entiers epoch-ms) ; normalisées en epoch-ms, comptes 58=58 prouvés. L'ancienne requête échouait à l'identique — rien introduit par le cycle.
- IA (T5-T8) : bibliothèque pure `src/lib/ai/book-skills.ts` (`selectBookSkills` déterministe récence-d'abord, plafond **12 000 car.** de contenu ; `buildBookSkillsIndex` plafond **1 500 car.** avec mention « contenu non injecté (budget) » ; `buildBookSkillsSection` **null si 0 active** → prompts byte-identiques) ; accès serveur `getActiveBookSkills()` ; injection dans `chapter-draft/stream` (3e paramètre, continuation inchangée) et `ai-writing`/`stream` (message système dédié) ; règle d'intégrité : les savoirs sont un appui, **JAMAIS une source de citations** (CA-3.5).
- UI (T9-T10) : onglet Bibliothèque — création/édition complète (dialog : titre, auteur, provenance, description d'usage, tags, contenu, interrupteur « Utilisée par l'IA » désactivé par défaut), interrupteur par carte avec badges « Injectée »/« Hors IA », **fix du `~` parasite** qui affichait des nombres de mots négatifs.
- Docs (T12) : section « 6 bis. Canal “Compétences livres” » dans `docs/ARCHITECTURE-CONNAISSANCE.md`.

**Vérifications** : suite **69 fichiers / 1548 tests verts** (baseline 68/1531 + 17 nouveaux, zéro régression) ; lint **0 erreur / 231 warnings** (= baseline) ; lignes rouges **0 diff** à chaque commit ; recette navigateur agent-browser (15 contrôles : création/édition/suppression UI, opt-in par défaut, badge Injectée persistant au reload, génération live HTTP 200 avec compétence active, mobile 390 px sans scroll horizontal, 0 erreur console, 5 captures `test-snapshots/competences-*.png`) ; **14/14 CA**, verdict **CONVERGÉ** (recette déléguée).

**Défaut découvert en recette et corrigé** : POST 400 — l'UI envoyait `null` là où le schema POST n'acceptait que `undefined` ; `.nullish()` sur les 4 champs (commit `16a00d7`), re-recetté.

**Recette déléguée supplémentaire (2026-10-03, 19:14-19:22) — les 58 par ordre de récence** : demande « faites le teste pour les 58 par ordre de récence » exécutée sur données réelles. Ordre `updatedAt DESC` vérifié ; simulation des 58 actives : 6 injectées (11 745/12 000 car.), 52 en index, mention « contenu non injecté (budget) » et règle d'intégrité présentes ; **constat d'usage** : la ressource la plus récente (Guide to Academic…, 30 000 car.) dépasse seule le plafond — jamais injectable en intégral, index-only (CA-3.3 par design) ; UI : 58 cartes, activation rangs 1-2 → badges « Injectée » persistants au reload, génération live `POST /api/chapter-draft/stream → 200` (aperçu 237 mots, aucun contenu persisté), 0 erreur page, mobile 390 px sans scroll horizontal ; **état initial restauré intégralement** (0/58 active, timestamps d'origine remis depuis git HEAD, équivalence logique live/HEAD prouvée 58/58 — diff binaire résiduel = compteurs SQLite). Preuves : `specs/competences-livres-vivantes/preuves.md` § « Recette déléguée — les 58 » + 2 captures `test-snapshots/competences-58-recette-*.png`.

**Validation déléguée (2026-10-03)** : le propriétaire a répondu « oui » à la validation du cycle par recette déléguée — cycle n°11 **clos et validé**. Micro-changement livré dans la foulée (voie rapide, `assess-taille-conseillee.md`) : compteur live « N caractères — taille conseillée ≤ 12 000 » dans le dialog de création/édition, vire à l'ambre au-delà du seuil (12 lignes, 1 fichier, lint 0 erreur, recette navigateur).

**Points ouverts pour la session suivante** : stamp de version des savoirs pour le Sceau de vérité (hors périmètre, reporté) ; extension de l'injection aux flux d'analyse (non planifié) ; mémoire box (OOM) toujours à surveiller ; rotation OpenAlex/APINEX + clés GitHub côté propriétaire.

## Session du 2026-10-03 (suite) — Cycle n°12 « sceau-provenance-savoirs » (cycle complet, CONVERGÉ)

**Déclencheur** : « ok pour la prochaine étape » puis « ok » (IM) — ouverture et validation de la spec/plan/tâches (`f4793a6`), puis exécution intégrale. Chantier reporté par le cycle 11 : la trace des savoirs qui nourrissent chaque génération IA.

**Livrable** : chaque état du texte de chapitre porte désormais sa **provenance des savoirs** — version du noyau (`KNOWLEDGE_CORE_VERSION`) + compétences livres actives avec leur mode d'injection (intégral / index seulement). Le stamp est émis en fin de stream **hors prompt** (`chapter-draft/stream`, `ai-writing/stream`), affiché dans un bloc partagé (`src/components/knowledge-stamp-block.tsx` : aperçu du brouillon, résultat de l'assistant d'écriture, historique du chapitre) et **persisté** à l'insertion (colonnes `stamp` JSON sur `Chapter`/`ChapterVersion` ; absent = « saisie manuelle »). Version du noyau consignée dans un tableau de traçabilité (`ARCHITECTURE-CONNAISSANCE.md` § 6 ter).

**Commits** : `7e4528e` (schéma, 7/4/58/1 survécues), `09275ac` (lib pure + 10 tests), `e948c87` (streams + PUT + GET versions), `ada013f` (GET état courant), `15819f6` (UI partagée), `501f12b` (docs).

**Vérifications** : vitest **70 fichiers / 1558 verts** (+10, zéro régression — prompts byte-identiques inclus) ; lint **0 erreur / 231 baseline** ; lignes rouges 0 diff à chaque commit ; recette navigateur (8 contrôles) : bloc provenance dans l'aperçu + détail dépliable, insertion → stamp sur chapitre ET version, historique (« état actuel » + par version + « saisie manuelle »), ai-writing 0 compétence → « aucune compétence livre active », mobile 390 px sans scroll horizontal, 0 erreur console, 2 captures. **10/10 CA — CONVERGÉ** (recette déléguée).

**Écart documenté** : la spec initiale du plan supposait des versions = états antérieurs ; vérification réelle (Article 4) → snapshots du nouvel état, design simplifié avant implémentation (plan.md § 4 corrigé). Incident environnement résolu : serveur dev à redémarrer après db:push (client Prisma régénéré) — GET versions en 500 sinon.

**Validation propriétaire (2026-10-04)** : « OK » (IM) — recette déléguée 10/10 CA acceptée, aucune réserve, **cycle n°12 clos et validé**.

**Points ouverts pour la session suivante** : extension du stamp aux autres flux (soutenance, deep-research, chat directeur — non planifié) ; le Truthmark reste inchangé ; OOM box à surveiller ; rotation OpenAlex/APINEX + clés GitHub côté propriétaire.


## Session du 2026-10-07 — Analyse URBANIS-DZ + cycle n°13 « urbanis-dz-mode » (cycle complet, CONVERGÉ)

**Déclencheur** : le propriétaire a fourni son pack « URBANIS-DZ » v1.1 (PDF 5 pages — instruction système spécialisée urbanisme Algérie : 12 règles dures, modes M1-M7, protocole risques, format de sortie avec bloc de traçabilité) et demandé une analyse d'intégration. Analyse préliminaire consignée (`specs/urbanis-dz-integration/analyse-preliminaire.md`, commit `0960639`) : 3 options chiffrées, constat que T1 Provenance ≈ cycle 12 déjà livré et C4 Corpus ≈ compétences livres. Le propriétaire a répondu **« A »** (mode spécialisé).

**Implémentation livrée** (commits `d40ae26` ouverture, `4058cd8` groupe A, `7af3a12` groupe B, `1deea65` groupe C) :
- `src/lib/ai/specializations/urbanis-dz.ts` : instruction système du pack retranscrite **verbatim** (§ 2, ~4 900 car.) + passerelle d'intégration minimale consignée (usage thèse, intégrité citations compétences livres, langue). **Prompt autoporteur** (`buildStandalonePrompt`) — n'embarque pas le noyau (~1 300 tok, marge full core intacte).
- Registre `SPECIALIZATION_PROMPTS['expertise-urbaine-dz']` + entrée `WRITING_MODES` (icon `Building2`, temp 0.4) + `ICON_MAP`.
- UI : note ambre permanente quand le mode est actif — « Avis technique non opposable — toute règle juridique doit être vérifiée au JORADP ».
- Tests : `urbanis-dz.test.ts` (11 tests : 12 règles dures, M1-M7, protocole risques, autoporteur, budget ≤ 7 000 car., câblage, snapshot anti-dérive) + inscription `urbanis-dz` dans `allowedStandalone` du capteur budget.
- Docs : § 6 quater dans `docs/ARCHITECTURE-CONNAISSANCE.md`.

**Vérifications** : vitest **71 fichiers / 1 569 verts** (baseline 1 558 + 11) ; lint **0 erreur / 231 warnings** ; lignes rouges **0 diff** à chaque commit ; recette navigateur (8 contrôles) : mode visible/sélectionnable, note DOM, **banc d'essai T4 live** (« Peut-on construire ici ? » → cadrage 6 rubriques, FAIT SOURCÉ, refus de conclure sans POS/PDAU, bloc de traçabilité 7 champs, mention non-opposabilité), bloc « Provenance des savoirs » intact, mobile 390 px sans scroll horizontal, 0 erreur console, 3 captures. **7/7 CA — CONVERGÉ** (recette déléguée).

**Écarts documentés** : (1) bloc test câblage déplacé T3→T4 (ordonnancement) ; (2) `knowledge-core.budget.test.ts` ajouté au plan Article 4 (le capteur budget identifie les spécialisations par nom de fichier et exige la déclaration des autoporteurs).

**Validation propriétaire (2026-10-07, 11:25)** : « ok et enchainer » (IM) — recette déléguée 7/7 CA acceptée sans réserve, **cycle n°13 clos et validé** ; « enchaîner » = passage à l'Option B (registre juridique structuré `LegalRef`, séquence de l'analyse préliminaire § 5-6).

**Points ouverts pour la session suivante** : Option B (registre juridique structuré `LegalRef` + injection sélective) — enchaînée sur validation ; Option C (veille JORADP — pas d'API publique stable) proposée mais non planifiée, en veilleuse ; rotation OpenAlex/APINEX + clés GitHub côté propriétaire ; OOM box à surveiller.

## Session du 2026-10-07 (suite) — Correction fausse alerte + analyse « article scientifique » (point d'arrêt)

**Correction consignée** : l'« anomalie d'environnement » signalée au propriétaire était une **fausse alerte de l'agent** — `src/app/api/route.ts` existe réellement (health check), `page.tsx` est un unique fichier de 60 imports avec un switch de 45+ cas, les extractions PDF étaient conformes. Aucun impact produit (arrêt intervenu avant tout code/artefact). Le cycle n°14 « urbanis-dz-registre » (Option B LegalRef) reste ouvert en exploration, **en pause** derrière la nouvelle demande.

**Nouvelle demande** : cahier des charges « brouillon d'article scientifique » (thèse/mémoire → article, 7 étapes guidées, intégrité stricte). Analyse préliminaire livrée (`specs/article-scientifique/analyse-preliminaire.md`) : 18 correspondances avec l'existant (streams, stamp, versions, export-docx, traducteur, Job), 5 gaps (import PDF/DOCX, modèle Article, assistant guidé, prompt d'intégrité, traçabilité par section), signalement structurel (app mono-utilisateur locale — pas d'auth multi-comptes à respecter), 3 options chiffrées. **Recommandation : Option A** (socle couvrant les 10 critères d'acceptation, ~2-3 cycles) puis B ; C (OCR) en veilleuse. **Point d'arrêt : choix du propriétaire attendu.**
