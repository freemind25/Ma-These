// Guidance Knowledge Base — 9 generic + 7 discipline-specific fiches for the Directeur IA
// Discipline-specific fiches are imported from fiches-archi-urba.ts
// Each fiche is a focused, self-contained knowledge card.

// ─────────────────────────────────────────────
// FICHE 1: Les 9 étapes d'un projet doctoral
// ─────────────────────────────────────────────
export const FICHE_ETAPES = {
  id: 'fiche-etapes',
  title: 'Les 9 étapes d\'un projet doctoral',
  content: `# Les 9 étapes d'un projet doctoral

Séquence de jalons vérifiables pour positionner un doctorant et proposer la tâche suivante.

## 1. Préparer
Clarifier le niveau d'exigence (mémoire vs. thèse doctorale), identifier les contraintes institutionnelles (règlement, calendrier, gabarit), choisir l'encadrant selon pertinence disciplinaire, disponibilité réelle et compatibilité de méthode de travail.

## 2. Explorer
Délimiter le champ avant de figer la question : cartographier les débats, revues de référence, auteurs incontournables du sous-champ. Vérifier la faisabilité (accès données/terrain, durée, moyens).

## 3. Lire (revue exploratoire)
Lire pour comprendre le paysage, puis repérer le vide à combler. Tenir un système de prise de notes homogène dès cette étape (fiche par source : référence, résumé une phrase, citation utile, position critique).

## 4. Concevoir
Construire le design de recherche : question(s), hypothèses, méthodologie, unité d'analyse, corpus/terrain. Anticiper les autorisations (éthique, terrain) — délais souvent sous-estimés.

## 5. Proposer
Rédiger la proposition/protocole : énoncé du problème, état de la littérature, méthodologie. La traiter comme un contrat avec l'encadrant et le comité.

## 6. Expérimenter / enquêter
Distinguer dans le journal de recherche ce qui relève de la collecte de ce qui relève de l'interprétation.

## 7. Analyser
Réserver un temps d'analyse dédié avant d'écrire les résultats. Rédiger prématurément pousse à sélectionner les données qui confirment une histoire déjà en tête.

## 8. Rédiger
La rédaction fait partie du processus de clarification, pas seulement sa mise en forme. Rédiger dans l'ordre qui débloque le plus vite (souvent : méthodologie → résultats → littérature → introduction → conclusion).

## 9. Défendre puis diffuser
La thèse n'est pas le point d'arrivée de la diffusion scientifique — prévoir les publications dès la conception si le règlement le permet.

## Comment utiliser avec un étudiant
1. Poser : « à quelle étape es-tu, concrètement, en ce moment ? »
2. Ne proposer que la tâche de l'étape courante ou suivante.
3. Rappeler qu'un retour en arrière est normal.`,
}

// ─────────────────────────────────────────────
// FICHE 2: Techniques d'écriture et déblocage rédactionnel
// ─────────────────────────────────────────────
export const FICHE_ECRITURE = {
  id: 'fiche-ecriture',
  title: 'Techniques d\'écriture et déblocage rédactionnel',
  content: `# Techniques d'écriture et déblocage rédactionnel

Écrire n'est pas la mise en forme d'une pensée terminée, c'est un outil pour penser.

## Modes d'écriture (toolbox)

### Écriture libre (freewriting)
Séance chronométrée (5-10 min), sur une question précise. Règle : ne pas s'arrêter, ne pas corriger, ne pas juger. Le texte produit n'est presque jamais utilisable tel quel — c'est normal.

### Écriture génératrice
Variante ciblée : amorce de phrase liée au chapitre ("Ce chapitre montre que…", "La question que je pose ici est…", "Ce que les données suggèrent, c'est…").

### Écriture en couches
- Passage 1 : structure et idées, sans citations ni style
- Passage 2 : références, données, transitions
- Passage 3 : polissage du style et cohérence terminologique
Cela empêche le blocage sur la première phrase.

### Écriture régulière vs. intensive
Régulière (30-60 min, plusieurs fois/semaine) construit une habitude. Les sessions intensives peuvent débloquer mais ne doivent pas devenir le seul mode.

## Structure du paragraphe
Un paragraphe académique = mini-argument : phrase d'ancrage, développement, preuve, retour au propos. Transitions : annoncer (forecasting) avant de développer, rappeler (signposting) ce qui vient d'être établi.

## Diagnostiquer le blocage
- **Cognitif** (contenu pas assez clair) → revoir la littérature ou l'analyse, pas plus d'heures d'écriture
- **Perfectionnisme** (contenu là mais n'ose pas écrire imparfaitement) → prescrire freewriting ou écriture en couches, autoriser explicitement un premier jet médiocre
- **Audience** (ne sait pas pour qui il écrit) → clarifier le lecteur visé
- **Logistique** (lieu, horaire, interruptions) → travailler sur les conditions matérielles

## Clôture et révision
Chaque chapitre a besoin d'une clôture provisoire avant de passer au suivant. Révision globale : cohérence de l'argument, cohérence terminologique, annonce/rappel entre chapitres.

## Comment utiliser avec un étudiant
1. Identifier quel type de blocage est en jeu AVANT de proposer une technique
2. Ne jamais suggérer « écris plus » sans préciser dans quel mode
3. Autoriser explicitement le texte imparfait au premier jet`,
}

// ─────────────────────────────────────────────
// FICHE 3: Structure rhétorique attendue par chapitre
// ─────────────────────────────────────────────
export const FICHE_RHETORIQUE = {
  id: 'fiche-rhetorique',
  title: 'Structure rhétorique attendue par chapitre',
  content: `# Structure rhétorique attendue par chapitre

## Types de structure de thèse
- Traditionnelle simple : intro, revue, méthodologie, résultats, discussion, conclusion
- Traditionnelle complexe : plusieurs chapitres résultats/discussion imbriqués
- Par thème/topique : organisée autour de questions plutôt que la séquence méthodologique
- Par compilation/articles : suite d'articles encadrés par intro + conclusion de synthèse
Demander explicitement quel type est imposé avant de conseiller la structure.

## Introduction : territoire → créneau → occupation
1. Établir le territoire (contexte, importance, ce qu'on sait)
2. Établir le créneau (ce qui manque, le problème non traité — souvent bâclé)
3. Occuper le créneau (objectifs, annonce de plan)
Diagnostic : si l'intro ne contient que l'étape 1 et saute à « dans cette thèse », le créneau manque.

## Revue de littérature
- Organiser par thème ou débat, jamais par liste chronologique de sources
- Verbes de rapport variés et positionnés (« montre que », « suggère », « conteste », « nuance »)
- Présent pour faits établis et positions théoriques, passé pour études spécifiques
- Distinguer résumer (reformuler une source) et synthétiser (mettre plusieurs sources en dialogue)

## Méthodologie
- Justifier les méthodes par rapport à la question, pas seulement les décrire
- Justifier l'unité d'analyse (pourquoi ce cas, cet échantillon, ce corpus)
- Décrire et évaluer les limites des sources de données

## Résultats
- Neutralité maximale, réserver l'interprétation à la discussion
- Référencer explicitement tableaux et figures dans le texte

## Discussion et conclusion
- Remonter du particulier vers le général
- Langage de nuance mesurée (« suggère », « il est possible que »)
- Structure : contribution → limites → implications → pistes futures (en terminant sur l'apport, pas sur les limites)

## Résumé/Abstract
Compresser en un paragraphe : problème, méthode, résultats, implication. Rédiger en dernier.`,
}

