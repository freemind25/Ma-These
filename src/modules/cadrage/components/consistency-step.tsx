"use client";

import { Loader2, AlertTriangle, XCircle, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CADRAGE_FIELDS_MAP } from "@/data/cadrage-fields";
import { useCheckConsistency, type Tension } from "../hooks/use-cadrage-ai";

interface ConsistencyStepProps {
  allValues: Record<string, string>;
  onBack: () => void;
  onProceed: () => void;
}

export function ConsistencyStep({
  allValues,
  onBack,
  onProceed,
}: ConsistencyStepProps) {
  const checkMutation = useCheckConsistency();

  const tensions: Tension[] = checkMutation.data?.data.tensions ?? [];
  const hasChecked = checkMutation.isSuccess || checkMutation.isError;
  const warnings = tensions.filter((t) => t.severity === "warning");
  const errors = tensions.filter((t) => t.severity === "error");

  const handleCheck = () => {
    checkMutation.mutate(allValues);
  };

  return (
    <div className="flex flex-col gap-6">
      {!hasChecked && (
        <Card className="border-dashed">
          <CardContent className="pt-6 flex flex-col items-center gap-4 text-center">
            <CheckCircle2 className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="font-semibold">Vérifier la cohérence du cadrage</h3>
              <p className="text-sm text-muted-foreground mt-1">
                L&apos;IA va analyser la cohérence entre tous vos champs et détecter
                d&apos;éventuelles tensions ou incohérences.
              </p>
            </div>
            <Button
              onClick={handleCheck}
              disabled={checkMutation.isPending}
            >
              {checkMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Lancer la vérification
            </Button>
          </CardContent>
        </Card>
      )}

      {checkMutation.isPending && (
        <Card className="border-amber-300 dark:border-amber-700">
          <CardContent className="pt-6 flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
            <p className="text-sm font-medium">Analyse en cours…</p>
          </CardContent>
        </Card>
      )}

      {hasChecked && !checkMutation.isPending && (
        <>
          {tensions.length === 0 ? (
            <Card className="border-emerald-300 dark:border-emerald-700">
              <CardContent className="pt-6 flex flex-col items-center gap-3">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                <div className="text-center">
                  <h3 className="font-semibold text-emerald-700 dark:text-emerald-400">
                    Aucune tension détectée
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Votre cadrage semble cohérent. Vous pouvez passer à la validation.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center gap-3">
                {errors.length > 0 && (
                  <Badge variant="destructive" className="text-sm">
                    <XCircle className="h-3.5 w-3.5 mr-1" />
                    {errors.length} erreur{errors.length > 1 ? "s" : ""}
                  </Badge>
                )}
                {warnings.length > 0 && (
                  <Badge className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900 dark:text-amber-200 text-sm">
                    <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                    {warnings.length} avertissement{warnings.length > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>

              <ScrollArea className="h-[50vh]">
                <div className="flex flex-col gap-3 pr-4">
                  {tensions.map((tension, i) => {
                    const isError = tension.severity === "error";
                    return (
                      <Card
                        key={i}
                        className={isError
                          ? "border-l-4 border-l-destructive"
                          : "border-l-4 border-l-amber-400"
                        }
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-sm font-medium">
                              {isError ? (
                                <XCircle className="h-4 w-4 inline mr-2 text-destructive" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 inline mr-2 text-amber-500" />
                              )}
                              {tension.title}
                            </CardTitle>
                            <Badge
                              variant={isError ? "destructive" : "secondary"}
                              className={
                                isError
                                  ? ""
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                              }
                            >
                              {isError ? "Erreur" : "Attention"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">{tension.description}</p>
                          {tension.concernedFields.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {tension.concernedFields.map((fk) => {
                                const def = CADRAGE_FIELDS_MAP[fk];
                                return (
                                  <Badge
                                    key={fk}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {def?.label ?? fk}
                                  </Badge>
                                );
                              })}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </>
          )}
        </>
      )}

      {checkMutation.isError && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">
              {checkMutation.error instanceof Error
                ? checkMutation.error.message
                : "Erreur lors de la vérification. Veuillez réessayer."}
            </p>
          </CardContent>
        </Card>
      )}

      {hasChecked && (
        <>
          <Separator />
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Modifier les champs
            </Button>
            <Button onClick={onProceed}>
              Passer à la validation
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
