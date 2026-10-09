# Cycle audit-final-v1.2 — Clôture audit v1.1 et préparation du GO final

## Origine
Instructions définitives du propriétaire (IM 2026-10-10) en réponse à `BASELINE_AUDIT_REPORT_v1.1.md`. Verdict maintenu : **GO SOUS CONDITIONS**. Ni mise en production, ni ouverture aux premiers utilisateurs, ni diffusion avant critères de sortie satisfaits et validation explicite du propriétaire.

## Périmètre autorisé (Lot A — démarrage immédiat)
- A1 : pass UI réel des 33 vues restantes (C-19) → inventaire consolidé 47 vues (statuts + preuves).
- A2 : test UI réel des 13 actions destructives vérifiées par code seulement (16/16 en UI).
- A3 : preuve de restauration des fichiers `upload/` (répertoire de test isolé, SHA-256, cohérence DB↔fichiers).
- A4 : réconciliation golden paths (liste canonique : GP-1..GP-6 initiaux v1.0 + GP-7 export DOCX ajouté v1.1 = 7 partout).
- A5 : audit non destructif de l'historique git (sauvegarde vérifiée, inventaire refs, scan secrets, plan BFG) — la réécriture est coordonnée (Lot C3).
- A6 : registre P2/P3 actualisé (priorité, impact, reproducibilité, contournement, responsable, décision) + réévaluation AUD-UX-002 (bloquant GP-4 → correction ciblée proposée, justifiée, retirable par le propriétaire).
- A7 : traçabilité (hash de commit dans chaque preuve) + tableau de conformité des 11 critères.

## Hors périmètre (autorisation distincte requise)
- Migration `thesisId` sur `Reference` : **proposition technique seule** (Lot B, `specs/ref-thesis-scoping/`), aucune modification de schéma/données avant accord explicite.
- Builds web production et desktop Windows : exécution propriétaire (procédures et gabarits préparés).
- Réécriture d'historique git (BFG) : exécution coordonnée après audit A5 et révocation APINex confirmée côté fournisseur.

## Critères d'acceptation
1. CA-1 : 33 vues exécutées en UI réelle, inventaire 47/47 avec statut et preuve ; vues non testables documentées individuellement (cause, conséquence, résolution proposée), jamais validées par inspection du code.
2. CA-2 : 13 actions destructives testées en UI réelle selon les 6 contrôles exigés (0 suppression avant confirmation ; Annuler = 0 requête/0 modification ; Confirmer = suppression prévue seule ; cascades conformes ; UI à jour ; erreurs sans perte silencieuse).
3. CA-3 : restauration `upload/` prouvée (noms/nombre/tailles/SHA-256 identiques ; cohérence avec restauration base ; zéro référence cassée) — sans essai destructif sur l'unique copie réelle.
4. CA-4 : liste canonique des golden paths (7) identique dans synthèse, tests, captures et critères de sortie ; aucun parcours supprimé.
5. CA-5 : audit historique git consigné sans reproduction de secrets ; plan de purge prêt ; état de révocation documenté.
6. CA-6 : registre actualisé ; AUD-UX-002 requalifiée et traitée (ou retirée sur décision propriétaire) ; aucun défaut bloquant parcours critique laissé ouvert au GO final.
7. CA-7 : chaque preuve porte le hash du commit testé ; tableau de conformité des 11 critères à jour.
8. CA-8 : proposition technique références complète (schéma, contraintes, API, migration réversible, ambiguïtés, tests d'isolation, risques) — soumise, non exécutée.
9. CA-9 : TNR globaux verts à chaque changement (référence : 1 658 tests, lint 0 erreur, 7 golden paths) ; tout écart expliqué.

## Invariants
Lignes rouges 0 diff ; `db/custom.db` skip-worktree ; v1.0 immuable ; v1.1 = historique C-1..C-4 ; aucune clé/secret dans les preuves ; objets de test préfixés `AUDIT-` nettoyés ; push vérifié avant chaque pousse.
