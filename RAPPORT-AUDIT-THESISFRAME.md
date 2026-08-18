# Rapport d'Audit Complet — ThesisFrame

**Date** : Juillet 2025  
**Version auditée** : branche principale (commit courant)  
**Auditeur** : Agent T5 — Chef d'Orchestre  
**Projet** : ThesisFrame — Plateforme d'accompagnement doctoral  
**Chemin projet** : `/home/z/my-project`

---

## 1. Résumé exécutif

### État général

ThesisFrame est une plateforme d'accompagnement doctoral monopage (SPA) construite avec Next.js 16 (App Router + Turbopack), Prisma/SQLite, Zustand, Tiptap et shadcn/ui. L'application comporte **31 fonctionnalités** réparties sur **29 vues** navigables depuis un sidebar, **41 fichiers de routes API** exposant **61 handlers HTTP**, et **58 composants UI**.

### Bilan quantitatif

| Statut | Nombre | Proportion |
|---|---|---|
| **Fonctionnel** | 16 | 51,6 % |
| **Partiel** | 10 | 32,3 % |
| **Cassé / Non implémenté** | 5 | 16,1 % |
| **Total** | **31** | 100 % |

### Cinq constats principaux

1. **L'éditeur de thèse, cœur de l'application, contient deux bugs critiques de sauvegarde** : la sélection d'une thèse ne positionne pas `activeChapterId`, rendant toute sauvegarde (manuelle et auto-save) silencieusement inactive (T3-b-01) ; et l'auto-save écrase `plainText` et `wordCount` avec des valeurs vides (T3-b-02). Ces deux bugs se combinent pour rendre l'édition non fiable.

2. **Le module Cadrage est un fantôme complet** : 5 routes API CRUD opérationnelles, 3 modèles Prisma (`ThesisCadrage`, `ThesisCadrageField`, `ThesisCadrageVersion`), mais zéro composant frontend. Le bouton « Cadrage de la thèse » du dashboard redirige vers l'éditeur (T3-a-03). C'est une fonctionnalité spécifiée (FICHE_SYNTHESE §3.5) et codée côté backend mais inaccessible à l'utilisateur.

3. **Trois modes IA sont cassés par des IDs de mode invalides** : Vérification méthodologique (`"methodology-audit"` au lieu de `"methodology"`, T3-c), Journaux OA (`"suggestion"` inexistant dans `WRITING_MODES`, T3-c), et la vérification introduction/discussion (mismatch de noms de champs client/serveur, T2/E12). Ces trois bugs partagent un même schéma : l'API renvoie systématiquement une erreur 400 que l'utilisateur ne comprend pas.

4. **La persistance des données est inégale** : 5 modules (Méthodologie, Articles, Bases académiques, Boîte doctorale, Onglet de recherche) stockent leurs données uniquement dans l'état React ou `localStorage` sans aucune API/DB. La Boîte doctorale et l'Onglet de recherche perdent les données saisies au rechargement de la page.

5. **Aucun test automatisé n'existe** : Vitest est configuré en dépendance mais aucun fichier `.test.ts` ou `.spec.ts` n'est présent. Les 61 handlers API, les parsers BibTeX/RIS/CSL-JSON, le service RAG et toute la logique métier sont dépourvus de couverture de test.

---

## 2. Méthodologie suivie

### Scénario de test

- **Discipline tirée au hasard** : Géographie
- **Thème de thèse** : *Les représentations sociales du changement climatique*
- **Type de recherche** : Quantitative

Ce scénario a été utilisé par l'agent T3-a pour guider les tests de création et de cadrage.

### Environnement de test

| Composant | Détail |
|---|---|
| OS | Sandbox Linux isolé |
| Runtime | Node.js (version du projet) |
| Framework | Next.js 16 avec Turbopack (dev mode) et production standalone |
| Base de données | SQLite via Prisma ORM |
| Navigateur | Chromium headless (agent-browser CDP) |
| Serveur dev | `next dev --turbopack` sur port 3000 |

### Outils utilisés

- **Agent-browser** : navigation CDP, capture de snapshots, interception réseau
- **Analyse statique** : lecture et traçage du code source (routes, composants, hooks, schémas)
- **API testing** : requêtes `fetch` directes contre le serveur de production standalone
- **Zod schema tracing** : vérification des schémas de validation entrée/sortie
- **Prisma schema analysis** : vérification des modèles, relations et contraintes

### Limite du browser testing (sandbox isolation)

Le serveur de développement Next.js 16 Turbopack présente une instabilité sévère en environnement sandbox : le processus meurt silencieusement après la première compilation de page (~12-14 secondes). Cela a empêché les tests E2E complets de saisie de formulaire et de soumission. Deux sessions browser partielles ont pu être capturées avant les crashs.

En conséquence, les agents T3-c et T4 ont pivoté vers une **analyse statique complète du code source** pour valider les comportements. Les conclusions sont donc fondées sur :
- 2 sessions browser partielles (dashboard, création, éditeur) + 12 sessions de test de modules complémentaires (T3-d)
- Tracé complet du flux de données pour chaque fonctionnalité testée
- Tests API directs via `fetch` contre le serveur standalone (T4)

---

## 3. Inventaire des fonctionnalités et statuts

### 3.1 Tableau complet (31 fonctionnalités)

