"use client";

// ═══════════════════════════════════════════════════════════════
// Ma Thèse — Panneau « Styles CSL » (v1.10.23)
// DOI, PMID, PMCID, arXiv, ISBN, ISSN, bibcode ADS → citation
// formatée dans n'importe quel style CSL (10 000+), via Scholar
// Sidekick. Export BibTeX / RIS / CSL-JSON / EndNote XML / CSV.
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookMarked,
  Loader2,
  Copy,
  Check,
  Download,
  Search,
  ListChecks,
} from "lucide-react";
import { toast } from "sonner";

// ── Styles populaires proposés d'office (bundled upstream) ──

const POPULAR_STYLES: { id: string; label: string }[] = [
  { id: "apa", label: "APA 7e édition" },
  { id: "vancouver", label: "Vancouver" },
  { id: "ieee", label: "IEEE" },
  { id: "american-medical-association", label: "AMA (11e éd.)" },
  { id: "chicago-author-date", label: "Chicago (auteur-date)" },
  { id: "harvard-cite-them-right", label: "Harvard" },
  { id: "nature", label: "Nature" },
  { id: "bmj", label: "BMJ" },
  { id: "the-lancet", label: "The Lancet" },
  { id: "cell", label: "Cell" },
  { id: "elsevier-harvard", label: "Elsevier (Harvard)" },
  { id: "modern-language-association", label: "MLA 9e" },
];

const EXPORT_FORMATS: { value: string; label: string }[] = [
  { value: "bibtex", label: "BibTeX (.bib)" },
  { value: "ris", label: "RIS (.ris)" },
  { value: "csl-json", label: "CSL-JSON (.json)" },
  { value: "endnote-xml", label: "EndNote XML (.xml)" },
  { value: "csv", label: "CSV (.csv)" },
  { value: "txt", label: "Texte (.txt)" },
];

interface CslStyle {
  id: string;
  title: string;
  titleShort?: string;
  engineSupported?: boolean;
}

interface FormatResult {
  text?: string;
  html?: string;
  items?: {
    id?: string;
    title?: string;
    authors?: { family?: string; given?: string }[];
    container?: { title?: string };
    issued?: { year?: number };
    url?: string;
  }[];
  warnings?: unknown[];
  meta?: { resolved?: number; errored?: number; notFound?: number };
}

