import { db } from "@/lib/db";
import type { BookSkillInput } from "./book-skills";

/**
 * Ressources actives (opt-in strict, `enabled: true`) ordonnées de la plus
 * récemment mise à jour à la plus ancienne — l'ordre fait foi pour la
 * sélection déterministe du canal d'injection.
 */
export async function getActiveBookSkills(): Promise<BookSkillInput[]> {
  return db.customBookSkill.findMany({
    where: { enabled: true },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      author: true,
      description: true,
      tags: true,
      source: true,
      content: true,
    },
  });
}
