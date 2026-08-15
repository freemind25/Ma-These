// ═══════════════════════════════════════
// ThesisFrame — useAiConfig hook
// Reads saved AI provider config from localStorage
// Modules pass it to API routes so server-side code knows the backend
// ═══════════════════════════════════════

"use client";

import { useSyncExternalStore, useCallback, useState, useEffect } from "react";
import { type AiProviderConfig } from "@/lib/ai/ai-types";

const STORAGE_KEY = "thesisframe-ai-config";

const DEFAULT_CONFIG: AiProviderConfig = { provider: "zai" };

// ═══════════════════════════════════════
// Cached snapshot for useSyncExternalStore
// useSyncExternalStore requires getSnapshot to return
// referentially stable values when the store hasn't changed.
// Without caching, JSON.parse creates a new object every call,
// causing React to re-render infinitely.
// ═══════════════════════════════════════

let cachedRawValue: string | null | undefined = undefined; // undefined = not yet cached
let cachedConfig: AiProviderConfig = DEFAULT_CONFIG;

function getSnapshot(): AiProviderConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    // Return cached config if the raw string hasn't changed
    if (raw === cachedRawValue) return cachedConfig;
    cachedRawValue = raw;
    if (raw) {
      const parsed = JSON.parse(raw) as AiProviderConfig;
      cachedConfig = parsed.provider ? parsed : DEFAULT_CONFIG;
    } else {
      cachedConfig = DEFAULT_CONFIG;
    }
  } catch {
    cachedConfig = DEFAULT_CONFIG;
  }
  return cachedConfig;
}

// Server-side snapshot: localStorage doesn't exist on server
function getServerSnapshot(): AiProviderConfig {
  return DEFAULT_CONFIG;
}

// Cross-tab storage event listener
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function useAiConfig() {
  // Track a "version" counter that same-tab mutations can bump
  // to force useSyncExternalStore to re-read the snapshot
  const [, setVersion] = useState(0);

  const config = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Force a re-read when version changes (for same-tab localStorage updates)
  // This is safe: it only re-reads from cache if raw value hasn't changed
  void config; // ensure the subscription is active

  /**
   * Save config to localStorage and notify all instances in this tab
   */
  const saveConfig = useCallback((newConfig: AiProviderConfig) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
      // Invalidate cache and bump version to force re-render
      cachedRawValue = undefined;
      setVersion((v) => v + 1);
    } catch { /* ignore */ }
  }, []);

  /**
   * Merge the saved AI config into any request body sent to an API route.
   * Usage: fetch("/api/ai-writing", { body: JSON.stringify(withAiConfig({ mode, prompt })) })
   */
  const withAiConfig = useCallback(
    <T extends Record<string, unknown>>(body: T): T & { _aiConfig: AiProviderConfig } => {
      return { ...body, _aiConfig: getSnapshot() };
    },
    []
  );

  // Listen for same-tab config changes via custom event
  useEffect(() => {
    function onConfigChange() {
      // Invalidate cache and re-read
      cachedRawValue = undefined;
      setVersion((v) => v + 1);
    }
    window.addEventListener("ai-config-changed", onConfigChange);
    return () => window.removeEventListener("ai-config-changed", onConfigChange);
  }, []);

  return { aiConfig: config, withAiConfig, saveConfig };
}
