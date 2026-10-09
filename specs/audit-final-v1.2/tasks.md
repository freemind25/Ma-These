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
- [~] T8 — A2 test UI des 13 actions destructives : **lot 1 5/5 conformes** (source IA, note IA, expérimentation, run, élément carto — `evidence/a2-lot1.json`, 15 captures) + partie de plan testée au lot 1c → **9/16 UI-vérifiées** (avec les 3 du C-3) ; reste 7 (onglet-recherche ×2, article-redaction ×2, registre-juridique, agile ×2).
- [x] T9 — A3 preuve restauration `upload/` : sauvegarde C-1 intacte 100 % (20 fichiers SHA-256), restauration réelle vers /tmp/restore-files-test 100 % identique, jeu contrôlé AUDIT-A3 (perte simulée → restauration OK), cohérence DB↔fichiers 16/16 (4 dépôts directs + 9 RAR + 3 résidus test AUD-DATA-001), 0 référence cassée ; outillage versionné `scripts/verify-upload-backup.ts` ; procédure documentée docs/SAUVEGARDE-RESTAURATION.md §6 [evidence/a3-upload-restore.json].

## Vague 3 — propriétaire
- [ ] T10 — C1 build web production sur commit final (propriétaire, gabarit rempli archivé).
- [ ] T11 — C2 build desktop Windows + smoke CSP (propriétaire, gabarit rempli archivé).
- [ ] T12 — C3 purge BFG coordonnée + révocation APINex confirmée + contrôles post-réécriture.

## Vague 4 — clôture
- [ ] T13 — (si autorisation distincte) migration références + revalidation isolation, sinon décision de report formelle consignée.
- [ ] T14 — TNR globaux + 7 golden paths en UI réelle ; inventaire 47/47 finalisé.
- [ ] T15 — `BASELINE_AUDIT_REPORT_v1.2.md` (tableau de conformité 11 critères, pré/après, preuves→commits, anomalies restantes, régressions, recommandation motivée GO final / maintien).
