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
- [~] W2-2 — Audit isolation multi-thèses PRIORITAIRE (priorité #2 propriétaire) : AUD-FUNC-007 (GET /api/thesis sans partId), usage theses[0] (vue Plan, sélecteurs), risques d'affichage/écriture cross-thèse par vue — revue code + UI ciblée thèse jetable AUDIT-ISO. Aucune migration de schéma. [evidence/isolation-multitheses.json]
- [ ] W2-3 — A1 lot 2 : 9 vues (13 agile, 14 boîte doctorale, 15 équilibre, 25 onglet recherche, 26 méthodologie, 27 analyse champ, 28 SLR, 35 outils IA, 37 expérimentations). [evidence/a1-lot2.json]
- [ ] W2-4 — A1 lot 3 : 9 vues (29 vérif méthodo, 31 citations, 32 hypothèses, 33 cohérence, 34 preuves, 38 soutenance, 40 article→code, 41 diagrammes, 42 APA). [evidence/a1-lot3.json]
- [ ] W2-5 — A1 lot 4 : 8 vues dont 2 externes individuelles (19 OpenAlex, 20 Journaux OA, 23 explorateur, 39 routesme, 44 traducteur, 46 export PDF, 30 Overpass, 36 APInex — clé nouvelle requise). [evidence/a1-lot4.json]
- [ ] W2-6 — Proposition migration références relue au regard des 6 priorités (attribution existantes, risques, sauvegarde, tests isolation, rollback) + synthèse de décision propriétaire.
- [ ] W2-7 — TNR fin de vague + RAPPORT DE FIN DE LOT (checkpoint : vues testées/restantes, anomalies, preuves/commits, état risque multi-thèses, statut plan BFG, prochaines validations).

## Vague 3 — propriétaire
- [ ] T10 — C1 build web production sur commit final (propriétaire, gabarit rempli archivé).
- [ ] T11 — C2 build desktop Windows + smoke CSP (propriétaire, gabarit rempli archivé).
- [ ] T12 — C3 purge BFG coordonnée + révocation APINex confirmée + contrôles post-réécriture.

## Vague 4 — clôture
- [ ] T13 — (si autorisation distincte) migration références + revalidation isolation, sinon décision de report formelle consignée.
- [ ] T14 — TNR globaux + 7 golden paths en UI réelle ; inventaire 47/47 finalisé.
- [ ] T15 — `BASELINE_AUDIT_REPORT_v1.2.md` (tableau de conformité 11 critères, pré/après, preuves→commits, anomalies restantes, régressions, recommandation motivée GO final / maintien).
