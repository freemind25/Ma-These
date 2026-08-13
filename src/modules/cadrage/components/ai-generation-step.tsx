"use client";

import { useState } from "react";
import { Sparkles, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { CADRAGE_USER_FIELDS } from "@/data/cadrage-fields";

interface AiGenerationStepProps {
  generatedFields: Record<string, string>;
  onAcceptAll: (fields: Record<string, string>) => void;
  _onProceed: () => void;
}

export function AiGenerationStep({
  generatedFields,
  onAcceptAll,
}: AiGenerationStepProps) {
  const [editedFields, setEditedFields] = useState<Record<string, string>>({ ...generatedFields });

  const handleFieldChange = (key: string, value: string) => {
    setEditedFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleAcceptAll = () => {
    onAcceptAll(editedFields);
  };

  const filledCount = Object.values(editedFields).filter((v) => v && v.trim().length > 0).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Suggestions de l&apos;IA</h3>
          <p className="text-sm text-muted-foreground">
            {filledCount}/{CADRAGE_USER_FIELDS.length} champs remplis — Vérifiez et modifiez si nécessaire
          </p>
        </div>
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700">
          <Sparkles className="h-3 w-3 mr-1" />
          Brouillon IA
        </Badge>
      </div>

      <ScrollArea className="h-[60vh]">
        <div className="flex flex-col gap-4 pr-4">
          {CADRAGE_USER_FIELDS.map((field) => {
            const value = editedFields[field.key] ?? "";
            return (
              <Card
                key={field.key}
                className="border-l-4 border-l-amber-400 dark:border-l-amber-500"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-sm font-medium">
                      {field.label}
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className="shrink-0 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Suggestion IA
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {value ? (
                    <Textarea
                      value={value}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      className="min-h-[80px] resize-y text-sm"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Aucune suggestion générée pour ce champ
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      <Separator />

      <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
        <p className="text-xs text-muted-foreground">
          Les suggestions sont modifiables. Vous pourrez les modifier davantage à l&apos;étape suivante.
        </p>
        <Button onClick={handleAcceptAll}>
          <Check className="h-4 w-4 mr-2" />
          Valider et passer à l&apos;édition
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
