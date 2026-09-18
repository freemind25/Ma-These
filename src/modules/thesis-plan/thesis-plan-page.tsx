"use client";

import { useState, useCallback } from "react";
import {
  ListTree,
  Copy,
  Check,
  FileText,
  AlertCircle,
  ArrowRight,
  Plus,
  Trash2,
  GripVertical,
  Pencil,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  useTheses,
  useUpdateThesis,
  useParts,
  useCreatePart,
  useUpdatePart,
  useDeletePart,
  useCreateChapter,
  useUpdateChapter,
  type ThesisChapter,
  type ThesisPart,
} from "@/modules/editor/hooks/use-thesis";
import { useAppStore } from "@/lib/stores/app-store";
import { toast } from "sonner";

// ═══════════════════════════════════════
// Constants
// ═══════════════════════════════════════

const ROMAN_NUMERALS = [
  "I", "II", "III", "IV", "V",
  "VI", "VII", "VIII", "IX", "X",
  "XI", "XII", "XIII", "XIV", "XV",
];

const DISCIPLINES = [
  { value: "lettres", label: "Lettres et Sciences Humaines" },
  { value: "sciences", label: "Sciences Exactes" },
  { value: "stg", label: "Sciences et Techniques du Génie" },
  { value: "svt", label: "Sciences de la Vie et de la Terre" },
  { value: "droit", label: "Droit et Sciences Politiques" },
  { value: "economie", label: "Sciences Économiques et de Gestion" },
  { value: "info", label: "Informatique" },
  { value: "sante", label: "Sciences de la Santé" },
];

const STATUS_MAP: Record<
  string,
  { label: string; className: string }
