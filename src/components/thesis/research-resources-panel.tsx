'use client'

import { useState, useMemo } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  RESEARCH_FRAMEWORKS, FRAMEWORK_COLORS,
} from '@/data/research-frameworks'
import { PHD_STAGES } from '@/data/phd-tools'
import { ACADEMIC_BOOK_SITES } from '@/data/academic-books-websites'
import { PUBLICATION_TIPS, SEVERITY_STYLES } from '@/data/publication-tips'
import {
  FolderTree, Wrench, BookMarked, Lightbulb, ExternalLink, Search,
  ChevronDown, ChevronRight,
} from 'lucide-react'

interface ResearchResourcesPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ResearchResourcesPanel({ open, onOpenChange }: ResearchResourcesPanelProps) {
  const [tab, setTab] = useState('frameworks')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFramework, setExpandedFramework] = useState<string | null>(null)
  const [expandedStage, setExpandedStage] = useState<string | null>(null)
  const [expandedTip, setExpandedTip] = useState<string | null>(null)

  const filteredFrameworks = useMemo(() => {
    if (!searchQuery) return RESEARCH_FRAMEWORKS
    const q = searchQuery.toLowerCase()
    return RESEARCH_FRAMEWORKS.filter(
      f => f.name.toLowerCase().includes(q) || f.fullName.toLowerCase().includes(q) || f.description.toLowerCase().includes(q),
    )
  }, [searchQuery])

  const filteredStages = useMemo(() => {
    if (!searchQuery) return PHD_STAGES
    const q = searchQuery.toLowerCase()
    return PHD_STAGES.filter(
      s => s.title.toLowerCase().includes(q) || s.tools.some(t => t.name.toLowerCase().includes(q)),
    )
  }, [searchQuery])

  const filteredSites = useMemo(() => {
    if (!searchQuery) return ACADEMIC_BOOK_SITES
    const q = searchQuery.toLowerCase()
    return ACADEMIC_BOOK_SITES.filter(
      s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.tags.some(t => t.toLowerCase().includes(q)),
    )
  }, [searchQuery])

  const filteredTips = useMemo(() => {
    if (!searchQuery) return PUBLICATION_TIPS
    const q = searchQuery.toLowerCase()
    return PUBLICATION_TIPS.filter(
      t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
    )
  }, [searchQuery])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[520px] sm:w-[600px] p-0 flex flex-col overflow-hidden">
        <SheetHeader className="px-6 pt-6 pb-2 shrink-0">
          <SheetTitle className="flex items-center gap-2 text-base">
            <FolderTree className="h-4 w-4 text-emerald-500" />
            Ressources de recherche
          </SheetTitle>
          <p className="text-xs text-slate-500 mt-1">Frameworks, outils, sites académiques et conseils de publication</p>
        </SheetHeader>

        {/* Search */}
        <div className="px-6 pb-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Rechercher dans les ressources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col min-h-0">
          <div className="px-6 shrink-0">
            <TabsList className="w-full grid grid-cols-4 h-9">
              <TabsTrigger value="frameworks" className="text-[11px] gap-1.5">
                <FolderTree className="h-3 w-3" />
                <span className="hidden sm:inline">Frameworks</span>
              </TabsTrigger>
              <TabsTrigger value="tools" className="text-[11px] gap-1.5">
                <Wrench className="h-3 w-3" />
                <span className="hidden sm:inline">Outils</span>
              </TabsTrigger>
              <TabsTrigger value="books" className="text-[11px] gap-1.5">
                <BookMarked className="h-3 w-3" />
                <span className="hidden sm:inline">Livres</span>
              </TabsTrigger>
              <TabsTrigger value="tips" className="text-[11px] gap-1.5">
                <Lightbulb className="h-3 w-3" />
                <span className="hidden sm:inline">Conseils</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ═══ FRAMEWORKS TAB ═══ */}
          <TabsContent value="frameworks" className="flex-1 overflow-y-auto mt-3 px-6 pb-6 space-y-2">
            {filteredFrameworks.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">Aucun framework trouvé</p>
            )}
            {filteredFrameworks.map((fw) => {
              const colors = FRAMEWORK_COLORS[fw.color] || FRAMEWORK_COLORS.emerald
              const isExpanded = expandedFramework === fw.id
              return (
                <div key={fw.id} className={cn('rounded-lg border overflow-hidden transition-all', colors.border)}>
                  <button
                    onClick={() => setExpandedFramework(isExpanded ? null : fw.id)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors text-left"
                  >
                    <span className={cn('shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs', colors.bg)}>
                      {fw.number}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-slate-800">{fw.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{fw.fullName}</div>
                    </div>
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />}
                  </button>
                  {isExpanded && (
                    <div className="border-t px-3 py-3 space-y-3 bg-slate-50/50">
                      <p className="text-xs text-slate-600 leading-relaxed">{fw.description}</p>
                      <div>
                        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Étapes</div>
                        <ol className="space-y-1.5">
                          {fw.stages.map((stage, i) => (
                            <li key={i} className="flex gap-2 text-xs text-slate-700">
                              <span className={cn('shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white', colors.bg)}>{i + 1}</span>
                              <span className="leading-relaxed">{stage}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div className={cn('rounded-md p-2.5 border', colors.light, colors.border)}>
                        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Quand l'utiliser</div>
                        <p className="text-xs text-slate-700">{fw.whenToUse}</p>
                      </div>
                      <div className="flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 p-2.5">
                        <span className="text-sm">💡</span>
                        <p className="text-xs text-amber-800 leading-relaxed">{fw.tip}</p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </TabsContent>

          {/* ═══ TOOLS TAB ═══ */}
          <TabsContent value="tools" className="flex-1 overflow-y-auto mt-3 px-6 pb-6 space-y-2">
            {filteredStages.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">Aucun outil trouvé</p>
            )}
            {filteredStages.map((stage) => {
              const isExpanded = expandedStage === stage.id
              return (
                <div key={stage.id} className="rounded-lg border border-slate-200 overflow-hidden">
                  <button
                    onClick={() => setExpandedStage(isExpanded ? null : stage.id)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors text-left"
                  >
                    <span className="shrink-0 w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-white font-bold text-xs">
                      {stage.number}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-slate-800">{stage.title}</div>
                      <div className="text-[10px] text-slate-500 truncate">{stage.titleEn}</div>
                    </div>
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />}
                  </button>
                  {isExpanded && (
                    <div className="border-t px-3 py-3 space-y-2 bg-slate-50/50">
                      <p className="text-xs text-slate-600">{stage.description}</p>
                      <div className="grid grid-cols-1 gap-1.5">
                        {stage.tools.map((tool) => (
                          <a
                            key={tool.name}
                            href={tool.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 rounded-md hover:bg-white border border-transparent hover:border-slate-200 transition-all group"
                          >
                            <span className={cn('font-semibold text-xs', tool.color)}>{tool.name}</span>
                            <span className="text-[10px] text-slate-500 flex-1">{tool.description}</span>
                            <ExternalLink className="h-3 w-3 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </TabsContent>

          {/* ═══ BOOKS TAB ═══ */}
          <TabsContent value="books" className="flex-1 overflow-y-auto mt-3 px-6 pb-6">
            <div className="grid grid-cols-1 gap-2">
              {filteredSites.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-8 col-span-2">Aucun site trouvé</p>
              )}
              {filteredSites.map((site) => (
                <a
                  key={site.id}
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all group"
                >
                  <span className="shrink-0 w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-white font-bold text-xs">
                    {site.number}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{site.icon}</span>
                      <span className="font-semibold text-sm text-slate-800 group-hover:text-emerald-700 transition-colors">{site.name}</span>
                      <ExternalLink className="h-3 w-3 text-slate-300 group-hover:text-emerald-500 transition-colors shrink-0" />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{site.description}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {site.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-normal">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </TabsContent>

          {/* ═══ TIPS TAB ═══ */}
          <TabsContent value="tips" className="flex-1 overflow-y-auto mt-3 px-6 pb-6 space-y-2">
            <div className="rounded-lg border border-slate-200 p-3 mb-3">
              <p className="text-xs text-slate-600">
                <span className="font-semibold">Source : </span>
                Maithe Enriquez, APRN, Ph.D., FAAN — « Six Tips for Success: Writing for Publication » —
                <em>Hispanic Health Care International</em>, Vol. 20(1), 2022
              </p>
            </div>
            {filteredTips.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">Aucun conseil trouvé</p>
            )}
            {filteredTips.map((tip) => {
              const styles = SEVERITY_STYLES[tip.severity]
              const isExpanded = expandedTip === tip.id
              return (
                <div key={tip.id} className={cn('rounded-lg border overflow-hidden transition-all', styles.border)}>
                  <button
                    onClick={() => setExpandedTip(isExpanded ? null : tip.id)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors text-left"
                  >
                    <span className="text-xl">{tip.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn('shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white', styles.dot)}>
                          {tip.number}
                        </span>
                        <span className="font-semibold text-sm text-slate-800">{tip.title}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate">{tip.titleEn}</p>
                    </div>
                    <Badge variant="outline" className={cn('text-[9px] shrink-0', styles.color, styles.bg, 'border-0')}>
                      {styles.label}
                    </Badge>
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />}
                  </button>
                  {isExpanded && (
                    <div className="border-t px-3 py-3 space-y-3 bg-slate-50/50">
                      <p className="text-xs text-slate-600 leading-relaxed">{tip.description}</p>
                      <ul className="space-y-1.5">
                        {tip.details.map((detail, i) => (
                          <li key={i} className="flex gap-2 text-xs text-slate-700">
                            <span className="shrink-0 text-slate-400 mt-0.5">•</span>
                            <span className="leading-relaxed">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )
            })}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
