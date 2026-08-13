// ═════════════════════════════════════════════════════════════════════════════════
// ThesisFrame -- Corpus Conditionnel : Urbanisme et Aménagement du Territoire
// Données structurées dérivées des infographies RB-7 à RB-15 (chronologie de
// l'urbanisme) et des ouvrages de référence (Bertaud, Jacobs, Schenk, Tribillon).
// Reformulé en règles actionnables -- aucune reproduction de texte protégé.
//
// ACTIVATION CONDITIONNELLE : ce corpus n'est utilisé que lorsque le sujet de
// thèse relève de l'urbanisme, l'architecture, la géographie ou l'aménagement.
// ═════════════════════════════════════════════════════════════════════════════════

// ─── Types ──────────────────────────────────────────────────────────────────────────

/** Une ère de l'histoire de l'urbanisme */
interface EreUrbanisme {
  id: string;
  nom: string;
  periode: string;
  auteur?: string;
  ouvrageRef?: string;
  contexteHistorique: string;
  principes: string[];
  apportsMajeurs: string[];
  limitesCritiques: string[];
  imageRef: string;
  motsCles: string[];
}

/** Un cadre théorique d'un auteur majeur */
interface CadreAuteur {
  id: string;
  auteur: string;
  ouvrage: string;
  annee: number;
  principesFondamentaux: string[];
  critiquesFormulees: string[];
  reglesActionnables: string[];
  citationsReformulees: string[];
  pertinenceThese: string[];
}

/** Référence à une image cartographique RB */
interface ReferenceImageRB {
  id: string;
  fichier: string;
  titre: string;
  synthese: string;
  conceptsCles: string[];
  liensAuteurs: string[];
  questionGuidePourThese: string;
}

/** Élément de synthèse transversale */
interface ElementSynthese {
  theme: string;
  erasConcernees: string[];
  constat: string;
  implicationsRecherche: string[];
}

/** Ouvrage de référence identifié (pas encore extrait des RAR) */
interface OuvrageReference {
  id: string;
  titre: string;
  auteur: string;
  annee: number;
  format: string;
  provenance: string;
  pertinenceTopics: string[];
  noteAccessibilite: string;
}

// ─── Chronologie de l'Urbanisme (RB-7 à RB-15) ────────────────────────────────────