> = {
  not_started: { label: "Non commencé", className: "bg-outline text-foreground border-outline-foreground/30" },
  in_progress: { label: "En cours", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
  draft: { label: "Brouillon", className: "bg-secondary text-secondary-foreground border-secondary" },
  review: { label: "Révision", className: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 border-sky-200 dark:border-sky-800" },
  completed: { label: "Terminé", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" },
};

// ═══════════════════════════════════════
// LaTeX Template Generator
// ═══════════════════════════════════════

function generateLatexTemplate(
  discipline: string,
  chapterCount: number,
  structureMode: string
): string {
  const disciplineLabel =
    DISCIPLINES.find((d) => d.value === discipline)?.label ?? discipline;

  const chapters =
    structureMode === "par_parts"
      ? generatePartsStructure(chapterCount)
      : generateChaptersStructure(chapterCount);

  return `\\documentclass[a4paper,12pt,twoside]{these}

% ═══════════════════════════════════════
% Packages
% ═══════════════════════════════════════
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[french]{babel}
\\usepackage{geometry}
\\geometry{left=3cm, right=2.5cm, top=2.5cm, bottom=2.5cm}
\\usepackage{setspace}
\\onehalfspacing

\\usepackage{lipsum}
\\usepackage{graphicx}
\\usepackage{booktabs}
\\usepackage{array}
\\usepackage{multirow}
\\usepackage{caption}
\\usepackage{float}
\\usepackage{hyperref}
\\usepackage{natbib}
\\usepackage{fancyhdr}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{xcolor}

% ═══════════════════════════════════════
% Configuration
% ═══════════════════════════════════════
\\hypersetup{
  colorlinks=true,
  linkcolor=black,
  citecolor=black,
  urlcolor=blue!60!black,
  pdfauthor={Votre Nom},
  pdftitle={Titre de la Thèse},
}

\\fancyhf{}
\\fancyhead[LE,RO]{\\thepage}
\\fancyhead[LO]{\\slshape \\leftmark}
\\fancyhead[RE]{\\slshape \\rightmark}
\\renewcommand{\\headrulewidth}{0.4pt}

% ═══════════════════════════════════════
% Informations de la thèse
% ═══════\\\\═══════════════════════════
\\title{Titre de la Thèse}
\\subtitle{Sous-titre éventuel}
\\author{Prénom Nom}
\\date{Année Universitaire 2024-2025}

% ═══════════════════════════════════════
% Début du document
% ═══════════════════════════════════════
\\begin{document}

% --- Page de garde ---
\\begin{titlepage}
  \\centering
  \\vspace*{2cm}
  {\\Large \\textsc{Université --- Institution}\\\[1cm]}
  {\\large \\textsc{${disciplineLabel}}\\\[2cm]}
  {\\Huge \\bfseries Titre de la Thèse\\\[1cm]}
  {\\Large Sous-titre éventuel\\\[3cm]}
  {\\large Thèse de Doctorat\\\[0.5cm]}
  {\\large Présentée et soutenue par\\\[0.5cm]}
  {\\LARGE \\textsc{Prénom Nom}\\\[2cm]}
  {\\large Direction de thèse : Pr. Nom du Directeur\\\[1cm]}
  {\\large Laboratoire de recherche\\\[2cm]}
  \\vfill
  {\\large Année Universitaire 2024-2025}
\\end{titlepage}

% --- Remerciements ---
\\chapter*{Remerciements}
\\addcontentsline{toc}{chapter}{Remerciements}

Merci à ...

% --- Résumé / Abstract ---
\\chapter*{Résumé}
\\addcontentsline{toc}{chapter}{Résumé}

Résumé en français de la thèse (environ 2 pages).

\\vspace{1cm}
\\textbf{Mots-clés :} mot-clé 1, mot-clé 2, mot-clé 3, mot-clé 4, mot-clé 5

\\chapter*{Abstract}
\\addcontentsline{toc}{chapter}{Abstract}

Abstract in English (approximately 2 pages).

\\vspace{1cm}
\\textbf{Keywords:} keyword 1, keyword 2, keyword 3, keyword 4, keyword 5

% --- Table des matières ---
\\tableofcontents
\\newpage

% ═══════════════════════════════════════
% Corps de la thèse
% ═══════════════════════════════════════
${chapters}

% ═══════════════════════════════════════
% Conclusion générale
% ═══════════════════════════════════════
\\chapter{Conclusion Générale et Perspectives}

Synthèse des principaux apports de la thèse, \\nlimitations identifiées et pistes de recherche futures.

% ═══════════════════════════════════════
% Références bibliographiques
% ═══════════════════════════════════════
\\bibliographystyle{plainnat}
\\bibliography{references}

% ═══════════════════════════════════════
% Annexes
% ═══════════════════════════════════════
\\appendix

\\chapter{Annexe A --- Titre de l'annexe}

Contenu de l'annexe.

\\end{document}`;
}

function generateChaptersStructure(count: number): string {
  const chapterTitles = [
    "Introduction Générale",
    "Revue de Littérature",
    "Cadre Théorique",
    "Méthodologie de Recherche",
    "Résultats — Étude 1",
    "Résultats — Étude 2",
    "Résultats — Étude 3",
    "Discussion",
    "Synthèse et Interprétation",
    "Implications et Applications",
  ];

  let tex = "";
  for (let i = 0; i < count; i++) {
    const title = chapterTitles[i] ?? `Chapitre ${ROMAN_NUMERALS[i]}`;
    tex += `
% --- ${ROMAN_NUMERALS[i]}. ${title} ---
\\chapter{${title}}

Introduction du chapitre.


Section 1


Section 2


Conclusion du chapitre.

`;
  }
  return tex;
}

function generatePartsStructure(count: number): string {
  const partTitles = [
    "Fondements Théoriques",
    "Méthodologie et Démarche",
    "Résultats et Discussion",
  ];

  const partChapterTitles: Record<number, string[]> = {
    0: ["Revue de Littérature", "Cadre Théorique"],
    1: ["Méthodologie de Recherche", "Collecte et Analyse des Données"],
    2: ["Présentation des Résultats", "Discussion et Interprétation"],
  };

  const chaptersPerPart = Math.max(1, Math.ceil(count / 3));
  let tex = "";
  let chapterIndex = 0;

  for (let p = 0; p < 3 && chapterIndex < count; p++) {
    const partTitle = partTitles[p] ?? `Partie ${p + 1}`;
    tex += `
% ═══════════════════════════════════════
% ${partTitle}
% ═══════════════════════════════════════
\\part{${partTitle}}
`;

    const titles = partChapterTitles[p];
    for (
      let c = 0;
      c < chaptersPerPart && chapterIndex < count;
      c++, chapterIndex++
    ) {
      const title = titles?.[c] ?? `Chapitre ${ROMAN_NUMERALS[chapterIndex]}`;
      tex += `
% --- ${ROMAN_NUMERALS[chapterIndex]}. ${title} ---
\\chapter{${title}}

Introduction du chapitre.


Section 1


Section 2


Conclusion du chapitre.

`;
    }
  }

  return tex;
}

// ═══════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════

function ChapterRow({ chapter }: { chapter: ThesisChapter; onAttach?: (ch: ThesisChapter) => void }) {
  const statusInfo = STATUS_MAP[chapter.status] ?? STATUS_MAP.not_started;
  const progress =
    chapter.targetWordCount > 0
      ? Math.min(100, Math.round((chapter.wordCount / chapter.targetWordCount) * 100))
      : 0;

  return (
    <div className="flex flex-col gap-2 rounded-lg border p-3 transition-colors hover:bg-muted/50">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Badge variant="outline" className="shrink-0 font-mono text-xs">
            {chapter.romanNumeral ?? ROMAN_NUMERALS[chapter.number - 1] ?? chapter.number}
          </Badge>
          <span className="truncate text-sm font-medium">
            {chapter.title}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {chapter.partId && (
            <Badge variant="outline" className="text-[10px] text-muted-foreground">rattaché</Badge>
          )}
          <Badge variant="outline" className={statusInfo.className}>
            {statusInfo.label}
          </Badge>
        </div>
      </div>
      <div className="flex items-center gap-3 pl-1">
        <Progress value={progress} className="h-1.5 flex-1" />
        <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
          {chapter.wordCount.toLocaleString("fr-FR")}
          {chapter.targetWordCount > 0
            ? ` / ${chapter.targetWordCount.toLocaleString("fr-FR")}`
            : ""}{" "}
          mots
        </span>
      </div>
    </div>
  );
}

function PartBlock({
  part,
  chapters,
  onRename,
  onDelete,
  onAddChapter,
  onAttachChapter,
  onDetachChapter,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  part: ThesisPart;
  chapters: ThesisChapter[];
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onAddChapter: (partId: string) => void;
  onAttachChapter: (chapter: ThesisChapter, partId: string) => void;
  onDetachChapter: (chapterId: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(part.title);
  const attachedChapters = chapters.filter((ch) => ch.partId === part.id);
  const partWords = attachedChapters.reduce((s, ch) => s + ch.wordCount, 0);

  const handleSave = () => {
    if (editTitle.trim()) {
      onRename(part.id, editTitle.trim());
      setIsEditing(false);
    }
  };

  return (
    <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
          {!isEditing ? (
            <>
              <h3 className="text-sm font-semibold truncate">{part.title}</h3>
              <Badge variant="outline" className="text-[10px] shrink-0">
                {attachedChapters.length} chap.{attachedChapters.length > 1 ? "s" : ""}
              </Badge>
              <Badge variant="outline" className="text-[10px] shrink-0">
                {partWords.toLocaleString("fr-FR")} mots
              </Badge>
            </>
          ) : (
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setIsEditing(false); }}
              className="h-7 text-sm"
              autoFocus
            />
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!isEditing && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditTitle(part.title); setIsEditing(true); }}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={isFirst} onClick={() => onMoveUp(part.id)}>
            <ArrowRight className="h-3.5 w-3.5 rotate-[-90deg]" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={isLast} onClick={() => onMoveDown(part.id)}>
            <ArrowRight className="h-3.5 w-3.5 rotate-90" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(part.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Attached chapters */}
      {attachedChapters.length > 0 && (
        <div className="flex flex-col gap-2 pl-6">
          {attachedChapters.sort((a, b) => a.sortOrder - b.sortOrder).map((ch) => (
            <div key={ch.id} className="flex items-center gap-2 rounded border bg-background p-2">
              <Badge variant="outline" className="shrink-0 font-mono text-[10px]">
                {ch.romanNumeral ?? ROMAN_NUMERALS[ch.number - 1] ?? ch.number}
              </Badge>
              <span className="text-xs font-medium truncate flex-1">{ch.title}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => onDetachChapter(ch.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => onAddChapter(part.id)}>
        <Plus className="h-3 w-3" />
        Ajouter un chapitre
      </Button>
    </div>
  );
}

function ChapterListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-8" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="flex items-center gap-3 pl-1">
            <Skeleton className="h-1.5 flex-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════
// Main Component
// ═══════════════════════════════════════

export function ThesisPlanPage() {
  const { setCurrentView } = useAppStore();

  // --- Fetch thesis list ---
  const { data: theses, isLoading } = useTheses();
  const activeThesis = theses?.[0] ?? null;
  const thesisId = activeThesis?.id ?? null;

  // --- Parts ---
  const { data: parts, isLoading: partsLoading } = useParts(thesisId);
  const createPart = useCreatePart();
  const updatePart = useUpdatePart();
  const deletePart = useDeletePart();

  // --- Thesis update (structureMode) ---
  const updateThesis = useUpdateThesis();

  // --- Chapters ---
  const createChapter = useCreateChapter();
  const updateChapter = useUpdateChapter();

  // --- Template form state ---
  const [discipline, setDiscipline] = useState("lettres");
  const [chapterCount, setChapterCount] = useState(5);
  const [templateStructureMode, setTemplateStructureMode] = useState<"classique" | "par parties">("classique");
  const [generatedTemplate, setGeneratedTemplate] = useState("");
  const [copied, setCopied] = useState(false);
  const [newPartTitle, setNewPartTitle] = useState("");

  const isPartsMode = activeThesis?.structureMode === "parts";

  // --- Handlers ---
  const handleStructureModeChange = useCallback(
    (value: string) => {
      if (!activeThesis) return;
      const newMode = value === "parts" ? "parts" : "chapters";
      updateThesis.mutate(
        { id: activeThesis.id, structureMode: newMode },
        {
          onSuccess: () => toast.success(`Mode de structure : ${newMode === "parts" ? "par parties" : "par chapitres"}`),
          onError: () => toast.error("Erreur lors du changement de mode"),
        }
      );
    },
    [activeThesis, updateThesis]
  );

  const handleCreatePart = useCallback(() => {
    if (!thesisId || !newPartTitle.trim()) return;
    createPart.mutate(
      { thesisId, title: newPartTitle.trim() },
      {
        onSuccess: () => {
          setNewPartTitle("");
          toast.success("Partie créée");
        },
        onError: () => toast.error("Erreur lors de la création"),
      }
    );
  }, [thesisId, newPartTitle, createPart]);

  const handleRenamePart = useCallback(
    (id: string, title: string) => {
      updatePart.mutate({ id, title }, { onError: () => toast.error("Erreur lors du renommage") });
    },
    [updatePart]
  );

  const handleDeletePart = useCallback(
    (id: string) => {
      deletePart.mutate(id, {
        onSuccess: () => toast.success("Partie supprimée"),
        onError: () => toast.error("Erreur lors de la suppression"),
      });
    },
    [deletePart]
  );

  const handleMovePart = useCallback(
    (id: string, direction: "up" | "down") => {
      if (!parts) return;
      const idx = parts.findIndex((p) => p.id === id);
      if (idx < 0) return;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= parts.length) return;
      // Swap sortOrders
      updatePart.mutate({ id: parts[idx].id, sortOrder: swapIdx });
      updatePart.mutate({ id: parts[swapIdx].id, sortOrder: idx });
    },
    [parts, updatePart]
  );

  const handleAddChapterToPart = useCallback(
    (partId: string) => {
      if (!thesisId) return;
      const partParts = parts?.sort((a, b) => a.sortOrder - b.sortOrder) ?? [];
      const partIndex = partParts.findIndex((p) => p.id === partId);
      const nextChapterNum = (activeThesis?.chapters.length ?? 0) + 1;
      createChapter.mutate(
        {
          thesisId,
          title: `Chapitre ${ROMAN_NUMERALS[nextChapterNum - 1] ?? nextChapterNum}`,
          romanNumeral: ROMAN_NUMERALS[nextChapterNum - 1],
        },
        {
          onSuccess: (newCh) => {
            // Attach the newly created chapter to the part
            updateChapter.mutate({ id: newCh.id, partId, sortOrder: partIndex });
            toast.success("Chapitre ajouté à la partie");
          },
          onError: () => toast.error("Erreur lors de l'ajout"),
        }
      );
    },
    [thesisId, parts, activeThesis, createChapter, updateChapter]
  );

  const handleDetachChapter = useCallback(
    (chapterId: string) => {
      updateChapter.mutate(
        { id: chapterId, partId: null },
        {
          onSuccess: () => toast.success("Chapitre détaché de la partie"),
          onError: () => toast.error("Erreur lors du détachement"),
        }
      );
    },
    [updateChapter]
  );

  const handleGenerate = () => {
    const mode = templateStructureMode === "par parties" ? "par_parts" : "chapters";
    const template = generateLatexTemplate(discipline, chapterCount, mode);
    setGeneratedTemplate(template);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!generatedTemplate) return;
    try {
      await navigator.clipboard.writeText(generatedTemplate);
      setCopied(true);
      toast.success("Template copié dans le presse-papiers");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Impossible de copier le contenu");
    }
  };

  // --- Compute summary stats ---
  const allChapters = activeThesis?.chapters ?? [];
  const totalWords = allChapters.reduce((sum, ch) => sum + ch.wordCount, 0);
  const completedChapters = allChapters.filter((ch) => ch.status === "completed").length;
  const totalChapters = allChapters.length;
  const totalParts = parts?.length ?? 0;
  const attachedChapters = allChapters.filter((ch) => ch.partId).length;

  return (
    <div className="max-w-6xl mx-auto w-full p-6">
      {/* ═══ Header ═══ */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
            <ListTree className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Plan de thèse</h1>
            <p className="text-sm text-muted-foreground">
              Structurez et visualisez votre plan
            </p>
          </div>
        </div>
      </div>

      {/* ═══ Two-column layout ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6">
        {/* ─── Left panel: Structure actuelle ─── */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Structure actuelle
              </CardTitle>
              {activeThesis && (
                <Select value={activeThesis.structureMode} onValueChange={handleStructureModeChange}>
                  <SelectTrigger className="w-[130px] h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chapters">Par chapitres</SelectItem>
                    <SelectItem value="parts">Par parties</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ChapterListSkeleton />
            ) : !activeThesis ? (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-muted">
                  <AlertCircle className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Aucune thèse trouvée</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Créez d&apos;abord une thèse pour visualiser son plan.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setCurrentView("editor")}
                >
                  <FileText className="h-4 w-4" />
                  Aller à l&apos;éditeur
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Thesis summary */}
                <div className="space-y-1">
                  <p className="text-sm font-semibold truncate">
                    {activeThesis.title}
                  </p>
                  {activeThesis.subtitle && (
                    <p className="text-xs text-muted-foreground truncate">
                      {activeThesis.subtitle}
                    </p>
                  )}
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {totalChapters} chapitre{totalChapters > 1 ? "s" : ""}
                    </Badge>
                    {isPartsMode && (
                      <Badge variant="outline" className="text-xs">
                        {totalParts} partie{totalParts > 1 ? "s" : ""}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {totalWords.toLocaleString("fr-FR")} mots
                    </Badge>
                    {completedChapters > 0 && (
                      <Badge variant="outline" className={STATUS_MAP.completed.className}>
                        {completedChapters} terminé{completedChapters > 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="h-px bg-border" />

                {/* Parts mode view */}
                {isPartsMode ? (
                  <div className="flex flex-col gap-4">
                    {/* Add part input */}
                    <div className="flex items-center gap-2">
                      <Input
                        value={newPartTitle}
                        onChange={(e) => setNewPartTitle(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleCreatePart(); }}
                        placeholder="Titre de la nouvelle partie..."
                        className="h-8 text-sm"
                      />
                      <Button
                        size="sm"
                        className="gap-1 shrink-0 h-8"
                        disabled={!newPartTitle.trim() || createPart.isPending}
                        onClick={handleCreatePart}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Ajouter
                      </Button>
                    </div>

                    {/* Parts list */}
                    <ScrollArea className="max-h-[420px] overflow-y-auto">
                      <div className="flex flex-col gap-3 pr-2">
                        {partsLoading ? (
                          Array.from({ length: 2 }).map((_, i) => (
                            <Skeleton key={i} className="h-20 w-full rounded-lg" />
                          ))
                        ) : parts && parts.length > 0 ? (
                          parts
                            .sort((a, b) => a.sortOrder - b.sortOrder)
                            .map((part, idx) => (
                              <PartBlock
                                key={part.id}
                                part={part}
                                chapters={allChapters}
                                onRename={handleRenamePart}
                                onDelete={handleDeletePart}
                                onAddChapter={handleAddChapterToPart}
                                onAttachChapter={(ch, partId) => {
                                  updateChapter.mutate({ id: ch.id, partId });
                                  toast.success(`Chapitre rattaché à la partie`);
                                }}
                                onDetachChapter={handleDetachChapter}
                                onMoveUp={(id) => handleMovePart(id, "up")}
                                onMoveDown={(id) => handleMovePart(id, "down")}
                                isFirst={idx === 0}
                                isLast={idx === (parts.length - 1)}
                              />
                            ))
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Aucune partie créée. Utilisez le champ ci-dessus pour ajouter des parties.
                          </p>
                        )}
                      </div>
                    </ScrollArea>

                    {attachedChapters > 0 && (
                      <p className="text-[11px] text-muted-foreground">
                        {attachedChapters} chapitre{attachedChapters > 1 ? "s" : ""} rattaché{attachedChapters > 1 ? "s" : ""} à des parties
                      </p>
                    )}
                  </div>
                ) : (
                  /* Chapters mode view */
                  <ScrollArea className="max-h-[420px] overflow-y-auto">
                    <div className="flex flex-col gap-3 pr-2">
                      {allChapters
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((chapter) => (
                          <ChapterRow key={chapter.id} chapter={chapter} />
                        ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ─── Right panel: Générateur de template ─── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Générateur de template
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {/* Form */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="discipline" className="text-sm">
                  Discipline
                </Label>
                <Select
                  value={discipline}
                  onValueChange={setDiscipline}
                >
                  <SelectTrigger id="discipline" className="w-full">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {DISCIPLINES.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="chapterCount" className="text-sm">
                  Nombre de chapitres
                </Label>
                <Input
                  id="chapterCount"
                  type="number"
                  min={1}
                  max={15}
                  value={chapterCount}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v) && v >= 1 && v <= 15) {
                      setChapterCount(v);
                    }
                  }}
                  className="w-full"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="structureMode" className="text-sm">
                  Mode de structure
                </Label>
                <Select
                  value={templateStructureMode}
                  onValueChange={(v) =>
                    setTemplateStructureMode(v as "classique" | "par parties")
                  }
                >
                  <SelectTrigger id="structureMode" className="w-full">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="classique">Classique</SelectItem>
                    <SelectItem value="par parties">Par parties</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Generate button */}
            <Button onClick={handleGenerate} className="gap-2 self-start">
              <FileText className="h-4 w-4" />
              Générer le template
            </Button>

            {/* Generated template output */}
            {generatedTemplate && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Template LaTeX généré
                  </Label>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Copié
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copier
                      </>
                    )}
                  </Button>
                </div>
                <ScrollArea className="max-h-[400px] rounded-md border">
                  <pre className="p-4 text-xs leading-relaxed font-mono whitespace-pre-wrap break-words text-muted-foreground">
                    {generatedTemplate}
                  </pre>
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
