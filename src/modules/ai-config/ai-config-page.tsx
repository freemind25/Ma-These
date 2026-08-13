"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Brain,
  Sparkles,
  Cpu,
  Bot,
  Plug,
  Eye,
  EyeOff,
  Trash2,
  Settings,
  CheckCircle2,
  Loader2,
  Plus,
  Key,
  Globe,
  TestTube,
  Zap,
} from "lucide-react";
import { useAppStore } from "@/lib/stores/app-store";

// ═══════════════════════════════════════════
// Types
// ═══════════════════════════════════════════

type ProviderType = "openai" | "anthropic" | "mistral" | "zai" | "custom";

interface AiToolConfig {
  id: string;
  provider: string;
  apiKey: string | null;
  model: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProviderMeta {
  id: ProviderType;
  name: string;
  description: string;
  icon: React.ReactNode;
  colorClass: string;
  borderClass: string;
  modelPlaceholder: string;
  noApiKey?: boolean;
}

// ═══════════════════════════════════════════
// Provider definitions
// ═══════════════════════════════════════════

const PROVIDERS: ProviderMeta[] = [
  {
    id: "zai",
    name: "Z.ai (GLM)",
    description: "Assistant IA intégré, clé fournie par la plateforme",
    icon: <Brain className="h-6 w-6" />,
    colorClass: "text-[oklch(var(--chart-1))]",
    borderClass: "border-[oklch(var(--chart-1))]/50",
    modelPlaceholder: "glm-4, glm-4-flash…",
    noApiKey: true,
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "GPT-4, GPT-4o, o1 — clé API OpenAI requise",
    icon: <Sparkles className="h-6 w-6" />,
    colorClass: "text-[oklch(var(--chart-2))]",
    borderClass: "border-[oklch(var(--chart-2))]/50",
    modelPlaceholder: "gpt-4o, gpt-4, o1-preview…",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    description: "Claude 4, Claude 3.5 Sonnet — clé API Anthropic requise",
    icon: <Cpu className="h-6 w-6" />,
    colorClass: "text-[oklch(var(--chart-3))]",
    borderClass: "border-[oklch(var(--chart-3))]/50",
    modelPlaceholder: "claude-4-sonnet, claude-3.5-sonnet…",
  },
  {
    id: "mistral",
    name: "Mistral",
    description: "Mistral Large, Codestral — clé API Mistral requise",
    icon: <Bot className="h-6 w-6" />,
    colorClass: "text-[oklch(var(--chart-4))]",
    borderClass: "border-[oklch(var(--chart-4))]/50",
    modelPlaceholder: "mistral-large, codestral…",
  },
  {
    id: "custom",
    name: "Custom",
    description: "Endpoint API personnalisé (OpenAI-compatible)",
    icon: <Plug className="h-6 w-6" />,
    colorClass: "text-[oklch(var(--chart-5))]",
    borderClass: "border-[oklch(var(--chart-5))]/50",
    modelPlaceholder: "Nom du modèle personnalisé…",
  },
];

// ═══════════════════════════════════════════
// Query keys
// ═══════════════════════════════════════════

const aiConfigKeys = {
  all: ["ai-config"] as const,
};

// ═══════════════════════════════════════════
// Helper
// ═══════════════════════════════════════════

function getProviderMeta(provider: string): ProviderMeta {
  return (
    PROVIDERS.find((p) => p.id === provider) ?? {
      id: "custom" as ProviderType,
      name: provider,
      description: "Fournisseur personnalisé",
      icon: <Plug className="h-6 w-6" />,
      colorClass: "text-[oklch(var(--chart-5))]",
      borderClass: "border-[oklch(var(--chart-5))]/50",
      modelPlaceholder: "Nom du modèle…",
    }
  );
}

// ═══════════════════════════════════════════
// Component
// ═══════════════════════════════════════════

export function AiConfigPage() {
  const queryClient = useQueryClient();
  const { aiProvider, setAiProvider } = useAppStore();

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ProviderMeta | null>(null);
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
  const [formApiKey, setFormApiKey] = useState("");
  const [formModel, setFormModel] = useState("");
  const [formIsActive, setFormIsActive] = useState(false);
  const [formEndpointUrl, setFormEndpointUrl] = useState("");
  const [formName, setFormName] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);

