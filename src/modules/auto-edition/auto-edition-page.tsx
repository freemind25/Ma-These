"use client";

import { useState, useCallback } from "react";
import { useAiConfig } from "@/hooks/use-ai-config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Eye,
  Link,
  Minimize2,
  CheckCircle,
  Layers,
  Shield,
  ArrowRightLeft,
  MapPin,
  Sparkles,
  Loader2,
  History,
  RotateCcw,
  FileText,
  AlertTriangle,
} from "lucide-react";

// ═══════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════

interface CriterionResult {
  id: string;
  score: number;
  recommendation: string;
  detail: string;
}

interface AnalysisResult {
  id: string;
  timestamp: Date;
  textPreview: string;
  criteria: CriterionResult[];
  overallScore: number;
}

// ═══════════════════════════════════════════════════
// 8 Criteria Definition
// ═══════════════════════════════════════════════════

const CRITERIA = [
  {
    id: "clarte",
    label: "Clarté",
    description: "Le texte est-il clair et compréhensible ?",
    icon: Eye,
    promptKey: "clarté",
  },
  {
    id: "coherence",
    label: "Cohérence",
    description: "Les idées sont-elles logiquement connectées ?",
    icon: Link,
    promptKey: "cohérence",
  },
  {
    id: "concision",
    label: "Concision",
    description: "Le texte est-il exempt de redondances ?",
    icon: Minimize2,
    promptKey: "concision",
  },
  {
    id: "correction",
    label: "Correction",
    description: "Erreurs de grammaire, orthographe, syntaxe ?",
    icon: CheckCircle,
    promptKey: "correction",
  },
  {
    id: "completude",
    label: "Complétude",
    description: "Tous les éléments nécessaires sont-ils présents ?",
    icon: Layers,
    promptKey: "complétude",
  },
  {
    id: "credibilite",
    label: "Crédibilité",
    description: "Les affirmations sont-elles étayées par des références ?",
    icon: Shield,
    promptKey: "crédibilité",
  },
  {
    id: "cohesion",
    label: "Cohésion",
    description: "Les transitions entre paragraphes fonctionnent-elles ?",
    icon: ArrowRightLeft,
    promptKey: "cohésion",
  },
  {
    id: "contextualisation",
    label: "Contextualisation",
    description: "Le travail est-il bien situé dans le domaine ?",
    icon: MapPin,
    promptKey: "contextualisation",
  },
] as const;

// ═══════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════

function getScoreColor(score: number): string {
  if (score >= 75) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function getScoreBgColor(score: number): string {
  if (score >= 75) return "bg-emerald-500/10 border-emerald-500/20";
  if (score >= 50) return "bg-amber-500/10 border-amber-500/20";
  return "bg-red-500/10 border-red-500/20";
}

function getScoreBadgeVariant(score: number): "default" | "secondary" | "destructive" | "outline" {
  if (score >= 75) return "default";
  if (score >= 50) return "secondary";
  return "destructive";
}

function getScoreLabel(score: number): string {
  if (score >= 75) return "Excellent";
  if (score >= 50) return "À améliorer";
  return "Critique";
}

function getOverallColor(score: number): string {
  if (score >= 75) return "[&>div]:bg-emerald-500";
  if (score >= 50) return "[&>div]:bg-amber-500";
  return "[&>div]:bg-red-500";
}

function buildCriterionPrompt(text: string, criterion: (typeof CRITERIA)[number]): string {
  return `Analyse le texte académique suivant selon le critère unique de la « ${criterion.label} » (${criterion.description}).

Réponds UNIQUEMENT au format JSON suivant, sans aucun texte supplémentaire, sans markdown, sans backticks :
{"score": <nombre entier de 0 à 100>, "recommendation": "<courte recommandation en 1 phrase, en français>", "detail": "<analyse détaillée en 3-5 phrases, en français, avec exemples concrets tirés du texte>"}

Règles de notation :
- 90-100 : Maîtrise exemplaire, aucune amélioration nécessaire
- 75-89 : Bon niveau, améliorations mineures possibles
- 50-74 : Passable, plusieurs améliorations nécessaires
- 25-49 : Insuffisant, problèmes significatifs
- 0-24 : Critique, refonte nécessaire

Texte à analyser :
${text}`;
}

async function analyzeCriterion(
  text: string,
  criterion: (typeof CRITERIA)[number],
  withAiConfig: <T extends Record<string, unknown>>(body: T) => T & { _aiConfig: unknown },
): Promise<CriterionResult> {
  const prompt = buildCriterionPrompt(text, criterion);
  const res = await fetch("/api/ai-writing", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(withAiConfig({ mode: "peer-review", prompt })),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Erreur réseau" }));
    throw new Error(err.error || "Erreur lors de l'analyse");
  }
  const json = await res.json();
  const raw = json.data.content;

  // Extract JSON from the response (handle potential markdown wrapping)
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`Format de réponse invalide pour ${criterion.label}`);
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    id: criterion.id,
    score: Math.max(0, Math.min(100, Math.round(parsed.score || 0))),
    recommendation: parsed.recommendation || "Analyse en cours...",
    detail: parsed.detail || "",
  };
}

