// ═══════════════════════════════════════════════════════════════
// ThesisFrame — /api/ai-config
// Manages AI provider config in an httpOnly cookie (API key security).
// The API key is stored server-side only — it never touches client JS.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { type AiProviderConfig } from "@/lib/ai/ai-types";
import {
  AI_CONFIG_COOKIE_NAME,
  parseConfigCookie,
  serializeConfigCookie,
  stripApiKey,
  getCookieOptions,
  getAiConfigFromRequest,
} from "@/lib/ai/config-cookie";

const configSchema = z.object({
  provider: z.string().min(1),
  apiKey: z.string().optional(),
  model: z.string().optional(),
  baseUrl: z.string().optional(),
});

// ═══════════════════════════════════════
// GET /api/ai-config — Return non-sensitive config
// Used by the frontend to display current provider/model selection
// ═══════════════════════════════════════
export async function GET(request: NextRequest) {
  const isDesktop = process.env.TAURI === "true";
  const config = getAiConfigFromRequest(request);
  if (!config) {
    return NextResponse.json({ data: { provider: "zai", hasApiKey: false, isDesktop } });
  }
  return NextResponse.json({ data: { ...stripApiKey(config), isDesktop } });
}

// ═══════════════════════════════════════
// POST /api/ai-config — Save config to httpOnly cookie
// The API key is stored ONLY in the cookie, never in localStorage.
// ═══════════════════════════════════════
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = configSchema.parse(body);

    const config: AiProviderConfig = {
      provider: validated.provider as AiProviderConfig["provider"],
      apiKey: validated.apiKey,
      model: validated.model,
      baseUrl: validated.baseUrl,
    };

    const cookieValue = serializeConfigCookie(config);
    const options = getCookieOptions(request);

    const response = NextResponse.json({
      data: stripApiKey(config),
    });

    response.cookies.set(AI_CONFIG_COOKIE_NAME, cookieValue, options);
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Configuration invalide", details: error.flatten() },
        { status: 400 }
      );
    }
    console.error("[POST /api/ai-config] Error:", error);
    return NextResponse.json({ error: "Erreur lors de la sauvegarde" }, { status: 500 });
  }
}

// ═══════════════════════════════════════
// DELETE /api/ai-config — Clear the config cookie
// ═══════════════════════════════════════
export async function DELETE() {
  const response = NextResponse.json({ data: { provider: "zai", hasApiKey: false } });
  response.cookies.delete(AI_CONFIG_COOKIE_NAME);
  return response;
}
