# 49 — RAPPORT D'ANOMALIE R2 — ARRÊT AU CONTRÔLE §4.3bis (COMPARATEUR DE CONTENU) — 2026-10-11

**Cycle :** audit-final-v1.2 · vague 29 (exécution R2 sous GO `RESYNC-TESTDB` écrit — arrêt protocolaire)
**Statut : ARRÊT PROTOCOLAIRE — contrôle bloquant §4.3bis FAIL (exit 1) ; aucune correction, aucune restauration, aucun commit, aucun tag ; état préservé et intégralement documenté ; décision écrite du propriétaire requise avant toute reprise ou restauration (doc 46 §6, autorisation propriétaire §3).**

---

## §1 — Cadre d'exécution

| Élément | Valeur |
|---|---|
| Autorisation | GO `RESYNC-TESTDB` écrit du propriétaire, reçu 2026-10-11, consigné `evidence/GO-RESYNC-TESTDB-proprietaire-20261011.md` (SHA `b9f0b943…5912`) |
| Référence opératoire | doc 46 v3.3 (SHA `820202f4…3db84`) + outils gelés vagues 27-28 (empreintes doc 47 §4, toutes vérifiées conformes au prévol) |
| Ordre suivi | §5bis étapes 1-5 : GO consigné → contrôles préalables → rupture hard link → resync → contrôles après opération. **Arrêt à l'étape 5** — étapes 6-12 NON exécutées |

## §2 — Contrôles préalables (§2) : TOUS CONFORMES

| Contrôle | Résultat |
|---|---|
| 2.1-2.2 GO consigné + fenêtre R2 | ✓ |
| 2.3 arbre propre (mesuré avant artefacts) | ✓ vide |
| 2.4 serveur arrêté | ✓ (serveur dev en cours → arrêté, connexion refusée) |
| 2.5 SHAs de départ | ✓ test `16f3c3f4…84ae5` (552 960 o, mtime 2026-10-02 17:26:56, inode 527790) · custom `756c0158…8126d` (265 330 688 o, mtime 2026-10-11 06:45:23.410462155, inode 527789) |
| Empreintes outils gelés (doc 47 §4) | ✓ 9/9 conformes |
| 2.6 dérive de départ | ✓ exit 0 (custom) / exit 2 (test) |
| 2.7 inventaire AVANT | ✓ sémantiquement identique au JSON gelé — 25 tables, 38 lignes, integrity ok, FK 0 |
| 2.7bis vidage AVANT (référence exclusive) | ✓ constitué immédiatement avant le push — `resync-testdb-rows-avant-R2-20261011T205147Z.json`, 25 tables / 38 lignes, empreinte globale `faed00f9…80f6d` (== référence vagues 25-26) |
| 2.8 sauvegarde indépendante | ✓ SHA == source · inode 169333 ≠ 527790 · liens 1 |
| 2.9 `.env` | ✓ `DATABASE_URL=file:/home/z/my-project/db/custom.db` (absolu) |
| 2.10 liens re-mesurés | ✓ test inode 527790, 2 liens (jumeau `/tmp/c1-candidate`) · custom 1 lien |
| 2.11 hash DDL pré-flight | ✓ == `ab2c312ba1fa021e064903b92153932f1574fd4a19642d94fee99020407e3355` (diff octet pour octet vs DDL gelé) |

## §3 — Rupture du hard link (§2bis, option A) : RÉUSSIE

| Contrôle | Résultat |
|---|---|
| A.1 état AVANT | ✓ SHA ×2 `16f3c3f4…84ae5` · inode 527790 · liens 2 ×2 |
| A.2 fichier indépendant | ✓ `cp --preserve=timestamps` → SHA identique, inode **576619**, liens 1, mtime préservé |
| A.3 remplacement atomique | ✓ `mv` exit 0 |
| A.4 dépôt après rupture | ✓ SHA `16f3c3f4…84ae5` · inode 576619 · liens 1 |
| A.5 staging après rupture | ✓ SHA `16f3c3f4…84ae5` (**préservé**) · inode 527790 conservé · liens 2→1 |
| A.6 Git + mêmefile | ✓ `db/urbanisme-test.db` NON listé par `git status` (contenu constant) · un seul chemin par inode |

