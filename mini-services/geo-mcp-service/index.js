/**
 * geo-mcp-service — Service MCP géographique pour ThesisFrame
 *
 * Expose des outils de cartographie via le protocole MCP (Model Context Protocol)
 * Inspiré de l'intégration MCP d'ArcGIS décrite sur arcOrama.fr
 *
 * Port : 3005
 *
 * Outils exposés :
 *   - geocode          : Transformer une adresse en coordonnées (Nominatim/OSM)
 *   - reverse_geocode  : Identifier une adresse à partir de coordonnées
 *   - validate_coords  : Valider et normaliser des coordonnées géographiques
 *   - compute_bbox     : Calculer la bbox d'un ensemble de coordonnées
 *   - compute_area     : Calculer la superficie approximative d'un polygone GeoJSON
 *   - check_crs        : Vérifier le système de référence de coordonnées
 *   - geojson_validate : Valider la structure d'un objet GeoJSON
 *   - elevation_query  : Obtenir l'altitude d'un point
 *   - distance_between : Calculer la distance entre deux points
 */

const http = require('http');

// ─── Registre des outils MCP ─────────────────────────────────

const TOOLS = [
  {
    name: 'geocode',
    description:
      'Transforme une adresse ou un toponyme en coordonnées géographiques (latitude, longitude). ' +
      'Utilise l\'API Nominatim d\'OpenStreetMap. Retourne les coordonnées, le type de lieu, et la bbox.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Adresse ou toponyme à géocoder (ex: "Paris, France" ou "Place de la Concorde")',
        },
        limit: {
          type: 'number',
          description: 'Nombre maximum de résultats (défaut: 1, max: 5)',
        },
        lang: {
          type: 'string',
          description: 'Code langue pour les résultats (défaut: "fr")',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'reverse_geocode',
    description:
      'Identifie une adresse et des informations contextuelles à partir de coordonnées géographiques.',
    inputSchema: {
      type: 'object',
      properties: {
        lat: { type: 'number', description: 'Latitude (WGS84)' },
        lon: { type: 'number', description: 'Longitude (WGS84)' },
        zoom: { type: 'number', description: 'Niveau de zoom pour le résultat (défaut: 18)' },
      },
      required: ['lat', 'lon'],
    },
  },
  {
    name: 'validate_coords',
    description:
      'Valide et normalise des coordonnées géographiques. Détecte si des coordonnées sont en WGS84 ' +
      'ou dans un autre CRS (Lambert-93, UTM, etc.) et tente de les convertir en WGS84 si nécessaire.',
    inputSchema: {
      type: 'object',
      properties: {
        lat: { type: 'number', description: 'Latitude ou coordonnée Y' },
        lon: { type: 'number', description: 'Longitude ou coordonnée X' },
        suspected_crs: {
          type: 'string',
          description: 'CRS suspecté ("WGS84", "EPSG:2154", "EPSG:3857", "auto")',
        },
      },
      required: ['lat', 'lon'],
    },
  },
  {
    name: 'compute_bbox',
    description:
      'Calcule la bounding box (enveloppe) d\'un ensemble de coordonnées ou d\'un périmètre d\'étude. ' +
      'Utile pour vérifier la cohérence des périmètres déclarés dans une étude cartographique.',
    inputSchema: {
      type: 'object',
      properties: {
        coordinates: {
          type: 'array',
          description:
            'Liste de coordonnées [[lat, lon], ...] ou un objet GeoJSON avec propriété "coordinates"',
        },
      },
      required: ['coordinates'],
    },
  },
  {
    name: 'compute_area',
    description:
      'Calcule la superficie approximative (en km² et en hectares) d\'un polygone GeoJSON. ' +
      'Utilise la formule de Gauss pour le calcul sur l\'ellipsoïde.',
    inputSchema: {
      type: 'object',
      properties: {
        geojson: {
          type: 'object',
          description: 'Objet GeoJSON de type Polygon ou MultiPolygon',
        },
      },
      required: ['geojson'],
    },
  },
  {
    name: 'check_crs',
    description:
      'Analyse des coordonnées pour détecter le système de référence (CRS) probable. ' +
      'Compare les valeurs aux plages connues de WGS84, Lambert-93, UTM, Mercator, etc.',
    inputSchema: {
      type: 'object',
      properties: {
        x: { type: 'number', description: 'Coordonnée X / Est / Longitude' },
        y: { type: 'number', description: 'Coordonnée Y / Nord / Latitude' },
        context: {
          type: 'string',
          description: 'Contexte géographique (ex: "France", "Afrique de l\'Ouest")',
        },
      },
      required: ['x', 'y'],
    },
  },
  {
    name: 'geojson_validate',
    description:
      'Valide la structure d\'un objet GeoJSON selon la spécification RFC 7946. ' +
      'Vérifie le type, les coordonnées, et la cohérence géométrique.',
    inputSchema: {
      type: 'object',
      properties: {
        geojson: {
          type: 'object',
          description: 'Objet GeoJSON à valider',
        },
      },
      required: ['geojson'],
    },
  },
  {
    name: 'elevation_query',
    description:
      'Obtient l\'altitude (en mètres) d\'un point géographique. ' +
      'Utilise l\'API Open Elevation (données SRTM).',
    inputSchema: {
      type: 'object',
      properties: {
        lat: { type: 'number', description: 'Latitude (WGS84)' },
        lon: { type: 'number', description: 'Longitude (WGS84)' },
      },
      required: ['lat', 'lon'],
    },
  },
  {
    name: 'distance_between',
    description:
      'Calcule la distance (en km, en ligne droite / orthodromique) entre deux points géographiques.',
    inputSchema: {
      type: 'object',
      properties: {
        lat1: { type: 'number', description: 'Latitude du point A' },
        lon1: { type: 'number', description: 'Longitude du point A' },
        lat2: { type: 'number', description: 'Latitude du point B' },
        lon2: { type: 'number', description: 'Longitude du point B' },
      },
      required: ['lat1', 'lon1', 'lat2', 'lon2'],
    },
  },
];

