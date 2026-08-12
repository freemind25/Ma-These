'use client'

import { useState, useCallback, useRef } from 'react'
import { KeyRound, Plus, Trash2, RefreshCw, Ban, Copy, Check, Loader2, Shield, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Activation {
  id: string
  deviceName: string | null
  activatedAt: string
  lastSeenAt: string
}

interface LicenseKeyEntry {
  id: string
  keyPrefix: string
  licenseType: string
  licenseTypeLabel: string
  status: string
  maxActivations: number
  currentActivations: number
  note: string | null
  createdAt: string
  expiresAt: string | null
  activations: Activation[]
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-800',
  revoked: 'bg-red-100 text-red-800',
  expired: 'bg-amber-100 text-amber-800',
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  revoked: 'Révoquée',
  expired: 'Expirée',
}

const TYPE_COLORS: Record<string, string> = {
  trial: 'bg-orange-100 text-orange-800',
  academic: 'bg-blue-100 text-blue-800',
  standard: 'bg-green-100 text-green-800',
  premium: 'bg-amber-100 text-amber-800',
}

/** Read response body as text, with fallback for consumed streams */
async function safeReadBody(res: Response): Promise<string> {
  try {
    return await res.text()
  } catch {
    return '(corps de réponse indisponible)'
  }
}

/** Fetch with retry on 500 errors (route compilation timeout in dev mode) */
async function fetchWithRetry(url: string, retries = 2, delay = 1500): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url)
    if (res.status !== 500 || attempt === retries) return res
    // Wait and retry — Next.js dev mode may need time to compile the route
    await new Promise((r) => setTimeout(r, delay * (attempt + 1)))
  }
  // Unreachable, but TypeScript needs it
  return await fetch(url)
}

