import { NextRequest, NextResponse } from 'next/server'
import { getZAI } from '@/lib/zai'
import { callAI } from '@/lib/ai-router'

// POST /api/automation/pipeline
// Body: { action: 'generate-drafts' | 'review-all', thesis: { title, field, chapters[] }, provider, apiKey, baseUrl, model }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, thesis, provider, apiKey, baseUrl, model } = body

    if (!thesis || !thesis.chapters) {
      return NextResponse.json({ error: 'Données de thèse requises' }, { status: 400 })
    }

    if (action === 'generate-drafts') {
      return handleGenerateDrafts(thesis, provider, apiKey, baseUrl, model)
    }

    if (action === 'review-all') {
      return handleReviewAll(thesis, provider, apiKey, baseUrl, model)
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 })
  } catch (err: unknown) {
    console.error('[automation/pipeline]', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erreur pipeline' }, { status: 500 })
  }
}

interface ChapterSummary {
  id: string
  number: number
  title: string
  content: string
  wordCount: number
  status: string
  order: number
}

async function handleGenerateDrafts(
  thesis: { title: string; field: string; chapters: ChapterSummary[] },
  provider?: string, apiKey?: string, baseUrl?: string, model?: string,
) {
  // Find chapters that are empty or have very little content
  const emptyChapters = thesis.chapters
    .filter(ch => !ch.content || ch.wordCount < 50)
    .sort((a, b) => a.order - b.order)

  if (emptyChapters.length === 0) {
    return NextResponse.json({
      success: true,
      message: 'Tous les chapitres ont déjà du contenu.',
      results: [],
    })
  }

  const results: { chapterId: string; chapterNumber: number; chapterTitle: string; success: boolean; draftLength: number; error?: string }[] = []

  // Build context from filled chapters
  const filledChapters = thesis.chapters.filter(ch => ch.content && ch.wordCount > 50)
  const contextSummary = filledChapters.map(ch => `Ch.${ch.number}: ${ch.title} (${ch.wordCount} mots)`).join('\n')

  for (const chapter of emptyChapters) {
    try {
      const chapterMeta = thesis.chapters.find(c => c.number === chapter.number - 1)
      const prevChapterSummary = chapterMeta?.content
        ? `\nRésumé du chapitre précédent (${chapterMeta.title}) :\n${chapterMeta.content.slice(0, 800)}...`
        : ''

      const prompt = buildDraftPrompt(thesis.title, thesis.field, chapter.number, chapter.title, contextSummary, prevChapterSummary)
      const draft = await callLLM(prompt, provider, apiKey, baseUrl, model)

      results.push({
        chapterId: chapter.id,
        chapterNumber: chapter.number,
        chapterTitle: chapter.title,
        success: true,
        draftLength: draft.length,
      })
    } catch (err: unknown) {
      results.push({
        chapterId: chapter.id,
        chapterNumber: chapter.number,
        chapterTitle: chapter.title,
        success: false,
        draftLength: 0,
        error: err instanceof Error ? err.message : 'Erreur interne du serveur.',
      })
    }
  }

  const successCount = results.filter(r => r.success).length
  return NextResponse.json({
    success: true,
    message: `${successCount}/${emptyChapters.length} brouillon(s) généré(s) avec succès.`,
    totalProcessed: emptyChapters.length,
    results,
  })
}

async function handleReviewAll(
  thesis: { title: string; field: string; chapters: ChapterSummary[] },
  provider?: string, apiKey?: string, baseUrl?: string, model?: string,
) {
  const filledChapters = thesis.chapters
    .filter(ch => ch.content && ch.wordCount > 100)
    .sort((a, b) => a.order - b.order)

  if (filledChapters.length === 0) {
    return NextResponse.json({
      success: true,
      message: 'Aucun chapitre avec suffisamment de contenu à réviser.',
      results: [],
    })
  }

  const results: { chapterId: string; chapterNumber: number; chapterTitle: string; success: boolean; remarks: { type: string; severity: string; text: string }[]; score?: number; error?: string }[] = []

  for (const chapter of filledChapters) {
    try {
      const prompt = buildReviewPrompt(thesis.title, thesis.field, chapter.number, chapter.title, chapter.content)
      const review = await callLLM(prompt, provider, apiKey, baseUrl, model)

      // Parse review response for score and remarks
      const parsed = parseReviewResponse(review)

      results.push({
        chapterId: chapter.id,
        chapterNumber: chapter.number,
        chapterTitle: chapter.title,
        success: true,
        remarks: parsed.remarks,
        score: parsed.score,
      })
    } catch (err: unknown) {
      results.push({
        chapterId: chapter.id,
        chapterNumber: chapter.number,
        chapterTitle: chapter.title,
        success: false,
        remarks: [],
        error: err instanceof Error ? err.message : 'Erreur interne du serveur.',
      })
    }
  }

  const avgScore = results.filter(r => r.score !== undefined).reduce((s, r) => s + (r.score || 0), 0) / Math.max(1, results.filter(r => r.score !== undefined).length)

  return NextResponse.json({
    success: true,
    message: `Révision terminée : ${results.filter(r => r.success).length}/${filledChapters.length} chapitre(s) analysé(s).`,
    averageScore: Math.round(avgScore * 10) / 10,
    totalProcessed: filledChapters.length,
    results,
  })
}

