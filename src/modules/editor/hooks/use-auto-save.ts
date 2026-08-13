"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ═══════════════════════════════════════
// useDebounce — Hook de debounce utilitaire
// ═══════════════════════════════════════
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ═══════════════════════════════════════
// useAutoSave — Auto-save avec debounce et statut
// ═══════════════════════════════════════
export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface UseAutoSaveOptions<T> {
  data: T;
  delay?: number; // ms before auto-save triggers
  onSave: (data: T) => Promise<void>;
  enabled?: boolean;
}

export function useAutoSave<T>({
  data,
  delay = 2000,
  onSave,
  enabled = true,
}: UseAutoSaveOptions<T>) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const isSavingRef = useRef(false);
  const lastSavedRef = useRef<string>("");
  const debouncedData = useDebounce(data, delay);

  const save = useCallback(
    async (saveData: T) => {
      if (isSavingRef.current) return;

      const dataStr = JSON.stringify(saveData);
      if (dataStr === lastSavedRef.current) return;

      isSavingRef.current = true;
      setStatus("saving");

      try {
        await onSave(saveData);
        lastSavedRef.current = dataStr;
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 2000);
      } catch {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
      } finally {
        isSavingRef.current = false;
      }
    },
    [onSave]
  );

  useEffect(() => {
    if (enabled) {
      save(debouncedData);
    }
  }, [debouncedData, enabled, save]);

  return { status, save };
}