// ─────────────────────────────────────────────
// FICHE 4: Navigation institutionnelle et soutenance
// ─────────────────────────────────────────────
export const FICHE_INSTITUTIONNELLE = {
  id: 'fiche-institutionnelle',
  title: 'Navigation institutionnelle et soutenance',
  content: `# Navigation institutionnelle et soutenance

## Règles non dites
Les règlements décrivent les étapes formelles mais rarement la dimension relationnelle : comment se négocie le rythme de travail, comment se gère un désaccord avec un membre du comité. Conseiller à l'étudiant de chercher les sources informelles (anciens doctorants, secrétariat).

## Relation d'encadrement
- Le choix repose aussi sur disponibilité réelle et compatibilité de style de travail
- Formaliser tôt un rythme explicite d'échange (fréquence, délai de retour)
- Un retour critique sévère est normal, pas un jugement sur la valeur du doctorant

## Proposition comme point de référence
Y revenir explicitement en cas de doute sur la direction prise.

## Dimension sociale
L'isolement est un facteur de risque documenté, indépendamment de la qualité du travail. Soutien par les pairs = facteur de persévérance.

## Préparer la soutenance
- Exercice distinct de la rédaction (compétences orales et argumentation en temps réel)
- Relire la thèse en se mettant à la place d'un lecteur externe
- Lister les faiblesses anticipées et préparer des réponses assumées
- Organiser une simulation de soutenance
- Le rôle du jury est d'évaluer, pas de piéger
- Corrections post-soutenance = processus normal

## Comment utiliser avec un étudiant
1. Ne pas traiter une difficulté relationnelle comme un problème d'écriture
2. Rappeler que ces difficultés sont documentées comme fréquentes
3. Proposer un exercice concret (liste faiblesses + réponses, simulation) pour la soutenance`,
}

// ─────────────────────────────────────────────
// FICHE 5: Normes de citation et cohérence éditoriale
// ─────────────────────────────────────────────
export const FICHE_NORMES = {
  id: 'fiche-normes',
  title: 'Normes de citation et cohérence éditoriale',
  content: `# Normes de citation et cohérence éditoriale

## Systèmes de citation
- Notes-bibliographie : note de bas de page + biblio en fin. Dominant en SHS, histoire, arts.
- Auteur-date : appel court dans le texte (auteur, année) + liste de références. Dominant en sciences sociales et exactes.
- Ne jamais mélanger les deux systèmes. Vérifier le système imposé par l'établissement.

## Principes généraux
- Citer toute idée, donnée ou formulation empruntée, y compris reformulée
- Citations directes : rares et brèves, privilégier la paraphrase intégrée au raisonnement
- Citation longue (>100 mots) : bloc détaché, retrait, sans guillemets
- Toujours vérifier une citation ou donnée chiffrée contre la source originale

## Cohérence éditoriale
L'incohérence (majuscule tantôt oui/non, nombres tantôt en chiffres/lettres) est plus remarquée que le choix de convention lui-même.
- Ponctuation : cohérence guillemets, tirets, deux-points
- Majuscules : règle fixe pour titres de section et concepts propres
- Abréviations : introduire en toutes lettres à la première occurrence
- Nombres : convention fixe et tenue (ex. 1-9 en lettres, 10+ en chiffres)

## Tableaux et figures
- Numérotation continue + légende descriptive (compréhensible isolément)
- Toujours référencer explicitement dans le texte
- Source des données indiquée si non produite par l'auteur

## Point de vigilance
Les exigences de mise en forme (Chicago/Turabian) sont des conventions nord-américaines. Le rôle d'un outil est de faire respecter le gabarit local, pas la convention Chicago par défaut.

## Comment utiliser avec un étudiant
1. Toujours vérifier le système imposé localement avant tout conseil
2. Traiter les alertes comme cohérence interne, pas conformité absolue
3. Signaler l'usage excessif de citations directes comme signal de synthèse insuffisante`,
}

// ─────────────────────────────────────────────
// FICHE 6: Études bibliométriques
// ─────────────────────────────────────────────
export const FICHE_BIBLIOMETRIE = {
  id: 'fiche-bibliometrie',
  title: 'Études bibliométriques : conduire et interpréter',
  content: `# Études bibliométriques : conduire et interpréter

Guide pratique pour concevoir, mener et interpréter une étude bibliométrique dans le cadre doctoral.

## Quand l'utiliser

Quand le doctorant doit : positionner son champ de recherche quantitativement, analyser la production scientifique d'un domaine, identifier les auteurs/institutions/pays clés, ou évaluer l'impact de revues.

## Étapes d'une étude bibliométrique

1. **Définir la question de recherche bibliométrique** : que mesure-t-on et pourquoi ? (productivité, collaboration, impact, thématiques émergentes)
2. **Choisir la/les base(s) de données** : WoS, Scopus, Google Scholar — chacune a sa couverture, ses forces et ses limites. Le choix dépend de la discipline et du type d'analyse.
3. **Construire la requête documentaire** : mots-clés, opérateurs booléens, troncature, champs. Documenter la requête pour reproductibilité.
4. **Exporter et nettoyer les données** : éliminer les doublons, vérifier les affiliations, normaliser les noms d'auteurs.
5. **Analyser** : choisir les indicateurs pertinents (pas tous) selon la question.
6. **Interpréter avec nuance** : un indicateur seul ne suffit jamais — le croisement est nécessaire.

## Indicateurs clés et quand les utiliser

- **Productivité temporelle** : nombre de publications par an → tendance d'un champ, point de bascule
- **Productivité par auteur/institution/pays** : qui publie le plus → identification des acteurs clés
- **Indice de collaboration** : proportion de publications co-écrites → densité du réseau collaboratif
- **Réseaux de co-auteurs** : cartographie des collaborations → structure communautaire
- **Facteur d'impact (JCR)** : citations reçues / articles publiés (2 ans) → visibilité d'une revue. Attention : ne pas comparer facteurs d'impact entre disciplines
- **Facteur d'impact à 5 ans** : même calcul sur 5 ans → plus stable pour les domaines à citation lente
- **Indice h** : nombre d'articles avec h citations chacun → productivité + impact combinés d'un chercheur
- **Publication Efficiency Index (PEI)** : (citations du pays / citations totales) / (publications du pays / publications totales) → l'impact correspond-il à l'effort ?
- **Half-life des citations** : durée médiane pour qu'un article soit cité → vitesse de diffusion

## Pièges courants

- Comparer des indicateurs entre disciplines (le facteur d'impact en mathématiques ≠ en biomédecine)
- Utiliser un seul indicateur pour tirer une conclusion
- Ignorer les biais de base de données (couverture disciplinaire, langue, zone géographique)
- Ne pas documenter la requête de recherche (perte de reproductibilité)
- Confondre nombre de citations et qualité intrinsèque

## Comment utiliser avec un étudiant

1. Toujours commencer par la question : qu'est-ce qu'on veut mesurer et pourquoi ?
2. Choisir max 3-4 indicateurs pertinents, pas tout le catalogue
3. Rappeler qu'une étude bibliométrique ne remplace pas une revue de littérature qualitative — elle la complète`,
}

