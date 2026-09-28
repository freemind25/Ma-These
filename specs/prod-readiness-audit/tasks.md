# Tasks — prod-readiness-audit

Contexte : mandat du propriétaire (2026-09-18) — audit de mise en production, **preuve à chaque point, pas une déclaration de confiance** ; verdict final PRÊT / PRÊT AVEC RÉSERVES / NON PRÊT. Cycle complet (audit multi-axes ≫ seuil voie rapide). Règle : ne corriger que ce qui est explicitement listé ; les corrections candidates sont des tâches dédiées, feu vert à la recette de leur groupe.

## Groupe A — Build & CI

- [x] T1 — `bun run build` : succès, warnings consignés et qualifiés (MD-3) · preuve attendue : sortie de build horodatée dans `preuves.md` · **réalisé (« go », 2026-09-18) : build ÉCHEC au départ — 2 erreurs TypeScript latentes (run-check.ts l.290, veille-academique-page.tsx l.275) révélées par l'audit ; corrigées en T1b ; build final exit 0, 0 warning bloquant (2 notes : dépréciation middleware→proxy, experiments serverActions) — commits `e17e233`**
- [x] T1b — **[CORRECTION NÉCESSAIRE, issue de T1]** corriger les 2 erreurs de type bloquant `next build` : `run-check.ts` (horodatage capturé une fois, écrit et retourné) + `veille-academique-page.tsx` l.275 (`onCheck={() => runCheck(selected.id)}`, pattern existant l.308) — diff minimal +7/−4, comportement inchangé · preuve : build exit 0 (preuves.md § T1) — **commit `e17e233`**
- [x] T2 — Propreté git : `git status` vide sur `main`, `git ls-files -s` 755 hors `.zscripts/*.sh` = 0, `git show --stat 0348dcb` = 419 fichiers (MD-6) · preuve attendue : sorties des trois commandes · **réalisé (« go », 2026-09-18) : conforme — 0 mode 755 hors .zscripts, 419 fichiers prouvés (mandat disait 410)**
- [x] T3 — Constat CI / build Tauri Windows : `.github/` absent, `git remote -v` vide, référence orpheline `build-desktop.yml` (`scripts/build-tauri-prep.sh` l.3), `cargo`/`rustc` absents → **réserve nommée** (MD-1) + questions au propriétaire (pipeline externe ? URL de run ?) · preuve attendue : sorties des commandes + section « Réserve P2 » · **réalisé (« go », 2026-09-18) : réserve P2 consignée, 3 questions au propriétaire (preuves.md § T3)**

Dépendances : aucune.

## Groupe B — Tests & qualité

- [x] T4 — `bun run test:run` : 0 échec (base 63 fichiers / 1452) ; `ai-types.test.ts` ciblé vert ; correctif `e6eeb82` vérifié présent en HEAD · preuve attendue : sortie vitest ciblée + `git log` du fichier · **réalisé (« go », 2026-09-18 14:09) : 63/1452 verts, ai-types 39/39 verts, correctif e6eeb82 en HEAD**
- [x] T5 — `bun run lint` (= `eslint .`, dépôt entier) : 0 erreur · preuve attendue : sortie + code de retour · **réalisé (« go », 2026-09-18) : exit 0, 0 erreur / 230 warnings non bloquants qualifiés (no-explicit-any 129, no-unused-vars 39, no-non-null-assertion 35, no-console 17, exhaustive-deps 5, no-img-element 3)**
- [x] T6 — Inventaire couverture routes API : 84 `route.ts`, 47 avec test, **37 sans** — liste complète classée critique / non-critique (MD-5 : inventaire seul, aucune correction) · preuve attendue : tableau dans `preuves.md` avec la commande productrice · **réalisé (« go », 2026-09-18) : 17 réseau/IA + 18 mutation + 2 lecture/IO ; constat arxiv/search ligne rouge sans test ; recommandation consignée**

Dépendances : aucune.

## Groupe C — Schéma & données

