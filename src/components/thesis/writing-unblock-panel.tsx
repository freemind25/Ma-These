'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  Brain, Sparkles, Users, Clock, PencilRuler, ArrowRight, Copy, Check,
  Play, Pause, RotateCcw, ChevronRight, TimerReset,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

// ─── Types ──────────────────────────────────────────────
interface WritingUnblockPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  chapterTitle?: string
  onInsertText?: (text: string) => void
}

type BlockType = 'cognitif' | 'perfectionnisme' | 'audience' | 'logistique' | null

type ChapterType = 'introduction' | 'bibliographie' | 'methodologie' | 'resultats' | 'discussion' | 'conclusion' | 'generic'

// ─── Block Types Data ──────────────────────────────────
const BLOCK_TYPES: Array<{
  id: BlockType
  title: string
  subtitle: string
  icon: typeof Brain
  color: string
  borderColor: string
  bgColor: string
  iconColor: string
  description: string
  recommendation: string
}> = [
  {
    id: 'cognitif',
    title: 'Blocage cognitif',
    subtitle: "Le contenu n'est pas encore assez clair",
    icon: Brain,
    color: 'rose',
    borderColor: 'border-rose-800/40',
    bgColor: 'bg-rose-950/20',
    iconColor: 'text-rose-400',
    description: "Je ne sais pas encore ce que je veux dire exactement.",
    recommendation: "Revenir à la littérature ou à l'analyse. Pas plus d'heures d'écriture — le blocage est dans la pensée, pas dans la rédaction.",
  },
  {
    id: 'perfectionnisme',
    title: "Blocage de perfectionnisme",
    subtitle: "Le contenu est là mais je n'ose pas l'écrire",
    icon: Sparkles,
    color: 'amber',
    borderColor: 'border-amber-800/40',
    bgColor: 'bg-amber-950/20',
    iconColor: 'text-amber-400',
    description: "J'ai des idées mais rien n'est assez bon pour être écrit.",
    recommendation: "Utiliser l'onglet Freewriting ou l'écriture en couches. Autoriser explicitement un premier jet médiocre — c'est normal et attendu.",
  },
  {
    id: 'audience',
    title: "Blocage d'audience",
    subtitle: "Je ne sais pas pour qui j'écris",
    icon: Users,
    color: 'sky',
    borderColor: 'border-sky-800/40',
    bgColor: 'bg-sky-950/20',
    iconColor: 'text-sky-400',
    description: "Je ne parviens pas à trouver le bon ton ni le bon niveau de détail.",
    recommendation: "Clarifier le lecteur visé : jury, communauté disciplinaire, futurs praticiens. Chaque lecteur attend un registre différent.",
  },
  {
    id: 'logistique',
    title: 'Blocage logistique',
    subtitle: "Les conditions ne sont pas réunies",
    icon: Clock,
    color: 'slate',
    borderColor: 'border-slate-700/40',
    bgColor: 'bg-slate-800/30',
    iconColor: 'text-slate-400',
    description: "Lieu inadapté, interruptions, pas de temps dédié.",
    recommendation: "Travailler sur les conditions matérielles : bloquer un créneau fixe (même 30 min), trouver un lieu dédié, désactiver les notifications.",
  },
]