| # | Fonctionnalité | Module/Fichier | Statut | API | Testée | Note |
|---|---|---|---|---|---|---|
| 1 | Tableau de bord | `components/dashboard/dashboard-page.tsx` (519 lignes) | ✅ Fonctionne | `GET /api/stats` | Oui (T3-a) | 4 stat cards, 6 actions rapides, grille 14 modules, guide démarrage |
| 2 | Éditeur de thèse (Tiptap) | `modules/editor/` (2 041 lignes, 7 fichiers) | ⚠️ Partiel | `CRUD /api/thesis`, `CRUD /api/chapters`, `POST /api/text-prediction` | Oui (T3-b) | Tiptap 7 extensions, frappe OK, **sauvegarde cassée** (T3-b-01, T3-b-02), prédiction IA fonctionnelle |
| 3 | Assistant IA d'écriture (11 modes) | `modules/ai-writing/ai-writing-page.tsx` (426 lignes) | ⚠️ Partiel | `POST /api/ai-writing` | Oui (T3-c) | 11 modes (doc dit 10), icône SpellCheck manquante, mode grammaire borderline doctrine |
| 4 | Chat Directeur de thèse | sous-composant dans ai-writing | ✅ Fonctionne | `POST /api/directeur-chat` | Oui (T3-c, T4) | Persona Pr. Renaud, doctrine critique-only respectée, corpus injecté |
| 5 | Références bibliographiques | `modules/references/references-page.tsx` (846 lignes) | ✅ Fonctionne | `CRUD /api/references`, `POST /import`, `GET /bibtex` | Oui (T3-d, T4) | CRUD, filtres, favoris, import BibTeX/RIS/CSL-JSON, export .bib |
| 6 | Méthodologie (guides) | `modules/methodology/methodology-page.tsx` (505 lignes) | ⚠️ Partiel | — | Non | Contenu riche mais purement statique, aucune persistance |
| 7 | Articles scientifiques (IMRaD) | `modules/articles/articles-page.tsx` (495 lignes) | ⚠️ Partiel | — | Non | Guide IMRaD + checklists, purement statique |
| 8 | Plan de thèse + LaTeX | `modules/thesis-plan/thesis-plan-page.tsx` (642 lignes) | ⚠️ Partiel | `GET /api/thesis` | Oui (T3-a, T3-b) | Template LaTeX OK, **toggle structure mode trompeur** (T3-a-02), pas de CRUD Parties |
| 9 | Outils IA (carnet + consensus) | `modules/ai-tools/ai-tools-page.tsx` (1 083 lignes) | ✅ Fonctionne | `CRUD /api/sources`, `CRUD /api/entries`, `POST /api/ai-writing` | Non (T4 API) | Carnet CRUD, entrées Q&A, analyse consensus |
| 10 | Bases de données académiques | `modules/academic-db/academic-db-page.tsx` (425 lignes) | ⚠️ Partiel | — | Non | Répertoire 27 bases, liens externes, filtrage local |
| 11 | Journaux Open Access | `modules/journaux-oa/journaux-oa-page.tsx` (887 lignes) | ⚠️ Partiel | `GET /api/journaux-oa`, `POST /api/ai-writing` | Oui (T3-c) | Recherche OpenAlex+DOAJ OK, **classement IA cassé** (T3-c: mode "suggestion" invalide) |
| 12 | Recherche plein texte | `modules/recherche-plein-texte/` (595 lignes) | ✅ Fonctionne | `GET /api/search` | Non | Opérateurs booléens, snippets, scoring, filtres |
| 13 | Auto-édition 8C | `modules/auto-edition/auto-edition-page.tsx` (1 927 lignes) | ⚠️ Partiel | `POST /api/ai-writing`, `POST /api/verification-publication` | Oui (T2, T3-c, T4) | 8 critères, checklist, **vérification intro/discussion cassée** (T2/E12), conflit prompt 8C/peer-review |
| 14 | Feuille de route agile (Kanban) | `modules/feuille-route-agile/` (1 054 lignes) | ✅ Fonctionne | `CRUD /api/sprints`, `CRUD /api/stories`, `POST /api/ai-writing` | Non | 5 phases, drag & drop, story points |
| 15 | Déblocage écriture | `modules/deblocage-ecriture/` (1 340 lignes) | ✅ Fonctionne | `POST /api/ai-writing` | Non | Diagnostic, exercices, Pomodoro 25/5, suivi mots |
| 16 | Outils SLR (PRISMA) | `modules/outils-slr/` (1 563 lignes) | ✅ Fonctionne | `POST /api/ai-writing` | Oui (T3-d) | Diagramme PRISMA, criblage, extraction, export CSV |
| 17 | Analyse du champ de recherche | `modules/analyse-champ-recherche/` (1 334 lignes) | ✅ Fonctionne | `POST /api/ai-writing` | Non | Cartographie IA, lacunes, positionnement |
| 18 | APA Compositeur | `modules/apa-composer/` (1 421 lignes) | ✅ Fonctionne | `POST /api/ai-writing` | Oui (T3-d) | Formatage APA 7e, 10+ types, bibliographie, temps réel |
| 19 | Vérification méthodologique | `modules/verification-methodo/` (1 356 lignes) | 🔴 Cassé | `POST /api/ai-writing` | Oui (T3-c) | **Toutes les fonctions IA cassées** : mode "methodology-audit" invalide |
| 20 | Vérification cartographique | `modules/verification-carto/` (1 532 lignes) | ✅ Fonctionne | `CRUD /api/elements-analyse`, `GET/POST /api/types-analyse`, `POST /api/verification-carto`, `GET /api/geo-mcp` | Oui (T3-c) | Module A rule-based + Module B socratique LLM, bien architecturé |
| 21 | Boîte doctorale | `modules/boite-doctorale/` (837 lignes) | ⚠️ Partiel | — | Oui (T3-d) | Checklists, suivi, **persistance non fiable** (T3-d-03, T3-d-04) |
| 22 | Box Cloud | `modules/box-cloud/` (834 lignes) | ⚠️ Partiel | — | Oui (T3-d) | Interface complète mais entièrement simulée (INITIAL_FILES codé en dur) |
| 23 | RoutesMe (multi-modèles) | `modules/routesme/` (838 lignes) | ✅ Fonctionne | `POST /api/ai-writing` | Non | Comparaison côte à côte multi-fournisseurs |
| 24 | Livres & Compétences | `modules/livres-competences/` (1 175 lignes) | ✅ Fonctionne | `POST /api/ai-writing` | Non | Suivi compétences, 7 domaines |
| 25 | Onglet de recherche | `modules/onglet-recherche/` (1 003 lignes) | ⚠️ Partiel | — | Oui (T3-d) | Onglets, notes, **données perdues au rechargement** (T3-d-05) |
| 26 | Grammaire IA | `modules/grammaire/` (660 lignes) | ⚠️ Partiel | `POST /api/ai-writing` | Oui (T3-d, T3-c) | **Rendu cassé** : affiche `[object Object]` au lieu du texte corrigé (T3-d-01), détection erreurs faible (T3-d-06) |
| 27 | Export PDF | `modules/export-pdf/` (1 170 lignes) | ✅ Fonctionne | `GET /api/thesis`, `GET /api/thesis/[id]/chapters` | Oui (T3-d) | Génération PDF côté client, page de garde |
| 28 | Équilibre des chapitres | `modules/equilibre-chapitres/` (838 lignes) | ⚠️ Partiel | `GET /api/thesis`, `POST /api/ai-writing` | Oui (T3-d) | Affiche 0 mots sans contexte thèse sélectionnée |
| 29 | Diagrammes visuels | `modules/diagrammes/` (1 641 lignes) | ⚠️ Partiel | `POST /api/ai-writing` | Oui (T3-d) | CRUD nœuds texte, **pas de rendu visuel** (pas de SVG/canvas), export non fonctionnel |
| 30 | Harper (résumé/paraphrase) | `modules/harper/` (915 lignes) | ⚠️ Partiel | `POST /api/ai-writing` | Oui (T3-d) | UI OK, **échec silencieux de l'IA** : aucun résultat affiché (T3-d-02) |
| 31 | Mon IA de thèse (RAG) | `modules/thesis-rag/` (435 lignes) | ✅ Fonctionne | `POST /api/thesis-rag` | Oui (T3-d) | Chat contextuel, 4 sources indexées, garde-fous sans thèse |

