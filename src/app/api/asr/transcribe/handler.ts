import { NextRequest, NextResponse } from 'next/server'

// POST /api/asr/transcribe
// Body: { audio: string (base64), language?: string }
// Returns: { text: string, wordCount: number, provider: string }
//
// Providers (tried in order):
//   1. Groq Whisper V3 (if GROQ_API_KEY is set) — best quality, free tier
//   2. Z.ai SDK (dev mode only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { audio, language } = body

    if (!audio || typeof audio !== 'string') {
      return NextResponse.json({ error: 'Audio base64 requis' }, { status: 400 })
    }

    // Validate base64 size (max ~25MB audio — Groq free tier limit)
    const maxBase64Size = 35_000_000
    if (audio.length > maxBase64Size) {
      return NextResponse.json(
        { error: 'Fichier audio trop volumineux (max ~25 Mo)' },
        { status: 413 },
      )
    }

    let text = ''
    let provider = 'none'

    // ─── 1. Groq Whisper V3 (preferred: free, fast, accurate) ───
    const groqKey = process.env.GROQ_API_KEY
    if (groqKey) {
      try {
        const result = await transcribeWithGroq(audio, language, groqKey)
        text = result.text
        provider = 'groq-whisper-v3'
      } catch (err: unknown) {
        console.warn('[asr] Groq failed, trying next provider:', err instanceof Error ? err.message : err)
      }
    }

    // ─── 2. Z.ai SDK (dev mode) ───
    if (!text && !process.env.AI_BASE_URL && !process.env.ZAI_BASE_URL) {
      try {
        const { getZAI } = await import('@/lib/zai')
        const zai = await getZAI()
        const response = await zai.audio.asr.create({ file_base64: audio })
        text = response.text || ''
        provider = 'zai'
      } catch (err: unknown) {
        console.warn('[asr] Z.ai SDK failed:', err instanceof Error ? err.message : err)
      }
    }

    if (!text) {
      return NextResponse.json(
        { error: 'Aucun fournisseur STT disponible. Ajoutez GROQ_API_KEY dans vos variables d\'environnement.' },
        { status: 503 },
      )
    }

    const cleaned = cleanTranscription(text)

    return NextResponse.json({
      text: cleaned,
      rawText: text,
      wordCount: cleaned.split(/\s+/).filter(Boolean).length,
      provider,
    })
  } catch (err: unknown) {
    console.error('[asr/transcribe]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur de transcription' },
      { status: 500 },
    )
  }
}

// ─── Groq Whisper V3 ────────────────────────────────────────────────
// OpenAI-compatible endpoint: POST https://api.groq.com/openai/v1/audio/transcriptions
// Supports: whisper-large-v3, whisper-large-v3-turbo
async function transcribeWithGroq(
  audioBase64: string,
  language: string | undefined,
  apiKey: string,
): Promise<{ text: string }> {
  // Decode base64 to buffer
  const binary = Buffer.from(audioBase64, 'base64')

  const formData = new FormData()
  formData.append('file', new Blob([binary]), 'audio.webm')
  formData.append('model', 'whisper-large-v3-turbo')
  formData.append('response_format', 'json')
  if (language) formData.append('language', language)

  const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Groq API ${res.status}: ${errText}`)
  }

  const data = await res.json()
  return { text: data.text || '' }
}

// ─── Post-processing ────────────────────────────────────────────────
function cleanTranscription(text: string): string {
  let cleaned = text.replace(/\s+/g, ' ').trim()

  // Capitalize first letter of sentences
  cleaned = cleaned.replace(
    /(^[a-zàâéèêëïîôùûüÿçñ]|(?<=[.!?]\s)[a-zàâéèêëïîôùûüÿçñ])/g,
    m => m.toUpperCase(),
  )

  // Remove common French filler words
  const fillers = /\b(euh|hum|bah|ben|hein|donc|voilà|enfin|quoi\?|tu vois|en fait)\b/gi
  cleaned = cleaned.replace(fillers, '')

  // Clean up double spaces after filler removal
  cleaned = cleaned.replace(/\s+/g, ' ').trim()

  // Ensure text ends with proper punctuation
  if (
    cleaned.length > 0 &&
    !['.', '!', '?', ';', ':', ',', '…'].includes(cleaned[cleaned.length - 1])
  ) {
    cleaned += '.'
  }

  return cleaned
}
