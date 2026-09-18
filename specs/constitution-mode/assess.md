# Voie rapide — constitution-mode

## Demande

Restauration des permissions de `CONSTITUTION.md` : le fichier est passé en mode git 100755 lors de sa création (constaté et déclaré au propriétaire le 2026-09-17, laissé en attente de décision). Décision du propriétaire (2026-09-18) : « Confirmé — chore: restauration des permissions, chmod 644 CONSTITUTION.md. Voie rapide, déjà validé précédemment, exécute directement. »

## Cause

Mode exécutable (100755) hérité de la création du fichier (commit `43a2656`) — anomalie cosmétique sans effet fonctionnel (fichier Markdown, aucun exécutable).

## Correctif

`chmod 644 CONSTITUTION.md` — changement de mode git uniquement (100755 → 100644), 0 ligne de contenu modifiée, 1 fichier, aucun impact transverse.

## Preuve attendue

`git ls-files -s CONSTITUTION.md` : 100644 ; `git diff --cached --summary` : `mode change 100755 => 100644` ; blob inchangé (`cf93007…`), contenu intact. Sorties réelles dans `preuves.md`.

## Recette

Recette du propriétaire donnée par la commande elle-même (« Confirmé … exécute directement »).
