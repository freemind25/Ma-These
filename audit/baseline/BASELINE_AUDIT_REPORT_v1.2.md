# BASELINE_AUDIT_REPORT v1.2 — Cycle audit-final-v1.2 (EN COURS — vagues 1, 2 et 3 exécutées)

**Document distinct — la v1.0 reste immuable, la v1.1 reste l'historique du cycle C-1..C-4.**
Références : instructions définitives du propriétaire (IM 2026-10-10) · validation de la vague 1 (IM 2026-10-10) · plan `12_PLAN_EXECUTION_CYCLE_FINAL.md`.
Verdict en vigueur : **GO SOUS CONDITIONS** — ni mise en production, ni ouverture aux premiers utilisateurs, ni diffusion.

> **Repères de commits (exigence point 6 de la décision propriétaire — distinction explicite) — actualisés vague 5**
> - **Commit applicatif candidat (code testé)** : **`7dff2c6`** (complet `7dff2c6c98f8be59edb64b34f8a1eb021745a435`) — tag **`candidat-app-audit-v1.2`** — fix A1C1-02 (1 ligne tsconfig) sur la base fb60ae1 (fix A1C1-01). Toutes les validations finales portent sur ce commit : C1 SUCCÈS, GP 7/7 UI réelle, TNR 1 658/1 658, lint 0 erreur. Empreinte arbre : `8ae37eda…` (`evidence/vague4-candidat-7dff2c6.json`).
> - **Commits documentaires (docs/preuves, 0 diff code)** : tag **`candidat-docs-audit-v1.2` → `24415b7`** (clôture vague 4) + `1381350` (preuves captures v4-gp*) — précède les livrables vague 5 (docs 23 maj, 24 enrichi, 25 clarification).
> - Les deux repères sont **à actualiser au commit de clôture** de la v1.2 — le candidat applicatif ne doit jamais être décrit par un hash documentaire, ni inversement.

## 1. Résultats de la vague 1 (2026-10-10)

### AUD-UX-002 — corrigée, revalidée (autorisation point 6)
- Réévaluation : qualifiée **bloquante parcours GP-4** (hit-test bouton Générer) — non rétrogradable en risque résiduel.
- Correctif ciblé 1 fichier (`test-deliverable-card.tsx`) : pastille repliée par défaut (pointer-events confinés), panneau dépliable sur clic explicite, dismissal inchangé. Commit `03037e2`.
- Revalidation UI réelle (clics réels agent-browser) : hit-test du bouton Générer propre ; **clic direct → POST /api/ai-writing/stream 200 → Résultat affiché** ; déplier/plier/masquer/persistance OK. Preuves : `evidence/ux2-revalidation.json` + 4 captures.
- TNR : 1 658/1 658 verts · lint 0 erreur · rouges 0 diff.

### A4 — Golden paths réconciliés
- Incohérence constatée : v1.0 §L.2 « 6 » vs v1.1 §3 « Six » pour 7 items énumérés (GP-7 export DOCX ajouté au TNR v1.1, couvert en v1.0 comme vue 47).
- **Liste canonique : 7** — GP-1 rédaction · GP-2 création thèse · GP-3 références CRUD · GP-4 génération IA · GP-5 RAG cité · GP-6 thèses en ligne (6 du périmètre initial v1.0) + GP-7 export DOCX (ajouté TNR v1.1). **Aucun parcours supprimé.**
- Annotation de la preuve : `evidence/tnr-golden-paths.json` → bloc `reconciliation_A4`. La v1.0 et la v1.1 non modifiées rétroactivement ; le total 7 s'applique partout en v1.2.

