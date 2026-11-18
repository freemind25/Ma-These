// ═══════════════════════════════════════════════════════════════
// ThesisFrame — Client Datalab (server-side only)
// Fournisseur documentaire datalab.to : Convert (PDF/DOCX/… →
// Markdown), Extract (schéma JSON + citations + confiance par
// champ), Agent JATS (article → JATS 1.2 XML + verdict).
//
// API REST (https://www.datalab.to) — authentification X-API-Key.
// Le flux est asynchrone : POST → { request_check_url } puis polling
// jusqu'à status=complete, téléchargement du result_url final.
// Erreurs documentées : 401 clé invalide, 402 crédits épuisés
// (X-Datalab-Error-Code: allowance_exhausted), 429 rate limit
// (free tier : 10 req/min, 5 concurrents), 200 MB / 7 000 pages max.
// ═══════════════════════════════════════════════════════════════

/** Erreur Datalab normalisée (code machine + message lisible FR). */
export class DatalabError extends Error {
  code: string;
  status: number;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "DatalabError";
    this.status = status;
    this.code = code ?? "DATALAB_ERROR";
  }
}

const DATALAB_BASE_URL = "https://www.datalab.to";

/** Types de fichiers acceptés par Datalab (200 Mo max). */
export const DATALAB_ACCEPTED_TYPES =
  ".pdf,.doc,.docx,.odt,.ppt,.pptx,.xls,.xlsx,.xlsm,.csv,.ods,.html,.epub,.png,.jpg,.jpeg,.webp,.gif";

export interface DatalabFile {
  name: string;
  type: string; // MIME
  buffer: Buffer;
}

// ───────────────────────────────────────────────────────────────
// Soumission + polling (flux asynchrone commun aux 3 processeurs)
// ───────────────────────────────────────────────────────────────

interface DatalabInitialResponse {
  request_id?: string;
  request_check_url?: string;
  detail?: string;
}

interface DatalabPollResponse {
  status?: string; // processing | complete | failed
  success?: boolean;
  error?: string;
  result_url?: string | null;
  [key: string]: unknown;
}

/** Soumet un job (POST multipart) et renvoie l'URL de polling. */
async function submitDatalabJob(
  apiKey: string,
  path: string,
  form: FormData,
  signal?: AbortSignal
): Promise<string> {
  const res = await fetch(`${DATALAB_BASE_URL}${path}`, {
    method: "POST",
    headers: { "X-API-Key": apiKey },
    body: form,
    signal,
  });

  if (!res.ok) {
    const errCode = res.headers.get("X-Datalab-Error-Code");
    let detail = "";
    try {
      const body = (await res.json()) as { detail?: string };
      detail = body.detail ?? "";
    } catch {
      /* corps non JSON */
    }
    if (res.status === 401) {
      throw new DatalabError(
        "Clé Datalab invalide ou expirée — vérifiez Paramètres → Datalab.",
        401,
        "INVALID_KEY"
      );
    }
    if (res.status === 402 || errCode === "allowance_exhausted") {
      throw new DatalabError(
        "Crédits Datalab épuisés — ajoutez un moyen de paiement sur datalab.to/app/subscription ou attendez le renouvellement mensuel.",
        402,
        "ALLOWANCE_EXHAUSTED"
      );
    }
    if (res.status === 429) {
      throw new DatalabError(
        "Limite de requêtes Datalab atteinte (free tier : 10 requêtes/min) — réessayez dans quelques instants.",
        429,
        "RATE_LIMIT"
      );
    }
    throw new DatalabError(
      `Erreur Datalab (HTTP ${res.status})${detail ? ` : ${detail}` : ""}`,
      res.status,
      errCode ?? "HTTP_ERROR"
    );
  }

  const initial = (await res.json()) as DatalabInitialResponse;
  if (!initial.request_check_url) {
    throw new DatalabError(
      "Réponse Datalab inattendue : URL de suivi absente.",
      502,
      "NO_CHECK_URL"
    );
  }
  return initial.request_check_url;
}

