# Article scientifique — Option B « Parcours complet » (cycle n°16)

## Problème
L'option A livre le socle ; le cahier des charges demande en outre : analyse des sources (résumé d'extraction, sections repérées, qualité, éléments manquants), choix d'angle parmi des propositions quand la thèse contient plusieurs études (choix utilisateur OBLIGATOIRE avant génération), garde-fou anti-fragmentation, régénération préservant le reste, versions manipulables, résumé structuré ou non selon consignes.

## Comportement attendu
- CA-B1 Étant donné des sources choisies, quand je lance « Analyser les sources », alors un rapport affiche : volume par source, sections repérées, études détectées, éléments manquants (méthodologie/résultats/bibliographie), qualité globale. Vérifiable UI + API.
- CA-B2 Étant donné ≥ 2 études détectées, quand je demande des angles, alors l'IA propose plusieurs angles argumentés ET un avertissement anti-fragmentation s'affiche (risque de redondance/fragmentation artificielle) ; aucun article n'est généré automatiquement par étude. Vérifiable UI + API.
- CA-B3 Étant donné des angles proposés, quand je n'en ai pas choisi un, alors la génération est bloquée avec un message explicite ; quand j'en choisis un, il alimente la consigne « angle ». Vérifiable UI.
- CA-B4 La régénération d'une section ne touche pas les autres sections (re-prouvé : la route ne modifie qu'une section). Vérifiable API.
- CA-B5 Les versions sont listées avec label+date et restaurables (déjà livré en A — re-recetté ici). Vérifiable UI/API.
- CA-B6 Le résumé est structuré ou non selon les consignes (champ consignes revue transmis au prompt de la section Résumé). Vérifiable par test du prompt.

## Hors périmètre (option C)
OCR, jobs asynchrones, traduction intégrée, panneau affirmation-par-affirmation (la traçabilité reste par section), guide auteur uploadé en fichier (collage texte conservé).

## Zones floues — arbitrées sous délégation
1. Détection d'études → blocs `experiment` (verdicts) + titres de sections importées — heuristique honnête, sans prétention.
2. Analyse → pure (sans IA) : déterministe et instantanée ; les angles restent générés par IA.
3. Blocage de génération sans angle → uniquement quand ≥ 2 études détectées ET angles proposés (sinon l'angle reste optionnel).
