/**
 * ThesisFrame — OSM Infrastructure Explorer Library
 * Inspired by https://github.com/ni5arga/sightline
 *
 * Provides 150+ OSM asset types, Overpass QL query builder,
 * NLP query parser, and Nominatim geocoder.
 */

/* ═══════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════ */

export interface AssetTypeDef {
  osmTags: Record<string, string | string[]>;
  label: string;
  category: string;
}

export interface InfraCategory {
  id: string;
  label: string;
  icon: string;
  types: string[];
}

export interface InfraResult {
  id: number;
  name: string;
  type: string;
  operator: string;
  lat: number;
  lon: number;
  tags: Record<string, string>;
}

export interface ParsedQuery {
  type: string | null;
  location: string | null;
  radius: number;
  raw: string;
}

/* ═══════════════════════════════════════════════════════════════
   150+ Asset Types
   ═══════════════════════════════════════════════════════════════ */

export const ASSET_TYPE_MAP: Record<string, AssetTypeDef> = {
  /* ── Énergie ── */
  power_plant: {
    osmTags: { power: "plant" },
    label: "Centrale électrique",
    category: "Énergie",
  },
  power_substation: {
    osmTags: { power: "substation" },
    label: "Poste électrique",
    category: "Énergie",
  },
  power_line: {
    osmTags: { power: "line" },
    label: "Ligne électrique",
    category: "Énergie",
  },
  power_generator_solar: {
    osmTags: { "power": "generator", "generator:source": "solar" },
    label: "Panneau solaire",
    category: "Énergie",
  },
  power_generator_wind: {
    osmTags: { "power": "generator", "generator:source": "wind" },
    label: "Éolienne",
    category: "Énergie",
  },
  power_generator_hydro: {
    osmTags: { "power": "generator", "generator:source": "hydro" },
    label: "Centrale hydroélectrique",
    category: "Énergie",
  },
  power_generator_nuclear: {
    osmTags: { "power": "generator", "generator:source": "nuclear" },
    label: "Centrale nucléaire",
    category: "Énergie",
  },
  power_generator_biomass: {
    osmTags: { "power": "generator", "generator:source": "biomass" },
    label: "Centrale biomasse",
    category: "Énergie",
  },
  power_generator_geothermal: {
    osmTags: { "power": "generator", "generator:source": "geothermal" },
    label: "Géothermie",
    category: "Énergie",
  },
  power_transformer: {
    osmTags: { power: "transformer" },
    label: "Transformateur électrique",
    category: "Énergie",
  },
  power_pole: {
    osmTags: { power: "pole" },
    label: "Poteau électrique",
    category: "Énergie",
  },
  substation_minor: {
    osmTags: { power: "substation", voltage: "low" },
    label: "Poste basse tension",
    category: "Énergie",
  },

  /* ── Télécommunications ── */
  telecommunications_tower: {
    osmTags: { "man_made": "tower", "tower:type": "communication" },
    label: "Tour de télécommunication",
    category: "Télécommunications",
  },
  telecommunications_antenna: {
    osmTags: { "man_made": "antenna" },
    label: "Antenne",
    category: "Télécommunications",
  },
  telecommunications_mast: {
    osmTags: { "man_made": "mast" },
    label: "Mât de communication",
    category: "Télécommunications",
  },
  mobile_phone_base: {
    osmTags: { "telecom": "exchange" },
    label: "Central télécom",
    category: "Télécommunications",
  },
  telephone_exchange: {
    osmTags: { "telecom": "exchange" },
    label: "Central téléphonique",
    category: "Télécommunications",
  },
  internet_exchange: {
    osmTags: { "telecom": "internet_exchange" },
    label: "Point d'échange Internet",
    category: "Télécommunications",
  },
  radio_station: {
    osmTags: { "man_made": "tower", "tower:type": "communication" },
    label: "Station radio",
    category: "Télécommunications",
  },
  tv_transmitter: {
    osmTags: { "man_made": "tower", "tower:type": "communication" },
    label: "Émetteur TV",
    category: "Télécommunications",
  },
  data_center: {
    osmTags: { "telecom": "data_center" },
    label: "Centre de données",
    category: "Télécommunications",
  },

  /* ── Transport ── */
  airport: {
    osmTags: { "aeroway": "aerodrome" },
    label: "Aéroport",
    category: "Transport",
  },
  helipad: {
    osmTags: { "aeroway": "heliport" },
    label: "Héliport",
    category: "Transport",
  },
  train_station: {
    osmTags: { "railway": "station" },
    label: "Gare ferroviaire",
    category: "Transport",
  },
  train_halt: {
    osmTags: { "railway": "halt" },
    label: "Halte ferroviaire",
    category: "Transport",
  },
  tram_stop: {
    osmTags: { "railway": "tram_stop" },
    label: "Arrêt de tram",
    category: "Transport",
  },
  subway_station: {
    osmTags: { "railway": "station", "station": "subway" },
    label: "Station de métro",
    category: "Transport",
  },
  subway_entrance: {
    osmTags: { "railway": "subway_entrance" },
    label: "Entrée de métro",
    category: "Transport",
  },
  bus_station: {
    osmTags: { "amenity": "bus_station" },
    label: "Gare routière",
    category: "Transport",
  },
  bus_stop: {
    osmTags: { "highway": "bus_stop" },
    label: "Arrêt de bus",
    category: "Transport",
  },
  ferry_terminal: {
    osmTags: { "amenity": "ferry_terminal" },
    label: "Terminal ferry",
    category: "Transport",
  },
  bridge: {
    osmTags: { "bridge": "yes" },
    label: "Pont",
    category: "Transport",
  },
  tunnel: {
    osmTags: { "tunnel": "yes" },
    label: "Tunnel",
    category: "Transport",
  },
  parking: {
    osmTags: { "amenity": "parking" },
    label: "Parking",
    category: "Transport",
  },
  bicycle_parking: {
    osmTags: { "amenity": "bicycle_parking" },
    label: "Parking vélo",
    category: "Transport",
  },
  taxi_stand: {
    osmTags: { "amenity": "taxi" },
    label: "Station de taxi",
    category: "Transport",
  },
  fuel_station: {
    osmTags: { "amenity": "fuel" },
    label: "Station-service",
    category: "Transport",
  },
  charging_station: {
    osmTags: { "amenity": "charging_station" },
    label: "Borne de recharge",
    category: "Transport",
  },
  cycling_route: {
    osmTags: { "route": "bicycle" },
    label: "Piste cyclable",
    category: "Transport",
  },
  pedestrian_crossing: {
    osmTags: { "highway": "crossing" },
    label: "Passage piéton",
    category: "Transport",
  },
  traffic_signals: {
    osmTags: { "highway": "traffic_signals" },
    label: "Feux de signalisation",
    category: "Transport",
  },
  roundabout: {
    osmTags: { "junction": "roundabout" },
    label: "Rond-point",
    category: "Transport",
  },
  railway_level_crossing: {
    osmTags: { "railway": "level_crossing" },
    label: "Passage à niveau",
    category: "Transport",
  },
  light_rail_station: {
    osmTags: { "railway": "station", "station": "light_rail" },
    label: "Station de tramway",
    category: "Transport",
  },
  airport_terminal: {
    osmTags: { "aeroway": "terminal" },
    label: "Terminal aéroportuaire",
    category: "Transport",
  },

  /* ── Santé ── */
  hospital: {
    osmTags: { "amenity": "hospital" },
    label: "Hôpital",
    category: "Santé",
  },
  clinic: {
    osmTags: { "amenity": "clinic" },
    label: "Clinique",
    category: "Santé",
  },
  pharmacy: {
    osmTags: { "amenity": "pharmacy" },
    label: "Pharmacie",
    category: "Santé",
  },
  doctors: {
    osmTags: { "amenity": "doctors" },
    label: "Cabinet médical",
    category: "Santé",
  },
  dentist: {
    osmTags: { "amenity": "dentist" },
    label: "Dentiste",
    category: "Santé",
  },
  veterinary: {
    osmTags: { "amenity": "veterinary" },
    label: "Vétérinaire",
    category: "Santé",
  },
  healthcare_centre: {
    osmTags: { "healthcare": "centre" },
    label: "Centre de santé",
    category: "Santé",
  },
  blood_bank: {
    osmTags: { "healthcare": "blood_bank" },
    label: "Banque du sang",
    category: "Santé",
  },
  first_aid: {
    osmTags: { "amenity": "first_aid" },
    label: "Poste de premiers secours",
    category: "Santé",
  },
  emergency_telephone: {
    osmTags: { "emergency": "telephone" },
    label: "Téléphone d'urgence",
    category: "Santé",
  },
  defibrillator: {
    osmTags: { "emergency": "defibrillator" },
    label: "Défibrillateur",
    category: "Santé",
  },
  social_facility: {
    osmTags: { "amenity": "social_facility" },
    label: "Établissement social",
    category: "Santé",
  },

  /* ── Éducation ── */
  school: {
    osmTags: { "amenity": "school" },
    label: "École",
    category: "Éducation",
  },
  university: {
    osmTags: { "amenity": "university" },
    label: "Université",
    category: "Éducation",
  },
  college: {
    osmTags: { "amenity": "college" },
    label: "Collège",
    category: "Éducation",
  },
  kindergarten: {
    osmTags: { "amenity": "kindergarten" },
    label: "École maternelle",
    category: "Éducation",
  },
  library: {
    osmTags: { "amenity": "library" },
    label: "Bibliothèque",
    category: "Éducation",
  },
  research_institute: {
    osmTags: { "amenity": "research_institute" },
    label: "Institut de recherche",
    category: "Éducation",
  },
  driving_school: {
    osmTags: { "amenity": "driving_school" },
    label: "Auto-école",
    category: "Éducation",
  },
  language_school: {
    osmTags: { "amenity": "language_school" },
    label: "École de langues",
    category: "Éducation",
  },
  music_school: {
    osmTags: { "amenity": "music_school" },
    label: "Conservatoire",
    category: "Éducation",
  },
  training_center: {
    osmTags: { "amenity": "training" },
    label: "Centre de formation",
    category: "Éducation",
  },
  public_bookcase: {
    osmTags: { "amenity": "public_bookcase" },
    label: "Boîte à livres",
    category: "Éducation",
  },

  /* ── Gouvernement ── */
  townhall: {
    osmTags: { "amenity": "townhall" },
    label: "Mairie",
    category: "Gouvernement",
  },
  courthouse: {
    osmTags: { "amenity": "courthouse" },
    label: "Tribunal",
    category: "Gouvernement",
  },
  police: {
    osmTags: { "amenity": "police" },
    label: "Commissariat",
    category: "Gouvernement",
  },
  fire_station: {
    osmTags: { "amenity": "fire_station" },
    label: "Caserne de pompiers",
    category: "Gouvernement",
  },
  post_office: {
    osmTags: { "amenity": "post_office" },
    label: "Bureau de poste",
    category: "Gouvernement",
  },
  embassy: {
    osmTags: { "office": "embassy" },
    label: "Ambassade",
    category: "Gouvernement",
  },
  consulate: {
    osmTags: { "office": "consulate" },
    label: "Consulat",
    category: "Gouvernement",
  },
  government_office: {
    osmTags: { "office": "government" },
    label: "Bureau gouvernemental",
    category: "Gouvernement",
  },
  community_centre: {
    osmTags: { "amenity": "community_centre" },
    label: "Centre communautaire",
    category: "Gouvernement",
  },
  prison: {
    osmTags: { "amenity": "prison" },
    label: "Prison",
    category: "Gouvernement",
  },
  border_control: {
    osmTags: { "barrier": "border_control" },
    label: "Contrôle frontalier",
    category: "Gouvernement",
  },
  customs: {
    osmTags: { "amenity": "customs" },
    label: "Douane",
    category: "Gouvernement",
  },

  /* ── Industrie ── */
  factory: {
    osmTags: { "man_made": "works" },
    label: "Usine",
    category: "Industrie",
  },
  industrial_area: {
    osmTags: { "landuse": "industrial" },
    label: "Zone industrielle",
    category: "Industrie",
  },
  warehouse: {
    osmTags: { "man_made": "warehouse" },
    label: "Entrepôt",
    category: "Industrie",
  },
  water_works: {
    osmTags: { "man_made": "water_works" },
    label: "Usine de traitement d'eau",
    category: "Industrie",
  },
  wastewater_plant: {
    osmTags: { "man_made": "wastewater_plant" },
    label: "Station d'épuration",
    category: "Industrie",
  },
  oil_refinery: {
    osmTags: { "man_made": "works", "industrial": "refinery" },
    label: "Raffinerie",
    category: "Industrie",
  },
  quarry: {
    osmTags: { "landuse": "quarry" },
    label: "Carrière",
    category: "Industrie",
  },
  mine: {
    osmTags: { "man_made": "mine" },
    label: "Mine",
    category: "Industrie",
  },
  construction_site: {
    osmTags: { "landuse": "construction" },
    label: "Chantier",
    category: "Industrie",
  },
  slaughterhouse: {
    osmTags: { "industrial": "slaughterhouse" },
    label: "Abattoir",
    category: "Industrie",
  },
  incinerator: {
    osmTags: { "man_made": "incinerator" },
    label: "Incinérateur",
    category: "Industrie",
  },

  /* ── Tourisme ── */
  hotel: {
    osmTags: { "tourism": "hotel" },
    label: "Hôtel",
    category: "Tourisme",
  },
  hostel: {
    osmTags: { "tourism": "hostel" },
    label: "Auberge de jeunesse",
    category: "Tourisme",
  },
  motel: {
    osmTags: { "tourism": "motel" },
    label: "Motel",
    category: "Tourisme",
  },
  guest_house: {
    osmTags: { "tourism": "guest_house" },
    label: "Chambre d'hôtes",
    category: "Tourisme",
  },
  camp_site: {
    osmTags: { "tourism": "camp_site" },
    label: "Camping",
    category: "Tourisme",
  },
  caravan_site: {
    osmTags: { "tourism": "caravan_site" },
    label: "Aire de camping-car",
    category: "Tourisme",
  },
  information_office: {
    osmTags: { "tourism": "information" },
    label: "Office de tourisme",
    category: "Tourisme",
  },
  viewpoint: {
    osmTags: { "tourism": "viewpoint" },
    label: "Point de vue",
    category: "Tourisme",
  },
  attraction: {
    osmTags: { "tourism": "attraction" },
    label: "Attraction touristique",
    category: "Tourisme",
  },
  artwork: {
    osmTags: { "tourism": "artwork" },
    label: "Œuvre d'art",
    category: "Tourisme",
  },
  theme_park: {
    osmTags: { "tourism": "theme_park" },
    label: "Parc d'attractions",
    category: "Tourisme",
  },
  museum: {
    osmTags: { "tourism": "museum" },
    label: "Musée",
    category: "Tourisme",
  },
  gallery: {
    osmTags: { "tourism": "gallery" },
    label: "Galerie d'art",
    category: "Tourisme",
  },

  /* ── Services publics ── */
  water_tower: {
    osmTags: { "man_made": "water_tower" },
    label: "Château d'eau",
    category: "Services publics",
  },
  reservoir: {
    osmTags: { "man_made": "reservoir_covered" },
    label: "Réservoir",
    category: "Services publics",
  },
  pumping_station: {
    osmTags: { "man_made": "pumping_station" },
    label: "Station de pompage",
    category: "Services publics",
  },
  waste_basket: {
    osmTags: { "amenity": "waste_basket" },
    label: "Poubelle",
    category: "Services publics",
  },
  recycling: {
    osmTags: { "amenity": "recycling" },
    label: "Point de recyclage",
    category: "Services publics",
  },
  waste_disposal: {
    osmTags: { "amenity": "waste_disposal" },
    label: "Déchetterie",
    category: "Services publics",
  },
  toilets: {
    osmTags: { "amenity": "toilets" },
    label: "Toilettes publiques",
    category: "Services publics",
  },
  drinking_water: {
    osmTags: { "amenity": "drinking_water" },
    label: "Eau potable",
    category: "Services publics",
  },
  street_lamp: {
    osmTags: { "highway": "street_lamp" },
    label: "Réverbère",
    category: "Services publics",
  },
  bench: {
    osmTags: { "amenity": "bench" },
    label: "Banc public",
    category: "Services publics",
  },
  shelter: {
    osmTags: { "amenity": "shelter" },
    label: "Abri",
    category: "Services publics",
  },
  surveillance_camera: {
    osmTags: { "man_made": "surveillance" },
    label: "Caméra de surveillance",
    category: "Services publics",
  },
  fountain: {
    osmTags: { "amenity": "fountain" },
    label: "Fontaine",
    category: "Services publics",
  },
  marketplace: {
    osmTags: { "amenity": "marketplace" },
    label: "Marché",
    category: "Services publics",
  },
  clock: {
    osmTags: { "amenity": "clock" },
    label: "Horloge publique",
    category: "Services publics",
  },

  /* ── Agriculture ── */
  farmland: {
    osmTags: { "landuse": "farmland" },
    label: "Terre agricole",
    category: "Agriculture",
  },
  farm: {
    osmTags: { "landuse": "farmyard" },
    label: "Ferme",
    category: "Agriculture",
  },
  orchard: {
    osmTags: { "landuse": "orchard" },
    label: "Verger",
    category: "Agriculture",
  },
  vineyard: {
    osmTags: { "landuse": "vineyard" },
    label: "Vigne",
    category: "Agriculture",
  },
  greenhouse: {
    osmTags: { "man_made": "greenhouse" },
    label: "Serre",
    category: "Agriculture",
  },
  grain_silo: {
    osmTags: { "man_made": "silo" },
    label: "Silo à grain",
    category: "Agriculture",
  },
  apiary: {
    osmTags: { "craft": "beekeeper" },
    label: "Rucher",
    category: "Agriculture",
  },
  plant_nursery: {
    osmTags: { "landuse": "plant_nursery" },
    label: "Pépinière",
    category: "Agriculture",
  },
  animal_boarding: {
    osmTags: { "amenity": "animal_boarding" },
    label: "Pension animale",
    category: "Agriculture",
  },

  /* ── Historique ── */
  castle: {
    osmTags: { "historic": "castle" },
    label: "Château",
    category: "Historique",
  },
  ruins: {
    osmTags: { "historic": "ruins" },
    label: "Ruines",
    category: "Historique",
  },
  monument: {
    osmTags: { "historic": "monument" },
    label: "Monument historique",
    category: "Historique",
  },
  memorial: {
    osmTags: { "historic": "memorial" },
    label: "Mémorial",
    category: "Historique",
  },
  archaeological_site: {
    osmTags: { "historic": "archaeological_site" },
    label: "Site archéologique",
    category: "Historique",
  },
  fort: {
    osmTags: { "historic": "fort" },
    label: "Fort",
    category: "Historique",
  },
  city_gate: {
    osmTags: { "historic": "city_gate" },
    label: "Porte de ville",
    category: "Historique",
  },
  wayside_cross: {
    osmTags: { "historic": "wayside_cross" },
    label: "Calvaire",
    category: "Historique",
  },
  wayside_shrine: {
    osmTags: { "historic": "wayside_shrine" },
    label: "Oratoire",
    category: "Historique",
  },
  battlefield: {
    osmTags: { "historic": "battlefield" },
    label: "Champ de bataille",
    category: "Historique",
  },
  heritage: {
    osmTags: { "heritage": ["1", "2", "3", "4"] },
    label: "Patrimoine classé",
    category: "Historique",
  },

  /* ── Religieux ── */
  church: {
    osmTags: { "amenity": "place_of_worship", "religion": "christian" },
    label: "Église",
    category: "Religieux",
  },
  mosque: {
    osmTags: { "amenity": "place_of_worship", "religion": "muslim" },
    label: "Mosquée",
    category: "Religieux",
  },
  synagogue: {
    osmTags: { "amenity": "place_of_worship", "religion": "jewish" },
    label: "Synagogue",
    category: "Religieux",
  },
  buddhist_temple: {
    osmTags: { "amenity": "place_of_worship", "religion": "buddhist" },
    label: "Temple bouddhiste",
    category: "Religieux",
  },
  hindu_temple: {
    osmTags: { "amenity": "place_of_worship", "religion": "hindu" },
    label: "Temple hindou",
    category: "Religieux",
  },
  place_of_worship: {
    osmTags: { "amenity": "place_of_worship" },
    label: "Lieu de culte",
    category: "Religieux",
  },
  cemetery: {
    osmTags: { "landuse": "cemetery" },
    label: "Cimetière",
    category: "Religieux",
  },

  /* ── Commerce ── */
  supermarket: {
    osmTags: { "shop": "supermarket" },
    label: "Supermarché",
    category: "Commerce",
  },
  convenience: {
    osmTags: { "shop": "convenience" },
    label: "Épicerie de quartier",
    category: "Commerce",
  },
  bakery: {
    osmTags: { "shop": "bakery" },
    label: "Boulangerie",
    category: "Commerce",
  },
  butcher: {
    osmTags: { "shop": "butcher" },
    label: "Boucherie",
    category: "Commerce",
  },
  bank: {
    osmTags: { "amenity": "bank" },
    label: "Banque",
    category: "Commerce",
  },
  atm: {
    osmTags: { "amenity": "atm" },
    label: "Distributeur automatique",
    category: "Commerce",
  },
  shopping_mall: {
    osmTags: { "shop": "mall" },
    label: "Centre commercial",
    category: "Commerce",
  },
  market_place: {
    osmTags: { "amenity": "marketplace" },
    label: "Place de marché",
    category: "Commerce",
  },
  restaurant: {
    osmTags: { "amenity": "restaurant" },
    label: "Restaurant",
    category: "Commerce",
  },
  cafe: {
    osmTags: { "amenity": "cafe" },
    label: "Café",
    category: "Commerce",
  },
  fast_food: {
    osmTags: { "amenity": "fast_food" },
    label: "Fast-food",
    category: "Commerce",
  },
  bar: {
    osmTags: { "amenity": "bar" },
    label: "Bar",
    category: "Commerce",
  },
  cinema: {
    osmTags: { "amenity": "cinema" },
    label: "Cinéma",
    category: "Commerce",
  },
  theatre: {
    osmTags: { "amenity": "theatre" },
    label: "Théâtre",
    category: "Commerce",
  },
  nightclub: {
    osmTags: { "amenity": "nightclub" },
    label: "Boîte de nuit",
    category: "Commerce",
  },
  laundry: {
    osmTags: { "shop": "laundry" },
    label: "Laverie",
    category: "Commerce",
  },
  hairdresser: {
    osmTags: { "shop": "hairdresser" },
    label: "Coiffeur",
    category: "Commerce",
  },

  /* ── Loisirs ── */
  park: {
    osmTags: { "leisure": "park" },
    label: "Parc",
    category: "Loisirs",
  },
  playground: {
    osmTags: { "leisure": "playground" },
    label: "Aire de jeux",
    category: "Loisirs",
  },
  sports_centre: {
    osmTags: { "leisure": "sports_centre" },
    label: "Centre sportif",
    category: "Loisirs",
  },
  swimming_pool: {
    osmTags: { "leisure": "swimming_pool" },
    label: "Piscine",
    category: "Loisirs",
  },
  fitness_centre: {
    osmTags: { "leisure": "fitness_centre" },
    label: "Salle de sport",
    category: "Loisirs",
  },
  football_pitch: {
    osmTags: { "leisure": "pitch", "sport": "football" },
    label: "Terrain de football",
    category: "Loisirs",
  },
  tennis_court: {
    osmTags: { "leisure": "pitch", "sport": "tennis" },
    label: "Court de tennis",
    category: "Loisirs",
  },
  golf_course: {
    osmTags: { "leisure": "golf_course" },
    label: "Terrain de golf",
    category: "Loisirs",
  },
  stadium: {
    osmTags: { "leisure": "stadium" },
    label: "Stade",
    category: "Loisirs",
  },
  track: {
    osmTags: { "leisure": "track" },
    label: "Piste d'athlétisme",
    category: "Loisirs",
  },
  marina: {
    osmTags: { "leisure": "marina" },
    label: "Marina",
    category: "Loisirs",
  },
  slipway: {
    osmTags: { "leisure": "slipway" },
    label: "Ramp de mise à l'eau",
    category: "Loisirs",
  },
  dog_park: {
    osmTags: { "leisure": "dog_park" },
    label: "Parc pour chiens",
    category: "Loisirs",
  },
  garden: {
    osmTags: { "leisure": "garden" },
    label: "Jardin",
    category: "Loisirs",
  },
  nature_reserve: {
    osmTags: { "leisure": "nature_reserve" },
    label: "Réserve naturelle",
    category: "Loisirs",
  },
  ice_rink: {
    osmTags: { "leisure": "ice_rink" },
    label: "Patinoire",
    category: "Loisirs",
  },
  miniature_golf: {
    osmTags: { "leisure": "miniature_golf" },
    label: "Mini-golf",
    category: "Loisirs",
  },
};

