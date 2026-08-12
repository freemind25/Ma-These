'use client'

import { useState, useCallback } from 'react'
import {
  Search, X, Loader2, Plus, Trash2, BookOpen, Library, FlaskConical,
  FileText, ChevronDown, ChevronUp, GraduationCap, Globe, Database,
  Building2, BookmarkPlus, GripVertical, Save, Link2, Columns3,
  Ban, PenLine, ListChecks, BrainCircuit,
} from 'lucide-react'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

/* ─── Props ─────────────────────────────────────────────────────────── */

interface RecherchePanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  chapitreId?: string
  chapitreTitle?: string
}

/* ─── Types ─────────────────────────────────────────────────────────── */

interface ExplorerResult {
  id?: string
  titre: string
  auteurs: string[]
  annee: number | null
  journal?: string
  citationCount?: number
  doi?: string
  abstract?: string
  source?: string
}

interface SourceBibliographique {
  id: string
  titre: string
  auteurs: { nom: string; prenom: string }[]
  annee: number | null
  type: 'article' | 'ouvrage' | 'these' | 'rapport' | 'chapitre'
  doi?: string
  journal?: string
  abstract?: string
}

interface CorpusDocument {
  id: string
  corpus: string
  titre: string
  contenu: string
  motsCles?: string[]
}

interface FicheLecture {
  id: string
  sourceId: string
  sourceTitle?: string
  chapitreId?: string
  chapitre?: string
  problematique?: string
  methode?: string
  resultatsCles?: string
  limites?: string
  positionnement?: string
}

/* ─── Constants ─────────────────────────────────────────────────────── */

const SOURCE_CHECKBOXES = [
  { id: 'openalex', label: 'OpenAlex', icon: Globe, color: 'text-emerald-600' },
  { id: 'crossref', label: 'CrossRef', icon: Database, color: 'text-amber-600' },
  { id: 'hal', label: 'HAL', icon: Building2, color: 'text-orange-600' },
] as const

const TYPE_BADGES: Record<string, string> = {
  article: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  ouvrage: 'bg-blue-100 text-blue-700 border-blue-200',
  these: 'bg-violet-100 text-violet-700 border-violet-200',
  rapport: 'bg-amber-100 text-amber-700 border-amber-200',
  chapitre: 'bg-rose-100 text-rose-700 border-rose-200',
}

const CORPUS_LABELS: Record<string, string> = {
  redaction_doctorale_generique: 'Rédaction doctorale générique',
  methodologie_disciplinaire: 'Méthodologie disciplinaire',
  redaction_article_scientifique: 'Rédaction article scientifique',
}

const CORPUS_COLORS: Record<string, string> = {
  redaction_doctorale_generique: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  methodologie_disciplinaire: 'bg-amber-100 text-amber-700 border-amber-200',
  redaction_article_scientifique: 'bg-violet-100 text-violet-700 border-violet-200',
}

const TYPE_LABELS: Record<string, string> = {
  article: 'Article',
  ouvrage: 'Ouvrage',
  these: 'Thèse',
  rapport: 'Rapport',
  chapitre: 'Chapitre',
}

/* ─── Scrollbar styles ──────────────────────────────────────────────── */

const SCROLLBAR_CLASS = 'max-h-96 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-emerald-300 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full'

/* ─── Component ─────────────────────────────────────────────────────── */

