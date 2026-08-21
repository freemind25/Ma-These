"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import Typography from "@tiptap/extension-typography";
import { useCallback, useEffect } from "react";
import { EditorToolbar } from "./editor-toolbar";
import { PredictionPopup } from "./prediction-popup";
import { AiPrediction } from "../extensions/ai-prediction";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Save, Check, AlertCircle, Loader2 } from "lucide-react";
import type { SaveStatus } from "../hooks/use-auto-save";

interface TiptapEditorProps {
  content: string;
  placeholder?: string;
  onUpdate?: (html: string, plainText: string, wordCount: number) => void;
  saveStatus?: SaveStatus;
}

const THESIS_EXTENSIONS = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3, 4] },
  }),
  Underline,
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  Highlight.configure({
    multicolor: false,
  }),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: { rel: "noopener noreferrer" },
  }),
  Placeholder.configure({
    placeholder: "Commencez à rédiger votre chapitre...",
  }),
  CharacterCount,
  Typography,
  AiPrediction.configure({
    debounceMs: 1000,
    minChars: 15,
    maxContext: 400,
  }),
];

export function TiptapEditor({
  content,
  placeholder: _placeholder,
  onUpdate,
  saveStatus,
}: TiptapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: THESIS_EXTENSIONS,
    content: content || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[400px] px-8 py-6",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const plainText = editor.getText();
      const wordCount = plainText
        .trim()
        .split(/\s+/)
        .filter((w: string) => w.length > 0).length;
      onUpdate?.(html, plainText, wordCount);
    },
  });

  // Sync external content changes (e.g., switching chapters)
  useEffect(() => {
    if (editor && content !== undefined) {
      const currentContent = editor.getHTML();
      // Only update if content actually differs (avoid cursor reset)
      if (currentContent !== content && content !== "") {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

  const handleSave = useCallback(() => {
    if (editor) {
      const html = editor.getHTML();
      const plainText = editor.getText();
      const wordCount = plainText.trim().split(/\s+/).filter((w: string) => w.length > 0).length;
      onUpdate?.(html, plainText, wordCount);
    }
  }, [editor, onUpdate]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Chargement de l&apos;éditeur...
      </div>
    );
  }

  return (
    <div className="flex flex-col border rounded-lg bg-card overflow-hidden">
      {/* Toolbar */}
      <EditorToolbar editor={editor} />

      <Separator />

      {/* Editor area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin relative">
        <EditorContent editor={editor} />
        {/* AI Prediction popup (rendered via portal) */}
        <PredictionPopup editor={editor} />
      </div>

      {/* Status bar */}
      <Separator />
      <div className="flex items-center justify-between px-4 py-2 bg-muted/30 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <SaveStatusIndicator status={saveStatus} />
          <span>
            {editor.storage.characterCount.words()} mots
          </span>
          <span>
            {editor.storage.characterCount.characters()} caractères
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs"
          onClick={handleSave}
        >
          <Save className="h-3.5 w-3.5" />
          Sauvegarder
        </Button>
      </div>
    </div>
  );
}

function SaveStatusIndicator({ status }: { status?: SaveStatus }) {
  if (!status || status === "idle") return null;

  switch (status) {
    case "saving":
      return (
        <span className="flex items-center gap-1 text-primary">
          <Loader2 className="h-3 w-3 animate-spin" />
          Sauvegarde...
        </span>
      );
    case "saved":
      return (
        <span className="flex items-center gap-1 text-chart-2">
          <Check className="h-3 w-3" />
          Sauvegardé
        </span>
      );
    case "error":
      return (
        <span className="flex items-center gap-1 text-destructive">
          <AlertCircle className="h-3 w-3" />
          Erreur
        </span>
      );
    default:
      return null;
  }
}

// Export toolbar for inline AI menu access
export { EditorToolbar } from "./editor-toolbar";
