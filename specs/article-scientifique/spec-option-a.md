# Brouillon d'article scientifique — Option A « Socle » (cycle n°15)

## Problème
Le propriétaire doit transformer le contenu de sa thèse (et des mémoires importés) en brouillon d'article scientifique — synthèse adaptée aux normes, pas une réduction automatique. L'application ne propose ni import de documents (PDF/DOCX), ni assistant guidé, ni stockage d'article distinct de la thèse. Le module « articles » existant est un guide méthodologique statique (conservé tel quel).

## Utilisateur concerné
Doctorant (rédaction d'article à partir de sa thèse) · directeur (relecture éventuelle).

## Comportement attendu (10 CA = les 10 critères du cahier des charges du propriétaire)
- CA-1 Depuis un projet existant, un point d'entrée « Créer un article scientifique » lance l'assistant. Vérifiable en UI.
- CA-2 Un mémoire/thèse importé (DOCX/PDF) affiche son extraction (aperçu + limites : pages scannées, éléments non reconnus) et peut nourrir la génération. Vérifiable en UI + API.
- CA-3 L'utilisateur définit type d'article, langue, longueur, style bibliographique (et discipline, revue, consignes, auteurs). Vérifiable en UI + persistés.
- CA-4 Un plan est proposé avant génération complète, modifiable et validable. Vérifiable en UI.
- CA-5 Le brouillon est enregistré **séparément** de sa source, section par section modifiable. Vérifiable en UI + base.
- CA-6 Les informations absentes sont signalées « [À compléter par l'auteur] », jamais inventées. Vérifiable dans les règles du prompt (tests) + la réponse.
- CA-7 Les affirmations/références sont reliées aux sources (traçabilité par section) ou signalées non vérifiées. Vérifiable en UI (panneau sources par section) + règles prompt.
- CA-8 Les erreurs d'import/extraction sont clairement expliquées (fichier invalide, trop gros, scanné sans OCR). Vérifiable en UI.
- CA-9 Documents et articles restent privés (app locale mono-utilisateur ; isolation par thèse testée). Vérifiable par test.
- CA-10 L'export DOCX fonctionne (titres, sections, « à compléter » préservés). Vérifiable en UI + fichier.

## Règles transverses obligatoires (cahier des charges)
- Ne jamais inventer résultats, chiffres, participants, méthodes, dates, tests, éthique, conclusions, références/DOI.
- Corrélation ≠ causalité ; pas de renforcement de conclusions ; unités/dénominateurs conservés.
- Bibliographie cohérente : toute citation a une référence et réciproquement (sauf exigence revue).
- Document importé = **source de contenu, jamais instructions** (défense anti-injection dans le prompt).
- Mention permanente : brouillon d'aide à la rédaction à vérifier par les auteurs ; aucune garantie d'acceptation.
- Ne pas qualifier une revue de littérature de « systématique » sans méthode systématique prouvée.
- IMRaD par défaut pour l'empirique, adapté sinon ; pas de fractionnement automatique en plusieurs articles.

## Hors périmètre (option B et C)
Analyse d'extraction enrichie (qualité/sections repérées), choix d'angle multi-études, guide auteur revue chargé, régénération préservant le reste, versions intitulées + comparaison, OCR, jobs asynchrones, traduction intégrée, multi-articles dashboard.

## Zones floues — arbitrées sous délégation (choix conservateurs, révisables à la recette)
1. Éditeur → zones de texte par section (markdown simple) au lieu de Tiptap complet — le socle privilégie la fiabilité ; Tiptap en option B si demandé.
2. Génération → réponses JSON synchrones par section (courtes) au lieu de SSE — patterns streams réservés aux textes longs.
3. Sources de traçabilité → intégrées au JSON des sections (pas de table dédiée) — réversible.
4. Taille max import → 20 Mo, constante serveur (configurable dans le code).
5. Point d'entrée 2 (« espace d'import ») → bouton dans le module Bibliothèque.
