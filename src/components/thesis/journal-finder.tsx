'use client'

import { useState, useCallback } from 'react'
import {
  Search, Filter, ArrowUpDown, ExternalLink, DollarSign, Globe, BookOpen,
  BadgeCheck, Shield, FileText, Loader2, Download, ChevronDown, ChevronUp,
  Sparkles, X, CheckCircle2, Ban, Circle, ArrowUpRight, GraduationCap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

// ─── Types ────────────────────────────────────────────────────
interface JournalResult {
  id: string
  name: string
  issn: string | null
  homepageUrl: string | null
  publisher: string | null
  countryCode: string | null
  countryName: string | null
  apc: number | null
  apcCurrency: string | null
  isDoaj: boolean
  isScopus: boolean
  license: string | null
  reviewProcess: string | null
  subjects: string[]
  topics: string[]
  worksCount: number
  citedByCount: number
  firstPublicationYear: number | null
  submissionUrl: string | null
  relevanceScore?: number
  source: 'openalex' | 'doaj' | 'both'
}

interface FinderResponse {
  results: JournalResult[]
  total: number
  sources: { openalex: number; doaj: number; merged: number }
  ranked: boolean
  error?: string
}

const DOMAIN_SUGGESTIONS = [
  'Computer Science', 'Machine Learning', 'Artificial Intelligence',
  'Biology', 'Medicine', 'Physics', 'Chemistry', 'Mathematics',
  'Engineering', 'Environmental Science', 'Social Sciences',
  'Psychology', 'Economics', 'Education', 'Law',
]

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Pertinence', icon: Sparkles },
  { value: 'apc_asc', label: 'APC croissant', icon: DollarSign },
  { value: 'citations_desc', label: 'Citations ↓', icon: GraduationCap },
  { value: 'works_desc', label: 'Publications ↓', icon: FileText },
  { value: 'name_asc', label: 'Nom A-Z', icon: ArrowUpDown },
]

// ─── Helpers ──────────────────────────────────────────────────
function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

function getApcDisplay(j: JournalResult): { text: string; color: string } {
  if (j.apc === null) return { text: 'N/A', color: 'text-slate-400' }
  if (j.apc === 0) return { text: 'Gratuit', color: 'text-emerald-600 font-semibold' }
  if (j.apc <= 500) return { text: `$${j.apc}`, color: 'text-emerald-600' }
  if (j.apc <= 1500) return { text: `$${j.apc}`, color: 'text-amber-600' }
  return { text: `$${j.apc}`, color: 'text-red-600' }
}

