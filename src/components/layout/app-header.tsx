"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore, NAVIGATION_ITEMS } from "@/lib/stores/app-store";
import {
  Settings,
  HelpCircle,
  ChevronRight,
  Bot,
  Check,
  Loader2,
  Eye,
  EyeOff,
  RefreshCw,
  Zap,
  BookOpen,
  Keyboard,
  Info,
  KeyRound,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  type AiProviderId,
  type AiProviderConfig,
  type ProviderCategory,
  getProviderLabel,
  getProviderFields,
  providerNeedsKey,
  PROVIDER_MODELS,
  PROVIDER_BASE_URLS,
  PROVIDER_CATEGORIES,
  DYNAMIC_MODEL_PROVIDERS,
} from "@/lib/ai/ai-types";
import { UsageGuideDialog } from "./usage-guide-dialog";
import { AboutDialog } from "./about-dialog";
import { ShortcutsDialog } from "./shortcuts-dialog";

// Saved config stored in localStorage
const STORAGE_KEY = "thesisframe-ai-config";

function loadSavedConfig(): AiProviderConfig {
  if (typeof window === "undefined") return { provider: "zai" };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AiProviderConfig;
      if (parsed.provider) return parsed;
    }
  } catch { /* ignore */ }
  return { provider: "zai" };
}

function saveConfig(config: AiProviderConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  // Dispatch custom event so useAiConfig hooks in other components re-read
  window.dispatchEvent(new CustomEvent("ai-config-changed"));
}

// ═══════════════════════════════════════
// Type for /api/ai-keys response
// ═══════════════════════════════════════

interface HardcodedKeyInfo {
  provider: string;
  label: string;
  maskedKey: string;
  hasKey: boolean;
}

// ═══════════════════════════════════════
// AI Config Dialog
// ═══════════════════════════════════════

