# RAPPORT D'ÉTAPE — Cycle « audit-final-v1.2 » (synthèse pour le développeur)

**Date :** 2026-10-10 · **État git :** `HEAD == origin/main == c01f5bd`, arbre propre · **Verdict en vigueur :** GO SOUS CONDITIONS (ni mise en production, ni ouverture aux premiers utilisateurs, ni diffusion)
**Application :** ThesisFrame (Tauri + Next.js 16 App Router + TypeScript + Prisma/SQLite) · 98 routes API · 30 modèles Prisma · suite de tests 1 658 verts

Ce document est une **synthèse de communication** : il résume l'étape, désigne les preuves et liste ce qui reste à faire. Les documents canoniques restent `BASELINE_AUDIT_REPORT_v1.2.md` (rapport du cycle, itératif), la v1.0 (immuable) et la v1.1 (historique C-1..C-4).

---

## 1. Cadre de l'étape

Le cycle vise le **GO final** au moyen de 11 critères de sortie (tableau §3), organisés en 4 lots :
- **Lot A** (développeur, autorisé) : pass UI des 33 vues restantes, test UI des 13 actions destructives restantes, preuve de restauration `upload/`, réconciliation golden paths, audit git non destructif, registre, squelette du rapport v1.2.
- **Lot B** (proposition SANS exécution) : références rattachées par thèse (`thesisId` sur `Reference`) — toute migration de schéma exige une **autorisation distincte**.
- **Lot C** (exécution hors environnement de dev) : build web production, build Windows Tauri + smoke CSP, purge git BFG coordonnée.
- **Lot D** : tableau de conformité 11 critères + finalisation du rapport v1.2.

Discipline en vigueur (SDD) : chaque affirmation est adossée à une **preuve** (`audit/baseline/evidence/`, 157 captures + 21 JSON) et au **commit réellement testé** ; commits conventionnels ; push systématique ; tests + lint verts avant tout commit de code.

## 2. Ce qui a été fait dans cette étape (vagues 1 et 2)

### 2.1 AUD-UX-002 — corrigée et revalidée (autorisation explicite du propriétaire)
- Réévaluée **bloquante parcours GP-4** (la pastille « Livrable du test » interceptait le clic sur le bouton Générer).
- Correctif ciblé **1 fichier** (`test-deliverable-card.tsx`) : pastille repliée par défaut (pointer-events confinés), panneau dépliable sur clic explicite, dismissal inchangé. Commit `03037e2`.
- Revalidation en UI réelle (clics réels) : clic direct → POST `/api/ai-writing/stream` 200 → résultat affiché ; déplier/plier/masquer/persistance OK. Preuves : `evidence/ux2-revalidation.json` + 4 captures.

### 2.2 A4 — Golden paths réconciliés
- Incohérence documentaire (v1.0 « 6 » vs v1.1 « Six » pour 7 items énumérés) résolue : **liste canonique = 7** (GP-1 rédaction, GP-2 création thèse, GP-3 références CRUD, GP-4 génération IA, GP-5 RAG cité, GP-6 thèses en ligne + GP-7 export DOCX ajouté au TNR v1.1). Aucun parcours supprimé ; v1.0/v1.1 non modifiées rétroactivement.

### 2.3 A5 — Audit git non destructif (AUD-SEC-002/003)
- Sauvegarde vérifiée : bundle 78 Mo (« complete history ») + miroir 155 Mo.
- Constat : `.env` était suivi **depuis le commit initial** (contenu à HEAD : `DATABASE_URL` seul, aucune clé API) → **désuit** (commit `6158f4e`, hygiène non destructive ; le fichier reste en local).
- Scan d'historique : clé APINex réelle présente via `.env` aux commits porteurs `04dc5ab`/`763ee5d` (retirés `b25f426`/`7260947`) ; **0 PAT GitHub** dans l'historique ; la clé APINex fournie ultérieurement n'a **jamais** été commitée.
- **Plan de purge BFG prêt** : `13_PURGE_GIT_PLAN.md`. Exécution subordonnée à la confirmation de révocation de la clé + fenêtre de coordination (cf. §5). Preuve : `evidence/a5-git-audit.json`.

### 2.4 A6 — Registre des anomalies actualisé
- Tableau de gestion complet ajouté à `09_FINDINGS_REGISTER.md` (12 fiches ouvertes : priorité, impact, reproductibilité, contournement, responsable, décision). AUD-UX-002 passée à « corrigée, revalidée ». AUD-SEC-004 explicitement marquée « à traiter ou justifier avant GO ».

### 2.5 B — Proposition technique « références par thèse » (SANS exécution)
- `specs/ref-thesis-scoping/proposition-technique.md` : `thesisId` nullable + Cascade + index, règles API d'isolation, migration réversible (répétition sur copie, attribution univoque, rollback testé), 12-16 tests d'isolation, effort estimé 2-3 j. **Rien d'exécuté** — en attente d'autorisation distincte.

