'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  BookOpen, BookCheck, ChevronDown, ChevronRight, Lightbulb, AlertTriangle, Target, Wrench, Bookmark, GraduationCap, FlaskConical, Cpu, Users,
  Upload, Loader2, Trash2, FileText, Sparkles, AlertCircle, X, BookMarked,
} from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { RESOURCES, CATEGORY_LABELS, CATEGORY_COLORS } from '@/data/resources'
import { BOOK_SKILLS, type BookSkill } from '@/data/book-skills'
import type { Resource } from '@/data/resources'
import { cn } from '@/lib/utils'

// ─── Types ──────────────────────────────────────────────
interface BookSkillsPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  chapterNumber?: string
  activeBookIds: string[]
  onToggleBook: (bookId: string) => void
}

type FilterCategory = Resource['category'] | 'all' | 'imported'

interface CustomBookSkill extends BookSkill {
  isCustom: true
  status: string
  errorMessage: string
  fileName: string
  glossary: Array<{ term: string; definition: string }>
}

// ─── Constants ──────────────────────────────────────────

const FILTER_TABS: { key: FilterCategory; label: string; icon: React.ElementType }[] = [
  { key: 'all', label: 'Tous', icon: GraduationCap },
  { key: 'imported', label: 'Importés', icon: Sparkles },
  { key: 'redaction', label: 'Rédaction', icon: BookOpen },
  { key: 'methodologie', label: 'Méthodologie', icon: FlaskConical },
  { key: 'ia', label: 'IA & Académie', icon: Cpu },
  { key: 'encadrement', label: 'Encadrement', icon: Users },
]


