"use client";

// C-3 (AUD-FUNC-003) : dialogue de confirmation partagé pour toute suppression destructive.
// La mutation / requête de suppression n'est déclenchée QUE par onConfirm (bouton « Supprimer ») ;
// « Annuler » (ou Escape / clic sur l'overlay) ferme le dialogue sans émettre aucune requête
// ni modifier aucune donnée.

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
import { buttonVariants } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isPending?: boolean;
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  isPending = false,
}: ConfirmDeleteDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!isPending) onOpenChange(next);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {title ?? "Confirmer la suppression ?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description ??
              "Cette action est définitive et ne peut pas être annulée. Voulez-vous vraiment supprimer cet élément ?"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {cancelLabel ?? "Annuler"}
          </AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: "destructive" }))}
            disabled={isPending}
            onClick={(e) => {
              // Le dialogue reste ouvert pendant la suppression (feedback isPending) ;
              // l'appelant le referme via onOpenChange(false) une fois la mutation réglée.
              e.preventDefault();
              onConfirm();
            }}
          >
            {isPending && (
              <Loader2
                className="mr-1.5 h-4 w-4 animate-spin"
                aria-hidden="true"
              />
            )}
            {confirmLabel ?? "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
