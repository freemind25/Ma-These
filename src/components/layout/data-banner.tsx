// ═══════════════════════════════════════════════════════════════
// ThesisFrame — D4 Data Transparency Banner
// Shows once per browser when provider ≠ zai.
// Dismissed state persisted in localStorage.
// ═══════════════════════════════════════════════════════════════

"use client";

import { useState } from "react";
import { Info, X } from "lucide-react";
import { getProviderLabel } from "@/lib/ai/ai-types";
import type { AiProviderId } from "@/lib/ai/ai-types";

const DISMISSED_KEY = "thesisframe-d4-banner-dismissed";
const LEGACY_CONFIG_KEY = "thesisframe-ai-config";

/**
 * Read the provider from localStorage synchronously on mount.
 * This handles the case where the server config hasn't loaded yet
 * but localStorage already has a non-zai provider configured.
 */
function getInitialProvider(externalProvider: AiProviderId): AiProviderId {
  // If the external provider is already non-zai, use it directly
  if (externalProvider !== "zai") return externalProvider;
  // Otherwise check localStorage for a persisted config
  try {
    const raw = localStorage.getItem(LEGACY_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.provider && parsed.provider !== "zai") {
        return parsed.provider as AiProviderId;
      }
    }
  } catch { /* ignore */ }
  return "zai";
}

export function DataBanner({
  provider,
}: {
  provider: AiProviderId;
}) {
  const effectiveProvider = getInitialProvider(provider);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(DISMISSED_KEY) === "true";
  });

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISSED_KEY, "true");
  };

  if (effectiveProvider === "zai" || dismissed) return null;

  const providerLabel = getProviderLabel(effectiveProvider);

  return (
    <div className="border-b border-border/60 bg-muted/40 px-4 py-2.5">
      <div className="mx-auto flex max-w-5xl items-start gap-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          Vos textes sont envoyés à{" "}
          <span className="font-medium text-foreground">{providerLabel}</span>{" "}
          pour traitement. Votre clé API est stockée côté serveur (cookie sécurisé).
          Aucune sauvegarde de vos contenus par ThesisFrame.
        </p>
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Fermer le bandeau d'information"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
