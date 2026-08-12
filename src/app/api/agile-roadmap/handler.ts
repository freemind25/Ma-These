import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

// ─── Default Sprints Data (from the Notion template) ──────────
const DEFAULT_SPRINTS = [
  // Phase 0: Stratégie
  { sprintNumber: 0, phase: 'phase_0', title: 'Préparation du projet', description: 'Configurer les outils, le calendrier et les demandes de financement.', deliverable: 'Outils configurés, calendrier validé', stories: ['Configurer l\'environnement de travail (ThesisFrame, Zotero, etc.)', 'Déterminer le calendrier initial', 'Demandes de financement (CRSH/FRQ)'] },
  // Phase 1: Cours & devis
  { sprintNumber: 1, phase: 'phase_1', title: 'Idéation', description: 'Préciser la question de recherche principale du mémoire.', deliverable: 'Question de recherche formulée', stories: ['Brainstorming thématique', 'Lecture exploratoire de 10-15 articles clés', 'Formulation de la question de recherche', 'Discussion initiale avec le directeur'] },
  { sprintNumber: 2, phase: 'phase_1', title: 'Revue de littérature initiale', description: 'Première revue de littérature pour ancrer le projet.', deliverable: 'Tableau de synthèse de la littérature', stories: ['Recherche systématique dans les bases de données', 'Lecture et annotation de 20-30 articles', 'Rédaction du tableau de synthèse', 'Identification des lacunes dans la littérature'] },
  { sprintNumber: 3, phase: 'phase_1', title: 'Esquisse du devis de recherche', description: 'Problématique, questions, théorie, hypothèses, méthodologie pour chaque article.', deliverable: 'Esquisse du devis', stories: ['Rédiger la problématique', 'Formuler les questions et hypothèses article 1', 'Formuler les questions et hypothèses article 2', 'Décrire le cadre théorique', 'Esquisser la méthodologie pour chaque article'] },
  { sprintNumber: 4, phase: 'phase_1', title: 'Révision et approbation du devis', description: 'Finaliser et faire approuver le devis de recherche par le directeur.', deliverable: 'Devis de recherche validé', stories: ['Révision du devis complet', 'Rencontre avec le directeur pour approbation', 'Intégration des retours du directeur', 'Version finale du devis'] },
  // Phase 2: Article 1
  { sprintNumber: 5, phase: 'phase_2', title: 'Article 1 – Préparation', description: 'Collecte des données ou préparation méthodologique pour l\'article 1.', deliverable: 'Données brutes article 1 / Approbation éthique', stories: ['Demande d\'approbation éthique (si requis)', 'Préparation du protocole de collecte', 'Configuration des outils d\'analyse', 'Pilote de la collecte (si possible)'] },
  { sprintNumber: 6, phase: 'phase_2', title: 'Article 1 – Collecte des données', description: 'Collecte, nettoyage et organisation des variables.', deliverable: 'Jeu de données propre', stories: ['Collecte des données', 'Nettoyage des données', 'Organisation des variables', 'Documentation du processus de collecte'] },
  { sprintNumber: 7, phase: 'phase_2', title: 'Article 1 – Analyse', description: 'Analyses statistiques et premiers résultats.', deliverable: 'Résultats d\'analyse préliminaires', stories: ['Analyses descriptives', 'Analyses inférentielles', 'Création des tableaux et figures', 'Première interprétation des résultats'] },
  { sprintNumber: 8, phase: 'phase_2', title: 'Article 1 – Résultats & Discussion', description: 'Rédaction des résultats et discussion provisoire.', deliverable: 'Section résultats + discussion brouillon', stories: ['Rédiger la section résultats', 'Rédiger la discussion provisoire', 'Créer les figures et tableaux définitifs', 'Relire et réviser'] },
  { sprintNumber: 9, phase: 'phase_2', title: 'Article 1 – Rédaction complète', description: 'Rédaction complète : introduction, revue de littérature, méthode, résultats.', deliverable: 'Article 1 complet (brouillon)', stories: ['Rédiger l\'introduction', 'Rédiger la revue de littérature', 'Rédiger la méthode', 'Assembler et réviser l\'article complet', 'Soumettre au directeur pour feedback'] },
  // Phase 3: Article 2
  { sprintNumber: 10, phase: 'phase_3', title: 'Article 2 – Définition', description: '(Re)définir question/hypothèse et objectifs article 2 + recherche documentaire ciblée.', deliverable: 'Cadre de l\'article 2 défini', stories: ['Analyser les résultats de l\'article 1 pour identifier la suite', 'Formuler la question de recherche article 2', 'Recherche documentaire ciblée', 'Définir les hypothèses et la méthodologie'] },
  { sprintNumber: 11, phase: 'phase_3', title: 'Article 2 – Préparation & Défense', description: 'Présentation du projet de recherche (défense) et début article 2.', deliverable: 'Présentation faite / Données article 2', stories: ['Préparer la présentation orale', 'Défense du projet de recherche', 'Préparation méthodologique article 2', 'Début de la collecte de données'] },
  { sprintNumber: 12, phase: 'phase_3', title: 'Article 2 – Collecte des données', description: 'Collecte, nettoyage et organisation des variables pour l\'article 2.', deliverable: 'Jeu de données propre article 2', stories: ['Collecte des données', 'Nettoyage des données', 'Organisation des variables', 'Documentation du processus'] },
  { sprintNumber: 13, phase: 'phase_3', title: 'Article 2 – Analyse', description: 'Analyses et premiers résultats de l\'article 2.', deliverable: 'Résultats d\'analyse article 2', stories: ['Analyses descriptives et inférentielles', 'Création des tableaux et figures', 'Première interprétation', 'Comparer avec les résultats de l\'article 1'] },
  { sprintNumber: 14, phase: 'phase_3', title: 'Article 2 – Résultats & Discussion', description: 'Rédaction résultats et discussion provisoire de l\'article 2.', deliverable: 'Section résultats + discussion article 2', stories: ['Rédiger la section résultats', 'Rédiger la discussion', 'Créer les figures définitives', 'Relire et réviser'] },
  { sprintNumber: 15, phase: 'phase_3', title: 'Article 2 – Rédaction complète', description: 'Rédaction complète de l\'article 2.', deliverable: 'Article 2 complet (brouillon)', stories: ['Rédiger l\'introduction', 'Rédiger la revue de littérature ciblée', 'Rédiger la méthode', 'Assembler et réviser l\'article', 'Soumettre au directeur pour feedback'] },
  // Phase 4: Dépôt
  { sprintNumber: 16, phase: 'phase_4', title: 'Introduction générale & Conclusion', description: 'Rédaction de l\'introduction générale et de la conclusion/synthèse du mémoire.', deliverable: 'Intro + conclusion rédigées', stories: ['Rédiger l\'introduction générale', 'Rédiger la conclusion/synthèse', 'Assurer la cohérence entre les articles', 'Mise en forme selon les normes'] },
  { sprintNumber: 17, phase: 'phase_4', title: 'Pré-dépôt', description: 'Dépôt complet au directeur/directrice pour révision finale.', deliverable: 'Pré-dépôt envoyé', stories: ['Révision finale de l\'ensemble', 'Vérification des normes de présentation', 'Génération du document final (PDF/Word)', 'Envoi au directeur'] },
  { sprintNumber: 18, phase: 'phase_4', title: 'Correction et dépôt officiel', description: 'Corrections finales et dépôt officiel du mémoire.', deliverable: 'Mémoire déposé', stories: ['Intégrer les retours du directeur', 'Correction finale', 'Vérification anti-plagiat', 'Dépôt officiel'] },
]

