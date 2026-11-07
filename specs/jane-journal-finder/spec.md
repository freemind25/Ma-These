# Jane — Trouver le bon journal / auteur / article pour publication

## Problème

Le module « Journaux OA » permet de **chercher un journal par mot-clé** (OpenAlex + DOAJ), mais pas d'**obtenir des suggestions ciblées pour un manuscrit précis** : le doctorant qui termine un article doit deviner où soumettre. L'outil public de référence pour cette tâche en biomédecine/santé est **Jane (Journal/Author Name Estimator)** — https://jane.biosemantics.org/ (Schuemie, Kors & Hettne, Texas Health Science Center / OHDISI) : on y colle le titre et/ou le résumé, et Jane compare le document à des millions de références de PubMed pour suggérer les journaux, auteurs et articles les plus similaires, avec un score de confiance.

Aujourd'hui Ma Thèse n'intègre Jane nulle part : le doctorant doit sortir de l'application, coller son résumé sur le site, et perdre les résultats hors de son espace de travail.

## Utilisateur concerné

Doctorant préparant la publication d'un article (rôle principal). Cas d'usage principal : disciplines couvertes par PubMed (biomédecine, santé publique, sciences de la vie) — les autres disciplines continuent d'utiliser le catalogue OpenAlex/DOAJ de l'onglet « Catalogue OA ».

## Comportement attendu

US-1 — En tant que doctorant, je veux **coller le titre et/ou le résumé de mon manuscrit et obtenir les journaux suggérés par Jane**, afin de choisir où soumettre sans quitter l'application.
  CA-1.1 Étant donné un texte de 10 à 5 000 caractères collé dans l'aire Jane, quand je clique « Trouver des journaux », alors la liste des journaux suggérés s'affiche triée par confiance décroissante, chacun avec son score de confiance (%), ses badges (accès ouvert de qualité, Medline-indexé, PMC) et son score d'influence d'article (Article Influence + percentile) quand disponibles.
  CA-1.2 Étant donné un texte de moins de 10 caractères (ou vide), alors les trois boutons d'action sont désactivés.
  CA-1.3 Étant donné une réponse Jane qui ne contient aucune suggestion exploitable, alors un message d'état vide explicite s'affiche (pas d'erreur générique).

US-2 — En tant que doctorant, je veux **trouver les auteurs qui publient sur mon sujet** (mode « Trouver des auteurs »), afin d'identifier des experts ou de futurs co-auteurs/relecteurs.
  CA-2.1 Chaque auteur suggéré affiche son nom, son score de confiance et ses PMIDs de référence cliquables vers PubMed (lien https://pubmed.ncbi.nlm.nih.gov/<pmid>).

US-3 — En tant que doctorant, je veux **trouver les articles les plus similaires à mon manuscrit** (mode « Trouver des articles »), afin de situer mon travail dans la littérature existante et d'identifier les journaux qui publient sur le sujet.
  CA-3.1 Chaque article suggéré affiche les auteurs, le titre, le journal, l'année, le pourcentage de similarité et un lien direct vers PubMed.

US-4 — En tant que doctorant, je veux **restreindre les suggestions par langue de publication et par type de publication**, afin d'aligner les suggestions sur les exigences de mon école doctorale.
  CA-4.1 Les filtres optionnels (7 langues, types de publication MeSH) sont regroupés dans une section repliable ; aucun filtre actif par défaut (comportement Jane natif).
  CA-4.2 Les filtres sont transmis à Jane uniquement lorsqu'au moins une case est cochée.

US-5 — En tant que doctorant, je dois **comprendre le périmètre et les limites de Jane** avant de l'utiliser.
  CA-5.1 Un encart d'information précise que Jane compare le document au corpus PubMed (biomédecine/santé/sciences de la vie) et que le service est externe (le texte envoyé transite par jane.biosemantics.org) ; il rappelle l'existence de l'onglet « Catalogue OA » pour les autres disciplines.
  CA-5.2 L'onglet Jane est accessible depuis le module « Journaux OA » via un sélecteur d'onglet (« Catalogue OA » / « Jane — Où publier ? ») sans régression du comportement existant du catalogue.

US-6 (technique) — La route API `/api/jane` proxifie Jane côté serveur.
  CA-6.1 POST `/api/jane` accepte `{ text, mode: "journals"|"authors"|"papers", languages?, publicationTypes? }` et renvoie du JSON normalisé ; les erreurs réseau/timeout Jane renvoient une erreur 502 avec message exploitable par l'UI.
  CA-6.2 La réponse HTML de Jane (`suggestions.php`) est parsée côté serveur : journaux (confidence, badges OA/Medline/PMC, Article Influence + percentile), auteurs (nom, confidence, PMIDs), articles (PMID, auteurs, titre, journal, année, similarité).
  CA-6.3 Les suggestions de référence (« The confidence score … is based on these articles ») ne sont jamais exposées comme résultats.

## Hors périmètre (cette itération)

- Sauvegarde des suggestions dans l'espace de travail (favoris) — la sélection d'un journal reste à traiter avec le catalogue OA existant.
- Mode « Trouver des articles » en suivi de veille (rattachement à la veille académique).
- Scramble (anonymisation native de Jane) — l'encart informe que le texte est envoyé au service externe ; l'utilisateur conserve le contrôle de ce qu'il colle.
- Intégration « classification IA » des suggestions Jane (l'existant « Classer par IA » du catalogue ne s'applique pas aux scores Jane, déjà ordonnés).

## Décisions de clarification (conservatrices, modifiables à la recette)

1. **Emplacement** : onglet « Jane — Où publier ? » dans le module « Journaux OA » (même famille fonctionnelle que l'actuel « Catalogue OA », qui couvre la même tâche par mots-clés) — pas de nouveau module dans la barre latérale (évite la surcharge : 46 modules existants).
2. **Parsé HTML, pas d'API JSON** : Jane n'expose pas d'API publique structurée ; le parseur cible la structure stable observée (bars `bluebar`/`orangebar`, champs cachés `authorName`/`authorPMIDs`, checkbox `PMID_*`). Toute évolution du HTML de Jane se traduira par une erreur 502 explicite.
3. **Texte max 5 000 caractères** : couvre titre + résumé courant ; au-delà, Jane est de toute façon prévu pour titre/résumé.
4. **Aucune persistance** : la requête et les résultats restent en mémoire du composant (cohérent avec l'état actuel du catalogue OA) — conformité avec le message « le texte est envoyé au service externe » de l'encart.
