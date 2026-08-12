'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, CheckCircle2, AlertTriangle, Info, AlertCircle, SpellCheck, Replace, ChevronDown, ChevronRight, X } from 'lucide-react'

interface GrammarMatch {
  message: string
  shortMessage: string
  offset: number
  length: number
  rule: { id: string; description: string; category: { id: string; name: string } }
  replacements: { value: string }[]
  context: { text: string; offset: number; length: number }
  type: { typeName: string }
}

interface GrammarStats {
  total: number
  errors: number
  warnings: number
  info: number
}

interface GrammarCheckerProps {
  content: string
  onApplySuggestion?: (offset: number, length: number, replacement: string) => void
}

function severityIcon(severity: 'error' | 'warning' | 'info') {
  switch (severity) {
    case 'error': return <AlertCircle className="h-3.5 w-3.5 text-red-500" />
    case 'warning': return <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
    case 'info': return <Info className="h-3.5 w-3.5 text-sky-500" />
  }
}

function severityColor(severity: 'error' | 'warning' | 'info') {
  switch (severity) {
    case 'error': return 'border-l-red-400 bg-red-50/50'
    case 'warning': return 'border-l-amber-400 bg-amber-50/50'
    case 'info': return 'border-l-sky-400 bg-sky-50/50'
  }
}

function getSeverity(match: GrammarMatch): 'error' | 'warning' | 'info' {
  const cat = match.rule?.category?.id
  if (cat === 'TYPOS' || cat === 'GRAMMAR' || match.type?.typeName === 'Misspelling') return 'error'
  if (cat === 'STYLE' || cat === 'REDUNDANCY' || cat === 'COLLOQUIALISMS') return 'warning'
  return 'info'
}

function MatchCard({ match, onApply }: { match: GrammarMatch; onApply: (replacement: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const severity = getSeverity(match)
  const highlighted = match.context?.text
    ? match.context.text.slice(0, match.context.offset) +
      '~~' + match.context.text.slice(match.context.offset, match.context.offset + match.context.length) + '~~' +
      match.context.text.slice(match.context.offset + match.context.length)
    : ''

  return (
    <div className={`border-l-2 ${severityColor(severity)} rounded-r-lg p-3 transition-all`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-2">
        <div className="mt-0.5 shrink-0">{severityIcon(severity)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-700">{match.shortMessage || match.message}</span>
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0">{match.rule?.category?.name || 'Autre'}</Badge>
          </div>
          {highlighted && (
            <p className="text-[11px] text-slate-500 mt-1 font-mono leading-relaxed">
              {highlighted.split('~~').map((part, i) =>
                i % 2 === 1 ? (
                  <span key={i} className="bg-red-200/70 text-red-800 rounded px-0.5 font-semibold">{part}</span>
                ) : (
                  <span key={i}>{part}</span>
                )
              )}
            </p>
          )}
          {expanded && match.message && match.message !== match.shortMessage && (
            <p className="text-[11px] text-slate-600 mt-1.5 italic">{match.message}</p>
          )}
          {match.replacements && match.replacements.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {match.replacements.slice(0, 5).map((rep, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); onApply(rep.value) }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] bg-white border border-slate-200 rounded-md hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-colors"
                >
                  <Replace className="h-2.5 w-2.5" />{rep.value}
                </button>
              ))}
            </div>
          )}
        </div>
        <button className="text-slate-400 hover:text-slate-600 shrink-0">
          {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  )
}

export default function GrammarChecker({ content, onApplySuggestion }: GrammarCheckerProps) {
  const [loading, setLoading] = useState(false)
  const [matches, setMatches] = useState<GrammarMatch[]>([])
  const [stats, setStats] = useState<GrammarStats | null>(null)
  const [error, setError] = useState('')
  const [language, setLanguage] = useState('fr')
  const [checking, setChecking] = useState(false)

  const checkGrammar = useCallback(async () => {
    if (!content.trim()) return
    setLoading(true)
    setError('')
    setChecking(true)
    try {
      // Send up to 5000 chars for performance
      const textToCheck = content.slice(0, 5000)
      const res = await fetch('/api/grammar-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToCheck, language }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMatches(data.matches || [])
      setStats(data.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setLoading(false)
      setChecking(false)
    }
  }, [content, language])

  const handleApply = useCallback((replacement: string) => {
    if (onApplySuggestion) {
      // Find the match by replacement text
      const match = matches.find(m => m.replacements.some(r => r.value === replacement))
      if (match) {
        onApplySuggestion(match.offset, match.length, replacement)
        setMatches(prev => prev.filter(m => m !== match))
      }
    }
  }, [matches, onApplySuggestion])

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="text-xs border rounded-md px-2 py-1.5 bg-white"
        >
          <option value="fr">Francais</option>
          <option value="en">English</option>
          <option value="de">Deutsch</option>
          <option value="es">Espanol</option>
        </select>
        <Button
          size="sm"
          onClick={checkGrammar}
          disabled={loading || !content.trim()}
          className="gap-1.5"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <SpellCheck className="h-3 w-3" />}
          {loading ? 'Analyse...' : 'Verifier la grammaire'}
        </Button>
        {content.length > 5000 && (
          <span className="text-[10px] text-amber-600">Seuls les 5000 premiers caracteres sont analyses</span>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          <X className="h-3.5 w-3.5 shrink-0" />{error}
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border">
          {stats.total === 0 ? (
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">Aucune erreur detectee !</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1 text-xs text-red-600"><AlertCircle className="h-3 w-3" />{stats.errors} erreurs</div>
              <div className="flex items-center gap-1 text-xs text-amber-600"><AlertTriangle className="h-3 w-3" />{stats.warnings} avertissements</div>
              <div className="flex items-center gap-1 text-xs text-sky-600"><Info className="h-3 w-3" />{stats.info} infos</div>
            </>
          )}
        </div>
      )}

      {/* Results */}
      {matches.length > 0 && (
        <ScrollArea className="h-64">
          <div className="space-y-2 pr-3">
            {matches.map((match, i) => (
              <MatchCard key={`${match.rule?.id}-${i}`} match={match} onApply={handleApply} />
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Empty state */}
      {!checking && matches.length === 0 && !stats && !error && content.trim() && (
        <div className="text-center py-8 text-slate-400">
          <SpellCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Cliquez sur "Verifier la grammaire" pour analyser votre texte</p>
          <p className="text-xs mt-1">Propulse par LanguageTool — correction orthographique et grammaticale</p>
        </div>
      )}
    </div>
  )
}
