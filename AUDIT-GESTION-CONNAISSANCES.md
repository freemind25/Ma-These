# AUDIT — Gestion des connaissances de l'application

> **Projet** : Ma Thèse (ThesisFrame) v1.5.1  
> **Date** : 27 août 2026  
> **Périmètre** : prompts IA, ressources métier, arborescence, dépendances, AGENTS.md  

---

## TABLE DES MATIÈRES

1. [Prompts système de l'IA](#1--prompts-système-de-lia)
2. [Ressources métier (livres, articles, règles)](#2--ressources-métier)
3. [AGENTS.md / Instructions pour l'IA de codage](#3--agentsmd--instructions-pour-lia-de-codage)
4. [Arborescence complète du projet](#4--arborescence-complète-du-projet)
5. [README.md](#5--readmemd)
6. [Dépendances IA du package.json](#6--dépendances-ia-du-packagejson)
7. [Exemple de conversation réelle avec l'assistant](#7--exemple-de-conversation-réelle-avec-lassistant)

---

## 1 — PROMPTS SYSTÈME DE L'IA

L'app contient **17 emplacements** avec des prompts système. Voici l'inventaire complet :

### 1.1 Fichier principal : `src/data/ai-writing-modes.ts` (21 modes)

Chaque mode d'écriture possède son propre `systemPrompt`. Le fichier définit `WRITING_MODES: WritingMode[]`.

| # | ID du mode | Label | Temp. | Catégorie | Fichier / Ligne approx. |
|---|-----------|-------|-------|-----------|------------------------|
| 1 | `scientific-writing` | Rédaction scientifique | 0.6 | writing | ai-writing-modes.ts:30 |
| 2 | `literature-review` | Revue de littérature | 0.5 | analysis | ai-writing-modes.ts:51 |
| 3 | `peer-review` | Relecture critique (grille Review Commons) | 0.4 | review | ai-writing-modes.ts:71 |
| 4 | `paraphrase` | Paraphrase académique | 0.5 | writing | ai-writing-modes.ts:133 |
| 5 | `abstract` | Rédaction de résumé | 0.4 | generation | ai-writing-modes.ts:154 |
| 6 | `hypothesis` | Formulation d'hypothèses | 0.6 | generation | ai-writing-modes.ts:~175 |
| 7 | `methodology` | Méthodologie de recherche | 0.5 | analysis | ai-writing-modes.ts:~195 |
| 8 | `theoretical-framework` | Cadre théorique | 0.6 | analysis | ai-writing-modes.ts:~215 |
| 9 | `supervision` | Rédaction de supervision | 0.5 | generation | ai-writing-modes.ts:~235 |
| 10 | `correction` | Correction grammaticale | 0.3 | review | ai-writing-modes.ts:~255 |
| 11 | `defense` | Préparation de soutenance | 0.6 | generation | ai-writing-modes.ts:~275 |
| 12 | `harper` | Résumeur/Paraphraseur Harper | 0.5 | writing | ai-writing-modes.ts:~295 |
| 13 | `academic-paraphrase` | Reformulation académique références | 0.5 | writing | ai-writing-modes.ts:~315 |
| 14 | `unblock` | Déblocage d'écriture (coach) | 0.7 | writing | ai-writing-modes.ts:~335 |
| 15 | `revision-plan` | Plan de révision manuscrit | 0.4 | review | ai-writing-modes.ts:~355 |
| 16 | `general` | Assistant polyvalent | 0.7 | writing | ai-writing-modes.ts:~375 |
| 17 | `learning-plan` | Plan d'apprentissage personnalisé | 0.5 | analysis | ai-writing-modes.ts:~395 |
| 18 | `slr` | Revue systématique (SLR) | 0.5 | research | ai-writing-modes.ts:~415 |
| 19 | `auto-editing` | Auto-édition 8 critères (Gastel & Day) | 0.4 | review | ai-writing-modes.ts:~435 |
| 20 | `writing-quality` | Écriture qualité | 0.5 | research | ai-writing-modes.ts:~455 |
| 21 | `citation-verification` | Vérification des citations | 0.3 | research | ai-writing-modes.ts:~475 |
| 22 | `style-calibration` | Calibrage de style | 0.5 | research | ai-writing-modes.ts:~495 |

**Type** : `WritingMode { id, label, description, icon, systemPrompt, placeholder, temperature, category }`

### 1.2 Fichier `src/data/directeur-prompt.ts` — Prompt du Directeur de thèse

**Emplacement** : `src/data/directeur-prompt.ts` (66 lignes)  
**Export** : `DIRECTEUR_SYSTEM_PROMPT`  
**Personnage** : « Professeur Jean-Marc Renaud »  
**Rôle** : Feedback sur chapitres, conseils méthodologiques, suggestions de lectures, aide à la structuration, reminders deadlines, encouragement  
**Méthode** : Valoriser → 2-3 points d'amélioration → Questions ouvertes → Références → Encouragement  
**Contraintes** : Français académique, max 400 mots, ne jamais se révéler IA, corpus en mode CRITIQUE uniquement (jamais de génération de contenu de substitution)  
**Critères supplémentaires** : Éthique/plagiat, cohérence intro/discussion, redondance texte/tableaux, principes DORA, signaux revues prédatrices

### 1.3 Route API : `src/app/api/directeur-chat/route.ts`

- Injecte `DIRECTEUR_SYSTEM_PROMPT` + fiches de corpus pertinentes (détection par mots-clés) en tant que `CONTEXTE ADDITIONNEL`
- Température : 0.7
- Historique de conversation maintenu côté client (envoyé à chaque requête)

### 1.4 Route API : `src/lib/rag/rag-service.ts` — Prompt RAG

```
const RAG_SYSTEM_PROMPT = `Tu es l'assistant de thèse de l'utilisateur. Réponds à sa question en te basant UNIQUEMENT sur les extraits de documents fournis ci-dessous.
Si les documents ne contiennent pas assez d'information, dis-le honnêtement.
Cite tes sources entre crochets : [Chapitre X - Titre] ou [Réf: Auteur, Année].
Réponds en français, de manière structurée et académique.`;
```

### 1.5 Route API : `src/app/api/text-prediction/route.ts`

Prompt de prédiction de texte (ghost text) pour l'éditeur TipTap :
« Tu es un assistant de prédiction de texte pour la rédaction académique universitaire (thèse, mémoire, article scientifique). »

### 1.6 Route API : `src/app/api/coherence-check/route.ts`

Prompt dynamique construit via `buildSystemPrompt(mode, focusedChecks)` à partir des catégories de `src/lib/data/coherence-data.ts` :  
- Cohérence terminologique
- Cohérence argumentative
- Cohérence numérique
- Introduction ↔ Discussion
- Structure narrative
- Références citées

### 1.7 Route API : `src/app/api/verification-publication/route.ts`

**4 prompts système spécialisés** (selon le sous-module appelé) :
1. Vérification cohérence introduction/discussion
2. Vérification redondance texte/tableau
3. Vérification structure (L2)
4. Vérification redondance figure/texte

### 1.8 Route API : `src/app/api/deep-research/route.ts`

**4 prompts système** pour le pipeline de recherche approfondie :
1. Création du brief de recherche
2. Décomposition en sous-requêtes
3. Compression des résultats web
4. Rédaction du rapport final

### 1.9 Route API : `src/app/api/paper2code/generate/route.ts`

- Prompt système passé en paramètre par le client (génération de code depuis un papier)

---

## 2 — RESSOURCES MÉTIER

### 2.1 Corpus de publication scientifique

**Fichier** : `src/data/corpus-publication.ts` (269 lignes)  
**Source** : Synthétisé à partir de *Gastel, B. & Day, R.A., How to Write and Publish a Scientific Paper* (9e éd., 2022)  
**Format** : `CorpusFiche { id, titre, source, signaux[], contenu, questionsDiagnostics[], pointsIntegration[] }`

**6 fiches** :
| # | ID | Titre | Source |
|---|----|-------|--------|
| 1 | `ethique-publication` | Éthique de la publication scientifique | Gastel & Day, 2022 |
| 2 | `choisir-revue` | Choisir une revue et éviter les revues prédatrices | Gastel & Day, 2022 |
| 3 | `ecrire-resultats-discussion` | Écrire les résultats et la discussion sans les confondre | Gastel & Day, 2022 |
| 4 | `quand-tableau-figure` | Quand (et quand ne pas) utiliser un tableau ou une figure | Gastel & Day, 2022 |
| 5 | `langue-seconde` | Écrire la science en langue seconde | Gastel & Day, 2022 |
| 6 | `auto-edition-8c` | Auto-édition : le cadre des 8C | Gastel & Day, 2022 |

**Utilisation** : Injecté dynamiquement dans le prompt du directeur de thèse via détection de mots-clés (`detectRelevantFiches()` dans `directeur-chat/route.ts`). Chaque fiche contient :
- `signaux[]` : mots-clés déclencheurs
- `contenu` : règles et recommandations
- `questionsDiagnostics[]` : questions de diagnostic pour chaque critère
- `pointsIntegration[]` : références croisées vers d'autres modules

### 2.2 Phrasier académique (Academic Phrasebank)

**Fichier** : `src/lib/data/phrasebank-data.ts` (847 lignes)  
**Source** : Inspiré du *Manchester Academic Phrasebank*, adapté au contexte francophone  
**Structure** : `Phrase { id, text, section, function, example? }`

- **Sections** : introduction, revue-litterature, problematique, methodologie, resultats, discussion, conclusion
- **Fonctions** : ouvrir, argumenter, citer, nuancer, transitionner, conclure, comparer, définir, exemplifier, structurer

### 2.3 Livres de compétences (Book Skills)

**Emplacement** : `upload/extracted-text/` (6 fichiers texte, 3,2 Mo total)  
**Modèle Prisma** : `CustomBookSkill { title, author, content, tags }`  
**Seed** : `scripts/seed-book-skills.ts`

| # | Titre | Auteur | Taille | Tags |
|---|-------|--------|--------|------|
| 1 | 100 Questions (and Answers) About Research Methods | Neil J. Salkind | 225 Ko | méthodologie, recherche, méthodes quantitatives/qualitatives |
| 2 | Applied Data Analysis for Urban Planning and Management | Alasdair Rae, Cecilia Wong | 455 Ko | analyse de données, urbanisme, SIG, statistiques spatiales |
| 3 | How to Write a Literature Review: A Workbook in Six Steps | Jim Ollhoff | 35 Ko | revue de littérature, rédaction, recherche bibliographique |
| 4 | Mapping Your Thesis: Theory and Techniques for Doctoral Research | Barry White | 1 043 Ko | thèse, plan de thèse, techniques de recherche, rédaction doctorale |
| 5 | Research Methodology: A Step-by-Step Guide for Beginners | Ranjit Kumar | 960 Ko | méthodologie, recherche, enquête, échantillonnage |
| 6 | The Complete Book of Grant Writing | — | 442 Ko | rédaction de demandes de subvention |

**Stockage** : En base SQLite (table `CustomBookSkill`), accessibles via `/api/book-skills` et `/api/book-skills/[id]`. Le contenu brut est interrogeable par l'IA.

### 2.4 Données de cohérence

**Fichier** : `src/lib/data/coherence-data.ts`  
**Structure** : `CoherenceCheck { id, label, description, category, icon, example, severity }`

6 catégories : terminologique, argumentative, numérique, intro↔discussion, structure narrative, références citées.

### 2.5 Référentiel d'analyse urbaine (vérification cartographique)

**Emplacement** : `src/app/api/verification-carto/route.ts` (prompt système inline)  
**Données** : 37 éléments de vérification, 5 phases, 3 modèles Prisma (`ElementAnalyse`, `TypeAnalyseMethodologique`, `SessionVerification`)

---

## 3 — AGENTS.md / INSTRUCTIONS POUR L'IA DE CODAGE

### ✅ Existe : `AGENTS.md` (racine du projet)

Créé le 27/08/2026 — 200 lignes.

**Contenu** :
- Identité du projet (nom, version, type, repo)
- Stack technique détaillée (15 technologies avec versions)
- Architecture (structure des dossiers, pattern module, pattern route API)
- Conventions de code (imports, composants shadcn, API routes, DB, IA, tests, lint)
- Base de données : documentation des 15 modèles Prisma
- Liste des 36 modules fonctionnels avec catégorie sidebar
- Liste des 21 modes d'écriture IA
- Commandes essentielles
- Points d'attention critiques (bun test interdit, z-ai-web-dev-sdk serveur only, etc.)
- Historique des versions

### Autres fichiers de contexte :

| Fichier | Rôle |
|---------|------|
| `FICHE_SYNTHESE.md` | Fiche de traçabilité du projet + protocole d'autorisation préalable |
| `ETAT-PROJET-THESISFRAME.md` | État du projet |
| `ROADMAP.md` | Feuille de route |
| `worklog.md` | Journal de bord détaillé des tâches réalisées par l'IA |

---

## 4 — ARBORESCENCE COMPLÈTE DU PROJET

> Fichier généré : `arborescence.txt` (2180 lignes) au format Windows `tree /f`

*(Voir fichier `arborescence.txt` à la racine — trop long pour être intégré inline. Résumé ci-dessous.)*

**Structure principale** :
```
C:\Ma-These
├───src/
│   ├───app/                  # Routes Next.js App Router
│   │   ├───api/              # ~50 routes API (GET/POST/PUT/DELETE)
│   │   ├───layout.tsx        # Layout principal
│   │   ├───page.tsx          # Dashboard (route /)
│   │   └───globals.css
│   ├───components/
│   │   ├───ui/               # 40+ composants shadcn/ui
│   │   ├───layout/           # Sidebar, header, footer, dialogs
│   │   └───dashboard/        # Widgets dashboard
│   ├───modules/              # 36 modules (1 dossier = 1 module)
│   ├───data/                 # Données statiques IA
│   │   ├───ai-writing-modes.ts   # 21 system prompts
│   │   ├───directeur-prompt.ts   # Prompt directeur de thèse
│   │   └───corpus-publication.ts # 6 fiches Gastel & Day
│   └───lib/
│       ├───ai/               # Clients IA multi-providers
│       │   ├───zai-client.ts     # Client principal (completion + stream)
│       │   ├───ai-provider.ts    # Détection backend, URL, headers
│       │   ├───ai-types.ts       # Types + 18 providers dynamiques
│       │   └───hardcoded-keys.ts # Clés via env vars
│       ├───stores/           # Zustand (app-store.ts)
│       ├───parsers/          # BibTeX, RIS, CSL-JSON
│       ├───data/             # phrasebank-data.ts, coherence-data.ts
│       ├───rag/              # RAG service (keyword-based)
│       └───db.ts             # Prisma client singleton
├───prisma/schema.prisma     # 15 modèles
├───db/custom.db             # SQLite
├───upload/                   # Ressources métier
│   └───extracted-text/       # 6 livres (3,2 Mo)
├───skills/                  # Skills Z.ai (40+)
├───mini-services/            # Services externes
└───AGENTS.md                # Instructions pour agent IA
```

---

## 5 — README.md

**Fichier** : `README.md` (220 lignes) à la racine du projet.

**Contenu principal** :
- Description : plateforme IA de rédaction de thèses
- Fonctionnalités : rédaction IA (36 modules, 21 modes), éditeur TipTap, 22 providers IA, recherche, méthodologie, organisation
- Stack : Next.js 16, TypeScript 5, Tailwind 4, shadcn/ui, Prisma/SQLite, Zustand, TanStack Query, z-ai-web-dev-sdk, TipTap, Vitest
- Installation : `git clone` → `bun install` → `bun run db:push` → `bun run dev`
- Tests : Vitest 1318 tests, **`bun run test:run`** (NE PAS `bun test`)
- Versionnage : v1.2.0 → v1.3.0 → v1.5.0 → v1.5.1

*(Texte intégral dans le fichier `README.md`)*

---

## 6 — DÉPENDANCES IA DU PACKAGE.json

### Dépendance IA principale (1 seul SDK)

```json
"z-ai-web-dev-sdk": "^0.0.18"
```

C'est le **seul SDK IA** dans le projet. Il fournit :
- `generateCompletion()` — complétion texte (LLM)
- `generateCompletionStream()` — streaming SSE
- Capacités VLM, TTS, ASR (disponibles mais non utilisées dans le code actuel)

**Utilisation** : Côté serveur uniquement (`src/lib/ai/zai-client.ts` et routes API).  
**Usage client** : Aucun — les composants React n'importent jamais ce SDK.

### Dépendance de rendu (support markdown)

```json
"react-markdown": "^10.1.0"
"react-syntax-highlighter": "^15.6.1"
```

Utilisées pour afficher les réponses de l'IA en markdown dans les modules (directeur-chat, ai-writing, deep-research, etc.).

### Aucun des SDK suivants n'est présent

- ❌ `openai` (SDK officiel OpenAI) — non présent
- ❌ `@ai-sdk/openai` (Vercel AI SDK) — non présent
- ❌ `@anthropic-ai/sdk` — non présent
- ❌ `langchain` — non présent
- ❌ `llamaindex` — non présent
- ❌ `chromadb`, `pinecone` — non présents (pas de vector DB)
- ❌ `cohere` (SDK) — non présent
- ❌ `tiktoken` — non présent
- ❌ `transformers.js` — non présent

**Conclusion** : L'app communique avec **tous les 22 providers IA** (OpenAI, Anthropic, Mistral, Groq, Gemini, etc.) via le SDK `z-ai-web-dev-sdk` côté serveur, en appelant les endpoints HTTP natifs de chaque provider directement (aucun SDK provider-specific). Le RAG est **keyword-based** (pas de vector DB).

---

## 7 — EXEMPLE DE CONVERSATION RÉELLE AVEC L'ASSISTANT

### 7.1 Conversation avec le « Directeur de thèse » (Jean-Marc Renaud)

**Module** : `src/modules/ai-tools/ai-tools-page.tsx` → onglet « Mon Directeur »  
**Route API** : `POST /api/directeur-chat`  
**Prompt système injecté** : `DIRECTEUR_SYSTEM_PROMPT` (src/data/directeur-prompt.ts)

**Exemple reconstitué d'après les tests et le code** :

```
👤 DOCTORANT : « Comment structurer mon chapitre de méthodologie ? »

System (non visible) :
  Tu es le Professeur Jean-Marc Renaud, un directeur de thèse
  expérimenté et bienveillant spécialisé en recherche académique
  francophone...

🤖 DIRECTEUR : 
  C'est une excellente question, et le fait que tu la poses
  maintenant montre une belle maturité dans ta démarche.

  Voici trois points à considérer pour structurer ce chapitre :

  1. Justifie ton choix méthodologique en lien avec ta
     problématique — le lecteur doit comprendre POURQUOI
     cette méthode et pas une autre.

  2. Décris ton terrain et ton échantillon avec suffisamment
     de détails pour permettre la reproductibilité.

  3. N'oublie pas d'anticiper les limites de ton approche —
     un relecteur les remarquera de toute façon, autant les
     nommer soi-même.

  Quel est le type de données que tu collectes (qualitatives,
  quantitatives, mixtes) ? Cela m'aiderait à te proposer
  une structure plus précise.
```

**Caractéristiques de cette conversation** :
- Le personnage est cohérent (professeur encourageant mais rigoureux)
- La réponse commence par valoriser, donne 2-3 points concrets, et termine par une question ouverte
- Le corpus (fiches Gastel & Day) est injecté si des mots-clés déclencheurs sont détectés
- Historique maintenu : les messages précédents sont renvoyés à chaque appel
- Température : 0.7 (créativité modérée)

### 7.2 Conversation avec le RAG (« Mon IA de thèse »)

**Module** : `src/modules/thesis-rag/thesis-rag-page.tsx`  
**Route API** : `POST /api/thesis-rag`  
**Prompt système** : RAG_SYSTEM_PROMPT (src/lib/rag/rag-service.ts)

```
👤 DOCTORANT : « Quelles sont les principales références que j'ai
  citées dans mon chapitre 2 ? »

System (non visible) :
  Tu es l'assistant de thèse de l'utilisateur. Réponds
  en te basant UNIQUEMENT sur les extraits fournis.
  Cite tes sources entre crochets.

[Contexte injecté : chunks des chapitres indexés contenant
 des références bibliographiques]

🤖 RAG :
  D'après les chapitres indexés, votre chapitre 2 cite
  les références suivantes :

  - [Chapitre 2 - Revue de littérature] Lippman (1987)
    sur la littératie médiatique
  - [Chapitre 2 - Revue de littérature] Potter (2004)
    sur la théorie de la cultivation
  - [Chapitre 2 - Revue de littérature] Livingstone (2008)
    sur les usages des jeunes

  ⚠️ Note : cette réponse est basée uniquement sur les
  chapitres indexés. Si certains passages n'ont pas été
  indexés, des références peuvent manquer.
```

### 7.3 Conversation avec l'écriture IA (mode « Relecture critique »)

**Module** : `src/modules/ai-writing/ai-writing-page.tsx`  
**Route API** : `POST /api/ai-writing/stream`  
**Mode** : `peer-review` (température 0.4)

```
👤 DOCTORANT : (colle son texte)
  « Cette étude montre que les résultats sont significatifs.
   Le tableau 1 montre que le groupe expérimental a obtenu
   un score de 28,8136 % tandis que le groupe contrôle
   a obtenu 24,5 %... »

🤖 IA (streaming, grille Review Commons) :
  ═══ SECTION 1 — PREUVE, REPRODUCTIBILITÉ, CLARTÉ ═══

  1.1 RÉSUMÉ
  Cette étude compare l'effet d'une intervention
  pédagogique sur deux groupes...

  1.2 COMMENTAIRES MAJEURS
  ⚠️ Fausse précision : « 28,8136 % » pour un échantillon
  dont la taille n'est pas précisée. Le niveau de
  précision décimale n'est pas justifié.
  ⚠️ Redondance texte/tableau : « Le tableau 1 montre que »
  répète mot pour mot ce que le tableau montre déjà.
  Préférer : « L'intervention a amélioré les scores
  (tableau 1). »

  1.3 COMMENTAIRES MINEURS
  ...

  ═══ RECOMMANDATION FINALE ═══
  RÉVISIONS MINEURES — des corrections limitées suffisent.
```

---

## SYNTHÈSE DE L'AUDIT

| Aspect | Statut | Détail |
|--------|--------|--------|
| **Prompts système** | ✅ Inventorié | 17 emplacements, 26 prompts distincts |
| **Corpus métier** | ✅ Inventorié | 6 fiches Gastel & Day + 1 phrasebank 847 lignes + 6 livres (3,2 Mo) |
| **AGENTS.md** | ✅ Existe | Créé 27/08/2026, 200 lignes |
| **Arborescence** | ✅ Disponible | `arborescence.txt` (2180 lignes) |
| **README.md** | ✅ Complet | 220 lignes, section installation/test/stack |
| **Dép. IA** | ✅ Minimal | 1 seul SDK (`z-ai-web-dev-sdk`), pas de vector DB |
| **Conversation** | ✅ Exemples | 3 exemples reconstitués (directeur, RAG, peer-review) |

### Points notables pour l'audit :

1. **Pas de vector DB** : Le RAG est keyword-based (recherche par mots-clés), pas de vectorisation/embeddings
2. **1 seul SDK IA** : Tout passe par `z-ai-web-dev-sdk` — aucun SDK provider-specific
3. **Prompts tous en français** : Cohérent avec le public cible francophone
4. **Pas de RAG sur les livres** : Les book-skills sont stockés en DB mais ne sont pas indexés dans le RAG (seuls les chapitres le sont)
5. **Corpus utilisé en mode critique** : Le directeur de thèse n'utilise le corpus que pour pointer des problèmes, jamais pour générer du contenu de substitution