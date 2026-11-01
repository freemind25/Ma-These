// ═══════════════════════════════════════════════════════════════
// Ma Thèse — BnF / catalogue général (v1.10.18)
// Catalogue national français : livres, thèses, périodiques,
// manuscrits, partitions — absents des registres orientés article
// (Crossref, OpenAlex…). Indispensable pour une thèse francophone.
// API : SRU 1.2, recordSchema=dc (Dublin Core) — sans clé.
// Sondé le 2026-11-01 : HTTP 200 via Node fetch (undici) ;
// recordSchema=unimarc → diagnostic « Schéma inconnu » (dc requis).
// ═══════════════════════════════════════════════════════════════

import { scholarlyTextFetch } from "./http";

const BNF_SRU_BASE = "https://catalogue.bnf.fr/api/SRU";

export interface BnfRecord {
  /** ark:/12148/cb… — identifiant pérenne de la notice */
  ark: string;
  title?: string;
  authors: string[];
  year?: number;
  publisher?: string;
  /** Premier dc:type en français (livre, partition musicale, thèse…) */
  type?: string;
  url?: string;
}

// ── Helpers ──

/** Extrait le contenu de la première balise `<tag>…</tag>` (corps simple, pas de nested) */
function firstTag(xml: string, tag: string): string | undefined {
  const m = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  if (!m) return undefined;
  return m[1]
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function allTags(xml: string, tag: string): string[] {
  const out: string[] = [];
  const re = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    out.push(
      m[1]
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim()
    );
  }
  return out;
}

/**
 * Nettoie un créateur BnF : « Blet, Stéphane (1969-2022). Compositeur » → « Blet, Stéphane ».
 * Le rôle suit le dernier «. » et ne contient jamais de virgule (contrairement au nom) ;
 * une initiale isolée (« F » de « Smith, J. F. ») n'est pas un rôle.
 */
function cleanBnfAuthor(raw: string): string {
  let s = raw.replace(/\s*\([^)]*\)/g, ""); // dates (1969-2022), précisions
  const parts = s.split(". ").filter((p) => p.length > 0);
  if (parts.length > 1) {
    const last = parts[parts.length - 1].trim();
    // Les rôles BnF sont parfois doublés « Auteur du texte / Autrice du texte »
    const roleProbe = last.split(" / ")[0];
    const isRole = !roleProbe.includes(",") && !/^[A-Z]$/.test(roleProbe) && roleProbe.split(/\s+/).length <= 4;
    if (isRole) s = parts.slice(0, -1).join(". ");
  }
  return s.replace(/\.$/, "").trim();
}

/** Échappe une valeur pour une clause CQL entre guillemets */
function cqlValue(value: string): string {
  return value.replace(/["\\]/g, " ").replace(/\s+/g, " ").trim();
}

// ── API publique ──

/**
 * Recherche dans le catalogue BnF par titre (+ auteur optionnel — nom de famille seul
 * recommandé). Le tri SRU par pertinence place l'œuvre exacte en premier.
 */
export async function searchBnf(title: string, author?: string, limit = 1): Promise<BnfRecord[]> {
  const clauses: string[] = [];
  const t = cqlValue(title);
  if (t.length < 3) return [];
  clauses.push(`bib.title all "${t}"`);
  const a = author ? cqlValue(author) : "";
  // Nom de famille plausible uniquement (>= 3 lettres, pas d'initiale pointée)
  if (a.length >= 3 && !a.includes(".")) {
    clauses.push(`bib.author all "${a}"`);
  }
  const query = clauses.join(" and ");
  const xml = await scholarlyTextFetch(
    `${BNF_SRU_BASE}?version=1.2&operation=searchRetrieve&query=${encodeURIComponent(query)}&recordSchema=dc&maximumRecords=${limit}`
  );
  if (!xml) return [];

  const records: BnfRecord[] = [];
  const recordBodies = xml.split("<srw:record>").slice(1);
  for (const body of recordBodies) {
    const ark =
      body.match(/<srw:recordIdentifier>(ark:[^<]+)<\/srw:recordIdentifier>/)?.[1] ?? "";
    const title = firstTag(body, "dc:title");
    if (!ark && !title) continue;
    const date = firstTag(body, "dc:date");
    const year = date?.match(/\d{4}/)?.[0];
    const types = allTags(body, "dc:type");
    const typeFr = types.find((ty) => !/^(text|image|score|sound|object|software)$/i.test(ty.trim()));
    records.push({
      ark,
      title,
      authors: allTags(body, "dc:creator").map(cleanBnfAuthor).filter(Boolean).slice(0, 8),
      year: year ? parseInt(year) : undefined,
      publisher: firstTag(body, "dc:publisher"),
      type: typeFr,
      url: ark ? `https://catalogue.bnf.fr/${ark}` : undefined,
    });
  }
  return records;
}
