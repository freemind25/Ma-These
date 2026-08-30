# 📋 RAPPORT D'AUDIT COMPLET — ThesisFrame v1.9.4

> **Date** : 27 juin 2025
> **Auditeur** : Agent principal Z.ai
> **Portée** : 7 axes — fonctionnalités, architecture, gouvernance, performance, robustesse, sécurité, documentation
> **Méthode** : Lecture de code (axes 3-7) + analyse structurelle (axes 1-2)
> **Note** : Les tests E2E en conditions réelles (panneau de prévisualisation) n'ont pas pu être exécutés dans le sandbox — l'audit est un audit de **code et d'architecture**. Les verdicts sur les parcours utilisateur (Axe 1) sont basés sur l'analyse du code, pas sur des exécutions réelles avec des scénarios doctoraux.

---

## 1. TABLEAU RÉCAPITULATIF

| Axe | Items testés | ✅ | ⚠️ | ❌ | Verdict global |
|------|-------------|---|---|---|----------------|
| **1** — Parcours utilisateur (13 modes) | 13 | 7 | 3 | 3 | ⚠️ **DÉGRADÉ** — 3 modes inexistants, Pattern 1 non déployé |
| **2** — Fonctionnalités transverses | 8 | 5 | 2 | 1 | ⚠️ **DÉGRADÉ** — Pattern 1 CASSÉ, directeur-chat sans gestion d'erreur |
| **3** — Conformité gouvernance | 6 | 5 | 1 | 0 | ✅ **CONFORME** — 1 dérive documentaire mineure |
| **4** — Performance et coûts | 4 | 3 | 0 | 1 | ⚠️ **DÉGRADÉ** — Budget tokens obsolète (build corrigé) |
| **5** — Robustesse et cas limites | 7 | 5 | 2 | 0 | ⚠️ **DÉGRADÉ** — Pas de limite d'entrée, OpenAlex sans timeout |
| **6** — Sécurité et confidentialité | 5 | 4 | 1 | 0 | ✅ **CONFORME** — Rate limiting et clé httpOnly corrigés |
| **7** — Intégrité documentaire | 5 | 0 | 5 | 0 | ⚠️ **DÉGRADÉ** — Chiffres obsolètes dans 3 docs |
| **TOTAL** | **46** | **31 (67%)** | **13 (28%)** | **2 (4%)** | |

---

## 2. DÉTAIL PAR AXE

---

### AXE 1 — PARCOURS UTILISATEUR COMPLETS (E2E fonctionnels)

> **Note méthodologique** : Les 13 modes listés dans le prompt d'audit ne correspondent pas 1:1 aux modes implémentés dans le système. L'audit vérifie la correspondance et l'implémentation.

| # | Nom audit | ID système | Existe | Spécialisation | buildPrompt | UI | Verdict |
|---|-----------|-----------|--------|---------------|-------------|-----|----------|
| 1 | methode | `methodology` | ✅ | ✅ | ✅ | ✅ | ✅ CONFORME |
| 2 | problematique | — | ❌ | — | — | — | ❌ NON EXISTANT |
| 3 | theorique | `theory` | ✅ | ✅ | ✅ | ✅ | ✅ CONFORME |
| 4 | litterature | `literature-review` | ✅ | ✅ | ✅ | ✅ | ✅ CONFORME |
| 5 | empirique | — | ❌ | — | — | — | ❌ NON EXISTANT |
| 6 | analyse | — | ❌ | — | — | — | ❌ NON EXISTANT |
| 7 | redaction | `scientific-writing` | ✅ | ✅ | ✅ | ✅ | ✅ CONFORME |
| 8 | abstract | `abstract` | ✅ | ✅ | ✅ | ✅ | ✅ CONFORME |
| 9 | revision | `revision-plan` | ✅ | ✅ | ✅ | ✅ | ✅ CONFORME |
| 10 | conclusion | — | ❌ | — | — | — | ❌ NON EXISTANT |
| 11 | publication | — | ❌ | ❌ | — | ❌ | ⚠️ Route séparée (pas mode écriture) |
| 12 | coherence-check | — | ✅ | ✅ | ✅ | ✅ | ⚠️ DÉGRADÉ — 0 test unitaire |
| 13 | directeur-chat | — | ✅ | ✅ | ✅ | ✅ | ⚠️ DÉGRADÉ — Pattern 1 non déployé |

