// ═══════════════════════════════════════════════════════════════
// Ma Thèse — Client Scholar Sidekick (v1.10.23)
// API REST publique gratuite : https://scholar-sidekick.com
// Anti-hallucination bibliographique (verify/audit), formatage CSL
// (10 000+ styles), détection d'identifiants, lookup, export.
// Serveur uniquement — jamais importer côté client.
//
// Taux de gratuité (usage léger, sans clé) : les endpoints audit
// plafonnent à 25 entrées par appel → découpage en lots ici.
// ═══════════════════════════════════════════════════════════════

import { SCHOLARLY_UA } from "./http";

const SS_BASE = "https://scholar-sidekick.com";

/** Entrées max par appel /api/audit (limite upstream, silencieusement tronquée au-delà) */
const AUDIT_MAX_ENTRIES_PER_CALL = 25;
/** Lots audit max par requête (12 × 25 = 300 références) — au-delà : marquées tronquées */
const AUDIT_MAX_CHUNKS = 12;
/** Fenêtre max pour /api/detect (limite upstream 10 000 chars) */
const DETECT_WINDOW = 9_500;
/** Fenêtres detect max par requête (12 × 9 500 ≈ 114 000 chars) */
const DETECT_MAX_WINDOWS = 12;

// ── Erreur propagée ──

export class ScholarSidekickError extends Error {
  status?: number;
  code?: string;
  requestId?: string;