const ERAS_URBANISME: EreUrbanisme[] = [
  // ── RB-8 : Cité-Jardin ──
  {
    id: "cite-jardin",
    nom: "Cité-Jardin",
    periode: "1898-1920",
    auteur: "Ebenezer Howard",
    ouvrageRef: "To-Morrow: A Peaceful Path to Real Reform (1898)",
    contexteHistorique:
      "Réaction à la congestion industrielle victorienne et aux conditions de vie insalubres dans les villes britanniques. Mouvement réformiste cherchant à concilier les avantages de la ville et de la campagne.",
    principes: [
      "Fusion ville-campagne : combiner les opportunités économiques urbaines avec la qualité de vie rurale",
      "Plan circulaire concentrique avec zone verte centrale, zones résidentielles en anneau et ceinture agricole",
      "Limitation stricte de la taille urbaine (population plafond pour préserver le caractère de garden city)",
      "Propriété communautaire du foncier pour éviter la spéculation immobilière",
      "Autosuffisance locale : logement, emploi, services et espaces verts intégrés",
      "Connexion entre cités-jardins par des réseaux ferroviaires (Social City)",
    ],
    apportsMajeurs: [
      "Premier modèle de planification urbaine intégrée à l'échelle du quartier",
      "Introduction du concept de ceinture verte (green belt)",
      "Fondation du mouvement des villes nouvelles en Europe (Letchworth 1903, Welwyn 1920)",
      "Ancêtre conceptuel de l'éco-quartier et de la ville durable",
    ],
    limitesCritiques: [
      "Modèle idéalisé difficilement généralisable aux métropoles existantes",
      "Contrôle foncier communautaire jugé utopique dans les économies de marché",
      "Ségrégation fonctionnelle entre zones résidentielles et industrielles",
      "Dimension sociale limitée : conçu pour la classe moyenne britannique",
    ],
    imageRef: "RB-8",
    motsCles: [
      "garden city",
      "ceinture verte",
      "ville-campagne",
      "planification Howard",
      "Letchworth",
      "Welwyn",
    ],
  },

  // ── RB-9 : Planification Moderne ──
  {
    id: "planification-moderne",
    nom: "Planification Moderne",
    periode: "1920-1960",
    auteur: "Le Corbusier (Charles-Édouard Jeanneret)",
    ouvrageRef: "Vers une architecture (1923), La Ville radieuse (1935)",
    contexteHistorique:
      "Après la Première Guerre mondiale, nécessité de reconstruire massivement et de résoudre les problèmes d'insalubrité dans les centres urbains. Essor de l'industrie automobile et de la production en série.",
    principes: [
      "Les 5 points de l'architecture moderne : pilotis, toit-jardin, plan libre, façade libre, fenêtre en bandeau",
      "Zonage fonctionnel strict : séparer habitation, travail, circulation et loisirs (CIAM, Charte d'Athènes 1933)",
      "Ville verticale : immeubles-tours dégagent le sol pour des espaces verts continus",
      "Primauté de la circulation automobile : voies rapides, échangeurs, stationnement",
      "Standardisation et industrialisation de la construction pour l'efficacité",
      "Hygiénisme : soleil, air, verdure comme déterminants du logement sain",
      "Tabula rasa : la reconstruction souvent privilégiée au renouvellement progressif",
    ],
    apportsMajeurs: [
      "Fondation du Mouvement Moderne (CIAM) et de l'architecture internationale",
      "Innovation technique majeure : béton armé, plan libre, nouvelle esthétique",
      "Influence planétaire : de Chandigarh à Brasilia, du Unité d'Habitation à la ville radieuse",
      "Première tentative systématique de théoriser la ville à l'échelle mondiale",
    ],
    limitesCritiques: [
      "Zonage fonctionnel détruit la vitalité urbaine et la mixité sociale (critique de Jane Jacobs)",
      "Ville construite pour l'automobile, hostile au piéton et à l'échelle humaine",
      "Utopie technocratique ignorant les dynamiques sociales et économiques informelles",
      "Grands ensembles et tours isolées ont produit des paysages monotonnes et des ghettos urbains",
      "Déconnexion entre le concepteur et l'usager final de la ville",
    ],
    imageRef: "RB-9",
    motsCles: [
      "Mouvement Moderne",
      "CIAM",
      "Charte d'Athènes",
      "Ville radieuse",
      "zonage fonctionnel",
      "Unité d'Habitation",
    ],
  },

  // ── RB-10 : Planification Compréhensive ──
  {
    id: "planification-comprehensive",
    nom: "Planification Compréhensive",
    periode: "1945-1970",
    auteur: "Patrick Abercrombie (Plan du Grand Londres 1944)",
    ouvrageRef: "County of London Plan (1943), Greater London Plan (1944)",
    contexteHistorique:
      "Reconstruction d'après-guerre en Europe. Les gouvernements investissent massivement dans la planification urbaine à grande échelle. L'État-providence prend en charge l'aménagement du territoire.",
    principes: [
      "Approche systémique : la ville comme organisme complexe nécessitant une vision globale",
      "Planification à long terme (20-30 ans) avec revisites périodiques",
      "Intégration de multiples échelles : régional, urbain, quartier",
      "Maîtrise foncière et outils réglementaires (zonage, plans d'occupation des sols)",
      "Équilibre entre croissance urbaine et préservation des espaces ruraux",
      "Décentralisation vers des villes nouvelles pour décongestionner les métropoles (New Towns Act 1946)",
      "Coordination interinstitutionnelle : transport, logement, industrie, services publics",
    ],
    apportsMajeurs: [
      "Premier modèle de planification urbaine institutionnalisée à l'échelle métropolitaine",
      "Création de 28 New Towns au Royaume-Uni, modèle pour les villes nouvelles françaises",
      "Systématisation des outils de planification : Schéma Directeur, Plan d'Occupation des Sols",
      "Approche multi-scalaire devenue standard dans la planification européenne",
    ],
    limitesCritiques: [
      "Vision top-down peu sensible aux besoins et aspirations des résidents",
      "Rigidité du plan face aux dynamiques économiques et sociales imprévisibles",
      "Déconnexion entre planificateurs et communautés locales",
      "Échec partiel des villes nouvelles : certaines n'ont jamais atteint la taille critique",
      "Négligence des processus informels et de l'économie de la rue",
    ],
    imageRef: "RB-10",
    motsCles: [
      "Grand Londres",
      "Abercrombie",
      "New Towns",
      "plan directeur",
      "déconcentration",
      "villes nouvelles",
    ],
  },

  // ── RB-11 : Planification Plaidoyer ──
  {
    id: "planification-plaidoyer",
    nom: "Planification Plaidoyer et Équité",
    periode: "1960-1980",
    auteur: "Jane Jacobs, Paul Davidoff",
    ouvrageRef:
      "The Death and Life of Great American Cities (Jacobs, 1961), Advocacy and Pluralism in Planning (Davidoff, 1965)",
    contexteHistorique:
      "Contestation des grands ensembles modernistes et des plans d'urbanisme technocratiques. Mouvements des droits civiques aux États-Unis. Émergence de la sociologie urbaine critique.",
    principes: [
      "Vitalité urbaine par la diversité : mixité d'usages, d'âges, de revenus et d'activités",
      "Échelle du piéton : la rue comme espace social fondamental, pas l'autoroute",
      "Usage continu des espaces publics : sécurité par la présence humaine, pas par la surveillance",
      "Vieillissement graduel des bâtiments : source de diversité économique et culturelle",
      "Densité modérée mais soutenue : condition nécessaire (pas suffisante) de la vitalité",
      "Planification plaidoyère (Davidoff) : représenter les intérêts des groupes marginalisés",
      "Participation citoyenne : les résidents doivent avoir voix au chapitre dans les décisions",
      "Planification pluraliste : reconnaître et négocier les valeurs divergentes dans la ville",
    ],
    apportsMajeurs: [
      "Rupture paradigmatique : de la ville fonctionnelle à la ville sociale et vivante",
      "Concepts devenus fondamentaux : mixité fonctionnelle, diversité, vitalité, participation",
      "Légitimation de la contestation citoyenne dans les processus d'aménagement",
      "Influence durable sur le Nouvel Urbanisme et la planification participative contemporaine",
    ],
    limitesCritiques: [
      "Vision parfois romantique de la diversité urbaine spontanée",
      "Critique des grands ensembles sans proposer d'alternative constructive détaillée",
      "Applicabilité limitée aux villes du Sud global avec des dynamiques différentes",
      "Plaidoyer peut devenir politisation excessive au détriment de la faisabilité technique",
    ],
    imageRef: "RB-11",
    motsCles: [
      "Jane Jacobs",
      "Davidoff",
      "diversité urbaine",
      "participation citoyenne",
      "mixité fonctionnelle",
      "vitalité",
    ],
  },

  // ── RB-12 : Nouvel Urbanisme ──
  {
    id: "nouvel-urbanisme",
    nom: "Nouvel Urbanisme",
    periode: "1980-présent",
    auteur: "Andres Duany, Elizabeth Plater-Zyberk, Peter Calthorpe, Leon Krier",
    ouvrageRef: "The New Urbanism: Toward an Architecture of Community (Katz, 1994)",
    contexteHistorique:
      "Réaction contre l'étalement urbain (sprawl) américain et la dépendance automobile. Crise des centres-villes et des banlieues monofonctionnelles. Recherche de modes de vie plus durables et communautaires.",
    principes: [
      "Marchabilité (walkability) : rues à échelle piétonne avec trottoirs, arbres, façades actives",
      "Connectivité : réseau de rues interconnectées (grille modifiée), pas de culs-de-sac",
      "Mixité : logement, commerces, bureaux et espaces publics dans chaque quartier",
      "Densité modérée : suffisante pour soutenir le transport en commun et les commerces de proximité",
      "Architecture contextuelle : bâtiments qui définissent l'espace public, pas des objets isolés",
      "Espace public de qualité : places, parcs, rues comme lieux de vie et de rencontre",
      "Transport en commun et modes doux prioritaires sur la voiture individuelle",
      "Gestion de la croissance : limites urbaines et développement compact (smart growth)",
    ],
    apportsMajeurs: [
      "Charte du Nouvel Urbanisme (1996) devenue référence mondiale en design urbain",
      "Projets phares : Seaside (FL), Poundbury (UK), Portishead (UK)",
      "Réhabilitation de principes pré-modernes (rue traditionnelle, quartier complet)",
      "Influence sur les politiques de croissance intelligente (smart growth) aux États-Unis",
    ],
    limitesCritiques: [
      "Risque de pastiche néo-traditionnel déconnecté des réalités contemporaines",
      "Implémentation souvent limitée à des projets neufs de taille réduite",
      "Dimension sociale parfois évacuée au profit de l'esthétique urbaine",
      "Difficulté à s'adapter aux métropoles existantes de grande taille",
      "Critique de néo-libéralisme urbain : gentrification déguisée en qualité de vie",
    ],
    imageRef: "RB-12",
    motsCles: [
      "New Urbanism",
      "smart growth",
      "walkability",
      "TOD",
      "Seaside",
      "mixité",
      "densité",
    ],
  },

  // ── RB-13 : Planification Durable ──
  {
    id: "planification-durable",
    nom: "Planification Durable",
    periode: "1990-présent",
    auteur: "Timothy Beatley, Herbert Girardet, Richard Rogers",
    ouvrageRef:
      "Green Urbanism: Learning from European Cities (Beatley, 2000), Cities for a Small Planet (Rogers, 1997)",
    contexteHistorique:
      "Sommet de la Terre de Rio (1992) et emergence du développement durable comme paradigme global. Prise de conscience du changement climatique et de l'empreinte écologique urbaine.",
    principes: [
      "Triple bilan : équilibrer dimensions environnementale, sociale et économique (3 piliers)",
      "Réduction de l'empreinte carbone : éco-construction, énergie renouvelable, mobilité décarbonée",
      "Économie circulaire urbaine : gestion des déchets, recyclage, métabolisme urbain",
      "Résilience climatique : adaptation aux risques naturels, îlots de chaleur, inondations",
      "Biodiversité urbaine : trames vertes, corridors écologiques, parcs et jardins",
      "Justice environnementale : équité dans l'accès aux espaces verts et aux aménités",
      "Gouvernance participative : Agenda 21 local, coopération public-privé-citoyen",
      "Évaluation environnementale : bilan carbone, analyse du cycle de vie, indicateurs durables",
    ],
    apportsMajeurs: [
      "Intégration de la durabilité comme obligation légale dans les plans d'urbanisme (SDAGE, SCOT, PLU en France)",
      "Émergence des éco-quartiers comme laboratoires (Vauban-Fribourg, Hammarby-Stockholm, BedZED-Londres)",
      "Métriques de durabilité urbaine : empreinte écologique, bilan carbone, indicateurs ADEME",
      "Cadre international : Objectifs de Développement Durable 11 (villes durables)",
    ],
    limitesCritiques: [
      "Risque d'éco-gentrification : les aménités vertes font monter les prix immobiliers",
      "Greenwashing : projets labellisés durables sans transformation structurelle réelle",
      "Tension entre croissance urbaine et limites planétaires difficilement résoluble",
      "Complexité de la mise en oeuvre : nécessite coordination intersectorielle massive",
      "Approche parfois technocratique qui marginalise les savoirs locaux et autochtones",
    ],
    imageRef: "RB-13",
    motsCles: [
      "développement durable",
      "éco-quartier",
      "résilience",
      "biodiversité urbaine",
      "économie circulaire",
      "ODD 11",
    ],
  },

  // ── RB-14 : Ville Intelligente ──
  {
    id: "ville-intelligente",
    nom: "Ville Intelligente (Smart City)",
    periode: "2000-présent",
    auteur: "Anthony Townsend, Saskia Sassen",
    ouvrageRef: "Smart Cities: Big Data, Civic Hackers, and the Quest for a New Utopia (Townsend, 2013)",
    contexteHistorique:
      "Explosion des données numériques, Internet des objets (IoT) et intelligence artificielle. Les technologies offrent de nouvelles capacités de gestion urbaine en temps réel. Concurrence entre villes pour attirer les entreprises tech.",
    principes: [
      "Données comme infrastructure : capteurs, IoT, open data pour la connaissance urbaine en temps réel",
      "Gestion optimisée : transport intelligent, énergie smart grid, gestion de l'eau et des déchets",
      "Services numériques aux citoyens : e-administration, applications de mobilité, participation en ligne",
      "Innovation ouverte : living labs, hackathons civiques, co-création technologique avec les usagers",
      "Mobilité connectée : VTC, vélos en libre-service, information voyageur multimodale",
      "Modélisation prédictive : simulation urbaine, jumeaux numériques (digital twins), IA décisionnelle",
      "Infrastructure 5G et connectivité omniprésente comme prérequis technique",
    ],
    apportsMajeurs: [
      "Outils d'analyse inédits : jumeaux numériques, modélisation urbaine, données massives",
      "Optimisation des services publics : éclairage adaptatif, flux de circulation, gestion énergétique",
      "Nouvelles formes de participation citoyenne via les plateformes numériques",
      "Projets pionniers : Songdo (Corée), Barcelona Smart City, Singapore Smart Nation",
    ],
    limitesCritiques: [
      "Technosolutionnisme : croire que la technologie seule résout les problèmes urbains sociaux",
      "Surveillance numérique : risques pour la vie privée et le contrôle social",
      "Fracture numérique : exclusion des populations non connectées ou non alphabétisées numériquement",
      "Dépendance aux entreprises privées de la tech (GAFAM) pour l'infrastructure publique",
      "Ville aseptisée et corporate : les smart districts négligent souvent la diversité sociale et culturelle",
      "Vulnérabilité cybernétique : les villes hyperconnectées sont des cibles pour les attaques",
    ],
    imageRef: "RB-14",
    motsCles: [
      "smart city",
      "IoT",
      "open data",
      "jumeau numérique",
      "living lab",
      "mobilité intelligente",
    ],
  },
];