### 3.2 Fonctionnalités spécifiées mais absentes

| # | Fonctionnalité | Source | Statut | Détail |
|---|---|---|---|---|
| F1 | **Cadrage de thèse (UI)** | FICHE_SYNTHESE §3.5, §1.2 | Routes existantes, UI absente | 5 routes API CRUD + 3 modèles Prisma opérationnels, mais aucun composant frontend. Le bouton dashboard redirige vers l'éditeur. |
| F2 | **Authentification utilisateur** | FICHE_SYNTHESE §1.1 (NextAuth v4) | Absente | NextAuth v4 listé en dépendance mais aucun middleware, login/logout ou guard de route. |
| F3 | **Gestion des licences** | Modèle Prisma `LicenseKey` | Absente | Modèle en base (keyHash, licenseType, email, expiresAt) mais aucune UI ni logique de validation. |
| F4 | **Orchestration corpus côté frontend** | `INDEX-routage.md` | Partielle | L'orchestration est implémentée côté serveur (`detectRelevantFiches`), mais aucun indicateur frontend ne montre quelles fiches sont actives. |
| F5 | **Fiches 01-06 : interface de consultation** | 6 fiches dans `upload/files-extracted/` | Absente | Les fiches sont injectées comme contexte dans les prompts IA mais ne sont jamais affichées à l'utilisateur. |

### 3.3 Écarts architecturaux

| # | Écart | Sévérité | Détail |
|---|---|---|---|
| E1 | **13 modules IA partagent un seul endpoint** `/api/ai-writing` | 🟡 Moyen | Grammaire, Harper, RoutesMe, EquilibreChapitres, Diagrammes, LivresCompetences, AnalyseChampRecherche, VerificationMethodo, DeblocageEcriture, OutilsSLR, AutoEdition, FeuilleRouteAgile, JournauxOA utilisent tous `POST /api/ai-writing` avec un `mode` différent. Point de défaillance central. |
| E2 | **Double gestion config IA** (localStorage + DB) | 🟡 Moyen | `AiToolConfig` en Prisma (CRUD via `/api/ai-config`, jamais appelé) vs. `localStorage` (clé `thesisframe-ai-config`, réellement utilisé). Redondance. |
| E3 | **5 modules sans persistance** | 🟡 Moyen | Methodology, Articles, AcademicDb (statiques — acceptable). Mais BoiteDoctorale, OngletRecherche ont des données utilisateur volatiles. |
| E4 | **Box Cloud est un faux module** | 🔴 Critique | 834 lignes, interface complète, entièrement simulée avec `INITIAL_FILES` codé en dur. Aucun upload réel, aucune API. |
| E5 | **0 test automatisé** | 🔴 Critique | Vitest configuré mais aucun fichier de test. Aucune couverture pour les 61 handlers, parsers BibTeX/RIS, service RAG, logique métier. |
| E6 | **Pas de middleware Next.js** | 🟠 Faible | Aucun middleware pour auth, rate limiting, logging. Tous les endpoints API sont publics. |
| E7 | **Reference et ResearchSource non liés** | 🟠 Faible | Deux modèles Prisma entièrement séparés sans relation. Aucune synchronisation possible. |
| E8 | **SPA monopage dans App Router** | 🟠 Faible | Toute l'application est une SPA via Zustand `currentView`. Pas de routing Next.js réel, pas de liens directs, pas de back/forward. |
| E9 | **RAG keyword-only (pas de vector DB)** | 🟠 Faible | Recherche par mots-clés case-insensitive dans SQLite. Pas d'embeddings, pas de similarité sémantique. |
| E10 | **Export PDF côté client** | 🟠 Faible | Génération PDF entièrement côté navigateur. Pas de template serveur, qualité limitée. |

---

## 4. Points forts

| # | Point fort | Preuve |
|---|---|---|
| PS-01 | **Doctrine critique-only du directeur parfaitement spécifiée** | `src/data/directeur-prompt.ts` lignes 36 et 62-63 : 3 points de renforcement (« JAMAIS en génération de substitution », « pas de texte prêt à copier-coller », « JAMAIS de réécriture »). Vérifié par analyse de prompt T3-c et T4 (tests A1-A4). |
| PS-02 | **Orchestration corpus publication avec max 2 fiches par interaction** | `src/data/corpus-publication.ts` ligne 198 : `maxFichesPerInteraction: 2`. Fonction `detectRelevantFiches()` avec scoring par signaux et `.slice(0, maxFiches)` ligne 227. Conforme au principe INDEX-routage.md. |
| PS-03 | **Vérification cartographique bien architecturée** | Séparation claire Module A (rule-based, 0 LLM) / Module B (socratique, prompt strict) / Module C (geo-enrich MCP). Filtre post-traitement `filtrerQuestionsValides()` supprime les non-questions. T3-c : statut « ✅ Fonctionne ». |
| PS-04 | **Validation d'entrée robuste sur les API critiques** | Zod schemas sur toutes les routes CRUD. T4 B3-B3c : création de thèse avec titre/auteur vide → HTTP 400 avec messages clairs en français. T4 D10a-D10b : références avec champs manquants → 400. |
| PS-05 | **APA Compositeur en temps réel** | Formatage APA 7e correct et instantané vérifié par T3-d : `Smith, J. A. (2023). The impact of AI on academic writing. *Journal of Academic Writing*, *15*(3), 45-67.` avec citations in-text `(Smith, 2023)`. |
| PS-06 | **Persistance fiable pour références et carnet** | T4 F13 : référence créée (HTTP 201) puis retrouvée par recherche (GET). T4 F14 : entrée carnet créée puis récupérée. Données DB correctement persistées. |
| PS-07 | **Module SLR (PRISMA) complet et interactif** | T3-d : 6 onglets, spinbuttons éditables, champs PICO pré-remplis, cases bases de données. Interface riche et fonctionnelle. |
| PS-08 | **Export BibTeX fonctionnel** | T3-d : création de référence « Smith, J.; Doe, A. — Test Reference for E2E Testing, 2024 » puis export BibTeX téléchargeable. |
| PS-09 | **Garde-fous sans contexte thèse** | T3-d : RAG affiche « Sélectionnez d'abord une thèse dans l'éditeur » et désactive toutes les fonctions. T4 B6 : Export PDF désactive les onglets sans thèse. |
| PS-10 | **Prédiction IA (ghost text) opérationnelle** | T3-b : POST `/api/text-prediction` retourne 200, `PredictionPopup` via `createPortal` s'affiche brièvement. Fonctionnalité API validée. |
| PS-11 | **Renommage de chapitre en ligne** | T3-b : clic sur titre → champ input → « Introduction générale et problématique » → PUT 200. Édition inline fonctionnelle. |
| PS-12 | **Détection de journaux prédateurs** | T3-c : panneau dépliable avec 5 signaux d'alerte, 3 signaux de légitimité, verdict coloré (vert/ambre/rouge). Approche utilisateur, pas IA. |
| PS-13 | **DORA principle intégré dans Journaux OA** | T3-c : encart d'information DORA en haut du module, sensibilisation du doctorant. |
| PS-14 | **RAG indexe 4 sources de données** | FICHE_SYNTHESE §2.11 : chapitres (plainText), références (abstract/notes), entrées carnet (Q&A), champs de cadrage. Architecture complète. |

