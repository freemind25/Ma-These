"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Stamp,
  ScanSearch,
  BookOpen,
  HelpCircle,
  Play,
  Loader2,
  ShieldX,
  CheckCircle2,
  TrendingUp,
  Lightbulb,
  ArrowLeftRight,
  GitCompareArrows,
  TriangleAlert,
  Type,
  Scale,
  Hash,
  BookMarked,
  Workflow,
  RotateCcw,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAiConfig } from "@/hooks/use-ai-config";
import { toast } from "sonner";
import {
  COHERENCE_CATEGORIES,
  COHERENCE_CHECKS,
  PAIR_SECTIONS,
  ANALYSIS_MODES,
  getChecksByCategory,
  getCategoryById,
} from "@/lib/data/coherence-data";

/* ═══════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════ */

interface CheckResult {
  id: string;
  pass: boolean;
  severity: "ok" | "critical" | "major" | "minor";
  message: string;
  excerpt?: string;
  suggestion?: string;
  label: string;
  category: string;
  description: string;
}

interface AnalysisResult {
  checks: CheckResult[];
  global_score: number;
  summary: string;
  truthmark: boolean;
  truthmark_message: string;
  strengths: string[];
  recommendations: string[];
  categoryScores: Record<string, { passed: number; total: number; score: number }>;
}

/* ═══════════════════════════════════════════════════════════════
   Icon mapping for data-driven icon names
   ═══════════════════════════════════════════════════════════════ */

const ICON_MAP: Record<string, React.ElementType> = {
  Type,
  Scale,
  Hash,
  ArrowLeftRight,
  BookMarked,
  Workflow,
  ScanSearch,
  GitCompareArrows,
  TriangleAlert,
  BookOpen,
  HelpCircle,
  Stamp,
};

function getIcon(iconName: string): React.ElementType {
  return ICON_MAP[iconName] || Type;
}

/* ═══════════════════════════════════════════════════════════════
   Severity helpers
   ═══════════════════════════════════════════════════════════════ */

