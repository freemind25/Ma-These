'use client'

import { useState, useCallback } from 'react'
import {
  Search, Loader2, ExternalLink, BookOpen, Quote, Copy, Check,
  GraduationCap, Globe, Database, FileText, Atom, Heart, Plus, CheckCheck, GitBranch,
  Link, Fingerprint, Building2, AlertCircle, Sparkles, Trash2, Brain, MessageCircleQuestion,
  ThumbsUp, ThumbsDown, Minus, ArrowRight, KeyRound, Library, Stethoscope, School,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface SearchResult {
  title: string
  authors: string
  year: string
  abstract?: string
  source: string
  doi?: string
  url?: string
  citationCount?: number
  journal?: string
  isPreprint?: boolean
  fromCache?: boolean
}

const SOURCE_OPTIONS = [
  { id: 'semantic_scholar', label: 'Semantic Scholar', icon: GraduationCap, color: 'bg-sky-50 text-sky-700 border-sky-200', desc: '250M+ papiers, citations' },
  { id: 'openalex', label: 'OpenAlex', icon: Globe, color: 'bg-emerald-50 text-emerald-700 border-emerald-200', desc: '250M+ travaux, open data' },
  { id: 'crossref', label: 'Crossref', icon: Database, color: 'bg-amber-50 text-amber-700 border-amber-200', desc: '140M+ DOI, métadonnées' },
  { id: 'hal', label: 'HAL', icon: Building2, color: 'bg-orange-50 text-orange-700 border-orange-200', desc: 'Archive ouverte française' },
  { id: 'arxiv', label: 'arXiv', icon: Atom, color: 'bg-violet-50 text-violet-700 border-violet-200', desc: 'Preprints CS, physique, maths' },
  { id: 'pubmed', label: 'PubMed', icon: Heart, color: 'bg-rose-50 text-rose-700 border-rose-200', desc: '35M+ articles biomédicaux' },
  { id: 'doaj', label: 'DOAJ', icon: BookOpen, color: 'bg-orange-50 text-orange-700 border-orange-200', desc: '20K+ revues en accès libre' },
  { id: 'core', label: 'CORE', icon: Library, color: 'bg-cyan-50 text-cyan-700 border-cyan-200', desc: '300M+ papiers, full-text PDF' },
  { id: 'europe_pmc', label: 'Europe PMC', icon: Stethoscope, color: 'bg-teal-50 text-teal-700 border-teal-200', desc: '33M+ publications biomédicales' },
  { id: 'eric', label: 'ERIC', icon: School, color: 'bg-indigo-50 text-indigo-700 border-indigo-200', desc: '1.5M+ publications en éducation' },
]

interface ConsensusPaper extends SearchResult {
  consensusScore?: number
  consensusLabel?: string
  tldr?: string
}

interface LiteratureSearchProps {
  s2ApiKey?: string
  consensusApiKey?: string
}

export default function LiteratureSearch({ s2ApiKey, consensusApiKey }: LiteratureSearchProps) {
  // Search state
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedSources, setSelectedSources] = useState<string[]>(['openalex', 'crossref', 'hal', 'semantic_scholar', 'doaj'])
  const [expandedIdx, setExpandedIdx] = useState<number | string | null>(null)
  const [copiedIdx, setCopiedIdx] = useState<number | string | null>(null)
  const [totalResults, setTotalResults] = useState(0)
  const [sourceErrors, setSourceErrors] = useState<string[]>([])
  const [searchMode, setSearchMode] = useState<'search' | 'doi' | 'recommend' | 'consensus'>('search')
  const [langFilter, setLangFilter] = useState<string>('all')

  // DOI lookup state
  const [doiInput, setDoiInput] = useState('')
  const [doiResult, setDoiResult] = useState<SearchResult | null>(null)
  const [doiLoading, setDoiLoading] = useState(false)
  const [doiError, setDoiError] = useState('')
  const [doiAdded, setDoiAdded] = useState(false)

  // Related papers state (old /api/related)
  const [relatedDois, setRelatedDois] = useState<Record<string, SearchResult[]>>({})
  const [relatedLoading, setRelatedLoading] = useState<Record<string, boolean>>({})

  // S2 Recommendations state
  const [recommendations, setRecommendations] = useState<SearchResult[]>([])
  const [recommendLoading, setRecommendLoading] = useState(false)
  const [recommendDoi, setRecommendDoi] = useState('')

  // Consensus AI state
  const [consensusQuery, setConsensusQuery] = useState('')
  const [consensusLoading, setConsensusLoading] = useState(false)
  const [consensusAnswer, setConsensusAnswer] = useState('')
  const [consensusPapers, setConsensusPapers] = useState<ConsensusPaper[]>([])
  const [consensusError, setConsensusError] = useState('')

  // Add to references state
  const [addedDois, setAddedDois] = useState<Set<string>>(new Set())
  const [addingDois, setAddingDois] = useState<Record<string, boolean>>({})

  const toggleSource = (id: string) => {
    setSelectedSources(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const handleSearch = useCallback(async () => {
    if (!query.trim() || selectedSources.length === 0 || loading) return
    setLoading(true)
    setResults([])
    setExpandedIdx(null)
    setRelatedDois({})
    setAddedDois(new Set())
    setSourceErrors([])
    try {
      const res = await fetch('/api/literature-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), sources: selectedSources, limit: 10, s2ApiKey, lang: langFilter }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResults(data.results || [])
      setTotalResults(data.totalResults || 0)
      if (data.errors?.length > 0) setSourceErrors(data.errors)
    } catch {
      setResults([])
      setTotalResults(0)
    } finally {
      setLoading(false)
    }
  }, [query, selectedSources, loading])

  const handleDoiLookup = useCallback(async () => {
    const input = doiInput.trim()
    if (!input || doiLoading) return
    setDoiLoading(true)
    setDoiResult(null)
    setDoiError('')
    setDoiAdded(false)
    try {
      // Determine if it's a DOI, arXiv ID, or URL
      const body: Record<string, string> = {}
      if (input.match(/^10\.\d{4,}\//)) {
        body.doi = input
      } else if (input.match(/^\d{4}\.\d{4,5}$/)) {
        body.arxivId = input
      } else if (input.startsWith('http')) {
        body.url = input
      } else {
        // Try as DOI first
        body.doi = input.startsWith('10.') ? input : `10.${input}`
      }
      const res = await fetch('/api/literature-search/doi-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setDoiError(data.error || 'Papier non trouvé')
        return
      }
      setDoiResult(data)
    } catch {
      setDoiError('Erreur lors de la résolution')
    } finally {
      setDoiLoading(false)
    }
  }, [doiInput, doiLoading])

  const copyBibTeX = useCallback(async (r: SearchResult, idx: number | string) => {
    const firstAuthor = r.authors?.split(',')[0]?.trim()?.split(' ')?.pop()?.toLowerCase() || 'author'
    const key = `${firstAuthor}${r.year}`
    const bibtex = `@article{${key},
  title={${r.title}},
  author={${r.authors}},
  year={${r.year}},
  journal={${r.journal || ''}},
  doi={${r.doi || ''}}
}`
    await navigator.clipboard.writeText(bibtex)
    setCopiedIdx(idx as number)
    setTimeout(() => setCopiedIdx(null), 2000)
  }, [])

  const fetchConsensusAnswer = useCallback(async () => {
    if (!consensusQuery.trim() || consensusLoading) return
    if (!consensusApiKey?.trim()) {
      setConsensusError('Clé API Consensus requise. Ouvrez les paramètres (⚙) pour l\'ajouter.')
      return
    }
    setConsensusLoading(true)
    setConsensusAnswer('')
    setConsensusPapers([])
    setConsensusError('')
    setAddedDois(new Set())
    try {
      const res = await fetch('/api/literature-search/consensus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: consensusQuery.trim(), apiKey: consensusApiKey, limit: 10 }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur Consensus')
      setConsensusAnswer(data.answer || '')
      setConsensusPapers(data.papers || [])
    } catch (err) {
      setConsensusError(err instanceof Error ? err.message : 'Erreur lors de la requête')
    } finally {
      setConsensusLoading(false)
    }
  }, [consensusQuery, consensusLoading, consensusApiKey])

  const fetchS2Recommendations = useCallback(async (doi: string) => {
    if (!doi || recommendLoading) return
    setRecommendLoading(true)
    setRecommendations([])
    try {
      const res = await fetch('/api/literature-search/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doi, limit: 10, s2ApiKey }),
      })
      const data = await res.json()
      if (res.ok && data.results) {
        setRecommendations(data.results)
      }
    } catch {
      // silently fail
    } finally {
      setRecommendLoading(false)
    }
  }, [recommendLoading, s2ApiKey])

  const fetchRelatedPapers = useCallback(async (doi: string) => {
    if (!doi || relatedDois[doi] || relatedLoading[doi]) return
    setRelatedLoading(prev => ({ ...prev, [doi]: true }))
    try {
      const res = await fetch('/api/literature-search/related', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doi, limit: 5 }),
      })
      const data = await res.json()
      if (res.ok && data.results) {
        setRelatedDois(prev => ({ ...prev, [doi]: data.results }))
      }
    } catch {
      // silently fail
    } finally {
      setRelatedLoading(prev => ({ ...prev, [doi]: false }))
    }
  }, [relatedDois, relatedLoading])

  const addToReferences = useCallback(async (r: SearchResult) => {
    // Generate a unique key for tracking (DOI or title-based)
    const trackKey = r.doi || r.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 30)
    if (addedDois.has(trackKey) || addingDois[trackKey]) return
    setAddingDois(prev => ({ ...prev, [trackKey]: true }))
    try {
      const res = await fetch('/api/references', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: r.title,
          authors: r.authors,
          year: r.year || undefined,
          journal: r.journal || undefined,
          doi: r.doi || undefined,
          abstract: r.abstract || undefined,
          source: 'literature-search',
          type: 'article',
        }),
      })
      if (res.ok) {
        setAddedDois(prev => new Set(prev).add(trackKey))
      }
    } catch {
      // silently fail
    } finally {
      setAddingDois(prev => ({ ...prev, [trackKey]: false }))
    }
  }, [addedDois, addingDois])

  const sourceIcon = (source: string) => {
    const opt = SOURCE_OPTIONS.find(s => s.label === source || s.id === source)
    if (!opt) return <FileText className="h-3 w-3" />
    const Icon = opt.icon
    return <Icon className="h-3 w-3" />
  }

  const sourceBadge = (source: string) => {
    const opt = SOURCE_OPTIONS.find(s => s.label === source)
    if (!opt) return <Badge variant="outline" className="text-[9px]">{source}</Badge>
    return <Badge variant="outline" className={`text-[9px] ${opt.color}`}>{opt.label}</Badge>
  }

  const isAdded = (r: SearchResult, idx?: number | string) => {
    const key = r.doi || r.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 30)
    return addedDois.has(key)
  }

  const isAdding = (r: SearchResult) => {
    const key = r.doi || r.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 30)
    return !!addingDois[key]
  }

  const renderResult = (r: SearchResult, idx: number | string, isRelated = false) => (
    <div key={`${r.doi || r.title}-${idx}`} className={`rounded-xl border bg-white p-3.5 hover:shadow-md transition-shadow ${isRelated ? 'border-slate-100 bg-slate-50/50 ml-4 mr-1' : 'border-slate-200'}`}>
      <div className="flex items-start gap-2.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            {sourceBadge(r.source)}
            {r.isPreprint && (
              <Badge variant="outline" className="text-[9px] bg-yellow-50 text-yellow-700 border-yellow-200">
                Preprint
              </Badge>
            )}
            {r.fromCache && (
              <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
                <Sparkles className="h-2.5 w-2.5" /> cache
              </span>
            )}
            {r.year && <span className="text-[10px] text-slate-400">{r.year}</span>}
            {r.citationCount !== undefined && r.citationCount > 0 && (
              <span className="text-[10px] text-slate-400">· {r.citationCount} cit.{r.citationCount >= 100 ? '+' : ''}</span>
            )}
          </div>
          <h4 className="text-sm font-semibold text-slate-900 leading-snug mb-1 line-clamp-2">{r.title}</h4>
          <p className="text-[11px] text-slate-500 line-clamp-1">{r.authors}</p>
          {r.journal && <p className="text-[10px] text-slate-400 italic mt-0.5">{r.journal}</p>}
        </div>
        <div className="flex flex-col gap-1 shrink-0">
          {r.url && (
            <a href={r.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          <button
            onClick={() => copyBibTeX(r, idx)}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            title="Copier BibTeX"
          >
            {copiedIdx === idx ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Quote className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx as number)}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            title="Voir le résumé"
          >
            <BookOpen className="h-3.5 w-3.5" />
          </button>
          {!isRelated && r.doi && (
            <button
              onClick={() => fetchRelatedPapers(r.doi!)}
              disabled={!!relatedLoading[r.doi]}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-50"
              title="Papiers similaires"
            >
              {relatedLoading[r.doi] ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <GitBranch className="h-3.5 w-3.5" />}
            </button>
          )}
          <button
            onClick={() => addToReferences(r)}
            disabled={isAdded(r, idx) || isAdding(r)}
            className={`p-1.5 rounded-md transition-colors ${
              isAdded(r, idx)
                ? 'text-emerald-500'
                : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-50'
            }`}
            title={isAdded(r, idx) ? 'Déjà ajouté' : 'Ajouter aux références'}
          >
            {isAdding(r) ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : isAdded(r, idx) ? (
              <CheckCheck className="h-3.5 w-3.5" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {expandedIdx === idx && r.abstract && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <p className="text-[11px] text-slate-600 leading-relaxed">{r.abstract}</p>
          {r.doi && (
            <p className="text-[10px] text-slate-400 mt-2 font-mono">DOI: {r.doi}</p>
          )}
        </div>
      )}

      {!isRelated && r.doi && relatedDois[r.doi] && relatedDois[r.doi].length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <p className="text-[10px] font-semibold text-slate-500 mb-2 flex items-center gap-1">
            <GitBranch className="h-3 w-3" />
            Papiers similaires ({relatedDois[r.doi].length})
          </p>
          <div className="space-y-2">
            {relatedDois[r.doi].map((related, ri) =>
              renderResult(related, `related-${idx}-${ri}`, true)
            )}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
        <Search className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-[11px] text-emerald-700 leading-snug font-medium">
            Recherche académique multi-sources
          </p>
          <p className="text-[10px] text-emerald-600 leading-snug mt-0.5">
            9 sources · CORE 300M+ · DOAJ accès libre · Consensus IA · Cache par DOI
          </p>
        </div>
      </div>

      {/* Tab switch: Search vs DOI Lookup */}
      <Tabs value={searchMode} onValueChange={(v) => setSearchMode(v as 'search' | 'doi' | 'recommend' | 'consensus')}>
        <TabsList className="w-full h-9">
          <TabsTrigger value="search" className="flex-1 text-xs gap-1.5">
            <Search className="h-3.5 w-3.5" />
            Recherche
          </TabsTrigger>
          <TabsTrigger value="consensus" className="flex-1 text-xs gap-1.5">
            <Brain className="h-3.5 w-3.5" />
            Consensus
          </TabsTrigger>
          <TabsTrigger value="recommend" className="flex-1 text-xs gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            S2 IA
          </TabsTrigger>
          <TabsTrigger value="doi" className="flex-1 text-xs gap-1.5">
            <Fingerprint className="h-3.5 w-3.5" />
            DOI
          </TabsTrigger>
        </TabsList>

        {/* ─── Search Tab ──────────────────────────── */}
        <TabsContent value="search" className="mt-3 space-y-3">
          {/* Source selector */}
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-2">Sources académiques</p>
            <div className="grid grid-cols-3 gap-1.5">
              {SOURCE_OPTIONS.map(s => {
                const active = selectedSources.includes(s.id)
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleSource(s.id)}
                    title={s.desc}
                    className={`px-2 py-2 rounded-lg text-left transition-all ${
                      active ? s.color + ' shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <s.icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="text-[11px] font-medium truncate">{s.label}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <Separator />

          {/* Language filter (for OpenAlex) + Search input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSearch() }}
                placeholder="Articles, auteurs, mots-clés..."
                className="pl-9 h-10 text-sm"
              />
            </div>
            <select
              value={langFilter}
              onChange={e => setLangFilter(e.target.value)}
              className="h-10 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400"
              title="Filtrer par langue (OpenAlex)"
            >
              <option value="all">🌐 Toutes langues</option>
              <option value="fr">🇫🇷 Français</option>
              <option value="en">🇬🇧 English</option>
              <option value="de">🇩🇪 Deutsch</option>
              <option value="es">🇪🇸 Español</option>
              <option value="pt">🇧🇷 Português</option>
              <option value="ar">🇸🇦 العربية</option>
              <option value="zh">🇨🇳 中文</option>
            </select>
            <Button onClick={handleSearch} disabled={!query.trim() || selectedSources.length === 0 || loading} className="h-10 px-4">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="ml-1.5 text-sm">Chercher</span>
            </Button>
          </div>

          {/* Results count & errors */}
          {totalResults > 0 && (
            <p className="text-xs text-slate-500">{totalResults} résultat{totalResults > 1 ? 's' : ''} trouvé{totalResults > 1 ? 's' : ''}</p>
          )}
          {sourceErrors.length > 0 && (
            <p className="text-xs text-amber-600">⚠ {sourceErrors.length} source{sourceErrors.length > 1 ? 's' : ''} indisponible{sourceErrors.length > 1 ? 's' : ''} ({sourceErrors.join(', ')})</p>
          )}

          {/* Results list */}
          <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
            {results.length === 0 && !loading && (
              <div className="text-center py-12">
                <BookOpen className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                <p className="text-xs text-slate-500">Entrez un sujet pour rechercher dans les bases académiques</p>
              </div>
            )}
            {results.map((r, i) => renderResult(r, i))}
          </div>
        </TabsContent>

        {/* ─── Consensus AI Tab ──────────────────── */}
        <TabsContent value="consensus" className="mt-3 space-y-3">
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-violet-50 border border-violet-200">
            <Brain className="h-3.5 w-3.5 text-violet-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] text-violet-700 leading-snug">
                <strong>Consensus AI</strong> analyse 220M+ papiers et génère une réponse synthétique basée sur les preuves scientifiques.
              </p>
              <p className="text-[10px] text-violet-600 leading-snug mt-0.5">
                Posez une question de recherche pour obtenir une réponse avec citations.{!consensusApiKey ? ' Clé API requise (⚙ → Paramètres).' : ''}
              </p>
            </div>
          </div>

          {/* Question input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MessageCircleQuestion className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={consensusQuery}
                onChange={e => setConsensusQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') fetchConsensusAnswer() }}
                placeholder="Ex: Does intermittent fasting improve cognitive function?"
                className="pl-9 h-10 text-sm"
              />
            </div>
            <Button onClick={fetchConsensusAnswer} disabled={!consensusQuery.trim() || consensusLoading} className="h-10 px-4 bg-violet-600 hover:bg-violet-700">
              {consensusLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
              <span className="ml-1.5 text-sm">Analyser</span>
            </Button>
          </div>

          {/* Error */}
          {consensusError && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200">
              <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-red-700">{consensusError}</p>
                {!consensusApiKey && (
                  <a href="https://consensus.app" target="_blank" rel="noopener" className="text-[10px] text-violet-600 underline mt-1 inline-flex items-center gap-1">
                    <KeyRound className="h-2.5 w-2.5" />Obtenir une clé gratuite sur consensus.app
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Loading */}
          {consensusLoading && (
            <div className="flex flex-col items-center py-10 gap-3">
              <div className="relative">
                <Brain className="h-10 w-10 text-violet-300" />
                <Loader2 className="h-5 w-5 text-violet-600 animate-spin absolute -top-1 -right-1" />
              </div>
              <p className="text-xs text-slate-500">Consensus analyse la littérature scientifique...</p>
            </div>
          )}

          {/* Synthesized answer */}
          {consensusAnswer && !consensusLoading && (
            <div className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-violet-600" />
                <h3 className="text-sm font-semibold text-violet-900">Réponse synthétique</h3>
              </div>
              <div className="text-[12px] text-slate-700 leading-relaxed whitespace-pre-wrap">{consensusAnswer}</div>
              <div className="flex items-center gap-3 mt-3 pt-2 border-t border-violet-100">
                <button
                  onClick={async () => { await navigator.clipboard.writeText(consensusAnswer); setCopiedIdx('consensus-answer'); setTimeout(() => setCopiedIdx(null), 2000) }}
                  className="text-[10px] text-violet-600 hover:text-violet-800 flex items-center gap-1 transition-colors"
                >
                  {copiedIdx === 'consensus-answer' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  Copier
                </button>
                <span className="text-[10px] text-slate-400">{consensusPapers.length} papier{consensusPapers.length > 1 ? 's' : ''} cité{consensusPapers.length > 1 ? 's' : ''}</span>
              </div>
            </div>
          )}

          {/* Cited papers */}
          {consensusPapers.length > 0 && !consensusLoading && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-violet-600" />
                <p className="text-xs font-semibold text-slate-700">Papiers cités ({consensusPapers.length})</p>
              </div>
              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                {consensusPapers.map((p, i) => (
                  <div key={`consensus-${i}`} className="rounded-xl border border-slate-200 bg-white p-3.5 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-2.5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <Badge variant="outline" className="text-[9px] bg-violet-50 text-violet-700 border-violet-200">Consensus AI</Badge>
                          {p.year && <span className="text-[10px] text-slate-400">{p.year}</span>}
                          {p.consensusLabel && (
                            <span className={`text-[9px] font-semibold flex items-center gap-0.5 ${
                              p.consensusLabel === 'Yes' ? 'text-emerald-600' :
                              p.consensusLabel === 'No' ? 'text-red-600' : 'text-amber-600'
                            }`}>
                              {p.consensusLabel === 'Yes' ? <ThumbsUp className="h-2.5 w-2.5" /> :
                               p.consensusLabel === 'No' ? <ThumbsDown className="h-2.5 w-2.5" /> :
                               <Minus className="h-2.5 w-2.5" />}
                              {p.consensusLabel}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-semibold text-slate-900 leading-snug mb-1 line-clamp-2">{p.title}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{p.authors}</p>
                        {p.journal && <p className="text-[10px] text-slate-400 italic mt-0.5">{p.journal}</p>}
                        {p.tldr && !p.abstract && (
                          <p className="text-[11px] text-violet-600 mt-1.5 line-clamp-2 leading-snug">
                            <Sparkles className="h-2.5 w-2.5 inline mr-0.5" />{p.tldr}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        {p.url && (
                          <a href={p.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => setExpandedIdx(expandedIdx === `consensus-${i}` ? null : `consensus-${i}`)}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                          title="Voir le résumé"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => addToReferences(p)}
                          disabled={isAdded(p, `consensus-${i}`) || isAdding(p)}
                          className={`p-1.5 rounded-md transition-colors ${
                            isAdded(p, `consensus-${i}`)
                              ? 'text-emerald-500'
                              : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-50'
                          }`}
                          title={isAdded(p, `consensus-${i}`) ? 'Déjà ajouté' : 'Ajouter aux références'}
                        >
                          {isAdding(p) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> :
                           isAdded(p, `consensus-${i}`) ? <CheckCheck className="h-3.5 w-3.5" /> :
                           <Plus className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                    {expandedIdx === `consensus-${i}` && (p.abstract || p.tldr) && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <p className="text-[11px] text-slate-600 leading-relaxed">{p.abstract || p.tldr}</p>
                        {p.doi && <p className="text-[10px] text-slate-400 mt-2 font-mono">DOI: {p.doi}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!consensusAnswer && !consensusLoading && !consensusError && consensusPapers.length === 0 && (
            <div className="text-center py-8">
              <Brain className="h-8 w-8 text-violet-200 mx-auto mb-3" />
              <p className="text-xs text-slate-500">Posez une question de recherche pour obtenir une réponse basée sur les preuves</p>
              <p className="text-[10px] text-slate-400 mt-1">Consensus analyse automatiquement les 220M+ papiers indexés</p>
            </div>
          )}
        </TabsContent>

        {/* ─── S2 Recommendations Tab ─────────────── */}
        <TabsContent value="recommend" className="mt-3 space-y-3">
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-sky-50 border border-sky-200">
            <GraduationCap className="h-3.5 w-3.5 text-sky-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-sky-700 leading-snug">
              <strong>Recommandations IA par Semantic Scholar.</strong> Entrez un DOI ci-dessous pour découvrir des articles similaires suggérés par le modèle de S2.{s2ApiKey ? '' : ' Une clé S2 est recommandée (⚙ → Clé API Semantic Scholar).'}
            </p>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={recommendDoi}
                onChange={e => setRecommendDoi(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') fetchS2Recommendations(recommendDoi.trim()) }}
                placeholder="Collez un DOI pour obtenir des recommandations..."
                className="pl-9 h-10 text-sm font-mono"
              />
            </div>
            <Button onClick={() => fetchS2Recommendations(recommendDoi.trim())} disabled={!recommendDoi.trim() || recommendLoading} className="h-10 px-4">
              {recommendLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              <span className="ml-1.5 text-sm">Suggérer</span>
            </Button>
          </div>
          <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
            {recommendations.length === 0 && !recommendLoading && (
              <div className="text-center py-8">
                <GraduationCap className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                <p className="text-xs text-slate-500">Entrez un DOI pour obtenir des recommandations</p>
              </div>
            )}
            {recommendations.map((r, i) => renderResult(r, `rec-${i}`))}
          </div>
        </TabsContent>

        {/* ─── DOI Lookup Tab ──────────────────────── */}
        <TabsContent value="doi" className="mt-3 space-y-3">
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
            <Fingerprint className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-600 leading-snug">
              Collez un DOI, un identifiant arXiv ou une URL pour retrouver les métadonnées complètes d&apos;un papier. Résolution via Crossref + OpenAlex + Semantic Scholar en parallèle.
            </p>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={doiInput}
                onChange={e => setDoiInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleDoiLookup() }}
                placeholder="10.1234/example ou 2301.00001 ou https://doi.org/..."
                className="pl-9 h-10 text-sm font-mono"
              />
            </div>
            <Button onClick={handleDoiLookup} disabled={!doiInput.trim() || doiLoading} className="h-10 px-4">
              {doiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Fingerprint className="h-4 w-4" />}
              <span className="ml-1.5 text-sm">Résoudre</span>
            </Button>
          </div>

          {/* DOI Error */}
          {doiError && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200">
              <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">{doiError}</p>
            </div>
          )}

          {/* DOI Result */}
          {doiResult && !doiError && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-700">Papier trouvé</p>
                {(doiResult as unknown as Record<string, unknown>).fromCache as boolean && (
                  <Badge variant="outline" className="text-[9px] bg-slate-50">
                    <Sparkles className="h-2.5 w-2.5 mr-1" /> depuis le cache
                  </Badge>
                )}
              </div>
              {renderResult(doiResult, 'doi-result')}
              <Button
                onClick={() => { addToReferences(doiResult); setDoiAdded(true) }}
                disabled={doiAdded || isAdding(doiResult)}
                variant="outline"
                className="w-full"
                size="sm"
              >
                {doiAdded ? (
                  <><CheckCheck className="h-3.5 w-3.5 mr-1.5" /> Ajouté aux références</>
                ) : isAdding(doiResult) ? (
                  <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Ajout...</>
                ) : (
                  <><Plus className="h-3.5 w-3.5 mr-1.5" /> Ajouter aux références</>
                )}
              </Button>
            </div>
          )}

          {!doiResult && !doiError && !doiLoading && (
            <div className="text-center py-8">
              <Fingerprint className="h-8 w-8 text-slate-300 mx-auto mb-3" />
              <p className="text-xs text-slate-500">Entrez un DOI ou une URL pour résoudre un papier</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
