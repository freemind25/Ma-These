"use client";

import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  BookOpen,
  Search,
  Download,
  Sparkles,
  ExternalLink,
  Filter,
  BookMarked,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  Info,
  ChevronDown,
  TriangleAlert,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAiConfig } from "@/hooks/use-ai-config";

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════
interface JournalResult {
  id: string;
  name: string;
  publisher: string;
  issn: string;
  subjects: string[];
  oaType: string;
  country: string;
  source: "openalex" | "doaj";
  homepageUrl?: string;
  apc?: string;
  relevanceScore: number;
}

// ═══════════════════════════════════════
// Constants
// ═══════════════════════════════════════
const SUBJECT_AREAS = [
  "Toutes les disciplines",
  "Sciences de l'information",
  "Médecine",
  "Sciences de la vie",
  "Sciences de l'ingénieur",
  "Informatique",
  "Mathématiques",
  "Physique",
  "Chimie",
  "Sciences de la terre",
  "Sciences sociales",
  "Psychologie",
  "Économie",
  "Droit",
  "Éducation",
  "Arts et humanités",
  "Sciences politiques",
  "Sociologie",
  "Linguistique",
  "Philosophie",
  "Histoire",
  "Gestion",
  "Environnement",
  "Santé publique",
];

const OA_TYPE_COLORS: Record<string, string> = {
  Or: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  Diamant:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  Hybride: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
  Bronze:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  Vert: "bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-300",
  "Non spécifié": "bg-muted text-muted-foreground",
};

const SOURCE_COLORS: Record<string, string> = {
  openalex:
    "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  doaj: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
};

// Predatory journal detection signals
const ALERT_SIGNALS = [
  {
    id: "unrealistic-promises",
    label: "Promesses irréalistes",
    description:
      "La revue garantit une publication en quelques jours, quel que soit le contenu",
  },
  {
    id: "dubious-website",
    label: "Site web douteux",
    description:
      "Fautes typographiques, incohérences visuelles, mise en page amateur",
  },
  {
    id: "fabricated-metrics",
    label: "Métriques fabriquées",
    description:
      "Indice d'impact propriétaire non reconnu officiellement",
  },
  {
    id: "no-verifiable-articles",
    label: "Absence d'articles vérifiables",
    description: "Aucun article de qualité consultable sur le site",
  },
  {
    id: "aggressive-solicitation",
    label: "Sollicitations agressives",
    description:
      "E-mails non ciblés invitant à soumettre sans lien avec votre champ",
  },
] as const;

const LEGITIMACY_SIGNALS = [
  {
    id: "recognized-indexing",
    label: "Indexation reconnue",
    description:
      "Indexée par Scopus, Web of Science, PubMed, ou DOAJ",
  },
  {
    id: "university-catalog",
    label: "Référencement universitaire",
    description:
      "Présente dans les catalogues de bibliothèques universitaires",
  },
  {
    id: "trusted-authors",
    label: "Auteurs de confiance",
    description:
      "Des chercheurs que vous connaissez y ont publié des travaux de qualité",
  },
] as const;