// ─── Phase metadata ──────────────────────────────────────────
export const PHASES = [
  { id: 'phase_0', label: 'Phase 0 : Stratégie', color: 'emerald', icon: '🚀' },
  { id: 'phase_1', label: 'Phase 1 : Cours & Devis', color: 'sky', icon: '📋' },
  { id: 'phase_2', label: 'Phase 2 : Article 1', color: 'amber', icon: '📝' },
  { id: 'phase_3', label: 'Phase 3 : Article 2', color: 'violet', icon: '✍️' },
  { id: 'phase_4', label: 'Phase 4 : Dépôt', color: 'rose', icon: '🎯' },
]

// ─── GET: Fetch all sprints with stories ─────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    let thesisId = searchParams.get('thesisId')

    // Auto-detect thesis ID if not provided
    if (!thesisId) {
      const firstThesis = await db.thesis.findFirst({ select: { id: true } })
      thesisId = firstThesis?.id || 'local-thesis-001'
    }

    let sprints = await db.agileSprint.findMany({
      where: { thesisId },
      include: { stories: { orderBy: { order: 'asc' } } },
      orderBy: { sprintNumber: 'asc' },
    })

    // Auto-seed if no sprints exist
    if (sprints.length === 0) {
      for (const sp of DEFAULT_SPRINTS) {
        const created = await db.agileSprint.create({
          data: {
            thesisId,
            sprintNumber: sp.sprintNumber,
            phase: sp.phase,
            title: sp.title,
            description: sp.description,
            deliverable: sp.deliverable,
            order: sp.sprintNumber,
            stories: {
              create: (sp.stories || []).map((s: string, i: number) => ({
                title: s,
                order: i,
              })),
            },
          },
          include: { stories: true },
        })
        sprints.push(created)
      }
    }

    // Compute stats
    const totalSprints = sprints.length
    const doneSprints = sprints.filter(s => s.status === 'done').length
    const totalStories = sprints.reduce((sum, s) => sum + s.stories.length, 0)
    const doneStories = sprints.reduce((sum, s) => sum + s.stories.filter(st => st.status === 'done').length, 0)

    return NextResponse.json({
      success: true,
      sprints,
      stats: { totalSprints, doneSprints, totalStories, doneStories },
      phases: PHASES,
    })
  } catch (error) {
    console.error('[GET /api/agile-roadmap] Error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erreur serveur' }, { status: 500 })
  }
}