// ─── Helpers ─────────────────────────────────────────────────

/** Haversine distance en km entre deux points WGS84 */
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Calcul de superficie d'un polygone (formule de Gauss, résultat en km²) */
function polygonAreaKm2(coords) {
  let area = 0;
  const ring = coords[0]; // outer ring
  const n = ring.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const lat1 = (ring[i][1] * Math.PI) / 180;
    const lat2 = (ring[j][1] * Math.PI) / 180;
    const dLon = ((ring[j][0] - ring[i][0]) * Math.PI) / 180;
    area += dLon * (2 + Math.sin(lat1) + Math.sin(lat2));
  }
  area = (area * 6371 * 6371) / 2;
  return Math.abs(area);
}

/** Fetch avec timeout utilisant setTimeout (aucune dépendance externe) */
async function fetchWithTimeout(url, ms) {
  if (ms === undefined) ms = 8000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'ThesisFrame-GeoMCP/1.0' },
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Implémentation des outils ────────────────────────────────

async function toolGeocode(args) {
  const query = String(args.query ?? '');
  const limit = Math.min(Math.max(Number(args.limit ?? 1), 1), 5);
  const lang = String(args.lang ?? 'fr');

  if (!query.trim()) throw new Error('Le paramètre "query" est requis');

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=${limit}&accept-language=${lang}&addressdetails=1`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`Nominatim a retourné ${res.status}`);
  const data = await res.json();

  return {
    query,
    results: data.map((r) => ({
      display_name: r.display_name,
      lat: parseFloat(String(r.lat)),
      lon: parseFloat(String(r.lon)),
      type: r.type,
      class: r.class,
      importance: r.importance,
      bbox: r.boundingbox ? r.boundingbox.map(Number) : null,
      address: r.address ?? null,
    })),
    count: data.length,
  };
}

async function toolReverseGeocode(args) {
  const lat = Number(args.lat);
  const lon = Number(args.lon);
  const zoom = Number(args.zoom ?? 18);

  if (isNaN(lat) || isNaN(lon)) throw new Error('Coordonnées invalides');

  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=${zoom}&accept-language=fr&addressdetails=1`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`Nominatim a retourné ${res.status}`);
  const data = await res.json();

  if (data.error) throw new Error(data.error);

  return {
    coordinates: { lat, lon },
    display_name: data.display_name,
    type: data.type,
    class: data.class,
    address: data.address ?? null,
    osm_id: data.osm_id,
    osm_type: data.osm_type,
  };
}

