'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel,
} from '@/components/ui/select'
import {
  Plus, Trash2, CheckCircle2, XCircle, AlertTriangle,
  Loader2, ListChecks, HelpCircle, MessageSquare,
  ChevronRight, ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { withProviderConfig } from '@/hooks/use-provider-config'
import {
  REFERENTIAL_ANALYSE_URBAINE,
  TYPE_ELEMENT_LABELS,
  NATURE_ELEMENT_LABELS,
  SOUS_ANALYSE_LABELS,
  type ReferentialElement,
} from '@/data/verification-referentials'

/* ─── Props ─────────────────────────────────────────────────────── */

interface VerificationPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/* ─── Types ─────────────────────────────────────────────────────── */

interface ElementAnalyse {
  id: string
  nom: string
  typeElement: string
  natureElement: string
  sousAnalyse: string | null
  source: string
  createdAt: string
}

interface PhaseResult {
  phase: string
  label: string
  total: number
  presents: number
  manquants: string[]
  complet: boolean
  pourcentage: number
}

interface CompletionResult {
  complet: boolean
  bloqueParPrealable: boolean
  prealablesManquants: string[]
  phases: PhaseResult[]
  globalPourcentage: number
  nbTotalAttendus: number
  nbTotalPresents: number
}

interface QAResponse {
  question: string
  reponse: string
}

/* ─── Helpers ─────────────────────────────────────────────────────── */

function natureColor(nature: string): string {
  switch (nature) {
    case 'spatial': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
    case 'donnee_enquete': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
    case 'document': return 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300'
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  }
}

/* ─── Component ──────────────────────────────────────────────────── */

/* eslint-disable react-hooks/set-state-in-effect */

export default function VerificationPanel({ open, onOpenChange }: VerificationPanelProps) {
  // ─── Tab Éléments state ────────────────────────────────────────
  const [elements, setElements] = useState<ElementAnalyse[]>([])
  const [loadingElements, setLoadingElements] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('')
  const [addingElement, setAddingElement] = useState(false)

  // ─── Tab Vérification state ───────────────────────────────────
  const [completionResult, setCompletionResult] = useState<CompletionResult | null>(null)
  const [checking, setChecking] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)

  // ─── Tab Questions state ──────────────────────────────────────
  const [question, setQuestion] = useState('')
  const [qaHistory, setQaHistory] = useState<QAResponse[]>([])
  const [asking, setAsking] = useState(false)
  const [questionError, setQuestionError] = useState<string | null>(null)
  const [notes, setNotes] = useState(() => {
    if (typeof window === 'undefined') return ''
    return localStorage.getItem('tf_verification_notes') || ''
  })
  const notesRef = useRef<HTMLTextAreaElement>(null)
  const initSessionRef = useRef(false)

  /* ─── Fetch elements ─────────────────────────────────────── */

  const fetchElements = useCallback(async () => {
    setLoadingElements(true)
    try {
      const res = await fetch('/api/verification/elements')
      if (res.ok) {
        const data = await res.json()
        setElements(data)
      }
    } catch {
      // silent
    } finally {
      setLoadingElements(false)
    }
  }, [])

  /* ─── Add element from referential ─────────────────────── */

  const addElement = useCallback(async () => {
    if (!selectedType) return
    setAddingElement(true)
    try {
      // Trouver l'élément correspondant dans le référentiel
      const allRefs = [
        ...REFERENTIAL_ANALYSE_URBAINE.prealable.map(t => ({
          typeElement: t,
          natureElement: 'document' as const,
          sousAnalyse: 'prealable',
          label: TYPE_ELEMENT_LABELS[t] || t,
        })),
        ...REFERENTIAL_ANALYSE_URBAINE.phases.flatMap(p =>
          p.elements.map(e => ({
            typeElement: e.typeElement,
            natureElement: e.natureElement,
            sousAnalyse: e.sousAnalyse,
            label: e.label,
          }))
        ),
      ]
      const ref = allRefs.find(r => r.typeElement === selectedType)
      if (!ref) return

      const body = withProviderConfig({
        nom: ref.label,
        typeElement: ref.typeElement,
        natureElement: ref.natureElement,
        sousAnalyse: ref.sousAnalyse,
        source: 'verification-panel',
      }) as Record<string, string>

      const res = await fetch('/api/verification/elements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setSelectedType('')
        await fetchElements()
      }
    } catch {
      // silent
    } finally {
      setAddingElement(false)
    }
  }, [selectedType, fetchElements])

  /* ─── Delete element ────────────────────────────────────── */

  const deleteElement = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/verification/elements?id=${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setElements(prev => prev.filter(e => e.id !== id))
      }
    } catch {
      // silent
    }
  }, [])

  /* ─── Ensure session exists ────────────────────────────── */

  const ensureSession = useCallback(async (): Promise<string> => {
    if (sessionId) return sessionId

    const body = withProviderConfig({
      siteEtudeId: 'verification-panel',
      typeAnalyseId: 'analyse_urbaine',
      elementsManquants: '[]',
      questionsPosees: '[]',
    }) as Record<string, string>

    const res = await fetch('/api/verification/elements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...body,
        nom: '__session_init__',
        typeElement: 'situation_generale',
        natureElement: 'document',
        source: 'verification-panel',
      }),
    })
    // Pas besoin du résultat — juste s'assurer que la session existe
    // On utilise un sessionId stocké en localStorage
    const newId = 'session-' + Date.now()
    setSessionId(newId)
    localStorage.setItem('tf_verification_session', newId)
    return newId
  }, [sessionId])

  /* ─── Check completeness (Module A) ──────────────────────── */

  const checkCompleteness = useCallback(async () => {
    setChecking(true)
    try {
      const sid = await ensureSession()
      const body = withProviderConfig({
        siteEtudeId: 'verification-panel',
        sessionId: sid,
      }) as Record<string, string>

      const res = await fetch('/api/verification/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const data: CompletionResult = await res.json()
        setCompletionResult(data)
      }
    } catch {
      // silent
    } finally {
      setChecking(false)
    }
  }, [ensureSession])

  /* ─── Ask question (Module B) ───────────────────────────── */

  const askQuestion = useCallback(async () => {
    if (!question.trim()) return
    setAsking(true)
    setQuestionError(null)

    try {
      const sid = await ensureSession()
      const body = withProviderConfig({
        question: question.trim(),
        sessionId: sid,
        contexte: `Éléments collectés : ${elements.length}. Types : ${elements.map(e => e.typeElement).join(', ')}`,
      }) as Record<string, string>

      const res = await fetch('/api/verification/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json()
        setQuestionError(err.error || 'Erreur lors du questionnement')
        return
      }

      const data = await res.json()
      setQaHistory(prev => [...prev, { question: data.question, reponse: data.reponse }])
      setQuestion('')
    } catch {
      setQuestionError('Erreur de connexion au serveur')
    } finally {
      setAsking(false)
    }
  }, [question, elements, ensureSession])

  /* ─── Fetch session history ───────────────────────────── */

  const fetchSessionHistory = useCallback(async (sid: string) => {
    try {
      const res = await fetch(`/api/verification/sessions?id=${sid}`)
      if (res.ok) {
        const session = await res.json()
        try {
          const reps: QAResponse[] = JSON.parse(session.reponses || '[]')
          setQaHistory(reps)
        } catch {
          // parse error
        }
      }
    } catch {
      // silent
    }
    return Promise.resolve()
  }, [])

  /* ─── Save notes ──────────────────────────────────────── */

  const saveNotes = useCallback(() => {
    localStorage.setItem('tf_verification_notes', notes)
  }, [notes])

  // ─── Load elements & session when panel opens ──────────────────
  useEffect(() => {
    if (open) {
      fetchElements()
      if (!initSessionRef.current) {
        initSessionRef.current = true
        const savedSessionId = localStorage.getItem('tf_verification_session')
        if (savedSessionId) {
          setSessionId(savedSessionId)
          fetchSessionHistory(savedSessionId)
        }
      }
    }
  }, [open, fetchElements, fetchSessionHistory])

  /* ─── Render ──────────────────────────────────────────── */

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="px-4 pt-4 pb-0">
          <SheetTitle className="text-sm font-semibold flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-600" />
            Vérification méthodologique
          </SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="elements" className="flex-1 flex flex-col px-4">
          <TabsList className="mt-2 w-full h-8">
            <TabsTrigger value="elements" className="text-xs flex-1 gap-1">
              <ListChecks className="size-3" />
              Éléments
            </TabsTrigger>
            <TabsTrigger value="verification" className="text-xs flex-1 gap-1">
              <CheckCircle2 className="size-3" />
              Vérification
            </TabsTrigger>
            <TabsTrigger value="questions" className="text-xs flex-1 gap-1">
              <HelpCircle className="size-3" />
              Questions
            </TabsTrigger>
          </TabsList>

          {/* ═══════════ TAB ÉLÉMENTS ═════════════════════════════ */}
          <TabsContent value="elements" className="flex-1 mt-2 flex flex-col gap-3 min-h-0">
            {/* ─── Sélecteur d'ajout ─────────────────────── */}
            <div className="flex gap-2 items-center">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="flex-1 h-8 text-xs">
                  <SelectValue placeholder="Ajouter un élément…" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {/* Préalables */}
                  <SelectGroup>
                    <SelectLabel className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      Préalables
                    </SelectLabel>
                    {REFERENTIAL_ANALYSE_URBAINE.prealable.map(t => (
                      <SelectItem key={t} value={t} className="text-xs">
                        {TYPE_ELEMENT_LABELS[t] || t}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  {/* Phases */}
                  {REFERENTIAL_ANALYSE_URBAINE.phases.map(ph => (
                    <SelectGroup key={ph.phase}>
                      <SelectLabel className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        {ph.label}
                      </SelectLabel>
                      {ph.elements.map(e => (
                        <SelectItem key={e.typeElement} value={e.typeElement} className="text-xs">
                          {e.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={addElement}
                disabled={!selectedType || addingElement}
              >
                {addingElement ? <Loader2 className="size-3 animate-spin" /> : <Plus className="size-3" />}
              </Button>
            </div>

            {/* ─── Liste des éléments ────────────────────── */}
            <ScrollArea className="flex-1 max-h-[60vh]">
              {loadingElements ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="size-4 animate-spin text-emerald-600" />
                </div>
              ) : elements.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">
                  Aucun élément ajouté. Utilisez le sélecteur ci-dessus.
                </p>
              ) : (
                <div className="flex flex-col gap-1.5 pr-2">
                  {elements.map(el => (
                    <div
                      key={el.id}
                      className="flex items-center gap-2 rounded-md border px-3 py-2 text-xs group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{el.nom}</p>
                        <div className="flex gap-1 mt-0.5">
                          <Badge
                            variant="secondary"
                            className={cn('text-[10px] px-1.5 py-0 h-4', natureColor(el.natureElement))}
                          >
                            {NATURE_ELEMENT_LABELS[el.natureElement] || el.natureElement}
                          </Badge>
                          {el.sousAnalyse && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                              {SOUS_ANALYSE_LABELS[el.sousAnalyse] || el.sousAnalyse}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => deleteElement(el.id)}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* ─── Compteur ───────────────────────────────── */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
              <span>{elements.length} élément{elements.length > 1 ? 's' : ''} ajouté{elements.length > 1 ? 's' : ''}</span>
              <span>
                {elements.length}/{REFERENTIAL_ANALYSE_URBAINE.prealable.length + REFERENTIAL_ANALYSE_URBAINE.phases.reduce((s, p) => s + p.elements.length, 0)} attendus
              </span>
            </div>
          </TabsContent>

          {/* ═══════════ TAB VÉRIFICATION ═══════════════════════════════ */}
          <TabsContent value="verification" className="flex-1 mt-2 flex flex-col gap-3 min-h-0">
            <Button
              className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white w-full"
              onClick={checkCompleteness}
              disabled={checking}
            >
              {checking ? (
                <>
                  <Loader2 className="size-3 animate-spin mr-1" />
                  Vérification en cours…
                </>
              ) : (
                <>
                  <ShieldCheck className="size-3 mr-1" />
                  Vérifier la complétude
                </>
              )}
            </Button>

            {!completionResult ? (
              <div className="flex-1 flex items-center justify-center py-8">
                <div className="text-center text-xs text-muted-foreground">
                  <ShieldCheck className="size-8 mx-auto mb-2 opacity-30" />
                  <p>Cliquez sur le bouton ci-dessus pour lancer la vérification.</p>
                </div>
              </div>
            ) : (
              <ScrollArea className="flex-1 max-h-[60vh]">
                <div className="flex flex-col gap-3 pr-2">
                  {/* ─── Alerte Préalables ──────────────── */}
                  {completionResult.bloqueParPrealable && (
                    <div className="rounded-md border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-3 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-amber-800 dark:text-amber-300 mb-1">
                        <AlertTriangle className="size-3.5" />
                        Préalables manquants — Analyse bloquée
                      </div>
                      <ul className="ml-4 list-disc text-amber-700 dark:text-amber-400">
                        {completionResult.prealablesManquants.map((p, i) => (
                          <li key={i}>{TYPE_ELEMENT_LABELS[p] || p}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* ─── Barre globale ──────────────────── */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">Progression globale</span>
                      <span className="text-muted-foreground">
                        {completionResult.nbTotalPresents}/{completionResult.nbTotalAttendus}
                        ({completionResult.globalPourcentage}%)
                      </span>
                    </div>
                    <Progress
                      value={completionResult.globalPourcentage}
                      className={cn(
                        'h-2',
                        completionResult.complet
                          ? '[&>[data-slot=progress-indicator]]:bg-emerald-500'
                          : completionResult.bloqueParPrealable
                            ? '[&>[data-slot=progress-indicator]]:bg-amber-500'
                            : '[&>[data-slot=progress-indicator]]:bg-sky-500'
                      )}
                    />
                  </div>

                  <Separator />

                  {/* ─── Résultat par phase ────────────── */}
                  {completionResult.phases.map(ph => (
                    <div key={ph.phase} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium flex items-center gap-1.5">
                          <ChevronRight className="size-3 text-emerald-600" />
                          {ph.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {ph.presents}/{ph.total}
                        </span>
                      </div>
                      <Progress
                        value={ph.pourcentage}
                        className={cn(
                          'h-1.5',
                          ph.complet
                            ? '[&>[data-slot=progress-indicator]]:bg-emerald-500'
                            : '[&>[data-slot=progress-indicator]]:bg-sky-400'
                        )}
                      />
                      {ph.manquants.length > 0 && (
                        <div className="ml-4 text-[10px] text-muted-foreground">
                          Manquants : {ph.manquants.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* ─── Verdict ─────────────────────────── */}
                  <Separator />
                  <div className={cn(
                    'rounded-md p-3 text-xs text-center font-medium',
                    completionResult.complet
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200'
                      : 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200'
                  )}>
                    {completionResult.complet ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="size-3.5" />
                        Analyse complète — Tous les éléments sont présents
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1.5">
                        <XCircle className="size-3.5" />
                        Analyse incomplète — {completionResult.nbTotalAttendus - completionResult.nbTotalPresents} élément(s) manquant(s)
                      </span>
                    )}
                  </div>
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          {/* ═══════════ TAB QUESTIONS ══════════════════════════════════ */}
          <TabsContent value="questions" className="flex-1 mt-2 flex flex-col gap-3 min-h-0">
            {/* ─── Saisie question ──────────────────────── */}
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Textarea
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  placeholder="Posez une question méthodologique… (ex: Comment vérifier la cohérence entre le zonage morphologique et l'occupation fonctionnelle ?)"
                  className="flex-1 min-h-[60px] text-xs resize-none"
                  rows={2}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault()
                      askQuestion()
                    }
                  }}
                />
                <Button
                  className="h-auto px-3 bg-emerald-600 hover:bg-emerald-700 text-white self-end"
                  onClick={askQuestion}
                  disabled={asking || !question.trim() || qaHistory.length >= 3}
                >
                  {asking ? <Loader2 className="size-3.5 animate-spin" /> : <MessageSquare className="size-3.5" />}
                </Button>
              </div>
              {questionError && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle className="size-3" />
                  {questionError}
                </p>
              )}
              {qaHistory.length >= 3 && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="size-3" />
                  Limite de 3 questions atteinte pour cette session.
                </p>
              )}
            </div>

            {/* ─── Historique Q/R ────────────────────────── */}
            <ScrollArea className="flex-1 max-h-[40vh]">
              {qaHistory.length === 0 ? (
                <div className="flex items-center justify-center py-6">
                  <p className="text-xs text-muted-foreground text-center">
                    Posez une question méthodologique pour commencer.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 pr-2">
                  {qaHistory.map((qa, i) => (
                    <div key={i} className="space-y-1.5 rounded-md border p-3">
                      <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 flex items-start gap-1.5">
                        <HelpCircle className="size-3 mt-0.5 shrink-0" />
                        <span>{qa.question}</span>
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed pl-4.5">
                        {qa.reponse}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* ─── Notes chercheur ──────────────────────── */}
            <Separator />
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Notes du chercheur
                </span>
                <Button variant="ghost" size="sm" className="h-6 text-[10px] text-emerald-600" onClick={saveNotes}>
                  Sauvegarder
                </Button>
              </div>
              <Textarea
                ref={notesRef}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Prenez des notes sur la vérification en cours…"
                className="min-h-[80px] text-xs resize-none"
                rows={3}
              />
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