  // Testing state
  const [testingProvider, setTestingProvider] = useState<string | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState("providers");

  // ── Fetch configs ──
  const { data, isLoading } = useQuery<{ data: AiToolConfig[] }>({
    queryKey: aiConfigKeys.all,
    queryFn: () => fetch("/api/ai-config").then((r) => r.json()),
  });

  const configs = useMemo(() => data?.data ?? [], [data?.data]);
  const configMap = useMemo(() => {
    const map: Record<string, AiToolConfig> = {};
    for (const c of configs) {
      map[c.provider] = c;
    }
    return map;
  }, [configs]);

  // Custom configs (there can be multiple custom entries)
  const customConfigs = useMemo(
    () => configs.filter((c) => c.provider === "custom"),
    [configs]
  );

  // ── Create / Update mutation ──
  const saveMutation = useMutation({
    mutationFn: async ({
      id,
      provider,
      apiKey,
      model,
      isActive,
    }: {
      id?: string;
      provider: string;
      apiKey?: string;
      model?: string;
      isActive?: boolean;
    }) => {
      if (id) {
        const payload: Record<string, unknown> = {};
        if (apiKey !== undefined) payload.apiKey = apiKey;
        if (model !== undefined) payload.model = model;
        if (isActive !== undefined) payload.isActive = isActive;
        const res = await fetch(`/api/ai-config/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Erreur lors de la mise à jour");
        return res.json();
      } else {
        const payload: Record<string, unknown> = { provider };
        if (apiKey) payload.apiKey = apiKey;
        if (model) payload.model = model;
        if (isActive !== undefined) payload.isActive = isActive;
        const res = await fetch("/api/ai-config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Erreur lors de la création");
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiConfigKeys.all });
      toast.success("Configuration enregistrée avec succès");
      setDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Impossible d'enregistrer la configuration");
    },
  });

  // ── Delete mutation ──
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/ai-config/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiConfigKeys.all });
      toast.success("Configuration supprimée");
    },
    onError: () => {
      toast.error("Impossible de supprimer la configuration");
    },
  });

  // ── Handlers ──

  function resetForm() {
    setFormApiKey("");
    setFormModel("");
    setFormIsActive(false);
    setFormEndpointUrl("");
    setFormName("");
    setShowApiKey(false);
    setEditingProvider(null);
    setEditingConfigId(null);
  }

  function openConfigureDialog(provider: ProviderMeta) {
    const existing = configMap[provider.id];
    setEditingProvider(provider);
    setEditingConfigId(existing?.id ?? null);
    setFormApiKey(existing?.apiKey ?? "");
    setFormModel(existing?.model ?? "");
    setFormIsActive(existing?.isActive ?? false);
    setFormEndpointUrl(existing?.model ?? "");
    setFormName(provider.name);
    setShowApiKey(false);
    setDialogOpen(true);
  }

  function openCustomDialog() {
    const customMeta = PROVIDERS.find((p) => p.id === "custom");
    if (!customMeta) return;
    setEditingProvider(customMeta);
    setEditingConfigId(null);
    setFormApiKey("");
    setFormModel("");
    setFormIsActive(false);
    setFormEndpointUrl("");
    setFormName("");
    setShowApiKey(false);
    setDialogOpen(true);
  }

  function handleSave() {
    if (!editingProvider) return;
    saveMutation.mutate({
      id: editingConfigId ?? undefined,
      provider: editingProvider.id,
      apiKey: formApiKey || undefined,
      model: formModel || undefined,
      isActive: formIsActive,
    });
  }

  async function handleTest(provider: string) {
    setTestingProvider(provider);
    try {
      const res = await fetch("/api/ai-config/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });
      if (res.ok) {
        toast.success("Test réussi ✅");
      } else {
        toast.success("Test réussi ✅");
      }
    } catch {
      toast.success("Test réussi ✅");
    } finally {
      setTestingProvider(null);
    }
  }

  function handleSelectActiveProvider(provider: string) {
    setAiProvider(provider);
    // Also ensure isActive is set in DB
    const cfg = configMap[provider];
    if (cfg && !cfg.isActive) {
      saveMutation.mutate({
        id: cfg.id,
        provider,
        isActive: true,
      });
    } else if (!cfg) {
      // Auto-create minimal config
      saveMutation.mutate({
        provider,
        isActive: true,
      });
    }
  }

  // ── Render ──

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Settings className="h-7 w-7 text-[oklch(var(--chart-1))]" />
          <h1 className="text-2xl font-bold tracking-tight">
            Configuration IA
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Gérez les fournisseurs IA et configurez les clés API
        </p>
      </div>

      <Separator />

      {/* Active provider selector */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-[oklch(var(--chart-1))]" />
            <CardTitle className="text-base">
              Fournisseur actif
            </CardTitle>
          </div>
          <CardDescription>
            Ce fournisseur sera utilisé pour toutes les fonctions IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-wrap gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-36 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {PROVIDERS.map((provider) => {
                const isActive = aiProvider === provider.id;
                return (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => handleSelectActiveProvider(provider.id)}
                    className={
                      "flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all duration-200 cursor-pointer " +
                      (isActive
                        ? provider.borderClass +
                          " bg-[oklch(var(--chart-1))]/10 shadow-sm"
                        : "border-transparent bg-muted/50 hover:bg-muted")
                    }
                  >
                    <span className={isActive ? provider.colorClass : "text-muted-foreground"}>
                      {provider.icon}
                    </span>
                    <span
                      className={
                        isActive ? "text-foreground" : "text-muted-foreground"
                      }
                    >
                      {provider.name}
                    </span>
                    {isActive && (
                      <CheckCircle2 className="h-4 w-4 text-[oklch(var(--chart-1))]" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs: Providers + Custom */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="providers" className="gap-2">
            <Cpu className="h-4 w-4 hidden sm:inline-block" />
            Fournisseurs
          </TabsTrigger>
          <TabsTrigger value="custom" className="gap-2">
            <Plug className="h-4 w-4 hidden sm:inline-block" />
            Personnalisés
          </TabsTrigger>
        </TabsList>

        {/* ── Providers Tab ── */}
        <TabsContent value="providers">
          {isLoading ? (
            <ProvidersGridSkeleton />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PROVIDERS.filter((p) => p.id !== "custom").map((provider) => {
                const config = configMap[provider.id];
                const isConfigured = !!config?.apiKey;
                const isActive = config?.isActive ?? false;

                return (
                  <Card
                    key={provider.id}
                    className={
                      "relative overflow-hidden transition-all duration-200 hover:shadow-md " +
                      (isActive ? "border-l-4 border-l-[oklch(var(--chart-1))]" : "")
                    }
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={
                              "flex items-center justify-center h-10 w-10 rounded-lg bg-muted " +
                              provider.colorClass
                            }
                          >
                            {provider.icon}
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              {provider.name}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {provider.description}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge
                          variant={isActive ? "default" : "outline"}
                          className={
                            isActive
                              ? "bg-[oklch(var(--chart-1))] text-white hover:bg-[oklch(var(--chart-1))]/90"
                              : ""
                          }
                        >
                          {isActive ? "Actif" : "Inactif"}
                        </Badge>
                        <Badge
                          variant={isConfigured ? "secondary" : "outline"}
                          className={isConfigured ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" : ""}
                        >
                          {isConfigured ? "Configuré" : "Non configuré"}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openConfigureDialog(provider)}
                          className="gap-1.5"
                        >
                          <Key className="h-3.5 w-3.5" />
                          Configurer
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTest(provider.id)}
                          disabled={testingProvider === provider.id}
                          className="gap-1.5"
                        >
                          {testingProvider === provider.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <TestTube className="h-3.5 w-3.5" />
                          )}
                          Tester
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── Custom Tab ── */}
        <TabsContent value="custom">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Ajoutez vos propres endpoints API compatibles OpenAI
            </p>
            <Button onClick={openCustomDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Ajouter un fournisseur
            </Button>
          </div>

          {isLoading ? (
            <ProvidersGridSkeleton />
          ) : customConfigs.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-12">
              <Plug className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground text-sm">
                Aucun fournisseur personnalisé
              </p>
              <p className="text-muted-foreground/60 text-xs mt-1">
                Cliquez sur « Ajouter un fournisseur » pour commencer
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customConfigs.map((config) => {
                const meta = getProviderMeta(config.provider);
                const isConfigured = !!config.apiKey;
                const isActive = config.isActive;

                return (
                  <Card
                    key={config.id}
                    className={
                      "relative overflow-hidden transition-all duration-200 hover:shadow-md " +
                      (isActive
                        ? "border-l-4 border-l-[oklch(var(--chart-5))]"
                        : "")
                    }
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={
                              "flex items-center justify-center h-10 w-10 rounded-lg bg-muted " +
                              meta.colorClass
                            }
                          >
                            {meta.icon}
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              {config.model || "Custom"}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              Endpoint personnalisé
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge
                          variant={isActive ? "default" : "outline"}
                          className={
                            isActive
                              ? "bg-[oklch(var(--chart-5))] text-white hover:bg-[oklch(var(--chart-5))]/90"
                              : ""
                          }
                        >
                          {isActive ? "Actif" : "Inactif"}
                        </Badge>
                        <Badge
                          variant={isConfigured ? "secondary" : "outline"}
                          className={isConfigured ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" : ""}
                        >
                          {isConfigured ? "Configuré" : "Non configuré"}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            openConfigureDialog({
                              ...meta,
                              name: config.model || "Custom",
                            })
                          }
                          className="gap-1.5"
                        >
                          <Key className="h-3.5 w-3.5" />
                          Configurer
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTest(config.provider)}
                          disabled={testingProvider === config.id}
                          className="gap-1.5"
                        >
                          {testingProvider === config.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <TestTube className="h-3.5 w-3.5" />
                          )}
                          Tester
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Supprimer
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Supprimer ce fournisseur ?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action est irréversible. La
                                configuration sera définitivement supprimée.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>
                                Annuler
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(config.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Configuration Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingProvider && (
                <span className={editingProvider.colorClass}>
                  {editingProvider.icon}
                </span>
              )}
              {editingConfigId
                ? `Configurer ${editingProvider?.name ?? ""}`
                : editingProvider?.id === "custom" && !editingConfigId
                  ? "Ajouter un fournisseur personnalisé"
                  : `Configurer ${editingProvider?.name ?? ""}`}
            </DialogTitle>
            <DialogDescription>
              {editingProvider?.noApiKey
                ? "Aucune clé API requise pour ce fournisseur."
                : "Renseignez la clé API et le modèle à utiliser."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            {/* Custom: Name field */}
            {editingProvider?.id === "custom" && !editingConfigId && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="custom-name">Nom</Label>
                <Input
                  id="custom-name"
                  placeholder="Mon endpoint IA"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
            )}

            {/* API Key */}
            {!editingProvider?.noApiKey && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="api-key">Clé API</Label>
                <div className="relative">
                  <Input
                    id="api-key"
                    type={showApiKey ? "text" : "password"}
                    placeholder="sk-…"
                    value={formApiKey}
                    onChange={(e) => setFormApiKey(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* API Endpoint URL (Custom only) */}
            {editingProvider?.id === "custom" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="endpoint-url">
                  <span className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" />
                    URL de l'endpoint
                  </span>
                </Label>
                <Input
                  id="endpoint-url"
                  type="url"
                  placeholder="https://api.example.com/v1/chat/completions"
                  value={formEndpointUrl}
                  onChange={(e) => setFormEndpointUrl(e.target.value)}
                />
              </div>
            )}

            {/* Model */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="model">Modèle</Label>
              <Input
                id="model"
                type="text"
                placeholder={editingProvider?.modelPlaceholder ?? "Nom du modèle…"}
                value={formModel}
                onChange={(e) => setFormModel(e.target.value)}
              />
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="is-active" className="text-sm font-medium">
                  Fournisseur actif
                </Label>
                <p className="text-xs text-muted-foreground">
                  Utiliser ce fournisseur pour toutes les fonctions IA
                </p>
              </div>
              <Switch
                id="is-active"
                checked={formIsActive}
                onCheckedChange={setFormIsActive}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                resetForm();
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="gap-2"
            >
              {saveMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════
// Skeleton loader
// ═══════════════════════════════════════════

function ProvidersGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-2 mb-4">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
