'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Box, Upload, Unplug, Loader2,
  CheckCircle2, AlertTriangle, FolderOpen, RefreshCw, FileText,
  FolderPlus, Trash2, HardDrive,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────
interface BoxStatus {
  connected: boolean
  email?: string
  displayName?: string
  lastSyncAt?: string
  needsRefresh?: boolean
  error?: string
}

interface BoxFile {
  id: string
  name: string
  type: string
  created_at?: string
  modified_at?: string
  size?: number
}

// ─── Helpers ──────────────────────────────────────────────────────
function formatSize(bytes?: number): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase()
  if (['pdf'].includes(ext)) return 'text-red-400'
  if (['doc', 'docx'].includes(ext)) return 'text-blue-400'
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'text-emerald-400'
  if (['ppt', 'pptx'].includes(ext)) return 'text-orange-400'
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'text-violet-400'
  if (['zip', 'rar', '7z'].includes(ext)) return 'text-amber-400'
  return 'text-slate-400'
}

// ─── Component ────────────────────────────────────────────────────
interface BoxDrivePanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function BoxDrivePanel({ open, onOpenChange }: BoxDrivePanelProps) {
  const [status, setStatus] = useState<BoxStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [files, setFiles] = useState<BoxFile[]>([])
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [newFolderName, setNewFolderName] = useState('')
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ─── Fetch status ───
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/box-drive/status')
      const data = await res.json()
      setStatus(data)
    } catch {
      setStatus({ connected: false })
    } finally {
      setLoading(false)
    }
  }, [])

  // ─── Fetch files ───
  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch('/api/box-drive/files')
      const data = await res.json()
      if (data.files) setFiles(data.files)
      if (data.folders) {
        // Merge folders and files, folders first
        const merged = [...data.folders, ...data.files]
        setFiles(merged)
      }
    } catch { /* ignore */ }
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (open) { fetchStatus() } }, [open, fetchStatus])
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (status?.connected && open) fetchFiles() }, [status?.connected, open, fetchFiles])

  // ─── Connect ───
  const handleConnect = async () => {
    setError('')
    try {
      const res = await fetch('/api/box-drive/connect')
      const data = await res.json()
      if (data.url) {
        window.open(data.url, '_blank', 'width=600,height=700')
      } else {
        setError(data.error || 'Configuration Box manquante')
      }
    } catch {
      setError('Impossible de contacter le serveur')
    }
  }

  // ─── Disconnect ───
  const handleDisconnect = async () => {
    await fetch('/api/box-drive/disconnect', { method: 'POST' })
    setStatus({ connected: false })
    setFiles([])
  }

  // ─── Upload ───
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadProgress(`Envoi de ${file.name}…`)
    setError('')
    setSuccessMsg('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/box-drive/files', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Échec de l\'upload')

      setSuccessMsg(`${file.name} uploadé avec succès`)
      fetchFiles()
      fetchStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur upload')
    } finally {
      setUploading(false)
      setUploadProgress('')
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // ─── Create folder ───
  const handleCreateFolder = async () => {
    const name = newFolderName.trim()
    if (!name) return

    try {
      const res = await fetch('/api/box-drive/files', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderName: name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Échec de la création')

      setNewFolderName('')
      setShowNewFolder(false)
      setSuccessMsg(`Dossier « ${name} » créé`)
      fetchFiles()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
    }
  }

  // ─── Delete ───
  const handleDelete = async (fileId: string, fileName: string) => {
    if (!confirm(`Supprimer « ${fileName} » de Box ?`)) return
    setDeletingId(fileId)
    try {
      const res = await fetch('/api/box-drive/files', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Échec de la suppression')
      }
      setFiles(prev => prev.filter(f => f.id !== fileId))
      setSuccessMsg(`« ${fileName} » supprimé`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setDeletingId(null)
    }
  }

  // ─── Render ───
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent side="right" className="w-full sm:max-w-md bg-slate-950 border-slate-800 p-0 flex flex-col overflow-hidden">
      <SheetHeader className="px-6 pt-6 pb-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Box className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <SheetTitle className="text-sm font-semibold text-white">Box — Stockage cloud</SheetTitle>
            <p className="text-[11px] text-slate-400 mt-0.5">Uploadez et conservez vos documents directement dans Box</p>
          </div>
        </div>
      </SheetHeader>

      <Separator className="bg-slate-800" />

      <ScrollArea className="flex-1">
        <div className="px-6 py-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
            </div>
          ) : !status?.connected ? (
            /* ─── Not connected state ─── */
            <div className="space-y-4">
              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5 text-slate-500" />
                    <CardTitle className="text-sm text-white">Box non connecté</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Connectez votre compte Box pour stocker vos documents de thèse
                    (articles, données, brouillons) dans le cloud. Les fichiers seront
                    organisés dans un dossier <strong className="text-slate-300">ThesisFrame</strong>.
                  </p>
                  <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3">
                    <p className="text-[10px] font-medium text-amber-400 mb-1">Configuration requise</p>
                    <p className="text-[10px] text-slate-400">
                      Créez une app OAuth 2.0 sur la{' '}
                      <a href="https://app.box.com/developers/console" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
                        Console Box Developers
                      </a>{' '}
                      puis ajoutez <code className="text-[10px] bg-slate-800 px-1 rounded">BOX_CLIENT_ID</code> et{' '}
                      <code className="text-[10px] bg-slate-800 px-1 rounded">BOX_CLIENT_SECRET</code> dans le fichier <code className="text-[10px] bg-slate-800 px-1 rounded">.env</code>.
                    </p>
                  </div>
                  <Button onClick={handleConnect} className="w-full text-xs bg-blue-600 hover:bg-blue-500">
                    <Box className="h-4 w-4 mr-2" />
                    Connecter Box
                  </Button>
                  {error && (
                    <p className="text-[11px] text-red-400 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />{error}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            /* ─── Connected state ─── */
            <div className="space-y-4">
              {/* Connection info */}
              <Card className="border-blue-500/30 bg-blue-500/5">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Box className="h-4 w-4 text-blue-400" />
                      <CardTitle className="text-sm text-white">Connecté</CardTitle>
                      <Badge className="text-[10px] bg-blue-500/20 text-blue-300 border-blue-500/30">
                        Box
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="text-xs text-slate-400">
                    {status.displayName || status.email}
                    {status.lastSyncAt && (
                      <span className="ml-2">
                        Dernière sync : {new Date(status.lastSyncAt).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Upload zone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 hover:border-blue-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors group"
                  >
                    <Upload className="h-6 w-6 text-slate-500 group-hover:text-blue-400 mx-auto mb-2 transition-colors" />
                    <p className="text-xs text-slate-400 group-hover:text-slate-300">
                      Cliquez ou glissez un fichier pour l'uploader
                    </p>
                    <p className="text-[10px] text-slate-600 mt-1">
                      PDF, Word, Excel, images, ZIP…
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleUpload}
                      disabled={uploading}
                    />
                  </div>

                  {uploading && (
                    <div className="flex items-center gap-2 text-xs text-blue-400">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      {uploadProgress}
                    </div>
                  )}

                  {/* Actions row */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNewFolder(!showNewFolder)}
                      className="text-[11px] h-8 flex-1 border-slate-700 text-slate-300 hover:text-white"
                    >
                      <FolderPlus className="h-3.5 w-3.5 mr-1.5" />
                      Nouveau dossier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchFiles}
                      className="text-[11px] h-8 flex-1 border-slate-700 text-slate-300 hover:text-white"
                    >
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                      Actualiser
                    </Button>
                  </div>

                  {/* New folder input */}
                  {showNewFolder && (
                    <div className="flex gap-2">
                      <Input
                        value={newFolderName}
                        onChange={e => setNewFolderName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
                        placeholder="Nom du dossier"
                        className="flex-1 bg-slate-800 border-slate-700 text-xs h-8"
                        autoFocus
                      />
                      <Button size="sm" onClick={handleCreateFolder} className="text-xs h-8 bg-blue-600 hover:bg-blue-500">
                        Créer
                      </Button>
                    </div>
                  )}

                  {/* Disconnect */}
                  <div className="flex justify-end">
                    <Button
                      onClick={handleDisconnect}
                      variant="ghost"
                      size="sm"
                      className="text-[10px] text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Unplug className="h-3 w-3 mr-1" />Déconnecter
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Files list */}
              {files.length > 0 && (
                <Card className="border-slate-800 bg-slate-900/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs flex items-center gap-1.5">
                      <FolderOpen className="h-3.5 w-3.5 text-amber-500" />
                      Fichiers sur Box
                      <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-500 ml-auto">
                        {files.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 max-h-72 overflow-y-auto">
                      {files.map(f => (
                        <div
                          key={f.id}
                          className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-800/60 transition-colors group"
                        >
                          {f.type === 'folder' ? (
                            <FolderOpen className="h-4 w-4 text-amber-400 shrink-0" />
                          ) : (
                            <FileText className={cn('h-4 w-4 shrink-0', getFileIcon(f.name))} />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-200 truncate">{f.name}</p>
                            <p className="text-[10px] text-slate-500">
                              {f.type === 'folder' ? 'Dossier' : formatSize(f.size)}
                              {f.modified_at && ` · ${new Date(f.modified_at).toLocaleDateString('fr-FR')}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
                              onClick={() => handleDelete(f.id, f.name)}
                              disabled={deletingId === f.id}
                            >
                              {deletingId === f.id
                                ? <Loader2 className="h-3 w-3 animate-spin" />
                                : <Trash2 className="h-3 w-3" />}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {files.length === 0 && !uploading && (
                <div className="text-center py-6">
                  <FolderOpen className="h-8 w-8 text-slate-700 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Aucun fichier dans le dossier ThesisFrame</p>
                  <p className="text-[10px] text-slate-600 mt-1">Uploadez votre premier document ci-dessus</p>
                </div>
              )}

              {/* Success message */}
              {successMsg && (
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <p className="text-xs text-emerald-300">{successMsg}</p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-2.5 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </SheetContent>
    </Sheet>
  )
}
