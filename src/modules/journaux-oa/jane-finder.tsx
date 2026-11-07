"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertCircle,
  BookMarked,
  ChevronDown,
  ExternalLink,
  FileText,
  Filter,
  Info,
  Users,
} from "lucide-react";
import type {
  JaneMode,
  JaneResponse,
} from "@/app/api/jane/route";

// ═══════════════════════════════════════
// Filtres (référence officielle du formulaire Jane)
// ═══════════════════════════════════════
const LANGUAGES = [
  { code: "eng", label: "Anglais" },
  { code: "fre", label: "Français" },
  { code: "ger", label: "Allemand" },
  { code: "ita", label: "Italien" },
  { code: "jpn", label: "Japonais" },
  { code: "rus", label: "Russe" },
  { code: "spa", label: "Espagnol" },
] as const;

const PUBLICATION_TYPES = [
  "Case Reports",
  "Classical Article",
  "Clinical Trial",
  "Clinical Trial, Phase I",
  "Clinical Trial, Phase II",
  "Clinical Trial, Phase III",
  "Clinical Trial, Phase IV",
  "Comparative Study",
  "Controlled Clinical Trial",
  "Evaluation Studies",
  "In Vitro",
  "Journal Article",
  "Letter",
  "Meta-Analysis",
  "Multicenter Study",
  "Randomized Controlled Trial",
  "Review",
  "Twin Study",
  "Validation Studies",
] as const;

const MAX_TEXT = 5_000;
const MIN_TEXT = 10;

// ═══════════════════════════════════════
// Cartes de résultats
// ═══════════════════════════════════════
function JournalResultCard({ journal }: { journal: JaneResponse["journals"][number] }) {
  return (
    <Card>
      <CardContent className="p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <p className="font-medium text-sm leading-snug">{journal.name}</p>
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 whitespace-nowrap tabular-nums">
            {journal.confidence}% de confiance
          </span>
        </div>
        <Progress value={journal.confidence} className="h-1.5" />
        <div className="flex flex-wrap gap-1.5">
          {journal.openAccess && (
            <Badge variant="outline" className="text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800">
              Accès ouvert{journal.openAccessLabel ? ` · ${journal.openAccessLabel}` : ""}
            </Badge>
          )}
          {journal.medlineIndexed && <Badge variant="outline">Medline-indexé</Badge>}
          {journal.pmc && <Badge variant="outline">PMC</Badge>}
          {journal.articleInfluence !== undefined && (
            <Badge variant="outline" className="text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800">
              Article Influence {journal.articleInfluence}
              {journal.influencePercentile !== undefined
                ? ` · ≥ ${journal.influencePercentile}% des journaux`
                : ""}
            </Badge>
          )}
        </div>
        <a
          href={`https://openalex.org/sources?search=${encodeURIComponent(journal.name)}`}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 w-fit"
        >
          Voir sur OpenAlex
          <ExternalLink className="h-3 w-3" />
        </a>
      </CardContent>
    </Card>
  );
}

