# Plan — prod-readiness-audit

Date : 2026-09-18 · Prérequis : `spec.md` validée. Plan bâti sur lecture du dépôt réel (chemins + lignes), pas sur le mandat seul. Méthode : chaque point = commande(s) réelle(s) → sortie horodatée collée dans `preuves.md`.

## 1. État réel constaté (investigation Étape 3, 2026-09-18)

### Build & CI
- `package.json` l.11 : `build` = `prisma generate && next build` ; l.15 : `lint` = `eslint .` (= « eslint sur l'ensemble du dépôt »).
- **Aucun `.github/`** dans le dépôt ; `git remote -v` **vide** — aucun pipeline CI versionné, aucun remote.
- `scripts/build-tauri-prep.sh` l.3 référence `.github/workflows/build-desktop.yml` (tauri-action beforeBuildCommand) — **fichier absent** : référence orpheline au pipeline.
- `src-tauri/` complet : `tauri.conf.json` (cible `nsis`, v1.10.7, ressources `../db/*` + `standalone.zip` + `node.exe` l.42-46, CSP `null` l.27) ; `capabilities/default.json` (3 permissions, l.5-9) ; `src/lib.rs` (serveur Next embarqué `127.0.0.1:14325`, extraction standalone.zip via PowerShell, template DB copié vers le data dir utilisateur, `std::mem::forget(child)` l.271).
- Environnement sandbox : `cargo`/`rustc` **absents** → même `cargo check` impossible ; cible Windows impossible sous Linux.
- Arbre : branche `main`, `git status` propre ; `git ls-files -s | rg '^100755'` hors `.zscripts` = **vide** ; commit de normalisation `0348dcb` = **419 fichiers changed** (MD-6 : le mandat disait 410).
- Hygiène constatée : `upload/LR.rar`, `upload/res.pdf`, `db/custom.db`, `db/urbanisme-test.db` **versionnés dans git** (binaires).

### Tests & qualité
- Suite : **63 fichiers / 1452 tests verts** (relancée le 2026-09-18 12:21, 15,08 s).
- `ai-types.test.ts` : correctif `e6eeb82` (18 → 20) présent en HEAD — vérifié par `git log --oneline --all -3 -- src/lib/ai/ai-types.test.ts`.
- Couverture routes API : **84 `route.ts`, 47 avec `route.test.ts`, 37 sans** — dont `api/arxiv/search` (ligne rouge, inventaire seul), 4 routes `api/veille/*` (logique métier couverte par `check-core.test.ts`, 24 tests), `api/jobs/*`, `api/deep-research`, `api/export-docx`, `api/theses/*`, `api/apinex/*`, `api/experiments/*`. Liste complète à coller dans preuves.md (MD-5 : inventaire, pas de correction).

### Schéma & données
- `prisma/` = `schema.prisma` seul : **aucune migration versionnée** (workflow `db:push` assumé, cf. CONSTITUTION.md).
- `db:push --accept-data-loss` : `package.json` l.14 (script manuel) **et** `.zscripts/database-runtime-build.sh` l.27 (`DATABASE_URL=file:$TARGET_DB_PATH bun run db:push`) appelé depuis `.zscripts/build.sh` l.146 → **exécuté automatiquement au build**, mais sur la **copie** de `db/custom.db` dans l'artefact (`cp -a db/ → build/db/` puis sync du schéma), jamais sur la base source ; test de non-régression : `tests/database-runtime-build.sh`.
- Drift : exécutable en sandbox — `bunx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-url file:db/custom.db` (lecture seule) ; idem `db/urbanisme-test.db`.

### Secrets & configuration
- **Clé API OpenAlex en dur : `src-tauri/src/lib.rs` l.221** — `("OPENALEX_API_KEY", "qsdRrHIu…(masqué — rotation 2026-09-19)")` injectée dans le serveur embarqué si l'env ne la définit pas (bloc l.219-223) ; introduite au commit externe `1359333` (import d'origine, `git log -S`), **toujours en HEAD** — livrée dans chaque installeur NSIS.
- `src/lib/ai/hardcoded-keys.ts` : nom trompeur mais lit uniquement `process.env` (aucune clé en dur).
- `.env` : 1 seule variable (`DATABASE_URL`) ; **`.env.example` absent** ; **35 variables** `process.env.*` lues par `src/` (inventaire obtenu, cf. § 2 P12).
- Rapport « Mendeley OAuth + plateformes de piratage » : **introuvable** (dépôt + `upload/`) — scan frais requis (MD-2).

