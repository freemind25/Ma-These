'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  RotateCcw, Plus, Trash2, ChevronRight, ChevronDown,
  CheckCircle2, Circle, Loader2, Target, FileText,
  Lightbulb, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

// ─── Types ──────────────────────────────────────────────
interface Story {
  id: string
  sprintId: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'done'
  order: number
}

interface Sprint {
  id: string
  thesisId: string
  sprintNumber: number
  phase: string
  title: string
  description: string
  deliverable: string
  status: 'todo' | 'in_progress' | 'done'
  startedAt: string | null
  completedAt: string | null
  stories: Story[]
}

interface Phase {
  id: string
  label: string
  color: string
  icon: string
}

interface RoadmapStats {
  totalSprints: number
  doneSprints: number
  totalStories: number
  doneStories: number
}

interface AgileRoadmapPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// ─── Phase config ──────────────────────────────────────
const PHASE_CONFIG: Record<string, { bg: string; border: string; badge: string; text: string; dot: string }> = {
  phase_0: { bg: 'bg-emerald-950/30', border: 'border-emerald-800/40', badge: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  phase_1: { bg: 'bg-sky-950/30', border: 'border-sky-800/40', badge: 'bg-sky-900/40 text-sky-300 border-sky-700/50', text: 'text-sky-300', dot: 'bg-sky-400' },
  phase_2: { bg: 'bg-amber-950/30', border: 'border-amber-800/40', badge: 'bg-amber-900/40 text-amber-300 border-amber-700/50', text: 'text-amber-300', dot: 'bg-amber-400' },
  phase_3: { bg: 'bg-violet-950/30', border: 'border-violet-800/40', badge: 'bg-violet-900/40 text-violet-300 border-violet-700/50', text: 'text-violet-300', dot: 'bg-violet-400' },
  phase_4: { bg: 'bg-rose-950/30', border: 'border-rose-800/40', badge: 'bg-rose-900/40 text-rose-300 border-rose-700/50', text: 'text-rose-300', dot: 'bg-rose-400' },
}

const PHASE_ICONS: Record<string, string> = {
  phase_0: '🚀', phase_1: '📋', phase_2: '📝', phase_3: '✍️', phase_4: '🎯',
}

const PHASE_LABELS: Record<string, string> = {
  phase_0: 'Phase 0', phase_1: 'Phase 1', phase_2: 'Phase 2', phase_3: 'Phase 3', phase_4: 'Phase 4',
}

const STATUS_MAP = {
  todo: { label: 'À faire', color: 'text-slate-400', icon: Circle, next: 'in_progress' as const },
  in_progress: { label: 'En cours', color: 'text-amber-400', icon: Loader2, next: 'done' as const },
  done: { label: 'Terminé', color: 'text-emerald-400', icon: CheckCircle2, next: 'todo' as const },
}

// ─── Main Component ────────────────────────────────────
export default function AgileRoadmapPanel({ open, onOpenChange }: AgileRoadmapPanelProps) {
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [phases, setPhases] = useState<Phase[]>([])
  const [stats, setStats] = useState<RoadmapStats>({ totalSprints: 19, doneSprints: 0, totalStories: 0, doneStories: 0 })
  const [loading, setLoading] = useState(true)
  const [expandedSprint, setExpandedSprint] = useState<string | null>(null)
  const [newStorySprintId, setNewStorySprintId] = useState<string | null>(null)
  const [newStoryTitle, setNewStoryTitle] = useState('')
  const [activeTab, setActiveTab] = useState<'roadmap' | 'kanban'>('roadmap')
  const storyInputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Fetch sprints
  const fetchSprints = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/agile-roadmap')
      const data = await res.json()
      if (data.success) {
        setSprints(data.sprints)
        setPhases(data.phases)
        setStats(data.stats)
      }
    } catch (err) {
      console.error('Failed to fetch agile roadmap:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const prevOpen = useRef(false)

  useEffect(() => {
    if (open && !prevOpen.current) {
      fetchSprints()
    }
    prevOpen.current = open
  }, [open, fetchSprints])

  useEffect(() => {
    if (newStorySprintId && storyInputRef.current) {
      setTimeout(() => storyInputRef.current?.focus(), 100)
    }
  }, [newStorySprintId])

  // Update sprint status
  const updateSprintStatus = async (sprintId: string, status: string) => {
    const res = await fetch('/api/agile-roadmap', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_sprint_status', sprintId, status }),
    })
    const data = await res.json()
    if (data.success) {
      setSprints(prev => prev.map(s => s.id === sprintId ? { ...s, ...data.sprint, stories: s.stories } : s))
      fetchSprints() // refresh stats
    }
  }

  // Update story status
  const updateStoryStatus = async (storyId: string, status: string) => {
    await fetch('/api/agile-roadmap', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_story_status', storyId, status }),
    })
    setSprints(prev => prev.map(s => ({
      ...s,
      stories: s.stories.map(st => st.id === storyId ? { ...st, status: status as Story['status'] } : st),
    })))
    fetchSprints()
  }

  // Delete story
  const deleteStory = async (storyId: string) => {
    await fetch(`/api/agile-roadmap?storyId=${storyId}`, { method: 'DELETE' })
    setSprints(prev => prev.map(s => ({
      ...s,
      stories: s.stories.filter(st => st.id !== storyId),
    })))
    fetchSprints()
  }

  // Add story
  const addStory = async () => {
    if (!newStoryTitle.trim() || !newStorySprintId) return
    const res = await fetch('/api/agile-roadmap', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add_story', sprintId: newStorySprintId, title: newStoryTitle.trim() }),
    })
    const data = await res.json()
    if (data.success) {
      setSprints(prev => prev.map(s =>
        s.id === newStorySprintId ? { ...s, stories: [...s.stories, data.story] } : s
      ))
    }
    setNewStoryTitle('')
    setNewStorySprintId(null)
    fetchSprints()
  }

  // Reset roadmap
  const resetRoadmap = async () => {
    if (!confirm('Réinitialiser la feuille de route ? Toute progression sera perdue.')) return
    await fetch('/api/agile-roadmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    fetchSprints()
  }

  // Group sprints by phase
  const sprintsByPhase = phases.map(phase => ({
    ...phase,
    sprints: sprints.filter(s => s.phase === phase.id),
  })).filter(p => p.sprints.length > 0)

  // Kanban data
  const kanbanColumns = [
    { id: 'todo' as const, label: 'À faire', color: 'border-slate-700' },
    { id: 'in_progress' as const, label: 'En cours', color: 'border-amber-700' },
    { id: 'done' as const, label: 'Terminé', color: 'border-emerald-700' },
  ]

  const progressPercent = stats.totalSprints > 0 ? Math.round((stats.doneSprints / stats.totalSprints) * 100) : 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="sm:max-w-[720px] p-0 bg-slate-950 border-slate-800 flex flex-col h-full [&>button:last-child]:hidden"
      >
        {/* ── Header ── */}
        <SheetHeader className="flex-row items-center justify-between px-5 py-3 border-b border-slate-800 shrink-0">
          <SheetTitle className="flex items-center gap-2 text-base text-slate-100">
            <span>🗺️</span>
            <span>Feuille de Route Agile</span>
          </SheetTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 gap-1"
              onClick={resetRoadmap}
            >
              <RotateCcw className="size-3" />
              Réinitialiser
            </Button>
          </div>
        </SheetHeader>

        {/* ── Stats bar ── */}
        <div className="shrink-0 border-b border-slate-800/50 px-5 py-2.5">
          <div className="flex items-center gap-4">
            {/* Global progress */}
            <div className="flex items-center gap-2 flex-1">
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs font-bold text-emerald-400 w-8 text-right">{progressPercent}%</span>
            </div>
            {/* Stats badges */}
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="flex items-center gap-1"><Target className="size-3" />{stats.doneSprints}/{stats.totalSprints} sprints</span>
              <span className="flex items-center gap-1"><FileText className="size-3" />{stats.doneStories}/{stats.totalStories} stories</span>
            </div>
          </div>

          {/* Tab toggle */}
          <div className="flex items-center gap-1 mt-2">
            <button
              onClick={() => setActiveTab('roadmap')}
              className={cn(
                'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                activeTab === 'roadmap' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              Feuille de route
            </button>
            <button
              onClick={() => setActiveTab('kanban')}
              className={cn(
                'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                activeTab === 'kanban' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              Kanban
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        <div ref={scrollRef} className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-5">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="size-6 text-slate-400 animate-spin" />
                </div>
              ) : activeTab === 'roadmap' ? (
                /* ── ROADMAP VIEW ── */
                <div className="space-y-6">
                  {sprintsByPhase.map((phase) => {
                    const config = PHASE_CONFIG[phase.id] || PHASE_CONFIG.phase_0
                    const phaseDone = phase.sprints.filter(s => s.status === 'done').length
                    const phaseTotal = phase.sprints.length

                    return (
                      <div key={phase.id}>
                        {/* Phase header */}
                        <div className={cn('flex items-center gap-2 mb-3 px-3 py-2 rounded-lg', config.bg, 'border', config.border)}>
                          <span className="text-base">{PHASE_ICONS[phase.id] || '📋'}</span>
                          <span className={cn('text-xs font-bold', config.text)}>{phase.label}</span>
                          <span className="text-[10px] text-slate-500 ml-auto">{phaseDone}/{phaseTotal} sprints</span>
                          {phaseDone === phaseTotal && phaseTotal > 0 && (
                            <CheckCircle2 className="size-3.5 text-emerald-400" />
                          )}
                        </div>

                        {/* Sprint cards */}
                        <div className="space-y-2 ml-2">
                          {phase.sprints.map((sprint) => {
                            const isExpanded = expandedSprint === sprint.id
                            const statusInfo = STATUS_MAP[sprint.status]
                            const StatusIcon = statusInfo.icon
                            const storiesDone = sprint.stories.filter(s => s.status === 'done').length
                            const storiesTotal = sprint.stories.length

                            return (
                              <div key={sprint.id} className={cn(
                                'rounded-xl border transition-all',
                                sprint.status === 'done' ? 'border-emerald-800/30 bg-emerald-950/10' :
                                sprint.status === 'in_progress' ? 'border-amber-800/40 bg-amber-950/20 ring-1 ring-amber-500/20' :
                                'border-slate-800/50 bg-slate-900/30'
                              )}>
                                {/* Sprint header */}
                                <button
                                  onClick={() => setExpandedSprint(isExpanded ? null : sprint.id)}
                                  className="w-full flex items-center gap-2.5 p-3 text-left"
                                >
                                  <div className={cn(
                                    'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border',
                                    sprint.status === 'done' ? 'bg-emerald-900/40 border-emerald-700/50 text-emerald-300' :
                                    sprint.status === 'in_progress' ? 'bg-amber-900/40 border-amber-700/50 text-amber-300' :
                                    'bg-slate-800 border-slate-700 text-slate-400'
                                  )}>
                                    {sprint.status === 'done' ? '✓' : sprint.sprintNumber}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={cn(
                                      'text-xs font-medium truncate',
                                      sprint.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-200'
                                    )}>
                                      Sprint {sprint.sprintNumber}: {sprint.title}
                                    </p>
                                    {sprint.deliverable && (
                                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                        <Target className="size-2.5 inline-block mr-0.5" />
                                        {sprint.deliverable}
                                      </p>
                                    )}
                                  </div>
                                  {/* Story progress mini-bar */}
                                  {storiesTotal > 0 && (
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500/70 rounded-full" style={{ width: `${(storiesDone / storiesTotal) * 100}%` }} />
                                      </div>
                                      <span className="text-[9px] text-slate-500">{storiesDone}/{storiesTotal}</span>
                                    </div>
                                  )}
                                  <StatusIcon className={cn('size-3.5 shrink-0', statusInfo.color, sprint.status === 'in_progress' && 'animate-spin')} />
                                  {isExpanded ? <ChevronDown className="size-3 text-slate-500" /> : <ChevronRight className="size-3 text-slate-500" />}
                                </button>

                                {/* Expanded content */}
                                {isExpanded && (
                                  <div className="px-3 pb-3 border-t border-slate-800/30">
                                    <p className="text-[11px] text-slate-400 mt-2 mb-3 leading-relaxed">
                                      {sprint.description}
                                    </p>

                                    {/* Stories */}
                                    <div className="space-y-1.5 mb-3">
                                      {sprint.stories.map((story) => {
                                        const storyStatus = STATUS_MAP[story.status]
                                        const StoryIcon = storyStatus.icon
                                        return (
                                          <div key={story.id} className="flex items-center gap-2 group">
                                          <button
                                            onClick={() => updateStoryStatus(story.id, storyStatus.next)}
                                            className="shrink-0"
                                            title={storyStatus.label}
                                          >
                                            <StoryIcon className={cn('size-3.5', storyStatus.color, story.status === 'in_progress' && 'animate-spin')} />
                                          </button>
                                          <span className={cn(
                                            'text-[11px] flex-1',
                                            story.status === 'done' ? 'text-slate-500 line-through' : 'text-slate-300'
                                          )}>
                                            {story.title}
                                          </span>
                                          <button
                                            onClick={() => deleteStory(story.id)}
                                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-500 hover:text-red-400 transition-all"
                                            title="Supprimer"
                                          >
                                            <Trash2 className="size-3" />
                                          </button>
                                        </div>
                                        )
                                      })}
                                    </div>

                                    {/* Add story */}
                                    {newStorySprintId === sprint.id ? (
                                      <div className="flex items-center gap-2">
                                        <input
                                          ref={storyInputRef}
                                          value={newStoryTitle}
                                          onChange={e => setNewStoryTitle(e.target.value)}
                                          onKeyDown={e => {
                                            if (e.key === 'Enter') addStory()
                                            if (e.key === 'Escape') setNewStorySprintId(null)
                                          }}
                                          placeholder="Nouvelle story..."
                                          className="flex-1 h-7 bg-slate-800 border border-slate-700 rounded px-2 text-[11px] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                                          autoFocus
                                        />
                                        <Button size="sm" className="h-7 px-2 text-[10px] bg-emerald-600 hover:bg-emerald-500" onClick={addStory}>
                                          <Plus className="size-3 mr-0.5" />Ajouter
                                        </Button>
                                        <button onClick={() => setNewStorySprintId(null)} className="p-1 text-slate-500 hover:text-slate-300">
                                          <X className="size-3" />
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => setNewStorySprintId(sprint.id)}
                                        className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-emerald-400 transition-colors"
                                      >
                                        <Plus className="size-3" />Ajouter une story
                                      </button>
                                    )}

                                    {/* Sprint status buttons */}
                                    <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-slate-800/30">
                                      <span className="text-[9px] text-slate-500 mr-1">Statut :</span>
                                      {(['todo', 'in_progress', 'done'] as const).map(s => (
                                        <button
                                          key={s}
                                          onClick={() => updateSprintStatus(sprint.id, s)}
                                          className={cn(
                                            'px-2 py-0.5 rounded text-[10px] font-medium transition-colors',
                                            sprint.status === s
                                              ? s === 'done' ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/50'
                                                : s === 'in_progress' ? 'bg-amber-900/40 text-amber-300 border border-amber-700/50'
                                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                                              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                                          )}
                                        >
                                          {STATUS_MAP[s].label}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                /* ── KANBAN VIEW ── */
                <div className="grid grid-cols-3 gap-3">
                  {kanbanColumns.map(col => {
                    const colStories = sprints.flatMap(s =>
                      s.stories.map(st => ({ ...st, sprintTitle: `S${s.sprintNumber}: ${s.title}`, sprintStatus: s.status }))
                    ).filter(s => s.status === col.id)

                    return (
                      <div key={col.id} className={cn('rounded-xl border-t-2 bg-slate-900/40', col.color)}>
                        <div className="px-3 py-2 flex items-center justify-between border-b border-slate-800/50">
                          <span className="text-xs font-medium text-slate-300">{col.label}</span>
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-slate-700 text-slate-400">
                            {colStories.length}
                          </Badge>
                        </div>
                        <div className="p-2 space-y-1.5 max-h-[60vh] overflow-y-auto">
                          {colStories.map(story => {
                            const storyStatus = STATUS_MAP[story.status]
                            return (
                              <div
                                key={story.id}
                                className={cn(
                                  'p-2.5 rounded-lg border text-xs cursor-pointer transition-all group',
                                  story.status === 'done' ? 'bg-emerald-950/20 border-emerald-800/30' :
                                  story.status === 'in_progress' ? 'bg-amber-950/20 border-amber-800/30' :
                                  'bg-slate-800/30 border-slate-700/30 hover:border-slate-600'
                                )}
                                onClick={() => updateStoryStatus(story.id, storyStatus.next)}
                              >
                                <p className={cn(
                                  'text-[11px] leading-snug',
                                  story.status === 'done' ? 'text-slate-500 line-through' : 'text-slate-200'
                                )}>
                                  {story.title}
                                </p>
                                <p className="text-[9px] text-slate-500 mt-1 truncate">
                                  {story.sprintTitle}
                                </p>
                              </div>
                            )
                          })}
                          {colStories.length === 0 && (
                            <p className="text-[10px] text-slate-600 text-center py-4">Aucune story</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 border-t border-slate-800/50 px-5 py-2 flex items-center justify-between">
          <span className="text-[10px] text-slate-500">
            Modèle Agile · 4 phases · 19 sprints
          </span>
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <Lightbulb className="size-3 text-amber-500" />
            Inspiré du modèle CLESSN
          </span>
        </div>
      </SheetContent>
    </Sheet>
  )
}