### 2.6 A3 — Restauration des fichiers `upload/` démontrée (critère #3 SATISFAIT)
- Sauvegarde C-1 intacte : 20 fichiers / 255 273 238 octets, SHA-256 100 % conformes.
- **Restauration réelle** vers un répertoire isolé : 100 % identique. Jeu de test contrôlé (perte simulée → restauration → SHA-256 OK).
- Cohérence DB↔fichiers : **16/16 ImportedDoc localisés**, 0 référence cassée, 0 document manquant.
- Outillage versionné `scripts/verify-upload-backup.ts` ; procédure documentée `docs/SAUVEGARDE-RESTAURATION.md` §6. Preuve : `evidence/a3-upload-restore.json`. Aucun essai sur l'unique copie réelle.

### 2.7 A2 — 13 actions destructives restantes : toutes testées en UI réelle → registre **16/16** (critère #2 SATISFAIT)
- Lot 1 (source IA, note IA, expérimentation, run, élément carto + partie de plan au lot 1c) + lot 2 (onglet recherche : fermeture DELETE + effacement PUT ; article ; doc source importé ; entrée registre juridique ; story ; sprint avec cascade).
- **Toutes conformes aux 6 contrôles** : ① 0 suppression avant confirmation ; ② Annuler = 0 requête + 0 modification (comptages DB avant/après) ; ③ Confirmer = exactement la requête prévue (audit réseau de session : DELETE/PUT attendus uniquement, tous 200) ; ④ cascades conformes aux messages (sprint → stories supprimées ; doc importé → article survit) ; ⑤ UI à jour ; ⑥ aucune perte silencieuse.
- Preuves : `evidence/a2-lot1.json` + `evidence/a2-lot2.json` + 37 captures + comptages DB. État propriétaire préservé exactement (diff 18 tables vide).

### 2.8 A1 — Pass UI des 33 vues : lot 1 complet, **8/33** validées (critère #1 EN COURS)
- 8 vues Rédaction/Structure validées en UI réelle : Brouillon de chapitre, Harper, Grammaire, Phrasier Académique, Déblocage écriture, Auto-édition 8C, **Cadrage de thèse** (persistance DB prouvée par reload), **Plan de thèse** (CRUD partie + cascade SetNull vérifiée). Preuves : `evidence/a1-lot1.json` + 60+ captures.
- **Reste 25 vues** (lots 2-9), dont 2 à dépendances externes (Overpass, APInex — voir §5 point 3 pour la clé).

### 2.9 A7 — Rapport v1.2 + procédures de build
- `BASELINE_AUDIT_REPORT_v1.2.md` (itératif) avec tableau de conformité 11 critères.
- Procédures prêtes pour l'exécution hors environnement de dev : `14_PROCEDURE_BUILD_WEB.md` (C1) et `15_PROCEDURE_BUILD_WINDOWS.md` (C2), avec gabarits de résultats.

## 3. Tableau de conformité — 11 critères de sortie vers le GO final

| # | Critère | Statut | Preuve | Commit |
|---|---|---|---|---|
| 1 | 33 vues testées ; 47 statuts + preuves | 🟡 **8/33** (lot 1 complet) | `evidence/a1-lot1.json` + captures | `bc71223` |
| 2 | 13 actions destructives testées UI | ✅ **16/16** | `evidence/a2-lot1.json` + `a2-lot2.json` + 37 captures | `bc71223` + `c01f5bd` |
| 3 | Restauration `upload/` démontrée | ✅ | `evidence/a3-upload-restore.json` + doc §6 | `bc71223` |
| 4 | Références par thèse mise en œuvre ou report formel | 🟡 proposition soumise | `specs/ref-thesis-scoping/proposition-technique.md` | — |
| 5 | Build web production + parcours critiques | ⬜ procédure livrée | `14_PROCEDURE_BUILD_WEB.md` | — |
| 6 | Build Windows + smoke CSP durcie | ⬜ procédure livrée | `15_PROCEDURE_BUILD_WINDOWS.md` | — |
| 7 | Purge git + secrets sécurisés | 🟡 audit + plan prêts | `evidence/a5-git-audit.json` + `13_PURGE_GIT_PLAN.md` | `6158f4e` |
| 8 | Suite + TNR verts | ✅ 1 658/1 658 + lint 0 erreur | chaque commit de code | `03037e2`… |
| 9 | Anomalies recensées, risques justifiés | ✅ tableau de gestion | registre v1.2 | `6abb3e8` |
| 10 | Incohérences corrigées ; preuves → commit | ✅ A4 + traçabilité | `reconciliation_A4` (7 canoniques) | `6abb3e8` |
| 11 | Rapport v1.2 avec tableau de conformité | 🟡 présent (itératif) | `BASELINE_AUDIT_REPORT_v1.2.md` | — |

