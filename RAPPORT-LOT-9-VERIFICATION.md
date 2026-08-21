# RAPPORT-LOT-9-VERIFICATION.md

> **Lot 9 — Phase C : Revérification et correction de BUG-08, BUG-09, BUG-10, BUG-18, BUG-20**
> Périmètre strict : 5 bugs annoncés corrigés par le Lot 2 — fiabilité douteuse.
> Principe : vérifier par lecture de code avant de corriger.

---

## 0. Gouvernance

### 0.1 — Checkpoint Git

- **Tag** : `pre-lot-9` sur commit avant toute modification.
- **Commit post-correction** : `2c58da4` — « Lot 9 (Phase C): correction de BUG-08/09/10/18/20 »
- **6 fichiers modifiés**, 160 insertions, 11 suppressions.

### 0.2 — Vérification qualité

| Vérification | Résultat |
|---|---|
| `npx next build` | ✅ Compiled successfully — 49 routes (47 dynamiques + 2 statiques) |
| `npx vitest run` | ✅ 54 fichiers, 1290 tests passants, 0 échec |
| `bun run lint` | ✅ 0 erreur, 154 warnings (inchangé depuis Lot 6) |

### 0.3 — Extensions de périmètre

Aucune. Les 5 bugs listés dans le périmètre du Lot 9 ont été traités. Aucun problème supplémentaire n'a été corrigé à la volée.

---

## 1. Verdicts individuels — Lecture de code

### 1.1 — BUG-08 : Props `onAddChapter`/`onDelete` non passées

| Item | Détail |
|---|---|
| **Verdict initial** | ❌ **Annoncé à tort, correction nécessaire** |
| **Fichiers vérifiés** | `editor-page.tsx:123-135`, `chapter-tabs.tsx:15-20`, `chapter-header.tsx:16-22` |
| **Preuve** | `ChapterTabs` reçoit `onAddChapter?` (interface ligne 19) et l'utilise (lignes 126-134) pour afficher un bouton `+`. Mais `editor-page.tsx:123-127` ne passe pas cette prop. Même pattern pour `onDelete` dans `ChapterHeader` (interface ligne 20, utilisé lignes 152-161) — jamais passé depuis `editor-page.tsx:130-135`. |
| **Hooks existants** | `useCreateChapter` (use-thesis.ts:197-223) et `useDeleteChapter` (use-thesis.ts:225-237) existent mais ne sont ni importés ni utilisés dans `editor-page.tsx`. |
| **Correction appliquée** | Import de `useCreateChapter` et `useDeleteChapter`. Implémentation de `handleAddChapter` (crée un chapitre avec numéro romain auto-incrémenté) et `handleDeleteChapter` (supprime le chapitre actif et réinitialise la sélection). Passage de `onAddChapter={handleAddChapter}` à `ChapterTabs` et `onDelete={handleDeleteChapter}` à `ChapterHeader`. |

### 1.2 — BUG-09 : Aucun code de réordonnancement

| Item | Détail |
|---|---|
| **Verdict initial** | ❌ **Annoncé à tort, correction nécessaire** |
| **Fichiers vérifiés** | `rg -i 'drag\|onDrag\|sortable\|dnd\|reorder' src/modules/editor/` → zéro résultat |
| **Preuve** | Aucun code de drag-and-drop ou de réordonnancement dans l'ensemble du module éditeur. Les chapitres ont un champ `sortOrder` dans la DB et le hook `useUpdateChapter` accepte `sortOrder?: number`, mais aucune UI ne l'expose. |
| **Correction appliquée** | Ajout de boutons Monter/Descendre (`ChevronUp`/`ChevronDown`) dans `ChapterHeader`. Props `onMoveUp`, `onMoveDown`, `canMoveUp`, `canMoveDown` ajoutés. Dans `editor-page.tsx` : `sortedChapters` (useMemo trié par sortOrder), `selectedChapterIndex`, et `handleMoveChapter` qui swap les valeurs `sortOrder` entre le chapitre courant et son voisin via deux appels `updateChapter.mutate`. |
| **Note** | Le swap est effectué par permutation des valeurs `sortOrder` (approche simple sans lib externe). Après invalidation du cache React Query, l'ordre est correctement mis à jour. |

### 1.3 — BUG-10 : `directorChatContext` absent

