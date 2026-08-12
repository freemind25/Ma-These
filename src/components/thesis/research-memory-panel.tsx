"use client"

import * as React from "react"
import {
  Brain,
  Tag,
  FlaskConical,
  HelpCircle,
  BookOpen,
  Lightbulb,
  Layers,
  BarChart3,
  StickyNote,
  Star,
  Plus,
  Trash2,
  Pencil,
  Sparkles,
  Eye,
  Clock,
  AlertTriangle,
  Eraser,
} from "lucide-react"
import { toast } from "sonner"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"

// ─── Types ───────────────────────────────────────────────────────────────────

type MemoryCategory =
  | "theme"
  | "methodologie"
  | "problematique"
  | "reference"
  | "hypothese"
  | "cadre"
  | "result"
  | "note"

interface MemoryItem {
  id: string
  category: MemoryCategory
  key: string
  value: string
  importance: number
  createdAt: string
}

interface ExtractedItem {
  key: string
  value: string
  category: MemoryCategory
  importance: number
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<
  MemoryCategory,
  {
    label: string
    icon: React.ElementType
    color: string
    bgClass: string
    borderClass: string
  }
> = {
  theme: {
    label: "Thème & Sujet",
    icon: Tag,
    color: "var(--color-chart-1)",
    bgClass: "bg-[oklch(var(--chart-1)/0.08)]",
    borderClass: "border-[oklch(var(--chart-1)/0.3)]",
  },
  methodologie: {
    label: "Méthodologie",
    icon: FlaskConical,
    color: "var(--color-chart-2)",
    bgClass: "bg-[oklch(var(--chart-2)/0.08)]",
    borderClass: "border-[oklch(var(--chart-2)/0.3)]",
  },
  problematique: {
    label: "Problématique",
    icon: HelpCircle,
    color: "var(--color-chart-4)",
    bgClass: "bg-[oklch(var(--chart-4)/0.08)]",
    borderClass: "border-[oklch(var(--chart-4)/0.3)]",
  },
  reference: {
    label: "Références clés",
    icon: BookOpen,
    color: "var(--color-chart-5)",
    bgClass: "bg-[oklch(var(--chart-5)/0.08)]",
    borderClass: "border-[oklch(var(--chart-5)/0.3)]",
  },
  hypothese: {
    label: "Hypothèses",
    icon: Lightbulb,
    color: "var(--color-chart-3)",
    bgClass: "bg-[oklch(var(--chart-3)/0.08)]",
    borderClass: "border-[oklch(var(--chart-3)/0.3)]",
  },
  cadre: {
    label: "Cadre théorique",
    icon: Layers,
    color: "var(--color-chart-6)",
    bgClass: "bg-[oklch(var(--chart-6)/0.08)]",
    borderClass: "border-[oklch(var(--chart-6)/0.3)]",
  },
  result: {
    label: "Résultats",
    icon: BarChart3,
    color: "var(--color-chart-7)",
    bgClass: "bg-[oklch(var(--chart-7)/0.08)]",
    borderClass: "border-[oklch(var(--chart-7)/0.3)]",
  },
  note: {
    label: "Notes générales",
    icon: StickyNote,
    color: "var(--color-muted-foreground)",
    bgClass: "bg-muted/50",
    borderClass: "border-muted",
  },
}

const CATEGORIES_ORDER: MemoryCategory[] = [
  "theme",
  "methodologie",
  "problematique",
  "reference",
  "hypothese",
  "cadre",
  "result",
  "note",
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

function ImportanceStars({ value }: { value: number }) {
  const clamped = Math.max(1, Math.min(10, Math.round(value)))
  return (
    <span className="inline-flex items-center gap-px" aria-label={`Importance ${clamped}/10`}>
      {Array.from({ length: clamped }, (_, i) => (
        <Star
          key={i}
          className="size-3 fill-amber-400 text-amber-400"
        />
      ))}
      {Array.from({ length: 10 - clamped }, (_, i) => (
        <Star
          key={`empty-${i}`}
          className="size-3 text-muted-foreground/30"
        />
      ))}
    </span>
  )
}

// ─── Custom scrollbar ────────────────────────────────────────────────────────

const SCROLLBAR_CLASSNAME =
  "scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/40"

// ─── Component ───────────────────────────────────────────────────────────────

export default function ResearchMemoryPanel() {
  const queryClient = useQueryClient()

  // Add dialog state
  const [addOpen, setAddOpen] = React.useState(false)
  const [newCategory, setNewCategory] = React.useState<MemoryCategory>("theme")
  const [newKey, setNewKey] = React.useState("")
  const [newValue, setNewValue] = React.useState("")
  const [newImportance, setNewImportance] = React.useState(5)

  // Edit dialog state
  const [editOpen, setEditOpen] = React.useState(false)
  const [editItem, setEditItem] = React.useState<MemoryItem | null>(null)
  const [editValue, setEditValue] = React.useState("")

  // Auto-extract state
  const [extractText, setExtractText] = React.useState("")
  const [extractedItems, setExtractedItems] = React.useState<ExtractedItem[]>([])

  // LLM context dialog
  const [llmContextOpen, setLlmContextOpen] = React.useState(false)

  // Clear confirmation dialog
  const [clearOpen, setClearOpen] = React.useState(false)

  // ── Queries ─────────────────────────────────────────────────────────────

  const {
    data: memories = [],
    isLoading,
    isError,
  } = useQuery<MemoryItem[]>({
    queryKey: ["research-memories"],
    queryFn: async () => {
      const res = await fetch("/api/memory")
      if (!res.ok) throw new Error("Erreur de chargement")
      return res.json()
    },
  })

  // ── Mutations ───────────────────────────────────────────────────────────

  const addMutation = useMutation({
    mutationFn: async (payload: {
      category: MemoryCategory
      key: string
      value: string
      importance: number
    }) => {
      const res = await fetch("/api/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Erreur lors de l\'ajout")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["research-memories"] })
      toast.success("Souvenir ajouté avec succès")
      setAddOpen(false)
      setNewKey("")
      setNewValue("")
      setNewImportance(5)
    },
    onError: () => {
      toast.error("Impossible d\'ajouter le souvenir")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/memory?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Erreur lors de la suppression")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["research-memories"] })
      toast.success("Souvenir supprimé")
    },
    onError: () => {
      toast.error("Impossible de supprimer le souvenir")
    },
  })