### A5 — Audit git non destructif (AUD-SEC-002/003)
- Sauvegarde vérifiée : bundle 78 Mo (« complete history ») + miroir 155 Mo.
- **Constat majeur** : `.env` était suivi **depuis le commit initial** (contenu à HEAD : `DATABASE_URL` seul, aucune clé API) → désuit (commit `6158f4e`, hygiène non destructive).
- Scan historique : clé APINex réelle présente via `.env` aux commits porteurs `04dc5ab`/`763ee5d` (retraits `b25f426`/`7260947`) ; **0 PAT GitHub** dans l'historique ; **la clé APINex fournie par IM n'a jamais été commitée** (pickaxe préfixe masqué : 0) — distincte de la clé exposée.
- Références masquées dans les fichiers suivis vérifiées (analyse de longueur : aucune clé réelle).
- **Plan de purge BFG prêt** (`13_PURGE_GIT_PLAN.md`) — exécution vague 3 subordonnée : confirmation révocation (propriétaire/fournisseur) + fenêtre de coordination. Preuve : `evidence/a5-git-audit.json`.

### A6 — Registre actualisé
- Tableau de gestion complet ajouté au registre (12 fiches ouvertes : priorité/impact/reproductibilité/contournement/responsable/décision). AUD-UX-002 passée à « corrigée, revalidée ». Aucune fiche bloquante parcours critique ouverte. AUD-SEC-004 explicitement marquée « à traiter ou justifier avant GO ».

### B — Proposition technique références (SANS exécution)
- `specs/ref-thesis-scoping/proposition-technique.md` : schéma (`thesisId` nullable + Cascade + index), règles API d'isolation, migration réversible (répétition sur copie, attribution univoque, cas non attribuables, rollback testé), 12-16 tests d'isolation, risques, effort 2-3 j, positionnement recommandé (après vague 2, avant builds). **Soumise à autorisation distincte — rien d'exécuté.**

