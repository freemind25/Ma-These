import { NextResponse } from "next/server";
import { THESES_FR_STATS, THESES_FR_SEARCH } from "@/lib/theses-fr/types";

export async function GET() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(THESES_FR_STATS, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({ error: "Impossible de récupérer les statistiques" }, { status: 502 });
    }

    const totalTheses = await res.json();
    return NextResponse.json({ data: { totalTheses } });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return NextResponse.json({ error: "Délai dépassé" }, { status: 504 });
    }
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
