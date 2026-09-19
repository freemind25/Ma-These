"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { GraduationCap, Maximize2 } from "lucide-react";

// ═══ Ressources pédagogiques (fournies par le propriétaire) ═══
const RESOURCES = [
  {
    title: "Bien choisir son directeur de thèse",
    description:
      "Les 7 étapes pour évaluer et sélectionner son encadrant : potentiel de recherche, alignement des intérêts, retours des étudiants, disponibilité, ressources et décision finale.",
    src: "/resources/choisir-directeur-these-7-etapes.jpg",
    credit: "Infographie : @PhDtoProfMentor",
    alt: "Infographie : les 7 étapes pour choisir un bon directeur de thèse",
  },
  {
    title: "Article de recherche vs article de revue",
    description:
      "Comprendre les différences essentielles entre les deux formats : objectif, base documentaire, méthode de rédaction, contenu rapporté et longueur attendue.",
    src: "/resources/article-recherche-vs-revue.jpg",
    credit: "Infographie : Razia Aliani — Source : Editage Open Academics",
    alt: "Infographie comparative : article de recherche et article de revue",
  },
] as const;

export function ResourcesSection() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-primary" />
          Ressources pédagogiques
        </CardTitle>
        <CardDescription>
          Infographies sélectionnées pour vous accompagner dans votre parcours
          doctoral — cliquez pour agrandir
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {RESOURCES.map((resource) => (
            <div
              key={resource.src}
              className="group flex flex-col gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    aria-label={`Agrandir : ${resource.title}`}
                    className="relative block w-full overflow-hidden rounded-md border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Image
                      src={resource.src}
                      alt={resource.alt}
                      width={527}
                      height={659}
                      className="h-auto w-full"
                    />
                    <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-background/80 opacity-0 transition-opacity group-hover:opacity-100">
                      <Maximize2 className="h-3.5 w-3.5" />
                    </span>
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{resource.title}</DialogTitle>
                    <DialogDescription>{resource.credit}</DialogDescription>
                  </DialogHeader>
                  <Image
                    src={resource.src}
                    alt={resource.alt}
                    width={527}
                    height={659}
                    className="h-auto w-full rounded-md border"
                  />
                </DialogContent>
              </Dialog>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-semibold leading-snug">
                  {resource.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {resource.description}
                </p>
                <span className="text-xs italic text-muted-foreground/80">
                  {resource.credit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
