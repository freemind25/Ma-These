# 11 — Rapport de Revalidation (Phase 11)

**État à la baseline v1.0 (2026-10-09)** : VIDE — conforme au processus en 3 temps décidé par le propriétaire.

1. **Étape 1** : audit constat SANS correction — toutes les anomalies enregistrées dans `09_FINDINGS_REGISTER.md` (statut « ouverte »).
2. **Étape 2** : propriétaire a validé le rapport (IM 2026-10-09 : « GO SOUS CONDITIONS » + autorisation étape 3 limitée à C-1 → C-4).
3. **Étape 3 (ce document, cycle `audit-remediation-p1`)** : corrections exécutées et revalidées selon le protocole — défaut reproduit/preuves avant correction → correction ciblée → tests + TNR → retest en UI réelle → preuves conservées → registre mis à jour.

**Rappel de protocole appliqué** : une correction n'est « revalidée » qu'après exécution du test dans l'interface réelle + vérification de persistance. Statuts autorisés : « corrigée, revalidée » / « corrigée, non revalidée ».

| ID | Défaut initial reproduit ? | Correction appliquée (commit) | Test qui échouait, repassé ? | Persistance vérifiée ? | TNR exécutés ? | Statut final |
|---|---|---|---|---|---|---|
| AUD-GOV-001 (C-1) | Oui — absence de tout mécanisme (audit 03 + historique perte réelle 2026-10-08) | `1682dcd` — backup auto au boot (VACUUM INTO, rotation 7 j, miroir), scripts versionnés, procédure documentée | Oui — restauration réelle vers `/tmp/restore-test` : integrity ok | Oui — diff stats live↔restaurée VIDE (16 docs, 6 737 798 car., 12 blobs) | Oui — 1 658 verts + lint 0 err | ✅ **corrigée, revalidée** |
| AUD-FUNC-002 (C-2) | Oui — CTA ré-ouvre l'ancienne thèse (capture `c2-before-dashboard-cta.png`) | `6436ed7` — CTA → `CreateThesisDialog` contrôlé + « Changer de thèse » | Oui — création 2ᵉ thèse via UI (POST 201) puis changement puis retour | Oui — DB : 2 thèses puis retour état initial, cascade sans orphelin, thèse réelle intacte | Oui — F5 inchangé, 1 658 verts | ✅ **corrigée, revalidée** |
| AUD-FUNC-003 (C-3) | Oui — suppression immédiate sans dialogue (capture `c3-before-*.png`) | `f1b5ec5` — `ConfirmDeleteDialog` sur 16 actions destructives | Oui — Annuler = 0 requête/0 modif ; Confirmer = DELETE 200 | Oui — DB vérifiée après chaque étape (5 réf → 4) | Oui — 1 658 verts sans adaptation | ✅ **corrigée, revalidée** |
| AUD-SEC-001 (+005) (C-4) | Oui — capabilities shell + CSP null (lecture config) | `93d8d08` — capabilities minimales + CSP/devCsp explicites | Partiel — web revalidé (200, parcours) ; **build Windows impossible ici** | N/A desktop (aucune donnée) | Oui — 1 658 verts, lint 0 err | 🟡 **corrigée, non revalidée côté desktop** (revalidation propriétaire) |

**TNR globaux (fin de cycle)** : suite vitest 78 fichiers / **1 658/1 658 verts** · lint **0 erreur** · lignes rouges **0 diff** · `db/custom.db` skip-worktree intact · **6 golden paths** re-parcourus en UI réelle (rédaction, création thèse, références, génération IA, RAG cité, thèses en ligne, export DOCX validé ZIP) — preuve consolidée `evidence/tnr-golden-paths.json`.

**Régressions** : aucune. **Tests impossibles** : build Tauri Windows (pas de cargo/Windows — reporté propriétaire). **Incident environnemental documenté** : 1 OOM kernel du serveur dev pendant C-2 (box 4 Go, next-server 2,5 Go) — redémarré, sans perte (détail worklog R-2).
