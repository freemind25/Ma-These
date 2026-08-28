# Analyse de données appliquée — Spécificités urbaines et spatiales (Rae & Wong, 2021)

> Source : Rae & Wong, *Applied Data Analysis for Urban Planning and Management* (SAGE, 2021)
> Orientation : analytique urbaine, données spatiales, big data pour la planification.
> Anti-doublon : ce module couvre des techniques et pièges absents de Kumar (méthodologie générale) et Salkind (statistiques descriptives/inférentielles de base). Aucune redondance avec les tests t, ANOVA, chi-carré ou la validité d'échelle.

---

## 1. Choix de modèle analytique en contexte urbain

SI la question porte sur des relations spatiales avec dépendance entre zones voisines ALORS utiliser un modèle d'autorégression spatiale (SAR). Le SAR capture l'effet qu'une variable dans une zone a sur les zones adjacentes — l'OLS classique ignore cette dépendance et produit des estimateurs biaisés.

SI les relations entre variables varient selon la localisation géographique (non-stationnarité spatiale) ALORS utiliser la régression pondérée géographiquement (GWR). Le GWR estime des paramètres locaux pour chaque unité spatiale, révélant les hétérogénéités régionales qu'un modèle global masque.

SI les données urbaines présentent des relations non-linéaires entre de nombreuses variables issues de capteurs ou de sources big data ALORS privilégier les algorithmes de machine learning (clustering, classification). Attention : le ML identifie des patterns mais ne fournit pas d'interprétation causale utilisable pour la planification — toujours compléter par un modèle statistique interprétable.

SI les individus (niveau 1) sont imbriqués dans des quartiers ou des unités administratives (niveau 2), comme c'est systématiquement le cas en contexte urbain ALORS utiliser un modèle à effets mixtes (multilevel modelling) plutôt que l'OLS. Un OLS sur données hiérarchisées produit des erreurs standard sous-estimées et des résultats sur-optimistes. Vérifier par un test de rapport de vraisemblance (likelihood ratio test) que la variance inter-groupe est significative avant de justifier le multilevel.

## 2. Le paradoxe du big data urbain

SI les données sont volumineuses mais générées passivement (capteurs, traces numériques, réseaux sociaux) ALORS leur portée est en réalité étroite : elles sont orientées par le marché, excluent les populations non connectées et ne contiennent pas d'attributs socio-économiques individuels. Le volume ne compense pas le biais de couverture.

SI on utilise du big data urbain pour construire des indicateurs ALORS considérer ces données comme des échantillons sélectifs. Puisque la population complète est inconnue, il est impossible d'estimer précisément le biais et l'erreur de mesure impliqués.

SI le big data spatial est exploité pour des prédictions (ex. : prédiction de revenus via Google Street View) ALORS un R² de 0,60-0,77 est considéré comme acceptable dans les pays en développement où les données fiables manquent, mais insuffisant dans les contextes disposant de données administratives robustes. Toujours contextualiser le seuil de performance acceptable.

SI le big data est à la fois volumineux et de haute fréquence temporelle ALORS il favorise le court-termisme analytique. Contre-mesure : exiger un cadrage théorique explicite (« big theory » pour « big data ») pour éviter que l'analyse ne se réduise à la description du moment.

## 3. Intégration de données multi-sources

SI l'analyse combine des données de résolutions, fréquences de mise à jour et systèmes de référence spatiale différents ALORS s'attendre à une incohérence MAUP-étendue (problème de l'unité aréolaire modifiable). Les résultats changent significativement selon le découpage spatial et l'agrégation temporelle choisis — et ce problème est amplifié avec les données big data par rapport aux données administratives classiques.

SI des données raster (satellite, télédétection) sont combinées avec des données vecteur (SIG, services cartographiques) ALORS l'interopérabilité exige une harmonisation préalable des systèmes de coordonnées et des résolutions. Le passage d'un niveau fin à un niveau agrégé entraîne une perte de détail et une potentielle distortion des résultats.

SI les données nécessitent un regroupement (clustering spatial) pour être alignées entre elles ALORS ce traitement peut lui-même introduire des artefacts. Documenter le protocole d'agrégation et tester la sensibilité des résultats au niveau de granularité choisi.

## 4. Indicateurs urbains : pièges spatio-temporels

SI les indicateurs servent à surveiller des politiques de planification à travers le temps ALORS distinguer les indicateurs de contexte (conditions socio-économiques influencées par de multiples facteurs) des indicateurs de résultat (effets potentiels de la planification). L'attribution causale est presque impossible : les résultats sont les effets combinés du système de planification et de forces extérieures.

SI l'échelle géographique de mesure diffère de l'échelle fonctionnelle du phénomène étudié ALORS on est en situation de « désaccord d'échelle » (scalar mismatch). Exemple : une ville sous-délimitée administrativement (under-bounded) ou sur-délimitée (over-bounded) produit des indicateurs trompeurs. Les aires fonctionnelles (ex. : zones de navettage) changent dans le temps, souvent en réponse à la planification elle-même.

SI les indicateurs sont comparés entre plusieurs échelles spatiales ALORS adopter une approche multi-scalaire : la variabilité des indicateurs diminue dans les petites zones mais l'hétérogénéité intra-zone augmente dans les grandes. Aucune échelle unique ne suffit.

SI des données big data sont utilisées pour des indicateurs de flux dynamiques (mobilité, usage) ALORS elles ne fournissent pas les données d'attribut nécessaires pour des analyses socio-économiques nuancées. Le seul moyen de lier flux et attributs passe par des données d'enquête ou de recensement.

## 5. Qualité des données géographiques participatives

SI des données géographiques participatives (OpenStreetMap, crowdsourcing) sont utilisées ALORS évaluer leur qualité selon la norme ISO 19157:2013 : complétude, exactitude thématique, cohérence logique, qualité temporelle, élément d'utilisabilité et exactitude positionnelle.

SI les données participatives proviennent de plateformes à réputation internationale (OSM, Wikimapia) ALORS la marge d'erreur positionnelle est généralement < 10%. Si elles proviennent de plateformes locales, la marge d'erreur est plus élevée et l'évaluation qualité est indispensable.

SI les contributeurs sont de profils, âges et niveaux d'éducation variés ALORS la qualité des données se dégrade. Les administrateurs de plateformes participatives doivent avoir une formation en géodésie, géographie ou cartographie pour corriger les erreurs.

## 6. Gouvernance analytique : planning-led vs planning-lag

SI l'analyse de données conduit la planification (data-driven) sans cadrage par les questions de politique publique ALORS le risque est un « planning-lag » : la technologie de l'analyse précède la capacité de la planification à l'utiliser, produisant des analyses hors-sujet ou politiquement naïves.

SI les instruments de données sont déployés ALORS ils sont chargés de politique et d'idéologie — ils projettent certains futurs urbains et en excluent d'autres. Le cadrage du problème et la connaissance des politiques doivent précéder et guider l'extraction de l'intelligence des données.

SI les données big data et les données traditionnelles sont disponibles ALORS adopter systématiquement une approche hybride : les données traditionnelles (recensement, enquêtes) fournissent attributs et profondeur ; les données big data fournissent fréquence et couverture spatiale. Aucune source ne peut se substituer à l'autre.

SI un tableau de bord urbain (city dashboard) est conçu ALORS appliquer les principes d'ingénierie utilisateur de Hansen (1971) : les exigences, compétences et connaissances des utilisateurs cibles doivent déterminer l'architecture — exploratoire/multidimensionnelle pour les experts, narrative/présentationnelle pour le public. Éviter les dashboards conçus sur des suppositions sans engagement réel avec les utilisateurs.
