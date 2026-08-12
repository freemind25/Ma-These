'use client'

import { useState, useEffect, useCallback } from 'react'
import { GraduationCap, Settings, Trash2, Check, Brain, Zap, ExternalLink, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

const LS_RM_KEY = 'routesme_api_key'
const LS_RM_PLAN = 'routesme_plan'

interface ProviderSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  aiProvider: string
  setAiProvider: (v: string) => void
  aiApiKey: string
  setAiApiKey: (v: string) => void
  aiBaseUrl: string
  setAiBaseUrl: (v: string) => void
  aiModel: string
  setAiModel: (v: string) => void
  s2ApiKey: string
  setS2ApiKey: (v: string) => void
  consensusApiKey: string
  setConsensusApiKey: (v: string) => void
  onSave: () => void
  onClear: () => void
}

export default function ProviderSettingsDialog({
  open, onOpenChange, aiProvider, setAiProvider, aiApiKey, setAiApiKey, aiBaseUrl, setAiBaseUrl,
  aiModel, setAiModel, s2ApiKey, setS2ApiKey, consensusApiKey, setConsensusApiKey, onSave, onClear,
}: ProviderSettingsDialogProps) {
  const [rmPlan, setRmPlan] = useState<'free' | 'vip'>(() =>
    (typeof window !== 'undefined' ? localStorage.getItem(LS_RM_PLAN) : null) as 'free' | 'vip' || 'free'
  )
  const [rmModels, setRmModels] = useState<{ id: string }[]>([])
  const [rmLoading, setRmLoading] = useState(false)

  const loadRoutesMeModels = useCallback(async (key: string, plan: 'free' | 'vip') => {
    if (!key) return
    setRmLoading(true)
    try {
      const res = await fetch('/api/routesme/models', {
        headers: { 'X-RoutesMe-Key': key },
      })
      const data = await res.json()
      if (data.models) {
        setRmModels(data.models)
        const freeModel = data.models.find((m: { id: string }) => m.id.toLowerCase().includes('glm5.2r'))
          || data.models.find((m: { id: string }) => m.id.toLowerCase().includes('kimi'))
        if (freeModel) setAiModel(freeModel.id)
      }
    } catch { /* ignore */ }
    setRmLoading(false)
  }, [setAiModel])

  // When a provider is selected, auto-fill config
  const handleProviderChange = useCallback((v: string) => {
    setAiProvider(v)
    if (v === 'routesme') {
      const savedKey = localStorage.getItem(LS_RM_KEY)
      if (savedKey) setAiApiKey(savedKey)
      const plan = (localStorage.getItem(LS_RM_PLAN) as 'free' | 'vip') || 'free'
      setRmPlan(plan)
      setAiBaseUrl(plan === 'vip' ? 'https://routesme.online/v2' : 'https://routesme.online/v1')
      setAiModel('GLM5.2R')
      loadRoutesMeModels(savedKey || '', plan)
    } else if (v === 'mistral') { setAiBaseUrl('https://api.mistral.ai/v1'); setAiModel('mistral-large-latest') }
    else if (v === 'openai') { setAiBaseUrl('https://api.openai.com/v1'); setAiModel('gpt-4o') }
    else if (v === 'anthropic') { setAiBaseUrl('https://api.anthropic.com/v1'); setAiModel('claude-sonnet-4-20250514') }
    else if (v === 'groq') { setAiBaseUrl('https://api.groq.com/openai/v1'); setAiModel('llama-3.3-70b-versatile') }
    else if (v === 'ollama') { setAiBaseUrl('http://localhost:11434/v1'); setAiModel('llama3') }
    else if (v === 'freellmapi') { setAiBaseUrl('http://localhost:3456/v1'); setAiModel('fusion') }
    else if (v === 'custom') { setAiBaseUrl(''); setAiModel('') }
  }, [setAiProvider, setAiApiKey, setAiBaseUrl, setAiModel, setRmPlan, loadRoutesMeModels])

  const handleRmPlanChange = useCallback((plan: 'free' | 'vip') => {
    setRmPlan(plan)
    setAiBaseUrl(plan === 'vip' ? 'https://routesme.online/v2' : 'https://routesme.online/v1')
  }, [setRmPlan, setAiBaseUrl])

  const handleRmRefresh = useCallback(() => {
 loadRoutesMeModels(aiApiKey, rmPlan)
  }, [aiApiKey, rmPlan, loadRoutesMeModels])

  const isRoutesMe = aiProvider === 'routesme'
  const isExternal = aiProvider !== 'z-ai'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Settings className="h-4 w-4 text-violet-600" />
            Fournisseur IA
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Provider selector */}
          <div className="space-y-1.5">
            <Label className="text-xs">Fournisseur</Label>
            <Select value={aiProvider} onValueChange={handleProviderChange}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="z-ai">Z.ai (intégré, recommandé)</SelectItem>
                <SelectItem value="routesme">
                  <span className="flex items-center gap-1.5">
                    <Zap className="h-3 w-3 text-emerald-500" />
                    RoutesMe (18 modèles)
                  </span>
                </SelectItem>
                <SelectItem value="mistral">Mistral AI</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                <SelectItem value="groq">Groq</SelectItem>
                <SelectItem value="ollama">Ollama (local)</SelectItem>
                <SelectItem value="freellmapi">FreeLLMAPI (28 fournisseurs gratuits)</SelectItem>
                <SelectItem value="custom">Personnalisé (OpenAI-compat.)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* RoutesMe-specific info & plan */}
          {isRoutesMe && (
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3 space-y-2">
              <p className="text-xs text-emerald-800 dark:text-emerald-200">
                <Zap className="h-3 w-3 inline-block mr-1" />
                <strong>RoutesMe</strong> — 18 modèles IA via API OpenAI-compatible.
              </p>
              <div className="flex gap-2">
                <Select value={rmPlan} onValueChange={v => handleRmPlanChange(v as 'free' | 'vip')}>
                  <SelectTrigger className="h-8 text-xs flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">
                      <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-emerald-500" /> Gratuit</span>
                    </SelectItem>
                    <SelectItem value="vip">
                      <span className="flex items-center gap-1"><Brain className="h-3 w-3 text-amber-500" /> VIP</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleRmRefresh} disabled={!aiApiKey || rmLoading}>
                  {rmLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                  <span className="ml-1">Charger</span>
                </Button>
              </div>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 leading-snug">
                {rmPlan === 'free'
                  ? '🆓 20 req/min · 200K tokens/jour · GLM-5.2R + Kimi-k3 gratuits'
                  : '👑 100 req/min · 5M tokens/jour · Tous les modèles + endpoint dédié'}
              </p>
            </div>
          )}

          {/* External provider fields */}
          {isExternal && (
            <>
              <div className="rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 p-3">
                <p className="text-xs text-violet-800 dark:text-violet-200">
                  <strong>Configuration requise.</strong> Votre clé API est stockée uniquement dans votre navigateur (localStorage) et n'est jamais envoyée à nos serveurs — elle transite directement vers le fournisseur choisi.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Clé API *</Label>
                <Input
                  type="password"
                  value={aiApiKey}
                  onChange={e => setAiApiKey(e.target.value)}
                  placeholder={isRoutesMe ? 'rm-xxxxxxxxxxxxxxxx' : 'sk-...'}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">URL de base *</Label>
                <Input
                  value={aiBaseUrl}
                  onChange={e => setAiBaseUrl(e.target.value)}
                  placeholder="https://api.example.com/v1"
                  className="h-9 text-sm"
                  readOnly={isRoutesMe}
                />
              </div>
              {/* Model selector: dropdown for RoutesMe, text input for others */}
              {isRoutesMe && rmModels.length > 0 ? (
                <div className="space-y-1.5">
                  <Label className="text-xs">Modèle * ({rmModels.length} disponibles)</Label>
                  <Select value={aiModel} onValueChange={setAiModel}>
                    <SelectTrigger className="h-9 text-sm font-mono">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {rmModels.map(m => {
                        const id = m.id
                        const isFree = id.toLowerCase().includes('glm5.2r') || id.toLowerCase().includes('kimi-k3')
                        return (
                          <SelectItem key={id} value={id} className="font-mono text-xs">
                            <span className="flex items-center gap-2">
                              {id}
                              {isFree && <Badge variant="secondary" className="text-[9px] px-1 py-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">GRATUIT</Badge>}
                            </span>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label className="text-xs">Modèle *</Label>
                  <Input
                    value={aiModel}
                    onChange={e => setAiModel(e.target.value)}
                    placeholder="gpt-4o, mistral-large-latest, ..."
                    className="h-9 text-sm font-mono"
                  />
                </div>
              )}
            </>
          )}

          {/* Z.ai info */}
          {aiProvider === 'z-ai' && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
              <p className="text-xs text-emerald-800">
                Le fournisseur <strong>Z.ai</strong> est utilisé par défaut. Aucune configuration supplémentaire n'est nécessaire.
              </p>
            </div>
          )}

          {/* FreeLLMAPI info */}
          {aiProvider === 'freellmapi' && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 space-y-2">
              <p className="text-xs text-amber-800">
                <Zap className="h-3 w-3 inline-block mr-1" />
                <strong>FreeLLMAPI</strong> agrège 28 fournisseurs LLM gratuits (~4 milliards de tokens/mois) derrière un seul endpoint OpenAI-compatible.
              </p>
              <p className="text-[10px] text-amber-700 leading-snug">
                Par défaut, le modèle <code className="bg-amber-100 px-1 rounded">fusion</code> envoie votre prompt à plusieurs modèles en parallèle et synthétise une réponse.
                Vous pouvez aussi choisir un modèle spécifique (ex: <code className="bg-amber-100 px-1 rounded">gpt-4o-mini</code>, <code className="bg-amber-100 px-1 rounded">claude-haiku</code>, <code className="bg-amber-100 px-1 rounded">llama-4-maverick</code>).
              </p>
              <p className="text-[10px] text-amber-700">
                Installation : <code className="bg-amber-100 px-1 rounded">curl -fsSL https://freellmapi.co/install.sh | bash</code>{' '}
                ou voir{' '}
                <a href="https://github.com/tashfeenahmed/freellmapi" target="blank" rel="noopener" className="underline font-medium flex items-center gap-0.5 inline-flex">
                  GitHub <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </p>
            </div>
          )}

          <Separator className="my-1" />

          {/* Semantic Scholar API Key */}
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1.5">
              <GraduationCap className="h-3 w-3 text-sky-600" />
              Clé API Semantic Scholar
              <span className="text-slate-400 font-normal">(optionnel)</span>
            </Label>
            <Input
              type="password"
              value={s2ApiKey}
              onChange={e => setS2ApiKey(e.target.value)}
              placeholder="Clé S2 (1 req/s garanti)"
              className="h-9 text-sm"
            />
            <p className="text-[10px] text-slate-400 leading-snug">
              Sans clé : partage du rate limit global (souvent 429). Avec clé : 1 req/s garanti. Gratuit sur{' '}
              <a href="https://www.semanticscholar.org/product/api#api-key" target="blank" rel="noopener" className="text-sky-600 underline">semanticscholar.org/product/api</a>
            </p>
          </div>

          <Separator className="my-1" />

          {/* Consensus AI API Key */}
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1.5">
              <Brain className="h-3 w-3 text-violet-600" />
              Clé API Consensus AI
              <span className="text-slate-400 font-normal">(requis pour l'onglet Consensus)</span>
            </Label>
            <Input
              type="password"
              value={consensusApiKey}
              onChange={e => setConsensusApiKey(e.target.value)}
              placeholder="Clé API Consensus"
              className="h-9 text-sm"
            />
            <p className="text-[10px] text-slate-400 leading-snug">
              Analyse IA de 220M+ papiers avec réponses synthétiques basées sur les preuves. Obtenez une clé gratuite sur{' '}
              <a href="https://consensus.app" target="blank" rel="noopener" className="text-violet-600 underline">consensus.app</a>
            </p>
          </div>

          <Separator className="my-1" />

          <div className="flex items-center justify-between pt-2">
            <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={onClear}>
              <Trash2 className="h-3 w-3 mr-1" />Réinitialiser
            </Button>
            <Button size="sm" className="text-xs" onClick={onSave}>
              <Check className="h-3 w-3 mr-1" />Enregistrer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
