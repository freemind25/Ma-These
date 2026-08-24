// ═══════════════════════════════════════════════════════════════
// Ma Thèse — /api/ai-keys
// Returns which providers have hardcoded keys (masked for safety).
// This lets the UI show "Clé pré-configurée" badges.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import {
  HARDCODED_KEYS,
  maskKey,
} from "@/lib/ai/hardcoded-keys";
import { getProviderLabel } from "@/lib/ai/ai-types";

export async function GET() {
  const providers = Object.entries(HARDCODED_KEYS).map(
    ([providerId, rawKey]) => ({
      provider: providerId,
      label: getProviderLabel(providerId as keyof typeof HARDCODED_KEYS),
      maskedKey: maskKey(rawKey),
      hasKey: true,
    })
  );

  return NextResponse.json({
    providers,
    total: providers.length,
  });
}
