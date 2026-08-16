# FICHE SYNTHESE — ThesisFrame

> **Document de référence et de traçabilité du projet.**
> Mis à jour le : 28 juin 2025

---

## Journal des jalons

| Date | Commit | Description | Autorisation |
|------|--------|-------------|--------------|
| — | — | Création initiale du projet | — |
| 28/06/2025 | cf7b425 | Fix build errors — exclude skills/ from tsconfig, fix CSL-JSON duplicate key | Bugfix (hors protocole) |
| 28/06/2025 | 738ef73 | Feat: import références BibTeX/RIS/CSL-JSON + Mendeley + dashboard | Antérieure au protocole |
| 28/06/2025 | 732c298 | Fix: useAiConfig infinite re-render bug | Bugfix (hors protocole) |
| 28/06/2025 | f9c0a2a | Fix: client-side crash Vercel — separate server fs code | Bugfix (hors protocole) |

---

## Protocole d'autorisation préalable

> **En vigueur depuis le 28 juin 2025**

**Règle :** Aucune modification de code, fonctionnalité, logique applicative ou architecture sans aval écrit préalable du propriétaire du projet.

- ✗ Modifications de fonctionnalités existantes
- ✗ Ajouts de fonctionnalités non demandées
- ✗ Changements de logique métier / scoring / vérification
- ✗ Changements d'architecture ou dépendances structurantes
- ✗ Suppressions de code existant

**Exempté (sans autorisation) :**
- ✓ Corrections de bugs strictement limitées au comportement initialement prévu
- ✓ Ajustements mineurs de style/formatage sans impact fonctionnel
- ✓ En cas de doute → demande d'autorisation

**Procédure :**
1. Soumettre une proposition écrite (ce qui, pourquoi, impact)
2. Attendre l'autorisation écrite
3. Implémenter + consigner dans ce journal

---

# Structure de référence — version gelée

> **Date : 28 juin 2025**
> **Statut : ⏳ EN ATTENTE DE VALIDATION**
> **Cette section constitue le point zéro à partir duquel toute divergence future doit être justifiée.**

---

## 1. Architecture technique

### 1.1 Stack complète

| Couche | Technologie | Version |
|--------|-------------|---------|
| **Framework** | Next.js (App Router) | ^16.1.1 |
| **Runtime** | Bun | (lockfile) |
| **Langage** | TypeScript | ^5 |
| **UI** | React | ^19.0.0 |
| **CSS** | Tailwind CSS 4 + tw-animate-css | ^4 |
| **Composants UI** | shadcn/ui (style New York) | — |
| **Icônes** | Lucide React | ^0.525.0 |
| **État client** | Zustand (persist middleware) | ^5.0.6 |
| **Serveur state** | TanStack React Query | ^5.82.0 |
| **Base de données** | SQLite via Prisma ORM | ^6.11.1 |
| **Éditeur riche** | Tiptap (+ 6 extensions) | ^3.29.2 |
| **Formulaires** | React Hook Form + Zod v4 | ^7.60.0 / ^4.0.2 |
| **Graphiques** | Recharts | ^2.15.4 |
| **Drag & Drop** | dnd-kit | ^6.3.1 |
| **Animations** | Framer Motion | ^12.23.2 |
| **SDK IA (sandbox)** | z-ai-web-dev-sdk | ^0.0.18 |
| **Toast** | Sonner | ^2.0.6 |
| **Thème** | next-themes (class-based) | ^0.4.6 |
| **Auth (disponible)** | NextAuth v4 | ^4.24.11 |

### 1.2 Structure des dossiers