// ─── Synthèse Transversale (RB-15) ─────────────────────────────────────────────────

const SYNTHESE_URBANISME: ElementSynthese[] = [
  {
    theme: "Tension entre top-down et bottom-up",
    erasConcernees: [
      "planification-comprehensive",
      "planification-plaidoyer",
      "ville-intelligente",
    ],
    constat:
      "L'histoire de l'urbanisme oscille entre des approches technocratiques (top-down : Le Corbusier, Abercrombie, Smart City) et des approches participatives (bottom-up : Jacobs, Nouvel Urbanisme, planification durable). Aucune n'a résolu seule les défis urbains contemporains.",
    implicationsRecherche: [
      "Analyser les mécanismes de gouvernance hybrides combinant expertise technique et participation citoyenne",
      "Comparer l'efficacité des approches top-down vs bottom-up sur des indicateurs mesurables",
      "Étudier les conditions dans lesquelles la participation citoyenne produit des résultats tangibles",
    ],
  },
  {
    theme: "Densité et forme urbaine",
    erasConcernees: [
      "cite-jardin",
      "planification-moderne",
      "nouvel-urbanisme",
      "planification-durable",
    ],
    constat:
      "La densité est un paramètre central mais controversé. Howard la fuit (cité-jardin), Le Corbusier la concentre (tours), le Nouvel Urbanisme la modère, et la planification durable la réclame pour réduire l'empreinte carbone. La densité optimale dépend du contexte social, culturel et climatique.",
    implicationsRecherche: [
      "Définir les seuils de densité optimaux selon les contextes socio-culturels et climatiques",
      "Mesurer l'impact de différentes formes urbaines sur les émissions de GES et la qualité de vie",
      "Analyser comment la densité interagit avec la mixité fonctionnelle pour produire de la vitalité",
    ],
  },
  {
    theme: "Mobilité et échelle humaine",
    erasConcernees: [
      "planification-moderne",
      "planification-plaidoyer",
      "nouvel-urbanisme",
      "ville-intelligente",
    ],
    constat:
      "Le passage de la ville-piéton (Jacobs) à la ville-automobile (Le Corbusier) puis au retour vers la mobilité douce et connectée illustre une recherche permanente de l'échelle humaine dans un contexte technologique changeant.",
    implicationsRecherche: [
      "Évaluer l'impact des infrastructures de mobilité sur la cohésion sociale locale",
      "Comparer les modèles de mobilité intelligente selon leur accessibilité pour les populations vulnérables",
      "Analyser les effets de la transition numérique sur les pratiques de déplacement quotidiennes",
    ],
  },
  {
    theme: "Durabilité vs croissance",
    erasConcernees: [
      "planification-durable",
      "ville-intelligente",
      "nouvel-urbanisme",
    ],
    constat:
      "Les modèles récents (ville durable, smart city, nouvel urbanisme) cherchent tous à concilier croissance urbaine et limites environnementales, mais sans résoudre la tension fondamentale entre développement économique et empreinte écologique.",
    implicationsRecherche: [
      "Modéliser les trajectoires de développement urbain compatibles avec les limites planétaires",
      "Analyser les mécanismes de décroissance urbaine ou de degrowth appliqués à l'aménagement",
      "Comparer les indicateurs de durabilité utilisés dans les différents modèles de ville",
    ],
  },
  {
    theme: "Justice spatiale et équité",
    erasConcernees: [
      "planification-plaidoyer",
      "planification-durable",
      "ville-intelligente",
    ],
    constat:
      "Chaque époque produit de nouvelles formes d'inégalité spatiale : ségrégation par les grands ensembles (moderne), gentrification par les éco-quartiers (durable), fracture numérique par la smart city (intelligente). La question de l'équité traverse toute l'histoire de l'urbanisme.",
    implicationsRecherche: [
      "Identifier les mécanismes par lesquels les projets d'aménagement reproduisent les inégalités",
      "Développer des indicateurs d'équité spatiale intégrés aux outils de planification",
      "Analyser les stratégies de résistance et d'appropriation des populations marginalisées",
    ],
  },
];

