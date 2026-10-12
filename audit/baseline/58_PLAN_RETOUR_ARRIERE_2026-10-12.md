# 58 — PLAN DE RETOUR ARRIÈRE « MA THÈSE » — PROCÉDURES, PRÉREQUIS, CONDITIONS DE DÉCLENCHEMENT

**Cycle :** audit-final-v1.2 · vague 35 (préparation documentaire — zéro opération technique)
**Date :** 2026-10-12 · **Fondements :** doc 44 §4 (voie 7b) · doc 42 §7 (retour arrière lot 1) · doc 41 §7 (points d'arrêt) · docs 32/34 (fenêtre commune) · rapport 52 §2 (archives de secours) · `docs/SAUVEGARDE-RESTAURATION.md` §6 · `scripts/restore-db.ts` · `src/lib/backup.ts`.
**Règle d'or :** aucun retour arrière n'est improvisé ; toute exécution suit l'un des scénarios ci-dessous, avec preuves SHA avant/après et signalement au propriétaire. **Le silence ne vaut jamais acceptation.**

---

## §1 — Principes verrouillés

1. **Sauvegarde bloquante AVANT toute écriture** (copie horodatée + double SHA, doc 44 §2) — sans exception ;
2. **Voie de repli par défaut = restauration byte-identique** (voie 7b) ; la voie chirurgicale (7a, `inverse-migration.mjs`) exige une instruction écrite du propriétaire ;
3. **Le candidat figé et ses tags ne sont jamais déplacés, amendés, rebaseés ni supprimés** — quoi qu'il arrive ;
4. **Jamais d'opération en place sur un original** : toute restauration d'archive passe d'abord par une copie de travail sous `/tmp`, vérifiée par SHA-256, puis remplacement contrôlé avec empreinte AVANT/APRÈS ;
5. Toute anomalie traversée = **ARRÊT immédiat** (aucune « réparation » à la main) ;
6. Reprise après arrêt = **décision écrite explicite** du propriétaire.

## §2 — Actifs de retour arrière disponibles (vérifiés)

| Actif | Contenu | Empreinte / état | Usage |
|---|---|---|---|
| Sauvegarde quotidienne automatique | `backups/custom-YYYY-MM-DD.db` (VACUUM INTO, rotation 7 j) + miroir `TF_BACKUP_MIRROR_DIR` | mécanisme prouvé (`[backup]` logs, restauration testée `c1-restore-test.json`) | RA-4 (perte post-usage) |
| Copie horodatée S1 | `audit/baseline/evidence/backups/custom-<TS>.db` (créée au démarrage de S1) | double SHA == base au moment T | RA-1 (annulation migration) |
| Backup pre-resync base de test | `…/urbanisme-test-avant-resync-20261011T091500Z.db` | `16f3c3f4…84ae5` · 552 960 o | retour à l'état pré-R2 (uniquement sur instruction — cet état contient le drift historique) |
| **Archives de secours A/B/C (duplex)** | A : preuves/docs/journaux · B : **bases (custom.db réel 265 Mo + post-R2 + artefact) + .env** · C : magasin `.git` complet à `b266110` | `f5df6373…23e8e` · `acf83106…07d079` · `7895271e…5d031` — `sha256sum -c` OK ×3 (15:06 UTC) — emplacements `/home/sync/upload/secours-r2-20261012/` + `/tmp/secours-r2-20261012/` | RA-6 (catastrophe environnement) |
| Sauvegarde `upload/` | 20 fichiers / 255 273 238 o, SHA-256 100 % vérifiés (A3) | `a3-upload-restore.json` | RA-5 (perte documents) |
| Historique distant pré-audit | `github.com/freemind25/ThesisFrame` (privé) — jusqu'à ~`f4ca696` + tags v1.10.7/v1.10.8 (code pré-correctifs) | public/privé maîtrisé par le propriétaire | dernier recours documentaire (ne contient PAS la lignée candidate) |
| Outillage versionné | `restore-db.ts` (pré-restore auto), `verify-upload-backup.ts`, `inverse-migration.mjs` (7a) | scripts aux candidats, hashes doc 43 §3.6 | exécution contrôlée |

⚠️ `backups/custom-2026-10-12.db` (racine projet, artefact plateforme d'origine inconnue) : **à ne pas utiliser** comme support de restauration tant que son origine n'est pas clarifiée (demande incluse au dossier 54).

## §3 — Scénarios de retour arrière

### RA-1 — Annulation de la migration S1 (fenêtre commune, GO A)
**Déclencheurs :** toute divergence de comptage · `integrity_check ≠ ok` · violation FK · dangling ≠ 0 · `rowsUpdated ≠ 4` · diff M-7 ≠ « thesisId seul » · divergence d'empreinte.
**Procédure (doc 44 §4, ordre immuable) :** ① cesser toute opération ; ② consigner sorties brutes + horodatage ; ③ signalement immédiat au propriétaire ; ④ **rollback voie 7b par défaut** :
```bash
sha256sum audit/baseline/evidence/backups/custom-<TS>.db   # == 756c0158…8126d consigné
cp --preserve=timestamps audit/baseline/evidence/backups/custom-<TS>.db db/custom.db   # serveur arrêté
bunx prisma generate
sha256sum db/custom.db    # attendu : == SHA de la sauvegarde
```
⑤ re-contrôles (integrity ok · colonne `thesisId` absente · 30 tables) ; ⑥ voie 7a uniquement sur instruction écrite ; ⑦ reprise = décision écrite.
**Base maintenue cohérente si l'échec survient en phase C (état M, doc 25 §3) — décision au propriétaire.**

### RA-2 — Échec du lot 1 AUD-SEC-004 ou du cycle d'isolation (S2/S3)
**Déclencheurs :** test en échec · divergence avant/après sur payload valide · écriture involontaire hors périmètre.
**Procédure (doc 42 §7) :** la base `db/custom.db` **n'est jamais modifiée** par le lot 1 (aucun rollback de données requis) ; code = abandon des commits de session (non poussés) ou `git revert` des commits dédiés — **jamais d'amend/rebase/force** ; le candidat `7dff2c6` et son tag restent **intacts quoi qu'il arrive** (l'état applicatif de référence ne peut pas être perdu) ; TNR verte re-constatée sur l'état revenu ; rapport + arbitrage écrit avant toute nouvelle tentative.

### RA-3 — Interruption de la finalisation R2 (étapes 6-12)
**Déclencheurs :** préconditions §6 du rapport 52 non conformes (SHA bases, tag R2 préexistant, DDL gelé divergent, arbre non propre, serveur actif).
**Procédure :** les étapes 1-5 restent validées (aucune écriture base en 6-12) ; **aucun tag posé** tant que les preuves ne sont pas vertes ; annulation = arrêt avant le commit dédié — état antérieur intact ; reprise = nouvelle décision écrite. Un tag R2 créé n'est **jamais** déplacé ni supprimé.

### RA-4 — Perte/corruption de la base en usage (post-MEP)
**Déclencheurs :** `integrity_check ≠ ok` au quotidien, données manquantes signalées, échec de démarrage serveur.
**Procédure :** arrêter le serveur → `scripts/restore-db.ts` (crée automatiquement un `.pre-restore-<ts>` avant d'écraser — jamais aveugle) depuis le backup daté le plus récent sain → vérification `integrity_check ok` + comptages (Thesis 1, Chapter 7, Reference 4 selon état attendu) → rapport au propriétaire. Miroir hors arbre = second support.

### RA-5 — Perte/corruption de `upload/`
**Procédure (A3, `docs/SAUVEGARDE-RESTAURATION.md` §6) :** restauration depuis la sauvegarde de fichiers → `scripts/verify-upload-backup.ts` (SHA-256 100 %) → cohérence DB↔fichiers (16/16 ImportedDoc localisés) → copie manuelle statique (limite documentée).

### RA-6 — Catastrophe environnement (perte du bac à sable / restauration plateforme défaillante)
**Procédure :** ① ne JAMAIS restaurer en place à chaud ; ② extraire l'archive concernée (B pour les bases, C pour le magasin Git, A pour les preuves) vers `/tmp/restore-<TS>/` ; ③ `sha256sum -c` sur l'archive avant extraction et sur les fichiers extraits ; ④ remplacement contrôlé fichier par fichier avec empreinte AVANT/APRÈS et serveurs arrêtés ; ⑤ re-contrôles complets (doc 55 §1 P-3/P-4, état Git attendu) ; ⑥ rapport de restauration au propriétaire. **L'archive C ne contient pas la lignée candidate** (absente du magasin à sa création) — elle reconstitue l'état scellé du 10-12.

### RA-7 — Installeur/release MEP défectueuse
**Déclencheurs :** verdict C2 révisé, anomalie bloquante découverte après publication, mauvaise version publiée.
**Procédure :** dépublication/retrait immédiat de la release (acte GitHub du propriétaire) ; le tag de version n'est jamais re-créé sous le même nom (bump vers la version suivante) ; re-build depuis le candidat final uniquement ; communication aux utilisateurs à la charge du propriétaire. **Ne jamais diffuser les releases v1.10.7/v1.10.8 pré-audit (B-14).**

### RA-8 — Purge BFG interrompue ou inattendue
**Procédure :** abandon des refs de travail créées par BFG (non poussées) ; l'historique d'origine reste intact tant qu'aucun push n'est exécuté ; le candidat et les tags ne sont pas touchés par le plan (protection HEAD, doc 13 §7.2) ; toute exécution BFG se fait exclusivement dans la fenêtre coordonnée (condition iii) avec bundle de sécurité préalable (mirroir 155 Mo + bundle 78 Mo déjà prouvés A5).

## §4 — Déclencheurs transversaux d'ARRÊT (toutes opérations)

Divergence d'empreinte (arbre, base, archive, installeur) · tout test en échec · toute sortie incomplète ou non récupérée (traitée comme échec) · toute écriture non prévue · toute demande de contournement verbal (exige une trace écrite) · tout marqueur inattendu.

## §5 — Prérequis cumulés avant toute fenêtre à risque

GO écrit spécifique · serveurs arrêtés (`curl localhost:3000` échoue) · arbre propre · sauvegarde bloquante + double SHA · outils à hashes vérifiés · journal de fenêtre ouvert (horodatage) · aucune utilisation de l'app par qui que ce soit pendant la fenêtre.

---
*Plan de retour arrière — préparation documentaire. Ne constitue ni un GO ni une exécution ; statu quo conservatoire intégral maintenu.*
