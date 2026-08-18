"use client";

import { useState, useCallback, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAiConfig } from "@/hooks/use-ai-config";
// Diagnostic questions from fiche 05 (auto-edition-8c) are embedded in CHECKLIST_8C
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  Workflow,
  Heart,
  Sparkles,
  FileText,
  Loader2,
  History,
  RotateCcw,
  AlertTriangle,
  Info,
  ClipboardCheck,
  BookOpenCheck,
  Star,
  ArrowRightLeft,
  Table2,
  CopyX,
  ChevronDown,
  XCircle,
  Languages,
  AlignLeft,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

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

interface CriterionDef {
  id: string;
  label: string;
  englishLabel: string;
  description: string;
  icon: LucideIcon;
  promptKey: string;
  isCourtesy?: boolean;
}

// Verification-publication types
interface ParagraphResult {
  index: number;
  preview: string;
  hasDirectOpening: boolean;
  issue: string | null;
}

interface IntroDiscussionResult {
  questions: { question: string; answered: boolean; evidence: string }[];
  orphanResults: string[];
  funnelStructure: { hasInvertedFunnel: boolean; score: number; details: string };
  overallCoherence: number;
}

interface TableQualitySignal {
  name: string;
  status: "green" | "gray" | "red";
  description: string;
}

interface TableQualityResult {
  signals: TableQualitySignal[];
  llmVerdict: { couldBeSentence: boolean; justification: string };
  overallScore: number;
}

interface RedundancyResult {
  isRedundant: boolean;
  redundantPhrases: string[];
  suggestion: string;
}

// ═══════════════════════════════════════════════════
// 8C Criteria — Gastel & Day (correct)
// ═══════════════════════════════════════════════════

const CRITERIA: CriterionDef[] = [
  {
    id: "conformite",
    label: "Conformité",
    englishLabel: "compliance",
    description:
      "Le texte respecte-t-il les consignes formelles (gabarit, conventions terminologiques, structurelles) ?",
    icon: Shield,
    promptKey: "conformité",
  },
  {
    id: "exhaustivite",
    label: "Exhaustivité",
    englishLabel: "completeness",
    description: "Tous les éléments attendus sont-ils présents ?",
    icon: Layers,
    promptKey: "exhaustivité",
  },
  {
    id: "composition",
    label: "Composition",
    englishLabel: "composition",
    description: "La structure d'ensemble est-elle appropriée ?",
    icon: Workflow,
    promptKey: "composition",
  },
  {
    id: "exactitude",
    label: "Exactitude",
    englishLabel: "correctness",
    description:
      "L'information est-elle correcte dans le texte, tableaux, figures, références ?",
    icon: CheckCircle,
    promptKey: "exactitude",
  },
  {
    id: "clarte",
    label: "Clarté",
    englishLabel: "clarity",
    description: "Termes ambigus définis ? Abréviations explicitées ?",
    icon: Eye,
    promptKey: "clarté",
  },
  {
    id: "coherence",
    label: "Cohérence",
    englishLabel: "consistency",
    description:
      "Chiffres identiques texte/tableaux ? Terminologie stable ?",
    icon: Link,
    promptKey: "cohérence",
  },
  {
    id: "concision",
    label: "Concision",
    englishLabel: "conciseness",
    description:
      "Redondances ou contenu tangentiel ? Sans sacrifier la clarté.",
    icon: Minimize2,
    promptKey: "concision",
  },
  {
    id: "courtoisie",
    label: "Courtoisie",
    englishLabel: "courtesy",
    description:
      "Ton neutre envers travaux antérieurs ? Langage inclusif ?",
    icon: Heart,
    promptKey: "courtoisie",
    isCourtesy: true,
  },
];

// ═══════════════════════════════════════════════════
// Checklist 8C sub-items (manual diagnostic)
// ═══════════════════════════════════════════════════

interface ChecklistSubItem {
  id: string;
  label: string;
}

interface ChecklistGroup {
  criterionId: string;
  question: string;
  subItems: ChecklistSubItem[];
}

