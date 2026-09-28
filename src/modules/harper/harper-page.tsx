"use client";

import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useAiConfig } from "@/hooks/use-ai-config";
import {
  FileText,
  RefreshCw,
  List,
  BookOpen,
  Tag,
  Columns2,
  Send,
  Loader2,
  Copy,
  Check,
  History,
  Sparkles,
  RotateCcw,
  Trash2,
} from "lucide-react";

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

type SummaryLength = "court" | "moyen" | "détaillé";
type ParaphraseStyle =
  | "academique"
  | "vulgarise"
  | "executif"
  | "citation";
type HarperTab =
  | "summarize"
  | "paraphrase"
  | "keypoints"
  | "abstract"
  | "keywords"
  | "compare";

interface HistoryEntry {
  id: string;
  type: HarperTab;
  label: string;
  input: string;
  output: string;
  timestamp: Date;
  detail?: string;
}

// ═══════════════════════════════════════
// Constants
// ═══════════════════════════════════════

const SUMMARY_LENGTHS: {
  value: SummaryLength;
  label: string;
  description: string;
}[] = [
  { value: "court", label: "Court", description: "~100 mots" },
  { value: "moyen", label: "Moyen", description: "~250 mots" },
  { value: "détaillé", label: "Détaillé", description: "~500 mots" },
];

const PARAPHRASE_STYLES: {
  value: ParaphraseStyle;
  label: string;
  description: string;
}[] = [
  {
    value: "academique",
    label: "Académique formel",
    description: "Style doctoral soutenu",
  },
  {
    value: "vulgarise",
    label: "Vulgarisé",
    description: "Langage clair et accessible",
  },
  {
    value: "executif",
    label: "Résumé exécutif",
    description: "Synthèse orientée décision",
  },
  {
    value: "citation",
    label: "Citation",
    description: "Format texte cité avec guillemets",
  },
];

const TAB_META: Record<
  HarperTab,
  { label: string; icon: React.ElementType; description: string }
> = {
  summarize: {
    label: "Résumer",
    icon: FileText,
    description: "Générer un résumé concis de votre texte",
  },
  paraphrase: {
    label: "Paraphraser",
    icon: RefreshCw,
    description: "Réécrire dans un style différent",
  },
  keypoints: {
    label: "Points clés",
    icon: List,
    description: "Extraire les arguments principaux",
  },
  abstract: {
    label: "Abstract",
    icon: BookOpen,
    description: "Générer un abstract à partir de contenu",
  },
  keywords: {
    label: "Mots-clés",
    icon: Tag,
    description: "Extraire les concepts et mots-clés pertinents",
  },
  compare: {
    label: "Comparaison",
    icon: Columns2,
    description: "Voir original et résumé côte à côte",
  },
};

const MAX_HISTORY = 5;

// ═══════════════════════════════════════
// Prompt builders
// ═══════════════════════════════════════

function buildSystemPrompt(
  tab: HarperTab,
  detail?: string
): string {
  const base =
    "Tu es un assistant spécialisé en rédaction académique pour la recherche universitaire. " +
    "Tu réponds UNIQUEMENT en français. " +
    "Tu produis un texte structuré, clair et professionnel.";

  switch (tab) {
    case "summarize":
      return (
        base +
        ` Résume le texte fourni en français de manière concise et fidèle.
La longueur du résumé doit être : ${detail || "moyenne"}.
Conserve les idées principales et le fil argumentatif.
Ne pas ajouter d'informations non présentes dans le texte original.
Ne pas utiliser de titres ni de markdown, juste un paragraphe continu.`
      );
    case "paraphrase":
      return (
        base +
        ` Reformule le texte fourni en français dans le style suivant : ${detail || "académique formel"}.
Conserve intégralement le sens et les informations clés.
Adapte le registre de langue et la structure des phrases au style demandé.
Ne pas ajouter ni supprimer d'informations.`
      );
    case "keypoints":
      return (
        base +
        ` Extrais les points clés et arguments principaux du texte fourni.
Présente-les sous forme de liste à puces numérotée.
Chaque point doit être une phrase complète et autonome.
Maximum 10 points clés. Si le texte est court, extrais 3 à 5 points minimum.
Sois précis et fidèle au texte original.`
      );
    case "abstract":
      return (
        base +
        ` Génère un abstract académique en français à partir du contenu de chapitre fourni.
L'abstract doit contenir : le contexte, l'objectif, la méthodologie (si mentionnée), les résultats principaux et la conclusion.
Longueur : entre 150 et 300 mots.
Style : formel, objectif, à la troisième personne.
Ne pas utiliser d'abréviations non définies.`
      );
    case "keywords":
      return (
        base +
        ` Extrais les mots-clés et concepts pertinents du texte fourni.
Présente-les sous forme de liste avec une brève définition pour chacun.
Classe-les par ordre d'importance.
Maximum 15 mots-clés.
Pour chaque mot-clé, indique : le terme, sa catégorie (concept, méthode, théorie, domaine) et une définition d'une phrase.`
      );
    case "compare":
      return (
        base +
        ` Résume le texte fourni en français de manière concise.
Le résumé doit être environ 3 fois plus court que l'original.
Conserve les idées principales et le fil argumentatif.
Format : paragraphe continu sans titres ni markdown.`
      );
  }
}

