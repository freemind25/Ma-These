"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/lib/stores/app-store";
import { apiJson } from "@/lib/api/api-fetch";

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
  partId?: string | null;
}

export interface ThesisPart {
  id: string;
  thesisId: string;
  title: string;
  sortOrder: number;
  chapters?: ThesisChapter[];
  createdAt: string;
  updatedAt: string;
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
  parts: (thesisId: string) =>
    [...thesisKeys.detail(thesisId), "parts"] as const,
};

// ═══════════════════════════════════════
// Hooks — Thesis CRUD
// ═══════════════════════════════════════

export function useTheses() {
  return useQuery({
    queryKey: thesisKeys.lists(),
    queryFn: async () => {
      return apiJson<Thesis[]>("/api/thesis");
    },
  });
}

export function useThesis(id: string | null) {
  return useQuery({
    queryKey: thesisKeys.detail(id ?? ""),
    queryFn: async () => {
      if (!id) return null;
      return apiJson<Thesis>(`/api/thesis/${id}`);
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
      email?: string;
      institution?: string;
      laboratory?: string;
      discipline?: string;
      directorName?: string;
    }) => {
      return apiJson<Thesis>("/api/thesis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
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
      return apiJson<Thesis>(`/api/thesis/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
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
      await apiJson(`/api/thesis/${id}`, { method: "DELETE" });
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
    }: { id: string; title?: string; content?: string; plainText?: string; wordCount?: number; status?: string; sortOrder?: number; partId?: string | null; stamp?: string }) => {
      return apiJson<ThesisChapter>(`/api/chapters/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
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
      return apiJson<ThesisChapter>(`/api/thesis/${thesisId}/chapters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, romanNumeral }),
      });
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
      await apiJson(`/api/chapters/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: thesisKeys.all });
    },
  });
}

// ═══════════════════════════════════════
// Hooks — Part CRUD
// ═══════════════════════════════════════

export function useParts(thesisId: string | null) {
  return useQuery({
    queryKey: thesisKeys.parts(thesisId ?? ""),
    queryFn: async () => {
      if (!thesisId) return [];
      return apiJson<ThesisPart[]>(`/api/thesis/${thesisId}/parts`);
    },
    enabled: !!thesisId,
  });
}

export function useCreatePart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ thesisId, title }: { thesisId: string; title: string }) => {
      return apiJson<ThesisPart>(`/api/thesis/${thesisId}/parts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: thesisKeys.all });
    },
  });
}

export function useUpdatePart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; title?: string; sortOrder?: number }) => {
      return apiJson<ThesisPart>(`/api/parts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: thesisKeys.all });
    },
  });
}

export function useDeletePart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiJson(`/api/parts/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: thesisKeys.all });
    },
  });
}
