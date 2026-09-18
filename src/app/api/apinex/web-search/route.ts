import { NextRequest, NextResponse } from "next/server";
import {
  APINEX_BASE_URL,
  getApinexApiKey,
  extractApinexError,
} from "@/lib/apinex/apinex-client";

export const dynamic = "force-dynamic";

interface WebSearchBody {
  query?: string;
  count?: number;
}

/**
 * POST /api/apinex/web-search — proxy vers POST /v1/tools/web/search.
 * Bille ~600 tokens APInex par appel (échoue si solde insuffisant).
 */
export async function POST(req: NextRequest) {
  const key = getApinexApiKey();
  if (!key) {
    return NextResponse.json(
      { error: { message: "APINEX_API_KEY manquante côté serveur", type: "config_error" } },
      { status: 500 }
    );
  }

  let body: WebSearchBody;
  try {
    body = (await req.json()) as WebSearchBody;
  } catch {
    return NextResponse.json(
      { error: { message: "JSON invalide", type: "invalid_request_error" } },
      { status: 400 }
    );
  }

  const query = typeof body.query === "string" ? body.query.trim() : "";
  if (!query) {
    return NextResponse.json(
      { error: { message: "Champ requis : query", type: "invalid_request_error" } },
      { status: 400 }
    );
  }
  const count =
    typeof body.count === "number" && body.count >= 1 && body.count <= 10
      ? Math.floor(body.count)
      : 5;

  try {
    const upstream = await fetch(`${APINEX_BASE_URL}/v1/tools/web/search`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, count }),
      cache: "no-store",
    });

    const payload = (await upstream.json().catch(() => null)) as unknown;

    if (!upstream.ok) {
      const { message, type } = extractApinexError(payload);
      return NextResponse.json(
        { error: { message, type } },
        { status: upstream.status >= 400 ? upstream.status : 502 }
      );
    }

    return NextResponse.json({ ok: true, data: payload });
  } catch (err) {
    return NextResponse.json(
      {
        error: {
          message: err instanceof Error ? err.message : "Upstream injoignable",
          type: "network_error",
        },
      },
      { status: 502 }
    );
  }
}
