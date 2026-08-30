import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

// ═══════════════════════════════════════════════════════════════
// ThesisFrame — Token Budget Assertion Test
//
// This test is the PERMANENT SENSOR for budget drift.
// It will fail whenever the knowledge core or specializations
// grow beyond the documented budget thresholds.
//
// When this test fails:
//   1. Investigate — is the growth legitimate?
//   2. If yes → update BUDGET constants below
//   3. If no → compact the module that grew
//   4. Update CONTEXT-PROJET.md § chiffres
//
// Governance protocol #11 step 4 requires re-measurement at
// each ingestion cycle. This test automates that requirement.
// ═══════════════════════════════════════════════════════════════

// ─── Budget targets (updated after Phase 2 diagnostic v1.9.5) ───
// These reflect the MEASURED reality. The old documented budget
// (3900 full / 3000 per-mode) was obsolete since v1.8.1.
//
// Decision: target = current measured + 10% headroom.
// Any FUTURE growth >10% will trigger a test failure.

const CHARS_PER_TOKEN = 3
const BUDGET_FULL_CORE_TOKENS = 24_000  // ~22,184 measured + 10%
const BUDGET_PER_MODE_TOKENS = 19_000  // ~17,102 (directeur) + 10%
const MAX_SINGLE_MODULE_TOKENS = 8_000

// ─── Module name mapping ───
const MODULE_NAME_MAP: Record<string, string> = {
  STYLE_MODULE: 'style',
  ETHICS_MODULE: 'ethics',
  COHERENCE_MODULE: 'coherence',
  AUTO_EDITION_MODULE: 'auto-edition',
  PEER_REVIEW_MODULE: 'peer-review',
  METHODOLOGY_MODULE: 'methodology',
  WRITING_PROCESS_MODULE: 'writing-process',
  LITERATURE_REVIEW_MODULE: 'literature-review',
  DATA_ANALYSIS_MODULE: 'data-analysis',
  GRANT_WRITING_MODULE: 'grant-writing',
  PUBLICATION_MODULE: 'publication',
  VISUALIZATION_MODULE: 'visualization',
  PRESENTATION_MODULE: 'presentation',
}

interface ModuleMeasurement { id: string; constName: string; chars: number; tokensEst: number }
interface ModeMeasurement { mode: string; modules: string[]; knowledgeChars: number; specializationChars: number; totalChars: number; totalTokensEst: number }
interface BudgetReport {
  timestamp: string; fullCore: { chars: number; tokensEst: number }
  modules: ModuleMeasurement[]; modes: ModeMeasurement[]
}

function measureBudget(): BudgetReport {
  const projectRoot = join(__dirname, '../../..')
  const kcContent = readFileSync(join(projectRoot, 'src/lib/ai/knowledge-core.ts'), 'utf-8')

  // Extract module string constants
  const moduleRegex = /const (\w+_MODULE) = `([\s\S]*?)`;/g
  const moduleMeasurements: ModuleMeasurement[] = []
  let totalCoreChars = 0
  let match: RegExpExecArray | null

  while ((match = moduleRegex.exec(kcContent)) !== null) {
    const id = MODULE_NAME_MAP[match[1]]
    if (!id) continue
    const chars = match[2].trim().length
    totalCoreChars += chars
    moduleMeasurements.push({ id, constName: match[1], chars, tokensEst: Math.round(chars / CHARS_PER_TOKEN) })
  }
  moduleMeasurements.sort((a, b) => b.chars - a.chars)

  // Extract specializations
  const specDir = join(projectRoot, 'src/lib/ai/specializations')
  const specFiles = readdirSync(specDir).filter(f => f.endsWith('.ts') && !f.endsWith('.test.ts'))
  const modeMeasurements: ModeMeasurement[] = []

  for (const file of specFiles) {
    const content = readFileSync(join(specDir, file), 'utf-8')
    const modMatch = content.match(/modules:\s*\[([^\]]*)\]/)
    const specMatch = content.match(/specialization:\s*`([\s\S]*?)`/)
    const modIds = modMatch
      ? (modMatch[1].match(/'([^']+)'/g) || []).map(s => s.replace(/'/g, ''))
      : []
    const specializationChars = specMatch ? specMatch[1].length : 0

    let knowledgeChars = 0
    for (const modId of modIds) {
      const mod = moduleMeasurements.find(m => m.id === modId)
      if (mod) knowledgeChars += mod.chars
    }

    const separatorChars = modIds.length > 0 ? 70 : 0
    const totalChars = knowledgeChars + separatorChars + specializationChars

    modeMeasurements.push({
      mode: file.replace('.ts', ''),
      modules: modIds,
      knowledgeChars,
      specializationChars,
      totalChars,
      totalTokensEst: Math.round(totalChars / CHARS_PER_TOKEN),
    })
  }

  modeMeasurements.sort((a, b) => b.totalTokensEst - a.totalTokensEst)

  return {
    timestamp: new Date().toISOString(),
    fullCore: { chars: totalCoreChars, tokensEst: Math.round(totalCoreChars / CHARS_PER_TOKEN) },
    modules: moduleMeasurements,
    modes: modeMeasurements,
  }
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

