'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Brain, Zap, Globe, Loader2, Send, ChevronDown, ChevronUp,
  ShieldCheck, ShieldAlert, ShieldQuestion, Clock, Users,
  CheckCheck, Sparkles, Copy, Check, MessageSquare, ArrowRight,
  BarChart3, Eye, EyeOff, Lightbulb,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'

// ─── Types ──────────────────────────────────────────────
interface ResearcherResponse {
  researcherId: string
  researcherName: string
  researcherRole: string
  response: string
  keyPoints: string[]
  confidence: number
  duration: number
}

interface ConsensusPoint {
  point: string
  agreement: number
  supportingResearchers: string[]
  confidence: 'high' | 'medium' | 'low'
}

interface AggregateResult {
  success: boolean
  aggregatedResponse: string
  researchers: ResearcherResponse[]
  consensusPoints: ConsensusPoint[]
  consensusScore: number
  researchMode: 'fast' | 'deep'
  totalDuration: number
}

interface IthyResearchPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  thesisTitle?: string
  thesisField?: string
  chapterTitle?: string
  onInsertText?: (text: string) => void
}

// ─── Researcher color map ─────────────────────────────
const RESEARCHER_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  analyste: { bg: 'bg-sky-950/50', border: 'border-sky-800/50', text: 'text-sky-300', dot: 'bg-sky-400' },
  synthetiseur: { bg: 'bg-emerald-950/50', border: 'border-emerald-800/50', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  innovateur: { bg: 'bg-amber-950/50', border: 'border-amber-800/50', text: 'text-amber-300', dot: 'bg-amber-400' },
  methodologue: { bg: 'bg-violet-950/50', border: 'border-violet-800/50', text: 'text-violet-300', dot: 'bg-violet-400' },
  bibliographe: { bg: 'bg-rose-950/50', border: 'border-rose-800/50', text: 'text-rose-300', dot: 'bg-rose-400' },
}

// ─── Consensus Icon ────────────────────────────────────
function ConsensusIcon({ level }: { level: 'high' | 'medium' | 'low' }) {
  if (level === 'high') return <ShieldCheck className="size-3.5 text-emerald-400" />
  if (level === 'medium') return <ShieldAlert className="size-3.5 text-amber-400" />
  return <ShieldQuestion className="size-3.5 text-slate-400" />
}

// ─── Consensus Score Ring ─────────────────────────────
function ConsensusScoreRing({ score }: { score: number }) {
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - score / 100)
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#64748b'

  return (
    <div className="relative w-16 h-16 shrink-0">
      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="#1e293b" strokeWidth="4" />
        <circle
          cx="32" cy="32" r={radius} fill="none"
          stroke={color} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold" style={{ color }}>{score}</span>
        <span className="text-[8px] text-slate-500">consensus</span>
      </div>
    </div>
  )
}

// ─── History entry ─────────────────────────────────────
interface HistoryEntry {
  id: string
  question: string
  mode: 'fast' | 'deep'
  result: AggregateResult
  timestamp: number
}

