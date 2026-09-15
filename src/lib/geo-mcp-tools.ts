/**
 * geo-mcp-tools — Outils MCP géographiques intégrés (sans service externe)
 *
 * Inspiré de l'intégration MCP d'ArcGIS (arcOrama, juil. 2026).
 * Les outils sont exécutés directement dans le processus Next.js.
 */

// ─── Types ───────────────────────────────────────────────────

export interface McpTool {
  name: string;
  description: string;
  inputSchema: { type: 'object'; properties: Record<string, unknown>; required?: string[] };
}

export interface McpToolResult {
  tool: string;
  success: boolean;
  data?: unknown;
  error?: string;
  duration_ms: number;
}

// ─── Registre des outils MCP ─────────────────────────────────

export const GEO_MCP_TOOLS: McpTool[] = [
  {
    name: 'geocode',
    description: 'Transforme une adresse ou un toponyme en coordonnées (Nominatim/OSM).',
    inputSchema: { type: 'object', properties: { query: { type: 'string', description: 'Adresse ou toponyme' }, limit: { type: 'number' }, lang: { type: 'string' } }, required: ['query'] },
  },
  {
    name: 'reverse_geocode',
    description: 'Identifie une adresse à partir de coordonnées géographiques.',
    inputSchema: { type: 'object', properties: { lat: { type: 'number' }, lon: { type: 'number' }, zoom: { type: 'number' } }, required: ['lat', 'lon'] },
  },
  {
    name: 'validate_coords',
    description: 'Valide des coordonnées et détecte le CRS (WGS84, Lambert-93, Web Mercator, UTM).',
    inputSchema: { type: 'object', properties: { lat: { type: 'number' }, lon: { type: 'number' }, suspected_crs: { type: 'string' } }, required: ['lat', 'lon'] },
  },
  {
    name: 'compute_bbox',
    description: "Calcule la bounding box d'un ensemble de coordonnées.",
    inputSchema: { type: 'object', properties: { coordinates: { type: 'array', description: '[[lat, lon], ...]' } }, required: ['coordinates'] },
  },
  {
    name: 'compute_area',
    description: 'Calcule la superficie (km²/ha) d\'un polygone GeoJSON.',
    inputSchema: { type: 'object', properties: { geojson: { type: 'object', description: 'GeoJSON Polygon/MultiPolygon' } }, required: ['geojson'] },
  },
  {
    name: 'check_crs',
    description: 'Analyse des coordonnées pour détecter le CRS probable.',
    inputSchema: { type: 'object', properties: { x: { type: 'number' }, y: { type: 'number' }, context: { type: 'string' } }, required: ['x', 'y'] },
  },
  {
    name: 'geojson_validate',
    description: 'Valide la structure d\'un objet GeoJSON (RFC 7946).',
    inputSchema: { type: 'object', properties: { geojson: { type: 'object' } }, required: ['geojson'] },
  },
  {
    name: 'elevation_query',
    description: "Obtient l'altitude d'un point (Open-Meteo/SRTM).",
    inputSchema: { type: 'object', properties: { lat: { type: 'number' }, lon: { type: 'number' } }, required: ['lat', 'lon'] },
  },
  {
    name: 'distance_between',
    description: 'Calcule la distance orthodromique entre deux points (km).',
    inputSchema: { type: 'object', properties: { lat1: { type: 'number' }, lon1: { type: 'number' }, lat2: { type: 'number' }, lon2: { type: 'number' } }, required: ['lat1', 'lon1', 'lat2', 'lon2'] },
  },
];

// ─── Helpers ─────────────────────────────────────────────────

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function polygonAreaKm2(coords: number[][][]): number {
  let area = 0;
  const ring = coords[0];
  const n = ring.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const lat1 = (ring[i][1] * Math.PI) / 180, lat2 = (ring[j][1] * Math.PI) / 180;
    const dLon = ((ring[j][0] - ring[i][0]) * Math.PI) / 180;
    area += dLon * (2 + Math.sin(lat1) + Math.sin(lat2));
  }
  return Math.abs((area * 6371 * 6371) / 2);
}

// ─── Tool implementations ─────────────────────────────────────

