# ThesisFrame — Roadmap de Reconstruction Professionnelle

> **Version cible** : v1.0.0 (production)  
> **Version source (GitHub)** : v0.4.0  
> **Date** : Août 2025  
> **Rédacteur** : Architecte Logiciel Principal  

---

## Table des matières

- [I. DIAGNOSTIC & RISQUES](#i-diagnostic--risques)
- [II. ARCHITECTURE DECISIONS](#ii-architecture-decisions)
- [III. ROADMAP — PHASES DETAILLEES](#iii-roadmap--phases-detaill--es)
- [IV. SPECIFICATIONS TECHNIQUES](#iv-specifications-techniques)
- [V. QUALITY GATE](#v-quality-gate)
- [VI. INDICATEURS & GOUVERNANCE](#vi-indicateurs--gouvernance)

---

## I. DIAGNOSTIC & RISQUES

### 1.1 Audit technique complet du code existant (v0.4.0)

#### 1.1.1 Structure du code

| Catégorie | Quantité | Détail |
|---|---|---|
| **Composants métier** (`src/components/thesis/`) | 41 fichiers | Monolithiques, 0 tests |
| **Composants workspace** (`src/components/thesis/workspace/`) | 9 fichiers | Couplage fort avec page.tsx |
| **Composants shadcn/ui** (`src/components/ui/`) | 50 fichiers | Générés, non modifiés |
| **Routes API** (`src/app/api/`) | 40+ endpoints | Pas de validation uniforme |
| **Fichiers de données** (`src/data/`) | 26 fichiers | Guides méthodologiques, prompts IA |
| **Modèles Prisma** | 20+ modèles | Complexe, pas de migrations |
| **Fichiers utilitaires** | 24 fichiers | Non documentés |

#### 1.1.2 Problèmes critiques identifiés

| # | Sévérité | Problème | Impact |
|---|---|---|---|
| C1 | **CRITIQUE** | `page.tsx` monolithique — 865 lignes, 30+ états booléens (`sidebarOpen`, `helpOpen`, `refsOpen`, `exportOpen`, `literatureOpen`, `balanceOpen`, `cloudDriveOpen`, `journalFinderOpen`, `templateOpen`, `excalidrawOpen`, `grammarOpen`, `harperOpen`, `autoEditionOpen`, `searchOpen`, `assistantOpen`, `directeurOpen`, `cadrageOpen`, `officeOpen`, `automationOpen`, `ithyResearchOpen`, `agileRoadmapOpen`, `writingUnblockOpen`, `bookSkillsOpen`, `researchResourcesOpen`, `fieldAnalysisOpen`, `apaComposerOpen`, `slrProtocolOpen`, `doctoralToolkitOpen`, `boxDriveOpen`, `usageGuideOpen`, `licenseAdminOpen`, `authProvidersOpen`, `routesMeOpen`, `verificationOpen`, `rechercheOpen`) | Impossible de maintenir, tester ou raisonner sur le comportement |
| C2 | **CRITIQUE** | `ignoreBuildErrors: true` dans `next.config.ts` | Les erreurs TypeScript sont silencieusement ignorées en production |
| C3 | **CRITIQUE** | `reactStrictMode: false` | Comportement non-déterministe en développement, masque les bugs de cycle de vie |
| C4 | **CRITIQUE** | Zéro test (aucun framework de test configuré) | Aucune garantie de non-régression |
| C5 | **ÉLEVÉ** | Package name = `nextjs_tailwind_shadcn_ts` (template par défaut) | Identification et branding incorrects |
| C6 | **ÉLEVÉ** | Gestion d'état éclatée — mélange `useState`, `useRef`, `localStorage` direct | Pas de source de vérité unique, état dispersé |
| C7 | **ÉLEVÉ** | Logique métier dans les composants UI (auto-save, CRUD chapitres, IA) | Violation complète de la séparation des préoccupations |
| C8 | **ÉLEVÉ** | Pas de middleware d'authentification, pas de gestion de session | Données accessibles sans authentification |
| C9 | **MOYEN** | Pas de gestion d'erreurs uniforme côté API | Messages d'erreur incohérents |
| C10 | **MOYEN** | `localStorage` utilisé pour clés API sensibles (`tf_apiKey`, `tf_provider`) | Fuite de secrets côté client |
| C11 | **MOYEN** | Fallback local + API sans synchronisation explicite | Conflits de données potentiels |
| C12 | **FAIBLE** | Aucune i18n, contenu mixte français/anglais | Problème d'internationalisation |

#### 1.1.3 Analyse du Prisma Schema (20+ modèles)

| Domaine | Modèles | Commentaire |
|---|---|---|
| Thèse | `Thesis`, `Chapter`, `Part` | Structure correcte mais manque de contraintes |
| Cadrage | `ThesisCadrage`, `ThesisCadrageField`, `ThesisCadrageVersion` | Bonne conception du versioning |
| Références | `Reference`, `MendeleyConfig`, `SourceBibliographique`, `SourceChapitre`, `FicheLecture`, `RechercheSauvegardee` | Modèles redondants (Reference vs SourceBibliographique) |
| Licence | `LicenseKey`, `Activation` | Hash SHA-256 correct |
| Auth | `AuthProvider`, `AuthAccount`, `WarrantPolicy` | Complexe, pas encore câblé |
| Notebook | `ResearchSource`, `NotebookEntry`, `AiToolConfig` | Modèle minimal |
| Livres IA | `CustomBookSkill` | JSON dans String (pas de colonnes typées) |
| Vérification | `ElementAnalyse`, `TypeAnalyseMethodologique`, `SessionVerification` | Domaine spécifique |
| Agile | `AgileSprint`, `AgileStory` | Structure correcte |
| Cloud | `CloudDriveConnection` | Token stockés en clair dans DB |

#### 1.1.4 Inventaire complet des dépendances (v0.4.0)

| Catégorie | Dépendances | Statut local |
|---|---|---|
| **Éditeur** | `@tiptap/*` (10 packages), `lowlight` | ❌ Non installées |
| **Dessin** | `@excalidraw/excalidraw` | ❌ Non installée |
| **PDF** | `pdf-lib`, `pdf-parse`, `pagedjs`, `jszip` | ❌ Non installées |
| **DB LibSQL** | `@libsql/client`, `@prisma/adapter-libsql` | ❌ Non installées |
| **Desktop** | `@tauri-apps/api`, `@tauri-apps/plugin-shell`, `@tauri-apps/cli` | ❌ Non installées |
| **Typographie** | `@tailwindcss/typography` | ❌ Non installée |
| **Auth** | `next-auth` | ✅ Installé mais non utilisé |
| **State** | `zustand` | ✅ Installé mais non utilisé |
| **Data fetching** | `@tanstack/react-query`, `@tanstack/react-table` | ✅ Installé mais non utilisé |
| **Forms** | `react-hook-form`, `zod` | ✅ Installé mais non utilisé |
| **UI** | 50 composants shadcn/ui | ✅ Installés |
| **IA** | `z-ai-web-dev-sdk` | ✅ Installé |
| **DnD** | `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` | ✅ Installés |

---

### 1.2 Matrice des risques

| ID | Risque | Probabilité | Impact | Score | Stratégie d'atténuation |
|---|---|---|---|---|---|
| R1 | Rupture de fonctionnalités lors de la refactorisation | Élevée (4) | Critique (5) | **20** | Port incrémental, tests E2E de régression |
| R2 | Explosion de la complexité des états partagés | Élevée (4) | Élevée (4) | **16** | Architecture modulaire avec Zustand + Context par domaine |
| R3 | Dépendance forte au SDK IA z-ai (fournisseur unique) | Moyenne (3) | Élevée (4) | **12** | Pattern Adapter pour multi-fournisseur |
| R4 | Performance dégradée de l'éditeur Tiptap avec gros documents | Moyenne (3) | Élevée (4) | **12** | Lazy loading, virtualisation, sauvegarde incrémentale |
| R5 | Failles de sécurité (clés API en localStorage) | Élevée (4) | Critique (5) | **20** | Migration vers server-side secrets, chiffrement |
| R6 | Migration de données Prisma impossible sans perte | Faible (2) | Critique (5) | **10** | Stratégie de migration progressive avec rollback |
| R7 | Non-régression sur les prompts IA (contenus académiques) | Moyenne (3) | Moyenne (3) | **9** | Versioning des prompts, tests de snapshot |
| R8 | Scope creep (ajout de fonctionnalités pendant la refonte) | Élevée (4) | Moyenne (3) | **12** | Backlog strict, revue de scope par phase |
| R9 | Compatibilité navigateurs (Excalidraw, Tiptap) | Faible (2) | Moyenne (3) | **6** | Test cross-browser automatisé |
| R10 | Couverture de tests insuffisante | Élevée (4) | Élevée (4) | **16** | TDD obligatoire par phase, quality gate à 80% |

---

### 1.3 Analyse du chemin critique

```
Phase 0 (Fondations) ──► Phase 1 (Architecture) ──► Phase 2 (Données/API)
                                                          │
                                                          ▼
                          Phase 4 (Moteur IA) ◄── Phase 3 (Éditeur)
                                │
                                ▼
                          Phase 5 (Modules Académiques)
                                │
                                ▼
                          Phase 6 (Modules Avancés)
                                │
                                ▼
                          Phase 7 (Qualité/Production)
```

**Chemin critique** : Phase 0 → 1 → 2 → 3 → 4 → 5 → 7 (Phase 6 peut être parallélisée)

**Durée totale estimée** : 21 semaines (5 mois)  
**Jours homme estimés** : ~315 jours (1,5 FTE × 21 semaines)

---

## II. ARCHITECTURE DECISIONS

### 2.1 Architecture cible : Modular Monolith

**Décision** : Modular Monolith (et non micro-frontends)

**Justification** :
- Taille de l'équipe : 1-3 développeurs → les micro-frontends sont sur-ingénierie
- déploiement unique simplifié (pas de registry de composants)
- migration incrémentale possible depuis le monolithe
- communication inter-modules via app state (Zustand), pas de RPC

**ADR (Architecture Decision Records)** :

| # | Décision | Alternative rejetée | Justification |
|---|---|---|---|
| ADR-1 | Modular Monolith | Micro-frontends | Trop complexe pour l'équipe actuelle |
| ADR-2 | Zustand + TanStack Query | Redux Toolkit | Zustand plus léger, TanStack Query pour le cache serveur |
| ADR-3 | Tiptap (Remplacé MDXEditor) | MDXEditor, Slate.js | Tiptap : inline IA native, meilleure extensionibilité |
| ADR-4 | Prisma + SQLite (dev) / PostgreSQL (prod) | Drizzle, Kysely | Prisma : type-safe, migrations, écosystème mature |
| ADR-5 | Server Actions + Route Handlers | tRPC | Server Actions natifs Next.js 16, pas de dépendance supplémentaire |
| ADR-6 | Vitest + Playwright | Jest + Cypress | Vitest : compatible Vite/Next.js, Playwright : E2E moderne |
| ADR-7 | Pattern Feature-Sliced Design | Clean Architecture brute | FSD : pragmatique, adapté au Next.js App Router |

---

### 2.2 Structure des dossiers cible

```
src/
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Route group : authentification
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (dashboard)/                  # Route group : espace doctorant
│   │   ├── workspace/
│   │   │   └── page.tsx              # Éditeur principal (layout éclaté)
│   │   ├── methodology/
│   │   │   └── page.tsx
│   │   ├── articles/
│   │   │   └── page.tsx
│   │   ├── references/
│   │   │   └── page.tsx
│   │   ├── plan/
│   │   │   └── page.tsx
│   │   ├── ai-tools/
│   │   │   ├── humanizer/
│   │   │   ├── consensus/
│   │   │   ├── notebook/
│   │   │   └── dataviz/
│   │   ├── academy-db/
│   │   │   └── page.tsx
│   │   └── layout.tsx                # Dashboard layout avec sidebar
│   ├── (admin)/                      # Route group : administration
│   │   ├── licenses/
│   │   ├── users/
│   │   └── layout.tsx
│   ├── api/                          # Route Handlers
│   │   ├── thesis/
│   │   │   ├── route.ts              # GET (list), POST (create)
│   │   │   ├── [id]/
│   │   │   │   └── route.ts          # GET, PATCH, DELETE
│   │   │   ├── chapters/
│   │   │   │   └── route.ts
│   │   │   └── parts/
│   │   │       └── route.ts
│   │   ├── ai/
│   │   │   ├── chat/route.ts         # Chat assistant IA
│   │   │   ├── humanize/route.ts
│   │   │   ├── consensus/route.ts
│   │   │   └── directeur/route.ts
│   │   ├── references/
│   │   │   └── route.ts
│   │   ├── mendeley/
│   │   │   └── route.ts
│   │   ├── notebook/
│   │   │   ├── route.ts
│   │   │   └── knowledge-graph/route.ts
│   │   ├── latex/
│   │   │   └── generate/route.ts
│   │   ├── export/
│   │   │   ├── pdf/route.ts
│   │   │   └── office/route.ts
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts
│   │   │   └── providers/route.ts
│   │   ├── licenses/
│   │   │   └── route.ts
│   │   └── research/
│   │       ├── sources/route.ts
│   │       └── verification/route.ts
│   ├── layout.tsx
│   ├── page.tsx                      # Landing / Redirect vers dashboard
│   └── globals.css
│
├── modules/                          # DOMAIN MODULES (Feature-Sliced)
│   ├── thesis/                      # Module : Gestion de thèse
│   │   ├── api/                      # Server-side (API layer)
│   │   │   ├── thesis.service.ts     # Logique métier
│   │   │   ├── thesis.repository.ts  # Accès données (Prisma)
│   │   │   ├── thesis.types.ts      # Types domain
│   │   │   └── thesis.validators.ts  # Zod schemas
│   │   ├── components/               # Composants UI du module
│   │   │   ├── editor/
│   │   │   │   ├── thesis-editor.tsx
│   │   │   │   ├── chapter-tabs.tsx
│   │   │   │   ├── chapter-header.tsx
│   │   │   │   └── part-manager.tsx
│   │   │   ├── cadrage/
│   │   │   │   ├── cadrage-panel.tsx
│   │   │   │   └── cadrage-field.tsx
│   │   │   └── plan/
│   │   │       └── latex-generator.tsx
│   │   ├── hooks/                    # Hooks du module
│   │   │   ├── use-thesis.ts
│   │   │   ├── use-chapter.ts
│   │   │   └── use-auto-save.ts
│   │   ├── store/                    # Zustand store du module
│   │   │   └── thesis.store.ts
│   │   └── index.ts                  # Barrel export (public API)
│   │
│   ├── ai-writing/                   # Module : IA Écriture
│   │   ├── api/
│   │   │   ├── ai-writing.service.ts
│   │   │   ├── ai-writing.adapters.ts  # Pattern adapter (z-ai, OpenAI, etc.)
│   │   │   └── prompts/
│   │   │       ├── scientific-writing.ts
│   │   │       ├── literature-review.ts
│   │   │       ├── paraphrase.ts
│   │   │       └── ... (10 modes)
│   │   ├── components/
│   │   │   ├── chat-panel.tsx
│   │   │   ├── mode-selector.tsx
│   │   │   └── inline-ai-menu.tsx
│   │   ├── hooks/
│   │   │   └── use-ai-chat.ts
│   │   ├── store/
│   │   │   └── ai-writing.store.ts
│   │   └── index.ts
│   │
│   ├── methodology/                  # Module : Méthodologie
│   │   ├── data/
│   │   │   ├── methodology-guide.ts
│   │   │   ├── methodology.types.ts
│   │   │   └── aptitude-quiz.ts
│   │   ├── components/
│   │   │   ├── methodology-tabs.tsx
│   │   │   ├── demarche-panel.tsx
│   │   │   ├── problematique-panel.tsx
│   │   │   ├── variables-panel.tsx
│   │   │   ├── outils-collecte-panel.tsx
│   │   │   ├── documentation-panel.tsx
│   │   │   ├── concepts-panel.tsx
│   │   │   └── aptitude-panel.tsx
│   │   └── index.ts
│   │
│   ├── articles/                     # Module : Articles scientifiques
│   │   ├── data/
│   │   │   ├── articles-guide.ts
│   │   │   └── imrad-guide.ts
│   │   ├── components/
│   │   │   ├── articles-tabs.tsx
│   │   │   ├── etapes-panel.tsx
│   │   │   ├── imrad-panel.tsx
│   │   │   ├── erreurs-panel.tsx
│   │   │   ├── checklist-panel.tsx
│   │   │   ├── boite-outils-panel.tsx
│   │   │   ├── revue-guide-panel.tsx
│   │   │   └── soutenance-panel.tsx
│   │   └── index.ts
│   │
│   ├── references/                   # Module : Références bibliographiques
│   │   ├── api/
│   │   │   ├── references.service.ts
│   │   │   ├── references.repository.ts
│   │   │   ├── mendeley.service.ts
│   │   │   └── bibtex.service.ts
│   │   ├── components/
│   │   │   ├── references-list.tsx
│   │   │   ├── reference-form.tsx
│   │   │   ├── mendeley-connect.tsx
│   │   │   ├── bibtex-export.tsx
│   │   │   └── reference-search.tsx
│   │   ├── hooks/
│   │   │   └── use-references.ts
│   │   ├── store/
│   │   │   └── references.store.ts
│   │   └── index.ts
│   │
│   ├── ai-tools/                     # Module : Outils IA avancés
│   │   ├── humanizer/
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   └── index.ts
│   │   ├── consensus/
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   └── index.ts
│   │   ├── notebook/
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   │   ├── notebook-panel.tsx
│   │   │   │   ├── knowledge-graph.tsx
│   │   │   │   └── qa-panel.tsx
│   │   │   └── index.ts
│   │   ├── dataviz/
│   │   │   ├── components/
│   │   │   │   ├── chart-editor.tsx
│   │   │   │   ├── chart-types.tsx
│   │   │   │   └── svg-export.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── academy-databases/            # Module : Bases de données académiques
│   │   ├── data/
│   │   │   └── academic-databases.ts
│   │   ├── components/
│   │   │   └── databases-grid.tsx
│   │   └── index.ts
│   │
│   ├── research/                     # Module : Recherche approfondie
│   │   ├── api/
│   │   │   ├── research.service.ts
│   │   │   └── verification.service.ts
│   │   ├── components/
│   │   │   ├── recherche-panel.tsx
│   │   │   ├── fiches-lecture.tsx
│   │   │   ├── veille-panel.tsx
│   │   │   └── verification-panel.tsx
│   │   ├── data/
│   │   │   └── verification-referentials.ts
│   │   └── index.ts
│   │
│   ├── planning/                     # Module : Planification agile
│   │   ├── api/
│   │   │   └── agile.service.ts
│   │   ├── components/
│   │   │   ├── agile-roadmap.tsx
│   │   │   ├── sprint-board.tsx
│   │   │   └── story-card.tsx
│   │   ├── store/
│   │   │   └── agile.store.ts
│   │   └── index.ts
│   │
│   ├── export/                       # Module : Export & Production
│   │   ├── api/
│   │   │   ├── pdf.service.ts
│   │   │   ├── office.service.ts
│   │   │   └── latex.service.ts
│   │   ├── components/
│   │   │   ├── export-panel.tsx
│   │   │   ├── pdf-export.tsx
│   │   │   └── office-export.tsx
│   │   └── index.ts
│   │
│   ├── auth/                         # Module : Authentification
│   │   ├── api/
│   │   │   ├── auth.service.ts
│   │   │   ├── providers/
│   │   │   │   ├── auth0.adapter.ts
│   │   │   │   ├── stytch.adapter.ts
│   │   │   │   └── warrant.adapter.ts
│   │   │   └── license.service.ts
│   │   ├── components/
│   │   │   ├── login-form.tsx
│   │   │   ├── provider-settings.tsx
│   │   │   └── license-activation.tsx
│   │   └── index.ts
│   │
│   └── shared/                       # Module partagé
│       ├── components/               # Composants réutilisables
│       │   ├── layout/
│       │   │   ├── app-sidebar.tsx
│       │   │   ├── app-header.tsx
│       │   │   ├── breadcrumb-nav.tsx
│       │   │   └── mobile-nav.tsx
│       │   ├── editor/
│       │   │   ├── tiptap-wrapper.tsx
│       │   │   ├── plain-text-editor.tsx
│       │   │   └── editor-toolbar.tsx
│       │   ├── feedback/
│       │   │   ├── loading-skeleton.tsx
│       │   │   ├── error-boundary.tsx
│       │   │   └── empty-state.tsx
│       │   └── ai/
│       │       ├── ai-chat-bubble.tsx
│       │       ├── ai-loading.tsx
│       │       └── streaming-text.tsx
│       ├── hooks/
│       │   ├── use-debounce.ts
│       │   ├── use-local-storage.ts
│       │   ├── use-keyboard-shortcuts.ts
│       │   ├── use-auto-save.ts
│       │   └── use-media-query.ts
│       ├── stores/
│       │   └── ui.store.ts           # UI state global (sidebar, theme, modals)
│       ├── utils/
│       │   ├── cn.ts
│       │   ├── format.ts
│       │   ├── bibtex-parser.ts
│       │   └── word-count.ts
│       ├── types/
│       │   ├── common.ts
│       │   └── api.ts
│       └── constants/
│           ├── routes.ts
│           └── config.ts
│
├── components/                       # shadcn/ui (générés)
│   └── ui/
│       └── ...
│
├── hooks/                            # Hooks globaux
│   ├── use-toast.ts
│   └── use-mobile.ts
│
├── lib/                              # Configuration applicative
│   ├── db.ts                         # Prisma client singleton
│   ├── ai-client.ts                 # z-ai-web-dev-sdk wrapper
│   └── utils.ts                      # cn() helper
│
├── data/                             # Données statiques (guides, prompts)
│   ├── methodology-guide.ts          # 830+ lignes
│   ├── articles-guide.ts
│   ├── latex-template.ts
│   ├── chapters-structure.ts
│   ├── directeur-prompt.ts
│   ├── slr-protocol-guide.ts
│   ├── apa-stats-rules.ts
│   ├── academic-databases.ts
│   └── ...
│
└── __tests__/                        # Tests (mirroir de src/)
    ├── modules/
    │   ├── thesis/
    │   │   ├── api/
    │   │   │   └── thesis.service.test.ts
    │   │   └── components/
    │   │       └── thesis-editor.test.tsx
    │   ├── ai-writing/
    │   │   └── api/
    │   │       └── ai-writing.service.test.ts
    │   └── ...
    ├── e2e/
    │   ├── workspace.spec.ts
    │   ├── ai-chat.spec.ts
    │   └── references.spec.ts
    └── setup/
        ├── vitest.setup.ts
        └── test-utils.tsx
```

---

### 2.3 Stratégie de gestion d'état

```
┌─────────────────────────────────────────────────────────┐
│                    Couches d'État                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. SERVER STATE (Source de vérité)                     │
│     ├── Prisma / SQLite (PostgreSQL en prod)            │
│     ├── Accès via TanStack Query                         │
│     └── Cache automatique, invalidation, optimistic     │
│                                                          │
│  2. MODULE STATE (Zustand - par module)                  │
│     ├── thesis.store.ts → thèse active, chapitre, mode  │
│     ├── ai-writing.store.ts → messages, mode, provider    │
│     ├── references.store.ts → filtres, sélection         │
│     ├── ui.store.ts → sidebar, panels, thème, dialogs    │
│     └── Isolation : un store ne dépend pas d'un autre     │
│                                                          │
│  3. UI LOCAL STATE (useState - composant)               │
│     ├── État de focus input                              │
│     ├── État d'animation                                │
│     └── État transitoire (pas de persistance)            │
│                                                          │
│  4. URL STATE (Next.js Router)                           │
│     ├── Chapitre actif : /workspace?chapter=ch-3        │
│     ├── Onglet actif : /workspace?tab=methodology        │
│     ├── Mode éditeur : /workspace?editor=rich            │
│     └── Partage de liens, navigation back/forward        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

### 2.4 Design patterns API

| Pattern | Utilisation | Exemple |
|---|---|---|
| **RESTful** | CRUD standard | `GET/POST /api/thesis`, `PATCH /api/thesis/chapters/[id]` |
| **Server Action** | Mutations simples | `saveThesis()`, `toggleChapter()` |
| **Streaming** | Réponses IA | `POST /api/ai/chat` → ReadableStream |
| **Adapter** | Multi-fournisseur IA | `IAiProvider` → `ZAiAdapter`, `OpenAiAdapter` |
| **Repository** | Abstraction DB | `IThesisRepository` → `PrismaThesisRepository` |
| **Observer** | Temps réel (futur) | WebSocket pour collaboration multi-utilisateur |

---

### 2.5 Pyramide de tests

```
          ╱╲
         ╱E2E╲          10% — Playwright
        ╱──────╲         Scénarios critiques :
       ╱        ╲        - Édition et sauvegarde de chapitre
      ╱ Intégration╲     - Conversation IA (10 modes)
     ╱──────────────╲    - CRUD références + export BibTeX
    ╱                ╲   - Authentification et activation licence
   ╱   Unitaires     ╲  80% — Vitest + React Testing Library
  ╱────────────────────╲ Services, hooks, stores, composants,
 ╱                      ╲ validators, parsers
╱________________________╲
```

**Objectifs de couverture** :
- Services (logique métier) : ≥ 90%
- Hooks : ≥ 85%
- Stores Zustand : ≥ 85%
- Composants UI : ≥ 70%
- E2E : 15 scénarios critiques

---

### 2.6 Pipeline CI/CD

```yaml
# .github/workflows/ci.yml (ciblage)
trigger: push / PR on main & develop

Jobs:
  1. lint:
      - eslint .
      - tsc --noEmit (strict, PAS ignoreBuildErrors)
      - prettier --check

  2. unit-tests:
      - vitest run --coverage
      - Seuil: 80% lignes, 75% branches

  3. build:
      - next build (sans ignoreBuildErrors)
      - Lighthouse CI (performance budget)

  4. e2e (sur merge main):
      - playwright test
      - Base de données de test SQLite in-memory

  5. deploy (sur tag v*):
      - Docker build
      - Déploiement Vercel / VPS
      - Migration Prisma
```

---

## III. ROADMAP — PHASES DETAILLEES

---

### PHASE 0 : FONDATIONS & AUDIT
**Durée** : 2 semaines (10 jours)  
**Date cible** : Semaine 1-2  

#### Objectifs
- Établir les fondations techniques solides (build, tests, CI)
- Corriger les problèmes critiques C1-C5
- Configurer l'infrastructure de développement
- Documenter l'état existant et les écarts

#### Epic 0.1 : Assainissement du projet

| # | Tâche | Description | Effort (j) | Dépendances |
|---|---|---|---|---|
| 0.1.1 | Corriger `next.config.ts` | Retirer `ignoreBuildErrors: true`, activer `reactStrictMode: true` | 0.5 | — |
| 0.1.2 | Corriger le package.json | Renommer en `thesisframe`, version `1.0.0-dev.0` | 0.5 | — |
| 0.1.3 | Configurer TypeScript strict | `noImplicitAny: true`, `strictNullChecks: true`, corriger les erreurs | 1 | 0.1.1 |
| 0.1.4 | Configurer ESLint avancé | Ajouter `@typescript-eslint`, règles strictes, no-any | 0.5 | 0.1.2 |
| 0.1.5 | Configurer Prettier | `.prettierrc`, intégration ESLint, formatage automatique | 0.5 | 0.1.4 |
| 0.1.6 | Nettoyer le layout.tsx | Metadata ThesisFrame, favicon, meta OG | 0.5 | 0.1.2 |
| 0.1.7 | Configurer Husky + lint-staged | Pre-commit hooks, formatage + lint auto | 0.5 | 0.1.4, 0.1.5 |

**Total Epic 0.1** : 4 jours

#### Epic 0.2 : Infrastructure de test

| # | Tâche | Description | Effort (j) | Dépendances |
|---|---|---|---|---|
| 0.2.1 | Installer Vitest | Configuration `vitest.config.ts`, scripts test/watch/coverage | 1 | 0.1.1 |
| 0.2.2 | Installer React Testing Library | `@testing-library/react`, `@testing-library/jest-dom`, setup | 1 | 0.2.1 |
| 0.2.3 | Installer Playwright | Configuration E2E, base de données test, premier test smoke | 2 | 0.1.1 |
| 0.2.4 | Configurer les fixtures de test | Mock Prisma, mock z-ai SDK, factories de données | 1.5 | 0.2.1 |
| 0.2.5 | Écrire les premiers tests | Tests unitaires pour `cn()`, `db.ts`, `utils.ts` | 1 | 0.2.1, 0.2.2 |

**Total Epic 0.2** : 6.5 jours

#### Epic 0.3 : CI/CD & Convention

| # | Tâche | Description | Effort (j) | Dépendances |
|---|---|---|---|---|
| 0.3.1 | Configurer GitHub Actions CI | Lint → Build → Test pipeline | 1 | 0.2.1 |
| 0.3.2 | Configurer les conventions | `.editorconfig`, commitlint, conventional commits | 0.5 | 0.1.7 |
| 0.3.3 | Documenter l'Audit | Document markdown avec tous les problèmes identifiés | 1 | — |

**Total Epic 0.3** : 2.5 jours

#### Livrables Phase 0
- [ ] Build Next.js clean (0 erreurs TypeScript)
- [ ] Suite de tests fonctionnelle (Vitest + RTL + Playwright)
- [ ] Pipeline CI vert sur GitHub Actions
- [ ] Document d'audit technique validé
- [ ] Conventions de code documentées

#### Critères d'acceptation
- `next build` passe sans erreur ni `ignoreBuildErrors`
- `vitest run --coverage` passe avec ≥ 50% sur les fichiers existants
- `playwright test` passe sur un scénario smoke basique
- CI GitHub Actions vert sur un commit sur `develop`

---

### PHASE 1 : ARCHITECTURE NOYAU
**Durée** : 3 semaines (15 jours)  
**Date cible** : Semaine 3-5  

#### Objectifs
- Implémenter la structure modulaire Feature-Sliced Design
- Créer le module `shared` (layout, composants réutilisables, stores)
- Implémenter le module `auth` (NextAuth.js + gestion licences)
- Établir les patterns de service, repository, et store

#### Epic 1.1 : Module Shared — Layout & Navigation

| # | Tâche | Description | Effort (j) | Dépendances |
|---|---|---|---|---|
| 1.1.1 | Créer la structure de dossiers modules/ | Créer tous les dossiers Feature-Sliced avec barrel exports vides | 0.5 | Phase 0 |
| 1.1.2 | Implémenter `ui.store.ts` (Zustand) | Sidebar, theme, panels ouverts, mode éditeur, modals | 2 | 1.1.1 |
| 1.1.3 | Créer `app-sidebar.tsx` | Navigation latérale avec icônes, badges, sections (groupes) | 2 | 1.1.1, 1.1.2 |
| 1.1.4 | Créer `app-header.tsx` | Header avec breadcrumb, recherche globale, profil | 1.5 | 1.1.1 |
| 1.1.5 | Créer `mobile-nav.tsx` | Navigation mobile (Sheet + Drawer) responsive | 1.5 | 1.1.1 |
| 1.1.6 | Créer `breadcrumb-nav.tsx` | Navigation fil d'Ariane dynamique depuis routes | 1 | 1.1.1 |
| 1.1.7 | Layout dashboard `(dashboard)/layout.tsx` | Layout avec sidebar + header + main content | 1 | 1.1.3, 1.1.4 |
| 1.1.8 | Page landing `/` | Redirect vers `/workspace` si connecté, sinon `/login` | 0.5 | 1.1.7 |
| 1.1.9 | Tests du layout | Unit tests stores, render tests composants layout | 2 | 1.1.2-1.1.8 |

**Total Epic 1.1** : 12 jours

#### Epic 1.2 : Module Auth — Authentification & Licences

| # | Tâche | Description | Effort (j) | Dépendances |
|---|---|---|---|---|
| 1.2.1 | Schéma Prisma User | Créer le modèle User complet (name, email, role, etc.) | 1 | Phase 0 |
| 1.2.2 | Configurer NextAuth.js | Provider credentials + adaptation future providers externes | 2 | 1.2.1 |
| 1.2.3 | Créer `auth.service.ts` | Login, register, session, password reset | 2 | 1.2.2 |
| 1.2.4 | Créer les pages auth `(auth)/` | Login, Register, Forgot Password | 2 | 1.2.3 |
| 1.2.5 | Middleware Next.js | Protection des routes `/dashboard/*` → redirect `/login` | 1 | 1.2.2 |
| 1.2.6 | Modèles Licence (Prisma) | `LicenseKey`, `Activation` — migrer depuis GitHub | 1 | 1.2.1 |
| 1.2.7 | `license.service.ts` | Activation, validation, vérification de quota | 2 | 1.2.6 |
| 1.2.8 | Composant `license-activation.tsx` | Formulaire d'activation licence avec validation | 1.5 | 1.2.7 |
| 1.2.9 | Tests auth & licence | Unit tests services, E2E login/activation | 2 | 1.2.3-1.2.8 |

**Total Epic 1.2** : 14.5 jours (parallélisable avec Epic 1.1)

> **Note** : Epic 1.1 et 1.2 peuvent être partiellement parallélisés. Un développeur fait le layout pendant l'autre configure l'auth.

#### Epic 1.3 : Patterns Architecturaux (Référence)

| # | Tâche | Description | Effort (j) | Dépendances |
|---|---|---|---|---|
| 1.3.1 | Pattern Service | Créer `thesis.service.ts` comme référence (CRUD thèse) | 2 | 1.1.1 |
| 1.3.2 | Pattern Repository | Créer `thesis.repository.ts` (Prisma) | 1.5 | 1.3.1 |
| 1.3.3 | Pattern Validator | Créer `thesis.validators.ts` (Zod) | 1 | 1.3.1 |
| 1.3.4 | Pattern Store | Créer `thesis.store.ts` (Zustand + TanStack Query) | 2 | 1.3.1, 1.1.2 |
| 1.3.5 | Pattern Hook | Créer `use-thesis.ts` (encapsulation store + actions) | 1.5 | 1.3.4 |
| 1.3.6 | Documenter les patterns | ADR doc, README pour chaque pattern | 1 | 1.3.1-1.3.5 |

**Total Epic 1.3** : 9 jours

#### Livrables Phase 1
- [ ] Structure modulaire Feature-Sliced complète
- [ ] Layout responsive (desktop + mobile) fonctionnel
- [ ] Authentification fonctionnelle (login/register/session)
- [ ] Système de licences actif
- [ ] Patterns architecture documentés et exemplifiés
- [ ] Couverture de tests ≥ 70% sur les nouveaux modules

#### Critères d'acceptation
- Navigation complète entre toutes les sections (même si vides)
- Login → redirect vers `/workspace`
- Non-authentifié → redirect vers `/login`
- Activation d'une licence valide fonctionne E2E
- Tous les patterns (Service, Repository, Validator, Store, Hook) sont implémentés et testés

---

### PHASE 2 : COUCHE DONNÉES & API
**Durée** : 2 semaines (10 jours)  
**Date cible** : Semaine 6-7  

#### Objectifs
- Migrer et nettoyer le schéma Prisma complet (20+ modèles)
- Implémenter tous les services et repositories backend
- Créer les API RESTful avec validation Zod uniforme
- Implémenter le middleware de gestion d'erreurs

#### Epic 2.1 : Schéma Prisma Complet

| # | Tâche | Description | Effort (j) | Dépendances |
|---|---|---|---|---|
| 2.1.1 | Modèles Thèse | `Thesis`, `Chapter`, `Part` — nettoyés, contraintes ajoutées | 1 | Phase 1 |
| 2.1.2 | Modèles Cadrage | `ThesisCadrage`, `ThesisCadrageField`, `ThesisCadrageVersion` | 0.5 | 2.1.1 |
| 2.1.3 | Modèles Références (unifiés) | Fusionner `Reference` et `SourceBibliographique`, garder `FicheLecture`, `RechercheSauvegardee` | 1.5 | Phase 1 |
| 2.1.4 | Modèles Notebook | `ResearchSource`, `NotebookEntry`, `AiToolConfig` | 0.5 | Phase 1 |
| 2.1.5 | Modèles Vérification | `ElementAnalyse`, `TypeAnalyseMethodologique`, `SessionVerification` | 0.5 | Phase 1 |
| 2.1.6 | Modèles Agile | `AgileSprint`, `AgileStory` | 0.5 | Phase 1 |
| 2.1.7 | Modèles Auth avancés | `AuthProvider`, `AuthAccount`, `WarrantPolicy` | 1 | Phase 1 |
| 2.1.8 | Modèles Cloud & Books | `CloudDriveConnection`, `CustomBookSkill` | 0.5 | Phase 1 |
| 2.1.9 | Migration initiale | `prisma migrate dev --name init` + seed data | 1 | 2.1.1-2.1.8 |
| 2.1.10 | Tests schéma | Validation des contraintes, tests de seed | 1 | 2.1.9 |

**Total Epic 2.1** : 8 jours

#### Epic 2.2 : Services & Repositories Backend

| # | Tâche | Description | Effort (j) | Dépendances |
|---|---|---|---|---|
| 2.2.1 | `thesis.service.ts` + repository | CRUD thèse, chapitres, parties, auto-save | 2 | 2.1.1 |
| 2.2.2 | `references.service.ts` + repository | CRUD références, recherche, BibTeX export | 2 | 2.1.3 |
| 2.2.3 | `cadrage.service.ts` + repository | CRUD cadrage, versioning, snapshot | 1.5 | 2.1.2 |
| 2.2.4 | `notebook.service.ts` + repository | CRUD notebook, Q&A IA | 1.5 | 2.1.4 |
| 2.2.5 | `mendeley.service.ts` | OAuth flow, import, déduplication | 2 | 2.1.3 |
| 2.2.6 | `latex.service.ts` | Génération template LaTeX personnalisé | 1.5 | 2.1.1 |
| 2.2.7 | `agile.service.ts` + repository | CRUD sprints, stories | 1 | 2.1.6 |
| 2.2.8 | `license.service.ts` | Activation, validation, quota, hash | 1.5 | 1.2.6 |
| 2.2.9 | `research.service.ts` | Sources, fiches de lecture, veille | 1.5 | 2.1.5 |
| 2.2.10 | `verification.service.ts` | Vérification méthodologique Module A+B | 1.5 | 2.1.5 |
| 2.2.11 | Tests unitaires services | ≥ 90% couverture sur tous les services | 3 | 2.2.1-2.2.10 |

**Total Epic 2.2** : 18 jours (parallélisable — 2 devs)

#### Epic 2.3 : API Routes & Middleware

| # | Tâche | Description | Effort (j) | Dépendances |
|---|---|---|---|---|
| 2.3.1 | Middleware d'erreurs uniforme | Error handler global, format de réponse standard | 1 | 2.2.1 |
| 2.3.2 | Middleware de validation | Validation Zod automatique sur les body/params | 1 | 2.2.1 |
| 2.3.3 | API Routes Thèse | `/api/thesis/*` — GET, POST, PATCH, DELETE | 2 | 2.2.1, 2.3.1 |
| 2.3.4 | API Routes Références | `/api/references/*`, `/api/mendeley/*` | 2 | 2.2.2, 2.2.5 |
| 2.3.5 | API Routes Notebook | `/api/notebook/*`, `/api/knowledge-graph/*` | 1.5 | 2.2.4 |
| 2.3.6 | API Routes Export | `/api/export/pdf/*`, `/api/export/office/*`, `/api/latex/*` | 2 | 2.2.6 |
| 2.3.7 | API Routes Planning | `/api/agile/*` | 1 | 2.2.7 |
| 2.3.8 | API Routes Auth | `/api/auth/*`, `/api/licenses/*` | 1.5 | 2.2.8 |
| 2.3.9 | API Routes Recherche | `/api/research/*`, `/api/verification/*` | 1.5 | 2.2.9, 2.2.10 |
| 2.3.10 | Tests API | Tests d'intégration sur toutes les routes | 3 | 2.3.1-2.3.9 |

**Total Epic 2.3** : 16.5 jours (parallélisable)

#### Livrables Phase 2
- [ ] Schéma Prisma complet avec migrations
- [ ] 10+ services backend avec ≥ 90% couverture
- [ ] 40+ API routes fonctionnelles et testées
- [ ] Middleware d'erreurs et validation uniformes
- [ ] Format de réponse API standardisé

#### Critères d'acceptation
- `prisma migrate dev` passe sans erreur
- Toutes les API routes retournent des réponses formatées uniformément
- Tests d'intégration API ≥ 85%
- Aucune clé API stockée côté client

---

### PHASE 3 : ÉDITEUR CENTRAL & WORKSPACE
**Durée** : 3 semaines (15 jours)  
**Date cible** : Semaine 8-10  

#### Objectifs
- Construire l'éditeur Tiptap avec toutes les extensions
- Implémenter le workspace de thèse (chapitres, parties, auto-save)
- Créer le système de templates et le cadrage
- Implémenter la dictée vocale (ASR)

#### Epic 3.1 : Éditeur Tiptap Rich

| # | Tâche | Description | Effort (j) | Dépendances |
|---|---|---|---|---|
| 3.1.1 | Installer Tiptap | `@tiptap/react`, `@tiptap/starter-kit`, 10 extensions | 1 | Phase 2 |
| 3.1.2 | Créer `tiptap-wrapper.tsx` | Composant wrapper avec configuration, menubar, toolbar | 2 | 3.1.1 |
| 3.1.3 | Extension compteur de mots | `@tiptap/extension-character-count`, affichage en temps réel | 1 | 3.1.2 |
| 3.1.4 | Extension coloration syntaxique | `@tiptap/extension-code-block-lowlight`, `lowlight` | 1.5 | 3.1.2 |
| 3.1.5 | Extension liaison | `@tiptap/extension-link`, contrôle des liens | 0.5 | 3.1.2 |
| 3.1.6 | Extension placeholder | `@tiptap/extension-placeholder`, texte d'aide par chapitre | 0.5 | 3.1.2 |
| 3.1.7 | Éditeur mode plain text | Toggle rich ↔ plain (textarea fallback) | 1 | 3.1.2 |
| 3.1.8 | Raccourcis clavier | Ctrl+S save, Ctrl+Shift+[/] navigation chapitres | 1 | 3.1.2 |
| 3.1.9 | Tests éditeur | Rendu, extensions, compteur, sauvegarde | 2 | 3.1.2-3.1.8 |

**Total Epic 3.1** : 10.5 jours

#### Epic 3.2 : Workspace Thèse

| # | Tâche | Description | Effort (j) | Dépendances |
|---|---|---|---|---|
| 3.2.1 | Page `/workspace` | Layout principal : sidebar + editor + help panel | 2 | Phase 1 |
| 3.2.2 | `chapter-tabs.tsx` | Onglets horizontaux de navigation chapitres | 2 | 3.2.1, 2.2.1 |
| 3.2.3 | `chapter-header.tsx` | En-tête chapitre (numéro, titre, statut, word count) | 1.5 | 3.2.2 |
| 3.2.4 | `part-manager.tsx` | Gestion des parties (ajout, suppression, réorganisation) | 2 | 3.2.2, 2.2.1 |
| 3.2.5 | `use-auto-save.ts` | Hook auto-save avec debounce 2s, status indicator | 2 | 3.1.2, 2.3.3 |
| 3.2.6 | `use-thesis.ts` (complet) | Hook : CRUD chapitres, reorder, rename, switch mode | 3 | 2.2.1, 2.3.3 |
| 3.2.7 | Gestion des modes (chapters/parts) | Toggle mode chapitres ↔ parties | 1.5 | 3.2.4, 3.2.6 |
| 3.2.8 | `chapter-editor.tsx` | Composant principal assemblant Tiptap + header + tabs | 1.5 | 3.1.2, 3.2.3, 3.2.5 |
| 3.2.9 | Templates de thèse | Dialog de sélection et application de templates | 2 | 2.2.6, 3.2.6 |
| 3.2.10 | Tests workspace | Unit + intégration E2E (save, navigate, reorder) | 3 | 3.2.1-3.2.9 |

**Total Epic 3.2** : 20.5 jours

#### Epic 3.3 : Cadrage & Dictée

| # | Tâche | Description | Effort (j) | Dépendances |
|---|---|---|---|---|
| 3.3.1 | `cadrage-panel.tsx` | Panel cadrage avec tous les champs (thématique, problématique, etc.) | 3 | 2.2.3 |
| 3.3.2 | Versioning du cadrage | Snapshot, comparaison versions, rollback | 2 | 2.2.3 |
| 3.3.3 | Intégration ASR | Dictée vocale → texte → insertion dans chapitre | 2 | z-ai SDK ASR |
| 3.3.4 | Post-traitement dictée | Correction automatique post-transcription | 1 | 3.3.3 |
| 3.3.5 | Tests cadrage + dictée | Tests unitaires et E2E | 2 | 3.3.1-3.3.4 |

**Total Epic 3.3** : 10 jours

#### Livrables Phase 3
- [ ] Éditeur Tiptap avec 10 extensions fonctionnel
- [ ] Workspace complet avec navigation chapitres/parts
- [ ] Auto-save fonctionnel avec indicateur de statut
- [ ] Panel cadrage avec versioning
- [ ] Dictée vocale intégrée
- [ ] Templates de thèse applicables
- [ ] Tests E2E du workspace (créer, éditer, sauvegarder, naviguer)

#### Critères d'acceptation
- Un doctorant peut créer une thèse, écrire dans un chapitre, sauvegarder
- Auto-save s'active après 2s d'inactivité
- Compteur de mots en temps réel
- Basculement mode rich ↔ plain fonctionne sans perte de contenu
- E2E : création → rédaction → sauvegarde → rechargement → contenu intact

---

### PHASE 4 : MOTEUR IA & ASSISTANT
**Durée** : 3 semaines (15 jours)  
**Date cible** : Semaine 11-13  

#### Objectifs
- Implémenter le pattern Adapter multi-fournisseur IA
- Porter les 10 modes d'écriture IA avec leurs prompts
- Créer le chat Assistant IA avec streaming
- Implémenter le Directeur Chat (IA superviseur)
- Créer les outils IA avancés (Humanizer, Consensus)

#### Epic 4.1 : Infrastructure IA Multi-Fournisseur

| # | Tâche | Description | Effort (j) | Dépendances |
|---|---|---|---|---|
| 4.1.1 | Interface `IAiProvider` | TypeScript interface : chat(), complete(), stream() | 1 | Phase 2 |
| 4.1.2 | `ZAiAdapter` | Implémentation z-ai-web-dev-sdk | 2 | 4.1.1 |
| 4.1.3 | `OpenAiAdapter` | Implémentation OpenAI-compatible (pour RoutesMe) | 2 | 4.1.1 |
| 4.1.4 | `ProviderFactory` | Factory pattern pour sélection du provider | 1 | 4.1.2, 4.1.3 |
| 4.1.5 | Gestion sécurisée des clés | Stockage server-side, chiffrement, pas de localStorage | 2 | 4.1.2 |
| 4.1.6 | Configuration provider (admin) | UI settings dialog pour sélection/config provider | 1.5 | 4.1.4 |
| 4.1.7 | Tests infrastructure IA | Mock providers, tests factory, tests sécurité | 2 | 4.1.1-4.1.6 |

**Total Epic 4.1** : 11.5 jours

#### Epic 4.2 : Chat IA — 10 Modes d'Écriture

| # | Tâche | Description | Effort (j) | Dépendances |
|---|---|---|---|---|
| 4.2.1 | Migrer les 10 prompts IA | Copier et adapter les prompts depuis GitHub (data/) | 1.5 | Phase 0 |
| 4.2.2 | Versionner les prompts | Système de versioning des prompts (tests de snapshot) | 1.5 | 4.2.1 |
| 4.2.3 | API `/api/ai/chat` avec streaming | Server-Sent Events / ReadableStream pour réponses IA | 2 | 4.1.2 |
| 4.2.4 | `ai-writing.store.ts` | Messages, mode actif, loading, provider config | 1.5 | 4.1.4 |
| 4.2.5 | `chat-panel.tsx` | Interface de chat avec bulles, mode selector, input | 2.5 | 4.2.3, 4.2.4 |
| 4.2.6 | `mode-selector.tsx` | Sélecteur des 10 modes avec descriptions | 1 | 4.2.5 |
| 4.2.7 | `inline-ai-menu.tsx` | Menu contextuel dans l'éditeur Tiptap (sélection → IA) | 2 | 3.1.2, 4.2.3 |
| 4.2.8 | Historique des conversations | Persistance des conversations en base | 1.5 | 2.2.4 |
| 4.2.9 | Tests IA | Tests streaming, prompts, modes, inline menu | 3 | 4.2.1-4.2.8 |

**Total Epic 4.2** : 16.5 jours

#### Epic 4.3 : Directeur Chat & Outils IA

| # | Tâche | Description | Effort (j) | Dépendances |
|---|---|---|---|---|
| 4.3.1 | Migrer le prompt Directeur | Prompt IA pour le directeur de thèse | 0.5 | 4.2.1 |
| 4.3.2 | `directeur-chat.tsx` | Chat spécialisé avec contexte de chapitre | 2 | 4.2.5, 4.3.1 |
| 4.3.3 | Soumission au directeur | Workflow : soumettre chapitre → feedback → statut | 1.5 | 4.3.2, 2.2.1 |
| 4.3.4 | `humanizer/` module complet | Texte → reformulation naturelle, UI dédiée | 2 | 4.1.2 |
| 4.3.5 | `consensus/` module complet | Analyse multi-sources, synthèse IA | 2 | 4.1.2 |
| 4.3.6 | Tests directeur + outils IA | Tests E2E conversation, humanisation, consensus | 2 | 4.3.1-4.3.5 |

**Total Epic 4.3** : 10 jours

#### Livrables Phase 4
- [ ] Infrastructure IA multi-fournisseur fonctionnelle
- [ ] 10 modes d'écriture IA disponibles et fonctionnels
- [ ] Chat IA avec streaming temps réel
- [ ] Menu IA inline dans l'éditeur
- [ ] Directeur Chat avec soumission de chapitre
- [ ] Humanizer et Consensus fonctionnels
- [ ] Clés API stockées server-side uniquement

#### Critères d'acceptation
- Chat IA : réponse streamée en < 3 secondes
- 10 modes testés avec des réponses pertinentes
- Inline AI : sélection de texte → suggestion IA → insertion
- Directeur : soumission → feedback ≥ 100 mots en < 10s
- Basculer entre providers (z-ai ↔ OpenAI) fonctionne
- Aucune clé API dans le code client (vérification audit)

---

### PHASE 5 : MODULES ACADÉMIQUES
**Durée** : 3 semaines (15 jours)  
**Date cible** : Semaine 14-16  

#### Objectifs
- Porter les 7 sous-onglets de Méthodologie
- Porter les 7 sous-onglets d'Articles scientifiques
- Porter le module Références bibliographiques complet
- Porter le module Bases de données académiques
- Porter le module Recherche approfondie

#### Epic 5.1 : Méthodologie de la Recherche

| # | Tâche | Description | Effort (j) | Dépendances |
|---|---|---|---|---|
| 5.1.1 | Migrer `methodology-guide.ts` | 830+ lignes de données méthodologiques | 0.5 | Phase 0 |
| 5.1.2 | `methodology-tabs.tsx` | Onglets principaux avec navigation | 1 | Phase 1 |
| 5.1.3 | `demarche-panel.tsx` | Cycle de la recherche, types, 3 Piliers | 2 | 5.1.1, 5.1.2 |
| 5.1.4 | `problematique-panel.tsx` | 3 niveaux, sujets à éviter, générateur titre | 2.5 | 5.1.1 |
| 5.1.5 | `variables-panel.tsx` | Types et opérationalisation | 1.5 | 5.1.1 |
| 5.1.6 | `outils-collecte-panel.tsx` | Comparateur Questionnaire/Sondage, grille observation | 2 | 5.1.1 |
| 5.1.7 | `documentation-panel.tsx` | Types de documents, bases de données | 1.5 | 5.1.1 |
| 5.1.8 | `concepts-panel.tsx` | Triangle d'Ogden & Richards | 1 | 5.1.1 |
| 5.1.9 | `aptitude-panel.tsx` | Test interactif (10 questions, 3 niveaux) | 3 | 5.1.1 |
| 5.1.10 | Tests méthodologie | Tests render + interactions des 7 panels | 2 | 5.1.2-5.1.9 |

**Total Epic 5.1** : 17.5 jours

#### Epic 5.2 : Articles Scientifiques

| # | Tâche | Description | Effort (j) | Dépendances |
|---|---|---|---|---|
| 5.2.1 | Migrer `articles-guide.ts` | Données du guide de rédaction | 0.5 | Phase 0 |
| 5.2.2 | `articles-tabs.tsx` | 7 onglets principaux | 1 | Phase 1 |
| 5.2.3 | `etapes-panel.tsx` | Les 8 étapes de la rédaction | 1.5 | 5.2.1 |
| 5.2.4 | `imrad-panel.tsx` | Guide IMRaD détaillé | 2 | 5.2.1 |
| 5.2.5 | `erreurs-panel.tsx` | Erreurs fréquentes | 1 | 5.2.1 |
| 5.2.6 | `checklist-panel.tsx` | Checklist avant soumission interactive | 2 | 5.2.1 |
| 5.2.7 | `boite-outils-panel.tsx` | 6 étapes, 25+ outils numériques | 1.5 | 5.2.1 |
| 5.2.8 | `revue-guide-panel.tsx` | Guide revue systématique en 5 phases | 2 | 5.2.1 |
| 5.2.9 | `soutenance-panel.tsx` | Guide complet soutenance orale | 2.5 | 5.2.1 |
| 5.2.10 | Tests articles | Tests render + interactions | 1.5 | 5.2.2-5.2.9 |

**Total Epic 5.2** : 15.5 jours

#### Epic 5.3 : Références Bibliographiques

| # | Tâche | Description | Effort (j) | Dépendances |
|---|---|---|---|---|
| 5.3.1 | `references-list.tsx` | Table des références avec tri, filtre, recherche | 2 | 2.2.2, 2.3.4 |
| 5.3.2 | `reference-form.tsx` | Formulaire CRUD avec validation Zod | 2 | 2.2.2 |
| 5.3.3 | `mendeley-connect.tsx` | Flow OAuth Mendeley, import, déduplication | 3 | 2.2.5 |
| 5.3.4 | `bibtex-export.tsx` | Export BibTeX téléchargeable | 1.5 | 2.2.2 |
| 5.3.5 | `reference-search.tsx` | Recherche full-text dans les références | 1.5 | 5.3.1 |
| 5.3.6 | Tests références | Tests CRUD, import Mendeley mock, export | 2 | 5.3.1-5.3.5 |

**Total Epic 5.3** : 12 jours

#### Epic 5.4 : Bases de Données & Recherche

| # | Tâche | Description | Effort (j) | Dépendances |
|---|---|---|---|---|
| 5.4.1 | `databases-grid.tsx` | Grille des 7 bases de données avec liens | 1 | 5.1.1 |
| 5.4.2 | `recherche-panel.tsx` | Bibliothèque + fiches de lecture + veille | 3 | 2.2.9 |
| 5.4.3 | `fiches-lecture.tsx` | Fiches de lecture interactives par source | 2 | 5.4.2 |
| 5.4.4 | `veille-panel.tsx` | Requêtes sauvegardées, alertes | 2 | 5.4.2 |
| 5.4.5 | `verification-panel.tsx` | Vérification méthodologique Module A+B | 3 | 2.2.10 |
| 5.4.6 | Tests bases de données & recherche | Tests render + interactions | 1.5 | 5.4.1-5.4.5 |

**Total Epic 5.4** : 12.5 jours

#### Livrables Phase 5
- [ ] 7 sous-onglets Méthodologie fonctionnels
- [ ] 7 sous-onglets Articles scientifiques fonctionnels
- [ ] CRUD références complet avec import Mendeley
- [ ] Export BibTeX fonctionnel
- [ ] 7 bases de données académiques accessibles
- [ ] Module Recherche avec fiches de lecture
- [ ] Vérification méthodologique interactive

#### Critères d'acceptation
- Test d'aptitude : 10 questions, scoring, 3 niveaux d'interprétation
- Checklist : cases à cocher interactives avec progression
- Mendeley : import mock réussi avec déduplication
- BibTeX : export cohérent avec le format académique
- Vérification : Module A+B complet avec scoring

---

### PHASE 6 : MODULES AVANCÉS
**Durée** : 3 semaines (15 jours)  
**Date cible** : Semaine 17-19  

#### Objectifs
- Porter le Carnet de recherche + Graphe de connaissances
- Porter la Visualisation de données (6 types de graphiques SVG)
- Porter l'Export PDF & Office
- Porter Excalidraw
- Porter l'Agile Roadmap
- Porter le SLR Protocol, APA Composer, et les panels avancés

#### Epic 6.1 : Carnet de Recherche & Graphe

| # | Tâche | Description | Effort (j) | Dépendances |
|---|---|---|---|---|
| 6.1.1 | `notebook-panel.tsx` | Interface notebook avec onglets notes/sources/Q&A | 2.5 | 2.2.4 |
| 6.1.2 | Q&A avec IA sur les sources | Question → analyse IA des sources sauvegardées | 2 | 4.1.2, 6.1.1 |
| 6.1.3 | `knowledge-graph.tsx` | Graphe force-directed SVG (5 catégories, 5 relations) | 4 | 6.1.1 |
| 6.1.4 | Interactions du graphe | Drag, zoom, clic nœud → détails, ajout/suppression | 2 | 6.1.3 |
| 6.1.5 | Tests notebook + graphe | Tests render, interactions, Q&A mock | 2 | 6.1.1-6.1.4 |

**Total Epic 6.1** : 12.5 jours

#### Epic 6.2 : Visualisation de Données

| # | Tâche | Description | Effort (j) | Dépendances |
|---|---|---|---|---|
| 6.2.1 | `chart-editor.tsx` | Éditeur de données (tableau) avec ajout/suppression | 2 | Phase 2 |
| 6.2.2 | Graphique barres SVG | Composant SVG barres avec 4 palettes | 1.5 | 6.2.1 |
| 6.2.3 | Graphique lignes SVG | Composant SVG lignes | 1.5 | 6.2.1 |
| 6.2.4 | Graphique circulaire SVG | Composant SVG pie chart | 1.5 | 6.2.1 |
| 6.2.5 | Graphique nuage de points SVG | Composant SVG scatter | 1.5 | 6.2.1 |
| 6.2.6 | Graphique aire SVG | Composant SVG area | 1.5 | 6.2.1 |
| 6.2.7 | Graphique radar SVG | Composant SVG radar | 1.5 | 6.2.1 |
| 6.2.8 | Sélecteur palette & type | 4 palettes, 6 types, aperçu | 1 | 6.2.2-6.2.7 |
| 6.2.9 | Export SVG | Téléchargement fichier SVG | 0.5 | 6.2.2 |
| 6.2.10 | Tests visualisation | Tests render des 6 types, export | 2 | 6.2.1-6.2.9 |

**Total Epic 6.2** : 15 jours

#### Epic 6.3 : Export, Excalidraw & Panels Avancés

| # | Tâche | Description | Effort (j) | Dépendances |
|---|---|---|---|---|
| 6.3.1 | Export PDF | `pdf-lib` + `pagedjs` : génération PDF paginé | 3 | 2.2.6 |
| 6.3.2 | Export Office | `jszip` : export DOCX/ODT | 2 | 2.2.6 |
| 6.3.3 | Intégration Excalidraw | `@excalidraw/excalidraw` dans un panel | 2 | 6.1.1 |
| 6.3.4 | `agile-roadmap.tsx` | Sprints, stories, drag & drop, kanban | 3 | 2.2.7 |
| 6.3.5 | `slr-protocol-panel.tsx` | Protocol SLR interactif | 2 | 4.1.2 |
| 6.3.6 | `apa-results-composer.tsx` | Compositeur résultats APA | 2 | 4.1.2 |
| 6.3.7 | Panels restants | Writing Unblock, Research Resources, Field Analysis, Ithy Research, Grammar, Harper, Auto-Edition, Box Drive, Usage Guide, Book Skills, RoutesMe | 8 | 4.1.2, 2.2.* |
| 6.3.8 | Tests modules avancés | Tests E2E export, excalidraw, roadmap | 3 | 6.3.1-6.3.7 |

**Total Epic 6.3** : 25 jours

#### Livrables Phase 6
- [ ] Carnet de recherche avec Q&A IA
- [ ] Graphe de connaissances interactif (SVG)
- [ ] 6 types de graphiques SVG avec 4 palettes
- [ ] Export PDF et Office fonctionnels
- [ ] Excalidraw intégré
- [ ] Agile Roadmap avec drag & drop
- [ ] SLR Protocol + APA Composer
- [ ] Tous les panels avancés migrés

#### Critères d'acceptation
- Graphe : 50+ nœuds sans lag (< 16fps)
- Graphiques : rendu SVG correct, 4 palettes fonctionnelles
- Export PDF : document paginé cohérent avec le contenu de la thèse
- Excalidraw : dessin + sauvegarde + chargement
- Agile Roadmap : CRUD sprints + stories + drag & drop
- Tous les panels v0.4.0 sont accessibles et fonctionnels

---

### PHASE 7 : QUALITÉ, SÉCURITÉ & PRODUCTION
**Durée** : 2 semaines (10 jours)  
**Date cible** : Semaine 20-21  

#### Objectifs
- Atteindre la couverture de tests cible (≥ 80%)
- Auditer et corriger les failles de sécurité
- Optimiser les performances
- Préparer le déploiement production
- Documenter l'application

#### Epic 7.1 : Tests & Qualité

| # | Tâche | Description | Effort (j) | Dépendances |
|---|---|---|---|---|
| 7.1.1 | Audit de couverture | Identifier les fichiers < 80%, prioriser | 0.5 | Phase 6 |
| 7.1.2 | Tests manquants services | Atteindre ≥ 90% sur tous les services | 2 | 7.1.1 |
| 7.1.3 | Tests manquants composants | Atteindre ≥ 70% sur tous les composants | 2 | 7.1.1 |
| 7.1.4 | Tests E2E scénarios critiques | 15 scénarios Playwright | 3 | 7.1.2 |
| 7.1.5 | Tests de régression visuelle | Screenshot tests avec Playwright | 1.5 | 7.1.4 |
| 7.1.6 | Tests de performance | Lighthouse CI, Web Vitals | 1 | 7.1.4 |

**Total Epic 7.1** : 10 jours

#### Epic 7.2 : Sécurité

| # | Tâche | Description | Effort (j) | Dépendances |
|---|---|---|---|---|
| 7.2.1 | Audit sécurité API | Vérifier l'authentification sur toutes les routes | 1 | Phase 6 |
| 7.2.2 | Chiffrement des secrets | Clés API chiffrées en base (AES-256) | 1.5 | 4.1.5 |
| 7.2.3 | Rate limiting | Protection contre les abus API | 1 | Phase 2 |
| 7.2.4 | CSRF protection | Tokens CSRF sur les mutations | 0.5 | Phase 2 |
| 7.2.5 | Headers de sécurité | CSP, X-Frame-Options, HSTS | 0.5 | Phase 1 |
| 7.2.6 | Sanitization input | Protection XSS sur tous les inputs utilisateur | 1 | Phase 6 |
| 7.2.7 | Tests sécurité | Tests d'intrusion basiques | 1 | 7.2.1-7.2.6 |

**Total Epic 7.2** : 6.5 jours

#### Epic 7.3 : Performance & Production

| # | Tâche | Description | Effort (j) | Dépendances |
|---|---|---|---|---|
| 7.3.1 | Code splitting | Lazy loading des modules (dynamic import) | 2 | Phase 6 |
| 7.3.2 | Optimisation images/assets | WebP, lazy loading, compression | 1 | Phase 6 |
| 7.3.3 | Optimisation bundle | Analyser bundle, tree-shaking, réduire taille | 1.5 | 7.3.1 |
| 7.3.4 | Cache stratégies | ISR pour pages statiques, cache API | 1 | Phase 6 |
| 7.3.5 | Configuration production | Variables d'environnement, PostgreSQL, CDN | 1.5 | 7.3.1 |
| 7.3.6 | Pipeline de déploiement | Docker + CI/CD déploy | 1.5 | 7.3.5 |
| 7.3.7 | Monitoring | Logging, error tracking (Sentry), uptime | 1 | 7.3.6 |
| 7.3.8 | Documentation technique | README, CONTRIBUTING, ARCHITECTURE.md | 2 | Phase 6 |

**Total Epic 7.3** : 11.5 jours

#### Livrables Phase 7
- [ ] Couverture de tests ≥ 80% globale
- [ ] 15 scénarios E2E Playwright passants
- [ ] Audit sécurité avec 0 faille critique
- [ ] Performance : LCP < 2.5s, FID < 100ms, CLS < 0.1
- [ ] Bundle optimisé < 500KB initial
- [ ] Pipeline CI/CD production fonctionnel
- [ ] Documentation technique complète

#### Critères d'acceptation
- `vitest run --coverage` : ≥ 80% lignes globales
- `playwright test` : 15/15 scénarios passent
- Lighthouse Performance ≥ 90
- Aucune faille critique/élevée dans l'audit sécurité
- Déploiement production sans erreur

---

## IV. SPECIFICATIONS TECHNIQUES

### 4.1 Design System

| Token | Valeur | Usage |
|---|---|---|
| Font Sans | Geist (headings, UI) | Corps principal |
| Font Serif | Lora / Georgia (éditeur) | Contenu de thèse |
| Font Mono | Geist Mono (code) | Blocs de code |
| Primary Color | `hsl(221, 83%, 53%)` — Blue 600 | Actions principales |
| Academic Color | `hsl(160, 84%, 39%)` — Emerald 700 | Brand ThesisFrame |
| Neutral | Slate scale | Texte, fonds, bordures |
| Radius | 0.5rem (sm), 0.75rem (md) | Coins arrondis |
| Spacing | 4px grid | Système de spacing cohérent |
| Shadow | shadcn/ui defaults | Ombres portées |
| Animation | 150ms ease-out | Transitions UI |

### 4.2 Component Library Plan

| Groupe | Composants | Source |
|---|---|---|
| **Layout** | AppSidebar, AppHeader, BreadcrumbNav, MobileNav | Custom |
| **Navigation** | ChapterTabs, MethodologyTabs, ArticlesTabs | Custom |
| **Édition** | TiptapWrapper, PlainTextEditor, EditorToolbar, InlineAIMenu | Custom |
| **Formulaire** | ReferenceForm, LicenseForm, AuthForm | Custom + shadcn |
| **Données** | ReferenceList, SprintBoard, StoryCard, ChartEditor | Custom + TanStack Table |
| **Feedback** | LoadingSkeleton, ErrorBoundary, EmptyState, SaveIndicator | Custom |
| **IA** | AIChatBubble, AILoading, StreamingText, ModeSelector | Custom |
| **Académique** | AptitudeQuiz, MethodologyPanel, IMRaDGuide, ChecklistPanel | Custom |
| **Visualisation** | KnowledgeGraph, ChartRenderer (6 types), SvgExport | Custom (SVG) |
| **Dialogs** | TemplateDialog, ProviderSettingsDialog, FeatureDialogs | Custom + shadcn Dialog |
| **shadcn/ui** | 50 composants (Button, Card, Dialog, Tabs, etc.) | Générés |

### 4.3 API Contract Specifications

Format de réponse uniforme :

```typescript
// Succès
interface ApiResponse<T> {
  success: true
  data: T
  meta?: { pagination?: PaginationMeta; timing?: number }
}

// Erreur
interface ApiErrorResponse {
  success: false
  error: {
    code: string          // 'VALIDATION_ERROR' | 'NOT_FOUND' | 'UNAUTHORIZED' | etc.
    message: string      // Message lisible
    details?: ZodIssue[] // Détails de validation
  }
}

// Pagination
interface PaginationMeta {
  page: number
  perPage: number
  total: number
  totalPages: number
}
```

**Endpoints principaux** :

| Méthode | Route | Description | Auth |
|---|---|---|---|
| GET | `/api/thesis` | Récupérer la thèse de l'utilisateur | ✅ |
| POST | `/api/thesis` | Créer une nouvelle thèse | ✅ |
| PATCH | `/api/thesis/[id]` | Mettre à jour la thèse | ✅ |
| POST | `/api/thesis/chapters` | Ajouter un chapitre | ✅ |
| PATCH | `/api/thesis/chapters/[id]` | Mettre à jour un chapitre (contenu, titre, statut) | ✅ |
| DELETE | `/api/thesis/chapters/[id]` | Supprimer un chapitre | ✅ |
| PATCH | `/api/thesis/chapters` | Réorganiser les chapitres | ✅ |
| POST | `/api/ai/chat` | Envoyer un message au chat IA (streaming) | ✅ |
| GET | `/api/references` | Lister les références (paginé, filtré) | ✅ |
| POST | `/api/references` | Créer une référence | ✅ |
| GET | `/api/references/export/bibtex` | Export BibTeX | ✅ |
| POST | `/api/mendeley/sync` | Synchroniser avec Mendeley | ✅ |
| GET | `/api/notebook` | Lister les entrées du carnet | ✅ |
| POST | `/api/notebook/qa` | Question-réponse IA sur les sources | ✅ |
| GET | `/api/export/pdf` | Générer le PDF de la thèse | ✅ |
| GET | `/api/export/office` | Générer le DOCX de la thèse | ✅ |
| POST | `/api/latex/generate` | Générer le template LaTeX | ✅ |
| POST | `/api/auth/login` | Connexion | ❌ |
| POST | `/api/auth/register` | Inscription | ❌ |
| POST | `/api/licenses/activate` | Activer une licence | ❌ |

### 4.4 Database Migration Plan

```
Phase 0-1 : Schéma minimal (User, Session)
    ↓
Phase 2 : Migration complète (20+ modèles)
    ├── 001_init_schema.sql
    ├── 002_add_indexes.sql
    └── 003_seed_data.sql
    ↓
Phase 7 : Migration production (SQLite → PostgreSQL)
    ├── Export SQLite → PostgreSQL via Prisma
    ├── Vérification intégrité
    └── Switch provider
```

### 4.5 Performance Targets

| Métrique | Cible | Mesure |
|---|---|---|
| LCP (Largest Contentful Paint) | < 2.5s | Lighthouse CI |
| FID (First Input Delay) | < 100ms | Lighthouse CI |
| CLS (Cumulative Layout Shift) | < 0.1 | Lighthouse CI |
| TTI (Time to Interactive) | < 3.5s | Lighthouse CI |
| Taille bundle initial | < 500KB | Webpack Analyzer |
| Taille bundle total | < 2MB | Webpack Analyzer |
| Temps réponse API (p95) | < 500ms | Monitoring |
| Temps réponse IA (streaming first token) | < 2s | Monitoring |
| Auto-save | < 200ms (UI) | Performance Observer |
| Éditeur Tiptap (50k mots) | ≥ 30fps typing | Performance Observer |

---

## V. QUALITY GATE

### 5.1 Definition of Done par phase

| Critère | Phase 0 | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | Phase 6 | Phase 7 |
|---|---|---|---|---|---|---|---|---|
| Build sans erreur | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| TypeScript strict | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Lint passé | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Tests unitaires | 50% | 70% | 85% | 80% | 80% | 80% | 80% | **90%** |
| Tests E2E | 1 smoke | 3 | 5 | 8 | 10 | 12 | 14 | **15** |
| Couverture globale | 30% | 50% | 70% | 70% | 75% | 75% | 78% | **≥ 80%** |
| Documentation | audit | patterns | API | composants | IA | guides | modules | complet |
| Review code | — | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### 5.2 Checklist Quality Gate

Pour chaque fin de phase, vérifier :

- [ ] **Build** : `next build` passe sans erreur ni warning
- [ ] **TypeScript** : `tsc --noEmit` passe (strict, `noImplicitAny: true`)
- [ ] **Lint** : `eslint .` passe sans erreur
- [ ] **Format** : `prettier --check .` passe
- [ ] **Tests unitaires** : `vitest run --coverage` ≥ seuil de la phase
- [ ] **Tests E2E** : `playwright test` — tous les scénarios passent
- [ ] **Pas de secrets** : `rg 'apiKey|api_key|secret' src/components/` → 0 résultats
- [ ] **Pas de console.log** : `rg 'console\.log' src/` → 0 résultats dans les composants
- [ ] **Pas de any** : `rg ': any' src/modules/` → 0 résultats dans le code métier
- [ ] **Documentation** : README.md mis à jour, ADR si changement d'architecture
- [ ] **Review** : Au moins 1 review code approuvée (si équipe > 1)

### 5.3 Critères de Release

**Version Bêta (v1.0.0-beta.1)** :
- [ ] Toutes les phases 0-6 terminées
- [ ] Couverture ≥ 78%
- [ ] 14 scénarios E2E passent
- [ ] Aucune faille critique de sécurité

**Version Production (v1.0.0)** :
- [ ] Phase 7 terminée
- [ ] Couverture ≥ 80%
- [ ] 15 scénarios E2E passent
- [ ] 0 faille critique/élevée sécurité
- [ ] Lighthouse Performance ≥ 85
- [ ] Pipeline CI/CD vert
- [ ] Documentation complète

---

## VI. INDICATEURS & GOUVERNANCE

### 6.1 KPIs par phase

| Phase | KPI Principal | Seuil | Mesure |
|---|---|---|---|
| P0 | Build clean | `next build` = 0 erreurs | CI |
| P1 | Modules créés | 8/8 modules avec barrel export | Comptage |
| P2 | API routes | 40+ routes fonctionnelles | Comptage + tests |
| P3 | E2E workspace | 8/8 scénarios E2E workspace passent | Playwright |
| P4 | Temps réponse IA | First token < 2s | Monitoring |
| P5 | Composants portés | 41/41 composants métier migrés | Comptage |
| P6 | Features parité | 100% des features v0.4.0 accessibles | Checklist |
| P7 | Performance | Lighthouse ≥ 90 | Lighthouse CI |

### 6.2 Format de Sprint Review (bi-hebdomadaire)

```
┌─────────────────────────────────────────────────────┐
│              SPRINT REVIEW — Semaine N               │
├─────────────────────────────────────────────────────┤
│                                                      │
│  1. DÉMONSTRATION (20 min)                           │
│     - Démo live des fonctionnalités terminées       │
│     - Scénarios E2E exécutés en direct              │
│                                                      │
│  2. MÉTRIQUES (10 min)                               │
│     - Couverture de tests (vitest --coverage)        │
│     - Nombre de routes API fonctionnelles            │
│     - Performance (Lighthouse)                       │
│     - Bugs ouverts vs fermés                        │
│                                                      │
│  3. RISQUES (10 min)                                 │
│     - Revue de la matrice des risques                │
│     - Nouveaux risques identifiés                    │
│     - Plan d'atténuation                             │
│                                                      │
│  4. AJUSTEMENTS (10 min)                             │
│     - Sprint planning pour les 2 prochaines semaines │
│     - Répriorisation du backlog                     │
│     - Décisions de scope (in/out)                   │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 6.3 Suivi des Risques

| ID | Risque | Statut initial | Monitoring | Action trigger |
|---|---|---|---|---|
| R1 | Rupture fonctionnalités | 🟡 Élevé | Tests E2E de régression à chaque sprint | > 3 régressions → stop & fix |
| R5 | Failles sécurité | 🔴 Critique | Audit sécurité P7, review code | Toute faille critique → fix immédiat |
| R8 | Scope creep | 🟡 Élevé | Revue de scope chaque sprint | > 10% dérive → re-planification |
| R10 | Couverture insuffisante | 🟡 Élevé | Vitest coverage chaque PR | < seuil de phase → blocage merge |
| R4 | Perf éditeur | 🟡 Moyen | Performance Observer sur Tiptap | < 30fps → investigation |

### 6.4 Calendrier Synthétique

```
Semaines :  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21
           ├──┤  ├────────┤  ├────┤  ├─────────┤  ├─────────┤  ├─────────┤  ├─────────┤  ├──────┤
Phase:      │P0│  │   P1   │  │ P2 │  │   P3    │  │   P4    │  │   P5    │  │   P6    │  │  P7  │
           └──┘  └────────┘  └────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └──────┘

Milestones:
  ★ M1 (S2) : Build clean + CI vert
  ★ M2 (S5) : Auth + Layout fonctionnels
  ★ M3 (S7) : Toutes les API routes opérationnelles
  ★ M4 (S10): Workspace éditeur complet
  ★ M5 (S13): Moteur IA 10 modes + streaming
  ★ M6 (S16): Modules académiques complets
  ★ M7 (S19): Parité feature 100% avec v0.4.0
  ★ M8 (S21): RELEASE v1.0.0 Production

Jours homme cumulés:
  P0: 13j  →  P1: 36j  →  P2: 72.5j  →  P3: 118j  →  P4: 156j  →  P5: 215j  →  P6: 268j  →  P7: 296j
```

---

## ANNEXES

### A. Inventaire complet des données à migrer (26 fichiers)

| # | Fichier | Lignes (est.) | Module cible |
|---|---|---|---|
| 1 | `methodology-guide.ts` | 830 | methodology |
| 2 | `articles-guide.ts` | 400 | articles |
| 3 | `latex-template.ts` | 200 | thesis/plan |
| 4 | `chapters-structure.ts` | 150 | thesis |
| 5 | `directeur-prompt.ts` | 80 | ai-writing |
| 6 | `slr-protocol-guide.ts` | 300 | ai-tools/slr |
| 7 | `apa-stats-rules.ts` | 200 | ai-tools/apa |
| 8 | `academic-databases.ts` | 50 | academy-databases |
| 9 | `academic-books-websites.ts` | 100 | academy-databases |
| 10 | `academic-phrases-bank.ts` | 500 | ai-writing/prompts |
| 11 | `book-skills.ts` | 150 | ai-tools/book-skills |
| 12 | `conceptual-framework-guide.ts` | 250 | methodology |
| 13 | `fiches-archi-urba.ts` | 300 | methodology |
| 14 | `guidance-fiches.ts` | 200 | shared |
| 15 | `journal-reading-checklist.ts` | 100 | articles |
| 16 | `lr-typology.ts` | 150 | methodology |
| 17 | `phd-tools.ts` | 80 | shared |
| 18 | `publication-tips.ts` | 200 | articles |
| 19 | `research-field-analysis.ts` | 200 | research |
| 20 | `research-frameworks.ts` | 300 | methodology |
| 21 | `resources.ts` | 100 | shared |
| 22 | `rhetorical-checklist.ts` | 150 | articles |
| 23 | `thesis-templates.ts` | 200 | thesis |
| 24 | `thesis-writing-guide.ts` | 400 | shared |
| 25 | `usage-guide.ts` | 150 | shared |
| 26 | `verification-referentials.ts` | 500 | research |

**Total estimé** : ~6,240 lignes de données à migrer

### B. Composants à migrer (41 fichiers)

| # | Composant GitHub | Module cible |
|---|---|---|
| 1 | `agile-roadmap.tsx` | planning |
| 2 | `ai-writing-tab.tsx` | ai-writing |
| 3 | `apa-results-composer.tsx` | ai-tools/apa |
| 4 | `articles-tab.tsx` | articles |
| 5 | `auth-provider-panel.tsx` | auth |
| 6 | `auto-edition-8c.tsx` | ai-tools |
| 7 | `automation-panel.tsx` | thesis |
| 8 | `book-skills-panel.tsx` | ai-tools/book-skills |
| 9 | `box-drive-panel.tsx` | thesis/cloud |
| 10 | `cadrage-panel.tsx` | thesis/cadrage |
| 11 | `chapter-balance.tsx` | thesis |
| 12 | `cloud-drive-backup.tsx` | thesis/cloud |
| 13 | `directeur-chat.tsx` | ai-writing |
| 14 | `directeur-tab.tsx` | ai-writing |
| 15 | `doctoral-toolkit-panel.tsx` | shared |
| 16 | `excalidraw-tab.tsx` | export |
| 17 | `export-pdf-tab.tsx` | export |
| 18 | `grammar-checker.tsx` | ai-tools |
| 19 | `harper-checker.tsx` | ai-tools |
| 20 | `inline-ai-menu.tsx` | ai-writing |
| 21 | `ithy-research.tsx` | research |
| 22 | `journal-finder.tsx` | references |
| 23 | `license-activation.tsx` | auth |
| 24 | `license-admin-panel.tsx` | auth |
| 25 | `literature-search.tsx` | references |
| 26 | `methodology-tab.tsx` | methodology |
| 27 | `office-export-tab.tsx` | export |
| 28 | `recherche-panel.tsx` | research |
| 29 | `references-tab.tsx` | references |
| 30 | `research-field-analysis-panel.tsx` | research |
| 31 | `research-resources-panel.tsx` | research |
| 32 | `resources-panel.tsx` | shared |
| 33 | `routesme-panel.tsx` | ai-writing/providers |
| 34 | `slr-protocol-panel.tsx` | ai-tools/slr |
| 35 | `thesis-assistant-chat.tsx` | ai-writing |
| 36 | `thesis-plan-tab.tsx` | thesis/plan |
| 37 | `thesis-search.tsx` | thesis |
| 38 | `tiptap-editor.tsx` | thesis/editor |
| 39 | `usage-guide-panel.tsx` | shared |
| 40 | `verification-panel.tsx` | research |
| 41 | `writing-unblock-panel.tsx` | ai-tools |

### C. Dépendances à installer

```bash
# Éditeur Tiptap (Phase 3)
bun add @tiptap/react @tiptap/starter-kit @tiptap/pm
bun add @tiptap/extension-character-count @tiptap/extension-code-block-lowlight
bun add @tiptap/extension-color @tiptap/extension-highlight
bun add @tiptap/extension-link @tiptap/extension-placeholder
bun add @tiptap/extension-text-align @tiptap/extension-text-style
bun add @tiptap/extension-typography @tiptap/extension-underline
bun add lowlight

# Excalidraw (Phase 6)
bun add @excalidraw/excalidraw

# Export (Phase 6)
bun add pdf-lib pdf-parse pagedjs jszip

# Tests (Phase 0)
bun add -D vitest @testing-library/react @testing-library/jest-dom
bun add -D @testing-library/user-event @playwright/test jsdom

# Sécurité (Phase 7)
bun add bcryptjs
bun add -D @types/bcryptjs
```

---

> **Document maintenu par** : Architecte Logiciel Principal  
> **Dernière mise à jour** : Août 2025  
> **Statut** : APPROUVÉ — Prêt pour exécution
