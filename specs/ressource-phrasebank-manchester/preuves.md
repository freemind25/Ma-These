# Preuves — cycle « ressource-phrasebank-manchester »

## Faits sourcés (2026-10-08, page_reader sur les pages réelles)

13 pages réelles de phrasebank.manchester.ac.uk lues (accueil, about + 11
catégories) — extraits archivés dans la session, résumés dans `spec.md` § 2 :

| Page lue | Contenu confirmé |
|---|---|
| `/` + `/about-academic-phrasebank/` | éditeur (Univ. de Manchester), fondement Swales (« moves »), corpus (100 mémoires), cadre de réutilisation (Davis & Morley 2013 : générique, ≤ 9 mots, ≤ 4 mots de contenu, substitution requise), structure 6 sections + 11 fonctions |
| `introducing-work/` | moves réels : établir le contexte, la controverse, définir le sujet, annoncer le but et le plan |
| `referring-to-sources/` | « The literature on X has highlighted several… », « Different theories exist in the literature regarding… », etc. |
| `describing-methods/` | « Many researchers have utilised X to measure… », « Different methods have been proposed to classify… », etc. |
| `reporting-results/` | « Regression analysis was used to predict… », « The average scores of X and Y were compared… », etc. |
| `discussing-findings/` | « Several reports have shown that… », « Previous studies evaluating X observed inconsistent results… », etc. |
| `using-cautious-language/` | « It has been reported that… », « It is a widely held view that… », « Recent research has suggested that… », etc. (URL réelle ≠ menu « being-cautious » → 404 constaté puis corrigé) |
| `writing-conclusions/` | « This study set out to… », « The aim of the present research was to examine… », etc. |
| `giving-examples/`, `compare-and-contrast/`, `writing-definitions/`, `signalling-transition/` | structures génériques des 4 fonctions de langage complémentaires |

## Implémentation

- `src/lib/data/phrasebank-data.ts` : constante `MANCHESTER_SOURCE` (nom,
  éditeur, URL, note de provenance et de cadre de réutilisation) + **37 phrases**
  d'identifiants `man-*` (variant « Manchester ») couvrant les 12 catégories
  réelles mappées sur les sections/fonctions existantes du module.
- `src/modules/phrasebook/phrasebook-page.tsx` : attribution visible sous le
  titre — lien « Enrichi d'après Academic Phrasebank — The University of
  Manchester » ( ExternalLink, ouvre la source dans un nouvel onglet).
- Zéro copie verbatim des listes anglaises : adaptations françaises de
  structures génériques avec placeholders {X}/{Y} (conforme au cadre
  Davis & Morley cité par la source elle-même).

## Validation automatisée

- eslint : 0 erreur sur les 2 fichiers touchés (exit 0).
- Validation structurelle one-off (node, hors dépôt) : **138 phrases**
  (101 d'origine + 37 `man-`), **0 doublon d'id, 0 section invalide,
  0 fonction invalide**.
- vitest complet inchangé non requis (aucun test existant sur ce module de
  données ; les 1 658 tests verts du cycle ocr-rss-purge couvrent la régression
  générale — fichier de données ajoutitif, contrat `Phrase` respecté).

## Recette navigateur (réelle, 2026-10-08)

- Ouverture de `/` → clic module « Phrasier Académique » :
  - compteur affiché : **« 138 phrases »** (avant : 101) ;
  - attribution visible : **« Enrichi d'après Academic Phrasebank — The
    University of Manchester »** (lien externe) ;
- recherche « largement admis » → la phrase `man-nua-nuancer-2` « Il est
  largement admis que {proposition}. » **VISIBLE** ;
- filtre de fonction « Nuancer » : compteur passé à 26 (hedges `man-` inclus) ;
- **0 erreur console** (agent-browser errors : vide).