---

## 5. Points faibles et anomalies

### Légende de sévérité

- 🔴 **Bloquant** : fonctionnalité complètement inutilisable, perte de données, ou écart doctrinal
- 🟠 **Majeur** : fonctionnalité dégradée, résultat incorrect, ou manque critique
- 🟡 **Mineur** : fonctionnalité partielle, UX dégradée, ou manque modéré
- ⚪ **Cosmétique** : label, libellé, ou présentation non conforme

### 5.1 Anomalies bloquantes

| ID | Fonctionnalité | Statut | Étapes de reproduction | Preuve | Sévérité |
|---|---|---|---|---|---|
| **BUG-01** | Sauvegarde éditeur — `activeChapterId` non positionné | 🔴 Cassé | 1. Ouvrir l'éditeur → 2. Cliquer sur une thèse dans la liste → 3. Taper du texte → 4. Cliquer « Sauvegarder » → 5. Aucune requête réseau | `src/modules/editor/components/thesis-list-panel.tsx` ligne 66 : `setActiveThesisId(thesis.id)` sans `setActiveChapterId()`. `editor-page.tsx` : `handleEditorUpdate` vérifie `if (!activeChapterId) return;` | 🔴 Bloquant |
| **BUG-02** | Auto-save écrase `plainText` et `wordCount` | 🔴 Cassé | 1. Sélectionner une thèse puis un chapitre → 2. Taper du texte → 3. Attendre 2.5s (débounce) → 4. Vérifier la DB : plainText="" et wordCount=0 | `src/modules/editor/editor-page.tsx` lignes 37-48 : callback `onSave` envoie systématiquement `plainText: ""` et `wordCount: 0` | 🔴 Bloquant |
| **BUG-03** | UI Cadrage absente (5 routes orphelines) | 🔴 Absent | 1. Cliquer « Cadrage de la thèse » sur le dashboard → 2. Navigue vers l'éditeur (mauvaise destination) → 3. Aucune page de cadrage n'existe | `src/components/dashboard/dashboard-page.tsx` ligne 217 : `setCurrentView("editor")` au lieu d'une vue cadrage. 5 routes `/api/cadrages/*` sans consommateur frontend. | 🔴 Bloquant |
| **BUG-04** | Vérification méthodologique — mode IA invalide | 🔴 Cassé | 1. Ouvrir Vérification méthodologique → 2. Saisir un texte → 3. Cliquer « Lancer l'audit IA » → 4. Erreur 400 : « Mode d'écriture non trouvé » | `src/modules/verification-methodo/verification-methodo-page.tsx` lignes 500 et 583 : `mode: "methodology-audit"` ne figure pas dans `WRITING_MODES` (le bon ID est `"methodology"`) | 🔴 Bloquant |
| **BUG-05** | Vérification intro/discussion — mismatch champs client/serveur | 🔴 Cassé | 1. Ouvrir Auto-édition → 2. Onglet « Vérifications publication » → 3. Saisir intro + discussion → 4. Cliquer vérifier → 5. Erreur 400 : champs requis manquants | Client (`auto-edition-page.tsx` L592) envoie `{introduction, discussion}`. Serveur (`verification-publication/route.ts` L59-60) attend `{introductionText, discussionText}`. Fonctionnalité totalement inactive. | 🔴 Bloquant |
| **BUG-06** | Réponse IA affiche `[object Object]` | 🔴 Cassé | 1. Configurer un provider IA → 2. Appeler /api/ai-writing ou /api/directeur-chat → 3. Réponse affiche `[object Object]` au lieu du contenu | `src/lib/ai/zai-client.ts` lignes 67-72 : `String(response)` quand `response.content` est falsy mais `response` est un objet. T4 D11a/D11d : HTTP 200 avec `"content":"[object Object]"`. | 🔴 Bloquant |
| **BUG-07** | Parties de thèse — pas de CRUD | 🔴 Absent | 1. Ouvrir Plan de thèse → 2. Sélectionner « Par parties » → 3. Aucun bouton pour créer/gérer des parties → 4. Le modèle `Part` Prisma existe mais est inutilisé | `Part` dans `prisma/schema.prisma` (id, thesisId, title, sortOrder). Aucune route API POST/PUT/DELETE pour Part. Aucun composant frontend. | 🔴 Bloquant |

### 5.2 Anomalies majeures

