# Preuves — export-notes-bas-page

Méthode : chaque preuve est une sortie réelle de commande, horodatée en `TZ='Etc/GMT-1'`.
Ligne rouge vérifiée avant chaque commit : `git diff HEAD --stat -- src/components/layout/app-sidebar.tsx src/app/api/theses-en-ligne/search/route.ts src/app/api/arxiv/search/route.ts` = vide.

## Baseline (avant T1)

- 17:40 — `git diff HEAD --stat -- <3 lignes rouges>` → sortie vide (`LIGNES_ROUGES_VIDE_OK`).
- 17:40 — `bun run test:run` → `Test Files  67 passed (67)` / `Tests  1506 passed (1506)`.
- 17:40 — `bun run lint` → `✖ 231 problems (0 errors, 231 warnings)`.

## Progression (append par commit)

- T1 17:52 — `src/lib/citations.ts` créé (adaptation documentée de alignement-preuves l.78-353, module non retouché) ; lint 0 erreur / 231 warnings (baseline inchangée) ; tsc : 0 erreur sur le fichier ; lignes rouges vides.

## T1 — bibliothèque de citations (détails)

- `bunx tsc --noEmit` filtré sur `citations|apa-format` → aucune sortie (0 erreur).
- `bun run lint` → `✖ 231 problems (0 errors, 231 warnings)` (baseline conservée ; 2 warnings introduits par la première écriture — `_index` inutilisé, non-null assertion — corrigés avant commit).
- Artéfacts spec/plan/tasks du cycle committés avec T1 (même convention que le cycle 4-b).
