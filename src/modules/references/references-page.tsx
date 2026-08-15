"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BookOpen,
  Plus,
  Search,
  Download,
  Star,
  Trash2,
  Upload,
  FileUp,
  CheckCircle2,
  Library,
  X,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";

interface Reference {
  id: string;
  type: string;
  authors: string;
  title: string;
  year?: number | null;
  journal?: string | null;
  doi?: string | null;
  keywords?: string | null;
  source?: string | null;
  isFavorite: boolean;
  createdAt: string;
}

const REF_TYPES = [
  // BibTeX
  { value: "article", label: "Article (journal)" },
  { value: "article-journal", label: "Article — journal" },
  { value: "article-magazine", label: "Article — magazine" },
  { value: "article-newspaper", label: "Article — journal (presse)" },
  { value: "book", label: "Livre" },
  { value: "inbook", label: "Chapitre de livre (inbook)" },
  { value: "incollection", label: "Contribution (incollection)" },
  { value: "inproceedings", label: "Communication (inproceedings)" },
  { value: "paper-conference", label: "Article de conférence" },
  { value: "proceedings", label: "Actes de conférence" },
  { value: "phdthesis", label: "Thèse de doctorat" },
  { value: "mastersthesis", label: "Mémoire de master" },
  { value: "techreport", label: "Rapport technique" },
  { value: "report", label: "Rapport" },
  { value: "online", label: "Document en ligne" },
  { value: "webpage", label: "Page web" },
  { value: "web-post", label: "Billet web (blog)" },
  { value: "post-weblog", label: "Article de blog" },
  { value: "blog", label: "Blog (RIS)" },
  { value: "misc", label: "Divers (misc)" },
  { value: "unpublished", label: "Non publié" },
  { value: "manuscript", label: "Manuscrit" },
  { value: "preprint", label: "Pré-publication" },
  { value: "booklet", label: "Brochure (booklet)" },
  { value: "speech", label: "Discours / conférence" },
  // RIS
  { value: "jour", label: "Journal (JOUR)" },
  { value: "jfull", label: "Journal complet (JFULL)" },
  { value: "chap", label: "Chapitre (CHAP)" },
  { value: "thes", label: "Thèse (THES)" },
  { value: "diss", label: "Dissertation (DISS)" },
  { value: "conf", label: "Conférence (CONF)" },
  { value: "cpaper", label: "Article conf. (CPAPER)" },
  { value: "rprt", label: "Rapport (RPRT)" },
  { value: "elec", label: "Électronique (ELEC)" },
  { value: "generic", label: "Générique (GENERIC)" },
  { value: "art", label: "Art (ART)" },
  { value: "mpct", label: "Conférence motion (MPCT)" },
  { value: "hear", label: "Audition (HEAR)" },
  { value: "pamp", label: "Pamphlet (PAMP)" },
  // CSL-JSON
  { value: "entry-dictionary", label: "Entrée dictionnaire" },
  { value: "entry-encyclopedia", label: "Entrée encyclopédie" },
  { value: "dataset", label: "Jeu de données" },
  { value: "interview", label: "Interview" },
  { value: "patent", label: "Brevet" },
  { value: "legislation", label: "Législation" },
  { value: "legal_case", label: "Jurisprudence" },
  { value: "treaty", label: "Traité" },
  { value: "review", label: "Compte-rendu" },
  { value: "review-book", label: "Compte-rendu de livre" },
  { value: "other", label: "Autre" },
];

const SOURCE_LABELS: Record<string, string> = {
  manual: "Manuel",
  mendeley: "Mendeley",
  zotero: "Zotero",
  bibtex: "BibTeX",
  ris: "RIS",
  "csl-json": "CSL-JSON",
  doi: "DOI",
};

const SOURCE_COLORS: Record<string, string> = {
  manual: "bg-muted text-muted-foreground",
  mendeley: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  zotero: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  bibtex: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  ris: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  "csl-json": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  doi: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
};

