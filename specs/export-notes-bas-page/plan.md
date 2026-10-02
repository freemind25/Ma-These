# Plan — Notes de bas de page dans les exports PDF et DOCX

## État réel constaté

- **PDF (client, `src/modules/export-pdf/export-pdf-page.tsx`, 1268 l.)** : options `ExportOptions` l.71-78, défauts l.171-178 (tout `true`), cases l.968-1014 (« Page de couverture » l.978, « Table des matières » l.993, « Numéros de page » l.1008) ; `generatePrintHtml` l.278-452 injecte le contenu des chapitres l.356-376 ; **deux voies** : impression `window.print` l.467-481 et téléchargement jsPDF+html2canvas (rastérisation) l.498-569 — toute addition HTML apparaît dans les deux ; **bibliographie absente du PDF** (0 occurrence) ; numéros de page en CSS `@page` l.432-440 (impression seulement).
- **DOCX (`src/app/api/export-docx/route.ts`, 1145 l.)** : `docx` npm **9.7.1** (package.json l.77) ; options `ExportDocxRequest['options']` l.23-35 ; références chargées globalement l.1012-1032 ; corps l.582-886 ; `parseInlineRuns` l.92-215, `parseHtmlToBlocks` l.225-292 ; `formatReferenceApa` l.891-970 ; **footnotes supportées** : `Document({footnotes})` (node_modules/docx/dist/index.d.ts l.1605-1608), `FootnoteReferenceRun(id)` (l.756-758), **ids à partir de 1** (séparateurs -1/0 auto). Caveat préexistant signalé (hors périmètre) : titres sans `HeadingLevel` (l.618-691).
- **Citations** : logique complète dans `src/app/api/alignement-preuves/route.ts` — `stripHtml` l.78-90, `parseSingleAuthorYear` l.150-218, `extractCitations` l.221-285 (parenthétique `/\(([^)]+?(?:19|20)\d{2}[^)]*?)\)/g` l.227, narrative l.254), `buildAuthorKey` l.110-117, `buildReferenceIndex` l.303-334, `findMatchingReference` l.337-353, limite 100/chapitre l.71. **Module non retouché** (décision spec n°1) : fonctions adaptées/copiées dans une lib partagée dédiée, attribution consignée.
- **APA** : formateur unique côté route (`formatReferenceApa` l.891-970) — extraction vers `src/lib/apa-format.ts`, la route importe (fichier déjà touché par la fonctionnalité). Aucun test existant sur les exports.

## Approche retenue

