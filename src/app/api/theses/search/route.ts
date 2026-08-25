import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  THESES_FR_SEARCH,
  buildFilterString,
  type TheseSortOption,
  type TheseSearchParams,
  type TheseSearchResponse,
} from "@/lib/theses-fr/types";

const querySchema = z.object({
  q: z.string().min(1, "La requête est requise").max(500),
  debut: z.coerce.number().int().min(0).max(10000).optional(),
  nombre: z.coerce.number().int().min(1).max(50).optional(),
  tri: z.enum(["dateDesc", "dateAsc", "auteursAsc", "auteursDesc", "disciplineAsc", "disciplineDesc"]).optional(),
  disciplines: z.string().optional(),
  langues: z.string().optional(),
  etablissements: z.string().optional(),
  statut: z.string().optional(),
  anneesMin: z.coerce.number().int().min(1985).max(2030).optional(),
  anneesMax: z.coerce.number().int().min(1985).max(2030).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const parsed = querySchema.safeParse(Object.fromEntries(sp.entries()));
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const p = parsed.data;

    // Build theses.fr URL
    const params = new URLSearchParams();
    params.set("q", p.q);
    if (p.debut !== undefined) params.set("debut", String(p.debut));
    if (p.nombre !== undefined) params.set("nombre", String(p.nombre));
    if (p.tri) params.set("tri", p.tri);

    // Build filter string
    const filterParts: string[] = [];
    if (p.disciplines) {
      p.disciplines.split(",").forEach((d) => filterParts.push(`discipline="${d.trim()}"`));
    }
    if (p.langues) {
      p.langues.split(",").forEach((l) => filterParts.push(`langues="${l.trim()}"`));
    }
    if (p.etablissements) {
      p.etablissements.split(",").forEach((e) => filterParts.push(`etabSoutenanceN="${e.trim()}"`));
    }
    if (p.statut) {
      p.statut.split(",").forEach((s) => filterParts.push(`status="${s.trim()}"`));
    }
    if (p.anneesMin) filterParts.push(`dateSoutenanceMin="${p.anneesMin}"`);
    if (p.anneesMax) filterParts.push(`dateSoutenanceMax="${p.anneesMax}"`);

    if (filterParts.length > 0) {
      params.set("filtres", `[${filterParts.join("&")}]`);
    }

    const url = `${THESES_FR_SEARCH}?${params.toString()}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "Accept": "application/json" },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json(
        { error: `theses.fr a répondu avec le statut ${res.status}` },
        { status: res.status }
      );
    }

    const data = (await res.json()) as TheseSearchResponse;
    return NextResponse.json({ data });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return NextResponse.json({ error: "Délai d'attente dépassé (theses.fr)" }, { status: 504 });
    }
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
