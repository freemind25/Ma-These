# Proposition de séquencement en lots — ThesisFrame

> **Document de travail — à valider par le commanditaire avant tout démarrage.**
> Fondée sur la feuille de route du document de gouvernance (§2, phases A à D) et sur la vérification factuelle du code.

---

## Lot 7 — Phase A : Intégrité référentielle Part↔Chapter

### Périmètre

Migrer la relation Chapter↔Part d'un champ générique `parentId` sans contrainte vers une véritable clé étrangère Prisma typée.

### Contenu précis

1. **`prisma/schema.prisma`** — Modifications :
   - Ajouter `partId String?` au modèle `Chapter`
   - Ajouter la relation `part Part? @relation(fields: [partId], references: [id], onDelete: SetNull)`
   - Ajouter `chapters Chapter[]` au modèle `Part`
   - Conserver `parentId` temporairement (ne pas supprimer pour éviter de casser d'autres usages potentiels)

2. **Migration des données** — Script ou logique de migration :
   - Pour chaque Chapter dont `parentId` pointe vers un Part existant, copier la valeur dans `partId`
   - Chapters dont `parentId` est null ou ne pointe pas vers un Part → `partId` reste null

3. **Mise à jour des consommateurs** :
   - `src/modules/thesis-plan/thesis-plan-page.tsx` — remplacer tous les `parentId === part.id` par des requêtes utilisant la relation Prisma (ou garder la comparaison mais sur `partId`)
   - `src/lib/api-schemas.ts` — ajouter `partId` aux schemas de création/mise à jour de chapitre
   - `src/modules/editor/hooks/use-thesis.ts` — ajouter `partId` au type `ThesisChapter`
   - `src/app/api/thesis/[id]/chapters/route.ts` — inclure `partId` dans les opérations CRUD

4. **Suppression de `parentId`** (uniquement si l'analyse prouve qu'il n'est utilisé nulle part ailleurs pour d'autres finalités) :
   - Vérifier tous les 13 fichiers utilisant `parentId` (box-cloud et diagrammes l'utilisent pour leurs propres hiérarchies — **ils ne sont pas concernés**)
   - Supprimer `parentId` de Chapter uniquement si confirmé non utilisé ailleurs que pour les Parts

5. **Tests** — Ajouter/mettre à jour les tests pour vérifier la contrainte FK et le `onDelete: SetNull`

### Fichiers concernés

- `prisma/schema.prisma` (chapitres Part, Chapter)
- `src/modules/thesis-plan/thesis-plan-page.tsx`
- `src/lib/api-schemas.ts`
- `src/modules/editor/hooks/use-thesis.ts`
- `src/app/api/thesis/[id]/chapters/route.ts`
- `src/app/api/thesis/[id]/chapters/route.test.ts`
- `src/app/api/thesis/[id]/parts/route.test.ts`

### Risque

| Risque | Niveau | Mitigation |
|---|---|---|
| Perte de données (chapters détachés d'une partie) | 🟡 Moyen | Migration avec sauvegarde préalable. `onDelete: SetNull` plutôt que Cascade |
| Régression si `parentId` est utilisé ailleurs que pour Parts | 🟡 Moyen | Vérification exhaustive des 13 fichiers avant suppression |
| `bun run db:push` échoue sur données existantes | 🟢 Faible | `partId` est nullable, pas de contrainte NOT NULL |

### Effort estimé

~2h de travail effectif (principalement vérification et tests, la migration elle-même est mécanique).

### Critères de clôture

- `partId` existe dans le schéma Prisma avec FK typée et `onDelete: SetNull`
- Tous les consommateurs frontend utilisent `partId` (pas `parentId`) pour le rattachement chapitre↔partie
- `npx next build` ✅, `npx vitest run` 0 échec, `bun run lint` 0 erreur
- Suppression ou justification conservatoire de `parentId` sur Chapter

---

## Lot 8 — Phase B : 5 modes IA manquants

### Périmètre

Ajouter les 5 modes IA orphelins dans `WRITING_MODES` pour que les pages qui les appellent ne reçoivent plus un 400 systématique.

### Contenu précis

Pour chaque mode manquant, ajouter une entrée dans `src/data/ai-writing-modes.ts` :

| Mode | Page appelante | Description | Prompt système suggéré |
|---|---|---|---|
| `academic-reformulation` | `livres-competences-page.tsx` | Reformulation académique d'un extrait | Reformuler le texte en style académique formel |
| `deblocage` | `deblocage-ecriture-page.tsx` | Déblocage de l'écriture | Aider à débloquer l'écriture par des suggestions progressives |
| `freeform` | `diagrammes-page.tsx` | Génération libre IA | Répondre librement à la demande de l'utilisateur |
| `improvement` | `apa-composer-page.tsx` | Amélioration de citation/référence | Améliorer la qualité d'une citation ou référence |
| `revue-litterature` | `outils-slr-page.tsx` | Synthèse de revue de littérature | Synthétiser et analyser des éléments de revue de littérature |

**Note** : Les prompts système exacts devront être rédigés avec soin — la qualité de ces prompts détermine directement la qualité de la sortie IA. Il est possible que les pages appelantes construisent des `context` spécifiques via `buildSystemPrompt()` (comme le fait Harper) ; cela devra être vérifié au cas par cas.

### Fichiers concernés

- `src/data/ai-writing-modes.ts` (ajout de 5 entrées)
- Potentiellement les 5 pages appelantes (si ajustement du prompt nécessaire)

### Risque

| Risque | Niveau | Mitigation |
|---|---|---|
| Prompt système inadapté | 🟡 Moyen | Tester chaque mode manuellement après ajout |
| Conflit avec un prompt `context` existant construit par la page | 🟢 Faible | Vérifier chaque page appelante |

### Effort estimé

~1.5h (5 entrées à créer avec prompts adaptés, peu de code, beaucoup de réflexion sur les prompts).

### Critères de clôture

- Les 5 modes existent dans `WRITING_MODES` (17 modes au total)
- Chaque mode appelé depuis sa page retourne 200 (test manuel ou automatisé)
- `npx next build` ✅, `npx vitest run` 0 échec

---

## Lot 9 — Phase C : BUG-08, 09, 10 (revérification + correction) + BUG-18, 20

### Périmètre

Revérifier avec preuve les 3 bugs annoncés corrigés par le Lot 2 (dont les rapports sont non fiables), puis corriger ce qui s'avère réellement non résolu. Corriger également BUG-18 et BUG-20.

### Contenu précis

**Étape 1 — Revérification avec preuve (aucune correction tant que la vérification n'est pas faite)** :

| Bug | Vérification à faire | Si confirmé non résolu |
|---|---|---|
| BUG-08 | Lire `editor-page.tsx` : `onAddChapter` est-il passé à `ChapterTabs` ? | Le passer (prop optionnelle existante dans le composant) |
| BUG-09 | `rg -i 'drag\|sortable\|dnd' src/modules/editor/` : du code de réordonnancement existe-t-il ? | Implémenter un drag & drop de chapitres (library recommandée : `@dnd-kit/core`) |
| BUG-10 | `app-store.ts` : le champ `directorChatContext` existe-t-il ? Est-il passé à `DirecteurChatPanel` ? | Ajouter le champ au store + le passer au composant |

**Étape 2 — Corrections ciblées** :

| Bug | Correction | Fichier(s) |
|---|---|---|
| BUG-18 | Ajouter les champs `email` et `laboratory` au formulaire de création de thèse | `create-thesis-dialog.tsx` |
| BUG-20 | Améliorer le fallback du parsing grammaire : au lieu de `{ errors: [], totalErrors: 0 }`, retenter avec un parsing plus tolérant ou afficher un message d'erreur explicite | `grammaire-page.tsx` |

### Fichiers concernés

- `src/modules/editor/editor-page.tsx` (BUG-08)
- `src/modules/editor/components/chapter-tabs.tsx` (BUG-08)
- `src/modules/editor/components/chapter-header.tsx` (BUG-08, 09)
- `src/lib/stores/app-store.ts` (BUG-10)
- `src/modules/ai-writing/ai-writing-page.tsx` (BUG-10)
- `src/modules/editor/components/create-thesis-dialog.tsx` (BUG-18)
- `src/modules/grammaire/grammaire-page.tsx` (BUG-20)

### Risque

| Risque | Niveau | Mitigation |
|---|---|---|
| BUG-09 (drag & drop) est un travail conséquent | 🟠 Élevé | Si l'effort est trop important, le scinder en un lot dédié |
| BUG-10 (directorChatContext) modifie le store central | 🟡 Moyen | Modification limitée à un champ, pas de refactoring |

### Effort estimé

~3-4h (variable selon l'état réel des 3 bugs Lot 2 ; BUG-09 pouvant consommer 2h seul).

### Critères de clôture

- BUG-08, 09, 10 : statut réel établi avec preuve, correction si nécessaire
- BUG-18, 20 : corrigés avec preuve
- `npx next build` ✅, `npx vitest run` 0 échec, `bun run lint` 0 erreur

---

## Lot 10 — Phase D : Nettoyage (BUG-21, 22, 26, 27, 28, 29, 30, 31, 32, 34 + DT-05 à 10)

### Périmètre

Lot de nettoyage groupé pour les bugs mineurs et la dette technique restante. Peut être scindé en deux sous-lots si le périmètre est trop large.

### Contenu précis

**Bugs mineurs (10)** :

| Bug | Correction | Effort |
|---|---|---|
| BUG-21 | Ajouter un export SVG/PNG aux diagrammes | Moyen |
| BUG-22 | Intégrer un moteur de rendu visuel (Mermaid ou React Flow) | 🟠 Élevé — **à isoler en lot dédié si retenu** |
| BUG-26 | Ajouter l'icône `SpellCheck` dans `ICON_MAP` | Trivial |
| BUG-27 | Créer un mode IA dédié `auto-edition-8c` ou corriger l'appel | Faible |
| BUG-28 | Ajouter `tags` dans la clause `OR` de recherche des entrées | Trivial |
| BUG-29 | Ajouter `immediatelyRender: false` au `useEditor()` | Trivial |
| BUG-30 | Ajouter `VisuallyHidden DialogDescription` dans les 3 instances | Trivial |
| BUG-31 | Ajouter un try/catch pour `SyntaxError` → 400 dans thesis/route.ts | Trivial |
| BUG-32 | Ajouter `instanceof z.ZodError` dans ai-writing/route.ts | Trivial |
| BUG-34 | Ajouter une validation `maxLength` dans auto-edition-page.tsx | Trivial |

**Dette technique (6)** :

| DT | Action | Décision nécessaire |
|---|---|---|
| DT-05 | Ajouter une route GET pour lister les chunks DocumentChunk | Non — peut rester interne au service RAG |
| DT-06 | **Reporté** — c'est la décision E2, pas une correction technique | Validation commanditaire |
| DT-07 | (Optionnel) Remplacer `window.print()` par html2pdf.js ou jsPDF | Non urgent — `window.print()` peut être un choix délibéré |
| DT-08 | (Optionnel) Rendre RoutesMe vraiment multi-fournisseur | Non urgent — nécessite une refonte de l'architecture provider |
| DT-09 | (Optionnel) Utiliser CustomBookSkill ou le supprimer du schéma | Non urgent — modèle inoffensif |
| DT-10 | (Optionnel) Rendre les fiches corpus consultables dans l'UI | Non urgent — fonctionnalité nouvelle, pas un bug |

### Divergence avec la priorisation proposée

**BUG-22 (moteur de rendu visuel pour diagrammes)** est classé « mineur » dans l'audit mais son effort est **élevé** (intégration d'une bibliothèque de rendu graphique complète). Je recommande de le **retirer de ce lot** et de le classer dans le catalogue Horizon 2/3 comme décision produit (E-Cat), sauf si le commanditaire le priorise explicitement.

**DT-05 à DT-10** sont des améliorations potentielles, pas des bugs bloquants. La plupart peuvent être des **choix assumés** (ex. `window.print()` peut être voulu, CustomBookSkill inoffensif, corpus interne au service RAG). Je recommande de les **recenser avec un statut « à décider »** plutôt que de les corriger systématiquement.

### Fichiers concernés

- `src/modules/diagrammes/diagrammes-page.tsx` (BUG-21, potentiellement 22)
- `src/modules/ai-writing/ai-writing-page.tsx` (BUG-26)
- `src/modules/auto-edition/auto-edition-page.tsx` (BUG-27, 34)
- `src/app/api/entries/route.ts` (BUG-28)
- `src/modules/editor/extensions/tiptap-editor.tsx` (BUG-29)
- `src/components/ui/dialog.tsx`, `src/modules/apa-composer/apa-composer-page.tsx` (BUG-30)
- `src/app/api/thesis/route.ts` (BUG-31)
- `src/app/api/ai-writing/route.ts` (BUG-32)

### Risque

| Risque | Niveau | Mitigation |
|---|---|---|
| Lot trop large | 🟡 Moyen | Scinder en deux sous-lots si nécessaire |
| BUG-22 fait exploser l'effort | 🟠 Élevé | Isoler en lot dédié ou reporter |

### Effort estimé

~2-3h hors BUG-22 (~30min pour les 7 corrections triviales + ~1.5h pour BUG-21 + ~1h pour vérifications DT).

### Critères de clôture

- Les corrections triviales (BUG-26, 27, 28, 29, 30, 31, 32, 34) sont appliquées avec preuve
- BUG-21 (export diagrammes) : corrigé ou reporté avec justification
- BUG-22 : statut tranché (corrigé dans ce lot / isolé / reporté)
- DT-05 à 10 : statut documenté (corrigé / choix assumé / reporté)
- `npx next build` ✅, `npx vitest run` 0 échec, `bun run lint` 0 erreur

---

## Résumé du séquencement proposé

| Lot | Phase | Contenu | Effort estimé | Risque | Dépendance |
|---|---|---|---|---|---|
| **7** | A — Intégrité | Migration `parentId` → `partId` FK Prisma | ~2h | Moyen | Aucune |
| **8** | B — IA cassée | 5 modes IA manquants dans WRITING_MODES | ~1.5h | Faible | Aucune |
| **9** | C — Bugs majeurs | Revérif. BUG-08/09/10 (Lot 2) + correction BUG-18, 20 | ~3-4h | Moyen-Élevé | Aucune (mais Lot 7 modifie le schéma — exécuter Lot 7 avant Lot 9 pour éviter les conflits) |
| **10** | D — Nettoyage | 8-10 bugs mineurs + tri DT-05 à 10 | ~2-3h | Faible-Moyen | Aucune |

### Ordre recommandé : 7 → 8 → 9 → 10

- **Lot 7 avant Lot 9** : la migration du schéma Prisma doit être stabilisée avant de toucher l'éditeur (qui lit les données de Chapter)
- **Lot 8 indépendant** : peut être exécuté en parallèle de Lot 7 ou 9 (pas de conflit de fichiers)
- **Lot 10 indépendant** : peut être exécuté à tout moment après Lot 7

### Divergences factuelles avec la priorisation du document de gouvernance

1. **Aucune divergence sur la Phase A** — la migration parentId→partId est bien la priorité la plus élevée (seul élément d'intégrité référentielle).

2. **Phase B (5 modes IA)** confirmée comme bon rapport effort/valeur — correction mécanique, même schéma que les 3 modes déjà corrigés (BUG-04, 11, 13).

3. **Phase C** : la recommandation du document de gouvernance de « revérifier avant de corriger » pour BUG-08/09/10 est exactement la bonne approche. J'ajoute BUG-18 et BUG-20 à ce lot car ils sont de correction ciblée et ne justifient pas un lot dédié.

4. **Phase D** : je recommande d'exclure BUG-22 (moteur de rendu visuel) de ce lot. Son effort est disproportionné par rapport aux autres items. Le classer dans les décisions produit (E-Cat).

5. **DT-05 à 10** : je recommande de ne pas les traiter comme des corrections automatiques mais de les documenter avec un statut « choix assumé ou à décider ». La plupart ne sont pas des bugs mais des améliorations potentielles qui nécessitent un arbitrage produit.

---

*Proposition produite pour validation. Aucun lot ne démarrera sans accord préalable du commanditaire.*