export interface PartData {
  id: string
  thesisId: string
  title: string
  order: number
  createdAt: string
  updatedAt: string
}

export type ChapterStatus = 'draft' | 'in_progress' | 'submitted' | 'done'

export interface ChapterData {
  id: string
  thesisId: string
  partId: string | null
  order: number
  number: string
  title: string
  content: string
  wordCount: number
  status: ChapterStatus
  directorFeedback: string | null
  directorFeedbackAt: string | null
}

export type ThesisStatus = 'draft' | 'in_progress' | 'submitted' | 'completed'

export interface ThesisData {
  id: string
  title: string
  subtitle: string | null
  author: string
  field: string
  university: string
  status: ThesisStatus
  structureMode: 'chapters' | 'parts'
  chapters: ChapterData[]
  parts: PartData[]
}

export interface ChatMsg {
  role: 'user' | 'assistant'
  content: string
}
