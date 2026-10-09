# Sauvegarde et restauration de la base de données (C-1 / AUD-GOV-001)

**Cycle** : audit-remediation-p1 · **Origine** : Baseline Audit v1.0, anomalie AUD-GOV-001
(« aucune sauvegarde outillée » — condition P1 C-1 du verdict GO SOUS CONDITIONS)

## 1. Ce qui est couvert

| Donnée | Où elle vit | Couverture |
|---|---|---|
| Thèse, chapitres, références, jobs, analyses… | `db/custom.db` (SQLite) | Sauvegarde quotidienne automatique |
| **Documents importés (PDF, blobs OCR)** | `ImportedDoc.data` **dans la DB** | Inclus dans le backup DB (12 blobs, 205,5 Mo au 2026-10-09) |
| Sources originales déposées (RAR/PDF) | `upload/` (244 Mo) | Copie manuelle initiale `backups/upload-<ts>/` + hors arbre ; statique (ne change qu'avec un nouveau dépôt utilisateur) |

## 2. Mécanisme automatique (`src/lib/backup.ts`)

- Déclenché au boot du serveur par `src/instrumentation.ts` (+ re-vérification toutes les 6 h).
- SQLite **`VACUUM INTO`** : snapshot cohérent **à chaud**, compacté, sans toucher la base live.
- 1 fichier/jour : `backups/custom-YYYY-MM-DD.db` (intra-projet, **gitigné** par conception).
- **Rotation 7 jours** automatique.
- **Miroir hors arbre git** optionnel : `TF_BACKUP_MIRROR_DIR=/home/z/backups/thesisframe`
  (recommandé — une seconde copie hors du dépôt).
- Jamais bloquant : un échec de sauvegarde journalise une erreur, le serveur démarre quand même
  (vérifier `dev.log` pour `[backup]`).

Commandes manuelles équivalentes :

```bash
bun scripts/backup-db.ts backups/custom-$(date +%Y%m%d-%H%M%S).db
bun scripts/db-snapshot-stats.ts file:backups/custom-<date>.db   # intégrité + compteurs
```

## 3. Restauration (`scripts/restore-db.ts`)

```bash
# Vers un environnement de test (aucune coordination nécessaire) :
mkdir -p /tmp/restore-test
bun scripts/restore-db.ts backups/custom-<date>.db --target file:/tmp/restore-test/custom.db

# Vers la base LIVE — ARRÊTER LE SERVEUR AVANT (bun run lint / kill next-server) :
bun scripts/restore-db.ts backups/custom-<date>.db        # cible par défaut db/custom.db
# puis redémarrer le serveur et vérifier l'UI.
```

Le script **ne procède jamais à un écrasement aveugle** : il crée d'abord une copie de
sécurité `custom.db.pre-restore-<timestamp>` de l'état courant, puis vérifie
`PRAGMA integrity_check` + comptages sur le fichier restauré.

## 4. Vérification d'intégrité/complétude (preuve de restauration)

Comparer les statistiques de la base restaurée à la base live :

```bash
bun scripts/db-snapshot-stats.ts file:/tmp/restore-test/custom.db > /tmp/stats-restored.json
bun scripts/db-snapshot-stats.ts file:db/custom.db            > /tmp/stats-live.json
diff <(grep -v '"target"' /tmp/stats-restored.json) <(grep -v '"target"' /tmp/stats-live.json)
# diff vide = restaurée identique (compteurs, corpus, integrity_check, fkViolations)
```

Référence chiffrée au 2026-10-09 (pre-remédiation) : Thesis 1 · Chapter 7 (2 295 mots) ·
ImportedDoc 16 (6 737 798 caractères, 12 blobs, 205 551 633 octets) · Reference 4 · Job 24 ·
ChapterVersion 6 · ElementAnalyse 1.

## 5. Limites documentées

- La restauration vers la base **live** exige l'arrêt du serveur (SQLite = un fichier unique ;
  un écrasement à chaud risquerait une incohérence des connexions ouvertes).
- La preuve de boot d'un **second serveur** sur la copie restaurée n'est pas exécutable dans
  cet environnement (4 Go RAM, next-server déjà à ~2,5 Go — risque OOM) ; la vérification se
  fait au niveau ORM Prisma (même moteur que l'application) + SQLite intégrité + compteurs.
- `backups/` est volontairement **hors git** (254 Mo > limite GitHub 100 Mo) ; le miroir
  `TF_BACKUP_MIRROR_DIR` fournit la seconde localisation.

## 6. Restauration des fichiers sources `upload/` (A3 — cycle audit-final-v1.2)

**Ce que couvre quoi** : la base (blobs OCR des PDF importés, métadonnées) est couverte par le
backup DB quotidien ; les **dépôts originaux** (`upload/` : RAR, PDFs sources, documents divers)
sont couverts par la copie `backups/upload-<timestamp>/`. Les deux ensemble = restauration
complète sans référence cassée.

**Vérification / restauration outillée** (lecture seule, réutilisable) :

```bash
# 1) Vérifier l'intégrité de la copie de sauvegarde (noms, tailles, SHA-256) :
bun scripts/verify-upload-backup.ts upload/ backups/upload-<ts>/

# 2) Restaurer vers un répertoire de test isolé (JAMAIS d'essai destructif sur l'unique copie) :
mkdir -p /tmp/restore-files-test && cp -a backups/upload-<ts>/. /tmp/restore-files-test/

# 3) Comparer restauré ↔ originaux :
bun scripts/verify-upload-backup.ts upload/ /tmp/restore-files-test/
#   → « identique : OUI — 100 % (noms, tailles, SHA-256) » attendu

# 4) Cochérence avec la base : chaque ImportedDoc correspond soit à un dépôt direct de
#    upload/ (taille vérifiée), soit à un original présent dans un RAR de upload/
#    (blobs OCR en DB). Script de mapping : voir evidence/a3-upload-restore.json §étape 5.
```

**Preuve d'exécution réelle (2026-10-10)** : sauvegarde intacte 100 % · restauration réelle vers
`/tmp/restore-files-test` 100 % identique (20 fichiers, 255 273 238 octets) · jeu de test
contrôlé AUDIT-A3 (perte simulée → restauration → SHA-256 OK) · cohérence DB↔fichiers :
16/16 ImportedDoc localisés (4 dépôts directs + 9 dérivés de RAR + 3 résidus de test docx —
AUD-DATA-001), 0 référence cassée. Détail : `audit/baseline/evidence/a3-upload-restore.json`.

**Limite** : la copie `upload/` est manuelle et statique — après tout nouveau dépôt
utilisateur, refaire la copie (ou automatiser, amélioration à soumettre).
