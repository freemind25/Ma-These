"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Crosshair, AlertTriangle } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/lib/stores/app-store";
import {
  CADRAGE_FIELDS_MAP,
  TYPE_RECHERCHE_LABELS,
  TYPE_REVUE_LABELS,
  TYPE_THESE_LABELS,
  METHODES_COLLECTE_LABELS,
} from "@/data/cadrage-fields";
import type { CadrageRow } from "./hooks/use-cadrage";

// ═══════════════════════════════════════
// Field groups (same as edition-step)
// ═══════════════════════════════════════

const FIELD_GROUPS = [
  {
    title: "Thématique & Problématique",
    keys: ["thematique_generale", "problematique"],
  },
  {
    title: "Questions & Objectifs",
    keys: ["questions_recherche", "objectifs"],
  },
  {
    title: "Hypothèses & Type de recherche",
    keys: ["hypotheses", "type_recherche"],
  },
  {
    title: "Méthodologie",
    keys: ["methodologie"],
  },
  {
    title: "Revue de littérature & Cadre théorique",
    keys: ["type_revue_litterature", "cadre_theorique"],
  },
  {
    title: "Mots-clés, Contribution & Type de thèse",
    keys: ["mots_cles", "contribution_originalite", "type_these"],
  },
];

// ═══════════════════════════════════════
// JSON helpers
// ═══════════════════════════════════════

