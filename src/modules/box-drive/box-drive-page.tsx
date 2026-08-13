"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Package,
  FolderOpen,
  File,
  Upload,
  Download,
  Share2,
  Link2,
  Unlink,
  AlertCircle,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface BoxFile {
  id: string;
  name: string;
  type: "file" | "folder";
  size?: number;
  modified_at?: string;
  shared_link?: string;
  etag?: string;
}

interface BoxSharedLink {
  id: string;
  file_name: string;
  url: string;
  access: "open" | "company" | "collaborators";
  created_at?: string;
}

interface ConnectionStatus {
  connected: boolean;
  user_name?: string;
  enterprise_id?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatFileSize(bytes?: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function accessLabel(access: string): string {
  switch (access) {
    case "open":
      return "Ouvert";
    case "company":
      return "Entreprise";
    case "collaborators":
      return "Collaborateurs";
    default:
      return access;
  }
}

function accessVariant(
  access: string
): "default" | "secondary" | "outline" {
  switch (access) {
    case "open":
      return "default";
    case "company":
      return "secondary";
    default:
      return "outline";
  }
}

/* ------------------------------------------------------------------ */
/*  Skeletons                                                          */
/* ------------------------------------------------------------------ */

function FileListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-lg border p-4"
        >
          <Skeleton className="h-5 w-5 shrink-0 rounded" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      ))}
    </div>
  );
}

function LinkListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-lg border p-4"
        >
          <Skeleton className="h-5 w-5 shrink-0 rounded" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-3/5" />
          </div>
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function BoxDrivePage() {
  const [activeTab, setActiveTab] = useState("files");

  /* ---- Queries --------------------------------------------------- */
  const {
    data: status,
    isLoading: statusLoading,
    refetch: refetchStatus,
  } = useQuery<ConnectionStatus>({
    queryKey: ["box-drive", "status"],
    queryFn: () => fetch("/api/box-drive/status").then((r) => r.json()),
    refetchOnWindowFocus: false,
  });

  const isConnected = status?.connected === true;

  const { data: files, isLoading: filesLoading } = useQuery<BoxFile[]>({
    queryKey: ["box-drive", "files"],
    queryFn: () => fetch("/api/box-drive/files").then((r) => r.json()),
    enabled: isConnected,
  });

  const { data: links, isLoading: linksLoading } = useQuery<BoxSharedLink[]>({
    queryKey: ["box-drive", "links"],
    queryFn: () => fetch("/api/box-drive/links").then((r) => r.json()),
    enabled: isConnected,
  });

  /* ---- Handlers -------------------------------------------------- */

  const handleConnect = () => {
    window.location.href = "/api/box-drive/connect";
  };

  const handleDisconnect = async () => {
    try {
      await fetch("/api/box-drive/disconnect", { method: "POST" });
      toast.success("Box déconnecté avec succès");
      refetchStatus();
    } catch {
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url).then(
      () => toast.success("Lien copié dans le presse-papiers"),
      () => toast.error("Impossible de copier le lien")
    );
  };

  const handleUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = async () => {
      if (!input.files?.length) return;
      const form = new FormData();
      Array.from(input.files).forEach((f) => form.append("files", f));
      try {
        const res = await fetch("/api/box-drive/files", {
          method: "POST",
          body: form,
        });
        if (res.ok) {
          toast.success("Fichier(s) envoyé(s) avec succès");
        } else {
          toast.error("Erreur lors de l’envoi");
        }
      } catch {
        toast.error("Erreur lors de l’envoi");
      }
    };
    input.click();
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      const res = await fetch(`/api/box-drive/files/${fileId}/download`);
      if (!res.ok) {
        toast.error("Erreur lors du téléchargement");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Erreur lors du téléchargement");
    }
  };

  const handleCreateSharedLink = async (fileId: string) => {
    try {
      const res = await fetch("/api/box-drive/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId }),
      });
      if (res.ok) {
        toast.success("Lien de partage créé");
      } else {
        toast.error("Erreur lors de la création du lien");
      }
    } catch {
      toast.error("Erreur lors de la création du lien");
    }
  };

  /* ---- Render ---------------------------------------------------- */

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Package className="h-7 w-7 text-[oklch(0.7_0.15_160)]" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Box Drive
          </h1>
          <p className="text-sm text-muted-foreground">
            Gérez vos documents de thèse dans le cloud Box
          </p>
        </div>
      </div>

      {/* Connection status card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {statusLoading ? (
                <Skeleton className="h-5 w-5 rounded" />
              ) : isConnected ? (
                <CheckCircle2 className="h-5 w-5 text-[oklch(0.7_0.15_160)]" />
              ) : (
                <AlertCircle className="h-5 w-5 text-[oklch(0.7_0.15_25)]" />
              )}
              <CardTitle className="text-base">
                Statut de connexion
              </CardTitle>
            </div>
            <Badge
              variant={isConnected ? "default" : "outline"}
              className={
                isConnected
                  ? "bg-[oklch(0.7_0.15_160)] text-white hover:bg-[oklch(0.65_0.15_160)]"
                  : ""
              }
            >
              {statusLoading
                ? "Vérification…"
                : isConnected
                  ? "Connecté"
                  : "Déconnecté"}
            </Badge>
          </div>
          <CardDescription>
            {statusLoading
              ? "Vérification de la connexion Box en cours…"
              : isConnected
                ? `Connecté en tant que ${status.user_name ?? "utilisateur"}${status.enterprise_id ? ` (Enterprise: ${status.enterprise_id})` : ""}`
                : "Connectez votre compte Box pour accéder à vos fichiers de thèse."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {isConnected ? (
              <Button
                variant="outline"
                onClick={handleDisconnect}
                className="gap-2"
              >
                <Unlink className="h-4 w-4" />
                Se déconnecter
              </Button>
            ) : (
              <Button
                onClick={handleConnect}
                className="gap-2 bg-[oklch(0.7_0.15_160)] text-white hover:bg-[oklch(0.65_0.15_160)]"
              >
                <Package className="h-4 w-4" />
                Se connecter à Box
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Not connected alert */}
      {!statusLoading && !isConnected && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Vous devez d’abord connecter votre compte Box pour accéder aux fichiers,
            aux liens de partage et aux paramètres.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs — only interactive when connected */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="files" className="gap-1.5">
            <FolderOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Fichiers</span>
          </TabsTrigger>
          <TabsTrigger value="links" className="gap-1.5">
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Liens partagés</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-1.5">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Paramètres</span>
          </TabsTrigger>
        </TabsList>

        {/* ---------- FILES TAB ---------- */}
        <TabsContent value="files">
          {!isConnected ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Package className="mb-4 h-12 w-12 text-muted-foreground/40" />
                <p className="text-muted-foreground">
                  Connectez votre compte Box pour parcourir vos fichiers.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-base">Fichiers</CardTitle>
                    <CardDescription>
                      Parcourez et gérez les documents de votre thèse
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleUpload}
                    className="gap-2 bg-[oklch(0.7_0.15_160)] text-white hover:bg-[oklch(0.65_0.15_160)]"
                  >
                    <Upload className="h-4 w-4" />
                    Téléverser
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {filesLoading ? (
                  <FileListSkeleton />
                ) : !files || files.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FolderOpen className="mb-4 h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">
                      Aucun fichier trouvé. Téléversez vos premiers documents.
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="max-h-[500px]">
                    <div className="flex flex-col gap-2">
                      {files.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                        >
                          {/* Icon */}
                          {item.type === "folder" ? (
                            <FolderOpen className="h-5 w-5 shrink-0 text-[oklch(0.7_0.15_60)]" />
                          ) : (
                            <File className="h-5 w-5 shrink-0 text-muted-foreground" />
                          )}

                          {/* Info */}
                          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <span className="truncate text-sm font-medium">
                              {item.name}
                            </span>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              {item.size != null && (
                                <span>{formatFileSize(item.size)}</span>
                              )}
                              {item.modified_at && (
                                <>
                                  <Separator
                                    orientation="vertical"
                                    className="h-3"
                                  />
                                  <span>{formatDate(item.modified_at)}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Shared link badge */}
                          {item.shared_link && (
                            <Badge variant="secondary" className="gap-1 text-xs">
                              <Link2 className="h-3 w-3" />
                              Partagé
                            </Badge>
                          )}

                          {/* Actions — files only */}
                          {item.type === "file" && (
                            <div className="flex shrink-0 gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  handleCreateSharedLink(item.id)
                                }
                                title="Créer un lien de partage"
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  handleDownload(item.id, item.name)
                                }
                                title="Télécharger"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ---------- SHARED LINKS TAB ---------- */}
        <TabsContent value="links">
          {!isConnected ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Share2 className="mb-4 h-12 w-12 text-muted-foreground/40" />
                <p className="text-muted-foreground">
                  Connectez votre compte Box pour gérer vos liens partagés.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-base">
                      Liens partagés
                    </CardTitle>
                    <CardDescription>
                      Gérez les liens de partage de vos documents de thèse
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => toast.info("Sélectionnez un fichier pour créer un lien de partage.")}
                  >
                    <Link2 className="h-4 w-4" />
                    Créer un lien
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {linksLoading ? (
                  <LinkListSkeleton />
                ) : !links || links.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Link2 className="mb-4 h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">
                      Aucun lien de partage. Créez-en un depuis l’onglet Fichiers.
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="max-h-[500px]">
                    <div className="flex flex-col gap-2">
                      {links.map((link) => (
                        <div
                          key={link.id}
                          className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                        >
                          <Link2 className="h-5 w-5 shrink-0 text-[oklch(0.7_0.15_160)]" />

                          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <span className="truncate text-sm font-medium">
                              {link.file_name}
                            </span>
                            <span className="truncate text-xs text-muted-foreground">
                              {link.url}
                            </span>
                          </div>

                          <Badge
                            variant={accessVariant(link.access)}
                            className="hidden shrink-0 text-xs sm:inline-flex"
                          >
                            {accessLabel(link.access)}
                          </Badge>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => handleCopyLink(link.url)}
                            title="Copier le lien"
                          >
                            <Link2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ---------- SETTINGS TAB ---------- */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Configuration de l’API Box
              </CardTitle>
              <CardDescription>
                Variables d’environnement requises pour la connexion OAuth Box
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Ces variables doivent être configurées côté serveur (fichier{' '}
                  <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">
                    .env.local
                  </code>
                  ). Elles ne sont jamais exposées au navigateur.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* BOX_CLIENT_ID */}
                <div className="flex flex-col gap-1.5 rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">BOX_CLIENT_ID</span>
                  </div>
                  <Input
                    readOnly
                    placeholder="pk_xxxxxxxx"
                    className="bg-muted/50 font-mono text-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    Identifiant du client OAuth Box (Configuration de l’application)
                  </p>
                </div>

                {/* BOX_CLIENT_SECRET */}
                <div className="flex flex-col gap-1.5 rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      BOX_CLIENT_SECRET
                    </span>
                  </div>
                  <Input
                    readOnly
                    type="password"
                    placeholder="••••••••••••"
                    className="bg-muted/50 font-mono text-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    Secret du client OAuth Box (ne jamais exposer)
                  </p>
                </div>

                {/* BOX_REDIRECT_URI */}
                <div className="flex flex-col gap-1.5 rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      BOX_REDIRECT_URI
                    </span>
                  </div>
                  <Input
                    readOnly
                    placeholder="http://localhost:3000/api/box-drive/callback"
                    className="bg-muted/50 font-mono text-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    URI de redirection après authentification OAuth
                  </p>
                </div>

                {/* BOX_ENTERPRISE_ID */}
                <div className="flex flex-col gap-1.5 rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      BOX_ENTERPRISE_ID
                    </span>
                  </div>
                  <Input
                    readOnly
                    placeholder="123456"
                    className="bg-muted/50 font-mono text-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    Identifiant de l’entreprise Box (optionnel, pour les comptes Enterprise)
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-2 text-sm font-semibold">
                  Étapes de configuration
                </h3>
                <ol className="ml-4 flex list-decimal flex-col gap-2 text-sm text-muted-foreground">
                  <li>
                    Créez une application sur la{" "}
                    <span className="font-medium text-foreground">
                      Box Developer Console
                    </span>
                    .
                  </li>
                  <li>
                    Activez <span className="font-medium text-foreground">OAuth 2.0</span> comme méthode d’authentification.
                  </li>
                  <li>
                    Ajoutez l’URI de redirection dans la configuration de l’application Box.
                  </li>
                  <li>
                    Copiez le <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">Client ID</code> et le{' '}
                    <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">Client Secret</code> dans votre{' '}
                    <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">.env.local</code>.
                  </li>
                  <li>
                    Redémarrez le serveur de développement, puis cliquez sur{' '}
                    <span className="font-medium text-foreground">
                      Se connecter à Box
                    </span>
                    .
                  </li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
