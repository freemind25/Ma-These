# 22 — RAPPORT POUR LE DÉVELOPPEUR · Cycle « audit-final-v1.2 » — Étape de clôture et de contrôle

**Date :** 2026-10-10 · **Verdict en vigueur :** GO SOUS CONDITIONS — **ni mise en production, ni ouverture aux premiers utilisateurs, ni diffusion, tant que le propriétaire n'a pas examiné les preuves finales et donné son accord écrit.**
**Application :** ThesisFrame (Tauri + Next.js 16 App Router + TypeScript + Prisma/SQLite) · 98 routes API · 30 modèles Prisma · suite de tests 1 658 verts.

Ce document fait suite à `16_SYNTHESE_ETAPE_POUR_DEV.md` et intègre : la **décision du propriétaire du 2026-10-10** (6 points), la réponse apportée (cycle T6/T7/T8), et **la liste exacte de ce que le développeur doit faire maintenant**. Les documents canoniques restent `BASELINE_AUDIT_REPORT_v1.2.md` (itératif), la v1.0 (immuable), la v1.1 (historique) et le registre `09_FINDINGS_REGISTER.md`.

---

## 0. Repères d'état (à la date de ce rapport)

| Élément | Valeur | Source / preuve |
|---|---|---|
| Dernier commit **applicatif** (code) | `fb60ae1` — fix A1C1-01 (P2 null-safety build web) | `git log` |
| Dernier commit **documentaire** | `78812c6` — clôture T6/T7/T8 (vues réservées, dry-run, doc 21) | `git log` |
| `origin/main` | `78812c6` | `git rev-parse origin/main` |
| HEAD local | `500c6f6` — **marqueur d'environnement** (archive dev.log, sans code ni doc), non poussé | `git log` |
| Tests / lint | **1 658/1 658 verts** · lint **0 erreur / 247 warnings** (baseline exacte) | T7-c, cycle T6/T7/T8 |
| Vues | **47/47 statuées : 44 validées en UI réelle + 3 bloquées extérieur** (36, 44, 45) | `reserved-views-revalidation.json` + registre |
| Anomalies | **0 P1 / 0 P2 ouverte** · ~20 P3/P4 non bloquantes · AUD-SEC-004 (P3) à traiter **ou justifier** avant GO (règle 6.4) | registre 09 |
| Base réelle `db/custom.db` | **Intacte, skip-worktree verrouillé (S)** · integrity ok, 0 violation FK, 1 thèse / 7 chapitres / 4 références · résidu INITIAL_* **intouché** | `resv-db-final-state.json` |
| Décisions en attente du **propriétaire** | ① GO écrit sur doc 21 (migration) · ② autorisation suppression INITIAL_* (doc 19) · ③ BFG : révocation confirmée + plan approuvé + fenêtre coordonnée (doc 13 §7) | docs 21 / 19 / 13 |

---

## 1. La décision du propriétaire (2026-10-10) et la réponse apportée