// ═══════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════

export function AutoEditionPage() {
  const { withAiConfig } = useAiConfig();
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progressScores, setProgressScores] = useState<Record<string, number>>({});

  const handleAnalyze = useCallback(async () => {
    if (!text.trim() || text.trim().length < 20) {
      setError("Veuillez saisir au moins 20 caractères pour lancer l'analyse.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setProgressScores({});

    try {
      // Analyze all 8 criteria in parallel
      const results = await Promise.all(
        CRITERIA.map(async (criterion) => {
          const result = await analyzeCriterion(text, criterion, withAiConfig);
          // Update progress incrementally
          setProgressScores((prev) => ({ ...prev, [criterion.id]: result.score }));
          return result;
        })
      );

      const overallScore = Math.round(
        results.reduce((sum, r) => sum + r.score, 0) / results.length
      );

      const analysisResult: AnalysisResult = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        textPreview: text.slice(0, 120) + (text.length > 120 ? "..." : ""),
        criteria: results,
        overallScore,
      };

      setCurrentResult(analysisResult);
      setHistory((prev) => [analysisResult, ...prev].slice(0, 5));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'analyse";
      setError(message);
    } finally {
      setIsAnalyzing(false);
    }
  }, [text, withAiConfig]);

  const handleRestoreHistory = useCallback((result: AnalysisResult) => {
    setCurrentResult(result);
  }, []);

  const handleReset = useCallback(() => {
    setText("");
    setCurrentResult(null);
    setError(null);
    setProgressScores({});
  }, []);

  // ═══ Render ═══
  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Auto-édition : les 8C
        </h1>
        <p className="text-sm text-muted-foreground">
          Évaluez votre texte selon 8 critères d'édition académique avec l'IA
        </p>
      </div>

      {/* Text Input */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Texte à analyser
              </CardTitle>
              <CardDescription className="text-xs">
                Collez ou saisissez le texte de votre chapitre, section ou paragraphe
              </CardDescription>
            </div>
            {text && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 text-xs"
                onClick={handleReset}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Réinitialiser
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Textarea
            placeholder="Collez ici le texte que vous souhaitez évaluer selon les 8 critères (Clarté, Cohérence, Concision, Correction, Complétude, Crédibilité, Cohésion, Contextualisation)..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            className="resize-none text-sm"
            disabled={isAnalyzing}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                {text.length} caractères · {text.trim() ? text.trim().split(/\s+/).length : 0} mots
              </span>
              {text.length > 0 && text.length < 20 && (
                <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Minimum 20 caractères requis
                </span>
              )}
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={!text.trim() || text.trim().length < 20 || isAnalyzing}
              className="gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Analyser les 8C
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </CardContent>
        </Card>
      )}

      {/* Loading: individual criterion progress */}
      {isAnalyzing && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Progression de l'analyse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CRITERIA.map((c) => {
                const Icon = c.icon;
                const done = progressScores[c.id] !== undefined;
                return (
                  <div
                    key={c.id}
                    className={`flex items-center gap-2 rounded-lg border p-2.5 text-sm transition-all ${
                      done
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-border bg-muted/30"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${done ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground animate-pulse"}`}
                    />
                    <span
                      className={done ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-muted-foreground"}
                    >
                      {c.label}
                    </span>
                    {done && (
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 ml-auto" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {currentResult && !isAnalyzing && (
        <>
          {/* Overall Score */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <CardTitle className="text-sm">Score global</CardTitle>
                  <CardDescription className="text-xs">
                    Moyenne des 8 critères · {" "}
                    {new Date(currentResult.timestamp).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-3xl font-bold ${getScoreColor(currentResult.overallScore)}`}>
                    {currentResult.overallScore}
                  </span>
                  <span className="text-sm text-muted-foreground">/100</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Progress
                value={currentResult.overallScore}
                className={`h-3 ${getOverallColor(currentResult.overallScore)}`}
              />
              <div className="flex items-center gap-2">
                <Badge variant={getScoreBadgeVariant(currentResult.overallScore)}>
                  {getScoreLabel(currentResult.overallScore)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {currentResult.overallScore >= 75
                    ? "Votre texte répond aux exigences académiques."
                    : currentResult.overallScore >= 50
                      ? "Des améliorations sont recommandées avant soumission."
                      : "Une révision significative est nécessaire."}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 8C Dashboard Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CRITERIA.map((criterion) => {
              const result = currentResult.criteria.find((r) => r.id === criterion.id);
              if (!result) return null;
              const Icon = criterion.icon;
              return (
                <Card
                  key={criterion.id}
                  className={`border transition-all hover:shadow-md ${getScoreBgColor(result.score)}`}
                >
                  <CardHeader className="pb-2 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            result.score >= 75
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : result.score >= 50
                                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                : "bg-red-500/15 text-red-600 dark:text-red-400"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <CardTitle className="text-sm font-semibold">
                          {criterion.label}
                        </CardTitle>
                      </div>
                      <span
                        className={`text-xl font-bold tabular-nums ${getScoreColor(result.score)}`}
                      >
                        {result.score}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 pt-0">
                    <p className="text-xs text-muted-foreground mb-2">
                      {criterion.description}
                    </p>
                    <Badge
                      variant={getScoreBadgeVariant(result.score)}
                      className="text-[10px] h-5"
                    >
                      {getScoreLabel(result.score)}
                    </Badge>
                    {result.recommendation && (
                      <p className="text-xs mt-2 text-foreground/80 leading-relaxed">
                        {result.recommendation}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Separator />

          {/* Detailed Report — Accordion */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Rapport détaillé par critère
              </CardTitle>
              <CardDescription className="text-xs">
                Développez chaque section pour lire l'analyse complète
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full">
                {CRITERIA.map((criterion) => {
                  const result = currentResult.criteria.find(
                    (r) => r.id === criterion.id
                  );
                  if (!result) return null;
                  const Icon = criterion.icon;
                  return (
                    <AccordionItem key={criterion.id} value={criterion.id}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                          <Icon
                            className={`h-4 w-4 shrink-0 ${getScoreColor(result.score)}`}
                          />
                          <span className="text-sm font-medium">{criterion.label}</span>
                          <Badge
                            variant={getScoreBadgeVariant(result.score)}
                            className="text-[10px] h-5"
                          >
                            {result.score}/100
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col gap-3 pl-7">
                          <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                              Recommandation
                            </h4>
                            <p className="text-sm">{result.recommendation}</p>
                          </div>
                          <Separator />
                          <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                              Analyse détaillée
                            </h4>
                            <p className="text-sm leading-relaxed text-foreground/80">
                              {result.detail}
                            </p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty State (no results yet, not loading) */}
      {!currentResult && !isAnalyzing && !error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
              <Sparkles className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <h3 className="text-sm font-medium">Prêt à analyser</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-[360px]">
              Saisissez ou collez votre texte ci-dessus, puis cliquez sur
              « Analyser les 8C » pour obtenir une évaluation détaillée selon
              les 8 critères d'auto-édition.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {CRITERIA.map((c) => {
                const Icon = c.icon;
                return (
                  <Badge key={c.id} variant="outline" className="gap-1 text-[10px] h-6">
                    <Icon className="h-3 w-3" />
                    {c.label}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* History */}
      {history.length > 0 && !isAnalyzing && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <History className="h-4 w-4" />
              Historique des analyses
            </CardTitle>
            <CardDescription className="text-xs">
              Les 5 dernières analyses effectuées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {history.map((h) => (
                <button
                  key={h.id}
                  onClick={() => handleRestoreHistory(h)}
                  className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all hover:bg-muted/50 ${
                    currentResult?.id === h.id
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold tabular-nums ${
                      h.overallScore >= 75
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : h.overallScore >= 50
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                          : "bg-red-500/15 text-red-600 dark:text-red-400"
                    }`}
                  >
                    {h.overallScore}
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <span className="text-sm font-medium truncate">
                      {h.textPreview}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(h.timestamp).toLocaleString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {" · "}
                      {h.criteria.map((c) => c.score).reduce((a, b) => a + b, 0) / 8 >= 75
                        ? "Excellent"
                        : h.criteria.map((c) => c.score).reduce((a, b) => a + b, 0) / 8 >= 50
                          ? "À améliorer"
                          : "Critique"}
                    </span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {h.criteria.map((c) => (
                      <div
                        key={c.id}
                        className={`h-2 w-2 rounded-full ${
                          c.score >= 75
                            ? "bg-emerald-500"
                            : c.score >= 50
                              ? "bg-amber-500"
                              : "bg-red-500"
                        }`}
                        title={`${c.id}: ${c.score}`}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
