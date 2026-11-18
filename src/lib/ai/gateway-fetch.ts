import https from "node:https";
import { Readable } from "node:stream";

// ═══════════════════════════════════════════════════════════════
// gatewayFetch — client HTTP unifié node:https pour les appels IA
// ═══════════════════════════════════════════════════════════════
//
// DEUX motivations mesurées :
//
// 1. Cloudflare (sondes 2026-10-31, codecraftapi.com) :
//   - fetch Node (undici) + User-Agent navigateur  => 403 « Just a moment… »
//   - node:https classique (MÊME stack TLS OpenSSL) + même UA => 401 JSON
//   - curl h1/h2 + même UA => 401 JSON
//   La règle Cloudflare empreinte la présentation HTTP du client undici
//   lui-même — node:https contourne l'empreinte.
//
// 2. Stabilité inter-runtime (2026-11) : en dev Tauri (`tauri dev`), le
//   serveur Next tourne sous BUN et le fetch global est celui de Bun. Sur
//   les appels LLM (corps JSON de dizaines de ko, réponses longues), Bun
//   fetch produit des coupures « Error in input stream » qui interrompent
//   le pipeline Article→Code en pleine génération. node:https (couche de
//   compat Node de Bun + Node réel en build standalone) est stable sur les
//   deux runtimes — tous les appels IA https passent donc par lui.
//
// La réponse est reconstruite en Response WHATWG (body = Readable.toWeb)
// pour rester compatible avec tous les appels existants : .ok/.status/
// .statusText/.json()/.text()/.body.getReader().
//
// Les corps non-string (FormData, streams) ne sont pas gérés par la voie
// node:https : repli sur le fetch global (aucun appelant IA actuel n'en
// utilise — garde-fou pour les usages futurs).
// ═══════════════════════════════════════════════════════════════

/**
 * Drop-in fetch pour les appels IA côté serveur : signature identique à
 * fetch(url, init). Tout https passe par node:https (stabilité undici/Bun),
 * le fetch global ne sert qu'aux cas non couverts (http local, corps non
 * string).
 */
export async function gatewayFetch(
  _provider: string | undefined,
  url: string,
  init?: RequestInit,
): Promise<Response> {
  // Corps non gérable par node:https → fetch global (aucun usage actuel).
  if (init?.body != null && typeof init.body !== "string") {
    return fetch(url, init);
  }
  if (!url.startsWith("https://")) {
    return fetch(url, init);
  }
  return nodeHttpsFetch(url, init);
}

async function nodeHttpsFetch(url: string, init?: RequestInit): Promise<Response> {
  const u = new URL(url);
  const headers = new Headers(init?.headers);
  // node:https ne décompresse pas automatiquement (contrairement à undici) :
  // on retire accept-encoding pour recevoir du contenu brut, sans gestion
  // de décompression.
  headers.delete("accept-encoding");
  const headerRecord: Record<string, string> = {};
  headers.forEach((value, key) => {
    headerRecord[key] = value;
  });

  const method = (init?.method || "GET").toUpperCase();
  const body = typeof init?.body === "string" ? init.body : undefined;
  if (body && method !== "GET" && method !== "HEAD" && !headerRecord["content-length"]) {
    headerRecord["content-length"] = String(Buffer.byteLength(body, "utf8"));
  }

  return new Promise<Response>((resolve, reject) => {
    const req = https.request(
      {
        hostname: u.hostname,
        port: u.port || undefined,
        path: u.pathname + u.search,
        method,
        headers: headerRecord,
      },
      (res) => {
        const status = res.statusCode || 502;
        const resHeaders = new Headers();
        for (const [key, value] of Object.entries(res.headers)) {
          if (value == null) continue;
          resHeaders.set(key, Array.isArray(value) ? value.join(", ") : String(value));
        }
        const webBody = Readable.toWeb(res) as unknown as ReadableStream<Uint8Array>;
        resolve(new Response(webBody, { status, statusText: res.statusMessage || "", headers: resHeaders }));
      },
    );
    req.on("error", reject);
    const signal = init?.signal;
    if (signal) {
      if (signal.aborted) {
        req.destroy(new Error("aborted"));
      } else {
        signal.addEventListener("abort", () => req.destroy(new Error("aborted")), { once: true });
      }
    }
    if (body) req.write(body);
    req.end();
  });
}
