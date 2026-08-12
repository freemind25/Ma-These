"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BookOpen,
  Plus,
  Search,
  Download,
  Star,
  Trash2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface Reference {
  id: string;
  type: string;
  authors: string;
  title: string;
  year?: number | null;
  journal?: string | null;
  doi?: string | null;
  keywords?: string | null;
  isFavorite: boolean;
  createdAt: string;
}

const REF_TYPES = [
  { value: "article", label: "Article" },
  { value: "book", label: "Livre" },
  { value: "thesis", label: "Thèse" },
  { value: "conference", label: "Conférence" },
  { value: "report", label: "Rapport" },
  { value: "web", label: "Web" },
];

function fetchReferences(filters: { type?: string; search?: string; favorites?: boolean }) {
  const params = new URLSearchParams();
  if (filters.type && filters.type !== "all") params.set("type", filters.type);
  if (filters.search) params.set("search", filters.search);
  if (filters.favorites) params.set("favorites", "true");
  return fetch(`/api/references?${params}`).then((r) => r.json()).then((j) => j.data as Reference[]);
}

export function ReferencesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);

  const { data: references, isLoading } = useQuery({
    queryKey: ["references", { type: typeFilter, search, favorites: false }],
    queryFn: () => fetchReferences({ type: typeFilter, search }),
  });

  const toggleFavorite = useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
      await fetch(`/api/references/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !isFavorite }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["references"] }),
  });

  const deleteRef = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/references/${id}`, { method: "DELETE" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["references"] }),
  });

  const createRef = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      const payload: Record<string, unknown> = { ...data };
      if (data.year) payload.year = parseInt(data.year, 10);
      const res = await fetch("/api/references", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["references"] });
      setCreateOpen(false);
    },
  });

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Références bibliographiques
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez vos références, exportez en BibTeX
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" asChild>
            <a href="/api/references/bibtex" download="references.bib">
              <Download className="h-4 w-4" />
              Export BibTeX
            </a>
          </Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Nouvelle référence</DialogTitle>
              </DialogHeader>
              <AddReferenceForm
                onSubmit={(data) => createRef.mutate(data)}
                isPending={createRef.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par titre, auteur, mot-clé..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-auto min-w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {REF_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 rounded" />
              ))}
            </div>
          ) : references && references.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Auteurs</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead className="w-16">Année</TableHead>
                  <TableHead className="w-20">Type</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {references.map((ref) => (
                  <TableRow key={ref.id}>
                    <TableCell>
                      <button
                        onClick={() =>
                          toggleFavorite.mutate({ id: ref.id, isFavorite: ref.isFavorite })
                        }
                      >
                        <Star
                          className={`h-4 w-4 ${
                            ref.isFavorite
                              ? "fill-chart-4 text-chart-4"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      </button>
                    </TableCell>
                    <TableCell className="text-xs font-medium max-w-[200px] truncate">
                      {ref.authors}
                    </TableCell>
                    <TableCell className="text-xs max-w-[300px] truncate">
                      {ref.title}
                    </TableCell>
                    <TableCell className="text-xs tabular-nums">
                      {ref.year}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px]">
                        {REF_TYPES.find((t) => t.value === ref.type)?.label || ref.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => deleteRef.mutate(ref.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <h3 className="text-sm font-medium">Aucune référence</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {search
                  ? "Aucun résultat pour cette recherche"
                  : "Ajoutez votre première référence bibliographique"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AddReferenceForm({
  onSubmit,
  isPending,
}: {
  onSubmit: (data: Record<string, string>) => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState({
    type: "article",
    authors: "",
    title: "",
    year: "",
    journal: "",
    doi: "",
    keywords: "",
  });

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium">Type *</label>
        <Select value={form.type} onValueChange={(v) => handleChange("type", v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REF_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Auteurs * (séparés par ;)</label>
        <Input
          placeholder="Dupont, J.; Martin, A."
          value={form.authors}
          onChange={(e) => handleChange("authors", e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Titre *</label>
        <Input
          placeholder="Titre de l'ouvrage"
          value={form.title}
          onChange={(e) => handleChange("title", e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Année</label>
          <Input
            placeholder="2024"
            value={form.year}
            onChange={(e) => handleChange("year", e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Journal / Editeur</label>
          <Input
            placeholder="Nature, Elsevier..."
            value={form.journal}
            onChange={(e) => handleChange("journal", e.target.value)}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Mots-clés (séparés par ,)</label>
        <Input
          placeholder="urbanisme, durabilité, architecture"
          value={form.keywords}
          onChange={(e) => handleChange("keywords", e.target.value)}
        />
      </div>
      <DialogFooter>
        <Button
          onClick={() => onSubmit(form)}
          disabled={!form.authors.trim() || !form.title.trim() || isPending}
        >
          {isPending ? "Ajout..." : "Ajouter"}
        </Button>
      </DialogFooter>
    </div>
  );
}
