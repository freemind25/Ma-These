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

## Suivi du 2026-09-18 (18:47-18:58) — build v1.10.8 déclenché par tag (ordre du propriétaire)

Ordre : « démarrez le tag v1.10.8 git push origin v1.10.8 ». Le workflow produit la version
lue dans `tauri.conf.json` — un tag v1.10.8 sans bump aurait produit un installeur 1.10.7
mal étiqueté et aurait percuté le draft existant. Décision de spécialiste (Article 2, avec
amendement annoncé) : bump **3 manifests × 1 ligne** (`tauri.conf.json` l.4, `package.json`
l.3, `Cargo.toml` l.3) ; `Cargo.lock` laissé tel quel (auto-corrigé par cargo au build CI —
aucun `--locked` dans le workflow).

```
commit f0e1a4b  chore(release): bump 1.10.7 -> 1.10.8 (3 fichiers, +3/−3)
tag annoté v1.10.8 → push main (058b80c..f0e1a4b) + push tag (* [new tag] v1.10.8)
déclenchement AUTOMATIQUE : run 35382304899 (event=push, head_branch=v1.10.8)
```

### Run 35382304899 — SUCCESS (9 min 13 s, 18:48:17Z → 18:57:30Z — rust-cache efficace)

URL : https://github.com/freemind25/ThesisFrame/actions/runs/35382304899

```
10/10 steps verts (garde-fou drift inclus — « No difference detected » 18:50:17)
18:51:40  ✓ Compiled successfully in 42s           ← next build standalone
18:56:07  Running makensis to produce …\nsis\Ma Thèse_1.10.8_x64-setup.exe
18:57:16  Finished 1 bundle at: …
```

Livrables constatés via API :

```
artifact  : windows-installer — 73.1 MB (expire 2026-12-17)
releases  : « Ma Thèse v1.10.8 » — draft, asset Ma.These_1.10.8_x64-setup.exe (73.1 MB)
            « Ma Thèse v1.10.7 » — draft, asset Ma.These_1.10.7_x64-setup.exe (73.1 MB)
```

Le cycle **tag → build → release** est prouvé de bout en bout : le trigger `push.tags v*`
est opérationnel, en plus de `workflow_dispatch` (prouvé au run 35373767136).

## Suivi du 2026-09-19 (05:58-06:05) — PUBLICATION des releases v1.10.7 + v1.10.8 (ordre du propriétaire)

Ordre : « publish the draft release ». Publication par API (`PATCH /releases/{id}`, corps
`{"draft":false}`), clé en en-tête uniquement, jamais dans le dépôt :

```
05:58:20  tags avant publication : v1.10.8 → HTTP 200 (objet annoté 3f70bc29e) ; v1.10.7 → HTTP 404
05:58:22  PATCH release 391660798 → v1.10.7 PUBLISHED (published_at 2026-09-19T05:58:22Z)
          → tag v1.10.7 créé à la publication → 058b80c (commit construit par le run 35373767136)
05:58:23  PATCH release 391715732 → v1.10.8 PUBLISHED (published_at 2026-09-19T05:58:23Z)
          → rattachée au tag v1.10.8 existant (→ f0e1a4b)
05:59:05  relecture GET /releases : 2/2 PUBLISHED, 0 draft restant
```

Livrables publics (repo privé — accès propriétaire/collaborateurs) :

```
v1.10.8 : https://github.com/freemind25/ThesisFrame/releases/tag/v1.10.8
          asset Ma.These_1.10.8_x64-setup.exe — 73.1 MB
v1.10.7 : https://github.com/freemind25/ThesisFrame/releases/tag/v1.10.7
          asset Ma.These_1.10.7_x64-setup.exe — 73.1 MB
```

### Incident d'environnement consigné (transparence)

Le sandbox local a été restauré sur un instantané ancien et divergent (HEAD `995916c`,
époque « activation SDD », aucun remote) alors que le remote contenait déjà toute la chaîne
v1.10.8 (bump `f0e1a4b`, run 35382304899 SUCCESS, preuves `e3f2f93`). Réalignement sans perte :
sauvegarde du worklog local (249 l.) → `git remote add origin` + `fetch` (askpass éphémère) →
contrôle « zéro entrée locale absente du remote » (worklog remote 616 l. = sur-ensemble) →
`git reset --hard origin/main` (e3f2f93). Lignes rouges vérifiées identiques dans les deux
lignées (diff `53ac660..995916c` : 0 changement sur les 3 fichiers). `upload/LR.rar` et
`upload/res.pdf` (fichiers du propriétaire) laissés modifiés, non commités.
