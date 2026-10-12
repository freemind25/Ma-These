# 46 — RUNBOOK RÉ-SYNCHRONISATION `urbanisme-test.db` (OPTION A) — v3.3 : JOURNAUX PRÉSERVÉS (V24) + CONTENU LIGNE À LIGNE VALIDÉ PAR REVUE TECHNIQUE (V25-V26 : 18/18 TESTS SYNTHÉTIQUES), GO DÉFINITIF PRÊT À SIGNER, SANS EXÉCUTION

**Cycle :** audit-final-v1.2 · vague 20 (création) · vague 21 (complétion, 5 points) · vague 22 (consolidation, 6 points) · vague 23 (arbitrages 8.2/8.5/8.6 rendus — GO finalisé) · **vague 24 (correction sécurité : préservation des journaux SQLite)** · **vague 25 (comparateur de contenu ligne à ligne + reconfirmation des préconditions au moment R2)** · **vague 26 (revue technique du comparateur : canonisation durcie, garde de précision entière, faux positif R2 corrigé, suite de 18 tests synthétiques 18/18)** · **Date :** 2026-10-11
**Statut : RUNBOOK FINALISÉ v3.3 — ARBITRAGES TRANCHÉS (§8) + JOURNAUX SQLITE PRÉSERVÉS (vague 24, §6) + PRÉSERVATION PROUVÉE SUR LE CONTENU (vague 25, §2.7bis/§4.3bis) + COMPARATEUR VALIDÉ PAR REVUE TECHNIQUE (vague 26 : 18/18 tests synthétiques, §9bis) ; LE GO `RESYNC-TESTDB` (§7) EST DÉFINITIF ET PRÊT À SIGNER ; RIEN N'EST EXÉCUTÉ SUR LES BASES ; LES MESURES 2026-10-11 (vagues 21-26) SONT INDICATIVES ET NE SE SUBSTITUENT PAS À LA RECONFIRMATION DES PRÉCONDITIONS AU MOMENT R2 (§7.3).** L'option A est retenue **définitivement** : rupture contrôlée du hard link côté dépôt avant toute resynchronisation (§2bis). **Aucun changement appliqué à `db/urbanisme-test.db`, `db/custom.db`, au schéma Prisma, au code ou à la configuration.** Le C2 final sera préparé **pour R2** après correction et revalidation ; S1, GO B, push, BFG, levée de P7 et toute diffusion restent suspendus.
**Fondements :** doc 45 (qualification : gap 100 % additif, recommandation A au R2) · doc 41 (refigeage unique R2, S4) · épisode démontré 2026-09-18/28 (`specs/prod-readiness-audit/preuves.md` l.363-376 : chemin **absolu** requis) · garde-fou CI `.github/workflows/build-desktop.yml` l.44-56 · doc 24 §9 (red lines) · **décisions du propriétaire 2026-10-11 (vague 23 : six arbitrages, intégrés ci-dessous)**.

**Correspondance avec l'instruction du propriétaire (vague 21) :**

| Point demandé | Traité en |
|---|---|
| 1. Vérifier les deux liens physiques ; démontrer l'indépendance de la sauvegarde | **§1** (+ preuves §9) |
| 2. Confirmer le chemin absolu réellement utilisé par Prisma et le comportement effectif de `db:push` | **§2.9 et §3** |
| 3. Préservation des données préexistantes, table par table + arrêts sur modification destructive inattendue | **§3bis et §6** |
| 4. Contrôles après intervention : intégrité, FK, comptages/comparaison, dérive ×2, reproduction garde-fou CI | **§4 et §5** |
| 5. Texte d'autorisation autonome `RESYNC-TESTDB` (périmètre, préconditions, sauvegarde, rollback, preuves) | **§7** |
| Tag cible `candidat-app-audit-v1.2-R2` : absence vérifiée + point de création défini | **§5bis** |

**Consolidation vague 22 (instruction du propriétaire, 2026-10-11) :**

| Point demandé | Traité en |
|---|---|
| 1. Traitement du hard link `/tmp/c1-candidate/db/urbanisme-test.db`, sans supprimer ni modifier le staging automatiquement | **§1.4** (option A recommandée / option B — arbitrage au GO) |
| 2. Cible effective de Prisma confirmée + DDL attendu figé | **§2.11, §3.1** (preuve en direct §9) |
| 3. Conditions d'arrêt liées à `--accept-data-loss` et à la reconstruction `CustomBookSkill` | **§3bis items 8-10, §6** |
| 4. Comparaison AVANT/APRÈS confirmée + contrôles bloquants (custom.db, hard link, intégrité, FK, garde-fou CI) | **§4, §5** (comparateur démontré §9) |
| 5. Ordre de création : commit resync → tag app R2 → tag documentaire distinct | **§5bis** (discipline des tags) |
| 6. Règle anti-récurrence : contrôle de dérive des deux bases après chaque évolution de schéma | **§8.5** (formulée ; inscription permanente au commit docs R2) |

**Arbitrages rendus par le propriétaire (vague 23, 2026-10-11) — tous intégrés au présent document :**

| Arbitrage | Décision | Traité en |
|---|---|---|
| 8.6 — hard link C1 | **Option A** : rupture du lien côté dépôt par création d'un fichier indépendant, remplacement atomique et vérification SHA-256, AVANT toute resynchronisation ; **ni suppression ni modification automatique** de `/tmp/c1-candidate/db/urbanisme-test.db` ; contenu du staging identique à l'état pré-resync ; aucun changement Git inattendu | **§2bis** (procédure), §1.4, §4.6 |
| 8.2 — tag documentaire | **`candidat-docs-audit-v1.2-R2`**, créé uniquement après validation des preuves et du commit documentaire | **§5bis** étape 12, §7 |
| 8.5 — règle anti-récurrence | Inscription dans **`AGENTS.md`** au commit documentaire R2 : contrôle de dérive des deux bases après chaque évolution de `prisma/schema.prisma` et avant tout commit, build, tag ou distribution ; les deux contrôles exit 0, résultats consignés ; toute dérive bloque la suite | **§8.5** (texte exact), §7 |
| Runbook — gel et arrêts | DDL attendu et SHA de référence **gelés** ; toute différence inattendue, toute opération destructive hors du périmètre explicitement accepté, toute erreur Prisma ou toute altération de `custom.db` = **arrêt immédiat, aucune nouvelle tentative avant analyse du résidu et décision écrite** | §3bis, **§6**, §7 |
| Ordre de finalisation | 12 étapes : GO écrit → contrôles préalables → rupture hard link → resync → contrôles → commit dédié → validation des preuves → tag app R2 → empreinte archive → docs + PA4 → commit docs → tag docs R2 | **§5bis**, §7 |
| Interdictions maintenues | Aucune écriture dans `custom.db` · aucun `db:push` sur la base réelle · aucun déplacement/suppression d'un tag existant · aucun push Git · aucune réécriture d'historique · aucun GO B · aucune diffusion sans autorisation spécifique | §7 (périmètre), §10 |
| **8.7 — récupération après push échoué (vague 24)** | **Préservation des journaux SQLite** : arrêt immédiat de toute nouvelle opération ; base, journaux (`-journal`/`-wal`) et fichiers associés **préservés** ; aucune suppression ni déplacement manuel d'un journal avant analyse d'état et validation de la procédure de récupération ; restauration uniquement après vérification de la sauvegarde indépendante ; décision écrite avant toute reprise | **§6** (protocole 5 points), §3bis item 9, §7.4-7.5 |

---

## §1 — Périmètre exact et **liens physiques vérifiés** (point 1)

| Élément | Statut |
|---|---|
| `db/urbanisme-test.db` | **SEUL fichier modifié** (push additif + commit dédié) |
| `db/custom.db` | **Hors périmètre** — SHA-256 `756c0158…8126d` devant rester inchangé (contrôle bloquant **n° 1** après push, §4.1) |
| `prisma/schema.prisma` | **Hors périmètre** — `git diff` doit rester vide |
| Tout autre fichier versionné | Hors périmètre |
| Commit dédié | `chore(db): ré-synchronisation urbanisme-test.db sur le schéma datamodel (option A — doc 45), drift zéro, données préservées` |
| Moment | **Refigeage R2 de S4**, après la revalidation de phase R, **avant** le gel final et la création du tag R2 (§5bis) |
| Autorisation | **Opération distincte** — texte §7 ; ni le GO A seul ni le présent document ne l'autorisent |

### §1.1 — Vérification exécutée des liens physiques (2026-10-11, `stat` + `find -samefile`)

**Correction de l'observation consignée en vague 20** (« les deux fichiers présentent un compte de liens 2 ») — mesure réelle :

| Fichier | inode | liens | Vérification `find -xdev -samefile` |
|---|---|---|---|
| `db/custom.db` | 527789 | **1** | un seul chemin sur tout le système de fichiers |
| `db/urbanisme-test.db` | 527790 | **2** | **deux chemins** : `/home/z/my-project/db/urbanisme-test.db` **et** `/tmp/c1-candidate/db/urbanisme-test.db` |

