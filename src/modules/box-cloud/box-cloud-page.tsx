"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Folder,
  File,
  FileText,
  ImageIcon,
  Upload,
  Search,
  Grid3X3,
  List,
  MoreHorizontal,
  Pencil,
  Trash2,
  FolderPlus,
  Clock,
  HardDrive,
  FileCode2,
  Database,
  BookOpen,
  ChevronRight,
  X,
  Check,
} from "lucide-react";
import { toast } from "sonner";

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

type FileCategory = "Documents" | "Images" | "Données" | "Code" | "Références";

type FileType = "folder" | "document" | "image" | "data" | "code" | "reference";

interface CloudFile {
  id: string;
  name: string;
  type: FileType;
  category: FileCategory;
  size: number;
  date: string;
  parentId: string | null;
  extension: string;
}

interface FolderItem {
  id: string;
  name: string;
  parentId: string | null;
}

interface CategoryStats {
  label: string;
  category: FileCategory;
  totalSize: number;
  fileCount: number;
  color: string;
}

// ═══════════════════════════════════════
// Helpers
// ═══════════════════════════════════════

const CATEGORY_CONFIG: Record<FileCategory, { color: string; bgClass: string; textClass: string }> = {
  Documents: { color: "#059669", bgClass: "bg-emerald-100 dark:bg-emerald-950", textClass: "text-emerald-700 dark:text-emerald-300" },
  Images: { color: "#d97706", bgClass: "bg-amber-100 dark:bg-amber-950", textClass: "text-amber-700 dark:text-amber-300" },
  Données: { color: "#dc2626", bgClass: "bg-red-100 dark:bg-red-950", textClass: "text-red-700 dark:text-red-300" },
  Code: { color: "#7c3aed", bgClass: "bg-violet-100 dark:bg-violet-950", textClass: "text-violet-700 dark:text-violet-300" },
  Références: { color: "#0891b2", bgClass: "bg-cyan-100 dark:bg-cyan-950", textClass: "text-cyan-700 dark:text-cyan-300" },
};

const TOTAL_STORAGE_GB = 10;
const TOTAL_STORAGE_BYTES = TOTAL_STORAGE_GB * 1024 * 1024 * 1024;

