// Rhetorical Moves Checklist — per-chapter checkable items for the HelpPanel Guide tab
// Based on FICHE_RHETORIQUE (guidance-fiches.ts) and chapters-structure.ts writingTips/commonMistakes

export interface RhetoricalMove {
  id: string
  label: string
  category: 'structure' | 'argument' | 'style' | 'form'
  severity: 'critical' | 'important' | 'recommended'
  tip: string
}

export const RHETORICAL_CHECKLISTS: Record<string, RhetoricalMove[]> = {
  // ─── I. INTRODUCTION ───
  'I': [
    {
      id: 'I-territoire',
      label: 'Territoire établi : contexte large resserré vers le champ spécifique (entonnoir)',
      category: 'structure',
      severity: 'critical',
      tip: 'L\'introduction doit ouvrir par un domaine disciplinaire, puis progressivement resserrer vers l\'objet précis. Si le lecteur ne perçoit pas de mouvement de focalisation, le territoire n\'est pas établi.',
    },
    {
      id: 'I-creneau',
      label: 'Créneau identifié : au moins une lacune dans les connaissances est nommée explicitement',
      category: 'argument',
      severity: 'critical',
      tip: 'C\'est l\'étape la plus souvent bâclée. Sans créneau, l\'intro se résume à « dans cette thèse nous allons… » sans que le lecteur comprenne pourquoi ce travail est nécessaire.',
    },
    {
      id: 'I-creneau-occupe',
      label: 'Créneau occupé : objectifs clairement énoncés en réponse au créneau identifié',
      category: 'argument',
      severity: 'critical',
      tip: 'Les objectifs doivent remplir le créneau. Chaque objectif doit correspondre à une lacune ou sous-question de recherche identifiée plus haut.',
    },
    {
      id: 'I-problematique',
      label: 'Problématique unique, claire et opérationnelle (un seul énoncé interrogatif principal)',
      category: 'argument',
      severity: 'critical',
      tip: 'Une problématique trop vaste ou trop vague (ex. « Comment améliorer l\'éducation ? ») ne pilote pas la thèse. Elle doit être ciblée et falsifiable.',
    },
    {
      id: 'I-plan-logique',
      label: 'Annonce de plan logique : enchaînement des chapitres expliqué, pas seulement énuméré',
      category: 'structure',
      severity: 'important',
      tip: 'L\'annonce du plan ne doit pas ressembler à une table des matières en prose. Le lecteur doit comprendre pourquoi les chapitres se suivent dans cet ordre.',
    },
    {
      id: 'I-hypotheses',
      label: 'Hypothèses de recherche testables, chacune liée à une sous-question spécifique',
      category: 'argument',
      severity: 'important',
      tip: 'Des hypothèses qui ne sont pas falsifiables ou qui ne découlent pas logiquement du cadre théorique fragilisent tout l\'édifice de la recherche.',
    },
    {
      id: 'I-apport',
      label: 'Apport théorique et pratique explicitement dégagé',
      category: 'argument',
      severity: 'important',
      tip: 'Le lecteur doit comprendre ce qui est nouveau dans cette thèse — nouveau cadre, modèle, concepts (apport théorique) et recommandations, outils, implications (apport pratique).',
    },
    {
      id: 'I-concision',
      label: 'Introduction limitée à 10-15 pages : chaque mot justifie l\'existence de la thèse',
      category: 'style',
      severity: 'recommended',
      tip: 'Rédigez l\'introduction en dernier — une fois les chapitres stabilisés, vous connaîtrez exactement le chemin parcouru pour l\'annoncer.',
    },
    {
      id: 'I-citations-maigres',
      label: 'Citations signalées mais non discutées en détail (la discussion vient au chapitre II)',
      category: 'style',
      severity: 'recommended',
      tip: 'L\'introduction signale les références, la revue de littérature les discute. Ne citez pas encore abondamment.',
    },
  ],

  // ─── II. BIBLIOGRAPHIE ───
  'II': [
    {
      id: 'II-organisation-theme',
      label: 'Organisation par thème ou débat, jamais par liste chronologique d\'auteurs',
      category: 'structure',
      severity: 'critical',
      tip: 'La « revue catalogue » où les auteurs s\'enchaînent sans analyse critique est le défaut le plus fréquent. Utilisez des sous-titres thématiques.',
    },
    {
      id: 'II-research-gap',
      label: 'Research gap explicite : au moins une lacune de recherche formulée clairement',
      category: 'argument',
      severity: 'critical',
      tip: 'La revue doit mener logiquement à un vide identifié que votre étude vient combler. Sans ce passage, le lien avec vos objectifs est fragile.',
    },
    {
      id: 'II-cadres-conceptuels',
      label: 'Cadres conceptuels définis : chaque concept clé défini avec source d\'autorité + operationalisation',
      category: 'argument',
      severity: 'critical',
      tip: 'Chaque concept doit être défini une fois, clairement, avec sa source. Distinguez cadre théorique (grille de lecture) et cadre conceptuel (concepts opérationnels).',
    },
    {
      id: 'II-verbes-rapport',
      label: 'Verbes de rapport variés et positionnés (« montre que », « suggère », « conteste », « nuance »)',
      category: 'style',
      severity: 'important',
      tip: 'Les verbes de rapport doivent refléter votre position critique. Tout rapporter au même niveau (« X dit que », « Y dit que ») signale une absence de synthèse.',
    },
    {
      id: 'II-resume-vs-synthese',
      label: 'Distinction nette entre résumé (reformuler une source) et synthèse (mettre en dialogue)',
      category: 'argument',
      severity: 'important',
      tip: 'Résumer chaque étude tour à tour n\'est pas synthétiser. La synthèse met plusieurs sources en dialogue pour faire émerger tendances, convergences et tensions.',
    },
    {
      id: 'II-contradicteurs',
      label: 'Résultats divergents et contradicteurs inclus dans l\'analyse',
      category: 'argument',
      severity: 'important',
      tip: 'Ignorer les études qui vont à l\'encontre de vos hypothèses affaiblit votre crédibilité. Une bonne revue inclut les résultats divergents.',
    },
    {
      id: 'II-references-recentes',
      label: 'Références récentes (≥ 40 % publiées dans les 5 dernières années) avec classiques fondateurs',
      category: 'form',
      severity: 'important',
      tip: 'Un déséquilibre entre ancienneté et actualité signale soit une revue datée, soit un manque de veille.',
    },
    {
      id: 'II-positionnement',
      label: 'Positionnement par rapport aux cadres existants : prolongement, opposition, intégration ou transposition',
      category: 'argument',
      severity: 'recommended',
      tip: 'Le lecteur doit comprendre en quoi votre cadre se distingue de ce qui existe déjà — un tableau comparatif peut aider.',
    },
    {
      id: 'II-transitions',
      label: 'Phrases de transition entre sections reliant le contenu à votre propre recherche',
      category: 'style' as const,
      severity: 'recommended' as const,
      tip: 'Des paragraphes de synthèse entre chaque section montrent les liens logiques et tensions entre courants.',
    },
    {
      id: 'II-biblio-strategie-recherche',
      label: 'Requête documentaire documentée (bases de données, opérateurs booléens, synonymes)',
      category: 'structure' as const,
      severity: 'important' as const,
      tip: "La stratégie de recherche doit être reproductible : bases consultées, requêtes exactes, périodes. Cela fait partie d'une revue de littérature de qualité.",
    },
    {
      id: 'II-biblio-gestionnaire-ref',
      label: 'Système de gestion des références utilisé (Zotero, Mendeley, EndNote)',
      category: 'form' as const,
      severity: 'recommended' as const,
      tip: 'Un gestionnaire de références évite la reconstruction laborieuse de la bibliographie en fin de parcours et assure la cohérence des citations.',
    },
  ],

  // ─── III. MÉTHODOLOGIE ───
  'III': [
    {
      id: 'III-methodes-justifiees',
      label: 'Méthodes justifiées par rapport à la question, pas seulement décrites',
      category: 'argument',
      severity: 'critical',
      tip: 'La méthodologie n\'est pas une recette — c\'est un argumentaire raisonné. Chaque choix doit être relié à la problématique et appuyé par la littérature.',
    },
    {
      id: 'III-unite-analyse',
      label: 'Unité d\'analyse justifiée : pourquoi ce cas, cet échantillon, ce corpus',
      category: 'argument',
      severity: 'critical',
      tip: 'La justification de l\'unité d\'analyse est souvent négligée. Le lecteur doit comprendre pourquoi ce terrain et pas un autre.',
    },
    {
      id: 'III-validite-fiabilite',
      label: 'Validité (interne/externe) et fiabilité des instruments abordées et discutées',
      category: 'argument',
      severity: 'critical',
      tip: 'Un questionnaire non validé ou une analyse sans discussion de validité perd toute crédibilité scientifique.',
    },
    {
      id: 'III-limites-sources',
      label: 'Limites des sources de données décrites et évaluées',
      category: 'argument',
      severity: 'important',
      tip: 'Toute source a des limites. Les identifier et évaluer leur impact montre une maîtrise méthodologique.',
    },
    {
      id: 'III-design-recherche',
      label: 'Design de recherche explicité et justifié (expérimental, étude de cas, etc.)',
      category: 'structure',
      severity: 'important',
      tip: 'Précisez le design retenu et pourquoi il est le plus adapté à votre question. Un schéma récapitulatif du design global est un plus.',
    },
    {
      id: 'III-biais',
      label: 'Biais potentiels identifiés (sélection, réponse, observateur) avec stratégies de minimisation',
      category: 'argument',
      severity: 'important',
      tip: 'Négliger les biais potentiels est un signal de manque de rigueur. Chaque biais identifié doit être accompagné d\'une stratégie.',
    },
    {
      id: 'III-epistemologie',
      label: 'Posture épistémologique explicitée et ses conséquences sur les choix méthodologiques',
      category: 'structure',
      severity: 'recommended',
      tip: 'Le lecteur doit comprendre votre positionnement (positivisme, constructivisme, pragmatisme…) et en quoi il conditionne vos choix.',
    },
    {
      id: 'III-ethique',
      label: 'Considérations éthiques abordées : consentement, anonymat, confidentialité',
      category: 'form',
      severity: 'recommended',
      tip: 'Même si un comité d\'éthique n\'est pas requis, le mentionner montre le sérieux de la démarche.',
    },
  ],

  // ─── IV. RÉSULTATS ───
  'IV': [
    {
      id: 'IV-neutralite',
      label: 'Neutralité maximale : pas d\'interprétation ni de jugement dans la présentation',
      category: 'argument',
      severity: 'critical',
      tip: 'Le chapitre IV doit se limiter à la présentation factuelle. Toute interprétation appartient au chapitre V (Discussion).',
    },
    {
      id: 'IV-tableaux-references',
      label: 'Tableaux et figures numérotés, titrés et explicitement référencés dans le texte',
      category: 'form',
      severity: 'critical',
      tip: 'Un tableau ou une figure non référencé dans le texte est invisible pour le lecteur. Référencez-le avant qu\'il n\'apparaisse.',
    },
    {
      id: 'IV-organisation-hypothese',
      label: 'Résultats organisés par objectif ou hypothèse, pas par type d\'analyse statistique',
      category: 'structure',
      severity: 'critical',
      tip: 'L\'organisation par type d\'analyse (ex. « tests t puis ANOVA ») est technocentrique. Organisez par question de recherche pour garder le fil narratif.',
    },
    {
      id: 'IV-resultats-non-attendus',
      label: 'Résultats non attendus ou contraires aux hypothèses inclus et présentés honnêtement',
      category: 'argument',
      severity: 'important',
      tip: 'Omettre les résultats non significatifs ou contraires aux hypothèses est une faille déontologique. Leur présentation honnête renforce la crédibilité.',
    },
    {
      id: 'IV-descriptif-avant-inférentiel',
      label: 'Analyses descriptives présentées avant les analyses inférentielles',
      category: 'structure',
      severity: 'important',
      tip: 'Commencer par l\'inférentiel sans donner le profil des données empêche le lecteur d\'évaluer la pertinence des tests.',
    },
    {
      id: 'IV-conventions-statistiques',
      label: 'Conventions statistiques respectées : valeur du test, significativité, taille d\'effet, IC',
      category: 'form',
      severity: 'important',
      tip: 'Rapporter uniquement la p-valeur sans taille d\'effet est insuffisant. Suivez les conventions disciplinaires (APA, etc.).',
    },
    {
      id: 'IV-non-duplication',
      label: 'Texte résume et met en évidence, tableaux donnent le détail — pas de duplication',
      category: 'style',
      severity: 'recommended',
      tip: 'Dupliquer les données entre texte et tableaux alourdit la lecture. Le texte doit dire, le tableau montrer.',
    },
    {
      id: 'IV-synthese-fin',
      label: 'Tableau de synthèse des résultats par hypothèse en fin de chapitre',
      category: 'structure',
      severity: 'recommended',
      tip: 'Un résumé visuel en fin de chapitre aide le lecteur (et le directeur) à vérifier la couverture de toutes les hypothèses.',
    },
  ],

  // ─── V. DISCUSSION ───
  'V': [
    {
      id: 'V-confrontation-hypotheses',
      label: 'Confrontation systématique aux hypothèses : chaque hypothèse confirmée, infirmée ou partielle',
      category: 'argument',
      severity: 'critical',
      tip: 'Chaque hypothèse doit recevoir un statut clair. L\'absence de confrontation laisse le lecteur sans réponse sur la validité de la recherche.',
    },
    {
      id: 'V-implications-theoriques',
      label: 'Implications théoriques dégagées : en quoi les résultats modifient/enrichissent les modèles existants',
      category: 'argument',
      severity: 'critical',
      tip: 'Les implications théoriques sont la raison d\'être de la discussion. Sans elles, le chapitre se réduit à un commentaire descriptif.',
    },
    {
      id: 'V-implications-pratiques',
      label: 'Implications pratiques formulées : recommandations concrètes pour les praticiens ou décideurs',
      category: 'argument',
      severity: 'critical',
      tip: 'Distinguez clairement implications théoriques (avancées conceptuelles) et pratiques (recommandations opérationnelles) dans des sous-sections séparées.',
    },
    {
      id: 'V-limites-impact',
      label: 'Limites avec impact réel sur la validité des conclusions, pas seulement génériques',
      category: 'argument',
      severity: 'important',
      tip: '« Notre échantillon est petit » sans expliquer l\'impact réel n\'est pas une limite discutée. Chaque limite doit montrer son effet potentiel sur les conclusions.',
    },
    {
      id: 'V-nuance',
      label: 'Langage de nuance mesurée : « suggère », « il est possible que », pas d\'affirmations péremptoires',
      category: 'style',
      severity: 'important',
      tip: 'La discussion remonte du particulier vers le général. Utilisez des connecteurs logiques explicites pour les comparaisons avec la littérature.',
    },
    {
      id: 'V-resultats-inattendus',
      label: 'Résultats inattendus expliqués par des arguments théoriques ou contextuels',
      category: 'argument',
      severity: 'important',
      tip: 'Les divergences avec la littérature sont souvent les plus fertiles intellectuellement. Ignorer les contradicteurs est une erreur.',
    },
    {
      id: 'V-pas-repetition',
      label: 'Pas de répétition des résultats bruts : la discussion interprète, ne restitue pas',
      category: 'style',
      severity: 'important',
      tip: 'Reproduire les chiffres du chapitre IV n\'apporte rien. Le lecteur a déjà lu les résultats — il attend votre interprétation.',
    },
    {
      id: 'V-perspectives',
      label: 'Perspectives de recherche concrètes, en lien direct avec les limites et les résultats',
      category: 'structure',
      severity: 'recommended',
      tip: 'Des perspectives déconnectées des résultats ou des limites n\'ont pas de légitimité. Chaque piste doit découler logiquement de votre étude.',
    },
    {
      id: 'V-structure-fin',
      label: 'Conclusion de chapitre terminant sur l\'apport, pas sur les limites',
      category: 'structure',
      severity: 'recommended',
      tip: 'La structure idéale : contribution → limites → implications → pistes futures. Terminez sur l\'apport, pas sur les faiblesses.',
    },
  ],

  // ─── VI. CONCLUSION ───
  'VI': [
    {
      id: 'VI-reponse-problematique',
      label: 'Réponse explicite et directe à la problématique initiale',
      category: 'argument',
      severity: 'critical',
      tip: 'La conclusion est le moment clé où le lecteur attend la réponse. Sans elle, la thèse reste inachevée aux yeux du jury.',
    },
    {
      id: 'VI-contribution-affirmee',
      label: 'Contribution scientifique affirmée : ce qui est nouveau, ce qui fait avancer le domaine',
      category: 'argument',
      severity: 'critical',
      tip: 'Le lecteur doit pouvoir citer en une phrase ce que votre thèse apporte au domaine. Si la contribution est noyée, elle est invisible.',
    },
    {
      id: 'VI-pas-nouveaux-resultats',
      label: 'Aucun nouveau résultat, référence ou argument non discuté dans les chapitres précédents',
      category: 'argument',
      severity: 'critical',
      tip: 'Introduire du nouveau contenu en conclusion est une erreur fréquente. La conclusion synthétise, elle n\'enrichit pas.',
    },
    {
      id: 'VI-hypotheses-bilan',
      label: 'Bilan des hypothèses : confirmées, infirmées ou partiellement validées',
      category: 'structure',
      severity: 'important',
      tip: 'Le lecteur doit trouver un récapitulatif clair du sort de chaque hypothèse. Cela peut prendre la forme d\'un tableau synthétique.',
    },
    {
      id: 'VI-coherence-globale',
      label: 'Cohérence globale du manuscrit démontrée : chaque chapitre a contribué à la réponse',
      category: 'argument',
      severity: 'important',
      tip: 'La conclusion doit montrer comment les chapitres s\'articulent pour former un tout cohérent — pas un résumé chapitre par chapitre.',
    },
    {
      id: 'VI-ouverture',
      label: 'Ouverture forte : questionnement prospectif, implication à large portée ou citation pertinente',
      category: 'style',
      severity: 'important',
      tip: 'Terminez par une ouverture qui laisse une impression durable. Une simple énumération de perspectives ne suffit pas.',
    },
    {
      id: 'VI-concision',
      label: 'Conclusion suffisamment courte pour être lue indépendamment (≤ 15 pages)',
      category: 'form',
      severity: 'recommended',
      tip: 'Un lecteur pressé qui ne lit que la conclusion doit comprendre l\'essentiel de la thèse. Si elle dépasse 15 pages, c\'est un septième chapitre.',
    },
    {
      id: 'VI-echo-intro',
      label: 'Écho avec l\'introduction : les questions posées trouvent leur résolution',
      category: 'structure',
      severity: 'recommended',
      tip: 'Relisez votre introduction après la conclusion : elles doivent se faire écho, l\'une posant les questions que l\'autre résout.',
    },
  ],
}

// Severity labels for UI display
export const SEVERITY_LABELS: Record<RhetoricalMove['severity'], string> = {
  critical: 'Critique',
  important: 'Important',
  recommended: 'Recommandé',
}

// Severity colors for dot indicators
export const SEVERITY_COLORS: Record<RhetoricalMove['severity'], string> = {
  critical: 'bg-rose-500',
  important: 'bg-amber-500',
  recommended: 'bg-emerald-500',
}
