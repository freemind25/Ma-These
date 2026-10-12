# 55 — CHECKLIST DE MISE EN PRODUCTION « MA THÈSE » — CRITÈRES DE VALIDATION ET CONDITIONS GO / NO-GO

**Cycle :** audit-final-v1.2 · vague 35 (préparation documentaire autorisée pendant l'attente opérateur — zéro opération technique)
**Date :** 2026-10-12 · **Verdict en vigueur : GO SOUS CONDITIONS** — ni mise en production, ni ouverture aux premiers utilisateurs, ni diffusion (BASELINE_AUDIT_REPORT v1.2). Le présent document prépare la levée de ces conditions ; il ne les lève pas.
**Fondements :** rapport v1.2 (tableau 11 critères) · docs 24/39 (C2) · 28/31/34/42/44 (décisions, fenêtre commune, GO B, S1) · 46/50/52 (R2) · 54 (transmission opérateur).

---

## §1 — Préconditions verrouillées (identité de ce qui sera mis en production)

| # | Précondition | Valeur exigée | Statut |
|---|---|---|---|
| P-1 | Lignée Git candidate présente dans le magasin | `7dff2c6c98f8be59edb64b34f8a1eb021745a435` (tag `candidat-app-audit-v1.2`) + `24415b7f19ed89b44201e436f3026680eddd84ad` (tag `candidat-docs-audit-v1.2`) — ou, si Option B, nouveau candidat refigé et tagué après reconstruction documentée | 🔴 ABSENTE (restauration plateforme en attente — dossier 54 transmis) |
| P-2 | Empreinte arbre du candidat | `8ae37edab22fea51f6a4a13a16cd21a8f78c3d55f81c61851e343d43f987e75e` (candidat d'origine) — re-calculée conforme au moment du GO | 🔴 non calculable (P-1) |
| P-3 | Base réelle `db/custom.db` | SHA-256 `756c01587cc54a25db37c2f099266506aa01ffcff440870a61b43e441b38126d` · 265 330 688 o — re-mesurée au GO | 🟢 conforme (mesures 15:04-15:07 UTC vague 34) |
| P-4 | Base de test `db/urbanisme-test.db` post-R2 | SHA-256 `6b72e1dc…65fb8` · 622 592 o · drift 0 (30 tables) | 🟢 conforme |
| P-5 | Finalisation R2 (doc 46 §5bis étapes 6-12) | commit base de test + tags `candidat-app-audit-v1.2-R2` / `candidat-docs-audit-v1.2-R2` + empreinte archive consignée | 🔴 bloquée par P-1 |
| P-6 | Arbre propre + serveurs arrêtés au moment de chaque opération | `git status --porcelain` vide · `curl localhost:3000` échoue | à re-vérifier à chaque étape |
| P-7 | Sauvegarde bloquante avant toute écriture | copie horodatée + double SHA (doc 44 §2) | procédure prête (doc 44) |

## §2 — Les 11 critères de sortie vers le GO final (état au 2026-10-12)

| # | Critère | Statut | Preuve | Ce qui manque |
|---|---|---|---|---|
| 1 | 47 vues : statuts + preuves | ✅ 47/47 (44 validées UI réelle + 3 bloquées extérieur : 36 APInex clé requise, 44 LibreTranslate services morts, 45 limitation externe) | `reserved-views-revalidation.json` + `a1-lot*.json` + ~300 captures | clé APInex si la vue 36 doit être validée à l'identique |
| 2 | Actions destructives testées UI | ✅ 16/16 | `a2-lot1.json` + `a2-lot2.json` + 37 captures | — |
| 3 | Restauration `upload/` démontrée | ✅ | `a3-upload-restore.json` + `docs/SAUVEGARDE-RESTAURATION.md` §6 | — |
| 4 | Références par thèse (migration + cycle isolation) | 🟡 préparé, non autorisé | doc 44 (S1 prêt) · docs 25/27/34 (fenêtre commune S1-S4 mode A + B-strict) | **GO écrit spécifique** (GO A) + exécution S1-S4 + PA1-PA4 |
| 5 | Build web production + parcours critiques | ✅ C1 SUCCÈS sur `7dff2c6` | `c1-build-web.json` + smoke standalone 7/7 (port 3100, base jetable) | re-jeu sur le candidat final post-R2 (P-5) |
| 6 | Build Windows + smoke CSP durcie | 🔴 verdict `PROBLEMES` (doc 43) | doc 43 §2 : 6/8 preuves non reçues + drift `urbanisme-test.db` exit 2 (drift **désormais résolu par R2**, mais le contrôle devra porter sur le candidat final) | exécution propriétaire doc 24 sur le candidat post-R2 + 8 preuves (doc 39) |
| 7 | Purge git + secrets sécurisés | 🟡 plan prêt, 3 conditions ouvertes | `13_PURGE_GIT_PLAN.md` §7 · doc 40 | confirmation révocation APINex + approbation plan BFG + fenêtre coordonnée |
| 8 | Suite + TNR verts | ✅ 1 658/1 658 + lint 0 erreur sur `7dff2c6` | `vague4-candidat-7dff2c6.json` | re-jeu sur le candidat final (~1 670 si lot 1 exécuté) |
| 9 | Anomalies recensées, risques justifiés | 🟡 0 P1/P2 ouverte · ~20 P3/P4 non bloquantes | registre 09 | AUD-SEC-004 lot 1 : décision D1=C-B formalisée, **exécution bloquée** (levée P7 + GO B — doc 42) |
| 10 | Incohérences corrigées | ✅ | `reconciliation_A4` (7 GP canoniques) | — |
| 11 | Rapport v1.2 + recommandation finale | ✅ rapport finalisé | ce tableau + BASELINE_AUDIT_REPORT_v1.2 | recommandation motivée finale après C2 |

## §3 — Critères GO / NO-GO de la mise en production

**GO MEP (accord écrit final du propriétaire) exigé uniquement si TOUTES les conditions suivantes sont réunies :**

1. **G-1** — Candidat final identifié sans ambiguïté (P-1 à P-5 vertes ; empreinte re-calculée conforme, consignée) ;
2. **G-2** — Critères 1-3, 5, 8, 10 revalidés sur le candidat final (TNR + lint + GP + C1 smoke) ;
3. **G-3** — Critère 4 clos : fenêtre commune S1-S4 exécutée, verdict PASS M-7, paquet de preuves PA4 complet (doc 32 §7) ;
4. **G-4** — Critère 6 clos : verdict C2 = `DESKTOP_WINDOWS_VALIDE` (8/8 preuves vérifiées selon doc 39, aucun écart non résolu) ;
5. **G-5** — Critère 7 clos OU explicitement différé par écrit : révocation APINex confirmée, ou report formel motivé (le BFG ne bloque pas l'exécution locale, mais bloque toute publication de l'historique) ;
6. **G-6** — Critère 9 clos : lot 1 exécuté (GO B) ou report formel motivé par écrit ;
7. **G-7** — D4 : réévaluation du vecteur d'origine locale faite (obligatoire **avant toute diffusion large** — condition inscrite au registre 09) ;
8. **G-8** — Versions publiées : les releases GitHub `v1.10.7`/`v1.10.8` (pré-audit, sans les correctifs `6f853ac`/`7dff2c6`) sont explicitement remplacées ou signalées obsolètes ; l'installeur MEP est construit depuis le candidat final (version bumpée, ex. v1.10.9) ;
9. **G-9** — Red lines globales respectées jusqu'au GO (aucune diffusion, aucune base modifiée hors GO écrits).

**NO-GO immédiat (arrêt + signalement) si l'un quelconque :**

- **N-1** — divergence d'empreinte (arbre, base, archive) à tout contrôle ;
- **N-2** — tout écart C2 non résolu (règle doc 39 §4 : tout écart → ARRÊT, aucun succès déclaré avant vérification complète) ;
- **N-3** — tout `integrity_check ≠ ok`, violation FK, divergence de comptage DB ;
- **N-4** — tout test en échec ou preuve manquante dans les paquets PA1-PA4 / 8 preuves C2 ;
- **N-5** — toute modification du candidat ou des bases hors GO écrits (le silence ne vaut jamais acceptation) ;
- **N-6** — révélation que la lignée récupérée ne correspond pas aux identifiants attendus (protocole rapport 52 §5).

## §4 — Conditions d'interdiction persistantes (jusqu'au GO écrit final)

- Aucune mise en production, aucun premier utilisateur, aucune diffusion/distribution ;
- Aucune modification de `db/custom.db` ou `db/urbanisme-test.db` hors GO écrits (S1, R2) ;
- Aucune modification de code hors lot 1 (GO B) et cycle d'isolation (GO A) ;
- Aucun push/BFG/force-push hors E1/E2 re-vérifié et conditions §7 doc 13 ;
- Aucune création d'une 2ᵉ thèse réelle avant validation du cycle d'isolation (orientation ②) ;
- Aucune utilisation de l'app entre S1 et l'accord de clôture de la fenêtre commune (doc 34 §1).

## §5 — Rappel des actifs de sécurité déjà acquis

Sauvegarde automatique quotidienne `db/custom.db` + rotation 7 j + miroir hors arbre (`src/lib/backup.ts`, restauration prouvée `c1-restore-test.json`) · restauration `upload/` prouvée (A3) · archives de secours A/B/C duplex vérifiées (rapport 52 §2) · CSP production + capabilities minimales (`core:default`) au candidat (doc 43 §3.4) · rate-limiting IA + chaîne upload auditée (doc 31 §3).

---
*Checklist de préparation — ne constitue ni un GO ni une exécution. Toute levée de condition exige une autorisation écrite du propriétaire.*
