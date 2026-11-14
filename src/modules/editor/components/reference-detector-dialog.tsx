"use client";

// ═══════════════════════════════════════════════════════════════
// Ma Thèse — Détecteur de références dans le chapitre (v1.10.23)
// Scan le texte du chapitre via Scholar Sidekick (/api/detect) :
// détecte DOI, PMID, PMCID, arXiv, ISBN, ISSN ; résout chaque
// identifiant (/api/lookup) et propose l'insertion directe dans la
// bibliothèque de références ou la copie de la citation formatée.
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ScanSearch,
  Loader2,
  Plus,
  Check,
  Copy,
  ExternalLink,
  SearchX,
  AlertCircle,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ── Types ──

interface DetectedId {
  type: string;
  value: string;
}

interface ResolvedRow extends DetectedId {
  state: "pending" | "resolved" | "unresolved" | "error";
  title?: string;
  authors?: string;
  year?: number;
  journal?: string;
  doi?: string;
  url?: string;
  isbn?: string;
  added?: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  doi: "DOI",
  pmid: "PMID",
  pmcid: "PMCID",
  arxiv: "arXiv",
  isbn: "ISBN",
  issn: "ISSN",
  ads: "ADS bibcode",
};

function buildLookupId(type: string, value: string): string {
  if (type === "doi") return value;
  return `${type}:${value}`;
}

interface ReferenceDetectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Retourne le texte brut du chapitre au moment de l'ouverture */
  getText: () => string;
}

