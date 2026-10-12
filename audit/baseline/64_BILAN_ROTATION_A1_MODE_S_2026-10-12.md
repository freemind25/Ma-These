# 64 — BILAN DE LA ROTATION A1 (MODE S) — ÉTAT INTERMÉDIAIRE EN ATTENTE DES CONFIRMATIONS CONSOLE

- **Date** : 2026-10-12, ~17:55 UTC (vague 39)
- **Cycle** : `audit-final-v1.2`
- **Rédaction** : sous-agent Dev (consignation documentaire A1) — **aucune opération technique** sur le dépôt, les bases ou la configuration ; lecture seule.
- **Mode** : **S — « secrets jamais partagés »** (rappel absolu : **aucune valeur secrète, aucun fragment de clé (préfixe/suffixe), aucun token** — ni dans le présent document, ni dans le worklog, ni dans aucun message ; les SHA-256 des objets protégés sont des **empreintes de gel**, pas des secrets, et sont cités à ce titre).
- **Autorisation A1 en cours** (enregistrée, doc 62) : rotation des clés P1 compromises ou exposées — **K-1a/K-1b OpenAlex, K-2a/K-2b APINex, K-3/K-4/K-5 PAT GitHub** ; bilan à présenter au propriétaire avant de poursuivre.
- **Référence de suivi** : grille doc 63, **révision 1** — SHA-256 `74b8c1886d65ac41d199129b26d051280704592d2fd8b9427fe5099c9c63fdad` ; lignes G-1…G-8.
- **Rappel de répartition (prouvé, doc 62 §4)** : les révocations et générations sont des **actes du propriétaire aux consoles officielles** — l'agent n'a ni session de compte ni credential (prouvé : `ls-remote` sans identifiant en échec, aucun fichier d'identifiants résident) et ne les demandera jamais ; **l'agent consigne et vérifie** (résidus du sandbox, cohérence documentaire, bilan).

---

## 1. Périmètre et rôles (repris du protocole doc 62, inchangés)

- **Propriétaire** : consoles officielles (révocation + génération) **et** tests fonctionnels **au poste** (Mode S) — OpenAlex/APINex directement dans la console, PAT par `git ls-remote` au poste avec le token saisi au clavier ; transmission à l'agent des **résultats sans valeur** (statut, horodatage UTC, référence d'écran/ticket).
- **Agent** : consignation des preuves **non sensibles**, contrôles de résidus du sandbox (**lecture seule**), bilan A1 (présent document, puis version finale) — **présenté au propriétaire avant de poursuivre**.
- **Secrets jamais partagés** : aucune valeur ne quitte jamais le poste du propriétaire ; aucune valeur dans aucun document, worklog, canal visible ou message.
- **Règle inchangée** : toute valeur ayant transité en clair par la messagerie est réputée compromise → **re-rotation immédiate après usage** (doc 60 §5.1, doc 62 §5).
- **Hors périmètre A1** : tout le reste reste verrouillé jusqu'à autorisation écrite distincte (§8).

---

## 2. Référentiel des clés — AVANT → action requise → APRÈS (aucune valeur reproduite)

| ID | Service | Génération | Exposition documentée (réf. doc 60) | Statut AVANT | Action requise (grille 63) | Statut APRÈS | Date |
|---|---|---|---|---|---|---|---|
| K-1a | OpenAlex (`OPENALEX_API_KEY`) | Gén. A | En dur historiquement dans `src-tauri/src/lib.rs` l.221 (commits `1359333`→`0543a4f`, purgée du code depuis) ; historique Git + dossiers de preuves (masqués) | Dernier contrôle connu : **HTTP 200 — ACTIVE** | Révocation/régénération (G-5) | **EN ATTENTE de confirmation propriétaire** | — |
| K-1b | OpenAlex | Gén. B | Transmise par messagerie instantanée (2026-10-08) — compromise par transport ; disparue du sandbox au rollback 12:57 UTC | **Compromise par transport**, non résidente | Couverte par la régénération (G-5) | **EN ATTENTE de confirmation propriétaire** | — |
| K-2a | APINex (`APINEX_API_KEY`) | Gén. A | `.env` historique (commits `04dc5ab`, `763ee5d`, dépôt privé) | Exposée — révocation **non prouvée** | Révocation/régénération (G-6 — cadre doc 40 §3) | **EN ATTENTE de confirmation propriétaire** | — |
| K-2b | APINex | Gén. B | Transmise par chat (session rotation-cles) — compromise par transport ; perdue au rollback | **Compromise par transport**, non résidente | Idem (G-6) | **EN ATTENTE de confirmation propriétaire** | — |
| K-3 | PAT GitHub (compte `freemind25`) | Gén. 2 | Transmise **en clair par messagerie** ; valide (scopes `repo`, `workflow`) ; utilisée pour push/releases | **Compromise — à révoquer impérativement** | **RÉVOCATION IMPÉRATIVE** (G-1) | **EN ATTENTE de confirmation propriétaire** | — |
| K-4 | PAT GitHub | Gén. 3 | Transmise par chat ; opérationnelle à l'émission | Opérationnelle — à remplacer | Remplacement par **fine-grained minimal** (G-3) | **EN ATTENTE de confirmation propriétaire** | — |
| K-5 | PAT GitHub | Gén. 1 | Transmise par chat ; rejetée par l'API (HTTP 401) | **Invalide** (401) | Suppression d'hygiène si encore listée (G-2) | **EN ATTENTE de confirmation propriétaire** | — |

