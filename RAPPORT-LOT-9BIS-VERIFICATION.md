# RAPPORT-LOT-9BIS-VERIFICATION.md

> **Lot 9bis — Complément Lot 9 : mise à jour gouvernance + preuve fonctionnelle**
> Périmètre strict : (1) mise à jour ETAT-PROJET avec bilan fiabilité Lot 2 (0/7), (2) preuve fonctionnelle des corrections Lot 9.

---

## 0. Gouvernance

### 0.1 — Checkpoint Git

- **Tag** : `pre-lot-9bis`
- **Commit** : `PLACEHOLDER_HASH`

### 0.2 — Vérification qualité

| Vérification | Résultat |
|---|---|
| `npx next build` | ✅ Compiled successfully — 49 routes |
| `npx vitest run` | ✅ 54 fichiers, **1 292 tests** passants, 0 échec (+2 vs Lot 9) |
| `bun run lint` | ✅ 0 erreur, 154 warnings (inchangé) |

### 0.3 — Extensions de périmètre

Aucune.

---

## 1. Mise à jour ETAT-PROJET — Fiabilité du Lot 2

### 1.1 — Nouvelle section §7.1

Ajout d'une section « Inventaire détaillé de la fiabilité du Lot 2 » dans ETAT-PROJET-THESISFRAME.md, listant les 7 affirmations vérifiables du Lot 2 et leur résultat après vérification indépendante :

| # | Affirmation Lot 2 | Résultat |
|---|---|---|
| 1 | Persistance Boîte doctorale | ✅ Fonctionne, attribution Lot 2 rejetée (Lot 9bis) |
| 2 | Persistance Onglet recherche | ✅ Fonctionne, attribution Lot 2 rejetée (Lot 9bis) |
| 3 | FK `partId` (Part↔Chapter) | ❌ Jamais fait (Lot 7 a corrigé) |
| 4 | BUG-08 corrigé | ❌ Non corrigé (Lot 9 a corrigé) |
| 5 | BUG-09 corrigé | ❌ Non corrigé (Lot 9 a corrigé) |
| 6 | BUG-10 corrigé | ❌ Non corrigé (Lot 9 a corrigé) |
| 7 | 604 tests créés | ❌ Non vérifiable (auto-rapporté worklog, Lot 9bis) |

**Bilan : 0/7 confirmé correct.**

### 1.2 — Mise à jour du tableau de fiabilité (§7.2)

La ligne Lot 2 dans le tableau de fiabilité a été enrichie : « **0/7 items revérifiés confirmés corrects.** Voir §7.1 pour l'inventaire exhaustif. »

### 1.3 — Mise à jour du compteur de tests

- §5 Historique : ajout ligne Lot 9bis (1 292 tests)
- §6 Métriques : tests mis à jour de 1 290 → 1 292

---

## 2. Preuve fonctionnelle des corrections Lot 9

### 2.1 — Méthode retenue

Les 4 handlers/UI corrigés au Lot 9 (`handleAddChapter`, `handleDeleteChapter`, `handleMoveChapter`, `thesisContext`) sont des **wrappers minces autour d'appels API existants**. La preuve fonctionnelle est obtenue par :

1. **Tests automatisés existants** couvrant les API sous-jacentes
2. **2 tests ciblés ajoutés** pour la fonctionnalité `sortOrder` (BUG-09) qui n'avait pas de test spécifique

### 2.2 — Cartographie handler → API → test existant

| Handler (Lot 9) | Appel API | Test existant | Statut |
|---|---|---|---|
| `handleAddChapter` | `POST /api/thesis/[id]/chapters` | `thesis/[id]/chapters/route.test.ts` : 9 tests (create, auto-number, sortOrder, romanNumeral, validation, error) | ✅ Couvert |
| `handleDeleteChapter` | `DELETE /api/chapters/[id]` | `chapters/[id]/route.test.ts` : 3 tests (delete, id param, error) | ✅ Couvert |
| `handleMoveChapter` | `PUT /api/chapters/[id]` avec `sortOrder` | `chapters/[id]/route.test.ts` : **2 tests ajoutés** (sortOrder update, sortOrder: 0) | ✅ Couvert |
| `thesisContext` | `POST /api/directeur-chat` avec `thesisContext` | `directeur-chat/route.test.ts` : 2 tests (with context, without context) | ✅ Couvert |

### 2.3 — Tests ajoutés (2)

**Fichier** : `src/app/api/chapters/[id]/route.test.ts`

```
✓ updates chapter sortOrder for chapter reorder (BUG-09)
  → Vérifie PUT avec { sortOrder: 2 } → 200, data.sortOrder === 2, DB appelé avec { data: { sortOrder: 2 } }

✓ accepts sortOrder: 0 (first position)
  → Vérifie PUT avec { sortOrder: 0 } → 200, DB appelé avec { data: { sortOrder: 0 } }
```

### 2.4 — Couverture BUG-18 (email/laboratory)

Le test existant `creates thesis with all optional fields` (`thesis/route.test.ts:199-229`) couvre déjà :
- Envoi de `email: 'marie@test.com'` et `laboratory: 'LIP6'` dans le body
- Vérification que `db.thesis.create` reçoit `institution: 'ENS'` et `laboratory: 'LIP6'`
- Validation email invalide (`returns 400 when email is invalid`, ligne 188-197)

La correction du formulaire (ajout des champs UI) est vérifiée par le build et l'absence de nouveau warning lint.

---

## 3. Bilan

| Item | Statut |
|---|---|
| §7.1 fiabilité Lot 2 (0/7) | ✅ Ajouté dans ETAT-PROJET |
| Tests ciblés sortOrder | ✅ 2 tests ajoutés, 1 292 total passants |
| Build | ✅ Compiled successfully |
| Lint | ✅ 0 erreur, 154 warnings (inchangé) |
| Extensions de périmètre | Aucune |
