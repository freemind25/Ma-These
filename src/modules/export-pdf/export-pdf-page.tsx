"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileDown,
  Printer,
  Eye,
  Settings2,
  BookOpen,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  FileText,
  User,
  Building2,
  Calendar,
  Users,
  List,
  Loader2,
} from "lucide-react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { toast } from 'sonner';

// ═══════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════

interface ThesisSummary {
  id: string;
  title: string;
  subtitle: string | null;
  author: string;
  institution: string | null;
  laboratory: string | null;
  discipline: string | null;
  directorName: string | null;
  status: string;
  chapters: { id: string; number: number; title: string; wordCount: number; status: string }[];
}

interface ChapterFull {
  id: string;
  number: number;
  title: string;
  romanNumeral: string | null;
  content: string;
  plainText: string;
  wordCount: number;
  status: string;
}

interface ExportOptions {
  fontSize: number;
  lineSpacing: number;
  margins: "normal" | "narrow" | "wide";
  includePageNumbers: boolean;
  includeToc: boolean;
  includeCoverPage: boolean;
}

interface ThesisMetadata {
  title: string;
  author: string;
  institution: string;
  year: string;
  director: string;
  subtitle: string;
  laboratory: string;
  discipline: string;
}

// ═══════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════

const MARGIN_MAP = {
  normal: { top: "2.5cm", bottom: "2.5cm", left: "2.5cm", right: "2.5cm" },
  narrow: { top: "1.5cm", bottom: "1.5cm", left: "1.5cm", right: "1.5cm" },
  wide: { top: "3.5cm", bottom: "3.5cm", left: "3.5cm", right: "3.5cm" },
};

const STATUS_LABELS: Record<string, string> = {
  not_started: "Non commencé",
  in_progress: "En cours",
  draft: "Brouillon",
  review: "En révision",
  completed: "Terminé",
};

