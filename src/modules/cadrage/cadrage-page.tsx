"use client";

import { useState, useCallback, useMemo } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Crosshair,
  Plus,
  Trash2,
  Sparkles,
  Save,
  Camera,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

interface Thesis {
  id: string;
  title: string;
  author: string;
  status: string;
}

interface CadrageField {
  id: string;
  fieldKey: string;
  label: string;
  value?: string | null;
  aiSuggestion?: string | null;
  isLocked: boolean;
  sortOrder: number;
}

interface Cadrage {
  id: string;
  thesisId: string;
  label?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  fields: CadrageField[];
}

interface CadrageVersion {
  id: string;
  cadrageId: string;
  label?: string | null;
  snapshot: string;
  createdAt: string;
}

// ═══════════════════════════════════════
// Constants — Predefined field keys
// ═══════════════════════════════════════

const PREDEFINED_FIELDS = [
  { fieldKey: "theme", label: "Thème de recherche" },
  { fieldKey: "problématique", label: "Problématique" },
  { fieldKey: "methodologie", label: "Méthodologie" },
  { fieldKey: "hypothese", label: "Hypothèse" },
  { fieldKey: "cadre_theorique", label: "Cadre théorique" },
  { fieldKey: "terrain", label: "Terrain d'étude" },
  { fieldKey: "resultats_attendus", label: "Résultats attendus" },
  { fieldKey: "originalite", label: "Originalité et contribution" },
] as const;

// ═══════════════════════════════════════
// Query Keys
// ═══════════════════════════════════════

const cadrageKeys = {
  all: ["cadrage"] as const,
  lists: () => [...cadrageKeys.all, "list"] as const,
  list: (thesisId: string) =>
    [...cadrageKeys.lists(), thesisId] as const,
  details: () => [...cadrageKeys.all, "detail"] as const,
  detail: (id: string) => [...cadrageKeys.details(), id] as const,
  fields: (cadrageId: string) =>
    [...cadrageKeys.detail(cadrageId), "fields"] as const,
  versions: (cadrageId: string) =>
    [...cadrageKeys.detail(cadrageId), "versions"] as const,
};

// ═══════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════

function CadrageListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-lg border p-3"
        >
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-5 w-14" />
        </div>
      ))}
    </div>
  );
}

function FieldEditorSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-7 w-24" />
          </div>
          <Skeleton className="h-20 w-full rounded-md" />
        </div>
      ))}
    </div>
  );
}

