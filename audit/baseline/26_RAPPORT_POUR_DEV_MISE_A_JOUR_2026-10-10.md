# 26 — RAPPORT POUR LE DÉVELOPPEUR · MISE À JOUR v2 — Cycle « audit-final-v1.2 » (vagues 4-5 accomplies)

**Date :** 2026-10-10 · **Verdict en vigueur :** GO SOUS CONDITIONS — **ni mise en production, ni ouverture aux premiers utilisateurs, ni diffusion externe, tant que le propriétaire n'a pas examiné les preuves finales et donné son accord écrit.**
**Application :** ThesisFrame (Tauri + Next.js 16 App Router + TypeScript + Prisma/SQLite) · 99 routes API (recompte exact, doc 23 §1) · 30 modèles Prisma · suite de tests **1 658/1 658 verts** · lint **0 erreur / 247 warnings** (baseline exacte).
**Remplace, pour la conduite du travail :** `22_RAPPORT_POUR_DEV_2026-10-10.md` (conservé pour traçabilité — il décrit l'état antérieur, candidat `fb60ae1` ; le candidat a bougé). Documents canoniques : `BASELINE_AUDIT_REPORT_v1.2.md` (finalisée vague 5), registre `09_FINDINGS_REGISTER.md`.

---

## 0. Repères d'état (à la date de ce rapport — vérifiés sur le dépôt)

| Élément | Valeur | Source / preuve |
|---|---|---|
| **Candidat applicatif figé** | **`7dff2c6`** (hash complet `7dff2c6c98f8be59edb64b34f8a1eb021745a435`) — tag **`candidat-app-audit-v1.2`** — remplace `fb60ae1` (base + fix A1C1-02 : 1 ligne `tsconfig.json` exclude `audit`, zéro impact runtime) | `git tag -l` + doc 24 §0 |
| Tag documentaire | `candidat-docs-audit-v1.2` → `24415b7` (vague 4) ; commits docs suivants : `1381350` (preuves v4-gp\*) et `e35a295` (vague 5) | `git log` |
| `origin/main` | `f4ca696` — **local en avance de 6 commits + 2 tags** (liste exacte §4) | `git rev-parse origin/main` |
| C1 web formel | **SUCCÈS sur `7dff2c6`** : build production + smoke standalone 7/7 (GET / 200, `/api/thesis` 200, `/api/references` 200) | `evidence/c1-build-web.json` |
| 7 golden paths | **7/7 validés en UI réelle sur `7dff2c6`** (GP-1 persistance, GP-2 garde bouton, GP-3 201+Annuler 0 DELETE+Confirmer, GP-4 clic direct stream 200, GP-5 RAG ancré, GP-6 HAL 135, GP-7 DOCX Word 2007+) | captures `evidence/v4r-*` + `evidence/vague4-candidat-7dff2c6.json` |
| TNR / lint sur candidat | **1 658/1 658 verts · lint 0 erreur / 247 warnings** | vague 4, `evidence/vague4-candidat-7dff2c6.json` |
| Vues | **47/47 statuées : 44 validées en UI réelle + 3 bloquées extérieur** (36 APInex, 44 Traducteur, 45 limitation réseau) | `reserved-views-revalidation.json` |
| Anomalies | **0 P1 / 0 P2 ouverte** · ~20 P3/P4 non bloquantes · **1 nouvelle P3 signalée vague 4 : A1V4-01** (auto-save inerte sans onglet cliqué — contournement documenté, proposition de correctif 1-2 lignes en attente d'arbitrage) | registre 09 |
| Base réelle `db/custom.db` | **Intacte** — integrity ok, 0 violation FK, 1 thèse / 7 chapitres / 4 références · résidu `INITIAL_*` **intouché** · `prisma/schema.prisma` **non modifié** | `resv-db-final-state.json` |
| Empreinte arbre de référence (C2) | `git archive --format=tar 7dff2c6 \| sha256sum` → **`8ae37eda…87e75e`** | doc 24 §0 |

---

## 1. Réponse à la 3ᵉ décision du propriétaire (7 points) — état d'exécution

| # | Directive | Réponse apportée | Statut |
|---|---|---|---|
| 1 | **Doc 21 — migration réelle : GO SUSPENDU** jusqu'à clarification écrite du périmètre réel (8 consommateurs, risques inter-thèses, cycle de complétion). Option B retenue pour les tests d'isolation (sans valeur d'autorisation). Interdiction : aucune modification `db/custom.db` ni `prisma/schema.prisma` avant GO écrit | **Document 25 livré** (`25_CLARIFICATION_MIGRATION_PERIMETRE_ISOLATION_2026-10-10.md`) : périmètre exact (la migration rattache les 4 refs au niveau données, ne change rien aux 8 consommateurs) · comportement post-migration consommateur par consommateur (§2) · risques R1-R5 factuels — **aucun ne peut se matérialiser tant qu'une seule thèse existe** · cycle applicatif P1-P4 (2-3 j) pour achever l'isolation · checklist de décision §5. Option B enregistrée. **Aucune écriture DB, aucun amendement de schéma commité** | ✅ clarification livrée — **ATTENTE GO écrit** |
| 2 | **Doc 19 — résidu `INITIAL_*` : conservé**, aucune suppression autorisée | Résidu intouché ; scripts delete/restore prêts **non exécutés** ; registre 09 à jour (« CONSERVÉ par décision ») | ✅ conforme — statu quo |
| 3 | **Doc 23 — AUD-SEC-004 : présenter options A/B/C** (risques, charge, couverture réelle, conséquences GO). Traitement complet privilégié si périmètre maîtrisé ; sinon plan priorisé + risques résiduels justifiés. **Aucune option acceptée avant décision écrite** | **Options A/B/C présentées** (doc 23 §6 : A = justification acceptée, plan différé v1.3 · B = lot 1 destructives 0,5-1 j · C = complet 2-3 j) + recompte exact 41/99 routes sans zod + modèle de menace honnête (loopback only, exploitabilité non démontrée) + **6 points de décision D1-D6** listés | ✅ présenté — **ATTENTE DÉCISION ÉCRITE (D1-D6)** |
| 4 | **Doc 13 §7 — APINex/BFG : aucune purge ni force-push** avant confirmation de révocation + validation plan BFG + coordination fenêtre. Nouvelle clé par canal sécurisé | 0 exécution, 0 force-push ; audit non destructif consigné (`evidence/a5-git-audit.json`) ; plan exécutable prêt ; `.env` désuivi | 🟡 figé — **3 prérequis en attente** |
| 5 | **Doc 24 — C2 Windows : checklist complète** (prérequis, résultats attendus, PASS/FAIL, preuves à retourner). Le propriétaire exécutera lui-même build + smoke sur **`7dff2c6` exactement** | **Check-list complète livrée** (`24_C2_WINDOWS_CHECKLIST_PREPAREE.md`) : prérequis machine 1.1-1.10 · pré-contrôles checkout/identité/drift DB §2 · critères PASS/FAIL · 8 preuves à retourner (dont gabarit `c2-build-windows.json`) · la check-list vague 4 (préparée sur `fb60ae1`) est **obsolète, ne pas utiliser** | ✅ prête — **exécution propriétaire** |
| 6 | **Push GitHub : liste exacte des commits + tags en attente**, vérifiés vs `origin/main`, push normal uniquement | Liste vérifiée vs `origin/main = f4ca696` — **mise à jour : 6 commits + 2 tags** (le commit vague 5 `e35a295` lui-même s'ajoute aux 5 annoncés) — détail §4. **PUSH BLOQUÉ : identifiants absents** (`.gh-askpass.sh` disparu au rollback ; `git ls-remote` exige auth). Push normal `git push origin main --tags` prêt, **jamais de force-push ni réécriture** | 🟡 prêt — **bloqué identifiants** |
| 7 | **Clôture finale : base intacte**, rapport v1.2 + registre distinguant contrôles exécutés / preuves disponibles / limitations externes / risques ouverts | **v1.2 finalisée** (§3-bis vague 4, §3-ter vague 5, critères 4/6/9/11 actualisés, repères commits app/docs distingués) · registre 09 à jour (A1C1-02 close, A1V4-01 ouverte P3 signalée, AUD-SEC-004 « options présentées, aucune acceptée », INITIAL_* CONSERVÉ) · base réelle en l'état | ✅ fait — clôture en attente des décisions |

**Bilan exécution : tout le non destructif autorisé est accompli (vagues 4 et 5 clôturées). Le calendrier passe désormais par 4 décisions/actes propriétaire (§2).**

---

## 2. Décisions et actes en attente du PROPRIÉTAIRE (seule la décision débloque)

| # | Objet | Support | Ce qui débloque |
|---|---|---|---|
| ① | **GO écrit migration réelle** (doc 21) + choix fenêtre unique ou deux fenêtres pour le cycle applicatif | doc 25 (clarification) + doc 21 | Migration étapes 0-8 + éventuel cycle P1-P4 |
| ② | **Autorisation distincte du cycle applicatif d'isolation** (levée red line code, périmètre `references` uniquement) — peut être combinée à ① en fenêtre unique | doc 25 §4 | Cycle P1-P4 (2-3 j) : API `thesisId` obligatoire, UI scoppée, 12-16 tests d'isolation (preuve option B), revalidation 2 thèses |
| ③ | **Décision AUD-SEC-004 : D1 (option A/B/C) + D4 (origine locale) + D5 (raw SQL GET)** — et si B/C : D3 (levée red line code + refigeage candidat + nouveau tag) | doc 23 §6 | Option A → GO possible avec résiduel documenté · Option B → +~1 j · Option C → +~3 j |
| ④ | **C2 Windows exécuté par le propriétaire** sur sa machine, candidat `7dff2c6` | doc 24 | 8 preuves à retourner → dernier critère GO |
| ⑤ | **Rétablissement des identifiants GitHub** dans l'environnement sécurisé (ou push par le propriétaire) | §4 ci-dessous | Push normal des 6 commits + 2 tags |
| ⑥ | **BFG : confirmation révocation clé APINex + validation plan + fenêtre coordonnée** | doc 13 §7 | Purge d'historique (purge + force-push **seulement** à ce moment, jamais avant) |

---

## 3. Ce que le développeur doit faire maintenant (priorisé)

### Fil A — À faire sans attendre (autorisé, non destructif)
- **P1 · Rien à modifier sur le candidat.** Le candidat `7dff2c6` est figé, taggé et validé (C1 + 7 GP + TNR + lint). **Ne rien commiter dessus** : toute correction future (A1V4-01, AUD-SEC-004 options B/C, cycle P1-P4) exige au préalable une décision écrite du propriétaire et entraînera un refigeage + nouveau tag (règle D3 doc 23).
- **P2 · Accompagner le C2 Windows du propriétaire** : répondre aux questions d'exécution du doc 24, vérifier à réception les 8 preuves retournées (gabarit `c2-build-windows.json`, empreinte arbre, smoke CSP durcie), consigner dans le registre.
- **P3 · Préparer le push (sans l'exécuter)** : vérifier quotidiennement que l'arbre reste propre et que la liste §4 n'a pas bougé ; dès rétablissement des identifiants : **`git push origin main --tags` uniquement** — ni `--force`, ni `--force-with-lease`, aucun rebase/amend des commits en attente. Si l'arbre a divergé entre-temps : STOP + signalement, jamais de réécriture.
- **P4 · Préparer les exécutions conditionnelles** (sans exécuter) : plan de migration doc 21 (scripts éprouvés réutilisables, `audit/baseline/tools/rehearsal-refs/`), lot 1 AUD-SEC-004 (doc 23 §5), cycle P1-P4 (doc 25 §4) — pour que chaque GO écrit se traduise par une exécution le jour même de la fenêtre coordonnée.
- **P5 · Surveiller A1V4-01 (P3)** : auto-save inerte sans onglet cliqué — correctif proposé 1-2 lignes + test, **en attente d'arbitrage propriétaire** ; contournement documenté entre-temps (cliquer l'onglet avant de saisir).

### Fil B — BLOQUÉ : n'exécuter QUE sur GO/autorisation écrite spécifique
- **P6 · Migration réelle** (`db/custom.db`) + tout amendement `prisma/schema.prisma` — interdits tant que ① pas accordé.
- **P7 · Toute modification de code** (AUD-SEC-004 B/C, A1V4-01, cycle applicatif) — interdite tant que la red line n'est pas levée pour le périmètre (③/②).
- **P8 · Suppression `INITIAL_*`** — interdite (décision point 2 : conservé).
- **P9 · BFG / history rewrite / force-push** — interdits tant que les 3 prérequis ⑥ ne sont pas confirmés.

---

## 4. Push GitHub — liste exacte vérifiée (à jour de ce rapport)

**Blocage actuel :** identifiants absents de l'environnement (`.gh-askpass.sh` disparu au rollback ; `git ls-remote` exige une authentification). Le push normal est prêt, sans réécriture.

**Liste vérifiée `git log origin/main..main` (origin/main = `f4ca696`) — 6 commits :**

| # | Commit | Nature |
|---|---|---|
| 1 | `d17488a` | Marqueur d'environnement (automatique, sans code ni doc) |
| 2 | `7dff2c6` | **Applicatif** — fix A1C1-02 (tsconfig exclude audit, 1 ligne) |
| 3 | `24415b7` | **Docs** — vague 4 (C1 formel, 7 GP, TNR, registre, doc 24 pré-remplie) |
| 4 | `1381350` | **Docs** — preuves captures vague 4 (v4-gp\*) |
| 5 | `af98588` | Marqueur d'environnement (automatique, sans code ni doc) |
| 6 | `e35a295` | **Docs** — vague 5 (docs 23/24/25, registre, v1.2 finalisée) |

**2 tags en attente :** `candidat-app-audit-v1.2` → `7dff2c6` · `candidat-docs-audit-v1.2` → `24415b7` (les tags `v1.10.7` / `v1.10.8` sont déjà d'anciennes versions distantes).

**⚠️ Correction de consignation :** le rapport v1.2 vague 5 annonçait « 5 commits » (3 de contenu + 2 marqueurs) — c'était exact au moment de la rédaction ; le commit vague 5 `e35a295` lui-même porte la liste à **6 commits (4 de contenu + 2 marqueurs)**. La liste ci-dessus, vérifiée par `git log origin/main..main`, fait foi. **Commande unique autorisée dès rétablissement : `git push origin main --tags`.**

---

## 5. Red lines (rappel impératif — inchangées et renforcées par la 3ᵉ décision)

1. **Interdits absolus avant l'accord écrit du propriétaire sur les preuves finales :** mise en production, ouverture aux premiers utilisateurs, toute diffusion.
2. **Interdits sans GO/autorisation écrite spécifique :** migration réelle sur `db/custom.db` **et tout amendement de `prisma/schema.prisma`** (docs 21/25) · suppression `INITIAL_*` (doc 19 — conservé par décision) · exécution BFG / history rewrite / **force-push** (doc 13 §7) · toute modification de code (red line cycle en vigueur).
3. **Fichiers rouges ne pas toucher :** `db/custom.db` (skip-worktree verrouillé), `db/urbanisme-test.db`, `.env`, l'ensemble `audit/baseline/evidence/` (preuves), `audit/baseline/evidence/backups/`.
4. **Candidat figé :** aucune écriture sur `7dff2c6` — corrections futures = nouveau commit + refigeage + nouveau tag après décision.
5. **État propriétaire préservé** : tests uniquement sur thèses jetables nettoyées via l'UI, preuve diff DB vide avant/après (l'option B de la migration exclut toute écriture de test sur la base réelle).
6. Phase actuelle = **clôture et contrôle** : pas de refonte, pas de fonctionnalité nouvelle.
7. **Signaler immédiatement** tout écart, perte de données, exposition de secret ou régression bloquante.

---

## 6. Livrables attendus en retour du développeur

1. **Réception C2 Windows** : vérification des 8 preuves propriétaire (gabarit doc 24 rempli) + consignation registre.
2. **Push exécuté** dès rétablissement des identifiants : sortie de `git push origin main --tags` consignée, vérification `git log origin/main..main` vide ensuite — **sans force-push**.
3. **Si GO migration (①/②)** : journal d'attribution, rapport d'ambiguïté (attendu 4/0/0), preuves SHA doubles, verdict PASS `consistency-check`, captures UI post-migration + preuve isolation 16/16 ou équivalent option B (tests vitest P3).
4. **Si décision AUD-SEC-004 B/C (③)** : lot traité selon doc 23 §5, critère de fin (0 route sans zod sur le lot, tests de schémas, TNR + 7 GP rejoués), **refigeage candidat + nouveau tag** exigés.
5. **Si GO BFG (⑥)** : résultats post-purge du doc 13 + nouvelle clé livrée **par canal sécurisé uniquement**.
6. **Après chaque vague** : registre 09 + v1.2 mis à jour (contrôles exécutés / preuves / limitations externes / risques ouverts).

---

## 7. Annexes — références clés (état vague 5)

**Documents de décision :** `25_CLARIFICATION_MIGRATION_PERIMETRE_ISOLATION_2026-10-10.md` (point 1) · `23_AUD_SEC_004_DOSSIER_JUSTIFICATION.md` (point 3, options A/B/C + D1-D6) · `24_C2_WINDOWS_CHECKLIST_PREPAREE.md` (point 5 — version exécutable) · `21_PLAN_EXECUTION_FINAL_MIGRATION_REELLE.md` · `19_RESIDU_DOCTORALTOOLBOX.md` · `13_PURGE_GIT_PLAN.md` §7.
**Documents de preuve :** `BASELINE_AUDIT_REPORT_v1.2.md` (finalisée) · `09_FINDINGS_REGISTER.md` · `18_REPETITION_GENERALE_MIGRATION_REFS.md` · `20_RAPPORT_CYCLE_CORRECTIFS_2026-10-10.md` · `22_RAPPORT_POUR_DEV_2026-10-10.md` (v1, antérieure).
**Preuves majeures (`audit/baseline/evidence/`) :** `c1-build-web.json` (C1 sur candidat) · `vague4-candidat-7dff2c6.json` + 11 captures `v4r-*` (GP sur candidat) · `reserved-views-revalidation.json` + 34 captures `resv-*` · `resv-db-final-state.json` · `rehearsal-refs.json` (répétition migration 16/16) · `isolation-multitheses.json` · `isolation-fix.json` + captures `isofix-*` · `residu-dryrun-20261010-165230.txt` · `a5-git-audit.json`.
**Outils migration éprouvés (réutilisables tels quels) :** `audit/baseline/tools/rehearsal-refs/` (export, inventaire, migration, consistency-check, isolation-tests, inverse-migration).