- **Aucune valeur secrète ne figure dans ce tableau ni dans le présent document** (Mode S) — seuls : identifiants symboliques, services, générations, localisations et statuts.
- **Aucun statut APRÈS n'est anticipé** : la colonne ne sera renseignée qu'à réception des confirmations non sensibles du propriétaire (jamais avant).
- Repère de numérotation : les libellés K-3/K-4/K-5 suivent le **doc 60** (K-3 = gén. 2, K-4 = gén. 3, K-5 = gén. 1) ; le modèle du doc 62 §7 libelle différemment les mêmes générations — les **générations et leurs actions** (révocation impérative de la gén. 2, remplacement de la gén. 3, hygiène de la gén. 1) font foi et sont identiques dans tous les documents.

---

## 3. Point de vigilance du propriétaire — TRAITÉ (vague 39)

Permissions réellement nécessaires vérifiées **sur le dépôt réel** (lecture seule) :

- **(a)** Le dépôt ne contient **AUCUN workflow CI** (dossier `.github` inexistant — vérifié 17:35 UTC par balayage) → permissions **Actions** et **Workflows NON accordées** au remplaçant (correction G-3, révision 1 de la grille 63).
- **(b)** Remote HTTPS `github.com/freemind25/ThesisFrame.git` **sans identifiant enclavé**.
- **(c)** Jeu minimal retenu pour le remplaçant fine-grained (G-3 rév. 1) : **Metadata (automatique) + Contents read/write** — l'écriture est justifiée **uniquement** par la poussée du candidat d'audit prévue APRÈS dégel (hors A1, verrouillée sur autorisation écrite) ; une alternative **read-only strict** est possible mais imposerait la création d'un nouveau token au moment de la poussée.
- **(d)** Portée limitée au **dépôt unique**, **expiration ≤ 90 jours**, toutes les autres permissions : **aucune**.

---

## 4. Usage des clés dans le code — vérifié EN LECTURE SEULE (vague 39)