```
src/
├── app/                          # Routeur Next.js App Router
│   ├── layout.tsx                # Layout racine (server component, lang="fr")
│   ├── page.tsx                  # Page unique — SPA via Zustand currentView
│   ├── globals.css               # Styles globaux + variables CSS
│   └── api/                      # 36 routes API (REST, zéro server action)
│       ├── route.ts              # Health check
│       ├── stats/route.ts        # Agrégations dashboard
│       ├── thesis/               # CRUD thèses + chapitres + cadrages
│       ├── chapters/[id]/        # CRUD chapitres
│       ├── references/           # CRUD + export BibTeX + import
│       ├── references/import/    # Upload .bib/.ris/.csl-json
│       ├── references/[id]/      # Update/delete référence
│       ├── references/bibtex/   # Export .bib
│       ├── sources/              # Carnet de recherche CRUD
│       ├── entries/              # Notebook entries CRUD
│       ├── sprints/              # Sprints agiles CRUD
│       ├── stories/[id]/         # Stories CRUD
│       ├── cadrages/             # Cadrages + versions + fields
│       ├── ai-writing/           # Génération IA modes d'écriture
│       ├── directeur-chat/       # Chat IA directeur de thèse
│       ├── ai-test/              # Test connexion fournisseur IA
│       ├── ai-config/            # Configurations IA CRUD
│       ├── search/               # Recherche plein texte booléenne
│       └── journaux-oa/          # Recherche journaux OpenAlex/DOAJ
│
├── components/
│   ├── layout/                  # AppHeader, AppSidebar, AppFooter, ModulePlaceholder
│   ├── dashboard/                # DashboardPage (stats, actions, modules)
│   ├── providers/                # QueryProvider (React Query)
│   ├── theme-provider.tsx        # ThemeProvider (next-themes)
│   └── ui/                       # 44 composants shadcn/ui
│
├── modules/                      # 27 modules fonctionnels (tous "use client")
│   ├── editor/                   # + composants Tiptap + hooks
│   ├── ai-writing/               # 11 modes d'écriture IA
│   ├── references/               # Biblio CRUD + import + export
│   ├── ai-tools/                  # Carnet de recherche + consensus
│   ├── methodology/              # Guides méthodologiques
│   ├── articles/                 # Guide IMRaD + checklists
│   ├── thesis-plan/              # Plan de thèse + template LaTeX
│   ├── academic-db/              # 27 bases de données académiques
│   ├── journaux-oa/              # Recherche OA OpenAlex/DOAJ
│   ├── recherche-plein-texte/    # Recherche plein texte booléenne
│   ├── auto-edition/             # Auto-évaluation IA 8 critères
│   ├── feuille-route-agile/     # Kanban sprints 5 phases
│   ├── deblocage-ecriture/       # Diagnostic + Pomodoro + suivi
│   ├── outils-slr/              # Revue systématique PRISMA
│   ├── analyse-champ-recherche/  # Cartographie IA du champ
│   ├── apa-composer/            # Formatage APA 7e édition
│   ├── verification-methodo/    # Audit méthodologique IA
│   ├── boite-doctorale/         # Boîte à outils doctorale
│   ├── box-cloud/               # Stockage cloud
│   ├── routesme/                # Comparaison multi-modèles IA
│   ├── livres-competences/       # Compétences livres
│   ├── onglet-recherche/         # Organisation onglets recherche
│   ├── grammaire/               # Correcteur grammatical IA
│   ├── export-pdf/              # Export PDF
│   ├── equilibre-chapitres/     # Équilibre chapitres IA
│   ├── diagrammes/              # Diagrammes visuels
│   └── harper/                  # Résumé/paraphrase/extraction IA
│
├── hooks/                       # useAiConfig, useMobile, useToast
├── lib/
│   ├── ai/                       # Architecture IA dual-backend
│   │   ├── ai-types.ts           # Types client-safe + constantes
│   │   ├── ai-provider.ts        # Détection backend server-only (fs/os)
│   │   └── zai-client.ts         # Client IA (SDK + API OpenAI-compat)
│   ├── parsers/                  # Parsers bibliographiques
│   │   ├── bibtex-parser.ts      # Parser BibTeX (.bib)
│   │   ├── ris-parser.ts         # Parser RIS (.ris)
│   │   ├── csl-json-parser.ts    # Parser CSL-JSON (.json)
│   │   └── index.ts              # Auto-détection format
│   ├── stores/
│   │   └── app-store.ts          # Zustand (27 vues, thème, IA provider)
│   ├── api-schemas.ts            # Schemas Zod pour toutes les routes
│   ├── db.ts                     # Prisma Client singleton
│   └── utils.ts                  # Utilitaires (cn, etc.)
│
└── data/
    ├── ai-writing-modes.ts       # 11 modes d'écriture (prompts système)
    └── directeur-prompt.ts        # Prompt système directeur IA
```