const CHECKLIST_8C: ChecklistGroup[] = [
  {
    criterionId: "conformite",
    question:
      "Le texte respecte-t-il le gabarit et les conventions de la revue/institution ? La conformité éthique est-elle documentée si nécessaire ?",
    subItems: [
      { id: "conformite-1", label: "Le gabarit de la revue/institution est respecté (marges, polices, interligne)" },
      { id: "conformite-2", label: "Les conventions terminologiques imposées sont suivies" },
      { id: "conformite-3", label: "La conformité éthique est documentée (approbation comité, consentement)" },
    ],
  },
  {
    criterionId: "exhaustivite",
    question:
      "Chaque section contient-elle toute l'information attendue (détails méthodologie suffisants pour réplication) ?",
    subItems: [
      { id: "exhaustivite-1", label: "Toutes les sections requises sont présentes" },
      { id: "exhaustivite-2", label: "La méthodologie permet la réplication de l'étude" },
      { id: "exhaustivite-3", label: "Les limites et hypothèses sont explicitées" },
      { id: "exhaustivite-4", label: "Les résultats déclarés dans le résumé sont tous dans le corps" },
    ],
  },
  {
    criterionId: "composition",
    question:
      "La structure est-elle logique ? Chaque paragraphe a-t-il une phrase d'ancrage claire ?",
    subItems: [
      { id: "composition-1", label: "La structure IMRAD (ou équivalente) est respectée" },
      { id: "composition-2", label: "Chaque paragraphe commence par une phrase d'ancrage" },
      { id: "composition-3", label: "L'enchaînement des idées est logique et fluide" },
    ],
  },
  {
    criterionId: "exactitude",
    question:
      "L'information est-elle correcte dans le texte, les tableaux, les figures et les références ?",
    subItems: [
      { id: "exactitude-1", label: "Les données chiffrées sont exactes et cohérentes" },
      { id: "exactitude-2", label: "Les références bibliographiques sont complètes et correctes" },
      { id: "exactitude-3", label: "Le raisonnement logique est valide (pas de conclusions non étayées)" },
      { id: "exactitude-4", label: "Grammaire, orthographe et ponctuation sont vérifiées" },
    ],
  },
  {
    criterionId: "clarte",
    question:
      "Tous les termes ambigus sont-ils définis ? Les pronoms ont-ils des antécédents clairs ?",
    subItems: [
      { id: "clarte-1", label: "Les termes techniques et ambigus sont définis à la première occurrence" },
      { id: "clarte-2", label: "Les abréviations sont explicitées avant leur usage" },
      { id: "clarte-3", label: "Les phrases excessivement longues (> 40 mots) ont été identifiées" },
      { id: "clarte-4", label: "Les antécédents des pronoms sont identifiables sans ambiguïté" },
    ],
  },
  {
    criterionId: "coherence",
    question:
      "Les chiffres sont-ils identiques entre texte et tableaux ? La terminologie est-elle stable ?",
    subItems: [
      { id: "coherence-1", label: "Les chiffres dans le texte correspondent à ceux des tableaux/figures" },
      { id: "coherence-2", label: "Le résumé correspond au corps du texte" },
      { id: "coherence-3", label: "La terminologie est stable (pas de synonymes flottants pour un même concept)" },
    ],
  },
  {
    criterionId: "concision",
    question:
      "Y a-t-il des redondances, des tournures verbeuses ou du contenu tangentiel à supprimer ?",
    subItems: [
      { id: "concision-1", label: "Les redondances évidentes ont été supprimées" },
      { id: "concision-2", label: "Les tournures verbeuses ont été condensées" },
      { id: "concision-3", label: "Le contenu tangentiel au sujet principal a été retiré ou déplacé" },
    ],
  },
  {
    criterionId: "courtoisie",
    question:
      "Le ton envers les travaux antérieurs est-il neutre ? Le langage est-il inclusif ?",
    subItems: [
      { id: "courtoisie-1", label: "Le ton envers les travaux antérieurs est neutre et respectueux" },
      { id: "courtoisie-2", label: "Le langage est inclusif et non discriminant" },
      { id: "courtoisie-3", label: "Les critiques d'autres travaux sont argumentées, non péjoratives" },
    ],
  },
];

// ═══════════════════════════════════════════════════
// Scientific Article Checklist (7 items)
// ═══════════════════════════════════════════════════

const SCIENTIFIC_CHECKLIST = [
  {
    id: "sci-1",
    label: "Le titre reflète-t-il fidèlement le contenu ?",
  },
  {
    id: "sci-2",
    label: "Le résumé correspond-il au corps du texte ?",
  },
  {
    id: "sci-3",
    label: "L'introduction indique-t-elle le vide comblé ?",
  },
  {
    id: "sci-4",
    label: "La méthode permet-elle réplication et évaluation critique ?",
  },
  {
    id: "sci-5",
    label: "Les résultats sont-ils dans un ordre logique ?",
  },
  {
    id: "sci-6",
    label: "La discussion répond-elle aux questions de l'introduction ?",
  },
  {
    id: "sci-7",
    label: "Tous les auteurs sont-ils listés ?",
  },
];

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

