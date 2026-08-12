// APA 7 Results Composer — Rules, templates, validation messages
// Based on APA Publication Manual, 7th Edition

// ─── Test Types ─────────────────────────────────────────
export type TestType =
  | 'pearson_correlation'
  | 'spearman_correlation'
  | 't_test'
  | 'anova'
  | 'chi_square'

export type TestSubtype =
  | 'independent'
  | 'paired'
  | 'welch'
  | 'one_way'
  | 'factorial'
  | 'independence'
  | 'goodness_of_fit'

export type OutputLength = 'short' | 'standard' | 'detailed'

export type Language = 'fr' | 'en'

export interface ApaStatsInput {
  language: Language
  testType: TestType
  testSubtype?: TestSubtype
  // Variables
  x?: string
  y?: string
  group1?: string
  group2?: string
  variable?: string
  // Statistics
  r?: number
  p?: number
  n?: number
  df?: number
  df1?: number
  df2?: number
  t?: number
  f?: number
  chi2?: number
  d?: number
  eta2?: number
  partialEta2?: number
  cramerV?: number
  phi?: number
  // Options
  outputLength?: OutputLength
  includeInterpretation?: boolean
}

export interface ValidationMessage {
  type: 'error' | 'warning' | 'info'
  message: string
}

export interface ApaStatsOutput {
  apaSentence: string
  notes: string[]
  warnings: string[]
  errors: string[]
}

// ─── Test Type Labels ────────────────────────────────────
export const TEST_TYPE_LABELS: Record<TestType, { fr: string; en: string; icon: string }> = {
  pearson_correlation: { fr: 'Corrélation de Pearson', en: 'Pearson Correlation', icon: '📊' },
  spearman_correlation: { fr: 'Corrélation de Spearman', en: 'Spearman Correlation', icon: '📈' },
  t_test: { fr: 'Test t', en: 't-Test', icon: '⚖️' },
  anova: { fr: 'ANOVA', en: 'ANOVA', icon: '📉' },
  chi_square: { fr: 'Chi-carré', en: 'Chi-Square', icon: '🔲' },
}

export const TEST_SUBTYPE_LABELS: Record<TestSubtype, { fr: string; en: string }> = {
  independent: { fr: 'Indépendant', en: 'Independent' },
  paired: { fr: 'Apparié', en: 'Paired' },
  welch: { fr: 'Welch', en: 'Welch' },
  one_way: { fr: 'Un facteur', en: 'One-way' },
  factorial: { fr: 'Factoriel', en: 'Factorial' },
  independence: { fr: 'Indépendance', en: 'Independence' },
  goodness_of_fit: { fr: 'Adéquation', en: 'Goodness-of-fit' },
}

export const SUBTYPES_BY_TEST: Record<TestType, TestSubtype[]> = {
  pearson_correlation: [],
  spearman_correlation: [],
  t_test: ['independent', 'paired', 'welch'],
  anova: ['one_way', 'factorial'],
  chi_square: ['independence', 'goodness_of_fit'],
}

// ─── APA 7 Rules ─────────────────────────────────────────
export const APA_RULES = [
  { id: 'no-leading-zero', rule: 'Pas de zéro avant la virgule pour r, p (ex. r = .56, p = .045, pas 0.56 ou 0.045)' },
  { id: 'p-three-decimals', rule: 'p rapporté avec 3 décimales (p = .045), ou p < .001 si très petit' },
  { id: 'stats-two-decimals', rule: 'Statistiques (r, t, F, χ²) arrondies à 2 décimales par défaut' },
  { id: 'p-less-threshold', rule: 'Si p < .001, écrire « p < .001 » et non la valeur exacte' },
  { id: 'direction-required', rule: 'Toujours mentionner la direction (positive/négative) pour les corrélations' },
  { id: 'no-causality', rule: 'Ne jamais utiliser de langage causal pour les corrélations' },
  { id: 'df-auto', rule: 'df calculé automatiquement : df = N − 2 pour les corrélations' },
  { id: 'effect-size', rule: 'Toujours inclure une taille d\'effet (d, η², V) quand disponible' },
  { id: 'italic-notation', rule: 'Notation standard : r, p, N, df, t, F, χ² en italique' },
  { id: 'spearman-monotonic', rule: 'Spearman = relation monotone (pas linéaire)' },
  { id: 'chi2-n', rule: 'Chi-carré : inclure N dans la notation χ²(df, N = n)' },
  { id: 'anova-partial-eta', rule: 'ANOVA : préférer η² partiel si disponible' },
  { id: 't-test-means', rule: 'Test t : inclure moyennes et écarts-types si disponibles' },
] as const