// ─── PATCH: Update sprint or story status ────────────────────
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, sprintId, storyId, status } = body as {
      action: 'update_sprint_status' | 'update_story_status' | 'add_story'
      sprintId?: string
      storyId?: string
      status?: string
      title?: string
      description?: string
    }

    if (action === 'update_sprint_status' && sprintId && status) {
      const updated = await db.agileSprint.update({
        where: { id: sprintId },
        data: {
          status,
          ...(status === 'in_progress' ? { startedAt: new Date() } : {}),
          ...(status === 'done' ? { completedAt: new Date() } : {}),
          ...(status === 'todo' ? { startedAt: null, completedAt: null } : {}),
        },
        include: { stories: true },
      })
      return NextResponse.json({ success: true, sprint: updated })
    }

    if (action === 'update_story_status' && storyId && status) {
      const updated = await db.agileStory.update({
        where: { id: storyId },
        data: { status },
      })
      return NextResponse.json({ success: true, story: updated })
    }

    if (action === 'add_story' && sprintId && body.title) {
      const story = await db.agileStory.create({
        data: {
          sprintId,
          title: body.title,
          description: body.description || '',
          order: body.order ?? 0,
        },
      })
      return NextResponse.json({ success: true, story })
    }

    return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
  } catch (error) {
    console.error('[PATCH /api/agile-roadmap] Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// ─── DELETE: Remove a story ──────────────────────────────────
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storyId = searchParams.get('storyId')
    if (!storyId) return NextResponse.json({ error: 'storyId requis' }, { status: 400 })

    await db.agileStory.delete({ where: { id: storyId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/agile-roadmap] Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// ─── POST: Reset/Re-seed sprints ─────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const { thesisId } = await request.json() as { thesisId?: string }
    const tid = thesisId || 'local-thesis-001'

    // Delete existing
    await db.agileStory.deleteMany({ where: { sprint: { thesisId: tid } } })
    await db.agileSprint.deleteMany({ where: { thesisId: tid } })

    // Re-seed
    const sprints: any[] = []
    for (const sp of DEFAULT_SPRINTS) {
      const created = await db.agileSprint.create({
        data: {
          thesisId: tid,
          sprintNumber: sp.sprintNumber,
          phase: sp.phase,
          title: sp.title,
          description: sp.description,
          deliverable: sp.deliverable,
          order: sp.sprintNumber,
          stories: {
            create: (sp.stories || []).map((s: string, i: number) => ({
              title: s,
              order: i,
            })),
          },
        },
        include: { stories: true },
      })
      sprints.push(created)
    }

    return NextResponse.json({ success: true, sprints, message: 'Feuille de route réinitialisée' })
  } catch (error) {
    console.error('[POST /api/agile-roadmap] Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
