"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CADRAGE_FIELDS } from "@/data/cadrage-fields";

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

export interface CadrageFieldRow {
  id: string;
  fieldKey: string;
  label: string;
  value: string | null;
  aiSuggestion: string | null;
  isLocked: boolean;
  isAiSuggestion: boolean;
  sortOrder: number;
}

export interface CadrageRow {
  id: string;
  thesisId: string;
  label: string | null;
  isActive: boolean;
  statut: string;
  versionNumber: number;
  createdAt: string;
  updatedAt: string;
  fields: CadrageFieldRow[];
}

export interface CadrageVersionRow {
  id: string;
  cadrageId: string;
  label: string | null;
  snapshot: string;
  createdAt: string;
}

// ═══════════════════════════════════════
// Query Keys
// ═══════════════════════════════════════

export const cadrageKeys = {
  all: ["cadrage"] as const,
  lists: () => [...cadrageKeys.all, "list"] as const,
  list: (thesisId: string) => [...cadrageKeys.lists(), thesisId] as const,
  details: () => [...cadrageKeys.all, "detail"] as const,
  detail: (id: string) => [...cadrageKeys.details(), id] as const,
  fields: (cadrageId: string) =>
    [...cadrageKeys.detail(cadrageId), "fields"] as const,
  versions: (cadrageId: string) =>
    [...cadrageKeys.detail(cadrageId), "versions"] as const,
};

// ═══════════════════════════════════════
// useCadrage — fetch active cadrage + fields
// ═══════════════════════════════════════

export function useCadrage(thesisId: string | null) {
  return useQuery<{
    data: CadrageRow[];
    meta: { count: number };
  }>({
    queryKey: cadrageKeys.list(thesisId ?? "__none__"),
    queryFn: async () => {
      const res = await fetch(`/api/thesis/${thesisId}/cadrages`);
      if (!res.ok) throw new Error("Erreur de chargement des cadrages");
      return res.json();
    },
    enabled: !!thesisId,
    staleTime: 30_000,
  });
}

// ═══════════════════════════════════════
// useCreateCadrage
// ═══════════════════════════════════════

export function useCreateCadrage(thesisId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (label?: string) => {
      if (!thesisId) throw new Error("Aucune thèse sélectionnée");

      const fields = CADRAGE_FIELDS.map((f, i) => ({
        fieldKey: f.key,
        label: f.label,
        sortOrder: i,
      }));

      const res = await fetch(`/api/thesis/${thesisId}/cadrages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thesisId, label: label ?? "Cadrage préalable", fields }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Erreur lors de la création");
      }
      return res.json() as Promise<{ data: CadrageRow }>;
    },
    onSuccess: () => {
      if (thesisId) {
        queryClient.invalidateQueries({ queryKey: cadrageKeys.list(thesisId) });
      }
      toast.success("Cadrage créé avec succès");
    },
    onError: (err) => toast.error(err.message),
  });
}

// ═══════════════════════════════════════
// useUpdateField
// ═══════════════════════════════════════

export function useUpdateField(cadrageId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      fieldId,
      value,
    }: {
      fieldId: string;
      value: string;
    }) => {
      if (!cadrageId) throw new Error("Aucun cadrage sélectionné");
      const res = await fetch(`/api/cadrages/fields/${fieldId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value, isAiSuggestion: false }),
      });
      if (!res.ok) throw new Error("Erreur lors de la mise à jour");
      return res.json();
    },
    onSuccess: () => {
      if (cadrageId) {
        queryClient.invalidateQueries({ queryKey: cadrageKeys.fields(cadrageId) });
      }
    },
  });
}

// ═══════════════════════════════════════
// useSaveFields — batch save
// ═══════════════════════════════════════

export function useSaveFields(cadrageId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fields: { fieldId: string; value: string }[]) => {
      if (!cadrageId) throw new Error("Aucun cadrage sélectionné");

      const results = await Promise.all(
        fields.map(async ({ fieldId, value }) => {
          const res = await fetch(`/api/cadrages/fields/${fieldId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ value, isAiSuggestion: false }),
          });
          if (!res.ok) throw new Error(`Erreur sur un champ`);
          return res.json();
        })
      );
      return results;
    },
    onSuccess: () => {
      if (cadrageId) {
        queryClient.invalidateQueries({ queryKey: cadrageKeys.fields(cadrageId) });
      }
      toast.success("Champs sauvegardés");
    },
    onError: () => toast.error("Erreur lors de la sauvegarde"),
  });
}

// ═══════════════════════════════════════
// useCreateVersion
// ═══════════════════════════════════════

export function useCreateVersion(cadrageId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (label?: string) => {
      if (!cadrageId) throw new Error("Aucun cadrage sélectionné");
      const res = await fetch(`/api/cadrages/${cadrageId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      });
      if (!res.ok) throw new Error("Erreur lors de la création de la version");
      return res.json() as Promise<{ data: CadrageVersionRow }>;
    },
    onSuccess: () => {
      if (cadrageId) {
        queryClient.invalidateQueries({
          queryKey: cadrageKeys.versions(cadrageId),
        });
      }
      toast.success("Version sauvegardée");
    },
    onError: () => toast.error("Erreur lors de la sauvegarde de la version"),
  });
}

// ═══════════════════════════════════════
// useValidateCadrage
// ═══════════════════════════════════════

export function useValidateCadrage(cadrageId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!cadrageId) throw new Error("Aucun cadrage sélectionné");
      const res = await fetch(`/api/cadrages/${cadrageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: "valide" }),
      });
      if (!res.ok) throw new Error("Erreur lors de la validation");
      return res.json();
    },
    onSuccess: () => {
      if (cadrageId) {
        queryClient.invalidateQueries({ queryKey: cadrageKeys.detail(cadrageId) });
      }
      toast.success("Cadrage validé !");
    },
    onError: () => toast.error("Erreur lors de la validation"),
  });
}

// ═══════════════════════════════════════
// useVersions
// ═══════════════════════════════════════

export function useVersions(cadrageId: string | null) {
  return useQuery<{
    data: CadrageVersionRow[];
    meta: { count: number };
  }>({
    queryKey: cadrageKeys.versions(cadrageId ?? "__none__"),
    queryFn: async () => {
      const res = await fetch(`/api/cadrages/${cadrageId}/versions`);
      if (!res.ok) throw new Error("Erreur de chargement des versions");
      return res.json();
    },
    enabled: !!cadrageId,
    staleTime: 30_000,
  });
}