1. **Lib partagée `src/lib/citations.ts`** (pures, testables) : `stripHtml`, `parseSingleAuthorYear`, `extractCitations` (parenthétique + narrative), `buildReferenceIndex`, `findMatchingReference`, + `collectFootnotes(chaptersPlainText, references)` → liste ordonnée de `{id≥1, reference, key}` (première apparition, unique par référence) et `replaceCitationsWithMarks(html, footnoteMap)` → HTML avec `<sup class="footnote-ref">n</sup>` (regex sur le HTML : les citations littérales du texte y apparaissent telles quelles ; limite défensive = ne remplacer que les sous-chaînes citées, jamais d'attribut — patterns à parenthèses+année absents des attributs Tiptap).
2. **Lib partagée `src/lib/apa-format.ts`** : `formatReferenceApa` extrait tel quel ; la route DOCX importe (séquences identiques prouvées par les tests).
3. **DOCX** : option `includeFootnotes` (route l.23-35 + page client `DocxOptions` l.51-60, défauts l.100-109, case dans la grille « Structure du document » l.304-335). Route : si option → plainText des chapitres (l.479-486 du pattern alignement-preuves) → `collectFootnotes` → `Document({footnotes})` ; injection des `FootnoteReferenceRun(id)` dans les runs des paragraphes (découpe du texte aux positions des citations de la map, runs intermédiaires identiques). Option désactivée → aucun changement de chemin de code (même sérialisation qu'aujourd'hui).
4. **PDF** : option `includeFootnotes` (interface l.71-78, défauts l.171-178, case après « Numéros de page » l.1000-1013, libellé « Notes de bas de page » + description précisant « listées en fin de document »). `generatePrintHtml` : si activée → `replaceCitationsWithMarks` sur le HTML des chapitres + section « Notes » (h2 + liste ordonnée APA) en fin de document, après les chapitres ; références fournies à la page via `GET /api/references` (react-query, chargées quand l'option est active). Les deux voies (impression + téléchargement) héritent du même HTML (CA-2.3).

## Alternatives écartées

- **Vraies footnotes natives dans le PDF téléchargé** : rejeté — le chemin jsPDF rastérise une image (l.528-556) ; même le chemin impression ne supporte pas `float: footnote` de façon portable → forme « section Notes en fin de document » (décision spec, annoncée dans l'UI).
- **Retoucher `alignement-preuves` pour exporter ses fonctions** : rejeté — refactor hors périmètre (Constitution « refactoriser au passage ») ; la lib partagée est une adaptation documentée.
- **Une note par citation** : rejeté (spec n°3) — note unique par référence, première occurrence.
- **Bibliographie complète ajoutée au PDF** : rejeté — hors périmètre (le PDF n'en a jamais eu) ; seules les notes des citations reconnues sont listées.

## Fichiers touchés

| Fichier | Nature | Risque |
|---|---|---|
| src/lib/citations.ts | création | moyen — regex, matching |
| src/lib/apa-format.ts | création | faible — extraction idempotente |
| src/app/api/export-docx/route.ts | modification | **élevé** — injection de runs, footnotes, chemin par défaut à préserver |
| src/modules/export-docx/export-docx-page.tsx | modification | faible — option + case |
| src/modules/export-pdf/export-pdf-page.tsx | modification | moyen — option, marqueurs, section Notes, fetch refs |
| src/lib/citations.test.ts | création | — |
| docs/NOTICE-UTILISATION.md | modification | mention de l'option dans §9.1/§9.2 |

**Aucun schéma Prisma.** **Lignes rouges (0 diff avant chaque commit)** : `src/components/layout/app-sidebar.tsx`, `src/app/api/theses-en-ligne/search/route.ts`, `src/app/api/arxiv/search/route.ts`.

## Impacts transverses

- Route DOCX consommée par le module d'export uniquement (optionnel, défaut inchangé) — compatibilité ascendante prouvée par export avant/après option désactivée.
- Aucun impact build Tauri, env, quotas.

## Stratégie de vérification

- `bun run lint` ; `bun run test:run` (+ `citations.test.ts` : détection parenthétique/narrative/et al., matching, unicité/ordre des notes, remplacement HTML).
- DOCX : `curl` POST avec un jeu de chapitre contenant 2 citations (1 reconnue, 1 inconnue) + 2 références en base → unzip du .docx → `word/footnotes.xml` contient la note APA, `document.xml` contient 2 `footnoteReference` sur la même note, citation inconnue intacte ; option désactivée → document.xml sans `footnoteReference`.
- PDF : navigateur — option active → exposants visibles dans l'aperçu + section « Notes » en fin ; impression et téléchargement produits ; option inactive → sortie identique (CA-2.4).
- Mobile 390 px sur les deux pages de configuration ; captures `test-snapshots/notes-*.png`.

## Risques

- **Chemin par défaut DOCX altéré** → garde : exports avant/après comparés (option off), suite complète verte.
- Regex HTML (remplacement dans un attribut) → patterns sans parenthèses+année dans les attributs Tiptap ; test unitaire du remplacement sur HTML réaliste.
- Découpe des runs DOCX → runs intermédiaires reconstruits avec les mêmes propriétés (gras/italique préservés — testé via un paragraphe gras contenant une citation).
- Références globales sans thèse → accepté (contrainte schéma actuelle, spec n°4).