function toolValidateCoords(args) {
  const lat = Number(args.lat);
  const lon = Number(args.lon);
  const suspectedCrs = String(args.suspected_crs ?? 'auto');

  const issues = [];
  let crs = 'inconnu';
  let normalizedLat = lat;
  let normalizedLon = lon;

  // Vérification WGS84
  if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
    crs = 'WGS84 (EPSG:4326)';
  }
  // Vérification Lambert-93 (EPSG:2154) — X: 0-1.3M, Y: 6-8.3M
  else if (suspectedCrs === 'EPSG:2154' || (lon >= 0 && lon <= 1300000 && lat >= 6000000 && lat <= 8300000)) {
    crs = 'Lambert-93 (EPSG:2154) détecté';
    issues.push('Les coordonnées sont en Lambert-93. Conversion vers WGS84 requise via proj4js ou équivalent pour un usage géographique.');
    issues.push('En Lambert-93, les X correspondent aux abscisses (Est) et les Y aux ordonnées (Nord).');
  }
  // Vérification Web Mercator (EPSG:3857)
  else if (suspectedCrs === 'EPSG:3857' || (Math.abs(lon) <= 20037508 && Math.abs(lat) <= 20037508)) {
    crs = 'Web Mercator (EPSG:3857) détecté — conversion vers WGS84';
    normalizedLon = (lon * 180) / 20037508.34;
    normalizedLat = (Math.atan(Math.exp((lat * Math.PI) / 20037508.34)) * 360) / Math.PI - 90;
    issues.push('Conversion Web Mercator → WGS84. Précision suffisante pour la vérification.');
  }
  // Vérification UTM
  else if (Math.abs(lon) >= 100000 && Math.abs(lon) <= 999999 && Math.abs(lat) >= 0 && Math.abs(lat) <= 10000000) {
    crs = 'Possiblement UTM — conversion non implémentée';
    issues.push('Les coordonnées semblent être en UTM. Utilisez un convertisseur dédié (proj4js) pour une conversion précise.');
  }
  else {
    issues.push('Les coordonnées ne correspondent à aucun CRS connu. Vérifiez les valeurs.');
  }

  return {
    input: { lat, lon },
    detected_crs: crs,
    normalized_wgs84: { lat: +normalizedLat.toFixed(6), lon: +normalizedLon.toFixed(6) },
    issues,
    is_valid_wgs84: lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180,
  };
}

function toolComputeBbox(args) {
  let coordinates;

  if (Array.isArray(args.coordinates)) {
    const raw = args.coordinates;
    // Support [[lat,lon], ...] ou GeoJSON avec .coordinates
    if (raw.length > 0 && Array.isArray(raw[0]) && typeof raw[0][0] === 'number') {
      coordinates = raw;
    } else if (raw.length > 0 && raw[0] && raw[0].coordinates) {
      // Nested GeoJSON
      return toolComputeBbox({ coordinates: raw[0].coordinates });
    } else {
      throw new Error('Format de coordonnées non reconnu. Attendu: [[lat, lon], ...]');
    }
  } else {
    throw new Error('Le paramètre "coordinates" doit être un tableau');
  }

  if (coordinates.length < 2) {
    throw new Error('Au moins 2 coordonnées sont nécessaires pour calculer une bbox');
  }

  const lats = coordinates.map((c) => c[0]);
  const lons = coordinates.map((c) => c[1]);

  const south = Math.min(...lats);
  const north = Math.max(...lats);
  const west = Math.min(...lons);
  const east = Math.max(...lons);

  const width = haversineKm(south, west, south, east);
  const height = haversineKm(south, west, north, west);

  return {
    bbox: { south: +south.toFixed(6), west: +west.toFixed(6), north: +north.toFixed(6), east: +east.toFixed(6) },
    center: { lat: +((south + north) / 2).toFixed(6), lon: +((west + east) / 2).toFixed(6) },
    dimensions_km: { width: +width.toFixed(2), height: +height.toFixed(2) },
    point_count: coordinates.length,
  };
}