// ─────────────────────────────────────────────
// FICHE 7: Stratégies de recherche documentaire
// ─────────────────────────────────────────────
export const FICHE_RECHERCHE_DOCUMENTAIRE = {
  id: 'fiche-recherche-documentaire',
  title: 'Stratégies de recherche documentaire',
  content: `# Stratégies de recherche documentaire

Méthodes systématiques pour chercher, sélectionner et suivre la littérature scientifique.

## Quand l'utiliser

Quand le doctorant débute sa revue de littérature, a du mal à trouver des sources pertinentes, ou doit mettre en place une veille documentaire.

## Développer une requête de recherche efficace

1. **Identifier les aspects principaux** du sujet (décomposer en 2-4 concepts)
2. **Lister les synonymes et termes alternatifs** pour chaque concept (anglais/français, abréviations, termes voisins)
3. **Appliquer les techniques de recherche** :
    - **Recherche de phrase** : guillemets doubles pour chercher une expression exacte ("climate change")
    - **Troncature** : astérisque pour les variantes d'un mot (environment* → environment, environments, environmental)
    - **Caractère générique** : point d'interrogation pour une lettre (colo?r → color, colour)
    - **Opérateurs booléens** : AND (restreindre), OR (élargir), NOT (exclure — utiliser avec prudence)
4. **Combiner** : (concept1 OR synonyme1) AND (concept2 OR synonyme2)

## Bases de données : choisir la bonne

- **Google Scholar** : bon point de départ, couverture large mais inégale, pas de contrôle de qualité. Permet les alertes et les profils auteurs
- **WoS / Scopus** : bases de données disciplinaires avec métadonnées structurées, indicateurs de citation, filtrage avancé. Essentielles pour une revue systématique
- **Bases de données spécialisées** : chaque discipline a ses bases (PubMed, PsycINFO, IEEE Xplore, etc.) — consulter les guides de la bibliothèque
- **Google avancé** : utile pour la littérature grise, rapports institutionnels, données gouvernementales

## Citer ses sources dès le départ

- Utiliser un gestionnaire de références (Zotero, Mendeley, EndNote) DÈS les premières recherches
- Exporter systématiquement les résultats de recherche vers le gestionnaire
- Les métadonnées exportées incluent généralement : auteur, titre, journal, année, DOI — vérifier leur exactitude

## Revue systématique : les exigences supplémentaires

- Protocole écrit AVANT la recherche (question PICO/PCC, critères d'inclusion/exclusion)
- Recherche documentée et reproductible dans au moins 2 bases de données
- Tamisage en deux étapes : titre/résumé puis texte intégral
- Évaluation critique des articles retenus (grilles validées)
- Synthèse : qualitative (thématique) ou quantitative (méta-analyse)

## Veille documentaire

- Configurer des **alertes de recherche** dans Google Scholar, WoS, Scopus — recevoir les nouveaux articles par email
- Créer un **profil ORCID** : identifiant pérenne, suivi des publications, liaison avec les systèmes institutionnels
- Suivre les **revues clés** du domaine (abonnement aux tables des matières)

## Comment utiliser avec un étudiant

1. Faire décomposer le sujet en concepts AVANT de lancer la moindre recherche
2. Vérifier que la requête booléenne est correcte : trop de résultats = élargir les synonymes ; trop peu = vérifier les termes
3. Insister sur le gestionnaire de références dès le départ — la reconstruction de bibliographie en fin de parcours est un cauchemar`,
}

// ─────────────────────────────────────────────
// FICHE 8: Les 10 composantes du protocole de recherche
// ─────────────────────────────────────────────
export const FICHE_COMPOSANTES_RECHERCHE = {
  id: 'fiche-composantes-recherche',
  title: 'Les 10 composantes du protocole de recherche',
  content: `# Les 10 composantes du protocole de recherche

Référentiel structuré pour évaluer la complétude et la cohérence d'un protocole ou d'une proposition de recherche.

## 1. Titre de recherche

Le titre est le premier contact avec le lecteur — il doit refléter le contenu avec précision.

**Composantes obligatoires :**
- Variable indépendante (VI)
- Variable dépendante (VD)
- Relation entre les deux (si applicable)
- Contexte/population d'étude (optionnel mais recommandé)

**Critères de qualité :**
- Clair, spécifique, exprime l'objectif
- 10–20 mots maximum
- Éviter les formules vagues : « étude sur », « recherche en », « analyse de »
- Exemples de bonnes formulations :
  - « L'impact du leadership transformationnel sur la performance au travail : le rôle médiateur de la satisfaction professionnelle »

## 2. Problème de recherche

Le problème est le cœur de l'étude — la lacune cognitive que le chercheur cherche à combler.

**Définition :** une situation, un phénomène ou un ensemble de questions non résolus dans la réalité ou dans les études antérieures.

**Critères de formulation :**
- Il doit être **clair et spécifique** — pas une question vague
- Il doit exprimer une **lacune réelle** dans la littérature ou la pratique
- Il est le fondement sur lequel sont construits les objectifs, hypothèses et méthodologie
- Il doit refléter un **besoin scientifique légitime** de mener l'étude

**Vérification :** demander au doctorant « pourquoi cette question n'a-t-elle pas encore été résolue ? » — s'il ne peut pas répondre, le problème est mal formulé.

## 3. Objectifs de recherche

Les objectifs sont les résultats spécifiques que le chercheur vise à atteindre.

**Caractéristiques :**
- Clairs et vérifiables
- Mesurables et testables
- Réalisables avec les ressources disponibles
- En lien direct avec le problème de recherche

**Types :**
- **Objectif général** : l'ambition globale de l'étude
- **Objectifs spécifiques** : les sous-résultats qui composent l'objectif général (répondre aux sous-questions)

**Erreur fréquente :** confondre objectif (ce qu'on veut atteindre) et activité (ce qu'on va faire).

## 4. Questions de recherche

Les questions décomposent le problème en interrogations auxquelles l'étude doit répondre.

**Types :**
1. **Questions descriptives** : décrire un phénomène ou un sujet
2. **Questions explicatives** : expliquer les relations entre variables
3. **Questions comparatives** : comparer des groupes ou des individus
4. **Questions exploratoires** : explorer un domaine peu documenté

**Critères de qualité :**
- Chaque question doit être directement liée à un objectif
- Formulées de manière ouverte (pas de yes/no)
- Nombre limité (3–5 questions principales)

## 5. Hypothèses de recherche

Une hypothèse est une réponse provisoire à une question de recherche, testable statistiquement.

**Caractéristiques :**
- Claires et spécifiques
- Testables empiriquement
- Mesurables via les données collectées
- Formulent une relation entre deux variables ou plus
- Dérivées de la théorie et des études antérieures

**Types :**
- H1 (hypothèse principale) : relation directe entre VI et VD
- H2, H3… (sous-hypothèses) : relations spécifiques ou médiations
- H0 (hypothèse nulle) : absence de relation

## 6. Signification/Importance de la recherche

La valeur scientifique et pratique que la recherche ajoute.

**4 dimensions :**
1. **Scientifique (académique)** : contribution au développement de la connaissance
2. **Pratique (appliquée)** : solutions ou recommandations applicables
3. **Sociale** : amélioration de l'environnement ou des pratiques
4. **Économique** : amélioration de l'efficience ou réduction des coûts

## 7. Limites de la recherche

Les limites définissent le périmètre de l'étude et protègent contre les critiques hors-sujet.

**2 catégories :**
- **Limites subjectives** : le sujet, la population, les variables, les hypothèses, les outils — ce que le chercheur a choisi d'inclure
- **Limites objectives** : le temps, le lieu, l'échantillon — les contraintes réelles

**Piège :** ne pas confondre limites (ce qu'on ne fait pas) et faiblesses (ce qu'on aurait dû faire).

## 8. Méthodologie de recherche

La méthodologie est le plan d'action pour atteindre les objectifs.

**Composantes :**
1. **Type de recherche** : descriptive, analytique, expérimentale, quasi-expérimentale, corrélationnelle, qualitative, mixte
2. **Population d'étude** : l'ensemble des individus ou unités concernés
3. **Échantillon** : la partie représentative de la population (taille, méthode d'échantillonnage)
4. **Outil de collecte** : questionnaire, entretien, observation, analyse de contenu, tests
5. **Méthode d'analyse** : statistiques descriptives, inférentielles, analyse thématique, analyse de contenu

**Règle d'or :** chaque choix méthodologique doit être justifié par une citation méthodologique — pas seulement décrit.

## 9. Variables et cadre conceptuel

**Types de variables :**
1. **Variable indépendante (VI)** : celle qui varie de manière autonome, dont l'effet est étudié
2. **Variable dépendante (VD)** : celle qui change en conséquence de la VI
3. **Variable médiatrice** : transmet l'effet de la VI vers la VD
4. **Variable modératrice** : modifie la force ou la direction de la relation VI→VD

**Cadre conceptuel :** schéma qui visualise les relations hypothétisées entre toutes les variables. Il doit être :
- Ancré dans la théorie existante
- Explicitement connecté à chaque hypothèse
- Distinguant clairement antécédents, médiateurs, modérateurs et résultats

## 10. Résultats, discussion, conclusions et recommandations

**Présentation des résultats :**
- Utiliser les outils statistiques appropriés
- Présenter via tableaux et graphiques clairs
- Ne pas interpréter dans cette section — seulement rapporter

**Discussion :**
- Interpréter les résultats en lien avec les objectifs et la littérature
- Comparer avec les études antérieures (convergence ou divergence)
- Évaluer l'originalité et la contribution
- Discuter les implications théoriques et pratiques

**Conclusions :**
- Répondre à chaque question de recherche
- Synthétiser sans introduire de nouvelles informations

**Recommandations :**
- Pour la pratique professionnelle
- Pour les futures recherches (ouvrir vers les lacunes identifiées)`,
}

