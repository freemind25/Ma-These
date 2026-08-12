'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  ShieldCheck,
  Send,
  Trash2,
  Loader2,
  X,
  Copy,
  Check,
  BookOpen,
  Eye,
  Zap,
  Wrench,
  Search,
  FileCheck,
  Map,
  PenLine,
  Layers,
} from 'lucide-react'
import { withProviderConfig } from '@/hooks/use-provider-config'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'
import type { ChapterData } from '@/types/thesis'

const WELCOME_MESSAGE =
  "Bonjour. Je suis votre directeur de thèse virtuel.\n\n" +
  "Mon rôle n'est pas de rédiger à votre place — c'est de **questionner**, **évaluer** et **pousser** votre réflexion, comme le ferait un vrai directeur en réunion de suivi.\n\n" +
  "Vous pouvez :\n" +
  "- Me présenter une idée, une hypothèse, un plan — je vous ferai un retour critique\n" +
  "- Me coller un passage de votre chapitre — je l'évaluerai\n" +
  "- Me poser une question sur la méthode, le cadre théorique, l'argumentation\n" +
  "- Me dire que vous êtes bloqué — je vous aiderai à débloquer\n\n" +
  "Le contenu de votre chapitre courant est automatiquement injecté en contexte. Commencez."

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChapterProgress {
  number: string
  title: string
  wordCount: number
  status: string
}

type DirecteurMode = 'stress-test' | 'remediation' | 'gap-finding' | 'lr-audit' | 'cartographie' | 'writing-coach' | 'source-synthesis'

const MODE_CONFIG: { id: DirecteurMode; label: string; icon: typeof Zap; description: string }[] = [
  {
    id: 'stress-test',
    label: 'Stress-test',
    icon: Zap,
    description: 'Cherche les contre-preuves et les limites d\'une affirmation',
  },
  {
    id: 'remediation',
    label: 'Remédiation',
    icon: Wrench,
    description: 'Analyse une section faible et propose un plan de reconstruction',
  },
  {
    id: 'gap-finding',
    label: 'Lacunes',
    icon: Search,
    description: 'Identifie les lacunes empiriques, théoriques et méthodologiques',
  },
  {
    id: 'lr-audit',
    label: 'Audit LR',
    icon: FileCheck,
    description: 'Vérifie si votre revue correspond au type déclaré (narrative / SLR / méta-analyse)',
  },
  {
    id: 'cartographie',
    label: 'Cartographie',
    icon: Map,
    description: 'Mappez votre paysage de recherche : clusters, connexions, zones blanches',
  },
  {
    id: 'writing-coach',
    label: 'Coach rédaction',
    icon: PenLine,
    description: 'Retour rédactionnel : structure, argumentation, flux, hedging académique',
  },
  {
    id: 'source-synthesis',
    label: 'Synthèse sources',
    icon: Layers,
    description: 'Synthèse croisée ancrée dans vos sources fournies',
  },
]

interface DirecteurChatProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // Context from the active workspace
  chapterNumber?: string
  chapterTitle?: string
  chapterContent?: string
  chapters?: ChapterData[]
  thesisTitle?: string
  thesisField?: string
  activeBookIds?: string[]
}

