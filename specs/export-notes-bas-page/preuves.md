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

## T5 — Option DOCX côté page (reprise orchestrateur après coupure de l'agent)

- 18:14 — export-docx-page.tsx : DocxOptions.includeFootnotes (défaut false) + case « Notes de bas de page » dans la grille « Structure du document » (après « Références ») ; description exacte « Citations reconnues (Auteur, année) — référence complète APA en note ». Vérification route : `rg includeFootnotes src/app/api/export-docx/route.ts` → l.38 (schéma), l.975 (références chargées si notes), l.988-992 (collecte). Lint : 0 erreur. Commit.

## T6 — Option PDF côté page (exposants + section Notes)

- export-pdf-page.tsx (+77/−2) : ExportOptions.includeFootnotes (défaut false) ; case après « Numéros de page » ; fetch des références à l'activation (GET /api/references, silencieux si échec) ; generatePrintHtml : collectFootnotes sur les chapitres (plainText ou stripHtml), replaceCitationsWithMarks sur le HTML de chaque chapitre, section « Notes » (h2 + ol APA) en fin de document si ≥ 1 note ; CSS `.footnote-ref` (exposant) ; badge récapitulatif « Notes » Oui/Non ; dépendances useCallback mises à jour. Lint : 0 erreur ; suite complète : 68 fichiers / 1531 tests verts. Commit.

## T7 — Mention dans la notice

- docs/NOTICE-UTILISATION.md §9.1 (case « Notes de bas de page » + paragraphe explicatif : exposants + section Notes en fin de document, une note par référence, citations sans correspondance intactes, valable impression + téléchargement) et §9.2 (vraies notes Word, note unique par référence, désactivé par défaut).

## Nettoyage des données de test (base rendue propre)

- Suppression de la thèse de test « Test Notes Bas de Page » (cascade chapitre), des 2 références de test (« Comprendre les notes de bas de page », « Méthodologie de la recherche ») et de l'enregistrement SoutenancePrep résiduel du cycle 4-a — preuves : sorties `DELETED` ci-dessus dans la trace orchestrateur.
- Résidus plus anciens NON touchés (hors périmètre, signalés) : « Test Reference for E2E Testing » (2026-08-18), « Test Reference T4 Persistence » (2026-08-18).

## Recette propriétaire (déléguée — « faites pour le mieux ») — 2026-10-03 16:54

Environnement : serveur dev port 3000, thèse « Urbanisme durable » dont le chapitre VII contient désormais 2 citations réelles « (Bui Khanh Linh Do, 2025) » (issue du brouillon inséré — comble l'écart honnête noté à la convergence : rendu PDF avec citations réelles).

**DOCX (curl + unzip, comme à l'implémentation) :**
- Option ON : `POST /api/export-docx` → HTTP 200, 17 749 octets. `unzip` → `word/footnotes.xml` : ids `['0','1']` ; note 1 = référence APA complète (« Bui Khanh Linh Do, Thanh H. Nguyen, Nghi Huynh Quang, Doanh Nguyen-Ngoc, & Laurent El Ghaoui (2025). A Digital Twin Framework… https://doi.org/… ») ; **2 `<w:footnoteReference>`** dans document.xml (2 citations → 1 note partagée).
- Option OFF : HTTP 200, 17 436 octets — **0** `footnoteReference`, citation « (Bui Khanh Linh Do, 2025) » **intacte** dans le texte.
- UI : case « Notes de bas de page » cochée en navigateur avant téléchargement. Capture `test-snapshots/recette-export-docx-1-option-active.png`.

**PDF (écart de convergence comblé + défaut découvert et corrigé) :**
- Défaut trouvé pendant la recette : **l'aperçu PDF restait vide** au retour sur l'onglet Aperçu. Cause racine (tracée en console) : l'iframe est démontée/recréée à chaque sortie de l'onglet et l'écriture `document.write` dépendait d'un effet dont les dépendances ne changeaient pas au remontage — course entre montage de l'iframe et écriture (jamais exercée avant : l'écart honnête de la convergence).
- Correctif (même groupe, Groupe C — T6) : `src/modules/export-pdf/export-pdf-page.tsx` — rendu de l'aperçu basculé sur **`srcDoc`** (mécanisme déterministe : React met à jour l'attribut, plus aucune écriture impérative). Diff : 6 insertions / 10 suppressions, 1 fichier, lint 0 erreur (231 warnings = baseline), suite vitest 68 fichiers / **1531 tests verts**.
- Vérification post-correctif (flux utilisateur complet) : sélection thèse → option ON → onglet Aperçu → **iframe rendue immédiatement : 28 899 caractères, exposants `["1","1"]`** (2 citations → note 1), section **« Notes »** présente avec la référence APA complète. Captures `test-snapshots/recette-export-pdf-2-apercu-srcdoc.png` (page de titre rendue) et `recette-export-pdf-3-section-notes.png` (exposants ¹ dans le texte + section Notes).
- Voie jsPDF « Télécharger PDF » : téléchargement réel obtenu (42,9 Mo) mais rendu rasterisé/dupliqué dans ce contexte headless — voie canonique d'impression (window.print + HTML partagé) inchangée et prouvée par l'aperçu ; limitation environnement signalée, non bloquante.

Verdict de recette : **ACCEPTÉ** (9/9 critères d'acceptation confirmés ; écart de convergence comblé ; 1 défaut d'aperçu découvert et corrigé dans le même groupe).
