import { db } from '@/lib/db'

/**
 * Récupère le cadrage validé d'une thèse et le formate
 * pour injection dans le prompt du directeur de thèse.
 * Le directeur lit le cadrage en lecture seule, jamais le modifie.
 */
export async function getCadrageForDirecteur(thesisId: string): Promise<string | null> {
  try {
    const cadrage = await db.thesisCadrage.findUnique({
      where: { thesisId },
      include: { fields: true },
    })

    if (!cadrage || cadrage.status === 'provisoire') {
      return null
    }

    const fieldMap: Record<string, string> = {}
    for (const f of cadrage.fields) {
      if (f.fieldValue.trim()) {
        fieldMap[f.fieldKey] = f.fieldValue
      }
    }

    if (Object.keys(fieldMap).length === 0) return null

    const sections: string[] = [
      `## Cadrage de la thèse (version ${cadrage.version}, ${cadrage.status})`,
    ]

    if (fieldMap.thematique)
      sections.push(`**Thématique** : ${fieldMap.thematique}`)

    if (fieldMap.problematique)
      sections.push(`**Problématique** : ${fieldMap.problematique}`)

    if (fieldMap.questions_recherche) {
      try {
        const qr = JSON.parse(fieldMap.questions_recherche)
        sections.push(`**Question principale** : ${qr.principale || fieldMap.questions_recherche}`)
        if (qr.secondaires?.length) {
          sections.push(`**Sous-questions** : ${qr.secondaires.join(' ; ')}`)
        }
      } catch {
        sections.push(`**Question(s) de recherche** : ${fieldMap.questions_recherche}`)
      }
    }

    if (fieldMap.objectifs) {
      try {
        const obj = JSON.parse(fieldMap.objectifs)
        sections.push(`**Objectif général** : ${obj.general || fieldMap.objectifs}`)
        if (obj.specifiques?.length) {
          sections.push(`**Objectifs spécifiques** : ${obj.specifiques.join(' ; ')}`)
        }
      } catch {
        sections.push(`**Objectifs** : ${fieldMap.objectifs}`)
      }
    }

    if (fieldMap.hypotheses)
      sections.push(`**Hypothèses** : ${fieldMap.hypotheses}`)

    if (fieldMap.type_recherche) {
      try {
        const tr = JSON.parse(fieldMap.type_recherche)
        sections.push(`**Type de recherche** : ${tr.type}${tr.justification ? ` (${tr.justification})` : ''}`)
      } catch {
        sections.push(`**Type de recherche** : ${fieldMap.type_recherche}`)
      }
    }

    if (fieldMap.methodologie)
      sections.push(`**Méthodologie** : ${fieldMap.methodologie}`)

    if (fieldMap.type_revue_litterature)
      sections.push(`**Type de revue de littérature** : ${fieldMap.type_revue_litterature}`)

    if (fieldMap.cadre_theorique)
      sections.push(`**Cadre théorique** : ${fieldMap.cadre_theorique}`)

    if (fieldMap.contribution_attendue)
      sections.push(`**Contribution attendue** : ${fieldMap.contribution_attendue}`)

    if (fieldMap.type_these)
      sections.push(`**Type de thèse** : ${fieldMap.type_these}`)

    sections.push(
      '\n**Règle** : Utilise ce cadrage comme référence pour vérifier la cohérence du texte rédigé. ' +
      'Si le contenu du chapitre contredit ce qui a été déclaré dans le cadrage (ex. : méthodologie quantitative alors que le cadrage déclare qualitatif), signale-le explicitement. ' +
      'Ne modifie jamais le cadrage.',
    )

    return sections.join('\n')
  } catch (err) {
    console.error('[cadrage-bridge]', err)
    return null
  }
}
