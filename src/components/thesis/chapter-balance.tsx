'use client'

import { useMemo } from 'react'
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  Scale,
  BarChart3,
  SplitSquareHorizontal,
  MergeIcon,
  BookOpen,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CHAPTERS, CHAPTER_COLORS, type ChapterStructure } from '@/data/chapters-structure'

// ─── Types ──────────────────────────────────────────────────
interface ChapterData {
  id: string
  order: number
  number: string
  title: string
  content: string
  wordCount: number
  status: string
}

interface ChapterBalanceProps {
  chapters: ChapterData[]
}

interface BalanceResult {
  chapters: BalanceChapter[]
  bodyAverage: number
  bodyMin: number
  bodyMax: number
  totalWords: number
  introPercent: number
  conclusionPercent: number
  overallVerdict: 'good' | 'warning' | 'critical'
  recommendations: Recommendation[]
}

interface BalanceChapter {
  order: number
  number: string
  title: string
  wordCount: number
  meta: ChapterStructure | undefined
  deviation: number // % deviation from body average (negative = shorter, positive = longer)
  status: 'ok' | 'borderline' | 'warning' | 'critical' | 'intro' | 'conclusion'
  introExpectedPercent: number
  conclusionExpectedPercent: number
  pages: number // estimated pages (250 words/page)
}

interface Recommendation {
  type: 'info' | 'warning' | 'critical'
  icon: React.ReactNode
  chapter: string
  message: string
}

const WORDS_PER_PAGE = 250
const TOLERANCE_OK = 20 // within 20% = green
const TOLERANCE_BORDERLINE = 35 // 20-35% = amber
const INTRO_EXPECTED = 10 // 10% of total
const CONCLUSION_EXPECTED = 5 // 5% of total

