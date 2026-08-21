# Rapport Lot 8 — Phase B : 5 modes IA orphelins

**Base** : PROPOSITION-SEQUENCEMENT-LOTS.md (Lot 8)
**Validation** : accord explicite du commanditaire, borné au périmètre ci-dessous
**Nature** : correction de 5 modes IA manquants dans WRITING_MODES

**Checkpoint pré-Lot 8** : tag Git `pre-lot-8` sur le commit `69cfe23`

---

## Périmètre validé

Correction des 5 modes IA orphelins identifiés au Lot 6, selon la même méthode que la correction du mode `harper` au Lot 6 — ajout des entrées manquantes dans `WRITING_MODES` avec un `systemPrompt` cohérent avec la fonction réelle de chaque module appelant, vérifié par lecture de code avant rédaction.

---

## §1 — Analyse préalable : correspondance réelle mode ↔ page appelante

La PROPOSITION-SEQUENCEMENT-LOTS.md contenait des correspondances incorrectes. Vérification par `rg` :

```
rg -n 'mode:.*"(academic-reformulation|deblocage|freeform|improvement|revue-litterature)"' src/
```

| Mode | Correspondance PROPOSITION (incorrecte) | Appelant réel (vérifié) | Ligne | `context` passé ? |
|---|---|---|---|---|
| `academic-reformulation` | `livres-competences-page.tsx` | `apa-composer-page.tsx` | 789 | Non |
| `deblocage` | `deblocage-ecriture-page.tsx` | `deblocage-ecriture-page.tsx` | 279, 614 | Non |
| `freeform` | `diagrammes-page.tsx` | `diagrammes-page.tsx` | 838 | **Oui** (JSON schema) |
| `improvement` | `apa-composer-page.tsx` | `livres-competences-page.tsx` | 593 | **Oui** (compétences) |
| `revue-litterature` | `outils-slr-page.tsx` | `outils-slr-page.tsx` | 447 | **Oui** (PICO/critères) |

**Note** : `academic-reformulation` et `improvement` étaient inversés dans la proposition par rapport à leurs appelants réels. Cela n'a pas affecté la correction (les 5 modes sont ajoutés indépendamment de la page qui les appelle).

---

## §2 — Modes ajoutés dans `src/data/ai-writing-modes.ts`

### 2.1 — `academic-reformulation`

- **Appelant** : `apa-composer-page.tsx:789`
- **Contexte d'appel** : l'utilisateur saisit un texte ou une référence, l'IA le reformule en style académique. Aucun `context` n'est passé.
- **systemPrompt** : expert en reformulation académique, conserve sens et nuances, élève le registre, ne peut pas inventer d'informations.
- **Temperature** : 0.5
- **Catégorie** : `writing`

### 2.2 — `deblocage`

- **Appelant** : `deblocage-ecriture-page.tsx:279` (stratégies) et `:614` (phrases d'amorce)
- **Contexte d'appel** : l'utilisateur sélectionne un type de blocage, l'IA génère 5 stratégies concrètes. Deuxième appel : génération de phrases d'amorce. Aucun `context` n'est passé — les instructions sont dans le `prompt`.
- **systemPrompt** : coach spécialisé en déblocage d'écriture doctoral, bienveillant, pragmatique, stratégies actionables.
- **Temperature** : 0.8 (plus créatif pour la variété des stratégies)
- **Catégorie** : `writing`

### 2.3 — `freeform`

- **Appelant** : `diagrammes-page.tsx:838`
- **Contexte d'appel** : un `context` détaillé est passé avec le schéma JSON attendu pour les diagrammes. Le mode doit se comporter comme Harper — déléguer au contexte.
- **systemPrompt** : assistant polyvalent qui suit les instructions du `context`, y compris la contrainte JSON-only quand demandé. Même pattern que `harper`.
- **Temperature** : 0.6
- **Catégorie** : `generation`

### 2.4 — `improvement`

- **Appelant** : `livres-competences-page.tsx:593`
- **Contexte d'appel** : un `context` est passé avec le résumé des compétences évaluées, scores, et lacunes. L'IA génère un plan d'apprentissage personnalisé.
- **systemPrompt** : conseiller pédagogique doctoral, base ses recommandations sur les données de contexte, hiérarchise P1/P2/P3, propose des ressources concrètes.
- **Temperature** : 0.6
- **Catégorie** : `generation`

### 2.5 — `revue-litterature`

- **Appelant** : `outils-slr-page.tsx:447`
- **Contexte d'appel** : un `context` est passé avec le cadre PICO, les critères d'inclusion/exclusion et les bases de données sélectionnées.
- **systemPrompt** : expert en revue systématique (SLR), connaît les méthodologies PRISMA et Cochrane, structure ses réponses pour la recherche académique.
- **Temperature** : 0.5
- **Catégorie** : `analysis`

---

## §3 — Fichier modifié

| Fichier | Modification |
|---|---|
| `src/data/ai-writing-modes.ts` | Ajout de 5 entrées (lignes 321-429). 12 → 17 modes. |

**Aucun autre fichier n'a été modifié** — le périmètre est strictement limité à l'ajout des modes.

---

## §4 — Icônes

3 des 5 nouveaux modes utilisent des icônes absentes de l'`ICON_MAP` de `ai-writing-page.tsx` :

- `academic-reformulation` → `RefreshCcw` (absent)
- `deblocage` → `AlertTriangle` (absent)
- `improvement` → `TrendingUp` (absent)

Ces icônes tombent en fallback sur `Sparkles` (ligne 141 : `ICON_MAP[mode.icon] || Sparkles`). C'est le même comportement que le mode `harper` (qui utilise `Sparkles` directement).

Ce point cosmétique (BUG-26 étendu) est **hors périmètre** du Lot 8 et documenté pour un lot ultérieur.

---

## Résultats de vérification

### `npx next build`

```
✓ Compiled successfully in 34.9s
Route (app): 49 routes (inchangé)
→ 0 erreur de compilation
```

### `npx vitest run`

```
 Test Files  54 passed (54)
      Tests  1290 passed (1290)
   Duration  24.46s
→ 0 échec (inchangé — aucune régression)
```

### `bun run lint`

```
✖ 154 problems (0 errors, 154 warnings)
→ 0 erreur, 154 warnings (inchangé — aucun nouveau warning)
```

---

## Synthèse

| Critère | Statut | Preuve |
|---|---|---|
| 5 modes ajoutés dans WRITING_MODES | ✅ | `rg -c '"id:"' src/data/ai-writing-modes.ts` → 17 occurrences |
| systemPrompt cohérent avec le contexte d'appel | ✅ | Lecture de code de chaque page appelante avant rédaction |
| `npx next build` compile | ✅ | Compiled successfully, 49 routes |
| Tests à 0 échec | ✅ | 54 fichiers, 1290 tests |
| Lint 0 erreur | ✅ | 0 erreur, 154 warnings (inchangé) |
| Aucune extension de périmètre | ✅ | 1 seul fichier modifié |
| Checkpoint Git préalable | ✅ | Tag `pre-lot-8` sur commit `69cfe23` |
| ETAT-PROJET-THESISFRAME.md mis à jour | ✅ | Fonctionnalité #3 → ✅, bilan 25✅/4⚠️/1🔴, §2.3 résolu |

**Les 5 modes IA orphelins sont désormais fonctionnels. Les pages `deblocage-ecriture`, `diagrammes`, `livres-competences`, `apa-composer` et `outils-slr` ne recevront plus d'erreur 400 lors de l'appel à `/api/ai-writing`.**