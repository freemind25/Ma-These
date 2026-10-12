# 60 — LISTE EXACTE DES CLÉS À RÉVOQUER OU RENOUVELER — SERVICES ASSOCIÉS ET PROCÉDURES DE ROTATION

- **Date** : 2026-10-12 (vague 36)
- **Cycle** : `audit-final-v1.2`
- **Cadre** : directive propriétaire du 2026-10-12 — vague 35 validée (documents 55-59 conservés comme références), gel intégral maintenu, préparation documentaire uniquement
- **Directive exécutée** : point 2 — « Préparez-moi la liste exacte des clés à révoquer ou renouveler, leur service associé et la procédure de rotation. »
- **Règle absolue respectée** : **aucune valeur secrète, aucun fragment de clé, aucune empreinte de contenu de clé n'est reproduite dans le présent document.** Seuls figurent : identifiants de variables, services, localisations de fichiers, statuts et procédures. L'agent n'a accédé à aucune valeur de clé (extraction des noms de variables uniquement, valeurs masquées systématiquement).
- **Red lines** : aucune rotation exécutée, aucune écriture `.env`, aucune utilisation de clé, aucun commit/tag/push, aucune écriture `.git`/bases/sauvegardes/preuves/`repo.tar`. Seules écritures de la vague : le présent document, le document 61, leurs copies sur le canal visible et un nouveau fichier SHA256SUMS.

---

## 1. Méthodologie (lecture seule, 2026-10-12)

Sources examinées, sans copie de valeur :
- `.env` (noms de variables extraits uniquement) et `.env.example` (modèle versionné, placeholders) ;
- balayage négatif des sources sur motifs de secrets à haute entropie (`sk-…`, `AKIA…`, blocs `PRIVATE KEY`, `ghp_…`, `github_pat_…`) → **0 fichier détecté** dans l'arbre ;
- `src-tauri/tauri.conf.json` (updater, certificat) ;
- configuration Git (`remote`, `credential`, `gpg/signing`) et fichiers d'identifiants du poste (`~/.git-credentials`, `~/.npmrc`, `~/.netrc`, `~/.config/gh`, `~/.ssh`, `~/.gnupg`, `~/.tauri`, `~/.aws`, `~/.config/gcloud`) ;
- environnements d'exécution (variables sensibles : aucune) ;
- historique du worklog (vagues prod-readiness-audit-6/7, build-desktop-pipeline-1→5, security-openalex-rotation-1, rotation-cles-journaux-oa-fix, reconciliation-git-token-askpass) pour les statuts documentés.

Principe de statut : un statut n'est affirmé que s'il est **prouvé par une entrée consignée** ; sinon il est marqué « à confirmer par le propriétaire ».

---

## 2. Synthèse exécutive

| # | Clé / actif | Service associé | Action requise | Priorité |
|---|---|---|---|---|
| K-1 | `OPENALEX_API_KEY` — générations A et B | OpenAlex (API de recherche académique, quota premium) | Révoquer/confirmer révocation (gen. A) + renouveler (gen. B, transmise par messagerie) | **P1** |
| K-2 | `APINEX_API_KEY` — générations A et B | APINex (fournisseur IA) | Confirmer révocation (gen. A) + renouveler (gen. B) | **P1** |
| K-3 | PAT GitHub — génération 2 (push, valide) | GitHub — compte `freemind25`, dépôt privé `ThesisFrame` | **Révoquer impérativement** (transmise en clair par messagerie) | **P1** |
| K-4 | PAT GitHub — génération 3 (actuelle) | idem | Renouveler (fine-grained, périmètre minimal, expiration courte) | **P1** |
| K-5 | PAT GitHub — génération 1 (invalide) | idem | Révoquer par hygiène si encore listée | P2 |
| K-6 | Certificat de signature de code Windows (Authenticode) | Autorité de certification (à choisir) | **À acquérir** avant MEP — clé privée jamais dans le sandbox | P2 |
| K-7 | Paire de clés de signature updater Tauri (minisign) | Tauri updater (mises à jour signées) | **À créer hors sandbox** si l'updater est activé — clé privée hors sandbox, seule la clé publique est versionnée | P3 |

**Aucune autre clé n'est exposée.** Aucune clé n'est résidente dans le sandbox à la date du présent document (§6).

---

## 3. Tableau détaillé des clés

### K-1 — `OPENALEX_API_KEY` (service : OpenAlex)

