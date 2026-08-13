"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/lib/stores/app-store";

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

export interface ThesisChapter {
  id: string;
  number: number;
  title: string;
  romanNumeral?: string | null;
  content: string;
  plainText: string;
  wordCount: number;
  targetWordCount: number;
  status: string;
  directorFeedback?: string | null;
  sortOrder: number;
}

export interface Thesis {
  id: string;
  title: string;
  subtitle?: string | null;
  author: string;
  email?: string | null;
  institution?: string | null;
  laboratory?: string | null;
  discipline?: string | null;
  directorName?: string | null;
  status: string;
  structureMode: string;
  chapters: ThesisChapter[];
  createdAt: string;
  updatedAt: string;
}

// ═══════════════════════════════════════
// Query Keys
// ═══════════════════════════════════════

export const thesisKeys = {
  all: ["thesis"] as const,
  lists: () => [...thesisKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...thesisKeys.lists(), filters] as const,
  details: () => [...thesisKeys.all, "detail"] as const,
  detail: (id: string) => [...thesisKeys.details(), id] as const,
  chapters: (thesisId: string) =>
    [...thesisKeys.detail(thesisId), "chapters"] as const,
};

// ═══════════════════════════════════════
// Hooks — Thesis CRUD
// ═══════════════════════════════════════

export function useTheses() {
  return useQuery({
    queryKey: thesisKeys.lists(),
    queryFn: async () => {
      const res = await fetch("/api/thesis");
      if (!res.ok) throw new Error("Erreur de chargement");
      const json = await res.json();
      return json.data as Thesis[];
    },
  });
}

export function useThesis(id: string | null) {
  return useQuery({
    queryKey: thesisKeys.detail(id ?? ""),
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/thesis/${id}`);
      if (!res.ok) throw new Error("Thèse non trouvée");
      const json = await res.json();
      return json.data as Thesis;
    },
    enabled: !!id,
  });
}

export function useCreateThesis() {
  const queryClient = useQueryClient();
  const { setActiveThesisId } = useAppStore();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      author: string;
      subtitle?: string;
      institution?: string;
      discipline?: string;
      directorName?: string;
    }) => {
      const res = await fetch("/api/thesis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur de création");
      }
      const json = await res.json();
      return json.data as Thesis;
    },
    onSuccess: (thesis) => {
      queryClient.invalidateQueries({ queryKey: thesisKeys.all });
      setActiveThesisId(thesis.id);
    },
  });
}

export function useUpdateThesis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Thesis> & { id: string }) => {
      const res = await fetch(`/api/thesis/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erreur de mise à jour");
      const json = await res.json();
      return json.data as Thesis;
    },
    onSuccess: (_data, _variables) => {
      queryClient.invalidateQueries({
        queryKey: thesisKeys.all,
      });
      queryClient.invalidateQueries({ queryKey: thesisKeys.lists() });
    },
  });
}

export function useDeleteThesis() {
  const queryClient = useQueryClient();
  const { activeThesisId, setActiveThesisId } = useAppStore();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/thesis/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur de suppression");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: thesisKeys.all });
      if (activeThesisId) setActiveThesisId(null);
    },
  });
}

// ═══════════════════════════════════════
// Hooks — Chapter CRUD
// ═══════════════════════════════════════

export function useUpdateChapter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: { id: string; title?: string; content?: string; plainText?: string; wordCount?: number; status?: string; sortOrder?: number }) => {
      const res = await fetch(`/api/chapters/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erreur de mise à jour");
      const json = await res.json();
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: thesisKeys.all });
    },
  });
}

export function useCreateChapter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      thesisId,
      title,
      romanNumeral,
    }: {
      thesisId: string;
      title: string;
      romanNumeral?: string;
    }) => {
      const res = await fetch(`/api/thesis/${thesisId}/chapters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, romanNumeral }),
      });
      if (!res.ok) throw new Error("Erreur de création");
      const json = await res.json();
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: thesisKeys.all });
    },
  });
}

export function useDeleteChapter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/chapters/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur de suppression");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: thesisKeys.all });
    },
  });
}
