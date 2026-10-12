# 50 — RAPPORT REPRISE R2 (CORRECTION COMPARATEUR v2.2 VALIDÉE) + ANOMALIE ENVIRONNEMENTALE (RÉGRESSION GIT) — ARRÊT — 2026-10-12

**Cycle :** audit-final-v1.2 · vague 30 (reprise sous décision propriétaire — option 1 doc 49 ; correction achevée et validée ; finalisation verrouillée par une anomalie environnementale découverte pendant la complétion des contrôles)
**Statut : DEUX ARRÊTS SUCCESSIFS — (I) la correction du comparateur demandée par le propriétaire est TERMINÉE et VALIDÉE (30/30 tests, §4.3bis PASS) ; (II) la finalisation §5bis étapes 6-12 est IMPOSSIBLE en l'état : le magasin d'objets `.git` a été restauré par l'environnement à un instantané ~2026-10-10 — les commits du candidat (`7dff2c6`, `24415b7`, `ce2f634`, `0207f96`, `dc59ea1`, `7179458`), les 2 tags candidat et l'historique des vagues 14-28 ont DISPARU. Aucun commit, aucun tag, aucune restauration, aucune reconstitution d'historique — décision écrite du propriétaire requise.**

---

## §1 — Partie validée : correction du comparateur (option 1, décision consignée)

Décision propriétaire consignée : `evidence/GO-REPRISE-COMPARATEUR-proprietaire-20261011.md` (SHA `3a142200…c066`) — reproduction mot pour mot, y compris la consigne finale : « conserver le snapshot historique intact ; la correction doit porter sur la logique du comparateur, et non sur la référence de données ».

### §1.1 Cause racine confirmée (doc 49 §6 + complément)

1. **Faux positif principal (confirmé)** : le DDL gelé ajoute 4 colonnes sur 3 tables préexistantes (`Chapter.stamp`, `ChapterVersion.stamp`, `Job.progress`+`progressNote`, toutes nullables sans défaut). Le comparateur v2.1 comparait les lignes canonisées colonne par colonne → l'ajout prévu par le DDL apparaissait comme une divergence. Toutes les valeurs préexistantes étaient intactes (preuve doc 49 §6, re-confirmée par la comparaison restreinte v2.2 : empreinte globale `faed00f9…80f6d` identique des deux côtés).
2. **Angle mort secondaire (découvert PAR la v2.2 plus stricte, lors de la reprise)** : la **reconstruction `CustomBookSkill`** (5ᵉ mécanisme du DDL gelé : `CREATE new_` → `INSERT` copie → `DROP` → `RENAME`, doc 46 §3bis) réordonne les colonnes (3 ajoutées avant `createdAt`/`updatedAt`). La v2.1 ne l'avait **jamais signalée** car la table est **VIDE** (0 ligne = aucune comparaison de lignes possible, SHA d'une table vide identique). La v2.2 initiale l'a détectée (motif `colonnes`) — preuve que le durcissement ne masque rien. Vérification lecture seule : les 10 colonnes APRÈS (noms, types, contraintes) sont **exactement** celles du DDL gelé (l.92-107), 0 ligne des deux côtés.

### §1.2 Correction appliquée (v2.2) — logique uniquement, données intactes

`resync-testdb-compare-contenu.mjs` v2.1 → **v2.2** (SHA final `85cfee28…d233`) :

