'use client'

import { useState } from 'react'
import {
  BookOpen, Download, FileText, ExternalLink, Search, X, Filter, GraduationCap, FlaskConical, Cpu, Users,
} from 'lucide-react'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { RESOURCES, CATEGORY_LABELS, CATEGORY_COLORS } from '@/data/resources'
import type { Resource } from '@/data/resources'
import { cn } from '@/lib/utils'

interface ResourcesPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CATEGORY_ICONS: Record<Resource['category'], React.ElementType> = {
  redaction: BookOpen,
  methodologie: FlaskConical,
  ia: Cpu,
  encadrement: Users,
}

const FILE_TYPE_BADGE: Record<string, string> = {
  pdf: 'bg-red-100 text-red-700 border-red-200',
  epub: 'bg-violet-100 text-violet-700 border-violet-200',
}

export default function ResourcesPanel({ open, onOpenChange }: ResourcesPanelProps) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<Resource['category'] | 'all'>('all')

  const filtered = RESOURCES.filter(r => {
    const matchSearch = !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.author.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase())
    const matchCat = activeCategory === 'all' || r.category === activeCategory
    return matchSearch && matchCat
  })

  const categories: (Resource['category'] | 'all')[] = ['all', 'redaction', 'methodologie', 'ia', 'encadrement']

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[540px] p-0 overflow-y-auto bg-slate-50">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-200">
          <SheetHeader className="px-5 pt-5 pb-3">
            <SheetTitle className="flex items-center gap-2 text-base">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-emerald-700" />
              </div>
              Bibliothèque de ressources
            </SheetTitle>
          </SheetHeader>

          {/* Search */}
          <div className="px-5 pb-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un ouvrage..."
                className="w-full h-9 pl-8 pr-8 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-300 transition-all"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                  <X className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>
          </div>

          {/* Category filters */}
          <div className="px-5 pb-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            {categories.map(cat => {
              const Icon = cat === 'all' ? GraduationCap : CATEGORY_ICONS[cat]
              const isActive = activeCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    'shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all',
                    isActive
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50',
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {cat === 'all' ? 'Tout' : CATEGORY_LABELS[cat]}
                </button>
              )
            })}
          </div>
        </div>

        {/* Results count */}
        <div className="px-5 py-3">
          <p className="text-[10px] text-slate-500 font-medium">
            {filtered.length} ouvrage{filtered.length > 1 ? 's' : ''} disponible{filtered.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Resource cards */}
        <div className="px-5 pb-8 space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Aucun ouvrage trouvé</p>
            </div>
          )}
          {filtered.map(r => {
            const CatIcon = CATEGORY_ICONS[r.category]
            return (
              <div
                key={r.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-slate-300 transition-all group"
              >
                {/* Color bar */}
                <div className={cn('h-1.5 bg-gradient-to-r', r.coverColor)} />
                <div className="p-4">
                  <div className="flex gap-3">
                    {/* Cover placeholder */}
                    <div className={cn(
                      'w-14 h-20 rounded-lg bg-gradient-to-br shrink-0 flex items-center justify-center shadow-sm',
                      r.coverColor,
                    )}>
                      <BookOpen className="h-6 w-6 text-white/80" />
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2 mb-1">
                        {r.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 mb-1.5">
                        {r.author} &middot; {r.year}
                      </p>
                      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                        <Badge variant="outline" className={cn('text-[9px] px-1.5 py-0', CATEGORY_COLORS[r.category])}>
                          <CatIcon className="h-2.5 w-2.5 mr-0.5" />
                          {CATEGORY_LABELS[r.category]}
                        </Badge>
                        <Badge variant="outline" className={cn('text-[9px] px-1.5 py-0', FILE_TYPE_BADGE[r.fileType])}>
                          {r.fileType.toUpperCase()}
                        </Badge>
                        <span className="text-[9px] text-slate-400">{r.fileSize}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                        {r.description}
                      </p>
                    </div>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex items-center justify-between">
                    <a
                      href={r.fileUrl}
                      download
                      className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Télécharger
                    </a>
                    <a
                      href={r.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Ouvrir
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}