export default function ChapterBalance({ chapters }: ChapterBalanceProps) {
  const result = useMemo((): BalanceResult => {
    const sorted = [...chapters].sort((a, b) => a.order - b.order)
    const totalWords = sorted.reduce((s, c) => s + c.wordCount, 0)

    // Body chapters = II to V (orders 2,3,4,5) — Intro=1, Conclusion=6
    const bodyChapters = sorted.filter(c => c.order >= 2 && c.order <= 5)
    const intro = sorted.find(c => c.order === 1)
    const conclusion = sorted.find(c => c.order === 6)

    const bodyAverage = bodyChapters.length > 0
      ? bodyChapters.reduce((s, c) => s + c.wordCount, 0) / bodyChapters.length
      : 0
    const bodyMin = bodyChapters.length > 0 ? Math.min(...bodyChapters.map(c => c.wordCount)) : 0
    const bodyMax = bodyChapters.length > 0 ? Math.max(...bodyChapters.map(c => c.wordCount)) : 0

    const introPercent = totalWords > 0 && intro ? (intro.wordCount / totalWords) * 100 : 0
    const conclusionPercent = totalWords > 0 && conclusion ? (conclusion.wordCount / totalWords) * 100 : 0

    // Build chapter analysis
    const chapterResults: BalanceChapter[] = sorted.map(ch => {
      const meta = CHAPTERS.find(m => m.order === ch.order)
      const deviation = bodyAverage > 0 && ch.order >= 2 && ch.order <= 5
        ? ((ch.wordCount - bodyAverage) / bodyAverage) * 100
        : 0

      let status: BalanceChapter['status'] = 'ok'
      if (ch.order === 1) status = 'intro'
      else if (ch.order === 6) status = 'conclusion'
      else if (Math.abs(deviation) <= TOLERANCE_OK) status = 'ok'
      else if (Math.abs(deviation) <= TOLERANCE_BORDERLINE) status = 'borderline'
      else if (ch.wordCount === 0) status = 'critical'
      else status = 'warning'

      return {
        order: ch.order,
        number: ch.number,
        title: ch.title,
        wordCount: ch.wordCount,
        meta,
        deviation,
        status,
        introExpectedPercent: INTRO_EXPECTED,
        conclusionExpectedPercent: CONCLUSION_EXPECTED,
        pages: Math.round(ch.wordCount / WORDS_PER_PAGE),
      }
    })

    // Generate recommendations
    const recommendations: Recommendation[] = []

    // Check intro proportion
    if (intro && intro.wordCount > 0) {
      if (introPercent < INTRO_EXPECTED * 0.5 && introPercent > 0) {
        recommendations.push({
          type: 'warning',
          icon: <TrendingUp className="h-3.5 w-3.5" />,
          chapter: `Ch. ${intro.number}`,
          message: `L'introduction ne represente que ${introPercent.toFixed(1)}% du volume total (attendu ~${INTRO_EXPECTED}%). Elle est probablement trop courte pour poser correctement le cadre, la problematique et le plan.`,
        })
      } else if (introPercent > INTRO_EXPECTED * 1.8) {
        recommendations.push({
          type: 'warning',
          icon: <TrendingDown className="h-3.5 w-3.5" />,
          chapter: `Ch. ${intro.number}`,
          message: `L'introduction represente ${introPercent.toFixed(1)}% du volume total (attendu ~${INTRO_EXPECTED}%). Elle risque d'empieter sur le corps de la these. Verifiez que le cadre et la problematique ne sont pas trop developpes.`,
        })
      }
    }

    // Check conclusion proportion
    if (conclusion && conclusion.wordCount > 0) {
      if (conclusionPercent > CONCLUSION_EXPECTED * 2.5) {
        recommendations.push({
          type: 'warning',
          icon: <TrendingDown className="h-3.5 w-3.5" />,
          chapter: `Ch. ${conclusion.number}`,
          message: `La conclusion represente ${conclusionPercent.toFixed(1)}% du volume (attendu ~${CONCLUSION_EXPECTED}%). Une conclusion doit etre incisive et synthetique. Deplacez les developpements vers les chapitres concernes.`,
        })
      }
    }

    // Check body chapters balance
    for (const ch of bodyChapters) {
      if (ch.wordCount === 0) continue
      const dev = ((ch.wordCount - bodyAverage) / bodyAverage) * 100
      if (dev > 40) {
        recommendations.push({
          type: 'critical',
          icon: <SplitSquareHorizontal className="h-3.5 w-3.5" />,
          chapter: `Ch. ${CHAPTERS.find(m => m.order === ch.order)?.number || ch.order}`,
          message: `Ce chapitre depasse de ${dev.toFixed(0)}% la moyenne du corps (${bodyAverage.toLocaleString()} mots). Envisagez de le scinder en deux chapitres ou de deplacer les tableaux et donnees brutes vers les annexes.`,
        })
      } else if (dev < -40) {
        recommendations.push({
          type: 'warning',
          icon: <MergeIcon className="h-3.5 w-3.5" />,
          chapter: `Ch. ${CHAPTERS.find(m => m.order === ch.order)?.number || ch.order}`,
          message: `Ce chapitre est ${Math.abs(dev).toFixed(0)}% en dessous de la moyenne (${bodyAverage.toLocaleString()} mots). Envisagez de le fusionner avec un chapitre voisin ou d'approfondir l'analyse.`,
        })
      } else if (Math.abs(dev) > 20) {
        recommendations.push({
          type: 'info',
          icon: <ArrowRightLeft className="h-3.5 w-3.5" />,
          chapter: `Ch. ${CHAPTERS.find(m => m.order === ch.order)?.number || ch.order}`,
          message: `Ecart de ${dev > 0 ? '+' : ''}${dev.toFixed(0)}% par rapport a la moyenne. Tolere mais a surveiller pour maintenir l'equilibre.`,
        })
      }
    }

    // Overall verdict
    let overallVerdict: BalanceResult['overallVerdict'] = 'good'
    const hasCritical = recommendations.some(r => r.type === 'critical')
    const hasWarning = recommendations.some(r => r.type === 'warning')
    if (hasCritical) overallVerdict = 'critical'
    else if (hasWarning) overallVerdict = 'warning'

    // Empty thesis info
    if (totalWords === 0) {
      recommendations.unshift({
        type: 'info',
        icon: <BookOpen className="h-3.5 w-3.5" />,
        chapter: 'Global',
        message: 'Aucun contenu redige. Commencez la redaction pour activer l\'analyse d\'equilibre.',
      })
    }

    return {
      chapters: chapterResults,
      bodyAverage,
      bodyMin,
      bodyMax,
      totalWords,
      introPercent,
      conclusionPercent,
      overallVerdict,
      recommendations,
    }
  }, [chapters])

  const maxWords = Math.max(...result.chapters.map(c => c.wordCount), 1)
  const hasContent = result.totalWords > 0

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Scale className="h-4 w-4 text-amber-600" />
        <span className="text-xs font-bold text-slate-900">Bilan d'equilibre</span>
      </div>

      {/* Verdict badge */}
      <div className={cn(
        'rounded-lg border p-2.5 flex items-center gap-2',
        result.overallVerdict === 'good' && 'border-emerald-200 bg-emerald-50/50',
        result.overallVerdict === 'warning' && 'border-amber-200 bg-amber-50/50',
        result.overallVerdict === 'critical' && 'border-red-200 bg-red-50/50',
      )}>
        {result.overallVerdict === 'good' && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
        {result.overallVerdict === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />}
        {result.overallVerdict === 'critical' && <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />}
        <div className="min-w-0">
          <p className={cn(
            'text-[11px] font-semibold',
            result.overallVerdict === 'good' && 'text-emerald-800',
            result.overallVerdict === 'warning' && 'text-amber-800',
            result.overallVerdict === 'critical' && 'text-red-800',
          )}>
            {result.totalWords === 0 ? 'Aucun contenu redige'
              : result.overallVerdict === 'good' ? 'Equilibre satisfaisant'
              : result.overallVerdict === 'warning' ? 'Desequilibre a corriger'
              : 'Desequilibre critique'}
          </p>
          {hasContent && <p className="text-[10px] text-slate-500 mt-0.5">
            {result.totalWords.toLocaleString()} mots au total · Moy. corps : {result.bodyAverage.toLocaleString()} mots
          </p>}
        </div>
      </div>

      {/* Bar chart */}
      {hasContent && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Volume par chapitre</span>
            <span className="text-[9px] text-slate-400">~{WORDS_PER_PAGE} mots/page</span>
          </div>

          {/* Average line legend */}
          <div className="flex items-center gap-3 text-[9px] text-slate-400 px-1">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> OK (±20%)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Borderline</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Critique</span>
          </div>

          {result.chapters.map(ch => {
            const barWidth = (ch.wordCount / maxWords) * 100
            const meta = ch.meta
            const colors = meta ? CHAPTER_COLORS[meta.color] : CHAPTER_COLORS.emerald
            const avgWidth = result.bodyAverage > 0 ? (result.bodyAverage / maxWords) * 100 : 0

            return (
              <div key={ch.order} className="group">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 w-4 text-right shrink-0">{ch.number}</span>
                  <div className="flex-1 min-w-0">
                    <div className="relative h-5 rounded bg-slate-100 overflow-hidden">
                      {/* Average marker (only for body chapters) */}
                      {ch.order >= 2 && ch.order <= 5 && result.bodyAverage > 0 && (
                        <div
                          className="absolute top-0 bottom-0 w-px bg-slate-400 z-10"
                          style={{ left: `${avgWidth}%` }}
                          title={`Moyenne : ${result.bodyAverage.toLocaleString()} mots`}
                        />
                      )}
                      {/* Bar */}
                      <div
                        className={cn(
                          'h-full rounded transition-all duration-500 relative',
                          ch.status === 'ok' && 'bg-gradient-to-r from-emerald-400 to-emerald-500',
                          ch.status === 'borderline' && 'bg-gradient-to-r from-amber-400 to-amber-500',
                          ch.status === 'warning' && 'bg-gradient-to-r from-orange-400 to-red-400',
                          ch.status === 'critical' && 'bg-gradient-to-r from-red-400 to-red-500',
                          ch.status === 'intro' && 'bg-gradient-to-r from-slate-300 to-slate-400',
                          ch.status === 'conclusion' && 'bg-gradient-to-r from-teal-300 to-teal-400',
                        )}
                        style={{ width: `${Math.max(barWidth, ch.wordCount > 0 ? 2 : 0)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-500 w-8 text-right shrink-0 tabular-nums">
                    {ch.wordCount > 0 ? `${(ch.wordCount / 1000).toFixed(1)}k` : '—'}
                  </span>
                  <span className="text-[9px] text-slate-400 w-7 text-right shrink-0 tabular-nums">
                    ~{ch.pages}p
                  </span>
                </div>
                {/* Tooltip on hover: deviation % */}
                {ch.order >= 2 && ch.order <= 5 && ch.wordCount > 0 && (
                  <div className="flex items-center gap-1 pl-6">
                    <span className={cn(
                      'text-[9px] tabular-nums',
                      Math.abs(ch.deviation) <= 20 && 'text-emerald-600',
                      Math.abs(ch.deviation) > 20 && Math.abs(ch.deviation) <= 35 && 'text-amber-600',
                      Math.abs(ch.deviation) > 35 && 'text-red-600',
                    )}>
                      {ch.deviation > 0 ? '+' : ''}{ch.deviation.toFixed(1)}% vs moy.
                    </span>
                  </div>
                )}
                {/* Intro/conclusion proportion */}
                {(ch.status === 'intro' || ch.status === 'conclusion') && ch.wordCount > 0 && (
                  <div className="flex items-center gap-1 pl-6">
                    <span className={cn(
                      'text-[9px] tabular-nums',
                      ch.status === 'intro' && Math.abs(ch.introExpectedPercent - result.introPercent) <= 3 && 'text-emerald-600',
                      ch.status === 'intro' && Math.abs(ch.introExpectedPercent - result.introPercent) > 3 && 'text-amber-600',
                      ch.status === 'conclusion' && Math.abs(ch.conclusionExpectedPercent - result.conclusionPercent) <= 2 && 'text-emerald-600',
                      ch.status === 'conclusion' && Math.abs(ch.conclusionExpectedPercent - result.conclusionPercent) > 2 && 'text-amber-600',
                    )}>
                      {ch.status === 'intro' ? `${result.introPercent.toFixed(1)}% du total (attendu ~${INTRO_EXPECTED}%)`
                        : `${result.conclusionPercent.toFixed(1)}% du total (attendu ~${CONCLUSION_EXPECTED}%)`}
                    </span>
                  </div>
                )}
              </div>
            )
          })}

          {/* Average line label */}
          <div className="flex items-center gap-1 pl-6 pt-1">
            <div className="w-3 h-px bg-slate-400" />
            <span className="text-[9px] text-slate-400">Moy. corps : {result.bodyAverage.toLocaleString()} mots</span>
          </div>
        </div>
      )}

      {/* Architecture rules summary */}
      {hasContent && (
        <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <BarChart3 className="h-3 w-3 text-slate-500" />
            <span className="text-[10px] font-semibold text-slate-700">Regles d'architecture</span>
          </div>
          <ul className="space-y-1 text-[9px] text-slate-500">
            <li className="flex gap-1.5">
              <span className="text-slate-400 mt-0.5">•</span>
              <span><strong className="text-slate-600">Tolerance</strong> : ±20% entre chapitres du corps (II-V)</span>
            </li>
            <li className="flex gap-1.5">
              <span className="text-slate-400 mt-0.5">•</span>
              <span><strong className="text-slate-600">Introduction</strong> : ~{INTRO_EXPECTED}% du volume total</span>
            </li>
            <li className="flex gap-1.5">
              <span className="text-slate-400 mt-0.5">•</span>
              <span><strong className="text-slate-600">Conclusion</strong> : ~{CONCLUSION_EXPECTED}% du volume total</span>
            </li>
            <li className="flex gap-1.5">
              <span className="text-slate-400 mt-0.5">•</span>
              <span><strong className="text-slate-600">IMRaD</strong> : Methodo/Resultats plus courts, Revue litt./Discussion plus longs</span>
            </li>
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3 w-3 text-amber-600" />
            <span className="text-[10px] font-semibold text-slate-700">Recommandations du directeur</span>
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {result.recommendations.map((rec, i) => (
              <div
                key={i}
                className={cn(
                  'rounded-lg border p-2 flex gap-2',
                  rec.type === 'critical' && 'border-red-200 bg-red-50/50',
                  rec.type === 'warning' && 'border-amber-200 bg-amber-50/50',
                  rec.type === 'info' && 'border-sky-200 bg-sky-50/50',
                )}
              >
                <div className={cn(
                  'shrink-0 mt-0.5',
                  rec.type === 'critical' && 'text-red-500',
                  rec.type === 'warning' && 'text-amber-500',
                  rec.type === 'info' && 'text-sky-500',
                )}>
                  {rec.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={cn(
                      'text-[10px] font-bold',
                      rec.type === 'critical' && 'text-red-800',
                      rec.type === 'warning' && 'text-amber-800',
                      rec.type === 'info' && 'text-sky-800',
                    )}>{rec.chapter}</span>
                  </div>
                  <p className={cn(
                    'text-[10px] leading-relaxed mt-0.5',
                    rec.type === 'critical' && 'text-red-700',
                    rec.type === 'warning' && 'text-amber-700',
                    rec.type === 'info' && 'text-sky-700',
                  )}>{rec.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasContent && (
        <div className="text-center py-4">
          <Info className="h-5 w-5 text-slate-400 mx-auto mb-2" />
          <p className="text-[10px] text-slate-500">
            L'analyse d'equilibre s'activera automatiquement<br />des que vous commencerez a rediger.
          </p>
        </div>
      )}
    </div>
  )
}
