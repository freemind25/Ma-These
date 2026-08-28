# Architecture de la Gestion des Connaissances

> ThesisFrame v1.8.3 — Guide pour contributeurs (humains ou IA)
> Dernière mise à jour : 28 août 2026

---

## 1. Vue d'ensemble

ThesisFrame est un outil de rédaction de thèse avec **21 modes d'écriture IA** alimentés par un **socle unique de connaissances** distillé de 7 ouvrages de référence en méthodologie et rédaction académique.

Le problème que cette architecture résout : en l'absence de centralisation, chaque mode IA développait son propre « savoir » inline, entraînant contradictions, oublis et comportements incohérents.

---

## 2. Arborescence des fichiers IA

```
src/lib/ai/
├── knowledge-core.ts         ← ★ SOCLE UNIQUE DE VÉRITÉ (savoir métier)
├── shared-prompts.ts         ← Prompts RÔLE/FORMAT réutilisables
├── prompt-builder.ts         ← Assembleur : injection sélective du noyau
├── ai-provider.ts            ← Détection provider, URL, headers
├── ai-types.ts               ← Types + 18 providers dynamiques
├── zai-client.ts             ← Client IA (completion + stream + fallback)
├── hardcoded-keys.ts         ← Clés via env vars
├── prompt-builder.ts         ← Construit le system prompt final
├── knowledge-core/
│   └── modules/              ← 7 fichiers .md (sources brutes distillées)
│       ├── grant-writing.md
│       ├── methodology-design.md
│       ├── publication.md
│       ├── literature-review.md
│       ├── writing-process.md
│       ├── methodology-basics.md
│       └── data-analysis.md
└── specializations/          ← 19 fichiers (1 par mode d'écriture)
    ├── index.ts              ← Registry : SPECIALIZATION_PROMPTS[modeId]
    ├── directeur.ts          ← Mode « directeur de thèse »
    ├── scientific-writing.ts ← Écriture scientifique
    ├── peer-review.ts        ← Relecture par les pairs
    ├── literature-review.ts  ← Revue de littérature
    ├── grammaire.ts          ← Correction grammaticale
    ├── defense.ts            ← Préparation soutenance
    └── ... (13 autres)

src/data/
├── ai-writing-modes.ts       ← Métadonnées modes (label, icon, temp) — PAS de systemPrompt
└── directeur-prompt.ts       ← DÉPRÉCIÉ → utiliser specializations/directeur.ts

src/app/api/
├── ai-writing/route.ts       ← Utilise SPECIALIZATION_PROMPTS + prompt-builder
├── ai-writing/stream/route.ts← Streaming SSE, même pattern
├── directeur-chat/route.ts   ← Mode directeur via SPECIALIZATION_PROMPTS
├── coherence-check/route.ts  ← Option B (noyau + grille scoring locale)
├── verification-publication/route.ts ← Option B
├── verification-carto/route.ts ← shared-prompts.ts (SOCRATIC_QUESTIONER_PROMPT)
├── types-analyse/seed/route.ts ← shared-prompts.ts
└── ...
```

---

## 3. Les trois couches de prompts

### Couche 1 — Savoir métier (`knowledge-core.ts`)

**C'est la seule source de vérité.** Contient les règles, critères et grilles méthodologiques digérées de 7 ouvrages.

- 11 modules de connaissance sélectionnables
- ~3 900 tokens pour le noyau complet
- Injection sélective : chaque spécialisation déclare les modules dont elle a besoin

**Règle absolue :** Si un contenu est du savoir métier (règle, critère, grille, norme), il va ici. Partout ailleurs, c'est une duplication.

### Couche 2 — Rôle et format (`specializations/` + `shared-prompts.ts`)

Les spécialisations définissent :
- **Le rôle** de l'IA pour ce mode (ex : « Tu es un directeur de thèse bienveillant mais exigeant »)
- **La tâche** spécifique (ex : « Révise ce paragraphe en te concentrant sur… »)
- **Le format de sortie** attendu (ex : JSON structuré, liste de questions, etc.)

