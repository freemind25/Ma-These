<p align="center">
  <img src="public/logo.svg" alt="Ma Thèse Logo" width="80" height="80" />
</p>

<h1 align="center">Ma Thèse</h1>

<p align="center">
  <strong>Plateforme IA de rédaction de thèse et mémoires universitaires</strong><br/>
  Outil d'assistance à la rédaction académique avec intelligence artificielle
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/Prisma-SQLite-2D3748?logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/shadcn/ui-Component_Library-18181B" alt="shadcn/ui" />
</p>

---

## 🎯 Présentation

**Ma Thèse** est une application web complète conçue pour accompagner les doctorants et étudiants de master dans la rédaction de leur thèse, mémoire ou dissertation. L'outil intègre des capacités d'IA avancées pour assister à chaque étape du processus de rédaction académique.

## ✨ Fonctionnalités principales

### 📝 Rédaction assistée par IA
- **28 modules fonctionnels** couvrant l'ensemble du parcours de rédaction
- **Modes d'écriture IA** : brouillon, affinement, recherche approfondie (deep-research)
- **Déblocage d'écriture** : génération de suggestions, reformulations, transitions
- **Vérification méthodologique** et **vérification cartographique**

### 📚 Base de connaissances intégrée
- **58+ ressources académiques** en base de données (ouvrages, articles, guides, dépôts GitHub)
- Couverture : rédaction de thèse, revue de littérature, méthodologie, outils IA, données urbaines, open access
- **RAG (Retrieval-Augmented Generation)** pour des réponses fondées sur les sources

### 🔍 Recherche et références
- **Recherche plein texte** dans les documents académiques
- **Intégration CORE.ac.uk API v3** : accès à 200M+ articles open access
- **Recherche web** intégrée pour le mode deep-research
- **Gestion des références** et citations

### 🎨 Outils complémentaires
- **Composition APA** : génération de résultats selon les normes APA 7e édition
- **Diagrammes** : création de schémas et diagrammes de recherche
- **Analyse du champ de recherche** et cadrage de la problématique
- **Feuille de route agile** pour le suivi de progression
- **Grammaire et correction** linguistique
- **Export PDF** professionnel
- **Vérification scientifique** et équilibre des chapitres
- **Journaux en accès ouvert** (Open Access)

### 🤖 Fournisseurs IA multiples
- OpenAI (GPT-4, GPT-4o)
- Anthropic (Claude)
- Mistral AI
- RoutesMe (proxy multi-fournisseurs)
- Configuration flexible par l'utilisateur

## 🛠️ Stack technique

| Technologie | Rôle |
|-------------|------|
| **Next.js 16** | Framework (App Router, Server Components) |
| **TypeScript 5** | Langage principal |
| **Tailwind CSS 4** | Système de design |
| **shadcn/ui** | Composants UI (New York style) |
| **Prisma ORM** | Base de données SQLite |
| **Zustand** | État client |
| **TanStack Query** | État serveur |
| **z-ai-web-dev-sdk** | Capacités IA (LLM, VLM, TTS, ASR) |
| **CORE.ac.uk API** | Articles de recherche open access |

## 📁 Structure du projet

```
ma-these/
├── src/
│   ├── app/                    # Routes Next.js (App Router)
│   │   ├── api/                # API routes (ai-writing, core, deep-research...)
│   │   ├── layout.tsx          # Layout principal
│   │   └── page.tsx            # Page d'accueil
│   ├── components/
│   │   ├── ui/                 # Composants shadcn/ui
│   │   ├── layout/             # Header, sidebar, footer
│   │   └── dashboard/          # Composants du tableau de bord
│   ├── modules/                # 28 modules fonctionnels
│   │   ├── ai-writing/         # Rédaction assistée par IA
│   │   ├── thesis-rag/         # Base de connaissances RAG
│   │   ├── references/         # Gestion des références
│   │   ├── methodology/        # Méthodologie de recherche
│   │   └── ...                 # Autres modules
│   └── lib/
│       ├── ai/                 # Clients IA (OpenAI, Anthropic, Mistral)
│       ├── core-api.ts         # Client CORE.ac.uk API v3
│       └── db.ts               # Client Prisma
├── prisma/
│   └── schema.prisma           # Schéma de base de données
├── db/
│   └── custom.db               # Base SQLite
└── public/
    └── logo.svg                # Logo de l'application
```

## 🚀 Installation

```bash
# Cloner le dépôt
git clone https://github.com/freemind25/Ma-These.git
cd Ma-These

# Installer les dépendances
bun install

# Pousser le schéma de base de données
bun run db:push

# Lancer le serveur de développement
bun run dev
```

## 📄 Licence

Projet privé — tous droits réservés.

---

<p align="center">
  Développé avec ❤️ pour la communauté académique francophone
</p>