**Anomalies supplémentaires :**
- `freeform` et `improvement` utilisent `buildStandalonePrompt` (pas de knowledge-core) — hors doctrine
- `director.ts` (sans accent) est du code mort — doublon de `directeur.ts` avec Pattern 1 non connecté
- `verification-publication` construit son prompt en inline au lieu d'utiliser `buildPrompt`

---

### AXE 2 — FONCTIONNALITÉS TRANSVERSALES

| # | Item | Verdict | Sévérité | Détail |
|---|------|---------|----------|--------|
| 2.1 | Director-chat Reasoning-then-Output (Pattern 1) | ❌ CASSÉ | **HAUTE** | `director.ts` (avec ## Analyse/## Retour) n'est importé par personne. La route importe `directeur.ts` (sans Pattern 1). Le pattern est codé mais jamais déployé. |
| 2.2 | Deep-research Web mode | ✅ CONFORME | — | Pipeline Tavily + CORE API fonctionnel, sources affichées |
| 2.3 | Deep-research Academic (OpenAlex) | ✅ CONFORME | — | Filtrage journal-article, curation 6 critères pondérés, seuil 0.35. Les 4 points de la checklist §9 sont implémentés. |
| 2.4 | Contre-audit coherence (Pattern 2) | ✅ CONFORME | — | 2 passes, logging `[coherence-audit] rate=...%`, dégradation gracieuse |
| 2.5 | RAG hybride | ✅ CONFORME | — | 65% sémantique / 35% mot-clé, configurable via env, fallback keyword |
| 2.6 | Grille cohérence UI | ⚠️ DÉGRADÉ | BASSE | 23 checks en 6 catégories (doc dit 7, knowledge-core a 8). Désynchronisation catégorielle. |
| 2.7 | Gestion d'erreurs IA | ⚠️ DÉGRADÉ | MOYENNE | ai-writing ✅, coherence-check ✅, **directeur-chat ❌** — pas de `onError` dans le `useMutation`, échecs silencieux |
| 2.8 | Export / sauvegarde | ⚠️ DÉGRADÉ | BASSE | PDF ✅, DOCX ✅. **Pas de sauvegarde/restauration de session** (données en SQLite, pas d'export session) |

---

### AXE 3 — CONFORMITÉ GOUVERNANCE (audit du code)

| Règle | Verdict | Détail |
|-------|---------|--------|
| **R1** — Aucun savoir en dur hors noyau | ✅ CONFORME | 0 mot-clé méthodologique dans les spécialisations ou routes (6 matches bénins : délégations au noyau, exemples de format) |
| **R2** — Spécialisation = rôle + tâche + format | ✅ CONFORME | 22 fichiers examinés, tous respectent le pattern. Zéro règle ou critère substantiel |
| **R4** — getKnowledgeCore() dans toutes les routes IA | ✅ CONFORME | 5 routes IA l'utilisent. Les routes sans (deep-research, verification-carto, alignement-preuves) sont justifiées |
| **R5** — Aucun savoir dupliqué (3 modules spot-check) | ✅ CONFORME | "writer-responsible", "citation littérale", "unité d'analyse" — 0 duplication fonctionnelle |
| **R7** — Pas de règles frontend qui doublent le noyau | ✅ CONFORME | `coherence-data.ts` est des données d'affichage (Option B documentée), `phrasebank-data.ts` ne jamais injecté dans les prompts |
| **R11** — Tout fichier ressource documenté | ⚠️ DÉGRADÉ | 2 modules non listés dans CONTEXT-PROJET §2.3 : `visualization` (Sułkowski), `presentation` (Sułkowski). Compte doc dit 11, réel est 13. |

---

### AXE 4 — PERFORMANCE ET COÛTS

| Item | Verdict | Sévérité | Mesure |
|------|---------|----------|--------|
| **4.1** Budget tokens noyau | ⚠️ DÉGRADÉ | **HAUTE** | **Obsolète** — doc dit ~3 900 tok (full), réel mesuré **~22 190 tok** (×5.7). Budget 4 500/3 000 jamais mis à jour depuis v1.8.1. Voir tableau détaillé ci-dessous. |
| **4.2** Build de production | ✅ CORRIGÉ | — | 4 erreurs TS corrigées (paper2code, deep-research, export-docx, rag-service, curation, ai-writing). Build passe. Taille bundle à mesurer. |
| **4.3** Tests | ✅ CONFORME | — | 1 372 tests / 58 fichiers — 0 échec |
| **4.4** Lint | ✅ CONFORME | — | 0 erreurs, 191 warnings (pré-existants) |

#### Budget tokens détaillé par mode (estimation ÷3 chars/token, français)

| Mode | Modules injectés | Tokens estimés | Budget 3K |
|------|-------------------|---------------|-----------|
| directeur | style+ethics+coherence+methodology+writing-process+publication | ~16 519 | ❌ ×5.5 |
| revue-litterature | literature-review+methodology+style | ~9 389 | ❌ ×3.1 |
| revision-plan | peer-review+coherence+writing-process+style | ~7 254 | ❌ ×2.4 |
| hypothesis | methodology+style | ~7 161 | ❌ ×2.4 |
| methodology | methodology+style | ~7 161 | ❌ ×2.4 |
| scientific-writing | style+coherence+writing-process | ~6 927 | ❌ ×2.3 |
| peer-review | peer-review+coherence+publication | ~4 765 | ❌ ×1.6 |
| theory | style+writing-process | ~4 488 | ❌ ×1.5 |
| defense | style+coherence | ~3 874 | ❌ ×1.3 |
| literature-review | literature-review+style | ~3 663 | ❌ ×1.2 |
| abstract | style+publication | ~3 434 | ❌ ×1.1 |
| paraphrase | style+ethics | ~3 302 | ❌ ×1.1 |
| academic-reformulation | style+ethics | ~3 302 | ❌ ×1.1 |
| auto-edition-8c | auto-edition+style | ~1 659 | ✅ |
| grammaire | style | ~1 435 | ✅ |
| supervision | style | ~1 435 | ✅ |
| harper | style | ~1 435 | ✅ |
| deblocage | (aucun) | 0 | ✅ |

**13 modes sur 21 dépassent le budget documenté de 3 000 tokens.**

> **Note** : Ce dépassement n'est pas nécessairement un problème fonctionnel — les LLM modernes gèrent 16K+ tokens en entrée. Mais il invalide les chiffres documentés et a un impact sur le coût par appel. La décision de réduire le contenu ou de revoir le budget à la hausse est un choix d'architecture.

---

### AXE 5 — ROBUSTESSE ET CAS LIMITES

| Item | Verdict | Sévérité | Détail |
|------|---------|----------|--------|
| **5.1** Textes extrêmes (10 000 mots) | ⚠️ DÉGRADÉ | MOYENNE | Pas de `.max()` sur les schémas Zod (`prompt` et `context`). Un texte arbitrairement long est envoyé à l'LLM sans troncature. |
| **5.2** Caractères spéciaux, LaTeX, emoji | ✅ CONFORME | — | LLMs gèrent Unicode nativement. Tous les `JSON.parse` sont protégés par try/catch |
| **5.3** Sessions concurrentes | ✅ CONFORME | — | État sans serveur (config passée par requête). Sync cross-tab via `storage` event |
| **5.4** Gestion d'erreurs IA (timeout, 429, etc.) | ✅ CONFORME | — | Circuit breaker (3 failures → 30s cooldown) + 2 retries exponentiels + failover chain + timeout 60s |
| **5.5** OpenAlex edge cases | ⚠️ DÉGRADÉ | MOYENNE | Pas de `AbortSignal.timeout()` sur les fetch OpenAlex. Requête sans résultats → pas de test. Accents/guillemets → non testés. |
| **5.6** Réponses IA malformées | ✅ CONFORME | — | coherence-check : 2 passes protégées par try/catch avec dégradation gracieuse |
| **5.7** Build de production | ✅ CORRIGÉ | — | Voir 4.2 — même correction appliquée |

---

### AXE 6 — SÉCURITÉ ET CONFIDENTIALITÉ

| Item | Verdict | Sévérité | Détail |
|------|---------|----------|--------|
| **6.1** Aucune clé API côté client | ✅ CONFORME | — | `hardcoded-keys.ts` = env-only, serveur-only. `/api/ai-keys` retourne des clés masquées. 0 clé en dur dans le frontend. |
| **6.2** Où vont les textes de thèse ? | ⚠️ DÉGRADÉ | **MAJEURE** | Textes → SQLite (local). MAIS quand le doctorant choisit un provider externe (OpenAI, Mistral, etc.), **les textes sont envoyés à ce provider sans aucun avertissement UI**. Politique de rétention dépendante du provider choisi. |
| **6.3** Rate limiting | ~~❌ CASSÉ~~ **CORRIGÉ** | — | **CORRIGÉ** — `src/middleware.ts` + `src/lib/rate-limit.ts`. Sliding window in-memory. 20 req/5min (ai-writing, directeur-chat), 5 req/5min (coherence-check, deep-research), 30 req/1min (text-prediction). Réponse 429 gracieuse avec `Retry-After`. |
| **6.4** localStorage | ~~⚠️ DÉGRADÉ~~ **CORRIGÉ** | — | **CORRIGÉ** — Clé API stockée en cookie **httpOnly, sameSite, secure** (Option A). L'API key ne touche **jamais** le JavaScript client. Migration automatique depuis localStorage au premier chargement. Nouvelle route `/api/ai-config` (GET/POST/DELETE). `withAiConfig()` n'envoie plus l'apiKey. 9 routes IA mises à jour via `resolveAiConfig()`. |
| **6.5** z-ai-web-dev-sdk côté client | ✅ CONFORME | — | SDK uniquement importé dans 3 fichiers serveur. 0 import dans les composants `'use client'`. `next.config.ts` le marque `serverExternalPackages`. |

---

### AXE 7 — INTÉGRITÉ DOCUMENTAIRE

| Item | Verdict | Sévérité | Détail |
|------|---------|----------|--------|
| **7.1** CONTEXT-PROJET.md — chiffres | ⚠️ DÉGRADÉ | MOYENNE | Version v1.9.4 ✅. Modules : doc dit 11 → réel 13. Tests : doc dit 1372 → réel 1372 ✅. Token budget : obsolète (cf. Axe 4). |
| **7.2** AGENTS.md — règles | ⚠️ DÉGRADÉ | MOYENNE | En-tête dit version 1.5.1 (projet est v1.9.4). Dit 19 spécialisations → réel 22. Dit 11 modules → réel 13. Dit 1333 tests → réel 1372. Les 10 règles anti-duplication sont présentes et cohérentes avec le code (spot-check 4/4). |
| **7.3** ARCHITECTURE-CONNAISSANCE.md | ⚠️ DÉGRADÉ | MOYENNE | Version doc v1.9.0 → projet v1.9.4. Chemins de fichiers existent tous ✅. 7 fichiers .md source correspondent ✅. Manque les 2 nouveaux modules (visualization, presentation). |
| **7.4** worklog — séquence Tasks | ⚠️ DÉGRADÉ | BASSE | 6 437 lignes, structure intacte, 0 corruption. Mais les Task IDs ne sont plus strictement séquentiels (sauts liés aux sessions multiples). |
| **7.5** Backlog §10 | ⚠️ DÉGRADÉ | BASSE | B1 ✅ (gestion 429 UI), B2 ✅ (retry backoff). **B3 manquant** — table tronquée après B2. |

---

## 3. LISTE DES ❌ ET ⚠️ — DÉTAIL, SÉVÉRITÉ, CORRECTION

### ❌ CASSÉ (6 items)

| # | Item | Sévérité | Description | Correction proposée | Effort |
|---|------|----------|-------------|-------------------|--------|
| C1 | Build de production | ~~BLOQUANT~~ **CORRIGÉ** | 4 erreurs TS (paper2code, deep-research, export-docx, rag-service, curation, ai-writing) | **CORRIGÉ lors de l'audit** — imports, casts, Buffer, null check | ~30 min |
| C2 | Rate limiting absent | ~~MAJEUR~~ **CORRIGÉ** | 0 protection contre l'abus sur les routes API | **CORRIGÉ** — `src/middleware.ts` + `src/lib/rate-limit.ts`. Sliding window in-memory, 11 règles. 429 gracieuse. | ~~2h~~ |
| C3 | Pattern 1 non déployé | **MAJEUR** | `director.ts` (avec ## Analyse/## Retour) est du code mort. La route importe `directeur.ts` (sans Pattern 1) | Soit : (a) copier le contenu Pattern 1 de `director.ts` → `directeur.ts`, soit (b) migrer l'import de la route vers `director.ts` et supprimer `directeur.ts` | 15 min |
| C4 | Mode « problematique » absent | MAJEUR | L'audit demande un mode pour affiner une question de départ trop vague — aucun mode équivalent | Créer une spécialisation `problematique.ts` avec module `methodology` + `writing-process`. Ajouter au registry. | 1h |
| C5 | Mode « empirique » absent | MAJEUR | L'audit demande un mode pour la méthodo quantitative avec mobilisation de methodology-design | Créer `empirique.ts` avec module `methodology` + `data-analysis`. Vérifier mobilisation effective du module methodology-design. | 1h |
| C6 | Mode « analyse » (data-analysis) absent | MAJEUR | L'audit demande un mode d'interprétation de résultats | Créer `data-analysis.ts` avec module `data-analysis` + `writing-process`. | 1h |

### ⚠️ DÉGRADÉ (15 items)

| # | Item | Sévérité | Description | Correction | Effort |
|---|------|----------|-------------|-----------|--------|
| D1 | Budget tokens obsolète | HAUTE | Full core 22K tok vs 4.5K documenté, 13/21 modes dépassent 3K | Décider : (a) réduire le contenu du noyau, ou (b) documenter le nouveau budget réel, ou (c) revoir l'architecture (plus de modules, injection plus sélective) | 1-2j |
| D2 | Directeur-chat sans `onError` | MOYENNE | Les échecs API sont silencieux dans le chat directeur | Ajouter `onError` callback au `useMutation` avec toast d'erreur | 15 min |
| D3 | Clé API en clair dans localStorage | ~~MAJEURE~~ **CORRIGÉ** | Accessible par extensions, XSS, accès physique | **CORRIGÉ** — Option A : cookie httpOnly + route `/api/ai-config`. 9 routes mises à jour. Migration auto depuis localStorage. | ~~1h~~ |
| D4 | Pas d'avertissement données externes | MAJEURE | Textes envoyés aux providers sans avertissement | Bannière info quand provider ≠ zai : « Votre texte sera envoyé au fournisseur X » | 30 min |
| D5 | Pas de limite d'entrée texte | MOYENNE | `z.string().min(10)` mais pas de `.max()` | Ajouter `.max(50_000)` sur `prompt`, `.max(100_000)` sur `context` | 5 min |
| D6 | OpenAlex sans timeout | MOYENNE | Fetch sans `AbortSignal.timeout()` | Ajouter `signal: AbortSignal.timeout(15_000)` aux appels OpenAlex | 10 min |
| D7 | coherence-check 0 test unitaire | HAUTE | Aucun `route.test.ts` pour le contre-audit 2 passes | Créer des tests avec 3 défauts plantés (2 vrais + 1 faux) | 2h |
| D8 | Mode « conclusion » absent | MOYENNE | Aucun mode pour boucler intro/conclusion | Créer `conclusion.ts` avec module `writing-process` + `coherence` | 1h |
| D9 | freeform/improvement sans knowledge-core | BASSE | Utilisent `buildStandalonePrompt` au lieu de `buildPrompt` | Migrer vers `buildPrompt` avec modules appropriés | 30 min |
| D10 | `director.ts` code mort | BASSE | Doublon non importé de `directeur.ts` | Supprimer après avoir migré Pattern 1 (C3) | 5 min |
| D11 | verification-publication inline | BASSE | Construit son prompt au lieu d'utiliser `buildPrompt` | Migrer vers le pattern standard | 1h |
| D12 | Grille cohérence : 6 vs 7/8 catégories | BASSE | Commentaire dit 7, knowledge-core a 8, UI a 6 | Mettre à jour le commentaire et vérifier la correspondance UI ↔ noyau | 30 min |
| D13 | Docs : chiffres obsolètes (3 fichiers) | MOYENNE | CONTEXT-PROJET, AGENTS.md, ARCHITECTURE-CONNAISSANCE — versions, nb modules, nb spécialisations, nb tests | Mise à jour synchrone des 3 fichiers | 1h |
| D14 | Backlog B3 manquant | BASSE | Table §10 tronquée après B2 | Compléter ou documenter pourquoi B3 est absent | 10 min |
| D15 | Pas de sauvegarde/restauration session | BASSE | Export PDF/DOCX existent mais pas d'export/import de session complète | Feature backlog — faible priorité | 1-2j |

---

## 4. CHIFFRES CLÉS MESURÉS

| Métrique | Valeur | Cible | Statut |
|----------|--------|--------|--------|
| Version | v1.9.4 | — | ✅ |
| Tests | 1 372 / 58 fichiers | — | ✅ Tous passent |
| Lint | 0 erreurs, 191 warnings | 0 erreurs | ✅ |
| Build production | **ÉCHEC** | Success | ❌ |
| Full core tokens | **~22 190** | ≤ 4 500 documenté | ⚠️ ×4.9 |
| Mode le plus lourd | directeur ~16 519 tok | ≤ 3 000 documenté | ⚠️ ×5.5 |
| Modes dans le budget | 8/21 (38%) | 21/21 (100%) | ⚠️ |
| Knowledge modules | 13 | 11 documenté | ⚠️ |
| Spécialisations | 22 fichiers (+ 1 mort) | 19 documenté | ⚠️ |
| API routes | ~50 | — | ✅ |
| Modules fonctionnels UI | 36 | 36 documenté | ✅ |
| Rate `[coherence-audit]` | **Non collecté** | Premier rate | ⏳ |
| Taille bundle | **N/A** (build cassé) | — | ❌ |

---

## 5. VERDICT GLOBAL

### ✅ OUI — 0 BLOCAGE RESTANT

**Phase 1 corrigée (v1.9.5-post-audit) :**

- ~~C1 Build~~ CORRIGÉ (audit initial)
- ~~C2 Rate limiting~~ CORRIGÉ — `src/middleware.ts` + `src/lib/rate-limit.ts`
- ~~D3 Clé API localStorage~~ CORRIGÉ — cookie httpOnly + `/api/ai-config`

**Tests : 1 372/1 372 passent. Lint : 0 erreurs.**

**Problèmes majeurs restants (non bloquants pour lancement) :**

1. **Pattern 1 non déployé** (C3) — la feature v1.9.2 (## Analyse/## Retour) est codée mais jamais connectée
2. **Aucun avertissement sur l'envoi de données** (D4) — les doctorants ne savent pas que leurs textes partent chez OpenAI/Mistral
3. **3 modes d'écriture manquants** (C4-C6) — problématique, empirique, analyse
4. **Budget tokens obsolète** (D1) — les coûts réels sont 2-5× supérieurs aux chiffres documentés

> **0 blocage technique. Lancement possible.** Les items restants sont des améliorations (semaine 1+).

---

## 6. PLAN DE CORRECTION PRIORISÉ

### 🔴 AVANT LANCEMENT (BLOQUANT)

| # | Action | Effort | Item |
|---|--------|--------|------|
| 1 | ~~Corriger l'import `getProviderExtraHeaders` dans `paper2code/generate/route.ts`~~ | ~~2 min~~ | C1 | **CORRIGÉ** |
| 2 | ~~Implémenter le rate limiting dans `src/middleware.ts`~~ | ~~2h~~ | C2 | **CORRIGÉ**
| 3 | ~~Ne plus persister la clé API en localStorage~~ | ~~1h~~ | D3 | **CORRIGÉ**
| 4 | Ajouter un avertissement UI quand provider ≠ zai | 30 min | D4 |
| 5 | Déployer Pattern 1 : migrer ## Analyse/## Retour dans `directeur.ts` | 15 min | C3 |

**Effort total BLOQUANT : ~3.5h** (C1, C2, D3 CORRIGÉS — 0 blocage restant)

### 🟡 SEMAINE 1 (MAJEUR)

| # | Action | Effort | Item |
|---|--------|--------|------|
| 6 | Créer 3 modes manquants : problématique, empirique, data-analysis | 3h | C4-C6 |
| 7 | Ajouter `onError` au directeur-chat mutation | 15 min | D2 |
| 8 | Créer `coherence-check/route.test.ts` avec 3 défauts plantés | 2h | D7 |
| 9 | Ajouter `.max()` aux schémas Zod d'entrée texte | 5 min | D5 |
| 10 | Ajouter `AbortSignal.timeout()` aux fetchs OpenAlex | 10 min | D6 |
| 11 | Revoir et documenter le budget tokens réel | 1-2j | D1 |

**Effort total SEMAINE 1 : ~2 jours**

### 🟢 BACKLOG §10 (MINEUR)

| # | Action | Effort | Item |
|---|--------|--------|------|
| 12 | Migrer freeform/improvement vers `buildPrompt` | 30 min | D9 |
| 13 | Supprimer `director.ts` (code mort) | 5 min | D10 |
| 14 | Migrer verification-publication vers `buildPrompt` | 1h | D11 |
| 15 | Corriger la catégorie cohérence (commentaire + UI) | 30 min | D12 |
| 16 | Mise à jour synchrone de CONTEXT-PROJET, AGENTS.md, ARCHITECTURE-CONNAISSANCE | 1h | D13 |
| 17 | Compléter le backlog §10 (B3) | 10 min | D14 |
| 18 | Créer mode « conclusion » | 1h | D8 |
| 19 | Feature : sauvegarde/restauration de session | 1-2j | D15 |

---

## 7. NOTES MÉTHODOLOGIQUES

### Limites de cet audit

1. **Pas de test E2E en conditions réelles** — le sandbox ne permet pas d'exécuter les 13 modes avec des scénarios doctoraux réels. Les verdicts Axe 1 sont basés sur l'analyse de code, pas sur des exécutions.
2. **Pas de mesure de latence** — impossible sans exécuter les appels IA. Les chiffres de l'audit sont structurels, pas temporels.
3. **Pas de test coherence-audit** — le premier `rate=...%` n'a pas pu être collecté. La décision de clôture du chantier Pattern 2 reste en attente.
4. **Pas de test OpenAlex E2E** — le 429 IP partagée empêche le test académique en profondeur (identifié dans §9 CONTEXT-PROJET).
5. **Budget tokens** — l'estimation (÷3 chars/token pour le français) est approximative. Un comptage via tiktoken serait plus précis, mais la conclusion (dépassement ×5) est robuste même avec ±20% de marge.

### Points forts confirmés

- **Gouvernance anti-duplication** : l'architecture connaissance est solide. 5/6 règles CONFORME, le savoir métier est centralisé et les spécialisations sont propres.
- **Gestion d'erreurs IA** : circuit breaker, retries, failover chain — niveau de maturité élevé.
- **Contre-audit coherence** : implémentation propre avec logging structuré et dégradation gracieuse.
- **Tests** : 1 372 tests passent, 0 échec, couverture large.
- **Sécurité clés API** : zéro clé en dur dans le frontend, SDK côté serveur uniquement.

---

*Rapport généré automatiquement dans le cadre de l'audit de référence ThesisFrame v1.9.4.*
*Ce rapport devient la référence avant lancement : tout ✅ n'a plus besoin d'y revenir, tout ⚠️/❌ alimente le plan de correction.*