function buildCriterionPrompt(text: string, criterion: CriterionDef): string {
  return `Analyse le texte académique suivant selon le critère unique de la « ${criterion.label} » (${criterion.englishLabel}): ${criterion.description}.

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
  criterion: CriterionDef,
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

  // Tab state
  const [activeTab, setActiveTab] = useState("analyse-ia");

  // Tab 1: AI Analysis state
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progressScores, setProgressScores] = useState<Record<string, number>>({});

  // Tab 2: Checklist 8C state
  const [checklist8c, setChecklist8c] = useState<Record<string, boolean>>({});

  // Tab 3: Scientific checklist state
  const [sciChecklist, setSciChecklist] = useState<Record<string, boolean>>({});

  // Tab 4: Langue seconde & structure state
  const [l2StructureText, setL2StructureText] = useState("");
  const [l2IsAnalyzing, setL2IsAnalyzing] = useState(false);
  const [l2ParagraphResults, setL2ParagraphResults] = useState<ParagraphResult[] | null>(null);
  const [l2FondFormeChecks, setL2FondFormeChecks] = useState<Record<string, boolean>>({});

  // Tab 1: Vérifications publication state
  const [introText, setIntroText] = useState("");
  const [discussionText, setDiscussionText] = useState("");
  const [introDiscussionLoading, setIntroDiscussionLoading] = useState(false);
  const [introDiscussionResult, setIntroDiscussionResult] = useState<IntroDiscussionResult | null>(null);

  const [tableContent, setTableContent] = useState("");
  const [tableQualityLoading, setTableQualityLoading] = useState(false);
  const [tableQualityResult, setTableQualityResult] = useState<TableQualityResult | null>(null);

  const [redundancyText, setRedundancyText] = useState("");
  const [redundancyTableDesc, setRedundancyTableDesc] = useState("");
  const [redundancyLoading, setRedundancyLoading] = useState(false);
  const [redundancyResult, setRedundancyResult] = useState<RedundancyResult | null>(null);

  // Dialog open states
  const [introDialogOpen, setIntroDialogOpen] = useState(false);
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [redundancyDialogOpen, setRedundancyDialogOpen] = useState(false);

  const { toast } = useToast();

  // Diagnostic questions embedded in CHECKLIST_8C constant

  // ═══ Tab 1: AI Analysis handlers ═══

  const handleAnalyze = useCallback(async () => {
    if (!text.trim() || text.trim().length < 20) {
      setError("Veuillez saisir au moins 20 caractères pour lancer l'analyse.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setProgressScores({});

    try {
      const results = await Promise.all(
        CRITERIA.map(async (criterion) => {
          const result = await analyzeCriterion(text, criterion, withAiConfig);
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

  // ═══ Tab 2: Checklist 8C handlers ═══

  const totalChecklist8cItems = useMemo(
    () => CHECKLIST_8C.reduce((sum, g) => sum + g.subItems.length, 0),
    []
  );

  const checkedChecklist8cCount = useMemo(
    () => Object.values(checklist8c).filter(Boolean).length,
    [checklist8c]
  );

  const checklist8cProgress = useMemo(
    () =>
      totalChecklist8cItems > 0
        ? Math.round((checkedChecklist8cCount / totalChecklist8cItems) * 100)
        : 0,
    [checkedChecklist8cCount, totalChecklist8cItems]
  );

  const handleChecklist8cToggle = useCallback(
    (itemId: string, checked: boolean) => {
      setChecklist8c((prev) => ({ ...prev, [itemId]: checked }));
    },
    []
  );

  // ═══ Tab 3: Scientific checklist handlers ═══

  const sciCheckedCount = useMemo(
    () => Object.values(sciChecklist).filter(Boolean).length,
    [sciChecklist]
  );

  const sciProgress = useMemo(
    () =>
      SCIENTIFIC_CHECKLIST.length > 0
        ? Math.round((sciCheckedCount / SCIENTIFIC_CHECKLIST.length) * 100)
        : 0,
    [sciCheckedCount]
  );

  const handleSciCheckToggle = useCallback(
    (itemId: string, checked: boolean) => {
      setSciChecklist((prev) => ({ ...prev, [itemId]: checked }));
    },
    []
  );

  // ═══ Tab 1: Vérifications publication handlers ═══

  const handleIntroDiscussionCheck = useCallback(async () => {
    if (!introText.trim() || !discussionText.trim()) {
      toast({ title: "Champs requis", description: "Veuillez saisir l'introduction et la discussion.", variant: "destructive" });
      return;
    }
    setIntroDiscussionLoading(true);
    setIntroDiscussionResult(null);
    try {
      const res = await fetch("/api/verification-publication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(withAiConfig({ action: "intro-discussion-coherence", introduction: introText, discussion: discussionText })),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erreur réseau" }));
        throw new Error(err.error || "Erreur lors de la vérification");
      }
      const data = await res.json();
      setIntroDiscussionResult(data);
    } catch (err) {
      toast({ title: "Erreur", description: err instanceof Error ? err.message : "Erreur lors de la vérification", variant: "destructive" });
    } finally {
      setIntroDiscussionLoading(false);
    }
  }, [introText, discussionText, withAiConfig, toast]);

  const handleTableQualityCheck = useCallback(async () => {
    if (!tableContent.trim()) {
      toast({ title: "Champ requis", description: "Veuillez saisir le contenu du tableau.", variant: "destructive" });
      return;
    }
    setTableQualityLoading(true);
    setTableQualityResult(null);
    try {
      const res = await fetch("/api/verification-publication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(withAiConfig({ action: "table-quality", tableContent })),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erreur réseau" }));
        throw new Error(err.error || "Erreur lors de l'analyse");
      }
      const data = await res.json();
      setTableQualityResult(data);
    } catch (err) {
      toast({ title: "Erreur", description: err instanceof Error ? err.message : "Erreur lors de l'analyse", variant: "destructive" });
    } finally {
      setTableQualityLoading(false);
    }
  }, [tableContent, withAiConfig, toast]);

  const handleRedundancyCheck = useCallback(async () => {
    if (!redundancyText.trim() || !redundancyTableDesc.trim()) {
      toast({ title: "Champs requis", description: "Veuillez saisir le texte et la description du tableau/figure.", variant: "destructive" });
      return;
    }
    setRedundancyLoading(true);
    setRedundancyResult(null);
    try {
      const res = await fetch("/api/verification-publication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(withAiConfig({ action: "text-table-redundancy", text: redundancyText, tableDescription: redundancyTableDesc })),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erreur réseau" }));
        throw new Error(err.error || "Erreur lors de la vérification");
      }
      const data = await res.json();
      setRedundancyResult(data);
    } catch (err) {
      toast({ title: "Erreur", description: err instanceof Error ? err.message : "Erreur lors de la vérification", variant: "destructive" });
    } finally {
      setRedundancyLoading(false);
    }
  }, [redundancyText, redundancyTableDesc, withAiConfig, toast]);

  // ═══ Tab 4: Langue seconde & structure handlers ═══

  const l2FondFormeProgress = useMemo(
    () => {
      const total = 2;
      const checked = Object.values(l2FondFormeChecks).filter(Boolean).length;
      return total > 0 ? Math.round((checked / total) * 100) : 0;
    },
    [l2FondFormeChecks]
  );

  const handleL2FondFormeToggle = useCallback(
    (itemId: string, checked: boolean) => {
      setL2FondFormeChecks((prev) => ({ ...prev, [itemId]: checked }));
    },
    []
  );

  const handleL2ParagraphAnalysis = useCallback(async () => {
    if (!l2StructureText.trim() || l2StructureText.trim().length < 50) {
      toast({ title: "Texte requis", description: "Veuillez saisir au moins 50 caractères pour analyser les paragraphes.", variant: "destructive" });
      return;
    }
    setL2IsAnalyzing(true);
    setL2ParagraphResults(null);
    try {
      const res = await fetch("/api/verification-publication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(withAiConfig({ action: "paragraph-structure", text: l2StructureText })),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erreur réseau" }));
        throw new Error(err.error || "Erreur lors de l'analyse");
      }
      const data = await res.json();
      setL2ParagraphResults(data.paragraphs || []);
    } catch (err) {
      toast({ title: "Erreur", description: err instanceof Error ? err.message : "Erreur lors de l'analyse des paragraphes", variant: "destructive" });
    } finally {
      setL2IsAnalyzing(false);
    }
  }, [l2StructureText, withAiConfig, toast]);

  // ═══════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Auto-édition : les 8C
        </h1>
        <p className="text-sm text-muted-foreground">
          Évaluez votre texte selon les 8 critères d'auto-édition de Gastel & Day
        </p>
      </div>

      {/* 3 Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analyse-ia" className="gap-1.5 text-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Analyse IA</span>
            <span className="sm:hidden">IA</span>
          </TabsTrigger>
          <TabsTrigger value="checklist-8c" className="gap-1.5 text-sm">
            <ClipboardCheck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Checklist 8C</span>
            <span className="sm:hidden">8C</span>
          </TabsTrigger>
          <TabsTrigger value="checklist-article" className="gap-1.5 text-sm">
            <BookOpenCheck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Checklist article</span>
            <span className="sm:hidden">Article</span>
          </TabsTrigger>
          <TabsTrigger value="langue-seconde" className="gap-1.5 text-sm">
            <Languages className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Langue seconde</span>
            <span className="sm:hidden">L2</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1 : Analyse IA */}
        <TabsContent value="analyse-ia" className="flex flex-col gap-6 mt-6">
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
                placeholder={
                  "Collez ici le texte que vous souhaitez évaluer selon les 8 critères (Conformité, Exhaustivité, Composition, Exactitude, Clarté, Cohérence, Concision, Courtoisie)..."
                }
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={8}
                className="resize-none text-sm"
                disabled={isAnalyzing}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {text.length} caractères ·{" "}
                    {text.trim() ? text.trim().split(/\s+/).length : 0} mots
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

          {/* Vérifications publication — collapsible */}
          <Collapsible>
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <CardTitle className="text-sm">Vérifications publication</CardTitle>
                      <Badge variant="outline" className="text-[10px] h-5">3 outils</Badge>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardDescription className="text-xs">
                    Vérifications spécialisées pour la publication : cohérence intro/discussion, qualité des tableaux, redondance texte/tableau
                  </CardDescription>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="flex flex-col gap-3 border-t pt-4">
                  {/* Button 1: Cohérence intro/discussion */}
                  <Dialog open={introDialogOpen} onOpenChange={setIntroDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full justify-start gap-2 text-sm h-auto py-3">
                        <ArrowRightLeft className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                        <div className="flex flex-col items-start gap-0.5">
                          <span>Cohérence intro / discussion</span>
                          <span className="text-xs text-muted-foreground font-normal">Vérifier que la discussion répond aux questions de l'introduction</span>
                        </div>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base">
                          <ArrowRightLeft className="h-4 w-4" />
                          Cohérence introduction / discussion
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                          Vérifie que chaque question de l'introduction trouve une réponse explicite dans la discussion.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-sm font-medium">Texte de l'introduction</label>
                          <Textarea
                            placeholder="Collez ici le texte de votre introduction (qui contient les questions de recherche / hypothèses)..."
                            value={introText}
                            onChange={(e) => setIntroText(e.target.value)}
                            rows={5}
                            className="text-sm resize-none"
                            disabled={introDiscussionLoading}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-sm font-medium">Texte de la discussion</label>
                          <Textarea
                            placeholder="Collez ici le texte de votre discussion..."
                            value={discussionText}
                            onChange={(e) => setDiscussionText(e.target.value)}
                            rows={5}
                            className="text-sm resize-none"
                            disabled={introDiscussionLoading}
                          />
                        </div>
                        <Button
                          onClick={handleIntroDiscussionCheck}
                          disabled={introDiscussionLoading || !introText.trim() || !discussionText.trim()}
                          className="gap-2"
                        >
                          {introDiscussionLoading ? (
                            <><Loader2 className="h-4 w-4 animate-spin" />Analyse en cours...</>
                          ) : (
                            <><ArrowRightLeft className="h-4 w-4" />Vérifier</>
                          )}
                        </Button>

                        {/* Results */}
                        {introDiscussionResult && (
                          <div className="flex flex-col gap-4 border rounded-lg p-4">
                            {/* Overall score */}
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Cohérence globale</span>
                              <Badge variant={introDiscussionResult.overallCoherence >= 7 ? "default" : introDiscussionResult.overallCoherence >= 4 ? "secondary" : "destructive"}>
                                {introDiscussionResult.overallCoherence}/10
                              </Badge>
                            </div>
                            <Progress value={introDiscussionResult.overallCoherence * 10} className="h-2" />

                            {/* Questions */}
                            {introDiscussionResult.questions?.length > 0 && (
                              <div className="flex flex-col gap-2">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Questions de l'introduction</h4>
                                {introDiscussionResult.questions.map((q, i) => (
                                  <div key={i} className="flex items-start gap-2 rounded-lg border p-3">
                                    {q.answered ? (
                                      <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                                    )}
                                    <div className="flex flex-col gap-1 min-w-0">
                                      <p className="text-sm font-medium">{q.question}</p>
                                      <p className="text-xs text-muted-foreground">{q.evidence}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Orphan results */}
                            {introDiscussionResult.orphanResults?.length > 0 && (
                              <div className="flex flex-col gap-2">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Résultats orphelins</h4>
                                {introDiscussionResult.orphanResults.map((r, i) => (
                                  <div key={i} className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20 p-3">
                                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                    <p className="text-sm">{r}</p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Funnel structure */}
                            {introDiscussionResult.funnelStructure && (
                              <div className="flex flex-col gap-2">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Structure en entonnoir</h4>
                                <div className="flex items-center gap-2 rounded-lg border p-3">
                                  {introDiscussionResult.funnelStructure.hasInvertedFunnel ? (
                                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
                                  )}
                                  <div className="flex flex-col gap-0.5 min-w-0">
                                    <p className="text-sm font-medium">
                                      Score : {introDiscussionResult.funnelStructure.score}/10
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {introDiscussionResult.funnelStructure.details}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Button 2: Qualité d'un tableau */}
                  <Dialog open={tableDialogOpen} onOpenChange={setTableDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full justify-start gap-2 text-sm h-auto py-3">
                        <Table2 className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                        <div className="flex flex-col items-start gap-0.5">
                          <span>Qualité d'un tableau</span>
                          <span className="text-xs text-muted-foreground font-normal">Analyser si un tableau apporte une valeur ajoutée ou pourrait être remplacé par une phrase</span>
                        </div>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base">
                          <Table2 className="h-4 w-4" />
                          Qualité d'un tableau
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                          Évalue si le tableau apporte une réelle valeur ajoutée informationnelle.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-sm font-medium">Contenu du tableau</label>
                          <Textarea
                            placeholder="Collez ici le contenu de votre tableau (markdown, tab-separated ou CSV)..."
                            value={tableContent}
                            onChange={(e) => setTableContent(e.target.value)}
                            rows={8}
                            className="text-sm resize-none font-mono"
                            disabled={tableQualityLoading}
                          />
                        </div>
                        <Button
                          onClick={handleTableQualityCheck}
                          disabled={tableQualityLoading || !tableContent.trim()}
                          className="gap-2"
                        >
                          {tableQualityLoading ? (
                            <><Loader2 className="h-4 w-4 animate-spin" />Analyse en cours...</>
                          ) : (
                            <><Table2 className="h-4 w-4" />Analyser</>
                          )}
                        </Button>

                        {/* Results */}
                        {tableQualityResult && (
                          <div className="flex flex-col gap-4 border rounded-lg p-4">
                            {/* Overall score */}
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Score global</span>
                              <Badge variant={tableQualityResult.overallScore >= 7 ? "default" : tableQualityResult.overallScore >= 4 ? "secondary" : "destructive"}>
                                {tableQualityResult.overallScore}/10
                              </Badge>
                            </div>
                            <Progress value={tableQualityResult.overallScore * 10} className="h-2" />

                            {/* Signals */}
                            {tableQualityResult.signals?.length > 0 && (
                              <div className="flex flex-col gap-2">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Signaux détectés</h4>
                                {tableQualityResult.signals.map((sig, i) => (
                                  <div
                                    key={i}
                                    className={`flex items-start gap-2 rounded-lg border p-3 ${
                                      sig.status === "green"
                                        ? "border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20"
                                        : sig.status === "red"
                                          ? "border-red-500/20 bg-red-50/50 dark:bg-red-950/20"
                                          : "border-border bg-muted/30"
                                    }`}
                                  >
                                    <div
                                      className={`h-2.5 w-2.5 rounded-full shrink-0 mt-1 ${
                                        sig.status === "green"
                                          ? "bg-emerald-500"
                                          : sig.status === "red"
                                            ? "bg-red-500"
                                            : "bg-gray-400"
                                      }`}
                                    />
                                    <div className="flex flex-col gap-0.5 min-w-0">
                                      <p className="text-sm font-medium">{sig.name}</p>
                                      <p className="text-xs text-muted-foreground">{sig.description}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* LLM Verdict */}
                            {tableQualityResult.llmVerdict && (
                              <div className="flex flex-col gap-2">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Verdict IA</h4>
                                <div className={`flex items-start gap-2 rounded-lg border p-3 ${
                                  tableQualityResult.llmVerdict.couldBeSentence
                                    ? "border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20"
                                    : "border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20"
                                }`}>
                                  {tableQualityResult.llmVerdict.couldBeSentence ? (
                                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                  )}
                                  <div className="flex flex-col gap-0.5 min-w-0">
                                    <p className="text-sm font-medium">
                                      {tableQualityResult.llmVerdict.couldBeSentence
                                        ? "Le tableau pourrait être remplacé par une phrase"
                                        : "Le tableau apporte une valeur ajoutée"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {tableQualityResult.llmVerdict.justification}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Button 3: Redondance texte/tableau */}
                  <Dialog open={redundancyDialogOpen} onOpenChange={setRedundancyDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full justify-start gap-2 text-sm h-auto py-3">
                        <CopyX className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                        <div className="flex flex-col items-start gap-0.5">
                          <span>Redondance texte / tableau</span>
                          <span className="text-xs text-muted-foreground font-normal">Détecter si le texte reformule inutilement les données du tableau ou de la figure</span>
                        </div>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base">
                          <CopyX className="h-4 w-4" />
                          Redondance texte / tableau
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                          Détecte les reformulations redondantes entre le texte et les tableaux/figures.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-sm font-medium">Texte de la section</label>
                          <Textarea
                            placeholder="Collez ici le texte qui accompagne le tableau ou la figure..."
                            value={redundancyText}
                            onChange={(e) => setRedundancyText(e.target.value)}
                            rows={5}
                            className="text-sm resize-none"
                            disabled={redundancyLoading}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-sm font-medium">Description du tableau / figure</label>
                          <Textarea
                            placeholder="Collez ici le contenu du tableau ou la description de la figure..."
                            value={redundancyTableDesc}
                            onChange={(e) => setRedundancyTableDesc(e.target.value)}
                            rows={5}
                            className="text-sm resize-none"
                            disabled={redundancyLoading}
                          />
                        </div>
                        <Button
                          onClick={handleRedundancyCheck}
                          disabled={redundancyLoading || !redundancyText.trim() || !redundancyTableDesc.trim()}
                          className="gap-2"
                        >
                          {redundancyLoading ? (
                            <><Loader2 className="h-4 w-4 animate-spin" />Analyse en cours...</>
                          ) : (
                            <><CopyX className="h-4 w-4" />Vérifier</>
                          )}
                        </Button>

                        {/* Results */}
                        {redundancyResult && (
                          <div className="flex flex-col gap-4 border rounded-lg p-4">
                            {/* Verdict */}
                            <div className={`flex items-start gap-2 rounded-lg border p-3 ${
                              redundancyResult.isRedundant
                                ? "border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20"
                                : "border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20"
                            }`}
                            >
                              {redundancyResult.isRedundant ? (
                                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                              ) : (
                                <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                              )}
                              <div className="flex flex-col gap-0.5 min-w-0">
                                <p className="text-sm font-medium">
                                  {redundancyResult.isRedundant
                                    ? "Redondance détectée"
                                    : "Pas de redondance problématique"}
                                </p>
                                {redundancyResult.suggestion && (
                                  <p className="text-xs text-muted-foreground">
                                    {redundancyResult.suggestion}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Redundant phrases */}
                            {redundancyResult.redundantPhrases?.length > 0 && (
                              <div className="flex flex-col gap-2">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Phrases redondantes identifiées</h4>
                                {redundancyResult.redundantPhrases.map((phrase, i) => (
                                  <div key={i} className="rounded-lg border border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20 p-3">
                                    <p className="text-sm italic">{phrase}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

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
                          className={`h-4 w-4 shrink-0 ${
                            done
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-muted-foreground animate-pulse"
                          }`}
                        />
                        <span
                          className={
                            done
                              ? "text-emerald-600 dark:text-emerald-400 font-medium"
                              : "text-muted-foreground"
                          }
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
                        Moyenne des 8 critères ·{" "}
                        {new Date(currentResult.timestamp).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-3xl font-bold ${getScoreColor(currentResult.overallScore)}`}
                      >
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
                  const result = currentResult.criteria.find(
                    (r) => r.id === criterion.id
                  );
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
                        {/* Courtesy special badge */}
                        {criterion.isCourtesy && (
                          <Badge
                            variant="outline"
                            className="mt-1.5 w-fit gap-1 text-[10px] h-5 border-rose-400/40 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400"
                          >
                            <Star className="h-2.5 w-2.5" />
                            Valeur ajoutée unique
                          </Badge>
                        )}
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
                              {criterion.isCourtesy && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] h-5 gap-1 border-rose-400/40 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400"
                                >
                                  <Star className="h-2.5 w-2.5" />
                                  Valeur ajoutée unique
                                </Badge>
                              )}
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
                  les 8 critères d'auto-édition de Gastel & Day.
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {CRITERIA.map((c) => {
                    const Icon = c.icon;
                    return (
                      <Badge
                        key={c.id}
                        variant="outline"
                        className="gap-1 text-[10px] h-6"
                      >
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
                          {h.overallScore >= 75
                            ? "Excellent"
                            : h.overallScore >= 50
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
        </TabsContent>

        {/* TAB 2 : Checklist 8C */}
        <TabsContent value="checklist-8c" className="flex flex-col gap-6 mt-6">
          {/* Reading method guidance */}
          <Card className="border-sky-500/20 bg-sky-50/50 dark:bg-sky-950/20">
            <CardContent className="p-4 flex items-start gap-3">
              <Info className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-sky-900 dark:text-sky-100">
                  Méthode de relecture en passes successives
                </p>
                <p className="text-xs text-sky-800/80 dark:text-sky-200/70">
                  Vérifier les 8C en passes successives. La dernière passe doit être
                  linéaire, du début à la fin.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Progress bar */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4" />
                    Checklist diagnostique 8C
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Outil de diagnostic — cochez les items vérifiés manuellement
                  </CardDescription>
                </div>
                <span className="text-sm font-semibold tabular-nums text-muted-foreground">
                  {checkedChecklist8cCount}/{totalChecklist8cItems}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <Progress
                value={checklist8cProgress}
                className="h-2.5 mb-4"
              />
              {checklist8cProgress === 100 && (
                <div className="flex items-center gap-2 mb-4 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20">
                  <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                    Tous les critères ont été vérifiés !
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Checklist items grouped by criterion */}
          <div className="flex flex-col gap-4">
            {CHECKLIST_8C.map((group) => {
              const criterion = CRITERIA.find(
                (c) => c.id === group.criterionId
              );
              if (!criterion) return null;
              const Icon = criterion.icon;
              const allChecked = group.subItems.every(
                (sub) => checklist8c[sub.id]
              );

              return (
                <Card
                  key={group.criterionId}
                  className={`transition-all ${
                    allChecked
                      ? "border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/20"
                      : ""
                  }`}
                >
                  <CardHeader className="pb-2 p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
                          allChecked
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : criterion.isCourtesy
                              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-sm font-semibold">
                            {criterion.label}
                          </CardTitle>
                          {criterion.isCourtesy && (
                            <Badge
                              variant="outline"
                              className="text-[10px] h-5 gap-1 border-rose-400/40 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400"
                            >
                              <Star className="h-2.5 w-2.5" />
                              Valeur ajoutée unique
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {group.question}
                        </p>
                      </div>
                      {allChecked && (
                        <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 pt-0">
                    <div className="flex flex-col gap-2.5 ml-11">
                      {group.subItems.map((sub) => (
                        <label
                          key={sub.id}
                          className="flex items-start gap-2.5 cursor-pointer group"
                        >
                          <Checkbox
                            checked={!!checklist8c[sub.id]}
                            onCheckedChange={(checked) =>
                              handleChecklist8cToggle(sub.id, !!checked)
                            }
                            className="mt-0.5"
                          />
                          <span
                            className={`text-sm leading-relaxed transition-colors ${
                              checklist8c[sub.id]
                                ? "text-foreground/70 line-through"
                                : "text-foreground/90 group-hover:text-foreground"
                            }`}
                          >
                            {sub.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* TAB 3 : Checklist article scientifique */}
        <TabsContent value="checklist-article" className="flex flex-col gap-6 mt-6">
          {/* Progress bar */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BookOpenCheck className="h-4 w-4" />
                    Checklist article scientifique
                  </CardTitle>
                  <CardDescription className="text-xs">
                    7 points de contrôle spécialisés pour un article de recherche
                  </CardDescription>
                </div>
                <span className="text-sm font-semibold tabular-nums text-muted-foreground">
                  {sciCheckedCount}/{SCIENTIFIC_CHECKLIST.length}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={sciProgress} className="h-2.5 mb-2" />
              <p className="text-xs text-muted-foreground">
                {sciProgress === 100
                  ? "Tous les points ont été vérifiés !"
                  : `${SCIENTIFIC_CHECKLIST.length - sciCheckedCount} point(s) restant(s) à vérifier`}
              </p>
            </CardContent>
          </Card>

          {/* Checklist items */}
          <Card>
            <CardContent className="p-0">
              <div className="flex flex-col divide-y">
                {SCIENTIFIC_CHECKLIST.map((item, idx) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground shrink-0">
                      {idx + 1}
                    </span>
                    <Checkbox
                      checked={!!sciChecklist[item.id]}
                      onCheckedChange={(checked) =>
                        handleSciCheckToggle(item.id, !!checked)
                      }
                    />
                    <span
                      className={`text-sm flex-1 transition-colors ${
                        sciChecklist[item.id]
                          ? "text-foreground/70 line-through"
                          : "text-foreground/90"
                      }`}
                    >
                      {item.label}
                    </span>
                    {sciChecklist[item.id] && (
                      <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    )}
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Completion message */}
          {sciProgress === 100 && (
            <Card className="border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/20">
              <CardContent className="p-4 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                  Tous les points de la checklist article ont été vérifiés. Votre
                  manuscrit est prêt pour la soumission.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TAB 4 : Langue seconde & structure */}
        <TabsContent value="langue-seconde" className="flex flex-col gap-6 mt-6">
          {/* Section A: Fond avant forme */}
          <Card className="border-sky-500/20 bg-sky-50/50 dark:bg-sky-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Info className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                Principe : Fond avant forme
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-sky-900 dark:text-sky-100 leading-relaxed">
                Le contenu prime sur l'élégance stylistique. Si le contenu est informatif, bien organisé et clair, les problèmes de grammaire restent corrigibles. Si l'information manque ou le sens reste flou, aucune correction linguistique ne peut compenser.
              </p>
              <div className="flex flex-col gap-2.5 ml-1">
                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <Checkbox
                    checked={!!l2FondFormeChecks["fond-structure"]}
                    onCheckedChange={(checked) =>
                      handleL2FondFormeToggle("fond-structure", !!checked)
                    }
                    className="mt-0.5"
                  />
                  <span className={`text-sm leading-relaxed transition-colors ${l2FondFormeChecks["fond-structure"] ? "text-foreground/70 line-through" : "text-foreground/90 group-hover:text-foreground"}`}>
                    Structure et clarté du contenu vérifiées en premier
                  </span>
                </label>
                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <Checkbox
                    checked={!!l2FondFormeChecks["forme-surface"]}
                    onCheckedChange={(checked) =>
                      handleL2FondFormeToggle("forme-surface", !!checked)
                    }
                    className="mt-0.5"
                  />
                  <span className={`text-sm leading-relaxed transition-colors ${l2FondFormeChecks["forme-surface"] ? "text-foreground/70 line-through" : "text-foreground/90 group-hover:text-foreground"}`}>
                    Points de langue de surface traités en second
                  </span>
                </label>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={l2FondFormeProgress} className="h-2 flex-1" />
                <span className="text-xs font-medium text-muted-foreground tabular-nums w-8 text-right">{l2FondFormeProgress}%</span>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Section B: Analyse de la structure des paragraphes */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlignLeft className="h-4 w-4" />
                  Analyse de la structure des paragraphes
                </CardTitle>
                <CardDescription className="text-xs">
                  Vérifie que chaque paragraphe s'ouvre sur une phrase d'ancrage directe — utile pour les rédacteurs en langue seconde
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Textarea
                placeholder={"Collez ici le texte à analyser (séparez les paragraphes par des lignes vides). L'IA vérifiera que chaque paragraphe commence par une phrase d'ancrage claire..."}
                value={l2StructureText}
                onChange={(e) => setL2StructureText(e.target.value)}
                rows={10}
                className="text-sm resize-none"
                disabled={l2IsAnalyzing}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {l2StructureText.length} caractères
                </span>
                <Button
                  onClick={handleL2ParagraphAnalysis}
                  disabled={!l2StructureText.trim() || l2StructureText.trim().length < 50 || l2IsAnalyzing}
                  className="gap-2"
                >
                  {l2IsAnalyzing ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />Analyse en cours...</>
                  ) : (
                    <><AlignLeft className="h-4 w-4" />Analyser les paragraphes</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Paragraph results */}
          {l2ParagraphResults && !l2IsAnalyzing && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlignLeft className="h-4 w-4" />
                      Résultats de l'analyse
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {l2ParagraphResults.length} paragraphe(s) analysé(s) · {l2ParagraphResults.filter((p) => p.hasDirectOpening).length} avec ouverture directe
                    </CardDescription>
                  </div>
                  <Badge variant={l2ParagraphResults.every((p) => p.hasDirectOpening) ? "default" : l2ParagraphResults.filter((p) => p.hasDirectOpening).length >= l2ParagraphResults.length / 2 ? "secondary" : "destructive"}>
                    {l2ParagraphResults.filter((p) => p.hasDirectOpening).length}/{l2ParagraphResults.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
                  {l2ParagraphResults.map((para) => (
                    <div
                      key={para.index}
                      className={`flex items-start gap-3 rounded-lg border p-3 transition-all ${para.hasDirectOpening ? "border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/20" : "border-amber-500/20 bg-amber-50/30 dark:bg-amber-950/20"}`}
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground shrink-0">
                        {para.index + 1}
                      </span>
                      {para.hasDirectOpening ? (
                        <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                      )}
                      <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <p className="text-sm text-foreground/80 truncate">{para.preview}</p>
                        {para.issue && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed">{para.issue}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading state */}
          {l2IsAnalyzing && (
            <Card>
              <CardContent className="p-6 flex items-center justify-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Analyse de la structure des paragraphes en cours...</span>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
