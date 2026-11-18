"use client";

// ═══════════════════════════════════════════════════════════════
// ThesisFrame — JatsDialog (chantier C)
// Article PDF → JATS 1.2 Journal-Publishing XML via /api/datalab/jats
// (processeur publié « jats ») : verdict de vérification PASS/FAIL,
// métriques détaillées, aperçu XML + export .xml.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Download,
  FileCode2,
  Loader2,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

interface VerifierMetric {
  name?: string;
  status?: string;
  severity?: string;
}

interface JatsResult {
  jatsXml: string;
  verdict: string | null;
  finished: boolean | null;
  verifierMetrics: VerifierMetric[] | null;
  chars: number;
}

export function JatsDialog({
  open,
  onOpenChange,
  file,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  file: File | null;
}) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<JatsResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setResult(null);
      setError(null);
    }
  }, [open]);

  const run = async () => {
    if (!file) return;
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/datalab/jats", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      setResult(json.data as JatsResult);
      toast.success("Conversion JATS terminée.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setRunning(false);
    }
  };

  const download = () => {
    if (!result) return;
    const base = (file?.name ?? "article").replace(/\.pdf$/i, "");
    const blob = new Blob([result.jatsXml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${base}.jats.xml`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("XML JATS téléchargé.");
  };

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.jatsXml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const verdictPass = result?.verdict === "PASS";
  const blockingIssues = result?.verifierMetrics?.filter(
    (m) => m.severity !== "advisory" && m.status && m.status !== "pass"
  ) ?? [];

  return (
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <FileCode2 className="h-5 w-5 text-primary" />
          Article → XML JATS
        </DialogTitle>
        <DialogDescription>
          Conversion en JATS 1.2 Journal-Publishing XML (standard du publishing académique) avec
          verdict de vérification. ≈ 10 $/1 000 pages. Peut prendre plusieurs minutes.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-3 py-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileCode2 className="h-4 w-4 shrink-0" />
          <span className="truncate">{file?.name ?? "Aucun PDF importé"}</span>
        </div>

        {!result && (
          <Button onClick={run} disabled={running || !file} className="gap-2 self-start">
            {running ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Conversion JATS en cours (1-3 min)…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Convertir en JATS XML
              </>
            )}
          </Button>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20 px-3 py-2">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        {result && (
          <>
            {/* Verdict + métriques */}
            <div className="flex items-center gap-2 flex-wrap">
              {result.verdict ? (
                verdictPass ? (
                  <Badge className="bg-emerald-600 text-white gap-1">
                    <ShieldCheck className="h-3 w-3" /> Verdict : PASS
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="gap-1">
                    <XCircle className="h-3 w-3" /> Verdict : {result.verdict}
                  </Badge>
                )
              ) : (
                <Badge variant="outline">Verdict indisponible</Badge>
              )}
              <Badge variant="outline">{(result.chars / 1024).toFixed(1)} Ko XML</Badge>
              {blockingIssues.length > 0 && (
                <Badge variant="outline" className="text-amber-700 border-amber-600/40">
                  {blockingIssues.length} contrôle(s) bloquant(s)
                </Badge>
              )}
            </div>
            {blockingIssues.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20 px-3 py-2">
                <ul className="list-disc pl-4 text-xs text-amber-800 dark:text-amber-300 space-y-0.5">
                  {blockingIssues.map((m, i) => (
                    <li key={i}>{m.name ?? "contrôle"} : {m.status}</li>
                  ))}
                </ul>
              </div>
            )}
            {/* Aperçu XML */}
            <pre className="max-h-[40vh] overflow-y-auto rounded-lg border bg-muted/40 p-3 text-[11px] leading-relaxed font-mono whitespace-pre-wrap break-all">
              {result.jatsXml.slice(0, 8_000)}
              {result.jatsXml.length > 8_000 ? "\n… (aperçu tronqué — téléchargez le XML complet)" : ""}
            </pre>
          </>
        )}
      </div>

      <DialogFooter className="gap-2 sm:justify-between">
        {result ? (
          <div className="flex gap-2">
            <Button size="sm" onClick={download}>
              <Download className="h-4 w-4" /> Télécharger .xml
            </Button>
            <Button size="sm" variant="outline" onClick={copy}>
              {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              Copier
            </Button>
          </div>
        ) : (
          <span />
        )}
        <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>
          Fermer
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