/** Sonde un job : complete → télécharge result_url (URL pré-signée, sans header d'auth). */
async function pollDatalabJob(
  apiKey: string,
  checkUrl: string,
  opts: { timeoutMs: number; signal?: AbortSignal }
): Promise<DatalabPollResponse & { resultBody: Record<string, unknown> | null }> {
  const deadline = Date.now() + opts.timeoutMs;
  let delayMs = 600;
  let last: DatalabPollResponse | null = null;

  while (Date.now() < deadline) {
    if (opts.signal?.aborted) {
      throw new DatalabError("Requête annulée par l'utilisateur.", 499, "ABORTED");
    }
    let res: Response;
    try {
      res = await fetch(checkUrl, { headers: { "X-API-Key": apiKey }, signal: opts.signal });
    } catch (err) {
      if ((err as Error).name === "AbortError") throw err;
      throw new DatalabError(
        `Réseau indisponible pendant le suivi Datalab : ${(err as Error).message}`,
        503,
        "NETWORK"
      );
    }

    if (res.status === 401) {
      throw new DatalabError("Clé Datalab invalide ou expirée.", 401, "INVALID_KEY");
    }
    if (!res.ok) {
      throw new DatalabError(
        `Suivi Datalab en échec (HTTP ${res.status}).`,
        res.status,
        "POLL_ERROR"
      );
    }

    last = (await res.json()) as DatalabPollResponse;
    if (last.success === false || last.status === "failed") {
      throw new DatalabError(
        last.error || "Le traitement Datalab a échoué.",
        502,
        "JOB_FAILED"
      );
    }
    if (last.status === "complete") {
      if (last.result_url) {
        // result_url est pré-signé : téléchargement sans header d'auth (pattern doc officielle).
        const dl = await fetch(last.result_url, { signal: opts.signal });
        if (!dl.ok) {
          throw new DatalabError(
            `Téléchargement du résultat Datalab en échec (HTTP ${dl.status}).`,
            502,
            "RESULT_DOWNLOAD"
          );
        }
        const resultBody = (await dl.json()) as Record<string, unknown>;
        return { ...last, resultBody };
      }
      // Réponse réelle observée (essai clé réelle 2026-11, /api/v1/convert) :
      // certains endpoints omettent result_url et portent les données
      // directement dans le corps du poll (markdown, page_count, json…).
      return { ...last, resultBody: last as unknown as Record<string, unknown> };
    }
    // status === "processing" → attendre (progression géométrique plafonnée)
    await new Promise((r) => setTimeout(r, delayMs));
    delayMs = Math.min(delayMs * 1.25, 2_000);
  }
  throw new DatalabError(
    "Délai d'attente Datalab dépassé — le document est peut-être trop long ; réessayez ou réduisez la plage de pages.",
    504,
    "TIMEOUT"
  );
}

// ───────────────────────────────────────────────────────────────
// Convert — PDF/DOCX/… → Markdown
// ───────────────────────────────────────────────────────────────

export interface DatalabConvertResult {
  markdown: string;
  html?: string | null;
  pages?: number | null;
  success: boolean;
  version?: string | null;
  raw: Record<string, unknown>;
}

/**
 * Convertit un document en Markdown (layout-aware : multi-colonnes,
 * tables, titres). mode : lite | fast | balanced | accurate.
 */
