'use client'

import {
  FlaskConical,
  Lightbulb,
  Scale,
  FileText,
  Search,
  Link,
  GitCompareArrows,
  LayoutGrid,
  ClipboardCheck,
  ShieldAlert,
  Gauge,
  AlertTriangle,
  ArrowRight,
  GitBranch,
  FolderOpen,
  File,
  FileSpreadsheet,
} from 'lucide-react'

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'

import {
  SCIENTIFIC_ANALYSIS_PROTOCOLS,
  REVIEW_TYPES,
  DEPTH_LEVELS,
  DELIVERABLE_STRUCTURE,
  type Protocol,
} from '@/data/scientific-analysis-protocols'
import {
  QUALITY_GRIDS,
  BIAS_RISK_LEVELS,
  CERTAINTY_LEVELS,
  CERTAINTY_DEGRADATION_RULES,
} from '@/data/quality-appraisal-grids'

function getColorClasses(color: string): string {
  const map: Record<string, string> = {
    emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300',
    amber: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300',
    orange: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-300',
    red: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300',
    slate: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
  }
  return map[color] ?? map.slate
}

function getStatusBadge(status: Protocol['status']) {
  switch (status) {
    case 'conserve':
      return <Badge variant="secondary">Conservé</Badge>
    case 'renforce':
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300">
          Renforcé
        </Badge>
      )
    case 'ajoute':
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
          Ajouté
        </Badge>
      )
  }
}

const ICON_MAP: Record<string, React.ElementType> = {
  ClipboardCheck,
  LayoutGrid,
  GitCompareArrows,
  Link,
  Search,
  ShieldAlert,
  Scale,
  FileText,
  Lightbulb,
  GitBranch,
  ArrowRight,
  Gauge,
  AlertTriangle,
}

