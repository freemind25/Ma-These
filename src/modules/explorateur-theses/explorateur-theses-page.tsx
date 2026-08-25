"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  GraduationCap,
  User,
  Building2,
  Calendar,
  BookOpen,
  Tag,
  Users,
  BarChart3,
  TrendingUp,
  Loader2,
  X,
  Info,
  FileText,
  ArrowUpDown,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionItem,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  type TheseLite,
  type TheseSortOption,
  SORT_OPTIONS,
  formatPersonName,
  getTheseUrl,
} from "@/lib/theses-fr/types";

// ── Constants ────────────────────────────────────────────

const PAGE_SIZES = [10, 20, 50] as const;

const LANGUE_OPTIONS = [
  { value: "all", label: "Toutes les langues" },
  { value: "fr", label: "Français" },
  { value: "en", label: "Anglais" },
];

const STATUT_OPTIONS = [
  { value: "tous", label: "Tous les statuts" },
  { value: "soutenue", label: "Soutenue" },
  { value: "enCours", label: "En cours" },
];

const TRENDING_DISCIPLINES = [
  "Intelligence artificielle",
  "Santé publique",
  "Droit",
  "Sciences de l'éducation",
  "Histoire",
];

const DISCIPLINE_COLORS = [
  "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
  "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300",
  "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/40 dark:text-fuchsia-300",
  "bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-300",
  "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
];

function getDisciplineColor(discipline: string): string {
  let hash = 0;
  for (let i = 0; i < discipline.length; i++) {
    hash = discipline.charCodeAt(i) + ((hash << 5) - hash);
  }
  return DISCIPLINE_COLORS[Math.abs(hash) % DISCIPLINE_COLORS.length];
}

// ── Main Component ───────────────────────────────────────

