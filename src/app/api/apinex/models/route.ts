import { NextResponse } from "next/server";
import { getApinexApiKey, fetchApinexModels } from "@/lib/apinex/apinex-client";

export const dynamic = "force-dynamic";

/** GET /api/apinex/models — catalogue public des modèles APInex (cache 5 min). */
export async function GET() {
  try {
    const models = await fetchApinexModels();
    return NextResponse.json({ ok: true, models, hasKey: !!getApinexApiKey() });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Erreur catalogue" },
      { status: 502 }
    );
  }
}
