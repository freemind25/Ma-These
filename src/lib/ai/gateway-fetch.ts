import https from "node:https";
import { Readable } from "node:stream";

// ═══════════════════════════════════════════════════════════════
// gatewayFetch — contournement du blocage Cloudflare du client undici
// ═══════════════════════════════════════════════════════════════
//
// Constat mesuré (sondes 2026-10-31, codecraftapi.com) :
//   - fetch Node (undici) + User-Agent navigateur  => 403 « Just a moment… »
//     (HTTP/1.1 ET HTTP/2, avec ou sans Accept/Accept-Encoding additionnels)
//   - node:https classique (MÊME stack TLS OpenSSL) + même UA => 401 JSON
//   - curl h1/h2 + même UA => 401 JSON
//   - undici npm + dispatcher allowH2 => 403
// La règle Cloudflare empreinte la présentation HTTP du client undici
// lui-même — ni l'User-Agent (indispensable mais insuffisante), ni le
// protocole, ni l'empreinte TLS ne sont discriminants.
//
// gatewayFetch route donc les appels vers les hôtes concernés via
// node:https, et laisse le fetch global pour tous les autres. La réponse
// est reconstruite en Response WHATWG (body = Readable.toWeb) pour rester
// compatible avec tous les appels existants : .ok/.status/.statusText/
// .json()/.text()/.body.getReader().
//
// La détection se fait par NOM D'HÔTE (pas par provider id) afin de couvrir
// aussi le canal « custom » pointant vers ces gateways.
// ═══════════════════════════════════════════════════════════════

/**
 * Hôtes dont la protection Cloudflare rejette la présentation undici.
 * Ajouter ici tout nouveau gateway constaté bloqué côté app (403 HTML
 * « Just a moment… » malgré l'UA).
 */
const UNDICI_BLOCKED_HOST_SUFFIXES = ["codecraftapi.com"];

export function hostNeedsNodeClient(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return UNDICI_BLOCKED_HOST_SUFFIXES.some(
      (s) => host === s || host.endsWith("." + s),
    );
  } catch {
    return false;
  }
}

/**
 * Drop-in fetch pour les appels IA côté serveur : signature identique à
 * fetch(url, init), route vers node:https pour les hôtes bloqués.
 * Le paramètre provider est conservé pour la lisibilité des appelants mais
 * la décision repose sur l'hôte de l'URL.
 */
export async function gatewayFetch(
  _provider: string | undefined,
  url: string,
  init?: RequestInit,
): Promise<Response> {
  if (!hostNeedsNodeClient(url) || !url.startsWith("https://")) {
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