async function toolGeocode(args: Record<string, unknown>) {
  const query = String(args.query ?? '');
  const limit = Math.min(Math.max(Number(args.limit ?? 1), 1), 5);
  const lang = String(args.lang ?? 'fr');
  if (!query.trim()) throw new Error('"query" requis');
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=${limit}&accept-language=${lang}&addressdetails=1`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'ThesisFrame-GeoMCP/1.0' } });
    if (!res.ok) throw new Error(`Nominatim ${res.status}`);
    const data = await res.json();
    return {
      query, results: data.map((r: Record<string, unknown>) => ({
        display_name: r.display_name, lat: parseFloat(String(r.lat)), lon: parseFloat(String(r.lon)),
        type: r.type, class: r.class, importance: r.importance,
        bbox: r.boundingbox ? (r.boundingbox as string[]).map(Number) : null, address: r.address ?? null,
      })), count: data.length,
    };
  } finally { clearTimeout(timer); }
}

async function toolReverseGeocode(args: Record<string, unknown>) {
  const lat = Number(args.lat), lon = Number(args.lon), zoom = Number(args.zoom ?? 18);
 if (isNaN(lat) || isNaN(lon)) throw new Error('Coordonnées invalides');
  const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=${zoom}&accept-language=fr&addressdetails=1`,
      { signal: ctrl.signal, headers: { 'User-Agent': 'ThesisFrame-GeoMCP/1.0' } });
    if (!res.ok) throw new Error(`Nominatim ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return { coordinates: { lat, lon }, display_name: data.display_name, type: data.type, class: data.class, address: data.address ?? null };
  } finally { clearTimeout(timer); }
}

function toolValidateCoords(args: Record<string, unknown>) {
  const lat = Number(args.lat), lon = Number(args.lon);
  const suspectedCrs = String(args.suspected_crs ?? 'auto');
  const issues: string[] = []; let crs = 'inconnu';
  if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) { crs = 'WGS84 (EPSG:4326)'; }
  else if (suspectedCrs === 'EPSG:2154' || (lon >= 0 && lon <= 1300000 && lat >= 6000000 && lat <= 8300000)) {
    crs = 'Lambert-93 (EPSG:2154) détecté';
    issues.push('Les coordonnées sont en Lambert-93. Conversion vers WGS84 requise via proj4js.');
  }
  else if (suspectedCrs === 'EPSG:3857' || (Math.abs(lon) <= 20037508 && Math.abs(lat) <= 20037508)) {
    crs = 'Web Mercator (EPSG:3857) détecté';
    issues.push('Conversion Web Mercator → WGS84 nécessaire.');
  }
  return { input: { lat, lon }, detected_crs: crs, issues, is_valid_wgs84: lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180 };
}

function toolComputeBbox(args: Record<string, unknown>) {
  const raw = args.coordinates as unknown[];
  if (!Array.isArray(raw) || raw.length < 2) throw new Error('Au moins 2 coordonnées requises');
  const coordinates = raw.map((c) => c as number[]);
  const lats = coordinates.map((c) => c[0]), lons = coordinates.map((c) => c[1]);
  const south = Math.min(...lats), north = Math.max(...lats), west = Math.min(...lons), east = Math.max(...lons);
  return {
    bbox: { south: +south.toFixed(6), west: +west.toFixed(6), north: +north.toFixed(6), east: +east.toFixed(6) },
    center: { lat: +((south + north) / 2).toFixed(6), lon: +((west + east) / 2).toFixed(6) },
    dimensions_km: { width: +haversineKm(south, west, south, east).toFixed(2), height: +haversineKm(south, west, north, west).toFixed(2) },
    point_count: coordinates.length,
  };
}

function toolComputeArea(args: Record<string, unknown>) {
  const geojson = args.geojson as Record<string, unknown>;
  if (!geojson) throw new Error('GeoJSON requis');
  const type = String(geojson.type ?? '');
  if (type === 'Polygon') {
    const a = polygonAreaKm2(geojson.coordinates as number[][][]);
    return { type, area_km2: +a.toFixed(4), area_hectares: +(a * 100).toFixed(2), area_km2_human: a >= 1 ? `${a.toFixed(2)} km²` : `${(a * 100).toFixed(2)} ha` };
  }
  if (type === 'MultiPolygon') {
    const polys = geojson.coordinates as number[][][][];
    let total = 0; for (const p of polys) total += polygonAreaKm2(p);
    return { type, polygon_count: polys.length, area_km2: +total.toFixed(4), area_hectares: +(total * 100).toFixed(2) };
  }
  throw new Error(`Type "${type}" non supporté`);
}

function toolCheckCrs(args: Record<string, unknown>) {
  const x = Number(args.x), y = Number(args.y), context = String(args.context ?? '').toLowerCase();
  const candidates: { crs: string; epsg: string; confidence: string; reason: string }[] = [];
  if (x >= -180 && x <= 180 && y >= -90 && y <= 90) {
    let confidence = 'moyenne', reason = 'Plage valide WGS84';
    if (context.includes('france') && x >= -5 && x <= 10 && y >= 42 && y <= 52) { confidence = 'haute'; reason = 'Plage WGS84 cohérente avec la France'; }
    candidates.push({ crs: 'WGS84', epsg: 'EPSG:4326', confidence, reason });
  }
  if (x >= 0 && x <= 1300000 && y >= 6000000 && y <= 8300000) {
    candidates.push({ crs: 'Lambert-93', epsg: 'EPSG:2154', confidence: context.includes('france') ? 'haute' : 'faible', reason: 'Plage Lambert-93' });
  }
  if (Math.abs(x) <= 20037508 && Math.abs(y) <= 20037508 && (Math.abs(x) > 180 || Math.abs(y) > 90)) {
    candidates.push({ crs: 'Web Mercator', epsg: 'EPSG:3857', confidence: 'moyenne', reason: 'Plage Web Mercator' });
  }
  if (candidates.length === 0) candidates.push({ crs: 'inconnu', epsg: 'N/A', confidence: 'nulle', reason: 'CRS non reconnu' });
  return { input: { x, y }, context: context || 'non spécifié', candidates, recommendation: candidates.sort((a, b) => ({ haute: 0, moyenne: 1, faible: 2, nulle: 3 } as Record<string, number>)[a.confidence] - ({ haute: 0, moyenne: 1, faible: 2, nulle: 3 } as Record<string, number>)[b.confidence])[0] };
}

function toolGeojsonValidate(args: Record<string, unknown>) {
  const geojson = args.geojson as Record<string, unknown>;
  const errors: string[] = [], warnings: string[] = [];
  if (!geojson) return { valid: false, errors: ['GeoJSON requis'], warnings: [] };
  const validTypes = ['Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon', 'GeometryCollection', 'Feature', 'FeatureCollection'];
  const type = String(geojson.type ?? '');
  if (!type) errors.push('Propriété "type" manquante');
  else if (!validTypes.includes(type)) errors.push(`Type "${type}" invalide`);
  const checkCoords = (coords: unknown): boolean => {
    if (!Array.isArray(coords)) return false;
    if (typeof coords[0] === 'number') {
      if (coords.length < 2) { errors.push('Coordonnées incomplètes'); return false; }
      if (coords[0] < -180 || coords[0] > 180) warnings.push(`Longitude hors plage: ${coords[0]}`);
      if (coords[1] < -90 || coords[1] > 90) warnings.push(`Latitude hors plage: ${coords[1]}`);
      return true;
    }
    return coords.every(c => checkCoords(c));
  };
  if (geojson.coordinates) checkCoords(geojson.coordinates);
  else if (type === 'Feature' && (geojson as Record<string, unknown>).geometry) {
    const geom = (geojson as Record<string, unknown>).geometry as Record<string, unknown>;
    if (geom.coordinates) checkCoords(geom.coordinates);
  }
  return { valid: errors.length === 0, type, errors, warnings, summary: errors.length === 0 ? (warnings.length ? `${warnings.length} avertissement(s)` : 'GeoJSON valide') : `${errors.length} erreur(s)` };
}

async function toolElevation(args: Record<string, unknown>) {
  const lat = Number(args.lat), lon = Number(args.lon);
  if (isNaN(lat) || isNaN(lon)) throw new Error('Coordonnées invalides');
  const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lon}`, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`Elevation ${res.status}`);
    const data = await res.json();
    return { coordinates: { lat, lon }, elevation_m: data.elevation?.[0] ?? null, source: 'Open-Meteo (SRTM/ERA5)' };
  } finally { clearTimeout(timer); }
}

