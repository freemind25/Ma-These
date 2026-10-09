# Tâches — audit-remediation-p1

- [x] **T1 (C-1)** Sauvegarde initiale pré-modification : VACUUM INTO 213 Mo ×2 emplacements
      + `upload/` 244 Mo ; vérification integrity_check + compteurs identiques live↔backup
      (preuve `evidence/c1-backup-initial.json`).
- [x] **T2 (C-1)** Mécanisme auto : `src/lib/backup.ts` (boot + 6 h, VACUUM INTO, rotation
      7 j, miroir `TF_BACKUP_MIRROR_DIR`), hook `instrumentation.ts`, test d'exécution réelle
      (fichier du jour créé + miroir + logs).
- [x] **T3 (C-1)** Restauration : `scripts/restore-db.ts` (copie de sécurité préalable),
      **restauration réelle vers `/tmp/restore-test`**, diff stats live↔restaurée VIDE,
      `docs/SAUVEGARDE-RESTAURATION.md`, preuve `evidence/c1-restore-test.json`.
- [ ] **T4 (C-2)** Reproduction du défaut AUD-FUNC-002 en UI réelle (preuve avant correction).
- [ ] **T5 (C-2)** Correction ciblée (CTA → CreateThesisDialog + accès « changer de thèse »)
      + vérification isolation multi-thèses en UI réelle (contenus/références/documents).
- [ ] **T6 (C-3)** Reproduction suppression sans confirmation (preuve avant correction).
- [ ] **T7 (C-3)** AlertDialog de confirmation sur les références + inventaire et traitement
      des autres actions destructives (Annuler = 0 requête, Confirmer = DELETE 200).
- [ ] **T8 (C-4)** Durcissement Tauri : retrait `shell:allow-execute`/`allow-open`, CSP
      explicite ; statut desktop « non revalidé (build Windows impossible ici) » documenté.
- [ ] **T9 (TNR)** Suite vitest complète + lint 0 erreur + 6 golden paths + lignes rouges
      0 diff + skip-worktree db intact.
- [ ] **T10 (v1.1)** Registre 09 mis à jour + Phase 11 remplie + rapport distinct
      `BASELINE_AUDIT_REPORT_v1.1.md` + worklog + push.
