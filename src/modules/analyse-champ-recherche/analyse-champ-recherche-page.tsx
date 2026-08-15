"use client";

import { useState, useCallback } from "react";
import {
  Compass,
  Network,
  MapPin,
  BookOpen,
  Sparkles,
  Copy,
  Check,
  Lightbulb,
  Brain,
  Target,
  Search,
  Layers,
  ArrowRight,
  RotateCcw,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { useAiConfig } from "@/hooks/use-ai-config";

/* ═══════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════ */

interface FormData {
  topic: string;
  discipline: string;
  keywords: string;
  questions: string;
}

interface AnalysisResult {
  overview: string;
  authors: string;
  gaps: string;
  directions: string;
}

interface KnowledgeNode {
  id: string;
  label: string;
  children?: KnowledgeNode[];
}

interface PositioningData {
  originality: string;
  theoreticalAnchoring: string;
  methodologicalApproach: string;
  expectedContribution: string;
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

export function AnalyseChampRecherchePage() {
  const { withAiConfig } = useAiConfig();
  // Form state
  const [form, setForm] = useState<FormData>({
    topic: "",
    discipline: "",
    keywords: "",
    questions: "",
  });

  // Analysis state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Knowledge map state
  const [knowledgeMap, setKnowledgeMap] = useState<KnowledgeNode[]>([]);
  const [newNodeLabel, setNewNodeLabel] = useState("");
  const [newChildLabel, setNewChildLabel] = useState("");

  // Positioning state
  const [positioning, setPositioning] = useState<PositioningData>({
    originality: "",
    theoreticalAnchoring: "",
    methodologicalApproach: "",
    expectedContribution: "",
  });
  const [isPositioningLoading, setIsPositioningLoading] = useState(false);

  // Literature landscape (derived from analysis)
  const [landscapeItems, setLandscapeItems] = useState<
    { title: string; description: string; type: string }[]
  >([]);

  const updateForm = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  /* ── AI Analysis ──────────────────────────────────────────── */

  const runAnalysis = useCallback(async () => {
    if (!form.topic.trim()) {
      toast({
        title: "Champ requis",
        description: "Veuillez saisir un sujet de recherche.",
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const contextParts = [];
      if (form.discipline) contextParts.push(`Discipline : ${form.discipline}`);
      if (form.keywords) contextParts.push(`Mots-clés : ${form.keywords}`);
      if (form.questions) contextParts.push(`Questions de recherche : ${form.questions}`);

      const prompt = `Analyse en profondeur le champ de recherche suivant :

Sujet : ${form.topic}
${contextParts.length > 0 ? `\nContexte additionnel :\n${contextParts.join("\n")}` : ""}

Fournis une analyse structurée avec les 4 sections suivantes, chacune clairement séparée par le marqueur ##SECTION## :

##SECTION## ÉTAT DE L'ART
Fais une synthèse de l'état de l'art sur ce sujet. Présente les grands courants, les débats majeurs et l'évolution chronologique du champ. 3-4 paragraphes.

##SECTION## AUTEURS ET THÉORIES
Identifie les auteurs fondateurs et contemporains les plus importants. Présente les théories clés du champ et leurs relations. 3-4 paragraphes.

##SECTION## LACUNES IDENTIFIÉES
Identifie les lacunes, contradictions et zones d'ombre dans la littérature existante. Quels aspects restent peu explorés ? 2-3 paragraphes.

##SECTION## PISTES DE RECHERCHE
Suggère des directions de recherche prometteuses, en lien avec les lacunes identifiées. Formule des questions de recherche potentielles. 2-3 paragraphes.`;

      const res = await fetch("/api/ai-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(withAiConfig({
          mode: "literature-review",
          prompt,
          context: `Analyse du champ de recherche pour une thèse. Sujet : ${form.topic}. Discipline : ${form.discipline || "non précisée"}.`,
        })),
      });

      if (!res.ok) throw new Error("Erreur lors de la génération");
      const json = await res.json();
      const content = json.data.content as string;

      // Parse the 4 sections from the response
      const sections = content.split("##SECTION##");
      const parsed: AnalysisResult = {
        overview: "",
        authors: "",
        gaps: "",
        directions: "",
      };

      const sectionTitles = [
        "ÉTAT DE L'ART",
        "AUTEURS ET THÉORIES",
        "LACUNES IDENTIFIÉES",
        "PISTES DE RECHERCHE",
      ];

      for (let i = 1; i < sections.length && i <= 4; i++) {
        let text = sections[i].trim();
        // Remove the section title from the beginning
        for (const title of sectionTitles) {
          if (text.startsWith(title)) {
            text = text.slice(title.length).trim();
            break;
          }
        }
        if (i === 1) parsed.overview = text;
        else if (i === 2) parsed.authors = text;
        else if (i === 3) parsed.gaps = text;
        else if (i === 4) parsed.directions = text;
      }

      setAnalysis(parsed);

      // Auto-generate knowledge map from authors section
      generateKnowledgeMap(parsed.authors);

      // Auto-generate landscape items from overview
      generateLandscape(parsed.overview);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de l'analyse"
      );
    } finally {
      setIsLoading(false);
    }
  }, [form, withAiConfig]);

  /* ── Knowledge Map ──────────────────────────────────────────── */

  const generateKnowledgeMap = (authorsText: string) => {
    // Extract key concepts from the AI text
    const lines = authorsText.split("\n").filter((l) => l.trim().length > 0);
    const concepts = lines
      .filter((l) => l.match(/^[•\-–—●]/) || l.match(/^\d+\./))
      .map((l) => l.replace(/^[•\-–—●\d.)\s]+/, "").trim())
      .filter((l) => l.length > 5 && l.length < 100);

    if (concepts.length === 0) {
      // Fallback: create nodes from paragraphs
      const paragraphs = authorsText
        .split(/\n\n/)
        .map((p) => p.trim())
        .filter((p) => p.length > 20);
      setKnowledgeMap(
        paragraphs.slice(0, 6).map((p, i) => ({
          id: `node-${i}`,
          label: p.length > 60 ? p.substring(0, 57) + "..." : p,
        }))
      );
      return;
    }

    // Group concepts into a tree structure
    const rootNodes: KnowledgeNode[] = [];
    const groupSize = Math.max(2, Math.ceil(concepts.length / 4));

    for (let i = 0; i < concepts.length; i += groupSize) {
      const group = concepts.slice(i, i + groupSize);
      rootNodes.push({
        id: `node-${i}`,
        label:
          group[0].length > 60
            ? group[0].substring(0, 57) + "..."
            : group[0],
        children: group.slice(1).map((c, j) => ({
          id: `node-${i}-${j}`,
          label: c.length > 50 ? c.substring(0, 47) + "..." : c,
        })),
      });
    }

    setKnowledgeMap(rootNodes);
  };

  const addRootNode = () => {
    if (!newNodeLabel.trim()) return;
    setKnowledgeMap((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        label: newNodeLabel.trim(),
        children: [],
      },
    ]);
    setNewNodeLabel("");
  };

  const addChildNode = (parentId: string) => {
    if (!newChildLabel.trim()) return;
    setKnowledgeMap((prev) =>
      prev.map((node) =>
        node.id === parentId
          ? {
              ...node,
              children: [
                ...(node.children || []),
                {
                  id: `child-${Date.now()}`,
                  label: newChildLabel.trim(),
                },
              ],
            }
          : node
      )
    );
    setNewChildLabel("");
  };

  const removeNode = (nodeId: string) => {
    setKnowledgeMap((prev) => prev.filter((n) => n.id !== nodeId));
  };

  const removeChildNode = (parentId: string, childId: string) => {
    setKnowledgeMap((prev) =>
      prev.map((node) =>
        node.id === parentId
          ? {
              ...node,
              children: (node.children || []).filter((c) => c.id !== childId),
            }
          : node
      )
    );
  };

  /* ── Literature Landscape ──────────────────────────────────────── */

  const generateLandscape = (overviewText: string) => {
    const paragraphs = overviewText
      .split(/\n\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 30);

    const types = ["Courant", "Thématique", "Débat", "Perspective", "Approche"];

    const items = paragraphs.slice(0, 6).map((p, i) => {
      const firstSentence = p.split(".")[0] + ".";
      return {
        title:
          firstSentence.length > 60
            ? firstSentence.substring(0, 57) + "..."
            : firstSentence,
        description:
          p.length > 200 ? p.substring(0, 197) + "..." : p,
        type: types[i % types.length],
      };
    });

    setLandscapeItems(items);
  };

  /* ── Research Positioning AI ────────────────────────────────────── */

  const generatePositioning = useCallback(async () => {
    if (!form.topic.trim()) {
      toast({
        title: "Analyse requise",
        description: "Lancez d'abord l'analyse du champ de recherche.",
      });
      return;
    }

    setIsPositioningLoading(true);
    try {
      const res = await fetch("/api/ai-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(withAiConfig({
          mode: "theory",
          prompt: `Aide un doctorant à articuler son positionnement de recherche dans le champ suivant :

Sujet : ${form.topic}
Discipline : ${form.discipline || "non précisée"}
Mots-clés : ${form.keywords || "non précisés"}
Questions de recherche : ${form.questions || "non précisées"}

${analysis ? `Analyse préalable du champ :\n- Lacunes : ${analysis.gaps}\n- Pistes : ${analysis.directions}` : ""}

Génère 4 paragraphes structurés, chacun séparé par ##SECTION## :

##SECTION## ORIGINALITÉ
Aide à formuler ce qui rend ce travail original par rapport à l'existant. 1 paragraphe.

##SECTION## ANCRAGE THÉORIQUE
Suggère un cadre théorique pertinent pour ancrer cette recherche. 1 paragraphe.

##SECTION## APPROCHE MÉTHODOLOGIQUE
Propose une approche méthodologique adaptée au sujet et aux lacunes identifiées. 1 paragraphe.

##SECTION## CONTRIBUTION ATTENDUE
Aide à formuler la contribution scientifique attendue de cette thèse. 1 paragraphe.`,
          context: `Positionnement de recherche doctoral. Sujet : ${form.topic}`,
        })),
      });

      if (!res.ok) throw new Error("Erreur lors de la génération");
      const json = await res.json();
      const content = json.data.content as string;

      const sections = content.split("##SECTION##");
      const parsed: PositioningData = {
        originality: "",
        theoreticalAnchoring: "",
        methodologicalApproach: "",
        expectedContribution: "",
      };

      const titles = [
        "ORIGINALITÉ",
        "ANCRAGE THÉORIQUE",
        "APPROCHE MÉTHODOLOGIQUE",
        "CONTRIBUTION ATTENDUE",
      ];

      for (let i = 1; i < sections.length && i <= 4; i++) {
        let text = sections[i].trim();
        for (const title of titles) {
          if (text.startsWith(title)) {
            text = text.slice(title.length).trim();
            break;
          }
        }
        if (i === 1) parsed.originality = text;
        else if (i === 2) parsed.theoreticalAnchoring = text;
        else if (i === 3) parsed.methodologicalApproach = text;
        else if (i === 4) parsed.expectedContribution = text;
      }

      setPositioning(parsed);
      toast({
        title: "Positionnement généré",
        description: "Le positionnement de recherche a été généré avec succès.",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de générer le positionnement. Réessayez.",
      });
    } finally {
      setIsPositioningLoading(false);
    }
  }, [form, analysis, withAiConfig]);

  /* ── Export ──────────────────────────────────────────────── */

  const exportReport = useCallback(async () => {
    if (!analysis) {
      toast({
        title: "Rien à exporter",
        description: "Lancez d'abord une analyse du champ de recherche.",
      });
      return;
    }

    const mapText = knowledgeMap
      .map((node) => {
        const children = (node.children || [])
          .map((c) => `    └── ${c.label}`)
          .join("\n");
        return `├── ${node.label}${children ? `\n${children}` : ""}`;
      })
      .join("\n");

    const landscapeText = landscapeItems
      .map((item) => `- [${item.type}] ${item.title}\n  ${item.description}`)
      .join("\n\n");

    const positioningText = positioning.originality
      ? `### Positionnement de recherche

**Originalité :**
${positioning.originality}

**Ancrage théorique :**
${positioning.theoreticalAnchoring}

**Approche méthodologique :**
${positioning.methodologicalApproach}

**Contribution attendue :**
${positioning.expectedContribution}`
      : "";

    const report = `# Analyse du champ de recherche

**Sujet :** ${form.topic}
**Discipline :** ${form.discipline || "Non précisée"}
**Mots-clés :** ${form.keywords || "Non précisés"}
**Questions de recherche :** ${form.questions || "Non précisées"}

---

## État de l'art

${analysis.overview}

## Auteurs et théories clés

${analysis.authors}

## Lacunes identifiées

${analysis.gaps}

## Pistes de recherche

${analysis.directions}

---

## Carte des connaissances

${form.topic}
${mapText}

---

## Paysage littéraire

${landscapeText}

${positioningText ? `\n---\n\n${positioningText}` : ""}

---
*Généré par ThesisFrame — Analyse du champ de recherche*`;

    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      toast({
        title: "Rapport copié",
        description: "Le rapport d'analyse a été copié dans le presse-papiers.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de copier dans le presse-papiers.",
      });
    }
  }, [analysis, form, knowledgeMap, landscapeItems, positioning]);

  const resetForm = () => {
    setForm({ topic: "", discipline: "", keywords: "", questions: "" });
    setAnalysis(null);
    setKnowledgeMap([]);
    setLandscapeItems([]);
    setPositioning({
      originality: "",
      theoreticalAnchoring: "",
      methodologicalApproach: "",
      expectedContribution: "",
    });
    setError(null);
  };

  /* ═══════════════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════════════ */

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 p-6">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-chart-3/10">
          <Compass className="h-5 w-5 text-chart-3" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Analyse du champ de recherche
          </h1>
          <p className="text-sm text-muted-foreground">
            Cartographiez votre champ, identifiez les lacunes et positionnez
            votre recherche grâce à l&apos;IA
          </p>
        </div>
      </div>

      {/* ── Form Card ────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4 text-chart-3" />
            Définition du champ de recherche
          </CardTitle>
          <CardDescription>
            Décrivez votre sujet pour lancer l&apos;analyse approfondie du champ
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="topic">Sujet de recherche *</Label>
              <Input
                id="topic"
                placeholder="Ex : L'impact de l'IA générative sur l'enseignement supérieur"
                value={form.topic}
                onChange={(e) => updateForm("topic", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="discipline">Discipline</Label>
              <Input
                id="discipline"
                placeholder="Ex : Sciences de l'éducation, Sociologie..."
                value={form.discipline}
                onChange={(e) => updateForm("discipline", e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="keywords">
              Mots-clés{" "}
              <span className="text-muted-foreground font-normal">
                (séparés par des virgules)
              </span>
            </Label>
            <Input
              id="keywords"
              placeholder="Ex : intelligence artificielle, apprentissage, pédagogie"
              value={form.keywords}
              onChange={(e) => updateForm("keywords", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="questions">Questions de recherche</Label>
            <Textarea
              id="questions"
              placeholder="Formulez vos questions de recherche, une par ligne..."
              value={form.questions}
              onChange={(e) => updateForm("questions", e.target.value)}
              rows={3}
            />
          </div>
          <Separator />
          <div className="flex items-center gap-3 justify-end">
            <Button variant="outline" size="sm" onClick={resetForm} className="gap-2">
              <RotateCcw className="h-3.5 w-3.5" />
              Réinitialiser
            </Button>
            <Button
              onClick={runAnalysis}
              disabled={isLoading || !form.topic.trim()}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Lancer l&apos;analyse
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Error ────────────────────────────────────────────── */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* ── Loading Skeleton ─────────────────────────────────── */}
      {isLoading && (
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-36" />
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────── */}
      {!isLoading && analysis && (
        <>
          <Tabs defaultValue="etat-art" className="w-full">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="etat-art" className="gap-2 text-xs sm:text-sm">
                  <BookOpen className="h-4 w-4 hidden sm:block" />
                  État de l&apos;art
                </TabsTrigger>
                <TabsTrigger value="auteurs" className="gap-2 text-xs sm:text-sm">
                  <Brain className="h-4 w-4 hidden sm:block" />
                  Auteurs & Théories
                </TabsTrigger>
                <TabsTrigger value="lacunes" className="gap-2 text-xs sm:text-sm">
                  <Target className="h-4 w-4 hidden sm:block" />
                  Lacunes
                </TabsTrigger>
                <TabsTrigger value="carte" className="gap-2 text-xs sm:text-sm">
                  <Network className="h-4 w-4 hidden sm:block" />
                  Carte conceptuelle
                </TabsTrigger>
                <TabsTrigger value="paysage" className="gap-2 text-xs sm:text-sm">
                  <Layers className="h-4 w-4 hidden sm:block" />
                  Paysage littéraire
                </TabsTrigger>
                <TabsTrigger value="positionnement" className="gap-2 text-xs sm:text-sm">
                  <MapPin className="h-4 w-4 hidden sm:block" />
                  Positionnement
                </TabsTrigger>
              </TabsList>
              <Button
                variant="outline"
                size="sm"
                onClick={exportReport}
                className="gap-2 shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Copié !
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Exporter
                  </>
                )}
              </Button>
            </div>

            {/* Tab 1 — État de l'art */}
            <TabsContent value="etat-art" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-chart-1" />
                      Vue d&apos;ensemble du champ
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm leading-relaxed whitespace-pre-line">
                      {analysis.overview}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-chart-2" />
                      Pistes de recherche
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm leading-relaxed whitespace-pre-line">
                      {analysis.directions}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab 2 — Auteurs et théories */}
            <TabsContent value="auteurs" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Brain className="h-4 w-4 text-chart-4" />
                    Auteurs et théories clés
                  </CardTitle>
                  <CardDescription>
                    Les figures fondatrices et contemporaines du champ, ainsi que les cadres théoriques majeurs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm leading-relaxed whitespace-pre-line">
                    {analysis.authors}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 3 — Lacunes */}
            <TabsContent value="lacunes" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4 text-chart-5" />
                    Lacunes identifiées
                  </CardTitle>
                  <CardDescription>
                    Les zones d&apos;ombre et contradictions dans la littérature existante
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm leading-relaxed whitespace-pre-line">
                    {analysis.gaps}
                    </div>
                  </CardContent>
              </Card>
              <div className="mt-4">
                <Card className="border-chart-2/20 bg-chart-2/5">
                  <CardContent className="p-4 flex items-start gap-3">
                    <Lightbulb className="h-4 w-4 text-chart-2 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-chart-2">
                        Astuce pour exploiter les lacunes
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Les lacunes identifiées ci-dessus constituent les fondements
                        de votre problématique. Utilisez l&apos;onglet &ldquo;Positionnement&rdquo;
                        pour formuler comment votre recherche comble ces lacunes.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab 4 — Carte conceptuelle */}
            <TabsContent value="carte" className="mt-6">
              <KnowledgeMapSection
                nodes={knowledgeMap}
                topic={form.topic}
                newNodeLabel={newNodeLabel}
                setNewNodeLabel={setNewNodeLabel}
                newChildLabel={newChildLabel}
                setNewChildLabel={setNewChildLabel}
                onAddRoot={addRootNode}
                onAddChild={addChildNode}
                onRemoveRoot={removeNode}
                onRemoveChild={removeChildNode}
              />
            </TabsContent>

            {/* Tab 5 — Paysage littéraire */}
            <TabsContent value="paysage" className="mt-6">
              <LiteratureLandscapeSection items={landscapeItems} />
            </TabsContent>

            {/* Tab 6 — Positionnement */}
            <TabsContent value="positionnement" className="mt-6">
              <PositioningSection
                data={positioning}
                onChange={setPositioning}
                isLoading={isPositioningLoading}
                onGenerate={generatePositioning}
              />
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* ── Empty state ─────────────────────────────────────── */}
      {!isLoading && !analysis && !error && (
        <Card className="border-dashed">
          <CardContent className="py-16 flex flex-col items-center gap-4 text-muted-foreground">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Compass className="h-7 w-7" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Aucune analyse en cours</p>
              <p className="text-xs mt-1">
                Remplissez le formulaire ci-dessus et lancez l&apos;analyse pour
                cartographier votre champ de recherche
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SUB-COMPONENT — Knowledge Map
   ═══════════════════════════════════════════════════════════════════════ */

function KnowledgeMapSection({
  nodes,
  topic,
  newNodeLabel,
  setNewNodeLabel,
  newChildLabel,
  setNewChildLabel,
  onAddRoot,
  onAddChild,
  onRemoveRoot,
  onRemoveChild,
}: {
  nodes: KnowledgeNode[];
  topic: string;
  newNodeLabel: string;
  setNewNodeLabel: (v: string) => void;
  newChildLabel: string;
  setNewChildLabel: (v: string) => void;
  onAddRoot: () => void;
  onAddChild: (parentId: string) => void;
  onRemoveRoot: (id: string) => void;
  onRemoveChild: (parentId: string, childId: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Map visualization */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Network className="h-4 w-4 text-chart-3" />
            Carte des connaissances
          </CardTitle>
          <CardDescription>
            Représentation visuelle des concepts, théories et de leurs relations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {nodes.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
              <Network className="h-8 w-8" />
              <p className="text-sm">La carte se peuplera après l&apos;analyse</p>
            </div>
          ) : (
            <div className="rounded-lg border bg-muted/30 p-4 font-mono text-xs leading-relaxed overflow-auto max-h-96">
              {/* Root topic */}
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-chart-3 text-chart-3-foreground text-[10px] font-bold">
                  <Compass className="h-3.5 w-3.5" />
                </span>
                <span className="font-semibold text-sm">{topic}</span>
              </div>
              {/* Nodes tree */}
              <div className="border-l-2 border-border ml-3 pl-4 space-y-3">
                {nodes.map((node) => (
                  <div key={node.id}>
                    <div className="flex items-center gap-2 group">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-chart-3/15 text-chart-3 text-[10px]">
                        <ChevronRight className="h-3 w-3" />
                      </span>
                      <span className="text-foreground">{node.label}</span>
                      <button
                        onClick={() => onRemoveRoot(node.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity ml-auto"
                        aria-label="Supprimer le nœud"
                      >
                        ×
                      </button>
                    </div>
                    {/* Children */}
                    {(node.children || []).length > 0 && (
                      <div className="border-l border-border ml-2.5 pl-4 mt-2 space-y-2">
                        {(node.children ?? []).map((child) => (
                          <div
                            key={child.id}
                            className="flex items-center gap-2 group"
                          >
                            <span className="text-muted-foreground">└──</span>
                            <span className="text-muted-foreground">
                              {child.label}
                            </span>
                            <button
                              onClick={() =>
                                onRemoveChild(node.id, child.id)
                              }
                              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity ml-auto"
                              aria-label="Supprimer le sous-nœud"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Ajouter un nœud racine</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Input
              placeholder="Nouveau concept..."
              value={newNodeLabel}
              onChange={(e) => setNewNodeLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onAddRoot()}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={onAddRoot}
              disabled={!newNodeLabel.trim()}
              className="w-full gap-2"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              Ajouter
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Ajouter un sous-nœud</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {nodes.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Ajoutez d&apos;abord un nœud racine
              </p>
            ) : (
              <>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Sélectionnez un nœud parent...</option>
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.label.length > 40
                        ? n.label.substring(0, 37) + "..."
                        : n.label}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder="Sous-concept..."
                  value={newChildLabel}
                  onChange={(e) => setNewChildLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && nodes.length > 0) {
                      onAddChild(nodes[0]?.id ?? "");
                    }
                  }}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { if (nodes[0]) onAddChild(nodes[0].id); }}
                  disabled={nodes.length === 0 || !newChildLabel.trim()}
                  className="w-full gap-2"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                  Ajouter
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-chart-3/20 bg-chart-3/5">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-medium text-chart-3">Conseil :</span> La
              carte se remplit automatiquement à partir de l&apos;analyse IA.
              Vous pouvez ensuite l&apos;enrichir manuellement avec vos propres
              concepts et relations.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SUB-COMPONENT — Literature Landscape
   ═══════════════════════════════════════════════════════════════════════ */

const LANDSCAPE_COLORS: Record<string, string> = {
  Courant: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  Thématique: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  Débat: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  Perspective: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  Approche: "bg-chart-5/10 text-chart-5 border-chart-5/20",
};

const LANDSCAPE_BADGE_COLORS: Record<string, string> = {
  Courant: "bg-chart-1/15 text-chart-1",
  Thématique: "bg-chart-2/15 text-chart-2",
  Débat: "bg-chart-3/15 text-chart-3",
  Perspective: "bg-chart-4/15 text-chart-4",
  Approche: "bg-chart-5/15 text-chart-5",
};

function LiteratureLandscapeSection({
  items,
}: {
  items: { title: string; description: string; type: string }[];
}) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 flex flex-col items-center gap-3 text-muted-foreground">
          <Layers className="h-8 w-8" />
          <p className="text-sm">
            Le paysage littéraire apparaîtra après l&apos;analyse
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4 text-chart-3" />
        <h3 className="text-sm font-medium">
          {items.length} thème(s) et perspective(s) identifié(s)
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, i) => (
          <Card
            key={i}
            className={`${LANDSCAPE_COLORS[item.type] || "border-border"}`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{item.title}</CardTitle>
                <Badge
                  variant="secondary"
                  className={`text-[10px] ${LANDSCAPE_BADGE_COLORS[item.type] || ""}`}
                >
                  {item.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SUB-COMPONENT — Research Positioning
   ═══════════════════════════════════════════════════════════════════════ */

const POSITIONING_FIELDS = [
  {
    key: "originality" as const,
    title: "Originalité de la recherche",
    icon: Lightbulb,
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
    placeholder:
      "En quoi votre travail se distingue-t-il de ce qui existe déjà ? Quels angles inédits explorez-vous ?",
  },
  {
    key: "theoreticalAnchoring" as const,
    title: "Ancrage théorique",
    icon: Brain,
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
    placeholder:
      "Quels cadres théoriques mobilisez-vous ? Comment s'articulent-ils avec votre problématique ?",
  },
  {
    key: "methodologicalApproach" as const,
    title: "Approche méthodologique",
    icon: Target,
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
    placeholder:
      "Quelle démarche méthodologique avez-vous choisie ? Pourquoi est-elle adaptée à votre sujet ?",
  },
  {
    key: "expectedContribution" as const,
    title: "Contribution scientifique attendue",
    icon: Sparkles,
    color: "text-chart-5",
    bgColor: "bg-chart-5/10",
    placeholder:
      "Quelle sera la contribution de votre thèse au champ de recherche ? À quelles lacunes répondez-vous ?",
  },
];

function PositioningSection({
  data,
  onChange,
  isLoading,
  onGenerate,
}: {
  data: PositioningData;
  onChange: (data: PositioningData) => void;
  isLoading: boolean;
  onGenerate: () => void;
}) {
  const updateField = (key: keyof PositioningData, value: string) => {
    onChange({ ...data, [key]: value });
  };

  const filledCount = POSITIONING_FIELDS.filter(
    (f) => data[f.key].trim().length > 0
  ).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Generate button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            {filledCount}/4 champs remplis
          </Badge>
        </div>
        <Button
          onClick={onGenerate}
          disabled={isLoading}
          variant="outline"
          className="gap-2"
        >
          {isLoading ? (
            <>
              <Sparkles className="h-4 w-4 animate-spin" />
              Génération...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Générer avec l&apos;IA
            </>
          )}
        </Button>
      </div>

      {/* Positioning fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {POSITIONING_FIELDS.map((field) => {
          const Icon = field.icon;
          return (
            <Card key={field.key}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-md ${field.bgColor}`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${field.color}`} />
                  </div>
                  {field.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder={field.placeholder}
                  value={data[field.key]}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  rows={4}
                  className="text-sm"
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Synthesis accordion */}
      {filledCount === 4 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-chart-3" />
              Synthèse du positionnement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="synthesis">
                <AccordionTrigger className="text-sm">
                  Voir la synthèse complète
                </AccordionTrigger>
                <AccordionContent>
                  <div className="rounded-lg border bg-muted/30 p-4 text-sm leading-relaxed space-y-3">
                    <div>
                      <p className="font-medium text-chart-2">
                        1. Originalité
                      </p>
                      <p className="text-muted-foreground mt-1">
                        {data.originality}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <p className="font-medium text-chart-4">
                        2. Ancrage théorique
                      </p>
                      <p className="text-muted-foreground mt-1">
                        {data.theoreticalAnchoring}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <p className="font-medium text-chart-3">
                        3. Approche méthodologique
                      </p>
                      <p className="text-muted-foreground mt-1">
                        {data.methodologicalApproach}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <p className="font-medium text-chart-5">
                        4. Contribution attendue
                      </p>
                      <p className="text-muted-foreground mt-1">
                        {data.expectedContribution}
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
