"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  FileSearch,
  Clock,
  History,
  X,
  Sparkles,
  BookOpen,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Info,
  AlertCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

interface SearchResult {
  chapterId: string;
  chapterNumber: number;
  chapterTitle: string;
  romanNumeral: string | null;
  thesisTitle: string;
  thesisAuthor: string;
  snippet: string;
  score: number;
  wordCount: number;
  status: string;
  updatedAt: string;
}

interface ChapterOption {
  id: string;
  title: string;
  romanNumeral: string | null;
  number: number;
}

interface SearchMeta {
  count: number;
  totalIndexed: number;
  totalWords: number;
  lastIndexUpdate: string | null;
}

interface SearchResponse {
  data: SearchResult[];
  meta: SearchMeta;
}

// ═══════════════════════════════════════
// Constants
// ═══════════════════════════════════════

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  not_started: { label: "Non commencé", color: "bg-muted text-muted-foreground" },
  in_progress: { label: "En cours", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" },
  draft: { label: "Brouillon", color: "bg-secondary text-secondary-foreground" },
  review: { label: "En révision", color: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400" },
  completed: { label: "Terminé", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" },
};

const MAX_HISTORY = 15;

// ═══════════════════════════════════════
// Helpers
// ═══════════════════════════════════════

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;

  // Parse terms (ignore operators)
  const terms = query
    .replace(/\b(NOT|AND|OR)\b/gi, "")
    .split(/\s+/)
    .filter((t) => t.length > 0);

  if (terms.length === 0) return text;

  // Build a single regex pattern for all terms
  const pattern = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const regex = new RegExp(`(${pattern})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, i) => {
    const isMatch = terms.some((t) => part.toLowerCase() === t.toLowerCase());
    if (isMatch) {
      return (
        <mark
          key={i}
          className="bg-amber-200 dark:bg-amber-800/60 text-foreground rounded-sm px-0.5"
        >
          {part}
        </mark>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function formatScore(score: number): string {
  if (score >= 100) return "Très pertinent";
  if (score >= 50) return "Pertinent";
  if (score >= 20) return "Partiellement pertinent";
  return "Peu pertinent";
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ═══════════════════════════════════════
// Main component
// ═══════════════════════════════════════

export function RecherchePleinTextePage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [chapterFilter, setChapterFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [advancedMode, setAdvancedMode] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input (300ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Fetch stats (no query)
  const { data: statsData, isLoading: statsLoading } = useQuery<SearchResponse>({
    queryKey: ["search-stats"],
    queryFn: () => fetch("/api/search?q=").then((r) => r.json()),
    staleTime: 60_000,
  });

  // Fetch chapters for filter dropdown
  const { data: thesisData } = useQuery({
    queryKey: ["thesis-for-search"],
    queryFn: () =>
      fetch("/api/thesis")
        .then((r) => r.json())
        .then((j) => j.data?.[0] || null),
  });

  const chapters = useMemo<ChapterOption[]>(() => {
    if (!thesisData?.chapters) return [];
    return thesisData.chapters.map(
      (ch: { id: string; title: string; romanNumeral?: string | null; number: number }) => ({
        id: ch.id,
        title: ch.title,
        romanNumeral: ch.romanNumeral || null,
        number: ch.number,
      })
    );
  }, [thesisData]);

  // Build search params
  const searchParams = useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (chapterFilter && chapterFilter !== "all") params.set("chapterId", chapterFilter);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    return params.toString();
  }, [debouncedQuery, chapterFilter, dateFrom, dateTo]);

  // Fetch search results
  const {
    data: searchData,
    isLoading: searchLoading,
    isFetching: searchFetching,
  } = useQuery<SearchResponse>({
    queryKey: ["search", searchParams],
    queryFn: () =>
      fetch(`/api/search?${searchParams}`).then((r) => r.json()),
    enabled: !!debouncedQuery.trim(),
  });

  // Add to search history
  const addToHistory = useCallback(
    (term: string) => {
      if (!term.trim()) return;
      setSearchHistory((prev) => {
        const filtered = prev.filter((h) => h !== term);
        return [term, ...filtered].slice(0, MAX_HISTORY);
      });
    },
    []
  );

  // Execute search on Enter and save to history
  const handleSearch = useCallback(() => {
    if (query.trim()) {
      addToHistory(query.trim());
      setDebouncedQuery(query);
    }
  }, [query, addToHistory]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  const clearSearch = useCallback(() => {
    setQuery("");
    setDebouncedQuery("");
    setChapterFilter("all");
    setDateFrom("");
    setDateTo("");
  }, []);

  const stats = searchData?.meta || statsData?.meta;
  const results = searchData?.data || [];
  const hasSearched = debouncedQuery.trim().length > 0;

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileSearch className="h-6 w-6 text-primary" />
            Recherche plein texte
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Recherchez dans le contenu de vos chapitres de thèse
          </p>
        </div>
        <Badge variant="outline" className="w-fit gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          MeiliSearch (simulation)
        </Badge>
      </div>

      {/* Statistics panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-chart-1/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-chart-1" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Documents indexés</p>
              <p className="text-xl font-bold tabular-nums">
                {statsLoading ? <Skeleton className="h-7 w-8 inline-block" /> : (stats?.totalIndexed ?? 0)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Mots indexés</p>
              <p className="text-xl font-bold tabular-nums">
                {statsLoading ? <Skeleton className="h-7 w-16 inline-block" /> : ((stats?.totalWords ?? 0)).toLocaleString("fr-FR")}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-chart-4/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-chart-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Dernière mise à jour</p>
              <p className="text-sm font-medium truncate">
                {statsLoading ? <Skeleton className="h-5 w-32 inline-block" /> : formatDate(stats?.lastIndexUpdate ?? null)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search bar */}
      <Card>
        <CardContent className="p-4 flex flex-col gap-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans vos chapitres..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-9 pr-9"
              />
              {query && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  aria-label="Effacer la recherche"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
            <Button onClick={handleSearch} disabled={!query.trim()}>
              <Search className="h-4 w-4 mr-2" />
              Rechercher
            </Button>
          </div>

          {/* Filters row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={chapterFilter} onValueChange={setChapterFilter}>
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Tous les chapitres" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les chapitres</SelectItem>
                {chapters.map((ch) => (
                  <SelectItem key={ch.id} value={ch.id}>
                    {ch.romanNumeral ? `${ch.romanNumeral}. ` : `Ch. ${ch.number}. `}{ch.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full sm:w-[170px]"
              aria-label="Date de début"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full sm:w-[170px]"
              aria-label="Date de fin"
            />
            {(chapterFilter !== "all" || dateFrom || dateTo) && (
              <Button variant="ghost" size="sm" onClick={clearSearch} className="gap-1.5">
                <X className="h-3.5 w-3.5" />
                Réinitialiser
              </Button>
            )}
          </div>

          {/* Advanced mode toggle */}
          <button
            onClick={() => setAdvancedMode(!advancedMode)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            {advancedMode ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Recherche avancée (opérateurs booléens)
          </button>

          {advancedMode && (
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-chart-1 mt-0.5 shrink-0" />
                  <p className="text-sm">
                    Utilisez les opérateurs booléens pour affiner votre recherche&nbsp;:
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Badge variant="secondary" className="font-mono text-xs">AND</Badge>
                    <p className="text-xs text-muted-foreground">
                      Tous les termes doivent être présents. Ex&nbsp;: <code className="text-xs bg-background px-1 rounded">urbanisme AND durabilité</code>
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Badge variant="secondary" className="font-mono text-xs">OR</Badge>
                    <p className="text-xs text-muted-foreground">
                      Au moins un terme doit être présent. Ex&nbsp;: <code className="text-xs bg-background px-1 rounded">architecture OR urbanisme</code>
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Badge variant="secondary" className="font-mono text-xs">NOT</Badge>
                    <p className="text-xs text-muted-foreground">
                      Exclut les résultats contenant ce terme. Ex&nbsp;: <code className="text-xs bg-background px-1 rounded">méthodologie NOT qualitative</code>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Search history */}
      {searchHistory.length > 0 && !hasSearched && (
        <Card>
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              Recherches récentes
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex flex-wrap gap-2 max-h-96 overflow-y-auto">
              {searchHistory.map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-sm transition-colors"
                >
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span>{term}</span>
                  <X
                    className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchHistory((prev) => prev.filter((h) => h !== term));
                    }}
                  />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results area */}
      <div className="flex flex-col gap-4">
        {/* Results header */}
        {hasSearched && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {searchFetching ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-chart-1 animate-pulse" />
                  Recherche en cours...
                </span>
              ) : (
                <>
                  {results.length} résultat{results.length !== 1 ? "s" : ""}
                  {debouncedQuery && (
                    <>
                      {" "}pour «&thinsp;<span className="font-medium text-foreground">{debouncedQuery}</span>&thinsp;»
                    </>
                  )}
                </>
              )}
            </p>
          </div>
        )}

        {/* Loading state */}
        {searchLoading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-5 w-24 ml-auto" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Results list */}
        {!searchLoading && hasSearched && results.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <h3 className="text-sm font-medium">Aucun résultat</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Aucun chapitre ne contient ce terme. Essayez avec des mots différents ou modifiez les filtres.
              </p>
            </CardContent>
          </Card>
        )}

        {!searchLoading &&
          results.map((result) => {
            const statusInfo = STATUS_LABELS[result.status] || STATUS_LABELS.not_started;
            return (
              <Card key={result.chapterId} className="overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  {/* Chapter header */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge variant="outline" className="shrink-0 font-mono text-xs">
                        {result.romanNumeral || result.chapterNumber}
                      </Badge>
                      <h3 className="text-sm font-semibold truncate">{result.chapterTitle}</h3>
                    </div>
                    <div className="flex items-center gap-2 sm:ml-auto shrink-0">
                      <Badge variant="outline" className="text-[10px]">
                        {result.wordCount.toLocaleString("fr-FR")} mots
                      </Badge>
                      <Badge className={`text-[10px] ${statusInfo.color}`}>{statusInfo.label}</Badge>
                    </div>
                  </div>

                  {/* Thesis info */}
                  {result.thesisTitle && (
                    <p className="text-xs text-muted-foreground">
                      Thèse&nbsp;: <span className="font-medium">{result.thesisTitle}</span>
                      {result.thesisAuthor && (
                        <>
                          {" "}— {result.thesisAuthor}
                        </>
                      )}
                    </p>
                  )}

                  <Separator />

                  {/* Highlighted snippet */}
                  {result.snippet && (
                    <p className="text-sm leading-relaxed">
                      {highlightText(result.snippet, debouncedQuery)}
                    </p>
                  )}

                  {/* Footer: score + date */}
                  <div className="flex items-center justify-between pt-1">
                    <Badge
                      variant="secondary"
                      className="text-[10px] gap-1"
                    >
                      <TrendingUp className="h-3 w-3" />
                      {formatScore(result.score)} ({result.score})
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      Mis à jour le {formatDate(result.updatedAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}

        {/* Empty state — no search yet */}
        {!hasSearched && searchHistory.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileSearch className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <h3 className="text-sm font-medium">Recherchez dans vos chapitres</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Saisissez un mot ou une phrase pour rechercher dans le contenu de tous vos chapitres de thèse.
                Les résultats apparaissent en temps réel avec le texte surligné.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
