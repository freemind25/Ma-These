# Preuves — export-notes-bas-page

Méthode : chaque preuve est une sortie réelle de commande, horodatée en `TZ='Etc/GMT-1'`.
Ligne rouge vérifiée avant chaque commit : `git diff HEAD --stat -- src/components/layout/app-sidebar.tsx src/app/api/theses-en-ligne/search/route.ts src/app/api/arxiv/search/route.ts` = vide.

## Baseline (avant T1)

- 17:40 — `git diff HEAD --stat -- <3 lignes rouges>` → sortie vide (`LIGNES_ROUGES_VIDE_OK`).
- 17:40 — `bun run test:run` → `Test Files  67 passed (67)` / `Tests  1506 passed (1506)`.
- 17:40 — `bun run lint` → `✖ 231 problems (0 errors, 231 warnings)`.

## Progression (append par commit)

- T1 17:52 — `src/lib/citations.ts` créé (adaptation documentée de alignement-preuves l.78-353, module non retouché) ; lint 0 erreur / 231 warnings (baseline inchangée) ; tsc : 0 erreur sur le fichier ; lignes rouges vides.
- T2 17:54 — `src/lib/apa-format.ts` créé (formatReferenceApa extrait tel quel) ; route export-docx réécrite pour l'importer (fonction locale supprimée) ; preuve d'identité APA ancien/nouveau 5/5 échantillons ; lint 0 erreur / 231 warnings ; tsc 0 erreur ; lignes rouges vides.

## T1 — bibliothèque de citations (détails)

- `bunx tsc --noEmit` filtré sur `citations|apa-format` → aucune sortie (0 erreur).
- `bun run lint` → `✖ 231 problems (0 errors, 231 warnings)` (baseline conservée ; 2 warnings introduits par la première écriture — `_index` inutilisé, non-null assertion — corrigés avant commit).
- Artéfacts spec/plan/tasks du cycle committés avec T1 (même convention que le cycle 4-b).

## T2 — extraction du formateur APA (détails)

- Script de comparaison (bun, /tmp/apa-compare.ts) : ancienne implémentation (copie exacte de git HEAD export-docx/route.ts) vs `formatReferenceApa` importée de `src/lib/apa-format.ts`, 5 échantillons (article+DOI, livre, web s.d. multi-auteurs, thèse, conférence) :

```
IDENTIQUE: Smith, J. (2020). Understanding tests. J. of Testing, 12(3), 45-67. https://doi.org/10.1234/test
IDENTIQUE: Doe, J. & Martin, A. (2019). Un livre. PUF.
IDENTIQUE: A, B, C, & D (s.d.). Many authors. Récupéré de https://example.com
IDENTIQUE: Bernard, C. (2015). Thèse de doctorat. Université de Paris.
IDENTIQUE: Dupont, L., Petit, M., & Grand, F. (2021). Conférence. Actes, 2, 1-10.
RESULT: 5/5 identiques
```

- `bunx tsc --noEmit` filtré `export-docx|apa-format` → 0 erreur ; `bun run lint` → `✖ 231 problems (0 errors, 231 warnings)`.
