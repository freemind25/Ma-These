"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { type Editor } from "@tiptap/react";
import { AI_PREDICTION_KEY } from "../extensions/ai-prediction";
import { Sparkles, X } from "lucide-react";
import { createPortal } from "react-dom";

interface PredictionPopupProps {
  editor: Editor;
}

export function PredictionPopup({ editor }: PredictionPopupProps) {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [visible, setVisible] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Subscribe to prediction state changes
  useEffect(() => {
    const handler = () => {
      try {
        const state = AI_PREDICTION_KEY.getState(editor.state);
        if (!state) return;

        const newSuggestion = state.suggestion ?? null;
        const enabled = state.enabled ?? true;

        if (newSuggestion && enabled) {
          setSuggestion(newSuggestion);
          setAlternatives(editor.storage.aiPrediction?.alternatives || []);

          // Position popup near cursor
          const { from } = editor.state.selection;
          const coords = editor.view.coordsAtPos(from);

          setPosition({
            top: coords.bottom + 6,
            left: Math.max(8, coords.left - 4),
          });

          // Fade in
          setVisible(true);
        } else {
          // Fade out
          setVisible(false);
          // Clear after animation
          const timer = setTimeout(() => {
            setSuggestion(null);
            setPosition(null);
            setAlternatives([]);
          }, 200);
          return () => clearTimeout(timer);
        }
      } catch {
        // Editor may be destroyed
      }
    };

    editor.on("transaction", handler);
    return () => {
      editor.off("transaction", handler);
    };
  }, [editor]);

  // Accept a suggestion (primary or alternative)
  const acceptSuggestion = useCallback(
    (text: string) => {
      const { from } = editor.state.selection;
      editor.view.dispatch(editor.state.tr.insertText(text, from));
      setSuggestion(null);
      setPosition(null);
      setAlternatives([]);
    },
    [editor]
  );

  // Dismiss suggestion
  const dismiss = useCallback(() => {
    editor.view.dispatch(
      editor.state.tr.setMeta(AI_PREDICTION_KEY, {
        type: "set",
        value: null,
      })
    );
  }, [editor]);

  if (!suggestion || !position) return null;

  return createPortal(
    <div
      ref={popupRef}
      className="fixed z-[100] transition-opacity duration-200"
      style={{
        top: position.top,
        left: position.left,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div className="flex items-center gap-1.5 bg-popover border border-border rounded-lg shadow-lg px-2.5 py-1.5 text-xs">
        {/* Primary suggestion */}
        <button
          onClick={() => acceptSuggestion(suggestion)}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-accent transition-colors text-foreground font-medium max-w-[300px] truncate"
          title="Cliquez pour insérer"
        >
          <Sparkles className="h-3 w-3 text-primary shrink-0" />
          <span className="truncate">{suggestion}</span>
        </button>

        {/* Alternatives */}
        {alternatives.length > 0 && (
          <>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1">
              {alternatives.slice(0, 2).map((alt, i) => (
                <button
                  key={i}
                  onClick={() => acceptSuggestion(alt)}
                  className="px-1.5 py-0.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors max-w-[200px] truncate"
                  title="Cliquez pour insérer"
                >
                  {alt}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Dismiss hint */}
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <kbd className="inline-flex h-4 min-w-4 items-center justify-center rounded border bg-muted px-0.5 font-mono text-[9px]">
            Tab
          </kbd>
          <button
            onClick={dismiss}
            className="p-0.5 rounded hover:bg-accent transition-colors"
            title="Ignorer (Esc)"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
