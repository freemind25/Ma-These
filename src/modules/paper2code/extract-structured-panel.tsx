"use client";

// ═══════════════════════════════════════════════════════════════
// ThesisFrame — ExtractStructuredDialog (chantier B)
// Extraction structurée de l'article PDF via /api/paper2code/extract-structured
// (Datalab Extract fast — schéma prédéfini serveur) : champs + citations
// + scores de confiance 1-5. Insertion du résumé structuré dans le
// texte source de « Article → Code ».
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  FileText,
  Loader2,
  Quote,
  Sparkles,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";

// ═══════════════════════════════════════════════════════════════
// Types (miroir de la réponse /api/paper2code/extract-structured)
// ═══════════════════════════════════════════════════════════════

interface ExtractedField {
  name: string;
  value: unknown;
  citation: string | null;
  score: number | null;
  reasoning: string | null;
}

interface ExtractResult {
  fields: ExtractedField[];
  missing: string[];
  scoreAverage: number | null;
  note: string;
}

const FIELD_LABELS: Record<string, string> = {
  titre: "Titre",
  auteurs: "Auteurs",
  objectif: "Objectif",
  methodologie: "Méthodologie",
  donnees: "Données",
  hyperparametres: "Hyperparamètres",
  resultats: "Résultats",
  limites: "Limites",
};

const FIELD_ORDER = ["titre", "auteurs", "objectif", "methodologie", "donnees", "hyperparametres", "resultats", "limites"];

function scoreBadge(score: number | null): { label: string; className: string } | null {
  if (score === null) return null;
  if (score >= 4) return { label: `Confiance élevée (${score}/5)`, className: "text-emerald-700 border-emerald-600/40" };
  if (score === 3) return { label: `Confiance moyenne (${score}/5)`, className: "text-amber-700 border-amber-600/40" };
  return { label: `Confiance faible (${score}/5)`, className: "text-red-700 border-red-600/40" };
}

/** Rend la valeur d'un champ (chaîne ou liste) en lignes lisibles. */
function renderValue(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((v) => String(v)).filter((v) => v.trim().length > 0);
  }
  const s = String(value ?? "").trim();
  return s ? [s] : [];
}

/** Reconstitue un bloc Markdown insérable dans le texte source. */
export function fieldsToMarkdown(result: ExtractResult): string {
  const lines: string[] = ["## Extraction structurée de l'article (Datalab)", ""];
  for (const name of FIELD_ORDER) {
    const f = result.fields.find((x) => x.name === name);
    if (!f) continue;
    const values = renderValue(f.value);
    if (values.length === 0) continue;
    lines.push(`**${FIELD_LABELS[name] ?? name}** :`);
    if (values.length === 1 && !Array.isArray(f.value)) lines.push(values[0]);
    else for (const v of values) lines.push(`- ${v}`);
    lines.push("");
  }
  if (result.scoreAverage !== null) {
    lines.push(`_Score moyen de confiance : ${result.scoreAverage.toFixed(1)}/5 (extraction Datalab fast)._`);
  }
  return lines.join("\n");
}

export function ExtractStructuredDialog({
  open,
  onOpenChange,
  file,
  onInsert,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  file: File | null;
  onInsert: (markdown: string) => void;
}) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ExtractResult | null>(null);
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
      const res = await fetch("/api/paper2code/extract-structured", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      setResult(json.data as ExtractResult);
      toast.success("Extraction structurée terminée.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setRunning(false);
    }
  };

  const insert = () => {
    if (!result) return;
    onInsert(fieldsToMarkdown(result));
    toast.success("Résumé structuré inséré dans le texte source.");
    onOpenChange(false);
  };

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(fieldsToMarkdown(result));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ordered = result
    ? [...result.fields].sort((a, b) => FIELD_ORDER.indexOf(a.name) - FIELD_ORDER.indexOf(b.name))
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-primary" />
          Extraction structurée de l&apos;article
        </DialogTitle>
        <DialogDescription>
          Méthodologie, données, hyperparamètres et résultats extraits en champs avec citation
          source et score de confiance (Datalab, ≈ 6 $/1 000 pages — &gt; 50 pages : tarif accurate).
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-3 py-1">
        {/* Fichier source */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4 shrink-0" />
          <span className="truncate">{file?.name ?? "Aucun PDF importé"}</span>
        </div>

        {/* Lancement */}
        {!result && (
          <Button onClick={run} disabled={running || !file} className="gap-2 self-start">
            {running ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Extraction en cours (30-90 s)…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Lancer l&apos;extraction structurée
              </>
            )}
          </Button>
        )}

        {/* Erreur */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20 px-3 py-2">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Résultats */}
        {result && (
          <>
            <div className="flex items-center gap-2 flex-wrap text-xs">
              {result.scoreAverage !== null ? (
                <Badge variant="outline" className="border-primary/40">
                  Score moyen : {result.scoreAverage.toFixed(1)}/5
                </Badge>
              ) : (
                <Badge variant="outline">Scores indisponibles</Badge>
              )}
              {result.missing.length > 0 && (
                <Badge variant="outline" className="text-amber-700 border-amber-600/40">
                  {result.missing.length} champ(s) introuvable(s) dans l&apos;article
                </Badge>
              )}
              <span className="text-muted-foreground">{result.note.split(".")[0]}.</span>
            </div>
            <ScrollArea className="max-h-[46vh] pr-3">
              <div className="flex flex-col gap-3">
                {ordered.map((f) => {
                  const badge = scoreBadge(f.score);
                  const values = renderValue(f.value);
                  return (
                    <div key={f.name} className="rounded-lg border px-3 py-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{FIELD_LABELS[f.name] ?? f.name}</span>
                        {badge && <Badge variant="outline" className={`text-[10px] ${badge.className}`}>{badge.label}</Badge>}
                      </div>
                      <div className="mt-1.5 text-sm text-foreground/90 leading-snug">
                        {values.length > 1 ? (
                          <ul className="list-disc pl-4 space-y-0.5">
                            {values.map((v, i) => <li key={i}>{v}</li>)}
                          </ul>
                        ) : values.length === 1 ? (
                          <p>{values[0]}</p>
                        ) : (
                          <p className="italic text-muted-foreground">Valeur vide</p>
                        )}
                      </div>
                      {f.reasoning && (
                        <p className="mt-1 text-xs italic text-muted-foreground">{f.reasoning}</p>
                      )}
                      {f.citation && (
                        <p className="mt-1 flex items-start gap-1 text-[11px] text-muted-foreground">
                          <Quote className="h-3 w-3 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{f.citation}</span>
                        </p>
                      )}
                    </div>
                  );
                })}
                {result.fields.length === 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4" /> Aucun champ extrait — vérifiez le PDF.
                  </div>
                )}
              </div>
            </ScrollArea>
          </>
        )}
      </div>

      <DialogFooter className="gap-2 sm:justify-between">
        {result ? (
          <div className="flex gap-2">
            <Button size="sm" onClick={insert}>
              Insérer dans le texte source
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
      <Separator className="hidden" />
    </DialogContent>
    </Dialog>
  );
}