// ─── Cadres Théoriques d'Auteurs Majeurs ───────────────────────────────────────────

const CADRES_AUTEURS: CadreAuteur[] = [
  {
    id: "bertaud-order-without-design",
    auteur: "Alain Bertaud",
    ouvrage: "Order without Design: How Markets Shape Cities",
    annee: 2018,
    principesFondamentaux: [
      "Le marché immobilier est le principal ordonnateur de la structure urbaine, pas le planificateur",
      "La densité résulte de l'interaction entre prix du foncier, revenus des ménages et préférences résidentielles",
      "La réglementation foncière (zonage, limites de hauteur, coefficients d'occupation) a des effets pervers mesurables",
      "Les villes les plus performantes économiquement sont celles où le marché foncier est le plus fluide",
      "Le transport en commun est efficace uniquement là où la densité le justifie (densité seuil)",
      "La taille urbaine optimale n'existe pas : les avantages de l'agglomération compensent les déséconomies",
    ],
    critiquesFormulees: [
      "La planification réglementaire (zonage strict) réduit l'offre de logement et fait exploser les prix",
      "Les plans directeurs se trompent systématiquement sur la demande future de logements et d'emplois",
      "La ceinture verte britannique a produit un étalement urbain paradoxal au-delà de la ceinture",
      "Le New Urbanisme impose une morphologie urbaine qui ne correspond pas toujours aux préférences réelles",
    ],
    reglesActionnables: [
      "Règle 1 -- REGLEMENTATION : avant de proposer une réglementation foncière, analyser ses effets pervers potentiels sur le prix du logement et la mobilité",
      "Règle 2 -- DENSITE : distinguer la densité de peuplement (hab/ha) de la densité d'emploi (emplois/ha) et la densité de construction (m2 de plancher/ha) -- chacune a des implications différentes",
      "Règle 3 -- TRANSPORT : le choix du mode de transport dépend de la densité résidentielle ET de la densité d'emploi -- les deux doivent être analysées conjointement",
      "Règle 4 -- TAILLE : ne pas présupposer une taille urbaine optimale -- les externalités d'agglomération croissent avec la taille jusqu'à un point qui varie selon le contexte",
      "Règle 5 -- MARCHE : utiliser les prix immobiliers comme indicateurs de la rareté foncière et de l'efficacité de la réglementation",
      "Règle 6 -- FORME : la forme urbaine organique (non planifiée) n'est ni chaotique ni inefficace -- elle résulte de millions de décisions individuelles optimisantes",
    ],
    citationsReformulees: [
      "La ville est le résultat de l'interaction entre le marché du travail, le marché foncier et le marché immobilier -- pas du plan d'urbanisme",
      "Un bon urbanisme ne crée pas l'ordre -- il crée les conditions pour que l'ordre émerge spontanément",
      "La réglementation qui ignore les forces du marché ne les supprime pas -- elle les déplace et les amplifie",
    ],
    pertinenceThese: [
      "Thèse sur la réglementation foncière et le prix du logement",
      "Thèse sur les effets du zonage sur la ségrégation spatiale",
      "Thèse sur la relation entre transport en commun et densité urbaine",
      "Thèse sur l'étalement urbain et les politiques de croissance",
      "Thèse comparative sur les modèles de planification dans différents pays",
    ],
  },
  {
    id: "jacobs-death-and-life",
    auteur: "Jane Jacobs",
    ouvrage: "The Death and Life of Great American Cities",
    annee: 1961,
    principesFondamentaux: [
      "La diversité d'usages est la condition première de la vitalité urbaine",
      "Les quartiers doivent mélanger résidence, commerce, industrie et loisir",
      "Les rues doivent être sûres par la présence humaine, pas par la séparation fonctionnelle",
      "Les blocs urbains courts favorisent la circulation piétonne et la diversité",
      "Les bâtiments de tous âges coexistent pour offrir une gamme de prix et d'usages",
      "La concentration de population est nécessaire mais pas suffisante pour la vitalité",
      "Les usagers de la rue sont les premiers garants de l'ordre public",
    ],
    critiquesFormulees: [
      "La planification moderne a détruit les quartiers vivants en les remplaçant par des zones monofonctionnelles",
      "Les cités-jardins et les villes nouvelles sont des utopies qui ignorent la complexité urbaine réelle",
      "Les autoroutes urbaines sont des barrières de mort qui détruisent les quartiers qu'elles traversent",
      "Les grands ensembles de logements sociaux produisent de la ségrégation et du déclin",
      "Les planificateurs confondent l'ordre visuel avec l'ordre social -- une ville en désordre peut être socialement saine",
    ],
    reglesActionnables: [
      "Règle 1 -- MIXITE : évaluer tout projet d'aménagement selon sa capacité à maintenir ou créer une mixité d'usages (au moins 3 types d'activités primaires dans un rayon de 400m)",
      "Règle 2 -- BLOCS COURTS : privilégier des blocs urbains de moins de 200m de côté pour maximiser les itinéraires piétons et la perméabilité",
      "Règle 3 -- VIEUX BATIMENTS : préserver une proportion significative de bâtiments anciens (au moins 30-40% du parc) pour maintenir la diversité économique",
      "Règle 4 -- CONCENTRATION : viser une densité résidentielle suffisante pour soutenir les commerces et services de proximité (seuil indicatif : 100 hab/ha minimum)",
      "Règle 5 -- FRONTIERE ACTIVE : concevoir les rez-de-chaussée avec des façades ouvertes sur la rue (commerces, entrées, vitrines) pour générer de la surveillance naturelle",
      "Règle 6 -- AUTONOMIE DE QUARTIER : chaque quartier devrait offrir les services de base (épiceries, écoles, parcs) à distance de marche (< 500m)",
    ],
    citationsReformulees: [
      "Les villes ont la capacité de fournir quelque chose pour tout le monde, précisément parce que chacun est différent des autres",
      "La sécurité des rues est assurée par un réseau complexe de surveillance mutuelle, pas par la police seule",
      "Sous le semblant de désordre d'une rue vivante se cache un ordre social complexe et résilient",
    ],
    pertinenceThese: [
      "Thèse sur la vitalité urbaine et les indicateurs de qualité de vie",
      "Thèse sur la mixité fonctionnelle et ses effets sur la cohésion sociale",
      "Thèse sur les marchés de rue et l'économie informelle",
      "Thèse sur la rénovation urbaine et la préservation du tissu social existant",
      "Thèse sur la sécurité urbaine et l'aménagement de l'espace public",
    ],
  },
  {
    id: "schenk-designing-cities",
    auteur: "Leonhard Schenk",
    ouvrage: "Designing Cities: Basics, Principles and Projects",
    annee: 2019,
    principesFondamentaux: [
      "Le design urbain opère à l'échelle intermédiaire entre l'architecture (bâtiment) et la planification (ville)",
      "L'espace public est le produit du bâtiment, pas le vide entre les bâtiments",
      "La typologie morphologique (rue, place, boulevard, passage) est un vocabulaire de conception",
      "Le design urbain doit intégrer les dimensions historiques, sociales, économiques et environnementales",
      "Les projets urbains doivent être évalués à l'aune de leur performance globale, pas esthétique seule",
    ],
    critiquesFormulees: [
      "Le design urbain contemporain souffre d'une déconnexion entre la formation des architectes et les réalités de la ville",
      "Les concours d'urbanisme privilégient trop souvent l'innovation formelle au détriment de la durabilité sociale",
      "La standardisation internationale du design urbain (starchitects) efface les spécificités locales",
    ],
    reglesActionnables: [
      "Règle 1 -- ECHELLE : toujours situer le projet dans son contexte morphologique immédiat et à l'échelle de la ville",
      "Règle 2 -- TYPOLOGIE : choisir les types spatiaux (rue, place, parc) en fonction des usages projetés et de l'histoire du site",
      "Règle 3 -- PERFORMANCE : évaluer le projet selon des critères multiples (social, environnemental, économique, esthétique)",
      "Règle 4 -- PARTICIPATION : intégrer les usagers dans le processus de conception dès les phases exploratoires",
    ],
    citationsReformulees: [
      "L'espace public de qualité est le meilleur investissement qu'une ville puisse faire pour sa cohésion sociale",
      "Concevoir la ville, c'est d'abord comprendre comment les gens l'utilisent au quotidien",
    ],
    pertinenceThese: [
      "Thèse sur le design urbain et la qualité de l'espace public",
      "Thèse sur la morphologie urbaine et les typologies spatiales",
      "Thèse sur les processus de conception participative en urbanisme",
    ],
  },
  {
    id: "tribillon-l-urbanisme",
    auteur: "Jean Tribillon",
    ouvrage: "L'urbanisme",
    annee: 1991,
    principesFondamentaux: [
      "L'urbanisme est une discipline carrefour qui articule architecture, géographie, sociologie, économie et droit",
      "La planification urbaine française s'inscrit dans une tradition centralisée et réglementaire (POS puis PLU)",
      "La décentralisation (lois Defferre 1982-1983) a transféré la compétence urbanisme aux communes et intercommunalités",
      "Les outils de planification (SDAU, POS, PLU, SCOT) forment un système hiérarchisé de normes spatiales",
      "La notion de paysage urbain englobe le bâti, l'espace public et les usages qui s'y déploient",
    ],
    critiquesFormulees: [
      "La complexité du système normatif français (PLU, SCOT, DSF) peut paralyser l'initiative locale",
      "La décentralisation a creusé les inégalités entre communes riches et communes pauvres",
      "L'urbanisme réglementaire français reste trop centré sur le droit de construire et pas assez sur la qualité de vie",
    ],
    reglesActionnables: [
      "Règle 1 -- CONTEXTE FRANCAIS : analyser tout projet urbain français à travers le prisme de la hiérarchie des normes (SCOT > PLU > règlement)",
      "Règle 2 -- DECENTRALISATION : évaluer les capacités réelles des collectivités locales à mener une politique d'urbanisme ambitieuse",
      "Règle 3 -- INTERDISCIPLINARITE : mobiliser les disciplines connexes (droit, économie, sociologie) pour enrichir l'analyse urbaine",
    ],
    citationsReformulees: [
      "L'urbanisme n'est ni un art ni une science -- c'est une pratique sociale qui engage la collectivité tout entière",
      "La ville se lit dans ses lois autant que dans ses pierres",
    ],
    pertinenceThese: [
      "Thèse sur le droit de l'urbanisme et les outils de planification français",
      "Thèse sur la décentralisation et la gouvernance locale de l'aménagement",
      "Thèse sur l'histoire de l'urbanisme en France",
    ],
  },
];