`shared-prompts.ts` contient les prompts de rôle réutilisables par plusieurs routes (pas du savoir métier).

### Couche 3 — Assemblage (`prompt-builder.ts`)

Le prompt-builder assemble le system prompt final :
```
[Savoir du noyau (modules sélectionnés)] + [Prompt de spécialisation (rôle + tâche + format)]
```

---

## 4. Les 11 modules de connaissance

| Module | Source(s) | Tokens | Injecté par |
|--------|-----------|--------|-------------|
| `style` | White | ~580 | Tous modes rédactionnels |
| `ethics` | Kumar, Salkind | ~280 | directeur, paraphrase, academic-reformulation |
| `coherence` | White, existant | ~520 | directeur, peer-review, revision-plan, defense, coherence-check |
| `auto-edition` | Existant | ~180 | auto-edition-8c |
| `peer-review` | Existant | ~380 | peer-review, revision-plan |
| `methodology` | Kumar, Salkind | ~640 | directeur, hypothesis, methodology, revue-litterature |
| `writing-process` | White | ~310 | directeur, scientific-writing, theory, revision-plan |
| `literature-review` | Ollhoff | ~400 | literature-review, revue-litterature |
| `data-analysis` | Rae & Wong | ~310 | (disponible, pas encore injecté) |
| `grant-writing` | Smith & Works | ~340 | (disponible, pas encore injecté) |
| `publication` | Gastel & Day | ~380 | directeur, abstract, verification-publication |

### Détail du module `coherence` (v1.8.3 — enrichi)

5 sous-catégories :
1. **Terminologique** — uniformité des termes, glissement sémantique
2. **Numérique** — cohérence des données chiffrées
3. **Introduction-Discussion** — écho entre ouverture et conclusion
4. **Référentielle** — complétude des citations, pas de citation fantôme
5. **Argumentative** *(ajouté v1.8.3)* — contradiction interne, affirmation non étayée, confusion corrélation/causalité, sur-généralisation

---

## 5. Patterns de factorisation

### Pattern A — Digestion totale
Le noyau couvre 100% du savoir. La spécialisation ne contient aucun savoir métier.

**Exemples :** `ai-writing`, `ai-writing/stream`, `directeur-chat`

```typescript
// Route : rien de spécifique, tout vient du noyau
const systemPrompt = buildSystemPrompt(modeId, context)
```

### Pattern B — Noyau + scoring local
Le savoir vient du noyau. Le format de sortie (grille de scoring, pondérations) reste dans la route car il est spécifique à cette route.

**Exemples :** `verification-publication`, `coherence-check`

```typescript
// Route : injecte le savoir du noyau, puis ajoute sa grille
const knowledgeBase = getKnowledgeCore(["publication"])
const systemPrompt = `Savoir de référence (knowledge-core) :
──
${knowledgeBase}
──
Grille de contrôle structurée (dérivée des principes du noyau) :
${PUBLICATION_CHECKS}`
```

### Pattern C — Shared prompt (rôle/format)
Un prompt de rôle est partagé entre plusieurs routes, mais ce n'est pas du savoir métier.

**Exemples :** `verification-carto`, `types-analyse/seed`

```typescript
// shared-prompts.ts — RÔLE/FORMAT uniquement
export const SOCRATIC_QUESTIONER_PROMPT = `Tu poses UNIQUEMENT des questions ouvertes...`

// Route : importe le shared prompt
import { SOCRATIC_QUESTIONER_PROMPT } from "@/lib/ai/shared-prompts"
```

---

## 6. Règle de décision : qu'est-ce qui va dans le noyau ?

> **Un critère migre vers le noyau si un AUTRE mode (directeur, peer-review, defense) pourrait en avoir besoin.**

| Type de contenu | Destination | Raison |
|-----------------|-------------|--------|
| Critère de qualité réutilisable | `knowledge-core.ts` | Plusieurs modes en bénéficient |
| Grille de scoring spécifique | Route locale | Format de sortie propre à cette route |
| Rôle / persona réutilisable | `shared-prompts.ts` | Pas du savoir métier |
| Tâche spécifique | `specializations/` | Contexte d'utilisation propre au mode |

