"use client";

import { useState, useCallback, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen,
  Plus,
  Copy,
  Check,
  Trash2,
  Pencil,
  FileText,
  Globe,
  GraduationCap,
  Sparkles,
  Loader2,
  Download,
  Upload,
  Quote,
  List,
  MessageSquare,
} from "lucide-react";
import { useAiConfig } from "@/hooks/use-ai-config";

// ═══════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════

export type ReferenceType =
  | "journal"
  | "book"
  | "chapter"
  | "website"
  | "dissertation";

interface ReferenceData {
  id: string;
  type: ReferenceType;
  authors: string;
  year: string;
  title: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  publisher?: string;
  edition?: string;
  city?: string;
  editor?: string;
  bookTitle?: string;
  siteName?: string;
  url?: string;
  retrievedDate?: string;
  university?: string;
  accessedDate?: string;
}

const EMPTY_REF: ReferenceData = {
  id: "",
  type: "journal",
  authors: "",
  year: "",
  title: "",
  journal: "",
  volume: "",
  issue: "",
  pages: "",
  doi: "",
  publisher: "",
  edition: "",
  city: "",
  editor: "",
  bookTitle: "",
  siteName: "",
  url: "",
  retrievedDate: "",
  university: "",
  accessedDate: "",
};

const REF_TYPE_LABELS: Record<ReferenceType, string> = {
  journal: "Article de revue",
  book: "Livre",
  chapter: "Chapitre de livre",
  website: "Site web",
  dissertation: "Thèse / Mémoire",
};

const REF_TYPE_ICONS: Record<ReferenceType, React.ElementType> = {
  journal: FileText,
  book: BookOpen,
  chapter: BookOpen,
  website: Globe,
  dissertation: GraduationCap,
};

// ═══════════════════════════════════════════════
// APA 7th Edition Formatters
// ═══════════════════════════════════════════════

function formatAuthorsAPA(authors: string): string {
  if (!authors.trim()) return "";
  const parts = authors.split(";").map((a) => a.trim()).filter(Boolean);
  if (parts.length === 0) return "";

  const formatted = parts.map((author) => {
    const tokens = author.split(",").map((t) => t.trim());
    if (tokens.length >= 2) {
      const lastName = tokens[0];
      const initials = tokens
        .slice(1)
        .join("")
        .split(/\s+/)
        .filter(Boolean)
        .map((n) => n.charAt(0).toUpperCase() + ".")
        .join(" ");
      return `${lastName}, ${initials}`;
    }
    // Try to parse "First Last" format
    const words = author.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      const lastName = words[words.length - 1];
      const initials = words
        .slice(0, -1)
        .map((n) => n.charAt(0).toUpperCase() + ".")
        .join(" ");
      return `${lastName}, ${initials}`;
    }
    return author;
  });

  if (formatted.length === 1) return formatted[0];
  if (formatted.length === 2) return `${formatted[0]}, & ${formatted[1]}`;
  return `${formatted.slice(0, -1).join(", ")}, & ${formatted[formatted.length - 1]}`;
}