## §4 — Resynchronisation (§3) : exécutée conformément à la commande unique

- `DATABASE_URL="file:/home/z/my-project/db/urbanisme-test.db" bun run db:push` → **exit 0**, « Your database is now in sync », aucune invite interactive, **aucun motif destructif annoncé** (sortie complète au transcript `resync-testdb-R2-03-push.txt`).
- Régénération du client Prisma (node_modules, hors dépôt) — conforme §3.

## §5 — Contrôles après opération (§4) : résultat

| Contrôle | Résultat | Preuve |
|---|---|---|
| 4.1 `custom.db` intouchée — **PREMIER contrôle** | **✓ STRICTEMENT INTACTE** (SHA `756c0158…8126d`, 265 330 688 o, mtime de référence, inode 527789) | transcript R2-04 §4.1 |
| 4.2 intégrité + FK (base test) | **✓** `integrity ok` · FK **0** · 30 tables · 38 lignes | inventaire APRÈS |
| 4.3 comparateur comptages | **✓ PASS** (8/8 checks) — 25 comptages identiques, 5 nouvelles vides, 6 index | verdict JSON |
| **4.3bis comparateur de CONTENU** | **✗ FAIL (exit 1) — 3 tables divergentes : Chapter, ChapterVersion, Job** | `/tmp/r2-compare-contenu-verdict.json` (SHA `eecad3dc…4adc`) |
| 4.4 5 nouvelles vides + 6 index | **✓** (Article/ArticleVersion/ImportedDoc/LegalRef/SoutenancePrep = 0 · 6 index présents dont `SoutenancePrep_thesisId_key`) | inventaire APRÈS |
| 4.5 périmètre Git | **✓** uniquement ` M db/urbanisme-test.db` + artefacts R2 non suivis · `git diff` schéma vide · aucun résidu `prisma/db/` | transcript R2-04 D.5 |
| 4.6 staging préservé | **✓** `/tmp/c1-candidate/db/urbanisme-test.db` == `16f3c3f4…84ae5` (état pré-resync), inode 527790, liens 1 — **le push n'a pas propagé** (rupture effective) | transcript R2-04 D.6 |
| 4.7 dérive après | **✓ exit 0 ×2** (« No difference detected. » sur les deux bases) | transcript R2-04 D.7 |
| Journaux SQLite | aucun `-journal`/`-wal`/`-shm` présent — rien à préserver, rien supprimé | transcript R2-04 D.2 |

## §6 — L'anomalie §4.3bis : analyse (lecture seule, aucun outil modifié)

**Fait brut** : le comparateur gelé v2.1 rapporte FAIL — R2 « 3 table(s) divergente(s) » + R3 empreinte globale restreinte différente ; note « COMPTAGES IDENTIQUES MAIS CONTENU DIVERGENT ».

**Divergences exactes** (chaque ligne divergente ne diffère que par des colonnes ABSENTES AVANT, présentes et **null** APRÈS) :

| Table | Colonnes AVANT → APRÈS | Seules différences | Conformité au DDL gelé §3.1 |
|---|---|---|---|
| `Chapter` | 15 → 16 | colonne #15 `stamp` = null (absente AVANT) | `ALTER TABLE "Chapter" ADD COLUMN "stamp" TEXT` |
| `ChapterVersion` | 7 → 8 | colonne #7 `stamp` = null | `ALTER TABLE "ChapterVersion" ADD COLUMN "stamp" TEXT` |
| `Job` | 11 → 13 | colonnes #11 `progress` = null, #12 `progressNote` = null | `ALTER TABLE "Job" ADD COLUMN "progress" INTEGER` + `ADD COLUMN "progressNote" TEXT` |

**Preuve indépendante de préservation** (analyse ad hoc `/tmp/r2-analyse-valeurs.mjs`, hors outils gelés, lecture seule) : restreintes aux colonnes **préexistantes**, les lignes des 3 tables sont **IDENTIQUES valeur par valeur** (7/3/2 lignes) ; les colonnes nouvelles sont **toutes null** sur toutes les lignes — exactement l'effet documenté du DDL (doc 46 §3bis : « 7 lignes existantes intactes, stamp = NULL », etc.). exit 0. CustomBookSkill reconstruite : 10 colonnes attendues, 0 ligne.

