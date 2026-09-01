// ═══════════════════════════════════════════════════════════════
// Ma Thèse — Statistics Recomputation API
// Recomputes p-values from reported test statistics (t, F, χ², z, r)
// Inspired by Nuijten et al. (2016) statcheck method
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import jStat from "jstat";

// ── Types ──

interface ExtractedStat {
 type: "t" | "F" | "chi2" | "z" | "r";
 statistic: number;
 df1: number;        // df for t, chi2; numerator df for F; n for r
  df2?: number;       // denominator df for F
  reportedP: number;  // as written in text
  computedP: number;  // recomputed
  pLower: number;     // lower bound from rounding
  pUpper: number;     // upper bound from rounding
  flag: "ok" | "inconsistent" | "gross_error";
 raw: string;        // the matched text
  context: string;    // surrounding sentence
}

// ── P-value computation ──

function pFromT(t: number, df: number): number {
  return 2 * (1 - jStat.studentt.cdf(Math.abs(t), df));
}

function pFromF(f: number, df1: number, df2: number): number {
  return 1 - jStat.centralF.cdf(f, df1, df2);
}

function pFromChi2(x: number, df: number): number {
  return 1 - jStat.chisquare.cdf(x, df);
}

function pFromZ(z: number): number {
  return 2 * (1 - jStat.normal.cdf(Math.abs(z), 0, 1));
}

function pFromR(r: number, n: number): number {
  if (n <= 3) return 1;
  const t = r * Math.sqrt((n - 2) / (1 - r * r));
  return pFromT(t, n - 2);
}

// ── Extraction patterns ──

const STAT_PATTERNS: Array<{
 type: ExtractedStat["type"];
 pattern: RegExp;
 extractStat: (m: RegExpMatchArray) => { statistic: number; df1: number; df2?: number };
}> = [
  // t(df) = value, p = value
  {
    type: "t",
    pattern: /t\s*\(\s*(\d+(?:[.,]\d+)?)\s*\)\s*=\s*(\d+(?:[.,]\d+)?)/gi,
    extractStat: (m) => ({ statistic: parseFloat(m[2].replace(",", ".")), df1: parseFloat(m[1].replace(",", ".")) }),
  },
  // t = value, df = value, p = value
  {
    type: "t",
    pattern: /t\s*=\s*(\d+(?:[.,]\d+)?)[^p]*?df\s*=\s*(\d+(?:[.,]\d+)?)/gi,
    extractStat: (m) => ({ statistic: parseFloat(m[1].replace(",", ".")), df1: parseFloat(m[2].replace(",", ".")) }),
  },
  // F(df1, df2) = value
  {
    type: "F",
    pattern: /F\s*\(\s*(\d+(?:[.,]\d+)?),\s*(\d+(?:[.,]\d+)?)\s*\)\s*=\s*(\d+(?:[.,]\d+)?)/gi,
    extractStat: (m) => ({
      statistic: parseFloat(m[3].replace(",", ".")),
      df1: parseFloat(m[1].replace(",", ".")),
      df2: parseFloat(m[2].replace(",", ".")),
    }),
  },
  // χ²(df) = value or Chi-square(df) = value
  {
    type: "chi2",
    pattern: /(?:χ²|chi-?square|chi\.?2)\s*\(\s*(\d+(?:[.,]\d+)?)\s*\)\s*=\s*(\d+(?:[.,]\d+)?)/gi,
    extractStat: (m) => ({ statistic: parseFloat(m[2].replace(",", ".")), df1: parseFloat(m[1].replace(",", ".")) }),
  },
  // z = value
  {
    type: "z",
    pattern: /z\s*=\s*(\d+(?:[.,]\d+)?)/gi,
    extractStat: (m) => ({ statistic: parseFloat(m[1].replace(",", ".")), df1: 0 }),
  },
  // r(N) = value or r(df) = value with n mentioned
  {
    type: "r",
    pattern: /r\s*\(\s*[Nn]\s*=\s*(\d+(?:[.,]\d+)?)\s*\)\s*=\s*(-?\d+(?:[.,]\d+)?)/gi,
    extractStat: (m) => ({ statistic: parseFloat(m[2].replace(",", ".")), df1: parseFloat(m[1].replace(",", ".")) }),
  },
];

/** Extract reported p-value near a statistic */
function extractReportedP(text: string, statStart: number, statEnd: number): number | undefined {
  // Look for p = value, p < value, p > value within 80 chars after the stat
  const window = text.slice(statStart, statEnd + 120);
  const pPatterns = [
    /[Pp]\s*[=<→]\s*([< ]?\d*[,\.]?\d+)/,
    /[Pp]\s*=\s*(\d*[,\.]?\d+e?-?\d*)/,
  ];
  for (const p of pPatterns) {
    const m = window.match(p);
    if (m) {
      const val = m[1].replace(",", ".").replace(/\s/g, "");
      const parsed = parseFloat(val);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) return parsed;
      // Handle "< .001" or "<.05"
      if (val.startsWith("<")) {
        const inner = parseFloat(val.slice(1));
        if (!isNaN(inner)) return inner / 2;
      }
    }
  }
  return undefined;
}