// ─── Component ──────────────────────────────────────────
export default function BookSkillsPanel({
  open,
  onOpenChange,
  chapterNumber,
  activeBookIds,
  onToggleBook,
}: BookSkillsPanelProps) {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [customSkills, setCustomSkills] = useState<CustomBookSkill[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>('')
  const [uploadError, setUploadError] = useState<string>('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Fetch custom skills — stable ref for use in callbacks
  const fetchCustomSkillsRef = useRef(async () => {
    try {
      const res = await fetch('/api/book-skills/custom')
      if (res.ok) {
        const data = await res.json()
        setCustomSkills(data.skills || [])
      }
    } catch { /* ignore */ }
  })
  useEffect(() => {
    if (!open) return
    let cancelled = false
    fetch('/api/book-skills/custom')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data && !cancelled) setCustomSkills(data.skills || []) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [open])

  // Poll for processing status
  const startPolling = useCallback((recordId: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/book-skills/custom/${recordId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.status === 'ready') {
            setUploadProgress('')
            setUploading(false)
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
            fetchCustomSkillsRef.current()
          } else if (data.status === 'error') {
            setUploadProgress('')
            setUploadError(data.errorMessage || 'Erreur lors du traitement.')
            setUploading(false)
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
            fetchCustomSkillsRef.current()
          } else {
            setUploadProgress('Analyse intelligente du livre en cours...')
          }
        }
      } catch { /* retry */ }
    }, 3000)
  }, [])

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [])

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    setUploadError('')
    setUploading(true)
    setUploadProgress('Envoi du fichier...')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/book-skills/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Erreur lors de l\'envoi.')
      }

      const data = await res.json()
      setUploadProgress('Extraction et analyse en cours (cela peut prendre 30-60 secondes)...')
      startPolling(data.id)
      fetchCustomSkillsRef.current()
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Erreur inconnue.')
      setUploading(false)
      setUploadProgress('')
    }
  }, [startPolling])

  // Delete custom skill
  const handleDeleteCustom = useCallback(async (id: string) => {
    try {
      await fetch(`/api/book-skills/custom/${id}`, { method: 'DELETE' })
      setCustomSkills(prev => prev.filter(s => s.id !== id))
    } catch (err) {
      console.error('Failed to delete:', err)
    }
  }, [])

  // Handle file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileUpload(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Drag and drop
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true) }
  const handleDragLeave = () => setDragOver(false)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileUpload(file)
  }

  // Merge built-in books (from RESOURCES + BOOK_SKILLS)
  const builtInBooks = useMemo(() => {
    return RESOURCES.map(r => ({
      resource: r,
      skill: BOOK_SKILLS[r.id],
    })).filter(b => b.skill)
  }, [])

  // Combine all books for display
  const allBooks = useMemo(() => {
    const items: Array<
      { type: 'builtin'; resource: Resource; skill: BookSkill } |
      { type: 'custom'; skill: CustomBookSkill }
    > = []

    for (const { resource, skill } of builtInBooks) {
      items.push({ type: 'builtin', resource, skill })
    }
    for (const skill of customSkills) {
      if (skill.status === 'ready') {
        items.push({ type: 'custom', skill })
      }
    }

    return items
  }, [builtInBooks, customSkills])

  const filtered = useMemo(() => {
    return allBooks.filter(b => {
      if (activeFilter === 'all') return true
      if (activeFilter === 'imported') return b.type === 'custom'
      if (b.type === 'custom') return false
      return b.type === 'builtin' && b.resource.category === activeFilter
    })
  }, [allBooks, activeFilter])

  const handleToggleExpand = (bookId: string) => {
    setExpandedId(prev => (prev === bookId ? null : bookId))
  }

  // Count processing items
  const processingCount = customSkills.filter(s => s.status === 'processing').length

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[600px] p-0 overflow-hidden bg-slate-50 flex flex-col">
        {/* Sticky header */}
        <div className="shrink-0 bg-white/95 backdrop-blur-sm border-b border-slate-200">
          <SheetHeader className="px-5 pt-5 pb-2">
            <SheetTitle className="flex items-center gap-2 text-base">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-emerald-700" />
              </div>
              Livres-compétences
            </SheetTitle>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Connaissances structurées extraites de chaque ouvrage. Activez les livres que le Directeur IA doit utiliser.
            </p>
          </SheetHeader>

          {/* Active books banner */}
          <div className="px-5 py-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
              <BookCheck className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span className="text-[11px] font-medium text-amber-800">
                {activeBookIds.length} livre{activeBookIds.length > 1 ? 's' : ''} activé{activeBookIds.length > 1 ? 's' : ''} pour le Directeur IA
              </span>
            </div>
          </div>

          {/* Category filter tabs */}
          <div className="px-5 pb-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {FILTER_TABS.map(tab => {
              const Icon = tab.icon
              const isActive = activeFilter === tab.key
              const count = tab.key === 'imported'
                ? customSkills.filter(s => s.status === 'ready').length
                : tab.key === 'all'
                  ? undefined
                  : builtInBooks.filter(b => b.resource.category === tab.key).length
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={cn(
                    'shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all',
                    isActive
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50',
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {tab.label}
                  {count !== undefined && (
                    <span className={cn(
                      'ml-0.5 px-1 py-0 rounded-full text-[9px]',
                      isActive ? 'bg-white/20' : 'bg-slate-100',
                    )}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Scrollable content */}
        <ScrollArea className="flex-1">
          <div className="px-5 pb-8 space-y-3 pt-3">
            {/* ── Import section ── */}
            <div className={cn(
              'rounded-xl border-2 border-dashed p-4 transition-all',
              dragOver
                ? 'border-emerald-400 bg-emerald-50/50'
                : 'border-slate-200 bg-white hover:border-slate-300',
              uploading && 'border-violet-300 bg-violet-50/30',
            )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                  uploading ? 'bg-violet-100' : 'bg-emerald-100',
                )}>
                  {uploading
                    ? <Loader2 className="h-5 w-5 text-violet-600 animate-spin" />
                    : <Upload className="h-5 w-5 text-emerald-600" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[13px] font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                    Importer un livre
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-violet-600 border-violet-200 bg-violet-50">
                      Nouveau
                    </Badge>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Importez un PDF ou EPUB. L'IA extrait automatiquement les cadres, principes et techniques
                    pour les rendre disponibles au Directeur IA.
                  </p>

                  {uploading && uploadProgress && (
                    <div className="mt-2 flex items-center gap-2">
                      <Loader2 className="h-3 w-3 text-violet-500 animate-spin shrink-0" />
                      <span className="text-[10px] text-violet-600 font-medium">{uploadProgress}</span>
                    </div>
                  )}

                  {uploadError && (
                    <div className="mt-2 flex items-start gap-1.5 px-2.5 py-2 rounded-lg bg-rose-50 border border-rose-200">
                      <AlertCircle className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-rose-700 leading-relaxed">{uploadError}</p>
                      <button onClick={() => setUploadError('')} className="shrink-0">
                        <X className="h-3 w-3 text-rose-400 hover:text-rose-600" />
                      </button>
                    </div>
                  )}

                  {!uploading && (
                    <Button
                      size="sm"
                      className="mt-2.5 h-7 text-[11px] bg-emerald-600 hover:bg-emerald-700 gap-1.5"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Choisir un PDF ou EPUB
                    </Button>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.epub"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </div>

            {/* Processing items */}
            {processingCount > 0 && (
              <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <Loader2 className="h-3.5 w-3.5 text-violet-600 animate-spin" />
                  <span className="text-[11px] font-semibold text-violet-700">
                    {processingCount} livre{processingCount > 1 ? 's' : ''} en cours d'analyse
                  </span>
                </div>
                <Progress value={60} className="h-1.5 bg-violet-100" />
                <p className="text-[10px] text-violet-500 mt-1.5">L'extraction et l'analyse par l'IA peuvent prendre 30 à 90 secondes.</p>
              </div>
            )}

            {/* Error items */}
            {customSkills.filter(s => s.status === 'error').map(s => (
              <div key={s.id} className="rounded-xl border border-rose-200 bg-rose-50/50 p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-rose-800 truncate">{s.title}</p>
                    <p className="text-[10px] text-rose-600 mt-0.5">{s.errorMessage}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-rose-400 hover:text-rose-600 hover:bg-rose-100"
                    onClick={() => handleDeleteCustom(s.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}

            <Separator className="my-1" />

            {/* Book list */}
            {filtered.length === 0 && !uploading && (
              <div className="text-center py-8">
                <Bookmark className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">
                  {activeFilter === 'imported'
                    ? 'Aucun livre importé. Utilisez la zone ci-dessus.'
                    : 'Aucun livre dans cette catégorie'}
                </p>
              </div>
            )}

            {filtered.map(item => {
              if (item.type === 'custom') {
                return renderCustomCard(item.skill)
              }
              return renderBuiltInCard(item.resource, item.skill)
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )

  // ── Render built-in book card ──
  function renderBuiltInCard(r: Resource, s: BookSkill) {
    const isActive = activeBookIds.includes(r.id)
    const isExpanded = expandedId === r.id
    const isRelevantForChapter = chapterNumber
      && s.relevance.some(rel => rel.chapterType === chapterNumber || rel.chapterType === 'all')

    return (
      <div
        key={r.id}
        className={cn(
          'bg-white rounded-xl border overflow-hidden transition-all',
          isActive ? 'border-amber-300 shadow-sm' : 'border-slate-200 hover:shadow-md hover:border-slate-300',
          isRelevantForChapter && 'ring-1 ring-emerald-200',
        )}
      >
        <div className={cn('h-1 bg-gradient-to-r', r.coverColor)} />
        <div className="p-3.5">
          <div className="flex items-start gap-3">
            <button
              onClick={() => handleToggleExpand(r.id)}
              className="flex-1 min-w-0 text-left group"
            >
              <div className="flex items-start gap-2">
                {isExpanded
                  ? <ChevronDown className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                  : <ChevronRight className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                }
                <div className="min-w-0">
                  <h3 className="text-[13px] font-bold text-slate-900 leading-snug line-clamp-1">{r.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">{r.author} &middot; {r.year}</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 italic mt-1.5 ml-[22px] line-clamp-2 leading-relaxed">{s.coreConcept}</p>
            </button>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              {isActive && <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[9px] px-1.5 py-0">Actif</Badge>}
              <Button
                variant="ghost" size="icon"
                className={cn('h-8 w-8 rounded-lg transition-all',
                  isActive ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700')}
                onClick={() => onToggleBook(r.id)}
              >
                {isActive ? <BookCheck className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 ml-[22px]">
            <Badge variant="outline" className={cn('text-[9px] px-1.5 py-0', CATEGORY_COLORS[r.category])}>
              {CATEGORY_LABELS[r.category]}
            </Badge>
            {isRelevantForChapter && (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] px-1.5 py-0">
                <Target className="h-2.5 w-2.5 mr-0.5" /> Pertinent chap. {chapterNumber}
              </Badge>
            )}
          </div>
        </div>
        {isExpanded && (
          <>
            <Separator />
            <div className="p-4 space-y-4 bg-slate-50/50">
              {renderSkillDetails(s, r.id)}
            </div>
          </>
        )}
      </div>
    )
  }

  // ── Render custom book card ──
  function renderCustomCard(s: CustomBookSkill) {
    const isActive = activeBookIds.includes(s.id)
    const isExpanded = expandedId === s.id
    const isRelevantForChapter = chapterNumber
      && s.relevance.some(rel => rel.chapterType === chapterNumber || rel.chapterType === 'all')

    return (
      <div
        key={s.id}
        className={cn(
          'bg-white rounded-xl border overflow-hidden transition-all',
          isActive ? 'border-violet-300 shadow-sm shadow-violet-100' : 'border-slate-200 hover:shadow-md hover:border-slate-300',
          isRelevantForChapter && 'ring-1 ring-emerald-200',
        )}
      >
        <div className="h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
        <div className="p-3.5">
          <div className="flex items-start gap-3">
            <button
              onClick={() => handleToggleExpand(s.id)}
              className="flex-1 min-w-0 text-left group"
            >
              <div className="flex items-start gap-2">
                {isExpanded
                  ? <ChevronDown className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                  : <ChevronRight className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                }
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-[13px] font-bold text-slate-900 leading-snug line-clamp-1">{s.title}</h3>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-violet-600 border-violet-200 bg-violet-50 shrink-0">
                      <Sparkles className="h-2.5 w-2.5 mr-0.5" />Importé
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{s.author}</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 italic mt-1.5 ml-[22px] line-clamp-2 leading-relaxed">{s.coreConcept}</p>
            </button>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              {isActive && <Badge className="bg-violet-100 text-violet-700 border-violet-200 text-[9px] px-1.5 py-0">Actif</Badge>}
              <Button
                variant="ghost" size="icon"
                className={cn('h-8 w-8 rounded-lg transition-all',
                  isActive ? 'bg-violet-100 text-violet-700 hover:bg-violet-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700')}
                onClick={() => onToggleBook(s.id)}
              >
                {isActive ? <BookCheck className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-2.5 ml-[22px]">
            {isRelevantForChapter && (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] px-1.5 py-0">
                <Target className="h-2.5 w-2.5 mr-0.5" /> Pertinent chap. {chapterNumber}
              </Badge>
            )}
          </div>
        </div>
        {isExpanded && (
          <>
            <Separator />
            <div className="p-4 space-y-4 bg-slate-50/50">
              {renderSkillDetails(s, s.id)}
              {/* Glossary section — only for custom skills */}
              {s.glossary && s.glossary.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <BookMarked className="h-3.5 w-3.5 text-violet-500" />
                    <h4 className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">Glossaire extrait</h4>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-violet-500 border-violet-200">
                      {s.glossary.length} termes
                    </Badge>
                  </div>
                  <div className="pl-5 space-y-1.5">
                    {s.glossary.map((g, i) => (
                      <div key={i} className="bg-white rounded-md border border-slate-200 px-2.5 py-1.5">
                        <span className="text-[11px] font-semibold text-slate-800">{g.term}</span>
                        <span className="text-[10px] text-slate-500 ml-1.5">— {g.definition}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Delete button */}
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[10px] text-rose-500 hover:text-rose-700 hover:bg-rose-50 gap-1"
                  onClick={() => handleDeleteCustom(s.id)}
                >
                  <Trash2 className="h-3 w-3" />
                  Supprimer ce livre
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  // ── Shared skill details ──
  function renderSkillDetails(s: BookSkill, _id: string) {
    return (
      <>
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
            <h4 className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">Concept clé</h4>
          </div>
          <p className="text-[12px] text-slate-600 leading-relaxed pl-5">{s.coreConcept}</p>
        </div>
        {s.frameworks.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Target className="h-3.5 w-3.5 text-emerald-500" />
              <h4 className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">Cadres et frameworks</h4>
            </div>
            <div className="space-y-2 pl-5">
              {s.frameworks.map((fw, i) => (
                <div key={i} className="bg-white rounded-lg border border-slate-200 p-2.5">
                  <p className="text-[12px] font-semibold text-slate-800">{fw.name}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{fw.description}</p>
                  <p className="text-[10px] text-emerald-600 mt-1 font-medium">Quand : {fw.when}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {s.principles.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Lightbulb className="h-3.5 w-3.5 text-emerald-500" />
              <h4 className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">Principes</h4>
            </div>
            <ul className="space-y-1 pl-5">
              {s.principles.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] text-slate-600 leading-relaxed">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />{p}
                </li>
              ))}
            </ul>
          </div>
        )}
        {s.techniques.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Wrench className="h-3.5 w-3.5 text-blue-500" />
              <h4 className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">Techniques</h4>
            </div>
            <ol className="space-y-1 pl-5">
              {s.techniques.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] text-slate-600 leading-relaxed">
                  <span className="mt-0.5 text-[10px] font-bold text-blue-500 shrink-0">{i + 1}.</span>{t}
                </li>
              ))}
            </ol>
          </div>
        )}
        {s.antiPatterns.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
              <h4 className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">Pièges</h4>
            </div>
            <ul className="space-y-1 pl-5">
              {s.antiPatterns.map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] text-rose-700/80 leading-relaxed">
                  <AlertTriangle className="h-3 w-3 mt-0.5 text-rose-400 shrink-0" />{a}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Bookmark className="h-3.5 w-3.5 text-violet-500" />
            <h4 className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">Pertinence</h4>
          </div>
          <div className="flex flex-wrap gap-1.5 pl-5">
            {s.relevance.map((rel, i) => (
              <div
                key={i}
                className={cn(
                  'text-[10px] px-2 py-1 rounded-md border',
                  rel.chapterType === 'all'
                    ? 'bg-slate-100 text-slate-600 border-slate-200'
                    : chapterNumber === rel.chapterType
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-200 font-semibold'
                      : 'bg-violet-50 text-violet-700 border-violet-200',
                )}
                title={rel.reason}
              >
                {rel.chapterType === 'all' ? 'Tous les chapitres' : `Chap. ${rel.chapterType}`}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Bookmark className="h-3.5 w-3.5 text-amber-500" />
            <h4 className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">Aide-mémoire</h4>
          </div>
          <div className="ml-5 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-[11px] text-amber-900 leading-relaxed font-medium">{s.quickReference}</p>
          </div>
        </div>
      </>
    )
  }
}
