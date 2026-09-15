"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileDown,
  FileText,
  GraduationCap,
  Settings2,
  BookOpen,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ListChecks,
  Type,
  Printer,
} from "lucide-react";
import { toast } from "sonner";

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

interface DocxOptions {
  includeCover: boolean;
  includeToc: boolean;
  includeReferences: boolean;
  lineSpacing: "1.15" | "1.5" | "2.0";
  fontSize: "11" | "12" | "13";
  margins: "normal" | "narrow" | "wide";
  headerText: string;
  includePageNumbers: boolean;
}

// ═══════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════

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
// Main Component
// ═══════════════════════════════════════════════════

export function ExportDocxPage() {
  const [theses, setTheses] = useState<ThesisSummary[]>([]);
  const [selectedThesisId, setSelectedThesisId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const [options, setOptions] = useState<DocxOptions>({
    includeCover: true,
    includeToc: true,
    includeReferences: true,
    lineSpacing: "1.5",
    fontSize: "12",
    margins: "normal",
    headerText: "",
    includePageNumbers: true,
  });

  const selectedThesis = theses.find((t) => t.id === selectedThesisId);
  const totalWords = selectedThesis?.chapters.reduce((s, c) => s + (c.wordCount || 0), 0) || 0;
  const completedChapters = selectedThesis?.chapters.filter((c) => c.status === "completed" || c.status === "draft" || c.status === "review").length || 0;
  const totalChapters = selectedThesis?.chapters.length || 0;

  // Fetch theses
  useEffect(() => {
    async function fetchTheses() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/thesis");
        if (!res.ok) throw new Error("Erreur lors du chargement des thèses");
        const json = await res.json();
        const list: ThesisSummary[] = json.data || [];
        setTheses(list);
        // Auto-select first thesis
        if (list.length > 0) setSelectedThesisId(list[0].id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setIsLoading(false);
      }
    }
    fetchTheses();
  }, []);

  // Update header text when thesis changes
  useEffect(() => {
    if (selectedThesis) {
      setOptions((prev) => ({
        ...prev,
        headerText: selectedThesis.title || "",
      }));
    }
  }, [selectedThesisId]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleOption = (key: keyof DocxOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExport = useCallback(async () => {
    if (!selectedThesisId) {
      toast.error("Veuillez sélectionner une thèse.");
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/export-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thesisId: selectedThesisId, options }),
      });
      if (!res.ok) {
        const errData = (await res.json()) as { error?: string };
        throw new Error(errData.error || `Erreur HTTP ${res.status}`);
      }
      // Download the file
      const blob = await res.blob();
      const filename = selectedThesis
        ? `${selectedThesis.author || "these"}_${selectedThesis.title?.slice(0, 40).replace(/[^a-zA-ZÀ-ÿ0-9]/g, "_") || "sans-titre"}.docx`
        : "these.docx";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Document DOCX généré avec succès (${totalWords.toLocaleString()} mots).`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue.";
      setError(msg);
      toast.error(msg);
    } finally {
      setGenerating(false);
    }
  }, [selectedThesisId, options, selectedThesis, totalWords]);

  // ═══════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileDown className="h-7 w-7 text-primary" />
          Export DOCX
        </h1>
        <p className="text-muted-foreground mt-1">
          Générez un document Word formaté avec styles APA, table des matières et numérotation.
          <br />
          <span className="text-xs">Inspiré de Stylify — formatage professionnel directement dans Word</span>
        </p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-8 space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ) : theses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Aucune thèse disponible.</p>
            <p className="text-sm text-muted-foreground mt-1">Créez d&apos;abord une thèse dans l&apos;éditeur.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Thesis Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Sélection de la thèse
              </CardTitle>
              <CardDescription>Choisissez la thèse à exporter en document Word.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={selectedThesisId || ""}
                onValueChange={(v) => setSelectedThesisId(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une thèse..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {theses.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      <span className="flex items-center gap-2">
                        <span className="truncate max-w-[300px]">{t.title}</span>
                        <Badge
                          variant="outline"
                          className={`text-[9px] shrink-0 ${getStatusColor(t.status)}`}
                        >
                          {STATUS_LABELS[t.status] || t.status}
                        </Badge>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Thesis Summary */}
              {selectedThesis && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold">{totalChapters}</p>
                    <p className="text-xs text-muted-foreground">Chapitres</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold">{totalWords.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Mots</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold">{completedChapters}</p>
                    <p className="text-xs text-muted-foreground">Rédigés</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold">
                      {totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0}%
                    </p>
                    <p className="text-xs text-muted-foreground">Progression</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Formatting Options */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Options de formatage
              </CardTitle>
              <CardDescription>
                Configurez le formatage du document Word généré.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Structure Options */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                  <ListChecks className="h-4 w-4" />
                  Structure du document
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2.5 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                    <Checkbox
                      checked={options.includeCover}
                      onCheckedChange={() => toggleOption("includeCover")}
                    />
                    <div>
                      <p className="text-sm font-medium">Page de garde</p>
                      <p className="text-xs text-muted-foreground">Titre, auteur, directeur</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-2.5 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                    <Checkbox
                      checked={options.includeToc}
                      onCheckedChange={() => toggleOption("includeToc")}
                    />
                    <div>
                      <p className="text-sm font-medium">Table des matières</p>
                      <p className="text-xs text-muted-foreground">Numéros de page (i, ii, iii...)</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-2.5 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                    <Checkbox
                      checked={options.includeReferences}
                      onCheckedChange={() => toggleOption("includeReferences")}
                    />
                    <div>
                      <p className="text-sm font-medium">Références</p>
                      <p className="text-xs text-muted-foreground">Bibliographie APA</p>
                    </div>
                  </label>
                </div>
              </div>

              <Separator />

              {/* Typography Options */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                  <Type className="h-4 w-4" />
                  Typographie
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">Taille de police</Label>
                    <Select
                      value={options.fontSize}
                      onValueChange={(v) =>
                        setOptions((prev) => ({
                          ...prev,
                          fontSize: v as DocxOptions["fontSize"],
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="11">11pt (compact)</SelectItem>
                        <SelectItem value="12">12pt (standard APA)</SelectItem>
                        <SelectItem value="13">13pt (confortable)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">Interligne</Label>
                    <Select
                      value={options.lineSpacing}
                      onValueChange={(v) =>
                        setOptions((prev) => ({
                          ...prev,
                          lineSpacing: v as DocxOptions["lineSpacing"],
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1.15">Simple (1.15)</SelectItem>
                        <SelectItem value="1.5">Semi-double (1.5)</SelectItem>
                        <SelectItem value="2.0">Double (2.0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">Marges</Label>
                    <Select
                      value={options.margins}
                      onValueChange={(v) =>
                        setOptions((prev) => ({
                          ...prev,
                          margins: v as DocxOptions["margins"],
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="narrow">Étroites (1.5 cm)</SelectItem>
                        <SelectItem value="normal">Normales (2.5 cm)</SelectItem>
                        <SelectItem value="wide">Larges (3.5 cm)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Header / Footer */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                  <Printer className="h-4 w-4" />
                  En-tête et pied de page
                </h3>
                <div className="space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">Texte d&apos;en-tête</Label>
                    <Input
                      value={options.headerText}
                      onChange={(e) =>
                        setOptions((prev) => ({ ...prev, headerText: e.target.value }))
                      }
                      placeholder="Titre de la thèse..."
                      className="max-w-md"
                    />
                    <p className="text-xs text-muted-foreground">
                      Affiché en haut de chaque page (sauf la page de garde).
                    </p>
                  </div>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <Checkbox
                      checked={options.includePageNumbers}
                      onCheckedChange={() => toggleOption("includePageNumbers")}
                    />
                    <span className="text-sm">Inclure les numéros de page</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview / Features Info */}
          <Card className="bg-muted/30">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">Ce que le document inclut :</p>
                  <ul className="list-disc list-inside space-y-0.5 text-xs">
                    <li>Styles Word réels (Titre 1/2/3, Normal) — modifiables dans Word</li>
                    <li>Polices Times New Roman avec tailles académiques</li>
                    <li>Titres de chapitres numérotés (I. Introduction, 1.1 Contexte...)</li>
                    <li>Paragraphe justifié avec alinéa français</li>
                    <li>Formatage gras/italique préservé du contenu HTML</li>
                    <li>Table des matières dynamique (clic droit → Mettre à jour les champs)</li>
                    {options.includeReferences && <li>Références bibliographiques en style APA</li>}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error */}
          {error && (
            <Card className="border-red-200 bg-red-50 dark:border-red-800/50 dark:bg-red-950/20">
              <CardContent className="py-3 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Export Button */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleExport}
              disabled={generating || !selectedThesisId}
              size="lg"
              className="gap-2"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Générer le document DOCX
                </>
              )}
            </Button>
            {generating && (
              <p className="text-sm text-muted-foreground">
                Le serveur génère le document Word avec les styles demandés...
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
