"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wrench,
  Plus,
  Trash2,
  BookOpen,
  Brain,
  Network,
  GitCompareArrows,
  Loader2,
  FileQuestion,
  StickyNote,
  Eye,
  Sparkles,
  MessageSquare,
  PenTool,
  SearchCheck,
  Lightbulb,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

interface ResearchSource {
  id: string;
  title: string;
  authors?: string | null;
  year?: number | null;
  type: string;
  url?: string | null;
  notes?: string | null;
  _count?: { entries: number };
  createdAt: string;
  updatedAt: string;
}

interface NotebookEntry {
  id: string;
  question: string;
  answer: string;
  tags?: string | null;
  sourceId?: string | null;
  source?: { id: string; title: string; type: string } | null;
  createdAt: string;
  updatedAt: string;
}

// ═══════════════════════════════════════
// Constants
// ═══════════════════════════════════════

const SOURCE_TYPES = [
  { value: "article", label: "Article" },
  { value: "book", label: "Livre" },
  { value: "thesis", label: "Thèse" },
  { value: "report", label: "Rapport" },
] as const;

const SOURCE_TYPE_COLORS: Record<string, string> = {
  article: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  book: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  thesis: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  report: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
};

const AI_CONSENSUS_MODES = [
  {
    id: "scientific-writing",
    label: "Rédaction",
    icon: PenTool,
    description: "Rédaction scientifique académique",
  },
  {
    id: "peer-review",
    label: "Revue critique",
    icon: SearchCheck,
    description: "Relecture critique et évaluation",
  },
  {
    id: "hypothesis",
    label: "Suggestion",
    icon: Lightbulb,
    description: "Suggestions et hypothèses de recherche",
  },
] as const;

// ═══════════════════════════════════════
// Main Page
// ═══════════════════════════════════════

