# BASELINE_AUDIT_REPORT v1.2 — Cycle audit-final-v1.2 (EN COURS — vague 1 exécutée)

**Document distinct — la v1.0 reste immuable, la v1.1 reste l'historique du cycle C-1..C-4.**
Références : instructions définitives du propriétaire (IM 2026-10-10) · validation de la vague 1 (IM 2026-10-10) · plan `12_PLAN_EXECUTION_CYCLE_FINAL.md`.
Verdict en vigueur : **GO SOUS CONDITIONS** — ni mise en production, ni ouverture aux premiers utilisateurs, ni diffusion.

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

## 2. Tableau de conformité — 11 critères de sortie vers le GO final

| # | Critère | Statut | Preuve | Commit | Limite / décision |
|---|---|---|---|---|---|
| 1 | 33 vues testées ; 47 statuts + preuves | ⬜ en cours (vague 2) | matrice v1.2 + JSON + captures (à venir) | — | vues externes traitées individuellement |
| 2 | 13 actions destructives testées UI | ⬜ en cours (vague 2) | registre 16/16 (à venir) | — | — |
| 3 | Restauration `upload/` démontrée | ⬜ en cours (vague 2) | JSON SHA-256 (à venir) | — | jamais d'essai sur l'unique copie |
| 4 | Références par thèse mise en œuvre + revalidée, ou report formel | 🟡 proposition soumise | `specs/ref-thesis-scoping/proposition-technique.md` | — | **autorisation distincte requise** |
| 5 | Build web production + parcours critiques | ⬜ procédure livrée | `14_PROCEDURE_BUILD_WEB.md` (gabarit) | — | exécution propriétaire sur commit final |
| 6 | Build Windows + smoke CSP durcie | ⬜ procédure livrée | `15_PROCEDURE_BUILD_WINDOWS.md` (gabarit) | — | exécution propriétaire ; résultats rapportés séparément |
| 7 | Purge git + secrets sécurisés | 🟡 audit + plan prêts | `evidence/a5-git-audit.json` + `13_PURGE_GIT_PLAN.md` | `6158f4e` (désuivre .env) | révocation + coordination = prérequis propriétaire |
| 8 | Suite + TNR verts | ✅ à chaque contrôle | 1 658/1 658 + lint 0 err (2026-10-10) | `03037e2` | référence v1.1 maintenue |
| 9 | Anomalies recensées, risques justifiés | ✅ tableau de gestion livré | registre §Tableau de gestion v1.2 | `6abb3e8` | AUD-SEC-004 à traiter/justifier avant GO |
| 10 | Incohérences corrigées ; preuves → commit | ✅ A4 + traçabilité | `reconciliation_A4` (7 canoniques) | `6abb3e8` | v1.0/v1.1 non modifiées |
| 11 | Rapport v1.2 avec tableau de conformité | 🟡 présent document (itératif) | ce fichier | — | finalisé en vague 4 |

Légende : ✅ satisfait · 🟡 en cours/partiel · ⬜ à faire · chaque statut sera adossé à une preuve et au commit réellement testé.

## 3. Reste du cycle (vagues 2-4)

- **Vague 2** : A1 pass UI des 33 vues (lots) · A2 test UI des 13 actions destructives · A3 preuve restauration `upload/`.
- **Vague 3** : C1/C2 exécutions propriétaire (procédures livrées) · C3 purge BFG coordonnée + confirmation révocation.
- **Vague 4** : (si autorisation distincte) migration références + revalidation · TNR globaux + 7 golden paths · finalisation v1.2 + **recommandation motivée (GO final / maintien GO SOUS CONDITIONS)**.

## 4. Régressions et incidents

- Aucune régression applicative à ce stade de la vague (TNR verts après chaque changement). Incidents : aucun.