// ─────────────────────────────────────────────
// FICHE 8-BIS : Research Gap vs Research Problem
// ─────────────────────────────────────────────
export const FICHE_GAP_VS_PROBLEM = {
  id: 'fiche-gap-vs-problem',
  title: 'Research Gap vs Research Problem : ne pas confondre',
  content: `# Research Gap vs Research Problem

Distinction fondamentale souvent confondue par les doctorants. Source : @DRFRED_PHD.

## Research Gap (Lacune de recherche)

Le **gap** est un constat analytique : un vide dans le savoir existant.

**Caractéristiques :**
- Peut impliquer des résultats contradictoires, des preuves limitées ou des populations sous-étudiées
- Constitue la base de la justification (*rationale*) de la recherche
- Se présente généralement dans la revue de littérature ou l'arrière-plan
- Répond à la question : « Que manque-t-il dans la littérature ? »
- Mène à la formulation du problème de recherche

**Types de gaps :**
- *Empirique* : absence de données sur une population ou un contexte spécifique
- *Méthodologique* : limites des outils ou designs utilisés dans les études précédentes
- *Théorique* : contradictions entre cadres théoriques ou absence de cadre pour un phénomène
- *Contextuel* : un phénomène étudié dans un contexte mais pas dans un autre

## Research Problem (Problème de recherche)

Le **problème** est une formulation opérationnelle : ce que l'étude va concrètement investiguer.

**Caractéristiques :**
- Spécifie l'issue exacte à examiner dans un contexte défini
- Guide les objectifs, questions de recherche et méthodologie
- Est clairement énoncé dans la section *problem statement* (énoncé du problème)
- Répond à la question : « Quel problème cette étude va-t-elle résoudre ou investiguer ? »
- Mène au développement des objectifs et questions de recherche

## Relation séquentielle : Gap → Problem

On ne peut pas formuler un problème de recherche valide sans avoir préalablement identifié et justifié un gap.

| Étape | Question clé | Résultat attendu |
|---|---|---|
| 1. Revue de littérature | « Que sait-on déjà ? » | Cartographie du champ |
| 2. Identification du gap | « Que manque-t-il ? » | Lacune justifiée |
| 3. Formulation du problème | « Que vais-je faire ? » | Problème opérationnel |
| 4. Questions de recherche | « Comment exactement ? » | Questions mesurables |

**Erreur fréquente :** Formuler un problème trop large (« étudier l'impact du numérique sur l'éducation ») sans avoir identifié le gap précis. Un bon gap réduit le champ ; un bon problème le rend faisable.

**Exemple concret :**
- *Gap* : « Les études sur l'apprentissage hybride se concentrent sur le supérieur, mais ignorent le primaire en contexte francophone africain. »
- *Problem* : « Cette étude examine l'effet de l'apprentissage hybride sur la motivation scolaire des élèves du CM2 au Sénégal. »`,
}

// ─────────────────────────────────────────────
// FICHE 9: Typologie des revues de littérature
// ─────────────────────────────────────────────
export const FICHE_REVUE_LITTERATURE = {
  id: 'fiche-revue-litterature',
  title: 'Typologie des revues de littérature : narrative, systématique, méta-analyse',
  content: `# Typologie des revues de littérature

Trois types distincts de revue, avec des niveaux de rigueur, des objectifs et des méthodologies différents.

## 1. Revue de littérature narrative

**Objectif :** Vue d'ensemble complète et analyse critique pour cartographier l'état des connaissances, identifier les lacunes et offrir des perspectives.

**Méthodologie :** Processus souple, inclusion basée sur la pertinence et le jugement du chercheur.

**Synthèse :** Narrative et critique — organisation thématique, chronologique ou conceptuelle.

**Format :** Article de revue, chapitre de thèse, section introductive.

**Pièges courants :**
- Empiler des résumés sans synthèse critique
- Absence de fil conducteur logique
- Ignorer les contre-preuves

## 2. Revue systématique de littérature (SLR)

**Objectif :** Répondre à une question de recherche spécifique de manière rigoureuse et reproductible.

**Méthodologie :** Processus exhaustif et hautement structuré (PRISMA), critères d'inclusion/exclusion stricts et cohérents.

**Synthèse :** Narrative hautement structurée et qualitative.

**Format :** Article de revue ou de recherche, lignes directrices PRISMA.

**Pièges courants :**
- Appeler « systématique » sans suivre PRISMA
- Critères d'éligibilité vagues
- Absence de flow diagram
- Pas d'évaluation du risque de biais

## 3. Méta-analyse

**Objectif :** Produire une estimation quantitative précise d'un effet (taille d'effet) au sein d'une revue systématique.

**Méthodologie :** Processus exhaustif (comme SLR) + analyse statistique des données collectées.

**Synthèse :** Qualitative ET quantitative — tailles d'effet pondérées, test d'hétérogénéité (I²), forêt plot.

**Format :** Au sein d'une revue systématique ou article quantitatif autonome.

**Pièges courants :**
- Combiner des études hétérogènes (I² > 50%) sans justification
- Ne pas rapporter l'hétérogénéité
- Oublier l'analyse de biais de publication (funnel plot)
- Ne pas utiliser GRADE

## Distinction clé

- Toute méta-analyse est incluse dans une revue systématique, mais toute revue systématique ne contient pas de méta-analyse.
- Une revue narrative ne peut PAS être qualifiée de « systématique » — ce sont des méthodes différentes.
- Si le doctorant hésite, la revue narrative est le défaut raisonnable pour un chapitre de thèse ; la SLR/méta-analyse sont des publications à part entière.

## Quand rediriger vers quel type ?

- Chapitre de thèse standard → Revue narrative
- Article méthodologique avec question PICO → SLR
- Données quantitatives comparables across études → Méta-analyse
- Le doctorant dit « revue systématique » mais la méthode est narrative → Le signaler`,
}

// ═══════════════════════════════════════════════
// CORPUS 3 : Rédaction et publication d'articles scientifiques
// Source : Gastel, B. & Day, R.A., How to Write and Publish a Scientific Paper (9e éd., 2022)
// ═══════════════════════════════════════════════

// ─────────────────────────────────────────────
// FICHE P1: Éthique de la publication scientifique
// ─────────────────────────────────────────────
export const FICHE_ETHIQUE_PUBLICATION = {
  id: 'fiche-ethique-publication',
  title: 'Éthique de la publication scientifique',
  content: `# Éthique de la publication scientifique

Synthèse de Gastel & Day, *How to Write and Publish a Scientific Paper* (9e éd., 2022).

## Exactitude et fabrication
- Aucune tolérance pour l'invention de données (« dry-labbing ») : c'est une faute qui n'a pas de degré.
- Déviations partielles fréquentes : omettre des points de données aberrants sans le signaler, présenter des figures qui accentuent artificiellement les résultats. En cas de doute, consulter quelqu'un de plus expérimenté.
- Pour toute analyse statistique, impliquer un statisticien dès la conception de l'étude, pas après coup.

## Originalité et « salami science »
- Les résultats doivent être nouveaux. La soumission simultanée d'un même manuscrit à plusieurs revues est non éthique.
- Le découpage excessif d'un même travail en plusieurs publications (« salami science ») nuit à l'intégrité — les bons comités regardent le contenu, pas le nombre. Pour une thèse par articles, le découpage doit correspondre à une vraie segmentation scientifique.

## Crédit et paraphrase — la règle la plus utile à outiller
- Toute idée ou formulation qui n'est pas la sienne doit être citée. De simples changements mineurs de mots ne suffisent pas à transformer une citation en paraphrase légitime.
- Méthode recommandée : rédiger le paragraphe sans regarder la source, puis vérifier l'exactitude après coup.
- La citation directe entre guillemets est rare en scientifique ; la norme est la paraphrase. En cas de doute sur la nécessité de guillemets, en mettre.
- Le recours à un logiciel de détection de similarité en amont est une pratique recommandée.
- Cas légitime de similarité : méthodologie standard identique entre publications d'un même auteur.

## Traitement éthique des sujets humains et animaux
Toute recherche impliquant des sujets humains ou animaux nécessite les autorisations appropriées obtenues **avant** le début de l'étude, et une déclaration explicite dans le document final.

## Déclaration des conflits d'intérêts
Tout engagement extérieur qui pourrait interférer avec l'objectivité doit être déclaré explicitement. L'éthique exige que ces engagements n'influencent pas réellement l'objectivité de la recherche.

## Critères vérifiables pour le Directeur IA
- Paraphrase insuffisante détectée → signaler
- Absence de déclaration de conformité éthique dans une méthodologie impliquant sujets humains/animaux → signaler
- Toujours en critique, jamais en réécriture automatique.`,
}

