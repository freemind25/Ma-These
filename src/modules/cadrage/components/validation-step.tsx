"use client";

import { useMemo } from "react";
import { CheckCircle2, ArrowLeft, Loader2, History, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  CADRAGE_USER_FIELDS,
  CADRAGE_FIELDS_MAP,
  TYPE_RECHERCHE_LABELS,
  TYPE_REVUE_LABELS,
  TYPE_THESE_LABELS,
  METHODES_COLLECTE_LABELS,
} from "@/data/cadrage-fields";
import type { CadrageFieldRow, CadrageVersionRow } from "../hooks/use-cadrage";

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

interface ValidationStepProps {
  fields: CadrageFieldRow[];
  versions: CadrageVersionRow[];
  cadrageId: string | null;
  onBack: () => void;
  onValidate: () => void;
  isValidating: boolean;
}

// ═══════════════════════════════════════
// Display value helpers
// ═══════════════════════════════════════

function displayValue(fieldKey: string, value: string | null): string {
  if (!value) return "—";

  // For JSON fields, try to display a readable version
  if (["questions_recherche", "objectifs", "hypotheses", "methodologie", "mots_cles"].includes(fieldKey)) {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === "object" && parsed !== null) {
        return formatObject(parsed, fieldKey);
      }
    } catch {
      // Not valid JSON, display as-is
    }
  }

  // For select fields, translate the value
  const labelMap: Record<string, Record<string, string>> = {
    type_recherche: TYPE_RECHERCHE_LABELS,
    type_revue_litterature: TYPE_REVUE_LABELS,
    type_these: TYPE_THESE_LABELS,
  };
  if (labelMap[fieldKey]?.[value]) {
    return labelMap[fieldKey][value];
  }

  return value;
}

function formatObject(obj: unknown, fieldKey: string): string {
  if (Array.isArray(obj)) {
    return obj.map((item) => `• ${String(item)}`).join("\n");
  }

  if (typeof obj === "object" && obj !== null) {
    const lines: string[] = [];
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      const label = getFieldSubLabel(fieldKey, k);
      if (Array.isArray(v)) {
        if (k === "methodes_collecte") {
          const labels = v.map((m) => METHODES_COLLECTE_LABELS[String(m)] ?? String(m));
          lines.push(`${label}: ${labels.join(", ")}`);
        } else {
          lines.push(`${label} :`);
          v.forEach((item) => lines.push(`  • ${String(item)}`));
        }
      } else {
        lines.push(`${label} : ${String(v)}`);
      }
    }
    return lines.join("\n");
  }

  return String(obj);
}

function getFieldSubLabel(_fieldKey: string, subKey: string): string {
  const subLabels: Record<string, string> = {
    principal: "Question principale",
    secondaires: "Questions secondaires",
    general: "Objectif général",
    specifiques: "Objectifs spécifiques",
    methodes_collecte: "Méthodes de collecte",
    unite_analyse: "Unité d'analyse",
    justification_unite_analyse: "Justification",
    terrain_corpus: "Terrain / Corpus",
    limites_anticipees: "Limites anticipées",
    disciplinaires: "Mots-clés disciplinaires",
    specifiques_projet: "Mots-clés spécifiques",
  };
  return subLabels[subKey] ?? subKey;
}

// ═══════════════════════════════════════
// Component
// ═══════════════════════════════════════

export function ValidationStep({
  fields,
  versions,
  cadrageId,
  onBack,
  onValidate,
  isValidating,
}: ValidationStepProps) {
  const filledCount = fields.filter((f) => f.value && f.value.trim().length > 0).length;
  const requiredFilled = fields.filter((f) => {
    const def = CADRAGE_FIELDS_MAP[f.fieldKey];
    return def?.required && f.value && f.value.trim().length > 0;
  }).length;
  const totalRequired = CADRAGE_USER_FIELDS.filter((f) => f.required).length;

  const sortedFields = useMemo(
    () => [...fields].sort((a, b) => a.sortOrder - b.sortOrder),
    [fields]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Résumé du cadrage</h3>
          <p className="text-sm text-muted-foreground">
            {filledCount}/{fields.length} champs remplis — {requiredFilled}/{totalRequired} champs obligatoires
          </p>
        </div>
        {requiredFilled === totalRequired ? (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900 dark:text-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            Tous les champs requis
          </Badge>
        ) : (
          <Badge variant="outline" className="text-amber-700 border-amber-300 dark:text-amber-400">
            {totalRequired - requiredFilled} champ(s) requis manquant(s)
          </Badge>
        )}
      </div>

      <ScrollArea className="h-[50vh]">
        <div className="flex flex-col gap-3 pr-4">
          {sortedFields.map((field) => {
            const def = CADRAGE_FIELDS_MAP[field.fieldKey];
            if (!def) return null;

            return (
              <Card key={field.id}>
                <CardHeader className="pb-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-medium">{def.label}</CardTitle>
                    {def.required && (
                      <span className="text-destructive text-xs">*</span>
                    )}
                    {field.value && field.value.trim().length > 0 ? (
                      <Badge variant="outline" className="text-xs ml-auto">Rempli</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs ml-auto text-muted-foreground">Vide</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">
                    {displayValue(field.fieldKey, field.value)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      {/* Version history */}
      {versions.length > 0 && (
        <>
          <Separator />
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Historique des versions</h3>
            </div>
            <div className="flex flex-col gap-2">
              {versions.map((v) => {
                const date = new Date(v.createdAt);
                const dateStr = date.toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <div
                    key={v.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {v.label ?? "Version sans titre"}
                      </p>
                      <p className="text-xs text-muted-foreground">{dateStr}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      <Separator />

      <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Revenir à l&apos;édition
        </Button>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            disabled={!cadrageId}
            onClick={() => {
              window.open(`/api/cadrage/export?cadrageId=${cadrageId}`, "_blank");
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter en texte
          </Button>
          <Button onClick={onValidate} disabled={isValidating}>
            {isValidating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            Valider ce cadrage
          </Button>
        </div>
      </div>
    </div>
  );
}
