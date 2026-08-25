import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { THESES_FR_DETAIL, THESES_FR_BUTTONS } from "@/lib/theses-fr/types";

const querySchema = z.object({
  id: z.string().min(1),
});

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const parsed = querySchema.safeParse({ id: sp.get("id") });
    if (!parsed.success) {
      return NextResponse.json({ error: "Identifiant de thèse requis" }, { status: 400 });
    }
    const { id } = parsed.data;

    // Fetch thesis detail + access buttons in parallel
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const [detailRes, buttonsRes] = await Promise.allSettled([
      fetch(`${THESES_FR_DETAIL}${encodeURIComponent(id)}`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      }),
      fetch(`${THESES_FR_BUTTONS}${encodeURIComponent(id)}`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      }),
    ]);

    clearTimeout(timeout);

    let these: unknown = null;
    let boutons: unknown = null;

    if (detailRes.status === "fulfilled" && detailRes.value.ok) {
      these = await detailRes.value.json();
    }
    if (buttonsRes.status === "fulfilled" && buttonsRes.value.ok) {
      boutons = await buttonsRes.value.json();
    }

    return NextResponse.json({ data: { these, boutons } });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return NextResponse.json({ error: "Délai d'attente dépassé" }, { status: 504 });
    }
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