function severityVariant(severity: string) {
  switch (severity) {
    case "critical":
      return { bg: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300", label: "Critique" };
    case "major":
      return { bg: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300", label: "Majeur" };
    case "minor":
      return { bg: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400", label: "Mineur" };
    default:
      return { bg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300", label: "OK" };
  }
}

/* ═══════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════ */

export function VerificationCoherencePage() {
  const { withAiConfig } = useAiConfig();

  // ── State ────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("analyse");
  const [selectedMode, setSelectedMode] = useState(ANALYSIS_MODES[0].id);
  const [sectionTexts, setSectionTexts] = useState<Record<string, string>>({});
  const [activeCategories, setActiveCategories] = useState<Set<string>>(
    () => new Set(COHERENCE_CATEGORIES.map((c) => c.id))
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passedExpanded, setPassedExpanded] = useState(false);

  // ── Derived ──────────────────────────────────────────
  const currentMode = useMemo(
    () => ANALYSIS_MODES.find((m) => m.id === selectedMode) ?? ANALYSIS_MODES[0],
    [selectedMode]
  );

  const isRequiredSection = useCallback(
    (sectionId: string) => currentMode.requiredSections.includes(sectionId),
    [currentMode]
  );

  const isOptionalSection = useCallback(
    (sectionId: string) =>
      !currentMode.requiredSections.includes(sectionId),
    [currentMode]
  );

  const canLaunch = useMemo(() => {
    if (loading) return false;
    return currentMode.requiredSections.every(
      (s) => (sectionTexts[s] || "").length >= 20
    );
  }, [loading, currentMode, sectionTexts]);

  const focusedChecks = useMemo(() => {
    if (activeCategories.size === COHERENCE_CATEGORIES.length) return undefined;
    return COHERENCE_CHECKS.filter((c) => activeCategories.has(c.category)).map((c) => c.id);
  }, [activeCategories]);

  const wordCount = useMemo(() => {
    let count = 0;
    for (const text of Object.values(sectionTexts)) {
      if (text.trim()) count += text.trim().split(/\s+/).length;
    }
    return count;
  }, [sectionTexts]);

  // ── Handlers ─────────────────────────────────────────
  const handleSectionChange = useCallback((id: string, value: string) => {
    setSectionTexts((prev) => ({ ...prev, [id]: value }));
  }, []);

  const toggleCategory = useCallback((catId: string) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
      } else {
        next.add(catId);
      }
      return next;
    });
  }, []);

  const resetCategories = useCallback(() => {
    setActiveCategories(new Set(COHERENCE_CATEGORIES.map((c) => c.id)));
  }, []);

  const launchAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const sections: Record<string, string> = {};
      for (const [key, value] of Object.entries(sectionTexts)) {
        if (value.trim()) sections[key] = value.trim();
      }

      if (Object.keys(sections).length === 0) {
        toast.error("Veuillez saisir au moins une section de texte.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/coherence-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(withAiConfig({ mode: selectedMode, sections, focusedChecks })),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        const msg = json.error || "Erreur lors de l&apos;analyse.";
        setError(msg);
        toast.error(msg);
        return;
      }

      setResult(json.data as AnalysisResult);
      toast.success("Analyse de cohérence terminée !");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur réseau.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [sectionTexts, selectedMode, focusedChecks, withAiConfig]);

  // ── Render helpers ───────────────────────────────────
  const renderModeCard = (mode: (typeof ANALYSIS_MODES)[number]) => {
    const Icon = getIcon(mode.icon);
    const isSelected = selectedMode === mode.id;
    return (
      <Card
        key={mode.id}
        className={`cursor-pointer transition-all hover:shadow-md ${
          isSelected
            ? "border-2 border-violet-500 bg-violet-50/50 dark:bg-violet-950/20"
            : "border border-border hover:border-violet-300"
        }`}
        onClick={() => setSelectedMode(mode.id)}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                isSelected
                  ? "bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p
                className={`text-sm font-semibold leading-tight ${
                  isSelected ? "text-violet-700 dark:text-violet-300" : ""
                }`}
              >
                {mode.label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {mode.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSectionInput = (section: (typeof PAIR_SECTIONS)[number]) => {
    const required = isRequiredSection(section.id);
    const optional = isOptionalSection(section.id);
    return (
      <div
        key={section.id}
        className={required ? "border-l-4 border-l-violet-500 pl-4" : "opacity-70"}
      >
        <div className="flex items-center gap-2 mb-2">
          <label className="text-sm font-medium">
            {section.label}
            {required && (
              <Badge variant="outline" className="ml-2 text-xs text-violet-600 border-violet-300">
                Requis
              </Badge>
            )}
            {optional && (
              <Badge variant="outline" className="ml-2 text-xs text-muted-foreground">
                Optionnel
              </Badge>
            )}
          </label>
        </div>
        <p className="text-xs text-muted-foreground mb-2">{section.description}</p>
        <Textarea
          placeholder={section.placeholder}
          value={sectionTexts[section.id] || ""}
          onChange={(e) => handleSectionChange(section.id, e.target.value)}
          className="min-h-[120px] resize-y"
        />
        {(sectionTexts[section.id] || "").trim().length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            {sectionTexts[section.id].trim().split(/\s+/).length} mots
          </p>
        )}
      </div>
    );
  };

  const renderCategoryFilter = () => {
    const allActive = activeCategories.size === COHERENCE_CATEGORIES.length;
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">
            Catégories de vérification
          </p>
          {!allActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetCategories}
              className="text-xs text-violet-600 hover:text-violet-800"
            >
              Tout désélectionner
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {COHERENCE_CATEGORIES.map((cat) => {
            const isActive = activeCategories.has(cat.id);
            const checkCount = getChecksByCategory(cat.id).length;
            return (
              <TooltipProvider key={cat.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => toggleCategory(cat.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                        isActive
                          ? "bg-violet-100 text-violet-700 ring-1 ring-violet-300 dark:bg-violet-900/40 dark:text-violet-300 dark:ring-violet-700"
                          : "bg-muted text-muted-foreground ring-1 ring-border"
                      }`}
                    >
                      {cat.label}
                      <span
                        className={`ml-0.5 ${
                          isActive ? "text-violet-500" : "text-muted-foreground/60"
                        }`}
                      >
                        {checkCount}
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p>{cat.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </div>
    );
  };

  const renderEmptyState = () => (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400 mb-4">
          <Stamp className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold mb-2">
          Prêt à vérifier votre cohérence ?
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Choisissez un mode d&apos;analyse, collez vos sections de thèse, puis lancez
          l&apos;analyse pour obtenir le Sceau de Vérité (Truthmark).
        </p>
      </CardContent>
    </Card>
  );

  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <Loader2 className="h-10 w-10 animate-spin text-violet-500 mb-4" />
      <p className="text-sm font-medium text-muted-foreground">
        Analyse en cours...
      </p>
    </div>
  );

  const renderErrorState = () => (
    <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30">
      <CardContent className="flex items-start gap-3 pt-6">
        <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-red-800 dark:text-red-300">
            Erreur lors de l&apos;analyse
          </p>
          <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
        </div>
      </CardContent>
    </Card>
  );

  const renderTruthmarkBanner = (res: AnalysisResult) => {
    if (res.truthmark) {
      return (
        <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30">
          <CardContent className="flex flex-col sm:flex-row items-center gap-4 pt-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
              <Stamp className="h-7 w-7" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
                Sceau de cohérence accordé
              </h3>
              <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">
                {res.truthmark_message}
              </p>
            </div>
            <div className="text-center shrink-0">
              <p className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {res.global_score}
              </p>
              <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">/ 100</p>
            </div>
          </CardContent>
        </Card>
      );
    }
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30">
        <CardContent className="flex flex-col sm:flex-row items-center gap-4 pt-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400">
            <ShieldX className="h-7 w-7" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg font-bold text-red-800 dark:text-red-300">
              Sceau de cohérence refusé
            </h3>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">
              {res.truthmark_message}
            </p>
          </div>
          <div className="text-center shrink-0">
            <p className="text-4xl font-extrabold text-red-600 dark:text-red-400">
              {res.global_score}
            </p>
            <p className="text-xs text-red-600/70 dark:text-red-400/70">/ 100</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderResults = (res: AnalysisResult) => {
    const failedChecks = res.checks.filter((c) => !c.pass);
    const passedChecks = res.checks.filter((c) => c.pass);

    // Group failed checks by category
    const failedByCategory: Record<string, CheckResult[]> = {};
    for (const check of failedChecks) {
      if (!failedByCategory[check.category]) failedByCategory[check.category] = [];
      failedByCategory[check.category].push(check);
    }

    const failedCategories = Object.entries(failedByCategory).sort(
      (a, b) => b[1].length - a[1].length
    );

    return (
      <div className="space-y-6">
        {/* Truthmark Banner */}
        {renderTruthmarkBanner(res)}

        {/* Global score bar */}
        <Card>
          <CardContent className="pt-6 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Score global de cohérence</p>
              <p className="text-sm font-bold">{res.global_score}%</p>
            </div>
            <Progress
              value={res.global_score}
              className="h-3"
            />
          </CardContent>
        </Card>

        {/* Summary */}
        {res.summary && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm leading-relaxed">{res.summary}</p>
            </CardContent>
          </Card>
        )}

        {/* Category scores */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {COHERENCE_CATEGORIES.map((cat) => {
            const cs = res.categoryScores[cat.id];
            if (!cs) return null;
            const CatIcon = getIcon(cat.icon);
            return (
              <Card key={cat.id} className="p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <CatIcon className={`h-3.5 w-3.5 ${cat.color}`} />
                  <p className="text-xs font-medium leading-tight truncate">
                    {cat.label.replace("Cohérence ", "")}
                  </p>
                </div>
                <Progress value={cs.score} className="h-1.5 mb-1.5" />
                <p className="text-xs text-muted-foreground">
                  {cs.passed}/{cs.total} passé(s)
                </p>
              </Card>
            );
          })}
        </div>

        {/* Failed checks accordion */}
        {failedCategories.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Contrôles échoués
                <Badge variant="destructive" className="ml-1">
                  {failedChecks.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full">
                {failedCategories.map(([catId, checks]) => {
                  const cat = getCategoryById(catId);
                  const CatIcon = cat ? getIcon(cat.icon) : AlertTriangle;
                  return (
                    <AccordionItem key={catId} value={catId}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                          <CatIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {cat?.label || catId}
                          </span>
                          <Badge variant="destructive" className="text-xs">
                            {checks.length}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pt-1">
                          {checks.map((check) => {
                            const sv = severityVariant(check.severity);
                            return (
                              <Card
                                key={check.id}
                                className="border-red-100 dark:border-red-950/50"
                              >
                                <CardContent className="p-4 space-y-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Badge className={sv.bg}>{sv.label}</Badge>
                                    <p className="text-sm font-semibold">{check.label}</p>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {check.message}
                                  </p>
                                  {check.excerpt && (
                                    <blockquote className="border-l-4 border-l-violet-400 bg-violet-50/50 dark:bg-violet-950/20 rounded-r-md px-3 py-2 text-sm italic text-muted-foreground">
                                      &laquo;&nbsp;{check.excerpt}&nbsp;&raquo;
                                    </blockquote>
                                  )}
                                  {check.suggestion && (
                                    <div className="rounded-md bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900 px-3 py-2">
                                      <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-0.5">
                                        Suggestion
                                      </p>
                                      <p className="text-sm text-emerald-800 dark:text-emerald-300">
                                        {check.suggestion}
                                      </p>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>
        )}

        {/* Passed checks summary (collapsible) */}
        {passedChecks.length > 0 && (
          <Collapsible open={passedExpanded} onOpenChange={setPassedExpanded}>
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg">
                  <CardTitle className="text-base flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      Contrôles réussis
                      <Badge
                        variant="outline"
                        className="text-emerald-600 border-emerald-300 text-xs"
                      >
                        {passedChecks.length}
                      </Badge>
                    </div>
                    {passedExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <Separator className="mb-3" />
                  <ul className="space-y-1.5">
                    {passedChecks.map((check) => {
                      const cat = getCategoryById(check.category);
                      return (
                        <li
                          key={check.id}
                          className="flex items-start gap-2 text-sm"
                        >
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                          <span>
                            <span className="font-medium">{check.label}</span>
                            {cat && (
                              <span className="text-muted-foreground">
                                {" "}
                                &mdash; {cat.label}
                              </span>
                            )}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* Strengths and Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {res.strengths && res.strengths.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  Points forts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {res.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          {res.recommendations && res.recommendations.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  Recommandations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {res.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Re-analyze button */}
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={launchAnalysis}
            disabled={loading}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Relancer l&apos;analyse
          </Button>
        </div>
      </div>
    );
  };

  // ── Referentiel Tab ──────────────────────────────────
  const renderReferentiel = () => (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Référentiel complet des {COHERENCE_CHECKS.length} contrôles de cohérence
            organisés en {COHERENCE_CATEGORIES.length} catégories. Chaque contrôle est
            évalué automatiquement lors de l&apos;analyse.
          </p>
        </CardContent>
      </Card>
      <Accordion type="multiple" className="w-full">
        {COHERENCE_CATEGORIES.map((cat) => {
          const checks = getChecksByCategory(cat.id);
          const CatIcon = getIcon(cat.icon);
          return (
            <AccordionItem key={cat.id} value={cat.id}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <CatIcon className={`h-4 w-4 ${cat.color}`} />
                  <span className="text-sm font-medium">{cat.label}</span>
                  <Badge variant="outline" className="text-xs">
                    {checks.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {cat.description}
                </p>
                <div className="space-y-3">
                  {checks.map((check) => {
                    const sv = severityVariant(check.severity);
                    return (
                      <Card key={check.id} className="p-3">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className="text-sm font-semibold">{check.label}</p>
                          <Badge className={`${sv.bg} text-xs`}>
                            {sv.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {check.description}
                        </p>
                        {check.example && (
                          <p className="text-xs italic text-muted-foreground/80">
                            Exemple : {check.example}
                          </p>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );

  // ── Aide Tab ─────────────────────────────────────────
  const renderAide = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-violet-500" />
          Guide d&apos;utilisation
        </CardTitle>
        <CardDescription>
          Comment utiliser la vérification de cohérence
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ol className="list-decimal list-inside space-y-3 text-sm">
          <li>
            <span className="font-medium">Choisissez un mode d&apos;analyse</span> &mdash; Sélectionnez le type de vérification adapté à votre besoin (global, intro/discussion, méthodo/résultats, ou trio complet).
          </li>
          <li>
            <span className="font-medium">Collez vos sections de thèse</span> &mdash; Remplissez les champs de texte correspondant aux sections requises par le mode choisi. Les sections optionnelles peuvent également être remplies pour enrichir l&apos;analyse.
          </li>
          <li>
            <span className="font-medium">Filtrez les catégories (optionnel)</span> &mdash; Désélectionnez les catégories de contrôle que vous ne souhaitez pas inclure dans l&apos;analyse.
          </li>
          <li>
            <span className="font-medium">Lancez l&apos;analyse</span> &mdash; Cliquez sur le bouton pour déclencher la vérification par l&apos;intelligence artificielle.
          </li>
          <li>
            <span className="font-medium">Consultez le résultat Truthmark</span> &mdash; Examinez le sceau de cohérence, le score global, les détails par catégorie et les recommandations.
          </li>
        </ol>

        <Separator />

        <div className="bg-violet-50 dark:bg-violet-950/20 rounded-lg p-4 border border-violet-200 dark:border-violet-900">
          <div className="flex items-start gap-3">
            <Stamp className="h-5 w-5 text-violet-600 dark:text-violet-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-violet-800 dark:text-violet-300">
                Qu&apos;est-ce que le Truthmark ?
              </p>
              <p className="text-sm text-violet-700 dark:text-violet-400 mt-1">
                Le Truthmark (Sceau de Vérité) est un indicateur de cohérence interne de votre thèse. Il est accordé si votre score global atteint ou dépasse 70/100, certifiant que votre manuscrit présente un niveau satisfaisant de cohérence terminologique, argumentative, numérique et structurelle.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // ── Main Render ───────────────────────────────────────
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400">
          <Stamp className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Vérification de Cohérence
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Vérifiez la cohérence interne de votre thèse comme un sceau de vérité
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="analyse" className="gap-1.5">
            <ScanSearch className="h-4 w-4" />
            <span className="hidden sm:inline">Analyse</span>
          </TabsTrigger>
          <TabsTrigger value="referentiel" className="gap-1.5">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Référentiel</span>
          </TabsTrigger>
          <TabsTrigger value="aide" className="gap-1.5">
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Aide</span>
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Analyse ──────────────────────────── */}
        <TabsContent value="analyse" className="space-y-6 mt-6">
          {/* Mode selector */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Mode d&apos;analyse</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {ANALYSIS_MODES.map(renderModeCard)}
            </div>
          </div>

          {/* Section text inputs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Sections de texte</p>
              {wordCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {wordCount} mots au total
                </span>
              )}
            </div>
            <div className="space-y-4">
              {PAIR_SECTIONS.map(renderSectionInput)}
            </div>
          </div>

          {/* Category filter */}
          {renderCategoryFilter()}

          {/* Launch button */}
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={launchAnalysis}
              disabled={!canLaunch}
              className="gap-2 bg-violet-600 hover:bg-violet-700 text-white min-w-[280px]"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Play className="h-5 w-5" />
              )}
              {loading
                ? "Analyse en cours..."
                : "Lancer l&apos;analyse de cohérence"}
            </Button>
          </div>

          <Separator />

          {/* Results area */}
          {loading ? (
            renderLoadingState()
          ) : error && !result ? (
            renderErrorState()
          ) : result ? (
            <div className="max-h-[70vh] overflow-y-auto">
              {renderResults(result)}
            </div>
          ) : (
            renderEmptyState()
          )}
        </TabsContent>

        {/* ── Tab 2: Référentiel ──────────────────────── */}
        <TabsContent value="referentiel" className="mt-6">
          {renderReferentiel()}
        </TabsContent>

        {/* ── Tab 3: Aide ──────────────────────────────── */}
        <TabsContent value="aide" className="mt-6">
          {renderAide()}
        </TabsContent>
      </Tabs>
    </div>
  );
}