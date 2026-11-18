// ═══════════════════════════════════════════════════════════════
// Ma Thèse — /api/datalab/config
// Gère la clé API Datalab dans un cookie httpOnly (la clé ne touche
// jamais le JS client). GET : présence + clé masquée ; POST : enregistre ;
// DELETE : supprime. Fallback machine : env DATALAB_API_KEY.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import {
  DATALAB_CONFIG_COOKIE_NAME,
  serializeDatalabConfigCookie,
  stripDatalabApiKey,
  datalabCookieOptions,
  getDatalabConfigFromRequest,
} from "@/lib/datalab/config";

// ═══════════════════════════════════════
// GET — présence de clé (cookie ou env) + clé masquée
// ═══════════════════════════════════════
export async function GET(request: NextRequest) {
  const cookieConfig = getDatalabConfigFromRequest(request);
  if (cookieConfig) {
    return NextResponse.json({ data: { ...stripDatalabApiKey(cookieConfig), source: "cookie" } });
  }
  const envKey = process.env.DATALAB_API_KEY?.trim();
  if (envKey) {
    return NextResponse.json({
      data: { ...stripDatalabApiKey({ apiKey: envKey }), source: "env" },
    });
  }
  return NextResponse.json({ data: { hasApiKey: false, maskedKey: null, source: null } });
}

// ═══════════════════════════════════════
// POST — enregistre la clé dans le cookie httpOnly
// ═══════════════════════════════════════
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = z.object({ apiKey: z.string().min(8, "Clé trop courte").max(200) }).parse(body);

    const config = { apiKey: validated.apiKey.trim() };
    const cookieValue = serializeDatalabConfigCookie(config);
    const options = datalabCookieOptions(request);

    const response = NextResponse.json({ data: stripDatalabApiKey(config) });
    response.cookies.set(DATALAB_CONFIG_COOKIE_NAME, cookieValue, options);
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Clé Datalab invalide", details: z.flattenError(error) },
        { status: 400 }
      );
    }
    console.error("[POST /api/datalab/config] Error:", error);
    return NextResponse.json({ error: "Erreur lors de l'enregistrement de la clé" }, { status: 500 });
  }
}

// ═══════════════════════════════════════
// DELETE — efface le cookie (la clé env, si présente, reste active)
// ═══════════════════════════════════════
export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ data: { deleted: true } });
  response.cookies.set(DATALAB_CONFIG_COOKIE_NAME, "", { ...datalabCookieOptions(request), maxAge: 0 });
  return response;
}