### Fragilités connues — ancrage code (statut à prouver par groupe E)
1. **A.2 OpenAlex quota anonyme** — contournement par repli : `src/lib/research/academic-fallback.ts` l.3-4 (429/budget → CrossRef + HAL, triangulation DOI) ; `src/lib/research/openalex.test.ts` présent. Quota lui-même inchangé (pool anonyme).
2. **A.3 maxTokens deep-research** — corrigé : `src/lib/research/deep-research-pipeline.ts` l.121-155 (passes de continuation, max 2) et l.714 (`maxTokens: 12_000`) ; preuve réelle consignée dans le rapport A.1-A.13 (rapport 24 524 car., Sources 16 entrées).
3. **A.7 Overpass sans retry** — corrigé : `src/lib/osm-infra.ts` l.1461-1490 (`OVERPASS_ATTEMPTS = 3`, timeouts progressifs 25/35/45 s, backoff 2/5 s, alternance d'endpoints).
4. **A.8/A.10 nohup non persistant** — corrigé côté app : file `Job` persistante + worker reprend les orphelins (`src/lib/jobs/queue.ts`, `src/lib/jobs/worker.ts`, `src/instrumentation.ts`) ; cause racine **externe** documentée (`docs/EXPLOITATION-SERVEUR.md` l.14 : supervision du sandbox) ; prod desktop = node.exe enfant du process Tauri (`lib.rs` l.271) → question MD-4 : la cible a-t-elle une supervision comparable ?
5. **A.9 timeout ~320 s directeur-chat** — corrigé : `src/app/api/directeur-chat/route.ts` l.14-57 (timeout explicite borné 5-180 s, défaut 150 s, relance unique à prompt resserré) ; le 320 s venait de la voie SDK sans timeout → question MD-4 : limite de timeout du proxy/hébergeur cible vs 180 s max ?

### Desktop
- `capabilities/default.json` : `core:default`, `shell:allow-open`, `shell:allow-execute` — or `lib.rs` lance les processus par `std::process::Command` (Rust natif, hors plugin shell) : `shell:allow-execute` **semble non justifié** (à confirmer par grep d'usage `plugin:shell` dans `src/`).
- CSP `null` (`tauri.conf.json` l.27) — note sécurité pour un webview servant l'app complète.
- Ressources `../db/*` (l.42-46) : la DB `db/custom.db` (base du propriétaire) **est embarquée dans l'installeur** comme template — donnée personnelle potentiellement distribuée. Constat, décision au propriétaire.

## 2. Points à couvrir et preuves attendues

| # | Axe | Point | Preuve attendue (commande → sortie dans preuves.md) |
|---|-----|-------|------------------------------------------------------|
| P1 | Build | `bun run build` succès, warnings consignés (MD-3) | sortie build horodatée |
| P2 | Build | Tauri Windows + CI de bout en bout, .exe lancé | **impossible ici (MD-1)** : constats `.github` absent, remote vide, `build-desktop.yml` orphelin (l.3), cargo absent → réserve + questions propriétaire |
| P3 | Build | git propre main, 755 hors `.zscripts/*.sh` = 0, commit modes | `git status`, `git ls-files -s`, `git show --stat 0348dcb` (419) |
| P4 | Tests | suite complète 0 échec, `ai-types.test.ts` inclus | `bun run test:run` + test ciblé + `git log` correctif `e6eeb82` |
| P5 | Tests | lint dépôt entier 0 erreur | `bun run lint` |
| P6 | Tests | inventaire couverture routes API | tableau 84/47/37 classé critique/non-critique |
| P7 | Schéma | drift schéma/bases | `prisma migrate diff` ×2 (custom.db, urbanisme-test.db) + constat « zéro migration » |
| P8 | Schéma | `db:push --accept-data-loss` nulle part en automatique **sauf preuve contraire** | extraits package.json l.14, `.zscripts/database-runtime-build.sh` l.27, `build.sh` l.146, test associé → caractérisation |
| P9 | Secrets | scan HEAD | grep patterns (api[_-]?key/secret/token/sk-/bearer + littéraux longs) hors node_modules ; constat l.221 |
| P10 | Secrets | scan historique | `git log -p --all` filtré ; clé introduite `1359333`, jamais purgée |
| P11 | Secrets | artefacts de build locaux | grep clé + patterns dans `dist-tauri/`, `.next/`, `build/` (si présents) |
| P12 | Secrets | `.env.example` vs code ; Mendeley/piratage | inventaire 35 vars ; scan frais sci-hub/libgen/z-lib/arab-sci + OAuth Mendeley ; constat rapport introuvable (MD-2) |
| P13-P17 | Fragilités | A.2, A.3, A.7, A.8/A.10, A.9 | statut corrigé/contourné/ouvert + preuve (ancrage § 1 + tests ciblés, dev.log `[job-worker]`, tests route) + questions MD-4 |
| P18 | Desktop | capabilities minimales | grep usage plugin shell dans `src/` ; verdict par permission ; CSP ; DB embarquée |

## 3. Corrections candidates (tâches dédiées, feu vert à la recette du groupe D)

- **C-D1 — `.env.example`** : créer à partir de l'inventaire des 35 variables (placeholders, aucune valeur réelle). Découle directement du point « `.env.example` à jour » du mandat.
- **C-D2 — Clé OpenAlex `lib.rs` l.221** : décision du propriétaire — (a) retirer du code, clé uniquement par env (le repli A.2 absorbe son absence) ; (b) garder assumée + documentée (clé de pool, à traiter comme publique) ; (c) injecter au build via variable. Toute option touche `src-tauri/` dont le build Windows n'est pas prouvable ici → réserves associées consignées.
- Tout le reste = réserves/recommandations, sans modification (règle du mandat).

## 4. Alternatives écartées

- Installer Rust et tenter un build NSIS cross-compilé : toolchain Windows + NSIS + signature hors de portée, preuve non équivalente au pipeline réel → réserve assumée (MD-1).
- Purger la clé de l'historique git (filter-repo / BFG) : réécriture d'historique destructive, non demandée → recommandation dans le rapport seulement.
- Corriger les 37 routes sans test : explicitement exclu (« inventorie »).

## 5. Risques

- **R1** — `prisma migrate diff` contre les bases : lecture seule par construction (compare, n'écrit pas) ; à confirmer avant exécution, sinon repli `db pull --print` en base jetable temporaire.
- **R2** — scan historique volumineux : patterns précis + sortie limitée/triée.
- **R3** — réserves non levables ici (CI Windows, clé en dur, cible de déploiement) : le verdict ne pourra pas être un « PRÊT » sec sans les réponses du propriétaire — assumé.
- **R4** — le build web consomme du disque (`.next/`) : nettoyer après preuve si nécessaire, sans toucher aux artefacts nécessaires au scan P11 (scanner avant nettoyage).

## 6. Impact fichiers

- Documents : `specs/prod-readiness-audit/{spec,plan,tasks,preuves}.md`, `worklog.md`, `FICHE_SYNTHESE.md`.
- Code : **aucun** par défaut. Sauf corrections candidates recettées : C-D1 (nouveau `.env.example`) ; C-D2 (si validée : `src-tauri/src/lib.rs` l.219-223).
- Lignes rouges intactes : `theses-en-ligne/search/route.ts`, `arxiv/search/route.ts`, `app-sidebar.tsx`.
