# Article scientifique — Option C (cycle n°17)

## Problème
Restent du cahier des charges : la **traduction linguistique distincte** de la transformation (préserver sens, données, nuances, citations — jamais de contenu nouveau), et une vue **multi-articles**. L'OCR et les jobs asynchrones étaient conditionnés à « une solution compatible » — l'analyse préliminaire (§ 6) exigeait pour l'OCR un **cycle d'étude dédié** (lib lourde, rendement incertain sur scans réels, impact build Tauri).

## Comportement attendu
- CA-C1 Étant donné une section (ou l'article entier), quand je demande une traduction vers la langue cible, alors le sens, les données, les nuances et les citations sont préservés, AUCUN contenu scientifique nouveau n'est ajouté, et le résultat est une COPIE distincte (les sections originales restent intactes). Vérifiable API + règles du prompt (tests) + live.
- CA-C2 Étant donné plusieurs articles, quand j'ouvre le module, alors une vue d'ensemble affiche titre, type, statut, nombre de sections, repères « à compléter/vérifier » par article. Vérifiable UI.

## Différé explicite (consigné, hors périmètre de ce cycle)
- **OCR** (tesseract.js) : cycle d'étude dédié requis (données linguistiques ~10-40 Mo téléchargées, perf scans réels inconnue, vérification build Tauri Windows) — conformément à l'analyse préliminaire § 6 ; la détection de PDF scanné + le refus honnête (déjà livrés en A) restent le comportement.
- **Jobs asynchrones** : couplés à l'OCR (le seul traitement lent) — différés avec lui ; les imports ≤ 20 Mo restent synchrones (prouvés rapides).
