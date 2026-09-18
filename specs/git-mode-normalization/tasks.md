# Tasks — git-mode-normalization

Contexte : commande du propriétaire (2026-09-18) — « Oui pour la normalisation — mais pas en voie rapide… le cycle complet, ne serait-ce que pour isoler proprement ce commit dans l'historique. Cycle court : assess.md suffit. » Cycle variante bug (dette d'import), étapes 4 → 6.

Périmètre fermé (commande du propriétaire) : **modes git uniquement, un seul commit `chore:`** — aucune ligne de contenu, aucun autre fichier dans le périmètre.

Annonce = commande : les 416 fichiers à normaliser sont l'inventaire mécanique `git ls-files -s | awk '$1=="100755"'` moins `.zscripts/*.sh` (article 2 satisfait par la commande elle-même).

## Groupe A — chore (modes git)

- [ ] T1 — Normaliser en 100644 les 416 fichiers suivis en 100755 hors `.zscripts/*.sh` · preuve attendue avant commit : `git ls-files -s` ne montre plus que `.zscripts/*.sh` en 755 ; `git diff --cached --summary` 100 % `mode change 100755 => 100644`, `git diff --cached --numstat` vide (zéro ligne de contenu) · preuve attendue après commit : `bun run build` succès + `bun run test:run` 1428/1428 + dev server redémarré et `/` rendue

Dépendances : aucune. Ce groupe n'est pas [BLOQUANT].
