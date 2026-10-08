# Spec — cycle « ressource-phrasebank-manchester »

Date : 2026-10-08 · Déclencheur : IM propriétaire « à la fin de ce travail, veuillez
rajouter ceci : https://www.phrasebank.manchester.ac.uk/ » · Statut : intégration

## 1. Objet et découverte

Le module « Phrasier Académique » (`src/modules/phrasebook/phrasebook-page.tsx`,
données `src/lib/data/phrasebank-data.ts`) est déjà déclaré « inspiré du Manchester
Academic Phrasebank, adapté au contexte francophone » (102 phrases françaises).
La demande du propriétaire = intégrer la SOURCE réelle référencée.

## 2. Faits sourcés (2026-10-08, pages réelles lues via page_reader)

- **Éditeur** : The University of Manchester — © University of Manchester,
  ressource en ligne gratuite (version enrichie payante PDF/Kindle).
- **Fondement** : analyse de genre de John Swales (« moves », 1981, 1990) ;
  dimension phraseologique (Bolinger 1976 ; Pawley & Syder 1983 ; Sinclair 1991).
- **Corpus** : 100 mémoires de fin d'études de l'Université de Manchester +
  articles multidisciplinaires ; phrases simplifiées, mots de contenu génériques.
- **Structure réelle** : 6 grandes sections (Introducing work, Referring to
  sources, Describing methods, Reporting results, Discussing findings, Writing
  conclusions) + 11 fonctions de langage générales (Being cautious, Being
  critical, Classifying and listing, Compare and contrast, Defining terms,
  Describing trends, Describing quantities, Explaining causality, Giving
  examples, Signalling transition, Writing about the past).
- **Réutilisation acceptable** (Davis & Morley 2013, cité par la source) :
  construction non originale, pas le point de vue d'un tiers, ≤ 9 mots,
  ≤ 4 mots de contenu génériques, mots d'exemple à substituer.

## 3. Décision d'intégration

**Enrichissement du module Phrasier existant** (pas de nouveau module) :
- ajout d'un lot de phrases françaises ADAPTÉES des structures génériques réelles
  lues sur 12 pages de la source (traduction/adaptation de formules génériques,
  placeholders {X}/{Y} — conforme au cadre de réutilisation de la source) ;
- **provenance affichée dans l'UI** (sceau-provenance-savoirs : traçabilité +
  attribution obligatoires) : bandeau source avec lien vers phrasebank.manchester.ac.uk ;
- préfixe d'identifiants `man-` pour tracer le lot, `variant: "Manchester"`.
- Hors périmètre : copie verbatim des listes anglaises (droits + langue de l'app),
  des « trends/quantities » (chiffrées, peu utiles en SHS francophone), scraping massif.

## 4. Critères d'acceptation

- **CA-1** : les nouvelles phrases suivent le contrat `Phrase` existant (sections
  et fonctions déclarées, ids uniques `man-`), la recherche/filtres du module les
  traitent comme les autres — sans régression des 102 phrases d'origine.
- **CA-2** : la provenance Manchester est visible dans l'UI du module (attribution
  + lien) et dans les données (constante de provenance).
- **CA-3** : recette navigateur réelle : phrases `man-` visibles/filtrables,
  attribution visible, 0 erreur console, lint 0 erreur, red lines 0 diff.
