# 21 — PLAN D'EXÉCUTION FINAL : migration « références rattachées par thèse » sur la BASE RÉELLE

**Cycle :** audit-final-v1.2 · **Task ID :** T7 · **Date :** 2026-10-10
**Statut : PLAN PROPOSÉ — AUCUNE exécution.** Ce document répond aux 5 exigences du propriétaire (§2 de sa décision du 2026-10-10). **Aucune migration sur la base réelle `db/custom.db` ne sera lancée avant la validation écrite explicite du propriétaire de CE document.**
**Fondements :** répétition générale `18_REPETITION_GENERALE_MIGRATION_REFS.md` (16/16 tests d'isolation PASS, double rollback démontré, GO conditionnel favorable) · proposition amendée `specs/ref-thesis-scoping/proposition-technique.md` §6-bis v1.1 · scripts réutilisables `audit/baseline/tools/rehearsal-refs/` (7 fichiers, éprouvés sur copie).
**État réel de départ (vérifié à chaque session) :** 1 thèse (« Urbanisme durable », 7 chapitres) · **4 références globales** `thesisId` NULL · 0 clé étrangère pointant vers `Reference` (usage exclusivement applicatif) · résidu DoctoralToolbox séparé (doc 19, décision distincte).

---

## §1 — Séquence exacte des opérations sur la base réelle

Fenêtre requise : **30–45 min hors re-pass UI, demi-journée avec re-pass UI + TNR**. L'application (serveur port 3000) est arrêtée pendant la fenêtre de migration DB (étapes 0–7), redémarrée pour l'étape 8 (re-pass UI).

| # | Action | Commande exacte | Résultat attendu / contrôle |
|---|---|---|---|
| 0 | Gel des écritures : quitter l'app, arrêter le serveur dev (port 3000 fermé) | — | `curl localhost:3000` échoue |
| 1 | **Sauvegarde horodatée** + contrôle immédiat (détail : §2 de ce document) | `cp --preserve=timestamps db/custom.db audit/baseline/evidence/backups/custom-$(date +%Y%m%dT%H%M%S).db` puis `sha256sum` ×2 | SHA copie == SHA original ; consigné dans `evidence/migration-reelle-shas.json` |
| 2 | **Export réversible** des 4 références (21 colonnes, ordonnées par id) | `bun audit/baseline/tools/rehearsal-refs/export-references.mjs db/custom.db audit/baseline/evidence/references-export-before-<TS>.json` | `rowCount: 4`, `integrity_check: ok`, 0 violation FK |
| 3 | Inventaire avant (compteurs + FK sur les 30 tables) | `bun audit/baseline/tools/rehearsal-refs/db-inventory.mjs db/custom.db audit/baseline/evidence/migration-inventory-before.json` | Reference 4, Thesis 1, Chapter 7, 0 violation FK |
| 4 | **Amendement du schéma du dépôt** (cette fois `prisma/schema.prisma`, commit dédié) : `thesisId String?` + relation Cascade + `@@index([thesisId])` + `references Reference[]`, puis `bunx prisma generate` | — | `git diff` limité aux 4 lignes ci-dessus ; aucun autre modèle touché |
| 5 | `db push` sur la base réelle | `bunx prisma db push --skip-generate` | **NO-GO si** : Reference ≠ 4, Thesis ≠ 1, integrity ≠ ok, violation FK ≠ 0 → rollback §4 immédiat. Attendu : ~1 s (19 ms démontré sur copie) |
| 6 | **Migration d'attribution** (journal + rapport d'ambiguïté — détail : §3 de ce document) | `bun audit/baseline/tools/rehearsal-refs/migrate-references-to-thesis.mjs db/custom.db audit/baseline/evidence/migration-attribution-journal.json` | **Attendu (cas univoque, 1 seule thèse) : 4 attribuées / 0 ambiguë / 0 laissée sans thèse. NO-GO si** `rowsUpdated` ≠ nb de réf. NULL mesuré à l'étape 3, ou dangling > 0 → rollback §4 |
| 7 | Contrôles de cohérence post-migration | `bun audit/baseline/tools/rehearsal-refs/consistency-check.mjs db/custom.db audit/baseline/evidence/references-export-before-<TS>.json audit/baseline/evidence/migration-consistency.json` | Verdict **PASS** obligatoire : total avant == après (4 == 4), 0 dangling, integrity ok, 0 violation FK, diff vs export = **champ `thesisId` uniquement** |
| 7-bis | **Isolation entre deux thèses sur la base réelle** (détail : §5 de ce document) | procédure §5 option A (recommandée) ou B | 16/16 PASS attendu |
| 8 | **TNR + re-pass UI** (serveur relancé) : suite vitest complète, GP-7 Export DOCX, vue Références, brouillon de chapitre, Export PDF | `bun run test:run` (1 658 verts min.) + parcours UI | 1 658/1 658 verts ; vues citées fonctionnelles ; **comportement applicatif inchangé** (le push seul ne modifie pas le comportement des 8 consommateurs — condition 3 du GO) |
| 9 | *Uniquement si NO-GO* : rollback (détail : §4 de ce document) | voie 7a ou 7b | SHA == sauvegarde étape 1 |
| 10 | Consignation : journal, rapport d'ambiguïté, preuves SHA, `migration-reelle-shas.json`, captures UI ; **commit unique** « feat(refs): thesisId + migration attribution (proposition ref-thesis-scoping) » | — | — |

