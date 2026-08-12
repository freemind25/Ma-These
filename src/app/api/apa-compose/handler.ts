import { NextRequest, NextResponse } from 'next/server'
import { composeAPA, type ApaStatsInput, type TestType, type Language, type OutputLength, type TestSubtype } from '@/data/apa-stats-rules'

const VALID_TEST_TYPES: TestType[] = ['pearson_correlation', 'spearman_correlation', 't_test', 'anova', 'chi_square']
const VALID_LANGUAGES: Language[] = ['fr', 'en']
const VALID_LENGTHS: OutputLength[] = ['short', 'standard', 'detailed']

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const input: ApaStatsInput = {
      language: VALID_LANGUAGES.includes(body.language) ? body.language : 'fr',
      testType: VALID_TEST_TYPES.includes(body.testType) ? body.testType : 'pearson_correlation',
      testSubtype: body.testSubtype as TestSubtype | undefined,
      x: body.x,
      y: body.y,
      group1: body.group1,
      group2: body.group2,
      variable: body.variable,
      r: typeof body.r === 'number' ? body.r : undefined,
      p: typeof body.p === 'number' ? body.p : undefined,
      n: typeof body.n === 'number' ? body.n : undefined,
      df: typeof body.df === 'number' ? body.df : undefined,
      df1: typeof body.df1 === 'number' ? body.df1 : undefined,
      df2: typeof body.df2 === 'number' ? body.df2 : undefined,
      t: typeof body.t === 'number' ? body.t : undefined,
      f: typeof body.f === 'number' ? body.f : undefined,
      chi2: typeof body.chi2 === 'number' ? body.chi2 : undefined,
      d: typeof body.d === 'number' ? body.d : undefined,
      eta2: typeof body.eta2 === 'number' ? body.eta2 : undefined,
      partialEta2: typeof body.partialEta2 === 'number' ? body.partialEta2 : undefined,
      cramerV: typeof body.cramerV === 'number' ? body.cramerV : undefined,
      phi: typeof body.phi === 'number' ? body.phi : undefined,
      outputLength: VALID_LENGTHS.includes(body.outputLength) ? body.outputLength : 'standard',
      includeInterpretation: typeof body.includeInterpretation === 'boolean' ? body.includeInterpretation : false,
    }

    const result = composeAPA(input)

    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { apaSentence: '', notes: [], warnings: [], errors: ['Erreur serveur.'] },
      { status: 500 },
    )
  }
}