export function AiToolsPage() {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Wrench className="h-6 w-6 text-primary" />
          Outils IA
        </h1>
        <p className="text-sm text-muted-foreground">
          Carnet de recherche, consensus multi-sources et visualisation
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="notebook" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="notebook" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Carnet de recherche
          </TabsTrigger>
          <TabsTrigger value="consensus" className="gap-2">
            <GitCompareArrows className="h-4 w-4" />
            Consensus IA
          </TabsTrigger>
          <TabsTrigger value="visualization" className="gap-2">
            <Network className="h-4 w-4" />
            Visualisation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notebook" className="mt-4">
          <ResearchNotebookTab />
        </TabsContent>
        <TabsContent value="consensus" className="mt-4">
          <AiConsensusTab />
        </TabsContent>
        <TabsContent value="visualization" className="mt-4">
          <VisualizationTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ═══════════════════════════════════════
// Tab 1: Carnet de recherche
// ═══════════════════════════════════════

function ResearchNotebookTab() {
  const queryClient = useQueryClient();
  const [addSourceOpen, setAddSourceOpen] = useState(false);
  const [addEntryOpen, setAddEntryOpen] = useState(false);

  // ─── Fetch Sources ───
  const { data: sources, isLoading: sourcesLoading } = useQuery({
    queryKey: ["sources"],
    queryFn: async () => {
      const res = await fetch("/api/sources");
      const json = await res.json();
      return json.data as ResearchSource[];
    },
  });

  // ─── Fetch Entries ───
  const { data: entries, isLoading: entriesLoading } = useQuery({
    queryKey: ["entries"],
    queryFn: async () => {
      const res = await fetch("/api/entries");
      const json = await res.json();
      return json.data as NotebookEntry[];
    },
  });

  // ─── Create Source ───
  const createSource = useMutation({
    mutationFn: async (data: {
      title: string;
      authors: string;
      year: string;
      type: string;
      url: string;
      notes: string;
    }) => {
      const payload: Record<string, unknown> = {
        title: data.title,
        type: data.type,
      };
      if (data.authors.trim()) payload.authors = data.authors.trim();
      if (data.year) payload.year = parseInt(data.year, 10);
      if (data.url.trim()) payload.url = data.url.trim();
      if (data.notes.trim()) payload.notes = data.notes.trim();

      const res = await fetch("/api/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur lors de la création");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources"] });
      setAddSourceOpen(false);
      toast.success("Source ajoutée avec succès");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  // ─── Create Entry ───
  const createEntry = useMutation({
    mutationFn: async (data: {
      question: string;
      answer: string;
      tags: string;
      sourceId: string;
    }) => {
      const payload: Record<string, unknown> = {
        question: data.question,
        answer: data.answer,
      };
      if (data.tags.trim()) payload.tags = data.tags.trim();
      if (data.sourceId) payload.sourceId = data.sourceId;

      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur lors de la création");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["sources"] });
      setAddEntryOpen(false);
      toast.success("Entrée ajoutée avec succès");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  // ─── Delete Source ───
  const deleteSource = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/sources/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources"] });
      toast.success("Source supprimée");
    },
  });

  // ─── Delete Entry ───
  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/entries/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["sources"] });
      toast.success("Entrée supprimée");
    },
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Sources Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-primary" />
            Sources de recherche
            {sources && (
              <Badge variant="secondary" className="text-[10px] h-5">
                {sources.length}
              </Badge>
            )}
          </h2>
          <Dialog open={addSourceOpen} onOpenChange={setAddSourceOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" size="sm">
                <Plus className="h-4 w-4" />
                Ajouter une source
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Nouvelle source de recherche</DialogTitle>
                <DialogDescription>
                  Ajoutez une source à votre carnet de recherche
                </DialogDescription>
              </DialogHeader>
              <AddSourceForm
                onSubmit={(data) => createSource.mutate(data)}
                isPending={createSource.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Sources Grid */}
        {sourcesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-36 rounded-lg" />
            ))}
          </div>
        ) : sources && sources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sources.map((source) => (
              <Card key={source.id} className="flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm leading-tight line-clamp-2">
                        {source.title}
                      </CardTitle>
                      {source.authors && (
                        <CardDescription className="text-xs mt-1 truncate">
                          {source.authors}
                        </CardDescription>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => deleteSource.mutate(source.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={`text-[10px] h-5 ${
                        SOURCE_TYPE_COLORS[source.type] || ""
                      }`}
                    >
                      {SOURCE_TYPES.find((t) => t.value === source.type)?.label ||
                        source.type}
                    </Badge>
                    {source.year && (
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {source.year}
                      </span>
                    )}
                    {source._count && source._count.entries > 0 && (
                      <Badge variant="outline" className="text-[10px] h-5">
                        {source._count.entries}{" "}
                        {source._count.entries > 1 ? "entrées" : "entrée"}
                      </Badge>
                    )}
                  </div>
                  {source.notes && (
                    <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
                      {source.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <h3 className="text-sm font-medium">Aucune source de recherche</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Ajoutez votre première source pour commencer votre carnet de recherche
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Separator />

      {/* Notebook Entries Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileQuestion className="h-5 w-5 text-primary" />
            Notes et questions
            {entries && (
              <Badge variant="secondary" className="text-[10px] h-5">
                {entries.length}
              </Badge>
            )}
          </h2>
          <Dialog open={addEntryOpen} onOpenChange={setAddEntryOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" size="sm">
                <Plus className="h-4 w-4" />
                Ajouter une entrée
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Nouvelle entrée de carnet</DialogTitle>
                <DialogDescription>
                  Notez une question, une observation ou une idée de recherche
                </DialogDescription>
              </DialogHeader>
              <AddEntryForm
                sources={sources || []}
                onSubmit={(data) => createEntry.mutate(data)}
                isPending={createEntry.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Entries List */}
        {entriesLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        ) : entries && entries.length > 0 ? (
          <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
            {entries.map((entry) => (
              <Card key={entry.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold leading-tight">
                        {entry.question}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2 whitespace-pre-wrap line-clamp-3">
                        {entry.answer}
                      </p>
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        {entry.tags &&
                          entry.tags.split(",").map((tag, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-[10px] h-5"
                            >
                              {tag.trim()}
                            </Badge>
                          ))}
                        {entry.source && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] h-5 gap-1"
                          >
                            <BookOpen className="h-3 w-3" />
                            {entry.source.title.length > 30
                              ? entry.source.title.substring(0, 30) + "..."
                              : entry.source.title}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => deleteEntry.mutate(entry.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileQuestion className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <h3 className="text-sm font-medium">Aucune note</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Ajoutez des questions, observations et idées de recherche
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// Add Source Form
// ═══════════════════════════════════════

function AddSourceForm({
  onSubmit,
  isPending,
}: {
  onSubmit: (data: {
    title: string;
    authors: string;
    year: string;
    type: string;
    url: string;
    notes: string;
  }) => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState({
    title: "",
    authors: "",
    year: "",
    type: "article" as string,
    url: "",
    notes: "",
  });

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium">Titre *</label>
        <Input
          placeholder="Titre de la source"
          value={form.title}
          onChange={(e) => handleChange("title", e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Auteurs</label>
        <Input
          placeholder="Nom, Prénom (séparés par ;)"
          value={form.authors}
          onChange={(e) => handleChange("authors", e.target.value)}
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
          <label className="text-sm font-medium">Type *</label>
          <Select value={form.type} onValueChange={(v) => handleChange("type", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SOURCE_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">URL</label>
        <Input
          placeholder="https://..."
          value={form.url}
          onChange={(e) => handleChange("url", e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Notes</label>
        <Textarea
          placeholder="Notes sur cette source..."
          value={form.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          rows={3}
          className="resize-none"
        />
      </div>
      <DialogFooter>
        <Button
          onClick={() => onSubmit(form)}
          disabled={!form.title.trim() || isPending}
        >
          {isPending ? "Ajout..." : "Ajouter"}
        </Button>
      </DialogFooter>
    </div>
  );
}

// ═══════════════════════════════════════
// Add Entry Form
// ═══════════════════════════════════════

function AddEntryForm({
  sources,
  onSubmit,
  isPending,
}: {
  sources: ResearchSource[];
  onSubmit: (data: {
    question: string;
    answer: string;
    tags: string;
    sourceId: string;
  }) => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState({
    question: "",
    answer: "",
    tags: "",
    sourceId: "",
  });

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium">Question *</label>
        <Input
          placeholder="Quelle est votre question de recherche ?"
          value={form.question}
          onChange={(e) => handleChange("question", e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Réponse / Notes *</label>
        <Textarea
          placeholder="Documentez votre réflexion, observation ou réponse..."
          value={form.answer}
          onChange={(e) => handleChange("answer", e.target.value)}
          rows={4}
          className="resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Tags (séparés par ,)</label>
          <Input
            placeholder="méthodologie, échantillon"
            value={form.tags}
            onChange={(e) => handleChange("tags", e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Source associée</label>
          <Select value={form.sourceId} onValueChange={(v) => handleChange("sourceId", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Aucune" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucune source</SelectItem>
              {sources.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.title.length > 40 ? s.title.substring(0, 40) + "..." : s.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button
          onClick={() => onSubmit(form)}
          disabled={!form.question.trim() || !form.answer.trim() || isPending}
        >
          {isPending ? "Ajout..." : "Ajouter"}
        </Button>
      </DialogFooter>
    </div>
  );
}

// ═══════════════════════════════════════
// Tab 2: Consensus IA
// ═══════════════════════════════════════

function AiConsensusTab() {
  const [prompt, setPrompt] = useState("");
  const [selectedModes, setSelectedModes] = useState<Set<string>>(
    new Set(["scientific-writing", "peer-review"])
  );
  const [results, setResults] = useState<
    Array<{ mode: string; content: string }>
  >([]);
  const [isComparing, setIsComparing] = useState(false);

  const toggleMode = (modeId: string) => {
    setSelectedModes((prev) => {
      const next = new Set(prev);
      if (next.has(modeId)) {
        next.delete(modeId);
      } else {
        next.add(modeId);
      }
      return next;
    });
  };

  const handleCompare = async () => {
    if (!prompt.trim() || selectedModes.size === 0) return;

    setIsComparing(true);
    setResults([]);
    const newResults: Array<{ mode: string; content: string }> = [];

    for (const modeId of selectedModes) {
      try {
        const res = await fetch("/api/ai-writing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: modeId, prompt: prompt.trim() }),
        });
        if (!res.ok) {
          const err = await res.json();
          newResults.push({
            mode: modeId,
            content: `Erreur : ${err.error || "Erreur de génération"}`,
          });
        } else {
          const json = await res.json();
          newResults.push({
            mode: modeId,
            content: json.data.content,
          });
        }
      } catch {
        newResults.push({
          mode: modeId,
          content: "Erreur de connexion au service IA",
        });
      }
    }

    setResults(newResults);
    setIsComparing(false);
  };

  const getModeInfo = (modeId: string) =>
    AI_CONSENSUS_MODES.find((m) => m.id === modeId);

  return (
    <div className="flex flex-col gap-6">
      {/* Input Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Comparaison multi-modes
          </CardTitle>
          <CardDescription className="text-xs">
            Saisissez un texte ou une question et comparez les réponses de plusieurs modes IA
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Textarea
            placeholder="Saisissez votre texte, question ou extrait à analyser..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={5}
            className="resize-none text-sm"
            disabled={isComparing}
          />

          {/* Mode Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Modes IA à comparer</label>
            <div className="flex flex-wrap gap-2">
              {AI_CONSENSUS_MODES.map((mode) => {
                const Icon = mode.icon;
                const isSelected = selectedModes.has(mode.id);
                return (
                  <button
                    key={mode.id}
                    onClick={() => toggleMode(mode.id)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all hover:bg-muted/50 ${
                      isSelected
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {mode.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {selectedModes.size} mode(s) sélectionné(s) · {prompt.length} caractères
            </span>
            <Button
              onClick={handleCompare}
              disabled={!prompt.trim() || selectedModes.size === 0 || isComparing}
              className="gap-2"
            >
              {isComparing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <GitCompareArrows className="h-4 w-4" />
                  Comparer
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {isComparing && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from(selectedModes).map((modeId) => {
            const mode = getModeInfo(modeId);
            return (
              <Card key={modeId}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {mode && <mode.icon className="h-4 w-4" />}
                    {mode?.label || modeId}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {results.length > 0 && !isComparing && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {results.map((result) => {
              const mode = getModeInfo(result.mode);
              return (
                <Card key={result.mode}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {mode && <mode.icon className="h-4 w-4 text-primary" />}
                      {mode?.label || result.mode}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                      {result.content.split("\n").map((line, i) => {
                        if (line.trim() === "") return <br key={i} />;
                        return <p key={i}>{line}</p>;
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Synthèse */}
          {results.length >= 2 && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Synthèse comparative
                </CardTitle>
                <CardDescription className="text-xs">
                  Vue d&apos;ensemble des réponses des {results.length} modes IA sélectionnés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {results.map((result) => {
                    const mode = getModeInfo(result.mode);
                    const preview =
                      result.content.length > 150
                        ? result.content.substring(0, 150) + "..."
                        : result.content;
                    return (
                      <div
                        key={result.mode}
                        className="flex items-start gap-3 p-3 rounded-lg bg-background/50"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          {mode && <mode.icon className="h-4 w-4 text-primary" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold">
                            {mode?.label || result.mode}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {preview.split("\n").filter((l) => l.trim())[0] || preview}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex items-center gap-2 pt-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Consultez les réponses détaillées ci-dessus pour analyser les convergences
                      et divergences entre les modes
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// Tab 3: Visualisation (Placeholder)
// ═══════════════════════════════════════

function VisualizationTab() {
  return (
    <div className="flex flex-col gap-6">
      {/* Placeholder Card */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">Visualisation de connaissances</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            Cartographie conceptuelle générée par IA à partir de vos sources et notes de recherche.
            Visualisez les liens entre concepts, auteurs et théories.
          </p>
          <Badge variant="secondary" className="mt-4 gap-1.5">
            <Sparkles className="h-3 w-3" />
            Bientôt disponible
          </Badge>
        </CardContent>
      </Card>

      {/* Feature Preview Skeleton */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Network className="h-4 w-4 text-primary" />
            Aperçu de la fonctionnalité
          </CardTitle>
          <CardDescription className="text-xs">
            Cette fonctionnalité sera disponible dans une prochaine version
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Concept Map Skeleton */}
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Network className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-xs font-medium text-muted-foreground">
                  Carte conceptuelle
                </p>
                <p className="text-[10px] text-muted-foreground/70 mt-1">
                  Visualisation graphique des liens entre concepts
                </p>
                <div className="mt-4 flex gap-2 flex-wrap justify-center">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-5 w-18 rounded-full" />
                </div>
              </CardContent>
            </Card>

            {/* Author Network Skeleton */}
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Brain className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-xs font-medium text-muted-foreground">
                  Réseau d&apos;auteurs
                </p>
                <p className="text-[10px] text-muted-foreground/70 mt-1">
                  Co-citations et influences entre chercheurs
                </p>
                <div className="mt-4 flex gap-3 justify-center">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </CardContent>
            </Card>

            {/* Timeline Skeleton */}
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Eye className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-xs font-medium text-muted-foreground">
                  Chronologie thématique
                </p>
                <p className="text-[10px] text-muted-foreground/70 mt-1">
                  Évolution des concepts dans le temps
                </p>
                <div className="mt-4 flex flex-col gap-1.5 w-full max-w-[140px]">
                  <Skeleton className="h-2 w-full rounded" />
                  <Skeleton className="h-2 w-3/4 rounded" />
                  <Skeleton className="h-2 w-5/6 rounded" />
                  <Skeleton className="h-2 w-2/3 rounded" />
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Conseil pour la visualisation</p>
              <p className="text-xs text-muted-foreground mt-1">
                Pour tirer le meilleur parti de cette fonctionnalité à venir, commencez par
                alimenter votre carnet de recherche avec des sources et des notes dans
                l&apos;onglet &quot;Carnet de recherche&quot;. Plus vous ajouterez de contenu,
                plus les visualisations seront riches et pertinentes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
