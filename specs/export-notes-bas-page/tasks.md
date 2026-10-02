# Tâches — Notes de bas de page dans les exports

## Groupe A — Bibliothèques partagées [BLOQUANT]
- [ ] T1 — Créer `src/lib/citations.ts` (stripHtml, parseSingleAuthorYear, extractCitations parenthétique+narrative, buildReferenceIndex, findMatchingReference, collectFootnotes {id≥1 unique par référence, ordre première apparition}, replaceCitationsWithMarks → `<sup class="footnote-ref">n</sup>`) — adaptation documentée depuis `alignement-preuves` (module non retouché) · preuve : T4 vert.
- [ ] T2 — Créer `src/lib/apa-format.ts` : extraire `formatReferenceApa` tel quel de `src/app/api/export-docx/route.ts` (route réécrite pour importer) · preuve : sortie APA identique avant/après extraction (tests + curl).

## Groupe B — Backend / routes API [DÉPEND DE Groupe A]
- [ ] T3 — Route DOCX : option `includeFootnotes` (schéma + options), collecte des notes depuis plainText, `Document({footnotes})` ids ≥ 1, injection `FootnoteReferenceRun` dans les runs (gras/italique préservés), chemin option OFF strictement inchangé · preuve : curl + unzip (footnotes.xml, 2 renvois même note, citation inconnue intacte, option off = 0 footnoteReference).

## Groupe C — Frontend / UI [DÉPEND DE Groupe A]
- [ ] T4 — Tests `src/lib/citations.test.ts` (détection, et al., narrative, matching, unicité/ordre, remplacement HTML réaliste) · preuve : verts.
- [ ] T5 — Page DOCX : `DocxOptions` + case « Notes de bas de page » (défaut off) dans « Structure du document » · preuve : navigateur.
- [ ] T6 — Page PDF : option + case (défaut off, description « fin de document »), fetch références si active, exposants + section « Notes » dans `generatePrintHtml`, impact des 2 voies · preuve : navigateur (aperçu + impression + téléchargement).

## Groupe D — Documentation [DÉPEND DE Groupes B+C]
- [ ] T7 — Mention de l'option dans `docs/NOTICE-UTILISATION.md` §9.1/§9.2 · preuve : cohérence code.

## Convergence — 2026-10-02
Critères d'acceptation satisfaits : 9/9 (CA-1.1→1.5 prouvés par curl + unzip DOCX : note unique partagée, citation inconnue intacte, option OFF byte-identique 7399==7399, gras préservé ; CA-2.1→2.4 : option UI vérifiée navigateur sur les 2 pages, logique exposants+section Notes couverte par 25 tests unitaires, les 2 voies PDF consomment le même HTML)
Écarts au plan : aucun fonctionnel ; limite honnête — le rendu PDF avec citations réelles n'a pas été exercé de bout en bout en navigateur (chapitre de recette sans citation reconnue) ; la logique est prouvée par tests unitaires et le chemin HTML est commun aux 2 voies
Dette introduite : aucune nouvelle ; écart préexistant signalé (titres DOCX sans HeadingLevel — TDM Word, hors périmètre)
Verdict : **CONVERGÉ** (recette propriétaire en attente)