// ═══════════════════════════════════════
// Main component
// ═══════════════════════════════════════
export function JournauxOaPage() {
  const { withAiConfig } = useAiConfig();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [source, setSource] = useState<string>("both");
  const [subject, setSubject] = useState<string>("all");
  const [searchTrigger, setSearchTrigger] = useState(0);
  const queryClient = useQueryClient();

  // Predatory detection state
  const [predatoryOpen, setPredatoryOpen] = useState(false);
  const [alertChecks, setAlertChecks] = useState<Record<string, boolean>>({});
  const [legitimacyChecks, setLegitimacyChecks] = useState<Record<string, boolean>>({});

  // Debounce helper
  const handleSearch = useCallback(() => {
    if (query.trim().length >= 2) {
      setDebouncedQuery(query.trim());
      setSearchTrigger((s) => s + 1);
    } else {
      setDebouncedQuery("");
    }
  }, [query]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearch();
      }
    },
    [handleSearch]
  );

  // Fetch journals via proxy
  const { data, isLoading, isError, error } = useQuery<{
    data: JournalResult[];
    meta: {
      total: number;
      source: string;
      query: string;
      warnings?: string[];
    };
  }>({
    queryKey: ["journaux-oa", debouncedQuery, source, subject, searchTrigger],
    queryFn: async () => {
      const params = new URLSearchParams({
        q: debouncedQuery,
        source,
        subject,
      });
      const res = await fetch(`/api/journaux-oa?${params.toString()}`);
      if (!res.ok) throw new Error("Erreur lors de la recherche");
      return res.json();
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 5 * 60 * 1000,
  });

  const journals = data?.data ?? [];
  const warnings = data?.meta?.warnings;

  // Filter by subject on client side (DOAJ doesn't support server-side subject filter)
  const filteredJournals = useMemo(() => {
    if (subject === "all") return journals;
    return journals.filter((j) =>
      j.subjects.some((s) =>
        s.toLowerCase().includes(subject.toLowerCase())
      )
    );
  }, [journals, subject]);

  // AI ranking mutation
  const rankMutation = useMutation({
    mutationFn: async (journalsToRank: JournalResult[]) => {
      const journalList = journalsToRank
        .slice(0, 10)
        .map(
          (j, i) =>
            `${i + 1}. ${j.name} (${j.oaType}) — ${j.publisher} — ${j.subjects.join(", ")}`
        )
        .join("\n");

      const prompt = `Classe ces revues en accès ouvert par pertinence pour une recherche doctorale. Le sujet de recherche est : "${debouncedQuery}".

Revues :
${journalList}

Réponds UNIQUEMENT avec un objet JSON valide (pas de markdown) contenant un tableau "ranked" avec les numéros (de 1 à ${Math.min(journalsToRank.length, 10)}) dans l'ordre de pertinence décroissant. Le plus pertinent en premier.`;

      const res = await fetch("/api/ai-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          withAiConfig({
            mode: "peer-review",
            prompt,
          })
        ),
      });
      if (!res.ok) throw new Error("Erreur IA");
      const result = await res.json();
      return result.data?.content ?? "";
    },
    onSuccess: (content) => {
      try {
        // Try to parse ranked order from AI response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const ranked: number[] =
            parsed.ranked ?? parsed.order ?? [];
          if (ranked.length > 0) {
            queryClient.setQueryData<{
              data: JournalResult[];
              meta: { total: number; source: string; query: string };
            }>(
              ["journaux-oa", debouncedQuery, source, subject, searchTrigger],
              (old) => {
                if (!old) return old;
                const reordered = [...old.data];
                const sorted = ranked
                  .map((idx: number) => reordered[idx - 1])
                  .filter(Boolean);
                const remaining = reordered.filter(
                  (j) =>
                    !ranked.includes(reordered.indexOf(j) + 1)
                );
                return {
                  ...old,
                  data: [
                    ...sorted,
                    ...remaining,
                  ].map((j, i) => ({
                    ...j,
                    relevanceScore:
                      j.relevanceScore +
                      (sorted.length - i) * 1000,
                  })),
                };
              }
            );
            toast.success("Classement IA appliqué avec succès");
            return;
          }
        }
        toast.info(
          "L'IA n'a pas pu générer un classement exploitable"
        );
      } catch {
        toast.info(
          "Réponse IA reçue mais format inattendu"
        );
      }
    },
    onError: () => {
      toast.error("Erreur lors du classement par IA");
    },
  });

  // CSV Export
  const exportCsv = useCallback(() => {
    if (filteredJournals.length === 0) {
      toast.error("Aucun résultat à exporter");
      return;
    }

    const headers = [
      "Nom",
      "Éditeur",
      "ISSN",
      "Domaines",
      "Type OA",
      "Pays",
      "Source",
      "Page d'accueil",
      "APC",
    ];

    const rows = filteredJournals.map((j) => [
      `"${(j.name ?? "").replace(/"/g, '\"') }"`,
      `"${(j.publisher ?? "").replace(/"/g, '\"') }"`,
      j.issn ?? "",
      `"${j.subjects.join("; ")}"`,
      j.oaType ?? "",
      j.country ?? "",
      j.source,
      j.homepageUrl ?? "",
      j.apc ?? "",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `journaux-oa-${debouncedQuery.replace(/\s+/g, "_")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`${filteredJournals.length} journaux exportés en CSV`);
  }, [filteredJournals, debouncedQuery]);

  // Predatory detection helpers
  const alertCount = Object.values(alertChecks).filter(Boolean).length;
  const legitimacyCount = Object.values(legitimacyChecks).filter(Boolean).length;

  const toggleAlert = useCallback((id: string, checked: boolean) => {
    setAlertChecks((prev) => ({ ...prev, [id]: checked }));
  }, []);

  const toggleLegitimacy = useCallback(
    (id: string, checked: boolean) => {
      setLegitimacyChecks((prev) => ({ ...prev, [id]: checked }));
    },
    []
  );

  // Verdict logic
  const verdict = useMemo(() => {
    if (alertCount === 0) {
      return {
        level: "green" as const,
        title: "Aucun signal d'alerte détecté",
        description:
          "Les critères cochés ne révèlent pas de signe évident de revue prédatrice. Continuez à vérifier les signaux de légitimité.",
        borderColor: "border-emerald-500/40",
        bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
        textColor: "text-emerald-700 dark:text-emerald-300",
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
      };
    }
    if (alertCount <= 2) {
      return {
        level: "amber" as const,
        title: "Des signaux nécessitent une vérification approfondie",
        description:
          "Un ou plusieurs signaux d'alerte ont été identifiés. Vérifiez la revue sur des listes reconnues (Beall's list, Think. Check. Submit.) avant de soumettre.",
        borderColor: "border-amber-500/40",
        bgColor: "bg-amber-50 dark:bg-amber-950/20",
        textColor: "text-amber-700 dark:text-amber-300",
        icon: <TriangleAlert className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
      };
    }
    return {
      level: "red" as const,
      title:
        "Fort risque de revue prédatrice — vérifier impérativement avant soumission",
      description:
        "Plusieurs signaux d'alerte convergent vers une revue potentiellement prédatrice. Ne soumettez pas avant une vérification complète via des sources officielles.",
      borderColor: "border-red-500/40",
      bgColor: "bg-red-50 dark:bg-red-950/20",
      textColor: "text-red-700 dark:text-red-300",
      icon: <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />,
    };
  }, [alertCount]);

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BookMarked className="h-6 w-6 text-primary" />
          Journaux OA
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Recherchez des revues en accès ouvert via OpenAlex et DOAJ
        </p>
      </div>

      {/* DORA Principle Info Callout */}
      <div className="flex items-start gap-3 rounded-lg border border-sky-200 bg-sky-50 dark:border-sky-900/50 dark:bg-sky-950/20 p-4">
        <Info className="h-4.5 w-4.5 text-sky-600 dark:text-sky-400 mt-0.5 shrink-0" />
        <div className="text-xs text-sky-800 dark:text-sky-300 leading-relaxed">
          <p className="font-semibold mb-1">Principe DORA</p>
          <p>
            Ne jamais réduire l'évaluation d'une revue ou d'un article à un
            seul chiffre (facteur d'impact). Considérer consultations,
            téléchargements, mentions, et citations réelles.
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col gap-4">
          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un journal (ex. sociologie, machine learning)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-9"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={query.trim().length < 2}
            >
              <Search className="h-4 w-4 mr-2" />
              Rechercher
            </Button>
          </div>

          <Separator />

          {/* Filters row */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {/* Source toggle */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                Source :
              </span>
              <div className="flex gap-1.5">
                {[
                  { value: "both", label: "Toutes" },
                  { value: "openalex", label: "OpenAlex" },
                  { value: "doaj", label: "DOAJ" },
                ].map((s) => (
                  <Button
                    key={s.value}
                    variant={source === s.value ? "default" : "outline"}
                    size="sm"
                    className="h-8 text-xs px-3"
                    onClick={() => setSource(s.value)}
                  >
                    {s.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Subject filter */}
            <div className="flex items-center gap-2 sm:ml-auto">
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="w-auto min-w-[200px] h-8 text-xs">
                  <SelectValue placeholder="Domaine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    Toutes les disciplines
                  </SelectItem>
                  {SUBJECT_AREAS.filter(
                    (s) => s !== "Toutes les disciplines"
                  ).map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action bar */}
      {journals.length > 0 && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {filteredJournals.length} journal
            {filteredJournals.length !== 1 ? "s" : ""} trouvé
            {filteredJournals.length !== 1 ? "s" : ""}
            {subject !== "all" && (
              <span className="ml-1">
                (filtré{filteredJournals.length !== 1 ? "s" : ""})
              </span>
            )}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => rankMutation.mutate(filteredJournals)}
              disabled={
                rankMutation.isPending || filteredJournals.length === 0
              }
            >
              <Sparkles className="h-3.5 w-3.5" />
              {rankMutation.isPending
                ? "Classement en cours..."
                : "Classer par IA"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={exportCsv}
            >
              <Download className="h-3.5 w-3.5" />
              Exporter CSV
            </Button>
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings && warnings.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20 p-3">
          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-xs text-amber-800 dark:text-amber-300">
            <p className="font-medium">Avertissements :</p>
            <ul className="mt-1 list-disc list-inside space-y-0.5">
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && <JournalCardsSkeleton />}

      {/* Error state */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-10 w-10 text-destructive/40 mb-3" />
          <h3 className="text-sm font-medium">Erreur de recherche</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {error instanceof Error ? error.message : "Veuillez réessayer"}
          </p>
        </div>
      )}

      {/* Results */}
      {!isLoading && !isError && filteredJournals.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredJournals.map((journal) => (
            <JournalCard key={journal.id} journal={journal} />
          ))}
        </div>
      )}

      {/* Predatory Journal Detection — Collapsible Section */}
      <Collapsible open={predatoryOpen} onOpenChange={setPredatoryOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between items-center h-11 text-sm font-medium"
          >
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Évaluer la légitimité d'une revue
            </span>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${predatoryOpen ? "rotate-180" : ""}`}
            />
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-4">
          <div className="flex flex-col gap-6">
            {/* ── Alert Signals ── */}
            <Card className="border-red-200 dark:border-red-900/50">
              <CardHeader className="pb-3 p-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  Signaux d'alerte (prédatrices)
                </CardTitle>
                <CardDescription className="text-xs">
                  Cochez les signaux que vous observez pour la revue évaluée
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex flex-col gap-3">
                {ALERT_SIGNALS.map((signal) => (
                  <label
                    key={signal.id}
                    className="flex items-start gap-3 rounded-lg border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10 p-3 cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  >
                    <Checkbox
                      checked={alertChecks[signal.id] ?? false}
                      onCheckedChange={(checked) =>
                        toggleAlert(signal.id, checked === true)
                      }
                      className="mt-0.5 data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600 data-[state=checked]:text-white"
                    />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-red-700 dark:text-red-300">
                        {signal.label}
                      </span>
                      <span className="text-xs text-red-600/70 dark:text-red-400/70">
                        {signal.description}
                      </span>
                    </div>
                  </label>
                ))}
              </CardContent>
            </Card>

            {/* ── Legitimacy Signals ── */}
            <Card className="border-emerald-200 dark:border-emerald-900/50">
              <CardHeader className="pb-3 p-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                  Signaux de légitimité
                </CardTitle>
                <CardDescription className="text-xs">
                  Cochez les signaux positifs que vous avez vérifiés
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex flex-col gap-3">
                {LEGITIMACY_SIGNALS.map((signal) => (
                  <label
                    key={signal.id}
                    className="flex items-start gap-3 rounded-lg border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-950/10 p-3 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors"
                  >
                    <Checkbox
                      checked={legitimacyChecks[signal.id] ?? false}
                      onCheckedChange={(checked) =>
                        toggleLegitimacy(signal.id, checked === true)
                      }
                      className="mt-0.5 data-[state=checked]:border-emerald-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:text-white"
                    />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                        {signal.label}
                      </span>
                      <span className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
                        {signal.description}
                      </span>
                    </div>
                  </label>
                ))}
              </CardContent>
            </Card>

            {/* ── Verdict Card ── */}
            <Card
              className={`border-2 ${verdict.borderColor} ${verdict.bgColor}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{verdict.icon}</div>
                  <div className="flex flex-col gap-1.5">
                    <h4
                      className={`text-sm font-semibold ${verdict.textColor}`}
                    >
                      {verdict.title}
                    </h4>
                    <p
                      className={`text-xs ${verdict.textColor} opacity-80 leading-relaxed`}
                    >
                      {verdict.description}
                    </p>
                    <Separator className="my-2" />
                    <div className="flex items-center gap-2">
                      <ShieldCheck
                        className={`h-3.5 w-3.5 ${legitimacyCount > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}
                      />
                      <span className="text-xs font-medium text-muted-foreground">
                        {legitimacyCount}/3 signaux de légitimité confirmés
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Empty state */}
      {!isLoading &&
        !isError &&
        debouncedQuery.length >= 2 &&
        filteredJournals.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <h3 className="text-sm font-medium">Aucun résultat</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Aucun journal ne correspond à votre recherche.
              <br />
              Essayez avec des termes plus généraux ou changez la source.
            </p>
          </div>
        )}

      {/* Initial state */}
      {debouncedQuery.length < 2 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookMarked className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <h3 className="text-sm font-medium">
            Recherchez des revues en accès ouvert
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-md">
            Saisissez au moins 2 caractères pour rechercher des journaux dans
            les bases OpenAlex et DOAJ. Filtrez par domaine et classez les
            résultats par pertinence avec l&apos;IA.
          </p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// Journal Card
// ═══════════════════════════════════════
function JournalCard({ journal }: { journal: JournalResult }) {
  return (
    <Card className="hover:border-primary/20 transition-colors">
      <CardHeader className="pb-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-semibold leading-tight line-clamp-2">
            {journal.name}
          </CardTitle>
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${SOURCE_COLORS[journal.source]}`}
            >
              {journal.source === "openalex" ? "OpenAlex" : "DOAJ"}
            </span>
          </div>
        </div>
        <CardDescription className="text-xs mt-1">
          {journal.publisher}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 pt-0 flex flex-col gap-2.5">
        {/* Subjects */}
        {journal.subjects.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {journal.subjects.slice(0, 3).map((s, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="text-[10px] font-normal"
              >
                {s}
              </Badge>
            ))}
          </div>
        )}

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {journal.issn && (
            <span className="font-mono">ISSN : {journal.issn}</span>
          )}
          {journal.country && <span>{journal.country}</span>}
          {journal.apc && <span>APC : {journal.apc}</span>}
        </div>

        {/* Footer: OA type + link */}
        <div className="flex items-center justify-between mt-1">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium ${OA_TYPE_COLORS[journal.oaType] ?? OA_TYPE_COLORS["Non spécifié"]}`}
          >
            {journal.oaType}
          </span>
          {journal.homepageUrl && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
              asChild
            >
              <a
                href={journal.homepageUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-3 w-3" />
                Site web
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════
// Skeleton loader
// ═══════════════════════════════════════
function JournalCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2 p-4">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3 w-1/2 mt-1" />
          </CardHeader>
          <CardContent className="p-4 pt-0 flex flex-col gap-2.5">
            <div className="flex gap-1.5">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <Skeleton className="h-3 w-2/3" />
            <div className="flex items-center justify-between mt-1">
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-7 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
