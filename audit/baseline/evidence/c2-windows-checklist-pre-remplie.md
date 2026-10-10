# Check-list C2 — Build desktop Windows Tauri + smoke test CSP (pré-remplie)

**Document opérationnel préparé pour exécution par le PROPRIÉTAIRE sur une machine Windows.**
Aucun build Windows n'est exécutable depuis l'environnement de développement du projet (Linux) — c'est précisément la raison de cette préparation. Toutes les valeurs ci-dessous (hashes, CSP, capabilities, commandes, chemins) sont reprises **telles quelles** des fichiers du dépôt ; les champs à compléter par l'exécutant sont marqués `[À COMPLÉTER]`.

| Repère | Valeur |
|---|---|
| Commit candidat applicatif (code testé) | `fb60ae1` — hash complet `fb60ae13dd99312979789b15875d68dd7d4081d8` (2026-10-10 : A1C1-01 P2 null-safety sélecteurs thèse) |
| Commit documentaire (docs, sans impact code) | `f4ca696` — hash complet `f4ca6966672dbda6f9c9bd9a78782054c44e8098` (2026-10-10 : doc 22 rapport pour le développeur). Le diff `fb60ae1..f4ca696` ne touche que `audit/` et `worklog.md` (aucun fichier code) |
| Date de préparation de la check-list | 2026-10-10 |
| Procédures de référence | `audit/baseline/15_PROCEDURE_BUILD_WINDOWS.md` (C2) et `audit/baseline/14_PROCEDURE_BUILD_WEB.md` §4 (parcours critiques) |
| Archivage des preuves | `audit/baseline/evidence/c2-build-windows.json` + captures `c2-*.png` (gabarit §6 ci-dessous, conforme doc 15 §4) |

> **Rappel** : exécution propriétaire sur machine Windows, hors environnement du développeur. L'installeur ne sera distribué qu'après réussite complète (doc 15, en-tête). Les résultats sont rapportés **séparément** du volet web C1.

---

## §1 — Prérequis machine Windows

