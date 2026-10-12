# 37 — RAPPORT POUR LE DÉVELOPPEUR · MISE À JOUR v4 — Cycle « audit-final-v1.2 » (vagues 7-14 : décisions 5ᵉ-7ᵉ, formalisation §9, traçabilité D6, vérifications propriétaire)

**Date :** 2026-10-11 · **Verdict en vigueur :** GO SOUS CONDITIONS — **ni mise en production, ni ouverture aux premiers utilisateurs, ni diffusion externe, tant que le propriétaire n'a pas examiné les preuves finales et donné son accord écrit.**
**Application :** ThesisFrame (Tauri + Next.js 16 App Router + TypeScript + Prisma/SQLite) · 99 routes API · 30 modèles Prisma · suite **1 658/1 658 verts** · lint **0 erreur / 247 warnings**.
**Remplace, pour la conduite du travail :** le doc 29 (v3 — conservé pour traçabilité). Documents canoniques : `BASELINE_AUDIT_REPORT_v1.2.md`, registre `09_FINDINGS_REGISTER.md`, supports **docs 30-36**.
**Ce rapport est descriptif : il ne contient AUCUNE autorisation d'exécution.** Chaque exécution reste soumise au GO écrit spécifique du propriétaire (GO A fenêtre commune / GO B lot 1 — séparés, accordables indépendamment).

---

## 0. Repères d'état (vérifiés sur le dépôt le 2026-10-11, lecture seule)

| Élément | Valeur | Source / preuve |
|---|---|---|
| **Candidat applicatif figé** | **`7dff2c6c98f8be59edb64b34f8a1eb021745a435`** — tag `candidat-app-audit-v1.2` (cible re-vérifiée, type commit léger) | `git rev-parse` |
| Tag documentaire | `candidat-docs-audit-v1.2` → **`24415b7f19ed89b44201e436f3026680eddd84ad`** (re-vérifié) | `git rev-parse` |
| Empreinte arbre candidat | `8ae37edab22fea51f6a4a13a16cd21a8f78c3d55f81c61851e343d43f987e75e` (référence CONFORME) | `git archive 7dff2c6 \| sha256sum` |
| Validations acquises sur candidat | C1 build production SUCCÈS + smoke standalone 7/7 · **7/7 golden paths** UI réelle (preuves `v4r-*`) · TNR 1 658/1 658 · lint 0 erreur | `evidence/c1-build-web.json`, `vague4-candidat-7dff2c6.json` |
| Vues | **47/47 statuées** (44 validées + 3 bloquées extérieur : 36, 44, 45) | `reserved-views-revalidation.json` |
| Anomalies | **0 P1 / 0 P2 ouverte** · ~20 P3/P4 · A1V4-01 (P3) : correctif **DIFFÉRÉ** (décision 5ᵉ, orientation ⑦/G2) — surveillance + contournement documentés | registre 09 |
| **Base réelle `db/custom.db`** | **Intacte — preuve renforcée** : 265 330 688 octets · SHA-256 `756c01587cc54a25db37c2f099266506aa01ffcff440870a61b43e441b38126d` stable avant/après lecture · `integrity_check` = ok · état logique conforme ligne à ligne à `resv-db-final-state.json` (1 thèse `cmsmyrdfs0000pa2sews4vo90` « Urbanisme durable », updatedAt `2026-08-10T08:22:35.464Z` à la milliseconde, 7 chapitres, 4 références) | vague 13 (SQLite mode=ro) |
| `origin/main` | `f4ca696` (inchangé) — **local en avance de 16 commits + 2 tags** (liste §5) | `git rev-list --count` |
| Identifiants GitHub | **Toujours absents** — `git ls-remote` en échec d'authentification, aucun push tenté | test du 2026-10-11 |
| Arbre de travail | **Propre** | `git status` |

---

## 1. Ce qui a changé depuis le rapport v3 (doc 29) — décisions 5ᵉ-7ᵉ du propriétaire + confirmation §9

