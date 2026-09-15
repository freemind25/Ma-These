// Ma Thèse — Statistics Recomputation API
// Recomputes p-values from reported test statistics (t, F, χ², z, r)
// Inspired by Nuijten et al. (2016) statcheck method
// Enhanced: effect sizes + APA formatting

import { NextRequest, NextResponse } from "next/server";
import jStat from "jstat";

// ── Types ──

interface ExtractedStat {
  type: "t" | "F" | "chi2" | "z" | "r";
  statistic: number;
  df1: number;
  df2?: number;
  reportedP: number;
  computedP: number;
  pLower: number;
  pUpper: number;
  flag: "ok" | "inconsistent" | "gross_error";
  raw: string;
  context: string;
  effectSize?: number;
  effectSizeType?: string;
  effectSizeLabel?: string;
  apa?: string;
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
  {
    type: "t",
    pattern: /t\s*\(\s*(\d+(?:[.,]\d+)?)\s*\)\s*=\s*(\d+(?:[.,]\d+)?)/gi,
    extractStat: (m) => ({ statistic: parseFloat(m[2].replace(",", ".")), df1: parseFloat(m[1].replace(",", ".")) }),
  },
  {
    type: "t",
    pattern: /t\s*=\s*(\d+(?:[.,]\d+)?)[^p]*?df\s*=\s*(\d+(?:[.,]\d+)?)/gi,
    extractStat: (m) => ({ statistic: parseFloat(m[1].replace(",", ".")), df1: parseFloat(m[2].replace(",", ".")) }),
  },
  {
    type: "F",
    pattern: /F\s*\(\s*(\d+(?:[.,]\d+)?),\s*(\d+(?:[.,]\d+)?)\s*\)\s*=\s*(\d+(?:[.,]\d+)?)/gi,
    extractStat: (m) => ({
      statistic: parseFloat(m[3].replace(",", ".")),
      df1: parseFloat(m[1].replace(",", ".")),
      df2: parseFloat(m[2].replace(",", ".")),
    }),
  },
  {
    type: "chi2",
    pattern: /(?:χ²|chi-?square|chi\.?2)\s*\(\s*(\d+(?:[.,]\d+)?)\s*\)\s*=\s*(\d+(?:[.,]\d+)?)/gi,
    extractStat: (m) => ({ statistic: parseFloat(m[2].replace(",", ".")), df1: parseFloat(m[1].replace(",", ".")) }),
  },
  {
    type: "z",
    pattern: /z\s*=\s*(\d+(?:[.,]\d+)?)/gi,
    extractStat: (m) => ({ statistic: parseFloat(m[1].replace(",", ".")), df1: 0 }),
  },
  {
    type: "r",
    pattern: /r\s*\(\s*[Nn]\s*=\s*(\d+(?:[.,]\d+)?)\s*\)\s*=\s*(-?\d+(?:[.,]\d+)?)/gi,
    extractStat: (m) => ({ statistic: parseFloat(m[2].replace(",", ".")), df1: parseFloat(m[1].replace(",", ".")) }),
  },
];

function extractReportedP(text: string, statStart: number, statEnd: number): number | undefined {
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
      if (val.startsWith("<")) {
        const inner = parseFloat(val.slice(1));
        if (!isNaN(inner)) return inner / 2;
      }
    }
  }
  return undefined;
}

function getContext(text: string, start: number): string {
  const sentenceStart = Math.max(0, text.lastIndexOf(".", start - 1) + 1);
  const sentenceEnd = Math.min(text.length, text.indexOf(".", start + 50) + 1 || start + 150);
  return text.slice(sentenceStart, sentenceEnd).trim();
}

// ── Effect size classification ──

function classifyEffect(abs: number): string {
  return abs < 0.1 ? "négligeable" : abs < 0.3 ? "petit" : abs < 0.5 ? "moyen" : "grand";
}

// ── Main extraction ──

function extractStatistics(text: string): ExtractedStat[] {
  const results: ExtractedStat[] = [];
  const seen = new Set<string>();

  for (const { type, pattern, extractStat } of STAT_PATTERNS) {
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

        // Rounding range
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

        // Flag
        let flag: ExtractedStat["flag"] = "ok";
        if (reportedP < pLower || reportedP > pUpper) {
          flag = reportedP < pLower * 0.1 || reportedP > pUpper * 10 ? "gross_error" : "inconsistent";
        }

        // ── Effect Size ──
        let effectSize: number | undefined;
        let effectSizeType: string | undefined;
        let effectSizeLabel: string | undefined;

        switch (type) {
          case "t": {
            const d = statistic / Math.sqrt(df1);
            effectSize = Math.round(d * 1000) / 1000;
            effectSizeType = "d de Cohen";
            effectSizeLabel = classifyEffect(Math.abs(d));
            break;
          }
          case "F": {
            if (df2 && df2 > 0) {
              const eta2 = (statistic * df1) / (statistic * df1 + df2);
              effectSize = Math.round(eta2 * 1000) / 1000;
              effectSizeType = "η²";
              effectSizeLabel = classifyEffect(Math.sqrt(eta2));
            }
            break;
          }
          case "chi2": {
            const nApprox = df1 * 10;
            const phi = Math.sqrt(statistic / nApprox);
            effectSize = Math.round(phi * 1000) / 1000;
            effectSizeType = "φ";
            effectSizeLabel = classifyEffect(phi);
            break;
          }
          case "r": {
            effectSize = statistic;
            effectSizeType = "r";
            effectSizeLabel = classifyEffect(Math.abs(statistic));
            break;
          }
        }

        // ── APA formatting ──
        const pStr = computedP < 0.001 ? "< .001" : `= .${Math.round(computedP * 1000).toString().padStart(3, "0")}`;
        let apa: string;
        switch (type) {
          case "t":
            apa = `t(${Math.round(df1)}) = ${statistic.toFixed(2)}, p ${pStr}${effectSize !== undefined ? `, ${effectSizeType} = ${effectSize}` : ""}`;
            break;
          case "F":
            apa = `F(${Math.round(df1)}, ${df2 ? Math.round(df2) : "?"}) = ${statistic.toFixed(2)}, p ${pStr}${effectSize !== undefined ? `, ${effectSizeType} = ${effectSize.toFixed(3)}` : ""}`;
            break;
          case "chi2":
            apa = `χ²(${Math.round(df1)}) = ${statistic.toFixed(2)}, p ${pStr}${effectSize !== undefined ? `, ${effectSizeType} = ${effectSize.toFixed(3)}` : ""}`;
            break;
          case "z":
            apa = `z = ${statistic.toFixed(2)}, p ${pStr}`;
            break;
          case "r":
            apa = `r(${Math.round(df1)}) = ${statistic.toFixed(3)}, p ${pStr}`;
            break;
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
          effectSize,
          effectSizeType,
          effectSizeLabel,
          apa,
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
    const ok = stats.filter((s) => s.flag === "ok").length;
    const inconsistent = stats.filter((s) => s.flag === "inconsistent").length;
    const grossErrors = stats.filter((s) => s.flag === "gross_error").length;

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
