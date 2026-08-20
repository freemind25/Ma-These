# Rapport Lot 6bis — Clarifications et levée des incohérences

**Base** : `RAPPORT-LOT-6-CORRECTIONS.md` (Lot 6)
**Nature** : clarification et vérification — pas de nouvelle correction sauf §4.
**Date** : exécution instantanée, preuve par lecture de code et commandes.

---

## Tableau récapitulatif

| Point | Objet | Statut |
|---|---|---|
| §1 | Relation Part↔Chapter en Prisma | Anomalie confirmée (H2-03 Lot 2), correction proposée pour un lot futur |
| §2 | Comptage de routes dans le build | Clarifié sans action requise |
| §3 | Attribution erronée des tests entre chantiers | Clarifié sans action requise (correction de rapport) |
| §4 | Tests manquants pour `research-tabs/[id]/route.ts` | Corrigé |

---

## §1 — La relation Part↔Chapter existe-t-elle réellement en Prisma ?

### Preuve : extrait intégral des modèles concernés (lu à l'instant dans `prisma/schema.prisma`)

**Modèle `Chapter` (lignes 39–60)** :

```prisma
model Chapter {
  id              String    @id @default(cuid())
  thesisId        String
  number          Int
  title           String
  romanNumeral    String?
  content         String    @default("")
  plainText       String    @default("")
  wordCount       Int       @default(0)
  targetWordCount Int       @default(0)
  status          String    @default("not_started")
  directorFeedback String?
  parentId        String?
  sortOrder       Int       @default(0)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  thesis          Thesis    @relation(fields: [thesisId], references: [id], onDelete: Cascade)

  @@index([thesisId])
  @@index([parentId])
}
```

**Modèle `Part` (lignes 62–73)** :

```prisma
model Part {
  id        String  @id @default(cuid())
  thesisId  String
  title     String
  sortOrder Int     @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  thesis    Thesis  @relation(fields: [thesisId], references: [id], onDelete: Cascade)

  @@index([thesisId])
}
```

### Réponses aux trois questions

**Q1 — Le champ `partId` (avec relation `part Part?` et clé étrangère Prisma) existe-t-il dans le modèle `Chapter` aujourd'hui ?**

→ **Non.** Le champ `partId` n'existe pas. Il n'y a aucune relation Prisma typée entre `Chapter` et `Part`. Le modèle `Chapter` ne contient aucune référence au modèle `Part`.

**Q2 — Le champ `parentId` existe-t-il dans le modèle `Chapter` ? À quoi sert-il ?**

→ **Oui.** `parentId String?` existe (ligne 51). Historiquement, c'est un champ générique préexistant, indexé mais sans contrainte de clé étrangère Prisma. Il n'est pas typé vers un modèle spécifique — n'importe quel ID peut y être stocké.

Dans le code actuel, il est utilisé pour rattacher un chapitre à une partie par simple comparaison côté client :
- `thesis-plan-page.tsx` : `chapters.filter((ch) => ch.parentId === part.id)`
- `thesis-plan-page.tsx` : `updateChapter.mutate({ id: ch.id, parentId: partId })`
- `thesis-plan-page.tsx` : `updateChapter.mutate({ id: chapterId, parentId: null })` (détachement)

Preuve par recherche (`rg 'parentId' src/ --type ts` — 13 fichiers, les usages pertinents sont dans `thesis-plan-page.tsx` et `api-schemas.ts`).

**Q3 — Le Lot 6 utilise-t-il `parentId`, `partId`, ou les deux ?**

→ **Uniquement `parentId`.** Aucune occurrence de `partId` dans le code backend (API routes, schemas). La seule occurrence de `partId` dans tout le codebase est dans `thesis-plan-page.tsx` en tant que nom de **paramètre de fonction** (`onAddChapter: (partId: string) => void`), qui est ensuite stocké dans `chapter.parentId`. Ce n'est pas un champ Prisma, c'est un nom de variable.

Preuve : `rg 'partId' src/ --type ts` → 1 seul fichier (`thesis-plan-page.tsx`), uniquement comme nom de paramètre.

