"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, FileText, Check, Circle, Clock, Loader2 } from "lucide-react";
import type { ThesisChapter } from "@/modules/editor/hooks/use-thesis";

interface ChapterTabsProps {
  chapters: ThesisChapter[];
  activeChapterId: string | null;
  onSelectChapter: (id: string) => void;
  onAddChapter?: () => void;
}

const STATUS_ICON: Record<string, React.ElementType> = {
  not_started: Circle,
  in_progress: Clock,
  draft: Loader2,
  review: FileText,
  completed: Check,
};

const STATUS_CLASS: Record<string, string> = {
  not_started: "text-muted-foreground/40",
  in_progress: "text-chart-4",
  draft: "text-chart-5",
  review: "text-chart-3",
  completed: "text-chart-2",
};

export function ChapterTabs({
  chapters,
  activeChapterId,
  onSelectChapter,
  onAddChapter,
}: ChapterTabsProps) {
  if (chapters.length === 0) {
    return (
      <div className="flex items-center justify-center h-12 border-b text-sm text-muted-foreground">
        Aucun chapitre. Cliquez sur + pour en ajouter.
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="border-b bg-background">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex items-center gap-0.5 px-2 py-2">
            {chapters.map((chapter) => {
              const StatusIcon = STATUS_ICON[chapter.status] || Circle;
              const statusClass = STATUS_CLASS[chapter.status] || "";

              return (
                <Tooltip key={chapter.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onSelectChapter(chapter.id)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors shrink-0",
                        activeChapterId === chapter.id
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <StatusIcon
                        className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          activeChapterId === chapter.id
                            ? "text-primary-foreground/70"
                            : statusClass
                        )}
                      />
                      <span>
                        {chapter.romanNumeral && (
                          <span
                            className={cn(
                              "font-semibold mr-1",
                              activeChapterId === chapter.id
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground/60"
                            )}
                          >
                            {chapter.romanNumeral}.
                          </span>
                        )}
                        {chapter.title}
                      </span>
                      {chapter.wordCount > 0 && (
                        <span
                          className={cn(
                            "text-[10px] tabular-nums",
                            activeChapterId === chapter.id
                              ? "text-primary-foreground/50"
                              : "text-muted-foreground/50"
                          )}
                        >
                          {chapter.wordCount.toLocaleString("fr-FR")}
                        </span>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">
                        {chapter.romanNumeral}. {chapter.title}
                      </span>
                      <span className="text-muted-foreground">
                        {chapter.wordCount.toLocaleString("fr-FR")} mots
                        {chapter.wordCount > 0 &&
                          chapter.targetWordCount > 0 &&
                          ` / ${chapter.targetWordCount.toLocaleString("fr-FR")}`}
                      </span>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
            {onAddChapter && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 shrink-0"
                onClick={onAddChapter}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}
