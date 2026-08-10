"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Check, X, Trash2 } from "lucide-react";
import { useState } from "react";
import type { ThesisChapter } from "@/modules/editor/hooks/use-thesis";
import { cn } from "@/lib/utils";

interface ChapterHeaderProps {
  chapter: ThesisChapter | null;
  onTitleChange: (title: string) => void;
  onStatusChange: (status: string) => void;
  onDelete?: () => void;
  isUpdating: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  not_started: "Non commencé",
  in_progress: "En cours",
  draft: "Brouillon",
  review: "En révision",
  completed: "Terminé",
};

const STATUS_VARIANTS: Record<string, string> = {
  not_started: "secondary",
  in_progress: "outline",
  draft: "outline",
  review: "outline",
  completed: "default",
};

export function ChapterHeader({
  chapter,
  onTitleChange,
  onStatusChange,
  onDelete,
  isUpdating,
}: ChapterHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");

  if (!chapter) {
    return (
      <div className="flex items-center h-14 px-6 border-b">
        <span className="text-sm text-muted-foreground">
          Sélectionnez un chapitre pour commencer à rédiger
        </span>
      </div>
    );
  }

  const handleStartEdit = () => {
    setEditTitle(chapter.title);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editTitle.trim() && editTitle !== chapter.title) {
      onTitleChange(editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <div className="flex items-center justify-between h-14 px-6 border-b gap-4">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Chapter number badge */}
        <span className="shrink-0 text-sm font-bold text-muted-foreground tabular-nums">
          {chapter.romanNumeral && `${chapter.romanNumeral}.`}
        </span>

        {/* Title (editable) */}
        {isEditing ? (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveEdit();
                if (e.key === "Escape") handleCancelEdit();
              }}
              className="h-8 text-sm"
              autoFocus
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={handleSaveEdit}
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={handleCancelEdit}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <button
            onClick={handleStartEdit}
            className="text-sm font-semibold truncate hover:text-primary transition-colors flex items-center gap-1.5 min-w-0"
          >
            {chapter.title}
            <Pencil className="h-3 w-3 text-muted-foreground/50 opacity-0 group-hover:opacity-100" />
          </button>
        )}
      </div>

      {/* Status + Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="tabular-nums">
            {chapter.wordCount.toLocaleString("fr-FR")}
          </span>
          {chapter.targetWordCount > 0 && (
            <>
              <span>/</span>
              <span className="tabular-nums">
                {chapter.targetWordCount.toLocaleString("fr-FR")}
              </span>
            </>
          )}
          <span> mots</span>
        </div>

        <Select
          value={chapter.status}
          onValueChange={onStatusChange}
          disabled={isUpdating}
        >
          <SelectTrigger className="h-7 w-auto min-w-[130px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value} className="text-xs">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
