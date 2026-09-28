# Preuves — constitution-mode

Date : 2026-09-18 · voie rapide · 1 fichier (`CONSTITUTION.md`, mode seul)

## Avant

Commande : `git ls-files -s CONSTITUTION.md && ls -l CONSTITUTION.md`

```
100755 cf930073c32c8b412bcb604fc51679cf1d95258e 0	CONSTITUTION.md
-rwxr-xr-x 1 z z 3880 Sep 18 06:29 CONSTITUTION.md
```

## Après (chmod 644 + stage)

Commande : `git ls-files -s CONSTITUTION.md && git diff --cached --summary`

```
100644 cf930073c32c8b412bcb604fc51679cf1d95258e 0	CONSTITUTION.md
 mode change 100755 => 100644 CONSTITUTION.md
```

Blob identique (`cf93007…`) : contenu strictement intact, mode seul modifié. 0 ligne de contenu.