**Cause racine (outillage, pas donnée)** : le comparateur v2.1 compare les lignes canonisées colonne par colonne et n'avait été validé (18/18, vagues 26-28) que sur des ensembles de colonnes identiques. Le DDL gelé du scénario R2 inclut **4 ADD COLUMN sur 3 tables préexistantes** — cas non couvert par la revue technique (qui a corrigé le faux positif « 5 nouvelles tables » en v2.1 mais pas celui des colonnes ajoutées). Le FAIL est donc un **faux positif du second type** : l'outil détecte l'ajout de colonnes **prévu par le DDL gelé** comme une divergence de contenu, alors que toutes les valeurs préexistantes sont intactes.

**Rappel de discipline** : le FAIL est néanmoins traité comme bloquant — **aucun « débuchage » par modification des outils gelés sans autorisation écrite** (doc 47 §2 : toute levée de gel exige un défaut concret validé par écrit ; le défaut est ici constaté, sa levée est une décision du propriétaire).

## §7 — État préservé à l'arrêt (aucune action corrective)

| Élément | État à l'arrêt |
|---|---|
| `db/urbanisme-test.db` | état post-push INTACT et préservé — SHA `6b72e1dce93c4e94830639523cd14fad6600e018884f02b85aef4c10e9a65fb8`, 622 592 o, inode 576619, mtime 2026-10-11 20:52:26Z, 30 tables, integrity ok, FK 0, 38 lignes |
| `db/custom.db` | STRICTEMENT INTACTE — SHA `756c0158…8126d`, inode 527789, mtime de référence |
| Sauvegarde `backups/urbanisme-test-avant-resync-20261011T091500Z.db` | INTACTE — SHA `16f3c3f4…84ae5`, inode 169333 |
| Staging `/tmp/c1-candidate/db/urbanisme-test.db` | PRÉSERVÉ — SHA `16f3c3f4…84ae5`, inode 527790 |
| Référence de contenu AVANT (§2.7bis) | conservée SANS modification — SHA `fb85ff00…9c3e` |
| Git | HEAD `7179458` inchangé · **aucun commit créé** · ` M db/urbanisme-test.db` + artefacts R2 non suivis · 4 tags, **aucun tag R2** |
| Journaux SQLite | aucun journal présent |

**Empreintes des pièces** : vidage APRÈS `29f38a5f…c06e` · inventaire APRÈS consigné `resync-testdb-inventory-apres-R2.json` · transcripts R2 : `resync-testdb-R2-01-prevol.txt`, `-02-rupture.txt`, `-03-push.txt`, `-04-postcontroles.txt`.

## §8 — Décision requise du propriétaire (aucune reprise sans instruction écrite)

Le protocole (doc 46 §4.3bis + §6) et l'autorisation (§3) exigent l'arrêt et l'attente. Options possibles (à la seule décision écrite du propriétaire) :

- **Option 1 — constater le faux positif et lever le gel ciblé du comparateur** : procédure doc 47 §2 (défaut concret constaté → correction v2.1 → v2.2 normalisant les colonnes ajoutées par le DDL gelé, re-run complet de la suite 18/18 + tests du cas ajout de colonnes, mise à jour des empreintes, consignation), puis re-exécution du contrôle §4.3bis sur les vidages R2 déja constitués, puis reprise de l'ordre §5bis à l'étape 6 (commit dédié → §5 → tags), avec re-vérification §4/§5 complète.
- **Option 2 — restauration §6.1** : retour à l'état pré-resync depuis la sauvegarde indépendante (SHA `16f3c3f4…84ae5`, inode 169333), puis traitement de l'écart d'outillage séparément.
- **Option 3 — toute autre instruction**.

---

*Rapport établi le 2026-10-11 — vague 29. L'arrêt est appliqué à la lettre : aucune correction, aucune restauration, aucun commit, aucun tag, aucun push, aucune diffusion. Le dépôt du présent rapport ne vaut pas autorisation de reprise.*
