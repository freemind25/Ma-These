"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAppStore } from "@/lib/stores/app-store";
import { useAiConfig } from "@/hooks/use-ai-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Brain,
  Database,
  Send,
  Loader2,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: { type: string; title: string }[];
  timestamp: number;
}

interface IndexStats {
  totalChunks: number;
  chapters: number;
  references: number;
  notebooks: number;
  cadrages: number;
  totalTokens: number;
}

// ═══════════════════════════════════════
// Source badge color map
// ═══════════════════════════════════════

const SOURCE_COLORS: Record<string, string> = {
  chapter: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  reference: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  notebook: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  cadrage: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
};

const SOURCE_LABELS: Record<string, string> = {
  chapter: "Chapitre",
  reference: "Réf.",
  notebook: "Note",
  cadrage: "Cadrage",
};

function getSourceBadgeClass(type: string): string {
  return SOURCE_COLORS[type] ?? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
}

function getSourceLabel(type: string): string {
  return SOURCE_LABELS[type] ?? type;
}

// ═══════════════════════════════════════
// Suggestion chips
// ═══════════════════════════════════════

const SUGGESTIONS = [
  "Quels sont les principaux thèmes de ma thèse ?",
  "Résumé mes références sur...",
  "Quelles lacunes identifiez-vous ?",
  "Quelle est la structure de mon argumentation ?",
  "Quelles sont mes sources les plus citées ?",
];

// ═══════════════════════════════════════
// Component
// ═══════════════════════════════════════

export function ThesisRagPage() {
  const activeThesisId = useAppStore((s) => s.activeThesisId);
  const { withAiConfig } = useAiConfig();

  // ── State ──
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [indexStats, setIndexStats] = useState<IndexStats | null>(null);
  const [indexing, setIndexing] = useState(false);
  const [querying, setQuerying] = useState(false);
  const [hasIndexed, setHasIndexed] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Auto-scroll to bottom on new messages ──
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Index thesis ──
  const handleIndex = useCallback(async () => {
    if (!activeThesisId) return;
    setIndexing(true);
    try {
      const res = await fetch("/api/thesis-rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          withAiConfig({ action: "index", thesisId: activeThesisId })
        ),
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        setIndexStats(data.stats);
        setHasIndexed(true);
        toast.success(
          `Indexation terminée : ${data.stats.totalChunks} chunks créés`
        );
      }
    } catch {
      toast.error("Erreur lors de l'indexation");
    } finally {
      setIndexing(false);
    }
  }, [activeThesisId, withAiConfig]);

  // ── Query thesis ──
  const handleQuery = useCallback(
    async (query: string) => {
      if (!activeThesisId || !query.trim() || querying) return;
      const trimmed = query.trim();

      // Add user message
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setQuerying(true);

      try {
        const res = await fetch("/api/thesis-rag", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            withAiConfig({
              action: "query",
              thesisId: activeThesisId,
              query: trimmed,
            })
          ),
        });
        const data = await res.json();

        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.error
            ? `⚠️ Erreur : ${data.error}`
            : data.answer ?? "Aucune réponse générée.",
          sources: data.sources,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch {
        const errorMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Désolé, une erreur est survenue lors de la requête.",
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setQuerying(false);
        inputRef.current?.focus();
      }
    },
    [activeThesisId, querying, withAiConfig]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleQuery(input);
    }
  };

  const canQuery = activeThesisId !== null && hasIndexed;

  // ── Render ──

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div className="px-4 sm:px-6 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Mon IA de thèse
            </h1>
            <p className="text-sm text-muted-foreground">
              Interrogez votre thèse avec l&apos;IA contextuelle
            </p>
          </div>
        </div>
      </div>

      {/* ── Warning: no thesis selected ── */}
      {!activeThesisId && (
        <div className="px-4 sm:px-6 pb-4">
          <Card className="border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  Aucune thèse sélectionnée
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  Sélectionnez d&apos;abord une thèse dans l&apos;éditeur pour
                  pouvoir l&apos;indexer et l&apos;interroger.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Index bar ── */}
      <div className="px-4 sm:px-6 pb-3">
        <Card>
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              {indexStats ? (
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {indexStats.totalChunks}
                  </span>{" "}
                  chunks indexés{" "}
                  <span className="hidden sm:inline">
                    (
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      {indexStats.chapters} chapitres
                    </span>
                    ,{" "}
                    <span className="font-medium text-sky-600 dark:text-sky-400">
                      {indexStats.references} références
                    </span>
                    ,{" "}
                    <span className="font-medium text-amber-600 dark:text-amber-400">
                      {indexStats.notebooks} notes
                    </span>
                    {indexStats.cadrages > 0 && (
                      <>
                        ,{" "}
                        <span className="font-medium text-violet-600 dark:text-violet-400">
                          {indexStats.cadrages} cadrages
                        </span>
                      </>
                    )}
                    )
                  </span>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aucun document indexé. Cliquez pour indexer votre thèse.
                </p>
              )}
            </div>
            <Button
              size="sm"
              onClick={handleIndex}
              disabled={!activeThesisId || indexing}
              className="shrink-0"
            >
              {indexing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Indexation…
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Indexer ma thèse
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ── Chat area ── */}
      <div className="flex-1 min-h-0 px-4 sm:px-6">
        <ScrollArea className="h-full">
          <div className="flex flex-col gap-4 pb-4 max-w-3xl mx-auto">
            {messages.length === 0 ? (
              /* ── Empty state ── */
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-4">
                  <MessageSquare className="w-8 h-8 text-muted-foreground" />
                </div>
                <h2 className="text-lg font-medium mb-1">
                  Posez une question sur votre thèse
                </h2>
                <p className="text-sm text-muted-foreground mb-6 max-w-md">
                  L&apos;IA analyse vos chapitres, références, notes de
                  recherche et cadrages pour répondre avec précision.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleQuery(s)}
                      disabled={!canQuery}
                      className="px-3 py-2 text-xs rounded-full border bg-card hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-40 disabled:pointer-events-none"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* ── Messages ── */
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted rounded-bl-md"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:m-0 [&_ul]:m-0 [&_ol]:m-0 [&_li]:m-0 [&_h1]:text-base [&_h2]:text-base [&_h3]:text-sm [&_h4]:text-sm [&_h5]:text-sm [&_h6]:text-sm">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    )}

                    {/* ── Source badges ── */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-border/50">
                        {msg.sources.map((src, i) => (
                          <Badge
                            key={`${src.type}-${src.title}-${i}`}
                            variant="secondary"
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getSourceBadgeClass(
                              src.type
                            )}`}
                          >
                            {getSourceLabel(src.type)} : {src.title}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {/* ── Querying indicator ── */}
            {querying && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Recherche dans vos documents…
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* ── Input bar (sticky) ── */}
      <div className="border-t bg-background px-4 sm:px-6 py-3 mt-auto shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleQuery(input);
          }}
          className="flex items-center gap-2 max-w-3xl mx-auto"
        >
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              !activeThesisId
                ? "Sélectionnez d'abord une thèse…"
                : !hasIndexed
                ? "Indexez d'abord votre thèse…"
                : "Posez une question sur votre thèse…"
            }
            disabled={!canQuery || querying}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!canQuery || !input.trim() || querying}
          >
            {querying ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
