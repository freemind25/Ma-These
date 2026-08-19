"use client";

import { useState, useMemo, useCallback } from "react";
import {
  ShieldCheck,
  Brain,
  Link2,
  BarChart3,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  ArrowRight,
  Download,
  RefreshCcw,
  Lightbulb,
  Target,
  BookOpen,
  Database,
  Cog,
  Scale,
  MessageSquare,
  Star,
  TrendingUp,
  AlertOctagon,
  ChevronDown,
  ChevronUp,
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
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAiConfig } from "@/hooks/use-ai-config";

/* ═══════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════ */

interface AuditSection {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  items: AuditItem[];
}

interface AuditItem {
  id: string;
  label: string;
  weight: number; // 1-3 for importance weighting
  helpText: string;
}

interface AuditStatus {
  [itemId: string]: "valid" | "partial" | "invalid" | "na";
}

interface AiResult {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  risks: string[];
  overallScore: number;
}

interface ConsistencyEntry {
  id: string;
  label: string;
  value: string;
}

/* ═══════════════════════════════════════════════════════════════
   Data — Audit Checklist Sections
   ═══════════════════════════════════════════════════════════════ */

const AUDIT_SECTIONS: AuditSection[] = [
  {
    id: "research-question",
    title: "Clarté de la question de recherche",
    icon: Target,
    description: "Évalue la précision et la pertinence de la question de recherche.",
    items: [
      {
        id: "rq-1",
        label: "La question de recherche est formulée de manière claire et concise",
        weight: 3,
        helpText: "La question doit être compréhensible en une seule lecture, sans ambiguïté.",
      },
      {
        id: "rq-2",
        label: "La question est centrée sur un objet d'étude bien délimité",
        weight: 3,
        helpText: "Le périmètre de la recherche doit être circonscrit (contexte, population, phénomène).",
      },
      {
        id: "rq-3",
        label: "Les hypothèses de recherche sont explicitées et testables",
        weight: 2,
        helpText: "Chaque hypothèse doit pouvoir être confirmée ou infirmée par la méthode choisie.",
      },
      {
        id: "rq-4",
        label: "La pertinence scientifique et sociale est justifiée",
        weight: 2,
        helpText: "Expliquer pourquoi cette question mérite d'être étudiée (lacune, innovation, impact).",
      },
    ],
  },
  {
    id: "literature-review",
    title: "Exhaustivité de la revue de littérature",
    icon: BookOpen,
    description: "Vérifie la couverture et la qualité de l'état de l'art.",
    items: [
      {
        id: "lr-1",
        label: "Les principales sources pertinentes sont identifiées et citées",
        weight: 3,
        helpText: "Articles fondateurs, travaux récents, méta-analyses doivent être inclus.",
      },
      {
        id: "lr-2",
        label: "La revue couvre les différentes perspectives théoriques",
        weight: 2,
        helpText: "Présenter les approches complémentaires et contradictoires sur le sujet.",
      },
      {
        id: "lr-3",
        label: "Les lacunes dans la littérature sont clairement identifiées",
        weight: 3,
        helpText: "Positionner la recherche par rapport aux manquements existants.",
      },
      {
        id: "lr-4",
        label: "La revue est structurée thématiquement (non chronologique uniquement)",
        weight: 2,
        helpText: "Organiser par concepts et débats plutôt que par date de publication.",
      },
    ],
  },
  {
    id: "theoretical-framework",
    title: "Adekquation du cadre théorique",
    icon: Lightbulb,
    description: "Analyse la solidité et la pertinence du cadre conceptuel.",
    items: [
      {
        id: "tf-1",
        label: "Les concepts clés sont clairement définis et opérationnalisés",
        weight: 3,
        helpText: "Chaque concept théorique doit avoir une définition opérationnelle mesurable.",
      },
      {
        id: "tf-2",
        label: "Le cadre théorique est cohérent avec la question de recherche",
        weight: 3,
        helpText: "La théorie choisie doit permettre de répondre directement à la problématique.",
      },
      {
        id: "tf-3",
        label: "Les relations entre concepts sont explicitées",
        weight: 2,
        helpText: "Montrer comment les concepts s'articulent (causalité, corrélation, médiation).",
      },
      {
        id: "tf-4",
        label: "Le modèle conceptuel est illustré (schéma, diagramme)",
        weight: 1,
        helpText: "Un schéma visuel aide à communiquer la structure théorique du travail.",
      },
    ],
  },
  {
    id: "data-collection",
    title: "Pertinence des méthodes de collecte",
    icon: Database,
    description: "Évalue l'adéquation des outils et techniques de collecte de données.",
    items: [
      {
        id: "dc-1",
        label: "La méthode de collecte est justifiée par rapport à l'objectif",
        weight: 3,
        helpText: "Expliquer pourquoi cette méthode est la plus adaptée au type de données recherchées.",
      },
      {
        id: "dc-2",
        label: "L'échantillon est défini avec des critères d'inclusion/exclusion",
        weight: 3,
        helpText: "La taille, la méthode d'échantillonnage et les critères de sélection doivent être précisés.",
      },
      {
        id: "dc-3",
        label: "Les instruments de collecte sont décrits et validés",
        weight: 2,
        helpText: "Questionnaires, grilles d'observation, guides d'entretien avec preuve de validation.",
      },
      {
        id: "dc-4",
        label: "Les procédures de collecte sont reproductibles",
        weight: 2,
        helpText: "Un autre chercheur devrait pouvoir reproduire la collecte en suivant le protocole.",
      },
    ],
  },
  {
    id: "analysis-methods",
    title: "Validité des méthodes d'analyse",
    icon: Cog,
    description: "Vérifie la rigueur des procédures d'analyse des données.",
    items: [
      {
        id: "am-1",
        label: "La méthode d'analyse est cohérente avec le type de données",
        weight: 3,
        helpText: "Données qualitatives → analyse thématique ; quantitatives → statistiques inférentielles.",
      },
      {
        id: "am-2",
        label: "Les outils logiciels sont spécifiés",
        weight: 1,
        helpText: "NVivo, SPSS, R, Atlas.ti, etc. avec version si pertinent.",
      },
      {
        id: "am-3",
        label: "Les seuils de significativité et critères de validation sont définis",
        weight: 3,
        helpText: "Seuil alpha, saturation thématique, triangulation, accord inter-juges.",
      },
      {
        id: "am-4",
        label: "La démarche d'analyse est détaillée étape par étape",
        weight: 2,
        helpText: "Chaque étape du traitement des données doit être décrite de façon explicite.",
      },
    ],
  },
  {
    id: "ethical-considerations",
    title: "Considérations éthiques",
    icon: Scale,
    description: "Examine la prise en compte des enjeux éthiques de la recherche.",
    items: [
      {
        id: "ec-1",
        label: "Le consentement éclairé des participants est prévu",
        weight: 3,
        helpText: "Formulaire de consentement avec information claire sur la recherche.",
      },
      {
        id: "ec-2",
        label: "L'anonymat et la confidentialité des données sont garantis",
        weight: 3,
        helpText: "Procédures de pseudonymisation, stockage sécurisé, durée de conservation.",
      },
      {
        id: "ec-3",
        label: "L'approbation d'un comité d'éthique est obtenue ou en cours",
        weight: 2,
        helpText: "Numéro d'approbation CERES ou équivalent institutionnel.",
      },
      {
        id: "ec-4",
        label: "Les conflits d'intérêts potentiels sont déclarés",
        weight: 1,
        helpText: "Liens financiers, institutionnels ou personnels pouvant influencer la recherche.",
      },
    ],
  },
  {
    id: "result-interpretation",
    title: "Rigueur de l'interprétation des résultats",
    icon: MessageSquare,
    description: "Analyse la qualité de la discussion et de l'interprétation.",
    items: [
      {
        id: "ri-1",
        label: "Les résultats sont présentés avec les données justificatives",
        weight: 3,
        helpText: "Chaque affirmation doit être étayée par des données (tableaux, citations, extraits).",
      },
      {
        id: "ri-2",
        label: "Les résultats sont mis en perspective avec la littérature",
        weight: 3,
        helpText: "Comparer avec les études antérieures : convergence, divergence, nuances.",
      },
      {
        id: "ri-3",
        label: "Les limites de l'étude sont honnêtement discutées",
        weight: 2,
        helpText: "Biais potentiels, limitations de l'échantillon, contraintes méthodologiques.",
      },
      {
        id: "ri-4",
        label: "Les résultats répondent explicitement à la question de recherche",
        weight: 3,
        helpText: "Faire le lien direct entre les constats empiriques et la problématique initiale.",
      },
    ],
  },
  {
    id: "contribution",
    title: "Contribution à la connaissance",
    icon: Star,
    description: "Évalue l'originalité et l'impact potentiel de la recherche.",
    items: [
      {
        id: "ck-1",
        label: "L'apport théorique est clairement articulé",
        weight: 3,
        helpText: "En quoi la recherche enrichit-elle les théories existantes ?",
      },
      {
        id: "ck-2",
        label: "L'apport méthodologique est identifié (si applicable)",
        weight: 2,
        helpText: "Nouvel outil, nouvelle approche, innovation dans le protocole.",
      },
      {
        id: "ck-3",
        label: "Les implications pratiques sont discutées",
        weight: 2,
        helpText: "Applications possibles pour les professionnels, décideurs, praticiens.",
      },
      {
        id: "ck-4",
        label: "Les perspectives de recherche future sont proposées",
        weight: 1,
        helpText: "Pistes de prolongement naturelles de la recherche actuelle.",
      },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════
   Data — Consistency Check Fields
   ═══════════════════════════════════════════════════════════════ */

const CONSISTENCY_FIELDS: ConsistencyEntry[] = [
  { id: "cq", label: "Question de recherche", value: "" },
  { id: "para", label: "Paradigme épistémologique", value: "" },
  { id: "approach", label: "Approche (qualitative / quantitative / mixte)", value: "" },
  { id: "collect", label: "Méthode de collecte", value: "" },
  { id: "sample", label: "Type et taille d'échantillon", value: "" },
  { id: "analysis", label: "Méthode d'analyse", value: "" },
  { id: "framework", label: "Cadre théorique principal", value: "" },
];

/* ═══════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════ */

function scoreColor(score: number): string {
  if (score >= 80) return "text-chart-1";
  if (score >= 50) return "text-chart-3";
  return "text-chart-4";
}

function scoreBadge(score: number): { label: string; variant: "default" | "secondary" | "outline" | "destructive" } {
  if (score >= 80) return { label: "Excellent", variant: "default" };
  if (score >= 60) return { label: "Satisfaisant", variant: "secondary" };
  if (score >= 40) return { label: "À améliorer", variant: "outline" };
  return { label: "Critique", variant: "destructive" };
}

function statusIcon(status: "valid" | "partial" | "invalid" | "na") {
  switch (status) {
    case "valid":
      return <CheckCircle2 className="h-4 w-4 text-chart-1" />;
    case "partial":
      return <AlertTriangle className="h-4 w-4 text-chart-3" />;
    case "invalid":
      return <XCircle className="h-4 w-4 text-chart-4" />;
    case "na":
      return <span className="h-4 w-4 flex items-center justify-center text-xs text-muted-foreground">—</span>;
  }
}

/* ═══════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════ */

export function VerificationMethodoPage() {
  const { withAiConfig } = useAiConfig();
  /* ── State: Audit ── */
  const [auditStatus, setAuditStatus] = useState<AuditStatus>({});
  const [expandedSections, setExpandedSections] = useState<string[]>(["research-question"]);

  /* ── State: AI Verification ── */
  const [methodologyText, setMethodologyText] = useState("");
  const [aiResult, setAiResult] = useState<AiResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  /* ── State: Consistency ── */
  const [consistencyValues, setConsistencyValues] = useState<Record<string, string>>(
    () => Object.fromEntries(CONSISTENCY_FIELDS.map((f) => [f.id, ""]))
  );
  const [consistencyResult, setConsistencyResult] = useState<string | null>(null);
  const [consistencyLoading, setConsistencyLoading] = useState(false);

  /* ── State: Report ── */
  const [reportExpanded, setReportExpanded] = useState(true);

  /* ══════════════════════════════════════════════════════════
     Audit Logic
     ══════════════════════════════════════════════════════════ */

  const cycleStatus = useCallback((itemId: string) => {
    setAuditStatus((prev) => {
      const current = prev[itemId] || "na";
      const next = current === "na" ? "valid" : current === "valid" ? "partial" : current === "partial" ? "invalid" : "na";
      return { ...prev, [itemId]: next };
    });
  }, []);

  const sectionScores = useMemo(() => {
    return AUDIT_SECTIONS.map((section) => {
      const totalWeight = section.items.reduce((s, item) => s + item.weight, 0);
      let earned = 0;
      section.items.forEach((item) => {
        const status = auditStatus[item.id];
        if (status === "valid") earned += item.weight;
        else if (status === "partial") earned += item.weight * 0.5;
      });
      return {
        id: section.id,
        title: section.title,
        score: totalWeight > 0 ? Math.round((earned / totalWeight) * 100) : 0,
        assessed: section.items.some((item) => auditStatus[item.id] && auditStatus[item.id] !== "na"),
      };
    });
  }, [auditStatus]);

  const overallScore = useMemo(() => {
    const assessed = sectionScores.filter((s) => s.assessed);
    if (assessed.length === 0) return 0;
    return Math.round(assessed.reduce((s, sec) => s + sec.score, 0) / assessed.length);
  }, [sectionScores]);

  const assessedCount = useMemo(() => {
    let total = 0;
    let assessed = 0;
    AUDIT_SECTIONS.forEach((sec) => {
      sec.items.forEach((item) => {
        total++;
        if (auditStatus[item.id] && auditStatus[item.id] !== "na") assessed++;
      });
    });
    return { assessed, total };
  }, [auditStatus]);

  /* ══════════════════════════════════════════════════════════
     AI Verification Logic
     ══════════════════════════════════════════════════════════ */

  const runAiVerification = useCallback(async () => {
    if (!methodologyText.trim()) return;
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);

    try {
      const prompt = `Analysez la méthodologie de recherche suivante pour une thèse de doctorat.

TEXTE DE MÉTHODOLOGIE :
${methodologyText}

Fournissez votre analyse STRICTEMENT au format JSON suivant (pas de markdown, pas de blocs de code) :
{
  "strengths": ["force 1", "force 2", "force 3", "force 4"],
  "weaknesses": ["faiblesse 1", "faiblesse 2", "faiblesse 3"],
  "recommendations": ["recommandation 1", "recommandation 2", "recommandation 3"],
  "risks": ["risque 1", "risque 2"],
  "overallScore": 75
}

Évaluez sur 100. Identifiez les biais potentiels, les menaces à la validité interne et externe, et les problèmes de rigueur méthodologique.`;

      const res = await fetch("/api/ai-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(withAiConfig({
          mode: "methodology",
          prompt,
        })),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur lors de l'analyse IA");
      }

      const data = await res.json();
      const content = data.data?.content || "";

      // Try to parse JSON from the response
      let parsed: AiResult;
      try {
        // Try to extract JSON from possible markdown code blocks
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          parsed = JSON.parse(content);
        }
        // Ensure all fields exist
        parsed = {
          strengths: parsed.strengths || [],
          weaknesses: parsed.weaknesses || [],
          recommendations: parsed.recommendations || [],
          risks: parsed.risks || [],
          overallScore: Math.min(100, Math.max(0, parsed.overallScore || 0)),
        };
      } catch {
        // If parsing fails, create a result from the raw text
        parsed = {
          strengths: ["Réponse IA reçue (analyse en texte libre)"],
          weaknesses: [],
          recommendations: [],
          risks: [],
          overallScore: 50,
        };
      }

      setAiResult(parsed);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setAiLoading(false);
    }
  }, [methodologyText, withAiConfig]);

  /* ══════════════════════════════════════════════════════════
     Consistency Checker Logic
     ══════════════════════════════════════════════════════════ */

  const runConsistencyCheck = useCallback(async () => {
    const filled = CONSISTENCY_FIELDS.filter((f) => consistencyValues[f.id]?.trim());
    if (filled.length < 2) return;

    setConsistencyLoading(true);
    setConsistencyResult(null);

    try {
      const entriesText = filled
        .map((f) => `- ${f.label} : ${consistencyValues[f.id]}`)
        .join("\n");

      const prompt = `Vérifiez la cohérence méthodologique entre les éléments suivants d'un projet de thèse :

${entriesText}

Analysez spécifiquement :
1. L'alignement entre la question de recherche et le paradigme
2. La cohérence entre l'approche et la méthode de collecte
3. L'adéquation entre la méthode d'analyse et le type de données
4. La pertinence de l'échantillon par rapport à l'objectif
5. La cohérence globale du design méthodologique

Fournissez une analyse en français en 3-4 paragraphes concis. Identifiez les incohérences et suggérez des corrections si nécessaire.`;

      const res = await fetch("/api/ai-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(withAiConfig({
          mode: "methodology",
          prompt,
        })),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur lors de la vérification");
      }

      const data = await res.json();
      setConsistencyResult(data.data?.content || "Aucun résultat");
    } catch (err) {
      setConsistencyResult(
        `Erreur : ${err instanceof Error ? err.message : "Erreur inconnue"}`
      );
    } finally {
      setConsistencyLoading(false);
    }
  }, [consistencyValues, withAiConfig]);

  /* ══════════════════════════════════════════════════════════
     Report Generation Logic
     ══════════════════════════════════════════════════════════ */

  const generateReport = useCallback(() => {
    const lines: string[] = [];
    const now = new Date().toLocaleDateString("fr-FR", {
      dateStyle: "full",
    });

    lines.push("═══════════════════════════════════════════════");
    lines.push("  RAPPORT D'AUDIT MÉTHODOLOGIQUE — ThesisFrame");
    lines.push("═══════════════════════════════════════════════");
    lines.push(`Date : ${now}`);
    lines.push("");

    // Overall score
    lines.push("── SCORE GLOBAL ─────────────────────────────");
    const badge = scoreBadge(overallScore);
    lines.push(`Note : ${overallScore}/100 — ${badge.label}`);
    lines.push(`Sections évaluées : ${sectionScores.filter((s) => s.assessed).length}/${AUDIT_SECTIONS.length}`);
    lines.push(`Critères évalués : ${assessedCount.assessed}/${assessedCount.total}`);
    lines.push("");

    // Per-section scores
    lines.push("── SCORES PAR SECTION ────────────────────────");
    sectionScores.forEach((sec) => {
      const mark = sec.assessed ? `${sec.score}/100` : "Non évalué";
      lines.push(`  • ${sec.title} : ${mark}`);
    });
    lines.push("");

    // Detailed audit
    lines.push("── DÉTAIL DE L'AUDIT ──────────────────────────");
    AUDIT_SECTIONS.forEach((section) => {
      lines.push(`\n▶ ${section.title}`);
      lines.push(`  ${section.description}`);
      section.items.forEach((item) => {
        const status = auditStatus[item.id];
        const statusLabel =
          status === "valid"
            ? "✓ Conforme"
            : status === "partial"
              ? "◐ Partiellement"
              : status === "invalid"
                ? "✗ Non conforme"
                : "— Non évalué";
        lines.push(`  ${statusLabel} | ${item.label}`);
      });
    });

    // AI results
    if (aiResult) {
      lines.push("\n── ANALYSE IA ─────────────────────────────");
      lines.push(`Score IA : ${aiResult.overallScore}/100`);
      lines.push("\nForces identifiées :");
      aiResult.strengths.forEach((s) => lines.push(`  + ${s}`));
      lines.push("\nFaiblesses détectées :");
      aiResult.weaknesses.forEach((w) => lines.push(`  - ${w}`));
      lines.push("\nRecommandations :");
      aiResult.recommendations.forEach((r) => lines.push(`  → ${r}`));
      lines.push("\nRisques identifiés :");
      aiResult.risks.forEach((r) => lines.push(`  ⚠ ${r}`));
    }

    // Consistency
    if (consistencyResult) {
      lines.push("\n── VÉRIFICATION DE COHÉRENCE ────────────────");
      lines.push(consistencyResult);
    }

    lines.push("\n═══════════════════════════════════════════════");
    lines.push("  Rapport généré par ThesisFrame");
    lines.push("═══════════════════════════════════════════════");

    return lines.join("\n");
  }, [auditStatus, aiResult, consistencyResult, overallScore, sectionScores, assessedCount]);

  const downloadReport = useCallback(() => {
    const report = generateReport();
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-methodo-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [generateReport]);

  /* ═══════════════════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════════════════ */

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 p-6">
      {/* ─── Header ─── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          Vérification méthodologique
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Auditez, vérifiez et améliorez la rigueur méthodologique de votre thèse
          grâce à un contrôle complet et à l'analyse IA
        </p>
      </div>

      <Separator />

      {/* ─── Tabs ─── */}
      <Tabs defaultValue="audit" className="flex flex-col gap-6">
        <TabsList className="w-full flex flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="audit" className="flex items-center gap-2 text-xs sm:text-sm">
            <ShieldCheck className="h-4 w-4" />
            Audit
          </TabsTrigger>
          <TabsTrigger value="ai-verify" className="flex items-center gap-2 text-xs sm:text-sm">
            <Brain className="h-4 w-4" />
            Vérification IA
          </TabsTrigger>
          <TabsTrigger value="consistency" className="flex items-center gap-2 text-xs sm:text-sm">
            <Link2 className="h-4 w-4" />
            Cohérence
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2 text-xs sm:text-sm">
            <BarChart3 className="h-4 w-4" />
            Suivi
          </TabsTrigger>
          <TabsTrigger value="report" className="flex items-center gap-2 text-xs sm:text-sm">
            <FileText className="h-4 w-4" />
            Rapport
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════════════════════════════════════════
            TAB 1 : Audit méthodologique
            ═══════════════════════════════════════════════════ */}
        <TabsContent value="audit" className="flex flex-col gap-6">
          {/* Overall progress card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-base">Progression de l'audit</CardTitle>
                  <CardDescription>
                    Cliquez sur chaque critère pour changer son statut : ✓ → ◐ → ✗ → —
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={scoreBadge(overallScore).variant}>
                    {overallScore}/100 — {scoreBadge(overallScore).label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {assessedCount.assessed}/{assessedCount.total} critères
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={overallScore} className="h-3" />
              <div className="flex items-center gap-4 mt-4 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-chart-1" /> Conforme
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <AlertTriangle className="h-3.5 w-3.5 text-chart-3" /> Partiellement
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <XCircle className="h-3.5 w-3.5 text-chart-4" /> Non conforme
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="text-muted-foreground">—</span> Non évalué
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Per-section accordion */}
          <Accordion
            type="multiple"
            value={expandedSections}
            onValueChange={setExpandedSections}
            className="flex flex-col gap-3"
          >
            {AUDIT_SECTIONS.map((section) => {
              const SectionIcon = section.icon;
              const secScore = sectionScores.find((s) => s.id === section.id);
              const secBadge = secScore ? scoreBadge(secScore.score) : null;

              return (
                <AccordionItem
                  key={section.id}
                  value={section.id}
                  className="border rounded-lg px-4"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 flex-1 pr-4">
                      <SectionIcon className="h-4 w-4 text-primary shrink-0" />
                      <div className="flex flex-col items-start gap-1 flex-1 min-w-0">
                        <span className="text-sm font-semibold truncate">
                          {section.title}
                        </span>
                        <span className="text-xs text-muted-foreground hidden sm:block">
                          {section.description}
                        </span>
                      </div>
                      {secScore?.assessed && secBadge && (
                        <div className="flex items-center gap-2 shrink-0">
                          <Progress value={secScore.score} className="h-1.5 w-16" />
                          <Badge variant={secBadge.variant} className="text-[10px] shrink-0">
                            {secScore.score}%
                          </Badge>
                        </div>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-2 pt-2">
                      {section.items.map((item) => {
                        const status = auditStatus[item.id] || "na";
                        return (
                          <button
                            key={item.id}
                            onClick={() => cycleStatus(item.id)}
                            className={`
                              flex items-start gap-3 rounded-lg border p-3 text-left
                              transition-colors w-full cursor-pointer
                              ${status === "valid"
                                ? "bg-chart-1/5 border-chart-1/30"
                                : status === "partial"
                                  ? "bg-chart-3/5 border-chart-3/30"
                                  : status === "invalid"
                                    ? "bg-chart-4/5 border-chart-4/30"
                                    : "hover:bg-accent"
                              }
                            `}
                          >
                            <div className="mt-0.5 shrink-0">
                              {statusIcon(status)}
                            </div>
                            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm">{item.label}</span>
                                {item.weight >= 3 && (
                                  <Badge variant="outline" className="text-[10px] shrink-0">
                                    Critique
                                  </Badge>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {item.helpText}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════
            TAB 2 : Vérification IA
            ═══════════════════════════════════════════════════ */}
        <TabsContent value="ai-verify" className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Analyse IA de la méthodologie</CardTitle>
                  <CardDescription>
                    Collez votre texte méthodologique pour obtenir une analyse détaillée
                    des forces, faiblesses et risques
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Textarea
                placeholder="Collez ici le texte de votre méthodologie de recherche (question de recherche, cadre théorique, méthode de collecte, méthode d'analyse, considérations éthiques...)"
                value={methodologyText}
                onChange={(e) => setMethodologyText(e.target.value)}
                className="min-h-[200px] resize-y"
              />
              <div className="flex items-center gap-3">
                <Button
                  onClick={runAiVerification}
                  disabled={aiLoading || !methodologyText.trim()}
                  className="gap-2"
                >
                  {aiLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                  {aiLoading ? "Analyse en cours..." : "Lancer l'analyse IA"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setMethodologyText("");
                    setAiResult(null);
                    setAiError(null);
                  }}
                  className="gap-2"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Réinitialiser
                </Button>
                <span className="text-xs text-muted-foreground">
                  {methodologyText.length > 0 &&
                    `${methodologyText.length} caractères`}
                </span>
              </div>
            </CardContent>
          </Card>

          {aiError && (
            <Card className="border-chart-4/30 bg-chart-4/5">
              <CardContent className="flex items-start gap-3 pt-4">
                <AlertOctagon className="h-5 w-5 text-chart-4 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-chart-4">Erreur</p>
                  <p className="text-xs text-muted-foreground mt-1">{aiError}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {aiResult && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Overall AI Score */}
              <Card className="lg:col-span-2">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <TrendingUp className={`h-5 w-5 ${scoreColor(aiResult.overallScore)}`} />
                      <span className="text-sm font-medium">Score global IA</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress
                        value={aiResult.overallScore}
                        className="h-3 w-48"
                      />
                      <Badge variant={scoreBadge(aiResult.overallScore).variant}>
                        {aiResult.overallScore}/100
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Strengths */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-chart-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Forces identifiées ({aiResult.strengths.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="flex flex-col gap-2">
                    {aiResult.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-chart-1 font-bold shrink-0">+</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Weaknesses */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-chart-4">
                    <AlertTriangle className="h-4 w-4" />
                    Faiblesses détectées ({aiResult.weaknesses.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="flex flex-col gap-2">
                    {aiResult.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-chart-4 font-bold shrink-0">−</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-chart-2" />
                    Recommandations ({aiResult.recommendations.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="flex flex-col gap-2">
                    {aiResult.recommendations.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <ArrowRight className="h-3.5 w-3.5 text-chart-2 mt-0.5 shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Risks */}
              <Card className="border-chart-4/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-chart-4">
                    <AlertOctagon className="h-4 w-4" />
                    Risques identifiés ({aiResult.risks.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="flex flex-col gap-2">
                    {aiResult.risks.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-chart-4 font-bold shrink-0">⚠</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* ═══════════════════════════════════════════════════
            TAB 3 : Vérificateur de cohérence
            ═══════════════════════════════════════════════════ */}
        <TabsContent value="consistency" className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Link2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Vérificateur de cohérence</CardTitle>
                  <CardDescription>
                    Vérifiez que vos choix méthodologiques sont alignés entre eux
                    et cohérents avec votre paradigme de recherche
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CONSISTENCY_FIELDS.map((field) => (
                  <div key={field.id} className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">{field.label}</label>
                    <Textarea
                      placeholder={`Décrivez : ${field.label.toLowerCase()}`}
                      value={consistencyValues[field.id]}
                      onChange={(e) =>
                        setConsistencyValues((prev) => ({
                          ...prev,
                          [field.id]: e.target.value,
                        }))
                      }
                      className="min-h-[60px] resize-y text-sm"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={runConsistencyCheck}
                  disabled={consistencyLoading}
                  className="gap-2"
                >
                  {consistencyLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Link2 className="h-4 w-4" />
                  )}
                  {consistencyLoading
                    ? "Vérification en cours..."
                    : "Vérifier la cohérence"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const empty = Object.fromEntries(
                      CONSISTENCY_FIELDS.map((f) => [f.id, ""])
                    );
                    setConsistencyValues(empty);
                    setConsistencyResult(null);
                  }}
                  className="gap-2"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Réinitialiser
                </Button>
                <span className="text-xs text-muted-foreground">
                  Remplissez au moins 2 champs pour lancer la vérification
                </span>
              </div>
            </CardContent>
          </Card>

          {consistencyResult && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-primary" />
                  Résultat de la vérification de cohérence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line leading-relaxed">
                  {consistencyResult}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ═══════════════════════════════════════════════════
            TAB 4 : Suivi de progression
            ═══════════════════════════════════════════════════ */}
        <TabsContent value="progress" className="flex flex-col gap-6">
          {/* Overall score hero */}
          <Card>
            <CardContent className="pt-6 flex flex-col items-center gap-4 text-center">
              <div
                className={`flex h-24 w-24 items-center justify-center rounded-full border-4 ${overallScore >= 80 ? "border-chart-1 text-chart-1" : overallScore >= 50 ? "border-chart-3 text-chart-3" : "border-chart-4 text-chart-4"}`}
              >
                <span className="text-3xl font-bold">{overallScore}</span>
              </div>
              <div>
                <p className="text-lg font-semibold">Score méthodologique global</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Basé sur {sectionScores.filter((s) => s.assessed).length} section(s) évaluée(s)
                  — {assessedCount.assessed} critères sur {assessedCount.total}
                </p>
              </div>
              <Badge variant={scoreBadge(overallScore).variant} className="text-sm px-4 py-1">
                {scoreBadge(overallScore).label}
              </Badge>
            </CardContent>
          </Card>

          {/* Per-section progress bars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AUDIT_SECTIONS.map((section) => {
              const secScore = sectionScores.find((s) => s.id === section.id);
              const SectionIcon = section.icon;
              const barColor =
                secScore && secScore.score >= 80
                  ? "bg-chart-1"
                  : secScore && secScore.score >= 50
                    ? "bg-chart-3"
                    : "bg-chart-4";

              return (
                <Card key={section.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <SectionIcon className="h-4 w-4 text-primary" />
                        {section.title}
                      </CardTitle>
                      <Badge
                        variant={
                          secScore?.assessed
                            ? scoreBadge(secScore.score).variant
                            : "outline"
                        }
                        className="text-[10px]"
                      >
                        {secScore?.assessed ? `${secScore.score}%` : "—"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-1.5">
                      <div className="relative h-3 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${barColor}`}
                          style={{
                            width: secScore?.assessed ? `${secScore.score}%` : "0%",
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {section.items.filter(
                            (i) =>
                              auditStatus[i.id] &&
                              auditStatus[i.id] !== "na"
                          ).length}{" "}
                          / {section.items.length} critères
                        </span>
                        <span className={secScore?.assessed ? scoreColor(secScore.score) : ""}>
                          {secScore?.assessed
                            ? scoreBadge(secScore.score).label
                            : "En attente"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Summary statistics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Statistiques de l'audit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-chart-1/5 border border-chart-1/20">
                  <span className="text-2xl font-bold text-chart-1">
                    {Object.values(auditStatus).filter((s) => s === "valid").length}
                  </span>
                  <span className="text-xs text-muted-foreground">Conformes</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-chart-3/5 border border-chart-3/20">
                  <span className="text-2xl font-bold text-chart-3">
                    {Object.values(auditStatus).filter((s) => s === "partial").length}
                  </span>
                  <span className="text-xs text-muted-foreground">Partiels</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-chart-4/5 border border-chart-4/20">
                  <span className="text-2xl font-bold text-chart-4">
                    {Object.values(auditStatus).filter((s) => s === "invalid").length}
                  </span>
                  <span className="text-xs text-muted-foreground">Non conformes</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted border">
                  <span className="text-2xl font-bold">
                    {AUDIT_SECTIONS.reduce(
                      (t, s) => t + s.items.filter((i) => !auditStatus[i.id]).length,
                      0
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground">Non évalués</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════
            TAB 5 : Rapport d'audit
            ═══════════════════════════════════════════════════ */}
        <TabsContent value="report" className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Rapport d'audit méthodologique</CardTitle>
                    <CardDescription>
                      Générez et téléchargez un rapport complet de votre audit
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={downloadReport} className="gap-2">
                    <Download className="h-4 w-4" />
                    Télécharger le rapport
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setReportExpanded(!reportExpanded)}
                    className="gap-1"
                  >
                    {reportExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    Aperçu
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Report info cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="flex flex-col gap-0.5 p-3 rounded-lg bg-muted">
                  <span className="text-xs text-muted-foreground">Score global</span>
                  <span className={`text-lg font-bold ${scoreColor(overallScore)}`}>
                    {overallScore}/100
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 p-3 rounded-lg bg-muted">
                  <span className="text-xs text-muted-foreground">Sections évaluées</span>
                  <span className="text-lg font-bold">
                    {sectionScores.filter((s) => s.assessed).length}/{AUDIT_SECTIONS.length}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 p-3 rounded-lg bg-muted">
                  <span className="text-xs text-muted-foreground">Analyse IA</span>
                  <span className="text-lg font-bold">
                    {aiResult ? `${aiResult.overallScore}/100` : "Non effectuée"}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 p-3 rounded-lg bg-muted">
                  <span className="text-xs text-muted-foreground">Cohérence</span>
                  <span className="text-lg font-bold">
                    {consistencyResult ? "Vérifiée" : "Non vérifiée"}
                  </span>
                </div>
              </div>

              {/* Report preview */}
              {reportExpanded && (
                <div className="rounded-lg border bg-muted/30 p-4 max-h-[500px] overflow-y-auto">
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
                    {generateReport()}
                  </pre>
                </div>
              )}

              {!reportExpanded && (
                <div className="rounded-lg border bg-muted/30 p-8 flex flex-col items-center gap-2">
                  <FileText className="h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">
                    Cliquez sur &quot;Aperçu&quot; pour voir le rapport complet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
