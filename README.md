<p align="center">
  <img src="public/logo.svg" alt="Ma Thèse Logo" width="80" height="80" />
</p>

<h1 align="center">Ma Thèse</h1>

<p align="center">
  <strong>Plateforme IA de rédaction de thèses et mémoires universitaires</strong><br/>
  Outil d'assistance à la rédaction académique avec intelligence artificielle
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.5.1-22c55e" alt="v1.5.1" />
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/Prisma-SQLite-2D3748?logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/shadcn/ui-Component_Library-18181B" alt="shadcn/ui" />
  <img src="https://img.shields.io/badge/Tests-1318_passed-22c55e" alt="1318 tests" />
</p>

---

## Présentation

**Ma Thèse** est une application web complète conçue pour accompagner les doctorants et étudiants de master dans la rédaction de leur thèse, mémoire ou dissertation. L'outil intègre des capacités d'IA avancées pour assister à chaque étape du processus de rédaction académique.

## Fonctionnalités principales

### Rédaction assistée par IA
- **36 modules fonctionnels** couvrant l'ensemble du parcours doctoral
- **21 modes d'écriture IA** : rédaction scientifique, revue de littérature, reformulation, résumé, traduction académique, style calibration, écriture qualité, vérification citations, et plus
- **Suggestion intelligente de modes** : détection automatique du meilleur mode selon le contenu du prompt
- **Deep Research** : recherche approfondie avec navigation web et synthèse
- **Déblocage d'écriture** : génération de suggestions, reformulations, transitions
- **Auto-édition 8 critères** : auto-évaluation de la qualité du texte

### Éditeur de thèse
- **Éditeur riche** (TipTap) avec support des thèmes clair/sombre
- **Auto-save** avec compteur de mots en temps réel
- **Structure en parties et chapitres** avec drag-and-drop
- **RAG contextuel** : interrogez votre propre thèse avec l'IA
- **Export PDF** et **Export DOCX** professionnels

### Fournisseurs IA (22 providers)
- **Z.ai SDK** (natif, sans clé)
- **OpenAI** (GPT-4o, o3-mini)
- **Anthropic** (Claude Sonnet 4, Haiku)
- **Mistral AI**, **RoutesMe** (proxy multi-modèles)
- **16 fournisseurs gratuits** : Google Gemini, Groq, Cerebras, OpenRouter, GitHub Models, NVIDIA NIM, Cohere, Cloudflare, HuggingFace, SiliconFlow, Pollinations, Kilo, Routeway, AINative, Aion, Requesty, SEA-LION
- **Provider personnalisé** : pointez vers n'importe quel endpoint OpenAI-compatible
- **Circuit breaker** intégré avec failover automatique entre providers

### Recherche et références
- **Gestion bibliographique** complète (BibTeX, RIS, CSL-JSON)
- **Import automatique** depuis DOI, ISBN, URL
- **Recherche plein texte** dans les chapitres
- **CORE.ac.uk API v3** : accès à 200M+ articles open access
- **Journaux Open Access** (OpenAlex + DOAJ)
- **Explorateur de thèses** (API officielle theses.fr)
- **Harper** : résumeur, paraphraseur, extracteur IA

### Méthodologie et vérification
- **Vérification méthodologique** : audit et cohérence de la démarche
- **Vérification cartographique** : complétude spatiale + questionneur socratique IA
- **Vérification de cohérence** interne de la thèse
- **Alignement preuves** : cohérence citations/références par chapitre
- **Outils SLR** : revue systématique (PRISMA, criblage, extraction)
- **Analyse du champ de recherche** : cartographie IA du champ
- **Grammaire** : correcteur linguistique IA pour l'écriture académique
- **Phrasier académique** : phrases prêtes à l'emploi par section

### Organisation et planification
- **Tableau de bord** avec statistiques de progression
- **Cadrage de thèse** : cadre préalable du projet de recherche
- **Plan de thèse** avec template LaTeX
- **Feuille de route agile** : Kanban, sprints, user stories
- **Boîte doctorale** : checklist, calendrier, documents
- **Livres-compétences** : suivi des compétences doctorales
- **Équilibre des chapitres** : analyse de répartition

## Stack technique

