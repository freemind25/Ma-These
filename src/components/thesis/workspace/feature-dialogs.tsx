'use client'

import { Library, Download, Cloud, Scale, Search, Newspaper, PenLine, SpellCheck, ShieldCheck, PenTool } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import ReferencesTab from '@/components/thesis/references-tab'
import ExportPdfContent from '@/components/thesis/export-pdf-tab'
import LiteratureSearch from '@/components/thesis/literature-search'
import ChapterBalance from '@/components/thesis/chapter-balance'
import CloudDriveBackup from '@/components/thesis/cloud-drive-backup'
import JournalFinder from '@/components/thesis/journal-finder'
import ExcalidrawTab from '@/components/thesis/excalidraw-tab'
import GrammarChecker from '@/components/thesis/grammar-checker'
import HarperChecker from '@/components/thesis/harper-checker'
import AutoEdition8C from '@/components/thesis/auto-edition-8c'
import ThesisSearch from '@/components/thesis/thesis-search'
import OfficeExportTab from '@/components/thesis/office-export-tab'
import { FileSpreadsheet } from 'lucide-react'
import type { ThesisData, ChapterData } from '@/types/thesis'

interface FeatureDialogsProps {
  thesis: ThesisData | null
  refsOpen: boolean
  setRefsOpen: (v: boolean) => void
  exportOpen: boolean
  setExportOpen: (v: boolean) => void
  cloudDriveOpen: boolean
  setCloudDriveOpen: (v: boolean) => void
  balanceOpen: boolean
  setBalanceOpen: (v: boolean) => void
  literatureOpen: boolean
  setLiteratureOpen: (v: boolean) => void
  journalFinderOpen: boolean
  setJournalFinderOpen: (v: boolean) => void
  excalidrawOpen: boolean
  setExcalidrawOpen: (v: boolean) => void
  grammarOpen: boolean
  setGrammarOpen: (v: boolean) => void
  harperOpen: boolean
  setHarperOpen: (v: boolean) => void
  autoEditionOpen: boolean
  setAutoEditionOpen: (v: boolean) => void
  searchOpen: boolean
  setSearchOpen: (v: boolean) => void
  officeOpen: boolean
  setOfficeOpen: (v: boolean) => void
  activeChapter: ChapterData | undefined
  onContentChange: (content: string) => void
  onSelectChapter: (id: string) => void
  editorMode: 'rich' | 'plain'
  onToggleEditorMode: () => void
  s2ApiKey: string
  consensusApiKey: string
}

