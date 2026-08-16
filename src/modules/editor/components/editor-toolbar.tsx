"use client";

import { type Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Minus,
  Highlighter,
  Link,
  Undo,
  Redo,
  Sparkles,
} from "lucide-react";
import { AI_PREDICTION_KEY } from "../extensions/ai-prediction";

import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";

interface EditorToolbarProps {
  editor: Editor;
}

function useAiPredictionEnabled(editor: Editor): boolean {
  try {
    const state = AI_PREDICTION_KEY.getState(editor.state);
    return state?.enabled ?? true;
  } catch {
    return true;
  }
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 overflow-x-auto">
        {/* Undo / Redo */}
        <ToolbarButton
          icon={Undo}
          label="Annuler (Ctrl+Z)"
          pressed={false}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        />
        <ToolbarButton
          icon={Redo}
          label="Refaire (Ctrl+Y)"
          pressed={false}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        />

        <ToolbarSeparator />

        {/* Headings */}
        <ToolbarButton
          icon={Heading1}
          label="Titre 1"
          pressed={editor.isActive("heading", { level: 1 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        />
        <ToolbarButton
          icon={Heading2}
          label="Titre 2"
          pressed={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        />
        <ToolbarButton
          icon={Heading3}
          label="Titre 3"
          pressed={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        />

        <ToolbarSeparator />

        {/* Text formatting */}
        <ToolbarButton
          icon={Bold}
          label="Gras (Ctrl+B)"
          pressed={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          icon={Italic}
          label="Italique (Ctrl+I)"
          pressed={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          icon={Underline}
          label="Souligné (Ctrl+U)"
          pressed={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
        <ToolbarButton
          icon={Strikethrough}
          label="Barré"
          pressed={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        />
        <ToolbarButton
          icon={Code}
          label="Code en ligne"
          pressed={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
        />

        <ToolbarSeparator />

        {/* Alignment */}
        <ToolbarButton
          icon={AlignLeft}
          label="Aligner à gauche"
          pressed={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        />
        <ToolbarButton
          icon={AlignCenter}
          label="Centrer"
          pressed={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        />
        <ToolbarButton
          icon={AlignRight}
          label="Aligner à droite"
          pressed={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        />
        <ToolbarButton
          icon={AlignJustify}
          label="Justifier"
          pressed={editor.isActive({ textAlign: "justify" })}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        />

        <ToolbarSeparator />

        {/* Lists */}
        <ToolbarButton
          icon={List}
          label="Liste à puces"
          pressed={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          icon={ListOrdered}
          label="Liste numérotée"
          pressed={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />

        <ToolbarSeparator />

        {/* Block elements */}
        <ToolbarButton
          icon={Quote}
          label="Citation"
          pressed={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <ToolbarButton
          icon={Minus}
          label="Séparateur"
          pressed={false}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        />
        <ToolbarButton
          icon={Highlighter}
          label="Surligner"
          pressed={editor.isActive("highlight")}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
        />
        <ToolbarButton
          icon={Link}
          label="Lien"
          pressed={editor.isActive("link")}
          onClick={() => {
            if (editor.isActive("link")) {
              editor.chain().focus().unsetLink().run();
            } else {
              const url = window.prompt("URL du lien :");
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }
          }}
        />

        <ToolbarSeparator />

        {/* AI Prediction toggle */}
        <ToolbarButton
          icon={Sparkles}
          label="Prédiction IA (Tab pour accepter)"
          pressed={useAiPredictionEnabled(editor)}
          onClick={() => {
            const extension = editor.extensionManager.get("aiPrediction");
            if (extension) {
              (extension as unknown as { toggleEnabled: () => void }).toggleEnabled();
            }
          }}
        />
      </div>
    </TooltipProvider>
  );
}

// ═══ Toolbar sub-components ═══

function ToolbarButton({
  icon: Icon,
  label,
  pressed,
  onClick,
  disabled,
}: {
  icon: React.ElementType;
  label: string;
  pressed: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Toggle
          size="sm"
          pressed={pressed}
          onPressedChange={onClick}
          disabled={disabled}
          className={cn(
            "h-8 w-8 p-0 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
          )}
        >
          <Icon className="h-4 w-4" />
        </Toggle>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function ToolbarSeparator() {
  return <Separator orientation="vertical" className="h-6 mx-1" />;
}