**Identification du second lien** : `/tmp/c1-candidate/` est la copie de staging du cycle C1 (build web, hors dépôt, non versionnée, sous `/tmp` volatile). Analyse de son `db/` :
- `db/urbanisme-test.db` (staging) → **même inode 527790** = **lien physique**, pas une copie ;
- `db/custom.db` (staging) → inode 573344, 1 lien, 222 609 408 o (état antérieur, mtime 2026-10-11 06:11) = **copie réelle distincte**, non concernée par le présent runbook.

### §1.2 — Conséquences opérationnelles (inscrites au runbook)

1. **Le push s'exécute en place** : écrire `db/urbanisme-test.db` modifiera **simultanément** le jumeau `/tmp/c1-candidate/db/urbanisme-test.db` (même inode). **Effet attendu, non un défaut** — consigné au contrôle §4.6 : après push, SHA(jumeau) == SHA(dépôt).
2. **Le jumeau /tmp n'est PAS une sauvegarde** : il suit la source octet par octet. Toute restauration doit partir de la sauvegarde §2.8 (copie réelle), **jamais** du jumeau.
3. **La sauvegarde préalable doit être une copie réelle (`cp`), jamais `cp -l`** — un lien physique partagerait l'inode de la source et muterait avec elle au moment du push (mode de défaillance exact démontré par le jumeau /tmp).

### §1.3 — **Démonstration constituée : la sauvegarde est indépendante de la source** (2026-10-11)