// ─── Sentence Templates ──────────────────────────────────
interface SentenceTemplate {
  short: string
  standard: string
  detailed: string
  interpretFr?: string
  interpretEn?: string
}

export const TEMPLATES: Record<TestType, { fr: SentenceTemplate; en: SentenceTemplate }> = {
  pearson_correlation: {
    fr: {
      short: 'r({df}) = {r}, {p}.',
      standard: 'Une corrélation {direction} significative a été observée entre {x} et {y}, r({df}) = {r}, {p}.',
      detailed: 'Une corrélation de Pearson a été réalisée afin d\'examiner la relation entre {x} et {y}. Les résultats révèlent une corrélation {direction} {strength} significative, r({df}) = {r}, {p}.',
      interpretFr: 'Cette {direction}ité de la relation suggère que {x} tend à {directionAction} {y}.',
    },
    en: {
      short: 'r({df}) = {r}, {p}.',
      standard: 'A {direction} significant correlation was observed between {x} and {y}, r({df}) = {r}, {p}.',
      detailed: 'A Pearson correlation was conducted to examine the relationship between {x} and {y}. Results reveal a significant {direction} {strength} correlation, r({df}) = {r}, {p}.',
      interpretEn: 'The {direction} direction of this relationship suggests that {x} tends to {directionAction} {y}.',
    },
  },
  spearman_correlation: {
    fr: {
      short: 'r_s({df}) = {r}, {p}.',
      standard: 'Une corrélation monotone {direction} significative a été observée entre {x} et {y}, r_s({df}) = {r}, {p}.',
      detailed: 'Une corrélation de Spearman a été réalisée afin d\'examiner la relation monotone entre {x} et {y}. Les résultats révèlent une corrélation {direction} {strength} significative, r_s({df}) = {r}, {p}.',
      interpretFr: 'La relation monotone {direction}e indique que l\'ordre des rangs de {x} tend à {directionAction} celui de {y}.',
    },
    en: {
      short: 'r_s({df}) = {r}, {p}.',
      standard: 'A {direction} significant monotonic correlation was observed between {x} and {y}, r_s({df}) = {r}, {p}.',
      detailed: 'A Spearman correlation was conducted to examine the monotonic relationship between {x} and {y}. Results reveal a significant {direction} {strength} monotonic correlation, r_s({df}) = {r}, {p}.',
      interpretEn: 'The {direction} monotonic relationship indicates that the rank order of {x} tends to {directionAction} that of {y}.',
    },
  },
  t_test: {
    fr: {
      short: 't({df}) = {t}, {p}{effect}.',
      standard: 'Une différence significative a été observée entre {group1} et {group2}, t({df}) = {t}, {p}{effect}.',
      detailed: 'Un test t {subtype} a été réalisé afin de comparer {group1} et {group2}. Les résultats indiquent une différence significative, t({df}) = {t}, {p}{effect}.',
      interpretFr: 'Cela signifie que les scores de {group1} et {group2} diffèrent significativement.',
    },
    en: {
      short: 't({df}) = {t}, {p}{effect}.',
      standard: 'A significant difference was observed between {group1} and {group2}, t({df}) = {t}, {p}{effect}.',
      detailed: 'A {subtype} t-test was conducted to compare {group1} and {group2}. Results indicate a significant difference, t({df}) = {t}, {p}{effect}.',
      interpretEn: 'This indicates that the scores of {group1} and {group2} differ significantly.',
    },
  },
  anova: {
    fr: {
      short: 'F({df1}, {df2}) = {f}, {p}{effect}.',
      standard: 'Un effet significatif de {variable} a été observé, F({df1}, {df2}) = {f}, {p}{effect}.',
      detailed: 'Une ANOVA {subtype} a été réalisée afin d\'examiner l\'effet de {variable}. Les résultats révèlent un effet significatif, F({df1}, {df2}) = {f}, {p}{effect}.',
      interpretFr: 'Cela indique que {variable} a un effet statistiquement significatif sur la variable dépendante.',
    },
    en: {
      short: 'F({df1}, {df2}) = {f}, {p}{effect}.',
      standard: 'A significant effect of {variable} was observed, F({df1}, {df2}) = {f}, {p}{effect}.',
      detailed: 'A {subtype} ANOVA was conducted to examine the effect of {variable}. Results reveal a significant effect, F({df1}, {df2}) = {f}, {p}{effect}.',
      interpretEn: 'This indicates that {variable} has a statistically significant effect on the dependent variable.',
    },
  },
  chi_square: {
    fr: {
      short: 'χ²({df}{n}) = {chi2}, {p}{effect}.',
      standard: 'Une association significative a été observée entre {x} et {y}, χ²({df}{n}) = {chi2}, {p}{effect}.',
      detailed: 'Un test du chi-carré ({subtype}) a été réalisé afin d\'examiner l\'association entre {x} et {y}. Les résultats révèlent une association significative, χ²({df}{n}) = {chi2}, {p}{effect}.',
      interpretFr: 'Cela suggère que {x} et {y} ne sont pas indépendants dans la population étudiée.',
    },
    en: {
      short: 'χ²({df}{n}) = {chi2}, {p}{effect}.',
      standard: 'A significant association was observed between {x} and {y}, χ²({df}{n}) = {chi2}, {p}{effect}.',
      detailed: 'A chi-square test ({subtype}) was conducted to examine the association between {x} and {y}. Results reveal a significant association, χ²({df}{n}) = {chi2}, {p}{effect}.',
      interpretEn: 'This suggests that {x} and {y} are not independent in the studied population.',
    },
  },
}