- **Usage dans le projet** : quota premium des flux de recherche académique (`/api/journaux-oa`, deep-research) ; lue côté serveur/variable système desktop uniquement ; plus aucune clé dans le binaire depuis T14/C-D2 option a (`EXPLOITATION-SERVEUR.md` §3).
- **Expositions documentées** :
  - **Génération A** (ancienne) : en dur dans `src-tauri/src/lib.rs` l.221 du commit externe `1359333` jusqu'à `0543a4f` ; présente dans l'historique Git local **et** du dépôt distant privé ; citée en clair dans un dossier de preuves versionné (commit `2a8a4e3`) et dans `plan.md`/`preuves.md` (masqués depuis).
  - **Génération B** (courante) : fournie par messagerie instantanée le 2026-10-08, installée dans `.env.local` (non versionné), **perdue avec le rollback du 12:57 UTC le 2026-10-12** — elle n'est plus résidente nulle part, mais **toute clé ayant transité par messagerie doit être considérée comme compromise**.
- **Statut à date** : génération A constatée **toujours active** (HTTP 200) lors du dernier contrôle consigné (security-openalex-rotation-1) ; une rotation partielle a ensuite été rapportée mais l'état final côté serveur n'est **pas prouvé** — à confirmer. Génération B : compromise par transport, inactive localement.
- **Action** : rotation complète — révoquer toute clé active existante, en émettre une nouvelle.
- **Procédure** : §4.1.
- **Conservation après rotation** : variable système au poste propriétaire (desktop) ou `.env.local` chmod 600 hors Git. **Jamais dans `.env`** (versionné dans ce dépôt), jamais dans l'historique, jamais par messagerie en clair.

### K-2 — `APINEX_API_KEY` (service : APINex)

- **Usage** : fournisseur IA optionnel, lu côté serveur via variable d'environnement.
- **Expositions documentées** : génération A présente dans l'historique Git de `.env` (commits `04dc5ab`, `763ee5d`, dépôt privé) ; génération B installée lors de la session de rotation des clés (« balance ok » consigné), **transmise par messagerie** — compromise par transport.
- **Statut** : opérationnelle à l'époque de l'installation ; révocation effective de la génération A **non prouvée** — à confirmer.
- **Action** : confirmer/achever la révocation de la génération A ; renouveler la génération B.
- **Procédure** : §4.2.

### K-3 / K-4 / K-5 — PAT GitHub (service : GitHub, compte `freemind25`)

