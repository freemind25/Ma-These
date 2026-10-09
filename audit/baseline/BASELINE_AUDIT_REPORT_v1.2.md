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

## 2. Tableau de conformité — 11 critères de sortie vers le GO final

| # | Critère | Statut | Preuve | Commit | Limite / décision |
|---|---|---|---|---|---|
| 1 | 33 vues testées ; 47 statuts + preuves | 🟡 8/33 (lot 1 complet) | `evidence/a1-lot1.json` + captures | `bc71223` | 25 vues restantes (lots 2-9) |
| 2 | 13 actions destructives testées UI | ✅ **16/16** | `evidence/a2-lot1.json` + `a2-lot2.json` + 37 captures | `bc71223` + commit lot 2 | — |
| 3 | Restauration `upload/` démontrée | ✅ | `evidence/a3-upload-restore.json` + doc §6 | `bc71223` | copie manuelle statique (limite documentée) |
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