// ─── Références aux Images Cartographiques RB ──────────────────────────────────────

const IMAGES_CARTOGRAPHIQUES: ReferenceImageRB[] = [
  {
    id: "rb-7",
    fichier: "RB-7.jpg",
    titre: "Vue d'ensemble : Chronologie de l'urbanisme",
    synthese:
      "Panorama des grandes étapes de l'histoire de la planification urbaine, de la Cité-Jardin (1898) à la Ville Intelligente (2000+). Met en évidence les ruptures paradigmatiques et les filiations intellectuelles entre les différentes écoles.",
    conceptsCles: [
      "chronologie",
      "paradigmes urbains",
      "ruptures épistémologiques",
      "filiations intellectuelles",
    ],
    liensAuteurs: ["Howard", "Le Corbusier", "Abercrombie", "Jacobs"],
    questionGuidePourThese:
      "Quelle époque de la planification urbaine est la plus pertinente pour analyser mon terrain d'étude ? Quels paradigmes s'y confrontent ?",
  },
  {
    id: "rb-8",
    fichier: "RB-8.jpg",
    titre: "L'approche Cité-Jardin (1898)",
    synthese:
      "Le modèle d'Ebenezer Howard de ville autonome combinant avantages urbains et ruraux. Plan circulaire, ceinture verte, propriété communautaire du foncier. Ancêtre des éco-quartiers et des villes nouvelles.",
    conceptsCles: [
      "plan circulaire",
      "ceinture verte",
      "propriété communautaire",
      "ville-campagne",
    ],
    liensAuteurs: ["Howard", "Osborn"],
    questionGuidePourThese:
      "Comment le modèle de la cité-jardin influence-t-il encore les politiques actuelles de ceintures vertes et de villes nouvelles ?",
  },
  {
    id: "rb-9",
    fichier: "RB-9.jpg",
    titre: "La planification moderniste (Le Corbusier)",
    synthese:
      "La vision de Le Corbusier de la ville fonctionnelle, zonée et verticale. Les 5 points de l'architecture moderne, la Charte d'Athènes (1933), la primauté de la circulation automobile. Un modèle qui a façonné les villes du XXe siècle mais fortement critiqué par la suite.",
    conceptsCles: [
      "zonage fonctionnel",
      "Ville radieuse",
      "Charte d'Athènes",
      "5 points",
      "ville verticale",
    ],
    liensAuteurs: ["Le Corbusier", "CIAM"],
    questionGuidePourThese:
      "Quels héritages du modernisme subsistent dans la morphologie urbaine actuelle de mon terrain d'étude ? Comment sont-ils questionnés aujourd'hui ?",
  },
  {
    id: "rb-10",
    fichier: "RB-10.jpg",
    titre: "La planification compréhensive (Plan du Grand Londres)",
    synthese:
      "Le modèle de planification à grande échelle d'Abercrombie pour la reconstruction de Londres. Approche systémique intégrant transport, logement, ceinture verte et villes nouvelles. Planification multi-scalaire devenue référence européenne.",
    conceptsCles: [
      "Grand Londres",
      "New Towns",
      "plan directeur",
      "déconcentration",
      "multi-scalaire",
    ],
    liensAuteurs: ["Abercrombie", "Forshaw"],
    questionGuidePourThese:
      "Comment le modèle de planification compréhensive s'adapte-t-il aux contextes urbains contemporains caractérisés par l'incertitude et la rapidité du changement ?",
  },
  {
    id: "rb-11",
    fichier: "RB-11.jpg",
    titre: "Planification plaidoyer et équité (Jane Jacobs)",
    synthese:
      "La révolution conceptuelle de Jane Jacobs : la ville doit être diverse, piétonne, dense et mixte. Critique radicale du modernisme. Paul Davidoff complète avec la planification plaidoyère au service des groupes marginalisés.",
    conceptsCles: [
      "diversité urbaine",
      "mixité fonctionnelle",
      "échelle piétonne",
      "plaidoyer",
      "participation",
    ],
    liensAuteurs: ["Jacobs", "Davidoff", "Gans"],
    questionGuidePourThese:
      "Dans quelle mesure les principes de Jane Jacobs sont-ils opérationnalisables dans les villes du Sud global ou dans les contextes post-coloniaux ?",
  },
  {
    id: "rb-12",
    fichier: "RB-12.jpg",
    titre: "Le Nouvel Urbanisme (1980-présent)",
    synthese:
      "Le retour aux principes urbains traditionnels : rues piétonnes, quartiers complets, architecture de rue, connectivité. Le Nouvel Urbanisme cherche à reconstruire la ville sur l'échelle humaine après les excès du modernisme.",
    conceptsCles: [
      "walkability",
      "quartier complet",
      "connectivité",
      "TOD",
      "smart growth",
    ],
    liensAuteurs: ["Duany", "Plater-Zyberk", "Calthorpe", "Krier"],
    questionGuidePourThese:
      "Le Nouvel Urbanisme est-il un retour en arrière nostalgique ou une véritable innovation pour les villes contemporaines ?",
  },
  {
    id: "rb-13",
    fichier: "RB-13.jpg",
    titre: "La planification durable",
    synthese:
      "L'intégration des impératifs environnementaux dans la planification urbaine : éco-quartiers, résilience climatique, biodiversité, économie circulaire. La durabilité comme paradigme obligatoire de l'aménagement contemporain.",
    conceptsCles: [
      "éco-quartier",
      "résilience",
      "triple bilan",
      "ODD 11",
      "économie circulaire",
    ],
    liensAuteurs: ["Beatley", "Girardet", "Rogers"],
    questionGuidePourThese:
      "Comment mesurer la durabilité réelle d'un projet urbain au-delà des labels et du greenwashing ? Quels indicateurs sont les plus pertinents ?",
  },
  {
    id: "rb-14",
    fichier: "RB-14.jpg",
    titre: "L'approche Ville Intelligente (Smart City)",
    synthese:
      "La ville pilotée par les données : IoT, open data, jumeaux numériques, IA. Les promesses d'optimisation et de participation numérique face aux risques de surveillance, de fracture numérique et de dépendance technologique.",
    conceptsCles: [
      "IoT",
      "open data",
      "jumeau numérique",
      "gouvernance algorithmique",
      "participation numérique",
    ],
    liensAuteurs: ["Townsend", "Sassen", "Kitchin"],
    questionGuidePourThese:
      "La smart city améliore-t-elle réellement la qualité de vie de tous les citadins, ou renforce-t-elle les inégalités existantes ?",
  },
  {
    id: "rb-15",
    fichier: "RB-15.jpg",
    titre: "Synthèse : Rassembler les approches",
    synthese:
      "Carte de synthèse montrant comment les différentes approches de la planification urbaine peuvent se compléter. Aucun paradigme unique ne suffit : la ville contemporaine nécessite une combinaison de principes tirés de chaque école. La planification urbaine du XXIe siècle doit être intégrative, adaptative et équitable.",
    conceptsCles: [
      "approche intégrative",
      "planification adaptative",
      "équité",
      "résilience",
      "gouvernance hybride",
    ],
    liensAuteurs: ["Bertaud", "Jacobs", "Beatley", "Townsend"],
    questionGuidePourThese:
      "Comment articuler les différents paradigmes de la planification urbaine dans un cadre analytique cohérent pour ma thèse ?",
  },
];