| Technologie | Rôle |
|-------------|------|
| **Next.js 16** | Framework (App Router, Server Components) |
| **TypeScript 5** | Langage principal |
| **Tailwind CSS 4** | Système de design |
| **shadcn/ui** | Composants UI (New York style, Lucide icons) |
| **Prisma ORM** | Base de données SQLite |
| **Zustand** | État client |
| **TanStack Query** | État serveur |
| **z-ai-web-dev-sdk** | Capacités IA (LLM, VLM, TTS, ASR) |
| **TipTap** | Éditeur de texte riche |
| **Vitest** | Suite de tests (1318 tests) |

## Structure du projet

```
ma-these/
├── src/
│   ├── app/                    # Routes Next.js (App Router)
│   │   ├── api/                # 50+ API routes
│   │   ├── layout.tsx          # Layout principal (sidebar + header + footer)
│   │   └── page.tsx            # Tableau de bord
│   ├── components/
│   │   ├── ui/                 # 40+ composants shadcn/ui
│   │   ├── layout/             # Header, sidebar, footer, dialogs
│   │   └── dashboard/          # Composants du tableau de bord
│   ├── modules/                # 36 modules fonctionnels
│   │   ├── editor/             # Éditeur de thèse (TipTap)
│   │   ├── ai-writing/         # 21 modes d'écriture IA
│   │   ├── thesis-rag/         # RAG contextuel
│   │   ├── references/         # Gestion bibliographique
│   │   └── ...                 # Autres modules
│   ├── data/                   # Données statiques (modes IA, prompts)
│   └── lib/
│       ├── ai/                 # Clients IA multi-providers + circuit breaker
│       ├── stores/             # Zustand store
│       ├── parsers/            # BibTeX, RIS, CSL-JSON
│       └── db.ts               # Client Prisma
├── prisma/
│   └── schema.prisma           # Schéma de base de données
├── db/
│   └── custom.db               # Base SQLite
├── mini-services/              # Services externes (geo-mcp, etc.)
├── vitest.config.ts            # Configuration des tests
└── public/
    └── logo.svg                # Logo de l'application
```

## Installation

### Prérequis

- **Bun** >= 1.0 (https://bun.sh)
- **Node.js** >= 18
- **Git**

### Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/freemind25/Ma-These.git
cd Ma-These

# 2. Installer les dépendances
bun install

# 3. Générer le client Prisma et initialiser la base de données
bun run db:push

# 4. Lancer le serveur de développement
bun run dev
```

L'application est accessible sur **http://localhost:3000**.

### Variables d'environnement (optionnel)

Pour utiliser des providers IA externes (OpenAI, Anthropic, Mistral, etc.), vous pouvez configurer les clés API directement depuis l'interface dans **Outils IA > Configuration**.

### Scripts disponibles

| Commande | Description |
|----------|-------------|
| `bun run dev` | Serveur de développement (port 3000) |
| `bun run build` | Build de production |
| `bun run start` | Lancer la build de production |
| `bun run lint` | Linting ESLint |
| `bun run test` | Lancer les tests en mode watch (Vitest) |
| `bun run test:run` | Tests en mode single-run (recommandé) |
| `bun run test:coverage` | Tests avec couverture |
| `bun run db:push` | Pousser le schéma Prisma vers SQLite |
| `bun run db:migrate` | Migrations Prisma |
| `bun run db:seed` | Seeding de la base |

## Tests

Le projet utilise **Vitest** avec **1318 tests** couvrant :
- Validation de schémas (Zod)
- Routes API (55 fichiers de test)
- Parsers bibliographiques (BibTeX, RIS, CSL-JSON)
- Store Zustand
- Circuit breaker IA

```bash
# Lancer tous les tests (mode single-run, recommandé)
bun run test:run

# Tests en mode watch
bun run test

# ⚠️ Ne PAS utiliser `bun test` directement (runner natif Bun incompatible avec vi.mock)

# Couverture
bun run test:coverage
```

## Versionnage

Les versions suivent le format **semver** (`MAJEUR.MINEUR.PATCH`) :

| Version | Description |
|---------|-------------|
| **v1.5.1** | Sécurité : retrait des clés API codées en dur, tests P1 corrigés (1318/1318), messages d'erreur français, correction installation |
| **v1.5.0** | 36 modules, 22 providers IA, 21 modes d'écriture, 1318 tests, 16 fournisseurs gratuits, ARS integration |
| **v1.3.0** | RAG, explorateur thèses, Harper, export DOCX |
| **v1.2.0** | Première version publique |

## Licence

Projet privé — tous droits réservés.

---

<p align="center">
  Développé avec pour la communauté académique francophone
</p>
