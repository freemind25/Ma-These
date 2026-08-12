'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Wifi,
  WifiOff,
  Send,
  Zap,
  Crown,
  Sparkles,
  Eye,
  Code2,
  MessageSquare,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────

interface RoutesMeModel {
  id: string
  object: string
  created: number
  owned_by: string
}

const LS_KEY = 'routesme_api_key'
const LS_PLAN = 'routesme_plan'

// ─── Model type badge helpers ────────────────────────────────────

function getModelType(modelId: string): { label: string; icon: React.ReactNode; variant: 'default' | 'secondary' | 'outline' } {
  const id = modelId.toLowerCase()
  if (id.includes('diffusion') || id.includes('image')) {
    return { label: 'Image', icon: <Eye className="h-3 w-3" />, variant: 'secondary' }
  }
  if (id.includes('multimodal') || id.includes('vision') || id.includes('robotics') || id.includes('minimax-m3')) {
    return { label: 'Multimodal', icon: <Eye className="h-3 w-3" />, variant: 'outline' }
  }
  if (id.includes('coder')) {
    return { label: 'Code', icon: <Code2 className="h-3 w-3" />, variant: 'default' }
  }
  return { label: 'Chat', icon: <MessageSquare className="h-3 w-3" />, variant: 'default' }
}

function isFreeModel(modelId: string): boolean {
  const id = modelId.toLowerCase()
  return id.includes('glm5.2r') || id.includes('kimi-k3')
}

/** Send API key as header so the backend works on serverless (Vercel) */
function authHeaders(apiKey: string): Record<string, string> {
  return { 'X-RoutesMe-Key': apiKey }
}

// ─── Component ──────────────────────────────────────────────────

