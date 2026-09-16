"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Lightbulb, Loader2, Sparkles, FileText, ClipboardList,
  Download, ArrowRight, RotateCcw, Copy, Check, Beaker,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

// ── Streaming AI helper ──
function useAIStream() {
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(async (userText: string, mode: string, context?: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setOutput("");

    try {
      const res = await fetch("/api/ai-writing/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: userText, mode, context }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Erreur ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Pas de stream");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ")) {
            const data = trimmed.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              const chunk = parsed.choices?.[0]?.delta?.content || parsed.text || parsed.content || "";
              if (chunk) setOutput(prev => prev + chunk);
            } catch {
              if (data && data !== "[DONE]") setOutput(prev => prev + data);
            }
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setOutput(prev => prev || `\n\n❌ ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setLoading(false);
  }, []);

  return { output, loading, generate, stop };
}

// ── Preregistration types ──
interface PreregData {
  researchQuestion: string;
  mainHypothesis: string;
  subHypotheses: string;
  statTest: string;
  sampleSize: string;
  inclusionCriteria: string;
  exclusionCriteria: string;
  significanceLevel: string;
  additionalNotes: string;
}

const DEFAULT_PREREG: PreregData = {
  researchQuestion: "",
  mainHypothesis: "",
  subHypotheses: "",
  statTest: "",
  sampleSize: "",
  inclusionCriteria: "",
  exclusionCriteria: "",
  significanceLevel: "0.05",
  additionalNotes: "",
};

function generatePreregMarkdown(d: PreregData) {
  const date = new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
  return `# Pré-enregistrement de Recherche

**Date :** ${date}

---

## 1. Question de Recherche

${d.researchQuestion || "_Non spécifiée_"}

---

## 2. Hypothèses

### Hypothèse principale (H1)

${d.mainHypothesis || "_Non spécifiée_"}

### Sous-hypothèses

${d.subHypotheses || "_Non spécifiées_"}

---

## 3. Plan d'Analyse Statistique

| Élément | Valeur |
|---------|--------|
| **Test statistique** | ${d.statTest || "_Non sélectionné_"} |
| **Taille d'échantillon cible** | ${d.sampleSize || "_Non spécifiée_"} |
| **Seuil de signification (α)** | ${d.significanceLevel || "0.05"} |

---

## 4. Critères d'Éligibilité

### Inclusion

${d.inclusionCriteria || "_Non spécifiés_"}

### Exclusion

${d.exclusionCriteria || "_Non spécifiés_"}

---

## 5. Notes Complémentaires

${d.additionalNotes || "_Aucune_"}

---

*Document généré par Ma Thèse — ${date}*
`;
}

// ── Main Component ──

export function GenerationHypothesesPage() {
  const { toast } = useToast();

  // Tab 1: Hypothesis generation
  const [researchQuestion, setResearchQuestion] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const hypotheses = useAIStream();

  // Tab 2: Operational framework
  const [operationalInput, setOperationalInput] = useState("");
  const operational = useAIStream();

  // Tab 3: Preregistration
  const [prereg, setPrereg] = useState<PreregData>({ ...DEFAULT_PREREG });
  const [copied, setCopied] = useState(false);

  const handleGenerateHypotheses = useCallback(() => {
    if (!researchQuestion.trim()) {
      toast({ title: "Question requise", description: "Entrez votre question de recherche", variant: "destructive" });
      return;
    }
    const context = fieldOfStudy.trim()
      ? `Domaine : ${fieldOfStudy}`
      : undefined;
    const prompt = `En tant qu'expert en méthodologie de recherche doctorale, aide-moi à formuler des hypothèses de recherche rigoureuses et testables.

Question de recherche : ${researchQuestion}
${context ? `\n${context}` : ""}

Génère :
1. **Hypothèse principale (H1)** : formulation claire et testable
2. **Sous-hypothèses (H1a, H1b, ...)** : déclinaisons opérationnelles
3. **Variables** : identifier les variables indépendantes (VI) et dépendantes (VD)
4. **Hypothèse nulle (H0)** : formulation exacte
5. **Hypothèses rivales** : alternatives plausibles
6. **Plan de test proposé** : type de test statistique, design expérimental

Sois précis et académique. Chaque hypothèse doit être falsifiable.`;
    hypotheses.generate(prompt, "generation-hypotheses", context);
  }, [researchQuestion, fieldOfStudy, hypotheses, toast]);

  const handleOperationalize = useCallback(() => {
    const input = operationalInput.trim() || hypotheses.output;
    if (!input.trim()) {
      toast({ title: "Hypothèses requises", description: "Générez d'abord des hypothèses ou collez-en", variant: "destructive" });
      return;
    }
    const prompt = `En tant qu'expert en méthodologie quantitative, transforme les hypothèses suivantes en un cadre opérational complet.

Hypothèses :
${input}

Génère pour chaque hypothèse :
1. **Définition opérationnelle** de chaque variable (comment elle sera mesurée concrètement)
2. **Indicateurs de mesure** : quels indicateurs spécifiques
3. **Instruments/Échelles** suggérés : échelles validées, questionnaires, tests existants
4. **Plan de collecte** : type de données (quantitatives/qualitatives), source, fréquence
5. **Variables de contrôle** à considérer
6. **Matrice de codification** : comment chaque variable sera codée

Sois pratique et doctoral.`;
    operational.generate(prompt, "generation-hypotheses");
  }, [operationalInput, hypotheses.output, operational, toast]);

  const handleExportPrereg = useCallback(() => {
    const md = generatePreregMarkdown(prereg);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pre-enregistrement-recherche.md";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exporté", description: "Fichier pré-enregistrement téléchargé" });
  }, [prereg, toast]);

  const handleCopyToPrereg = useCallback(() => {
    if (!hypotheses.output) {
      toast({ title: "Pas d'hypothèses", description: "Générez d'abord des hypothèses", variant: "destructive" });
      return;
    }
    setPrereg(prev => ({
      ...prev,
      mainHypothesis: hypotheses.output.split("\n").slice(0, 5).join("\n"),
    }));
    toast({ title: "Copié", description: "Hypothèses transférées vers le pré-enregistrement" });
  }, [hypotheses.output, toast]);

  const handleCopyText = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copié" });
  }, [toast]);

  const updatePrereg = useCallback((field: keyof PreregData, value: string) => {
    setPrereg(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/40">
          <Lightbulb className="w-5 h-5 text-amber-700 dark:text-amber-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold tracking-tight">Génération d'Hypothèses</h1>
          <p className="text-sm text-muted-foreground truncate">
            Formulez des hypothèses rigoureuses, testables et pré-enregistrez votre recherche
          </p>
        </div>
        <Badge variant="secondary" className="shrink-0 text-xs">IA</Badge>
      </div>

      <Tabs defaultValue="hypotheses" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="hypotheses" className="gap-1.5">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Génération</span> Hypothèses
          </TabsTrigger>
          <TabsTrigger value="operational" className="gap-1.5">
            <Beaker className="h-4 w-4" />
            <span className="hidden sm:inline">Cadre </span>Opérationnel
          </TabsTrigger>
          <TabsTrigger value="prereg" className="gap-1.5">
            <ClipboardList className="h-4 w-4" />
            Pré-enregistrement
          </TabsTrigger>
        </TabsList>

        {/* ═══ TAB 1: Hypothesis Generation ═══ */}
        <TabsContent value="hypotheses" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Votre question de recherche
              </CardTitle>
              <CardDescription>Décrivez votre problématique et l'IA générera des hypothèses testables</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="rq">Question de recherche *</Label>
                  <Textarea
                    id="rq"
                    placeholder="Ex : Quel est l'impact de l'utilisation des outils d'IA générative sur la qualité de l'encadrement doctoral en sciences humaines et sociales ?"
                    value={researchQuestion}
                    onChange={e => setResearchQuestion(e.target.value)}
                    className="min-h-[100px] mt-1.5"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="field">Domaine de recherche (optionnel)</Label>
                  <Input
                    id="field"
                    placeholder="Ex : Sciences de l'éducation, Psychologie cognitive, Informatique..."
                    value={fieldOfStudy}
                    onChange={e => setFieldOfStudy(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleGenerateHypotheses}
                  disabled={hypotheses.loading || !researchQuestion.trim()}
                  className="gap-1.5"
                >
                  {hypotheses.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {hypotheses.loading ? "Génération..." : "Générer des hypothèses"}
                </Button>
                {hypotheses.loading && (
                  <Button variant="outline" size="sm" onClick={hypotheses.stop}>
                    Arrêter
                  </Button>
                )}
                {hypotheses.output && (
                  <Button variant="ghost" size="sm" onClick={() => handleCopyText(hypotheses.output)}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {hypotheses.output && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Hypothèses générées
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={handleCopyToPrereg} className="gap-1.5">
                    <ArrowRight className="h-3 w-3" />
                    Vers pré-enregistrement
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{hypotheses.output}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}

          {!hypotheses.output && !hypotheses.loading && (
            <Card>
              <CardContent className="p-8 text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Entrez votre question de recherche ci-dessus. L'IA générera des hypothèses principales,
                  sous-hypothèses, variables, hypothèses nulles/rivales et un plan de test.
                </p>
                <p className="text-xs text-muted-foreground">
                  Inspiré de la méthodologie de Nuijten et al. (2016) et du standard de pré-enregistrement COS/OSF.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ═══ TAB 2: Operational Framework ═══ */}
        <TabsContent value="operational" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Beaker className="h-4 w-4" />
                Hypothèses à opérationnaliser
              </CardTitle>
              <CardDescription>Collez vos hypothèses ou utilisez celles générées dans l'onglet précédent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder={hypotheses.output ? "Hypothèses déjà remplies depuis l'onglet Génération. Modifiez si besoin." : "Collez ici vos hypothèses de recherche..."}
                value={operationalInput || hypotheses.output}
                onChange={e => setOperationalInput(e.target.value)}
                className="min-h-[120px] font-mono text-sm"
              />
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleOperationalize}
                  disabled={operational.loading || (!operationalInput.trim() && !hypotheses.output)}
                  className="gap-1.5"
                >
                  {operational.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Beaker className="h-4 w-4" />}
                  {operational.loading ? "Opérationnalisation..." : "Opérationnaliser"}
                </Button>
                {operational.loading && (
                  <Button variant="outline" size="sm" onClick={operational.stop}>Arrêter</Button>
                )}
              </div>
            </CardContent>
          </Card>

          {operational.output && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Cadre Opérationnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{operational.output}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ═══ TAB 3: Preregistration ═══ */}
        <TabsContent value="prereg" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Formulaire de Pré-enregistrement
              </CardTitle>
              <CardDescription>
                Document structuré pour le pré-enregistrement de votre recherche (standard COS/OSF)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rq-prereg">Question de recherche</Label>
                <Textarea
                  id="rq-prereg"
                  placeholder="Formulez votre question de recherche principale..."
                  value={prereg.researchQuestion}
                  onChange={e => updatePrereg("researchQuestion", e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="main-h">Hypothèse principale (H1)</Label>
                  <Textarea
                    id="main-h"
                    placeholder="Ex : L'utilisation d'outils d'IA générative améliore significativement la qualité perçue de l'encadrement doctoral mesurée par l'échelle de satisfaction..."
                    value={prereg.mainHypothesis}
                    onChange={e => updatePrereg("mainHypothesis", e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="sub-h">Sous-hypothèses (H1a, H1b, ...)</Label>
                  <Textarea
                    id="sub-h"
                    placeholder="H1a : L'effet est modéré par l'expérience du directeur de thèse\nH1b : L'effet est médiatisé par la fréquence d'utilisation..."
                    value={prereg.subHypotheses}
                    onChange={e => updatePrereg("subHypotheses", e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Test statistique</Label>
                  <Select value={prereg.statTest} onValueChange={v => updatePrereg("statTest", v)}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="t-test (student)">Test t de Student</SelectItem>
                      <SelectItem value="t-test (welch)">Test t de Welch</SelectItem>
                      <SelectItem value="anova (1 facteur)">ANOVA (1 facteur)</SelectItem>
                      <SelectItem value="anova (facteurs mixtes)">ANOVA (facteurs mixtes)</SelectItem>
                      <SelectItem value="anova (mesures répétées)">ANOVA (mesures répétées)</SelectItem>
                      <SelectItem value="chi-carre (independance)">Chi-carré (indépendance)</SelectItem>
                      <SelectItem value="chi-carre (ajustement)">Chi-carré (ajustement)</SelectItem>
                      <SelectItem value="regression lineaire multiple">Régression linéaire multiple</SelectItem>
                      <SelectItem value="regression logistique">Régression logistique</SelectItem>
                      <SelectItem value="correlation de pearson">Corrélation de Pearson</SelectItem>
                      <SelectItem value="correlation de spearman">Corrélation de Spearman</SelectItem>
                      <SelectItem value="mann-whitney U">Mann-Whitney U</SelectItem>
                      <SelectItem value="kruskal-wallis">Kruskal-Wallis</SelectItem>
                      <SelectItem value="analyse de mediation">Analyse de médiation</SelectItem>
                      <SelectItem value="analyse de moderation">Analyse de modération</SelectItem>
                      <SelectItem value="modelisation par equations structurelles (SEM)">SEM</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sample">Taille d'échantillon cible</Label>
                  <Input
                    id="sample"
                    placeholder="Ex : N = 200"
                    value={prereg.sampleSize}
                    onChange={e => updatePrereg("sampleSize", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alpha">Seuil de signification (α)</Label>
                  <Input
                    id="alpha"
                    placeholder="0.05"
                    value={prereg.significanceLevel}
                    onChange={e => updatePrereg("significanceLevel", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="inclusion">Critères d'inclusion</Label>
                  <Textarea
                    id="inclusion"
                    placeholder="Ex : Doctorants inscrits en année 2 ou plus, utilisant au moins un outil d'IA..."
                    value={prereg.inclusionCriteria}
                    onChange={e => updatePrereg("inclusionCriteria", e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exclusion">Critères d'exclusion</Label>
                  <Textarea
                    id="exclusion"
                    placeholder="Ex : Doctorants en sciences exactes, moins de 3 mois d'utilisation..."
                    value={prereg.exclusionCriteria}
                    onChange={e => updatePrereg("exclusionCriteria", e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes complémentaires</Label>
                <Textarea
                  id="notes"
                  placeholder="Contrôles prévus, variables confondantes, considérations éthiques..."
                  value={prereg.additionalNotes}
                  onChange={e => updatePrereg("additionalNotes", e.target.value)}
                  className="min-h-[60px]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button onClick={handleExportPrereg} className="gap-1.5">
                  <Download className="h-4 w-4" />
                  Exporter en Markdown
                </Button>
                <Button variant="outline" onClick={() => setPrereg({ ...DEFAULT_PREREG })} className="gap-1.5">
                  <RotateCcw className="h-4 w-4" />
                  Réinitialiser
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