### 1.3 Base de données

**Moteur :** SQLite (fichier `db/custom.db`)
**ORM :** Prisma Client v6
**Générateur :** prisma-client-js
**Client :** Singleton via globalThis (dev HMR-safe) dans `src/lib/db.ts`

#### Schéma (14 modèles)

**THÈSE**
```
Thesis                          → Chapter[], Part[], ThesisCadrage[]
  id, title, subtitle?, author, email?, institution?, laboratory?,
  discipline?, directorName?, status (draft|in_progress|review|completed),
  structureMode (chapters|parts)

Chapter ← Thesis (Cascade)
  id, thesisId, number, title, romanNumeral?, content (HTML),
  plainText, wordCount, targetWordCount, status (not_started|in_progress|draft|review|completed),
  directorFeedback?, parentId?, sortOrder

Part ← Thesis (Cascade)
  id, thesisId, title, sortOrder
```

**CADRAGE**
```
ThesisCadrage ← Thesis (Cascade) → ThesisCadrageField[], ThesisCadrageVersion[]
  id, thesisId, label?, isActive

ThesisCadrageField ← ThesisCadrage (Cascade)
  id, cadrageId, fieldKey (unique [cadrageId, fieldKey]),
  label, value?, aiSuggestion?, isLocked, sortOrder

ThesisCadrageVersion ← ThesisCadrage (Cascade)
  id, cadrageId, label?, snapshot (JSON)
```

**RÉFÉRENCES**
```
Reference (standalone)
  id, type (article|book|thesis|conference|report|web|other),
  authors (;-sep), title, year?, journal?, volume?, issue?, pages?,
  publisher?, doi?, isbn?, url?, abstract?, keywords (,-sep)?,
  notes?, bibtexKey?, source (manual|mendeley|zotero|bibtex|ris|csl-json|doi),
  isFavorite
  Indexes: [type], [year], [isFavorite], [source]
```

**CARNET DE RECHERCHE**
```
ResearchSource (standalone) → NotebookEntry[]
  id, title, authors?, year?, type (article|book|thesis|report), url?, notes?

NotebookEntry ← ResearchSource (SetNull)
  id, sourceId?, question, answer, tags (,-sep)?
```

**IA**
```
AiToolConfig (standalone)
  id, provider (unique: openai|anthropic|mistral|zai|custom),
  apiKey?, model?, isActive
```

**AGILE**
```
AgileSprint → AgileStory[]
  id, phase (phase_0..4), title, description?,
  startDate?, endDate?, status (planned|active|completed), sortOrder

AgileStory ← AgileSprint (Cascade)
  id, sprintId, title, description?, status (todo|in_progress|done),
  priority (low|medium|high|critical), storyPoints?, sortOrder
```

**AUTRES**
```
CustomBookSkill    → id, title, author?, content, tags?
LicenseKey         → id, keyHash (unique), licenseType (trial|standard|academic|premium), email?, expiresAt?
```

### 1.4 Dépendances critiques

| Dépendance | Rôle | Impact si supprimée |
|-----------|------|-------------------|
| `next` | Framework principal | Application complète |
| `@prisma/client` + `prisma` | ORM + génération | Toutes les données |
| `z-ai-web-dev-sdk` | SDK IA sandbox | Fonctionnalités IA (server-only) |
| `zustand` | État client + navigation | Navigation entre modules |
| `@tanstack/react-query` | Cache serveur state | Chargement de données |
| `@tiptap/*` | Éditeur riche | Module Éditeur |
| `zod` | Validation schémas | Toutes les API routes |
| `react-hook-form` | Formulaires | Formulaires dans modules |
| `lucide-react` | Icônes | Toute l'interface |
| `sonner` | Notifications toast | Feedback utilisateur |

