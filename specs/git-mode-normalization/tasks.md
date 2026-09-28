# Tasks — git-mode-normalization

Contexte : commande du propriétaire (2026-09-18) — « Oui pour la normalisation — mais pas en voie rapide… le cycle complet, ne serait-ce que pour isoler proprement ce commit dans l'historique. Cycle court : assess.md suffit. » Cycle variante bug (dette d'import), étapes 4 → 6.

Périmètre fermé (commande du propriétaire) : **modes git uniquement, un seul commit `chore:`** — aucune ligne de contenu, aucun autre fichier dans le périmètre.

Annonce = commande : les 416 fichiers à normaliser sont l'inventaire mécanique `git ls-files -s | awk '$1=="100755"'` moins `.zscripts/*.sh` (article 2 satisfait par la commande elle-même).

## Groupe A — chore (modes git)

- [x] T1 — Normaliser en 100644 les 416 fichiers suivis en 100755 hors `.zscripts/*.sh` · preuve attendue avant commit : `git ls-files -s` ne montre plus que `.zscripts/*.sh` en 755 ; `git diff --cached --summary` 100 % `mode change 100755 => 100644`, `git diff --cached --numstat` vide (zéro ligne de contenu) · preuve attendue après commit : `bun run build` succès + `bun run test:run` 1428/1428 + dev server redémarré et `/` rendue

Dépendances : aucune. Ce groupe n'est pas [BLOQUANT].

## Convergence — 2026-09-18

Critères d'acceptation satisfaits : 1/1 — T1 recetté par le propriétaire (« je valide », 2026-09-18) ; preuves avant/après commit dans `preuves.md` (exclusivité des 8 `.zscripts/*.sh` à 755, 416 × `mode change 100755 => 100644`, numstat zéro contenu sur l'existant, `bun run build` succès au 2e essai — 1er échec transitoire réseau sur fetch Google Fonts, `bun run test:run` 1428/1428, lint 0 erreur, rendu navigateur vérifié avec capture `test-snapshots/13-mode-normalization-check.png`). Aucun critère manquant.

Écarts au plan : aucun sur le périmètre (un seul commit `chore:` 0348dcb, zéro ligne de contenu sur l'existant). Deux notes de cycle consignées : (1) `upload/LR.rar` + `upload/res.pdf` corrigés à l'index seul (`git update-index --chmod=-x`) — montage fuse.ossfs refusant le chmod FS, contenu intact ; (2) `core.fileMode=false` posé en config locale pour neutraliser le bruit permanent des montages ossfs.

Dette introduite : aucune.

Verdict : CONVERGÉ
