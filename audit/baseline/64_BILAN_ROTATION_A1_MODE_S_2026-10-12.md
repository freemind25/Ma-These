# 64 — BILAN DE LA ROTATION A1 (MODE S) — RÉVISION 3 : CADRE AU CAS PAR CAS, DÉCISIONS EN ATTENTE D'ACCORD

- **Date** : 2026-10-12, ~18:55 UTC (vague 42)
- **Cycle** : `audit-final-v1.2`
- **Rédaction** : sous-agent Dev (consignation documentaire A1) — **aucune opération technique** sur le dépôt, les bases ou la configuration ; lecture seule.
- **Révision 3** (~18:55 UTC, vague 42) : la rév. 2 (~18:20 UTC) est **remplacée** — corrections factuelles ciblées uniquement (erratum vague 42 : workflow CI présent ; précision `.env`) ; cadre, classification, matrice et décisions D-1…D-5 **INCHANGÉS** ; historique des rév. 1/2 conservé au worklog (vague-39-t4, vague-41-t4).
- **NOUVEAU CADRE (directive propriétaire ~18:00 UTC)** : Ma Thèse est une **application privée à usage personnel** → **pas de rotation systématique**. Chaque clé est traitée **au cas par cas** : **AUCUNE révocation ni génération sans accord explicite du propriétaire** (décisions D-1…D-5, §2-§3). Objectif : **sécuriser et faire fonctionner l'application personnelle, sans opérations inutiles ni interruption de service**. L'autorisation A1 en bloc (doc 62) est **REMPLACÉE** par un régime d'**approbation explicite par clé**.
- **Référence de suivi** : grille doc 63, **révision 3** — SHA-256 `ae4083e1b7461a134eac66c45e53e63c7d40cca20e343077c8eade685cecb338` ; classification CG-1/CG-2/CG-3, décisions D-1…D-5 **en attente d'accord**, vérifications console VS-1…VS-3, grille d'exécution G-1…G-8 **INACTIVE sans accord**.
- **Mode** : **S — « secrets jamais partagés »** (rappel absolu : **aucune valeur secrète, aucun fragment de clé (préfixe/suffixe), aucun token** — ni dans le présent document, ni dans le worklog, ni dans aucun message ; les SHA-256 des objets protégés sont des **empreintes de gel**, pas des secrets, et sont cités à ce titre).
- **Gel re-mesuré 18:47 UTC conforme ×4** (`custom.db` `756c0158…8126d` · `urbanisme-test.db` `6b72e1dc…65fb8` · sauvegarde pre-resync `16f3c3f4…84ae5` · `/home/sync/repo.tar` `cb7e5eab…9272` mtime 23:49 inchangé — §6).
- **Git** : HEAD `696caf5` (18:15:42 — marqueurs plateforme documentaires : docs 63/64 + worklog) ← `8b095e3` (17:48) ← `f7f3816` (17:15), arbre propre à la mesure 18:47 UTC, tags `v1.10.7`/`v1.10.8` uniquement.
- **Zéro credential résident re-prouvé 18:47 UTC** : `GIT_TERMINAL_PROMPT=0 git ls-remote origin` → « could not read Username » (échec attendu) ; `.env` racine **gitignored, limité à `DATABASE_URL`** (aucune clé) ; `.env.local` **absent** (§6).

---

## 1. Cadre révisé et rôles

