'use client'

import { useState, useCallback, useRef } from 'react'
import {
  Shield, KeyRound, Lock, Loader2, CheckCircle2, XCircle, ExternalLink,
  Settings, Users, ChevronDown, ChevronUp, Trash2, RefreshCw, Plus, Eye, EyeOff,
  Send, Mail, Zap, ToggleLeft, ToggleRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { PROVIDER_META, DEFAULT_WARRANT_POLICIES } from '@/lib/auth-providers/types'
import type { AuthProviderName, AuthProviderConfig, AuthAccountInfo, WarrantPolicy } from '@/lib/auth-providers/types'

// ─── Types ──────────────────────────────────────────────

interface ProviderConfigForm {
  clientId: string
  clientSecret: string
  domain: string
  enabled: boolean
  extraConfig: string
}

const PROVIDER_ICONS: Record<AuthProviderName, typeof Shield> = {
  auth0: Shield,
  stytch: KeyRound,
  warrant: Lock,
}

const INITIAL_FORM: ProviderConfigForm = {
  clientId: '',
  clientSecret: '',
  domain: '',
  enabled: false,
  extraConfig: '',
}

// ─── Component ─────────────────────────────────────────

export default function AuthProviderPanel() {
  const [providers, setProviders] = useState<AuthProviderConfig[]>([])
  const [accounts, setAccounts] = useState<AuthAccountInfo[]>([])
  const [policies, setPolicies] = useState<WarrantPolicy[]>([])
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState<string | null>(null)
  const [expandedProvider, setExpandedProvider] = useState<AuthProviderName | null>(null)
  const [activeTab, setActiveTab] = useState('providers')

  // OTP/Magic Link state
  const [stytchEmail, setStytchEmail] = useState('')
  const [stytchMethodId, setStytchMethodId] = useState('')
  const [stytchOtpCode, setStytchOtpCode] = useState('')
  const [stytchLoading, setStytchLoading] = useState(false)
  const [stytchStep, setStytchStep] = useState<'email' | 'otp'>('email')

  // Policy edit state
  const [editPolicy, setEditPolicy] = useState<Partial<WarrantPolicy> | null>(null)
  const [policyDialogOpen, setPolicyDialogOpen] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [provRes, accRes, polRes] = await Promise.all([
        fetch('/api/auth/providers'),
        fetch('/api/auth/providers/accounts'),
        fetch('/api/auth/warrant/policies'),
      ])
      const provData = await provRes.json()
      const accData = await accRes.json()
      const polData = await polRes.json()
      setProviders(provData || [])
      setAccounts(accData || [])
      setPolicies(polData || [])
    } catch (err) {
      console.error('Failed to load auth data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load data on mount
  const loaded = useRef<boolean | null>(null)
  if (loaded.current === null) {
    loaded.current = false
    loadData()
  }

  const handleTestConnection = async (provider: AuthProviderName) => {
    setTesting(provider)
    try {
      const res = await fetch('/api/auth/providers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      })
      const data = await res.json()
      if (data.success) {
        await loadData() // refresh status
      }
      return data
    } finally {
      setTesting(null)
    }
  }

  const handleSaveConfig = async (provider: AuthProviderName, form: ProviderConfigForm) => {
    const res = await fetch('/api/auth/providers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, ...form }),
    })
    const data = await res.json()
    if (res.ok) await loadData()
    return data
  }

  const handleDeleteProvider = async (provider: AuthProviderName) => {
    if (!confirm(`Supprimer la configuration ${PROVIDER_META[provider].name} ?`)) return
    const res = await fetch('/api/auth/providers', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider }),
    })
    if (res.ok) await loadData()
  }

  const handleStytchSendOtp = async () => {
    if (!stytchEmail) return
    setStytchLoading(true)
    try {
      const res = await fetch('/api/auth/stytch/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: stytchEmail }),
      })
      const data = await res.json()
      if (data.success && data.messageId) {
        setStytchMethodId(data.messageId)
        setStytchStep('otp')
      } else {
        alert(data.error || 'Erreur lors de l\'envoi de l\'OTP')
      }
    } finally {
      setStytchLoading(false)
    }
  }

  const handleStytchVerifyOtp = async () => {
    setStytchLoading(true)
    try {
      const res = await fetch('/api/auth/stytch/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ methodId: stytchMethodId, code: stytchOtpCode }),
      })
      const data = await res.json()
      if (data.success) {
        setStytchStep('email')
        setStytchEmail('')
        setStytchOtpCode('')
        setStytchMethodId('')
        await loadData()
      } else {
        alert(data.error || 'Code invalide')
      }
    } finally {
      setStytchLoading(false)
    }
  }

  const handleStytchSendMagicLink = async () => {
    if (!stytchEmail) return
    setStytchLoading(true)
    try {
      const res = await fetch('/api/auth/stytch/send-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: stytchEmail }),
      })
      const data = await res.json()
      if (data.success) {
        alert('Lien magique envoyé ! Vérifiez votre boîte mail.')
        setStytchEmail('')
      } else {
        alert(data.error || 'Erreur lors de l\'envoi')
      }
    } finally {
      setStytchLoading(false)
    }
  }

  const handleAuth0Login = async () => {
    try {
      const res = await fetch('/api/auth/auth0/authorize')
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Auth0 non configuré')
      }
    } catch {
      alert('Erreur de connexion Auth0')
    }
  }

  const handleSavePolicy = async () => {
    if (!editPolicy?.policyKey || !editPolicy?.policyType) return
    try {
      const res = await fetch('/api/auth/warrant/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policyType: editPolicy.policyType,
          policyKey: editPolicy.policyKey,
          licenseTypes: editPolicy.licenseTypes || [],
          description: editPolicy.description,
        }),
      })
      if (res.ok) {
        setPolicyDialogOpen(false)
        setEditPolicy(null)
        await loadData()
      }
    } catch {
      alert('Erreur de sauvegarde')
    }
  }

  const handleDeletePolicy = async (policyId: string) => {
    if (!confirm('Supprimer cette politique ?')) return
    const res = await fetch('/api/auth/warrant/policies', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ policyId }),
    })
    if (res.ok) await loadData()
  }

  const handleSyncPolicies = async () => {
    const res = await fetch('/api/auth/warrant/policies', { method: 'PUT' })
    const data = await res.json()
    alert(`Synchronisation : ${data.synced} synchronisées, ${data.errors} erreurs`)
  }

  const handleResetDefaults = async () => {
    if (!confirm('Réinitialiser les politiques par défaut ? Les personnalisations seront perdues.')) return
    const res = await fetch('/api/auth/providers', { method: 'GET' }) // triggers seed
    await loadData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="providers" className="flex-1">
            <Settings className="h-4 w-4 mr-1.5" />
            Fournisseurs
          </TabsTrigger>
          <TabsTrigger value="login" className="flex-1">
            <Users className="h-4 w-4 mr-1.5" />
            Connexion
          </TabsTrigger>
          <TabsTrigger value="policies" className="flex-1">
            <Lock className="h-4 w-4 mr-1.5" />
            Politiques
          </TabsTrigger>
        </TabsList>

        {/* ═══ PROVIDERS TAB ═══ */}
        <TabsContent value="providers" className="space-y-3 mt-4">
          {(Object.keys(PROVIDER_META) as AuthProviderName[]).map((pName) => {
            const meta = PROVIDER_META[pName]
            const Icon = PROVIDER_ICONS[pName]
            const config = providers.find((p) => p.provider === pName)
            const isExpanded = expandedProvider === pName

            return (
              <Card key={pName} className={!config?.enabled ? 'opacity-75' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-muted ${meta.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {meta.name}
                          {config?.connected && <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5">Connecté</Badge>}
                          {config?.enabled && !config?.connected && <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-[10px] px-1.5">Non testé</Badge>}
                        </CardTitle>
                        <CardDescription className="text-xs mt-0.5">{meta.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedProvider(isExpanded ? null : pName)}
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    <ProviderConfigForm
                      provider={pName}
                      initialConfig={config}
                      onSave={handleSaveConfig}
                      onTest={handleTestConnection}
                      onDelete={handleDeleteProvider}
                      testing={testing === pName}
                    />
                  </CardContent>
                )}
              </Card>
            )
          })}
        </TabsContent>

        {/* ═══ LOGIN TAB ═══ */}
        <TabsContent value="login" className="space-y-4 mt-4">
          {/* Connected accounts */}
          {accounts.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Comptes connectés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {accounts.map((acc) => {
                    const Icon = PROVIDER_ICONS[acc.provider]
                    return (
                      <div key={acc.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          {acc.avatarUrl ? (
                            <img src={acc.avatarUrl} alt={acc.name || ''} className="h-8 w-8 rounded-full object-cover" />
                          ) : (
                            <Icon className={`h-4 w-4 ${PROVIDER_META[acc.provider].color}`} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{acc.name || acc.email || 'Inconnu'}</p>
                          <p className="text-xs text-muted-foreground truncate">{acc.email} · {PROVIDER_META[acc.provider].name}</p>
                        </div>
                        {acc.lastLoginAt && (
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {new Date(acc.lastLoginAt).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Auth0 OAuth Login */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-600" />
                <CardTitle className="text-sm">Connexion Auth0 (OAuth)</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Google, GitHub, SSO universitaire via Auth0
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleAuth0Login}
                disabled={!providers.find((p) => p.provider === 'auth0' && p.enabled && p.connected)}
                className="w-full"
              >
                <Shield className="h-4 w-4 mr-2" />
                Se connecter avec Auth0
              </Button>
            </CardContent>
          </Card>

          {/* Stytch Passwordless */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-violet-600" />
                <CardTitle className="text-sm">Connexion sans mot de passe (Stytch)</CardTitle>
              </div>
              <CardDescription className="text-xs">
                OTP par email ou lien magique
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {stytchStep === 'email' ? (
                <>
                  <Input
                    type="email"
                    placeholder="votre@email.fr"
                    value={stytchEmail}
                    onChange={(e) => setStytchEmail(e.target.value)}
                    disabled={stytchLoading}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={handleStytchSendOtp}
                      disabled={stytchLoading || !stytchEmail || !providers.find((p) => p.provider === 'stytch' && p.enabled && p.connected)}
                    >
                      {stytchLoading ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Send className="h-4 w-4 mr-1.5" />}
                      Envoyer OTP
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleStytchSendMagicLink}
                      disabled={stytchLoading || !stytchEmail || !providers.find((p) => p.provider === 'stytch' && p.enabled && p.connected)}
                    >
                      {stytchLoading ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Mail className="h-4 w-4 mr-1.5" />}
                      Lien magique
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>Code envoyé à {stytchEmail}</span>
                    <Button variant="link" className="h-auto p-0 text-xs ml-auto" onClick={() => { setStytchStep('email'); setStytchMethodId(''); setStytchOtpCode('') }}>
                      Changer
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="000000"
                      value={stytchOtpCode}
                      onChange={(e) => setStytchOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      className="font-mono text-center text-lg tracking-widest"
                      disabled={stytchLoading}
                      autoFocus
                    />
                    <Button onClick={handleStytchVerifyOtp} disabled={stytchLoading || stytchOtpCode.length < 6}>
                      {stytchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ POLICIES TAB ═══ */}
        <TabsContent value="policies" className="space-y-3 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Politiques d\'autorisation</p>
              <p className="text-xs text-muted-foreground">Contrôle d\'accès par type de licence ({policies.length} politiques)</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSyncPolicies}>
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                Sync API
              </Button>
              <Button variant="outline" size="sm" onClick={handleResetDefaults}>
                <Zap className="h-3.5 w-3.5 mr-1" />
                Reset
              </Button>
              <Dialog open={policyDialogOpen} onOpenChange={setPolicyDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={() => setEditPolicy({ policyType: 'feature_gate', policyKey: '', licenseTypes: [], description: '' })}>
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Ajouter
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nouvelle politique</DialogTitle>
                    <DialogDescription>Définir les accès par type de licence</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium">Type</label>
                        <Select value={editPolicy?.policyType || 'feature_gate'} onValueChange={(v) => setEditPolicy((prev) => ({ ...prev, policyType: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="feature_gate">Feature Gate</SelectItem>
                            <SelectItem value="role">Rôle</SelectItem>
                            <SelectItem value="resource_access">Accès ressource</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium">Clé</label>
                        <Input
                          placeholder="ai_writing, export_pdf..."
                          value={editPolicy?.policyKey || ''}
                          onChange={(e) => setEditPolicy((prev) => ({ ...prev, policyKey: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium">Types de licence autorisés</label>
                      <div className="flex flex-wrap gap-2">
                        {['trial', 'academic', 'standard', 'premium'].map((lt) => {
                          const selected = editPolicy?.licenseTypes?.includes(lt)
                          return (
                            <Badge
                              key={lt}
                              variant={selected ? 'default' : 'outline'}
                              className="cursor-pointer"
                              onClick={() => {
                                const current = editPolicy?.licenseTypes || []
                                setEditPolicy((prev) => ({
                                  ...prev,
                                  licenseTypes: selected
                                    ? current.filter((t) => t !== lt)
                                    : [...current, lt],
                                }))
                              }}
                            >
                              {lt}
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium">Description</label>
                      <Input
                        placeholder="Description de la politique"
                        value={editPolicy?.description || ''}
                        onChange={(e) => setEditPolicy((prev) => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setPolicyDialogOpen(false)}>Annuler</Button>
                    <Button onClick={handleSavePolicy} disabled={!editPolicy?.policyKey}>Enregistrer</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <ScrollArea className="max-h-[420px]">
            <div className="space-y-2 pr-2">
              {policies.map((pol) => (
                <div key={pol.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30">
                  <Badge variant="outline" className="text-[10px] shrink-0">{pol.policyType}</Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono font-medium truncate">{pol.policyKey}</p>
                    <p className="text-xs text-muted-foreground truncate">{pol.description || '—'}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {pol.licenseTypes.map((lt) => (
                      <Badge key={lt} variant="secondary" className="text-[10px]">
                        {lt === 'trial' ? 'Essai' : lt === 'academic' ? 'Acad.' : lt === 'premium' ? 'Prem.' : 'Std.'}
                      </Badge>
                    ))}
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => handleDeletePolicy(pol.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ─── Provider Config Sub-form ──────────────────────────────

function ProviderConfigForm({
  provider,
  initialConfig,
  onSave,
  onTest,
  onDelete,
  testing,
}: {
  provider: AuthProviderName
  initialConfig?: AuthProviderConfig
  onSave: (provider: AuthProviderName, form: ProviderConfigForm) => Promise<unknown>
  onTest: (provider: AuthProviderName) => Promise<{ success: boolean; error?: string }>
  onDelete: (provider: AuthProviderName) => void
  testing: boolean
}) {
  const meta = PROVIDER_META[provider]
  const [form, setForm] = useState<ProviderConfigForm>({
    clientId: initialConfig?.clientId || '',
    clientSecret: initialConfig?.clientSecret || '',
    domain: initialConfig?.domain || '',
    enabled: initialConfig?.enabled || false,
    extraConfig: initialConfig?.extraConfig || '',
  })
  const [saving, setSaving] = useState(false)
  const [showSecret, setShowSecret] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(provider, form)
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    await onSave(provider, form)
    const result = await onTest(provider)
    if (!result.success) {
      alert(`Échec : ${result.error}`)
    }
  }

  return (
    <div className="space-y-3">
      {meta.configFields.map((field) => (
        <div key={field.key} className="space-y-1">
          <label className="text-xs font-medium flex items-center gap-1.5">
            {field.label}
            {field.required && <span className="text-destructive">*</span>}
          </label>
          <div className="relative">
            <Input
              type={field.type === 'password' ? (showSecret ? 'text' : 'password') : 'text'}
              placeholder={field.placeholder}
              value={String(form[field.key as keyof ProviderConfigForm] ?? '')}
              onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
            />
            {field.type === 'password' && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setShowSecret(!showSecret)}
              >
                {showSecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </Button>
            )}
          </div>
        </div>
      ))}

      {/* Enable toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {form.enabled ? <ToggleRight className="h-5 w-5 text-primary" /> : <ToggleLeft className="h-5 w-5 text-muted-foreground" />}
          <span className="text-sm">Activer</span>
        </div>
        <Switch
          checked={form.enabled}
          onCheckedChange={(checked) => setForm((prev) => ({ ...prev, enabled: checked }))}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={saving} size="sm" className="flex-1">
          {saving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />}
          Enregistrer
        </Button>
        <Button onClick={handleTest} disabled={testing || saving} variant="outline" size="sm">
          {testing ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Zap className="h-3.5 w-3.5 mr-1.5" />}
          Tester
        </Button>
        <Button onClick={() => onDelete(provider)} variant="ghost" size="icon" className="h-9 w-9 text-destructive">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
        <a href={meta.docsUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </a>
      </div>
    </div>
  )
}