| ID | Fonctionnalité | Statut | Étapes de reproduction | Preuve | Sévérité |
|---|---|---|---|---|---|
| **BUG-08** | Ajout/suppression de chapitres depuis l'éditeur | 🔴 Cassé | 1. Ouvrir l'éditeur → 2. Chercher un bouton « + » ou « Supprimer » chapitre → 3. Absent | `ChapterTabs` supporte `onAddChapter` (bouton « + »), `ChapterHeader` supporte `onDelete` (icône Trash2), mais `editor-page.tsx` ne passe ni l'un ni l'autre. Hooks `useCreateChapter` et `useDeleteChapter` existants mais inaccessibles. | 🟠 Majeur |
| **BUG-09** | Réorganisation des chapitres (drag & drop) | 🔴 Absent | 1. Ouvrir l'éditeur → 2. Chercher à réordonner les chapitres → 3. Aucune fonctionnalité | `sortOrder` dans Prisma mais non exposé via API PUT. Aucun composant drag-and-drop. | 🟠 Majeur |
| **BUG-10** | Feedback directeur non intégré dans l'éditeur | 🔴 Absent | 1. Sélectionner du texte dans l'éditeur → 2. Chercher un bouton « Feedback directeur » → 3. Absent | Le champ `directorFeedback` existe dans Prisma et les schémas API mais aucun consommateur UI dans l'éditeur. Disponible uniquement comme chat standalone. | 🟠 Majeur |
| **BUG-11** | Classement IA des journaux OA | 🔴 Cassé | 1. Rechercher des journaux → 2. Cliquer « Classer par IA » → 3. Erreur 400 : mode invalide | `src/modules/journaux-oa/journaux-oa-page.tsx` ligne 266 : `mode: "suggestion"` n'existe pas dans `WRITING_MODES` | 🟠 Majeur |
| **BUG-12** | Grammaire — affiche `[object Object]` | ⚠️ Partiel | 1. Ouvrir Grammaire IA → 2. Saisir un texte avec des erreurs → 3. Cliquer « Analyser » → 4. Onglet « Texte corrigé » affiche `[object Object]` | T3-d-01 : rendu du résultat JSON comme chaîne au lieu d'extraire `correctedText`. Même cause racine que BUG-06. | 🟠 Majeur |
| **BUG-13** | Harper IA — échec silencieux | ⚠️ Partiel | 1. Ouvrir Harper → 2. Saisir un texte → 3. Cliquer « Résumer » → 4. « Aucune opération récente » affiché, aucun résultat | T3-d-02 : l'appel IA se termine sans erreur visible mais aucun résultat n'est affiché. Pas de feedback utilisateur. | 🟠 Majeur |
| **BUG-14** | Boîte doctorale — données perdues au rechargement | ⚠️ Partiel | 1. Ouvrir Boîte doctorale → 2. Cocher une étape → 3. Recharger la page → 4. La coche est perdue | T3-d-03 : persistance via mécanisme non fiable. Données nouvelles non persistées contrairement aux données pré-existantes. | 🟠 Majeur |
| **BUG-15** | Onglet de recherche — données perdues au rechargement | ⚠️ Partiel | 1. Ouvrir Onglet de recherche → 2. Créer « Onglet 2 » avec des notes → 3. Recharger → 4. « Onglet 2 » a disparu | T3-d-05 : tout en état React local + localStorage. Nouveaux onglets non persistés. | 🟠 Majeur |
| **BUG-16** | Mismatch funnelStructure intro/discussion | ⚠️ Partiel | (Secondaire à BUG-05 — ne se manifeste que si BUG-05 est corrigé) | Client : `IntroDiscussionResult.funnelStructure = { hasInvertedFunnel: boolean, score: number, details: string }`. Prompt serveur attend `{ score: 0-10, comment: "..." }`. Champs `hasInvertedFunnel` et `details` seront `undefined`. | 🟠 Majeur |
| **BUG-17** | `corpus-publication.ts` sans retours à la ligne (0 newline) | ⚠️ Partiel | 1. Tenter un build Webpack (non Turbopack) → 2. Échec de compilation | T3-a-06 : fichier de 30 Ko en ligne unique. Provoque une erreur de build avec Webpack. Fonctionne avec Turbopack dev mode. | 🟠 Majeur |

### 5.3 Anomalies mineures

| ID | Fonctionnalité | Statut | Étapes de reproduction | Preuve | Sévérité |
|---|---|---|---|---|---|
| **BUG-18** | Formulaire création thèse — champs manquants | ⚠️ Partiel | 1. Ouvrir « Créer une thèse » → 2. Formulaire affiche 6 champs → 3. `email` et `laboratory` absents | `src/modules/editor/components/create-thesis-dialog.tsx` : pas de state/Input pour `email` et `laboratory`. API et Prisma les supportent. | 🟡 Mineur |
| **BUG-19** | Toggle structure mode — trompeur | ⚠️ Partiel | 1. Ouvrir Plan de thèse → 2. Choisir « Par parties » → 3. Le template LaTeX change mais pas la structure DB | `src/modules/thesis-plan/thesis-plan-page.tsx` lignes 398, 403-405 : le sélecteur ne modifie que la sortie LaTeX, pas `thesis.structureMode` en DB. | 🟡 Mineur |
| **BUG-20** | Grammaire — « Aucune erreur détectée » sur texte avec erreurs | ⚠️ Partiel | 1. Saisir un texte avec des fautes d'orthographe évidentes → 2. Cliquer « Analyser » → 3. « Aucune erreur détectée » | T3-d-06 : détection IA peu performante (probablement liée au parsing `[object Object]` de BUG-06/BUG-12). | 🟡 Mineur |
| **BUG-21** | Diagrammes — export non fonctionnel | ⚠️ Partiel | 1. Créer un diagramme → 2. Cliquer « Exporter » → 3. Aucune action, aucun dialogue, aucun téléchargement | T3-d-07 : bouton sans handler fonctionnel. | 🟡 Mineur |
| **BUG-22** | Diagrammes — pas de rendu visuel | ⚠️ Partiel | 1. Ajouter des nœuds → 2. Aucun SVG/canvas ne s'affiche → 3. Liste de texte seulement | T3-d : les nœuds sont gérés comme liste textuelle. Pas de moteur de rendu graphique (Mermaid, D3, etc.). | 🟡 Mineur |
| **BUG-23** | Équilibre des chapitres — données vides | ⚠️ Partiel | 1. Ouvrir Équilibre des chapitres → 2. Affiche 0 mots, 0 chapitres | T3-d : pas de sélecteur de thèse visible. Fonctionne probablement quand une thèse est sélectionnée dans l'éditeur. | 🟡 Mineur |
| **BUG-24** | Compteur Boîte doctorale désynchronisé | ⚠️ Partiel | 1. Ouvrir Boîte doctorale → 2. Cocher 1 item → 3. Compteur affiche « 0/7 » au lieu de « 1/7 » | T3-d-04 : logique de compteur incohérente avec l'état des checkboxes. | 🟡 Mineur |
| **BUG-25** | 11 modes IA au lieu de 10 (écart doc/réalité) | ⚠️ Partiel | 1. Lire la documentation → 2. « 10 modes spécialisés » → 3. `WRITING_MODES` contient 11 entrées | `src/data/ai-writing-modes.ts` : 11 modes déclarés. Documentation et UI mentionnent « 10 modes ». | 🟡 Mineur |
| **BUG-26** | Icône SpellCheck manquante pour mode grammaire | ⚠️ Partiel | 1. Ouvrir Assistant IA → 2. Mode « Correcteur grammatical » → 3. Icône Sparkles affichée au lieu de SpellCheck | `src/modules/ai-writing/ai-writing-page.tsx` lignes 35-46 : `ICON_MAP` ne contient pas `SpellCheck`. Fallback vers Sparkles. | 🟡 Mineur |
| **BUG-27** | Conflit de prompts Auto-édition 8C | ⚠️ Partiel | 1. Ouvrir Auto-édition → 2. Lancer analyse 8C → 3. Le système prompt peer-review (10 critères article) est préfixé au prompt 8C spécifique | `src/modules/auto-edition/auto-edition-page.tsx` : `mode: "peer-review"` insère un prompt système de relecture d'article, en conflit avec le prompt 8C par critère. Contournement via regex JSON (L408). | 🟡 Mineur |
| **BUG-28** | Recherche par tags dans le carnet non fonctionnelle | ⚠️ Partiel | 1. Créer une entrée carnet avec des tags → 2. Rechercher par un tag → 3. Aucun résultat | T4 F14 : API `/api/entries` ne recherche que dans les champs `question` et `answer`, pas `tags`. | 🟡 Mineur |

