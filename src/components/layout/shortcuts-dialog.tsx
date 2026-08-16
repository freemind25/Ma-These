"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Keyboard } from "lucide-react";

interface ShortcutEntry {
  keys: string[];
  description: string;
}

const SHORTCUT_GROUPS: { label: string; shortcuts: ShortcutEntry[] }[] = [
  {
    label: "Navigation",
    shortcuts: [
      {
        keys: ["Ctrl", "B"],
        description: "Basculer la barre latérale",
      },
      {
        keys: ["Alt", "←"],
        description: "Vue précédente",
      },
      {
        keys: ["Alt", "→"],
        description: "Vue suivante",
      },
    ],
  },
  {
    label: "Éditeur",
    shortcuts: [
      {
        keys: ["Ctrl", "S"],
        description: "Sauvegarder le chapitre",
      },
      {
        keys: ["Ctrl", "B"],
        description: "Texte en gras (dans l'éditeur)",
      },
      {
        keys: ["Ctrl", "I"],
        description: "Texte en italique (dans l'éditeur)",
      },
      {
        keys: ["Ctrl", "Shift", "S"],
        description: "Sauvegarder sous…",
      },
    ],
  },
  {
    label: "Fenêtre et dialogue",
    shortcuts: [
      {
        keys: ["Esc"],
        description: "Fermer le dialogue / la modale",
      },
      {
        keys: ["Tab"],
        description: "Naviguer entre les éléments",
      },
      {
        keys: ["Enter"],
        description: "Valider / Confirmer",
      },
      {
        keys: ["Shift", "Tab"],
        description: "Navigation inverse",
      },
    ],
  },
  {
    label: "Aide rapide",
    shortcuts: [
      {
        keys: ["?"],
        description: "Ouvrir le guide d'utilisation",
      },
    ],
  },
];

export function ShortcutsDialog({
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
            <Keyboard className="h-5 w-5 text-primary" />
            Raccourcis clavier
          </DialogTitle>
          <DialogDescription>
            Raccourcis disponibles pour naviguer et utiliser ThesisFrame plus
            rapidement.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.label} className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </p>
              <div className="space-y-1.5">
                {group.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.description}
                    className="flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <span className="text-sm text-muted-foreground">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, idx) => (
                        <span key={idx} className="flex items-center gap-1">
                          <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded border bg-muted px-1.5 font-mono text-[11px] font-medium">
                            {key}
                          </kbd>
                          {idx < shortcut.keys.length - 1 && (
                            <span className="text-muted-foreground text-[10px]">
                              +
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {group !== SHORTCUT_GROUPS[SHORTCUT_GROUPS.length - 1] && (
                <Separator />
              )}
            </div>
          ))}

          <div className="rounded-lg border bg-muted/30 p-3 text-center">
            <p className="text-xs text-muted-foreground">
              Les raccourcis peuvent varier selon le module actif.
              <br />
              Appuyez sur <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border bg-muted px-1 font-mono text-[10px]">Esc</kbd> pour fermer cette fenêtre.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
