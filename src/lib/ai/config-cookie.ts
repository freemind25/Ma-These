// ═══════════════════════════════════════════════════
// ThesisFrame — AI Config Cookie Helpers (server-side only)
// Manages httpOnly cookie for AI provider config (API key security)
// The API key NEVER touches client-side JavaScript.
// ═══════════════════════════════════════════════════

import { type AiProviderConfig } from "./ai-types";

export const AI_CONFIG_COOKIE_NAME = "thesisframe-ai-config";

/**
 * Parse AI config from the httpOnly cookie value.
 * Cookie value is base64-encoded JSON.
 */
export function parseConfigCookie(cookieValue: string | undefined): AiProviderConfig | null {
  if (!cookieValue) return null;
  try {
    const json = Buffer.from(cookieValue, "base64").toString("utf-8");
    const parsed = JSON.parse(json) as AiProviderConfig;
    if (parsed.provider) return parsed;
  } catch {
    // Cookie corrupted — ignore
  }
  return null;
}

/**
 * Serialize AI config into a base64 cookie value.
 */
export function serializeConfigCookie(config: AiProviderConfig): string {
  return Buffer.from(JSON.stringify(config), "utf-8").toString("base64");
}

/**
 * Strip the API key from a config (for sending back to client).
 */
export function stripApiKey(config: AiProviderConfig): Omit<AiProviderConfig, "apiKey"> & { hasApiKey: boolean } {
  const { apiKey: _, ...rest } = config;
  return {
    ...rest,
    hasApiKey: !!config.apiKey,
  };
}

/**
 * Read AI config from a NextRequest's cookies.
 */
export function getAiConfigFromRequest(request: Request): AiProviderConfig | null {
  // Read cookie from the request
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${AI_CONFIG_COOKIE_NAME}=`));

  if (!match) return null;
  const value = match.substring(AI_CONFIG_COOKIE_NAME.length + 1);
  return parseConfigCookie(decodeURIComponent(value));
}

/**
 * Cookie options for setting the AI config cookie.
 */
export function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  };
}