### 5.4 Anomalies cosmétiques / limites UX

| ID | Fonctionnalité | Statut | Détail | Sévérité |
|---|---|---|---|---|
| **BUG-29** | Avertissements Tiptap (console) | ✅ Fonctionne | `Duplicate extension names found: ['link', 'underline']` (StarterKit + imports séparés). `immediatelyRender` non explicité. | ⚪ Cosmétique |
| **BUG-30** | Avertissements accessibilité (console) | ✅ Fonctionne | DialogContent sans Description (shadcn/ui). Aucun impact fonctionnel. | ⚪ Cosmétique |
| **BUG-31** | Erreur 500 au lieu de 400 pour JSON invalide | ⚠️ Partiel | POST `/api/thesis` avec body JSON invalide → 500 au lieu de 400. `request.json()` lance SyntaxError capturé par catch générique. | ⚪ Cosmétique |
| **BUG-32** | Erreur 500 au lieu de 400 pour prompt < 10 caractères | ⚠️ Partiel | POST `/api/ai-writing` avec prompt court → ZodError renvoyé comme 500. | ⚪ Cosmétique |
| **BUG-33** | OA_TYPE_COLORS incomplet | ✅ Fonctionne | `journaux-oa-page.tsx` : pas d'entrée pour tous les statuts OpenAlex possibles (fallback « Or »). | ⚪ Cosmétique |
| **BUG-34** | Pas d'avertissement taille avant envoi IA | ⚠️ Partiel | Auto-édition : pas de validation de taille du texte avant envoi à l'IA (risque de dépasser les tokens). | ⚪ Cosmétique |

### 5.5 Récapitulatif par sévérité

| Sévérité | Nombre | IDs |
|---|---|---|
| 🔴 Bloquant | 7 | BUG-01, BUG-02, BUG-03, BUG-04, BUG-05, BUG-06, BUG-07 |
| 🟠 Majeur | 10 | BUG-08 à BUG-17 |
| 🟡 Mineur | 11 | BUG-18 à BUG-28 |
| ⚪ Cosmétique | 6 | BUG-29 à BUG-34 |
| **Total** | **34** | — |

---

## 6. Écarts par rapport à la doctrine du produit

### 6.1 Frontière critique / génération

