"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Github, Heart, ExternalLink } from "lucide-react";
import Image from "next/image";

export function AboutDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image src="/logo.png" alt="Ma Thèse" width={20} height={20} className="object-contain" />
            À propos de Ma Thèse
          </DialogTitle>
          <DialogDescription>
            Votre environnement doctoral tout-en-un
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Logo & version */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-24 items-center justify-center rounded-lg bg-primary/5 p-1">
              <Image src="/logo.png" alt="Ma Thèse" width={88} height={44} className="object-contain" />
            </div>
            <div>
              <p className="font-semibold text-lg">Ma Thèse</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px]">
                  v1.2.0
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  Next.js 16
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ma Thèse est une plateforme intégrée conçue pour accompagner les
              doctorants tout au long de leur parcours de thèse. Elle regroupe
              rédaction, recherche bibliographique, méthodologie, outils IA et
              export dans un seul environnement.
            </p>
          </div>

          <Separator />

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-3 text-center">
              <p className="text-2xl font-bold text-primary">30+</p>
              <p className="text-xs text-muted-foreground">Modules intégrés</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-2xl font-bold text-primary">5</p>
              <p className="text-xs text-muted-foreground">Fournisseurs IA</p>
            </div>
          </div>

          <Separator />

          {/* Technologies */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Technologies</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                "Next.js 16",
                "TypeScript",
                "Tailwind CSS 4",
                "shadcn/ui",
                "Prisma",
                "Zustand",
                "SQLite",
              ].map((tech) => (
                <Badge key={tech} variant="outline" className="text-[10px]">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Links */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Liens</p>
            <div className="flex flex-col gap-1.5">
              <a
                href="https://github.com/freemind25/Ma-These"
                target="_blank"
                rel="noopener"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-4 w-4" />
                Dépôt GitHub
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Credits */}
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
              Fait avec <Heart className="h-3 w-3 text-red-500 fill-red-500" /> pour
              la communauté doctorale
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
