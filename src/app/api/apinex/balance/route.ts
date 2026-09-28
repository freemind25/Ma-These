import { NextResponse } from "next/server";
import {
  getApinexApiKey,
  fetchApinexBalance,
} from "@/lib/apinex/apinex-client";

export const dynamic = "force-dynamic";

/** GET /api/apinex/balance — solde USD du portefeuille APInex. */
export async function GET() {
  const key = getApinexApiKey();
  if (!key) {
    return NextResponse.json(
      { ok: false, error: "APINEX_API_KEY manquante côté serveur" },
      { status: 500 }
    );
  }
  try {
    const balance = await fetchApinexBalance(key);
    return NextResponse.json({ ok: true, balance });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Erreur balance" },
      { status: 502 }
    );
  }
}
