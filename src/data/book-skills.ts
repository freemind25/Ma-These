// Pre-extracted structured knowledge from the 18 library books.
// Designed for injection into the AI Director's system prompt.
// Principle: density over completeness, practitioner voice, named frameworks.

export interface BookSkill {
  id: string
  title: string
  author: string
  coreConcept: string
  frameworks: Array<{ name: string; description: string; when: string }>
  principles: string[]
  techniques: string[]
  antiPatterns: string[]
  relevance: { chapterType: string; reason: string }[]
  quickReference: string
}

export const BOOK_SKILLS: Record<string, BookSkill> = {
  'belleville-assieds-toi': {
    id: 'belleville-assieds-toi',
    title: 'Assieds-toi et écris ta thèse',
    author: 'Geneviève Belleville',
    coreConcept: 'La thèse s\'écrit en sessions régulières et courtes, pas en marathons épuisants. La régularité bat l\'inspiration.',
    frameworks: [
      {
        name: 'Règle des 30 minutes',
        description: 'Écrire minimum 30 min/jour, même mal, même peu. La quantité génère la qualité.',
        when: 'L\'étudiant procrastine ou attend "le bon moment" pour écrire.',
      },
      {
        name: 'Séparation rédaction / révision',
        description: 'Ne jamais corriger en écrivant. Deux modes distincts : créateur (produire) vs éditeur (corriger).',
        when: 'L\'étudiant bloque sur une phrase, relit sans cesse au lieu d\'avancer.',
      },
      {
        name: 'Contrats d\'écriture',
        description: 'Fixer des micro-objectifs mesurables (mots, sections, temps) et les honorer comme un contrat.',
        when: 'Objectifs vagues comme "travailler sur ma thèse" mènent à l\'inaction.',
      },
    ],
    principles: [
      'Écris d\'abord, corrige ensuite — jamais l\'inverse.',
      'La page blanche se vainc par l\'action, pas par la réflexion supplémentaire.',
      'Un texte imparfait publié vaut mieux qu\'un texte parfait qui reste dans un tiroir.',
      'Identifie ta forme de procrastination (perfectionnisme, anxiété, surcharge) pour la cibler.',
    ],
    techniques: [
      'Freewriting : écris 10-15 min sans arrêt, sans corriger, sur ton sujet du moment.',
      'Pomodoro adapté : 25 min écriture pure → 5 min pause, 4 cycles puis pause longue.',
      'Journal de rédaction : note chaque jour ce que tu as fait et ce que tu feras demain.',
    ],
    antiPatterns: [
      'Attendre d\'avoir "tout lu" pour commencer à écrire — la lecture est infinie.',
      'Recommencer un chapitre du début au lieu d\'avancer à partir de là où tu es.',
      'Comparer ton brouillon aux articles publiés (comparer aux brouillons des autres).',
    ],
    relevance: [
      { chapterType: 'all', reason: 'Régularité et gestion du blocage utiles à chaque étape de rédaction.' },
      { chapterType: 'I', reason: 'Le démarrage est le moment où la procrastination frappe le plus fort.' },
    ],
    quickReference: '30 min/jour > 0. Séparer créer/corriger. Freewriting pour débloquer. Contrats mesurables, pas vagues.',
  },

  'belleville-trucs-pratiques': {
    id: 'belleville-trucs-pratiques',
    title: 'Trucs pratiques et motivationnels pour la rédaction scientifique',
    author: 'Geneviève Belleville',
    coreConcept: 'La rédaction scientifique est une compétence qui s\'entraîne par des exercices ciblés, pas un talent inné.',
    frameworks: [
      {
        name: 'Déconstruction-réconstruction',
        description: 'Prendre un paragraphe modèle, identifier sa structure, puis réécrire un contenu similaire en suivant le même patron.',
        when: 'L\'étudiant ne sait pas structurer ses paragraphes ou manque de modèles.',
      },
      {
        name: 'Révision en 3 passes',
        description: 'Passe 1 : structure et logique. Passe 2 : clarté et style. Passe 3 : conformité aux normes.',
        when: 'Réviser un chapitre complet sans se perdre dans les détails.',
      },
    ],
    principles: [
      'Chaque paragraphe = une seule idée principale, annoncée dans la première phrase.',
      'Les transitions entre paragraphes sont aussi importantes que le contenu lui-même.',
      'Motivation externe (échéances, groupes d\'écriture) compense la motivation interne fluctuante.',
      'Rédiger à voix haute pour détecter les phrases maladroites.',
    ],
    techniques: [
      'Exercice du résumé en une phrase : si tu ne peux pas résumer ton paragraphe, il manque de focus.',
      'Groupes d\'écriture (shut up & write) : sessions collectives silencieuses avec partage de progrès.',
      'Reverse outline : après rédaction, extraire le plan à rebours pour vérifier la cohérence.',
    ],
    antiPatterns: [
      'Modifier le style en même temps que le contenu — mélanger les deux passes de révision.',
      'Ignorer les retours du directeur sous prétexte que "ce n\'est pas encore parfait".',
      'Écrire sans aucun modèle de référence — réinventer la roue à chaque paragraphe.',
    ],
    relevance: [
      { chapterType: 'all', reason: 'Exercices de rédaction applicables à tous les chapitres.' },
      { chapterType: 'II', reason: 'La synthèse bibliographique demande des compétences de réécriture et condensation.' },
      { chapterType: 'V', reason: 'La discussion exige clarté argumentative — exercice idéal.' },
    ],
    quickReference: '1 idée/paragraphe. Réviser en 3 passes (structure → style → normes). Déconstruire des modèles. Reverse outline.',
  },

  'belleville-extraire-these': {
    id: 'belleville-extraire-these',
    title: 'Extraire une thèse d\'un cerveau étudiant sans gâchis',
    author: 'Geneviève Belleville, Philip L. Jackson',
    coreConcept: 'L\'étudiant possède déjà le savoir dans sa tête — le rôle de l\'encadrant est de le faire émerger par des questions stratégiques, pas par des corrections linéaires.',
    frameworks: [
      {
        name: 'Entretien d\'explicitation',
        description: 'Série de questions ouvertes guidant l\'étudiant à verbaliser son raisonnement tacite et le transformer en texte académique.',
        when: 'L\'étudiant sait ce qu\'il veut dire mais n\'arrive pas à le formuler par écrit.',
      },
      {
        name: 'Flux d\'écriture non linéaire',
        description: 'Commencer par les sections les plus claires mentalement, pas forcément par l\'introduction. Assembler ensuite.',
        when: 'Le plan séquentiel (I→VI) bloque l\'étudiant qui maîtrise mieux les résultats que l\'intro.',
      },
    ],
    principles: [
      'Le savoir est déjà là — le problème est l\'accès, pas l\'acquisition.',
      'Poser des questions plutôt que donner des réponses préformatées.',
      'L\'écriture est un processus de découverte, pas seulement de transcription.',
      'Valider la logique AVANT la forme — un contenu solide supporte tout style.',
    ],
    techniques: [
      'Oraliser : demander à l\'étudiant d\'expliquer sa section à voix haute, puis retranscrire.',
      'Carte mentale de la section : écrire les idées en vrac, puis organiser hiérarchiquement.',
      'Phrase-clé d\'ancrage : identifier LA phrase qui résume le message central d\'une section.',
    ],
    antiPatterns: [
      'Réécrire le texte de l\'étudiant — cela décuple la dépendance au lieu de développer l\'autonomie.',
      'Exiger que l\'introduction soit parfaite avant de passer au reste.',
      'Confondre difficulté d\'écriture avec manque de contenu.',
    ],
    relevance: [
      { chapterType: 'all', reason: 'L\'extraction de connaissances est pertinente à chaque chapitre.' },
      { chapterType: 'I', reason: 'L\'introduction est souvent la plus difficile à formuler — idéale pour oralisation.' },
      { chapterType: 'III', reason: 'La méthodologie demande d\'expliciter des choix souvent tacites.' },
    ],
    quickReference: 'Le savoir est déjà là. Poser des questions, pas donner des réponses. Oraliser → retranscrire. Écrire les sections claires d\'abord.',
  },

  'begin-encadrer': {
    id: 'begin-encadrer',
    title: 'Encadrer aux cycles supérieurs',
    author: 'Christian Bégin',
    coreConcept: 'L\'encadrement est une relation d\'aide professionnelle qui exige des compétences spécifiques, distinctes de l\'expertise disciplinaire.',
    frameworks: [
      {
        name: 'Cycle de feedback',
        description: 'Retour structuré en 3 étapes : identifier les forces → cibler les problèmes prioritaires (max 3) → suggérer des actions concrètes.',
        when: 'Donner du feedback sur un texte sans décourager l\'étudiant.',
      },
      {
        name: 'Gestion des attentes',
        description: 'Contrat explicite entre directeur et étudiant : fréquence de rencontres, délais de retour, critères de qualité.',
        when: 'Démarrer une direction ou quand la relation se détériore.',
      },
      {
        name: 'Interventions graduées',
        description: 'Soutien direct → guidage → autonomie. Adapter le niveau d\'intervention au stade de l\'étudiant.',
        when: 'L\'étudiant est trop dépendant ou au contraire se sent abandonné.',
      },
    ],
    principles: [
      'Un bon retour en temps partiel vaut mieux qu\'un retour parfait en retard.',
      'Séparer le commentaire sur le texte du commentaire sur la personne.',
      'L\'étudiant doit comprendre POURQUOI une modification est suggérée, pas juste quoi changer.',
      'Les problèmes d\'écriture masquent souvent des problèmes de pensée — creuser avant de corriger.',
    ],
    techniques: [
      'Entretien semestriel d\'évaluation : revisiter les objectifs, ajuster le plan, identifier les blocages.',
      'Modèle de retour écrit : 1 paragraphe positif → 2-3 points prioritaires → 1 suggestion d\'action immédiate.',
      'Calendrier de rédaction partagé : visualiser les échéances communes.',
    ],
    antiPatterns: [
      'Réécrire les textes de l\'étudiant au lieu de commenter — crée une dépendance toxique.',
      'Éviter les conversations difficiles (retard, qualité insuffisante) jusqu\'à la crise.',
      'Imposer sa propre vision au lieu de guider l\'étudiant vers la sienne.',
    ],
    relevance: [
      { chapterType: 'all', reason: 'L\'encadrement couvre l\'ensemble du processus de thèse.' },
      { chapterType: 'I', reason: 'La formulation de la problématique est le moment clé de la direction.' },
      { chapterType: 'III', reason: 'La validation du devis méthodologique est critique en encadrement.' },
    ],
    quickReference: 'Feedback : forces → max 3 problèmes → actions. Contrat explicite d\'attentes. Soutenir, pas réécrire.',
  },

  'aventure-recherche-qualitative': {
    id: 'aventure-recherche-qualitative',
    title: 'L\'aventure de la Recherche Qualitative',
    author: 'Collectif',
    coreConcept: 'La recherche qualitative ne cherche pas à quantifier mais à comprendre en profondeur les significations, contextes et processus sociaux.',
    frameworks: [
      {
        name: 'Spirale de la recherche qualitative',
        description: 'Processus itératif : questionnement → terrain → analyse → retour au terrain. Non linéaire, chaque phase modifie la précédente.',
        when: 'Concevoir un devis méthodologique qualitatif au chapitre III.',
      },
      {
        name: 'Saturation théorique',
        description: 'Arrêter la collecte quand les nouvelles données n\'apportent plus de nouvelles catégories ou propriétés.',
        when: 'Déterminer la taille de l\'échantillon et justifier la suffisance des données.',
      },
      {
        name: 'Codage itératif',
        description: 'Ouvrir (identifier) → Axial (relier) → Sélectif (intégrer). Trois étapes pour transformer les données brutes en théorie.',
        when: 'Analyser des données qualitatives au chapitre IV.',
      },
    ],
    principles: [
      'Le chercheur est l\'instrument de mesure — la réflexivité n\'est pas optionnelle, elle est méthodologique.',
      'La rigueur qualitative ≠ la rigueur quantitative. Critères : crédibilité, transférabilité, fiabilité, confirmabilité.',
      'Contextualiser toujours les citations : qui, quand, dans quelles conditions.',
      'Le devis de recherche est vivant — il évolue avec le terrain.',
      'Trianguler les sources de données pour renforcer la validité.',
    ],
    techniques: [
      'Entretien semi-directif : guide d\'entretien structuré mais souple, avec relances et reformulations.',
      'Analyse thématique : codage inductif des données → regroupement en thèmes → construction d\'une interprétation.',
      'Journal de terrain : notes contextuelles prises immédiatement après chaque observation ou entretien.',
      'Mémo analytiques : notes réflexives du chercheur sur ses interprétations émergentes.',
    ],
    antiPatterns: [
      'Appliquer un échantillonnage statistique à une démarche qualitative — les critères de pertinence diffèrent.',
      'Séparer collecte et analyse — en qualitatif, l\'analyse commence dès la première donnée.',
      'Ignorer la position du chercheur (posture épistémologique) dans le devis méthodologique.',
    ],
    relevance: [
      { chapterType: 'II', reason: 'Positionner son approche qualitative parmi les paradigmes existants.' },
      { chapterType: 'III', reason: 'Décrire et justifier le devis qualitatif : échantillonnage, collecte, analyse.' },
      { chapterType: 'IV', reason: 'Présenter les résultats qualitatifs avec citations contextualisées et thèmes.' },
      { chapterType: 'V', reason: 'Discuter de la crédibilité et des limites de l\'approche qualitative.' },
    ],
    quickReference: 'Spirale itérative, pas linéaire. Saturation théorique = critère d\'arrêt. Codage : ouvrir → axial → sélectif. Réflexivité obligatoire.',
  },

  'kothari-research-methodology': {
    id: 'kothari-research-methodology',
    title: 'Research Methodology — Methods and Techniques',
    author: 'C.R. Kothari',
    coreConcept: 'Un devis de recherche rigoureux nécessite une correspondance explicite entre la question, le design, l\'échantillonnage et la méthode d\'analyse.',
    frameworks: [
      {
        name: 'Arbre de décision méthodologique',
        description: 'Question de recherche → type de données (quantitatif/qualitatif/mixte) → design → échantillonnage → collecte → analyse.',
        when: 'Construire le devis de recherche au chapitre III.',
      },
      {
        name: 'Types d\'échantillonnage',
        description: 'Probabiliste (aléatoire simple, stratifié, systématique, par grappes) vs non probabiliste (de convenance, par quotas, boule de neige). Choisir selon la question et les contraintes.',
        when: 'Justifier le choix d\'échantillon et sa taille au chapitre III.',
      },
      {
        name: 'Validité et fiabilité',
        description: 'Validité interne (causalité), validité externe (généralisation), fiabilité (reproductibilité). Vérifier les trois.',
        when: 'Évaluer la qualité du devis et discuter des limites au chapitre V.',
      },
    ],
    principles: [
      'La question de recherche détermine la méthode, pas l\'inverse.',
      'Toute variable opérationnalisée doit être définie : nom, type, échelle de mesure, source.',
      'L\'échantillon doit être justifié, pas seulement décrit — pourquoi cette taille, cette méthode ?',
      'Hypothèse nulle (H0) ≠ absence d\'effet. Ne pas confondre non-rejet de H0 et preuve d\'absence.',
    ],
    techniques: [
      'Formulation SMART de l\'hypothèse : Spécifique, Mesurable, Atteignable, Réaliste, Temporellement défini.',
      'Matrice de données : pré-construire le tableau vide (variables × observations) AVANT la collecte.',
      'Test pilote : valider les instruments sur un petit échantillon avant la collecte principale.',
    ],
    antiPatterns: [
      'Choisir une méthode parce qu\'elle est populaire, pas parce qu\'elle répond à la question.',
      'Oublier de définir opérationnellement chaque variable — une variable mal définie est inutilisable.',
      'Interpréter p < 0.05 comme "preuve absolue" plutôt que comme "évidence contre H0".',
    ],
    relevance: [
      { chapterType: 'I', reason: 'Formulation de la question et des hypothèses.' },
      { chapterType: 'III', reason: 'Cœur du livre : devis, échantillonnage, instruments.' },
      { chapterType: 'IV', reason: 'Analyse statistique des données.' },
      { chapterType: 'V', reason: 'Discussion de la validité et des limites.' },
    ],
    quickReference: 'Question → design → échantillon → collecte → analyse. Définir chaque variable. Justifier, pas seulement décrire. Valider avant de collecter.',
  },

  'effective-academic-writing': {
    id: 'effective-academic-writing',
    title: 'Effective Academic Writing — The Researched Essay',
    author: 'Rhonda Liss, Alice Savage, Jason Davis',
    coreConcept: 'L\'essai académique argumenté repose sur une thèse claire, soutenue par des preuves structurées en paragraphes thématiques.',
    frameworks: [
      {
        name: 'Structure du paragraphe académique',
        description: 'Phrase-topic (idée) → développement (preuves + analyse) → phrase de transition. Modèle TEEL : Topic, Evidence, Explanation, Link.',
        when: 'Rédiger tout paragraphe argumentatif dans la thèse.',
      },
      {
        name: 'Intégration des sources',
        description: 'Trois modes : paraphrase (reformuler avec citation), résumé (condenser), citation directe (mot-à-mot). Alterner selon le besoin.',
        when: 'Intégrer la littérature au chapitre II et dans la discussion.',
      },
    ],
    principles: [
      'Chaque paragraphe doit pouvoir être compris indépendamment, mais contribuer à l\'argument global.',
      'Citer n\'est pas assez — il faut commenter chaque source : qu\'apporte-t-elle à ton argument ?',
      'La voix de l\'auteur doit rester dominante ; les sources soutiennent, ne remplacent pas.',
    ],
    techniques: [
      'Thèse-sommaire : rédiger une phrase qui résume l\'argument du chapitre entier avant de commencer.',
      'Signposting : utiliser des connecteurs explicites ("d\'abord", "cependant", "en revanche") pour guider le lecteur.',
      'Checklist d\'intégration : chaque citation est-elle suivie d\'une interprétation ? Chaque réclamation est-elle étayée ?',
    ],
    antiPatterns: [
      'Paragraphe-tiroir : entasser des citations sans analyse ni fil conducteur.',
      'Citation-orpheline : citer un auteur sans expliquer sa pertinence pour l\'argument.',
      'Thèse vague : "Cet article parle de X" sans positionnement ni interprétation.',
    ],
    relevance: [
      { chapterType: 'II', reason: 'La revue de littérature est fondamentalement un essai argumenté structuré.' },
      { chapterType: 'V', reason: 'La discussion argumente à partir des résultats et de la littérature.' },
      { chapterType: 'I', reason: 'L\'introduction pose la thèse de la recherche.' },
    ],
    quickReference: 'TEEL : Topic → Evidence → Explanation → Link. Chaque citation = interprétation. Voix auteur > voix sources.',
  },

  'longman-academic-writing': {
    id: 'longman-academic-writing',
    title: 'Longman Academic Writing — Essays to Research Papers',
    author: 'Alan Meyers',
    coreConcept: 'L\'écriture académique suit des patrons structurels récurrents qui, une fois maîtrisés, libèrent l\'énergie mentale pour le contenu.',
    frameworks: [
      {
        name: 'Patrons de développement paragraphe',
        description: 'Exemplification, comparaison/contraste, cause-effet, classification, définition, chronologie. Chaque type a sa structure.',
        when: 'Choisir comment développer un argument dans un paragraphe ou une section.',
      },
      {
        name: 'Structure IMRaD',
        description: 'Introduction (problème) → Méthodes (comment) → Résultats (quoi) → Discussion (pourquoi). Standard pour articles empiriques.',
        when: 'Structurer un article ou adapter la structure de la thèse.',
      },
    ],
    principles: [
      'La cohésion (connecteurs, reprises pronominales) est aussi importante que la cohérence (logique du contenu).',
      'Un paragraphe de 5-8 phrases est la zone optimale pour la lisibilité académique.',
      'L\'abstract se rédige EN DERNIER, même s\'il apparaît en premier.',
      'Variété syntaxique = lisibilité — alterner phrases courtes et longues.',
    ],
    techniques: [
      'Outline hiérarchique avant rédaction : I. → A. → 1. → a., avec un verbe d\'action par point.',
      'Reprise thématique : commencer chaque paragraphe par un rappel du thème précédent avant d\'introduire le nouveau.',
      'Lecture à voix haute pour tester le rythme et identifier les phrases trop longues.',
    ],
    antiPatterns: [
      'Paragraphe-monstre (>15 lignes) sans sous-structure interne.',
      'Enchaîner des phrases de même longueur et même structure — monotone et soporifique.',
      'Rédiger l\'abstract avant d\'avoir finalisé les résultats et la discussion.',
    ],
    relevance: [
      { chapterType: 'all', reason: 'Structuration et cohésion pertinentes pour chaque chapitre.' },
      { chapterType: 'II', reason: 'La revue exige des patrons de comparaison/contraste et de classification.' },
      { chapterType: 'IV', reason: 'Les résultats gagnent à suivre un ordre logique explicite (chronologie, importance...).' },
    ],
    quickReference: 'Choisir le patron de développement. Cohésion = connecteurs + reprises. IMRaD. Paragraphe 5-8 phrases. Abstract en dernier.',
  },

  'evaluating-research': {
    id: 'evaluating-research',
    title: 'Evaluating Research in Academic Journals',
    author: 'Fred Pyrczak, Maria Tcherni-Buzzeo',
    coreConcept: 'Évaluer la qualité d\'une recherche, c\'est examiner systématiquement son devis, ses données, ses conclusions et leur adéquation.',
    frameworks: [
      {
        name: 'Grille d\'évaluation critique',
        description: '8 critères : question de recherche, devis, échantillon, instruments, procédures, résultats, conclusions, généralisation. Évaluer chacun.',
        when: 'Critiquer un article au chapitre II ou évaluer sa propre méthodologie au chapitre V.',
      },
      {
        name: 'Différence corrélation vs causalité',
        description: 'Une corrélation n\'implique pas la causalité. Vérifier : y a-t-il un contrôle des variables confondantes ? Le design permet-il l\'inférence causale ?',
        when: 'Analyser les conclusions d\'une étude ou discuter ses propres résultats.',
      },
    ],
    principles: [
      'Les conclusions doivent être proportionnelles aux données — pas de sur-généralisation.',
      'Un échantillon biaisé invalide les conclusions, même si l\'analyse est sophistiquée.',
      'Les limitations sont obligatoires, pas optionnelles — les signaler renforce la crédibilité.',
      'Toujours vérifier si les mesures correspondent réellement aux concepts déclarés (validité de construit).',
    ],
    techniques: [
      'Checklist critique : pour chaque article, évaluer les 8 critères et noter les forces/faiblesses en 1-2 phrases.',
      'Tableau de synthèse comparative : colonnes = articles, lignes = critères (design, échantillon, résultats).',
      'Test de réplicabilité : les informations sont-elles suffisantes pour reproduire l\'étude ?',
    ],
    antiPatterns: [
      'Accepter les conclusions d\'un article sans examiner le devis et l\'échantillon.',
      'Citer un article pour son résultat sans mentionner ses limites.',
      'Confondre significativité statistique et importance pratique (effet de taille).',
    ],
    relevance: [
      { chapterType: 'II', reason: 'Critiquer les sources est le cœur de la revue de littérature.' },
      { chapterType: 'III', reason: 'Anticiper les critiques en construisant un devis solide.' },
      { chapterType: 'V', reason: 'Discuter les limites et la validité de ses propres résultats.' },
    ],
    quickReference: '8 critères d\'évaluation. Corrélation ≠ causalité. Conclusions ∝ données. Toujours mentionner les limites des sources citées.',
  },

  'ai-powered-academic': {
    id: 'ai-powered-academic',
    title: 'The AI-Powered Academic',
    author: 'Dr. Mehdi Bagheri',
    coreConcept: 'L\'IA est un assistant de recherche, pas un auteur — elle accélère les tâches répétitives et stimule la créativité, mais le jugement critique reste humain.',
    frameworks: [
      {
        name: 'Taxonomie des usages IA',
        description: '4 niveaux : (1) Recherche et veille, (2) Structuration et brainstorming, (3) Rédaction assistée, (4) Révision et feedback. Chaque niveau a ses propres garde-fous.',
        when: 'Déterminer comment utiliser l\'IA à chaque étape de la thèse.',
      },
      {
        name: 'Prompt engineering académique',
        description: 'Rôle + contexte + tâche + contraintes + format. Un prompt structuré produit des résultats 10x meilleurs qu\'une question vague.',
        when: 'Interagir avec tout outil IA pour la recherche ou la rédaction.',
      },
    ],
    principles: [
      'Toujours vérifier les faits et références générés par l\'IA — les hallucinations sont fréquentes.',
      'L\'IA ne remplace pas la lecture originale des sources — elle aide à les cibler.',
      'Transparence : déclarer l\'utilisation de l\'IA selon les directives de son institution.',
      'L\'IA est excellente pour les brouillons, médiocre pour les idées originales — inverser serait dangereux.',
      'Utiliser l\'IA comme partenaire de dialogue, pas comme générateur de texte final.',
    ],
    techniques: [
      'Prompt de reformulation : "Reformule ce paragraphe pour un ton académique plus formel, en conservant le sens exact."',
      'Prompt de synthèse : "Résume les points de convergence et de divergence entre ces 3 articles sur [sujet]."',
      'Prompt de feedback : "Critique cet argument en identifiant les biais potentiels et les contre-arguments manquants."',
    ],
    antiPatterns: [
      'Copier-coller du texte généré par l\'IA sans révision ni vérification.',
      'Demander à l\'IA de choisir ses sources — elle invente des références plausibles.',
      'Utiliser l\'IA pour contourner le processus de pensée plutôt que pour l\'alimenter.',
    ],
    relevance: [
      { chapterType: 'all', reason: 'L\'IA peut assister à chaque étape avec les bons garde-fous.' },
      { chapterType: 'II', reason: 'L\'IA excelle pour identifier des tendances dans la littérature, mais les sources doivent être vérifiées.' },
      { chapterType: 'V', reason: 'Utiliser l\'IA comme contradicteur pour renforcer la discussion.' },
    ],
    quickReference: 'IA = assistant, pas auteur. Vérifier TOUT. Prompt : rôle + contexte + tâche + contraintes + format. Déclarer l\'utilisation.',
  },

  'thesis-with-chatgpt': {
    id: 'thesis-with-chatgpt',
    title: 'Writing Your Thesis With ChatGPT',
    author: 'Paul Johannesson',
    coreConcept: 'ChatGPT peut transformer la rédaction de thèse s\'il est utilisé comme partenaire intellectuel structuré, avec des prompts ciblés et une supervision humaine constante.',
    frameworks: [
      {
        name: 'Workflow ChatGPT pour thèse',
        description: '4 étapes : (1) Brainstorming et structuration, (2) Rédaction de brouillons, (3) Révision et reformulation, (4) Vérification croisée. Ne jamais sauter l\'étape 4.',
        when: 'Planifier l\'utilisation de ChatGPT dans le processus de rédaction.',
      },
      {
        name: 'Prompts en cascade',
        description: 'Chaîner les prompts : d\'abord explorer, puis structurer, puis rédiger, puis critiquer. Chaque sortie nourrit le prompt suivant.',
        when: 'Construire une argumentation complexe ou rédiger une section longue.',
      },
    ],
    principles: [
      'Le texte final doit porter ta voix, pas celle de ChatGPT — l\'IA propose, tu disposes.',
      'Fournir du contexte avant de demander : résumé de ta thèse, chapitre en cours, ton cible.',
      'ChatGPT est un partenaire de réflexion, pas un moteur de production — interroge-le plus que tu ne lui demandes d\'écrire.',
      'La vérification factuelle est non négociable : chaque référence citée par ChatGPT doit être retrouvée.',
    ],
    techniques: [
      'Prompt de débat : "Je vais défendre [position X]. Joue le rôle d\'un examinateur critique et trouve les failles."',
      'Prompt de transition : "Voici la fin de ma section A et le début de ma section B. Rédige un paragraphe de transition."',
      'Prompt de simplification : "Explique ce concept technique comme si tu parlais à un étudiant de 1er cycle."',
    ],
    antiPatterns: [
      'Générer un chapitre entier en un prompt — le résultat sera générique et superficiel.',
      'Ne pas fournir de contexte au modèle — les réponses seront hors sujet.',
      'Oublier que ChatGPT a une date de coupure — il ne connaît pas la littérature récente.',
    ],
    relevance: [
      { chapterType: 'all', reason: 'Assistance IA applicable à chaque phase de rédaction.' },
      { chapterType: 'I', reason: 'Brainstorming de la problématique et structuration de l\'argument.' },
      { chapterType: 'II', reason: 'Aide à la synthèse et à l\'identification de lacunes dans la littérature.' },
      { chapterType: 'V', reason: 'Utilisation comme contradicteur pour renforcer la discussion.' },
    ],
    quickReference: 'Workflow : brainstorm → brouillon → révision → vérification. Prompts en cascade. Toujours fournir du contexte. Ta voix, pas celle de l\'IA.',
  },

  'measuring-academic-research': {
    id: 'measuring-academic-research',
    title: 'Measuring Academic Research',
    author: 'Ana Andrés',
    coreConcept: 'La bibliométrie fournit des indicateurs quantitatifs de la production scientifique, mais leur interprétation nécessite une compréhension de leurs biais et limites.',
    frameworks: [
      {
        name: 'Indicateurs bibliométriques clés',
        description: 'Productivité (nombre de publications), impact (citations, facteur d\'impact), collaboration (co-auteurs, réseaux). Trois dimensions complémentaires.',
        when: 'Mener une analyse bibliométrique ou interpréter des indicateurs de performance.',
      },
      {
        name: 'Analyse de citation',
        description: 'Mesurer combien de fois un article/auteur est cité, par qui, dans quels contextes. Distinguer auto-citations, citations négatives et citations de contexte.',
        when: 'Évaluer l\'influence d\'un chercheur ou d\'un article dans le domaine.',
      },
      {
        name: 'Facteur d\'impact et h-index',
        description: 'FI = citations reçues / articles publiés (2 ans, par journal). h-index = nombre d\'articles avec au moins h citations chacun. Les deux ont des limites.',
        when: 'Comparer des revues ou des chercheurs — toujours avec précautions.',
      },
    ],
    principles: [
      'Aucun indicateur unique ne capture la qualité de la recherche — utiliser un faisceau d\'indicateurs.',
      'Le facteur d\'impact mesure la revue, pas l\'article — ne pas l\'utiliser pour évaluer un travail individuel.',
      'Les différences disciplinaires rendent les comparaisons inter-domaines trompeuses.',
      'L\'auto-citation gonfle artificiellement les indicateurs — toujours vérifier.',
    ],
    techniques: [
      'Analyse descriptive : distribution des publications par année, auteur, revue, pays — visualiser avec graphiques.',
      'Cartographie de collaboration : réseau de co-auteurs pour identifier les clusters de recherche.',
      'Analyse de mots-clés : évolution des termes utilisés dans les titres et abstracts pour tracer les tendances.',
    ],
    antiPatterns: [
      'Utiliser le facteur d\'impact comme proxy de qualité d\'un article individuel.',
      'Comparer des h-index entre disciplines sans ajustement — les pratiques de citation diffèrent radicalement.',
      'Ignorer les biais de genre, de langue et de géographie dans les bases de données bibliométriques.',
    ],
    relevance: [
      { chapterType: 'II', reason: 'Positionner son champ par une analyse bibliométrique de la littérature.' },
      { chapterType: 'IV', reason: 'Présenter les résultats d\'une étude bibliométrique si c\'est la méthode choisie.' },
      { chapterType: 'V', reason: 'Discuter les limites des indicateurs utilisés et les biais potentiels.' },
    ],
    quickReference: 'FI = revue, pas article. h-index = productivité × impact. Toujours contextualiser. Multiples indicateurs > indicateur unique.',
  },

  'academic-writing-thesis': {
    id: 'academic-writing-thesis',
    title: 'Academic Writing & Research : How to Write a Good Thesis',
    author: 'Robin Sacredfire (Neil Mars)',
    coreConcept: 'Une bonne thèse suit la structure IMRaD, articule clairement problème-méthode-résultat-conclusion, et maintient un fil argumentatif cohérent du début à la fin.',
    frameworks: [
      {
        name: 'IMRaD adapté à la thèse',
        description: 'Introduction (problématique + revue) → Méthodologie → Résultats → Discussion → Conclusion. Chaque section a un rôle argumentatif précis.',
        when: 'Structurer l\'ensemble de la thèse ou un article dérivé.',
      },
      {
        name: 'Pensée critique en recherche',
        description: 'Évaluer les preuves, identifier les biais, questionner les hypothèses. La pensée critique est le moteur de la discussion.',
        when: 'Rédiger la discussion (chapitre V) et critiquer la littérature (chapitre II).',
      },
    ],
    principles: [
      'La problématique est la colonne vertébrale — chaque chapitre doit y contribuer explicitement.',
      'Les résultats ne se répètent pas, ils s\'interprètent — le "quoi" mène au "pourquoi".',
      'La conclusion ne résume pas, elle synthétise et ouvre — implications, limites, perspectives.',
      'Chaque revendication doit être étayée : donnée, citation, ou raisonnement logique.',
    ],
    techniques: [
      'Fil d\'Ariane : rédiger une phrase-guide par section, puis vérifier que chaque paragraphe y contribue.',
      'Matrice de synthèse : tableau avec colonnes (auteur, année, méthode, résultat principal, limite, pertinence pour ta thèse).',
      'Discussion en 3 temps : (1) résumer le résultat clé, (2) le comparer à la littérature, (3) l\'interpréter.',
    ],
    antiPatterns: [
      'Répéter les résultats dans la discussion sans ajout d\'interprétation.',
      'Introduire de nouvelles données ou références dans la conclusion.',
      'Problématique floue qui ne permet pas de délimiter le périmètre de la recherche.',
    ],
    relevance: [
      { chapterType: 'all', reason: 'Structure IMRaD et principes de rédaction applicables globalement.' },
      { chapterType: 'I', reason: 'Formulation de la problématique et du cadre.' },
      { chapterType: 'V', reason: 'La discussion est l\'exercice de pensée critique central.' },
      { chapterType: 'VI', reason: 'La conclusion synthétise et ouvre des perspectives.' },
    ],
    quickReference: 'IMRaD = structure argumentative. Problématique = colonne vertébrale. Résultats → interpréter. Conclusion = synthèse + ouvertures.',
  },

  'rmit-research-writing-skills': {
    id: 'rmit-research-writing-skills',
    title: 'Research and Writing Skills for Academic and Graduate Researchers',
    author: 'RMIT University Library',
    coreConcept: 'La recherche documentaire est une compétence méthodique : définir une stratégie, utiliser les bonnes bases, gérer les références et maintenir un profil chercheur.',
    frameworks: [
      {
        name: 'Stratégie de recherche documentaire',
        description: 'Question PCC (Population, Concept, Contexte) → mots-clés → opérateurs booléens → bases de données → filtres. Processus reproductible.',
        when: 'Construire la revue de littérature au chapitre II.',
      },
      {
        name: 'Revue systématique (PRISMA)',
        description: 'Identification → Sélection (critères inclusion/exclusion) → Évaluation → Extraction → Synthèse. Flux PRISMA obligatoire pour publication.',
        when: 'Mener une revue systématique ou structurer une revue exhaustive.',
      },
    ],
    principles: [
      'Une recherche documentaire sans stratégie = perte de temps. Toujours documenter la démarche.',
      'Les bases de données ne se valent pas : Scopus, Web of Science, PubMed, ERIC — chacune a sa couverture.',
      'Un gestionnaire de références (Zotero, Mendeley, EndNote) est indispensable dès le 1er article lu.',
      'ORCID = identifiant pérenne. Le créer dès le début de la carrière pour tracer toutes ses publications.',
    ],
    techniques: [
      'Snowballing : partir d\'un article clé et suivre ses références (backward) + les articles qui le citent (forward).',
      'Alertes de recherche : configurer des notifications dans Google Scholar et les bases de données pour les nouveaux articles.',
      'Matrice d\'extraction : colonnes (auteur, année, méthode, résultat, qualité, pertinence) pour chaque article retenu.',
    ],
    antiPatterns: [
      'Se limiter à Google Scholar — il manque des bases spécialisées et ne permet pas de recherches avancées.',
      'Ne pas sauvegarder les références au fur et à mesure — la reconstitution est cauchemardesque.',
      'Oublier de documenter la stratégie de recherche — la reproductibilité est perdue.',
    ],
    relevance: [
      { chapterType: 'II', reason: 'Cœur de la revue de littérature : stratégie, bases, sélection.' },
      { chapterType: 'III', reason: 'Documenter la stratégie de recherche comme partie du devis méthodologique.' },
      { chapterType: 'I', reason: 'Établir l\'état de l\'art pour justifier la problématique.' },
    ],
    quickReference: 'PCC → mots-clés → booléens → bases. PRISMA pour les revues systématiques. Gestionnaire de références = obligatoire. ORCID dès le début.',
  },

  'eco-comment-ecrire-ces-these': {
    id: 'eco-comment-ecrire-ces-these',
    title: 'Comment écrire sa thèse',
    author: 'Umberto Eco',
    coreConcept: "La thèse est un travail d'artisanat intellectuel : choisir un sujet faisable, organiser méthodiquement ses fiches de lecture, construire un plan rigoureux, et respecter les normes de citation. L'originalité vient du cadrage, pas du sujet.",
    frameworks: [
      {
        name: 'Test des 4 conditions du sujet',
        description: "Un sujet de thèse doit être : (1) pertinent pour la communauté scientifique, (2) traitable avec les outils disponibles, (3) délimitable en temps et espace, (4) original par l'angle ou la méthode — pas nécessairement par le thème.",
        when: "L'étudiant hésite sur son sujet ou demande si son idée est 'assez originale'.",
      },
      {
        name: 'Système de fiches de lecture',
        description: "Trois types de fiches : (a) fiches bibliographiques (référence complète + résumé), (b) fiches de lecture (citations mot à mot avec pagination), (c) fiches de travail (idées personnelles, liens, critiques). Organisation par thème, pas par ordre de lecture.",
        when: "L'étudiant accumule des lectures sans organisation claire ou ne retrouve pas ses citations.",
      },
      {
        name: 'Plan en titres et sous-titres',
        description: "Construire le plan avant la rédaction. Chaque chapitre = une idée. Chaque section = un argument. La structure IMRaD est un cadre, pas une prison. Le plan final peut différer du plan initial — c'est normal.",
        when: "L'étudiant doit structurer sa thèse ou planifier l'enchaînement des chapitres.",
      },
    ],
    principles: [
      "La thèse est un exercice de communication : le lecteur doit comprendre, pas seulement admirer.",
      "Citer systématiquement : chaque affirmation non-triviale doit être référencée. L'absence de citation = plagiat ou opinion non fondée.",
      "Le style académique n'est pas du jargon : clarté > complexité. Les meilleures thèses sont les plus lisibles.",
      "Le plan est un contrat avec le lecteur : annoncez ce que vous allez dire, dites-le, puis rappelez ce que vous avez dit.",
    ],
    techniques: [
      "Fiche de lecture Eco : auteur, titre, année, éditeur + pages lues + résumé en 5 lignes + 2-3 citations clés avec page.",
      "Méthode de la page blanche : quand vous bloquez, écrivez 'Ce que je veux dire ici c'est...' et laissez couler.",
      "Vérification croisée : chaque référence citée dans le texte doit être dans la bibliographie, et vice-versa.",
      "Règle du paragraphe : un paragraphe = une idée principale. Si un paragraphe dépasse une page, il faut le découper.",
    ],
    antiPatterns: [
      "Choisir un sujet trop vaste ('la mondialisation') — la thèse n'est pas une encyclopédie.",
      "Attendre d'avoir tout lu pour commencer à écrire — la lecture et l'écriture sont itératives.",
      "Copier-coller sans guillemets ni référence — c'est du plagiat, même involontaire.",
      "Écrire dans un style obscur pour paraître savant — la clarté est la marque de l'expert.",
    ],
    relevance: [
      { chapterType: 'all', reason: "Référence fondamentale pour toute la démarche de thèse, du sujet à la soutenance." },
      { chapterType: 'I', reason: 'Choix du sujet, construction de la problématique et planification.' },
      { chapterType: 'II', reason: 'Organisation des fiches de lecture et structuration de la revue de littérature.' },
    ],
    quickReference: "Sujet faisable + délimité + original dans l'angle. 3 types de fiches (biblio, lecture, travail). 1 paragraphe = 1 idée. Citer tout, toujours.",
  },

  'dutta-academic-research-writing': {
    id: 'dutta-academic-research-writing',
    title: 'Academic and Research Writing',
    author: 'Sanjay Kumar Dutta',
    coreConcept: "La rédaction académique est un processus en 6 étapes : explorer → sélectionner → organiser → rédiger → réviser → publier. Chaque étape a ses outils et ses critères de qualité.",
    frameworks: [
      {
        name: 'Modèle en 6 étapes de la rédaction académique',
        description: '(1) Explorer le domaine, (2) Sélectionner le sujet et les sources, (3) Organiser le plan et les arguments, (4) Rédiger le premier jet, (5) Réviser structure + style + références, (6) Préparer la publication.',
        when: "L'étudiant est dépassé et ne sait pas par où commencer son article ou chapitre.",
      },
      {
        name: `Rubrique d'évaluation d'un écrit académique`,
        description: '5 critères : clarté du propos, qualité des arguments, rigueur des références, structure logique, qualité de la langue. Se noter soi-même avant soumission.',
        when: "L'étudiant veut auto-évaluer la qualité de son texte avant de le soumettre.",
      },
    ],
    principles: [
      "La rédaction académique est un processus itératif, pas un événement unique.",
      "Le premier jet n'a pas besoin d'être parfait — il doit être complet. La révision fait le reste.",
      "Chaque paragraphe doit avoir un topic sentence, du développement, et une transition vers le suivant.",
      "Les références ne sont pas de la décoration — elles soutiennent chaque affirmation clé.",
    ],
    techniques: [
      'Outline détaillé avant rédaction : chaque section avec son topic sentence et ses références prévues.',
      'Révision en 3 passes : (1) structure et argumentation, (2) style et clarté, (3) références et format.',
      'Paragraph framing : topic sentence → evidence → analysis → transition.',
    ],
    antiPatterns: [
      'Soumettre un premier jet sans révision — la différence entre un bon et un mauvais texte est la révision.',
      'Négliger le plan au profit de l\'inspiration — un plan solide rend la rédaction 3x plus rapide.',
      'Sur-citer : citer chaque phrase banales dilue l\'impact des vraies références.',
    ],
    relevance: [
      { chapterType: 'all', reason: 'Processus de rédaction applicable à tous les chapitres de la thèse.' },
      { chapterType: 'I', reason: 'Structurer l\'introduction et la problématique selon la méthode en 6 étapes.' },
      { chapterType: 'IV', reason: 'Présenter les résultats avec la rigueur attendue par les revues académiques.' },
    ],
    quickReference: 'Explorer → Sélectionner → Organiser → Rédiger → Réviser → Publier. 3 passes de révision. Topic sentence par paragraphe.',
  },

  'sulkowski-academic-writing-visualization': {
    id: 'sulkowski-academic-writing-visualization',
    title: 'Academic Writing, Visualization, Presentation, and Publishing of Research',
    author: 'Łukasz Sułkowski, Joanna Kurowska-Pysz et al.',
    coreConcept: 'La communication scientifique repose sur 4 piliers interconnectés : écrire clairement, visualiser les données efficacement, présenter oralement avec impact, et publier selon les normes des revues.',
    frameworks: [
      {
        name: '4 piliers de la communication scientifique',
        description: '(1) Writing : structure, style, citations. (2) Visualization : choix du bon graphique, légendes, couleurs. (3) Presentation : slide design, narration, timing. (4) Publishing : choix de la revue, lettre de soumission, réponse aux relecteurs.',
        when: "L'étudiant doit communiquer ses résultats sous forme écrite, visuelle, orale ou pour publication.",
      },
      {
        name: 'Guide de choix des visualisations',
        description: 'Comparaison → bar chart. Évolution dans le temps → line chart. Proportion → pie/donut (max 5 parts). Corrélation → scatter. Distribution → histogram. Hiérarchie → treemap. Chaque graphique = un message, pas un data dump.',
        when: "L'étudiant doit choisir le bon type de graphique pour présenter ses données.",
      },
    ],
    principles: [
      'Une bonne figure vaut 1000 mots — mais une mauvaise figure en vaut -500.',
      'Chaque slide de présentation = une idée. Pas de paragraphes sur les slides.',
      'La lettre de soumission à une revue est un argumentaire : pourquoi ce papier, pourquoi cette revue, pourquoi maintenant.',
      'Répondre aux relecteurs : accepter, argumenter ou fournir des données. Jamais ignorer un commentaire.',
    ],
    techniques: [
      'Graphique minimaliste : enlever tout ce qui ne contribue pas au message (gridlines inutiles, 3D, dégradés).',
      'Slide storytelling : contexte → question → méthode → résultat → implication. 1 minute par slide.',
      'Réponse structurée aux relecteurs : tableau avec chaque commentaire, la réponse, et la localisation dans le texte révisé.',
    ],
    antiPatterns: [
      'Camembert 3D avec 12 parts — illisible et trompeur.',
      'Slide avec 200 mots en police 10 — le public ne lit pas, il s\'ennuie.',
      'Ignorer les guidelines de la revue cible — rejet immédiat par l\'éditeur.',
    ],
    relevance: [
      { chapterType: 'IV', reason: 'Présentation optimale des résultats avec des visualisations efficaces.' },
      { chapterType: 'V', reason: 'Discussion des résultats et préparation de la communication scientifique.' },
      { chapterType: 'VI', reason: 'Préparation de la publication et réponse aux relecteurs.' },
    ],
    quickReference: '4 piliers : Write → Visualize → Present → Publish. 1 graphique = 1 message. 1 slide = 1 idée.',
  },

  'srivastava-ai-tools-academic-writing': {
    id: 'srivastava-ai-tools-academic-writing',
    title: 'Utilizing AI Tools in Academic Research Writing',
    author: 'Anugamini Priya Srivastava, Anjali Agarwal et al.',
    coreConcept: "L'IA générative est un assistant de recherche, pas un auteur. Elle accélère le processus d'écriture mais ne remplace ni la pensée critique, ni la vérification des faits, ni l'intégrité académique. L'éthique guide l'usage.",
    frameworks: [
      {
        name: `Cadre d'utilisation éthique de l'IA en académique`,
        description: "3 principes : (1) Transparence — déclarer tout usage d'IA, (2) Vérification — valider chaque fait, citation et chiffre générés, (3) Suppléance — l'IA assiste, le chercheur décide. L'IA ne peut pas être citée comme auteur.",
        when: "L'étudiant utilise ChatGPT ou tout autre outil IA dans sa thèse et s'interroge sur l'éthique.",
      },
      {
        name: 'Workflow IA pour la rédaction académique',
        description: "(1) Brainstorming et structuration, (2) Recherche documentaire assistée, (3) Rédaction de brouillons, (4) Révision linguistique et style, (5) Vérification des références. Chaque étape = humain au contrôle, IA en support.",
        when: "L'étudiant veut intégrer l'IA dans son flux de travail sans compromettre la qualité.",
      },
      {
        name: 'Taxonomie des outils IA académiques',
        description: "Rédaction (ChatGPT, Claude, Gemini), Correction (Grammarly, LanguageTool), Citations (Zotero + AI, Consensus), Visualisation (Code Interpreter, Elicit), Traduction (DeepL), Détection IA (GPTZero, Turnitin).",
when: "L'étudiant cherche l'outil adapté à chaque étape de son processus de recherche.",
      },
    ],
    principles: [
      "L'IA ne remplace pas la pensée critique — elle la nourrit si on l'utilise bien.",
      "Toujours vérifier les faits et références générés par l'IA — les hallucinations sont fréquentes.",
      "Déclarer l'usage de l'IA est une obligation éthique, pas une faiblesse.",
      "Le prompt est un outil : des prompts précis = des réponses utiles. Des prompts vagues = du bruit.",
      "L'IA accélère la mécanique de l'écriture mais ne remplace pas la substance de la pensée.",
    ],
    techniques: [
      "Prompt structuré : rôle + contexte + tâche + contraintes + format. Ex: 'En tant qu'expert en [domaine], rédige un paragraphe sur [sujet] en style académique, 200 mots, avec 2 références.'",
      'Chaîne de révision IA : (1) rédiger sans IA, (2) faire réviser par l\'IA, (3) corriger les suggestions inappropriées, (4) relire humainement.',
      'Vérification croisée : quand l\'IA cite un auteur ou un chiffre, vérifier avec Google Scholar ou la source originale.',
      'Détection préventive : passer son propre texte dans un détecteur IA pour identifier les passages trop "robotiques" et les réécrire.',
    ],
    antiPatterns: [
      "Copier-coller un texte généré par l'IA sans le réviser — c'est de la paresse intellectuelle, pas de l'aide.",
      'Faire confiance aux références hallucinées — l\'IA invente des articles qui n\'existent pas.',
      'Ne pas déclarer l\'usage de l\'IA — risque de plagiat et sanctions institutionnelles.',
      'Utiliser l\'IA pour éviter de lire les sources primaires — la pensée de seconde main est évidente.',
    ],
    relevance: [
      { chapterType: 'all', reason: "L'usage de l'IA concerne tous les chapitres et toutes les étapes de la thèse." },
      { chapterType: 'I', reason: 'Utilisation de l\'IA pour le brainstorming et la structuration de la problématique.' },
      { chapterType: 'IV', reason: "Aide à la rédaction des résultats avec vérification obligatoire des données." },
    ],
    quickReference: "IA = assistant, pas auteur. Toujours vérifier. Toujours déclarer. Prompt structuré = bon résultat. Chaîne : humain → IA → humain.",
  },
}

