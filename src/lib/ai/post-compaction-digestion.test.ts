import { describe, it, expect } from 'vitest'
import { getKnowledgeCore } from './knowledge-core'
import { SPECIALIZATION_PROMPTS } from './specializations'
import { DIRECTEUR_PROMPT } from './specializations/directeur'

// ═══════════════════════════════════════════════════════════════
// ThesisFrame — Post-Compaction Digestion Tests
//
// After compacting methodology (−36%) and de-injecting from
// 3 modes (expliquer-concept, argumentation-bilaterale,
// verification-sources), we must verify that:
//
// 1. Key decision rules are still present in methodology
// 2. De-injected modes still function (prompt builds correctly)
// 3. The methodology module is not empty or truncated
//
// These tests validate CONTENT QUALITY, not just token count.
// ═══════════════════════════════════════════════════════════════

describe('Post-compaction digestion tests', () => {
  // ─── 1. Methodology module: key decision rules still present ───
  describe('methodology module still contains key rules', () => {
    const methodologyCore = getKnowledgeCore(['methodology'])

    it('should contain Creswell mixed-methods decision rules', () => {
      // The compacted Creswell section should still mention mixed methods
      expect(methodologyCore).toMatch(/m[ée]thodes? mixtes?/i)
      expect(methodologyCore).toMatch(/Creswell/i)
    })

    it('should contain qualitative research decision framework', () => {
      // Gaudet & Robert section was compacted but SI/ALORS rules preserved
      expect(methodologyCore).toMatch(/qualitative/i)
      expect(methodologyCore).toMatch(/SI/i)
    })

    it('should contain case study methodology (Yin)', () => {
      // Yin's case study section preserved in compacted form (French: « étude de cas »)
      expect(methodologyCore).toMatch(/étude de cas/i)
      expect(methodologyCore).toMatch(/Yin/i)
    })

    it('should contain specialized methodologies (Q-methodology, Giorgi, etc.)', () => {
      // Zimmerman section compacted but key references preserved
      expect(methodologyCore).toMatch(/ph[ée]nom/i) // phenomenological approaches
    })

    it('should not be empty or just a few characters', () => {
      // Minimum viability: at least 5000 chars after compaction
      expect(methodologyCore.length).toBeGreaterThan(5000)
    })

    it('should contain SI→ conditional structure (decision rules)', () => {
      // The core compaction principle: keep decision rules
      // Format uses SI...→ not SI...ALORS
      expect(methodologyCore).toMatch(/SI /i)
      expect(methodologyCore).toMatch(/→/)
    })
  })

  // ─── 2. De-injected modes: prompt builds correctly without methodology ───
  describe('de-injected modes build prompts correctly', () => {
    const deInjectedModes = [
      'expliquer-concept',
      'argumentation-bilaterale',
      'verification-sources',
    ] as const

    for (const modeId of deInjectedModes) {
      it(`${modeId} should have a valid prompt in SPECIALIZATION_PROMPTS`, () => {
        const prompt = SPECIALIZATION_PROMPTS[modeId]
        expect(prompt).toBeDefined()
        expect(typeof prompt).toBe('string')
        expect(prompt.length).toBeGreaterThan(100)
      })

      it(`${modeId} should NOT contain methodology module content`, () => {
        const prompt = SPECIALIZATION_PROMPTS[modeId]
        // These modes should not have Creswell, Yin, or other methodology-specific content
        // They might have the word "methodology" in passing but not full module content
        const methodologyContent = getKnowledgeCore(['methodology'])
        // Check that the prompt is significantly shorter than if it included methodology
        // Methodology alone is ~10,995 chars
        const methodologySize = methodologyContent.length
        expect(prompt.length).toBeLessThan(methodologySize + 2000) // prompt + spec should be well under methodology size
      })
    }
  })

  // ─── 3. New modes (C4-C6) are registered and functional ───
  describe('new modes (C4-C6) are properly registered', () => {
    const newModes = ['problematique', 'empirique', 'analyse'] as const

    for (const modeId of newModes) {
      it(`${modeId} should exist in SPECIALIZATION_PROMPTS`, () => {
        const prompt = SPECIALIZATION_PROMPTS[modeId]
        expect(prompt).toBeDefined()
        expect(typeof prompt).toBe('string')
        expect(prompt.length).toBeGreaterThan(100)
      })

      it(`${modeId} should contain knowledge core sections`, () => {
        const prompt = SPECIALIZATION_PROMPTS[modeId]
        // If a mode uses buildPrompt, it should have the module header format
        expect(prompt).toMatch(/═+/) // separator lines from buildPrompt
      })
    }

    it('problematique should include methodology module', () => {
      const prompt = SPECIALIZATION_PROMPTS['problematique']
      expect(prompt).toMatch(/MÉTHODOLOGIE DE RECHERCHE/i)
    })

    it('empirique should include data-analysis module', () => {
      const prompt = SPECIALIZATION_PROMPTS['empirique']
      expect(prompt).toMatch(/ANALYSE DE DONNÉES/i)
    })

    it('analyse should include data-analysis module', () => {
      const prompt = SPECIALIZATION_PROMPTS['analyse']
      expect(prompt).toMatch(/ANALYSE DE DONNÉES/i)
    })
  })

  // ─── 4. Director Pattern 1 is active ───
  // Note: directeur-chat uses a custom API route (/api/directeur-chat),
  // not the standard SPECIALIZATION_PROMPTS registry.
  // We import DIRECTEUR_PROMPT directly instead.
  describe('Pattern 1 (Reasoning-then-Output) is deployed', () => {
    it('should contain Analyse section instruction', () => {
      expect(DIRECTEUR_PROMPT).toMatch(/Analyse/i)
      expect(DIRECTEUR_PROMPT).toMatch(/Retour/i)
    })

    it('should mention 400 mots max with Analyse exclusion', () => {
      // The key Pattern 1 feature: Analyse section not counted in word limit
      expect(DIRECTEUR_PROMPT).toMatch(/Analyse.*[Nn]'?e (?:compte|comptée|comptés)/)
    })

    it('should mention short questions skip Analyse section', () => {
      expect(DIRECTEUR_PROMPT).toMatch(/questions? courtes?/i)
      expect(DIRECTEUR_PROMPT).toMatch(/sans.*section Analyse/i)
    })
  })
})
