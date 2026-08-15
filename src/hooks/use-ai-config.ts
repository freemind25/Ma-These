// ═══════════════════════════════════════
// ThesisFrame — useAiConfig hook
// Reads saved AI provider config from localStorage
// Modules pass it to API routes so server-side code knows the backend
// ═══════════════════════════════════════

"use client";

import { useSyncExternalStore, useCallback } from "react";
import { type AiProviderConfig } from "@/lib/ai/ai-types";

const STORAGE_KEY = "thesisframe-ai-config";

const DEFAULT_CONFIG: AiProviderConfig = { provider: "zai" };

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot(): AiProviderConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AiProviderConfig;
      if (parsed.provider) return parsed;
    }
  } catch { /* ignore */ }
  return DEFAULT_CONFIG;
}

export function useAiConfig() {
  const config = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  /**
   * Merge the saved AI config into any request body sent to an API route.
   * Usage: fetch("/api/ai-writing", { body: JSON.stringify(withAiConfig({ mode, prompt })) })
   */
  const withAiConfig = useCallback(
    <T extends Record<string, unknown>>(body: T): T & { _aiConfig: AiProviderConfig } => {
      return { ...body, _aiConfig: config };
    },
    [config]
  );

  return { aiConfig: config, withAiConfig };
}