---

## 7. Processus de digestion (quand ajouter du savoir)

1. **Identifier** un cas limite ou une divergence entre modes
2. **Vérifier** si le noyau couvre déjà ce cas (sinon → trou)
3. **Ajouter** la règle dans le module approprié de `knowledge-core.ts`
4. **Retirer** toute duplication éventuelle dans les spécialisations/routes
5. **Tester** : `bun run test:run` + `bun run lint`
6. **Mettre à jour** le token budget dans AGENTS.md

---

## 8. RAG Sémantique

### Architecture
- **Embeddings** : stockés en JSON string par chunk (modèle `DocumentChunk` Prisma)
- **Recherche** : hybride — 65% sémantique / 35% mot-clé (configurable via `RAG_KEYWORD_WEIGHT` / `RAG_SEMANTIC_WEIGHT`)
- **Filtrage** : par `thesisId` + `embedding IS NOT NULL`
- **Providers supportés** : OpenAI, Mistral, Google, Groq, OpenRouter

### Validation (T3)
- Provider testé : Mistral / mistral-embed
- Query sans mot-clé commun → retrieval sémantique fonctionne
- Score types : hybrid × 3, semantic × 2, keyword × 0
- Script : `scripts/test-rag-semantic.ts`

### Limitation connue
Pas d'index vectoriel natif (parsing JSON à chaque requête). Adapté pour ~400 chunks (1 thèse). Pour monter en volume, migrer vers sqlite-vec.

---

## 9. Audit des routes IA — Résultat final (9/9)

| Route | Fichier | Pattern | Statut |
|-------|---------|---------|--------|
| deep-research | api/deep-research/route.ts | — (standalone) | ✅ CLEAN |
| paper2code | api/paper2code/generate/route.ts | — (standalone) | ✅ CLEAN |
| text-prediction | api/text-prediction/route.ts | — (standalone) | ✅ CLEAN |
| thesis-rag | lib/rag/rag-service.ts | — (standalone) | ✅ CLEAN |
| coherence-check | api/coherence-check/route.ts | **Option B** | ✅ FACTORISÉ |
| verification-carto | api/verification-carto/route.ts | **Shared prompt** | ✅ FACTORISÉ |
| verification-publication | api/verification-publication/route.ts | **Option B** | ✅ FACTORISÉ |
| ai-writing + stream | api/ai-writing/route.ts | **Digestion A** | ✅ FACTORISÉ |
| directeur-chat | api/directeur-chat/route.ts | **Digestion A** | ✅ FACTORISÉ |

---

## 10. Cas d'étude : la séquence diagnostic → correction → convergence

Cette séquence (worklog Tasks 5→6→7→8) est un exemple rare et documenté de convergence d'un système de prompts multi-modes :

1. **Diagnostic (T6)** : audit systématique des 9 routes IA → identification de 2 doublons résiduels
2. **Correction noyau (T7)** : coherence-check (Option B) + verification-carto (shared-prompts) → 9/9 factorisés
3. **Convergence (T4)** : découverte qu'un cas limite (citation littérale) causait des réponses divergentes entre modes → correction dans le noyau, tous les modes convergent
4. **Validation RAG (T3)** : test end-to-end avec embeddings réels (Mistral) → retrieval sémantique confirmée

**Leçon :** toute divergence inter-modes est un signal d'un trou dans le knowledge-core, pas d'un bug de prompt.

---

## 11. Checklist pour tout contributeur

- [ ] J'ai lu `AGENTS.md` (règles de développement)
- [ ] J'ai lu `CONTEXT-PROJET.md` (mémoire du projet)
- [ ] Je comprends la différence SAVOIR vs RÔLE/FORMAT
- [ ] Mon savoir métier va dans `knowledge-core.ts` (si réutilisable)
- [ ] Mon rôle/format va dans `specializations/` ou `shared-prompts.ts`
- [ ] Je n'ai créé aucune duplication avec le noyau
- [ ] `bun run lint` → 0 erreurs
- [ ] `bun run test:run` → tous les tests passent
- [ ] J'ai mis à jour le worklog