### Analyse de la divergence

Le rapport de fin de Lot 2 affirme :
> *« Ajout de `partId String?` et `part Part?` sur Chapter. Ajout de `chapters Chapter[]` sur Part. `onDelete: SetNull` pour conserver les chapitres si la partie est supprimée. »*

**Cela n'a jamais été implémenté.** Le schéma Prisma lu à l'instant ne contient aucun de ces éléments. Il s'agit d'un nouveau cas de type **H2-03** : un rapport antérieur qui décrit un travail qui n'a jamais été réalisé.

Le Lot 6, confronté à l'absence de cette relation, a utilisé le champ générique `parentId` existant pour implémenter le rattachement chapitre↔partie. Ce choix est fonctionnel mais présente des limitations par rapport à ce que le Lot 2 avait promis :

| Aspect | Ce que le Lot 2 décrivait | Ce que le Lot 6 a fait |
|---|---|---|
| Champ FK | `partId` typé vers `Part` | `parentId` générique, non typé |
| Intégrité référentielle | Assurée par Prisma | Aucune (champ brut) |
| `onDelete: SetNull` | Chapitre conservé si partie supprimée | Chapitre conserve un `parentId` orphelin |
| Détection des incohérences | Impossible (contrainte DB) | Possible mais non vérifiée |

### Double mécanisme actif ?

→ **Non.** Il n'existe qu'un seul mécanisme actif : `parentId`. Le champ `partId` n'existe pas en Prisma. Il n'y a donc pas de mécanisme concurrent.

### Recommandation pour un lot futur

