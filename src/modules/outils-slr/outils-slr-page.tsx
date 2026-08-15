"use client";

import { useState, useCallback } from "react";
import {
  GitBranch,
  Plus,
  Trash2,
  Send,
  Download,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  FileSpreadsheet,
  ClipboardCheck,
  BarChart3,
  Loader2,
  Sparkles,
  ArrowDown,
  Filter,
  Search,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAiConfig } from "@/hooks/use-ai-config";

/* ═══════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════ */

type ScreeningDecision = "include" | "exclude" | "maybe" | null;

interface PrismaStage {
  id: string;
  label: string;
  count: number;
  subStages?: PrismaStage[];
}

interface ArticleItem {
  id: string;
  title: string;
  authors: string;
  year: number;
  source: string;
  decision: ScreeningDecision;
  notes: string;
  stage: "identification" | "screening" | "eligibility" | "included";
}

interface PicoField {
  id: string;
  component: string;
  label: string;
  value: string;
}

interface Criterion {
  id: string;
  text: string;
  type: "inclusion" | "exclusion";
}

interface QualityItem {
  id: string;
  text: string;
  checked: boolean;
  note: string;
}

/* ═══════════════════════════════════════════════════
   Initial data
   ═══════════════════════════════════════════════════ */

const INITIAL_PRISMA: PrismaStage[] = [
  {
    id: "identification",
    label: "Identification",
    count: 245,
    subStages: [
      { id: "databases", label: "Bases de données", count: 180 },
      { id: "other", label: "Autres sources", count: 65 },
      { id: "duplicates", label: "Doublons supprimés", count: 42 },
    ],
  },
  {
    id: "screening",
    label: "Dépistage (screening)",
    count: 203,
    subStages: [
      { id: "screen-excluded", label: "Exclus (titre/résumé)", count: 128 },
    ],
  },
  {
    id: "eligibility",
    label: "Admissibilité (eligibility)",
    count: 75,
    subStages: [
      { id: "elig-excluded", label: "Exclus (texte intégral)", count: 48 },
    ],
  },
  {
    id: "included",
    label: "Inclus",
    count: 27,
    subStages: [
      { id: "qualitative", label: "Études qualitatives", count: 15 },
      { id: "quantitative", label: "Études quantitatives", count: 8 },
      { id: "mixed", label: "Études mixtes", count: 4 },
    ],
  },
];

const DEMO_ARTICLES: ArticleItem[] = [
  {
    id: "a1",
    title: "Impact de l'intelligence artificielle sur l'enseignement supérieur : une méta-analyse",
    authors: "Dupont, M.; Martin, L.; Bernard, S.",
    year: 2023,
    source: "Science Direct",
    decision: "include",
    notes: "Très pertinent, méthodologie solide",
    stage: "included",
  },
  {
    id: "a2",
    title: "Adoption des technologies éducatives en contexte universitaire francophone",
    authors: "Leblanc, P.; Moreau, A.",
    year: 2022,
    source: "Erudit",
    decision: "include",
    notes: "Contexte francophone pertinent",
    stage: "included",
  },
  {
    id: "a3",
    title: "Machine learning for student performance prediction",
    authors: "Wang, X.; Zhang, Y.",
    year: 2023,
    source: "IEEE Xplore",
    decision: "maybe",
    notes: "Domaine connexe mais contexte K-12",
    stage: "eligibility",
  },
  {
    id: "a4",
    title: "Les MOOC dans l'enseignement supérieur : une revue systématique",
    authors: "Garcia, R.; Petit, F.",
    year: 2021,
    source: "HAL",
    decision: "exclude",
    notes: "Hors sujet — focus sur MOOC uniquement",
    stage: "screening",
  },
  {
    id: "a5",
    title: "Hybrid teaching approaches in post-secondary education",
    authors: "Johnson, K.; Williams, D.",
    year: 2022,
    source: "SpringerLink",
    decision: "include",
    notes: "",
    stage: "eligibility",
  },
  {
    id: "a6",
    title: "Neural networks for automated grading systems",
    authors: "Chen, H.; Li, M.",
    year: 2023,
    source: "ACM Digital Library",
    decision: "exclude",
    notes: "Hors sujet — focus évaluation automatisée",
    stage: "screening",
  },
  {
    id: "a7",
    title: "Transformation numérique des universités : enjeux et perspectives",
    authors: "Robert, E.; Durand, C.",
    year: 2024,
    source: "CAIRN",
    decision: "maybe",
    notes: "Cadre théorique intéressant",
    stage: "screening",
  },
  {
    id: "a8",
    title: "Adaptive learning systems in higher education : a systematic review",
    authors: "Kim, S.; Park, J.; Lee, T.",
    year: 2023,
    source: "Web of Science",
    decision: "include",
    notes: "Revue systématique de haute qualité",
    stage: "included",
  },
];

