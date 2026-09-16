"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Zap,
  RefreshCw,
  Send,
  Square,
  Trash2,
  Globe,
  Wallet,
  Coins,
  Activity,
  AlertTriangle,
  ExternalLink,
  Cpu,
  Clock3,
  Bot,
  User,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface ApinexModel {
  id: string;
  provider: string;
  name: string;
  contextWindow: string;
  weight: number;
  dollarsPer1M: number;
  tags: string[];
  health: string;
}

interface ApinexBalance {
  balance_usd: number;
  reserved_usd: number;
  api_key: {
    spent_usd: number;
    spend_limit_usd: number | null;
    limit_reached: boolean;
  };
}

interface SourceItem {
  title: string;
  url: string;
  snippet?: string;
}

interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string;
  tokens?: number;
  costTokens?: number;
  latencyMs?: number;
  sources?: SourceItem[];
  error?: string;
}

// ═══════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════

const DEFAULT_MODEL = "free/glm-5.3-flash";

const PROVIDER_ORDER = [
  "Free",
  "OpenAI",
  "Anthropic",
  "Gemini",
  "DeepSeek",
  "Zhipu",
  "Moonshot",
  "xAI",
];

function isFreeModel(id: string) {
  return id.startsWith("free/");
}

function formatUsd(n: number | null | undefined) {
  if (n === null || n === undefined) return "—";
  return `$${n.toFixed(2)}`;
}

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `msg-${Date.now()}-${idCounter}`;
}

// ═══════════════════════════════════════════════════════════
// Composant principal
// ═══════════════════════════════════════════════════════════

