"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GitCompareArrows,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BookOpen,
  GraduationCap,
  FileText,
  Link2,
  Unlink,
  Route,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

// ═══════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════

interface ThesisSummary {
  id: string;
  title: string;
  author: string;
  status: string;
}

interface ChapterReport {
  id: string;
  number: number;
  title: string;
  wordCount: number;
  citationCount: number;
  evidenceDensity: number;
  score: number;
  severity: "good" | "warning" | "critical";
  citationsFound: string[];
  issues: { type: string; message: string }[];
}

interface UnreferencedCitation {
  citation: string;
  foundInChapters: number[];
}

interface UnusedReference {
  id: string;
  authors: string;
  title: string;
  year: number | null;
}

interface RoutingEntry {
  referenceTitle: string;
  citedIn: number[];
}

interface AlignmentReport {
  thesisId: string;
  thesisTitle: string;
  globalScore: number;
  totalCitations: number;
  totalReferences: number;
  matchedReferences: number;
  chapters: ChapterReport[];
  unreferencedCitations: UnreferencedCitation[];
  unusedReferences: UnusedReference[];
  routing: RoutingEntry[];
}

// ═══════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════

function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function getScoreBg(score: number): string {
  if (score >= 80) return "bg-emerald-500/15 border-emerald-500/20";
  if (score >= 50) return "bg-amber-500/15 border-amber-500/20";
  return "bg-red-500/15 border-red-500/20";
}

function getSeverityBadge(severity: string) {
  switch (severity) {
    case "good":
      return <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0">Bon</Badge>;
    case "warning":
      return <Badge variant="secondary" className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-0">Attention</Badge>;
    case "critical":
      return <Badge variant="secondary" className="bg-red-500/15 text-red-700 dark:text-red-400 border-0">Critique</Badge>;
    default:
      return null;
  }
}

// ═══════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════

