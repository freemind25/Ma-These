"use client";

import { useState } from "react";
import { Sparkles, Forward, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGenerateFromPitch } from "../hooks/use-cadrage-ai";

interface PitchStepProps {
  onNext: (generatedFields: Record<string, string> | null) => void;
  onSkip: () => void;
}

export function PitchStep({ onNext, onSkip }: PitchStepProps) {
  const [pitch, setPitch] = useState("");
  const generateMutation = useGenerateFromPitch();

  const handleGenerate = () => {
    if (pitch.trim().length < 20) return;
    generateMutation.mutate(pitch, {
      onSuccess: (data) => {
        onNext(data.data);
      },
    });
  };

  const isLoading = generateMutation.isPending;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Décrivez votre projet de thèse</CardTitle>
          <CardDescription>
            En quelques phrases, partagez votre sujet, votre terrain, et ce que vous cherchez à comprendre ou démontrer.
            L&apos;IA générera un premier jet complet de votre cadrage préalable.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Textarea
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            placeholder="Décrivez votre projet en quelques phrases : sujet, terrain, ce que vous cherchez à comprendre ou démontrer."
            className="min-h-[160px] resize-y"
            disabled={isLoading}
          />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{pitch.length} caractères</span>
            {pitch.length < 20 && (
              <span className="text-destructive">minimum 20 caractères requis</span>
            )}
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <Card className="border-amber-300 dark:border-amber-700">
          <CardContent className="pt-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
              <span className="font-medium">Génération en cours…</span>
            </div>
            <div className="flex flex-col gap-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </CardContent>
        </Card>
      )}

      {generateMutation.isError && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">
              {generateMutation.error instanceof Error
                ? generateMutation.error.message
                : "Erreur lors de la génération. Veuillez réessayer."}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
        <Button
          variant="outline"
          onClick={onSkip}
          disabled={isLoading}
        >
          <Forward className="h-4 w-4 mr-2" />
          Compléter plus tard
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="hidden sm:inline-flex text-muted-foreground">
            Le saut affichera un formulaire vide
          </Badge>
          <Button
            onClick={handleGenerate}
            disabled={pitch.trim().length < 20 || isLoading}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Générer le premier jet
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
