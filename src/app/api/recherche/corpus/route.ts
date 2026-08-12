import { NextRequest, NextResponse } from 'next/server'
import { FICHE_ETAPES, FICHE_REVUE_LITTERATURE, FICHE_METHODOLOGIE, FICHE_POSITIONNEMENT, FICHE_REDACTION, FICHE_PLAN, FICHE_OUTILS_QUALITE, FICHE_SOUTENANCE, FICHE_RYTHME } from '@/data/guidance-fiches'
import { researchCycle, researchTypes, problematiqueGuide, operationalisationExample, collectTools } from '@/data/methodology-guide'
import { writingPhases, commonPitfalls, structureTips } from '@/data/thesis-writing-guide'

interface CorpusEntry {
  corpus: string
  titre: string
  extrait: string
  motsCles: string[]
}

function buildCorpusIndex(): CorpusEntry[] {
  const entries: CorpusEntry[] = []

  // 1. Guidance fiches (directeur IA knowledge)
  const fiches = [
    { id: 'fiche-etapes', title: 'Les 9 étapes d\'un projet doctoral', content: FICHE_ETAPES.content },
    { id: 'fiche-revue', title: 'Revue de littérature', content: FICHE_REVUE_LITTERATURE.content },
    { id: 'fiche-methodo', title: 'Méthodologie', content: FICHE_METHODOLOGIE.content },
    { id: 'fiche-positionnement', title: 'Positionnement', content: FICHE_POSITIONNEMENT.content },
    { id: 'fiche-redaction', title: 'Rédaction', content: FICHE_REDACTION.content },
    { id: 'fiche-plan', title: 'Plan du manuscrit', content: FICHE_PLAN.content },
    { id: 'fiche-outils', title: 'Outils de qualité', content: FICHE_OUTILS_QUALITE.content },
    { id: 'fiche-soutenance', title: 'Soutenance', content: FICHE_SOUTENANCE.content },
    { id: 'fiche-rythme', title: 'Rythme de rédaction', content: FICHE_RYTHME.content },
  ]

  for (const f of fiches) {
    if (f.content) {
      entries.push({
        corpus: 'redaction_doctorale_generique',
        titre: f.title,
        extrait: f.content.slice(0, 2000),
        motsCles: [f.id, 'fiche', 'directeur'],
      })
    }
  }

  // 2. Methodology guide
  for (const step of researchCycle) {
    entries.push({
      corpus: 'methodologie_disciplinaire',
      titre: step.title,
      extrait: step.description + '\n' + step.details.join('\n'),
      motsCles: ['méthodologie', 'étape', step.id],
    })
  }
  for (const rt of researchTypes) {
    entries.push({
      corpus: 'methodologie_disciplinaire',
      titre: rt.title,
      extrait: rt.description + '\n' + rt.characteristics.join('\n'),
      motsCles: ['recherche', 'type'],
    })
  }
  for (const p of problematiqueGuide) {
    entries.push({
      corpus: 'methodologie_disciplinaire',
      titre: p.question,
      extrait: p.description + (p.example ? '\nExemple : ' + p.example : ''),
      motsCles: ['problématique', 'question'],
    })
  }
  for (const tool of collectTools) {
    entries.push({
      corpus: 'methodologie_disciplinaire',
      titre: tool.title,
      extrait: tool.description + '\nAvantages : ' + tool.avantages.join(', ') + '\nLimites : ' + tool.limites.join(', '),
      motsCles: ['collecte', 'outil', ...tool.conseils],
    })
  }
  {
    const ex = operationalisationExample
    entries.push({
      corpus: 'methodologie_disciplinaire',
      titre: `Opérationnalisation : ${ex.concept}`,
      extrait: ex.dimensions.map(d => `${d.label} : ${d.indicateurs.join(', ')}`).join('\n'),
      motsCles: ['opérationnalisation', ex.concept],
    })
  }

  // 3. Thesis writing guide
  for (const phase of writingPhases) {
    entries.push({
      corpus: 'redaction_article_scientifique',
      titre: phase.title,
      extrait: phase.description + '\n' + (phase.tips || []).join('\n'),
      motsCles: ['rédaction', 'phase', ...phase.focusAreas || []],
    })
  }
  for (const tip of structureTips) {
    entries.push({
      corpus: 'redaction_article_scientifique',
      titre: tip.topic,
      extrait: tip.principle + '\n' + tip.actionableSteps.join('\n'),
      motsCles: ['structure', tip.topic.toLowerCase()],
    })
  }
  for (const pitfall of commonPitfalls) {
    entries.push({
      corpus: 'redaction_article_scientifique',
      titre: `Piège : ${pitfall.pitfall}`,
      extrait: `Conséquence : ${pitfall.consequence}\nSolution : ${pitfall.fix}`,
      motsCles: ['piège', 'erreur', pitfall.pitfall.toLowerCase()],
    })
  }

  return entries
}

let _corpus: CorpusEntry[] | null = null
function getCorpus(): CorpusEntry[] {
  if (!_corpus) _corpus = buildCorpusIndex()
  return _corpus
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') || '').toLowerCase().trim()
    const corpus = searchParams.get('corpus')

    let results = getCorpus()

    if (corpus) {
      results = results.filter(r => r.corpus === corpus)
    }

    if (q) {
      const terms = q.split(/\s+/).filter(t => t.length > 1)
      results = results.filter(r => {
        const text = (r.titre + ' ' + r.extrait + ' ' + r.motsCles.join(' ')).toLowerCase()
        return terms.every(t => text.includes(t))
      })
      results.sort((a, b) => {
        const aScore = terms.filter(t => a.titre.toLowerCase().includes(t)).length
        const bScore = terms.filter(t => b.titre.toLowerCase().includes(t)).length
        return bScore - aScore
      })
    }

    return NextResponse.json(results.slice(0, 30))
  } catch (error) {
    console.error('[recherche/corpus GET]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