**Régle impérative du propriétaire en cas de multi-thèses au moment de l'exécution** (répétée ici pour mémoire) : toute référence dont le propriétaire n'est pas déterminable de façon univoque reste `thesisId = NULL` et est **listée** dans le rapport d'ambiguïté — **aucune attribution automatique heuristique** (comportement du script, démontré en run 2 de la répétition).

---

## §2 — Contrôle de la sauvegarde immédiatement avant migration (étape 1, détail)

La sauvegarde est créée **dans la fenêtre, après gel des écritures (étape 0) et avant toute autre action**.

1. **Création** : `cp --preserve=timestamps db/custom.db audit/baseline/evidence/backups/custom-<TS>.db` (hors arbre git si préféré — le dossier `backups/` est gitignoré).
2. **Contrôles bloquants AVANT de poursuivre** — les trois doivent être vrais :
   - `sha256sum db/custom.db <copie>` → **deux SHA identiques** (copie byte-identique) ;
   - inventaire exécuté **sur la copie** : `bun audit/baseline/tools/rehearsal-refs/db-inventory.mjs <copie> …` → Reference 4 / Thesis 1 / 30 tables / integrity ok / 0 violation FK ;
   - `PRAGMA integrity_check` sur la copie → `ok`.
3. **Capacité de restauration prouvée en amont** (pas de confiance aveugle dans la sauvegarde) : le cycle A3 (`evidence/a3-step1-backup-intact.json`, `a3-upload-restore.json`, `a3-step3-restored-match.json`, `a3-step4-controlled-set.json`) a déjà démontré restauration + contrôle d'identité. À l'étape 1, le contrôle d'identité SHA reconstitue la même garantie.
4. Consignation : `evidence/migration-reelle-shas.json` — SHA original, SHA copie, horodatage, taille (265 330 688 o attendu, à comparer).
5. **Variance attendue du SHA fichier** : si le worker applicatif a écrit des lignes `Job` depuis la dernière capture, le SHA de départ diffère des sessions antérieures — sans importance : la référence est le SHA mesuré à l'étape 1 dans la fenêtre (base gelée). Les preuves de restauration du cycle A3 et de la répétition (voie 7b) restent valables car elles comparent des SHA au sein d'une même fenêtre.

---

## §3 — Vérification des références : attribuées / ambiguës / laissées sans thèse

Le script `migrate-references-to-thesis.mjs` (usage : `bun migrate-references-to-thesis.mjs <db-path> <journal-output.json>`, accès SQLite direct, transactionnel, **idempotent — 2ᵉ passage = 0 ligne modifiée, démontré**) produit trois artefacts :