function toolComputeArea(args) {
  const geojson = args.geojson;
  if (!geojson || typeof geojson !== 'object') throw new Error('GeoJSON requis');

  const type = String(geojson.type ?? '');

  if (type === 'Polygon') {
    const coords = geojson.coordinates;
    const areaKm2 = polygonAreaKm2(coords);
    return {
      type: 'Polygon',
      area_km2: +areaKm2.toFixed(4),
      area_hectares: +(areaKm2 * 100).toFixed(2),
      area_km2_human: areaKm2 >= 1 ? `${areaKm2.toFixed(2)} km²` : `${(areaKm2 * 100).toFixed(2)} ha`,
    };
  }

  if (type === 'MultiPolygon') {
    const polygons = geojson.coordinates;
    let totalKm2 = 0;
    for (const poly of polygons) {
      totalKm2 += polygonAreaKm2(poly);
    }
    return {
      type: 'MultiPolygon',
      polygon_count: polygons.length,
      area_km2: +totalKm2.toFixed(4),
      area_hectares: +(totalKm2 * 100).toFixed(2),
    };
  }

  throw new Error(`Type GeoJSON "${type}" non supporté pour le calcul de superficie. Utilisez Polygon ou MultiPolygon.`);
}

function toolCheckCrs(args) {
  const x = Number(args.x);
  const y = Number(args.y);
  const context = String(args.context ?? '').toLowerCase();

  const candidates = [];

  // WGS84
  if (x >= -180 && x <= 180 && y >= -90 && y <= 90) {
    let confidence = 'moyenne';
    let reason = 'Plage valide WGS84';
    if (context.includes('france') && x >= -5 && x <= 10 && y >= 42 && y <= 52) {
      confidence = 'haute';
      reason = 'Plage WGS84 cohérente avec le contexte géographique (France)';
    }
    candidates.push({ crs: 'WGS84', epsg: 'EPSG:4326', confidence, reason });
  }

  // Lambert-93
  if (x >= 0 && x <= 1300000 && y >= 6000000 && y <= 8300000) {
    candidates.push({
      crs: 'Lambert-93',
      epsg: 'EPSG:2154',
      confidence: context.includes('france') ? 'haute' : 'faible',
      reason: 'Plage Lambert-93 détectée' + (context.includes('france') ? ' (cohérent avec le contexte France)' : ''),
    });
  }

  // Web Mercator
  if (Math.abs(x) <= 20037508 && Math.abs(y) <= 20037508 && (Math.abs(x) > 180 || Math.abs(y) > 90)) {
    candidates.push({
      crs: 'Web Mercator',
      epsg: 'EPSG:3857',
      confidence: 'moyenne',
      reason: 'Plage Web Mercator détectée (valeurs > 180/90)',
    });
  }

  // UTM (zone 30-32 pour la France)
  if (Math.abs(x) >= 100000 && Math.abs(x) <= 999999 && y >= 0 && y <= 10000000) {
    const zone = Math.floor((x + 1800000) / 1000000);
    candidates.push({
      crs: `UTM zone ${zone}`,
      epsg: `EPSG:${32600 + zone}`,
      confidence: 'faible',
      reason: 'Plage UTM possible (vérification manuelle recommandée)',
    });
  }

  if (candidates.length === 0) {
    candidates.push({
      crs: 'inconnu',
      epsg: 'N/A',
      confidence: 'nulle',
      reason: 'Les coordonnées ne correspondent à aucun CRS connu',
    });
  }

  const order = { haute: 0, moyenne: 1, faible: 2, nulle: 3 };
  const sorted = candidates.slice().sort((a, b) => {
    return (order[a.confidence] ?? 4) - (order[b.confidence] ?? 4);
  });

  return {
    input: { x, y },
    context: context || 'non spécifié',
    candidates,
    recommendation: sorted[0],
  };
}

