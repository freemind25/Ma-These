import { NextRequest, NextResponse } from "next/server";
import {
  APINEX_BASE_URL,
  getApinexApiKey,
  extractApinexError,
} from "@/lib/apinex/apinex-client";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatRequestBody {
  model?: string;
  messages?: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

const HEARTBEAT_INTERVAL_MS = 7000;

/**
 * POST /api/apinex/chat — proxy vers POST /v1/chat/completions.
 *
 * Streaming : la réponse HTTP (200 + en-têtes SSE) est émise IMMÉDIATEMENT,
 * avec des commentaires de battement de cœur (« : ping ») pendant l'attente
 * du premier token — APInex peut garder les en-têtes 30-60 s sur les modèles
 * gratuits, ce qui faisait expirer la passerelle (502) côté navigateur.
 * Les erreurs survenant après l'envoi des en-têtes voyagent dans le flux
 * sous forme d'événement SSE {"error": …}.
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
  if (typeof body.max_tokens === "number" && body.max_tokens >= 16) {
    upstreamBody.max_tokens = Math.min(Math.floor(body.max_tokens), 16384);
  }
  if (body.stream === true) {
    upstreamBody.stream_options = { include_usage: true };
  }

  // ── Mode non-streaming : comportement direct (inchangé) ──
  if (body.stream !== true) {
    try {
      const upstream = await fetch(`${APINEX_BASE_URL}/v1/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(upstreamBody),
        cache: "no-store",
      });
      if (!upstream.ok) {
        const payload = (await upstream.json().catch(() => null)) as unknown;
        const { message, type } = extractApinexError(payload);
        return NextResponse.json(
          { error: { message, type } },
          { status: upstream.status >= 400 ? upstream.status : 502 }
        );
      }
      const json = await upstream.json();
      return NextResponse.json(json);
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

  // ── Mode streaming : réponse immédiate + battements de cœur ──
  const encoder = new TextEncoder();

  const sseHeaders = {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  };

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const safeEnqueue = (chunk: string | Uint8Array) => {
        if (closed) return;
        try {
          controller.enqueue(
            typeof chunk === "string" ? encoder.encode(chunk) : chunk
          );
        } catch {
          closed = true;
        }
      };

      // Battement de cœur immédiat puis périodique : garde les proxys éveillés
      safeEnqueue(": ping\n\n");
      const heartbeat = setInterval(() => safeEnqueue(": ping\n\n"), HEARTBEAT_INTERVAL_MS);

      const finish = () => {
        if (heartbeat) clearInterval(heartbeat);
        if (!closed) {
          closed = true;
          try {
            controller.close();
          } catch {
            // déjà fermé
          }
        }
      };

      const sendSseError = (message: string, type: string, status?: number) => {
        safeEnqueue(
          `data: ${JSON.stringify({ error: { message, type, status } })}\n\n`
        );
        safeEnqueue("data: [DONE]\n\n");
      };

      try {
        const upstream = await fetch(`${APINEX_BASE_URL}/v1/chat/completions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify(upstreamBody),
          cache: "no-store",
        });

        if (!upstream.ok || upstream.body === null) {
          const payload = (await upstream.json().catch(() => null)) as unknown;
          const { message, type } = extractApinexError(payload);
          sendSseError(
            message,
            type,
            upstream.status >= 400 ? upstream.status : 502
          );
          finish();
          return;
        }

        const reader = upstream.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) safeEnqueue(value);
        }
        finish();
      } catch (err) {
        sendSseError(
          err instanceof Error ? err.message : "Upstream injoignable",
          "network_error"
        );
        finish();
      }
    },
  });

  return new Response(stream, { status: 200, headers: sseHeaders });
}