---

## 2. Fonctionnalités — Module par module

### 2.1 Dashboard (`DashboardPage`)
- **Statut :** Stable
- **Rôle :** Page d'accueil, vue d'ensemble du projet
- **Contenu :** 4 stat cards (Chapitres, Références, Mots rédigés, Progression %), 4 actions rapides, guide de démarrage 5 étapes, grille de 14+ modules
- **Déclenchement :** Affiché par défaut (viewId = "dashboard")
- **Données :** GET /api/stats

### 2.2 Éditeur de thèse (`EditorPage`)
- **Statut :** Stable
- **Rôle :** Éditeur riche avec Tiptap pour rédiger les chapitres
- **Fonctionnalités :**
  - Créer/supprimer/modifier une thèse (dialogue formulaire)
  - 7 chapitres par défaut (Introduction → Conclusion)
  - Navigation par onglets entre chapitres
  - Édition WYSIWYG avec barre d'outils (gras, italique, titres, listes, liens, surligneur)
  - Compteur de caractères en temps réel
  - Auto-save (débounced, configurable)
  - Compteur de mots, objectif de mots par chapitre
  - Statut du chapitre (non commencé / en cours / brouillon / révision / terminé)
  - Feedback directeur sur chaque chapitre
  - Panel latéral liste des thèses
- **Données :** CRUD /api/thesis, /api/thesis/[id], /api/thesis/[id]/chapters, /api/chapters/[id]

### 2.3 Assistant IA d'écriture (`AiWritingPage`)
- **Statut :** Stable
- **Rôle :** 11 modes spécialisés d'assistance à l'écriture académique
- **Onglets :** "Modes d'écriture" + "Chat Directeur"
- **11 modes :**
  1. Rédaction scientifique (formel, connecteurs, citations)
  2. Revue de littérature (thématique, chronologique)
  3. Relecture critique (peer review, 10 critères)
  4. Paraphrase académique (reformulation conservant le sens)
  5. Rédaction de résumé (abstract IMRaD, 250 mots max)
  6. Génération d'hypothèses (testables, falsifiables)
  7. Aide méthodologique (quali/quanti/mixte)
  8. Construction théorique (concepts, relations, modèle conceptuel)
  9. Documents de supervision (rapports, notes, plans)
  10. Correcteur grammatical (JSON structuré : statistiques + erreurs + corrigé)
  11. Préparation soutenance (présentation + questions jury)
- **Chat Directeur :** Conversation avec IA persona "Pr. Jean-Marc Renaud"
- **Données :** POST /api/ai-writing, POST /api/directeur-chat

### 2.4 Références bibliographiques (`ReferencesPage`)
- **Statut :** Stable
- **Rôle :** Gestion bibliographique CRUD + import/export
- **Fonctionnalités :**
  - CRUD manuel (formulaire : type, auteurs, titre, année, journal, DOI, mots-clés, notes)
  - Filtrage par type, par source, par recherche texte, par favoris
  - Badge coloré par source (Mendeley=rouge, Zotero=orange, BibTeX=bleu, RIS=violet, CSL-JSON=vert)
  - Étoile/favori sur chaque référence
  - Export BibTeX (.bib download)
  - Import par fichier (.bib, .ris, .json CSL-JSON) avec drag-and-drop, auto-détection, aperçu, résultat détaillé
  - Bandeau informatif avec instructions d'export depuis Mendeley/Zotero/EndNote
- **Données :** GET/POST /api/references, PUT/DELETE /api/references/[id], GET /api/references/bibtex, POST /api/references/import

### 2.5 Méthodologie (`MethodologyPage`)
- **Statut :** Stable
- **Rôle :** Guides méthodologiques pour la thèse (paradigmes, démarches, outils)

### 2.6 Articles scientifiques (`ArticlesPage`)
- **Statut :** Stable
- **Rôle :** Guide IMRaD, checklist de soumission, boîte à outils rédaction