function toolGeojsonValidate(args) {
  const geojson = args.geojson;
  const errors = [];
  const warnings = [];

  if (!geojson || typeof geojson !== 'object') {
    return { valid: false, errors: ['GeoJSON requis (objet)'], warnings: [] };
  }

  // Vérification du type
  const validTypes = ['Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon', 'GeometryCollection', 'Feature', 'FeatureCollection'];
  const type = String(geojson.type ?? '');
  if (!type) {
    errors.push('Propriété "type" manquante');
  } else if (!validTypes.includes(type)) {
    errors.push(`Type "${type}" invalide. Types autorisés: ${validTypes.join(', ')}`);
  }

  // Vérification des coordonnées
  const checkCoords = (coords, depth) => {
    if (depth === undefined) depth = 0;
    if (Array.isArray(coords)) {
      if (coords.length === 0) {
        warnings.push('Tableau de coordonnées vide trouvé');
        return false;
      }
      if (typeof coords[0] === 'number') {
        if (coords.length < 2) {
          errors.push('Les coordonnées doivent avoir au moins 2 éléments (lon, lat)');
          return false;
        }
        const lon = coords[0];
        const lat = coords[1];
        if (typeof lon !== 'number' || typeof lat !== 'number') {
          errors.push('Les coordonnées doivent être des nombres');
          return false;
        }
        if (lon < -180 || lon > 180) warnings.push(`Longitude hors plage WGS84: ${lon}`);
        if (lat < -90 || lat > 90) warnings.push(`Latitude hors plage WGS84: ${lat}`);
        return true;
      }
      return coords.every((c) => checkCoords(c, depth + 1));
    }
    return false;
  };

  if (geojson.coordinates) {
    checkCoords(geojson.coordinates);
  } else if (type === 'Feature' && geojson.geometry) {
    const geom = geojson.geometry;
    if (geom.coordinates) checkCoords(geom.coordinates);
    if (!geom.type) warnings.push('La géométrie du Feature n\'a pas de type');
  } else if (type === 'FeatureCollection' && geojson.features) {
    const features = geojson.features;
    if (!Array.isArray(features)) {
      errors.push('"features" doit être un tableau');
    } else {
      features.forEach((f, i) => {
        if (!f.type) warnings.push(`Feature[${i}] sans type`);
        if (f.geometry && f.geometry.coordinates) {
          checkCoords(f.geometry.coordinates);
        }
      });
    }
  }

  return {
    valid: errors.length === 0,
    type,
    errors,
    warnings,
    summary: errors.length === 0
      ? warnings.length === 0
        ? 'GeoJSON valide'
        : `GeoJSON valide avec ${warnings.length} avertissement(s)`
      : `GeoJSON invalide : ${errors.length} erreur(s), ${warnings.length} avertissement(s)`,
  };
}

async function toolElevation(args) {
  const lat = Number(args.lat);
  const lon = Number(args.lon);

  if (isNaN(lat) || isNaN(lon)) throw new Error('Coordonnées invalides');

  const url = `https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lon}`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`Open Elevation a retourné ${res.status}`);
  const data = await res.json();

  return {
    coordinates: { lat, lon },
    elevation_m: data.elevation ? data.elevation[0] : null,
    source: 'Open-Meteo (SRTM/ERA5)',
  };
}

function toolDistanceBetween(args) {
  const lat1 = Number(args.lat1);
  const lon1 = Number(args.lon1);
  const lat2 = Number(args.lat2);
  const lon2 = Number(args.lon2);

  if ([lat1, lon1, lat2, lon2].some(isNaN)) throw new Error('Toutes les coordonnées sont requises');

  const distanceKm = haversineKm(lat1, lon1, lat2, lon2);

  return {
    point_a: { lat: lat1, lon: lon1 },
    point_b: { lat: lat2, lon: lon2 },
    distance_km: +distanceKm.toFixed(3),
    distance_m: +(distanceKm * 1000).toFixed(1),
    distance_human:
      distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : distanceKm < 100 ? `${distanceKm.toFixed(1)} km` : `${Math.round(distanceKm)} km`,
  };
}

// ─── Routeur d'outils ─────────────────────────────────────────

const TOOL_IMPLEMENTATIONS = {
  geocode: toolGeocode,
  reverse_geocode: toolReverseGeocode,
  validate_coords: toolValidateCoords,
  compute_bbox: toolComputeBbox,
  compute_area: toolComputeArea,
  check_crs: toolCheckCrs,
  geojson_validate: toolGeojsonValidate,
  elevation_query: toolElevation,
  distance_between: toolDistanceBetween,
};

// ─── Réponse JSON helper ──────────────────────────────────────

