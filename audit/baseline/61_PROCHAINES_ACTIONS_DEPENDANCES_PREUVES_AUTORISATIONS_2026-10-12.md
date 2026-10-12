# 61 — PROCHAINES ACTIONS : DÉPENDANCES, PREUVES ATTENDUES, AUTORISATIONS NÉCESSAIRES

- **Date** : 2026-10-12 (vague 36)
- **Cycle** : `audit-final-v1.2`
- **Cadre** : directive propriétaire du 2026-10-12 — vague 35 validée (documents 55-59 conservés comme références), gel maintenu, attente opérateur, **aucune opération irréversible ni aucun déploiement autorisés pour la présente vague**
- **Documents de référence conservés** : 55 (checklist MEP, GO/NO-GO), 56 (plan de tests final), 57 (blocages priorisés B-01…B-21), 58 (plan de retour arrière RA-1…RA-8), 59 (plan d'exécution ordonné P0-P7), 52 §5 (protocole de vérification d'archive), 52 §6 (plan de reprise R2 = doc 46 §5bis étapes 6-12, sans db:push), 60 (rotation des clés)
- **Complément** : la présente feuille de route met à jour la proposition de calendrier de la vague 35 en y intégrant la rotation des clés (directive point 2, document 60)

---

## 1. Tableau des prochaines actions