const INITIAL_PICO: PicoField[] = [
  { id: "p", component: "P", label: "Population / Participants", value: "Étudiants de l'enseignement supérieur" },
  { id: "i", component: "I", label: "Intervention / Phénomène d'intérêt", value: "Utilisation de l'intelligence artificielle éducative" },
  { id: "c", component: "C", label: "Comparaison", value: "Enseignement traditionnel ou sans IA" },
  { id: "o", component: "O", label: "Résultats / Outcomes", value: "Résultats d'apprentissage, engagement, satisfaction" },
  { id: "s", component: "S", label: "Contexte / Setting", value: "Universités francophones et internationales" },
];

const INITIAL_CRITERIA: Criterion[] = [
  { id: "ic1", text: "Articles de revues à comité de lecture (peer-reviewed)", type: "inclusion" },
  { id: "ic2", text: "Publié entre 2018 et 2024", type: "inclusion" },
  { id: "ic3", text: "Langue : français ou anglais", type: "inclusion" },
  { id: "ic4", text: "Contexte d'enseignement supérieur", type: "inclusion" },
  { id: "ec1", text: "Articles non soumis à un processus d'évaluation par les pairs", type: "exclusion" },
  { id: "ec2", text: "Études portant uniquement sur le primaire ou le secondaire", type: "exclusion" },
  { id: "ec3", text: "Éditoriaux, lettres, résumés de conférence", type: "exclusion" },
];

const CASP_CHECKLIST: QualityItem[] = [
  { id: "casp1", text: "L'objectif de l'étude est-il clairement énoncé ?", checked: false, note: "" },
  { id: "casp2", text: "Le cadre méthodologique est-il approprié ?", checked: false, note: "" },
  { id: "casp3", text: "La stratégie de recrutement est-elle adéquate ?", checked: false, note: "" },
  { id: "casp4", text: "La collecte de données est-elle rigoureusement décrite ?", checked: false, note: "" },
  { id: "casp5", text: "La relation chercheur-participant est-elle prise en compte ?", checked: false, note: "" },
  { id: "casp6", text: "Les considérations éthiques sont-elles respectées ?", checked: false, note: "" },
  { id: "casp7", text: "L'analyse des données est-elle rigoureuse ?", checked: false, note: "" },
  { id: "casp8", text: "Les résultats sont-ils clairement présentés ?", checked: false, note: "" },
  { id: "casp9", text: "La discussion est-elle suffisante et argumentée ?", checked: false, note: "" },
  { id: "casp10", text: "La valeur de la recherche est-elle justifiée ?", checked: false, note: "" },
];

const EXTRACTION_FIELDS = [
  { id: "ef1", label: "Auteur(s)", example: "Dupont, M. et al." },
  { id: "ef2", label: "Année de publication", example: "2023" },
  { id: "ef3", label: "Titre de l'article", example: "Impact de l'IA..." },
  { id: "ef4", label: "Journal / Source", example: "Computers & Education" },
  { id: "ef5", label: "Pays / Contexte", example: "France" },
  { id: "ef6", label: "Cadre méthodologique", example: "Quantitatif, quasi-expérimental" },
  { id: "ef7", label: "Taille de l'échantillon", example: "N = 350" },
  { id: "ef8", label: "Population étudiée", example: "Étudiants de 1er cycle" },
  { id: "ef9", label: "Intervention / Variable indépendante", example: "Tuteur IA adaptatif" },
  { id: "ef10", label: "Variable dépendante / Résultat mesuré", example: "Score d'apprentissage" },
  { id: "ef11", label: "Principaux résultats", example: "+15% sur les tests standardisés" },
  { id: "ef12", label: "Limites identifiées", example: "Pas de groupe contrôle" },
  { id: "ef13", label: "Implications pratiques", example: "Recommandation d'intégration" },
  { id: "ef14", label: "Score de qualité", example: "8/10 (CASP)" },
];

const DATABASES_OPTIONS = [
  "Web of Science",
  "Scopus",
  "PubMed",
  "ERIC",
  "IEEE Xplore",
  "ACM Digital Library",
  "SpringerLink",
  "Science Direct",
  "HAL",
  "Persée",
  "CAIRN",
  "Erudit",
  "Google Scholar",
  "OpenAlex",
  "BASE (Bielefeld)",
];

/* ═══════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════ */