Légende : ✅ satisfait · 🟡 en cours/partiel · ⬜ à faire.

## 4. Anomalies découvertes pendant cette étape

- **AUD-FUNC-007 (P2)** — `GET /api/thesis` sans `partId` : les chapitres rattachés à une partie ne sont jamais affichés dans la vue Plan (attachement persiste en DB, détachement inatteignable en UI ; contournement via éditeur). Consignée au registre, non corrigée (hors périmètre autorisé).
- **9 P3** — outils à état local non persisté (Suivi quotidien, Pomodoro, analyses IA 8C, checklist…), cohérents avec l'inventaire C-3 ; vue Plan liée à `theses[0]` et non à la thèse active (risque multi-thèses) ; badge partie non rafraîchi sans reload ; icône poubelle pour un détachement (non destructif) ; compteur de résultats Phrasier absent ; coût : 8 appels IA parallèles par « Analyser les 8C ».
- **P3 statique** — `removeImport` (article) ne vérifie pas `res.ok` et filtre l'état local sans refetch (divergence UI/DB possible en cas d'échec serveur ; cas non rencontré en test).
- Aucune fiche bloquante parcours critique ouverte. **AUD-SEC-004** : à traiter ou justifier avant GO.

## 5. Règles contraignantes pour toute reprise (invariants)

1. **Fichiers rouges — 0 diff exigé** : `src/app/api/theses-en-ligne/search/route.ts`, `src/app/api/arxiv/search/route.ts`, `src/components/layout/app-sidebar.tsx`.
2. **`db/custom.db`** (248 Mo, données réelles) : verrouillée `skip-worktree` — ne jamais commiter, ne jamais `db:push` sans autorisation, préserver l'état du propriétaire lors des tests (objets de test créés puis supprimés via les flux UI testés).
3. **Secrets** : la clé APINex historiquement exposée est **interdite de réutilisation** — utiliser uniquement une clé **nouvellement générée et validée** fournie par le propriétaire ; aucune valeur sensible dans les logs, preuves ou commits ; git : **aucun `force-push` ni réécriture d'historique** tant que la purge BFG n'a pas été coordonnée (cf. `13_PURGE_GIT_PLAN.md`) et la révocation confirmée.
4. **Schéma** : aucune migration (`thesisId` sur `Reference` incluse) sans **autorisation distincte** — la proposition Lot B est documentée mais non approuvée.
5. **Rapports v1.0/v1.1** : immuables ; corrections documentées uniquement dans la v1.2.
6. **Vérification standard avant tout commit** : `bun run test` (1 658 verts) + `bun run lint` (0 erreur, baseline 247 warnings) ; pas de build de production dans l'environnement de dev.

## 6. Ce qu'il reste à faire

| Qui | Quoi | Référence |
|---|---|---|
| Développeur | **A1 suites** : 25 vues restantes en UI réelle, par lots de 8-10 (dont 2 à dépendances externes) | preuves au format `a1-lot1.json` |
| Développeur | (si autorisation distincte) migration références + tests d'isolation, sinon report formel | `specs/ref-thesis-scoping/proposition-technique.md` |
| Propriétaire / Dev hors env. de dev | **C1** build web production sur le commit final + parcours critiques | `14_PROCEDURE_BUILD_WEB.md` |
| Propriétaire / Dev hors env. de dev | **C2** build Windows Tauri + smoke CSP durcie (résultats rapportés séparément du web) | `15_PROCEDURE_BUILD_WINDOWS.md` |
| Propriétaire (prérequis) | Confirmation révocation clé APINex + fenêtre de coordination → **C3** purge BFG + contrôles post-réécriture | `13_PURGE_GIT_PLAN.md` |
| Développeur (clôture) | TNR globaux + 7 golden paths en UI réelle ; inventaire 47/47 ; finalisation v1.2 avec recommandation motivée | `BASELINE_AUDIT_REPORT_v1.2.md` |

## 7. Comment vérifier l'état revendiqué

- Tests / lint : `bun run test` (1 658 verts) · `bun run lint` (0 erreur).
- Preuves : `audit/baseline/evidence/` (157 captures, 21 JSON, 1 par chantier).
- Traçabilité : chaque ligne du tableau §3 renvoie au commit réellement testé ; `git log --oneline -10` pour l'historique du cycle (`f904c87` → `c01f5bd`).

## 8. Incidents et régressions

Aucune régression applicative pendant l'étape (TNR verts après chaque changement de code, fichiers rouges jamais touchés, état du propriétaire préservé sur toutes les tables). Incidents : 1 redémarrage du serveur dev hors bande (arrêt constaté en début de session A2 lot 2, sans impact sur les preuves).