1. **Journal d'attribution** (`migration-attribution-journal.json`) — une entrée par référence modifiée : `id`, `titre`, `from` (NULL), `to` (id thèse propriétaire), `raison`, horodatage. **Attendu sur la base réelle : 4 entrées** (les 4 références → thèse `cmsmyrdfs0000pa2sews4vo90` « Urbanisme durable »), motif « CAS_UNIVOQUE (1 thèse) ».
2. **Rapport d'ambiguïté** — références dont le propriétaire n'est pas déterminable de façon univoque : elles restent `thesisId = NULL` et sont **listées** (id + titre + raison). **Attendu sur la base réelle : 0 entrée** (1 seule thèse = cas univoque). En état multi-thèses : TOUTES les réf. non attribuées y figurent, 0 attribution automatique (démontré en run 2).
3. **Contre-vérification SQL post-migration** (lecture seule, exécutée et archivée) :
   - `SELECT COUNT(*) FROM Reference WHERE thesisId IS NOT NULL` → **4** (attribuées) ;
   - `SELECT COUNT(*) FROM Reference WHERE thesisId IS NULL` → **0** (laissées sans thèse) ;
   - `SELECT COUNT(*) FROM Reference WHERE thesisId IS NOT NULL AND thesisId NOT IN (SELECT id FROM Thesis)` → **0** (dangling) ;
   - re-dump des 4 lignes vs export réversible → **seul `thesisId` diffère** (vérifié par `consistency-check.mjs`).

---

## §4 — Critères d'arrêt et procédure de rollback

### 4.1 Critères d'arrêt (GO/NO-GO par étape)

| Étape | Critère NO-GO (→ arrêt immédiat + rollback) |
|---|---|
| 1 (sauvegarde) | SHA copie ≠ SHA original, ou inventaire sur copie ≠ Reference 4/Thesis 1, ou integrity ≠ ok |
| 5 (db push) | comptages ≠ étape 3 ; integrity_check ≠ ok ; foreign_key_check ≠ 0 ; durée anormale/erreur Prisma |
| 6 (attribution) | `rowsUpdated` ≠ nb de réf. NULL mesuré à l'étape 3 ; dangling > 0 ; journal incomplet |
| 7 (cohérence) | total avant ≠ après ; 0 dangling non vérifié ; diff vs export ≠ « thesisId seulement » |
| 7-bis (isolation) | tout test sur 16 en échec |
| 8 (TNR/UI) | suite vitest < 1 658 verts ; parcours références/export en échec attribuable au push |

**Critère global** : toute divergence de comptage, tout `integrity_check ≠ ok`, toute violation FK, tout dangling ≠ 0 → **arrêt immédiat, aucun correctif improvisé, rollback avant toute autre action.**

### 4.2 Rollback — double voie (toutes deux démontrées sur copie)

| Voie | Procédure | Quand | Contrôle de réussite |
|---|---|---|---|
| **7a — inverse chirurgical** (précis, ne touche que les lignes du journal) | `bun audit/baseline/tools/rehearsal-refs/inverse-migration.mjs db/custom.db audit/baseline/evidence/migration-attribution-journal.json audit/baseline/evidence/migration-inverse.json` — ré-attribution à NULL guidée par le journal (garde : ne touche que les lignes toujours attribuées à la thèse du journal) | anomalie détectée aux étapes 6/7 avant l'étape 8 | re-dump : **identité stricte avec l'export réversible (diff vide sur toutes les colonnes)** — démontré en répétition (4/4 inversées, 0 écrasement concurrent) |
| **7b — restauration byte-identique** (voie **ROBUSTE**, recommandée) | 1) re-vérifier le SHA de la sauvegarde étape 1 ; 2) `cp <sauvegarde> db/custom.db` (serveur arrêté) ; 3) `bunx prisma generate` ; 4) re-contrôles | toute anomalie post-étape 8, ou en cas de doute | SHA base restaurée == SHA sauvegarde étape 1 ; 30 tables ; Reference 4 ; colonne `thesisId` **absente** ; integrity ok — démontré en répétition (SHA copie == SHA original == SHA de `db/custom.db`) |

Le choix de la voie est consigné dans le journal d'exécution ; la voie 7b est le filet de sécurité par défaut.

