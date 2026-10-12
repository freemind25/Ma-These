# 63 — SUIVI DE LA ROTATION A1, MODE S — CADRE RÉVISÉ : DÉCISIONS AU CAS PAR CAS (RÉV. 2)

- **Date** : 2026-10-12, ~18:15 UTC (vague 41)
- **Cycle** : `audit-final-v1.2`
- **NOUVEAU CADRE (directive propriétaire ~18:00 UTC)** : Ma Thèse est une **application privée à usage personnel** → **pas de rotation systématique**. Chaque clé est traitée au cas par cas : **AUCUNE révocation ni génération sans accord explicite du propriétaire**, décision par décision (D-1…D-5 ci-dessous). Objectif : sécuriser et faire fonctionner l'application personnelle, **sans opérations inutiles ni interruption de service**.
- **Conséquence sur l'autorisation A1 initiale** : l'autorisation de rotation en bloc (doc 62) est REMPLACÉE par le régime d'approbation explicite par clé. Les lignes d'exécution G-1…G-8 restent consignées mais sont **INACTIVES** tant que les décisions correspondantes ne sont pas accordées.
- **Mode inchangé** : **S — secrets jamais partagés**. Aucune valeur secrète ne transite par le chat, un fichier partagé ni le worklog ; l'agent ne demande ni ne récupère aucun secret.
- **Rôles inchangés** : le propriétaire est le seul à agir sur les consoles ; l'agent vérifie (lecture seule), consigne et documente.
- **Gel intégral maintenu** (re-mesuré 18:08 UTC : `custom.db` `756c0158…8126d` · `urbanisme-test.db` `6b72e1dc…65fb8` · sauvegarde pre-resync `16f3c3f4…84ae5` · `/home/sync/repo.tar` `cb7e5eab…9272` mtime 23:49 inchangé ; HEAD `8b095e3`, arbre propre, tags `v1.10.7`/`v1.10.8` uniquement ; zéro credential résident re-prouvé).
- **Historique des révisions** : rév. 1 (17:45 UTC, vague 39) — G-3 corrigée (permissions minimales vérifiées, ni Actions ni Workflows), SHA `74b8c188…63fdad` ; rév. 2 (18:15 UTC, vague 41) — présente version (cadre cas par cas).

---

## Règles de confidentialité pour vos retours (impératives, inchangées)

1. **Jamais** la valeur d'une clé, d'un token, ni aucun fragment (préfixe, suffixe, début/fin).
2. **Captures d'écran** : recadrer ou masquer toute valeur visible ; un écran de statut suffit.
3. **Jamais** d'URL contenant un token.
4. Suffisent : statut, horodatage UTC, nom symbolique, référence d'écran/ticket, message d'erreur **sans** le secret.
5. Statuts admis : `Effectué` · `Non listé (déjà absent)` · `Reporté — motif` · `Échec — motif` · `Non pertinent (clé conservée)`.

---

## 1. Classification des clés (règle propriétaire n° 1 : historique passif ≠ exposition active établie)