export function ExplorateurThesesPage() {
  // ── Active tab ──
  const [activeTab, setActiveTab] = useState("recherche");

  // ── Search state (Tab 1) ──
  const [query, setQuery] = useState("");
  const [disciplines, setDisciplines] = useState("");
  const [langue, setLangue] = useState("all");
  const [statut, setStatut] = useState("tous");
  const [anneeMin, setAnneeMin] = useState("");
  const [anneeMax, setAnneeMax] = useState("");
  const [tri, setTri] = useState<TheseSortOption>("dateDesc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  const [theses, setTheses] = useState<TheseLite[]>([]);
  const [totalHits, setTotalHits] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<Record<string, any>>({});

  // ── Stats state (Tab 2) ──
  const [totalTheses, setTotalTheses] = useState<number | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // ── Persons state (Tab 3) ──
  const [personQuery, setPersonQuery] = useState("");
  const [persons, setPersons] = useState<
    {
      id: string;
      nom: string;
      prenom: string;
      ppn: string | null;
      role: string;
      theseCount?: number;
    }[]
  >([]);
  const [personTotal, setPersonTotal] = useState(0);
  const [personLoading, setPersonLoading] = useState(false);
  const [personSearched, setPersonSearched] = useState(false);
  const [personPage, setPersonPage] = useState(1);

  // ── Fetch stats on mount ──
  useEffect(() => {
    let cancelled = false;
    async function fetchStats() {
      setStatsLoading(true);
      try {
        const res = await fetch("/api/theses/stats");
        if (!res.ok) throw new Error("Erreur serveur");
        const json = await res.json();
        if (!cancelled && json.data?.totalTheses != null) {
          setTotalTheses(json.data.totalTheses);
        }
      } catch {
        if (!cancelled) {
          toast.error("Impossible de charger les statistiques");
        }
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    }
    fetchStats();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Search theses ──
  const doSearch = useCallback(
    async (p = 1) => {
      if (!query.trim()) {
        toast.error("Veuillez entrer un terme de recherche");
        return;
      }
      setSearchLoading(true);
      setSearched(true);
      setExpandedId(null);
      setDetailData({});
      try {
        const params = new URLSearchParams({
          q: query.trim(),
          debut: String((p - 1) * pageSize),
          nombre: String(pageSize),
          tri,
        });
        if (disciplines.trim()) {
          params.set(
            "disciplines",
            disciplines
              .split(",")
              .map((d) => d.trim())
              .filter(Boolean)
              .join(","),
          );
        }
        if (langue !== "all") params.set("langues", langue);
        if (statut !== "tous") params.set("statut", statut);
        if (anneeMin) params.set("anneesMin", anneeMin);
        if (anneeMax) params.set("anneesMax", anneeMax);

        const res = await fetch(`/api/theses/search?${params}`);
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        const json = await res.json();
        if (json.error) {
          toast.error(json.error);
          setTheses([]);
          setTotalHits(0);
        } else {
          setTheses(json.data?.theses ?? []);
          setTotalHits(json.data?.totalHits ?? 0);
        }
        setPage(p);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Erreur lors de la recherche",
        );
        setTheses([]);
        setTotalHits(0);
      } finally {
        setSearchLoading(false);
      }
    },
    [query, disciplines, langue, statut, anneeMin, anneeMax, tri, pageSize],
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(1);
  };

  // ── Fetch detail ──
  const fetchDetail = useCallback(async (id: string) => {
    if (detailData[id]) {
      setExpandedId(expandedId === id ? null : id);
      return;
    }
    setDetailLoading(id);
    try {
      const res = await fetch(`/api/theses/detail?id=${id}`);
      if (!res.ok) throw new Error("Erreur serveur");
      const json = await res.json();
      setDetailData((prev) => ({ ...prev, [id]: json.data ?? {} }));
      setExpandedId(id);
    } catch {
      toast.error("Impossible de charger les détails");
    } finally {
      setDetailLoading(null);
    }
  }, [detailData, expandedId]);

  // ── Search persons ──
  const doPersonSearch = useCallback(
    async (p = 1) => {
      if (!personQuery.trim()) {
        toast.error("Veuillez entrer un nom de chercheur");
        return;
      }
      setPersonLoading(true);
      setPersonSearched(true);
      try {
        const params = new URLSearchParams({
          q: personQuery.trim(),
          debut: String((p - 1) * 10),
          nombre: "10",
        });
        const res = await fetch(`/api/theses/persons?${params}`);
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        const json = await res.json();
        if (json.error) {
          toast.error(json.error);
          setPersons([]);
          setPersonTotal(0);
        } else {
          setPersons(json.data?.personnes ?? []);
          setPersonTotal(json.data?.totalHits ?? 0);
        }
        setPersonPage(p);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Erreur lors de la recherche",
        );
        setPersons([]);
        setPersonTotal(0);
      } finally {
        setPersonLoading(false);
      }
    },
    [personQuery],
  );

  const handlePersonSearch = (e: React.FormEvent) => {
    e.preventDefault();
    doPersonSearch(1);
  };

  // ── Trending discipline click ──
  const handleTrendingClick = (discipline: string) => {
    setQuery(discipline);
    setActiveTab("recherche");
    // Use setTimeout to ensure tab switch happens before search
    setTimeout(() => {
      doSearchWithQuery(discipline);
    }, 0);
  };

  const doSearchWithQuery = useCallback(
    async (q: string, p = 1) => {
      if (!q.trim()) return;
      setSearchLoading(true);
      setSearched(true);
      setExpandedId(null);
      setDetailData({});
      try {
        const params = new URLSearchParams({
          q: q.trim(),
          debut: String((p - 1) * pageSize),
          nombre: String(pageSize),
          tri,
        });
        const res = await fetch(`/api/theses/search?${params}`);
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        const json = await res.json();
        if (json.error) {
          toast.error(json.error);
          setTheses([]);
          setTotalHits(0);
        } else {
          setTheses(json.data?.theses ?? []);
          setTotalHits(json.data?.totalHits ?? 0);
        }
        setPage(p);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Erreur lors de la recherche",
        );
        setTheses([]);
        setTotalHits(0);
      } finally {
        setSearchLoading(false);
      }
    },
    [tri, pageSize],
  );

  // ── Reset filters ──
  const resetFilters = () => {
    setDisciplines("");
    setLangue("all");
    setStatut("tous");
    setAnneeMin("");
    setAnneeMax("");
    setTri("dateDesc");
  };

  const hasFilters =
    disciplines || langue !== "all" || statut !== "tous" || anneeMin || anneeMax;

  // ── Pagination helpers ──
  const totalPages = Math.max(1, Math.ceil(totalHits / pageSize));
  const rangeStart = (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalHits);

  // ── Render helpers ──
  const renderStatusBadge = (status: string | null) => {
    if (status === "soutenue") {
      return (
        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-0">
          Soutenue
        </Badge>
      );
    }
    if (status === "enCours") {
      return (
        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-0">
          En cours
        </Badge>
      );
    }
    return null;
  };

  // ── Render ──
  return (
    <TooltipProvider>
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
        {/* */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/40">
              <GraduationCap className="w-5 h-5 text-rose-700 dark:text-rose-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                Explorateur de Thèses
              </h1>
              <p className="text-sm text-muted-foreground">
                Recherchez dans la base officielle theses.fr (ABES)
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="text-xs shrink-0"
          >
            Source : theses.fr
          </Badge>
        </div>

        {/* */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="recherche" className="gap-1.5">
              <Search className="w-3.5 h-3.5" />
              Recherche
            </TabsTrigger>
            <TabsTrigger value="statistiques" className="gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" />
              Statistiques
            </TabsTrigger>
            <TabsTrigger value="chercheurs" className="gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Chercheurs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recherche" className="space-y-4 mt-4">
              <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher une thèse... (ex : intelligence artificielle, santé publique)"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10 h-11 text-base"
                  />
                </div>
                <Button type="submit" disabled={searchLoading} className="h-11 px-6">
                  {searchLoading ? (
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 mr-1.5" />
                  )}
                  Rechercher
                </Button>
              </div>

                  <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className={showFilters ? "bg-accent" : ""}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
                  Filtres avancés
                </Button>
                {hasFilters && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={resetFilters}
                  >
                    <X className="w-3 h-3 mr-1" />
                    Réinitialiser
                  </Button>
                )}
              </div>

                  {showFilters && (
                <Card>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                  <div className="space-y-1.5">
                        <label className="text-sm font-medium flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5" />
                          Disciplines
                        </label>
                        <Input
                          placeholder="Séparées par des virgules"
                          value={disciplines}
                          onChange={(e) => setDisciplines(e.target.value)}
                        />
                      </div>

                                  <div className="space-y-1.5">
                        <label className="text-sm font-medium">Langue</label>
                        <Select value={langue} onValueChange={setLangue}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LANGUE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                                  <div className="space-y-1.5">
                        <label className="text-sm font-medium">Statut</label>
                        <Select value={statut} onValueChange={setStatut}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUT_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                                  <div className="space-y-1.5">
                        <label className="text-sm font-medium flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          Année minimale
                        </label>
                        <Input
                          type="number"
                          placeholder="Ex : 2015"
                          value={anneeMin}
                          onChange={(e) => setAnneeMin(e.target.value)}
                          min={1985}
                          max={new Date().getFullYear() + 1}
                        />
                      </div>

                                  <div className="space-y-1.5">
                        <label className="text-sm font-medium">Année maximale</label>
                        <Input
                          type="number"
                          placeholder={String(new Date().getFullYear())}
                          value={anneeMax}
                          onChange={(e) => setAnneeMax(e.target.value)}
                          min={1985}
                          max={new Date().getFullYear() + 1}
                        />
                      </div>

                                  <div className="space-y-1.5">
                        <label className="text-sm font-medium flex items-center gap-1.5">
                          <ArrowUpDown className="w-3.5 h-3.5" />
                          Tri
                        </label>
                        <Select
                          value={tri}
                          onValueChange={(v) => setTri(v as TheseSortOption)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SORT_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </form>

              {!searched ? (
              <Card className="border-dashed">
                <CardContent className="p-12 text-center text-muted-foreground">
                  <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="font-medium text-lg">Explorez les thèses françaises</p>
                  <p className="text-sm mt-2 max-w-md mx-auto">
                    Recherchez parmi les thèses de doctorat soutenues ou en cours en
                    France. Source officielle theses.fr (ABES).
                  </p>
                </CardContent>
              </Card>
            ) : searchLoading ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-64" />
                  <Skeleton className="h-5 w-24" />
                </div>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4 space-y-3">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : theses.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
                  <p className="font-medium">Aucun résultat</p>
                  <p className="text-sm mt-1">
                    Essayez d&apos;élargir votre recherche ou de modifier les filtres.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {totalHits}
                    </span>{" "}
                    thèse{totalHits > 1 ? "s" : ""} trouvée{totalHits > 1 ? "s" : ""}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Résultats {rangeStart} à {rangeEnd} sur {totalHits}
                  </p>
                </div>

                      <ScrollArea className="max-h-[65vh]">
                  <div className="space-y-3 pr-3">
                    <Accordion type="single" collapsible>
                      {theses.map((these) => {
                        const detail = detailData[these.id];
                        const isExpanded = expandedId === these.id;
                        const isLoading = detailLoading === these.id;

                        return (
                          <AccordionItem
                            key={these.id}
                            value={these.id}
                            className="border rounded-lg px-0"
                          >
                            <Card>
                              <CardContent className="p-4">
                                                      <div className="mb-2">
                                  <p className="font-semibold leading-snug">
                                    {these.titrePrincipal}
                                  </p>
                                  {these.titreEN &&
                                    these.titreEN !== these.titrePrincipal && (
                                      <p className="text-sm text-muted-foreground mt-0.5">
                                        {these.titreEN}
                                      </p>
                                    )}
                                </div>

                                                      <div className="flex flex-wrap gap-1.5 mb-2">
                                  {these.auteurs?.map((a, i) => (
                                    <Badge
                                      key={i}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      <User className="w-3 h-3 mr-1" />
                                      {formatPersonName(a)}
                                    </Badge>
                                  ))}
                                </div>

                                                      {these.directeurs?.length > 0 && (
                                  <p className="text-sm text-muted-foreground mb-2">
                                    <span className="font-medium text-foreground">
                                      Dir. :
                                    </span>{" "}
                                    {these.directeurs.map((d, i) => (
                                      <span key={i}>
                                        {formatPersonName(d)}
                                        {i < these.directeurs.length - 1
                                          ? ", "
                                          : ""}
                                      </span>
                                    ))}
                                  </p>
                                )}

                                                      <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <Badge
                                    className={`text-xs border-0 ${getDisciplineColor(these.discipline)}`}
                                  >
                                    <BookOpen className="w-3 h-3 mr-1" />
                                    {these.discipline}
                                  </Badge>
                                  {renderStatusBadge(these.status)}
                                  {these.dateSoutenance ? (
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {these.dateSoutenance}
                                    </span>
                                  ) : these.status === "enCours" ? (
                                    <span className="text-xs text-muted-foreground">
                                      En cours
                                    </span>
                                  ) : null}
                                </div>

                                                      {these.etabSoutenanceN && (
                                  <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                                    <Building2 className="w-3.5 h-3.5" />
                                    {these.etabSoutenanceN}
                                  </p>
                                )}

                                                      {these.sujets && these.sujets.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-3">
                                    {these.sujets.slice(0, 4).map((s, i) => (
                                      <Badge
                                        key={i}
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        <Tag className="w-2.5 h-2.5 mr-1" />
                                        {s.libelle}
                                      </Badge>
                                    ))}
                                    {these.sujets.length > 4 && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        +{these.sujets.length - 4}
                                      </Badge>
                                    )}
                                  </div>
                                )}

                                                      <div className="flex items-center gap-2 pt-1">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-xs"
                                        asChild
                                      >
                                        <a
                                          href={getTheseUrl(these.id)}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          <ExternalLink className="w-3 h-3 mr-1" />
                                          Voir sur theses.fr
                                        </a>
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      Ouvrir sur theses.fr
                                    </TooltipContent>
                                  </Tooltip>

                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs"
                                    onClick={() => fetchDetail(these.id)}
                                    disabled={isLoading}
                                  >
                                    {isLoading ? (
                                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                    ) : (
                                      <FileText className="w-3 h-3 mr-1" />
                                    )}
                                    Détails
                                  </Button>
                                </div>

                                                      {isExpanded && detail && (
                                  <div className="mt-4">
                                    <Separator className="mb-4" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                                  {detail.these?.ecolesDoctorale?.length > 0 && (
                                        <div>
                                          <p className="font-medium mb-1 flex items-center gap-1.5">
                                            <GraduationCap className="w-3.5 h-3.5" />
                                            École(s) doctorale(s)
                                          </p>
                                          {detail.these.ecolesDoctorale.map(
                                            (ed: any, i: number) => (
                                              <p
                                                key={i}
                                                className="text-muted-foreground"
                                              >
                                                {ed.nom}
                                              </p>
                                            ),
                                          )}
                                        </div>
                                      )}

                                                                  {detail.these?.partenairesDeRecherche?.length >
                                        0 && (
                                          <div>
                                            <p className="font-medium mb-1 flex items-center gap-1.5">
                                              <Building2 className="w-3.5 h-3.5" />
                                              Partenaire(s) de recherche
                                            </p>
                                            {detail.these.partenairesDeRecherche.map(
                                              (p: any, i: number) => (
                                                <p
                                                  key={i}
                                                  className="text-muted-foreground"
                                                >
                                                  {p.nom}
                                                  {p.type && (
                                                    <span className="text-xs ml-1">
                                                      ({p.type})
                                                    </span>
                                                  )}
                                                </p>
                                              ),
                                            )}
                                          </div>
                                        )}

                                                                  {detail.these?.rapporteurs?.length > 0 && (
                                        <div>
                                          <p className="font-medium mb-1 flex items-center gap-1.5">
                                            <Users className="w-3.5 h-3.5" />
                                            Rapporteur(s)
                                          </p>
                                          {detail.these.rapporteurs.map(
                                            (r: any, i: number) => (
                                              <p
                                                key={i}
                                                className="text-muted-foreground"
                                              >
                                                {formatPersonName(r)}
                                              </p>
                                            ),
                                          )}
                                        </div>
                                      )}

                                                                  {detail.these?.examinateurs?.length > 0 && (
                                        <div>
                                          <p className="font-medium mb-1 flex items-center gap-1.5">
                                            <Users className="w-3.5 h-3.5" />
                                            Examinateur(s)
                                          </p>
                                          {detail.these.examinateurs.map(
                                            (ex: any, i: number) => (
                                              <p
                                                key={i}
                                                className="text-muted-foreground"
                                              >
                                                {formatPersonName(ex)}
                                              </p>
                                            ),
                                          )}
                                        </div>
                                      )}

                                                                  {detail.these?.president && (
                                        <div>
                                          <p className="font-medium mb-1 flex items-center gap-1.5">
                                            <User className="w-3.5 h-3.5" />
                                            Président du jury
                                          </p>
                                          <p className="text-muted-foreground">
                                            {formatPersonName(detail.these.president)}
                                          </p>
                                        </div>
                                      )}

                                                                  {detail.these?.doi && (
                                        <div>
                                          <p className="font-medium mb-1">DOI</p>
                                          <a
                                            href={`https://doi.org/${detail.these.doi}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-rose-600 dark:text-rose-400 hover:underline text-xs"
                                          >
                                            {detail.these.doi}
                                          </a>
                                        </div>
                                      )}

                                                                  {detail.these?.nnt && (
                                        <div>
                                          <p className="font-medium mb-1">NNT</p>
                                          <p className="text-muted-foreground text-xs font-mono">
                                            {detail.these.nnt}
                                          </p>
                                        </div>
                                      )}

                                                                  {detail.these?.datePremiereInscriptionDoctorat && (
                                        <div>
                                          <p className="font-medium mb-1">
                                            Première inscription doctorat
                                          </p>
                                          <p className="text-muted-foreground">
                                            {
                                              detail.these
                                                .datePremiereInscriptionDoctorat
                                            }
                                          </p>
                                        </div>
                                      )}

                                                                  {detail.boutons?.categories?.length > 0 && (
                                        <div className="md:col-span-2">
                                          <p className="font-medium mb-1.5 flex items-center gap-1.5">
                                            <FileText className="w-3.5 h-3.5" />
                                            Accès au document
                                          </p>
                                          <div className="flex flex-wrap gap-2">
                                            {detail.boutons.categories.map(
                                              (cat: any, ci: number) => (
                                                <div key={ci}>
                                                  {cat.boutons?.map(
                                                    (b: any, bi: number) => (
                                                      <a
                                                        key={bi}
                                                        href={b.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:underline mr-3"
                                                      >
                                                        <ExternalLink className="w-3 h-3" />
                                                        {b.libelle}
                                                      </a>
                                                    ),
                                                  )}
                                                  {cat.sousCategories?.map(
                                                    (sc: any, sci: number) => (
                                                      <div key={sci}>
                                                        <p className="text-xs font-medium text-muted-foreground mt-1">
                                                          {sc.libelle}
                                                        </p>
                                                        {sc.boutons?.map(
                                                          (b: any, bi: number) => (
                                                            <a
                                                              key={bi}
                                                              href={b.url}
                                                              target="_blank"
                                                              rel="noopener noreferrer"
                                                              className="inline-flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:underline mr-3"
                                                            >
                                                              <ExternalLink className="w-3 h-3" />
                                                              {b.libelle}
                                                            </a>
                                                          ),
                                                        )}
                                                      </div>
                                                    ),
                                                  )}
                                                </div>
                                              ),
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  </div>
                </ScrollArea>

                      {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Résultats par page :
                      </span>
                      <Select
                        value={String(pageSize)}
                        onValueChange={(v) => {
                          setPageSize(Number(v));
                          if (searched) doSearch(1);
                        }}
                      >
                        <SelectTrigger className="w-20 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAGE_SIZES.map((s) => (
                            <SelectItem key={s} value={String(s)}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1 || searchLoading}
                        onClick={() => doSearch(page - 1)}
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Précédent
                      </Button>
                      <span className="text-sm text-muted-foreground px-2">
                        {page} / {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages || searchLoading}
                        onClick={() => doSearch(page + 1)}
                      >
                        Suivant
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="statistiques" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Total des thèses
                  </CardTitle>
                  <CardDescription>
                    Thèses recensées dans la base theses.fr
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <Skeleton className="h-12 w-40" />
                  ) : totalTheses != null ? (
                    <p className="text-3xl font-bold tracking-tight">
                      {totalTheses.toLocaleString("fr-FR")}
                    </p>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertCircle className="w-4 h-4" />
                      Données indisponibles
                    </div>
                  )}
                </CardContent>
              </Card>

                  <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    À propos de theses.fr
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Recense l&apos;ensemble des thèses soutenues en France depuis 1985.
                    La base est alimentée par les signalements des établissements de
                    soutenance et gérée par l&apos;Agence bibliographique de
                    l&apos;enseignement supérieur (ABES).
                  </p>
                </CardContent>
              </Card>
            </div>

              <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Recherche rapide par discipline
                </CardTitle>
                <CardDescription>
                  Cliquez sur une discipline pour lancer une recherche
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_DISCIPLINES.map((disc) => (
                    <Button
                      key={disc}
                      variant="outline"
                      size="sm"
                      className="text-sm"
                      onClick={() => handleTrendingClick(disc)}
                    >
                      <Search className="w-3.5 h-3.5 mr-1.5" />
                      {disc}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chercheurs" className="space-y-4 mt-4">
              <form onSubmit={handlePersonSearch} className="flex gap-2">
              <div className="relative flex-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un chercheur... (ex : Dupont, Marie)"
                  value={personQuery}
                  onChange={(e) => setPersonQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                type="submit"
                disabled={personLoading}
              >
                {personLoading ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-1.5" />
                )}
                Rechercher
              </Button>
            </form>

              {!personSearched ? (
              <Card className="border-dashed">
                <CardContent className="p-12 text-center text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="font-medium text-lg">
                    Rechercher des chercheurs
                  </p>
                  <p className="text-sm mt-2 max-w-md mx-auto">
                    Trouvez des directeurs de thèse, rapporteurs, ou doctorants
                    dans la base theses.fr.
                  </p>
                </CardContent>
              </Card>
            ) : personLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : persons.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <User className="w-8 h-8 mx-auto mb-3 opacity-40" />
                  <p className="font-medium">Aucun chercheur trouvé</p>
                  <p className="text-sm mt-1">
                    Vérifiez l&apos;orthographe ou élargissez votre recherche.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{personTotal}</span>{" "}
                  chercheur{personTotal > 1 ? "s" : ""} trouvé{personTotal > 1 ? "s" : ""}
                </p>

                <ScrollArea className="max-h-[65vh]">
                  <div className="space-y-2 pr-3">
                    {persons.map((person) => (
                      <Card key={person.id}>
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/40 shrink-0">
                                <User className="w-4 h-4 text-rose-700 dark:text-rose-400" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium truncate">
                                  {person.prenom} {person.nom}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Badge variant="outline" className="text-xs">
                                    {person.role}
                                  </Badge>
                                  {person.theseCount != null && (
                                    <span className="text-xs">
                                      {person.theseCount} thèse
                                      {person.theseCount > 1 ? "s" : ""}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs shrink-0"
                              asChild
                            >
                              <a
                                href={`https://theses.fr/${person.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Voir sur theses.fr
                              </a>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>

                      {personTotal > 10 && (
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={personPage <= 1 || personLoading}
                      onClick={() => doPersonSearch(personPage - 1)}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Précédent
                    </Button>
                    <span className="text-sm text-muted-foreground px-2">
                      Page {personPage}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={personPage * 10 >= personTotal || personLoading}
                      onClick={() => doPersonSearch(personPage + 1)}
                    >
                      Suivant
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* */}
        <Separator />
        <footer className="text-center text-xs text-muted-foreground pb-4">
          <p>
            Données fournies par l&apos;API{" "}
            <a
              href="https://theses.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-600 dark:text-rose-400 hover:underline font-medium"
            >
              theses.fr
            </a>{" "}
            (ABES) — Service public de l&apos;enseignement supérieur et de la
            recherche
          </p>
        </footer>
      </div>
    </TooltipProvider>
  );
}
