'use client'

import { useState, useCallback, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Search, Loader2, FileText, ArrowRight, RotateCcw, X } from 'lucide-react'
import type { ThesisData, ChapterData } from '@/types/thesis'

interface SearchResult {
  doc: {
    id: string
    chapterId: string
    chapterTitle: string
    chapterNumber: string
    content: string
    wordCount: number
  }
  score: number
  snippet: string
}

interface ThesisSearchProps {
  thesis: ThesisData | null
  onSelectChapter: (chapterId: string) => void
}

export default function ThesisSearch({ thesis, onSelectChapter }: ThesisSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  // Index thesis content
  const indexContent = useCallback(async () => {
    const chapters = thesis?.chapters
    if (!chapters?.length) return
    try {
      const docs = chapters.map(ch => ({
        id: `ch-${ch.id}`,
        chapterId: ch.id,
        chapterTitle: ch.title,
        chapterNumber: ch.number,
        content: ch.content || '',
        wordCount: ch.wordCount,
      }))
      await fetch('/api/thesis-search/index', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docs }),
      })
    } catch (err) {
      console.error('Index error:', err)
    }
  }, [thesis])

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      setSearched(false)
      return
    }
    setLoading(true)
    setSearched(true)
    try {
      // Auto-index before search
      await indexContent()
      const res = await fetch(`/api/thesis-search/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data.results || [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [indexContent])

  const handleInputChange = (val: string) => {
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => handleSearch(val), 300)
  }

  const highlightText = (text: string, searchQuery: string) => {
    if (!searchQuery.trim()) return text
    const words = searchQuery.split(/\s+/).filter(w => w.length > 1)
    if (words.length === 0) return text
    const pattern = new RegExp(`(${words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
    const parts = text.split(pattern)
    return parts.map((part, i) =>
      pattern.test(part) ? (
        <mark key={i} className="bg-emerald-200/70 text-emerald-900 rounded px-0.5 font-medium">{part}</mark>
      ) : (
        <span key={i}>{part}</span>
      )
    )
  }

  const totalWords = thesis?.chapters.reduce((s, c) => s + c.wordCount, 0) || 0
  const totalChapters = thesis?.chapters.length || 0

  return (
    <div className="flex flex-col gap-4">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Rechercher dans tous les chapitres..."
          className="pl-9 pr-9"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); setSearched(false) }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-3 text-[11px] text-slate-500">
        <Badge variant="secondary" className="text-[10px] font-normal">{totalChapters} chapitres</Badge>
        <Badge variant="secondary" className="text-[10px] font-normal">{totalWords.toLocaleString()} mots</Badge>
        <div className="flex-1" />
        <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1" onClick={indexContent}>
          <RotateCcw className="h-3 w-3" /> Reindexer
        </Button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
          <span className="ml-2 text-sm text-slate-500">Recherche en cours...</span>
        </div>
      )}

      {/* Results */}
      {!loading && searched && results.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Aucun resultat pour &quot;{query}&quot;</p>
          <p className="text-xs mt-1">Essayez des termes differents ou reindexez le contenu</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <ScrollArea className="h-72">
          <div className="space-y-2 pr-3">
            {results.map((r) => (
              <button
                key={r.doc.id}
                onClick={() => onSelectChapter(r.doc.chapterId)}
                className="w-full text-left p-3 rounded-lg border hover:border-emerald-300 hover:bg-emerald-50/50 transition-all group"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <FileText className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-xs font-semibold text-slate-700">{r.doc.chapterNumber}. {r.doc.chapterTitle}</span>
                  <Badge variant="secondary" className="text-[9px] ml-auto">score: {r.score.toFixed(2)}</Badge>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3">
                  {highlightText(r.snippet, query)}
                </p>
                <div className="flex items-center gap-1 mt-2 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px]">Aller au chapitre</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Empty initial state */}
      {!searched && !loading && (
        <div className="text-center py-8 text-slate-400">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Recherche plein texte dans votre these</p>
          <p className="text-xs mt-1">Indexation TF-IDF avec stemmer francais — puissance par MeiliSearch-style</p>
        </div>
      )}
    </div>
  )
}