// ─── Fonction d'Activation Conditionnelle ──────────────────────────────────────────

/**
 * Détermine si le corpus urbanisme est pertinent pour une discipline donnée.
 * Ce corpus est CONDITIONNEL -- il ne doit être activé que lorsque le sujet de
 * thèse relève de l'urbanisme, l'architecture, la géographie ou l'aménagement.
 *
 * @param discipline - La discipline ou le sujet de la thèse (en français ou anglais)
 * @returns true si le corpus urbanisme devrait être activé
 */
export function isUrbanismRelevant(discipline: string): boolean {
  const normalized = discipline.toLowerCase().trim();

  const keywordsFr: string[] = [
    "urbanisme",
    "aménagement",
    "aménagement du territoire",
    "urbanisation",
    "ville",
    "villes",
    "cité",
    "cités",
    "quartier",
    "architecture",
    "architecturale",
    "géographie",
    "géographe",
    "paysage",
    "paysagisme",
    "habitat",
    "logement",
    "mobilité",
    "transport urbain",
    "espace public",
    "espace urbain",
    "morphologie urbaine",
    "planification",
    "planificateur",
    "développement durable urbain",
    "smart city",
    "ville intelligente",
    "éco-quartier",
    "écoquartier",
    "nouvel urbanisme",
    "renouvellement urbain",
    "rénovation urbaine",
    "extension urbaine",
    "étalement urbain",
    "densité urbaine",
    "ségrégation spatiale",
    "justice spatiale",
    "gentrification",
    "patrimoine urbain",
    "foncier",
    "droit de l'urbanisme",
    "scot",
    "plu",
  ];

  const keywordsEn: string[] = [
    "urban planning",
    "urbanism",
    "city planning",
    "town planning",
    "urban design",
    "urban development",
    "urban studies",
    "urban geography",
    "urban sociology",
    "landscape architecture",
    "land use",
    "land use planning",
    "zoning",
    "smart city",
    "sustainable city",
    "sustainable urban",
    "new urbanism",
    "urban renewal",
    "urban sprawl",
    "urban density",
    "public space",
    "urban form",
    "urban morphology",
    "housing",
    "built environment",
    "city",
    "cities",
    "urban",
    "metropolitan",
    "suburban",
    "neighborhood",
    "neighbourhood",
    "walkability",
    "transit-oriented",
    "mixed-use",
    "garden city",
    "urban resilience",
    "spatial justice",
    "gentrification",
    "urban policy",
    "regional planning",
  ];

  const allKeywords = [...keywordsFr, ...keywordsEn];

  return allKeywords.some((keyword) => normalized.includes(keyword));
}

