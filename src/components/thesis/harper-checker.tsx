'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, CheckCircle2, AlertTriangle, Info, AlertCircle, ShieldCheck, Replace, ChevronDown, ChevronRight, X } from 'lucide-react'

interface HarperMatch {
  message: string
  offset: number
  length: number
  severity: 'error' | 'warning' | 'info'
  ruleId: string
  ruleName: string
  replacements?: string[]
}

interface HarperStats {
  total: number
  errors: number
  warnings: number
  info: number
}

interface HarperCheckerProps {
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

function getSurroundingText(content: string, offset: number, length: number): string {
  const start = Math.max(0, offset - 50)
  const end = Math.min(content.length, offset + length + 50)
  return (start > 0 ? '...' : '') + content.slice(start, end) + (end < content.length ? '...' : '')
}

function MatchCard({ match, content, onApply }: { match: HarperMatch; content: string; onApply: (replacement: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const surrounding = getSurroundingText(content, match.offset, match.length)
  const matchedText = content.slice(match.offset, match.offset + match.length)

  const highlighted = surrounding
    .replace(matchedText, `__HIGHLIGHT__${matchedText}__END__`)
    .split(/(__HIGHLIGHT__|__END__)/)
    .map((part, i) => {
      if (part === '__HIGHLIGHT__') return null
      if (part === '__END__') return null
      // Check if this is the highlighted part (it follows a HIGHLIGHT marker)
      const idx = surrounding.indexOf(`__HIGHLIGHT__${part}__END__`)
      if (idx >= 0) {
        return <span key={i} className="bg-amber-200/70 text-amber-900 rounded px-0.5 font-semibold">{part}</span>
      }
      return <span key={i}>{part}</span>
    })

  return (
    <div className={`border-l-2 ${severityColor(match.severity)} rounded-r-lg p-3 transition-all cursor-pointer`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-2">
        <div className="mt-0.5 shrink-0">{severityIcon(match.severity)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-700">{match.ruleName}</span>
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0">{match.ruleId}</Badge>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{match.message}</p>
          {expanded && (
            <p className="text-[11px] text-slate-500 mt-1.5 font-mono leading-relaxed">
              {surrounding.replace(matchedText, `«${matchedText}»`)}
            </p>
          )}
          {match.replacements && match.replacements.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {match.replacements.map((rep, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); onApply(rep) }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] bg-white border border-slate-200 rounded-md hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-colors"
                >
                  <Replace className="h-2.5 w-2.5" />{rep}
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

export default function HarperChecker({ content, onApplySuggestion }: HarperCheckerProps) {
  const [loading, setLoading] = useState(false)
  const [matches, setMatches] = useState<HarperMatch[]>([])
  const [stats, setStats] = useState<HarperStats | null>(null)
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)

  const checkStyle = useCallback(async () => {
    if (!content.trim()) return
    setLoading(true)
    setError('')
    setChecking(true)
    try {
      const textToCheck = content.slice(0, 10000)
      const res = await fetch('/api/harper-lint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToCheck }),
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
  }, [content])

  const handleApply = useCallback((replacement: string) => {
    if (onApplySuggestion) {
      const match = matches.find(m => m.replacements?.some(r => r === replacement))
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
        <Button
          size="sm"
          onClick={checkStyle}
          disabled={loading || !content.trim()}
          className="gap-1.5"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldCheck className="h-3 w-3" />}
          {loading ? 'Analyse...' : 'Analyser le style'}
        </Button>
        <span className="text-[10px] text-slate-500">Regles academiques francaises : expressions familiers, voix passive, repetition, typographie</span>
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
              <span className="text-sm font-medium">Style academique impeccable !</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1 text-xs text-red-600"><AlertCircle className="h-3 w-3" />{stats.errors} erreurs</div>
              <div className="flex items-center gap-1 text-xs text-amber-600"><AlertTriangle className="h-3 w-3" />{stats.warnings} style</div>
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
              <MatchCard key={`${match.ruleId}-${i}`} match={match} content={content} onApply={handleApply} />
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Empty state */}
      {!checking && matches.length === 0 && !stats && !error && content.trim() && (
        <div className="text-center py-8 text-slate-400">
          <ShieldCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Cliquez sur "Analyser le style" pour verifier votre redaction</p>
          <p className="text-xs mt-1">Inspire de Harper — linting pour redaction academique francaise</p>
        </div>
      )}
    </div>
  )
}
