"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import {
  PenTool,
  Loader2,
  Copy,
  Square,
  Sparkles,
  BookOpen,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAppStore } from "@/lib/stores/app-store";
import { useThesis, useUpdateChapter, type ThesisChapter } from "@/modules/editor/hooks/use-thesis";
import type { KnowledgeStamp } from "@/lib/ai/knowledge-stamp";
import { KnowledgeStampBlock } from "@/components/knowledge-stamp-block";
import { useAiConfig } from "@/hooks/use-ai-config";
import { useToast } from "@/hooks/use-toast";
import { markdownToHtml, htmlToPlainText } from "@/lib/markdown-to-html";

// ═══════════════════════════════════════
// Module Brouillon de chapitre — rédaction assistée d'un chapitre entier
//
// Flux : choix du chapitre → longueur cible → sélection de références (0-20)
// → génération en direct (SSE, interruptible) → aperçu Markdown + compteur
// → Copier ou Insérer (confirmation : remplacement + version automatique).
//
// Éthique : les citations proviennent uniquement des références choisies par
// le doctorant dans SA bibliothèque ; le brouillon n'est PAS persisté (mémoire
// de session, à l'image des autres modules IA) — l'artefact utile est le
// chapitre inséré, dont l'état antérieur est versionné automatiquement.
// ═══════════════════════════════════════

interface ReferenceItem {
  id: string;
  type: string;
  authors: string;
  title: string;
  year: number | null;
}

const MAX_REFERENCES = 20;
const MIN_WORDS = 300;
const MAX_WORDS = 8000;
const DEFAULT_TARGET_WORDS = 2000;

/** Même convention de comptage que l'éditeur de thèse (tiptap-editor). */
const countWords = (text: string): number =>
  text.trim().split(/\s+/).filter((w) => w.length > 0).length;

function referenceLabel(ref: ReferenceItem): string {
  const surname = firstAuthorSurname(ref.authors) || "Auteur inconnu";
  return `${surname} (${ref.year ?? "s.d."}). ${ref.title}`;
}

/** « (Auteur, année) » = 1er auteur avant la virgule + année (pattern APA). */
function firstAuthorSurname(authors: string): string {
  const first = (authors ?? "").split(";")[0]?.trim() ?? "";
  return first.split(",")[0]?.trim() ?? "";
}