export default function FeatureDialogs({
  thesis, refsOpen, setRefsOpen, exportOpen, setExportOpen,
  cloudDriveOpen, setCloudDriveOpen, balanceOpen, setBalanceOpen, literatureOpen, setLiteratureOpen,
  journalFinderOpen, setJournalFinderOpen,
  excalidrawOpen, setExcalidrawOpen,
  grammarOpen, setGrammarOpen,
  harperOpen, setHarperOpen,
  autoEditionOpen, setAutoEditionOpen,
  searchOpen, setSearchOpen,
  officeOpen, setOfficeOpen,
  activeChapter, onContentChange, onSelectChapter, editorMode, onToggleEditorMode,
  s2ApiKey, consensusApiKey,
}: FeatureDialogsProps) {
  return (
    <>
      <Dialog open={refsOpen} onOpenChange={setRefsOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base"><Library className="h-4 w-4 text-emerald-600" />References bibliographiques</DialogTitle>
          </DialogHeader>
          <ReferencesTab />
        </DialogContent>
      </Dialog>

      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base"><Download className="h-4 w-4 text-emerald-600" />Export PDF</DialogTitle>
          </DialogHeader>
          <ExportPdfContent />
        </DialogContent>
      </Dialog>

      <Dialog open={cloudDriveOpen} onOpenChange={setCloudDriveOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base"><Cloud className="h-4 w-4 text-emerald-600" />Sauvegarde Google Drive</DialogTitle>
          </DialogHeader>
          <CloudDriveBackup />
        </DialogContent>
      </Dialog>

      <Dialog open={balanceOpen} onOpenChange={setBalanceOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base"><Scale className="h-4 w-4 text-emerald-600" />Bilan d'equilibre des chapitres</DialogTitle>
          </DialogHeader>
          {thesis && <ChapterBalance chapters={thesis.chapters} />}
        </DialogContent>
      </Dialog>

      <Dialog open={literatureOpen} onOpenChange={setLiteratureOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base"><Search className="h-4 w-4 text-emerald-600" />Recherche de litterature scientifique</DialogTitle>
          </DialogHeader>
          <LiteratureSearch s2ApiKey={s2ApiKey} consensusApiKey={consensusApiKey} />
        </DialogContent>
      </Dialog>

      <Dialog open={journalFinderOpen} onOpenChange={setJournalFinderOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base"><Newspaper className="h-4 w-4 text-emerald-600" />Trouver un journal en acces ouvert</DialogTitle>
          </DialogHeader>
          <JournalFinder />
        </DialogContent>
      </Dialog>

      {/* ── Excalidraw ── */}
      <Dialog open={excalidrawOpen} onOpenChange={setExcalidrawOpen}>
        <DialogContent className="sm:max-w-[95vw] lg:max-w-[90vw] xl:max-w-[85vw] max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="px-4 pt-4 pb-2">
            <DialogTitle className="flex items-center gap-2 text-base"><PenLine className="h-4 w-4 text-emerald-600" />Editeur de diagrammes — Excalidraw</DialogTitle>
          </DialogHeader>
          <ExcalidrawTab />
        </DialogContent>
      </Dialog>

      {/* ── Grammar Checker (LanguageTool) ── */}
      <Dialog open={grammarOpen} onOpenChange={setGrammarOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base"><SpellCheck className="h-4 w-4 text-emerald-600" />Verification grammaticale — LanguageTool</DialogTitle>
          </DialogHeader>
          <GrammarChecker content={activeChapter?.content || ''} onApplySuggestion={(offset, length, replacement) => {
            if (!activeChapter) return
            const text = activeChapter.content || ''
            const newText = text.slice(0, offset) + replacement + text.slice(offset + length)
            onContentChange(newText)
          }} />
        </DialogContent>
      </Dialog>

      {/* ── Harper Style Checker ── */}
      <Dialog open={harperOpen} onOpenChange={setHarperOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base"><ShieldCheck className="h-4 w-4 text-emerald-600" />Analyse de style academique — Harper</DialogTitle>
          </DialogHeader>
          <HarperChecker content={activeChapter?.content || ''} onApplySuggestion={(offset, length, replacement) => {
            if (!activeChapter) return
            const text = activeChapter.content || ''
            const newText = text.slice(0, offset) + replacement + text.slice(offset + length)
            onContentChange(newText)
          }} />
        </DialogContent>
      </Dialog>

      {/* ── Auto-édition 8C Checklist ── */}
      <Dialog open={autoEditionOpen} onOpenChange={setAutoEditionOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base"><ShieldCheck className="h-4 w-4 text-emerald-600" />Auto-édition : les 8 C</DialogTitle>
          </DialogHeader>
          <AutoEdition8C />
        </DialogContent>
      </Dialog>

      {/* ── Thesis Search ── */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base"><PenTool className="h-4 w-4 text-emerald-600" />Recherche plein texte — MeiliSearch</DialogTitle>
          </DialogHeader>
          <ThesisSearch thesis={thesis} onSelectChapter={(id) => { onSelectChapter(id); setSearchOpen(false) }} />
        </DialogContent>
      </Dialog>

      {/* ── Office Export (Word + PowerPoint) ── */}
      <Dialog open={officeOpen} onOpenChange={setOfficeOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base"><FileSpreadsheet className="h-4 w-4 text-emerald-600" />Export Office — Word &amp; PowerPoint</DialogTitle>
          </DialogHeader>
          {thesis && <OfficeExportTab thesis={thesis} activeChapter={activeChapter || null} />}
        </DialogContent>
      </Dialog>
    </>
  )
}