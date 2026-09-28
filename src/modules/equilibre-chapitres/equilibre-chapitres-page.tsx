"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAiConfig } from "@/hooks/use-ai-config";
import {
  Scale,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Loader2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  BarChart3,
  Gauge,
  Pencil,
  CalendarClock,
  FileText,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

interface ThesisChapter {
  id: string;
  number: number;
  title: string;
  wordCount: number;
  status: string;
  targetWordCount?: number;
}

interface Thesis {
  id: string;
  title: string;
  chapters: ThesisChapter[];
}

// ═══════════════════════════════════════
// Hooks
// ═══════════════════════════════════════

function useTheses() {
  return useQuery<Thesis[]>({
    queryKey: ["thesis"],
    queryFn: async () => {
      const res = await fetch("/api/thesis");
      if (!res.ok) throw new Error("Erreur lors du chargement des thèses");
      const json = await res.json();
      return json.data as Thesis[];
    },
    staleTime: 10 * 1000,
  });
}

// ═══════════════════════════════════════
// Utility Functions
// ═══════════════════════════════════════

function calculateBalanceScore(chapters: ThesisAnalysis[]): number {
  if (chapters.length === 0) return 100;
  const wordCounts = chapters.map((c) => c.wordCount);
  const total = wordCounts.reduce((a, b) => a + b, 0);
  if (total === 0) return 100;
  const average = total / wordCounts.length;
  const variance = wordCounts.reduce((sum, wc) => sum + Math.pow(wc - average, 2), 0) / wordCounts.length;
  const stdDev = Math.sqrt(variance);
  // 100% = perfectly balanced (stdDev = 0), lower = more imbalance
  // Using coefficient of variation: cv = stdDev / mean
  const cv = average > 0 ? stdDev / average : 0;
  return Math.max(0, Math.min(100, Math.round((1 - cv) * 100)));
}

function getBalanceColor(score: number): string {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-red-500 dark:text-red-400";
}

function getBalanceBgColor(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-red-500";
}

function getBalanceLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Bon";
  if (score >= 60) return "Moyen";
  if (score >= 40) return "Déséquilibré";
  return "Très déséquilibré";
}

function getDiffIcon(diff: number, average: number) {
  if (average === 0) return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
  const pct = Math.abs(diff / average) * 100;
  if (pct <= 10) return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />;
  if (diff > 0) return <TrendingUp className="h-3.5 w-3.5 text-amber-600" />;
  return <TrendingDown className="h-3.5 w-3.5 text-red-500" />;
}

interface ThesisAnalysis extends ThesisChapter {
  proportion: number;
  diffFromAverage: number;
  targetWordCount: number;
}

// ═══════════════════════════════════════
// Main Component
// ═══════════════════════════════════════