// ─── Validation Messages ──────────────────────────────────
export const VALIDATION_MESSAGES = {
  missing_r: { type: 'error' as const, message: 'Valeur r manquante ou invalide.' },
  missing_p: { type: 'error' as const, message: 'Valeur p manquante ou invalide.' },
  missing_t: { type: 'error' as const, message: 'Valeur t manquante ou invalide.' },
  missing_f: { type: 'error' as const, message: 'Valeur F manquante ou invalide.' },
  missing_chi2: { type: 'error' as const, message: 'Valeur chi-carré manquante ou invalide.' },
  invalid_r_range: { type: 'error' as const, message: 'r doit être compris entre -1 et 1.' },
  invalid_p_range: { type: 'error' as const, message: 'p doit être compris entre 0 et 1.' },
  missing_df_anova: { type: 'warning' as const, message: 'df1 et df2 recommandés pour ANOVA.' },
  missing_n_chi_square: { type: 'warning' as const, message: 'N recommandé pour chi-carré.' },
  causality_risk: { type: 'warning' as const, message: 'Risque de formulation causale détecté.' },
  df_computed: { type: 'info' as const, message: 'df calculé automatiquement : {df}.' },
  format_applied: { type: 'info' as const, message: 'Format APA 7 appliqué (zéros initiaux retirés, arrondi).' },
  no_causality: { type: 'warning' as const, message: 'Corrélation ≠ causalité — ne pas interpréter en termes de cause à effet.' },
} as const

// ─── Effect Size Strength Labels ─────────────────────────
export function getStrengthLabel(r: number, lang: Language): string {
  const abs = Math.abs(r)
  if (lang === 'fr') {
    if (abs >= 0.7) return 'forte'
    if (abs >= 0.4) return 'modérée'
    if (abs >= 0.2) return 'faible'
    return 'très faible'
  }
  if (abs >= 0.7) return 'strong'
  if (abs >= 0.4) return 'moderate'
  if (abs >= 0.2) return 'weak'
  return 'very weak'
}

// ─── Core Formatting Functions ────────────────────────────

/** Remove leading zero for values that cannot exceed 1 (APA 7) */
export function apaFormatSmall(value: number, decimals: number = 2): string {
  if (value < 0.001 && decimals === 3) return '< .001'
  const fixed = value.toFixed(decimals)
  // Remove leading zero: 0.56 → .56
  return fixed.replace(/^0\./, '.')
}

/** Format p-value per APA 7 */
export function formatP(p: number | undefined): string {
  if (p === undefined || isNaN(p)) return 'p = ?'
  if (p < 0.001) return 'p < .001'
  return `p = ${apaFormatSmall(p, 3)}`
}

/** Format r-value per APA 7 */
export function formatR(r: number): string {
  return apaFormatSmall(r, 2)
}

/** Format t-value */
export function formatT(t: number): string {
  return t.toFixed(2)
}

/** Format F-value */
export function formatF(f: number): string {
  return f.toFixed(2)
}

/** Format chi-square value */
export function formatChi2(chi2: number): string {
  return chi2.toFixed(2)
}

