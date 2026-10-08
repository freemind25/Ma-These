# Plan — cycle « ocr-rss-purge »

## Groupe A — Instrumentation (CA-1)

- Script de banc : job OCR réel + échantillonnage RSS par page (ps/proc) → courbe texte consignée.

## Groupe B — Départage des hypothèses (mesure avant code)

- h1 GC : job avec `--expose-gc` + `global.gc()` inter-pages (expérimental) → delta RSS.
- h2 WASM : RSS après terminate vs avant page (mise en évidence de la rétention).
- h3 copies : comptage des allocations par page (lecture de code + pic par page).

## Groupe C — Correctif retenu + tests (CA-2, CA-3, CA-4)

- Implémentation de la piste gagnante (probable p1+p2), tests verts, équivalent prod documenté.

## Groupe D — Recette + convergence (CA-1..4)

- Banc final 30 pages, courbes avant/après, preuves, worklog, push.