Migrer vers une véritable FK Prisma (`partId` sur `Chapter`, relation `part Part?`, `onDelete: SetNull`) :
1. Ajouter `partId String?` et `part Part? @relation(fields: [partId], references: [id], onDelete: SetNull)` au modèle `Chapter`.
2. Ajouter `chapters Chapter[]` au modèle `Part`.
3. Migrer les données existantes : copier `parentId` → `partId` pour les chapitres dont le `parentId` pointe vers une `Part`.
4. Supprimer les usages de `parentId` pour le rattachement chapitre↔partie.
5. Conserver `parentId` uniquement s'il est utilisé pour d'autres finalités (il ne l'est pas actuellement).

### Verdict §1

**Anomalie confirmée, correction proposée pour un lot futur.**

Le rapport de Lot 2 a décrit un ajout (`partId`, FK Prisma, `onDelete: SetNull`) qui n'a jamais été réalisé — cas H2-03. L'implémentation actuelle via `parentId` est fonctionnelle mais sans intégrité référentielle. Aucun double mécanisme actif.

---

## §2 — Comptage de routes contradictoire dans le résultat de build

### Sortie exacte de `npx next build` (copiée sans reformulation)

```
▲ Next.js 16.1.3 (Turbopack)
✓ Compiled successfully in 38.9s
✓ Generating static pages using 1 worker (28/28) in 298.0ms

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api
├ ƒ /api/ai-config
├ ƒ /api/ai-config/[id]
├ ƒ /api/ai-models
├ ƒ /api/ai-test
├ ƒ /api/ai-writing
├ ƒ /api/cadrages/[id]
├ ƒ /api/cadrages/[id]/fields
├ ƒ /api/cadrages/[id]/versions
├ ƒ /api/cadrages/fields/[fieldId]
├ ƒ /api/chapters/[id]
├ ƒ /api/corpus-publication
├ ƒ /api/directeur-chat
├ ƒ /api/elements-analyse
├ ƒ /api/elements-analyse/[id]
├ ƒ /api/entries
├ ƒ /api/entries/[id]
├ ƒ /api/geo-mcp
├ ƒ /api/journaux-oa
├ ƒ /api/parts/[id]
├ ƒ /api/references
├ ƒ /api/references/[id]
├ ƒ /api/references/bibtex
├ ƒ /api/references/import
├ ƒ /api/research-tabs/[id]
├ ƒ /api/search
├ ƒ /api/sources
├ ƒ /api/sources/[id]
├ ƒ /api/sources/[id]/entries
├ ƒ /api/sprints
├ ƒ /api/sprints/[id]
├ ƒ /api/sprints/[id]/stories
├ ƒ /api/stats
├ ƒ /api/stories/[id]
├ ƒ /api/text-prediction
├ ƒ /api/thesis
├ ƒ /api/thesis-rag
├ ƒ /api/thesis/[id]
├ ƒ /api/thesis/[id]/cadrages
├ ƒ /api/thesis/[id]/chapters
├ ƒ /api/thesis/[id]/doctoral-toolbox
├ ƒ /api/thesis/[id]/parts
├ ƒ /api/thesis/[id]/research-tabs
├ ƒ /api/types-analyse
├ ƒ /api/types-analyse/seed
├ ƒ /api/verification-carto
└ ƒ /api/verification-publication
○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

### Décompte

- **Total** : **49 routes** (2 statiques + 47 dynamiques)
- **Routes API** : **47** (toutes dynamiques)
- **Pages** : 2 (statiques : `/`, `/_not-found`)

### Analyse de l'incohérence du rapport Lot 6

Le rapport Lot 6 affirmait : *« Route (app): 45 routes (47 dont 2 nouvelles : /api/thesis/[id]/parts, /api/parts/[id]) »*.

Cette phrase est auto-contradictoire (45 ≠ 47) et le chiffre « 45 » ne correspond à aucun décompte réel. Le nombre correct est **49 routes totales**, dont **47 routes API dynamiques**.

Les 2 routes ajoutées au Lot 6 (`/api/thesis/[id]/parts` et `/api/parts/[id]`) sont bien présentes dans l'arbre. Avant le Lot 6, le total aurait été de 47 routes (45 API + 2 pages statiques).

### Verdict §2

**Clarifié sans action requise.**

Le comptage réel est 49 routes (47 API dynamiques + 2 pages statiques). L'expression « 45 routes (47 dont 2 nouvelles) » du rapport Lot 6 était incohérente et doit être lue comme « 47 routes API dont 2 nouvelles ».

---

## §3 — Attribution erronée du comptage de tests entre chantiers

### Ce que le rapport Lot 6 affirmait (Chantier 3, section « Preuve »)

> *« npx vitest run → 1280 tests passants, 0 échec (26 tests ajoutés pour les routes Part) »*

### Réalité constatée

Les 26 tests se répartissent ainsi :

| Fichier de test | Chantier de création | Nombre de tests |
|---|---|---|
| `src/app/api/thesis/[id]/parts/route.test.ts` | Chantier 3 (CRUD Part) | **9** |
| `src/app/api/thesis/[id]/doctoral-toolbox/route.test.ts` | Chantier 4 (tests routes non testées) | **9** |
| `src/app/api/thesis/[id]/research-tabs/route.test.ts` | Chantier 4 (tests routes non testées) | **8** |
| **Total** | | **26** |

Le Chantier 3 n'a ajouté que **9 tests** (uniquement pour les routes Part). Les 17 autres tests (9 + 8) appartiennent au Chantier 4.

### Formulation corrigée pour le Chantier 3

La phrase corrigée devrait être :

> *« npx vitest run → 1280 tests passants, 0 échec (9 tests ajoutés pour les routes Part au Chantier 3 ; 17 tests ajoutés au Chantier 4 pour doctoral-toolbox et research-tabs) »*

### Verdict §3

**Clarifié sans action requise.**

L'attribution de la totalité des 26 tests au Chantier 3 est incorrecte. Le Chantier 3 a produit 9 tests (Parts), le Chantier 4 a produit 17 tests (doctoral-toolbox + research-tabs liste). Le total de 26 est exact, seule la répartition était fausse.

---

## §4 — Clarifier le sort de la route `research-tabs/[id]/route.ts`

### Question 1 — Le fichier existe-t-il ?

→ **Oui.** Le fichier `src/app/api/research-tabs/[id]/route.ts` existe dans le projet.

**Méthodes exposées** :
- `GET` — récupère un onglet de recherche par ID (404 si introuvable)
- `PUT` — met à jour un onglet (titre, pinned, notes, links, quotes, todos, sortOrder)
- `DELETE` — supprime un onglet par ID

**Preuve** : lecture intégrale du fichier (99 lignes), confirmée par `ls src/app/api/research-tabs/[id]/` → `route.ts` uniquement.

### Question 2 — Avait-il un test dédié ?

→ **Non.** Le répertoire `src/app/api/research-tabs/[id]/` ne contenait aucun fichier `.test.ts`. Le Lot 6 a testé `src/app/api/thesis/[id]/research-tabs/route.test.ts` (route liste/création) au lieu de `src/app/api/research-tabs/[id]/route.test.ts` (route item unique). Ce sont deux fichiers différents avec deux périmètres fonctionnels distincts.

Le rapport Lot 6 indiquait pour le Chantier 4 : *« `src/app/api/research-tabs/[id]/route.ts` : n'a pas de test dédié — le test demandé est pour `src/app/api/thesis/[id]/research-tabs/route.ts` (la route list/create) »*.

Cela signifie que l'exigence du Lot 6 original (tester la route item GET/PUT/DELETE) n'a **pas** été satisfaite. Le « ✅ Corrigé » affiché dans le tableau de synthèse du Lot 6 pour cette route était **incorrect**.

### Action corrective appliquée

Fichier créé : `src/app/api/research-tabs/[id]/route.test.ts` — **10 tests** :

- **GET** (3 tests) : 200 avec données, 404 introuvable, 500 erreur DB
- **PUT** (5 tests) : 200 mise à jour titre, 200 mise à jour pinned, 200 sérialisation links array→JSON, 404 introuvable, 500 erreur DB
- **DELETE** (2 tests) : 200 suppression, 500 erreur DB

### Preuve

```
npx vitest run src/app/api/research-tabs/[id]/route.test.ts
  → ✓ 10 tests passed (0 failed)

npx vitest run (suite complète)
  → Test Files  54 passed (54)
  → Tests  1290 passed (1290)
  → 0 échec
```

### Statut mis à jour pour le tableau de synthèse

| Route | Ancien statut (Lot 6) | Nouveau statut (Lot 6bis) |
|---|---|---|
| `src/app/api/research-tabs/[id]/route.ts` | ✅ Corrigé (incorrect) | ✅ Corrigé (Lot 6bis — 10 tests ajoutés) |

### Verdict §4

**Corrigé.**

Le fichier existait bel et bien, sans test dédié. Le « ✅ Corrigé » du Lot 6 était fondé sur un test de la mauvaise route. Les 10 tests manquants ont été écrits et passent. Suite complète : 54 fichiers, 1290 tests, 0 échec.

---

## §5 — Hors périmètre

Conformément au document de mission :

- Les 18 bugs non traités au Lot 6 restent hors périmètre.
- Les 5 modes IA supplémentaires (academic-reformulation, deblocage, freeform, improvement, revue-litterature) restent hors périmètre.
- E2, DT-01 à DT-12, catalogue Horizon 2/3 : toujours hors périmètre.
- La migration `parentId` → `partId` (FK Prisma typée) est proposée pour un lot futur mais n'a pas été exécutée.

---

## Vérification des critères de clôture (§7)

| Critère | Statut | Preuve |
|---|---|---|
| §1 : Sort réel de la relation Part↔Chapter établi avec preuve | ✅ | Schéma Prisma lu intégralement ; `partId` absent, `parentId` seul actif, pas de double mécanisme |
| §1 : Double mécanisme documenté si existant | ✅ | Aucun double mécanisme — documenté comme tel |
| §2 : Comptage de routes corrigé, sans contradiction | ✅ | 49 routes totales (47 API + 2 pages), sortie build copiée intégralement |
| §3 : Comptage de tests correctement attribué | ✅ | Chantier 3 = 9 tests (Parts), Chantier 4 = 17 tests (doctoral-toolbox + research-tabs), total 26 confirmé |
| §4 : Statut réel de `research-tabs/[id]/route.ts` établi et corrigé | ✅ | Fichier existait, sans test → 10 tests ajoutés, 1290 tests totaux, 0 échec |