/** Format effect size */
export function formatEffect(input: ApaStatsInput, lang: Language): string {
  if (input.testType === 't_test' && input.d !== undefined) {
    return lang === 'fr'
      ? `, d = ${apaFormatSmall(input.d, 2)}`
      : `, d = ${apaFormatSmall(input.d, 2)}`
  }
  if (input.testType === 'anova' && (input.partialEta2 !== undefined || input.eta2 !== undefined)) {
    const val = input.partialEta2 ?? input.eta2!
    const label = input.partialEta2 !== undefined ? 'η²p' : 'η²'
    return `, ${label} = ${apaFormatSmall(val, 2)}`
  }
  if (input.testType === 'chi_square' && (input.cramerV !== undefined || input.phi !== undefined)) {
    const val = input.cramerV ?? input.phi!
    const label = input.cramerV !== undefined ? (lang === 'fr' ? "Cramér's V" : "Cramér's V") : 'φ'
    return `, ${label} = ${apaFormatSmall(val, 2)}`
  }
  return ''
}

/** Get direction label */
export function getDirection(r: number, lang: Language): string {
  if (r > 0) return lang === 'fr' ? 'positive' : 'positive'
  if (r < 0) return lang === 'fr' ? 'négative' : 'negative'
  return lang === 'fr' ? 'nulle' : 'null'
}

/** Get direction action for interpretation */
export function getDirectionAction(r: number, lang: Language): string {
  if (r > 0) return lang === 'fr' ? 'augmenter avec' : 'increase with'
  if (r < 0) return lang === 'fr' ? 'diminuer avec' : 'decrease with'
  return lang === 'fr' ? 'varier sans relation claire avec' : 'vary without clear relationship with'
}

