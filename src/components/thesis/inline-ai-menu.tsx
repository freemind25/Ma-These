'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Loader2, Sparkles, X, Check } from 'lucide-react'

export interface InlineAIAction {
  id: string
  label: string
  icon: string
  description: string
}

export const INLINE_AI_ACTIONS: InlineAIAction[] = [
  { id: 'improve', label: 'Améliorer', icon: '✨', description: 'Améliorer la clarté et le style' },
  { id: 'academic', label: 'Académique', icon: '🎓', description: 'Rendre plus formel et académique' },
  { id: 'simplify', label: 'Simplifier', icon: '📝', description: 'Simplifier le langage' },
  { id: 'expand', label: 'Développer', icon: '📖', description: 'Développer et enrichir' },
  { id: 'summarize', label: 'Résumer', icon: '📌', description: 'Condenser en un résumé' },
  { id: 'translate-en', label: '→ Anglais', icon: '🇬🇧', description: 'Traduire en anglais académique' },
  { id: 'humanize', label: 'Humaniser', icon: '🤖', description: 'Rendre plus naturel' },
  { id: 'fix-grammar', label: 'Corriger', icon: '✅', description: 'Corriger la grammaire et orthographe' },
]

interface InlineAIMenuProps {
  position: { top: number; left: number }
  selectedText: string
  onApply: (actionId: string, result: string) => void
  onClose: () => void
  aiProvider: string
}

export default function InlineAIMenu({ position, selectedText, onApply, onClose, aiProvider }: InlineAIMenuProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [result, setResult] = useState<{ actionId: string; text: string } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [menuPos, setMenuPos] = useState(position)

  // Reposition menu if it goes off-screen
  useEffect(() => {
    if (!menuRef.current) return
    const rect = menuRef.current.getBoundingClientRect()
    const vpW = window.innerWidth
    const vpH = window.innerHeight
    const newPos = { ...position }
    if (rect.right > vpW - 16) newPos.left = Math.max(8, position.left - rect.width)
    if (rect.bottom > vpH - 16) newPos.top = Math.max(8, position.top - rect.height)
    setMenuPos(newPos)
  }, [position])

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const handleAction = useCallback(async (action: InlineAIAction) => {
    setLoading(action.id)
    try {
      const prompts: Record<string, string> = {
        'improve': `Améliore le texte académique suivant. Garde le sens intact mais améliore la clarté, la précision et le style. Réponds UNIQUEMENT avec le texte amélioré, sans commentaire:\n\n${selectedText}`,
        'academic': `Transforme le texte suivant en style académique formel. Utilise un registre soutenu et un vocabulaire scientifique approprié. Réponds UNIQUEMENT avec le texte transformé:\n\n${selectedText}`,
        'simplify': `Simplifie le texte académique suivant en gardant le sens essentiel. Réponds UNIQUEMENT avec le texte simplifié:\n\n${selectedText}`,
        'expand': `Développe et enrichis le paragraphe académique suivant en ajoutant des détails, nuances et transitions. Garde le même ton académique. Réponds UNIQUEMENT avec le texte développé:\n\n${selectedText}`,
        'summarize': `Résume le texte académique suivant en un paragraphe concis qui conserve les points clés. Réponds UNIQUEMENT avec le résumé:\n\n${selectedText}`,
        'translate-en': `Traduis le texte académique français suivant en anglais académique de haute qualité. Réponds UNIQUEMENT avec la traduction:\n\n${selectedText}`,
        'humanize': `Réécris le texte suivant pour qu'il paraisse plus naturel et humain, tout en gardant un ton académique. Évite les tournures robotiques. Réponds UNIQUEMENT avec le texte réécrit:\n\n${selectedText}`,
        'fix-grammar': `Corrige toutes les erreurs de grammaire, d'orthographe et de syntaxe dans le texte suivant. Réponds UNIQUEMENT avec le texte corrigé:\n\n${selectedText}`,
      }

      const res = await fetch('/api/ai-writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'inline-transform',
          text: selectedText,
          prompt: prompts[action.id],
          provider: aiProvider,
        }),
      })
      const data = await res.json()
      const transformed = data.result || data.text || data.content || data
      setResult({ actionId: action.id, text: typeof transformed === 'string' ? transformed : selectedText })
    } catch {
      // Fallback: just keep original text
      setResult({ actionId: action.id, text: selectedText })
    } finally {
      setLoading(null)
    }
  }, [selectedText, aiProvider])

  const handleApply = () => {
    if (result) {
      onApply(result.actionId, result.text)
      onClose()
    }
  }

  const handleRetry = () => {
    const action = INLINE_AI_ACTIONS.find(a => a.id === result?.actionId)
    if (action) {
      setResult(null)
      handleAction(action)
    }
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-64 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden"
      style={{ top: menuPos.top, left: menuPos.left }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-emerald-50 to-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
          <span className="text-xs font-semibold text-slate-700">IA contextuelle</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-0.5"><X className="h-3 w-3" /></button>
      </div>

      {/* Preview of selected text */}
      <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100">
        <p className="text-[10px] text-slate-400 truncate italic">« {selectedText.slice(0, 80)}{selectedText.length > 80 ? '...' : ''} »</p>
      </div>

      {/* Actions or Result */}
      {!result ? (
        <div className="p-1.5 space-y-0.5 max-h-64 overflow-y-auto">
          {INLINE_AI_ACTIONS.map((action) => (
            <button
              key={action.id}
              onClick={() => handleAction(action)}
              disabled={loading !== null}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              <span className="text-base shrink-0">{action.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-slate-700">{action.label}</div>
                <div className="text-[10px] text-slate-400">{action.description}</div>
              </div>
              {loading === action.id && <Loader2 className="h-3 w-3 text-emerald-500 animate-spin shrink-0" />}
            </button>
          ))}
        </div>
      ) : (
        <div className="p-3 space-y-3">
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 max-h-40 overflow-y-auto">
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{result.text}</p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 h-8 text-xs bg-emerald-600 hover:bg-emerald-700"
              onClick={handleApply}
            >
              <Check className="h-3 w-3 mr-1" /> Appliquer
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={handleRetry}
            >
              <Sparkles className="h-3 w-3 mr-1" /> Relancer
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs"
              onClick={onClose}
            >
              Annuler
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
