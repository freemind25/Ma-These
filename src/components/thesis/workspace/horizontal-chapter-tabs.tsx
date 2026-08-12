'use client'

import { useState, useRef, useEffect } from 'react'
import {
  FileText, BookOpen, FlaskConical, BarChart3, MessageSquare, GraduationCap,
  Plus, ChevronUp, ChevronDown, Trash2, Pencil, Check, FolderOpen, X, MoreHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CHAPTERS, CHAPTER_COLORS } from '@/data/chapters-structure'
import type { ThesisData, PartData, ChapterData } from '@/types/thesis'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText, BookOpen, FlaskConical, BarChart3, MessageSquare, GraduationCap,
}

const STATUS_CONFIG: Record<string, { dot: string; label: string; bg: string }> = {
  draft:      { dot: 'bg-slate-300', label: 'Brouillon', bg: 'bg-slate-50 text-slate-500' },
  in_progress: { dot: 'bg-amber-400', label: 'En cours', bg: 'bg-amber-50 text-amber-600' },
  submitted:  { dot: 'bg-sky-400',   label: 'Soumis', bg: 'bg-sky-50 text-sky-600' },
  revised:    { dot: 'bg-emerald-400', label: 'Révisé', bg: 'bg-emerald-50 text-emerald-600' },
}

interface HorizontalChapterTabsProps {
  thesis: ThesisData
  activeChapterId: string
  onSelectChapter: (id: string) => void
  onAddChapter: (insertAfterOrder: number, partId?: string) => void
  onDeleteChapter: (chapterId: string) => void
  onReorderChapter: (chapterId: string, direction: 'up' | 'down') => void
  onRenameChapter: (chapterId: string, newTitle: string) => void
  onAddPart: () => void
  onDeletePart: (partId: string) => void
  onRenamePart: (partId: string, newTitle: string) => void
}