export function ApinexPage() {
  const { toast } = useToast();

  // Données API
  const [models, setModels] = useState<ApinexModel[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [balance, setBalance] = useState<ApinexBalance | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [keyPresent, setKeyPresent] = useState(true);

  // Réglages chat
  const [model, setModel] = useState<string>(DEFAULT_MODEL);
  const [temperature, setTemperature] = useState(0.7);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [webSearch, setWebSearch] = useState(false);

  // Conversation
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [searching, setSearching] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // ── Chargement initial ──
  const loadModels = useCallback(async () => {
    setModelsLoading(true);
    try {
      const res = await fetch("/api/apinex/models");
      const data = await res.json();
      if (data.ok) {
        setModels(data.models);
        setKeyPresent(data.hasKey !== false);
      } else {
        toast({
          title: "Catalogue modèles",
          description: data.error || "Erreur de chargement",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Catalogue modèles",
        description: "APInex injoignable",
        variant: "destructive",
      });
    } finally {
      setModelsLoading(false);
    }
  }, [toast]);

  const loadBalance = useCallback(async () => {
    setBalanceLoading(true);
    try {
      const res = await fetch("/api/apinex/balance");
      const data = await res.json();
      if (data.ok) {
        setBalance(data.balance);
      }
    } catch {
      // silencieux : le badge affichera —
    } finally {
      setBalanceLoading(false);
    }
  }, []);

  useEffect(() => {
    loadModels();
    loadBalance();
  }, [loadModels, loadBalance]);

  // Auto-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, streaming]);

  // ── Modèles groupés par provider ──
  const groupedModels = useMemo(() => {
    const groups = new Map<string, ApinexModel[]>();
    for (const m of models) {
      const list = groups.get(m.provider) ?? [];
      list.push(m);
      groups.set(m.provider, list);
    }
    for (const [, list] of groups) {
      list.sort((a, b) => a.dollarsPer1M - b.dollarsPer1M || a.id.localeCompare(b.id));
    }
    return [...groups.entries()].sort(
      (a, b) =>
        (PROVIDER_ORDER.indexOf(a[0]) + 1 || 99) -
        (PROVIDER_ORDER.indexOf(b[0]) + 1 || 99)
    );
  }, [models]);

  const selectedModel = models.find((m) => m.id === model);
  const freeCount = models.filter((m) => isFreeModel(m.id)).length;

  // ── Recherche web (outil APInex, ~600 tokens/appel) ──
  const runWebSearch = useCallback(
    async (query: string): Promise<SourceItem[] | null> => {
      try {
        const res = await fetch("/api/apinex/web-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, count: 5 }),
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          const msg = data.error?.message || `HTTP ${res.status}`;
          if (data.error?.type === "billing_error") {
            toast({
              title: "Recherche web indisponible",
              description:
                "Solde APInex insuffisant (≈600 tokens requis). Rechargez sur apinex.bond.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Recherche web",
              description: msg,
              variant: "destructive",
            });
          }
          return null;
        }
        const results = Array.isArray(data.data?.results)
          ? data.data.results
          : Array.isArray(data.data)
            ? data.data
            : [];
        return results
          .slice(0, 6)
          .map((r: Record<string, unknown>): SourceItem => {
            const obj = r as Record<string, string>;
            return {
              title: obj.title || obj.name || "Résultat",
              url: obj.url || obj.link || "",
              snippet: obj.snippet || obj.description || obj.content || obj.text || "",
            };
          })
          .filter((s: SourceItem) => s.url || s.snippet);
      } catch {
        toast({
          title: "Recherche web",
          description: "Service injoignable",
          variant: "destructive",
        });
        return null;
      }
    },
    [toast]
  );

  // ── Envoi du message (streaming SSE) ──
  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;

    setInput("");
    setMessages((prev) => [...prev, { id: nextId(), role: "user", content: text }]);

    // 1) Recherche web optionnelle
    let sources: SourceItem[] | undefined;
    if (webSearch) {
      setSearching(true);
      const found = await runWebSearch(text);
      setSearching(false);
      if (found && found.length > 0) sources = found;
    }

    // 2) Construction des messages envoyés au modèle
    const history: ChatMsg[] = [...messages, { id: nextId(), role: "user", content: text }];
    const apiMessages: { role: string; content: string }[] = [];
    if (systemPrompt.trim()) {
      apiMessages.push({ role: "system", content: systemPrompt.trim() });
    }
    if (sources && sources.length > 0) {
      const ctx = sources
        .map((s, i) => `[${i + 1}] ${s.title}\nURL: ${s.url}\n${s.snippet ?? ""}`)
        .join("\n\n");
      apiMessages.push({
        role: "system",
        content: `Résultats de recherche web récents à utiliser pour répondre (cite les sources [n] quand pertinent) :\n\n${ctx}`,
      });
    }
    for (const m of history) {
      if (!m.error) apiMessages.push({ role: m.role, content: m.content });
    }

    // 3) Message assistant en streaming
    const assistantId = nextId();
    const startedAt = Date.now();
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "", model, sources },
    ]);
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/apinex/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: apiMessages,
          temperature,
          stream: true,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const errType = data?.error?.type || "";
        const errMsg = data?.error?.message || `HTTP ${res.status}`;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, error: errMsg, latencyMs: Date.now() - startedAt }
              : m
          )
        );
        if (errType === "billing_error") {
          toast({
            title: "Solde insuffisant",
            description:
              "Ce modèle payant nécessite un solde APInex. Les modèles « free/ » restent gratuits.",
            variant: "destructive",
          });
        } else {
          toast({ title: "Erreur APInex", description: errMsg, variant: "destructive" });
        }
        return;
      }

      // Parse SSE
      const reader = res.body?.getReader();
      if (!reader) throw new Error("Flux indisponible");
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";
      let usage: { total_tokens?: number; cost_tokens?: number } | undefined;

      const applyDelta = (deltaContent: string) => {
        acc += deltaContent;
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: acc } : m))
        );
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";
        for (const evt of events) {
          for (const line of evt.split("\n")) {
            if (!line.startsWith("data:")) continue;
            const dataStr = line.slice(5).trim();
            if (!dataStr || dataStr === "[DONE]") continue;
            try {
              const json = JSON.parse(dataStr);
              const delta = json?.choices?.[0]?.delta?.content;
              if (typeof delta === "string" && delta.length > 0) applyDelta(delta);
              if (json?.usage) usage = json.usage;
            } catch {
              // fragment non-JSON : ignoré
            }
          }
        }
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: acc || m.content,
                tokens: usage?.total_tokens,
                costTokens: usage?.cost_tokens,
                latencyMs: Date.now() - startedAt,
              }
            : m
        )
      );
      // Le solde peut avoir évolué (modèles payants)
      loadBalance();
    } catch (err) {
      const aborted = err instanceof Error && err.name === "AbortError";
      if (!aborted) {
        const msg = err instanceof Error ? err.message : "Erreur réseau";
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, error: msg } : m))
        );
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [
    input,
    streaming,
    webSearch,
    messages,
    model,
    temperature,
    systemPrompt,
    runWebSearch,
    loadBalance,
    toast,
  ]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clearConversation = useCallback(() => {
    setMessages([]);
  }, []);

  // ── Rendu ──
  return (
    <div className="container max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              APInex Playground
              <Badge variant="outline" className="hidden sm:inline-flex">
                1 clé · 7 fournisseurs
              </Badge>
            </h1>
            <p className="text-sm text-muted-foreground">
              Tous les modèles + outils APInex via une clé unique, côté serveur.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadModels();
              loadBalance();
            }}
            disabled={modelsLoading || balanceLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-1 ${modelsLoading || balanceLoading ? "animate-spin" : ""}`}
            />
            Actualiser
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="https://apinex.bond/overview" target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4 mr-1" />
              Dashboard
            </a>
          </Button>
        </div>
      </div>

      {/* Alerte clé manquante */}
      {!keyPresent && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Clé API absente</AlertTitle>
          <AlertDescription>
            Ajoutez <code>APINEX_API_KEY</code> dans le fichier <code>.env</code> du serveur.
          </AlertDescription>
        </Alert>
      )}

      {/* Cartes stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <Wallet className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Solde disponible</p>
              {balanceLoading ? (
                <Skeleton className="h-6 w-20 mt-1" />
              ) : (
                <p className="text-lg font-bold truncate">
                  {balance ? formatUsd(balance.balance_usd) : "—"}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Coins className="h-5 w-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Dépensé / Réservé</p>
              {balanceLoading ? (
                <Skeleton className="h-6 w-20 mt-1" />
              ) : (
                <p className="text-lg font-bold truncate">
                  {balance
                    ? `${formatUsd(balance.api_key?.spent_usd)} / ${formatUsd(balance.reserved_usd)}`
                    : "—"}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
              <Activity className="h-5 w-5 text-violet-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Modèles actifs</p>
              {modelsLoading ? (
                <Skeleton className="h-6 w-20 mt-1" />
              ) : (
                <p className="text-lg font-bold truncate">
                  {models.length}
                  <span className="text-sm font-medium text-muted-foreground">
                    {" "}
                    dont {freeCount} gratuits
                  </span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Zone principale : chat + réglages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Conversation
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto h-8 text-muted-foreground"
                  onClick={clearConversation}
                  disabled={streaming}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Effacer
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4 pt-0">
            <div
              ref={scrollRef}
              className="flex-1 min-h-[320px] max-h-[520px] overflow-y-auto rounded-lg border bg-muted/20 p-4 space-y-4 scrollbar-thin"
            >
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-2 py-12 text-muted-foreground">
                  <Zap className="h-8 w-8 opacity-40" />
                  <p className="text-sm">
                    Envoyez un message pour discuter avec{" "}
                    <span className="font-medium text-foreground">{model}</span>.
                  </p>
                  <p className="text-xs">
                    Les modèles <code className="text-foreground">free/*</code> fonctionnent
                    même avec un solde à 0 $.
                  </p>
                </div>
              ) : (
                messages.map((m) => <ChatBubble key={m.id} msg={m} />)
              )}
              {searching && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                  <Search className="h-4 w-4" />
                  Recherche web APInex en cours…
                </div>
              )}
            </div>

            {/* Saisie */}
            <div className="space-y-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Votre message… (Entrée pour envoyer, Maj+Entrée pour un saut de ligne)"
                rows={3}
                disabled={streaming}
                className="resize-none"
              />
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Switch checked={webSearch} onCheckedChange={setWebSearch} id="websearch" />
                  <Label htmlFor="websearch" className="cursor-pointer flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5" />
                    Recherche web
                  </Label>
                  <Badge variant="outline" className="text-[10px]">
                    ≈600 tokens / appel
                  </Badge>
                </div>
                {streaming ? (
                  <Button variant="destructive" size="sm" onClick={stopStreaming}>
                    <Square className="h-4 w-4 mr-1" />
                    Arrêter
                  </Button>
                ) : (
                  <Button size="sm" onClick={sendMessage} disabled={!input.trim() || searching}>
                    <Send className="h-4 w-4 mr-1" />
                    Envoyer
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Réglages */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                Modèle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {modelsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choisir un modèle" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    {groupedModels.map(([provider, list]) => (
                      <SelectGroup key={provider}>
                        <SelectLabel>{provider}</SelectLabel>
                        {list.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            <span className="flex items-center gap-2">
                              <span className="truncate max-w-[220px]">{m.id}</span>
                              {isFreeModel(m.id) ? (
                                <Badge className="text-[10px] px-1 py-0 h-4 bg-emerald-600 hover:bg-emerald-600">
                                  GRATUIT
                                </Badge>
                              ) : (
                                <span className="text-[10px] text-muted-foreground">
                                  ${m.dollarsPer1M}/1M
                                </span>
                              )}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {selectedModel && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg border p-2">
                    <p className="text-muted-foreground">Prix</p>
                    <p className="font-semibold">
                      {isFreeModel(selectedModel.id)
                        ? "Gratuit"
                        : `$${selectedModel.dollarsPer1M} / 1M`}
                    </p>
                  </div>
                  <div className="rounded-lg border p-2">
                    <p className="text-muted-foreground">Contexte</p>
                    <p className="font-semibold">{selectedModel.contextWindow}</p>
                  </div>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Température</Label>
                  <span className="text-sm font-medium">{temperature.toFixed(1)}</span>
                </div>
                <Slider
                  value={[temperature]}
                  onValueChange={(v) => setTemperature(v[0] ?? 0.7)}
                  min={0}
                  max={2}
                  step={0.1}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Prompt système</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Optionnel — ex. : Tu es un assistant de recherche académique en urbanisme…"
                rows={5}
                className="resize-none text-sm"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Bulle de message
// ═══════════════════════════════════════════════════════════

function ChatBubble({ msg }: { msg: ChatMsg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}
      <div
        className={`max-w-[85%] rounded-xl px-4 py-3 text-sm space-y-2 ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-background border"
        }`}
      >
        {msg.error ? (
          <div className="flex items-start gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Échec de la requête</p>
              <p className="text-xs mt-0.5">{msg.error}</p>
            </div>
          </div>
        ) : isUser ? (
          <p className="whitespace-pre-wrap">{msg.content}</p>
        ) : (
          <div className="space-y-2 break-words [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-2 [&_code]:text-xs">
            {msg.content ? (
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            ) : (
              <span className="inline-flex items-center gap-1 text-muted-foreground animate-pulse">
                <Clock3 className="h-3.5 w-3.5" />
                génération…
              </span>
            )}
          </div>
        )}

        {/* Sources web */}
        {msg.sources && msg.sources.length > 0 && (
          <div className="rounded-lg bg-muted/60 p-2 space-y-1">
            <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
              <Globe className="h-3 w-3" />
              Sources web ({msg.sources.length})
            </p>
            <ul className="space-y-0.5">
              {msg.sources.map((s, i) => (
                <li key={`${s.url}-${i}`} className="text-[11px] truncate">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:text-primary"
                  >
                    [{i + 1}] {s.title || s.url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Méta */}
        {!isUser && !msg.error && (msg.model || msg.latencyMs) && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
            {msg.model && <span>{msg.model}</span>}
            {typeof msg.tokens === "number" && <span>{msg.tokens} tokens</span>}
            {typeof msg.costTokens === "number" && (
              <Badge variant="outline" className="text-[10px] h-4 px-1">
                {msg.costTokens === 0 ? "coût 0 token" : `${msg.costTokens} tokens APInex`}
              </Badge>
            )}
            {typeof msg.latencyMs === "number" && <span>{(msg.latencyMs / 1000).toFixed(1)} s</span>}
          </div>
        )}
      </div>
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
