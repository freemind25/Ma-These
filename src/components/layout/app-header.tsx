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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  type AiProviderId,
  type AiProviderConfig,
  getProviderLabel,
  getProviderFields,
  PROVIDER_MODELS,
} from "@/lib/ai/ai-types";

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
// AI Config Dialog
// ═══════════════════════════════════════

function AiConfigDialog({
  open,
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

  // Sync from store on mount
  useEffect(() => {
    const saved = loadSavedConfig();
    setConfig(saved);
  }, []);

  const handleProviderChange = useCallback((value: string) => {
    const newProvider = value as AiProviderId;
    setConfig((prev) => ({
      provider: newProvider,
      apiKey: newProvider === "zai" ? undefined : prev.apiKey,
      model: newProvider === "zai" ? undefined : prev.model,
      baseUrl: prev.baseUrl,
    }));
  }, []);

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
      // Use server-side API route to test connection (avoids importing SDK in browser)
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
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setTestResult("success");
      toast.success("Connexion réussie !");
    } catch (err) {
      setTestResult("fail");
      toast.error(`Échec : ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setTesting(false);
    }
  }, [config]);

  const fields = getProviderFields(config.provider);
  const providerModels = PROVIDER_MODELS[config.provider] || [];

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Configuration du fournisseur IA
        </DialogTitle>
        <DialogDescription>
          Choisissez le fournisseur d&apos;intelligence artificielle pour les fonctions IA de ThesisFrame.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-4 py-2">
        {/* Provider select */}
        <div className="flex flex-col gap-1.5">
          <Label>Fournisseur</Label>
          <Select value={config.provider} onValueChange={handleProviderChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir un fournisseur" />
            </SelectTrigger>
            <SelectContent>
              {(["zai", "openai", "anthropic", "mistral", "custom"] as AiProviderId[]).map(
                (p) => (
                  <SelectItem key={p} value={p}>
                    {getProviderLabel(p)}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground">
            {config.provider === "zai"
              ? "✓ SDK natif (sandbox) ou clé API non requise"
              : "↔ Utilisera l'API compatible OpenAI"}
          </p>
        </div>

        {/* API Key */}
        {fields.showApiKey && (
          <div className="flex flex-col gap-1.5">
            <Label>Clé API</Label>
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                placeholder="sk-..."
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
          </div>
        )}

        {/* Model select */}
        {fields.showModel && providerModels.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <Label>Modèle</Label>
            <Select
              value={config.model || ""}
              onValueChange={(v) =>
                setConfig((prev) => ({ ...prev, model: v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir un modèle" />
              </SelectTrigger>
              <SelectContent>
                {providerModels.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleTest}
            disabled={testing || (config.provider !== "zai" && !config.apiKey)}
          >
            {testing ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : testResult === "success" ? (
              <Check className="h-4 w-4 mr-1.5 text-emerald-500" />
            ) : null}
            {testing ? "Test..." : testResult === "success" ? "Connecté !" : "Tester"}
          </Button>
          <Button size="sm" className="flex-1" onClick={handleSave}>
            <Check className="h-4 w-4 mr-1.5" />
            Sauvegarder
          </Button>
        </div>
      </div>
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

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
      <SidebarTrigger className="-ml-1" />

      <Separator orientation="vertical" className="h-6" />

      {/* Breadcrumb-style navigation */}
      <nav className="flex items-center gap-1.5 text-sm">
        <span className="text-muted-foreground">ThesisFrame</span>
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
            <DropdownMenuItem>Guide d&apos;utilisation</DropdownMenuItem>
            <DropdownMenuItem>Raccourcis clavier</DropdownMenuItem>
            <DropdownMenuItem>À propos de ThesisFrame</DropdownMenuItem>
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
    </header>
  );
}
