"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GraduationCap,
  Brain,
  SpellCheck,
  Palette,
  User,
  Send,
  Bot,
  AlertTriangle,
  CheckCircle,
  Copy,
  Loader2,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface GrammarCorrection {
  original: string;
  suggested: string;
  type: "error" | "warning" | "suggestion";
  rule?: string;
}

interface GrammarResult {
  corrections: GrammarCorrection[];
  stats: {
    errors: number;
    warnings: number;
    suggestions: number;
  };
}

interface StyleIssue {
  text: string;
  category: string;
  severity: "error" | "warning" | "info";
  suggestion: string;
}

// ═══════════════════════════════════════
// Helper: parse structured results from AI
// ═══════════════════════════════════════

function parseGrammarResult(raw: string): GrammarResult {
  const corrections: GrammarCorrection[] = [];
  let errors = 0;
  let warnings = 0;
  let suggestions = 0;

  const lines = raw.split("\n");
  for (const line of lines) {
    const errorMatch = line.match(/-\s*\*\*(.+)\*\*\s*→\s*\*\*(.+)\*\*\s*\[(erreur|avertissement|suggestion)\]/i);
    if (errorMatch) {
      const type = errorMatch[3].toLowerCase() === "erreur" ? "error" : errorMatch[3].toLowerCase() === "avertissement" ? "warning" : "suggestion";
      if (type === "error") errors++;
      else if (type === "warning") warnings++;
      else suggestions++;
      corrections.push({
        original: errorMatch[1],
        suggested: errorMatch[2],
        type,
      });
      continue;
    }
    const simpleMatch = line.match(/-\s*\*\*(.+)\*\*\s*→\s*\*\*(.+)\*\*/);
    if (simpleMatch) {
      errors++;
      corrections.push({ original: simpleMatch[1], suggested: simpleMatch[2], type: "error" });
    }
  }

  // If no structured parse worked, show raw text as a single suggestion
  if (corrections.length === 0) {
    corrections.push({ original: "", suggested: raw, type: "suggestion" });
    suggestions = 1;
  }

  return { corrections, stats: { errors, warnings, suggestions } };
}

function parseStyleIssues(raw: string): StyleIssue[] {
  const issues: StyleIssue[] = [];
  const blocks = raw.split(/\n(?=\d+\.)/);

  for (const block of blocks) {
    const textMatch = block.match(/\d+\.\s*\*\*(.+)\*\*/);
    if (!textMatch) continue;

    let category = "Général";
    let severity: "error" | "warning" | "info" = "info";
    let suggestion = "";

    const catMatch = block.match(/\[([\w\s]+)\]/);
    if (catMatch) category = catMatch[1].trim();

    if (block.toLowerCase().includes("[erreur]")) severity = "error";
    else if (block.toLowerCase().includes("[avertissement]")) severity = "warning";

    const sugMatch = block.match(/Suggestion\s*:\s*(.+)/i);
    if (sugMatch) suggestion = sugMatch[1].trim();

    issues.push({ text: textMatch[1], category, severity, suggestion });
  }

  if (issues.length === 0) {
    issues.push({ text: raw, category: "Analyse", severity: "info", suggestion: "" });
  }

  return issues;
}

// ═══════════════════════════════════════
// 1. Directeur de thèse (Chat)
// ═══════════════════════════════════════

function DirecteurPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Votre directeur IA vous guide dans votre recherche. Posez-lui vos questions sur votre problématique, votre méthodologie, ou toute autre étape de votre thèse." },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const allMessages = [...messages, { role: "user" as const, content: userMessage }];
      const res = await fetch("/api/directeur-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: allMessages.slice(1) }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erreur serveur" }));
        throw new Error(err.error || "Erreur lors de la communication avec le directeur");
      }
      const data = await res.json();
      return data.data.content as string;
    },
    onSuccess: (content) => {
      setMessages((prev) => [...prev, { role: "assistant", content }]);
      toast.success("Réponse reçue");
    },
    onError: (error) => {
      toast.error(error.message);
      // Remove the user message and add error
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: `Désolé, une erreur est survenue : ${error.message}` },
      ]);
    },
  });

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || chatMutation.isPending) return;
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    chatMutation.mutate(trimmed);
  }, [input, chatMutation]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "oklch(0.7 0.15 200)" }}>
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">Directeur de thèse IA</CardTitle>
            <CardDescription>Discutez avec votre directeur de recherche virtuel</CardDescription>
          </div>
        </div>
      </CardHeader>
      <Separator className="mb-4" />
      <CardContent className="flex flex-col gap-4 p-0">
        <ScrollArea className="h-[420px] rounded-lg border p-4" ref={scrollRef as React.RefObject<HTMLDivElement>}>
          <div className="flex flex-col gap-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : ""
                  }`}
                  style={msg.role === "assistant" ? { backgroundColor: "oklch(0.7 0.15 200)" } : undefined}
                >
                  {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-white" />}
                </div>
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: "oklch(0.7 0.15 200)" }}>
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-muted rounded-xl px-4 py-2.5 text-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span className="text-muted-foreground">Le directeur réfléchit…</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez votre question au directeur de thèse…"
            className="min-h-[44px] max-h-[120px] resize-none"
            disabled={chatMutation.isPending}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || chatMutation.isPending}
            size="icon"
            className="shrink-0 self-end"
            style={{ backgroundColor: "oklch(0.7 0.15 200)" }}
          >
            {chatMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════
// 2. Assistant thèse
// ═══════════════════════════════════════

const CONTEXT_OPTIONS = [
  { value: "chapitre", label: "Chapitre actuel" },
  { value: "problematique", label: "Problématique" },
  { value: "methodologie", label: "Méthodologie" },
  { value: "bibliographie", label: "Bibliographie" },
];

function AssistantPanel() {
  const [question, setQuestion] = useState("");
  const [context, setContext] = useState("chapitre");
  const [result, setResult] = useState("");

  const assistantMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/ai-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "assistant",
          prompt: question,
          context: `Contexte sélectionné : ${CONTEXT_OPTIONS.find((c) => c.value === context)?.label || context}`,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erreur serveur" }));
        throw new Error(err.error || "Erreur lors de la génération");
      }
      const data = await res.json();
      return data.data.content as string;
    },
    onSuccess: (content) => {
      setResult(content);
      toast.success("Réponse générée avec succès");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "oklch(0.7 0.15 145)" }}>
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">Assistant thèse</CardTitle>
            <CardDescription>Obtenez de l\'aide contextuelle pour votre travail</CardDescription>
          </div>
        </div>
      </CardHeader>
      <Separator className="mb-4" />
      <CardContent className="flex flex-col gap-4 p-0">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Contexte</label>
            <Select value={context} onValueChange={setContext}>
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTEXT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Votre question</label>
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Posez votre question en rapport avec le contexte sélectionné…"
            className="min-h-[120px]"
            disabled={assistantMutation.isPending}
          />
        </div>
        <Button
          onClick={() => assistantMutation.mutate()}
          disabled={!question.trim() || assistantMutation.isPending}
          style={{ backgroundColor: "oklch(0.7 0.15 145)" }}
          className="w-fit"
        >
          {assistantMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyse en cours…
            </>
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              Poser la question
            </>
          )}
        </Button>

        {assistantMutation.isPending && (
          <div className="space-y-3 rounded-lg border p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        )}

        {result && !assistantMutation.isPending && (
          <Card className="border bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Réponse de l\'assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{result}</div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════
// 3. Vérification linguistique
// ═══════════════════════════════════════

function GrammarPanel() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<GrammarResult | null>(null);

  const grammarMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/ai-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "correction",
          prompt: text,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erreur serveur" }));
        throw new Error(err.error || "Erreur lors de l\'analyse");
      }
      const data = await res.json();
      return data.data.content as string;
    },
    onSuccess: (content) => {
      const parsed = parseGrammarResult(content);
      setResult(parsed);
      const total = parsed.stats.errors + parsed.stats.warnings + parsed.stats.suggestions;
      toast.success(`Analyse terminée : ${total} éléments trouvés`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const severityIcon = (type: "error" | "warning" | "suggestion") => {
    if (type === "error") return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (type === "warning") return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    return <CheckCircle className="h-4 w-4 text-sky-500" />;
  };

  const severityLabel = (type: "error" | "warning" | "suggestion") => {
    if (type === "error") return "Erreur";
    if (type === "warning") return "Avertissement";
    return "Suggestion";
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "oklch(0.7 0.15 80)" }}>
            <SpellCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">Vérification linguistique</CardTitle>
            <CardDescription>Analysez la grammaire, l\'orthographe et la syntaxe</CardDescription>
          </div>
        </div>
      </CardHeader>
      <Separator className="mb-4" />
      <CardContent className="flex flex-col gap-4 p-0">
        <div className="space-y-2">
          <label className="text-sm font-medium">Texte à analyser</label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Collez ou saisissez le texte de votre thèse à vérifier…"
            className="min-h-[160px]"
            disabled={grammarMutation.isPending}
          />
        </div>
        <Button
          onClick={() => grammarMutation.mutate()}
          disabled={!text.trim() || grammarMutation.isPending}
          style={{ backgroundColor: "oklch(0.7 0.15 80)" }}
          className="w-fit"
        >
          {grammarMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyse en cours…
            </>
          ) : (
            <>
              <SpellCheck className="mr-2 h-4 w-4" />
              Analyser
            </>
          )}
        </Button>

        {grammarMutation.isPending && (
          <div className="space-y-3 rounded-lg border p-4">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        )}

        {result && !grammarMutation.isPending && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 dark:border-red-900 dark:bg-red-950">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">{result.stats.errors} erreurs</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-900 dark:bg-amber-950">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium">{result.stats.warnings} avertissements</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 dark:border-sky-900 dark:bg-sky-950">
                <CheckCircle className="h-4 w-4 text-sky-500" />
                <span className="text-sm font-medium">{result.stats.suggestions} suggestions</span>
              </div>
            </div>

            {/* Corrections list */}
            <ScrollArea className="max-h-96">
              <div className="flex flex-col gap-3">
                {result.corrections.map((correction, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                    <div className="mt-0.5 shrink-0">{severityIcon(correction.type)}</div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={correction.type === "error" ? "destructive" : correction.type === "warning" ? "outline" : "secondary"}>
                          {severityLabel(correction.type)}
                        </Badge>
                      </div>
                      {correction.original && (
                        <div className="text-sm">
                          <span className="text-red-600 line-through dark:text-red-400">{correction.original}</span>
                          <span className="mx-2 text-muted-foreground">→</span>
                          <span className="font-medium text-green-700 dark:text-green-400">{correction.suggested}</span>
                        </div>
                      )}
                      {!correction.original && (
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">{correction.suggested}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════
// 4. Vérification stylistique
// ═══════════════════════════════════════

function StylePanel() {
  const [text, setText] = useState("");
  const [issues, setIssues] = useState<StyleIssue[]>([]);

  const styleMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/ai-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "harper",
          prompt: text,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erreur serveur" }));
        throw new Error(err.error || "Erreur lors de l\'analyse");
      }
      const data = await res.json();
      return data.data.content as string;
    },
    onSuccess: (content) => {
      const parsed = parseStyleIssues(content);
      setIssues(parsed);
      toast.success(`${parsed.length} problème(s) de style détecté(s)`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const severityStyle = (severity: "error" | "warning" | "info") => {
    if (severity === "error") return "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950";
    if (severity === "warning") return "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950";
    return "border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950";
  };

  const severityIcon = (severity: "error" | "warning" | "info") => {
    if (severity === "error") return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (severity === "warning") return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    return <CheckCircle className="h-4 w-4 text-sky-500" />;
  };

  const severityLabel = (severity: "error" | "warning" | "info") => {
    if (severity === "error") return "Erreur";
    if (severity === "warning") return "Avertissement";
    return "Info";
  };

  const categoryBadgeVariant = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes("passe")) return "destructive" as const;
    if (cat.includes("actif")) return "default" as const;
    if (cat.includes("concordance")) return "secondary" as const;
    if (cat.includes("redondance")) return "outline" as const;
    return "secondary" as const;
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "oklch(0.7 0.15 340)" }}>
            <Palette className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">Vérification stylistique</CardTitle>
            <CardDescription>Analysez le style, le ton et la qualité rédactionnelle</CardDescription>
          </div>
        </div>
      </CardHeader>
      <Separator className="mb-4" />
      <CardContent className="flex flex-col gap-4 p-0">
        <div className="space-y-2">
          <label className="text-sm font-medium">Texte à vérifier</label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Saisissez le texte de votre thèse pour une analyse stylistique approfondie…"
            className="min-h-[160px]"
            disabled={styleMutation.isPending}
          />
        </div>
        <Button
          onClick={() => styleMutation.mutate()}
          disabled={!text.trim() || styleMutation.isPending}
          style={{ backgroundColor: "oklch(0.7 0.15 340)" }}
          className="w-fit"
        >
          {styleMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Vérification en cours…
            </>
          ) : (
            <>
              <Palette className="mr-2 h-4 w-4" />
              Vérifier le style
            </>
          )}
        </Button>

        {styleMutation.isPending && (
          <div className="space-y-3 rounded-lg border p-4">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}

        {issues.length > 0 && !styleMutation.isPending && (
          <ScrollArea className="max-h-96">
            <div className="flex flex-col gap-3">
              {issues.map((issue, i) => (
                <div key={i} className={`rounded-lg border p-4 ${severityStyle(issue.severity)}`}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">{severityIcon(issue.severity)}</div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={categoryBadgeVariant(issue.category)}>{issue.category}</Badge>
                        <Badge variant="outline">{severityLabel(issue.severity)}</Badge>
                      </div>
                      <p className="text-sm font-medium">{issue.text}</p>
                      {issue.suggestion && (
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Suggestion :</span> {issue.suggestion}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════
// 5. Humanisateur
// ═══════════════════════════════════════

function HumanizerPanel() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  const humanizeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/ai-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "humanize",
          prompt: text,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erreur serveur" }));
        throw new Error(err.error || "Erreur lors de l\'humanisation");
      }
      const data = await res.json();
      return data.data.content as string;
    },
    onSuccess: (content) => {
      setResult(content);
      toast.success("Texte humanisé avec succès");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCopy = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      toast.success("Copié dans le presse-papiers");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier le texte");
    }
  }, [result]);

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: "oklch(0.7 0.15 280)" }}>
            <User className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">Humanisateur</CardTitle>
            <CardDescription>Transformez un texte généré par IA en écriture naturelle</CardDescription>
          </div>
        </div>
      </CardHeader>
      <Separator className="mb-4" />
      <CardContent className="flex flex-col gap-4 p-0">
        <div className="space-y-2">
          <label className="text-sm font-medium">Texte généré par IA</label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Collez ici le texte généré par IA que vous souhaitez humaniser…"
            className="min-h-[160px]"
            disabled={humanizeMutation.isPending}
          />
        </div>
        <Button
          onClick={() => humanizeMutation.mutate()}
          disabled={!text.trim() || humanizeMutation.isPending}
          style={{ backgroundColor: "oklch(0.7 0.15 280)" }}
          className="w-fit"
        >
          {humanizeMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Humanisation en cours…
            </>
          ) : (
            <>
              <User className="mr-2 h-4 w-4" />
              Humaniser
            </>
          )}
        </Button>

        {humanizeMutation.isPending && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3 rounded-lg border p-4">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="space-y-3 rounded-lg border p-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        )}

        {result && !humanizeMutation.isPending && (
          <div className="grid gap-4 md:grid-cols-2">
            {/* Before */}
            <Card className="border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avant (IA)</CardTitle>
                  <Badge variant="outline" className="text-xs">Original</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{text}</p>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* After */}
            <Card className="border" style={{ borderColor: "oklch(0.7 0.12 280)" }}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium" style={{ color: "oklch(0.5 0.15 280)" }}>Après (Humanisé)</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="h-7 gap-1.5 text-xs"
                  >
                    <Copy className="h-3 w-3" />
                    {copied ? "Copié !" : "Copier le résultat"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{result}</p>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════
// Main Page
// ═══════════════════════════════════════

export function IaAssistantsPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">IA & Assistants</h1>
        <p className="text-muted-foreground">Vos assistants IA dédiés à l\'écriture de votre thèse</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="directeur" className="w-full">
        <TabsList className="mb-6 flex h-auto flex-wrap gap-1 bg-muted p-1">
          <TabsTrigger
            value="directeur"
            className="gap-2 data-[state=active]:shadow-sm"
          >
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Directeur de thèse</span>
            <span className="sm:hidden">Directeur</span>
          </TabsTrigger>
          <TabsTrigger
            value="assistant"
            className="gap-2 data-[state=active]:shadow-sm"
          >
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">Assistant thèse</span>
            <span className="sm:hidden">Assistant</span>
          </TabsTrigger>
          <TabsTrigger
            value="grammar"
            className="gap-2 data-[state=active]:shadow-sm"
          >
            <SpellCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Vérif. linguistique</span>
            <span className="sm:hidden">Linguistique</span>
          </TabsTrigger>
          <TabsTrigger
            value="style"
            className="gap-2 data-[state=active]:shadow-sm"
          >
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Vérif. stylistique</span>
            <span className="sm:hidden">Stylistique</span>
          </TabsTrigger>
          <TabsTrigger
            value="humanizer"
            className="gap-2 data-[state=active]:shadow-sm"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Humanisateur</span>
            <span className="sm:hidden">Humaniser</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="directeur">
          <DirecteurPanel />
        </TabsContent>
        <TabsContent value="assistant">
          <AssistantPanel />
        </TabsContent>
        <TabsContent value="grammar">
          <GrammarPanel />
        </TabsContent>
        <TabsContent value="style">
          <StylePanel />
        </TabsContent>
        <TabsContent value="humanizer">
          <HumanizerPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
