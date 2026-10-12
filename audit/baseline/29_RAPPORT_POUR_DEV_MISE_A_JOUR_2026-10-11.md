# 29 — RAPPORT POUR LE DÉVELOPPEUR · MISE À JOUR v3 — Cycle « audit-final-v1.2 » (vague 6 : consignes confirmées, préparations livrées)

**Date :** 2026-10-11 · **Verdict en vigueur :** GO SOUS CONDITIONS — **ni mise en production, ni ouverture aux premiers utilisateurs, ni diffusion externe, tant que le propriétaire n'a pas examiné les preuves finales et donné son accord écrit.**
**Application :** ThesisFrame (Tauri + Next.js 16 App Router + TypeScript + Prisma/SQLite) · 99 routes API · 30 modèles Prisma · suite **1 658/1 658 verts** · lint **0 erreur / 247 warnings**.
**Remplace, pour la conduite du travail :** le doc 26 (v2 — conservé pour traçabilité). Documents canoniques : `BASELINE_AUDIT_REPORT_v1.2.md`, registre `09_FINDINGS_REGISTER.md`, et les nouveaux supports **docs 27-28**.

---

## 0. Repères d'état (vérifiés sur le dépôt le 2026-10-11)

| Élément | Valeur | Source / preuve |
|---|---|---|
| **Candidat applicatif figé** | **`7dff2c6c98f8be59edb64b34f8a1eb021745a435`** — tag `candidat-app-audit-v1.2` (cible re-vérifiée) | `git rev-parse` |
| Validations acquises sur candidat | C1 build production SUCCÈS + smoke 7/7 · **7/7 golden paths** UI réelle · TNR 1 658/1 658 · lint 0 erreur | `evidence/c1-build-web.json`, `vague4-candidat-7dff2c6.json`, captures `v4r-*` |
| Vues | **47/47 statuées** (44 validées + 3 bloquées extérieur : 36, 44, 45) | `reserved-views-revalidation.json` |
| Anomalies | **0 P1 / 0 P2 ouverte** · ~20 P3/P4 · A1V4-01 (P3) **surveillée, contournement documenté, correctif en attente d'arbitrage** | registre 09 |
| Base réelle `db/custom.db` | **Intacte** (taille inchangée, skip-worktree verrouillé) · `prisma/schema.prisma` non modifié · résidu `INITIAL_*` intouché | contrôles du 2026-10-11 |
| `origin/main` | `f4ca696` (inchangé) — **local en avance de 8 commits + 2 tags** (liste §4) | `git rev-list --count` |
| Identifiants GitHub | **Toujours absents** — `git ls-remote` en échec d'authentification, aucun push tenté en aveugle | test du 2026-10-11 |
| Arbre de travail | **Propre** | `git status` |

---

## 1. La 4ᵉ décision du propriétaire (2026-10-11) et la réponse apportée (vague 6)

Le propriétaire a **confirmé les consignes FIL A (P1-P5 autorisés) / FIL B (P6-P9 bloqués)** et exigé : « poursuivre uniquement les tâches autorisées et présenter chaque décision bloquante séparément, avec les éléments factuels nécessaires à mon arbitrage ».

