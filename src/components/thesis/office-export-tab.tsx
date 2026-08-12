'use client'

import { useState, useCallback } from 'react'
import { FileText, Presentation, Download, Loader2, CheckCircle2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { ChapterData, ThesisData } from '@/types/thesis'

interface OfficeExportTabProps {
  thesis: ThesisData
  activeChapter: ChapterData | null
}

export default function OfficeExportTab({ thesis, activeChapter }: OfficeExportTabProps) {
  const [exporting, setExporting] = useState<'docx' | 'pptx' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const downloadFile = useCallback(async (url: string, filename: string) => {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
      title: thesis.title,
      author: thesis.author,
      university: thesis.university,
      field: thesis.field,
      chapters: thesis.chapters.map(c => ({
        number: c.number,
        title: c.title,
        content: c.content,
        order: c.order,
        wordCount: c.wordCount,
      })),
    }) })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Erreur réseau' }))
      throw new Error(err.error || 'Erreur inconnue')
    }
    const blob = await res.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = filename
    a.click()
    URL.revokeObjectURL(a.href)
  }, [thesis])

  const handleExportDocx = async () => {
    setExporting('docx')
    setError(null)
    setSuccess(null)
    try {
      await downloadFile('/api/office/export-docx', `these-${thesis.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)}.docx`)
      setSuccess('Document Word exporté avec succès.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur interne du serveur.')
    } finally {
      setExporting(null)
    }
  }

  const handleExportPptx = async () => {
    setExporting('pptx')
    setError(null)
    setSuccess(null)
    try {
      await downloadFile('/api/office/export-pptx', `soutenance-${thesis.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)}.pptx`)
      setSuccess('Présentation PowerPoint générée avec succès.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur interne du serveur.')
    } finally {
      setExporting(null)
    }
  }

  const filledChapters = thesis.chapters.filter(c => c.content && c.content.trim().length > 0)

  return (
    <div className="space-y-4 p-1">
      <p className="text-xs text-slate-400 leading-relaxed">
        Exportez votre thèse et préparez votre soutenance grâce à OfficeCLI.
      </p>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300">
          <X className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Word Export */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-400" />
            <CardTitle className="text-sm text-white">Document Word (.docx)</CardTitle>
          </div>
          <CardDescription className="text-[11px] text-slate-400">
            Export complet : page de titre + tous les chapitres rédigés.
            Format professionnel Times New Roman.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="flex items-center justify-between">
            <div className="text-[10px] text-slate-500">
              {filledChapters.length} chapitre(s) rédigé(s) · {thesis.chapters.reduce((s, c) => s + c.wordCount, 0).toLocaleString()} mots
            </div>
            <Button
              onClick={handleExportDocx}
              disabled={exporting === 'docx' || filledChapters.length === 0}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
            >
              {exporting === 'docx' ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5 mr-1.5" />
              )}
              Exporter .docx
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* PowerPoint Export */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-center gap-2">
            <Presentation className="h-4 w-4 text-orange-400" />
            <CardTitle className="text-sm text-white">Présentation de soutenance (.pptx)</CardTitle>
          </div>
          <CardDescription className="text-[11px] text-slate-400">
            Génère automatiquement un diaporama : titre, plan, une diapositive par chapitre, conclusion.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="flex items-center justify-between">
            <div className="text-[10px] text-slate-500">
              ~{filledChapters.length + 3} diapositives
            </div>
            <Button
              onClick={handleExportPptx}
              disabled={exporting === 'pptx' || filledChapters.length === 0}
              size="sm"
              className="bg-orange-600 hover:bg-orange-700 text-white text-xs"
            >
              {exporting === 'pptx' ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5 mr-1.5" />
              )}
              Générer .pptx
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active chapter info */}
      {activeChapter && activeChapter.content && (
        <div className="rounded-lg bg-slate-900/30 border border-slate-800/50 p-3">
          <div className="text-[10px] text-slate-500 mb-1">Chapitre actif</div>
          <div className="text-xs text-slate-300 font-medium">{activeChapter.number}. {activeChapter.title}</div>
          <div className="text-[10px] text-slate-500">{activeChapter.wordCount.toLocaleString()} mots</div>
        </div>
      )}
    </div>
  )
}
