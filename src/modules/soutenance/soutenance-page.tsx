"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ClipboardCheck,
  Loader2,
  Copy,
  RefreshCw,
  Presentation,
  Mic,
  MessagesSquare,
  FileQuestion,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAppStore } from "@/lib/stores/app-store";
import { useThesis } from "@/modules/editor/hooks/use-thesis";
import { useToast } from "@/hooks/use-toast";

// ═══════════════════════════════════════
// Module Soutenance — préparation de la soutenance orale
// 3 artefacts générés par IA et persistés par thèse :
// slides (plan numéroté), discours (durée cible), questions du jury (par famille)
// ═══════════════════════════════════════

interface SoutenanceSlide {
  title: string;
  points: string[];
}

interface SoutenanceQuestionItem {
  question: string;
  angle: string;
}

interface SoutenanceQuestionFamily {
  family: string;
  items: SoutenanceQuestionItem[];
}

interface SoutenanceRecord {
  id: string;
  thesisId: string;
  slides: SoutenanceSlide[];
  speech: string;
  speechDurationMin: number;
  questions: SoutenanceQuestionFamily[];
  createdAt: string;
  updatedAt: string;
}

type ArtefactType = "slides" | "speech" | "questions";

const DURATIONS = [10, 15, 20] as const;

const ARTEFACT_LABELS: Record<ArtefactType, string> = {
  slides: "le plan de slides",
  speech: "le discours",
  questions: "les questions du jury",
};

/** Format texte lisible des slides pour le presse-papiers. */
function slidesToText(slides: SoutenanceSlide[]): string {
  return slides
    .map(
      (slide, index) =>
        `Diapositive ${index + 1} — ${slide.title}\n${slide.points.map((p) => `- ${p}`).join("\n")}`
    )
    .join("\n\n");
}

/** Format texte lisible des questions pour le presse-papiers. */
function questionsToText(families: SoutenanceQuestionFamily[]): string {
  return families
    .map(
      (family) =>
        `${family.family}\n${family.items
          .map((item) => `Question : ${item.question}\nAngle de réponse : ${item.angle}`)
          .join("\n\n")}`
    )
    .join("\n\n");
}