| # | Directive | Réponse apportée (vague 6) | Statut |
|---|---|---|---|
| P1 | Candidat `7dff2c6` figé — aucun commit de code, toute évolution = autorisation + nouveau commit + validation + tag | Aucune écriture sur le candidat ; aucun code modifié | ✅ conforme |
| P2 | Accompagnement C2 Windows selon **doc 24** uniquement ; vérification des 8 preuves, critères PASS/FAIL, empreinte arbre ; signalement immédiat des écarts | Accompagnement disponible — le propriétaire exécute sur sa machine ; à réception des preuves : vérification + consignation registre | 🟡 **attente exécution propriétaire** |
| P3 | Push préparé, non exécuté ; liste maintenue ; aucun force-push/rebase/amend | Liste re-vérifiée — **divergence signalée** : 2 marqueurs automatiques de session (`938510a`, `dcbc5db`) ont porté la liste à **8 commits + 2 tags** (détail §4) ; re-vérification obligatoire au moment du push | ✅ à jour — bloqué identifiants |
| P4 | Préparer sans exécuter : migration (doc 21), lot 1 AUD-SEC-004 (doc 23), cycle isolation (doc 25) | **Doc 27 livré** (`27_PREPARATIONS_CONDITIONNELLES_RUNBOOKS_2026-10-11.md`) : runbook migration (pré-vol, commandes exactes, critères d'arrêt, rollback 7b, variantes fenêtre) · design lot 1 (spécification par route des 10 routes mutantes, extraite du code) · design cycle isolation (règles API, UI, 12-16 tests = preuve option B). **Zéro exécution** | ✅ préparé |
| P5 | A1V4-01 : surveiller + documenter le contournement, **pas de correctif sans arbitrage écrit** | Défaut inchangé, ouverte P3, contournement documenté au registre ; arbitrage demandé (fiche ⑦ du doc 28) | ✅ conforme |
| FIL B | P6-P9 : migration DB / code / INITIAL_* / BFG — interdits sans GO écrit | Aucune exécution ; chaque fiche du doc 28 porte son déclencheur précis | ✅ conforme |

**Nouveautés documentaires de la vague 6 :** `27_PREPARATIONS_CONDITIONNELLES_RUNBOOKS_2026-10-11.md` (runbooks prêts, non exécutés) · `28_DOSSIER_DECISIONS_BLOQUANTES_2026-10-11.md` (7 fiches d'arbitrage séparées).

---

## 2. Les 7 décisions en attente d'arbitrage PROPRIÉTAIRE (dossier : doc 28)

Le développeur **n'agit sur aucune** de ces fiches sans réponse écrite du propriétaire :

| Fiche | Objet | Options chiffrées | Effet délai si accord |
|---|---|---|---|
| ① | GO migration réelle (docs 21+25) | A1 fenêtre unique (migration + cycle ② ensemble) / A2 migration seule / A3 suspension | demi-journée à 1 j de fenêtre |
| ② | Cycle applicatif d'isolation (P1-P4) | B1 fenêtre unique / B2 séparée / B3 différer (recommandation : **pas de 2ᵉ thèse avant ce cycle**) | 2-3 j |
| ③ | AUD-SEC-004 : D1 + D4 + D5 | C-A justification acceptée (0 j, recommandation auditeur) / C-B lot 1 (~1 j) / C-C complet (~3 j) ; D4 origine locale ; D5 raw SQL GET | 0 à 3 j |
| ④ | C2 Windows | action propriétaire (doc 24) — 8 preuves à retourner | dernier critère GO |
| ⑤ | Push GitHub | E1 identifiants rétablis → push normal / E2 push par le propriétaire / E3 différer | minutes |
| ⑥ | BFG APINex | F1 révocation confirmée → plan §7 soumis / F2 gel maintenu | indépendant du GO |
| ⑦ | A1V4-01 | G1 corriger dans prochaine vague de code (regroupable ②/③ — un seul refigeage) / G2 différer | 1-2 lignes + test |

**En l'absence de réponse sur une fiche : statu quo conservatoire pour cette fiche uniquement.**

---

## 3. Ce que le développeur fait maintenant

- **Accompagner le C2 Windows** (P2) : réponses pas-à-pas pendant l'exécution du doc 24 ; à réception, vérifier les 8 preuves (gabarit `c2-build-windows.json`, empreinte `8ae37eda…87e75e`, smoke CSP) et consigner. **Écart = ARRÊT + signalement.**
- **Maintenir l'état du push** (P3) : arbre propre, liste §4 re-vérifiée à chaque session ; au rétablissement des identifiants : **`git push origin main --tags` uniquement** — jamais de force-push, rebase ou amend ; consigner la sortie + vérification post-push (log vide vs origin).
- **Surveiller A1V4-01** (P5) : aucune correction sans arbitrage écrit (fiche ⑦).
- **Ne rien exécuter des préparations** (docs 27 A/B/C) tant que les fiches ①/②/③ n'ont pas reçu de GO écrit sur leur périmètre exact.
- **Red lines** : inchangées (§5).

---

## 4. Push GitHub — liste exacte vérifiée (à jour du 2026-10-11)

**⚠️ Divergence consignée (exigence P3 « les références n'ont pas changé »)** : les marqueurs de session automatiques s'ajoutent à la liste au fil des vagues — le contenu (commits 2-6 + tags) est **inchangé** ; seuls des marqueurs d'environnement sans code métier s'accumulent. Liste re-vérifiée et re-consignée **au moment du push**.

| # | Commit | Nature |
|---|---|---|
| 1 | `d17488a` | Marqueur d'environnement |
| 2 | `7dff2c6` | **Applicatif** — fix A1C1-02 (candidat figé) |
| 3 | `24415b7` | **Docs** vague 4 |
| 4 | `1381350` | **Docs** preuves vague 4 |
| 5 | `af98588` | Marqueur d'environnement |
| 6 | `e35a295` | **Docs** vague 5 |
| 7 | `938510a` | Marqueur d'environnement (doc 26 + worklog) |
| 8 | `dcbc5db` | Marqueur d'environnement (docs 27-28 + worklog vague 6) |

**2 tags en attente :** `candidat-app-audit-v1.2` → `7dff2c6` · `candidat-docs-audit-v1.2` → `24415b7` (cibles re-vérifiées le 2026-10-11).
**Commande unique autorisée dès rétablissement des identifiants : `git push origin main --tags`** — puis vérification `git log origin/main..main` vide, sortie consignée.

---

## 5. Red lines (inchangées — rappel impératif)

1. **Interdits absolus avant accord écrit du propriétaire sur les preuves finales** : mise en production, ouverture aux premiers utilisateurs, toute diffusion.
2. **Interdits sans GO/autorisation écrite spécifique** : migration réelle `db/custom.db` et amendement `prisma/schema.prisma` (P6) · toute modification de code (P7) · suppression/restauration `INITIAL_*` (P8) · BFG / history rewrite / **force-push** (P9).
3. **Fichiers rouges ne pas toucher** : `db/custom.db`, `db/urbanisme-test.db`, `.env`, l'ensemble `audit/baseline/evidence/` (preuves).
4. **Candidat figé** : aucune écriture sur `7dff2c6` — corrections futures = nouveau commit + revalidation + nouveau tag.
5. Tests uniquement sur thèses jetables nettoyées via l'UI, preuve diff DB vide avant/après. **Option B migration : zéro écriture de test sur la base réelle.**
6. Phase = clôture et contrôle : pas de refonte, pas de fonctionnalité nouvelle.
7. **Signaler immédiatement** tout écart, perte de données, exposition de secret ou régression bloquante.

---

## 6. Livrables attendus en retour du développeur

1. **Réception C2 Windows** : vérification des 8 preuves (gabarit doc 24) + consignation registre.
2. **Push exécuté** (dès E1/E2) : sortie consignée + vérification post-push, liste §4 soldée.
3. **Si GO ①/②/③** : exécution selon les runbooks doc 27 (partie A/B/C respective) + livrables propres à chaque fiche (doc 28) + refigeage candidat si code modifié.
4. **Après chaque vague** : registre 09 + v1.2 mis à jour ; divergences signalées immédiatement.

---

## 7. Annexes — références clés (état vague 6)

**Décisions & préparations :** `28_DOSSIER_DECISIONS_BLOQUANTES_2026-10-11.md` (7 fiches) · `27_PREPARATIONS_CONDITIONNELLES_RUNBOOKS_2026-10-11.md` (runbooks A/B/C) · `24_C2_WINDOWS_CHECKLIST_PREPAREE.md` (exécution propriétaire) · `21_PLAN_EXECUTION_FINAL_MIGRATION_REELLE.md` + `25_CLARIFICATION_MIGRATION_PERIMETRE_ISOLATION_2026-10-10.md` · `23_AUD_SEC_004_DOSSIER_JUSTIFICATION.md` · `19_RESIDU_DOCTORALTOOLBOX.md` · `13_PURGE_GIT_PLAN.md` §7.
**Preuves & registre :** `BASELINE_AUDIT_REPORT_v1.2.md` · `09_FINDINGS_REGISTER.md` · `evidence/` : `c1-build-web.json`, `vague4-candidat-7dff2c6.json` + `v4r-*`, `reserved-views-revalidation.json` + `resv-*`, `resv-db-final-state.json`, `rehearsal-refs.json`, `isolation-multitheses.json`, `a5-git-audit.json`.
**Scripts migration éprouvés :** `audit/baseline/tools/rehearsal-refs/` (7 fichiers — utilisés tels quels à l'étape A.2 du runbook).
**Historique des rapports Dev :** doc 16 (synthèse étape) → doc 22 (v1, antérieur) → doc 26 (v2, antérieur) → **le présent doc 29 (v3, en vigueur)**.
