# 18 — Répétition générale : migration « références rattachées par thèse »

**Cycle :** audit-final-v1.2 · **Task ID :** 3 · **Agent :** agent-repetition-migration (Z.ai Code) · **Date :** 2026-10-10
**Statut :** RÉPÉTITION GÉNÉRALE SUR COPIE — **aucune modification de la base réelle** (`db/custom.db`), du schéma du dépôt (`prisma/schema.prisma`), du code source, ni de `.env`. La migration sur la base réelle reste **interdite sans validation explicite du propriétaire**.
**Preuves :** `audit/baseline/evidence/rehearsal-refs.json` (preuve machine) · `audit/baseline/evidence/rehearsal-refs-export-before.json` (export réversible) · scripts réutilisables dans `audit/baseline/tools/rehearsal-refs/`.
**Proposition de référence :** `specs/ref-thesis-scoping/proposition-technique.md` (amendement §6-bis v1.1).

---

## 1. Méthode et garanties

1. **Copie de travail** : `db/custom.db` (265 330 688 octets) copié byte-à-byte vers `/tmp/rehearsal-refs/rehearsal.db` + une **sauvegarde de rollback** `rehearsal-BACKUP-rollback.db`. SHA-256 des trois fichiers **identiques** au départ : `47e429d6fa27b9411b6f59f4f328add9782c17226cb00a78708db919cc2ca6ec`.
2. **Base réelle inviolée** : SHA-256 de `db/custom.db` vérifié **avant copie, à mi-session et en fin de session — identique** (`47e429d6…`). `db/custom.db` reste en skip-worktree ; aucun `db:push` sur la base réelle ; `DATABASE_URL` passé en **env inline** du process (jamais écrit dans `.env`).
3. **Schéma du dépôt inviolé** : `prisma/schema.prisma` jamais modifié (git diff vide). L'amendement est appliqué sur une **copie** `/tmp/rehearsal-refs/schema.prisma` (copie de traçabilité : `tools/rehearsal-refs/schema-rehearsal.prisma` ; l'original byte-identique conservé en `schema-original.prisma`, vérifié par `diff`).
4. **Client Prisma ad hoc** : généré dans `/tmp/rehearsal-refs/client` (`bunx prisma generate --schema /tmp/rehearsal-refs/schema.prisma`, client autonome) — `node_modules` du dépôt intact. **Serveur dev port 3000 : ni redémarré ni reconfiguré** (constat départ : port non à l'écoute, pid du `.zscripts/dev.pid` inexistant ; respect strict de la consigne — la répétition est indépendante du serveur).
5. Aucun commit, aucun push, aucun fichier rouge touché, aucun secret dans les preuves.

## 2. Inventaire AVANT (réalité du schéma, mesurée en base)

| Mesure (lecture seule, `bun:sqlite`) | Valeur |
|---|---|
| Tables | 30 |
| Références (`Reference`) | **4** |
| Thèses (`Thesis`) | **1** — `cmsmyrdfs0000pa2sews4vo90` « Urbanisme durable » (Marie Dupont, draft, chapters) |
| Chapitres / versions | 7 / 6 |
| **Clés étrangères pointant vers `Reference`** | **0** (vérifié `PRAGMA foreign_key_list` sur les 30 tables) |
| Colonnes `Reference` | 21 (id, type, authors, title, year, journal, volume, issue, pages, publisher, doi, isbn, url, abstract, keywords, notes, bibtexKey, source, isFavorite, createdAt, updatedAt) — **pas de thesisId** |
| Index `Reference` | type, year, isFavorite, source |
| Intégrité / FK check | ok / 0 violation |

**Fait structurant (documente la réalité du schéma) :** la bibliothèque de références est **globale sans aucune relation DB** — les « 8 points d'usage » de la proposition §0 sont des **consommateurs applicatifs** (routes `references/*`, `export-docx`, `chapter-draft/stream`, `alignement-preuves`, `stats`, `citations`, `rag-service`, `sources-server`, `registre-juridique-tab`), pas des tables de liaison. Conséquence : le critère « 0 orphelin d'usage » est **non applicable en base** ; l'atteignabilité se joue via la FK `thesisId` (0 dangling prouvé). Aucune migration de données d'usage n'est nécessaire — **seule la table `Reference` change**.

## 3. Résultats chiffrés par étape (détail : `rehearsal-refs.json`)

### Étape 1 — Export réversible (prérequis proposition §3.1)
- `rehearsal-refs-export-before.json` : **4 références, 21 colonnes, ordonnées par id**, horodatées, SHA base source consigné, `integrity_check=ok`, 0 violation FK. SHA export : `7ef2f83b69e250a437998ef188d34e65a4f47ad71f09102f738708d656fc3643`. (Export effectué sur la copie byte-identique — équivalence prouvée par SHA.)

### Étape 3 — `db push` sur la copie (schéma amendé conformément §1)
- Commande : `DATABASE_URL=file:/tmp/rehearsal-refs/rehearsal.db bunx prisma db push --schema /tmp/rehearsal-refs/schema.prisma --skip-generate` → *sync en 19 ms*.
- Contrôles : colonne **`thesisId` TEXT nullable créée** ✔ · index **`Reference_thesisId_idx` créé** ✔ · 4 index existants conservés ✔ · **comptages identiques** (Reference 4, Thesis 1, Chapter 7) ✔ · `integrity_check=ok`, 0 violation FK ✔ · SHA copie `47e429d6…` → `c32fcff9…` (changement **attendu** : reconstruction de table SQLite).

### Étape 4 — Migration d'attribution (règle §3.3 appliquée à la lettre)
- **Run 1 — cas univoque** (état strictement identique à la base réelle : **1 thèse**, 4 réf. `thesisId` NULL) : règle = *« CAS_UNIVOQUE (1 thèse) — attribution de toutes les références thesisId=NULL à la thèse unique cmsmyrdfs0000pa2sews4vo90 ("Urbanisme durable") »* → **4/4 attribuées, 0 ambiguë, journal d'attribution consigné ligne par ligne** (4 entrées : id, titre, from NULL → to propriétaire, raison, horodatage). `updatedAt` volontairement préservé.
- **Idempotence prouvée** : 2ᵉ passage → **0 ligne modifiée**.
- **Branche « ambigu » exercée** (run 2 en état multi-thèses, 1 réf. globale témoin) : règle = *« CAS_MULTI-THÈSES — 0 attribution automatique »* → la réf. ambiguë **reste `thesisId` NULL et est LISTÉE** dans le rapport d'ambiguïté ; les 6 réf. déjà attribuées ne sont pas touchées.
- **Réponse honnête à la question « combien attribuables sans ambiguïté »** : sur la base actuelle (1 seule thèse), la proposition §3.3 qualifie explicitement ce cas d'**univoque** (un seul candidat propriétaire) → **4 attribuées / 0 ambiguë / 0 non attribuable**. En état multi-thèses (futur), la règle impérative du propriétaire prime : tout est ambigu → NULL + listé (écart EC-1 ci-dessous).

### Étape 5 — Tests d'isolation 2 thèses (thèse B `REHEARSAL-TH-B` + 2 chapitres + 2 réf. attribuées à B + 1 réf. globale)
**16/16 PASS** (détail par test dans la preuve machine) :
- **(a) Isolation stricte** : requête scopée thèse A = exactement les 4 réf. du propriétaire, **0 réf. de B** ; scopée thèse B = exactement 2 réf. de B, **0 réf. du propriétaire** ; vues inclusives croisées sans fuite (A voit 5 = 4 + 1 globale ; B voit 3 = 2 + 1 globale). ✔
- **(b) Globales** : la réf. `thesisId` NULL reste visible des deux thèses. ✔
- **(a7) Contrat API 404 (miroir DB)** : UPDATE cross-contexte (garde `thesisId` ≠ propriétaire de la réf.) → **0 ligne modifiée**, réf. intacte. ✔
- **(c) Cascade** : DELETE thèse B → ses **2 réf. supprimées en cascade** (+ 2 chapitres), la réf. globale **survit**, les 4 réf. du propriétaire inchangées. ✔
- **(d) Propriétaire intact** : diff ligne à ligne des 4 réf. vs export réversible → **seul `thesisId` diffère**. ✔

### Étape 6 — Contrôles de cohérence post-migration — verdict **PASS**
- Comptages : **total avant (4) == total après (4)** ; 0 ligne manquante vs export.
- Orphelins : **0 dangling** (`thesisId` pointant vers une thèse inexistante) ; « orphelin d'usage » non applicable en base (§2 ci-dessus).
- Intégrité : `integrity_check=ok`, `foreign_key_check` = 0 violation.
- Re-vérif export : 4 lignes préexistantes, **diff = champ `thesisId` uniquement** (normalisation de représentation : booléen↔0/1, Date↔ms epoch, mêmes valeurs).

### Étape 7 — Rollback DÉMONTRÉ (double voie §3.4)
| Voie | Méthode | Preuve |
|---|---|---|
| **7a — inverse surgical** (§3.4.2) | ré-attribution à NULL guidée par le journal d'attribution (garde : ne touche que les lignes toujours attribuées à la thèse du journal) | 4/4 inversées, 0 écrasement concurrent ; re-dump = **identité stricte avec l'export réversible (diff vide sur toutes les colonnes)** |
| **7b — restauration complète byte-identique** (procédure C-1, §3.4.1) — **voie ROBUSTE recommandée en production** | `cp` de la sauvegarde horodatée → copie | SHA copie après restore = `47e429d6…` == SHA initial de la copie **== SHA de `db/custom.db`** ; 30 tables ; Reference 4 / Thesis 1 / DoctoralToolbox 1 (résidu intact) ; **colonne `thesisId` absente** ; 4 titres intacts ; integrity ok |

## 4. Écarts vs proposition (tous documentés, aucun masqué)

| # | Écart | Justification | Impact |
|---|---|---|---|
| EC-1 | Branche §3.3 « attribution à la thèse active du moment » **non implémentée** en multi-thèses (0 attribution auto ; ambigu = NULL + listé) | Règle impérative du propriétaire (Task ID 3) ; aucun champ « thèse active » en base ; aucune heuristique inventée | Nul en exécution réelle (1 seule thèse → cas univoque) |
| EC-2 | Thèse de test créée **après** la migration run 1 (l'étape 2 la plaçait avant) | Fidélité : répéter le cas univoque sur un état strictement identique à la base réelle ; la branche multi-thèses est ensuite exercée explicitement | Nul — les deux branches sont prouvées |
| EC-3 | Client ad hoc v6.19.2 (dépôt : ^6.11.1) | Client autonome limité à la copie ; l'exécution réelle utilisera le client du dépôt | Nul sur les données |
| EC-4 | Serveur dev 3000 constaté **non à l'écoute** en début de session | Consigne « ne pas le redémarrer » respectée ; la répétition DB n'en dépend pas | Le re-pass UI du plan d'exécution réel exigera un serveur fonctionnel |

## 5. PLAN D'EXÉCUTION FINAL — base réelle `db/custom.db` (après GO explicite du propriétaire)

**Pré-requis bloquants** : (1) **GO écrit du propriétaire** sur cette répétition + la proposition v1.1 ; (2) serveur dev arrêté proprement pour la fenêtre (ou fenêtre sans usage) ; (3) résidu DoctoralToolbox : sans objet pour cette migration (dépend de la thèse propriétaire, non supprimée — cf. `19_RESIDU_DOCTORALTOOLBOX.md`, décision séparée).

| # | Action | Outil/commande | Contrôle d'arrêt (critère GO/NO-GO de l'étape) |
|---|---|---|---|
| 0 | Fenêtre + gel des écritures (quitter l'app, arrêter le serveur dev) | — | port 3000 fermé |
| 1 | **Sauvegarde horodatée** : copie byte-identique `db/custom.db` → `audit/baseline/evidence/backups/custom-YYYYMMDDTHHMMSS.db` (hors arbre si préféré) + SHA-256 consigné ×2 | `cp --preserve=timestamps` + `sha256sum` | SHA copie == SHA original |
| 2 | **Export réversible** : dump complet `Reference` → `evidence/references-export-before-<TS>.json` | `tools/rehearsal-refs/export-references.mjs db/custom.db <out>` | rowCount == 4, integrity ok |
| 3 | Inventaire avant (compteurs + FK) | `tools/rehearsal-refs/db-inventory.mjs db/custom.db <out>` | Reference 4, Thesis 1, 0 violation FK |
| 4 | Amendment du schéma du dépôt (cette fois `prisma/schema.prisma`, commit dédié) — + `bunx prisma generate` | — | diff limité à : thesisId String? + relation Cascade + @@index([thesisId]) + references Reference[] |
| 5 | `bunx prisma db push` sur `db/custom.db` | `bunx prisma db push --skip-generate` | **NO-GO si** : comptages ≠ étape 3, integrity ≠ ok, FK ≠ 0 → rollback étape 9 |
| 6 | **Migration d'attribution** (journal + rapport d'ambiguïté) | `tools/rehearsal-refs/migrate-references-to-thesis.mjs db/custom.db <journal>` | Attendu : **4 attribuées / 0 ambiguë** (cas univoque) ; **NO-GO si** rowsUpdated ≠ nb de réf. NULL ou dangling > 0 → rollback |
| 7 | Contrôles de cohérence | `tools/rehearsal-refs/consistency-check.mjs db/custom.db <export> <out>` | verdict **PASS** (comptages, 0 dangling, integrity ok, diff export = thesisId seulement) |
| 8 | TNR + re-pass UI (références, brouillon-chapitre, export DOCX GP-7, export PDF) + tests d'isolation vitest (12-16, proposition §4) à implémenter lors du cycle d'exécution | suite existante | 1 658 verts min. + parcours références OK |
| 9 | **Si NO-GO — rollback production** : (i) restauration complète depuis la sauvegarde horodatée (`cp` + SHA double check == SHA étape 1) puis `bunx prisma generate`, OU (ii) inverse surgical via journal (`tools/rehearsal-refs/inverse-migration.mjs`) + re-vérif export identité stricte | preuve SHA + comptages | SHA == sauvegarde, Reference == 4, integrity ok |
| 10 | Consignation : journal, rapport d'ambiguïté, preuves SHA, commit unique « feat(refs): thesisId + migration attribution (proposition ref-thesis-scoping) » | — | — |

**Durée estimée** : 30–45 min hors re-pass UI (push ~1 s démontré en 19 ms sur copie ; l'essentiel = sauvegarde, contrôles, TNR) ; **demi-journée** avec re-pass UI + tests.
**Critères d'arrêt globaux** : toute divergence de comptage, tout `integrity_check ≠ ok`, toute violation FK, tout dangling ≠ 0 → **arrêt immédiat + rollback** avant toute autre action.

## 6. Avis GO / NO-GO pour le propriétaire

### Avis : **GO conditionnel — favorable** (sur les données de décision ci-dessous)

| Donnée de décision | Résultat de la répétition |
|---|---|
| Schéma (thesisId nullable + Cascade + index) | Push propre sur copie, 19 ms, données intactes, index conservés |
| Perte de données | **Aucune** (total 4 == 4 ; diff export = thesisId uniquement) |
| Attribution automatique | **4/4 attribuables** (cas univoque : 1 seule thèse) — 0 ambiguë, journal consigné ; si le propriétaire préfère 0 attribution auto, le script le gère (branche ambigu) |
| Isolation 2 thèses | **16/16 tests PASS** (A/B, globales, 404-simulé, cascade, propriétaire intact) |
| Réversibilité | **Double rollback prouvé** : inverse surgical (identité export stricte) + restauration byte-identique (SHA == original) |
| Risque résiduel principal | **Consommateurs applicatifs** : le push n'isole rien tant que les 8 points d'usage (API + vues) ne filtrent pas par `thesisId` — comportement inchangé avant le cycle d'implémentation API/UI (proposition §2/§6) ; le re-pass UI post-push réel est donc obligatoire |
| Environnement | Serveur dev 3000 à vérifier/relancer par l'orchestrateur avant la fenêtre (non touché pendant la répétition, constaté arrêté) |

**Conditions du GO** : (1) validation écrite du propriétaire de ce rapport ; (2) exécution du plan §5 dans l'ordre, avec les critères d'arrêt tels quels ; (3) le cycle d'implémentation API+zod+UI+tests (§2/§4/§6 de la proposition) suit le push — **le push seul ne change pas le comportement applicatif** (avantage : aucune rupture le jour J, rollback aisé).

---
*Preuves machine : `evidence/rehearsal-refs.json` (SHA `62b07c69…`) · export réversible : `evidence/rehearsal-refs-export-before.json` (SHA `7ef2f83b…`) · scripts : `tools/rehearsal-refs/` (7 fichiers, réutilisables tels quels pour l'exécution réelle).*