- [x] T7 — Drift schéma/base : `bunx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-url file:db/custom.db` puis idem `db/urbanisme-test.db` (lecture seule, R1) — verdict « aucun drift » ou liste des écarts ; constat « aucune migration versionnée » · preuve attendue : sorties des deux diffs · **réalisé (« go », 2026-09-18 14:45) : custom.db = zéro drift ; urbanisme-test.db = DRIFT (4 tables manquantes : Experiment, ExperimentRun, SavedSearch, SavedSearchResult + 6 index) ; aucune migration versionnée ; ré-synchro = question recette**
- [x] T8 — Audit `db:push --accept-data-loss` : cartographie complète des occurrences (`package.json` **l.12 réel** (mandat l.14) ; `.zscripts/database-runtime-build.sh` **l.24 réel** (mandat l.27) appelé par `.zscripts/build.sh` l.146 = **automatique au build**, sur la copie artefact uniquement, jamais sur la base source ; test de non-régression `tests/database-runtime-build.sh`) + caractérisation du risque (base propriétaire copiée dans l'artefact puis synchronisée avec accept-data-loss) · preuve attendue : extraits de fichiers + arbre d'appel + lecture du script de test · **réalisé (« go », 2026-09-18 14:46) : chaîne prouvée + test exécuté EXIT=0 — le push automatique ne frappe que la copie artefact, preuve par mock**

Dépendances : aucune.

## Groupe D — Secrets & configuration

- [x] T9 — Scan secrets HEAD : grep patterns (api[_-]?key, secret, token, sk-, bearer, littéraux ≥ 20 car.) sur le dépôt hors node_modules ; constat clé OpenAlex `src-tauri/src/lib.rs` l.221 · preuve attendue : commande + hits commentés · **réalisé (« go », 2026-09-18 14:53) : 1 seul secret réel (l.221 confirmé) ; hardcoded-keys.ts = env-only sain ; custom.db saine (LicenseKey 0 ligne)**
- [x] T10 — Scan historique git : `git log -p --all` filtré sur les mêmes patterns ; verdict « purgée / jamais purgée » (clé introduite au commit externe `1359333`) · preuve attendue : commandes + hits · **réalisé (« go », 2026-09-18 14:56) : JAMAIS PURGÉE — clé dans tous les objets depuis 1359333 jusqu'à HEAD ; mon commit dossier 2a8a4e3 cite aussi la valeur (consigné) ; remédiation = rotation (C-D2) ; autres patterns = 0**
- [x] T11 — Scan artefacts de build locaux (`dist-tauri/`, `.next/`, `build/` si présents, avant nettoyage R4) : clé OpenAlex + patterns · preuve attendue : sorties · **réalisé (« go », 2026-09-18 14:57) : dist-tauri 8 Ko propre ; .next 628 Mo = 1 résidu cache dev turbopack (pas artefact prod) ; build/ inexistant**
- [x] T12 — Inventaire config : 35 `process.env.*` lues par `src/` vs `.env` (1 var) vs `.env.example` (absent) ; scan frais Mendeley OAuth + liens plateformes de piratage (sci-hub, libgen, z-lib, arab-sci…) sur HEAD + historique + artefacts ; constat « rapport référencé introuvable » (MD-2) · preuve attendue : listes + sorties · **réalisé (« go », 2026-09-18 15:00) : 35 confirmées ; .env.example absent ; scan piratage NÉGATIF sur les 4 canaux ; zéro OAuth Mendeley ; MD-2 confirmé — rapport externe, seul le propriétaire peut le fournir**
- [x] T13 — **[CORRECTION CANDIDATE C-D1 — feu vert]** Créer `.env.example` à partir de l'inventaire (placeholders `your-key-here`, aucune valeur réelle, variables groupées par usage) · preuve attendue : diff complet + lint/build inchangés · **réalisé (délégation spécialiste, 2026-09-18 15:29) : créé — 32 vars groupées, correspondance prouvée (35 − 4 runtime documentaires + DATABASE_URL), lint 0 erreur**
- [x] T14 — **[CORRECTION CANDIDATE C-D2 — décision du propriétaire]** Clé OpenAlex `lib.rs` l.221 : exécuter l'option retenue — (a) env-only, (b) assumée documentée, (c) variable de build · preuve attendue : diff + grep post-modification + réserves consignées · **réalisé (délégation spécialiste, 2026-09-18 15:31) : OPTION (a) ENV-ONLY — valeur par défaut vidée + commentaire + doc EXPLOITATION-SERVEUR.md §3 ; grep post = 0 occurrence dans le code ; réserves : compilation Rust non vérifiable ici (R-CI), rotation de la clé = action propriétaire**

Dépendances : aucune (T13/T14 exécutées seulement après feu vert explicite à la recette du groupe).

## Groupe E — Fragilités connues (statut + preuve de chacune)

- [x] T15 — **A.2 OpenAlex quota anonyme** : statut corrigé / contourné / ouvert · preuve attendue : `academic-fallback.ts` l.3-4 + `openalex.test.ts` vert + (si le réseau le permet) observation 429 → repli · **réalisé (« go », 2026-09-18 15:05) : CONTOURNÉ — bascule CrossRef+HAL branchée (pipeline l.446-476, 806) ; OpenAlex 429 et CrossRef 200 OBSERVÉS en direct ; openalex.test.ts 17/17 ; réserve : pas de test dédié au fallback**
- [x] T16 — **A.3 maxTokens deep-research** : statut · preuve attendue : `deep-research-pipeline.ts` l.121-155 + l.714 + test unitaire associé ou rapport A.3 (24 524 car., Sources 16) · **réalisé (« go », 2026-09-18 15:07) : CORRIGÉ — isLikelyTruncated l.100 + continueIfTruncated l.121-158 (max 2 passes) branché aux 2 sites (l.837, l.915), maxTokens 12000 l.714 ; suite recherche 39/39 ; réserve : pas de test unitaire dédié, troncature réelle non reproductible en sandbox**
- [x] T17 — **A.7 Overpass** : statut · preuve attendue : `osm-infra.ts` l.1461-1490 (3 tentatives, 25/35/45 s, backoff) + test ou log réel · **réalisé (« go », 2026-09-18 15:09) : CORRIGÉ AU NIVEAU CODE — l.1466-1468 (3 tentatives, 25/35/45 s, backoff 2/5 s) + alternance endpoints + réécriture [timeout:NN] ; réserve MD-1 NOMMÉE : endpoints Overpass inatteignables depuis le sandbox (HTTP 000 ×2) — preuve d'exécution réelle = log `[Overpass] Reprise` à produire par le propriétaire**
- [x] T18 — **A.8/A.10 nohup/process** : statut · preuve attendue : `queue.ts`/`worker.ts`/`instrumentation.ts` + `dev.log` `[job-worker]` + `EXPLOITATION-SERVEUR.md` l.14 + question MD-4 (supervision de la cible) · **réalisé (« go », 2026-09-18 15:10) : CORRIGÉ — worker IN-PROCESS (instrumentation.ts), file persistante + requeueStaleJobs l.95, zéro nohup/setsid en code, dev.log « [job-worker] Démarrage » en direct ; MD-4 : supervision de la cible de prod = question ouverte**
- [x] T19 — **A.9 timeout directeur-chat** : statut · preuve attendue : `route.ts` l.14-57 (borné 5-180 s, défaut 150 s) + `route.test.ts` vert + question MD-4 (limite proxy/hébergeur cible) · **réalisé (« go », 2026-09-18 15:11) : CORRIGÉ — défaut 150 s, bornes zod 5-180 s, relance auto resserrée, route.test.ts 18/18 ; MD-4 : limite timeout du proxy/hébergeur cible = question ouverte**

Dépendances : aucune.

## Groupe F — Desktop (Tauri)

- [x] T20 — Capabilities vs usage réel : grep `plugin:shell` / invoke shell dans `src/` ; verdict par permission (`core:default`, `shell:allow-open`, `shell:allow-execute` — suspect car `lib.rs` utilise `std::process::Command` natif) ; CSP `null` (`tauri.conf.json` l.27) ; ressources `../db/*` = DB propriétaire embarquée dans l'installeur — **constats + recommandations, aucune modification** (MD-5) · preuve attendue : greps + extraits de config + section recommandations · **réalisé (« go », 2026-09-18 15:18) : dépôt en Tauri v2 (mandat disait v1.10.7 — consigné) ; 0 import @tauri-apps dans src/ → allow-open = sur-privilège, allow-execute = sur-privilège critique ; CSP null confirmé ; DB propriétaire embarquée dans chaque installeur ; powershell = extraction bundle légitime ; 3 recommandations consignées**

Dépendances : aucune.

---

Dépendances globales : **6 groupes indépendants** (audit en lecture seule ; seules T13/T14 écrivent, après feu vert). Ordre conseillé A → B → C → D → E → F. Un groupe à la fois : annonce → exécution → preuves → commit → compte rendu → recette bloquante.

---

**Verdict final (Étape 6)** : à compléter à la convergence — PRÊT / PRÊT AVEC RÉSERVES (lister) / NON PRÊT (lister les bloquants), avec pour chaque réserve : la preuve manquante exacte et l'acteur qui peut la produire.


---

## Verdict final (Étape 6 — 2026-09-18, 15:25)

### **PRÊT AVEC RÉSERVES**

Fondations de production **vérifiées par preuve exécutée** : build vert (après T1b — 2 erreurs TS latentes révélées et corrigées par l'audit même, commit `e17e233`), suite 63 fichiers / 1 452 tests verte, lint 0 erreur, arbre git propre (0 fichier 755 hors .zscripts), base propriétaire `custom.db` **zéro drift**, chaîne automatique `db:push --accept-data-loss` **prouvée par test** comme ne frappant jamais la base source, worker in-process vivant (log direct), timeout directeur-chat borné et testé (18/18), bascule OpenAlex→CrossRef/HAL **observée en direct** (429 réel). Aucun bloquant de niveau NON PRÊT.

### Réserves (preuve manquante exacte + acteur)

> **Mise à jour après délégation (15:38)** — réserves LEVÉES par exécution prouvée : R-ENV (`.env.example` créé, T13) · R-DRIFT (`urbanisme-test.db` resynchronisée, drift zéro, données intactes) · R-KEY (option a env-only exécutée, T14 — plus de clé dans le binaire ; reste la rotation chez OpenAlex, action externe).

1. **R-CI** — Build Tauri Windows / pipeline CI **non prouvé** (impossible en sandbox) : aucun `.github/`, aucun remote, cargo absent — désormais renforcée par T14 : le binaire doit être reconstruit pour embarquer l'état sans clé. Preuve manquante : URL d'un run CI vert du workflow `build-desktop.yml` ou build NSIS local Windows avec lancement de l'exe. **Acteur : propriétaire** (créer/versionner le pipeline = chantier suivant recommandé, nouveau cycle SDD).
2. **R-KEY-ROTATION** — (réduite par T14 : la clé n'est plus dans le code ni dans les futurs binaires) la valeur historique reste dans l'historique git (jamais purgée depuis `1359333`). Révoquer/renouveler la clé chez OpenAlex si un quota dédié est utilisé. **Acteur : propriétaire** (action externe).
3. **R-MD4** — Deux questions sans réponse : supervision de la cible de production (tini/systemd ?) ; limite de timeout du proxy/hébergeur cible (si < 150 s, la valeur nominale A.9 est coupée en amont). **Acteur : propriétaire**.
4. **R-OVERPASS** — Correction A.7 prouvée au niveau code uniquement : endpoints Overpass inatteignables depuis le sandbox (HTTP 000 ×2 ; retest 15:36 : HTTP 000). Preuve manquante : un log `[Overpass] Reprise n/2` issu d'une recherche réelle au poste. **Acteur : propriétaire**.
7. **R-REPORT (MD-2)** — Le « rapport » Mendeley OAuth + liens piratage visé par le mandat est introuvable dans le dépôt ; scans frais (HEAD + historique + artefacts + base) **négatifs**. S'il existe, le propriétaire le fournit pour contre-examen. **Acteur : propriétaire**.

**Verdict inchangé : PRÊT AVEC RÉSERVES** — 3 réserves restantes (R-CI, R-OVERPASS, R-MD4 + action externe rotation de clé) ; 3 réserves levées par exécution prouvée (T13, T14, ré-synchro `urbanisme-test.db`).

### Recommandations (hors périmètre, sans valeur bloquante)

37 routes API sans test (dont `arxiv/search`, ligne rouge) · 230 warnings lint (no-explicit-any 129 en tête) · retirer `shell:allow-execute`/`shell:allow-open` + CSP explicite · décision produit sur la DB embarquée dans l'installeur · renommer `hardcoded-keys.ts` · binaires versionnés dans git · ré-synchroniser les numéros de ligne du mandat (l.12 réel vs l.14, l.24 vs l.27).

### Constats d'exécution

- L'audit a produit **une correction nécessaire** : T1b (`e17e233`) — 2 erreurs TypeScript bloquant `next build`, révélées par T1, corrigées, build revérifié vert.
- Chiffre du mandat ajusté sur preuve : **Tauri v2** (pas v1.10.7) ; 419 fichiers (pas 410, MD-6) ; 35 vars confirmées.
- Les 6 groupes ont été exécutés en séquence A → B → C → D → E → F, un commit documentaire par groupe (`c2f0a7a`, `990f33a`, `6dfa1b7`, `34afb88`, `8cc708c`, + F).
- Lignes rouges intactes : aucun commit n'a touché `theses-en-ligne/search/route.ts`, `arxiv/search/route.ts`, `app-sidebar.tsx` (seule écriture code : T1b, hors lignes rouges).