/* ═══════════════════════════════════════════════════════════════
   Infrastructure Categories
   ═══════════════════════════════════════════════════════════════ */

export const INFRA_CATEGORIES: InfraCategory[] = [
  {
    id: "energie",
    label: "Énergie",
    icon: "Zap",
    types: [
      "power_plant",
      "power_substation",
      "power_line",
      "power_generator_solar",
      "power_generator_wind",
      "power_generator_hydro",
      "power_generator_nuclear",
      "power_generator_biomass",
      "power_generator_geothermal",
      "power_transformer",
      "power_pole",
      "substation_minor",
    ],
  },
  {
    id: "telecommunications",
    label: "Télécommunications",
    icon: "Satellite",
    types: [
      "telecommunications_tower",
      "telecommunications_antenna",
      "telecommunications_mast",
      "mobile_phone_base",
      "telephone_exchange",
      "internet_exchange",
      "radio_station",
      "tv_transmitter",
      "data_center",
    ],
  },
  {
    id: "transport",
    label: "Transport",
    icon: "MapPin",
    types: [
      "airport",
      "helipad",
      "train_station",
      "train_halt",
      "tram_stop",
      "subway_station",
      "subway_entrance",
      "bus_station",
      "bus_stop",
      "ferry_terminal",
      "bridge",
      "tunnel",
      "parking",
      "bicycle_parking",
      "taxi_stand",
      "fuel_station",
      "charging_station",
      "cycling_route",
      "pedestrian_crossing",
      "traffic_signals",
      "roundabout",
      "railway_level_crossing",
      "light_rail_station",
      "airport_terminal",
    ],
  },
  {
    id: "sante",
    label: "Santé",
    icon: "ShieldCheck",
    types: [
      "hospital",
      "clinic",
      "pharmacy",
      "doctors",
      "dentist",
      "veterinary",
      "healthcare_centre",
      "blood_bank",
      "first_aid",
      "emergency_telephone",
      "defibrillator",
      "social_facility",
    ],
  },
  {
    id: "education",
    label: "Éducation",
    icon: "Brain",
    types: [
      "school",
      "university",
      "college",
      "kindergarten",
      "library",
      "research_institute",
      "driving_school",
      "language_school",
      "music_school",
      "training_center",
      "public_bookcase",
    ],
  },
  {
    id: "gouvernement",
    label: "Gouvernement",
    icon: "Layers",
    types: [
      "townhall",
      "courthouse",
      "police",
      "fire_station",
      "post_office",
      "embassy",
      "consulate",
      "government_office",
      "community_centre",
      "prison",
      "border_control",
      "customs",
    ],
  },
  {
    id: "industrie",
    label: "Industrie",
    icon: "Factory",
    types: [
      "factory",
      "industrial_area",
      "warehouse",
      "water_works",
      "wastewater_plant",
      "oil_refinery",
      "quarry",
      "mine",
      "construction_site",
      "slaughterhouse",
      "incinerator",
    ],
  },
  {
    id: "tourisme",
    label: "Tourisme",
    icon: "Camera",
    types: [
      "hotel",
      "hostel",
      "motel",
      "guest_house",
      "camp_site",
      "caravan_site",
      "information_office",
      "viewpoint",
      "attraction",
      "artwork",
      "theme_park",
      "museum",
      "gallery",
    ],
  },
  {
    id: "services_publics",
    label: "Services publics",
    icon: "Droplets",
    types: [
      "water_tower",
      "reservoir",
      "pumping_station",
      "waste_basket",
      "recycling",
      "waste_disposal",
      "toilets",
      "drinking_water",
      "street_lamp",
      "bench",
      "shelter",
      "surveillance_camera",
      "fountain",
      "marketplace",
      "clock",
    ],
  },
  {
    id: "agriculture",
    label: "Agriculture",
    icon: "Wheat",
    types: [
      "farmland",
      "farm",
      "orchard",
      "vineyard",
      "greenhouse",
      "grain_silo",
      "apiary",
      "plant_nursery",
      "animal_boarding",
    ],
  },
  {
    id: "historique",
    label: "Historique",
    icon: "Landmark",
    types: [
      "castle",
      "ruins",
      "monument",
      "memorial",
      "archaeological_site",
      "fort",
      "city_gate",
      "wayside_cross",
      "wayside_shrine",
      "battlefield",
      "heritage",
    ],
  },
  {
    id: "religieux",
    label: "Religieux",
    icon: "Church",
    types: [
      "church",
      "mosque",
      "synagogue",
      "buddhist_temple",
      "hindu_temple",
      "place_of_worship",
      "cemetery",
    ],
  },
  {
    id: "commerce",
    label: "Commerce",
    icon: "ShoppingCart",
    types: [
      "supermarket",
      "convenience",
      "bakery",
      "butcher",
      "bank",
      "atm",
      "shopping_mall",
      "market_place",
      "restaurant",
      "cafe",
      "fast_food",
      "bar",
      "cinema",
      "theatre",
      "nightclub",
      "laundry",
      "hairdresser",
    ],
  },
  {
    id: "loisirs",
    label: "Loisirs",
    icon: "TreePine",
    types: [
      "park",
      "playground",
      "sports_centre",
      "swimming_pool",
      "fitness_centre",
      "football_pitch",
      "tennis_court",
      "golf_course",
      "stadium",
      "track",
      "marina",
      "slipway",
      "dog_park",
      "garden",
      "nature_reserve",
      "ice_rink",
      "miniature_golf",
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════
   NLP Type Patterns (French & English)
   ═══════════════════════════════════════════════════════════════ */

const TYPE_PATTERNS: Array<{ pattern: RegExp; type: string }> = [
  // Énergie
  { pattern: /centrale\s+(électrique|nucléaire|thermique|solaire|éolienne|hydraulique|biomasse|géotherm)/i, type: "power_plant" },
  { pattern: /éolienne|wind\s*farm|wind\s*turbine/i, type: "power_generator_wind" },
  { pattern: /panneau\s*solaire|solar\s*panel/i, type: "power_generator_solar" },
  { pattern: /poste\s*(électrique|de\s*transformation)|substation/i, type: "power_substation" },
  { pattern: /lignes?\s*électrique|power\s*line/i, type: "power_line" },
  { pattern: /transformateur\s*électrique/i, type: "power_transformer" },
  // Télécommunications
  { pattern: /antenne|tour\s*(de\s*communication|télécom)|télécom/i, type: "telecommunications_tower" },
  { pattern: /mât\s*(de\s*communication)?|telecom\s*mast/i, type: "telecommunications_mast" },
  { pattern: /data\s*center|centre\s*de\s*données/i, type: "data_center" },
  // Transport
  { pattern: /aéroport|airport|aerodrome/i, type: "airport" },
  { pattern: /héliport|heliport/i, type: "helipad" },
  { pattern: /gare\s*(ferroviaire|de\s*train|routière)?|train\s*station/i, type: "train_station" },
  { pattern: /station\s*de\s*métro|subway\s*station|métro/i, type: "subway_station" },
  { pattern: /arrêt\s*de\s*tram|tram\s*stop/i, type: "tram_stop" },
  { pattern: /arrêt\s*de\s*bus|bus\s*stop/i, type: "bus_stop" },
  { pattern: /gare\s*routière|bus\s*station/i, type: "bus_station" },
  { pattern: /pont|bridge/i, type: "bridge" },
  { pattern: /tunnel/i, type: "tunnel" },
  { pattern: /parking|stationnement/i, type: "parking" },
  { pattern: /station\s*service|fuel\s*station|essence/i, type: "fuel_station" },
  { pattern: /borne\s*de\s*recharge|charging\s*station/i, type: "charging_station" },
  { pattern: /terminal\s*ferry|ferry\s*terminal/i, type: "ferry_terminal" },
  { pattern: /piste\s*cyclable|cycling\s*route/i, type: "cycling_route" },
  { pattern: /passage\s*à\s*niveau|level\s*crossing/i, type: "railway_level_crossing" },
  // Santé
  { pattern: /hôpital|hospital/i, type: "hospital" },
  { pattern: /clinique|clinic/i, type: "clinic" },
  { pattern: /pharmacie|pharmacy/i, type: "pharmacy" },
  { pattern: /cabinet\s*médical|médecin|doctors?/i, type: "doctors" },
  { pattern: /dentiste|dentist/i, type: "dentist" },
  { pattern: /vétérinaire|veterinary/i, type: "veterinary" },
  { pattern: /centre\s*(de\s*santé|médical)|healthcare\s*centre/i, type: "healthcare_centre" },
  { pattern: /défibrillateur|defibrillator/i, type: "defibrillator" },
  { pattern: /banque\s*du\s*sang|blood\s*bank/i, type: "blood_bank" },
  // Éducation
  { pattern: /école|school/i, type: "school" },
  { pattern: /université|university/i, type: "university" },
  { pattern: /collège|lycée|college/i, type: "college" },
  { pattern: /maternelle|kindergarten/i, type: "kindergarten" },
  { pattern: /bibliothèque|library/i, type: "library" },
  { pattern: /institut\s*de\s*recherche|research\s*institute/i, type: "research_institute" },
  { pattern: /conservatoire|école\s*de\s*musique|music\s*school/i, type: "music_school" },
  { pattern: /auto\s*école|driving\s*school/i, type: "driving_school" },
  { pattern: /centre\s*de\s*formation|training\s*center/i, type: "training_center" },
  // Gouvernement
  { pattern: /mairie|townhall|city\s*hall|hôtel\s*de\s*ville/i, type: "townhall" },
  { pattern: /tribunal|courthouse/i, type: "courthouse" },
  { pattern: /commissariat|police\s*station|police/i, type: "police" },
  { pattern: /caserne\s*de\s*pompiers|fire\s*station|pompier/i, type: "fire_station" },
  { pattern: /bureau\s*de\s*poste|post\s*office|poste/i, type: "post_office" },
  { pattern: /ambassade|embassy/i, type: "embassy" },
  { pattern: /consulat|consulate/i, type: "consulate" },
  { pattern: /prison|prison/i, type: "prison" },
  { pattern: /centre\s*communautaire|community\s*centre/i, type: "community_centre" },
  // Industrie
  { pattern: /usine|factory|plant\s*industrial/i, type: "factory" },
  { pattern: /zone\s*industrielle|industrial\s*area/i, type: "industrial_area" },
  { pattern: /entrepôt|warehouse/i, type: "warehouse" },
  { pattern: /station\s*d'épuration|wastewater\s*plant/i, type: "wastewater_plant" },
  { pattern: /raffinerie|refinery/i, type: "oil_refinery" },
  { pattern: /carrière|quarry/i, type: "quarry" },
  { pattern: /mine|mining/i, type: "mine" },
  // Tourisme
  { pattern: /hôtel|hotel(?!\s*de\s*ville)/i, type: "hotel" },
  { pattern: /auberge\s*de\s*jeunesse|hostel|youth\s*hostel/i, type: "hostel" },
  { pattern: /camping|camp\s*site/i, type: "camp_site" },
  { pattern: /office\s*de\s*tourisme|tourist\s*information/i, type: "information_office" },
  { pattern: /musée|museum/i, type: "museum" },
  { pattern: /galerie\s*d'art|art\s*gallery/i, type: "gallery" },
  { pattern: /parc\s*d'attractions|theme\s*park/i, type: "theme_park" },
  { pattern: /point\s*de\s*vue|viewpoint/i, type: "viewpoint" },
  { pattern: /attraction\s*touristique|tourist\s*attraction/i, type: "attraction" },
  // Services publics
  { pattern: /château\s*d'eau|water\s*tower/i, type: "water_tower" },
  { pattern: /fontaine|fountain/i, type: "fountain" },
  { pattern: /station\s*de\s*pompage|pumping\s*station/i, type: "pumping_station" },
  { pattern: /recyclage|recycling/i, type: "recycling" },
  { pattern: /déchetterie|waste\s*disposal/i, type: "waste_disposal" },
  { pattern: /marché|marketplace|market\s*place/i, type: "marketplace" },
  // Agriculture
  { pattern: /ferme|farm/i, type: "farm" },
  { pattern: /verger|orchard/i, type: "orchard" },
  { pattern: /vigne|vineyard|vignoble/i, type: "vineyard" },
  { pattern: /serre|greenhouse/i, type: "greenhouse" },
  { pattern: /silo|grain\s*silo/i, type: "grain_silo" },
  { pattern: /pépinière|plant\s*nursery/i, type: "plant_nursery" },
  // Historique
  { pattern: /château|castle(?!\s*d'eau)/i, type: "castle" },
  { pattern: /ruines?|ruins/i, type: "ruins" },
  { pattern: /monument/i, type: "monument" },
  { pattern: /mémorial|memorial/i, type: "memorial" },
  { pattern: /site\s*archéologique|archaeological/i, type: "archaeological_site" },
  { pattern: /fort|forteresse|fortress/i, type: "fort" },
  { pattern: /patrimoine\s*classé|heritage/i, type: "heritage" },
  // Religieux
  { pattern: /église|church/i, type: "church" },
  { pattern: /mosquée|mosque/i, type: "mosque" },
  { pattern: /synagogue|synagogue/i, type: "synagogue" },
  { pattern: /temple\s*bouddhiste|buddhist\s*temple/i, type: "buddhist_temple" },
  { pattern: /temple\s*hindou|hindu\s*temple/i, type: "hindu_temple" },
  { pattern: /lieu\s*de\s*culte|place\s*of\s*worship/i, type: "place_of_worship" },
  { pattern: /cimetière|cemetery/i, type: "cemetery" },
  // Commerce
  { pattern: /supermarché|supermarket/i, type: "supermarket" },
  { pattern: /boulangerie|bakery/i, type: "bakery" },
  { pattern: /boucherie|butcher/i, type: "butcher" },
  { pattern: /banque|bank/i, type: "bank" },
  { pattern: /distributeur\s*automatique|atm/i, type: "atm" },
  { pattern: /centre\s*commercial|shopping\s*(mall|center)/i, type: "shopping_mall" },
  { pattern: /restaurant/i, type: "restaurant" },
  { pattern: /café|cafe/i, type: "cafe" },
  { pattern: /cinéma|cinema/i, type: "cinema" },
  { pattern: /théâtre|theatre|theater/i, type: "theatre" },
  // Loisirs
  { pattern: /parc(?!\s*d'attractions)|park(?!ing)/i, type: "park" },
  { pattern: /aire\s*de\s*jeux|playground/i, type: "playground" },
  { pattern: /centre\s*sportif|sports\s*centre|gymnase/i, type: "sports_centre" },
  { pattern: /piscine|swimming\s*pool/i, type: "swimming_pool" },
  { pattern: /salle\s*de\s*sport|fitness\s*centre|salle\s*de\s*musculation/i, type: "fitness_centre" },
  { pattern: /stade|stadium/i, type: "stadium" },
  { pattern: /terrain\s*de\s*football|football\s*pitch/i, type: "football_pitch" },
  { pattern: /court\s*de\s*tennis|tennis\s*court/i, type: "tennis_court" },
  { pattern: /golf/gi, type: "golf_course" },
  { pattern: /jardin(?!\s*d'enfant)|garden/i, type: "garden" },
  { pattern: /réserve\s*naturelle|nature\s*reserve/i, type: "nature_reserve" },
  { pattern: /marina|port\s*de\s*plaisance/i, type: "marina" },
  { pattern: /patinoire|ice\s*rink/i, type: "ice_rink" },
  { pattern: /parc\s*pour\s*chiens|dog\s*park/i, type: "dog_park" },
];

/* ═══════════════════════════════════════════════════════════════
   Overpass API Endpoints (failover)
   ═══════════════════════════════════════════════════════════════ */

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

const USER_AGENT = "ThesisFrame-GeoMCP/1.0";

/* ═══════════════════════════════════════════════════════════════
   Overpass Query Builder
   ═══════════════════════════════════════════════════════════════ */

export function buildOverpassQuery(
  type: string,
  bbox: [number, number, number, number],
  operator?: string
): string {
  const assetDef = ASSET_TYPE_MAP[type];
  if (!assetDef) {
    throw new Error(`Unknown asset type: ${type}`);
  }

  const [south, west, north, east] = bbox;
  const tags = assetDef.osmTags;

  // Build tag filter clauses
  const tagClauses: string[] = [];
  for (const [key, value] of Object.entries(tags)) {
    if (Array.isArray(value)) {
      // Array of values: use OR with pipe (Overpass regex)
      const regex = value.join("|");
      tagClauses.push(`["${key}"~"^(${regex})$"]`);
    } else {
      tagClauses.push(`["${key}"="${value}"]`);
    }
  }

  // Add optional operator filter
  const opFilter = operator ? `["operator"~"${operator}",i]` : "";

  // Build query for nodes and ways with center points
  const baseFilter = tagClauses.join("");

  const query = `[out:json][timeout:25];
(
  node${baseFilter}${opFilter}(${south},${west},${north},${east});
  way${baseFilter}${opFilter}(${south},${west},${north},${east});
  relation${baseFilter}${opFilter}(${south},${west},${north},${east});
);
out center tags;`;

  return query;
}

/* ═══════════════════════════════════════════════════════════════
   Overpass Query Executor (with failover)
   ═══════════════════════════════════════════════════════════════ */

export async function executeOverpassQuery(
  query: string
): Promise<InfraResult[]> {
  let lastError: Error | null = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25_000);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": USER_AGENT,
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const elements = data.elements || [];

      // Filter to only items with lat/lon and map to InfraResult
      const results: InfraResult[] = elements
        .filter(
          (el: Record<string, unknown>) =>
            typeof el.lat === "number" && typeof el.lon === "number"
        )
        .map((el: Record<string, unknown>) => ({
          id: el.id as number,
          name: ((el.tags as Record<string, string>)?.name) || "Sans nom",
          type: (el.type as string) || "node",
          operator: ((el.tags as Record<string, string>)?.operator) || "",
          lat: el.lat as number,
          lon: el.lon as number,
          tags: (el.tags as Record<string, string>) || {},
        }));

      return results;
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err instanceof Error ? err : new Error(String(err));
      // Try next endpoint
      continue;
    }
  }

  throw new Error(
    `All Overpass API endpoints failed: ${lastError?.message || "unknown error"}`
  );
}

/* ═══════════════════════════════════════════════════════════════
   NLP Query Parser
   ═══════════════════════════════════════════════════════════════ */

export function parseInfraQuery(query: string): ParsedQuery {
  const trimmed = query.trim();
  let type: string | null = null;
  let location: string | null = null;
  let radius = 5; // default 5 km

  // 1. Detect asset type from patterns
  for (const { pattern, type: matchedType } of TYPE_PATTERNS) {
    if (pattern.test(trimmed)) {
      type = matchedType;
      break;
    }
  }

  // 2. Detect location keyword and extract place name
  const locMatch = trimmed.match(/(?:à|a|in|near|près\s*de|autour\s*de)\s+([^,]+?)(?:\s*,?\s*(?:dans\s*un\s*rayon\s*de|within|dans)\s+\d+\s*km)?\s*$/i);

  if (locMatch) {
    location = locMatch[1].trim();
  }

  // If no location keyword found, try to extract location from end of query
  // after the asset type word(s)
  if (!location && type) {
    // Remove the matched type text and any connecting words
    const typePattern = TYPE_PATTERNS.find((p) => p.type === type);
    if (typePattern) {
      const cleaned = trimmed
        .replace(typePattern.pattern, "")
        .replace(/^(\s*[àa]|\s*(in|near|près\s*de|autour\s*de)\s*)/i, "")
        .trim();
      if (cleaned.length > 1) {
        location = cleaned.replace(/^[,\s]+|[,\s]+$/g, "");
      }
    }
  }

  // 3. Detect radius: "within X km", "dans un rayon de X km"
  const radiusMatch = trimmed.match(
    /(?:within|dans\s*un\s*rayon\s*de|dans)\s+(\d+(?:\.\d+)?)\s*km/i
  );
  if (radiusMatch) {
    radius = parseFloat(radiusMatch[1]);
  }

  return { type, location, radius, raw: trimmed };
}

/* ═══════════════════════════════════════════════════════════════
   Nominatim Geocoder
   ═══════════════════════════════════════════════════════════════ */

interface GeocodeResult {
  lat: number;
  lon: number;
  bbox: {
    west: number;
    south: number;
    east: number;
    north: number;
  };
}

export async function geocodeLocation(
  query: string
): Promise<GeocodeResult | null> {
  if (!query || query.trim().length === 0) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15_000);

  try {
    const params = new URLSearchParams({
      q: query.trim(),
      format: "json",
      limit: "1",
      addressdetails: "0",
    });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      {
        headers: {
          "User-Agent": USER_AGENT,
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    const result = data[0];
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);

    // Use bounding box from Nominatim, fallback to a 0.1° box around the point
    let bbox: GeocodeResult["bbox"];
    if (
      result.boundingbox &&
      Array.isArray(result.boundingbox) &&
      result.boundingbox.length === 4
    ) {
      bbox = {
        south: parseFloat(result.boundingbox[0]),
        north: parseFloat(result.boundingbox[1]),
        east: parseFloat(result.boundingbox[2]),
        west: parseFloat(result.boundingbox[3]),
      };
    } else {
      const delta = 0.05;
      bbox = {
        south: lat - delta,
        north: lat + delta,
        west: lon - delta,
        east: lon + delta,
      };
    }

    return { lat, lon, bbox };
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}
