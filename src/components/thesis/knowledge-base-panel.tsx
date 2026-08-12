"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  FileText,
  Search,
  Plus,
  Trash2,
  BookOpen,
  BarChart3,
  Loader2,
  File,
  Hash,
  Sparkles,
  AlertCircle,
  Database,
  Layers,
  Type,
  ChevronRight,
} from "lucide-react"

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
} from "@/components/ui/dialog"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

// ── Types ───────────────────────────────────────────────────────────────────

type FileType = "text" | "markdown" | "pdf" | "html"

type SourceType =
  | "upload"
  | "url"
  | "clipboard"
  | "ocr"
  | "import"

interface KnowledgeDocument {
  id: string
  title: string
  content: string
  fileName?: string
  fileType: FileType
  tags: string[]
  sourceType: SourceType
  wordCount: number
  chunkCount: number
  createdAt: string
  updatedAt: string
}

interface SearchChunk {
  documentId: string
  documentTitle: string
  content: string
  score: number
  chunkIndex: number
}

interface CitationStats {
  totalCitations: number
  byStatus?: Record<string, number>
  byChapter?: Record<string, number>
  [key: string]: unknown
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const FILE_TYPE_STYLES: Record<FileType, string> = {
  text: "bg-secondary text-secondary-foreground",
  pdf: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  markdown:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  html: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
}

const FILE_TYPE_LABELS: Record<FileType, string> = {
  text: "Texte",
  pdf: "PDF",
  markdown: "Markdown",
  html: "HTML",
}

const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  upload: "Téléversement",
  url: "URL",
  clipboard: "Presse-papiers",
  ocr: "OCR",
  import: "Import",
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str
  return str.slice(0, max) + "…"
}

// ── Component ───────────────────────────────────────────────────────────────

