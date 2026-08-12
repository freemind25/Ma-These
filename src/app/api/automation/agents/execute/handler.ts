import { NextRequest, NextResponse } from 'next/server'
import { getZAI } from '@/lib/zai'
import type { OrchestrationTask, OrchestrationRun, AgentRole, AgentStatus, ClassifiedError, ChapterNudge, ReviewPhase } from '@/types/agent-orchestration'
import { callAI, getProviderConfig } from '@/lib/ai-router'
import { THESIS_AGENTS } from '@/types/agent-orchestration'

// ═══════════════════════════════════════════════════════════
// EXACTLY-ONCE GUARD (inspired by agent-teams-ai TaskBoardCommandFacade)
// In-memory run tokens prevent duplicate concurrent executions
// ═══════════════════════════════════════════════════════════

const activeRuns = new Map<string, { startedAt: number; expiresAt: number }>()
const RUN_TTL_MS = 10 * 60 * 1000 // 10 minutes

function cleanupExpiredRuns() {
  const now = Date.now()
  for (const [token, run] of activeRuns) {
    if (now > run.expiresAt) activeRuns.delete(token)
  }
}

function acquireRunLock(runToken: string): { acquired: boolean; reason?: string } {
  cleanupExpiredRuns()
  const existing = activeRuns.get(runToken)
  if (existing) {
    const remaining = Math.ceil((existing.expiresAt - Date.now()) / 1000)
    return { acquired: false, reason: `Pipeline déjà en cours (reste ~${remaining}s)` }
  }
  activeRuns.set(runToken, { startedAt: Date.now(), expiresAt: Date.now() + RUN_TTL_MS })
  return { acquired: true }
}

function releaseRunLock(runToken: string) {
  activeRuns.delete(runToken)
}

// ═══════════════════════════════════════════════════════════
// FAILURE CLASSIFIER (inspired by agent-teams-ai RuntimeFailureClassifier)
// Maps raw errors into structured dispositions for retry/escalation
// ═══════════════════════════════════════════════════════════

function classifyError(err: unknown): ClassifiedError {
  const msg = err instanceof Error ? err.message : String(err || 'Erreur inconnue')
  const lower = msg.toLowerCase()

  // Secret redaction
  const redacted = msg
    .replace(/bearer\s+[\w\-.]+/gi, 'bearer ***')
    .replace(/sk-[\w]{20,}/gi, 'sk-***')
    .replace(/key[=:\s]["']?[\w\-.]{20,}/gi, 'key=***')
    .slice(0, 500)

  // Rate limit
  if (lower.includes('rate') && (lower.includes('limit') || lower.includes('429'))) {
    const match = msg.match(/(\d+)\s*(second|minute|ms|s)/i)
    const retryMs = match ? parseInt(match[1]) * (match[2].startsWith('min') ? 60000 : match[2] === 'ms' ? 1 : 1000) : 30000
    return { reasonCode: 'rate_limit', disposition: 'retry_at_reset', normalizedDetail: redacted, retryAfterMs: retryMs, actionRequired: undefined }
  }

  // Auth errors
  if (lower.includes('401') || lower.includes('unauthorized') || lower.includes('invalid api key') || lower.includes('authentication')) {
    return { reasonCode: 'auth_error', disposition: 'manual', normalizedDetail: redacted, actionRequired: 'Vérifiez votre clé API dans les paramètres du fournisseur.' }
  }

  // Timeout
  if (lower.includes('timeout') || lower.includes('408') || lower.includes('timed out') || lower.includes('econnrefused')) {
    return { reasonCode: 'timeout', disposition: 'retry_transient', normalizedDetail: redacted, retryAfterMs: 5000 }
  }

  // Server errors (5xx)
  if (/5\d{2}/.test(msg) || lower.includes('internal server') || lower.includes('overloaded') || lower.includes('service unavailable')) {
    return { reasonCode: 'server_error', disposition: 'retry_transient', normalizedDetail: redacted, retryAfterMs: 10000 }
  }

  // Context length
  if (lower.includes('context') && (lower.includes('length') || lower.includes('window') || lower.includes('too long') || lower.includes('token'))) {
    return { reasonCode: 'context_too_long', disposition: 'manual', normalizedDetail: redacted, actionRequired: 'Réduisez le contenu du chapitre ou utilisez un modèle avec plus de contexte.' }
  }

  // Network
  if (lower.includes('network') || lower.includes('fetch') || lower.includes('econn') || lower.includes('dns')) {
    return { reasonCode: 'network_error', disposition: 'retry_transient', normalizedDetail: redacted, retryAfterMs: 8000 }
  }

  // Fallback
  return { reasonCode: 'unknown', disposition: 'manual', normalizedDetail: redacted, actionRequired: 'Erreur non classifiée. Vérifiez les logs ou réessayez.' }
}

// ═══════════════════════════════════════════════════════════
// REVIEW PHASE RESOLVER (inspired by agent-teams-ai currentReviewCycle)
// Maps task outcome → review phase
// ═══════════════════════════════════════════════════════════

function resolveReviewPhase(task: OrchestrationTask): ReviewPhase {
  if (task.error) return 'draft'
  if (task.status === 'completed') return task.type === 'review-chapter' ? 'director_approved' : 'final'
  if (task.status === 'needs_fix') return 'ai_reviewed'
  if (task.status === 'in_review') return 'ai_reviewed'
  if (task.status === 'in_progress') return 'draft'
  return 'draft'
}

// ═══════════════════════════════════════════════════════════
// NUDGE BUILDER (inspired by agent-teams-ai MemberWorkSyncNudge)
// Fingerprint-based idempotent nudge construction
// ═══════════════════════════════════════════════════════════

function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + c
    hash |= 0
  }
  return Math.abs(hash).toString(36)
}

