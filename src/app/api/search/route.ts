import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ═══════════════════════════════════════
// GET /api/search — Full-text search across all chapters
// ═══════════════════════════════════════
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const chapterId = searchParams.get("chapterId");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    if (!q.trim()) {
      // Return stats only when no query
      const totalChapters = await db.chapter.count();
      const latestChapter = await db.chapter.findFirst({
        orderBy: { updatedAt: "desc" },
        select: { updatedAt: true },
      });
      const totalWords = await db.chapter.aggregate({ _sum: { wordCount: true } });

      return NextResponse.json({
        data: [],
        meta: {
          count: 0,
          totalIndexed: totalChapters,
          totalWords: totalWords._sum.wordCount || 0,
          lastIndexUpdate: latestChapter?.updatedAt || null,
        },
      });
    }

    // Build where clause
    const where: Record<string, unknown> = {
      plainText: { not: "" },
    };

    if (chapterId) {
      where.id = chapterId;
    }

    if (dateFrom || dateTo) {
      where.updatedAt = {} as Record<string, unknown>;
      if (dateFrom) (where.updatedAt as Record<string, unknown>).gte = new Date(dateFrom);
      if (dateTo) (where.updatedAt as Record<string, unknown>).lte = new Date(dateTo);
    }

    // Fetch all chapters with content (server-side search)
    const chapters = await db.chapter.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        number: true,
        title: true,
        romanNumeral: true,
        plainText: true,
        wordCount: true,
        status: true,
        updatedAt: true,
        thesisId: true,
        thesis: { select: { title: true, author: true } },
      },
    });

    // Parse boolean operators from query
    const { mustTerms, mustNotTerms } = parseBooleanQuery(q);

    // Search and score results
    const results = chapters
      .map((chapter) => {
        const text = chapter.plainText.toLowerCase();
        const title = chapter.title.toLowerCase();

        // Check NOT terms first — exclude if any NOT term found
        for (const notTerm of mustNotTerms) {
          if (text.includes(notTerm.toLowerCase()) || title.includes(notTerm.toLowerCase())) {
            return null;
          }
        }

        // Calculate relevance score
        let score = 0;
        let bestSnippet = "";
        let bestSnippetIndex = -1;

        for (const term of mustTerms) {
          const termLower = term.toLowerCase();

          // Count occurrences in plain text
          let occurrences = 0;
          let pos = 0;
          while ((pos = text.indexOf(termLower, pos)) !== -1) {
            occurrences++;

            // Extract snippet around first match
            if (bestSnippetIndex === -1 || pos < bestSnippetIndex) {
              bestSnippetIndex = pos;
              const start = Math.max(0, pos - 80);
              const end = Math.min(chapter.plainText.length, pos + term.length + 120);
              bestSnippet =
                (start > 0 ? "\u2026 " : "") +
                chapter.plainText.slice(start, end) +
                (end < chapter.plainText.length ? " \u2026" : "");
            }

            pos += termLower.length;
          }

          // Title match bonus
          if (title.includes(termLower)) {
            score += 50;
          }

          // Score based on frequency and word count ratio
          score += occurrences * 10;
          if (chapter.wordCount > 0) {
            score += (occurrences / chapter.wordCount) * 1000;
          }
        }

        if (score === 0) return null;

        return {
          chapterId: chapter.id,
          chapterNumber: chapter.number,
          chapterTitle: chapter.title,
          romanNumeral: chapter.romanNumeral,
          thesisTitle: chapter.thesis?.title || "",
          thesisAuthor: chapter.thesis?.author || "",
          snippet: bestSnippet,
          score: Math.round(score * 100) / 100,
          wordCount: chapter.wordCount,
          status: chapter.status,
          updatedAt: chapter.updatedAt,
        };
      })
      .filter(Boolean)
      .sort((a, b) => (b!.score - a!.score));

    // Stats
    const totalChapters = await db.chapter.count({
      where: { plainText: { not: "" } },
    });
    const latestChapter = await db.chapter.findFirst({
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    });
    const totalWords = await db.chapter.aggregate({ _sum: { wordCount: true } });

    return NextResponse.json({
      data: results,
      meta: {
        count: results.length,
        totalIndexed: totalChapters,
        totalWords: totalWords._sum.wordCount || 0,
        lastIndexUpdate: latestChapter?.updatedAt || null,
      },
    });
  } catch (error) {
    console.error("[GET /api/search] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recherche" },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════
// Parse boolean query (AND, OR, NOT)
// ═══════════════════════════════════════
function parseBooleanQuery(query: string) {
  const mustTerms: string[] = [];
  const mustNotTerms: string[] = [];

  // Split by NOT operator
  const parts = query.split(/\s+NOT\s+/i);
  const positivePart = parts[0];
  const negativeParts = parts.slice(1);

  // Extract NOT terms
  for (const neg of negativeParts) {
    const terms = neg
      .split(/\s+(?:AND|OR)\s+/i)
      .map((t) => t.trim())
      .filter(Boolean);
    mustNotTerms.push(...terms);
  }

  // Extract positive terms (split by AND/OR — both treated as must for simplicity)
  const posTerms = positivePart
    .split(/\s+(?:AND|OR)\s+/i)
    .map((t) => t.trim())
    .filter(Boolean);
  mustTerms.push(...posTerms);

  return { mustTerms, mustNotTerms };
}