| Item | Détail |
|---|---|
| **Verdict initial** | ❌ **Annoncé à tort, correction nécessaire** |
| **Fichiers vérifiés** | `app-store.ts:250-270`, `ai-writing-page.tsx:273-287`, `directeur-chat/route.ts:13-22` |
| **Preuve** | L'interface `AppState` (app-store.ts) ne contient aucun champ `directorChatContext`. `DirecteurChatPanel()` (ai-writing-page.tsx:273) est appelée sans paramètres. Le mutation (ligne 284-287) envoie uniquement `{ messages: allMessages }`. L'API (directeur-chat/route.ts:20) accepte `thesisContext?: string` en optionnel et l'injecte comme message système (lignes 52-57) si présent. |
| **Correction appliquée** | Dans `DirecteurChatPanel` : import de `useAppStore` et `useThesis`. Récupération de la thèse active via `useThesis(activeThesisId)`. Construction d'une chaîne `thesisContext` contenant titre, sous-titre, auteur, directeur, institution, discipline et liste des chapitres. Passage de `{ messages: allMessages, thesisContext }` au body de la requête. |
| **Note** | Le contexte n'est pas stocké dans le Zustand store (approche inutilement complexe) — il est construit à la volée dans le composant à partir des données existantes de la thèse active. |

### 1.4 — BUG-18 : `email` et `laboratory` absents du formulaire

| Item | Détail |
|---|---|
| **Verdict initial** | ❌ **Annoncé à tort, correction nécessaire** |
| **Fichiers vérifiés** | `create-thesis-dialog.tsx:19-48`, `api-schemas.ts:15-24`, `thesis/route.ts:53-62` |
| **Preuve** | Le formulaire a 6 champs (title, author, subtitle, institution, discipline, directorName). `email` et `laboratory` sont absents. Pourtant le schéma Zod (`createThesisSchema`) les définit comme optionnels (lignes 19, 21), et l'API les utilise (`validated.email` ligne 58, `validated.laboratory` ligne 60). Le hook `useCreateThesis` n'acceptait pas non plus ces champs dans son type d'entrée. |
| **Correction appliquée** | Ajout de 2 champs `email` (type email) et `laboratory` dans le formulaire, placés dans une grille 2 colonnes avant le champ directeur. Mise à jour du hook `useCreateThesis` pour accepter `email?` et `laboratory?` dans le type d'entrée. Reset des champs dans le handler de soumission. |

### 1.5 — BUG-20 : Faux négatif quand JSON invalide

| Item | Détail |
|---|---|
| **Verdict initial** | ❌ **Annoncé à tort, correction nécessaire** |
| **Fichiers vérifiés** | `grammaire-page.tsx:137-154`, `grammaire-page.tsx:393` |
| **Preuve** | Le catch du JSON.parse (lignes 142-153) retournait `{ errors: [], totalErrors: 0, readabilityScore: 70 }`. L'UI à la ligne 393 affiche « Aucune erreur détectée » quand `result.errors.length === 0`. Résultat : si l'IA retourne un JSON invalide, l'utilisateur voit un faux positif vert alors que l'analyse n'a pas fonctionné. |
| **Correction appliquée** | 3 changements : (1) Ajout de `parseError?: string` à l'interface `GrammarResult`. (2) Le catch retourne `totalErrors: -1` et `parseError: "L'IA n'a pas retourné un résultat analysable..."` au lieu de `totalErrors: 0`. (3) L'UI des erreurs affiche maintenant un avertissement amber « Analyse incomplète » avec le message de `parseError` avant de vérifier `errors.length === 0`. La stat card « Erreurs » affiche « — » au lieu de « 0 » quand `totalErrors < 0`. |

---

## 2. Résumé des modifications

| Fichier | Changement | Bug(s) |
|---|---|---|
| `src/modules/editor/editor-page.tsx` | Import `useCreateChapter`/`useDeleteChapter`, handlers `handleAddChapter`/`handleDeleteChapter`/`handleMoveChapter`, passage des props | BUG-08, BUG-09 |
| `src/modules/editor/components/chapter-header.tsx` | Props `onMoveUp`/`onMoveDown`/`canMoveUp`/`canMoveDown`, boutons ChevronUp/ChevronDown | BUG-09 |
| `src/modules/editor/components/create-thesis-dialog.tsx` | Champs `email` et `laboratory`, mise à jour du submit et du reset | BUG-18 |
| `src/modules/editor/hooks/use-thesis.ts` | `email?` et `laboratory?` dans le type d'entrée de `useCreateThesis` | BUG-18 |
| `src/modules/ai-writing/ai-writing-page.tsx` | Construction de `thesisContext` et passage au body de `/api/directeur-chat` | BUG-10 |
| `src/modules/grammaire/grammaire-page.tsx` | `parseError` dans le type et le catch, UI d'avertissement, stat card « — » | BUG-20 |

---

## 3. Bilan du Lot 9

| Verdict | Count | IDs |
|---|---|---|
| Annoncé à tort → **corrigé** | **5** | BUG-08, 09, 10, 18, 20 |
| Confirmé réellement corrigé | **0** | — |
| **Total vérifié** | **5** | |

Les 5 bugs du Lot 9 étaient tous **non corrigés**, confirmant la non-fiabilité des affirmations du Lot 2. Tous sont désormais corrigés avec preuve de build/tests/lint.