function buildUserPrompt(tab: HarperTab, text: string): string {
  switch (tab) {
    case "abstract":
      return `Voici le contenu d'un chapitre à résumer en abstract :

${text}`;
    case "keywords":
      return `Voici le texte à analyser pour en extraire les mots-clés :

${text}`;
    default:
      return `Voici le texte à traiter :

${text}`;
  }
}

function getDetailLabel(tab: HarperTab, detail?: string): string {
  if (tab === "summarize") {
    const found = SUMMARY_LENGTHS.find((l) => l.value === detail);
    return found ? found.label : "Moyen";
  }
  if (tab === "paraphrase") {
    const found = PARAPHRASE_STYLES.find((s) => s.value === detail);
    return found ? found.label : "Académique formel";
  }
  return "";
}

// ═══════════════════════════════════════
// Main Component
// ═══════════════════════════════════════

export function HarperPage() {
  const { withAiConfig } = useAiConfig();
  const [activeTab, setActiveTab] = useState<HarperTab>("summarize");
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState("");
  const [summaryLength, setSummaryLength] = useState<SummaryLength>("moyen");
  const [paraphraseStyle, setParaphraseStyle] =
    useState<ParaphraseStyle>("academique");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [copied, setCopied] = useState(false);

  // ── AI Mutation ──
  const generate = useMutation({
    mutationFn: async ({
      tab,
      text,
      detail,
    }: {
      tab: HarperTab;
      text: string;
      detail?: string;
    }) => {
      const systemPrompt = buildSystemPrompt(tab, detail);
      const userPrompt = buildUserPrompt(tab, text);

      const res = await fetch("/api/ai-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(withAiConfig({
          mode: "harper",
          prompt: userPrompt,
          context: systemPrompt,
        })),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erreur serveur" }));
        throw new Error(err.error || "Erreur lors de la génération");
      }
      const json = await res.json();
      return json.data.content as string;
    },
    onSuccess: (content, variables) => {
      setResult(content);
      const label = TAB_META[variables.tab].label;
      const detailLabel = getDetailLabel(variables.tab, variables.detail);
      const fullLabel = detailLabel ? `${label} — ${detailLabel}` : label;

      setHistory((prev) => {
        const entry: HistoryEntry = {
          id: crypto.randomUUID(),
          type: variables.tab,
          label: fullLabel,
          input: variables.text.slice(0, 120) + (variables.text.length > 120 ? "..." : ""),
          output: content,
          timestamp: new Date(),
          detail: variables.detail,
        };
        return [entry, ...prev].slice(0, MAX_HISTORY);
      });
      toast.success(`${fullLabel} généré avec succès`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // ── Handlers ──
  const handleProcess = useCallback(() => {
    if (!inputText.trim() || generate.isPending) return;
    if (inputText.trim().length < 20) {
      toast.error("Le texte doit contenir au moins 20 caractères");
      return;
    }

    let detail: string | undefined;
    if (activeTab === "summarize") {
      detail = summaryLength;
    } else if (activeTab === "paraphrase") {
      detail = paraphraseStyle;
    }

    generate.mutate({ tab: activeTab, text: inputText.trim(), detail });
  }, [inputText, activeTab, summaryLength, paraphraseStyle, generate]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Copié dans le presse-papiers");
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  const handleClear = useCallback(() => {
    setInputText("");
    setResult("");
  }, []);

  const handleRestoreHistory = useCallback(
    (entry: HistoryEntry) => {
      setInputText(entry.input);
      setResult(entry.output);
      setActiveTab(entry.type);
      if (entry.detail) {
        if (entry.type === "summarize") {
          setSummaryLength(entry.detail as SummaryLength);
        } else if (entry.type === "paraphrase") {
          setParaphraseStyle(entry.detail as ParaphraseStyle);
        }
      }
      toast.info(`Historique restauré : ${entry.label}`);
    },
    []
  );

  const handleClearHistory = useCallback(() => {
    setHistory([]);
    toast.info("Historique effacé");
  }, []);

  const isProcessing = generate.isPending;

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 p-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Harper — Résumeur & Paraphraseur
        </h1>
        <p className="text-sm text-muted-foreground">
          Résumez, paraphrasez et analysez vos textes académiques avec l&apos;IA
        </p>
      </div>

      {/* ── Tabs ── */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v as HarperTab);
          setResult("");
        }}
        className="w-full"
      >
        <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
          {(Object.entries(TAB_META) as [HarperTab, (typeof TAB_META)[HarperTab]][]).map(
            ([key, meta]) => {
              const Icon = meta.icon;
              return (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="gap-1.5 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{meta.label}</span>
                </TabsTrigger>
              );
            }
          )}
        </TabsList>

        {/* ── Summarize ── */}
        <TabsContent value="summarize" className="mt-4">
          <InputPanel
            tab="summarize"
            inputText={inputText}
            onInputChange={setInputText}
            onProcess={handleProcess}
            onClear={handleClear}
            isProcessing={isProcessing}
            extraControls={
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  Longueur :
                </span>
                <Select
                  value={summaryLength}
                  onValueChange={(v) => setSummaryLength(v as SummaryLength)}
                >
                  <SelectTrigger className="w-[160px]" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUMMARY_LENGTHS.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        <span>{l.label}</span>
                        <span className="text-muted-foreground text-xs ml-1">
                          ({l.description})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            }
          />
          <ResultPanel
            result={result}
            copied={copied}
            onCopy={handleCopy}
            error={generate.isError ? generate.error.message : null}
            isPending={generate.isPending}
          />
        </TabsContent>

        {/* ── Paraphrase ── */}
        <TabsContent value="paraphrase" className="mt-4">
          <InputPanel
            tab="paraphrase"
            inputText={inputText}
            onInputChange={setInputText}
            onProcess={handleProcess}
            onClear={handleClear}
            isProcessing={isProcessing}
            extraControls={
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  Style :
                </span>
                <Select
                  value={paraphraseStyle}
                  onValueChange={(v) =>
                    setParaphraseStyle(v as ParaphraseStyle)
                  }
                >
                  <SelectTrigger className="w-[180px]" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PARAPHRASE_STYLES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        <span>{s.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            }
          />
          <ResultPanel
            result={result}
            copied={copied}
            onCopy={handleCopy}
            error={generate.isError ? generate.error.message : null}
            isPending={generate.isPending}
          />
        </TabsContent>

        {/* ── Key Points ── */}
        <TabsContent value="keypoints" className="mt-4">
          <InputPanel
            tab="keypoints"
            inputText={inputText}
            onInputChange={setInputText}
            onProcess={handleProcess}
            onClear={handleClear}
            isProcessing={isProcessing}
          />
          <ResultPanel
            result={result}
            copied={copied}
            onCopy={handleCopy}
            error={generate.isError ? generate.error.message : null}
            isPending={generate.isPending}
          />
        </TabsContent>

        {/* ── Abstract ── */}
        <TabsContent value="abstract" className="mt-4">
          <InputPanel
            tab="abstract"
            inputText={inputText}
            onInputChange={setInputText}
            onProcess={handleProcess}
            onClear={handleClear}
            isProcessing={isProcessing}
          />
          <ResultPanel
            result={result}
            copied={copied}
            onCopy={handleCopy}
            error={generate.isError ? generate.error.message : null}
            isPending={generate.isPending}
          />
        </TabsContent>

        {/* ── Keywords ── */}
        <TabsContent value="keywords" className="mt-4">
          <InputPanel
            tab="keywords"
            inputText={inputText}
            onInputChange={setInputText}
            onProcess={handleProcess}
            onClear={handleClear}
            isProcessing={isProcessing}
          />
          <ResultPanel
            result={result}
            copied={copied}
            onCopy={handleCopy}
            error={generate.isError ? generate.error.message : null}
            isPending={generate.isPending}
          />
        </TabsContent>

        {/* ── Compare ── */}
        <TabsContent value="compare" className="mt-4">
          <InputPanel
            tab="compare"
            inputText={inputText}
            onInputChange={setInputText}
            onProcess={handleProcess}
            onClear={handleClear}
            isProcessing={isProcessing}
          />
          {result && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Original */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      Texte original
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px]">
                      {inputText.split(/\s+/).filter(Boolean).length} mots
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {inputText}
                    </p>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Summarized */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Résumé généré
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {result.split(/\s+/).filter(Boolean).length} mots
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 gap-1 text-[10px]"
                        onClick={handleCopy}
                      >
                        {copied ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        {copied ? "Copié" : "Copier"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {result}
                    </p>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}
          {generate.isError && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="p-4 text-sm text-destructive">
                {generate.error.message}
              </CardContent>
            </Card>
          )}
          {generate.isPending && (
            <Card>
              <CardContent className="p-8 flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  Résumé en cours de génération...
                </span>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* ── History ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <History className="h-4 w-4" />
              Historique récent
              {history.length > 0 && (
                <Badge variant="secondary" className="text-[10px] h-5">
                  {history.length}/{MAX_HISTORY}
                </Badge>
              )}
            </CardTitle>
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-destructive"
                onClick={handleClearHistory}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Effacer
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              Aucune opération récente. Vos 5 dernières opérations apparaîtront ici.
            </p>
          ) : (
            <ScrollArea className="max-h-64">
              <div className="flex flex-col gap-2">
                {history.map((entry) => {
                  const Icon = TAB_META[entry.type].icon;
                  return (
                    <button
                      key={entry.id}
                      onClick={() => handleRestoreHistory(entry)}
                      className="flex items-start gap-3 rounded-lg border p-3 text-left transition-all hover:bg-muted/50 w-full"
                    >
                      <Icon className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium truncate">
                            {entry.label}
                          </span>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {entry.timestamp.toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {entry.input}
                        </span>
                      </div>
                      <RotateCcw className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-1" />
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════
// Input Panel (reusable)
// ═══════════════════════════════════════

function InputPanel({
  tab,
  inputText,
  onInputChange,
  onProcess,
  onClear,
  isProcessing,
  extraControls,
}: {
  tab: HarperTab;
  inputText: string;
  onInputChange: (v: string) => void;
  onProcess: () => void;
  onClear: () => void;
  isProcessing: boolean;
  extraControls?: React.ReactNode;
}) {
  const meta = TAB_META[tab];
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm flex items-center gap-2">
              {meta.label}
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              {meta.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Textarea
          placeholder={
            tab === "abstract"
              ? "Collez ici le contenu de votre chapitre..."
              : tab === "keywords"
                ? "Collez ici le texte à analyser..."
                : "Collez ici le texte à traiter..."
          }
          value={inputText}
          onChange={(e) => onInputChange(e.target.value)}
          rows={8}
          className="resize-none text-sm"
          disabled={isProcessing}
        />
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {inputText.length} caractères
              {inputText.length > 0 && (
                <span className="ml-1">
                  · {inputText.split(/\s+/).filter(Boolean).length} mots
                </span>
              )}
            </span>
            {extraControls}
          </div>
          <div className="flex items-center gap-2">
            {inputText.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={onClear}
                disabled={isProcessing}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Effacer
              </Button>
            )}
            <Button
              onClick={onProcess}
              disabled={!inputText.trim() || inputText.trim().length < 20 || isProcessing}
              className="gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  {tab === "summarize"
                    ? "Résumer"
                    : tab === "paraphrase"
                      ? "Paraphraser"
                      : tab === "keypoints"
                        ? "Extraire"
                        : tab === "abstract"
                          ? "Générer"
                          : tab === "keywords"
                            ? "Analyser"
                            : "Comparer"}
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════
// Result Panel (reusable)
// ═══════════════════════════════════════

function ResultPanel({
  result,
  copied,
  onCopy,
  error,
  isPending,
}: {
  result: string;
  copied: boolean;
  onCopy: () => void;
  error: string | null;
  isPending: boolean;
}) {
  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
      </Card>
    );
  }

  if (isPending) {
    return (
      <Card>
        <CardContent className="p-8 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">
            Génération en cours...
          </span>
        </CardContent>
      </Card>
    );
  }

  if (!result) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Résultat
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 text-xs"
            onClick={onCopy}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? "Copié" : "Copier"}
          </Button>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {result.split("\n").map((line, i) => {
            if (line.trim() === "") return <br key={i} />;
            if (line.match(/^[0-9]+[.)]/))
              return (
                <p key={i} className="font-medium mt-3">
                  {line}
                </p>
              );
            return (
              <p key={i} className="leading-relaxed">
                {line}
              </p>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
