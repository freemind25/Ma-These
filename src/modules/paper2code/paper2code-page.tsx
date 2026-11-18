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
  Upload,
  CheckCircle2,
  X,
  Wand2,
} from "lucide-react";
import { ExtractStructuredDialog } from "./extract-structured-panel";
import { JatsDialog } from "./jats-panel";
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

// Fournisseurs proposés dans le sélecteur du module. « zai » en tête :
// natif sandbox sans clé (SDK z-ai-web-dev-sdk) — le choix le plus
// immédiat dans l'environnement de prévisualisation ; en app Tauri le
// SDK est absent et la route renverra l'erreur explicite correspondante.
const FAST_PROVIDERS: AiProviderId[] = ["zai", "groq", "google", "openrouter", "github", "openai"];

// Plafond d'import PDF — même règle que la maison (MAX_IMPORT_BYTES,
// src/lib/articles/extraction.ts l.10 = 50 Mo). Constante locale : ne PAS
// importer extraction.ts dans le bundle client (parseurs dynamiques serveur).
const MAX_PDF_BYTES = 50 * 1024 * 1024;

/**
 * Traduit les erreurs de transport brutes du fetch/reader en messages
 * actionnables. Messages observés selon runtime : « Error in input
 * stream » (Bun), « Failed to fetch » (Chromium/WebView2), « Load failed »
 * (WebKit), « terminated » (undici) — tous = coupure de la connexion au
 * serveur pendant la génération, majoritairement transitoire.
 */
function translateTransportError(msg: string): string {
  if (/input stream|failed to fetch|network error|load failed|terminated|socket|econn/i.test(msg)) {
    return (
      "La connexion au serveur s'est interrompue pendant la génération (erreur de transport). " +
      "Réessayez : les coupures sont généralement transitoires. Si l'erreur revient systématiquement, " +
      "vérifiez votre connexion réseau ou changez de fournisseur IA dans les réglages."
    );
  }
  return msg;
}

/**
 * Hiccup réseau ISOLÉ sur une requête de polling (timeout 10 s, fetch
 * raté) : on retente au tick suivant sans rien casser. À distinguer des
 * erreurs fatales (404 job perdu, 400) qui interrompent le suivi.
 */
class TransportPollError extends Error {}

/** Réponse de polling de /api/paper2code/generate (GET ?jobId&cursor). */
interface PollResponse {
  status: "running" | "done" | "error" | "cancelled";
  events: StreamEvent[];
  cursor: number;
  error?: string;
}

