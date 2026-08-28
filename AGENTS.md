# AGENTS.md — Ma Thèse (ThesisFrame) v1.9.0

> **Contexte pour agents IA de développement (Cursor, Windsurf, Copilot, etc.)**
> Dernière mise à jour : 28 août 2026

---

## Identité du projet

- **Nom** : Ma Thèse (code name : ThesisFrame)
- **Version** : 1.5.1
- **Type** : Application web Next.js 16 (App Router) + option Tauri v2 (desktop Windows)
- **Langue** : Français (UI + commentaires + messages d'erreur)
- **Licence** : Projet privé — tous droits réservés
- **Repo** : https://github.com/freemind25/Ma-These

---

## Stack technique

| Couche | Technologie | Version |
|--------|-------------|---------|
| Framework | Next.js (App Router) | ^16.1.1 |
| Langage | TypeScript | ^5 |
| Runtime | Bun | >= 1.0 |
| Styling | Tailwind CSS 4 | ^4 |
| UI | shadcn/ui (New York) | — |
| Icônes | Lucide React | ^0.525 |
| Base de données | SQLite (Prisma ORM) | ^6.11.1 |
| État client | Zustand | ^5.0.6 |
| État serveur | TanStack Query | ^5.82.0 |
| Éditeur riche | TipTap | ^3.29.2 |
| IA SDK | z-ai-web-dev-sdk | ^0.0.18 |
| Tests | Vitest | ^4.1.11 |
| Lint | ESLint (Next.js config) | ^9 |
| Desktop | Tauri v2 | ^2 |

---

## Architecture

### Monorepo structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Layout racine (sidebar + header + footer)
│   ├── page.tsx            # Route / → Dashboard
│   └── api/                # ~50 API routes (toutes en TypeScript)
│       ├── ai-test/        # Test de connexion IA
│       ├── ai-writing/     # Écriture IA (GET + stream POST)
│       ├── thesis/         # CRUD thèses, parties, chapitres, cadrages
│       ├── references/     # Bibliographie (CRUD + import BibTeX/RIS/CSL-JSON)
│       ├── sprints/        # Agile (sprints + stories)
│       └── ...
├── components/
│   ├── ui/                 # 40+ composants shadcn/ui (NE PAS MODIFIER)
│   ├── layout/             # Sidebar, header, footer, dialogs
│   └── dashboard/          # Widgets du tableau de bord
├── modules/                # 36 modules fonctionnels (1 dossier = 1 module)
│   ├── editor/             # Éditeur TipTap + auto-save + prediction IA
│   ├── ai-writing/         # 21 modes d'écriture IA + streaming
│   ├── thesis-rag/         # RAG contextuel sur la thèse
│   ├── references/         # Gestion bibliographique
│   └── ...
├── data/                   # Données statiques (modes IA, prompts directeurs)
└── lib/
    ├── ai/                 # ⭐ Clients IA multi-providers + circuit breaker
    │   ├── ai-provider.ts  # Détection backend, URL, headers, format
    │   ├── ai-types.ts     # Types + DYNAMIC_MODEL_PROVIDERS (18 entrées)
    │   ├── zai-client.ts   # Client IA principal (completion + stream + fallback)
    │   ├── hardcoded-keys.ts # Clés via env vars (plus rien en dur)
    │   └── __tests__/      # Tests circuit breaker
    ├── stores/             # Zustand store (app-store.ts)
    ├── parsers/            # BibTeX, RIS, CSL-JSON parsers
    ├── rag/                # RAG service (indexation chapitres)
    └── db.ts               # Client Prisma singleton
prisma/
└── schema.prisma           # 15 modèles : Thesis, Chapter, Part, Reference, etc.
db/
└── custom.db               # SQLite (généré par prisma db push)
mini-services/              # Services externes (geo-mcp sur port séparé)
```

### Pattern de module

Chaque module dans `src/modules/` suit ce pattern :
```
modules/
└── nom-module/
    └── nom-module-page.tsx   # Composant page 'use client'
```
Les modules sont注册és dans la sidebar (`src/components/layout/app-sidebar.tsx`).

### Pattern de route API

```
app/api/
└── nom-route/
    ├── route.ts             # Handler (GET/POST/PUT/DELETE)
    └── route.test.ts        # Tests Vitest
```

---

## Conventions de code

### Imports
- Toujours utiliser `import { X } from '@/lib/...'` (alias `@/`)
- Ordre : React → composants shadcn/ui → lib hooks → composants locaux

### Composants
- Préférer les composants shadcn/ui existants dans `src/components/ui/`
- Ne JAMAIS modifier les fichiers dans `src/components/ui/` (générés par shadcn)
- Utiliser `'use client'` pour les composants interactifs, `'use server'` pour les handlers

### API Routes
- Valider les entrées avec Zod (schémas dans `src/lib/api-schemas.ts`)
- Retourner `NextResponse.json({ error: "..." }, { status: 400 })` pour les erreurs
- Utiliser `try/catch` avec log de l'erreur côté serveur

### Base de données
- Schéma : `prisma/schema.prisma`
- Client : `import { db } from '@/lib/db'`
- Ne jamais accéder directement au fichier `.db`

### IA / AI
- Client principal : `src/lib/ai/zai-client.ts`
- Détection du provider : `src/lib/ai/ai-provider.ts`
- 22 providers dont 18 gratuits (DYNAMIC_MODEL_PROVIDERS)
- Circuit breaker par provider (3 failures → 30s cooldown → half-open)
- Streaming SSE via `/api/ai-writing/stream`
- z-ai-web-dev-sdk : utiliser UNIQUEMENT côté serveur (backend API routes)
- Clés API : via variables d'environnement ou configuration UI (jamais en dur)

### ⚠️ Architecture des prompts IA (OBLIGATOIRE)

Le savoir métier est centralisé dans un **socle unique de vérité** :
```
src/lib/ai/
├── knowledge-core.ts      ← SOCLE : savoir métier digéré (unique source de vérité)
├── shared-prompts.ts      ← Prompts de RÔLE/FORMAT réutilisables (pas du savoir métier)
├── prompt-builder.ts      ← assembleur : SOCLE + spécialisation
└── specializations/       ← 19 fichiers (1 par mode + directeur)
    ├── index.ts           ← registry (mode id → prompt)
    ├── directeur.ts
    ├── scientific-writing.ts
    ├── peer-review.ts
    └── ...
```

**Règles anti-duplication (à respecter ABSOLUMENT) :**
1. TOUT savoir métier (règles, grilles, critères) va dans `src/lib/ai/knowledge-core.ts` — **JAMAIS** dans un prompt de spécialisation
2. Un prompt de spécialisation contient **UNIQUEMENT** : rôle, tâche, format de sortie
3. Avant de créer une règle dans un prompt, vérifier si elle existe déjà dans `knowledge-core.ts`
4. Toute modification de savoir métier se fait dans `knowledge-core.ts` **uniquement**
5. `src/data/ai-writing-modes.ts` ne contient plus de `systemPrompt` — les métadonnées (label, icon, temperature) restent
6. `src/data/directeur-prompt.ts` est déprécié — utiliser `src/lib/ai/specializations/directeur.ts`
7. Les routes API (`/api/ai-writing`, `/api/ai-writing/stream`, `/api/directeur-chat`) utilisent `SPECIALIZATION_PROMPTS[mode.id]`
8. **Leçon digestion (Phase 5) :** Un cas limite non couvert par le noyau sera résolu par chaque mode par extrapolation — potentiellement contradictoire. Toute divergence inter-modes révélée par un test ou retour utilisateur = signal d'un **trou dans le knowledge-core**, pas d'un bug de prompt. Corriger dans le module, pas dans la spécialisation.
9. **Processus de feedback (cf. `feedback.md`) :** Tout signal de divergence (retour utilisateur, test, audit) suit le processus : Capture → Triage (trou du noyau ? duplication ? faux positif ?) → Correction dans le bon fichier → Validation (lint + tests + convergence inter-modes) → Documentation dans le worklog. **Jamais** corriger dans une spécialisation ce qui appartient au noyau.

**Modules de connaissance disponibles (11) :** `style`, `ethics`, `coherence`, `auto-edition`, `peer-review`, `methodology`, `writing-process`, `literature-review`, `data-analysis`, `grant-writing`, `publication`

**Sources distillées :** Kumar (Research Methodology), Salkind (100 Questions), White (Mapping Your Thesis), Ollhoff (Literature Review), Rae & Wong (Applied Data Analysis), Smith & Works (Grant Writing), Gastel & Day (How to Write and Publish a Scientific Paper)

**Token budget :** full core ~3 900 tokens (≤ 4 500 max), directeur mode ~2 600 tokens (≤ 3 000 max)

| Mode | Modules injectés | Tokens ≈ |
|------|-------------------|----------|
| directeur | style, ethics, coherence, methodology, writing-process, publication | 2 186 |
| scientific-writing | style, coherence, writing-process | 1 190 |
| literature-review | literature-review, style | 1 030 |
| revue-litterature | literature-review, methodology, style | 1 537 |
| peer-review | peer-review, coherence, publication | 1 202 |
| revision-plan | peer-review, coherence, writing-process, style | 1 436 |
| paraphrase | style, ethics | 794 |
| academic-reformulation | style, ethics | 794 |
| hypothesis | methodology, style | 1 370 |
| methodology | methodology, style | 1 370 |
| theory | style, writing-process | 970 |
| auto-edition-8c | auto-edition, style | 580 |
| abstract | style, publication | 885 |
| grammaire | style | 360 |
| supervision | style | 360 |
| harper | style | 360 |
| defense | style, coherence | 680 |
| deblocage | (aucun — standalone) | 0 |

### Tests
- **OBLIGATOIRE** : `bun run test:run` (Vitest en mode single-run)
- **INTERDIT** : `bun test` (runner natif Bun incompatible avec `vi.mock`/`vi.hoisted`)
- Fichiers de test : colocated `route.test.ts` à côté de `route.ts`
- Imports test : `import { describe, it, expect, vi } from 'vitest'`
- 1333 tests existants (56 fichiers)

### Lint
- `bun run lint` — 0 erreurs acceptées
- ~174 warnings pré-existantes (non bloquantes)

### Messages utilisateur
- Tous en **français**
- Erreurs IA : utiliser `getFriendlyError()` (429→Limite, 401/403→Invalide, 404→Introuvable, 503→Indisponible)

---

## Base de données (15 modèles Prisma)

| Modèle | Rôle |
|--------|------|
| `Thesis` | Thèse (titre, auteur, statut) |
| `Chapter` | Chapitre (contenu HTML TipTap, wordCount) |
| `Part` | Partie (regroupement de chapitres) |
| `ThesisCadrage` | Cadrage préliminaire |
| `ThesisCadrageField` | Champs du cadrage (thème, problématique...) |
| `ThesisCadrageVersion` | Versions/snapshots du cadrage |
| `DoctoralToolbox` | Boîte doctorale (checklist, jalons, documents) |
| `ResearchTab` | Onglets de recherche |
| `Reference` | Référence bibliographique (BibTeX/RIS/CSL-JSON) |
| `ResearchSource` | Source du carnet de recherche |
| `NotebookEntry` | Entrée du carnet |
| `AgileSprint` | Sprint agile |
| `AgileStory` | User story |
| `CustomBookSkill` | Compétence extraite d'un livre |
| `LicenseKey` | Licence |
| `ElementAnalyse` | Élément d'analyse (méthodologie/vérif.) |
| `TypeAnalyseMethodologique` | Référentiel de vérification par discipline |
| `SessionVerification` | Session de vérification méthodologique |
| `DocumentChunk` | Chunk RAG pour index sémantique (avec `thesisId`, `embedding`, `embeddingModel`) |

### RAG — Limites et configuration
- **Stockage** : embeddings en JSON string par chunk (Prisma SQLite) — parsing à chaque requête, pas d'index vectoriel. OK pour 1 thèse (~400 chunks). **NE PAS construire de feature dépendant du volume sans migrer vers sqlite-vec.**
- **Poids hybride** : `HYBRID_WEIGHTS` (exporté depuis `rag-service.ts`) — défaut 65% sémantique / 35% mot-clé. Ajustable via `RAG_KEYWORD_WEIGHT` / `RAG_SEMANTIC_WEIGHT` (env vars). À ajuster après tests utilisateurs réels.
- **Filtrage DB** : `retrieveChunks` filtre par `thesisId` + `embedding IS NOT NULL` (mode hybride). Plus de chargement intégral de la table.
- **Providers embeddings** : OpenAI, Mistral, Google, Groq, OpenRouter supportés. z.ai, Anthropic, Cohere, etc. non supportés.
- **Test T3** : ✅ VALIDÉ avec Mistral/mistral-embed (hybrid+semantic, 0 keyword-only). Script `scripts/test-rag-semantic.ts`.

---

## 36 modules fonctionnels

| # | Module | Dossier | Catégorie sidebar |
|---|--------|---------|---------------------|
| 1 | Tableau de bord | dashboard | — (route /) |
| 2 | Éditeur de thèse | editor | Rédaction |
| 3 | Écriture IA | ai-writing | Rédaction |
| 4 | Deep Research | ai-tools | Rédaction |
| 5 | Déblocage écriture | deblocage-ecriture | Rédaction |
| 6 | Auto-édition | auto-edition | Rédaction |
| 7 | Grammaire | grammaire | Rédaction |
| 8 | Phrasier académique | phrasebook | Rédaction |
| 9 | Plan de thèse | thesis-plan | Structure |
| 10 | Cadrage | cadrage | Structure |
| 11 | Feuille de route agile | feuille-route-agile | Structure |
| 12 | Boîte doctorale | boite-doctorale | Structure |
| 13 | Livres-compétences | livres-competences | Structure |
| 14 | Équilibre chapitres | equilibre-chapitres | Structure |
| 15 | Références | references | Recherche |
| 16 | Journaux OA | journaux-oa | Recherche |
| 17 | Thèses en ligne | theses-en-ligne | Recherche |
| 18 | Explorateur thèses | explorateur-theses | Recherche |
| 19 | Recherche plein texte | recherche-plein-texte | Recherche |
| 20 | Onglet recherche | onglet-recherche | Recherche |
| 21 | Harper | harper | Recherche |
| 22 | Academic DB | academic-db | Recherche |
| 23 | Vérification méthodologique | verification-methodo | Méthodologie |
| 24 | Vérification cartographique | verification-carto | Méthodologie |
| 25 | Vérification cohérence | verification-coherence | Méthodologie |
| 26 | Alignement preuves | alignement-preuves | Méthodologie |
| 27 | Outils SLR | outils-slr | Méthodologie |
| 28 | Analyse champ recherche | analyse-champ-recherche | Méthodologie |
| 29 | Corpus publication | corpus-publication | Méthodologie |
| 30 | Outils IA (config) | ai-tools | IA & Outils |
| 31 | Thesis RAG | thesis-rag | IA & Outils |
| 32 | Paper2Code | paper2code | IA & Outils |
| 33 | Diagrammes | diagrammes | IA & Outils |
| 34 | RoutesMe | routesme | IA & Outils |
| 35 | Export PDF | export-pdf | Export |
| 36 | Export DOCX | export-docx | Export |

---

## 21 modes d'écriture IA

Catégories : `writing`, `analysis`, `review`, `generation`, `research`

Modes : scientific-writing, literature-review, peer-review, paraphrase, abstract, hypothesis, methodology, theory, supervision, grammaire, defense, harper, academic-reformulation, deblocage, revision-plan, freeform, improvement, revue-litterature, auto-edition-8c, deep-research.

Les system prompts sont centralisés dans `src/lib/ai/specializations/index.ts` (via `SPECIALIZATION_PROMPTS`).

---

## Commandes essentielles

```bash
bun install                # Installer les dépendances
bun run dev                # Développement (port 3000)
bun run build              # Build de production
bun run lint               # Linting
bun run test:run           # Tests (Vitest single-run) ⭐
bun run test               # Tests (Vitest watch)
bun run db:push            # Pousser schéma Prisma → SQLite
bun run db:seed            # Seeding
```

---

## Points d'attention

1. **Ne JAMAIS utiliser `bun test`** → le runner natif Bun ne supporte pas `vi.mock`/`vi.hoisted`
2. **z-ai-web-dev-sdk** → côté serveur uniquement (API routes), jamais côté client
3. **Ports** : Next.js sur 3000, mini-services sur ports séparés (ex: 3001 pour geo-mcp)
4. **Gateway Caddy** : pour les requêtes vers d'autres ports, utiliser `?XTransformPort=XXXX` dans l'URL
5. **Protocole d'autorisation** (cf. FICHE_SYNTHESE.md) : aucune modification fonctionnelle sans aval du propriétaire
6. **Variables d'environnement** : clés API configurables via l'UI (Outils IA > Configuration), plus rien en dur
7. **Processus de feedback** (cf. `feedback.md`) : toute divergence inter-modes ou retour utilisateur suit le processus Capture → Triage → Correction → Validation → Documentation

---

## Historique des versions

| Version | Description |
|---------|-------------|
| **v1.9.0** | Injection par niveau doctorant (DEBUTANT/INTERMEDIAIRE/AVANCE). `getLevelCalibration()` dans prompt-builder.ts, post-injection dans 3 routes (ai-writing, stream, directeur-chat). Token budget : +~110 tokens par niveau. Knowledge-core inchangé. |
| **v1.8.4** | Processus de feedback (feedback.md + règle #9 AGENTS.md). Capture → Triage → Correction → Validation → Documentation. |
| **v1.8.3** | Clôture audit prompts + T3 RAG validé (Mistral/mistral-embed, hybrid+semantic). coherence-check factorisé (Option B), verification-carto dédupliqué (shared-prompts.ts), cohérence argumentative ajoutée au noyau. Bilan 6/6. 1333 tests. |
| **v1.8.1** | Phase 5 digestion validée (5/5 sur tests exécutables). Corrections knowledge-core : cas limite citation littérale (T4), critère unité d'analyse étude de cas (T1). Full core ~3806 tokens. |
| **v1.8.0** | Knowledge-core v2.1 : module publication (Gastel & Day), 11 modules, routes vérification déléguées au noyau |
| **v1.7.0** | Knowledge-core v2 : 6 ouvrages distillés, 10 modules, mapping optimisé |
| **v1.6.0** | Architecture connaissance : knowledge-core + prompt-builder + 19 spécialisations |
| **v1.5.1** | Sécurité (clés retirées), tests P1 (1318/1318), erreurs FR, README fix |
| **v1.5.0** | 36 modules, 22 providers, 21 modes IA, ARS, 16 fournisseurs gratuits |
| **v1.3.0** | RAG, explorateur thèses, Harper, export DOCX |
| **v1.2.0** | Première version publique |