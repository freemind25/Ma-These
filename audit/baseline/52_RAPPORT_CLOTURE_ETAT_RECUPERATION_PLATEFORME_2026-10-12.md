# 52 — RAPPORT DE CLÔTURE UNIQUE — ÉTAT PRÉSERVÉ ET SÉCURISÉ · RÉCUPÉRATION PLATEFORME · REPRISE R2 CONDITIONNELLE — 2026-10-12

**Cycle :** audit-final-v1.2 · vague 32 (clôture en une seule démarche — consigne explicite du propriétaire : « régler cette situation en une seule démarche, sans nouvelle succession d'audits »)
**Statut : DÉMARCHE EXÉCUTÉE EN UNE PASSE — (1) état courant intégralement inventorié (SHA-256) et sécurisé par copies vérifiées vers le canal plateforme ; (2) demande de récupération plateforme formalisée (§9) — aucun instantané contenant la lignée Git d'origine n'étant accessible depuis le bac à sable, sa remise et sa vérification restent à l'étape plateforme ; (3) protocole de vérification et plan de reprise R2 (doc 46 §5bis étapes 6-12) PRÊTS ET CONDITIONNÉS ; (4) aucun original modifié, aucune restauration, aucune reconstruction, aucun commit/tag/push.**

**Autorisation exécutée (reproduction des 5 points du propriétaire, 2026-10-12) :** sécuriser immédiatement les preuves existantes (rapport 51, documents 24-50, comparateur v2.2, tests, journaux, sauvegardes, état des deux bases) + inventaire SHA-256 sans modifier les originaux ; demander une récupération côté plateforme d'un instantané antérieur à la restauration du 12 octobre ; vérifier ledit instantané (lignée candidat v1.2) ; si récupération → préparer la reprise §5bis sans relancer `db:push` ni répéter les contrôles déjà validés ; si impossible → bilan final unique. **Limites respectées :** aucune restauration dans l'environnement actif sans présentation préalable + accord ; aucune reconstruction d'historique ; aucun tag recréé ; aucune modification des bases/sauvegardes ; aucun commit/tag/push/force-push/déploiement ; aucune nouvelle vague d'audit (seuls les points nécessaires à la récupération ont été re-mesurés).

---

## §1 — État actuel sauvegardé et ses empreintes (mesures 2026-10-12 14:18-14:19 UTC)

Inventaire brut intégral : `inventaire-securisation-20261012.md` (+ copie canal OSS) et `/tmp/r32-inventory.txt`. Points essentiels :

### §1.1 Bases de données (strictement intactes — SHA re-mesurés identiques aux consignations)

| Fichier | SHA-256 | Taille | État |
|---|---|---|---|
| `db/custom.db` | `756c01587cc54a25db37c2f099266506aa01ffcff440870a61b43e441b38126d` | 265 330 688 o | **intacte** (référence stable vagues 12-14, docs 38/43/46 §2.5) |
| `db/urbanisme-test.db` | `6b72e1dce93c4e94830639523cd14fad6600e018884f02b85aef4c10e9a65fb8` | 622 592 o | **intacte** — état post-push R2 validé (30 tables, drift 0, 38 lignes, contenu préexistant prouvé intact) |
| `audit/baseline/evidence/backups/urbanisme-test-avant-resync-20261011T091500Z.db` | `16f3c3f4b42cdcaa1be1235ec593ff6beda3fbea6ed8104803ac0eb5a7584ae5` | 552 960 o | **intacte** (identique dans la copie `/tmp/my-project` du 10-11 20:57) |

### §1.2 Documents 24-51 — empreintes vérifiées conformes aux consignations antérieures

Les 28 documents 24-51 sont sur disque avec SHA-256 consignés (`inventaire-securisation-20261012.md` §3). Contrôles de cohérence doc 50 §2.1 **tous conformes** : doc 46 `820202f4…3db84` · doc 47 `c898d550…a44e` · doc 48 `9f1046cb…9257` · doc 49 `d2094348…85e0b`.

### §1.3 Comparateur v2.2, tests et preuves R2 (toutes conformes aux consignations)

`resync-testdb-compare-contenu.mjs` **v2.2 `85cfee28…d233`** · suite de tests `4ccd6a2b…78a6` · transcript vague 30 `b8988f16…3992` · rows-dump gelé `f4ef4673…5bf0f` · DDL gelé `ab2c312b…e3355` · référence gelée `d2a9d500…4ba77` · vidages R2 `fb85ff00…9c3e` / `29f38a5f…c06e` · inventaire APRÈS `2ab378c3…ec8d` · GO propriétaires `b9f0b943…5912` (GO RESYNC) / `3a142200…c066` (GO REPRISE COMPARATEUR) · transcripts R2-01…R2-10.

### §1.4 Journaux

`worklog.md` `cc427c0d…5e2c` (vagues 1-31) · `dev.log` `7bbb03b8…6d6d` · `dev.log.archive-2026-10-10-t6b` `78c17082…00a8`.

### §1.5 État Git mesuré (lecture seule, re-confirmé 14:19)

- `HEAD` = `b26611061b25780009aeed67a70888de24d57464` (marqueur plateforme 13:41:58) ← `717d137` (marqueur 13:02:42) ← `d17488af…` (10-10) ; branche `main` ; **arbre de travail propre**.
- Tags présents : **`v1.10.7`, `v1.10.8` uniquement**.
- **Les 6 commits attendus restent ABSENTS du magasin** (`git cat-file -t` : `7dff2c6c…`, `24415b7f…`, `ce2f634`, `0207f96`, `dc59ea1`, `7179458` → « could not get object info / not a valid object name » ×6).
- `/home/sync/repo.tar` **inchangé** : SHA `cb7e5eab…e272` (état 10-10 21:07, sans lignée candidate — preuve au niveau contenu, doc 51 §5).

### §1.6 Découverte de la vague 32 : le marqueur plateforme `b266110` capture l'état courant dans Git

Le commit marqueur `b266110` (créé automatiquement par la plateforme à 13:41:58, 1 360 fichiers, sans intervention de l'agent) contient — **vérifié au niveau contenu, blob par blob** — les documents 24-51, les preuves R2 (dont la v2.2 : blob == `85cfee28…d233` du fichier courant), le `worklog.md`, la sauvegarde pré-resync (`16f3c3f4…84ae5`) **et `db/urbanisme-test.db` post-R2 : blob `b35a8d0a198ef1f4041fe7d1560b859901d1bba7` == `git hash-object` du fichier courant**.

**Limite (importante)** : `db/custom.db` est en **skip-worktree** (`git ls-files -v` → `S`) — le blob suivi `4009ebf2` (37 625 856 o, état ancien hérité) ne représente **pas** le fichier réel (265 330 688 o) ; et `dev.log` est ignoré (`.gitignore` l.49). Le custom.db réel n'est donc capturé ni par Git ni par `repo.tar` récent — sa protection repose sur les empreintes §1.1 et l'archive de secours B (§2).

Conséquence positive : si le crochet « pre-stop » s'exécute normalement sur **cette** instance à son arrêt, `repo.tar` sera réécrit avec l'état courant (incluant le magasin Git `b266110`) — le risque résiduel documenté (écrasement par une instance parallèle, doc 51 §9) demeure et relève de la plateforme.

### §1.7 Artefacts plateforme non identifiés (consignés, non touchés)

| Artefact | Empreinte / état | Note |
|---|---|---|
| `backups/custom-2026-10-12.db` (racine projet) | `be8a1774…d4461` · 222 609 408 o · mtime 10-12 12:34 · SQLite 30 tables | état **antérieur** de custom.db créé par un mécanisme plateforme au boot 12:34 (absent de `/start.sh`) ; ≠ custom.db réel ; origine à clarifier côté plateforme |
| `/tmp/my-project/.initial_snapshot.json` | 86 330 o · mtime 10-12 13:41 | manifeste de mtimes du projet créé à la clôture de session précédente |

## §2 — Sécurisation réalisée (copies vérifiées — aucun original modifié)

| Archive | Contenu | Taille | SHA-256 |
|---|---|---|---|
| `secours-A-preuves-docs-journaux-20261012T1422Z.tar.gz` | `audit/baseline/` complet (docs 00-51, evidence, tools) + `worklog.md` + `dev.log` + archive dev.log | 46 141 970 o | `f5df63732221e70509cf970ddc533d4ae1f66ae301625aa7e441f0212d723e8e` |
| `secours-B-bases-etat-20261012T1422Z.tar.gz` | `db/custom.db` (réel 265 Mo) + `db/urbanisme-test.db` (post-R2) + `backups/custom-2026-10-12.db` + `.env` | 397 644 314 o | `acf831068ec251d06459f6ab9dac00e63cc8ab1a06905236c4adbf110e07d079` |
| `secours-C-git-magasin-20261012T1422Z.tar.gz` | `.git` complet à HEAD `b266110` (état capturé par le marqueur + preuve médico-légale de l'absence des objets perdus) | 194 672 174 o | `7895271e4e7015e153fc318d5129945161ef50959a50e1a9067f76975365d031` |

**Destinations :** `/home/sync/upload/secours-r2-20261012/` (canal OSS — visible et récupérable par l'opérateur plateforme) **et** `/tmp/secours-r2-20261012/` (redondance locale). **Intégrité vérifiée** : `sha256sum -c` re-exécuté sur la copie OSS → **OK ×3**. S'y trouvent également : `inventaire-securisation-20261012.md`, `SHA256SUMS-secours-20261012T1422Z.txt`, `inventaire-brut-20261012T141831Z.txt`, et le présent rapport.

## §3 — Résultat de la demande de récupération plateforme

1. **Constat de canal** : depuis le bac à sable, aucun canal d'appel direct à la plateforme n'existe (l'opérateur n'est joignable ni par API ni par le système de fichiers, hors le montage OSS `/home/sync`). La demande est donc **formalisée au §9, prête à transmettre** ; le propriétaire (ou l'opérateur lisant `/home/sync/upload/`) est le vecteur de transmission.
2. **Re-balayage effectué (vague 32)** : aucune nouvelle source Git n'est apparue depuis la vague 31 — pas de `*.bundle`, pas de second `.git`, `/app/temp` toujours inaccessible (permission denied), `repo.tar` inchangé (`cb7e5eab…e272` ; son contenu — état 10-10 21:07, sans commits ni tags candidat — est établi au niveau contenu, doc 51 §5).
3. **Éléments nouveaux en faveur de la récupération** :
   - le magasin Git local contient désormais l'état de travail capturé par `b266110` (§1.6) — un arrêt propre de cette instance avec pre-stop normal persiste cet état dans `repo.tar` ;
   - la piste **versionnage OSS** : `repo.tar` a été écrasé le 10-11 23:49 ; si le bucket hébergeant `/home/sync` conserve des versions d'objets, la version antérieure (écrite ~10-11 21:05 à l'arrêt de la session propre) contiendrait l'état complet d'avant incident — **commits candidat + tags + docs 24-49 + preuves R2 + bases post-R2** — à vérifier exclusivement côté plateforme (§9, demande n°2).
4. **Ce qui reste irrécupérable depuis l'intérieur** : les objets Git perdus (`7dff2c6c…`, `24415b7f…`, `ce2f634`, `0207f96`, `dc59ea1`, `7179458` + chaîne docs vagues 14-15) et les 2 tags candidat — mesurés ABSENTS à 14:19 (§1.5). Toute récupération à l'identique passe par une source hors sandbox (§9).

## §4 — Présence / absence des commits et tags d'origine (verdict mesuré, 2026-10-12 14:19 UTC)

| Élément d'origine | État dans l'environnement actif | Où le retrouver |
|---|---|---|
| `7dff2c6c…` (candidat app) + tag `candidat-app-audit-v1.2` | **ABSENT** (objet et tag) | uniquement instantané plateforme (§9) |
| `24415b7f…` (candidat docs) + tag `candidat-docs-audit-v1.2` | **ABSENT** (objet et tag) | uniquement instantané plateforme (§9) |
| `ce2f634` · `0207f96` · `dc59ea1` · `7179458` | **ABSENTS** ×4 | uniquement instantané plateforme (§9) |
| Chaîne docs vagues 14-15 (15 commits, doc 38 §3) | **ABSENTE** | idem |
| `v1.10.7` → `058b80c` · `v1.10.8` → `f0e1a4b` | **présents** (intacts) | — |
| État de travail vague 30 (docs 24-51, v2.2, preuves, bases) | **PRÉSERVÉ** sur disque + capturé dans `b266110` (sauf custom.db réel : skip-worktree) + archives §2 | — |

## §5 — Protocole de vérification d'un instantané fourni par la plateforme (prêt à exécuter — lecture seule)

**Règle absolue : ne JAMAIS restaurer dans l'environnement actif avant présentation des résultats et accord écrit du propriétaire ; travailler uniquement sur une copie sous `/tmp`.**

1. Empreinte de l'archive reçue : `sha256sum <archive>` (consigner) ; extraire vers `/tmp/verif-snapshot/` (**copie**, jamais vers `/home/z/my-project`).
2. Refs au niveau contenu : `git -C /tmp/verif-snapshot --no-optional-locks rev-parse HEAD` → attendu **`7179458…`** (ou chaîne contenant les 6 commits) ; `git … tag -l` → attendu **4 tags** (`candidat-app-audit-v1.2`, `candidat-docs-audit-v1.2`, `v1.10.7`, `v1.10.8`).
3. Objets : `git … cat-file -t` sur les 6 SHA attendus → **commit ×6** ; arbres candidat : `git … rev-parse 7dff2c6^{tree}` → `8ae37eda…e75e` ; `git … rev-parse 24415b7^{tree}` → `1dab90e5…85aa` (références doc 38 §3-4).
4. Cohérence docs : `git … show 7dff2c6:audit/baseline/BASELINE_AUDIT_REPORT_v1.2.md \| sha256sum` comparé à la copie disque courante (`23994 o`).
5. Si l'instantané est du 10-12 avant 12:57 : vérifier en plus la présence de la vague 30 (docs 50, v2.2 `85cfee28…`, preuves R2-08/09/10) **dans l'arbre de travail de l'instantané**, et les SHA des bases (`756c0158…` / `6b72e1dc…`).
6. **Présenter les empreintes et résultats au propriétaire AVANT toute restauration.**

## §6 — Plan de reprise R2 conditionnel (doc 46 §5bis — étapes 6-12 restantes)

**Préambule** : les étapes 1-5 sont déjà réalisées et validées (GO signé, contrôles préalables, rupture du hard link, resynchronisation, contrôles §4 + §4.3bis **PASS v2.2**, preuves R2-01…R2-10). Conformément à la consigne : **aucun `db:push`, aucune répétition des contrôles déjà validés**.

**Préconditions minimales de re-confirmation (4 mesures lecture seule, ~1 minute, au moment de la reprise)** : (a) SHA des deux bases == §1.1 ; (b) `git tag -l` sans tag `*-R2` ; (c) hash DDL gelé re-calculé == `ab2c312b…e3355` ; (d) arbre propre vis-à-vis de l'instantané restauré + serveur arrêté.

**Séquence (ordre immuable, doc 46 §5bis/§7.2)** :
6. **commit dédié** — 1 fichier : `db/urbanisme-test.db` (message fixé doc 46 §1) ;
7. **validation des preuves** §5 (toutes vertes — paquet déjà constitué) ;
8. **tag applicatif R2** `candidat-app-audit-v1.2-R2` (léger, sur le commit dédié) ;
9. **empreinte de l'archive** `git archive --format=tar candidat-app-audit-v1.2-R2 | sha256sum` → consignée (journal + doc 24 §0) ;
10. **mises à jour documentaires** : doc 24 §0 · `AGENTS.md` règle anti-récurrence §8.5 (texte exact doc 46 §8) · doc 46 §10 · worklog ;
11. **commit documentaire** ;
12. **tag documentaire R2** `candidat-docs-audit-v1.2-R2` (léger, sur le commit documentaire — uniquement après validation des preuves et du commit).

Ensuite uniquement : **C2 final préparé pour R2** (instruction propriétaire, doc 46 §8.3). Discipline : un tag créé n'est jamais déplacé ni supprimé ; jamais amend/rebase/force-push.

## §7 — Décision recommandée et blocages nécessitant réellement l'intervention du propriétaire

**Recommandation (ordre)** :
1. **Transmettre la demande plateforme (§9)** — c'est la seule voie de récupération à l'identique de la lignée `7dff2c6`/`24415b7`/tags. Exiger une livraison **en copie** (dépôt dans `/home/sync/upload/`), jamais d'écrasement in-place de l'environnement actif.
2. **À réception** : exécuter le protocole §5 (lecture seule) et présenter les empreintes ; sur votre accord écrit, restaurer puis enchaîner le plan §6 (étapes 6-12).
3. **En parallèle / à défaut de livraison** : demander à la plateforme de confirmer que le pre-stop de CETTE instance écrira bien `repo.tar` avec l'état courant (le marqueur `b266110` y est déjà, §1.6) — mais ce levier secondaire ne restitue pas les objets perdus (ils ne sont dans aucun `.git` existant).
4. **Si aucune source plateforme n'est disponible** : les options restantes sont inchangées — reconstruction d'historique explicitement autorisée (doc 50 §2.4.2 — nouvelle lignée documentée comme telle, au prix que les SHA perdus ne soient jamais restaurés à l'identique ; requiert votre autorisation expresse) ou statu quo documenté (état actuel correct et scellé).

**Blocages nécessitant réellement votre intervention** (rien d'autre n'attend de décision) :
- la **transmission** de la demande §9 à l'opérateur plateforme ;
- votre **autorisation écrite spécifique** pour toute restauration effective dans l'environnement actif (et, en dernier recours, pour une reconstruction) ;
- côté plateforme : vérifier l'**origine** de `backups/custom-2026-10-12.db` (§1.7) et l'existence d'un **versionnage OSS** de `repo.tar`.

## §8 — Red lines respectées (vague 32)

0 écriture dans `.git` (commandes `--no-optional-locks` uniquement ; aucun commit/tag/push/reset) · 0 modification de `db/custom.db`, `db/urbanisme-test.db`, de la sauvegarde `16f3c3f4…84ae5` ni de toute preuve historique (SHA AVANT=APRÈS sur tous les points sensibles) · 0 écriture dans `/home/sync/repo.tar` · 0 relance `db:push` · 0 restauration, 0 reconstruction, 0 tag recréé · 0 nouvelle vague d'audit (seules mesures : inventaire SHA, état Git, cohérences §1) · seules écritures créées : le présent rapport, `inventaire-securisation-20261012.md`, les archives de secours (copies) dans `/tmp/secours-r2-20261012/` et `/home/sync/upload/secours-r2-20261012/`, et l'append worklog.

## §9 — DEMANDE DE RÉCUPÉRATION PLATEFORME (texte prêt à transmettre)

> **Objet : récupération en copie d'un instantané projet — urgence de préservation — instance ThesisFrame (audit-final-v1.2)**
>
> **Contexte horodaté.** Le 2026-10-12 12:57 UTC, l'environnement a été restauré depuis `/home/sync/repo.tar` (SHA-256 `cb7e5eab704210d41a58b2e1b194907fe9da2d1b4369fc3344579c8133ee9272`, mtime 2026-10-11 23:49:09 UTC) vers un état du 2026-10-10 21:07, effaçant du magasin Git local les commits et tags créés entre le 10-10 soir et le 10-11 ~21:05 UTC : commits `7dff2c6c98f8be59edb64b34f8a1eb021745a435` (tag `candidat-app-audit-v1.2`), `24415b7f19ed89b44201e436f3026680eddd84ad` (tag `candidat-docs-audit-v1.2`), `ce2f634`, `0207f96`, `dc59ea1`, `7179458` (HEAD attendu) et la chaîne documentaire vagues 14-15. Ces objets n'existent sur aucun dépôt distant (push interdit par le protocole d'audit) et ne sont présents dans aucune copie accessible de l'environnement.
>
> **Demandé (par ordre de préférence) — livraison en COPIE dans `/home/sync/upload/`, jamais d'écrasement de l'environnement actif :**
> 1. un **instantané/image du projet `/home/z/my-project` capturé le 2026-10-12 avant 12:57 UTC** (il contiendrait à la fois la lignée Git attendue ET l'état de travail du 10-11 soir) ;
> 2. à défaut, les **versions antérieures de l'objet `repo.tar`** si le bucket OSS hébergeant `/home/sync` conserve un versionnage — cibler la version écrite à l'arrêt de la session du 2026-10-11 (~21:05 UTC), antérieure à l'écrasement de 23:49 ;
> 3. à défaut, le **disque/snapshot de toute instance parallèle** restée à l'état du 10-11 (hypothèse de cause racine de l'écrasement de `repo.tar` à 23:49, doc 51 §9) ;
> 4. et, indépendamment : confirmation que le **pre-stop** de l'instance active écrira bien `repo.tar` avec l'état courant (le commit marqueur `b266110` du 13:41:58 UTC y capture déjà docs, preuves et base de test), et vérification de l'origine de `backups/custom-2026-10-12.db` (222 609 408 o, 12:34).
>
> **Garanties demandées** : aucune restauration automatique au boot tant que l'analyse en copie n'est pas terminée ; toute remise se fait en copie nominative dans `/home/sync/upload/` ; le protocole de vérification (rapport 52 §5) sera exécuté en lecture seule et soumis au propriétaire avant toute écriture.

---

*Rapport de clôture vague 32 — démarche unique exécutée conformément à l'instruction du propriétaire : état préservé, inventorié et sécurisé (disque + canal OSS) ; demande de récupération plateforme formalisée et prête à transmettre ; protocole de vérification et plan de reprise R2 conditionnels prêts ; aucune restauration, aucune reconstruction, aucun commit/tag/push ; décision écrite requise uniquement pour la transmission, la restauration éventuelle et, en dernier recours, une reconstruction.*
