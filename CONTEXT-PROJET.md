# CONTEXT-PROJET.md — Ma Thèse (ThesisFrame)

> **Mémoire de projet** — contexte, décisions, état d'avancement
> Version : **v1.9.0** (28 août 2026)

---

## 1. Identité

| Champ | Valeur |
|-------|--------|
| Nom | Ma Thèse (code name : ThesisFrame) |
| Type | Application web Next.js 16 (App Router) + Tauri v2 (desktop) |
| Langue | Français (UI, commentaires, erreurs) |
| Repo | https://github.com/freemind25/Ma-These |
| Licence | Projet privé — tous droits réservés |

---

## 2. Architecture connaissance — L'état de l'art (v1.9.0)

### 2.1 Le problème résolu

ThesisFrame possède **~50 API routes** et **21 modes d'écriture IA**. En v1.5, chaque route/specialisation contenait son propre savoir métier inline — contradictions, oublis et duplication entraînaient des comportements incohérents entre modes.

### 2.2 La solution : socle unique de vérité

```
src/lib/ai/
├── knowledge-core.ts      ← SOCLE : savoir métier digéré de 7 ouvrages
├── shared-prompts.ts      ← RÔLE/FORMAT réutilisables (pas du savoir)
├── prompt-builder.ts      ← Assembleur : SOCLE + spécialisation + calibration niveau
└── specializations/       ← 19 fichiers (rôle + tâche + format uniquement)
    ├── index.ts           ← Registry (mode id → prompt)
    ├── directeur.ts
    ├── scientific-writing.ts
    ├── peer-review.ts
    └── ...

feedback.md                ← Processus de feedback (divergence → correction noyau)
```

**Principe fondamental :** Le savoir métier vit dans `knowledge-core.ts`. Les spécialisations ne contiennent que : rôle, tâche, format de sortie. Le comportement est calibré par niveau doctorant via post-injection dans `prompt-builder.ts`.

### 2.3 Modules de connaissance (11)

| Module | Source distillée | Contenu |
|--------|-----------------|---------|
| `style` | White | Rédaction académique FR, paragraphes, pièges |
| `ethics` | Kumar + Salkind | Plagiat, consentement, conflits d'intérêts |
| `coherence` | White + existant | Terminologique, numérique, intro-discussion, référentielle, **argumentative** |
| `auto-edition` | Existant | 8 critères de correction auto |
| `peer-review` | Existant | Grille relecture par les pairs |
| `methodology` | Kumar + Salkind | Design, échantillonnage, biais, validité |
| `writing-process` | White | Processus rédactionnel, révision, transitions |
| `literature-review` | Ollhoff | Revue de littérature, synthèse, PRISMA |
| `data-analysis` | Rae & Wong | Analyse de données, interprétation |
| `grant-writing` | Smith & Works | Demande de financement |
| `publication` | Gastel & Day | Soumission, salami, ICMJE |

### 2.4 Calibration par niveau doctorant (v1.9.0)

Trois niveaux adaptent le **comportement** de l'IA sans modifier le savoir :

| Niveau | Ton | Granularité | Pédagogie |
|--------|-----|-------------|-----------|
| `DEBUTANT` | Encouragé, bienveillant | Détaillée, pas à pas | Explique les choix méthodologiques |
| `INTERMEDIAIRE` | Professionnel, direct | Équilibrée | Signale les points d'attention |
| `AVANCE` | Expert, concis | Macro-niveau | Hypothèse implicite que les bases sont maîtrisées |

**Design decision :** La calibration est en **post-injection** (après le system prompt). Le savoir (knowledge-core) et les spécialisations ne changent pas — seul le COMMENT appliquer le savoir change. Impact : +~110 tokens quand le niveau est fourni (optionnel, zéro breaking change).

Routes impactées : `ai-writing`, `ai-writing/stream`, `directeur-chat`.

### 2.5 Token budget

- **Full core** : ~3 900 tokens (≤ 4 500 max)
- **Directeur mode** : ~2 600 tokens (≤ 3 000 max)
- **Calibration niveau** : +~110 tokens (optionnel)
- Chaque spécialisation déclare ses modules nécessaires → injection sélective

### 2.6 Trois patterns de factorisation

| Pattern | Quand l'utiliser | Exemples |
|---------|-----------------|---------|
| **Option A** — Digestion totale | Le noyau couvre tout, la spécialisation est vide de savoir | `ai-writing`, `ai-writing/stream`, `directeur-chat` |
| **Option B** — Noyau + scoring | Le savoir vient du noyau, le format de sortie (grille, scores) reste dans la route | `verification-publication`, `coherence-check` |
| **Shared prompt** — Rôle/Format | Prompt de rôle réutilisable, mais pas du savoir métier → `shared-prompts.ts` | `verification-carto`, `types-analyse/seed` |

### 2.7 Règle de décision migration

> Un critère migre vers le noyau si un **AUTRE** mode (directeur, peer-review, defense) pourrait en avoir besoin.

Exemple : la cohérence argumentative (contradiction interne, sur-généralisation…) est utile au directeur ET au peer-review → migre vers le noyau. Les poids de scoring spécifiques au coherence-check restent dans la route.

---

## 3. RAG Sémantique

### 3.1 Architecture

