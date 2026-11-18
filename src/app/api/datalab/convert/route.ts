// ═══════════════════════════════════════════════════════════════
// Ma Thèse — POST /api/datalab/convert
// Proxy serveur Datalab Convert : document (PDF/DOCX/PPTX/XLSX/…)
// → Markdown layout-aware (multi-colonnes, tables, titres, formules).
// Clé résolue côté serveur (cookie httpOnly → env). Sans clé : 403
// lisible — les appelants conservent leur fallback local.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import {
  resolveDatalabApiKey,
} from "@/lib/datalab/config";
import {
  DATALAB_ACCEPTED_TYPES,
  DatalabError,
  datalabConvert,
} from "@/lib/datalab/client";

export const runtime = "nodejs";

/** Plafond transport maison (proxyClientMaxBodySize 64 Mo, marge en-têtes). */
const MAX_BYTES = 50 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const apiKey = resolveDatalabApiKey(request);
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Aucune clé Datalab configurée — ajoutez-la dans Paramètres → Datalab (gratuit : 10-20 $ de crédits mensuels).",
          code: "NO_KEY",
        },
        { status: 403 }
      );
    }

    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > MAX_BYTES + 1024 * 1024) {
      return NextResponse.json(
        {
          error: `Fichier trop volumineux : ${(contentLength / 1024 / 1024).toFixed(1)} Mo reçus (maximum ${MAX_BYTES / 1024 / 1024} Mo).`,
        },
        { status: 413 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Aucun fichier reçu (champ « file »)." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `Fichier trop volumineux : ${(file.size / 1024 / 1024).toFixed(1)} Mo (maximum ${MAX_BYTES / 1024 / 1024} Mo).` },
        { status: 413 }
      );
    }

    const modeRaw = formData.get("mode");
    const mode =
      modeRaw === "lite" || modeRaw === "fast" || modeRaw === "balanced" || modeRaw === "accurate"
        ? modeRaw
        : "fast";
    const pageRangeRaw = formData.get("page_range");
    const pageRange = typeof pageRangeRaw === "string" && pageRangeRaw.trim() ? pageRangeRaw.trim() : undefined;

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await datalabConvert(apiKey, { name: file.name, type: file.type, buffer }, {
      mode,
      pageRange,
      signal: request.signal,
    });

    return NextResponse.json({
      data: {
        text: result.markdown,
        pages: result.pages,
        chars: result.markdown.length,
        mode,
        engine: "datalab",
        version: result.version,
      },
    });
  } catch (error) {
    if (error instanceof DatalabError) {
      console.error("[POST /api/datalab/convert] Upstream:", error.code, error.message);
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status === 401 || error.status === 402 || error.status === 429 ? error.status : 502 }
      );
    }
    console.error("[POST /api/datalab/convert] Error:", error);
    return NextResponse.json({ error: "Erreur lors de la conversion Datalab" }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ data: { accepted: DATALAB_ACCEPTED_TYPES, modes: ["lite", "fast", "balanced", "accurate"] } });
}