function getStatusColor(status: string): string {
  switch (status) {
    case "completed":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
    case "in_progress":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20";
    case "draft":
      return "bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/20";
    case "review":
      return "bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

// ═══════════════════════════════════════════════════
// Helper: strip HTML to plain text
// ═══════════════════════════════════════════════════

function toRomanNumeral(num: number): string {
  const romanNumerals: [number, string][] = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let result = "";
  let remaining = num;
  for (const [value, symbol] of romanNumerals) {
    while (remaining >= value) {
      result += symbol;
      remaining -= value;
    }
  }
  return result;
}

// ═══════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════

export function ExportPdfPage() {
  // State
  const [theses, setTheses] = useState<ThesisSummary[]>([]);
  const [selectedThesisId, setSelectedThesisId] = useState<string | null>(null);
  const [chapters, setChapters] = useState<ChapterFull[]>([]);
  const [selectedChapterIds, setSelectedChapterIds] = useState<Set<string>>(new Set());
  const [isLoadingTheses, setIsLoadingTheses] = useState(true);
  const [isLoadingChapters, setIsLoadingChapters] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("configuration");

  const [metadata, setMetadata] = useState<ThesisMetadata>({
    title: "",
    author: "",
    institution: "",
    year: new Date().getFullYear().toString(),
    director: "",
    subtitle: "",
    laboratory: "",
    discipline: "",
  });

  const [options, setOptions] = useState<ExportOptions>({
    fontSize: 12,
    lineSpacing: 1.5,
    margins: "normal",
    includePageNumbers: true,
    includeToc: true,
    includeCoverPage: true,
  });

  const [pdfGenerating, setPdfGenerating] = useState(false);

  const previewRef = useRef<HTMLIFrameElement>(null);

  // Fetch theses list
  useEffect(() => {
    async function fetchTheses() {
      setIsLoadingTheses(true);
      try {
        const res = await fetch("/api/thesis");
        if (!res.ok) throw new Error("Erreur lors du chargement des thèses");
        const json = await res.json();
        setTheses(json.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setIsLoadingTheses(false);
      }
    }
    fetchTheses();
  }, []);

  // When thesis selected, fetch full chapters & populate metadata
  useEffect(() => {
    if (!selectedThesisId) {
      setChapters([]);
      return;
    }
    async function fetchChapters() {
      setIsLoadingChapters(true);
      setError(null);
      try {
        const res = await fetch(`/api/thesis/${selectedThesisId}/chapters`);
        if (!res.ok) throw new Error("Erreur lors du chargement des chapitres");
        const json = await res.json();
        const fullChapters: ChapterFull[] = json.data || [];
        setChapters(fullChapters);

        // Auto-select all chapters
        setSelectedChapterIds(new Set(fullChapters.map((ch) => ch.id)));

        // Populate metadata from thesis
        const thesis = theses.find((t) => t.id === selectedThesisId);
        if (thesis) {
          setMetadata({
            title: thesis.title || "",
            author: thesis.author || "",
            institution: thesis.institution || "",
            year: new Date().getFullYear().toString(),
            director: thesis.directorName || "",
            subtitle: thesis.subtitle || "",
            laboratory: thesis.laboratory || "",
            discipline: thesis.discipline || "",
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setIsLoadingChapters(false);
      }
    }
    fetchChapters();
  }, [selectedThesisId, theses]);

  // Chapter toggle
  const toggleChapter = useCallback((id: string) => {
    setSelectedChapterIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAllChapters = useCallback(() => {
    if (selectedChapterIds.size === chapters.length) {
      setSelectedChapterIds(new Set());
    } else {
      setSelectedChapterIds(new Set(chapters.map((ch) => ch.id)));
    }
  }, [selectedChapterIds.size, chapters]);

  // Selected chapters in order
  const selectedChapters = useMemo(
    () => chapters.filter((ch) => selectedChapterIds.has(ch.id)).sort((a, b) => a.number - b.number),
    [chapters, selectedChapterIds]
  );

  // Total word count
  const totalWords = useMemo(
    () => selectedChapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0),
    [selectedChapters]
  );

  // ═══════════════════════════════════════════════════
  // Generate printable HTML
  // ═══════════════════════════════════════════════════

  const generatePrintHtml = useCallback(() => {
    const margins = MARGIN_MAP[options.margins];
    const fs = options.fontSize;
    const lh = options.lineSpacing;

    let bodyContent = "";

    // Cover page
    if (options.includeCoverPage) {
      bodyContent += `
        <div class="cover-page" style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          text-align: center;
          page-break-after: always;
          padding: 4cm 2cm;
        ">
          <div style="margin-bottom: 60px;">
            <div style="font-size: ${fs + 2}px; text-transform: uppercase; letter-spacing: 3px; color: #666; margin-bottom: 30px;">
              ${metadata.institution || "Université"}
            </div>
            ${metadata.laboratory ? `<div style="font-size: ${fs - 1}px; color: #888; margin-bottom: 40px;">${metadata.laboratory}</div>` : ""}
            ${metadata.discipline ? `<div style="font-size: ${fs - 1}px; color: #888; margin-bottom: 50px;">Discipline : ${metadata.discipline}</div>` : ""}
          </div>
          <div style="margin-bottom: 40px;">
            <h1 style="font-size: ${fs * 2.2}px; font-weight: 700; line-height: 1.3; color: #1a1a1a; margin: 0; max-width: 600px;">
              ${metadata.title || "Titre de la thèse"}
            </h1>
            ${metadata.subtitle ? `<p style="font-size: ${fs * 1.3}px; color: #555; margin-top: 16px; font-style: italic;">${metadata.subtitle}</p>` : ""}
          </div>
          <div style="margin-top: 80px;">
            <div style="font-size: ${fs + 2}px; margin-bottom: 10px;">
              <span style="color: #888;">Présentée par</span>
            </div>
            <div style="font-size: ${fs * 1.4}px; font-weight: 600; color: #1a1a1a;">
              ${metadata.author || "Auteur"}
            </div>
            <div style="margin-top: 30px; font-size: ${fs + 1}px; color: #555;">
              <span style="color: #888;">Sous la direction de</span> : <strong>${metadata.director || "Directeur"}</strong>
            </div>
          </div>
          <div style="margin-top: 80px; font-size: ${fs}px; color: #888;">
            ${metadata.year}
          </div>
        </div>
      `;
    }

    // Table of contents
    if (options.includeToc && selectedChapters.length > 0) {
      bodyContent += `
        <div class="toc-page" style="page-break-after: always; padding: 1cm 0;">
          <h2 style="font-size: ${fs * 1.5}px; font-weight: 700; margin-bottom: 24px; color: #1a1a1a; text-align: center;">
            Table des matières
          </h2>
          <div style="border-top: 2px solid #1a1a1a; padding-top: 16px;">
            ${selectedChapters
              .map(
                (ch) => `
                <div style="display: flex; justify-content: space-between; align-items: baseline; padding: 6px 0; border-bottom: 1px dotted #ccc;">
                  <span style="font-size: ${fs}px;">
                    <span style="font-weight: 600; margin-right: 8px;">${ch.romanNumeral || toRomanNumeral(ch.number)}.</span>
                    ${ch.title}
                  </span>
                  <span style="font-size: ${fs - 1}px; color: #888;">${ch.wordCount || 0} mots</span>
                </div>
              `
              )
              .join("")}
          </div>
        </div>
      `;
    }

    // Chapter content
    selectedChapters.forEach((ch) => {
      const contentHtml = ch.content || `<p><em>Ce chapitre ne contient pas encore de contenu.</em></p>`;
      bodyContent += `
        <div class="chapter" style="page-break-before: always;">
          <h2 style="
            font-size: ${fs * 1.6}px;
            font-weight: 700;
            margin-bottom: 24px;
            padding-bottom: 8px;
            border-bottom: 2px solid #1a1a1a;
            color: #1a1a1a;
          ">
            <span style="margin-right: 12px;">${ch.romanNumeral || toRomanNumeral(ch.number)}.</span>
            ${ch.title}
          </h2>
          <div class="chapter-content" style="font-size: ${fs}px; line-height: ${lh}; color: #333;">
            ${contentHtml}
          </div>
        </div>
      `;
    });

    const fullHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${metadata.title || "Thèse"} — ${metadata.author}</title>
  <style>
    @page {
      size: A4;
      margin: ${margins.top} ${margins.right} ${margins.bottom} ${margins.left};
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: "Times New Roman", Times, Georgia, serif;
      color: #1a1a1a;
      background: white;
      font-size: ${fs}px;
      line-height: ${lh};
    }
    .chapter-content p {
      margin-bottom: ${8 * lh}px;
      text-align: justify;
    }
    .chapter-content h1,
    .chapter-content h2,
    .chapter-content h3,
    .chapter-content h4 {
      margin-top: ${16 * lh}px;
      margin-bottom: ${8 * lh}px;
      font-weight: 600;
    }
    .chapter-content h1 { font-size: ${fs * 1.4}px; }
    .chapter-content h2 { font-size: ${fs * 1.25}px; }
    .chapter-content h3 { font-size: ${fs * 1.1}px; }
    .chapter-content ul,
    .chapter-content ol {
      margin-left: 1.5em;
      margin-bottom: ${8 * lh}px;
    }
    .chapter-content li {
      margin-bottom: ${4 * lh}px;
    }
    .chapter-content blockquote {
      border-left: 3px solid #ccc;
      padding-left: 1em;
      margin: ${8 * lh}px 0;
      font-style: italic;
      color: #555;
    }
    .chapter-content strong { font-weight: 700; }
    .chapter-content em { font-style: italic; }
    ${options.includePageNumbers ? `
    @page {
      @bottom-center {
        content: counter(page);
        font-size: ${fs - 1}px;
        color: #888;
      }
    }
    ` : ""}
    @media print {
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  ${bodyContent}
</body>
</html>`;

    return fullHtml;
  }, [options, metadata, selectedChapters]);

  // Update preview
  useEffect(() => {
    if (!previewRef.current || selectedChapters.length === 0) return;
    const html = generatePrintHtml();
    const doc = previewRef.current.contentDocument || previewRef.current.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
    }
  }, [generatePrintHtml, selectedChapters.length]);

  // Print handler
  const handlePrint = useCallback(() => {
    const html = generatePrintHtml();
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setError("Impossible d'ouvrir la fenêtre d'impression. Veuillez autoriser les popups.");
      return;
    }
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    // Wait for content to render before printing
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }, [generatePrintHtml]);

  // Download HTML file
  const handleDownloadHtml = useCallback(() => {
    const html = generatePrintHtml();
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(metadata.title || "these").replace(/[^a-zA-Z0-9àâäéèêëïîôùûüç\s-]/g, "_").trim().replace(/\s+/g, "_")}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [generatePrintHtml, metadata.title]);

  // Download real PDF via jsPDF + html2canvas
  const handleDownloadPdf = useCallback(async () => {
    setPdfGenerating(true);
    setError(null);
    try {
      const html = generatePrintHtml();

      // Create off-screen container with just the body content
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '210mm'; // A4 width
      container.style.background = 'white';

      // Extract body content from full HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      container.innerHTML = doc.body.innerHTML;
      // Copy styles from the HTML
      const styleEl = doc.querySelector('style');
      if (styleEl) {
        const s = document.createElement('style');
        s.textContent = styleEl.textContent;
        container.prepend(s);
      }
      document.body.appendChild(container);

      // Wait for rendering
      await new Promise(r => setTimeout(r, 200));

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10; // mm

      const imgWidth = pageWidth - 2 * margin;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = margin;

      // First page
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', margin, margin, imgWidth, imgHeight);
      heightLeft -= (pageHeight - 2 * margin);

      // Additional pages
      while (heightLeft > 0) {
        position = -(pageHeight - 2 * margin - margin) + margin;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', margin, position - margin, imgWidth, imgHeight);
        heightLeft -= (pageHeight - 2 * margin);
      }

      const filename = `${(metadata.title || 'these').replace(/[^a-zA-Z0-9àâäéèêëïîôùûüç\s-]/g, '_').trim().replace(/\s+/g, '_')}.pdf`;
      pdf.save(filename);

      document.body.removeChild(container);
      toast.success('PDF téléchargé avec succès');
    } catch (err) {
      console.error('PDF generation error:', err);
      setError('Erreur lors de la génération du PDF. Veuillez réessayer.');
    } finally {
      setPdfGenerating(false);
    }
  }, [generatePrintHtml, metadata.title]);

  // ═══════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 p-6 w-full">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <FileDown className="h-6 w-6 text-primary" />
          Export PDF
        </h1>
        <p className="text-sm text-muted-foreground">
          Sélectionnez vos chapitres, configurez la mise en forme et exportez votre thèse en PDF
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {isLoadingTheses && (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-60 w-full" />
        </div>
      )}

      {/* No theses */}
      {!isLoadingTheses && theses.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
              <GraduationCap className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <h3 className="text-sm font-medium">Aucune thèse disponible</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-[360px]">
              Créez d'abord une thèse dans l'éditeur avant de pouvoir l'exporter en PDF.
            </p>
            <Button
              variant="outline"
              className="mt-4 gap-2"
              onClick={() => {
                // Navigate to editor via store
                import("@/lib/stores/app-store").then(({ useAppStore }) => {
                  useAppStore.getState().setCurrentView("editor");
                });
              }}
            >
              <FileText className="h-4 w-4" />
              Aller à l'éditeur
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      {!isLoadingTheses && theses.length > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="configuration" className="gap-2">
              <Settings2 className="h-4 w-4" />
              <span className="hidden sm:inline">Configuration</span>
            </TabsTrigger>
            <TabsTrigger value="apercu" className="gap-2" disabled={!selectedThesisId || selectedChapters.length === 0}>
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Aperçu</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="gap-2" disabled={!selectedThesisId || selectedChapters.length === 0}>
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Exporter</span>
            </TabsTrigger>
          </TabsList>

          {/* ══════ TAB: Configuration ══════ */}
          <TabsContent value="configuration" className="flex flex-col gap-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Thesis Selection + Chapters */}
              <div className="flex flex-col gap-6">
                {/* Thesis Selector */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Sélection de la thèse
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Choisissez la thèse à exporter
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <Select
                      value={selectedThesisId || ""}
                      onValueChange={setSelectedThesisId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une thèse..." />
                      </SelectTrigger>
                      <SelectContent>
                        {theses.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            <span className="flex items-center gap-2">
                              <span className="truncate max-w-[280px]">{t.title}</span>
                              <Badge variant="outline" className="text-[10px] h-5 shrink-0">
                                {t.chapters.length} chap.
                              </Badge>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {/* Chapter Selection */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <List className="h-4 w-4" />
                          Chapitres à exporter
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {selectedChapterIds.size} sur {chapters.length} chapitres sélectionnés · {totalWords.toLocaleString("fr-FR")} mots
                        </CardDescription>
                      </div>
                      {chapters.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs gap-1.5"
                          onClick={toggleAllChapters}
                        >
                          {selectedChapterIds.size === chapters.length ? (
                            <>
                              <ChevronDown className="h-3.5 w-3.5" />
                              Tout désélectionner
                            </>
                          ) : (
                            <>
                              <ChevronUp className="h-3.5 w-3.5" />
                              Tout sélectionner
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingChapters ? (
                      <div className="flex flex-col gap-3">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ) : chapters.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">
                        {selectedThesisId ? "Aucun chapitre trouvé pour cette thèse." : "Sélectionnez d'abord une thèse."}
                      </p>
                    ) : (
                      <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
                        {chapters
                          .sort((a, b) => a.number - b.number)
                          .map((ch) => {
                            const isSelected = selectedChapterIds.has(ch.id);
                            return (
                              <label
                                key={ch.id}
                                className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-all hover:bg-muted/50 ${
                                  isSelected ? "border-primary/50 bg-primary/5" : "border-border"
                                }`}
                              >
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => toggleChapter(ch.id)}
                                  className="mt-0.5"
                                />
                                <div className="flex flex-col gap-1 min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-muted-foreground shrink-0">
                                      {ch.romanNumeral || toRomanNumeral(ch.number)}.
                                    </span>
                                    <span className="text-sm font-medium truncate">
                                      {ch.title}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className={`text-[10px] h-5 ${getStatusColor(ch.status)}`}
                                    >
                                      {STATUS_LABELS[ch.status] || ch.status}
                                    </Badge>
                                    <span className="text-[11px] text-muted-foreground">
                                      {(ch.wordCount || 0).toLocaleString("fr-FR")} mots
                                    </span>
                                    {isSelected && (
                                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 ml-auto" />
                                    )}
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right: Metadata + Options */}
              <div className="flex flex-col gap-6">
                {/* Thesis Metadata */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Métadonnées de la thèse
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Informations affichées sur la page de couverture
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5" />
                        Titre de la thèse
                      </Label>
                      <Input
                        value={metadata.title}
                        onChange={(e) => setMetadata((m) => ({ ...m, title: e.target.value }))}
                        placeholder="Titre principal"
                        className="text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">Sous-titre</Label>
                      <Input
                        value={metadata.subtitle}
                        onChange={(e) => setMetadata((m) => ({ ...m, subtitle: e.target.value }))}
                        placeholder="Sous-titre optionnel"
                        className="text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5" />
                          Auteur
                        </Label>
                        <Input
                          value={metadata.author}
                          onChange={(e) => setMetadata((m) => ({ ...m, author: e.target.value }))}
                          placeholder="Nom de l'auteur"
                          className="text-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          Directeur
                        </Label>
                        <Input
                          value={metadata.director}
                          onChange={(e) => setMetadata((m) => ({ ...m, director: e.target.value }))}
                          placeholder="Nom du directeur"
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5" />
                          Établissement
                        </Label>
                        <Input
                          value={metadata.institution}
                          onChange={(e) => setMetadata((m) => ({ ...m, institution: e.target.value }))}
                          placeholder="Université / École"
                          className="text-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          Année
                        </Label>
                        <Input
                          value={metadata.year}
                          onChange={(e) => setMetadata((m) => ({ ...m, year: e.target.value }))}
                          placeholder="2025"
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs">Laboratoire</Label>
                        <Input
                          value={metadata.laboratory}
                          onChange={(e) => setMetadata((m) => ({ ...m, laboratory: e.target.value }))}
                          placeholder="Nom du laboratoire"
                          className="text-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs">Discipline</Label>
                        <Input
                          value={metadata.discipline}
                          onChange={(e) => setMetadata((m) => ({ ...m, discipline: e.target.value }))}
                          placeholder="Discipline doctorale"
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Formatting Options */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Settings2 className="h-4 w-4" />
                      Options de mise en forme
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Configurez l'apparence du document exporté
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    {/* Font size */}
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">Taille de la police</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {[10, 11, 12].map((size) => (
                          <Button
                            key={size}
                            variant={options.fontSize === size ? "default" : "outline"}
                            size="sm"
                            className="text-xs"
                            onClick={() => setOptions((o) => ({ ...o, fontSize: size }))}
                          >
                            {size} pt
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Line spacing */}
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">Interligne</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {[1.0, 1.5, 2.0].map((spacing) => (
                          <Button
                            key={spacing}
                            variant={options.lineSpacing === spacing ? "default" : "outline"}
                            size="sm"
                            className="text-xs"
                            onClick={() => setOptions((o) => ({ ...o, lineSpacing: spacing }))}
                          >
                            {spacing.toFixed(1)}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Margins */}
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs">Marges</Label>
                      <Select
                        value={options.margins}
                        onValueChange={(v) => setOptions((o) => ({ ...o, margins: v as ExportOptions["margins"] }))}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="narrow">Réduites (1,5 cm)</SelectItem>
                          <SelectItem value="normal">Normales (2,5 cm)</SelectItem>
                          <SelectItem value="wide">Larges (3,5 cm)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    {/* Checkboxes */}
                    <div className="flex flex-col gap-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <Checkbox
                          checked={options.includeCoverPage}
                          onCheckedChange={(checked) =>
                            setOptions((o) => ({ ...o, includeCoverPage: !!checked }))
                          }
                        />
                        <div className="flex flex-col">
                          <span className="text-sm">Page de couverture</span>
                          <span className="text-xs text-muted-foreground">
                            Générer automatiquement une page de titre
                          </span>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <Checkbox
                          checked={options.includeToc}
                          onCheckedChange={(checked) =>
                            setOptions((o) => ({ ...o, includeToc: !!checked }))
                          }
                        />
                        <div className="flex flex-col">
                          <span className="text-sm">Table des matières</span>
                          <span className="text-xs text-muted-foreground">
                            Inclure une table des matières avec les chapitres sélectionnés
                          </span>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <Checkbox
                          checked={options.includePageNumbers}
                          onCheckedChange={(checked) =>
                            setOptions((o) => ({ ...o, includePageNumbers: !!checked }))
                          }
                        />
                        <div className="flex flex-col">
                          <span className="text-sm">Numéros de page</span>
                          <span className="text-xs text-muted-foreground">
                            Afficher les numéros de page en bas de chaque page
                          </span>
                        </div>
                      </label>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Action bar */}
            {selectedThesisId && selectedChapters.length > 0 && (
              <Card className="bg-muted/30">
                <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileDown className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {selectedChapters.length} chapitre{selectedChapters.length > 1 ? "s" : ""} prêt{selectedChapters.length > 1 ? "s" : ""} à exporter
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {totalWords.toLocaleString("fr-FR")} mots · {options.fontSize}pt · interligne {options.lineSpacing}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => setActiveTab("apercu")}>
                      <Eye className="h-4 w-4" />
                      Aperçu
                    </Button>
                    <Button size="sm" className="gap-2" onClick={() => setActiveTab("export")}>
                      <Printer className="h-4 w-4" />
                      Exporter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ══════ TAB: Preview ══════ */}
          <TabsContent value="apercu" className="flex flex-col gap-4 mt-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Aperçu du document
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Prévisualisation de la mise en page finale · {selectedChapters.length} chapitres
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => setActiveTab("configuration")}>
                    <Settings2 className="h-4 w-4" />
                    Modifier
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="border rounded-lg overflow-hidden bg-white">
                  <iframe
                    ref={previewRef}
                    title="Aperçu du document"
                    className="w-full border-0"
                    style={{
                      height: "700px",
                      background: "white",
                    }}
                    sandbox="allow-same-origin"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ══════ TAB: Export ══════ */}
          <TabsContent value="export" className="flex flex-col gap-6 mt-6">
            {/* Summary Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileDown className="h-4 w-4" />
                  Résumé de l'export
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Chapitres</span>
                    <span className="text-lg font-semibold tabular-nums">{selectedChapters.length}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Mots totaux</span>
                    <span className="text-lg font-semibold tabular-nums">{totalWords.toLocaleString("fr-FR")}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Pages estimées</span>
                    <span className="text-lg font-semibold tabular-nums">~{Math.max(1, Math.ceil(totalWords / 350))}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Format</span>
                    <span className="text-lg font-semibold">A4 PDF</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Options Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Settings2 className="h-4 w-4" />
                  Options sélectionnées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 rounded-lg border p-3">
                    <span className="text-xs text-muted-foreground">Police</span>
                    <span className="text-sm font-medium ml-auto">{options.fontSize} pt</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border p-3">
                    <span className="text-xs text-muted-foreground">Interligne</span>
                    <span className="text-sm font-medium ml-auto">{options.lineSpacing.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border p-3">
                    <span className="text-xs text-muted-foreground">Marges</span>
                    <span className="text-sm font-medium ml-auto">
                      {options.margins === "narrow" ? "Réduites" : options.margins === "wide" ? "Larges" : "Normales"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border p-3">
                    <span className="text-xs text-muted-foreground">Couverture</span>
                    <Badge variant={options.includeCoverPage ? "default" : "outline"} className="text-[10px] h-5 ml-auto">
                      {options.includeCoverPage ? "Oui" : "Non"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border p-3">
                    <span className="text-xs text-muted-foreground">TDM</span>
                    <Badge variant={options.includeToc ? "default" : "outline"} className="text-[10px] h-5 ml-auto">
                      {options.includeToc ? "Oui" : "Non"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border p-3">
                    <span className="text-xs text-muted-foreground">N° pages</span>
                    <Badge variant={options.includePageNumbers ? "default" : "outline"} className="text-[10px] h-5 ml-auto">
                      {options.includePageNumbers ? "Oui" : "Non"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chapter List for Export */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <List className="h-4 w-4" />
                  Contenu de l'export
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  {options.includeCoverPage && (
                    <div className="flex items-center gap-3 rounded-lg border p-3 bg-muted/30">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Page de couverture</span>
                      <span className="text-xs text-muted-foreground ml-auto">Générée automatiquement</span>
                    </div>
                  )}
                  {options.includeToc && (
                    <div className="flex items-center gap-3 rounded-lg border p-3 bg-muted/30">
                      <List className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Table des matières</span>
                      <span className="text-xs text-muted-foreground ml-auto">{selectedChapters.length} entrées</span>
                    </div>
                  )}
                  {selectedChapters.map((ch) => (
                    <div key={ch.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-semibold text-muted-foreground">
                        {ch.romanNumeral || toRomanNumeral(ch.number)}.
                      </span>
                      <span className="text-sm font-medium flex-1 truncate">{ch.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {(ch.wordCount || 0).toLocaleString("fr-FR")} mots
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Export Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={handlePrint}>
                <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    <Printer className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">Imprimer en PDF</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ouvre la boîte de dialogue d'impression du navigateur pour sauvegarder en PDF
                    </p>
                  </div>
                  <Button className="gap-2 mt-2">
                    <Printer className="h-4 w-4" />
                    Imprimer / Sauvegarder PDF
                  </Button>
                </CardContent>
              </Card>

              <Card className={`hover:shadow-md transition-shadow ${pdfGenerating ? 'opacity-70 pointer-events-none' : 'cursor-pointer group'}`} onClick={pdfGenerating ? undefined : handleDownloadPdf}>
                <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                    {pdfGenerating ? <Loader2 className="h-6 w-6 animate-spin" /> : <FileDown className="h-6 w-6" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">Télécharger PDF</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Génère et télécharge un fichier PDF directement sans passer par l'impression
                    </p>
                  </div>
                  <Button className="gap-2 mt-2" disabled={pdfGenerating}>
                    {pdfGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                    {pdfGenerating ? 'Génération en cours…' : 'Télécharger PDF'}
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={handleDownloadHtml}>
                <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                    <FileDown className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">Télécharger HTML</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Téléchargez le document formaté en HTML pour impression ultérieure
                    </p>
                  </div>
                  <Button variant="outline" className="gap-2 mt-2">
                    <FileDown className="h-4 w-4" />
                    Télécharger HTML
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
