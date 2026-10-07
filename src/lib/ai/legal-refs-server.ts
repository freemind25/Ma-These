import { db } from "@/lib/db";
import type { LegalRefInput } from "./legal-refs";

/**
 * Entrées actives du registre juridique (opt-in strict, `enabled: true`)
 * ordonnées de la plus récemment mise à jour à la plus ancienne — l'ordre
 * fait foi pour la sélection déterministe du canal d'injection.
 */
export async function getActiveLegalRefs(): Promise<LegalRefInput[]> {
  return db.legalRef.findMany({
    where: { enabled: true },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      domaine: true,
      reference: true,
      joradp: true,
      statut: true,
      textesLies: true,
      portee: true,
      questions: true,
      autorites: true,
      niveauConfiance: true,
    },
  });
}