| Aspect | Doctrine | Constat |
|---|---|---|
| Chat Directeur | Critique uniquement, jamais génération de substitution | ✅ **Respecté** — Prompt système (L36, L62-63) avec 3 points de renforcement. Aucun mode de génération dans le chat directeur. Vérifié T3-c, T4 (A1-A4). |
| Assistant IA | Génération autorisée (outil d'écriture) | ✅ **Respecté** — 11 modes dont la majorité sont analytiques ou générateurs. Le mode « grammatire » génère du texte corrigé (exception légitime). |
| Vérification carto | Aucune interprétation par l'IA | ✅ **Respecté** — Module A rule-based (0 LLM). Module B pose uniquement des questions ouvertes, filtrage post-traitement supprime les déclarations. |
| Auto-édition 8C | Analyse critique, pas substitution | ✅ **Respecté** — Sorties : scores, recommandations, détails. Pas de texte de remplacement généré. |

### 6.2 Caractère non verrouillant du cadrage

| Aspect | Doctrine | Constat |
|---|---|---|
| Cadrage préalable avant IA | Le cadrage devrait encadrer les interactions IA | ⚠️ **Non vérifiable** — Le module Cadrage n'a pas d'UI (BUG-03). Il est donc impossible de tester si le cadrage est verrouillant ou non. Le RAG indexe les champs de cadrage (FICHE_SYNTHESE §2.11) mais l'utilisateur ne peut pas les remplir. |
| Cadrage = prérequis bloquant | Vérification carto utilise un préalable bloquant (FICHE_SYNTHESE L646) | ✅ **Respecté** (dans verification-carto) — Phase 1 bloquante tant que le préalable est incomplet. Mais ce mécanisme est spécifique à ce module et n'est pas généralisé. |

### 6.3 Respect du gabarit institutionnel

| Aspect | Doctrine | Constat |
|---|---|---|
| 7 chapitres par défaut | Introduction, Revue de littérature, Cadre théorique, Méthodologie, Résultats, Discussion, Conclusion | ✅ **Respecté** — `src/app/api/thesis/route.ts` lignes 43-51 créent exactement ces 7 chapitres avec numérotation romaine I-VII. |
| Structure parties/chapitres | Deux modes de structure (chapitres seuls, parties et chapitres) | ❌ **Non respecté** — Le modèle `Part` Prisma existe mais aucun CRUD API, aucun UI. Le toggle dans le plan de thèse ne modifie que le template LaTeX (BUG-19, BUG-07). |
| Numérotation romaine | Chapitres numérotés I, II, III... | ✅ **Respecté** — Chapitres créés avec `title: "I. Introduction"` etc. |

### 6.4 Max 2 fiches par interaction

| Aspect | Doctrine | Constat |
|---|---|---|
| Orchestration corpus | « Une à deux fiches chargées par interaction, jamais l'ensemble » (INDEX-routage.md) | ✅ **Respecté** — `corpus-publication.ts` L198 : `maxFichesPerInteraction: 2`. `detectRelevantFiches()` utilise `.slice(0, maxFiches)` L227. |
| Indicateur frontend | L'utilisateur devrait savoir quelles fiches sont actives | ❌ **Non respecté** — Aucun indicateur visuel ne montre quelles fiches sont injectées dans le prompt. La fonction `detectRelevantFiches` est appelée côté serveur uniquement. |

### 6.5 Critique-only directeur

| Aspect | Doctrine | Constat |
|---|---|---|
| Prompt système | Interdiction formelle de génération de contenu de substitution | ✅ **Respecté** — 3 occurrences dans `directeur-prompt.ts` : L36 (critique, jamais substitution), L62-63 (jamais réécriture, jamais copier-coller). |
| Méthode de feedback | Identifier 2-3 points d'amélioration, poser des questions ouvertes | ✅ **Respecté** — `MÉTHODE DE FEEDBACK` (L23-28) structure la réponse en améliorations prioritaires + questions stimulatrices. |
| Intégration éditeur | Le directeur devrait pouvoir commenter le texte en cours | ❌ **Non respecté** — Le feedback directeur n'est pas intégré dans l'éditeur (BUG-10). L'utilisateur doit copier-coller manuellement son texte dans le chat directeur. |
| `thesisContext` jamais passé | Le contexte de la thèse (chapitre actif, cadrage) devrait enrichir le prompt | ⚠️ **Partiel** — Le chat directeur ne reçoit pas le contexte de la thèse en cours (chapitre actif, texte sélectionné). Seul le dernier message utilisateur est analysé pour le routage corpus. |

---

## 7. Recommandations priorisées

### Horizon 1 — Corrections urgentes / bloquantes

| # | Recommandation | Constat lié | Impact |
|---|---|---|---|
| H1-01 | **Corriger BUG-01** : Dans `thesis-list-panel.tsx`, après `setActiveThesisId(thesis.id)`, appeler `setActiveChapterId()` avec l'ID du premier chapitre de la thèse. | BUG-01 | Restaure la sauvegarde manuelle et l'auto-save après sélection de thèse. |
| H1-02 | **Corriger BUG-02** : Dans `editor-page.tsx`, le callback `onSave` de l'auto-save doit transmettre les valeurs réelles de `plainText` et `wordCount` (extraites de l'éditeur Tiptap via `CharacterCount` ou `editor.getText()`). | BUG-02 | Élimine la corruption des données de compteur de mots et texte brut. |
| H1-03 | **Corriger BUG-05** : Harmoniser les noms de champs — soit renommer le client (`introduction` → `introductionText`, `discussion` → `discussionText`), soit adapter le serveur. Corriger aussi BUG-16 (alignement `funnelStructure`). | BUG-05, BUG-16 | Active la vérification de cohérence introduction/discussion. |
| H1-04 | **Corriger BUG-06** : Dans `zai-client.ts` L67-72, remplacer `String(response)` par une extraction correcte du contenu (`response.choices?.[0]?.message?.content \\|\\\ response.content \\|\\\ ""`). | BUG-06, BUG-12 | Corrige l'affichage `[object Object]` dans Grammaire et toutes les réponses IA. |
| H1-05 | **Corriger BUG-04** : Remplacer `mode: "methodology-audit"` par `mode: "methodology"` aux lignes 500 et 583 de `verification-methodo-page.tsx`. | BUG-04 | Active l'audit IA méthodologique et le vérificateur de cohérence. |
| H1-06 | **Corriger BUG-11** : Remplacer `mode: "suggestion"` par un mode valide (ex: `"peer-review"`) ou ajouter un mode `"suggestion"` dans `WRITING_MODES`. | BUG-11 | Active le classement IA des journaux. |
| H1-07 | **Corriger BUG-03** : Créer un module `src/modules/cadrage/` avec une UI pour gérer les champs de cadrage (CRUD, versions, verrouillage) en utilisant les 5 routes API existantes. | BUG-03, F1 | Rend le cadrage accessible à l'utilisateur. |
| H1-08 | **Corriger BUG-17** : Ajouter des retours à la ligne au fichier `corpus-publication.ts` (formatage normal du code source). | BUG-17 | Permet le build Webpack et améliore la lisibilité du fichier. |

### Horizon 2 — Améliorations à moyen terme

| # | Recommandation | Constat lié | Impact |
|---|---|---|---|
| H2-01 | **Corriger BUG-08, BUG-09, BUG-10** : Brancher les props `onAddChapter`, `onDelete` dans `editor-page.tsx`. Implémenter le drag-and-drop de chapitres. Intégrer un bouton « Feedback directeur » dans la toolbar de l'éditeur. | BUG-08, BUG-09, BUG-10 | Complète l'expérience d'édition de thèse. |
| H2-02 | **Corriger BUG-07** : Créer les routes API CRUD pour le modèle `Part` et une UI de gestion des parties dans le plan de thèse. Activer le vrai toggle `structureMode` en DB. | BUG-07, BUG-19 | Active le mode « Parties et chapitres ». |
| H2-03 | **Corriger BUG-14, BUG-15** : Migrer la Boîte doctorale et l'Onglet de recherche vers une persistance DB (créer les modèles Prisma et routes API nécessaires). | BUG-14, BUG-15, E3 | Élimine la perte de données utilisateur. |
| H2-04 | **Corriger BUG-13** : Ajouter un affichage d'erreur explicite dans Harper quand la réponse IA est vide ou mal formatée. | BUG-13 | Évite l'échec silencieux. |
| H2-05 | **Corriger BUG-27** : Créer un mode IA dédié `"8c-analysis"` dans `WRITING_MODES` au lieu de réutiliser le mode `"peer-review"` pour l'Auto-édition 8C. | BUG-27 | Élimine le conflit de prompts. |
| H2-06 | **Corriger BUG-31, BUG-32** : Ajouter des try/catch spécifiques pour `request.json()` (SyntaxError → 400) et `ZodError` (→ 400) dans toutes les routes POST. | BUG-31, BUG-32 | Améliore la gestion d'erreur API. |
| H2-07 | **Corriger BUG-18** : Ajouter les champs `email` et `laboratory` au formulaire de création de thèse. | BUG-18 | Complète le formulaire conforme au schéma API/Prisma. |
| H2-08 | **Supprimer le doublon config IA** : Supprimer les routes `/api/ai-config/*` orphelines et le modèle `AiToolConfig` Prisma. Conserver uniquement la gestion localStorage. | E2 | Élimine la confusion architecturale. |
| H2-09 | **Écrire des tests automatisés** : Prioriser les tests pour : (1) les handlers API critiques (thesis CRUD, ai-writing, verification-publication), (2) le parser BibTeX/RIS, (3) le service RAG, (4) les schémas Zod. | E5 | Couverture minimale pour prévenir les régressions. |

