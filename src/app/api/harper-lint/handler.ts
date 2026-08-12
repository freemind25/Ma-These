import { NextRequest, NextResponse } from 'next/server'

// Harper-inspired linting rules for French academic writing
// Since Harper (Rust/WASM) is not directly runnable in Next.js,
// we implement equivalent academic writing lint rules in TypeScript.

interface LintSuggestion {
  message: string
  offset: number
  length: number
  severity: 'error' | 'warning' | 'info'
  ruleId: string
  ruleName: string
  replacements?: string[]
}

// Academic writing rules for French
const ACADEMIC_RULES: {
  id: string
  name: string
  pattern: RegExp
  message: string
  severity: 'error' | 'warning' | 'info'
  replacements?: string[]
}[] = [
  // Common French errors
  {
    id: 'a_à_confusion', name: 'A / A confusion',
    pattern: /\ba\s+(la|le|les|l\'|une|un|des|mon|ma|mes|ton|ta|tes|son|sa|ses|notre|nos|votre|vos|leur|leurs|ce|cet|cette|ces)/gi,
    message: 'Utilisez "a" (verbe avoir) ou "a" (preposition) ? Verifiez le contexte.',
    severity: 'warning',
  },
  // Passive voice in academic writing
  {
    id: 'passive_voice', name: 'Voix passive',
    pattern: /\b(est|sont|sera|seront|serait|seraient)\s+(\w+e[sd]?|\w+es)\s+(par|du|de la|des|le|la|les)\b/gi,
    message: 'Voix passive detectee. En redaction scientifique, privilegiez la voix active quand possible.',
    severity: 'warning',
  },
  // "C'est" in academic writing
  {
    id: 'cest', name: 'Expression familiere',
    pattern: /\bc'est\s+(un|une|le|la|les|du|des)\b/gi,
    message: '"C\'est" est familier. Utilisez une formulation plus academique (ex: "Il s\'agit de", "Ce dernier est").',
    severity: 'warning',
  },
  // Inclusive writing over-correction
  {
    id: 'repeated_words', name: 'Repetition de mots',
    pattern: /\b(\w{4,})\s+\1\b/gi,
    message: 'Mot repete a la suite. Variez votre vocabulaire.',
    severity: 'info',
  },
  // Long sentences (>50 words approximated by chars)
  {
    id: 'long_sentence', name: 'Phrase trop longue',
    pattern: /[^.!?]{300,}[.!?]/g,
    message: 'Phrase tres longue detectee. Decoupez-la pour ameliorer la lisibilite.',
    severity: 'info',
  },
  // "Donc" at start of sentence (informal in French academic writing)
  {
    id: 'dont_start', name: 'Connecteur informel',
    pattern: /(?:^|[.!?]\s+)Donc\b/gi,
    message: '"Donc" en debut de phrase est trop familier. Utilisez "Par consequent", "Ainsi", "En consequence".',
    replacements: ['Par consequent', 'Ainsi', 'En consequence'],
    severity: 'warning',
  },
  // "Et puis" (informal)
  {
    id: 'et_puis', name: 'Expression familiere',
    pattern: /\bet puis\b/gi,
    message: '"Et puis" est familier. Utilisez "De plus", "En outre", "Par ailleurs".',
    replacements: ['De plus', 'En outre', 'Par ailleurs'],
    severity: 'warning',
  },
  // "En fait" (informal)
  {
    id: 'en_fait', name: 'Expression familiere',
    pattern: /\ben fait\b/gi,
    message: '"En fait" est familier. Utilisez "En realite", "De fait", "Effectivement".',
    replacements: ['En realite', 'De fait', 'Effectivement'],
    severity: 'warning',
  },
  // "Beaucoup de" (vague)
  {
    id: 'beaucoup_de', name: 'Imprecision',
    pattern: /\bbeaucoup de\b/gi,
    message: '"Beaucoup de" est vague. Soyez plus precis (ex: "nombreux", "plusieurs", "une majorite de").',
    replacements: ['nombreux', 'plusieurs', 'divers'],
    severity: 'info',
  },
  // "Très" overuse
  {
    id: 'tres_overuse', name: 'Surutilisation de "tres"',
    pattern: /\btres\s+(\w+)/gi,
    message: '"Tres" est souvent overutilise. Cherchez un adjectif plus precis.',
    severity: 'info',
  },
  // Missing space before : ; ? ! (French typography)
  {
    id: 'french_typo_colon', name: 'Typographie francaise',
    pattern: /[a-zA-Z0-9]:[a-zA-Z]/g,
    message: 'En francais, un espace inseparable precede les deux-points.',
    severity: 'info',
  },
  {
    id: 'french_typo_semicolon', name: 'Typographie francaise',
    pattern: /[a-zA-Z0-9];[a-zA-Z]/g,
    message: 'En francais, un espace inseparable precede le point-virgule.',
    severity: 'info',
  },
  {
    id: 'french_typo_exclamation', name: 'Typographie francaise',
    pattern: /[a-zA-Z0-9]![a-zA-Z0-9\s]/g,
    message: 'En francais, un espace inseparable precede le point d\'exclamation.',
    severity: 'info',
  },
]

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ matches: [], stats: { total: 0, errors: 0, warnings: 0, info: 0 } })
    }

    const matches: LintSuggestion[] = []

    for (const rule of ACADEMIC_RULES) {
      const regex = new RegExp(rule.pattern.source, rule.pattern.flags)
      let match
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          message: rule.message,
          offset: match.index,
          length: match[0].length,
          severity: rule.severity,
          ruleId: rule.id,
          ruleName: rule.name,
          replacements: rule.replacements,
        })
        // Avoid infinite loops for zero-length matches
        if (match[0].length === 0) regex.lastIndex++
      }
    }

    // Sort by offset
    matches.sort((a, b) => a.offset - b.offset)

    // Deduplicate overlapping matches
    const deduped: LintSuggestion[] = []
    let lastEnd = 0
    for (const m of matches) {
      if (m.offset >= lastEnd) {
        deduped.push(m)
        lastEnd = m.offset + m.length
      }
    }

    const stats = {
      total: deduped.length,
      errors: deduped.filter(m => m.severity === 'error').length,
      warnings: deduped.filter(m => m.severity === 'warning').length,
      info: deduped.filter(m => m.severity === 'info').length,
    }

    return NextResponse.json({ matches: deduped, stats })
  } catch (err) {
    console.error('Harper lint error:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erreur lors de l\'analyse Harper' }, { status: 500 })
  }
}
