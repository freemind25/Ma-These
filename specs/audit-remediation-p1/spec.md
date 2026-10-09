# Cycle audit-remediation-p1 — Corrections C-1 → C-4 du Baseline Audit v1.0

## 1. Contexte et autorisation

- **Baseline Audit v1.0** (commit `978a3cc`, rapport `audit/baseline/BASELINE_AUDIT_REPORT.md`) :
  verdict **GO SOUS CONDITIONS** — 17 anomalies, 4 corrections P1.
- **Avis du propriétaire (2026-10-09, IM)** : verdict validé ; **étape 3 autorisée** :
  exécution de **C-1 → C-2 → C-3 → C-4** dans cet ordre, **exclusivement** les corrections
  et leur revalidation. **Ni mise en production, ni ouverture aux premiers utilisateurs.**
- Le rapport **Baseline Audit v1.0 reste immuable** ; les mises à jour portent sur le
  registre `09_FINDINGS_REGISTER.md` (statuts), la Phase 11 (`11_REVALIDATION_REPORT.md`)
  et un **rapport distinct Baseline Audit v1.1**.

## 2. Exigences du propriétaire (contrat de ce cycle)

1. **C-1 sauvegarde/restauration** : sécuriser l'état actuel AVANT toute modification ;
   documenter la procédure ; couvrir base SQLite **et** documents associés ; **vraie
   restauration en environnement de test** avec vérification d'intégrité/complétude ;
   pas de C-1 sans **preuve de restauration**.
2. **C-2 création/changement de thèse** : réparer dans l'UI réelle ; vérifier création
   de plusieurs thèses, sélection, persistance, **isolation** des contenus/références/
   documents — **aucun mélange de données** entre thèses.
3. **C-3 confirmation avant suppression** : confirmation explicite + **audit des autres
   actions destructives** ; annuler ne modifie rien ; suppression seulement après
   confirmation.
4. **C-4 durcissement Tauri** : capabilities strictement nécessaires + CSP adaptée ;
   vérifier les fonctionnalités ; tests sur build desktop cible **avant toute
   distribution** (build Windows = test impossible ici → documenté, validation
   propriétaire).
5. **Protocole par correction** : défaut initial + preuves avant correction ; correction
   ciblée ; tests concernés + TNR ; retest dans l'app réelle ; preuves conservées ;
   registre mis à jour ; « revalidée » seulement après vérification effective ;
   régressions/tests impossibles documentés.
6. **Après C-1..C-4** : TNR globaux (suite 1 658 tests, six golden paths baseline).
7. **Avant GO final** (hors ce cycle, réservé) : pass des 33 vues non testées (C-19),
   validation build web/desktop selon modes de distribution ; tout risque résiduel
   accepté documenté et soumis à validation.
8. **Livrable** : rapport de revalidation distinct **Baseline Audit v1.1** (avant/après,
   preuves, tests, anomalies restantes, régressions).

## 3. Critères d'acceptation

- **CA-1 (C-1)** : sauvegarde initiale pré-modification vérifiée (integrity + compteurs) ;
  backup quotidien auto au boot + rotation 7 j + miroir hors arbre ; script restore avec
  copie de sécurité ; **restauration réelle en env de test avec diff complet vide** ;
  doc `docs/SAUVEGARDE-RESTAURATION.md` ; preuves JSON dans `audit/baseline/evidence/`.
- **CA-2 (C-2)** : en UI réelle — créer une 2ᵉ thèse depuis le CTA ; revenir à la liste ;
  ré-ouvrir la 1ʳᵉ ; données de A intactes et invisibles depuis B (et inversement) ;
  preuves captures + DB ; TNR : réouverture thèse active inchangée.
- **CA-3 (C-3)** : toute suppression destructive exige confirmation ; Annuler = 0
  requête DELETE et 0 modification DB ; Confirmer = DELETE 200 + disparition ; inventaire
  des autres actions destructives consigné et traité ; TNR suppression confirmée OK.
- **CA-4 (C-4)** : capabilities Tauri minimales (shell execute/open retirés) ; CSP
  explicite dans `tauri.conf.json` ; app web inchangée (HTTP 200, parcours) ; statut
  « corrigée, non revalidée — build Windows requis » documenté pour la validation desktop.
- **CA-5 (TNR)** : suite vitest verte (comptage consigné) ; lint 0 erreur ; 6 golden
  paths re-parcourus dans l'app réelle ; lignes rouges 0 diff ; skip-worktree db intact.
- **CA-6 (v1.1)** : `audit/baseline/BASELINE_AUDIT_REPORT_v1.1.md` distinct (avant/après,
  preuves, tests, anomalies restantes, régressions) + Phase 11 remplie + registre à jour.

## 4. Rouges et invariants (inchangés)

- 0 diff sur `src/app/api/theses-en-ligne/search/route.ts`, `src/app/api/arxiv/search/route.ts`,
  `src/components/layout/app-sidebar.tsx`.
- `db/custom.db` skip-worktree (état corpus local, jamais commité) ; pas de `bun run build`.
- Conventional commits + push systématique avec garde-fou anti-snapshot
  (`git log origin/main..HEAD` avant chaque push).
