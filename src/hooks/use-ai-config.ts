// ═══════════════════════════════════════════════════════════════
// ThesisFrame — useAiConfig hook (v2 — secure)
// API keys are stored in an httpOnly cookie (server-side only).
// The key NEVER touches client-side JavaScript or localStorage.
// 
// Migration: on first load, any apiKey found in localStorage is
// automatically migrated to the cookie and removed from localStorage.
// ═══════════════════════════════════════════════════════════════

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { type AiProviderConfig } from "@/lib/ai/ai-types";

// ═══════════════════════════════════════════════════════════════
// Legacy localStorage key (used only for migration)
// ═══════════════════════════════════════════════════════════════
const LEGACY_STORAGE_KEY = "thesisframe-ai-config";
const MIGRATION_DONE_KEY = "thesisframe-ai-config-migrated";

const DEFAULT_CONFIG: AiProviderConfig = { provider: "zai" };

/**
 * Interface for the non-sensitive config returned by /api/ai-config GET.
 */
interface SafeConfig {
  provider: string;
  model?: string;
  baseUrl?: string;
  hasApiKey: boolean;
}

/**
 * One-time migration: move apiKey from localStorage to httpOnly cookie.
 * Returns the safe config from the server after migration.
 */
async function migrateLocalStorageToCookie(): Promise<SafeConfig> {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AiProviderConfig;
      if (parsed.provider && parsed.apiKey) {
        // Send full config (including apiKey) to the server to set in cookie
        const res = await fetch("/api/ai-config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed),
        });
        if (res.ok) {
          const { data } = (await res.json()) as { data: SafeConfig };
          // Remove apiKey from localStorage, keep non-sensitive fields
          const { apiKey: _, ...safeConfig } = parsed;
          localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(safeConfig));
          localStorage.setItem(MIGRATION_DONE_KEY, "true");
          console.warn("[ai-config] Migrated API key from localStorage to httpOnly cookie");
          return data;
        }
      }
    }
  } catch (e) {
    console.warn("[ai-config] Migration failed:", e);
  }
  localStorage.setItem(MIGRATION_DONE_KEY, "true");
  return { provider: "zai", hasApiKey: false };
}

export function useAiConfig() {
  const [config, setConfig] = useState<AiProviderConfig>(DEFAULT_CONFIG);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const mountedRef = useRef(true);

  // Load config from server on mount (and migrate if needed)
  useEffect(() => {
    mountedRef.current = true;

    async function loadConfig() {
      try {
        // Check if migration is needed
        const migrated = localStorage.getItem(MIGRATION_DONE_KEY);
        let result: SafeConfig;

        if (!migrated) {
          // First-time migration
          result = await migrateLocalStorageToCookie();
        } else {
          // Normal load from server
          const res = await fetch("/api/ai-config");
          if (res.ok) {
            const { data } = (await res.json()) as { data: SafeConfig };
            result = data;
          } else {
            result = { provider: "zai", hasApiKey: false };
          }
        }

        if (!mountedRef.current) return;

        setConfig({
          provider: result.provider as AiProviderConfig["provider"],
          model: result.model,
          baseUrl: result.baseUrl,
        });
        setHasApiKey(result.hasApiKey);
      } catch {
        // Server unavailable — fall back to localStorage for non-sensitive fields
        try {
          const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as AiProviderConfig;
            if (parsed.provider) {
              setConfig({
                provider: parsed.provider,
                model: parsed.model,
                baseUrl: parsed.baseUrl,
              });
            }
          }
        } catch { /* ignore */ }
      } finally {
        if (mountedRef.current) setLoaded(true);
      }
    }

    loadConfig();
    return () => { mountedRef.current = false; };
  }, []);

  /**
   * Save the full config (including API key) to the server's httpOnly cookie.
   * The key is sent to /api/ai-config POST and stored server-side.
   * It NEVER enters localStorage.
   *
   * IMPORTANT: On success, state is set from the safe server response (no apiKey).
   * On failure, state is updated but apiKey is stripped to prevent leakage via withAiConfig.
   */
  const saveConfig = useCallback(async (newConfig: AiProviderConfig) => {
    let saved = false;
    try {
      const res = await fetch("/api/ai-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig),
      });

      if (res.ok) {
        saved = true;
        const { data } = (await res.json()) as { data: SafeConfig };
        if (mountedRef.current) {
          setConfig({
            provider: data.provider as AiProviderConfig["provider"],
            model: data.model,
            baseUrl: data.baseUrl,
          });
          setHasApiKey(data.hasApiKey);
        }
        // Update localStorage with non-sensitive fields only (for UI persistence across page reloads)
        const { apiKey: _, ...safeConfig } = newConfig;
        localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(safeConfig));
      }
    } catch (e) {
      console.error("[ai-config] Save failed:", e);
    }

    // On failure only: update local state for responsive UI, but STRIP the apiKey
    // to prevent it from leaking into withAiConfig request bodies.
    if (!saved && mountedRef.current) {
      const { apiKey: _, ...safeConfig } = newConfig;
      setConfig(safeConfig);
      setHasApiKey(!!newConfig.apiKey);
    }
  }, []);

  /**
   * Merge the saved AI config into any request body.
   * NOTE: This NEVER includes the API key — the server reads it from the httpOnly cookie.
   * The `_aiConfig` field is kept for backward compatibility but contains only
   * provider/model/baseUrl (no apiKey). Defense-in-depth: even if state somehow
   * contained the key, it is stripped here before sending.
   *
   * DEPRECATION NOTICE (v1.9.5): The _aiConfig body fallback will be removed
   * in a future version. All routes should read config from the httpOnly cookie only.
   */
  const withAiConfig = useCallback(
    <T extends Record<string, unknown>>(body: T): T & { _aiConfig: Omit<AiProviderConfig, 'apiKey'> } => {
      const { apiKey: _, ...safeConfig } = config;
      return { ...body, _aiConfig: safeConfig };
    },
    [config]
  );

  return { aiConfig: config, withAiConfig, saveConfig, hasApiKey, loaded };
}