function safeParseJson<T>(str: string | null | undefined): T | null {
  if (!str) return null;
  try {
    return JSON.parse(str) as T;
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════
// Read-only field renderers
// ═══════════════════════════════════════

function SelectValueDisplay({
  fieldKey,
  value,
}: {
  fieldKey: string;
  value: string;
}) {
  const labelMap: Record<string, Record<string, string>> = {
    type_recherche: TYPE_RECHERCHE_LABELS,
    type_revue_litterature: TYPE_REVUE_LABELS,
    type_these: TYPE_THESE_LABELS,
  };
  const labels = labelMap[fieldKey];
  const display = labels?.[value] ?? value;
  return <span className="text-sm">{display}</span>;
}

function QuestionsRechercheDisplay({ value }: { value: string }) {
  const parsed = safeParseJson<{
    principal: string;
    secondaires: string[];
  }>(value);
  if (!parsed) return <span className="text-sm text-muted-foreground italic">Non renseigné</span>;
  return (
    <div className="flex flex-col gap-1.5">
      <div>
        <span className="text-xs font-medium text-muted-foreground">
          Question principale
        </span>
        <p className="text-sm mt-0.5">{parsed.principal || <em className="text-muted-foreground">Non renseigné</em>}</p>
      </div>
      {parsed.secondaires?.length > 0 && (
        <div>
          <span className="text-xs font-medium text-muted-foreground">
            Questions secondaires
          </span>
          <ul className="text-sm mt-0.5 list-disc list-inside space-y-0.5">
            {parsed.secondaires.map((s, i) => (
              <li key={i}>{s || <em className="text-muted-foreground">Non renseigné</em>}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ObjectifsDisplay({ value }: { value: string }) {
  const parsed = safeParseJson<{
    general: string;
    specifiques: string[];
  }>(value);
  if (!parsed) return <span className="text-sm text-muted-foreground italic">Non renseigné</span>;
  return (
    <div className="flex flex-col gap-1.5">
      <div>
        <span className="text-xs font-medium text-muted-foreground">
          Objectif général
        </span>
        <p className="text-sm mt-0.5">{parsed.general || <em className="text-muted-foreground">Non renseigné</em>}</p>
      </div>
      {parsed.specifiques?.length > 0 && (
        <div>
          <span className="text-xs font-medium text-muted-foreground">
            Objectifs spécifiques
          </span>
          <ul className="text-sm mt-0.5 list-disc list-inside space-y-0.5">
            {parsed.specifiques.map((s, i) => (
              <li key={i}>{s || <em className="text-muted-foreground">Non renseigné</em>}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function HypothesesDisplay({ value }: { value: string }) {
  const parsed = safeParseJson<string[]>(value);
  if (!parsed?.length) return <span className="text-sm text-muted-foreground italic">Non renseigné</span>;
  return (
    <ul className="text-sm list-disc list-inside space-y-0.5">
      {parsed.map((h, i) => (
        <li key={i}>{h}</li>
      ))}
    </ul>
  );
}

function MethodologieDisplay({ value }: { value: string }) {
  const parsed = safeParseJson<{
    methodes_collecte?: string[];
    unite_analyse?: string;
    justification_unite_analyse?: string;
    terrain_corpus?: string;
    limites_anticipees?: string;
  }>(value);
  if (!parsed) return <span className="text-sm text-muted-foreground italic">Non renseigné</span>;

  const sections: { label: string; content: string | undefined }[] = [
    { label: "Méthodes de collecte", content: parsed.methodes_collecte?.map((m) => METHODES_COLLECTE_LABELS[m] ?? m).join(", ") },
    { label: "Unité d'analyse", content: parsed.unite_analyse },
    { label: "Justification", content: parsed.justification_unite_analyse },
    { label: "Terrain / Corpus", content: parsed.terrain_corpus },
    { label: "Limites anticipées", content: parsed.limites_anticipees },
  ];

  return (
    <div className="flex flex-col gap-1.5">
      {sections.map((s) =>
        s.content ? (
          <div key={s.label}>
            <span className="text-xs font-medium text-muted-foreground">
              {s.label}
            </span>
            <p className="text-sm mt-0.5">{s.content}</p>
          </div>
        ) : null
      )}
    </div>
  );
}

function MotsClesDisplay({ value }: { value: string }) {
  const parsed = safeParseJson<{
    disciplinaires?: string[];
    specifiques_projet?: string[];
  }>(value);
  if (!parsed) return <span className="text-sm text-muted-foreground italic">Non renseigné</span>;

  return (
    <div className="flex flex-col gap-1.5">
      {parsed.disciplinaires?.length ? (
        <div>
          <span className="text-xs font-medium text-muted-foreground">
            Disciplinaires
          </span>
          <div className="flex flex-wrap gap-1 mt-0.5">
            {parsed.disciplinaires.map((k, i) => (
              <span
                key={i}
                className="inline-block text-xs bg-muted px-1.5 py-0.5 rounded"
              >
                {k}
              </span>
            ))}
          </div>
        </div>
      ) : null}
      {parsed.specifiques_projet?.length ? (
        <div>
          <span className="text-xs font-medium text-muted-foreground">
            Spécifiques au projet
          </span>
          <div className="flex flex-wrap gap-1 mt-0.5">
            {parsed.specifiques_projet.map((k, i) => (
              <span
                key={i}
                className="inline-block text-xs bg-muted px-1.5 py-0.5 rounded"
              >
                {k}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ═══════════════════════════════════════
// Single field renderer
// ═══════════════════════════════════════

function ReadOnlyField({
  fieldKey,
  value,
}: {
  fieldKey: string;
  value: string;
}) {
  const fieldDef = CADRAGE_FIELDS_MAP[fieldKey];
  const label = fieldDef?.label ?? fieldKey;

  const isEmpty = !value || value.trim() === "" || value === "[]" || value === "{}";

  if (isEmpty) return null;

  return (
    <div className="flex flex-col gap-0.5 py-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="mt-0.5">
        {fieldDef?.type === "select" ? (
          <SelectValueDisplay fieldKey={fieldKey} value={value} />
        ) : fieldDef?.type === "json" && fieldKey === "questions_recherche" ? (
          <QuestionsRechercheDisplay value={value} />
        ) : fieldDef?.type === "json" && fieldKey === "objectifs" ? (
          <ObjectifsDisplay value={value} />
        ) : fieldDef?.type === "json" && fieldKey === "hypotheses" ? (
          <HypothesesDisplay value={value} />
        ) : fieldDef?.type === "json" && fieldKey === "methodologie" ? (
          <MethodologieDisplay value={value} />
        ) : fieldDef?.type === "json" && fieldKey === "mots_cles" ? (
          <MotsClesDisplay value={value} />
        ) : (
          <p className="text-sm whitespace-pre-wrap">{value}</p>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// Content for the Sheet
// ═══════════════════════════════════════

function CadrageSidebarContent({ cadrage }: { cadrage: CadrageRow }) {
  const isProvisoire = cadrage.statut !== "valide";

  // Build a map from fieldKey -> value for quick lookup
  const fieldValues = useMemo(() => {
    const map: Record<string, string> = {};
    for (const f of cadrage.fields) {
      map[f.fieldKey] = f.value ?? "";
    }
    return map;
  }, [cadrage.fields]);

  return (
    <div className="flex flex-col h-full">
      <SheetHeader>
        <SheetTitle className="text-base">Cadrage préalable</SheetTitle>
        <SheetDescription>
          Résumé en lecture seule · v{cadrage.versionNumber}
        </SheetDescription>
      </SheetHeader>

      {/* Provisoire banner */}
      {isProvisoire && (
        <div className="mx-4 flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Cadrage non validé
        </div>
      )}

      <ScrollArea className="flex-1 overflow-hidden">
        <div className="flex flex-col gap-4 px-4 pb-6 pt-2">
          {FIELD_GROUPS.map((group) => {
            const groupFieldKeys = group.keys;
            // Check if any field in this group has a value
            const hasValues = groupFieldKeys.some(
              (k) =>
                fieldValues[k] &&
                fieldValues[k].trim() !== "" &&
                fieldValues[k] !== "[]" &&
                fieldValues[k] !== "{}"
            );
            if (!hasValues) return null;

            return (
              <div key={group.title}>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {group.title}
                </h4>
                <div className="flex flex-col gap-0">
                  {groupFieldKeys.map((key) => {
                    const val = fieldValues[key];
                    if (!val || val.trim() === "" || val === "[]" || val === "{}")
                      return null;
                    return (
                      <ReadOnlyField key={key} fieldKey={key} value={val} />
                    );
                  })}
                </div>
                <Separator className="mt-3" />
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

// ═══════════════════════════════════════
// Main export
// ═══════════════════════════════════════

export function CadrageSidebar() {
  const activeThesisId = useAppStore((s) => s.activeThesisId);

  const { data, isLoading } = useQuery<{
    data: CadrageRow[];
  }>({
    queryKey: ["cadrage", "list", activeThesisId ?? "__none__"],
    queryFn: async () => {
      const res = await fetch(`/api/thesis/${activeThesisId}/cadrages`);
      if (!res.ok) throw new Error("Erreur de chargement");
      return res.json();
    },
    enabled: !!activeThesisId,
    staleTime: 30_000,
  });

  const activeCadrage = useMemo(() => {
    if (!data?.data) return null;
    return data.data.find((c) => c.isActive) ?? data.data[0] ?? null;
  }, [data]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Voir le cadrage"
        >
          <Crosshair className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="sm:max-w-md w-3/4">
        {!activeThesisId ? (
          <div className="flex flex-col h-full">
            <SheetHeader>
              <SheetTitle className="text-base">Cadrage préalable</SheetTitle>
            </SheetHeader>
            <div className="flex-1 flex items-center justify-center p-6">
              <p className="text-sm text-muted-foreground text-center">
                Aucune thèse sélectionnée.
              </p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col h-full">
            <SheetHeader>
              <SheetTitle className="text-base">Cadrage préalable</SheetTitle>
              <SheetDescription>Chargement…</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-3 px-4 pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Separator />
                </div>
              ))}
            </div>
          </div>
        ) : !activeCadrage ? (
          <div className="flex flex-col h-full">
            <SheetHeader>
              <SheetTitle className="text-base">Cadrage préalable</SheetTitle>
            </SheetHeader>
            <div className="flex-1 flex items-center justify-center p-6">
              <p className="text-sm text-muted-foreground text-center">
                Aucun cadrage défini. Allez au module Cadrage pour en créer un.
              </p>
            </div>
          </div>
        ) : (
          <CadrageSidebarContent cadrage={activeCadrage} />
        )}
      </SheetContent>
    </Sheet>
  );
}
