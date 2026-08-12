'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  BookOpen, Copy, Check, FileText, Target, GitCompareArrows,
  AlignLeft, PenLine, ChevronDown, ChevronRight, Search,
  FlaskConical, BarChart3, Puzzle, Scale, Bookmark,
  GitBranch, Type,
} from 'lucide-react'
import { READING_CHECKLIST } from '@/data/journal-reading-checklist'
import { ACADEMIC_PHRASE_CATEGORIES } from '@/data/academic-phrases-bank'
import { CONCEPTUAL_FRAMEWORK_STEPS } from '@/data/conceptual-framework-guide'

// ─── Icon helpers ──────────────────────────────────────────────────
const CHECKLIST_ICONS: Record<string, React.ElementType> = {
  FileText, Search, Target, BookOpen, FlaskConical, BarChart3, Puzzle, Scale, Bookmark,
}

const PHRASE_ICONS: Record<string, React.ElementType> = {
  GitCompareArrows, GitBranch, AlignLeft, Target, Type,
}

// ─── Color map for phrase categories (avoid dynamic Tailwind) ──────
const COLOR_MAP: Record<string, { bg: string; text: string }> = {
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  amber:   { bg: 'bg-amber-500/10', text: 'text-amber-400' },
  violet:  { bg: 'bg-violet-500/10', text: 'text-violet-400' },
  rose:    { bg: 'bg-rose-500/10', text: 'text-rose-400' },
  sky:     { bg: 'bg-sky-500/10', text: 'text-sky-400' },
}

