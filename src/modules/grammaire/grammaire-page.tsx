"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SpellCheck,
  Loader2,
  Copy,
  Check,
  AlertTriangle,
  BookOpen,
  FileText,
  BarChart3,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useAiConfig } from "@/hooks/use-ai-config";

// ═══ Types ═══
interface GrammarError {
  original: string;
  correction: string;
  type: "Orthographe" | "Grammaire" | "Style" | "Ponctuation";
  message: string;
  suggestion: string;
}

interface GrammarStatistics {
  wordCount: number;
  sentenceCount: number;
  totalErrors: number;
  readabilityScore: number;
}

interface GrammarResult {
  statistics: GrammarStatistics;
  errors: GrammarError[];
  correctedText: string;
  parseError?: string;
}

// ═══ Type Badge Colors ═══
const TYPE_STYLES: Record<string, { bg: string; text: string }> = {
  Orthographe: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400" },
  Grammaire: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400" },
  Style: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400" },
  Ponctuation: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-400" },
};

// ═══ French Academic Writing Tips ═══
const ACADEMIC_TIPS = [
  {
    category: "Formulation",
    icon: FileText,
    tips: [
      "Privilégiez la voix passive et le passé composé dans les sections méthodologiques : « Les données ont été collectées » plutôt que « J'ai collecté les données ».",
      "Utilisez le « nous » de modestie (« nous avons analysé ») au lieu du « je » dans les thèses francophones.",
      "Évitez les tournures négatives ; formulez positivement : « Il convient de » plutôt que « Il ne faut pas ». »",
      "Limiter la longueur des phrases à 25–30 mots en moyenne pour maintenir la lisibilité.",
    ],
  },
  {
    category: "Structure",
    icon: BookOpen,
    tips: [
      "Chaque paragraphe doit contenir une seule idée principale, introduite par une phrase-topic.",
      "Utilisez des connecteurs logiques explicites : « cependant », « en revanche », « par conséquent », « ainsi ».",
      "Structurez vos chapitres selon le schéma IMRaD (Introduction, Méthodologie, Résultats, Discussion) dans les articles.",
      "Numérotez les sections et sous-sections de manière hiérarchique (1., 1.1., 1.1.1.).",
    ],
  },
  {
    category: "Style académique",
    icon: Lightbulb,
    tips: [
      "Évitez le langage familier et les expressions trop informelles (ex. : « du coup », « en fait »).",
      "Préférez les termes précis et spécialisés au vocabulaire vague (« influence significative » vs « effet »).",
      "Ne répétez pas le même mot-clé plus de 3 fois dans un paragraphe ; utilisez des synonymes académiques.",
      "Limiter l'utilisation de l'adverbe « très » ; privilégiez des précisions quantitatives (« une augmentation de 40 % »).",
    ],
  },
  {
    category: "Ponctuation et mise en forme",
    icon: AlertTriangle,
    tips: [
      "En français, les guillemets se composent avec des espaces insécables : « comme ceci ».",
      "Utilisez les deux-points pour introduire une explication, une énumération ou une citation.",
      "Les listes académiques utilisent des tirets demi-cadratins (–) et non des puces rondes dans le corps du texte.",
      "Mettez un espace avant et après les signes doubles (: ; ! ?) conformément aux règles typographiques françaises.",
    ],
  },
];

// ═══ Sample Texts for Quick Demo ═══
const SAMPLE_TEXTS = [
  {
    label: "Introduction de thèse",
    text: "La transition numérique a profondement transformé les pratiques pédagogiques dans l'enseignement supérieur. Cependant, peu d'études ont examinés l'impact de ces changements sur les apprentissages des étudiants en situation de handicap. Cette thèse propose d'explorer les mécanismes par lesquels les outils numériques peuvent facilité l'inclusion éducative. Les résultats préliminaires suggère que l'accessibilité numérique constitue un facteur déterminant de la réussite académique, bien que les données recueillis reste insuffisantes pour généraliser ces observations.",
  },
  {
    label: "Méthodologie",
    text: "L'échantillon est composé de 120 participants repartis en trois groupes expérimentaux. Nous avons utilisés une approche mixte combinant des analyses quantitatives et qualitatives. Les données ont été collectés par le biais de questionnaires en ligne et d'entretiens semi-dirigés. Les résultats obtenus montre des différences significatif entre les groupes, cependant, les limites de cette étude doit êtres prises en compte pour l'interprétation des résultats.",
  },
];

