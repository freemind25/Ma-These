// ═══════════════════════════════════════════════════
// ThesisFrame — Resolve AI Config (server-side only)
// Centralized helper for all AI routes to get provider config.
// Priority: httpOnly cookie > _aiConfig body param (backward compat)
// ═══════════════════════════════════════════════════

import { type AiProviderConfig } from "./ai-types";
import { getAiConfigFromRequest } from "./config-cookie";

/**
 * Resolve the AI provider config for a request.
 * Reads from httpOnly cookie first (secure), falls back to
 * `_aiConfig` body param for backward compatibility.
 *
 * Usage in routes:
 *   const providerConfig = resolveAiConfig(request, validated._aiConfig);
 */
export function resolveAiConfig(
  request: Request,
  bodyAiConfig?: unknown
): AiProviderConfig | undefined {
  // Priority 1: httpOnly cookie (secure — key never touched client JS)
  const cookieConfig = getAiConfigFromRequest(request);
  if (cookieConfig?.provider) {
    return cookieConfig;
  }

  // Priority 2: _aiConfig from request body (legacy — will be removed)
  if (bodyAiConfig && typeof bodyAiConfig === "object") {
    const config = bodyAiConfig as AiProviderConfig;
    if (config.provider) return config;
  }

  return undefined;
}
