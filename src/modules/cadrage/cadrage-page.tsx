"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Crosshair, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/lib/stores/app-store";
import {
  useCadrage,
  useCreateCadrage,
  useSaveFields,
  useCreateVersion,
  useValidateCadrage,
  useVersions,

} from "./hooks/use-cadrage";
import { PitchStep } from "./components/pitch-step";
import { AiGenerationStep } from "./components/ai-generation-step";
import { EditionStep } from "./components/edition-step";
import { ConsistencyStep } from "./components/consistency-step";
import { ValidationStep } from "./components/validation-step";

// ═══════════════════════════════════════
// Step definitions
// ═══════════════════════════════════════

const STEPS = [
  { number: 1, label: "Pitch" },
  { number: 2, label: "Suggestions IA" },
  { number: 3, label: "Édition" },
  { number: 4, label: "Cohérence" },
  { number: 5, label: "Validation" },
] as const;

// ═══════════════════════════════════════
// Step Progress Indicator
// ═══════════════════════════════════════

function StepProgress({ currentStep }: { currentStep: number }) {
  return (
    <div className="w-full flex items-center justify-center gap-0 py-2">
      {STEPS.map((step, idx) => {
        const isActive = idx === currentStep;
        const isCompleted = idx < currentStep;
        const isSkipped =
          idx === 1 && currentStep >= 2; // AI step can be skipped

        return (
          <div key={step.number} className="flex items-center">
            {/* Circle */}
            <div
              className={`
                flex items-center justify-center rounded-full h-8 w-8 text-xs font-semibold transition-colors
                ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isCompleted || isSkipped
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                      : "bg-muted text-muted-foreground"
                }
              `}
            >
              {isCompleted || isSkipped ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                step.number
              )}
            </div>
            {/* Label */}
            <span
              className={`
                hidden sm:inline-block text-xs ml-2 mr-1
                ${
                  isActive
                    ? "text-foreground font-medium"
                    : isCompleted || isSkipped
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-muted-foreground"
                }
              `}
            >
              {step.label}
            </span>
            {/* Connector line */}
            {idx < STEPS.length - 1 && (
              <div
                className={`
                  h-0.5 w-8 sm:w-12 mx-2 rounded-full transition-colors
                  ${
                    idx < currentStep
                      ? "bg-emerald-300 dark:bg-emerald-700"
                      : "bg-muted"
                  }
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════
// Loading skeleton
// ═══════════════════════════════════════

function CadrageLoadingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Chargement du cadrage…</p>
    </div>
  );
}

// ═══════════════════════════════════════
// Main Component
// ═══════════════════════════════════════

export function CadragePage() {
  const thesisId = useAppStore((s) => s.activeThesisId);
  const [currentStep, setCurrentStep] = useState(0);
  const [aiGeneratedFields, setAiGeneratedFields] = useState<Record<string, string> | null>(null);

  // ── Queries ────────────────────────────────

  const { data: cadragesData, isLoading: cadragesLoading } = useCadrage(thesisId);
  const cadrages = cadragesData?.data ?? [];
  const activeCadrage = cadrages.find((c) => c.isActive) ?? cadrages[0] ?? null;
  const cadrageId = activeCadrage?.id ?? null;
  const fields = useMemo(
    () => activeCadrage?.fields ?? [],
    [activeCadrage?.fields]
  );

  const { data: versionsData } = useVersions(cadrageId);
  const versions = versionsData?.data ?? [];

  // ── Mutations ──────────────────────────────

  const createCadrage = useCreateCadrage(thesisId);
  const saveFieldsMutation = useSaveFields(cadrageId);
  const createVersionMutation = useCreateVersion(cadrageId);
  const validateMutation = useValidateCadrage(cadrageId);

  // ── Auto-create cadrage if needed ──────────

  useEffect(() => {
    if (thesisId && !cadragesLoading && cadrages.length === 0 && !createCadrage.isPending) {
      createCadrage.mutate("Cadrage préalable");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thesisId, cadragesLoading, cadrages.length, createCadrage.isPending]);

  // ── Build allValues map ────────────────────

  const allValues = useMemo(() => {
    const map: Record<string, string> = {};
    for (const f of fields) {
      if (f.value) map[f.fieldKey] = f.value;
    }
    return map;
  }, [fields]);

  // ── Local pending changes (before save) ────
  const [pendingValues, setPendingValues] = useState<Record<string, string>>({});

  const effectiveValues = useMemo(() => {
    return { ...allValues, ...pendingValues };
  }, [allValues, pendingValues]);

  // ── Effective fields for sub-components ─────
  const effectiveFields = useMemo(() => {
    return fields.map((f) => ({
      ...f,
      value: pendingValues[f.fieldKey] ?? f.value,
    }));
  }, [fields, pendingValues]);

  // ── Handlers ────────────────────────────────

  const handleFieldChange = useCallback(
    (fieldId: string, value: string) => {
      // Find the fieldKey from fields
      const field = fields.find((f) => f.id === fieldId);
      if (field) {
        setPendingValues((prev) => ({ ...prev, [field.fieldKey]: value }));
      }
    },
    [fields]
  );

  const handleSave = useCallback(async () => {
    // Find which fields have changed
    const toSave: { fieldId: string; value: string }[] = [];
    for (const key of Object.keys(pendingValues)) {
      const field = fields.find((f) => f.fieldKey === key);
      if (field) {
        toSave.push({ fieldId: field.id, value: pendingValues[key] });
      }
    }
    if (toSave.length > 0) {
      await saveFieldsMutation.mutateAsync(toSave);
      setPendingValues({});
    }
  }, [pendingValues, fields, saveFieldsMutation]);

  const handleAcceptAiFields = useCallback(
    async (acceptedFields: Record<string, string>) => {
      setPendingValues(acceptedFields);
      setCurrentStep(2);
    },
    []
  );

  const handleSkipToEdition = useCallback(() => {
    setAiGeneratedFields(null);
    setCurrentStep(2);
  }, []);

  const handleProceedToConsistency = useCallback(async () => {
    // Save pending changes first
    await handleSave();
    setCurrentStep(3);
  }, [handleSave]);

  const handleBackToEdition = useCallback(() => {
    setCurrentStep(2);
  }, []);

  const handleProceedToValidation = useCallback(() => {
    setCurrentStep(4);
  }, []);

  const handleValidate = useCallback(async () => {
    // Save any pending, create version, then validate
    if (Object.keys(pendingValues).length > 0) {
      await handleSave();
    }
    if (cadrageId) {
      await createVersionMutation.mutateAsync("Validation");
      await validateMutation.mutateAsync();
      setPendingValues({});
    }
  }, [cadrageId, pendingValues, handleSave, createVersionMutation, validateMutation]);

  // ── No thesis selected ─────────────────────

  if (!thesisId) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col gap-6 p-6">
        <div className="flex items-center gap-3">
          <Crosshair className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Cadrage préalable</h1>
        </div>
        <Card className="border-dashed">
          <CardContent className="pt-6 flex flex-col items-center gap-4 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <div>
              <h2 className="font-semibold">Aucune thèse sélectionnée</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Sélectionnez ou créez une thèse dans l&apos;éditeur pour commencer votre cadrage.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Loading ────────────────────────────────

  if (cadragesLoading || (cadrages.length === 0 && createCadrage.isPending)) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col gap-6 p-6">
        <div className="flex items-center gap-3">
          <Crosshair className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Cadrage préalable</h1>
        </div>
        <CadrageLoadingSkeleton />
      </div>
    );
  }

  // ── Already validated ─────────────────────

  if (activeCadrage?.statut === "valide" && currentStep !== 4) {
    setCurrentStep(4);
  }

  // ── Render ─────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Crosshair className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Cadrage préalable</h1>
        </div>
        {activeCadrage && (
          <Badge variant="outline">
            {activeCadrage.statut === "valide"
              ? "Validé"
              : activeCadrage.statut === "revisé"
                ? "Révisé"
                : "Brouillon"}
          </Badge>
        )}
      </div>

      {/* Step progress */}
      <StepProgress currentStep={currentStep} />
      <Progress
        value={((currentStep + 1) / STEPS.length) * 100}
        className="h-1"
      />

      {/* Step content */}
      {currentStep === 0 && (
        <PitchStep
          onNext={(generated) => {
            if (generated) {
              setAiGeneratedFields(generated);
              setCurrentStep(1);
            }
          }}
          onSkip={handleSkipToEdition}
        />
      )}

      {currentStep === 1 && aiGeneratedFields && (
        <AiGenerationStep
          generatedFields={aiGeneratedFields}
          onAcceptAll={handleAcceptAiFields}
          _onProceed={() => setCurrentStep(2)}
        />
      )}

      {currentStep === 2 && (
        <EditionStep
          fields={effectiveFields}
          allValues={effectiveValues}
          onFieldChange={handleFieldChange}
          onSave={handleSave}
          onProceed={handleProceedToConsistency}
          isSaving={saveFieldsMutation.isPending}
        />
      )}

      {currentStep === 3 && (
        <ConsistencyStep
          allValues={effectiveValues}
          onBack={handleBackToEdition}
          onProceed={handleProceedToValidation}
        />
      )}

      {currentStep === 4 && (
        <ValidationStep
          fields={fields}
          versions={versions}
          cadrageId={cadrageId}
          onBack={handleBackToEdition}
          onValidate={handleValidate}
          isValidating={validateMutation.isPending || createVersionMutation.isPending}
        />
      )}
    </div>
  );
}
