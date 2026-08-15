"use client";

import { useAppStore } from "@/lib/stores/app-store";
import { useThesis, useUpdateChapter } from "@/modules/editor/hooks/use-thesis";
import { useAutoSave } from "@/modules/editor/hooks/use-auto-save";
import { TiptapEditor } from "@/modules/editor/components/tiptap-editor";
import { ChapterTabs } from "@/modules/editor/components/chapter-tabs";
import { ChapterHeader } from "@/modules/editor/components/chapter-header";
import { ThesisListPanel } from "@/modules/editor/components/thesis-list-panel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { useCallback } from "react";

export function EditorPage() {
  const { activeThesisId, activeChapterId, setActiveChapterId, setCurrentView } =
    useAppStore();

  const { data: thesis, isLoading } = useThesis(activeThesisId);
  const updateChapter = useUpdateChapter();

  const activeChapter = thesis?.chapters.find(
    (ch) => ch.id === activeChapterId
  );

  // Auto-save with debounce
  const { status: saveStatus } = useAutoSave<{
    chapterId: string | null;
    content: string;
  }>({
    data: {
      chapterId: activeChapterId,
      content: activeChapter?.content ?? "",
    },
    delay: 2500,
    enabled: !!activeChapterId && !!activeThesisId,
    onSave: useCallback(
      async (data) => {
        if (!data.chapterId) return;
        await updateChapter.mutateAsync({
          id: data.chapterId,
          content: data.content,
          plainText: "", // Will be set by editor callback
          wordCount: 0,
        });
      },
      [updateChapter]
    ),
  });

  const handleEditorUpdate = useCallback(
    (html: string, plainText: string, wordCount: number) => {
      if (!activeChapterId) return;
      updateChapter.mutate({
        id: activeChapterId,
        content: html,
        plainText,
        wordCount,
      });
    },
    [activeChapterId, updateChapter]
  );

  const handleStatusChange = useCallback(
    (status: string) => {
      if (!activeChapterId) return;
      updateChapter.mutate({ id: activeChapterId, status });
    },
    [activeChapterId, updateChapter]
  );

  const handleTitleChange = useCallback(
    (title: string) => {
      if (!activeChapterId) return;
      updateChapter.mutate({ id: activeChapterId, title });
    },
    [activeChapterId, updateChapter]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  // No thesis selected — show thesis list
  if (!activeThesisId || !thesis) {
    return (
      <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={() => setCurrentView("dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </div>
        <ThesisListPanel />
      </div>
    );
  }

  // Auto-select first chapter if none selected
  const selectedChapter = activeChapter ?? thesis.chapters[0] ?? null;

  return (
    <div className="flex flex-col h-full">
      {/* Chapter tabs */}
      <ChapterTabs
        chapters={thesis.chapters}
        activeChapterId={activeChapterId || thesis.chapters[0]?.id || null}
        onSelectChapter={setActiveChapterId}
      />

      {/* Chapter header */}
      <ChapterHeader
        chapter={selectedChapter}
        onTitleChange={handleTitleChange}
        onStatusChange={handleStatusChange}
        isUpdating={updateChapter.isPending}
      />

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        {selectedChapter ? (
          <TiptapEditor
            content={selectedChapter.content}
            onUpdate={handleEditorUpdate}
            saveStatus={saveStatus}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Aucun chapitre disponible
          </div>
        )}
      </div>
    </div>
  );
}