| Décision | Ce qu'elle verrouille | Effet pour le développement |
|---|---|---|
| **5ᵉ (2026-10-11)** | A1 sous conditions (pré-requis finaux, doc 30) · B1 même fenêtre · C2 par le propriétaire · push gelé sans confirmation E1/E2 · BFG gelé (révocation APINex d'abord) · **A1V4-01 : correctif DIFFÉRÉ (G2)** | Aucune correction de A1V4-01 sans nouvel arbitrage écrit ; surveillance + contournement maintenus |
| **6ᵉ (2026-10-11)** | **B-STRICT verrouillée** (preuve isolation = harnais Vitest, zéro écriture de test sur la base réelle, re-pass UI mono-thèse en consultation) · fenêtre en **PLUSIEURS SESSIONS** coordonnées (doc 32 : S1-S4) · application inutilisée entre migration et fin de revalidation · push différé E3 | Le plan de tests de toute exécution future passe par le harnais, jamais par la base réelle |
| **7ᵉ (2026-10-11)** | **MODE A verrouillé** (arrêt obligatoire à chaque point d'arrêt PA1-PA4, poursuite uniquement après accord écrit) · orientation AUD-SEC-004 : **D1 = C-B / D4-accept / D5-accept**, sous réserve de formalisation §9 · dossier final de démarrage demandé (doc 34) | Toute session s'arrête à chaque PA ; rapport de PA exigé avant poursuite |
| **Confirmation §9 (vague 10)** | **DÉCISION FORMALISÉE** : D1 = C-B (lot 1 sur les 10 routes destructives) · D4 = D4-accept (réévaluation obligatoire avant toute diffusion large) · D5 = D5-accept (2 raw SQL GET au backlog v1.3) — **SANS autorisation d'exécution** | Lot 1 **prêt mais bloqué** : deux déclencheurs restants = (1) levée expresse et écrite de la red line P7 (périmètre doc 35 §3) + (2) GO spécifique distinct (GO B) |
| **Vagues 11-14** | Traçabilité D6 exécutée (registre 09 + doc 04 + docs 23/31/34/35 — commit `dc5c3f3`, exactement 7 fichiers) · doc 36 (dossier de vérification) · vérifications indépendantes du propriétaire satisfaites (sorties Git brutes, diff D6, intégrité base prouvée par double SHA-256) | État audité et confirmé ; aucune divergence applicative détectée |

---

## 2. AUD-SEC-004 — la décision formalisée (ce que le développeur doit connaître)

**Décision (formalisée, confirmation écrite du propriétaire, 2026-10-11)** : **D1 = C-B** · **D4 = D4-accept** · **D5 = D5-accept**. Traçabilité complète : doc 23 (dossier) → doc 31 (arbitrage + formulaire §9) → doc 33 (conséquences) → doc 35 (dossier d'exécution) → confirmation → D6 (registre 09, doc 04, docs 23/31/34/35).

**Périmètre technique du lot 1 (dossier d'exécution : doc 35 — intégralité à lire avant tout travail)** :
- **Créer** `src/lib/parse-body.ts` (motif parseBody + `src/lib/api-schemas.ts` étendu).
- **Modifier** 10 routes mutantes destructives (liste exacte avec payloads actuels et schémas zod à créer : doc 35 §2, extraite ligne à ligne du code HEAD) + `api-schemas.test.ts`.
- **NE PAS toucher** : la chaîne d'upload (`article-imports`), les parsers, `prisma/schema.prisma`, la base, tout autre fichier.
- **Règle d'or** : « schémas calqués » — tout payload aujourd'hui valide doit produire une réponse identique (statut + corps) avant/après ; seuls les payloads invalides voient leur réponse durcie (400 zod).
- **Plan de tests (conforme B-strict)** : tests unitaires des schémas · comparaison avant/après sur les 10 routes (harnais) · TNR 1 658+ · lint 0 · GP ciblés sur harnais. **Zéro écriture de test sur `db/custom.db`.**
- **Critère de fin** : 10/10 routes avec schéma zod + comparaison sans écart.
- **Refigeage** : commits dédiés distincts par nature (A code / B tests / C docs) · revalidation commune en S4 · **un seul refigeage** · tag proposé **`candidat-app-audit-v1.2-R2`** (jamais déplacé, à confirmer dans le GO).
- **D4-accept ⇒ condition de sortie inscrite** : réévaluation obligatoire avant toute diffusion large. **D5-accept** : paramétrage des 2 raw SQL GET reporté au backlog v1.3 (sous-tâche P3).

**Statut : PRÊT MAIS BLOQUÉ.** Aucune ligne de code tant que le propriétaire n'a pas accordé la levée expresse de P7 + le GO B.

---

## 3. La fenêtre commune (mode A + B-strict) — rôle du développeur

Calendrier cible (dates à fixer dans le GO A — texte modèle : doc 34 §8) :

| Session | Contenu | Point d'arrêt |
|---|---|---|
| **S1** (J0, 60-90 min) | Gel + sauvegarde double SHA + migration réelle des références (option B, étapes 0-10 : docs 30 §6 + 27-A) | **PA1** — rapport + ARRÊT |
| **S2** (J1) | Cycle isolation P1 API (+ lot 1 AUD-SEC-004 si GO B accordé et P7 levé) | **PA2** — rapport + ARRÊT |
| **S3** (J2) | Cycle isolation P2 UI + P3 harnais Vitest (12-16 tests = preuve isolation) | **PA3** — rapport + ARRÊT |
| **S4** (J3) | Revalidation unique (TNR + GP rejoués sur harnais + re-pass UI mono-thèse consultation) · consignation · refigeage candidat · nouveau tag | **PA4** — paquet de 11 preuves + décision de clôture |

Règles de coordination (doc 32) : préavis 24 h · mode A par défaut (arrêt à chaque PA, poursuite sur accord écrit uniquement) · contrôle de continuité SHA entre sessions · droit de retrait à tout moment · journal horodaté. **Seules écritures tolérées sur la base réelle** : migration M-4/M-5/M-6 + usages réels après clôture. Retour arrière double voie 7a/7b + retour code (jamais amend/rebase/force).

---

## 4. Ce que le développeur fait maintenant (file de travail)

1. **Accompagner le C2 Windows** (P2 — doc 24) : le propriétaire exécute sur sa machine et transmettra **8 preuves** ; à réception : vérification intégrale (gabarit `c2-build-windows.json`, empreinte `8ae37eda…87e75e`, smoke CSP), consignation registre, **tout écart = ARRÊT + signalement immédiat**. 🟡 en attente des preuves.
2. **Maintenir l'état du push** (P3) : arbre propre ; liste §5 re-vérifiée à chaque session ; **aucun push sans rétablissement des identifiants (E1) OU exécution par le propriétaire (E2) ET confirmation explicite** (E3 différé). Au signal : `git push origin main --tags` **uniquement** — jamais force-push/rebase/amend — puis vérification `git log origin/main..main` vide, sortie consignée.
3. **Surveiller A1V4-01** (P5) : correctif différé (G2) — aucune correction sans nouvel arbitrage écrit ; contournement documenté au registre.
4. **Ne rien exécuter des préparations** : docs 30/32/34 (fenêtre) et 35 (lot 1) sont prêts mais **bloqués** jusqu'aux GO écrits (GO A / GO B + levée P7).
5. **Red lines** : inchangées (§6) — rappel : la phase reste une **clôture et un contrôle**, pas une évolution fonctionnelle.

---

## 5. Push GitHub — liste exacte vérifiée (au 2026-10-11, 16 commits + 2 tags)

**⚠️ Divergence consignée et réconciliée** : la liste croît d'un marqueur d'environnement par vague de consignation (contenu métier inchangé — vérifié vague par vague). **Re-vérification complète obligatoire juste avant le push** (`git rev-list --count origin/main..HEAD` + `git log origin/main..HEAD --oneline`), conformément à l'exigence E3.

| # | Commit | Nature |
|---|---|---|
| 1 | `d17488a` | Marqueur env. 2026-10-10 (création doc 23 + preuves C1 + worklog) — **omis des comptages vagues 5-11, réintégré vague 12** |
| 2 | `7dff2c6` | **APPLICATIF — candidat figé** (fix A1C1-02) |
| 3 | `24415b7` | Docs vague 4 (cible tag candidat-docs) |
| 4 | `1381350` | Docs preuves vague 4 (v4-gp*) |
| 5 | `af98588` | Marqueur env. (dont `.zscripts/dev.pid`, infrastructure : 1347→1103) |
| 6 | `e35a295` | Docs vague 5 |
| 7 | `938510a` | Marqueur env. (doc 26) |
| 8 | `dcbc5db` | Marqueur env. (docs 27-28) |
| 9 | `fd16fe0` | Marqueur env. (docs 30-31) |
| 10 | `11a5517` | Marqueur env. vague 8 |
| 11 | `bb657be` | Marqueur env. (docs 32-33) |
| 12 | `8a84548` | Marqueur env. (docs 34-35 + registre) |
| 13 | `dc5c3f3` | Marqueur env. (**D6** — exactement 7 fichiers, diff vérifié par le propriétaire) |
| 14 | `835bdee` | Marqueur env. (doc 36) |
| 15 | `4a1694f` | Marqueur env. (worklog vague 12) |
| 16 | `b276a32` | Marqueur env. (worklog vague 13) |

**2 tags en attente** : `candidat-app-audit-v1.2` → `7dff2c6` · `candidat-docs-audit-v1.2` → `24415b7` (cibles re-vérifiées ; 0 branche distante connue ne les contient).
**Commande unique autorisée, après confirmation du propriétaire uniquement : `git push origin main --tags`** — puis vérification post-push (`git log origin/main..main` vide) et consignation de la sortie.

---

## 6. Red lines (inchangées — rappel impératif)

1. **Interdits absolus avant accord écrit du propriétaire sur les preuves finales** : mise en production, ouverture aux premiers utilisateurs, toute diffusion externe.
2. **Interdits sans GO/autorisation écrite spécifique** : migration réelle `db/custom.db` et amendement `prisma/schema.prisma` (P6) · toute modification de code (P7) · suppression/restauration `INITIAL_*` (P8) · BFG / history rewrite / **force-push** (P9).
3. **Fichiers rouges ne pas toucher** : `db/custom.db`, `db/urbanisme-test.db`, `.env`, l'ensemble `audit/baseline/evidence/` (preuves).
4. **Candidat figé** : aucune écriture sur `7dff2c6` et sur son tag — toute évolution = nouveau commit + revalidation + nouveau tag (`candidat-app-audit-v1.2-R2` proposé).
5. Tests uniquement sur thèses jetables nettoyées via l'UI, preuve diff DB vide avant/après. **B-strict : zéro écriture de test sur la base réelle** — preuve isolation par harnais Vitest.
6. Phase = clôture et contrôle : pas de refonte, pas de fonctionnalité nouvelle.
7. **Signaler immédiatement** tout écart, perte de données, exposition de secret ou régression bloquante.

---

## 7. Livrables attendus en retour du développeur

1. **Réception C2 Windows** : vérification des 8 preuves (gabarit doc 24) + consignation registre + signalement des écarts.
2. **Push exécuté** (après E1/E2 + confirmation) : sortie consignée + vérification post-push, liste §5 soldée.
3. **Si GO A** : exécution S1-S4 selon docs 30/32/34 (mode A : rapports de PA1-PA4, arrêt à chaque PA) + livrables propres à chaque phase + refigeage + tag en S4.
4. **Si GO B (+ levée P7)** : exécution du lot 1 selon doc 35 (périmètre §3 strict, règle d'or §2, tests §4) — idéalement articulé en S2 (un seul refigeage).
5. **Après chaque vague** : registre 09 + v1.2 mis à jour ; divergences signalées immédiatement.

---

## 8. Annexes — références clés (état vague 14)

**Décisions & préparations :** `30_PREREQUIS_FINAUX_FENETRE_COMMUNE_MIGRATION_ISOLATION_2026-10-11.md` (pré-conditions, séquence, rollback) · `32_CALENDRIER_COORDINATION_FENETRE_COMMUNE_B_STRICT_2026-10-11.md` (S1-S4, mode A/B, coordination) · `34_DOSSIER_FINAL_DEMARRAGE_FENETRE_COMMUNE_2026-10-11.md` (checklist de démarrage + texte modèle de GO) · `35_DOSSIER_EXECUTION_LOT1_AUD_SEC_004_CB_2026-10-11.md` (lot 1 : périmètre, fichiers, tests, refigeage) · `31_NOTE_ARBITRAGE_AUD_SEC_004_CA_D4_D5_2026-10-11.md` + `33_AUD_SEC_004_CONSEQUENCES_PRECISES_OPTIONS_2026-10-11.md` (décision formalisée) · `23_AUD_SEC_004_DOSSIER_JUSTIFICATION.md` · `27_PREPARATIONS_CONDITIONNELLES_RUNBOOKS_2026-10-11.md` (runbooks A/B/C) · `21_PLAN_EXECUTION_FINAL_MIGRATION_REELLE.md` + `25_CLARIFICATION_MIGRATION_PERIMETRE_ISOLATION_2026-10-10.md` · `24_C2_WINDOWS_CHECKLIST_PREPAREE.md` (exécution propriétaire) · `36_DOSSIER_VERIFICATION_MODIFICATIONS_D6_2026-10-11.md` (vérification documentaire) · `28_DOSSIER_DECISIONS_BLOQUANTES_2026-10-11.md` (fiches historiques) · `13_PURGE_GIT_PLAN.md` §7 (BFG).
**Preuves & registre :** `BASELINE_AUDIT_REPORT_v1.2.md` · `09_FINDINGS_REGISTER.md` · `evidence/` : `c1-build-web.json`, `vague4-candidat-7dff2c6.json` + `v4r-*`, `reserved-views-revalidation.json` + `resv-*`, `resv-db-final-state.json` (état logique de référence), `rehearsal-refs.json`, `isolation-multitheses.json`, `a5-git-audit.json`.
**Scripts migration éprouvés :** `audit/baseline/tools/rehearsal-refs/` (utilisés tels quels à l'étape A.2).
**Historique des rapports Dev :** doc 16 (synthèse étape) → doc 22 (v1) → doc 26 (v2) → doc 29 (v3) → **le présent doc 37 (v4, en vigueur)**.
