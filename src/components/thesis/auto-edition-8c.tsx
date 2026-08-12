'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  CheckCircle2, Circle, RotateCcw, ChevronDown, ChevronRight,
  ShieldCheck, AlertTriangle, Info, Target, FileCheck, Layers,
  AlignLeft, Eye, Scissors, HeartHandshake, MessageSquare,
} from 'lucide-react'

interface ChecklistItem {
  id: string
  label: string
  diagnostic: string
  checked: boolean
}

interface Dimension8C {
  id: string
  number: string
  title: string
  titleEn: string
  description: string
  icon: React.ElementType
  color: string
  bgColor: string
  borderColor: string
  items: ChecklistItem[]
}

const INITIAL_DIMENSIONS: Dimension8C[] = [
  {
    id: 'conformite',
    number: 'C1',
    title: 'Conformité',
    titleEn: 'Compliance',
    description: 'Le texte respecte-t-il les consignes formelles et la conformité éthique ?',
    icon: FileCheck,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    items: [
      { id: 'conf-1', label: 'Gabarit respecté (marges, police, en-têtes)', diagnostic: 'Le texte suit-il le modèle de la revue ou de l\'institution ?', checked: false },
      { id: 'conf-2', label: 'Conventions terminologiques du champ respectées', diagnostic: 'La terminologie est-elle cohérente avec les usages disciplinaires ?', checked: false },
      { id: 'conf-3', label: 'Conformité éthique documentée (si applicable)', diagnostic: 'Si la recherche implique des sujets humains/animaux, l\'autorisation est-elle déclarée ?', checked: false },
      { id: 'conf-4', label: 'Conflits d\'intérêts déclarés', diagnostic: 'Tout engagement extérieur potentiel est-il mentionné ?', checked: false },
    ],
  },
  {
    id: 'exhaustivite',
    number: 'C2',
    title: 'Exhaustivité',
    titleEn: 'Completeness',
    description: 'Tous les éléments attendus sont-ils présents ?',
    icon: Layers,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    items: [
      { id: 'exh-1', label: 'Détails de méthode suffisants pour réplication', diagnostic: 'Un lecteur pourrait-il reproduire l\'étude ?', checked: false },
      { id: 'exh-2', label: 'Toutes les sections attendues sont présentes', diagnostic: 'Chaque section contient-elle l\'information qu\'elle devrait ?', checked: false },
      { id: 'exh-3', label: 'Les références citées dans le texte sont dans la bibliographie', diagnostic: 'Aucune référence orpheline ni fantôme ?', checked: false },
    ],
  },
  {
    id: 'composition',
    number: 'C3',
    title: 'Composition',
    titleEn: 'Composition',
    description: 'La structure d\'ensemble et l\'organisation logique sont-elles appropriées ?',
    icon: Target,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    items: [
      { id: 'comp-1', label: 'Chaque section organisée logiquement', diagnostic: 'Les paragraphes suivent-ils un ordre logique ?', checked: false },
      { id: 'comp-2', label: 'Phrase d\'ancrage claire au début de chaque paragraphe', diagnostic: 'Chaque paragraphe commence-t-il par son idée principale ?', checked: false },
      { id: 'comp-3', label: 'Transition naturelle d\'une idée à la suivante', diagnostic: 'Le lecteur peut-il suivre le fil sans effort ?', checked: false },
    ],
  },
  {
    id: 'exactitude',
    number: 'C4',
    title: 'Exactitude',
    titleEn: 'Correctness',
    description: 'L\'information est-elle correcte et le raisonnement valide ?',
    icon: ShieldCheck,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    items: [
      { id: 'exact-1', label: 'Chiffres cohérents texte / tableaux / figures', diagnostic: 'Les mêmes données numériques sont-elles identiques partout ?', checked: false },
      { id: 'exact-2', label: 'Références complètes et correctes', diagnostic: 'Les noms d\'auteurs, dates, titres sont-ils exacts ?', checked: false },
      { id: 'exact-3', label: 'Raisonnement valide de bout en bout', diagnostic: 'Y a-t-il des sauts logiques ou des non sequitur ?', checked: false },
      { id: 'exact-4', label: 'Grammaire, orthographe et ponctuation correctes', diagnostic: 'Le texte a-t-il été vérifié (LanguageTool / Harper) ?', checked: false },
    ],
  },
  {
    id: 'clarte',
    number: 'C5',
    title: 'Clarté',
    titleEn: 'Clarity',
    description: 'Le texte est-il lisible et sans ambiguïté ?',
    icon: Eye,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    items: [
      { id: 'clar-1', label: 'Termes ambigus définis à la première occurrence', diagnostic: 'Le lecteur non-spécialiste peut-il comprendre chaque terme technique ?', checked: false },
      { id: 'clar-2', label: 'Abréviations explicitées au premier usage', diagnostic: 'Chaque abréviation est-elle suivie de sa forme complète ?', checked: false },
      { id: 'clar-3', label: 'Antécédents des pronoms toujours identifiables', diagnostic: 'Chaque « il », « ce », « cela » renvoie-t-il clairement à son référent ?', checked: false },
      { id: 'clar-4', label: 'Phrases trop longues ou complexes restructurées', diagnostic: 'Y a-t-il des phrases de plus de 3 lignes qui pourraient être coupées ?', checked: false },
    ],
  },
  {
    id: 'coherence',
    number: 'C6',
    title: 'Cohérence',
    titleEn: 'Consistency',
    description: 'L\'information est-elle cohérente d\'un bout à l\'autre ?',
    icon: AlignLeft,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    items: [
      { id: 'coh-1', label: 'Chiffres identiques dans le texte et dans les tableaux', diagnostic: 'Pas d\'écart entre une valeur dans le corps et dans un tableau ?', checked: false },
      { id: 'coh-2', label: 'Résumé correspond exactement au corps du texte', diagnostic: 'Le résumé ne contient-il aucune information absente du corps ?', checked: false },
      { id: 'coh-3', label: 'Terminologie stable (pas de synonymes flottants)', diagnostic: 'Un même concept est-il toujours désigné par le même terme ?', checked: false },
    ],
  },
  {
    id: 'concision',
    number: 'C7',
    title: 'Concision',
    titleEn: 'Conciseness',
    description: 'Y a-t-il des redondances ou du contenu tangentiel ?',
    icon: Scissors,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    items: [
      { id: 'conc-1', label: 'Pas de redondance texte / tableau / figure', diagnostic: 'Le texte reformule-t-il ce qu\'un tableau montre déjà ?', checked: false },
      { id: 'conc-2', label: 'Tournures verbeuses condensées quand possible', diagnostic: 'Y a-t-il des « il est important de noter que » remplaçables ?', checked: false },
      { id: 'conc-3', label: 'La concision ne nuit pas à la clarté', diagnostic: 'Chaque coupe proposée préserve-t-elle le sens ?', checked: false },
    ],
  },
  {
    id: 'courtoisie',
    number: 'C8',
    title: 'Courtoisie',
    titleEn: 'Courtesy',
    description: 'Le ton envers les travaux antérieurs reste-t-il neutre et respectueux ?',
    icon: HeartHandshake,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    items: [
      { id: 'court-1', label: 'Ton neutre envers les travaux antérieurs', diagnostic: 'Pas de formulation dépréciative type « les auteurs ont échoué à » ?', checked: false },
      { id: 'court-2', label: 'Langage inclusif et respectueux', diagnostic: 'Les groupes de population sont-ils nommés avec les termes actuels ?', checked: false },
    ],
  },
]