// ─── Ouvrages de Référence (livres identifiés, non extraits) ────────────────────────

const OUVRAGES_REFERENCE: OuvrageReference[] = [
  {
    id: "bertaud-2018",
    titre: "Order without Design: How Markets Shape Cities",
    auteur: "Alain Bertaud",
    annee: 2018,
    format: "EPUB (dans .1.rar)",
    provenance: "Google Drive -- Ressources utilisateur",
    pertinenceTopics: [
      "marché foncier",
      "densité urbaine",
      "réglementation",
      "transport",
      "zonage",
    ],
    noteAccessibilite:
      "Archivé dans RAR -- extraction nécessaire. Ouvrage majeur sur les fondements économiques de la forme urbaine.",
  },
  {
    id: "tribillon-1991",
    titre: "L'urbanisme",
    auteur: "Jean Tribillon",
    annee: 1991,
    format: "PDF (dans .3.rar)",
    provenance: "Google Drive -- Ressources utilisateur",
    pertinenceTopics: [
      "histoire de l'urbanisme",
      "droit de l'urbanisme",
      "planification française",
      "décentralisation",
    ],
    noteAccessibilite:
      "Archivé dans RAR -- extraction nécessaire. Introduction synthétique à la discipline et à ses outils juridiques.",
  },
  {
    id: "nouveaux-principes",
    titre: "Nouveaux Principes de l'urbanisme",
    auteur: "Collectif",
    annee: 0,
    format: "PDF (dans .3.rar)",
    provenance: "Google Drive -- Ressources utilisateur",
    pertinenceTopics: [
      "principes urbanistiques",
      "renouvellement de la discipline",
      "théorie urbaine",
    ],
    noteAccessibilite:
      "Archivé dans RAR -- extraction nécessaire. Ouvrage collectif sur l'évolution des principes de la planification.",
  },
  {
    id: "renouveler-amenagement",
    titre: "Renouveler l'aménagement",
    auteur: "Collectif",
    annee: 0,
    format: "PDF (dans .4.rar)",
    provenance: "Google Drive -- Ressources utilisateur",
    pertinenceTopics: [
      "aménagement du territoire",
      "renouvellement urbain",
      "politiques publiques",
    ],
    noteAccessibilite:
      "Archivé dans RAR -- extraction nécessaire. Ouvrage sur les nouvelles approches de l'aménagement territorial.",
  },
  {
    id: "schenk-2019",
    titre: "Designing Cities: Basics, Principles and Projects",
    auteur: "Leonhard Schenk",
    annee: 2019,
    format: "PDF",
    provenance: "Google Drive -- Livres/ressources/",
    pertinenceTopics: [
      "design urbain",
      "espace public",
      "morphologie",
      "projets urbains",
    ],
    noteAccessibilite:
      "Sur Google Drive (non extrait). Guide pratique du design urbain avec études de cas internationales.",
  },
  {
    id: "fuller-moore-jacobs",
    titre: "An Analysis of Jane Jacobs' Urban Ideas",
    auteur: "Fuller, Moore",
    annee: 0,
    format: "PDF",
    provenance: "Google Drive -- Livres/",
    pertinenceTopics: [
      "Jane Jacobs",
      "diversité urbaine",
      "vitalité",
      "critique moderniste",
    ],
    noteAccessibilite:
      "Sur Google Drive (non extrait). Analyse académique des idées de Jane Jacobs et de leur pertinence contemporaine.",
  },
];

