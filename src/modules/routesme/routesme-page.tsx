"use client";

import { useState, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  GitCompareArrows,
  Send,
  Loader2,
  Star,
  StarOff,
  Copy,
  Check,
  Clock,
  Type,
  Trophy,
  History,
  Sparkles,
  Trash2,
  RotateCcw,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WRITING_MODES } from "@/data/ai-writing-modes";
import { useAiConfig } from "@/hooks/use-ai-config";

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

interface SimulatedModel {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface ModelResult {
  model: SimulatedModel;
  content: string;
  loading: boolean;
  error: string | null;
  responseTimeMs: number;
  estimatedTokens: number;
  voted: boolean;
}

interface ComparisonEntry {
  id: string;
  prompt: string;
  templateLabel: string;
  modeId: string;
  timestamp: Date;
  results: ModelResult[];
  winnerId: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════
// Simulated Models
// ═══════════════════════════════════════════════════════════════════════════

const AVAILABLE_MODELS: SimulatedModel[] = [
  {
    id: "gpt-4",
    name: "GPT-4",
    color: "text-emerald-700 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
    borderColor: "border-emerald-200 dark:border-emerald-800",
  },
  {
    id: "claude",
    name: "Claude",
    color: "text-orange-700 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/40",
    borderColor: "border-orange-200 dark:border-orange-800",
  },
  {
    id: "mistral",
    name: "Mistral",
    color: "text-violet-700 dark:text-violet-400",
    bgColor: "bg-violet-50 dark:bg-violet-950/40",
    borderColor: "border-violet-200 dark:border-violet-800",
  },
  {
    id: "llama",
    name: "Llama",
    color: "text-cyan-700 dark:text-cyan-400",
    bgColor: "bg-cyan-50 dark:bg-cyan-950/40",
    borderColor: "border-cyan-200 dark:border-cyan-800",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// Prompt Templates for Doctoral Tasks
// ═══════════════════════════════════════════════════════════════════════════

const PROMPT_TEMPLATES = [
  {
    id: "revue-litterature",
    label: "Revue de littérature",
    mode: "literature-review",
    prompt:
      "Rédige une revue de littérature structurée sur le thème suivant. Organise par thématiques, identifie les convergences et les lacunes, et conclus par une ouverture vers la problématique de recherche.\n\nThème : ",
  },
  {
    id: "methodologie",
    label: "Choix méthodologique",
    mode: "methodology",
    prompt:
      "Propose et justifie une méthodologie de recherche adaptée à la problématique suivante. Détaille le design de recherche, les techniques de collecte et d'analyse des données.\n\nProblématique : ",
  },
  {
    id: "resume",
    label: "Rédaction de résumé (abstract)",
    mode: "abstract",
    prompt:
      "Rédige un résumé structuré (abstract) de 250 mots maximum en format IMRAD pour le travail suivant. Inclus les mots-clés à la fin.\n\nTravail : ",
  },
  {
    id: "hypotheses",
    label: "Génération d'hypothèses",
    mode: "hypothesis",
    prompt:
      "Formule 3 hypothèses de recherche testables et falsifiables à partir du cadre théorique et de la question de recherche suivants. Pour chaque hypothèse, précise les variables et l'operationalisation attendue.\n\nCadre et question : ",
  },
  {
    id: "cadre-theorique",
    label: "Construction théorique",
    mode: "theory",
    prompt:
      "Construis un cadre théorique structuré à partir des concepts et théories suivants. Identifie les relations entre concepts et propose un modèle conceptuel.\n\nConcepts et théories : ",
  },
  {
    id: "relecture",
    label: "Relecture critique",
    mode: "peer-review",
    prompt:
      "Effectue une relecture critique du texte académique suivant selon les critères : clarté de la problématique, rigueur méthodologique, cohérence argumentative, qualité de la rédaction.\n\nTexte : ",
  },
  {
    id: "soutenance",
    label: "Préparation soutenance",
    mode: "defense",
    prompt:
      "Prépare un plan de présentation pour une soutenance de thèse sur le sujet suivant. Inclus la structure, les points clés, et les questions probables du jury.\n\nSujet de thèse : ",
  },
  {
    id: "supervision",
    label: "Rapport de supervision",
    mode: "supervision",
    prompt:
      "Rédige un rapport d'avancement pour la direction de thèse. Inclus les objectifs atteints, les difficultés rencontrées et les perspectives.\n\nAvancement du travail : ",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════

function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token for French
  return Math.round(text.length / 4);
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function generateId(): string {
  return `cmp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════

export function RoutesMePage() {
  const { withAiConfig } = useAiConfig();
  const { toast } = useToast();

  // Prompt state
  const [prompt, setPrompt] = useState("");
  const [selectedModeId, setSelectedModeId] = useState("literature-review");
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([
    "gpt-4",
    "claude",
  ]);

  // Results state
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentResults, setCurrentResults] = useState<ModelResult[]>([]);
  const [winnerId, setWinnerId] = useState<string | null>(null);

  // History state (max 10)
  const [history, setHistory] = useState<ComparisonEntry[]>([]);

  // Copy state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Ref for scrolling to results
  const resultsRef = useRef<HTMLDivElement>(null);

  // ──── Toggle model selection ────
  const toggleModel = useCallback(
    (modelId: string) => {
      setSelectedModelIds((prev) => {
        if (prev.includes(modelId)) {
          if (prev.length <= 2) {
            toast({
              title: "Sélection minimale",
              description: "Sélectionnez au moins 2 modèles pour comparer.",
            });
            return prev;
          }
          return prev.filter((id) => id !== modelId);
        }
        if (prev.length >= 4) {
          toast({
            title: "Sélection maximale",
            description: "Vous pouvez comparer au maximum 4 modèles.",
          });
          return prev;
        }
        return [...prev, modelId];
      });
    },
    [toast]
  );

  // ──── Apply template ────
  const applyTemplate = useCallback(
    (templateId: string) => {
      const tpl = PROMPT_TEMPLATES.find((t) => t.id === templateId);
      if (tpl) {
        setPrompt(tpl.prompt);
        setSelectedModeId(tpl.mode);
        toast({
          title: "Modèle appliqué",
          description: `Le modèle « ${tpl.label} » a été chargé dans le champ de saisie.`,
        });
      }
    },
    [toast]
  );

  // ──── Generate comparison ────
  const generateComparison = useCallback(async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt requis",
        description: "Veuillez saisir un prompt avant de lancer la comparaison.",
      });
      return;
    }

    const models = AVAILABLE_MODELS.filter((m) =>
      selectedModelIds.includes(m.id)
    );
    if (models.length < 2) {
      toast({
        title: "Modèles insuffisants",
        description: "Sélectionnez au moins 2 modèles pour comparer.",
      });
      return;
    }

    setIsGenerating(true);
    setWinnerId(null);

    // Initialize results with loading state
    const initialResults: ModelResult[] = models.map((model) => ({
      model,
      content: "",
      loading: true,
      error: null,
      responseTimeMs: 0,
      estimatedTokens: 0,
      voted: false,
    }));
    setCurrentResults(initialResults);

    // Scroll to results
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    // Fire all requests in parallel
    const promises = models.map(async (model) => {
      const startTime = performance.now();
      try {
        const res = await fetch("/api/ai-writing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(withAiConfig({
            mode: selectedModeId,
            prompt: prompt.trim(),
          })),
        });
        const endTime = performance.now();
        const data = await res.json();

        if (!res.ok || data.error) {
          throw new Error(data.error || "Erreur lors de la génération");
        }

        return {
          model,
          content: data.data.content || "",
          loading: false,
          error: null,
          responseTimeMs: Math.round(endTime - startTime),
          estimatedTokens: estimateTokens(data.data.content || ""),
          voted: false,
        };
      } catch (err) {
        const endTime = performance.now();
        return {
          model,
          content: "",
          loading: false,
          error: err instanceof Error ? err.message : "Erreur inconnue",
          responseTimeMs: Math.round(endTime - startTime),
          estimatedTokens: 0,
          voted: false,
        };
      }
    });

    // Wait for all to resolve (each updates independently)
    const completed = await Promise.all(promises);
    setCurrentResults(completed);
    setIsGenerating(false);

    // Save to history
    const entry: ComparisonEntry = {
      id: generateId(),
      prompt: prompt.trim(),
      templateLabel:
        PROMPT_TEMPLATES.find((t) => t.mode === selectedModeId)?.label ||
        selectedModeId,
      modeId: selectedModeId,
      timestamp: new Date(),
      results: completed,
      winnerId: null,
    };

    setHistory((prev) => [entry, ...prev].slice(0, 10));
  }, [prompt, selectedModelIds, selectedModeId, toast, withAiConfig]);

  // ──── Vote for a model ────
  const voteForModel = useCallback(
    (modelId: string) => {
      setWinnerId(modelId);
      setCurrentResults((prev) =>
        prev.map((r) => ({
          ...r,
          voted: r.model.id === modelId,
        }))
      );

      // Update the latest history entry
      setHistory((prev) =>
        prev.map((entry, i) =>
          i === 0 ? { ...entry, winnerId: modelId } : entry
        )
      );

      const model = AVAILABLE_MODELS.find((m) => m.id === modelId);
      toast({
        title: "Vote enregistré",
        description: `Vous avez sélectionné ${model?.name} comme la meilleure réponse.`,
      });
    },
    [toast]
  );

  // ──── Copy to clipboard ────
  const copyToClipboard = useCallback(
    async (text: string, modelId: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedId(modelId);
        setTimeout(() => setCopiedId(null), 2000);
        toast({ title: "Copié", description: "Réponse copiée dans le presse-papiers." });
      } catch {
        toast({
          title: "Erreur",
          description: "Impossible de copier le texte.",
        });
      }
    },
    [toast]
  );

  // ──── Restore from history ────
  const restoreFromHistory = useCallback((entry: ComparisonEntry) => {
    setPrompt(entry.prompt);
    setSelectedModeId(entry.modeId);
    setCurrentResults(entry.results);
    setWinnerId(entry.winnerId);
    toast({
      title: "Comparaison restaurée",
      description: "Les résultats de cette comparaison ont été restaurés.",
    });
  }, [toast]);

  // ──── Clear history ────
  const clearHistory = useCallback(() => {
    setHistory([]);
    toast({ title: "Historique effacé" });
  }, [toast]);

  // ──── Reset current comparison ────
  const resetComparison = useCallback(() => {
    setCurrentResults([]);
    setWinnerId(null);
    setPrompt("");
  }, []);

  // ──── Grid columns based on selected model count ────
  const gridCols =
    currentResults.length === 2
      ? "grid-cols-1 md:grid-cols-2"
      : currentResults.length === 3
        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4";

  // ═══════════════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 p-6 w-full">
      {/* ──── Header ──── */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <GitCompareArrows className="h-6 w-6 text-primary" />
          RoutesMe
          <Badge variant="secondary" className="ml-1">
            Multi-Modèles
          </Badge>
        </h1>
        <p className="text-sm text-muted-foreground">
          Comparez les réponses de plusieurs modèles d&apos;IA simultanément pour
          identifier la meilleure formulation doctorale.
        </p>
      </div>

      {/* ──── Tabs ──── */}
      <Tabs defaultValue="compare" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="compare" className="gap-2">
            <GitCompareArrows className="h-4 w-4" />
            Comparaison
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            Historique
            {history.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {history.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════════════════════════════════ */}
        {/* TAB: Comparaison                               */}
        {/* ═══════════════════════════════════════════ */}
        <TabsContent value="compare" className="mt-4 flex flex-col gap-6">
          {/* ──── Configuration Card ──── */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Configuration de la comparaison</CardTitle>
              <CardDescription>
                Choisissez les modèles à comparer et saisissez votre prompt.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {/* Model Selection */}
              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium">Modèles à comparer (2–4)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {AVAILABLE_MODELS.map((model) => {
                    const isSelected = selectedModelIds.includes(model.id);
                    return (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => toggleModel(model.id)}
                        className={`
                          relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all
                          ${
                            isSelected
                              ? `${model.borderColor} ${model.bgColor} shadow-sm`
                              : "border-muted bg-muted/30 opacity-60 hover:opacity-80"
                          }
                        `}
                      >
                        <span
                          className={`text-sm font-semibold ${isSelected ? model.color : "text-muted-foreground"}`}
                        >
                          {model.name}
                        </span>
                        {isSelected && (
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${model.color} ${model.borderColor}`}
                          >
                            Sélectionné
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Template Selector & Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Modèle de prompt doctoral</label>
                  <Select onValueChange={applyTemplate}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choisir un modèle prédéfini…" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROMPT_TEMPLATES.map((tpl) => (
                        <SelectItem key={tpl.id} value={tpl.id}>
                          {tpl.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Mode d&apos;écriture IA</label>
                  <Select
                    value={selectedModeId}
                    onValueChange={setSelectedModeId}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WRITING_MODES.map((mode) => (
                        <SelectItem key={mode.id} value={mode.id}>
                          {mode.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Prompt Input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Votre prompt</label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Saisissez votre prompt doctoral ici ou sélectionnez un modèle prédéfini ci-dessus…"
                  className="min-h-[120px] resize-y"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={generateComparison}
                  disabled={isGenerating || !prompt.trim()}
                  className="gap-2"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {isGenerating ? "Génération en cours…" : "Lancer la comparaison"}
                </Button>
                {currentResults.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={resetComparison}
                    className="gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Réinitialiser
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ──── Results Grid ──── */}
          <div ref={resultsRef}>
            {currentResults.length > 0 && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold">Résultats</h2>
                  {winnerId && (
                    <Badge className="gap-1 bg-amber-600 hover:bg-amber-600 text-white">
                      <Trophy className="h-3 w-3" />
                      {AVAILABLE_MODELS.find((m) => m.id === winnerId)?.name} sélectionné
                    </Badge>
                  )}
                </div>

                <div className={`grid ${gridCols} gap-4`}>
                  {currentResults.map((result) => (
                    <Card
                      key={result.model.id}
                      className={`
                        flex flex-col overflow-hidden transition-all
                        ${result.model.borderColor}
                        ${result.voted ? "ring-2 ring-amber-500 ring-offset-2 ring-offset-background" : ""}
                      `}
                    >
                      {/* Card Header - Model Info */}
                      <CardHeader className={`${result.model.bgColor} pb-3`}>
                        <div className="flex items-center justify-between">
                          <CardTitle
                            className={`text-sm font-bold ${result.model.color}`}
                          >
                            {result.model.name}
                          </CardTitle>
                          <div className="flex items-center gap-1.5">
                            {result.loading && (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                          </div>
                        </div>
                        {/* Metadata Row */}
                        {!result.loading && result.content && (
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(result.responseTimeMs)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Type className="h-3 w-3" />
                              ~{result.estimatedTokens} tokens
                            </span>
                          </div>
                        )}
                      </CardHeader>

                      {/* Card Content - Response */}
                      <CardContent className="flex-1 p-4">
                        {result.loading ? (
                          <div className="flex flex-col gap-2">
                            <div className="h-3 bg-muted rounded animate-pulse w-full" />
                            <div className="h-3 bg-muted rounded animate-pulse w-5/6" />
                            <div className="h-3 bg-muted rounded animate-pulse w-4/6" />
                            <div className="h-3 bg-muted rounded animate-pulse w-full" />
                            <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                          </div>
                        ) : result.error ? (
                          <div className="text-sm text-destructive bg-destructive/10 rounded-md p-3">
                            {result.error}
                          </div>
                        ) : (
                          <ScrollArea className="max-h-[400px]">
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">
                              {result.content}
                            </p>
                          </ScrollArea>
                        )}
                      </CardContent>

                      {/* Card Footer - Actions */}
                      <CardFooter className={`${result.model.bgColor} px-4 py-3 gap-2`}>
                        {!result.loading && result.content && (
                          <>
                            <Button
                              variant={result.voted ? "default" : "outline"}
                              size="sm"
                              onClick={() => voteForModel(result.model.id)}
                              className={`gap-1.5 text-xs ${result.voted ? "bg-amber-600 hover:bg-amber-700 text-white" : ""}`}
                            >
                              {result.voted ? (
                                <Star className="h-3.5 w-3.5" />
                              ) : (
                                <StarOff className="h-3.5 w-3.5" />
                              )}
                              {result.voted ? "Meilleure réponse" : "Élire"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                copyToClipboard(result.content, result.model.id)
                              }
                              className="gap-1.5 text-xs"
                            >
                              {copiedId === result.model.id ? (
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                              Copier
                            </Button>
                          </>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ═══════════════════════════════════════════ */}
        {/* TAB: Historique                               */}
        {/* ═══════════════════════════════════════════ */}
        <TabsContent value="history" className="mt-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Dernières comparaisons</h2>
            </div>
            {history.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearHistory}
                className="gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Effacer
              </Button>
            )}
          </div>

          {history.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Sparkles className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Aucune comparaison dans l&apos;historique.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Lancez votre première comparaison pour voir les résultats ici.
                </p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="max-h-[600px]">
              <div className="flex flex-col gap-3">
                {history.map((entry) => {
                  const winner = entry.winnerId
                    ? AVAILABLE_MODELS.find((m) => m.id === entry.winnerId)
                    : null;
                  const timeStr = entry.timestamp.toLocaleString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <Card
                      key={entry.id}
                      className="hover:shadow-sm transition-shadow cursor-pointer"
                      onClick={() => restoreFromHistory(entry)}
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <Badge variant="outline" className="text-xs">
                                {entry.templateLabel}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {timeStr}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {entry.prompt}
                            </p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              {entry.results.map((r) => (
                                <span
                                  key={r.model.id}
                                  className={`text-xs font-medium ${r.model.color}`}
                                >
                                  {r.model.name}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {winner && (
                              <Badge className="gap-1 bg-amber-600 hover:bg-amber-600 text-white text-xs">
                                <Trophy className="h-3 w-3" />
                                {winner.name}
                              </Badge>
                            )}
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
