# Preuves — build-desktop-pipeline (2026-09-18, 15:42-15:52)

## T1 — Workflow créé et versionné : ✓

```
.github/workflows/build-desktop.yml — 102 lignes, YAML VALIDE (parsé yaml.safe_load)
name: build-desktop · job build-windows · runs-on: windows-latest · permissions: contents: write
Déclencheurs : push.tags v* + workflow_dispatch
8 steps : Checkout@v4 · setup-bun@v2 · bun install · Garde-fou drift (lecture seule) ·
          rust-toolchain@stable (x86_64-pc-windows-msvc) · rust-cache@v2 (src-tauri) ·
          tauri-action@v0 (tauriScript: bunx tauri, args --target x86_64-pc-windows-msvc,
          release draft v__VERSION__) · upload-artifact@v4 (nsis/*.exe, if-no-files-found: error)
```

## T2 — Contrats croisés vérifiés par lecture : ✓

```
tauri.conf.json l.8  : "beforeBuildCommand": "bash scripts/build-tauri-prep.sh"  ← tauri-action l'exécute
tauri.conf.json l.10 : "frontendDist": "../dist-tauri"                            ← placeholder versionné (groupe F : 8 Ko, 1 fichier)
tauri.conf.json l.42-46 : resources = ../db/* + ../build/tauri-bundle/standalone.zip + node.exe
                       ← exactement les 2 produits du script de préparation (l.48/l.50 zip ; l.60-71 node.exe)
next.config.ts l.4   : output: "standalone"                                       ← requis par le script l.30-31
package.json l.8     : "build": "prisma generate && next build"                   ← appelé par le script l.22
scripts/build-tauri-prep.sh l.45-48 : branche RUNNER_OS=Windows (PowerShell Compress-Archive) ← runner CI = windows
```

## T3 — Garde-fou drift prouvé localement : ✓ (2 mesures opposées)

```
bunx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-url file:db/custom.db --exit-code
  → « No difference detected. » EXIT=0        (base synchrone → step vert)
copie de drift fabriquée (DROP TABLE Experiment sur copie temporaire, base réelle intacte) :
bunx prisma migrate diff … --to-url file:/tmp/drift-test.db --exit-code
  → « [-] Removed tables - Experiment » EXIT=2 (drift → step ROUGE via set -e)
```
Lecture seule prouvée au cycle prod-readiness-audit (T7) : le garde-fou ne modifie aucune base. La CI échoue AVANT tout build coûteux si un schéma n'a pas été poussé — le défaut exact constaté sur `urbanisme-test.db` pendant l'audit (4 tables en retard) ne peut plus passer inaperçu.

Première mesure de l'audit : DRIFT_EXIT initialement lu « 0 » à cause d'un pipe `| head` (capte le code de head) — re-mesuré proprement : **2**. Consigné pour la discipline de mesure.

## T4 — Verdict : ✓ WORKFLOW PRÊT — run vert = réserve nommée

Preuve manquante exacte : une URL de run GitHub Actions vert du workflow `build-desktop.yml` produisant un artefact `windows-installer` (ou un run en échec dont la cause est externalisée au dépôt). **Acteur : propriétaire** — le sandbox n'a ni remote git, ni cargo, ni Windows ; la chaîne complète hors CI est désormais versionnée et auditable localement (contrats croisés + garde-fou prouvés ici).

**Recette au propriétaire** : (1) pousser le dépôt sur GitHub ; (2) `workflow_dispatch` ou pousser un tag `v1.10.7` ; (3) fournir l'URL du run. Recommandations consignées (hors périmètre) : signature Authenticode de l'installeur ; secret `OPENALEX_API_KEY` à définir côté machines utilisateurs si quota dédié voulu (runtime-only, T14).

## Suivi du 2026-09-18 (16:40-16:55) — R-CI : clé GitHub fournie puis rejetée ; push préparé

