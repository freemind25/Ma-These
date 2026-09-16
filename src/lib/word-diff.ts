// ═══════════════════════════════════════════════════════════════
// ThesisFrame — Diff mot à mot natif (A.4, annexe technique)
// Pendant le test de production, le diff a été calculé HORS outil
// (difflib). Ce module fournit un diff LCS au niveau du mot, sans
// dépendance externe, pour l'historique des chapitres.
// ═══════════════════════════════════════════════════════════════

export type DiffSegmentType = "equal" | "add" | "del";

export interface DiffSegment {
  type: DiffSegmentType;
  text: string;
}

/** Plafond de sécurité : au-delà, on bascule au niveau paragraphe. */
const MAX_TOKENS_WORD_LEVEL = 3_000;

/**
 * Tokenise un texte en mots / signes / espaces (permet un diff lisible).
 */
function tokenize(text: string): string[] {
  return text.match(/\s+|[^\s]+/g) || [];
}

/**
 * Diff LCS entre deux tableaux de jetons.
 * Renvoie la liste de segments fusionnés (equal / add / del).
 */
function lcsDiff(oldTokens: string[], newTokens: string[]): DiffSegment[] {
  const n = oldTokens.length;
  const m = newTokens.length;

  // Table DP (n+1) × (m+1) — Int32Array pour la compacité mémoire.
  const width = m + 1;
  const dp = new Int32Array((n + 1) * width);
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i * width + j] =
        oldTokens[i] === newTokens[j]
          ? dp[(i + 1) * width + (j + 1)] + 1
          : Math.max(dp[(i + 1) * width + j], dp[i * width + (j + 1)]);
    }
  }

  // Backtracking → segments bruts
  const raw: DiffSegment[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (oldTokens[i] === newTokens[j]) {
      raw.push({ type: "equal", text: oldTokens[i] });
      i++;
      j++;
    } else if (dp[(i + 1) * width + j] >= dp[i * width + (j + 1)]) {
      raw.push({ type: "del", text: oldTokens[i] });
      i++;
    } else {
      raw.push({ type: "add", text: newTokens[j] });
      j++;
    }
  }
  while (i < n) {
    raw.push({ type: "del", text: oldTokens[i] });
    i++;
  }
  while (j < m) {
    raw.push({ type: "add", text: newTokens[j] });
    j++;
  }

  // Fusion des segments consécutifs de même type
  const merged: DiffSegment[] = [];
  for (const seg of raw) {
    const last = merged[merged.length - 1];
    if (last && last.type === seg.type) {
      last.text += seg.text;
    } else {
      merged.push({ ...seg });
    }
  }
  return merged;
}

/**
 * Diff mot à mot entre deux textes.
 * Au-delà du plafond de jetons, bascule automatiquement au niveau
 * paragraphe (garantie de performance pour les très longs chapitres).
 */
export function wordDiff(oldText: string, newText: string): DiffSegment[] {
  const oldTokens = tokenize(oldText);
  const newTokens = tokenize(newText);

  if (
    oldTokens.length > MAX_TOKENS_WORD_LEVEL ||
    newTokens.length > MAX_TOKENS_WORD_LEVEL
  ) {
    // Repli paragraphe : granularité plus grossière, mais toujours natif.
    const oldParas = oldText.split(/\n{2,}/);
    const newParas = newText.split(/\n{2,}/);
    return lcsDiff(
      oldParas.map((p) => `${p}\n\n`),
      newParas.map((p) => `${p}\n\n`)
    );
  }

  return lcsDiff(oldTokens, newTokens);
}

/** Statistiques compactes du diff (pour l'affichage : +X / −Y). */
export function diffStats(segments: DiffSegment[]): {
  added: number;
  deleted: number;
} {
  let added = 0;
  let deleted = 0;
  for (const seg of segments) {
    if (seg.type === "equal") continue;
    const words = seg.text.trim() ? seg.text.trim().split(/\s+/).length : 0;
    if (seg.type === "add") added += words;
    else deleted += words;
  }
  return { added, deleted };
}
