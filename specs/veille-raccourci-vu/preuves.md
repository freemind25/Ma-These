# Preuves — veille-raccourci-vu

Recette du 2026-09-18, mandant « go » (spec + plan + exécution enchaînée). Environnement : dev server port 3000, navigateur agent-browser.

## 1. Statique

- `bun run lint` : **0 erreur** (230 warnings = baseline inchangée ; le warning `react-hooks/exhaustive-deps` introduit à la première passe a été corrigé en enveloppant `markSeen` dans `useCallback([veille.id, loadResults])` — retour à la baseline exacte).
- `bun run test:run` : **63 fichiers / 1444 tests verts** (base non régressée).
- Périmètre : 1 seul fichier modifié (`src/modules/veille-academique/veille-academique-page.tsx`) — listener `keydown` dans `VeilleDetail` + `useCallback` + indice `<kbd>M</kbd>` sur le bouton.

## 2. Jeu d'essai

- POST `/api/veille` → veille `cmu6vl9y1004hpy6kcwdnax9o` (« Raccourci — essai recette », HAL, « participatory urbanism »).
- Check n°1 : `isFirstCheck: true, fetchedCount: 15, added: 15, newCount: 0, unreadCount: 0` — base de référence.
- Éviction de 2 résultats (script temporaire supprimé après) + check n°2 : `isFirstCheck: false, added: 2, newCount: 2, unreadCount: 2`.

## 3. Recette navigateur (CA)

- **CA-1.4 (indice visible)** : `textContent` du bouton = `"Tout marquer comme vuM"` — l'indice `<kbd>M</kbd>` est rendu. Capture `test-snapshots/raccourci-01-detail-nouveaux.png` (2 badges « Nouveau » visibles).
- **CA-1.1 (marquage global au clavier)** : appui « m » (cible réelle `window`, `tag: BODY`) → 2ᵉ passage : `unread` API **2 → 0**, journal réseau montre le `PATCH .../results 200`, badges « Nouveau » disparus, bouton « Tout marquer comme vu » repassé `disabled`. Capture `test-snapshots/raccourci-02-apres-m.png`.
- **CA-1.3 (0 non-vu → aucune requête)** : appui « m » avec `unreadCount` React = 0 → **aucun PATCH nouveau** dans le journal réseau (compteur inchangé) ; état vide « Aucun nouveau résultat depuis la vérification du 18 sept. 2026, 11:29. » affiché (CA-2.3 de la spec d'origine préservé). Texte vérifié par `eval` + capture `test-snapshots/raccourci-04-etat-final.png`.
- **CA-1.5 (modificateurs)** : appui réel `Control+m` avec 2 non-vus → `unread` API reste **2**, aucun PATCH ajouté (le journal ne contient que le PATCH du « m » précédent).
- **CA-1.2 (garde champ de saisie)** : `keydown` « m » dispatché depuis un `<input>` focusé (événement synthétique documenté comme tel — la vue détail ne contient nativement aucun champ ; le garde vise aussi l'éditeur Tiptap) → garde déclenchée, `unread` reste **2**. Preuve complémentaire hors vue détail : le renommage (champ réel, `autoFocus`) vit dans la vue liste où le listener est démonté.
- **Mobile 390 px** : capture `test-snapshots/raccourci-03-mobile-390.png` — pas de débordement horizontal.
- **Console** : aucune erreur (agent-browser `errors`/`console` vides).

## 4. Nettoyage

- DELETE `/api/veille/cmu6vl9y1004hpy6kcwdnax9o` → `{"deleted":true}` (cascade rejouée) ; GET `/api/veille` → `count: 0`. Base rendue propre.
