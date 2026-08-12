'use client'

import { createElement, useState } from 'react'
import Image from 'next/image'
import {
  BookOpen,
  CheckCircle2,
  Lightbulb,
  AlertTriangle,
  XCircle,
  ArrowRight,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  BookMarked,
  ChevronRight,
  BookOpenText,
  ScrollText,
  FileText,
  ClipboardList,
  Layout,
  Type,
  FlaskConical,
  BarChart3 as BarChart3Alias,
  MessageSquare,
  GraduationCap,
  PenTool,
  ScanSearch,
  Languages,
  Sparkles,
  Loader2,
  RotateCcw,
  Send,
  ImagePlus,
  Eye,
  Target,
  type LucideIcon,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  writingSteps,
  sectionGuides,
  referenceArticles,
  submissionChecklist,
  commonMistakes,
} from '@/data/articles-guide'
import {
  biblioFeatures,
  biblioPurposes,
  biblioMethods,
  biblioTools,
  biblioMetrics,
  biblioProcess,
  literatureReviewStages,
  literatureReviewSource,
  abstractStructure,
  abstractSource,
  litReviewTypes,
  paperReviewCriteria,
  paperReviewSource,
  problemStatementElements,
  problemStatementCharacteristics,
  problemStatementElementsSource,
} from '@/data/methodology-guide'

// ─── Icon map ─────────────────────────────────────────────────────
const iconMap: Record<string, LucideIcon> = {
  ClipboardList,
  Layout,
  Type,
  BookOpen,
  FlaskConical,
  BarChart3: BarChart3Alias,
  MessageSquare,
  CheckCircle2,
  BookMarked,
  Send,
  FileText,
  GraduationCap,
  PenTool,
  BookOpenText,
  ScanSearch,
  Languages,
  ScrollText,
  Lightbulb,
  Sparkles,
  Loader2,
  RotateCcw,
}

function getIcon(name: string): LucideIcon {
  return iconMap[name] || FileText
}

// ─── Sub-components for ArticlesTab ───────────────────────────────

function StepIcon({ name, className }: { name: string; className?: string }) {
  return createElement(getIcon(name), { className })
}

