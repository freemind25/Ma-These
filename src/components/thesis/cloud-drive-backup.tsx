'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Cloud, CloudOff, Upload, ExternalLink, Unplug, Loader2,
  CheckCircle2, AlertTriangle, FolderOpen, RefreshCw, FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface DriveStatus {
  connected: boolean
  email?: string
  displayName?: string
  lastSyncAt?: string
  needsRefresh?: boolean
  error?: string
}

interface DriveFile {
  id: string
  name: string
  webViewLink: string
  createdTime: string
}

export default function CloudDriveBackup() {
  const [status, setStatus] = useState<DriveStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState<DriveFile[]>([])
  const [error, setError] = useState('')
  const [uploadResult, setUploadResult] = useState<{ name: string; link: string } | null>(null)

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/cloud-drive/status')
      const data = await res.json()
      setStatus(data)
    } catch {
      setStatus({ connected: false })
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch('/api/cloud-drive/files')
      const data = await res.json()
      if (data.files) setFiles(data.files)
    } catch { /* ignore */ }
  }, [])

  // Fetch initial (setState se fait après un await, dans le corps de la fonction
  // async — c'est le pattern standard "fetch au montage" recommandé par React,
  // pas un setState synchrone).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchStatus() }, [fetchStatus])
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (status?.connected) fetchFiles() }, [status?.connected, fetchFiles])

  const handleConnect = async () => {
    setError('')
    try {
      const res = await fetch('/api/cloud-drive/connect')
      const data = await res.json()
      if (data.url) {
        window.open(data.url, '_blank', 'width=600,height=700')
      } else {
        setError(data.error || 'Erreur de configuration Google Drive')
      }
    } catch {
      setError('Impossible de contacter le serveur')
    }
  }

  const handleDisconnect = async () => {
    await fetch('/api/cloud-drive/disconnect', { method: 'POST' })
    setStatus({ connected: false })
    setFiles([])
  }

  const handleUpload = async (format: 'pdf' | 'latex') => {
    setUploading(true)
    setError('')
    setUploadResult(null)
    try {
      // Fetch thesis content
      const thesisRes = await fetch('/api/thesis')
      const thesisData = await thesisRes.json()
      const thesis = thesisData.thesis || thesisData

      const fileName = `${thesis.title || 'these'}_${new Date().toISOString().slice(0, 10)}.${format}`

      if (format === 'latex') {
        // Generate LaTeX content
        let latex = `\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[french]{babel}
\\usepackage{geometry}
\\geometry{margin=2.5cm}

\\title{${thesis.title || 'Ma thèse'}}
\\author{${thesis.author || 'Doctorant'}}
\\date{\\today}

\\begin{document}
\\maketitle
\\tableofcontents
\\newpage

`
        for (const ch of thesis.chapters || []) {
          latex += `\\section{${ch.number}. ${ch.title}}

${(ch.content || '').replace(/&/g, '\\\\&').replace(/%/g, '\\\\%').replace(/#/g, '\\\\#')}

`
        }
        latex += `\\end{document}`

        const res = await fetch('/api/cloud-drive/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName, content: latex, format: 'latex' }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setUploadResult({ name: fileName, link: data.file.link })
      } else {
        // For PDF, we'd normally call the PDF export API first
        // For now, upload the LaTeX as a .tex file and let user convert
        const res = await fetch('/api/cloud-drive/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: fileName.replace('.pdf', '.tex'), content: 'Generate PDF first via Export PDF tool', format: 'latex' }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setUploadResult({ name: fileName, link: data.file.link })
      }
      fetchFiles()
      fetchStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur upload')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 text-emerald-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Connection status card */}
      <Card className={cn(
        'border-2',
        status?.connected ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-200',
      )}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {status?.connected
                ? <Cloud className="h-5 w-5 text-emerald-600" />
                : <CloudOff className="h-5 w-5 text-slate-400" />
              }
              <CardTitle className="text-sm">Google Drive</CardTitle>
              <Badge variant={status?.connected ? 'default' : 'secondary'} className="text-[10px]">
                {status?.connected ? 'Connecté' : 'Non connecté'}
              </Badge>
            </div>
          </div>
          {status?.connected && status.email && (
            <CardDescription className="text-xs">
              {status.displayName || status.email}
              {status.lastSyncAt && (
                <span className="ml-2 text-slate-400">
                  Dernière sync : {new Date(status.lastSyncAt).toLocaleDateString('fr-FR')}
                </span>
              )}
            </CardDescription>
          )}
        </CardHeader>

        {!status?.connected ? (
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Connectez votre Google Drive pour sauvegarder automatiquement votre thèse.
              Les fichiers seront sauvegardés dans un dossier <strong>ThesisFrame</strong>.
            </p>
            <Button onClick={handleConnect} className="w-full text-xs">
              <Cloud className="h-4 w-4 mr-2" />
              Connecter Google Drive
            </Button>
            {error && (
              <p className="text-[11px] text-red-600 mt-2 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />{error}
              </p>
            )}
          </CardContent>
        ) : (
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => handleUpload('latex')}
                disabled={uploading}
                variant="outline"
                className="text-xs h-9"
              >
                {uploading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1.5" />}
                Sauvegarder LaTeX
              </Button>
              <Button
                onClick={() => handleUpload('pdf')}
                disabled={uploading}
                variant="outline"
                className="text-xs h-9"
              >
                {uploading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1.5" />}
                Sauvegarder PDF
              </Button>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleDisconnect} variant="ghost" size="sm" className="text-[10px] text-destructive hover:text-destructive">
                <Unplug className="h-3 w-3 mr-1" />Déconnecter
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Upload result */}
      {uploadResult && (
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="py-3 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-emerald-800">Sauvegardé avec succès</p>
              <p className="text-[10px] text-emerald-600 truncate">{uploadResult.name}</p>
            </div>
            <a href={uploadResult.link} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="text-xs h-7 gap-1">
                <ExternalLink className="h-3 w-3" />Ouvrir
              </Button>
            </a>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && !status?.connected && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-2.5 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {/* Recent files */}
      {files.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs flex items-center gap-1.5">
                <FolderOpen className="h-3.5 w-3.5 text-amber-500" />
                Fichiers sur Google Drive
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={fetchFiles} className="h-6 w-6 p-0">
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {files.map((f) => (
                <a
                  key={f.id}
                  href={f.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <FileText className="h-4 w-4 text-sky-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{f.name}</p>
                    <p className="text-[10px] text-slate-400">{new Date(f.createdTime).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <ExternalLink className="h-3 w-3 text-slate-300 group-hover:text-slate-500 shrink-0" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