  constructor(message: string, status?: number, code?: string, requestId?: string) {
    super(message);
    this.name = "ScholarSidekickError";
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

/** POST/GET JSON vers Scholar Sidekick — ScholarSidekickError si HTTP != 2xx, timeout ou réseau. */
async function ssFetchJson<T>(
  path: string,
  options: { method?: "GET" | "POST"; body?: unknown; timeoutMs?: number } = {}
): Promise<T> {
  const { method = "POST", body, timeoutMs = 30_000 } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${SS_BASE}${path}`, {
      method,
      signal: controller.signal,
      headers: {
        "User-Agent": SCHOLARLY_UA,
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json || json.ok === false) {
      const err = json && typeof json === "object" ? json : {};
      throw new ScholarSidekickError(
        typeof err.error === "string" ? err.error : `HTTP ${res.status}`,
        res.status,
        typeof err.code === "string" ? err.code : undefined,
        typeof err.requestId === "string" ? err.requestId : undefined
      );
    }
    return json as T;
  } catch (err) {
    if (err instanceof ScholarSidekickError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new ScholarSidekickError(`Timeout ${timeoutMs} ms — Scholar Sidekick injoignable`);
    }
    throw new ScholarSidekickError(
      err instanceof Error ? err.message : "Erreur réseau Scholar Sidekick"
    );
  } finally {
    clearTimeout(timer);
  }
}

// ── Types partagés (réponses upstream normalisées) ──

export interface SsAuthor {
  family?: string;
  given?: string;
}

export interface SsRecord {
  id?: string;
  type?: string;
  title?: string;
  authors?: SsAuthor[];
  container?: { title?: string; abbreviated?: string; volume?: string; issue?: string };
  url?: string;
  issued?: { year?: number };
  pages?: { first?: string; last?: string };
  identifiers?: { type: string; value: string }[];
  [key: string]: unknown;
}

// ═══ Verify — détection de fabrication (DOI réel + titre inventé) ═══

export interface SsVerifyRequest {
  title: string;
  doi?: string;
  pmid?: string;
  pmcid?: string;
  isbn?: string;
  arxiv?: string;
  issn?: string;
  ads?: string;
  year?: number;
  container?: string;
  authors?: { family: string; given?: string }[];
}

export interface SsFieldMismatch {
  field?: string;
  claimed?: string;
  resolved?: string;
  [key: string]: unknown;
}

export interface SsVerifyResponse {
  ok: true;
  verdict: "matched" | "mismatch" | "ambiguous" | "not_found";
  confidence?: string;
  matched?: SsRecord;
  mismatches?: SsFieldMismatch[];
  candidates?: SsRecord[];
  claimed?: unknown;
  _provenance?: Record<string, unknown>;
}

export async function verifyCitation(claimed: SsVerifyRequest, timeoutMs = 25_000): Promise<SsVerifyResponse> {
  return ssFetchJson<SsVerifyResponse>("/api/verify", { body: { claimed }, timeoutMs });
}

// ═══ Audit — bibliographie complète (lots de 25) ═══

export interface SsAuditEntry {
  index?: number;
  sourceKey?: string;
  status?: string;
  verdict?: "matched" | "mismatch" | "ambiguous" | "not_found";
  confidence?: string;
  matched?: SsRecord | null;
  mismatches?: SsFieldMismatch[];
  candidates?: SsRecord[];
  retraction?: {
    checked?: boolean;
    doi?: string;
    isRetracted?: boolean;
    hasCorrections?: boolean;
    hasConcern?: boolean;
    notices?: { label?: string; url?: string; [key: string]: unknown }[];
  };
  _provenance?: Record<string, unknown>;
  /** Texte brut de la référence (injecté par notre client lors du découpage) */
  raw?: string;
}

export interface SsAuditSummary {
  total: number;
  matched: number;
  mismatch: number;
  ambiguous: number;
  not_found: number;
  not_checked: number;
  errored: number;
  retracted: number;
}

export interface SsAuditResponse {
  ok: boolean;
  format?: string | null;
  entries?: SsAuditEntry[];
  parseErrors?: unknown[];
  truncated?: number;
  summary?: Partial<SsAuditSummary>;
}

export interface SsAuditMerged {
  ok: true;
  format: string | null;
  entries: SsAuditEntry[];
  parseErrors: string[];
  /** Références au-delà de la capacité (300) ou tronquées par l'API */
  truncated: number;
  summary: SsAuditSummary;
  /** Nombre total de références détectées dans l'entrée */
  totalRefs: number;
  /** Nombre de références effectivement auditées */
  auditedRefs: number;
}

const EMPTY_SUMMARY: SsAuditSummary = {
  total: 0, matched: 0, mismatch: 0, ambiguous: 0,
  not_found: 0, not_checked: 0, errored: 0, retracted: 0,
};

/**
 * Découpe une bibliographie (BibTeX, RIS, CSL-JSON ou texte brut) en blocs
 * unitaires (une référence par bloc) pour respecter le plafond de 25 entrées
 * par appel /api/audit.
 */
export function splitBibliographyBlocks(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  // BibTeX — une entrée commence par @type{ en début de ligne
  if (/^@\w+\s*\{/m.test(trimmed)) {
    const lines = trimmed.split(/\r?\n/);
    const blocks: string[] = [];
    let current: string[] = [];
    for (const line of lines) {
      if (/^@\w+\s*\{/.test(line) && current.length) {
        blocks.push(current.join("\n").trim());
        current = [line];
      } else {
        current.push(line);
      }
    }
    if (current.length) blocks.push(current.join("\n").trim());
    return blocks.filter((b) => b.length > 0);
  }

  // RIS — chaque enregistrement commence par TY-
  if (/^TY\s*-{1,2}\s*$/m.test(trimmed)) {
    return trimmed
      .split(/\r?\n(?=TY\s*-)/)
      .map((b) => b.trim())
      .filter(Boolean);
  }

  // CSL-JSON — tableau d'objets
  if (trimmed.startsWith("[")) {
    try {
      const arr = JSON.parse(trimmed) as unknown[];
      if (Array.isArray(arr)) return arr.map((x) => JSON.stringify(x));
    } catch {
      // parsing échoué → traitement en texte brut ci-dessous
    }
  }

  // Texte brut — blocs séparés par lignes vides, sinon une ligne = une référence
  const paraBlocks = trimmed
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
  if (paraBlocks.length > 1) return paraBlocks;
  return trimmed
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 3);
}

function addSummaries(a: SsAuditSummary, b: Partial<SsAuditSummary>): SsAuditSummary {
  return {
    total: a.total + (b.total ?? 0),
    matched: a.matched + (b.matched ?? 0),
    mismatch: a.mismatch + (b.mismatch ?? 0),
    ambiguous: a.ambiguous + (b.ambiguous ?? 0),
    not_found: a.not_found + (b.not_found ?? 0),
    not_checked: a.not_checked + (b.not_checked ?? 0),
    errored: a.errored + (b.errored ?? 0),
    retracted: a.retracted + (b.retracted ?? 0),
  };
}

/**
 * Audit complet d'une bibliographie avec découpage en lots ≤ 25 entrées.
 * Les réponses sont fusionnées (entries ré-indexées 1..n, summaries additionnés).
 */
export async function auditBibliography(
  bibliography: string,
  options: { format?: "bibtex" | "ris" | "csl-json"; timeoutMs?: number } = {}
): Promise<SsAuditMerged> {
  const { format, timeoutMs = 90_000 } = options;
  const blocks = splitBibliographyBlocks(bibliography);
  const totalRefs = blocks.length;

  const chunks: string[][] = [];
  for (let i = 0; i < blocks.length; i += AUDIT_MAX_ENTRIES_PER_CALL) {
    chunks.push(blocks.slice(i, i + AUDIT_MAX_ENTRIES_PER_CALL));
    if (chunks.length >= AUDIT_MAX_CHUNKS) break;
  }
  const dropped = totalRefs - chunks.reduce((acc, c) => acc + c.length, 0);

  const entries: SsAuditEntry[] = [];
  let parseErrors: string[] = [];
  let summary = EMPTY_SUMMARY;
  let truncatedByApi = 0;
  let detectedFormat: string | null = null;
  let auditedRefs = 0;

  for (let i = 0; i < chunks.length; i++) {
    const chunkText = chunks[i].join("\n\n");
    // Injecte la référence brute dans chaque entrée (affichage UI)
    const res = await ssFetchJson<SsAuditResponse>("/api/audit", {
      body: { bibliography: chunkText, ...(format ? { format } : {}) },
      timeoutMs,
    });
    if (i === 0) detectedFormat = res.format ?? null;
    const chunkEntries = res.entries ?? [];
    auditedRefs += chunkEntries.length;
    for (const entry of chunkEntries) {
      entry.raw = chunks[i][entry.index && entry.index > 0 ? entry.index - 1 : 0];
      entry.index = entries.length + 1;
      entries.push(entry);
    }
    if (res.parseErrors?.length) {
      parseErrors = parseErrors.concat(res.parseErrors.map((e) => String(e)));
    }
    truncatedByApi += res.truncated ?? 0;
    summary = addSummaries(summary, res.summary ?? {});
    // Petit délai entre lots — usage léger anonyme, rester courtois
    if (i < chunks.length - 1) await new Promise((r) => setTimeout(r, 250));
  }

  return {
    ok: true,
    format: detectedFormat,
    entries,
    parseErrors,
    truncated: truncatedByApi + dropped,
    summary,
    totalRefs,
    auditedRefs,
  };
}

// ═══ Format — citation formatée dans n'importe quel style CSL ═══

export interface SsFormatResponse {
  ok: true;
  styleUsed?: string;
  items?: SsRecord[];
  html?: string;
  text?: string;
  warnings?: unknown[];
  meta?: Record<string, unknown>;
  [key: string]: unknown;
}

export async function formatCitations(
  body: { text: string; style?: string; lang?: string; output?: "text" | "html" | "json" },
  timeoutMs = 30_000
): Promise<SsFormatResponse> {
  return ssFetchJson<SsFormatResponse>("/api/format", { body, timeoutMs });
}

// ═══ Export — BibTeX, RIS, CSL-JSON, EndNote XML, CSV… ═══

export async function exportCitations(
  body: { text: string; format: "txt" | "ris" | "bibtex" | "csl-json" | "endnote-xml" | "endnote-refer" | "refworks" | "nbib" | "rdf" | "csv" },
  timeoutMs = 30_000
): Promise<SsFormatResponse> {
  return ssFetchJson<SsFormatResponse>("/api/export", { body, timeoutMs });
}

// ═══ Styles CSL — recherche paginée parmi 10 000+ styles ═══

export interface SsCslStyle {
  id: string;
  title: string;
  titleShort?: string;
  categories?: string[];
  bundled?: boolean;
  engineSupported?: boolean;
}

export interface SsStylesResponse {
  ok: true;
  styles: SsCslStyle[];
  total?: number;
  offset?: number;
  limit?: number;
  [key: string]: unknown;
}

export async function searchCslStyles(
  q: string,
  limit = 50,
  offset = 0,
  timeoutMs = 15_000
): Promise<SsStylesResponse> {
  const params = new URLSearchParams({ q, limit: String(limit), offset: String(offset) });
  return ssFetchJson<SsStylesResponse>(`/api/csl/styles?${params.toString()}`, { method: "GET", timeoutMs });
}

// ═══ Detect — identifiants académiques dans du texte libre ═══

export interface SsIdentifier {
  type: string;
  value: string;
}

export interface SsDetectResponse {
  ok: true;
  count: number;
  identifiers: SsIdentifier[];
}

/**
 * Découpe un long texte en fenêtres ≤ 9 500 chars (coupe aux frontières de
 * paragraphe/phrase) puis déduplique les identifiants détectés.
 */
export async function detectIdentifiers(text: string, timeoutMs = 30_000): Promise<SsDetectResponse> {
  const clean = text.trim();
  if (!clean) return { ok: true, count: 0, identifiers: [] };

  const windows: string[] = [];
  if (clean.length <= DETECT_WINDOW) {
    windows.push(clean);
  } else {
    let rest = clean;
    for (let i = 0; i < DETECT_MAX_WINDOWS && rest.length > 0; i++) {
      if (rest.length <= DETECT_WINDOW) {
        windows.push(rest);
        break;
      }
      // Coupe aux dernières frontières de phrase/paragraphe dans la fenêtre
      let cut = rest.lastIndexOf("\n", DETECT_WINDOW);
      if (cut < DETECT_WINDOW * 0.5) cut = rest.lastIndexOf(". ", DETECT_WINDOW);
      if (cut < DETECT_WINDOW * 0.5) cut = DETECT_WINDOW;
      windows.push(rest.slice(0, cut + 1));
      rest = rest.slice(cut + 1);
    }
  }

  const seen = new Set<string>();
  const identifiers: SsIdentifier[] = [];
  for (const win of windows) {
    if (!win.trim()) continue;
    const res = await ssFetchJson<SsDetectResponse>("/api/detect", { body: { text: win }, timeoutMs });
    for (const id of res.identifiers ?? []) {
      const key = `${id.type}:${id.value.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        identifiers.push(id);
      }
    }
  }
  return { ok: true, count: identifiers.length, identifiers };
}

// ═══ Lookup — résolution d'un identifiant vers les métadonnées ═══

export interface SsLookupResponse {
  ok: true;
  input: { type: string; value: string };
  result: SsRecord | null;
}

export async function lookupIdentifier(id: string, timeoutMs = 20_000): Promise<SsLookupResponse> {
  return ssFetchJson<SsLookupResponse>("/api/lookup", { body: { id }, timeoutMs });
}