export function BrouillonChapitrePage() {
  const { activeThesisId } = useAppStore();
  const { withAiConfig } = useAiConfig();
  const { toast } = useToast();
  const { data: thesis, isLoading: thesisLoading } = useThesis(activeThesisId);
  const updateChapter = useUpdateChapter();

  const chapters: ThesisChapter[] = useMemo(() => thesis?.chapters ?? [], [thesis]);

  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [targetWords, setTargetWords] = useState<string>(String(DEFAULT_TARGET_WORDS));
  const [refSearch, setRefSearch] = useState("");
  const [selectedRefIds, setSelectedRefIds] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [stamp, setStamp] = useState<KnowledgeStamp | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Sélection par défaut : premier chapitre de la thèse.
  useEffect(() => {
    if (!selectedChapterId && chapters.length > 0) {
      setSelectedChapterId(chapters[0].id);
    }
  }, [chapters, selectedChapterId]);

  const selectedChapter = chapters.find((c) => c.id === selectedChapterId) ?? null;

  // Longueur cible préremplie : objectif du chapitre si ≥ 500, sinon 2 000.
  useEffect(() => {
    if (selectedChapter) {
      const goal = selectedChapter.targetWordCount;
      setTargetWords(String(goal >= 500 ? goal : DEFAULT_TARGET_WORDS));
    }
  }, [selectedChapter]);

  // Références de la bibliothèque (globale).
  const { data: references = [], isLoading: refsLoading } = useQuery({
    queryKey: ["references", "brouillon-chapitre"],
    queryFn: async () => {
      const res = await fetch("/api/references");
      if (!res.ok) throw new Error("Erreur de chargement des références");
      const json = await res.json();
      return json.data as ReferenceItem[];
    },
  });

  const normalizedSearch = refSearch.trim().toLowerCase();
  const filteredReferences = normalizedSearch
    ? references.filter(
        (ref) =>
          ref.title.toLowerCase().includes(normalizedSearch) ||
          ref.authors.toLowerCase().includes(normalizedSearch) ||
          String(ref.year ?? "").includes(normalizedSearch)
      )
    : references;

  const selectedReferences = selectedRefIds
    .map((id) => references.find((ref) => ref.id === id))
    .filter((ref): ref is ReferenceItem => ref !== undefined);

  const parsedTargetWords = Number.parseInt(targetWords, 10);
  const targetWordsValid =
    Number.isInteger(parsedTargetWords) &&
    parsedTargetWords >= MIN_WORDS &&
    parsedTargetWords <= MAX_WORDS;

  const draftWordCount = countWords(draft);

  const toggleReference = (id: string) => {
    setSelectedRefIds((prev) => {
      if (prev.includes(id)) return prev.filter((refId) => refId !== id);
      if (prev.length >= MAX_REFERENCES) return prev;
      return [...prev, id];
    });
  };

  // ── Génération SSE (pattern ai-writing-page) ────────────────────────────
  const handleGenerate = async () => {
    if (!selectedChapterId || !targetWordsValid) return;

    setIsGenerating(true);
    setDraft("");
    setStreamError(null);
    setStamp(null);
    const abort = new AbortController();
    abortRef.current = abort;

    try {
      const res = await fetch("/api/chapter-draft/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          withAiConfig({
            chapterId: selectedChapterId,
            targetWords: parsedTargetWords,
            referenceIds: selectedRefIds,
          })
        ),
        signal: abort.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erreur de génération");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Réponse vide du serveur.");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;

          let parsed: {
            type?: string;
            content?: string;
            error?: string;
            stamp?: KnowledgeStamp;
          } | null = null;
          try {
            parsed = JSON.parse(trimmed.slice(6));
          } catch {
            continue; // Ligne SSE malformée : ignorée.
          }

          if (parsed?.type === "chunk" && parsed.content) {
            setDraft((prev) => prev + parsed.content);
          } else if (parsed?.type === "error") {
            throw new Error(parsed.error || "Le fournisseur IA a renvoyé une erreur.");
          } else if (parsed?.type === "stamp" && parsed.stamp) {
            setStamp(parsed.stamp); // Provenance des savoirs (hors prompt)
          }
        }
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        toast({
          title: "Génération interrompue",
          description:
            "Le brouillon partiel reste affiché : vous pouvez le copier ou le régénérer.",
        });
      } else {
        const message = error instanceof Error ? error.message : "Erreur de génération";
        setStreamError(message);
        toast({ title: "Erreur de génération", description: message, variant: "destructive" });
      }
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
  };

  const handleCopy = () => {
    if (!draft) return;
    navigator.clipboard.writeText(draft);
    toast({ title: "Brouillon copié", description: "Le brouillon est dans le presse-papiers." });
  };

  // ── Insertion : md → HTML + plainText + wordCount → PUT chapitre ────────
  const handleInsert = () => {
    if (!selectedChapterId || !draft.trim()) return;

    const html = markdownToHtml(draft);
    const plainText = htmlToPlainText(html);
    const wordCount = countWords(plainText);

    updateChapter.mutate(
      {
        id: selectedChapterId,
        content: html,
        plainText,
        wordCount,
        stamp: stamp ? JSON.stringify(stamp) : undefined,
      },
      {
        onSuccess: () => {
          setConfirmOpen(false);
          toast({
            title: "Brouillon inséré dans le chapitre",
            description: `Le chapitre « ${selectedChapter?.title ?? ""} » a été mis à jour. L'état antérieur du contenu a été sauvegardé dans l'historique de versions du chapitre.`,
          });
        },
        onError: () => {
          toast({
            title: "Échec de l'insertion",
            description: "Le brouillon n'a pas pu être inséré dans le chapitre. Réessayez.",
            variant: "destructive",
          });
        },
      }
    );
  };

  // ── États vides (aucun appel IA) ────────────────────────────────────────
  if (!activeThesisId) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <PageHeader />
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <PenTool className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="font-medium">Aucune thèse active</p>
              <p className="text-sm text-muted-foreground mt-1">
                Créez ou sélectionnez une thèse pour générer un brouillon de chapitre.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (thesisLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <PageHeader />
        <div className="space-y-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <PageHeader />
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <FileText className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="font-medium">Cette thèse n&apos;a encore aucun chapitre</p>
              <p className="text-sm text-muted-foreground mt-1">
                Ajoutez d&apos;abord des chapitres dans l&apos;éditeur de thèse, puis revenez
                générer un brouillon.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <PageHeader />

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
        {/* ── Paramètres ── */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Paramètres du brouillon</CardTitle>
            <CardDescription>Chapitre cible, longueur visée et sources autorisées.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="chapitre-cible">Chapitre cible</Label>
              <Select
                value={selectedChapterId ?? undefined}
                onValueChange={(value) => setSelectedChapterId(value)}
              >
                <SelectTrigger id="chapitre-cible" aria-label="Chapitre cible">
                  <SelectValue placeholder="Choisir un chapitre" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {chapters.map((chapter) => (
                    <SelectItem key={chapter.id} value={chapter.id}>
                      Chapitre {chapter.number} — {chapter.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedChapter && selectedChapter.wordCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  Le chapitre contient actuellement {selectedChapter.wordCount} mots.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="longueur-cible">Longueur cible (mots)</Label>
              <Input
                id="longueur-cible"
                type="number"
                min={MIN_WORDS}
                max={MAX_WORDS}
                value={targetWords}
                onChange={(e) => setTargetWords(e.target.value)}
                aria-describedby="longueur-cible-aide"
              />
              <p id="longueur-cible-aide" className="text-xs text-muted-foreground">
                Entre {MIN_WORDS} et {MAX_WORDS} mots.
                {selectedChapter && selectedChapter.targetWordCount >= 500
                  ? " Préremplie avec l'objectif du chapitre."
                  : ` Valeur par défaut : ${DEFAULT_TARGET_WORDS} mots.`}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="recherche-references">
                  Références autorisées ({selectedRefIds.length}/{MAX_REFERENCES})
                </Label>
              </div>
              <Input
                id="recherche-references"
                placeholder="Rechercher par titre, auteur, année…"
                value={refSearch}
                onChange={(e) => setRefSearch(e.target.value)}
              />
              <div className="max-h-96 overflow-y-auto rounded-md border p-2 space-y-1">
                {refsLoading ? (
                  <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Chargement de la bibliothèque…
                  </div>
                ) : filteredReferences.length === 0 ? (
                  <p className="p-2 text-sm text-muted-foreground">
                    {refSearch
                      ? "Aucune référence ne correspond à la recherche."
                      : "Aucune référence dans la bibliothèque. Le brouillon sera généré sans citation."}
                  </p>
                ) : (
                  filteredReferences.map((ref) => {
                    const checked = selectedRefIds.includes(ref.id);
                    const disabled = !checked && selectedRefIds.length >= MAX_REFERENCES;
                    return (
                      <div
                        key={ref.id}
                        className="flex items-start gap-2 rounded-md p-2 hover:bg-muted/60"
                      >
                        <Checkbox
                          id={`ref-${ref.id}`}
                          checked={checked}
                          disabled={disabled}
                          onCheckedChange={() => toggleReference(ref.id)}
                          className="mt-0.5"
                        />
                        <Label
                          htmlFor={`ref-${ref.id}`}
                          className="text-xs leading-snug font-normal cursor-pointer"
                        >
                          <span className="line-clamp-2">{ref.title}</span>
                          <span className="block text-muted-foreground">
                            {ref.authors.split(";")[0]?.trim() || "Auteur inconnu"}
                            {ref.year ? `, ${ref.year}` : ""}
                          </span>
                        </Label>
                      </div>
                    );
                  })
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Seules ces références pourront être citées, au format (Auteur, année). Sans
                sélection, aucune citation ne sera produite.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── Génération et aperçu ── */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            {!isGenerating ? (
              <Button
                onClick={handleGenerate}
                disabled={!selectedChapterId || !targetWordsValid}
                className="min-h-11"
              >
                <Sparkles className="h-4 w-4 mr-2" aria-hidden="true" />
                Générer le brouillon
              </Button>
            ) : (
              <Button variant="outline" onClick={handleStop} className="min-h-11">
                <Square className="h-4 w-4 mr-2" aria-hidden="true" />
                Arrêter
              </Button>
            )}
            {isGenerating && (
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Rédaction en cours…
              </span>
            )}
            {selectedChapter && (
              <span className="text-sm text-muted-foreground">
                Chapitre {selectedChapter.number} — {selectedChapter.title}
              </span>
            )}
          </div>

          {streamError && (
            <div
              className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
              role="alert"
            >
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
              <span>{streamError}</span>
            </div>
          )}

          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                  Aperçu du brouillon
                </CardTitle>
                <CardDescription>
                  Vérifiez, corrigez et assumez le contenu avant de l&apos;insérer : l&apos;IA
                  assiste, vous restez l&apos;auteur.
                </CardDescription>
              </div>
              <Badge variant="secondary" aria-live="polite">
                {draftWordCount} mots / cible {targetWordsValid ? parsedTargetWords : "—"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {draft ? (
                <>
                  {isGenerating ? (
                    <div
                      className="max-h-[560px] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed"
                      aria-live="polite"
                    >
                      {draft}
                      <span className="animate-pulse" aria-hidden="true">
                        ▍
                      </span>
                    </div>
                  ) : (
                    <div className="max-h-[560px] overflow-y-auto rounded-md border p-4">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{draft}</ReactMarkdown>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={handleCopy} className="min-h-11">
                      <Copy className="h-4 w-4 mr-2" aria-hidden="true" />
                      Copier
                    </Button>
                    <Button
                      onClick={() => setConfirmOpen(true)}
                      disabled={updateChapter.isPending}
                      className="min-h-11"
                    >
                      {updateChapter.isPending && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                      )}
                      Insérer dans le chapitre
                    </Button>
                  </div>

                  {stamp && <KnowledgeStampBlock stamp={stamp} />}

                  {selectedReferences.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground">
                        Références autorisées pour ce brouillon :
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedReferences.map((ref) => (
                          <Badge key={ref.id} variant="outline" className="max-w-full">
                            <span className="truncate">{referenceLabel(ref)}</span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                  {isGenerating
                    ? "Le brouillon s'écrit ici, en direct…"
                    : "Choisissez un chapitre, ajustez la longueur, sélectionnez vos références, puis lancez la génération. Vous pourrez copier le brouillon ou l'insérer dans le chapitre après confirmation."}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Confirmation d'insertion (garde-fou remplacement + version) ── */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Insérer le brouillon dans le chapitre ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le contenu actuel du chapitre sera remplacé. Une version est automatiquement
              sauvegardée dans l&apos;historique du chapitre.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateChapter.isPending}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleInsert();
              }}
              disabled={updateChapter.isPending}
            >
              {updateChapter.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
              )}
              Remplacer le contenu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function PageHeader() {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
        <PenTool className="h-6 w-6" aria-hidden="true" />
        Brouillon de chapitre
      </h2>
      <p className="text-sm text-muted-foreground mt-1">
        Générez un brouillon structuré d&apos;un chapitre entier (introduction, sections,
        conclusion), ancré dans votre cadrage et alimenté par les références de votre
        bibliothèque. Vous gardez le contrôle : aperçu, copie et insertion après confirmation.
      </p>
    </div>
  );
}
