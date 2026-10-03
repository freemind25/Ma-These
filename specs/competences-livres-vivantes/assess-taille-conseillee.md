# Micro-changement — taille conseillée dans le dialog des compétences livres

## Demande
Suite à la recette déléguée des 58 ressources (constat : la ressource de 30 000 car. n'est jamais injectable en intégral), le propriétaire a approuvé (« oui », IM 2026-10-03) l'ajout d'une indication « taille conseillée ≤ 12 000 caractères » dans l'UI de création/édition.

## Intention
Rendre visible, au moment de la saisie, le plafond d'injection réellement appliqué par le canal (`BOOK_SKILLS_CONTENT_BUDGET_CHARS` = 12 000 car., `src/lib/ai/book-skills.ts`) — avec un compteur live, pour éviter les ressources index-only involontaires.

## Correctif
`src/modules/livres-competences/livres-competences-page.tsx` (dialog `BookSkillsLibrary`) : sous le champ Contenu, un compteur live « N caractères — taille conseillée ≤ 12 000… » qui passe en ambre au-delà du seuil. Constante importée de la librairie pure (pas de valeur codée en dur).

## Preuve attendue
Lint 0 erreur ; navigateur : le dialog affiche le compteur, il compte les caractères saisis et vire à l'ambre au-delà de 12 000. Lignes rouges 0 diff.

## Éligibilité voie rapide
1 fichier · ≤ 20 lignes · aucun impact transverse (pas de schéma, pas de route, pas de build, pas d'variable d'environnement).