const ARTICLE_CHECKLIST_ITEMS = [
  { id: 'art-1', label: 'Le titre reflète-t-il fidèlement et de façon concise le contenu ?', checked: false },
  { id: 'art-2', label: 'Le résumé correspond-il exactement au corps du texte, dans une longueur appropriée ?', checked: false },
  { id: 'art-3', label: 'L\'introduction fournit-elle un contexte suffisant et indique-t-elle clairement le vide comblé ?', checked: false },
  { id: 'art-4', label: 'La section méthode permet-elle une réplication ET une évaluation critique ?', checked: false },
  { id: 'art-5', label: 'Les résultats sont-ils présentés dans un ordre logique, avec un niveau de détail approprié ?', checked: false },
  { id: 'art-6', label: 'La discussion répond-elle explicitement aux questions posées dans l\'introduction ?', checked: false },
  { id: 'art-7', label: 'Tous les auteurs sont-ils listés, les contributions annexes correctement remerciées ?', checked: false },
]

export default function AutoEdition8C() {
  const [dimensions, setDimensions] = useState<Dimension8C[]>(INITIAL_DIMENSIONS)
  const [articleChecklist, setArticleChecklist] = useState(ARTICLE_CHECKLIST_ITEMS)
  const [expandedDims, setExpandedDims] = useState<Set<string>>(new Set(['conformite']))
  const [showArticle, setShowArticle] = useState(false)

  const toggleItem = useCallback((dimId: string, itemId: string) => {
    setDimensions(prev => prev.map(d => {
      if (d.id !== dimId) return d
      return {
        ...d,
        items: d.items.map(item =>
          item.id === itemId ? { ...item, checked: !item.checked } : item
        ),
      }
    }))
  }, [])

  const toggleArticleItem = useCallback((itemId: string) => {
    setArticleChecklist(prev =>
      prev.map(item => item.id === itemId ? { ...item, checked: !item.checked } : item)
    )
  }, [])

  const toggleExpand = useCallback((dimId: string) => {
    setExpandedDims(prev => {
      const next = new Set(prev)
      if (next.has(dimId)) next.delete(dimId)
      else next.add(dimId)
      return next
    })
  }, [])

  const resetAll = useCallback(() => {
    setDimensions(INITIAL_DIMENSIONS)
    setArticleChecklist(ARTICLE_CHECKLIST_ITEMS)
  }, [])

  // Compute progress
  const totalItems = dimensions.reduce((s, d) => s + d.items.length, 0) + articleChecklist.length
  const checkedItems = dimensions.reduce((s, d) => s + d.items.filter(i => i.checked).length, 0) + articleChecklist.filter(i => i.checked).length
  const progressPct = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0

  // Per-dimension progress
  const dimProgress = (d: Dimension8C) => {
    const total = d.items.length
    const checked = d.items.filter(i => i.checked).length
    return { total, checked, pct: total > 0 ? Math.round((checked / total) * 100) : 0 }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header with global progress */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 border-emerald-200">
            {checkedItems}/{totalItems} vérifiés
          </Badge>
          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-500 font-medium">{progressPct}%</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowArticle(!showArticle)}
            className="gap-1.5 text-[11px] h-7"
          >
            <MessageSquare className="h-3 w-3" />
            {showArticle ? '8C' : 'Article'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetAll}
            className="gap-1.5 text-[11px] h-7 text-slate-500 hover:text-red-600"
          >
            <RotateCcw className="h-3 w-3" />Réinitialiser
          </Button>
        </div>
      </div>

      {progressPct === 100 && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="font-medium">Tous les points ont été vérifiés — votre texte est prêt pour soumission.</span>
        </div>
      )}

      {showArticle ? (
        /* ── Article scientific checklist ── */
        <ScrollArea className="h-[60vh]">
          <div className="space-y-3 pr-3">
            <div className="p-3 bg-slate-50 border rounded-lg">
              <h3 className="text-xs font-semibold text-slate-700 mb-1">Checklist de pré-soumission d\'article</h3>
              <p className="text-[10px] text-slate-500">Vérifiez chaque point avant de soumettre votre manuscrit.</p>
            </div>
            {articleChecklist.map(item => (
              <button
                key={item.id}
                onClick={() => toggleArticleItem(item.id)}
                className={`w-full flex items-start gap-3 p-3 rounded-lg border transition-all text-left ${
                  item.checked
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {item.checked
                  ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  : <Circle className="h-4 w-4 text-slate-300 mt-0.5 shrink-0" />
                }
                <span className={`text-xs leading-relaxed ${item.checked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{item.label}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      ) : (
        /* ── 8 Dimensions ── */
        <ScrollArea className="h-[60vh]">
          <div className="space-y-2 pr-3">
            {dimensions.map(dim => {
              const p = dimProgress(dim)
              const isExpanded = expandedDims.has(dim.id)
              const IconComp = dim.icon
              return (
                <Card key={dim.id} className={`border ${dim.borderColor} overflow-hidden`}>
                  <button
                    className="w-full text-left"
                    onClick={() => toggleExpand(dim.id)}
                  >
                    <CardHeader className="p-3 pb-2">
                      <div className="flex items-center gap-2">
                        <div className={`${dim.bgColor} p-1.5 rounded-lg`}><IconComp className={`h-3.5 w-3.5 ${dim.color}`} /></div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                            <span className={`${dim.color} font-bold`}>{dim.number}</span>
                            {dim.title}
                            <span className="text-[9px] text-slate-400 font-normal normal-case">{dim.titleEn}</span>
                          </CardTitle>
                          <p className="text-[10px] text-slate-500 mt-0.5 truncate">{dim.description}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {p.checked === p.total && p.total > 0 ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : p.checked > 0 ? (
                            <AlertTriangle className="h-4 w-4 text-amber-400" />
                          ) : (
                            <Circle className="h-4 w-4 text-slate-200" />
                          )}
                          {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
                        </div>
                      </div>
                      {/* Mini progress bar */}
                      <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${p.pct === 100 ? 'bg-emerald-400' : 'bg-slate-300'}`}
                          style={{ width: `${p.pct}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-slate-400 mt-1 block">{p.checked}/{p.total}</span>
                    </CardHeader>
                  </button>
                  {isExpanded && (
                    <CardContent className="px-3 pb-3 pt-0 space-y-1.5">
                      {dim.items.map(item => (
                        <button
                          key={item.id}
                          onClick={() => toggleItem(dim.id, item.id)}
                          className={`w-full flex items-start gap-2.5 p-2.5 rounded-lg border transition-all text-left ${
                            item.checked
                              ? 'bg-emerald-50/30 border-emerald-100'
                              : 'bg-white border-slate-100 hover:border-slate-200'
                          }`}
                        >
                          {item.checked
                            ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                            : <Circle className="h-3.5 w-3.5 text-slate-300 mt-0.5 shrink-0" />
                          }
                          <div className="flex-1 min-w-0">
                            <span className={`text-[11px] leading-relaxed block ${item.checked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{item.label}</span>
                            <span className="text-[9px] text-slate-400 italic block mt-0.5">{item.diagnostic}</span>
                          </div>
                        </button>
                      ))}
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>
        </ScrollArea>
      )}

      {/* Source */}
      <p className="text-[9px] text-slate-400 text-center">
        Cadre des 8C — Adapté de Gastel & Day, <em>How to Write and Publish a Scientific Paper</em> (9e éd., 2022)
      </p>
    </div>
  )
}