export function ReferenceDetectorDialog({ open, onOpenChange, getText }: ReferenceDetectorDialogProps) {
  const [rows, setRows] = useState<ResolvedRow[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const scan = useCallback(async () => {
    const text = getText();
    if (!text || text.trim().length < 3) {
      toast.error("Le chapitre est vide — rien à analyser");
      return;
    }
    setScanning(true);
    setScanned(false);
    setRows([]);
    try {
      const res = await fetch("/api/scholar-sidekick/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Échec du scan");
        return;
      }
      const ids = (json.data?.identifiers ?? []) as DetectedId[];
      if (ids.length === 0) {
        setScanned(true);
        return;
      }
      // Initialise les lignes puis résout séquentiellement (courtoisie API)
      setRows(ids.map((id) => ({ ...id, state: "pending" })));
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        try {
          const lres = await fetch("/api/scholar-sidekick/lookup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: buildLookupId(id.type, id.value) }),
          });
          const ljson = await lres.json();
          const rec = lres.ok ? (ljson.data?.result ?? null) : null;
          setRows((prev) => {
            const next = [...prev];
            if (rec) {
              next[i] = {
                ...next[i],
                state: "resolved",
                title: rec.title,
                authors: rec.authors?.map((a: { given?: string; family?: string }) => [a.given, a.family].filter(Boolean).join(" ")).filter(Boolean).join(" ; "),
                year: rec.issued?.year,
                journal: rec.container?.title,
                doi: rec.identifiers?.find((x: { type: string }) => x.type === "doi")?.value,
                url: rec.url,
                isbn: rec.identifiers?.find((x: { type: string }) => x.type === "isbn")?.value,
              };
            } else {
              next[i] = { ...next[i], state: lres.ok ? "unresolved" : "error" };
            }
            return next;
          });
        } catch {
          setRows((prev) => {
            const next = [...prev];
            next[i] = { ...next[i], state: "error" };
            return next;
          });
        }
      }
    } catch {
      toast.error("Erreur réseau lors du scan");
    } finally {
      setScanning(false);
      setScanned(true);
    }
  }, [getText]);

  // Scan automatique à l'ouverture
  useEffect(() => {
    if (open) {
      void scan();
    }
  }, [open, scan]);

  const handleAdd = useCallback(
    async (index: number) => {
      const row = rows[index];
      if (!row) return;
      const authors = row.authors?.trim();
      const payload: Record<string, unknown> = {
        type: row.type === "isbn" ? "book" : "article",
        // La référence de secours (identifiant) satisfait la contrainte min(1)
        authors: authors || `Identifiant ${TYPE_LABELS[row.type] ?? row.type} : ${row.value}`,
        title: row.title?.trim() || `${TYPE_LABELS[row.type] ?? row.type} ${row.value} (à compléter)`,
        ...(row.year ? { year: row.year } : {}),
        ...(row.journal ? { journal: row.journal } : {}),
        ...(row.doi ? { doi: row.doi } : {}),
        ...(row.isbn ? { isbn: row.isbn } : {}),
        ...(row.url ? { url: row.url } : {}),
        notes: `Détecté automatiquement dans le chapitre (${TYPE_LABELS[row.type] ?? row.type} : ${row.value}) — Scholar Sidekick`,
        source: "doi",
      };
      try {
        const res = await fetch("/api/references", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.error ?? "Échec de l'ajout à la bibliothèque");
          return;
        }
        setRows((prev) => {
          const next = [...prev];
          next[index] = { ...next[index], added: true };
          return next;
        });
        queryClient.invalidateQueries({ queryKey: ["references"] });
        toast.success("Référence ajoutée à la bibliothèque");
      } catch {
        toast.error("Erreur réseau lors de l'ajout");
      }
    },
    [rows, queryClient]
  );

  const handleCopyCitation = useCallback(
    async (index: number) => {
      const row = rows[index];
      if (!row) return;
      try {
        const res = await fetch("/api/scholar-sidekick/format", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: buildLookupId(row.type, row.value), style: "apa", lang: "fr-FR" }),
        });
        const json = await res.json();
        if (!res.ok || !json.data?.text) {
          toast.error(json.error ?? "Échec du formatage");
          return;
        }
        navigator.clipboard.writeText(json.data.text);
        setCopiedValue(row.value);
        setTimeout(() => setCopiedValue(null), 2000);
        toast.success("Citation APA copiée");
      } catch {
        toast.error("Erreur réseau lors du formatage");
      }
    },
    [rows]
  );

  const resolvedCount = rows.filter((r) => r.state === "resolved").length;
  const addedCount = rows.filter((r) => r.added).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanSearch className="h-5 w-5 text-primary" />
            Références détectées dans le chapitre
          </DialogTitle>
          <DialogDescription>
            Identifiants académiques (DOI, PMID, PMCID, arXiv, ISBN, ISSN) trouvés dans le texte.
            Résolvez-les et insérez-les directement dans votre bibliothèque de références.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => void scan()} disabled={scanning} className="gap-1.5">
            {scanning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ScanSearch className="h-3.5 w-3.5" />}
            {scanning ? "Analyse…" : "Re-scanner"}
          </Button>
          {rows.length > 0 && !scanning && (
            <span className="text-xs text-muted-foreground">
              {rows.length} identifiant(s) • {resolvedCount} résolu(s) • {addedCount} ajouté(s)
            </span>
          )}
        </div>

        <ScrollArea className="min-h-0 flex-1 max-h-[380px] pr-2">
          {scanning && rows.length === 0 && (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyse du chapitre en cours…
            </div>
          )}

          {!scanning && scanned && rows.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <SearchX className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Aucun identifiant académique détecté dans ce chapitre.
                <br />
                Les DOI, PMID, PMCID, arXiv, ISBN et ISSN sont reconnus automatiquement.
              </p>
            </div>
          )}

          <div className="space-y-2">
            {rows.map((row, i) => (
              <div key={`${row.type}:${row.value}`} className="rounded-lg border px-3 py-2 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-[10px]">{TYPE_LABELS[row.type] ?? row.type}</Badge>
                  <code className="text-xs font-mono">{row.value}</code>
                  {row.state === "pending" && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground ml-auto" />}
                  {row.state === "error" && <span className="text-xs text-muted-foreground ml-auto inline-flex items-center gap-1"><AlertCircle className="h-3 w-3" />non résolu</span>}
                  {row.state === "unresolved" && <span className="text-xs text-muted-foreground ml-auto">métadonnées introuvables</span>}
                </div>

                {row.state === "resolved" && (
                  <>
                    <div className="text-xs space-y-0.5">
                      {row.title && <p className="font-medium line-clamp-2">{row.title}</p>}
                      <p className="text-muted-foreground">
                        {[row.authors?.slice(0, 80), row.journal, row.year ? String(row.year) : ""].filter(Boolean).join(" • ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Button
                        variant={row.added ? "outline" : "default"}
                        size="sm"
                        className="h-7 gap-1.5 text-xs"
                        onClick={() => void handleAdd(i)}
                        disabled={row.added}
                      >
                        {row.added ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                        {row.added ? "Ajoutée" : "Ajouter aux références"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1.5 text-xs"
                        onClick={() => void handleCopyCitation(i)}
                      >
                        {copiedValue === row.value ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        Copier citation APA
                      </Button>
                      {(row.doi || row.url) && (
                        <a
                          href={row.doi ? `https://doi.org/${row.doi}` : row.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline ml-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Source
                        </a>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
