# CONTEXT-PROJET.md — Ma Thèse (ThesisFrame)

> **Mémoire de projet** — contexte, décisions, état d'avancement
> Version : **v1.9.5** (post-audit Phase 3)

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

ThesisFrame possède **~50 API routes** et **27 modes d'écriture IA**. En v1.5, chaque route/specialisation contenait son propre savoir métier inline — contradictions, oublis et duplication entraînaient des comportements incohérents entre modes.

### 2.2 La solution : socle unique de vérité

```
src/lib/ai/
├── knowledge-core.ts      ← SOCLE : savoir métier digéré de 7 ouvrages
├── shared-prompts.ts      ← RÔLE/FORMAT réutilisables (pas du savoir)
├── prompt-builder.ts      ← Assembleur : SOCLE + spécialisation + calibration niveau
└── specializations/       ← 28 fichiers (rôle + tâche + format uniquement)
    ├── index.ts           ← Registry (mode id → prompt)
    ├── directeur.ts
    ├── scientific-writing.ts
    ├── peer-review.ts
    └── ...

feedback.md                ← Processus de feedback (divergence → correction noyau)
```

**Principe fondamental :** Le savoir métier vit dans `knowledge-core.ts`. Les spécialisations ne contiennent que : rôle, tâche, format de sortie. Le comportement est calibré par niveau doctorant via post-injection dans `prompt-builder.ts`.

### 2.3 Modules de connaissance (13)

| Module | Source distillée | Contenu |
|--------|-----------------|---------|
| `style` | White | Rédaction académique FR, paragraphes, pièges |
| `ethics` | Kumar + Salkind | Plagiat, consentement, conflits d'intérêts |
| `coherence` | White + existant | Terminologique, numérique, intro-discussion, référentielle, **argumentative**, **structurelle** (v1.9.2) |
| `auto-edition` | Existant | 8 critères de correction auto |
| `peer-review` | Existant | Grille relecture par les pairs |
| `methodology` | Kumar + Salkind | Design, échantillonnage, biais, validité |
| `writing-process` | White | Processus rédactionnel, révision, transitions |
| `literature-review` | Ollhoff | Revue de littérature, synthèse, PRISMA |
| `data-analysis` | Rae & Wong | Analyse de données, interprétation |
| `grant-writing` | Smith & Works | Demande de financement |
| `publication` | Gastel & Day | Soumission, salami, ICMJE |
| `visualization` | Sułkowski | Visualisation de données académiques |
| `presentation` | Sułkowski | Présentations scientifiques |

### 2.4 Calibration par niveau doctorant (v1.9.0)

Trois niveaux adaptent le **comportement** de l'IA sans modifier le savoir :

| Niveau | Ton | Granularité | Pédagogie |
|--------|-----|-------------|-----------|
| `DEBUTANT` | Encouragé, bienveillant | Détaillée, pas à pas | Explique les choix méthodologiques |
| `INTERMEDIAIRE` | Professionnel, direct | Équilibrée | Signale les points d'attention |
| `AVANCE` | Expert, concis | Macro-niveau | Hypothèse implicite que les bases sont maîtrisées |

**Design decision :** La calibration est en **post-injection** (après le system prompt). Le savoir (knowledge-core) et les spécialisations ne changent pas — seul le COMMENT appliquer le savoir change. Impact : +~110 tokens quand le niveau est fourni (optionnel, zéro breaking change).

Routes impactées : `ai-writing`, `ai-writing/stream`, `directeur-chat`.

### 2.5 Token budget (post-compactage, calibré APRÈS optimisation)

- **Full core** : ~20 123 tokens (mesuré, 60 370 chars ÷ 3)
- **Budget calibré** : 22 000 tokens (mesure + 10 %)
- **Mode le plus lourd** (directeur) : ~15 339 tokens (mesuré)
- **Budget par mode** : 17 000 tokens (mesure + 10 %)
- **Max module unique** : 5 000 tokens (methodology ~3 665)
- **Capteur permanent** : `src/lib/ai/knowledge-core.budget.test.ts` — 7 assertions
- **Calibration niveau** : +~110 tokens (optionnel)
- Chaque spécialisation déclare ses modules nécessaires → injection sélective