| # | Directive du propriétaire | Réponse apportée | Statut |
|---|---|---|---|
| 1 | Isolation & correctifs P2 : acceptés sur preuves, sous réserve de non-régression **rejouée sur le commit final** | P1 AUD-ISO-001 close + 8 P2 corrigées (`6f853ac`, preuves `isolation-fix.json`, 25 captures) ; A1C1-01 découverte + corrigée (`fb60ae1`) ; TNR verte maintenue | ✅ fait · **rejeu exigé sur candidat final** (§4, P1/P3) |
| 2 | Migration réelle des références : **conditionnelle** — livrer d'abord le plan d'exécution final (les « 5 exigences » = séquence exacte, contrôle de sauvegarde immédiat, vérifications attribuées/ambiguës/sans-thèse, arrêt/rollback, contrôles post dont isolation 2 thèses) et **n'exécuter qu'après GO écrit** | **Document 21** = `21_PLAN_EXECUTION_FINAL_MIGRATION_REELLE.md` (les 5 exigences sont couvertes §1→§5 + checklist §6) ; répétition générale sur copie byte-identique : isolation 16/16, double rollback démontré (`18_REPETITION_GENERALE_MIGRATION_REFS.md`, `evidence/rehearsal-refs.json`) | 🟡 **plan livré — ATTENTE GO écrit du propriétaire ; toute exécution est interdite avant** |
| 3 | Six vues réservées : revalider avec statuts, contrôles réellement exécutés et preuves — **« réservé » ≠ « validé »** | **Revalidation UI réelle terminée** (agent-browser, clics réels) : 16/21/24/43/47 **VALIDÉES**, 45 **VALIDÉE AVEC LIMITATION EXTERNE** ; preuve machine + 34 captures + état DB ligne-à-ligne intact | ✅ fait (détail §2) |
| 4 | Résidu DoctoralToolbox `INITIAL_*` : **ne pas supprimer** ; fournir le dry-run + la preuve que le flux ciblé n'affecte aucune donnée utilisateur | **Dry-run exécuté** : gardes PASS (template pur, octet pour octet), SHA base **identique avant/après** (zéro écriture) ; doc 19 : résidu template 6/6, scripts delete/restore prêts **non exécutés** | ✅ fait · **suppression INTERDITE sans autorisation explicite** |
| 5 | Git / APINex : **aucun history rewrite ni force-push** tant que révocation non confirmée, plan BFG non approuvé, fenêtre non coordonnée | Plan BFG exécutable prêt (`13_PURGE_GIT_PLAN.md` §7) ; **0 exécution, 0 force-push** ; audit non destructif consigné (`evidence/a5-git-audit.json`) ; `.env` désuivi (`6158f4e`) | 🟡 prêt — 3 conditions propriétaire en attente |
| 6 | Prérequis du GO final (liste de contrôle) | En cours : pré-contrôle C1 web **réussi** (build production + smoke standalone, `evidence/c1-prebuild-web.json`) ; candidats identifiés et distingués (§0) ; reste C1/C2 formels sur candidat figé, rejeu GP+TNR, finalisation v1.2 | 🟡 en cours (§4) |

**Note de numérotation :** le « document 18 » désigné par le propriétaire pour le plan de migration s'est matérialisé sous le numéro **21** (le 18 ayant été attribué à la répétition générale). Correspondance : `18_REPETITION_GENERALE_MIGRATION_REFS.md` (répétition sur copie) → **`21_PLAN_EXECUTION_FINAL_MIGRATION_REELLE.md` (plan d'exécution réel à examiner)**.

---

## 2. Les six anciennes vues « réservées » — contrôles réellement exécutés (point 3 de la décision)

Preuves transverses : `evidence/reserved-views-revalidation.json` (preuve machine) · 34 captures `evidence/resv-*` · `evidence/resv-db-final-state.json` (état DB final : integrity ok, 0 FK, thèse propriétaire `cmsmyrdfs0000pa2sews4vo90` / 7 chapitres / `updatedAt 2026-08-10` intact, 4 réf., résidu intact, 58 book-skills, 27 legal-refs, 0 veille).

| Vue | Statut | Contrôles réellement exécutés | Preuves | Limite |
|---|---|---|---|---|
| **16 Références** | ✅ **VALIDÉE** | Suppression protégée par AlertDialog (« Supprimer cette référence ? ») ; **Annuler = 0 requête DELETE** ; création/édition OK ; export BibTeX réel (`.bib` archivé) | `resv-16-*` (6 captures + .bib) | — (réserve v1.0 levée par confirmation C-3) |
| **21 Recherche plein texte** | ✅ **VALIDÉE** | Recherche réelle : 2 résultats pertinents ; opérateur NOT → 0 résultat ; parité UI ↔ API vérifiée ; filtres dates/chapitre | `resv-21-*` (4 captures) | — |
| **24 Veille académique** | ✅ **VALIDÉE** | Création de veille depuis HAL (910 thèses vues) → « suivre cette recherche » → 50 résultats stockés → `autoCheck` activé (worker 6 h, preuve log `[job-worker]`) → suppression + cascade → retour à 0 | `resv-24-*` (9 captures) | — |
| **43 Livres-compétences** | ✅ **VALIDÉE** | 22 résultats ; CRUD Bibliothèque avec `confirm()` natif ; Registre juridique (27 entrées) ; auto-évaluation : score 25→30 recalculé | `resv-43-*` (7 captures) | auto-évaluation 100 % locale (perdue au reload) — comportement documenté, non bloquant |
| **45 Bibliothèque** | ⚠️ **VALIDÉE AVEC LIMITATION EXTERNE** | Recherche réellement exécutée ; les 3 API externes (OpenLibrary / Gutendex / StandardEbooks) **inatteignables depuis l'environnement de développement** (diagnostic direct prouvé, échec propre sans crash) | `resv-45-*` (4 captures) | La complétude de recherche dépend du réseau externe — à re-tester depuis une machine avec accès Internet normal (non bloquant : lecture seule, 0 écriture DB) |
| **47 Export DOCX** | ✅ **VALIDÉE** | Export réel d'un `.docx` téléchargé ; analyse ZIP/XML : **12/12 promesses de formatage** vérifiées (styles Word Titre 1/2/3, Times New Roman, TDM, page de garde, bibliographie APA, notes de bas de page ×3…) ; garde 0 chapitre | `resv-47-*` (6 captures + .docx) | — |

