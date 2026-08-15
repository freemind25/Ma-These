"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Route,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Loader2,
  KanbanSquare,
  CheckCircle2,
  Clock,
  BarChart3,
  FolderKanban,
  ArrowRightToLine,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useAiConfig } from "@/hooks/use-ai-config";

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

interface AgileStory {
  id: string;
  sprintId: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  storyPoints?: number | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface AgileSprint {
  id: string;
  phase: string;
  title: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status: string;
  sortOrder: number;
  stories?: AgileStory[];
  _count?: { stories: number };
  createdAt: string;
  updatedAt: string;
}

// ═══════════════════════════════════════
// Constants
// ═══════════════════════════════════════

const COLUMNS = [
  { id: "todo", label: "À faire", sublabel: "Backlog", icon: FolderKanban } as const,
  { id: "in_progress", label: "En cours", sublabel: "En travaux", icon: Clock } as const,
  { id: "in_review", label: "En revue", sublabel: "À vérifier", icon: Eye } as const,
  { id: "done", label: "Terminé", sublabel: "Complété", icon: CheckCircle2 } as const,
] as const;

type ColumnId = (typeof COLUMNS)[number]["id"];

const PHASE_LABELS: Record<string, string> = {
  phase_0: "Cadrage",
  phase_1: "Revue",
  phase_2: "Rédaction",
  phase_3: "Révision",
  phase_4: "Finalisation",
};

const PRIORITY_LABELS: Record<string, { label: string; className: string }> = {
  critical: { label: "Critique", className: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/25" },
  high: { label: "Haute", className: "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/25" },
  medium: { label: "Moyenne", className: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25" },
  low: { label: "Basse", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25" },
};

const PHASE_COLORS: Record<string, string> = {
  phase_0: "bg-chart-4/15 text-chart-4 border-chart-4/25",
  phase_1: "bg-chart-1/15 text-chart-1 border-chart-1/25",
  phase_2: "bg-chart-2/15 text-chart-2 border-chart-2/25",
  phase_3: "bg-chart-3/15 text-chart-3 border-chart-3/25",
  phase_4: "bg-chart-5/15 text-chart-5 border-chart-5/25",
};

// Map 4-column UI status to 3-value DB status
function toApiStatus(columnId: ColumnId): string {
  if (columnId === "in_review") return "in_progress";
  return columnId;
}

// ═══════════════════════════════════════
// Component
// ═══════════════════════════════════════

export function FeuilleRouteAgilePage() {
  const { withAiConfig } = useAiConfig();
  const queryClient = useQueryClient();
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);
  const [createSprintOpen, setCreateSprintOpen] = useState(false);
  const [createStoryOpen, setCreateStoryOpen] = useState(false);

  // ─── Create Sprint form state ───
  const [newSprintTitle, setNewSprintTitle] = useState("");
  const [newSprintPhase, setNewSprintPhase] = useState("phase_2");
  const [newSprintDesc, setNewSprintDesc] = useState("");

  // ─── Create Story form state ───
  const [newStoryTitle, setNewStoryTitle] = useState("");
  const [newStoryDesc, setNewStoryDesc] = useState("");
  const [newStoryPriority, setNewStoryPriority] = useState("medium");
  const [newStoryPoints, setNewStoryPoints] = useState("");

  // ─── Track which column each story is visually in (for "in_review" which has no DB status) ───
  const [storyColumnMap, setStoryColumnMap] = useState<Record<string, ColumnId>>({});

  // ─── Active tab ───
  const [activeTab, setActiveTab] = useState("kanban");

  // ═══════════════════════════════════════
  // Queries
  // ═══════════════════════════════════════

  const { data: sprintsData, isLoading: sprintsLoading } = useQuery<{
    data: AgileSprint[];
  }>({ queryKey: ["sprints"], queryFn: () => fetch("/api/sprints").then((r) => r.json()) });

  const sprints = sprintsData?.data ?? [];

  // Auto-select first sprint if none selected
  const activeSprintId = selectedSprintId ?? sprints[0]?.id ?? null;

  const { data: activeSprintData, isLoading: sprintLoading } = useQuery<{
    data: AgileSprint;
  }>({
    queryKey: ["sprint", activeSprintId],
    queryFn: () => fetch(`/api/sprints/${activeSprintId}`).then((r) => r.json()),
    enabled: !!activeSprintId,
  });

  const activeSprint = activeSprintData?.data ?? null;
  const stories = activeSprint?.stories ?? [];

  // ═══════════════════════════════════════
  // Mutations
  // ═══════════════════════════════════════

  const createSprintMutation = useMutation({
    mutationFn: async (body: { phase: string; title: string; description?: string }) => {
      const res = await fetch("/api/sprints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Erreur lors de la création du sprint");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sprints"] });
      setSelectedSprintId(data.data.id);
      setCreateSprintOpen(false);
      setNewSprintTitle("");
      setNewSprintDesc("");
      toast.success("Sprint créé avec succès");
    },
    onError: () => toast.error("Impossible de créer le sprint"),
  });

  const createStoryMutation = useMutation({
    mutationFn: async (body: {
      title: string;
      description?: string;
      priority: string;
      storyPoints?: number;
    }) => {
      if (!activeSprintId) throw new Error("Aucun sprint sélectionné");
      const res = await fetch(`/api/sprints/${activeSprintId}/stories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Erreur lors de la création de la story");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sprint", activeSprintId] });
      queryClient.invalidateQueries({ queryKey: ["sprints"] });
      setCreateStoryOpen(false);
      setNewStoryTitle("");
      setNewStoryDesc("");
      setNewStoryPriority("medium");
      setNewStoryPoints("");
      toast.success("Story ajoutée au sprint");
    },
    onError: () => toast.error("Impossible de créer la story"),
  });

  const updateStoryMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/stories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Erreur lors de la mise à jour");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sprint", activeSprintId] });
      queryClient.invalidateQueries({ queryKey: ["sprints"] });
    },
    onError: () => toast.error("Impossible de déplacer la story"),
  });

  const deleteStoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/stories/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sprint", activeSprintId] });
      queryClient.invalidateQueries({ queryKey: ["sprints"] });
      toast.success("Story supprimée");
    },
    onError: () => toast.error("Impossible de supprimer la story"),
  });

  const deleteSprintMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/sprints/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      return res.json();
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["sprints"] });
      if (selectedSprintId === deletedId) setSelectedSprintId(null);
      toast.success("Sprint supprimé");
    },
    onError: () => toast.error("Impossible de supprimer le sprint"),
  });

  const generateSprintMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/ai-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(withAiConfig({
          mode: "sprint_planning",
          input: `Phase de thèse: ${PHASE_LABELS[activeSprint?.phase ?? "phase_2"] ?? "Rédaction"}. Sprint actuel: ${activeSprint?.title ?? ""}. Stories existantes: ${stories.map((s) => s.title).join(", ") || "aucune"}. Génère un plan de sprint avec 4-6 stories utilisateur pour la thèse.`,
        })),
      });
      if (!res.ok) throw new Error("Erreur IA");
      return res.json();
    },
    onSuccess: (data) => {
      toast.success("Suggestion IA générée", {
        description: "Consultez les suggestions dans la zone de texte.",
      });
      setAiSuggestion(data.data?.result ?? data.result ?? "Aucune suggestion générée.");
    },
    onError: () => toast.error("Impossible de générer des suggestions IA"),
  });

  const [aiSuggestion, setAiSuggestion] = useState("");

  // ═══════════════════════════════════════
  // Column assignment logic
  // ═══════════════════════════════════════

  const getStoryColumn = useCallback(
    (story: AgileStory): ColumnId => {
      // Check local override first
      if (storyColumnMap[story.id]) return storyColumnMap[story.id];
      // Default: map DB status to column
      return story.status as ColumnId;
    },
    [storyColumnMap]
  );

  const columnStories = useMemo(() => {
    const map: Record<ColumnId, AgileStory[]> = {
      todo: [],
      in_progress: [],
      in_review: [],
      done: [],
    };
    for (const story of stories) {
      const col = getStoryColumn(story);
      map[col].push(story);
    }
    return map;
  }, [stories, getStoryColumn]);

  // ═══════════════════════════════════════
  // Move story between columns
  // ═══════════════════════════════════════

  const moveStory = useCallback(
    (storyId: string, direction: "left" | "right") => {
      const story = stories.find((s) => s.id === storyId);
      if (!story) return;

      const currentCol = getStoryColumn(story);
      const currentIndex = COLUMNS.findIndex((c) => c.id === currentCol);
      const newIndex = direction === "right" ? currentIndex + 1 : currentIndex - 1;

      if (newIndex < 0 || newIndex >= COLUMNS.length) return;

      const targetColumn = COLUMNS[newIndex].id;
      const apiStatus = toApiStatus(targetColumn);

      // Update local column map
      setStoryColumnMap((prev) => ({ ...prev, [storyId]: targetColumn }));

      // Persist to DB
      updateStoryMutation.mutate({ id: storyId, status: apiStatus });
    },
    [stories, getStoryColumn, updateStoryMutation]
  );

  // ═══════════════════════════════════════
  // Statistics
  // ═══════════════════════════════════════

  const stats = useMemo(() => {
    const total = stories.length;
    const done = stories.filter((s) => s.status === "done").length;
    const inProgress = stories.filter((s) => s.status === "in_progress").length;
    const totalPoints = stories.reduce((sum, s) => sum + (s.storyPoints ?? 0), 0);
    const avgPoints = total > 0 ? Math.round((totalPoints / total) * 10) / 10 : 0;
    const progressPercent = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, inProgress, avgPoints, totalPoints, progressPercent };
  }, [stories]);

  // ═══════════════════════════════════════
  // Handlers
  // ═══════════════════════════════════════

  const handleCreateSprint = () => {
    if (!newSprintTitle.trim()) {
      toast.error("Le titre du sprint est requis");
      return;
    }
    createSprintMutation.mutate({
      phase: newSprintPhase,
      title: newSprintTitle.trim(),
      description: newSprintDesc.trim() || undefined,
    });
  };

  const handleCreateStory = () => {
    if (!newStoryTitle.trim()) {
      toast.error("Le titre de la story est requis");
      return;
    }
    createStoryMutation.mutate({
      title: newStoryTitle.trim(),
      description: newStoryDesc.trim() || undefined,
      priority: newStoryPriority,
      storyPoints: newStoryPoints ? parseInt(newStoryPoints, 10) : undefined,
    });
  };

  // ═══════════════════════════════════════
  // Render helpers
  // ═══════════════════════════════════════

  const renderStoryCard = (story: AgileStory, colIndex: number) => {
    const priority = PRIORITY_LABELS[story.priority] ?? PRIORITY_LABELS.medium;
    const phase = activeSprint?.phase ?? "phase_2";
    const phaseColor = PHASE_COLORS[phase] ?? "";
    const phaseLabel = PHASE_LABELS[phase] ?? "Rédaction";

    return (
      <Card key={story.id} className="p-3 flex flex-col gap-2 group hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-snug flex-1">{story.title}</p>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            onClick={() => deleteStoryMutation.mutate(story.id)}
          >
            <Trash2 className="h-3 w-3 text-muted-foreground" />
          </Button>
        </div>
        {story.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{story.description}</p>
        )}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${priority.className}`}>
            {priority.label}
          </Badge>
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${phaseColor}`}>
            {phaseLabel}
          </Badge>
          {story.storyPoints != null && story.storyPoints > 0 && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {story.storyPoints} pt{story.storyPoints > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 justify-end pt-1">
          {colIndex > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => moveStory(story.id, "left")}
              title={"Déplacer vers " + COLUMNS[colIndex - 1].label}
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
          )}
          {colIndex < COLUMNS.length - 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => moveStory(story.id, "right")}
              title={"Déplacer vers " + COLUMNS[colIndex + 1].label}
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          )}
        </div>
      </Card>
    );
  };

  // ═══════════════════════════════════════
  // Loading state
  // ═══════════════════════════════════════

  if (sprintsLoading) {
    return (
      <div className="max-w-6xl mx-auto flex flex-col gap-6 p-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // Empty state — no sprints
  // ═══════════════════════════════════════

  if (sprints.length === 0) {
    return (
      <div className="max-w-6xl mx-auto flex flex-col gap-6 p-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-chart-1/15">
            <Route className="h-4 w-4 text-chart-1" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Feuille de Route Agile</h1>
            <p className="text-sm text-muted-foreground">
              Planifiez et suivez la progression de votre thèse avec la méthode agile
            </p>
          </div>
        </div>
        <Separator />
        <Card className="p-8 flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-muted">
            <KanbanSquare className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-medium">Aucun sprint créé</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Commencez par créer votre premier sprint pour organiser le travail de votre thèse.
            </p>
          </div>
          <Dialog open={createSprintOpen} onOpenChange={setCreateSprintOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Créer un sprint
              </Button>
            </DialogTrigger>
            {renderCreateSprintDialog()}
          </Dialog>
        </Card>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // Main render
  // ═══════════════════════════════════════

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 p-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-chart-1/15">
            <Route className="h-4 w-4 text-chart-1" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Feuille de Route Agile</h1>
            <p className="text-sm text-muted-foreground">
              Planifiez et suivez la progression de votre thèse
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Dialog open={createSprintOpen} onOpenChange={setCreateSprintOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1.5" />
                Nouveau sprint
              </Button>
            </DialogTrigger>
            {renderCreateSprintDialog()}
          </Dialog>
          <Dialog open={createStoryOpen} onOpenChange={setCreateStoryOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={!activeSprintId}>
                <Plus className="h-4 w-4 mr-1.5" />
                Nouvelle story
              </Button>
            </DialogTrigger>
            {renderCreateStoryDialog()}
          </Dialog>
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateSprintMutation.mutate()}
            disabled={generateSprintMutation.isPending || !activeSprintId}
          >
            {generateSprintMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-1.5" />
            )}
            Générer le prochain sprint
          </Button>
        </div>
      </div>

      <Separator />

      {/* ─── Sprint selector ─── */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium shrink-0">Sprint actif :</Label>
          <Select value={activeSprintId ?? ""} onValueChange={setSelectedSprintId}>
            <SelectTrigger className="w-[260px]">
              <SelectValue placeholder="Sélectionner un sprint" />
            </SelectTrigger>
            <SelectContent>
              {sprints.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  <div className="flex items-center gap-2">
                    <span>{s.title}</span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 ${PHASE_COLORS[s.phase] ?? ""}`}
                    >
                      {PHASE_LABELS[s.phase] ?? s.phase}
                    </Badge>
                    {s.status === "active" && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        Actif
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {activeSprint && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => deleteSprintMutation.mutate(activeSprint.id)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Supprimer ce sprint
          </Button>
        )}
      </div>

      {/* ─── Tabs: Kanban / Statistics ─── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="kanban" className="gap-1.5">
            <KanbanSquare className="h-3.5 w-3.5" />
            Tableau Kanban
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            Statistiques
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="mt-4 space-y-4">
          {activeSprint && (
            <>
              {/* ─── Sprint info + progress ─── */}
              <Card className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{activeSprint.title}</h3>
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 ${PHASE_COLORS[activeSprint.phase] ?? ""}`}
                      >
                        {PHASE_LABELS[activeSprint.phase] ?? activeSprint.phase}
                      </Badge>
                    </div>
                    {activeSprint.description && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {activeSprint.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-2xl font-bold">{stats.progressPercent}%</p>
                      <p className="text-xs text-muted-foreground">
                        {stats.done}/{stats.total} stories
                      </p>
                    </div>
                  </div>
                </div>
                <Progress value={stats.progressPercent} className="mt-3 h-2" />
              </Card>

              {/* ─── Quick stats row ─── */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center h-7 w-7 rounded-md bg-muted">
                      <FolderKanban className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{stats.total}</p>
                      <p className="text-[11px] text-muted-foreground">Stories totales</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center h-7 w-7 rounded-md bg-emerald-500/15">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{stats.done}</p>
                      <p className="text-[11px] text-muted-foreground">Terminées</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center h-7 w-7 rounded-md bg-amber-500/15">
                      <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{stats.inProgress}</p>
                      <p className="text-[11px] text-muted-foreground">En cours</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center h-7 w-7 rounded-md bg-chart-1/15">
                      <BarChart3 className="h-3.5 w-3.5 text-chart-1" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{stats.avgPoints}</p>
                      <p className="text-[11px] text-muted-foreground">Points/story (moy.)</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* ─── Kanban Board ─── */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {COLUMNS.map((col, colIndex) => {
                  const colStories = columnStories[col.id];
                  const ColIcon = col.icon;
                  return (
                    <div key={col.id} className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 px-1">
                        <ColIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        <h4 className="text-sm font-semibold">{col.label}</h4>
                        <span className="text-xs text-muted-foreground">{col.sublabel}</span>
                        <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">
                          {colStories.length}
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-2 min-h-[120px] max-h-96 overflow-y-auto scrollbar-thin rounded-lg bg-muted/30 p-2 border border-border/50">
                        {sprintLoading ? (
                          Array.from({ length: 2 }).map((_, i) => (
                            <Skeleton key={i} className="h-24 rounded-lg" />
                          ))
                        ) : colStories.length === 0 ? (
                          <div className="flex items-center justify-center h-20 text-xs text-muted-foreground">
                            Aucune story
                          </div>
                        ) : (
                          colStories.map((story) => renderStoryCard(story, colIndex))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ─── AI Suggestion result ─── */}
              {aiSuggestion && (
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-chart-1" />
                    <h3 className="font-semibold text-sm">Suggestion IA — Prochain sprint</h3>
                  </div>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 rounded-md p-3 max-h-64 overflow-y-auto scrollbar-thin">
                    {aiSuggestion}
                  </div>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="stats" className="mt-4 space-y-4">
          {activeSprint && (
            <>
              <Card className="p-6">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Vue d'ensemble du sprint
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex flex-col items-center p-4 rounded-lg bg-muted/50">
                      <p className="text-3xl font-bold">{stats.total}</p>
                      <p className="text-sm text-muted-foreground">Stories totales</p>
                    </div>
                    <div className="flex flex-col items-center p-4 rounded-lg bg-emerald-500/10">
                      <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                        {stats.done}
                      </p>
                      <p className="text-sm text-muted-foreground">Terminées</p>
                    </div>
                    <div className="flex flex-col items-center p-4 rounded-lg bg-amber-500/10">
                      <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                        {stats.inProgress}
                      </p>
                      <p className="text-sm text-muted-foreground">En cours</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center p-4 rounded-lg bg-chart-1/10">
                      <p className="text-3xl font-bold text-chart-1">{stats.totalPoints}</p>
                      <p className="text-sm text-muted-foreground">Points totaux</p>
                    </div>
                    <div className="flex flex-col items-center p-4 rounded-lg bg-chart-2/10">
                      <p className="text-3xl font-bold text-chart-2">{stats.avgPoints}</p>
                      <p className="text-sm text-muted-foreground">Points/story (moyenne)</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Progression globale</span>
                      <span className="text-sm font-bold">{stats.progressPercent}%</span>
                    </div>
                    <Progress value={stats.progressPercent} className="h-3" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.done} story{stats.done !== 1 ? "s" : ""} terminée{stats.done !== 1 ? "s" : ""} sur {stats.total}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-medium mb-3">Répartition par priorité</h4>
                    <div className="space-y-2">
                      {(["critical", "high", "medium", "low"] as const).map((prio) => {
                        const prioStories = stories.filter((s) => s.priority === prio);
                        const prioCount = prioStories.length;
                        const prioDone = prioStories.filter((s) => s.status === "done").length;
                        const prioInfo = PRIORITY_LABELS[prio];
                        return (
                          <div key={prio} className="flex items-center gap-3">
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1.5 py-0 w-20 justify-center shrink-0 ${prioInfo.className}`}
                            >
                              {prioInfo.label}
                            </Badge>
                            <div className="flex-1">
                              <div className="flex items-center justify-between text-xs mb-0.5">
                                <span>{prioCount} story{prioCount !== 1 ? "s" : ""}</span>
                                <span className="text-muted-foreground">
                                  {prioDone}/{prioCount} terminée{prioDone !== 1 ? "s" : ""}
                                </span>
                              </div>
                              <Progress
                                value={prioCount > 0 ? (prioDone / prioCount) * 100 : 0}
                                className="h-1.5"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ─── Phase info ─── */}
              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <ArrowRightToLine className="h-4 w-4 text-muted-foreground" />
                  Phase de thèse associée
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {Object.entries(PHASE_LABELS).map(([key, label]) => {
                    const isActive = activeSprint.phase === key;
                    return (
                      <div
                        key={key}
                        className={`p-3 rounded-lg text-center text-xs font-medium border transition-colors ${
                          isActive
                            ? `${PHASE_COLORS[key]} border-current/25`
                            : "bg-muted/30 text-muted-foreground border-transparent"
                        }`}
                      >
                        {label}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Ce sprint est associé à la phase «
                  {PHASE_LABELS[activeSprint.phase] ?? activeSprint.phase} ». Chaque sprint
                  appartient à une phase spécifique de la thèse.
                </p>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );

  // ═══════════════════════════════════════
  // Dialog renderers (as functions to avoid early return issues)
  // ═══════════════════════════════════════

  function renderCreateSprintDialog() {
    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un nouveau sprint</DialogTitle>
          <DialogDescription>
            Définissez le nom, la phase et la description du sprint.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sprint-title">Titre du sprint</Label>
            <Input
              id="sprint-title"
              placeholder="ex : Sprint 3 — Rédaction chapitre 2"
              value={newSprintTitle}
              onChange={(e) => setNewSprintTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateSprint()}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Phase de thèse</Label>
            <Select value={newSprintPhase} onValueChange={setNewSprintPhase}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PHASE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sprint-desc">Description (optionnel)</Label>
            <Textarea
              id="sprint-desc"
              placeholder="Objectifs et livrables du sprint..."
              value={newSprintDesc}
              onChange={(e) => setNewSprintDesc(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setCreateSprintOpen(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleCreateSprint}
            disabled={createSprintMutation.isPending || !newSprintTitle.trim()}
          >
            {createSprintMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Créer le sprint
          </Button>
        </DialogFooter>
      </DialogContent>
    );
  }

  function renderCreateStoryDialog() {
    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter une story</DialogTitle>
          <DialogDescription>
            Créez une nouvelle story utilisateur pour le sprint «
            {activeSprint?.title ?? ""} ».
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="story-title">Titre de la story</Label>
            <Input
              id="story-title"
              placeholder="ex : Rédiger la section méthodologie"
              value={newStoryTitle}
              onChange={(e) => setNewStoryTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateStory()}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="story-desc">Description (optionnel)</Label>
            <Textarea
              id="story-desc"
              placeholder="Détails de la story utilisateur..."
              value={newStoryDesc}
              onChange={(e) => setNewStoryDesc(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Priorité</Label>
              <Select value={newStoryPriority} onValueChange={setNewStoryPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critique</SelectItem>
                  <SelectItem value="high">Haute</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="low">Basse</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="story-points">Story points</Label>
              <Input
                id="story-points"
                type="number"
                min="0"
                max="100"
                placeholder="ex : 5"
                value={newStoryPoints}
                onChange={(e) => setNewStoryPoints(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setCreateStoryOpen(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleCreateStory}
            disabled={createStoryMutation.isPending || !newStoryTitle.trim()}
          >
            {createStoryMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Ajouter la story
          </Button>
        </DialogFooter>
      </DialogContent>
    );
  }
}
