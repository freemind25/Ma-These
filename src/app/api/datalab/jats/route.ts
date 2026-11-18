// ═══════════════════════════════════════════════════════════════
// Ma Thèse — POST /api/datalab/jats
// Proxy serveur du processeur publié « jats » (POST /api/v1/agent) :
// article scientifique PDF → JATS 1.2 Journal-Publishing XML avec
// verdict de vérification (PASS/FAIL) et métriques détaillées.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { resolveDatalabApiKey } from "@/lib/datalab/config";
import { DatalabError, datalabJats } from "@/lib/datalab/client";

export const runtime = "nodejs";

const MAX_BYTES = 50 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const apiKey = resolveDatalabApiKey(request);
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Aucune clé Datalab configurée — ajoutez-la dans Paramètres → Datalab.",
          code: "NO_KEY",
        },
        { status: 403 }
      );
    }

    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > MAX_BYTES + 1024 * 1024) {
      return NextResponse.json(
        { error: `Fichier trop volumineux : ${(contentLength / 1024 / 1024).toFixed(1)} Mo reçus (maximum ${MAX_BYTES / 1024 / 1024} Mo).` },
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
    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".pdf") && file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Le processeur JATS accepte uniquement un fichier PDF." },
        { status: 415 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await datalabJats(apiKey, { name: file.name, type: file.type, buffer }, {
      signal: request.signal,
    });

    return NextResponse.json({
      data: {
        jatsXml: result.jatsXml,
        verdict: result.verdict,
        finished: result.finished,
        verifierMetrics: result.verifierMetrics,
        chars: result.jatsXml.length,
      },
    });
  } catch (error) {
    if (error instanceof DatalabError) {
      console.error("[POST /api/datalab/jats] Upstream:", error.code, error.message);
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status === 401 || error.status === 402 || error.status === 429 ? error.status : 502 }
      );
    }
    console.error("[POST /api/datalab/jats] Error:", error);
    return NextResponse.json({ error: "Erreur lors de la conversion JATS" }, { status: 500 });
  }
}