function toolDistanceBetween(args: Record<string, unknown>) {
  const lat1 = Number(args.lat1), lon1 = Number(args.lon1), lat2 = Number(args.lat2), lon2 = Number(args.lon2);
  if ([lat1, lon1, lat2, lon2].some(isNaN)) throw new Error('Coordonnées requises');
  const d = haversineKm(lat1, lon1, lat2, lon2);
  return { point_a: { lat: lat1, lon: lon1 }, point_b: { lat: lat2, lon: lon2 }, distance_km: +d.toFixed(3), distance_m: +(d * 1000).toFixed(1), distance_human: d < 1 ? `${Math.round(d * 1000)} m` : d < 100 ? `${d.toFixed(1)} km` : `${Math.round(d)} km` };
}

// ─── Dispatch ─────────────────────────────────────────────────

const IMPLEMENTATIONS: Record<string, (args: Record<string, unknown>) => Promise<unknown> | unknown> = {
  geocode: toolGeocode, reverse_geocode: toolReverseGeocode, validate_coords: toolValidateCoords,
  compute_bbox: toolComputeBbox, compute_area: toolComputeArea, check_crs: toolCheckCrs,
  geojson_validate: toolGeojsonValidate, elevation_query: toolElevation, distance_between: toolDistanceBetween,
};

