"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BookMarked,
  Search,
  Settings,
  Link2,
  Unlink,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText,
  Users,
  Calendar,
  BookOpen,
  Database,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

interface MendeleyUser {
  id: string;
  display_name: string;
  email?: string;
}

interface MendeleyDocument {
  id: string;
  title: string;
  authors: string[];
  year?: number;
  type: string;
  source?: string;
  abstract?: string;
  created?: string;
}

interface ConnectionStatus {
  connected: boolean;
  user?: MendeleyUser;
  documentCount?: number;
}

interface EnvVarStatus {
  name: string;
  description: string;
  configured: boolean;
}

// ═══════════════════════════════════════
// Environment variable definitions
// ═══════════════════════════════════════

const ENV_VARS: EnvVarStatus[] = [
  {
    name: "MENDELEY_CLIENT_ID",
    description:
      "Identifiant de votre application Mendeley OAuth (obtenu via le portail développeur Mendeley).",
    configured: false,
  },
  {
    name: "MENDELEY_CLIENT_SECRET",
    description:
      "Clé secrète de votre application Mendeley OAuth. Ne jamais exposer publiquement.",
    configured: false,
  },
  {
    name: "MENDELEY_REDIRECT_URI",
    description:
      "URI de redirection OAuth. Doit correspondre exactement à celle configurée dans votre application Mendeley (ex: http://localhost:3000/api/mendeley/callback).",
    configured: false,
  },
];

// ═══════════════════════════════════════
// Document type badge colors (oklch-safe)
// ═══════════════════════════════════════

function getTypeBadgeVariant(
  type: string
): "default" | "secondary" | "outline" | "destructive" {
  const t = type.toLowerCase();
  if (
    t.includes("journal") ||
    t.includes("article") ||
    t.includes("journal article")
  )
    return "default";
  if (
    t.includes("book") ||
    t.includes("livre") ||
    t.includes("monograph")
  )
    return "secondary";
  if (
    t.includes("conference") ||
    t.includes("proceedings") ||
    t.includes("conférence")
  )
    return "outline";
  if (t.includes("thesis") || t.includes("dissertation") || t.includes("thèse"))
    return "destructive";
  return "secondary";
}

// ═══════════════════════════════════════
// Skeleton loaders
// ═══════════════════════════════════════

function DocumentCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function DocumentsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <DocumentCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════
// Connection status card
// ═══════════════════════════════════════