> **Note** : Ancien budget (3 900 full / 3 000 par mode) était obsolète depuis 8+ versions d'ingestion de savoir. Nouveau budget calibré après compactage ciblé (methodology −36 %, 3 modes dé-injectés). Cible posée sur base optimisée (loi de Parkinson évitée).

### 2.6 Patterns architecturaux (v1.9.3)

Trois patterns inspirés de sources externes, intégrés comme **architecture**, pas comme contenu :

| # | Pattern | Source | Localisation | Principe |
|---|---------|--------|-------------|----------|
| 1 | **Reasoning-then-Output** | prompts.chat (CC0) | `specializations/directeur.ts` | Avant le feedback final, l'IA rend visible son raisonnement. Sortie : `## Analyse` (3-5 lignes, hors quota) → `## Retour` (méthode 5 étapes). **Déployé en v1.9.5 (Phase 3).** |
| 2 | **Counter-Audit 2 passes** | prompts.chat (CC0) | `specializations/coherence.ts` + `coherence-check/route.ts` | Passe 2 = auditeur adversarial, ne peut que CONFIRMER ou RÉTROGRADER vers AMBIGU. |
| 3 | **Retriever OpenAlex + curation déterministe** | gpt-researcher (Apache 2.0) | `lib/research/openalex.ts` + `lib/research/curation.ts` + `deep-research/route.ts` | OpenAlex (250M+ travaux, gratuit, sans clé) comme retriever académique. Curation pré-rapport 100% déterministe (pas d'appel LLM) : DOI, venue, type, citations/âge, OA, récence. |

**Note licence** : prompts.chat = CC0 (domaine public, pas d'attribution). gpt-researcher = Apache 2.0 (attribution obligatoire si copie de code). Aucun code copié dans les 3 cas — uniquement des patterns d'architecture.

**Phase d'observation (en cours)** : logs `[coherence-audit] rate=...%` → <10% = clore ; >30% = pipeline 4 appels ; entre les deux = version C définitive.

**Discontinuité de score** : l'exclusion des AMBIGU du scoring (v1.9.2) modifie les scores affichés vs anciennes sessions.

#### Patterns de gpt-researcher NOTÉS et DIFFÉRÉS

| Pattern | Raison du report | Critère de réactivation |
|---------|-----------------|------------------------|
| Récursion breadth×depth | Coût ×10, aucun retour utilisateur prouvant l'insuffisance du mono-passe | Si retours utilisateurs montrent deep-research insuffisant |
| Compression contexte 25K mots | Couvert différemment par injection sélective du knowledge-core | Si le contexte dépasse la capacité d'un seul appel |
| MCP (Model Context Protocol) | Aucun usage concret identifié dans Ma Thèse | Si un besoin d'outils externes dynamiques émerge |
| Tiers LLM (quick/large/critical) | À réévaluer avec les premiers utilisateurs réels | Si les coûts LLM deviennent un problème mesurable |

### 2.7 Trois patterns de factorisation

| Pattern | Quand l'utiliser | Exemples |
|---------|-----------------|---------|
| **Option A** — Digestion totale | Le noyau couvre tout, la spécialisation est vide de savoir | `ai-writing`, `ai-writing/stream`, `directeur-chat` |
| **Option B** — Noyau + scoring | Le savoir vient du noyau, le format de sortie (grille, scores) reste dans la route | `verification-publication`, `coherence-check` |
| **Shared prompt** — Rôle/Format | Prompt de rôle réutilisable, mais pas du savoir métier → `shared-prompts.ts` | `verification-carto`, `types-analyse/seed` |

### 2.8 Règle de décision migration

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
| **v1.9.4** | Éthique IA | 8 règles ajoutées au module ethics (knowledge-core) : droit d'auteur IA, disclosure, taxonomie hallucinations, interdiction copier-coller, ICMJE, reproductibilité. Sources : David (AI for Nonfiction Authors) + Green (Claude AI Unleashed). 7 ressources examinées (3.4M+ chars), 6 SKIP complètes (niveau sous-gradué ou hors-sujet). |
| **v1.9.3** | Retriever académique | Wrapper OpenAlex (`lib/research/openalex.ts`) — 250M+ travaux, gratuit, sans clé. Curation pré-rapport déterministe (`lib/research/curation.ts`) — 6 critères pondérés (DOI, venue, type, citations/âge, OA, récence), 0 appel LLM. Intégration deep-research avec `sourceMode: academic|web`. 4 patterns gpt-researcher notés et différés (récursion, compression, MCP, tiers LLM). Note licence Apache 2.0 vs CC0 dans §2.6. |
| **v1.9.2** | Patterns architecturaux | 2 patterns inspirés de prompts.chat (CC0, intégrés comme architecture pas comme contenu) : (1) Reasoning-then-Output sur directeur.ts (format Analyse/Retour pour révision de texte), (2) Counter-Audit 2 passes sur coherence-check (auditeur adversarial ne peut que rétrograder). Spécialisation coherence.ts créée (normalisation). Logging structuré pour mesure préalable. |
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

## 8. Phase d'observation — v1.9.2

Le contre-audit (Pattern 2 version C) est en production avec logging structuré. La décision de l'étendre ou de le clore dépend de la donnée empirique :

| Seuil | Action |
|-------|--------|
| `rate < 10%` | Clore le chantier patterns — version C est la bonne taille |
| `10% ≤ rate ≤ 30%` | Version C définitive — documenter le taux dans le worklog |
| `rate > 30%` | Justifier le pipeline 4 appels pour les modes lourds |

Signal diagnostique secondaire : rétrogradations systématiques sur une même catégorie → biais de l'évaluateur passe 1 → candidat à une précision du module coherence (protocole #11).

Re-test T1 à prévoir : vérifier que la section Analyse du directeur cite le critère « unité d'analyse » (validation du Pattern 1 comme sonde anti-régression).

## 9. Prochaines étapes

- **E2E digestion OpenAlex ⏳** : le test de bout en bout (question doctorale → sources peer-reviewed dans l'UI) n'a pu être exécuté dans le sandbox (429 IP partagée). Clôture définitive de la Task 19 au premier usage 🎓 Académique en IP propre. Checklist : □ sources journal-article avec DOI □ métadonnées cohérentes □ aucune source < 0.35 □ comparer avec mode Web.
- **Données [coherence-audit]** : collecter les premiers taux de rétrogradation pour décider du seuil
- **sqlite-vec** : migration quand le volume de chunks dépasse les capacités de parsing JSON
- **Calibration front-end** : exposer le sélecteur de niveau doctorant dans l'UI (actuellement API-only)
- **Score versioning** : ajouter `scoreVersion: 2` si l'UI expose un historique de scores coherence

## 10. Backlog non-urgent (micro-suggestions)

| # | Suggestion | Priorité | Contexte |
|---|-----------|----------|----------|
| B1 | ✅ **Gestion 429 côté UI** —middleware.ts renvoie 429 gracieuse avec Retry-After | basse | **CORRIGÉ en Phase 1** |
| B2 | ✅ **Retry avec backoff** dans le wrapper OpenAlex — fetchWithRetry() : 15s timeout, 2 retries, backoff exponentiel | basse | **CORRIGÉ en Phase 3** |
| B3 | **Backlog manquant** — table §10 tronquée après B2 dans l'audit initial | basse | Complété en Phase 3 |
| B4 | **Rate limiting persistant** si déploiement multi-instance (Upstash Redis ou table DB) | basse | Échéance : v1.11.0 |
| B5 | **Supprimer le fallback `_aiConfig` body** dans `resolveAiConfig` | basse | Échéance : v1.10.0 |
| B6 | **Lint : stabiliser les warnings** (211 actuels, règle « 0 warning nouveau par livraison ») | basse | 0 nouveau en Phase 3, 211 inchangés |
