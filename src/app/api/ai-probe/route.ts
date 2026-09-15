import { NextResponse } from "next/server";
import {
  type AiProviderId,
  getProviderLabel,
  ALL_PROVIDER_IDS,
} from "@/lib/ai/ai-types";
import { getBaseUrl, getProviderExtraHeaders } from "@/lib/ai/ai-provider";

// ═══════════════════════════════════════════════════════════════
// GET /api/ai-probe — Teste SEULEMENT les fournisseurs avec clé configurée
// Les clés sont lues depuis process.env (.env)
// ═══════════════════════════════════════════════════════════════

const ENV_KEYS: Record<string, string[]> = {
  google: ["GOOGLE_API_KEY", "GEMINI_API_KEY"],
  groq: ["GROQ_API_KEY"],
  cerebras: ["CEREBRAS_API_KEY"],
  openrouter: ["OPENROUTER_API_KEY"],
  github: ["GITHUB_MODELS_TOKEN", "GITHUB_TOKEN"],
  nvidia: ["NVIDIA_API_KEY"],
  cohere: ["COHERE_API_KEY"],
  huggingface: ["HUGGINGFACE_API_KEY", "HF_TOKEN"],
  siliconflow: ["SILICONFLOW_API_KEY"],
  pollinations: ["POLLINATIONS_API_KEY"],
  kilo: ["KILO_API_KEY"],
  routeway: ["ROUTEWAY_API_KEY"],
  ainative: ["AINATIVE_API_KEY"],
  aion: ["AION_API_KEY"],
  requesty: ["REQUESTY_API_KEY"],
  sealion: ["SEALION_API_KEY"],
  openai: ["OPENAI_API_KEY"],
  anthropic: ["ANTHROPIC_API_KEY"],
  mistral: ["MISTRAL_API_KEY"],
  routesme: ["ROUTESME_API_KEY"],
  kiraai: ["KIRA_API_KEY"],
  omniroute: ["OMNIROUTE_API_KEY"],
};

const TEST_MODELS: Record<string, string> = {
  google: "gemini-2.5-flash",
  groq: "llama-3.3-70b-versatile",
  cerebras: "llama-3.3-70b",
  openrouter: "z-ai/glm-5.2:free",
  github: "openai/gpt-4.1-mini",
  nvidia: "meta/llama-3.3-70b-instruct",
  cohere: "command-r",
  siliconflow: "Qwen/Qwen3-8B",
  pollinations: "openai",
  kilo: "auto",
  routeway: "auto:free",
  openai: "gpt-4o-mini",
  anthropic: "claude-3-haiku-20240307",
  mistral: "mistral-small-latest",
  kiraai: "kira-3.5-pro",
  omniroute: "auto",
};

function getEnvKey(provider: string): string | undefined {
  const vars = ENV_KEYS[provider];
  if (!vars) return undefined;
  for (const v of vars) {
    const val = process.env[v];
    if (val && val.length > 3) return val;
  }
  return undefined;
}

async function probe(providerId: string, apiKey: string) {
  const baseUrl = getBaseUrl(providerId as AiProviderId);
  if (!baseUrl) return { status: "skip" as const, msg: "Pas d'URL" };

  const model = TEST_MODELS[providerId] || "gpt-4o-mini";
  const url = `${baseUrl}/chat/completions`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  headers["Authorization"] = `Bearer ${apiKey}`;
  Object.assign(headers, getProviderExtraHeaders(providerId as AiProviderId));

  const t0 = Date.now();
  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ model, max_tokens: 15, messages: [{ role: "user", content: "Réponds juste OK" }] }),
      signal: AbortSignal.timeout(15000),
    });
    const ms = Date.now() - t0;

    if (!res.ok) {
      let err = await res.text().catch(() => "?");
      try { const j = JSON.parse(err); err = (j as any).error?.message || (j as any).message || err; } catch {}
      return { status: "error" as const, ms, msg: `(${res.status}) ${String(err).slice(0, 120)}` };
    }

    const data = (await res.json()) as any;
    const content = data.choices?.[0]?.message?.content || "";
    return { status: "ok" as const, ms, model: data.model || model, response: content.slice(0, 60) };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { status: "timeout" as const, ms: Date.now() - t0, msg: msg.slice(0, 80) };
  }
}

export async function GET() {
  // Collect providers that have a key configured
  const toTest: Array<{ id: string; key: string }> = [];
  const noKey: Array<{ id: string; label: string }> = [];

  for (const id of ALL_PROVIDER_IDS) {
    if (id === "zai") {
      noKey.push({ id, label: getProviderLabel(id) });
      continue;
    }
    const key = getEnvKey(id);
    if (key) {
      toTest.push({ id, key });
    } else {
      noKey.push({ id, label: getProviderLabel(id) });
    }
  }

  // Test all configured providers in parallel
  const results = await Promise.all(
    toTest.map(async ({ id, key }) => {
      const test = await probe(id, key);
      return { id, label: getProviderLabel(id as AiProviderId), hasKey: true, test };
    })
  );

  return NextResponse.json({
    tested: results.length,
    notConfigured: noKey.map(n => ({ id: n.id, label: n.label })),
    results,
  });
}