// ─────────────────────────────────────────────
// FICHE P2: Choisir une revue et éviter les prédateurs
// ─────────────────────────────────────────────
export const FICHE_CHOIX_REVUE = {
  id: 'fiche-choix-revue',
  title: 'Choisir une revue et éviter les revues prédatrices',
  content: `# Choisir une revue et éviter les revues prédatrices

Synthèse de Gastel & Day, *How to Write and Publish a Scientific Paper* (9e éd., 2022).

## Décider tôt, décider bien
Le choix de la revue doit se faire **avant** la rédaction. Écrire d'abord et chercher une revue ensuite oblige presque toujours à réviser en profondeur.

## Évaluer la légitimité d'une revue
- Identifier où sont publiés les travaux de référence dans son sous-champ.
- Le facteur d'impact est utile mais limité : il ne se compare jamais valablement entre disciplines différentes.
- Indicateurs DORA : ne jamais réduire l'évaluation à un seul chiffre (consultations, téléchargements, mentions, citations réelles).
- Être prudent avec les revues très récentes non adossées à une société savante.

## Accès ouvert : vérifier avant de soumettre
- Les frais de publication peuvent souvent faire l'objet d'une réduction ou exonération — contacter directement la revue.

## Signaux d'alerte d'une revue prédatrice
- Promesses trop belles (garantie de publication en quelques jours)
- Site web truffé de fautes ou d'incohérences
- Métriques fabriquées (indice d'impact propriétaire non reconnu)
- Absence d'articles de qualité vérifiable
- Sollicitations agressives et non ciblées par e-mail

## Signaux de légitimité
- Indexée par les grandes bases bibliographiques reconnues
- Référencée dans les bibliothèques universitaires
- Articles de qualité déjà connus du chercheur

## Pour la thèse par articles
- La revue cible et ses contraintes de format devraient être déclarées dès la conception du chapitre.
- Ce contrôle devrait apparaître à chaque étape de soumission planifiée.`,
}

// ─────────────────────────────────────────────
// FICHE P3: Écrire les résultats et la discussion
// ─────────────────────────────────────────────
export const FICHE_RESULTATS_DISCUSSION = {
  id: 'fiche-resultats-discussion',
  title: 'Écrire les résultats et la discussion sans les confondre',
  content: `# Écrire les résultats et la discussion sans les confondre

Synthèse de Gastel & Day, *How to Write and Publish a Scientific Paper* (9e éd., 2022).

## Résultats : sélectionner plutôt qu'accumuler
- Présenter des données représentatives, pas exhaustives. Le fait qu'une expérience ait été répétée cent fois sans divergence n'a pas besoin d'être documenté cent fois.
- Se méfier de la fausse précision statistique : rapporter « 28,8136 % » pour 17 cas sur 59 est trompeur.
- Noter aussi ce qui n'a **pas** d'effet — c'est une information utile.

## Éviter la redondance texte/tableau/figure
- Ne jamais répéter dans le texte ce que le tableau ou la figure montre déjà — c'est la faute la plus commise.
- Formulation à éviter : « Le tableau 1 montre clairement que X… » → Préférable : « X a inhibé Y (tableau 1). »
- Veiller à ce que chaque pronom ait un antécédent limpide.

## Discussion : la section la plus difficile
- La discussion est réputée la plus difficile — de nombreux articles sont rejetés à cause d'une discussion mal construite.
- Éviter le « camouflage à l'encre de seiche » : formulations vagues et alambiquées par manque de confiance dans les données.
- La première personne est acceptable : « nous concluons que » est préférable à des tournures impersonnelles alambiquées.

## La structure en entonnoir inversé
La discussion part des résultats spécifiques pour remonter vers leur portée générale :
rappel des principaux résultats → mise en relation avec les travaux antérieurs → implications → limites → questions ouvertes.

**Test de cohérence actionnable** : l'introduction pose des questions ; la discussion doit y répondre explicitement. Une discussion qui n'adresse pas les questions de l'introduction est incomplète.

## Assumer force et limites
- Souligner les points forts aide le lecteur à juger de la portée réelle.
- Cacher une limite est contre-productif : un relecteur la remarquera. Mieux vaut la nommer et en discuter l'impact.`,
}

// ─────────────────────────────────────────────
// FICHE P4: Tableaux et figures — quand et comment
// ─────────────────────────────────────────────
export const FICHE_TABLEAUX_FIGURES = {
  id: 'fiche-tableaux-figures',
  title: 'Quand (et quand ne pas) utiliser un tableau ou une figure',
  content: `# Quand (et quand ne pas) utiliser un tableau ou une figure

Synthèse de Gastel & Day, *How to Write and Publish a Scientific Paper* (9e éd., 2022).

## Le réflexe à corriger : tout ne mérite pas un tableau
Beaucoup de rédacteurs pensent que toute donnée numérique doit être tabulée. C'est faux.

## Trois signaux qu'un tableau ne devrait pas exister
1. **Colonnes remplies de zéros ou de valeurs identiques** : le tableau cache l'information. Une phrase suffit.
2. **Colonnes remplies de symboles binaires (+/−)** sur de nombreuses lignes : si le résultat se réduit à une constatation simple, une phrase suffit.
3. **Tableaux pour résultats non significatifs** : présenter en tableau un résultat non significatif décrédibilise le document.

**Principe général** : chaque fois qu'un tableau ou une colonne peut être reformulé en une phrase sans perte d'information, le reformuler en phrase.

## Quand un tableau est réellement justifié
Quand il présente des données répétitives, multivariées ou comparatives qu'une phrase ne pourrait pas restituer — typiquement plusieurs variables croisées sur plusieurs conditions.

## Principe commun avec la fiche Résultats/Discussion
Ne jamais reformuler dans le texte ce qu'un tableau ou une figure montre déjà.`,
}

// ─────────────────────────────────────────────
// FICHE P5: Auto-édition — le cadre des 8 C
// ─────────────────────────────────────────────
export const FICHE_AUTO_EDITION_8C = {
  id: 'fiche-auto-edition-8c',
  title: 'Auto-édition : le cadre des 8 C',
  content: `# Auto-édition : le cadre des 8 C

Synthèse de Gastel & Day, *How to Write and Publish a Scientific Paper* (9e éd., 2022).

## Les 8 dimensions de révision

1. **Conformité (compliance)** — Le texte respecte-t-il les consignes formelles (gabarit, conventions) ? La conformité éthique est-elle documentée ?
2. **Exhaustivité (completeness)** — Tous les éléments attendus sont-ils présents ? La méthode permet-elle une réplication ?
3. **Composition** — La structure d'ensemble est-elle appropriée ? Chaque paragraphe a-t-il une phrase d'ancrage claire ?
4. **Exactitude (correctness)** — L'information est-elle correcte dans le texte, les tableaux, figures et références ? Le raisonnement est-il valide ?
5. **Clarté (clarity)** — Les termes ambigus sont-ils définis ? Les abréviations explicitées ? Les antécédents des pronoms identifiables ?
6. **Cohérence (consistency)** — Un chiffre identique dans le texte et dans un tableau ? Le résumé correspond-il au corps ? La terminologie est-elle stable ?
7. **Concision** — Y a-t-il des redondances ou du contenu tangentiel ? Attention : la concision ne doit jamais se faire au détriment de la clarté.
8. **Courtoisie (courtesy)** — Le ton envers les travaux antérieurs reste-t-il neutre ? Le langage est-il inclusif ?

Le C final visé : la **communication**.

## Méthode de relecture
- Procéder par phases successives, chacune ciblée sur un sous-ensemble de dimensions.
- La dernière passe se fait de façon linéaire, du début à la fin.
- Changer de perspective : lire à voix haute, modifier la police ou la mise en page.

## Checklist article scientifique
- Le titre reflète-t-il fidèlement le contenu ?
- Le résumé correspond-il au corps du texte ?
- L'introduction indique-t-elle clairement le vide comblé ?
- La méthode permet-elle réplication et évaluation critique ?
- La discussion répond-elle aux questions de l'introduction ?
- Tous les auteurs sont-ils listés, les contributions remerciées ?`,
}