export function SoutenancePage() {
  const { activeThesisId } = useAppStore();
  const { data: thesis, isLoading: isLoadingThesis } = useThesis(activeThesisId);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [durationMin, setDurationMin] = useState<string>("15");
  const [regenTarget, setRegenTarget] = useState<ArtefactType | null>(null);

  const {
    data: record,
    isLoading: isLoadingRecord,
  } = useQuery({
    queryKey: ["soutenance", activeThesisId],
    queryFn: async () => {
      const res = await fetch(`/api/thesis/${activeThesisId}/soutenance`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erreur lors du chargement de la préparation de soutenance");
      }
      const json = await res.json();
      return (json.data ?? null) as SoutenanceRecord | null;
    },
    enabled: !!activeThesisId,
  });

  const generateMutation = useMutation({
    mutationFn: async ({ type, duration }: { type: ArtefactType; duration: number }) => {
      if (!activeThesisId) throw new Error("Aucune thèse active");
      const res = await fetch("/api/soutenance/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thesisId: activeThesisId,
          type,
          ...(type === "speech" ? { durationMin: duration } : {}),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Erreur ${res.status} lors de la génération`);
      }
      const json = await res.json();
      return json.data as SoutenanceRecord;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["soutenance", activeThesisId], data);
      if (variables.type === "slides") {
        toast({ title: "Plan de slides généré", description: "L'artefact a été enregistré pour cette thèse." });
      } else if (variables.type === "speech") {
        toast({ title: "Discours généré", description: "L'artefact a été enregistré pour cette thèse." });
      } else {
        toast({ title: "Questions du jury générées", description: "L'artefact a été enregistré pour cette thèse." });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Échec de la génération",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const pendingType = generateMutation.isPending ? generateMutation.variables?.type : undefined;

  function launchGeneration(type: ArtefactType) {
    generateMutation.mutate({ type, duration: Number(durationMin) });
  }

  /** Relance : confirmation si l'artefact existe déjà, génération directe sinon. */
  function handleGenerate(type: ArtefactType) {
    if (!record) {
      launchGeneration(type);
      return;
    }
    const exists =
      (type === "slides" && (record.slides?.length ?? 0) > 0) ||
      (type === "speech" && (record.speech ?? "").length > 0) ||
      (type === "questions" && (record.questions?.length ?? 0) > 0);
    if (exists) {
      setRegenTarget(type);
    } else {
      launchGeneration(type);
    }
  }

  async function copyToClipboard(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: `${label} copiés dans le presse-papiers` });
    } catch {
      toast({
        title: "Copie impossible",
        description: "Votre navigateur a refusé l'accès au presse-papiers.",
        variant: "destructive",
      });
    }
  }

  const slides = record?.slides ?? [];
  const speech = record?.speech ?? "";
  const questions = record?.questions ?? [];
  const savedDuration = record?.speechDurationMin ?? 15;

  // ── États sans thèse active ──────────────────────────────────
  if (!activeThesisId) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        <PageHeader />
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <h3 className="text-lg font-semibold">Aucune thèse active</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Choisissez une thèse dans l&apos;éditeur pour préparer votre soutenance.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <PageHeader thesisTitle={thesis?.title} isLoadingThesis={isLoadingThesis} />

      {isLoadingThesis || isLoadingRecord ? (
        <Card>
          <CardContent className="py-8 space-y-3">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="slides" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="slides" className="gap-1.5">
              <Presentation className="h-4 w-4" />
              <span className="hidden sm:inline">Slides</span>
            </TabsTrigger>
            <TabsTrigger value="speech" className="gap-1.5">
              <Mic className="h-4 w-4" />
              <span className="hidden sm:inline">Discours</span>
            </TabsTrigger>
            <TabsTrigger value="questions" className="gap-1.5">
              <MessagesSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Questions du jury</span>
            </TabsTrigger>
          </TabsList>

          {/* ── Onglet Slides ── */}
          <TabsContent value="slides" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Presentation className="h-5 w-5" />
                  Plan de slides
                </CardTitle>
                <CardDescription>
                  Plan de présentation généré à partir du cadrage actif et des chapitres de la thèse.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button onClick={() => handleGenerate("slides")} disabled={!!pendingType} className="gap-2">
                  {pendingType === "slides" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Génération en cours...
                    </>
                  ) : slides.length > 0 ? (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Régénérer les slides
                    </>
                  ) : (
                    <>
                      <Presentation className="h-4 w-4" />
                      Générer les slides
                    </>
                  )}
                </Button>
                {slides.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(slidesToText(slides), "Le plan de slides")}
                    disabled={!!pendingType}
                    className="gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copier le plan
                  </Button>
                )}
              </CardContent>
            </Card>

            {slides.length === 0 ? (
              <EmptyArtefact
                icon={<Presentation className="h-12 w-12" />}
                text="Aucun plan de slides pour cette thèse. Générez le plan de votre présentation : chaque diapositive comporte un titre et quelques points de contenu."
              />
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {slides.map((slide, index) => (
                  <Card key={`slide-${index}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Badge variant="secondary" className="shrink-0 mt-0.5">
                          {index + 1}
                        </Badge>
                        <div className="space-y-2 min-w-0">
                          <p className="font-medium leading-snug">{slide.title}</p>
                          <ul className="space-y-1">
                            {slide.points.map((point, pointIndex) => (
                              <li
                                key={`slide-${index}-point-${pointIndex}`}
                                className="text-sm text-muted-foreground flex gap-2"
                              >
                                <span aria-hidden="true" className="text-primary">•</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Onglet Discours ── */}
          <TabsContent value="speech" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  Discours de soutenance
                </CardTitle>
                <CardDescription>
                  Texte oral calibré : salutations, problématique, méthodologie, résultats, limites, conclusion, remerciements.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium">Durée cible</label>
                    <Select value={durationMin} onValueChange={setDurationMin}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DURATIONS.map((d) => (
                          <SelectItem key={d} value={String(d)}>
                            {d} minutes
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => handleGenerate("speech")}
                    disabled={!!pendingType}
                    className="gap-2"
                  >
                    {pendingType === "speech" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Génération en cours...
                      </>
                    ) : speech.length > 0 ? (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        Régénérer le discours
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4" />
                        Générer le discours
                      </>
                    )}
                  </Button>
                  {speech.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(speech, "Le discours")}
                      disabled={!!pendingType}
                      className="gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copier le discours
                    </Button>
                  )}
                </div>
                {speech.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Durée enregistrée : {savedDuration} minutes. Une nouvelle génération enregistre la durée sélectionnée.
                  </p>
                )}
              </CardContent>
            </Card>

            {speech.length === 0 ? (
              <EmptyArtefact
                icon={<Mic className="h-12 w-12" />}
                text="Aucun discours pour cette thèse. Choisissez une durée cible puis générez un discours de soutenance ancré dans vos chapitres."
              />
            ) : (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Texte du discours
                    <Badge variant="secondary" className="ml-1">{savedDuration} minutes</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-md border bg-muted/30 p-4 text-sm leading-relaxed scrollbar-thin">
                    {speech}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ── Onglet Questions du jury ── */}
          <TabsContent value="questions" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessagesSquare className="h-5 w-5" />
                  Simulation de questions du jury
                </CardTitle>
                <CardDescription>
                  10 questions regroupées par famille (fond théorique, méthodologie, résultats, limites et perspectives, ouverture),
                  chacune avec un angle de réponse suggéré.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button onClick={() => handleGenerate("questions")} disabled={!!pendingType} className="gap-2">
                  {pendingType === "questions" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Génération en cours...
                    </>
                  ) : questions.length > 0 ? (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Régénérer les questions
                    </>
                  ) : (
                    <>
                      <FileQuestion className="h-4 w-4" />
                      Générer 10 questions
                    </>
                  )}
                </Button>
                {questions.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(questionsToText(questions), "Les questions du jury")}
                    disabled={!!pendingType}
                    className="gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copier les questions
                  </Button>
                )}
              </CardContent>
            </Card>

            {questions.length === 0 ? (
              <EmptyArtefact
                icon={<MessagesSquare className="h-12 w-12" />}
                text="Aucune question pour cette thèse. Générez une simulation de questions du jury pour préparer vos réponses."
              />
            ) : (
              <div className="space-y-5 max-h-96 overflow-y-auto pr-1">
                {questions.map((family, familyIndex) => (
                  <div key={`family-${familyIndex}`} className="space-y-2">
                    <Badge variant="secondary">{family.family}</Badge>
                    <div className="space-y-2">
                      {family.items.map((item, itemIndex) => (
                        <Card key={`family-${familyIndex}-item-${itemIndex}`}>
                          <CardContent className="p-4 space-y-2">
                            <p className="text-sm font-medium leading-snug">{item.question}</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              <span className="font-medium text-foreground">Angle de réponse : </span>
                              {item.angle}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* ── Confirmation de relance ── */}
      <AlertDialog open={regenTarget !== null} onOpenChange={(open) => !open && setRegenTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Relancer la génération ?</AlertDialogTitle>
            <AlertDialogDescription>
              {regenTarget
                ? `Un ${regenTarget === "questions" ? "jeu de questions" : regenTarget === "slides" ? "plan de slides" : "discours"} est déjà enregistré pour cette thèse. La nouvelle génération remplacera ${ARTEFACT_LABELS[regenTarget]} existant.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (regenTarget) {
                  launchGeneration(regenTarget);
                }
                setRegenTarget(null);
              }}
            >
              Relancer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Sous-composants ─────────────────────────────────────────

function PageHeader({ thesisTitle, isLoadingThesis }: { thesisTitle?: string; isLoadingThesis?: boolean }) {
  return (
    <div>
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <ClipboardCheck className="h-7 w-7 text-primary" />
        Soutenance
      </h1>
      <p className="text-muted-foreground mt-1">
        Préparez votre soutenance orale : plan de slides, discours calibré et simulation des questions du jury.
        <br />
        <span className="text-xs">
          {isLoadingThesis ? (
            <Skeleton className="inline-block h-3 w-48 align-middle" />
          ) : thesisTitle ? (
            <>Thèse : {thesisTitle}</>
          ) : (
            "Les artefacts sont enregistrés pour la thèse active."
          )}
        </span>
      </p>
    </div>
  );
}

function EmptyArtefact({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <div className="text-muted-foreground/50 mb-3 flex justify-center">{icon}</div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">{text}</p>
      </CardContent>
    </Card>
  );
}