function buildNudges(tasks: OrchestrationTask[], thesisChapters: any[]): ChapterNudge[] {
  const nudges: ChapterNudge[] = []
  const now = new Date().toISOString()

  for (const task of tasks) {
    const ch = thesisChapters.find((c: any) => c.id === task.chapterId)
    if (!ch) continue

    const fp = simpleHash(`${task.chapterId}:${task.status}:${ch.wordCount || 0}:${task.type}`)

    // Nudge: chapter was supposed to be written but still empty
    if (task.type === 'write-chapter' && task.error && (ch.wordCount || 0) < 50) {
      nudges.push({
        chapterId: task.chapterId, chapterNumber: task.chapterNumber, chapterTitle: task.chapterTitle,
        reason: 'chapter_empty_after_draft',
        message: `Chapitre ${task.chapterNumber} toujours vide après la tentative. Cause : ${task.error?.slice(0, 80)}`,
        fingerprint: `empty-${fp}`, createdAt: now, dismissed: false,
      })
    }

    // Nudge: chapter needs fixes after review
    if (task.type === 'review-chapter' && task.status === 'needs_fix') {
      nudges.push({
        chapterId: task.chapterId, chapterNumber: task.chapterNumber, chapterTitle: task.chapterTitle,
        reason: 'chapter_still_needs_fix',
        message: `Chapitre ${task.chapterNumber} nécessite des corrections (note : ${task.score}/10).`,
        fingerprint: `fix-${fp}`, createdAt: now, dismissed: false,
      })
    }

    // Nudge: low word count after writing
    if (task.type === 'write-chapter' && !task.error && ch.wordCount > 0 && ch.wordCount < 500) {
      nudges.push({
        chapterId: task.chapterId, chapterNumber: task.chapterNumber, chapterTitle: task.chapterTitle,
        reason: 'low_word_count',
        message: `Chapitre ${task.chapterNumber} : seulement ${ch.wordCount} mots rédigés. Minimum recommandé : 2000.`,
        fingerprint: `low-${fp}`, createdAt: now, dismissed: false,
      })
    }
  }

  return nudges
}

