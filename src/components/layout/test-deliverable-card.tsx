"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileDown, FileText, FileCheck, X, GraduationCap } from "lucide-react";

const STORAGE_KEY = "test-deliverable-card-dismissed-v2";
const PANEL_ID = "test-deliverable-panel";

const DELIVERABLES = [
  {
    href: "/RAPPORT-CORRECTIONS-ANNEXE-A1-A13.md",
    label: "Rapport corrections A.1-A.13",
    meta: "Statuts + preuves d'exécution",
    icon: FileCheck,
  },
  {
    href: "/THESE-urbanisme-tic-ia-production-test.md",
    label: "Thèse (Markdown)",
    meta: "8 549 mots · 57,6 ko",
    icon: FileText,
  },
  {
    href: "/THESE-urbanisme-tic-ia-production-test.docx",
    label: "Thèse (DOCX)",
    meta: "Export via l'app · 30,7 ko",
    icon: FileDown,
  },
] as const;

/**
 * AUD-UX-002 — correctif ciblé (cycle audit-final-v1.2) :
 * la carte flottante (320 px, z-50, bas-droit) recouvrait des éléments
 * interactifs en flux normal (bouton « Générer » de la vue IA — hit-test
 * bloqué, observé au TNR GP-4). Désormais : pastille repliée PAR DÉFAUT
 * (surface minimale, pointer-events confinés), panneau dépliable
 * uniquement sur action explicite de l'utilisateur, fermeture X inchangée
 * (localStorage). Aucun changement de fonctionnalité ni de données.
 */
export function TestDeliverableCard() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      let dismissed = false;
      try {
        dismissed = window.localStorage.getItem(STORAGE_KEY) === "1";
      } catch {
        dismissed = false;
      }
      setVisible(!dismissed);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setVisible(false);
    setExpanded(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // stockage indisponible : fermeture pour la session uniquement
    }
  };

  if (!visible) return null;

  if (!expanded) {
    // Pastille repliée : surface minimale, cliquable uniquement sur elle-même
    return (
      <div className="pointer-events-none fixed bottom-4 right-4 z-50">
        <Button
          size="sm"
          variant="outline"
          className="pointer-events-auto h-8 gap-1.5 border-amber-500/40 bg-background/95 px-2.5 text-xs shadow-lg"
          aria-expanded={false}
          aria-controls={PANEL_ID}
          aria-label="Afficher les livrables du test de production"
          onClick={() => setExpanded(true)}
        >
          <GraduationCap className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
          Livrables
        </Button>
      </div>
    );
  }

  return (
    <div
      id={PANEL_ID}
      className="pointer-events-none fixed bottom-4 right-4 z-50 w-[min(20rem,calc(100vw-2rem))]"
      role="complementary"
      aria-label="Livrable du test de production"
    >
      <Card className="pointer-events-auto border-amber-500/40 shadow-lg">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <GraduationCap className="h-4 w-4 text-amber-600" aria-hidden="true" />
              Livrable du test de production
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={dismiss}
              aria-label="Masquer la carte de téléchargement"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </div>
          <CardDescription className="text-xs">
            Thèse complète produite via ThesisFrame (test-production-theses-v1)
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 p-4 pt-2">
          {DELIVERABLES.map(({ href, label, meta, icon: Icon }) => (
            <a
              key={href}
              href={href}
              download
              className="flex items-center justify-between gap-2 rounded-md border p-2.5 text-sm transition-colors hover:bg-accent"
            >
              <span className="flex min-w-0 items-center gap-2">
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="flex flex-col min-w-0">
                  <span className="truncate font-medium">{label}</span>
                  <span className="truncate text-xs text-muted-foreground">{meta}</span>
                </span>
              </span>
              <Badge variant="secondary" className="shrink-0">
                <FileDown className="mr-1 h-3 w-3" aria-hidden="true" />
                Télécharger
              </Badge>
            </a>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