export default function LicenseAdminPanel() {
  const [adminSecret, setAdminSecret] = useState(() => localStorage.getItem('tf_admin_secret') || '')
  const [authenticated, setAuthenticated] = useState(false)
  const [keys, setKeys] = useState<LicenseKeyEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const retryCountRef = useRef(0)

  // Generate dialog state
  const [genType, setGenType] = useState('standard')
  const [genCount, setGenCount] = useState(1)
  const [genLoading, setGenLoading] = useState(false)
  const [genResult, setGenResult] = useState<string[]>([])
  const [genDialogOpen, setGenDialogOpen] = useState(false)

  const fetchKeys = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const url = `/api/admin/${encodeURIComponent(adminSecret)}/keys`
      const res = await fetchWithRetry(url)
      const text = await safeReadBody(res)

      // Try to parse JSON from the text we already read
      let data: Record<string, unknown>
      try {
        data = JSON.parse(text)
      } catch {
        setError(`Réponse invalide (HTTP ${res.status}) : ${text.slice(0, 300)}`)
        setAuthenticated(false)
        return
      }

      if (data.success) {
        setKeys(data.keys as LicenseKeyEntry[])
        setAuthenticated(true)
        localStorage.setItem('tf_admin_secret', adminSecret)
      } else {
        const parts = [data.error || 'Erreur']
        if (data.debug) parts.push(`[${data.debug}]`)
        parts.push(`(HTTP ${res.status})`)
        setError(parts.join(' '))
        setAuthenticated(false)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(`Connexion échouée : ${msg}`)
      setAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }, [adminSecret])

  const handleAuth = () => {
    if (adminSecret.trim()) fetchKeys()
  }

  const handleGenerate = async () => {
    setGenLoading(true)
    setGenResult([])
    try {
      const res = await fetchWithRetry(
        `/api/admin/${encodeURIComponent(adminSecret)}/generate?type=${genType}&count=${genCount}`
      )
      const text = await safeReadBody(res)
      let data: Record<string, unknown>
      try {
        data = JSON.parse(text)
      } catch {
        setError(`Réponse invalide (HTTP ${res.status}) : ${text.slice(0, 300)}`)
        return
      }
      if (data.success) {
        setGenResult(data.keys as string[])
        fetchKeys()
      } else {
        setError(String(data.error || 'Erreur'))
      }
    } catch {
      setError('Erreur de connexion')
    } finally {
      setGenLoading(false)
    }
  }

  const handleAction = async (keyId: string, action: string) => {
    try {
      const actionParam = action === 'reset-activations' ? 'reset' : action
      const res = await fetchWithRetry(
        `/api/admin/${encodeURIComponent(adminSecret)}/${actionParam}/${keyId}`
      )
      const text = await safeReadBody(res)
      let data: Record<string, unknown>
      try {
        data = JSON.parse(text)
      } catch {
        setError(`Réponse invalide (HTTP ${res.status}) : ${text.slice(0, 300)}`)
        return
      }
      if (data.success) fetchKeys()
      else setError(String(data.error || 'Erreur'))
    } catch {
      setError('Erreur')
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Auth Gate
  if (!authenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" />
            Administration des licences
          </CardTitle>
          <CardDescription>Entrez le secret administrateur pour accéder au panneau de gestion.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="Secret administrateur"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
            />
            <Button onClick={handleAuth} disabled={!adminSecret.trim() || loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Accéder'}
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            Licences ({keys.length})
          </h3>
          <p className="text-xs text-muted-foreground">Gérez les clés de licence de ThesisFrame</p>
        </div>
        <Dialog open={genDialogOpen} onOpenChange={setGenDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Générer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Générer des clés de licence</DialogTitle>
              <DialogDescription>Créez de nouvelles clés de licence pour distribution.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type de licence</label>
                <Select value={genType} onValueChange={setGenType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trial">Essai (7 jours, 1 appareil)</SelectItem>
                    <SelectItem value="academic">Académique (1 an, 2 appareils)</SelectItem>
                    <SelectItem value="standard">Standard (illimité, 3 appareils)</SelectItem>
                    <SelectItem value="premium">Premium (illimité, 5 appareils)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre de clés</label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={genCount}
                  onChange={(e) => setGenCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                />
              </div>
              {genResult.length > 0 && (
                <Alert>
                  <AlertDescription className="space-y-1">
                    <p className="font-medium text-sm">{genResult.length} clé(s) générée(s) :</p>
                    {genResult.map((k, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-0.5 rounded flex-1 font-mono">{k}</code>
                        <button
                          onClick={() => copyToClipboard(k, `gen-${i}`)}
                          className="shrink-0 text-muted-foreground hover:text-foreground"
                        >
                          {copiedId === `gen-${i}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    ))}
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setGenDialogOpen(false)}>Fermer</Button>
              <Button onClick={handleGenerate} disabled={genLoading}>
                {genLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Génération...</> : 'Générer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {keys.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Aucune licence créée.</p>
        )}
        {keys.map((key) => (
          <Card key={key.id} className="text-sm">
            <div
              className="flex items-center gap-3 p-3 cursor-pointer"
              onClick={() => setExpandedId(expandedId === key.id ? null : key.id)}
            >
              <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{key.keyPrefix}…</code>
              <Badge variant="secondary" className={TYPE_COLORS[key.licenseType] || ''}>
                {key.licenseTypeLabel}
              </Badge>
              <Badge variant="secondary" className={STATUS_COLORS[key.status] || ''}>
                {STATUS_LABELS[key.status] || key.status}
              </Badge>
              <span className="text-xs text-muted-foreground ml-auto">
                {key.currentActivations}/{key.maxActivations}
              </span>
              {expandedId === key.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </div>
            {expandedId === key.id && (
              <div className="border-t px-3 py-2 space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-muted-foreground">Créée le :</span> {new Date(key.createdAt).toLocaleDateString('fr-FR')}</div>
                  <div><span className="text-muted-foreground">Expire le :</span> {key.expiresAt ? new Date(key.expiresAt).toLocaleDateString('fr-FR') : 'Jamais'}</div>
                  {key.note && <div className="col-span-2"><span className="text-muted-foreground">Note :</span> {key.note}</div>}
                </div>
                {key.activations.length > 0 && (
                  <div className="space-y-1 mt-2">
                    <p className="font-medium">Appareils activés :</p>
                    {key.activations.map((a) => (
                      <div key={a.id} className="flex items-center justify-between bg-muted/50 rounded px-2 py-1">
                        <span>{a.deviceName || 'Inconnu'}</span>
                        <span className="text-muted-foreground">Dernière activité : {new Date(a.lastSeenAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  {key.status === 'active' && (
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={(e) => { e.stopPropagation(); handleAction(key.id, 'revoke') }}>
                      <Ban className="h-3 w-3" /> Révoquer
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={(e) => { e.stopPropagation(); handleAction(key.id, 'reset-activations') }}>
                    <RefreshCw className="h-3 w-3" /> Réinitialiser
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1 text-destructive" onClick={(e) => { e.stopPropagation(); handleAction(key.id, 'delete') }}>
                    <Trash2 className="h-3 w-3" /> Supprimer
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