| Groupe | Clés | Caractérisation |
|---|---|---|
| **CG-1 — Exposition active + validité établie** | K-3 (PAT GitHub gén. 2) | Transmise **en clair par messagerie** ET **valide** (push/releases) — le seul couple exposition+validité établi de manière certaine |
| **CG-2 — Historique passif du dépôt privé** | K-1a (OpenAlex gén. A), K-2a (APINex gén. A) | Valeurs présentes dans l'historique Git du **dépôt privé** (purgées du code actuel) — pas de transmission par canal tiers documentée ; validité actuelle à confirmer en console |
| **CG-3 — Compromission par transport, validité inconnue** | K-1b, K-2b (gén. B IM/chat, disparues au rollback — non résidentes), K-4 (PAT gén. 3, chat, opérationnelle à l'émission), K-5 (PAT gén. 1, chat, 401) | Exposition par transport établie ; validité actuelle inconnue ou nulle — à établir en console avant toute décision |

---

## 2. Décisions proposées — EN ATTENTE DE VOTRE ACCORD (aucune exécution sans coche)

| ID | Clé(s) | Décision proposée | Justification synthétique | Conséquence de service | Votre accord *(à cocher)* |
|---|---|---|---|---|---|
| **D-1** | K-3 (PAT gén. 2) | **Révocation recommandée** — présentée séparément (règle n° 4), exécution uniquement sur votre accord explicite | Seule clé à risque réel établi : valide ET transmise en clair — quiconque a eu accès à la messagerie peut pousser/taguer/publier sur le dépôt | **Aucune interruption** : le PAT ne participe pas au runtime de l'application ; seules de futures opérations Git passeront par le remplaçant (D-4/G-3) au moment utile | ☐ |
| **D-2** | K-1a, K-2a | **Conservation** (pas de rotation) + vérification console de statut/activité (VS-1/VS-2) | Historique passif d'un dépôt privé, usage personnel ; l'application fonctionne sans ces clés (bascules prouvées) — la rotation n'est pas urgente si l'activité console est légitime | Aucune (clés conservées) | ☐ |
| **D-3** | K-1b, K-2b | **Vérification console uniquement** (VS-1/VS-2) ; si « Non listées » → clôture sans opération ; si actives → décision ponctuelle séparée | Disparues au rollback (non résidentes) ; validité côté service inconnue | Aucune pendant la vérification | ☐ |
| **D-4** | K-4 (PAT gén. 3) | **Conservation** jusqu'au remplacement planifié (fine-grained minimal G-3) **au moment utile** (dégel/poussée du candidat) + vérification d'usage en console (VS-3) | Remplacer maintenant créerait une opération inutile alors qu'aucun push n'est autorisé ; le remplacement reste planifié pour le moment où il servira réellement | Aucune | ☐ |
| **D-5** | K-5 (PAT gén. 1) | **Suppression d'hygiène optionnelle** lors d'une prochaine session console, **sans urgence** (invalide 401 : ne peut rien faire) | Hygiène de liste, zéro risque résiduel | Aucune | ☐ |

**Règle d'or** : aucune ligne D-x cochée = aucune opération. Chaque accord est valable pour LA SEULE décision cochée.

---

## 3. Vérifications console de statut (lecture seule, côté propriétaire, sans opération de rotation)

Ces vérifications établissent les faits (règles n° 1 et n° 5) sans rien modifier :

| ID | Console | Ce que vous regardez | Retour non sensible attendu |
|---|---|---|---|
| **VS-1** | OpenAlex → paramètres → API | Statut de la clé (active/inactive) + dernière activité | « Active — dernière utilisation jj/mm » ou « inactive » + horodatage |
| **VS-2** | Console APINex → gestion des clés | Statut des clés listées + activité (cadre doc 40 §3) | Statut par clé (sans valeur) + horodatage |
| **VS-3** | GitHub → Settings → Developer settings → PAT | Les 3 générations : présentes/absentes + « Last used » | « gén. 2 : présente, last used jj/mm » ; « gén. 3 : … » ; « gén. 1 : absente » + horodatage |

---

## 4. Grille d'exécution G-1…G-8 — INACTIVE tant que les décisions D-x correspondantes ne sont pas accordées

| ID | Étape | Décision liée | Ce que vous faites *(après accord uniquement)* | Statut *(à remplir)* | Date-Heure UTC *(à remplir)* | Référence capture/ticket *(à remplir)* | Impact constaté *(à remplir)* |
|---|---|---|---|---|---|---|---|
| **G-1** | GitHub — révocation de la génération 2 | **D-1** | github.com → Settings → Developer settings → PAT (classiques) → révoquer | | | | |
| **G-2** | GitHub — suppression de la génération 1 (hygiène) | **D-5** | Même écran → supprimer si encore listée | | | | |
| **G-3** | GitHub — création du remplaçant fine-grained de la gén. 3 | **D-4** (au moment utile — dégel/poussée) | Restreindre au seul dépôt `freemind25/ThesisFrame` ; **permissions minimales vérifiées (rév. 1)** : Metadata (auto) + **Contents read/write** (justifiées par la poussée du candidat après dégel — sinon read-only strict) ; **Actions : non** · **Workflows : non** (aucun workflow CI dans le dépôt — vérifié vague 39, `.github/` inexistant) ; toute autre permission : aucune ; **expiration ≤ 90 jours** | | | | |
| **G-4** | GitHub — test réel de la chaîne Git au poste | **D-4** | Terminal au poste : `git ls-remote https://github.com/freemind25/ThesisFrame.git` avec le nouveau token saisi au clavier | | | | |
| **G-5** | OpenAlex — régénération | **D-3** (si clé active inconnue) ou décision séparée | openalex.org → paramètres → API → régénérer ; vérifier que l'ancienne est inactive | | | | |
| **G-6** | APINex — révocation + régénération (cadre doc 40 §3) | **D-3** (si clé active inconnue) ou décision séparée | Console APINex → révoquer l'ancienne ; générer la nouvelle | | | | |
| **G-7** *(optionnel)* | Installation desktop des nouvelles clés | Après G-5/G-6 le cas échéant | Variable système ou `.env.local` local au poste (jamais dans le dépôt ni ici) | | | | |
| **G-8** | Impacts constatés pendant la fenêtre | Selon opérations accordées | Une ligne par service : « Aucun » ou description brève | | | | |

---

## Rappels d'état (inchangés)

- Gel intégral maintenu (mesure 18:08 UTC — empreintes ×4 conformes, arbre propre, tags inchangés, zéro credential résident, `.env.local` absent).
- Attente opérateur Git : **aucun dépôt nouveau** dans `/home/sync/upload/` — double déclencheur inchangé.
- Hors A1 : tout reste verrouillé (restauration, R2, C2, fenêtre S1-S4, releases, build, déploiement) jusqu'à autorisation écrite distincte.

---

*Grille révision 2 — aucun secret ne doit y figurer. L'agent n'exécutera aucun acte de rotation et n'accédera à aucune valeur ; toute opération est conditionnée à votre accord explicite, décision par décision.*
