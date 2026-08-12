'use client'

import { useState, useCallback, useMemo } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  type TestType, type TestSubtype, type OutputLength, type Language,
  type ApaStatsInput, type ApaStatsOutput,
  TEST_TYPE_LABELS, TEST_SUBTYPE_LABELS, SUBTYPES_BY_TEST, APA_RULES,
  composeAPA,
} from '@/data/apa-stats-rules'
import {
  BarChart3, Copy, Check, AlertTriangle, Info, AlertCircle, RotateCcw,
  ChevronDown, ChevronRight, Globe, Languages, FileText, Sparkles,
} from 'lucide-react'

interface ApaResultsComposerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// ─── Helper: stat field for dynamic form ─────────────
interface StatField {
  key: string
  label: string
  placeholder: string
  step?: string
  onlyFor?: TestType[]
}

const STAT_FIELDS: StatField[] = [
  { key: 'x', label: 'Variable X', placeholder: 'ex. Stress perçu', onlyFor: ['pearson_correlation', 'spearman_correlation', 'chi_square'] },
  { key: 'y', label: 'Variable Y', placeholder: 'ex. Dépression', onlyFor: ['pearson_correlation', 'spearman_correlation', 'chi_square'] },
  { key: 'group1', label: 'Groupe 1', placeholder: 'ex. Contrôle', onlyFor: ['t_test'] },
  { key: 'group2', label: 'Groupe 2', placeholder: 'ex. Expérimental', onlyFor: ['t_test'] },
  { key: 'variable', label: 'Variable indép.', placeholder: 'ex. Type de traitement', onlyFor: ['anova'] },
  { key: 'r', label: 'r', placeholder: 'ex. .56', step: '0.01', onlyFor: ['pearson_correlation', 'spearman_correlation'] },
  { key: 'p', label: 'p', placeholder: 'ex. .001', step: '0.001' },
  { key: 'n', label: 'N', placeholder: 'ex. 200', step: '1' },
  { key: 'df', label: 'df', placeholder: 'ex. 198', step: '1', onlyFor: ['pearson_correlation', 'spearman_correlation', 't_test', 'chi_square'] },
  { key: 'df1', label: 'df1', placeholder: 'ex. 3', step: '1', onlyFor: ['anova'] },
  { key: 'df2', label: 'df2', placeholder: 'ex. 196', step: '1', onlyFor: ['anova'] },
  { key: 't', label: 't', placeholder: 'ex. 3.42', step: '0.01', onlyFor: ['t_test'] },
  { key: 'f', label: 'F', placeholder: 'ex. 5.67', step: '0.01', onlyFor: ['anova'] },
  { key: 'chi2', label: 'χ²', placeholder: 'ex. 12.34', step: '0.01', onlyFor: ['chi_square'] },
  { key: 'd', label: "Cohen's d", placeholder: 'ex. .45', step: '0.01', onlyFor: ['t_test'] },
  { key: 'eta2', label: 'η²', placeholder: 'ex. .12', step: '0.01', onlyFor: ['anova'] },
  { key: 'partialEta2', label: 'η² partiel', placeholder: 'ex. .15', step: '0.01', onlyFor: ['anova'] },
  { key: 'cramerV', label: "Cramér's V", placeholder: 'ex. .30', step: '0.01', onlyFor: ['chi_square'] },
  { key: 'phi', label: 'φ (phi)', placeholder: 'ex. .25', step: '0.01', onlyFor: ['chi_square'] },
]

