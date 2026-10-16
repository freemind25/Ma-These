"use client";

// ═══════════════════════════════════════════════════════════════
// C2-E2 — Client HTTP centralisé : toute erreur serveur devient un
// toast visible (sonner, monté dans layout.tsx) + une exception.
// Historique : les mutations échouaient en silence — l'utilisateur
// voyait « rien ne se passe » (écart bloquant C2-E2, audit
// 2026-10-16 : P2021/P2022 renvoyés par le serveur mais ignorés).
// ═══════════════════════════════════════════════════════════════

import { toast } from "sonner";

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export interface ApiJsonEnvelope<T> {
  data?: T;
  error?: string;
  code?: string;
}

export async function apiJson<T = unknown>(
  url: string,
  init?: RequestInit,
  opts?: { silent?: boolean }
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (e) {
    // Serveur injoignable (arrêt en cours, orphelin, etc.)
    if (!opts?.silent) {
      toast.error("Le serveur n'a pas répondu", {
        description:
          "Relancez l'application. Si le problème persiste, consultez server.log.",
      });
    }
    throw e;
  }

  const json = (await res.json().catch(() => null)) as
    | ApiJsonEnvelope<T>
    | null;

  if (!res.ok) {
    const message = json?.error || `Erreur ${res.status}`;
    if (!opts?.silent) {
      toast.error("L'opération a échoué", { description: message });
    }
    throw new ApiError(message, res.status, json?.code);
  }

  // Routes enveloppées {data, meta} → renvoyer data ; sinon l'objet brut.
  return (json && json.data !== undefined ? json.data : (json as unknown)) as T;
}
