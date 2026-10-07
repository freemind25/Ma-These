# Plan — Option C
## Approche
1. prompts.ts : buildTranslationPrompt (règles verbatim : préserver sens/données/nuances/citations, n'ajouter RIEN, unités intactes, citer les mêmes sources) + parse.
2. `/api/articles/translate` (POST {articleId|sections, targetLang, scope: "section"|"article"}) → COPIE traduite renvoyée au client ; l'original inchangé ; l'utilisateur enregistre la copie comme nouvelle version ou nouvel article (via PUT/POST existants).
3. UI : bouton « Traduire » par section (étape 5) + choix de langue ; le résultat s'affiche dans un panneau distinct avec « Enregistrer comme version ».
4. Vue multi-articles : panneau récapitulatif (titre, type, statut, sections, repères à compléter) au-dessus de la liste.
## Fichiers touchés
prompts.ts (+test) · /api/articles/translate/route.ts · article-redaction-page.tsx · docs · specs.
## Vérification
vitest (règles traduction) ; curl live (traduction fr→en de la section de recette : chiffres 42/78 % conservés, pas de contenu nouveau) ; UI boutons ; suite ; redlines.
