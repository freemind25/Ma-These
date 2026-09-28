# Plan — Veille académique : raccourci clavier de marquage « vu »

## État réel constaté

- `src/modules/veille-academique/veille-academique-page.tsx` (666 l.) — module complet livré par `specs/veille-academique` :
  - `VeilleDetail` (l.420-576) : vue détail d'une veille. `markSeen(ids?)` (l.454-475) — appelé **sans argument** = « tout marquer comme vu » (`PATCH /api/veille/[id]/results` avec `{ all: true }`, l.459-463) ; état local `results` (l.429) et `unreadCount` dérivé (l.477).
  - Bouton « Tout marquer comme vu » (l.512-520), désactivé si `markingAll || unreadCount === 0` (l.516).
  - `VeilleDetail` est monté uniquement quand une veille est sélectionnée (`veille-academique-page.tsx` l.243-244) — un listener monté dans ce composant vit exactement le temps de la vue détail.
- Gardes de saisie : le dialog de renommage contient un `Input` avec `onKeyDown` Enter local (l.295-300) — aucun conflit, mais le garde `input/textarea/[contenteditable]` du raccourci est indispensable (éditeur Tiptap présent dans d'autres vues de l'application).
- Écoutes clavier existantes dans le dépôt : Enter/Escape sur champs propres à chaque module (ex. `chapter-header.tsx`, pages de recherche) — **aucune écoute « m » nu** constatée.
- `src/components/ui/switch.tsx` existe (non utilisé ici — le raccourci ne nécessite aucun composant nouveau).

## Approche retenue

Dans `VeilleDetail` uniquement : un `useEffect` monte un listener `window` `keydown` (démonté au démontage de la vue détail). Sur touche « m » (minuscule, sans Ctrl/Cmd/Alt) : si le focus est dans `input`/`textarea`/`[contenteditable]` → ignorer ; si `unreadCount === 0` ou marquage en cours → ignorer ; sinon appeler le `markSeen()` existant (chemin de code inchangé). Le bouton existant reçoit un indice `<kbd>M</kbd>` dans son libellé. Aucune route, aucun schéma, aucun autre fichier.

## Alternatives écartées

- **Listener global au niveau application (toutes vues)** — rejeté : l'application contient un éditeur Tiptap omniprésent et plusieurs modules à écoutes clavier ; un « m » global y est un risque de collision et un effet destructif élargi (perte des badges « Nouveau » sur toutes les veilles). Hors périmètre spec.
- **Touche avec modificateur (Ctrl+M)** — rejeté pour cette itération : moins découvrable, verbosité ; « m » nu avec gardes est sûr dans la portée restreinte. Modifiable à la recette.
- **Nouveau hook réutilisable `useHotkey`** — rejeté : un seul point d'usage ; abstraire maintenant serait de la sur-ingénierie. Une tâche future de généralisation pourrait l'extraire.

## Fichiers touchés

| Fichier | Nature | Risque |
|---|---|---|
| `src/modules/veille-academique/veille-academique-page.tsx` | modification (~30-40 l. : 1 `useEffect` listener + gardes + indice kbd) | Faible — composant isolé ; aucun appel réseau nouveau (réutilise `markSeen`) |

Aucun autre fichier. Routes de recherche HAL/arXiv et `app-sidebar.tsx` : non concernées (garantie inchangée).

## Impacts transverses

Aucun : pas de schéma, pas de route, pas de build, pas de variable d'environnement.

## Stratégie de vérification

1. `bun run lint` — 0 erreur.
2. Rendu navigateur (agent-browser) : créer une veille avec résultats non vus → vue détail → appui « m » → badges « Nouveau » disparus + compteur 0 + état CA-2.3 affiché ; captures desktop + mobile ≥ 390 px dans `test-snapshots/`.
3. Garde : focus dans le champ de renommage → « m » tapé dans le champ n'affecte rien.
4. `bun run test:run` — suite intégrale verte (63 fichiers / 1444 tests, non-régression).

## Risques

- **Collision clavier future** : si un jour un autre module écoute « m » nu dans la même vue — portée restreinte au montage de `VeilleDetail` limite l'exposition ; le gardien contenteditable couvre l'essentiel.
- **Marquage involontaire** : « m » nu hors champ de saisie marque tout non-vu → vue détail uniquement + indice visible sur le bouton ; effet réversible en pratique (les résultats restent consultables, seuls les badges « Nouveau » disparaissent).