- **Stockage** : embeddings JSON string par chunk (Prisma SQLite, modèle `DocumentChunk`)
- **Recherche** : hybride (65% sémantique / 35% mot-clé), pondération configurable via env
- **Providers** : OpenAI, Mistral, Google, Groq, OpenRouter
- **Limitation** : pas d'index vectoriel natif (parsing à chaque requête). OK pour 1 thèse (~400 chunks). Nécessite sqlite-vec pour monter en volume.

### 3.2 Test T3 — Résultat

- **Script** : `scripts/test-rag-semantic.ts`
- **Provider** : Mistral / mistral-embed
- **Query** : « Est-ce que ma partie empirique tient ses promesses ? » (aucun mot-clé commun avec le contenu)
- **Résultat** : 7/7 chunks embeddés, hybrid × 3 + semantic × 2 + keyword × 0. Top result = chapitre Discussion (score 1.0000)
- **Verdict** : **PASS** — la retrieval sémantique fonctionne avec des termes sans correspondance mot-à-mot

---

## 4. Bilan des tests de validation (6/6)

| # | Test | Cible | Verdict | Détail |
|---|------|--------|---------|--------|
| T1 | Unité d'analyse | directeur | ✅ DIGESTION | Critère étude de cas migré dans methodology module |
| T2 | Pipeline Ollhoff | literature-review | ✅ DIGESTION | Savoir Ollhoff entièrement couvert par le noyau |
| T3 | RAG sémantique | thesis-rag | ✅ PASS | Mistral/mistral-embed, hybrid+semantic, 0 keyword-only |
| T4 | Citation littérale | cohérence inter-modes | ✅ DIGESTION | Cas limite résolu dans knowledge-core coherence |
| T5 | Salami + ICMJE | publication | ✅ DIGESTION | Gastel & Day couvre salami slicing et ICMJE |
| T6 | Audit prompts | 9/9 routes | ✅ FACTORISÉ | coherence-check (Option B) + verification-carto (shared-prompts) |

---

## 5. Chantier connaissance — Historique des versions

| Version | Étape | Description |
|---------|-------|-------------|
| **v1.9.0** | Niveaux doctorant | `getLevelCalibration()` dans prompt-builder.ts. Post-injection dans 3 routes (ai-writing, stream, directeur-chat). Token budget : +~110 tokens par niveau. Knowledge-core inchangé. |
| **v1.8.4** | Processus feedback | `feedback.md` + règle #9 AGENTS.md. Processus Capture → Triage → Correction → Validation → Documentation. |
| **v1.8.3** | Clôture | T3 RAG validé. coherence-check factorisé (Option B). verification-carto dédupliqué (shared-prompts.ts). Cohérence argumentative ajoutée au noyau. **Bilan 6/6**. 1333 tests pass. |
| **v1.8.1** | Phase 5 digestion | T1 unité d'analyse + T4 citation littérale corrigés. Full core ~3806 tokens. |
| **v1.8.0** | Knowledge-core v2.1 | Module publication (Gastel & Day). 11 modules. Routes vérification déléguées. |
| **v1.7.0** | Knowledge-core v2 | 6 ouvrages distillés, 10 modules, mapping optimisé. |
| **v1.6.0** | Architecture naissante | knowledge-core + prompt-builder + 19 spécialisations créées. |

---

## 6. Convention anti-duplication (règles #8 et #9 de AGENTS.md)

**Règle #8 — Anti-duplication :**

1. TOUT savoir métier → `knowledge-core.ts` — **JAMAIS** dans un prompt de spécialisation
2. Un prompt de spécialisation = **UNIQUEMENT** rôle, tâche, format de sortie
3. Avant de créer une règle, vérifier si elle existe dans le noyau
4. Toute modification de savoir = dans `knowledge-core.ts` **uniquement**
5. `ai-writing-modes.ts` : plus de `systemPrompt` (métadonnées uniquement)
6. `directeur-prompt.ts` : déprécié → `specializations/directeur.ts`
7. Les routes utilisent `SPECIALIZATION_PROMPTS[mode.id]`
8. **Leçon digestion** : divergence inter-modes = trou dans le knowledge-core, pas bug de prompt

**Règle #9 — Processus de feedback :**

9. Toute divergence suit le processus `feedback.md` : Capture → Triage (trou du noyau ? duplication ? faux positif ?) → Correction → Validation → Documentation

---

## 7. Points d'attention pour contributeurs

- **Tests** : `bun run test:run` (Vitest). Jamais `bun test` (runner natif incompatible avec `vi.mock`)
- **Lint** : `bun run lint` — 0 erreurs acceptées
- **SDK IA** : z-ai-web-dev-sdk **côté serveur uniquement** (API routes), jamais côté client
- **Messages** : tous en français
- **Base de données** : Prisma + SQLite, schéma dans `prisma/schema.prisma`
- **Worklog** : `worklog.md` — historique détaillé de chaque tâche (précieux pour comprendre les décisions)
- **Feedback** : `feedback.md` — processus formel pour remonter les divergences dans le knowledge-core

---

## 8. Prochaines étapes

- **sqlite-vec** : migration quand le volume de chunks dépasse les capacités de parsing JSON
- **Calibration front-end** : exposer le sélecteur de niveau doctorant dans l'UI (actuellement API-only)
