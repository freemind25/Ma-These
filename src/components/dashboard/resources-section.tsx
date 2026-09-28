"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Maximize2,
} from "lucide-react";

type ResourcePage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

type Resource = {
  title: string;
  description: string;
  credit: string;
  pages: readonly [ResourcePage, ...ResourcePage[]];
};

// ═══ Ressources pédagogiques (fournies par le propriétaire) ═══
const RESOURCES: readonly Resource[] = [
  {
    title: "Bien choisir son directeur de thèse",
    description:
      "Les 7 étapes pour évaluer et sélectionner son encadrant : potentiel de recherche, alignement des intérêts, retours des étudiants, disponibilité, ressources et décision finale.",
    credit: "Infographie : @PhDtoProfMentor",
    pages: [
      {
        src: "/resources/choisir-directeur-these-7-etapes.jpg",
        alt: "Infographie : les 7 étapes pour choisir un bon directeur de thèse",
        width: 527,
        height: 659,
      },
    ],
  },
  {
    title: "Article de recherche vs article de revue",
    description:
      "Comprendre les différences essentielles entre les deux formats : objectif, base documentaire, méthode de rédaction, contenu rapporté et longueur attendue.",
    credit: "Infographie : Razia Aliani — Source : Editage Open Academics",
    pages: [
      {
        src: "/resources/article-recherche-vs-revue.jpg",
        alt: "Infographie comparative : article de recherche et article de revue",
        width: 527,
        height: 659,
      },
    ],
  },
  {
    title: "Méthodes & méthodologie — guide de survie (UWA)",
    description:
      "Distinguer les méthodes (techniques concrètes de collecte) de la méthodologie (cadre théorique qui les justifie) ; ontologie, épistémologie, quantitatif vs qualitatif ; comment choisir ses méthodes, check-list avant collecte et astuces pratiques pour enquêtes, entretiens et focus groups.",
    credit: "STUDYSmarter — The University of Western Australia",
    pages: [
      {
        src: "/resources/methodes-methodologie-uwa-1.jpg",
        alt: "Guide de survie UWA, page 1 : Methods and Methodology — différence entre methods et methodology, exemples de méthodes, choix des méthodes, check-list avant collecte de données",
        width: 935,
        height: 990,
      },
      {
        src: "/resources/methodes-methodologie-uwa-2.jpg",
        alt: "Guide de survie UWA, page 2 : termes clés (ontologie, épistémologie, quantitatif, qualitatif) et astuces pratiques pour enquêtes, focus groups et entretiens",
        width: 935,
        height: 990,
      },
    ],
  },
  {
    title: "Les méthodes mixtes : combiner quali et quanti",
    description:
      "Fiche de lecture en 2 pages : les trois niveaux de combinaison (paradigme, méthode, technique), la notation et les 7 gabarits de design, l'échantillonnage combiné, les usages multiples des instruments, lier ou transformer l'analyse (quantifying / qualitizing) et les garde-fous contre le mixte cosmétique.",
    credit:
      "Fiche de lecture ThesisFrame — d'après M. Sandelowski, Research in Nursing & Health, 23(3), 246-255, 2000",
    pages: [
      {
        src: "/resources/methodes-mixtes-sandelowski-fiche-1.jpg",
        alt: "Fiche de lecture page 1 : les trois niveaux de combinaison (paradigme, méthode, technique), la notation des designs mixtes et le tableau des sept gabarits",
        width: 1840,
        height: 2380,
      },
      {
        src: "/resources/methodes-mixtes-sandelowski-fiche-2.jpg",
        alt: "Fiche de lecture page 2 : combiner l'échantillonnage, la collecte (usages multiples des instruments) et l'analyse (lier ou transformer), garde-fous des méthodes mixtes",
        width: 1840,
        height: 2380,
      },
    ],
  },
];

function ResourcePager({ pages }: { pages: Resource["pages"] }) {
  const [index, setIndex] = useState(0);
  const page = pages[index];
  const multiple = pages.length > 1;

  return (
    <div className="flex flex-col gap-3">
      <Image
        key={page.src}
        src={page.src}
        alt={page.alt}
        width={page.width}
        height={page.height}
        className="h-auto w-full rounded-md border"
        priority={index === 0}
      />
      {multiple && (
        <div className="flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={index === 0}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            aria-label="Page précédente"
          >
            <ChevronLeft className="h-4 w-4" />
            Précédente
          </Button>
          <span
            className="min-w-14 text-center text-xs text-muted-foreground"
            aria-live="polite"
          >
            {index + 1} / {pages.length}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={index === pages.length - 1}
            onClick={() => setIndex((i) => Math.min(pages.length - 1, i + 1))}
            aria-label="Page suivante"
          >
            Suivante
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export function ResourcesSection() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-primary" />
          Ressources pédagogiques
        </CardTitle>
        <CardDescription>
          Guides, fiches de lecture et infographies sélectionnés pour vous
          accompagner dans votre parcours doctoral — cliquez pour agrandir
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {RESOURCES.map((resource) => {
            const thumb = resource.pages[0];
            return (
              <div
                key={resource.title}
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
                        src={thumb.src}
                        alt={thumb.alt}
                        width={thumb.width}
                        height={thumb.height}
                        className="h-auto w-full"
                      />
                      <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-background/80 opacity-0 transition-opacity group-hover:opacity-100">
                        <Maximize2 className="h-3.5 w-3.5" />
                      </span>
                      {resource.pages.length > 1 && (
                        <span className="absolute left-2 top-2 rounded-md bg-background/80 px-2 py-0.5 text-xs font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                          {resource.pages.length} pages
                        </span>
                      )}
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{resource.title}</DialogTitle>
                      <DialogDescription>{resource.credit}</DialogDescription>
                    </DialogHeader>
                    <ResourcePager pages={resource.pages} />
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
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
