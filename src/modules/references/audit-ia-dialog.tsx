"use client";

// ═══════════════════════════════════════════════════════════════
// Ma Thèse — Dialogue « Audit IA » (v1.10.23)
// Anti-hallucination bibliographique via Scholar Sidekick :
// audite toute la bibliothèque (ou une bibliographie collée) et
// signalé par référence — matched / mismatch (DOI réel + titre
// inventé) / not_found / rétractations (Retraction Watch).
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShieldCheck,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertCircle,
  CircleDashed,
  ExternalLink,
  BookOpen,
  Library,
} from "lucide-react";
import { toast } from "sonner";

// ── Types (miroir de /api/scholar-sidekick/audit) ──

interface AuditEntry {
  index?: number;
  sourceKey?: string;
  verdict?: "matched" | "mismatch" | "ambiguous" | "not_found";
  confidence?: string;
  matched?: {
    title?: string;
    authors?: { family?: string; given?: string }[];
    container?: { title?: string };
    issued?: { year?: number };
    url?: string;
  } | null;
  mismatches?: { field?: string; claimed?: string; resolved?: string }[];
  retraction?: {
    isRetracted?: boolean;
    hasCorrections?: boolean;
    hasConcern?: boolean;
    notices?: { label?: string; url?: string }[];
  };
  raw?: string;
}

interface AuditReport {
  ok: boolean;
  format: string | null;
  entries: AuditEntry[];
  parseErrors: string[];
  truncated: number;
  summary: {
    total: number;
    matched: number;
    mismatch: number;
    ambiguous: number;
    not_found: number;
    not_checked: number;
    errored: number;
    retracted: number;
  };
  totalRefs: number;
  auditedRefs: number;
}