function generateCitationAPA(ref: ReferenceData): string {
  const authorsFormatted = formatAuthorsAPA(ref.authors);
  if (!authorsFormatted || !ref.title) return "";

  const year = ref.year ? `(${ref.year}).` : "(s.d.).";

  switch (ref.type) {
    case "journal": {
      let citation = `${authorsFormatted} ${year} ${ref.title}.`;
      if (ref.journal) {
        citation += ` *${ref.journal}*`;
        if (ref.volume) {
          citation += `, *${ref.volume}*`;
          if (ref.issue) citation += `(${ref.issue})`;
        }
        if (ref.pages) citation += `, ${ref.pages}`;
        citation += ".";
      }
      if (ref.doi) {
        citation += ` https://doi.org/${ref.doi.replace(/^https?:\/\/doi\.org\//, "")}`;
      }
      return citation;
    }
    case "book": {
      let citation = `${authorsFormatted} ${year} *${ref.title}*`;
      if (ref.edition) citation += ` (${ref.edition} éd.)`;
      citation += ".";
      if (ref.publisher) {
        const parts = [ref.city, ref.publisher].filter(Boolean);
        if (parts.length > 0) citation += ` ${parts.join(": ")}.`;
      }
      if (ref.doi) {
        citation += ` https://doi.org/${ref.doi.replace(/^https?:\/\/doi\.org\//, "")}`;
      }
      return citation;
    }
    case "chapter": {
      let citation = `${authorsFormatted} ${year} ${ref.title}.`;
      if (ref.editor) {
        const editorFormatted = formatAuthorsAPA(ref.editor);
        if (editorFormatted) {
          citation += ` Dans ${editorFormatted} (Éd.), *${ref.bookTitle || ""}*`;
          if (ref.edition) citation += ` (${ref.edition} éd.)`;
          citation += ".";
        }
      } else if (ref.bookTitle) {
        citation += ` Dans *${ref.bookTitle}*.`;
      }
      if (ref.pages) citation += ` (pp. ${ref.pages}).`;
      if (ref.publisher) {
        const parts = [ref.city, ref.publisher].filter(Boolean);
        if (parts.length > 0) citation += ` ${parts.join(": ")}.`;
      }
      if (ref.doi) {
        citation += ` https://doi.org/${ref.doi.replace(/^https?:\/\/doi\.org\//, "")}`;
      }
      return citation;
    }
    case "website": {
      let citation = `${authorsFormatted} ${year} ${ref.title}.`;
      if (ref.siteName) citation += ` ${ref.siteName}.`;
      if (ref.url) citation += ` ${ref.url}`;
      return citation;
    }
    case "dissertation": {
      let citation = `${authorsFormatted} ${year} *${ref.title}*`;
      if (ref.publisher || ref.university) {
        citation += ` [Thèse de doctorat, ${ref.university || ref.publisher}].`;
      }
      if (ref.doi) {
        citation += ` https://doi.org/${ref.doi.replace(/^https?:\/\/doi\.org\//, "")}`;
      }
      return citation;
    }
    default:
      return "";
  }
}

function generateInTextCitation(ref: ReferenceData, parenthetical: boolean = true): string {
  const authorsFormatted = formatAuthorsAPA(ref.authors);
  if (!authorsFormatted) return "";

  // Get last name only for in-text
  const lastName = authorsFormatted.split(",")[0].trim();
  const year = ref.year || "s.d.";

  if (parenthetical) {
    return `(${lastName}, ${year})`;
  }
  return `${lastName} (${year})`;
}

function generateBibTeX(ref: ReferenceData): string {
  const typeMap: Record<ReferenceType, string> = {
    journal: "article",
    book: "book",
    chapter: "incollection",
    website: "misc",
    dissertation: "phdthesis",
  };

  const citeKey = ref.authors
    .split(",")[0]
    .trim()
    .replace(/[^a-zA-Z]/g, "")
    .toLowerCase();
  const citeKeyClean = `${citeKey}${ref.year || ""}`;

  const fields: string[] = [];
  fields.push(`  author = {${ref.authors}}`);
  if (ref.year) fields.push(`  year = {${ref.year}}`);
  fields.push(`  title = {${ref.title}}`);

  switch (ref.type) {
    case "journal":
      if (ref.journal) fields.push(`  journal = {${ref.journal}}`);
      if (ref.volume) fields.push(`  volume = {${ref.volume}}`);
      if (ref.issue) fields.push(`  number = {${ref.issue}}`);
      if (ref.pages) fields.push(`  pages = {${ref.pages}}`);
      break;
    case "book":
      if (ref.publisher) fields.push(`  publisher = {${ref.publisher}}`);
      if (ref.city) fields.push(`  address = {${ref.city}}`);
      if (ref.edition) fields.push(`  edition = {${ref.edition}}`);
      break;
    case "chapter":
      if (ref.bookTitle) fields.push(`  booktitle = {${ref.bookTitle}}`);
      if (ref.editor) fields.push(`  editor = {${ref.editor}}`);
      if (ref.publisher) fields.push(`  publisher = {${ref.publisher}}`);
      if (ref.pages) fields.push(`  pages = {${ref.pages}}`);
      break;
    case "website":
      if (ref.url) fields.push(`  url = {${ref.url}}`);
      if (ref.siteName) fields.push(`  howpublished = {${ref.siteName}}`);
      break;
    case "dissertation":
      if (ref.university) fields.push(`  school = {${ref.university}}`);
      if (ref.publisher) fields.push(`  school = {${ref.publisher}}`);
      break;
  }

  if (ref.doi) fields.push(`  doi = {${ref.doi}}`);
  if (ref.url && ref.type !== "website") fields.push(`  url = {${ref.url}}`);

  return `@${typeMap[ref.type]}{${citeKeyClean},\n${fields.join(",\n")}\n}`;
}

