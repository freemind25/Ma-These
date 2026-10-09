# Audit Baseline v1.0 — ThesisFrame (Ma Thèse)

**Audit exhaustif préproduction** exécuté conformément au « PROMPT MAÎTRE — AUDIT GLOBAL DE RÉFÉRENCE AVANT MISE EN PRODUCTION » fourni par le propriétaire.
**Règle respectée** : audit constat **sans aucune correction** (étape 1/3 du processus propriétaire : constat → validation → corrections+contre-audit).

- **Cible** : ThesisFrame v1.10.8, commit `2156a8f` (main)
- **Date** : 2026-10-09
- **Rapport principal** : `BASELINE_AUDIT_REPORT.md`
- **Verdict** : **GO SOUS CONDITIONS** (conditions listées §K du rapport principal)

## Contenu du dossier

| Fichier | Phase du référentiel | Contenu |
|---|---|---|
| 00_SCOPE_AND_BASELINE.md | Phase 0 | Périmètre, baseline technique, limites de l'environnement |
| 01_FUNCTIONAL_AUDIT.md | Phase 1 | Tests UI réels (agent-browser), parcours, tests négatifs |
| 02_THESIS_WORKFLOW_AUDIT.md | Phase 2 | Métier thèse : rédaction, IA, RAG, sources, imports, export |
| 03_ARCHITECTURE_AND_CODE_AUDIT.md | Phase 3 | Architecture réelle, mesures lint/tests, API, DB (agent auditeur) |
| 04_SECURITY_AUDIT.md | Phase 4 | AppSec, secrets, Tauri, XSS/SQL/SSRF/prompt-injection (agent auditeur) |
| 05_RELIABILITY_PERFORMANCE_AUDIT.md | Phase 5 | Erreurs, concurrence, mesures de perf réelles, résilience |
| 06_GOVERNANCE_AUDIT.md | Phase 6 | Gouvernance, traçabilité, gouvernance scientifique |
| 07_USER_EXPERIENCE_AUDIT.md | Phase 7 | UX exploratoire, responsive, accessibilité |
| 08_TEST_MATRIX.md | Phase 8 | Matrice 47 vues ↔ tests ↔ verdicts, couverture |
| 09_FINDINGS_REGISTER.md | Phase 9 | **17 fiches d'anomalies** (1 ❌, 15 ⚠️) avec preuves et corrections |
| 10_REMEDIATION_ROADMAP.md | Phase 10 | Plan P1/P2/P3 avec efforts, critères, dépendances |
| 11_REVALIDATION_REPORT.md | Phase 11 | Vide (aucune correction autorisée à ce stade) |
| BASELINE_AUDIT_REPORT.md | Phase 12 | Rapport principal de référence |
| evidence/ | §18 | Captures ui-01…ui-18 authentiques + JSON |
| diagrams/ | §18 | Architecture réelle |

## Chiffres clés
- **17 anomalies** : 1 ❌ CASSÉ (création multi-thèses impossible), 15 ⚠️ DÉGRADÉ, 0 vulnérabilité critique/élevée confirmée.
- **Couverture UI** : 14/47 vues testées (8 ✅ + 6 partielles) ; 33 non exécutées = risque résiduel explicite.
- **Automatisé** : 1 658 tests verts, lint 0 erreur / 244 warnings, 29/53 groupes API couverts.
- **Conditions de GO** : C-1 (sauvegarde DB), C-2 (multi-thèses), C-3 (confirmation suppression), C-4 (durcissement Tauri avant distribution).