// ─── Amorce Sets ──────────────────────────────────────
const AMORCE_SETS: Record<ChapterType, string[]> = {
  generic: [
    'Ce chapitre montre que...',
    'La question que je pose ici est...',
    "Ce qui est essentiel dans cette section, c'est...",
    "L'argument central de cette partie est...",
    "Pourquoi cette section est importante pour la thèse : ...",
  ],
  introduction: [
    'Le domaine de [X] a connu des transformations profondes au cours des dernières années...',
    "Malgré les avancées récentes, un aspect reste insuffisamment exploré : ...",
    'Cette thèse part du constat que...',
    "Si l'on examine la littérature existante, on constate que...",
    "L'originalité de notre approche réside dans le fait que...",
  ],
  bibliographie: [
    "Plusieurs courants théoriques se sont penchés sur la question de...",
    "Tandis que [Auteur A] soutient que..., [Auteur B] nuance cette position en...",
    "Ce qui manque dans les travaux existants, c'est...",
    "En confrontant ces différentes perspectives, on observe que...",
    "Notre cadre conceptuel s'appuie sur...",
  ],
  methodologie: [
    'Nous avons choisi [méthode] parce que...',
    "Cette approche est la plus adaptée à notre question de recherche car...",
    "Contrairement à [méthode alternative], notre design permet de...",
    "L'unité d'analyse retenue est [X] pour les raisons suivantes...",
    "Les limites de cette méthode sont...",
  ],
  resultats: [
    'Les données recueillies révèlent que...',
    "Comme l'illustre le tableau [X], nous observons que...",
    "Contrairement à notre hypothèse, les résultats montrent que...",
    "L'analyse [statistique/thématique] fait ressortir...",
    "Ces résultats sont cohérents avec les travaux de [Auteur] qui...",
  ],
  discussion: [
    "Ces résultats suggèrent que...",
    "La divergence avec les travaux de [Auteur] pourrait s'expliquer par...",
    "En termes d'implications pratiques, ces résultats indiquent que...",
    "La principale limite de cette étude réside dans...",
    "Ces résultats ouvrent la voie à des recherches futures sur...",
  ],
  conclusion: [
    "Cette thèse avait pour objectif de...",
    "Les résultats obtenus permettent de répondre à la problématique : ...",
    "La contribution principale de ce travail est...",
    "Ces résultats modifient la compréhension de [X] en...",
    "À plus long terme, ces résultats pourraient permettre de...",
  ],
}

