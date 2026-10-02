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
- T3 18:05 — route export-docx : option `includeFootnotes?` (défaut false), collecte sur plainText (fallback stripHtml), `Document({footnotes})`, injection `FootnoteReferenceRun` dans paragraphes/listes (gras préservé) ; preuves curl+unzip ci-dessous ; lint 0 erreur / 234 warnings dont 3 imputables aux seuls scripts temporaires `.tmp-notes/` (supprimés en fin de cycle — projet = 231) ; tsc 0 erreur ; lignes rouges vides.

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

## T3 — notes de bas de page DOCX (détails)

Jeu de test (script bun + Prisma, `.tmp-notes/seed.ts`) : 2 références (Smith 2020 book, Doe 2019 article) + 1 thèse « Test Notes Bas de Page » + 1 chapitre dont le plainText contient « Smith (2020) » (narrative, en gras dans le HTML), « (Smith, 2020) » (2ᵉ occurrence), « (Doe, 2019) » et « (Ghost, 2021) » (inconnue).

1. Baseline AVANT modification de la route (option off) → `.tmp-notes/before-off.docx` : `HTTP 200 - 10926 octets`.
2. Après modification, POST `includeFootnotes:true` → `HTTP 200 - 11149 octets` :

```
=== word/footnotes.xml ===
  note id=-1 / id=0 : séparateurs (auto-insérés par docx 9.7.1)
  note id=1: Smith (2020). Comprendre les notes de bas de page. Presses Universitaires.
  note id=2: Doe (2019). Méthodologie de la recherche. Revue des sciences, 5(2), 10-22. https://doi.org/10.1234/exemple
=== word/document.xml ===
  footnoteReference ids: ['1', '1', '2'] — total: 3 (dont 2 sur la même note 1 — CA-1.5)
  "(Smith, 2020)" absent du texte: True (remplacée par le renvoi)
  "(Doe, 2019)" absent du texte: True (remplacée par le renvoi)
  "(Ghost, 2021)" présent: True (citation inconnue intacte — CA-1.3)
  renvoi juste après le run gras Smith: True (gras préservé, <w:b/> présent)
```

3. POST `includeFootnotes:false` (option absente du payload T3 de la baseline) :

```
footnoteReference dans document.xml (OFF): 0
document.xml identique (bytes) à la baseline AVANT modification: True (7399 == 7399 octets)
core.xml identique hors horodatages de génération: True
```

→ CA-1.4 prouvé : chemin option OFF strictement inchangé.

Note de conception consignée : la correction en cours de T3 (premier test) a remplacé `raws: string[]` par `occurrences: {raw, kind}[]` — la forme narrative « Smith (2020) » garde son auteur devant l'exposant (« Smith¹ »), la forme parenthétique est remplacée en entier ; vérifié au run 2 ci-dessus.