export default function KnowledgeBasePanel() {
  const queryClient = useQueryClient()

  // State
  const [searchFilter, setSearchFilter] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchTopK, setSearchTopK] = useState("5")

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")
  const [newFileType, setNewFileType] = useState<FileType>("text")
  const [newTags, setNewTags] = useState("")
  const [newSourceType, setNewSourceType] = useState<SourceType>("upload")

  // LLM context dialog state
  const [contextDialogOpen, setContextDialogOpen] = useState(false)
  const [selectedContext, setSelectedContext] = useState<string>("")

  // ── Queries ────────────────────────────────────────────────────────────────

  const {
    data: documents = [],
    isLoading: docsLoading,
    error: docsError,
  } = useQuery<KnowledgeDocument[]>({
    queryKey: ["knowledge-documents"],
    queryFn: async () => {
      const res = await fetch("/api/knowledge/documents")
      if (!res.ok) throw new Error("Impossible de charger les documents")
      return res.json()
    },
  })

  const {
    data: citationStats,
    isLoading: citationLoading,
  } = useQuery<CitationStats>({
    queryKey: ["citation-stats"],
    queryFn: async () => {
      const res = await fetch("/api/citations?action=stats")
      if (!res.ok) throw new Error("Impossible de charger les statistiques")
      return res.json()
    },
  })

  // ── Mutations ──────────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: async (doc: {
      title: string
      content: string
      fileName?: string
      fileType: FileType
      tags: string[]
      sourceType: SourceType
    }) => {
      const res = await fetch("/api/knowledge/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doc),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Erreur lors de la création")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-documents"] })
      toast.success("Document ajouté avec succès")
      resetDialogForm()
      setDialogOpen(false)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/knowledge/documents/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Erreur lors de la suppression")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-documents"] })
      toast.success("Document supprimé")
    },
    onError: () => {
      toast.error("Impossible de supprimer le document")
    },
  })

  const searchMutation = useMutation<SearchChunk[], Error, string>({
    mutationFn: async (query: string) => {
      const res = await fetch("/api/knowledge/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, topK: Number(searchTopK) || 5 }),
      })
      if (!res.ok) throw new Error("Erreur lors de la recherche")
      return res.json()
    },
    onError: () => {
      toast.error("La recherche a échoué")
    },
  })

  // ── Handlers ───────────────────────────────────────────────────────────────

  function resetDialogForm() {
    setNewTitle("")
    setNewContent("")
    setNewFileType("text")
    setNewTags("")
    setNewSourceType("upload")
  }

  function handleCreate() {
    if (!newTitle.trim()) {
      toast.error("Le titre est requis")
      return
    }
    if (!newContent.trim()) {
      toast.error("Le contenu est requis")
      return
    }
    createMutation.mutate({
      title: newTitle.trim(),
      content: newContent.trim(),
      fileName: `${newTitle.trim().toLowerCase().replace(/\s+/g, "-")}.${newFileType === "markdown" ? "md" : newFileType}`,
      fileType: newFileType,
      tags: newTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      sourceType: newSourceType,
    })
  }

  function handleSearch() {
    if (!searchQuery.trim()) {
      toast.error("Veuillez entrer une requête de recherche")
      return
    }
    searchMutation.mutate(searchQuery.trim())
  }

  function handleShowContext(results: SearchChunk[]) {
    const ctx = results
      .map(
        (r, i) =>
          `[Document ${i + 1}] ${r.documentTitle}\n${r.content}\n(Score: ${(r.score * 100).toFixed(1)}%)`
      )
      .join("\n\n---\n\n")
    setSelectedContext(ctx)
    setContextDialogOpen(true)
  }

  // ── Computed ──────────────────────────────────────────────────────────────

  const filteredDocuments = useMemo(() => {
    if (!searchFilter.trim()) return documents
    const q = searchFilter.toLowerCase()
    return documents.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.tags.some((t) => t.toLowerCase().includes(q))
    )
  }, [documents, searchFilter])

  const stats = useMemo(() => {
    const totalWords = documents.reduce((s, d) => s + (d.wordCount ?? 0), 0)
    const totalChunks = documents.reduce((s, d) => s + (d.chunkCount ?? 0), 0)
    const byType = documents.reduce<Record<string, number>>((acc, d) => {
      acc[d.fileType] = (acc[d.fileType] ?? 0) + 1
      return acc
    }, {})
    return { totalDocs: documents.length, totalWords, totalChunks, byType }
  }, [documents])

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Base de connaissances</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Gérez vos documents de recherche et effectuez des recherches
          sémantiques intelligentes.
        </p>
      </div>

      <Tabs defaultValue="bibliotheque" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bibliotheque" className="gap-1.5">
            <BookOpen className="size-4" />
            <span className="hidden sm:inline">Bibliothèque</span>
          </TabsTrigger>
          <TabsTrigger value="recherche" className="gap-1.5">
            <Search className="size-4" />
            <span className="hidden sm:inline">Recherche</span>
          </TabsTrigger>
          <TabsTrigger value="statistiques" className="gap-1.5">
            <BarChart3 className="size-4" />
            <span className="hidden sm:inline">Statistiques</span>
          </TabsTrigger>
        </TabsList>

        {/* ─── Tab 1 : Bibliothèque ──────────────────────────────────────── */}
        <TabsContent value="bibliotheque" className="mt-4 space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Chercher un document…"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-9"
              />
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-1.5">
                  <Plus className="size-4" />
                  Ajouter un document
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Ajouter un document</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Titre</label>
                    <Input
                      placeholder="Titre du document"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                    />
                  </div>

                  {/* Content */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Contenu</label>
                    <Textarea
                      placeholder="Collez ou saisissez le contenu du document…"
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      className="min-h-48 resize-y"
                    />
                  </div>

                  {/* File type + Source type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">
                        Type de fichier
                      </label>
                      <Select
                        value={newFileType}
                        onValueChange={(v) => setNewFileType(v as FileType)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Texte</SelectItem>
                          <SelectItem value="markdown">Markdown</SelectItem>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="html">HTML</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">
                        Source du document
                      </label>
                      <Select
                        value={newSourceType}
                        onValueChange={(v) =>
                          setNewSourceType(v as SourceType)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="upload">Téléversement</SelectItem>
                          <SelectItem value="url">URL</SelectItem>
                          <SelectItem value="clipboard">
                            Presse-papiers
                          </SelectItem>
                          <SelectItem value="ocr">OCR</SelectItem>
                          <SelectItem value="import">Import</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">
                      Étiquettes (séparées par des virgules)
                    </label>
                    <Input
                      placeholder="ex : méthodologie, recherche qualitative"
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                    />
                  </div>

                  {/* Submit */}
                  <Button
                    onClick={handleCreate}
                    disabled={createMutation.isPending}
                    className="gap-1.5"
                  >
                    {createMutation.isPending && (
                      <Loader2 className="size-4 animate-spin" />
                    )}
                    Créer le document
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Error state */}
          {docsError && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>
                {docsError.message ||
                  "Une erreur est survenue lors du chargement des documents."}
              </AlertDescription>
            </Alert>
          )}

          {/* Loading skeletons */}
          {docsLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-14 rounded-full" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!docsLoading && !docsError && filteredDocuments.length === 0 && (
            <Card className="py-12">
              <CardContent className="flex flex-col items-center justify-center text-center gap-3">
                <div className="rounded-full bg-muted p-4">
                  <Database className="size-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">
                    {searchFilter
                      ? "Aucun document trouvé"
                      : "Aucun document dans la base"}
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">
                    {searchFilter
                      ? "Essayez de modifier vos critères de recherche."
                      : 'Commencez par ajouter un document à l\'aide du bouton ci-dessus.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Document grid */}
          {!docsLoading &&
            filteredDocuments.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocuments.map((doc) => (
                  <Card
                    key={doc.id}
                    className="group relative flex flex-col transition-shadow hover:shadow-md"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base leading-snug line-clamp-2">
                          {doc.title}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                          onClick={() => deleteMutation.mutate(doc.id)}
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="size-3.5" />
                          )}
                          <span className="sr-only">Supprimer</span>
                        </Button>
                      </div>
                      <CardDescription className="flex items-center gap-2 flex-wrap">
                        <Badge
                          className={FILE_TYPE_STYLES[doc.fileType]}
                          variant="secondary"
                        >
                          <File className="size-3" />
                          {FILE_TYPE_LABELS[doc.fileType]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {SOURCE_TYPE_LABELS[doc.sourceType] ?? doc.sourceType}
                        </span>
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col justify-between gap-3 pt-0">
                      {doc.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {doc.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <Separator />

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Type className="size-3" />
                          {doc.wordCount?.toLocaleString("fr-FR") ?? 0} mots
                        </span>
                        <span className="flex items-center gap-1">
                          <Layers className="size-3" />
                          {doc.chunkCount ?? 0} segments
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {formatDate(doc.createdAt)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
        </TabsContent>

        {/* ─── Tab 2 : Recherche ────────────────────────────────────────── */}
        <TabsContent value="recherche" className="mt-4 space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-1.5">
                  <label className="text-sm font-medium">
                    Recherche intelligente
                  </label>
                  <Input
                    placeholder="Posez une question ou entrez des mots-clés…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch()
                    }}
                  />
                </div>
                <div className="w-full sm:w-28 space-y-1.5">
                  <label className="text-sm font-medium">Résultats</label>
                  <Select value={searchTopK} onValueChange={setSearchTopK}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={searchMutation.isPending}
                  className="gap-1.5 shrink-0"
                >
                  {searchMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Search className="size-4" />
                  )}
                  Chercher
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Search loading */}
          {searchMutation.isPending && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6 space-y-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Search error */}
          {searchMutation.isError && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{searchMutation.error.message}</AlertDescription>
            </Alert>
          )}

          {/* Search results */}
          {searchMutation.isSuccess &&
            searchMutation.data.length > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {searchMutation.data.length} résultat(s) trouvé(s)
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => handleShowContext(searchMutation.data)}
                  >
                    <Sparkles className="size-3.5" />
                    Contexte LLM
                  </Button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {searchMutation.data.map((chunk, idx) => (
                    <Card key={`${chunk.documentId}-${chunk.chunkIndex}-${idx}`}>
                      <CardContent className="pt-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm">
                                {chunk.documentTitle}
                              </span>
                              <Badge variant="outline" className="text-xs gap-1">
                                <Hash className="size-3" />
                                Segment {chunk.chunkIndex}
                              </Badge>
                              <Badge
                                className="text-xs"
                                style={{
                                  backgroundColor: `oklch(${Math.max(0.4, chunk.score * 0.9)} 0.15 ${140 + (1 - chunk.score) * 60})`,
                                  color: chunk.score > 0.5 ? "white" : "black",
                                }}
                              >
                                {(chunk.score * 100).toFixed(1)}%
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {truncate(chunk.content, 300)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <button
                            onClick={() => {
                              const doc = documents.find(
                                (d) => d.id === chunk.documentId
                              )
                              if (doc) {
                                setSearchFilter(doc.title)
                              }
                            }}
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <BookOpen className="size-3" />
                            Voir le document
                            <ChevronRight className="size-3" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}

          {/* Search empty results */}
          {searchMutation.isSuccess &&
            searchMutation.data.length === 0 && (
              <Card className="py-12">
                <CardContent className="flex flex-col items-center justify-center text-center gap-3">
                  <div className="rounded-full bg-muted p-4">
                    <Search className="size-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Aucun résultat</p>
                    <p className="text-muted-foreground text-sm mt-1">
                      Essayez de reformuler votre recherche ou d\'ajouter plus de
                      documents à la base.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

          {/* LLM Context Dialog */}
          <Dialog
            open={contextDialogOpen}
            onOpenChange={setContextDialogOpen}
          >
            <DialogContent className="sm:max-w-2xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Contexte pour l\'IA</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-96">
                <pre className="text-sm whitespace-pre-wrap break-words font-mono leading-relaxed">
                  {selectedContext}
                </pre>
              </ScrollArea>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedContext)
                    toast.success("Contexte copié dans le presse-papiers")
                  }}
                >
                  Copier
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ─── Tab 3 : Statistiques ─────────────────────────────────────── */}
        <TabsContent value="statistiques" className="mt-4 space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2.5">
                    <FileText className="size-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {stats.totalDocs}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Documents
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2.5">
                    <Layers className="size-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {stats.totalChunks}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Segments totaux
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2.5">
                    <Type className="size-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {stats.totalWords.toLocaleString("fr-FR")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Mots au total
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Documents by type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Répartition par type de fichier</CardTitle>
              <CardDescription>
                Nombre de documents pour chaque format
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.totalDocs === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucune donnée disponible.
                </p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {(Object.entries(stats.byType) as [FileType, number][]).map(
                    ([type, count]) => {
                      const pct = Math.round(
                        (count / stats.totalDocs) * 100
                      )
                      return (
                        <div
                          key={type}
                          className="flex items-center gap-2 rounded-lg border p-3 min-w-[140px]"
                        >
                          <Badge className={FILE_TYPE_STYLES[type]} variant="secondary">
                            {FILE_TYPE_LABELS[type]}
                          </Badge>
                          <div className="ml-auto text-right">
                            <p className="text-sm font-semibold">{count}</p>
                            <p className="text-xs text-muted-foreground">
                              {pct}%
                            </p>
                          </div>
                        </div>
                      )
                    }
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Citation stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Statistiques de citations</CardTitle>
              <CardDescription>
                Aperçu des citations dans votre travail
              </CardDescription>
            </CardHeader>
            <CardContent>
              {citationLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-4 w-56" />
                </div>
              ) : citationStats ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-muted p-2.5">
                      <Hash className="size-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {citationStats.totalCitations ?? 0}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Citations au total
                      </p>
                    </div>
                  </div>

                  {citationStats.byStatus &&
                    Object.keys(citationStats.byStatus).length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-sm font-medium mb-2">
                            Par statut
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(
                              citationStats.byStatus as Record<
                                string,
                                number
                              >
                            ).map(([status, count]) => (
                              <Badge key={status} variant="outline">
                                {status} : {count}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                  {citationStats.byChapter &&
                    Object.keys(citationStats.byChapter).length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-sm font-medium mb-2">
                            Par chapitre
                          </p>
                          <div className="max-h-48 overflow-y-auto space-y-1.5">
                            {Object.entries(
                              citationStats.byChapter as Record<
                                string,
                                number
                              >
                            ).map(([chapter, count]) => (
                              <div
                                key={chapter}
                                className="flex items-center justify-between text-sm rounded-md px-3 py-1.5 bg-muted/50"
                              >
                                <span className="flex items-center gap-1.5">
                                  <BookOpen className="size-3.5 text-muted-foreground" />
                                  {chapter}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {count}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Données de citation non disponibles.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
