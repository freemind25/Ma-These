"use client";

import { useCallback, useMemo } from "react";
import {
  Sparkles,
  Loader2,
  Plus,
  Trash2,
  ArrowRight,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CADRAGE_FIELDS_MAP,
  TYPE_RECHERCHE_LABELS,
  TYPE_REVUE_LABELS,
  TYPE_THESE_LABELS,
  METHODES_COLLECTE_LABELS,
} from "@/data/cadrage-fields";
import type { CadrageField } from "@/data/cadrage-fields";
import { useReformulateField } from "../hooks/use-cadrage-ai";

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

interface FieldRow {
  id: string;
  fieldKey: string;
  value: string | null;
}

interface EditionStepProps {
  fields: FieldRow[];
  allValues: Record<string, string>;
  onFieldChange: (fieldId: string, value: string) => void;
  onSave: () => void;
  onProceed: () => void;
  isSaving: boolean;
}

// ═══════════════════════════════════════
// Section groupings
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
// Sub-components for JSON fields
// ═══════════════════════════════════════

function QuestionsRechercheEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const parsed = safeParseJson<{ principal: string; secondaires: string[] }>(value);
  const principal = parsed?.principal ?? "";
  const secondaires = parsed?.secondaires ?? [];

  const setPrincipal = (v: string) => {
    onChange(JSON.stringify({ principal: v, secondaires }));
  };

  const addSecondaire = () => {
    onChange(JSON.stringify({ principal, secondaires: [...secondaires, ""] }));
  };

  const removeSecondaire = (idx: number) => {
    const next = secondaires.filter((_, i) => i !== idx);
    onChange(JSON.stringify({ principal, secondaires: next }));
  };

  const setSecondaire = (idx: number, v: string) => {
    const next = [...secondaires];
    next[idx] = v;
    onChange(JSON.stringify({ principal, secondaires: next }));
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <Label className="text-xs font-medium text-muted-foreground">Question principale</Label>
        <Textarea
          value={principal}
          onChange={(e) => setPrincipal(e.target.value)}
          placeholder="Formulez la question principale de votre recherche…"
          className="mt-1 min-h-[60px] resize-y"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-xs font-medium text-muted-foreground">
          Questions secondaires ({secondaires.length})
        </Label>
        {secondaires.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <Textarea
              value={s}
              onChange={(e) => setSecondaire(i, e.target.value)}
              placeholder={`Question secondaire ${i + 1}…`}
              className="min-h-[50px] resize-y flex-1"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeSecondaire(i)}
              className="shrink-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={addSecondaire}
          className="w-fit"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Ajouter une question secondaire
        </Button>
      </div>
    </div>
  );
}

function ObjectifsEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const parsed = safeParseJson<{ general: string; specifiques: string[] }>(value);
  const general = parsed?.general ?? "";
  const specifiques = parsed?.specifiques ?? [];

  const setGeneral = (v: string) => {
    onChange(JSON.stringify({ general: v, specifiques }));
  };

  const addSpecifique = () => {
    onChange(JSON.stringify({ general, specifiques: [...specifiques, ""] }));
  };

  const removeSpecifique = (idx: number) => {
    const next = specifiques.filter((_, i) => i !== idx);
    onChange(JSON.stringify({ general, specifiques: next }));
  };

  const setSpecifique = (idx: number, v: string) => {
    const next = [...specifiques];
    next[idx] = v;
    onChange(JSON.stringify({ general, specifiques: next }));
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <Label className="text-xs font-medium text-muted-foreground">Objectif général</Label>
        <Textarea
          value={general}
          onChange={(e) => setGeneral(e.target.value)}
          placeholder="Formulez l'objectif général de la thèse…"
          className="mt-1 min-h-[60px] resize-y"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-xs font-medium text-muted-foreground">
          Objectifs spécifiques ({specifiques.length})
        </Label>
        {specifiques.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <Textarea
              value={s}
              onChange={(e) => setSpecifique(i, e.target.value)}
              placeholder={`Objectif spécifique ${i + 1}…`}
              className="min-h-[50px] resize-y flex-1"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeSpecifique(i)}
              className="shrink-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={addSpecifique}
          className="w-fit"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Ajouter un objectif spécifique
        </Button>
      </div>
    </div>
  );
}

function MethodologieEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const parsed = safeParseJson<{
    methodes_collecte?: string[];
    unite_analyse?: string;
    justification_unite_analyse?: string;
    terrain_corpus?: string;
    limites_anticipees?: string;
  }>(value);

  const data = {
    methodes_collecte: parsed?.methodes_collecte ?? [],
    unite_analyse: parsed?.unite_analyse ?? "",
    justification_unite_analyse: parsed?.justification_unite_analyse ?? "",
    terrain_corpus: parsed?.terrain_corpus ?? "",
    limites_anticipees: parsed?.limites_anticipees ?? "",
  };

  const update = (partial: Record<string, unknown>) => {
    const next = { ...data, ...partial };
    onChange(JSON.stringify(next));
  };

  const toggleMethode = (methode: string) => {
    const current = data.methodes_collecte;
    const next = current.includes(methode)
      ? current.filter((m) => m !== methode)
      : [...current, methode];
    update({ methodes_collecte: next });
  };

  const methodeEntries = Object.entries(METHODES_COLLECTE_LABELS);

  return (
    <div className="flex flex-col gap-4">
      {/* Méthodes de collecte */}
      <div>
        <Label className="text-xs font-medium text-muted-foreground">
          Méthodes de collecte
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
          {methodeEntries.map(([key, label]) => (
            <div
              key={key}
              className="flex items-center gap-2 rounded-md border p-2 cursor-pointer hover:bg-muted/50"
              onClick={() => toggleMethode(key)}
            >
              <Checkbox
                checked={data.methodes_collecte.includes(key)}
                onCheckedChange={() => toggleMethode(key)}
              />
              <Label className="text-xs cursor-pointer flex-1">{label}</Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Unité d'analyse */}
      <div>
        <Label className="text-xs font-medium text-muted-foreground">Unité d'analyse</Label>
        <Textarea
          value={data.unite_analyse}
          onChange={(e) => update({ unite_analyse: e.target.value })}
          placeholder="Ex. : Les plans d'occupation et d'utilisation des sols (POS/PLU)…"
          className="mt-1 min-h-[60px] resize-y"
        />
      </div>

      {/* Justification unité d'analyse */}
      <div>
        <Label className="text-xs font-medium text-muted-foreground">
          Justification de l'unité d'analyse
        </Label>
        <Textarea
          value={data.justification_unite_analyse}
          onChange={(e) => update({ justification_unite_analyse: e.target.value })}
          placeholder="Pourquoi cette unité d'analyse est-elle pertinente ?"
          className="mt-1 min-h-[60px] resize-y"
        />
      </div>

      {/* Terrain/corpus */}
      <div>
        <Label className="text-xs font-medium text-muted-foreground">Terrain ou corpus</Label>
        <Textarea
          value={data.terrain_corpus}
          onChange={(e) => update({ terrain_corpus: e.target.value })}
          placeholder="Ex. : Corpus de 15 PLU de villes de 20 000 à 50 000 habitants…"
          className="mt-1 min-h-[60px] resize-y"
        />
      </div>

      {/* Limites anticipées */}
      <div>
        <Label className="text-xs font-medium text-muted-foreground">
          Limites anticipées
        </Label>
        <Textarea
          value={data.limites_anticipees}
          onChange={(e) => update({ limites_anticipees: e.target.value })}
          placeholder="Ex. : La taille du corpus restreinte ne permet pas de généralisation…"
          className="mt-1 min-h-[60px] resize-y"
        />
      </div>
    </div>
  );
}

function MotsClesEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const parsed = safeParseJson<{
    disciplinaires?: string[];
    specifiques_projet?: string[];
  }>(value);

  const disciplinaires = parsed?.disciplinaires ?? [];
  const specifiques = parsed?.specifiques_projet ?? [];

  const update = (partial: Record<string, unknown>) => {
    const next = {
      disciplinaires,
      specifiques_projet: specifiques,
      ...partial,
    };
    onChange(JSON.stringify(next));
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <Label className="text-xs font-medium text-muted-foreground">
          Mots-clés disciplinaires
        </Label>
        <Input
          value={disciplinaires.join(", ")}
          onChange={(e) => {
            const arr = e.target.value
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
            update({ disciplinaires: arr });
          }}
          placeholder="Ex. : urbanisme, patrimoine, mobilité"
          className="mt-1"
        />
      </div>
      <div>
        <Label className="text-xs font-medium text-muted-foreground">
          Mots-clés spécifiques au projet
        </Label>
        <Input
          value={specifiques.join(", ")}
          onChange={(e) => {
            const arr = e.target.value
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
            update({ specifiques_projet: arr });
          }}
          placeholder="Ex. : ville intermédiaire, mobilité douce"
          className="mt-1"
        />
      </div>
    </div>
  );
}

function HypothesesEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const parsed = safeParseJson<string[]>(value);
  const items = parsed ?? [];

  const addItem = () => {
    onChange(JSON.stringify([...items, ""]));
  };

  const removeItem = (idx: number) => {
    onChange(JSON.stringify(items.filter((_, i) => i !== idx)));
  };

  const setItem = (idx: number, v: string) => {
    const next = [...items];
    next[idx] = v;
    onChange(JSON.stringify(next));
  };

  return (
    <div className="flex flex-col gap-2">
      {items.map((h, i) => (
        <div key={i} className="flex items-center gap-2">
          <Textarea
            value={h}
            onChange={(e) => setItem(i, e.target.value)}
            placeholder={`Hypothèse ${i + 1}…`}
            className="min-h-[50px] resize-y flex-1"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeItem(i)}
            className="shrink-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addItem} className="w-fit">
        <Plus className="h-3.5 w-3.5 mr-1" />
        Ajouter une hypothèse
      </Button>
    </div>
  );
}

// ═══════════════════════════════════════
// Reformulate button
// ═══════════════════════════════════════

function ReformulateButton({
  fieldKey,
  currentValue,
  allValues,
  onResult,
}: {
  fieldKey: string;
  currentValue: string;
  allValues: Record<string, string>;
  onResult: (value: string) => void;
}) {
  const reformulateMutation = useReformulateField();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() =>
        reformulateMutation.mutate(
          { fieldKey, currentValue, allFields: allValues },
          {
            onSuccess: (data) => onResult(data.data.value),
          }
        )
      }
      disabled={reformulateMutation.isPending}
      className="text-muted-foreground hover:text-amber-600 shrink-0"
    >
      {reformulateMutation.isPending ? (
        <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
      ) : (
        <Sparkles className="h-3.5 w-3.5 mr-1" />
      )}
      Reformuler avec l&apos;IA
    </Button>
  );
}

