"use client";

import { useState, useCallback } from "react";
import {
  BookOpen, Search, ExternalLink, Download, Globe, BookMarked,
  FileText, Library, Loader2, BookCopy,
  Eye, BookHeart, FolderOpen, SearchIcon, AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";


// ── Source definitions ──

interface BookSource {
  id: string;
  name: string;
  url: string;
  searchUrl: string;
  description: string;
  color: string;
  icon: string;
  hasApi: boolean;
  tag: string;
  features: string[];
}

const BOOK_SOURCES: BookSource[] = [
  {
    id: "gutenberg",
    name: "Project Gutenberg",
    url: "https://www.gutenberg.org",
    searchUrl: "https://www.gutenberg.org/ebooks/search/?query=",
    description: "Plus de 70 000 livres du domaine public, gratuits et téléchargeables. Œuvres classiques en toutes langues.",
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    icon: "BookOpen",
    hasApi: true,
    tag: "Domaine public",
    features: ["70K+ livres", "EPUB/PDF/Kindle", "Multilingue"],
  },
  {
    id: "openlibrary",
    name: "Open Library",
    url: "https://openlibrary.org",
    searchUrl: "https://openlibrary.org/search?q=",
    description: "Bibliothèque universelle d'Internet Archive. Prêts numériques gratuits et livres en accès ouvert.",
    color: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300",
    icon: "Library",
    hasApi: true,
    tag: "Prêt numérique",
    features: ["Prêt gratuit", "Couv. haute rés.", "API ouverte"],
  },
  {
    id: "standardebooks",
    name: "Standard Ebooks",
    url: "https://standardebooks.org",
    searchUrl: "https://standardebooks.org/search?q=",
    description: "Livres du domaine public, méticuleusement mis en forme. Qualité typographique professionnelle.",
    color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    icon: "BookHeart",
    hasApi: true,
    tag: "Haute qualité",
    features: ["Mise en page pro", "EPUB/KF8", "Couvertures"],
  },
  {
    id: "manybooks",
    name: "ManyBooks",
    url: "https://manybooks.net",
    searchUrl: "https://manybooks.net/search?query=",
    description: "Grande sélection de livres gratuits et payants. Idéal pour découvrir de nouveaux auteurs et genres.",
    color: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
    icon: "BookMarked",
    hasApi: false,
    tag: "Découverte",
    features: ["Gratuit + payant", "Genres variés", "EPUB/PDF"],
  },
  {
    id: "pdfdrive",
    name: "PDF Drive",
    url: "https://www.pdfdrive.com",
    searchUrl: "https://www.pdfdrive.com/search?q=",
    description: "Moteur de recherche de PDF. Des millions de documents académiques, livres et articles en téléchargement.",
    color: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
    icon: "FileText",
    hasApi: false,
    tag: "PDF gratuit",
    features: ["Millions de PDF", "Académique", "Téléchargement direct"],
  },
  {
    id: "pdfcoffee",
    name: "PDF Coffee",
    url: "https://pdfcoffee.com",
    searchUrl: "https://pdfcoffee.com/search/?q=",
    description: "Plateforme de partage de documents PDF. Livres, mémoires, articles et rapports de recherche.",
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    icon: "BookCopy",
    hasApi: false,
    tag: "Documents",
    features: ["Partage libre", "Mémoires", "Rapports"],
  },
  {
    id: "pdfroom",
    name: "PDF Room",
    url: "https://pdfroom.com",
    searchUrl: "https://pdfroom.com/search?q=",
    description: "Bibliothèque en ligne de livres et documents PDF. Recherche et lecture en ligne gratuite.",
    color: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
    icon: "FolderOpen",
    hasApi: false,
    tag: "Lecture en ligne",
    features: ["Lecture en ligne", "Gratuit", "Diversifié"],
  },
];

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen, Library, BookHeart, BookMarked, FileText, BookCopy, FolderOpen,
};

// ── Types ──

interface ApiBook {
  source: string;
  id: string;
  title: string;
  authors: string[];
  year?: number | null;
  coverUrl?: string | null;
  url: string;
  subjects?: string[];
  bookshelves?: string[];
 publishers?: string[];
  isbn?: string[];
  editions?: number;
  hasEbook?: boolean;
  hasFulltext?: boolean;
  languages?: string[];
  downloadCount?: number;
  readOnline?: string | null;
  downloadPdf?: string | null;
  downloadEpub?: string | null;
  formats?: Record<string, string>;
}

