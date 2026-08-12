# Changelog — MaTh-se (ThesisFrame)

Tous les changements notables de ce projet seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

---

## [1.0.0] — 2026-08-12

### Ajouté

#### Architecture et fondations
- **Framework** : Next.js 16 App Router, TypeScript 5, Tailwind CSS 4, shadcn/ui (New York)
- **Base de données** : Prisma ORM + SQLite (31 modèles)
- **State management** : Zustand (client), TanStack Query (server, staleTime 30s)
- **IA** : z-ai-web-dev-sdk (LLM, VLM, TTS, ASR, Image Gen, Web Search)
- **Auth** : Auth0, Stytch, Warrant (multi-provider)
- **Export** : PDF, DOCX, PPTX, XLSX, LaTeX, BibTeX
- **48 vues** dans 8 catégories de navigation

#### Modules principaux (8)
- **Dashboard** — Stat cards dynamiques (chapitres, références, mots, % progression), modules avec badges, auto-refresh 15s
- **Éditeur de thèse** — Éditeur riche Tiptap, structuration par chapitres et parties, sauvegarde auto, suivi de statut, compteur de mots
- **Références** — CRUD complet, import BibTeX, tri/filtre, recherche
- **Écriture IA** — 10 modes d'assistance (Rédaction, Revue littérature, Correction, Résumé, etc.)
- **Directeur de thèse IA** — Superviseur IA avec system prompt strict
- **Plan de thèse** — Arborescence des chapitres (numérotation romaine, badges, Progress), générateur de templates LaTeX (classique/par parties)
- **Sprints & Stories** — Suivi agile des tâches de recherche
- **Cadrage** — Gestion des cadrages de recherche (champs, versions)

#### Modules académiques (5)
- **Méthodologie de recherche** — 5 sections accordion (paradigmes, démarche 7 étapes, outils de collecte, techniques d'analyse, checklist interactive avec progress)
- **Articles scientifiques** — Guide IMRaD, boîte à outils rédaction, checklist de soumission
- **Bases de données académiques** — 27 bases dans 5 catégories, filtrage recherche + catégorie
- **Outils IA** — Carnet de recherche CRUD, consensus IA multi-modèle, visualisation
- **Bases de données académiques** — 27 bases avec badges d'accès

#### Fonctionnalités SurfSense (base de connaissances)
- **Base de connaissances** — Upload de documents, parsing (text/markdown/HTML), chunking avec overlap, recherche hybride (LIKE FTS + scoring unigram/bigram)
- **Mémoire de recherche** — Contexte persistant inter-sessions, 8 catégories (thème, méthodologie, problématique, référence, hypothèse, cadre, résultat, note), extraction auto des réponses IA
- **Extraction de citations** — Détection APA, MLA et numérotées

#### Ressources visuelles
- **Galerie RB** — 15 infographies académiques (6 méthodologie + 9 urbanisme), grille responsive, filtres catégorie, lightbox avec navigation clavier
- **Analyse documentaire scientifique** — 12 protocoles PRISMA/GRADE (Classe A/Q1), 4 grilles de qualité (quantitatif, observationnel, qualitatif, revue), cadrage Phase 0, livrables structurés

#### API — 126 routes
- CRUD thesis/chapters/references/cadrages/sources/entries/sprints/stories/ai-config
- 78 route.ts wrappers pour les handlers restaurés (Auth & License 17, Mendeley 5, Cloud Drive 5, Box Drive 5, Cadrage 5, AI & Assistants 16, Recherche 12, Notebook 3, Export 6, Utilities 5)
- Knowledge base, research memory, citations
- Export (PDF, LaTeX, Office), AI writing, AI status
- Mendeley OAuth, Cloud Drive, Box Drive

#### Infrastructure
- 31 modèles Prisma (Thesis, Chapter, Reference, Cadrage, Sprint, Story, AIConfig, LicenseKey, Activation, MendeleyConfig, CloudDriveConnection, AuthProvider, AuthAccount, WarrantPolicy, ElementAnalyse, TypeAnalyseMethodologique, SessionVerification, SourceBibliographique, SourceChapitre, FicheLecture, RechercheSauvegardee, KnowledgeDocument, KnowledgeChunk, Citation, ResearchMemory, + étendus)
- Zod validation schemas partagés (server + client)
- QueryClientProvider (TanStack Query)
- Lazy loading + ErrorBoundary pour tous les modules
- Fiche synthèse (`/docs/FICHE_SYNTHESE.md`) — journal de bord permanent

#### Documentation
- FICHE_SYNTHESE.md — 10 jalons rétrospectifs, discipline de traçabilité
- Worklog détaillé (18 entrées)
- Skill analyse documentaire scientifique (SKILL.md + 2 références)
- README.md à jour

### Technique
- 406 fichiers TypeScript/TSX
- 126 routes API
- 31 modèles Prisma
- 48 composants shadcn/ui
- 10 modules pages
- 30 fichiers de données
- 36 fichiers lib
- ESLint : 0 erreurs, 241 warnings (pré-existants dans les fichiers restaurés)
