"use client";

import { useState, useCallback } from "react";
import {
  ShieldCheck, Search, Loader2, AlertTriangle, CheckCircle2,
  XCircle, BookOpen, ExternalLink, Trash2,
  Calculator, AlertCircle,
  BarChart3, Database,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// ── Types ──

interface RegistryResult {
  registry: string;
  found: boolean;
  title?: string;
  authors?: string[];
  year?: number;
  doi?: string;
  journal?: string;
  isRetracted?: boolean;
  retractionNotice?: string;
  openAccess?: boolean;
  citationCount?: number;
  url?: string;
  error?: string;
  latencyMs: number;
}

interface CitationCheckResult {
  citation: { raw: string; doi?: string; title?: string; authors?: string[]; year?: number };
  results: RegistryResult[];
  verdict: "verified" | "unverified" | "retracted" | "mismatch" | "error";
  summary: string;
}

interface ExtractedStat {
  type: "t" | "F" | "chi2" | "z" | "r";
  statistic: number;
  df1: number;
  df2?: number;
  reportedP: number;
  computedP: number;
  pLower: number;
  pUpper: number;
  flag: "ok" | "inconsistent" | "gross_error";
  raw: string;
  context: string;
}

// ── Registry metadata ──

const REGISTRY_META: Record<string, { label: string; color: string; url: string }> = {
  Crossref: { label: "Crossref", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", url: "https://www.crossref.org" },
  OpenAlex: { label: "OpenAlex", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300", url: "https://openalex.org" },
  "Semantic Scholar": { label: "Semantic Scholar", color: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300", url: "https://www.semanticscholar.org" },
  DOAJ: { label: "DOAJ", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300", url: "https://doaj.org" },
  PubMed: { label: "PubMed", color: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300", url: "https://pubmed.ncbi.nlm.nih.gov" },
};

const VERDICT_STYLES: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  verified: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/10" },
  unverified: { icon: XCircle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/10" },
  retracted: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/10" },
  mismatch: { icon: AlertCircle, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/10" },
  error: { icon: AlertCircle, color: "text-gray-500", bg: "bg-gray-50 dark:bg-gray-900/10" },
};

// ── Component ──

export function VerificationCitationsPage() {
  const { toast } = useToast();

  // Citation check state
  const [citeText, setCiteText] = useState("");
  const [citeLoading, setCiteLoading] = useState(false);
  const [citeResults, setCiteResults] = useState<CitationCheckResult[] | null>(null);
  const [citeSummary, setCiteSummary] = useState<{ total: number; verified: number; unverified: number; retracted: number; mismatch: number } | null>(null);
  const [expandedCite, setExpandedCite] = useState<number | null>(null);

  // Stats recompute state
  const [statsText, setStatsText] = useState("");
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsResults, setStatsResults] = useState<ExtractedStat[] | null>(null);
  const [statsSummary, setStatsSummary] = useState<{ total: number; ok: number; inconsistent: number; grossErrors: number } | null>(null);

  // ── Citation Check ──

  const handleCitationCheck = useCallback(async () => {
    if (!citeText.trim()) return;
    setCiteLoading(true);
    setCiteResults(null);
    setCiteSummary(null);
    try {
      const res = await fetch("/api/citation-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: citeText }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Erreur", description: data.error, variant: "destructive" });
        return;
      }
      setCiteResults(data.results);
      setCiteSummary({ total: data.total, verified: data.verified, unverified: data.unverified, retracted: data.retracted, mismatch: data.mismatch });
      if (data.retracted > 0) {
        toast({ title: "⚠️ Rétractation(s) détectée(s)", description: `${data.retracted} citation(s) rétractée(s) trouvée(s)`, variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur réseau", variant: "destructive" });
    } finally {
      setCiteLoading(false);
    }
  }, [citeText, toast]);

  // ── Stats Recompute ──

  const handleStatsCheck = useCallback(async () => {
    if (!statsText.trim()) return;
    setStatsLoading(true);
    setStatsResults(null);
    setStatsSummary(null);
    try {
      const res = await fetch("/api/stats-recompute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: statsText }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Erreur", description: data.error, variant: "destructive" });
        return;
      }
      setStatsResults(data.stats);
      setStatsSummary({ total: data.total, ok: data.ok, inconsistent: data.inconsistent, grossErrors: data.grossErrors });
      if (data.grossErrors > 0) {
        toast({ title: "⚠️ Erreur(s) statistique(s)", description: `${data.grossErrors} valeur(s) p incohérente(s)`, variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur réseau", variant: "destructive" });
    } finally {
      setStatsLoading(false);
    }
  }, [statsText, toast]);

  // ── Render helpers ──

  const renderCiteSummary = () => {
    if (!citeSummary) return null;
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className={citeSummary.verified > 0 ? "" : "opacity-50"}><CardContent className="p-3 text-center"><div className="text-2xl font-bold text-emerald-600">{citeSummary.verified}</div><div className="text-xs text-muted-foreground">Vérifiés</div></CardContent></Card>
        <Card className={citeSummary.unverified > 0 ? "" : "opacity-50"}><CardContent className="p-3 text-center"><div className="text-2xl font-bold text-red-600">{citeSummary.unverified}</div><div className="text-xs text-muted-foreground">Non trouvés</div></CardContent></Card>
        <Card className={citeSummary.retracted > 0 ? "" : "opacity-50"}><CardContent className="p-3 text-center"><div className="text-2xl font-bold text-amber-600">{citeSummary.retracted}</div><div className="text-xs text-muted-foreground">Rétractés</div></CardContent></Card>
        <Card className={citeSummary.mismatch > 0 ? "" : "opacity-50"}><CardContent className="p-3 text-center"><div className="text-2xl font-bold text-orange-600">{citeSummary.mismatch}</div><div className="text-xs text-muted-foreground">Incohérents</div></CardContent></Card>
    </div>
    );
  };

  const renderCiteResults = () => {
    if (!citeResults) return null;
    return (
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {citeResults.map((item, i) => {
          const style = VERDICT_STYLES[item.verdict];
          const VerdictIcon = style.icon;
          const isExpanded = expandedCite === i;
          return (
            <Card key={i} className={`${style.bg} transition-colors`}>
              <CardContent className="p-3">
                <div
                  className="flex items-start gap-3 cursor-pointer"
                  onClick={() => setExpandedCite(isExpanded ? null : i)}
                >
                  <VerdictIcon className={`h-5 w-5 mt-0.5 shrink-0 ${style.color}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm line-clamp-2 font-medium">{item.citation.raw}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs font-medium" style={{ color: `var(--color-${item.verdict})` }}>{item.summary}</span>
                      <span className="text-xs text-muted-foreground">{isExpanded ? "▲" : "▼"} détails</span>
                    </div>
                  </div>
                </div>
                {isExpanded && (
                  <div className="mt-3 ml-8 space-y-2 border-t pt-3">
                    {item.results.map((r, j) => {
                      const meta = REGISTRY_META[r.registry];
                      return (
                        <div key={j} className="text-xs">
                          <div className="flex items-center gap-2">
                            <Badge variant={r.found ? "secondary" : "outline"} className={meta?.color || ""}>
                              {r.registry}
                            </Badge>
                            <span className={r.found ? "text-emerald-600" : "text-red-500"}>
                              {r.found ? "✓ Trouvé" : r.isRetracted ? "⚠️ Rétracté" : "✗ Non trouvé"}
                            </span>
                            <span className="text-muted-foreground">({r.latencyMs}ms)</span>
                          </div>
                          {r.found && (
                            <div className="ml-4 mt-1 space-y-0.5 text-muted-foreground">
                              {r.title && <p>Titre : <span className="text-foreground">{r.title.slice(0, 120)}{r.title.length > 120 ? "..." : ""}</span></p>}
                              {r.authors && r.authors.length > 0 && <p>Auteurs : {r.authors.join(", ").slice(0, 100)}</p>}
                              {r.year && <p>Année : {r.year}</p>}
                              {r.doi && (
                                <p>DOI : <a href={`https://doi.org/${r.doi}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">{r.doi}</a></p>
                              )}
                              {r.journal && <p>Journal : {r.journal}</p>}
                              {r.citationCount !== undefined && <p>Citations : {r.citationCount.toLocaleString("fr-FR")}</p>}
                              {r.openAccess && <Badge variant="outline" className="text-[10px] h-4">Open Access</Badge>}
                              {r.url && (
                                <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline">
                                  <ExternalLink className="h-3 w-3" /> Voir
                                </a>
                              )}
                            </div>
                          )}
                          {!r.found && r.error && <p className="ml-4 text-muted-foreground">{r.error}</p>}
                          {r.retractionNotice && <p className="ml-4 text-amber-600 font-medium">{r.retractionNotice}</p>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderStatsSummary = () => {
    if (!statsSummary) return null;
    return (
      <div className="grid grid-cols-3 gap-3">
        <Card className={statsSummary.ok > 0 ? "" : "opacity-50"}><CardContent className="p-3 text-center"><div className="text-2xl font-bold text-emerald-600">{statsSummary.ok}</div><div className="text-xs text-muted-foreground">Corrects</div></CardContent></Card>
        <Card className={statsSummary.inconsistent > 0 ? "" : "opacity-50"}><CardContent className="p-3 text-center"><div className="text-2xl font-bold text-amber-600">{statsSummary.inconsistent}</div><div className="text-xs text-muted-foreground">Incohérents</div></CardContent></Card>
        <Card className={statsSummary.grossErrors > 0 ? "" : "opacity-50"}><CardContent className="p-3 text-center"><div className="text-2xl font-bold text-red-600">{statsSummary.grossErrors}</div><div className="text-xs text-muted-foreground">Erreurs graves</div></CardContent></Card>
      </div>
    );
  };

  const renderStatsResults = () => {
    if (!statsResults) return null;
    return (
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {statsResults.map((stat, i) => {
          const isOk = stat.flag === "ok";
          const isError = stat.flag === "gross_error";
          const typeLabel = { t: "Student t", F: "Fisher F", chi2: "Chi-carré", z: "Z", r: "Corrélation r" }[stat.type];
          return (
            <Card key={i} className={isOk ? "" : isError ? "bg-red-50 dark:bg-red-900/10" : "bg-amber-50 dark:bg-amber-900/10"}>
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center gap-2">
                  {isOk ? <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" /> : isError ? <XCircle className="h-5 w-5 text-red-600 shrink-0" /> : <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />}
                  <Badge variant="outline" className="text-xs">{typeLabel}</Badge>
                  <code className="text-sm font-mono">{stat.raw}</code>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs ml-7">
                  <div><span className="text-muted-foreground">Rapporté : </span><span className={isOk ? "text-emerald-600" : "text-red-600 font-medium"}>{stat.reportedP}</span></div>
                  <div><span className="text-muted-foreground">Recalculé : </span><span className={isOk ? "text-emerald-600" : "text-red-600 font-medium"}>{stat.computedP}</span></div>
                  <div><span className="text-muted-foreground">Fourchette : </span>[{stat.pLower}, {stat.pUpper}]</div>
                  <div><span className="text-muted-foreground">Statistique : </span>{stat.statistic}{stat.df2 !== undefined ? ` (${stat.df1}, ${stat.df2})` : ` (df=${stat.df1})`}</div>
                </div>
                {!isOk && (
                  <p className="text-xs ml-7 text-red-600 dark:text-red-400">
                    {isError ? "La valeur p rapportée est en dehors de la fourchette d\u2019arrondi — erreur probable." : "Légère incohérence entre la valeur p rapportée et la statistique."}
                  </p>
                )}
                {stat.context && <p className="text-xs text-muted-foreground ml-7 italic">…{stat.context.slice(0, 200)}…</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40">
          <ShieldCheck className="w-5 h-5 text-blue-700 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Vérification Citations</h1>
          <p className="text-sm text-muted-foreground">
            Vérifiez vos références contre 5 registres académiques et recalculez vos statistiques
          </p>
        </div>
        <Badge variant="secondary" className="ml-auto text-xs">5 registres</Badge>
      </div>

      <Tabs defaultValue="citations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="citations" className="gap-1.5">
            <Database className="h-4 w-4" />
            Vérification Citations
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-1.5">
            <Calculator className="h-4 w-4" />
            Recalcul Statistiques
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: Citation Check ── */}
        <TabsContent value="citations" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Coller vos références bibliographiques</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder={`Exemples (une par ligne) :
Smith, J. (2020). The impact of AI on research. Nature, 580, 123-134. doi:10.1038/s41586-020-1234-5
Dupont, A. & Martin, B. (2019). "Méthodologie qualitative". Revue française, 45(2), 100-115.
Zhang et al. (2021) 10.1007/s00134-021-06500-3`}
                value={citeText}
                onChange={(e) => setCiteText(e.target.value)}
                className="min-h-[160px] font-mono text-sm"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {citeText.split("\n").filter(l => l.trim().length > 5).length} citation(s) détectée(s) • Max 50
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCiteText("")}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" onClick={handleCitationCheck} disabled={citeLoading || !citeText.trim()} className="gap-1.5">
                    {citeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    {citeLoading ? "Vérification..." : "Vérifier les citations"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {renderCiteSummary()}
          {renderCiteResults()}

          {!citeResults && !citeLoading && (
            <Card>
              <CardContent className="p-8 text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Collez vos références bibliographiques ci-dessus. Chaque citation sera vérifiée contre
                  <strong> Crossref, OpenAlex, Semantic Scholar, DOAJ et PubMed</strong>.
                  Les rétractations sont détectées automatiquement.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── TAB 2: Stats Recompute ── */}
        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Coller le texte de vos résultats</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder={`Exemples :
Le résultat du test t(45) = 3.21 est significatif, p < .01.
L'analyse de variance a révélé un effet principal, F(2, 87) = 4.56, p = .013.
Le chi-carré a montré une association significative, χ²(3) = 12.4, p = .006.
La corrélation entre X et Y était significative, r(120) = 0.35, p < .001.`}
                value={statsText}
                onChange={(e) => setStatsText(e.target.value)}
                className="min-h-[160px] font-mono text-sm"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Détecte : t-test, F-test (ANOVA), Chi-carré, Z-test, Corrélation r
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setStatsText("")}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" onClick={handleStatsCheck} disabled={statsLoading || !statsText.trim()} className="gap-1.5">
                    {statsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
                    {statsLoading ? "Calcul..." : "Recalculer"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {renderStatsSummary()}
          {renderStatsResults()}

          {!statsResults && !statsLoading && (
            <Card>
              <CardContent className="p-8 text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Collez vos résultats statistiques. Le système extrait les tests (t, F, χ², z, r),
                  recalcule les <strong>valeurs p</strong> à partir des statistiques rapportées,
                  et les compare avec les valeurs déclarées dans votre texte.
                </p>
                <p className="text-xs text-muted-foreground">
                  Méthode inspirée de Nuijten et al. (2016) — statcheck.
                  Aucun modèle IA impliqué — calcul mathématique déterministe.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
