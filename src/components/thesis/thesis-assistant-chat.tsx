'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ASSISTANT_MODES, type AssistantMode } from '@/lib/thesis-assistant-knowledge'
import {
  GraduationCap,
  PenLine,
  SpellCheck,
  Scale,
  Layers,
  Library,
  BarChart3,
  Send,
  Trash2,
  Loader2,
  MessageSquare,
  X,
  Copy,
  Check,
  FileInput,
  BookOpen,
  FileSearch,
} from 'lucide-react'
import { withProviderConfig } from '@/hooks/use-provider-config'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'
import type { ChapterData } from '@/types/thesis'

const ICON_MAP: Record<string, React.ElementType> = {
  GraduationCap,
  PenLine,
  SpellCheck,
  Scale,
  Layers,
  Library,
  BarChart3,
}

const WELCOME_MESSAGE =
  "Bonjour ! Je suis votre assistant de thèse. Je peux vous aider en rédaction, correction, critique académique, méthodologie, bibliographie et suivi d'avancement.\n\nSélectionnez un mode ci-dessus et envoyez-moi votre texte ou votre question."

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  ragChunksFound?: number
}

interface ChapterProgress {
  number: string
  title: string
  wordCount: number
  status: string
}

interface ThesisAssistantChatProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // Context from the active workspace
  chapterNumber?: string
  chapterTitle?: string
  chapterContent?: string
  chapters?: ChapterData[]
  thesisTitle?: string
  thesisField?: string
  // Action: insert text into editor
  onInsertText?: (text: string) => void
}