interface PdfImportInfo {
  name: string;
  pages: number;
  chars: number;
  warnings: string[];
  engine?: string;
}

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
  // Contrôle du job courant : id côté serveur + drapeau d'arrêt local.
  // Le suivi se fait par POLLING (requêtes courtes) — pas de flux long,
  // coupable par les passerelles/proxies (~50 s observé en prévisualisation).
  const runCtlRef = useRef<{ jobId: string | null; stopped: boolean } | null>(null);
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      runCtlRef.current = null;
    };
  }, []);
  const [importingPdf, setImportingPdf] = useState(false);
  const [pdfImport, setPdfImport] = useState<PdfImportInfo | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  // Fichier conservé pour les traitements Datalab (extraction structurée / JATS)
  const pdfFileRef = useRef<File | null>(null);
  const [extractOpen, setExtractOpen] = useState(false);
  const [jatsOpen, setJatsOpen] = useState(false);

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
    runCtlRef.current = { jobId: null, stopped: false };

    try {
      // 1) Démarrage : POST court → { jobId }. Le pipeline tourne en tâche
      // de fond côté serveur, découplé de toute connexion HTTP longue.
      const res = await fetch("/api/paper2code/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paperText, provider, model }),
      });
      const data = (await res.json()) as { jobId?: string; error?: string };
      if (!res.ok || !data.jobId) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      runCtlRef.current.jobId = data.jobId;

      // 2) Suivi par POLLING : chaque requête est courte et indépendante —
      // une coupure réseau ou de proxy entre deux ticks ne perd rien (le
      // job continue côté serveur, le prochain tick rattrape les events).
      let cursor = 0;
      let consecutiveFailures = 0;
      const MAX_POLL_FAILURES = 8; // ≈ 12 s de coupure tolérée
      while (true) {
        if (!mountedRef.current || runCtlRef.current?.stopped) return;
        await new Promise((r) => setTimeout(r, 1500));
        if (!mountedRef.current || runCtlRef.current?.stopped) return;

        let resp: PollResponse;
        try {
          const pr = await fetch(
            `/api/paper2code/generate?jobId=${encodeURIComponent(data.jobId)}&cursor=${cursor}`,
            { signal: AbortSignal.timeout(10_000) }
          );
          if (!pr.ok) {
            const pe = (await pr.json().catch(() => ({}))) as { error?: string };
            if (pr.status === 404) {
              // Job perdu (redémarrage serveur) : fiable et définitif.
              throw new Error(pe.error || "Tâche de génération introuvable (serveur redémarré ?). Relancez la génération.");
            }
            // 5xx/429 etc. : hiccup serveur isolé → retenter.
            throw new TransportPollError();
          }
          resp = (await pr.json()) as PollResponse;
          consecutiveFailures = 0;
        } catch (pollErr) {
          const name = (pollErr as Error).name;
          const transient =
            pollErr instanceof TransportPollError || name === "TimeoutError" || name === "AbortError";
          if (!transient) throw pollErr;
          consecutiveFailures++;
          if (consecutiveFailures >= MAX_POLL_FAILURES) {
            throw new Error(
              "Suivi de la génération perdu : le serveur ne répond plus depuis trop longtemps. " +
              "Vérifiez que l'application tourne toujours, puis relancez la génération."
            );
          }
          continue; // hiccup isolé → le prochain tick rattrape
        }

        for (const ev of resp.events) {
          handleEvent(ev);
        }
        cursor = resp.cursor;
        if (resp.status !== "running") return; // done | error | cancelled — UI déjà mise à jour par les events
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") { toast.info("Generation annulee."); }
      else {
        const raw = err instanceof Error ? err.message : String(err);
        const msg = translateTransportError(raw);
        setError(msg);
        toast.error(msg);
      }
    } finally { setGenerating(false); runCtlRef.current = null; }
  }, [paperText, provider, model, handleEvent]);

  const handleCancel = useCallback(() => {
    const ctl = runCtlRef.current;
    if (!ctl) return;
    ctl.stopped = true;
    // Best effort : prévenir le serveur pour libérer le pipeline (les
    // événements déjà produits restent visibles).
    if (ctl.jobId) {
      fetch(`/api/paper2code/generate?jobId=${encodeURIComponent(ctl.jobId)}`, {
        method: "DELETE",
        signal: AbortSignal.timeout(5000),
      }).catch(() => { /* best effort */ });
    }
    toast.info("Generation annulee.");
  }, []);
  const toggleFile = (f: string) => setExpandedFiles((prev) => { const n = new Set(prev); if (n.has(f)) n.delete(f); else n.add(f); return n; });
  const copyToClipboard = async (text: string, file: string) => { await navigator.clipboard.writeText(text); setCopiedFile(file); setTimeout(() => setCopiedFile(null), 2000); };

  const handlePdfFile = useCallback(async (file: File) => {
    if (importingPdf) return;
    const isPdf = file.name.toLowerCase().endsWith(".pdf") || file.type === "application/pdf";
    if (!isPdf) {
      toast.error(`Format non pris en charge : « ${file.name} ». Ce module accepte uniquement un fichier PDF.`);
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      toast.error(`Fichier trop volumineux : ${(file.size / 1024 / 1024).toFixed(1)} Mo (maximum 50 Mo).`);
      return;
    }
    setImportingPdf(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/paper2code/extract-pdf", { method: "POST", body: fd });
      const data = (await res.json()) as { text?: string; pages?: number; chars?: number; warnings?: string[]; engine?: string; error?: string };
      if (!res.ok || !data.text) {
        toast.error(data.error || `HTTP ${res.status}`);
        return;
      }
      setPaperText(data.text);
      pdfFileRef.current = file;
      setPdfImport({ name: file.name, pages: data.pages || 0, chars: data.chars || data.text.length, warnings: data.warnings || [], engine: data.engine });
      toast.success(`PDF importe : ${data.pages ? `${data.pages} page(s), ` : ""}${(data.chars ?? data.text.length).toLocaleString()} caracteres${data.engine === "datalab" ? " (Datalab, haute fidelite)" : ""}.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Echec de l'import : ${msg}`);
    } finally {
      setImportingPdf(false);
    }
  }, [importingPdf]);

  const handlePdfDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handlePdfFile(file);
  }, [handlePdfFile]);

  const clearPdfImport = () => {
    setPdfImport(null);
    pdfFileRef.current = null;
  };

  const insertStructured = useCallback((markdown: string) => {
    setPaperText((t) => (t.trim() ? `${t}\n\n${markdown}` : markdown));
  }, []);

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
          <CardDescription>Importez un PDF d&apos;article ou collez le texte complet (methodologie, experiences, hyperparametres).</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Import PDF — zone de dépôt (drag & drop + clic) */}
          <div
            className={`relative flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed px-4 py-5 text-center cursor-pointer transition-colors ${
              dragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
            } ${importingPdf ? "pointer-events-none opacity-60" : ""}`}
            onDrop={handlePdfDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => pdfInputRef.current?.click()}
            role="button"
            aria-label="Importer un article PDF"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pdfInputRef.current?.click(); } }}
          >
            {importingPdf ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <p className="text-sm font-medium">Extraction du texte en cours...</p>
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm font-medium">Glissez-déposez l&apos;article PDF ici</p>
                <p className="text-xs text-muted-foreground">ou cliquez pour parcourir · PDF textuel, max 50 Mo</p>
              </>
            )}
            <input
              ref={pdfInputRef}
              type="file"
              className="hidden"
              accept=".pdf,application/pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePdfFile(file);
                e.target.value = "";
              }}
            />
          </div>

          {/* Import réussi : badge fichier + avertissements */}
          {pdfImport && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20 px-3 py-2">
                <span className="flex items-center gap-2 min-w-0">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-sm font-medium truncate" title={pdfImport.name}>{pdfImport.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{pdfImport.pages} page(s) · {pdfImport.chars.toLocaleString()} caracteres</span>
                </span>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0" onClick={clearPdfImport} aria-label="Retirer le fichier importé">
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
              {pdfImport.warnings.some((w) => w.startsWith("PDF partiellement")) && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20 px-3 py-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800 dark:text-amber-300">
                    {pdfImport.warnings.filter((w) => w.startsWith("PDF partiellement")).map((w, i) => <p key={i}>{w}</p>)}
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground">Texte extrait ci-dessous — relisez-le et corrigez-le si besoin avant la génération.</p>
              {/* Traitements Datalab sur le fichier importé (chantiers B & C) */}
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setExtractOpen(true)} disabled={generating}>
                  <Wand2 className="h-3.5 w-3.5" /> Extraction structurée
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setJatsOpen(true)} disabled={generating}>
                  <FileCode2 className="h-3.5 w-3.5" /> Article → XML JATS
                </Button>
                {pdfImport.engine === "datalab" && (
                  <span className="text-xs text-emerald-700 dark:text-emerald-400">
                    Import haute fidélité via Datalab — mise en page préservée.
                  </span>
                )}
              </div>
            </div>
          )}
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
              <Select
                value={provider}
                onValueChange={(v) => {
                  const next = v as AiProviderId;
                  setProvider(next);
                  // Réaligner le modèle : chaque fournisseur a sa liste
                  // (ex. zai → "default") — garder le modèle de l'ancien
                  // fournisseur casserait l'appel amont.
                  const nextModel = PROVIDER_MODELS[next]?.[0];
                  if (nextModel) setModel(nextModel);
                }}
                disabled={generating}
              >
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

      {/* Dialogues Datalab — extraction structurée (B) et JATS XML (C) */}
      <ExtractStructuredDialog
        open={extractOpen}
        onOpenChange={setExtractOpen}
        file={pdfFileRef.current}
        onInsert={insertStructured}
      />
      <JatsDialog
        open={jatsOpen}
        onOpenChange={setJatsOpen}
        file={pdfFileRef.current}
      />
    </div>
  );
}
