'use client'

import { useState, useMemo } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { RESEARCH_FIELD_PROMPTS, PROMPT_COLORS } from '@/data/research-field-analysis'
import {
  Search, Copy, Check, ChevronDown, ChevronRight, ClipboardList, Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

type ViewMode = 'cards' | 'all'

interface ResearchFieldAnalysisPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ResearchFieldAnalysisPanel({ open, onOpenChange }: ResearchFieldAnalysisPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('cards')

  const filteredPrompts = useMemo(() => {
    if (!searchQuery) return RESEARCH_FIELD_PROMPTS
    const q = searchQuery.toLowerCase()
    return RESEARCH_FIELD_PROMPTS.filter(
      p =>
        p.title.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.prompt.toLowerCase().includes(q),
    )
  }, [searchQuery])

  const handleCopy = async (id: string, prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      // fallback
      const textarea = document.createElement('textarea')
      textarea.value = prompt
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  const handleCopyAll = async () => {
    const allPrompts = RESEARCH_FIELD_PROMPTS.map(
      p => `## ${p.number}. ${p.title} — ${p.subtitle}\n\n${p.prompt}`,
    ).join('\n\n---\n\n')
    try {
      await navigator.clipboard.writeText(`# Analyse du champ de recherche scientifique\n\n${allPrompts}`)
      setCopiedId('all')
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      // silent fail
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[520px] sm:w-[620px] p-0 flex flex-col overflow-hidden">
        <SheetHeader className="px-6 pt-6 pb-2 shrink-0">
          <SheetTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="h-4 w-4 text-violet-500" />
            Analyse du champ de recherche
          </SheetTitle>
          <p className="text-xs text-slate-500 mt-1">
            9 prompts structurés pour analyser en profondeur un champ de recherche scientifique
          </p>
        </SheetHeader>

        {/* Search + Actions */}
        <div className="px-6 pb-3 shrink-0 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Rechercher un prompt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setViewMode('cards')}
            >
              Cartes
            </Button>
            <Button
              variant={viewMode === 'all' ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setViewMode('all')}
            >
              Tout voir
            </Button>
            <div className="flex-1" />
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1.5"
              onClick={handleCopyAll}
            >
              {copiedId === 'all' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              Copier tout
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {filteredPrompts.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-8">Aucun prompt trouvé</p>
          )}

          {viewMode === 'cards' ? (
            <div className="space-y-2">
              {filteredPrompts.map((prompt) => {
                const colors = PROMPT_COLORS[prompt.color]
                const isExpanded = expandedId === prompt.id
                const isCopied = copiedId === prompt.id
                return (
                  <div
                    key={prompt.id}
                    className={cn('rounded-lg border overflow-hidden transition-all', colors.border)}
                  >
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : prompt.id)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors text-left"
                    >
                      <span className="text-xl shrink-0">{prompt.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white',
                              colors.bg,
                            )}
                          >
                            {prompt.number}
                          </span>
                          <span className="font-semibold text-sm text-slate-800">{prompt.title}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 truncate">{prompt.subtitle}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[9px] shrink-0 border-0',
                          colors.light,
                          colors.text,
                        )}
                      >
                        {prompt.outputHint.split('+')[0].trim()}
                      </Badge>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="border-t px-3 py-3 space-y-3 bg-slate-50/50">
                        {/* Description */}
                        <p className="text-xs text-slate-600 leading-relaxed">{prompt.description}</p>

                        {/* Prompt text */}
                        <div className={cn('rounded-md p-3 border', colors.light, colors.border)}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                              Prompt
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCopy(prompt.id, prompt.prompt)
                              }}
                              className={cn(
                                'flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full transition-colors',
                                isCopied
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-white text-slate-500 hover:text-slate-700 border border-slate-200',
                              )}
                            >
                              {isCopied ? <Check className="h-2.5 w-2.5" /> : <Copy className="h-2.5 w-2.5" />}
                              {isCopied ? 'Copié' : 'Copier'}
                            </button>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed italic">{prompt.prompt}</p>
                        </div>

                        {/* Output hint */}
                        <div className="flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 p-2.5">
                          <Info className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider">
                              Format de sortie attendu
                            </span>
                            <p className="text-xs text-amber-800 leading-relaxed mt-0.5">{prompt.outputHint}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            /* ═══ ALL PROMPTS VIEW ═══ */
            <div className="space-y-6">
              <div className="rounded-lg border border-slate-200 p-3 mb-4">
                <p className="text-xs text-slate-600">
                  <span className="font-semibold">Utilisation : </span>
                  Copiez le prompt de votre choix et collez-le dans votre assistant IA préféré avec vos articles en pièce jointe.
                  Chaque prompt est conçu pour être utilisé de manière séquentielle — commencez par le{' '}
                  <strong>Protocole d'entrée</strong> (1), puis progressez selon vos besoins analytiques.
                </p>
              </div>

              {filteredPrompts.map((prompt) => {
                const colors = PROMPT_COLORS[prompt.color]
                const isCopied = copiedId === prompt.id
                return (
                  <div key={prompt.id} className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{prompt.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white',
                              colors.bg,
                            )}
                          >
                            {prompt.number}
                          </span>
                          <h3 className="font-semibold text-sm text-slate-800">{prompt.title}</h3>
                        </div>
                        <p className="text-xs text-slate-500 ml-8">{prompt.subtitle}</p>
                      </div>
                      <div className="flex-1" />
                      <button
                        onClick={() => handleCopy(prompt.id, prompt.prompt)}
                        className={cn(
                          'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-colors',
                          isCopied
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                        )}
                      >
                        {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        {isCopied ? 'Copié !' : 'Copier le prompt'}
                      </button>
                    </div>
                    <div className={cn('rounded-lg p-4 border', colors.light, colors.border)}>
                      <p className="text-xs text-slate-700 leading-relaxed">{prompt.description}</p>
                      <div className="mt-3 pt-3 border-t border-slate-200/60">
                        <p className="text-sm text-slate-800 leading-relaxed">{prompt.prompt}</p>
                      </div>
                      <div className="mt-3 flex items-start gap-1.5">
                        <Info className="h-3 w-3 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-amber-700">{prompt.outputHint}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
