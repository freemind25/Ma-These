// ═══════════════════════════════════════════════════════════════
// C2-E2 — Traduction des erreurs Prisma en réponses HTTP explicites.
// Historique : les routes renvoyaient un 500 générique (« Erreur lors
// de … ») sans code Prisma, et le client n'affichait rien →
// « rien ne se passe » pour l'utilisateur (écart bloquant C2-E2,
// audit 2026-10-16 : P2021/P2022 sur base obsolète, remédiée à la
// main — le codage restait fail-open).
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export interface DbErrorTranslation {
  status: number;
  body: { error: string; code?: string };
}

export function translateDbError(
  error: unknown,
  fallback = "Erreur interne du serveur"
): DbErrorTranslation {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2021":
        return {
          status: 503,
          body: {
            error:
              "Base de données obsolète ou corrompue (table manquante). Mettez à jour l'application — vos données sont conservées.",
            code: "P2021",
          },
        };
      case "P2022":
        return {
          status: 503,
          body: {
            error:
              "Base de données obsolète (champ manquant). Mettez à jour l'application — vos données sont conservées.",
            code: "P2022",
          },
        };
      case "P2002":
        return {
          status: 409,
          body: { error: "Doublon : un élément identique existe déjà.", code: "P2002" },
        };
      case "P2025":
        return {
          status: 404,
          body: { error: "Élément introuvable (déjà supprimé ?).", code: "P2025" },
        };
      case "P2003":
        return {
          status: 409,
          body: {
            error: "Impossible de supprimer : cet élément est référencé ailleurs.",
            code: "P2003",
          },
        };
    }
  }
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return {
      status: 503,
      body: {
        error:
          "Base de données inaccessible. Vérifiez que l'application n'est pas déjà ouverte ailleurs, puis relancez-la.",
        code: "DB_INIT",
      },
    };
  }
  return { status: 500, body: { error: fallback } };
}

/** Réponse prête à l'emploi pour les catch génériques des routes API. */
export function dbErrorResponse(error: unknown, fallback: string): NextResponse {
  const t = translateDbError(error, fallback);
  return NextResponse.json(t.body, { status: t.status });
}