/**
 * Appeler un outil MCP par nom
 */
export async function callGeoMcpTool(toolName: string, args: Record<string, unknown> = {}): Promise<McpToolResult> {
  const start = performance.now();
  try {
    const impl = IMPLEMENTATIONS[toolName];
    if (!impl) return { tool: toolName, success: false, error: `Outil inconnu: "${toolName}"`, duration_ms: performance.now() - start };
    const data = await impl(args);
    return { tool: toolName, success: true, data, duration_ms: +(performance.now() - start).toFixed(1) };
  } catch (err) {
    return { tool: toolName, success: false, error: err instanceof Error ? err.message : String(err), duration_ms: +(performance.now() - start).toFixed(1) };
  }
}

// ─── Fonctions de haut niveau ──────────────────────────────────

export async function geocodeForContext(query: string): Promise<string | null> {
  try {
    const r = await callGeoMcpTool('geocode', { query });
    if (!r.success || !r.data) return null;
    const d = r.data as { results: Array<{ display_name: string; lat: number; lon: number; type: string; bbox: number[] | null }> };
    if (!d.results.length) return null;
    const x = d.results[0];
    return `Géocodage de "${query}": (${x.lat}, ${x.lon}), type: ${x.type}`;
  } catch { return null; }
}

export async function validateCoordsForContext(lat: number, lon: number): Promise<string | null> {
  try {
    const r = await callGeoMcpTool('validate_coords', { lat, lon });
    if (!r.success || !r.data) return null;
    const d = r.data as { detected_crs: string; is_valid_wgs84: boolean; issues: string[] };
    return `Coordonnées (${lat}, ${lon}): ${d.detected_crs}, WGS84=${d.is_valid_wgs84}${d.issues.length ? ' — ' + d.issues.join('; ') : ''}`;
  } catch { return null; }
}

export async function distanceForContext(lat1: number, lon1: number, lat2: number, lon2: number): Promise<string | null> {
  try {
    const r = await callGeoMcpTool('distance_between', { lat1, lon1, lat2, lon2 });
    if (!r.success || !r.data) return null;
    return `Distance: ${(r.data as { distance_human: string }).distance_human}`;
  } catch { return null; }
}

export async function areaForContext(geojson: Record<string, unknown>): Promise<string | null> {
  try {
    const r = await callGeoMcpTool('compute_area', { geojson });
    if (!r.success || !r.data) return null;
    return `Superficie: ${(r.data as { area_km2_human: string }).area_km2_human}`;
  } catch { return null; }
}

export async function elevationForContext(lat: number, lon: number): Promise<string | null> {
  try {
    const r = await callGeoMcpTool('elevation_query', { lat, lon });
    if (!r.success || !r.data) return null;
    const e = (r.data as { elevation_m: number | null }).elevation_m;
    return e === null ? null : `Altitude: ${Math.round(e)} m`;
  } catch { return null; }
}

export async function validateGeojsonForContext(geojson: Record<string, unknown>): Promise<string | null> {
  try {
    const r = await callGeoMcpTool('geojson_validate', { geojson });
    if (!r.success || !r.data) return null;
    const d = r.data as { summary: string; warnings: string[]; errors: string[] };
    return d.summary + (d.warnings.length ? ' — ' + d.warnings.join('; ') : '') + (d.errors.length ? ' — ' + d.errors.join('; ') : '');
  } catch { return null; }
}

export async function bboxForContext(coordinates: number[][]): Promise<string | null> {
  try {
    const r = await callGeoMcpTool('compute_bbox', { coordinates });
    if (!r.success || !r.data) return null;
    const d = r.data as { center: { lat: number; lon: number }; dimensions_km: { width: number; height: number }; bbox: { south: number; west: number; north: number; east: number } };
    return `Centre (${d.center.lat}, ${d.center.lon}), ${d.dimensions_km.width}×${d.dimensions_km.height} km`;
  } catch { return null; }
}
