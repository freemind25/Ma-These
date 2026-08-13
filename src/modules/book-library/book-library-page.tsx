"use client";

import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen,
  Search,
  ExternalLink,
  Download,
  Info,
  Library,
  Tag,
  FileText,
  Hash,
  Calendar,
  Building2,
  User,
} from "lucide-react";
import {
  BOOK_RESOURCES,
  BOOK_CATEGORIES,
  type BookResource,
  type BookCategory,
} from "@/data/book-resources";

// ── Category color mapping ──────────────────────────────────────
const CATEGORY_COLORS: Record<BookCategory, string> = {
  supervision:
    "bg-[oklch(var(--chart-1)/0.15)] text-[oklch(var(--chart-1))]",
  methodology:
    "bg-[oklch(var(--chart-2)/0.15)] text-[oklch(var(--chart-2))]",
  writing:
    "bg-[oklch(var(--chart-4)/0.15)] text-[oklch(var(--chart-4))]",
  "phd-guide":
    "bg-[oklch(var(--chart-5)/0.15)] text-[oklch(var(--chart-5))]",
};

const CATEGORY_BORDER_COLORS: Record<BookCategory, string> = {
  supervision: "border-l-[oklch(var(--chart-1))]",
  methodology: "border-l-[oklch(var(--chart-2))]",
  writing: "border-l-[oklch(var(--chart-4))]",
  "phd-guide": "border-l-[oklch(var(--chart-5))]",
};

const CATEGORY_LABELS: Record<BookCategory, string> = {
  supervision: "Supervision",
  methodology: "Méthodologie",
  writing: "Rédaction",
  "phd-guide": "Guide du doctorant",
};

// ── Helpers ─────────────────────────────────────────────────────
function countByCategory(category: BookCategory | "all"): number {
  if (category === "all") return BOOK_RESOURCES.length;
  return BOOK_RESOURCES.filter((b) => b.category === category).length;
}

