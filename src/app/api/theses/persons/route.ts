import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { THESES_FR_PERSONS } from "@/lib/theses-fr/types";

const querySchema = z.object({
  q: z.string().min(1, "La requête est requise").max(200),
  debut: z.coerce.number().int().min(0).max(5000).optional(),
  nombre: z.coerce.number().int().min(1).max(30).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const parsed = querySchema.safeParse(Object.fromEntries(sp.entries()));
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const p = parsed.data;

    const params = new URLSearchParams();
    params.set("q", p.q);
    if (p.debut !== undefined) params.set("debut", String(p.debut));
    if (p.nombre !== undefined) params.set("nombre", String(p.nombre));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(`${THESES_FR_PERSONS}?${params.toString()}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json(
        { error: `theses.fr a répondu avec le statut ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({ data });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return NextResponse.json({ error: "Délai dépassé" }, { status: 504 });
    }
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