interface DoctoralToolkitPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function DoctoralToolkitPanel({ open, onOpenChange }: DoctoralToolkitPanelProps) {
  const [tab, setTab] = useState('checklist')
  // Checklist state
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})
  const [textValues, setTextValues] = useState<Record<string, string>>({})
  const [collapsedSteps, setCollapsedSteps] = useState<Record<string, boolean>>({})
  // Phrases state
  const [copiedPhrase, setCopiedPhrase] = useState<string | null>(null)
  // Framework state
  const [collapsedFwSteps, setCollapsedFwSteps] = useState<Record<string, boolean>>({})
  const [copiedFw, setCopiedFw] = useState(false)

  const toggleCheck = (id: string) =>
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }))

  const setText = (id: string, val: string) =>
    setTextValues(prev => ({ ...prev, [id]: val }))

  const toggleStep = (id: string) =>
    setCollapsedSteps(prev => ({ ...prev, [id]: !prev[id] }))

  const toggleFwStep = (id: string) =>
    setCollapsedFwSteps(prev => ({ ...prev, [id]: !prev[id] }))

  const copyPhrase = async (phrase: string, id: string) => {
    await navigator.clipboard.writeText(phrase)
    setCopiedPhrase(id)
    setTimeout(() => setCopiedPhrase(null), 1500)
  }

  const generateChecklistExport = () => {
    let text = '# Fiche de lecture d\'article\n\n'
    for (const step of READING_CHECKLIST) {
      text += `## Étape ${step.number} : ${step.title}\n\n`
      for (const field of step.fields) {
        if (field.type === 'checkbox') {
          const checked = checkedItems[field.id]
          text += `- [${checked ? 'x' : ' '}] ${field.label}\n`
        } else {
          const val = textValues[field.id]
          if (val?.trim()) {
            text += `**${field.label}** : ${val}\n\n`
          }
        }
      }
      text += '\n'
    }
    return text
  }

  const copyChecklist = async () => {
    await navigator.clipboard.writeText(generateChecklistExport())
  }

  const copyFrameworkGuide = async () => {
    let text = '# Guide de rédaction du cadre conceptuel\n\n'
    for (const step of CONCEPTUAL_FRAMEWORK_STEPS) {
      text += `## Étape ${step.step} : ${step.title}\n\n${step.description}\n\n`
      text += `**Modèle :** ${step.template}\n\n`
      if (step.tips.length > 0) {
        text += '**Conseils :**\n'
        step.tips.forEach(t => { text += `- ${t}\n` })
        text += '\n'
      }
    }
    await navigator.clipboard.writeText(text)
    setCopiedFw(true)
    setTimeout(() => setCopiedFw(false), 2000)
  }

  // Count filled
  const totalCheckFields = READING_CHECKLIST.reduce(
    (sum, s) => sum + s.fields.filter(f => f.type !== 'checkbox').length, 0
  )
  const filledCheckFields = Object.values(textValues).filter(v => v?.trim()).length
  const checkedCount = Object.values(checkedItems).filter(Boolean).length
  const totalCheckboxFields = READING_CHECKLIST.reduce(
    (sum, s) => sum + s.fields.filter(f => f.type === 'checkbox').length, 0
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl bg-slate-950 border-slate-800 p-0 flex flex-col overflow-hidden">
        <SheetHeader className="px-6 pt-6 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-violet-400" />
            </div>
            <div>
              <SheetTitle className="text-sm font-semibold text-white">
                Boîte doctorale
              </SheetTitle>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Lecture d'articles, phrases académiques, cadre conceptuel
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className="px-6 shrink-0">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="bg-slate-900 h-8 w-full">
              <TabsTrigger value="checklist" className="text-[11px] h-7 gap-1.5 data-[state=active]:bg-slate-800 flex-1">
                <FileText className="h-3 w-3" />
                <span className="hidden sm:inline">Lecture articles</span>
                <span className="sm:hidden">Lecture</span>
              </TabsTrigger>
              <TabsTrigger value="phrases" className="text-[11px] h-7 gap-1.5 data-[state=active]:bg-slate-800 flex-1">
                <GitCompareArrows className="h-3 w-3" />
                <span className="hidden sm:inline">Phrases académiques</span>
                <span className="sm:hidden">Phrases</span>
              </TabsTrigger>
              <TabsTrigger value="framework" className="text-[11px] h-7 gap-1.5 data-[state=active]:bg-slate-800 flex-1">
                <PenLine className="h-3 w-3" />
                <span className="hidden sm:inline">Cadre conceptuel</span>
                <span className="sm:hidden">Cadre</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Separator className="bg-slate-800" />

        <div className="flex-1 overflow-hidden">
          {/* ─── TAB 1: READING CHECKLIST ─── */}
          {tab === 'checklist' && (
            <ScrollArea className="h-full">
              <div className="px-6 py-4 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400">
                    {filledCheckFields}/{totalCheckFields} remplis
                  </Badge>
                  <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400">
                    {checkedCount}/{totalCheckboxFields} cochés
                  </Badge>
                </div>
                {READING_CHECKLIST.map((step) => {
                  const Icon = CHECKLIST_ICONS[step.icon] || FileText
                  const isCollapsed = collapsedSteps[step.id]
                  return (
                    <div key={step.id} className="rounded-xl bg-slate-900/50 border border-slate-800/50 overflow-hidden">
                      <button
                        onClick={() => toggleStep(step.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/30 transition-colors text-left"
                      >
                        <span className="text-[10px] font-bold text-violet-400 bg-violet-500/10 w-5 h-5 rounded flex items-center justify-center shrink-0">
                          {step.number}
                        </span>
                        <Icon className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs font-semibold text-white truncate">{step.title}</h3>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">{step.description}</p>
                        </div>
                        {isCollapsed
                          ? <ChevronRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                          : <ChevronDown className="h-3.5 w-3.5 text-slate-500 shrink-0" />}
                      </button>
                      {!isCollapsed && (
                        <div className="px-4 pb-4 space-y-2.5 border-t border-slate-800/50">
                          {step.fields.map(field => (
                            <div key={field.id}>
                              {field.type === 'checkbox' ? (
                                <label className="flex items-center gap-2.5 cursor-pointer group">
                                  <Checkbox
                                    checked={!!checkedItems[field.id]}
                                    onCheckedChange={() => toggleCheck(field.id)}
                                    className="h-4 w-4 border-slate-600 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                                  />
                                  <span className="text-[11px] text-slate-300 group-hover:text-white transition-colors">
                                    {field.label}
                                  </span>
                                </label>
                              ) : field.type === 'textarea' ? (
                                <div>
                                  <label className="text-[11px] font-medium text-slate-300 mb-1 block">{field.label}</label>
                                  <Textarea
                                    value={textValues[field.id] || ''}
                                    onChange={e => setText(field.id, e.target.value)}
                                    placeholder={field.placeholder}
                                    rows={2}
                                    className="bg-slate-800 border-slate-700 text-xs resize-none"
                                  />
                                </div>
                              ) : (
                                <div>
                                  <label className="text-[11px] font-medium text-slate-300 mb-1 block">{field.label}</label>
                                  <Input
                                    value={textValues[field.id] || ''}
                                    onChange={e => setText(field.id, e.target.value)}
                                    placeholder={field.placeholder}
                                    className="bg-slate-800 border-slate-700 text-xs h-8"
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          )}

          {/* ─── TAB 2: ACADEMIC PHRASES ─── */}
          {tab === 'phrases' && (
            <ScrollArea className="h-full">
              <div className="px-6 py-4 space-y-4">
                <p className="text-[11px] text-slate-400">
                  Cliquez sur une phrase pour la copier. Adaptez les éléments entre crochets à votre contexte.
                </p>
                {ACADEMIC_PHRASE_CATEGORIES.map(cat => (
                  <div key={cat.id} className="rounded-xl bg-slate-900/50 border border-slate-800/50 overflow-hidden">
                    <div className="px-4 py-3 flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-md ${COLOR_MAP[cat.color]?.bg || 'bg-slate-500/10'} flex items-center justify-center`}>
                        {(() => { const CatIcon = PHRASE_ICONS[cat.icon] || FileText; return <CatIcon className={`h-3 w-3 ${COLOR_MAP[cat.color]?.text || 'text-slate-400'}`} /> })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-semibold text-white">{cat.title}</h3>
                        <p className="text-[10px] text-slate-500 mt-0.5">{cat.description}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-500">
                        {cat.phrases.length}
                      </Badge>
                    </div>
                    <div className="px-4 pb-3 space-y-2 border-t border-slate-800/50">
                      {cat.phrases.map(phrase => (
                        <button
                          key={phrase.id}
                          onClick={() => copyPhrase(phrase.phrase, phrase.id)}
                          className="w-full text-left rounded-lg bg-slate-800/40 border border-slate-800/60 hover:border-slate-700 p-3 transition-all group"
                        >
                          <p className="text-xs text-slate-200 leading-relaxed">{phrase.phrase}</p>
                          {phrase.example && (
                            <p className="text-[10px] text-emerald-400/60 mt-1.5 italic">{phrase.example}</p>
                          )}
                          <div className="flex justify-end mt-1.5">
                            {copiedPhrase === phrase.id ? (
                              <Check className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <Copy className="h-3 w-3 text-slate-600 group-hover:text-slate-400 transition-colors" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* ─── TAB 3: CONCEPTUAL FRAMEWORK ─── */}
          {tab === 'framework' && (
            <ScrollArea className="h-full">
              <div className="px-6 py-4 space-y-4">
                <p className="text-[11px] text-slate-400">
                  Guide en 5 étapes pour rédiger et justifier votre cadre conceptuel. Chaque étape inclut un modèle de phrase à adapter.
                </p>
                {CONCEPTUAL_FRAMEWORK_STEPS.map((step) => {
                  const isCollapsed = collapsedFwSteps[step.id]
                  return (
                    <div key={step.id} className="rounded-xl bg-slate-900/50 border border-slate-800/50 overflow-hidden">
                      <button
                        onClick={() => toggleFwStep(step.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/30 transition-colors text-left"
                      >
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 w-5 h-5 rounded flex items-center justify-center shrink-0">
                          {step.step}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs font-semibold text-white">{step.title}</h3>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">{step.description}</p>
                        </div>
                        {isCollapsed
                          ? <ChevronRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                          : <ChevronDown className="h-3.5 w-3.5 text-slate-500 shrink-0" />}
                      </button>
                      {!isCollapsed && (
                        <div className="px-4 pb-4 space-y-3 border-t border-slate-800/50">
                          {/* Template */}
                          <div>
                            <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1.5">Modèle de rédaction</h4>
                            <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3 relative group">
                              <button
                                onClick={() => copyPhrase(step.template, `fw-${step.id}`)}
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                {copiedPhrase === `fw-${step.id}`
                                  ? <Check className="h-3 w-3 text-emerald-400" />
                                  : <Copy className="h-3 w-3 text-slate-500 hover:text-slate-300" />}
                              </button>
                              <p className="text-xs text-slate-200 italic leading-relaxed pr-6">{step.template}</p>
                            </div>
                          </div>
                          {/* Template labels */}
                          {step.templateLabels && Object.keys(step.templateLabels).length > 0 && (
                            <div>
                              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Remplacements</h4>
                              <div className="flex flex-wrap gap-1.5">
                                {Object.entries(step.templateLabels).map(([key, val]) => (
                                  <Badge key={key} variant="outline" className="text-[10px] border-slate-700 text-slate-400">
                                    [{key}] → {val}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {/* Tips */}
                          <div>
                            <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1.5">Conseils</h4>
                            <ul className="space-y-1.5">
                              {step.tips.map((tip, i) => (
                                <li key={i} className="text-[11px] text-slate-400 flex items-start gap-2">
                                  <span className="text-amber-400/50 mt-0.5">•</span>
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-slate-800 px-6 py-3 flex items-center justify-end gap-2">
          {tab === 'checklist' && (
            <Button
              size="sm" variant="ghost"
              onClick={copyChecklist}
              className="text-xs h-8 text-slate-400 hover:text-white"
            >
              <Copy className="h-3.5 w-3.5 mr-1.5" /> Copier la fiche
            </Button>
          )}
          {tab === 'framework' && (
            <Button
              size="sm" variant="ghost"
              onClick={copyFrameworkGuide}
              className="text-xs h-8 text-slate-400 hover:text-white"
            >
              {copiedFw
                ? <><Check className="h-3.5 w-3.5 mr-1.5" /> Copié !</>
                : <><Copy className="h-3.5 w-3.5 mr-1.5" /> Copier le guide</>}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