function StepCard({ step, index }: { step: typeof writingSteps[0]; index: number }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
            <StepIcon name={step.icon} className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs shrink-0">Étape {index + 1}</Badge>
            </div>
            <CardTitle className="text-base mt-1">{step.title}</CardTitle>
            <CardDescription className="text-sm mt-1">{step.shortDesc}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Tips */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-semibold text-amber-700">Conseils</span>
          </div>
          <ul className="space-y-1.5">
            {step.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Pitfalls */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-sm font-semibold text-red-600">Pièges à éviter</span>
          </div>
          <ul className="space-y-1.5">
            {step.pitfalls.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

function SectionGuideCard({ guide }: { guide: typeof sectionGuides[0] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-sky-100 text-sky-700 shrink-0">
            <StepIcon name={guide.icon} className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-base">{guide.label}</CardTitle>
            {guide.wordCount && (
              <Badge variant="secondary" className="mt-1 text-xs">{guide.wordCount}</Badge>
            )}
          </div>
        </div>
        <CardDescription className="mt-2 text-sm">{guide.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Structure attendue</span>
          <ol className="mt-2 space-y-1">
            {guide.structure.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="flex items-center justify-center h-5 w-5 rounded-full bg-muted text-muted-foreground text-xs font-medium shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">{s}</span>
              </li>
            ))}
          </ol>
        </div>
        <Separator />
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Conseils</span>
          <ul className="mt-2 space-y-1">
            {guide.tips.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <ArrowRight className="h-3.5 w-3.5 shrink-0 mt-0.5 text-sky-500" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
        {guide.example && (
          <>
            <Separator />
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Exemple</span>
              <p className="mt-2 text-sm italic text-muted-foreground bg-muted/50 rounded-md p-3">
                {guide.example}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function ChecklistSection() {
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const toggle = (key: string) => {
    setChecked(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const totalItems = submissionChecklist.reduce((a, c) => a + c.items.length, 0)
  const checkedCount = Object.values(checked).filter(Boolean).length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Checklist de soumission</CardTitle>
            <CardDescription className="text-sm mt-1">
              {checkedCount} / {totalItems} étapes complétées
            </CardDescription>
          </div>
          <Badge variant={checkedCount === totalItems ? 'default' : 'secondary'} className="shrink-0">
            {Math.round((checkedCount / totalItems) * 100)}%
          </Badge>
        </div>
        <Progress value={(checkedCount / totalItems) * 100} className="h-1.5" />
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          {submissionChecklist.map((section) => (
            <AccordionItem key={section.category} value={section.category}>
              <AccordionTrigger className="text-sm font-semibold">
                {section.category}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-1">
                  {section.items.map((item) => {
                    const key = `${section.category}-${item}`
                    return (
                      <label
                        key={key}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <Checkbox
                          checked={checked[key] || false}
                          onCheckedChange={() => toggle(key)}
                        />
                        <span className={`text-sm ${checked[key] ? 'line-through text-muted-foreground' : ''}`}>
                          {item}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}

function MistakesSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Erreurs fréquentes
        </CardTitle>
        <CardDescription className="text-sm">Les pièges les plus courants et comment les éviter</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {commonMistakes.map((m, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <span className="text-sm font-medium">{m.mistake}</span>
              </div>
              <p className="text-xs text-red-600 bg-red-50 rounded px-3 py-1.5 ml-6">
                ⚠️ {m.consequence}
              </p>
              <div className="flex items-start gap-2 ml-6">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-700">{m.fix}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── ArticlesGuideTab ─────────────────────────────────────────────
export default function ArticlesGuideTab() {
  return (
    <div className="space-y-6">
      {/* Intro banner */}
      <Card className="border-emerald-200 bg-emerald-50/50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-emerald-100 shrink-0">
              <BookOpen className="h-5 w-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-semibold text-emerald-900">Guide de rédaction d&apos;articles scientifiques</h3>
              <p className="text-sm text-emerald-700 mt-1">
                Ce guide est basé sur les articles de référence fournis, notamment le guide pas-à-pas
                d&apos;Ecarnot et al. (2015). Il est conçu pour les doctorants et chercheurs
                en rédaction scientifique.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sub-tabs for the articles guide */}
      <Tabs defaultValue="steps" className="w-full">
        <TabsList className="w-full grid grid-cols-9">
          <TabsTrigger value="steps" className="text-[10px] sm:text-sm">Étapes</TabsTrigger>
          <TabsTrigger value="types" className="text-[10px] sm:text-sm">10 Types</TabsTrigger>
          <TabsTrigger value="sections" className="text-[10px] sm:text-sm">IMRaD</TabsTrigger>
          <TabsTrigger value="mistakes" className="text-[10px] sm:text-sm">Erreurs</TabsTrigger>
          <TabsTrigger value="checklist" className="text-[10px] sm:text-sm">Checklist</TabsTrigger>
          <TabsTrigger value="bibliometrie" className="text-[10px] sm:text-sm">Bibliom.</TabsTrigger>
          <TabsTrigger value="revue" className="text-[10px] sm:text-sm">Revue litt.</TabsTrigger>
          <TabsTrigger value="abstract" className="text-[10px] sm:text-sm">Abstract</TabsTrigger>
          <TabsTrigger value="resources" className="text-[10px] sm:text-sm">Ressources</TabsTrigger>
        </TabsList>

        <TabsContent value="steps" className="mt-4">
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-4 pr-4">
              {writingSteps.map((step, i) => (
                <StepCard key={step.id} step={step} index={i} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* ── 10 Types de revue de littérature ── */}
        <TabsContent value="types" className="mt-4">
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-4 pr-4">
              <Card className="border-amber-200 bg-amber-50/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BookOpenText className="h-4 w-4 text-amber-600" />
                    10 types de revue de littérature
                  </CardTitle>
                  <CardDescription className="text-xs">Choisissez le bon type de revue en fonction de vos objectifs de recherche</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Chaque type de revue a ses propres objectifs, méthodes et cas d'usage. Le bon choix dépend de votre question de recherche, de vos données disponibles et de la rigueur requise.
                  </p>
                </CardContent>
              </Card>

              {litReviewTypes.map((t) => (
                <Card key={t.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className={cn('flex items-center justify-center h-8 w-8 rounded-lg text-sm font-bold shrink-0 border', t.color)}>
                        {t.number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-sm">{t.title}</CardTitle>
                          <Badge variant="outline" className="text-[9px] shrink-0">{t.titleEn}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground">{t.description}</p>
                    <div className="bg-sky-50 rounded-lg p-3">
                      <p className="text-[11px] font-semibold text-sky-700 mb-1">Quand l'utiliser ?</p>
                      <p className="text-xs text-sky-900">{t.quandUtiliser}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-[11px] font-semibold text-emerald-700 mb-1.5">Forces</p>
                        <ul className="space-y-1">
                          {t.forces.map((f, j) => (
                            <li key={j} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                              <CheckCircle2 className="h-3 w-3 shrink-0 mt-0.5 text-emerald-500" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-red-600 mb-1.5">Limites</p>
                        <ul className="space-y-1">
                          {t.limites.map((l, j) => (
                            <li key={j} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                              <XCircle className="h-3 w-3 shrink-0 mt-0.5 text-red-400" />
                              <span>{l}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="border-amber-200 bg-amber-50/30">
                <CardContent className="p-3">
                  <p className="text-[11px] text-amber-800">
                    <strong>Pourquoi c'est important :</strong> Le bon type de revue de littérature vous aide à identifier les connaissances clés, à justifier votre étude et à apporter des contributions significatives à votre domaine.
                  </p>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="sections" className="mt-4">
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-4 pr-4">
              {sectionGuides.map((guide) => (
                <SectionGuideCard key={guide.id} guide={guide} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="mistakes" className="mt-4">
          <ScrollArea className="max-h-[70vh]">
            <div className="pr-4">
              <MistakesSection />
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="checklist" className="mt-4">
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-4 pr-4">
              <ChecklistSection />
              {/* Reference article */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookMarked className="h-5 w-5 text-amber-600" />
                    Source de référence
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {referenceArticles.map((art) => (
                    <div key={art.id} className="border rounded-lg p-4 space-y-2">
                      <p className="text-sm font-medium">{art.title}</p>
                      <p className="text-xs text-muted-foreground">{art.authors}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs">{art.source}</Badge>
                        <Badge variant="outline" className="text-xs">{art.year}</Badge>
                        {art.doi && (
                          <Badge variant="outline" className="text-xs">DOI: {art.doi}</Badge>
                        )}
                      </div>
                      <Separator className="my-2" />
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Points clés</span>
                        <ul className="mt-1 space-y-1">
                          {art.keyPoints.map((kp, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <ChevronRight className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500" />
                              <span>{kp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* ── Bibliométrie ── */}
        <TabsContent value="bibliometrie" className="mt-4">
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-4 pr-4">
              <Card className="border-indigo-200 bg-indigo-50/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-indigo-600" />
                    Analyse Bibliométrique
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Mesurer la recherche. Cartographier les connaissances. Façonner l'avenir.
                    Méthode quantitative d'analyse des publications académiques pour identifier les tendances, auteurs influents et lacunes de recherche.
                  </p>
                </CardContent>
              </Card>

              {/* Caractéristiques clés */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-indigo-700">Caractéristiques clés</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {biblioFeatures.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5 text-indigo-500" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Pourquoi l'utiliser ? */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-indigo-700">Pourquoi l'utiliser ?</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {biblioPurposes.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 mt-0.5 text-indigo-500" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Méthodes & Outils côte à côte */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-semibold text-indigo-700">Méthodes courantes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {biblioMethods.map((m, i) => (
                      <div key={i} className="border rounded-lg p-2.5">
                        <p className="text-xs font-medium">{m.name}</p>
                        <p className="text-[11px] text-muted-foreground">{m.description}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-semibold text-indigo-700">Outils populaires</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {biblioTools.map((t, i) => (
                      <div key={i} className={`rounded-lg p-2.5 ${t.color}`}>
                        <p className="text-xs font-medium">{t.name}</p>
                        <p className="text-[11px] opacity-80">{t.description}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Métriques importantes */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-indigo-700">Métriques bibliométriques importantes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {biblioMetrics.map((m, i) => (
                      <div key={i} className="flex items-start gap-2 border rounded-lg p-2.5">
                        <TrendingUp className="h-3.5 w-3.5 shrink-0 mt-0.5 text-indigo-500" />
                        <div>
                          <p className="text-xs font-medium">{m.name}</p>
                          <p className="text-[11px] text-muted-foreground">{m.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Processus */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-indigo-700">Processus type d'analyse bibliométrique</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {biblioProcess.map((s) => (
                      <div key={s.step} className="flex items-start gap-3">
                        <div className="flex items-center justify-center h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold shrink-0">
                          {s.step}
                        </div>
                        <div>
                          <p className="text-xs font-medium">{s.title}</p>
                          <p className="text-[11px] text-muted-foreground">{s.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-indigo-200 bg-indigo-50/30">
                <CardContent className="p-3">
                  <p className="text-[11px] text-indigo-700">
                    💡 <strong>À retenir :</strong> L'analyse bibliométrique transforme de grands volumes de données académiques en informations exploitables, aidant les chercheurs, institutions et décideurs à faire des choix éclairés et à faire avancer les connaissances.
                  </p>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>
        {/* ── Revue de littérature ── */}
        <TabsContent value="revue" className="mt-4">
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-4 pr-4">
              <Card className="border-sky-200 bg-sky-50/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BookOpenText className="h-4 w-4 text-sky-600" />
                    Les 5 étapes de la revue de littérature
                  </CardTitle>
                  <CardDescription className="text-xs">D'après Randolph (2009) — Comment mener une revue de littérature systématique et intégrative</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Chaque étape comporte des questions guides, une fonction principale, des différences procédurales et des sources potentielles d'invalidité des conclusions.
                  </p>
                </CardContent>
              </Card>

              {literatureReviewStages.map((s, i) => (
                <Card key={s.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center h-7 w-7 rounded-full bg-sky-100 text-sky-700 text-xs font-bold shrink-0">
                        {i + 1}
                      </div>
                      <CardTitle className="text-sm">{s.stage}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="bg-sky-50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-sky-700 mb-1">Question guide :</p>
                      <p className="text-sm text-sky-900">{s.question}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Fonction principale :</p>
                      <p className="text-sm text-foreground">{s.func}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-amber-600 mb-1">Sources d'invalidité potentielles :</p>
                      <ul className="space-y-1">
                        {s.sourcesOfInvalidity.map((v, j) => (
                          <li key={j} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                            <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                            <span>{v}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="bg-muted/30">
                <CardContent className="p-3">
                  <p className="text-[11px] text-muted-foreground italic">
                    Source : {literatureReviewSource}
                  </p>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* ── Abstract ── */}
        <TabsContent value="abstract" className="mt-4">
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-4 pr-4">
              <Card className="border-rose-200 bg-rose-50/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ScrollText className="h-4 w-4 text-rose-600" />
                    Rédiger un abstract fort
                  </CardTitle>
                  <CardDescription className="text-xs">Structure en 6 étapes annotée — Exemple tiré d'un article publié dans Nature</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Un bon abstract suit un enchaînement logique : du contexte général vers les résultats spécifiques, en passant par la lacune identifiée et la contribution de l'étude.
                  </p>
                </CardContent>
              </Card>

              {abstractStructure.map((step, i) => (
                <Card key={step.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold shrink-0 text-white bg-gray-400">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-sm">{step.label}</CardTitle>
                        <CardDescription className="text-[11px]">{step.labelEn}</CardDescription>
                      </div>
                      <Badge className={`text-[10px] ${step.color}`} variant="secondary">
                        {step.labelEn}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Exemple :</p>
                      <p className="text-sm italic text-foreground/80">{step.example}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="bg-muted/30">
                <CardContent className="p-3">
                  <p className="text-[11px] text-muted-foreground italic">
                    {abstractSource}
                  </p>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* ── RESSOURCES VISUELLES ── */}
        <TabsContent value="resources" className="mt-4">
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-6 pr-4">
              {/* R-1 : Maîtriser la section Conclusion */}
              <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <ImagePlus className="h-4 w-4 text-emerald-600" />
                    <CardTitle className="text-sm">Maîtriser la section Conclusion</CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    Les 6 composantes d'une conclusion de recherche selon Creswell — Problématique, Résultats, Implications, Limites, Perspectives, Conclusion forte
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { label: 'Problem Statement', color: 'bg-orange-100 text-orange-800 border-orange-200' },
                      { label: 'Key Findings', color: 'bg-sky-100 text-sky-800 border-sky-200' },
                      { label: 'Implications', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
                      { label: 'Limitations', color: 'bg-rose-100 text-rose-800 border-rose-200' },
                      { label: 'Future Work', color: 'bg-slate-100 text-slate-800 border-slate-200' },
                      { label: 'Closing Statement', color: 'bg-violet-100 text-violet-800 border-violet-200' },
                    ].map((item) => (
                      <div key={item.label} className={cn('rounded-lg border p-2 text-center text-[10px] font-medium', item.color)}>
                        {item.label}
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg border overflow-hidden bg-white">
                    <Image src="/resources/R-1.jpg" alt="Structure d'une conclusion de recherche" width={800} height={1200} className="w-full h-auto object-contain" />
                  </div>
                  <p className="text-[10px] text-muted-foreground italic">
                    Source : John W. Creswell, &quot;Educational Research: Planning, Conducting, and Evaluating Quantitative and Qualitative Research&quot;
                  </p>
                </CardContent>
              </Card>

              {/* R-2 : Outils de revue systématique */}
              <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <ScanSearch className="h-4 w-4 text-emerald-600" />
                    <CardTitle className="text-sm">5 outils pour une revue systématique</CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    Outils essentiels pour le dépistage, l'analyse critique, la synthèse et le reporting de votre revue de littérature
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { name: 'Covidence', desc: 'Dépistage & sélection', color: 'bg-blue-900 text-white' },
                      { name: 'Rayyan', desc: 'Screening IA aveugle', color: 'bg-violet-700 text-white' },
                      { name: 'RevMan', desc: 'Méta-analyse Cochrane', color: 'bg-rose-600 text-white' },
                      { name: 'JBI SUMARI', desc: 'Appréciation critique', color: 'bg-blue-700 text-white' },
                      { name: 'PRISMA', desc: 'Diagramme de flux', color: 'bg-slate-800 text-white' },
                    ].map((tool) => (
                      <div key={tool.name} className={cn('rounded-lg p-2 text-center', tool.color)}>
                        <p className="text-[10px] font-bold">{tool.name}</p>
                        <p className="text-[9px] opacity-80">{tool.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg border overflow-hidden bg-white">
                    <Image src="/resources/R-2.jpg" alt="5 outils de revue systématique" width={800} height={1200} className="w-full h-auto object-contain" />
                  </div>
                  <p className="text-[10px] text-muted-foreground italic">
                    Source : @DRFRED_PHD — Scholarships | Resources | Success
                  </p>
                </CardContent>
              </Card>

              {/* R-3 : Évaluer un article de recherche */}
              <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-emerald-600" />
                    <CardTitle className="text-sm">Évaluer un article de recherche</CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    5 critères essentiels pour évaluer la qualité, la rigueur et l'impact de tout article scientifique
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {paperReviewCriteria.map((c) => (
                      <div key={c.id} className={cn('rounded-lg border p-3', c.color)}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-amber-600">{String(c.number).padStart(2, '0')}</span>
                          <span className="text-xs font-bold">{c.title}</span>
                        </div>
                        <p className="text-[10px] font-medium text-amber-700 mb-1.5">{c.question}</p>
                        <ul className="space-y-0.5">
                          {c.subQuestions.map((sq, i) => (
                            <li key={i} className="text-[10px] text-slate-600 flex gap-1">
                              <span className="text-emerald-500 mt-0.5">•</span>{sq}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg border overflow-hidden bg-white">
                    <Image src="/resources/R-3.jpg" alt="5 critères pour évaluer un article de recherche" width={800} height={1200} className="w-full h-auto object-contain" />
                  </div>
                  <p className="text-[10px] text-muted-foreground italic">
                    {paperReviewSource}
                  </p>
                </CardContent>
              </Card>

              {/* R-4 : Rédiger une problématique de recherche */}
              <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-emerald-600" />
                    <CardTitle className="text-sm">Rédiger une problématique de recherche</CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    Les 4 éléments essentiels et 3 caractéristiques d'une problématique forte et efficace
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {problemStatementElements.map((el) => (
                      <div key={el.id} className={cn('rounded-lg border p-2', el.color)}>
                        <span className="text-xs font-bold text-amber-600">{String(el.number).padStart(2, '0')}</span>
                        <p className="text-[11px] font-semibold mt-0.5">{el.title}</p>
                        <p className="text-[9px] text-amber-700 font-medium mt-0.5">{el.keyQuestion}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg border p-3 bg-slate-50">
                    <p className="text-[10px] font-bold text-slate-700 mb-2">Caractéristiques d'une problématique forte :</p>
                    <div className="space-y-1.5">
                      {problemStatementCharacteristics.map((ch) => (
                        <div key={ch.name} className="flex items-start gap-2">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                          <div>
                            <span className="text-[10px] font-bold text-slate-800">{ch.name}</span>
                            <span className="text-[10px] text-slate-500"> — {ch.description}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg border overflow-hidden bg-white">
                    <Image src="/resources/R-4.jpg" alt="4 éléments d'une problématique de recherche" width={800} height={1200} className="w-full h-auto object-contain" />
                  </div>
                  <p className="text-[10px] text-muted-foreground italic">
                    {problemStatementElementsSource}
                  </p>
                </CardContent>
              </Card>

              {/* R-5 : 10 types de lacunes de recherche */}
              <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="h-4 w-4 text-emerald-600" />
                    <CardTitle className="text-sm">10 types de lacunes de recherche</CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    Cartographie complète des Research Gaps avec stratégies pour combler chaque lacune
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-lg border overflow-hidden bg-white">
                    <Image src="/resources/R-5.jpg" alt="10 types de lacunes de recherche" width={800} height={1200} className="w-full h-auto object-contain" />
                  </div>
                  <p className="text-[10px] text-muted-foreground italic">
                    Source : Miles, D. A. (2017). A taxonomy of research gaps. Doctoral student workshop, Dallas, Texas. Mindmap par Lennart Nacke.
                  </p>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
