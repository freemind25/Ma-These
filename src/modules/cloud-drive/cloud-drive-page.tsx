"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Cloud,
  FolderOpen,
  File,
  Upload,
  Download,
  RefreshCw,
  Link2,
  Unlink,
  AlertCircle,
  CheckCircle2,
  HardDrive,
  ChevronRight,
  Save,
  Clock,
  Settings2,
  Copy,
  Search,
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// ── Types ──────────────────────────────────────────────────────────────────

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  modifiedTime: string;
  isFolder: boolean;
}

interface DriveStatus {
  connected: boolean;
  email?: string;
}

interface BackupEntry {
  id: string;
  fileName: string;
  thesisName: string;
  size: string;
  date: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function getFileBadgeColor(mimeType: string): string {
  if (mimeType.includes("pdf")) return "bg-red-500/10 text-red-700 dark:text-red-400";
  if (mimeType.includes("word") || mimeType.includes("document"))
    return "bg-sky-500/10 text-sky-700 dark:text-sky-400";
  if (mimeType.includes("sheet") || mimeType.includes("excel"))
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
  if (mimeType.includes("presentation") || mimeType.includes("slides"))
    return "bg-amber-500/10 text-amber-700 dark:text-amber-400";
  if (mimeType.includes("image")) return "bg-purple-500/10 text-purple-700 dark:text-purple-400";
  if (mimeType.includes("text")) return "bg-stone-500/10 text-stone-700 dark:text-stone-400";
  return "bg-muted text-muted-foreground";
}

function getFileBadgeLabel(mimeType: string): string {
  if (mimeType.includes("pdf")) return "PDF";
  if (mimeType.includes("word") || mimeType.includes("document")) return "DOCX";
  if (mimeType.includes("sheet") || mimeType.includes("excel")) return "XLSX";
  if (mimeType.includes("presentation") || mimeType.includes("slides")) return "PPTX";
  if (mimeType.includes("image")) return "Image";
  if (mimeType.includes("text")) return "Texte";
  return mimeType.split("/").pop()?.toUpperCase() ?? "Fichier";
}

// ── Connection Status Card ─────────────────────────────────────────────────

function ConnectionStatusCard({
  status,
  isLoading,
}: {
  status: DriveStatus | undefined;
  isLoading: boolean;
}) {
  const isConnected = status?.connected ?? false;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                isConnected
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {isConnected ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Cloud className="h-5 w-5" />
              )}
            </div>
            <div>
              <CardTitle className="text-base">
                Google Drive
                {isConnected && (
                  <Badge
                    variant="outline"
                    className="ml-2 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  >
                    Connecté
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {isConnected
                  ? `Connecté en tant que ${status?.email}`
                  : "Non connecté — reliez votre compte Google Drive pour sauvegarder votre thèse"}
              </CardDescription>
            </div>
          </div>

          {isConnected ? (
            <Button variant="outline" size="sm" asChild>
              <a href="/api/cloud-drive/disconnect">
                <Unlink className="mr-2 h-4 w-4" />
                Déconnecter
              </a>
            </Button>
          ) : (
            <Button size="sm" asChild>
              <a href="/api/cloud-drive/connect">
                <Link2 className="mr-2 h-4 w-4" />
                Connecter Google Drive
              </a>
            </Button>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}

// ── Files Tab ──────────────────────────────────────────────────────────────

function FilesTab() {
  const [currentPath, setCurrentPath] = useState<string[]>(["Ma thèse"]);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: files, isLoading, isError, refetch, isFetching } = useQuery<{
    files: DriveFile[];
  }>({
    queryKey: ["cloud-drive-files", currentPath.join("/")],
    queryFn: () =>
      fetch(
        `/api/cloud-drive/files?path=${encodeURIComponent(currentPath.join("/"))}`,
      ).then((r) => r.json()),
    enabled: true,
  });

  function navigateTo(index: number) {
    setCurrentPath((prev) => prev.slice(0, index + 1));
  }

  function navigateIntoFolder(name: string) {
    setCurrentPath((prev) => [...prev, name]);
  }

  const folderItems = useMemo(() => {
    const folders = files?.files.filter((f) => f.isFolder) ?? [];
    return searchQuery
      ? folders.filter((f) =>
          f.name.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : folders;
  }, [files?.files, searchQuery]);

  const fileItems = useMemo(() => {
    const nonFolders = files?.files.filter((f) => !f.isFolder) ?? [];
    return searchQuery
      ? nonFolders.filter((f) =>
          f.name.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : nonFolders;
  }, [files?.files, searchQuery]);

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumb navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          {currentPath.map((segment, idx) => (
            <span key={idx} className="flex items-center gap-1.5">
              {idx > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {idx < currentPath.length - 1 ? (
                  <BreadcrumbLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateTo(idx);
                    }}
                  >
                    {segment}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{segment}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </span>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Search & action bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un fichier…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <p className="hidden text-sm text-muted-foreground sm:inline">
            {isLoading
              ? "Chargement…"
              : `${files?.files.length ?? 0} élément(s)`}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            Actualiser
          </Button>
          <Button variant="outline" size="sm" disabled>
            <Upload className="mr-2 h-4 w-4" />
            Importer
          </Button>
        </div>
      </div>

      <Separator />

      {/* File list */}
      {isError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur de chargement</AlertTitle>
          <AlertDescription>
            Impossible de récupérer les fichiers depuis Google Drive. Vérifiez
            votre connexion et réessayez.
          </AlertDescription>
        </Alert>
      ) : isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-lg border p-4"
            >
              <Skeleton className="h-10 w-10 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-8" />
            </div>
          ))}
        </div>
      ) : files && files.files.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FolderOpen className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">
              Ce dossier est vide
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Importez des fichiers ou naviguez vers un autre dossier
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="max-h-96">
          <div className="flex flex-col gap-1">
            {/* Folders first */}
            {folderItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-lg border px-4 py-3 transition-colors hover:bg-muted/50 cursor-pointer"
                onClick={() => navigateIntoFolder(item.name)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") navigateIntoFolder(item.name);
                }}
                role="button"
                tabIndex={0}
              >
                <FolderOpen className="h-10 w-10 shrink-0 text-amber-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Dossier • {formatDate(item.modifiedTime)}
                  </p>
                </div>
                <Badge variant="outline">Dossier</Badge>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </div>
            ))}

            {/* Then files */}
            {fileItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-lg border px-4 py-3 transition-colors hover:bg-muted/50"
              >
                <File className="h-10 w-10 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(item.modifiedTime)}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={getFileBadgeColor(item.mimeType)}
                >
                  {getFileBadgeLabel(item.mimeType)}
                </Badge>
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  {item.size}
                </span>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Télécharger {item.name}</span>
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

// ── Backup Tab ─────────────────────────────────────────────────────────────

function BackupTab() {
  const [autoBackup, setAutoBackup] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);

  // Mock backup data — in production this would come from /api/cloud-drive/backups
  const backups: BackupEntry[] = [
    {
      id: "1",
      fileName: "these_complete_2025-01-15.pdf",
      thesisName: "L\u2019impact du numérique sur les pratiques pédagogiques",
      size: "2.4 Mo",
      date: "2025-01-15T14:30:00Z",
    },
    {
      id: "2",
      fileName: "these_complete_2025-01-10.pdf",
      thesisName: "L\u2019impact du numérique sur les pratiques pédagogiques",
      size: "2.3 Mo",
      date: "2025-01-10T09:15:00Z",
    },
    {
      id: "3",
      fileName: "these_draft_2025-01-05.docx",
      thesisName: "L\u2019impact du numérique sur les pratiques pédagogiques",
      size: "1.8 Mo",
      date: "2025-01-05T16:45:00Z",
    },
  ];

  async function handleBackup() {
    setIsBackingUp(true);
    try {
      await fetch("/api/cloud-drive/backup", { method: "POST" });
    } catch {
      // placeholder
    } finally {
      setTimeout(() => setIsBackingUp(false), 2000);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Backup action card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-base">
                Sauvegarde de la thèse
              </CardTitle>
              <CardDescription>
                Exportez et sauvegardez votre thèse complète sur Google Drive au
                format PDF.
              </CardDescription>
            </div>
            <Button
              onClick={handleBackup}
              disabled={isBackingUp}
              className="shrink-0"
            >
              <Save
                className={`mr-2 h-4 w-4 ${isBackingUp ? "animate-pulse" : ""}`}
              />
              {isBackingUp ? "Sauvegarde en cours…" : "Sauvegarder la thèse"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
            <HardDrive className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">Sauvegarde automatique</p>
              <p className="text-xs text-muted-foreground">
                Sauvegarder automatiquement votre travail chaque jour
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="auto-backup" className="sr-only">
                Sauvegarde automatique
              </Label>
              <Switch
                id="auto-backup"
                checked={autoBackup}
                onCheckedChange={setAutoBackup}
                aria-label="Activer la sauvegarde automatique"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Past backups list */}
      <div>
        <h3 className="mb-3 text-sm font-medium">Historique des sauvegardes</h3>
        <ScrollArea className="max-h-96">
          <div className="flex flex-col gap-2">
            {backups.map((backup) => (
              <Card key={backup.id} className="transition-colors hover:bg-muted/30">
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-chart-3/10">
                      <File className="h-5 w-5 text-chart-3" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {backup.fileName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {backup.thesisName}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDate(backup.date)}
                    </div>
                    <Badge variant="secondary">{backup.size}</Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                      <span className="sr-only">
                        Télécharger {backup.fileName}
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

// ── Settings Tab ───────────────────────────────────────────────────────────

function SettingsTab() {
  const envVars = [
    {
      name: "GOOGLE_DRIVE_CLIENT_ID",
      description:
        "Identifiant client OAuth 2.0 obtenu depuis la Google Cloud Console.",
    },
    {
      name: "GOOGLE_DRIVE_CLIENT_SECRET",
      description:
        "Secret client OAuth 2.0 associé à votre identifiant client.",
    },
    {
      name: "GOOGLE_DRIVE_REDIRECT_URI",
      description:
        "URI de redirection autorisée dans votre configuration OAuth (ex: http://localhost:3000/api/cloud-drive/callback).",
    },
  ];

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Setup guide */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
              <Settings2 className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <CardTitle className="text-base">
                Configuration de l\u2019API Google Drive
              </CardTitle>
              <CardDescription>
                Pour connecter votre compte Google Drive, vous devez configurer
                un projet dans la Google Cloud Console.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ol className="ml-4 list-decimal space-y-2 text-sm text-muted-foreground">
            <li>
              Rendez-vous sur la{" "}
              <span className="font-medium text-foreground">
                Google Cloud Console
              </span>{" "}
              et créez un nouveau projet.
            </li>
            <li>
              Activez l’{" "}
              <span className="font-medium text-foreground">
                API Google Drive
              </span>{" "}
              dans la section « Bibliothèque d’API ».
            </li>
            <li>
              Configurez l’{" "}
              <span className="font-medium text-foreground">
                écran de consentement OAuth
              </span>{" "}
              (type « Externe » pour le développement).
            </li>
            <li>
              Créez des{" "}
              <span className="font-medium text-foreground">
                identifiants OAuth 2.0
              </span>{" "}
              (application web) avec l’URI de redirection autorisée.
            </li>
            <li>
              Ajoutez les variables d’environnement ci-dessous à votre
              fichier{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                .env.local
              </code>
              .
            </li>
          </ol>
        </CardContent>
      </Card>

      <Separator />

      {/* Environment variables */}
      <div>
        <h3 className="mb-3 text-sm font-medium">
          Variables d’environnement requises
        </h3>
        <div className="flex flex-col gap-3">
          {envVars.map((envVar) => (
            <Card key={envVar.name}>
              <CardContent className="flex flex-col gap-2 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-muted px-2 py-1 text-xs font-mono">
                      {envVar.name}
                    </code>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => copyToClipboard(envVar.name)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span className="sr-only">
                      Copier {envVar.name}
                    </span>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {envVar.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      {/* Permissions info */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Scopes OAuth requis</AlertTitle>
        <AlertDescription>
          L’application requiert les permissions suivantes :{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">
            https://www.googleapis.com/auth/drive.file
          </code>{" "}
          (accès aux fichiers créés par l’application) et{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">
            https://www.googleapis.com/auth/drive.readonly
          </code>{" "}
          (lecture des métadonnées).
        </AlertDescription>
      </Alert>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export function CloudDrivePage() {
  const { data: status, isLoading: statusLoading } = useQuery<DriveStatus>({
    queryKey: ["cloud-drive-status"],
    queryFn: () =>
      fetch("/api/cloud-drive/status").then((r) => r.json()),
    retry: false,
  });

  const isConnected = status?.connected ?? false;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-1/10">
          <Cloud className="h-5 w-5 text-chart-1" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Google Drive
          </h1>
          <p className="text-sm text-muted-foreground">
            Sauvegardez et exportez votre thèse vers le cloud
          </p>
        </div>
      </div>

      {/* Connection status */}
      <ConnectionStatusCard status={status} isLoading={statusLoading} />

      {/* Tabs (only useful when connected) */}
      <Tabs defaultValue="fichiers">
        <TabsList>
          <TabsTrigger value="fichiers">
            <FolderOpen className="mr-2 h-4 w-4" />
            Fichiers
          </TabsTrigger>
          <TabsTrigger value="sauvegardes">
            <Save className="mr-2 h-4 w-4" />
            Sauvegardes
          </TabsTrigger>
          <TabsTrigger value="parametres">
            <Settings2 className="mr-2 h-4 w-4" />
            Paramètres
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fichiers" className="mt-4">
          {!isConnected ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Cloud className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-sm font-medium text-muted-foreground">
                  Connexion requise
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  Connectez votre compte Google Drive pour accéder à vos
                  fichiers
                </p>
              </CardContent>
            </Card>
          ) : (
            <FilesTab />
          )}
        </TabsContent>

        <TabsContent value="sauvegardes" className="mt-4">
          {!isConnected ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Cloud className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-sm font-medium text-muted-foreground">
                  Connexion requise
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  Connectez votre compte Google Drive pour sauvegarder votre
                  thèse
                </p>
              </CardContent>
            </Card>
          ) : (
            <BackupTab />
          )}
        </TabsContent>

        <TabsContent value="parametres" className="mt-4">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