function AiConfigDialog({
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { setAiProvider } = useAppStore();
  const [config, setConfig] = useState<AiProviderConfig>(loadSavedConfig);
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "fail" | null>(null);
  const [dynamicModels, setDynamicModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [hardcodedKeys, setHardcodedKeys] = useState<HardcodedKeyInfo[]>([]);

  // Set of providers that have a hardcoded key
  const hardcodedSet = new Set(hardcodedKeys.map((k) => k.provider));

  // Sync from store on mount
  useEffect(() => {
    const saved = loadSavedConfig();
    setConfig(saved);
  }, []);

  // Fetch hardcoded key info on mount
  useEffect(() => {
    fetch("/api/ai-keys")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.providers)) {
          setHardcodedKeys(data.providers);
        }
      })
      .catch(() => { /* ignore */ });
  }, []);

  // Fetch dynamic models when provider is dynamic and apiKey is set
  const fetchDynamicModels = useCallback(async () => {
    const fields = getProviderFields(config.provider);
    if (!fields.dynamicModels) {
      setDynamicModels([]);
      return;
    }

    const baseUrl =
      config.baseUrl || PROVIDER_BASE_URLS[config.provider] || "";
    // Allow fetching models even without a user-provided key if provider has hardcoded key
    if (!baseUrl || (!config.apiKey && !hardcodedSet.has(config.provider))) {
      setDynamicModels([]);
      return;
    }

    setLoadingModels(true);
    try {
      const params = new URLSearchParams({ baseUrl });
      if (config.apiKey) params.set("apiKey", config.apiKey);
      params.set("provider", config.provider);
      const res = await fetch(`/api/ai-models?${params}`);
      const data = (await res.json()) as { models?: string[]; error?: string; cached?: boolean };
      if (data.error) {
        toast.error(data.error);
        setDynamicModels([]);
      } else if (data.models && data.models.length > 0) {
        setDynamicModels(data.models);
        // Auto-select first model if none selected or previously selected model not in list
        if (!config.model || !data.models.includes(config.model)) {
          setConfig((prev) => ({ ...prev, model: data.models![0] }));
        }
      } else {
        setDynamicModels([]);
        if (!data.cached) {
          toast.info("Aucun modèle trouvé pour ce fournisseur.");
        }
      }
    } catch (err) {
      toast.error(`Erreur réseau: ${err instanceof Error ? err.message : String(err)}`);
      setDynamicModels([]);
    } finally {
      setLoadingModels(false);
    }
  }, [config.provider, config.baseUrl, config.apiKey, config.model]);

  // Auto-fetch when provider is dynamic and apiKey is available (user-provided or hardcoded)
  useEffect(() => {
    const hasKey = !!config.apiKey || hardcodedSet.has(config.provider);
    if (DYNAMIC_MODEL_PROVIDERS.includes(config.provider) && hasKey) {
      const timer = setTimeout(fetchDynamicModels, 300);
      return () => clearTimeout(timer);
    }
    if (!config.apiKey && !hardcodedSet.has(config.provider)) {
      setDynamicModels([]);
    }
  }, [config.provider, config.apiKey, fetchDynamicModels, hardcodedSet]);

  const handleProviderChange = useCallback((value: string) => {
    const newProvider = value as AiProviderId;
    // Auto-fill the default model for this provider
    const defaultModel = PROVIDER_MODELS[newProvider]?.[0];
    // Auto-fill base URL for known providers
    const defaultBaseUrl = PROVIDER_BASE_URLS[newProvider];

    setConfig((prev) => ({
      provider: newProvider,
      // If the provider has a hardcoded key, leave apiKey empty (server will inject it)
      // Otherwise keep previous key if user already typed one
      apiKey: hardcodedSet.has(newProvider) ? undefined : (newProvider === "zai" ? undefined : prev.apiKey),
      model: defaultModel || prev.model,
      baseUrl: newProvider === "custom" ? prev.baseUrl : (defaultBaseUrl || undefined),
    }));
    setTestResult(null);
    setDynamicModels([]);
  }, [hardcodedSet]);

  const handleSave = useCallback(() => {
    saveConfig(config);
    setAiProvider(config.provider);
    toast.success(`Fournisseur IA : ${getProviderLabel(config.provider)}`);
    onOpenChange(false);
  }, [config, setAiProvider, onOpenChange]);

  const handleTest = useCallback(async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/ai-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: config.provider,
          apiKey: config.apiKey,
          model: config.model,
          baseUrl: config.baseUrl,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setTestResult("success");
      toast.success("Connexion réussie !");
    } catch (err) {
      setTestResult("fail");
      toast.error(
        `Échec : ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      setTesting(false);
    }
  }, [config]);

  const fields = getProviderFields(config.provider);
  const staticModels = PROVIDER_MODELS[config.provider] || [];
  const models = dynamicModels.length > 0 ? dynamicModels : staticModels;

  // Current provider's hardcoded key info
  const currentHardcoded = hardcodedKeys.find(
    (k) => k.provider === config.provider
  );

  return (
    <DialogContent className="sm:max-w-lg max-h-[90vh]">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Fournisseur IA
        </DialogTitle>
        <DialogDescription>
          Choisissez le fournisseur d&apos;intelligence artificielle pour les fonctions IA de Ma Thèse.
        </DialogDescription>
      </DialogHeader>

      <ScrollArea className="max-h-[65vh] pr-3">
        <div className="flex flex-col gap-4 py-2">
          {/* Provider select with categories */}
          <div className="flex flex-col gap-1.5">
            <Label>Fournisseur</Label>
            <Select value={config.provider} onValueChange={handleProviderChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un fournisseur" />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {(Object.entries(PROVIDER_CATEGORIES) as [ProviderCategory, typeof PROVIDER_CATEGORIES[ProviderCategory]][]).map(
                  ([catId, cat], idx) => (
                    <SelectGroup key={catId}>
                      {idx > 0 && <SelectSeparator />}
                      <SelectLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {cat.label}
                        {cat.description && (
                          <span className="font-normal normal-case ml-1.5 text-muted-foreground/70">
                            — {cat.description}
                          </span>
                        )}
                      </SelectLabel>
                      {cat.providers.map((p) => {
                        const hasHardcoded = hardcodedSet.has(p);
                        const needsKey = providerNeedsKey(p);
                        return (
                          <SelectItem key={p} value={p}>
                            <span className="flex items-center gap-2">
                              {p === "routesme" && <Zap className="h-3.5 w-3.5 text-amber-500" />}
                              {getProviderLabel(p)}
                              {hasHardcoded && (
                                <Badge
                                  variant="secondary"
                                  className="text-[9px] px-1.5 py-0 h-4 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border-0"
                                >
                                  <KeyRound className="h-2.5 w-2.5 mr-0.5" />
                                  clé OK
                                </Badge>
                              )}
                              {!hasHardcoded && !needsKey && p === "zai" && (
                                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
                                  natif
                                </Badge>
                              )}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectGroup>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Hardcoded key indicator */}
          {currentHardcoded && (
            <div className="rounded-lg border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/20 p-3 text-[11px] text-emerald-800 dark:text-emerald-300 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5" />
                Clé API pré-configurée
              </p>
              <p className="font-mono text-[10px] opacity-70">
                {currentHardcoded.maskedKey}
              </p>
              <p className="opacity-80">
                Aucune clé à saisir. Le serveur utilisera automatiquement la clé intégrée.
              </p>
            </div>
          )}

          {/* API Key (only if provider needs key AND has no hardcoded key) */}
          {fields.showApiKey && !currentHardcoded && (
            <div className="flex flex-col gap-1.5">
              <Label>Clé API</Label>
              <div className="relative">
                <Input
                  type={showKey ? "text" : "password"}
                  placeholder={
                    config.provider === "routesme"
                      ? "rm-xxxxxxxxxxxxxxxx"
                      : config.provider === "mistral"
                        ? "xxxxxxxxxxxxxxxxxxxxxxxx"
                        : "sk-..."
                  }
                  value={config.apiKey || ""}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, apiKey: e.target.value }))
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
              {config.provider === "routesme" && (
                <p className="text-[11px] text-muted-foreground">
                  Obtenez votre clé sur{" "}
                  <a
                    href="https://routesme.online"
                    target="_blank"
                    rel="noopener"
                    className="underline text-amber-600 dark:text-amber-400 hover:text-amber-700"
                  >
                    routesme.online
                  </a>
                </p>
              )}
              {config.provider === "mistral" && (
                <p className="text-[11px] text-muted-foreground">
                  Obtenez votre clé sur{" "}
                  <a
                    href="https://console.mistral.ai"
                    target="_blank"
                    rel="noopener"
                    className="underline text-sky-600 dark:text-sky-400 hover:text-sky-700"
                  >
                    console.mistral.ai
                  </a>
                </p>
              )}
            </div>
          )}

          {/* Model select — static or dynamic */}
          {fields.showModel && models.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label>Modèle</Label>
                {fields.dynamicModels && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={fetchDynamicModels}
                    disabled={loadingModels}
                  >
                    <RefreshCw
                      className={`h-3 w-3 ${loadingModels ? "animate-spin" : ""}`}
                    />
                  </Button>
                )}
              </div>
              <Select
                value={config.model || ""}
                onValueChange={(v) =>
                  setConfig((prev) => ({ ...prev, model: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    loadingModels ? "Chargement des modèles…" : "Choisir un modèle"
                  } />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {models.map((m) => (
                    <SelectItem key={m} value={m}>
                      <span className="flex items-center gap-1.5">
                        {m}
                        {m.toLowerCase().includes("free") && (
                          <Badge
                            variant="secondary"
                            className="text-[9px] px-1 py-0 h-3.5"
                          >
                            FREE
                          </Badge>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {loadingModels && (
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Récupération des modèles disponibles…
                </p>
              )}
            </div>
          )}

          {/* Model input for dynamic providers when no models loaded */}
          {fields.showModel &&
            fields.dynamicModels &&
            models.length === 0 &&
            !loadingModels && (
              <div className="flex flex-col gap-1.5">
                <Label>Modèle</Label>
                <Input
                  type="text"
                  placeholder="Nom du modèle (ex: GLM5.2-free)"
                  value={config.model || ""}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, model: e.target.value }))
                  }
                />
                <p className="text-[11px] text-muted-foreground">
                  Entrez votre clé API ci-dessus pour charger la liste des modèles disponibles.
                </p>
              </div>
            )}

          {/* Base URL (custom provider only) */}
          {fields.showBaseUrl && (
            <div className="flex flex-col gap-1.5">
              <Label>URL de base</Label>
              <Input
                type="url"
                placeholder="https://api.example.com/v1"
                value={config.baseUrl || ""}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, baseUrl: e.target.value }))
                }
              />
            </div>
          )}

          {/* Provider-specific info banners */}
          {config.provider === "routesme" && (
            <div className="rounded-lg border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20 p-3 text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
              <p className="font-semibold">RoutesMe — One API for every AI model</p>
              <p>
                Accédez à 20+ modèles (GLM 5.2, GPT-5.6, Claude Fable 5, DeepSeek V4, Kimi K3, Gemini…)
                avec une seule clé API compatible OpenAI.
              </p>
              <p>
                • <span className="font-medium">Gratuit</span> : GLM 5.2-Free, 2 000 tokens/jour
              </p>
              <p>
                • <span className="font-medium">VIP ($20/mois)</span> : Tous les modèles, 20M tokens/jour
              </p>
            </div>
          )}

          {config.provider === "mistral" && (
            <div className="rounded-lg border border-sky-200 dark:border-sky-800/50 bg-sky-50 dark:bg-sky-950/20 p-3 text-[11px] text-sky-800 dark:text-sky-300 space-y-1">
              <p className="font-semibold">Mistral AI — Modèles IA français</p>
              <p>
                Mistral Large, Medium, Small et Codestral. API 100% compatible OpenAI.
              </p>
              <p>
                • <span className="font-medium">Gratuit</span> : Créez un compte sur{" "}
                <a href="https://console.mistral.ai" target="_blank" rel="noopener" className="underline hover:text-sky-600">
                  console.mistral.ai
                </a>{" "}
                pour obtenir des crédits gratuits.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleTest}
              disabled={
                testing ||
                (config.provider !== "zai" && !config.apiKey && !currentHardcoded)
              }
            >
              {testing ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : testResult === "success" ? (
                <Check className="h-4 w-4 mr-1.5 text-emerald-500" />
              ) : null}
              {testing
                ? "Test…"
                : testResult === "success"
                  ? "Connecté !"
                  : "Tester"}
            </Button>
            <Button size="sm" className="flex-1" onClick={handleSave}>
              <Check className="h-4 w-4 mr-1.5" />
              Sauvegarder
            </Button>
          </div>
        </div>
      </ScrollArea>
    </DialogContent>
  );
}

// ═══════════════════════════════════════
// App Header
// ═══════════════════════════════════════

export function AppHeader() {
  const { currentView, aiProvider } = useAppStore();
  const currentNav = NAVIGATION_ITEMS.find((item) => item.id === currentView);
  const [configOpen, setConfigOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
      <SidebarTrigger className="-ml-1" />

      <Separator orientation="vertical" className="h-6" />

      {/* Breadcrumb-style navigation */}
      <nav className="flex items-center gap-1.5 text-sm">
        <span className="text-muted-foreground">Ma Thèse</span>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
        <span className="font-medium text-foreground">
          {currentNav?.label ?? "Tableau de bord"}
        </span>
      </nav>

      <div className="ml-auto flex items-center gap-2">
        {/* Help dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">Aide</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Aide &amp; Support</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setGuideOpen(true);
              }}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Guide d&apos;utilisation
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setShortcutsOpen(true);
              }}
            >
              <Keyboard className="h-4 w-4 mr-2" />
              Raccourcis clavier
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setAboutOpen(true);
              }}
            >
              <Info className="h-4 w-4 mr-2" />
              À propos de Ma Thèse
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">Paramètres</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Configuration</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setConfigOpen(true);
              }}
            >
              <Bot className="h-4 w-4 mr-2" />
              Fournisseur IA
              <Badge variant="outline" className="ml-auto text-[10px]">
                {aiProvider.toUpperCase()}
              </Badge>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                const link = document.createElement("a");
                link.href = "https://github.com/freemind25/Ma-These";
                link.target = "_blank";
                link.rel = "noopener";
                link.click();
              }}
            >
              GitHub
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* AI Config Dialog (rendered outside dropdown to avoid nesting) */}
      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <AiConfigDialog open={configOpen} onOpenChange={setConfigOpen} />
      </Dialog>

      {/* Usage Guide Dialog */}
      <UsageGuideDialog open={guideOpen} onOpenChange={setGuideOpen} />

      {/* Shortcuts Dialog */}
      <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />

      {/* About Dialog */}
      <AboutDialog open={aboutOpen} onOpenChange={setAboutOpen} />
    </header>
  );
}