// ═══════════════════════════════════════════════════════════
// MAIN ROUTE
// ═══════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, unknown>
    const { thesis, workflow, runToken } = body as any
    const extProvider = getProviderConfig(body)

    if (!thesis?.chapters?.length) {
      return NextResponse.json({ error: 'Données de thèse requises' }, { status: 400 })
    }

    // ── Exactly-Once Guard ──
    const token = runToken || `default-${workflow || 'full'}`
    const lock = acquireRunLock(token)
    if (!lock.acquired) {
      return NextResponse.json({ error: lock.reason!, status: 'locked' }, { status: 409 })
    }

    try {
      const runId = `run-${Date.now()}`
      const tasks: OrchestrationTask[] = []
      const agents: { role: AgentRole; status: AgentStatus; tasksCompleted: number }[] = THESIS_AGENTS.map(a => ({ role: a.role as AgentRole, status: 'idle' as AgentStatus, tasksCompleted: 0 }))
      const filledChapters = thesis.chapters.filter((ch: any) => ch.content && ch.wordCount > 100)
      const emptyChapters = thesis.chapters.filter((ch: any) => !ch.content || ch.wordCount < 50)

      // --- Phase 1: Redacteur ---
      if (workflow !== 'review-only') {
        const writeAgentIdx = agents.findIndex(a => a.role === 'redacteur')
        agents[writeAgentIdx].status = 'working'

        for (const chapter of emptyChapters) {
          const idempotencyKey = `write-${chapter.id}-${chapter.wordCount || 0}`
          const task: OrchestrationTask = {
            id: `task-write-${chapter.id}`, type: 'write-chapter',
            title: `Rédiger : ${chapter.title}`, description: 'Génération du brouillon initial',
            chapterId: chapter.id, chapterNumber: chapter.number, chapterTitle: chapter.title,
            assignedAgent: 'redacteur', status: 'in_progress', priority: chapter.order,
            createdAt: new Date().toISOString(), startedAt: new Date().toISOString(),
            idempotencyKey, reviewPhase: 'draft',
          }
          tasks.push(task)

          try {
            const draft = await callAgentWithRetry('redacteur', buildWritePrompt(thesis, chapter), extProvider)
            task.status = 'in_review'
            task.completedAt = new Date().toISOString()
            task.output = draft
            task.reviewPhase = 'ai_reviewed'
            agents[writeAgentIdx].tasksCompleted++
          } catch (err: unknown) {
            const classified = classifyError(err)
            task.status = classified.disposition === 'retry_transient' ? 'todo' : 'needs_fix'
            task.error = classified.normalizedDetail
            task.classifiedError = classified
            task.reviewPhase = 'draft'
          }
        }

        agents[writeAgentIdx].status = 'done'
      }

      // --- Phase 2: Directeur ---
      if (workflow !== 'write-only') {
        const reviewChapters = [...filledChapters]
        if (workflow === 'full' && emptyChapters.length > 0) {
          const newDrafts = tasks.filter(t => t.type === 'write-chapter' && t.output)
          for (const draftTask of newDrafts) {
            const ch = emptyChapters.find((c: any) => c.id === draftTask.chapterId)
            if (ch) {
              reviewChapters.push({ ...ch, content: draftTask.output, wordCount: (draftTask.output || '').split(/\s+/).length })
            }
          }
        }

        const dirAgentIdx = agents.findIndex(a => a.role === 'directeur')
        agents[dirAgentIdx].status = 'working'

        for (const chapter of reviewChapters) {
          const idempotencyKey = `review-${chapter.id}-${(chapter.content || '').length}`
          const task: OrchestrationTask = {
            id: `task-review-${chapter.id}`, type: 'review-chapter',
            title: `Réviser : ${chapter.title}`, description: 'Évaluation critique et suggestions',
            chapterId: chapter.id, chapterNumber: chapter.number, chapterTitle: chapter.title,
            assignedAgent: 'directeur', status: 'in_progress', priority: chapter.order,
            createdAt: new Date().toISOString(), startedAt: new Date().toISOString(),
            idempotencyKey, reviewPhase: 'draft',
          }
          tasks.push(task)

          try {
            const review = await callAgentWithRetry('directeur', buildReviewPrompt(thesis, chapter), extProvider)
            const parsed = parseReview(review)
            task.score = parsed.score
            task.remarks = parsed.remarks
            task.status = parsed.score >= 6 ? 'completed' : 'needs_fix'
            task.completedAt = new Date().toISOString()
            task.output = review
            task.reviewPhase = resolveReviewPhase(task)
            agents[dirAgentIdx].tasksCompleted++
          } catch (err: unknown) {
            const classified = classifyError(err)
            task.status = 'needs_fix'
            task.error = classified.normalizedDetail
            task.classifiedError = classified
            task.reviewPhase = 'draft'
          }
        }

        agents[dirAgentIdx].status = 'done'
      }

      // --- Phase 3: Chercheur ---
      if (workflow === 'full') {
        const cherAgentIdx = agents.findIndex(a => a.role === 'chercheur')
        agents[cherAgentIdx].status = 'working'

        for (const chapter of filledChapters) {
          const idempotencyKey = `enrich-${chapter.id}-${(chapter.content || '').length}`
          const task: OrchestrationTask = {
            id: `task-enrich-${chapter.id}`, type: 'enrich-chapter',
            title: `Enrichir : ${chapter.title}`, description: 'Suggestions de références et approfondissements',
            chapterId: chapter.id, chapterNumber: chapter.number, chapterTitle: chapter.title,
            assignedAgent: 'chercheur', status: 'in_progress', priority: chapter.order,
            createdAt: new Date().toISOString(), startedAt: new Date().toISOString(),
            idempotencyKey, reviewPhase: 'draft',
          }
          tasks.push(task)

          try {
            const enrichment = await callAgentWithRetry('chercheur', buildEnrichPrompt(thesis, chapter), extProvider)
            task.status = 'completed'
            task.completedAt = new Date().toISOString()
            task.output = enrichment
            task.reviewPhase = 'final'
            agents[cherAgentIdx].tasksCompleted++
          } catch (err: unknown) {
            const classified = classifyError(err)
            task.status = 'needs_fix'
            task.error = classified.normalizedDetail
            task.classifiedError = classified
            task.reviewPhase = 'draft'
          }
        }

        agents[cherAgentIdx].status = 'done'
      }

      // ── Build nudges from results ──
      const nudges = buildNudges(tasks, thesis.chapters)

      const completedCount = tasks.filter(t => t.status === 'completed' || t.status === 'needs_fix').length
      const scoredTasks = tasks.filter(t => t.score !== undefined)
      const avgScore = scoredTasks.length > 0
        ? scoredTasks.reduce((s, t) => s + (t.score || 0), 0) / scoredTasks.length
        : 0

      const run: OrchestrationRun = {
        id: runId, createdAt: new Date().toISOString(), status: 'completed',
        tasks, agents, runToken: token,
        summary: `${completedCount}/${tasks.length} tâche(s) terminée(s). Note moyenne : ${Math.round(avgScore * 10) / 10}/10.${nudges.length > 0 ? ` ${nudges.length} alerte(s).` : ''}`,
        nudges,
      }

      return NextResponse.json(run)
    } finally {
      releaseRunLock(token)
    }
  } catch (err: unknown) {
    console.error('[automation/agents/execute]', err)
    const classified = classifyError(err)
    return NextResponse.json({
      error: classified.normalizedDetail,
      classifiedError: classified,
    }, { status: 500 })
  }
}

