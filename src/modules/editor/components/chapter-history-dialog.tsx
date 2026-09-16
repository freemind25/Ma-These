"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { History, Loader2, GitCompareArrows } from "lucide-react";
import { wordDiff, diffStats, type DiffSegment } from "@/lib/word-diff";

// ═══════════════════════════════════════════════════════════════
// A.4 (annexe technique) — Historique natif des chapitres avec
// diff mot à mot affiché dans l'application (plus de calcul hors outil).
// Deux sauvegardes successives modifiant le contenu → deux versions
// comparables ici, sans aucune intervention extérieure.
// ═══════════════════════════════════════════════════════════════

interface ChapterVersion {
  id: string;
  content: string;
  plainText: string;
  wordCount: number;
  author: string;
  createdAt: string;
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function DiffView({ segments }: { segments: DiffSegment[] }) {
  return (
    <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
      {segments.map((seg, i) => {
        if (seg.type === "equal") {
          return <span key={i} className="text-foreground/70">{seg.text}</span>;
        }
        if (seg.type === "add") {
          return (
            <span
              key={i}
              className="rounded-sm bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
            >
              {seg.text}
            </span>
          );
        }
        return (
          <span
            key={i}
            className="rounded-sm bg-red-500/15 text-red-700 line-through decoration-red-400/60 dark:text-red-400"
          >
            {seg.text}
          </span>
        );
      })}
    </div>
  );
}

export function ChapterHistoryButton({ chapterId }: { chapterId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [versions, setVersions] = useState<ChapterVersion[]>([]);
  // Index des versions comparées : par défaut la plus récente (0) vs la précédente (1)
  const [newerIdx, setNewerIdx] = useState(0);
  const [olderIdx, setOlderIdx] = useState(1);

  const fetchVersions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/chapters/${chapterId}/versions`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Échec du chargement");
      const list: ChapterVersion[] = json.data || [];
      setVersions(list);
      setNewerIdx(0);
      setOlderIdx(list.length > 1 ? 1 : 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, [chapterId]);

  useEffect(() => {
    if (open) {
      fetchVersions();
    }
  }, [open, fetchVersions]);

  const segments = useMemo(() => {
    const older = versions[olderIdx];
    const newer = versions[newerIdx];
    if (!older || !newer || older.id === newer.id) return null;
    return wordDiff(older.plainText, newer.plainText);
  }, [versions, olderIdx, newerIdx]);

  const stats = useMemo(
    () => (segments ? diffStats(segments) : null),
    [segments]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          title="Historique et diff des versions du chapitre"
        >
          <History className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
          Historique
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <GitCompareArrows className="h-4 w-4" aria-hidden="true" />
            Historique du chapitre
          </DialogTitle>
          <DialogDescription>
            Chaque sauvegarde modifiant le contenu crée une version. Sélectionnez
            deux versions pour comparer — le diff est calculé au niveau du mot,
            dans l&apos;application.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Chargement de l&apos;historique…
          </div>
        ) : error ? (
          <div className="py-8 text-center text-sm text-destructive">{error}</div>
        ) : versions.length < 2 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {versions.length === 0
              ? "Aucune version enregistrée pour l'instant — la prochaine sauvegarde modifiant le contenu créera la première."
              : "Une seule version enregistrée — effectuez une seconde sauvegarde après modification pour voir le diff."}
          </div>
        ) : (
          <>
            {/* Sélecteurs de comparaison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                Version récente (après)
                <select
                  className="h-9 rounded-md border bg-background px-3 text-sm text-foreground"
                  value={newerIdx}
                  onChange={(e) => setNewerIdx(Number(e.target.value))}
                >
                  {versions.map((v, idx) =>
                    idx === olderIdx ? null : (
                      <option key={v.id} value={idx}>
                        {formatDateTime(v.createdAt)} — {v.wordCount} mots
                      </option>
                    )
                  )}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                Version ancienne (avant)
                <select
                  className="h-9 rounded-md border bg-background px-3 text-sm text-foreground"
                  value={olderIdx}
                  onChange={(e) => setOlderIdx(Number(e.target.value))}
                >
                  {versions.map((v, idx) =>
                    idx === newerIdx ? null : (
                      <option key={v.id} value={idx}>
                        {formatDateTime(v.createdAt)} — {v.wordCount} mots
                      </option>
                    )
                  )}
                </select>
              </label>
            </div>

            {/* Statistiques du diff */}
            {stats && (
              <div className="flex items-center gap-3 text-xs">
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 font-medium text-emerald-700 dark:text-emerald-400 tabular-nums">
                  +{stats.added} mot{stats.added > 1 ? "s" : ""}
                </span>
                <span className="rounded-full bg-red-500/15 px-2.5 py-1 font-medium text-red-700 dark:text-red-400 tabular-nums">
                  −{stats.deleted} mot{stats.deleted > 1 ? "s" : ""}
                </span>
                <span className="text-muted-foreground">
                  {versions[newerIdx]?.author} → comparaison mot à mot native
                </span>
              </div>
            )}

            {/* Diff scrollable */}
            <ScrollArea className="flex-1 min-h-0 max-h-[46vh] rounded-md border p-4">
              {segments ? (
                <DiffView segments={segments} />
              ) : (
                <Skeleton className="h-24 w-full" />
              )}
            </ScrollArea>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
