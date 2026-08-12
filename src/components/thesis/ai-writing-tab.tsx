'use client'

import { createElement, useState, useCallback } from 'react'
import {
  Sparkles,
  PenTool,
  BookOpenText,
  ScanSearch,
  Languages,
  ScrollText,
  Lightbulb,
  Loader2,
  RotateCcw,
  Send,
  CheckCircle2,
  Copy,
  AlertTriangle,
  ClipboardList,
  Layout,
  Type,
  BookOpen,
  FlaskConical,
  BarChart3,
  MessageSquare,
  GraduationCap,
  FileText,
  Settings2,
  Target,
  Mic,
  Presentation,
  Network,
  Eye,
  EyeOff,
  Key,
  Server,
  FileCheck,
  BookA,
  LineChart,
  BadgeCheck,
  type LucideIcon,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// ─── Icon map ─────────────────────────────────────────────────────
const iconMap: Record<string, LucideIcon> = {
  ClipboardList, Layout, Type, BookOpen, FlaskConical, BarChart3,
  MessageSquare, CheckCircle2, PenTool, FileText, GraduationCap,
  BookOpenText, ScanSearch, Languages, ScrollText, Lightbulb,
  Sparkles, Loader2, RotateCcw, Target, Mic, Presentation, Network,
  Settings2, Key, Server, Eye, EyeOff, FileCheck,
  BookA, LineChart, BadgeCheck,
}

// ─── AI Providers ─────────────────────────────────────────────────
const AI_PROVIDERS = [
  { id: 'z-ai', label: 'Z-AI (plateforme)', description: 'SDK interne — configuré automatiquement', icon: 'Sparkles', color: 'emerald' },
  { id: 'mistral', label: 'Mistral AI', description: 'mistral-large, mistral-medium, mistral-small...', icon: 'Server', color: 'orange' },
  { id: 'openai', label: 'OpenAI', description: 'GPT-4o, GPT-4o-mini, GPT-4-turbo...', icon: 'Network', color: 'sky' },
  { id: 'custom', label: 'Personnalisé (OpenAI-compatible)', description: "N'importe quel endpoint compatible OpenAI", icon: 'Settings2', color: 'violet' },
] as const

type ProviderId = 'z-ai' | 'mistral' | 'openai' | 'custom'

const PROVIDER_MODELS: Record<ProviderId, { value: string; label: string }[]> = {
  'z-ai': [{ value: 'default', label: 'Modèle par défaut du SDK' }],
  'mistral': [
    { value: 'mistral-large-latest', label: 'Mistral Large (recommandé)' },
    { value: 'mistral-medium-latest', label: 'Mistral Medium' },
    { value: 'mistral-small-latest', label: 'Mistral Small' },
    { value: 'open-mistral-nemo', label: 'Mistral Nemo (gratuit)' },
    { value: 'codestral-latest', label: 'Codestral' },
  ],
  'openai': [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'o3-mini', label: 'o3-mini' },
    { value: 'o4-mini', label: 'o4-mini' },
  ],
  'custom': [{ value: '__custom__', label: 'Modèle personnalisé' }],
}

const PROVIDER_BASE_URLS: Record<ProviderId, string> = {
  'z-ai': '',
  'mistral': 'https://api.mistral.ai/v1',
  'openai': 'https://api.openai.com/v1',
  'custom': '',
}

interface ProviderConfig {
  provider: ProviderId
  apiKey: string
  model: string
  customBaseUrl: string
  customModel: string
}

const STORAGE_KEY = 'thesisframe-ai-provider'

function loadProviderConfig(): ProviderConfig {
  if (typeof window === 'undefined') return { provider: 'z-ai', apiKey: '', model: 'default', customBaseUrl: '', customModel: '' }
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch { /* ignore */ }
  return { provider: 'z-ai', apiKey: '', model: 'default', customBaseUrl: '', customModel: '' }
}

function saveProviderConfig(cfg: ProviderConfig) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg))
  }
}