function AuthorResultCard({ author }: { author: JaneResponse["authors"][number] }) {
  return (
    <Card>
      <CardContent className="p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <p className="font-medium text-sm leading-snug">{author.name}</p>
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 whitespace-nowrap tabular-nums">
            {author.confidence}% de confiance
          </span>
        </div>
        <Progress value={author.confidence} className="h-1.5" />
        {author.pmids.length > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {author.pmids.slice(0, 5).map((pmid) => (
              <a
                key={pmid}
                href={`https://pubmed.ncbi.nlm.nih.gov/${pmid}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              >
                PMID {pmid}
                <ExternalLink className="h-3 w-3" />
              </a>
            ))}
            {author.pmids.length > 5 && (
              <span className="text-xs text-muted-foreground">
                +{author.pmids.length - 5} autres
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PaperResultCard({ paper }: { paper: JaneResponse["papers"][number] }) {
  return (
    <Card>
      <CardContent className="p-4 flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-3">
          <a
            href={`https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}`}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-sm leading-snug hover:underline underline-offset-2"
          >
            {paper.title || `PMID ${paper.pmid}`}
          </a>
          <Badge variant="outline" className="text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 whitespace-nowrap tabular-nums">
            {paper.similarity}% semblable
          </Badge>
        </div>
        {paper.authors && (
          <p className="text-xs text-muted-foreground">{paper.authors}</p>
        )}
        <p className="text-xs text-muted-foreground italic">
          {paper.journal || "Journal inconnu"}
          {paper.year ? ` · ${paper.year}` : ""}
        </p>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════
// Composant principal
// ═══════════════════════════════════════
export function JaneFinder() {
  const [text, setText] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [publicationTypes, setPublicationTypes] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: async (mode: JaneMode): Promise<JaneResponse> => {
      const res = await fetch("/api/jane", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          mode,
          ...(languages.length > 0 ? { languages } : {}),
          ...(publicationTypes.length > 0 ? { publicationTypes } : {}),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(
          err?.error ?? "Erreur lors de la requête vers Jane. Réessayez."
        );
      }
      return res.json();
    },
  });

  const canSearch = text.trim().length >= MIN_TEXT;
  const activeMode = mutation.data?.mode ?? null;
  const journals = mutation.data?.journals ?? [];
  const authors = mutation.data?.authors ?? [];
  const papers = mutation.data?.papers ?? [];

  const toggleFilter = (
    value: string,
    list: string[],
    setList: (v: string[]) => void
  ) => {
    setList(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Encart d'information périmètre Jane */}
      <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20 p-4">
        <Info className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
        <div className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
          <p className="font-semibold mb-1">
            Jane — Journal / Author Name Estimator
          </p>
          <p>
            Collez le titre et/ou le résumé de votre manuscrit : Jane le compare
            à des millions de documents de <strong>PubMed</strong> pour
            suggérer les journaux, auteurs et articles les plus similaires.
            Périmètre : biomédecine, santé publique et sciences de la vie —
            pour les autres disciplines, utilisez l&apos;onglet « Catalogue
            OA ». Votre texte est transmis au service externe{" "}
            <a
              href="https://jane.biosemantics.org"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 inline-flex items-center gap-0.5"
            >
              jane.biosemantics.org
              <ExternalLink className="h-3 w-3" />
            </a>{" "}
            — ne collez que le titre et un résumé non confidentiel.
          </p>
        </div>
      </div>

      {/* Saisie + actions */}
      <Card>
        <CardContent className="p-4 flex flex-col gap-3">
          <Textarea
            rows={7}
            placeholder="Collez ici le titre et/ou le résumé de votre manuscrit (en anglais de préférence)..."
            value={text}
            maxLength={MAX_TEXT}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground tabular-nums">
              {text.length}/{MAX_TEXT} caractères — minimum {MIN_TEXT}
            </span>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => mutation.mutate("journals")}
                disabled={!canSearch || mutation.isPending}
              >
                <BookMarked className="h-4 w-4 mr-2" />
                Trouver des journaux
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => mutation.mutate("authors")}
                disabled={!canSearch || mutation.isPending}
              >
                <Users className="h-4 w-4 mr-2" />
                Trouver des auteurs
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => mutation.mutate("papers")}
                disabled={!canSearch || mutation.isPending}
              >
                <FileText className="h-4 w-4 mr-2" />
                Trouver des articles
              </Button>
            </div>
          </div>

          {/* Filtres optionnels */}
          <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 -ml-2 text-muted-foreground">
                <Filter className="h-3.5 w-3.5" />
                Filtres optionnels
                {(languages.length > 0 || publicationTypes.length > 0) && (
                  <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                    {languages.length + publicationTypes.length}
                  </Badge>
                )}
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${filtersOpen ? "rotate-180" : ""}`}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 flex flex-col gap-4">
              <div>
                <p className="text-xs font-medium mb-2">
                  Langues de publication
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {LANGUAGES.map((lang) => (
                    <label
                      key={lang.code}
                      className="flex items-center gap-2 text-xs cursor-pointer"
                    >
                      <Checkbox
                        checked={languages.includes(lang.code)}
                        onCheckedChange={() =>
                          toggleFilter(
                            lang.code,
                            languages,
                            setLanguages
                          )
                        }
                      />
                      {lang.label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium mb-2">
                  Types de publication (MeSH)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {PUBLICATION_TYPES.map((t) => (
                    <label
                      key={t}
                      className="flex items-center gap-2 text-xs cursor-pointer"
                    >
                      <Checkbox
                        checked={publicationTypes.includes(t)}
                        onCheckedChange={() =>
                          toggleFilter(t, publicationTypes, setPublicationTypes)
                        }
                      />
                      {t}
                    </label>
                  ))}
                </div>
              </div>
              {(languages.length > 0 || publicationTypes.length > 0) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs w-fit -ml-2 text-muted-foreground"
                  onClick={() => {
                    setLanguages([]);
                    setPublicationTypes([]);
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              )}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Chargement */}
      {mutation.isPending && (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      )}

      {/* Erreur */}
      {mutation.isError && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20 p-3">
          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
          <p className="text-xs text-red-800 dark:text-red-300">
            {mutation.error instanceof Error
              ? mutation.error.message
              : "Erreur lors de la requête vers Jane."}
          </p>
        </div>
      )}

      {/* Résultats : journaux */}
      {activeMode === "journals" && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-muted-foreground">
            {journals.length} journal{journals.length !== 1 ? "x" : ""} suggéré
            {journals.length !== 1 ? "s" : ""} par Jane — triés par confiance
            décroissante
          </p>
          {journals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <BookMarked className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium">Aucune suggestion de journal</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-md">
                Jane n&apos;a trouvé aucun journal suffisamment proche de votre
                document. Essayez d&apos;enrichir le texte avec le résumé
                complet, ou vérifiez que le sujet relève du périmètre PubMed.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
              {journals.map((journal) => (
                <JournalResultCard key={journal.name} journal={journal} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Résultats : auteurs */}
      {activeMode === "authors" && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-muted-foreground">
            {authors.length} auteur{authors.length !== 1 ? "s" : ""} suggéré
            {authors.length !== 1 ? "s" : ""} par Jane
          </p>
          {authors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium">Aucun auteur suggéré</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-md">
                Jane n&apos;a trouvé aucun auteur suffisamment proche de votre
                document. Essayez avec un résumé plus complet.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
              {authors.map((author) => (
                <AuthorResultCard key={author.name} author={author} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Résultats : articles */}
      {activeMode === "papers" && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-muted-foreground">
            {papers.length} article{papers.length !== 1 ? "s" : ""} similaire
            {papers.length !== 1 ? "s" : ""} trouvé{papers.length !== 1 ? "s" : ""} par Jane
          </p>
          {papers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium">Aucun article similaire</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-md">
                Jane n&apos;a trouvé aucun article suffisamment proche de votre
                document. Essayez avec un résumé plus complet.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
              {papers.map((paper) => (
                <PaperResultCard key={paper.pmid} paper={paper} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
