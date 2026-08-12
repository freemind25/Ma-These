'use client'

import { useState, useMemo } from 'react'
import {
  Rocket, PenTool, Brain, Settings, Cloud, SpellCheck, Search, Library,
  Download, Layers, Wrench, KeyRound, ChevronRight, ChevronDown, Lightbulb,
  BookOpen, GraduationCap, PenLine, BarChart3, ListChecks, Box,
  Newspaper, Scale, PencilRuler, Map, BookCheck, FolderTree, ClipboardList,
  Sparkles, ShieldCheck, Zap, MessageSquare, FileText, ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { USAGE_GUIDE_SECTIONS, GUIDE_COLORS, type GuideSection, type GuideExample } from '@/data/usage-guide'

// Static icon map to avoid dynamic JSX rendering
const ICON_MAP: Record<string, React.ElementType> = {
  Rocket, PenTool, Brain, Settings, Cloud, SpellCheck, Search, Library,
  Download, Layers, Wrench, KeyRound, BookOpen, GraduationCap, PenLine,
  BarChart3, ListChecks, Box, Newspaper, Scale, PencilRuler, Map,
  BookCheck, FolderTree, ClipboardList, Sparkles, ShieldCheck, Zap,
  MessageSquare, FileText, Lightbulb, ExternalLink, ChevronRight, ChevronDown,
}

interface UsageGuidePanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function UsageGuidePanel({ open, onOpenChange }: UsageGuidePanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [expandedExample, setExpandedExample] = useState<string | null>(null)

  const toggleSection = (id: string) => {
    setExpandedSection(prev => prev === id ? null : id)
    setExpandedExample(null)
  }

  const toggleExample = (id: string) => {
    setExpandedExample(prev => prev === id ? null : id)
  }

  // Filter sections/examples by search
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return USAGE_GUIDE_SECTIONS
    const q = searchQuery.toLowerCase()
    return USAGE_GUIDE_SECTIONS.map(section => {
      const matchesTitle = section.title.toLowerCase().includes(q)
      const matchesDesc = section.description.toLowerCase().includes(q)
      const filteredExamples = section.examples.filter(
        ex => ex.title.toLowerCase().includes(q) ||
          ex.steps.some(s => s.toLowerCase().includes(q)) ||
          (ex.tip && ex.tip.toLowerCase().includes(q))
      )
      if (matchesTitle || matchesDesc || filteredExamples.length > 0) {
        return { ...section, examples: filteredExamples.length > 0 ? filteredExamples : section.examples }
      }
      return null
    }).filter(Boolean) as GuideSection[]
  }, [searchQuery])

  const totalExamples = USAGE_GUIDE_SECTIONS.reduce((sum, s) => sum + s.examples.length, 0)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col overflow-hidden">
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 shrink-0">
          <SheetTitle className="flex items-center gap-2.5 text-lg">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <BookOpen className="h-4.5 w-4.5 text-emerald-600" />
            </div>
            <div className="text-left">
              <div>Notice d&apos;utilisation</div>
              <div className="text-xs font-normal text-slate-500 not-italic">
                {USAGE_GUIDE_SECTIONS.length} sections · {totalExamples} tutoriels didactiques
              </div>
            </div>
          </SheetTitle>
        </SheetHeader>

        {/* Search bar */}
        <div className="px-6 pb-4 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher une fonctionnalité, un outil, une étape..."
              className="pl-9 h-9 text-sm bg-slate-50 border-slate-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-[10px] text-slate-400 mt-1.5 pl-1">
              {filteredSections.length} section(s) trouvée(s) pour « {searchQuery} »
            </p>
          )}
        </div>

        <Separator />

        {/* Sections list */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="px-4 py-4 space-y-3">
            {filteredSections.map((section, sIdx) => {
              const colors = GUIDE_COLORS[section.color] || GUIDE_COLORS.slate
              const SectionIcon = ICON_MAP[section.icon] || FileText
              const isSectionExpanded = expandedSection === section.id || searchQuery.trim() !== ''

              return (
                <div
                  key={section.id}
                  className={cn(
                    'rounded-xl border transition-all',
                    isSectionExpanded
                      ? cn(colors.border, 'bg-white shadow-sm')
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  )}
                >
                  {/* Section header */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left group"
                  >
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', colors.light)}>
                      <SectionIcon className={cn('h-4 w-4', colors.accent)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{section.title}</span>
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-slate-200 text-slate-400 font-medium">
                          {section.examples.length}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 leading-snug">
                        {section.description}
                      </p>
                    </div>
                    <div className={cn('shrink-0 transition-transform duration-200', isSectionExpanded && 'rotate-90')}>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </button>

                  {/* Expanded examples */}
                  {isSectionExpanded && (
                    <div className="px-4 pb-3 space-y-2">
                      <Separator className="mb-2" />
                      {section.examples.map((example, eIdx) => {
                        const isExpanded = expandedExample === `${section.id}-${eIdx}`
                        return (
                          <div
                            key={eIdx}
                            className={cn(
                              'rounded-lg border transition-colors',
                              isExpanded
                                ? cn(colors.border, colors.light)
                                : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                            )}
                          >
                            <button
                              onClick={() => toggleExample(`${section.id}-${eIdx}`)}
                              className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left"
                            >
                              <span className={cn(
                                'w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5',
                                isExpanded ? cn(colors.bg, colors.text) : 'bg-slate-100 text-slate-500'
                              )}>
                                {eIdx + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <span className={cn(
                                  'text-xs font-semibold', isExpanded ? colors.text : 'text-slate-700'
                                )}>
                                  {example.title}
                                </span>
                                <span className="text-[10px] text-slate-400 ml-2">
                                  ({example.steps.length} étapes)
                                </span>
                              </div>
                              <div className={cn('shrink-0 mt-1 transition-transform duration-200', isExpanded && 'rotate-180')}>
                                <ChevronDown className={cn('h-3.5 w-3.5', isExpanded ? colors.accent : 'text-slate-400')} />
                              </div>
                            </button>

                            {/* Expanded steps */}
                            {isExpanded && (
                              <div className="px-3 pb-3 space-y-2.5 ml-5.5 pl-1 border-l-2" style={{ borderColor: 'var(--border-color, #e2e8f0)' }}>
                                <div className="space-y-2">
                                  {example.steps.map((step, stepIdx) => (
                                    <div key={stepIdx} className="flex gap-2.5">
                                      <div className="flex flex-col items-center shrink-0 mt-0.5">
                                        <div className={cn('w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold', colors.light, colors.text)}>
                                          {stepIdx + 1}
                                        </div>
                                        {stepIdx < example.steps.length - 1 && (
                                          <div className={cn('w-px flex-1 mt-1', colors.border)} />
                                        )}
                                      </div>
                                      <p className="text-[11px] text-slate-700 leading-relaxed pb-1">
                                        {step}
                                      </p>
                                    </div>
                                  ))}
                                </div>

                                {/* Tip */}
                                {example.tip && (
                                  <div className="rounded-lg bg-amber-50 border border-amber-200/60 px-3 py-2.5 mt-2">
                                    <div className="flex items-start gap-2">
                                      <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                                      <p className="text-[11px] text-amber-800 leading-relaxed">
                                        {example.tip}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}

            {filteredSections.length === 0 && (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <p className="text-sm text-slate-600 font-medium">Aucun résultat</p>
                <p className="text-xs text-slate-400">
                  Essayez un autre terme de recherche ou parcourez les sections ci-dessus.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs mt-2"
                  onClick={() => setSearchQuery('')}
                >
                  Effacer la recherche
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="shrink-0 border-t px-6 py-3 bg-slate-50/80">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-slate-400">
              ThesisFrame v0.4.0 · Guide interactif
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-[10px] h-7 px-2 text-slate-500"
                onClick={() => {
                  setExpandedSection('configuration-ia')
                  setExpandedExample('configuration-ia-1')
                  setSearchQuery('')
                }}
              >
                <Settings className="h-3 w-3 mr-1" />
                Configurer l&apos;IA
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-[10px] h-7 px-2 text-slate-500"
                onClick={() => {
                  setExpandedSection('comptes-cloud')
                  setSearchQuery('')
                }}
              >
                <Cloud className="h-3 w-3 mr-1" />
                Cloud
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}