// ── Component ──

export function BibliothequePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Record<string, ApiBook[]>>({});
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedBook, setSelectedBook] = useState<ApiBook | null>(null);
  const [error, setError] = useState("");

  const apiSources = BOOK_SOURCES.filter((s) => s.hasApi).map((s) => s.id);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setResults({});
    setTotalResults(0);

    try {
      const sources = activeTab === "all" ? "all" : activeTab;
      const res = await fetch(`/api/books?q=${encodeURIComponent(query)}&sources=${sources}&limit=8`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur de recherche");
        return;
      }

      setResults(data.results || {});
      setTotalResults(data.totalResults || 0);
    } catch {
      setError("Erreur réseau. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  }, [query, activeTab]);

  const handleExternalSearch = (source: BookSource) => {
    if (!query.trim()) {
      window.open(source.url, "_blank", "noopener,noreferrer");
      return;
    }
    window.open(`${source.searchUrl}${encodeURIComponent(query)}`, "_blank", "noopener,noreferrer");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const sourceLabels: Record<string, string> = {
    openlibrary: "Open Library",
    gutenberg: "Project Gutenberg",
    standardebooks: "Standard Ebooks",
  };

  const sourceColors: Record<string, string> = {
    openlibrary: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300",
    gutenberg: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    standardebooks: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/40">
          <Library className="w-5 h-5 text-violet-700 dark:text-violet-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Bibliothèque</h1>
          <p className="text-sm text-muted-foreground">
            Recherchez des livres sur 7 sources gratuites en une seule requête
          </p>
        </div>
        <Badge variant="secondary" className="ml-auto text-xs">
          7 sources
        </Badge>
      </div>

      {/* Search bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Titre, auteur, sujet, ISBN..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10"
              />
            </div>
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les sources API</SelectItem>
                {apiSources.map((s) => (
                  <SelectItem key={s} value={s}>
                    {sourceLabels[s] || s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="gap-2 shrink-0"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SearchIcon className="h-4 w-4" />}
              {loading ? "Recherche..." : "Rechercher"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* External sources bar — one-click launch */}
      <Card>
        <CardHeader className="pb-3 pt-4 px-4">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Rechercher sur les sites externes
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="flex flex-wrap gap-2">
            {BOOK_SOURCES.map((source) => {
              const Icon = ICON_MAP[source.icon] || BookOpen;
              return (
                <Button
                  key={source.id}
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs h-8"
                  onClick={() => handleExternalSearch(source)}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {source.name}
                  {source.hasApi && <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 h-4">API</Badge>}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* API Results */}
      {totalResults > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{totalResults} résultats</span>
          <span>sur {Object.keys(results).length} source(s)</span>
        </div>
      )}

      {Object.entries(results).length > 0 && (
        <div className="space-y-6">
          {Object.entries(results).map(([source, books]) => {
            if (books.length === 0) return null;
            return (
              <div key={source}>
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={sourceColors[source] || ""} variant="secondary">
                    {sourceLabels[source] || source}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{books.length} résultat(s)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {books.map((book) => (
                    <BookCard key={book.id} book={book} sourceName={sourceLabels[source] || source} onClick={() => setSelectedBook(book)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!loading && totalResults === 0 && !error && (
        <div className="text-center py-16 space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-medium">Recherchez des livres</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Saisissez un titre, auteur ou sujet pour rechercher sur les sources disponibles.
              <br />
              Les résultats de Gutenberg, Open Library et Standard Ebooks apparaissent ici.
            </p>
          </div>
        </div>
      )}

      {/* Source directory cards */}
      <Separator className="my-6" />
      <h2 className="text-lg font-semibold">Sources disponibles</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {BOOK_SOURCES.map((source) => {
          const Icon = ICON_MAP[source.icon] || BookOpen;
          return (
            <Card key={source.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md ${source.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-sm font-medium leading-tight">{source.name}</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">{source.tag}</Badge>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {source.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {source.features.map((f) => (
                    <Badge key={f} variant="secondary" className="text-[10px] px-1.5 h-4">
                      {f}
                    </Badge>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs gap-1.5"
                  onClick={() => handleExternalSearch(source)}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Visiter {source.name}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Book detail dialog */}
      <Dialog open={!!selectedBook} onOpenChange={() => setSelectedBook(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base leading-tight pr-8">
              {selectedBook?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedBook && <BookDetail book={selectedBook} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Book Card ──

function BookCard({ book, sourceName, onClick }: { book: ApiBook; sourceName: string; onClick: () => void }) {
  const authorStr = book.authors?.length > 0 ? book.authors.join(", ") : "Auteur inconnu";

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow group"
      onClick={onClick}
    >
      <CardContent className="p-3 flex gap-3">
        {/* Cover */}
        <div className="w-16 h-22 shrink-0 bg-muted rounded flex items-center justify-center overflow-hidden">
          {book.coverUrl ? (
            <img src={book.coverUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <BookOpen className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        {/* Info */}
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="text-sm font-medium leading-tight line-clamp-2 group-hover:underline">
            {book.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-1">{authorStr}</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            {book.year && <span className="text-[10px] text-muted-foreground">{book.year}</span>}
            <Badge variant="secondary" className="text-[10px] px-1.5 h-4">
              {sourceName}
            </Badge>
            {book.hasEbook && (
              <Badge variant="secondary" className="text-[10px] px-1.5 h-4 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                eBook
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Book Detail ──

function BookDetail({ book }: { book: ApiBook }) {
  const authorStr = book.authors?.length > 0 ? book.authors.join(", ") : "Auteur inconnu";

  return (
    <div className="space-y-4">
      {/* Cover + meta */}
      <div className="flex gap-4">
        <div className="w-24 h-34 shrink-0 bg-muted rounded flex items-center justify-center overflow-hidden">
          {book.coverUrl ? (
            <img src={book.coverUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        <div className="space-y-2 min-w-0">
          <p className="text-sm">{authorStr}</p>
          {book.year && <p className="text-sm text-muted-foreground">Première publication : {book.year}</p>}
          {book.editions && <p className="text-sm text-muted-foreground">{book.editions} édition(s)</p>}
          {book.downloadCount && <p className="text-sm text-muted-foreground">{book.downloadCount.toLocaleString("fr-FR")} téléchargements (Gutenberg)</p>}
          {book.isbn && book.isbn.length > 0 && (
            <p className="text-xs text-muted-foreground">ISBN : {book.isbn.join(", ")}</p>
          )}
          {book.languages && book.languages.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {book.languages.map((l) => (
                <Badge key={l} variant="outline" className="text-[10px] px-1.5 h-4">{l.toUpperCase()}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Subjects */}
      {(book.subjects && book.subjects.length > 0) && (
        <div>
          <h4 className="text-xs font-medium mb-1.5 text-muted-foreground">Sujets</h4>
          <div className="flex flex-wrap gap-1">
            {book.subjects.slice(0, 8).map((s) => (
              <Badge key={s} variant="secondary" className="text-[10px] px-1.5 h-4">{s}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Bookshelves (Gutenberg) */}
      {(book.bookshelves && book.bookshelves.length > 0) && (
        <div>
          <h4 className="text-xs font-medium mb-1.5 text-muted-foreground">Rayons</h4>
          <div className="flex flex-wrap gap-1">
            {book.bookshelves.map((s) => (
              <Badge key={s} variant="outline" className="text-[10px] px-1.5 h-4">{s}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" className="gap-1.5" onClick={() => window.open(book.url, "_blank", "noopener,noreferrer")}>
          <ExternalLink className="h-3.5 w-3.5" />
          Voir sur le site
        </Button>
        {book.readOnline && (
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => window.open(book.readOnline!, "_blank", "noopener,noreferrer")}>
            <Eye className="h-3.5 w-3.5" />
            Lire en ligne
          </Button>
        )}
        {book.downloadPdf && (
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => window.open(book.downloadPdf!, "_blank", "noopener,noreferrer")}>
            <Download className="h-3.5 w-3.5" />
            PDF
          </Button>
        )}
        {book.downloadEpub && (
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => window.open(book.downloadEpub!, "_blank", "noopener,noreferrer")}>
            <Download className="h-3.5 w-3.5" />
            EPUB
          </Button>
        )}
        {("formats" in book) && book.formats && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => window.open(book.url, "_blank", "noopener,noreferrer")}
          >
            <Download className="h-3.5 w-3.5" />
            Tous les formats
          </Button>
        )}
      </div>
    </div>
  );
}