// ─── Main Compose Function ────────────────────────────────
export function composeAPA(input: ApaStatsInput): ApaStatsOutput {
  const notes: string[] = []
  const warnings: string[] = []
  const errors: string[] = []

  const lang = input.language || 'fr'
  const length = input.outputLength || 'standard'
  const templates = TEMPLATES[input.testType][lang]
  let sentence = ''

  // ── Validation per test type ──
  if (input.testType === 'pearson_correlation' || input.testType === 'spearman_correlation') {
    if (input.r === undefined || isNaN(input.r)) errors.push(VALIDATION_MESSAGES.missing_r.message)
    else if (Math.abs(input.r) > 1) errors.push(VALIDATION_MESSAGES.invalid_r_range.message)
    if (input.p === undefined || isNaN(input.p)) errors.push(VALIDATION_MESSAGES.missing_p.message)
    else if (input.p < 0 || input.p > 1) errors.push(VALIDATION_MESSAGES.invalid_p_range.message)

    // Auto-compute df = N - 2
    let df = input.df
    if (df === undefined && input.n !== undefined) {
      df = input.n - 2
      notes.push(VALIDATION_MESSAGES.df_computed.message.replace('{df}', String(df)))
    }

    warnings.push(VALIDATION_MESSAGES.no_causality.message)
    notes.push(VALIDATION_MESSAGES.format_applied.message)

    if (errors.length === 0 && input.r !== undefined) {
      const r = input.r
      const direction = getDirection(r, lang)
      const strength = getStrengthLabel(r, lang)
      const pStr = formatP(input.p)
      const rStr = formatR(r)
      const dfStr = df !== undefined ? String(df) : '?'

      const tpl = templates[length]
      sentence = tpl
        .replace('{direction}', direction)
        .replace('{strength}', strength)
        .replace('{x}', input.x || 'X')
        .replace('{y}', input.y || 'Y')
        .replace('{df}', dfStr)
        .replace('{r}', rStr)
        .replace('{p}', pStr)

      if (input.includeInterpretation) {
        const interpretTpl = lang === 'fr' ? templates.interpretFr : templates.interpretEn
        if (interpretTpl) {
          const action = getDirectionAction(r, lang)
          sentence += ' ' + interpretTpl
            .replace('{direction}', direction)
            .replace('{directionAction}', action)
            .replace('{x}', input.x || 'X')
            .replace('{y}', input.y || 'Y')
        }
      }
    }
  }

  else if (input.testType === 't_test') {
    if (input.t === undefined || isNaN(input.t)) errors.push(VALIDATION_MESSAGES.missing_t.message)
    if (input.p === undefined || isNaN(input.p)) errors.push(VALIDATION_MESSAGES.missing_p.message)
    else if (input.p < 0 || input.p > 1) errors.push(VALIDATION_MESSAGES.invalid_p_range.message)
    if (input.df === undefined) warnings.push('df recommandé pour le test t.')

    notes.push(VALIDATION_MESSAGES.format_applied.message)

    if (errors.length === 0 && input.t !== undefined) {
      const effect = formatEffect(input, lang)
      const tStr = formatT(input.t)
      const pStr = formatP(input.p)
      const dfStr = input.df !== undefined ? String(input.df) : '?'
      const subtype = input.testSubtype
        ? (TEST_SUBTYPE_LABELS[input.testSubtype]?.[lang] || '')
        : ''

      const tpl = templates[length]
      sentence = tpl
        .replace('{group1}', input.group1 || 'Groupe 1')
        .replace('{group2}', input.group2 || 'Groupe 2')
        .replace('{df}', dfStr)
        .replace('{t}', tStr)
        .replace('{p}', pStr)
        .replace('{effect}', effect)
        .replace('{subtype}', subtype)

      if (input.includeInterpretation) {
        const interpretTpl = lang === 'fr' ? templates.interpretFr : templates.interpretEn
        if (interpretTpl) {
          sentence += ' ' + interpretTpl
            .replace('{group1}', input.group1 || 'Groupe 1')
            .replace('{group2}', input.group2 || 'Groupe 2')
        }
      }
    }
  }

  else if (input.testType === 'anova') {
    if (input.f === undefined || isNaN(input.f)) errors.push(VALIDATION_MESSAGES.missing_f.message)
    if (input.p === undefined || isNaN(input.p)) errors.push(VALIDATION_MESSAGES.missing_p.message)
    else if (input.p < 0 || input.p > 1) errors.push(VALIDATION_MESSAGES.invalid_p_range.message)
    if (input.df1 === undefined || input.df2 === undefined) warnings.push(VALIDATION_MESSAGES.missing_df_anova.message)

    notes.push(VALIDATION_MESSAGES.format_applied.message)

    if (errors.length === 0 && input.f !== undefined) {
      const effect = formatEffect(input, lang)
      const fStr = formatF(input.f)
      const pStr = formatP(input.p)
      const df1Str = input.df1 !== undefined ? String(input.df1) : '?'
      const df2Str = input.df2 !== undefined ? String(input.df2) : '?'
      const subtype = input.testSubtype
        ? (TEST_SUBTYPE_LABELS[input.testSubtype]?.[lang] || '')
        : ''

      const tpl = templates[length]
      sentence = tpl
        .replace('{variable}', input.variable || 'X')
        .replace('{df1}', df1Str)
        .replace('{df2}', df2Str)
        .replace('{f}', fStr)
        .replace('{p}', pStr)
        .replace('{effect}', effect)
        .replace('{subtype}', subtype)

      if (input.includeInterpretation) {
        const interpretTpl = lang === 'fr' ? templates.interpretFr : templates.interpretEn
        if (interpretTpl) {
          sentence += ' ' + interpretTpl.replace('{variable}', input.variable || 'X')
        }
      }
    }
  }

  else if (input.testType === 'chi_square') {
    if (input.chi2 === undefined || isNaN(input.chi2)) errors.push(VALIDATION_MESSAGES.missing_chi2.message)
    if (input.p === undefined || isNaN(input.p)) errors.push(VALIDATION_MESSAGES.missing_p.message)
    else if (input.p < 0 || input.p > 1) errors.push(VALIDATION_MESSAGES.invalid_p_range.message)
    if (input.n === undefined) warnings.push(VALIDATION_MESSAGES.missing_n_chi_square.message)

    notes.push(VALIDATION_MESSAGES.format_applied.message)

    if (errors.length === 0 && input.chi2 !== undefined) {
      const effect = formatEffect(input, lang)
      const chi2Str = formatChi2(input.chi2)
      const pStr = formatP(input.p)
      const dfStr = input.df !== undefined ? String(input.df) : '?'
      const nStr = input.n !== undefined ? `, N = ${input.n}` : ''
      const subtype = input.testSubtype
        ? (TEST_SUBTYPE_LABELS[input.testSubtype]?.[lang] || '')
        : ''

      const tpl = templates[length]
      sentence = tpl
        .replace('{x}', input.x || 'X')
        .replace('{y}', input.y || 'Y')
        .replace('{df}', dfStr)
        .replace('{n}', nStr)
        .replace('{chi2}', chi2Str)
        .replace('{p}', pStr)
        .replace('{effect}', effect)
        .replace('{subtype}', subtype)

      if (input.includeInterpretation) {
        const interpretTpl = lang === 'fr' ? templates.interpretFr : templates.interpretEn
        if (interpretTpl) {
          sentence += ' ' + interpretTpl
            .replace('{x}', input.x || 'X')
            .replace('{y}', input.y || 'Y')
        }
      }
    }
  }

  if (sentence === '' && errors.length > 0) {
    sentence = lang === 'fr'
      ? 'Impossible de générer la phrase APA — données insuffisantes.'
      : 'Cannot generate APA sentence — insufficient data.'
  }

  return { apaSentence: sentence, notes, warnings, errors }
}