function generateSessionId() {
  return `thesis_ast_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

// ── Message bubble with actions ──
function AssistantBubble({
  content,
  activeMode,
  onInsertText,
  ragChunksFound = 0,
}: {
  content: string
  activeMode: AssistantMode
  onInsertText?: (text: string) => void
  ragChunksFound?: number
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [content])

  const handleInsert = useCallback(() => {
    if (!onInsertText) return
    // Strip markdown formatting and remove trailing 'Prochaine étape' section
    let text = content
      // Remove markdown headings
      .replace(/^#{1,6}\s+/gm, '')
      // Remove bold/italic markers
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      // Remove numbered section headers (e.g. "1.", "2.")
      .replace(/^\d+\.\s+.*$/gm, '')
      // Remove bullet points but keep content
      .replace(/^[-*]\s+/gm, '')
      // Remove the 'Prochaine étape' section and everything after
      .split(/\n?Prochaine étape/i)[0]
      // Remove the 'Points de vigilance' section header
      .replace(/^Points? de vigilance.*$/gim, '')
      // Clean up empty lines
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .join('\n\n')
    onInsertText(text || content)
  }, [content, onInsertText])

  // Modes where inserting makes sense
  const canInsert = (activeMode === 'redaction' || activeMode === 'correction' || activeMode === 'general') && onInsertText

  return (
    <div className="mr-8">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <p className="text-xs text-left text-slate-400">Assistant</p>
          {ragChunksFound > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-900/40 text-[10px] text-emerald-400">
              <FileSearch className="size-2.5" />
              {ragChunksFound} extrait{ragChunksFound > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <button
            onClick={handleCopy}
            className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 transition-colors"
            title="Copier la réponse"
          >
            {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
          </button>
          {canInsert && (
            <button
              onClick={handleInsert}
              className="p-1 rounded text-slate-500 hover:text-emerald-300 hover:bg-slate-700/50 transition-colors"
              title="Insérer dans l'éditeur"
            >
              <FileInput className="size-3" />
            </button>
          )}
        </div>
      </div>
      <div className="group bg-slate-800/80 border border-slate-700/50 rounded-2xl rounded-bl-md px-4 py-3">
        <div className="prose prose-invert prose-sm max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:mb-2 [&_ol]:mb-2 [&_li]:mb-0.5 [&_strong]:text-emerald-300 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-xs [&_code]:text-emerald-300 [&_code]:bg-slate-800 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_blockquote]:border-l-2 [&_blockquote]:border-emerald-700 [&_blockquote]:pl-3 [&_blockquote]:italic [&_hr]:border-slate-700 [&_pre]:bg-slate-900 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}

export default function ThesisAssistantChat({
  open,
  onOpenChange,
  chapterNumber,
  chapterTitle,
  chapterContent,
  chapters,
  thesisTitle,
  thesisField,
  onInsertText,
}: ThesisAssistantChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: WELCOME_MESSAGE },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeMode, setActiveMode] = useState<AssistantMode>('general')
  const [sessionId, setSessionId] = useState(generateSessionId)
  const [contextEnabled, setContextEnabled] = useState(true)

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

  // Build thesis progress array from chapters
  const thesisProgress: ChapterProgress[] | undefined = chapters
    ? chapters.map((c) => ({
        number: c.number,
        title: c.title,
        wordCount: c.wordCount,
        status: c.status,
      }))
    : undefined

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim()
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
      const reqBody: Record<string, unknown> = {
        mode: activeMode,
        message: trimmed,
        sessionId,
      }

      // Inject chapter context if enabled and available
      if (contextEnabled) {
        if (chapterTitle) reqBody.chapterTitle = chapterTitle
        if (chapterNumber) reqBody.chapterNumber = chapterNumber
        if (chapterContent) reqBody.chapterContent = chapterContent
        if (thesisProgress) reqBody.thesisProgress = thesisProgress
        if (thesisTitle) reqBody.thesisTitle = thesisTitle
        if (thesisField) reqBody.thesisField = thesisField
        // Send all chapters content for RAG retrieval
        if (chapters && chapters.length > 0) {
          reqBody.allChaptersContent = chapters.map((c) => ({
            number: c.number,
            title: c.title,
            content: c.content,
          }))
        }
      }

      const res = await fetch('/api/thesis-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(withProviderConfig(reqBody)),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.response,
            ragChunksFound: data.ragChunksFound ?? 0,
          },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `\u26a0\ufe0f Erreur : ${data.error || 'Erreur inconnue.'}`,
          },
        ])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '\u26a0\ufe0f Erreur de connexion. Veuillez réessayer.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }, [input, loading, activeMode, sessionId, chapterTitle, chapterNumber, chapterContent, thesisProgress, thesisTitle, thesisField, contextEnabled, chapters])

  const clearConversation = useCallback(async () => {
    try {
      await fetch(`/api/thesis-assistant?sessionId=${sessionId}`, {
        method: 'DELETE',
      })
    } catch {
      // Silently ignore server clear errors
    }
    setMessages([{ role: 'assistant', content: WELCOME_MESSAGE }])
    setSessionId(generateSessionId())
  }, [sessionId])

  const handleModeChange = useCallback(
    (mode: AssistantMode) => {
      if (mode === activeMode) return
      if (messages.length > 1) {
        const confirmed = window.confirm(
          'Changer de mode réinitialisera la conversation. Continuer ?'
        )
        if (!confirmed) return
      }
      // Clear server-side conversation
      fetch(`/api/thesis-assistant?sessionId=${sessionId}`, {
        method: 'DELETE',
      }).catch(() => {})
      // Reset client state
      setMessages([{ role: 'assistant', content: WELCOME_MESSAGE }])
      setSessionId(generateSessionId())
      setActiveMode(mode)
    },
    [activeMode, messages.length, sessionId]
  )

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
        <SheetHeader className="flex-row items-center justify-between px-4 py-3 border-b border-slate-800 shrink-0">
          <SheetTitle className="flex items-center gap-2 text-slate-100 text-base">
            <MessageSquare className="size-5 text-emerald-400" />
            Assistant Thèse
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

        {/* Mode selector bar */}
        <div className="flex gap-1 px-4 py-2 overflow-x-auto no-scrollbar border-b border-slate-800/50 shrink-0">
          {ASSISTANT_MODES.map((mode) => {
            const Icon = ICON_MAP[mode.icon]
            const isActive = mode.id === activeMode
            return (
              <button
                key={mode.id}
                onClick={() => handleModeChange(mode.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0',
                  isActive
                    ? cn('bg-slate-800', mode.color)
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                )}
              >
                {Icon && <Icon className="size-3.5" />}
                {mode.label}
              </button>
            )
          })}
        </div>

        {/* Context indicator */}
        {chapterTitle && contextEnabled && (
          <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-900/60 border-b border-slate-800/30 shrink-0">
            <BookOpen className="size-3 text-emerald-500/70 shrink-0" />
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

        {/* Messages area */}
        <div ref={scrollRef} className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-3 p-4 pb-2">
              {messages.map((msg, i) =>
                msg.role === 'assistant' && i > 0 ? (
                  <AssistantBubble
                    key={i}
                    content={msg.content}
                    activeMode={activeMode}
                    onInsertText={onInsertText}
                    ragChunksFound={msg.ragChunksFound}
                  />
                ) : (
                  <div
                    key={i}
                    className={cn(msg.role === 'user' ? 'ml-8' : 'mr-8')}
                  >
                    <p
                      className={cn(
                        'text-xs mb-1',
                        msg.role === 'user'
                          ? 'text-right text-emerald-400'
                          : 'text-left text-slate-400'
                      )}
                    >
                      {msg.role === 'user' ? 'Vous' : 'Assistant'}
                    </p>
                    <div
                      className={cn(
                        'px-4 py-3',
                        msg.role === 'user'
                          ? 'bg-emerald-900/30 border border-emerald-800/40 rounded-2xl rounded-br-md'
                          : 'bg-slate-800/80 border border-slate-700/50 rounded-2xl rounded-bl-md'
                      )}
                    >
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-invert prose-sm max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:mb-2 [&_ol]:mb-2 [&_li]:mb-0.5 [&_strong]:text-emerald-300 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-xs [&_code]:text-emerald-300 [&_code]:bg-slate-800 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_blockquote]:border-l-2 [&_blockquote]:border-emerald-700 [&_blockquote]:pl-3 [&_blockquote]:italic [&_hr]:border-slate-700 [&_pre]:bg-slate-900 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto">
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
                <div className="mr-8">
                  <p className="text-xs mb-1 text-left text-slate-400">Assistant</p>
                  <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Loader2 className="size-4 animate-spin" />
                      Réflexion en cours…
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Input area */}
        <div className="shrink-0 border-t border-slate-800 px-4 py-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Envoyez un texte ou posez une question..."
              rows={1}
              className="flex-1 resize-none bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 max-h-[96px] overflow-y-auto"
            />
            <Button
              size="icon"
              className="size-10 shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white"
              disabled={!input.trim() || loading}
              onClick={sendMessage}
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
            className="text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-800 gap-1.5"
            onClick={clearConversation}
          >
            <Trash2 className="size-3" />
            Nouvelle conversation
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