function jsonRes(res, data, statusCode) {
  const code = statusCode || 200;
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

// ─── Serveur HTTP ─────────────────────────────────────────────

const server = http.createServer((req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // GET / — Page d'information du service
  if (req.method === 'GET' && pathname === '/') {
    jsonRes(res, {
      service: 'geo-mcp-service',
      version: '1.0.0',
      protocol: 'MCP (Model Context Protocol)',
      inspired_by: 'ArcGIS MCP — arcOrama.fr, juillet 2026',
      description: 'Service MCP géographique pour ThesisFrame. Expose des outils de cartographie aux agents IA.',
      endpoints: {
        list_tools: 'GET /mcp/tools',
        call_tool: 'POST /mcp/call',
        health: 'GET /mcp/health',
      },
      tool_count: TOOLS.length,
    });
    return;
  }

  // GET /mcp/health — Vérification santé du service
  if (req.method === 'GET' && pathname === '/mcp/health') {
    jsonRes(res, {
      status: 'ok',
      uptime_ms: process.uptime() * 1000,
      tools_available: TOOLS.length,
    });
    return;
  }

  // GET /mcp/tools — Découverte des outils (conforme MCP)
  if (req.method === 'GET' && pathname === '/mcp/tools') {
    jsonRes(res, {
      protocol: 'mcp',
      version: '1.0',
      tools: TOOLS,
    });
    return;
  }

  // POST /mcp/call — Appel d'un outil MCP
  if (req.method === 'POST' && pathname === '/mcp/call') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', async () => {
      const start = performance.now();
      let toolName = 'unknown';

      try {
        const parsed = JSON.parse(body);
        toolName = String(parsed.tool ?? '');
        const args = parsed.args ?? {};

        if (!toolName) {
          jsonRes(res, {
            tool: 'unknown',
            success: false,
            error: 'Le paramètre "tool" est requis',
            duration_ms: +(performance.now() - start).toFixed(1),
          }, 400);
          return;
        }

        if (toolName === 'list_tools') {
          jsonRes(res, {
            tool: 'list_tools',
            success: true,
            data: TOOLS,
            duration_ms: +(performance.now() - start).toFixed(1),
          });
          return;
        }

        const impl = TOOL_IMPLEMENTATIONS[toolName];
        if (!impl) {
          const available = Object.keys(TOOL_IMPLEMENTATIONS).join(', ');
          jsonRes(res, {
            tool: toolName,
            success: false,
            error: `Outil inconnu: "${toolName}". Outils disponibles: ${available}`,
            duration_ms: +(performance.now() - start).toFixed(1),
          }, 404);
          return;
        }

        const data = await impl(args);
        jsonRes(res, {
          tool: toolName,
          success: true,
          data,
          duration_ms: +(performance.now() - start).toFixed(1),
        });
      } catch (err) {
        jsonRes(res, {
          tool: toolName,
          success: false,
          error: err instanceof Error ? err.message : String(err),
          duration_ms: +(performance.now() - start).toFixed(1),
        }, 500);
      }
    });
    return;
  }

  // POST /mcp/batch — Appel multiple d'outils MCP
  if (req.method === 'POST' && pathname === '/mcp/batch') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body);
        const calls = parsed.calls ?? [];

        const results = await Promise.allSettled(
          calls.map(async ({ tool, args = {} }) => {
            const start = performance.now();
            const impl = TOOL_IMPLEMENTATIONS[tool];
            if (!impl) return { tool, success: false, error: `Outil inconnu: "${tool}"`, duration_ms: performance.now() - start };
            try {
              const data = await impl(args);
              return { tool, success: true, data, duration_ms: +(performance.now() - start).toFixed(1) };
            } catch (err) {
              return { tool, success: false, error: err instanceof Error ? err.message : String(err), duration_ms: +(performance.now() - start).toFixed(1) };
            }
          }),
        );

        jsonRes(res, {
          results: results.map((r) => (r.status === 'fulfilled' ? r.value : { success: false, error: 'Erreur interne' })),
          total: calls.length,
          succeeded: results.filter((r) => r.status === 'fulfilled' && r.value.success).length,
        });
      } catch (err) {
        jsonRes(res, {
          success: false,
          error: err instanceof Error ? err.message : String(err),
        }, 400);
      }
    });
    return;
  }

  // 404 pour toute autre route
  jsonRes(res, { error: 'Route non trouvée', path: pathname }, 404);
});

// ─── Démarrage ────────────────────────────────────────────────

const PORT = 3005;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Geo MCP Service démarré sur le port ${PORT}`);
  console.log(`   Outils disponibles : ${TOOLS.map((t) => t.name).join(', ')}`);
  console.log(`   Découverte MCP     : http://localhost:${PORT}/mcp/tools`);
  console.log(`   Appel outil        : POST http://localhost:${PORT}/mcp/call`);
  console.log(`   Santé              : http://localhost:${PORT}/mcp/health`);
});
