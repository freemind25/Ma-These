"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Binoculars,
  RefreshCw,
  Pencil,
  Trash2,
  ArrowLeft,
  Eye,
  CheckCheck,
  ExternalLink,
  User,
  CalendarClock,
  Search,
  Loader2,
  GraduationCap,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAppStore } from "@/lib/stores/app-store";

// ── Types (miroirs des routes /api/veille) ──

interface VeilleItem {
  id: string;
  label: string;
  source: string;
  query: string;
  lastCheckedAt: string | null;
  createdAt: string;
  totalResults: number;
  unreadCount: number;
}

interface ResultItem {
  id: string;
  externalId: string;
  title: string;
  authors: string;
  year: number | null;
  url: string;
  abstract: string | null;
  seen: boolean;
  firstSeenAt: string;
}

// ── Helpers ──

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
});

function fmtDate(iso: string | null): string {
  if (!iso) return "Jamais vérifiée";
  try {
    return dateFmt.format(new Date(iso));
  } catch {
    return "—";
  }
}

// ── Page principale ──

export function VeilleAcademiquePage() {
  const setCurrentView = useAppStore((s) => s.setCurrentView);

  const [searches, setSearches] = useState<VeilleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [renameTarget, setRenameTarget] = useState<VeilleItem | null>(null);
  const [renameLabel, setRenameLabel] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<VeilleItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadSearches = useCallback(async () => {
    try {
      setError("");
      const res = await fetch("/api/veille");
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Erreur");
      setSearches(payload.data || []);
    } catch {
      setError("Impossible de charger les veilles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSearches();
  }, [loadSearches]);

  const runCheck = useCallback(
    async (id: string) => {
      setCheckingId(id);
      try {
        const res = await fetch(`/api/veille/${id}/check`, { method: "POST" });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error || "Erreur de vérification");
        const d = payload.data as {
          isFirstCheck: boolean;
          newCount: number;
          unreadCount: number;
        };
        if (d.isFirstCheck) {
          toast.success("Vérification terminée", {
            description: "Base de référence créée — ce premier relevé ne compte aucun « nouveau ».",
          });
        } else if (d.newCount > 0) {
          toast.success(`${d.newCount} nouveau${d.newCount > 1 ? "x" : ""} résultat${d.newCount > 1 ? "s" : ""}`, {
            description: "Rendez-vous dans le détail de la veille pour les consulter.",
          });
        } else {
          toast.info("Aucun nouveau résultat depuis la dernière vérification");
        }
        await loadSearches();
        return true;
      } catch (err) {
        toast.error("Échec de la vérification", {
          description: err instanceof Error ? err.message : undefined,
        });
        return false;
      } finally {
        setCheckingId(null);
      }
    },
    [loadSearches]
  );

  const submitRename = async () => {
    if (!renameTarget || !renameLabel.trim()) return;
    try {
      const res = await fetch(`/api/veille/${renameTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: renameLabel }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Erreur");
      toast.success("Veille renommée");
      setRenameTarget(null);
      await loadSearches();
    } catch (err) {
      toast.error("Échec du renommage", {
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

  const submitDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/veille/${deleteTarget.id}`, { method: "DELETE" });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Erreur");
      toast.success("Veille supprimée", { description: "Les résultats associés ont été supprimés." });
      setDeleteTarget(null);
      await loadSearches();
    } catch (err) {
      toast.error("Échec de la suppression", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setDeleting(false);
    }
  };

  const openRename = (veille: VeilleItem) => {
    setRenameTarget(veille);
    setRenameLabel(veille.label);
  };

  const selected = searches.find((s) => s.id === selectedId) ?? null;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/40">
            <Binoculars className="w-5 h-5 text-violet-700 dark:text-violet-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Veille académique</h1>
            <p className="text-sm text-muted-foreground">
              Suivez vos recherches HAL et arXiv — soyez alerté des nouveaux résultats
            </p>
          </div>
        </div>
        {selected && (
          <Button variant="outline" size="sm" onClick={() => setSelectedId(null)}>
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Toutes les veilles
          </Button>
        )}
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-12 flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p className="font-medium">Chargement des veilles...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-red-200 dark:border-red-800/50">
          <CardContent className="p-8 text-center text-red-600 dark:text-red-400">
            <p className="font-medium">Erreur</p>
            <p className="text-sm mt-1">{error}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => { setLoading(true); loadSearches(); }}>
              <RefreshCw className="w-4 h-4 mr-1.5" /> Réessayer
            </Button>
          </CardContent>
        </Card>
      ) : selected ? (
        <VeilleDetail veille={selected} onCheck={runCheck} checking={checkingId === selected.id} />
      ) : searches.length === 0 ? (
        /* État vide explicite — CA-1.3 : invitation à créer depuis une recherche */
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Binoculars className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium text-lg">Aucune veille active</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              Lancez une recherche dans <strong>Thèses en ligne</strong> (HAL) ou{" "}
              <strong>Bases de données</strong> (arXiv), puis cliquez sur{" "}
              <span className="inline-flex items-center gap-1 font-medium text-violet-700 dark:text-violet-400">
                <Binoculars className="w-3.5 h-3.5" /> suivre cette recherche
              </span>{" "}
              pour être alerté des nouveaux résultats.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              <Button variant="outline" size="sm" onClick={() => setCurrentView("theses-en-ligne")}>
                <GraduationCap className="w-4 h-4 mr-1.5" /> Thèses en ligne
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentView("academic-db")}>
                <Globe className="w-4 h-4 mr-1.5" /> Bases de données (arXiv)
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* ── Liste des veilles — CA-3.2 / CA-2.4 ── */
        <div className="space-y-3">
          {searches.map((veille) => (
            <VeilleCard
              key={veille.id}
              veille={veille}
              checking={checkingId === veille.id}
              onCheck={() => runCheck(veille.id)}
              onOpen={() => setSelectedId(veille.id)}
              onRename={() => openRename(veille)}
              onDelete={() => setDeleteTarget(veille)}
            />
          ))}
        </div>
      )}

      {/* Dialog renommage (CA-1.1) */}
      <Dialog open={!!renameTarget} onOpenChange={(open) => !open && setRenameTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Renommer la veille</DialogTitle>
            <DialogDescription>
              Le libellé n&apos;affecte ni la requête ni les résultats suivis.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={renameLabel}
            onChange={(e) => setRenameLabel(e.target.value)}
            placeholder="Nouveau libellé"
            onKeyDown={(e) => e.key === "Enter" && submitRename()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget(null)}>Annuler</Button>
            <Button onClick={submitRename} disabled={!renameLabel.trim()}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation suppression (CA-1.2) */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette veille ?</AlertDialogTitle>
            <AlertDialogDescription>
              « {deleteTarget?.label} » et ses {deleteTarget?.totalResults ?? 0} résultat(s) suivis
              seront définitivement supprimés. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); submitDelete(); }}
              disabled={deleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleting ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Trash2 className="w-4 h-4 mr-1.5" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Carte d'une veille (liste) ──

function VeilleCard({
  veille,
  checking,
  onCheck,
  onOpen,
  onRename,
  onDelete,
}: {
  veille: VeilleItem;
  checking: boolean;
  onCheck: () => void;
  onOpen: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="group transition-all hover:shadow-md hover:border-violet-300 dark:hover:border-violet-700">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <button
            type="button"
            onClick={onOpen}
            className="flex-1 text-left min-w-0 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 rounded-lg"
            aria-label={`Ouvrir la veille ${veille.label}`}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">{veille.label}</span>
              <Badge
                variant="outline"
                className="text-xs font-normal border-violet-300 text-violet-700 dark:border-violet-700 dark:text-violet-400"
              >
                {veille.source === "hal" ? "HAL" : "arXiv"}
              </Badge>
              {veille.unreadCount > 0 && (
                <Badge className="text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                  {veille.unreadCount} nouveau{veille.unreadCount > 1 ? "x" : ""}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              <Search className="w-3 h-3 inline mr-1 -translate-y-px" />
              {veille.query}
            </p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <CalendarClock className="w-3 h-3" />
              Dernière vérification : {fmtDate(veille.lastCheckedAt)}
              <span className="mx-1.5">·</span>
              {veille.totalResults} résultat{veille.totalResults > 1 ? "s" : ""} suivi{veille.totalResults > 1 ? "s" : ""}
            </p>
          </button>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onCheck}
              disabled={checking}
              aria-label={`Vérifier la veille ${veille.label}`}
            >
              {checking ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1.5" />}
              Vérifier
            </Button>
            <Button variant="ghost" size="icon" onClick={onRename} aria-label="Renommer la veille" className="w-9 h-9">
              <Pencil className="w-4 h-4 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              aria-label="Supprimer la veille"
              className="w-9 h-9 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Vue détail : résultats d'une veille ──

function VeilleDetail({
  veille,
  onCheck,
  checking,
}: {
  veille: VeilleItem;
  onCheck: () => Promise<boolean>;
  checking: boolean;
}) {
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingAll, setMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const loadResults = useCallback(async () => {
    try {
      setError("");
      const res = await fetch(`/api/veille/${veille.id}/results`);
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Erreur");
      setResults(payload.data || []);
    } catch {
      setError("Impossible de charger les résultats");
    } finally {
      setLoading(false);
    }
  }, [veille.id]);

  useEffect(() => {
    setLoading(true);
    loadResults();
  }, [loadResults]);

  const markSeen = async (ids?: string[]) => {
    const global = !ids;
    if (global) setMarkingAll(true);
    else setMarkingId(ids[0] ?? null);
    try {
      const res = await fetch(`/api/veille/${veille.id}/results`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(global ? { all: true } : { ids }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Erreur");
      await loadResults();
    } catch (err) {
      toast.error("Échec du marquage", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setMarkingAll(false);
      setMarkingId(null);
    }
  };

  const unreadCount = results.filter((r) => !r.seen).length;

  return (
    <div className="space-y-4">
      {/* En-tête détail */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold">{veille.label}</span>
                <Badge
                  variant="outline"
                  className="text-xs font-normal border-violet-300 text-violet-700 dark:border-violet-700 dark:text-violet-400"
                >
                  {veille.source === "hal" ? "HAL" : "arXiv"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                <Search className="w-3 h-3 inline mr-1 -translate-y-px" /> {veille.query}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                <CalendarClock className="w-3 h-3" /> Dernière vérification : {fmtDate(veille.lastCheckedAt)}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={onCheck}
                disabled={checking}
              >
                {checking ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1.5" />}
                Vérifier
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => markSeen()}
                disabled={markingAll || unreadCount === 0}
              >
                {markingAll ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <CheckCheck className="w-4 h-4 mr-1.5" />}
                Tout marquer comme vu
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Résultats */}
      {loading ? (
        <Card>
          <CardContent className="p-12 flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p className="font-medium">Chargement des résultats...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-red-200 dark:border-red-800/50">
          <CardContent className="p-8 text-center text-red-600 dark:text-red-400">
            <p className="font-medium">Erreur</p>
            <p className="text-sm mt-1">{error}</p>
          </CardContent>
        </Card>
      ) : results.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center text-muted-foreground">
            <Binoculars className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Aucun résultat pour l&apos;instant</p>
            <p className="text-sm mt-1">Cliquez sur « Vérifier » pour effectuer le premier relevé.</p>
          </CardContent>
        </Card>
      ) : unreadCount === 0 ? (
        /* CA-2.3 : état vide explicite quand rien de nouveau */
        <Card className="border-dashed">
          <CardContent className="p-8 text-center text-muted-foreground">
            <CheckCheck className="w-8 h-8 mx-auto mb-3 opacity-40 text-emerald-600 dark:text-emerald-400" />
            <p className="font-medium">Aucun nouveau résultat</p>
            <p className="text-sm mt-1">
              Aucun nouveau résultat depuis la vérification du {fmtDate(veille.lastCheckedAt)}.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-3 pr-3">
            {results.map((result) => (
              <ResultCard
                key={result.id}
                result={result}
                marking={markingId === result.id}
                onMarkSeen={() => markSeen([result.id])}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

// ── Carte résultat ──

function ResultCard({
  result,
  marking,
  onMarkSeen,
}: {
  result: ResultItem;
  marking: boolean;
  onMarkSeen: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const authors = result.authors ? result.authors.split(" ; ").filter(Boolean) : [];
  const abstract = result.abstract || "";
  const truncated = abstract.length > 260;
  const displayAbstract = !abstract ? "" : expanded || !truncated ? abstract : abstract.slice(0, 260) + "...";

  return (
    <Card className={!result.seen ? "border-emerald-300 dark:border-emerald-800/60" : undefined}>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <a
            href={result.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-sm leading-relaxed hover:text-violet-700 dark:hover:text-violet-400 flex-1"
          >
            {result.title || "Sans titre"}
          </a>
          <div className="flex items-center gap-1.5 shrink-0">
            {!result.seen && (
              <Badge className="text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                Nouveau
              </Badge>
            )}
            {result.year !== null && (
              <Badge variant="secondary" className="text-xs font-normal">{result.year}</Badge>
            )}
          </div>
        </div>

        {authors.length > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <User className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{authors.join(", ")}</span>
          </div>
        )}

        {abstract && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {displayAbstract}
            {truncated && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="ml-1 text-violet-600 dark:text-violet-400 hover:underline text-xs font-medium"
              >
                {expanded ? "Réduire" : "Lire la suite"}
              </button>
            )}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-xs text-muted-foreground">Relevé le {fmtDate(result.firstSeenAt)}</span>
          <div className="flex items-center gap-2">
            {result.url && (
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400 inline-flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" /> Ouvrir
              </a>
            )}
            {!result.seen && (
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onMarkSeen} disabled={marking}>
                {marking ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Eye className="w-3 h-3 mr-1" />}
                Marquer comme vu
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