| Fichier | Constat |
|---|---|
| `src/lib/research/openalex.ts` l.14 | `OPENALEX_API_KEY` consommée **uniquement via variable d'environnement** (`process.env.OPENALEX_API_KEY`), passée en paramètre `api_key` si présente — aucune valeur littérale |
| `src/lib/apinex/apinex-client.ts` l.7-10 | `APINEX_API_KEY` + `APINEX_BASE_URL` idem (variables d'environnement, côté serveur uniquement) ; en-tête `Authorization: Bearer` construit à l'exécution |
| `src-tauri/src/lib.rs` l.221-230 | **Aucune clé codée en dur** — simple boucle de transmission des variables d'environnement (`OPENALEX_API_KEY`, `CORE_API_KEY`) au process Next.js, sans les écraser |

- **Sans clé OpenAlex** : quota anonyme + **bascule automatique CrossRef/HAL** (mécanisme A.2, prouvé).
- **APINex** : fournisseur **optionnel** avec bascule vers les autres fournisseurs configurés.

**Conclusion** : **aucune valeur secrète résidente dans le code** ; les nouvelles clés s'installeront **au poste** (G-7 — variable système ou `.env.local` chmod 600 hors dépôt), **jamais dans le dépôt** ni dans le sandbox.

---

## 5. Vérifications agent-side (17:34-17:40 UTC, lecture seule)

**Gel conforme ×4** :

| Objet protégé | SHA-256 (empreinte de gel) | Taille / mtime |
|---|---|---|
| `custom.db` | `756c01587cc54a25db37c2f099266506aa01ffcff440870a61b43e441b38126d` | 265 330 688 o — mtime 10-11 06:45 |
| `urbanisme-test.db` | `6b72e1dce93c4e94830639523cd14fad6600e018884f02b85aef4c10e9a65fb8` | 622 592 o — mtime 10-11 20:52 |
| Sauvegarde pre-resync `audit/baseline/evidence/backups/urbanisme-test-avant-resync-20261011T091500Z.db` | `16f3c3f4b42cdcaa1be1235ec593ff6beda3fbea6ed8104803ac0eb5a7584ae5` | 552 960 o |
| `repo.tar` (`/home/sync/repo.tar`) | `cb7e5eab704210d41a58b2e1b194907fe9da2d1b4369fc3344579c8133ee9272` | 489 210 576 o — mtime 10-11 23:49:09 **INCHANGÉ** |

**Git** :

- HEAD `f7f3816` (17:15:15 — capture doc 63 + worklog vague-38) ← `0c726a3` (17:12) ← `2d70492` (17:03 — capture docs 60-61).
- Arbre propre au moment des mesures (`status --porcelain` = 0) ; tags `v1.10.7`/`v1.10.8` uniquement.
- *Précision de consignation* : depuis ces mesures, la **révision 1 du document 63** (17:45 UTC) constitue la seule différence de l'arbre de travail à la date du présent bilan — modification documentaire attendue, sans lien avec les clés et **sans effet sur le gel** (aucun objet protégé touché).

**Scan résiduel (zéro secret côté sandbox)** :

- `.env.local`, `~/.git-credentials`, `~/.netrc`, `~/.ssh`, `~/.gnupg`, `~/.config/gh`, `~/.aws`, `~/.tauri` — **tous ABSENTS**.
- Aucune variable d'environnement sensible par nom.
- `GIT_TERMINAL_PROMPT=0 git ls-remote origin` → « could not read Username » = **PREUVE zéro credential Git résident**.
- `gh` CLI absent.
- Aucun dépôt opérateur nouveau dans `/home/sync/upload/` (attente opérateur inchangée).

---

## 6. Impacts pendant la fenêtre de rotation (inchangés, doc 62)

| Service | Impact de la fenêtre de rotation | Couverture |
|---|---|---|
| OpenAlex | Fenêtre de quota anonyme entre la révocation et l'installation desktop (déjà en 429 sur certaines IPs) | Bascule automatique CrossRef/HAL (A.2, prouvée) — **dégradation de quota, pas de coupure** |
| APINex | Fournisseur optionnel temporairement indisponible | Bascule vers les autres fournisseurs configurés au poste |
| GitHub | **AUCUN impact pendant le gel** : aucun push (interdit), pas de workflow, releases déjà publiées non affectées par la révocation d'un PAT | Le prochain push (hors A1, autorisation écrite) utilisera le PAT renouvelé |
| Sandbox / audit | **Zéro impact** — aucune clé utilisée par aucun flux local | Preuve §5 (zéro secret résident) |

---

## 7. État des confirmations (honnête et daté)

- Grille 63 rév. 1 — statuts **G-1…G-8 TOUS « en attente »** à la date du présent bilan (~17:55 UTC).
- **AUCUNE révocation ni renouvellement confirmé** à ce stade ; aucun statut n'est anticipé.
- Le présent document 64 est le **bilan EN ÉTAT INTERMÉDIAIRE** : il sera finalisé (statuts, dates, références de preuve, impacts constatés) dès réception des retours **non sensibles** du propriétaire, puis **présenté AVANT toute reprise** d'une autre opération.

---

## 8. Prochaines étapes (ordre)

1. Le propriétaire exécute **G-1 → G-6** aux consoles (procédure doc 62 §6 — 5-10 minutes ; **ordre : révoquer la génération 2 d'abord**), puis, au choix, G-7 (installation desktop des nouvelles clés).
2. Retour des résultats **non sensibles** (grille remplie ou réponse libre — **jamais de valeur, jamais d'URL tokenisée** ; règles de confidentialité doc 63).
3. L'agent consigne, contrôle les résidus du sandbox et la cohérence documentaire (docs 40 §3, 57, 61), complète la grille et finalise le bilan.
4. **Bilan final présenté avant toute reprise** — conformément à l'autorisation A1.

**Hors A1** : tout reste **verrouillé** (restauration, R2, C2, fenêtre S1-S4, releases, build, déploiement) jusqu'à autorisation écrite distincte.

---

*Bilan établi sans aucune valeur secrète — Mode S.*
