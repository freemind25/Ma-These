// ═══════════════════════════════════════════════════
// ThesisFrame — Resolve AI Config (server-side only)
// Centralized helper for all AI routes to get provider config.
// Priority: httpOnly cookie > _aiConfig body param (backward compat)
//
// DEPRECATION: The _aiConfig body fallback is transitional.
// All new routes should rely on the cookie only.
// Planned removal: v1.10.0 (4 weeks after Phase 1 correction).
// After removal, routes that need provider/model/baseUrl for non-auth
// purposes should use /api/ai-config GET directly.
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
// Module-level flag to log deprecation warning only once per process
let _deprecationLogged = false;

/** @internal */
export function _resetDeprecationFlag() { _deprecationLogged = false; }

export function resolveAiConfig(
  request: Request,
  bodyAiConfig?: unknown
): AiProviderConfig | undefined {
  // Priority 1: httpOnly cookie (secure — key never touched client JS)
  const cookieConfig = getAiConfigFromRequest(request);
  if (cookieConfig?.provider) {
    return cookieConfig;
  }

  // Priority 2: _aiConfig from request body (DEPRECATED — will be removed v1.10.0)
  if (bodyAiConfig && typeof bodyAiConfig === "object") {
    const config = bodyAiConfig as AiProviderConfig;
    if (config.provider) {
      if (!_deprecationLogged) {
        _deprecationLogged = true;
        console.warn(
          "[resolve-ai-config] DEPRECATED: _aiConfig body fallback used. " +
          "The httpOnly cookie is the primary source. " +
          "This fallback will be removed in v1.10.0."
        );
      }
      return config;
    }
  }

  return undefined;
}
