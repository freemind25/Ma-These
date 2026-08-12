'use client'

import {
  FlaskConical,
  Layout,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  Target,
  ChevronRight,
  XCircle,
  ShieldCheck,
  Database,
  Search,
  ExternalLink,
  GraduationCap,
  Globe,
  MapPin,
  Languages,
  MessageSquare,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  researchCycle,
  researchTypes,
  reasoningApproaches,
  disciplinarities,
  problematiqueGuide,
  problematiqueConseils,
  operationalisationConcept,
  operationalisationExample,
  hypothesesConditions,
  hypothesesVerification,
  collectTools,
  documentTypes,
  databases,
  catalogs,
  webResources,
  introductionStructure,
  titreConseils,
  researchVariables,
  variableCategories,
  problemStatementQuestions,
  problemStatementSource,
  researchGaps,
  researchGapsSource,
  introductionWritingTips,
  introductionWritingAdvice,
  operationalisationBaripedia,
  qualitativeResearchSteps,
} from '@/data/methodology-guide'
import { thesisRepositories } from '@/data/academic-databases'

// ─── MethodologyTab ──────────────────────────────────────────────
export default function MethodologyTab() {
  return (
    <div className="space-y-6">
      {/* Intro banner */}
      <Card className="border-sky-200 bg-sky-50/50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-sky-100 shrink-0">
              <FlaskConical className="h-5 w-5 text-sky-700" />
            </div>
            <div>
              <h3 className="font-semibold text-sky-900">Guide de méthodologie de la recherche</h3>
              <p className="text-sm text-sky-700 mt-1">
                Guide complet de la méthodologie de la recherche scientifique.
                Couvre la démarche scientifique, la problématique, les outils de collecte et la recherche documentaire.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="demarche" className="w-full">
        <TabsList className="w-full grid grid-cols-4 sm:grid-cols-8">
          <TabsTrigger value="demarche" className="text-xs sm:text-sm">Démarche</TabsTrigger>
          <TabsTrigger value="problematique" className="text-xs sm:text-sm">Problématique</TabsTrigger>
          <TabsTrigger value="operation" className="text-xs sm:text-sm">Opérat.</TabsTrigger>
          <TabsTrigger value="outils" className="text-xs sm:text-sm">Outils</TabsTrigger>
          <TabsTrigger value="variables" className="text-xs sm:text-sm">Variables</TabsTrigger>
          <TabsTrigger value="documentation" className="text-xs sm:text-sm">Doc.</TabsTrigger>
          <TabsTrigger value="qualitative" className="text-xs sm:text-sm">Qualitative</TabsTrigger>
          <TabsTrigger value="theses" className="text-xs sm:text-sm">Thèses</TabsTrigger>
        </TabsList>

        {/* ── Démarche ── */}
        <TabsContent value="demarche" className="mt-4">
          <div className="space-y-6">
            {/* Cycle de recherche */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Layout className="h-5 w-5 text-sky-600" />
                  Cycle de la recherche scientifique
                </CardTitle>
                <CardDescription>Les 8 étapes du processus de recherche, de la question à la publication</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-sky-200" />
                  <div className="space-y-4">
                    {researchCycle.map((step, i) => (
                      <div key={step.id} className="flex gap-4 relative">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-sky-100 text-sky-700 shrink-0 z-10 text-sm font-bold">
                          {i + 1}
                        </div>
                        <div className="flex-1 pb-2">
                          <h4 className="text-sm font-semibold">{step.title}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                          <ul className="mt-2 space-y-1">
                            {step.details.map((d, j) => (
                              <li key={j} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                                <CheckCircle2 className="h-3 w-3 text-sky-500 shrink-0 mt-0.5" />
                                <span>{d}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Types de recherche */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Types de recherche</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {researchTypes.map(rt => (
                    <div key={rt.id} className={`rounded-lg border p-4 space-y-2 ${rt.color === 'sky' ? 'border-sky-200 bg-sky-50/50' : rt.color === 'amber' ? 'border-amber-200 bg-amber-50/50' : 'border-emerald-200 bg-emerald-50/50'}`}>
                      <Badge variant="secondary" className="text-xs">{rt.title}</Badge>
                      <p className="text-xs text-muted-foreground">{rt.description}</p>
                      <ul className="space-y-1">
                        {rt.characteristics.map((c, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                            <ArrowRight className={`h-3 w-3 shrink-0 mt-0.5 ${rt.color === 'sky' ? 'text-sky-500' : rt.color === 'amber' ? 'text-amber-500' : 'text-emerald-500'}`} />
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Induction / Déduction */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-sky-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{reasoningApproaches.inductive.title}</CardTitle>
                  <CardDescription className="text-xs">{reasoningApproaches.inductive.subtitle}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground">{reasoningApproaches.inductive.description}</p>
                  <div className="bg-sky-50 rounded p-2">
                    <p className="text-xs italic text-sky-800">Ex : {reasoningApproaches.inductive.example}</p>
                  </div>
                  <ol className="space-y-1">
                    {reasoningApproaches.inductive.steps.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center justify-center h-5 w-5 rounded-full bg-sky-100 text-sky-700 text-xs font-medium shrink-0">{i + 1}</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
              <Card className="border-emerald-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{reasoningApproaches.deductive.title}</CardTitle>
                  <CardDescription className="text-xs">{reasoningApproaches.deductive.subtitle}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground">{reasoningApproaches.deductive.description}</p>
                  <div className="bg-emerald-50 rounded p-2">
                    <p className="text-xs italic text-emerald-800">Ex : {reasoningApproaches.deductive.example}</p>
                  </div>
                  <ol className="space-y-1">
                    {reasoningApproaches.deductive.steps.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center justify-center h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium shrink-0">{i + 1}</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </div>

            {/* Disciplinarités */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Types de disciplinarité</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {disciplinarities.map(d => (
                    <div key={d.term} className={`rounded-lg border p-3 ${d.color === 'emerald' ? 'border-emerald-200 bg-emerald-50/50' : d.color === 'sky' ? 'border-sky-200 bg-sky-50/50' : 'border-border'}`}>
                      <p className="text-sm font-medium">{d.term}</p>
                      <p className="text-xs text-muted-foreground mt-1">{d.definition}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Problématique ── */}
        <TabsContent value="problematique" className="mt-4">
          <div className="space-y-6">
            {/* QUOI / COMMENT / POURQUOI */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-amber-600" />
                  La problématique — Trois questions essentielles
                </CardTitle>
                <CardDescription>La problématique est la question de recherche, incluse dans l&apos;introduction. Elle doit déterminer un cadre spatial et/ou temporel.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {problematiqueGuide.map((p, i) => (
                    <div key={p.id} className="rounded-lg border p-4 space-y-2">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-amber-100 text-amber-700 shrink-0 text-sm font-bold">
                        {p.question}
                      </div>
                      <p className="text-xs text-muted-foreground">{p.description}</p>
                      <div className="bg-amber-50 rounded p-2">
                        <p className="text-xs italic text-amber-800">{p.example}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Conseils problématique */}
            <Card className="border-amber-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  Conseils pour une bonne problématique
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {problematiqueConseils.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Opérationnalisation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{operationalisationConcept.title}</CardTitle>
                <CardDescription>{operationalisationConcept.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground italic">« Le cadre opératoire forme un élément central du travail de recherche dans la mesure où il spécifie ce que nous allons analyser précisément pour vérifier notre hypothèse. » — Gordon MACE</p>
                <div className="relative">
                  <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-sky-200" />
                  <div className="space-y-3">
                    {operationalisationConcept.steps.map((s, i) => (
                      <div key={i} className="flex gap-3 relative">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-sky-100 text-sky-700 shrink-0 z-10 text-xs font-bold">{i + 1}</div>
                        <p className="text-sm text-muted-foreground flex items-center">{s}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Exemple opérationnalisation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Exemple : {operationalisationExample.concept}</CardTitle>
                <CardDescription>Concept → Dimensions → Indicateurs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {operationalisationExample.dimensions.map((dim, i) => (
                    <div key={i} className="rounded-lg border p-3">
                      <p className="text-sm font-medium">{dim.label}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {dim.indicateurs.map((ind, j) => (
                          <Badge key={j} variant="secondary" className="text-xs">{ind}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Hypothèses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-emerald-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Conditions d&apos;une hypothèse rigoureuse</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {hypothesesConditions.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-sky-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Vérification des hypothèses</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {hypothesesVerification.map((v, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 mt-0.5 text-sky-500" />
                        <span>{v}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Structure de l'introduction */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Structure de l&apos;introduction</CardTitle>
                <CardDescription>C&apos;est la porte d&apos;accès à votre travail — chaque sous-partie doit être présente sans intertitre.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-emerald-200" />
                  <div className="space-y-3">
                    {introductionStructure.map((s, i) => (
                      <div key={i} className="flex gap-3 relative">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 shrink-0 z-10 text-xs font-bold">{i + 1}</div>
                        <div>
                          <p className="text-sm font-medium">{s.step}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{s.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conseils titre */}
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Le titre de recherche</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {titreConseils.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* 8 Questions de l'énoncé du problème */}
          <Card className="border-amber-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-amber-600" />
                8 questions de l'énoncé du problème
              </CardTitle>
              <CardDescription>Un bon énoncé de problème doit répondre à ces 8 questions (Faryadi, 2018).</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {problemStatementQuestions.map((q, i) => (
                  <div key={i} className="rounded-lg border border-amber-100 bg-amber-50/50 p-3">
                    <p className="text-sm font-bold text-amber-800">{q.question}</p>
                    <p className="text-xs text-muted-foreground mt-1">{q.detail}</p>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-3 italic">
                {problemStatementSource}
              </p>
            </CardContent>
          </Card>

          {/* 10 Types de lacunes de recherche */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                10 types de lacunes de recherche
              </CardTitle>
              <CardDescription>Identifier et combler les lacunes est essentiel pour justifier votre recherche (Miles, 2017).</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {researchGaps.map((gap) => (
                  <div key={gap.id} className={`rounded-lg border p-4 space-y-2 ${gap.color}`}>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{gap.name}</p>
                      <Badge variant="outline" className="text-[10px]">{gap.nameEn}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{gap.description}</p>
                    <div>
                      <p className="text-xs font-semibold mb-1">Stratégies :</p>
                      <ul className="space-y-1">
                        {gap.strategies.map((s, j) => (
                          <li key={j} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                            <ArrowRight className="h-3 w-3 shrink-0 mt-0.5 text-emerald-500" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-3 italic">
                {researchGapsSource}
              </p>
            </CardContent>
          </Card>

          {/* Conseils rédaction introduction */}
          <Card className="border-emerald-200 bg-emerald-50/30">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-emerald-600" />
                6 étapes pour rédiger l'introduction
              </CardTitle>
              <CardDescription>Conseils pratiques pour une introduction captivante (Faryadi, 2018).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {introductionWritingTips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-sm text-muted-foreground">{tip}</p>
                  </div>
                ))}
              </div>
              <Separator />
              <div>
                <p className="text-xs font-semibold text-emerald-700 mb-2">Conseils de rédaction :</p>
                <ul className="space-y-1.5">
                  {introductionWritingAdvice.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5 text-emerald-500" />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Opérationnalisation (Baripedia) ── */}
        <TabsContent value="operation" className="mt-4">
          <div className="space-y-4">
            {/* Définition */}
            <Card className="border-sky-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-sky-600" />
                  Des concepts aux mesures
                </CardTitle>
                <CardDescription className="text-xs">{operationalisationBaripedia.source}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{operationalisationBaripedia.definition}</p>
                <div className="rounded-lg bg-sky-50 border border-sky-100 p-3">
                  <p className="text-xs font-medium text-sky-800 mb-1">💡 Idée clé</p>
                  <p className="text-xs text-sky-700">{operationalisationBaripedia.keyIdea}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs italic text-muted-foreground">« {operationalisationBaripedia.quote.text} » — <strong>{operationalisationBaripedia.quote.author}</strong></p>
                </div>
              </CardContent>
            </Card>

            {/* Enjeux */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Enjeux de l'opérationnalisation</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {operationalisationBaripedia.stakes.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Processus de Lazarsfeld - 4 étapes */}
            <Card className="border-emerald-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  Processus de Lazarsfeld : 4 étapes
                </CardTitle>
                <CardDescription className="text-xs">Descente puis remontée dans l'échelle d'abstraction</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {operationalisationBaripedia.lazarsfeldSteps.map((step, i) => (
                  <div key={step.id} className="rounded-lg border p-3 space-y-2">
                    <p className="text-sm font-medium text-emerald-800">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                    <ul className="space-y-1">
                      {step.details.map((d, j) => (
                        <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <ChevronRight className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                    {step.examples && (
                      <div className="mt-2 rounded bg-muted/40 p-2">
                        <p className="text-[11px] font-medium text-muted-foreground mb-1">Exemples :</p>
                        {step.examples.map((ex, j) => (
                          <p key={j} className="text-[11px] text-muted-foreground">• {ex}</p>
                        ))}
                      </div>
                    )}
                    {step.warning && (
                      <div className="mt-2 flex items-start gap-1.5 rounded bg-amber-50 border border-amber-100 p-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-amber-800">{step.warning}</p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Sélection des indicateurs */}
            <Card className="border-violet-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{operationalisationBaripedia.indicatorSelection.title}</CardTitle>
                <CardDescription className="text-xs">Règles et exemples concrets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-1.5">
                  {operationalisationBaripedia.indicatorSelection.rules.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-violet-500 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>

                {/* Simple vs Complexe */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
                    <p className="text-xs font-semibold text-emerald-800">✅ {operationalisationBaripedia.indicatorSelection.simpleVsComplex.simple.label}</p>
                    <p className="text-[11px] text-emerald-700 mt-1">{operationalisationBaripedia.indicatorSelection.simpleVsComplex.simple.rule}</p>
                    <p className="text-[11px] text-muted-foreground italic mt-1">Ex. : {operationalisationBaripedia.indicatorSelection.simpleVsComplex.simple.example}</p>
                  </div>
                  <div className="rounded-lg border border-rose-200 bg-rose-50/50 p-3">
                    <p className="text-xs font-semibold text-rose-800">⚠️ {operationalisationBaripedia.indicatorSelection.simpleVsComplex.complex.label}</p>
                    <p className="text-[11px] text-rose-700 mt-1">{operationalisationBaripedia.indicatorSelection.simpleVsComplex.complex.rule}</p>
                    <p className="text-[11px] text-muted-foreground italic mt-1">Ex. : {operationalisationBaripedia.indicatorSelection.simpleVsComplex.complex.example}</p>
                  </div>
                </div>

                {/* Warning VD */}
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5">
                  <p className="text-[11px] font-medium text-amber-800">⚠️ {operationalisationBaripedia.indicatorSelection.vdWarning}</p>
                </div>

                {/* Exemples concrets */}
                <div className="space-y-2 mt-2">
                  <p className="text-xs font-medium">Exemples concrets :</p>
                  {operationalisationBaripedia.indicatorSelection.examples.map((ex, i) => (
                    <div key={i} className="rounded-lg border p-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold">{ex.concept}</p>
                        <div className="flex flex-wrap gap-1">
                          {ex.indicators.map((ind, j) => (
                            <Badge key={j} variant="secondary" className="text-[10px]">{ind}</Badge>
                          ))}
                        </div>
                      </div>
                      <p className={`text-[11px] mt-1 ${i === 1 ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {i === 1 ? '✅ ' : '⚠️ '}{ex.problem}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Validité et fiabilité */}
            <Card className="border-rose-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{operationalisationBaripedia.measurementErrors.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Validité */}
                  <div className="rounded-lg border p-3 space-y-2">
                    <p className="text-sm font-semibold text-rose-800">{operationalisationBaripedia.measurementErrors.validity.title}</p>
                    <p className="text-xs text-muted-foreground">{operationalisationBaripedia.measurementErrors.validity.definition}</p>
                    <p className="text-[11px] text-muted-foreground italic">📍 {operationalisationBaripedia.measurementErrors.validity.location}</p>
                    <p className="text-[11px] font-medium mt-1">Causes :</p>
                    <ul className="space-y-1">
                      {operationalisationBaripedia.measurementErrors.validity.causes.map((c, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                          <XCircle className="h-3 w-3 text-rose-500 shrink-0 mt-0.5" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Fiabilité */}
                  <div className="rounded-lg border p-3 space-y-2">
                    <p className="text-sm font-semibold text-amber-800">{operationalisationBaripedia.measurementErrors.reliability.title}</p>
                    <p className="text-xs text-muted-foreground">{operationalisationBaripedia.measurementErrors.reliability.definition}</p>
                    <p className="text-[11px] text-muted-foreground italic">📍 {operationalisationBaripedia.measurementErrors.reliability.location}</p>
                    <p className="text-[11px] font-medium mt-1">Causes :</p>
                    <ul className="space-y-1">
                      {operationalisationBaripedia.measurementErrors.reliability.causes.map((c, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                          <XCircle className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Lien validité-fabilité */}
                <div className="rounded-lg bg-sky-50 border border-sky-100 p-3">
                  <p className="text-xs font-medium text-sky-800 mb-1">🔗 Lien validité ↔ fiabilité</p>
                  <p className="text-xs text-sky-700">{operationalisationBaripedia.measurementErrors.relationship}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">📌 <strong>Biais systématiques :</strong> {operationalisationBaripedia.measurementErrors.biases}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Outils de collecte ── */}
        <TabsContent value="outils" className="mt-4">
          <div className="space-y-6">
            <ScrollArea className="max-h-[80vh]">
              <div className="space-y-4 pr-4">
                {collectTools.map(tool => (
                  <Card key={tool.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{tool.title}</CardTitle>
                      <CardDescription className="text-sm">{tool.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Avantages</span>
                          <ul className="mt-2 space-y-1">
                            {tool.avantages.map((a, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                                <ShieldCheck className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                                <span>{a}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-red-600">Limites</span>
                          <ul className="mt-2 space-y-1">
                            {tool.limites.map((l, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                                <XCircle className="h-3 w-3 text-red-400 shrink-0 mt-0.5" />
                                <span>{l}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-sky-600">Conseils pratiques</span>
                        <ul className="mt-2 space-y-1">
                          {tool.conseils.map((c, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                              <ArrowRight className="h-3 w-3 text-sky-500 shrink-0 mt-0.5" />
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        {/* ── Variables ── */}
        <TabsContent value="variables" className="mt-4">
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-4 pr-4">
              <Card className="border-blue-200 bg-blue-50/30">
                <CardContent className="p-4">
                  <p className="text-sm text-blue-800">
                    Les variables sont les caractéristiques ou attributs qui peuvent varier. Elles sont les <strong>briques fondamentales</strong> de la recherche.
                    Choisir le bon type de variable est essentiel pour un <strong>design de recherche solide</strong>, une <strong>mesure précise</strong> et des <strong>résultats valides</strong>.
                  </p>
                </CardContent>
              </Card>

              {/* Legend */}
              <div className="flex flex-wrap gap-2">
                {variableCategories.map((cat) => (
                  <span key={cat.id} className={`text-xs font-medium ${cat.color} flex items-center gap-1`}>
                    <span className={`w-2 h-2 rounded-full ${cat.color === 'text-blue-700' ? 'bg-blue-500' : cat.color === 'text-gray-700' ? 'bg-gray-500' : cat.color === 'text-purple-700' ? 'bg-purple-500' : cat.color === 'text-green-700' ? 'bg-green-500' : 'bg-orange-500'}`} />
                    {cat.label}
                  </span>
                ))}
              </div>

              {/* Variables grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {researchVariables.map((v, i) => (
                  <Card key={i} className={`border ${v.color} overflow-hidden`}>
                    <CardHeader className="pb-2 pt-3 px-3">
                      <CardTitle className="text-xs font-semibold">{v.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 pb-3 space-y-1.5">
                      <p className="text-xs text-muted-foreground">{v.definition}</p>
                      <div className="flex items-start gap-1.5 bg-white/60 rounded px-2 py-1.5">
                        <Lightbulb className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-[11px] italic text-foreground/70">{v.example}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* ── Recherche qualitative ── */}
        <TabsContent value="qualitative" className="mt-4">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-amber-600" />
                  Les 15 étapes de la recherche qualitative
                </CardTitle>
                <CardDescription>Guide complet pour mener une recherche qualitative rigoureuse, de la question de recherche aux conclusions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-amber-200" />
                  <div className="space-y-4">
                    {qualitativeResearchSteps.map((step, i) => (
                      <div key={step.id} className="flex gap-4 relative">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-amber-100 text-amber-700 shrink-0 z-10 text-sm font-bold">
                          {i + 1}
                        </div>
                        <div className="flex-1 pb-2">
                          <h4 className="text-sm font-semibold">{step.title}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                          <ul className="mt-2 space-y-1">
                            {step.details.map((d, j) => (
                              <li key={j} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                                <CheckCircle2 className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                                <span>{d}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Référentiels de thèses ── */}
        <TabsContent value="theses" className="mt-4">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-violet-600" />
                  15 sites gratuits pour télécharger des thèses
                </CardTitle>
                <CardDescription>Répertoires mondiaux de thèses et mémoires en accès ouvert</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {thesisRepositories.map((repo, i) => (
                    <div key={repo.id} className="rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full text-white text-xs font-bold shrink-0" style={{ backgroundColor: repo.color }}>
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium">{repo.name}</p>
                            <Badge variant="outline" className="text-[10px] gap-1">
                              <MapPin className="h-2.5 w-2.5" />{repo.coverage}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] gap-1">
                              <Languages className="h-2.5 w-2.5" />{repo.language}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{repo.description}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <a
                              href={repo.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-sky-600 hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3" /> Accéder
                            </a>
                            <a
                              href={repo.searchUrl.replace('{query}', '')}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-violet-600 hover:underline flex items-center gap-1"
                            >
                              <Search className="h-3 w-3" /> Page de recherche
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Documentation ── */}
        <TabsContent value="documentation" className="mt-4">
          <div className="space-y-6">
            {/* Types de documents */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Types de documents</CardTitle>
                <CardDescription>Il dépend du niveau et de la nature de l&apos;information recherchée.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {documentTypes.map((d, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-md hover:bg-muted/50">
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 mt-0.5 text-sky-500" />
                      <div>
                        <p className="text-sm font-medium">{d.type}</p>
                        <p className="text-xs text-muted-foreground">{d.usage}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bases de données */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Database className="h-5 w-5 text-sky-600" />
                  Bases de données bibliographiques
                </CardTitle>
                <CardDescription>Ensembles structurés de références bibliographiques avec accès au texte intégral.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {databases.map(db => (
                    <div key={db.id} className="rounded-lg border p-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{db.name}</p>
                        <Badge variant="outline" className="text-xs">{db.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{db.description}</p>
                      {db.url && (
                        <a href={db.url} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-600 hover:underline flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" /> Accéder
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Catalogues */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Catalogues de bibliothèques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {catalogs.map(c => (
                    <div key={c.id} className="rounded-lg border p-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{c.name}</p>
                        <Badge variant="outline" className="text-xs">{c.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{c.description}</p>
                      {c.url && (
                        <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-600 hover:underline flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" /> Accéder
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Ressources web */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Search className="h-5 w-5 text-amber-600" />
                  Ressources du Web
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {webResources.map(r => (
                    <div key={r.id} className="rounded-lg border p-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{r.name}</p>
                        <Badge variant="outline" className="text-xs">{r.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{r.description}</p>
                      {r.url && (
                        <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-600 hover:underline flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" /> Accéder
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Corpus d'étude */}
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Le corpus d&apos;étude</CardTitle>
                <CardDescription className="text-xs">L&apos;ensemble fini de textes choisi comme base d&apos;une étude scientifique.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-2">Trois aspects à soigner :</p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="text-xs">Choix du corpus</Badge>
                  <Badge className="text-xs">Constitution du corpus</Badge>
                  <Badge className="text-xs">Utilisation du corpus</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  )
}
