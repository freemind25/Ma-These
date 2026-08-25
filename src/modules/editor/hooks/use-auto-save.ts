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
// useAutoSave — Auto-save avec debounce, statut et beforeunload
// ═══════════════════════════════════════
export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface UseAutoSaveOptions<T> {
  data: T;
  delay?: number;
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
  const lastSavedRef = useRef("");
  const dirtyRef = useRef(false);
  const debouncedData = useDebounce(data, delay);

  const save = useCallback(
    async (saveData: T) => {
      if (isSavingRef.current) return;

      const dataStr = JSON.stringify(saveData);
      if (dataStr === lastSavedRef.current) {
        dirtyRef.current = false;
        return;
      }

      isSavingRef.current = true;
      setStatus("saving");

      try {
        await onSave(saveData);
        lastSavedRef.current = dataStr;
        dirtyRef.current = false;
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 2000);
      } catch {
        dirtyRef.current = true;
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
      dirtyRef.current = true;
      save(debouncedData);
    }
  }, [debouncedData, enabled, save]);

  // Warn user before closing tab/refreshing if there are unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  return { status, save };
}
