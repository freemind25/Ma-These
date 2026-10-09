# Tasks — cycle audit-final-v1.2

Légende : [ ] à faire · [~] en cours · [x] fait (chaque case adossée à une preuve consignée)

## Vague 1 — immédiat (documentaire / lecture seule / préparation)
- [x] T1 — Plan d'exécution séquencé soumis au propriétaire (`audit/baseline/12_PLAN_EXECUTION_CYCLE_FINAL.md`) — 4 lots, 11 critères mappés, vagues 1-4.
- [ ] T2 — A4 réconciliation golden paths : liste canonique 7 (6 initiaux + GP-7 ajouté v1.1), harmonisation v1.2/preuves/captures.
- [ ] T3 — A5①-④ audit historique git non destructif : sauvegarde vérifiée (miroir+bundle), inventaire branches/tags/remotes, contrôle .env et fichiers suivis, scan historique (localisation commits/fichiers, sans reproduction), statut révocation, plan BFG prêt (exécution = Lot C3 coordonné).
- [ ] T4 — A6 registre P2/P3 actualisé + réévaluation AUD-UX-002 (qualification bloquant GP-4 ; correction ciblée proposée, justifiée, retirable).
- [ ] T5 — B proposition technique références `specs/ref-thesis-scoping/` (schéma, contraintes, API, migration réversible, ambiguïtés, tests d'isolation, risques) — SANS exécution.
- [ ] T6 — A7 squelette v1.2 + tableau de conformité 11 critères + procédures/gabarits C1 (build web) et C2 (build Windows) remis au propriétaire.

## Vague 2 — exécution UI réelle
- [ ] T7 — A1 pass 33 vues par lots (8-10/vague) : parcours, états, persistance, multi-thèses, destructifs, preuves JSON+captures ; vues externes (Overpass, APInex) traitement individuel ; clé APINex restaurée dans .env.local local uniquement.
- [ ] T8 — A2 test UI des 13 actions destructives (contrôles ①-⑥ par action, objets AUDIT-, cleanup, registre 16/16).
- [ ] T9 — A3 preuve restauration `upload/` (échantillon + jeu AUDIT- → backup → restauration isolée → SHA-256 → cohérence DB↔fichiers → procédure documentée).

## Vague 3 — propriétaire
- [ ] T10 — C1 build web production sur commit final (propriétaire, gabarit rempli archivé).
- [ ] T11 — C2 build desktop Windows + smoke CSP (propriétaire, gabarit rempli archivé).
- [ ] T12 — C3 purge BFG coordonnée + révocation APINex confirmée + contrôles post-réécriture.

## Vague 4 — clôture
- [ ] T13 — (si autorisation distincte) migration références + revalidation isolation, sinon décision de report formelle consignée.
- [ ] T14 — TNR globaux + 7 golden paths en UI réelle ; inventaire 47/47 finalisé.
- [ ] T15 — `BASELINE_AUDIT_REPORT_v1.2.md` (tableau de conformité 11 critères, pré/après, preuves→commits, anomalies restantes, régressions, recommandation motivée GO final / maintien).