export default function RoutesMePanel() {
  const [apiKey, setApiKey] = useState('')
  const [plan, setPlan] = useState<'free' | 'vip'>('free')
  const [status, setStatus] = useState<'idle' | 'testing' | 'connected' | 'error'>('idle')
  const [statusMsg, setStatusMsg] = useState('')
  const [models, setModels] = useState<RoutesMeModel[]>([])
  const [loadingModels, setLoadingModels] = useState(false)
  const [selectedModel, setSelectedModel] = useState('GLM5.2R')
  const [chatInput, setChatInput] = useState('')
  const [chatResponse, setChatResponse] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [isConfigured, setIsConfigured] = useState(false)
  const initialized = useRef(false)

  const loadModels = useCallback(async (key: string) => {
    setLoadingModels(true)
    try {
      const res = await fetch('/api/routesme/models', {
        headers: { ...authHeaders(key) },
      })
      const data = await res.json()
      if (data.models) {
        setModels(data.models)
        const freeModel = data.models.find((m: RoutesMeModel) => isFreeModel(m.id))
        if (freeModel) setSelectedModel(freeModel.id)
        else if (data.models.length > 0) setSelectedModel(data.models[0].id)
      }
    } catch {
      // ignore
    }
    setLoadingModels(false)
  }, [])

  // Restore from localStorage on mount
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    const savedKey = localStorage.getItem(LS_KEY)
    const savedPlan = localStorage.getItem(LS_PLAN) as 'free' | 'vip' | null
    if (savedKey) {
      setApiKey(savedKey)
      setPlan(savedPlan || 'free')
      setIsConfigured(true)
      // Auto-load models if key exists
      loadModels(savedKey)
    }
  }, [loadModels]) // eslint-disable-line react-hooks/exhaustive-deps

  const testConnection = useCallback(async () => {
    if (!apiKey) return
    setStatus('testing')
    setStatusMsg('')
    try {
      const res = await fetch('/api/routesme/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, plan }),
      })
      const data = await res.json()
      if (data.success) {
        setStatus('connected')
        setStatusMsg(`${data.modelCount} modèles disponibles (plan ${data.plan})`)
        setIsConfigured(true)
        // Persist in localStorage
        localStorage.setItem(LS_KEY, apiKey)
        localStorage.setItem(LS_PLAN, plan)
        loadModels(apiKey)
      } else {
        setStatus('error')
        setStatusMsg(data.error || 'Connexion échouée')
      }
    } catch {
      setStatus('error')
      setStatusMsg('Erreur réseau')
    }
  }, [apiKey, plan, loadModels])

  const sendChat = useCallback(async () => {
    if (!chatInput.trim() || !apiKey) return
    setChatLoading(true)
    setChatResponse('⏳ Génération en cours (le modèle peut être lent au premier appel)...')
    try {
      const res = await fetch('/api/routesme/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders(apiKey) },
        body: JSON.stringify({
          model: selectedModel,
          plan,
          messages: [
            { role: 'system', content: 'Tu es un assistant académique expert en rédaction de thèse. Réponds en français.' },
            { role: 'user', content: chatInput },
          ],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      })
      const data = await res.json()
      if (data.error) {
        setChatResponse(`❌ ${data.error}`)
      } else {
        setChatResponse(data.content)
      }
    } catch {
      setChatResponse('❌ Erreur réseau ou timeout. Vérifiez votre connexion et réessayez.')
    }
    setChatLoading(false)
  }, [chatInput, selectedModel, apiKey, plan])

  return (
    <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
          <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">RoutesMe</h3>
          <p className="text-xs text-muted-foreground">API multi-modèles OpenAI-compatible</p>
        </div>
        {isConfigured ? (
          <Badge variant="outline" className="ml-auto text-emerald-600 border-emerald-300">
            <Wifi className="h-3 w-3 mr-1" /> Connecté
          </Badge>
        ) : (
          <Badge variant="outline" className="ml-auto text-muted-foreground">
            <WifiOff className="h-3 w-3 mr-1" /> Non configuré
          </Badge>
        )}
      </div>

      {/* Config Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Configuration</CardTitle>
          <CardDescription className="text-xs">
            Collez votre clé API depuis{' '}
            <a href="https://routesme.online" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline">
              routesme.online/dashboard
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="rm-xxxxxxxxxxxxxxxx"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              type="password"
              className="font-mono text-sm"
            />
            <Select value={plan} onValueChange={v => setPlan(v as 'free' | 'vip')}>
              <SelectTrigger className="w-28">
                {plan === 'vip' ? <Crown className="h-3.5 w-3.5 mr-1 text-amber-500" /> : <Zap className="h-3.5 w-3.5 mr-1 text-emerald-500" />}
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">
                  <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-emerald-500" /> Gratuit</span>
                </SelectItem>
                <SelectItem value="vip">
                  <span className="flex items-center gap-1"><Crown className="h-3 w-3 text-amber-500" /> VIP</span>
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={testConnection}
              disabled={!apiKey || status === 'testing'}
              size="sm"
              variant="outline"
            >
              {status === 'testing' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Tester'}
            </Button>
          </div>

          {status === 'connected' && (
            <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-950/30 p-2 rounded">
              <XCircle className="h-4 w-4 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          {plan === 'free' && (
            <p className="text-xs text-muted-foreground">
              🆓 Gratuit : 20 req/min · 200K tokens/jour · GLM-5.2R + Kimi-k3 gratuits
            </p>
          )}
          {plan === 'vip' && (
            <p className="text-xs text-muted-foreground">
              👑 VIP ($20/mois) : 100 req/min · 5M tokens/jour · Tous les modèles + endpoint dédié
            </p>
          )}
        </CardContent>
      </Card>

      {/* Models List */}
      {models.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Modèles disponibles ({models.length})</CardTitle>
              {loadingModels && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-1.5">
              {models.map(m => {
                const typeInfo = getModelType(m.id)
                const isFree = isFreeModel(m.id)
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    className={`flex items-center gap-2 p-2 rounded-md text-left text-xs transition-colors ${
                      selectedModel === m.id
                        ? 'bg-emerald-100 dark:bg-emerald-950/40 ring-1 ring-emerald-300'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {typeInfo.icon}
                    <span className="font-mono flex-1 truncate">{m.id}</span>
                    <Badge variant={typeInfo.variant} className="text-[10px] px-1.5 py-0">
                      {typeInfo.label}
                    </Badge>
                    {isFree && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        GRATUIT
                      </Badge>
                    )}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Test Chat */}
      {isConfigured && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              Test rapide
            </CardTitle>
            <CardDescription className="text-xs">
              Modèle sélectionné : <code className="font-mono font-semibold">{selectedModel}</code>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="Posez une question pour tester le modèle..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              rows={3}
              className="text-sm resize-none"
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendChat()
                }
              }}
            />
            <Button
              onClick={sendChat}
              disabled={!chatInput.trim() || chatLoading}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {chatLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
              Envoyer
            </Button>
            {chatResponse && (
              <div className="p-3 rounded-md bg-muted text-sm whitespace-pre-wrap max-h-60 overflow-y-auto">
                {chatResponse}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
