'use client'

import { useState } from 'react'
import {
  ShieldCheck,
  AlertTriangle,
  FileText,
  Target,
  Lightbulb,
  Globe,
  Loader2,
  RotateCcw,
  CheckCircle2,
  Copy,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { withProviderConfig } from '@/hooks/use-provider-config'

// ─── DirecteurTab ────────────────────────────────────────────
export default function DirecteurTab() {
  const [chapitreTitre, setChapitreTitre] = useState('')
  const [chapitreContenu, setChapitreContenu] = useState('')
  const [quoi, setQuoi] = useState('')
  const [comment, setComment] = useState('')
  const [pourquoi, setPourquoi] = useState('')
  const [hypotheseTexte, setHypotheseTexte] = useState('')
  const [hypObs, setHypObs] = useState(false)
  const [hypVerif, setHypVerif] = useState(false)
  const [hypCoher, setHypCoher] = useState(false)
  const [sousDomaine, setSousDomaine] = useState('')
  const [contraintes, setContraintes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  async function handleSubmit() {
    if (!chapitreTitre.trim() || !quoi.trim() || !comment.trim() || !pourquoi.trim() || !hypotheseTexte.trim()) {
      setError('Remplissez au minimum : le titre du chapitre, la problématique (QUOI / COMMENT / POURQUOI) et l\'hypothèse.')
      return
    }
    setError('')
    setResult('')
    setIsLoading(true)
    try {
      const res = await fetch('/api/directeur', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(withProviderConfig({
          chapitreTitre: chapitreTitre.trim(),
          chapitreContenu: chapitreContenu.trim(),
          probleme: { quoi: quoi.trim(), comment: comment.trim(), pourquoi: pourquoi.trim() },
          hypothese: { texte: hypotheseTexte.trim(), observation: hypObs, verifiable: hypVerif, coherente: hypCoher },
          sousDomaineLabel: sousDomaine || 'Non précisé',
          contraintesMethodologiques: contraintes.trim(),
        })),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur serveur')
      setResult(data.response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setIsLoading(false)
    }
  }

  function handleCopy() {
    if (!result) return
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleReset() {
    setResult('')
    setError('')
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-amber-600" />
          Directeur de thèse — Évaluation
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Soumettez un chapitre pour recevoir une évaluation exigeante, comme en réunion de suivi. L'IA ne rédige jamais à votre place — elle questionne et pousse.
        </p>
      </div>

      {/* Info banner */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="py-3 px-4 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">
            Cette instance <strong>évalue</strong> votre chapitre — elle ne produit aucun texte de thèse.
            Préparez votre problématique (QUOI / COMMENT / POURQUOI) et votre hypothèse avant de soumettre.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LEFT: Form */}
        <div className="space-y-4">
          {/* Chapitre */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-amber-600" />
                Chapitre soumis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Titre du chapitre *</Label>
                <Input
                  value={chapitreTitre}
                  onChange={e => setChapitreTitre(e.target.value)}
                  placeholder="Ex : Chapitre I — Revue de la littérature"
                  className="mt-1 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Contenu actuel</Label>
                <Textarea
                  value={chapitreContenu}
                  onChange={e => setChapitreContenu(e.target.value)}
                  placeholder="Collez ici le contenu rédigé de votre chapitre (laissez vide si aucun texte encore)..."
                  className="mt-1 text-sm min-h-[120px] max-h-[300px] resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Problématique */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4 text-amber-600" />
                Problématique du projet *
              </CardTitle>
              <CardDescription className="text-xs">QUOI / COMMENT / POURQUOI — les 3 dimensions articulées</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs font-medium text-sky-700">QUOI <span className="text-muted-foreground font-normal">— l'objet de la recherche</span></Label>
                <Input value={quoi} onChange={e => setQuoi(e.target.value)} placeholder="Ex : L'impact de la densification sur la qualité de vie..." className="mt-1 text-sm" />
              </div>
              <div>
                <Label className="text-xs font-medium text-sky-700">COMMENT <span className="text-muted-foreground font-normal">— l'angle d'approche</span></Label>
                <Input value={comment} onChange={e => setComment(e.target.value)} placeholder="Ex : à travers une analyse comparative de trois quartiers..." className="mt-1 text-sm" />
              </div>
              <div>
                <Label className="text-xs font-medium text-sky-700">POURQUOI <span className="text-muted-foreground font-normal">— l'enjeu scientifique</span></Label>
                <Input value={pourquoi} onChange={e => setPourquoi(e.target.value)} placeholder="Ex : pour formuler des recommandations de planification urbaine..." className="mt-1 text-sm" />
              </div>
            </CardContent>
          </Card>

          {/* Hypothèse */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-600" />
                Hypothèse de recherche *
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Texte de l'hypothèse</Label>
                <Textarea value={hypotheseTexte} onChange={e => setHypotheseTexte(e.target.value)} placeholder="Ex : La densification résidentielle entraîne une dégradation mesurable de la qualité de vie perçue lorsque les espaces verts diminuent sous le seuil de 10 m²/habitant." className="mt-1 text-sm min-h-[80px] resize-none" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 cursor-pointer rounded-lg border p-2.5 hover:bg-muted/50 transition-colors">
                  <Checkbox checked={hypObs} onCheckedChange={v => setHypObs(v === true)} />
                  <span className="text-xs">Observation empirique</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer rounded-lg border p-2.5 hover:bg-muted/50 transition-colors">
                  <Checkbox checked={hypVerif} onCheckedChange={v => setHypVerif(v === true)} />
                  <span className="text-xs">Vérifiable</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer rounded-lg border p-2.5 hover:bg-muted/50 transition-colors">
                  <Checkbox checked={hypCoher} onCheckedChange={v => setHypCoher(v === true)} />
                  <span className="text-xs">Cohérente théoriquement</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Contexte additionnel */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                Contexte additionnel
              </CardTitle>
              <CardDescription className="text-xs">Optionnel — permet une évaluation plus ciblée</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Sous-domaine disciplinaire</Label>
                <Select value={sousDomaine} onValueChange={setSousDomaine}>
                  <SelectTrigger className="mt-1 text-sm"><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                  <SelectContent>
                    {['Sciences humaines et sociales', 'Sciences de l\'ingénieur', 'Sciences de la vie et de la santé', 'Sciences exactes et naturelles', 'Droit et sciences politiques', 'Économie et gestion', 'Lettres et langues', 'Arts et humanités', 'Informatique et sciences du numérique', 'Environnement et développement durable'].map(d => (
                      <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Contraintes méthodologiques</Label>
                <Textarea value={contraintes} onChange={e => setContraintes(e.target.value)} placeholder="Ex : méthodologie mixte, échantillon de 200 ménages, analyse SPSS..." className="mt-1 text-sm min-h-[60px] resize-none" />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={isLoading} className="flex-1">
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
              {isLoading ? 'Évaluation en cours...' : 'Soumettre au directeur'}
            </Button>
            {result && (
              <Button onClick={handleReset} variant="outline" size="icon" title="Nouvelle évaluation">
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* RIGHT: Result */}
        <div className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          {isLoading && (
            <Card className="border-amber-200">
              <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                <Loader2 className="h-8 w-8 text-amber-500 animate-spin mb-3" />
                <p className="text-sm font-medium text-amber-700">Le directeur évalue votre chapitre...</p>
                <p className="text-xs text-muted-foreground mt-1">Cela peut prendre quelques secondes.</p>
              </CardContent>
            </Card>
          )}

          {result && !isLoading && (
            <Card className="border-amber-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-amber-600" />
                    Retour du directeur
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={handleCopy} className="text-xs h-7 gap-1">
                    {copied ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    {copied ? 'Copié' : 'Copier'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-sm whitespace-pre-wrap leading-relaxed bg-amber-50/30 rounded-lg p-4 border border-amber-100">
                  {result}
                </div>
              </CardContent>
            </Card>
          )}

          {!result && !isLoading && !error && (
            <Card className="border-dashed">
              <CardContent className="py-16 flex flex-col items-center justify-center text-center">
                <div className="h-14 w-14 rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
                  <ShieldCheck className="h-7 w-7 text-amber-600" />
                </div>
                <h3 className="text-base font-semibold">En attente de soumission</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  Remplissez le formulaire et soumettez votre chapitre pour recevoir une évaluation critique de votre directeur de thèse virtuel.
                </p>
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  <Badge variant="outline" className="text-xs">IMRaD</Badge>
                  <Badge variant="outline" className="text-xs">Évaluation critique</Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