**Compte global des vues : 47/47 statuées = 44 validées en UI réelle (7 v1.0 + 32 lots A1 + 5 ex-réservées) + 3 bloquées extérieur** (36 APInex : nouvelle clé requise ; 44 Traducteur : instances LibreTranslate mortes ; 45 : limitation externe ci-dessus). Aucune vue n'est plus « réservée sans contrôle ».

---

## 3. Anomalies — état du registre

- **0 P1 / 0 P2 ouverte.** P1 AUD-ISO-001 close ; 8 P2 corrigées/validées (`6f853ac`) ; A1C1-01 (P2, découverte au pré-contrôle build web) corrigée (`fb60ae1`).
- **AUD-SEC-004 (P3)** : 40 routes sans schéma zod — **à traiter ou à justifier explicitement avant GO** (règle 6.4 : aucun défaut de sécurité laissé ouvert). Plan de schématisation progressive proposé en v1.2.
- **~20 fiches P3/P4** non bloquantes (dont A1L4A-01/02/03, filtres journaux/statut explorateur, BibTeX tronqué…) — cycle à planifier.
- Résidu `INITIAL_*` : arbitrage **propriétaire** (doc 19) — le développeur n'y touche pas.

---

## 4. Ce que le développeur doit faire maintenant (priorisé)

### Fil A — À faire sans attendre (autorisé)
- **P1 · Figer le commit candidat et le consigner.** Candidat applicatif actuel : `fb60ae1` ; dernier commit documentaire : `78812c6`. Toute validation finale (C1, GP, TNR) doit porter **exactement** sur le commit candidat, avec hashes consignés. Distinction commit application / commit documents **explicite** (exigence point 6 de la décision).
- **P2 · C1 formel — build web de production sur le commit candidat** selon `14_PROCEDURE_BUILD_WEB.md` (gabarit de résultats à remplir). Le **pré-contrôle est déjà réussi** (build production SUCCÈS + smoke standalone : GET / 200, `/api/thesis` 200, `/api/references` 200 — preuve `c1-prebuild-web.json`) : le refaire **sur le candidat figé** et le consigner suffit si rien ne change.
- **P3 · Rejeu des 7 golden paths + TNR complète sur le commit candidat** (1 658/1 658 exigés) + lint 0 erreur — consigner hashes + sorties (exigence point 6).
- **P4 · Préparer C2 Windows + smoke CSP durcie** (`15_PROCEDURE_BUILD_WINDOWS.md`) : le build Windows est **propriétaire** (machine Windows du propriétaire) — le développeur fournit le paquet/pré-requis et la check-list pré-remplie ; les résultats seront rapportés séparément.
- **P5 · Registre & rapport v1.2 :** traiter ou justifier AUD-SEC-004 ; plan P3/P4 ; **mettre à jour le tableau de conformité 11 critères** avec : statuts des 6 ex-réservées (§2), critère 5 = pré-contrôle réussi, distinction commits app/docs (critère 11 « finalisé en vague 4 »).
- **P6 · Push normal uniquement** (commits conventionnels, arbre propre) — jamais de force-push.

