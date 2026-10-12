# 63 — GRILLE DE SUIVI DES RÉVOCATIONS ET RENOUVELLEMENTS — ROTATION A1, MODE S

- **Date** : 2026-10-12, 17:14 UTC (vague 38)
- **Cycle** : `audit-final-v1.2`
- **Mode retenu par le propriétaire** : **S — secrets jamais partagés**. Aucune clé secrète ne doit être transmise dans le chat, dans un fichier partagé ni dans le worklog. L'agent ne demandera ni ne récupérera aucun secret.
- **Rôle propriétaire** : révocations et renouvellements via vos sessions de compte (consoles officielles), tests fonctionnels à votre poste.
- **Rôle agent** : consignation des preuves non sensibles à réception, bilan final A1 (document 64), présentation avant toute reprise d'une autre opération.
- **Périmètre verrouillé** : aucune opération hors A1 ; gel intégral maintenu (dépôt, bases, artefacts protégés).
- **Révision 1 — 2026-10-12, 17:45 UTC (vague 39)** : point de vigilance du propriétaire traité — permissions du remplaçant PAT vérifiées sur le dépôt réel (G-3 corrigée : **Actions et Workflows NON accordées**, aucun workflow CI dans le dépôt) ; relevé 17:34-17:40 UTC : **aucun statut confirmé** — les colonnes « à remplir » restent vides et ne seront renseignées qu'à réception de vos confirmations (jamais anticipées) ; gel re-mesuré conforme ×4 (custom.db `756c0158…8126d` · urbanisme-test.db `6b72e1dc…65fb8` · sauvegarde pre-resync `16f3c3f4…84ae5` · repo.tar `/home/sync/repo.tar` `cb7e5eab…9272`, mtime 23:49 inchangé) ; zéro clé résidente re-prouvé (`ls-remote` sans credential en échec, `.env.local`/`.git-credentials`/`.ssh`/`.config/gh` absents, aucune variable d'environnement sensible).

---

## Règles de confidentialité pour vos retours (impératives)

1. **Jamais** la valeur d'une clé, d'un token, ni aucun fragment (préfixe, suffixe, début/fin).
2. **Captures d'écran** : recadrer ou masquer toute valeur visible avant transmission ; un écran de statut suffit.
3. **Jamais** d'URL contenant un token.
4. Suffisent : statut (« effectué »), horodatage UTC, nom symbolique d'un token, référence de ticket/écran, message d'erreur **sans** le secret.
5. Vous pouvez remplir la grille ci-dessous et me la renvoyer telle quelle, ou répondre librement étape par étape — les colonnes « à remplir » sont les seules informations dont j'ai besoin.
6. Statuts admis : `Effectué` · `Non listé (déjà absent)` · `Reporté — motif` · `Échec — motif`.

---

## Grille principale — 8 lignes à compléter

| ID | Étape | Console / lieu | Ce que vous faites | Preuve non sensible attendue | Statut *(à remplir)* | Date-Heure UTC *(à remplir)* | Référence capture/ticket *(à remplir)* | Impact constaté *(à remplir)* |
|---|---|---|---|---|---|---|---|---|
| **G-1** | **GitHub — révocation de la génération 2** (impératif — transmise en clair par messagerie) | github.com → Settings → Developer settings → Personal access tokens (classiques) | Révoquer le token concerné | « Révocation effectuée » + horodatage | | | | |
| **G-2** | GitHub — suppression de la génération 1 (invalide, hygiène) | Même écran | Supprimer si encore listée | « Supprimée » **ou** « Non listée (déjà absente) » | | | | |
| **G-3** | GitHub — création du remplaçant fine-grained de la génération 3 | github.com → Settings → Developer settings → Fine-grained tokens | Restreindre au seul dépôt `freemind25/ThesisFrame` ; **permissions minimales vérifiées (rév. 1)** : Metadata (auto) + **Contents read/write** — justifiées par la poussée du candidat prévue après dégel (sinon read-only strict, mais alors nouveau token à la poussée) ; **Actions : non** · **Workflows : non** (aucun workflow CI dans le dépôt — vérifié vague 39, `.github/` inexistant) ; toutes les autres permissions : aucune ; **expiration ≤ 90 jours** | Nom symbolique donné au token (pas sa valeur) + date d'expiration choisie | | | | |
| **G-4** | GitHub — test réel de la chaîne Git au poste | Terminal au poste : `git ls-remote https://github.com/freemind25/ThesisFrame.git` avec le nouveau token (saisi au clavier) | Vérifier que la liste des refs s'affiche | Résultat : « vert — refs affichées » **ou** message d'erreur **sans** le token + horodatage | | | | |
| **G-5** | **OpenAlex — régénération** (invalide de fait les générations A et B) | openalex.org → paramètres → API | Régénérer la clé ; vérifier en console que l'ancienne n'est plus active | Statut console : « ancienne inactive / nouvelle active » + horodatage | | | |
| **G-6** | **APINex — révocation + régénération** (cadre doc 40 §3) | Console APINex → gestion des clés | Révoquer l'ancienne ; générer la nouvelle | Justificatif (référence ticket/écran) + horodatage | | | |
| **G-7** *(optionnel mais recommandé)* | Installation desktop des nouvelles clés OpenAlex/APINex | Poste propriétaire : variable système ou `.env.local` local (hors dépôt) | Installer les valeurs au poste (jamais dans le dépôt ni ici) | « Installée(s) » + date (sans valeur) | | | |
| **G-8** | Impacts constatés pendant la fenêtre (OpenAlex / APINex / GitHub) | Observation à votre poste | Renseigner une ligne par service | « Aucun » ou description brève | | | — |

---

## Ce que j'exécuterai à réception de vos résultats (mode S)

1. **Consignation** : remplir le bilan final (document 64) — statuts, dates, références de preuve, vérifications fonctionnelles, impacts — **sans aucune valeur**.
2. **Contrôle de résidus du sandbox** (lecture seule) : re-mesure des empreintes des objets protégés, `git ls-remote` sans credential (échec attendu), absence de `.env.local`/`.git-credentials`/traces askpass, aucune variable d'environnement sensible — preuve que la rotation n'a laissé aucun secret résident.
3. **Vérification de cohérence documentaire** : rapprochement avec le doc 40 (condition APINex §3), le registre de blocages (doc 57 : B-sécurité), le doc 61 (statut A1 → clôturé).
4. **Présentation du bilan final A1 avant toute reprise** — conformément à votre directive ; aucune autre opération ne sera lancée.

---

## Rappels d'état (inchangés)

- Gel intégral maintenu : empreintes `custom.db` `756c0158…8126d`, `urbanisme-test.db` `6b72e1dc…65fb8`, `repo.tar` `cb7e5eab…9272` conformes (dernière mesure 17:10 UTC) ; arbre propre ; tags `v1.10.7`/`v1.10.8` inchangés ; marqueur plateforme `0c726a3` (17:12) a capturé le doc 62.
- Attente opérateur Git : **aucun dépôt nouveau** dans `/home/sync/upload/` (vérifié 17:14 UTC) — double déclencheur inchangé.
- Hors périmètre A1 : tout reste verrouillé (restauration, R2, C2, fenêtre S1-S4, releases, build, déploiement) jusqu'à autorisation écrite distincte.

---

*Grille de suivi — aucun secret ne doit y figurer. L'agent n'exécutera aucun acte de rotation et n'accédera à aucune valeur.*