/**
 * Returns book skills relevant to a given chapter type, sorted by relevance.
 * Books with chapterType 'all' are included but ranked after specific matches.
 */
export function getBookSkillsForChapter(chapterType: string): BookSkill[] {
  const specific: BookSkill[] = []
  const universal: BookSkill[] = []

  for (const skill of Object.values(BOOK_SKILLS)) {
    const hasSpecific = skill.relevance.some(
      (r) => r.chapterType !== 'all' && r.chapterType === chapterType
    )
    if (hasSpecific) {
      specific.push(skill)
    } else if (skill.relevance.some((r) => r.chapterType === 'all')) {
      universal.push(skill)
    }
  }

  return [...specific, ...universal]
}

/**
 * Returns a formatted markdown string for injection into an AI system prompt.
 * Produces ~400-500 tokens per book, targeting 500-800 tokens total for 2-3 books.
 * For async version that includes custom (user-imported) books, see @/lib/book-skills-server
 */
export function getBookSkillSummary(bookIds: string[]): string {
  const skills = bookIds
    .map((id) => BOOK_SKILLS[id])
    .filter(Boolean)

  return formatSkillsToMarkdown(skills)
}

function formatSkillsToMarkdown(skills: BookSkill[]): string {
  if (skills.length === 0) return ''

  const lines: string[] = [`## Références actives (${skills.length} ouvrage${skills.length > 1 ? 's' : ''})\n`]

  for (const s of skills) {
    lines.push(`### ${s.title} (${s.author})`)
    lines.push(`**Concept clé :** ${s.coreConcept}`)

    if (s.frameworks.length > 0) {
      lines.push('**Cadres :**')
      for (const f of s.frameworks) {
        lines.push(`- *${f.name}* : ${f.description}`)
      }
    }

    lines.push('**Principes :**')
    for (const p of s.principles) {
      lines.push(`- ${p}`)
    }

    if (s.antiPatterns.length > 0) {
      lines.push('**Éviter :**')
      for (const a of s.antiPatterns) {
        lines.push(`- ✗ ${a}`)
      }
    }

    lines.push(`**Aide-mémoire :** ${s.quickReference}`)
    lines.push('')
  }

  return lines.join('\n')
}