// ═══════════════════════════════════════════════
// BibTeX Parser (simple)
// ═══════════════════════════════════════════════

function parseBibTeXEntries(raw: string): ReferenceData[] {
  const entries: ReferenceData[] = [];
  const entryRegex = /@(\w+)\{([^,]+),\s*([\s\S]*?)\n\}/g;
  let match: RegExpExecArray | null;

  while ((match = entryRegex.exec(raw)) !== null) {
    const type = match[1].toLowerCase();
    const _entryKey = match[2].trim();
    const body = match[3];
    void _entryKey;

    const fieldRegex = /\s*(\w+)\s*=\s*\{([^}]*)\}/g;
    const fields: Record<string, string> = {};
    let fieldMatch: RegExpExecArray | null;

    while ((fieldMatch = fieldRegex.exec(body)) !== null) {
      fields[fieldMatch[1].toLowerCase()] = fieldMatch[2].trim();
    }

    const ref: ReferenceData = {
      id: crypto.randomUUID(),
      type: "journal",
      authors: fields.author || "",
      year: fields.year || "",
      title: fields.title || "",
      journal: fields.journal || "",
      volume: fields.volume || "",
      issue: fields.number || "",
      pages: fields.pages || "",
      doi: fields.doi || "",
      publisher: fields.publisher || "",
      city: fields.address || "",
      edition: fields.edition || "",
      editor: fields.editor || "",
      bookTitle: fields.booktitle || "",
      siteName: fields.howpublished || "",
      url: fields.url || "",
      university: fields.school || "",
    };

    if (type === "book") ref.type = "book";
    else if (type === "incollection") ref.type = "chapter";
    else if (type === "phdthesis" || type === "mastersthesis") ref.type = "dissertation";
    else if (type === "misc" || type === "online") ref.type = "website";
    else ref.type = "journal";

    if (ref.authors || ref.title) entries.push(ref);
  }

  return entries;
}

// ═══════════════════════════════════════════════
// Reference Form Fields Component
// ═══════════════════════════════════════════════

interface ReferenceFormProps {
  refData: ReferenceData;
  onChange: (updated: ReferenceData) => void;
}