- **Tolérance 1 — ADD COLUMN du DDL gelé** (`DDL_ADDED_COLUMNS`, dérivée du DDL figé) : les colonnes AVANT doivent rester un **préfixe exact** des colonnes APRÈS ; les ajouts doivent correspondre **exactement** à la liste du DDL (application partielle = FAIL) ; ils doivent être **NULL sur toutes les lignes** (toute valeur non null, y compris `''` = divergence réelle) ; **toutes les colonnes préexistantes restent comparées exactement, ligne par ligne** (re-tri dans l'espace de clés préexistant, l'ajout de colonnes pouvant modifier l'ordre lexicographique) ;
- **Tolérance 2 — reconstruction `CustomBookSkill`** (`DDL_REBUILT_COLUMNS`) : liste de colonnes APRÈS **exactement** celle du DDL gelé + table **VIDE des deux côtés obligatoire** (toute ligne = divergence réelle `table_reconstruite_non_vide`) ;
- toute autre différence structurelle = FAIL ; R1/R4/R5 et la note « COMPTAGES IDENTIQUES MAIS CONTENU DIVERGENT » inchangées ; R3 recalculée sur les formes restreintes aux colonnes préexistantes ;
- **aucun vidage, aucune référence de données, aucun résultat attendu modifié** : `rows-dump.mjs` gelé **intact** (SHA `f4ef4673…5bf0f`), `rows-avant.json` gelé intact (`d2a9d500…4ba77`), vidages R2 inchangés (`fb85ff00…9c3e` / `29f38a5f…c06e`), DDL gelé intact (`ab2c312b…e3355`).

### §1.3 Tests — conditions de validation du propriétaire (toutes satisfaites)

Suite étendue : 18 tests existants **inchangés** + série E ciblée (E1-E11) → **30/30 conformes, exit 0** (transcript `resync-testdb-contenu-tests-vague30.txt`, SHA `b8988f16…3992` ; suite finale SHA `4ccd6a2b…78a6`) :

| Condition propriétaire | Preuve |
|---|---|
| 1. Tests existants réussissent intégralement | A1-A7, B×8, D1-D3 : 18/18 OK inchangés |
| 2. Tests ciblés détectent les divergences réelles, n'acceptent que le structurel autorisé | E1/E7 PASS (ajout DDL, NULL) · E2/E2b FAIL (non null / `''` dans colonne ajoutée) · E3 FAIL (colonne hors DDL) · E4 FAIL (insertion, ordre rompu) · E6 FAIL (DDL partiel) · E10 FAIL (ligne dans table reconstruite) · E11 FAIL (colonnes ≠ DDL) |
| 3. Comparaison des colonnes préexistantes reste exacte | E5 FAIL (valeur modifiée malgré l'ajout) · E8 FAIL (ligne ajoutée) · démo vague 25 vs référence pré-push : FAIL `contenu` + note, exit 1 (comportement v2.1 intact) |
| Non-masquage (identité + corruption) | identité vidage ↔ vidage : PASS exit 0 · variante corrompue : FAIL exit 1 (les deux motifs, `colonnes` vs post-push et `contenu` vs pré-push, documentés) |

### §1.4 Reprise du contrôle §4.3bis (sur l'état déjà obtenu — AUCUN `db:push` relancé)

`resync-testdb-compare-contenu.mjs` v2.2 sur la paire de vidages R2 préservée → **PASS (exit 0)** : R1 ✓ (25 tables), R2 ✓ (contenu ligne à ligne identique sur les colonnes préexistantes), R2bis ✓ (tolérances consignées : `Chapter: +stamp` · `ChapterVersion: +stamp` · `Job: +progress, +progressNote` · `CustomBookSkill: reconstruite selon DDL gelé`), R3 ✓ (empreinte `faed00f9…80f6d` identique), R4 ✓ (5 nouvelles vides), R5 ✓ (aucune table inattendue). Stabilité de l'état prouvée : vidage frais (lecture seule) == vidage APRÈS préservé → PASS. Transcripts : `resync-testdb-R2-09-reprise-4-3bis.txt`, `resync-testdb-R2-08-correction-comparateur.txt`.

### §1.5 Complétion formelle §4 (transcript `resync-testdb-R2-10-controles-finaux.txt`)

§4.1 custom.db intouchée ✓ · §4.2 intégrité ok / FK 0 / 30 tables / 38 lignes ✓ · §4.3 comptages PASS ✓ · §4.3bis PASS v2.2 ✓ · §4.4 5 nouvelles vides + 6 index ✓ · §4.5 périmètre = `db/urbanisme-test.db` seul fichier suivi modifié ✓ · §4.6 staging : **voir §2.4** (disparu — preuve de préservation au transcript R2-04 D.6) · §4.7 dérive **exit 0 ×2**, aucun résidu, aucun journal ✓.

## §2 — Anomalie environnementale : régression du dépôt Git (découverte 2026-10-12 ~12:57 UTC)

Pendant la suspension de la session (dernière activité propre 2026-10-11 ~21:05 UTC), l'environnement a restauré le projet à un instantané antérieur. Constats (lecture seule, transcript R2-10) :

| # | Fait | Preuve |
|---|---|---|
| 2.1 | `.git` restauré : HEAD = `d17488a` (~état 2026-10-10, doc 22) ; `origin/main` = `f4ca696` ; reflog cohérent avec l'état restauré ; `.git` mtime 2026-10-12 12:57:50 | `git log`, `git reflog`, `stat .git` |
| 2.2 | **Commits absents du magasin d'objets** : `7dff2c6` (candidat), `24415b7` (docs candidat), `ce2f634`, `0207f96`, `dc59ea1`, `7179458` + toute la chaîne vagues 14-28 | `git cat-file -t` → ABSENT ×6 |
| 2.3 | **Tags disparus** : `candidat-app-audit-v1.2`, `candidat-docs-audit-v1.2` (restent v1.10.7/v1.10.8) | `git tag -l` |
| 2.4 | Staging `/tmp/c1-candidate` **disparu** (volatilité /tmp) — il était **présent et préservé** aux contrôles R2 (transcript R2-04 D.6 : SHA `16f3c3f4…84ae5`, inode 527790, liens 1, 2026-10-11 20:52) ; runbook §1.4/§2.10 anticipe la volatilité | `ls /tmp` |
| 2.5 | Arbre : 96 fichiers non suivis (dont docs 24-49, preuves R2, fichiers restaurés anciens `v4-*.png` mtime 2026-10-11 06:21-06:38) + 8 modifiés (dont `db/urbanisme-test.db` post-push, `worklog.md` avec tous les appends, `tsconfig.json` version candidate, 4 docs audit) | `git status --porcelain` |
| 2.6 | Copie `/tmp/my-project` (instantané 2026-10-11 20:57:58, **sans `.git`**) : contient les 2 bases (custom intègre `756c0158…` + test post-push `6b72e1dc…`) et les pièces R2 jusqu'à R2-04 — capital de récupération additionnel | inspection lecture seule |

### §2.1 Ce qui est PRÉSERVÉ (vérifié par SHA-256 le 2026-10-12)

- **Bases** : `db/custom.db` `756c0158…8126d` (STRICTEMENT INTACTE — jamais touchée) · `db/urbanisme-test.db` `6b72e1dc…65fb8` (état post-push R2 : 30 tables, drift 0, 38 lignes, données préexistantes prouvées intactes) · sauvegarde `backups/…-20261011T091500Z.db` `16f3c3f4…84ae5` (intacte).
- **Documents** : docs 24-49 sur disque — 46 (`820202f4…3db84`), 47 (`c898d550…a44e`), 48 (`9f1046cb…9257`) == empreintes consignées ; **doc 49 SHA actuel `d2094348…85e0b`** ≠ `fac31a43…d580` consigné en vague 29 (différence = correction de la référence SHA du GO interne faite après la première mesure — consignée ici).
- **Outils/preuves** : rows-dump gelé `f4ef4673…5bf0f` · DDL gelé `ab2c312b…e3355` · référence gelée `d2a9d500…4ba77` · vidages R2 `fb85ff00…9c3e` / `29f38a5f…c06e` · inventaire APRÈS `2ab378c3…ec8d` · transcripts gelés 26-28 (`e8561243` ×2, `cba78ca3…8bc9`, `1397cd85…a2b86`) · GO propriétaires (`b9f0b943…5912`, `3a142200…c066`) · v2.2 finale `85cfee28…d233` · suite finale `4ccd6a2b…78a6` · transcripts R2-01..R2-10 · `worklog.md` complet (vagues 1-29 + le présent append).
- **Copie 20:57** (`/tmp/my-project`) : bases + pièces R2-01..04 (redondance).

### §2.2 Ce qui est PERDU

Les objets Git des vagues 14-28 (commits candidat, tags candidat, chaîne complète) — **irrécupérables depuis le disque local** (aucune autre copie `.git` sur la machine ; `origin/main` distant n'a jamais reçu ces commits — push interdit par le protocole).

### §2.3 Conséquence : finalisation §5bis étapes 6-12 verrouillée

Le commit dédié R2 doit **descendre du candidat** (`7dff2c6`, §5bis étape 6) et les tags R2 doivent s'adosser à cette lignée. Créer ces commits/tags sur le HEAD restauré (`d17488a`) **falsifierait la lignée du candidat** et contredirait le §7.2 du GO (ordre immuable). Conformément aux règles du propriétaire (arrêt, préservation, aucune correction automatique) et au runbook §6 : **aucun commit, aucun tag, aucune reconstitution d'historique, aucune restauration** — tout est préservé et documenté dans l'attente d'une décision écrite.

### §2.4 Options soumises au propriétaire (aucune exécutée sans autorisation écrite)

1. **Restauration au niveau environnement** : si la plateforme d'exécution dispose d'un instantané du projet postérieur au 2026-10-11 21:00 UTC (état `HEAD 7179458`, 4 tags, arbre propre), le restaurer ; puis — le travail de correction v2.2 et les preuves étant conservés (fichiers + SHA) — reprendre la finalisation §5bis à l'étape 6 (re-vérification complète des préconditions §2 avant toute écriture).
2. **Reconstruction d'historique explicitement autorisée** : recréer sur le dépôt actuel une chaîne de commits **neuve et documentée comme telle** (re-matérialisation des fichiers docs 24-49 + evidence, messages référençant les SHA perdus et le présent incident) puis re-créer les tags candidat et R2 sur les nouveaux commits — **au prix documenté que les SHA 7dff2c6/24415b7 ne pourront jamais être restaurés identiquement** (nouvelle lignée) ; exigerait un dossier de traçabilité dédié et votre autorisation expresse (cette option touche à la discipline des tags et à l'historique : elle ne peut être décidée que par vous).
3. **Statu quo documenté** : conserver l'état actuel (bases correctes, preuves complètes sur disque, docs 24-49 non suivis) et décider ultérieurement.
4. **Toute autre instruction.**

## §3 — Red lines respectées (vague 30)

0 écriture `db/custom.db` (SHA AVANT=APRÈS) · 0 relance de `db:push` (instruction expresse — l'état post-push a été validé tel quel) · 0 modification des données/vidages/références gelées (SHA inchangés ; correction strictement logique) · `rows-dump.mjs` intact · 0 commit, 0 tag, 0 push, 0 BFG, 0 réécriture/restauration/reconstitution · staging : jamais touché (disparu de lui-même — preuve de préservation au R2-04 D.6) · docs 27-28 (preuves historiques) non réécrits (SHA inchangés) · S1, GO B, C2, diffusion inchangés.

---

*Rapport vague 30 — correction du comparateur achevée et validée conformément à la décision du propriétaire (option 1, doc 49) ; finalisation R2 verrouillée par la régression environnementale du dépôt Git ; état intégralement préservé et scellé par empreintes ; décision écrite requise (options §2.4).*