### Horizon 3 — Pistes d'évolution non urgentes

| # | Recommandation | Constat lié | Impact |
|---|---|---|---|
| H3-01 | **Transformer Box Cloud en module réel** : Implémenter un upload de fichiers réel (stockage local ou S3), connecter à une API de gestion de fichiers. | E4, BUG-22 | Supprime le faux module. |
| H3-02 | **Ajouter un rendu visuel aux diagrammes** : Intégrer un moteur de rendu (Mermaid, D3.js, ou React Flow) pour transformer la liste de nœuds en diagrammes visuels. | BUG-22 | Rend le module Diagrammes utile. |
| H3-03 | **Indicateur de fiches corpus actives** : Afficher dans le chat directeur quelles fiches du corpus sont injectées pour chaque interaction. | §6.4 | Transparence pour l'utilisateur sur le contexte IA. |
| H3-04 | **Passer le contexte thèse au directeur** : Envoyer le chapitre actif, le texte sélectionné et les champs de cadrage au prompt du directeur. | §6.5, BUG-10 | Enrichit le feedback directeur avec le contexte de travail. |
| H3-05 | **Migrer vers un routing Next.js réel** : Remplacer la navigation SPA Zustand par des routes Next.js pour permettre les liens directs et la navigation navigateur. | E8 | Améliore l'UX et le référencement. |
| H3-06 | **Ajouter un middleware de sécurité** : Rate limiting, logging, et préparation pour l'authentification NextAuth v4. | E6, F2 | Sécurise les endpoints API publics. |
| H3-07 | **RAG sémantique** : Remplacer la recherche keyword-only par des embeddings vectoriels (pgvector, ChromaDB, ou SQLite-vss) pour améliorer la précision du retrieval. | E9 | Améliore la qualité des réponses RAG. |
| H3-08 | **Lier Reference et ResearchSource** : Ajouter une relation Prisma entre les références bibliographiques et les sources du carnet de recherche. | E7 | Permet la synchronisation entre les deux systèmes. |

---

## 8. Annexes

### 8.1 Agents déployés et livrables

| Agent | Tâche | Livrable |
|---|---|---|
| **T1** — Inventaire Code | Inventaire exhaustif des fonctionnalités | Tableau 31 fonctionnalités, 61 handlers API, 5 fonctionnalités absentes, 10 écarts architecturaux. Lignes 1594-1780 du worklog. |
| **T2** — Audit Corpus | Écarts specs vs code (7 fiches) | 3 bloquants (field name mismatches), 9 majeurs, 12 mineurs, 2 cosmétiques. Lignes 1781-1799 du worklog. |
| **T3-a** — Test E2E Création+Cadrage | Browser testing création thèse, cadrage, structure | 6 bugs (T3-a-01 à T3-a-06), 3 snapshots dashboard/création. Lignes 1801-2052 du worklog. |
| **T3-b** — Test E2E Éditeur+Structure | Browser testing éditeur Tiptap, chapitres, feedback directeur | 5 bugs (T3-b-01 à T3-b-05), 8 snapshots éditeur. Lignes 2054-2298 du worklog. |
| **T3-c** — Test Modules IA | Analyse statique 6 modules IA (directeur, 8C, journaux, carto, méthodo, assistant) | 2 critiques, 1 high, 3 medium. Correction build zod v4 appliquée. Lignes 2452-2706 du worklog. |
| **T3-d** — Test Modules Complémentaires | Browser testing 12 modules complémentaires | 7 bugs (T3-d-01 à T3-d-07), 13 snapshots. Lignes 2299-2450 du worklog. |
| **T4** — Tests Cas Limites | Edge cases, erreur handling, doctrine, persistance | 7 bugs (E12, D11a/d, D9, D11b, E12b, C7, F14). Lignes 2708-2927 du worklog. |
| **T5** — Synthèse | Rapport d'audit final | Ce document. |

### 8.2 Snapshots référence

**T3-a (Création + Cadrage)** :
- `/tmp/test-t3a-dashboard.png` — Dashboard complet
- `/tmp/test-t3a-01-dashboard.png` — Dashboard avec modules
- `/tmp/test-t3a-02-create-form.png` — Formulaire de création de thèse

**T3-b (Éditeur + Structure)** :
- `/tmp/t3b-snapshot-01-homepage.png` — Page d'accueil
- `/tmp/t3b-snapshot-02-editor-theses-list.png` — Liste des thèses
- `/tmp/t3b-snapshot-03-editor-loaded.png` — Éditeur chargé avec chapitres
- `/tmp/t3b-snapshot-04-typed-text.png` — Texte tapé dans l'éditeur
- `/tmp/t3b-snapshot-05-prediction-area.png` — Zone de prédiction IA
- `/tmp/t3b-snapshot-06-rename-done.png` — Chapitre renommé
- `/tmp/t3b-snapshot-07-plan-thesis.png` — Plan de thèse
- `/tmp/t3b-snapshot-08-chat-directeur.png` — Chat Directeur

**T3-d (Modules Complémentaires)** :
- `/home/z/my-project/test-snapshots/01-references.png` — Références
- `/home/z/my-project/test-snapshots/01-references-done.png` — Références avec données
- `/home/z/my-project/test-snapshots/02-export-pdf.png` — Export PDF
- `/home/z/my-project/test-snapshots/03-grammaire.png` — Grammaire IA (bug `[object Object]`)
- `/home/z/my-project/test-snapshots/04-rag.png` — Mon IA de thèse (garde-fous)
- `/home/z/my-project/test-snapshots/05-slr.png` — Outils SLR
- `/home/z/my-project/test-snapshots/06-apa.png` — APA Compositeur
- `/home/z/my-project/test-snapshots/07-equilibre.png` — Équilibre des chapitres
- `/home/z/my-project/test-snapshots/08-diagrammes.png` — Diagrammes
- `/home/z/my-project/test-snapshots/09-harper.png` — Harper IA
- `/home/z/my-project/test-snapshots/10-box-cloud.png` — Box Cloud
- `/home/z/my-project/test-snapshots/11-boite-doctorale.png` — Boîte doctorale
- `/home/z/my-project/test-snapshots/12-onglet-recherche.png` — Onglet de recherche

---

*Fin du rapport d'audit. Document généré par l'agent T5 — Chef d'Orchestre.*
