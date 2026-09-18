# Veille académique — raccourci clavier de marquage « vu »

## Problème

Dans la vue détail d'une veille, marquer les résultats comme vus exige un clic par résultat ou un clic sur « Tout marquer comme vu » (`src/modules/veille-academique/veille-academique-page.tsx` l.512-520). Aucun raccourci clavier n'existe : le doctorant qui consulte ses nouveautés au fil du clavier doit systématiquement retourner à la souris. Cette évolution était explicitement laissée hors périmètre de l'itération livrée (`specs/veille-academique/spec.md` l.34 ; décision n°2 l.41 : marquage par résultat + bouton « tout marquer comme vu »).

## Utilisateur concerné

Doctorant (rôle principal — usage quotidien de la veille).

## Comportement attendu

US-1 — En tant que doctorant, je veux **marquer tous les résultats non vus au clavier** depuis la vue détail d'une veille, afin de traiter mes nouveautés sans quitter le clavier.
  CA-1.1 Étant donné la vue détail d'une veille affichant au moins un résultat non vu, quand j'appuie sur le raccourci clavier, alors tous les résultats non vus de cette veille sont marqués « vu » et le compteur de nouveautés passe à zéro — comportement identique au bouton « Tout marquer comme vu ».
  CA-1.2 Étant donné le focus dans un champ de saisie (renommage de veille, tout champ de l'application, éditeur de thèse), quand j'appuie sur la même touche, alors aucun marquage ne se produit.
  CA-1.3 Étant donné la vue détail sans aucun résultat non vu (état « aucun nouveau résultat depuis le … »), quand j'appuie sur le raccourci, alors rien ne change et aucune requête de marquage n'est envoyée.
  CA-1.4 Le bouton « Tout marquer comme vu » affiche un indice visible du raccourci (le doctorant peut le découvrir sans documentation externe).
  CA-1.5 Étant donné la touche pressée en combinaison avec Ctrl/Cmd ou Alt, alors le raccourci ne se déclenche pas (aucun détournement des raccourcis existants de l'application ou du navigateur).

## Hors périmètre (cette itération)

- Raccourci en vue liste (marquer toutes les veilles d'un coup) — action élargie à fort effet, non demandée.
- Raccourci actif hors de la vue veille (« global » toutes vues confondues) — collision potentielle avec l'éditeur Tiptap et les raccourcis des autres modules.
- Personnalisation de la touche.
- Annulation du marquage (« un-see ») — le marquage reste définitif, comme aujourd'hui.

## Décisions de clarification (conservatrices, modifiables à la recette)

Mandat du propriétaire : « go pour les deux propositions » (2026-09-18). Micro-décisions tranchées par le choix le plus conservateur, dérivé du comportement livré :

1. **Touche** : « M » (marquer), sans modificateur — mnémonique français, sans conflit constaté (aucun module n'écoute « m » nu globalement ; les écoutes existantes sont Enter sur leurs propres champs).
2. **Portée** : la vue détail d'une veille uniquement (là où s'affichent les résultats et le bouton équivalent) — pas la liste, pas les autres vues.
3. **Gardes** : touche ignorée si le focus est dans `input`/`textarea`/`[contenteditable]` ou si Ctrl/Cmd/Alt est enfoncée (CA-1.2, CA-1.5).
4. **Sémantique** : équivalent clavier exact du bouton existant — même action, même requête, même retour visuel.
