"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ═══════════════════════════════════════
// useAutoSave — Ref-based debounce auto-save with flush & retry
// ═══════════════════════════════════════
export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface UseAutoSaveOptions<T> {
  /** Latest data snapshot (read via ref for zero re-render overhead) */
  getData: () => T;
  /** Unique key to detect changes (e.g. chapterId) */
  key: string;
  delay?: number;
  maxRetries?: number;
  onSave: (data: T) => Promise<void>;
  enabled?: boolean;
  /** Called when key changes — flush any pending save for the old key */
  onKeyChange?: (data: T) => void;
}

export function useAutoSave<T>({
  getData,
  key,
  delay = 2000,
  maxRetries = 2,
  onSave,
  enabled = true,
  onKeyChange,
}: UseAutoSaveOptions<T>) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const isSavingRef = useRef(false);
  const lastSavedRef = useRef("");
  const dirtyRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);
  const onDataRef = useRef(getData);
  const onSaveRef = useRef(onSave);
  const onKeyChangeRef = useRef(onKeyChange);

  // Keep refs current without triggering the effect
  onDataRef.current = getData;
  onSaveRef.current = onSave;
  onKeyChangeRef.current = onKeyChange;

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const save = useCallback(
    async (saveData?: T) => {
      if (isSavingRef.current) return;

      const data = saveData ?? onDataRef.current();
      const dataStr = JSON.stringify(data);
      if (dataStr === lastSavedRef.current) {
        dirtyRef.current = false;
        return;
      }

      isSavingRef.current = true;
      setStatus("saving");

      try {
        await onSaveRef.current(data);
        lastSavedRef.current = dataStr;
        dirtyRef.current = false;
        retryCountRef.current = 0;
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 2000);
      } catch {
        retryCountRef.current += 1;
        if (retryCountRef.current <= maxRetries) {
          // Retry after a short backoff
          const backoff = 1000 * retryCountRef.current;
          timerRef.current = setTimeout(() => {
            isSavingRef.current = false;
            save(data);
          }, backoff);
        } else {
          dirtyRef.current = true;
          retryCountRef.current = 0;
          setStatus("error");
          setTimeout(() => setStatus("idle"), 3000);
        }
      } finally {
        isSavingRef.current = false;
      }
    },
    [maxRetries]
  );

  // Schedule a debounced save when the caller signals a change
  // We use "key" as the trigger — the caller increments a version counter
  // or uses the chapterId to signal that content has changed.
  const scheduleSave = useCallback(() => {
    if (!enabled) return;
    dirtyRef.current = true;
    clearTimer();
    timerRef.current = setTimeout(() => {
      save();
    }, delay);
  }, [enabled, delay, save, clearTimer]);

  // Flush: immediately save pending changes (for chapter switch, manual save button, etc.)
  const flush = useCallback(async () => {
    clearTimer();
    if (dirtyRef.current) {
      await save();
    }
  }, [save, clearTimer]);

  // Force save: save current data regardless of dirty state (for manual save button)
  const forceSave = useCallback(async () => {
    clearTimer();
    const data = onDataRef.current();
    // Reset lastSavedRef so JSON comparison doesn't skip the save
    lastSavedRef.current = "";
    await save(data);
  }, [save, clearTimer]);

  // When key changes (e.g. chapter switch), flush old data, then reset
  const prevKeyRef = useRef(key);
  useEffect(() => {
    if (prevKeyRef.current !== key) {
      const oldData = onDataRef.current();
      clearTimer();
      prevKeyRef.current = key;
      dirtyRef.current = false;
      lastSavedRef.current = "";
      retryCountRef.current = 0;
      setStatus("idle");
      // Notify parent to do a synchronous save of the old chapter
      onKeyChangeRef.current?.(oldData);
    }
  }, [key, clearTimer]);

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

  return { status, scheduleSave, flush, forceSave };
}