function categorizeByExtension(ext: string): { category: FileCategory; type: FileType } {
  const lower = ext.toLowerCase();
  if (["doc", "docx", "pdf", "odt", "rtf", "txt", "tex", "md"].includes(lower)) {
    return { category: "Documents", type: "document" };
  }
  if (["png", "jpg", "jpeg", "gif", "svg", "webp", "bmp"].includes(lower)) {
    return { category: "Images", type: "image" };
  }
  if (["csv", "xlsx", "xls", "json", "xml", "tsv", "sav", "rds"].includes(lower)) {
    return { category: "Données", type: "data" };
  }
  if (["py", "r", "js", "ts", "java", "cpp", "c", "html", "css", "sql", "ipynb"].includes(lower)) {
    return { category: "Code", type: "code" };
  }
  return { category: "Références", type: "reference" };
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 o";
  const units = ["o", "Ko", "Mo", "Go"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = bytes / Math.pow(k, i);
  return `${val.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function generateId(): string {
  return `f-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getFileIcon(type: FileType) {
  switch (type) {
    case "folder": return <Folder className="h-5 w-5 text-amber-500" />;
    case "image": return <ImageIcon className="h-5 w-5 text-amber-600" />;
    case "data": return <Database className="h-5 w-5 text-red-500" />;
    case "code": return <FileCode2 className="h-5 w-5 text-violet-600" />;
    case "reference": return <BookOpen className="h-5 w-5 text-cyan-600" />;
    default: return <FileText className="h-5 w-5 text-emerald-600" />;
  }
}

// ═══════════════════════════════════════
// Initial data
// ═══════════════════════════════════════

const INITIAL_FOLDERS: FolderItem[] = [
  { id: "folder-1", name: "Chapitres de thèse", parentId: null },
  { id: "folder-2", name: "Articles", parentId: null },
  { id: "folder-3", name: "Données d\u2019enquête", parentId: null },
  { id: "folder-4", name: "Code d\u2019analyse", parentId: null },
  { id: "folder-5", name: "Bibliographie", parentId: null },
  { id: "folder-1a", name: "Introduction", parentId: "folder-1" },
  { id: "folder-1b", name: "Cadre théorique", parentId: "folder-1" },
  { id: "folder-2a", name: "Soumissions", parentId: "folder-2" },
];

const INITIAL_FILES: CloudFile[] = [
  { id: "file-1", name: "Introduction_générale.docx", type: "document", category: "Documents", size: 245_760, date: "2025-01-15T10:30:00", parentId: "folder-1a", extension: "docx" },
  { id: "file-2", name: "Revue_littérature.pdf", type: "document", category: "Documents", size: 1_572_864, date: "2025-02-20T14:15:00", parentId: "folder-1b", extension: "pdf" },
  { id: "file-3", name: "cadre_theorique.tex", type: "document", category: "Documents", size: 89_600, date: "2025-03-05T09:00:00", parentId: "folder-1b", extension: "tex" },
  { id: "file-4", name: "donnees_enquete.csv", type: "data", category: "Données", size: 5_242_880, date: "2025-03-10T16:45:00", parentId: "folder-3", extension: "csv" },
  { id: "file-5", name: "analyse_pca.py", type: "code", category: "Code", size: 15_360, date: "2025-03-12T11:20:00", parentId: "folder-4", extension: "py" },
  { id: "file-6", name: "visualisation.R", type: "code", category: "Code", size: 8_192, date: "2025-03-14T08:30:00", parentId: "folder-4", extension: "r" },
  { id: "file-7", name: "figure_methodologie.png", type: "image", category: "Images", size: 3_145_728, date: "2025-03-15T13:00:00", parentId: null, extension: "png" },
  { id: "file-8", name: "article_soumis.pdf", type: "reference", category: "Références", size: 2_097_152, date: "2025-03-18T15:30:00", parentId: "folder-2a", extension: "pdf" },
  { id: "file-9", name: "biblio_complete.bib", type: "reference", category: "Références", size: 419_430, date: "2025-03-20T10:00:00", parentId: "folder-5", extension: "bib" },
  { id: "file-10", name: "résultats_enquête.xlsx", type: "data", category: "Données", size: 3_145_728, date: "2025-03-22T09:15:00", parentId: "folder-3", extension: "xlsx" },
  { id: "file-11", name: "protocole_expérience.md", type: "document", category: "Documents", size: 32_768, date: "2025-03-25T14:00:00", parentId: null, extension: "md" },
  { id: "file-12", name: "diagramme_architecture.svg", type: "image", category: "Images", size: 156_672, date: "2025-03-26T11:45:00", parentId: null, extension: "svg" },
];

// ═══════════════════════════════════════
// Component
// ═══════════════════════════════════════

export function BoxCloudPage() {
  // ── State ──
  const [files, setFiles] = useState<CloudFile[]>(INITIAL_FILES);
  const [folders, setFolders] = useState<FolderItem[]>(INITIAL_FOLDERS);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [uploadName, setUploadName] = useState("");

  // ── Computed ──
  const currentFolders = useMemo(
    () => folders.filter((f) => f.parentId === currentFolderId),
    [folders, currentFolderId]
  );

  const currentFiles = useMemo(() => {
    let filtered = files.filter((f) => f.parentId === currentFolderId);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = files.filter((f) => f.name.toLowerCase().includes(q));
    }
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [files, currentFolderId, searchQuery]);

  const recentFiles = useMemo(
    () => [...files].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5),
    [files]
  );

  const totalUsed = useMemo(() => files.reduce((s, f) => s + f.size, 0), [files]);
  const usagePercent = useMemo(() => Math.min((totalUsed / TOTAL_STORAGE_BYTES) * 100, 100), [totalUsed]);

  const categoryStats = useMemo((): CategoryStats[] => {
 const cats: FileCategory[] = ["Documents", "Images", "Données", "Code", "Références"];
    return cats.map((cat) => {
      const catFiles = files.filter((f) => f.category === cat);
      return {
        label: cat,
        category: cat,
        totalSize: catFiles.reduce((s, f) => s + f.size, 0),
        fileCount: catFiles.length,
        color: CATEGORY_CONFIG[cat].color,
      };
    });
  }, [files]);

  const breadcrumbPath = useMemo(() => {
    const path: { id: string | null; name: string }[] = [{ id: null, name: "Racine" }];
    let pid = currentFolderId;
    while (pid) {
      const f = folders.find((fo) => fo.id === pid);
      if (f) {
        path.unshift({ id: f.id, name: f.name });
        pid = f.parentId;
      } else break;
    }
    return path;
  }, [currentFolderId, folders]);

  // ── Handlers ──
  const handleUpload = useCallback(() => {
    if (!uploadName.trim()) {
      toast.error("Veuillez entrer un nom de fichier");
      return;
    }
    setIsUploading(true);
    const dotIdx = uploadName.lastIndexOf(".");
    const ext = dotIdx > 0 ? uploadName.slice(dotIdx + 1) : "docx";
    const { category, type } = categorizeByExtension(ext);
    const simulatedSize = Math.floor(Math.random() * 4_000_000) + 50_000;

    setTimeout(() => {
      const newFile: CloudFile = {
        id: generateId(),
        name: uploadName.trim(),
        type,
        category,
        size: simulatedSize,
        date: new Date().toISOString(),
        parentId: currentFolderId,
        extension: ext,
      };
      setFiles((prev) => [...prev, newFile]);
      setIsUploading(false);
      setUploadName("");
      toast.success(`Fichier « ${newFile.name} » téléversé avec succès`);
    }, 800);
  }, [uploadName, currentFolderId]);

  const handleCreateFolder = useCallback(() => {
    if (!newFolderName.trim()) {
      toast.error("Veuillez entrer un nom de dossier");
      return;
    }
    const exists = folders.some(
      (f) => f.name.toLowerCase() === newFolderName.trim().toLowerCase() && f.parentId === currentFolderId
    );
    if (exists) {
      toast.error("Un dossier avec ce nom existe déjà");
      return;
    }
    const newFolder: FolderItem = {
      id: `folder-${Date.now()}`,
      name: newFolderName.trim(),
      parentId: currentFolderId,
    };
    setFolders((prev) => [...prev, newFolder]);
    setNewFolderName("");
    setIsCreatingFolder(false);
    toast.success(`Dossier « ${newFolder.name} » créé`);
  }, [newFolderName, currentFolderId, folders]);

  const handleDeleteFolder = useCallback(
    (folderId: string) => {
      const folder = folders.find((f) => f.id === folderId);
      if (!folder) return;
      const childFolderIds = new Set<string>();
      const collectChildFolders = (pid: string) => {
        childFolderIds.add(pid);
        folders.filter((f) => f.parentId === pid).forEach((f) => collectChildFolders(f.id));
      };
      collectChildFolders(folderId);
      setFolders((prev) => prev.filter((f) => !childFolderIds.has(f.id)));
      setFiles((prev) => prev.filter((f) => !childFolderIds.has(f.parentId || "")));
      toast.success(`Dossier « ${folder.name} » supprimé`);
    },
    [folders]
  );

  const handleRenameFolder = useCallback(
    (folderId: string) => {
      if (!renameValue.trim()) {
        toast.error("Veuillez entrer un nom");
        return;
      }
      setFolders((prev) =>
        prev.map((f) => (f.id === folderId ? { ...f, name: renameValue.trim() } : f))
      );
      setRenamingFolderId(null);
      setRenameValue("");
      toast.success("Dossier renommé");
    },
    [renameValue]
  );

  const handleDeleteFile = useCallback((fileId: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === fileId);
      if (file) toast.success(`Fichier « ${file.name} » supprimé`);
      return prev.filter((f) => f.id !== fileId);
    });
  }, []);

  const navigateToFolder = useCallback((folderId: string | null) => {
 setCurrentFolderId(folderId);
    setSearchQuery("");
  }, []);

  // ── Render ──
  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Box Cloud</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Stockage cloud simulé pour vos fichiers de thèse
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          >
            {viewMode === "grid" ? <List className="h-4 w-4 mr-1.5" /> : <Grid3X3 className="h-4 w-4 mr-1.5" />}
            {viewMode === "grid" ? "Liste" : "Grille"}
          </Button>
        </div>
      </div>

      {/* Storage stats + Recent files row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Storage overview */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-emerald-600" />
              Stockage utilisé
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end justify-between text-sm">
              <span className="font-medium">{formatSize(totalUsed)}</span>
              <span className="text-muted-foreground">sur {TOTAL_STORAGE_GB} Go</span>
            </div>
            <Progress value={usagePercent} className="h-3" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {categoryStats.map((cat) => {
                const catPercent = totalUsed > 0 ? (cat.totalSize / TOTAL_STORAGE_BYTES) * 100 : 0;
                return (
                  <div key={cat.category} className="flex items-center gap-3">
                    <div
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium truncate">{cat.label}</span>
                        <span className="text-muted-foreground shrink-0 ml-2">
                          {cat.fileCount} fichier{cat.fileCount !== 1 ? "s" : ""} · {formatSize(cat.totalSize)}
                        </span>
                      </div>
                      <Progress value={catPercent} className="h-1.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent files */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              Fichiers récents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
              {recentFiles.map((file) => (
                <button
                  key={file.id}
                  className="w-full flex items-center gap-2.5 p-2 rounded-md hover:bg-muted/60 transition-colors text-left"
                  onClick={() => {
                    if (file.parentId) navigateToFolder(file.parentId);
                  }}
                >
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(file.date)}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{formatSize(file.size)}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1 text-sm flex-1 min-w-0 overflow-x-auto">
          {breadcrumbPath.map((crumb, i) => (
            <span key={crumb.id ?? "root"} className="flex items-center gap-1 shrink-0">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
              <button
                className={`hover:underline ${crumb.id === currentFolderId ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                onClick={() => navigateToFolder(crumb.id)}
              >
                {i === 0 ? <Folder className="h-3.5 w-3.5 inline mr-0.5" /> : null}
                {crumb.name}
              </button>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Rechercher un fichier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 w-52"
            />
            {searchQuery && (
              <button
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsCreatingFolder(true)}>
            <FolderPlus className="h-4 w-4 mr-1.5" />
            Dossier
          </Button>
        </div>
      </div>

      {/* New folder input */}
      {isCreatingFolder && (
        <Card className="border-dashed border-2 border-amber-400/50 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="p-4 flex items-center gap-2">
            <Folder className="h-5 w-5 text-amber-500 shrink-0" />
            <Input
              placeholder="Nom du nouveau dossier"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateFolder();
                if (e.key === "Escape") { setIsCreatingFolder(false); setNewFolderName(""); }
              }}
              className="h-9"
              autoFocus
            />
            <Button size="sm" onClick={handleCreateFolder}>
              <Check className="h-4 w-4 mr-1" />
              Créer
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => { setIsCreatingFolder(false); setNewFolderName(""); }}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* File content area */}
      <div className="flex-1">
        {viewMode === "list" ? (
          <Card>
            {/* List header */}
            <div className="flex items-center px-4 py-2.5 text-xs font-medium text-muted-foreground border-b">
              <div className="flex-1 min-w-0">Nom</div>
              <div className="w-28 text-right hidden sm:block">Catégorie</div>
              <div className="w-20 text-right hidden sm:block">Taille</div>
              <div className="w-28 text-right hidden md:block">Date</div>
              <div className="w-10" />
            </div>

            {/* Folders */}
            {currentFolders.length > 0 && (
              <div className="divide-y">
                {currentFolders.map((folder) => (
                  <div
                    key={folder.id}
                    className="flex items-center px-4 py-2.5 hover:bg-muted/50 transition-colors group"
                  >
                    {renamingFolderId === folder.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Folder className="h-5 w-5 text-amber-500 shrink-0" />
                        <Input
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRenameFolder(folder.id);
                            if (e.key === "Escape") { setRenamingFolderId(null); setRenameValue(""); }
                          }}
                          className="h-8"
                          autoFocus
                        />
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleRenameFolder(folder.id)}>
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => { setRenamingFolderId(null); setRenameValue(""); }}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <button
                          className="flex items-center gap-3 flex-1 min-w-0 text-left"
                          onClick={() => navigateToFolder(folder.id)}
                        >
                          <Folder className="h-5 w-5 text-amber-500 shrink-0" />
                          <span className="text-sm font-medium truncate">{folder.name}</span>
                          <Badge variant="secondary" className="text-xs shrink-0 hidden sm:inline-flex">
                            {folders.filter((f) => f.parentId === folder.id).length +
                              files.filter((f) => f.parentId === folder.id).length}
                          </Badge>
                        </button>
                        <div className="w-28 hidden sm:block" />
                        <div className="w-20 hidden sm:block" />
                        <div className="w-28 hidden md:block" />
                        <div className="w-10">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setRenamingFolderId(folder.id); setRenameValue(folder.name); }}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Renommer
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => handleDeleteFolder(folder.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Files */}
            {currentFiles.length > 0 && (
              <div className="divide-y">
                {currentFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center px-4 py-2.5 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getFileIcon(file.type)}
                      <span className="text-sm truncate">{file.name}</span>
                    </div>
                    <div className="w-28 text-right hidden sm:block">
                      <Badge
                        variant="secondary"
                        className={`${CATEGORY_CONFIG[file.category].bgClass} ${CATEGORY_CONFIG[file.category].textClass} text-xs`}
                      >
                        {file.category}
                      </Badge>
                    </div>
                    <div className="w-20 text-right text-sm text-muted-foreground hidden sm:block">
                      {formatSize(file.size)}
                    </div>
                    <div className="w-28 text-right text-sm text-muted-foreground hidden md:block">
                      {formatDate(file.date)}
                    </div>
                    <div className="w-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => handleDeleteFile(file.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {currentFolders.length === 0 && currentFiles.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <File className="h-12 w-12 text-muted-foreground/40 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">
                  {searchQuery
                    ? `Aucun fichier trouvé pour « ${searchQuery} »`
                    : "Ce dossier est vide"}
                </p>
                {!searchQuery && (
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Téléversez un fichier ou créez un dossier
                  </p>
                )}
              </div>
            )}
          </Card>
        ) : (
          /* Grid view */
          <>
            {/* Folders grid */}
            {currentFolders.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
                {currentFolders.map((folder) => (
                  <div key={folder.id} className="group relative">
                    {renamingFolderId === folder.id ? (
                      <Card className="border-dashed border-2 border-amber-400/50">
                        <CardContent className="p-3 flex flex-col gap-2">
                          <Folder className="h-8 w-8 text-amber-500 mx-auto" />
                          <Input
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleRenameFolder(folder.id);
                              if (e.key === "Escape") { setRenamingFolderId(null); setRenameValue(""); }
                            }}
                            className="h-7 text-xs"
                            autoFocus
                          />
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-6 flex-1 text-xs" onClick={() => handleRenameFolder(folder.id)}>
                              <Check className="h-3 w-3 mr-1" /> OK
                            </Button>
                            <Button size="sm" variant="ghost" className="h-6 flex-1 text-xs" onClick={() => { setRenamingFolderId(null); setRenameValue(""); }}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => navigateToFolder(folder.id)}
                      >
                        <CardContent className="p-3 flex flex-col items-center text-center gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="absolute top-1.5 right-1.5 h-6 w-6 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-muted transition-all">
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setRenamingFolderId(folder.id); setRenameValue(folder.name); }}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Renommer
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Folder className="h-10 w-10 text-amber-500" />
                          <p className="text-xs font-medium truncate w-full">{folder.name}</p>
                          <Badge variant="secondary" className="text-[10px]">
                            {folders.filter((f) => f.parentId === folder.id).length +
                              files.filter((f) => f.parentId === folder.id).length} éléments
                          </Badge>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Files grid */}
            {currentFiles.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {currentFiles.map((file) => (
                  <Card key={file.id} className="group relative hover:shadow-md transition-shadow">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="absolute top-1.5 right-1.5 z-10 h-6 w-6 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-muted transition-all">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => handleDeleteFile(file.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <CardContent className="p-3 flex flex-col items-center text-center gap-2">
                      <div className={`${CATEGORY_CONFIG[file.category].bgClass} rounded-lg p-3`}>
                        {getFileIcon(file.type)}
                      </div>
                      <p className="text-xs font-medium truncate w-full">{file.name}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>{formatSize(file.size)}</span>
                        <span>·</span>
                        <span>{formatDate(file.date)}</span>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`${CATEGORY_CONFIG[file.category].bgClass} ${CATEGORY_CONFIG[file.category].textClass} text-[10px]`}
                      >
                        {file.category}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty state grid */}
            {currentFolders.length === 0 && currentFiles.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <File className="h-12 w-12 text-muted-foreground/40 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">
                  {searchQuery
                    ? `Aucun fichier trouvé pour « ${searchQuery} »`
                    : "Ce dossier est vide"}
                </p>
                {!searchQuery && (
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Téléversez un fichier ou créez un dossier
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <Separator />

      {/* Upload area */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Upload className="h-4 w-4 text-emerald-600" />
            Téléverser un fichier
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="nom-du-fichier.pdf"
              value={uploadName}
              onChange={(e) => setUploadName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleUpload();
              }}
              className="h-9 flex-1"
            />
            <Button onClick={handleUpload} disabled={isUploading || !uploadName.trim()}>
              {isUploading ? (
                <>
                  <Upload className="h-4 w-4 mr-1.5 animate-pulse" />
                  Téléversement...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-1.5" />
                  Téléverser
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Saisissez un nom de fichier avec son extension (ex : rapport.pdf, donnees.csv, script.py). Le fichier sera classé automatiquement par catégorie.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