export function AlignementPreuvesPage() {
  const [theses, setTheses] = useState<ThesisSummary[]>([]);
  const [selectedThesisId, setSelectedThesisId] = useState<string | null>(null);
  const [report, setReport] = useState<AlignmentReport | null>(null);
  const [isLoadingTheses, setIsLoadingTheses] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("chapters");

  // Fetch theses
  useEffect(() => {
    async function fetchTheses() {
      setIsLoadingTheses(true);
      try {
        const res = await fetch("/api/thesis");
        if (!res.ok) throw new Error("Erreur lors du chargement des thèses");
        const json = await res.json();
        const list: ThesisSummary[] = (json.data || []).map((t: { id: string; title: string; author: string; status: string }) => ({
          id: t.id,
          title: t.title,
          author: t.author,
          status: t.status,
        }));
        setTheses(list);
        if (list.length > 0) setSelectedThesisId(list[0].id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setIsLoadingTheses(false);
      }
    }
    fetchTheses();
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!selectedThesisId) return;
    setIsAnalyzing(true);
    setError(null);
    setReport(null);
    try {
      const res = await fetch("/api/alignement-preuves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thesisId: selectedThesisId }),
      });
      if (!res.ok) {
        const errData = (await res.json()) as { error?: string };
        throw new Error(errData.error || `Erreur HTTP ${res.status}`);
      }
      const data = (await res.json()) as AlignmentReport;
      setReport(data);
      toast.success(
        `Analyse terminée — score global : ${data.globalScore}/100`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedThesisId]);

  // ═══════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GitCompareArrows className="h-7 w-7 text-primary" />
          Alignement des Preuves
        </h1>
        <p className="text-muted-foreground mt-1">
          Vérifiez que chaque chapitre est correctement étayé par des références bibliographiques.
          <br />
          <span className="text-xs">
            Inspiré de Truthmark — audit de cohérence code/documentation
          </span>
        </p>
      </div>

      {isLoadingTheses ? (
        <Card>
          <CardContent className="py-8 space-y-3">
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
        </Card>
      ) : theses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Aucune thèse disponible.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Controls */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div className="flex flex-col gap-1.5 flex-1 w-full sm:w-auto">
                <label className="text-xs font-medium">Thèse à analyser</label>
                <Select
                  value={selectedThesisId || ""}
                  onValueChange={(v) => {
                    setSelectedThesisId(v);
                    setReport(null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {theses.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        <span className="truncate max-w-[300px]">{t.title}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !selectedThesisId}
                className="gap-2 shrink-0"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Lancer l&apos;audit
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Error */}
          {error && !isAnalyzing && (
            <Card className="border-red-200 bg-red-50 dark:border-red-800/50 dark:bg-red-950/20">
              <CardContent className="py-3 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Report */}
          {report && (
            <>
              {/* Global Score Card */}
              <Card className={getScoreBg(report.globalScore)}>
                <CardContent className="py-6">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Score circle */}
                    <div className="relative flex items-center justify-center w-24 h-24 shrink-0">
                      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50" cy="50" r="42" fill="none"
                          stroke="currentColor"
                          className="text-muted-foreground/20"
                          strokeWidth="8"
                        />
                        <circle
                          cx="50" cy="50" r="42" fill="none"
                          stroke="currentColor"
                          className={getScoreColor(report.globalScore)}
                          strokeWidth="8"
                          strokeDasharray={`${2 * Math.PI * 42}`}
                          strokeDashoffset={`${2 * Math.PI * 42 * (1 - report.globalScore / 100)}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className={`absolute text-2xl font-bold ${getScoreColor(report.globalScore)}`}>
                        {report.globalScore}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex-1 space-y-2">
                      <h2 className="text-lg font-semibold">Score d&apos;alignement global</h2>
                      <p className="text-sm text-muted-foreground">
                        {report.globalScore >= 80
                          ? "Excellente cohérence entre citations et références."
                          : report.globalScore >= 50
                            ? "Cohérence acceptable — des améliorations sont possibles."
                            : "Cohérence critique — de nombreuses citations ne correspondent pas à des références."}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5" />
                          <strong>{report.totalCitations}</strong> citations
                        </span>
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5" />
                          <strong>{report.totalReferences}</strong> références
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Link2 className="h-3.5 w-3.5" />
                          <strong>{report.matchedReferences}</strong> appariées
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Button
                      variant={activeTab === "chapters" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveTab("chapters")}
                      className="gap-1.5"
                    >
                      <BarChart3 className="h-3.5 w-3.5" />
                      Chapitres
                      <Badge variant="secondary" className="text-[9px] ml-1">
                        {report.chapters.length}
                      </Badge>
                    </Button>
                    <Button
                      variant={activeTab === "unreferenced" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveTab("unreferenced")}
                      className="gap-1.5"
                    >
                      <Unlink className="h-3.5 w-3.5" />
                      Citations orphelines
                      {report.unreferencedCitations.length > 0 && (
                        <Badge variant="secondary" className="text-[9px] ml-1 bg-red-500/15 text-red-600">
                          {report.unreferencedCitations.length}
                        </Badge>
                      )}
                    </Button>
                    <Button
                      variant={activeTab === "unused" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveTab("unused")}
                      className="gap-1.5"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      Références inutilisées
                      {report.unusedReferences.length > 0 && (
                        <Badge variant="secondary" className="text-[9px] ml-1 bg-amber-500/15 text-amber-600">
                          {report.unusedReferences.length}
                        </Badge>
                      )}
                    </Button>
                    <Button
                      variant={activeTab === "routing" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveTab("routing")}
                      className="gap-1.5"
                    >
                      <Route className="h-3.5 w-3.5" />
                      Routing
                      <Badge variant="secondary" className="text-[9px] ml-1">
                        {report.routing.length}
                      </Badge>
                    </Button>
                  </div>

                  {/* Chapters Tab */}
                  {activeTab === "chapters" && (
                    <div className="space-y-3">
                      {report.chapters.map((ch) => (
                        <div
                          key={ch.id}
                          className={`rounded-lg border p-4 ${getScoreBg(ch.score)}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-muted-foreground">
                                Ch.{ch.number}
                              </span>
                              <span className="font-medium text-sm">{ch.title}</span>
                              {getSeverityBadge(ch.severity)}
                            </div>
                            <span className={`text-lg font-bold ${getScoreColor(ch.score)}`}>
                              {ch.score}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-3 mb-3 text-center">
                            <div>
                              <p className="text-lg font-semibold">{ch.wordCount.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">mots</p>
                            </div>
                            <div>
                              <p className="text-lg font-semibold">{ch.citationCount}</p>
                              <p className="text-xs text-muted-foreground">citations</p>
                            </div>
                            <div>
                              <p className="text-lg font-semibold">{ch.evidenceDensity.toFixed(1)}</p>
                              <p className="text-xs text-muted-foreground">cit./1000 mots</p>
                            </div>
                          </div>
                          <Progress value={ch.score} className="h-1.5 mb-2" />
                          {ch.issues.length > 0 && (
                            <div className="space-y-1">
                              {ch.issues.map((issue, i) => (
                                <p key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                                  {ch.severity === "critical" ? (
                                    <XCircle className="h-3 w-3 text-red-500" />
                                  ) : (
                                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                                  )}
                                  {issue.message}
                                </p>
                              ))}
                            </div>
                          )}
                          {ch.citationCount > 0 && (
                            <details className="mt-2">
                              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                                Voir les {ch.citationCount} citations détectées
                              </summary>
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {ch.citationsFound.map((cit, i) => (
                                  <Badge
                                    key={i}
                                    variant="outline"
                                    className="font-mono text-[10px]"
                                  >
                                    {cit}
                                  </Badge>
                                ))}
                              </div>
                            </details>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Unreferenced Citations Tab */}
                  {activeTab === "unreferenced" && (
                    <div>
                      {report.unreferencedCitations.length === 0 ? (
                        <div className="text-center py-8">
                          <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500 mb-2" />
                          <p className="text-sm font-medium">Toutes les citations sont référencées</p>
                          <p className="text-xs text-muted-foreground">
                            Chaque citation dans le texte correspond à une entrée bibliographique.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground mb-3">
                            Ces citations apparaissent dans le texte mais ne correspondent à aucune référence
                            dans votre base bibliographique.
                          </p>
                          {report.unreferencedCitations.map((uc, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between rounded-lg border border-red-200 dark:border-red-800/50 p-3"
                            >
                              <div className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                                <span className="font-mono text-sm">{uc.citation}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                Ch.{uc.foundInChapters.join(", ")}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Unused References Tab */}
                  {activeTab === "unused" && (
                    <div>
                      {report.unusedReferences.length === 0 ? (
                        <div className="text-center py-8">
                          <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500 mb-2" />
                          <p className="text-sm font-medium">Toutes les références sont citées</p>
                          <p className="text-xs text-muted-foreground">
                            Chaque référence de votre base est utilisée dans au moins un chapitre.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground mb-3">
                            Ces références sont dans votre base mais ne sont citées dans aucun chapitre.
                          </p>
                          {report.unusedReferences.map((ref) => (
                            <div
                              key={ref.id}
                              className="rounded-lg border border-amber-200 dark:border-amber-800/50 p-3"
                            >
                              <p className="text-sm font-medium">{ref.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {ref.authors}{ref.year ? ` (${ref.year})` : ""}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Routing Tab — Truthmark-inspired */}
                  {activeTab === "routing" && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Cartographie des références → chapitres (inspiré de Truthmark Routing).
                        Identifiez quelles sources sont utilisées et où.
                      </p>
                      {report.routing.length === 0 ? (
                        <div className="text-center py-8">
                          <Route className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Aucun routing disponible. Lancez d&apos;abord l&apos;audit.
                          </p>
                        </div>
                      ) : (
                        <div className="max-h-96 overflow-y-auto space-y-2">
                          {report.routing.map((r, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between rounded-lg border p-3"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Route className="h-4 w-4 text-primary shrink-0" />
                                <span className="text-sm truncate">{r.referenceTitle}</span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0 ml-2">
                                {r.citedIn.map((chNum) => (
                                  <Badge
                                    key={chNum}
                                    variant="outline"
                                    className="font-mono text-[10px]"
                                  >
                                    Ch.{chNum}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}
