# 24 — CHECK-LIST C2 WINDOWS COMPLÈTE (pré-remplie) — exécution propriétaire sur le candidat `7dff2c6`

**Cycle :** audit-final-v1.2 · vague 5 · **Date de préparation :** 2026-10-10
**Objet :** exécution du build Windows Tauri + smoke CSP **par le propriétaire sur sa machine Windows**, sur le candidat exact. Cette version complète et remplace la check-list de vague 4 (`evidence/c2-windows-checklist-pre-remplie.md`, préparée sur `fb60ae1` — conservée pour traçabilité, **à ne pas utiliser pour l'exécution** : le candidat a bougé).
**Référence procédurale :** `15_PROCEDURE_BUILD_WINDOWS.md` (C2) · `14_PROCEDURE_BUILD_WINDOWS` §4 pour les parcours (reprendus en §5 ci-dessous).

## §0 — Identité du candidat (à vérifier avant tout)

| Champ | Valeur exacte |
|---|---|
| **Commit applicatif à tester** | **`7dff2c6c98f8be59edb64b34f8a1eb021745a435`** (court : `7dff2c6`) — tag `candidat-app-audit-v1.2` — contenu : fix A1C1-02 (1 ligne `tsconfig.json` exclude `audit`, zéro impact runtime) sur la base fb60ae1 (fix A1C1-01) |
| Commit documentaire (ne pas builder dessus) | `24415b7f19ed89b44201e436f3026680eddd84ad` — tag `candidat-docs-audit-v1.2` |
| **Empreinte d'arbre de référence** | `git archive --format=tar 7dff2c6 \| sha256sum` → **`8ae37edab22fea51f6a4a13a16cd21a8f78c3d55f81c61851e343d43f987e75e`** (calculée par le développeur le 2026-10-10 ; si divergence : vérifier `git rev-parse HEAD` + `git status` propre — le hash complet du commit reste le critère décisif, cf. annexe) |
| Produit / version | « Ma Thèse » `1.10.8` (`src-tauri/tauri.conf.json` l.3-4) |
| Validations déjà acquises côté web sur ce commit exact | C1 build production SUCCÈS + smoke standalone 7/7 · 7 GP validés UI réelle · TNR 1 658/1 658 · lint 0 erreur/247 warnings (preuves : `evidence/c1-build-web.json`, `evidence/vague4-candidat-7dff2c6.json`) |

---

## §1 — Prérequis machine Windows

| # | Prérequis | Détail | ✔ |
|---|---|---|---|
| 1.1 | Windows 10/11 | `winver` à relever | ☐ |
| 1.2 | **Bun récent 1.3.x** | aucune version épinglée dans le dépôt (pas d'`engines`) ; relever `bun --version` | ☐ |
| 1.3 | **Rust stable + cible `x86_64-pc-windows-msvc`** | Build Tools Visual Studio (MSVC + Windows SDK) requis par cette cible ; relever `rustc --version` / `cargo --version` | ☐ |
| 1.4 | WebView2 Runtime | généralement présent (Evergreen) sur Win 10/11 à jour — vérifier | ☐ |
| 1.5 | **Node.js dans le PATH** | requis par la chaîne : `build-tauri-prep.sh` relève `node --version` et copie `node.exe` dans le bundle ; relever `node --version` | ☐ |
| 1.6 | Git (+ Git Bash) | pour checkout + contrôle d'identité §2 | ☐ |
| 1.7 | ≥ 10 Go libres | node_modules ≈ 1,3 Go · db ≈ 254 Mo · toolchain Rust + `src-tauri/target/` (plusieurs Go, estimation) | ☐ |
| 1.8 | Port 3000 libre | 3000 = `devUrl` Tauri — libérer avant build/test | ☐ |
| 1.9 | **Connexion Internet** | requise pour GP-6 (HAL réel) | ☐ |
| 1.10 | **Fournisseur IA opérationnel pour GP-4/GP-5** | clé à configurer sur la machine de test (via l'app — vue clés IA/outils — ou variable d'environnement locale). **Si aucune clé : GP-4/GP-5 notés « N/A-environnement » avec échec propre attendu (503/400 documentés, cf. preuves vues 36/44) — ce n'est PAS un FAIL si le comportement est un échec propre** | ☐ |

---

## §2 — Pré-contrôles (checkout + identité arbre + drift DB)

```bash
git fetch origin
git checkout 7dff2c6c98f8be59edb64b34f8a1eb021745a435   # HEAD détaché sur le candidat
git status                    # attendu : arbre de travail PROPRE
git rev-parse HEAD            # attendu : 7dff2c6c98f8be59edb64b34f8a1eb021745a435
git archive --format=tar 7dff2c6 | sha256sum   # comparer à §0
# Pré-contrôle drift DB (garde-fou repris de la CI, recommandé) :
bunx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-url file:db/custom.db --exit-code
bunx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-url file:db/urbanisme-test.db --exit-code
```

**PASS** : arbre propre · hash HEAD exact · empreinte archive = §0 (ou écart tar marginal documenté avec hash commit conforme) · exit 0 ×2 au drift.
**FAIL → ARRÊT + signalement** (ne jamais builder sur un arbre modifié, un autre commit, ou une base désynchronisée — exit 2 = drift).

Points d'attention après checkout : `dist-tauri/index.html` est **versionné** (frontendDist du build — ne pas supprimer) ; les bases `db/custom.db` et `db/urbanisme-test.db` sont **versionnées** et embarquées dans l'installeur (ressources `tauri.conf.json` l.43-44) — ne pas les modifier avant le build.

---

## §3 — Build

```bash
bun install          # postinstall : prisma generate (normal)
bun run tauri build  # = alias tauri:build ; beforeBuildCommand = bash scripts/build-tauri-prep.sh
```

Sorties attendues du prep script : phases `[1/6]` → `[6/6]` (prisma generate · next build standalone · préparation build/tauri-bundle · copie serveur+static+public · compression standalone.zip via PowerShell · copie node.exe).

| Contrôle | Résultat attendu | ✔ |
|---|---|---|
| Compilation Rust | OK, fin sans erreur | ☐ |
| **Artefact** | installeur **NSIS** `Ma Thèse_1.10.8_x64-setup.exe` (motif attendu, **confirmer le nom exact**) sous `src-tauri/target/release/bundle/nsis/` — **aucun `.msi` attendu** (targets=`["nsis"]`) ; variante CI avec `--target` : `src-tauri/target/x86_64-pc-windows-msvc/release/bundle/nsis/` | ☐ |
| Ressources embarquées | `db/` (custom.db, urbanisme-test.db) + `standalone.zip` + `node.exe` | ☐ |
| Versions relevées | Tauri (`bunx tauri --version`), Rust, Bun/Node, Windows — archiver + sortie complète du build | ☐ |

`*.exe`/`*.msi`/`src-tauri/target/` sont ignorés par git — **jamais commités** (red line §9).

---

## §4 — Installation et premier démarrage

1. Installer l'installeur NSIS sur l'environnement de test ; lancer l'application.
2. **Attendu** : fenêtre « Ma Thèse — Assistant de thèse » (1400×900), serveur Next standalone démarré, navigation initiale fonctionnelle, aucune erreur au démarrage.

---

## §5 — Smoke test (7 golden paths + persistance + CSP/capabilities + arrêt)

### 5.1 Parcours critiques (objets de test préfixés `AUDIT-C2-`, nettoyés en fin de session)

| # | Parcours | Résultat attendu (critère PASS) | ✔ |
|---|---|---|---|
| GP-1 | Éditeur : **cliquer un onglet de chapitre** (voir note A1V4-01), éditer, F5 | contenu persisté après rechargement | ☐ |
| GP-2 | Créer thèse test `AUDIT-C2-` (CTA dashboard) | bouton désactivé tant que requis vides ; création 201 ; bascule propre ; retour thèse réelle intacte | ☐ |
| GP-3 | Références : créer, supprimer avec confirmation | Annuler = **aucune** requête DELETE ; Confirmer = suppression effective | ☐ |
| GP-4 | Assistant IA, mode « Rédaction de résumé », **clic direct** sur Générer | stream 200 → résultat affiché (si clé IA configurée ; sinon « N/A-environnement », échec propre) | ☐ |
| GP-5 | RAG : indexer puis question | réponse « d'après les extraits » **ancrée** sur le texte (si clé IA ; sinon idem GP-4) | ☐ |
| GP-6 | Thèses en ligne : recherche HAL | résultats réels, API 200 (Internet requis) | ☐ |
| GP-7 | Export DOCX | téléchargement ; fichier **Microsoft Word 2007+** valide (bibliographie APA présente) | ☐ |
| GP-8 | Persistance générale | F5 sur chaque vue testée — données intactes | ☐ |

> Note A1V4-01 (P3, connue) : après démarrage, tant qu'aucun onglet de chapitre n'est cliqué, l'auto-save est inerte — **cliquer un onglet avant de saisir** (comportement GP-1 ci-dessus). Toute observation complémentaire sur ce point est bienvenue (signalement, pas de correctif à la main).

### 5.2 CSP / capabilities — valeurs attendues (copie exacte du dépôt au candidat)

**CSP de production** (`tauri.conf.json` l.27 — celle de l'app installée) :
```
default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' ipc: http://ipc.localhost; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
```

**Capabilities** (`src-tauri/capabilities/default.json`, unique fichier) — **attendu : `core:default` seul, windows `["main"]`, aucune permission `shell:allow-open`/`shell:allow-execute`** :
```json
{
  "identifier": "default",
  "description": "Default capability for Ma Thèse — durcie (C-4 / AUD-SEC-001+005) : permissions minimales, le plugin shell n'est jamais utilisé par le front (0 usage vérifié au cycle audit-remediation-p1).",
  "windows": ["main"],
  "permissions": ["core:default"]
}
```

Contrôles : ① aucune fonctionnalité normale bloquée (images/polices locales, scripts inline Next) ; ② aucune violation CSP inattendue en console — **note pratique** : `Cargo.toml` déclare `features = []` (devtools non activé) : si la console est indisponible en release, la vérification CSP se fait par le contrôle du dépôt (valeurs ci-dessus) + comportement applicatif ; contrôle console optionnel en mode dev (`bun run tauri:dev`, devCsp — à mentionner comme tel) ; ③ coller le JSON des capabilities depuis le dépôt checkout et comparer à l'attendu.

### 5.3 Arrêt

Fermer l'app → **aucun processus orphelin `node`/`next-server`** dans le gestionnaire des tâches (capture avant/après fermeture).

---

## §6 — Critères PASS/FAIL globaux

| Contrôle | PASS si… | En cas de FAIL |
|---|---|---|
| §2 pré-contrôles | arbre propre, hash exact, empreinte conforme, drift 0 ×2 | **ARRÊT + signalement immédiat** — aucun build |
| §3 build | fin sans erreur + installeur NSIS présent avec nom/ressources attendus | ARRÊT + signalement (sortie complète archivée) — **aucun correctif à la main** |
| §4 démarrage | fenêtre + serveur embarqué OK, navigation initiale | signalement immédiat |
| §5.1 les 8 parcours | **8/8 PASS** (GP-4/GP-5 « N/A-environnement » avec échec propre admis, explicitement notés) | signalement immédiat avec pas de reproduction + captures ; l'exécution s'arrête sur le parcours en échec (les suivants peuvent être tentés à titre informatif, notés « NON VALIDÉ ») |
| §5.2 CSP/capabilities | aucune violation inattendue + capabilities = `core:default` seul + aucune fonctionnalité bloquée | **signalement immédiat** (écart de sécurité = priorité absolue) |
| §5.3 arrêt | aucun processus orphelin | signalement immédiat |
| Nettoyage | tous les objets `AUDIT-C2-` supprimés via flux UI ; thèse réelle intacte | nettoyer avant de conclure ; tout résidu signalé |

**Verdict global** : `DESKTOP_WINDOWS_VALIDE` ssi tous les contrôles PASS (GP-4/GP-5 N/A-environnement admis) ; sinon `PROBLEMES: <liste>` — **dans tous les cas, aucun correctif de code/config par l'exécutant** et aucun écart gardé sans signalement (exigence propriétaire « signaler immédiatement tout écart »).

---

## §7 — Preuves à retourner (liste exhaustive)

À transmettre au développeur (archivage documentaire dans le dépôt par ses soins) :

1. **`c2-build-windows.json`** — gabarit §8 rempli intégralement (aucun champ laissé « [À COMPLÉTER] »).
2. **Captures** (naming proposé, préfixe `c2-`) : `c2-01-fin-build.png` (fin de build sans erreur) · `c2-02-installeur.png` (dossier nsis/ avec nom+taille) · `c2-03-premier-demarrage.png` · `c2-04`…`c2-11` (un par parcours GP-1→GP-8) · `c2-12-csp-capabilities.png` (capabilities collées + console si disponible, sinon note) · `c2-13-arret-processus.png` (gestionnaire des tâches après fermeture).
3. **Versions** : Tauri, Rust (`rustc`), Bun, Node, Windows (`winver`).
4. **Empreinte d'arbre obtenue** (`git archive | sha256sum`) + `git rev-parse HEAD` + sortie de `git status`.
5. **Résultat des pré-contrôles drift DB** (exit codes).
6. **Chemin + taille de l'installeur** produit.
7. **Déclaration d'écarts** : toute anomalie, violation CSP, comportement inattendu — même mineure (exigence de signalement).
8. **Confirmation de nettoyage** : objets `AUDIT-C2-` supprimés, thèse réelle intacte.

## §8 — Gabarit `c2-build-windows.json` (pré-rempli sur le candidat)

```json
{
  "commit_teste": "7dff2c6c98f8be59edb64b34f8a1eb021745a435",
  "date": "[À COMPLÉTER — date d'exécution sur la machine Windows]",
  "identite_arbre": {
    "commande": "git archive --format=tar 7dff2c6 | sha256sum",
    "reference_dev_2026-10-10": "8ae37edab22fea51f6a4a13a16cd21a8f78c3d55f81c61851e343d43f987e75e",
    "valeur_obtenue": "[À COMPLÉTER]"
  },
  "versions": {"tauri": "[À COMPLÉTER]", "rust": "[À COMPLÉTER]", "node_ou_bun": "[À COMPLÉTER]", "windows": "[À COMPLÉTER]"},
  "build": {"commande": "bun run tauri build",
            "installeur": "[À COMPLÉTER : src-tauri/target/release/bundle/nsis/<nom>.exe + taille]",
            "resultat": "[À COMPLÉTER : OK/échec]"},
  "installation": "[À COMPLÉTER : OK/échec]",
  "smoke_test": {
    "demarrage": "[À COMPLÉTER]",
    "parcours_critiques": [
      {"n": 1, "resultat": "[À COMPLÉTER : PASS/FAIL + détail]"},
      {"n": 2, "resultat": "[À COMPLÉTER]"}, {"n": 3, "resultat": "[À COMPLÉTER]"},
      {"n": 4, "resultat": "[À COMPLÉTER — ou N/A-environnement si échec propre sans clé]"},
      {"n": 5, "resultat": "[À COMPLÉTER — idem note GP-4]"},
      {"n": 6, "resultat": "[À COMPLÉTER]"}, {"n": 7, "resultat": "[À COMPLÉTER]"}, {"n": 8, "resultat": "[À COMPLÉTER]"}
    ],
    "csp": {"attendue": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' ipc: http://ipc.localhost; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
            "violations": "[À COMPLÉTER : aucune / liste qualifiée]"},
    "capabilities_actuelles": ["core:default"],
    "permissions_shell": "aucune"
  },
  "arret": "[À COMPLÉTER : fermeture propre, aucun processus orphelin node/next-server]",
  "captures": ["c2-01…c2-13"],
  "conclusion": "[À COMPLÉTER : DESKTOP_WINDOWS_VALIDE / PROBLEMES: …]"
}
```

## §9 — Règles et red lines (inchangées)

1. **Aucune diffusion du binaire** : l'installeur reste interne tant que le GO final n'est pas prononcé — jamais mis en production, jamais partagé.
2. **Base de données** : l'installation crée/attache la base **locale de la machine de test** — ne jamais remplacer `db/custom.db` du poste réel par la base de test.
3. **Aucune modification de code ni de configuration** pendant l'exécution : le build porte strictement sur l'arbre de `7dff2c6` ; tout écart remonte au développeur.
4. **Signalement immédiat** de tout écart CSP/capabilities/processus orphelin/parcours en échec.
5. **Résultats rapportés séparément** du volet web C1 (retour C2 distinct).
6. Artefacts de build hors dépôt (`.gitignore` les couvre de toute façon) ; aucune donnée sensible dans les preuves.
7. Objets de test `AUDIT-C2-` créés puis nettoyés via les flux UI.

---

## Annexe — Ambiguïtés doc 15 et traitement retenu (héritées de la check-list v1, inchangées)

| Point ambigu | Traitement |
|---|---|
| Version Bun non spécifiée | aucune épinglée dans le dépôt → « Bun récent 1.3.x » + relevé imposé (§1.2, §8) |
| « `*.msi` / `*-setup.exe` » vs `targets=["nsis"]` | attendu affiné : NSIS seul → `*-setup.exe` sous `bundle/nsis/` ; pas de `.msi` (§3) |
| Chemin installeur local vs CI | deux variantes documentées (§3) |
| Nom exact de l'installeur | motif `Ma Thèse_1.10.8_x64-setup.exe` — confirmation exigée à la sortie réelle (§3) |
| Console devtools en release | `features = []` → console possiblement indisponible ; repli : contrôle dépôt + comportement ; console optionnelle en `tauri:dev` (§5.2) |
| Garde-fou drift DB | présent en CI, absent du script local → pré-contrôle optionnel recommandé (§2) |
| Empreinte `git archive` divergente selon version git | le hash complet du commit + `git status` propre restent le critère décisif ; rapporter les deux empreintes si divergence (§0, §2) |