export async function datalabConvert(
  apiKey: string,
  file: DatalabFile,
  opts: { mode?: "lite" | "fast" | "balanced" | "accurate"; pageRange?: string; timeoutMs?: number; signal?: AbortSignal } = {}
): Promise<DatalabConvertResult> {
  const form = new FormData();
  form.append(
    "file",
    new Blob([new Uint8Array(file.buffer)], { type: file.type || "application/octet-stream" }),
    file.name
  );
  form.append("mode", opts.mode ?? "fast");
  form.append("output_format", "markdown");
  if (opts.pageRange) form.append("page_range", opts.pageRange);

  const checkUrl = await submitDatalabJob(apiKey, "/api/v1/convert", form, opts.signal);
  const result = await pollDatalabJob(apiKey, checkUrl, {
    timeoutMs: opts.timeoutMs ?? 180_000,
    signal: opts.signal,
  });

  const body = (result.resultBody ?? {}) as Record<string, unknown>;
  const markdown =
    typeof body.markdown === "string" && body.markdown.length > 0
      ? body.markdown
      : typeof body.html === "string" && body.html.length > 0
        ? body.html
        : "";
  if (!markdown) {
    throw new DatalabError("Résultat Datalab Convert vide ou illisible.", 502, "EMPTY_RESULT");
  }
  const pages =
    typeof body.page_count === "number"
      ? body.page_count
      : typeof body.pages === "number"
        ? body.pages
        : null;
  const version = typeof body.version === "string" ? body.version : null;

  return {
    markdown,
    html: typeof body.html === "string" ? body.html : null,
    pages,
    success: true,
    version,
    raw: body,
  };
}

// ───────────────────────────────────────────────────────────────
// Extract — schéma JSON + citations + confiance (_score 1-5)
// ───────────────────────────────────────────────────────────────

export interface DatalabExtractResult {
  /** Valeurs extraites : les champs du schéma + clés système (_score, _meta…). */
  extracted: Record<string, unknown>;
  /** Moyenne des scores de confiance 1-5 (null si le scoring n'a pas abouti). */
  scoreAverage: number | null;
  raw: Record<string, unknown>;
}

/**
 * Extraction structurée : page_schema (JSON Schema stringifiée) rempli
 * depuis le document. extraction_mode : turbo (sans citations) | fast
 * (citations + _score automatique) | balanced | accurate (vérification).
 */
export async function datalabExtract(
  apiKey: string,
  file: DatalabFile,
  opts: {
    pageSchema: string;
    extractionMode?: "turbo" | "fast" | "balanced" | "accurate";
    pageRange?: string;
    timeoutMs?: number;
    signal?: AbortSignal;
  }
): Promise<DatalabExtractResult> {
  const form = new FormData();
  form.append(
    "file",
    new Blob([new Uint8Array(file.buffer)], { type: file.type || "application/pdf" }),
    file.name
  );
  form.append("page_schema", opts.pageSchema);
  form.append("extraction_mode", opts.extractionMode ?? "fast");
  form.append("mode", "fast");
  if (opts.pageRange) form.append("page_range", opts.pageRange);

  const checkUrl = await submitDatalabJob(apiKey, "/api/v1/extract", form, opts.signal);
  // Le scoring (_score) est enrichi APRÈS le statut complete → on garde
  // un créneau supplémentaire sur la même URL tant que la moyenne est absente.
  const deadline = Date.now() + (opts.timeoutMs ?? 180_000);
  let last: Awaited<ReturnType<typeof pollDatalabJob>> | null = null;
  const currentUrl: string | null = checkUrl;

  while (currentUrl && Date.now() < deadline) {
    last = await pollDatalabJob(apiKey, currentUrl, {
      timeoutMs: deadline - Date.now(),
      signal: opts.signal,
    });
    const body = (last.resultBody ?? {}) as Record<string, unknown>;
    const avg =
      typeof body.extraction_score_average === "number" ? body.extraction_score_average : null;
    const hasSomeScore =
      avg !== null ||
      Object.keys(body).some(
        (k) => !k.startsWith("_") && body[k] && typeof body[k] === "object" && "_score" in (body[k] as object)
      );
    if (avg !== null || hasSomeScore || opts.extractionMode === "turbo") break;
    // Résultat complet sans scores : re-poll de grâce jusqu'à 10 s
    if (deadline - Date.now() < 10_000) break;
    await new Promise((r) => setTimeout(r, 1_500));
  }

  const merged = { ...(last?.resultBody ?? {}), ...stripNull(last ?? {}) };
  let extracted: Record<string, unknown> = {};
  const rawJson = merged.extraction_schema_json;
  if (typeof rawJson === "string") {
    try {
      extracted = JSON.parse(rawJson) as Record<string, unknown>;
    } catch {
      throw new DatalabError("Extraction Datalab illisible (JSON invalide).", 502, "BAD_JSON");
    }
  } else if (rawJson && typeof rawJson === "object") {
    extracted = rawJson as Record<string, unknown>;
  } else if (Object.keys(merged).length > 0) {
    // Certaines réponses placent directement les champs au premier niveau
    extracted = merged;
  }
  if (Object.keys(extracted).length === 0) {
    throw new DatalabError("Extraction Datalab vide.", 502, "EMPTY_RESULT");
  }
  const avg =
    typeof merged.extraction_score_average === "number" ? merged.extraction_score_average : null;

  return { extracted, scoreAverage: avg, raw: merged };
}