### 2.7 Plan de thèse (`ThesisPlanPage`)
- **Statut :** Stable
- **Rôle :** Visualisation du plan de thèse, génération de template LaTeX personnalisé

### 2.8 Outils IA (`AiToolsPage`)
- **Statut :** Stable
- **Rôle :** Carnet de recherche (sources + Q&A entries), analyse de consensus multi-sources, visualisation
- **Fonctionnalités :**
  - CRUD ResearchSource (types : article, book, thesis, report)
  - CRUD NotebookEntry (liées ou non à une source)
  - Analyse de consensus IA entre sources
- **Données :** CRUD /api/sources, /api/sources/[id], /api/sources/[id]/entries, /api/entries

### 2.9 Bases de données académiques (`AcademicDbPage`)
- **Statut :** Stable
- **Rôle :** Répertoire de 27 bases de données académiques (HAL, Google Scholar, Persée, CAIRN, etc.)

### 2.10 Journaux Open Access (`JournauxOaPage`)
- **Statut :** Stable
- **Rôle :** Recherche de journaux OA via OpenAlex + DOAJ
- **Fonctionnalités :** Recherche par mot-clé, filtrage par source/sujet, export CSV, mapping pays, filtrage type OA
- **Données :** GET /api/journaux-oa

### 2.11 Recherche plein texte (`RecherchePleinTextePage`)
- **Statut :** Stable
- **Rôle :** Recherche booléenne (AND, OR, NOT) dans tous les chapitres
- **Données :** GET /api/search

### 2.12 Auto-édition (`AutoEditionPage`)
- **Statut :** Stable
- **Rôle :** Auto-évaluation IA contre 8 critères de qualité

### 2.13 Feuille de route agile (`FeuilleRouteAgilePage`)
- **Statut :** Stable
- **Rôle :** Tableau Kanban, sprints agiles en 5 phases (phase_0→phase_4), stories avec priorités et story points
- **Données :** CRUD /api/sprints, /api/sprints/[id]/stories, /api/stories/[id]

### 2.14 Déblocage écriture (`DeblocageEcriturePage`)
- **Statut :** Stable
- **Rôle :** Diagnostic de blocage, exercices d'écriture, timer Pomodoro (25min/5min), suivi quotidien de mots

### 2.15 Outils SLR (`OutilsSlrPage`)
- **Statut :** Stable
- **Rôle :** Revue systématique de littérature : diagramme PRISMA, criblage, extraction de données

### 2.16 Analyse du champ de recherche (`AnalyseChampRecherchePage`)
- **Statut :** Stable
- **Rôle :** Cartographie IA du champ de recherche, identification de lacunes, positionnement

### 2.17 APA Compositeur (`ApaComposerPage`)
- **Statut :** Stable
- **Rôle :** Formatage automatique selon APA 7e édition

### 2.18 Vérification méthodologique (`VerificationMethodoPage`)
- **Statut :** Stable
- **Rôle :** Audit méthodologique IA, vérification de cohérence de la démarche

### 2.19 Boîte doctorale (`BoiteDoctoralePage`)
- **Statut :** Stable
- **Rôle :** Checklist doctorale, calendrier, documents administratifs, suivi

### 2.20 Box Cloud (`BoxCloudPage`)
- **Statut :** Stable
- **Rôle :** Gestion de stockage cloud pour les fichiers de thèse

### 2.21 RoutesMe — Comparaison multi-modèles (`RoutesMePage`)
- **Statut :** Stable
- **Rôle :** Envoi simultané de la même question à plusieurs fournisseurs IA, affichage côte à côte des réponses

### 2.22 Livres & Compétences (`LivresCompetencesPage`)
- **Statut :** Stable
- **Rôle :** Suivi des compétences acquises via des livres, développement doctoral

### 2.23 Onglet de recherche (`OngletRecherchePage`)
- **Statut :** Stable
- **Rôle :** Organisation de la recherche par onglets thématiques

