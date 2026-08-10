"use client";

import { useAppStore, NAVIGATION_ITEMS } from "@/lib/stores/app-store";
import {
  GraduationCap,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ModulePlaceholder() {
  const { currentView, setCurrentView } = useAppStore();
  const currentNav = NAVIGATION_ITEMS.find((item) => item.id === currentView);

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8 max-w-lg mx-auto w-full text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <GraduationCap className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">{currentNav?.label}</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          {currentNav?.description}. Ce module est en cours de développement et sera bientôt disponible.
        </p>
      </div>
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Contenu prévu</CardTitle>
          <CardDescription className="text-xs">
            Ce module inclura les fonctionnalités suivantes
          </CardDescription>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          <p>
            Le développement de ce module suit la roadmap de ThesisFrame.
            Il sera construit avec les mêmes standards de qualité :
            composants shadcn/ui, tests unitaires, types TypeScript stricts.
          </p>
        </CardContent>
      </Card>
      <Button
        variant="outline"
        className="gap-2"
        onClick={() => setCurrentView("dashboard")}
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au tableau de bord
      </Button>
    </div>
  );
}