function exportCsv(journals: JournalResult[]) {
  const header = 'Nom Journal,ISSN,Éditeur,Pays,APC (USD),DOAJ,Scopus,Licence,Évaluation,Publications,Citations,Année 1ère pub.,URL soumission,Sujets'
  const rows = journals.map(j => [
    `"${j.name}"`,
    j.issn || '',
    `"${j.publisher || ''}"`,
    j.countryName || j.countryCode || '',
    j.apc ?? '',
    j.isDoaj ? 'Oui' : 'Non',
    j.isScopus ? 'Oui' : 'Non',
    j.license || '',
    j.reviewProcess || '',
    j.worksCount,
    j.citedByCount,
    j.firstPublicationYear || '',
    j.submissionUrl || '',
    `"${(j.topics.length ? j.topics : j.subjects).join('; ')}"`,
  ].join(','))

  const csv = [header, ...rows].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'journaux-oa-shortlist.csv'
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Component ────────────────────────────────────────────────
export default function JournalFinder() {
  const [query, setQuery] = useState('')
  const [title, setTitle] = useState('')
  const [abstract, setAbstract] = useState('')
  const [maxApc, setMaxApc] = useState<string>('none')
  const [doajOnly, setDoajOnly] = useState(false)
  const [freeOnly, setFreeOnly] = useState(false)
  const [sort, setSort] = useState('relevance')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<FinderResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    try {
      const body: Record<string, unknown> = { query: query.trim(), sort }
      if (title.trim()) body.title = title.trim()
      if (abstract.trim()) body.abstract = abstract.trim()
      if (maxApc !== 'none') body.maxApc = Number(maxApc)
      if (doajOnly) body.doajOnly = true
      if (freeOnly) body.freeOnly = true

      const resp = await fetch('/api/journal-finder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await resp.json()
      if (json.error) { setError(json.error); return }
      setData(json)
    } catch (e) {
      setError('Erreur réseau. Vérifiez votre connexion.')
    } finally {
      setLoading(false)
    }
  }, [query, title, abstract, maxApc, doajOnly, freeOnly, sort])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) handleSearch()
  }

  const sortedJournals = data?.results || []

  return (
    <div className="space-y-4">
      {/* ── Search Bar ── */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Domaine de recherche ex: machine learning, biology..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Button onClick={handleSearch} disabled={loading || !query.trim()} className="h-9 px-4 text-sm">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-1" />}
          {loading ? 'Recherche...' : 'Chercher'}
        </Button>
      </div>

      {/* ── Domain Suggestions ── */}
      <div className="flex flex-wrap gap-1.5">
        {DOMAIN_SUGGESTIONS.slice(0, 8).map(d => (
          <button
            key={d}
            onClick={() => setQuery(d)}
            className="px-2 py-0.5 text-[11px] rounded-full border border-slate-200 text-slate-500 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-colors"
          >
            {d}
          </button>
        ))}
      </div>

      {/* ── Advanced / Manuscript Context ── */}
      <div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
        >
          <Filter className="h-3.5 w-3.5" />
          Filtres et contexte manuscrit
          {showAdvanced ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
        {showAdvanced && (
          <div className="mt-3 space-y-3 p-3 rounded-lg border border-slate-200 bg-slate-50/50">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-600">Titre du manuscrit <span className="text-slate-400">(pour classement IA)</span></Label>
              <Input
                placeholder="Ex: Deep Learning for Medical Image Segmentation"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-600">Résumé <span className="text-slate-400">(optionnel)</span></Label>
              <textarea
                placeholder="Collez le résumé de votre article pour un classement plus précis par l'IA..."
                value={abstract}
                onChange={e => setAbstract(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-600">APC max.</Label>
                <Select value={maxApc} onValueChange={setMaxApc}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Pas de limite</SelectItem>
                    <SelectItem value="0">Gratuit uniquement</SelectItem>
                    <SelectItem value="500">≤ 500 $</SelectItem>
                    <SelectItem value="1000">≤ 1 000 $</SelectItem>
                    <SelectItem value="1500">≤ 1 500 $</SelectItem>
                    <SelectItem value="2000">≤ 2 000 $</SelectItem>
                    <SelectItem value="3000">≤ 3 000 $</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-600">Tri par</Label>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2 pt-5">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={doajOnly} onChange={e => setDoajOnly(e.target.checked)} className="rounded border-slate-300" />
                  <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-slate-600">DOAJ uniquement</span>
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={freeOnly} onChange={e => setFreeOnly(e.target.checked)} className="rounded border-slate-300" />
                  <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-slate-600">Sans APC</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Info Banner ── */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
        <BookOpen className="h-4 w-4 shrink-0" />
        <span>Recherche dans <strong>OpenAlex</strong> + <strong>DOAJ</strong> — 2 bases de données de journaux OA gratuits · Classement IA par pertinence · Export CSV</span>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
          <X className="h-4 w-4" />{error}
        </div>
      )}

      {/* ── Results Header ── */}
      {data && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-700">{data.total} journaux trouvés</span>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Badge variant="secondary" className="text-[10px] h-5">OpenAlex: {data.sources.openalex}</Badge>
              <Badge variant="secondary" className="text-[10px] h-5">DOAJ: {data.sources.doaj}</Badge>
            </div>
            {data.ranked && (
              <Badge className="bg-violet-100 text-violet-700 text-[10px] h-5 border-0">
                <Sparkles className="h-3 w-3 mr-0.5" />Classé par IA
              </Badge>
            )}
          </div>
          <Button
            variant="outline" size="sm"
            className="h-7 text-[11px]"
            onClick={() => exportCsv(sortedJournals)}
          >
            <Download className="h-3 w-3 mr-1" />Export CSV
          </Button>
        </div>
      )}

      {/* ── Journal List ── */}
      <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
        {sortedJournals.map((j, idx) => {
          const apc = getApcDisplay(j)
          const isExpanded = expandedId === j.id
          return (
            <div
              key={j.id}
              className="border rounded-lg transition-all hover:shadow-sm"
              style={{
                borderColor: j.relevanceScore && j.relevanceScore > 0.8
                  ? 'rgb(16 185 129)' : undefined,
                borderLeftWidth: j.relevanceScore && j.relevanceScore > 0.8 ? '3px' : undefined,
              }}
            >
              {/* Card Header */}
              <div className="p-3 flex items-start gap-3 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : j.id)}>
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-500">
                  {j.relevanceScore ? (
                    <span className="text-emerald-700">{idx + 1}</span>
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-medium text-slate-800 leading-tight line-clamp-2">
                      {j.name}
                    </h4>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {j.isDoaj && (
                        <Badge className="bg-emerald-100 text-emerald-700 text-[9px] h-5 border-0 px-1.5">
                          DOAJ
                        </Badge>
                      )}
                      {j.isScopus && (
                        <Badge className="bg-amber-100 text-amber-700 text-[9px] h-5 border-0 px-1.5">
                          Scopus
                        </Badge>
                      )}
                      {j.source === 'both' && (
                        <Badge variant="secondary" className="text-[9px] h-5 px-1.5">
                          Fusion
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />{j.publisher || 'N/A'}
                    </span>
                    {j.countryName && (
                      <span>{j.countryName}</span>
                    )}
                    <span className={`font-medium ${apc.color}`}>
                      <DollarSign className="h-3 w-3 inline" />{apc.text}
                    </span>
                    {j.license && (
                      <Badge variant="outline" className="text-[9px] h-4 px-1 border-slate-300 text-slate-500">
                        {j.license}
                      </Badge>
                    )}
                  </div>

                  {(j.topics.length || j.subjects.length) > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {(j.topics.length ? j.topics : j.subjects).slice(0, 3).map((t, ti) => (
                        <span key={ti} className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-100 text-slate-600">
                          {t}
                        </span>
                      ))}
                      {(j.topics.length ? j.topics : j.subjects).length > 3 && (
                        <span className="text-[10px] text-slate-400">+{(j.topics.length ? j.topics : j.subjects).length - 3}</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0 mt-1">
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-0 border-t border-slate-100 mt-0">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
                    <div>
                      <span className="text-slate-400 block">ISSN</span>
                      <span className="font-medium text-slate-700">{j.issn || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Publications</span>
                      <span className="font-medium text-slate-700">{formatNumber(j.worksCount)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Citations</span>
                      <span className="font-medium text-slate-700">{formatNumber(j.citedByCount)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">1ère publication</span>
                      <span className="font-medium text-slate-700">{j.firstPublicationYear || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Évaluation</span>
                      <span className="font-medium text-slate-700">{j.reviewProcess || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Licence</span>
                      <span className="font-medium text-slate-700">{j.license || 'N/A'}</span>
                    </div>
                    <div className="col-span-2 sm:col-span-2">
                      <span className="text-slate-400 block">Sujets</span>
                      <span className="font-medium text-slate-700">{(j.topics.length ? j.topics : j.subjects).join(', ') || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    {j.homepageUrl && (
                      <a
                        href={j.homepageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />Page du journal
                      </a>
                    )}
                    {j.submissionUrl && j.submissionUrl !== j.homepageUrl && (
                      <a
                        href={j.submissionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
                      >
                        <ArrowUpRight className="h-3 w-3" />Guide pour auteurs
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Empty State ── */}
      {!data && !loading && (
        <div className="py-12 text-center">
          <BookOpen className="h-10 w-10 mx-auto text-slate-300 mb-3" />
          <p className="text-sm text-slate-500">Recherchez un domaine pour trouver des journaux en accès ouvert</p>
          <p className="text-xs text-slate-400 mt-1">Ex : machine learning, renewable energy, neuroscience...</p>
        </div>
      )}

      {/* ── No Results ── */}
      {data && data.total === 0 && (
        <div className="py-8 text-center">
          <Search className="h-8 w-8 mx-auto text-slate-300 mb-2" />
          <p className="text-sm text-slate-500">Aucun journal trouvé pour cette recherche</p>
          <p className="text-xs text-slate-400 mt-1">Essayez avec des termes plus généraux ou ajustez les filtres</p>
        </div>
      )}
    </div>
  )
}