export default function ApaResultsComposer({ open, onOpenChange }: ApaResultsComposerProps) {
  const [testType, setTestType] = useState<TestType>('pearson_correlation')
  const [testSubtype, setTestSubtype] = useState<TestSubtype | ''>('')
  const [language, setLanguage] = useState<Language>('fr')
  const [outputLength, setOutputLength] = useState<OutputLength>('standard')
  const [includeInterpretation, setIncludeInterpretation] = useState(false)
  const [fields, setFields] = useState<Record<string, string>>({})
  const [result, setResult] = useState<ApaStatsOutput | null>(null)
  const [copied, setCopied] = useState(false)
  const [showRules, setShowRules] = useState(false)

  const subtypes = useMemo(() => SUBTYPES_BY_TEST[testType] || [], [testType])
  const visibleFields = useMemo(
    () => STAT_FIELDS.filter(f => !f.onlyFor || f.onlyFor.includes(testType)),
    [testType],
  )

  const handleFieldChange = useCallback((key: string, value: string) => {
    setFields(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleTestTypeChange = useCallback((newType: TestType) => {
    setTestType(newType)
    setTestSubtype('')
    setResult(null)
    setFields({})
  }, [])

  const handleCompose = useCallback(() => {
    const input: ApaStatsInput = {
      language,
      testType,
      ...(testSubtype ? { testSubtype: testSubtype as TestSubtype } : {}),
      outputLength,
      includeInterpretation,
      ...(fields.x ? { x: fields.x } : {}),
      ...(fields.y ? { y: fields.y } : {}),
      ...(fields.group1 ? { group1: fields.group1 } : {}),
      ...(fields.group2 ? { group2: fields.group2 } : {}),
      ...(fields.variable ? { variable: fields.variable } : {}),
      ...(fields.r !== undefined && fields.r !== '' ? { r: parseFloat(fields.r) } : {}),
      ...(fields.p !== undefined && fields.p !== '' ? { p: parseFloat(fields.p) } : {}),
      ...(fields.n !== undefined && fields.n !== '' ? { n: parseInt(fields.n) } : {}),
      ...(fields.df !== undefined && fields.df !== '' ? { df: parseInt(fields.df) } : {}),
      ...(fields.df1 !== undefined && fields.df1 !== '' ? { df1: parseInt(fields.df1) } : {}),
      ...(fields.df2 !== undefined && fields.df2 !== '' ? { df2: parseInt(fields.df2) } : {}),
      ...(fields.t !== undefined && fields.t !== '' ? { t: parseFloat(fields.t) } : {}),
      ...(fields.f !== undefined && fields.f !== '' ? { f: parseFloat(fields.f) } : {}),
      ...(fields.chi2 !== undefined && fields.chi2 !== '' ? { chi2: parseFloat(fields.chi2) } : {}),
      ...(fields.d !== undefined && fields.d !== '' ? { d: parseFloat(fields.d) } : {}),
      ...(fields.eta2 !== undefined && fields.eta2 !== '' ? { eta2: parseFloat(fields.eta2) } : {}),
      ...(fields.partialEta2 !== undefined && fields.partialEta2 !== '' ? { partialEta2: parseFloat(fields.partialEta2) } : {}),
      ...(fields.cramerV !== undefined && fields.cramerV !== '' ? { cramerV: parseFloat(fields.cramerV) } : {}),
      ...(fields.phi !== undefined && fields.phi !== '' ? { phi: parseFloat(fields.phi) } : {}),
    }
    const output = composeAPA(input)
    setResult(output)
  }, [language, testType, testSubtype, outputLength, includeInterpretation, fields])

  const handleReset = useCallback(() => {
    setFields({})
    setResult(null)
  }, [])

  const handleCopy = useCallback(async () => {
    if (!result?.apaSentence) return
    try {
      await navigator.clipboard.writeText(result.apaSentence)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = result.apaSentence
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [result])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[540px] sm:w-[640px] p-0 flex flex-col overflow-hidden">
        <SheetHeader className="px-6 pt-6 pb-2 shrink-0">
          <SheetTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4 text-amber-500" />
            APA Results Composer
          </SheetTitle>
          <p className="text-xs text-slate-500 mt-1">
            Transformez vos résultats statistiques en phrases conformes APA 7
          </p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
          {/* ═══ TEST TYPE ═══ */}
          <div>
            <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 block">
              Type de test
            </Label>
            <div className="grid grid-cols-3 gap-1.5">
              {(Object.entries(TEST_TYPE_LABELS) as [TestType, typeof TEST_TYPE_LABELS[TestType]][]).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => handleTestTypeChange(key)}
                  className={cn(
                    'flex items-center gap-1.5 p-2 rounded-lg border text-xs transition-all text-left',
                    testType === key
                      ? 'border-amber-400 bg-amber-50 text-amber-900'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50',
                  )}
                >
                  <span>{val.icon}</span>
                  <span className="font-medium truncate">{val[language]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ═══ SUBTYPE (conditional) ═══ */}
          {subtypes.length > 0 && (
            <div>
              <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 block">
                Sous-type
              </Label>
              <div className="flex gap-1.5">
                {subtypes.map(st => (
                  <button
                    key={st}
                    onClick={() => setTestSubtype(testSubtype === st ? '' : st)}
                    className={cn(
                      'px-3 py-1.5 rounded-md border text-xs font-medium transition-all',
                      testSubtype === st
                        ? 'border-amber-400 bg-amber-50 text-amber-900'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50',
                    )}
                  >
                    {TEST_SUBTYPE_LABELS[st][language]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ═══ OPTIONS ROW ═══ */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-slate-400" />
              <div className="flex rounded-md border border-slate-200 overflow-hidden">
                <button
                  onClick={() => setLanguage('fr')}
                  className={cn(
                    'px-2.5 py-1 text-xs font-medium transition-colors',
                    language === 'fr' ? 'bg-amber-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-50',
                  )}
                >
                  FR
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={cn(
                    'px-2.5 py-1 text-xs font-medium transition-colors',
                    language === 'en' ? 'bg-amber-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-50',
                  )}
                >
                  EN
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={outputLength}
                onChange={e => setOutputLength(e.target.value as OutputLength)}
                className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                <option value="short">Court</option>
                <option value="standard">Standard</option>
                <option value="detailed">Détaillé</option>
              </select>
            </div>

            <button
              onClick={() => setIncludeInterpretation(!includeInterpretation)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition-all',
                includeInterpretation
                  ? 'border-amber-400 bg-amber-50 text-amber-900'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50',
              )}
            >
              <Sparkles className="h-3 w-3" />
              Interpréter
            </button>
          </div>

          <Separator />

          {/* ═══ STAT FIELDS ═══ */}
          <div>
            <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 block">
              Données statistiques
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {visibleFields.map(field => (
                <div key={field.key}>
                  <label className="text-[10px] text-slate-500 mb-0.5 block">{field.label}</label>
                  <Input
                    type="text"
                    placeholder={field.placeholder}
                    value={fields[field.key] || ''}
                    onChange={e => handleFieldChange(field.key, e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ═══ ACTION BUTTONS ═══ */}
          <div className="flex gap-2">
            <Button
              onClick={handleCompose}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-xs gap-1.5"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Générer la phrase APA
            </Button>
            <Button variant="outline" onClick={handleReset} className="text-xs gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* ═══ RESULT ═══ */}
          {result && (
            <div className="space-y-3">
              <Separator />

              {/* Errors */}
              {result.errors.length > 0 && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 space-y-1">
                  {result.errors.map((err, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-red-700">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Warnings */}
              {result.warnings.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-1">
                  {result.warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-amber-700">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* APA Sentence */}
              {result.apaSentence && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">
                      Texte APA
                    </span>
                    <button
                      onClick={handleCopy}
                      className={cn(
                        'flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full transition-colors',
                        copied
                          ? 'bg-emerald-200 text-emerald-800'
                          : 'bg-white text-emerald-700 hover:bg-emerald-100 border border-emerald-200',
                      )}
                    >
                      {copied ? <Check className="h-2.5 w-2.5" /> : <Copy className="h-2.5 w-2.5" />}
                      {copied ? 'Copié !' : 'Copier'}
                    </button>
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed font-medium italic">
                    « {result.apaSentence} »
                  </p>
                </div>
              )}

              {/* Notes */}
              {result.notes.length > 0 && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 space-y-1">
                  {result.notes.map((note, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-blue-700">
                      <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══ APA RULES REFERENCE ═══ */}
          <Separator />\n          <div>
            <button
              onClick={() => setShowRules(!showRules)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors w-full"
            >
              <Languages className="h-3.5 w-3.5" />
              Règles APA 7 appliquées
              <Badge variant="secondary" className="text-[9px] ml-1">{APA_RULES.length}</Badge>
              {showRules ? <ChevronDown className="h-3 w-3 ml-auto" /> : <ChevronRight className="h-3 w-3 ml-auto" />}
            </button>
            {showRules && (
              <div className="mt-2 space-y-1">
                {APA_RULES.map(rule => (
                  <div key={rule.id} className="flex items-start gap-2 p-2 rounded-md bg-slate-50 text-xs text-slate-600">
                    <span className="shrink-0 w-4 h-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[8px] font-bold">✓</span>
                    <span className="leading-relaxed">{rule.rule}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}