### A2 — 13 actions destructives restantes : testées en UI réelle → registre 16/16 (critère #2 SATISFAIT)
- Lot 1 (5 actions : source IA, note IA, expérimentation, run, élément carto) + lot 2 (7 actions : onglet recherche fermeture DELETE + effacement PUT, article, doc source importé, entrée registre juridique [portée par Livres-compétences], story, sprint avec cascade conforme au message) + partie de plan (testée au lot 1c) : **toutes conformes aux 6 contrôles** — ① 0 suppression avant confirmation ; ② Annuler = 0 requête + 0 modification (comptages DB) ; ③ Confirmer = exactement la requête prévue (audit réseau de session : DELETE/PUT attendus uniquement, tous 200) ; ④ cascades conformes (sprint → stories supprimées conformément au dialogue ; doc importé → article survit ; run → exp survit) ; ⑤ UI à jour ; ⑥ aucune perte silencieuse (1 observation P3 consignée : removeImport sans vérif res.ok — cas d'échec non rencontré en test).
- Preuves : `evidence/a2-lot1.json` + `evidence/a2-lot2.json` + 37 captures `a2-lot*.png` + comptages DB avant/après. État propriétaire préservé exactement (diff 18 tables vide).

### A3 — Restauration des fichiers `upload/` démontrée (critère #3 SATISFAIT)
- Sauvegarde C-1 intacte : 20 fichiers / 255 273 238 octets, SHA-256 100 % conformes. **Restauration réelle** vers `/tmp/restore-files-test` (isolé) : 100 % identique. Jeu de test contrôlé AUDIT-A3 (perte simulée → restauration → SHA-256 OK). **Cohérence DB↔fichiers : 16/16 ImportedDoc localisés** (4 dépôts directs taille conforme + 9 dérivés de RAR présents dans upload/ + 3 résidus docx de test classés AUD-DATA-001), 0 référence cassée, 0 document manquant.
- Outillage versionné `scripts/verify-upload-backup.ts` ; procédure documentée `docs/SAUVEGARDE-RESTAURATION.md` §6. Preuve : `evidence/a3-upload-restore.json`. **Aucun essai sur l'unique copie réelle.**

### A1 — Pass UI des 33 vues : lot 1 complet (8/8 validées), 25 restantes (critère #1 en cours)
- 8 vues Rédaction/Structure validées en UI réelle (Brouillon de chapitre, Harper, Grammaire, Phrasier Académique, Déblocage écriture, Auto-édition 8C, Cadrage de thèse [DB-persistée prouvée], Plan de thèse) — `evidence/a1-lot1.json` + 60+ captures.
- **Découverte : AUD-FUNC-007 (P2)** — GET /api/thesis sans partId : chapitres rattachés jamais affichés dans la vue Plan (attachement persiste, détachement inatteignable en UI ; contournement éditeur). + 9 observations P3 (outils à état local non persisté — cohérents avec l'inventaire C-3).
- Reste 25 vues (lots 2-9) dont les 2 à dépendances externes (Overpass/APInex) en traitement individuel.

## 1-bis. Résultats de la vague 2-bis (2026-10-10) — poursuite validée par le propriétaire (6 priorités)

### W2-2 — Audit isolation multi-thèses (PRIORITAIRE, preuve `evidence/isolation-multitheses.json`)
- **Isolation structurelle saine** : FK thesisId + Cascade prouvées sur Chapter/Part/Cadrage/DoctoralToolbox/SoutenancePrep/ResearchTab (diff DB vide après suppression thèse jetable, 0 orphelin).
- **Risque d'écriture cross-thèse PROUVÉ (AUD-ISO-001, P1)** : la vue Plan lit/écrit `theses[0]` (updatedAt desc) au lieu de `activeThesisId` — test décisif : PUT de structureMode sur la MAUVAISE thèse (la jetable à ce moment ; le propriétaire aurait été touché si l'ordre updatedAt avait été inversé). 5 modules concernés (famille AUD-ISO-002/003) ; correctif minimal prêt (1 fichier), **autorisation en attente**.
- AUD-FUNC-007 consolidée (AUD-ISO-004) : cause racine `GET /api/thesis` (route.ts:16, select sans partId) + reproduction UI ; correctif 1 ligne proposé.
- 7 fiches isolation nouvelles (registre) ; cartographie complète modèles thèse-scopés vs globaux-by-design.

### W2-3→W2-5 — A1 CLÔTURÉ : 34/34 vues des lots traitées (critère #1 SATISFAIT — compte « 33 » corrigé, cf. 20_RAPPORT §7.2)
- **Lot 2 (9 vues)** : 13 agile VALIDÉE (IA 400 = A1L2A-01 P2), 14 boîte doctorale (AUD-ISO-003 matérialisé), 15 équilibre (objectifs non persistés), 25 onglet VALIDÉE (race auto-création ×3), 26/27/28 VALIDÉES (états démo non persistés), 35 outils IA VALIDÉE (persistés, DB prouvée).
- **Lot 3 (9 vues)** : 29 VALIDÉE (garde silencieuse), 31 VALIDÉE (**registres réels** Crossref/OpenAlex/PubMed), 32 hypothèses **IA cassée** (A1L3A-03 P2, contrat {content,mode} vs {prompt}), 33 cohérence VALIDÉE **0 anomalie** (2 passes IA, citations verbatim), 34 VALIDÉE (lecture seule), 38 soutenance VALIDÉE (**contre-exemple : binding activeThesisId correct**), 40 paper2code **inutilisable sans clé** (A1L3B-01 P2), 41 diagrammes VALIDÉE (export PNG vérifié), 42 APA VALIDÉE (2×P3).
- **Lot 4 (8 vues, services externes RÉELS)** : 19 arXiv **482 résultats**, 20 OpenAlex 20 journaux + classement IA (DOAJ fail propre), 23 theses.fr **486 905 thèses** (détail NNT), 39 routesme (= comparateur multi-modèles même backend), 44 traducteur **NON TESTABLE cause extérieure** (LibreTranslate publics morts — 503 propre), 46 export PDF **réel** (%PDF 4 pages vérifié hors arbre), 30 carto **Overpass réel via failover** (23 hôpitaux Alger), 36 APInex **NON TESTABLE cause extérieure** (clé nouvelle requise ; comportement sans clé exhaustif).
- **Distinction exigée par le propriétaire appliquée** : chaque vue porte un statut explicite — test UI réel / test réel avec réserve / non testable pour cause extérieure (jamais validée par revue de code seule ; les revues sont consignées comme compléments).
- Bilan vues : **24 validées en UI réelle + 2 non testables extérieur** sur les 26 restantes (inventaire `a1-inventory-restantes.json`, réconciliation du compte « 25 » documentée) ; 31 fiches anomalies nouvelles au registre (1 P1, 6 P2, reste P3/P4) ; A1L2B-02 transversale (toasts use-toast invisibles, ~10 modules, correctif 1 ligne à arbitrer).
- État propriétaire : diff DB vide à CHAQUE session (30 tables, preuves `*-db-before/after.json`) ; 1 résidu documenté (DoctoralToolbox template INITIAL_*, AUD-ISO-003) ; 2 incidents OOM next-server résolus hors bande (preuves worklog).

### W2-6 — Proposition migration références amendée (autorisation distincte toujours requise)
- `specs/ref-thesis-scoping/proposition-technique.md` amendée §6-bis : condition de binding `activeThesisId` (jamais theses[0]) sur la vue références et les 8 consommateurs, nouveau test d'isolation exigé avec 2 thèses, fenêtre actualisée (immédiatement après autorisation, avant C1/C2), traitement du résidu AUD-ISO-003 avant/pendant migration.

## 2. Tableau de conformité — 11 critères de sortie vers le GO final

| # | Critère | Statut | Preuve | Commit | Limite / décision |
|---|---|---|---|---|---|
| 1 | 47 vues : statuts + preuves | ✅ **47/47 statuées — CLOTURE** : 44 validées UI réelle (7 v1.0 + 32 lots A1 + 5 ex-réservées) + 3 bloquées extérieur (36 APInex clé requise, 44 LibreTranslate, 45 limitation externe 3 sources) ; les 6 réservées v1.0 ont été revalidées en UI réelle (16/21/24/43/47 VALIDÉES, 45 VALIDÉE AVEC LIMITATION EXTERNE — point 3 décision propriétaire 2026-10-10) | `reserved-views-revalidation.json` + 34 captures `resv-*` + `a1-lot*.json` + ~300 captures | `78812c6` (T6-b) | plus aucune vue « réservée sans contrôle » ; « réservé ≠ validé » levé par contrôles réels |
| 2 | 13 actions destructives testées UI | ✅ **16/16** | `evidence/a2-lot1.json` + `a2-lot2.json` + 37 captures | `bc71223` + commit lot 2 | — |
| 3 | Restauration `upload/` démontrée | ✅ | `evidence/a3-upload-restore.json` + doc §6 | `bc71223` | copie manuelle statique (limite documentée) |
| 4 | Références par thèse mise en œuvre + revalidée, ou report formel | 🟡 **GO SUSPENDU par le propriétaire (3ᵉ décision, 2026-10-10) jusqu'à clarification écrite — CLARIFICATION LIVRÉE (doc 25)** : conséquences exactes des 8 consommateurs inchangés (comportement strictement identique), risques inter-thèses R1-R6 (aucun matérialisable à 1 thèse ; R1/R3 certains en multi-thèses, R2 modéré, R4 cascade voulue), cycle de complétion P1-P4 = 2-3 j. **Option B enregistrée** pour l'isolation 7-bis (zéro écriture de test sur la base réelle). **Aucune modification de `db/custom.db` ni de `prisma/schema.prisma` avant GO écrit spécifique** | `25_CLARIFICATION_MIGRATION_PERIMETRE_ISOLATION_2026-10-10.md` + `21_PLAN_EXECUTION_FINAL_MIGRATION_REELLE.md` + `evidence/rehearsal-refs.json` + `specs/ref-thesis-scoping/proposition-technique.md` | correctifs `6f853ac` (binding activeThesisId prérequis livré) | décision propriétaire en attente : GO écrit spécifique migration + autorisation distincte du cycle applicatif (fenêtre unique ou deux) |
| 5 | Build web production + parcours critiques | ✅ **C1 EXÉCUTÉ — SUCCÈS sur candidat 7dff2c6** (après correctif A1C1-02 découvert par ce C1 sur fb60ae1) ; smoke standalone 7/7 (port 3100, base jetable) | `evidence/c1-build-web.json` (gabarit doc 14 rempli) + `evidence/vague4-candidat-7dff2c6.json` | `7dff2c6` | exécution DEV de la procédure doc 14 sur le candidat ; exécution propriétaire possible en complément si souhaité |
| 6 | Build Windows + smoke CSP durcie | 🟡 **PRÉPARATION COMPLÈTE LIVRÉE (vague 5)** : check-list C2 enrichie sur le candidat `7dff2c6` — prérequis (1.1-1.10 dont Internet GP-6, clé IA GP-4/GP-5 avec règle « échec propre ≠ FAIL »), identité arbre + empreinte `8ae37eda…`, séquence, 7 GP + persistance avec critères PASS explicites, CSP/capabilities valeurs exactes, tableau PASS/FAIL global, preuves à retourner (8 items) + gabarit JSON | `24_C2_WINDOWS_CHECKLIST_PREPAREE.md` (complète) + `15_PROCEDURE_BUILD_WINDOWS.md` | — | exécution propriétaire sur machine Windows en attente ; résultats rapportés séparément |
| 7 | Purge git + secrets sécurisés | 🟡 **plan version exécutable prête** (§7 doc 13) | `evidence/a5-git-audit.json` + `13_PURGE_GIT_PLAN.md` §7 | `6158f4e` (désuivre .env) | révocation + validation plan + fenêtre de coordination = prérequis propriétaire ; 0 exécution |
| 8 | Suite + TNR verts | ✅ **rejeu sur le candidat 7dff2c6** : 1 658/1 658 (17,6 s) + lint 0 erreur / 247 warnings (exit 0) | `evidence/vague4-candidat-7dff2c6.json` | `7dff2c6` | référence maintenue sur le commit candidat exact |
| 9 | Anomalies recensées, risques justifiés | 🟡 **P1 close + 8 P2 corrigées/validées** (commit `6f853ac`, preuves `isolation-fix.json`) ; 0 P1/P2 ouverte ; reste P3/P4 (~20 fiches, aucune bloquante) — **AUD-SEC-004 : justification livrée (doc 23 : recompte 41/99 routes sans schéma dont 10 mutantes avec écriture DB ; risque résiduel Basse argumenté) — OPTIONS A/B/C PRÉSENTÉES AU PROPRIÉTAIRE (2026-10-10, §6 du dossier : risques/charge/couverture/impact GO, préférence « traitement complet si périmètre maîtrisé » notée) — aucune option acceptée avant décision écrite** | registre §Vague 2-bis + §Vague 3 + doc 23 | `6f853ac` | P3/P4 = cycle à planifier ; résidu INITIAL_* = CONSERVÉ (décision propriétaire 2026-10-10, aucune suppression autorisée) ; AUD-SEC-004 = arbitrage propriétaire (doc 23, D1-D6) |
| 10 | Incohérences corrigées ; preuves → commit | ✅ A4 + traçabilité | `reconciliation_A4` (7 canoniques) | `6abb3e8` | v1.0/v1.1 non modifiées |
| 11 | Rapport v1.2 avec tableau de conformité | ✅ **FINALISÉ (vague 5)** — tableau à jour (11 critères), repères commits distingués, contrôles exécutés/preuves/limitations externes/risques ouverts distingués ; les décisions propriétaire en attente restent les seuls éléments ouverts (§3-ter) | ce fichier | — | document de clôture soumis au propriétaire avec les éléments de décision |


## 3-bis. Vague 4 — validations finales sur le commit candidat (2026-10-10)

**Réponse directe au point 4 de la décision propriétaire du 2026-10-10** (clôture technique) — toutes les opérations non destructives, aucune migration, aucune suppression INITIAL_*, aucun BFG.

| Action exigée | Résultat | Preuve |
|---|---|---|
| Figer et consigner le commit candidat | Tags git `candidat-app-audit-v1.2` → **7dff2c6** (app) et `candidat-docs-audit-v1.2` (docs) + `evidence/candidate-commit-v1.2.json` — distinction commits applicatif/documentaire explicite ; candidat initial fb60ae1 déplacé par le correctif A1C1-02 (refigé, tracé) | `candidate-commit-v1.2.json` + tags |
| Exécuter C1 sur ce candidat | **SUCCÈS** après découverte + correctif A1C1-02 (P2 build bloquant : outillage audit/ dans le type-check) ; smoke standalone 7/7 sur port 3100 (base jetable VACUUM INTO) | `c1-build-web.json` (gabarit doc 14 rempli) |
| Rejouer les 7 golden paths | **7/7 VALIDÉS en UI réelle** sur 7dff2c6 (GP-1 persistance prouvée, GP-2 garde bouton désactivé, GP-3 POST 201 + Annuler=0 DELETE + Confirmer, GP-4 clic direct → stream 200, GP-5 RAG ancré, GP-6 HAL 135 thèses, GP-7 DOCX Microsoft Word 2007+) | `vague4-candidat-7dff2c6.json` + 9 captures `v4r-*` |
| Rejouer les 1 658 tests + lint | 1 658/1 658 verts + lint 0 erreur / 247 warnings — exit 0 ×2 | `vague4-candidat-7dff2c6.json` |
| Consigner hashes + résultats exacts | présent tableau + `candidate-commit-v1.2.json` + preuves JSON horodatées | ce fichier §3-bis |
| Écarts signalés | **A1V4-01 (P3)** auto-save inerte tant qu aucun onglet de chapitre cliqué après démarrage (affichage chapters[0] sans sélection) — signalé, registre mis à jour, non bloquant en flux normal | registre 09 fiche A1V4-01 |
| AUD-SEC-004 | Justification explicite livrée : `23_AUD_SEC_004_DOSSIER_JUSTIFICATION.md` (recompte 41/99, modèle de menace, contrôles compensatoires, plan progressif 2-3 j) — **décision propriétaire requise (options A/B/C + D1-D6)** | doc 23 + registre |
| Registre 09 | À jour : + A1C1-02 (corrigée/validée), + A1V4-01 (ouverte P3 signalée), 6 vues réservées statuées | registre 09 |

**Reste pour GO final (actualisé vague 5)** : C2 Windows exécuté par le propriétaire sur `7dff2c6` (check-list complète doc 24) · GO écrit spécifique sur la migration réelle (doc 21, clarifié par doc 25) + autorisation distincte du cycle applicatif d'isolation · décision résidu INITIAL_* (doc 19 — CONSERVÉ par décision 2026-10-10, aucune suppression autorisée) · BFG 3 conditions (doc 13 §7 — révocation confirmée + plan validé + fenêtre coordonnée) · décision AUD-SEC-004 (doc 23, options A/B/C + D1-D6) · push des commits/tags en attente dès rétablissement des identifiants · recommandation motivée finale.

## 3-ter. Vague 5 — réponse à la 3ᵉ décision du propriétaire (2026-10-10)

**Toutes les opérations restent non destructives : 0 migration, 0 écriture `db/custom.db`, 0 modification `prisma/schema.prisma`, 0 suppression INITIAL_*, 0 BFG/force-push, 0 modification de code.**

| Point de la décision | Réponse / livrable | Statut |
|---|---|---|
| 1. Doc 21 — migration (GO suspendu) | **Doc 25 livré** : clarification écrite du périmètre réel (ce que fait/ne fait pas la migration), comportement exact des 8 consommateurs après migration, risques inter-thèses R1-R6, cycle de complétion de l'isolation applicative P1-P4 (2-3 j, fenêtre unique ou deux). **Option B enregistrée** pour l'isolation 7-bis (sans valeur d'autorisation) | décision en attente (GO écrit spécifique) |
| 2. Doc 19 — résidu INITIAL_* | **Conservé** — aucune suppression, preuves intactes (`residu-dryrun-20261010-165230.txt`, registre 09 l.198) | conforme à la décision |
| 3. Doc 23 — AUD-SEC-004 | Options **A/B/C** présentées au propriétaire (risques, charge, couverture réelle, conséquences GO — §6 du dossier ; préférence « traitement complet si périmètre maîtrisé » notée en tête du doc 23) | décision en attente (aucune option acceptée) |
| 4. Doc 13 §7 — APINex/BFG | Figé — aucune purge ni force-push ; 3 prérequis inchangés (révocation confirmée + plan validé + fenêtre coordonnée) ; nouvelle clé par canal sécurisé uniquement | attente propriétaire |
| 5. C2 Windows — doc 24 | **Check-list complète livrée** sur `7dff2c6` : prérequis 1.1-1.10, identité arbre + empreinte `8ae37eda…`, séquence, 7 GP avec critères PASS explicites, CSP/capabilities exactes, tableau PASS/FAIL global, preuves à retourner (8 items) + gabarit JSON `c2-build-windows.json` | exécution propriétaire en attente |
| 6. Push GitHub | **Liste exacte fournie au propriétaire** : 5 commits en attente (3 de contenu annoncés + 2 marques d'environnement automatiques) + 2 tags, vérifiés vs `origin/main` = `f4ca696…`. **BLOCAGE : identifiants absents de l'environnement** (`.gh-askpass.sh` disparu au rollback, `git ls-remote` exige une authentification) — push normal `git push origin main --tags` prêt à exécuter dès rétablissement ; jamais de force-push | bloqué identifiants |
| 7. Clôture finale | Registre 09 à jour (AUD-SEC-004 : options présentées ; INITIAL_* : conservé) · présent rapport finalisé (critères 1-11, repères commits, §3-ter) · base réelle intacte | livré |


Légende : ✅ satisfait · 🟡 en cours/partiel · ⬜ à faire · chaque statut sera adossé à une preuve et au commit réellement testé.

## 3. Reste du cycle (vagues 3-4)

- **Vague 3 (correctifs autorisés) : EXÉCUTÉE** — commit `6f853ac` : AUD-ISO-001 (P1) + AUD-ISO-002/003/004 corrigés sans migration, 4 P2 corrigées (A1L2A-01, A1L3A-03/04, A1L3B-01, A1L2B-02) ; validation UI réelle à 2 thèses (`evidence/isolation-fix.json`, 25 captures isofix, diff DB VIDE) ; TNR 1 658/1 658 + lint baseline 247 ; répétition générale migration sur copie (doc 18, GO conditionnel favorable, en attente de validation propriétaire) ; plan BFG version exécutable (doc 13 §7, en attente des 3 conditions) ; résidu INITIAL_* documenté (doc 19, template pur, procédure prête) ; compte « 33 » corrigé en « 34 » (20_RAPPORT §7) — détail complet dans `20_RAPPORT_CYCLE_CORRECTIFS_2026-10-10.md`.
- **Arbitrages propriétaire restants** : ③ validation explicite de la migration références sur la base réelle (répétition générale livrée) ; ④ clé APInex nouvelle pour la vue 36 ; ⑤ résidu DoctoralToolbox (supprimer via procédure doc 19 / conserver documenté) ; + (i) confirmation révocation APINex, (ii) validation plan BFG §7, (iii) fenêtre de coordination pour C3.
- **Vague 4** : C1/C2 exécutions propriétaire sur commit final candidat (procédures livrées) · rejeu 7 golden paths + TNR sur le candidat · (si validée) migration références + revalidation · re-pass optionnel des 6 vues réservées ⚠ · finalisation v1.2 + **recommandation motivée (GO final / maintien GO SOUS CONDITIONS)**.

## 4. Régressions et incidents

- Aucune régression applicative (TNR 1 658/1 658 verts à chaque contrôle, lint 0 erreur, fichiers rouges 0 diff, état propriétaire préservé — diff 30 tables vide à chaque session).
- Incidents résolus : 2 arrêts OOM noyau du serveur dev pendant la vague 2 (RSS ~2,5 Go), relancés à l'identique hors bande, 0 impact preuves (worklog W1-8b, W2-5b).