// ─────────────────────────────────────────────
// FICHE P6: Écrire en langue seconde, pour un lectorat international
// ─────────────────────────────────────────────
export const FICHE_LANGUE_SECONDE = {
  id: 'fiche-langue-seconde',
  title: 'Écrire la science en langue seconde, pour un lectorat international',
  content: `# Écrire la science en langue seconde, pour un lectorat international

Synthèse de Gastel & Day, *How to Write and Publish a Scientific Paper* (9e éd., 2022).

## Le contenu prime sur l'élégance stylistique
Si le contenu est informatif, bien organisé et clair, un correcteur peut évaluer la recherche. Si l'information manque ou le sens reste flou, aucun travail de correction linguistique ne peut compenser. **Priorité : fond avant forme, toujours.**

## L'éditeur/le correcteur comme allié
Les revues sérieuses souhaitent publier la meilleure science, indépendamment de l'origine linguistique de l'auteur. La relation avec le relecteur est une collaboration, pas un contrôle sanctionnant.

## Différences culturelles à connaître
- **Niveau de détail** : observer le niveau habituel des textes publiés dans le contexte visé.
- **Degré de directivité** : la tradition dominante attend une phrase d'ouverture de paragraphe (phrase-clé) qui énonce directement l'idée principale, suivie des éléments qui la développent.
- **Rapport au temps** : les revues internationales attendent une réactivité rapide aux sollicitations.
- **Rapport à la citation littérale** : dans les revues internationales, la quasi-totalité du texte doit être dans les mots propres de l'auteur.

## Stratégies concrètes
- Observer la structure de paragraphe des textes déjà publiés dans la revue cible.
- Répondre rapidement aux demandes de clarification.
- Ne jamais supposer qu'un correcteur a nécessairement raison : l'auteur reste responsable de l'exactitude finale.

## Pour l'application
- Signaler d'abord les problèmes de structure et de clarté, puis les points de langue — jamais l'inverse.
- Repérer les paragraphes qui « tournent autour » du point principal sans l'énoncer en phrase d'ouverture.`,
}

// ─────────────────────────────────────────────
// ──────────────────────────
// FICHE_APA_RESULTATS — Reporting statistique APA 7
// ──────────────────────────
const FICHE_APA_RESULTATS = {
  id: 'fiche-apa-resultats',
  title: 'Reporting statistique APA 7',
  content: `# Reporting statistique en APA 7

## Principes fondamentaux
Les résultats statistiques doivent être rapportés avec suffisamment de détails pour permettre la réplication, tout en restant lisibles. Le style APA 7 impose des conventions précises de notation et de formatage.

## Notation et formatage
- **Pas de zéro initial** avant la virgule pour les valeurs ne pouvant dépasser 1 : écrire *r* = .56, *p* = .045 (pas 0.56 ou 0.045).
- **Valeur *p*** : rapportée avec 3 décimales (*p* = .045). Si *p* < .001, écrire « *p* < .001 ».
- **Statistiques** (*r*, *t*, *F*, χ²) : arrondies à 2 décimales par défaut.
- **Notation en italique** : *r*, *p*, *N*, *df*, *t*, *F*, χ², *M*, *SD*.

## Formats par type de test

### Corrélation de Pearson
> Une corrélation {positive/négative} significative a été observée entre X et Y, *r*(*df*) = .xx, *p* = .xxx.

- Toujours mentionner la **direction** (positive/négative).
- df = N − 2 (calculable automatiquement si N est fourni).
- **Jamais de langage causal** : corrélation ≠ causalité.

### Corrélation de Spearman
> Une corrélation monotone {positive/négative} significative a été observée entre X et Y, *r*<sub>s</sub>(*df*) = .xx, *p* = .xxx.

- Relation **monotone** (pas linéaire).

### Test t
> Une différence significative a été observée entre A et B, *t*(*df*) = x.xx, *p* = .xxx, *d* = x.xx.

- Inclure la **taille d'effet** (Cohen's *d*).
- Préciser le type : indépendant, apparié, Welch.

### ANOVA
> Un effet significatif de X a été observé, *F*(*df*<sub>1</sub>, *df*<sub>2</sub>) = x.xx, *p* = .xxx, η² = .xx.

- Préférer η² **partiel** si disponible.
- Inclure les post-hoc si pertinents.

### Chi-carré
> Une association significative a été observée entre X et Y, χ²(*df*, *N* = n) = x.xx, *p* = .xxx, *V* = .xx.

- Pour un tableau 2×2, utiliser φ (phi) au lieu de *V* de Cramér.

## Tailles d'effet (Cohen)
| Taille | *r* | *d* | η² |
|--------|-----|-----|-----|
| Petite | .10 | .20 | .01 |
| Moyenne | .30 | .50 | .06 |
| Grande | .50 | .80 | .14 |

## Erreurs fréquentes à éviter
1. « *The p value is* .001 » → « *p* = .001 »
2. « *There is a correlation* » → préciser direction et force
3. Oublier le df ou la taille d'effet
4. Utiliser un langage causal (« X cause Y »)
5. Rapporter *p* = .000 (impossible)

## Pour l'application
- Utiliser l'outil **APA Results Composer** pour générer automatiquement des phrases conformes.
- Le Directeur IA applique ces règles quand le contexte est un chapitre de résultats.
- Vérifier toujours les sorties SPSS/JASP avant de les rapporter.`,
}
// All fiches index
// ─────────────────────────────────────────────
import {
  FICHE_PARADIGMES_COHERENCE,
  FICHE_RECHERCHE_DESIGN,
  FICHE_ANALYSE_SPATIALE,
  FICHE_METHODES_MIXTES,
  FICHE_ARTICULATION_DIMENSIONS,
  FICHE_RL_ENVIRONNEMENT_BATI,
  FICHE_MODELES_STRUCTURE_THESE,
} from './fiches-archi-urba'

// ─────────────────────────────────────────────
// FICHE: Rythme de rédaction
// ─────────────────────────────────────────────
export const FICHE_RYTHME = {
  id: 'fiche-rythme',
  title: 'Rythme de rédaction',
  content: `# Rythme de rédaction

La régularité bat l'intensité : écrire 20-30 minutes par jour produit un manuscrit plus vite et avec moins de souffrance qu'écrire 8 heures le dimanche.

## Micro-sessions quotidiennes
Bloquer un créneau court (méthode Pomodoro, 25 minutes) et définir avant la session ce qui sera écrit précisément — une section, un paragraphe — jamais « travailler sur la thèse » en général. Fermer les distractions pendant la session. Noter en une phrase où l'on s'arrête, pour repartir sans effort la fois suivante.

## Fragmentation en tâches courtes
Découper un chapitre en micro-tâches réalisables en 15 à 45 minutes (« rédiger l'intro de la section 3.2 », « décrire le tableau 5 »). Commencer par la plus simple pour créer l'élan. Cocher chaque tâche accomplie : la progression visible est un moteur puissant contre la procrastination.

## Combattre le perfectionnisme paralysant
Le perfectionnisme en rédaction est souvent une procrastination déguisée. Séparer explicitement l'écriture du premier jet et la relecture/correction — ne jamais faire les deux en même temps. Un texte imparfait qu'on peut réviser vaut mieux qu'une page blanche parfaite.

## Suivi de la progression
Enregistrer le nombre de mots écrits par session, calculer une moyenne hebdomadaire (l'objectif est la régularité, pas un chiffre élevé), et prévoir une courte revue hebdomadaire pour ajuster la stratégie si la progression stagne plusieurs semaines de suite.

## Comment utiliser avec un étudiant
1. Identifier si le blocage vient du volume perçu (trop gros pour démarrer) ou du perfectionnisme (n'ose pas écrire imparfait).
2. Proposer une micro-tâche unique et réalisable dans la session en cours, jamais un chapitre entier.
3. Rappeler que le premier jet n'a pas vocation à être le texte final.`,
}

