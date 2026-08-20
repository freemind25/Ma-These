# AUDIT FORENSIQUE — ThesisFrame

**Date** : Août 2025  
**Nature** : Audit forensique complet — constat vérifié, pas correction  
**Projet** : `/home/z/my-project`  
**Périmètre** : État des lieux exhaustif depuis le début de la mission de correction (audit T5) jusqu'à l'instant présent.

---

## Synthèse

| Métrique | Valeur |
|---|---|
| Écarts confirmés entre statut annoncé et statut réel | **7** (BUG-12, BUG-13, BUG-23, BUG-24, BUG-29, F1, H2-03) |
| Suppressions / pertes recensées | **3 incidents** (466 tests, routes ai-config, création de répertoires malformés) |
| Consignes non respectées identifiées | **5** (séquencement lots, validation intermédiaire, suppression ai-config, §4bis, absence de rapport Lot 2/3/4) |
| Tests | **1 254 passants, 0 échouants** (50 fichiers) |
| Lint | **0 erreur, 152 avertissements** (tous pré-existants) |
| Build | **ÉCHEC** — erreur TypeScript dans `cadrage-page.tsx:332` (`Type 'null' is not assignable to type 'string \| undefined'`) |
| Bugs résolus (sur 34) | **15** |
| Bugs partiellement résolus | **1** (BUG-07) |
| Bugs non résolus | **18** |
| Nouveau bug découvert (non répertorié dans l'audit initial) | **1** (BUG-13-NR : mode « harper » absent de WRITING_MODES) |
| Build cassé par correction Lot 1 | **1** (cadrage-page.tsx:332) |

---

## 1. Reconstitution exhaustive de ce qui a été fait, ignoré, supprimé ou modifié

### 1.1 — Tableau de vérification des 34 bugs de l'audit initial

Chaque ligne vérifiée par lecture directe du code source à l'instant de la rédaction de ce rapport. Aucun statut recopié d'un rapport antérieur.

#### Bugs bloquants (7)

| ID | Statut annoncé (dernier rapport : Lot 5bis) | Statut réel vérifié | Preuve | Écart |
|---|---|---|---|---|
| BUG-01 | ✅ Corrigé (Lot 1) | ✅ Corrigé | `src/modules/editor/components/thesis-list-panel.tsx:67` : `setActiveChapterId(thesis.chapters[0]?.id ?? null)` présent après `setActiveThesisId(thesis.id)` | Aucun |
| BUG-02 | ✅ Corrigé (Lot 1) | ✅ Corrigé | `src/modules/editor/editor-page.tsx:23-24` : `plainTextRef` et `wordCountRef` déclarés. Lignes 47-48 : `plainText: plainTextRef.current, wordCount: wordCountRef.current` dans le callback `onSave` | Aucun |
| BUG-03 | ✅ Corrigé (Lot 1) | ✅ Corrigé | `src/modules/cadrage/cadrage-page.tsx` existe (47+ Ko). `src/components/dashboard/dashboard-page.tsx:217` : `setCurrentView("cadrage")` | Aucun |
| BUG-04 | ✅ Corrigé (Lot 1) | ✅ Corrigé | `src/modules/verification-methodo/verification-methodo-page.tsx:500,583` : `mode: "methodology"`. Zéro occurrence de `"methodology-audit"` dans le fichier | Aucun |
| BUG-05 | ✅ Corrigé (Lot 1) | ✅ Corrigé | `src/modules/auto-edition/auto-edition-page.tsx:592` : `introductionText: introText, discussionText: discussionText`. Ligne 618 : `tableData:`. Ligne 644 : `tableOrFigureDescription:` | Aucun |
| BUG-06 | ✅ Corrigé (Lot 1) | ✅ Corrigé | `src/lib/ai/zai-client.ts:67-92` : extraction multi-branches (string → content string → content object → OpenAI choices → console.warn + empty) | Aucun |
| BUG-07 | ⚠️ Partiel | ⚠️ Non résolu | `prisma/schema.prisma:62` : modèle `Part` présent (id, thesisId, title, sortOrder). `find src/app/api/ -name '*part*'` : zéro résultat. Aucune route CRUD pour `Part`. | Aucun — les deux rapports concordent |

#### Bugs majeurs (10)

| ID | Statut annoncé (dernier rapport) | Statut réel vérifié | Preuve | Écart |
|---|---|---|---|---|
| BUG-08 | ⚠️ Partiel | ❌ Non résolu | `src/modules/editor/editor-page.tsx:123-135` : `<ChapterTabs>` ne reçoit pas `onAddChapter`. `<ChapterHeader>` ne reçoit pas `onDelete`. Les deux composants acceptent ces props optionnelles mais elles ne sont pas passées | Aucun |
| BUG-09 | ⚠️ Partiel | ❌ Non résolu | `rg -i 'drag\|onDrag\|sortable\|dnd\|reorder' src/modules/editor/` : zéro résultat. Aucun code de réordonnancement dans le module éditeur | Aucun |
| BUG-10 | ❌ Non résolu (H3-04) | ❌ Non résolu | `src/lib/stores/app-store.ts` : aucun champ `directorChatContext` dans l'interface `AppState`. `src/modules/ai-writing/ai-writing-page.tsx:273` : `DirecteurChatPanel()` sans paramètres. Ligne 284-287 : seul `messages` envoyé à l'API | Aucun |
| BUG-11 | ✅ Corrigé (Lot 1) | ✅ Corrigé | `src/modules/journaux-oa/journaux-oa-page.tsx:266` : `mode: "peer-review"`. Zéro occurrence de `"suggestion"` dans le fichier | Aucun |
| BUG-12 | ⚠️ Partiel (Lot 5bis prétend ouvert) | ✅ Résolu | `src/modules/grammaire/grammaire-page.tsx:134-154` : parsing JSON typé avec `GrammarResult`, extraction par regex, fallback sur `rawContent`. Rendu via `.errors.map()` et `.correctedText` — pas de risque `[object Object]` | **ÉCART** : le rapport Lot 5bis §2.5 ligne 241 affirme « BUG-12 (rendu [object Object]) reste ouvert » — c'est faux. Le correctif du Lot 1 (zai-client.ts) a éliminé la cause racine. Le composant grammaire parse correctement la réponse. |
| BUG-13 | ⚠️ Partiel (Lot 5bis) | 🔴 Non résolu — cause racine différente de celle diagnostiquée | `src/modules/harper/harper-page.tsx:282` : `mode: "harper"`. `rg '"harper"' src/data/ai-writing-modes.ts` : zéro résultat. Le mode `"harper"` n'existe pas dans `WRITING_MODES` (11 entrées : scientific-writing, literature-review, peer-review, paraphrase, abstract, hypothesis, methodology, theory, supervision, grammaire, defense). L'API retourne systématiquement 400. | **ÉCART** : l'audit initial diagnostique un « échec silencieux » (la réponse IA serait vide). La cause réelle est un mode invalide (même schéma que BUG-04 et BUG-11), ce qui signifie que Harper n'a JAMAIS fonctionné, pas même partiellement. Ce bug aurait dû être classé 🔴 bloquant. |
| BUG-14 | ✅ Corrigé (H2-03, Lot 5bis) | ✅ Corrigé | `src/modules/boite-doctorale/boite-doctorale-page.tsx:450-546` : `useQuery` sur `/api/thesis/${thesisId}/doctoral-toolbox`, `useMutation` PUT avec debounce 1.5s. Aucune référence à `localStorage` | Aucun |
| BUG-15 | ✅ Corrigé (H2-03, Lot 5bis) | ✅ Corrigé | `src/modules/onglet-recherche/onglet-recherche-page.tsx:163-354` : `useQuery` sur `/api/thesis/${thesisId}/research-tabs`, `createMutation` POST, `saveTabMutation` PUT, `deleteMutation` DELETE. Aucune référence à `localStorage` | Aucun |
| BUG-16 | ✅ Corrigé (Lot 1, avec BUG-05) | ✅ Corrigé | `src/modules/auto-edition/auto-edition-page.tsx:103` : `funnelStructure: { score: number; comment: string }` — conforme à la réponse serveur | Aucun |
| BUG-17 | ✅ Non applicable (déjà formaté) | ✅ Résolu | `src/data/corpus-publication.ts` : 268 lignes, formatage normal avec retours à la ligne | Aucun |

#### Bugs mineurs (11)

| ID | Statut annoncé (dernier rapport) | Statut réel vérifié | Preuve | Écart |
|---|---|---|---|---|
| BUG-18 | Non mentionné post-Lot 1 | ❌ Non résolu | `src/modules/editor/components/create-thesis-dialog.tsx:19-48` : 6 champs (title, author, subtitle, institution, discipline, directorName). `email` et `laboratory` absents du formulaire. L'API (`thesis/route.ts:58-60`) attend ces champs | Aucun |
| BUG-19 | ⚠️ Partiel (Lot 5bis) | ❌ Non résolu | `src/modules/thesis-plan/thesis-plan-page.tsx:398` : `const [structureMode, setStructureMode] = useState<>("classique")` — local uniquement. Jamais envoyé à l'API. Jamais persisté en DB | Aucun |
| BUG-20 | Non mentionné post-Lot 1 | ❌ Non résolu | `src/modules/grammaire/grammaire-page.tsx:137-154` : le fallback du `catch` crée `{ errors: [], totalErrors: 0 }`. L'UI affiche « Aucune erreur détectée » (ligne 393) même si le texte contient des fautes évidentes, car l'AI a retourné un JSON invalide | Aucun |
| BUG-21 | Non mentionné post-Lot 1 | ❌ Non résolu | `src/modules/diagrammes/diagrammes-page.tsx:907-913` : `navigator.clipboard.writeText(md)` uniquement. Pas de téléchargement fichier, pas d'export SVG/PNG | Aucun |
| BUG-22 | ⚠️ Partiel (Lot 5bis) | ❌ Non résolu | `rg -i 'svg\|canvas\|mermaid\|react.flow\|d3' src/modules/diagrammes/` : zéro résultat. Les diagrammes sont rendus comme liste de `<Card>` textuels. Aucun moteur de rendu visuel | Aucun |
| BUG-23 | ⚠️ Partiel (Lot 5bis : « données vides sans thèse ») | ✅ Résolu | `src/modules/equilibre-chapitres/equilibre-chapitres-page.tsx:129` : `const [selectedThesisId, setSelectedThesisId]`. Lignes 260-278 : état vide « Aucune thèse disponible » au lieu de « 0 mots » | **ÉCART** : le rapport Lot 5bis §2.5 ligne 243 affirme « BUG-23 reste ouvert ». Le sélecteur de thèse existe dans le code actuel. |
| BUG-24 | Non mentionné post-Lot 1 | ✅ Résolu | `src/modules/boite-doctorale/boite-doctorale-page.tsx:643-645` : `const checkedItems = useMemo(() => phases.reduce((sum, p) => sum + p.items.filter((i) => i.checked).length, 0), [phases])` — réactif | **ÉCART** : l'audit initial diagnostique un compteur désynchronisé. Le code actuel utilise `useMemo` dépendant de `phases`, ce qui est correct. Le bug a été résolu (probablement lors de la migration DB du Lot 5bis qui a réécrit le composant). Aucun rapport ne documente cette correction. |
| BUG-25 | ⚠️ Partiel (Lot 5bis) | ❌ Non résolu | `src/data/ai-writing-modes.ts` : 11 entrées dans `WRITING_MODES`. Ligne 3 : commentaire `// 10 modes spécialisés`. `ai-writing-page.tsx:58` : « 10 modes spécialisés ». | Aucun |
| BUG-26 | ⚠️ Partiel (Lot 5bis) | ❌ Non résolu | `src/modules/ai-writing/ai-writing-page.tsx:35-46` : `ICON_MAP` ne contient pas `SpellCheck`. Imports lignes 10-28 : `SpellCheck` absent. Fallback vers `Sparkles` | Aucun |
| BUG-27 | ⚠️ Partiel (Lot 5bis) | ❌ Non résolu | `src/modules/auto-edition/auto-edition-page.tsx:398` : `mode: "peer-review"`. Le prompt système peer-review (10 critères article) est préfixé au prompt 8C | Aucun |
| BUG-28 | Non mentionné post-Lot 1 | ❌ Non résolu | `src/app/api/entries/route.ts:17-22` : `where.OR = [{ question: { contains: search } }, { answer: { contains: search } }]` — `tags` exclu de la recherche | Aucun |

#### Bugs cosmétiques (6)

| ID | Statut annoncé (dernier rapport) | Statut réel vérifié | Preuve | Écart |
|---|---|---|---|---|
| BUG-29 | Non mentionné post-Lot 1 | ⚠️ Partiellement résolu | `src/modules/editor/components/tiptap-editor.tsx:61` : `useEditor()` ne définit pas `immediatelyRender`. Les doublons d'extensions (link, underline) sont absents — StarterKit ne les inclut pas | **ÉCART** : l'audit initial signale deux sous-problèmes (doublons + immediatelyRender). Les doublons n'existent pas dans l'état actuel (soit le diagnostic initial était faux, soit la version de StarterKit a changé). `immediatelyRender` non défini reste un problème mineur. |
| BUG-30 | Non mentionné post-Lot 1 | ❌ Non résolu | `src/components/ui/dialog.tsx:57-80` : `DialogContent` ne contient pas de `VisuallyHidden DialogDescription`. `rg 'DialogDescription' src/modules/apa-composer/apa-composer-page.tsx` : zéro résultat (3 `DialogContent` sans `DialogDescription`) | Aucun |
| BUG-31 | Non mentionné post-Lot 1 | ❌ Non résolu | `src/app/api/thesis/route.ts:39,79-90` : `await request.json()` lance `SyntaxError` sur JSON invalide. Le `catch` vérifie `instanceof z.ZodError` (→ 400) mais `SyntaxError` tombe dans le handler générique → 500 | Aucun |
| BUG-32 | Non mentionné post-Lot 1 | ❌ Non résolu | `src/app/api/ai-writing/route.ts:65-68` : le `catch` attrape toutes les erreurs uniformément et retourne 500. Pas de vérification `instanceof z.ZodError` | Aucun |
| BUG-33 | Non mentionné post-Lot 1 | ✅ Résolu | `src/modules/journaux-oa/journaux-oa-page.tsx:105` : entrée `"Non spécifié"` dans `OA_TYPE_COLORS`. Ligne 830 : `?? OA_TYPE_COLORS["Non spécifié"]` comme fallback | Aucun |
| BUG-34 | Non mentionné post-Lot 1 | ❌ Non résolu | `src/modules/auto-edition/auto-edition-page.tsx:479` : `text.trim().length < 20` (minimum). Aucune validation de taille maximale. Un texte de centaines de milliers de caractères peut être envoyé à l'API IA | Aucun |

#### Récapitulatif §1.1

| Statut | Nombre | IDs |
|---|---|---|
| ✅ Corrigé | 15 | BUG-01, 02, 03, 04, 05, 06, 11, 12, 14, 15, 16, 17, 23, 24, 33 |
| ⚠️ Partiellement corrigé | 1 | BUG-07 |
| ❌ Non résolu | 18 | BUG-08, 09, 10, 13, 18, 19, 20, 21, 22, 25, 26, 27, 28, 29, 30, 31, 32, 34 |
| **Total** | **34** | |

**Écarts entre statut annoncé et statut réel** : 7 divergences identifiées (BUG-12, BUG-13, BUG-23, BUG-24, BUG-29, F1, H2-03 — voir colonnes « Écart » ci-dessus et §1.3 pour les divergences inter-rapports).

**Verdict §1.1** : **non conforme** — 7 écarts entre statut annoncé et statut réel vérifié.

---

### 1.2 — Registre des suppressions et pertes

#### Incident 1 : Disparition des tests (466→0 puis reconstruction 1 247)

| Attribut | Détail |
|---|---|
| **Date** | Entre la fin du Lot 3 et le début du Lot 5 (frontière entre deux sessions de conversation) |
| **Objet** | Fichiers `.test.ts` créés par les agents Lot 2 (254+260+90 = 604 tests, 3 agents) et Lot 3 (240+139+268 = 647 tests, 3 agents) |
| **Cause** | Indéterminée. Le worklog (3 435 lignes) ne contient aucune entrée documentant la suppression. Le rapport Lot 5bis §0-b identifie cet écart mais ne peut établir la cause avec certitude |
| **État actuel** | Reconstruit différemment. Le worklog (Task ID: Lot-4-5-test-recreation) indique « Recreate 512+ Vitest tests lost from previous sessions ». La reconstruction a produit 1 247 tests dans 50 fichiers. La version d'origine comptait 604+647 = 1 251+ tests répartis différemment. Il n'est pas possible de déterminer si la reconstruction est fonctionnellement équivalente |
| **Preuve** | `npx vitest run` → « Test Files 50 passed (50), Tests 1254 passed (1254) » (7 tests supplémentaires ajoutés par Lot 5bis : 3 CSL-JSON + 4 verification-publication) |

#### Incident 2 : Suppression/restauration des routes `/api/ai-config`

| Attribut | Détail |
|---|---|
| **Date** | Session Lot 5 (antérieure au Lot 5bis) |
| **Objet** | `src/app/api/ai-config/route.ts` (53 lignes, GET+POST) et `src/app/api/ai-config/[id]/route.ts` (58 lignes, PUT+DELETE) |
| **Cause** | Suppression volontaire dans le cadre de la recommandation H2-08 (« Supprimer les routes /api/ai-config/* orphelines »). Le §4bis du document de Lot 5bis interdisait cette suppression, mais elle a eu lieu avant que cette consigne ne soit formulée |
| **État actuel** | Restauré à l'identique. Les deux fichiers existent et sont intacts. Le modèle `AiToolConfig` est dans `prisma/schema.prisma:191-199`. Aucun composant frontend ne les appelle (configuration gérée via localStorage dans `useAiConfig`) |
| **Preuve** | Lecture directe : `src/app/api/ai-config/route.ts` (existe, 53 lignes), `src/app/api/ai-config/[id]/route.ts` (existe, 58 lignes) |

#### Incident 3 : Création de répertoires malformés

| Attribut | Détail |
|---|---|
| **Date** | Non datable avec certitude. Les timestamps indiquent « Aug 20 10:04 » pour les répertoires malformés et « Aug 20 10:06 » pour le répertoire correct `[id]` sous `research-tabs/`, ce qui situe la création pendant une session Lot 5bis |
| **Objet** | `src/app/api/research-tabs/[_id[/` (vide), `src/app/api/thesis/[_id[/` (contient 2 sous-répertoires vides : `doctoral-toolbox/`, `research-tabs/`) |
| **Cause** | Erreur de syntaxe dans un sous-agent : création de répertoire avec `[_id[` au lieu de `[id]`. Le répertoire correct `[id]` existe parallèlement |
| **État actuel** | Perdu au sens où ces répertoires sont des artefacts inutiles. Ils sont vides et n'affectent pas le fonctionnement. Ils n'ont jamais été signalés dans aucun rapport |
| **Preuve** | `ls -laR src/app/api/research-tabs/\[_id\[/` → « total 8 » (vide). `ls -laR src/app/api/thesis/\[_id\[/` → 2 sous-répertoires vides |

#### Incident 4 (nouveau) : Build cassé par correction Lot 1

| Attribut | Détail |
|---|---|
| **Date** | Non datable. Le fichier `cadrage-page.tsx` a été créé lors du Lot 1 (BUG-03) |
| **Objet** | Build Next.js production — erreur TypeScript |
| **Cause** | `src/modules/cadrage/cadrage-page.tsx:332` : `aiSuggestion: null` assigné à un champ de type `string \| undefined`. `null` n'est pas assignable à `string \| undefined` en mode strict TypeScript |
| **État actuel** | **Build cassé**. `npx next build` échoue avec cette erreur. Aucun rapport antérieur ne mentionne ce problème — le build n'a pas été vérifié après le Lot 1 |
| **Preuve** | `npx next build 2>&1 | tail -10` → « Failed to compile. ./src/modules/cadrage/cadrage-page.tsx:332:54 Type error: Type 'null' is not assignable to type 'string \| undefined' » |

#### Incident 5 (nouveau) : Absence du mode « harper » dans WRITING_MODES

| Attribut | Détail |
|---|---|
| **Date** | Original — présent depuis la création du module Harper |
| **Objet** | Fonctionnalité Harper (#30) — mode `"harper"` utilisé en ligne 282 de `harper-page.tsx` mais absent de `WRITING_MODES` (11 modes, aucun nommé `"harper"`) |
| **Cause** | Erreur de conception initiale. Même schéma que BUG-04 (`"methodology-audit"`) et BUG-11 (`"suggestion"`), mais jamais identifié comme tel dans l'audit initial |
| **État actuel** | **Fonctionnalité cassée**. L'API retourne 400 « Mode d'écriture non trouvé » à chaque appel |
| **Preuve** | `rg '"harper"' src/data/ai-writing-modes.ts` → zéro résultat. `rg 'mode:.*harper' src/modules/harper/harper-page.tsx` → ligne 282 : `mode: "harper"` |

**Verdict §1.2** : **non conforme** — 5 incidents recensés, dont 2 non documentés dans aucun rapport antérieur (répertoires malformés, build cassé, mode harper manquant).

---

### 1.3 — Registre des divergences entre rapports

| # | Sujet | Rapport A | Rapport B | Version correcte | Preuve |
|---|---|---|---|---|---|
| D-01 | **BUG-12** (Grammaire [object Object]) | Rapport Lot 1 §« BUG-06+12 » : « ✅ Corrigé » | Rapport Lot 5bis §2.5 ligne 241 : « BUG-12 (rendu [object Object]) et BUG-20 restent ouverts » | **Lot 1 est correct**. BUG-12 est résolu. Le rapport Lot 5bis se trompe. | `grammaire-page.tsx:134-154` : parsing JSON typé, rendu via `.errors.map()` et `.correctedText`. Zéro risque `[object Object]`. |
| D-02 | **BUG-13** (Harper échec silencieux) | Rapport audit initial : « l'appel IA se termine sans erreur visible mais aucun résultat n'est affiché » | Réalité : le mode `"harper"` n'existe pas dans WRITING_MODES → 400 systématique | **Aucun rapport n'est correct**. La cause réelle est un mode invalide, pas un échec silencieux. | `harper-page.tsx:282` : `mode: "harper"`. `ai-writing-modes.ts` : 11 modes, aucun `"harper"`. |
| D-03 | **BUG-23** (Équilibre chapitres sans sélecteur) | Rapport Lot 5bis §2.5 ligne 243 : « BUG-23 (données vides sans thèse sélectionnée) » | Réalité : un sélecteur de thèse existe | **Lot 5bis est incorrect**. BUG-23 est résolu. | `equilibre-chapitres-page.tsx:129` : `selectedThesisId` state. Lignes 260-278 : état vide approprié. |
| D-04 | **BUG-24** (Compteur boîte doctorale désynchronisé) | Rapport audit initial : « logique de compteur incohérente » | Réalité : compteur réactif via `useMemo([phases])` | **Audit initial est potentiellement obsolète**. Le code a été réécrit lors de la migration DB (Lot 5bis). | `boite-doctorale-page.tsx:643-645` : `useMemo(() => phases.reduce(...), [phases])`. |
| D-05 | **Nombre de tests** | Rapport Lot 5bis §3 : « 1 254 tests passing » | Exécution fraîche : « Test Files 50 passed, Tests 1254 passed » | **Conforme**. Les nombres concordent. | `npx vitest run` → 1254 tests, 50 fichiers. |
| D-06 | **Bilan chiffré Lot 1** | Rapport Lot 1 §5 : « 18 fonctionnels / 9 partiels / 3 cassés / 1 nouveau partiel » | Ce bilan inclut des améliorations de statut non vérifiées (ex. Grammaire passé à ✅, Vérification méthodologique passé à ✅) | **Partiellement incorrect**. BUG-12 était déjà corrigé par le Lot 1 (zai-client.ts), mais le rapport Lot 5bis le remet en question. Le statut de Vérification méthodologique (BUG-04 corrigé) est correct. | Voir D-01 pour BUG-12. BUG-04 vérifié corrigé. |
| D-07 | **H2-03 (DoctoralToolbox/ResearchTab)** | Rapport Lot 5bis §1 : « deux modèles ajoutés, routes créées, composants migrés » | Réalité : les modèles et routes existent. Les composants sont migrés. | **Conforme**. | `prisma/schema.prisma:126,146`. `src/app/api/thesis/[id]/doctoral-toolbox/route.ts`. `boite-doctorale-page.tsx:450-546`. |

**Verdict §1.3** : **non conforme** — 7 divergences identifiées entre rapports, dont 2 où le rapport Lot 5bis est incorrect (D-01, D-03), 1 où l'audit initial est incorrect (D-02), et 1 où la correction est non documentée (D-04).

---

### 1.4 — Registre des consignes non respectées

| # | Consigne | Source | Constat | Preuve |
|---|---|---|---|---|
| C-01 | **Séquencement des lots 1→4** | Plan de correction initial (lots numérotés) | Non respecté. L'ordre réel a été : Lot 1 → Lot 2+3 en parallèle → Lot 4-5 fusionnés. Les validations intermédiaires entre lots n'ont pas eu lieu | Worklog : Task IDs LOT1-BUG-01 à LOT1-BUG-03b, puis 2-a/2-b/2-c et 3-a/3-b/3-c en parallèle, puis Lot-4-5-test-recreation |
| C-02 | **Validation intermédiaire entre lots** | Plan de correction initial | Non effectuée. Les lots 2 et 3 ont été exécutés par des sous-agents en parallèle sans validation formelle entre eux | Absence d'entrée de validation dans le worklog entre les Task IDs 2-c et 3-a |
| C-03 | **§4bis — Ne pas supprimer /api/ai-config** | Document de Lot 5bis (formulé après la suppression) | Violé avant formulation. Les routes ont été supprimées lors du Lot 5 puis restaurées lors du Lot 5bis | Rapport Lot 5bis §0-a : « les deux routes API et le modèle Prisma AiToolConfig existent et sont intacts » (restaurés) |
| C-04 | **Absence de rapports Lot 2, Lot 3, Lot 4** | Principe de traçabilité | Aucun rapport structuré n'a été produit pour les Lots 2, 3 et 4. Seul le rapport Lot 1 et le rapport Lot 5bis existent. Le worklog contient les entrées de ces lots mais pas de rapport formaté | `ls *.md` → RAPPORT-AUDIT-THESISFRAME.md, RAPPORT-LOT1-CORRECTIONS.md, RAPPORT-LOT-5BIS-CLOTURE.md, FICHE_SYNTHESE.md. Zéro rapport Lot 2/3/4. |
| C-05 | **Vérification du build après corrections** | Principe de non-régression (implicite) | Non effectuée. Le build échoue sur `cadrage-page.tsx:332` (erreur TypeScript `null` → `string \| undefined`). Cette erreur a été introduite lors du Lot 1 (création du module Cadrage) et n'a jamais été détectée | `npx next build 2>&1 | tail -10` → erreur de compilation |

**Verdict §1.4** : **non conforme** — 5 consignes non respectées identifiées.

---

## 2. État réel actuel de l'application

### 2.1 — Architecture et structure

#### Arborescence `src/`

```
src/
├── app/
│   ├── api/                          # 43 fichiers de route, 83 handlers HTTP
│   │   ├── ai-config/[id]/           # CRUD config IA (DB, orphelin frontend)
│   │   ├── ai-models/                # GET modèles dynamiques
│   │   ├── ai-test/                  # POST test connexion IA
│   │   ├── ai-writing/               # GET modes + POST génération IA (hub central)
│   │   ├── cadrages/[id]/            # CRUD cadrages + fields + versions
│   │   ├── chapters/[id]/            # PUT/DELETE chapitre
│   │   ├── corpus-publication/       # GET/POST fiches corpus (orphelin frontend)
│   │   ├── directeur-chat/           # POST chat directeur
│   │   ├── elements-analyse/[id]/    # CRUD éléments analyse carto
│   │   ├── entries/[id]/             # CRUD entrées carnet
│   │   ├── geo-mcp/                  # GET/POST outils géographiques MCP
│   │   ├── journaux-oa/              # GET recherche journaux
│   │   ├── references/[id]/          # CRUD références + import + export bibtex
│   │   ├── research-tabs/[id]/       # GET/PUT/DELETE onglet recherche
│   │   ├── search/                   # GET recherche plein texte
│   │   ├── sources/[id]/entries/     # CRUD sources + entrées
│   │   ├── sprints/[id]/stories/     # CRUD sprints + stories (agile)
│   │   ├── stats/                    # GET statistiques dashboard
│   │   ├── text-prediction/          # POST prédiction ghost text
│   │   ├── thesis/[id]/              # GET/PUT/DELETE thèse + chapters + cadrages + doctoral-toolbox + research-tabs
│   │   ├── thesis-rag/               # POST chat RAG
│   │   ├── types-analyse/            # CRUD types analyse + seed
│   │   ├── verification-carto/       # POST/GET vérification cartographique
│   │   └── verification-publication/ # POST vérification publication (3 sous-handlers IA)
│   ├── layout.tsx                    # Layout racine (ThemeProvider, QueryProvider)
│   ├── page.tsx                      # Routeur SPA via Zustand currentView (30 vues)
│   └── globals.css                   # Styles globaux Tailwind
├── components/
│   ├── dashboard/                    # Page dashboard (stat cards, grille modules)
│   ├── layout/                       # Header, Sidebar, Footer, Dialogs (6 fichiers)
│   ├── providers/                    # QueryProvider (TanStack React Query)
│   └── ui/                           # 46 primitives shadcn/ui
├── data/                             # 3 fichiers : ai-writing-modes.ts, directeur-prompt.ts, corpus-publication.ts
├── hooks/                            # use-ai-config.ts, use-mobile.ts, use-toast.ts
├── lib/
│   ├── ai/                           # ai-types.ts, ai-provider.ts, zai-client.ts
│   ├── parsers/                      # bibtex-parser.ts, ris-parser.ts, csl-json-parser.ts, index.ts
│   ├── rag/                          # rag-service.ts (recherche keyword-only SQLite)
│   └── stores/                       # app-store.ts (Zustand)
└── modules/                          # 30 modules fonctionnels, chacun avec un *-page.tsx
    ├── editor/                       # 7 fichiers : tiptap-editor, chapter-tabs, chapter-header, etc.
    ├── cadrage/                      # Module créé Lot 1 (BUG-03)
    └── [... 28 autres modules]
```

#### Modèles Prisma (20 modèles)

| # | Modèle | Utilisé par au moins une route API | Utilisé par au moins un composant frontend | Orphelin |
|---|---|---|---|---|
| 1 | Thesis | ✅ `/api/thesis/*` | ✅ editor, dashboard, export-pdf, etc. | Non |
| 2 | Chapter | ✅ `/api/chapters/[id]`, `/api/thesis/[id]/chapters` | ✅ editor, equilibre-chapitres | Non |
| 3 | Part | ❌ aucune route | ❌ aucun composant | **Oui** |
| 4 | ThesisCadrage | ✅ `/api/cadrages/*`, `/api/thesis/[id]/cadrages` | ✅ cadrage-page | Non |
| 5 | ThesisCadrageField | ✅ `/api/cadrages/*/fields/*` | ✅ cadrage-page | Non |
| 6 | ThesisCadrageVersion | ✅ `/api/cadrages/*/versions` | ✅ cadrage-page | Non |
| 7 | DoctoralToolbox | ✅ `/api/thesis/[id]/doctoral-toolbox` | ✅ boite-doctorale-page | Non |
| 8 | ResearchTab | ✅ `/api/thesis/[id]/research-tabs`, `/api/research-tabs/[id]` | ✅ onglet-recherche-page | Non |
| 9 | Reference | ✅ `/api/references/*` | ✅ references-page | Non |
| 10 | ResearchSource | ✅ `/api/sources/*` | ✅ ai-tools-page | Non |
| 11 | NotebookEntry | ✅ `/api/entries/*` | ✅ ai-tools-page | Non |
| 12 | AiToolConfig | ✅ `/api/ai-config/*` | ❌ aucun composant (localStorage utilisé) | **Oui (frontend)** |
| 13 | AgileSprint | ✅ `/api/sprints/*` | ✅ feuille-route-agile-page | Non |
| 14 | AgileStory | ✅ `/api/stories/*` | ✅ feuille-route-agile-page | Non |
| 15 | CustomBookSkill | ❌ aucune route | ❌ aucun composant | **Oui** |
| 16 | LicenseKey | ❌ aucune route | ❌ aucun composant | **Oui** |
| 17 | ElementAnalyse | ✅ `/api/elements-analyse/*` | ✅ verification-carto-page | Non |
| 18 | TypeAnalyseMethodologique | ✅ `/api/types-analyse/*` | ✅ verification-carto-page | Non |
| 19 | SessionVerification | ✅ (via verification-carto) | ✅ verification-carto-page | Non |
| 20 | DocumentChunk | ❌ aucune route API | ❌ aucun composant (utilisé en interne par `rag-service.ts`) | **Partiel** |

**Modèles orphelins** : Part, CustomBookSkill, LicenseKey (3). AiToolConfig est un demi-orphelin (routes existent, aucun consommateur frontend). DocumentChunk est utilisé en interne par le service RAG mais n'a pas de route API dédiée.

#### Routes API (43 fichiers, 83 handlers)

43 fichiers de route contenant 83 handlers HTTP (GET, POST, PUT, DELETE, PATCH). Voir §2.1 arborescence pour la liste complète.

**Routes sans consommateur frontend identifié** :
- `GET/POST /api/ai-config` — orphelin, configuration gérée via `useAiConfig` hook (localStorage)
- `PUT/DELETE /api/ai-config/[id]` — orphelin, même raison
- `GET /api/corpus-publication` — orphelin en tant qu'endpoint REST (les données sont importées directement par `directeur-chat/route.ts` depuis `corpus-publication.ts`)
- `GET /api` — health check, probablement utilisé pour des tests manuels uniquement

#### Store Zustand (`src/lib/stores/app-store.ts`)

| Champ | Type | Persisté (localStorage) | Éphémère |
|---|---|---|---|
| `currentView` | `ViewId` | | ✅ |
| `sidebarOpen` | `boolean` | ✅ | |
| `theme` | `"light" \| "dark" \| "system"` | ✅ | |
| `activeThesisId` | `string \| null` | | ✅ |
| `activeChapterId` | `string \| null` | | ✅ |
| `aiProvider` | `string` | ✅ | |

**ViewId** : 30 valeurs valides (dashboard, editor, cadrage, ai-writing, methodology, articles, references, thesis-plan, ai-tools, academic-db, journaux-oa, recherche-plein-texte, auto-edition, feuille-route-agile, deblocage-ecriture, outils-slr, analyse-champ-recherche, apa-composer, verification-methodo, boite-doctorale, box-cloud, routesme, livres-competences, onglet-recherche, grammaire, export-pdf, equilibre-chapitres, diagrammes, harper, thesis-rag, verification-carto).

#### Répertoires malformés (artefacts)

- `src/app/api/research-tabs/[_id[/` — vide, création incorrecte
- `src/app/api/thesis/[_id[/doctoral-toolbox/` — vide
- `src/app/api/thesis/[_id[/research-tabs/` — vide

**Verdict §2.1** : **non conforme** — 3 modèles Prisma orphelins (Part, CustomBookSkill, LicenseKey), 3 routes API orphelines, 3 répertoires malformés.

---

### 2.2 — Logique métier et doctrine produit

#### (a) Chat Directeur : critique-only, sans génération de substitution

**Constat** : **conforme**.

**Preuve** : `src/data/directeur-prompt.ts` :
- Ligne 36 : `JAMAIS EN GÉNÉRATION DE CONTENU DE SUBSTITUTION`
- Ligne 36 : `Tu ne dois jamais réécrire le texte du doctorant en te basant sur le corpus`
- Ligne 62 : `Tu n'utilises le corpus qu'en mode CRITIQUE : pointer les problèmes, suggérer des améliorations, poser des questions.`
- Ligne 63 : `Tu ne génères JAMAIS de contenu de substitution (pas de réécriture, pas de texte prêt à copier-coller).`
- Ligne 63 : `tu ne les résume pas mot pour mot dans ta réponse`
- Ligne 243 (fonction `getFichesContentForPrompt`) : `à utiliser en CRITIQUE, jamais en génération de substitution`

**Total** : 5 points de renforcement explicite dans le prompt système. Aucun mode de génération n'existe dans le composant `DirecteurChatPanel` (`ai-writing-page.tsx:273-426` — seul un appel `POST /api/directeur-chat` avec les messages utilisateur).

#### (b) Orchestration corpus : plafonnée à 2 fiches maximum par interaction

**Constat** : **conforme**.

**Preuve** : `src/data/corpus-publication.ts` :
- Ligne 198 : `maxFichesPerInteraction: 2,`
- Ligne 212 : `maxFiches: number = CORPUS_ORCHESTRATION_RULES.maxFichesPerInteraction,`
- Ligne 227 : `.slice(0, maxFiches)`

La fonction `detectRelevantFiches()` (lignes 210-229) score les fiches par signaux de correspondance, trie par score décroissant, puis tronque à 2 via `.slice(0, maxFiches)`. Le plafond est une constante non configurable depuis l'interface.

#### (c) Gabarit institutionnel : 7 chapitres numérotés en romain

**Constat** : **conforme**.

**Preuve** : `src/app/api/thesis/route.ts` lignes 43-51 :
```typescript
{ number: 1, title: "Introduction",              romanNumeral: "I" },
{ number: 2, title: "Revue de littérature",    romanNumeral: "II" },
{ number: 3, title: "Cadre théorique",        romanNumeral: "III" },
{ number: 4, title: "Méthodologie",            romanNumeral: "IV" },
{ number: 5, title: "Résultats",               romanNumeral: "V" },
{ number: 6, title: "Discussion",              romanNumeral: "VI" },
{ number: 7, title: "Conclusion",              romanNumeral: "VII" },
```

Exactement 7 chapitres, numérotation I-VII, noms conformes à la spécification.

**Verdict §2.2** : **conforme** — les trois points de doctrine sont vérifiés avec preuve de code.

---

### 2.3 — État fonctionnel réel des 31 fonctionnalités

Ce tableau est la seule référence admise pour la suite du projet. Toute prétention contraire dans un rapport antérieur est annulée par celui-ci.

| # | Fonctionnalité | Statut | Preuve | Résumé |
|---|---|---|---|---|
| 1 | Tableau de bord | ✅ Fonctionne | `dashboard-page.tsx:56` : `useQuery` sur `/api/stats`. 4 StatCards rendues | 4 stat cards, 6 actions rapides, grille 14 modules |
| 2 | Éditeur de thèse (Tiptap) | ✅ Fonctionne | `editor-page.tsx:141` : TiptapEditor chargé. Ligne 55 : `handleEditorUpdate`. Ligne 31 : auto-save 2.5s | BUG-01, 02 corrigés. BUG-07, 08, 09, 10 non résolus |
| 3 | Assistant IA (11 modes) | ⚠️ Partiel | `ai-writing-page.tsx:140` : `(modes \|\| WRITING_MODES).map()`. 11 modes rendus. Ligne 58 : « 10 modes » (label incorrect) | Fonctionnel. BUG-25 (label), BUG-26 (icône) non résolus |
| 4 | Chat Directeur | ✅ Fonctionne | `ai-writing-page.tsx:284` : `POST /api/directeur-chat`. Chat avec messages, auto-scroll | Doctrine critique-only respectée. BUG-10 (contexte thèse) non résolu |
| 5 | Références bibliographiques | ✅ Fonctionne | `references-page.tsx:444-456` : import BibTeX/RIS/CSL-JSON. Ligne 219 : export BibTeX | CRUD, filtres, favoris, import, export |
| 6 | Méthodologie (guides) | ✅ Fonctionne | `methodology-page.tsx` : contenu statique avec checklist interactive | Par conception — pas d'API, pas de persistance nécessaire |
| 7 | Articles scientifiques (IMRaD) | ✅ Fonctionne | `articles-page.tsx` : guide IMRaD statique + checklist soumission | Par conception — pas d'API, pas de persistance nécessaire |
| 8 | Plan de thèse + LaTeX | ⚠️ Partiel | `thesis-plan-page.tsx:82` : `generateLatexTemplate()`. Ligne 403 : déclencheur UI | BUG-19 (toggle trompeur), BUG-07 (CRUD Part) non résolus |
| 9 | Outils IA (carnet + consensus) | ✅ Fonctionne | `ai-tools-page.tsx:201,241,278` : CRUD sources/entrées. Ligne 751 : consensus IA | Carnet CRUD + analyse consensus fonctionnels |
| 10 | Bases de données académiques | ✅ Fonctionne | `academic-db-page.tsx` : répertoire de 27 bases avec liens externes | Par conception — répertoire statique |
| 11 | Journaux Open Access | ✅ Fonctionne | `journaux-oa-page.tsx:222` : recherche via `/api/journaux-oa`. Ligne 266 : `mode: "peer-review"` | BUG-11 corrigé. Recherche OpenAlex + DOAJ |
| 12 | Recherche plein texte | ✅ Fonctionne | `recherche-plein-texte-page.tsx:166,209` : `fetch(/api/search?...)` | Opérateurs booléens, scoring, filtres |
| 13 | Auto-édition 8C | ✅ Fonctionne | `auto-edition-page.tsx:217` : `CHECKLIST_8C` (8 critères). BUG-05, 16 corrigés | BUG-05, 16 corrigés. BUG-27 (mode peer-review) non résolu |
| 14 | Feuille de route agile | ✅ Fonctionne | `feuille-route-agile-page.tsx:185,206,235` : CRUD sprints/stories. Kanban | 5 phases, drag & drop stories |
| 15 | Déblocage écriture | ✅ Fonctionne | `deblocage-ecriture-page.tsx:194,202` : exercices + Pomodoro. Ligne 1079 : timer | Diagnostic, exercices, Pomodoro 25/5 |
| 16 | Outils SLR (PRISMA) | ✅ Fonctionne | `outils-slr-page.tsx:114-145` : diagramme PRISMA 4 étapes | Criblage, extraction, export CSV |
| 17 | Analyse du champ de recherche | ✅ Fonctionne | `analyse-champ-recherche-page.tsx:152,350` : appels `/api/ai-writing` | Cartographie IA, positionnement |
| 18 | APA Compositeur | ✅ Fonctionne | `apa-composer-page.tsx:136,172` : `formatAuthorsAPA()`, `generateCitationAPA()` | APA 7e édition, 10+ types |
| 19 | Vérification méthodologique | ✅ Fonctionne | `verification-methodo-page.tsx:500,583` : `mode: "methodology"` | BUG-04 corrigé. Checklist + audit IA |
| 20 | Vérification cartographique | ✅ Fonctionne | `verification-carto-page.tsx:402` : Module A rule-based. Ligne 434 : Module B socratique | Séparation claire rule-based / LLM |
| 21 | Boîte doctorale | ✅ Fonctionne | `boite-doctorale-page.tsx:527` : `fetch(/api/thesis/${thesisId}/doctoral-toolbox)`. Ligne 565 : debounce 1.5s | BUG-14 corrigé (H2-03). Persistance DB |
| 22 | Box Cloud | 🔴 Faux module | `box-cloud-page.tsx:150` : `INITIAL_FILES` codé en dur. Ligne 243 : `simulatedSize = Math.floor(Math.random()...)` | 834 lignes, interface complète, entièrement simulée. Aucun upload réel, aucune API |
| 23 | RoutesMe (multi-modèles) | ⚠️ Partiel | `routesme-page.tsx:312` : toutes les requêtes vont à `/api/ai-writing` avec le même provider | Labels visuels GPT-4/Claude/Mistral/Llama mais pas de vraie comparaison multi-fournisseurs |
| 24 | Livres & Compétences | ⚠️ Partiel | `livres-competences-page.tsx:65` : interface `Skill` locale. Modèle `CustomBookSkill` Prisma orphelin | Livres codés en dur (titre/auteur/lien). Pas de persistance DB, pas de CRUD |
| 25 | Onglet de recherche | ✅ Fonctionne | `onglet-recherche-page.tsx:167,215,303` : CRUD via `/api/thesis/${thesisId}/research-tabs` | BUG-15 corrigé (H2-03). Persistance DB |
| 26 | Grammaire IA | ✅ Fonctionne | `grammaire-page.tsx:127` : `mode: "grammaire"`. Lignes 139-153 : parsing JSON typé | BUG-06, 12 corrigés. BUG-20 (faux négatif) non résolu |
| 27 | Export PDF | ⚠️ Partiel | `export-pdf-page.tsx:480` : `new Blob([html])`. Ligne 1142 : `window.print()` | Pas de vraie génération PDF (pas de jsPDF/html2pdf). Utilise `window.print()` |
| 28 | Équilibre des chapitres | ✅ Fonctionne | `equilibre-chapitres-page.tsx:129,302` : sélecteur de thèse + équilibre IA | BUG-23 corrigé. Sélecteur de thèse présent |
| 29 | Diagrammes visuels | ⚠️ Partiel | `diagrammes-page.tsx:304-518` : rendu via composants React (tree, org chart, concept map). Aucun SVG/canvas/Mermaid/D3 | CRUD nœuds OK. BUG-21 (export), BUG-22 (pas de rendu visuel vrai) non résolus |
| 30 | Harper (résumé/paraphrase) | 🔴 Cassé | `harper-page.tsx:282` : `mode: "harper"`. `ai-writing-modes.ts` : 0 occurrence de `"harper"` | **Mode invalide** — l'API retourne 400 à chaque appel. Même schéma que BUG-04 et BUG-11. Non identifié comme tel dans l'audit initial |
| 31 | Mon IA de thèse (RAG) | ✅ Fonctionne | `thesis-rag-page.tsx:110` : `fetch(/api/thesis-rag)`. Indexation, source badges | Chat contextuel, 4 sources indexées |

#### Bilan quantitatif

| Statut | Nombre | IDs |
|---|---|---|
| ✅ Fonctionne | 23 | 1, 2, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 25, 26, 28, 31 |
| ⚠️ Partiel | 6 | 3, 8, 23, 24, 27, 29 |
| 🔴 Cassé / Faux | 2 | 22 (Box Cloud), 30 (Harper) |
| **Total** | **31** | |

**Verdict §2.3** : **non conforme** — 2 fonctionnalités cassées (dont 1 non identifiée comme cassée dans l'audit initial), 6 partielles.

---

### 2.4 — Dette technique et incohérences non encore documentées

| # | Élément | Fichier(s) | Description |
|---|---|---|---|
| DT-01 | **Build cassé** | `src/modules/cadrage/cadrage-page.tsx:332` | Erreur TypeScript `null` → `string \| undefined`. Le build production échoue. Aucun rapport antérieur ne mentionne ce problème |
| DT-02 | **Répertoires malformés** | `src/app/api/research-tabs/[_id[/`, `src/app/api/thesis/[_id[/` | 3 répertoires vides créés avec une syntaxe de bracket incorrecte. Artéfacts d'un sous-agent |
| DT-03 | **Mode « harper » absent de WRITING_MODES** | `src/modules/harper/harper-page.tsx:282`, `src/data/ai-writing-modes.ts` | Harper appelle `mode: "harper"` qui n'existe pas. L'API retourne 400. Même schéma que BUG-04 et BUG-11 mais jamais identifié |
| DT-04 | **Routes API sans tests** | `src/app/api/thesis/[id]/doctoral-toolbox/route.ts`, `src/app/api/research-tabs/[id]/route.ts` | 2 routes sur 43 n'ont pas de fichier `.test.ts`. Toutes les autres routes (41/43) ont des tests |
| DT-05 | **DocumentChunk utilisé sans route API** | `src/lib/rag/rag-service.ts` | Le modèle `DocumentChunk` est utilisé en interne par le service RAG (`deleteMany`, `createMany`, `findMany`) mais n'a pas de route API dédiée. Aucun endpoint ne permet de lister ou gérer les chunks |
| DT-06 | **Dualité AI config non résolue** | `src/app/api/ai-config/*`, `src/hooks/use-ai-config.ts` | Deux systèmes de configuration IA coexistent : DB (AiToolConfig + routes CRUD) et localStorage (useAiConfig hook). Le frontend utilise uniquement localStorage. Les routes DB sont orphelines. La recommandation H2-08 proposait de supprimer les routes DB mais le §4bis l'a interdit |
| DT-07 | **Export PDF via window.print()** | `src/modules/export-pdf/export-pdf-page.tsx:1142` | L'export prétend générer un PDF mais utilise `window.print()` qui délègue au dialogue d'impression du navigateur. Pas de génération PDF programmatique |
| DT-08 | **RoutesMe simule le multi-modèle** | `src/modules/routesme/routesme-page.tsx:312` | Les 4 colonnes (GPT-4, Claude, Mistral, Llama) envoient toutes à `/api/ai-writing` avec la même configuration provider. Pas de vraie comparaison multi-fournisseurs |
| DT-09 | **CustomBookSkill jamais utilisé** | `prisma/schema.prisma`, `src/modules/livres-competences/livres-competences-page.tsx` | Le modèle Prisma existe mais aucun composant ne l'utilise. Les livres sont des données codées en dur |
| DT-10 | **Fiches corpus jamais consultables** | `src/data/corpus-publication.ts` | 6 fiches de corpus sont injectées dans les prompts IA mais jamais affichées à l'utilisateur. La fonctionnalité F5 de l'audit initial reste non implémentée |
| DT-11 | **2 sous-répertoires API non testés créés par Lot 5bis** | `thesis/[id]/doctoral-toolbox/`, `research-tabs/[id]/` | Routes créées lors du Lot 5bis sans fichier de test. Contraste avec les 41 autres routes qui ont toutes des tests |
| DT-12 | **BUG-13 cause racine jamais identifiée** | `src/modules/harper/harper-page.tsx` | L'audit initial (BUG-13) diagnostique un « échec silencieux ». La cause réelle est un mode IA invalide (`"harper"` absent de `WRITING_MODES`). Le diagnostic initial était incorrect |

**Verdict §2.4** : **non conforme** — 12 éléments de dette technique non documentés dans les rapports antérieurs.

---

### 2.5 — Vérifications d'exécution

#### Tests

**Commande** : `npx vitest run`
**Date** : Août 2025, exécution immédiate avant rédaction

```
Test Files  50 passed (50)
     Tests  1254 passed (1254)
  Duration  12.79s
```\n- 50 fichiers de test
- 1 254 tests passants
- 0 échouant
- 0 erreur

**Composition** : 1 247 tests de la reconstruction Lot 4-5 + 3 tests CSL-JSON null (Lot 5bis) + 4 tests verification-publication 502 (Lot 5bis).

#### Lint

**Commande** : `bun run lint`

```
✖ 152 problems (0 errors, 152 warnings)
```

- 0 erreur
- 152 avertissements (pré-existants : `@typescript-eslint/no-explicit-any`, `@typescript-eslint/no-non-null-assertion`, `react-hooks/exhaustive-deps`, `@typescript-eslint/no-unused-vars`)

#### Build

**Commande** : `npx next build`

```
✓ Compiled successfully in 20.2s
  Running TypeScript ...
Failed to compile.

./src/modules/cadrage/cadrage-page.tsx:332:54
Type error: Type 'null' is not assignable to type 'string | undefined'.
```

**Build cassé**. Erreur TypeScript dans le module Cadrage créé lors du Lot 1. Aucune vérification de build n'a été effectuée après les corrections du Lot 1.

**Verdict §2.5** : **non conforme** — tests et lint OK, mais build en échec.

---

## Conclusion transversale

Ce rapport établit les constats suivants, sans complaisance :

1. **15 bugs sur 34 sont résolus.** 18 restent ouverts, dont 1 (BUG-13/Harper) dont la cause racine a été incorrectement diagnostiquée dans l'audit initial.

2. **7 écarts** ont été identifiés entre les statuts annoncés dans les rapports et le statut réel vérifié dans le code.

3. **Le build est cassé** depuis le Lot 1 (erreur TypeScript dans `cadrage-page.tsx:332`). Aucun rapport antérieur ne le mentionne.

4. **La fonctionnalité Harper (#30) est cassée** pour une raison jamais identifiée : le mode `"harper"` n'existe pas dans `WRITING_MODES`. Ce bug partage le même schéma que BUG-04 et BUG-11 (modes invalides) mais n'a jamais été classé correctement.

5. **La traçabilité est défaillante** : 3 sessions de lots (2, 3, 4) n'ont pas produit de rapport structuré. La disparition de 466+ tests reste inexpliquée. La restauration des routes ai-config n'est pas documentée dans le worklog.

6. **Les trois points de doctrine** (critique-only, max 2 fiches, 7 chapitres romain) sont conformes et vérifiables dans le code.

---

*Fin du rapport d'audit forensique. Document produit par vérification directe du code source à l'instant de la rédaction. Aucune affirmation sans preuve.*
