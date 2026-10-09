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