  const editMutation = useMutation({
    mutationFn: async ({
      id,
      value,
    }: {
      id: string
      value: string
    }) => {
      const res = await fetch(`/api/memory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, value }),
      })
      if (!res.ok) throw new Error("Erreur lors de la modification")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["research-memories"] })
      toast.success("Souvenir modifié")
      setEditOpen(false)
      setEditItem(null)
      setEditValue("")
    },
    onError: () => {
      toast.error("Impossible de modifier le souvenir")
    },
  })

  const extractMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await fetch("/api/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extractFrom: text }),
      })
      if (!res.ok) throw new Error("Erreur d\'extraction")
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["research-memories"] })
      if (Array.isArray(data)) {
        setExtractedItems(data)
        toast.success(`${data.length} élément(s) extrait(s)`)
      } else {
        setExtractedItems(data?.items ?? [])
        toast.success("Extraction terminée")
      }
    },
    onError: () => {
      toast.error("Impossible d\'extraire les éléments")
    },
  })

  const clearMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/memory?action=clear")
      if (!res.ok) throw new Error("Erreur")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["research-memories"] })
      toast.success("Mémoire vidée avec succès")
      setClearOpen(false)
    },
    onError: () => {
      toast.error("Impossible de vider la mémoire")
    },
  })

  const expireMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/memory?action=expire")
      if (!res.ok) throw new Error("Erreur")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["research-memories"] })
      toast.success("Souvenirs expirés purgés")
    },
    onError: () => {
      toast.error("Impossible de purger les éléments expirés")
    },
  })

  // ── Grouped memories ────────────────────────────────────────────────────

  const groupedMemories = React.useMemo(() => {
    const groups = new Map<MemoryCategory, MemoryItem[]>()
    CATEGORIES_ORDER.forEach((cat) => groups.set(cat, []))
    for (const m of memories) {
      const cat = (m.category as MemoryCategory) ?? "note"
      if (!groups.has(cat)) groups.set(cat, [])
      const list = groups.get(cat)
      if (list) list.push(m)
    }
    return groups
  }, [memories])

  // ── Handlers ────────────────────────────────────────────────────────────

  function handleAdd() {
    if (!newKey.trim() || !newValue.trim()) {
      toast.error("Veuillez remplir la clé et la valeur")
      return
    }
    addMutation.mutate({
      category: newCategory,
      key: newKey.trim(),
      value: newValue.trim(),
      importance: newImportance,
    })
  }

  function handleEditOpen(item: MemoryItem) {
    setEditItem(item)
    setEditValue(item.value)
    setEditOpen(true)
  }

  function handleEditSave() {
    if (!editItem || !editValue.trim()) return
    editMutation.mutate({ id: editItem.id, value: editValue.trim() })
  }

  function handleExtract() {
    if (!extractText.trim()) {
      toast.error("Veuillez coller du texte à analyser")
      return
    }
    extractMutation.mutate(extractText)
  }

  // ── Render helpers ──────────────────────────────────────────────────────

  function renderStarsCompact(value: number) {
    const clamped = Math.max(1, Math.min(10, Math.round(value)))
    return (
      <span className="inline-flex items-center gap-px" aria-label={`${clamped}/10`}>
        {Array.from({ length: clamped }, (_, i) => (
          <Star key={i} className="size-2.5 fill-amber-400 text-amber-400" />
        ))}
      </span>
    )
  }

  // ── Main render ─────────────────────────────────────────────────────────

  return (
    <Card className="w-full border-border/50">
      {/* ── Section 1: Header ──────────────────────────────────────────────── */}
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-chart-2/10">
              <Brain className="size-5 text-chart-2" />
            </div>
            <div>
              <CardTitle className="text-lg leading-tight">
                Mémoire de recherche
              </CardTitle>
              <CardDescription className="mt-1 text-sm">
                Contexte persistant entre les sessions
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="shrink-0 tabular-nums">
            {memories.length} souvenir{memories.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        {/* ── Section 3: Add button ───────────────────────────────────────── */}
        <div className="flex items-center gap-2">
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="size-4" />
                Ajouter un souvenir
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Ajouter un souvenir</DialogTitle>
                <DialogDescription>
                  Enregistrez un élément important pour vos futures sessions de
                  recherche.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Catégorie</label>
                  <Select
                    value={newCategory}
                    onValueChange={(v) => setNewCategory(v as MemoryCategory)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES_ORDER.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          <span className="flex items-center gap-2">
                            {React.createElement(
                              CATEGORY_CONFIG[cat].icon,
                              { className: "size-4" }
                            )}
                            {CATEGORY_CONFIG[cat].label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Clé</label>
                  <Input
                    placeholder="ex: Hypothèse principale"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Valeur</label>
                  <Textarea
                    placeholder="Description détaillée..."
                    rows={3}
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">
                    Importance — {newImportance}/10
                  </label>
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[newImportance]}
                    onValueChange={([v]) => setNewImportance(v)}
                  />
                  <div className="flex items-center gap-1">
                    <ImportanceStars value={newImportance} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setAddOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleAdd}
                  disabled={addMutation.isPending}
                  className="gap-2"
                >
                  {addMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Enregistrement…
                    </span>
                  ) : (
                    "Enregistrer"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* ── Section 2: Memory list grouped by category ──────────────────── */}
        <div className="max-h-[500px] overflow-y-auto rounded-md border border-border/40 pr-1">
          <div className={`${SCROLLBAR_CLASSNAME} flex flex-col gap-5 p-1`}>
            {isLoading ? (
              <div className="flex flex-col gap-4 p-2">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                <AlertTriangle className="size-8 text-destructive" />
                <p className="text-sm text-muted-foreground">
                  Impossible de charger la mémoire de recherche.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    queryClient.invalidateQueries({
                      queryKey: ["research-memories"],
                    })
                  }
                >
                  Réessayer
                </Button>
              </div>
            ) : memories.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                <Brain className="size-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  Aucun souvenir enregistré.
                  <br />
                  Ajoutez des éléments importants pour vos recherches.
                </p>
              </div>
            ) : (
              CATEGORIES_ORDER.map((cat) => {
                const items = groupedMemories.get(cat) ?? []
                if (items.length === 0) return null
                const config = CATEGORY_CONFIG[cat]
                const IconComp = config.icon

                return (
                  <div key={cat} className="flex flex-col gap-2">
                    {/* Category header */}
                    <div className="flex items-center gap-2 px-1">
                      <IconComp
                        className="size-4"
                        style={{ color: config.color }}
                      />
                      <span
                        className="text-sm font-semibold"
                        style={{ color: config.color }}
                      >
                        {config.label}
                      </span>
                      <Badge
                        variant="outline"
                        className="ml-auto text-xs tabular-nums"
                        style={{
                          borderColor: config.color,
                          color: config.color,
                        }}
                      >
                        {items.length}
                      </Badge>
                    </div>

                    {/* Items */}
                    <div className="flex flex-col gap-1.5 pl-1">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className={`group relative flex flex-col gap-1.5 rounded-lg border p-3 transition-colors hover:bg-accent/30 ${config.borderClass} ${config.bgClass}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-sm font-semibold leading-tight">
                              {item.key}
                            </span>
                            <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={() => handleEditOpen(item)}
                                className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                                aria-label="Modifier"
                              >
                                <Pencil className="size-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  deleteMutation.mutate(item.id)
                                }
                                className="rounded p-1 text-muted-foreground transition-colors hover:text-destructive"
                                aria-label="Supprimer"
                                disabled={deleteMutation.isPending}
                              >
                                {deleteMutation.isPending &&
                                deleteMutation.variables === item.id ? (
                                  <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                ) : (
                                  <Trash2 className="size-3" />
                                )}
                              </button>
                            </div>
                          </div>

                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {item.value}
                          </p>

                          <div className="flex items-center gap-3 pt-0.5">
                            {renderStarsCompact(item.importance)}
                            <span className="flex items-center gap-1 text-xs text-muted-foreground/60">
                              <Clock className="size-2.5" />
                              {formatDate(item.createdAt)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <Separator />

        {/* ── Section 4: Auto-extract panel ──────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-chart-3" />
            <h3 className="text-sm font-semibold">
              Extraction automatique
            </h3>
          </div>
          <Textarea
            placeholder="Collez une réponse IA ici pour extraire automatiquement les éléments mémorisables..."
            rows={3}
            value={extractText}
            onChange={(e) => setExtractText(e.target.value)}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleExtract}
            disabled={extractMutation.isPending}
            className="w-fit gap-2"
          >
            {extractMutation.isPending ? (
              <span className="flex items-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Extraction en cours…
              </span>
            ) : (
              <>
                <Sparkles className="size-4" />
                Extraire
              </>
            )}
          </Button>

          {/* Extracted items preview */}
          {extractedItems.length > 0 && (
            <div className="flex flex-col gap-1.5 rounded-lg border border-chart-3/20 bg-chart-3/5 p-3">
              <p className="text-xs font-medium text-chart-3">
                {extractedItems.length} élément(s) extrait(s) :
              </p>
              <div className="max-h-40 overflow-y-auto">
                <div className={`${SCROLLBAR_CLASSNAME} flex flex-col gap-1`}>
                  {extractedItems.map((ext, i) => {
                    const catConfig = CATEGORY_CONFIG[ext.category ?? "note"]
                    return (
                      <div
                        key={i}
                        className="flex items-start gap-2 rounded bg-background/50 p-2 text-xs"
                      >
                        <Badge
                          variant="outline"
                          className="shrink-0 text-[10px]"
                          style={{
                            borderColor: catConfig.color,
                            color: catConfig.color,
                          }}
                        >
                          {catConfig.label}
                        </Badge>
                        <span className="font-medium">{ext.key}</span>
                        <span className="text-muted-foreground">
                          — {ext.value.length > 60
                            ? ext.value.slice(0, 60) + "…"
                            : ext.value}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* ── Section 5: Actions ──────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold">Actions</h3>
          <div className="flex flex-wrap items-center gap-2">
            {/* Clear all */}
            <Dialog open={clearOpen} onOpenChange={setClearOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-2"
                >
                  <Eraser className="size-4" />
                  Vider la mémoire
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="size-5 text-destructive" />
                    Confirmer la suppression
                  </DialogTitle>
                  <DialogDescription>
                    Cette action supprimera définitivement tous les souvenirs
                    de recherche. Cette opération est irréversible.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setClearOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => clearMutation.mutate()}
                    disabled={clearMutation.isPending}
                  >
                    {clearMutation.isPending
                      ? "Suppression…"
                      : "Tout supprimer"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Purge expired */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => expireMutation.mutate()}
              disabled={expireMutation.isPending}
              className="gap-2"
            >
              {expireMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Purge en cours…
                </span>
              ) : (
                <>
                  <Trash2 className="size-4" />
                  Purger les expirés
                </>
              )}
            </Button>

            {/* LLM context view */}
            <Dialog open={llmContextOpen} onOpenChange={setLlmContextOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Eye className="size-4" />
                  Voir contexte LLM
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Contexte LLM</DialogTitle>
                  <DialogDescription>
                    Voici le format de la mémoire tel qu\'il serait envoyé à un
                    modèle de langage.
                  </DialogDescription>
                </DialogHeader>
                <LLMContextViewer />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>

      {/* ── Edit dialog (rendered at root level) ──────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier le souvenir</DialogTitle>
            <DialogDescription>
              Modifiez la valeur de «&nbsp;{editItem?.key ?? ""}&nbsp;»
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Valeur</label>
              <Textarea
                rows={4}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleEditSave}
              disabled={editMutation.isPending}
              className="gap-2"
            >
              {editMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Enregistrement…
                </span>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

// ─── LLM Context Viewer (sub-component) ──────────────────────────────────────

function LLMContextViewer() {
  const { data, isLoading, isError } = useQuery<string>({
    queryKey: ["research-memories", "llm-context"],
    queryFn: async () => {
      const res = await fetch("/api/memory?format=llm")
      if (!res.ok) throw new Error("Erreur")
      const json = await res.json()
      return typeof json === "string" ? json : JSON.stringify(json, null, 2)
    },
    enabled: true,
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    )
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        Impossible de charger le contexte LLM.
      </p>
    )
  }

  return (
    <ScrollArea className="max-h-[400px] rounded-md border">
      <pre className="whitespace-pre-wrap break-words p-4 text-xs leading-relaxed text-muted-foreground">
        {data ?? "(vide)"}
      </pre>
    </ScrollArea>
  )
}