// ─── Single Chapter Tab (redesigned) ────────────────────
function ChapterTab({
  ch, idx, total, isActive, meta,
  onSelect, onEdit, onDelete, onReorder, onAddAfter,
}: {
  ch: ChapterData; idx: number; total: number
  isActive: boolean; meta: ReturnType<typeof CHAPTERS.find>
  onSelect: () => void
  onEdit: (id: string, title: string) => void
  onDelete: (id: string) => void
  onReorder: (id: string, dir: 'up' | 'down') => void
  onAddAfter: (order: number) => void
}) {
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [confirmDel, setConfirmDel] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const tabRef = useRef<HTMLDivElement>(null)
  const Icon = (meta?.icon && ICON_MAP[meta.icon]) || FileText
  const isCustom = !meta
  const color = meta ? (CHAPTER_COLORS[meta.color] || CHAPTER_COLORS.emerald) : CHAPTER_COLORS.emerald
  const statusCfg = STATUS_CONFIG[ch.status] || STATUS_CONFIG.draft

  useEffect(() => {
    if (!showMenu) return
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showMenu])

  const startEdit = () => { setEditing(true); setEditTitle(ch.title); setShowMenu(false) }
  const confirmEdit = () => { if (editTitle.trim()) onEdit(ch.id, editTitle.trim()); setEditing(false) }
  const handleDel = () => {
    if (confirmDel) { onDelete(ch.id); setConfirmDel(false); setShowMenu(false) }
    else { setConfirmDel(true); setTimeout(() => setConfirmDel(false), 3000) }
  }

  if (editing) {
    return (
      <div className="shrink-0 px-1">
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border-2 border-emerald-400 shadow-lg shadow-emerald-500/10">
          <input
            type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') confirmEdit(); if (e.key === 'Escape') setEditing(false) }}
            onClick={(e) => e.stopPropagation()} autoFocus
            className="text-xs font-medium bg-transparent text-slate-900 w-32 sm:w-44 focus:outline-none"
            placeholder="Titre du chapitre"
          />
          <button onClick={confirmEdit} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg"><Check className="h-3.5 w-3.5" /></button>
          <button onClick={() => setEditing(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg"><X className="h-3.5 w-3.5" /></button>
        </div>
      </div>
    )
  }

  return (
    <div ref={tabRef} className="relative shrink-0 group/tab px-1">
      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect() } }}
        className={cn(
          'relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer border',
          isActive
            ? `${color.bg} text-white border-transparent shadow-md shadow-black/10`
            : `bg-white ${color.text} ${color.border} hover:shadow-sm hover:${color.light} border-slate-200/80`,
        )}
      >
        {/* Colored number badge */}
        <div className={cn(
          'flex items-center justify-center rounded-lg shrink-0 font-bold text-xs',
          isActive
            ? 'bg-white/20 text-white w-7 h-7'
            : `${color.accent} ${color.text} w-7 h-7`,
        )}>
          {ch.number}
        </div>

        {/* Title & status */}
        <div className="flex flex-col min-w-0 gap-0.5">
          <span className={cn(
            'text-xs font-semibold leading-tight truncate max-w-[100px] sm:max-w-[160px]',
            isActive && 'text-white',
          )}>
            {meta?.shortTitle || ch.title}
          </span>
          <div className="flex items-center gap-1.5">
            <div className={cn('h-1.5 w-1.5 rounded-full shrink-0', isActive ? 'bg-white/60' : statusCfg.dot)} />
            <span className={cn('text-[10px] tabular-nums', isActive ? 'text-white/70' : 'text-slate-400')}>
              {ch.wordCount.toLocaleString()} mots
            </span>
          </div>
        </div>

        {/* More button */}
        <button
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
          className={cn(
            'p-1 rounded-lg transition-all',
            showMenu
              ? 'bg-white/20 text-white'
              : isActive
                ? 'opacity-0 group-hover/tab:opacity-100 hover:bg-white/10 text-white/80'
                : 'opacity-0 group-hover/tab:opacity-100 hover:bg-slate-100 text-slate-400',
          )}
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>

        {/* Active bottom indicator */}
        {isActive && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-current opacity-40" />
        )}
      </div>

      {/* Dropdown menu */}
      {showMenu && (
        <div
          ref={menuRef}
          className="absolute top-full right-0 mt-1.5 w-48 bg-white rounded-xl shadow-xl shadow-black/10 border border-slate-200 py-1.5 z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={startEdit} className="w-full px-3 py-2 flex items-center gap-2.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg mx-1 w-[calc(100%-8px)]">
            <Pencil className="h-3.5 w-3.5 text-slate-400" /> Renommer
          </button>
          {idx > 0 && (
            <button onClick={() => { onReorder(ch.id, 'up'); setShowMenu(false) }} className="w-full px-3 py-2 flex items-center gap-2.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg mx-1 w-[calc(100%-8px)]">
              <ChevronUp className="h-3.5 w-3.5 text-slate-400" /> Monter
            </button>
          )}
          {idx < total - 1 && (
            <button onClick={() => { onReorder(ch.id, 'down'); setShowMenu(false) }} className="w-full px-3 py-2 flex items-center gap-2.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg mx-1 w-[calc(100%-8px)]">
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> Descendre
            </button>
          )}
          <button onClick={() => { onAddAfter(ch.order); setShowMenu(false) }} className="w-full px-3 py-2 flex items-center gap-2.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg mx-1 w-[calc(100%-8px)]">
            <Plus className="h-3.5 w-3.5 text-slate-400" /> Ajouter après
          </button>
          <div className="border-t border-slate-100 my-1 mx-2" />
          <button
            onClick={handleDel}
            className={cn(
              'w-full px-3 py-2 flex items-center gap-2.5 text-xs rounded-lg mx-1 w-[calc(100%-8px)] transition-colors',
              confirmDel ? 'text-red-600 bg-red-50' : 'text-red-500 hover:text-red-700 hover:bg-red-50',
            )}
          >
            <Trash2 className="h-3.5 w-3.5" /> {confirmDel ? 'Confirmer la suppression' : 'Supprimer'}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Part Group (horizontal) ────────────────────────────
function PartGroup({
  part, chapters, activeChapterId,
  onRenamePart, onDeletePart, onSelectChapter,
  onAddChapter, onDeleteChapter, onReorderChapter, onRenameChapter,
}: {
  part: PartData; chapters: ChapterData[]; activeChapterId: string
  onRenamePart: (id: string, t: string) => void; onDeletePart: (id: string) => void
  onSelectChapter: (id: string) => void
  onAddChapter: (order: number, partId?: string) => void
  onDeleteChapter: (id: string) => void
  onReorderChapter: (id: string, dir: 'up' | 'down') => void
  onRenameChapter: (id: string, t: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [showPartMenu, setShowPartMenu] = useState(false)
  const partMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showPartMenu) return
    function handleClick(e: MouseEvent) {
      if (partMenuRef.current && !partMenuRef.current.contains(e.target as Node)) setShowPartMenu(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showPartMenu])

  return (
    <div className="flex items-center gap-2.5 shrink-0">
      <div className="relative">
        <button
          onClick={() => setShowPartMenu(!showPartMenu)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-[11px] font-bold uppercase tracking-wider border border-emerald-200 hover:bg-emerald-100 transition-colors"
        >
          <FolderOpen className="h-3.5 w-3.5" />
          {editing ? (
            <input
              type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { if (title.trim()) onRenamePart(part.id, title.trim()); setEditing(false) }; if (e.key === 'Escape') setEditing(false) }}
              onClick={(e) => e.stopPropagation()} autoFocus
              className="text-[11px] font-bold bg-white rounded-lg px-2 py-0.5 w-24 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          ) : (
            <span className="max-w-[120px] truncate">{part.title}</span>
          )}
        </button>
        {showPartMenu && (
          <div ref={partMenuRef} className="absolute top-full left-0 mt-1.5 w-44 bg-white rounded-xl shadow-xl shadow-black/10 border border-slate-200 py-1.5 z-50">
            <button onClick={() => { setEditing(true); setTitle(part.title); setShowPartMenu(false) }} className="w-full px-3 py-2 flex items-center gap-2 text-xs text-slate-600 hover:bg-slate-50 rounded-lg mx-1 w-[calc(100%-8px)]">
              <Pencil className="h-3.5 w-3.5 text-slate-400" /> Renommer
            </button>
            <button onClick={() => { onAddChapter(chapters.length > 0 ? Math.max(...chapters.map(c => c.order)) : 0, part.id); setShowPartMenu(false) }} className="w-full px-3 py-2 flex items-center gap-2 text-xs text-slate-600 hover:bg-slate-50 rounded-lg mx-1 w-[calc(100%-8px)]">
              <Plus className="h-3.5 w-3.5 text-slate-400" /> Ajouter chapitre
            </button>
            <div className="border-t border-slate-100 my-1 mx-2" />
            <button onClick={() => { onDeletePart(part.id); setShowPartMenu(false) }} className="w-full px-3 py-2 flex items-center gap-2 text-xs text-red-500 hover:bg-red-50 rounded-lg mx-1 w-[calc(100%-8px)]">
              <Trash2 className="h-3.5 w-3.5" /> Supprimer partie
            </button>
          </div>
        )}
      </div>
      <div className="w-px h-8 bg-slate-200" />
      <div className="flex items-center gap-1.5">
        {chapters.map((ch, idx) => {
          const meta = CHAPTERS.find(m => m.order === ch.order)
          return (
            <ChapterTab
              key={ch.id} ch={ch} idx={idx} total={chapters.length}
              isActive={ch.id === activeChapterId} meta={meta}
              onSelect={() => onSelectChapter(ch.id)}
              onEdit={onRenameChapter}
              onDelete={onDeleteChapter}
              onReorder={onReorderChapter}
              onAddAfter={(order) => onAddChapter(order, part.id)}
            />
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────
export default function HorizontalChapterTabs({
  thesis, activeChapterId, onSelectChapter,
  onAddChapter, onDeleteChapter, onReorderChapter, onRenameChapter,
  onAddPart, onDeletePart, onRenamePart,
}: HorizontalChapterTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isPartsMode = thesis.structureMode === 'parts'

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    const activeEl = container.querySelector('[data-active="true"]')
    if (activeEl) activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [activeChapterId])

  const chaptersByPart = isPartsMode
    ? thesis.parts.map(part => ({
        part,
        chapters: thesis.chapters.filter(c => c.partId === part.id).sort((a, b) => a.order - b.order),
      }))
    : [{ part: null, chapters: [...thesis.chapters].sort((a, b) => a.order - b.order) }]

  const unassignedChapters = isPartsMode
    ? thesis.chapters.filter(c => !c.partId).sort((a, b) => a.order - b.order)
    : []

  const sortedChapters = [...thesis.chapters].sort((a, b) => a.order - b.order)
  const lastOrder = sortedChapters.length > 0 ? Math.max(...sortedChapters.map(c => c.order)) : 0

  return (
    <nav className="bg-slate-50/80 border-b border-slate-200 shrink-0 z-20">
      <div className="flex items-center">
        <div
          ref={scrollRef}
          className="flex items-center gap-1 px-3 py-2.5 overflow-x-auto flex-1 min-w-0"
          style={{ scrollbarWidth: 'thin' }}
        >
          {chaptersByPart.map(({ part, chapters }) => {
            if (isPartsMode && part) {
              return (
                <PartGroup
                  key={part.id}
                  part={part} chapters={chapters} activeChapterId={activeChapterId}
                  onRenamePart={onRenamePart} onDeletePart={onDeletePart}
                  onSelectChapter={onSelectChapter}
                  onAddChapter={onAddChapter}
                  onDeleteChapter={onDeleteChapter}
                  onReorderChapter={onReorderChapter}
                  onRenameChapter={onRenameChapter}
                />
              )
            }
            return (
              <div key="flat" className="flex items-center gap-1.5">
                {chapters.map((ch, idx) => {
                  const meta = CHAPTERS.find(m => m.order === ch.order)
                  return (
                    <ChapterTab
                      key={ch.id} ch={ch} idx={idx} total={chapters.length}
                      isActive={ch.id === activeChapterId} meta={meta}
                      onSelect={() => onSelectChapter(ch.id)}
                      onEdit={onRenameChapter}
                      onDelete={onDeleteChapter}
                      onReorder={onReorderChapter}
                      onAddAfter={(order) => onAddChapter(order)}
                    />
                  )
                })}
              </div>
            )
          })}

          {/* Unassigned in parts mode */}
          {isPartsMode && unassignedChapters.length > 0 && (
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-px h-8 bg-slate-200" />
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium shrink-0">Non assignés</span>
              {unassignedChapters.map((ch, idx) => {
                const meta = CHAPTERS.find(m => m.order === ch.order)
                return (
                  <ChapterTab
                    key={ch.id} ch={ch} idx={idx} total={unassignedChapters.length}
                    isActive={ch.id === activeChapterId} meta={meta}
                    onSelect={() => onSelectChapter(ch.id)}
                    onEdit={onRenameChapter}
                    onDelete={onDeleteChapter}
                    onReorder={onReorderChapter}
                    onAddAfter={(order) => onAddChapter(order)}
                  />
                )
              })}
            </div>
          )}
        </div>

        {/* Add button — always visible, right-aligned */}
        <div className="shrink-0 px-3 pl-1">
          {isPartsMode ? (
            <button
              onClick={onAddPart}
              className="flex items-center gap-1.5 px-3 py-2.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all border border-dashed border-slate-300 hover:border-emerald-400 text-xs font-semibold"
              title="Ajouter une partie"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Partie</span>
            </button>
          ) : (
            <button
              onClick={() => onAddChapter(lastOrder)}
              className="flex items-center gap-1.5 px-3 py-2.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all border border-dashed border-slate-300 hover:border-emerald-400 text-xs font-semibold"
              title="Ajouter un chapitre"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Chapitre</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}