export default function RecherchePanel({ open, onOpenChange, chapitreId, chapitreTitle }: RecherchePanelProps) {
  const [activeTab, setActiveTab] = useState('explorer')

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[640px] p-0 overflow-y-auto bg-slate-50">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-200">
          <SheetHeader className="px-5 pt-5 pb-3">
            <SheetTitle className="flex items-center gap-2 text-base">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-emerald-700" />
              </div>
              Recherche
              {chapitreId && (
                <Badge variant="outline" className="ml-2 text-[10px] px-1.5 py-0 border-emerald-300 text-emerald-700">
                  <Link2 className="h-2.5 w-2.5 mr-0.5" />
                  {chapitreTitle || 'Chapitre lié'}
                </Badge>
              )}
            </SheetTitle>
          </SheetHeader>

          {/* Tabs */}
          <div className="px-5 pb-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full h-9 bg-slate-100/80 p-0.5 grid grid-cols-4">
                <TabsTrigger value="explorer" className="text-[10px] gap-1 h-8 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-700">
                  <Globe className="h-3 w-3" />
                  <span className="hidden sm:inline">Explorer</span>
                </TabsTrigger>
                <TabsTrigger value="bibliotheque" className="text-[10px] gap-1 h-8 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-700">
                  <Library className="h-3 w-3" />
                  <span className="hidden sm:inline">Bibliothèque</span>
                </TabsTrigger>
                <TabsTrigger value="corpus" className="text-[10px] gap-1 h-8 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-700">
                  <FlaskConical className="h-3 w-3" />
                  <span className="hidden sm:inline">Corpus</span>
                </TabsTrigger>
                <TabsTrigger value="revue" className="text-[10px] gap-1 h-8 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-700">
                  <ListChecks className="h-3 w-3" />
                  <span className="hidden sm:inline">Revue</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="explorer" className="mt-0 px-0 pb-0">
                <ExplorerTab chapitreId={chapitreId} />
              </TabsContent>
              <TabsContent value="bibliotheque" className="mt-0 px-0 pb-0">
                <BibliothequeTab chapitreId={chapitreId} />
              </TabsContent>
              <TabsContent value="corpus" className="mt-0 px-0 pb-0">
                <CorpusTab />
              </TabsContent>
              <TabsContent value="revue" className="mt-0 px-0 pb-0">
                <RevueTab />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Tab content area — filled by TabsContent above */}
      </SheetContent>
    </Sheet>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   TAB 1 — Explorer
   ═══════════════════════════════════════════════════════════════════════ */

