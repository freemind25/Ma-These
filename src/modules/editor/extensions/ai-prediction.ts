import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

// ═══════════════════════════════════════
// AI Prediction Extension — TipTap
// ═══════════════════════════════════════
// Ghost text (inline) + Tab/Esc key bindings
// Debounced API call on typing pause.

export const AI_PREDICTION_KEY = new PluginKey("aiPrediction");

export interface PredictionPluginState {
  suggestion: string | null;
  prevFrom: number;
  decoSet: DecorationSet;
  loading: boolean;
  enabled: boolean;
}

// ─── Helper: ghost text widget ───
function createGhostWidget(pos: number, text: string): Decoration {
  return Decoration.widget(
    pos,
    () => {
      const span = document.createElement("span");
      span.className =
        "ai-ghost-text text-muted-foreground/30 italic pointer-events-none select-none";
      span.textContent = text;
      span.contentEditable = "false";
      // Prevent cursor from entering the ghost text
      span.addEventListener("mousedown", (e) => e.preventDefault());
      return span;
    },
    { side: 1, key: "ai-ghost-text" }
  );
}

// ─── Helper: loading dot widget ───
function createLoadingWidget(pos: number): Decoration {
  return Decoration.widget(
    pos,
    () => {
      const span = document.createElement("span");
      span.className =
        "ai-ghost-loading inline-flex items-center gap-0.5 pointer-events-none select-none";
      span.innerHTML =
        '<span class="inline-block h-1 w-1 rounded-full bg-primary/40 animate-bounce" style="animation-delay:0ms"></span>' +
        '<span class="inline-block h-1 w-1 rounded-full bg-primary/40 animate-bounce" style="animation-delay:150ms"></span>' +
        '<span class="inline-block h-1 w-1 rounded-full bg-primary/40 animate-bounce" style="animation-delay:300ms"></span>';
      span.contentEditable = "false";
      return span;
    },
    { side: 1, key: "ai-ghost-loading" }
  );
}

// ─── Plugin Meta types ───
type PredictionMeta =
  | { type: "set"; value: string | null }
  | { type: "setLoading"; value: boolean }
  | { type: "toggleEnabled" };

