"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileCode2,
  Loader2,
  Download,
  Sparkles,
  FileText,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  AlertCircle,
  Play,
  GitBranch,
  ClipboardList,
  Code2,
} from "lucide-react";
import { toast } from "sonner";
import {
  type AiProviderId,
  getProviderLabel,
  PROVIDER_MODELS,
} from "@/lib/ai/ai-types";

// Types
interface PlanResult {
  overview: string;
  file_list: string[];
  class_diagram: string;
  sequence_diagram: string;
  task_descriptions: Record<string, string>;
  config_yaml: string;
  required_packages: string[];
}

interface StreamEvent {
  type: string;
  stage?: string;
  step?: number;
  total?: number;
  message?: string;
  file?: string;
  content?: string;
  data?: PlanResult;
  stats?: { files: number; calls: number; plan: PlanResult; codes: Record<string, string>; analyses: Record<string, string> };
  error?: string;
}

const FAST_PROVIDERS: AiProviderId[] = ["groq", "google", "openrouter", "github", "openai"];

export function Paper2CodePage() {
  const [paperText, setPaperText] = useState("");
  const [provider, setProvider] = useState<AiProviderId>("groq");
  const [model, setModel] = useState("llama-3.3-70b-versatile");
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState({ stage: "", step: 0, total: 0, message: "" });
  const [activeTab, setActiveTab] = useState("plan");
  const [plan, setPlan] = useState<PlanResult | null>(null);
  const [analyses, setAnalyses] = useState<Record<string, string>>({});
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const availableModels = PROVIDER_MODELS[provider] || [];

  useEffect(() => {
    const models = PROVIDER_MODELS[provider] || [];
    if (models.length > 0) setModel(models[0]);
  }, [provider]);

  useEffect(() => {
    if (progress.stage === "coding" && activeTab === "plan") setActiveTab("code");
  }, [progress.stage, activeTab]);

  const handleEvent = useCallback((event: StreamEvent) => {
    if (event.type === "progress") {
      setProgress({ stage: event.stage || "", step: event.step || 0, total: event.total || 0, message: event.message || "" });
      if (event.stage === "analyzing" && event.step === 1) setActiveTab("analyse");
      if (event.stage === "coding" && event.step === 1) setActiveTab("code");
    }
    if (event.type === "result" && event.stage === "planning" && event.data) setPlan(event.data);
    if (event.type === "result" && event.stage === "analyzing" && event.file) {
      setAnalyses((prev) => ({ ...prev, [event.file!]: event.content || "" }));
    }
    if (event.type === "result" && event.stage === "coding" && event.file) {
      setCodes((prev) => ({ ...prev, [event.file!]: event.content || "" }));
    }
    if (event.type === "error") setError(event.message || "Erreur inconnue.");
    if (event.type === "done") {
      toast.success(`Code genere avec succes (${event.stats?.files} fichiers, ${event.stats?.calls} appels LLM).`);
      setActiveTab("code");
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!paperText.trim()) { toast.error("Veuillez saisir le texte de l'article."); return; }
    setGenerating(true);
    setError(null);
    setPlan(null);
    setAnalyses({});
    setCodes({});
    setActiveTab("plan");
    setProgress({ stage: "planning", step: 0, total: 1, message: "" });
    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/paper2code/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paperText, provider, model }),
        signal: abortRef.current.signal,
      });
      if (!res.ok) {
        const errData = (await res.json()) as { error?: string };
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      const reader = res.body?.getReader();
      if (!reader) throw new Error("Pas de reponse streamee.");
      const decoder = new TextDecoder();
      let buf = "";
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const parts = buf.split("\n");
        buf = parts.pop() || "";
        for (const part of parts) {
          if (!part.trim()) continue;
          try { handleEvent(JSON.parse(part) as StreamEvent); } catch { /* skip */ }
        }
      }
      if (buf.trim()) {
        try { handleEvent(JSON.parse(buf) as StreamEvent); } catch { /* skip */ }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") { toast.info("Generation annulee."); }
      else { const msg = err instanceof Error ? err.message : String(err); setError(msg); toast.error(msg); }
    } finally { setGenerating(false); abortRef.current = null; }
  }, [paperText, provider, model, handleEvent]);

  const handleCancel = useCallback(() => { abortRef.current?.abort(); }, []);
  const toggleFile = (f: string) => setExpandedFiles((prev) => { const n = new Set(prev); if (n.has(f)) n.delete(f); else n.add(f); return n; });
  const copyToClipboard = async (text: string, file: string) => { await navigator.clipboard.writeText(text); setCopiedFile(file); setTimeout(() => setCopiedFile(null), 2000); };

  const downloadAll = () => {
    if (!plan) return;
    let content = "";
    if (plan.required_packages.length > 0) { content += "# === requirements.txt ===\n" + plan.required_packages.join("\n") + "\n\n"; }
    content += "# === config.yaml ===\n" + plan.config_yaml + "\n\n";
    for (const [f, c] of Object.entries(codes)) { content += `# === ${f} ===\n${c}\n\n`; }
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "paper2code_output.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const fileList = plan?.file_list.filter((f) => f.endsWith(".py")) || [];
  const progressPct = progress.total > 0 ? (progress.step / progress.total) * 100 : 0;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileCode2 className="h-7 w-7 text-primary" />
          Article &rarr; Code
        </h1>
        <p className="text-muted-foreground mt-1">
          Transformez un article scientifique en code Python reproductible.
          <br />
          <span className="text-xs">Inspire de Paper2Code (ICLR 2026)</span>
        </p>
      </div>

      {/* Input */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Article source
          </CardTitle>
          <CardDescription>Collez le texte complet d&apos;un article (methodologie, experiences, hyperparametres).</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label>Texte de l&apos;article</Label>
              <span className={`text-xs ${paperText.length > 50000 ? "text-red-500" : "text-muted-foreground"}`}>
                {paperText.length.toLocaleString()} caracteres
              </span>
            </div>
            <Textarea
              placeholder={"Collez ici le texte complet de l'article scientifique..."}
              value={paperText}
              onChange={(e) => setPaperText(e.target.value)}
              className="min-h-[200px] max-h-[400px] font-mono text-sm"
              disabled={generating}
            />
          </div>
          <Separator />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Fournisseur IA</Label>
              <Select value={provider} onValueChange={(v) => setProvider(v as AiProviderId)} disabled={generating}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FAST_PROVIDERS.map((p) => (
                    <SelectItem key={p} value={p}>{getProviderLabel(p)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Modele</Label>
              <Select value={model} onValueChange={setModel} disabled={generating}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-60">
                  {availableModels.length > 0
                    ? availableModels.map((m) => (
                        <SelectItem key={m} value={m}>
                          <span className="flex items-center gap-1.5">
                            {m}
                            {m.toLowerCase().includes("free") && <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3.5">FREE</Badge>}
                          </span>
                        </SelectItem>
                      ))
                    : <SelectItem value={model} disabled>Saisir manuellement</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!generating ? (
              <Button onClick={handleGenerate} disabled={paperText.length < 200} className="gap-2">
                <Sparkles className="h-4 w-4" /> Generer le code
              </Button>
            ) : (
              <Button variant="destructive" onClick={handleCancel} className="gap-2">
                <AlertCircle className="h-4 w-4" /> Annuler
              </Button>
            )}
            {Object.keys(codes).length > 0 && (
              <Button variant="outline" onClick={downloadAll} className="gap-2">
                <Download className="h-4 w-4" /> Telecharger
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      {generating && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3 mb-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm font-medium">{progress.message}</span>
            </div>
            <Progress value={progressPct} className="h-2" />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">Etape {progress.step}/{progress.total}</span>
              <span className="text-xs text-muted-foreground capitalize">{progress.stage}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && !generating && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800/50 dark:bg-red-950/20">
          <CardContent className="py-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300">Erreur</p>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {(plan || Object.keys(codes).length > 0) && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-lg">Resultats</CardTitle></CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start">
                <TabsTrigger value="plan" className="gap-1.5">
                  <ClipboardList className="h-3.5 w-3.5" /> Planification
                  {plan && <Badge variant="secondary" className="text-[9px] ml-1">OK</Badge>}
                </TabsTrigger>
                <TabsTrigger value="analyse" className="gap-1.5">
                  <GitBranch className="h-3.5 w-3.5" /> Analyse
                  {Object.keys(analyses).length > 0 && <Badge variant="secondary" className="text-[9px] ml-1">{Object.keys(analyses).length}/{fileList.length}</Badge>}
                </TabsTrigger>
                <TabsTrigger value="code" className="gap-1.5">
                  <Code2 className="h-3.5 w-3.5" /> Code
                  {Object.keys(codes).length > 0 && <Badge variant="secondary" className="text-[9px] ml-1">{Object.keys(codes).length}/{fileList.length}</Badge>}
                </TabsTrigger>
              </TabsList>

              {/* Plan Tab */}
              <TabsContent value="plan" className="mt-4">
                {plan && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Vue d&apos;ensemble</h3>
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 rounded-lg p-4 max-h-64 overflow-y-auto">{plan.overview}</div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Fichiers a generer</h3>
                      <div className="flex flex-wrap gap-2">{plan.file_list.map((f) => <Badge key={f} variant="outline" className="font-mono text-xs">{f}</Badge>)}</div>
                    </div>
                    {plan.required_packages.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold mb-2">Dependances</h3>
                        <div className="flex flex-wrap gap-2">{plan.required_packages.map((p) => <Badge key={p} variant="secondary" className="font-mono text-xs">{p}</Badge>)}</div>
                      </div>
                    )}
                    {plan.class_diagram && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-semibold">Architecture (Mermaid)</h3>
                          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => copyToClipboard(plan.class_diagram, "cd")}>
                            {copiedFile === "cd" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} Copier
                          </Button>
                        </div>
                        <pre className="text-xs bg-muted/50 rounded-lg p-4 overflow-x-auto max-h-80 overflow-y-auto">{plan.class_diagram}</pre>
                      </div>
                    )}
                    {plan.config_yaml && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-semibold">Configuration (config.yaml)</h3>
                          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => copyToClipboard(plan.config_yaml, "cy")}>
                            {copiedFile === "cy" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} Copier
                          </Button>
                        </div>
                        <pre className="text-xs bg-muted/50 rounded-lg p-4 overflow-x-auto max-h-60 overflow-y-auto">{plan.config_yaml}</pre>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Analyse Tab */}
              <TabsContent value="analyse" className="mt-4">
                {Object.keys(analyses).length === 0
                  ? <p className="text-sm text-muted-foreground text-center py-8">{generating ? "Analyse en cours..." : "L&apos;analyse apparaitra ici apres la planification."}</p>
                  : Object.entries(analyses).map(([file, content]) => (
                    <div key={file} className="border rounded-lg">
                      <button className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-muted/50 rounded-t-lg" onClick={() => toggleFile(file)}>
                        <span className="flex items-center gap-2">
                          {expandedFiles.has(file) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          <span className="font-mono text-sm font-medium">{file}</span>
                        </span>
                        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={(e) => { e.stopPropagation(); copyToClipboard(content, file); }}>
                          {copiedFile === file ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </button>
                      {expandedFiles.has(file) && <div className="border-t px-4 py-3 max-h-60 overflow-y-auto"><pre className="text-xs whitespace-pre-wrap text-muted-foreground">{content}</pre></div>}
                    </div>
                  ))}
              </TabsContent>

              {/* Code Tab */}
              <TabsContent value="code" className="mt-4">
                {Object.keys(codes).length === 0
                  ? <p className="text-sm text-muted-foreground text-center py-8">{generating ? "Generation en cours..." : "Le code apparaitra ici apres l&apos;analyse."}</p>
                  : Object.entries(codes).map(([file, code]) => (
                    <div key={file} className="border rounded-lg">
                      <button className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-muted/50 rounded-t-lg" onClick={() => toggleFile(file)}>
                        <span className="flex items-center gap-2">
                          {expandedFiles.has(file) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          <Play className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="font-mono text-sm font-medium">{file}</span>
                          <span className="text-xs text-muted-foreground">({code.split("\n").length} lignes)</span>
                        </span>
                        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={(e) => { e.stopPropagation(); copyToClipboard(code, file); }}>
                          {copiedFile === file ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} Copier
                        </Button>
                      </button>
                      {expandedFiles.has(file) && (
                        <div className="border-t bg-slate-950 dark:bg-slate-900 rounded-b-lg">
                          <pre className="text-xs p-4 overflow-x-auto max-h-[500px] overflow-y-auto text-slate-200"><code>{code}</code></pre>
                        </div>
                      )}
                    </div>
                  ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