// ═══════════════════════════════════════
// Main Edition Step
// ═══════════════════════════════════════

export function EditionStep({
  fields,
  allValues,
  onFieldChange,
  onSave,
  onProceed,
  isSaving,
}: EditionStepProps) {
  // Build a map from fieldKey -> field row for easy lookup
  const fieldMap = useMemo(() => {
    const map: Record<string, FieldRow> = {};
    for (const f of fields) {
      map[f.fieldKey] = f;
    }
    return map;
  }, [fields]);

  const handleFieldInput = useCallback(
    (fieldKey: string, value: string) => {
      const row = fieldMap[fieldKey];
      if (row) {
        onFieldChange(row.id, value);
      }
    },
    [fieldMap, onFieldChange]
  );

  const handleReformulate = useCallback(
    (fieldKey: string, newValue: string) => {
      handleFieldInput(fieldKey, newValue);
    },
    [handleFieldInput]
  );

  const renderField = (fieldDef: CadrageField) => {
    const row = fieldMap[fieldDef.key];
    const value = row?.value ?? "";

    return (
      <Card key={fieldDef.key}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-sm font-medium">{fieldDef.label}</CardTitle>
              <CardDescription className="text-xs">
                {fieldDef.description}
              </CardDescription>
            </div>
            <ReformulateButton
              fieldKey={fieldDef.key}
              currentValue={value}
              allValues={allValues}
              onResult={(v) => handleReformulate(fieldDef.key, v)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {fieldDef.type === "textarea" && (
            <Textarea
              value={value}
              onChange={(e) => handleFieldInput(fieldDef.key, e.target.value)}
              placeholder={fieldDef.placeholder}
              className="min-h-[80px] resize-y"
            />
          )}
          {fieldDef.type === "select" && (
            <Select
              value={value}
              onValueChange={(v) => handleFieldInput(fieldDef.key, v)}
            >
              <SelectTrigger>
                <SelectValue placeholder={fieldDef.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {fieldDef.options?.map((opt) => {
                  const labelMap: Record<string, Record<string, string>> = {
                    type_recherche: TYPE_RECHERCHE_LABELS,
                    type_revue_litterature: TYPE_REVUE_LABELS,
                    type_these: TYPE_THESE_LABELS,
                  };
                  const labels = labelMap[fieldDef.key];
                  return (
                    <SelectItem key={opt} value={opt}>
                      {labels?.[opt] ?? opt}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}
          {fieldDef.type === "json" && fieldDef.key === "questions_recherche" && (
            <QuestionsRechercheEditor
              value={value}
              onChange={(v) => handleFieldInput(fieldDef.key, v)}
            />
          )}
          {fieldDef.type === "json" && fieldDef.key === "objectifs" && (
            <ObjectifsEditor
              value={value}
              onChange={(v) => handleFieldInput(fieldDef.key, v)}
            />
          )}
          {fieldDef.type === "json" && fieldDef.key === "hypotheses" && (
            <HypothesesEditor
              value={value}
              onChange={(v) => handleFieldInput(fieldDef.key, v)}
            />
          )}
          {fieldDef.type === "json" && fieldDef.key === "methodologie" && (
            <MethodologieEditor
              value={value}
              onChange={(v) => handleFieldInput(fieldDef.key, v)}
            />
          )}
          {fieldDef.type === "json" && fieldDef.key === "mots_cles" && (
            <MotsClesEditor
              value={value}
              onChange={(v) => handleFieldInput(fieldDef.key, v)}
            />
          )}
          {fieldDef.key === "type_recherche" && fieldDef.subFields && (
            <div className="mt-3 pt-3 border-t">
              {fieldDef.subFields.map((sf) => {
                const sfFieldDef = CADRAGE_FIELDS_MAP[`justification_type_recherche`];
                if (!sfFieldDef || sf.key !== "justification_type_recherche") return null;
                // This field is stored as its own row if it exists
                return null; // handled by the group loop
              })}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <ScrollArea className="h-[65vh]">
        <div className="flex flex-col gap-6 pr-4">
          {FIELD_GROUPS.map((group) => {
            const groupFields = group.keys
              .map((k) => CADRAGE_FIELDS_MAP[k])
              .filter((f): f is CadrageField => f !== undefined);
            if (groupFields.length === 0) return null;

            return (
              <div key={group.title} className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.title}
                </h3>
                {groupFields.map((f) => renderField(f))}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <Separator />

      <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
        <Button variant="outline" onClick={onSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Sauvegarder
        </Button>
        <Button onClick={onProceed}>
          Vérifier la cohérence
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