function generateSessionId() {
  return `directeur_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

// ── Assistant bubble with copy ──
function DirecteurBubble({ content }: { content: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [content])

  return (
    <div className="mr-6">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-left text-amber-400/70 font-medium">Directeur</p>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <button
            onClick={handleCopy}
            className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 transition-colors"
            title="Copier"
          >
            {copied ? <Check className="size-3 text-amber-400" /> : <Copy className="size-3" />}
          </button>
        </div>
      </div>
      <div className="group bg-slate-800/80 border border-amber-800/30 rounded-2xl rounded-bl-md px-4 py-3">
        <div className="prose prose-invert prose-sm max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:mb-2 [&_ol]:mb-2 [&_li]:mb-0.5 [&_strong]:text-amber-300 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-xs [&_code]:text-amber-300 [&_code]:bg-slate-800 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_blockquote]:border-l-2 [&_blockquote]:border-amber-700 [&_blockquote]:pl-3 [&_blockquote]:italic [&_hr]:border-slate-700 [&_pre]:bg-slate-900 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}

export default function DirecteurChat({
  open,
  onOpenChange,
  chapterNumber,
  chapterTitle,
  chapterContent,
  chapters,
  thesisTitle,
  thesisField,
  activeBookIds,
}: DirecteurChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: WELCOME_MESSAGE },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(generateSessionId)
  const [contextEnabled, setContextEnabled] = useState(true)
  const [activeMode, setActiveMode] = useState<DirecteurMode | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (!scrollRef.current) return
    const viewport = scrollRef.current.querySelector(
      '[data-slot="scroll-area-viewport"]'
    ) as HTMLElement | null
    if (viewport) {
      requestAnimationFrame(() => {
        viewport.scrollTop = viewport.scrollHeight
      })
    }
  }, [messages, loading])

  const sendMessage = useCallback(async (overrideMessage?: string, overrideMode?: DirecteurMode) => {
    const trimmed = (overrideMessage || input).trim()
    if (!trimmed || loading) return

    const userMessage: ChatMessage = { role: 'user', content: trimmed }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    try {
      const effectiveMode = overrideMode || activeMode
      const reqBody: Record<string, unknown> = {
        message: trimmed,
        sessionId,
      }
      if (effectiveMode) reqBody.mode = effectiveMode

      // Inject chapter context if enabled and available
      if (contextEnabled) {
        if (chapterTitle) reqBody.chapterTitle = chapterTitle
        if (chapterNumber) reqBody.chapterNumber = chapterNumber
        if (chapterContent) reqBody.chapterContent = chapterContent
        if (chapters && chapters.length > 0) {
          const thesisProgress: ChapterProgress[] = chapters.map((c) => ({
            number: c.number,
            title: c.title,
            wordCount: c.wordCount,
            status: c.status,
          }))
          reqBody.thesisProgress = thesisProgress
        }
        if (thesisTitle) reqBody.thesisTitle = thesisTitle
        if (thesisField) reqBody.thesisField = thesisField
        if (activeBookIds && activeBookIds.length > 0) reqBody.activeBookIds = activeBookIds
      }

      const res = await fetch('/api/directeur-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(withProviderConfig(reqBody)),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.response },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `⚠️ Erreur : ${data.error || 'Erreur inconnue.'}` },
        ])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '⚠️ Erreur de connexion. Veuillez réessayer.' },
      ])
    } finally {
      setLoading(false)
    }
  }, [input, loading, sessionId, chapterTitle, chapterNumber, chapterContent, chapters, thesisTitle, thesisField, contextEnabled, activeBookIds, activeMode])

  const clearConversation = useCallback(async () => {
    try {
      await fetch(`/api/directeur-chat?sessionId=${sessionId}`, {
        method: 'DELETE',
      })
    } catch {
      // Silently ignore
    }
    setMessages([{ role: 'assistant', content: WELCOME_MESSAGE }])
    setSessionId(generateSessionId())
    setActiveMode(null)
  }, [sessionId])

  const handleModeClick = useCallback((mode: DirecteurMode) => {
    setActiveMode(prev => prev === mode ? null : mode)
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        sendMessage()
      }
    },
    [sendMessage]
  )

  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value)
      const ta = e.target
      ta.style.height = 'auto'
      ta.style.height = `${Math.min(ta.scrollHeight, 96)}px`
    },
    []
  )

  const userMessageCount = messages.length - 1

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="sm:max-w-[520px] p-0 bg-slate-950 border-slate-800 flex flex-col h-full [&>button:last-child]:hidden"
      >
        {/* Header */}
        <SheetHeader className="flex-row items-center justify-between px-4 py-3 border-b border-amber-900/30 shrink-0">
          <SheetTitle className="flex items-center gap-2 text-slate-100 text-base">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-900/40 border border-amber-700/30">
              <ShieldCheck className="size-4 text-amber-400" />
            </div>
            Directeur de thèse
          </SheetTitle>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            onClick={() => onOpenChange(false)}
          >
            <X className="size-4" />
          </Button>
        </SheetHeader>

        {/* Role banner */}
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-950/30 border-b border-amber-900/20 shrink-0">
          <Eye className="size-3.5 text-amber-500/70 shrink-0" />
          <p className="text-[11px] text-amber-300/60">
            Évalue, questionne, pousse — ne rédige jamais à votre place.
          </p>
        </div>

        {/* Context indicator */}
        {chapterTitle && contextEnabled && (
          <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-900/60 border-b border-slate-800/30 shrink-0">
            <BookOpen className="size-3 text-amber-500/70 shrink-0" />
            <span className="text-[11px] text-slate-400 truncate">
              Chap. {chapterNumber} — {chapterTitle}
            </span>
            <button
              onClick={() => setContextEnabled(false)}
              className="ml-auto text-[10px] text-slate-500 hover:text-slate-300 underline shrink-0"
            >
              masquer
            </button>
          </div>
        )}
        {!contextEnabled && (
          <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-900/60 border-b border-slate-800/30 shrink-0">
            <BookOpen className="size-3 text-slate-600 shrink-0" />
            <span className="text-[11px] text-slate-500">Contexte chapitre désactivé</span>
            <button
              onClick={() => setContextEnabled(true)}
              className="ml-auto text-[10px] text-slate-500 hover:text-slate-300 underline shrink-0"
            >
              activer
            </button>
          </div>
        )}

        {/* Active books indicator */}
        {activeBookIds && activeBookIds.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-950/40 border-b border-emerald-800/20 shrink-0">
            <BookOpen className="size-3 text-emerald-500/70 shrink-0" />
            <span className="text-[11px] text-emerald-300/70 truncate">
              {activeBookIds.length} livre{activeBookIds.length !== 1 ? 's' : ''}-compétence{activeBookIds.length !== 1 ? 's' : ''} actif{activeBookIds.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Messages area */}
        <div ref={scrollRef} className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-3 p-4 pb-2">
              {messages.map((msg, i) =>
                msg.role === 'assistant' && i > 0 ? (
                  <DirecteurBubble key={i} content={msg.content} />
                ) : (
                  <div
                    key={i}
                    className={cn(msg.role === 'user' ? 'ml-6' : 'mr-6')}
                  >
                    <p
                      className={cn(
                        'text-xs mb-1',
                        msg.role === 'user'
                          ? 'text-right text-slate-300'
                          : 'text-left text-amber-400/70'
                      )}
                    >
                      {msg.role === 'user' ? 'Vous' : 'Directeur'}
                    </p>
                    <div
                      className={cn(
                        'px-4 py-3',
                        msg.role === 'user'
                          ? 'bg-slate-800 border border-slate-700/50 rounded-2xl rounded-br-md'
                          : 'bg-slate-800/80 border border-amber-800/30 rounded-2xl rounded-bl-md'
                      )}
                    >
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-invert prose-sm max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:mb-2 [&_ol]:mb-2 [&_li]:mb-0.5 [&_strong]:text-amber-300 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-xs [&_code]:text-amber-300 [&_code]:bg-slate-800 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_blockquote]:border-l-2 [&_blockquote]:border-amber-700 [&_blockquote]:pl-3 [&_blockquote]:italic [&_hr]:border-slate-700 [&_pre]:bg-slate-900 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-200 whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      )}
                    </div>
                  </div>
                )
              )}

              {loading && (
                <div className="mr-6">
                  <p className="text-xs mb-1 text-left text-amber-400/70">Directeur</p>
                  <div className="bg-slate-800/80 border border-amber-800/30 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-2 text-amber-400/70 text-sm">
                      <Loader2 className="size-4 animate-spin" />
                      Réflexion en cours…
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Mode selector */}
        <div className="shrink-0 border-t border-slate-800/50 px-4 py-2">
          <div className="flex gap-1.5 overflow-x-auto">
            {MODE_CONFIG.map((m) => {
              const Icon = m.icon
              const isActive = activeMode === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => handleModeClick(m.id)}
                  title={m.description}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0',
                    isActive
                      ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
                  )}
                >
                  <Icon className="size-3.5" />
                  {m.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Input area */}
        <div className="shrink-0 border-t border-slate-800 px-4 py-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Présentez votre idée, posez votre question, collez un passage..."
              rows={1}
              className="flex-1 resize-none bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 max-h-[96px] overflow-y-auto"
            />
            <Button
              size="icon"
              className="size-10 shrink-0 bg-amber-600 hover:bg-amber-500 text-white"
              disabled={!input.trim() || loading}
              onClick={() => sendMessage()}
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="shrink-0 flex items-center justify-between px-4 py-2 border-t border-slate-800/50">
          <span className="text-xs text-slate-500">
            {userMessageCount} message{userMessageCount !== 1 ? 's' : ''}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-slate-500 hover:text-amber-300 hover:bg-slate-800 gap-1.5"
            onClick={clearConversation}
          >
            <Trash2 className="size-3" />
            Nouvelle réunion
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