function ConnectionStatusCard() {
  const { data: status, isLoading, isError } = useQuery<ConnectionStatus>({
    queryKey: ["mendeley-connection"],
    queryFn: async () => {
      const res = await fetch("/api/mendeley/status");
      if (!res.ok) throw new Error("Erreur de connexion");
      return res.json();
    },
    retry: false,
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !status) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-chart-1/10">
              <Unlink className="h-5 w-5 text-chart-1" />
            </div>
            <div>
              <CardTitle className="text-lg">Mendeley</CardTitle>
              <CardDescription>
                Non connecté — Configurez OAuth pour vous connecter
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              La connexion à Mendeley nécessite la configuration des variables
              d&apos;environnement OAuth. Vérifiez l&apos;onglet
              &laquo;&nbsp;Paramètres&nbsp;&raquo; pour plus de détails.
            </AlertDescription>
          </Alert>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild>
              <a href="/api/mendeley/auth">
                <Link2 className="h-4 w-4 mr-2" />
                Connecter Mendeley
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a
                href="https://dev.mendeley.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Portail développeur Mendeley
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Connected state
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-chart-4/10">
            <Link2 className="h-5 w-5 text-chart-4" />
          </div>
          <div>
            <CardTitle className="text-lg">Mendeley</CardTitle>
            <CardDescription>
              Compte connecté avec succès
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-md bg-chart-4/10">
              <Users className="h-4 w-4 text-chart-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Utilisateur</p>
              <p className="text-sm font-medium">
                {status.user?.display_name ?? "Inconnu"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-md bg-chart-1/10">
              <BookMarked className="h-4 w-4 text-chart-1" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Documents</p>
              <p className="text-sm font-medium">
                {status.documentCount ?? 0} documents
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-md bg-chart-5/10">
              <CheckCircle2 className="h-4 w-4 text-chart-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Statut</p>
              <p className="text-sm font-medium text-chart-5">
                Connecté
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <a href="/api/mendeley/auth">
              <BookMarked className="h-4 w-4 mr-2" />
              Synchroniser
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/api/mendeley/logout">
              <Unlink className="h-4 w-4 mr-2" />
              Se déconnecter
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════
// Documents tab
// ═══════════════════════════════════════

function DocumentsTab() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: documents, isLoading, isError, refetch } = useQuery<
    MendeleyDocument[]
  >({
    queryKey: ["mendeley-documents"],
    queryFn: async () => {
      const res = await fetch("/api/mendeley/documents");
      if (!res.ok) throw new Error("Erreur lors du chargement des documents");
      return res.json();
    },
    retry: false,
    staleTime: 60_000,
  });

  const filteredDocuments = useMemo(() => {
    if (!documents) return [];
    if (!searchQuery.trim()) return documents;
    const q = searchQuery.toLowerCase();
    return documents.filter(
      (doc) =>
        doc.title.toLowerCase().includes(q) ||
        doc.authors.some((a) => a.toLowerCase().includes(q)) ||
        doc.type.toLowerCase().includes(q) ||
        (doc.year?.toString().includes(q) ?? false)
    );
  }, [documents, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filtrer par titre, auteur, année ou type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : null}
          Actualiser
        </Button>
      </div>

      {/* Results count */}
      {documents && documents.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {filteredDocuments.length} document{filteredDocuments.length !== 1 ? "s" : ""}
          {searchQuery.trim() ? " (filtré)" : ""}
        </p>
      )}

      {/* Loading skeleton */}
      {isLoading && <DocumentsGridSkeleton count={6} />}

      {/* Error state */}
      {isError && !isLoading && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Impossible de charger les documents depuis Mendeley. Vérifiez que
            votre connexion est active et que les identifiants OAuth sont
            correctement configurés.
          </AlertDescription>
        </Alert>
      )}

      {/* Empty state */}
      {!isLoading && !isError && documents && documents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex items-center justify-center h-14 w-14 rounded-full bg-muted mb-4">
            <FileText className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">Aucun document</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            Votre bibliothèque Mendeley est vide ou aucun document n&apos;a pu
            être récupéré. Importez des références dans Mendeley pour les voir
            apparaître ici.
          </p>
        </div>
      )}

      {/* Filtered empty state */}
      {!isLoading &&
        !isError &&
        documents &&
        documents.length > 0 &&
        filteredDocuments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-muted mb-4">
              <Search className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Aucun résultat</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              Aucun document ne correspond à votre recherche
              &laquo;&nbsp;{searchQuery}&nbsp;&raquo;.
            </p>
          </div>
        )}

      {/* Document grid */}
      {!isLoading &&
        !isError &&
        filteredDocuments.length > 0 && (
          <ScrollArea className="max-h-[600px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
              {filteredDocuments.map((doc) => (
                <Card
                  key={doc.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold leading-snug line-clamp-2">
                      {doc.title}
                    </CardTitle>
                    <CardDescription className="text-xs line-clamp-1">
                      {doc.authors.length > 0
                        ? doc.authors.slice(0, 3).join(", ") +
                          (doc.authors.length > 3
                            ? ` et al. (${doc.authors.length} auteurs)`
                            : "")
                        : "Auteur inconnu"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {doc.year && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Calendar className="h-3 w-3" />
                          {doc.year}
                        </Badge>
                      )}
                      <Badge
                        variant={getTypeBadgeVariant(doc.type)}
                        className="text-xs gap-1"
                      >
                        <FileText className="h-3 w-3" />
                        {doc.type}
                      </Badge>
                      {doc.source && (
                        <Badge
                          variant="secondary"
                          className="text-xs gap-1"
                        >
                          <BookOpen className="h-3 w-3" />
                          {doc.source}
                        </Badge>
                      )}
                    </div>
                    {doc.abstract && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {doc.abstract}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
    </div>
  );
}

// ═══════════════════════════════════════
// Search tab
// ═══════════════════════════════════════

function SearchTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    // Simulate brief loading state for UX
    setTimeout(() => setIsSearching(false), 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="space-y-6">
      {/* Search input */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher dans la base Mendeley..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
          {isSearching ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Search className="h-4 w-4 mr-2" />
          )}
          Rechercher
        </Button>
      </div>

      <Separator />

      {/* Search results area */}
      {isSearching && (
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <DocumentCardSkeleton key={i} />
            ))}
          </div>
        </div>
      )}

      {!isSearching && hasSearched && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex items-center justify-center h-14 w-14 rounded-full bg-chart-2/10 mb-4">
            <Database className="h-7 w-7 text-chart-2" />
          </div>
          <h3 className="text-lg font-medium">
            Recherche dans la base Mendeley
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            La recherche avancée dans le catalogue Mendeley sera bientôt
            disponible. Cette fonctionnalité nécessite une connexion active à
            l&apos;API Mendeley et des identifiants OAuth valides.
          </p>
          <div className="mt-6">
            <Badge variant="outline" className="text-xs">
              Fonctionnalité à venir
            </Badge>
          </div>
        </div>
      )}

      {!isSearching && !hasSearched && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex items-center justify-center h-14 w-14 rounded-full bg-muted mb-4">
            <Search className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">Recherche Mendeley</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            Entrez un terme de recherche pour explorer la base de documents
            Mendeley. Vous pouvez rechercher par titre, auteur, mot-clé ou
            DOI.
          </p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// Settings tab
// ═══════════════════════════════════════

function SettingsTab() {
  const { data: envStatus } = useQuery<Record<string, boolean>>({
    queryKey: ["mendeley-env-status"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/mendeley/env-status");
        if (!res.ok) return {};
        return res.json();
      } catch {
        return {};
      }
    },
    retry: false,
    staleTime: 60_000,
  });

  return (
    <div className="space-y-6">
      {/* Explanation card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5 text-chart-2" />
            Configuration OAuth Mendeley
          </CardTitle>
          <CardDescription>
            Pour connecter ThesisFrame à votre compte Mendeley, vous devez
            créer une application OAuth sur le portail développeur Mendeley et
            configurer les variables d&apos;environnement ci-dessous.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4 bg-muted/30">
            <h4 className="text-sm font-medium mb-2">
              Étapes de configuration
            </h4>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>
                Rendez-vous sur{" "}
                <a
                  href="https://dev.mendeley.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-chart-1 underline underline-offset-2 hover:text-chart-1/80"
                >
                  dev.mendeley.com
                </a>{" "}
                et connectez-vous avec votre compte Mendeley.
              </li>
              <li>
                Créez une nouvelle application (bouton &laquo;&nbsp;Register
                your app&nbsp;&raquo;).
              </li>
              <li>
                Configurez l&apos;URL de redirection (Redirect URI) vers
                votre instance :{" "}
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                  http://localhost:3000/api/mendeley/callback
                </code>
              </li>
              <li>
                Copiez le Client ID et le Client Secret fournis.
              </li>
              <li>
                Ajoutez les trois variables d&apos;environnement dans votre
                fichier <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">.env.local</code>.
              </li>
              <li>
                Redémarrez le serveur de développement.
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Environment variables status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Variables d&apos;environnement</CardTitle>
          <CardDescription>
            Statut des variables OAuth requises pour la connexion Mendeley.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ENV_VARS.map((envVar) => {
              const isConfigured = envStatus?.[envVar.name] ?? false;
              return (
                <div
                  key={envVar.name}
                  className="flex flex-col sm:flex-row sm:items-start gap-3 rounded-lg border p-4"
                >
                  <div className="flex items-center gap-2 sm:min-w-[200px]">
                    {isConfigured ? (
                      <CheckCircle2 className="h-4 w-4 text-chart-4 shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-chart-1 shrink-0" />
                    )}
                    <code className="text-xs font-mono">{envVar.name}</code>
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm text-muted-foreground">
                      {envVar.description}
                    </p>
                  </div>
                  <Badge
                    variant={isConfigured ? "default" : "outline"}
                    className={
                      isConfigured
                        ? "bg-chart-4/10 text-chart-4 border-chart-4/20 shrink-0"
                        : "text-chart-1 shrink-0"
                    }
                  >
                    {isConfigured ? "Configuré" : "Non configuré"}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Warning card */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Les identifiants OAuth sont stockés uniquement côté serveur et ne sont
          jamais exposés au navigateur. Le jeton d&apos;accès Mendeley est
          conservé de manière sécurisée dans la session serveur.
        </AlertDescription>
      </Alert>
    </div>
  );
}

// ═══════════════════════════════════════
// Main MendeleyPage component
// ═══════════════════════════════════════

export function MendeleyPage() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 p-6">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BookMarked className="h-6 w-6 text-chart-1" />
          Mendeley
        </h1>
        <p className="text-muted-foreground">
          Gérez vos références bibliographiques et synchronisez votre
          bibliothèque Mendeley.
        </p>
      </div>

      {/* Connection status card */}
      <ConnectionStatusCard />

      {/* Main tabs */}
      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="documents" className="gap-2">
            <BookMarked className="h-4 w-4" />
            <span className="hidden sm:inline">Documents</span>
          </TabsTrigger>
          <TabsTrigger value="search" className="gap-2">
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Recherche</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Paramètres</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="mt-4">
          <DocumentsTab />
        </TabsContent>

        <TabsContent value="search" className="mt-4">
          <SearchTab />
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
