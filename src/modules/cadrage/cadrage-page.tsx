"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAiConfig } from "@/hooks/use-ai-config";
import {
  Compass,
  FileText,
  Loader2,
  Lock,
  Unlock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  History,
  Save,
  RefreshCcw,
  Eye,
  ChevronDown,
  ChevronUp,
  Brain,
  PlusCircle,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// ═══════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════

interface Thesis {
  id: string;
  title: string;
  author?: string;
  discipline?: string;
}

interface CadrageField {
  id: string;
  cadrageId: string;
  fieldKey: string;
  label: string;
  value: string | null;
  aiSuggestion: string | null;
  isLocked: boolean;
  sortOrder: number;
}

interface Cadrage {
  id: string;
  thesisId: string;
  label: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  fields: CadrageField[];
}

interface CadrageVersion {
  id: string;
  cadrageId: string;
  label: string | null;
  snapshot: string;
  createdAt: string;
}

// ═══════════════════════════════════════════════════
// Default fields spec
// ═══════════════════════════════════════════════════

const DEFAULT_FIELDS = [
  { fieldKey: "thematique", label: "Thématique générale", sortOrder: 0 },
  { fieldKey: "problematique", label: "Problématique", sortOrder: 1 },
  { fieldKey: "questions_recherche", label: "Question(s) de recherche", sortOrder: 2 },
  { fieldKey: "objectifs", label: "Objectifs", sortOrder: 3 },
  { fieldKey: "hypotheses", label: "Hypothèses (si applicable)", sortOrder: 4 },
  { fieldKey: "type_recherche", label: "Type de recherche", sortOrder: 5 },
  { fieldKey: "methodologie", label: "Méthodologie envisagée", sortOrder: 6 },
  { fieldKey: "revue_litterature", label: "Type de revue de littérature", sortOrder: 7 },
  { fieldKey: "cadre_theorique", label: "Cadre théorique / conceptuel", sortOrder: 8 },
  { fieldKey: "mots_cles", label: "Mots-clés", sortOrder: 9 },
  { fieldKey: "contribution_attendue", label: "Contribution attendue / originalité", sortOrder: 10 },
  { fieldKey: "type_these", label: "Type de thèse / contraintes institutionnelles", sortOrder: 11 },
] as const;

// ═══════════════════════════════════════════════════
// Hooks
// ═══════════════════════════════════════════════════

function useTheses() {
  return useQuery<Thesis[]>({
    queryKey: ["thesis"],
    queryFn: async () => {
      const res = await fetch("/api/thesis");
      if (!res.ok) throw new Error("Erreur lors du chargement des thèses");
      const json = await res.json();
      return json.data as Thesis[];
    },
    staleTime: 10 * 1000,
  });
}

function useCadrages(thesisId: string | null) {
  return useQuery<Cadrage[]>({
    queryKey: ["cadrages", thesisId],
    queryFn: async () => {
      if (!thesisId) return [];
      const res = await fetch(`/api/thesis/${thesisId}/cadrages`);
      if (!res.ok) throw new Error("Erreur lors du chargement des cadrages");
      const json = await res.json();
      return json.data as Cadrage[];
    },
    enabled: !!thesisId,
    staleTime: 5 * 1000,
  });
}

function useVersions(cadrageId: string | null) {
  return useQuery<CadrageVersion[]>({
    queryKey: ["cadrage-versions", cadrageId],
    queryFn: async () => {
      if (!cadrageId) return [];
      const res = await fetch(`/api/cadrages/${cadrageId}/versions`);
      if (!res.ok) throw new Error("Erreur lors du chargement des versions");
      const json = await res.json();
      return json.data as CadrageVersion[];
    },
    enabled: !!cadrageId,
    staleTime: 5 * 1000,
  });
}

// ═══════════════════════════════════════════════════
// Loading skeleton
// ═══════════════════════════════════════════════════

function LoadingSkeleton() {
  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 p-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════

export function CadragePage() {
  const { withAiConfig } = useAiConfig();
  const queryClient = useQueryClient();
  const { data: theses, isLoading: thesesLoading } = useTheses();

  const [selectedThesisId, setSelectedThesisId] = useState<string | null>(null);
  const [creatingCadrage, setCreatingCadrage] = useState(false);
  const [savingFieldId, setSavingFieldId] = useState<string | null>(null);
  const [aiDraftLoading, setAiDraftLoading] = useState(false);
  const [coherenceLoading, setCoherenceLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [coherenceResult, setCoherenceResult] = useState<string | null>(null);
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);
  // Track local field values for unsaved edits
  const [localFieldValues, setLocalFieldValues] = useState<Record<string, string>>({});

  // Thesis selection
  const selectedThesis = useMemo(() => {
    if (!theses || theses.length === 0) return null;
    const id = selectedThesisId || theses[0].id;
    return theses.find((t) => t.id === id) || theses[0];
  }, [theses, selectedThesisId]);

  const thesisId = selectedThesis?.id ?? null;

  // Cadrages for selected thesis
  const { data: cadrages, isLoading: cadragesLoading } = useCadrages(thesisId);

  // Active cadrage
  const activeCadrage = useMemo(
    () => cadrages?.find((c) => c.isActive) ?? cadrages?.[0] ?? null,
    [cadrages]
  );

  const cadrageId = activeCadrage?.id ?? null;

  // Versions
  const { data: versions, isLoading: versionsLoading } = useVersions(cadrageId);

  // Fields sorted
  const fields = useMemo(() => {
    if (!activeCadrage?.fields) return [];
    return [...activeCadrage.fields].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [activeCadrage]);

  // Completion progress
  const filledCount = useMemo(() => {
    if (!fields.length) return 0;
    return fields.filter(
      (f) => (localFieldValues[f.id] ?? f.value ?? "").trim().length > 0
    ).length;
  }, [fields, localFieldValues]);

  const completionPct = fields.length > 0 ? Math.round((filledCount / fields.length) * 100) : 0;

  // Sync localFieldValues when fields change (e.g. after create)
  useEffect(() => {
    if (fields.length > 0 && Object.keys(localFieldValues).length === 0) {
      const initial: Record<string, string> = {};
      fields.forEach((f) => {
        if (f.value) initial[f.id] = f.value;
      });
      setLocalFieldValues(initial);
    }
  }, [fields]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Create cadrage with 12 default fields ──
  const createCadrage = useCallback(async () => {
    if (!thesisId) return;
    setCreatingCadrage(true);
    try {
      const res = await fetch(`/api/thesis/${thesisId}/cadrages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thesisId,
          label: "Cadrage préliminaire",
          fields: DEFAULT_FIELDS.map((f) => ({
            fieldKey: f.fieldKey,
            label: f.label,
            sortOrder: f.sortOrder,
          })),
        }),
      });
      if (!res.ok) throw new Error("Erreur lors de la création du cadrage");
      await queryClient.invalidateQueries({ queryKey: ["cadrages", thesisId] });
      toast.success("Cadrage créé avec succès — 12 champs prêts à remplir");
    } catch {
      toast.error("Erreur lors de la création du cadrage");
    } finally {
      setCreatingCadrage(false);
    }
  }, [thesisId, queryClient]);

  // ── Save a single field ──
  const saveField = useCallback(
    async (fieldId: string, data: { value?: string; aiSuggestion?: string; isLocked?: boolean }) => {
      setSavingFieldId(fieldId);
      try {
        const res = await fetch(`/api/cadrages/fields/${fieldId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Erreur lors de la sauvegarde");
        await queryClient.invalidateQueries({ queryKey: ["cadrages", thesisId] });
      } catch {
        toast.error("Erreur lors de la sauvegarde du champ");
      } finally {
        setSavingFieldId(null);
      }
    },
    [thesisId, queryClient]
  );

  // ── Toggle lock on a field ──
  const toggleLock = useCallback(
    async (field: CadrageField) => {
      const newLocked = !field.isLocked;
      // Optimistic update
      const updatedFields = activeCadrage?.fields.map((f) =>
        f.id === field.id ? { ...f, isLocked: newLocked } : f
      );
      if (activeCadrage) {
        queryClient.setQueryData(["cadrages", thesisId], [
          { ...activeCadrage, fields: updatedFields ?? [] },
        ]);
      }
      await saveField(field.id, { isLocked: newLocked });
    },
    [activeCadrage, thesisId, queryClient, saveField]
  );

  // ── Save field value (debounced via explicit save) ──
  const handleFieldValueChange = useCallback((fieldId: string, newValue: string) => {
    setLocalFieldValues((prev) => ({ ...prev, [fieldId]: newValue }));
  }, []);

  const handleSaveFieldValue = useCallback(
    async (fieldId: string) => {
      const val = localFieldValues[fieldId] ?? "";
      await saveField(fieldId, { value: val });
      toast.success("Champ sauvegardé");
    },
    [localFieldValues, saveField]
  );

  // ── Accept AI suggestion for a field ──
  const acceptSuggestion = useCallback(
    async (field: CadrageField) => {
      if (!field.aiSuggestion) return;
      const suggestion = field.aiSuggestion;
      setLocalFieldValues((prev) => ({ ...prev, [field.id]: suggestion }));
      await saveField(field.id, { value: suggestion, aiSuggestion: null });
      toast.success("Suggestion IA acceptée");
    },
    [saveField]
  );

  // ── Dismiss AI suggestion for a field ──
  const dismissSuggestion = useCallback(
    async (field: CadrageField) => {
      await saveField(field.id, { aiSuggestion: null });
    },
    [saveField]
  );

  // ── AI Draft generation ──
  const generateAiDraft = useCallback(async () => {
    if (!selectedThesis || !activeCadrage) return;
    setAiDraftLoading(true);
    try {
      const currentValues = fields
        .map((f) => {
          const v = localFieldValues[f.id] ?? f.value ?? "";
          return `- ${f.label} : ${v || "(non renseigné)"}`;
        })
        .join("\n");

      const prompt = `À partir des informations suivantes sur un projet de thèse, génère un premier jet pour chaque champ du cadrage préliminaire.

Titre de la thèse : ${selectedThesis.title}
Auteur : ${selectedThesis.author || "Non renseigné"}
Discipline : ${selectedThesis.discipline || "Non renseignée"}

VALEURS ACTUELLES :
${currentValues}

IMPORTANT : Réponds UNIQUEMENT au format JSON suivant, sans aucun texte avant ou après :
{
  "thematique": "...",
  "problematique": "...",
  "questions_recherche": "...",
  "objectifs": "...",
  "hypotheses": "...",
  "type_recherche": "...",
  "methodologie": "...",
  "revue_litterature": "...",
  "cadre_theorique": "...",
  "mots_cles": "...",
  "contribution_attendue": "...",
  "type_these": "..."
}

Pour chaque champ, fournis 2-4 phrases académiques en français. Si le champ n'est pas applicable, écris "Non applicable". Ne répète pas les valeurs déjà renseignées si elles sont pertinentes — propose des formulations alternatives ou des compléments.`;

      const res = await fetch("/api/ai-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          withAiConfig({
            mode: "methodology",
            prompt,
          })
        ),
      });

      if (!res.ok) throw new Error("Erreur lors de la génération IA");
      const json = await res.json();
      const content = json.data?.content || "";

      // Parse JSON from the response
      let parsed: Record<string, string> | null = null;
      try {
        // Try to extract JSON from markdown code blocks or raw response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        }
      } catch {
        // If JSON parsing fails, the response is not usable as structured data
      }

      if (!parsed) {
        toast.error(
          "La réponse IA n'a pas pu être structurée. Réessayez."
        );
        return;
      }

      // Update fields with AI suggestions
      let updated = 0;
      for (const field of fields) {
        const suggestion = parsed[field.fieldKey];
        if (suggestion && suggestion !== "Non applicable") {
          await saveField(field.id, { aiSuggestion: suggestion });
          updated++;
        }
      }

      await queryClient.invalidateQueries({ queryKey: ["cadrages", thesisId] });
      toast.success(
        `${updated} suggestion(s) IA générée(s) — validez chaque champ individuellement`
      );
    } catch {
      toast.error("Erreur lors de la génération du premier jet IA");
    } finally {
      setAiDraftLoading(false);
    }
  }, [selectedThesis, activeCadrage, fields, localFieldValues, thesisId, queryClient, withAiConfig, saveField]);

  // ── Coherence check ──
  const runCoherenceCheck = useCallback(async () => {
    if (fields.length === 0) return;
    const filled = fields.filter(
      (f) => (localFieldValues[f.id] ?? f.value ?? "").trim().length > 0
    );
    if (filled.length < 3) {
      toast.error("Remplissez au moins 3 champs avant de vérifier la cohérence");
      return;
    }

    setCoherenceLoading(true);
    setCoherenceResult(null);
    try {
      const entriesText = filled
        .map((f) => `- ${f.label} : ${localFieldValues[f.id] ?? f.value ?? ""}`)
        .join("\n");

      const prompt = `Analysez la cohérence du cadrage préliminaire de thèse suivant. Identifiez les forces, les incohérences, les lacunes et proposez des remarques constructives.

${entriesText}

Analysez spécifiquement :
1. L'alignement entre la problématique et les questions de recherche
2. La cohérence entre les objectifs et la méthodologie envisagée
3. La pertinence du cadre théorique par rapport à la thématique
4. La clarté et la spécificité des hypothèses (si renseignées)
5. L'adéquation entre le type de recherche et la méthodologie
6. La cohérence globale du cadrage

Fournissez une analyse structurée en français. Ne corrigez pas automatiquement — indiquez uniquement les remarques et suggestions.`;

      const res = await fetch("/api/ai-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          withAiConfig({
            mode: "peer-review",
            prompt,
          })
        ),
      });

      if (!res.ok) throw new Error("Erreur lors de la vérification");
      const json = await res.json();
      setCoherenceResult(json.data?.content || "Aucun résultat");
      toast.success("Vérification de cohérence terminée");
    } catch {
      toast.error("Erreur lors de la vérification de cohérence");
    } finally {
      setCoherenceLoading(false);
    }
  }, [fields, localFieldValues, withAiConfig]);

  // ── Validate (coherence + snapshot) ──
  const validateCadrage = useCallback(async () => {
    if (!cadrageId || !thesisId) return;
    setValidating(true);
    try {
      // 1) Run coherence check first
      const filled = fields.filter(
        (f) => (localFieldValues[f.id] ?? f.value ?? "").trim().length > 0
      );
      if (filled.length < 3) {
        toast.error("Remplissez au moins 3 champs pour valider");
        setValidating(false);
        return;
      }

      // 2) Create version snapshot
      const versionRes = await fetch(`/api/cadrages/${cadrageId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: `Version du ${new Date().toLocaleDateString("fr-FR")}` }),
      });
      if (!versionRes.ok) throw new Error("Erreur lors de la création de la version");

      await queryClient.invalidateQueries({ queryKey: ["cadrage-versions", cadrageId] });
      toast.success("Cadrage validé — version sauvegardée");
    } catch {
      toast.error("Erreur lors de la validation du cadrage");
    } finally {
      setValidating(false);
    }
  }, [cadrageId, thesisId, fields, localFieldValues, queryClient]);

  // ═══════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════

  if (thesesLoading) return <LoadingSkeleton />;

  if (!theses || theses.length === 0) {
    return (
      <div className="max-w-5xl mx-auto flex flex-col gap-6 p-6">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">Aucune thèse disponible</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Créez d&apos;abord une thèse dans l&apos;éditeur pour cadrer votre projet.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 p-6">
      {/* ─── Header ─── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Compass className="h-6 w-6 text-primary" />
          Cadrage de la thèse
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Définissez et structurez le cadrage préliminaire de votre projet de recherche.
        </p>
      </div>

      <Separator />

      {/* ─── Thesis Selector ─── */}
      {theses.length > 1 && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium">Thèse :</span>
          {theses.map((t) => (
            <Button
              key={t.id}
              variant={t.id === selectedThesis?.id ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedThesisId(t.id);
                setLocalFieldValues({});
                setCoherenceResult(null);
              }}
            >
              {t.title}
            </Button>
          ))}
        </div>
      )}

      {/* ─── No cadrage state ─── */}
      {cadragesLoading ? (
        <LoadingSkeleton />
      ) : !activeCadrage ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <PlusCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">
                Aucun cadrage pour cette thèse
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Créez un cadrage préliminaire avec les 12 champs standards pour commencer.
              </p>
            </div>
            <Button
              onClick={createCadrage}
              disabled={creatingCadrage}
              className="gap-2 mt-2"
            >
              {creatingCadrage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PlusCircle className="h-4 w-4" />
              )}
              Créer le cadrage
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* ─── Main content with tabs ─── */
        <>
          {/* Progress bar */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  Progression du cadrage
                </span>
                <span className="text-sm text-muted-foreground">
                  {filledCount}/{fields.length} champs remplis
                </span>
              </div>
              <Progress value={completionPct} className="h-3" />
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <Badge variant={completionPct === 100 ? "default" : "secondary"}>
                  {completionPct}%
                </Badge>
                {completionPct === 100 && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Tous les champs sont remplis
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="cadrage" className="flex flex-col gap-6">
            <TabsList className="w-full flex flex-wrap h-auto gap-1 p-1">
              <TabsTrigger
                value="cadrage"
                className="flex items-center gap-2 text-xs sm:text-sm"
              >
                <Compass className="h-4 w-4" />
                Cadrage
              </TabsTrigger>
              <TabsTrigger
                value="verification"
                className="flex items-center gap-2 text-xs sm:text-sm"
              >
                <Brain className="h-4 w-4" />
                Vérification
              </TabsTrigger>
              <TabsTrigger
                value="historique"
                className="flex items-center gap-2 text-xs sm:text-sm"
              >
                <History className="h-4 w-4" />
                Historique
              </TabsTrigger>
            </TabsList>

            {/* ═══════════════════════════════════════
                TAB 1 : Cadrage — Field editing + AI draft
                ═══════════════════════════════════════ */}
            <TabsContent value="cadrage" className="flex flex-col gap-4">
              {/* AI Draft + Validate actions */}
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  onClick={generateAiDraft}
                  disabled={aiDraftLoading}
                  className="gap-2"
                >
                  {aiDraftLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {aiDraftLoading
                    ? "Génération en cours..."
                    : "Générer un premier jet IA"}
                </Button>
                <Button
                  onClick={validateCadrage}
                  disabled={validating || completionPct < 25}
                  className="gap-2"
                >
                  {validating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Valider ce cadrage
                </Button>
                {completionPct < 25 && (
                  <span className="text-xs text-muted-foreground">
                    Remplissez au moins 25% des champs pour valider
                  </span>
                )}
              </div>

              {/* Field cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {fields.map((field) => {
                  const currentValue =
                    localFieldValues[field.id] ?? field.value ?? "";
                  const hasAiSuggestion = !!field.aiSuggestion;
                  const isModified =
                    localFieldValues[field.id] !== undefined &&
                    localFieldValues[field.id] !== (field.value ?? "");
                  const isSaving = savingFieldId === field.id;
                  const isFilled = currentValue.trim().length > 0;

                  return (
                    <Card
                      key={field.id}
                      className={
                        hasAiSuggestion
                          ? "border-amber-300 dark:border-amber-700"
                          : isFilled
                            ? ""
                            : "border-dashed"
                      }
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm font-semibold truncate">
                              {field.label}
                            </span>
                            {isFilled && !hasAiSuggestion && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {hasAiSuggestion && (
                              <Badge
                                variant="outline"
                                className="text-amber-700 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 border-amber-300 dark:border-amber-700 text-[10px]"
                              >
                                Suggestion IA — à valider
                              </Badge>
                            )}
                            {isModified && (
                              <Badge variant="secondary" className="text-[10px]">
                                Non sauvegardé
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-2">
                        {/* AI suggestion display */}
                        {hasAiSuggestion && (
                          <div className="rounded-md border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 p-3">
                            <p className="text-xs text-amber-700 dark:text-amber-400 mb-2 font-medium flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              Proposition IA :
                            </p>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {field.aiSuggestion}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => acceptSuggestion(field)}
                                className="h-7 text-xs gap-1"
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                Accepter
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => dismissSuggestion(field)}
                                className="h-7 text-xs"
                              >
                                Ignorer
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Textarea */}
                        <Textarea
                          value={currentValue}
                          onChange={(e) =>
                            handleFieldValueChange(field.id, e.target.value)
                          }
                          placeholder={`Saisissez le contenu pour « ${field.label} »...`}
                          disabled={field.isLocked}
                          rows={3}
                          className="resize-y text-sm"
                        />

                        {/* Actions row */}
                        <div className="flex items-center justify-between">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleLock(field)}
                            disabled={isSaving}
                            className="h-7 text-xs gap-1"
                          >
                            {field.isLocked ? (
                              <Lock className="h-3 w-3" />
                            ) : (
                              <Unlock className="h-3 w-3" />
                            )}
                            {field.isLocked ? "Verrouillé" : "Verrouiller"}
                          </Button>
                          <Button
                            size="sm"
                            variant={isModified ? "default" : "ghost"}
                            onClick={() => handleSaveFieldValue(field.id)}
                            disabled={isSaving || !isModified}
                            className="h-7 text-xs gap-1"
                          >
                            {isSaving ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Save className="h-3 w-3" />
                            )}
                            Sauvegarder
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* ═══════════════════════════════════════
                TAB 2 : Vérification — Coherence check
                ═══════════════════════════════════════ */}
            <TabsContent value="verification" className="flex flex-col gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Vérification de cohérence
                  </CardTitle>
                  <CardDescription>
                    L&apos;IA analyse la cohérence entre vos différents champs de cadrage
                    et formule des remarques constructives.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={runCoherenceCheck}
                      disabled={coherenceLoading || filledCount < 3}
                      className="gap-2"
                    >
                      {coherenceLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="h-4 w-4" />
                      )}
                      {coherenceLoading
                        ? "Analyse en cours..."
                        : "Lancer la vérification de cohérence"}
                    </Button>
                    {filledCount < 3 && (
                      <span className="text-xs text-muted-foreground">
                        Minimum 3 champs remplis requis
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {coherenceResult && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Résultats de la vérification
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">
                      {coherenceResult}
                    </div>
                  </CardContent>
                </Card>
              )}

              {!coherenceResult && !coherenceLoading && (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
                    <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground text-center">
                      Lancez la vérification pour obtenir une analyse de cohérence
                      de votre cadrage.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* ═══════════════════════════════════════
                TAB 3 : Historique — Version history
                ═══════════════════════════════════════ */}
            <TabsContent value="historique" className="flex flex-col gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    Historique des versions
                  </CardTitle>
                  <CardDescription>
                    Chaque validation crée un instantané de tous les champs du cadrage.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {versionsLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Chargement...
                    </div>
                  ) : !versions || versions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-3">
                      <RefreshCcw className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground text-center">
                        Aucune version sauvegardée. Validez votre cadrage pour créer
                        une première version.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
                      {versions.map((version) => {
                        let parsedSnapshot: Array<{
                          fieldKey: string;
                          label: string;
                          value: string | null;
                        }> = [];
                        try {
                          parsedSnapshot = JSON.parse(version.snapshot);
                        } catch {
                          // ignore
                        }

                        const isExpanded = expandedVersion === version.id;

                        return (
                          <Collapsible
                            key={version.id}
                            open={isExpanded}
                            onOpenChange={(open) =>
                              setExpandedVersion(open ? version.id : null)
                            }
                          >
                            <Card className={isExpanded ? "" : "hover:bg-muted/30"}>
                              <CollapsibleTrigger asChild>
                                <CardHeader className="cursor-pointer py-3">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <FileText className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm font-medium">
                                        {version.label ||
                                          `Version ${versions.length - versions.indexOf(version)}`}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(version.createdAt).toLocaleDateString(
                                          "fr-FR",
                                          {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          }
                                        )}
                                      </span>
                                      {isExpanded ? (
                                        <ChevronUp className="h-4 w-4" />
                                      ) : (
                                        <ChevronDown className="h-4 w-4" />
                                      )}
                                    </div>
                                  </div>
                                </CardHeader>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <CardContent className="pt-0 pb-4">
                                  <Separator className="mb-3" />
                                  {parsedSnapshot.length > 0 ? (
                                    <div className="flex flex-col gap-2">
                                      {parsedSnapshot.map(
                                        (sf: {
                                          fieldKey: string;
                                          label: string;
                                          value: string | null;
                                        }) => (
                                          <div
                                            key={sf.fieldKey}
                                            className="flex flex-col gap-0.5"
                                          >
                                            <span className="text-xs font-medium text-muted-foreground">
                                              {sf.label}
                                            </span>
                                            <span className="text-sm">
                                              {sf.value || (
                                                <span className="italic text-muted-foreground">
                                                  Non renseigné
                                                </span>
                                              )}
                                            </span>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-muted-foreground">
                                      Instantané non analysable.
                                    </p>
                                  )}
                                </CardContent>
                              </CollapsibleContent>
                            </Card>
                          </Collapsible>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