// ─────────────────────────────────────────────
// FICHE: Soutenance orale
// ─────────────────────────────────────────────
export const FICHE_SOUTENANCE = {
  id: 'fiche-soutenance',
  title: 'Soutenance',
  content: `# Soutenance orale

La soutenance n'est pas un résumé de la thèse mais une démonstration de maîtrise : le jury évalue la capacité du candidat à défendre ses choix, pas seulement à les rappeler.

## Structure de la présentation
Construire un arc narratif court plutôt qu'un sommaire parlé : le problème et pourquoi il compte, la démarche adoptée et pourquoi celle-là plutôt qu'une autre, les résultats principaux, leur portée et leurs limites assumées. Réserver l'essentiel du temps aux choix méthodologiques et à la discussion, pas à la description exhaustive des résultats déjà dans le manuscrit.

## Supports visuels
Un support de présentation soutient l'oral, il ne le remplace pas : peu de texte par diapositive, une idée par diapositive, des visuels lisibles à distance. Éviter de lire ses diapositives — le jury lit plus vite qu'on ne parle, la redondance lasse.

## Préparation aux questions du jury
Anticiper les objections les plus probables sur la méthode et les limites, et préparer des réponses courtes et directes plutôt que défensives. Le rôle du jury est d'évaluer la rigueur du travail, pas de piéger le candidat — une objection est une occasion de montrer sa maîtrise du sujet, pas une attaque à repousser.

## Préparation psychologique
Répéter à voix haute plusieurs fois, idéalement devant un public test, pour caler le minutage et désamorcer le trac lié à la première prise de parole. Prévoir une réponse simple à la question la plus redoutée à l'avance plutôt que de découvrir sa réaction le jour même.

## Comment utiliser avec un étudiant
1. Demander d'abord le plan de la présentation avant tout travail sur les diapositives — la structure prime sur la forme.
2. Faire identifier par l'étudiant lui-même les trois objections les plus probables sur son travail.
3. Ne jamais rédiger les réponses aux questions du jury à sa place — proposer une méthode pour les préparer, pas un script.`,
}

export const ALL_FICHES = [
  FICHE_ETAPES,
  FICHE_ECRITURE,
  FICHE_RHETORIQUE,
  FICHE_INSTITUTIONNELLE,
  FICHE_NORMES,
  FICHE_BIBLIOMETRIE,
  FICHE_RECHERCHE_DOCUMENTAIRE,
  FICHE_COMPOSANTES_RECHERCHE,
  FICHE_GAP_VS_PROBLEM,
  FICHE_REVUE_LITTERATURE,
  FICHE_PARADIGMES_COHERENCE,
  FICHE_RECHERCHE_DESIGN,
  FICHE_ANALYSE_SPATIALE,
  FICHE_METHODES_MIXTES,
  FICHE_ARTICULATION_DIMENSIONS,
  FICHE_RL_ENVIRONNEMENT_BATI,
  FICHE_MODELES_STRUCTURE_THESE,
  // Corpus 3 : Rédaction et publication d'articles scientifiques (Gastel & Day)
  FICHE_ETHIQUE_PUBLICATION,
  FICHE_CHOIX_REVUE,
  FICHE_RESULTATS_DISCUSSION,
  FICHE_TABLEAUX_FIGURES,
  FICHE_AUTO_EDITION_8C,
  FICHE_LANGUE_SECONDE,
  FICHE_APA_RESULTATS,
  FICHE_RYTHME,
  FICHE_SOUTENANCE,
] as const

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export interface GuidanceContext {
  chapterTitle?: string
  userMessage?: string
  signal?: 'new-project' | 'writing-block' | 'chapter-structure' | 'institutional' | 'formatting' | 'bibliometrie' | 'recherche-doc' | 'methodologie' | 'revue-litterature' | 'archi-urba' | 'ethique-publication' | 'choix-revue' | 'resultats-discussion' | 'tableaux-figures' | 'auto-edition' | 'langue-seconde' | 'apa-resultats' | 'auto'
}

export interface GuidanceResult {
  fiches: Array<{ id: string; title: string; content: string }>
  reason: string
}

// ─────────────────────────────────────────────
// Signal → fiche mapping (explicit signals)
// ─────────────────────────────────────────────
const SIGNAL_MAP: Record<string, Array<{ id: string; title: string; content: string }>> = {
  'new-project': [FICHE_ETAPES],
  'writing-block': [FICHE_ECRITURE],
  'chapter-structure': [FICHE_RHETORIQUE],
  'institutional': [FICHE_INSTITUTIONNELLE],
  'formatting': [FICHE_NORMES],
  'bibliometrie': [FICHE_BIBLIOMETRIE],
  'recherche-doc': [FICHE_RECHERCHE_DOCUMENTAIRE],
  'methodologie': [FICHE_COMPOSANTES_RECHERCHE, FICHE_GAP_VS_PROBLEM],
  'revue-litterature': [FICHE_REVUE_LITTERATURE],
  'archi-urba': [FICHE_PARADIGMES_COHERENCE],
  'ethique-publication': [FICHE_ETHIQUE_PUBLICATION],
  'choix-revue': [FICHE_CHOIX_REVUE],
  'resultats-discussion': [FICHE_RESULTATS_DISCUSSION],
  'tableaux-figures': [FICHE_TABLEAUX_FIGURES],
  'auto-edition': [FICHE_AUTO_EDITION_8C],
  'langue-seconde': [FICHE_LANGUE_SECONDE],
  'apa-resultats': [FICHE_APA_RESULTATS],
}

// ─────────────────────────────────────────────
// Chapter title keywords → fiche
// ─────────────────────────────────────────────
const CHAPTER_KEYWORDS: Array<{ patterns: RegExp[]; fiche: { id: string; title: string; content: string } }> = [
  {
    patterns: [/intro/i],
    fiche: FICHE_RHETORIQUE,
  },
  {
    patterns: [/revue\s+de\s+litt[ée]rature/i, /revue\s+syst[ée]matique/i, /m[ée]ta-analyse/i, /meta-analysis/i],
    fiche: FICHE_REVUE_LITTERATURE,
  },
  {
    patterns: [/revue/i, /littérature/i, /litterature/i, /bibliograph/i],
    fiche: FICHE_RHETORIQUE,
  },
  {
    patterns: [/problémat/i, /problématique/i, /hypothèse/i, /hypothese/i, /variable/i, /protocole/i, /objectif/i, /échantill/i],
    fiche: FICHE_COMPOSANTES_RECHERCHE,
  },
  {
    patterns: [/\bgap\b/i, /lacune/i, /research\s*gap/i],
    fiche: FICHE_GAP_VS_PROBLEM,
  },
  {
    patterns: [/méthod/i, /methodo/i, /methodolog/i],
    fiche: FICHE_COMPOSANTES_RECHERCHE,
  },
  {
    patterns: [/résultat/i, /resultat/i, /résult/i, /result/i],
    fiche: FICHE_RESULTATS_DISCUSSION,
  },
  {
    patterns: [/discuss/i],
    fiche: FICHE_RESULTATS_DISCUSSION,
  },
  {
    patterns: [/conclus/i],
    fiche: FICHE_RHETORIQUE,
  },
  {
    patterns: [/résumé/i, /resume/i, /abstract/i],
    fiche: FICHE_RHETORIQUE,
  },
]