function VersionRow({ version }: { version: CadrageVersion }) {
  const parsedSnapshot = useMemo(() => {
    try {
      const fields = JSON.parse(version.snapshot) as CadrageField[];
      const filled = fields.filter((f) => f.value && f.value.trim().length > 0).length;
      return { count: fields.length, filled };
    } catch {
      return { count: 0, filled: 0 };
    }
  }, [version.snapshot]);

  const date = new Date(version.createdAt);
  const dateStr = date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="flex flex-col gap-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {version.label ?? "Version sans titre"}
        </p>
        <p className="text-xs text-muted-foreground">{dateStr}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant="outline" className="text-xs tabular-nums">
          {parsedSnapshot.filled}/{parsedSnapshot.count} champs
        </Badge>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// Main Component
// ═══════════════════════════════════════

export function CadragePage() {
  const queryClient = useQueryClient();

  // --- Local state ---
  const [selectedThesisId, setSelectedThesisId] = useState<string>("");
  const [selectedCadrageId, setSelectedCadrageId] = useState<string>("");
  const [newCadrageLabel, setNewCadrageLabel] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newVersionLabel, setNewVersionLabel] = useState("");
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [editLabel, setEditLabel] = useState("");
  const [isEditingLabel, setIsEditingLabel] = useState(false);

  // --- Field local edits (optimistic-like) ---
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  // ═══════════════════════════════════════
  // Queries
  // ═══════════════════════════════════════

  const {
    data: theses,
    isLoading: thesesLoading,
  } = useQuery<Thesis[]>({
    queryKey: ["thesis", "list"],
    queryFn: async () => {
      const res = await fetch("/api/thesis");
      if (!res.ok) throw new Error("Erreur de chargement des thèses");
      const json = await res.json();
      return json.data as Thesis[];
    },
  });

  const {
    data: cadragesData,
    isLoading: cadragesLoading,
  } = useQuery<{ data: Cadrage[]; meta: { count: number } }>({
    queryKey: cadrageKeys.list(selectedThesisId),
    queryFn: async () => {
      const res = await fetch(`/api/thesis/${selectedThesisId}/cadrages`);
      if (!res.ok) throw new Error("Erreur de chargement des cadrages");
      return res.json();
    },
    enabled: !!selectedThesisId,
  });

  const cadrages = useMemo(
    () => cadragesData?.data ?? [],
    [cadragesData?.data]
  );
  const activeCadrage = useMemo(
    () =>
      selectedCadrageId
        ? cadrages.find((c) => c.id === selectedCadrageId) ?? null
        : null,
    [cadrages, selectedCadrageId]
  );

  const { data: fieldsData, isLoading: fieldsLoading } = useQuery<{
    data: CadrageField[];
  }>({
    queryKey: cadrageKeys.fields(selectedCadrageId),
    queryFn: async () => {
      const res = await fetch(`/api/cadrages/${selectedCadrageId}/fields`);
      if (!res.ok) throw new Error("Erreur de chargement des champs");
      return res.json();
    },
    enabled: !!selectedCadrageId,
  });

  const fields = fieldsData?.data ?? [];

  const { data: versionsData, isLoading: versionsLoading } = useQuery<{
    data: CadrageVersion[];
  }>({
    queryKey: cadrageKeys.versions(selectedCadrageId),
    queryFn: async () => {
      const res = await fetch(`/api/cadrages/${selectedCadrageId}/versions`);
      if (!res.ok) throw new Error("Erreur de chargement des versions");
      return res.json();
    },
    enabled: !!selectedCadrageId,
  });

  const versions = versionsData?.data ?? [];

  // ═══════════════════════════════════════
  // Mutations
  // ═══════════════════════════════════════

  const createCadrageMutation = useMutation({
    mutationFn: async ({
      thesisId,
      label,
    }: {
      thesisId: string;
      label?: string;
    }) => {
      const res = await fetch(`/api/thesis/${thesisId}/cadrages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thesisId,
          label: label || undefined,
          fields: PREDEFINED_FIELDS.map((f, i) => ({
            fieldKey: f.fieldKey,
            label: f.label,
            sortOrder: i,
          })),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur de création");
      }
      const json = await res.json();
      return json.data as Cadrage;
    },
    onSuccess: (cadrage) => {
      queryClient.invalidateQueries({ queryKey: cadrageKeys.all });
      setSelectedCadrageId(cadrage.id);
      setCreateDialogOpen(false);
      setNewCadrageLabel("");
      toast.success("Cadrage créé avec succès");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const deleteCadrageMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/cadrages/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur de suppression");
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: cadrageKeys.all });
      if (selectedCadrageId === id) {
        setSelectedCadrageId("");
      }
      toast.success("Cadrage supprimé");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });

  const updateCadrageMutation = useMutation({
    mutationFn: async ({
      id,
      ...data
    }: { id: string; label?: string; isActive?: boolean }) => {
      const res = await fetch(`/api/cadrages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erreur de mise à jour");
      const json = await res.json();
      return json.data as Cadrage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cadrageKeys.all });
      toast.success("Cadrage mis à jour");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour");
    },
  });

  const updateFieldMutation = useMutation({
    mutationFn: async ({
      fieldId,
      value,
    }: {
      fieldId: string;
      value: string;
    }) => {
      const res = await fetch(`/api/cadrages/fields/${fieldId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      if (!res.ok) throw new Error("Erreur de sauvegarde");
      const json = await res.json();
      return json.data as CadrageField;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cadrageKeys.all });
    },
    onError: () => {
      toast.error("Erreur lors de la sauvegarde du champ");
    },
  });

  const createVersionMutation = useMutation({
    mutationFn: async ({
      cadrageId,
      label,
    }: {
      cadrageId: string;
      label?: string;
    }) => {
      const res = await fetch(`/api/cadrages/${cadrageId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur de création");
      }
      const json = await res.json();
      return json.data as CadrageVersion;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cadrageKeys.versions(selectedCadrageId) });
      setVersionDialogOpen(false);
      setNewVersionLabel("");
      toast.success("Version sauvegardée");
    },
    onError: () => {
      toast.error("Erreur lors de la sauvegarde de la version");
    },
  });

  // ═══════════════════════════════════════
  // Derived state
  // ═══════════════════════════════════════

  const totalFields = fields.length;
  const filledFields = fields.filter((f) => {
    const val = fieldValues[f.id] !== undefined ? fieldValues[f.id] : f.value;
    return !!val && val.trim().length > 0;
  }).length;
  const progressPercent =
    totalFields > 0
      ? Math.round((filledFields / totalFields) * 100)
      : 0;

  // ═══════════════════════════════════════
  // Handlers
  // ═══════════════════════════════════════

  const handleFieldChange = useCallback(
    (fieldId: string, value: string) => {
      setFieldValues((prev) => ({ ...prev, [fieldId]: value }));
    },
    []
  );

  const handleSaveField = useCallback(
    (fieldId: string) => {
      const value = fieldValues[fieldId];
      if (value === undefined) return;
      updateFieldMutation.mutate({ fieldId, value });
    },
    [fieldValues, updateFieldMutation]
  );

  const handleAiSuggestion = useCallback(() => {
    toast.info("Fonctionnalité IA à venir", {
      description:
        "La suggestion automatique par intelligence artificielle sera bientôt disponible.",
    });
  }, []);

  const handleSaveLabel = useCallback(() => {
    if (!activeCadrage || !editLabel.trim()) {
      setIsEditingLabel(false);
      return;
    }
    updateCadrageMutation.mutate({
      id: activeCadrage.id,
      label: editLabel.trim(),
    });
    setIsEditingLabel(false);
  }, [activeCadrage, editLabel, updateCadrageMutation]);

  const handleToggleActive = useCallback(() => {
    if (!activeCadrage) return;
    updateCadrageMutation.mutate({
      id: activeCadrage.id,
      isActive: !activeCadrage.isActive,
    });
  }, [activeCadrage, updateCadrageMutation]);

  // Sync editLabel when activeCadrage changes
  const currentLabel = activeCadrage?.label ?? "Cadrage sans titre";
  if (activeCadrage && !isEditingLabel && editLabel !== currentLabel) {
    setEditLabel(currentLabel);
  }

  // ═══════════════════════════════════════
  // Render
  // ═══════════════════════════════════════

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 p-6">
      {/* ═══ Header ═══ */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
            <Crosshair className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Cadrage de la thèse
            </h1>
            <p className="text-sm text-muted-foreground">
              Définissez et affinez les éléments fondamentaux de votre
              recherche
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* ═══ Two-column layout ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6">
        {/* ─── Left panel ─── */}
        <div className="flex flex-col gap-4">
          {/* Thesis selector */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Sélection de thèse
              </CardTitle>
              <CardDescription>
                Choisissez la thèse à cadrer
              </CardDescription>
            </CardHeader>
            <CardContent>
              {thesesLoading ? (
                <Skeleton className="h-9 w-full" />
              ) : !theses || theses.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-4 text-center">
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Aucune thèse disponible
                  </p>
                </div>
              ) : (
                <Select
                  value={selectedThesisId}
                  onValueChange={(val) => {
                    setSelectedThesisId(val);
                    setSelectedCadrageId("");
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner une thèse" />
                  </SelectTrigger>
                  <SelectContent>
                    {theses.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        <span className="truncate">{t.title}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          {/* Cadrage list */}
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  Cadrages
                </CardTitle>
                <Dialog
                  open={createDialogOpen}
                  onOpenChange={setCreateDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      disabled={!selectedThesisId}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Nouveau
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nouveau cadrage</DialogTitle>
                      <DialogDescription>
                        Créez un nouveau cadrage pour votre thèse. Les 8
                        champs prédéfinis seront ajoutés automatiquement.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-2">
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="cadrage-label"
                          className="text-sm font-medium"
                        >
                          Libellé
                        </label>
                        <Input
                          id="cadrage-label"
                          placeholder="Ex : Cadrage initial v1"
                          value={newCadrageLabel}
                          onChange={(e) =>
                            setNewCadrageLabel(e.target.value)
                          }
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {PREDEFINED_FIELDS.length} champs seront créés :{" "}
                        {PREDEFINED_FIELDS.map((f) => f.label).join(", ")}
                      </p>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setCreateDialogOpen(false)}
                      >
                        Annuler
                      </Button>
                      <Button
                        onClick={() =>
                          createCadrageMutation.mutate({
                            thesisId: selectedThesisId,
                            label: newCadrageLabel || undefined,
                          })
                        }
                        disabled={createCadrageMutation.isPending}
                      >
                        {createCadrageMutation.isPending
                          ? "Création..."
                          : "Créer"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {!selectedThesisId ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted">
                    <Crosshair className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sélectionnez une thèse pour voir ses cadrages
                  </p>
                </div>
              ) : cadragesLoading ? (
                <CadrageListSkeleton />
              ) : cadrages.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted">
                    <Plus className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Aucun cadrage pour cette thèse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Créez votre premier cadrage pour commencer.
                  </p>
                </div>
              ) : (
                <ScrollArea className="max-h-[400px] overflow-y-auto">
                  <div className="flex flex-col gap-2 pr-2">
                    {cadrages.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className={
                          "flex items-center justify-between rounded-lg border p-3 text-left transition-colors w-full " +
                          (selectedCadrageId === c.id
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted/50")
                        }
                        onClick={() => setSelectedCadrageId(c.id)}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {c.isActive ? (
                            <CheckCircle2 className="h-4 w-4 text-chart-1 shrink-0" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border border-muted-foreground/30 shrink-0" />
                          )}
                          <span className="text-sm font-medium truncate">
                            {c.label || "Cadrage sans titre"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge
                            variant="outline"
                            className="text-[10px] tabular-nums"
                          >
                            {c.fields.length} champ
                            {c.fields.length > 1 ? "s" : ""}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ─── Right panel ─── */}
        {!activeCadrage ? (
          <Card className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-3 text-center px-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-muted">
                <Crosshair className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  Aucun cadrage sélectionné
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Sélectionnez un cadrage dans la liste de gauche ou
                  créez-en un nouveau pour commencer à éditer.
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {isEditingLabel ? (
                    <Input
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      onBlur={handleSaveLabel}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveLabel();
                        if (e.key === "Escape") setIsEditingLabel(false);
                      }}
                      className="text-lg font-bold h-8"
                      autoFocus
                    />
                  ) : (
                    <CardTitle
                      className="text-lg font-bold cursor-pointer hover:text-primary transition-colors truncate"
                      onClick={() => {
                        setEditLabel(
                          activeCadrage?.label ?? "Cadrage sans titre"
                        );
                        setIsEditingLabel(true);
                      }}
                      title="Cliquer pour modifier"
                    >
                      {activeCadrage.label || "Cadrage sans titre"}
                    </CardTitle>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant={activeCadrage.isActive ? "default" : "outline"}
                    className={
                      activeCadrage.isActive
                        ? "bg-chart-1 text-chart-1-foreground hover:bg-chart-1/90 cursor-pointer"
                        : "cursor-pointer"
                    }
                    onClick={handleToggleActive}
                    title={
                      activeCadrage.isActive
                        ? "Cadrage actif — cliquer pour désactiver"
                        : "Cadrage inactif — cliquer pour activer"
                    }
                  >
                    {activeCadrage.isActive ? "Actif" : "Inactif"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() =>
                      deleteCadrageMutation.mutate(activeCadrage.id)
                    }
                    disabled={deleteCadrageMutation.isPending}
                    title="Supprimer ce cadrage"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Progress indicator */}
              <div className="flex flex-col gap-1.5 mt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Progression du cadrage
                  </span>
                  <span className="font-medium tabular-nums">
                    {filledFields}/{totalFields} — {progressPercent}%
                  </span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
            </CardHeader>

            <Separator />

            <CardContent className="pt-4">
              <Tabs defaultValue="editor" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="editor">
                    Éditeur
                  </TabsTrigger>
                  <TabsTrigger value="versions" className="gap-1.5">
                    <Camera className="h-3.5 w-3.5" />
                    Versions
                    {versions.length > 0 && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] h-4 px-1.5 ml-0.5"
                      >
                        {versions.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                {/* ─── Editor Tab ─── */}
                <TabsContent value="editor">
                  {fieldsLoading ? (
                    <FieldEditorSkeleton />
                  ) : fields.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-12 text-center">
                      <AlertCircle className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Aucun champ dans ce cadrage
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className="max-h-[500px] overflow-y-auto">
                      <div className="flex flex-col gap-5 pr-2">
                        {fields.map((field, index) => {
                          const currentValue =
                            fieldValues[field.id] !== undefined
                              ? fieldValues[field.id]
                              : field.value ?? "";
                          const isFilled = currentValue.trim().length > 0;

                          return (
                            <div
                              key={field.id}
                              className="flex flex-col gap-2"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                                    {index + 1}
                                  </span>
                                  <label
                                    htmlFor={field.id}
                                    className="text-sm font-semibold"
                                  >
                                    {field.label}
                                  </label>
                                  {isFilled ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-chart-1" />
                                  ) : null}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 gap-1 text-xs"
                                    onClick={handleAiSuggestion}
                                    title="Suggestion IA"
                                  >
                                    <Sparkles className="h-3 w-3 text-chart-2" />
                                    IA
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 gap-1 text-xs"
                                    onClick={() =>
                                      handleSaveField(field.id)
                                    }
                                    disabled={
                                      updateFieldMutation.isPending
                                    }
                                    title="Sauvegarder ce champ"
                                  >
                                    <Save className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <Textarea
                                id={field.id}
                                value={currentValue}
                                onChange={(e) =>
                                  handleFieldChange(
                                    field.id,
                                    e.target.value
                                  )
                                }
                                onBlur={() =>
                                  handleSaveField(field.id)
                                }
                                placeholder={
                                  "Décrivez votre " +
                                  field.label.toLowerCase() +
                                  "..."
                                }
                                className={
                                  "min-h-[80px] resize-y text-sm " +
                                  (isFilled
                                    ? "border-chart-1/30 focus-visible:ring-chart-1/20"
                                    : "")
                                }
                              />
                              {field.aiSuggestion && (
                                <div className="rounded-md border border-chart-2/20 bg-chart-2/5 p-2.5">
                                  <p className="text-[11px] font-medium text-chart-2 mb-1">
                                    <Sparkles className="h-3 w-3 inline mr-1" />
                                    Suggestion IA
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {field.aiSuggestion}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  )}
                </TabsContent>

                {/* ─── Versions Tab ─── */}
                <TabsContent value="versions">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Historique des instantanés de votre cadrage
                      </p>
                      <Dialog
                        open={versionDialogOpen}
                        onOpenChange={setVersionDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5"
                          >
                            <Camera className="h-3.5 w-3.5" />
                            Nouvelle version
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Sauvegarder une version
                            </DialogTitle>
                            <DialogDescription>
                              Un instantané de tous les champs sera créé.
                              Vous pourrez le consulter ultérieurement.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex flex-col gap-4 py-2">
                            <div className="flex flex-col gap-1.5">
                              <label
                                htmlFor="version-label"
                                className="text-sm font-medium"
                              >
                                Libellé de la version
                              </label>
                              <Input
                                id="version-label"
                                placeholder="Ex : Révision après directeur"
                                value={newVersionLabel}
                                onChange={(e) =>
                                  setNewVersionLabel(e.target.value)
                                }
                              />
                            </div>
                            <div className="rounded-md border bg-muted/50 p-3">
                              <p className="text-xs text-muted-foreground">
                                <span className="font-medium">
                                  {filledFields}/{totalFields}
                                </span>{" "}
                                champs remplis — cette version contiendra
                                l&apos;état actuel de tous les champs.
                              </p>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setVersionDialogOpen(false)}
                            >
                              Annuler
                            </Button>
                            <Button
                              onClick={() =>
                                createVersionMutation.mutate({
                                  cadrageId: selectedCadrageId,
                                  label:
                                    newVersionLabel || undefined,
                                })
                              }
                              disabled={
                                createVersionMutation.isPending
                              }
                            >
                              {createVersionMutation.isPending
                                ? "Sauvegarde..."
                                : "Sauvegarder"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <Separator />

                    {versionsLoading ? (
                      <div className="flex flex-col gap-3">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between rounded-lg border p-3"
                          >
                            <div className="flex flex-col gap-1">
                              <Skeleton className="h-4 w-36" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                            <Skeleton className="h-5 w-16" />
                          </div>
                        ))}
                      </div>
                    ) : versions.length === 0 ? (
                      <div className="flex flex-col items-center gap-3 py-12 text-center">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted">
                          <Camera className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Aucune version sauvegardée
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Créez un instantané pour conserver l&apos;état
                          actuel de votre cadrage.
                        </p>
                      </div>
                    ) : (
                      <ScrollArea className="max-h-[400px] overflow-y-auto">
                        <div className="flex flex-col gap-2 pr-2">
                          {versions.map((v) => (
                            <VersionRow key={v.id} version={v} />
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
