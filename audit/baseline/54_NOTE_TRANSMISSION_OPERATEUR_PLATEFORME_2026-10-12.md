# 54 — NOTE DE TRANSMISSION À L'OPÉRATEUR PLATEFORME — DEMANDE DE RÉCUPÉRATION D'UN INSTANTANÉ ANTÉRIEUR AU 2026-10-12 12:57 UTC

**Cycle :** audit-final-v1.2 · vague 34 · **Objet : transmission du dossier 53 à l'opérateur de la plateforme, sur décision écrite du propriétaire (2026-10-12 ~15:04 UTC). Aucune action locale supplémentaire : le dépôt et les bases ne sont plus touchés. Le choix entre les options A et B est REPORTÉ jusqu'à la réponse de l'opérateur.**

**Décision du propriétaire (reproduite fidèlement, 4 points opérationnels) :**
1. **Ne plus toucher au dépôt ni aux bases de données** — les empreintes des deux bases et de la sauvegarde sont conformes.
2. **Transmettre le dossier 53 à l'opérateur** et lui demander de vérifier : le versionnage OSS de `repo.tar` ; les instantanés antérieurs au 12 octobre 12:57 UTC ; les éventuelles instances parallèles.
3. Demander que **toute archive récupérée soit déposée dans `/home/sync/upload/`, sans écraser l'environnement actuel**.
4. **À réception, vérifier commits, tags et empreintes avant d'autoriser toute restauration.** Si l'opérateur confirme qu'aucun instantané n'existe : choix entre option A (conserver l'état actuel, historique d'origine manquant) et option B (nouvelle lignée Git explicitement documentée comme reconstruction) — **le propriétaire attend la réponse de l'opérateur avant de décider**.

---

## §1 — Demande adressée à l'opérateur (3 vérifications + confirmation)