describe('Token Budget Assertions (permanent sensor)', () => {
  let report: BudgetReport

  beforeAll(() => {
    report = measureBudget()
  })

  it('full core should not exceed budget', () => {
    const { tokensEst, chars } = report.fullCore
    console.log(`  Full core: ${chars} chars, ~${tokensEst} tokens (budget: ${BUDGET_FULL_CORE_TOKENS})`)
    expect(
      tokensEst,
      `Full core at ~${tokensEst} tokens exceeds budget of ${BUDGET_FULL_CORE_TOKENS}. ` +
      `If growth is legitimate, update BUDGET_FULL_CORE_TOKENS. Otherwise, compact.`
    ).toBeLessThanOrEqual(BUDGET_FULL_CORE_TOKENS)
  })

  it('no mode should exceed per-mode budget', () => {
    const overBudget = report.modes.filter(m => m.totalTokensEst > BUDGET_PER_MODE_TOKENS)
    if (overBudget.length > 0) {
      const details = overBudget.map(m => `  ${m.mode}: ~${m.totalTokensEst} tok (${m.modules.join('+')})`).join('\n')
      console.log(`\n  Over-budget modes:\n${details}`)
    }
    expect(
      overBudget.length,
      `${overBudget.length} mode(s) exceed per-mode budget of ${BUDGET_PER_MODE_TOKENS} tokens. ` +
      `If growth is legitimate, update BUDGET_PER_MODE_TOKENS. Otherwise, reduce injected modules.`
    ).toBe(0)
  })

  it('no single module should exceed max single-module threshold', () => {
    const overThreshold = report.modules.filter(m => m.tokensEst > MAX_SINGLE_MODULE_TOKENS)
    if (overThreshold.length > 0) {
      const details = overThreshold.map(m => `  ${m.id}: ~${m.tokensEst} tok (${m.chars} chars)`).join('\n')
      console.log(`\n  Over-threshold modules:\n${details}`)
    }
    expect(
      overThreshold.length,
      `${overThreshold.length} module(s) exceed ${MAX_SINGLE_MODULE_TOKENS} token threshold. Consider splitting.`
    ).toBe(0)
  })

  it('should have exactly 13 knowledge modules', () => {
    expect(
      report.modules.length,
      `Expected 13 modules, found ${report.modules.length}. Update test if changed.`
    ).toBe(13)
  })

  it('all modes should have at least one module (or be explicitly standalone)', () => {
    const noModules = report.modes.filter(m => m.modules.length === 0)
    const allowedStandalone = ['deblocage', 'improvement', 'freeform', 'index']
    const unexpected = noModules.filter(m => !allowedStandalone.includes(m.mode))
    expect(
      unexpected.length,
      `${unexpected.map(m => m.mode).join(', ')} have no knowledge modules. Add to allowedStandalone if intentional.`
    ).toBe(0)
  })

  it('methodology module should be the largest (expected)', () => {
    const sorted = [...report.modules].sort((a, b) => b.chars - a.chars)
    expect(sorted[0].id).toBe('methodology')
    console.log(`  Largest: ${sorted[0].id} (~${sorted[0].tokensEst} tok)`)
    console.log(`  Smallest: ${sorted[sorted.length - 1].id} (~${sorted[sorted.length - 1].tokensEst} tok)`)
  })

  it('measurement should produce valid report', () => {
    expect(report.modules.length).toBeGreaterThan(0)
    expect(report.modes.length).toBeGreaterThan(0)
    expect(report.fullCore.tokensEst).toBeGreaterThan(0)
    console.log(`  Report: ${report.modules.length} modules, ${report.modes.length} modes`)
    console.log(`  Full core: ~${report.fullCore.tokensEst} tokens (${report.fullCore.chars} chars)`)
  })
})
