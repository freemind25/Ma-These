"use client";

import { useAppStore } from "@/lib/stores/app-store";
import { useThesis, useUpdateChapter, useCreateChapter, useDeleteChapter } from "@/modules/editor/hooks/use-thesis";
import { useAutoSave } from "@/modules/editor/hooks/use-auto-save";
import { TiptapEditor } from "@/modules/editor/components/tiptap-editor";
import { ChapterTabs } from "@/modules/editor/components/chapter-tabs";
import { ChapterHeader } from "@/modules/editor/components/chapter-header";
import { ThesisListPanel } from "@/modules/editor/components/thesis-list-panel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { useCallback, useRef, useMemo } from "react";

export function EditorPage() {
  const { activeThesisId, activeChapterId, setActiveChapterId, setCurrentView } =
    useAppStore();

  const { data: thesis, isLoading } = useThesis(activeThesisId);
  const updateChapter = useUpdateChapter();
  const createChapter = useCreateChapter();
  const deleteChapter = useDeleteChapter();

  // Keep latest plainText and wordCount from the editor so auto-save can use them
  const plainTextRef = useRef("");
  const wordCountRef = useRef(0);

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
          plainText: plainTextRef.current,
          wordCount: wordCountRef.current,
        });
      },
      [updateChapter]
    ),
  });

  const handleEditorUpdate = useCallback(
    (html: string, plainText: string, wordCount: number) => {
      if (!activeChapterId) return;
      // Store latest values for auto-save to read
      plainTextRef.current = plainText;
      wordCountRef.current = wordCount;
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

  const handleAddChapter = useCallback(() => {
    if (!activeThesisId) return;
    const nextNum = (thesis?.chapters.length ?? 0) + 1;
    const romanNumerals = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX"];
    createChapter.mutate({
      thesisId: activeThesisId,
      title: `Chapitre ${nextNum}`,
      romanNumeral: romanNumerals[nextNum - 1] || String(nextNum),
    });
  }, [activeThesisId, thesis?.chapters.length, createChapter]);

  const handleDeleteChapter = useCallback(() => {
    if (!activeChapterId) return;
    deleteChapter.mutate(activeChapterId);
    setActiveChapterId(null);
  }, [activeChapterId, deleteChapter, setActiveChapterId]);

  // Chapter reorder (BUG-09)
  const sortedChapters = useMemo(
    () => [...(thesis?.chapters ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
    [thesis?.chapters]
  );

  // selectedChapterId is used for reorder logic — prefer activeChapterId, fall back to first chapter
  const reorderChapterId = activeChapterId || thesis?.chapters[0]?.id || null;

  const selectedChapterIndex = useMemo(
    () => sortedChapters.findIndex((ch) => ch.id === reorderChapterId),
    [sortedChapters, reorderChapterId]
  );

  const handleMoveChapter = useCallback(
    (direction: "up" | "down") => {
      if (!reorderChapterId || !thesis) return;
      const currentIdx = selectedChapterIndex;
      if (currentIdx < 0) return;
      const swapIdx = direction === "up" ? currentIdx - 1 : currentIdx + 1;
      if (swapIdx < 0 || swapIdx >= sortedChapters.length) return;

      const current = sortedChapters[currentIdx];
      const swap = sortedChapters[swapIdx];

      // Swap sortOrder values
      updateChapter.mutate({ id: current.id, sortOrder: swap.sortOrder });
      updateChapter.mutate({ id: swap.id, sortOrder: current.sortOrder });
    },
    [reorderChapterId, thesis, selectedChapterIndex, sortedChapters, updateChapter]
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
        onAddChapter={handleAddChapter}
      />

      {/* Chapter header */}
      <ChapterHeader
        chapter={selectedChapter}
        onTitleChange={handleTitleChange}
        onStatusChange={handleStatusChange}
        onDelete={handleDeleteChapter}
        onMoveUp={() => handleMoveChapter("up")}
        onMoveDown={() => handleMoveChapter("down")}
        canMoveUp={selectedChapterIndex > 0}
        canMoveDown={selectedChapterIndex >= 0 && selectedChapterIndex < sortedChapters.length - 1}
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