| # | Action | Dépendances | Preuves attendues | Autorisation nécessaire |
|---|---|---|---|---|
| **A0** | **Maintien du gel** (état actuel, P0 du doc 59) — aucune opération technique ; veille passive du canal opérateur | — | Empreintes bases/repo.tar inchangées à chaque vérification ; arbre Git propre ; tags v1.10.7/v1.10.8 inchangés | Aucune (état d'attente prescrit) |
| **A1** | **Rotation des clés P1** (document 60 : OpenAlex K-1, APINex K-2, PAT GitHub K-3/K-4/K-5) — exécutée par le propriétaire sur les consoles des services ; accompagnement documentaire de l'agent possible | Aucune — **indépendante du gel Git et de la réponse opérateur**, parallélisable immédiatement | Captures propriétaire : ancienne clé → 401/403, nouvelle clé → 200 ; `git ls-remote` vert avec le PAT renouvelé ; contrôle lecture seule agent : 0 clé résidente, 0 occurrence dans l'arbre | **Écrite** — la directive anticipe la rotation ; feu vert explicite requis avant lancement (dernier alinéa de la directive) |
| **A2** | **Vérification lecture seule d'une archive opérateur** (si livraison) selon 52 §5 : extraction `/tmp/verif-snapshot/`, contrôle HEAD `7179458`, commits `7dff2c6c`/`24415b7f` + `ce2f634`/`0207f96`/`dc59ea1`/`7179458`, tags candidat, arbres `8ae37eda…`/`1dab90e5…`, témoin `BASELINE_AUDIT_REPORT_v1.2.md` (23 994 o) | Réception effective d'un dépôt opérateur dans `/home/sync/upload/` (en copie, jamais d'écrasement) | Rapport de vérification avec empreintes SHA-256 ; aucun résultat de restauration | **Lecture seule pré-cadrée** par le protocole 52 §5 ; la présentation des résultats au propriétaire est obligatoire AVANT toute suite |
| **A3** | **Décision propriétaire + restauration conditionnelle** (Option A conservée par défaut) : restauration de la lignée candidat si archive validée | A2 + présentation + **autorisation écrite** | Après restauration : `git log`/tags conformes aux valeurs attendues ; empreintes des bases inchangées (`756c0158…`, `6b72e1dc…`) ; archive d'état avant manipulation | **Écrite**, datée, périmétrée (aucune restauration sans elle) |
| **A4** | **Finalisation R2** (52 §6 = doc 46 §5bis étapes 6-12, **sans db:push**, sans répétition des contrôles déjà validés) | A3 (lignée rétablie) | Commit dédié R2 sur la lignée restaurée ; tag candidat ; empreintes de sortie conformes aux références consignées (v2.2 `85cfee28…`, comparateur, vidages) | **Écrite** — déjà cadrée par le protocole 52 §6, exécution conditionnée à A3 |
| **A5** | **Fenêtre commune S1-S4** (vérifications, GO A / GO B, levée P7) — cf. doc 59 P3, dossier fenêtre 34 | A4 + candidat final établi | Journaux de fenêtre horodatés ; empreintes de contrôle ; GO A/GO B consignés | **Écrites** : GO A, GO B, levée de P7 (autorisations distinctes) |
| **A6** | **Neutralisation des releases pré-audit v1.10.7/v1.10.8** (directive point 5 : elles ne sont pas destinées à une nouvelle diffusion) — options : re-passer en draft, privatiser le dépôt, ou supprimer les assets ; décision au propriétaire | A1 (PAT GitHub renouvelé en règle) ; décision du mode de neutralisation | Captures GitHub : état final des releases ; plus aucun asset téléchargeable publiquement | **Écrite** — choix du mode + exécution (action sur GitHub, hors gel local mais touches aux artefacts publics) |
| **A7** | **C2 Windows** (génération des 8 preuves au poste propriétaire, cadre doc 39) — re-contrôle du drift sur le candidat final | A4/A5 (candidat final) + environnement Windows propriétaire | 8 preuves C2 conformes au cadre doc 39 ; contrôle comparateur sur le candidat | **Écrite** + prérequis matériels (C2 reste bloqué sur environnement propriétaire, B-03 du doc 57) |
| **A8** | **Actifs cryptographiques MEP** : certificat Authenticode (K-6) + création conditionnelle de la paire updater (K-7) — document 60 §4.4/§4.5 | Indépendante (propriétaire) ; raccord au build au moment du build signé autorisé | `signtool verify` positif ; (si updater) clé publique commitée, signature de test vérifiée | Décision propriétaire (acquisition certificat) ; installation de config non secrète au moment voulu |
| **A9** | **GO MEP** (doc 55 : préconditions P-1…P-7, critères G-1…G-9) — publication/diffusion autorisée du candidat final signé | A1 + A4 + A5 + A6 + A7 (+ A8) + checklist 55 complète | Checklist 55 intégralement verte et signée ; artefacts signés vérifiés | **Écrite finale** — aucun déploiement, aucune publication, aucune distribution avant elle |
| **A10** | **Option B (alternative)** — reconstruction documentée d'une nouvelle lignée, uniquement si l'opérateur confirme par écrit l'absence d'archive récupérable | Confirmation écrite opérateur d'absence + choix explicite du propriétaire entre A et B | Nouvelle lignée marquée comme reconstruction (messages documentés), empreintes irréversiblement nouvelles assumées | **Écrite** — jamais lancée sans ce double déclencheur |

---

## 2. Chemin critique et calendrier indicatif

- **J0** = réponse de l'opérateur (déclencheur hors de notre contrôle). Tant que J0 n'a pas lieu : **A0 + A1 uniquement** (A1 est parallélisable dès le feu vert du propriétaire, elle n'ajoute aucun délai au chemin critique).
- **J0 + ~1 jour** : A2 (vérification archive) si livraison ; sinon confirmation d'absence → décision A/A10.
- **J0 + ~2 jours** : A3 (restauration validée) puis A4 (finalisation R2).
- **J0 + ~3-5 jours** : A5 (fenêtre S1-S4) puis A7 (C2 Windows au poste propriétaire).
- **En parallèle, à tout moment après feu vert** : A1 (rotation clés) et A8 (certificat Authenticode) — prérequis de A6/A9.
- **J0 + ~6-9 jours** : A6 (neutralisation releases) puis A9 (GO MEP) — conforme au calendrier proposé au doc 59.
- Toute dérive du calendrier sera signalée avec les causes ; **aucune étape n'est compressée au prix des preuves**.

---

## 3. Récapitulatif des autorisations à préparer (aucune n'est accordée implicitement)

1. **Feu vert rotation des clés P1** (A1) — nouveau dans cette vague, immédiat, indépendant ;
2. **Autorisation de restauration** (A3) — si et seulement si l'archive opérateur est validée en lecture seule et présentée ;
3. **Autorisation de finalisation R2** (A4) — protocole 52 §6 pré-cadré, exécution après A3 ;
4. **GO A / GO B + levée P7** (A5) — autorisations distinctes ;
5. **Autorisation de neutralisation des releases pré-audit** (A6) + choix du mode ;
6. **Autorisation C2** (A7) — avec prérequis environnement Windows ;
7. **GO MEP** (A9) — dernière, sur checklist 55 complète.

Chaque autorisation attendue : **écrite, datée, périmétrée** (périmètre exact, interdits résiduels, preuves exigées). L'agent ne considérera aucun accord verbal ou implicite comme suffisant.

---

## 4. Preuves de gel à date (mesures 2026-10-12 ~17:30 UTC, lecture seule)

| Objet | Empreinte / état | Référence consignée | Conformité |
|---|---|---|---|
| `db/custom.db` (265 330 688 o, skip-worktree) | `756c0158…8126d` | idem vagues 32-35 | ✅ |
| `db/urbanisme-test.db` (622 592 o, post-R2) | `6b72e1dc…65fb8` | idem vagues 32-35 | ✅ |
| Sauvegarde pre-resync | `16f3c3f4…84ae5` | idem | ✅ (non re-mesurée cette vague, dernier contrôle vague 34) |
| `/home/sync/repo.tar` (489 210 576 o) | `cb7e5eab…9272`, mtime 10-11 23:49 inchangé | idem | ✅ |
| Archives secours A/B/C | `sha256sum -c` OK ×3 (dernier contrôle 15:06 UTC) | vague 32 | ✅ |
| Documents 55-59 (vague 35) | `sha256sum -c` OK ×5 (canal `preparation-mep-20261012/`) | vague 35 | ✅ |
| HEAD Git | `8441174` (marqueur plateforme 16:48 UTC) ← `b209134` ← `b08cc7e` ← `fb03efc` ← `63dea12` ← `b266110` ← `717d137` ← `d17488a` | marqueurs plateforme consignés vagues 32-34 | ✅ (dérive = captures automatiques d'état, aucune action agent) |
| Arbre Git | propre (0 modification) | — | ✅ |
| Tags | v1.10.7 / v1.10.8 uniquement — **aucun nouveau tag, aucune nouvelle release** | directive point 5 | ✅ |
| Canal opérateur `/home/sync/upload/` | **Aucun dépôt opérateur nouveau** depuis la demande (dernier contenu = notre dossier de transmission + secours + préparation MEP) | vague 34 | ✅ (attente maintenue) |

**Note sur les marqueurs plateforme** : les commits `b08cc7e` (15:08 — capture du doc 54 + worklog), `b209134` (15:43 — worklog) et `8441174` (16:48 — capture des documents 55-59 + worklog) sont des captures automatiques de l'environnement, identiques dans leur mécanisme au marqueur `b266110` analysé en vague 32. Ils **enrichissent la préservation** (l'état de travail courant est désormais capturé dans le magasin Git local, à l'exception de `custom.db` réel en skip-worktree) mais **ne restaurent ni les commits ni les tags perdus** — la demande opérateur demeure la seule voie de récupération de la lignée candidat.

---

## 5. Conformité à la directive de la vague 36

| Point de la directive | Statut |
|---|---|
| 1. Gel du dépôt, des bases et des artefacts protégés | ✅ Maintenu (§4) |
| 2. Liste exacte des clés + services + procédures, sans copie de secret | ✅ Document 60 (7 entrées K-1…K-7, inventaire négatif complet, **aucune valeur copiée**) |
| 3. Attente opérateur Git | ✅ Maintenue — aucune restauration, aucune reconstruction (§4, A2/A3/A10 conditionnées) |
| 4. Ni finalisation R2, ni C2, ni migration réelle, ni build de production | ✅ Aucun lancé — tous conditionnés aux autorisations (A4-A7) |
| 5. Releases pré-audit maintenues non diffusées | ✅ Aucune nouvelle release, aucun tag ajouté ; neutralisation future soumise à autorisation (A6) |
| 6. Prochaines actions + dépendances + preuves + autorisations | ✅ Présent document (§1-§3) |
| Aucune opération irréversible ni déploiement | ✅ Seules écritures : documents 60/61 + copies canal + SUMS + worklog |
