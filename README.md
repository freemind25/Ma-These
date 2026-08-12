# 🎓 ThesisFrame

> **Assistant intelligent pour la rédaction de thèses de doctorat**

ThesisFrame est une application web full-stack conçue pour accompagner les doctorants dans toutes les étapes de la rédaction de leur thèse. Structuration par chapitres, éditeur riche, assistant IA multi-mode, gestion bibliographique, suivi d'avancement agile et outils méthodologiques — tout dans une interface unifiée.

---

## ✨ Fonctionnalités

### 📝 Éditeur de thèse
- Éditeur riche (Tiptap) avec structuration par chapitres et parties
- Sauvegarde automatique avec debounce
- Suivi de statut par chapitre (à faire, en cours, à vérifier, validé, bloqué...)
- Compteur de mots en temps réel

### 🤖 Assistant IA (10 modes)
- **Rédaction académique** — Génération de contenu structuré
- **Revue de littérature** — Synthèse et analyse bibliographique
- **Correction linguistique** — Orthographe, grammaire, syntaxe
- **Amélioration stylistique** — Reformulations, fluidité, ton académique
- **Critique académique** — Analyse argumentative et méthodologique
- **Structure et progression** — Évaluation de l'organisation
- **Directeur de thèse virtuel** — Chat interactif avec contexte de thèse
- **Super Agent de révision** — Orchestration de 4 agents spécialisés

### 📊 Dashboard & Suivi d'avancement
- Vue d'ensemble des statistiques (chapitres, mots, références, progression)
- Suivi d'avancement par statut de chapitre
- Alertes sur les chapitres bloqués
- Suivi des sprints et stories agiles
- Historique des interactions IA

### 📚 Références bibliographiques
- CRUD complet pour les références
- Export BibTeX
- Recherche et filtrage

### 🔬 Méthodologie
- Paradigmes de recherche
- Démarche méthodologique
- Outils de collecte de données
- Checklist méthodologique

### 📖 Plan de thèse
- Visualisation du plan
- Générateur de template LaTeX personnalisé

### 📰 Articles scientifiques
- Guide IMRaD
- Checklist de soumission
- Boîte à outils rédaction

### 🧠 Outils IA
- Carnet de recherche
- Consensus multi-sources
- Visualisation

### 🌐 Bases de données académiques
- 27 ressources : HAL, Google Scholar, Persée, CAIRN, etc.

---

## 🏗️ Architecture

### Stack technique

| Technologie | Rôle |
|---|---|
| **Next.js 16** (App Router, Turbopack) | Framework full-stack |
| **React 19** | UI library |
| **TypeScript 5** | Type safety |
| **Tailwind CSS 4** | Styling |
| **shadcn/ui** (New York) | Composants UI |
| **Zustand** | State management (client) |
| **TanStack Query** | Server state |
| **Prisma** (SQLite) | ORM & base de données |
| **Zod v4** | Validation |
| **Tiptap** | Éditeur riche |
| **z-ai-web-dev-sdk** | Intégration IA |

### Structure du projet

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # 27 API routes
│   └── layout.tsx         # Layout principal
├── components/
│   ├── dashboard/         # Dashboard & statistiques
│   ├── providers/         # QueryProvider, ThemeProvider
│   └── ui/                # 48 composants shadcn/ui
├── data/                   # Prompts IA, modes d'écriture
├── lib/
│   ├── ai/                # Client SDK IA (z-ai-web-dev-sdk)
│   ├── db.ts              # Client Prisma
│   └── stores/            # Zustand store
└── modules/               # 8 modules métier
    ├── editor/            # Éditeur de thèse
    ├── ai-writing/        # Assistant IA
    ├── methodology/       # Méthodologie
    ├── articles/          # Articles scientifiques
    ├── references/        # Références
    ├── thesis-plan/       # Plan de thèse
    ├── ai-tools/          # Outils IA
    └── academic-db/       # Bases de données
```

### API Routes

```
/api/thesis              — CRUD thèses
/api/chapters/[id]       — CRUD chapitres
/api/references          — CRUD références (+ export BibTeX)
/api/ai-writing          — Assistant IA (10 modes)
/api/directeur-chat      — Chat directeur virtuel
/api/cadrages            — Cadrage de thèse
/api/sources             — Sources de recherche
/api/sprints             — Sprints agiles
/api/stories             — Stories
/api/stats               — Statistiques dashboard
/api/ai-config           — Configuration IA
/api/entries             — Carnet de recherche
```

---

## 🚀 Installation

### Prérequis
- Node.js 18+ ou Bun
- SQLite

```bash
# Cloner le dépôt
git clone https://github.com/freemind25/MaTh-se.git
cd MaTh-se

# Installer les dépendances
npm install

# Initialiser la base de données
npx prisma db push

# Lancer en développement
npm run dev
```

L'application est accessible sur `http://localhost:3000`.

---

## 📋 Schéma de données (14 modèles Prisma)

| Modèle | Description |
|---|---|
| `Thesis` | Thèse de doctorat |
| `Chapter` | Chapitre de thèse |
| `Part` | Partie d'une thèse |
| `ThesisCadrage` | Cadrage (versionnable) |
| `ThesisCadrageField` | Champs du cadrage |
| `ThesisCadrageVersion` | Versions du cadrage |
| `Reference` | Référence bibliographique |
| `ResearchSource` | Source de recherche |
| `NotebookEntry` | Entrée du carnet |
| `AiToolConfig` | Configuration IA |
| `AgileSprint` | Sprint |
| `AgileStory` | Story |
| `ProvenanceLog` | Journal de traçabilité IA |
| `LicenseKey` | Clé de licence |

---

## 📸 Déploiement

ThesisFrame est déployé sur **Vercel** avec build automatique depuis la branche `main`.

---

## 📜 Licence

Ce projet est destiné à un usage académique et de recherche.

---

<p align="center">
  <strong>ThesisFrame</strong> — Structurez. Rédigez. Publiez.
</p>