// ─── Export Unifié ──────────────────────────────────────────────────────────────────

export const URBANISM_CORPUS = {
  /**
   * Drapeau d'activation conditionnelle.
   * Ce corpus ne doit être utilisé que si isUrbanismRelevant() retourne true.
   */
  enabled: false as boolean,

  /** Fonction pour vérifier si le corpus est pertinent */
  isRelevant: isUrbanismRelevant,

  /** Les 7 ères de l'histoire de l'urbanisme (RB-7 à RB-15) */
  chronologieUrbanisme: {
    eras: ERAS_URBANISME,
    synthese: SYNTHESE_URBANISME,
  },

  /** Cadres théoriques des auteurs majeurs */
  cadresTheoriques: {
    bertaud: CADRES_AUTEURS[0],
    jacobs: CADRES_AUTEURS[1],
    schenk: CADRES_AUTEURS[2],
    tribillon: CADRES_AUTEURS[3],
    /** Tous les cadres auteurs en tableau */
    tous: CADRES_AUTEURS,
  },

  /** Références aux images RB-7 à RB-15 */
  imagesCartographiques: IMAGES_CARTOGRAPHIQUES,

  /** Ouvrages de référence identifiés (pas encore extraits des RAR) */
  ouvrages: OUVRAGES_REFERENCE,

  /** Nombre total d'ères couvertes */
  nombreEras: ERAS_URBANISME.length,

  /** Nombre de cadres théoriques */
  nombreCadres: CADRES_AUTEURS.length,

  /** Nombre d'images référencées */
  nombreImages: IMAGES_CARTOGRAPHIQUES.length,

  /** Nombre d'ouvrages de référence */
  nombreOuvrages: OUVRAGES_REFERENCE.length,
} as const;

// ─── Ré-export des types pour usage externe ─────────────────────────────────────────

export type {
  EreUrbanisme,
  CadreAuteur,
  ReferenceImageRB,
  ElementSynthese,
  OuvrageReference,
};
