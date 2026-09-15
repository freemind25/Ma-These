// ═══════════════════════════════════════════════════
// Ma Thèse — LibreTranslate Proxy API
// Proxies translation requests to LibreTranslate instances
// ═══════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";

/** LibreTranslate instances (free, no key required for basic use) */
const LIBRETRANSLATE_INSTANCES = [
  "https://libretranslate.de",
  "https://libretranslate.com",
  "https://translate.argosopentech.com",
];

/** Supported language codes */
const SUPPORTED_LANGUAGES: Record<string, string> = {
  fr: "Français",
  en: "English",
  de: "Deutsch",
  es: "Español",
  it: "Italiano",
  pt: "Português",
  nl: "Nederlands",
  pl: "Polski",
  ru: "Русский",
  zh: "中文",
  ja: "日本語",
  ko: "한국어",
  ar: "العربية",
  hi: "हिन्दी",
  tr: "Türkçe",
  sv: "Svenska",
  da: "Dansk",
  fi: "Suomi",
  no: "Norsk",
  el: "Ελληνικά",
  cs: "Čeština",
  ro: "Română",
  hu: "Magyar",
  uk: "Українська",
  id: "Bahasa Indonesia",
  vi: "Tiếng Việt",
  th: "ไทย",
};

export async function GET() {
  return NextResponse.json({ languages: SUPPORTED_LANGUAGES });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { q, source = "auto", target = "en", format = "text" } = body;

    if (!q || typeof q !== "string" || q.trim().length === 0) {
      return NextResponse.json(
        { error: "Le texte à traduire est requis" },
        { status: 400 }
      );
    }

    if (q.length > 50_000) {
      return NextResponse.json(
        { error: "Le texte est trop long (max 50 000 caractères)" },
        { status: 400 }
      );
    }

    if (!SUPPORTED_LANGUAGES[target]) {
      return NextResponse.json(
        { error: `Langue cible non supportée: ${target}` },
        { status: 400 }
      );
    }

    // Try each instance in order until one works
    let lastError = "";
    for (const baseUrl of LIBRETRANSLATE_INSTANCES) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30_000);

        const res = await fetch(`${baseUrl}/translate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q: q.trim(), source, target, format }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          return NextResponse.json({
            translatedText: data.translatedText,
            source: data.detectedLanguage?.language || source,
            confidence: data.detectedLanguage?.confidence,
          });
        }

        if (res.status === 429) {
          lastError = "Trop de requêtes (rate limit). Réessayez dans quelques secondes.";
          continue;
        }

        const errData = await res.json().catch(() => ({}));
        lastError = errData.error || `Erreur HTTP ${res.status}`;
      } catch (err) {
        lastError =
          err instanceof Error && err.name === "AbortError"
            ? "Délai d'attente dépassé (30s)"
            : "Instance indisponible";
        continue;
      }
    }

    return NextResponse.json({ error: lastError || "Aucune instance disponible" }, { status: 503 });
  } catch {
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
