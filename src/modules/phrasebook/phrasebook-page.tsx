"use client";

import { useState, useMemo } from "react";
import {
  BookOpenText,
  Search,
  Copy,
  Check,
  Filter,
  Layers,
  Lightbulb,
  ChevronRight,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  type Phrase,
  type ThesisSection,
  type PhraseFunction,
  PHRASES,
  SECTION_LABELS,
  FUNCTION_LABELS,
  FUNCTION_COLORS,
  searchPhrases,
  getPhraseStats,
} from "@/lib/data/phrasebank-data";

// ────────────────────────────────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────────────────────────────────

export function PhrasebookPage() {
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState<ThesisSection | "all">(
    "all"
  );
  const [activeFunction, setActiveFunction] = useState<PhraseFunction | "all">(
    "all"
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const stats = useMemo(() => getPhraseStats(), []);

  const filteredPhrases = useMemo(() => {
    let results = query ? searchPhrases(query) : PHRASES;
    if (activeSection !== "all") {
      results = results.filter((p) => p.section === activeSection);
    }
    if (activeFunction !== "all") {
      results = results.filter((p) => p.functions.includes(activeFunction));
    }
    return results;
  }, [query, activeSection, activeFunction]);

  const handleCopy = async (phrase: Phrase) => {
    try {
      await navigator.clipboard.writeText(phrase.text);
      setCopiedId(phrase.id);
      toast.success("Phrase copiée dans le presse-papiers");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Impossible de copier");
    }
  };

  const sections: (ThesisSection | "all")[] = [
    "all",
    ...(Object.keys(SECTION_LABELS) as ThesisSection[]),
  ];

  const functions: (PhraseFunction | "all")[] = [
    "all",
    ...(Object.keys(FUNCTION_LABELS) as PhraseFunction[]),
  ];

  const hasActiveFilters = activeSection !== "all" || activeFunction !== "all";

  const clearFilters = () => {
    setActiveSection("all");
    setActiveFunction("all");
    setQuery("");
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
            <BookOpenText className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Phrasier Académique
            </h1>
            <p className="text-sm text-muted-foreground">
              Phrases prêtes à l'emploi pour chaque section de votre thèse
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Layers className="w-4 h-4" />
          <span>{stats.total} phrases</span>
          <Separator orientation="vertical" className="h-4" />
          <span>{Object.keys(SECTION_LABELS).length} sections</span>
          <Separator orientation="vertical" className="h-4" />
          <span>{Object.keys(FUNCTION_LABELS).length} fonctions</span>
        </div>
      </div>

      {/* ── Info Banner ── */}
      <Card className="border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-950/20">
        <CardContent className="p-4 flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
          <div className="text-sm text-emerald-800 dark:text-emerald-300 space-y-1">
            <p className="font-medium">Comment utiliser le Phrasier ?</p>
            <p>
              Cliquez sur une phrase pour la copier, puis collez-la dans
              l'éditeur de thèse. Remplacez les éléments entre accolades
              <code className="mx-1 px-1.5 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-800/40 font-mono text-xs">
                {"{X}"}
              </code>
              par votre propre contenu.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Search ── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={'Rechercher une phrase... (ex: « ces résultats », « il convient », « en revanche »)'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => setQuery("")}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      {/* ── Section Filter ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span>Filtrer par section</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {sections.map((s) => {
            const isActive = activeSection === s;
            const label = s === "all" ? "Toutes" : SECTION_LABELS[s];
            const count =
              s === "all"
                ? stats.total
                : stats.bySection[s] || 0;
            return (
              <Button
                key={s}
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={
                  isActive
                    ? "shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }
                onClick={() => setActiveSection(s)}
              >
                {label}
                <Badge
                  variant="secondary"
                  className="ml-1.5 h-5 px-1.5 text-xs"
                >
                  {count}
                </Badge>
              </Button>
            );
          })}
        </div>
      </div>

      {/* ── Function Filter ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span>Filtrer par fonction</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {functions.map((fn) => {
            const isActive = activeFunction === fn;
            const label = fn === "all" ? "Toutes" : FUNCTION_LABELS[fn];
            const count =
              fn === "all"
                ? stats.total
                : stats.byFunction[fn] || 0;
            return (
              <Button
                key={fn}
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={
                  isActive
                    ? "shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }
                onClick={() => setActiveFunction(fn)}
              >
                {label}
                <Badge
                  variant="secondary"
                  className="ml-1.5 h-5 px-1.5 text-xs"
                >
                  {count}
                </Badge>
              </Button>
            );
          })}
        </div>
      </div>

      {/* ── Active Filters Summary ── */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">
            {filteredPhrases.length} résultat{filteredPhrases.length !== 1 ? "s" : ""}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={clearFilters}
          >
            <X className="w-3 h-3 mr-1" />
            Réinitialiser les filtres
          </Button>
        </div>
      )}

      {/* ── Phrase List ── */}
      <div className="space-y-2">
        {filteredPhrases.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p className="font-medium">Aucune phrase trouvée</p>
              <p className="text-sm mt-1">
                Essayez de modifier vos critères de recherche ou vos filtres.
              </p>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-2 pr-3">
              {filteredPhrases.map((phrase) => (
                <PhraseCard
                  key={phrase.id}
                  phrase={phrase}
                  copied={copiedId === phrase.id}
                  expanded={expandedId === phrase.id}
                  onCopy={() => handleCopy(phrase)}
                  onToggleExpand={() =>
                    setExpandedId(expandedId === phrase.id ? null : phrase.id)
                  }
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Phrase Card
// ────────────────────────────────────────────────────────────────────────────

function PhraseCard({
  phrase,
  copied,
  expanded,
  onCopy,
  onToggleExpand,
}: {
  phrase: Phrase;
  copied: boolean;
  expanded: boolean;
  onCopy: () => void;
  onToggleExpand: () => void;
}) {
  return (
    <Card
      className="group transition-all hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 cursor-pointer"
      onClick={onCopy}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Copy button */}
          <div className="shrink-0 mt-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={copied ? "default" : "outline"}
                  size="icon"
                  className={
                    copied
                      ? "h-8 w-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopy();
                  }}
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {copied ? "Copié !" : "Copier cette phrase"}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Phrase text with highlighted placeholders */}
            <p className="text-sm leading-relaxed">
              {highlightPlaceholders(phrase.text)}
            </p>

            {/* Tags row */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              {/* Section badge */}
              <Badge variant="outline" className="text-xs font-normal">
                {SECTION_LABELS[phrase.section]}
              </Badge>

              {/* Function badges */}
              {phrase.functions.map((fn) => (
                <span
                  key={fn}
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    FUNCTION_COLORS[fn]
                  }`}
                >
                  {FUNCTION_LABELS[fn]}
                </span>
              ))}

              {/* Variant */}
              {phrase.variant && (
                <span className="text-xs text-muted-foreground">
                  {phrase.variant}
                </span>
              )}

              {/* Expand indicator */}
              {(phrase.example || phrase.variant) && (
                <ChevronRight
                  className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${
                    expanded ? "rotate-90" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpand();
                  }}
                />
              )}
            </div>

            {/* Expanded details */}
            {expanded && (
              <div className="mt-3 pt-3 border-t space-y-2">
                {phrase.example && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Exemple d'utilisation :
                    </p>
                    <p className="text-sm text-muted-foreground italic">
                      {phrase.example}
                    </p>
                  </div>
                )}
                {phrase.variant && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Registre :
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {phrase.variant === "formel"
                        ? "Formel — pour les sections exigeant un ton soutenu"
                        : phrase.variant === "classique"
                          ? "Classique — ton académique standard"
                          : "Neutre — adaptable à tout contexte"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function highlightPlaceholders(text: string) {
  const parts = text.split(/(\{[^}]+\})/g);
  return parts.map((part, i) => {
    if (/^\{.*\}$/.test(part)) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-mono text-xs"
        >
          {part}
        </code>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