// ═══════════════════════════════════════════════════════════
// LLM CALLS WITH RETRY (inspired by agent-teams-ai exponential backoff + stable jitter)
// ═══════════════════════════════════════════════════════════

async function callAgentWithRetry(role: AgentRole, prompt: string, extProvider?: { provider: string; apiKey: string; baseUrl: string; model: string } | null, maxRetries = 2): Promise<string> {
  let lastError: unknown
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const agentDef = THESIS_AGENTS.find(a => a.role === role)
      let content: string
      if (extProvider) {
        content = await callAI({
          provider: extProvider.provider,
          apiKey: extProvider.apiKey,
          baseUrl: extProvider.baseUrl,
          model: extProvider.model || 'GLM5.2R',
          messages: [
            { role: 'system', content: agentDef?.systemPrompt || '' },
            { role: 'user', content: prompt },
          ],
          temperature: role === 'redacteur' ? 0.7 : 0.4,
          maxTokens: 4000,
        })
      } else {
        const zai = await getZAI()
        const response = await zai.chat.completions.create({
          messages: [
            { role: 'system', content: agentDef?.systemPrompt || '' },
            { role: 'user', content: prompt },
          ],
          temperature: role === 'redacteur' ? 0.7 : 0.4,
          max_tokens: 4000,
        })
        content = response.choices[0]?.message?.content || ''
      }
      if (!content) throw new Error('Réponse vide du modèle')
      return content
    } catch (err: unknown) {
      lastError = err
      const classified = classifyError(err)
      if (classified.disposition === 'manual' || attempt === maxRetries) throw err
      // Exponential backoff with jitter: 2s * 2^attempt + random(0-1s)
      const delay = Math.min(30000, 2000 * Math.pow(2, attempt) + Math.random() * 1000)
      await new Promise(r => setTimeout(r, delay))
    }
  }
  throw lastError
}

