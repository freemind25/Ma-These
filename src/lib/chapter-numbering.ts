import { db } from '@/lib/db'

export const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX']

/** Build a display number for a chapter at position (1-based) */
export function chapterNumber(position: number, mode: string, partIndex?: number): string {
  if (mode === 'parts' && partIndex !== undefined) {
    const partLabel = partIndex < 20 ? ROMAN[partIndex] : String(partIndex + 1)
    return `${partLabel}.${position}`
  }
  return position <= 20 ? ROMAN[position - 1] : String(position)
}

/** Renumber all chapters of a thesis according to the mode */
export async function renumberChapters(thesisId: string, mode: string) {
  if (mode === 'parts') {
    const parts = await db.part.findMany({ where: { thesisId }, orderBy: { order: 'asc' } })
    const partMap = new Map(parts.map((p, i) => [p.id, i]))
    const chapters = await db.chapter.findMany({ where: { thesisId }, orderBy: { order: 'asc' } })
    await db.$transaction(
      chapters.map((ch) => {
        const posInPart = chapters
          .filter(c => c.partId === ch.partId && c.order <= ch.order).length
        const partIdx = ch.partId ? (partMap.get(ch.partId) ?? 0) : 0
        return db.chapter.update({
          where: { id: ch.id },
          data: { number: chapterNumber(posInPart, mode, partIdx) },
        })
      }),
    )
  } else {
    const chapters = await db.chapter.findMany({ where: { thesisId }, orderBy: { order: 'asc' } })
    await db.$transaction(
      chapters.map((ch, i) =>
        db.chapter.update({
          where: { id: ch.id },
          data: { number: chapterNumber(i + 1, mode) },
        })
      ),
    )
  }
}