> **À l'attention de l'opérateur plateforme** — dans le cadre de l'audit `audit-final-v1.2` du projet ThesisFrame, merci de vérifier, hors sandbox, les trois sources suivantes et, si l'une d'elles existe, de livrer l'élément correspondant **sous forme de copie indépendante dans `/home/sync/upload/`** (jamais d'écrasement en place) :
>
> **P1 — Versionnage OSS de `/home/sync/repo.tar`.** Le fichier actuel (SHA-256 `cb7e5eab704210d41a58b2e1b194907fe9da2d1b4369fc3344579c8133ee9272`, 489 210 576 octets, mtime 2026-10-11 23:49:09 UTC) écrase le canal à chaque arrêt de session. Merci d'exporter, depuis la **console OSS** (versionnage du bucket hébergeant `/home/sync`), la version **antérieure à l'écrasement du 2026-10-11 23:49:09 UTC** — idéalement l'écriture de l'arrêt de session du ~2026-10-11 21:05 UTC. À défaut, **tout instantané capturé entre le 2026-10-11 06:35 et 21:05 UTC** contiendrait déjà les commits candidat et les 2 tags candidat (doc 51 §5).
>
> **P2 — Instantané/image du projet capturé le 2026-10-12 AVANT 12:57 UTC** (instant de la restauration de l'environnement depuis `repo.tar`). Un tel instantané contiendrait à la fois les objets Git perdus (HEAD `7179458…`, 4 tags) et l'état de travail du 10-12 (correcteur v2.2, preuves R2-01…R2-10, docs 49-52).
>
> **P3 — Instantanés d'instances parallèles** du même projet (hypothèse de cause racine, doc 51 §9) — disques ou images d'autres sandboxes/instances.
>
> **Si aucune de ces sources n'existe, merci de le confirmer explicitement par écrit** (réponse sans ambiguïté, avec la liste des sources vérifiées).

## §2 — Modalités de livraison (impératives)

1. **Copie indépendante** déposée dans `/home/sync/upload/` (sous-dossier dédié, ex. `recuperation-r2-<horodatage>/`) — **interdiction absolue** d'écraser l'environnement actif, `/home/sync/repo.tar` in situ, ou les dossiers existants (`secours-r2-20261012/`, `demande-operateur-recuperation-r2-20261012/`) ;
2. chaque archive accompagnée de : **source exacte, horodatage UTC de capture, SHA-256**, identifiant d'instance le cas échéant ;
3. **Interdits côté opérateur** : push/restauration dans le dépôt actif ; création de commit ou de tag ; écriture dans les bases de données ; démarrage de processus applicatif ; reconstruction d'historique.

## §3 — Objets Git attendus (pour identification rapide de la bonne source)

| Élément | Valeur attendue |
|---|---|
| Commit candidat applicatif (+ tag `candidat-app-audit-v1.2`) | `7dff2c6c98f8be59edb64b34f8a1eb021745a435` |
| Arbre de ce commit | `8ae37edab22fea51f6a4a13a16cd21a8f78c3d55f81c61851e343d43f987e75e` |
| Commit candidat documentaire (+ tag `candidat-docs-audit-v1.2`) | `24415b7f19ed89b44201e436f3026680eddd84ad` |
| Arbre de ce commit | `1dab90e53087b062ae743d6651d0e4a28ccef1afa7448d913e6793b2bc6785aa` |
| Commits postérieurs (vagues 16-29) | `ce2f634` · `0207f96` · `dc59ea1` · `7179458` (HEAD attendu) |
| Tags normatifs (déjà présents, pour contexte) | `v1.10.7` → `058b80c` · `v1.10.8` (annoté) → `f0e1a4b` |
| Fichier témoin | `audit/baseline/BASELINE_AUDIT_REPORT_v1.2.md` = **23 994 octets** |

La présence se juge par **l'existence effective des objets** (`git cat-file -t`), jamais par des métadonnées de fichiers. Formats : magasin SHA-256 (arbres de 64 hex).

## §4 — Vérification à réception (avant toute décision de restauration)

Protocole complet : **rapport 52 §5** (lecture seule). Résumé : extraction vers `/tmp/verif-snapshot/` uniquement (copie jetable, jamais dans l'environnement actif) ; contrôles attendus — HEAD `7179458…`, `git tag -l` → 4 tags, `cat-file -t` → commit ×6, arbres §3, taille témoin 23 994 o, SHA-256 des deux bases identiques à §5 si `db/` est présent. **Les résultats seront présentés au propriétaire AVANT toute décision ; toute restauration est soumise à son autorisation écrite préalable.** Après validation : finalisation R2 selon doc 46 §5bis étapes 6-12 (rapport 52 §6) — **sans `db:push`**, sans répétition des contrôles déjà validés (§4/§4.3bis v2.2 PASS), préconditions minimales : 4 mesures lecture seule (rapport 52 §6).

## §5 — État courant au moment de la transmission (mesures lecture seule 15:04-15:07 UTC)

| Objet | SHA-256 | Taille (o) | Observation |
|---|---|---|---|
| `db/custom.db` | `756c01587cc54a25db37c2f099266506aa01ffcff440870a61b43e441b38126d` | 265 330 688 | Conforme (skip-worktree, hors Git — protégé par empreinte + archives de secours) |
| `db/urbanisme-test.db` | `6b72e1dce93c4e94830639523cd14fad6600e018884f02b85aef4c10e9a65fb8` | 622 592 | Conforme (état post-R2) |
| `audit/baseline/evidence/backups/urbanisme-test-avant-resync-20261011T091500Z.db` | `16f3c3f4b42cdcaa1be1235ec593ff6beda3fbea6ed8104803ac0eb5a7584ae5` | — | Conforme |
| `/home/sync/repo.tar` | `cb7e5eab704210d41a58b2e1b194907fe9da2d1b4369fc3344579c8133ee9272` | 489 210 576 | Inchangé (mtime 2026-10-11 23:49:09 UTC) |
| `audit/baseline/51_RECHERCHE_SNAPSHOT_GIT_LECTURE_SEULE_2026-10-12.md` | `ee10b0d3438224921fc0f5413bda745bbbe95606e37cbb695af31508420c2223` | — | Annexe |
| `audit/baseline/52_RAPPORT_CLOTURE_ETAT_RECUPERATION_PLATEFORME_2026-10-12.md` | `12d0b3eee0a98af7bd34066550e6c4c0575a2e8603e2c3a562f887e6f8e84177` | — | Annexe |
| `audit/baseline/53_CONFIRMATION_RECUPERATION_IMPOSSIBLE_SANDBOX_2026-10-12.md` | `cffa10fa11456999ea0babdfbb4f412307af5863dd62bc6fd415ba4368e3dad6` | — | Annexe (dossier transmis) |

- **État Git (lecture seule, `--no-optional-locks`)** : HEAD `fb03efca2bfdb563a2fca5e190cf9097680b527d` (marqueur automatique plateforme 14:46:40) ← `63dea12acfcbab1646337a08a01c07abefd65695` (marqueur 14:26:42) ← `b26611061b25780009aeed67a70888de24d57464` (marqueur 13:41:58) ; **arbre propre** (0 modification) ; tags présents : `v1.10.7`, `v1.10.8` uniquement. Ces marqueurs capturent l'état de travail dans le magasin d'objets (mécanisme plateforme) — **ils ne contiennent pas les objets perdus**.
- **Archives de secours** A/B/C (vague 32) : `sha256sum -c` **OK ×3** à 15:06 UTC sur `/home/sync/upload/secours-r2-20261012/` (duplex `/tmp/secours-r2-20261012/`).

## §6 — Red lines respectées (vague 34)

0 écriture dans `.git`, les bases, les sauvegardes, les preuves, `repo.tar` · 0 commit/tag/push/restauration/reconstruction · 0 `db:push` · 0 nouvelle recherche locale (sur instruction du propriétaire) · seules écritures : la présente note, son dossier de transmission (copies) et l'append worklog.

---

*Note de transmission vague 34 — le dossier 53 (confirmations + matrice des 10 pistes) et ses annexes 51/52 sont déposés dans `/home/sync/upload/demande-operateur-recuperation-r2-20261012/` ; la demande opérateur (§1) et les modalités de livraison (§2) sont prêtes à l'emploi ; décision propriétaire enregistrée : attendre la réponse de l'opérateur avant tout choix A/B.*