Sauvegarde pré-constituée dès la préparation (la base ne changera plus d'ici R2 — re-vérification bloquante §2.8) :

```bash
cp --preserve=timestamps db/urbanisme-test.db \
  audit/baseline/evidence/backups/urbanisme-test-avant-resync-20261011T091500Z.db
```

| Mesure | Source `db/urbanisme-test.db` | Sauvegarde `evidence/backups/urbanisme-test-…Z.db` |
|---|---|---|
| inode | 527790 | **169333 — DIFFÉRENT** |
| compteur de liens | 2 (avec le jumeau /tmp) | 1 |
| SHA-256 | `16f3c3f4…7584ae5` | `16f3c3f4…7584ae5` (identique) |
| taille / mtime | 552 960 o / 2026-10-02 17:26:56 | 552 960 o / 2026-10-02 17:26:56 (préservé) |

**Indépendance prouvée par l'inode** : le push écrit la source **en place** (inode 527790) ; l'inode 169333 de la sauvegarde n'est atteint par aucun chemin d'écriture de l'opération. Contrôle couvrant tout chemin d'écriture résiduel : SHA-256 AVANT=APRÈS sur les deux bases (§2.5/§4.1). La sauvegarde est également commitée avec le présent document (redondance dans l'historique git).

### §1.4 — Traitement du hard link `/tmp/c1-candidate/db/urbanisme-test.db` — **OPTION A TRANCHÉE (arbitrage 8.6, vague 23)**

**Principe : AUCUNE action automatique sur le staging** — ni suppression, ni écriture directe sur son chemin. **Décision du propriétaire (2026-10-11) : option A** — avant toute resynchronisation, rupture du lien **côté dépôt** par création d'un fichier indépendant, remplacement atomique et vérification SHA-256 (procédure exécutable **§2bis**) ; le staging `/tmp/c1-candidate/db/urbanisme-test.db` n'est **ni supprimé ni modifié automatiquement** ; son contenu doit rester **identique à son état pré-resync** et le remplacement ne doit introduire **aucun changement Git inattendu**. L'option B est **écartée** (conservée ci-dessous pour archive) :

| | **Option A — rupture préalable du lien CÔTÉ DÉPÔT (RETENUE — arbitrage 8.6)** | **Option B — statu quo, propagation acceptée (ÉCARTÉE)** |
|---|---|---|
| Opération | Avant le push : `cp --preserve=timestamps db/urbanisme-test.db db/.resync-inode.db && mv db/.resync-inode.db db/urbanisme-test.db` — remplace l'entrée du dépôt par un **nouvel inode à contenu identique** (SHA re-vérifié `16f3c3f4…` avant ET après l'opération) ; opération **à contenu constant**, invisible pour git (`git status` doit rester propre) | aucune |
| Effet sur le staging | **Aucun** — le jumeau conserve son inode (527790, liens 2→1) et son contenu pré-resync : **ni supprimé ni modifié** (contrainte de l'instruction satisfaite à la lettre) | le contenu du jumeau change **simultanément** avec la source (même inode) — le staging est modifié par effet de bord, sans action sur son chemin |
| Contrôle après push (§4.6) | SHA(jumeau) == `16f3c3f4…84ae5` (**préservé**) — preuve supplémentaire que le push n'a pas touché le staging | SHA(jumeau) == SHA(dépôt après push) (propagation attendue) |
| Re-vérification au R2 (§2.10) | liens et chemins re-mesurés (`stat` + `find -xdev -samefile`) avant application ; si le jumeau a disparu (`/tmp` volatile), l'option A se réduit à une copie triviale et l'option B ne présente plus d'effet | idem |

**Avec l'option A, l'état pré-resync `16f3c3f4…84ae5` dispose de trois copies indépendantes** : la sauvegarde (inode 169333) + le commit git du backup + le jumeau /tmp préservé.

## §2 — Pré-conditions (toutes bloquantes, avant la première commande de modification)

| # | Contrôle | Commande | Sortie attendue |
|---|---|---|---|
| 2.1 | **Autorisation écrite spécifique** consignée (§7) | — | décision horodatée |
| 2.2 | Contexte R2 atteint (phase R terminée et validée) | journal de fenêtre | accord consigné |
| 2.3 | Arbre propre | `git status --porcelain` | vide |
| 2.4 | Serveur arrêté | `curl -s localhost:3000` | échec connexion |
| 2.5 | État de départ conforme (re-mesuré 2026-10-11, identique) | `sha256sum db/urbanisme-test.db db/custom.db` + `stat` | `16f3c3f4…84ae5` (552 960 o, mtime 2026-10-02 17:26:56) et `756c0158…8126d` (265 330 688 o, mtime **référence consignée** 2026-10-11 06:45:23.410462155 — valeur stable depuis les vagues 12-14, docs 38/43). Toute divergence SHA = **ARRÊT** |
| 2.6 | Drift de départ **attendu** : custom = 0, test = 2 — **re-exécuté 2026-10-11** (`evidence/resync-testdb-drift-avant.txt`, SHA `3f07f6a6…d6a388b3`) | `bunx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-url file:db/custom.db --exit-code` puis idem `file:db/urbanisme-test.db` | `exit=0` (« No difference detected. ») puis `exit=2` — **toute autre valeur = ARRÊT** |
| 2.7 | Instantané des données de la base de test (AVANT) — **constitué 2026-10-11** (`evidence/resync-testdb-before.json`, SHA `bc3e339c…66c3f8fa`, produit par `evidence/resync-testdb-inventory.mjs`, mode `ro` + `PRAGMA query_only=1`) | `bun audit/baseline/evidence/resync-testdb-inventory.mjs db/urbanisme-test.db > audit/baseline/evidence/resync-testdb-before.json` | 25 tables · Thesis **1** · Chapter **7** · ChapterVersion **3** · Job **2** · ThesisCadrage **1** · ThesisCadrageField **12** · Reference **12** · 18 tables à 0 (38 lignes) · integrity ok · FK 0 — toute divergence avec ce JSON = **ARRÊT** |
| **2.7bis** | **Vidage de CONTENU AVANT (arbitrage vague 25)** — deux tables peuvent avoir le même comptage avec des données différentes : la référence de préservation porte sur le **contenu ligne à ligne**, constituée **immédiatement avant le push**. **Règle d'exclusivité de la référence (revue vague 26, point C du propriétaire)** : la référence utilisée pour la comparaison APRÈS est **exclusivement** le vidage reconstitué au R2, créé **immédiatement avant la resynchronisation** puis **conservé sans modification** pendant toute l'opération ; aucune référence antérieure (vagues 25-26 : `resync-testdb-rows-avant.json`, empreinte globale `faed00f9…80f6d` — stable entre l'outil v1 et v2, preuve de stabilité de format) ne doit être utilisée pour la comparaison post-push : elle ne sert que de preuve d'outillage et d'état de contenu courant | `bun audit/baseline/evidence/resync-testdb-rows-dump.mjs db/urbanisme-test.db > <vidage-avant-R2.json>` (lecture seule : connexion `ro` + `PRAGMA query_only=1` ; outil v2 : garde de précision entière — tout INTEGER hors plage JS-safe = REFUS exit 2) | JSON constitué : 25 tables, lignes canonisées triées + SHA-256 par table + empreinte globale — toute erreur d'exécution, tout refus de vidage = **ARRÊT** |
| 2.8 | Sauvegarde préalable — **DÉJÀ CONSTITUÉE** (§1.3) | `sha256sum` backup + `stat` backup vs source | SHA backup == `16f3c3f4…84ae5` **et** inode backup ≠ inode source — si la source a divergé depuis le 2026-10-11 : re-créer la copie (jamais `cp -l`) puis re-vérifier |
| 2.9 | **URL effective vérifiée** : `.env` contient `DATABASE_URL=file:/home/z/my-project/db/custom.db` (ABSOLU — vérifié 2026-10-11). La variable passée **en ligne** dans la commande §3 **prévaut** sur `.env` (dotenv n'écrase pas l'environnement existant). Sans cette substitution, `db:push` ciblerait la **base réelle**. Détecteur définitif : §4.1 en premier contrôle | `rg -n 'DATABASE_URL' .env` | la ligne pointe `custom.db` → la substitution en ligne est **obligatoire** |
| 2.10 | **État des liens re-mesuré au R2** | `stat -c '%i %h' db/urbanisme-test.db` + `find -xdev -samefile db/urbanisme-test.db` | état conforme à §1.1 (test : 2 liens dont jumeau `/tmp` ; custom : 1 lien), consigné — tout état inattendu (lien inconnu, jumeau modifié sans explication) = **ARRÊT** ; si le jumeau a disparu (`/tmp` volatile), l'option A §2bis se réduit à une copie triviale à contenu constant (consigner) |
| 2.11 | **DDL attendu GELÉ** — hash pré-flight == référence (§3.1) | `bunx prisma migrate diff --from-url file:/home/z/my-project/db/urbanisme-test.db --to-schema-datamodel prisma/schema.prisma --script \| sha256sum` | == `ab2c312ba1fa021e…07e3355` — **toute divergence = ARRÊT** (le gap aurait changé depuis le 2026-10-11 : nouvelle mesure + nouveau gel sous autorisation) |

## §2bis — Rupture contrôlée du hard link côté dépôt — **option A arbitrée** (arbitrage 8.6, vague 23)

**Objet** : exécuter l'arbitrage 8.6 **AVANT le push** (ordre de finalisation, étape 3) — remplacer l'entrée de dépôt `db/urbanisme-test.db` par un **nouvel inode à contenu identique**, de sorte que le push ne propage plus au staging `/tmp/c1-candidate/db/urbanisme-test.db` (ce dernier n'étant **ni supprimé ni modifié**, son contenu pré-resync préservé). **Opération à contenu constant** : invisible pour git.

| # | Commande | Sortie attendue (toutes bloquantes) |
|---|---|---|
| A.1 | État AVANT : `sha256sum db/urbanisme-test.db /tmp/c1-candidate/db/urbanisme-test.db` + `stat -c '%i %h'` sur les deux | SHA ×2 == `16f3c3f4…84ae5` · inode **527790** · liens **2** ×2 — sinon **ARRÊT** |
| A.2 | Création du fichier indépendant : `cp --preserve=timestamps db/urbanisme-test.db db/.resync-inode.db` | `sha256sum db/.resync-inode.db` == `16f3c3f4…84ae5` · inode ≠ 527790 · liens 1 — sinon **ARRÊT** (**jamais `cp -l`**) |
| A.3 | **Remplacement atomique** (rename sur le même système de fichiers) : `mv db/.resync-inode.db db/urbanisme-test.db` | — |
| A.4 | Vérification dépôt : `sha256sum db/urbanisme-test.db` + `stat -c '%i %h' db/urbanisme-test.db` | SHA == `16f3c3f4…84ae5` (**contenu identique**) · **nouvel inode ≠ 527790** · liens **1** — inode inchangé = rupture échouée : **ARRÊT** |
| A.5 | Vérification staging (**ni supprimé, ni modifié**) : `sha256sum /tmp/c1-candidate/db/urbanisme-test.db` + `stat -c '%i %h' /tmp/c1-candidate/db/urbanisme-test.db` | SHA == `16f3c3f4…84ae5` (**identique à l'état pré-resync**) · inode **527790 conservé** · liens 2→1 — toute divergence = **ARRÊT** |
| A.6 | Aucun changement Git inattendu : `git status --porcelain` ; rupture prouvée : `find -xdev -samefile db/urbanisme-test.db` | `git status` **vide** (contenu constant) · **un seul chemin** (rupture consommée) — sinon **ARRÊT** |

**Arrêts spécifiques à la rupture** : SHA divergent à A.1/A.2/A.4/A.5 · inode inchangé à A.4 · staging absent ou modifié à A.5 sans explication consignée (voir §2.10) · `git status` non vide à A.6. **En cas d'échec : ARRÊT + restauration §6.1 depuis la sauvegarde + re-mesure complète (§2.5, §2.10) ; aucune nouvelle tentative sans décision écrite.** Si le jumeau a disparu (`/tmp` volatile), A.1/A.5 se réduisent à une consignation et l'opération garde son effet (rupture sans objet) — consigner.

**Effet cumulé** : après rupture réussie, l'état pré-resync `16f3c3f4…84ae5` dispose de **trois copies indépendantes** — la sauvegarde (inode 169333) · le commit git du backup · le jumeau `/tmp` (inode 527790, désormais isolé).

## §3 — Modification unique : push additif sur la base de test — **comportement effectif de `db:push`** (point 2)

```bash
DATABASE_URL="file:/home/z/my-project/db/urbanisme-test.db" bun run db:push
```

**Chaîne de résolution (confirmée par inspection + épisode démontré) :**
- Script versionné `package.json` l.12 : `"db:push": "prisma db push --accept-data-loss"` — aucun autre script ne cible la base de test ;
- `prisma/schema.prisma` : `url = env("DATABASE_URL")` → la variable d'environnement passée en ligne **prévaut** sur `.env` (§2.9) ;
- **Leçon 2026-09-18 (citation exacte, `specs/prod-readiness-audit/preuves.md` l.363-376)** : 1ᵉʳ essai `DATABASE_URL="file:db/urbanisme-test.db" bun run db:push` → **INEFFICACE** — « Prisma résout les chemins `file:` relatifs au DOSSIER DU SCHÉMA (`prisma/`) : un résidu `prisma/db/urbanisme-test.db` vide a été créé, puis NETTOYÉ » ; 2ᵉ essai chemin **absolu** → efficace, « No difference detected. ». Le garde-fou `tests/database-runtime-build.sh` (« database path must be absolute ») valide la chaîne de build par construction ;
- **Nuance documentée** : pour `prisma migrate diff` exécuté depuis la racine, la forme relative `file:db/…` du garde-fou CI fonctionne (prouvé T3, re-prouvé vagues 18/19/21 — l'`exit 2` correspond au gap exact doc 45) ; l'exigence de chemin **absolu** vaut pour **`db push`** ;
- Effet secondaire normal de `db push` : régénération du client (`node_modules/.prisma`, hors dépôt — `git status` inchangé) ; aucun résidu `prisma/db/` toléré (vérification §4.7) ;
- **Aucun autre flag, aucun autre fichier, aucune improvisation.**

**Arrêts pendant le push** : annonce de perte de données **d'un autre motif** que la reconstruction attendue de `CustomBookSkill` (§3bis) · toute invite interactive · toute opération mentionnant une table ou colonne hors du périmètre §3bis → **ARRÊT IMMÉDIAT** (contradiction avec le gap 100 % additif du doc 45).

### §3.1 — DDL attendu **figé** et cible effective de Prisma (point 2 vague 22)

**DDL gelé** : la référence `evidence/resync-testdb-ddl-attendu.sql` (SHA-256 **`ab2c312ba1fa021e064903b92153932f1574fd4a19642d94fee99020407e3355`**, commit marqueur `ce2f634`) fait foi ; au R2, le hash du diff pré-flight (§2.11) doit être **identique** — toute divergence = ARRÊT + requalification (gap changé : nouvelle mesure + nouveau gel sous autorisation).

**Cible effective de Prisma — prouvée en direct le 2026-10-11 (vague 22)** par introspection lecture seule (`prisma db pull --print`, n'écrit rien) : cible par défaut (`.env`) = **30 modèles** → `custom.db` ; avec `DATABASE_URL` en ligne = **25 modèles** → `urbanisme-test.db` (`evidence/resync-testdb-cible-prisma-vague22.txt`). La prévalence de la variable en ligne est **démontrée en exécution** ; l'épisode 2026-09-28 en est la preuve opérationnelle historique (push en ligne → base de test touchée, base réelle restée intacte). Triple protection au R2 : variable en ligne obligatoire (§2.9) · hash DDL gelé (§2.11) · SHA `custom.db` en premier contrôle post-push (§4.1).

## §3bis — Préservation des données préexistantes, **table par table** (point 3)

**Référence sémantique** : `evidence/resync-testdb-ddl-attendu.sql` (empire `ab2c312b…07e3355`, généré 2026-10-11 par `prisma migrate diff --from-url file:/home/z/my-project/db/urbanisme-test.db --to-schema-datamodel prisma/schema.prisma --script` — comparaison **sans écriture**). Le DDL attendu contient **exactement** :

| Opération DDL | Détail | Impact données |
|---|---|---|
| `ALTER TABLE "Chapter" ADD COLUMN "stamp" TEXT` | colonne **nullable**, pas de défaut | 7 lignes existantes intactes, `stamp` = NULL |
| `ALTER TABLE "ChapterVersion" ADD COLUMN "stamp" TEXT` | nullable | 3 lignes intactes, `stamp` = NULL |
| `ALTER TABLE "Job" ADD COLUMN "progress" INTEGER` + `ADD COLUMN "progressNote" TEXT` | nullables | 2 lignes intactes |
| **Reconstruction `CustomBookSkill`** (motif SQLite standard en 5 étapes) : `CREATE TABLE "new_CustomBookSkill"` → `INSERT INTO new_… SELECT` **copie des 6 colonnes existantes** → `DROP TABLE "CustomBookSkill"` → `RENAME` → `CREATE INDEX "CustomBookSkill_title_idx"` | ajout de `description`/`source` (nullables) + `enabled BOOLEAN NOT NULL DEFAULT false` | **0 ligne aujourd'hui** (inventaire §2.7) → copie triviale, **risque nul** ; c'est le **seul `DROP`** du DDL et le motif exact pour lequel `--accept-data-loss` est requis — sans perte réelle (copie intégrale + table vide) |
| `CREATE TABLE` ×5 : `SoutenancePrep` (FK→Thesis CASCADE, `thesisId` unique), `LegalRef` (sans FK), `Article` (`thesisId` nullable, sans contrainte FK dans le DDL), `ArticleVersion` (FK→Article CASCADE), `ImportedDoc` (`thesisId` nullable) | créées **vides** par construction | 0 ligne chacune |
| `CREATE INDEX` ×6 : `SoutenancePrep_thesisId_key` (**UNIQUE**), `SoutenancePrep_thesisId_idx`, `LegalRef_domaine_idx`, `Article_thesisId_idx`, `ArticleVersion_articleId_idx`, `ImportedDoc_thesisId_idx` | cohérents avec doc 45 §2 | — |
| **Les 21 autres tables** (AgileSprint, AgileStory, DoctoralToolbox, DocumentChunk, ElementAnalyse, Experiment, ExperimentRun, LicenseKey, NotebookEntry, Part, Reference, ResearchSource, ResearchTab, SavedSearch, SavedSearchResult, SessionVerification, Thesis, ThesisCadrage, ThesisCadrageField, ThesisCadrageVersion, TypeAnalyseMethodologique) | **AUCUN DDL** — aucune instruction ne les touche | comptages et contenus bit-à-bit préservés |

**Comptages AVANT de référence** (38 lignes au total, `resync-testdb-before.json`) : Thesis 1 · ThesisCadrage 1 · ThesisCadrageField 12 · Reference 12 · Chapter 7 · ChapterVersion 3 · Job 2 · les 18 autres tables à 0. **Attendu APRÈS : identiques, à l'exception d'aucune table** — les 5 nouvelles sont vides.

**Conditions d'arrêt sur modification destructive inattendue** (toute occurrence = **ARRÊT + restauration §6 + signalement**) :
1. une table **autre** que `CustomBookSkill` fait l'objet d'un `DROP`, `DELETE`, `UPDATE` ou `RENAME` ;
2. une colonne **autre** que les 7 listées est ajoutée, modifiée ou supprimée ;
3. le push annonce une perte de données **d'un autre motif** que la reconstruction attendue, ou demande une confirmation interactive ;
4. un comptage post-push diverge du JSON AVANT (§4.3) ;
5. `integrity_check` ≠ ok ou violation FK (§4.2) ;
6. `db/custom.db` modifié (SHA §4.1) — signalement **prioritaire** ;
7. `prisma/schema.prisma` ou tout fichier versionné autre que `db/urbanisme-test.db` modifié (§4.5) ;
8. **spécifique `--accept-data-loss`** : le drapeau supprime l'invite interactive **pour le seul motif attendu** (reconstruction `CustomBookSkill`, §3bis) — il ne doit masquer **aucun autre motif** : toute mention, dans la sortie du push, d'une opération destructive (DROP/DELETE/UPDATE) visant une table **autre** que `CustomBookSkill`, ou visant l'une des 5 tables nouvelles, = **ARRÊT** ; de même, la reconstruction observée ne doit porter que sur cette table (copie intégrale des 6 colonnes existantes, table à 0 ligne — tout comportement différent = ARRÊT) ;
9. **push échoué (code de sortie non nul)** : ARRÊT immédiat, **aucune nouvelle tentative**, aucun correctif improvisé ; protocole de **PRÉSERVATION** des journaux SQLite §6 (base + `-journal`/`-wal` intacts — **aucune suppression ni déplacement automatique**) ; restauration uniquement après vérification de la sauvegarde indépendante et validation de la procédure ;
10. après push : drift ≠ exit 0 sur l'une des bases = **ARRÊT** (structure non synchronisée).

## §4 — Contrôles immédiats APRÈS push (tous bloquants, dans l'ordre)

| # | Contrôle | Commande | Sortie attendue |
|---|---|---|---|
| 4.1 | **Base réelle intouchée — PREMIER contrôle** (seul détecteur d'un push hors cible : le drift de `custom.db` resterait à 0 même si elle était écrasée) | `sha256sum db/custom.db` + taille + mtime | `756c0158…8126d` · 265 330 688 o · mtime référence §2.5 — **toute divergence = ARRÊT + restauration §6 + signalement prioritaire** |
| 4.2 | Intégrité SQLite + FK de la base de test | `bun audit/baseline/evidence/resync-testdb-inventory.mjs db/urbanisme-test.db` | `integrity_check` = **ok** · violations FK = **0** |
| 4.3 | Préservation des données + structure — **comparateur structuré (comptages)** | `bun audit/baseline/evidence/resync-testdb-compare.mjs audit/baseline/evidence/resync-testdb-before.json <inventaire-après.json>` (outillage démontré §9) | verdict **PASS** (exit 0) : integrity ok ×2, FK 0 ×2, 30 tables = 25 préexistantes (comptages identiques) + 5 nouvelles à 0, 6 index attendus présents — tout FAIL = **ARRÊT + restauration §6** |
| **4.3bis** | **Préservation du CONTENU — comparateur ligne à ligne (arbitrage vague 25 — BLOQUANT)** : des comptages identiques ne prouvent PAS que les données sont identiques ; le contenu de **chaque** table préexistante (les 25) doit être **identique valeur par valeur**. **Complétude (revue vague 26, point D du propriétaire)** : le comparateur v2.1 accepte exactement les 5 nouvelles tables **vides** (règle conditionnelle R4 — elles sont par ailleurs contrôlées séparément au §4.4) et rejette toute table inattendue (R5) ; **ce contrôle COMPLETE et ne remplace AUCUN autre contrôle** (§4.1 custom.db, §4.2 intégrité/FK, §4.3 comptages, §4.4 tables/index, §4.5 périmètre, §4.6 staging, §4.7 drift, garde-fou CI §5) | `bun audit/baseline/evidence/resync-testdb-rows-dump.mjs db/urbanisme-test.db > <vidage-après.json>` puis `bun audit/baseline/evidence/resync-testdb-compare-contenu.mjs <vidage-avant-R2.json> <vidage-après.json>` (les deux vidages constitués au R2 conformément à §2.7bis — l'APRÈS contiendra 30 tables : 25 préexistantes + 5 nouvelles vides) | verdict **PASS** (exit 0) : contenu ligne à ligne identique sur les 25 préexistantes + empreinte globale restreinte identique + 5 nouvelles présentes et vides + aucune table inattendue ; tout FAIL (y compris « comptages identiques mais contenu divergent ») = **ARRÊT + restauration §6** |
| 4.4 | Tables nouvelles vides | sortie §4.2 | `SoutenancePrep` **0** · `LegalRef` **0** · `Article` **0** · `ArticleVersion` **0** · `ImportedDoc` **0** · 6 index nouveaux présents (§3bis) |
| 4.5 | Schéma intouché + périmètre | `git diff --stat prisma/schema.prisma` ; `git status --porcelain` | diff vide · **uniquement** `db/urbanisme-test.db` modifié |
| 4.6 | Jumeau /tmp — **option A arbitrée (§2bis)** : le staging ne doit PAS avoir suivi le push | `sha256sum /tmp/c1-candidate/db/urbanisme-test.db` + `stat -c '%i %h'` | == `16f3c3f4…84ae5` (**préservé à l'état pré-resync**) · inode 527790, liens 1 ; jumeau `custom.db` du staging (inode distinct) inchangé — toute autre valeur = **ARRÊT** |
| 4.7 | Drift sur les **deux** bases + aucun résidu | les 2 commandes §2.6 ; vérifier absence `prisma/db/` | **`exit=0` et `exit=0`** (« No difference detected. » ×2) · pas de résidu — tout écart = **ARRÊT** |

## §5 — Validation R2 (point 4 — intégrée à la fenêtre)

Après le commit dédié et **avant** le gel final + tags R2 (§5bis), exécuter et consigner (enrichit le paquet PA4, doc 32 §7) :

| Contrôle | Méthode | Verdict attendu |
|---|---|---|
| Intégrité SQLite (2 bases) | `bun audit/baseline/evidence/resync-testdb-inventory.mjs <base>` en mode `ro` ×2 | ok · ok |
| Clés étrangères (2 bases) | `foreign_key_check` des mêmes sorties | 0 violation · 0 violation |
| État logique des données | mêmes sorties : `custom.db` = 30 tables / Reference **4** / Thesis **1** (inchangé) · `urbanisme-test.db` = 30 tables / comptages §4.3-4.4 | conforme |
| **Comparaison des données AVANT/APRÈS (comptages)** | `resync-testdb-compare.mjs <avant.json> <après.json>` — règles structurées : comptages identiques sur les 25 tables, 5 nouvelles vides, 6 index, intégrité ok ×2, FK 0 ×2 | verdict **PASS** |
| **Comparaison du CONTENU AVANT/APRÈS (ligne à ligne — vague 25)** | `resync-testdb-compare-contenu.mjs <vidage-avant-R2.json> <vidage-après.json>` — contenu identique valeur par valeur sur les 25 tables préexistantes + empreinte globale restreinte identique + 5 nouvelles vides + aucune table inattendue (v2.1) | verdict **PASS** |
| **Non-substitution des contrôles (revue vague 26, point D)** | vérification de procédure : tous les contrôles complémentaires ci-dessus sont exécutés et consignés — **aucun n'est remplacé** par la seule réussite du comparateur de contenu ; les 5 nouvelles tables sont vérifiées séparément (§4.4 : 0 ligne + 6 index) | les 8 contrôles §4.1-4.7 + garde-fou CI tous consignés |
| Dérive sur les **deux** bases | `prisma migrate diff --exit-code` ×2 | **exit 0 ×2** |
| **Garde-fou CI reproduit localement** | exécution dans un shell `bash` des commandes **exactes** de `.github/workflows/build-desktop.yml` l.51-54 sous `set -e` : `bunx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-url file:db/custom.db --exit-code` puis `file:db/urbanisme-test.db`, avec les deux échos « synchrone » | les deux commandes passent + échos affichés + exit 0 global — **le garde-fou est rétabli, non contourné** |
| Empreinte du candidat R2 | `git archive --format=tar candidat-app-audit-v1.2-R2 \| sha256sum` | valeur **nouvelle** consignée au journal + **doc 24 §0 mis à jour avant toute exécution C2 sur R2** |
| Commit dédié | `git log --stat -1` | 1 fichier, `db/urbanisme-test.db`, message §1 |

> Le run CI réel (remote) reste hors de portée de l'environnement d'audit (aucun push) : la reproduction locale du step exact vaut preuve ; le premier run CI réel confirmera (consignation à prévoir).
>
> **Comportement bloquant du garde-fou démontré en l'état** (2026-10-11, `evidence/resync-testdb-ci-guard-bloquant-vague22.txt`) : exécuté à l'identique (set -e), le step affiche l'écho custom puis **s'arrête avec exit 2** sur la base de test (les échos suivants et le PASS final n'apparaissent pas) — le garde-fou protège bien. Au R2, la reproduction devra afficher **les deux échos** + exit 0 global.

## §5bis — Tag cible `candidat-app-audit-v1.2-R2` : absence vérifiée + point de création

**Vérification d'absence (2026-10-11)** — `git tag -l` ne contient que 4 tags : `candidat-app-audit-v1.2` → 7dff2c6 (léger, objecttype *commit*) · `candidat-docs-audit-v1.2` → 24415b7 (léger) · `v1.10.7` → 058b80c (léger) · `v1.10.8` → annoté, commit f0e1a4b. **`candidat-app-audit-v1.2-R2` n'existe pas** (ni `candidat-docs-audit-v1.2-R2`) — le nom est **disponible** et conforme à la proposition doc 41 §2.1. Re-vérifié vague 23 (2026-10-11) : toujours 4 tags, aucun tag R2.

**Point de création — ordre de finalisation à 12 étapes (arbitrage propriétaire, vague 23 — aucun tag créé aujourd'hui) :**
1. **autorisation écrite dédiée** `RESYNC-TESTDB` (GO §7, signé) ;
2. **contrôles préalables** (§2, tous bloquants) ;
3. **rupture contrôlée du hard link** (option A, §2bis) ;
4. **ré-synchronisation de `urbanisme-test.db`** (§3) ;
5. **contrôles après opération** (§4, tous bloquants) ;
6. **commit dédié** (1 fichier : `db/urbanisme-test.db`) — c'est lui qui porte l'état « candidat R2 côté application » ;
7. **validation des preuves** (§5, toutes vertes) ;
8. **tag applicatif R2** : `candidat-app-audit-v1.2-R2` (léger, sur le commit dédié — même style que `candidat-app-audit-v1.2`) ;
9. **calcul et consignation de l'empreinte de l'archive** : `git archive --format=tar candidat-app-audit-v1.2-R2 | sha256sum` → consignée au journal + doc 24 §0 ;
10. **mise à jour documentaire et preuves PA4** : doc 24 §0 (nouvelle empreinte) · `AGENTS.md` (règle anti-récurrence §8.5) · doc 46 §10 · worklog ;
11. **commit documentaire** ;
12. **tag documentaire R2** : `candidat-docs-audit-v1.2-R2` (léger, sur le commit documentaire) — créé **uniquement après validation des preuves et du commit documentaire** (arbitrage 8.2).

Ensuite : le **C2 final est préparé pour R2** uniquement après la mise à jour du doc 24 §0 (instruction du propriétaire : « Le C2 final sera préparé pour R2 après correction et revalidation »).

**Ordre immuable** : les 12 étapes ci-dessus, jamais l'inverse. **Discipline des tags** : un tag créé ne peut être **ni déplacé ni supprimé** ; toute erreur postérieure à la création d'un tag = arrêt + arbitrage écrit (un tag correctif serait créé, jamais réécrit).

## §6 — Conditions d'arrêt et retour arrière

**Déclencheurs d'ARRÊT immédiat** : toute valeur inattendue aux §2.5-2.11, §2bis, §3, §4.1-4.7, §5 — notamment les 10 cas §3bis. **Règle du propriétaire (arbitrage vague 23) : toute différence inattendue, toute opération destructive hors du périmètre explicitement accepté, toute erreur Prisma ou toute altération de `custom.db` entraîne un arrêt immédiat. Aucune nouvelle tentative ne doit être lancée avant analyse du résidu éventuel et décision écrite du propriétaire.** Aucun correctif improvisé ; le silence ne vaut jamais acceptation.

**Retour arrière** (dans l'ordre) :
1. **Avant commit** : dans un contexte de push échoué, la restauration n'intervient qu'**après** application du protocole de préservation des journaux §6 (ci-dessous) et validation de la procédure — puis : `cp --preserve=timestamps audit/baseline/evidence/backups/urbanisme-test-avant-resync-20261011T091500Z.db db/urbanisme-test.db` → `sha256sum` == `16f3c3f4…84ae5` → re-contrôle drift (retour à l'état 0/2 attendu). **Source de restauration = la sauvegarde §1.3 uniquement (inode 169333) — jamais le jumeau /tmp** (même inode que la source : il n'est pas un état antérieur). Note : `cp` écrasant via le chemin hard-linké réécrirait aussi le jumeau (même inode) — acceptable, le contenu restauré y est propagé ; variante `cp --remove-destination` si l'on préfère rompre le lien (jumeau conservé à l'état post-push → divergence à consigner).

   **Push échoué — journaux SQLite (`-journal` / `-wal`) — protocole de PRÉSERVATION (arbitrage du propriétaire, vague 24 — remplace l'ancienne consigne de suppression)** : après un push en échec (code non nul), un fichier `db/urbanisme-test.db-journal`, `db/urbanisme-test.db-wal` (ou `-shm`) peut être **nécessaire à la récupération de la base** (journal à chaud : seul moyen d'annuler une transaction partiellement écrite) — il ne doit donc **jamais** être supprimé automatiquement. Protocole obligatoire :
   1. **Arrêter immédiatement toute nouvelle opération** — aucune tentative, aucun correctif improvisé, aucune écriture sur la base, ses journaux ou leur dossier ;
   2. **Préserver la base, ses journaux et les fichiers associés** — consigner leur état à titre d'inventaire **lecture seule** (présence/absence, SHA-256, taille, mtime), **sans aucune modification** ;
   3. **Ne pas supprimer ni déplacer manuellement un journal SQLite** avant d'avoir **établi son état** (valide, à chaud, orphelin) et **déterminé la procédure de récupération adaptée** — l'analyse s'effectue en lecture seule ; le risque connu (rejeu d'un journal obsolète sur une base restaurée) est traité **dans la procédure validée** (neutralisation maîtrisée, documentée au cas par cas), jamais par une suppression par défaut ;
   4. **Restaurer uniquement après vérification de la sauvegarde indépendante** (SHA `16f3c3f4…84ae5`, inode ≠ source — §1.3, re-vérification bloquante §2.8) **et validation de la procédure** de récupération (y compris le devenir des journaux) ;
   5. **Exiger une décision écrite avant toute reprise** — la reprise exige la décision écrite du propriétaire ; le silence ne vaut jamais acceptation.

   **Échec de la rupture §2bis** : SHA divergent (A.2/A.4/A.5) ou inode inchangé (A.4) → **ARRÊT** ; restauration depuis la sauvegarde (§6.1) puis re-mesure complète (§2.5, §2.10) — l'opération étant à contenu constant, la sauvegarde demeure la référence de restauration ; aucune nouvelle tentative sans décision écrite.
2. **Après commit, avant tag R2** : `git revert --no-edit <sha-du-commit-dédié>` (jamais d'amend/rebase/force) + restauration §6.1 si besoin → re-vérifications §4.
3. Consignation complète de l'épisode + signalement — la reprise exige une décision écrite du propriétaire.

## §7 — GO `RESYNC-TESTDB` — texte définitif (vagues 23-26 : arbitrages + correction sécurité + préservation du contenu validée par revue — prêt à signer)

> **GO `RESYNC-TESTDB` — autorisation d'exécution du runbook doc 46 v3.3 (option A), au refigeage R2**
>
> **1. Périmètre exact (exclusif)** — le présent GO autorise uniquement :
> a. la **rupture contrôlée du hard link côté dépôt** (option A arbitrée 8.6, §2bis) : création d'un fichier indépendant (`cp --preserve=timestamps`), remplacement atomique (`mv`) et vérification SHA-256 — opération **à contenu constant**, exécutée **avant** toute resynchronisation ; le staging `/tmp/c1-candidate/db/urbanisme-test.db` n'est **ni supprimé ni modifié** ;
> b. la **ré-synchronisation de `db/urbanisme-test.db`** par la commande unique `DATABASE_URL="file:/home/z/my-project/db/urbanisme-test.db" bun run db:push` (§3) ;
> c. un **commit dédié** d'un seul fichier (`db/urbanisme-test.db`) au message fixé au doc 46 §1.
>
> Sont **hors périmètre et interdits** : toute écriture dans `db/custom.db` (SHA-256 de référence `756c0158…8126d`) ; tout `db:push` sur la base réelle ; toute suppression, déplacement ou écriture directe sur le staging `/tmp/c1-candidate/` ; toute modification de `prisma/schema.prisma`, de tout fichier de code ou de configuration ; tout déplacement ou suppression d'un tag existant ; tout `git push`, BFG, force-push ou réécriture d'historique ; le GO B et toute diffusion sans autorisation spécifique ; toute commande autre que celles listées au doc 46 §2-§5.
>
> **2. Ordre de finalisation (immuable — arbitrage vague 23)** : (1) autorisation écrite dédiée `RESYNC-TESTDB` (le présent GO signé) → (2) contrôles préalables (§2) → (3) rupture contrôlée du hard link (§2bis) → (4) ré-synchronisation de `urbanisme-test.db` (§3) → (5) contrôles après opération (§4) → (6) commit dédié (§1) → (7) validation des preuves (§5) → (8) tag applicatif R2 `candidat-app-audit-v1.2-R2` (léger, sur le commit dédié) → (9) calcul et consignation de l'empreinte de l'archive (`git archive --format=tar candidat-app-audit-v1.2-R2 | sha256sum`) → (10) mise à jour documentaire et preuves PA4 (doc 24 §0, `AGENTS.md` règle §8.5, doc 46 §10) → (11) commit documentaire → (12) tag documentaire R2 `candidat-docs-audit-v1.2-R2` (léger, sur le commit documentaire). Aucun tag en dehors de cette séquence ; un tag créé n'est ni déplacé ni supprimé.
>
> **3. Préconditions (toutes bloquantes, doc 46 §2 — à RECONFIRMER au moment R2)** : contexte R2 atteint et validé (phase R terminée) ; arbre git propre ; serveur arrêté ; SHAs de départ conformes (`16f3c3f4…84ae5` test / `756c0158…8126d` custom) ; drift de départ `exit 0` (custom) / `exit 2` (test) ; instantané AVANT conforme à `resync-testdb-before.json` + **vidage de contenu AVANT reconstitué (§2.7bis)** ; sauvegarde vérifiée (SHA `16f3c3f4…84ae5` + inode 169333 ≠ source) ; `.env` pointant `custom.db` — substitution en ligne obligatoire (§2.9) ; hash du DDL attendu == référence gelée `ab2c312b…07e3355` (§2.11) ; état des liens re-mesuré (§2.10). **Les mesures effectuées le 2026-10-11 (vagues 21-25) sont indicatives : elles ne se substituent pas à la re-confirmation intégrale des préconditions AU MOMENT de l'opération R2** (instruction du propriétaire, vague 25).
>
> **4. Critères d'arrêt (ARRÊT immédiat — arbitrage vague 23)** : **toute différence inattendue** aux sorties attendues (§2, §2bis, §4, §5) ; **toute opération destructive hors du périmètre explicitement accepté** (le seul motif destructif accepté est la reconstruction `CustomBookSkill` du DDL gelé §3bis — 10 cas §3bis) ; **toute erreur Prisma** (code de sortie non nul, invite interactive, annonce de perte de données hors motif attendu) ; **toute altération de `custom.db`** (SHA §4.1 — signalement prioritaire). **Aucune nouvelle tentative ne doit être lancée avant analyse du résidu éventuel (y compris `-journal`/`-wal` — journaux **préservés**, jamais supprimés automatiquement, §6) et décision écrite du propriétaire.**
>
> **5. Plan de restauration (doc 46 §6)** : **avant commit** — restauration depuis la sauvegarde réelle `audit/baseline/evidence/backups/urbanisme-test-avant-resync-20261011T091500Z.db` (SHA `16f3c3f4…84ae5`, inode 169333 ≠ 527790, indépendance prouvée doc 46 §1.3 ; re-vérification bloquante avant push ; **jamais** le jumeau `/tmp`) puis re-contrôle drift (retour à `0/2`) ; **échec de la rupture §2bis** — ARRÊT + restauration §6.1 + re-mesure complète ; **après commit, avant tag** — `git revert --no-edit <sha-du-commit-dédié>` (jamais amend/rebase/force-push) + restauration §6.1 si besoin + re-vérifications §4 ; **journaux SQLite après push échoué** — PRÉSERVATION intégrale (base + `-journal`/`-wal`/`-shm`) ; aucune suppression ni déplacement manuel avant analyse d'état et validation de la procédure ; restauration uniquement après vérification de la sauvegarde indépendante (§6, arbitrage vague 24). La reprise exige une décision écrite du propriétaire.
>
> **6. Contrôles après opération (tous bloquants, doc 46 §4)** : `db/custom.db` SHA/taille/mtime inchangés **en premier contrôle** ; intégrité `ok` + 0 violation FK ; 30 tables ; comptages identiques sur les 25 tables préexistantes (comparateur `resync-testdb-compare.mjs` **PASS**) **+ contenu ligne à ligne identique (comparateur `resync-testdb-compare-contenu.mjs` **PASS**, §4.3bis) ; 5 nouvelles tables vides ; jumeau `/tmp` **préservé** == `16f3c3f4…84ae5` (option A) ; drift **exit 0 ×2** ; périmètre git limité au seul fichier ; aucun résidu `prisma/db/`.
>
> **7. Preuves attendues (liste exacte — paquet PA4 enrichi)** : (1) transcript des contrôles préalables — SHAs, drift `0/2`, inventaire AVANT `resync-testdb-before.json` ; (2) transcript de la rupture §2bis — SHA/inode/liens avant-après, staging intact, `git status` propre ; (3) sortie complète du push (motif unique : reconstruction `CustomBookSkill`) ; (4) inventaire APRÈS + verdict **PASS** du comparateur ; (5) SHA-256 AVANT=APRÈS des deux bases (custom inchangé, test modifié) + mtime `custom.db` de référence ; (6) transcript drift APRÈS (`exit 0 ×2`) ; (7) reproduction locale **exacte** du garde-fou CI (`.github/workflows/build-desktop.yml` l.51-54, `set -e`) : deux échos + `exit 0` ; (8) SHA du commit dédié + `git log --stat -1` (1 fichier) ; (9) empreinte `git archive` du tag `candidat-app-audit-v1.2-R2` consignée (doc 24 §0) ; (10) preuves PA4 + inscription `AGENTS.md` (§8.5) au commit documentaire ; (11) consignation worklog ; **(12) comparaison de contenu ligne à ligne AVANT/APRÈS — verdict `PASS` du comparateur `resync-testdb-compare-contenu.mjs` (arbitrage vague 25).**
>
> **8. Tags autorisés par le présent GO (doc 46 §5bis)** : `candidat-app-audit-v1.2-R2` sur le commit dédié (étape 8) ; `candidat-docs-audit-v1.2-R2` sur le commit documentaire (étape 12) — créé **uniquement après validation des preuves et du commit documentaire**. **Le C2 final est préparé pour R2** après correction et revalidation, sur la base du doc 24 §0 mis à jour.
>
> **9. Caractère** : autorisation **unique, non renouvelable par tacite reconduction**, strictement limitée au périmètre et à l'ordre de finalisation ci-dessus. Date : ______ · Décision/signature propriétaire : ______

## §8 — Prérequis / points de décision — **tous arbitrés par le propriétaire (vague 23)**

| # | Prérequis | État |
|---|---|---|
| 8.1 | Texte d'autorisation distinct | **FINALISÉ §7 (vague 23)** — forme autonome `RESYNC-TESTDB` — **en attente de signature au moment R2** |
| 8.2 | Noms des nouveaux tags R2 | **TRANCHÉ (vague 23)** : tag applicatif `candidat-app-audit-v1.2-R2` (absence re-vérifiée vague 23 : 4 tags) et tag documentaire **`candidat-docs-audit-v1.2-R2`** — ce dernier créé **uniquement après validation des preuves et du commit documentaire** (§5bis étape 12) |
| 8.3 | Chemin C2 | **TRANCHÉ par l'instruction du propriétaire (2026-10-11)** : le C2 final est préparé **pour R2** après correction et revalidation — la variante bornée doc 45 §8 (C2 sur `7dff2c6` avec écart documenté) demeure **non approuvée** et sans objet |
| 8.4 | Enrichissement du paquet PA4 | **intégré §5** (liste des preuves) |
| 8.5 | **Règle anti-récurrence — TRANCHÉE (vague 23)** : inscription dans **`AGENTS.md`** (section « Conventions de code → Base de données », après la ligne « Ne jamais accéder directement au fichier `.db` »), **au commit documentaire R2**. Obligation de contrôler la dérive des **deux bases** après chaque évolution de `prisma/schema.prisma` et **avant tout commit, build, tag ou distribution** ; les deux contrôles doivent réussir avec un **code de sortie 0** et leurs résultats doivent être **consignés** ; **toute dérive bloque la suite du processus**. En cas d'oubli détecté (exit 2 sur l'une des bases), le push correctif sur la base en retard est exécuté **avant tout build/tag/distribution**, avec les contrôles du présent runbook (inventaire + sauvegarde + intégrité + comparateur). Texte exact à inscrire : **voir le bloc ci-dessous** |
| 8.6 | **Traitement du hard link `/tmp` (§1.4, §2bis)** | **TRANCHÉ (vague 23) : OPTION A** — rupture du lien côté dépôt par création d'un fichier indépendant, remplacement atomique et vérification SHA-256, **avant toute resynchronisation** ; staging ni supprimé ni modifié, contenu pré-resync préservé, aucun changement Git inattendu ; option B écartée |

**Texte exact à inscrire dans `AGENTS.md` (§ « Base de données ») au commit documentaire R2 :**

```markdown
- ⚠️ Dérive des bases (règle anti-récurrence — audit R2, 2026-10-11) : après CHAQUE évolution de `prisma/schema.prisma` et AVANT tout commit, build, tag ou distribution, contrôler la dérive des DEUX bases :
  `bunx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-url file:db/custom.db --exit-code`
  puis idem sur `file:db/urbanisme-test.db`.
  Les deux contrôles doivent réussir avec un code de sortie 0 et leurs résultats doivent être consignés. Toute dérive (exit ≠ 0) bloque la suite du processus : push correctif sur la base en retard (runbook doc 46) avant toute reprise. Garde-fou CI : `.github/workflows/build-desktop.yml` l.51-54.
```

## §9 — Preuves constituées le 2026-10-11 (vagues 21-23) — mesures **strictement lecture seule** + sauvegarde

| Fichier (audit/baseline/evidence/) | SHA-256 | Contenu |
|---|---|---|
| `backups/urbanisme-test-avant-resync-20261011T091500Z.db` | `16f3c3f4…7584ae5` (= source) | sauvegarde réelle indépendante (inode 169333 ≠ 527790, §1.3) |
| `resync-testdb-inventory.mjs` | `9697e644…b37d6c5e` | outil d'inventaire réutilisable AVANT/APRÈS (mode `ro` + `PRAGMA query_only=1`) |
| `resync-testdb-before.json` | `bc3e339c…66c3f8fa` | instantané AVANT : 25 tables, 38 lignes, integrity ok, FK 0 |
| `resync-testdb-drift-avant.txt` | `3f07f6a6…d6a388b3` | transcript drift ×2 de départ : `exit=0` (custom) / `exit=2` (test) |
| `resync-testdb-ddl-attendu.sql` | `ab2c312b…07e3355` | DDL attendu (additif) : 4 ALTER ADD COLUMN + reconstruction CustomBookSkill + 5 CREATE TABLE + 6 CREATE INDEX — **référence gelée §3.1** |
| `resync-testdb-drift-rev-vague22.txt` | `3f07f6a6…d6a388b3` | re-exécution drift ×2 (vague 22) : exit 0 (custom) / exit 2 (test) — état inchangé. **Note** : SHA identique à `resync-testdb-drift-avant.txt` (vague 21) — les deux transcripts sont octet pour octet identiques : le diff est **déterministe**, ce qui renforce la validité du gel §3.1 |
| `resync-testdb-cible-prisma-vague22.txt` | `bfb78ecb…6656409f` | **cible Prisma prouvée en direct** : 30 modèles via `.env` (→ custom.db) vs 25 modèles via variable en ligne (→ test.db) |
| `resync-testdb-ci-guard-bloquant-vague22.txt` | `1761d77b…f44e76f` | garde-fou CI exécuté à l'identique (set -e) : écho custom puis **ARRÊT exit 2** sur la base de test — comportement bloquant démontré |
| `resync-testdb-compare.mjs` | `1815e70a…dfaa3fd` | comparateur structuré AVANT/APRÈS (8 règles, exit 0/1) |
| `resync-testdb-compare-demo.txt` + inventaires synthétiques (`…-apres-synthetique.json` `b8df463b…`, `…-apres-corrompu.json` `28f1ffed…`) | démo `fd4cb8dd…09b79349` | démonstration du comparateur : synthétique conforme → **PASS** (exit 0) ; variante corrompue (Chapter 7→8) → **FAIL détecté** (exit 1) — fichiers étiquetés SYNTHETIQUE-DEMO, ne prouvent que le mécanisme |
| `resync-testdb-drift-rev-vague23.txt` | `94f95688…d38cea2` | re-mesure drift ×2 (vague 23, finalisation du GO) : `exit=0` (custom) / `exit=2` (test) — état de départ confirmé ; SHAs des deux bases re-vérifiés **inchangés après mesure** |
| `resync-testdb-verif-finale-vague24.txt` | consigné au commit vague 24 | **vérifications finales lecture seule (vague 24)** : SHAs + tailles + mtime + inodes/liens des deux bases (V1) ; sauvegarde indépendante inode 169333 (V2) ; jumeau `/tmp` hard-linké préservé (V3) ; `.env` absolu (V4) ; **hash DDL gelé == `ab2c312b…07e3355`** (V5) ; arbre/tags/commits (V6) ; drift ×2 `exit 0`/`exit 2` (V7) ; SHAs re-vérifiés **inchangés après mesure** (V8) |
| `resync-testdb-rows-dump.mjs` | consigné aux commits vagues 25-26 | **vidage de contenu ligne à ligne lecture seule (v2, revue vague 26)** : lignes canonisées triées + SHA par table ; v2 : réels non finis encodés distinctement (collision `JSON.stringify(Infinity)="null"↔NULL corrigée) + GARDE de précision entière (INTEGER hors plage JS-safe détecté en SQL exact 64-bit → REFUS exit 2 — bun:sqlite 1.3.14 n'offre ni `readBigInts` ni `as("bigint")`) |
| `resync-testdb-compare-contenu.mjs` | consigné aux commits vagues 25-26 | **comparateur de contenu exact (v2.1, revue vague 26)** : 5 règles bloquantes R1-R5 ; FAUX POSITIF DU SCÉNARIO R2 CORRIGÉ (l'APRÈS contient les 25 préexistantes + 5 nouvelles vides — R4 conditionnelle : présentes → complètes et vides ; absentes → préservation pure ; présence/vacuité restent contrôlées §4.2/§4.4) ; divergences identifiées (table + motif + ligne) ; note explicite « comptages identiques mais contenu divergent » |
| `resync-testdb-contenu-tests.mjs` + `resync-testdb-contenu-tests-vague26.txt` | consignés au commit vague 26 | **suite de 18 tests synthétiques (revue vague 26, bases jetables en /tmp — AUCUNE base réelle) : 18/18 CONFORMES** — indépendance de l'ordre physique (insertion inverse → vidages identiques), NULL/INTEGER/REAL/TEXT/BLOB canonisés distinctement, BLOB vide ≠ NULL, clés primaires composées, tables sans PK, doublons identiques ; les 6 cas du propriétaire (identité PASS · cellule modifiée FAIL · ligne supprimée FAIL · ligne ajoutée FAIL · NULL→'' FAIL · BLOB modifié FAIL) + Infinity FAIL + garde exit 2 + scénario R2 (25+5 vides PASS · nouvelle non vide FAIL · table inattendue FAIL) |
| `resync-testdb-compare-contenu-demo-vague26.txt` | consigné au commit vague 26 | re-démonstration avec le comparateur v2.1 sur données réelles : identité → **PASS** ; variante SYNTHÉTIQUE corrompue (vague 25, 1 cellule `Chapter`, comptages identiques) → **FAIL** + note dédiée — comportements inchangés après revue |
| `resync-testdb-rows-avant.json` | consigné aux commits vagues 25-26 | **référence de contenu AVANT (vague 25, reconstituée avec l'outil v2 en vague 26)** : 25 tables / 38 lignes, empreinte globale `faed00f9…80f6d` **identique v1→v2** (preuve de stabilité de format sur les données réelles) — **à RECONSTITUER au R2 (§2.7bis) et à utiliser EXCLUSIVEMENT comme référence de comparaison** ; lecture seule prouvée (SHAs des bases inchangés après vidage) |
| `resync-testdb-compare-contenu-demo-vague25.txt` + `resync-testdb-rows-corrompu-SYNTHETIQUE-DEMO.json` | consignés au commit vague 25 | **démonstration (fichiers étiquetés SYNTHETIQUE-DEMO, ne prouvent que le mécanisme)** : identité → **PASS** (exit 0) ; variante corrompue volontairement (1 cellule `Chapter` modifiée, **comptages identiques**) → **FAIL détecté** (exit 1) avec note « comptages identiques mais contenu divergent — cas exact signalé par le propriétaire » |

Non-modification prouvée AVANT=APRÈS l'ensemble des mesures : SHA-256 et tailles des deux bases identiques (§2.5) — **re-mesuré en vagues 22 à 26 (drift ×2 : exit 0/2 ; SHAs, tailles, mtime, liens, jumeau `/tmp`, sauvegarde, DDL gelé : identiques — preuve vague 24 : `resync-testdb-verif-finale-vague24.txt` ; vidages de contenu lecture seule vagues 25 et 26 avec SHAs re-vérifiés inchangés après mesure)** — aucun résidu `prisma/db/`, arbre propre hors créations listées, candidat `7dff2c6` et 4 tags intacts (aucun tag R2 créé).

## §9bis — Revue technique du comparateur de contenu (vague 26 — demande du propriétaire)

Revue ciblée des trois artefacts (`resync-testdb-rows-dump.mjs`, `resync-testdb-compare-contenu.mjs`, `resync-testdb-rows-avant.json`) — canonisation, couverture des données, robustesse des tests — **sans modification des bases, du candidat gelé ou des tags** :

| # | Constat de la revue | Verdict | Traitement |
|---|---|---|---|
| 1 | Ordre physique : insertion des mêmes lignes dans un ordre inverse (rowids et stockage différents) → vidages **identiques** (empreinte globale égale, comparateur PASS) — couvre NULL, nombres/chaînes, BLOB, PK composée, table sans PK, doublons identiques | ✅ conforme | aucun — tri lexicographique des lignes canonisées (ordre total, déterministe) ; le vidage ne dépend ni des rowids ni de l'ordre de stockage |
| 2 | **FAUX NÉGATIF corrigé** : `JSON.stringify(Infinity) = "null"` entrait en collision avec NULL (SQLite stocke NaN comme NULL mais peut stocker REAL Infinity) | corrigé | outil v2 : réels non finis encodés `{__real:"Infinity"\|-Infinity\|NaN}` — distincts de NULL ; test B var_infinity → FAIL détecté |
| 3 | **FAUX NÉGATIF potentiel corrigé** : bun:sqlite 1.3.14 renvoie des `number` — un INTEGER hors plage JS-safe (\|v\| > 2⁵³-1) serait arrondi silencieusement à la lecture (prouvé empiriquement : 9007199254740993 → 9007199254740992) ; ni `readBigInts` ni `as("bigint")` disponibles | corrigé | outil v2 : GARDE SQL exacte 64-bit par colonne (`typeof(col)='integer'` et hors plage) → **REFUS de vidage exit 2** plutôt que comparaison incertaine ; test B garde → exit 2 ✓ |
| 4 | **FAUX POSITIF corrigé (scénario R2)** : le comparateur v2 exigeait toujours les 5 nouvelles tables — il aurait FAIL sur la comparaison AVANT (25 tables) / APRÈS (30 tables) du scénario nominal | corrigé | comparateur v2.1 : R4 conditionnelle — nouvelles présentes → complètes et vides ; absentes → préservation pure ; présence/vacuité au post-push restent contrôlées §4.2/§4.4 ; tests A2, var_identique, D1 → PASS ✓ ; D2/D3 → FAIL ✓ |
| 5 | Canonisation des types : NULL ≠ '' ≠ BLOB vide ; INTEGER 0 / REAL 0.0 / TEXT '0' distincts ; -0.0 et 0.0 numériquement égaux (SQLite les compare égaux — documenté) | ✅ conforme (tests A3-A7) | aucun |
| 6 | Stabilité de format : référence réelle reconstituée avec l'outil v2 → empreinte globale **identique** `faed00f9…80f6d` (les corrections v2 ne changent rien sur les données réelles, qui ne contiennent ni Infinity ni grand INTEGER) | ✅ prouvé | référence mise à jour (outil v2) ; SHAs des deux bases re-vérifiés inchangés après vidage |
| 7 | Suite de tests synthétiques : **18/18 conformes** (points A, B, D du propriétaire ; bases jetables en /tmp, aucune base réelle) | ✅ validée | `resync-testdb-contenu-tests-vague26.txt` |

**Portée de la revue** : elle valide le MÉCANISME de contrôle (canonisation, couverture, robustesse) — elle ne constitue pas, et ne prétend pas être, une preuve de réussite d'une resynchronisation réelle (celle-ci reste soumise au GO signé + reconfirmation des préconditions au R2).

## §10 — Statu quo (ce qui n'est PAS fait)

**Plan de clôture noté par le propriétaire (vague 25)** : (1) le présent doc 46 v3.3 demeure la référence de préparation ; (2) au refigeage R2, refaire les contrôles préalables (§2 — reconfirmation intégrale, les mesures actuelles ne valent pas exécution) ; (3) obtenir la décision écrite du propriétaire sur le GO `RESYNC-TESTDB` (§7) ; (4) exécuter uniquement les opérations autorisées, arrêt immédiat en cas d'écart ; (5) examiner les preuves **avant** de créer les tags R2 ; (6) effectuer la validation Windows C2 sur R2 ; (7) ne considérer la candidature prête à être diffusée qu'après examen des preuves et autorisation distincte. **Le dépôt d'un rapport ne vaut jamais autorisation de modifier les bases ou de créer des tags.**

Aucune ré-synchronisation exécutée · `db/urbanisme-test.db` intacte (SHA `16f3c3f4…84ae5`, 25 tables) · `db/custom.db` intacte (SHA `756c0158…8126d`) · candidat `7dff2c6` figé, tags intacts, arbre propre · verdict C2 maintenu **`PROBLEMES`** jusqu'à réception/vérification des 8 preuves Windows (docs 24/39), le C2 final étant préparé **pour R2** après correction et revalidation · migration de la base réelle **suspendue** jusqu'au GO A écrit + validation des préconditions S1 avant toute première écriture · **interdictions maintenues (arbitrage vague 23)** : aucune écriture dans `custom.db`, aucun `db:push` sur la base réelle, aucun déplacement ou suppression d'un tag existant, aucun push Git, aucune réécriture d'historique, aucun GO B, aucune diffusion sans autorisation spécifique · **BFG, levée de P7, changement de schéma : suspendus**.

---
*Runbook v3.3 — finalisé sur les arbitrages du propriétaire (vague 23) : 8.6 **option A** (procédure §2bis), 8.2 tag documentaire **`candidat-docs-audit-v1.2-R2`**, 8.5 règle anti-récurrence inscrite dans **`AGENTS.md`** au commit documentaire R2 (texte exact §8.5) ; **corrigé en vague 24** : préservation des journaux SQLite après push échoué (protocole 5 points §6) ; **enrichi en vague 25** : préservation prouvée sur le **CONTENU** ligne à ligne (§2.7bis, §4.3bis, §5, §7.6-7.7) et reconfirmation des préconditions obligatoire au moment R2 (§7.3) ; **validé en vague 26** : revue technique du comparateur — canonisation durcie (Infinity, précision entière), faux positif du scénario R2 corrigé, 18/18 tests synthétiques (§9bis). Ne constitue ni un GO ni une exécution : l'exécution exige la signature du GO `RESYNC-TESTDB` (§7) au moment R2, dans l'ordre de finalisation à 12 étapes (§5bis) — **aucun point d'arbitrage restant**.*
