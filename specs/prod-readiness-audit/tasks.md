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

- [ ] T7 — Drift schéma/base : `bunx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-url file:db/custom.db` puis idem `db/urbanisme-test.db` (lecture seule, R1) — verdict « aucun drift » ou liste des écarts ; constat « aucune migration versionnée » · preuve attendue : sorties des deux diffs
- [ ] T8 — Audit `db:push --accept-data-loss` : cartographie complète des occurrences (`package.json` l.14 manuel ; `.zscripts/database-runtime-build.sh` l.27 appelé par `.zscripts/build.sh` l.146 = **automatique au build**, sur la copie artefact uniquement, jamais sur la base source ; test de non-régression `tests/database-runtime-build.sh`) + caractérisation du risque (base propriétaire copiée dans l'artefact puis synchronisée avec accept-data-loss) · preuve attendue : extraits de fichiers + arbre d'appel + lecture du script de test

Dépendances : aucune.

## Groupe D — Secrets & configuration

- [ ] T9 — Scan secrets HEAD : grep patterns (api[_-]?key, secret, token, sk-, bearer, littéraux ≥ 20 car.) sur le dépôt hors node_modules ; constat clé OpenAlex `src-tauri/src/lib.rs` l.221 · preuve attendue : commande + hits commentés
- [ ] T10 — Scan historique git : `git log -p --all` filtré sur les mêmes patterns ; verdict « purgée / jamais purgée » (clé introduite au commit externe `1359333`) · preuve attendue : commandes + hits
- [ ] T11 — Scan artefacts de build locaux (`dist-tauri/`, `.next/`, `build/` si présents, avant nettoyage R4) : clé OpenAlex + patterns · preuve attendue : sorties
- [ ] T12 — Inventaire config : 35 `process.env.*` lues par `src/` vs `.env` (1 var) vs `.env.example` (absent) ; scan frais Mendeley OAuth + liens plateformes de piratage (sci-hub, libgen, z-lib, arab-sci…) sur HEAD + historique + artefacts ; constat « rapport référencé introuvable » (MD-2) · preuve attendue : listes + sorties
- [ ] T13 — **[CORRECTION CANDIDATE C-D1 — feu vert]** Créer `.env.example` à partir de l'inventaire (placeholders `your-key-here`, aucune valeur réelle, variables groupées par usage) · preuve attendue : diff complet + lint/build inchangés
- [ ] T14 — **[CORRECTION CANDIDATE C-D2 — décision du propriétaire]** Clé OpenAlex `lib.rs` l.221 : exécuter l'option retenue — (a) env-only, (b) assumée documentée, (c) variable de build · preuve attendue : diff + grep post-modification + réserves consignées

Dépendances : aucune (T13/T14 exécutées seulement après feu vert explicite à la recette du groupe).

## Groupe E — Fragilités connues (statut + preuve de chacune)

- [ ] T15 — **A.2 OpenAlex quota anonyme** : statut corrigé / contourné / ouvert · preuve attendue : `academic-fallback.ts` l.3-4 + `openalex.test.ts` vert + (si le réseau le permet) observation 429 → repli
- [ ] T16 — **A.3 maxTokens deep-research** : statut · preuve attendue : `deep-research-pipeline.ts` l.121-155 + l.714 + test unitaire associé ou rapport A.3 (24 524 car., Sources 16)
- [ ] T17 — **A.7 Overpass** : statut · preuve attendue : `osm-infra.ts` l.1461-1490 (3 tentatives, 25/35/45 s, backoff) + test ou log réel
- [ ] T18 — **A.8/A.10 nohup/process** : statut · preuve attendue : `queue.ts`/`worker.ts`/`instrumentation.ts` + `dev.log` `[job-worker]` + `EXPLOITATION-SERVEUR.md` l.14 + question MD-4 (supervision de la cible)
- [ ] T19 — **A.9 timeout directeur-chat** : statut · preuve attendue : `route.ts` l.14-57 (borné 5-180 s, défaut 150 s) + `route.test.ts` vert + question MD-4 (limite proxy/hébergeur cible)

Dépendances : aucune.

## Groupe F — Desktop (Tauri)

- [ ] T20 — Capabilities vs usage réel : grep `plugin:shell` / invoke shell dans `src/` ; verdict par permission (`core:default`, `shell:allow-open`, `shell:allow-execute` — suspect car `lib.rs` utilise `std::process::Command` natif) ; CSP `null` (`tauri.conf.json` l.27) ; ressources `../db/*` = DB propriétaire embarquée dans l'installeur — **constats + recommandations, aucune modification** (MD-5) · preuve attendue : greps + extraits de config + section recommandations

Dépendances : aucune.

---

Dépendances globales : **6 groupes indépendants** (audit en lecture seule ; seules T13/T14 écrivent, après feu vert). Ordre conseillé A → B → C → D → E → F. Un groupe à la fois : annonce → exécution → preuves → commit → compte rendu → recette bloquante.

---

**Verdict final (Étape 6)** : à compléter à la convergence — PRÊT / PRÊT AVEC RÉSERVES (lister) / NON PRÊT (lister les bloquants), avec pour chaque réserve : la preuve manquante exacte et l'acteur qui peut la produire.
