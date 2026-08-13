"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

export interface Tension {
  severity: "warning" | "error";
  title: string;
  description: string;
  concernedFields: string[];
}

// ═══════════════════════════════════════
// useGenerateFromPitch
// ═══════════════════════════════════════

export function useGenerateFromPitch() {
  return useMutation({
    mutationFn: async (pitch: string) => {
      const res = await fetch("/api/cadrage/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pitch }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Erreur lors de la génération IA");
      }
      return res.json() as Promise<{ data: Record<string, string> }>;
    },
    onError: (err) => toast.error(err.message),
  });
}

// ═══════════════════════════════════════
// useReformulateField
// ═══════════════════════════════════════

export function useReformulateField() {
  return useMutation({
    mutationFn: async ({
      fieldKey,
      currentValue,
      allFields,
    }: {
      fieldKey: string;
      currentValue: string;
      allFields: Record<string, string>;
    }) => {
      const res = await fetch("/api/cadrage/ai/reformulate-field", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fieldKey, currentValue, allFields }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Erreur lors de la reformulation");
      }
      return res.json() as Promise<{ data: { value: string } }>;
    },
    onError: (err) => toast.error(err.message),
  });
}

// ═══════════════════════════════════════
// useCheckConsistency
// ═══════════════════════════════════════

export function useCheckConsistency() {
  return useMutation({
    mutationFn: async (fields: Record<string, string>) => {
      const res = await fetch("/api/cadrage/ai/check-consistency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Erreur lors de la vérification");
      }
      return res.json() as Promise<{ data: { tensions: Tension[] } }>;
    },
    onError: (err) => toast.error(err.message),
  });
}