function fetchReferences(filters: { type?: string; search?: string; source?: string }) {
  const params = new URLSearchParams();
  if (filters.type && filters.type !== "all") params.set("type", filters.type);
  if (filters.search) params.set("search", filters.search);
  if (filters.source && filters.source !== "all") params.set("source", filters.source);
  return fetch(`/api/references?${params}`).then((r) => r.json()).then((j) => j.data as Reference[]);
}

export function ReferencesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const { data: references, isLoading } = useQuery({
    queryKey: ["references", { type: typeFilter, search, source: sourceFilter }],
    queryFn: () => fetchReferences({ type: typeFilter, search, source: sourceFilter }),
  });

  const toggleFavorite = useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
      await fetch(`/api/references/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !isFavorite }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["references"] }),
  });

  const deleteRef = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/references/${id}`, { method: "DELETE" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["references"] }),
  });

  const createRef = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      const payload: Record<string, unknown> = { ...data, source: "manual" };
      if (data.year) payload.year = parseInt(data.year, 10);
      const res = await fetch("/api/references", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["references"] });
      setCreateOpen(false);
    },
  });

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Références bibliographiques
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez vos références, importez depuis Mendeley, Zotero, BibTeX, RIS, CSL-JSON
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" className="gap-2" asChild>
            <a href="/api/references/bibtex" download="references.bib">
              <Download className="h-4 w-4" />
              Export BibTeX
            </a>
          </Button>
          <ImportDialog open={importOpen} onOpenChange={setImportOpen} />
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Nouvelle référence</DialogTitle>
              </DialogHeader>
              <AddReferenceForm
                onSubmit={(data) => createRef.mutate(data)}
                isPending={createRef.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par titre, auteur, mot-clé..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-auto min-w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {REF_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-auto min-w-[140px]">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les sources</SelectItem>
            <SelectItem value="mendeley">Mendeley</SelectItem>
            <SelectItem value="zotero">Zotero</SelectItem>
            <SelectItem value="bibtex">BibTeX</SelectItem>
            <SelectItem value="ris">RIS</SelectItem>
            <SelectItem value="csl-json">CSL-JSON</SelectItem>
            <SelectItem value="manual">Manuel</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 rounded" />
              ))}
            </div>
          ) : references && references.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Auteurs</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead className="w-16">Année</TableHead>
                  <TableHead className="w-20">Type</TableHead>
                  <TableHead className="w-20">Source</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {references.map((ref) => (
                  <TableRow key={ref.id}>
                    <TableCell>
                      <button
                        onClick={() =>
                          toggleFavorite.mutate({ id: ref.id, isFavorite: ref.isFavorite })
                        }
                      >
                        <Star
                          className={`h-4 w-4 ${
                            ref.isFavorite
                              ? "fill-chart-4 text-chart-4"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      </button>
                    </TableCell>
                    <TableCell className="text-xs font-medium max-w-[180px] truncate">
                      {ref.authors}
                    </TableCell>
                    <TableCell className="text-xs max-w-[250px] truncate">
                      {ref.title}
                    </TableCell>
                    <TableCell className="text-xs tabular-nums">
                      {ref.year}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px]">
                        {REF_TYPES.find((t) => t.value === ref.type)?.label || ref.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {ref.source && ref.source !== "manual" ? (
                        <Badge
                          className={`text-[10px] ${SOURCE_COLORS[ref.source] || "bg-muted"}`}
                          variant="outline"
                        >
                          {SOURCE_LABELS[ref.source] || ref.source}
                        </Badge>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => deleteRef.mutate(ref.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Library className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <h3 className="text-sm font-medium">Aucune référence</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-[300px]">
                {search
                  ? "Aucun résultat pour cette recherche"
                  : "Ajoutez vos références manuellement ou importez-les depuis Mendeley, Zotero, BibTeX, RIS ou CSL-JSON"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import Info Banner */}
      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <FileUp className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <h3 className="text-sm font-medium">Import de références</h3>
              <p className="text-xs text-muted-foreground">
                Importez vos références depuis votre gestionnaire bibliographique préféré.{" "}
                <strong>Mendeley</strong>, <strong>Zotero</strong>, <strong>EndNote</strong>, <strong>JabRef</strong> — tous sont compatibles via les formats BibTeX, RIS ou CSL-JSON.
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                <Badge variant="outline" className="text-[10px] gap-1">
                  <span className="h-2 w-2 rounded-full bg-red-400" /> Mendeley
                </Badge>
                <Badge variant="outline" className="text-[10px] gap-1">
                  <span className="h-2 w-2 rounded-full bg-orange-400" /> Zotero
                </Badge>
                <Badge variant="outline" className="text-[10px] gap-1">
                  <span className="h-2 w-2 rounded-full bg-blue-400" /> BibTeX
                </Badge>
                <Badge variant="outline" className="text-[10px] gap-1">
                  <span className="h-2 w-2 rounded-full bg-purple-400" /> RIS
                </Badge>
                <Badge variant="outline" className="text-[10px] gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" /> CSL-JSON
                </Badge>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5"
              onClick={() => setImportOpen(true)}
            >
              <Upload className="h-3.5 w-3.5" />
              Importer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════
// Import Dialog
// ═══════════════════════════════════════

function ImportDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>("auto");
  const [preview, setPreview] = useState<string>("");
  const [importResult, setImportResult] = useState<{
    total: number;
    imported: number;
    skipped: number;
    format: string;
  } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const importMutation = useMutation({
    mutationFn: async ({ file, format }: { file: File; format: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      if (format && format !== "auto") formData.append("format", format);

      const res = await fetch("/api/references/import", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur d'import");
      }
      const json = await res.json();
      return json.data;
    },
    onSuccess: (data) => {
      setImportResult(data);
      queryClient.invalidateQueries({ queryKey: ["references"] });
      toast.success(`${data.imported} référence(s) importée(s)`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setImportResult(null);
    // Read file content for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      // Show first 500 chars as preview
      setPreview(content.substring(0, 500) + (content.length > 500 ? "..." : ""));
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleImport = useCallback(() => {
    if (!selectedFile) return;
    importMutation.mutate({ file: selectedFile, format: selectedFormat });
  }, [selectedFile, selectedFormat, importMutation]);

  const handleClose = useCallback(() => {
    setSelectedFile(null);
    setPreview("");
    setImportResult(null);
    importMutation.reset();
    if (fileInputRef.current) fileInputRef.current.value = "";
    onOpenChange(false);
  }, [onOpenChange, importMutation]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Importer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importer des références
          </DialogTitle>
          <DialogDescription>
            Importez vos références depuis Mendeley, Zotero, BibTeX, RIS ou CSL-JSON
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 overflow-y-auto flex-1">
          {/* Format selection */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Format du fichier</label>
            <Select value={selectedFormat} onValueChange={setSelectedFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto-détection</SelectItem>
                <SelectItem value="bibtex">BibTeX (.bib)</SelectItem>
                <SelectItem value="ris">RIS (.ris)</SelectItem>
                <SelectItem value="csl-json">CSL-JSON (.json)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Drop zone */}
          {!importResult && (
            <div
              className={`relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer ${
                dragOver
                  ? "border-primary bg-primary/5"
                  : selectedFile
                    ? "border-primary/50 bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
            >
              {selectedFile ? (
                <>
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                  <div className="text-center">
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} Ko
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setPreview("");
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground/50" />
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      Glissez-déposez votre fichier ici
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ou cliquez pour parcourir
                    </p>
                  </div>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".bib,.ris,.json,.bibtex"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
            </div>
          )}

          {/* Preview */}
          {preview && !importResult && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Aperçu</label>
              <div className="rounded-lg border bg-muted/30 p-3 max-h-[200px] overflow-y-auto">
                <pre className="text-[10px] font-mono whitespace-pre-wrap break-all text-muted-foreground">
                  {preview}
                </pre>
              </div>
            </div>
          )}

          {/* Import result */}
          {importResult && (
            <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-chart-2" />
                <span className="text-sm font-medium">Import terminé</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-background">
                  <span className="text-lg font-bold">{importResult.total}</span>
                  <span className="text-[10px] text-muted-foreground">Total</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-chart-2/10">
                  <span className="text-lg font-bold text-chart-2">{importResult.imported}</span>
                  <span className="text-[10px] text-muted-foreground">Importées</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-chart-4/10">
                  <span className="text-lg font-bold text-chart-4">{importResult.skipped}</span>
                  <span className="text-[10px] text-muted-foreground">Ignorées</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Format détecté : <strong>{importResult.format.toUpperCase()}</strong>
              </p>
            </div>
          )}

          {/* Tool tips */}
          {!importResult && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-muted-foreground">
                Comment exporter depuis votre gestionnaire :
              </label>
              <div className="grid gap-2">
                <ToolTip
                  tool="Mendeley"
                  color="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  steps="File → Export → Format BibTeX ou RIS"
                />
                <ToolTip
                  tool="Zotero"
                  color="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                  steps="File → Export Library → BibTeX, RIS, ou CSL-JSON"
                />
                <ToolTip
                  tool="EndNote"
                  color="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  steps="File → Export → Format RIS"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {importResult ? (
            <Button onClick={handleClose}>Terminé</Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button
                onClick={handleImport}
                disabled={!selectedFile || importMutation.isPending}
                className="gap-2"
              >
                {importMutation.isPending ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Import en cours...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Importer
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ToolTip({
  tool,
  color,
  steps,
}: {
  tool: string;
  color: string;
  steps: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border p-2">
      <Badge className={`text-[10px] shrink-0 ${color}`} variant="outline">
        {tool}
      </Badge>
      <span className="text-[10px] text-muted-foreground">{steps}</span>
    </div>
  );
}

// ═══════════════════════════════════════
// Add Reference Form
// ═══════════════════════════════════════

function AddReferenceForm({
  onSubmit,
  isPending,
}: {
  onSubmit: (data: Record<string, string>) => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState({
    type: "article",
    authors: "",
    title: "",
    year: "",
    journal: "",
    doi: "",
    keywords: "",
    notes: "",
  });

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium">Type *</label>
        <Select value={form.type} onValueChange={(v) => handleChange("type", v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REF_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Auteurs * (séparés par ;)</label>
        <Input
          placeholder="Dupont, J.; Martin, A."
          value={form.authors}
          onChange={(e) => handleChange("authors", e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Titre *</label>
        <Input
          placeholder="Titre de l'ouvrage"
          value={form.title}
          onChange={(e) => handleChange("title", e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Année</label>
          <Input
            placeholder="2024"
            value={form.year}
            onChange={(e) => handleChange("year", e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Journal / Éditeur</label>
          <Input
            placeholder="Nature, Elsevier..."
            value={form.journal}
            onChange={(e) => handleChange("journal", e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium">DOI</label>
          <Input
            placeholder="10.1234/example"
            value={form.doi}
            onChange={(e) => handleChange("doi", e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Mots-clés (séparés par ,)</label>
          <Input
            placeholder="urbanisme, durabilité"
            value={form.keywords}
            onChange={(e) => handleChange("keywords", e.target.value)}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Notes</label>
        <Textarea
          placeholder="Notes personnelles sur cette référence..."
          value={form.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          rows={2}
          className="resize-none"
        />
      </div>
      <DialogFooter>
        <Button
          onClick={() => onSubmit(form)}
          disabled={!form.authors.trim() || !form.title.trim() || isPending}
        >
          {isPending ? "Ajout..." : "Ajouter"}
        </Button>
      </DialogFooter>
    </div>
  );
}
