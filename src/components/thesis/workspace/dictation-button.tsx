'use client'

// ─── SpeechRecognition API types ───────────────────────────────

interface ISpeechRecognition extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onresult: ((event: ISpeechRecognitionEvent) => void) | null
  onerror: ((event: ISpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
  abort(): void
}

interface ISpeechRecognitionEvent extends Event {
  resultIndex: number
  results: {
    length: number
    [index: number]: { isFinal: boolean; length: number; [index: number]: { transcript: string; confidence: number } }
  }
}

interface ISpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition
    webkitSpeechRecognition: new () => ISpeechRecognition
  }
}

import { useState, useRef, useCallback, useEffect } from 'react'
import { Mic, MicOff, Loader2, AudioLines, Wand2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { withProviderConfig } from '@/hooks/use-provider-config'

// ─── Types ────────────────────────────────────────────────────────

export interface DictationContext {
  chapterTitle?: string
  chapterNumber?: string
  surroundingText?: string
  vocabulary?: string[]
  language?: 'fr' | 'en'
}

export type DictationMode = 'browser' | 'server'
type DictationState = 'idle' | 'requesting' | 'recording' | 'transcribing' | 'postprocessing' | 'error'

interface DictationButtonProps {
  /** Called with the transcribed text when recording finishes */
  onTranscribed: (text: string) => void
  /** Called in edit mode with (selectedText, voiceInstruction) */
  onEditText?: (selectedText: string, instruction: string, result: string) => void
  /** Currently selected text in the editor (for edit mode) */
  selectedText?: string
  /** Chapter context for better transcription */
  chapterContext?: DictationContext
  /** Enable LLM post-processing (default: true for server mode) */
  enablePostProcess?: boolean
  disabled?: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────

function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
}

function getSpeechRecognition(): (new () => ISpeechRecognition) | null {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

/** Extract ~500 chars around a position in text */
function extractSurroundingText(fullText: string, cursorPos: number, windowSize = 500): string {
  if (!fullText || cursorPos <= 0) return fullText?.slice(0, 1000) || ''
  const start = Math.max(0, cursorPos - windowSize)
  const end = Math.min(fullText.length, cursorPos + windowSize)
  return fullText.slice(start, end)
}

// ─── Component ────────────────────────────────────────────────────

export default function DictationButton({
  onTranscribed,
  onEditText,
  selectedText,
  chapterContext,
  enablePostProcess = true,
  disabled,
}: DictationButtonProps) {
  const [state, setState] = useState<DictationState>('idle')
  const [mode, setMode] = useState<DictationMode>('server')
  const [elapsed, setElapsed] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [interimText, setInterimText] = useState('')
  const [postProcessResult, setPostProcessResult] = useState<{ text: string; hallucinationDetected?: boolean } | null>(null)
  const recognitionRef = useRef<ISpeechRecognition | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const streamRef = useRef<MediaStream | null>(null)
  const onTranscribedRef = useRef(onTranscribed)
  const onEditTextRef = useRef(onEditText)
  const selectedTextRef = useRef(selectedText)
  const chapterContextRef = useRef(chapterContext)
  const enablePostProcessRef = useRef(enablePostProcess)

  useEffect(() => { onTranscribedRef.current = onTranscribed }, [onTranscribed])
  useEffect(() => { onEditTextRef.current = onEditText }, [onEditText])
  useEffect(() => { selectedTextRef.current = selectedText }, [selectedText])
  useEffect(() => { chapterContextRef.current = chapterContext }, [chapterContext])
  useEffect(() => { enablePostProcessRef.current = enablePostProcess }, [enablePostProcess])

  // ─── Shared helpers ───────────────────────────────────────────
  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = undefined }
    setElapsed(0)
  }, [])

  const stopStream = useCallback(() => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null }
  }, [])

  useEffect(() => {
    return () => { stopTimer(); stopStream(); recognitionRef.current?.abort() }
  }, [stopTimer, stopStream])

  // ─── LLM Post-processing ──────────────────────────────────────
  const postProcessTranscript = useCallback(async (rawText: string): Promise<string> => {
    if (!enablePostProcessRef.current || mode === 'browser') {
      return cleanBrowserText(rawText)
    }

    try {
      setState('postprocessing')
      const ctx = chapterContextRef.current

      const res = await fetch('/api/dictation/post-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(withProviderConfig({
          mode: 'cleanup',
          transcript: rawText,
          context: ctx,
        })),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur post-traitement')

      if (data.hallucinationDetected) {
        console.warn('[Dictation] Anti-hallucination triggered:', data.hallucinationReason)
        setPostProcessResult({ text: data.text, hallucinationDetected: true })
      } else {
        setPostProcessResult({ text: data.text })
      }

      return data.text || rawText
    } catch (err) {
      console.warn('[Dictation] Post-process failed, using basic cleanup:', err)
      return cleanBrowserText(rawText)
    } finally {
      setState('idle')
    }
  }, [mode])

  // ─── Voice Edit Mode ──────────────────────────────────────────
  const handleVoiceEdit = useCallback(async (instruction: string) => {
    const selText = selectedTextRef.current
    if (!selText || !onEditTextRef.current) return false

    try {
      setState('postprocessing')
      const ctx = chapterContextRef.current

      const res = await fetch('/api/dictation/post-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(withProviderConfig({
          mode: 'edit',
          selectedText: selText,
          instruction,
          context: ctx,
        })),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur edit mode')

      onEditTextRef.current(selText, instruction, data.text || selText)
      return true
    } catch (err) {
      console.warn('[Dictation] Edit mode failed:', err)
      return false
    } finally {
      setState('idle')
    }
  }, [])

  // ─── Mode 1: Web Speech API (instant, browser-native) ───────────
  const startBrowserRecognition = useCallback(() => {
    const SpeechRecognitionCtor = getSpeechRecognition()
    if (!SpeechRecognitionCtor) { setMode('server'); return false }

    const recognition = new SpeechRecognitionCtor()
    recognitionRef.current = recognition
    recognition.lang = (chapterContextRef.current?.language === 'en') ? 'en-US' : 'fr-FR'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    let finalTranscript = ''

    recognition.onresult = (event: ISpeechRecognitionEvent) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript + ' '
        } else {
          interim += result[0].transcript
        }
      }
      setInterimText(interim)
    }

    recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
      console.warn('[SpeechAPI]', event.error)
      if (event.error === 'not-allowed') setErrorMsg('Microphone refusé')
      else if (event.error === 'no-speech') setErrorMsg('Aucune parole détectée')
      else setErrorMsg(`Erreur: ${event.error}`)
      setState('error')
    }

    recognition.onend = async () => {
      stopTimer()
      const raw = finalTranscript.trim()
      if (raw.length > 0) {
        // Edit mode: if text is selected, treat dictation as instruction
        if (selectedTextRef.current && onEditTextRef.current) {
          const ok = await handleVoiceEdit(raw)
          if (ok) { setInterimText(''); setState('idle'); return }
          // If edit failed, fall through to normal dictation
        }
        const cleaned = await postProcessTranscript(raw)
        onTranscribedRef.current(cleaned)
      }
      setInterimText('')
      setState('idle')
    }

    recognition.start()
    setState('recording')

    const startTime = Date.now()
    timerRef.current = setInterval(() => {
      const seconds = Math.floor((Date.now() - startTime) / 1000)
      setElapsed(seconds)
      if (seconds >= 300) recognition.stop()
    }, 1000)

    return true
  }, [stopTimer, postProcessTranscript, handleVoiceEdit])

  // ─── Mode 2: Server-side (Groq Whisper) ────────────────────────
  const startServerRecording = useCallback(async () => {
    try {
      setState('requesting')
      setErrorMsg('')
      setPostProcessResult(null)

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000 },
      })

      streamRef.current = stream
      chunksRef.current = []

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'

      const recorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        stopStream()
        const blob = new Blob(chunksRef.current, { type: mimeType })

        if (blob.size < 1000) {
          setState('error'); setErrorMsg('Enregistrement trop court'); return
        }

        setState('transcribing')
        try {
          const arrayBuffer = await blob.arrayBuffer()
          const uint8 = new Uint8Array(arrayBuffer)
          let binary = ''
          for (let i = 0; i < uint8.length; i++) binary += String.fromCharCode(uint8[i])
          const base64 = btoa(binary)

          const res = await fetch('/api/asr/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audio: base64, language: chapterContextRef.current?.language || 'fr' }),
          })

          const data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Erreur de transcription')

          if (data.text && data.text.trim().length > 0) {
            const rawText = data.text.trim()

            // Edit mode: if text is selected, treat dictation as instruction
            if (selectedTextRef.current && onEditTextRef.current) {
              const ok = await handleVoiceEdit(rawText)
              if (ok) { setState('idle'); return }
            }

            const cleaned = await postProcessTranscript(rawText)
            onTranscribedRef.current(cleaned)
          } else {
            setState('idle')
          }
        } catch (err: unknown) {
          setState('error')
          setErrorMsg(err instanceof Error ? err.message : 'Erreur de transcription')
        }
      }

      recorder.onerror = () => {
        stopStream(); setState('error'); setErrorMsg("Erreur d'enregistrement")
      }

      recorder.start(250)
      setState('recording')

      const startTime = Date.now()
      timerRef.current = setInterval(() => {
        const seconds = Math.floor((Date.now() - startTime) / 1000)
        setElapsed(seconds)
        if (seconds >= 300) recorder.stop()
      }, 1000)
    } catch (err: unknown) {
      setState('error')
      if (err instanceof Error && err.name === 'NotAllowedError') setErrorMsg('Microphone refusé')
      else if (err instanceof Error && err.name === 'NotFoundError') setErrorMsg('Aucun microphone')
      else setErrorMsg('Erreur microphone')
    }
  }, [stopStream, postProcessTranscript, handleVoiceEdit])

  // ─── Actions ────────────────────────────────────────────────────
  const handleClick = () => {
    if (state === 'recording') {
      if (mode === 'browser') recognitionRef.current?.stop()
      else mediaRecorderRef.current?.stop()
      return
    }
    if (state === 'idle' || state === 'error') {
      setInterimText('')
      setPostProcessResult(null)
      if (mode === 'browser') {
        const started = startBrowserRecognition()
        if (!started) startServerRecording()
      } else {
        startServerRecording()
      }
    }
  }

  const toggleMode = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (state !== 'idle' && state !== 'error') return
    setMode(prev => (prev === 'browser' ? 'server' : 'browser'))
    setErrorMsg('')
  }

  const isRecording = state === 'recording'
  const isBusy = state === 'requesting' || state === 'transcribing' || state === 'postprocessing'
  const isEditMode = !!selectedText && !!onEditText

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return m > 0 ? `${m}:${sec.toString().padStart(2, '0')}` : `${sec}s`
  }

  const tooltipLines: string[] = []
  if (isRecording) {
    tooltipLines.push(`${mode === 'browser' ? 'Navigateur' : 'IA'} — ${formatTime(elapsed)}`)
    tooltipLines.push('Cliquez pour arrêter')
    if (isEditMode) tooltipLines.push('✨ Mode Édition : dictez l\'instruction')
  } else if (state === 'postprocessing') {
    tooltipLines.push('Nettoyage IA en cours…')
  } else if (state === 'transcribing') {
    tooltipLines.push('Transcription IA en cours…')
  } else if (state === 'error') {
    tooltipLines.push(errorMsg || 'Réessayez')
  } else {
    tooltipLines.push(`Dictée (${mode === 'browser' ? 'navigateur' : 'IA + nettoyage'})`)
    tooltipLines.push('Clic droit pour changer le mode')
    if (isEditMode) tooltipLines.push('✨ Texte sélectionné → mode édition vocal')
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleClick}
            onContextMenu={toggleMode}
            disabled={disabled || state === 'requesting'}
            className={cn(
              'relative flex items-center justify-center w-9 h-9 rounded-full transition-all',
              isRecording
                ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30'
                : state === 'transcribing' || state === 'postprocessing'
                  ? 'bg-violet-500 text-white animate-pulse'
                  : state === 'error'
                    ? 'bg-red-100 text-red-500 hover:bg-red-200'
                    : isEditMode
                      ? 'text-amber-600 hover:bg-amber-50 hover:text-amber-700'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100',
              disabled && 'opacity-40 cursor-not-allowed',
            )}
          >
            {(state === 'requesting' || state === 'transcribing') && (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            )}
            {state === 'postprocessing' && (
              <Wand2 className="h-3.5 w-3.5 animate-spin" />
            )}
            {isRecording && <MicOff className="h-3.5 w-3.5" />}
            {(state === 'idle' || state === 'error') && (
              isEditMode ? (
                <Wand2 className="h-3.5 w-3.5" />
              ) : mode === 'browser' ? (
                <Mic className="h-3.5 w-3.5" />
              ) : (
                <AudioLines className="h-3.5 w-3.5" />
              )
            )}

            {isRecording && (
              <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
            )}

            {/* Edit mode indicator ring */}
            {isEditMode && (state === 'idle' || state === 'error') && (
              <span className="absolute -inset-0.5 rounded-full border-2 border-amber-400 border-dashed animate-pulse" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-[11px] max-w-[250px]">
          {tooltipLines.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// ─── Browser STT basic post-processing ────────────────────────────
function cleanBrowserText(text: string): string {
  let cleaned = text.replace(/\s+/g, ' ').trim()
  const fillers = /\b(euh|hum|bah|ben|hein|donc|voilà|enfin|quoi\?|tu vois|en fait)\b/gi
  cleaned = cleaned.replace(fillers, '')
  cleaned = cleaned.replace(/\s+/g, ' ').trim()
  if (cleaned.length > 0 && !['.', '!', '?', ';', ':', ',', '…'].includes(cleaned[cleaned.length - 1])) {
    cleaned += '.'
  }
  return cleaned
}
