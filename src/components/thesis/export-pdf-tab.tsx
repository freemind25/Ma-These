'use client'

import { useState } from 'react'
import {
  Download,
  FileText,
  CheckCircle2,
  Type,
  ChevronRight,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { DEFAULT_CHAPTERS } from '@/components/thesis/thesis-plan-tab'

// ─── Export PDF Content ────────────────────────────────────────
const EXPORT_CHAPTERS_INIT = DEFAULT_CHAPTERS
  .filter(c => c.id !== 'cover' && c.id !== 'annexes')
  .map(c => ({ title: c.title, content: '', selected: ['intro', 'lit', 'context', 'results', 'discussion', 'conclusion'].includes(c.id) }))

export default function ExportPdfContent() {
  const [chapters, setChapters] = useState(EXPORT_CHAPTERS_INIT)
  const [thesisTitle, setThesisTitle] = useState('Titre de la thèse')
  const [author, setAuthor] = useState('Prénom NOM')
  const [supervisor, setSupervisor] = useState('Pr. Prénom NOM')
  const [university, setUniversity] = useState('')
  const [faculty, setFaculty] = useState('')
  const [department, setDepartment] = useState('')
  const [keywords, setKeywords] = useState('')
  const [includeToc, setIncludeToc] = useState(true)
  const [includePageNumbers, setIncludePageNumbers] = useState(true)
  const [watermark, setWatermark] = useState('none')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null)
  const [selectAll, setSelectAll] = useState(true)

  const selectedCount = chapters.filter(c => c.selected).length
  const chaptersWithContent = chapters.filter(c => c.selected && c.content.trim()).length
  const totalChars = chapters.filter(c => c.selected).reduce((a, c) => a + c.content.length, 0)

  function toggleChapter(id: string) {
    setChapters(prev => prev.map(c => c.title === id ? { ...c, selected: !c.selected } : c))
  }

  function expandChapter(id: string) {
    setExpandedChapter(prev => prev === id ? null : id)
  }

  function updateContent(title: string, content: string) {
    setChapters(prev => prev.map(c => c.title === title ? { ...c, content } : c))
  }

  function toggleSelectAll() {
    const newVal = !selectAll
    setSelectAll(newVal)
    setChapters(prev => prev.map(c => ({ ...c, selected: newVal })))
  }

  async function generatePdf() {
    setError('')
    if (chaptersWithContent === 0) {
      setError('Ajoutez du contenu dans au moins un chapitre sélectionné.')
      return
    }
    setGenerating(true)
    try {
      const res = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thesisTitle,
          author,
          supervisor,
          university,
          faculty,
          department,
          keywords,
          date: new Date().getFullYear().toString(),
          includeToc,
          includePageNumbers,
          watermark: watermark !== 'none' ? watermark : undefined,
          chapters: chapters.map(c => ({ title: c.title, content: c.content, selected: c.selected })),
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur de génération')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${thesisTitle.replace(/[^a-zA-Z0-9àâéèêëïîôùûüç\s-]/g, '').substring(0, 50)}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-emerald-100 text-emerald-700">
          <Download className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold">Export PDF</h3>
          <p className="text-xs text-muted-foreground">Générez un document PDF formaté à partir de vos chapitres</p>
        </div>
      </div>

      {/* Metadata */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Informations du document</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Titre de la thèse</Label>
              <Input value={thesisTitle} onChange={e => setThesisTitle(e.target.value)} placeholder="Titre de la thèse" className="h-9 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Auteur(e)</Label>
              <Input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Prénom NOM" className="h-9 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Directeur(rice) de thèse</Label>
              <Input value={supervisor} onChange={e => setSupervisor(e.target.value)} placeholder="Pr. Prénom NOM" className="h-9 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Université (optionnel)</Label>
              <Input value={university} onChange={e => setUniversity(e.target.value)} placeholder="Nom de l'université" className="h-9 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Faculté (optionnel)</Label>
              <Input value={faculty} onChange={e => setFaculty(e.target.value)} placeholder="Nom de la faculté" className="h-9 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Département (optionnel)</Label>
              <Input value={department} onChange={e => setDepartment(e.target.value)} placeholder="Nom du département" className="h-9 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Mots-clés (optionnel)</Label>
              <Input value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="mot-clé 1, mot-clé 2, …" className="h-9 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Filigrane (optionnel)</Label>
              <Select value={watermark} onValueChange={setWatermark}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Aucun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun</SelectItem>
                  <SelectItem value="BROUILLON">BROUILLON</SelectItem>
                  <SelectItem value="CONFIDENTIEL">CONFIDENTIEL</SelectItem>
                  <SelectItem value="VERSION PROVISOIRE">VERSION PROVISOIRE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={includeToc} onCheckedChange={v => setIncludeToc(!!v)} />
              Table des matières
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={includePageNumbers} onCheckedChange={v => setIncludePageNumbers(!!v)} />
              Numéros de page
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Chapter selection & content */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Chapitres</CardTitle>
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
              <Checkbox checked={selectAll} onCheckedChange={toggleSelectAll} />
              Tout sélectionner
            </label>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {chapters.map(ch => (
            <div key={ch.title} className="border rounded-lg overflow-hidden">
              <div
                className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${ch.selected ? 'bg-emerald-50/50 border-l-2 border-l-emerald-500' : 'opacity-60 hover:opacity-80'}`}
                onClick={() => expandChapter(ch.title)}
              >
                <Checkbox
                  checked={ch.selected}
                  onCheckedChange={() => toggleChapter(ch.title)}
                  onClick={e => e.stopPropagation()}
                />
                <span className="flex-1 text-sm font-medium truncate">{ch.title}</span>
                {ch.selected && ch.content.trim() && (
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {ch.content.length > 500 ? `${Math.round(ch.content.length / 250)}p est.` : `${ch.content.length} car.`}
                  </Badge>
                )}
                {ch.selected && !ch.content.trim() && (
                  <Badge variant="outline" className="text-xs text-muted-foreground shrink-0">Vide</Badge>
                )}
                <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${expandedChapter === ch.title ? 'rotate-90' : ''}`} />
              </div>
              {expandedChapter === ch.title && (
                <div className="border-t px-3 py-3 bg-muted/30">
                  <Textarea
                    value={ch.content}
                    onChange={e => updateContent(ch.title, e.target.value)}
                    placeholder={`Collez ou rédigez le contenu de « ${ch.title } » ici…`}
                    className="min-h-[160px] max-h-96 text-sm resize-y"
                  />
                  {ch.content.trim() && (
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {ch.content.length} caractères · ~{Math.round(ch.content.split(/\s+/).filter(Boolean).length)} mots
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Stats & Generate */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            {selectedCount} chapitre{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {chaptersWithContent} avec du contenu
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Type className="h-3.5 w-3.5" />
            {totalChars.toLocaleString()} caractères
          </div>
        </div>
        <Button
          onClick={generatePdf}
          disabled={generating || chaptersWithContent === 0}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700"
        >
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {generating ? 'Génération…' : 'Générer le PDF'}
        </Button>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}
    </div>
  )
}
