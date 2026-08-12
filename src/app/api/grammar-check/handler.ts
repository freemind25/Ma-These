import { NextRequest, NextResponse } from 'next/server'

const LANGUAGETOOL_URL = 'https://api.languagetool.org/v2/check'

interface GrammarMatch {
  message: string
  shortMessage: string
  offset: number
  length: number
  rule: { id: string; description: string; category: { id: string; name: string } }
  replacements: { value: string }[]
  context: { text: string; offset: number; length: number }
  type: { typeName: string }
}

export async function POST(req: NextRequest) {
  try {
    const { text, language = 'fr' } = await req.json()

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ matches: [], stats: { total: 0, errors: 0, warnings: 0, info: 0 } })
    }

    const formData = new URLSearchParams()
    formData.append('text', text)
    formData.append('language', language)
    formData.append('enabledRules', '')
    formData.append('disabledRules', 'WHITESPACE_RULE,EN_QUOTES,COMMA_PARENTHESIS_WHITESPACE')

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    const response = await fetch(LANGUAGETOOL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!response.ok) {
      throw new Error(`LanguageTool API error: ${response.status}`)
    }

    const data = await response.json()
    const matches: GrammarMatch[] = data.matches || []

    // Categorize matches
    const errors = matches.filter((m) => m.type?.typeName === 'Misspelling' || m.rule?.category?.id === 'TYPOS' || m.rule?.category?.id === 'GRAMMAR')
    const warnings = matches.filter((m) => m.rule?.category?.id === 'STYLE' || m.rule?.category?.id === 'REDUNDANCY' || m.rule?.category?.id === 'COLLOQUIALISMS')
    const info = matches.filter((m) => m.rule?.category?.id === 'MISC' || m.rule?.category?.id === 'TYPOGRAPHY')

    return NextResponse.json({
      matches,
      stats: {
        total: matches.length,
        errors: errors.length,
        warnings: warnings.length,
        info: info.length,
      },
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return NextResponse.json({ error: 'Délai d\'attente dépassé (15s). Texte trop long ?' }, { status: 504 })
    }
    console.error('Grammar check error:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erreur lors de la vérification grammaticale' }, { status: 500 })
  }
}