| # | Prérequis | Détail / valeur | Source | ✔ |
|---|---|---|---|---|
| 1.1 | OS | Windows 10/11 | doc 15 §1.1 | ☐ |
| 1.2 | Bun | Version **non épinglée** dans le dépôt : pas de champ `engines` dans `package.json`, aucun champ de version Bun dans `bun.lock`. Seul indice d'environnement : `bun.lock` résout `bun-types@1.3.6` (types publiés pour Bun 1.3.x). Le workflow CI utilise `oven-sh/setup-bun@v2` sans version épinglée (dernière stable). **Action : installer un Bun récent 1.3.x, relever `bun --version` dans le gabarit §6** | `package.json` (absence engines), `bun.lock` l.856, `.github/workflows/build-desktop.yml` l.35-36 | ☐ |
| 1.3 | Rust toolchain | Chaîne **stable** + cible **`x86_64-pc-windows-msvc`** (cible utilisée par la CI : `dtolnay/rust-toolchain@stable` avec `targets: x86_64-pc-windows-msvc`). La cible MSVC suppose la présence des Build Tools Visual Studio (compilateur MSVC + Windows SDK), prérequis standard de cette cible Rust. Relever `rustc --version` et `cargo --version` | `.github/workflows/build-desktop.yml` l.56-59 ; doc 15 §1.1 (« Rust stable ») | ☐ |
| 1.4 | WebView2 Runtime | Requis pour l'exécution Tauri v2 sous Windows (doc 15 §1.1). Sur Windows 10/11 à jour il est généralement déjà présent (Runtime Evergreen) — vérifier avant de commencer | doc 15 §1.1 | ☐ |
| 1.5 | Node.js | **Requis par la chaîne de build** : `scripts/build-tauri-prep.sh` affiche `node --version` (l.8-9) et **copie `node.exe` depuis le PATH** dans le bundle (l.59-74) ; `node.exe` est ensuite embarqué dans l'installeur comme ressource (`tauri.conf.json` l.46). Node doit donc être installé et accessible dans le PATH. Version non épinglée — relever `node --version` | `scripts/build-tauri-prep.sh` l.8-9, l.59-74 ; `src-tauri/tauri.conf.json` l.46 | ☐ |
| 1.6 | git | Requis (récupération du candidat + contrôle d'identité §2). Utiliser **Git Bash** pour les commandes bash ci-dessous | doc 15 (commandes bash) | ☐ |
| 1.7 | Espace disque | Prévoir **≥ 10 Go libres** (estimation d'ordre de grandeur). Mesuré sur le dépôt de développement : `node_modules` ≈ **1,3 Go** après install ; `db/` ≈ 254 Mo (deux fichiers `.db` versionnés) ; `.next/` ≈ 561 Mo (intermédiaire, régénéré). En plus : toolchain Rust (~1,5–2 Go) et `src-tauri/target/` (plusieurs Go pour un build Tauri complet — non mesurable ici, aucun build Rust exécuté sur l'environnement Linux) | mesures du 2026-10-10 sur le dépôt ; estimation pour target marquée comme telle | ☐ |
| 1.8 | Aucun serveur dev sur le port 3000 | Le port 3000 est le `devUrl` Tauri (`tauri.conf.json` l.9) ; libérer le port avant tout build/test | `src-tauri/tauri.conf.json` l.9 ; doc 14 §1.2 (analogie) | ☐ |

---

## §2 — Récupération du candidat

Commandes à exécuter dans **Git Bash**, dans le clone du dépôt :

```bash
git fetch origin
git checkout fb60ae13dd99312979789b15875d68dd7d4081d8
# → HEAD détaché sur le candidat applicatif. Vérifier :
git status                    # attendu : arbre de travail PROPRE (rien à commiter)
git rev-parse HEAD            # attendu : fb60ae13dd99312979789b15875d68dd7d4081d8
```

**Contrôle d'identité de l'arbre** (commande exacte, à exécuter telle quelle) :

```bash
git archive --format=tar fb60ae1 | sha256sum
```

- Valeur de référence calculée par le développeur le **2026-10-10** :
  `f79e38f425043b7e6ef0603c6a20bf8d6bf2c156fbbcfcdf70d6da8b8c2bccb4`
- Si la valeur obtenue diffère : vérifier d'abord `git rev-parse HEAD` et `git status` (arbre propre) — l'égalité du hash complet du commit et d'un `git status` propre reste le critère décisif (le format tar de `git archive` pouvant marginalement varier selon la version de git). Dans ce cas, rapporter **les deux** empreintes dans le gabarit §6.
- À titre d'information, la même commande sur le commit documentaire `f4ca696` donne :
  `d6e1a24ace7213e483fdc71d9b4cfea7ba341dfa08a431583b494489ceca0c2c` — **ne pas builder sur ce commit** : le build porte exclusivement sur le candidat applicatif `fb60ae1`.

**Points d'attention après checkout :**
- `dist-tauri/index.html` (page d'attente « Démarrage de Ma Thèse... ») est **versionné** et correspond au `frontendDist` du build Tauri (`tauri.conf.json` l.10 : `"../dist-tauri"`) — il est présent après checkout, ne pas le supprimer ni le modifier.
- Les bases `db/custom.db` et `db/urbanisme-test.db` sont **versionnées** et embarquées dans l'installeur (ressources `tauri.conf.json` l.43-44 : `"../db/*": "db/"`). Ne pas les modifier avant le build.

- [ ] `git status` propre après checkout
- [ ] Empreinte `git archive` relevée (et comparée à la référence ci-dessus)

---

## §3 — Étapes de build pas-à-pas (doc 15 §2, pré-remplies)

### 3.0 Pré-contrôle optionnel de synchronisation des bases (garde-fou de la CI)

Ce garde-fou existe dans le workflow CI (`build-desktop.yml` l.42-54) mais **pas** dans le script de préparation local ; recommandé avant tout build coûteux :

```bash
bunx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-url file:db/custom.db --exit-code
bunx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-url file:db/urbanisme-test.db --exit-code
```

Attendu : exit `0` (base synchrone) pour les deux. Exit `2` = drift détecté → **arrêt et signalement** au développeur (ne jamais distribuer un installeur avec une base désynchronisée — motif CI).

### 3.1 Installation des dépendances

```bash
bun install
```

- Le `postinstall` exécute automatiquement `prisma generate` (`package.json` scripts).

### 3.2 Build Tauri + installeur (doc 15 §2)

```bash
bun run tauri build        # commande prescrite par le doc 15 §2
# alias équivalent présent dans package.json : bun run tauri:build  ("tauri build")
```

**Ce qui s'exécute automatiquement** : `beforeBuildCommand = "bash scripts/build-tauri-prep.sh"` (`tauri.conf.json` l.8), qui enchaîne (sorties `[1/6]` à `[6/6]` attendues) :
1. `bunx prisma generate --schema=prisma/schema.prisma`
2. `bun run build` (= `prisma generate && next build`, `package.json`) — build Next.js **standalone** (`next.config.ts` l.4 : `output: "standalone"`)
3. Préparation de `build/tauri-bundle/`
4. Copie du serveur standalone + `.next/static` + `public/`
5. Compression en `build/tauri-bundle/standalone.zip` (via PowerShell sous Windows, script l.45-48)
6. Copie de `node.exe` dans `build/tauri-bundle/`

- [ ] ✅ Attendu (doc 15 §2) : compilation Rust OK, fin sans erreur.
- [ ] ✅ **Artefact attendu** : un installeur **NSIS** — `bundle.targets = ["nsis"]` (`tauri.conf.json` l.33-35) — sous :
  - `src-tauri/target/release/bundle/nsis/*.exe` (build local sans `--target`)
  - motif de nom attendu : `Ma Thèse_1.10.8_x64-setup.exe` (produit `Ma Thèse`, version `1.10.8` — `tauri.conf.json` l.3-4) — **confirmer le nom exact à la sortie réelle**
  - **Aucun `.msi` n'est attendu** tant que `targets = ["nsis"]` (le doc 15 mentionne `*.msi / *-setup.exe` ; le cas NSIS correspond au `*-setup.exe`)
  - Variante CI (si l'exécutant passe explicitement `--target x86_64-pc-windows-msvc`) : `src-tauri/target/x86_64-pc-windows-msvc/release/bundle/nsis/*.exe` (`build-desktop.yml` l.77, l.83)
- [ ] **Ressources embarquées dans l'installeur** (`tauri.conf.json` l.43-47) : `db/` (`custom.db`, `urbanisme-test.db`), `standalone.zip` (serveur Next embarqué), `node.exe`.
- [ ] Archiver les **versions** (Tauri : `bunx tauri --version` ; Rust ; Node/Bun ; Windows : `winver`) et les **sorties complètes** du build (doc 15 §2).

> Les `*.exe` / `*.msi` et `src-tauri/target/` sont ignorés par git (`.gitignore` l.73, l.83-84) — voir règle §7 : aucun artefact de build dans le dépôt.

---

## §4 — Smoke test CSP (doc 15 §3, pré-rempli)

### 4.1 Valeurs attendues (copie EXACTE de `src-tauri/tauri.conf.json`)

**CSP de production** (`tauri.conf.json` l.27, champ `app.security.csp`) — **celle qui s'applique à l'application installée** :

```
default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' ipc: http://ipc.localhost; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
```

**devCsp** (`tauri.conf.json` l.28) — ne s'applique qu'en mode dev (`bun run tauri:dev`, `devUrl http://localhost:3000`) ; communiquée pour comparaison, **pas** celle du build installé :

```
default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' ws://localhost:3000 ipc: http://ipc.localhost; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
```

Les deux valeurs sont conformes à l'attendu durci du doc 15 §1.2 (default-src 'self' ; script-src 'self' 'unsafe-inline' ; object-src 'none' ; frame-ancestors 'none') — durcissement du cycle C-4.

**Capabilities attendues** (`src-tauri/capabilities/default.json`, unique fichier du répertoire) :

```json
{
  "identifier": "default",
  "description": "Default capability for Ma Thèse — durcie (C-4 / AUD-SEC-001+005) : permissions minimales, le plugin shell n'est jamais utilisé par le front (0 usage vérifié au cycle audit-remediation-p1).",
  "windows": ["main"],
  "permissions": ["core:default"]
}
```

→ **`core:default` seul**, aucune permission `shell:allow-open` / `shell:allow-execute` (doc 15 §1.2). Conformité vérifiée sur le dépôt au commit candidat ; à re-coller depuis le dépôt checkout et comparer (doc 15 §3.4).

### 4.2 Procédure de smoke (reprise du doc 15 §3)

1. [ ] Installer l'application depuis l'installeur NSIS ; la lancer.
2. [ ] **Serveur Next standalone** : démarrage correct (fenêtre « Ma Thèse — Assistant de thèse », 1400×900 — `tauri.conf.json` l.14-24), aucune erreur au démarrage, navigation initiale fonctionnelle.
3. [ ] Parcours critiques (§5 ci-dessous).
4. [ ] **Vérification explicite CSP/capabilities** :
   - Aucune fonctionnalité attendue bloquée par la CSP (images/polices locales OK, scripts inline Next OK).
   - Console devtools : aucune violation CSP inattendue (les violations éventuelles sont notées et qualifiées). **Note pratique** : `src-tauri/Cargo.toml` déclare `tauri = { version = "2", features = [] }` — la fonctionnalité `devtools` n'est pas activée ; dans un build release installé, la console de devtools peut donc ne pas être disponible. Si c'est le cas : (a) la vérification CSP se fait par le contrôle du dépôt au commit testé (§4.1) + le comportement applicatif ; (b) le contrôle console peut être fait en option sur un run en mode dev (`bun run tauri:dev`, qui utilise la devCsp — à mentionner comme tel dans les preuves) ; tout écart reste signalé.
   - **Aucune permission shell réintroduite** : coller le contenu des capabilities (ci-dessus, depuis le dépôt au commit testé) et comparer à la liste attendue (`core:default` seul).
5. [ ] **Comportement à l'arrêt** : fermeture propre, arrêt du serveur Next embarqué — aucun processus orphelin `node` / `next-server` visible dans le gestionnaire des tâches après fermeture.
6. [ ] Journaux/erreurs au démarrage et à l'arrêt : noter tout événement (capturer le gestionnaire des tâches avant/après fermeture).

---

## §5 — Parcours critiques à rejouer (identiques au doc 14 §4, pré-remplis)

Objets de test préfixés **`AUDIT-C2-`** et nettoyés en fin de session (règles doc 15). Les parcours 1 à 7 sont les 7 GP de la TNR ; le 8 couvre la persistance générale.

| # | Parcours | Résultat attendu | ✔ |
|---|---|---|---|
| 1 | Consultation/rédaction — ouvrir la thèse, éditer un chapitre, F5 | contenu persisté | ☐ |
| 2 | Créer une nouvelle thèse (CTA dashboard → dialogue, préfixer `AUDIT-C2-`) puis Changer de thèse | 2 thèses, bascule propre, retour à la thèse réelle intacte | ☐ |
| 3 | Références — créer puis supprimer avec confirmation (Annuler = rien) | CRUD isolé, confirmation active | ☐ |
| 4 | Génération IA (Assistant IA, mode Rédaction de résumé) | clic direct sur Générer, stream 200, Résultat affiché | ☐ |
| 5 | RAG — indexer puis question | réponse « d'après les extraits » avec citation | ☐ |
| 6 | Recherche thèses en ligne | résultats réels (HAL), 200 | ☐ |
| 7 | Export DOCX | téléchargement, fichier Word valide | ☐ |
| 8 | Persistance générale | F5 sur chaque vue testée ; données intactes | ☐ |

- Noter tout écart, erreur console (si accessible), erreur serveur (journaux).
- Nettoyage final : supprimer tous les objets `AUDIT-C2-` (thèse jetable et dépendances) via les flux UI ; vérifier que la thèse réelle du propriétaire est intacte.

---

## §6 — Gabarit de résultats à retourner (doc 15 §4, pré-rempli)

À archiver dans `audit/baseline/evidence/c2-build-windows.json` + captures. Champs déjà connus pré-remplis ; les autres sont `[À COMPLÉTER]` :

```json
{
  "commit_teste": "fb60ae13dd99312979789b15875d68dd7d4081d8",
  "date": "[À COMPLÉTER — date d'exécution sur la machine Windows ; check-list préparée le 2026-10-10]",
  "identite_arbre": {"commande": "git archive --format=tar fb60ae1 | sha256sum",
                     "reference_dev_2026-10-10": "f79e38f425043b7e6ef0603c6a20bf8d6bf2c156fbbcfcdf70d6da8b8c2bccb4",
                     "valeur_obtenue": "[À COMPLÉTER]"},
  "versions": {"tauri": "[À COMPLÉTER : bunx tauri --version]",
               "rust": "[À COMPLÉTER : rustc --version]",
               "node_ou_bun": "[À COMPLÉTER : bun --version / node --version]",
               "windows": "[À COMPLÉTER : winver]"},
  "build": {"commande": "bun run tauri build",
            "installeur": "[À COMPLÉTER : src-tauri/target/release/bundle/nsis/<nom>.exe + taille]",
            "resultat": "[À COMPLÉTER : OK/échec]"},
  "installation": "[À COMPLÉTER : OK/échec]",
  "smoke_test": {"demarrage": "[À COMPLÉTER]",
                 "parcours_critiques": [{"n": 1, "resultat": "[À COMPLÉTER]"},
                                        {"n": 2, "resultat": "[À COMPLÉTER]"},
                                        {"n": 3, "resultat": "[À COMPLÉTER]"},
                                        {"n": 4, "resultat": "[À COMPLÉTER]"},
                                        {"n": 5, "resultat": "[À COMPLÉTER]"},
                                        {"n": 6, "resultat": "[À COMPLÉTER]"},
                                        {"n": 7, "resultat": "[À COMPLÉTER]"},
                                        {"n": 8, "resultat": "[À COMPLÉTER]"}],
                 "csp": {"attendue": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' ipc: http://ipc.localhost; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
                         "violations": "[À COMPLÉTER : aucune / liste qualifiée]"},
                 "capabilities_actuelles": ["core:default"],
                 "permissions_shell": "aucune"},
  "arret": "[À COMPLÉTER : fermeture propre, aucun processus orphelin node/next-server]",
  "captures": ["c2-*.png"],
  "conclusion": "[À COMPLÉTER : DESKTOP_WINDOWS_VALIDE / PROBLEMES: …]"
}
```

**Captures attendues** (naming proposé, préfixe `c2-` conforme au gabarit doc 15 ; ajuster si besoin) :

| Capture | Contenu |
|---|---|
| `c2-01-fin-build.png` | fin du `bun run tauri build` sans erreur |
| `c2-02-installeur.png` | dossier `src-tauri/target/release/bundle/nsis/` avec l'installeur (nom + taille visibles) |
| `c2-03-premier-demarrage.png` | fenêtre « Ma Thèse — Assistant de thèse » au premier lancement |
| `c2-04` … `c2-11` | un par parcours critique GP-1 → GP-8 (§5) |
| `c2-12-csp-capabilities.png` | preuve capabilities (`core:default` seul) + console devtools si disponible (sinon le noter) |
| `c2-13-arret-processus.png` | gestionnaire des tâches après fermeture (aucun `node`/`next-server` orphelin) |

---

## §7 — Points de contact et règles

1. **Point de contact** : le développeur reste disponible pour tout écart constaté (build, smoke, CSP, capabilities) — tout écart CSP/capabilities est signalé **immédiatement** (doc 15, règles finales ; doc 14, mêmes principes). Aucun correctif de code à la main par l'exécutant : tout écart remonte au développeur.
2. **Artefacts de build hors dépôt** : ne jamais committer/pousser l'installeur ou tout binaire (`*.exe`, `*.msi` et `src-tauri/target/` sont de toute façon ignorés par `.gitignore` l.73, l.83-84). Les preuves (JSON + captures `c2-*.png`) sont transmises au développeur, qui en assure l'archivage documentaire dans le dépôt.
3. **Résultats rapportés séparément** du volet web C1 (doc 15, en-tête) — un retour C2 distinct, avec le gabarit §6 rempli.
4. **Red lines** :
   - aucune **diffusion du binaire** : l'installeur ne sera distribué qu'après réussite complète du C2 (doc 15, en-tête) ;
   - **pas de mise en production sans GO écrit** du propriétaire (actions bloquées en attente de GO écrit — fil de travail P7–P9, doc 22) ;
   - aucune donnée sensible dans les preuves (règle doc 15 §4) ;
   - objets de test `AUDIT-C2-` créés puis nettoyés (règle doc 15 §4) ;
   - aucune modification de code ni de configuration pendant l'exécution : le build porte strictement sur l'arbre du commit `fb60ae1`.

---

## Annexe — Points du doc 15 restés ambigus et traitement retenu

| Point ambigu | Traitement dans cette check-list |
|---|---|
| Version Bun non spécifiée (doc 15 : « Node/Bun ») | Aucune version épinglée dans le dépôt (pas d'`engines`, rien dans `bun.lock`) ; indicateur `bun-types@1.3.6` + CI `setup-bun@v2` dernière stable → instruction « Bun récent 1.3.x » + relevé de la version réelle dans le gabarit (§1.2, §6) |
| « `*.msi` / `*-setup.exe` » (doc 15 §2) alors que `bundle.targets = ["nsis"]` | Attendu affiné : NSIS seul → `*-setup.exe` sous `src-tauri/target/release/bundle/nsis/` ; pas de `.msi` tant que targets inchangé (§3.2) |
| Chemin de l'installeur | Deux variantes documentées : local sans `--target` → `src-tauri/target/release/bundle/nsis/` ; variante CI avec `--target x86_64-pc-windows-msvc` → `src-tauri/target/x86_64-pc-windows-msvc/release/bundle/nsis/` (§3.2) |
| Nom exact de l'installeur | Motif attendu `Ma Thèse_1.10.8_x64-setup.exe` déduit de productName/version (`tauri.conf.json` l.3-4) — confirmation exigée à la sortie réelle (§3.2) |
| « Console devtools » (doc 15 §3.4) alors que la feature `devtools` n'est pas activée dans `Cargo.toml` (`features = []`) | Note pratique ajoutée en §4.2 : si la console est indisponible dans le build release, vérification CSP par contrôle du dépôt + comportement applicatif ; contrôle console optionnel en mode dev (`tauri:dev`, devCsp) — tout signalé tel quel dans les preuves |
| Garde-fou de synchronisation des bases | Présent dans la CI (`build-desktop.yml` l.42-54) mais absent de `build-tauri-prep.sh` et du doc 15 → ajouté comme pré-contrôle **optionnel** en §3.0, commande exacte reprise de la CI |
| Checklist « C1 §4 » référencée par le doc 15 §3.3 | Déroulée intégralement en §5 (tableau doc 14 §4 : les 7 GP + persistance générale, 8 lignes) |
