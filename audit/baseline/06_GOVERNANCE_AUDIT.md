# 06 — Audit Gouvernance et Traçabilité (Phase 6)

## 11. Gouvernance générale

| Contrôle | Mécanisme | Classement (1 absent / 2 présent non opérationnel / 3 opérationnel peu documenté / 4 vérifié conforme) |
|---|---|---|
| Versionnement du code | Git, commits conventionnels, push systématique, historique propre | **4** (vérifié : arbre propre, 0/0 avec origin) |
| Traçabilité des changements | Specs SDD par cycle (`specs/<slug>/spec.md + tasks.md + preuves.md`), worklog obligatoire, preuves JSON horodatées | **4** (15+ cycles documentés, vérifié) |
| Gestion des configurations | `.env.example` 32 vars documentées ; vars runtime (OCR_MAX_PAGES, TESSDATA_PATH) manquantes au fichier | **3** |
| Gestion des secrets | `.env` hors HEAD (DATABASE_URL seul tracké — voir AUD-SEC-003), clés env-only, aucun secret dans le code HEAD | **3** (réserve historique AUD-SEC-002/003) |
| Procédure de déploiement | Tauri v2 documenté ; **pipeline CI absent** (.github/ inexistant), build Windows non prouvable ici | **2** |
| Retour arrière | Prouvé en réel (rollback 2026-10-08 complet, corpus reconstruit 12/12) — mais **manuel** | **3** |
| **Sauvegardes** | **Aucune procédure automatisée ; aucune sauvegarde planifiée de db/custom.db (248 Mo)** | **1 — ABSENT (AUD-GOV-001, P1)** |
| Journalisation des erreurs | dev.log + logs worker ; Prisma `log:['query']` inconditionnel (bruit, perf log) | **3** |
| Documentation technique | README, specs, preuves | **4** |
| Documentation utilisateur | `docs/NOTICE-UTILISATION.md` 717 lignes + PDF 22 pages (44 modules pas à pas) | **4** |
| Séparation env/dev/prod | N/A (app locale mono-utilisateur) — mais risque : la « base de prod » (custom.db) vit dans l'arbre de dev avec `db:push --accept-data-loss` à portée de script | ⚠️ risque documenté |
| Règles de conservation/suppression | Suppression définitive sans corbeille (références, AUD-FUNC-003) ; pas d'export automatique de sauvegarde avant suppression | **2** |

## 11.1 Gouvernance scientifique

| Contrôle | Résultat | Verdict |
|---|---|---|
| Traçabilité des sources | RAG : extraits délimités + citation « [Chapitre 1 - …] » vérifiée en UI | ✅ |
| Distinction contenu généré ↔ source vérifiée | Champs `source` sur références ; sceau « Provenance des savoirs » affiché sur chaque génération (« noyau de connaissance v2026-10-03 — aucune compétence livre active ») | ✅ |
| Contrôle de l'utilisateur sur les textes générés | Résultat affiché avec « Copier » ; pas d'écriture directe dans la thèse sans action utilisateur (parcours vérifié) | ✅ |
| Historique des modifications | Historique chapitre (dialog présent) ; non exécuté en profondeur | ⚠️ |
| Prévention citations fabriquées | RAG cantonné aux extraits (« UNIQUEMENT sur les extraits ») ; références générées ≠ vérifiées (badges source) | ✅ (mécanisme, échantillon vérifié) |
| Transparence limites IA | Étiquetage honnête constaté : « MeiliSearch (simulation) », « repère(s) à compléter ou vérifier », échec OCR explicite | ✅ |
| Certification originalité/plagiat | **Non prétendue** — aucun dispositif anti-plagiat ; l'app ne l'annonce pas | ✅ (alignement annonce/realité) |

**Divergences de documentation constatées** : footer « v1.2.0 » vs package.json 1.10.8 (AUD-DOC-001) ; « 27 modes » UI vs 26 dans la notice (AUD-DOC-002) ; route scaffold « Hello, world! » restée dans /api (audit 03).

**Synthèse Phase 6** : gouvernance de développement **exemplaire** pour un projet solo (specs, preuves, worklog, rollback réel). Deux trous noirs : **sauvegarde de données absente** (P1) et pipeline de distribution (CI/build desktop) non outillé (réserve récurrente).
