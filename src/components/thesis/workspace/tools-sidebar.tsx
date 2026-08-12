'use client'

import { useState } from 'react'
import {
  MessageSquare, X, Library, BookOpen, Download, Search,
  Scale, Cloud, Newspaper, Layers, LayoutTemplate,
  PenLine, SpellCheck, ShieldCheck, PenTool, ToggleLeft,
  GraduationCap, Compass, FileSpreadsheet, Zap, Brain, Map, PencilRuler, BookCheck,
  KeyRound, ShieldAlert, FolderTree, ListChecks, ClipboardList, BarChart3, Box,
  CircleHelp, ClipboardCheck, BookMarked,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import type { ThesisData } from '@/types/thesis'

const TOOLS = [
  { icon: CircleHelp, label: 'Notice d\'utilisation', key: 'usageGuide' },
  { icon: Compass, label: 'Cadrage projet', key: 'cadrage' },
  { icon: MessageSquare, label: 'Assistant IA', key: 'assistant' },
  { icon: GraduationCap, label: 'Directeur IA', key: 'directeur' },
  { icon: Library, label: 'Références biblio.', key: 'refs' },
  { icon: BookOpen, label: 'Guide rédaction', key: 'resources' },
  { icon: Download, label: 'Export PDF', key: 'export' },
  { icon: KeyRound, label: 'Licences', key: 'licenseAdmin' },
  { icon: Search, label: 'Recherche litt.', key: 'literature' },
  { icon: Scale, label: 'Équilibre chapitres', key: 'balance' },
  { icon: Cloud, label: 'Sauvegarde cloud', key: 'cloudDrive' },
  { icon: Newspaper, label: 'Journaux OA', key: 'journalFinder' },
  { icon: PenLine, label: 'Diagrammes', key: 'excalidraw' },
  { icon: SpellCheck, label: 'Grammaire (LT)', key: 'grammar' },
  { icon: ShieldCheck, label: 'Harper (style)', key: 'harper' },
  { icon: ListChecks, label: 'Auto-édition 8C', key: 'autoEdition' },
  { icon: PenTool, label: 'Recherche thèse', key: 'search' },
  { icon: FileSpreadsheet, label: 'Export Word/PPT', key: 'office' },
  { icon: Zap, label: 'Automatisation', key: 'automation' },
  { icon: Brain, label: 'Recherche Agrégée', key: 'ithyResearch' },
  { icon: Map, label: 'Route Agile', key: 'agileRoadmap' },
  { icon: PencilRuler, label: 'Déblocage écriture', key: 'writingUnblock' },
  { icon: BookCheck, label: 'Livres-compétences', key: 'bookSkills' },
  { icon: FolderTree, label: 'Ressources recherche', key: 'researchResources' },
  { icon: ClipboardList, label: 'Analyse champ rech.', key: 'fieldAnalysis' },
  { icon: BarChart3, label: 'APA Results Composer', key: 'apaComposer' },
  { icon: ListChecks, label: 'Outils SLR', key: 'slrProtocol' },
  { icon: BookOpen, label: 'Boîte doctorale', key: 'doctoralToolkit' },
  { icon: Box, label: 'Box Cloud', key: 'boxDrive' },
  { icon: Zap, label: 'RoutesMe API', key: 'routesMe' },
  { icon: ClipboardCheck, label: 'Vérif. méthodol.', key: 'verification' },
  { icon: BookMarked, label: 'Onglet Recherche', key: 'recherche' },
] as const

interface ToolsSidebarProps {
  thesis: ThesisData
  totalWords: number
  sidebarOpen: boolean
  onCloseSidebar: () => void
  isMobile: boolean
  editorMode: 'rich' | 'plain'
  onOpenAssistant: () => void
  onOpenDirecteur: () => void
  onOpenRefs: () => void
  onOpenResources: () => void
  onOpenExport: () => void
  onOpenLiterature: () => void
  onOpenBalance: () => void
  onOpenCloudDrive: () => void
  onOpenJournalFinder: () => void
  onOpenExcalidraw: () => void
  onOpenGrammar: () => void
  onOpenHarper: () => void
  onOpenAutoEdition: () => void
  onOpenSearch: () => void
  onOpenCadrage: () => void
  onOpenOffice: () => void
  onOpenAutomation: () => void
  onOpenIthyResearch: () => void
  onOpenAgileRoadmap: () => void
  onOpenWritingUnblock: () => void
  onOpenBookSkills: () => void
  onOpenResearchResources: () => void
  onOpenFieldAnalysis: () => void
  onOpenApaComposer: () => void
  onOpenSlrProtocol: () => void
  onOpenDoctoralToolkit: () => void
  onOpenBoxDrive: () => void
  onOpenUsageGuide: () => void
  onOpenLicenseAdmin: () => void
  onOpenAuthProviders: () => void
  onOpenRoutesMe: () => void
  onOpenVerification: () => void
  onOpenRecherche: () => void
  onToggleEditorMode: () => void
  // Structure
  onSwitchMode: (mode: 'chapters' | 'parts') => void
  onOpenTemplates: () => void
}

export default function ToolsSidebar({
  thesis, totalWords, sidebarOpen, onCloseSidebar, isMobile, editorMode,
  onOpenAssistant, onOpenDirecteur, onOpenRefs, onOpenResources, onOpenExport, onOpenLiterature,
  onOpenBalance, onOpenCloudDrive, onOpenJournalFinder,
  onOpenExcalidraw, onOpenGrammar, onOpenHarper, onOpenAutoEdition, onOpenSearch,
  onOpenCadrage, onOpenOffice, onOpenAutomation, onOpenIthyResearch, onOpenAgileRoadmap, onOpenWritingUnblock, onOpenBookSkills, onOpenResearchResources, onOpenFieldAnalysis, onOpenApaComposer, onOpenSlrProtocol, onOpenDoctoralToolkit, onOpenBoxDrive, onOpenUsageGuide, onOpenLicenseAdmin, onOpenAuthProviders, onOpenRoutesMe, onOpenVerification, onOpenRecherche, onToggleEditorMode, onSwitchMode, onOpenTemplates,
}: ToolsSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  const toolActions: Record<string, () => void> = {
    assistant: onOpenAssistant,
    directeur: onOpenDirecteur,
    refs: onOpenRefs,
    resources: onOpenResources,
    export: onOpenExport,
    literature: onOpenLiterature,
    balance: onOpenBalance,
    cloudDrive: onOpenCloudDrive,
    journalFinder: onOpenJournalFinder,
    excalidraw: onOpenExcalidraw,
    grammar: onOpenGrammar,
    harper: onOpenHarper,
    autoEdition: onOpenAutoEdition,
    search: onOpenSearch,
    cadrage: onOpenCadrage,
    office: onOpenOffice,
    automation: onOpenAutomation,
    ithyResearch: onOpenIthyResearch,
    agileRoadmap: onOpenAgileRoadmap,
    writingUnblock: onOpenWritingUnblock,
    bookSkills: onOpenBookSkills,
    researchResources: onOpenResearchResources,
    fieldAnalysis: onOpenFieldAnalysis,
    apaComposer: onOpenApaComposer,
    slrProtocol: onOpenSlrProtocol,
    doctoralToolkit: onOpenDoctoralToolkit,
    boxDrive: onOpenBoxDrive,
    usageGuide: onOpenUsageGuide,
    licenseAdmin: onOpenLicenseAdmin,
    authProviders: onOpenAuthProviders,
    routesMe: onOpenRoutesMe,
    verification: onOpenVerification,
    recherche: onOpenRecherche,
  }

  const handleToolClick = (key: string) => {
    const action = toolActions[key]
    if (action) action()
  }

  const isPartsMode = thesis.structureMode === 'parts'

  // On mobile, use overlay sidebar
  if (isMobile) {
    return (
      <>
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30" onClick={onCloseSidebar} />
        )}
        <aside className={cn(
          'fixed top-0 left-0 h-full bg-slate-900 border-r border-slate-800 flex flex-col z-40 w-64 transition-transform duration-300 shadow-2xl',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}>
          <div className="flex items-center gap-3 px-3 py-4 mb-2">
            <img src="/logo.png" alt="ThesisFrame" className="w-9 h-9 rounded-xl object-contain shrink-0 shadow-[0_0_16px_rgba(16,185,129,0.2)]" />
            <div className="overflow-hidden flex-1">
              <h1 className="font-bold text-sm text-white tracking-tight leading-tight">ThesisFrame</h1>
              <p className="text-[10px] text-emerald-400 font-medium truncate">{thesis.title}</p>
            </div>
            <button onClick={onCloseSidebar} className="text-slate-400 hover:text-white p-1"><X className="h-4 w-4" /></button>
          </div>
          <div className="px-3 pb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-500 font-medium">PROGRESSION</span>
              <span className="text-[10px] text-emerald-400 font-bold">{totalWords.toLocaleString()} mots</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (totalWords / 80000) * 100)}%` }} />
            </div>
          </div>
          <Separator className="bg-slate-800" />
          <div className="shrink-0 px-3 pt-2 pb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Outils</span>
          </div>
          <div className="flex-1 overflow-y-auto min-h-0 px-2 pb-3 space-y-0.5">
            {TOOLS.map(t => (
              <button key={t.key} onClick={() => handleToolClick(t.key)} className="w-full p-2 flex items-center gap-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all text-xs">
                <t.icon className="h-3.5 w-3.5" /><span>{t.label}</span>
              </button>
            ))}
            <button onClick={onToggleEditorMode} className="w-full p-2 flex items-center gap-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all text-xs">
              <ToggleLeft className="h-3.5 w-3.5" /><span>Éditeur {editorMode === 'rich' ? '→ Texte' : '→ Riche'}</span>
            </button>
          </div>
        </aside>
      </>
    )
  }

  // Desktop: collapsible tools sidebar
  return (
    <aside className={cn(
      'bg-slate-900 border-r border-slate-800 flex flex-col z-40 shrink-0 transition-all duration-300',
      collapsed ? 'w-14' : 'w-56',
    )}>
      {/* Brand */}
      <div className={cn('flex items-center gap-3 px-3 py-4 mb-2', collapsed && 'justify-center px-0')
      }>
        <img src="/logo.png" alt="ThesisFrame" className="w-9 h-9 rounded-xl object-contain shrink-0 shadow-[0_0_16px_rgba(16,185,129,0.2)]" />
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-bold text-sm text-white tracking-tight leading-tight">ThesisFrame</h1>
            <p className="text-[10px] text-emerald-400 font-medium truncate">{thesis.title}</p>
          </div>
        )}
      </div>

      {/* Progress */}
      {collapsed ? (
        <div className="flex justify-center pb-3">
          <div className="relative w-8 h-8">
            <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="14" fill="none" stroke="#1e293b" strokeWidth="3" />
              <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 14}`}
                strokeDashoffset={`${2 * Math.PI * 14 * (1 - Math.min(1, totalWords / 80000))}`}
                className="transition-all duration-500" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[7px] font-bold text-emerald-400">{Math.round((totalWords / 80000) * 100)}%</span>
          </div>
        </div>
      ) : (
        <div className="px-3 pb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-500 font-medium">PROGRESSION</span>
            <span className="text-[10px] text-emerald-400 font-bold">{totalWords.toLocaleString()} mots</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (totalWords / 80000) * 100)}%` }} />
          </div>
        </div>
      )}

      <Separator className="bg-slate-800" />

      {/* Tools section */}
      {!collapsed && (
        <div className="shrink-0 px-3 pt-2 pb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Outils</span>
        </div>
      )}

      <div className={cn('flex-1 overflow-y-auto min-h-0', collapsed ? 'px-2 py-2 space-y-1' : 'px-2 pb-3 space-y-0.5')}>
        {TOOLS.map(t => (
          <button
            key={t.key}
            onClick={() => handleToolClick(t.key)}
            title={collapsed ? t.label : undefined}
            className={cn(
              'flex items-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all',
              collapsed ? 'p-2 justify-center' : 'w-full p-2 gap-2.5 text-xs',
            )}
          >
            <t.icon className="h-3.5 w-3.5 shrink-0" />
            {!collapsed && <span>{t.label}</span>}
          </button>
        ))}
        <button
          onClick={onToggleEditorMode}
          title={collapsed ? (editorMode === 'rich' ? 'Basculer en mode texte' : 'Basculer en mode riche') : undefined}
          className={cn(
            'flex items-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all',
            collapsed ? 'p-2 justify-center' : 'w-full p-2 gap-2.5 text-xs',
          )}
        >
          <ToggleLeft className="h-3.5 w-3.5 shrink-0" />
          {!collapsed && <span>Éditeur {editorMode === 'rich' ? '→ Texte' : '→ Riche'}</span>}
        </button>
      </div>

      <Separator className="bg-slate-800" />

      {/* Structure actions */}
      {!collapsed && (
        <div className="shrink-0 px-3 pt-2 pb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Structure</span>
        </div>
      )}
      <div className={cn('shrink-0 px-2 pb-3 space-y-0.5', collapsed && 'flex flex-col items-center gap-1 pb-2')}>
        <button
          onClick={() => onSwitchMode(isPartsMode ? 'chapters' : 'parts')}
          title={collapsed ? (isPartsMode ? 'Mode chapitres' : 'Mode parties') : undefined}
          className={cn(
            'flex items-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all',
            collapsed ? 'p-2 justify-center' : 'w-full p-2 gap-2.5 text-xs',
          )}
        >
          <Layers className="h-3.5 w-3.5 shrink-0" />
          {!collapsed && <span>{isPartsMode ? 'Mode chapitres' : 'Mode parties'}</span>}
        </button>
        <button
          onClick={onOpenTemplates}
          title={collapsed ? 'Modèles de structure' : undefined}
          className={cn(
            'flex items-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all',
            collapsed ? 'p-2 justify-center' : 'w-full p-2 gap-2.5 text-xs',
          )}
        >
          <LayoutTemplate className="h-3.5 w-3.5 shrink-0" />
          {!collapsed && <span>Modèles</span>}
        </button>
      </div>

      {/* User + Collapse */}
      <div className="shrink-0 border-t border-slate-800">
        {!collapsed && (
          <div className="p-3">
            <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-700/40 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-[10px] ring-2 ring-emerald-500/30 shrink-0">DR</div>
              <div className="overflow-hidden flex-1">
                <div className="text-[10px] font-medium text-slate-200 truncate">{thesis.author}</div>
                <div className="text-[9px] text-slate-500 truncate">{thesis.university}</div>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full py-2 flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-colors"
          title={collapsed ? 'Développer' : 'Réduire'}
        >
          <svg className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
      </div>
    </aside>
  )
}
