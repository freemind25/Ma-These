"use client";

import { useState, useCallback } from "react";
import {
  FileText,
  Search,
  Loader2,
  Copy,
  Check,
  PlusCircle,
  ExternalLink,
  BookPlus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface ArxivEntry {
  arxivId: string;
  url: string;
  pdfUrl: string;
  title: string;
  authors: string[];
  abstract: string;
  published: string;
  primaryCategory: string;
  categories: string[];
  doi?: string;
  journalRef?: string;
  bibtex: string;
}

export function ArxivSearchSection() {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"relevance" | "submittedDate">("relevance");
  const [entries, setEntries] = useState<ArxivEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [start, setStart] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);

  const runSearch = useCallback(
    async (offset: number) => {
      const q = query.trim();
      if (q.length < 2) return;
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `/api/arxiv/search?q=${encodeURIComponent(q)}&start=${offset}&max=15&sort=${sort}`
        );
        const data = await res.json();
        if (!res.ok || data.error) {
          setError(data.error || `HTTP ${res.status}`);
          return;
        }
        setEntries((prev) =>
          offset === 0 ? data.entries : [...prev, ...data.entries]
        );
        setTotal(data.total);
        setStart(offset);
        setSearched(true);
      } catch {
        setError("Recherche impossible — réseau indisponible");
      } finally {
        setLoading(false);
      }
    },
    [query, sort]
  );

  const copyBibtex = useCallback(
    async (entry: ArxivEntry) => {
      try {
        await navigator.clipboard.writeText(entry.bibtex);
        setCopiedId(entry.arxivId);
        setTimeout(() => setCopiedId(null), 2000);
        toast({ title: "BibTeX copié", description: entry.title.slice(0, 60) + "…" });
      } catch {
        toast({
          title: "Copie impossible",
          description: "Le presse-papiers est indisponible",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  const addToReferences = useCallback(
    async (entry: ArxivEntry) => {
      setAddingId(entry.arxivId);
      try {
        const keyMatch = entry.bibtex.match(/@article\{([^,]+),/);
        const res = await fetch("/api/references", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "article",
            authors: entry.authors.join("; "),
            title: entry.title,
            year: Number(entry.published.slice(0, 4)) || undefined,
            journal: `arXiv preprint arXiv:${entry.arxivId}`,
            url: entry.url,
            abstract: entry.abstract,
            keywords: entry.categories.slice(0, 6).join(", "),
            bibtexKey: keyMatch ? keyMatch[1] : undefined,
            doi: entry.doi,
            source: "arxiv",
          }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || data.error) {
          toast({
            title: "Ajout impossible",
            description: data?.error || `HTTP ${res.status}`,
            variant: "destructive",
          });
          return;
        }
        setAddedIds((prev) => new Set(prev).add(entry.arxivId));
        toast({
          title: "Référence ajoutée",
          description: entry.title.slice(0, 60) + "…",
        });
      } catch {
        toast({
          title: "Ajout impossible",
          description: "Réseau indisponible",
          variant: "destructive",
        });
      } finally {
        setAddingId(null);
      }
    },
    [toast]
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Recherche arXiv en direct
          <Badge variant="outline" className="text-[10px]">
            prépublications · Open Access
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barre de recherche */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") runSearch(0);
              }}
              placeholder="Ex. : smart city machine learning, urban simulation agent-based…"
              className="pl-9"
            />
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as "relevance" | "submittedDate")}>
            <SelectTrigger className="w-auto min-w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Pertinence</SelectItem>
              <SelectItem value="submittedDate">Plus récents</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => runSearch(0)} disabled={loading || query.trim().length < 2}>
            {loading ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Search className="h-4 w-4 mr-1" />
            )}
            Rechercher
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Astuce : mettez une expression entre guillemets pour une recherche exacte
          (ex. &quot;digital twin urban planning&quot;).
        </p>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {/* Résultats */}
        {entries.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              {total} résultat{total !== 1 ? "s" : ""} sur arXiv — affichage{" "}
              {start + 1}–{Math.min(start + entries.length, total)}
            </p>
            <div className="max-h-[480px] overflow-y-auto rounded-lg border divide-y scrollbar-thin">
              {entries.map((entry) => {
                const added = addedIds.has(entry.arxivId);
                const isExpanded = expanded === entry.arxivId;
                return (
                  <div key={entry.arxivId} className="p-3 space-y-2 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <a
                        href={entry.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium leading-snug hover:underline"
                      >
                        {entry.title}
                      </a>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap mt-1">
                        {entry.published.slice(0, 10)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {entry.authors.join(", ")}
                    </p>

                    {isExpanded ? (
                      <div className="text-xs leading-relaxed text-muted-foreground space-y-1">
                        <p>{entry.abstract}</p>
                        <button
                          className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                          onClick={() => setExpanded(null)}
                        >
                          <ChevronUp className="h-3 w-3" />
                          Réduire
                        </button>
                      </div>
                    ) : (
                      <button
                        className="text-xs text-muted-foreground line-clamp-2 text-left leading-relaxed hover:text-foreground"
                        onClick={() => setExpanded(entry.arxivId)}
                      >
                        {entry.abstract}
                        <span className="inline-flex items-center gap-1 text-[11px] text-primary ml-1">
                          <ChevronDown className="h-3 w-3 inline" />
                          plus
                        </span>
                      </button>
                    )}

                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="secondary" className="text-[10px]">
                        {entry.primaryCategory}
                      </Badge>
                      {entry.categories.slice(1, 4).map((c) => (
                        <Badge key={c} variant="outline" className="text-[10px]">
                          {c}
                        </Badge>
                      ))}
                      {entry.journalRef && (
                        <span className="text-[10px] text-muted-foreground">
                          ↳ {entry.journalRef}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      <Button
                        size="sm"
                        variant={added ? "secondary" : "default"}
                        className="h-7 text-xs"
                        disabled={added || addingId === entry.arxivId}
                        onClick={() => addToReferences(entry)}
                      >
                        {addingId === entry.arxivId ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : added ? (
                          <Check className="h-3 w-3 mr-1" />
                        ) : (
                          <PlusCircle className="h-3 w-3 mr-1" />
                        )}
                        {added ? "Ajoutée" : "Ajouter aux références"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => copyBibtex(entry)}
                      >
                        {copiedId === entry.arxivId ? (
                          <Check className="h-3 w-3 mr-1" />
                        ) : (
                          <Copy className="h-3 w-3 mr-1" />
                        )}
                        BibTeX
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        asChild
                      >
                        <a href={entry.pdfUrl} target="_blank" rel="noopener noreferrer">
                          <BookPlus className="h-3 w-3 mr-1" />
                          PDF
                        </a>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            {start + entries.length < total && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  onClick={() => runSearch(start + entries.length)}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <ExternalLink className="h-4 w-4 mr-1 rotate-[-45deg]" />
                  )}
                  Charger plus
                </Button>
              </div>
            )}
          </div>
        )}

        {searched && !loading && entries.length === 0 && !error && (
          <p className="text-sm text-muted-foreground">
            Aucun résultat arXiv pour cette requête.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
