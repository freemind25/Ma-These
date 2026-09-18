// ═══════════════════════════════════════════════════════════════
// GET  /api/core/search?q=...&limit=...&offset=...
// POST /api/core/search  { query, limit?, offset? }
// Proxy vers l'API CORE.ac.uk v3 (open access research papers)
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import {
  searchWorks,
  coreWorkToSummary,
} from "@/lib/core-api";
import { z } from "zod/v4";

// ── Schemas ───────────────────────────────────────────────────

const searchSchema = z.object({
  query: z.string().min(2, "La requête doit contenir au moins 2 caractères"),
  limit: z.number().min(1).max(100).optional().default(10),
  offset: z.number().min(0).optional().default(0),
});

// ── GET: search via query params ──────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = searchSchema.safeParse({
      query: searchParams.get("q") || "",
      limit: searchParams.has("limit")
        ? Number(searchParams.get("limit"))
        : undefined,
      offset: searchParams.has("offset")
        ? Number(searchParams.get("offset"))
        : undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Paramètres invalides", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { query, limit, offset } = parsed.data;
    const results = await searchWorks(query, limit, offset);

    // Return compact summaries to reduce payload
    return NextResponse.json({
      totalHits: results.totalHits,
      limit: results.limit,
      offset: results.offset,
      results: results.results.map(coreWorkToSummary),
    });
  } catch (error) {
    console.error("[GET /api/core/search] Error:", error);
    const message =
      error instanceof Error ? error.message : "Erreur lors de la recherche CORE";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── POST: search via JSON body ────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = searchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { query, limit, offset } = parsed.data;
    const results = await searchWorks(query, limit, offset);

    return NextResponse.json({
      totalHits: results.totalHits,
      limit: results.limit,
      offset: results.offset,
      results: results.results.map(coreWorkToSummary),
    });
  } catch (error) {
    console.error("[POST /api/core/search] Error:", error);
    const message =
      error instanceof Error ? error.message : "Erreur lors de la recherche CORE";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
