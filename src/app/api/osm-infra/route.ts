import { NextRequest, NextResponse } from "next/server";
import {
  ASSET_TYPE_MAP,
  INFRA_CATEGORIES,
  buildOverpassQuery,
  executeOverpassQuery,
  parseInfraQuery,
  geocodeLocation,
  type InfraResult,
} from "@/lib/osm-infra";

/* ═══════════════════════════════════════════════════════════════
   GET — List available categories and types
   ═══════════════════════════════════════════════════════════════ */

export async function GET() {
  try {
    // Build simplified type list
    const types = Object.entries(ASSET_TYPE_MAP).map(([key, def]) => ({
      key,
      label: def.label,
      category: def.category,
    }));

    return NextResponse.json({
      categories: INFRA_CATEGORIES,
      types,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

/* ═══════════════════════════════════════════════════════════════
   POST — Execute OSM infrastructure search
   ═══════════════════════════════════════════════════════════════ */

interface PostBody {
  query?: string;
  type?: string;
  location?: string;
  radius?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: PostBody = await request.json();

    // Step 1: Parse the query
    let type = body.type || null;
    let location = body.location || null;
    let radius = body.radius || 5;
    const rawQuery = body.query || "";

    if (rawQuery) {
      const parsed = parseInfraQuery(rawQuery);
      if (!type && parsed.type) type = parsed.type;
      if (!location && parsed.location) location = parsed.location;
      if (parsed.radius !== 5) radius = parsed.radius;
    }

    if (!type) {
      return NextResponse.json(
        {
          error:
            "Type d'infrastructure non reconnu. Essayez par exemple : hôpitaux, écoles, gares...",
        },
        { status: 400 }
      );
    }

    // Validate type exists
    if (!ASSET_TYPE_MAP[type]) {
      return NextResponse.json(
        { error: `Type d'infrastructure inconnu : ${type}` },
        { status: 400 }
      );
    }

    if (!location) {
      return NextResponse.json(
        {
          error:
            "Lieu non reconnu. Essayez par exemple : hôpitaux à Paris, écoles près de Lyon...",
        },
        { status: 400 }
      );
    }

    // Step 2: Geocode the location
    const geo = await geocodeLocation(location);
    if (!geo) {
      return NextResponse.json(
        { error: `Impossible de géolocaliser : ${location}` },
        { status: 404 }
      );
    }

    // Step 3: Build bbox from location + radius
    // Convert km to degrees (approximate: 1 km ≈ 0.009°)
    const latDelta = (radius / 111);
    const lonDelta = (radius / (111 * Math.cos((geo.lat * Math.PI) / 180)));

    const bbox: [number, number, number, number] = [
      geo.lat - latDelta, // south
      geo.lon - lonDelta, // west
      geo.lat + latDelta, // north
      geo.lon + lonDelta, // east
    ];

    // Step 4: Build and execute Overpass query
    const query = buildOverpassQuery(type, bbox);
    const results: InfraResult[] = await executeOverpassQuery(query);

    // Step 5: Return results
    return NextResponse.json({
      data: results,
      meta: {
        count: results.length,
        query: rawQuery || `${type} in ${location}`,
        bounds: {
          west: bbox[1],
          south: bbox[0],
          east: bbox[3],
          north: bbox[2],
        },
        geocode: {
          lat: geo.lat,
          lon: geo.lon,
          location: location,
        },
        type: ASSET_TYPE_MAP[type]?.label || type,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur interne du serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
