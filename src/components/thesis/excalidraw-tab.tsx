'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Download, Trash2, Undo2, Redo2, ZoomIn, ZoomOut, Image as ImageIcon, PenLine } from 'lucide-react'

// Dynamic import to avoid SSR issues - Excalidraw needs browser APIs
const Excalidraw = dynamic(
  () => import('@excalidraw/excalidraw').then((mod) => mod.Excalidraw),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <PenLine className="h-8 w-8 text-emerald-500 animate-pulse" />
          <p className="text-sm text-slate-500">Chargement de l'éditeur de diagrammes...</p>
        </div>
      </div>
    ),
  }
)

export default function ExcalidrawTab() {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null)
  const [data] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tf_excalidraw_data')
      if (saved) {
        try { return JSON.parse(saved) } catch { /* ignore */ }
      }
    }
    return null
  })

  const handleExportPNG = useCallback(async () => {
    if (!excalidrawAPI) return
    const blob = await excalidrawAPI.exportToBlob({
      mimeType: 'image/png',
      quality: 1,
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'diagramme-these.png'
    a.click()
    URL.revokeObjectURL(url)
  }, [excalidrawAPI])

  const handleExportSVG = useCallback(async () => {
    if (!excalidrawAPI) return
    const svg = await excalidrawAPI.exportToSvg({
      mimeType: 'image/svg+xml',
    })
    const svgStr = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([svgStr], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'diagramme-these.svg'
    a.click()
    URL.revokeObjectURL(url)
  }, [excalidrawAPI])

  const handleClear = useCallback(() => {
    if (!excalidrawAPI) return
    excalidrawAPI.resetScene()
    localStorage.removeItem('tf_excalidraw_data')
  }, [excalidrawAPI])

  const handleUndo = useCallback(() => {
    excalidrawAPI?.undo()
  }, [excalidrawAPI])

  const handleRedo = useCallback(() => {
    excalidrawAPI?.redo()
  }, [excalidrawAPI])

  const handleZoomIn = useCallback(() => {
    excalidrawAPI?.zoomIn()
  }, [excalidrawAPI])

  const handleZoomOut = useCallback(() => {
    excalidrawAPI?.zoomOut()
  }, [excalidrawAPI])

  const updateScene = useCallback((_sceneData: any) => {
    // Debounced save to localStorage
    clearTimeout((window as any)._excalidrawSaveTimer)
    ;(window as any)._excalidrawSaveTimer = setTimeout(() => {
      const exportData = excalidrawAPI?.getSceneElements()
      if (exportData) {
        localStorage.setItem('tf_excalidraw_data', JSON.stringify(exportData))
      }
    }, 1000)
  }, [excalidrawAPI])

  return (
    <div className="flex flex-col h-[65vh] border rounded-lg overflow-hidden">
      {/* Floating toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 bg-white border-b shrink-0">
        <span className="text-xs font-medium text-slate-500 mr-2">Diagrammes</span>
        <div className="h-4 w-px bg-slate-200 mx-1" />
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleUndo} title="Annuler">
          <Undo2 className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleRedo} title="Rétablir">
          <Redo2 className="h-3.5 w-3.5" />
        </Button>
        <div className="h-4 w-px bg-slate-200 mx-1" />
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomIn} title="Zoom +">
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomOut} title="Zoom -">
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        <div className="h-4 w-px bg-slate-200 mx-1" />
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={handleExportPNG}>
          <ImageIcon className="h-3 w-3" /> PNG
        </Button>
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={handleExportSVG}>
          <Download className="h-3 w-3" /> SVG
        </Button>
        <div className="flex-1" />
        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-500" onClick={handleClear} title="Effacer tout">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Canvas */}
      <div className="flex-1">
        <Excalidraw
          excalidrawAPI={(api: any) => setExcalidrawAPI(api)}
          initialData={data}
          onChange={updateScene}
          theme="light"
          gridModeEnabled={false}
          viewModeEnabled={false}
          zenModeEnabled={false}
          UIOptions={{
            canvasActions: {
              loadScene: true,
              export: false,
              saveToActiveFile: false,
              toggleTheme: false,
              changeViewBackgroundColor: true,
              clearCanvas: false,
          }}}
          langCode="fr-FR"
        />
      </div>

      {/* Help text */}
      <div className="px-3 py-1.5 bg-slate-50 border-t text-[10px] text-slate-400 shrink-0">
        Créez des diagrammes, schémas conceptuels, organigrammes pour votre thèse. Exportez en PNG/SVG pour les insérer dans vos chapitres.
      </div>
    </div>
  )
}
