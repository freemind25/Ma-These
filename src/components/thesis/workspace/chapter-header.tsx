'use client'

import { createElement } from 'react'
import {
  FileText, BookOpen, FlaskConical, BarChart3, MessageSquare, GraduationCap,
  Menu, Loader2, Check, PanelRightOpen, PanelRightClose, Sparkles,
} from 'lucide-react'
import DictationButton, { type DictationContext } from './dictation-button'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { ChapterData, PartData } from '@/types/thesis'
import type { ChapterStructure } from '@/data/chapters-structure'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText, BookOpen, FlaskConical, BarChart3, MessageSquare, GraduationCap,
}

const STATUS_CONFIG: Record<string, { dot: string; label: string }> = {
  draft:      { dot: 'bg-slate-300', label: 'Brouillon' },
  in_progress: { dot: 'bg-amber-400', label: 'En cours' },
  submitted:  { dot: 'bg-sky-400',   label: 'Soumis' },
  revised:    { dot: 'bg-emerald-400', label: 'Révisé' },
}

interface ColorSet {
  light: string
  text: string
  bg: string
  border: string
  accent: string
}

interface ChapterHeaderProps {
  isMobile: boolean
  onOpenSidebar: () => void
  chapterMeta: ChapterStructure | undefined
  colors: ColorSet
  activeChapter: ChapterData | undefined
  activePart: PartData | null
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
  helpOpen: boolean
  onToggleHelp: () => void
  onDictated?: (text: string) => void
  /** Currently selected text in the editor (for voice edit mode) */
 selectedText?: string
  /** Full chapter content (for surrounding context extraction) */
 chapterContent?: string
  /** Callback to replace selected text with transformed text */
 onReplaceSelection?: (original: string, transformed: string) => void
}

export default function ChapterHeader({
  isMobile, onOpenSidebar, chapterMeta, colors, activeChapter, activePart, saveStatus, helpOpen, onToggleHelp, onDictated,
  selectedText, chapterContent, onReplaceSelection,
}: ChapterHeaderProps) {
  const isPartsMode = !!activePart
  const isCustom = !chapterMeta
  const Icon = chapterMeta?.icon ? (ICON_MAP[chapterMeta.icon] || FileText) : FileText
  const statusCfg = STATUS_CONFIG[activeChapter?.status || 'draft']

  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center gap-3.5 shrink-0 z-20">
      {isMobile && (
        <button onClick={onOpenSidebar} className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors">
          <Menu className="h-4.5 w-4.5" />
        </button>
      )}

      {/* Chapter icon with color accent */}
      <div className={cn(
        'flex items-center justify-center w-10 h-10 rounded-xl shrink-0 shadow-sm',
        chapterMeta ? `${colors.bg} text-white` : 'bg-slate-100 text-slate-500',
      )}>
        {createElement(Icon, { className: 'h-5 w-5' })}
      </div>

      {/* Title & description */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            {isCustom || isPartsMode
              ? `${activeChapter?.number || ''}. ${activeChapter?.title || 'Chapitre sans titre'}`
              : `Chapitre ${chapterMeta.number}. ${chapterMeta.title}`}
          </h2>
          {isPartsMode && (
            <Badge variant="outline" className="text-[10px] border-emerald-300 text-emerald-600 font-medium">{activePart.title}</Badge>
          )}
          {isCustom && (
            <Badge variant="outline" className="text-[10px] border-slate-300 text-slate-500 font-medium">Personnalisé</Badge>
          )}
        </div>
        <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">
          {isCustom
            ? 'Chapitre personnalisé — structure libre'
            : chapterMeta?.description}
        </p>
      </div>

      {/* Status + word count + save */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Status pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200">
          <div className={cn('h-2 w-2 rounded-full', statusCfg.dot)} />
          <span className="text-[10px] font-medium text-slate-600">{statusCfg.label}</span>
        </div>

        {/* Word count */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-semibold text-slate-700 tabular-nums">
            {(activeChapter?.wordCount || 0).toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400">mots</span>
        </div>

        {/* Save indicator */}
        {saveStatus === 'saving' && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-600">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span className="text-[10px] font-medium hidden sm:inline">Sauvegarde…</span>
          </div>
        )}
        {saveStatus === 'saved' && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">
            <Check className="h-3 w-3" />
            <span className="text-[10px] font-medium hidden sm:inline">Sauvegardé</span>
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 text-red-600">
            <span className="text-[10px] font-medium hidden sm:inline">Erreur</span>
          </div>
        )}
      </div>

      {/* Dictation button */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[10px] text-slate-400 hidden md:inline">Dictée</span>
        <DictationButton
          onTranscribed={onDictated || (() => {})}
          onEditText={onReplaceSelection
            ? (sel, _instr, result) => onReplaceSelection(sel, result)
            : undefined
          }
          selectedText={selectedText}
          chapterContext={{
            chapterTitle: chapterMeta?.title || activeChapter?.title,
            chapterNumber: chapterMeta?.number || activeChapter?.number,
            surroundingText: chapterContent,
            language: 'fr',
          }}
        />
      </div>

      {/* Help panel toggle */}
      <button
        onClick={onToggleHelp}
        className={cn(
          'p-2 rounded-xl transition-colors border',
          helpOpen
            ? 'bg-slate-100 text-slate-700 border-slate-200'
            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50 border-transparent',
        )}
        title={helpOpen ? 'Fermer le panneau d\'aide' : "Ouvrir l'aide IA"}
      >
        {helpOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
      </button>
    </header>
  )
}