export function CslStylesPanel() {
  const [identifiers, setIdentifiers] = useState("");
  const [style, setStyle] = useState("apa");
  const [styleQuery, setStyleQuery] = useState("");
  const [styleResults, setStyleResults] = useState<CslStyle[]>([]);
  const [stylesLoading, setStylesLoading] = useState(false);
  const [formatting, setFormatting] = useState(false);
  const [result, setResult] = useState<FormatResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState("bibtex");
  const [exporting, setExporting] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Recherche de styles — debounced
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      setStylesLoading(true);
      try {
        const res = await fetch(`/api/scholar-sidekick/styles?q=${encodeURIComponent(styleQuery)}&limit=40`);
        const json = await res.json();
        if (res.ok) setStyleResults(json.data?.styles ?? []);
        else setStyleResults([]);
      } catch {
        setStyleResults([]);
      } finally {
        setStylesLoading(false);
      }
    }, 300);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [styleQuery]);

  const selectedLabel = POPULAR_STYLES.find((s) => s.id === style)?.label
    ?? styleResults.find((s) => s.id === style)?.title
    ?? style;

  const handleFormat = useCallback(async () => {
    if (identifiers.trim().length < 3) return;
    setFormatting(true);
    setResult(null);
    try {
      const res = await fetch("/api/scholar-sidekick/format", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: identifiers, style, lang: "fr-FR", output: "text" }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Échec du formatage");
        return;
      }
      setResult(json.data as FormatResult);
      const meta = json.data?.meta ?? {};
      if (meta.errored > 0 || meta.notFound > 0) {
        toast.warning(`${meta.notFound ?? 0} identifiant(s) non résolu(s), ${meta.errored ?? 0} en erreur`);
      } else {
        toast.success("Citations formatées");
      }
    } catch {
      toast.error("Erreur réseau lors du formatage");
    } finally {
      setFormatting(false);
    }
  }, [identifiers, style]);

  const handleCopy = useCallback(() => {
    if (!result?.text) return;
    navigator.clipboard.writeText(result.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  const handleExport = useCallback(async () => {
    if (identifiers.trim().length < 3) return;
    setExporting(true);
    try {
      const res = await fetch("/api/scholar-sidekick/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: identifiers, format: exportFormat }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Échec de l'export");
        return;
      }
      const text = json.data?.text ?? "";
      if (!text) {
        toast.error("Export vide");
        return;
      }
      const ext = exportFormat === "bibtex" ? "bib" : exportFormat === "csl-json" ? "json" : exportFormat === "endnote-xml" ? "xml" : exportFormat === "txt" ? "txt" : exportFormat;
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `references.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Export téléchargé");
    } catch {
      toast.error("Erreur réseau lors de l'export");
    } finally {
      setExporting(false);
    }
  }, [identifiers, exportFormat]);

  const idCount = identifiers.split("\n").filter((l) => l.trim().length > 2).length;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Entrée */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <BookMarked className="h-4 w-4 text-primary" />
            Identifiants bibliographiques
          </CardTitle>
          <CardDescription>
            Collez un DOI, PMID, PMCID, arXiv, ISBN, ISSN ou bibcode ADS par ligne
            (liens doi.org acceptés). Résolution Crossref/PubMed automatique.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder={"10.1038/nphys1170\nPMID: 23456789\narXiv:1706.03762\nhttps://doi.org/10.1109/5.771073"}
            value={identifiers}
            onChange={(e) => setIdentifiers(e.target.value)}
            className="min-h-[140px] font-mono text-sm"
          />

          {/* Sélecteur de style */}
          <div className="space-y-2">
            <Label>Style de citation (10 000+ styles CSL)</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choisir un style" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  <div className="px-2 pb-2 sticky top-0 bg-popover">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        value={styleQuery}
                        onChange={(e) => setStyleQuery(e.target.value)}
                        placeholder="Rechercher parmi 10 000+ styles…"
                        className="h-8 pl-7 text-xs"
                      />
                    </div>
                  </div>
                  {stylesLoading && (
                    <div className="flex items-center justify-center py-3">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                  {!stylesLoading && styleQuery.length >= 2 && styleResults.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-3">Aucun style trouvé</p>
                  )}
                  {styleQuery.length < 2 && (
                    <>
                      {POPULAR_STYLES.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                      ))}
                    </>
                  )}
                  {styleQuery.length >= 2 && styleResults.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.titleShort ?? s.title}
                      {!s.engineSupported && <span className="ml-1 text-[10px] text-muted-foreground">(approx.)</span>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 text-sm text-muted-foreground px-1">
                <Badge variant="secondary" className="text-xs">Style : {selectedLabel}</Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {idCount} identifiant(s) • Max 100 par lot
            </span>
            <Button onClick={handleFormat} disabled={formatting || idCount === 0} className="gap-2">
              {formatting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ListChecks className="h-4 w-4" />}
              {formatting ? "Formatage…" : "Formater"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Résultat */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Citations formatées</CardTitle>
          <CardDescription>
            Style « {selectedLabel} » — copiez le texte ou exportez dans votre gestionnaire de références.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!result && (
            <div className="text-sm text-muted-foreground py-8 text-center">
              Collez vos identifiants et choisissez un style, puis cliquez sur « Formater ».
            </div>
          )}
          {result && (
            <>
              <div className="rounded-lg border bg-muted/30 p-3 text-sm whitespace-pre-wrap max-h-[220px] overflow-y-auto scrollbar-thin">
                {result.text}
              </div>
              {Array.isArray(result.warnings) && result.warnings.length > 0 && (
                <p className="text-xs text-amber-600">{result.warnings.length} avertissement(s) — vérifiez les identifiants ambigus.</p>
              )}
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5 self-start" disabled={!result.text}>
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copié" : "Copier"}
                </Button>
                <div className="flex items-center gap-2">
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger className="w-[220px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPORT_FORMATS.map((f) => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting} className="gap-1.5">
                    {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                    Exporter
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