- **Changement décisif** : l'autorisation A1 **en bloc** (doc 62 — rotation des clés P1 compromises ou exposées) est **REMPLACÉE** par des **décisions D-1…D-5 à accorder une à une** (régime d'approbation explicite par clé). **Aucune ligne D-x accordée = aucune opération.**
- **Répartition des rôles (inchangée, prouvée)** : les révocations et générations sont des **actes exclusifs du propriétaire aux consoles officielles** (GitHub ne permet pas de révoquer un PAT personnel via un autre token ; `ls-remote` sans identifiant en échec re-prouve l'absence de credential côté agent) ; **l'agent vérifie (lecture seule), consigne et documente** — il n'a ni session de compte ni credential et ne les demandera jamais.
- **Mode S inchangé** : aucune valeur ne quitte le poste du propriétaire ; aucune valeur dans aucun document, worklog, canal visible ou message.
- **Règle inchangée (caractérisation)** : toute valeur ayant transité **en clair par messagerie/chat est réputée compromise**. **Ce qui change** : la **DÉCISION d'action** n'est plus une re-rotation systématique — elle passe désormais par un **accord explicite, clé par clé** (D-1…D-5), au regard de l'utilité réelle, de l'exposition et du risque (§3).
- **Hors périmètre A1** : tout le reste reste verrouillé jusqu'à autorisation écrite distincte (§9).

---

## 2. Classification des clés (règle propriétaire n° 1 : historique passif ≠ exposition active établie)

Reprise de la grille 63 rév. 2 — trois groupes :

| Groupe | Clés | Caractérisation |
|---|---|---|
| **CG-1 — Exposition active + validité établie** | K-3 (PAT gén. 2) | Transmise **en clair par messagerie** ET **valide** — le seul couple exposition+validité établi de manière certaine |
| **CG-2 — Historique passif du dépôt privé** | K-1a (OpenAlex gén. A, purgée du code), K-2a (APINex gén. A, `.env` historique) | Valeurs présentes dans l'historique Git du **dépôt privé** (purgées du code actuel) — pas de transmission par canal tiers documentée ; validité actuelle à confirmer en console |
| **CG-3 — Compromission par transport, validité inconnue ou nulle** | K-1b, K-2b (gén. B IM/chat, disparues au rollback — non résidentes), K-4 (PAT gén. 3, chat, opérationnelle à l'émission), K-5 (PAT gén. 1, chat, 401) | Exposition par transport établie ; validité actuelle inconnue ou nulle — à établir en console avant toute décision |

---

## 3. Matrice par clé (règle propriétaire n° 2 : une décision propre à chaque clé)

*Aucune valeur secrète ne figure dans ce tableau ni dans le présent document (Mode S) — seuls : identifiants symboliques, services, générations, localisations et statuts. Aucun statut APRÈS n'est anticipé.*

| ID | Utilité réelle | Exposition | Validité actuelle (connue/à confirmer) | Risque associé | Conséquences d'une révocation | Décision proposée (D-x) | État |
|---|---|---|---|---|---|---|---|
| **K-3** (PAT GitHub gén. 2) | **Aucune pendant le gel** (aucun push autorisé) ; servait aux push/releases | Transmise **EN CLAIR par messagerie** | **VALIDE** (établie) | **ÉLEVÉ et réel** : quiconque a eu accès à la messagerie peut pousser/taguer/publier sur le dépôt privé — **menace directe sur l'intégrité de la lignée d'audit** | **AUCUNE interruption de l'application** (aucun usage runtime — vérifié vague 39) ; seules de futures opérations Git passeront par le remplaçant fine-grained (G-3) au moment utile | **D-1** — révocation **recommandée**, présentée séparément (§4), **SANS exécution** | En attente d'accord |
| **K-1a** (OpenAlex gén. A) | Quota supérieur OpenAlex pour recherche/veille/journaux-oa/citation-check ; **l'application fonctionne SANS clé** (quota anonyme + bascule automatique CrossRef/HAL — mécanisme A.2 prouvé) | Historique Git du **dépôt PRIVÉ** (valeur purgée du code actuel, commits `1359333`→`0543a4f`) + dossiers de preuves (masqués) | Dernier contrôle consigné **HTTP 200 ACTIVE** (antérieur — **à re-confirmer** en console VS-1) | **FAIBLE à modéré** : historique non public, app mono-utilisateur, aucun vecteur public documenté ; BFG interdit de toute façon et **la rotation ne purgerait pas l'historique** | Bascule CrossRef/HAL (**pas de coupure**, quota réduit) | **D-2** — **CONSERVATION** + vérification VS-1 | En attente d'accord |
| **K-2a** (APINex gén. A) | Fonctions IA via APINex (models/chat/web-search/balance) — fournisseur **OPTIONNEL** avec bascule (`apinex-client.ts` : `getApinexApiKey()` nullable) | `.env` **historique** du dépôt PRIVÉ (commits `04dc5ab`/`763ee5d`) | **Révocation non prouvée** — à confirmer (VS-2, cadre doc 40 §3) | **FAIBLE à modéré** (idem K-1a) | Fournisseur optionnel temporairement indisponible (**bascule**) | **D-2** — **CONSERVATION** + VS-2 | En attente d'accord |
| **K-1b** (OpenAlex gén. B) | **Aucune résidente** (disparue au rollback 12:57 UTC) | Transmise par IM (**compromission par transport**) | **INCONNUE** côté service | Dépend de la validité — **à établir par VS-1** (si une clé correspondante apparaît active) | **Nulles** si non listée | **D-3** — vérification console **uniquement** ; si « Non listée » → **clôture sans opération** ; si active → décision ponctuelle séparée | En attente d'accord |
| **K-2b** (APINex gén. B) | Idem K-1b : **aucune résidente** (perdue au rollback) | Transmise par chat (**compromission par transport**) | **INCONNUE** côté service | Dépend de la validité — **à établir par VS-2** (cadre doc 40 §3) | **Nulles** si non listée | **D-3** — idem K-1b (VS-2, cadre doc 40 §3) | En attente d'accord |
| **K-4** (PAT GitHub gén. 3) | Opérations Git **au poste** (si le propriétaire en effectue) | Transmise par **chat** | Opérationnelle à l'émission — **à confirmer** (VS-3) | **Modéré** (transport) mais usage supposé légitime | Interruption des opérations Git du poste qui l'utilisent ; **remplacement planifié** (fine-grained G-3, jeu minimal : **Metadata + Contents read/write, pas d'Actions ; Workflows non accordée par défaut** — erratum vague 42 : un workflow CI existe, `.github/workflows/build-desktop.yml`, il s'exécute via le `GITHUB_TOKEN` automatique et ne requiert aucune permission PAT ; la permission fine-grained « Workflows » ne serait nécessaire que si la poussée prévue modifie des fichiers de workflow ; dépôt unique, expiration ≤ 90 j) | **D-4** — **CONSERVATION** jusqu'au remplacement planifié **au moment utile** (dégel/poussée) + VS-3 | En attente d'accord |
| **K-5** (PAT GitHub gén. 1) | **Aucune** (401 invalide) | Transmise par **chat** | **NULLE** (401 établi) | **NUL** (ne peut rien faire) | **Aucune** | **D-5** — suppression d'hygiène **optionnelle**, **sans urgence** | En attente d'accord |

- Repère de numérotation : les libellés K-3/K-4/K-5 suivent le **doc 60** (K-3 = gén. 2, K-4 = gén. 3, K-5 = gén. 1) — les générations et leurs caractérisations font foi et sont identiques dans tous les documents.

---

## 4. CAS SÉPARÉ — PAT GitHub génération 2 (règle propriétaire n° 4, sans exécution)

Fiche dédiée à la seule clé du groupe CG-1 — **aucune exécution, décision conditionnée à l'accord explicite D-1** :

- **Risque** : token **VALIDE** transmis **en clair** — quiconque a eu accès à la messagerie peut y recourir pour **insérer des commits/tags/releases falsifiés** sur le dépôt privé, donc **contaminer la lignée d'audit** (chaîne de preuves du cycle `audit-final-v1.2`).
- **Recommandation** : **RÉVOCATION**, idéalement **AVANT toute reprise des push** — pour que la poussée du candidat d'audit se fasse avec un **token propre**.
- **Conséquences** : **aucune interruption de service de l'application** (le PAT ne participe à aucun flux runtime — vérifié vague 39) ; **aucune opération Git en cours pendant le gel** (aucun push autorisé).
- **Exécution** : conditionnée à l'accord explicite **D-1**, ligne **G-1** de la grille 63 rév. 2 — acte du propriétaire à la console GitHub, l'agent consignant le retour non sensible.
- **Remplaçant éventuel (G-3)** : ne serait **créé qu'au moment utile** (D-4 — dégel/poussée du candidat), conformément au principe **« sans opérations inutiles »** — aucune génération préventive.

---

## 5. Vérifications console de statut (règles n° 1 et 5 — lecture seule, côté propriétaire)

Ces vérifications **établissent les faits sans rien modifier** — retours **non sensibles uniquement** (jamais de valeur, jamais de fragment, jamais d'URL tokenisée) :

| ID | Console | Ce que vous regardez | Retour non sensible attendu |
|---|---|---|---|
| **VS-1** | OpenAlex → paramètres → API | Statut de la clé (active/inactive) + dernière activité | « Active — dernière utilisation jj/mm » ou « inactive » + horodatage |
| **VS-2** | Console APINex → gestion des clés | Statut des clés listées + activité (cadre doc 40 §3) | Statut par clé (sans valeur) + horodatage |
| **VS-3** | GitHub → Settings → Developer settings → PAT | Les 3 générations : présentes/absentes + « Last used » | « gén. 2 : présente, last used jj/mm » ; « gén. 3 : … » ; « gén. 1 : absente » + horodatage |

Ces retours alimentent la colonne « Validité actuelle » de la matrice §3 et éclairent les décisions D-2/D-3/D-4 — sans déclencher aucune opération par eux-mêmes.

---

## 6. Vérifications agent re-mesurées (vague 42, 18:47 UTC, lecture seule)

**Gel conforme ×4** (empreintes de gel — pas des secrets) :

| Objet protégé | SHA-256 (empreinte de gel) | Taille / mtime |
|---|---|---|
| `custom.db` | `756c01587cc54a25db37c2f099266506aa01ffcff440870a61b43e441b38126d` | 265 330 688 o |
| `urbanisme-test.db` | `6b72e1dce93c4e94830639523cd14fad6600e018884f02b85aef4c10e9a65fb8` | 622 592 o |
| Sauvegarde pre-resync `audit/baseline/evidence/backups/urbanisme-test-avant-resync-20261011T091500Z.db` | `16f3c3f4b42cdcaa1be1235ec593ff6beda3fbea6ed8104803ac0eb5a7584ae5` | 552 960 o |
| `repo.tar` (`/home/sync/repo.tar`) | `cb7e5eab704210d41a58b2e1b194907fe9da2d1b4369fc3344579c8133ee9272` | 489 210 576 o — mtime 10-11 23:49:09 **INCHANGÉ** |

**Git** :

- HEAD `696caf5` (18:15:42 — marqueurs plateforme documentaires : rév. 2 grille 63 + doc 64 rév. 2 + worklogs) ← `8b095e3` (17:48) ← `f7f3816` (17:15).
- **Arbre propre** à la mesure 18:47 UTC ; tags `v1.10.7`/`v1.10.8` uniquement.
- *Précision de consignation* : depuis la mesure 18:47 UTC, les seules différences de l'arbre de travail sont **documentaires** — la **rév. 3 de la grille 63** et le **présent doc 64 rév. 3** — sans aucun objet protégé touché, **sans effet sur le gel**.

**Zéro credential résident (re-prouvé 18:47 UTC)** :

- `.env` racine **PRÉSENT mais gitignored** (`.gitignore` l.34) et limité à la variable `DATABASE_URL` (chemin de base SQLite) — **aucune clé, aucun secret** ; `.env.local` **ABSENT** ; `GIT_TERMINAL_PROMPT=0 git ls-remote origin` → « could not read Username » = **preuve zéro credential Git résident**.

**ERRATUM vague 42 — précisions factuelles (sans effet sur les décisions)** :

1. **Workflow CI présent** : `.github/workflows/build-desktop.yml` est tracké et ancêtre du HEAD courant (commits `cfa3377` → `c9a05e8`) ; le constat vague 39 « `.github/` inexistant » était **erroné**. Le workflow ne référence que `secrets.GITHUB_TOKEN` (token automatique d'Actions), aucun PAT, aucune valeur en dur (vérifié 18:48 UTC, lecture seule). Conséquences : la justification de G-3 est corrigée (grille 63 rév. 3 — Workflows « non par défaut », requis seulement si la poussée prévue modifie des fichiers de workflow) ; après un éventuel dégel, une poussée pourrait déclencher le build desktop via le `GITHUB_TOKEN` automatique — **sans rapport avec les clés K-1…K-5 ni avec les décisions D-1…D-5**.
2. **`.env` racine** : les relevés antérieurs (vagues 39-41) citaient `.env.local` absent ; le relevé vague 42 complète : `.env` présent, gitignored, ne contenant que `DATABASE_URL` — la preuve « zéro résidence de clé » **demeure**.

**Usage des clés dans le code — re-confirmé (env-only, aucune valeur en dur)** :

| Fichier | Constat |
|---|---|
| `src/lib/research/openalex.ts` l.14 | `OPENALEX_API_KEY` consommée **uniquement via variable d'environnement** — aucune valeur littérale |
| `src/lib/apinex/apinex-client.ts` l.7-10 | `APINEX_API_KEY` + `APINEX_BASE_URL` idem (variables d'environnement, côté serveur uniquement) |
| `src-tauri/src/lib.rs` l.221-230 | **Aucune clé codée en dur** — simple boucle de transmission des variables d'environnement au process Next.js, sans les écraser |

---

## 7. État des décisions (honnête et daté)

- Décisions **D-1…D-5 : TOUTES « en attente d'accord »** à la date du présent bilan (~18:55 UTC).
- **AUCUNE révocation ni génération exécutée** — ni par l'agent (qui n'en a ni le droit ni le moyen), ni confirmée côté propriétaire.
- Les vérifications console **VS-1…VS-3 sont proposées mais non réalisées** à ce stade ; aucun de leurs retours n'est reçu.
- Le présent bilan sera **mis à jour à chaque accord** (D-x) et **à réception des retours non sensibles** (VS-x / G-x) — jamais anticipé, toujours daté.

---

## 8. Impacts si accord (inchangés, doc 62)

Objectif transversal du nouveau cadre : **« sans interruption de service »** — respecté dans **toutes** les options proposées :

| Service | Impact si la décision correspondante est accordée | Couverture |
|---|---|---|
| OpenAlex | Bascule **A.2** — **dégradation de quota, pas de coupure** (quota anonyme + CrossRef/HAL automatiques) | Mécanisme A.2 prouvé |
| APINex | Fournisseur **optionnel** temporairement indisponible (**bascule** vers les autres fournisseurs configurés) | `apinex-client.ts` nullable, prouvé |
| GitHub | **AUCUN impact pendant le gel** : aucun push (interdit), pas de workflow, releases déjà publiées non affectées par une révocation de PAT | État de gel prouvé §6 |
| Sandbox / audit | **Zéro impact** — aucune clé utilisée par aucun flux local | Preuve §6 (zéro secret résident) |

---

## 9. Prochaines étapes (ordre)

1. **Propriétaire** : accord ou refus **par décision** (D-1…D-5, une à une) + vérifications console **VS-1…VS-3** (lecture seule).
2. **Retours non sensibles** : statuts, horodatages, références d'écran — **jamais de valeur, jamais de fragment, jamais d'URL tokenisée** (règles de confidentialité, grille 63 rév. 2).
3. **Agent** : consignation + mise à jour du présent bilan + contrôle des résidus du sandbox + cohérence documentaire (docs 40 §3 / 57 / 61).
4. **Bilan final présenté avant toute reprise** d'une autre opération.

**Hors A1** : tout reste **verrouillé** (restauration, R2, C2, fenêtre S1-S4, releases, build, déploiement) jusqu'à autorisation écrite distincte.

---

*Bilan révision 3 établi sans aucune valeur secrète — Mode S. Aucune opération sans accord explicite.*