// ── Component ───────────────────────────────────────────────────
export function BookLibraryPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedBook, setSelectedBook] = useState<BookResource | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredBooks = useMemo(() => {
    return BOOK_RESOURCES.filter((book) => {
      const matchesCategory =
        activeCategory === "all" || book.category === activeCategory;
      const query = search.toLowerCase();
      const matchesSearch =
        query === "" ||
        book.title.toLowerCase().includes(query) ||
        book.authors.toLowerCase().includes(query) ||
        book.tags.some((t) => t.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  const totalPages = BOOK_RESOURCES.reduce((sum, b) => sum + (b.pages ?? 0), 0);
  const uniqueCategories = new Set(BOOK_RESOURCES.map((b) => b.category)).size;

  function openDetails(book: BookResource) {
    setSelectedBook(book);
    setDialogOpen(true);
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 p-6">
      {/* ── Page header ──────────────────────────────────────── */}
      <header className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Library className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">
              Bibliothèque académique
            </h1>
            <Badge variant="secondary" className="text-xs font-medium">
              {BOOK_RESOURCES.length} ouvrage{BOOK_RESOURCES.length > 1 ? "s" : ""}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Ouvrages de référence pour la recherche doctorale
          </p>
        </div>
      </header>

      {/* ── Stats bar ────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-lg font-semibold leading-none">
                {BOOK_RESOURCES.length}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Ouvrages
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-lg font-semibold leading-none">
                {totalPages.toLocaleString("fr-FR")}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Pages au total
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-lg font-semibold leading-none">
                {uniqueCategories}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Catégories
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Separator />

      {/* ── Category filter bar ──────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {BOOK_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          const count = countByCategory(cat.id);
          return (
            <Button
              key={cat.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              className="rounded-full gap-1.5 text-xs h-8 px-3"
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.id !== "all" && (
                <span
                  className={`inline-block h-2 w-2 rounded-full ${
                    cat.id === "supervision"
                      ? "bg-[oklch(var(--chart-1))]"
                      : cat.id === "methodology"
                        ? "bg-[oklch(var(--chart-2))]"
                        : cat.id === "writing"
                          ? "bg-[oklch(var(--chart-4))]"
                          : "bg-[oklch(var(--chart-5))]"
                  }`}
                />
              )}
              {cat.label}
              <Badge
                variant="secondary"
                className={`ml-1 h-5 min-w-5 px-1.5 text-[10px] ${
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : ""
                }`}
              >
                {count}
              </Badge>
            </Button>
          );
        })}
      </div>

      {/* ── Search bar ───────────────────────────────────────── */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par titre, auteur ou tag..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* ── Book grid ────────────────────────────────────────── */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onDetails={openDetails}
            />
          ))}
        </div>
      ) : (
        /* ── Empty state ──────────────────────────────────────── */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-sm font-semibold">
            Aucun ouvrage trouvé
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Essayez de modifier vos filtres ou votre recherche pour trouver
            l'ouvrage que vous cherchez.
          </p>
        </div>
      )}

      {/* ── Book details dialog ──────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden">
          {selectedBook && <BookDetailsDialog book={selectedBook} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Book Card ────────────────────────────────────────────────────
function BookCard({
  book,
  onDetails,
}: {
  book: BookResource;
  onDetails: (book: BookResource) => void;
}) {
  return (
    <Card className="overflow-hidden flex flex-col border-l-4 border-l-transparent hover:shadow-md transition-shadow">
      {/* Category colour stripe via inline style fallback – uses class for oklch */}
      <div
        className={`border-l-4 ${CATEGORY_BORDER_COLORS[book.category]}`}
      >
        <CardHeader className="p-0">
          <div className="flex flex-col sm:flex-row">
            {/* Cover image — full width on mobile, fixed on desktop */}
            <div className="sm:w-[120px] shrink-0">
              <img
                src={book.coverSrc}
                alt={`Couverture de ${book.title}`}
                className="w-full sm:h-full object-cover rounded-b-lg sm:rounded-b-none sm:rounded-l-lg shadow-sm"
              />
            </div>

            {/* Info area */}
            <div className="flex flex-col flex-1 min-w-0 p-4 gap-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-sm font-semibold leading-snug line-clamp-2">
                  {book.title}
                </CardTitle>
                <Badge
                  variant="secondary"
                  className={`shrink-0 text-[10px] ${CATEGORY_COLORS[book.category]}`}
                >
                  {CATEGORY_LABELS[book.category]}
                </Badge>
              </div>

              {/* Authors */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <User className="h-3 w-3 shrink-0" />
                <span className="truncate">{book.authors}</span>
              </div>

              {/* Year + edition + publisher + ISBN */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {book.year}
                </span>
                {book.edition && (
                  <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                    {book.edition}
                  </Badge>
                )}
                {book.publisher && (
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    <span className="truncate max-w-[140px]">
                      {book.publisher}
                    </span>
                  </span>
                )}
                {book.isbn && (
                  <span className="inline-flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    {book.isbn}
                  </span>
                )}
              </div>

              {/* Description */}
              <CardDescription className="text-xs leading-relaxed line-clamp-3">
                {book.description}
              </CardDescription>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mt-auto">
                {book.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
      </div>

      {/* Card footer — actions */}
      <CardContent className="px-4 pb-3 pt-0">
        <Separator className="mb-3" />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs flex-1" asChild>
            <a href={book.pdfSrc} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
              Lire
            </a>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="gap-1.5 text-xs flex-1"
            onClick={() => onDetails(book)}
          >
            <Info className="h-3.5 w-3.5" />
            Détails
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Book Details Dialog ──────────────────────────────────────────
function BookDetailsDialog({ book }: { book: BookResource }) {
  return (
    <>
      <ScrollArea className="max-h-[80vh]">
        <div className="flex flex-col md:flex-row gap-6 p-6">
          {/* Cover image — large */}
          <div className="shrink-0 mx-auto md:mx-0">
            <img
              src={book.coverSrc}
              alt={`Couverture de ${book.title}`}
              className="w-[200px] rounded-lg shadow-md object-cover"
            />
          </div>

          {/* Full info */}
          <div className="flex-1 min-w-0 flex flex-col gap-3">
            <DialogHeader className="space-y-2 text-left p-0">
              <div className="flex items-start gap-3 flex-wrap">
                <DialogTitle className="text-lg font-bold leading-snug">
                  {book.title}
                </DialogTitle>
                <Badge
                  variant="secondary"
                  className={`shrink-0 text-[10px] ${CATEGORY_COLORS[book.category]}`}
                >
                  {CATEGORY_LABELS[book.category]}
                </Badge>
              </div>
              <DialogDescription className="sr-only">
                Détails de l'ouvrage {book.title}
              </DialogDescription>
            </DialogHeader>

            {/* Authors */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4 shrink-0" />
              <span>{book.authors}</span>
            </div>

            <Separator />

            {/* Metadata grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {book.year && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Année :</span>
                  <span className="font-medium">{book.year}</span>
                </div>
              )}
              {book.edition && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Édition :</span>
                  <span className="font-medium">{book.edition}</span>
                </div>
              )}
              {book.publisher && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Éditeur :</span>
                  <span className="font-medium">{book.publisher}</span>
                </div>
              )}
              {book.isbn && (
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">ISBN :</span>
                  <span className="font-medium">{book.isbn}</span>
                </div>
              )}
              {book.pages && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Pages :</span>
                  <span className="font-medium">
                    {book.pages.toLocaleString("fr-FR")}
                  </span>
                </div>
              )}
              {book.fileSize && (
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Taille :</span>
                  <span className="font-medium">{book.fileSize}</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Full description */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Description
              </h4>
              <p className="text-sm leading-relaxed text-foreground/90">
                {book.description}
              </p>
            </div>

            <Separator />

            {/* All tags */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Tags
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {book.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs gap-1"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Button size="sm" className="gap-2" asChild>
                <a href={book.pdfSrc} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Lire le PDF
                </a>
              </Button>
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <a href={book.pdfSrc} download>
                  <Download className="h-4 w-4" />
                  Télécharger
                </a>
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </>
  );
}
