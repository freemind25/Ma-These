"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PenTool,
  BookOpen,
  SearchCheck,
  Repeat,
  AlignLeft,
  Lightbulb,
  FlaskConical,
  Network,
  FileCheck,
  Presentation,
  Sparkles,
  Send,
  Loader2,
  Copy,
  Check,
  GraduationCap,
  User,
  SpellCheck,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { WRITING_MODES, type WritingMode } from "@/data/ai-writing-modes";
import { useAiConfig } from "@/hooks/use-ai-config";
import { useAppStore } from "@/lib/stores/app-store";
import { useThesis } from "@/modules/editor/hooks/use-thesis";

// ═══ Icon Map ═══
const ICON_MAP: Record<string, React.ElementType> = {
  PenTool,
  BookOpen,
  SearchCheck,
  SpellCheck,
  Repeat,
  AlignLeft,
  Lightbulb,
  FlaskConical,
  Network,
  FileCheck,
  Presentation,
};

// ═══ AI Writing Tab ═══
export function AiWritingPage() {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Assistant IA d&apos;écriture
        </h1>
        <p className="text-sm text-muted-foreground">
          {WRITING_MODES.length} modes spécialisés pour vous assister dans la rédaction de votre thèse
        </p>
      </div>

      <Tabs defaultValue="writing" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="writing" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Modes d&apos;écriture
          </TabsTrigger>
          <TabsTrigger value="director" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            Chat Directeur
          </TabsTrigger>
        </TabsList>

        <TabsContent value="writing" className="mt-4">
          <AiWritingPanel />
        </TabsContent>
        <TabsContent value="director" className="mt-4">
          <DirecteurChatPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ═══ AI Writing Panel ═══
function AiWritingPanel() {
  const { withAiConfig } = useAiConfig();
  const { data: modes } = useQuery({
    queryKey: ["ai-writing-modes"],
    queryFn: async () => {
      const res = await fetch("/api/ai-writing");
      const json = await res.json();
      return json.data as WritingMode[];
    },
  });

  const [selectedMode, setSelectedMode] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Auto-scroll result area during streaming
  useEffect(() => {
    if (isStreaming && resultRef.current) {
      resultRef.current.scrollTop = resultRef.current.scrollHeight;
    }
  }, [result, isStreaming]);

  const handleGenerate = async () => {
    if (!selectedMode || !prompt.trim()) return;

    const activeMode = (modes || WRITING_MODES).find((m) => m.id === selectedMode);

    // For custom endpoints (e.g. deep-research), use non-streaming path
    if (activeMode?.customEndpoint) {
      setIsStreaming(true);
      setStreamError(null);
      setResult("");
      try {
        const res = await fetch(activeMode.customEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(withAiConfig({ mode: selectedMode, prompt: prompt.trim() })),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Erreur de génération");
        }
        const json = await res.json();
        setResult(json.data.content as string);
      } catch (error) {
        setStreamError(error instanceof Error ? error.message : "Erreur de génération");
      } finally {
        setIsStreaming(false);
      }
      return;
    }

    // Streaming path for standard modes
    setIsStreaming(true);
    setStreamError(null);
    setResult("");
    const abort = new AbortController();
    abortRef.current = abort;

    try {
      const res = await fetch("/api/ai-writing/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(withAiConfig({ mode: selectedMode, prompt: prompt.trim() })),
        signal: abort.signal,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur de génération");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Réponse vide du serveur.");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;
          const data = trimmed.slice(6);
          let parsed: { type?: string; content?: string; error?: string } | null = null;
          try {
            parsed = JSON.parse(data);
            if (parsed.type === "chunk" && parsed.content) {
              setResult((prev) => prev + parsed!.content);
            } else if (parsed.type === "error") {
              throw new Error(parsed.error);
            }
          } catch (parseErr) {
            if (parsed?.type === "error" && parseErr instanceof Error) {
              throw parseErr;
            }
            // Skip malformed chunks or JSON parse errors
          }
        }
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        setStreamError(error instanceof Error ? error.message : "Erreur de génération");
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeMode = modes?.find((m) => m.id === selectedMode);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
      {/* Mode selector */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Modes disponibles</h3>
        <div className="flex flex-col gap-2 max-h-[70vh] overflow-y-auto pr-1">
          {(modes || WRITING_MODES).map((mode) => {
            const Icon = ICON_MAP[mode.icon] || Sparkles;
            return (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-all hover:bg-muted/50 ${
                  selectedMode === mode.id
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
              >
                <Icon className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-sm font-medium">{mode.label}</span>
                  <span className="text-xs text-muted-foreground line-clamp-2">
                    {mode.description}
                  </span>
                  <Badge variant="secondary" className="w-fit text-[10px] h-5">
                    {mode.category === "writing"
                      ? "Rédaction"
                      : mode.category === "analysis"
                        ? "Analyse"
                        : mode.category === "review"
                          ? "Revue"
                          : "Génération"}
                  </Badge>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Generation area */}
      <div className="flex flex-col gap-4">
        {/* Input */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">
              {activeMode ? activeMode.label : "Sélectionnez un mode"}
            </CardTitle>
            {activeMode && (
              <CardDescription className="text-xs">
                {activeMode.placeholder}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Textarea
              placeholder={activeMode?.placeholder || "Sélectionnez un mode d'écriture..."}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              className="resize-none text-sm"
              disabled={!selectedMode || isStreaming}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {prompt.length} caractères
              </span>
              <div className="flex items-center gap-2">
                {isStreaming && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-xs"
                    onClick={handleStop}
                  >
                    <span className="h-2 w-2 rounded-full bg-destructive" />
                    Arrêter
                  </Button>
                )}
                <Button
                  onClick={handleGenerate}
                  disabled={!selectedMode || !prompt.trim() || isStreaming}
                  className="gap-2"
                >
                  {isStreaming ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Générer
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {streamError && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-4 text-sm text-destructive">
              {streamError}
            </CardContent>
          </Card>
        )}

        {/* Result (shows during streaming too) */}
        {(result || isStreaming) && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">
                  Résultat
                  {isStreaming && (
                    <span className="ml-2 inline-flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                      Streaming...
                    </span>
                  )}
                </CardTitle>
                {result && !isStreaming && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1.5 text-xs"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copied ? "Copié" : "Copier"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div
                ref={resultRef}
                className="prose prose-sm dark:prose-invert max-w-none max-h-[50vh] overflow-y-auto"
              >
                {result.split("\n").map((line, i) => {
                  if (line.trim() === "") return <br key={i} />;
                  if (line.match(/^[0-9]+[.)]/))
                    return (
                      <p key={i} className="font-medium mt-3">
                        {line}
                      </p>
                    );
                  return <p key={i}>{line}</p>;
                })}
                {isStreaming && (
                  <span className="inline-block w-2 h-4 bg-primary/60 animate-pulse ml-0.5" />
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ═══ Directeur Chat Panel ═══
function DirecteurChatPanel() {
  const { withAiConfig } = useAiConfig();
  const { activeThesisId } = useAppStore();
  const { data: thesis } = useThesis(activeThesisId);
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Build thesis context for the directeur chat (BUG-10)
  const thesisContext = thesis
    ? [
        `Titre : ${thesis.title}${thesis.subtitle ? ` — ${thesis.subtitle}` : ""}`,
        `Auteur : ${thesis.author}`,
        thesis.directorName ? `Directeur : ${thesis.directorName}` : null,
        thesis.institution ? `Institution : ${thesis.institution}` : null,
        thesis.discipline ? `Discipline : ${thesis.discipline}` : null,
        `Chapitres (${thesis.chapters.length}) : ${thesis.chapters.map((ch) => ch.title).join(", ")}`,
      ]
        .filter(Boolean)
        .join("\n")
    : undefined;

  const chat = useMutation({
    mutationFn: async (userMessage: string) => {
      const allMessages = [...messages, { role: "user", content: userMessage }];
      const res = await fetch("/api/directeur-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(withAiConfig({ messages: allMessages, thesisContext })),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur");
      }
      const json = await res.json();
      return json.data.content as string;
    },
    onSuccess: (content, userMessage) => {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: userMessage },
        { role: "assistant", content },
      ]);
      setInput("");
    },
  });

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, chat.isPending]);

  const handleSend = () => {
    if (!input.trim() || chat.isPending) return;
    chat.mutate(input.trim());
  };

  return (
    <Card className="max-w-3xl">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-sm">Chat avec votre directeur</CardTitle>
            <CardDescription className="text-xs">
              Pr. Jean-Marc Renaud — Simulateur de direction de thèse
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <Separator />

      {/* Messages */}
      <ScrollArea className="h-[400px]" ref={scrollRef}>
        <div className="flex flex-col gap-4 p-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <GraduationCap className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <h3 className="text-sm font-medium">Commencez la conversation</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-[300px]">
                Partagez votre travail, posez des questions ou demandez des conseils sur votre thèse
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  msg.role === "user"
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="h-4 w-4" />
                ) : (
                  <GraduationCap className="h-4 w-4" />
                )}
              </div>
              <div
                className={`rounded-lg border px-3 py-2 max-w-[80%] text-sm ${
                  msg.role === "user"
                    ? "bg-secondary"
                    : "bg-card"
                }`}
              >
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {chat.isPending && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div className="rounded-lg border bg-card px-3 py-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Le professeur réfléchit...
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <Separator />

      {/* Input */}
      <div className="flex items-center gap-2 p-3">
        <Textarea
          placeholder="Partagez votre travail ou posez une question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={2}
          className="resize-none text-sm min-h-[60px]"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={chat.isPending}
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!input.trim() || chat.isPending}
          className="shrink-0 self-end"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
