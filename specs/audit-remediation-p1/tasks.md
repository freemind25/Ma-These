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
- [x] **T4 (C-2)** Reproduction du défaut AUD-FUNC-002 en UI réelle (preuve avant correction) — capture c2-before-dashboard-cta.png.
- [x] **T5 (C-2)** Correction ciblée (CTA → CreateThesisDialog contrôlé + « Changer de thèse ») + vérification isolation multi-thèses en UI réelle — commit 6436ed7 ; fait produit consigné : Reference globale par conception (arbitrage propriétaire).
- [x] **T6 (C-3)** Reproduction suppression sans confirmation (preuve avant correction) — captures c3-before-*.png.
- [x] **T7 (C-3)** ConfirmDeleteDialog partagé appliqué à 16 actions destructives + inventaire complet (2 déjà conformes, ~20 état local documentés) — Annuler = 0 requête, Confirmer = DELETE 200 — commit f1b5ec5.
- [x] **T8 (C-4)** Durcissement Tauri : capabilities = core:default seul + CSP/devCsp explicites — commit 93d8d08 ; statut desktop « non revalidé (build Windows propriétaire requis) » documenté.
- [x] **T9 (TNR)** Suite vitest 1 658/1 658 verts · lint 0 erreur · lignes rouges 0 diff · skip-worktree intact · 6 golden paths re-parcourus en UI réelle (preuve tnr-golden-paths.json + captures tnr-gp*.png) · export DOCX validé ZIP.
- [x] **T10 (v1.1)** Registre 09 mis à jour (4 fiches P1) + Phase 11 remplie + rapport distinct BASELINE_AUDIT_REPORT_v1.1.md + worklog R-1..R-5 + push.