### 2.24 Grammaire (`GrammairePage`)
- **Statut :** Stable
- **Rôle :** Correcteur grammatical IA (orthographe, grammaire, style, ponctuation) — retour JSON structuré

### 2.25 Export PDF (`ExportPdfPage`)
- **Statut :** Stable
- **Rôle :** Export de la thèse en PDF avec options de formatage

### 2.26 Équilibre des chapitres (`EquilibreChapitresPage`)
- **Statut :** Stable
- **Rôle :** Analyse de la répartition des mots par chapitre, objectifs, recommandations IA

### 2.27 Diagrammes (`DiagrammesPage`)
- **Statut :** Stable
- **Rôle :** Création de diagrammes visuels (organigrammes, timelines, flux)

### 2.28 Harper (`HarperPage`)
- **Statut :** Stable
- **Rôle :** Résumé IA, paraphrase, extraction de textes

---

## 3. Logiques métier

### 3.1 Architecture IA dual-backend

**Chaîne de propagation config (client → serveur) :**
1. `AppHeader → AiConfigDialog` → sauvegarde dans `localStorage` (clé : `thesisframe-ai-config`)
2. `useAiConfig()` hook → lit via `useSyncExternalStore` avec cache module-level
3. `withAiConfig(body)` → injecte `{ _aiConfig: config }` dans le body des requêtes fetch
4. Route serveur → extrait `_aiConfig` → passe en `providerConfig` à `generateCompletion()`
5. `generateCompletion()` → détecte backend (`detectBackend`) → route vers SDK ou API fetch

**Détection backend (`detectBackend`) :**
- Si `provider ≠ "zai"` → toujours `"api"` (OpenAI-compatible fetch)
- Si `provider = "zai"` → vérifie existence de `/etc/.z-ai-config` (sandbox) → `"zai"` sinon `"api"`