/** Get surrounding sentence context */
function getContext(text: string, start: number): string {
  const sentenceStart = Math.max(0, text.lastIndexOf(".", start - 1) + 1);
  const sentenceEnd = Math.min(text.length, text.indexOf(".", start + 50) + 1 || start + 150);
  return text.slice(sentenceStart, sentenceEnd).trim();
}

// ── Main extraction ──

function extractStatistics(text: string): ExtractedStat[] {
  const results: ExtractedStat[] = [];
  const seen = new Set<string>();

  for (const { type, pattern, extractStat } of STAT_PATTERNS) {
    // Reset lastIndex
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const raw = match[0];
      const key = `${type}:${raw}`;
      if (seen.has(key)) continue;
      seen.add(key);

      try {
        const { statistic, df1, df2 } = extractStat(match);
        if (isNaN(statistic) || isNaN(df1)) continue;
        if (statistic < 0 && type !== "t" && type !== "z" && type !== "r") continue;

        let computedP: number;
        switch (type) {
          case "t":
            if (df1 < 1) continue;
            computedP = pFromT(statistic, df1);
            break;
          case "F":
            if (df1 < 1 || !df2 || df2 < 1) continue;
            computedP = pFromF(statistic, df1, df2);
            break;
          case "chi2":
            if (df1 < 1 || statistic < 0) continue;
            computedP = pFromChi2(statistic, df1);
            break;
          case "z":
            computedP = pFromZ(statistic);
            break;
          case "r":
            if (Math.abs(statistic) > 1) continue;
            if (df1 < 4) continue;
            computedP = pFromR(statistic, df1);
            break;
          default:
            continue;
        }

        const reportedP = extractReportedP(text, match.index!, match.index! + raw.length) ?? 0.05;

        // Rounding range: compute p-values for ±0.005 of the statistic
        const eps = 0.005;
        let pLower = computedP;
        let pUpper = computedP;
        switch (type) {
          case "t":
            pLower = pFromT(statistic - eps, df1);
            pUpper = pFromT(statistic + eps, df1);
            break;
          case "F":
            pLower = pFromF(statistic - eps, df1, df2!);
            pUpper = pFromF(statistic + eps, df1, df2!);
            break;
          case "chi2":
            pLower = pFromChi2(Math.max(0, statistic - eps), df1);
            pUpper = pFromChi2(statistic + eps, df1);
            break;
          case "z":
            pLower = pFromZ(statistic - eps);
            pUpper = pFromZ(statistic + eps);
            break;
          case "r":
            pLower = pFromR(statistic - eps, df1);
            pUpper = pFromR(statistic + eps, df1);
            break;
        }
        pLower = Math.min(pLower, computedP, pUpper);
        pUpper = Math.max(pLower, computedP, pUpper);

        // Flag logic
        let flag: ExtractedStat["flag"] = "ok";
        if (reportedP < pLower || reportedP > pUpper) {
          // Reported p is outside the rounding range → gross error
          flag = reportedP < pLower * 0.1 || reportedP > pUpper * 10 ? "gross_error" : "inconsistent";
        }

        const context = getContext(text, match.index!);

        results.push({
          type,
          statistic: Math.round(statistic * 1000) / 1000,
          df1: Math.round(df1 * 10) / 10,
          df2: df2 ? Math.round(df2 * 10) / 10 : undefined,
          reportedP: Math.round(reportedP * 10000) / 10000,
          computedP: Math.round(computedP * 10000) / 10000,
          pLower: Math.round(pLower * 10000) / 10000,
          pUpper: Math.round(pUpper * 10000) / 10000,
          flag,
          raw,
          context: context.slice(0, 300),
        });
      } catch {
        // Skip malformed entries
      }
    }
  }

  return results;
}

// ── Route ──

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string" || text.trim().length < 20) {
      return NextResponse.json({ error: "Texte requis (minimum 20 caractères)" }, { status: 400 });
    }

    const stats = extractStatistics(text);
    const ok = stats.filter(s => s.flag === "ok").length;
    const inconsistent = stats.filter(s => s.flag === "inconsistent").length;
    const grossErrors = stats.filter(s => s.flag === "gross_error").length;

    return NextResponse.json({
      total: stats.length,
      ok,
      inconsistent,
      grossErrors,
      stats,
    });
  } catch {
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