---

## §5 — Contrôles après migration, notamment l'isolation entre deux thèses

### 5.1 Contrôles de cohérence (étape 7 — décrits en §3.3 et §1)

comptages (4 == 4) · 0 dangling · integrity ok · 0 violation FK · diff export = `thesisId` seulement.

### 5.2 Isolation entre deux thèses (étape 7-bis) — deux options, au choix du propriétaire

**Option A (RECOMMANDÉE) — thèse jetable B créée puis supprimée dans la fenêtre, preuve DB complète :**

1. Créer la thèse jetable « MIGRATION-ISO — Thèse B jetable » via l'API (`POST /api/thesis` — flux identique au cycle isofix, dont la suppression propre a déjà été prouvée avec diff DB vide).
2. Exécuter la suite d'isolation **sur la base réelle** : `DATABASE_URL="file:<abs>/db/custom.db" bun audit/baseline/tools/rehearsal-refs/isolation-tests.mjs audit/baseline/evidence/references-export-before-<TS>.json audit/baseline/evidence/migration-isolation.json` — le script crée ses données de test B, vérifie **16/16** : requêtes scopées A = 4 réf. du propriétaire / 0 de B ; scopées B = réf. de B / 0 du propriétaire ; globales (`thesisId NULL`) visibles des deux ; UPDATE cross-contexte = 0 ligne ; DELETE cascade B (ses réf. supprimées, le propriétaire survit).
3. Supprimer la thèse B via le flux UI/API ; contre-vérification : `SELECT COUNT(*) FROM Thesis` → 1 ; les 4 références intactes ; `updatedAt` thèse propriétaire inchangé ; diff ligne-à-ligne vs export = `thesisId` seulement.

**Option B — zéro écriture de test sur la base réelle :** l'isolation est tenue pour prouvée par (i) la répétition 16/16 sur copie byte-identique, (ii) la suite vitest d'isolation (implémentée au cycle d'exécution, condition 3 du GO). Aucune donnée B ne transite par la base réelle.

**Précision d'honnêteté (inchangée, condition 3 du GO)** : à l'issue du push, le comportement des **8 consommateurs applicatifs** (API/vues) reste inchangé tant que le cycle d'implémentation API+zod+UI+tests (proposition §2/§4/§6) n'est pas exécuté — l'isolation **applicative** inter-thèses est donc livrée par ce cycle ultérieur ; le contrôle 7-bis prouve l'isolation **au niveau données**, qui est le socle.

### 5.3 TNR + re-pass UI (étape 8)

1 658/1 658 vitest · GP-7 Export DOCX (fichier valide, bibliographie APA présente) · vue Références (liste 4/4, création/suppression de test nettoyée) · brouillon de chapitre (citations) · Export PDF · captures archivées `evidence/migration-post-ui-*.png`.

---

## §6 — Checklist de décision pour le propriétaire

- [ ] **GO écrit** sur ce document 21 (§1 séquence, §2 sauvegarde, §3 vérifications, §4 arrêt/rollback, §5 contrôles — y compris le choix **A** ou **B** pour l'isolation 7-bis)
- [ ] Fenêtre d'exécution coordonnée (serveur port 3000 arrêté pendant les étapes 0–7)
- [ ] (séparé, doc 19) décision résidu DoctoralToolbox — sans objet pour cette migration
- [ ] Après exécution : réception du journal d'attribution, du rapport d'ambiguïté, des preuves SHA, du verdict PASS et des captures UI

**En l'absence de GO : rien n'est exécuté.** La base réelle reste en l'état (SHA consigné), aucune modification de `prisma/schema.prisma` n'est commitée avant l'étape 4 de la fenêtre.

---
*Scripts : `audit/baseline/tools/rehearsal-refs/` (7 fichiers, utilisés tels quels pour l'exécution réelle) · Preuves de la répétition : `evidence/rehearsal-refs.json`, `evidence/rehearsal-refs-export-before.json` · État de la base au moment de ce plan : `evidence/resv-db-final-state.json` (integrity ok, 0 violation FK, 4 réf/1 thèse).*
