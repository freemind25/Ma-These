// ═══════════════════════════════════════════════════════════════
// ThesisFrame — Tests spécialisation URBANIS-DZ (cycle urbanis-dz-mode)
// Invariants du pack v1.1 : fidélité §2, autoporteur, câblage, budget.
// ═══════════════════════════════════════════════════════════════

import { describe, expect, it } from 'vitest';
import { getKnowledgeCore } from '../knowledge-core';
import { URBANIS_DZ_PROMPT } from './urbanis-dz';

describe('URBANIS-DZ — fidélité au pack v1.1 (CA-2.1)', () => {
  it('contient les 12 règles dures verbatim', () => {
    const rules = [
      'VÉRITÉ — Tu n\'inventes jamais',
      'SOURCE — Toute donnée chiffrée',
      'DROIT — Toute règle juridique',
      'DROIT EN PROJET — Aucun avant-projet',
      'ÉCHELLE — Tu précises toujours l\'échelle',
      'TROIS REGISTRES — Tu sépares toujours',
      'NON-COMPLAISANCE — Tu refuses de justifier',
      'NO-OPPOSABILITÉ — Tes notes sont des avis techniques non opposables',
      'FONCIER — Tu ne tranches pas la propriété',
      'RISQUES — Tu ne conclus jamais « absence de risque »',
      'PERSONNES — Pas de données nominatives',
      'LIMITES — Tu ne produis ni dimensionnement',
    ];
    for (const rule of rules) {
      expect(URBANIS_DZ_PROMPT).toContain(rule);
    }
  });

  it('contient les sections du pack', () => {
    for (const section of [
      '# IDENTITÉ',
      '# RÈGLES DURES',
      '# CADRAGE AVANT LIVRABLE',
      '# MODES',
      '# RISQUES',
      '# FORMAT DE SORTIE',
      '# STYLE',
    ]) {
      expect(URBANIS_DZ_PROMPT).toContain(section);
    }
  });

  it('contient les modes M1-M7 du pack', () => {
    for (const mode of [
      'M1 LECTURE',
      'M2 DIAGNOSTIC',
      'M3 PROSPECTIVE',
      'M4 PROJET',
      'M5 CONFORMITÉ',
      'M6 PÉDAGOGIE',
      'M7 REVUE CRITIQUE',
    ]) {
      expect(URBANIS_DZ_PROMPT).toContain(mode);
    }
  });

  it('mentionne la vérification JORADP et le protocole risques complet', () => {
    expect(URBANIS_DZ_PROMPT).toContain('JORADP');
    for (const rubrique of ['ALÉA', 'EXPOSITION', 'VULNÉRABILITÉ', 'CAPACITÉ DE RÉPONSE']) {
      expect(URBANIS_DZ_PROMPT).toContain(rubrique);
    }
  });
});

describe('URBANIS-DZ — prompt autoporteur (CA-2.2)', () => {
  it('commence par le pack, pas par le noyau de connaissance', () => {
    expect(URBANIS_DZ_PROMPT.startsWith('# IDENTITÉ')).toBe(true);
  });

  it('est nettement plus court que le module methodology seul (pas de noyau embarqué)', () => {
    const methodologySize = getKnowledgeCore(['methodology']).length;
    expect(URBANIS_DZ_PROMPT.length).toBeLessThan(methodologySize);
  });

  it('garde-fou budget : ≤ 7 000 caractères', () => {
    expect(URBANIS_DZ_PROMPT.length).toBeLessThanOrEqual(7_000);
  });
});

describe('URBANIS-DZ — passerelle d\'intégration (ajout consigné)', () => {
  it('contient la passerelle ThesisFrame et la règle d\'intégrité citations', () => {
    expect(URBANIS_DZ_PROMPT).toContain("# CONTEXTE D'INTÉGRATION (ThesisFrame)");
    expect(URBANIS_DZ_PROMPT).toContain('jamais une source de citations');
  });
});

describe('URBANIS-DZ — anti-dérive', () => {
  it('snapshot du prompt complet (toute modification devient un diff visible)', () => {
    expect(URBANIS_DZ_PROMPT).toMatchSnapshot('urbanis-dz-prompt');
  });
});
