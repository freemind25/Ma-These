"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Trash2,
  FileText,
  GraduationCap,
} from "lucide-react";
import { useTheses, useDeleteThesis } from "@/modules/editor/hooks/use-thesis";
import { useAppStore } from "@/lib/stores/app-store";
import { CreateThesisDialog } from "./create-thesis-dialog";
import { formatDistanceToNow } from "date-fns";

export function ThesisListPanel() {
  const { data: theses, isLoading } = useTheses();
  const deleteThesis = useDeleteThesis();
  const { activeThesisId, setActiveThesisId, setCurrentView } = useAppStore();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Mes thèses</h2>
        <CreateThesisDialog />
      </div>

      {/* Thesis list */}
      {theses && theses.length > 0 ? (
        <div className="grid gap-3">
          {theses.map((thesis) => {
            const totalWords = thesis.chapters.reduce(
              (acc, ch) => acc + ch.wordCount,
              0
            );
            const completedChapters = thesis.chapters.filter(
              (ch) => ch.status === "completed"
            ).length;
            const progress =
              thesis.chapters.length > 0
                ? (completedChapters / thesis.chapters.length) * 100
                : 0;

            return (
              <Card
                key={thesis.id}
                className={`cursor-pointer transition-all hover:border-primary/30 hover:shadow-sm ${
                  activeThesisId === thesis.id
                    ? "border-primary ring-1 ring-primary/20"
                    : ""
                }`}
                onClick={() => {
                  setActiveThesisId(thesis.id);
                  setCurrentView("editor");
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                      <h3 className="text-sm font-semibold truncate">
                        {thesis.title}
                      </h3>
                      {thesis.subtitle && (
                        <span className="text-xs text-muted-foreground truncate">
                          {thesis.subtitle}
                        </span>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{thesis.author}</span>
                        {thesis.institution && (
                          <>
                            <span className="text-muted-foreground/40">·</span>
                            <span>{thesis.institution}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <FileText className="h-3 w-3" />
                          <span>
                            {thesis.chapters.length} chapitres
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span>{totalWords.toLocaleString("fr-FR")} mots</span>
                        </div>
                        <Badge
                          variant={
                            thesis.status === "completed"
                              ? "default"
                              : "secondary"
                          }
                          className="text-[10px] h-5"
                        >
                          {thesis.status === "draft"
                            ? "Brouillon"
                            : thesis.status === "in_progress"
                              ? "En cours"
                              : thesis.status === "review"
                                ? "Révision"
                                : thesis.status === "completed"
                                  ? "Terminée"
                                  : "Brouillon"}
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                          <span>Progression</span>
                          <span>
                            {completedChapters}/{thesis.chapters.length}{" "}
                            chapitres
                          </span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteThesis.mutate(thesis.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                      </Button>
                      <span className="text-[10px] text-muted-foreground">
                        {thesis.updatedAt &&
                          formatDistanceToNow(new Date(thesis.updatedAt), {
                            addSuffix: true,

                          })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <GraduationCap className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-semibold mb-1">Aucune thèse</h3>
        <p className="text-xs text-muted-foreground max-w-[250px]">
          Créez votre première thèse pour commencer à rédiger avec
          l&apos;assistance IA.
        </p>
      </CardContent>
    </Card>
  );
}
