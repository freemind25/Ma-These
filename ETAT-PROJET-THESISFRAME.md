# ETAT-PROJET-THESISFRAME.md

> **Document unique de vérité — mis à jour après chaque lot.**
> Dernière mise à jour : Lot 12 (Phase D — nettoyage final)
> Sources de référence : AUDIT-FORENSIQUE-THESISFRAME.md, RAPPORT-LOT-6-CORRECTIONS.md, RAPPORT-LOT-6BIS-CLARIFICATIONS.md, RAPPORT-LOT-7-CORRECTIONS.md, RAPPORT-LOT-7BIS-GOUVERNANCE.md, RAPPORT-LOT-8-CORRECTIONS.md, RAPPORT-LOT-9-VERIFICATION.md, RAPPORT-LOT-9BIS-VERIFICATION.md, RAPPORT-LOT-10-VERIFICATION.md, RAPPORT-LOT-11-DECISIONS.md, RAPPORT-LOT-12-PHASE-D.md

---

## 1. Tableau des 31 fonctionnalités

> Statut vérifié par lecture de code. Les rapports antérieurs au Lot 6 (audit forensique) sont considérés non fiables par défaut — seul le statut ci-dessous fait foi.

| # | Fonctionnalité | Statut | Dernière vérification | Résumé | Bugs ouverts associés |
|---|---|---|---|---|---|
| 1 | Tableau de bord | ✅ Fonctionne | Lot 6bis | 4 stat cards, 6 actions rapides, grille 14 modules | — |
| 2 | Éditeur de thèse (Tiptap) | ✅ Fonctionne | Lot 9 | Éditeur fonctionnel, auto-save 2.5s. BUG-01,02,06,07,08,09 corrigés. Ajout/suppression chapitres, réordonnancement ( Monter/Descendre) | — |
| 3 | Assistant IA (modes d'écriture) | ✅ Fonctionne | Lot 12 | 18 modes dans WRITING_MODES (auto-edition-8c ajouté Lot 12). 5 modes orphelins ajoutés Lot 8 | — |
| 4 | Chat Directeur | ✅ Fonctionne | Lot 9 | Critique-only, max 2 fiches, auto-scroll. **BUG-10 corrigé (Lot 9)** : thesisContext passé depuis la thèse active | — |
| 5 | Références bibliographiques | ✅ Fonctionne | Audit forensique | CRUD, filtres, favoris, import BibTeX/RIS/CSL-JSON, export | — |
| 6 | Méthodologie (guides) | ✅ Fonctionne | Audit forensique | Contenu statique, checklist interactive | — |
| 7 | Articles scientifiques (IMRaD) | ✅ Fonctionne | Audit forensique | Guide IMRaD statique + checklist soumission | — |
| 8 | Plan de thèse + LaTeX | ✅ Fonctionne | Lot 7 | CRUD Parties (Lot 6), toggle structureMode persisté (Lot 6), LaTeX. **FK Prisma `partId` avec `onDelete: SetNull`** (Lot 7 — dette d'intégrité résolue) | — |
| 9 | Outils IA (carnet + consensus) | ✅ Fonctionne | Audit forensique | CRUD sources/entrées, consensus IA | — |
| 10 | Bases de données académiques | ✅ Fonctionne | Audit forensique | Répertoire statique de 27 bases | — |
| 11 | Journaux Open Access | ✅ Fonctionne | Audit forensique | Recherche OpenAlex + DOAJ, BUG-11 corrigé | — |
| 12 | Recherche plein texte | ✅ Fonctionne | Audit forensique | Opérateurs booléens, scoring, filtres | — |
| 13 | Auto-édition 8C | ✅ Fonctionne | Lot 12 | 8 critères, checklist. Mode `auto-edition-8c` dédié (Lot 12), validation taille max 50k car. (BUG-27,34) | — |
| 14 | Feuille de route agile | ✅ Fonctionne | Audit forensique | CRUD sprints/stories, Kanban 5 phases | — |
| 15 | Déblocage écriture | ✅ Fonctionne | Audit forensique | Diagnostic, exercices, Pomodoro 25/5 | — |
| 16 | Outils SLR (PRISMA) | ✅ Fonctionne | Audit forensique | Diagramme PRISMA 4 étapes, criblage, extraction, export CSV | — |
| 17 | Analyse du champ de recherche | ✅ Fonctionne | Audit forensique | Cartographie IA, positionnement | — |
| 18 | APA Compositeur | ✅ Fonctionne | Lot 12 | APA 7e édition, 10+ types de source. DialogDescription ajouté (BUG-30) | — |
| 19 | Vérification méthodologique | ✅ Fonctionne | Audit forensique | BUG-04 corrigé, checklist + audit IA | — |
| 20 | Vérification cartographique | ✅ Fonctionne | Audit forensique | Module A rule-based + Module B socratique | — |
| 21 | Boîte doctorale | ✅ Fonctionne | Lot 6bis | Persistance DB, debounce 1.5s, BUG-14 corrigé (H2-03) | — |
| 22 | Box Cloud | 🗑️ Supprimé | Lot 12 | Module supprimé (décision produit). Fichier, import, store, usage guide retirés | — |
| 23 | RoutesMe (multi-modèles) | ⚠️ Partiel | Audit forensique | Labels visuels GPT-4/Claude/Mistral/Llama mais pas de vraie comparaison multi-fournisseurs | DT-08 |
| 24 | Livres & Compétences | ⚠️ Partiel | Audit forensique | Livres codés en dur, pas de persistance DB, CustomBookSkill orphelin | DT-09 |
| 25 | Onglet de recherche | ✅ Fonctionne | Lot 6bis | CRUD via API, persistance DB, BUG-15 corrigé (H2-03), testé (Lot 6bis) | — |
| 26 | Grammaire IA | ✅ Fonctionne | Lot 9 | Parsing JSON typé, BUG-06/12/20 corrigés. **BUG-20** : avertissement « Analyse incomplète » au lieu de faux négatif | — |
| 27 | Export PDF | ✅ Fonctionne | Lot 12 | Vrai export PDF programmatique (jspdf + html2canvas-pro). `window.print()` conservé comme alternative | — |
| 28 | Équilibre des chapitres | ✅ Fonctionne | Lot 6bis | Sélecteur de thèse, équilibre IA, BUG-23 corrigé | — |
| 29 | Diagrammes visuels | ✅ Fonctionne | Lot 12 | 5 renderers CSS/HTML dédiés. CRUD nœuds OK. Export PNG (html2canvas-pro) ajouté Lot 12 (BUG-21). BUG-22 clos Lot 10 | — |
| 30 | Harper (résumé/paraphrase) | ✅ Fonctionne | Lot 6bis | Mode « harper » ajouté dans WRITING_MODES (Lot 6), 12ème mode | — |
| 31 | Mon IA de thèse (RAG) | ✅ Fonctionne | Audit forensique | Chat contextuel, 4 sources indexées, keyword-only SQLite | — |

### Bilan

| Statut | Nombre | IDs |
|---|---|---|
| ✅ Fonctionne | **28** | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 25, 26, 27, 28, 29, 30, 31 |
| ⚠️ Partiel | **2** | 23, 24 |
| 🗑️ Supprimé | **1** | 22 |
| **Total** | **31** | |

---

## 2. Bugs ouverts — backlog priorisé

> Seuls les bugs **non résolus** sont listés. Les bugs résolus (BUG-01 à 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34) sont retirés du backlog. **BUG-22** clos par Lot 10. **BUG-21 à 34** (sauf BUG-20/33) résolus par Lot 12.

### 2.1 — Bugs confirmés non résolus

*(Aucun — tous les bugs de Phase D ont été résolus par le Lot 12)*

### 2.3 — Modes IA orphelins (découverts Lot 6)

> ✅ **Résolu par Lot 8** — les 5 modes ont été ajoutés dans `WRITING_MODES` avec des systemPrompt adaptés à leur contexte d'appel.

### 2.4 — Dette d'intégrité référentielle

| Élément | Priorité | Phase | Description | Statut |
|---|---|---|---|---|
| `parentId` → `partId` FK Prisma | 🔴 Critique | A | La relation Chapter↔Part utilisait un champ générique `parentId` sans contrainte. Le Lot 2 affirmait avoir ajouté `partId` avec FK — **jamais fait** (H2-03). | ✅ **Résolu par Lot 7** |

---

## 3. Dette technique

*(Toutes les dettes techniques sont résolues. Les DT-05 et DT-07 sont les dernières à avoir été fermées par le Lot 12.)*

| # | Élément | Statut | Fichier(s) | Priorité | Phase |
|---|---|---|---|---|---|
| DT-05 | DocumentChunk sans route API dédiée | ✅ Résolu par Lot 12 | `api/document-chunks/route.ts` (nouveau) | 🟡 Faible | D |
| DT-07 | Export PDF via `window.print()` | ✅ Résolu par Lot 12 | `export-pdf-page.tsx` (jspdf + html2canvas-pro) | 🟡 Faible | D |

### DT résolus depuis l'audit forensique

| # | Élément | Résolu par | Preuve |
|---|---|---|---|
| DT-01 | Build cassé (cadrage-page.tsx:332) | Lot 6 | `npx next build` → compiled successfully |
| DT-02 | Répertoires malformés `[_id[/` | Déjà absent (Lot 6 §0) | `ls` → n'existent pas |
| DT-03 | Mode « harper » absent | Lot 6 | `rg '"harper"' src/data/ai-writing-modes.ts` → 1 résultat |
| DT-04 | Routes sans tests | Lot 6 + Lot 6bis | 54 fichiers test, 1290 tests, 0 échec |
| DT-06 | Dualité AI config (DB + localStorage) | Lot 11 (décision E2) | Routes `/api/ai-config/*` + modèle Prisma `AiToolConfig` supprimés. `git diff pre-e2-ecat --stat` : 4 fichiers route + 1 modèle supprimés. Build ✅, 1263 tests |
| DT-08 | RoutesMe simule le multi-modèle | Lot 11 (décision E-Cat) | Renoncement assumé. Spécifications Horizon 2/3 archivées dans ROADMAP.md. Fonctionnalité conservée en l'état |
| DT-09 | CustomBookSkill jamais utilisé | Lot 11 (décision E-Cat) | Renoncement assumé. Modèle Prisma conservé (données existantes) mais aucun chantier prévu |
| DT-10 | Fiches corpus jamais consultables | Lot 11 (décision E-Cat) | Renoncement assumé. Fonctionnalité conservée en l'état, aucun chantier prévu |
| DT-11 | Sous-répertoires API non testés | Lot 6 + Lot 6bis | doctoral-toolbox (9 tests) + research-tabs/[id] (10 tests) |
| DT-12 | BUG-13 cause jamais identifiée | Lot 6 | Cause = mode invalide, corrigé par ajout dans WRITING_MODES |

---

## 4. Décisions tranchées

| # | Décision | Date | Choix retenu | Justification |
|---|---|---|---|---|
| E2 | Sort des routes `/api/ai-config/*` orphelines | Août 2025 (Lot 11) | **(a) Supprimer** | Zéro consommateur frontend. Modèle Prisma mort. Coût de reconstruction futur négligeable. Résout aussi DT-06 |
| E-Cat | Catalogue Horizon 2/3 | Août 2025 (Lot 11) | **Archiver (renoncement)** | Projet mono-utilisateur local. Auth, collaboration, plugins = périmètre SaaS. Résout DT-08, DT-09, DT-10 par renoncement assumé |

---

## 5. Historique des lots

| Lot | Date | Périmètre | Build | Tests | Lint | Rapport |
|---|---|---|---|---|---|---|
| Lot 1 | Juin 2025 | Correction BUG-01 à 06 + création module Cadrage (BUG-03) | ❌ Échec (cadrage-page.tsx:332) | Non vérifié | — | RAPPORT-LOT1-CORRECTIONS.md |
| Lot 2 | Juin 2025 | Persistance Boîte doctorale + Onglet recherche + Plan de thèse (parallèle Lot 3) | Non vérifié | 604 tests créés (puis perdus) | — | ❌ Aucun rapport produit |
| Lot 3 | Juin 2025 | Extension tests et corrections (parallèle Lot 2) | Non vérifié | 647 tests créés (puis perdus) | — | ❌ Aucun rapport produit |
| Lot 4-5 | Juin 2025 | Reconstruction tests (512+ perdus → 1 247 recréés) + corrections Lot 5 | Non vérifié | 1 247 tests, 50 fichiers | 0 erreurs, 152 warnings | ❌ Aucun rapport produit (worklog only) |
| Lot 5bis | Juil. 2025 | Vérifications et clôture. 3 tests CSL-JSON + 4 verification-publication | Non vérifié | 1 254 tests, 50 fichiers | 0 erreurs, 152 warnings | RAPPORT-LOT-5BIS-CLOTURE.md |
| Audit forensique | Août 2025 | État des lieux exhaustif (aucune correction) | ❌ Échec (cadrage-page.tsx:332) | 1 254 tests, 50 fichiers | 0 erreurs, 152 warnings | AUDIT-FORENSIQUE-THESISFRAME.md |
| Lot 6 | Août 2025 | 4 chantiers : (1) build, (2) Harper, (3) CRUD Part + structureMode, (4) tests | ✅ OK (49 routes) | 1 280 tests, 53 fichiers | 0 erreurs, 154 warnings | RAPPORT-LOT-6-CORRECTIONS.md |
| Lot 6bis | Août 2025 | Clarifications : §1 parentId/partId, §2 routes, §3 tests, §4 research-tabs/[id] | ✅ OK (49 routes) | 1 290 tests, 54 fichiers | — (non exécuté) | RAPPORT-LOT-6BIS-CLARIFICATIONS.md |
| Lot 7 | Août 2025 | Phase A : migration `parentId` → `partId` FK Prisma (onDelete: SetNull) | ✅ OK (49 routes) | 1 290 tests, 54 fichiers | 0 erreurs, 154 warnings | RAPPORT-LOT-7-CORRECTIONS.md |
| Lot 7bis | Août 2025 | Complément gouvernance : 4 points de conformité (aucune correction technique) | — (pas de build) | — (pas de tests) | 154 warnings (inchangé) | RAPPORT-LOT-7BIS-GOUVERNANCE.md |
| Lot 8 | Août 2025 | Phase B : 5 modes IA orphelins ajoutés dans WRITING_MODES | ✅ OK (49 routes) | 1 290 tests, 54 fichiers | 0 erreurs, 154 warnings | RAPPORT-LOT-8-CORRECTIONS.md |
| Lot 8bis | Août 2025 | Complément : vérification runtime des 5 modes (200 + contenu exploitable) | ✅ OK (49 routes) | 1 290 tests, 54 fichiers | 0 erreurs, 154 warnings | RAPPORT-LOT-8BIS-VERIFICATION.md |
| Lot 9 | Août 2025 | Phase C : vérification + correction de BUG-08/09/10/18/20 (5/5 annoncés à tort par Lot 2) | ✅ OK (49 routes) | 1 290 tests, 54 fichiers | 0 erreurs, 154 warnings | RAPPORT-LOT-9-VERIFICATION.md |
| Lot 9bis | Août 2025 | Complément : §7.1 fiabilité Lot 2 (0/7), 2 tests ciblés sortOrder (BUG-09), mise à jour ETAT-PROJET | ✅ OK (49 routes) | 1 292 tests, 54 fichiers | 0 erreurs, 154 warnings | RAPPORT-LOT-9BIS-VERIFICATION.md |
| Lot 10 | Août 2025 | Phase D partie 1 : vérification préalable BUG-22 → diagnostic audit obsolète, BUG-22 clos sans correction | — (aucune modif. code) | 1 292 tests, 54 fichiers | — (inchangé) | RAPPORT-LOT-10-VERIFICATION.md |
| Lot 11 | Août 2025 | Décisions E2 + E-Cat : suppression ai-config orphelines + archivage Horizon 2/3, fermeture DT-06/08/09/10 | ✅ OK (47 routes) | 1 263 tests, 52 fichiers | 0 erreurs, 122 warnings | RAPPORT-LOT-11-DECISIONS.md |
| Lot 12 | Août 2025 | Phase D nettoyage final : BUG-21,26,27,28,29,30,31,32,34 (9/9), DT-05, DT-07, suppression Box Cloud (#22) | ✅ OK (48 routes) | 1 277 tests, 53 fichiers | 0 erreurs, 122 warnings | RAPPORT-LOT-12-PHASE-D.md |

---

## 6. Métriques actuelles

| Métrique | Valeur | Dernière vérification |
|---|---|---|
| Build | ✅ Compiled successfully | Lot 12 |
| Tests | 1 277 passants, 0 échec, 53 fichiers | Lot 12 |
| Lint | 0 erreur, 122 warnings | Lot 12 |
| Routes API | 46 dynamiques + 2 pages statiques = 48 totales | Lot 12 |
| Modèles Prisma | 19 | Lot 11 |
| Fonctionnalités | 28 ✅ / 2 ⚠️ (archivés) / 1 🗑️ / 31 total | Lot 12 |
| Bugs ouverts | 0 BUG (BUG-20 avertissement mineur) + 0 mode orphelin | Lot 12 |
| Dette intégrité | ✅ Résolue (Lot 7) | Lot 7 |
| DT ouverte | 0 | Lot 12 |
| Décisions en attente | 0 | Lot 11 |

---

## 7. Rapports de fiabilité des lots antérieurs

> Après la découverte de deux cas H2-03 (Lot 2 affirmant un travail jamais réalisé), tout rapport antérieur à l'audit forensique est considéré **non fiable par défaut**. Seules les affirmations revérifiées avec preuve dans l'audit forensique ou dans les Lots 6/6bis font foi.

### 7.1 — Inventaire détaillé de la fiabilité du Lot 2

> Le Lot 2 (juin 2025) est le lot le plus problématique du projet. Il n'a produit aucun rapport structuré (seul un worklog). Sur les **7 affirmations vérifiables** depuis l'audit forensique, **zéro (0/7) est confirmée comme correctement exécutée par le Lot 2**.

| # | Affirmation du Lot 2 | Vérifié par | Résultat | Détail |
|---|---|---|---|---|
| 1 | Persistance Boîte doctorale (DB) | Lot 9bis (lecture de code) | ✅ Fonctionne, mais attribution Lot 2 fausse | Le mécanisme existe et fonctionne : Prisma `DoctoralToolbox` (schema:128), 3 endpoints API GET/POST/PUT (`api/thesis/[id]/doctoral-toolbox/route.ts`), `fetch()` réel dans `boite-doctorale-page.tsx:450-461,508-555`, debounce 1.5s, 9 tests passants. **Mais** : aucun commit git Lot 2, seul le worklog auto-rapporté, 0/7 affirmations Lot 2 vérifiées → attribution rejetée |
| 2 | Persistance Onglet recherche (DB) | Lot 9bis (lecture de code) | ✅ Fonctionne, mais attribution Lot 2 fausse | Le mécanisme existe et fonctionne : Prisma `ResearchTab` (schema:148-164), 5 endpoints API CRUD dans 2 fichiers route, React Query + `fetch()` dans `onglet-recherche-page.tsx:163-364`, debounce 1.5s, 16 tests passants. **Mais** : aucun commit git Lot 2, seul le worklog auto-rapporté, 0/7 affirmations Lot 2 vérifiées → attribution rejetée |
| 3 | Ajout FK `partId` avec contrainte (relation Part↔Chapter) | Lot 7 (audit + code) | ❌ Jamais fait | Le Lot 2 affirmait avoir migré `parentId` → `partId` avec FK. L'audit a prouvé que `parentId` était toujours en place. Lot 7 a réellement effectué cette migration |
| 4 | BUG-08 corrigé (props `onAddChapter`/`onDelete`) | Lot 9 (lecture de code) | ❌ Non corrigé | `ChapterTabs` et `ChapterHeader` n'avaient jamais reçu ces props. Corrigé par Lot 9 |
| 5 | BUG-09 corrigé (réordonnancement chapitres) | Lot 9 (lecture de code) | ❌ Non corrigé | Zéro ligne de code drag/reorder dans le module éditeur. Corrigé par Lot 9 |
| 6 | BUG-10 corrigé (`directorChatContext`) | Lot 9 (lecture de code) | ❌ Non corrigé | Aucun `thesisContext` passé au chat directeur. Corrigé par Lot 9 |
| 7 | 604 tests créés | Lot 9bis (traçabilité) | ❌ Non vérifiable indépendamment | Source primaire : `worklog.md` Task IDs 2-a (254 tests parsers), 2-b (260 tests schemas Zod), 2-c (90 tests utilitaires), total 604. Cité par `AUDIT-FORENSIQUE-THESISFRAME.md:110`. Ce sont des chiffres auto-rapportés par les agents du Lot 2 eux-mêmes — aucun commit git, aucune exécution `vitest` conservée, les fichiers `.test.ts` ont été perdus avant Lot 4-5. Lot 4-5 a reconstruit 1 247 tests différents. Le chiffre 604 ne peut être ni confirmé ni infirmé |

**Bilan : 0/7 confirmé correct.** Le Lot 2 est le seul lot du projet sans aucun rapport structuré et avec un taux de vérification négatif (toutes les affirmations revérifiables se sont avérées fausses ou non attribuables).

### 7.2 — Table de fiabilité

| Rapport | Fiabilité | Justification |
|---|---|---|
| RAPPORT-LOT1-CORRECTIONS.md | ⚠️ Partiellement fiable | Corrections BUG-01 à 06 vérifiées conformes. Mais : build non vérifié après intervention, et le module Cadrage créé (BUG-03) a introduit l'erreur de build DT-01 |
| Lot 2 (worklog seul) | ❌ Non fiable | **0/7 items revérifiés confirmés corrects.** Voir §7.1 pour l'inventaire exhaustif. Deux cas H2-03 confirmés (boîte doctorale/onglet recherche + Part↔Chapter). 3 bugs (08, 09, 10) annoncés corrigés mais non corrigés (vérifié Lot 9). Tests créés puis perdus. Aucun rapport structuré. |
| Lot 3 (worklog seul) | ❌ Non vérifiable | Aucun rapport. Les tests créés ont été perdus |
| Lot 4-5 (worklog seul) | ⚠️ Partiellement fiable | Reconstruction de tests documentée mais non vérifiable comme fonctionnellement équivalente à l'original |
| RAPPORT-LOT-5BIS-CLOTURE.md | ⚠️ Partiellement fiable | BUG-12 et BUG-23 déclarés ouverts alors qu'ils sont résolus (écarts D-01 et D-03 de l'audit) |
| AUDIT-FORENSIQUE-THESISFRAME.md | ⚠️ Partiellement fiable | Vérification directe du code, pré-règles de preuve. **Obsolescence confirmée sur BUG-22** (Lot 10) : le diagnostic « pas de rendu visuel vrai (liste de Cards textuels) » ne correspondait plus à l'état du code — 5 renderers CSS/HTML dédiés existent. Ce cas illustre que le catalogue de bugs de l'audit peut être obsolète sur des points où le code a évolué post-audit sans mise à jour du catalogue. |
| RAPPORT-LOT-6-CORRECTIONS.md | ✅ Fiable | Pré-règles de preuve respectées. Incohérence mineure sur le comptage de routes (§2 du Lot 6bis) |
| RAPPORT-LOT-6BIS-CLARIFICATIONS.md | ✅ Fiable | Pré-règles de preuve respectées |
| RAPPORT-LOT-7-CORRECTIONS.md | ✅ Fiable | Pré-règles de preuve respectées |
| RAPPORT-LOT-7BIS-GOUVERNANCE.md | ✅ Fiable | Vérifications indépendantes avec preuve |
| RAPPORT-LOT-8-CORRECTIONS.md | ✅ Fiable | Pré-règles de preuve respectées, validation explicite du périmètre |
| RAPPORT-LOT-9-VERIFICATION.md | ✅ Fiable | Pré-règles de preuve respectées, vérification avant correction, validation explicite du périmètre |
| RAPPORT-LOT-9BIS-VERIFICATION.md | ✅ Fiable | Complément gouvernance, tests ciblés ajoutés, mise à jour fiabilité Lot 2 |