// ─── Chapter type detection ────────────────────────────
function detectChapterType(title?: string): ChapterType {
  if (!title) return 'generic'
  const lower = title.toLowerCase()
  if (/intro/.test(lower)) return 'introduction'
  if (/biblio|revue|état de l'art|état de l\'art/.test(lower)) return 'bibliographie'
  if (/méth|meth/.test(lower)) return 'methodologie'
  if (/résultat|resultat|result/.test(lower)) return 'resultats'
  if (/discuss/.test(lower)) return 'discussion'
  if (/conclu/.test(lower)) return 'conclusion'
  return 'generic'
}

const CHAPTER_TYPE_LABELS: Record<ChapterType, string> = {
  generic: 'Générique',
  introduction: 'Introduction',
  bibliographie: 'Bibliographie',
  methodologie: 'Méthodologie',
  resultats: 'Résultats',
  discussion: 'Discussion',
  conclusion: 'Conclusion',
}

// ─── Timer formatting ──────────────────────────────────
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// ─── Component ─────────────────────────────────────────
export default function WritingUnblockPanel({
  open,
  onOpenChange,
  chapterTitle,
  onInsertText,
}: WritingUnblockPanelProps) {
  const [activeTab, setActiveTab] = useState('diagnostic')
  const [selectedBlock, setSelectedBlock] = useState<BlockType>(null)
  const [copiedAmorce, setCopiedAmorce] = useState<string | null>(null)

  // Freewriting state
  const [duration, setDuration] = useState(5)
  const [timeLeft, setTimeLeft] = useState(5 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [freeText, setFreeText] = useState('')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const detectedType = detectChapterType(chapterTitle)
  const amorces = AMORCE_SETS[detectedType]

  // Handle duration change (only when idle)
  const handleDurationChange = useCallback((newDuration: number) => {
    setDuration(newDuration)
    if (!isRunning && !isPaused) {
      setTimeLeft(newDuration * 60)
      setIsComplete(false)
    }
  }, [isRunning, isPaused])

  // Timer tick
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false)
            setIsPaused(false)
            setIsComplete(true)
            if (intervalRef.current) clearInterval(intervalRef.current)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, isPaused])

  const handleStart = useCallback(() => {
    if (isComplete) {
      setTimeLeft(duration * 60)
      setIsComplete(false)
      setFreeText('')
    }
    setIsRunning(true)
    setIsPaused(false)
    // Focus textarea after a brief delay
    setTimeout(() => textareaRef.current?.focus(), 100)
  }, [isComplete, duration])

  const handlePause = useCallback(() => {
    setIsPaused(prev => !prev)
  }, [])

  const handleReset = useCallback(() => {
    setIsRunning(false)
    setIsPaused(false)
    setIsComplete(false)
    setTimeLeft(duration * 60)
    setFreeText('')
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [duration])

  const handleCopyAmorce = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAmorce(text)
      setTimeout(() => setCopiedAmorce(null), 1500)
    })
  }, [])

  const handleInsertAmorce = useCallback((text: string) => {
    if (onInsertText) {
      onInsertText(text)
    }
  }, [onInsertText])

  const handleInsertFreeText = useCallback(() => {
    if (onInsertText && freeText.trim()) {
      onInsertText(`[Freewriting — à retravailler]\n${freeText}`)
    }
  }, [onInsertText, freeText])

  const handleCopyFreeText = useCallback(() => {
    if (freeText.trim()) {
      navigator.clipboard.writeText(`[Freewriting — à retravailler]\n${freeText}`)
    }
  }, [freeText])

  const goToFreewriting = useCallback(() => {
    setActiveTab('freewriting')
  }, [])

  const selectedBlockData = BLOCK_TYPES.find(b => b.id === selectedBlock)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="sm:max-w-[620px] p-0 bg-slate-950 border-slate-800 flex flex-col h-full [&>button:last-child]:hidden"
      >
        {/* ── Header ── */}
        <SheetHeader className="flex-row items-center justify-between px-5 py-3 border-b border-slate-800 shrink-0">
          <SheetTitle className="flex items-center gap-2 text-base text-slate-100">
            <div className="flex items-center gap-1.5">
              <PencilRuler className="size-5 text-emerald-400" />
              <span>Déblocage écriture</span>
            </div>
          </SheetTitle>
          {chapterTitle && (
            <Badge variant="outline" className="text-[9px] font-normal px-1.5 py-0 border-slate-700 text-slate-400 bg-slate-800/50">
              {chapterTitle}
            </Badge>
          )}
        </SheetHeader>

        {/* ── Tabs ── */}
        <div className="shrink-0 px-5 pt-3 pb-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-900 border border-slate-800 w-full h-9">
              <TabsTrigger
                value="diagnostic"
                className="text-xs data-[state=active]:bg-slate-800 data-[state=active]:text-slate-100 flex-1 gap-1.5"
              >
                <Brain className="size-3" />
                Diagnostic
              </TabsTrigger>
              <TabsTrigger
                value="freewriting"
                className="text-xs data-[state=active]:bg-slate-800 data-[state=active]:text-slate-100 flex-1 gap-1.5"
              >
                <TimerReset className="size-3" />
                Freewriting
              </TabsTrigger>
              <TabsTrigger
                value="amorces"
                className="text-xs data-[state=active]:bg-slate-800 data-[state=active]:text-slate-100 flex-1 gap-1.5"
              >
                <ArrowRight className="size-3" />
                Amorces
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-5">
              {activeTab === 'diagnostic' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Quel type de blocage rencontrez-vous ? Sélectionnez la description qui correspond le mieux à votre situation.
                  </p>

                  <div className="space-y-2">
                    {BLOCK_TYPES.map(block => {
                      const Icon = block.icon
                      const isSelected = selectedBlock === block.id
                      return (
                        <button
                          key={block.id}
                          onClick={() => setSelectedBlock(isSelected ? null : block.id)}
                          className={cn(
                            'w-full text-left p-3.5 rounded-xl border transition-all duration-200',
                            'hover:bg-slate-900/60',
                            isSelected
                              ? cn(block.bgColor, block.borderColor, 'ring-1 ring-offset-0 ring-offset-slate-950',
                                block.color === 'rose' ? 'ring-rose-500/20' :
                                block.color === 'amber' ? 'ring-amber-500/20' :
                                block.color === 'sky' ? 'ring-sky-500/20' :
                                'ring-slate-500/20')
                              : 'bg-slate-900/30 border-slate-800/50'
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border transition-colors',
                              isSelected
                                ? cn(block.bgColor, block.borderColor)
                                : 'bg-slate-800/50 border-slate-700/30'
                            )}>
                              <Icon className={cn('size-4', isSelected ? block.iconColor : 'text-slate-400')} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className={cn(
                                  'text-xs font-semibold',
                                  isSelected ? 'text-slate-100' : 'text-slate-300'
                                )}>
                                  {block.title}
                                </span>
                                {/* Radio indicator */}
                                <div className={cn(
                                  'w-3.5 h-3.5 rounded-full border-2 ml-auto shrink-0 transition-colors',
                                  isSelected
                                    ? block.color === 'rose' ? 'border-rose-400 bg-rose-400' :
                                      block.color === 'amber' ? 'border-amber-400 bg-amber-400' :
                                      block.color === 'sky' ? 'border-sky-400 bg-sky-400' :
                                      'border-slate-400 bg-slate-400'
                                    : 'border-slate-600'
                                )}>
                                  {isSelected && (
                                    <div className="w-full h-full rounded-full flex items-center justify-center">
                                      <div className="w-1 h-1 rounded-full bg-slate-950" />
                                    </div>
                                  )}
                                </div>
                              </div>
                              <p className={cn(
                                'text-[10px] font-medium mb-0.5',
                                isSelected ? 'text-slate-400' : 'text-slate-500'
                              )}>
                                {block.subtitle}
                              </p>
                              <p className="text-[11px] text-slate-500 leading-relaxed">
                                {block.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {/* Recommendation */}
                  {selectedBlockData && (
                    <div className="rounded-xl bg-emerald-950/20 border border-emerald-800/30 p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center">
                          <Check className="size-3.5 text-emerald-400" />
                        </div>
                        <h4 className="text-xs font-semibold text-emerald-300">Recommandation</h4>
                      </div>
                      <p className="text-xs text-emerald-200/80 leading-relaxed">
                        {selectedBlockData.recommendation}
                      </p>
                      <button
                        onClick={goToFreewriting}
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                      >
                        Voir les techniques
                        <ChevronRight className="size-3" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'freewriting' && (
                <div className="space-y-4">
                  {/* Rule reminder */}
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/40 border border-slate-800/50">
                    <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <TimerReset className="size-3.5 text-emerald-400" />
                    </div>
                    <p className="text-[11px] text-slate-300 font-medium">
                      Ne pas s'arrêter, ne pas corriger, ne pas juger
                    </p>
                  </div>

                  {/* Timer display */}
                  <div className="flex flex-col items-center gap-4 py-3">
                    <div
                      className={cn(
                        'text-5xl font-mono font-light tracking-wider tabular-nums transition-colors',
                        isRunning && !isPaused ? 'text-emerald-400' :
                        isPaused ? 'text-amber-400' :
                        isComplete ? 'text-slate-300' :
                        'text-slate-200',
                        isRunning && !isPaused && 'animate-pulse'
                      )}
                    >
                      {formatTime(timeLeft)}
                    </div>

                    {/* Duration selector */}
                    {!isRunning && !isPaused && !isComplete && (
                      <div className="flex items-center gap-2">
                        {[5, 10, 15].map(d => (
                          <button
                            key={d}
                            onClick={() => handleDurationChange(d)}
                            className={cn(
                              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                              duration === d
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                : 'text-slate-400 hover:text-slate-200 border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-800/50'
                            )}
                          >
                            {d} min
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                      {!isRunning && !isComplete && (
                        <Button
                          onClick={handleStart}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 text-xs"
                          size="sm"
                        >
                          <Play className="size-3.5" />
                          Commencer
                        </Button>
                      )}
                      {isRunning && !isPaused && (
                        <Button
                          onClick={handlePause}
                          variant="outline"
                          className="border-amber-600/40 text-amber-300 hover:bg-amber-950/30 gap-1.5 text-xs"
                          size="sm"
                        >
                          <Pause className="size-3.5" />
                          Pause
                        </Button>
                      )}
                      {isRunning && isPaused && (
                        <Button
                          onClick={handlePause}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 text-xs"
                          size="sm"
                        >
                          <Play className="size-3.5" />
                          Reprendre
                        </Button>
                      )}
                      {(isRunning || isPaused || isComplete) && (
                        <Button
                          onClick={handleReset}
                          variant="outline"
                          className="border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800 gap-1.5 text-xs"
                          size="sm"
                        >
                          <RotateCcw className="size-3.5" />
                          Réinitialiser
                        </Button>
                      )}
                    </div>

                    {/* Completion message */}
                    {isComplete && (
                      <div className="w-full p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/30">
                        <p className="text-xs text-emerald-200/90 leading-relaxed">
                          Session terminée ! Relisez ce que vous avez écrit. Le texte n'est pas utilisable tel quel — c'est normal. Identifiez les idées intéressantes à reprendre dans votre chapitre.
                        </p>
                      </div>
                    )}
                  </div>

                  <Separator className="bg-slate-800/50" />

                  {/* Text area */}
                  <div className="space-y-2">
                    <textarea
                      ref={textareaRef}
                      value={freeText}
                      onChange={e => setFreeText(e.target.value)}
                      disabled={!isRunning && !isPaused && !isComplete}
                      placeholder={
                        isComplete
                          ? 'Votre texte de freewriting apparaît ici...'
                          : "Commencez à écrire ici. L'important est de ne pas s'arrêter..."
                      }
                      className={cn(
                        'w-full min-h-[240px] resize-y rounded-xl bg-slate-900/50 border p-4 text-sm leading-relaxed placeholder:text-slate-600 focus:outline-none transition-colors',
                        isRunning && !isPaused
                          ? 'border-emerald-700/40 focus:border-emerald-600/50 text-slate-200 font-mono'
                          : 'border-slate-800/50 focus:border-slate-700/50 text-slate-300 font-mono',
                        (!isRunning && !isPaused && !isComplete) && 'opacity-50 cursor-not-allowed'
                      )}
                    />

                    {/* Word count */}
                    {freeText.trim().length > 0 && (
                      <p className="text-[10px] text-slate-500 text-right">
                        {freeText.trim().split(/\s+/).length} mots
                      </p>
                    )}

                    {/* Action buttons */}
                    {isComplete && freeText.trim() && (
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={handleCopyFreeText}
                          variant="outline"
                          className="border-slate-700 text-slate-300 hover:text-slate-100 hover:bg-slate-800 gap-1.5 text-xs flex-1"
                          size="sm"
                        >
                          <Copy className="size-3.5" />
                          Copier
                        </Button>
                        {onInsertText && (
                          <Button
                            onClick={handleInsertFreeText}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 text-xs flex-1"
                            size="sm"
                          >
                            <ArrowRight className="size-3.5" />
                            Copier dans le chapitre
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'amorces' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Cliquez pour copier une amorce dans le presse-papier.
                    </p>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-slate-700 text-slate-400 bg-slate-800/50">
                      {CHAPTER_TYPE_LABELS[detectedType]}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {amorces.map((amorce, i) => {
                      const isCopied = copiedAmorce === amorce
                      return (
                        <div
                          key={i}
                          className="group relative rounded-xl bg-slate-900/30 border border-slate-800/50 hover:border-slate-700/60 hover:bg-slate-900/60 transition-all"
                        >
                          <div className="flex items-start gap-3 p-3.5">
                            <span className="text-[10px] text-slate-600 font-mono mt-0.5 shrink-0 w-4 text-right">
                              {i + 1}.
                            </span>
                            <p className="flex-1 text-xs text-slate-300 leading-relaxed italic">
                              «&nbsp;{amorce}&nbsp;»
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 px-3.5 pb-3">
                            <button
                              onClick={() => handleCopyAmorce(amorce)}
                              className={cn(
                                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all border',
                                isCopied
                                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                                  : 'text-slate-400 border-slate-700/50 hover:text-slate-200 hover:border-slate-600 hover:bg-slate-800/50'
                              )}
                            >
                              {isCopied ? <Check className="size-3" /> : <Copy className="size-3" />}
                              {isCopied ? 'Copié !' : 'Copier'}
                            </button>
                            {onInsertText && (
                              <button
                                onClick={() => handleInsertAmorce(amorce)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all border text-emerald-400 border-emerald-700/30 hover:bg-emerald-950/30 hover:text-emerald-300"
                              >
                                <ArrowRight className="size-3" />
                                Insérer dans le chapitre
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 border-t border-slate-800/50 px-5 py-2 flex items-center justify-between">
          <span className="text-[10px] text-slate-500">
            Déblocage écriture · Diagnostic · Freewriting · Amorces
          </span>
          <span className="text-[10px] text-slate-500">
            {activeTab === 'amorces' ? `${amorces.length} amorces` : ''}
          </span>
        </div>
      </SheetContent>
    </Sheet>
  )
}
