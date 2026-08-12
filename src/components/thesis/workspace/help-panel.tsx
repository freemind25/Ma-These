'use client'

import { useState } from 'react'
import {
  Sparkles, ShieldCheck, Send, Loader2, ClipboardList, ListChecks, Lightbulb, Settings, FileText,
  PenLine, AlertTriangle, ChevronDown, BookOpen, Target, Info, BookMarked,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import ChapterBalance from '@/components/thesis/chapter-balance'
import { writingSources } from '@/data/thesis-writing-guide'
import { getBookSkillsForChapter } from '@/data/book-skills'
import { RESOURCES } from '@/data/resources'
import { RHETORICAL_CHECKLISTS, SEVERITY_COLORS, SEVERITY_LABELS } from '@/data/rhetorical-checklist'
import type { RhetoricalMove } from '@/data/rhetorical-checklist'
import type { ChapterData, ThesisData, ChatMsg } from '@/types/thesis'
import type { ChapterStructure } from '@/data/chapters-structure'

interface ColorSet {
  light: string
  text: string
  bg: string
  border: string
}

interface HelpPanelProps {
  helpTab: string
  onHelpTabChange: (tab: string) => void
  chapterMeta: ChapterStructure | undefined
  colors: ColorSet
  thesis: ThesisData
  activeChapter: ChapterData | undefined

  // AI chat
  aiMode: string
  onAiModeChange: (mode: string) => void
  aiProvider: string
  onOpenProviderSettings: () => void
  aiMessages: ChatMsg[]
  aiLoading: boolean
  aiInput: string
  onAiInputChange: (value: string) => void
  onAiSend: () => void

  // Director
  onDirectorSubmit: () => void
  directorLoading: boolean
  directorFeedback: string
}

export default function HelpPanel({
  helpTab, onHelpTabChange, chapterMeta, colors, thesis, activeChapter,
  aiMode, onAiModeChange, aiProvider, onOpenProviderSettings, aiMessages, aiLoading, aiInput, onAiInputChange, onAiSend,
  onDirectorSubmit, directorLoading, directorFeedback,
}: HelpPanelProps) {
  const [sourcesOpen, setSourcesOpen] = useState(false)
  const [checkedMoves, setCheckedMoves] = useState<Set<string>>(new Set())
  const [expandedTip, setExpandedTip] = useState<string | null>(null)

  const recommendedBooks = chapterMeta ? getBookSkillsForChapter(chapterMeta.number).slice(0, 3) : []
  const rhetoricalMoves = chapterMeta ? RHETORICAL_CHECKLISTS[chapterMeta.number] ?? [] : []
  const checkedCount = rhetoricalMoves.filter(m => checkedMoves.has(m.id)).length

  const toggleMove = (id: string) => {
    setCheckedMoves(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <aside className="w-[340px] border-l border-slate-200 bg-white flex flex-col shrink-0 overflow-hidden">
      <Tabs value={helpTab} onValueChange={onHelpTabChange} className="flex flex-col h-full">
        <TabsList className="mx-3 mt-3 bg-slate-100 rounded-lg p-0.5 h-auto grid grid-cols-3">
          <TabsTrigger value="guide" className="text-[10px] py-1.5 px-1 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm gap-0.5">
            <ClipboardList className="h-3 w-3" /> Guide
          </TabsTrigger>
          <TabsTrigger value="ai" className="text-[10px] py-1.5 px-1 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm gap-0.5">
            <Sparkles className="h-3 w-3" /> IA
          </TabsTrigger>
          <TabsTrigger value="director" className="text-[10px] py-1.5 px-1 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm gap-0.5">
            <ShieldCheck className="h-3 w-3" /> Dir.
          </TabsTrigger>
        </TabsList>

        {/* ── GUIDE TAB ── */}
        <TabsContent value="guide" className="flex-1 overflow-y-auto p-3 mt-2 space-y-4">
          {chapterMeta ? (
            <>
              {/* Word Count Guide Badge */}
              <Badge variant="outline" className="text-[10px] font-semibold border-amber-300 bg-amber-50 text-amber-800 w-full justify-center py-1">
                📏 {chapterMeta.wordCountGuide}
              </Badge>

              <div>
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-1.5">
                  <ListChecks className="h-3.5 w-3.5 text-emerald-600" />
                  Ce chapitre doit contenir
                </h3>
                <ul className="space-y-1.5">
                  {chapterMeta.expectations.map((exp, i) => (
                    <li key={i} className="text-[11px] text-slate-600 flex gap-1.5">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span>{exp}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Separator />
              <div>
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-1.5">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                  Structure suggérée
                </h3>
                <ul className="space-y-1">
                  {chapterMeta.structure.map((s, i) => (
                    <li key={i} className="text-[11px] text-slate-500 font-mono bg-slate-50 rounded px-2 py-1">{s}</li>
                  ))}
                </ul>
              </div>

              {/* Conseils de rédaction */}
              <Separator />
              <div>
                <h3 className="text-xs font-bold text-amber-800 flex items-center gap-1.5 mb-1.5">
                  <PenLine className="h-3.5 w-3.5 text-amber-500" />
                  Conseils de rédaction
                </h3>
                <ul className="space-y-1.5">
                  {chapterMeta.writingTips.map((tip, i) => (
                    <li key={i} className="text-[11px] text-amber-900/80 bg-amber-50/70 border border-amber-100 rounded-md px-2.5 py-1.5 leading-relaxed">
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Erreurs fréquentes */}
              <Separator />
              <div>
                <h3 className="text-xs font-bold text-rose-800 flex items-center gap-1.5 mb-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                  Erreurs fréquentes
                </h3>
                <ul className="space-y-1.5">
                  {chapterMeta.commonMistakes.map((mistake, i) => (
                    <li key={i} className="text-[11px] text-rose-900/80 bg-rose-50/70 border border-rose-100 rounded-md px-2.5 py-1.5 leading-relaxed">
                      {mistake}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Livres recommandés */}
              {recommendedBooks.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-1.5">
                      <BookMarked className="h-3.5 w-3.5 text-emerald-600" />
                      Livres recommandés pour ce chapitre
                    </h3>
                    <div className="space-y-1.5">
                      {recommendedBooks.map((book) => {
                        const resource = RESOURCES.find(r => r.id === book.id)
                        const relevance = book.relevance.find(r => r.chapterType === chapterMeta?.number || r.chapterType === 'all')
                        return (
                          <div key={book.id} className="text-[11px] text-slate-700 bg-emerald-50/50 border border-emerald-100 rounded-md px-2.5 py-2 leading-relaxed">
                            <p className="font-semibold text-emerald-800">{book.title}</p>
                            <p className="text-slate-500 text-[10px]">{book.author}{resource ? ` (${resource.year})` : ''}</p>
                            {relevance && (
                              <p className="text-emerald-700/80 text-[10px] mt-1 italic">{relevance.reason}</p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Moves rhétoriques */}
              <Separator />
              <div>
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-1.5">
                  <Target className="h-3.5 w-3.5 text-emerald-600" />
                  Moves rhétoriques
                </h3>
                {rhetoricalMoves.length > 0 ? (
                  <>
                    {/* Progress bar */}
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                          style={{ width: rhetoricalMoves.length > 0 ? `${(checkedCount / rhetoricalMoves.length) * 100}%` : '0%' }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium tabular-nums whitespace-nowrap">
                        {checkedCount}/{rhetoricalMoves.length} vérifié(s)
                      </span>
                    </div>
                    {/* Grouped by severity */}
                    {(['critical', 'important', 'recommended'] as const).map(severity => {
                      const moves = rhetoricalMoves.filter(m => m.severity === severity)
                      if (moves.length === 0) return null
                      return (
                        <div key={severity} className="mb-2.5 last:mb-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={cn('h-2 w-2 rounded-full shrink-0', SEVERITY_COLORS[severity])} />
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                              {SEVERITY_LABELS[severity]}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {moves.map((move: RhetoricalMove) => {
                              const isChecked = checkedMoves.has(move.id)
                              const isExpanded = expandedTip === move.id
                              return (
                                <div
                                  key={move.id}
                                  className={cn(
                                    'rounded-md border px-2.5 py-1.5 transition-colors',
                                    isChecked
                                      ? 'bg-emerald-50/70 border-emerald-200'
                                      : 'bg-white border-slate-150 hover:border-slate-200',
                                  )}
                                >
                                  <label className="flex items-start gap-2 cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => toggleMove(move.id)}
                                      className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 mt-0.5 accent-emerald-600 shrink-0"
                                    />
                                    <span className={cn(
                                      'text-[11px] leading-relaxed',
                                      isChecked ? 'text-slate-500 line-through' : 'text-slate-700',
                                    )}>
                                      {move.label}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        setExpandedTip(isExpanded ? null : move.id)
                                      }}
                                      className="shrink-0 ml-auto mt-0.5 text-slate-400 hover:text-slate-600 transition-colors"
                                      title={move.tip}
                                    >
                                      <Info className="h-3 w-3" />
                                    </button>
                                  </label>
                                  {isExpanded && (
                                    <p className="text-[10px] text-slate-500 leading-relaxed mt-1 ml-5.5 pl-0.5 border-l-2 border-slate-200">
                                      {move.tip}
                                    </p>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </>
                ) : null}
              </div>

              {/* Sources */}
              <Separator />
              <Collapsible open={sourcesOpen} onOpenChange={setSourcesOpen}>
                <CollapsibleTrigger className="w-full flex items-center justify-between group">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-slate-500" />
                    Sources
                  </h3>
                  <ChevronDown className={cn(
                    'h-3.5 w-3.5 text-slate-400 transition-transform duration-200',
                    sourcesOpen && 'rotate-180',
                  )} />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-1.5">
                  {writingSources.map((source) => (
                    <div key={source.id} className="text-[10px] text-slate-600 bg-slate-50 border border-slate-100 rounded-md px-2.5 py-1.5">
                      <p className="font-semibold text-slate-700">{source.author} ({source.year})</p>
                      <p className="italic text-slate-500 mt-0.5">{source.title}</p>
                      <p className="text-slate-400 mt-0.5">{source.publisher}</p>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </>
          ) : (
            <div className="text-center py-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto">
                <FileText className="h-5 w-5 text-slate-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700">Chapitre personnalisé</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Ce chapitre ne fait pas partie du template IMRaD par défaut.
                  Vous êtes libre de le structurer selon vos besoins.
                </p>
              </div>
              <div className="text-[11px] text-slate-400 bg-slate-50 rounded-lg p-3 text-left space-y-1.5">
                <p className="font-semibold text-slate-600">Conseils :</p>
                <p>• Définissez clairement l&apos;objectif de ce chapitre</p>
                <p>• Structurez avec des titres et sous-titres</p>
                <p>• Utilisez l&apos;onglet IA pour obtenir de l&apos;aide à la rédaction</p>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── AI TAB ── */}
        <TabsContent value="ai" className="flex-1 flex flex-col min-h-0 mt-0">
          <div className="px-3 pt-2 flex items-center gap-2">
            <select
              value={aiMode}
              onChange={e => onAiModeChange(e.target.value)}
              className="flex-1 text-[11px] border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            >
              <option value="scientific-writing">Rédaction scientifique</option>
              <option value="literature-review">Revue de littérature</option>
              <option value="paraphrase">Paraphrase</option>
              <option value="peer-review">Relecture critique</option>
              <option value="abstract">Résumé & Abstract</option>
              <option value="hypothesis">Génération d'hypothèses</option>
              <option value="methodo-positioning">Positionnement méthodo.</option>
              <option value="theory-building">Construction théorique</option>
              <option value="supervision-document">Doc. de supervision</option>
              <option value="conference-presentation">Présentation conf.</option>
            </select>
            <button
              onClick={onOpenProviderSettings}
              className={cn(
                'p-1.5 rounded-lg border transition-colors shrink-0',
                aiProvider === 'z-ai'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  : 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100'
              )}
              title="Configurer le fournisseur IA"
            >
              <Settings className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="px-3 pt-1">
            <Badge variant="outline" className={cn('text-[9px]', aiProvider === 'z-ai' ? 'border-emerald-300 text-emerald-700' : 'border-violet-300 text-violet-700')}>
              {aiProvider === 'z-ai' ? 'Z.ai (par défaut)' : aiProvider.toUpperCase()}
            </Badge>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
            {aiMessages.length === 0 && (
              <div className="text-center py-8">
                <Sparkles className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                <p className="text-[11px] text-muted-foreground">Posez une question à l&apos;IA pour ce chapitre</p>
              </div>
            )}
            {aiMessages.map((msg, i) => (
              <div key={i} className={cn('text-[11px] rounded-lg p-2.5',
                msg.role === 'user' ? 'bg-primary text-primary-foreground ml-6' : 'bg-slate-50 text-slate-700 mr-6',
              )}>
                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
              </div>
            ))}
            {aiLoading && <Loader2 className="h-4 w-4 text-emerald-500 animate-spin mx-auto" />}
          </div>
          <div className="p-2 border-t">
            <div className="flex gap-1">
              <Textarea
                value={aiInput}
                onChange={e => onAiInputChange(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onAiSend() } }}
                placeholder="Votre question..."
                className="min-h-[36px] max-h-[80px] text-[11px] resize-none"
                rows={1}
              />
              <Button onClick={onAiSend} disabled={!aiInput.trim() || aiLoading} size="icon" className="h-9 w-9 shrink-0">
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ── DIRECTOR TAB ── */}
        <TabsContent value="director" className="flex-1 overflow-y-auto p-3 mt-2 space-y-3">
          <ChapterBalance chapters={thesis.chapters} />

          <div className="border-t border-slate-200 pt-3">
            <div className={cn('rounded-lg border p-3', colors.light, colors.border)}>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className={cn('h-4 w-4', colors.text)} />
                <span className="text-xs font-bold">Évaluation du chapitre</span>
              </div>
              <p className="text-[10px] text-slate-600">
                Le directeur évaluera le chapitre que vous avez rédigé et vous donnera un avis structuré.
              </p>
              <Button
                onClick={onDirectorSubmit}
                disabled={directorLoading || !activeChapter?.content}
                size="sm"
                className="w-full mt-3 text-xs"
              >
                {directorLoading ? <Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> : <ShieldCheck className="h-3 w-3 mr-1.5" />}
                {directorLoading ? 'Évaluation en cours...' : 'Soumettre ce chapitre'}
              </Button>
            </div>
          </div>

          {directorFeedback && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                <span className="text-[11px] font-bold text-amber-800">Avis du directeur</span>
              </div>
              <div className="text-[11px] text-amber-900 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                {directorFeedback}
              </div>
            </div>
          )}

          {activeChapter?.directorFeedback && !directorFeedback && (
            <div className="rounded-lg border border-sky-200 bg-sky-50/50 p-3">
              <span className="text-[10px] font-bold text-sky-700">Dernier avis :</span>
              <div className="text-[11px] text-sky-900 whitespace-pre-wrap leading-relaxed mt-1 max-h-48 overflow-y-auto">
                {activeChapter.directorFeedback}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </aside>
  )
}