const VERDICT_META: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; badge: string; row: string }
> = {
  matched: { label: "Confirmée", icon: CheckCircle2, badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300", row: "" },
  mismatch: { label: "Fabrication probable", icon: XCircle, badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300", row: "bg-red-50/60 dark:bg-red-900/10" },
  ambiguous: { label: "Ambiguë", icon: AlertTriangle, badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300", row: "bg-amber-50/60 dark:bg-amber-900/10" },
  not_found: { label: "Introuvable", icon: CircleDashed, badge: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300", row: "" },
};

interface AuditIaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuditIaDialog({ open, onOpenChange }: AuditIaDialogProps) {
  const [source, setSource] = useState<"library" | "paste">("library");
  const [pasted, setPasted] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  const runAudit = useCallback(
    async (bibliography: string, formatHint?: "bibtex" | "ris" | "csl-json") => {
      setLoading(true);
      setReport(null);
      setExpanded(null);
      try {
        const res = await fetch("/api/scholar-sidekick/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bibliography, ...(formatHint ? { format: formatHint } : {}) }),
        });
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.error ?? "Échec de l'audit");
          return;
        }
        const data = json.data as AuditReport;
        setReport(data);
        if (data.summary.mismatch > 0) {
          toast.error(`${data.summary.mismatch} référence(s) avec fabrication probable détectée(s)`);
        } else if (data.summary.retracted > 0) {
          toast.warning(`${data.summary.retracted} référence(s) rétractée(s)`);
        } else {
          toast.success(`Audit terminé — ${data.summary.matched}/${data.summary.total} références confirmées`);
        }
      } catch {
        toast.error("Erreur réseau lors de l'audit");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleAuditLibrary = useCallback(async () => {
    try {
      const res = await fetch("/api/references/bibtex");
      if (!res.ok) {
        toast.error("Aucune référence dans la bibliothèque à auditer");
        return;
      }
      const bibtex = await res.text();
      await runAudit(bibtex, "bibtex");
    } catch {
      toast.error("Impossible de récupérer la bibliothèque");
    }
  }, [runAudit]);

  const handleAuditPasted = useCallback(() => {
    if (pasted.trim().length < 5) return;
    void runAudit(pasted);
  }, [pasted, runAudit]);

  const summary = report?.summary;
  const statCards = summary
    ? [
        { label: "Confirmées", value: summary.matched, cls: "text-emerald-600" },
        { label: "Fabrications probables", value: summary.mismatch, cls: "text-red-600" },
        { label: "Ambiguës", value: summary.ambiguous, cls: "text-amber-600" },
        { label: "Introuvables", value: summary.not_found, cls: "text-rose-600" },
        { label: "Rétractées", value: summary.retracted, cls: "text-orange-600" },
        {
          label: "Auditées",
          value: `${report.auditedRefs}/${report.totalRefs}`,
          cls: "text-muted-foreground",
        },
      ]
    : [];

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) setReport(null); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Audit IA anti-hallucination
          </DialogTitle>
          <DialogDescription>
            Vérifie chaque référence auprès de Scholar Sidekick : DOI réel + titre inventé,
            introuvables, ambiguïtés et rétractations (Retraction Watch + Crossref).
          </DialogDescription>
        </DialogHeader>

        <Tabs value={source} onValueChange={(v) => setSource(v as "library" | "paste")} className="flex flex-col gap-4 min-h-0">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="library" className="gap-1.5">
              <Library className="h-3.5 w-3.5" />
              Ma bibliothèque
            </TabsTrigger>
            <TabsTrigger value="paste" className="gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              Texte collé
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="mt-0 space-y-3">
            <p className="text-sm text-muted-foreground">
              Audite l&apos;intégralité de vos références bibliographiques (export BibTeX automatique).
              Pour une grande bibliothèque, l&apos;opération peut prendre jusqu&apos;à une minute.
            </p>
            <Button onClick={handleAuditLibrary} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              {loading ? "Audit en cours…" : "Lancer l'audit de la bibliothèque"}
            </Button>
          </TabsContent>

          <TabsContent value="paste" className="mt-0 space-y-3">
            <Textarea
              placeholder={"Collez une bibliographie (une référence par ligne ou bloc) :\nAspelmeyer M. Measured measurement. Nature Phys. 2009;5(1):11-12. doi:10.1038/nphys1170\nDoe J. A fabricated study about deep learning. J Fake Res. 2023. doi:10.1234/fake.2023.1\n\nFormats acceptés : texte brut, BibTeX, RIS, CSL-JSON (300 références max)"}
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              className="min-h-[130px] font-mono text-sm"
              disabled={loading}
            />
            <Button onClick={handleAuditPasted} disabled={loading || pasted.trim().length < 5} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              {loading ? "Audit en cours…" : "Auditer ce texte"}
            </Button>
          </TabsContent>
        </Tabs>

        {/* Résultats */}
        {report && (
          <div className="min-h-0 overflow-y-auto space-y-3 border-t pt-3 scrollbar-thin">
            {/* Bandeaux d'avertissement */}
            {report.truncated > 0 && (
              <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 dark:bg-amber-900/10 rounded-md px-3 py-2">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                {report.truncated} référence(s) au-delà de la capacité (300) n&apos;ont pas été auditées.
              </div>
            )}
            {report.parseErrors.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted rounded-md px-3 py-2">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {report.parseErrors.length} entrée(s) non parsée(s) — format {report.format ?? "auto"}.
              </div>
            )}

            {/* Cartes résumé */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {statCards.map((s) => (
                <div key={s.label} className="rounded-lg border p-2 text-center">
                  <div className={`text-lg font-bold ${s.cls}`}>{s.value}</div>
                  <div className="text-[10px] text-muted-foreground leading-tight">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Liste des verdicts */}
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
              {report.entries.map((entry, i) => {
                const verdict = entry.verdict ?? "not_found";
                const meta = VERDICT_META[verdict] ?? VERDICT_META.not_found;
                const VIcon = meta.icon;
                const isOpen = expanded === i;
                const authors = entry.matched?.authors?.map((a) => [a.given, a.family].filter(Boolean).join(" ")).filter(Boolean).join(", ");
                return (
                  <div
                    key={i}
                    className={`rounded-lg border px-3 py-2 cursor-pointer transition-colors ${meta.row}`}
                    onClick={() => setExpanded(isOpen ? null : i)}
                  >
                    <div className="flex items-start gap-2">
                      <VIcon className={`h-4 w-4 mt-0.5 shrink-0 ${
                        verdict === "matched" ? "text-emerald-600" :
                        verdict === "mismatch" ? "text-red-600" :
                        verdict === "ambiguous" ? "text-amber-600" : "text-muted-foreground"
                      }`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs line-clamp-2">{entry.raw ?? entry.sourceKey ?? `Référence ${entry.index ?? i + 1}`}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className={`text-[10px] h-4 ${meta.badge}`}>{meta.label}</Badge>
                          {entry.retraction?.isRetracted && (
                            <Badge variant="destructive" className="text-[10px] h-4">Rétractée</Badge>
                          )}
                          {entry.confidence && <span className="text-[10px] text-muted-foreground">{entry.confidence}</span>}
                        </div>
                      </div>
                    </div>
                    {isOpen && (
                      <div className="mt-2 ml-6 border-t pt-2 space-y-1 text-xs">
                        {entry.matched?.title && (
                          <p>
                            <span className="text-muted-foreground">Titre réel : </span>
                            <span className="text-emerald-700 dark:text-emerald-400">{entry.matched.title}</span>
                          </p>
                        )}
                        {authors && <p className="text-muted-foreground">Auteurs réels : {authors}</p>}
                        {entry.matched?.container?.title && (
                          <p className="text-muted-foreground">
                            Journal réel : {entry.matched.container.title}
                            {entry.matched.issued?.year ? ` (${entry.matched.issued.year})` : ""}
                          </p>
                        )}
                        {entry.mismatches && entry.mismatches.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            <span className="text-muted-foreground">Champs divergents :</span>
                            {entry.mismatches.slice(0, 8).map((m, k) => (
                              <Badge key={k} variant="destructive" className="text-[10px] h-4">{m.field ?? "champ"}</Badge>
                            ))}
                          </div>
                        )}
                        {entry.retraction?.notices?.map((n, k) => (
                          <p key={k} className="text-orange-600 font-medium">
                            ⚠ {n.label ?? "Notice de rétractation"}
                            {n.url && (
                              <a href={n.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 ml-1 text-blue-600 hover:underline">
                                <ExternalLink className="h-3 w-3" />voir
                              </a>
                            )}
                          </p>
                        ))}
                        {entry.matched?.url && (
                          <a href={entry.matched.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline">
                            <ExternalLink className="h-3 w-3" /> Enregistrement résolu
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
