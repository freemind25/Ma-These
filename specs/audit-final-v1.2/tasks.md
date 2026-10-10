# Tasks — cycle audit-final-v1.2

Légende : [ ] à faire · [~] en cours · [x] fait (chaque case adossée à une preuve consignée)

## Vague 1 — immédiat (documentaire / lecture seule / préparation)
- [x] T1 — Plan d'exécution séquencé soumis au propriétaire (`audit/baseline/12_PLAN_EXECUTION_CYCLE_FINAL.md`) — 4 lots, 11 critères mappés, vagues 1-4. [f904c87]
- [x] T2 — A4 réconciliation golden paths : liste canonique 7 (6 initiaux + GP-7 ajouté v1.1) — annotation preuve `reconciliation_A4` [6abb3e8] ; v1.0/v1.1 intouchées.
- [x] T3 — A5①-④ audit historique git non destructif : bundle 78 Mo + miroir 155 Mo vérifiés ; inventaire (main + origin/main, tags v1.10.7/8) ; .env trouvé suivi depuis commit initial → désuit [6158f4e] ; scan : clé APINex réelle dans .env historique (porteurs 04dc5ab/763ee5d, retraits b25f426/7260947), 0 PAT, clé IM jamais commitée (pickaxe préfixe masqué = 0) ; plan BFG prêt (`13_PURGE_GIT_PLAN.md`) [6abb3e8].
- [x] T4 — A6 registre actualisé (tableau de gestion 12 fiches ouvertes, 6 colonnes exigées) + AUD-UX-002 corrigée et revalidée [03037e2].
- [x] T5 — B proposition technique références `specs/ref-thesis-scoping/proposition-technique.md` — SANS exécution [6d93dd4].
- [x] T6 — A7 squelette v1.2 (tableau conformité 11 critères) + procédures/gabarits C1 (`14_PROCEDURE_BUILD_WEB.md`) et C2 (`15_PROCEDURE_BUILD_WINDOWS.md`) [6d93dd4].

## Vague 2 — exécution UI réelle
- [~] T7 — A1 pass 33 vues par lots : **lot 1 COMPLET 8/8 vues validées** (Brouillon chapitre, Harper, Grammaire, Phrasier, Déblocage, Auto-édition 8C, Cadrage, Plan de thèse — `evidence/a1-lot1.json` + 60+ captures ; 1 P2 nouvelle : GET /api/thesis sans partId ; 9×P3) ; reste 25 vues (lots 2-9). Sessions : W1-7 (partielle, consolidée), W1-7b, W1-7c.
- [x] T8 — A2 test UI des 13 actions destructives : **CLÔTURÉ 16/16 vérifiées en UI réelle** (3 au C-3 ; lot 1 : source IA, note IA, exp, run, élément carto ; partie de plan au lot 1c ; lot 2 7/7 : onglet fermer DELETE + effacer PUT, article, doc importé, registre juridique [porté par Livres-compétences], story, sprint-cascade conformes au message ; audit réseau : DELETE/PUT exacts, Annuler = 0 requête partout ; `evidence/a2-lot1.json` + `a2-lot2.json` + 37 captures) ; 1 observation P3 consignée (removeImport sans vérif res.ok). Sessions W1-8, W1-8b.
- [x] T9 — A3 preuve restauration `upload/` : sauvegarde C-1 intacte 100 % (20 fichiers SHA-256), restauration réelle vers /tmp/restore-files-test 100 % identique, jeu contrôlé AUDIT-A3 (perte simulée → restauration OK), cohérence DB↔fichiers 16/16 (4 dépôts directs + 9 RAR + 3 résidus test AUD-DATA-001), 0 référence cassée ; outillage versionné `scripts/verify-upload-backup.ts` ; procédure documentée docs/SAUVEGARDE-RESTAURATION.md §6 [evidence/a3-upload-restore.json].

## Vague 2-bis — poursuite validée par le propriétaire (IM 2026-10-10, 6 priorités)
- [x] W2-1 — Inventaire exhaustif vues restantes : 26 nommées (NAVIGATION_ITEMS + matrice v1.0), répartition lots 2-4, réconciliation du compte « 25 » documentée. [evidence/a1-inventory-restantes.json]
- [x] W2-2 — Audit isolation multi-thèses PRIORITAIRE (priorité #2 propriétaire) : **AUD-ISO-001 P1 PROUVÉE** (vue Plan PUT sur theses[0] ≠ thèse active — test décisif), AUD-FUNC-007 consolidée (cause racine route.ts:16 + repro UI), 7 fiches, cartographie modèles. [evidence/isolation-multitheses.json + 23 captures] [6e79e6e]
- [x] W2-3 — A1 lot 2 : **9/9 vues** (13 agile VALIDÉE, 14 boîte doctorale réserves, 15 équilibre réserves, 25 onglet VALIDÉE, 26/27/28 VALIDÉES, 35 outils IA VALIDÉE). 12 anomalies A1L2A/B. [evidence/a1-lot2a.json + a1-lot2b.json + 70 captures] [8161a70, bc0d2d7]
- [x] W2-4 — A1 lot 3 : **9/9 vues** (29 VALIDÉE, 31 VALIDÉE registres réels, 32 IA cassée A1L3A-03 P2, 33 VALIDÉE 0 anomalie, 34 VALIDÉE, 38 VALIDÉE contre-exemple binding correct, 40 inutilisable A1L3B-01 P2, 41 VALIDÉE, 42 VALIDÉE). [evidence/a1-lot3a.json + a1-lot3b.json + 50 captures] [39e44a6, 6f00b97]
- [x] W2-5 — A1 lot 4 : **8/8 vues dont 2 externes** (19 arXiv réel 482, 20 OpenAlex réel, 23 theses.fr réel 486 905, 39 routesme, 44 NON TESTABLE extérieur, 46 export PDF réel vérifié, 30 Overpass réel failover, 36 NON TESTABLE extérieur clé requise). [evidence/a1-lot4a.json + a1-lot4b.json + 63 captures] [3fd0f2f, 476862c] — **REGISTRE A1 33/33 CLÔTURÉ**
- [x] W2-6 — Proposition migration références amendée §6-bis (binding activeThesisId exigé, test isolation 2 thèses, fenêtre avant C1/C2, résidu AUD-ISO-003) — synthèse de décision dans le rapport de fin de lot.
- [~] W2-7 — TNR fin de vague 1 658/1 658 verts + lint 0 erreur [11:30] ; registre +31 fiches ; v1.2 §1-bis + tableau actualisé ; RAPPORT DE FIN DE LOT `17_RAPPORT_FIN_DE_LOT_2026-10-10.md` livré au propriétaire.

## Vague 3 — propriétaire
- [ ] T10 — C1 build web production sur commit final (propriétaire, gabarit rempli archivé).
- [ ] T11 — C2 build desktop Windows + smoke CSP (propriétaire, gabarit rempli archivé).
- [ ] T12 — C3 purge BFG coordonnée + révocation APINex confirmée + contrôles post-réécriture.

## Vague 4 — clôture
- [ ] T13 — (si autorisation distincte) migration références + revalidation isolation, sinon décision de report formelle consignée.
- [ ] T14 — TNR globaux + 7 golden paths en UI réelle ; inventaire 47/47 finalisé.
- [ ] T15 — `BASELINE_AUDIT_REPORT_v1.2.md` (tableau de conformité 11 critères, pré/après, preuves→commits, anomalies restantes, régressions, recommandation motivée GO final / maintien).