- **Usage** : création du dépôt privé `ThesisFrame`, pushs, déclenchement Actions, publication des releases (canal Git exclusivement via askpass éphémère `/tmp` mode 700 — le token n'a **jamais** été écrit dans `.git/config`, `.git-credentials` ou le dépôt).
- **Expositions documentées** :
  - **Génération 1** : transmise par chat — rejetée par l'API (HTTP 401, invalide) ; à révoquer par hygiène si encore listée.
  - **Génération 2** : valide (scopes `repo`, `workflow`) — **transmise en clair par messagerie instantanée** ; utilisée pour push/tag/release ; **compromisse impérativement à révoquer**.
  - **Génération 3** (actuelle) : émise lors de la session de rotation des clés, également **transmise par chat** ; opérationnelle à l'époque.
- **Statut à date** : **aucun PAT résident dans le sandbox** (aucune credential Git/npm/shell, aucune trace askpass). La génération 2 a peut-être déjà été révoquée — non prouvé.
- **Actions** : K-3 révoquer impérativement ; K-4 renouveler (fine-grained, dépôt unique, scopes minimaux, expiration ≤ 90 jours, transmission hors messagerie) ; K-5 révoquer par hygiène.
- **Procédure** : §4.3.

### K-6 — Certificat de signature de code Windows (Authenticode)

- **État actuel** : `tauri.conf.json` → `certificateThumbprint: null`, `timestampUrl: ""` — **aucun certificat configuré** ; les installeurs v1.10.7/v1.10.8 sont non signés (avertissement SmartScreen à l'installation).
- **Action** : acquérir un certificat (IV ou OV) auprès d'une autorité de certification avant MEP ; la **clé privée ne doit jamais entrer dans le sandbox** (token USB/HSM ou magasin de certificats Windows du poste de build propriétaire uniquement).
- **Procédure** : §4.4.

### K-7 — Paire de clés de signature updater Tauri (minisign)

- **État actuel** : **aucun updater configuré** (pas de plugin updater, pas de `pubkey`, pas de clés locales `~/.tauri`, aucun `TAURI_SIGNING_PRIVATE_KEY` référencé). Les releases actuelles ne diffusent pas de mises à jour signées.
- **Action conditionnelle** : si l'updater est activé pour la MEP, générer la paire **au poste propriétaire** (hors sandbox) ; seule la **clé publique** (non secrète) est placée dans `tauri.conf.json` et versionnée ; la clé privée est conservée dans un gestionnaire de secrets.
- **Procédure** : §4.5.

---

## 4. Procédures de rotation détaillées

### 4.1 OpenAlex (K-1)

1. Connexion au compte propriétaire sur openalex.org → paramètres API.
2. Révoquer/régénérer la clé : toute génération existante (A et B) doit cesser d'être valide. Noter la date et conserver une capture **sans afficher la valeur**.
3. Émettre la nouvelle clé ; **ne la transmettre ni par messagerie en clair, ni par le dépôt** (gestionnaire de secrets ou canal chiffré convenu avec le propriétaire).
4. Installation : variable système au poste desktop (cf. `EXPLOITATION-SERVEUR.md` §3) ou `.env.local` chmod 600 hors Git au poste propriétaire. **Jamais dans `.env`** (versionné).
5. Vérifications (côté propriétaire) : ancienne clé → attendu HTTP 401/403 ; nouvelle clé → HTTP 200 ; route `/api/journaux-oa` sans avertissement.
6. Consignation : date, service, preuve de révocation (capture) **sans valeur**.

### 4.2 APINex (K-2)

1. Console APINex du compte propriétaire → gestion des clés.
2. Confirmer la révocation de la génération A (si encore active : révoquer immédiatement).
3. Régénérer la génération B ; installation et vérifications identiques à §4.1 (test « balance » console + appel applicatif).
4. Consignation sans valeur.

### 4.3 GitHub PAT (K-3, K-4, K-5)

1. github.com → Settings → Developer settings → Personal access tokens (classiques et fine-grained) : **lister toutes les clés actives** du compte `freemind25`.
2. **Révoquer** : génération 2 (impératif) et génération 1 si listée.
3. **Créer** le renouvellement (remplace la génération 3) : fine-grained, restreinte au seul dépôt `freemind25/ThesisFrame`, permissions minimales (Contents: read/write, Actions, Workflows), **expiration ≤ 90 jours**.
4. Transmission de la nouvelle clé : gestionnaire de secrets ou canal chiffré — **jamais en clair dans la messagerie** ; si la messagerie est inévitable, re-rotation immédiatement après l'usage.
5. Utilisation : uniquement via askpass éphémère `/tmp` mode 700 (pattern éprouvé) ; **jamais** dans `.git/config`, `.git-credentials`, ni aucun fichier versionné.
6. Vérifications : `git ls-remote` vert (un API 200 ne prouve pas la chaîne Git — leçon consignée) ; ancienne clé → 401.
7. Consignation sans valeur.

### 4.4 Certificat Authenticode (K-6)

1. Choisir une autorité de certification (certificat IV/OV ; EV optionnel selon exigence SmartScreen).
2. Génération et stockage de la clé privée **au poste propriétaire** (token USB/HSM/magasin Windows) — jamais dans le sandbox.
3. Configuration côté poste de build propriétaire : `certificateThumbprint` + `timestampUrl` dans `tauri.conf.json` (valeurs non secrètes) au moment du build signé autorisé.
4. Preuve attendue : `signtool verify` positif sur l'installeur signé.

### 4.5 Clés updater Tauri (K-7, conditionnel)

1. Décision d'activer l'updater (produit), à soumettre au propriétaire séparément.
2. Génération au poste propriétaire : `bunx tauri signer generate` — la clé privée ne quitte pas le poste (gestionnaire de secrets).
3. Placer uniquement la **clé publique** dans `tauri.conf.json` (`bundle > createUpdaterArtifacts`, `pubkey`) — la clé publique n'est pas un secret.
4. Preuve attendue : signature de test vérifiée par la clé publique.

---

## 5. Règles transversales de rotation (rappel, valables pour toutes les clés)

1. **Toute clé ayant transité par messagerie en clair est réputée compromise** → rotation obligatoire, sans exception.
2. **Révocation avant émission** lorsqu'une clé est compromise ; l'inverse seulement si le service l'impose.
3. **Aucune valeur secrète** dans le dépôt (`.env` y est versionné), dans les documents, dans le worklog, ni dans la messagerie. Seul le propriétaire peut consigner des empreintes tronquées, dans ses propres archives.
4. Installation exclusivement dans : `.env.local` chmod 600 (non versionné, `.gitignore` `.env*`) ou variables système desktop.
5. Vérifications par tests réels avant/après (401/403 ancienne, 200 nouvelle) — jamais par simple affirmation.
6. **Aucune correction d'historique Git (BFG/force-push) n'est autorisée** par la gouvernance : la neutralisation des clés présentes dans l'historique du dépôt privé passe **exclusivement par leur révocation côté service** (§7).
7. Consignation : date, service, action, preuve de révocation sans valeur.

---

## 6. Inventaire négatif vérifié (lecture seule, 2026-10-12 ~17:30 UTC)

Vérifications effectuées aujourd'hui, résultats :

| Vérification | Résultat |
|---|---|
| `.env` (racine) | Une seule variable : `DATABASE_URL` (chemin SQLite — non secret). **Aucune clé.** |
| `.env.local` | **Absent** (perdu au rollback 12:57 — cohérent avec worklog ; la clé qu'il contenait a transité par messagerie → K-1/K-2 à tourner). |
| Sources (balayage motifs secrets) | **0 fichier** avec secret à haute entropie. |
| `.env.example` | Placeholders uniquement (« your-key-here ») — 21 noms de clés listés, aucun réel. |
| `~/.git-credentials` | **Absent.** |
| `~/.npmrc` | Aucun `authToken` (simple `prefix`). |
| `~/.netrc`, `~/.config/gh`, `~/.ssh`, `~/.gnupg`, `~/.tauri`, `~/.aws`, `~/.config/gcloud` | **Absents.** |
| Remote Git | HTTPS **sans identifiant embarqué**. |
| Config Git locale | Aucun `credential.helper`, aucune clé de signature. |
| Variables d'environnement du shell | Aucune variable sensible. |
| `.github/workflows` | Absent du dépôt local (aucun secret CI versionné). |
| `src-tauri/tauri.conf.json` | Aucun updater, aucune `pubkey`, aucun certificat (`certificateThumbprint: null`). |
| Traces askpass `/tmp` | Aucune. |

**Conclusion : le sandbox ne détient aujourd'hui aucune clé.** Toutes les actions du présent document sont externes au sandbox (consoles des services + poste propriétaire).

---

## 7. Fuites résiduelles de l'historique Git (inoffensives après révocation)

L'historique du dépôt privé `freemind25/ThesisFrame` (et l'historique local) contient :
- la **génération A** de la clé OpenAlex (commit externe `1359333` → purge `0543a4f` ; plus les citations dans les dossiers de preuves historiques, masqués depuis) ;
- la **génération A** de la clé APINex (`.env` historique, commits `04dc5ab`, `763ee5d`).

Ces valeurs deviennent **inoffensives dès la révocation prouvée** côté service. Conformément à la gouvernance (interdiction BFG/force-push/réécriture), **aucune correction d'historique ne sera entreprise** ; la seule mesure est la révocation (§4.1, §4.2). Les releases pré-audit v1.10.7/v1.10.8 ont été vérifiées propres à l'époque (construites après `0543a4f`) — elles restent **non destinées à une nouvelle diffusion** conformément à la directive (point 5).

---

## 8. Clés hors périmètre (aucune action requise)

- **18 clés IA optionnelles** listées dans `.env.example` (Anthropic, OpenAI, Gemini, Groq, Mistral, Cohere, Cerebras, NVIDIA, SiliconFlow, OpenRouter ×2, HuggingFace ×2, GitHub Models, Google, OmniRoute, RoutesMe, Kira) : **jamais résidentes** dans le sandbox ni le dépôt (audit T9 : un seul secret réel = OpenAlex, traité ci-dessus). Si le propriétaire les utilise en production desktop, elles restent sous sa seule garde — aucune exposition connue.
- **Z.ai / SDK interne** : clé gérée par la plateforme d'exécution, hors de portée du projet.
- **`DATABASE_URL`** : chemin de fichier SQLite local — non secret ; aucune credential de base de données n'existe (SQLite, aucun compte).
- **OAuth / Mendeley** : aucun (audit T12 négatif).
- **Clés de licence embarquées** : table `LicenseKey` vide (audit T9).

---

## 9. Ce qui ne sera pas fait sans autorisation écrite explicite

- Aucune rotation exécutée par l'agent (les rotations sont de toute façon des actions propriétaire sur les consoles des services) ;
- aucune écriture dans `.env`, aucune création de `.env.local` dans le sandbox, aucune utilisation de clé ;
- aucune vérification active d'API avec une clé ;
- aucune action sur les releases GitHub, aucun push, aucun commit ;
- toute exécution dépassant la préparation documentaire attendra l'accord écrit du propriétaire (directive vague 36, dernier alinéa).

**Accompagnement possible sur demande** : pendant les rotations propriétaire, l'agent peut exécuter en lecture seule les vérifications post-rotation (recherche de résidus, contrôles d'empreintes, relecture de preuves) sur instruction.
