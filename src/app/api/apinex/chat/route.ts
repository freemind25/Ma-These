import { NextRequest, NextResponse } from "next/server";
import {
  APINEX_BASE_URL,
  getApinexApiKey,
  extractApinexError,
} from "@/lib/apinex/apinex-client";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatRequestBody {
  model?: string;
  messages?: ChatMessage[];
  temperature?: number;
  stream?: boolean;
}

/**
 * POST /api/apinex/chat — proxy vers POST /v1/chat/completions.
 * Supporte le streaming SSE (stream: true) et le mode non-streaming.
 * La clé API reste côté serveur uniquement.
 */
export async function POST(req: NextRequest) {
  const key = getApinexApiKey();
  if (!key) {
    return NextResponse.json(
      { error: { message: "APINEX_API_KEY manquante côté serveur", type: "config_error" } },
      { status: 500 }
    );
  }

  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json(
      { error: { message: "JSON invalide", type: "invalid_request_error" } },
      { status: 400 }
    );
  }

  const model = typeof body.model === "string" ? body.model : "";
  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (!model || messages.length === 0) {
    return NextResponse.json(
      { error: { message: "Champs requis : model, messages", type: "invalid_request_error" } },
      { status: 400 }
    );
  }

  const upstreamBody: Record<string, unknown> = {
    model,
    messages,
    stream: body.stream === true,
  };
  if (typeof body.temperature === "number") {
    upstreamBody.temperature = Math.min(Math.max(body.temperature, 0), 2);
  }
  if (body.stream === true) {
    upstreamBody.stream_options = { include_usage: true };
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${APINEX_BASE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Accept: body.stream === true ? "text/event-stream" : "application/json",
      },
      body: JSON.stringify(upstreamBody),
      cache: "no-store",
    });
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

  // Erreur upstream (auth, billing, validation…) : format OpenAI-compatible
  if (!upstream.ok || upstream.body === null) {
    let payload: unknown = null;
    try {
      payload = await upstream.json();
    } catch {
      payload = null;
    }
    const { message, type } = extractApinexError(payload);
    return NextResponse.json(
      { error: { message, type } },
      { status: upstream.status >= 400 ? upstream.status : 502 }
    );
  }

  if (body.stream !== true) {
    const json = await upstream.json();
    return NextResponse.json(json);
  }

  // ── Streaming : relais SSE tel quel ──
  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