export function EquilibreChapitresPage() {
  const { withAiConfig } = useAiConfig();
  const { data: theses, isLoading } = useTheses();
  const [selectedThesisId, setSelectedThesisId] = useState<string | null>(null);
  const [localTargets, setLocalTargets] = useState<Record<string, number>>({});
  const [editingTarget, setEditingTarget] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [aiRecommendations, setAiRecommendations] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [deadline, setDeadline] = useState<string>("");

  // Select thesis
  const selectedThesis = useMemo(() => {
    if (!theses || theses.length === 0) return null;
    const id = selectedThesisId || theses[0].id;
    return theses.find((t) => t.id === id) || theses[0];
  }, [theses, selectedThesisId]);

  // Chapters with analysis
  const chaptersAnalysis = useMemo<ThesisAnalysis[]>(() => {
    if (!selectedThesis) return [];
    const chapters = selectedThesis.chapters;
    const totalWords = chapters.reduce((sum, c) => sum + c.wordCount, 0);
    const average = chapters.length > 0 ? totalWords / chapters.length : 0;
    return chapters.map((ch) => ({
      ...ch,
      proportion: totalWords > 0 ? (ch.wordCount / totalWords) * 100 : 0,
      diffFromAverage: ch.wordCount - average,
      targetWordCount: localTargets[ch.id] ?? ch.targetWordCount,
    }));
  }, [selectedThesis, localTargets]);

  const totalWords = useMemo(
    () => chaptersAnalysis.reduce((s, c) => s + c.wordCount, 0),
    [chaptersAnalysis]
  );
  const averageWords = useMemo(
    () => chaptersAnalysis.length > 0 ? totalWords / chaptersAnalysis.length : 0,
    [chaptersAnalysis, totalWords]
  );
  const balanceScore = useMemo(
    () => calculateBalanceScore(chaptersAnalysis),
    [chaptersAnalysis]
  );
  const totalTargetWords = useMemo(
    () => chaptersAnalysis.reduce((s, c) => s + c.targetWordCount, 0),
    [chaptersAnalysis]
  );

  // Writing pace
  const paceInfo = useMemo(() => {
    if (!deadline || totalWords === 0 || chaptersAnalysis.length === 0) return null;
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffMs = deadlineDate.getTime() - now.getTime();
    if (diffMs <= 0)
      return { daysRemaining: 0, wordsPerDay: 0, wordsRemaining: 0, feasible: false };
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const wordsRemaining = totalTargetWords > 0 ? totalTargetWords - totalWords : 0;
    const wordsPerDay = daysRemaining > 0 ? Math.ceil(wordsRemaining / daysRemaining) : 0;
    const feasible = wordsPerDay <= 2000;
    return { daysRemaining, wordsPerDay, wordsRemaining, feasible };
  }, [deadline, totalWords, totalTargetWords, chaptersAnalysis.length]);

  // AI recommendations
  const generateAiRecommendations = useCallback(async () => {
    if (!selectedThesis || chaptersAnalysis.length === 0) return;
    setAiLoading(true);
    setAiRecommendations(null);
    try {
      const chapterData = chaptersAnalysis
        .map(
          (c) =>
            `Chapitre ${c.number} (${c.title}): ${c.wordCount} mots (${c.proportion.toFixed(1)}%)` +
            (c.targetWordCount > 0 ? ` — Objectif: ${c.targetWordCount} mots` : "")
        )
        .join("\n");
      const prompt = `Analyse l'équilibre des chapitres suivants d'une thèse de doctorat en français et propose des recommandations concrètes.

DONNÉES DES CHAPITRES :
${chapterData}

Total : ${totalWords} mots
Moyenne par chapitre : ${Math.round(averageWords)} mots
Score d'équilibre actuel : ${balanceScore}/100

Propose dans les sections suivantes :

1. 📊 DIAGNOSTIC : Quels chapitres sont trop courts ou trop longs par rapport à la moyenne ?
2. 🎯 OBJECTIFS SUGGÉRÉS : Nombre de mots cible recommandé pour chaque chapitre (en tenant compte de la nature du chapitre — introduction/conclusion plus courts, résultats/cadre théorique plus longs).
3. 💡 RECOMMANDATIONS : Actions concrètes pour améliorer l'équilibre (où ajouter/retirer du contenu).
4. ⚡ PRIORITÉS : Ordre de priorité des actions à entreprendre.
5. 📅 RYTHME : Rythme d'écriture quotidien suggéré si l'étudiant dispose de 3 mois.`;

      const res = await fetch("/api/ai-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(withAiConfig({
          mode: "supervision",
          prompt,
        })),
      });
      if (!res.ok) throw new Error("Erreur lors de la génération IA");
      const json = await res.json();
      setAiRecommendations(json.data.content);
      toast.success("Recommandations générées avec succès");
    } catch {
      toast.error("Erreur lors de la génération des recommandations");
    } finally {
      setAiLoading(false);
    }
  }, [selectedThesis, chaptersAnalysis, totalWords, averageWords, balanceScore, withAiConfig]);

  // Save target
  const saveTarget = useCallback(
    (chapterId: string, value: string) => {
      const num = parseInt(value);
      if (isNaN(num) || num < 0) {
        toast.error("Veuillez entrer un nombre valide");
        return;
      }
      setLocalTargets((prev) => ({ ...prev, [chapterId]: num }));
      setEditingTarget(null);
      toast.success("Objectif mis à jour");
    },
    []
  );

  // ═══════════════════════════════════════
  // Render
  // ═══════════════════════════════════════

  if (isLoading) return <LoadingSkeleton />;

  if (!theses || theses.length === 0) {
    return (
      <div className="max-w-6xl mx-auto flex flex-col gap-6 p-6">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">Aucune thèse disponible</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Créez d&apos;abord une thèse dans l&apos;éditeur pour analyser l&apos;équilibre de vos chapitres.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Scale className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">
            Équilibre des chapitres
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Analysez la répartition de vos chapitres, définissez des objectifs et obtenez des recommandations IA.
        </p>
      </div>

      {/* Thesis Selector */}
      {theses.length > 1 && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Thèse :</span>
          {theses.map((t) => (
            <Button
              key={t.id}
              variant={t.id === (selectedThesis?.id) ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedThesisId(t.id)}
            >
              {t.title}
            </Button>
          ))}
        </div>
      )}

      {/* Balance Score + Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Balance Score Card */}
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardContent className="flex flex-col items-center justify-center py-6 gap-2">
            <div className="relative h-24 w-24">
              <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted/30"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(balanceScore / 100) * 264} 264`}
                  className={getBalanceBgColor(balanceScore)}
                  style={{
                    transition: "stroke-dasharray 0.6s ease",
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-bold ${getBalanceColor(balanceScore)}`}>
                  {balanceScore}%
                </span>
                <span className="text-[10px] text-muted-foreground">Équilibre</span>
              </div>
            </div>
            <Badge
              variant="secondary"
              className={getBalanceColor(balanceScore)}
            >
              {getBalanceLabel(balanceScore)}
            </Badge>
          </CardContent>
        </Card>

        {/* Total Words */}
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalWords.toLocaleString("fr-FR")}</p>
                <p className="text-xs text-muted-foreground">Mots totaux</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average */}
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Math.round(averageWords).toLocaleString("fr-FR")}</p>
                <p className="text-xs text-muted-foreground">
                  Moy. / chapitre
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chapters Count */}
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Gauge className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{chaptersAnalysis.length}</p>
                <p className="text-xs text-muted-foreground">
                  Chapitres
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Bar Chart + Target Setting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-5 w-5" />
            Comparaison visuelle des chapitres
          </CardTitle>
          <CardDescription>
            Largeur proportionnelle au nombre de mots. Cliquez sur l&apos;icône crayon pour définir un objectif.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {chaptersAnalysis.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucun chapitre trouvé pour cette thèse.
            </p>
          ) : (
            <>
              {/* CSS bar chart */}
              <div className="flex flex-col gap-2">
                {chaptersAnalysis.map((ch) => {
                  const maxWords = Math.max(...chaptersAnalysis.map((c) => c.wordCount), 1);
                  const barWidth = (ch.wordCount / maxWords) * 100;
                  const hasTarget = ch.targetWordCount > 0;
                  const targetWidth = hasTarget
                    ? Math.min((ch.targetWordCount / maxWords) * 100, 100)
                    : 0;
                  const progressPct =
                    hasTarget && ch.targetWordCount > 0
                      ? Math.min((ch.wordCount / ch.targetWordCount) * 100, 100)
                      : 0;

                  return (
                    <div key={ch.id} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <Badge variant="outline" className="shrink-0 text-xs font-mono">
                            {ch.number}
                          </Badge>
                          <span className="truncate font-medium">{ch.title}</span>
                          {ch.status === "completed" && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-muted-foreground tabular-nums">
                            {ch.wordCount.toLocaleString("fr-FR")}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            ({ch.proportion.toFixed(1)}%)
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              setEditingTarget(ch.id);
                              setEditingValue(
                                ch.targetWordCount > 0
                                  ? String(ch.targetWordCount)
                                  : ""
                              );
                            }}
                          >
                            <Pencil className="h-3 w-3 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>

                      {/* Main bar */}
                      <div className="relative h-7 w-full rounded-md bg-muted/50 overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full rounded-md transition-all duration-500 bg-primary/70"
                          style={{ width: `${barWidth}%` }}
                        />
                        {/* Target marker */}
                        {hasTarget && targetWidth > 0 && (
                          <div
                            className="absolute top-0 h-full w-0.5 bg-amber-500 z-10"
                            style={{ left: `${Math.min(targetWidth, 100)}%` }}
                            title={`Objectif: ${ch.targetWordCount} mots`}
                          />
                        )}
                        {/* Progress overlay if target set */}
                        {hasTarget && ch.targetWordCount > 0 && (
                          <div
                            className="absolute left-0 top-0 h-full rounded-md bg-primary/30 transition-all duration-500"
                            style={{ width: `${targetWidth}%` }}
                          />
                        )}
                      </div>

                      {/* Target input (inline editing) */}
                      {editingTarget === ch.id && (
                        <div className="flex items-center gap-2 ml-10">
                          <Input
                            type="number"
                            min={0}
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            placeholder="Objectif en mots"
                            className="h-7 w-40 text-xs"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveTarget(ch.id, editingValue);
                              if (e.key === "Escape") setEditingTarget(null);
                            }}
                            onBlur={() => {
                              if (editingValue) saveTarget(ch.id, editingValue);
                              else setEditingTarget(null);
                            }}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => saveTarget(ch.id, editingValue)}
                          >
                            Enregistrer
                          </Button>
                        </div>
                      )}

                      {/* Progress toward target */}
                      {hasTarget && ch.targetWordCount > 0 && editingTarget !== ch.id && (
                        <div className="flex items-center gap-2 ml-10">
                          <Progress
                            value={progressPct}
                            className="h-1.5 flex-1"
                          />
                          <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                            {ch.wordCount}/{ch.targetWordCount} mots
                            ({progressPct.toFixed(0)}%)
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Chapter Detail Table + Target Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-5 w-5" />
            Détail par chapitre et objectifs
          </CardTitle>
          <CardDescription>
            Écarts par rapport à la moyenne et progression vers les objectifs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <div className="col-span-1">N°</div>
              <div className="col-span-3">Titre</div>
              <div className="col-span-2 text-right">Mots</div>
              <div className="col-span-1 text-right">%</div>
              <div className="col-span-1 text-right">Écart</div>
              <div className="col-span-2 text-right">Objectif</div>
              <div className="col-span-2">Progression</div>
            </div>
            <Separator />

            {/* Rows */}
            {chaptersAnalysis.map((ch) => {
              const pctOfTarget =
                ch.targetWordCount > 0
                  ? Math.min((ch.wordCount / ch.targetWordCount) * 100, 100)
                  : 0;

              return (
                <div
                  key={ch.id}
                  className="grid grid-cols-12 gap-2 px-3 py-2.5 items-center rounded-lg hover:bg-muted/50 transition-colors text-sm"
                >
                  <div className="col-span-1">
                    <Badge variant="outline" className="font-mono text-xs">
                      {ch.number}
                    </Badge>
                  </div>
                  <div className="col-span-3 truncate font-medium">{ch.title}</div>
                  <div className="col-span-2 text-right tabular-nums">
                    {ch.wordCount.toLocaleString("fr-FR")}
                  </div>
                  <div className="col-span-1 text-right text-muted-foreground tabular-nums">
                    {ch.proportion.toFixed(1)}
                  </div>
                  <div className="col-span-1 flex justify-end items-center gap-1">
                    {getDiffIcon(ch.diffFromAverage, averageWords)}
                    <span
                      className={`tabular-nums text-xs ${
                        ch.diffFromAverage === 0
                          ? "text-muted-foreground"
                          : ch.diffFromAverage > 0
                            ? "text-amber-600"
                            : "text-red-500"
                      }`}
                    >
                      {ch.diffFromAverage === 0
                        ? "0"
                        : ch.diffFromAverage > 0
                          ? `+${Math.round(ch.diffFromAverage)}`
                          : Math.round(ch.diffFromAverage)}
                    </span>
                  </div>
                  <div className="col-span-2 text-right tabular-nums text-muted-foreground">
                    {ch.targetWordCount > 0
                      ? ch.targetWordCount.toLocaleString("fr-FR")
                      : "—"}
                  </div>
                  <div className="col-span-2">
                    {ch.targetWordCount > 0 ? (
                      <div className="flex items-center gap-2">
                        <Progress value={pctOfTarget} className="h-1.5 flex-1" />
                        <span className="text-xs tabular-nums text-muted-foreground shrink-0">
                          {pctOfTarget.toFixed(0)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        Pas d&apos;objectif
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Totals row */}
            <Separator />
            <div className="grid grid-cols-12 gap-2 px-3 py-2 items-center text-sm font-semibold bg-muted/30 rounded-lg">
              <div className="col-span-4">Total</div>
              <div className="col-span-2 text-right tabular-nums">
                {totalWords.toLocaleString("fr-FR")}
              </div>
              <div className="col-span-1 text-right tabular-nums">100</div>
              <div className="col-span-1" />
              <div className="col-span-2 text-right tabular-nums text-muted-foreground">
                {totalTargetWords > 0
                  ? totalTargetWords.toLocaleString("fr-FR")
                  : "—"}
              </div>
              <div className="col-span-2">
                {totalTargetWords > 0 && (
                  <div className="flex items-center gap-2">
                    <Progress
                      value={Math.min((totalWords / totalTargetWords) * 100, 100)}
                      className="h-1.5 flex-1"
                    />
                    <span className="text-xs tabular-nums text-muted-foreground shrink-0">
                      {Math.min((totalWords / totalTargetWords) * 100, 100).toFixed(0)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Writing Pace Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-5 w-5" />
            Calculateur de rythme d&apos;écriture
          </CardTitle>
          <CardDescription>
            Estimez le rythme quotidien nécessaire pour atteindre vos objectifs.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Date limite de la thèse
              </label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-48"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          {paceInfo ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border-dashed">
                <CardContent className="py-4 flex flex-col items-center gap-1">
                  <CalendarClock className="h-5 w-5 text-muted-foreground" />
                  <p className="text-2xl font-bold tabular-nums">
                    {paceInfo.daysRemaining}
                  </p>
                  <p className="text-xs text-muted-foreground">Jours restants</p>
                </CardContent>
              </Card>
              <Card className="border-dashed">
                <CardContent className="py-4 flex flex-col items-center gap-1">
                  <Zap className="h-5 w-5 text-muted-foreground" />
                  <p className="text-2xl font-bold tabular-nums">
                    {paceInfo.wordsPerDay.toLocaleString("fr-FR")}
                  </p>
                  <p className="text-xs text-muted-foreground">Mots / jour</p>
                </CardContent>
              </Card>
              <Card className="border-dashed">
                <CardContent className="py-4 flex flex-col items-center gap-1">
                  <div
                    className={`h-5 w-5 ${
                      paceInfo.feasible
                        ? "text-emerald-600"
                        : "text-red-500"
                    }`}
                  >
                    {paceInfo.feasible ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5" />
                    )}
                  </div>
                  <p className="text-2xl font-bold">
                    {paceInfo.wordsRemaining.toLocaleString("fr-FR")}
                  </p>
                  <p className="text-xs text-muted-foreground">Mots restants</p>
                  <Badge
                    variant={paceInfo.feasible ? "secondary" : "destructive"}
                    className="text-[10px]"
                  >
                    {paceInfo.feasible ? "Réaliste" : "Intense"}
                  </Badge>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ChevronRight className="h-4 w-4" />
              <span>
                Définissez une date limite et des objectifs par chapitre pour calculer le rythme d&apos;écriture nécessaire.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-5 w-5 text-primary" />
            Recommandations IA
          </CardTitle>
          <CardDescription>
            Obtenez des suggestions personnalisées pour équilibrer vos chapitres.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button
            onClick={generateAiRecommendations}
            disabled={aiLoading || chaptersAnalysis.length === 0}
            className="w-fit"
          >
            {aiLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Générer les recommandations
              </>
            )}
          </Button>

          {aiLoading && (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          )}

          {aiRecommendations && (
            <div className="prose prose-sm dark:prose-invert max-w-none rounded-lg border bg-muted/30 p-6">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {aiRecommendations}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════
// Loading Skeleton
// ═══════════════════════════════════════

function LoadingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 p-6">
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded" />
        <Skeleton className="h-8 w-56" />
      </div>
      <Skeleton className="h-4 w-96" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Skeleton className="h-36 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
      </div>
      <Skeleton className="h-80 rounded-lg" />
      <Skeleton className="h-60 rounded-lg" />
      <Skeleton className="h-40 rounded-lg" />
    </div>
  );
}