// ═══ Main Component ═══
export function GrammairePage() {
  const { withAiConfig } = useAiConfig();
  const [text, setText] = useState("");
  const [result, setResult] = useState<GrammarResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [expandedErrors, setExpandedErrors] = useState<Set<number>>(new Set());

  // Mutation: grammar check via POST /api/ai-writing
  const analyze = useMutation({
    mutationFn: async (inputText: string) => {
      const res = await fetch("/api/ai-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(withAiConfig({ mode: "grammaire", prompt: inputText })),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur lors de l'analyse grammaticale");
      }
      const json = await res.json();
      const rawContent = json.data.content as string;

      // Try to parse JSON from the AI response
      try {
        // Extract JSON from possible markdown code blocks
        const jsonMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, rawContent];
        const jsonStr = jsonMatch[1] ? jsonMatch[1].trim() : rawContent.trim();
        return JSON.parse(jsonStr) as GrammarResult;
      } catch {
        // If parsing fails, return raw content as a note instead of a false negative (BUG-20)
        return {
          statistics: {
            wordCount: inputText.split(/\s+/).filter(Boolean).length,
            sentenceCount: inputText.split(/[.!?]+/).filter((s) => s.trim().length > 0).length,
            totalErrors: -1,
            readabilityScore: 0,
          },
          errors: [],
          correctedText: rawContent,
          parseError: "L'IA n'a pas retourné un résultat analysable. Voici la réponse brute ci-dessous.",
        } as GrammarResult & { parseError?: string };
      }
    },
    onSuccess: (data) => {
      setResult(data);
      setExpandedErrors(new Set());
    },
  });

  const handleAnalyze = () => {
    if (!text.trim() || analyze.isPending) return;
    analyze.mutate(text.trim());
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleError = (index: number) => {
    setExpandedErrors((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleLoadSample = (sampleText: string) => {
    setText(sampleText);
    setResult(null);
  };

  const handleClear = () => {
    setText("");
    setResult(null);
  };

  // Error type counts
  const errorCounts = result?.errors.reduce(
    (acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <SpellCheck className="h-6 w-6 text-primary" />
          Grammaire
        </h1>
        <p className="text-sm text-muted-foreground">
          Vérifiez l&apos;orthographe, la grammaire, le style et la ponctuation de vos textes académiques
          grâce à l&apos;intelligence artificielle
        </p>
      </div>

      {/* Input Area */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Texte à analyser</CardTitle>
              <CardDescription className="text-xs mt-1">
                Collez ou saisissez votre texte académique francophone
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground tabular-nums">
                {text.length} caractères · {text.split(/\s+/).filter(Boolean).length} mots
              </span>
              {text.length > 0 && (
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleClear}>
                  Effacer
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Textarea
            placeholder="Collez ou rédigez votre texte ici pour l'analyser..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            className="resize-none text-sm leading-relaxed"
            disabled={analyze.isPending}
          />

          {/* Sample texts & analyze button */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Exemples :</span>
              {SAMPLE_TEXTS.map((sample) => (
                <Button
                  key={sample.label}
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleLoadSample(sample.text)}
                  disabled={analyze.isPending}
                >
                  {sample.label}
                </Button>
              ))}
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={!text.trim() || text.split(/\s+/).filter(Boolean).length < 5 || analyze.isPending}
              className="gap-2"
            >
              {analyze.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <SpellCheck className="h-4 w-4" />
                  Analyser le texte
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error state */}
      {analyze.isError && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {analyze.error.message}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <>
          {/* Statistics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatMiniCard
              icon={FileText}
              label="Mots"
              value={result.statistics.wordCount}
              accent="chart-1"
            />
            <StatMiniCard
              icon={BarChart3}
              label="Phrases"
              value={result.statistics.sentenceCount}
              accent="chart-2"
            />
            <StatMiniCard
              icon={AlertTriangle}
              label="Erreurs"
              value={result.statistics.totalErrors >= 0 ? result.statistics.totalErrors : "—"}
              accent={result.parseError ? "chart-4" : result.statistics.totalErrors > 0 ? "chart-4" : "chart-2"}
            />
            <StatMiniCard
              icon={SpellCheck}
              label="Lisibilité"
              value={`${result.statistics.readabilityScore}/100`}
              accent={
                result.statistics.readabilityScore >= 70
                  ? "chart-2"
                  : result.statistics.readabilityScore >= 40
                    ? "chart-4"
                    : "chart-5"
              }
            />
          </div>

          {/* Readability bar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>Score de lisibilité</span>
                <span className="font-medium">
                  {result.statistics.readabilityScore >= 70
                    ? "Excellent"
                    : result.statistics.readabilityScore >= 50
                      ? "Correct"
                      : result.statistics.readabilityScore >= 30
                        ? "À améliorer"
                        : "Difficile"}
                </span>
              </div>
              <Progress value={result.statistics.readabilityScore} className="h-2" />
            </CardContent>
          </Card>

          {/* Error breakdown by type */}
          {errorCounts && Object.keys(errorCounts).length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground font-medium">Détail :</span>
              {Object.entries(errorCounts).map(([type, count]) => {
                const style = TYPE_STYLES[type] || TYPE_STYLES.Style;
                return (
                  <Badge key={type} className={`${style.bg} ${style.text} border-0 text-xs`}>
                    {type} : {count}
                  </Badge>
                );
              })}
            </div>
          )}

          {/* Tabs: Errors / Corrected / Tips */}
          <Tabs defaultValue="errors" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="errors" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                Erreurs détectées
                {result.errors.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                    {result.errors.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="corrected" className="gap-2">
                <FileText className="h-4 w-4" />
                Texte corrigé
              </TabsTrigger>
              <TabsTrigger value="tips" className="gap-2">
                <Lightbulb className="h-4 w-4" />
                Conseils académiques
              </TabsTrigger>
            </TabsList>

            {/* Tab: Errors */}
            <TabsContent value="errors" className="mt-4">
              {result.parseError ? (
                <Card className="border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/10">
                  <CardContent className="flex flex-col items-center justify-center py-10 text-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                      <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-sm font-medium">Analyse incomplète</h3>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      {result.parseError}
                    </p>
                  </CardContent>
                </Card>
              ) : result.errors.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-3">
                      <Check className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-sm font-medium">Aucune erreur détectée</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                      Votre texte semble correct du point de vue orthographique, grammatical et stylistique.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <ScrollArea className="max-h-[500px]">
                  <div className="flex flex-col gap-3 pr-4">
                    {result.errors.map((error, index) => {
                      const style = TYPE_STYLES[error.type] || TYPE_STYLES.Style;
                      const isExpanded = expandedErrors.has(index);
                      return (
                        <Card key={index} className="overflow-hidden">
                          <button
                            className="w-full text-left"
                            onClick={() => toggleError(index)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <Badge
                                  className={`${style.bg} ${style.text} border-0 shrink-0 text-[11px] font-semibold`}
                                >
                                  {error.type}
                                </Badge>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm line-through text-muted-foreground">
                                      {error.original}
                                    </span>
                                    <span className="text-xs text-muted-foreground">→</span>
                                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                      {error.correction}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">{error.message}</p>
                                </div>
                                <div className="shrink-0 text-muted-foreground">
                                  {isExpanded ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </div>
                              </div>
                              {isExpanded && error.suggestion && (
                                <div className="mt-3 pl-0 pt-3 border-t">
                                  <div className="flex items-start gap-2">
                                    <Lightbulb className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                                    <p className="text-xs text-muted-foreground">{error.suggestion}</p>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </button>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            {/* Tab: Corrected Text */}
            <TabsContent value="corrected" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Texte corrigé</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1.5 text-xs"
                      onClick={() => handleCopy(result.correctedText)}
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      {copied ? "Copié !" : "Copier le texte"}
                    </Button>
                  </div>
                  <CardDescription className="text-xs">
                    Version corrigée avec toutes les améliorations appliquées
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg bg-muted/50 border p-4 text-sm leading-relaxed whitespace-pre-wrap">
                    {result.correctedText}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Academic Tips */}
            <TabsContent value="tips" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ACADEMIC_TIPS.map((section) => (
                  <Card key={section.category}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <section.icon className="h-4 w-4 text-primary" />
                        {section.category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="flex flex-col gap-3">
                        {section.tips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold mt-0.5">
                              {i + 1}
                            </span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Academic writing reminder */}
              <Card className="mt-4 border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Conseil important</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Un correcteur grammatical automatique est un outil d&apos;aide, non un substitut à la relecture humaine.
                        Faites toujours relire vos textes par un pair ou votre directeur de thèse avant toute soumission.
                        L&apos;IA peut ne pas détecter toutes les nuances sémantiques ou les erreurs contextuelles.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Empty state (no results yet) */}
      {!result && !analyze.isPending && !analyze.isError && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* How it works */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <SpellCheck className="h-4 w-4 text-primary" />
                Comment ça fonctionne
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {[
                  {
                    step: 1,
                    title: "Saisissez votre texte",
                    desc: "Collez ou rédigez votre texte académique dans la zone de saisie ci-dessus",
                  },
                  {
                    step: 2,
                    title: "Lancez l'analyse",
                    desc: "Cliquez sur « Analyser le texte » pour lancer la vérification grammaticale par IA",
                  },
                  {
                    step: 3,
                    title: "Consultez les résultats",
                    desc: "Parcourez les erreurs détectées avec leur type, la correction et les suggestions",
                  },
                  {
                    step: 4,
                    title: "Copiez le texte corrigé",
                    desc: "Récupérez la version corrigée de votre texte prête à être intégrée",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-xs font-medium">{item.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* What is checked */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Ce qui est vérifié
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { type: "Orthographe", desc: "Fautes d'accentuation, confusions, accords", style: TYPE_STYLES.Orthographe },
                  { type: "Grammaire", desc: "Concordance, accords sujet-verbe, syntaxe", style: TYPE_STYLES.Grammaire },
                  { type: "Style", desc: "Répétitions, lourdeurs, formulations vagues", style: TYPE_STYLES.Style },
                  { type: "Ponctuation", desc: "Virgules, deux-points, espaces typographiques", style: TYPE_STYLES.Ponctuation },
                ].map((item) => (
                  <div
                    key={item.type}
                    className={`flex flex-col gap-1.5 rounded-lg border p-3 ${item.style.bg}`}
                  >
                    <span className={`text-xs font-semibold ${item.style.text}`}>{item.type}</span>
                    <span className="text-[11px] text-muted-foreground">{item.desc}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// ═══ Stat Mini Card ═══
function StatMiniCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  accent: string;
}) {
  const accentMap: Record<string, string> = {
    "chart-1": "bg-chart-1/10 text-chart-1",
    "chart-2": "bg-chart-2/10 text-chart-2",
    "chart-4": "bg-chart-4/10 text-chart-4",
    "chart-5": "bg-chart-5/10 text-chart-5",
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accentMap[accent] ?? "bg-muted"}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-lg font-bold tabular-nums">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
