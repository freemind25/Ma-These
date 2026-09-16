"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  FlaskConical,
  Plus,
  Trash2,
  Loader2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Save,
  Play,
  Timer,
  X,
  Pencil,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface ExpRun {
  id: string;
  experimentId: string;
  label: string;
  variant?: string | null;
  metrics?: string | null;
  result?: string | null;
  evidenceUrl?: string | null;
  status: string;
  verdict?: string | null;
  notes?: string | null;
  startedAt?: string | null;
  sortOrder: number;
}

interface Experiment {
  id: string;
  title: string;
  question: string;
  hypothesisRef?: string | null;
  protocol?: string | null;
  status: string;
  conclusion?: string | null;
  verdict?: string | null;
  tags?: string | null;
  runs: ExpRun[];
}

// ═══════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════

const STATUS_META: Record<string, { label: string; cls: string }> = {
  planned: { label: "Planifiée", cls: "bg-muted text-muted-foreground" },
  running: { label: "En cours", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  concluded: { label: "Conclue", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
};

const RUN_STATUS_META: Record<string, { label: string; cls: string }> = {
  pending: { label: "En attente", cls: "bg-muted text-muted-foreground" },
  running: { label: "En cours", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  done: { label: "Terminé", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
  failed: { label: "Échec", cls: "bg-red-500/15 text-red-700 dark:text-red-400" },
};

function VerdictBadge({ verdict }: { verdict?: string | null }) {
  if (!verdict) return null;
  if (verdict === "supported" || verdict === "confirmed") {
    return (
      <Badge className="bg-emerald-600 hover:bg-emerald-600 text-[10px] gap-1">
        <CheckCircle2 className="h-3 w-3" />
        {verdict === "supported" ? "Hypothèse soutenue" : "Confirmé"}
      </Badge>
    );
  }
  if (verdict === "refuted") {
    return (
      <Badge variant="destructive" className="text-[10px] gap-1">
        <XCircle className="h-3 w-3" />
        Réfuté
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-[10px] gap-1">
      <HelpCircle className="h-3 w-3" />
      Non concluant
    </Badge>
  );
}

function parseMetrics(json?: string | null): { name: string; value: string }[] {
  if (!json) return [];
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr.filter((m) => m && m.name) : [];
  } catch {
    return [];
  }
}

/** Convertit un texte "nom: valeur" multi-lignes en JSON de métriques. */
function metricsTextToJson(text: string): string | null {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return null;
  const arr = lines
    .map((line) => {
      const m = line.match(/^([^:=]+)[:=]\s*(.+)$/);
      return m ? { name: m[1].trim(), value: m[2].trim() } : null;
    })
    .filter(Boolean);
  return arr && arr.length > 0 ? JSON.stringify(arr) : null;
}

function metricsJsonToText(json?: string | null): string {
  return parseMetrics(json)
    .map((m) => `${m.name}: ${m.value}`)
    .join("\n");
}

// ═══════════════════════════════════════════════════════════
// Page principale
// ═══════════════════════════════════════════════════════════

export function ExperimentationsPage() {
  const { toast } = useToast();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/experiments");
      const data = await res.json();
      const list: Experiment[] = (data.data ?? []).map((e: Experiment) => ({
        ...e,
        runs: e.runs ?? [],
      }));
      setExperiments(list);
      setSelectedId((prev) =>
        prev && list.some((e) => e.id === prev) ? prev : list[0]?.id ?? null
      );
    } catch {
      toast({
        title: "Chargement impossible",
        description: "Serveur indisponible",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const selected = useMemo(
    () => experiments.find((e) => e.id === selectedId) ?? null,
    [experiments, selectedId]
  );

  const patchExperiment = useCallback(
    async (id: string, patch: Partial<Experiment>) => {
      const res = await fetch(`/api/experiments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || data.error) {
        toast({
          title: "Mise à jour impossible",
          description: data?.error || `HTTP ${res.status}`,
          variant: "destructive",
        });
        return null;
      }
      setExperiments((prev) =>
        prev.map((e) => (e.id === id ? (data.data as Experiment) : e))
      );
      return data.data as Experiment;
    },
    [toast]
  );

  const deleteExperiment = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/experiments/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast({
          title: "Suppression impossible",
          variant: "destructive",
        });
        return;
      }
      setExperiments((prev) => prev.filter((e) => e.id !== id));
      setSelectedId(null);
      toast({ title: "Expérimentation supprimée" });
    },
    [toast]
  );

  return (
    <div className="container max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FlaskConical className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Journal d'expérimentations</h1>
            <p className="text-sm text-muted-foreground">
              Hypothèses → runs → preuves → verdicts : la traçabilité de vos résultats
            </p>
          </div>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Nouvelle expérimentation
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl lg:col-span-2" />
        </div>
      ) : experiments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <FlaskConical className="h-10 w-10 text-muted-foreground/30" />
            <div>
              <h3 className="text-sm font-medium">Aucune expérimentation</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-md">
                Créez votre première expérimentation pour suivre vos hypothèses :
                chaque variante testée devient un « run » horodaté avec ses mesures,
                ses preuves et son verdict.
              </p>
            </div>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Créer une expérimentation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste */}
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              {experiments.length} expérimentation{experiments.length !== 1 ? "s" : ""}
            </p>
            <div className="max-h-[640px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {experiments.map((exp) => {
                const meta = STATUS_META[exp.status] ?? STATUS_META.planned;
                const runs = exp.runs ?? [];
                const done = runs.filter((r) => r.status === "done").length;
                return (
                  <button
                    key={exp.id}
                    onClick={() => setSelectedId(exp.id)}
                    className={`w-full text-left rounded-lg border p-3 transition-colors space-y-2 ${
                      selectedId === exp.id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold leading-snug">{exp.title}</h3>
                      <span
                        className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${meta.cls}`}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {exp.question}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <VerdictBadge verdict={exp.verdict} />
                      <span className="text-[10px] text-muted-foreground">
                        {runs.length} run{runs.length !== 1 ? "s" : ""}
                        {done > 0 ? ` · ${done} terminé${done !== 1 ? "s" : ""}` : ""}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Détail */}
          <div className="lg:col-span-2">
            {selected ? (
              <ExperimentDetail
                key={selected.id}
                experiment={selected}
                onPatch={(patch) => patchExperiment(selected.id, patch)}
                onDelete={() => deleteExperiment(selected.id)}
              />
            ) : (
              <Card>
                <CardContent className="py-16 text-center text-sm text-muted-foreground">
                  Sélectionnez une expérimentation à gauche.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Dialog création */}
      <CreateExperimentDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(exp) => {
          setExperiments((prev) => [{ ...exp, runs: exp.runs ?? [] }, ...prev]);
          setSelectedId(exp.id);
          setCreateOpen(false);
          toast({ title: "Expérimentation créée", description: exp.title });
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Détail d'une expérimentation
// ═══════════════════════════════════════════════════════════

function ExperimentDetail({
  experiment,
  onPatch,
  onDelete,
}: {
  experiment: Experiment;
  onPatch: (patch: Partial<Experiment>) => Promise<unknown>;
  onDelete: () => void;
}) {
  const { toast } = useToast();
  const [conclusion, setConclusion] = useState(experiment.conclusion ?? "");
  const [runDialogOpen, setRunDialogOpen] = useState(false);
  const [editingRun, setEditingRun] = useState<ExpRun | null>(null);
  const [savingConclusion, setSavingConclusion] = useState(false);

  const stats = useMemo(() => {
    const runs = experiment.runs ?? [];
    return {
      total: runs.length,
      done: runs.filter((r) => r.status === "done").length,
      failed: runs.filter((r) => r.status === "failed").length,
    };
  }, [experiment.runs]);

  const saveConclusion = useCallback(async () => {
    setSavingConclusion(true);
    await onPatch({ conclusion });
    setSavingConclusion(false);
    toast({ title: "Conclusion enregistrée" });
  }, [conclusion, onPatch, toast]);

  const patchRun = useCallback(
    async (run: ExpRun, patch: Partial<ExpRun>) => {
      const res = await fetch(
        `/api/experiments/${experiment.id}/runs/${run.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        }
      );
      const data = await res.json().catch(() => null);
      if (!res.ok || data.error) {
        toast({
          title: "Mise à jour impossible",
          description: data?.error || `HTTP ${res.status}`,
          variant: "destructive",
        });
        return;
      }
      await onPatch({});
    },
    [experiment.id, onPatch, toast]
  );

  const deleteRun = useCallback(
    async (run: ExpRun) => {
      const res = await fetch(
        `/api/experiments/${experiment.id}/runs/${run.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        toast({ title: "Suppression impossible", variant: "destructive" });
        return;
      }
      await onPatch({});
      toast({ title: "Run supprimé" });
    },
    [experiment.id, onPatch, toast]
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg leading-snug">{experiment.title}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={onDelete}
            title="Supprimer l'expérimentation"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={experiment.status}
            onValueChange={(v) => onPatch({ status: v })}
          >
            <SelectTrigger className="w-auto h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planned">Planifiée</SelectItem>
              <SelectItem value="running">En cours</SelectItem>
              <SelectItem value="concluded">Conclue</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={experiment.verdict ?? "none"}
            onValueChange={(v) =>
              onPatch({ verdict: v === "none" ? null : v })
            }
          >
            <SelectTrigger className="w-auto h-7 text-xs">
              <SelectValue placeholder="Verdict global" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Verdict global…</SelectItem>
              <SelectItem value="supported">Hypothèse soutenue</SelectItem>
              <SelectItem value="refuted">Réfutée</SelectItem>
              <SelectItem value="inconclusive">Non concluante</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-[11px] text-muted-foreground">
            {stats.total} run{stats.total !== 1 ? "s" : ""} · {stats.done} terminé
            {stats.done !== 1 ? "s" : ""}
            {stats.failed > 0 ? ` · ${stats.failed} échec` : ""}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Question / hypothèse */}
        <div className="rounded-lg border p-3 space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Question / hypothèse testée
          </p>
          <p className="text-sm leading-relaxed">{experiment.question}</p>
          {experiment.hypothesisRef && (
            <p className="text-xs text-muted-foreground">
              Réf. hypothèse : <span className="font-medium">{experiment.hypothesisRef}</span>
            </p>
          )}
          {experiment.protocol && (
            <>
              <Separator />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Protocole
              </p>
              <p className="text-xs leading-relaxed whitespace-pre-wrap">
                {experiment.protocol}
              </p>
            </>
          )}
        </div>

        {/* Conclusion quand conclue */}
        {experiment.status === "concluded" && (
          <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Conclusion
              </p>
              <VerdictBadge verdict={experiment.verdict} />
            </div>
            <Textarea
              value={conclusion}
              onChange={(e) => setConclusion(e.target.value)}
              rows={3}
              placeholder="Synthèse : qu'ont montré les runs ? Que retenir pour la thèse ?"
              className="text-sm resize-none"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={saveConclusion}
              disabled={savingConclusion}
              className="h-7 text-xs"
            >
              {savingConclusion ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Save className="h-3 w-3 mr-1" />
              )}
              Enregistrer la conclusion
            </Button>
          </div>
        )}

        {/* Runs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Runs ({(experiment.runs ?? []).length})
            </p>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => {
                setEditingRun(null);
                setRunDialogOpen(true);
              }}
            >
              <Plus className="h-3 w-3 mr-1" />
              Ajouter un run
            </Button>
          </div>

          {(experiment.runs ?? []).length === 0 ? (
            <p className="text-xs text-muted-foreground rounded-lg border border-dashed p-4 text-center">
              Aucun run — enregistrez chaque variante testée (baseline, variantes de
              paramètres…) avec ses mesures et sa preuve.
            </p>
          ) : (
            <div className="space-y-3">
              {(experiment.runs ?? []).map((run) => {
                const meta = RUN_STATUS_META[run.status] ?? RUN_STATUS_META.pending;
                const metrics = parseMetrics(run.metrics);
                return (
                  <div key={run.id} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Play className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <h4 className="text-sm font-medium truncate">{run.label}</h4>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${meta.cls}`}
                        >
                          {meta.label}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground"
                          onClick={() => {
                            setEditingRun(run);
                            setRunDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteRun(run)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {run.variant && (
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                        <span className="font-medium">Configuration : </span>
                        {run.variant}
                      </p>
                    )}

                    {metrics.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {metrics.map((m, i) => (
                          <Badge
                            key={`${m.name}-${i}`}
                            variant="secondary"
                            className="text-[10px] font-mono"
                          >
                            {m.name} = {m.value}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {run.result && (
                      <p className="text-xs leading-relaxed">{run.result}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                      <Select
                        value={run.verdict ?? "none"}
                        onValueChange={(v) =>
                          patchRun(run, { verdict: v === "none" ? null : v })
                        }
                      >
                        <SelectTrigger className="w-auto h-6 text-[11px]">
                          <SelectValue placeholder="Verdict du run…" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Verdict…</SelectItem>
                          <SelectItem value="confirmed">Confirmé</SelectItem>
                          <SelectItem value="refuted">Réfuté</SelectItem>
                          <SelectItem value="inconclusive">Non concluant</SelectItem>
                        </SelectContent>
                      </Select>
                      {run.evidenceUrl && (
                        <a
                          href={run.evidenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Preuve
                        </a>
                      )}
                      {run.startedAt && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Timer className="h-3 w-3" />
                          {new Date(run.startedAt).toLocaleDateString("fr-FR")}
                        </span>
                      )}
                      <VerdictBadge verdict={run.verdict} />
                    </div>
                    {run.notes && (
                      <p className="text-[11px] text-muted-foreground italic">
                        {run.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>

      {/* Dialog run (création / édition) */}
      <RunDialog
        open={runDialogOpen}
        onOpenChange={setRunDialogOpen}
        experimentId={experiment.id}
        run={editingRun}
        onSaved={async () => {
          setRunDialogOpen(false);
          await onPatch({});
        }}
      />
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════
// Dialog création d'expérimentation
// ═══════════════════════════════════════════════════════════

function CreateExperimentDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreated: (exp: Experiment) => void;
}) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [hypothesisRef, setHypothesisRef] = useState("");
  const [protocol, setProtocol] = useState("");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setTitle("");
    setQuestion("");
    setHypothesisRef("");
    setProtocol("");
    setTags("");
  };

  const submit = useCallback(async () => {
    if (!title.trim() || !question.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/experiments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          question: question.trim(),
          hypothesisRef: hypothesisRef.trim() || undefined,
          protocol: protocol.trim() || undefined,
          tags: tags.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || data.error) {
        toast({
          title: "Création impossible",
          description: data?.error || `HTTP ${res.status}`,
          variant: "destructive",
        });
        return;
      }
      reset();
      onCreated(data.data as Experiment);
    } finally {
      setSaving(false);
    }
  }, [title, question, hypothesisRef, protocol, tags, onCreated, toast]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouvelle expérimentation</DialogTitle>
          <DialogDescription>
            Définissez la question testée — les runs viendront documenter les
            résultats.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Titre *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex. : Impact du contrôle prédictif sur la congestion urbaine"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Question / hypothèse testée *</Label>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              placeholder="Ex. : H1 — Un contrôleur prédictif réduit la congestion de plus de 15 % par rapport au contrôle réactif."
              className="resize-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Réf. hypothèse (optionnel)</Label>
              <Input
                value={hypothesisRef}
                onChange={(e) => setHypothesisRef(e.target.value)}
                placeholder="Ex. : H1, H2.3…"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tags (optionnel)</Label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="simulation, terrain, ML…"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Protocole (optionnel)</Label>
            <Textarea
              value={protocol}
              onChange={(e) => setProtocol(e.target.value)}
              rows={3}
              placeholder="Méthode, données, conditions de succès…"
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-1" />
            Annuler
          </Button>
          <Button
            onClick={submit}
            disabled={saving || !title.trim() || !question.trim()}
          >
            {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            Créer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════
// Dialog run (création / édition)
// ═══════════════════════════════════════════════════════════

function RunDialog({
  open,
  onOpenChange,
  experimentId,
  run,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  experimentId: string;
  run: ExpRun | null;
  onSaved: () => Promise<void>;
}) {
  const { toast } = useToast();
  const [label, setLabel] = useState("");
  const [variant, setVariant] = useState("");
  const [metrics, setMetrics] = useState("");
  const [result, setResult] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [status, setStatus] = useState("pending");
  const [verdict, setVerdict] = useState("none");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // Pré-remplissage à l'ouverture
  useEffect(() => {
    if (open) {
      setLabel(run?.label ?? "");
      setVariant(run?.variant ?? "");
      setMetrics(metricsJsonToText(run?.metrics));
      setResult(run?.result ?? "");
      setEvidenceUrl(run?.evidenceUrl ?? "");
      setStatus(run?.status ?? "pending");
      setVerdict(run?.verdict ?? "none");
      setNotes(run?.notes ?? "");
    }
  }, [open, run]);

  const submit = useCallback(async () => {
    if (!label.trim()) return;
    setSaving(true);
    try {
      const metricsJson = metricsTextToJson(metrics);
      const body = {
        label: label.trim(),
        variant: variant.trim() || undefined,
        metrics: metricsJson ?? undefined,
        result: result.trim() || undefined,
        evidenceUrl: evidenceUrl.trim() || undefined,
        status,
        verdict: verdict === "none" ? null : verdict,
        notes: notes.trim() || undefined,
      };
      const res = run
        ? await fetch(`/api/experiments/${experimentId}/runs/${run.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch(`/api/experiments/${experimentId}/runs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
      const data = await res.json().catch(() => null);
      if (!res.ok || data.error) {
        toast({
          title: run ? "Mise à jour impossible" : "Création impossible",
          description: data?.error || `HTTP ${res.status}`,
          variant: "destructive",
        });
        return;
      }
      await onSaved();
      toast({ title: run ? "Run mis à jour" : "Run ajouté" });
    } finally {
      setSaving(false);
    }
  }, [
    label,
    variant,
    metrics,
    result,
    evidenceUrl,
    status,
    verdict,
    notes,
    run,
    experimentId,
    onSaved,
    toast,
  ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle>{run ? "Modifier le run" : "Nouveau run"}</DialogTitle>
          <DialogDescription>
            Documentez cette variante : configuration, mesures, preuve et verdict.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Libellé *</Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder='Ex. : "baseline", "var-A lr=0.01", "échantillon 500"'
            />
          </div>
          <div className="space-y-1.5">
            <Label>Configuration / variantes</Label>
            <Textarea
              value={variant}
              onChange={(e) => setVariant(e.target.value)}
              rows={2}
              placeholder="Paramètres, jeu de données, matériel…"
              className="resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Métriques (une par ligne : nom: valeur)</Label>
            <Textarea
              value={metrics}
              onChange={(e) => setMetrics(e.target.value)}
              rows={3}
              placeholder={"rmse: 0.42\naccuracy: 0.87\ntemps_s: 156"}
              className="resize-none font-mono text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Résultat observé</Label>
            <Textarea
              value={result}
              onChange={(e) => setResult(e.target.value)}
              rows={2}
              placeholder="Ce que ce run a montré…"
              className="resize-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Lien preuve</Label>
              <Input
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="https://… (notebook, dépôt, figure)"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Statut</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="running">En cours</SelectItem>
                  <SelectItem value="done">Terminé</SelectItem>
                  <SelectItem value="failed">Échec</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Verdict</Label>
              <Select value={verdict} onValueChange={setVerdict}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">—</SelectItem>
                  <SelectItem value="confirmed">Confirmé</SelectItem>
                  <SelectItem value="refuted">Réfuté</SelectItem>
                  <SelectItem value="inconclusive">Non concluant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Remarques…"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-1" />
            Annuler
          </Button>
          <Button onClick={submit} disabled={saving || !label.trim()}>
            {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            {run ? "Enregistrer" : "Ajouter le run"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