function ReferenceForm({ refData, onChange }: ReferenceFormProps) {
  const setField = useCallback(
    (field: keyof ReferenceData, value: string) => {
      onChange({ ...refData, [field]: value });
    },
    [refData, onChange]
  );

  const commonFields = (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="authors">Auteur(s)</Label>
          <Input
            id="authors"
            placeholder="Nom, Prénom; Nom2, Prénom2"
            value={refData.authors}
            onChange={(e) => setField("authors", e.target.value)}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Séparez les auteurs par des points-virgules. Utilisez &quot;Nom, Prénom&quot;
          </p>
        </div>
        <div>
          <Label htmlFor="year">Année</Label>
          <Input
            id="year"
            placeholder="2024"
            value={refData.year}
            onChange={(e) => setField("year", e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="title">Titre</Label>
          <Input
            id="title"
            placeholder="Titre de la référence"
            value={refData.title}
            onChange={(e) => setField("title", e.target.value)}
          />
        </div>
      </div>
    </>
  );

  const typeSpecificFields = () => {
    switch (refData.type) {
      case "journal":
        return (
          <div className="grid gap-4 sm:grid-cols-2 mt-4">
            <div className="sm:col-span-2">
              <Label htmlFor="journal">Nom de la revue</Label>
              <Input
                id="journal"
                placeholder="Journal of Psychology"
                value={refData.journal || ""}
                onChange={(e) => setField("journal", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="volume">Volume</Label>
              <Input
                id="volume"
                placeholder="12"
                value={refData.volume || ""}
                onChange={(e) => setField("volume", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="issue">Numéro</Label>
              <Input
                id="issue"
                placeholder="3"
                value={refData.issue || ""}
                onChange={(e) => setField("issue", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="pages">Pages</Label>
              <Input
                id="pages"
                placeholder="45-67"
                value={refData.pages || ""}
                onChange={(e) => setField("pages", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="doi">DOI</Label>
              <Input
                id="doi"
                placeholder="10.1234/example"
                value={refData.doi || ""}
                onChange={(e) => setField("doi", e.target.value)}
              />
            </div>
          </div>
        );
      case "book":
        return (
          <div className="grid gap-4 sm:grid-cols-2 mt-4">
            <div>
              <Label htmlFor="publisher">Éditeur</Label>
              <Input
                id="publisher"
                placeholder="Presses Universitaires de France"
                value={refData.publisher || ""}
                onChange={(e) => setField("publisher", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                placeholder="Paris"
                value={refData.city || ""}
                onChange={(e) => setField("city", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edition">Édition</Label>
              <Input
                id="edition"
                placeholder="3"
                value={refData.edition || ""}
                onChange={(e) => setField("edition", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="doi">DOI</Label>
              <Input
                id="doi"
                placeholder="10.1234/example"
                value={refData.doi || ""}
                onChange={(e) => setField("doi", e.target.value)}
              />
            </div>
          </div>
        );
      case "chapter":
        return (
          <div className="grid gap-4 sm:grid-cols-2 mt-4">
            <div className="sm:col-span-2">
              <Label htmlFor="bookTitle">Titre du livre</Label>
              <Input
                id="bookTitle"
                placeholder="Titre de l'ouvrage collectif"
                value={refData.bookTitle || ""}
                onChange={(e) => setField("bookTitle", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="editor">Éditeur(s) du livre</Label>
              <Input
                id="editor"
                placeholder="Nom, Prénom"
                value={refData.editor || ""}
                onChange={(e) => setField("editor", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="pages">Pages</Label>
              <Input
                id="pages"
                placeholder="45-67"
                value={refData.pages || ""}
                onChange={(e) => setField("pages", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="publisher">Éditeur</Label>
              <Input
                id="publisher"
                placeholder="Presses Universitaires de France"
                value={refData.publisher || ""}
                onChange={(e) => setField("publisher", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                placeholder="Paris"
                value={refData.city || ""}
                onChange={(e) => setField("city", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edition">Édition</Label>
              <Input
                id="edition"
                placeholder="2"
                value={refData.edition || ""}
                onChange={(e) => setField("edition", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="doi">DOI</Label>
              <Input
                id="doi"
                placeholder="10.1234/example"
                value={refData.doi || ""}
                onChange={(e) => setField("doi", e.target.value)}
              />
            </div>
          </div>
        );
      case "website":
        return (
          <div className="grid gap-4 sm:grid-cols-2 mt-4">
            <div className="sm:col-span-2">
              <Label htmlFor="siteName">Nom du site</Label>
              <Input
                id="siteName"
                placeholder="Organisation mondiale de la Santé"
                value={refData.siteName || ""}
                onChange={(e) => setField("siteName", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                placeholder="https://www.example.com"
                value={refData.url || ""}
                onChange={(e) => setField("url", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="retrievedDate">Date de consultation</Label>
              <Input
                id="retrievedDate"
                placeholder="15 mars 2024"
                value={refData.retrievedDate || ""}
                onChange={(e) => setField("retrievedDate", e.target.value)}
              />
            </div>
          </div>
        );
      case "dissertation":
        return (
          <div className="grid gap-4 sm:grid-cols-2 mt-4">
            <div className="sm:col-span-2">
              <Label htmlFor="university">Université / Institution</Label>
              <Input
                id="university"
                placeholder="Université de Paris"
                value={refData.university || ""}
                onChange={(e) => setField("university", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="doi">DOI</Label>
              <Input
                id="doi"
                placeholder="10.1234/example"
                value={refData.doi || ""}
                onChange={(e) => setField("doi", e.target.value)}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div>
        <Label>Type de référence</Label>
        <Select
          value={refData.type}
          onValueChange={(v) => setField("type", v as ReferenceType)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(REF_TYPE_LABELS) as ReferenceType[]).map((t) => (
              <SelectItem key={t} value={t}>
                {REF_TYPE_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {commonFields}
      {typeSpecificFields()}
    </div>
  );
}

// ═══════════════════════════════════════════════
// Citation Preview Component
// ═══════════════════════════════════════════════

interface CitationPreviewProps {
  refData: ReferenceData;
}

function CitationPreview({ refData }: CitationPreviewProps) {
  const citation = generateCitationAPA(refData);
  const parenthetical = generateInTextCitation(refData, true);
  const narrative = generateInTextCitation(refData, false);

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
          Référence complète (APA 7e éd.)
        </p>
        <div className="bg-muted/50 rounded-md p-3 min-h-[3rem]">
          {citation ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{citation}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Commencez à remplir les champs pour voir la référence formatée…
            </p>
          )}
        </div>
      </div>
      <Separator />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
            Citation entre parenthèses
          </p>
          <div className="bg-muted/50 rounded-md p-3 min-h-[2.5rem] flex items-center">
            {parenthetical ? (
              <p className="text-sm font-mono">{parenthetical}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">—</p>
            )}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
            Citation narrative
          </p>
          <div className="bg-muted/50 rounded-md p-3 min-h-[2.5rem] flex items-center">
            {narrative ? (
              <p className="text-sm font-mono">{narrative}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">—</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// Copy Button
// ═══════════════════════════════════════════════

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      disabled={!text}
      className="h-7 gap-1.5 text-xs"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copié !" : label}
    </Button>
  );
}

// ═══════════════════════════════════════════════
// Main Page Component
// ═══════════════════════════════════════════════

export function ApaComposerPage() {
  const { withAiConfig } = useAiConfig();
  const [references, setReferences] = useState<ReferenceData[]>([]);
  const [currentRef, setCurrentRef] = useState<ReferenceData>({
    ...EMPTY_REF,
    id: crypto.randomUUID(),
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [importText, setImportText] = useState("");
  const [importResult, setImportResult] = useState<string>("");
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [copiedAll, setCopiedAll] = useState(false);

  // AI mutation
  const aiMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const res = await fetch("/api/ai-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(withAiConfig({
          mode: "academic-reformulation",
          prompt,
        })),
      });
      if (!res.ok) throw new Error("Erreur lors de la requête IA");
      const json = await res.json();
      return json.data.content as string;
    },
    onSuccess: (data) => {
      setAiResult(data);
    },
  });

  // Update current ref fields
  const updateCurrentRef = useCallback((updated: ReferenceData) => {
    setCurrentRef(updated);
  }, []);

  // Add or update reference
  const handleSaveRef = useCallback(() => {
    if (!currentRef.title.trim()) return;

    setReferences((prev) => {
      if (editingId) {
        return prev.map((r) => (r.id === editingId ? currentRef : r));
      }
      return [...prev, currentRef];
    });

    setCurrentRef({ ...EMPTY_REF, id: crypto.randomUUID() });
    setEditingId(null);
  }, [currentRef, editingId]);

  // Edit reference
  const handleEditRef = useCallback((ref: ReferenceData) => {
    setEditingId(ref.id);
    setCurrentRef({ ...ref });
  }, []);

  // Delete reference
  const handleDeleteRef = useCallback((id: string) => {
    setReferences((prev) => prev.filter((r) => r.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setCurrentRef({ ...EMPTY_REF, id: crypto.randomUUID() });
    }
  }, [editingId]);

  // Clear form
  const handleClearForm = useCallback(() => {
    setEditingId(null);
    setCurrentRef({ ...EMPTY_REF, id: crypto.randomUUID() });
  }, []);

  // Batch import
  const handleImport = useCallback(() => {
    if (!importText.trim()) return;
    const parsed = parseBibTeXEntries(importText);
    if (parsed.length > 0) {
      setReferences((prev) => [...prev, ...parsed]);
      setImportResult(`${parsed.length} référence(s) importée(s) avec succès.`);
      setImportText("");
      setTimeout(() => setImportResult(""), 4000);
    } else {
      setImportResult("Aucune entrée BibTeX valide détectée. Vérifiez le format.");
      setTimeout(() => setImportResult(""), 5000);
    }
  }, [importText]);

  // Export all references as APA
  const exportAPA = useMemo(() => {
    return references
      .sort((a, b) => {
        const aAuthor = formatAuthorsAPA(a.authors).split(",")[0].trim().toLowerCase();
        const bAuthor = formatAuthorsAPA(b.authors).split(",")[0].trim().toLowerCase();
        return aAuthor.localeCompare(bAuthor);
      })
      .map((ref) => generateCitationAPA(ref))
      .filter(Boolean)
      .join("\n\n");
  }, [references]);

  // Export all references as BibTeX
  const exportBibTeX = useMemo(() => {
    return references
      .sort((a, b) => {
        const aAuthor = formatAuthorsAPA(a.authors).split(",")[0].trim().toLowerCase();
        const bAuthor = formatAuthorsAPA(b.authors).split(",")[0].trim().toLowerCase();
        return aAuthor.localeCompare(bAuthor);
      })
      .map((ref) => generateBibTeX(ref))
      .join("\n\n");
  }, [references]);

  // Copy all references
  const handleCopyAll = useCallback(() => {
    if (!exportAPA) return;
    navigator.clipboard.writeText(exportAPA);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  }, [exportAPA]);

  // BibTeX copy handled by CopyButton in export tab

  // Download BibTeX file
  const handleDownloadBibTeX = useCallback(() => {
    if (!exportBibTeX) return;
    const blob = new Blob([exportBibTeX], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "references.bib";
    a.click();
    URL.revokeObjectURL(url);
  }, [exportBibTeX]);

  // AI assistance
  const handleAiAssist = useCallback(() => {
    if (!aiInput.trim()) return;
    aiMutation.mutate(
      `Formatte la référence suivante en style APA 7e édition. Retourne uniquement la référence formatée, prête à copier :

${aiInput}`
    );
  }, [aiInput, aiMutation]);

  // Current citation preview
  const currentCitation = generateCitationAPA(currentRef);

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          Compositeur APA — Résultats
        </h1>
        <p className="text-sm text-muted-foreground">
          Créez et gérez vos références en style APA 7<sup>e</sup> édition avec formatage automatique
        </p>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="compose" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="compose" className="gap-1.5">
            <Pencil className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Composer</span>
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-1.5">
            <List className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Liste de références</span>
            {references.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1.5 text-xs">
                {references.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="import" className="gap-1.5">
            <Upload className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Import groupé</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="gap-1.5">
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Exporter</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Assistant IA</span>
          </TabsTrigger>
        </TabsList>

        {/* ═══ COMPOSE TAB ═══ */}
        <TabsContent value="compose" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Form */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Pencil className="h-4 w-4 text-primary" />
                  {editingId ? "Modifier la référence" : "Nouvelle référence"}
                </CardTitle>
                <CardDescription>
                  Remplissez les champs ci-dessous pour générer automatiquement la citation APA
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <ReferenceForm refData={currentRef} onChange={updateCurrentRef} />
                <Separator />
                <div className="flex gap-2">
                  <Button onClick={handleSaveRef} disabled={!currentRef.title.trim()}>
                    <Plus className="h-4 w-4 mr-1.5" />
                    {editingId ? "Mettre à jour" : "Ajouter à la liste"}
                  </Button>
                  <Button variant="outline" onClick={handleClearForm}>
                    Effacer
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                    onClick={() => setAiDialogOpen(true)}
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1" />
                    Aide IA
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Quote className="h-4 w-4 text-primary" />
                    Aperçu en direct
                  </CardTitle>
                  <CopyButton text={currentCitation} label="Copier" />
                </div>
                <CardDescription>
                  Prévisualisation de la référence formatée en temps réel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CitationPreview refData={currentRef} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ═══ LIST TAB ═══ */}
        <TabsContent value="list" className="mt-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <List className="h-4 w-4 text-primary" />
                    Liste des références
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {references.length} référence(s) enregistrée(s)
                  </CardDescription>
                </div>
                {references.length > 0 && (
                  <CopyButton text={exportAPA} label="Copier tout" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              {references.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BookOpen className="h-10 w-10 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Aucune référence ajoutée pour le moment.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Utilisez l&apos;onglet &laquo; Composer &raquo; pour ajouter des références.
                  </p>
                </div>
              ) : (
                <ScrollArea className="max-h-[500px]">
                  <div className="flex flex-col gap-3">
                    {references
                      .sort((a, b) => {
                        const aA = formatAuthorsAPA(a.authors).split(",")[0].trim().toLowerCase();
                        const bA = formatAuthorsAPA(b.authors).split(",")[0].trim().toLowerCase();
                        return aA.localeCompare(bA);
                      })
                      .map((ref) => {
                        const Icon = REF_TYPE_ICONS[ref.type];
                        const citation = generateCitationAPA(ref);
                        const parenthetical = generateInTextCitation(ref, true);
                        return (
                          <div
                            key={ref.id}
                            className="group relative border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline" className="gap-1 text-xs shrink-0">
                                    <Icon className="h-3 w-3" />
                                    {REF_TYPE_LABELS[ref.type]}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground font-mono">
                                    {parenthetical}
                                  </span>
                                </div>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                  {citation}
                                </p>
                              </div>
                              <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <CopyButton text={citation} label="" />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleEditRef(ref)}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteRef(ref.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ IMPORT TAB ═══ */}
        <TabsContent value="import" className="mt-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Upload className="h-4 w-4 text-primary" />
                Import groupé BibTeX
              </CardTitle>
              <CardDescription>
                Collez vos entrées BibTeX ci-dessous. Elles seront automatiquement parsées et ajoutées à votre liste de références.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Textarea
                placeholder={`@article{smith2024,
  author = {Smith, John and Doe, Jane},
  year = {2024},
  title = {An important study},
  journal = {Journal of Research},
  volume = {15},
  pages = {1-25},
  doi = {10.1234/example}
}

@book{jones2023,
  author = {Jones, Alice},
  year = {2023},
  title = {A comprehensive guide},
  publisher = {Academic Press},
  address = {New York}
}`}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className="min-h-[240px] font-mono text-sm"
              />
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleImport}
                  disabled={!importText.trim()}
                >
                  <Upload className="h-4 w-4 mr-1.5" />
                  Importer les références
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setImportText("")}
                  disabled={!importText.trim()}
                >
                  Effacer
                </Button>
                {importResult && (
                  <Badge
                    variant={importResult.includes("succès") ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {importResult}
                  </Badge>
                )}
              </div>
              <Separator />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-1">Formats supportés :</p>
                <ul className="list-disc list-inside space-y-0.5 ml-1">
                  <li><code className="bg-muted px-1 rounded">@article</code> → Article de revue</li>
                  <li><code className="bg-muted px-1 rounded">@book</code> → Livre</li>
                  <li><code className="bg-muted px-1 rounded">@incollection</code> → Chapitre de livre</li>
                  <li><code className="bg-muted px-1 rounded">@phdthesis</code> / <code className="bg-muted px-1 rounded">@mastersthesis</code> → Thèse / Mémoire</li>
                  <li><code className="bg-muted px-1 rounded">@misc</code> / <code className="bg-muted px-1 rounded">@online</code> → Site web</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ EXPORT TAB ═══ */}
        <TabsContent value="export" className="mt-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* APA Export */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Liste APA 7e
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Références triées par ordre alphabétique des auteurs
                    </CardDescription>
                  </div>
                  <CopyButton text={exportAPA} label="Copier" />
                </div>
              </CardHeader>
              <CardContent>
                {references.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <p className="text-sm text-muted-foreground">
                      Aucune référence à exporter.
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="max-h-96">
                    <div className="bg-muted/50 rounded-md p-4">
                      <p className="text-sm leading-loose whitespace-pre-wrap">
                        {exportAPA}
                      </p>
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            {/* BibTeX Export */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Download className="h-4 w-4 text-primary" />
                      Export BibTeX
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Format compatible avec Zotero, Mendeley, EndNote
                    </CardDescription>
                  </div>
                  <div className="flex gap-1.5">
                    <CopyButton text={exportBibTeX} label="Copier" />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1.5 text-xs"
                      onClick={handleDownloadBibTeX}
                      disabled={!exportBibTeX}
                    >
                      <Download className="h-3 w-3" />
                      .bib
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {references.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <p className="text-sm text-muted-foreground">
                      Aucune référence à exporter.
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="max-h-96">
                    <pre className="bg-muted/50 rounded-md p-4 text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                      {exportBibTeX}
                    </pre>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>

          {references.length > 0 && (
            <div className="mt-4 flex justify-center">
              <Button variant="outline" onClick={handleCopyAll} className="gap-2">
                {copiedAll ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copiedAll
                  ? "Liste APA copiée !"
                  : `Copier toute la liste APA (${references.length} réf.)`}
              </Button>
            </div>
          )}
        </TabsContent>

        {/* ═══ AI ASSISTANT TAB ═══ */}
        <TabsContent value="ai" className="mt-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Assistant IA — Formatage de références
              </CardTitle>
              <CardDescription>
                Collez une référence incomplète ou mal formatée et l&apos;IA la convertira en style APA 7<sup>e</sup> édition.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Textarea
                placeholder={`Exemples de requêtes :

• « Smith J, Johnson A. (2022) "The impact of AI on education" published in Computers & Education volume 180 »

• « Marie Dupont, thèse soutenue en 2023 à la Sorbonne sur les neurosciences cognitives »

• « Article de Jean-Marc Lévy sur la sociologie urbaine, paru dans Annales 2021 »`}
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                className="min-h-[140px]"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleAiAssist}
                  disabled={!aiInput.trim() || aiMutation.isPending}
                >
                  {aiMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  ) : (
                    <MessageSquare className="h-4 w-4 mr-1.5" />
                  )}
                  {aiMutation.isPending
                    ? "Analyse en cours…"
                    : "Formater avec l'IA"}
                </Button>
              </div>

              {aiResult && (
                <>
                  <Separator />
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">Résultat :</p>
                      <CopyButton text={aiResult} label="Copier" />
                    </div>
                    <div className="bg-muted/50 rounded-md p-4">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {aiResult}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {aiMutation.isError && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                  <p className="text-sm text-destructive">
                    Erreur : {aiMutation.error.message}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Dialog (from compose tab) */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Aide IA pour le formatage
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Textarea
              placeholder="Collez une référence incomplète ou mal formatée…"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              className="min-h-[120px]"
            />
            <Button
              onClick={() => {
                handleAiAssist();
                if (aiMutation.isPending === false) {
                  // Close dialog after submitting if not already pending
                }
              }}
              disabled={!aiInput.trim() || aiMutation.isPending}
              className="w-full"
            >
              {aiMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-1.5" />
              )}
              {aiMutation.isPending
                ? "Analyse en cours…"
                : "Formater"}
            </Button>
            {aiResult && (
              <div className="bg-muted/50 rounded-md p-3 max-h-48 overflow-y-auto">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-medium text-muted-foreground">
                    Résultat
                  </p>
                  <CopyButton text={aiResult} label="" />
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {aiResult}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAiDialogOpen(false);
                setAiInput("");
                setAiResult("");
              }}
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}