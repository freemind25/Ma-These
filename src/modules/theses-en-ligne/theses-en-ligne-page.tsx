"use client";

import { useState, useCallback } from "react";
import {
  GraduationCap,
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
  Globe,
  BookOpen,
  User,
  Tag,
  X,
  Loader2,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ── Types ──

interface ThesisResult {
  id: string;
  title: string;
  titleEn: string;
  authors: string[];
  year: number;
  abstract: string;
  abstractEn: string;
  url: string;
  domains: string[];
  keywords: string[];
  source: string;
}

interface ExternalSource {
  name: string;
  url: string;
  description: string;
  coverage: string;
  flag: string;
}

// ── Data ──

const EXTERNAL_SOURCES: ExternalSource[] = [
  { name: "theses.fr", url: "https://theses.fr", description: "Base nationale des thèses soutenues en France depuis 1985", coverage: "France", flag: "\ud83c\uddeb" },
  { name: "ETHOS (British Library)", url: "https://ethos.bl.uk", description: "Thèses du Royaume-Uni, téléchargement gratuit", coverage: "Royaume-Uni", flag: "\ud83c\uddec" },
  { name: "OATD", url: "https://oatd.org", description: "Catalogue mondial de thèses en libre accès (6M+)", coverage: "Mondial", flag: "\ud83c\udf0d" },
  { name: "BASE (Bielefeld)", url: "https://www.base-search.net", description: "Moteur académique européen, filtre Open Access", coverage: "Europe", flag: "\ud83c\uddea" },
  { name: "NDLTD", url: "http://www.ndltd.org", description: "Réseau mondial de thèses numérisées", coverage: "Mondial", flag: "\ud83c\udf0d" },
  { name: "MIT DSpace", url: "https://dspace.mit.edu", description: "Thèses du Massachusetts Institute of Technology", coverage: "MIT", flag: "\ud83c\uddfa" },
  { name: "Harvard DASH", url: "https://dash.harvard.edu", description: "Thèses et mémoires de l\u2019Université Harvard", coverage: "Harvard", flag: "\ud83c\uddfa" },
  { name: "Shodhganga", url: "https://shodhganga.inflibnet.ac.in", description: "Thèses des universités indiennes", coverage: "Inde", flag: "\ud83c\uddee" },
];

const DOMAIN_OPTIONS = [
  { value: "", label: "Toutes les disciplines" },
  { value: "shs", label: "Sciences humaines et sociales" },
  { value: "info", label: "Informatique" },
  { value: "sde", label: "Sciences de l\u2019ingénieur" },
  { value: "sdv", label: "Sciences du vivant" },
  { value: "sci", label: "Sciences" },
  { value: "sm", label: "Sciences mathématiques" },
  { value: "phys", label: "Physique" },
  { value: "chimie", label: "Chimie" },
  { value: "stat", label: "Statistiques" },
  { value: "cca", label: "Sciences cognitives" },
];

const SORT_OPTIONS = [
  { value: "publicationDateY_i+desc", label: "Plus récentes" },
  { value: "publicationDateY_i+asc", label: "Plus anciennes" },
  { value: "score+desc", label: "Plus pertinentes" },
];

// ── Main Component ──

export function ThesesEnLignePage() {
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("");
  const [yearMin, setYearMin] = useState("");
  const [yearMax, setYearMax] = useState("");
  const [sort, setSort] = useState("publicationDateY_i+desc");
  const [page, setPage] = useState(0);
  const [results, setResults] = useState<ThesisResult[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [showExternal, setShowExternal] = useState(false);

  const doSearch = useCallback(
    async (p = 0) => {
      if (!query.trim()) {
        toast.error("Entrez un terme de recherche");
        return;
      }
      setLoading(true);
      setError("");
      setSearched(true);
      try {
        const params = new URLSearchParams({ q: query, rows: "15", page: String(p), sort });
        if (domain) params.set("domain", domain);
        if (yearMin) params.set("yearMin", yearMin);
        if (yearMax) params.set("yearMax", yearMax);
        const res = await fetch(`/api/theses-en-ligne/search?${params}`);
        const data = await res.json();
        if (data.error) {
          setError(data.error);
          setResults([]);
          setTotal(0);
          setTotalPages(0);
        } else {
          setResults(data.theses || []);
          setTotal(data.total || 0);
          setTotalPages(data.totalPages || 0);
          setPage(p);
        }
      } catch {
        setError("Impossible de contacter le serveur");
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [query, domain, yearMin, yearMax, sort]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(0);
  };

  const resetFilters = () => {
    setDomain("");
    setYearMin("");
    setYearMax("");
    setSort("publicationDateY_i+desc");
  };

  const hasFilters = domain || yearMin || yearMax;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/40">
            <GraduationCap className="w-5 h-5 text-violet-700 dark:text-violet-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Thèses en ligne</h1>
            <p className="text-sm text-muted-foreground">Explorez les thèses de doctorat via HAL et d&apos;autres sources</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowExternal(!showExternal)}>
          <Globe className="w-4 h-4 mr-1.5" />
          Autres sources ({EXTERNAL_SOURCES.length})
        </Button>
      </div>

      {/* External Sources */}
      {showExternal && (
        <Card className="border-violet-200 dark:border-violet-800/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Autres dépôts de thèses
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {EXTERNAL_SOURCES.map((src) => (
                <a key={src.name} href={src.url} target="_blank" rel="noopener noreferrer" className="group flex flex-col p-3 rounded-lg border hover:border-violet-400 dark:hover:border-violet-600 hover:shadow-sm transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{src.flag} {src.coverage}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="font-medium text-sm mt-1 group-hover:text-violet-700 dark:group-hover:text-violet-400">{src.name}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{src.description}</p>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Form */}
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder={"Rechercher des thèses... (ex : architecture urbaine)"} value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Search className="w-4 h-4 mr-1.5" />}
            Rechercher
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="w-4 h-4" />
            <span>Filtres :</span>
          </div>
          <Select value={domain} onValueChange={setDomain}>
            <SelectTrigger className="w-[220px] h-9"><SelectValue placeholder="Discipline" /></SelectTrigger>
            <SelectContent>
              {DOMAIN_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value || "__all__"}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="number" placeholder="Année min" value={yearMin} onChange={(e) => setYearMin(e.target.value)} className="w-[110px] h-9" min={1985} max={2026} />
          <Input type="number" placeholder="Année max" value={yearMax} onChange={(e) => setYearMax(e.target.value)} className="w-[110px] h-9" min={1985} max={2026} />
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[170px] h-9">
              <ArrowUpDown className="w-3.5 h-3.5 mr-1.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button variant="ghost" size="sm" className="h-9 text-xs" onClick={resetFilters}>
              <X className="w-3 h-3 mr-1" />
              Réinitialiser
            </Button>
          )}
        </div>
      </form>

      {/* Results */}
      {!searched ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center text-muted-foreground">
            <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium text-lg">Explorez les thèses de doctorat</p>
            <p className="text-sm mt-2 max-w-md mx-auto">
              Recherchez dans les thèses francophones via HAL (archives-ouvertes.fr).
              Trouvez des travaux connexes, inspirez-vous de méthodologies, identifiez les lacunes.
            </p>
          </CardContent>
        </Card>
      ) : loading ? (
        <Card>
          <CardContent className="p-12 flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p className="font-medium">Recherche en cours...</p>
            <p className="text-sm mt-1">Interrogation de HAL</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-red-200 dark:border-red-800/50">
          <CardContent className="p-8 text-center text-red-600 dark:text-red-400">
            <p className="font-medium">Erreur de recherche</p>
            <p className="text-sm mt-1">{error}</p>
          </CardContent>
        </Card>
      ) : results.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="font-medium">Aucun résultat</p>
            <p className="text-sm mt-1">Essayez d&apos;élargir votre recherche ou de modifier les filtres.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{total}</span> thèse{total > 1 ? "s" : ""} trouvée{total > 1 ? "s" : ""}
              {total > 15 && <span> (page {page + 1}/{totalPages})</span>}
            </p>
            <Badge variant="outline" className="text-xs">Source : HAL</Badge>
          </div>

          <ScrollArea className="max-h-[65vh]">
            <div className="space-y-3 pr-3">
              {results.map((thesis) => (
                <ThesisCard key={thesis.id} thesis={thesis} />
              ))}
            </div>
          </ScrollArea>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => doSearch(page - 1)}>
                <ChevronLeft className="w-4 h-4" />
                Précédent
              </Button>
              <span className="text-sm text-muted-foreground px-3">{page + 1} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => doSearch(page + 1)}>
                Suivant
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Thesis Card ──

function ThesisCard({ thesis }: { thesis: ThesisResult }) {
  const [expanded, setExpanded] = useState(false);
  const abstract = thesis.abstract || thesis.abstractEn;
  const truncated = abstract.length > 300;
  const displayAbstract = !abstract ? "" : expanded || !truncated ? abstract : abstract.slice(0, 300) + "...";

  return (
    <Card className="group transition-all hover:shadow-md hover:border-violet-300 dark:hover:border-violet-700">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <a href={thesis.url} target="_blank" rel="noopener noreferrer" className="font-medium text-sm leading-relaxed hover:text-violet-700 dark:hover:text-violet-400 flex-1">
            {thesis.title || thesis.titleEn || "Sans titre"}
            {thesis.titleEn && thesis.title && (
              <span className="block text-muted-foreground font-normal mt-0.5">{thesis.titleEn}</span>
            )}
          </a>
          <div className="flex items-center gap-1.5 shrink-0">
            {thesis.year > 0 && <Badge variant="secondary" className="text-xs font-normal">{thesis.year}</Badge>}
            <a href={thesis.url} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-violet-600" />
            </a>
          </div>
        </div>

        {thesis.authors.length > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <User className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{thesis.authors.join(", ")}</span>
          </div>
        )}

        {abstract && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {displayAbstract}
            {truncated && (
              <button type="button" onClick={() => setExpanded(!expanded)} className="ml-1 text-violet-600 dark:text-violet-400 hover:underline text-xs font-medium">
                {expanded ? "Réduire" : "Lire la suite"}
              </button>
            )}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-1.5">
          {thesis.domains.map((d, i) => (
            <Badge key={i} variant="outline" className="text-xs font-normal">
              <BookOpen className="w-3 h-3 mr-1" />{d}
            </Badge>
          ))}
          {thesis.keywords.slice(0, 4).map((kw, i) => (
            <Badge key={kw + i} className="text-xs font-normal bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300">
              <Tag className="w-2.5 h-2.5 mr-1" />{kw}
            </Badge>
          ))}
          {thesis.keywords.length > 4 && <span className="text-xs text-muted-foreground">+{thesis.keywords.length - 4}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