export function OutilsSlrPage() {
  const { withAiConfig } = useAiConfig();
  // PRISMA state
  const [prismaStages, setPrismaStages] = useState<PrismaStage[]>(INITIAL_PRISMA);

  // Article screening state
  const [articles, setArticles] = useState<ArticleItem[]>(DEMO_ARTICLES);
  const [articleFilter, setArticleFilter] = useState<"all" | ScreeningDecision>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Protocol state
  const [picoFields, setPicoFields] = useState<PicoField[]>(INITIAL_PICO);
  const [criteria, setCriteria] = useState<Criterion[]>(INITIAL_CRITERIA);
  const [selectedDatabases, setSelectedDatabases] = useState<string[]>(["Web of Science", "Scopus", "HAL", "Erudit"]);
  const [keywords, setKeywords] = useState<string>("intelligence artificielle; enseignement supérieur; apprentissage adaptatif; technologie éducative");
  const [dateFrom, setDateFrom] = useState("2018");
  const [dateTo, setDateTo] = useState("2024");

  // Quality assessment state
  const [qualityItems, setQualityItems] = useState<QualityItem[]>(CASP_CHECKLIST);
  const [qualityFramework, setQualityFramework] = useState<"casp" | "jbi">("casp");

  // Data extraction state
  const [extractionData, setExtractionData] = useState<Record<string, string>>({});
  const [selectedExtractionArticle, setSelectedExtractionArticle] = useState<string>("a1");

  // AI assistant state
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");

  // Dialog states
  const [addCriteriaOpen, setAddCriteriaOpen] = useState(false);
  const [newCriteriaText, setNewCriteriaText] = useState("");
  const [newCriteriaType, setNewCriteriaType] = useState<"inclusion" | "exclusion">("inclusion");
  const [addKeywordOpen, setAddKeywordOpen] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");

  // ─── Helper functions ───

  const updatePrismaCount = (stageId: string, subStageId: string | null, newCount: number) => {
    setPrismaStages((prev) =>
      prev.map((stage) => {
        if (stage.id === stageId) {
          if (!subStageId) return { ...stage, count: newCount };
          return {
            ...stage,
            count: stage.subStages?.reduce((acc, s) => (s.id === subStageId ? acc + newCount : acc + s.count), 0) ?? newCount,
            subStages: stage.subStages?.map((s) => (s.id === subStageId ? { ...s, count: newCount } : s)),
          };
        }
        return stage;
      })
    );
  };

  const updateArticleDecision = (articleId: string, decision: ScreeningDecision) => {
    setArticles((prev) =>
      prev.map((a) => {
        if (a.id === articleId) {
          const stageMap: Record<string, ArticleItem["stage"]> = {
            include: "included",
            exclude: "screening",
            maybe: "eligibility",
          };
          return { ...a, decision, stage: decision ? stageMap[decision] : a.stage };
        }
        return a;
      })
    );
  };

  const updateArticleNotes = (articleId: string, notes: string) => {
    setArticles((prev) => prev.map((a) => (a.id === articleId ? { ...a, notes } : a)));
  };

  const addCriterion = () => {
    if (!newCriteriaText.trim()) return;
    const newCrit: Criterion = {
      id: `c-${Date.now()}`,
      text: newCriteriaText.trim(),
      type: newCriteriaType,
    };
    setCriteria((prev) => [...prev, newCrit]);
    setNewCriteriaText("");
    setAddCriteriaOpen(false);
    toast.success("Critère ajouté");
  };

  const removeCriterion = (id: string) => {
    setCriteria((prev) => prev.filter((c) => c.id !== id));
    toast.success("Critère supprimé");
  };

  const toggleDatabase = (db: string) => {
    setSelectedDatabases((prev) =>
      prev.includes(db) ? prev.filter((d) => d !== db) : [...prev, db]
    );
  };

  const handleAddKeyword = () => {
    if (!newKeyword.trim()) return;
    setKeywords((prev) => (prev ? `${prev}; ${newKeyword.trim()}` : newKeyword.trim()));
    setNewKeyword("");
    setAddKeywordOpen(false);
    toast.success("Mot-clé ajouté");
  };

  const updatePicoField = (id: string, value: string) => {
    setPicoFields((prev) => prev.map((f) => (f.id === id ? { ...f, value } : f)));
  };

  const toggleQualityItem = (id: string) => {
    setQualityItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const updateQualityNote = (id: string, note: string) => {
    setQualityItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, note } : item))
    );
  };

  const generateResearchQuestion = useCallback(() => {
    const p = picoFields.find((f) => f.id === "p")?.value || "";
    const i = picoFields.find((f) => f.id === "i")?.value || "";
    const c = picoFields.find((f) => f.id === "c")?.value || "";
    const o = picoFields.find((f) => f.id === "o")?.value || "";
    return `Quelle est l'effet de ${i || "[Intervention]"} sur ${o || "[Résultats]"} chez ${p || "[Population]"} comparativement à ${c || "[Comparaison]"} ?`;
  }, [picoFields]);

  const handleAiAssist = useCallback(async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiResult("");
    try {
      const res = await fetch("/api/ai-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(withAiConfig({
          mode: "revue-litterature",
          prompt: aiPrompt,
          context: `Revue systématique en cours. Cadre PICO: ${generateResearchQuestion()}. Critères: ${criteria.map((c) => c.text).join("; ")}. Bases: ${selectedDatabases.join(", ")}.`,
        })),
      });
      if (!res.ok) throw new Error("Erreur API");
      const data = await res.json();
      setAiResult(data.data?.content || "Aucune réponse générée.");
    } catch {
      toast.error("Erreur lors de la génération IA");
      setAiResult("Impossible de générer une réponse. Vérifiez votre connexion.");
    } finally {
      setAiLoading(false);
    }
  }, [aiPrompt, criteria, selectedDatabases, generateResearchQuestion, withAiConfig]);

  // ─── Computed values ───

  const filteredArticles = articles.filter((a) => {
    const matchDecision = articleFilter === "all" || a.decision === articleFilter;
    const matchSearch =
      !searchQuery ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.authors.toLowerCase().includes(searchQuery.toLowerCase());
    return matchDecision && matchSearch;
  });

  const includeCount = articles.filter((a) => a.decision === "include").length;
  const excludeCount = articles.filter((a) => a.decision === "exclude").length;
  const maybeCount = articles.filter((a) => a.decision === "maybe").length;
  const totalCount = articles.length;
  const qualityChecked = qualityItems.filter((q) => q.checked).length;
  const qualityPercent = Math.round((qualityChecked / qualityItems.length) * 100);
  const researchQuestion = generateResearchQuestion();

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 p-6">
      {/* ─── Header ─── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <GitBranch className="h-6 w-6 text-primary" />
          Outils SLR
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Revue systématique de la littérature — Diagramme PRISMA, criblage, extraction et évaluation de la qualité
        </p>
      </div>

      <Separator />

      {/* ─── Main Tabs ─── */}
      <Tabs defaultValue="prisma" className="flex flex-col gap-6">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 w-full h-auto">
          <TabsTrigger value="prisma" className="text-xs py-2">
            <GitBranch className="h-3.5 w-3.5 mr-1.5" />
            PRISMA
          </TabsTrigger>
          <TabsTrigger value="protocol" className="text-xs py-2">
            <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />
            Protocole
          </TabsTrigger>
          <TabsTrigger value="screening" className="text-xs py-2">
            <Filter className="h-3.5 w-3.5 mr-1.5" />
            Criblage
          </TabsTrigger>
          <TabsTrigger value="extraction" className="text-xs py-2">
            <ClipboardCheck className="h-3.5 w-3.5 mr-1.5" />
            Extraction
          </TabsTrigger>
          <TabsTrigger value="quality" className="text-xs py-2">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
            Qualité
          </TabsTrigger>
          <TabsTrigger value="progress" className="text-xs py-2">
            <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
            Suivi
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════════════════════════════
           Tab 1 — PRISMA Flow Diagram
           ═══════════════════════════════════════ */}
        <TabsContent value="prisma" className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Diagramme PRISMA 2020</CardTitle>
                  <CardDescription>
                    Représentation visuelle du processus de sélection des études
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  PRISMA Flowchart
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-3 py-4">
                {prismaStages.map((stage, idx) => {
                  const totalSubCount = stage.subStages?.reduce((a, s) => a + s.count, 0) ?? 0;
                  return (
                    <div key={stage.id} className="flex flex-col items-center gap-3 w-full max-w-xl">
                      {/* Main stage box */}
                      <div className="w-full rounded-lg border-2 border-primary/30 bg-primary/5 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold">{stage.label}</span>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={stage.count}
                              onChange={(e) =>
                                updatePrismaCount(stage.id, null, parseInt(e.target.value) || 0)
                              }
                              className="w-20 h-7 text-xs text-center"
                              min={0}
                            />
                            <Badge variant="secondary" className="text-[10px]">
                              {stage.count} articles
                            </Badge>
                          </div>
                        </div>
                        {/* Sub-stages */}
                        {stage.subStages && stage.subStages.length > 0 && (
                          <div className="flex flex-col gap-2 mt-3 pl-4 border-l-2 border-primary/20">
                            {stage.subStages.map((sub) => (
                              <div
                                key={sub.id}
                                className="flex items-center justify-between text-xs text-muted-foreground"
                              >
                                <span>{sub.label}</span>
                                <Input
                                  type="number"
                                  value={sub.count}
                                  onChange={(e) =>
                                    updatePrismaCount(
                                      stage.id,
                                      sub.id,
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  className="w-16 h-6 text-xs text-center"
                                  min={0}
                                />
                              </div>
                            ))}
                            {totalSubCount !== stage.count && (
                              <div className="flex items-center justify-between text-[10px] text-amber-600 dark:text-amber-400">
                                <span>Total sous-étapes : {totalSubCount}</span>
                                <span>≠ {stage.count}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {/* Arrow between stages */}
                      {idx < prismaStages.length - 1 && (
                        <div className="flex flex-col items-center gap-0.5 text-muted-foreground">
                          <ArrowDown className="h-5 w-5" />
                          <span className="text-[10px]">
                            {prismaStages[idx + 1].count} retenus
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════
           Tab 2 — Research Protocol Builder
           ═══════════════════════════════════════ */}
        <TabsContent value="protocol" className="flex flex-col gap-6">
          {/* PICO/PICOS */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Cadre PICO / PICOS</CardTitle>
                  <CardDescription>
                    Définissez les composantes de votre question de recherche
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  PICOS
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {picoFields.map((field) => (
                  <div key={field.id} className="flex flex-col gap-1.5">
                    <Label className="text-xs font-medium flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground text-[10px] font-bold">
                        {field.component}
                      </span>
                      {field.label}
                    </Label>
                    <Input
                      value={field.value}
                      onChange={(e) => updatePicoField(field.id, e.target.value)}
                      placeholder={field.label}
                      className="text-sm"
                    />
                  </div>
                ))}
              </div>
              <Separator />
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-xs font-medium text-muted-foreground mb-1.5">
                  Question de recherche générée
                </p>
                <p className="text-sm font-medium leading-relaxed">{researchQuestion}</p>
              </div>
            </CardContent>
          </Card>

          {/* Inclusion / Exclusion Criteria */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Critères d'inclusion / exclusion</CardTitle>
                  <CardDescription>
                    Définissez les critères de sélection des articles
                  </CardDescription>
                </div>
                <Dialog open={addCriteriaOpen} onOpenChange={setAddCriteriaOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="text-xs">
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Ajouter
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-base">Nouveau critère</DialogTitle>
                      <DialogDescription>Ajoutez un critère d'inclusion ou d'exclusion</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-2">
                      <Select
                        value={newCriteriaType}
                        onValueChange={(v) => setNewCriteriaType(v as "inclusion" | "exclusion")}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inclusion">Critère d'inclusion</SelectItem>
                          <SelectItem value="exclusion">Critère d'exclusion</SelectItem>
                        </SelectContent>
                      </Select>
                      <Textarea
                        value={newCriteriaText}
                        onChange={(e) => setNewCriteriaText(e.target.value)}
                        placeholder="Décrivez le critère..."
                        rows={3}
                      />
                    </div>
                    <DialogFooter>
                      <Button onClick={addCriterion} disabled={!newCriteriaText.trim()}>
                        Ajouter
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inclusion */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-chart-2" />
                    <span className="text-xs font-semibold text-chart-2">
                      Inclusion ({criteria.filter((c) => c.type === "inclusion").length})
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {criteria
                      .filter((c) => c.type === "inclusion")
                      .map((c) => (
                        <div
                          key={c.id}
                          className="flex items-start gap-2 rounded-md border border-chart-2/20 bg-chart-2/5 p-3 text-sm"
                        >
                          <span className="text-chart-2 mt-0.5 shrink-0">✓</span>
                          <span className="flex-1 leading-relaxed">{c.text}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={() => removeCriterion(c.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
                {/* Exclusion */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <X className="h-4 w-4 text-chart-4" />
                    <span className="text-xs font-semibold text-chart-4">
                      Exclusion ({criteria.filter((c) => c.type === "exclusion").length})
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {criteria
                      .filter((c) => c.type === "exclusion")
                      .map((c) => (
                        <div
                          key={c.id}
                          className="flex items-start gap-2 rounded-md border border-chart-4/20 bg-chart-4/5 p-3 text-sm"
                        >
                          <span className="text-chart-4 mt-0.5 shrink-0">✗</span>
                          <span className="flex-1 leading-relaxed">{c.text}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={() => removeCriterion(c.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search Strategy */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Stratégie de recherche</CardTitle>
                  <CardDescription>
                    Bases de données, mots-clés et période de publication
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {/* Databases */}
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-medium">Bases de données sélectionnées</Label>
                <div className="flex flex-wrap gap-2">
                  {DATABASES_OPTIONS.map((db) => (
                    <Badge
                      key={db}
                      variant={selectedDatabases.includes(db) ? "default" : "outline"}
                      className="cursor-pointer text-xs transition-all hover:opacity-80"
                      onClick={() => toggleDatabase(db)}
                    >
                      {selectedDatabases.includes(db) && "✓ "}
                      {db}
                    </Badge>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {selectedDatabases.length} base(s) sélectionnée(s) — cliquez pour basculer
                </p>
              </div>

              <Separator />

              {/* Keywords */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Mots-clés de recherche</Label>
                  <Dialog open={addKeywordOpen} onOpenChange={setAddKeywordOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="text-xs h-7">
                        <Plus className="h-3 w-3 mr-1" />
                        Mot-clé
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="text-base">Ajouter un mot-clé</DialogTitle>
                        <DialogDescription>Entrez un mot-clé ou une expression de recherche</DialogDescription>
                      </DialogHeader>
                      <Input
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        placeholder="ex : blended learning"
                        onKeyDown={(e) => e.key === "Enter" && handleAddKeyword()}
                      />
                      <DialogFooter>
                        <Button onClick={handleAddKeyword} disabled={!newKeyword.trim()}>
                          Ajouter
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex flex-wrap gap-2">
                  {keywords.split(";").map((kw, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {kw.trim()}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Date range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium">Date de début</Label>
                  <Input
                    type="number"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    placeholder="2018"
                    className="text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium">Date de fin</Label>
                  <Input
                    type="number"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    placeholder="2024"
                    className="text-sm"
                  />
                </div>
              </div>

              <Separator />

              {/* AI Assistant */}
              <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold">Assistant IA — Protocole</span>
                </div>
                <Textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ex : Aidez-moi à affiner ma stratégie de recherche pour une revue systématique sur l'IA dans l'enseignement..."
                  rows={3}
                  className="text-sm"
                />
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleAiAssist}
                    disabled={aiLoading || !aiPrompt.trim()}
                  >
                    {aiLoading ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    Générer
                  </Button>
                  {aiResult && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(aiResult);
                        toast.success("Copié dans le presse-papiers");
                      }}
                    >
                      Copier
                    </Button>
                  )}
                </div>
                {aiResult && (
                  <div className="rounded-md border bg-background p-3 mt-2 max-h-48 overflow-y-auto">
                    <p className="text-xs whitespace-pre-wrap leading-relaxed">{aiResult}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════
           Tab 3 — Article Screening
           ═══════════════════════════════════════ */}
        <TabsContent value="screening" className="flex flex-col gap-6">
          {/* Summary badges */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Card className="p-4">
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-bold">{totalCount}</span>
                <span className="text-[10px] text-muted-foreground">Total</span>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-bold text-chart-2">{includeCount}</span>
                <span className="text-[10px] text-muted-foreground">Inclus</span>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-bold text-chart-4">{excludeCount}</span>
                <span className="text-[10px] text-muted-foreground">Exclus</span>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-bold text-chart-5">{maybeCount}</span>
                <span className="text-[10px] text-muted-foreground">Peut-être</span>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex flex-col items-center gap-1">
                <Progress
                  value={totalCount > 0 ? (includeCount / totalCount) * 100 : 0}
                  className="h-2 w-full"
                />
                <span className="text-[10px] text-muted-foreground">
                  {totalCount > 0 ? Math.round((includeCount / totalCount) * 100) : 0}% inclus
                </span>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher par titre ou auteur..."
                    className="pl-9 text-sm"
                  />
                </div>
                <Select value={articleFilter ?? undefined} onValueChange={(v) => setArticleFilter(v as typeof articleFilter)}>
                  <SelectTrigger className="w-full sm:w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="include">Inclus</SelectItem>
                    <SelectItem value="exclude">Exclus</SelectItem>
                    <SelectItem value="maybe">Peut-être</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Articles table */}
          <Card>
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10 text-xs">Décision</TableHead>
                      <TableHead className="text-xs min-w-[250px]">Article</TableHead>
                      <TableHead className="text-xs w-24">Année</TableHead>
                      <TableHead className="text-xs w-32">Source</TableHead>
                      <TableHead className="text-xs w-24">Étape</TableHead>
                      <TableHead className="text-xs min-w-[200px]">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredArticles.map((article) => (
                      <TableRow key={article.id}>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`h-7 w-7 p-0 ${
                                article.decision === "include"
                                  ? "text-chart-2 bg-chart-2/10"
                                  : "text-muted-foreground"
                              }`}
                              title="Inclure"
                              onClick={() =>
                                updateArticleDecision(
                                  article.id,
                                  article.decision === "include" ? null : "include"
                                )
                              }
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`h-7 w-7 p-0 ${
                                article.decision === "exclude"
                                  ? "text-chart-4 bg-chart-4/10"
                                  : "text-muted-foreground"
                              }`}
                              title="Exclure"
                              onClick={() =>
                                updateArticleDecision(
                                  article.id,
                                  article.decision === "exclude" ? null : "exclude"
                                )
                              }
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`h-7 w-7 p-0 ${
                                article.decision === "maybe"
                                  ? "text-chart-5 bg-chart-5/10"
                                  : "text-muted-foreground"
                              }`}
                              title="Peut-être"
                              onClick={() =>
                                updateArticleDecision(
                                  article.id,
                                  article.decision === "maybe" ? null : "maybe"
                                )
                              }
                            >
                              <HelpCircle className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-medium leading-relaxed line-clamp-2">
                              {article.title}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {article.authors}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{article.year}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {article.source}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`text-[10px] ${
                              article.stage === "included"
                                ? "bg-chart-2/10 text-chart-2"
                                : article.stage === "eligibility"
                                  ? "bg-chart-5/10 text-chart-5"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {article.stage === "included"
                              ? "Inclus"
                              : article.stage === "eligibility"
                                ? "Admissible"
                                : article.stage === "screening"
                                  ? "Dépistage"
                                  : "Identification"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Input
                            value={article.notes}
                            onChange={(e) => updateArticleNotes(article.id, e.target.value)}
                            placeholder="Ajouter une note..."
                            className="text-xs h-8"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredArticles.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Filter className="h-6 w-6" />
                            <span className="text-xs">Aucun article ne correspond aux filtres</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════
           Tab 4 — Data Extraction Template
           ═══════════════════════════════════════ */}
        <TabsContent value="extraction" className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Template d'extraction des données</CardTitle>
                  <CardDescription>
                    Champs prédéfinis pour l'extraction systématique des données des études incluses
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {EXTRACTION_FIELDS.length} champs
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {/* Article selector */}
              <div className="flex flex-col sm:flex-row gap-3 items-start">
                <Label className="text-xs font-medium shrink-0 pt-2">Article :</Label>
                <Select value={selectedExtractionArticle} onValueChange={setSelectedExtractionArticle}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {articles
                      .filter((a) => a.decision === "include")
                      .map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.title.length > 60 ? a.title.slice(0, 60) + "..." : a.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Extraction fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {EXTRACTION_FIELDS.map((field) => (
                  <div key={field.id} className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs font-medium">{field.label}</Label>
                      <span className="text-[10px] text-muted-foreground">
                        ex : {field.example}
                      </span>
                    </div>
                    {field.label === "Principaux résultats" ||
                    field.label === "Limites identifiées" ||
                    field.label === "Implications pratiques" ? (
                      <Textarea
                        value={extractionData[`${selectedExtractionArticle}-${field.id}`] || ""}
                        onChange={(e) =>
                          setExtractionData((prev) => ({
                            ...prev,
                            [`${selectedExtractionArticle}-${field.id}`]: e.target.value,
                          }))
                        }
                        placeholder={field.example}
                        rows={3}
                        className="text-xs"
                      />
                    ) : (
                      <Input
                        value={extractionData[`${selectedExtractionArticle}-${field.id}`] || ""}
                        onChange={(e) =>
                          setExtractionData((prev) => ({
                            ...prev,
                            [`${selectedExtractionArticle}-${field.id}`]: e.target.value,
                          }))
                        }
                        placeholder={field.example}
                        className="text-xs"
                      />
                    )}
                  </div>
                ))}
              </div>

              <Separator />

              {/* Export */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const data = EXTRACTION_FIELDS.map((f) => ({
                      Champ: f.label,
                      Valeur: extractionData[`${selectedExtractionArticle}-${f.id}`] || "",
                    }));
                    const csv = [
                      Object.keys(data[0]).join(","),
                      ...data.map((row) => Object.values(row).map((v) => `"${v}"`).join(",")),
                    ].join("\n");
                    const blob = new Blob([csv], { type: "text/csv" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `extraction-${selectedExtractionArticle}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                    toast.success("Export CSV téléchargé");
                  }}
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Exporter en CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const filledCount = EXTRACTION_FIELDS.filter(
                      (f) => extractionData[`${selectedExtractionArticle}-${f.id}`]
                    ).length;
                    toast.info(`${filledCount} / ${EXTRACTION_FIELDS.length} champs remplis`);
                  }}
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                  Progression
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════
           Tab 5 — Quality Assessment
           ═══════════════════════════════════════ */}
        <TabsContent value="quality" className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Évaluation de la qualité</CardTitle>
                  <CardDescription>
                    Grille d'évaluation basée sur les standards CASP et JBI
                  </CardDescription>
                </div>
                <Select value={qualityFramework} onValueChange={(v) => setQualityFramework(v as "casp" | "jbi")}>
                  <SelectTrigger className="w-36 text-xs h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casp">CASP</SelectItem>
                    <SelectItem value="jbi">JBI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* Article selector */}
              <div className="flex flex-col sm:flex-row gap-3 items-start">
                <Label className="text-xs font-medium shrink-0 pt-2">Évaluer :</Label>
                <Select value={selectedExtractionArticle} onValueChange={setSelectedExtractionArticle}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {articles
                      .filter((a) => a.decision === "include")
                      .map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.title.length > 60 ? a.title.slice(0, 60) + "..." : a.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Progress */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Score de qualité — {qualityFramework.toUpperCase()}
                  </span>
                  <span className="font-medium">
                    {qualityChecked} / {qualityItems.length} — {qualityPercent}%
                  </span>
                </div>
                <Progress value={qualityPercent} className="h-2" />
              </div>

              <Separator />

              {/* Checklist */}
              <div className="flex flex-col gap-3">
                {qualityItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`rounded-lg border p-4 transition-colors ${
                      item.checked
                        ? "bg-chart-2/5 border-chart-2/20"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={item.checked}
                        onCheckedChange={() => toggleQualityItem(item.id)}
                        className="mt-0.5"
                      />
                      <div className="flex flex-col gap-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">
                            {idx + 1}. {item.text}
                          </span>
                          {item.checked && (
                            <Badge variant="secondary" className="text-[9px] h-4 bg-chart-2/10 text-chart-2">
                              OK
                            </Badge>
                          )}
                        </div>
                        <Input
                          value={item.note}
                          onChange={(e) => updateQualityNote(item.id, e.target.value)}
                          placeholder="Observations, justification..."
                          className="text-xs h-7"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════
           Tab 6 — Progress Tracking
           ═══════════════════════════════════════ */}
        <TabsContent value="progress" className="flex flex-col gap-6">
          {/* PRISMA Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Suivi du processus PRISMA</CardTitle>
              <CardDescription>
                Vue d'ensemble de la progression de la revue systématique à chaque étape
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {/* Stage progress bars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {prismaStages.map((stage, idx) => {
                  const prevCount = idx > 0 ? prismaStages[idx - 1].count : stage.count;
                  const ratio = prevCount > 0 ? (stage.count / prevCount) * 100 : 100;
                  return (
                    <div key={stage.id} className="flex flex-col gap-2 rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">{stage.label}</span>
                        <Badge variant="secondary" className="text-[10px]">
                          {stage.count}
                        </Badge>
                      </div>
                      <Progress value={ratio} className="h-2" />
                      <p className="text-[10px] text-muted-foreground">
                        {stage.count} article(s) — {Math.round(ratio)}% conservé(s)
                      </p>
                      {stage.subStages && (
                        <div className="flex flex-col gap-1 mt-1">
                          {stage.subStages.map((sub) => (
                            <div key={sub.id} className="flex items-center justify-between text-[10px] text-muted-foreground">
                              <span>{sub.label}</span>
                              <span className="font-medium">{sub.count}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <Separator />

              {/* Screening breakdown */}
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-semibold">Répartition du criblage</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col items-center gap-2 rounded-lg border border-chart-2/20 bg-chart-2/5 p-4">
                    <CheckCircle2 className="h-6 w-6 text-chart-2" />
                    <span className="text-2xl font-bold text-chart-2">{includeCount}</span>
                    <span className="text-xs text-muted-foreground">Inclus</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 rounded-lg border border-chart-4/20 bg-chart-4/5 p-4">
                    <X className="h-6 w-6 text-chart-4" />
                    <span className="text-2xl font-bold text-chart-4">{excludeCount}</span>
                    <span className="text-xs text-muted-foreground">Exclus</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 rounded-lg border border-chart-5/20 bg-chart-5/5 p-4">
                    <HelpCircle className="h-6 w-6 text-chart-5" />
                    <span className="text-2xl font-bold text-chart-5">{maybeCount}</span>
                    <span className="text-xs text-muted-foreground">En attente</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Quality assessment progress */}
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-semibold">Évaluation de la qualité</h3>
                <div className="flex flex-col gap-3 rounded-lg border p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Grille {qualityFramework.toUpperCase()} — article sélectionné
                    </span>
                    <span className="font-medium">
                      {qualityChecked} / {qualityItems.length}
                    </span>
                  </div>
                  <Progress value={qualityPercent} className="h-3" />
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {qualityItems.map((item) => (
                      <div
                        key={item.id}
                        className={`h-2 w-2 rounded-full ${
                          item.checked ? "bg-chart-2" : "bg-muted-foreground/20"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-center text-muted-foreground">
                    {qualityPercent >= 80
                      ? "Excellente couverture de l'évaluation"
                      : qualityPercent >= 50
                        ? "Évaluation en cours"
                        : "Évaluation à compléter"}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Overall funnel visualization */}
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-semibold">Entonnoir de sélection</h3>
                <div className="flex flex-col items-center gap-1 py-4">
                  {prismaStages.map((stage, idx) => {
                    const maxWidth = 100;
                    const minWidth = 25;
                    const firstCount = prismaStages[0].count || 1;
                    const widthPercent = minWidth + ((stage.count / firstCount) * (maxWidth - minWidth));
                    return (
                      <div key={stage.id} className="flex flex-col items-center gap-1">
                        <div
                          className="flex items-center justify-center rounded-md bg-primary/10 border border-primary/20 transition-all"
                          style={{ width: `${widthPercent}%`, minHeight: "48px" }}
                        >
                          <div className="flex flex-col items-center py-2">
                            <span className="text-sm font-bold">{stage.count}</span>
                            <span className="text-[10px] text-muted-foreground">{stage.label}</span>
                          </div>
                        </div>
                        {idx < prismaStages.length - 1 && (
                          <ArrowDown className="h-4 w-4 text-muted-foreground my-0.5" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Criteria summary */}
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-semibold">Résumé du protocole</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-1 rounded-lg border p-3">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Cadre
                    </span>
                    <span className="text-sm font-medium">PICOS</span>
                    <span className="text-[10px] text-muted-foreground">
                      {picoFields.filter((f) => f.value.trim()).length}/5 champs remplis
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 rounded-lg border p-3">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Critères
                    </span>
                    <span className="text-sm font-medium">{criteria.length} critères</span>
                    <span className="text-[10px] text-muted-foreground">
                      {criteria.filter((c) => c.type === "inclusion").length} inclusion,{" "}
                      {criteria.filter((c) => c.type === "exclusion").length} exclusion
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 rounded-lg border p-3">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Bases de données
                    </span>
                    <span className="text-sm font-medium">{selectedDatabases.length} bases</span>
                    <span className="text-[10px] text-muted-foreground">
                      Période {dateFrom}–{dateTo}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 rounded-lg border p-3">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Extraction
                    </span>
                    <span className="text-sm font-medium">{EXTRACTION_FIELDS.length} champs</span>
                    <span className="text-[10px] text-muted-foreground">
                      Template standardisé
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
