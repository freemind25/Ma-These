'use client'

import { useState } from 'react'
import {
  Layout,
  ChevronRight,
  FileText,
  BookOpen,
  Lightbulb,
  GraduationCap,
  FlaskConical,
  CheckCircle2,
  FileCode2,
  Download,
  BookOpenText,
  ScanSearch,
  TrendingUp,
  Clock,
  ShieldCheck,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { DEFAULT_THESIS_DATA, type ThesisData } from '@/data/latex-template'
import { guidereGuide } from '@/data/methodology-guide'

// ─── Chapter interface ───────────────────────────────────────────
interface Chapter {
  id: string
  title: string
  words: number
  pages: number
  notes: string
  expanded: boolean
}

export const DEFAULT_CHAPTERS: Chapter[] = [
  { id: 'cover', title: 'Page de couverture', words: 0, pages: 1, notes: '', expanded: false },
  { id: 'ack', title: 'Remerciements', words: 0, pages: 1, notes: '', expanded: false },
  { id: 'abstract', title: 'Résumé (Français / Anglais)', words: 0, pages: 2, notes: '', expanded: false },
  { id: 'intro', title: 'Introduction générale', words: 0, pages: 0, notes: '', expanded: false },
  { id: 'lit', title: 'Revue de la littérature (Chapitre I)', words: 0, pages: 0, notes: '', expanded: false },
  { id: 'context', title: 'Contexte et cadre méthodologique (Chapitre II)', words: 0, pages: 0, notes: '', expanded: false },
  { id: 'results', title: 'Résultats et analyse (Chapitre III)', words: 0, pages: 0, notes: '', expanded: false },
  { id: 'discussion', title: 'Discussion (Chapitre IV)', words: 0, pages: 0, notes: '', expanded: false },
  { id: 'conclusion', title: 'Conclusion générale', words: 0, pages: 0, notes: '', expanded: false },
  { id: 'biblio', title: 'Références bibliographiques', words: 0, pages: 0, notes: '', expanded: false },
  { id: 'annexes', title: 'Annexes', words: 0, pages: 0, notes: '', expanded: false },
]

// ─── ThesisPlanTab ────────────────────────────────────────────────
function ThesisPlanTab() {
  const [chapters, setChapters] = useState<Chapter[]>(DEFAULT_CHAPTERS)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<'words' | 'pages' | 'title' | 'notes' | null>(null)
  const [editValue, setEditValue] = useState('')

  const totalWords = chapters.reduce((a, c) => a + c.words, 0)
  const totalPages = chapters.reduce((a, c) => a + c.pages, 0)
  const startedCount = chapters.filter(c => c.words > 0 || c.pages > 0).length

  function startEdit(id: string, field: 'words' | 'pages' | 'title' | 'notes', currentValue: string | number) {
    setEditingId(id)
    setEditingField(field)
    setEditValue(String(currentValue))
  }

  function commitEdit() {
    if (!editingId || !editingField) return
    setChapters(prev =>
      prev.map(ch => {
        if (ch.id !== editingId) return ch
        const val = editingField === 'title' || editingField === 'notes'
          ? editValue
          : Math.max(0, parseInt(editValue) || 0)
        return { ...ch, [editingField]: val }
      })
    )
    setEditingId(null)
    setEditingField(null)
    setEditValue('')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditingField(null)
    setEditValue('')
  }

  function toggleExpand(id: string) {
    setChapters(prev => prev.map(ch => ch.id === id ? { ...ch, expanded: !ch.expanded } : ch))
  }

  return (
    <Tabs defaultValue="planner" className="w-full">
      <TabsList className="w-full grid grid-cols-3 mb-4">
        <TabsTrigger value="planner" className="text-xs sm:text-sm flex items-center gap-1.5 justify-center">
          <Layout className="h-3.5 w-3.5" />
          Planificateur
        </TabsTrigger>
        <TabsTrigger value="guide" className="text-xs sm:text-sm flex items-center gap-1.5 justify-center">
          <BookOpenText className="h-3.5 w-3.5" />
          Guide Guidère
        </TabsTrigger>
        <TabsTrigger value="criteres" className="text-xs sm:text-sm flex items-center gap-1.5 justify-center">
          <ShieldCheck className="h-3.5 w-3.5" />
          Évaluation
        </TabsTrigger>
      </TabsList>

      <TabsContent value="planner">
        <div className="space-y-6">
      {/* Header stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Mots rédigés</CardDescription>
            <CardTitle className="text-3xl font-bold tabular-nums">
              {totalWords.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mt-1">
              {startedCount} / {chapters.length} chapitres commencés
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pages estimées</CardDescription>
            <CardTitle className="text-3xl font-bold tabular-nums">
              {totalPages}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mt-1">
              ≈ {totalWords > 0 ? Math.round(totalWords / 250) : '—'} pages (base 250 mots/page)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Structure IMRaD</CardDescription>
            <CardTitle className="text-3xl font-bold flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-emerald-600" />
              11 chapitres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Squelette IMRaD — Structure standard de thèse
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chapter list */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Chapitres de la thèse</CardTitle>
              <CardDescription className="mt-1">
                Cliquez sur les valeurs pour les modifier — la longueur est libre
              </CardDescription>
            </div>
            <p className="text-xs text-muted-foreground shrink-0 text-right leading-relaxed">
              Cliquez sur <strong>titre</strong>, <strong>mots</strong> ou <strong>pages</strong> pour éditer.{'\n'}
              Entrée pour valider, Échap pour annuler.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {chapters.map((ch) => {
              const isEditingThis = editingId === ch.id
              const isStarted = ch.words > 0 || ch.pages > 0
              return (
                <div key={ch.id} className={`rounded-lg border transition-colors ${isStarted ? 'border-emerald-200 bg-emerald-50/30' : 'hover:bg-muted/50'}`}>
                  {/* Main row */}
                  <div
                    className="flex items-center gap-3 p-3 cursor-pointer select-none"
                    onClick={() => toggleExpand(ch.id)}
                    onKeyDown={(e) => e.key === 'Enter' && toggleExpand(ch.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <ChevronRight className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${ch.expanded ? 'rotate-90' : ''}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {isEditingThis && editingField === 'title' ? (
                          <input
                            className="font-medium text-sm bg-white border rounded px-2 py-0.5 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={commitEdit}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitEdit()
                              if (e.key === 'Escape') cancelEdit()
                              e.stopPropagation()
                            }}
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className="font-medium text-sm truncate">{ch.title}</span>
                        )}
                        {isStarted && (
                          <Badge variant="secondary" className="text-xs shrink-0 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                            En cours
                          </Badge>
                        )}
                      </div>
                    </div>
                    {/* Words */}
                    <div
                      className="shrink-0 text-right min-w-[90px]"
                      onClick={(e) => { e.stopPropagation(); startEdit(ch.id, 'words', ch.words) }}
                    >
                      {isEditingThis && editingField === 'words' ? (
                        <input
                          className="text-xs bg-white border rounded px-1.5 py-0.5 w-full text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 tabular-nums"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={commitEdit}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') commitEdit()
                            if (e.key === 'Escape') cancelEdit()
                            e.stopPropagation()
                          }}
                          autoFocus
                        />
                      ) : (
                        <span className={`text-xs tabular-nums ${ch.words > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                          {ch.words > 0 ? `${ch.words.toLocaleString()} mots` : '— mots'}
                        </span>
                      )}
                    </div>
                    {/* Pages */}
                    <div
                      className="shrink-0 text-right min-w-[70px]"
                      onClick={(e) => { e.stopPropagation(); startEdit(ch.id, 'pages', ch.pages) }}
                    >
                      {isEditingThis && editingField === 'pages' ? (
                        <input
                          className="text-xs bg-white border rounded px-1.5 py-0.5 w-full text-right focus:outline-none focus:ring-2 focus:ring-emerald-500 tabular-nums"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={commitEdit}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') commitEdit()
                            if (e.key === 'Escape') cancelEdit()
                            e.stopPropagation()
                          }}
                          autoFocus
                        />
                      ) : (
                        <span className={`text-xs tabular-nums ${ch.pages > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                          {ch.pages > 0 ? `${ch.pages} p.` : '— p.'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expanded section */}
                  {ch.expanded && (
                    <div className="px-3 pb-3 pl-10 space-y-3">
                      <div className="h-px bg-border" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Edit words */}
                        <div
                          className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                          onClick={() => startEdit(ch.id, 'words', ch.words)}
                        >
                          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-xs text-muted-foreground">Mots :</span>
                          {isEditingThis && editingField === 'words' ? (
                            <input
                              className="text-sm bg-white border rounded px-2 py-0.5 flex-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 tabular-nums"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={commitEdit}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') commitEdit()
                                if (e.key === 'Escape') cancelEdit()
                              }}
                              autoFocus
                            />
                          ) : (
                            <span className="text-sm font-medium tabular-nums">
                              {ch.words > 0 ? ch.words.toLocaleString() : 'Non défini'}
                            </span>
                          )}
                        </div>
                        {/* Edit pages */}
                        <div
                          className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                          onClick={() => startEdit(ch.id, 'pages', ch.pages)}
                        >
                          <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-xs text-muted-foreground">Pages :</span>
                          {isEditingThis && editingField === 'pages' ? (
                            <input
                              className="text-sm bg-white border rounded px-2 py-0.5 flex-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 tabular-nums"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={commitEdit}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') commitEdit()
                                if (e.key === 'Escape') cancelEdit()
                              }}
                              autoFocus
                            />
                          ) : (
                            <span className="text-sm font-medium tabular-nums">
                              {ch.pages > 0 ? ch.pages : 'Non défini'}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Notes */}
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <span className="text-xs text-muted-foreground shrink-0 mt-0.5">Notes :</span>
                        {isEditingThis && editingField === 'notes' ? (
                          <textarea
                            className="text-xs bg-white border rounded px-2 py-1 flex-1 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[60px]"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={commitEdit}
                            onKeyDown={(e) => {
                              if (e.key === 'Escape') cancelEdit()
                              if (e.key === 'Enter' && e.metaKey) commitEdit()
                            }}
                            autoFocus
                            rows={2}
                          />
                        ) : (
                          <div
                            className="flex-1 text-sm cursor-pointer p-2 rounded-md hover:bg-muted/50 min-h-[32px] border border-dashed border-border"
                            onClick={() => startEdit(ch.id, 'notes', ch.notes)}
                          >
                            {ch.notes ? (
                              <span className="text-sm text-foreground">{ch.notes}</span>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">
                                Cliquer pour ajouter des remarques…
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <LatexExportSection chapters={chapters} />
        </div>
      </TabsContent>

      {/* ── Guide Guidère ── */}
      <TabsContent value="guide">
        <div className="space-y-4">
          <Card className="border-sky-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{guidereGuide.title}</CardTitle>
              <CardDescription className="text-xs">{guidereGuide.author} — {guidereGuide.source}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg bg-sky-50 border border-sky-100 p-3">
                <p className="text-xs font-medium text-sky-800 mb-1">💡 Définition</p>
                <p className="text-xs text-sky-700">{guidereGuide.definition}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs italic text-muted-foreground">« {guidereGuide.keyQuote} »</p>
              </div>
            </CardContent>
          </Card>

          {/* 3 Phases du projet */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><FlaskConical className="h-4 w-4 text-sky-600" /> Conduite du projet : 3 phases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {guidereGuide.projectPhases.map((p, i) => (
                  <div key={i} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold">{i + 1}</div>
                      <p className="text-sm font-medium">{p.title}</p>
                    </div>
                    <ul className="space-y-1">{p.details.map((d, j) => <li key={j} className="flex items-start gap-1.5 text-xs text-muted-foreground"><ChevronRight className="h-3 w-3 text-sky-500 shrink-0 mt-0.5" /><span>{d}</span></li>)}</ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Planning mémoire vs doctorat */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4 text-emerald-600" /> Planning : Mémoire vs Doctorat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg border border-sky-200 bg-sky-50/50 p-3 space-y-2">
                  <p className="text-sm font-semibold text-sky-800">📚 Master Recherche ({guidereGuide.planning.master.duration})</p>
                  <ul className="space-y-1">{guidereGuide.planning.master.steps.map((s, i) => <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground"><ChevronRight className="h-3 w-3 text-sky-500 shrink-0 mt-0.5" /><span>{s}</span></li>)}</ul>
                </div>
                <div className="rounded-lg border border-violet-200 bg-violet-50/50 p-3 space-y-2">
                  <p className="text-sm font-semibold text-violet-800">🎓 Doctorat ({guidereGuide.planning.doctorat.duration})</p>
                  <ul className="space-y-1">{guidereGuide.planning.doctorat.steps.map((s, i) => <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground"><ChevronRight className="h-3 w-3 text-violet-500 shrink-0 mt-0.5" /><span>{s}</span></li>)}</ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4 étapes de la recherche */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-600" /> 4 étapes de la recherche</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {guidereGuide.researchSteps.map((s, i) => (
                <div key={i} className="flex gap-3 items-start rounded-lg border p-2.5">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{s.step}</p>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                    <div className="flex flex-wrap gap-1">{s.tools.map((t, j) => <Badge key={j} variant="secondary" className="text-[10px]">{t}</Badge>)}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Fiches de travail + Corpus */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">📝 Fiches de travail</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {guidereGuide.fiches.map((f, i) => (
                  <div key={i} className="rounded-lg border p-2.5 space-y-1.5">
                    <p className="text-xs font-semibold">{f.type}</p>
                    <ul className="space-y-0.5">{f.content.map((c, j) => <li key={j} className="text-[11px] text-muted-foreground flex items-start gap-1"><span className="text-sky-500">•</span><span>{c}</span></li>)}</ul>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">📚 Corpus documentaire</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">{guidereGuide.corpus.definition}</p>
                <p className="text-xs font-medium">Critères :</p>
                <ul className="space-y-1">{guidereGuide.corpus.criteria.map((c, i) => <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" /><span>{c}</span></li>)}</ul>
                <Separator className="my-2" />
                <p className="text-xs font-medium">Ressources web :</p>
                <div className="flex flex-wrap gap-1">{guidereGuide.researchWeb.digital.map((r, i) => <Badge key={i} variant="secondary" className="text-[10px]">{r}</Badge>)}</div>
                <div className="rounded-lg bg-amber-50 border border-amber-100 p-2">
                  <p className="text-[11px] text-amber-800">⚠️ {guidereGuide.researchWeb.goldenRule}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Problématique + Plan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-violet-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">🎯 La Problématique</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground">{guidereGuide.problematique.definition}</p>
                <div className="rounded-lg bg-violet-50 border border-violet-100 p-2.5">
                  <p className="text-xs font-medium text-violet-800 mb-1">Formulation type :</p>
                  <p className="text-xs italic text-violet-700">{guidereGuide.problematique.formulation}</p>
                </div>
                <div className="rounded-lg bg-amber-50 border border-amber-100 p-2">
                  <p className="text-[11px] text-amber-800">⚠️ {guidereGuide.problematique.warning}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-2">
                  <p className="text-[11px] italic text-muted-foreground">« {guidereGuide.problematique.quote} »</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">📐 Types de plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {guidereGuide.planTypes.map((p, i) => (
                  <div key={i} className="rounded-lg border p-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold">{p.type}</p>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{p.desc}</p>
                    <p className="text-[11px] text-sky-700 italic mt-1">{p.note}</p>
                  </div>
                ))}
                <div className="rounded-lg bg-muted/40 p-2 mt-1">
                  <p className="text-[11px] font-medium text-muted-foreground">Règles des titres :</p>
                  <ul className="mt-1">{guidereGuide.titleRules.map((r, i) => <li key={i} className="text-[11px] text-muted-foreground">✓ {r}</li>)}</ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rédaction + Aspects techniques */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-rose-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">✍️ Rédaction</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg border p-2.5 space-y-1.5">
                  <p className="text-xs font-semibold">Introduction ({guidereGuide.redaction.intro.proportion})</p>
                  <ul className="space-y-0.5">{guidereGuide.redaction.intro.mustInclude.map((m, i) => <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1"><span className="text-rose-500">•</span><span>{m}</span></li>)}</ul>
                </div>
                <div className="rounded-lg border p-2.5 space-y-1.5">
                  <p className="text-xs font-semibold">Conclusion</p>
                  <ul className="space-y-0.5">{guidereGuide.redaction.conclusion.mustInclude.map((m, i) => <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1"><span className="text-emerald-500">•</span><span>{m}</span></li>)}</ul>
                </div>
                <div className="rounded-lg border p-2.5 space-y-1.5">
                  <p className="text-xs font-semibold">Citations</p>
                  {guidereGuide.redaction.citations.map((c, i) => <div key={i} className="text-[11px] text-muted-foreground"><strong>{c.rule}</strong> : {c.format}</div>)}
                  <p className="text-[11px] text-amber-700 mt-1">📌 {guidereGuide.redaction.citationRule}</p>
                </div>
                <p className="text-[11px] text-muted-foreground italic">📎 {guidereGuide.redaction.footnotes}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">⚙️ Aspects techniques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg border p-2.5 space-y-1.5">
                  <p className="text-xs font-semibold">Typographie</p>
                  <ul className="space-y-0.5">{guidereGuide.aspectsTechniques.typo.map((t, i) => <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1"><span className="text-sky-500">•</span><span>{t}</span></li>)}</ul>
                </div>
                <div className="rounded-lg border p-2.5 space-y-1.5">
                  <p className="text-xs font-semibold">Ponctuation</p>
                  <ul className="space-y-0.5">{guidereGuide.aspectsTechniques.ponctuation.map((p, i) => <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1"><span className="text-sky-500">•</span><span>{p}</span></li>)}</ul>
                </div>
                <div className="rounded-lg border p-2.5 space-y-1.5">
                  <p className="text-xs font-semibold">Outils</p>
                  <ul className="space-y-0.5">{guidereGuide.aspectsTechniques.outils.map((o, i) => <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1"><span className="text-emerald-500">•</span><span>{o}</span></li>)}</ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Approches + Méthodes */}
          <Card className="border-emerald-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><ScanSearch className="h-4 w-4 text-emerald-600" /> Approches et méthodes d&apos;analyse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs font-medium">4 approches méthodologiques :</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {guidereGuide.approaches.map((a, i) => (
                  <div key={i} className="rounded-lg border p-2.5 flex items-start gap-2">
                    <div className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-[10px] font-bold">{i + 1}</div>
                    <div><p className="text-xs font-semibold">{a.name}</p><p className="text-[11px] text-muted-foreground">{a.desc}</p></div>
                  </div>
                ))}
              </div>
              <Separator className="my-1" />
              <p className="text-xs font-medium">4 procédés intellectuels :</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {guidereGuide.procedures.map((p, i) => (
                  <div key={i} className="rounded-lg border p-2.5"><p className="text-xs font-semibold">{p.name}</p><p className="text-[11px] text-muted-foreground">{p.desc}</p></div>
                ))}
              </div>
              <Separator className="my-1" />
              <p className="text-xs font-medium">3 grandes méthodes :</p>
              {guidereGuide.methods.map((m, i) => (
                <div key={i} className="rounded-lg border p-2.5"><p className="text-xs font-semibold">{m.name}</p><p className="text-[11px] text-muted-foreground">{m.desc}</p></div>
              ))}
            </CardContent>
          </Card>

          {/* Citations clés */}
          <Card className="border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">💬 Citations clés du guide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {guidereGuide.quotes.map((q, i) => (
                  <div key={i} className="rounded-lg bg-amber-50/50 border border-amber-100 p-2.5">
                    <p className="text-xs italic text-muted-foreground">« {q.text} »</p>
                    <p className="text-[10px] text-amber-700 mt-1">— {guidereGuide.author}, {q.page}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* ── Évaluation (critères du jury) ── */}
      <TabsContent value="criteres">
        <div className="space-y-4">
          <Card className="border-emerald-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Critères d&apos;évaluation du jury</CardTitle>
              <CardDescription className="text-xs">D&apos;après {guidereGuide.author} — {guidereGuide.source}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {guidereGuide.evaluationCriteria.map((cat, i) => (
                <div key={i} className="rounded-lg border p-3 space-y-2">
                  <p className="text-sm font-semibold">{cat.category}</p>
                  <ul className="space-y-1">{cat.items.map((item, j) => <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" /><span>{item}</span></li>)}</ul>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">🏛️ Cadre institutionnel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg border border-violet-200 bg-violet-50/50 p-3 space-y-2">
                  <p className="text-sm font-semibold text-violet-800">🎓 Doctorat</p>
                  <ul className="space-y-1">{Object.entries(guidereGuide.institutionnel.doctorat).map(([k, v]) => <li key={k} className="text-xs text-muted-foreground"><strong className="text-foreground capitalize">{k} :</strong> {v}</li>)}</ul>
                </div>
                <div className="rounded-lg border border-sky-200 bg-sky-50/50 p-3 space-y-2">
                  <p className="text-sm font-semibold text-sky-800">📚 Master Recherche</p>
                  <ul className="space-y-1">{Object.entries(guidereGuide.institutionnel.master).map(([k, v]) => <li key={k} className="text-xs text-muted-foreground"><strong className="text-foreground capitalize">{k} :</strong> {v}</li>)}</ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
}

// ─── LatexExportSection ───────────────────────────────────────────
function LatexExportSection({ chapters }: { chapters: { id: string; title: string; words: number; pages: number; notes: string }[] }) {
  const [open, setOpen] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [meta, setMeta] = useState<ThesisData>(DEFAULT_THESIS_DATA)
  const [exportDone, setExportDone] = useState(false)

  function handleExport() {
    setGenerating(true)
    const payload: ThesisData = {
      ...meta,
      chapters: chapters.map(ch => ({
        title: ch.title,
        content: `\\TODO{Rédiger ${ch.title}}`,
      })),
    }

    fetch('/api/generate-latex', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'these.tex'
        a.click()
        URL.revokeObjectURL(url)
        setExportDone(true)
        setTimeout(() => setExportDone(false), 3000)
      })
      .catch(() => alert('Erreur lors de la génération du fichier LaTeX.'))
      .finally(() => setGenerating(false))
  }

  return (
    <Card className="border-emerald-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-100 shrink-0">
              <FileCode2 className="h-5 w-5 text-emerald-700" />
            </div>
            <div>
              <CardTitle className="text-base">Exporter en LaTeX</CardTitle>
              <CardDescription className="text-sm">
                Générez un fichier .tex prêt à compiler (Overleaf, Texmaker…)
              </CardDescription>
            </div>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="shrink-0 gap-2">
                {exportDone ? <CheckCircle2 className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                {exportDone ? 'Téléchargé !' : 'Générer .tex'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileCode2 className="h-5 w-5 text-emerald-600" />
                  Métadonnées de la thèse
                </DialogTitle>
                <DialogDescription>
                  Ces informations apparaîtront sur la page de garde et dans les métadonnées PDF.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Titre de la thèse</Label>
                  <Input id="title" value={meta.title} onChange={e => setMeta(p => ({ ...p, title: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="author">Nom du doctorant</Label>
                    <Input id="author" value={meta.author} onChange={e => setMeta(p => ({ ...p, author: e.target.value }))} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Année de soutenance</Label>
                    <Input id="date" value={meta.date} onChange={e => setMeta(p => ({ ...p, date: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="supervisor">Directeur de thèse</Label>
                    <Input id="supervisor" value={meta.supervisor} onChange={e => setMeta(p => ({ ...p, supervisor: e.target.value }))} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="coSupervisor">Co-directeur (optionnel)</Label>
                    <Input id="coSupervisor" value={meta.coSupervisor || ''} onChange={e => setMeta(p => ({ ...p, coSupervisor: e.target.value }))} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="speciality">Spécialité</Label>
                  <Input id="speciality" value={meta.speciality} onChange={e => setMeta(p => ({ ...p, speciality: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="laboratory">Laboratoire de recherche</Label>
                  <Input id="laboratory" value={meta.laboratory} onChange={e => setMeta(p => ({ ...p, laboratory: e.target.value }))} />
                </div>
                <Separator />
                <div className="grid gap-2">
                  <Label htmlFor="abstractFr">Résumé (français)</Label>
                  <Textarea id="abstractFr" rows={4} value={meta.abstractFr} onChange={e => setMeta(p => ({ ...p, abstractFr: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="keywordsFr">Mots-clés (français, séparés par des virgules)</Label>
                  <Input id="keywordsFr" value={meta.keywordsFr} onChange={e => setMeta(p => ({ ...p, keywordsFr: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="abstractEn">Abstract (anglais)</Label>
                  <Textarea id="abstractEn" rows={4} value={meta.abstractEn} onChange={e => setMeta(p => ({ ...p, abstractEn: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="keywordsEn">Keywords (anglais, séparés par des virgules)</Label>
                  <Input id="keywordsEn" value={meta.keywordsEn} onChange={e => setMeta(p => ({ ...p, keywordsEn: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dedication">Dédicace (optionnel)</Label>
                  <Textarea id="dedication" rows={2} value={meta.dedication || ''} onChange={e => setMeta(p => ({ ...p, dedication: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ack">Remerciements</Label>
                  <Textarea id="ack" rows={3} value={meta.acknowledgements || ''} onChange={e => setMeta(p => ({ ...p, acknowledgements: e.target.value }))} />
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                <Button onClick={handleExport} disabled={generating} className="gap-2">
                  {generating ? 'Génération…' : <><Download className="h-4 w-4" /> Télécharger these.tex</>}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground">
          Le fichier généré inclut : page de garde, table des matières, chapitres structurés (IMRaD),
          zones TODO rouges à compléter, bibliographie BibLaTeX, et annexes.
          Compilez avec <strong>xelatex → biber → xelatex × 2</strong>.
        </p>
      </CardContent>
    </Card>
  )
}

export default ThesisPlanTab