/* ─── Protocoles Tab ─── */
function ProtocolesTab() {
  return (
    <div className="flex flex-col gap-4">
      {SCIENTIFIC_ANALYSIS_PROTOCOLS.map((proto) => {
        const IconComponent = proto.icon ? ICON_MAP[proto.icon] : FileText
        return (
          <Card key={proto.id} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex flex-col gap-4 md:flex-row md:gap-6">
                {/* Left column: number, title, status, description, nouveaute */}
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex items-center justify-center shrink-0 w-11 h-11 rounded-lg bg-muted text-lg font-mono font-bold tabular-nums">
                      {proto.number}
                    </span>
                    <div className="flex items-center gap-2 min-w-0">
                      <h3 className="font-semibold text-base leading-tight truncate">
                        {proto.title}
                      </h3>
                      {getStatusBadge(proto.status)}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {proto.description}
                  </p>

                  {proto.nouveaute && (
                    <Alert className="py-2 px-3 bg-chart-2/40 border-chart-2/60">
                      <Lightbulb className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <AlertDescription className="text-xs">
                        {proto.nouveaute}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Right column: objectif + livrable */}
                <div className="shrink-0 md:w-64 flex flex-col gap-3 text-sm text-muted-foreground">
                  <div>
                    <span className="block text-xs font-medium uppercase tracking-wider mb-1 text-foreground/60">
                      Objectif
                    </span>
                    <p className="leading-relaxed">{proto.objectif}</p>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4 shrink-0" />
                    <span className="font-mono text-xs truncate">{proto.livrable}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

/* ─── Grilles de qualité Tab ─── */
function GrillesQualiteTab() {
  return (
    <div className="flex flex-col gap-8">
      {/* Quality grids */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Grilles par type de design</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {QUALITY_GRIDS.map((grid) => (
            <Card key={grid.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{grid.label}</CardTitle>
                <CardDescription>{grid.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-2.5">
                  {grid.dimensions.map((dim, i) => (
                    <li key={dim.id} className="flex gap-2.5 text-sm">
                      <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-muted text-[11px] font-semibold tabular-nums">
                        {i + 1}
                      </span>
                      <span className="text-muted-foreground leading-relaxed">
                        {dim.question}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* BIAS_RISK_LEVELS */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Niveaux de risque de biais</h3>
        <div className="flex flex-col gap-3">
          {BIAS_RISK_LEVELS.map((level) => (
            <div
              key={level.id}
              className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${getColorClasses(level.color)}`}
            >
              <Badge variant="outline" className={`shrink-0 mt-0.5 border-current/30 ${getColorClasses(level.color).replace(/border-\S+/, '')}`}>
                {level.label}
              </Badge>
              <span className="text-sm leading-relaxed">{level.description}</span>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* CERTAINTY_LEVELS */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Certitude des preuves</h3>
        <div className="flex flex-col gap-3">
          {CERTAINTY_LEVELS.map((level) => (
            <div
              key={level.id}
              className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${getColorClasses(level.color)}`}
            >
              <Badge variant="outline" className={`shrink-0 mt-0.5 border-current/30 ${getColorClasses(level.color).replace(/border-\S+/, '')}`}>
                {level.label}
              </Badge>
              <span className="text-sm leading-relaxed">{level.description}</span>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* CERTAINTY_DEGRADATION_RULES */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Règles de dégradation de la certitude</h3>
        <Card>
          <CardContent className="p-4">
            <ul className="flex flex-col gap-4">
              {CERTAINTY_DEGRADATION_RULES.map((rule, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <ArrowRight className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <div>
                    <span className="font-medium">{rule.condition}</span>
                    <span className="text-muted-foreground"> — {rule.consequence}</span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

/* ─── Cadrage Tab ─── */
function CadrageTab() {
  return (
    <div className="flex flex-col gap-8">
      {/* REVIEW_TYPES */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Types de revue</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {REVIEW_TYPES.map((rt) => (
            <Card key={rt.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{rt.label}</CardTitle>
                  <Badge variant="outline" className="font-mono text-xs">
                    {rt.standard}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{rt.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* DEPTH_LEVELS */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Profondeur d&apos;analyse</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {DEPTH_LEVELS.map((dl) => (
            <Card key={dl.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{dl.label}</CardTitle>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {dl.protocoles} protocoles
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{dl.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* Anti-rationalisation rule */}
      <Alert className="border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/50">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-sm">
          <span className="font-semibold">Règle anti-rationalisation :</span> même si le
          corpus est déjà fourni par l&apos;utilisateur, la Phase 0 (cadrage) doit être
          exécutée — sous une forme allégée de 3 questions fermées. Aucune analyse
          ne peut démarrer sans validation préalable du type de revue, de la question
          PICO(S) et des critères d&apos;inclusion/exclusion.
        </AlertDescription>
      </Alert>
    </div>
  )
}

/* ─── Livrables Tab ─── */
const NEW_ITEMS = new Set([
  '00_Protocole_cadrage.md',
  '05bis_Grille_qualite.md',
  '09bis_Certitude_preuves.md',
  '10_Limites_reflexivite.md',
  'Annexes/Journal_exclusions.md',
  'Annexes/Tableaux_corpus.csv',
  'Annexes/Visualisations_suggerees.md',
  '00_Resume_executif.md',
])

function getFileIcon(name: string): React.ElementType {
  if (name.endsWith('.csv')) return FileSpreadsheet
  return File
}

function LivrablesTab() {
  // Build a tree structure from the flat list
  const rootItems: string[] = []
  const annexesItems: string[] = []

  for (const item of DELIVERABLE_STRUCTURE) {
    if (item.startsWith('Annexes/')) {
      annexesItems.push(item.replace('Annexes/', ''))
    } else {
      rootItems.push(item)
    }
  }

  const renderFile = (
    name: string,
    depth: number,
    isLast: boolean,
    isAnnexteChild: boolean,
    _childIndex: number,
    _totalChildren: number,
  ) => {
    const Icon = getFileIcon(name)
    const isNew = NEW_ITEMS.has(isAnnexteChild ? `Annexes/${name}` : name)

    // Tree connector lines
    const connector = '│   '.repeat(depth)
    const branch = isLast ? '└── ' : '├── '

    return (
      <div key={name} className="flex items-center gap-2 font-mono text-sm">
        <span className="text-muted-foreground/50 select-none shrink-0">
          {connector}{branch}
        </span>
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0">{name}</span>
        {isNew && (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] px-1.5 py-0 ml-1">
            NOUVEAU
          </Badge>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Structure des livrables</CardTitle>
          <CardDescription>
            Arborescence complète des fichiers produits par les 12 protocoles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-1.5 bg-muted/40 rounded-lg p-4 border overflow-x-auto">
            {/* Root folder */}
            <div className="flex items-center gap-2 font-mono text-sm font-medium">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <span>synthese-scientifique/</span>
            </div>

            {/* Root files */}
            {rootItems.map((item, i) =>
              renderFile(item, 0, i === rootItems.length - 1 && annexesItems.length === 0, false, i, rootItems.length),
            )}

            {/* Annexes folder */}
            {annexesItems.length > 0 && (
              <>
                <div className="flex items-center gap-2 font-mono text-sm">
                  <span className="text-muted-foreground/50 select-none">├── </span>
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Annexes/</span>
                </div>
                {annexesItems.map((item, i) =>
                  renderFile(
                    item,
                    1,
                    i === annexesItems.length - 1,
                    true,
                    i,
                    annexesItems.length,
                  ),
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <File className="h-3.5 w-3.5" />
          <span>Fichier Markdown (.md)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <FileSpreadsheet className="h-3.5 w-3.5" />
          <span>Fichier de données (.csv)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <FolderOpen className="h-3.5 w-3.5" />
          <span>Répertoire</span>
        </div>
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] px-1.5 py-0">
          NOUVEAU
        </Badge>
        <span>Ajouté par rapport à la version initiale</span>
      </div>
    </div>
  )
}

/* ─── Main Page ─── */
export function ScientificAnalysisPage() {
  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 p-6">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center shrink-0 w-10 h-10 rounded-lg bg-primary/10">
            <FlaskConical className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Analyse documentaire scientifique
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              12 protocoles pour une synthèse de classe A — traçable, falsifiable et
              pondérée par la qualité des preuves
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="shrink-0 w-fit font-mono">
          12 protocoles
        </Badge>
      </header>

      <Separator />

      {/* Tabs */}
      <Tabs defaultValue="protocoles">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="protocoles" className="flex-1 sm:flex-initial">
            Protocoles
          </TabsTrigger>
          <TabsTrigger value="grilles" className="flex-1 sm:flex-initial">
            Grilles de qualité
          </TabsTrigger>
          <TabsTrigger value="cadrage" className="flex-1 sm:flex-initial">
            Cadrage (Phase 0)
          </TabsTrigger>
          <TabsTrigger value="livrables" className="flex-1 sm:flex-initial">
            Livrables
          </TabsTrigger>
        </TabsList>

        <TabsContent value="protocoles" className="mt-6">
          <ProtocolesTab />
        </TabsContent>

        <TabsContent value="grilles" className="mt-6">
          <GrillesQualiteTab />
        </TabsContent>

        <TabsContent value="cadrage" className="mt-6">
          <CadrageTab />
        </TabsContent>

        <TabsContent value="livrables" className="mt-6">
          <LivrablesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
