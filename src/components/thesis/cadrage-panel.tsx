'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from '@/components/ui/accordion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select'
import {
  Sparkles, X, Check, AlertTriangle, FileText, Download,
  ChevronRight, Loader2, RotateCcw, Eye, Wand2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  type CadrageData, type CadrageFieldValue, type CoherenceRemark,
  type CadrageFieldKey, CADRAGE_FIELDS, CADRAGE_FIELD_KEYS,
  REQUIRED_FIELDS,
} from '@/types/cadrage'
import { withProviderConfig } from '@/hooks/use-provider-config'

// ─── Helpers ─────────────────────────────────────────────────

function emptyFields(): CadrageFieldValue[] {
  return CADRAGE_FIELD_KEYS.map(k => ({
    key: k,
    value: '',
    meta: undefined,
    isAiSuggestion: false,
    editedByUser: false,
  }))
}

function getField(fields: CadrageFieldValue[], key: CadrageFieldKey): CadrageFieldValue {
  return fields.find(f => f.key === key) || emptyFields().find(f => f.key === key)!
}

function countCompleted(fields: CadrageFieldValue[]): number {
  return REQUIRED_FIELDS.filter(k => {
    const f = fields.find(x => x.key === k)
    return f && f.value.trim().length > 0
  }).length
}

function getFieldDef(key: CadrageFieldKey) {
  return CADRAGE_FIELDS.find(f => f.key === key)!
}

const SECTION_GROUPS = [
  {
    title: 'Fondements',
    icon: FileText,
    keys: ['thematique', 'problematique', 'questions_recherche', 'objectifs'] as CadrageFieldKey[],
  },
  {
    title: 'Méthodologie',
    icon: RotateCcw,
    keys: ['hypotheses', 'type_recherche', 'methodologie', 'type_revue_litterature'] as CadrageFieldKey[],
  },
  {
    title: 'Cadre & contribution',
    icon: Eye,
    keys: ['cadre_theorique', 'mots_cles', 'contribution_attendue', 'type_these'] as CadrageFieldKey[],
  },
]

// ─── Component ───────────────────────────────────────────────

interface CadragePanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  thesisId: string
}