### Fil B — BLOQUÉ : n'exécuter QUE sur GO écrit du propriétaire
- **P7 · Migration références sur la base réelle** — interdite tant que le propriétaire n'a pas **signé le doc 21** (checklist §6, choix isolation A ou B). En cas de GO : exécuter la séquence §1 exactement (fenêtre coordonnée, serveur arrêté pendant les étapes 0–7), rollback §4 prêt, livrables §6.
- **P8 · Suppression du résidu `INITIAL_*`** — interdite sans autorisation explicite ; dry-run déjà fourni (`evidence/residu-dryrun-20261010-165230.txt`, SHA identique, zéro écriture).
- **P9 · Purge git BFG** — exécution subordonnée aux **3 conditions** : révocation de la clé APINex confirmée + plan approuvé + fenêtre de coordination. Jusque-là : préparation seule, **aucun history rewrite, aucun force-push**.

---

## 5. Red lines (rappel impératif — inchangées)

1. **Interdits absolus avant l'accord écrit du propriétaire sur les preuves finales :** mise en production, ouverture aux premiers utilisateurs, toute diffusion.
2. **Interdits sans GO/autorisation écrite spécifique :** migration réelle sur `db/custom.db` (doc 21) · suppression `INITIAL_*` (doc 19) · exécution BFG / history rewrite / **force-push** (doc 13 §7).
3. **Fichiers rouges ne pas toucher :** `db/custom.db` (skip-worktree verrouillé), `.env`, `audit/baseline/evidence/backups/`, l'ensemble `audit/baseline/evidence/` (preuves).
4. **État propriétaire préservé** : toute opération de test se fait sur thèses jetables nettoyées via l'UI, avec preuve diff DB vide avant/après.
5. Phase actuelle = **clôture et contrôle** : pas de refonte, pas de fonctionnalité nouvelle.

---

## 6. Livrables attendus en retour du développeur

1. Gabarit **C1 rempli** (doc 14) avec hash du candidat + artefacts de build.
2. Check-list **C2 pré-remplie** (doc 15) pour exécution propriétaire sur Windows.
3. **Rapport de rejeu** : 7 GP + TNR (1 658/1 658) + lint 0 erreur, **sur le commit candidat**, hashes consignés.
4. **Registre 09 + v1.2 finalisés** (AUD-SEC-004 traitée/justifiée, 6 vues intégrées au tableau de conformité, distinction commits app/docs).
5. **Si GO migration** : journal d'attribution, rapport d'ambiguïté (attendu 4/0/0), preuves SHA doubles, verdict PASS `consistency-check`, captures UI post-migration + preuve isolation 16/16 (option A) ou équivalent (option B).
6. **Si GO BFG** : résultats d'opérations post-purge (vérification post-purge du doc 13) + nouvelle clé livrée **par canal sécurisé**.

---

## 7. Annexes — références clés

**Documents :** `21_PLAN_EXECUTION_FINAL_MIGRATION_REELLE.md` (à examiner — GO attendu) · `18_REPETITION_GENERALE_MIGRATION_REFS.md` · `19_RESIDU_DOCTORALTOOLBOX.md` · `20_RAPPORT_CYCLE_CORRECTIFS_2026-10-10.md` · `17_RAPPORT_FIN_DE_LOT_2026-10-10.md` · `13_PURGE_GIT_PLAN.md` §7 · `14_PROCEDURE_BUILD_WEB.md` · `15_PROCEDURE_BUILD_WINDOWS.md` · `09_FINDINGS_REGISTER.md` · `BASELINE_AUDIT_REPORT_v1.2.md`.
**Preuves majeures (`audit/baseline/evidence/`) :** `reserved-views-revalidation.json` + 34 captures `resv-*` · `resv-db-final-state.json` · `residu-dryrun-20261010-165230.txt` · `c1-prebuild-web.json` · `isolation-fix.json` (+25 captures `isofix-*`) · `rehearsal-refs.json` · `isolation-multitheses.json` · `a5-git-audit.json` · `a1-lot*.json` + ~300 captures.
**Scripts de migration éprouvés (réutilisables tels quels) :** `audit/baseline/tools/rehearsal-refs/` (7 fichiers : export, inventaire, migration, consistency-check, isolation-tests, inverse-migration).