// ─── AI Writing Modes ────────────────────────────────────────────
const WRITING_MODES = [
  { id: 'scientific-writing', label: 'Rédaction scientifique', description: 'Rédiger ou améliorer une section de thèse selon les normes IMRaD', icon: 'PenTool', color: 'emerald' },
  { id: 'literature-review', label: 'Revue de littérature', description: 'Synthétiser des travaux, identifier les lacunes et structurer une revue', icon: 'BookOpenText', color: 'sky' },
  { id: 'systematic-review', label: 'Revue systématique & MA', description: 'Planifier et rédiger une SLR/méta-analyse conforme PRISMA 2020', icon: 'FileCheck', color: 'lime' },
  { id: 'peer-review', label: 'Relecture critique', description: 'Évaluer la rigueur, la clarté et la cohérence de votre texte', icon: 'ScanSearch', color: 'amber' },
  { id: 'paraphrase', label: 'Paraphrase & Amélioration', description: 'Reformuler, enrichir le vocabulaire et corriger le style', icon: 'Languages', color: 'violet' },
  { id: 'abstract', label: 'Résumé & Abstract', description: 'Générer un résumé structuré ou un abstract en français/anglais', icon: 'ScrollText', color: 'rose' },
  { id: 'hypothesis', label: "Génération d'hypothèses", description: 'Formuler des hypothèses de recherche testables et pertinentes', icon: 'Lightbulb', color: 'orange' },
  { id: 'methodo-positioning', label: 'Positionnement méthodo.', description: 'Analyser les designs de recherche antérieurs et justifier vos choix', icon: 'Target', color: 'teal' },
  { id: 'theory-building', label: 'Construction théorique', description: 'Construire un cadre conceptuel et intégrer les théories', icon: 'Network', color: 'fuchsia' },
  { id: 'supervision-document', label: 'Plan de supervision', description: 'Générer un document de supervision personnalisé pour votre thèse', icon: 'ClipboardList', color: 'indigo' },
  { id: 'conference-presentation', label: 'Présentation & Soutenance', description: 'Préparer slides, script et gestion du jury', icon: 'Presentation', color: 'cyan' },
  { id: 'text-explainer', label: 'Expliquateur de texte', description: 'Décomposer et comprendre un passage académique complexe (SciSpace)', icon: 'BookA', color: 'stone' },
  { id: 'data-analysis-guide', label: 'Guide analyse de données', description: 'Concevoir et interpréter des analyses quantitatives/qualitatives (Julius AI)', icon: 'LineChart', color: 'green' },
  { id: 'submission-check', label: 'Audit pré-soumission', description: 'Vérification complète en 8 dimensions avant soumission (Paperpal)', icon: 'BadgeCheck', color: 'yellow' },
] as const

const MODE_COLORS: Record<string, string> = {
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  sky: 'border-sky-200 bg-sky-50 text-sky-700',
  amber: 'border-amber-200 bg-amber-50 text-amber-700',
  violet: 'border-violet-200 bg-violet-50 text-violet-700',
  rose: 'border-rose-200 bg-rose-50 text-rose-700',
  orange: 'border-orange-200 bg-orange-50 text-orange-700',
  teal: 'border-teal-200 bg-teal-50 text-teal-700',
  fuchsia: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700',
  indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  cyan: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  lime: 'border-lime-200 bg-lime-50 text-lime-700',
  stone: 'border-stone-200 bg-stone-50 text-stone-700',
  green: 'border-green-200 bg-green-50 text-green-700',
  yellow: 'border-yellow-200 bg-yellow-50 text-yellow-700',
}

const MODE_ACCENT: Record<string, string> = {
  emerald: 'bg-emerald-500', sky: 'bg-sky-500', amber: 'bg-amber-500',
  violet: 'bg-violet-500', rose: 'bg-rose-500', orange: 'bg-orange-500',
  teal: 'bg-teal-500', fuchsia: 'bg-fuchsia-500', indigo: 'bg-indigo-500',
  cyan: 'bg-cyan-500', lime: 'bg-lime-500',
  stone: 'bg-stone-500', green: 'bg-green-500', yellow: 'bg-yellow-500',
}

const MODE_TEXT_ACCENT: Record<string, string> = {
  emerald: 'text-emerald-600', sky: 'text-sky-600', amber: 'text-amber-600',
  violet: 'text-violet-600', rose: 'text-rose-600', orange: 'text-orange-600',
  teal: 'text-teal-600', fuchsia: 'text-fuchsia-600', indigo: 'text-indigo-600',
  cyan: 'text-cyan-600', lime: 'text-lime-600',
  stone: 'text-stone-600', green: 'text-green-600', yellow: 'text-yellow-600',
}

const MODE_BG_LIGHT: Record<string, string> = {
  emerald: 'bg-emerald-100', sky: 'bg-sky-100', amber: 'bg-amber-100',
  violet: 'bg-violet-100', rose: 'bg-rose-100', orange: 'bg-orange-100',
  teal: 'bg-teal-100', fuchsia: 'bg-fuchsia-100', indigo: 'bg-indigo-100',
  cyan: 'bg-cyan-100', lime: 'bg-lime-100',
  stone: 'bg-stone-100', green: 'bg-green-100', yellow: 'bg-yellow-100',
}