// ─── Main Component ─────────────────────────────────────
export default function IthyResearchPanel({
  open, onOpenChange, thesisTitle, thesisField, chapterTitle, onInsertText,
}: IthyResearchPanelProps) {
  const [question, setQuestion] = useState('')
  const [mode, setMode] = useState<'fast' | 'deep'>('fast')
  const [loading, setLoading] = useState(false)
  const [currentResult, setCurrentResult] = useState<AggregateResult | null>(null)
  const [expandedResearchers, setExpandedResearchers] = useState<Set<string>>(new Set())
  const [showConsensus, setShowConsensus] = useState(true)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [viewingHistory, setViewingHistory] = useState(false)
  const [copied, setCopied] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [open])

  // Auto-scroll when result arrives
  useEffect(() => {
    if (currentResult && scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement | null
      if (viewport) {
        requestAnimationFrame(() => { viewport.scrollTop = 0 })
      }
    }
  }, [currentResult])

  const handleResearch = useCallback(async () => {
    const trimmed = question.trim()
    if (!trimmed || loading) return

    setLoading(true)
    setCurrentResult(null)
    setViewingHistory(false)

    try {
      const res = await fetch('/api/ai-aggregate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: trimmed,
          mode,
          thesisTitle: thesisTitle || undefined,
          thesisField: thesisField || undefined,
          chapterTitle: chapterTitle || undefined,
        }),
      })

      const data: AggregateResult = await res.json()

      if (res.ok && data.success) {
        setCurrentResult(data)
        const entry: HistoryEntry = {
          id: `research_${Date.now()}`,
          question: trimmed,
          mode,
          result: data,
          timestamp: Date.now(),
        }
        setHistory(prev => [entry, ...prev].slice(0, 20))
      } else {
        setCurrentResult({
          success: false,
          aggregatedResponse: `Erreur : ${data.consensusScore !== undefined ? 'Erreur interne' : (data as any).error || 'Erreur inconnue'}`,
          researchers: [],
          consensusPoints: [],
          consensusScore: 0,
          researchMode: mode,
          totalDuration: 0,
        })
      }
    } catch {
      setCurrentResult({
        success: false,
        aggregatedResponse: 'Erreur de connexion. Vérifiez votre connexion internet et réessayez.',
        researchers: [],
        consensusPoints: [],
        consensusScore: 0,
        researchMode: mode,
        totalDuration: 0,
      })
    } finally {
      setLoading(false)
    }
  }, [question, loading, mode, thesisTitle, thesisField, chapterTitle])

  const toggleResearcher = (id: string) => {
    setExpandedResearchers(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleCopy = () => {
    if (!currentResult?.aggregatedResponse) return
    navigator.clipboard.writeText(currentResult.aggregatedResponse).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleInsert = () => {
    if (!currentResult?.aggregatedResponse || !onInsertText) return
    // Strip markdown for insertion
    const text = currentResult.aggregatedResponse
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0)
      .join('\n\n')
    onInsertText(text)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleResearch()
    }
  }

  const isLoadingPhase = loading && !currentResult

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="sm:max-w-[680px] p-0 bg-slate-950 border-slate-800 flex flex-col h-full [&>button:last-child]:hidden"
      >
        {/* ── Header ── */}
        <SheetHeader className="flex-row items-center justify-between px-5 py-3 border-b border-slate-800 shrink-0">
          <SheetTitle className="flex items-center gap-2 text-base text-slate-100">
            <div className="flex items-center gap-1.5">
              <Brain className="size-5 text-amber-400" />
              <span>Recherche Agrégée</span>
            </div>
            <Badge variant="outline" className="text-[9px] font-normal px-1.5 py-0 border-amber-700/50 text-amber-400 bg-amber-950/30">
              inspiré par Ithy
            </Badge>
          </SheetTitle>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 gap-1"
                onClick={() => setViewingHistory(!viewingHistory)}
              >
                <MessageSquare className="size-3" />
                Historique ({history.length})
              </Button>
            )}
          </div>
        </SheetHeader>

        {/* ── Input area ── */}
        <div className="shrink-0 border-b border-slate-800/50 px-5 py-3 space-y-3">
          {/* Mode toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode('fast')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                mode === 'fast'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              )}
            >
              <Zap className="size-3.5" />
              Recherche Rapide
              <span className="text-[9px] opacity-60">3 chercheurs</span>
            </button>
            <button
              onClick={() => setMode('deep')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                mode === 'deep'
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              )}
            >
              <Globe className="size-3.5" />
              Recherche Approfondie
              <span className="text-[9px] opacity-60">5 chercheurs</span>
            </button>
          </div>

          {/* Search input */}
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Posez votre question de recherche..."
              disabled={loading}
              className="flex-1 h-10 bg-slate-900 border-slate-700 text-sm text-slate-200 placeholder:text-slate-500 focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50"
            />
            <Button
              size="icon"
              className="size-10 shrink-0 bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-50"
              disabled={!question.trim() || loading}
              onClick={handleResearch}
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </Button>
          </div>

          {/* Context badges */}
          {(thesisTitle || chapterTitle) && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[9px] text-slate-500">Contexte :</span>
              {thesisTitle && (
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-slate-700 text-slate-400">
                  {thesisTitle.length > 30 ? thesisTitle.slice(0, 30) + '...' : thesisTitle}
                </Badge>
              )}
              {chapterTitle && (
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-slate-700 text-slate-400">
                  Chap. {chapterTitle}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* ── Content area ── */}
        <div ref={scrollRef} className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-5">
              {/* ── Loading state ── */}
              {isLoadingPhase && (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-2 border-amber-500/30 border-t-amber-400 animate-spin" />
                    <Brain className="absolute inset-0 m-auto size-6 text-amber-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-300 font-medium">
                      {mode === 'fast' ? 'Recherche rapide en cours...' : 'Recherche approfondie en cours...'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {mode === 'fast' ? '3 chercheurs analysent votre question' : '5 chercheurs analysent votre question en parallèle'}
                    </p>
                  </div>
                  {/* Animated researcher dots */}
                  <div className="flex items-center gap-3 mt-2">
                    {Array.from({ length: mode === 'deep' ? 5 : 3 }).map((_, i) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                          <Loader2 className="size-3 text-slate-400 animate-spin" style={{ animationDelay: `${i * 200}ms` }} />
                        </div>
                        <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500/60 rounded-full animate-pulse"
                            style={{ animationDelay: `${i * 150}ms`, width: '60%' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── History view ── */}
              {viewingHistory && !isLoadingPhase && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Historique des recherches</h3>
                  {history.map(entry => (
                    <button
                      key={entry.id}
                      onClick={() => { setCurrentResult(entry.result); setQuestion(entry.question); setMode(entry.mode); setViewingHistory(false) }}
                      className="w-full text-left p-3 rounded-xl bg-slate-900/60 border border-slate-800/50 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={cn(
                          'text-[9px] px-1.5 py-0',
                          entry.mode === 'deep' ? 'border-violet-700/50 text-violet-400' : 'border-amber-700/50 text-amber-400'
                        )}>
                          {entry.mode === 'deep' ? 'Approfondie' : 'Rapide'}
                        </Badge>
                        <span className="text-[10px] text-slate-500">
                          {(entry.result.totalDuration / 1000).toFixed(1)}s
                        </span>
                        <span className="text-[10px] text-slate-500 ml-auto">
                          {new Date(entry.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-2">{entry.question}</p>
                    </button>
                  ))}
                </div>
              )}

              {/* ── Empty state ── */}
              {!currentResult && !isLoadingPhase && !viewingHistory && (
                <div className="flex flex-col items-center justify-center py-16 gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-violet-500/20 border border-amber-500/20 flex items-center justify-center">
                    <Brain className="size-10 text-amber-400" />
                  </div>
                  <div className="text-center max-w-sm">
                    <h3 className="text-sm font-semibold text-slate-200 mb-1">Recherche multi-IA agrégée</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Plusieurs chercheurs IA analysent votre question en parallèle, puis leurs réponses sont synthétisées pour produire une réponse de haute qualité avec score de consensus.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/50 text-center">
                      <Users className="size-4 text-amber-400 mx-auto mb-1" />
                      <p className="text-[10px] text-slate-400">3-5 chercheurs</p>
                      <p className="text-[9px] text-slate-500">en parallèle</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/50 text-center">
                      <CheckCheck className="size-4 text-emerald-400 mx-auto mb-1" />
                      <p className="text-[10px] text-slate-400">Score de consensus</p>
                      <p className="text-[9px] text-slate-500">auto-calculé</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/50 text-center">
                      <Zap className="size-4 text-sky-400 mx-auto mb-1" />
                      <p className="text-[10px] text-slate-400">Mode rapide</p>
                      <p className="text-[9px] text-slate-500">synthèse concise</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/50 text-center">
                      <Globe className="size-4 text-violet-400 mx-auto mb-1" />
                      <p className="text-[10px] text-slate-400">Mode approfondi</p>
                      <p className="text-[9px] text-slate-500">analyse complète</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-slate-500">
                      <Lightbulb className="size-3 inline-block mr-1 text-amber-500" />
                      Astuce : le mode rapide est 3× plus rapide que l'approfondi
                    </p>
                  </div>
                </div>
              )}

              {/* ── Result display ── */}
              {currentResult && !isLoadingPhase && !viewingHistory && (
                <div className="space-y-4">
                  {/* Meta bar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn(
                        'text-[10px] px-2 py-0.5',
                        currentResult.researchMode === 'deep'
                          ? 'border-violet-700/50 text-violet-400 bg-violet-950/30'
                          : 'border-amber-700/50 text-amber-400 bg-amber-950/30'
                      )}>
                        {currentResult.researchMode === 'deep' ? 'Recherche Approfondie' : 'Recherche Rapide'}
                      </Badge>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="size-3" />
                        {(currentResult.totalDuration / 1000).toFixed(1)}s
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Users className="size-3" />
                        {currentResult.researchers.length} chercheurs
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleCopy}
                        className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                        title="Copier la synthèse"
                      >
                        {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                      </button>
                      {onInsertText && (
                        <button
                          onClick={handleInsert}
                          className="p-1.5 rounded-md text-slate-400 hover:text-emerald-300 hover:bg-slate-800 transition-colors"
                          title="Insérer dans l'éditeur"
                        >
                          <ArrowRight className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Consensus Score + Points */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/50">
                    <div className="flex items-start gap-4">
                      <ConsensusScoreRing score={currentResult.consensusScore} />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-2">
                          <BarChart3 className="size-3.5 text-amber-400" />
                          Score de Consensus
                        </h4>
                        <button
                          onClick={() => setShowConsensus(!showConsensus)}
                          className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-300 transition-colors mb-2"
                        >
                          {showConsensus ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                          {currentResult.consensusPoints.length} point{currentResult.consensusPoints.length !== 1 ? 's' : ''} de consensus identifié{currentResult.consensusPoints.length !== 1 ? 's' : ''}
                        </button>

                        {showConsensus && currentResult.consensusPoints.length > 0 && (
                          <div className="space-y-1.5 max-h-48 overflow-y-auto">
                            {currentResult.consensusPoints.map((cp, i) => (
                              <div
                                key={i}
                                className={cn(
                                  'flex items-start gap-2 p-2 rounded-lg text-[11px]',
                                  cp.confidence === 'high' ? 'bg-emerald-950/30 border border-emerald-800/30' :
                                  cp.confidence === 'medium' ? 'bg-amber-950/30 border border-amber-800/30' :
                                  'bg-slate-800/30 border border-slate-700/30'
                                )}
                              >
                                <ConsensusIcon level={cp.confidence} />
                                <div className="flex-1 min-w-0">
                                  <p className={cn(
                                    cp.confidence === 'high' ? 'text-emerald-200' :
                                    cp.confidence === 'medium' ? 'text-amber-200' :
                                    'text-slate-300'
                                  )}>
                                    {cp.point}
                                  </p>
                                  <p className="text-[9px] text-slate-500 mt-0.5">
                                    {cp.supportingResearchers.length}/{currentResult.researchers.length} chercheurs d'accord
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {currentResult.consensusPoints.length === 0 && (
                          <p className="text-[10px] text-slate-500 italic">Aucun point de consensus clair identifié entre les chercheurs.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── Aggregated Response ── */}
                  <div className="rounded-xl bg-slate-900/40 border border-slate-800/50 overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-slate-800/50 flex items-center gap-2">
                      <Sparkles className="size-3.5 text-amber-400" />
                      <span className="text-xs font-semibold text-slate-200">Synthèse Agrégée</span>
                    </div>
                    <div className="p-4">
                      <div className="prose prose-invert prose-sm max-w-none
                        [&_p]:mb-2 [&_p:last-child]:mb-0
                        [&_ul]:mb-2 [&_ol]:mb-2 [&_li]:mb-0.5
                        [&_strong]:text-amber-200
                        [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-xs
                        [&_h2]:text-amber-200 [&_h3]:text-slate-300
                        [&_code]:text-amber-300 [&_code]:bg-slate-800 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded
                        [&_blockquote]:border-l-2 [&_blockquote]:border-amber-700 [&_blockquote]:pl-3 [&_blockquote]:italic
                        [&_hr]:border-slate-700
                        [&_pre]:bg-slate-900 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto">
                        <ReactMarkdown>{currentResult.aggregatedResponse}</ReactMarkdown>
                      </div>
                    </div>
                  </div>

                  {/* ── Individual Researchers ── */}
                  <div>
                    <button
                      onClick={() => {
                        const allIds = new Set(currentResult.researchers.map(r => r.researcherId))
                        if (expandedResearchers.size === allIds.size) {
                          setExpandedResearchers(new Set())
                        } else {
                          setExpandedResearchers(allIds)
                        }
                      }}
                      className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors mb-2"
                    >
                      <Eye className="size-3" />
                      Détails par chercheur
                      {expandedResearchers.size === currentResult.researchers.length ? <EyeOff className="size-3" /> : null}
                    </button>

                    <div className="space-y-2">
                      {currentResult.researchers.map((researcher) => {
                        const colors = RESEARCHER_COLORS[researcher.researcherId] || RESEARCHER_COLORS.analyste
                        const isExpanded = expandedResearchers.has(researcher.researcherId)

                        return (
                          <div key={researcher.researcherId} className={cn(
                            'rounded-xl border transition-all',
                            colors.bg, colors.border
                          )}>
                            <button
                              onClick={() => toggleResearcher(researcher.researcherId)}
                              className="w-full flex items-center gap-3 p-3 text-left"
                            >
                              <div className={cn('w-2 h-2 rounded-full shrink-0', colors.dot)} />
                              <div className="flex-1 min-w-0">
                                <p className={cn('text-xs font-medium', colors.text)}>{researcher.researcherName}</p>
                                <p className="text-[10px] text-slate-500">{researcher.researcherRole}</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[9px] text-slate-500 flex items-center gap-1">
                                  <Clock className="size-2.5" />{(researcher.duration / 1000).toFixed(1)}s
                                </span>
                                <span className={cn(
                                  'text-[9px] px-1.5 py-0.5 rounded-full',
                                  researcher.confidence > 0.7 ? 'bg-emerald-900/40 text-emerald-400' :
                                  researcher.confidence > 0.4 ? 'bg-amber-900/40 text-amber-400' :
                                  'bg-slate-800 text-slate-400'
                                )}>
                                  {Math.round(researcher.confidence * 100)}%
                                </span>
                                {isExpanded ? <ChevronUp className="size-3 text-slate-400" /> : <ChevronDown className="size-3 text-slate-400" />}
                              </div>
                            </button>

                            {isExpanded && (
                              <div className="px-3 pb-3 border-t border-slate-800/30">
                                <div className="prose prose-invert prose-xs max-w-none mt-2
                                  [&_p]:mb-1.5 [&_p:last-child]:mb-0
                                  [&_strong]:text-slate-200
                                  [&_li]:mb-0.5
                                  [&_code]:text-slate-300 [&_code]:bg-slate-800 [&_code]:px-0.5 [&_code]:rounded">
                                  <ReactMarkdown>{researcher.response}</ReactMarkdown>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 border-t border-slate-800/50 px-5 py-2 flex items-center justify-between">
          <span className="text-[10px] text-slate-500">
            Multi-IA agrégée · {mode === 'fast' ? '3' : '5'} chercheurs · Score de consensus
          </span>
          {history.length > 0 && (
            <span className="text-[10px] text-slate-500">
              {history.length} recherche{history.length > 1 ? 's' : ''} effectuée{history.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
