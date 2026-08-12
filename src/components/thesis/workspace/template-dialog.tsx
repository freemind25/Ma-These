'use client'

import { useState } from 'react'
import { FlaskConical, BookOpen, FileText, LayoutTemplate, AlertTriangle, Check } from 'lucide-react'
import { THESIS_TEMPLATES, type ThesisTemplate } from '@/data/thesis-templates'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const TEMPLATE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  FlaskConical, BookOpen, FileText,
}

interface TemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply: (templateId: string) => void
}

export default function TemplateDialog({ open, onOpenChange, onApply }: TemplateDialogProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [applying, setApplying] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const selected = THESIS_TEMPLATES.find(t => t.id === selectedId)

  const handleApply = async () => {
    if (!selectedId || applying) return
    setApplying(true)
    try {
      await onApply(selectedId)
      onOpenChange(false)
      setSelectedId(null)
      setConfirming(false)
    } finally {
      setApplying(false)
    }
  }

  const handleClose = (open: boolean) => {
    if (applying) return
    onOpenChange(open)
    if (!open) { setSelectedId(null); setConfirming(false) }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-3">
          <DialogTitle className="flex items-center gap-2 text-base">
            <LayoutTemplate className="h-4 w-4 text-emerald-500" />
            Modèles de structure
          </DialogTitle>
          <DialogDescription className="text-xs">
            Choisissez un modèle de structure pour votre thèse. Cela remplacera tous les chapitres actuels.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-2 space-y-2 max-h-80 overflow-y-auto">
          {THESIS_TEMPLATES.map(template => {
            const Icon = TEMPLATE_ICONS[template.icon] || FileText
            const isSelected = selectedId === template.id
            const chaptersList = template.parts
              ? template.parts.flatMap(p => p.chapters)
              : template.chapters

            return (
              <button
                key={template.id}
                onClick={() => { setSelectedId(template.id); setConfirming(false) }}
                className={cn(
                  'w-full text-left p-3 rounded-xl border-2 transition-all duration-200',
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50',
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                    isSelected ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500',
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn('text-sm font-semibold', isSelected ? 'text-emerald-800' : 'text-slate-800')}>
                        {template.name}
                      </span>
                      <span className={cn(
                        'text-[9px] px-1.5 py-0.5 rounded-full font-medium',
                        template.structureMode === 'parts' ? 'bg-violet-100 text-violet-600' : 'bg-sky-100 text-sky-600',
                      )}>
                        {template.structureMode === 'parts' ? 'en parties' : 'en chapitres'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{template.description}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {chaptersList?.slice(0, 4).map((ch, i) => (
                        <span key={i} className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                          {ch.title.length > 25 ? ch.title.slice(0, 25) + '…' : ch.title}
                        </span>
                      ))}
                      {chaptersList && chaptersList.length > 4 && (
                        <span className="text-[9px] text-slate-400 px-1">+{chaptersList.length - 4}</span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Preview & actions */}
        <div className="border-t bg-slate-50 px-6 py-3">
          {selected && !confirming && (
            <div className="mb-2">
              <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1">Aperçu de la structure</p>
              {selected.structureMode === 'parts' && selected.parts ? (
                <div className="space-y-1.5">
                  {selected.parts.map((part, pi) => (
                    <div key={pi}>
                      <span className="text-[10px] font-bold text-emerald-700">{part.title}</span>
                      <div className="ml-3 space-y-0.5">
                        {part.chapters.map((ch, ci) => (
                          <p key={ci} className="text-[10px] text-slate-500">{ch.title}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-0.5">
                  {selected.chapters?.map((ch, i) => (
                    <p key={i} className="text-[10px] text-slate-500">{ch.title}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {confirming && (
            <div className="flex items-start gap-2 mb-3 p-2 rounded-lg bg-amber-50 border border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-800">
                Cette action remplacera tous les chapitres existants et leur contenu. Cette opération est irréversible.
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => { setConfirming(false); handleClose(false) }}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={() => {
                if (!confirming) { setConfirming(true); return }
                handleApply()
              }}
              disabled={!selected || applying}
              className={cn(
                'px-4 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5',
                confirming
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50',
              )}
            >
              {applying ? (
                <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : confirming ? (
                <><AlertTriangle className="h-3 w-3" />Confirmer et appliquer</>
              ) : (
                <><Check className="h-3 w-3" />Appliquer</>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