const PROVIDER_ACCENT: Record<string, string> = {
  'z-ai': 'bg-emerald-500', mistral: 'bg-orange-500', openai: 'bg-sky-500', custom: 'bg-violet-500',
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

// ─── AIWritingTab ───────────────────────────────────────────────
export default function AIWritingTab() {
  const [selectedMode, setSelectedMode] = useState<string>('scientific-writing')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const [error, setError] = useState('')

  // AI Config state
  const [showConfig, setShowConfig] = useState(false)
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(4096)
  const [thinkingEnabled, setThinkingEnabled] = useState(false)

  // Provider state
  const [providerConfig, setProviderConfig] = useState<ProviderConfig>(loadProviderConfig)
  const [showApiKey, setShowApiKey] = useState(false)

  const chatEndRef = useCallback((node: HTMLDivElement | null) => {
    if (node) node.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const activeMode = WRITING_MODES.find(m => m.id === selectedMode)
  const activeProvider = AI_PROVIDERS.find(p => p.id === providerConfig.provider)
  const providerModels = PROVIDER_MODELS[providerConfig.provider]
  const needsApiKey = providerConfig.provider !== 'z-ai'

  function updateProvider<K extends keyof ProviderConfig>(key: K, value: ProviderConfig[K]) {
    const updated = { ...providerConfig, [key]: value }
    if (key === 'provider') {
      // Reset model to first when provider changes
      updated.model = PROVIDER_MODELS[value as ProviderId][0].value
    }
    setProviderConfig(updated)
    saveProviderConfig(updated)
  }

  function getEffectiveModel(): string {
    if (providerConfig.provider === 'z-ai') return 'default'
    if (providerConfig.provider === 'custom') return providerConfig.customModel || 'default'
    return providerConfig.model
  }

  function getEffectiveBaseUrl(): string {
    if (providerConfig.provider === 'z-ai') return ''
    if (providerConfig.provider === 'custom') return providerConfig.customBaseUrl || ''
    return PROVIDER_BASE_URLS[providerConfig.provider]
  }

  async function handleSend() {
    if (!input.trim() || isLoading) return
    setError('')
    const userMsg = input.trim()
    setInput('')

    // Validate provider config
    if (needsApiKey && !providerConfig.apiKey.trim()) {
      setError(`Clé API requise pour ${activeProvider?.label}. Ouvrez la Configuration IA.`)
      setShowConfig(true)
      return
    }
    if (providerConfig.provider === 'custom' && !providerConfig.customBaseUrl.trim()) {
      setError('URL de base requise pour le fournisseur personnalisé.')
      setShowConfig(true)
      return
    }
    if (providerConfig.provider === 'custom' && !providerConfig.customModel.trim()) {
      setError('Nom du modèle requis pour le fournisseur personnalisé.')
      setShowConfig(true)
      return
    }

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userMsg }]
    setMessages(newMessages)
    setIsLoading(true)

    try {
      const body: Record<string, unknown> = {
        mode: selectedMode,
        message: userMsg,
        sessionId: sessionId || undefined,
        temperature,
        maxTokens,
        thinking: thinkingEnabled ? 'enabled' : 'disabled',
      }

      // Include provider info for non-z-ai providers
      if (providerConfig.provider !== 'z-ai') {
        body.provider = providerConfig.provider
        body.apiKey = providerConfig.apiKey
        body.model = getEffectiveModel()
        body.baseUrl = getEffectiveBaseUrl()
      }

      const res = await fetch('/api/ai-writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur serveur')
      if (data.sessionId && !sessionId) setSessionId(data.sessionId)
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleClear() {
    if (sessionId) {
      await fetch(`/api/ai-writing?sessionId=${sessionId}`, { method: 'DELETE' })
    }
    setMessages([])
    setSessionId('')
    setError('')
  }

  function handleCopy(text: string, idx: number) {
    navigator.clipboard.writeText(text)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            Assistant IA de rédaction
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-muted-foreground">
              {WRITING_MODES.length} modes disponibles
            </p>
            <Badge variant="outline" className="text-[10px] gap-1">
              <div className={`h-1.5 w-1.5 rounded-full ${PROVIDER_ACCENT[providerConfig.provider]}`} />
              {activeProvider?.label}
            </Badge>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowConfig(true)}
          className="gap-1.5"
        >
          <Settings2 className="h-3.5 w-3.5" />
          Configuration IA
        </Button>
      </div>

      {/* ── AI Configuration Dialog ── */}
      <Dialog open={showConfig} onOpenChange={setShowConfig}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Settings2 className="h-4 w-4 text-emerald-600" />
              Configuration de l&apos;IA
            </DialogTitle>
            <DialogDescription className="text-xs">
              Choisissez un fournisseur IA et ajustez les paramètres de génération.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {/* ── Provider selector ── */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Fournisseur IA</Label>
              <div className="grid grid-cols-2 gap-2">
                {AI_PROVIDERS.map(p => {
                  const isActive = providerConfig.provider === p.id
                  return (
                    <button
                      key={p.id}
                      onClick={() => updateProvider('provider', p.id as ProviderId)}
                      className={`rounded-lg border p-2.5 text-left transition-all hover:shadow-sm ${
                        isActive
                          ? `${MODE_COLORS[p.color]} ring-2 ring-offset-1 ring-current`
                          : 'border-border bg-background hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className={`h-4 w-4 rounded flex items-center justify-center ${
                          isActive ? PROVIDER_ACCENT[p.id] : 'bg-muted'
                        }`}>
                          {createElement(iconMap[p.icon] || Sparkles, { className: 'h-2.5 w-2.5 text-white' })}
                        </div>
                        <span className={`text-[11px] font-semibold ${isActive ? '' : 'text-foreground'}`}>{p.label}</span>
                      </div>
                      <p className={`text-[10px] leading-tight ml-6 ${isActive ? 'text-current/70' : 'text-muted-foreground'}`}>
                        {p.description}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            <Separator />

            {/* ── Provider-specific fields ── */}
            {needsApiKey && (
              <>
                {/* API Key */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium flex items-center gap-1.5">
                    <Key className="h-3 w-3" />
                    Clé API ({activeProvider?.label})
                  </Label>
                  <div className="relative">
                    <Input
                      type={showApiKey ? 'text' : 'password'}
                      value={providerConfig.apiKey}
                      onChange={e => updateProvider('apiKey', e.target.value)}
                      placeholder="sk-... ou votre clé API"
                      className="text-sm pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showApiKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Stockée localement dans votre navigateur. Jamais envoyée à nos serveurs sauf pour les requêtes IA.
                  </p>
                </div>

                {/* Model selector (for predefined providers) */}
                {providerConfig.provider !== 'custom' && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Modèle</Label>
                    <Select
                      value={providerConfig.model}
                      onValueChange={v => updateProvider('model', v)}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {providerModels.map(m => (
                          <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Custom provider fields */}
                {providerConfig.provider === 'custom' && (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium flex items-center gap-1.5">
                        <Server className="h-3 w-3" />
                        URL de base
                      </Label>
                      <Input
                        type="text"
                        value={providerConfig.customBaseUrl}
                        onChange={e => updateProvider('customBaseUrl', e.target.value)}
                        placeholder="https://api.example.com/v1"
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Nom du modèle</Label>
                      <Input
                        type="text"
                        value={providerConfig.customModel}
                        onChange={e => updateProvider('customModel', e.target.value)}
                        placeholder="gpt-4o, claude-3-5-sonnet, etc."
                        className="text-sm"
                      />
                    </div>
                  </>
                )}

                <Separator />
              </>
            )}

            {/* Z-AI info (when z-ai is selected) */}
            {providerConfig.provider === 'z-ai' && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Modèle IA</Label>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border bg-muted/30 text-sm">
                  <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">LLM (z-ai-web-dev-sdk)</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Modèle par défaut. Le prompt système s&apos;adapte au mode sélectionné.</p>
              </div>
            )}

            {/* ── Generation settings (common to all providers) ── */}
            {/* Temperature */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">
                Température : <span className="font-bold text-emerald-700">{temperature.toFixed(1)}</span>
              </Label>
              <Slider
                value={[temperature]}
                onValueChange={([v]) => setTemperature(v)}
                min={0}
                max={1.5}
                step={0.1}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Précis (0)</span>
                <span>Créatif (1.5)</span>
              </div>
            </div>
            {/* Max tokens */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Max tokens</Label>
              <Select value={String(maxTokens)} onValueChange={v => setMaxTokens(Number(v))}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1024">1 024 (court)</SelectItem>
                  <SelectItem value="2048">2 048 (moyen)</SelectItem>
                  <SelectItem value="4096">4 096 (long)</SelectItem>
                  <SelectItem value="8192">8 192 (très long)</SelectItem>
                  <SelectItem value="16384">16 384 (maximum)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Thinking mode (only for z-ai) */}
            {providerConfig.provider === 'z-ai' && (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label className="text-xs font-medium">Mode réflexif (Thinking)</Label>
                  <p className="text-[10px] text-muted-foreground">L&apos;IA réfléchit avant de répondre</p>
                </div>
                <Switch checked={thinkingEnabled} onCheckedChange={setThinkingEnabled} />
              </div>
            )}
            {/* Active mode info */}
            {activeMode && (
              <>
                <Separator />
                <div className="flex items-center gap-3 rounded-lg bg-muted/30 p-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${MODE_ACCENT[activeMode.color]}`}>
                    {createElement(iconMap[activeMode.icon] || PenTool, { className: 'h-4 w-4 text-white' })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">Mode actuel : {activeMode.label}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{activeMode.description}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Mode selector - 2 rows of 5 */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Modes de rédaction</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {WRITING_MODES.map(mode => {
            const isActive = selectedMode === mode.id
            return (
              <button
                key={mode.id}
                onClick={() => { setSelectedMode(mode.id); setError('') }}
                className={`rounded-lg border p-2.5 text-left transition-all hover:shadow-sm ${
                  isActive
                    ? `${MODE_COLORS[mode.color]} ring-2 ring-offset-1 ring-current`
                    : 'border-border bg-background hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`h-5 w-5 rounded-md flex items-center justify-center ${isActive ? MODE_ACCENT[mode.color] : 'bg-muted'}`}>
                    {createElement(iconMap[mode.icon] || PenTool, { className: 'h-3 w-3 text-white' })}
                  </div>
                  <span className={`text-[11px] font-semibold leading-tight ${isActive ? '' : 'text-foreground'}`}>{mode.label}</span>
                </div>
                <p className={`text-[10px] leading-tight ${isActive ? 'text-current/80' : 'text-muted-foreground'}`}>{mode.description}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Active mode description */}
      {activeMode && (
        <Card className="border-dashed">
          <CardContent className="py-3 px-4 flex items-center gap-3">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${MODE_ACCENT[activeMode.color]}`}>
              {createElement(iconMap[activeMode.icon] || PenTool, { className: 'h-4 w-4 text-white' })}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{activeMode.label}</p>
              <p className="text-xs text-muted-foreground truncate">{activeMode.description}</p>
            </div>
            <Badge variant="secondary" className="text-xs shrink-0">Mode actif</Badge>
          </CardContent>
        </Card>
      )}

      {/* Chat area */}
      <Card className="flex flex-col" style={{ minHeight: '400px', maxHeight: '65vh' }}>
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ minHeight: '300px' }}>
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className={`h-16 w-16 rounded-2xl ${MODE_BG_LIGHT[activeMode?.color || 'emerald']} flex items-center justify-center mb-4`}>
                {createElement(iconMap[activeMode?.icon || 'PenTool'] || PenTool, { className: `h-8 w-8 ${MODE_TEXT_ACCENT[activeMode?.color || 'emerald']}` })}
              </div>
              <h3 className="text-lg font-semibold">{activeMode?.label}</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                {activeMode?.description}. Collez votre texte ou décrivez ce que vous souhaitez rédiger.
              </p>
              <Badge variant="outline" className="mt-3 text-xs gap-1">
                <div className={`h-1.5 w-1.5 rounded-full ${PROVIDER_ACCENT[providerConfig.provider]}`} />
                {activeProvider?.label}
              </Badge>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${MODE_ACCENT[activeMode?.color || 'emerald']}`}>
                  {createElement(iconMap[activeMode?.icon || 'PenTool'] || PenTool, { className: 'h-4 w-4 text-white' })}
                </div>
              )}
              <div className={`relative max-w-[85%] rounded-xl px-4 py-3 ${
                msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => handleCopy(msg.content, idx)}
                    className="absolute top-2 right-2 p-1 rounded-md hover:bg-background/80 transition-colors"
                    title="Copier"
                  >
                    {copiedIdx === idx ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${MODE_ACCENT[activeMode?.color || 'emerald']}`}>
                <Loader2 className="h-4 w-4 text-white animate-spin" />
              </div>
              <div className="bg-muted rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Génération en cours...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {error && (
          <div className="px-4 pb-2">
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="border-t p-3">
          <div className="flex gap-2 items-end">
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Décrivez votre demande en ${activeMode?.label.toLowerCase() || 'rédaction'}...`}
              className="min-h-[60px] max-h-[160px] resize-none text-sm"
              disabled={isLoading}
              rows={2}
            />
            <div className="flex flex-col gap-1 shrink-0">
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-9 w-9"
                title="Envoyer"
              >
                <Send className="h-4 w-4" />
              </Button>
              {messages.length > 0 && (
                <Button
                  onClick={handleClear}
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  title="Nouvelle conversation"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            L&apos;IA peut générer du contenu inexact. Vérifiez toujours les informations et adaptez le texte à votre contexte.
          </p>
        </div>
      </Card>
    </div>
  )
}