function stripNull(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== null && v !== undefined) out[k] = v;
  }
  return out;
}

// ───────────────────────────────────────────────────────────────
// Agent JATS — article scientifique → JATS 1.2 XML + verdict
// ───────────────────────────────────────────────────────────────

export interface DatalabJatsResult {
  jatsXml: string;
  verdict: string | null; // PASS | FAIL | …
  finished: boolean | null;
  verifierMetrics: Array<{
    name?: string;
    status?: string;
    severity?: string;
    details?: string;
  }> | null;
  raw: Record<string, unknown>;
}

/**
 * Processeur publié « jats » (POST /api/v1/agent) : convertit un
 * article PDF en JATS 1.2 Journal-Publishing XML avec un verdict de
 * vérification (PASS/FAIL) et des métriques détaillées.
 */
export async function datalabJats(
  apiKey: string,
  file: DatalabFile,
  opts: { timeoutMs?: number; signal?: AbortSignal } = {}
): Promise<DatalabJatsResult> {
  const form = new FormData();
  form.append(
    "file",
    new Blob([new Uint8Array(file.buffer)], { type: file.type || "application/pdf" }),
    file.name
  );
  form.append("processor", "jats");

  const checkUrl = await submitDatalabJob(apiKey, "/api/v1/agent", form, opts.signal);
  const result = await pollDatalabJob(apiKey, checkUrl, {
    timeoutMs: opts.timeoutMs ?? 300_000,
    signal: opts.signal,
  });

  const merged = { ...(result.resultBody ?? {}), ...stripNull(result) };
  const jatsXml =
    typeof merged.jats_xml === "string"
      ? merged.jats_xml
      : typeof merged.jatsXml === "string"
        ? merged.jatsXml
        : "";
  if (!jatsXml) {
    throw new DatalabError("Résultat JATS vide ou illisible.", 502, "EMPTY_RESULT");
  }
  const metricsRaw = merged.verifier_metrics;
  // Réponse réelle observée (essai clé réelle) : { id, status, details, severity } —
  // « name » est un alias de repli si l'API change de champ.
  const verifierMetrics = Array.isArray(metricsRaw)
    ? (metricsRaw as Array<Record<string, unknown>>).map((m) => ({
        name:
          typeof m.name === "string"
            ? m.name
            : typeof m.id === "string"
              ? m.id
              : undefined,
        status: typeof m.status === "string" ? m.status : undefined,
        severity: typeof m.severity === "string" ? m.severity : undefined,
        details: typeof m.details === "string" ? m.details : undefined,
      }))
    : null;

  return {
    jatsXml,
    verdict: typeof merged.verdict === "string" ? merged.verdict : null,
    finished: typeof merged.finished === "boolean" ? merged.finished : null,
    verifierMetrics,
    raw: merged,
  };
}