Contexte : le propriétaire fournit une clé GitHub « provisoire » pour déléguer le reste de T4
(créer le dépôt distant → pousser → déclencher le run → livrer l'URL verte).

Preuves (aucune valeur de clé consignée, nulle part) :

```
Tentative 1 — curl -H "Authorization: Bearer ***" https://api.github.com/user
  → HTTP 401 {"message":"Bad credentials"}   login: null
Tentative 2 — curl -H "Authorization: Bearer ***" https://api.github.com/rate_limit
  → HTTP 401 {"message":"Bad credentials"}
Tentative 3 — curl -H "Authorization: token ***" https://api.github.com/user
  → HTTP 401 {"message":"Bad credentials"}
Format clé : ghp_ + 36 caractères = 40 (classique, format correct) →
  le jeton n'existe plus côté GitHub (révoquée, expirée ou erreur de copie).
```

Préparation push (mesurée) :

```
git status --porcelain      → vide (arbre propre) ; branche : main ; remote : aucun
git count-objects -vH       → size: 46.36 MiB
plus gros blob historique   → 9.5 MB (db/custom.db) — aucun objet > 100 MiB, pas de LFS requis
git ls-files | zip/exe      → aucun suivi ; db/custom.db + db/urbanisme-test.db suivies
                              (ressources attendues par tauri.conf.json l.42-46)
```

Script de push préparé HORS dépôt : `/home/z/push-thesisframe.sh` (création repo privé
`ThesisFrame` → remote SANS token → push via askpass éphémère `/tmp` mode 700 →
`workflow_dispatch` ref main → URL Actions). La clé ne transitera ni dans un fichier
versionné ni dans `.git/config`.

Correction documentaire (preuve avant affirmation) :
« 102 lignes » était consigné pour le workflow (preuves T1 ci-dessus, worklog, fiche) ;
mesure réelle : `wc -l .github/workflows/build-desktop.yml` → **84** ;
`git show --stat cfa3377` → **84 insertions**. Fiche corrigée dans ce commit ; les
entrées historiques du worklog restent inchangées (journal), la correction est consignée ici.

État de T4 : inchangé — prérequis externe = **une clé GitHub valide**
(classique, scopes `repo` + `workflow`).

## Suivi du 2026-09-18 (17:15-17:35) — R-CI DISSOUTE : RUN VERT OBTENU

2e clé reçue et valide (login `freemind25`, scopes `repo, workflow` — header X-OAuth-Scopes).
Décision de spécialiste (Article 2) : les repos candidats existants (`these-frame`,
`Ma-These`,…) ont des historiques divergents (aucun ancêtre commun avec le dépôt local)
et sont publics — création d'un **nouveau repo privé** plutôt qu'un push forcé destructif
ou une exposition publique de `.env` + ancienne clé OpenAlex (historique).

```
HTTP 201  → repo privé freemind25/ThesisFrame créé
push main → * [new branch] main -> main  (historique complet 46.36 MiB, remote SANS token)
dispatch  → HTTP 204 (workflow_dispatch, ref main, head_sha 058b80c)
```

### Run 35373767136 — SUCCESS (13 min 42 s, 17:20:39Z → 17:34:21Z)

URL : https://github.com/freemind25/ThesisFrame/actions/runs/35373767136

```
job "Windows (NSIS)" : success — 10/10 steps verts :
  Set up job · Checkout · Setup Bun · Install dependencies ·
  Garde-fou (bases synchronisées, lecture seule) · Setup Rust · Cache Rust ·
  Build Tauri (NSIS) + release draft · Upload artefact · Post-complétions
```

Extraits réels des logs du run (zip téléchargé via API, 51 Ko) :

```
17:22:11  No difference detected.                    ← garde-fou custom.db (exit 0)
17:22:11  custom.db : synchrone avec le schéma.
17:22:12  No difference detected.                    ← garde-fou urbanisme-test.db (exit 0)
17:23:02  ✓ Compiled successfully in 26.9s           ← next build standalone (prep [2/6])
17:24:17  standalone.zip: 69M                        ← prep [5/6] (2351 fichiers)
17:24:18  node.exe: 83M                              ← prep [6/6]
17:32:05  Finished `release` profile [optimized] target(s) in 7m 45s
17:33:16  Finished 1 bundle at: …\bundle\nsis\Ma Thèse_1.10.7_x64-setup.exe
17:33:21  Artifact name is valid! … 1 file uploaded  ← windows-installer
```

Livrables constatés via API :

```
artifact  : windows-installer — 73.1 MB (expire 2026-12-17)
release   : « Ma Thèse v1.10.7 » — draft: true — asset Ma.These_1.10.7_x64-setup.exe (73.1 MB)
```

### État final

- **T4 : preuve obtenue** — run vert + artefact + release draft. La réserve **R-CI du cycle
  `prod-readiness-audit` est dissoute** (workflow versionné + run vert prouvé).
- Discipline tenue : la clé n'a été écrite dans aucun fichier versionné ni `.git/config`
  (askpass éphémère `/tmp`, mode 700). Les 2 clés transités par ce chat sont à révoquer ;
  rotation OpenAlex toujours en attente.
- Usage futur : tout tag `v*` (ex. `git tag v1.10.8 && git push origin v1.10.8`) déclenche un
  build NSIS ; `workflow_dispatch` possible depuis l'onglet Actions ; releases en draft à
  publier manuellement.