function buildDraftPrompt(
  thesisTitle: string, field: string, chapterNum: number, chapterTitle: string,
  contextSummary: string, prevChapterSummary: string,
): string {
  return `Tu es un assistant de rédaction académique expert. Tu dois rédiger un brouillon initial pour un chapitre de thèse de doctorat.

CONTEXTE DE LA THÈSE :
- Titre : ${thesisTitle}
- Discipline : ${field}

CHAPITRES DÉJÀ RÉDIGÉS :
${contextSummary || 'Aucun chapitre encore rédigé.'}

${prevChapterSummary}

CHAPITRE À RÉDIGER :
Chapitre ${chapterNum} : ${chapterTitle}

CONSIGNES :
1. Rédige en français académique, style doctoral
2. Structure le contenu avec des titres (##) et sous-titres (###) en markdown
3. Vise environ 2000-3000 mots de contenu substantiel
4. Inclus des références fictives sous forme [Auteur, Année] pour indiquer où des citations seront nécessaires
5. Ne plagie pas : génère du contenu original et pertinent
6. Adapte le contenu au numéro et titre du chapitre

Rédige uniquement le contenu du chapitre, sans titre de niveau 1 (le numéro/titre est déjà géré par l'application).`
}

function buildReviewPrompt(
  thesisTitle: string, field: string, chapterNum: number, chapterTitle: string, content: string,
): string {
  const truncatedContent = content.slice(0, 4000)
  return `Tu es un directeur de thèse expérimenté. Analyse le chapitre suivant et donne un retour structuré.

THÈSE : ${thesisTitle} (${field})
CHAPITRE ${chapterNum} : ${chapterTitle}

CONTENU :
${truncatedContent}

Réponds STRICTEMENT au format JSON suivant (sans markdown, juste le JSON) :
{
  "score": <note globale de 1 à 10>,
  "remarks": [
    {"type": "structure"|"contenu"|"style"|"argumentation", "severity": "info"|"warning"|"error", "text": "description du problème ou conseil"}
  ]
}

Donne entre 3 et 8 remarques maximum. Sois constructif et précis.`
}

function parseReviewResponse(raw: string): { score: number; remarks: { type: string; severity: string; text: string }[] } {
  try {
    // Try to extract JSON from the response
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        score: typeof parsed.score === 'number' ? parsed.score : 5,
        remarks: Array.isArray(parsed.remarks) ? parsed.remarks.map((r: any) => ({
          type: r.type || 'contenu',
          severity: r.severity || 'info',
          text: typeof r.text === 'string' ? r.text : String(r.text),
        })) : [{ type: 'info', severity: 'info', text: raw.slice(0, 200) }],
      }
    }
  } catch { /* fallback */ }

  return {
    score: 5,
    remarks: [{ type: 'info', severity: 'info', text: 'Réponse non parsable. Contenu brut tronqué : ' + raw.slice(0, 200) }],
  }
}

async function callLLM(prompt: string, provider?: string, apiKey?: string, baseUrl?: string, model?: string): Promise<string> {
  if (provider && provider !== 'z-ai' && apiKey && baseUrl) {
    return callAI({
      provider,
      apiKey,
      baseUrl,
      model: model || 'GLM5.2R',
      messages: [
        { role: 'system', content: 'Tu es un assistant académique expert en rédaction de thèses de doctorat. Réponds en français.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      maxTokens: 4000,
    })
  }
  const zai = await getZAI()
  const response = await zai.chat.completions.create({
    messages: [
      { role: 'system', content: 'Tu es un assistant académique expert en rédaction de thèses de doctorat. Réponds en français.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 4000,
  })
  return response.choices?.[0]?.message?.content || ''
}