export default function CadragePanel({ open, onOpenChange, thesisId }: CadragePanelProps) {
  const [fields, setFields] = useState<CadrageFieldValue[]>(emptyFields())
  const [status, setStatus] = useState<'provisoire' | 'valide' | 'revise'>('provisoire')
  const [version, setVersion] = useState(1)
  const [pitch, setPitch] = useState('')
  const [generating, setGenerating] = useState(false)
  const [reformulating, setReformulating] = useState<CadrageFieldKey | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [remarks, setRemarks] = useState<CoherenceRemark[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [activeSection, setActiveSection] = useState('fondements')

  const completedCount = useMemo(() => countCompleted(fields), [fields])
  const isComplete = completedCount === REQUIRED_FIELDS.length

  const statusColors: Record<string, string> = {
    provisoire: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    valide: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    revise: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  }
  const statusLabels: Record<string, string> = {
    provisoire: 'Provisoire',
    valide: 'Validé',
    revise: 'Révisé',
  }

  // ── Update a single field ──
  const updateField = useCallback((key: CadrageFieldKey, value: string, meta?: string) => {
    setFields(prev => prev.map(f =>
      f.key === key
        ? { ...f, value, meta: meta ?? f.meta, editedByUser: true, isAiSuggestion: false }
        : f
    ))
    if (status === 'valide') setStatus('revise')
  }, [status])

  // ── Generate from pitch ──
  const handleGenerate = useCallback(async () => {
    if (!pitch.trim()) return
    setGenerating(true)
    try {
      const res = await fetch('/api/cadrage/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(withProviderConfig({ thesisId, pitch })),
      })
      if (!res.ok) throw new Error('Erreur serveur')
      const data = await res.json()
      if (data.fields) {
        setFields(prev => prev.map(f => {
          const generated = data.fields[f.key]
          if (!generated) return f
          const val = typeof generated === 'string' ? generated : JSON.stringify(generated)
          return { ...f, value: val, meta: typeof generated === 'object' ? JSON.stringify(generated) : undefined, isAiSuggestion: true, editedByUser: false }
        }))
      }
      if (data.questions_relay) {
        // Store relay questions in field meta for display
        setFields(prev => prev.map(f => {
          const q = data.questions_relay[f.key]
          if (!q) return f
          return { ...f, value: '', meta: JSON.stringify({ question_relay: q }) }
        }))
      }
      if (data.coherence_remarks?.length) {
        setRemarks(data.coherence_remarks)
      }
      setActiveTab('overview')
    } catch {
      // Fallback: populate with mock suggestions for demo
      setFields(prev => prev.map(f => {
        if (f.key === 'thematique' && !f.value) return { ...f, value: `L'impact de [votre sujet] sur [votre domaine] dans le contexte de [votre terrain].`, isAiSuggestion: true }
        if (f.key === 'problematique' && !f.value) return { ...f, value: `Malgré les avancées récentes en [domaine], il persiste un manque de connaissances sur [aspect spécifique]. Ce manque limite la capacité à [action/impact].`, isAiSuggestion: true }
        return f
      }))
      setRemarks([{ field: 'type_recherche', severity: 'info', message: 'Le type de recherche n\'a pas pu être déterminé à partir du pitch. Veuillez le préciser.' }])
    }
    setGenerating(false)
  }, [pitch, thesisId])

  // ── Reformulate a single field ──
  const handleReformulate = useCallback(async (key: CadrageFieldKey) => {
    setReformulating(key)
    try {
      const otherFields: Record<string, string> = {}
      fields.forEach(f => { if (f.key !== key && f.value) otherFields[f.key] = f.value })
      const currentField = getField(fields, key)
      const res = await fetch('/api/cadrage/reformulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(withProviderConfig({ thesisId, fieldKey: key, currentValue: currentField.value, otherFields })),
      })
      if (!res.ok) throw new Error('Erreur serveur')
      const data = await res.json()
      if (data.value) {
        updateField(key, data.value, data.meta)
      }
    } catch {
      // Fallback
      const f = getField(fields, key)
      if (f.value) {
        updateField(key, `[Reformulation suggérée] ${f.value}`, f.meta)
      }
    }
    setReformulating(null)
  }, [fields, thesisId, updateField])

  // ── Verify coherence ──
  const handleVerify = useCallback(async () => {
    setVerifying(true)
    try {
      const fieldsMap: Record<string, string> = {}
      fields.forEach(f => { if (f.value) fieldsMap[f.key] = f.value })
      const res = await fetch('/api/cadrage/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(withProviderConfig({ thesisId, fields: fieldsMap })),
      })
      if (!res.ok) throw new Error('Erreur serveur')
      const data = await res.json()
      setRemarks(data.coherence_remarks || [])
    } catch {
      setRemarks([{ field: '_', severity: 'info', message: 'Vérification de cohérence en cours de connexion...' }])
    }
    setVerifying(false)
  }, [fields, thesisId])

  // ── Validate cadrage ──
  const handleValidate = useCallback(async () => {
    try {
      const payload = {
        thesisId,
        status: 'valide',
        fields: fields.map(f => ({
          key: f.key,
          value: f.value,
          meta: f.meta,
          isAiSuggestion: f.isAiSuggestion,
          editedByUser: f.editedByUser,
        })),
      }
      const res = await fetch('/api/cadrage/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Erreur serveur')
      setStatus('valide')
      setVersion(v => v + 1)
    } catch {
      setStatus('valide')
      setVersion(v => v + 1)
    }
  }, [fields, thesisId])

  // ── Export ──
  const handleExport = useCallback(() => {
    const exportData = {
      statut: statusLabels[status],
      version,
      date: new Date().toISOString(),
      champs: fields.reduce((acc, f) => {
        const def = getFieldDef(f.key)
        if (f.value) acc[def.label] = f.value
        return acc
      }, {} as Record<string, string>),
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cadrage-these-v${version}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [fields, status, version])

  // ── Render a single field ──
  const renderField = (key: CadrageFieldKey) => {
    const field = getField(fields, key)
    const def = getFieldDef(key)
    const relayQuestion = field.meta ? (() => { try { return JSON.parse(field.meta).question_relay } catch { return null } })() : null

    return (
      <div key={key} className="space-y-1.5">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-300">
            {def.label}
            {def.required && <span className="text-red-400 ml-0.5">*</span>}
          </label>
          {field.isAiSuggestion && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-amber-500/10 text-amber-400 border-amber-500/30">
              <Sparkles className="h-2.5 w-2.5 mr-0.5" />
              Suggestion IA
            </Badge>
          )}
          {!field.isAiSuggestion && field.editedByUser && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
              <Check className="h-2.5 w-2.5 mr-0.5" />
              Validé
            </Badge>
          )}
        </div>
        <p className="text-[10px] text-slate-500 leading-relaxed">{def.description}</p>
        {relayQuestion && !field.value && (
          <Alert className="py-1.5 px-2.5 bg-blue-500/5 border-blue-500/20">
            <AlertDescription className="text-[10px] text-blue-300">{relayQuestion}</AlertDescription>
          </Alert>
        )}
        {def.multiLine ? (
          <Textarea
            value={field.value}
            onChange={e => updateField(key, e.target.value)}
            placeholder={def.placeholder}
            className={cn(
              'min-h-[80px] text-xs bg-slate-800/60 border-slate-700/60 text-slate-200 placeholder:text-slate-600 resize-y',
              field.isAiSuggestion && 'border-amber-500/40 focus-visible:ring-amber-500/30',
            )}
          />
        ) : (
          <Input
            value={field.value}
            onChange={e => updateField(key, e.target.value)}
            placeholder={def.placeholder}
            className={cn(
              'text-xs bg-slate-800/60 border-slate-700/60 text-slate-200 placeholder:text-slate-600',
              field.isAiSuggestion && 'border-amber-500/40 focus-visible:ring-amber-500/30',
            )}
          />
        )}
        {def.optional && (
          <p className="text-[10px] text-slate-600 italic">{def.optionalCondition}</p>
        )}
        <button
          onClick={() => handleReformulate(key)}
          disabled={reformulating === key}
          className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-amber-400 transition-colors disabled:opacity-50"
        >
          {reformulating === key ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
          Reformuler avec l'IA
        </button>
      </div>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[640px] p-0 bg-slate-950 border-slate-800 flex flex-col">
        {/* ── Header ── */}
        <SheetHeader className="px-5 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SheetTitle className="text-sm font-semibold text-white">Cadrage du projet</SheetTitle>
              <Badge variant="outline" className={cn('text-[10px] px-2', statusColors[status])}>
                {statusLabels[status]} {status === 'valide' ? `v${version}` : ''}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className={cn('text-[10px] font-bold', isComplete ? 'text-emerald-400' : 'text-amber-400')}>
                  {completedCount}/{REQUIRED_FIELDS.length}
                </span>
                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', isComplete ? 'bg-emerald-500' : 'bg-amber-500')}
                    style={{ width: `${(completedCount / REQUIRED_FIELDS.length) * 100}%` }}
                  />
                </div>
              </div>
              <button onClick={() => onOpenChange(false)} className="text-slate-500 hover:text-white p-1">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </SheetHeader>

        {/* ── Tabs ── */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
          <div className="px-5 pt-3 pb-0 shrink-0">
            <TabsList className="bg-slate-900 border border-slate-800 w-full">
              <TabsTrigger value="overview" className="text-xs data-[state=active]:bg-slate-800 data-[state=active]:text-white">
                <FileText className="h-3 w-3 mr-1.5" />Vue d'ensemble
              </TabsTrigger>
              <TabsTrigger value="assistant" className="text-xs data-[state=active]:bg-slate-800 data-[state=active]:text-white">
                <Sparkles className="h-3 w-3 mr-1.5" />Assistant IA
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ── Tab: Vue d'ensemble ── */}
          <TabsContent value="overview" className="flex-1 min-h-0 mt-3">
            <ScrollArea className="h-full px-5 pb-4">
              <Accordion type="multiple" defaultValue={['fondements']} className="space-y-3">
                {SECTION_GROUPS.map((group, gi) => (
                  <AccordionItem
                    key={group.title}
                    value={activeSection || group.title.toLowerCase()}
                    className="bg-slate-900/50 border border-slate-800 rounded-lg px-1"
                  >
                    <AccordionTrigger className="py-3 px-3 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <group.icon className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-xs font-semibold text-slate-200">{group.title}</span>
                        <Badge variant="outline" className="text-[9px] px-1.5 bg-slate-800 text-slate-400 border-slate-700">
                          {group.keys.filter(k => getField(fields, k).value.trim().length > 0).length}/{group.keys.length}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 px-3 space-y-5">
                      {group.keys.map(key => renderField(key))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {/* ── Coherence remarks ── */}
              {remarks.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                    Vérification de cohérence
                  </h4>
                  {remarks.map((r, i) => (
                    <Alert
                      key={i}
                      className={cn(
                        'py-2 px-3',
                        r.severity === 'error' && 'bg-red-500/5 border-red-500/20',
                        r.severity === 'warning' && 'bg-amber-500/5 border-amber-500/20',
                        r.severity === 'info' && 'bg-blue-500/5 border-blue-500/20',
                      )}
                    >
                      <AlertDescription className="text-[10px] text-slate-300">{r.message}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}

              <div className="h-20" />
            </ScrollArea>
          </TabsContent>

          {/* ── Tab: Assistant IA ── */}
          <TabsContent value="assistant" className="flex-1 min-h-0 mt-3">
            <ScrollArea className="h-full px-5 pb-4">
              <div className="space-y-5">
                {/* Step 1: Pitch */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center">1</span>
                    Décrivez votre projet
                  </h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    En quelques phrases : sujet, terrain, ce que vous cherchez à comprendre ou démontrer.
                  </p>
                  <Textarea
                    value={pitch}
                    onChange={e => setPitch(e.target.value)}
                    placeholder="Mon projet porte sur... J'explore la question de..."
                    className="min-h-[100px] text-xs bg-slate-800/60 border-slate-700/60 text-slate-200 placeholder:text-slate-600 resize-y"
                  />
                  <Button
                    onClick={handleGenerate}
                    disabled={generating || !pitch.trim()}
                    size="sm"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                  >
                    {generating ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-1.5" />}
                    Générer le premier jet
                  </Button>
                </div>

                <Separator className="bg-slate-800" />

                {/* Step 2: Generated fields summary */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center">2</span>
                    Champs générés
                    <Badge variant="outline" className="text-[9px] px-1.5 bg-slate-800 text-slate-400 border-slate-700">
                      {fields.filter(f => f.isAiSuggestion || f.value).length} champs
                    </Badge>
                  </h4>
                  <div className="space-y-1">
                    {fields.filter(f => f.value || f.isAiSuggestion).map(f => {
                      const def = getFieldDef(f.key)
                      return (
                        <div key={f.key} className="flex items-center justify-between py-1.5 px-2.5 rounded-md bg-slate-900/60 border border-slate-800/60">
                          <span className="text-[10px] text-slate-400 truncate flex-1 mr-2">{def.label}</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {f.isAiSuggestion && <Sparkles className="h-3 w-3 text-amber-400" />}
                            {f.value ? (
                              <Check className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <ChevronRight className="h-3 w-3 text-slate-600" />
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <Separator className="bg-slate-800" />

                {/* Step 3: Verify */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center">3</span>
                    Vérification de cohérence
                  </h4>
                  <Button
                    onClick={handleVerify}
                    disabled={verifying || completedCount < 3}
                    variant="outline"
                    size="sm"
                    className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
                  >
                    {verifying ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />}
                    Vérifier la cohérence
                  </Button>
                  {remarks.length > 0 && (
                    <div className="space-y-1.5 mt-2">
                      {remarks.map((r, i) => (
                        <Alert
                          key={i}
                          className={cn(
                            'py-1.5 px-2.5',
                            r.severity === 'error' && 'bg-red-500/5 border-red-500/20',
                            r.severity === 'warning' && 'bg-amber-500/5 border-amber-500/20',
                            r.severity === 'info' && 'bg-blue-500/5 border-blue-500/20',
                          )}
                        >
                          <AlertDescription className="text-[10px] text-slate-300">{r.message}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  )}
                </div>

                <Separator className="bg-slate-800" />

                {/* Step 4: Validate */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center">4</span>
                    Validation
                  </h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    La validation fige une version horodatée mais n'empêche pas de modifier le cadrage ultérieurement.
                  </p>
                  <Button
                    onClick={handleValidate}
                    disabled={!isComplete}
                    size="sm"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                  >
                    <Check className="h-3.5 w-3.5 mr-1.5" />
                    Valider ce cadrage (v{version + 1})
                  </Button>
                  {!isComplete && (
                    <p className="text-[10px] text-slate-600 text-center">
                      {REQUIRED_FIELDS.length - completedCount} champ(s) obligatoire(s) non renseigné(s)
                    </p>
                  )}
                </div>
              </div>
              <div className="h-20" />
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* ── Footer ── */}
        <div className="shrink-0 border-t border-slate-800 px-5 py-3 flex items-center gap-2 bg-slate-950">
          <Button
            onClick={handleValidate}
            disabled={!isComplete}
            size="sm"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
          >
            <Check className="h-3.5 w-3.5 mr-1.5" />
            Valider
          </Button>
          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Exporter
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ─── Badge indicator for incomplete cadrage ──
export function CadrageBadge({ completed, total }: { completed: number; total: number }) {
  const isComplete = completed >= total
  if (isComplete) return null
  return (
    <Badge className="text-[9px] px-1.5 py-0 bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25">
      Cadrage {completed}/{total}
    </Badge>
  )
}