function ExplorerTab({ chapitreId }: { chapitreId?: string }) {
  const [query, setQuery] = useState('')
  const [sources, setSources] = useState<string[]>(['openalex', 'crossref', 'hal'])
  const [fromYear, setFromYear] = useState('')
  const [toYear, setToYear] = useState('')
  const [results, setResults] = useState<ExplorerResult[]>([])
  const [loading, setLoading] = useState(false)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())

  const toggleSource = useCallback((id: string) => {
    setSources(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }, [])

  const handleSearch = useCallback(async () => {
    if (!query.trim() || sources.length === 0) return
    setLoading(true)
    try {
      const params = new URLSearchParams({
        q: query.trim(),
        sources: sources.join(','),
        ...(fromYear && { from_year: fromYear }),
        ...(toYear && { to_year: toYear }),
      })
      const res = await fetch(`/api/recherche/explorer?${params}`)
      if (res.ok) {
        const data = await res.json()
        setResults(Array.isArray(data) ? data : data.results ?? [])
      }
    } catch {
      /* silently fail — no toast spam */
    } finally {
      setLoading(false)
    }
  }, [query, sources, fromYear, toYear])

  const handleAddToBiblio = useCallback(async (result: ExplorerResult) => {
    try {
      const res = await fetch('/api/recherche/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titre: result.titre,
          auteurs: result.auteurs,
          annee: result.annee,
          doi: result.doi,
          type: 'article',
          journal: result.journal,
          abstract: result.abstract,
          ...(chapitreId && { chapitreId }),
        }),
      })
      if (res.ok) {
        const key = result.id || result.titre
        setAddedIds(prev => new Set(prev).add(key))
      }
    } catch {
      /* silently fail */
    }
  }, [chapitreId])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="px-5 pt-4 pb-6 space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Mots-clés, titre, auteur..."
          className="h-9 pl-8 pr-20 text-xs rounded-lg border-slate-200 bg-white"
        />
        <Button
          size="sm"
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-3 text-[10px] bg-emerald-600 hover:bg-emerald-700"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
          <span className="ml-1">Chercher</span>
        </Button>
      </div>

      {/* Source checkboxes */}
      <div className="flex flex-wrap gap-2">
        {SOURCE_CHECKBOXES.map(src => {
          const checked = sources.includes(src.id)
          return (
            <label key={src.id} className="flex items-center gap-1.5 cursor-pointer select-none">
              <Checkbox
                checked={checked}
                onCheckedChange={() => toggleSource(src.id)}
                className="h-3.5 w-3.5 border-slate-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
              />
              <src.icon className={cn('h-3 w-3', checked ? src.color : 'text-slate-400')} />
              <span className={cn('text-[10px]', checked ? 'text-slate-700' : 'text-slate-400')}>{src.label}</span>
            </label>
          )
        })}
      </div>

      {/* Year filters */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-slate-500 whitespace-nowrap">Période :</span>
        <Input
          type="number"
          placeholder="De"
          value={fromYear}
          onChange={e => setFromYear(e.target.value)}
          className="h-7 w-20 text-[10px] rounded-md border-slate-200 bg-white"
        />
        <span className="text-slate-300">—</span>
        <Input
          type="number"
          placeholder="À"
          value={toYear}
          onChange={e => setToYear(e.target.value)}
          className="h-7 w-20 text-[10px] rounded-md border-slate-200 bg-white"
        />
      </div>

      <Separator />

      {/* Results */}
      {results.length === 0 && !loading ? (
        <div className="text-center py-8 text-slate-400 text-xs">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p>Entrez des mots-clés pour explorer les bases académiques.</p>
          <p className="text-[10px] mt-1">Résultats factuels uniquement — aucune interprétation IA.</p>
        </div>
      ) : (
        <div className={cn('space-y-2 pr-1', SCROLLBAR_CLASS)}>
          {results.map((r, idx) => {
            const key = r.id || r.titre || idx
            const alreadyAdded = addedIds.has(key)
            return (
              <div key={key} className="bg-white rounded-lg border border-slate-200 p-3 hover:border-emerald-300 transition-colors">
                {/* Title */}
                <h4 className="text-xs font-medium text-slate-800 leading-snug mb-1.5">{r.titre}</h4>

                {/* Authors */}
                <p className="text-[10px] text-slate-500 mb-1 line-clamp-1">
                  {r.auteurs?.length ? r.auteurs.join(', ') : 'Auteur(s) inconnu(s)'}
                </p>

                {/* Meta row */}
                <div className="flex items-center flex-wrap gap-1.5 text-[10px] text-slate-500">
                  {r.annee && <span>{r.annee}</span>}
                  {r.journal && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span className="italic text-slate-600">{r.journal}</span>
                    </>
                  )}
                  {r.citationCount != null && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span className="text-emerald-600">{r.citationCount} citations</span>
                    </>
                  )}
                  {r.source && (
                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-slate-200 text-slate-400">
                      {r.source}
                    </Badge>
                  )}
                </div>

                {/* Action */}
                <div className="mt-2 flex justify-end">
                  {alreadyAdded ? (
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-600 border-emerald-200">
                      <BookOpen className="h-2.5 w-2.5 mr-0.5" /> Ajouté
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAddToBiblio(r)}
                      className="h-7 px-2.5 text-[10px] text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                    >
                      <BookmarkPlus className="h-3 w-3 mr-0.5" />
                      Ajouter à ma bibliothèque
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   TAB 2 — Ma bibliothèque
   ═══════════════════════════════════════════════════════════════════════ */

function BibliothequeTab({ chapitreId }: { chapitreId?: string }) {
  const [sources, setSources] = useState<SourceBibliographique[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  const [showAddForm, setShowAddForm] = useState(false)

  /* New source form state */
  const [newTitle, setNewTitle] = useState('')
  const [newAuthors, setNewAuthors] = useState('')
  const [newYear, setNewYear] = useState('')
  const [newType, setNewType] = useState('article')
  const [newJournal, setNewJournal] = useState('')

  const fetchSources = useCallback(async () => {
    setLoading(true)
    try {
      const params = chapitreId ? `?chapitreId=${chapitreId}` : ''
      const res = await fetch(`/api/recherche/sources${params}`)
      if (res.ok) {
        const data = await res.json()
        setSources(Array.isArray(data) ? data : [])
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false)
    }
  }, [chapitreId])

  /* Load on first render */
  useState(() => { fetchSources() })

  const handleDelete = useCallback(async (id: string) => {
    try {
      await fetch(`/api/recherche/sources?id=${id}`, { method: 'DELETE' })
      setSources(prev => prev.filter(s => s.id !== id))
    } catch {
      /* silent */
    }
  }, [])

  const handleCreateFiche = useCallback(async (sourceId: string) => {
    try {
      await fetch('/api/recherche/fiches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId, ...(chapitreId && { chapitreId }) }),
      })
    } catch {
      /* silent */
    }
  }, [chapitreId])

  const handleAddSource = useCallback(async () => {
    if (!newTitle.trim()) return
    try {
      const auteurs = newAuthors.split(',').map(a => {
        const parts = a.trim().split(' ')
        return { prenom: parts[0] || '', nom: parts.slice(1).join(' ') || '' }
      })
      const res = await fetch('/api/recherche/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titre: newTitle.trim(),
          auteurs,
          annee: newYear ? parseInt(newYear) : null,
          type: newType,
          journal: newJournal.trim() || undefined,
          ...(chapitreId && { chapitreId }),
        }),
      })
      if (res.ok) {
        setNewTitle('')
        setNewAuthors('')
        setNewYear('')
        setNewJournal('')
        setShowAddForm(false)
        fetchSources()
      }
    } catch {
      /* silent */
    }
  }, [newTitle, newAuthors, newYear, newType, newJournal, chapitreId, fetchSources])

  const filteredSources = filter === 'all'
    ? sources
    : sources.filter(s => s.type === filter)

  const types: (string | 'all')[] = ['all', 'article', 'ouvrage', 'these', 'rapport', 'chapitre']

  return (
    <div className="px-5 pt-4 pb-6 space-y-3">
      {/* Filter bar + Add */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 flex-wrap">
          {types.map(t => (
            <Button
              key={t}
              size="sm"
              variant={filter === t ? 'default' : 'outline'}
              onClick={() => setFilter(t)}
              className={cn(
                'h-7 px-2 text-[10px]',
                filter === t
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'border-slate-200 text-slate-600 hover:text-emerald-700 hover:border-emerald-300',
              )}
            >
              {t === 'all' ? 'Tous' : TYPE_LABELS[t] || t}
            </Button>
          ))}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowAddForm(!showAddForm)}
          className="h-7 px-2 text-[10px] border-emerald-300 text-emerald-600 hover:bg-emerald-50"
        >
          <Plus className="h-3 w-3 mr-0.5" />
          Ajouter
        </Button>
      </div>

      {/* Add source form */}
      {showAddForm && (
        <div className="bg-white rounded-lg border border-emerald-200 p-3 space-y-2">
          <Input
            placeholder="Titre *"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            className="h-8 text-xs"
          />
          <Input
            placeholder="Auteurs (séparés par virgules)"
            value={newAuthors}
            onChange={e => setNewAuthors(e.target.value)}
            className="h-8 text-xs"
          />
          <div className="flex gap-2">
            <Input
              placeholder="Année"
              value={newYear}
              onChange={e => setNewYear(e.target.value)}
              className="h-8 text-xs flex-1"
              type="number"
            />
            <select
              value={newType}
              onChange={e => setNewType(e.target.value)}
              className="h-8 text-xs rounded-md border border-slate-200 bg-white px-2 flex-1"
            >
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <Input
            placeholder="Journal / Revue (optionnel)"
            value={newJournal}
            onChange={e => setNewJournal(e.target.value)}
            className="h-8 text-xs"
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)} className="h-7 text-[10px]">
              Annuler
            </Button>
            <Button size="sm" onClick={handleAddSource} disabled={!newTitle.trim()} className="h-7 px-3 text-[10px] bg-emerald-600 hover:bg-emerald-700">
              Enregistrer
            </Button>
          </div>
        </div>
      )}

      <Separator />

      {/* Source list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
        </div>
      ) : filteredSources.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-xs">
          <Library className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p>Aucune source dans votre bibliothèque.</p>
          <p className="text-[10px] mt-1">Explorez ou ajoutez des sources manuellement.</p>
        </div>
      ) : (
        <div className={cn('space-y-2 pr-1', SCROLLBAR_CLASS)}>
          {filteredSources.map(s => (
            <div key={s.id} className="bg-white rounded-lg border border-slate-200 p-3 hover:border-emerald-300 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-medium text-slate-800 leading-snug mb-1 line-clamp-2">{s.titre}</h4>
                  <p className="text-[10px] text-slate-500 mb-1 line-clamp-1">
                    {s.auteurs?.length
                      ? s.auteurs.map(a => `${a.prenom} ${a.nom}`).join(', ')
                      : 'Auteur(s) inconnu(s)'}
                  </p>
                  <div className="flex items-center flex-wrap gap-1.5 text-[10px]">
                    {s.annee && <span className="text-slate-500">{s.annee}</span>}
                    {s.journal && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="italic text-slate-600">{s.journal}</span>
                      </>
                    )}
                    <Badge className={cn('text-[9px] px-1.5 py-0 h-4 border', TYPE_BADGES[s.type] || 'bg-slate-100 text-slate-600')}>
                      {TYPE_LABELS[s.type] || s.type}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCreateFiche(s.id)}
                    className="h-7 px-2 text-[10px] text-emerald-600 hover:bg-emerald-50"
                    title="Créer une fiche de lecture"
                  >
                    <PenLine className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(s.id)}
                    className="h-7 px-2 text-[10px] text-red-500 hover:bg-red-50"
                    title="Supprimer"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   TAB 3 — Corpus méthodologique
   ═══════════════════════════════════════════════════════════════════════ */

function CorpusTab() {
  const [query, setQuery] = useState('')
  const [corpusFilter, setCorpusFilter] = useState<string>('')
  const [results, setResults] = useState<CorpusDocument[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleSearch = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        ...(query.trim() && { q: query.trim() }),
        ...(corpusFilter && { corpus: corpusFilter }),
      })
      const res = await fetch(`/api/recherche/corpus?${params}`)
      if (res.ok) {
        const data = await res.json()
        setResults(Array.isArray(data) ? data : data.results ?? [])
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false)
    }
  }, [query, corpusFilter])

  useState(() => {
    handleSearch()
  })

  const getExcerpt = (contenu: string) => {
    const clean = contenu.replace(/\s+/g, ' ').trim()
    return clean.length > 200 ? clean.slice(0, 200) + '…' : clean
  }

  return (
    <div className="px-5 pt-4 pb-6 space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Rechercher dans le corpus méthodologique..."
          className="h-9 pl-8 pr-8 text-xs rounded-lg border-slate-200 bg-white"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2">
            <X className="h-3 w-3 text-slate-400 hover:text-slate-600" />
          </button>
        )}
      </div>

      {/* Corpus filter */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <Button
          size="sm"
          variant={corpusFilter === '' ? 'default' : 'outline'}
          onClick={() => setCorpusFilter('')}
          className={cn(
            'h-7 px-2 text-[10px]',
            corpusFilter === '' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'border-slate-200 text-slate-600',
          )}
        >
          Tous
        </Button>
        {Object.entries(CORPUS_LABELS).map(([key, label]) => (
          <Button
            key={key}
            size="sm"
            variant={corpusFilter === key ? 'default' : 'outline'}
            onClick={() => setCorpusFilter(key)}
            className={cn(
              'h-7 px-2 text-[10px]',
              corpusFilter === key ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'border-slate-200 text-slate-600',
            )}
          >
            {label}
          </Button>
        ))}
      </div>

      <Separator />

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-xs">
          <FlaskConical className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p>Aucun résultat dans le corpus.</p>
          <p className="text-[10px] mt-1">Ce corpus est la base utilisée par l'IA superviseure.</p>
        </div>
      ) : (
        <div className={cn('space-y-2 pr-1', SCROLLBAR_CLASS)}>
          {results.map(doc => {
            const isExpanded = expandedId === doc.id
            return (
              <div key={doc.id} className="bg-white rounded-lg border border-slate-200 p-3 hover:border-emerald-300 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-xs font-medium text-slate-800 leading-snug flex-1">{doc.titre}</h4>
                  <Badge className={cn('text-[9px] px-1.5 py-0 h-4 border shrink-0', CORPUS_COLORS[doc.corpus] || 'bg-slate-100 text-slate-600')}>
                    {CORPUS_LABELS[doc.corpus] || doc.corpus}
                  </Badge>
                </div>

                <p className={cn('text-[10px] text-slate-500 leading-relaxed', isExpanded ? '' : 'line-clamp-2')}>
                  {isExpanded ? doc.contenu.replace(/\s+/g, ' ').trim() : getExcerpt(doc.contenu)}
                </p>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setExpandedId(isExpanded ? null : doc.id)}
                  className="mt-1.5 h-6 px-2 text-[10px] text-emerald-600 hover:bg-emerald-50"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-3 w-3 mr-0.5" /> Réduire
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-0.5" /> Lire l'extrait complet
                    </>
                  )}
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════
   TAB 4 — Revue de littérature
   ═══════════════════════════════════════════════════════════════════════ */

function RevueTab() {
  const [activeSubTab, setActiveSubTab] = useState<'fiches' | 'grille'>('fiches')

  return (
    <div className="px-5 pt-4 pb-6 space-y-3">
      {/* Sub-tabs */}
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant={activeSubTab === 'fiches' ? 'default' : 'outline'}
          onClick={() => setActiveSubTab('fiches')}
          className={cn(
            'h-7 px-3 text-[10px] gap-1',
            activeSubTab === 'fiches' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'border-slate-200 text-slate-600',
          )}
        >
          <PenLine className="h-3 w-3" />
          Fiches de lecture
        </Button>
        <Button
          size="sm"
          variant={activeSubTab === 'grille' ? 'default' : 'outline'}
          onClick={() => setActiveSubTab('grille')}
          className={cn(
            'h-7 px-3 text-[10px] gap-1',
            activeSubTab === 'grille' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'border-slate-200 text-slate-600',
          )}
        >
          <Columns3 className="h-3 w-3" />
          Grille de synthèse
        </Button>
      </div>

      <Separator />

      {activeSubTab === 'fiches' ? <FichesSubTab /> : <GrilleSubTab />}
    </div>
  )
}

/* ── 4a. Fiches de lecture ─────────────────────────────────────────── */

function FichesSubTab() {
  const [fiches, setFiches] = useState<FicheLecture[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)

  /* Edit state per fiche */
  const [editState, setEditState] = useState<Record<string, {
    problematique: string
    methode: string
    resultatsCles: string
    limites: string
    positionnement: string
  }>>({})

  const fetchFiches = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/recherche/fiches')
      if (res.ok) {
        const data = await res.json()
        const list: FicheLecture[] = Array.isArray(data) ? data : data.fiches ?? []
        setFiches(list)

        // Initialize edit state for each fiche — ALL EMPTY by design
        const initEdit: typeof editState = {}
        for (const f of list) {
          initEdit[f.id] = {
            problematique: f.problematique ?? '',
            methode: f.methode ?? '',
            resultatsCles: f.resultatsCles ?? '',
            limites: f.limites ?? '',
            positionnement: f.positionnement ?? '',
          }
        }
        setEditState(initEdit)
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false)
    }
  }, [])

  useState(() => { fetchFiches() })

  const updateField = (ficheId: string, field: string, value: string) => {
    setEditState(prev => ({
      ...prev,
      [ficheId]: { ...prev[ficheId], [field]: value },
    }))
  }

  const handleSave = useCallback(async (ficheId: string) => {
    setSavingId(ficheId)
    try {
      const fields = editState[ficheId]
      if (!fields) return
      await fetch('/api/recherche/fiches', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: ficheId,
          ...fields,
        }),
      })
    } catch {
      /* silent */
    } finally {
      setSavingId(null)
    }
  }, [editState])

  const FICHE_FIELDS = [
    { key: 'problematique', label: 'Problématique traitée' },
    { key: 'methode', label: 'Méthode mobilisée' },
    { key: 'resultatsCles', label: 'Résultats clés' },
    { key: 'limites', label: 'Limites identifiées' },
    { key: 'positionnement', label: 'Positionnement (convergence / nuance / opposition)' },
  ] as const

  return (
    <>
      {/* Disclaimer */}
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-[10px] text-amber-700">
        <Ban className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <span>
          Ces fiches sont <strong>remplies par le chercheur</strong>, jamais pré-remplies par l'IA.
          Il s'agit d'un outil d'organisation de la lecture critique.
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
        </div>
      ) : fiches.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-xs">
          <PenLine className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p>Aucune fiche de lecture.</p>
          <p className="text-[10px] mt-1">Créez une fiche depuis « Ma bibliothèque » pour commencer.</p>
        </div>
      ) : (
        <div className={cn('space-y-2 pr-1', SCROLLBAR_CLASS)}>
          {fiches.map(fiche => {
            const isExpanded = expandedId === fiche.id
            const fields = editState[fiche.id]

            return (
              <div key={fiche.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:border-emerald-300 transition-colors">
                {/* Header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : fiche.id)}
                  className="w-full text-left p-3 flex items-center justify-between gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-medium text-slate-800 leading-snug line-clamp-1">
                      {fiche.sourceTitle || fiche.sourceId}
                    </h4>
                    {fiche.chapitre && (
                      <p className="text-[10px] text-emerald-600 mt-0.5">
                        <Link2 className="h-2.5 w-2.5 inline mr-0.5" />
                        {fiche.chapitre}
                      </p>
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  )}
                </button>

                {/* Expanded form */}
                {isExpanded && fields && (
                  <div className="border-t border-slate-100 p-3 space-y-2.5">
                    {FICHE_FIELDS.map(field => (
                      <div key={field.key}>
                        <label className="text-[10px] font-medium text-slate-600 mb-1 block">
                          {field.label}
                        </label>
                        <Textarea
                          value={fields[field.key as keyof typeof fields]}
                          onChange={e => updateField(fiche.id, field.key, e.target.value)}
                          placeholder="—"
                          rows={3}
                          className="text-[11px] leading-relaxed rounded-md border-slate-200 bg-slate-50/50 resize-none focus:ring-emerald-500/30 focus:border-emerald-300"
                        />
                      </div>
                    ))}

                    <div className="flex justify-end pt-1">
                      <Button
                        size="sm"
                        onClick={() => handleSave(fiche.id)}
                        disabled={savingId === fiche.id}
                        className="h-7 px-3 text-[10px] bg-emerald-600 hover:bg-emerald-700"
                      >
                        {savingId === fiche.id ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <Save className="h-3 w-3 mr-1" />
                        )}
                        Enregistrer
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

/* ── 4b. Grille de synthèse ────────────────────────────────────────── */

interface GrilleRow {
  sourceId: string
  sourceTitle: string
}

function GrilleSubTab() {
  const [axes, setAxes] = useState<string[]>([])
  const [rows, setRows] = useState<GrilleRow[]>([])
  const [loading, setLoading] = useState(false)
  const [newAxis, setNewAxis] = useState('')
  const [cells, setCells] = useState<Record<string, string>>({})

  const fetchGrilleData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/recherche/fiches')
      if (res.ok) {
        const data = await res.json()
        const list: FicheLecture[] = Array.isArray(data) ? data : data.fiches ?? []

        // Unique sources that have fiches
        const seen = new Map<string, string>()
        for (const f of list) {
          if (!seen.has(f.sourceId)) {
            seen.set(f.sourceId, f.sourceTitle || f.sourceId)
          }
        }
        setRows(Array.from(seen.entries()).map(([sourceId, sourceTitle]) => ({ sourceId, sourceTitle })))
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false)
    }
  }, [])

  useState(() => { fetchGrilleData() })

  const addAxis = () => {
    const trimmed = newAxis.trim()
    if (!trimmed) return
    setAxes(prev => [...prev, trimmed])
    setNewAxis('')
  }

  const removeAxis = (idx: number) => {
    setAxes(prev => prev.filter((_, i) => i !== idx))
  }

  const updateCell = (sourceId: string, axisIdx: number, value: string) => {
    setCells(prev => ({ ...prev, [`${sourceId}__${axisIdx}`]: value }))
  }

  return (
    <>
      {/* Disclaimer */}
      <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-[10px] text-emerald-700">
        <Columns3 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <span>
          <strong>Grille de synthèse</strong> — les axes thématiques sont définis librement.
          Chaque cellule est remplie par le chercheur ; aucun contenu n'est généré automatiquement.
        </span>
      </div>

      {/* Axis management */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 space-y-2">
        <p className="text-[10px] font-medium text-slate-600">Axes thématiques</p>

        <div className="flex gap-1.5">
          <Input
            value={newAxis}
            onChange={e => setNewAxis(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addAxis()}
            placeholder="Nouvel axe..."
            className="h-7 text-[10px] flex-1"
          />
          <Button
            size="sm"
            onClick={addAxis}
            disabled={!newAxis.trim()}
            className="h-7 px-2 text-[10px] bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {axes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {axes.map((axis, idx) => (
              <Badge
                key={idx}
                className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 border-emerald-200 gap-1"
              >
                {axis}
                <button onClick={() => removeAxis(idx)} className="hover:text-red-600">
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {axes.length === 0 && (
          <p className="text-[10px] text-slate-400">Ajoutez au moins un axe pour afficher la grille.</p>
        )}
      </div>

      {/* Grille table */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
        </div>
      ) : axes.length === 0 || rows.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-xs">
          <Columns3 className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p>La grille nécessite des fiches de lecture et au moins un axe thématique.</p>
        </div>
      ) : (
        <div className={cn('rounded-lg border border-slate-200 overflow-hidden', SCROLLBAR_CLASS)}>
          <table className="w-full text-[10px]">
            <thead className="sticky top-0 bg-slate-50 z-[1]">
              <tr>
                <th className="text-left px-2 py-1.5 text-slate-600 font-medium bg-slate-100 border-b border-slate-200 min-w-[120px] w-[140px]">
                  Source
                </th>
                {axes.map((axis, idx) => (
                  <th
                    key={idx}
                    className="text-left px-2 py-1.5 text-emerald-700 font-medium bg-emerald-50/80 border-b border-slate-200 min-w-[150px]"
                  >
                    {axis}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.sourceId} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="px-2 py-1.5 text-slate-700 font-medium bg-white border-b border-slate-100 align-top">
                    <span className="line-clamp-2">{row.sourceTitle}</span>
                  </td>
                  {axes.map((_, axisIdx) => {
                    const cellKey = `${row.sourceId}__${axisIdx}`
                    return (
                      <td key={axisIdx} className="px-1 py-1 border-b border-slate-100 bg-white align-top">
                        <Textarea
                          value={cells[cellKey] ?? ''}
                          onChange={e => updateCell(row.sourceId, axisIdx, e.target.value)}
                          placeholder="—"
                          rows={3}
                          className="text-[10px] leading-relaxed rounded border-slate-200 bg-slate-50/50 resize-none focus:ring-emerald-500/30 focus:border-emerald-300 p-1.5"
                        />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