// ═══════════════════════════════════════════════════════════
// PROMPT BUILDERS
// ═══════════════════════════════════════════════════════════

function buildWritePrompt(thesis: any, chapter: any): string {
  const prevChapter = thesis.chapters.find((c: any) => c.number === chapter.number - 1)
  const prevSummary = prevChapter?.content
    ? `\nRésumé du chapitre précédent (${prevChapter.title}) :\n${prevChapter.content.slice(0, 600)}...`
    : ''
  return `CONTEXTE DE LA THÈSE :\n- Titre : ${thesis.title}\n- Discipline : ${thesis.field}\n- Université : ${thesis.university}\n\n${prevSummary}\n\nCHAPITRE À RÉDIGER :\nChapitre ${chapter.number} : ${chapter.title}\n\nRédige le contenu complet de ce chapitre en français académique.`
}

function buildReviewPrompt(thesis: any, chapter: any): string {
  return `THÈSE : ${thesis.title} (${thesis.field})\nCHAPITRE ${chapter.number} : ${chapter.title}\n\nCONTENU À ÉVALUER :\n${(chapter.content || '').slice(0, 4000)}\n\nRéponds STRICTEMENT en JSON :\n{\n  "score": <note 1-10>,\n  "remarks": [\n    {"type": "structure|contenu|style|argumentation", "severity": "info|warning|error", "text": "description"}\n  ]\n}\n3 à 8 remarques maximum.`
}

function buildEnrichPrompt(thesis: any, chapter: any): string {
  return `THÈSE : ${thesis.title} (${thesis.field})\nCHAPITRE ${chapter.number} : ${chapter.title}\n\nCONTENU :\n${(chapter.content || '').slice(0, 3000)}\n\nPour chaque section de ce chapitre, suggère :\n1. 2-3 références bibliographiques pertinentes [Auteur, Année]\n2. Un approfondissement possible (1-2 phrases)\n3. Une connexion potentielle avec un autre chapitre de la thèse\n\nFormat : liste structurée par section du chapitre.`
}

function parseReview(raw: string): { score: number; remarks: { type: string; severity: string; text: string }[] } {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        score: typeof parsed.score === 'number' ? parsed.score : 5,
        remarks: Array.isArray(parsed.remarks) ? parsed.remarks.map((r: any) => ({
          type: r.type || 'contenu', severity: r.severity || 'info', text: String(r.text || ''),
        })) : [],
      }
    }
  } catch { /* fallback */ }
  return { score: 5, remarks: [{ type: 'info', severity: 'info', text: 'Réponse non parsable.' }] }
}