export const AiPrediction = Extension.create({
  name: "aiPrediction",

  addOptions() {
    return {
      debounceMs: 1000,
      minChars: 15,
      maxContext: 400,
    };
  },

  addStorage() {
    return {
      enabled: true,
      alternatives: [] as string[],
    };
  },

  // ─── Keyboard shortcuts: Tab to accept, Esc to dismiss ───
  addKeyboardShortcuts() {
    return {
      Tab: () => {
        if (!this.storage.enabled) return false;
        const state = AI_PREDICTION_KEY.getState(this.editor.state);
        if (state?.suggestion) {
          const { from } = this.editor.state.selection;
          this.editor.view.dispatch(
            this.editor.state.tr.insertText(state.suggestion, from)
          );
          return true;
        }
        return false;
      },
      Escape: () => {
        const state = AI_PREDICTION_KEY.getState(this.editor.state);
        if (state?.suggestion || state?.loading) {
          this.editor.view.dispatch(
            this.editor.state.tr.setMeta(AI_PREDICTION_KEY, {
              type: "set",
              value: null,
            } satisfies PredictionMeta)
          );
          return true;
        }
        return false;
      },
    };
  },

  // ─── ProseMirror plugin ───
  addProseMirrorPlugins() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const ext = this;
    const { debounceMs, minChars, maxContext } = this.options;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    // AbortController to cancel in-flight requests
    let currentAbort: AbortController | null = null;

    const fetchPrediction = async (
      view: import("@tiptap/pm/view").EditorView
    ) => {
      const ctrl = new AbortController();
      currentAbort = ctrl;

      // Show loading dots
      view.dispatch(
        view.state.tr.setMeta(AI_PREDICTION_KEY, {
          type: "setLoading",
          value: true,
        } satisfies PredictionMeta)
      );

      try {
        const { from } = view.state.selection;
        const text = view.state.doc.textBetween(
          Math.max(0, from - maxContext),
          from,
          "\n"
        );

        if (text.trim().length < minChars) {
          view.dispatch(
            view.state.tr.setMeta(AI_PREDICTION_KEY, {
              type: "setLoading",
              value: false,
            } satisfies PredictionMeta)
          );
          return;
        }

        // Read AI config from localStorage
        let aiConfig: Record<string, unknown> | undefined;
        try {
          const raw = localStorage.getItem("thesisframe-ai-config");
          if (raw) aiConfig = JSON.parse(raw);
        } catch {
          /* ignore */
        }

        const res = await fetch("/api/text-prediction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, _aiConfig: aiConfig }),
          signal: ctrl.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as {
          primary: string | null;
          alternatives: string[];
        };

        // Only set if cursor hasn't moved and not aborted
        if (
          !ctrl.signal.aborted &&
          view.state.selection.from === from &&
          data.primary
        ) {
          view.dispatch(
            view.state.tr.setMeta(AI_PREDICTION_KEY, {
              type: "set",
              value: data.primary,
            } satisfies PredictionMeta)
          );
          ext.storage.alternatives = data.alternatives || [];
        } else {
          view.dispatch(
            view.state.tr.setMeta(AI_PREDICTION_KEY, {
              type: "setLoading",
              value: false,
            } satisfies PredictionMeta)
          );
        }
      } catch {
        if (ctrl.signal.aborted) return;
        try {
          view.dispatch(
            view.state.tr.setMeta(AI_PREDICTION_KEY, {
              type: "setLoading",
              value: false,
            } satisfies PredictionMeta)
          );
        } catch {
          /* view may have been destroyed */
        }
      } finally {
        if (currentAbort === ctrl) currentAbort = null;
      }
    };

    return [
      new Plugin<PredictionPluginState>({
        key: AI_PREDICTION_KEY,
        state: {
          init(_initConfig, state) {
            return {
              suggestion: null,
              prevFrom: state.selection.from,
              decoSet: DecorationSet.empty,
              loading: false,
              enabled: true,
            };
          },
          apply(tr, value) {
            const meta = tr.getMeta(AI_PREDICTION_KEY) as
              | PredictionMeta
              | undefined;

            // Explicit set/clear
            if (meta?.type === "set") {
              const s = meta.value;
              return {
                suggestion: s,
                prevFrom: tr.selection.from,
                decoSet: s
                  ? DecorationSet.create(tr.doc, [
                      createGhostWidget(tr.selection.from, s),
                    ])
                  : DecorationSet.empty,
                loading: false,
                enabled: value.enabled,
              };
            }

            // Loading toggle
            if (meta?.type === "setLoading") {
              const isLoading = meta.value;
              return {
                ...value,
                suggestion: null,
                prevFrom: tr.selection.from,
                decoSet: isLoading
                  ? DecorationSet.create(tr.doc, [
                      createLoadingWidget(tr.selection.from),
                    ])
                  : DecorationSet.empty,
                loading: isLoading,
              };
            }

            // Toggle enabled
            if (meta?.type === "toggleEnabled") {
              return {
                suggestion: null,
                prevFrom: tr.selection.from,
                decoSet: DecorationSet.empty,
                loading: false,
                enabled: !value.enabled,
              };
            }

            // Doc changed or cursor moved → clear suggestion
            const cursorMoved = tr.selection.from !== value.prevFrom;
            if (tr.docChanged || cursorMoved) {
              // Cancel in-flight request
              if (currentAbort) currentAbort.abort();
              return {
                suggestion: null,
                prevFrom: tr.selection.from,
                decoSet: DecorationSet.empty,
                loading: false,
                enabled: value.enabled,
              };
            }

            // Map decorations for transactions that don't change content
            return {
              ...value,
              prevFrom: tr.selection.from,
              decoSet: value.decoSet.map(tr.mapping, tr.doc),
            };
          },
        },
        props: {
          decorations(state) {
            const ps = AI_PREDICTION_KEY.getState(state);
            if (!ps || !ps.enabled) return DecorationSet.empty;
            return ps.decoSet;
          },
        },
        view(_edView) {
          return {
            update(updatedView, prevState) {
              const ps = AI_PREDICTION_KEY.getState(updatedView.state);
              if (!ps?.enabled) return;

              const docChanged = !updatedView.state.doc.eq(prevState.doc);
              const selChanged = !updatedView.state.selection.eq(prevState.selection);

              if (!docChanged && !selChanged) return;

              // Restart debounce on user input
              if (debounceTimer) clearTimeout(debounceTimer);
              debounceTimer = setTimeout(
                () => fetchPrediction(updatedView),
                debounceMs
              );
            },
            destroy() {
              if (debounceTimer) clearTimeout(debounceTimer);
              if (currentAbort) currentAbort.abort();
            },
          };
        },
      }),
    ];
  },

  // ─── Public methods ───
  toggleEnabled() {
    this.storage.enabled = !this.storage.enabled;
    if (this.editor) {
      this.editor.view.dispatch(
        this.editor.state.tr.setMeta(AI_PREDICTION_KEY, {
          type: "toggleEnabled",
        } satisfies PredictionMeta)
      );
    }
  },

  get isEnabled(): boolean {
    if (!this.editor) return true;
    const state = AI_PREDICTION_KEY.getState(this.editor.state);
    return state?.enabled ?? true;
  },
});
