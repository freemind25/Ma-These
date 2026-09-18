# Preuves — git-mode-normalization

Date : 2026-09-18 · cycle court (variante bug) · T1

## Inventaire pré-correctif

Commande : `git ls-files -s | awk '{print $1}' | sort | uniq -c`

```
      9 100644
    424 100755
```

Fichiers à normaliser : 424 − 8 (`.zscripts/*.sh`) = **416**. Liste mécanique : `git ls-files -s | awk '$1=="100755"{print $4}' | rg -v '^\.zscripts/[^/]*\.sh$'` (416 lignes, histogramme : 220 `.ts`, 114 `.tsx`, 19 `.md`, 18 `.png`, 7 `.txt`, 7 `.json`, 5 `.sh`, 3 `.rs`, 2 `.patch`, 2 `.mjs`, 2 `.db`, 1 `.rar`, 1 `.toml`, 1 `.svg`, 1 `.prisma`, `Caddyfile`).

## Due diligence pré-commit

```
=== INVOCATIONS build-tauri-prep.sh ===
./src-tauri/tauri.conf.json:8:    "beforeBuildCommand": "bash scripts/build-tauri-prep.sh",
=== INVOCATIONS tests/*.sh ===
./tests/python-runtime-build.sh:26:    bash "$SCRIPT_DIR/python-runtime-build.sh"   (+ croisées, toutes via bash)
=== EXECUTION DIRECTE ./ (hors commentaires) ? ===
(vide = aucune exécution directe)
=== OUTILS ===
command -v cargo rustc  →  (absents : build Tauri local impossible, fallback bun run build)
```

`package.json` : `"build": "prisma generate && next build"` — aucun appel `./` direct. `node_modules` non suivi par git (bits `.bin/` intacts).

## Exception upload/ (montage fuse.ossfs)

```
chmod: changing permissions of 'upload/LR.rar': Operation not permitted
chmod: changing permissions of 'upload/res.pdf': Operation not permitted
mount | rg upload → ossfs on /home/z/my-project/upload type fuse.ossfs (rw,…)
stat → -rwxrwxrwx root:root upload/LR.rar ; -rwxrwxrwx root:root upload/res.pdf
```

Contournement : `git update-index --chmod=-x upload/LR.rar upload/res.pdf` (retrait du bit exécutable dans l'**index** seul ; bits FS 777 propriété root inchangés, contenu intact, aucun risque d'exécution).

## Exclusivité 755 avant commit (critère du propriétaire)

Commande : `git ls-files -s | awk '$1!="100644"{print $1, $4}'`

```
100755 .zscripts/build.sh
100755 .zscripts/database-runtime-build.sh
100755 .zscripts/dev.sh
100755 .zscripts/mini-services-build.sh
100755 .zscripts/mini-services-install.sh
100755 .zscripts/mini-services-start.sh
100755 .zscripts/python-runtime-build.sh
100755 .zscripts/start.sh
```

Seuls les 8 scripts `.zscripts/*.sh` restent en 755. ✓

## Zéro ligne de contenu

Commande : `git diff --cached --numstat | awk '$1!=0 || $2!=0' | wc -l` → `0` (416 entrées `0 0 chemin` = changements de mode purs). `git diff --cached --summary | rg -c 'mode change 100755 => 100644'` → `416`, aucune autre entrée.

## Vérifications post-commit (T1 — suite)

→ voir section ci-dessous, ajoutée après commit (build, suite de tests, dev server).