**Fallback serveur (`getDefaultConfig`) :**
- Lit `AI_PROVIDER` env var → switch sur `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `MISTRAL_API_KEY`
- Modèle par défaut : gpt-4o-mini (openai), claude-3-haiku (anthropic), mistral-small-latest (mistral)

**Retry :** 2 tentatives max avec backoff exponentiel (1s, 2s) sur les deux backends

**⚠️ Point sensible :** Le hook `useAiConfig` utilise un cache module-level pour éviter les re-renders infinis. Toute modification de ce hook nécessite une attention particulière au cycle de vie React.

### 3.2 Création de thèse
- Formulaire : titre (requis), auteur (requis), email, institution, laboratoire, discipline, directeur
- Crée automatiquement 7 chapitres par défaut avec des statuts "not_started"
- Structure par défaut : "chapters" (alternative "parts" possible)

### 3.3 Auto-save de l'éditeur
- Délai configurable (débounced)
- Sauvegarde le contenu HTML + texte brut + compteur de mots
- Se déclenche sur chaque modification du Tiptap editor

### 3.4 Cadrage (versionning)
- Chaque thèse peut avoir plusieurs cadrages, un seul actif à la fois
- L'activation d'un cadrage désactive les autres (transaction Prisma)
- Chaque cadrage a des champs clé-valeur + des versions (snapshots JSON)
- Possibilité de suggestions IA par champ

### 3.5 Import de références bibliographiques
- **BibTeX :** Regex `@type{key, fields}` → parse field=value → map type → map authors/keywords
- **RIS :** Split par `ER -` → parse `TAG - value` (multi-lignes supportées) → map type
- **CSL-JSON :** JSON parse → map authors (family/given/literal) → map type
- **Auto-détection :** par extension (.bib/.ris/.json) ou par contenu (@→bibtex, TY→ris, JSON avec type→csl-json)
- Maximum : 10 Mo par fichier, 500 références par import
- Le champ `source` est automatiquement renseigné selon le format

### 3.6 Sprints agiles
- 5 phases : phase_0 (Idéation) → phase_4 (Finalisation)
- Stories avec priorité (low/medium/high/critical) et story points
- Kanban visuel avec drag & drop (dnd-kit)

### 3.7 Recherche plein texte
- Indexation de tous les chapitres (plainText)
- Opérateurs booléens : AND, OR, NOT
- Score de pertinence, snippets de résultat
- Filtre par chapitre et dates

---

## 4. Points sensibles et dette technique

### 4.1 Fichiers critiques — ne pas modifier sans autorisation

| Fichier | Risque | Justification |
|---------|--------|---------------|
| `src/hooks/use-ai-config.ts` | 🔴 Critique | Bug de re-render infini corrigé par cache module-level. Toute modification du cycle useSyncExternalStore peut casser toute l'application. |
| `src/lib/ai/zai-client.ts` | 🔴 Critique | Dual-backend IA. Retry logic, détection backend. Tous les modules IA en dépendent. |
| `src/lib/ai/ai-provider.ts` | 🔴 Critique | Utilise `require("fs")`/`require("os")` — ne doit JAMAIS être importé côté client. |
| `src/lib/ai/ai-types.ts` | 🟡 Important | Types client-safe. Modification = impact sur toute la chaîne config IA. |
| `src/lib/stores/app-store.ts` | 🟡 Important | 27 vues, navigation, thème. Modification = impact sur toute la navigation. |
| `src/app/page.tsx` | 🟡 Important | Routeur SPA central. Tout nouveau module doit y être ajouté. |
| `prisma/schema.prisma` | 🔴 Critique | Schéma de données. Toute modification nécessite `db:push` + test régression. |
| `src/lib/api-schemas.ts` | 🟡 Important | Validation Zod pour toutes les routes. Modification = impact sur validation côté serveur. |

### 4.2 Dette technique identifiée

| # | Zone | Description | Sévérité |
|---|------|-------------|----------|
| D1 | `ai-provider.ts` | Utilise `require("fs"/"os")` au runtime avec lazy init. Fonctionne mais fragile sur certaines plateformes. | Moyenne |
| D2 | `Reference` et `ResearchSource` | Modèles complètement séparés sans relation. Pas de synchronisation entre biblio et carnet de recherche. | Faible |
| D3 | `skills/` | Fichiers de skills avec erreurs TypeScript (exclus du build via tsconfig). Non maintenus. | Faible |
| D4 | Pas de middleware | Pas de middleware Next.js pour auth/redirect/logging. | Faible |
| D5 | Pas de tests | Vitest configuré mais aucun test écrit. | Moyenne |
| D6 | `AiToolConfig` | Modèle en DB mais en pratique la config IA est gérée via localStorage + hook. Redondance. | Faible |
| D7 | `app-header.tsx` | Le paramètre `open` du AiConfigDialog est défini mais non utilisé (warning lint). | Triviale |

### 4.3 Variables d'environnement

| Variable | Usage | Défaut |
|----------|-------|--------|
| `DATABASE_URL` | Connexion SQLite Prisma | (requis) |
| `AI_PROVIDER` | Fournisseur IA par défaut | `"zai"` |
| `AI_MODEL` | Modèle IA par défaut | Dépend du provider |
| `AI_BASE_URL` | URL de base API IA | Vide |
| `OPENAI_BASE_URL` | URL OpenAI (fallback Vercel) | Vide |
| `OPENAI_API_KEY` | Clé API OpenAI | Vide |
| `ANTHROPIC_API_KEY` | Clé API Anthropic | Vide |
| `MISTRAL_API_KEY` | Clé API Mistral | Vide |

### 4.4 Configuration Next.js

- `output: "standalone"` — Déploiement conteneurisé
- `serverExternalPackages: ["z-ai-web-dev-sdk"]` — SDK non bundlé côté client
- `typescript.ignoreBuildErrors: false` — Errors bloquent le build
- `tsconfig.json` exclut : node_modules, examples, tests, tool-results, agent-ctx, pdf-gen, mini-services, skills

---

> **FIN DE LA STRUCTURE DE RÉFÉRENCE**
>
> **Statut : ⏳ EN ATTENTE DE VALIDATION**
> Cette section sera considérée comme actée après validation écrite du propriétaire du projet.