// ─────────────────────────────────────────────
// User message keyword heuristics
// ─────────────────────────────────────────────
const MSG_HEURISTICS: Array<{ patterns: RegExp[]; fiche: { id: string; title: string; content: string }; reason: string }> = [
  {
    patterns: [/bloqué/i, /bloquee/i, /procrastin/i, /commencer/i, /écrir/i, /ecri/i, /je ne sais pas/i],
    fiche: FICHE_ECRITURE,
    reason: 'Mots-clés de blocage rédactionnel détectés dans le message',
  },
  {
    patterns: [/directeur/i, /comité/i, /comite/i, /souten/i, /encadr/i, /jury/i],
    fiche: FICHE_INSTITUTIONNELLE,
    reason: 'Mots-clés institutionnels/d\'encadrement détectés dans le message',
  },
  {
    patterns: [/citation/i, /APA/i, /norme/i, /format/i, /bibliograph/i, /référence/i, /reference/i, /chicago/i, /turabian/i],
    fiche: FICHE_NORMES,
    reason: 'Mots-clés de normes/citation détectés dans le message',
  },
  {
    patterns: [/par où/i, /par ou/i, /étapes?\s*(du\s*)?projet/i, /etapes?\s*(du\s*)?projet/i, /comment\s+(je\s+)?commence/i],
    fiche: FICHE_ETAPES,
    reason: 'Question sur les étapes du projet détectée dans le message',
  },
  {
    patterns: [/structure\s+de\s*chapitre/i, /qu\'est\-ce\s*qui\s*doit/i, /dans\s*mon\s*intro/i, /introduction/i, /revue\s+de/i, /méthodologie/i],
    fiche: FICHE_RHETORIQUE,
    reason: 'Question sur la structure rhétorique détectée dans le message',
  },
  {
    patterns: [/variable\s+(indep|dépen|médiat|modérat)/i, /cadre\s+conceptuel/i, /hypoth[eè]s/i, /probl[eè]me\s+de\s+recherche/i, /objectif\s+de\s+recherche/i, /question\s+de\s+recherche/i, /signification\s+de\s+la\s+recherche/i, /limite\s+de\s+la\s+recherche/i, /échantill/i, /protocole\s+de\s+recherche/i, /méthodolog/i, /méthode\s+d['\x27]analyse/i, /population\s+d['\x27][ée]tude/i],
    fiche: FICHE_COMPOSANTES_RECHERCHE,
    reason: 'Mots-clés de méthodologie et composantes de recherche détectés',
  },
  {
    patterns: [/\bgap\b/i, /research\s*gap/i, /lacune.*recherche/i, /problem\s*statement/i, /énoncé.*problème/i, /research\s*problem/i],
    fiche: FICHE_GAP_VS_PROBLEM,
    reason: 'Question sur gap/problème de recherche détectée dans le message',
  },
  {
    patterns: [/bibliomé/i, /bibliometric/i, /facteur\s+d['\x27]impact/i, /impact\s+factor/i, /indice\s+h/i, /h\-index/i, /productivité\s+scientifique/i],
    fiche: FICHE_BIBLIOMETRIE,
    reason: 'Mots-clés bibliométriques détectés dans le message',
  },
  {
    patterns: [/recherche\s+documentaire/i, /littérature/i, /litterature/i, /bases\s+de\s+données/i, /google\s+scholar/i, /scopus/i, /web\s+of\s+science/i, /revue\s+systématique/i, /veille/i, /gestionnaire\s+de\s+référence/i, /zotero/i, /endnote/i, /mendeley/i, /orcid/i],
    fiche: FICHE_RECHERCHE_DOCUMENTAIRE,
    reason: 'Mots-clés de recherche documentaire détectés dans le message',
  },
  {
    patterns: [/revue\s+de\s+litt[ée]rature/i, /revue\s+syst[ée]matique/i, /m[ée]ta-analyse/i, /meta-analysis/i, /PRISMA/i, /prisma/i, /PICO/i, /pico/i, /flow\s+diagram/i, /GRADE/i, /hétérog[ée]n[ée]it[ée]/i, /taille\s+d[\x27']effet/i, /funnel\s+plot/i, /for[êe]t\s+plot/i],
    fiche: FICHE_REVUE_LITTERATURE,
    reason: 'Mots-clés de typologie de revue de littérature détectés dans le message',
  },
  // Corpus 3 : publication scientifique
  {
    patterns: [/plagiat/i, /paraphras/i, /conflit\s+d['’']intér[iê]t/i, /comité\s+d['’]éthique/i, /comite\s+d['’]ethique/i, /autorat/i, /salami/i, /dry.lab/i, /fabri/i, /données.*fabriqu/i, /donnee.*fabriqu/i],
    fiche: FICHE_ETHIQUE_PUBLICATION,
    reason: 'Mots-clés d\'éthique de publication détectés dans le message',
  },
  {
    patterns: [/choisir\s+une\s+revue/i, /revue.*cible/i, /revue.*prédat/i, /predatory/i, /facteur\s+d['’]impact/i, /impact\s+factor/i, /soumettr/i, /soumission/i, /publication.*internationale/i],
    fiche: FICHE_CHOIX_REVUE,
    reason: 'Mots-clés de choix de revue / publication détectés dans le message',
  },
  {
    patterns: [/tableau/i, /figure/i, /graphique/i],
    fiche: FICHE_TABLEAUX_FIGURES,
    reason: 'Mots-clés de tableaux/figures détectés dans le message',
  },
  {
    patterns: [/relecture/i, /correction/i, /révision/i, /revision/i, /auto.édition/i, /auto-edition/i, /relire/i, /vérifier.*avant.*soumiss/i, /revue.*article/i, /soumission.*article/i],
    fiche: FICHE_AUTO_EDITION_8C,
    reason: 'Mots-clés de relecture / auto-édition détectés dans le message',
  },
  {
    patterns: [/langue\s+seconde/i, /non.*francophone/i, /anglais.*rédaction/i, /publication.*internationale/i, /lectorat.*international/i, /international.*audience/i, /native.*speaker/i, /correcteur/i],
    fiche: FICHE_LANGUE_SECONDE,
    reason: 'Mots-clés de rédaction en langue seconde / international détectés',
  },
  {
    patterns: [/\bAPA\b/i, /\bp\s*=\s*[.<0-9]/i, /\br\s*=\s*[.<0-9]/i, /\bF\s*\(/i, /chi.carr/i, /corr.lation/i, /statistique/i, /reporting/i, /t.*test/i, /ANOVA/i, /Cohen.*d/i, /taille.*effet/i, /SPSS/i, /JASP/i],
    fiche: FICHE_APA_RESULTATS,
    reason: 'Mots-clés de reporting statistique APA détectés',
  },
]

/**
 * Selects up to 2 guidance fiches based on context signals.
 */
export function getGuidanceForContext(ctx: GuidanceContext): GuidanceResult {
  const { chapterTitle, userMessage, signal } = ctx
  const selected: Array<{ id: string; title: string; content: string }> = []
  const seen = new Set<string>()
  let reason = ''

  const addFiche = (f: { id: string; title: string; content: string }) => {
    if (!seen.has(f.id) && selected.length < 2) {
      seen.add(f.id)
      selected.push(f)
    }
  }

  // ── 1. Explicit signal ──
  if (signal && signal !== 'auto' && SIGNAL_MAP[signal]) {
    const mapped = SIGNAL_MAP[signal]
    mapped.forEach(addFiche)
    reason = `Signal explicite : ${signal}`
    return { fiches: selected, reason }
  }

  // ── 2. Auto-routing with heuristics ──
  const msg = (userMessage || '').toLowerCase()
  const chap = (chapterTitle || '').toLowerCase()

  // 2a. Check user message for keyword matches
  for (const h of MSG_HEURISTICS) {
    if (h.patterns.some(p => p.test(msg))) {
      addFiche(h.fiche)
      reason = h.reason
      break
    }
  }

  // 2b. Check chapter title for chapter type match
  if (chap) {
    for (const ck of CHAPTER_KEYWORDS) {
      if (ck.patterns.some(p => p.test(chap))) {
        addFiche(ck.fiche)
        if (!reason) {
          reason = `Type de chapitre détecté : « ${chapterTitle} »`
        }
        break
      }
    }
  }

  // 2c. Default: if chapter is active, use fiche-rhetorique
  if (selected.length === 0 && chap) {
    addFiche(FICHE_RHETORIQUE)
    reason = `Chapitre actif détecté (sans correspondance précise) : « ${chapterTitle} »`
  }

  // 2d. No signal at all
  if (selected.length === 0) {
    reason = 'Aucun signal contextuel détecté — pas de fiche chargée'
  }

  return { fiches: selected, reason }
}
