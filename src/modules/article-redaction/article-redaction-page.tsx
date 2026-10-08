"use client";

// ═══════════════════════════════════════════════════════════════
// ThesisFrame — Assistant « Brouillon d'article scientifique »
// 5 étapes : sources → consignes → plan (modifiable) → génération
// section par section → relecture/versions/export DOCX.
// Intégrité : brouillon à vérifier, [À compléter] jamais inventés,
// traçabilité par section, document importé = données.
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/stores/app-store";
import {
  FileText, FileUp, Loader2, Plus, Trash2, Save, Download, Search,
  ChevronRight, ChevronLeft, History, AlertTriangle, Wand2, RefreshCw,
  Languages, Copy,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────

interface ImportedDocInfo {
  id: string;
  filename: string;
  fileType: string;
  pages: number | null;
  scanned: boolean;
  limits: string | { kind: string; detail: string }[];
  textLength?: number;
  preview?: string;
}

/** limits : chaîne JSON (db) ou tableau parsé (POST) — robuste aux deux. */
function parseLimits(limits: string | { kind: string; detail: string }[] | null | undefined): { kind: string; detail: string }[] {
  if (Array.isArray(limits)) return limits;
  try {
    const parsed = JSON.parse(limits || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

interface PlanRow {
  id: string;
  heading: string;
  brief?: string | null;
}

interface SectionRow {
  id: string;
  heading: string;
  content: string;
  sources: { label: string; kind: string; location?: string | null }[];
}

interface ArticleRow {
  id: string;
  title: string;
  articleType: string;
  status: string;
  biblioStyle: string;
  targetLang: string;
  targetWords: number;
  discipline: string | null;
  targetJournal: string | null;
  updatedAt: string;
  sectionsCount: number;
  toComplete: number;
}

interface ArticleFull extends ArticleRow {
  thesisId: string | null;
  journalGuide: string | null;
  authors: string | null;
  angle: string | null;
  plan: string | null;
  sections: string;
  versions?: { id: string; label: string | null; createdAt: string; sections: string }[];
}

const STEPS = ["Sources", "Consignes", "Plan", "Génération", "Relecture"];
const DISCLAIMER =
  "Brouillon d'aide à la rédaction — à vérifier par les auteurs. Aucune garantie d'acceptation par une revue ni d'absence de similitudes textuelles.";

function countToComplete(sections: SectionRow[]): number {
  return sections.reduce(
    (acc, s) => (s.content.match(/\[À compléter par l'auteur\]|\[Information non précisée[^\]]*\]|\[[^\]]*à vérifier[^\]]*\]/gi) || []).length + acc,
    0
  );
}

const LANG_LABELS: Record<string, string> = { fr: "français", en: "anglais", ar: "arabe" };
function langLabel(code: string): string {
  return LANG_LABELS[code] ?? code;
}

// ── Composant ──────────────────────────────────────────────────

export function ArticleRedactionPage() {
  const activeThesisId = useAppStore((s) => s.activeThesisId);

  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  // Sources (étape 1)
  const [includeChapters, setIncludeChapters] = useState(true);
  const [includeCadrage, setIncludeCadrage] = useState(true);
  const [includeReferences, setIncludeReferences] = useState(true);
  const [includeExperiments, setIncludeExperiments] = useState(true);
  const [includeNotebook, setIncludeNotebook] = useState(false);
  const [imports, setImports] = useState<ImportedDocInfo[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  // Consignes (étape 2)
  const [title, setTitle] = useState("");
  const [articleType, setArticleType] = useState("empirique");
  const [discipline, setDiscipline] = useState("");
  const [targetLang, setTargetLang] = useState("fr");
  const [targetWords, setTargetWords] = useState(6000);
  const [biblioStyle, setBiblioStyle] = useState("APA");
  const [targetJournal, setTargetJournal] = useState("");
  const [journalGuide, setJournalGuide] = useState("");
  const [authors, setAuthors] = useState("");
  const [angle, setAngle] = useState("");

  // Article courant + plan + sections
  const [article, setArticle] = useState<ArticleFull | null>(null);
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [plan, setPlan] = useState<PlanRow[]>([]);
  const [sections, setSections] = useState<SectionRow[]>([]);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  // Option B : analyse + angles
  interface AnalysisReport {
    totalChars: number;
    bySource: { label: string; kind: string; chars: number }[];
    headings: string[];
    studies: { label: string; question?: string; verdict?: string }[];
    missing: string[];
    quality: string;
  }
  const [analysis, setAnalysis] = useState<AnalysisReport | null>(null);
  const [fragmentation, setFragmentation] = useState<{ risk: boolean; message: string } | null>(null);
  const [angleProposals, setAngleProposals] = useState<{ angle: string; rationale: string; coverage: string }[]>([]);
  const [angleChosen, setAngleChosen] = useState(false);

  // Option C : traduction distincte (copie — l'original reste intact)
  const [translateTarget, setTranslateTarget] = useState("en");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [translationNotice, setTranslationNotice] = useState<string | null>(null);

  // OCR asynchrone (specs/article-ocr-async) — un seul job actif à la fois (serveur)
  const [ocrLang, setOcrLang] = useState<Record<string, string>>({});
  interface OcrJobState {
    docId: string;
    jobId: string;
    status: string;
    progress: number | null;
    progressNote: string | null;
    error: string | null;
    result: { pagesProcessed?: number; avgConfidence?: number | null; remainingPages?: number } | null;
  }
  const [ocrJob, setOcrJob] = useState<OcrJobState | null>(null);
  const [ocrNotice, setOcrNotice] = useState<string | null>(null);

  const sourcesPayload = useCallback(
    () => ({
      thesisId: activeThesisId ?? null,
      includeChapters,
      includeCadrage,
      includeReferences,
      includeExperiments,
      includeNotebook,
      importedDocIds: imports.map((d) => d.id),
    }),
    [activeThesisId, includeChapters, includeCadrage, includeReferences, includeExperiments, includeNotebook, imports]
  );

  const loadArticles = useCallback(async () => {
    try {
      const res = await fetch("/api/articles");
      const json = await res.json();
      setArticles(Array.isArray(json?.data) ? json.data : []);
    } catch {
      /* liste indisponible — non bloquant */
    }
  }, []);

  useEffect(() => {
    void loadArticles();
  }, [loadArticles]);

  // Les imports ne survivaient pas au rechargement (state local) — on
  // recharge les documents récents au montage (liste sans texte, légère)
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/article-imports");
        const json = await res.json();
        if (!res.ok || !Array.isArray(json?.data)) return;
        setImports(
          json.data.map(
            (d: { id: string; filename: string; fileType: string; pages: number | null; scanned: boolean; limits: string }) => ({
              id: d.id,
              filename: d.filename,
              fileType: d.fileType,
              pages: d.pages,
              scanned: d.scanned,
              limits: d.limits,
            })
          )
        );
      } catch {
        /* liste indisponible — non bloquant */
      }
    };
    void load();
  }, []);

  const openArticle = useCallback(async (id: string) => {
    setError(null);
    setBusy("open");
    try {
      const res = await fetch(`/api/articles/${id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Ouverture impossible");
      const a = json.data as ArticleFull;
      setArticle(a);
      setTitle(a.title);
      setArticleType(a.articleType);
      setDiscipline(a.discipline ?? "");
      setTargetLang(a.targetLang);
      setTargetWords(a.targetWords);
      setBiblioStyle(a.biblioStyle);
      setTargetJournal(a.targetJournal ?? "");
      setJournalGuide(a.journalGuide ?? "");
      setAuthors(a.authors ?? "");
      setAngle(a.angle ?? "");
      setTranslateTarget(a.targetLang === "fr" ? "en" : "fr");
      setTranslations({});
      setTranslationNotice(null);
      setPlan(a.plan ? JSON.parse(a.plan) : []);
      setSections(JSON.parse(a.sections || "[]"));
      setStep(a.status === "draft" && !a.plan ? 2 : a.status === "plan" ? 3 : 4);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur d'ouverture");
    } finally {
      setBusy(null);
    }
  }, []);

  // ── Import de document (étape 1) ──
  const importFile = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Choisissez d'abord un fichier (DOCX, PDF, TXT/MD).");
      return;
    }
    setError(null);
    setBusy("import");
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (activeThesisId) fd.append("thesisId", activeThesisId);
      const res = await fetch("/api/article-imports", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Import refusé");
      setImports((prev) => [...prev.filter((d) => d.id !== json.data.id), json.data]);
      if (fileRef.current) fileRef.current.value = "";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur d'import");
    } finally {
      setBusy(null);
    }
  };

  const removeImport = async (id: string) => {
    try {
      await fetch(`/api/article-imports?id=${id}`, { method: "DELETE" });
    } catch {
      /* suppression best-effort */
    }
    setImports((prev) => prev.filter((d) => d.id !== id));
  };

  // ── OCR asynchrone (specs/article-ocr-async — CA-1.1 à 1.5) ──
  /** Recharge un document importé (texte/limites/aperçu mis à jour après OCR). */
  const refreshImport = async (id: string) => {
    try {
      const res = await fetch(`/api/article-imports?id=${id}`);
      const json = await res.json();
      if (!res.ok || !json?.data) return;
      const d = json.data;
      setImports((prev) => [
        ...prev.filter((x) => x.id !== id),
        {
          id: d.id,
          filename: d.filename,
          fileType: d.fileType,
          pages: d.pages,
          scanned: d.scanned,
          limits: d.limits,
          textLength: (d.text ?? "").length,
          preview: d.preview,
        },
      ]);
    } catch {
      /* rafraîchissement best-effort */
    }
  };

  const launchOcr = async (doc: ImportedDocInfo) => {
    setError(null);
    setOcrNotice(null);
    setBusy(`ocr-${doc.id}`);
    try {
      const res = await fetch("/api/article-imports/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ importedDocId: doc.id, lang: ocrLang[doc.id] ?? "fra" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Lancement de l'OCR impossible");
      setOcrJob({
        docId: doc.id,
        jobId: json.data.jobId,
        status: json.data.status,
        progress: 0,
        progressNote: json.data.note,
        error: null,
        result: null,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de lancement OCR");
    } finally {
      setBusy(null);
    }
  };

  // Suivi de progression (polling 3 s tant que le job est pending/running)
  useEffect(() => {
    if (!ocrJob || (ocrJob.status !== "pending" && ocrJob.status !== "running")) return;
    const t = setInterval(async () => {
      try {
        const res = await fetch(`/api/article-imports/ocr?importedDocId=${ocrJob.docId}`);
        const json = await res.json();
        const job = json?.data;
        if (!job || job.id !== ocrJob.jobId) return;
        if (job.status === "done") {
          setOcrJob(null);
          setOcrNotice(
            job.result?.pagesProcessed
              ? `OCR terminé — ${job.result.pagesProcessed} page(s) traitée(s)` +
                (typeof job.result.avgConfidence === "number"
                  ? `, confiance moyenne ${job.result.avgConfidence} %`
                  : "") +
                `. Le texte a été ajouté dans le bloc « TEXTE OCR » du document — relecture humaine requise.`
              : "OCR terminé — texte ajouté dans le bloc « TEXTE OCR » (relecture requise)."
          );
          void refreshImport(ocrJob.docId);
        } else if (job.status === "failed") {
          setOcrJob({
            ...ocrJob,
            status: "failed",
            error: job.error ?? "Échec de l'OCR (motif non précisé).",
          });
        } else {
          setOcrJob({
            ...ocrJob,
            status: job.status,
            progress: job.progress,
            progressNote: job.progressNote,
          });
        }
      } catch {
        /* réseau — retenté au prochain tick */
      }
    }, 3000);
    return () => clearInterval(t);
  }, [ocrJob]);

  // ── Option B : analyse des sources (étape 1) ──
  const analyzeNow = async () => {
    setError(null);
    setBusy("analyze");
    try {
      const res = await fetch("/api/articles/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sources: sourcesPayload() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Analyse impossible");
      setAnalysis(json.data.analysis);
      setFragmentation(json.data.fragmentation);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur d'analyse");
    } finally {
      setBusy(null);
    }
  };

  // ── Option B : propositions d'angles (étape 2) ──
  const proposeAngles = async () => {
    setError(null);
    setBusy("angles");
    try {
      const res = await fetch("/api/articles/angles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meta: metaPayload(), sources: sourcesPayload() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Angles indisponibles");
      setAngleProposals(json.data.angles);
      setFragmentation(json.data.fragmentation);
      setAngleChosen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur d'angles");
    } finally {
      setBusy(null);
    }
  };

  // ── Étape 2 : créer l'article ──
  const createArticle = async () => {
    if (title.trim().length < 3) {
      setError("Le titre de l'article est requis (3 caractères minimum).");
      return;
    }
    setError(null);
    setBusy("create");
    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thesisId: activeThesisId ?? null,
          title: title.trim(),
          articleType,
          discipline: discipline.trim() || null,
          targetLang,
          targetWords,
          biblioStyle,
          targetJournal: targetJournal.trim() || null,
          journalGuide: journalGuide.trim() || null,
          authors: authors.trim() || null,
          angle: angle.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Création refusée");
      setArticle(json.data);
      setTranslateTarget(targetLang === "fr" ? "en" : "fr");
      setTranslations({});
      setTranslationNotice(null);
      await loadArticles();
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de création");
    } finally {
      setBusy(null);
    }
  };

  const metaPayload = () => ({
    title: title.trim(),
    articleType,
    discipline: discipline.trim() || null,
    targetLang,
    targetWords,
    biblioStyle,
    targetJournal: targetJournal.trim() || null,
    journalGuide: journalGuide.trim() || null,
    authors: authors.trim() || null,
    angle: angle.trim() || null,
  });

  // ── Étape 3 : plan ──
  const proposePlan = async () => {
    if (!article) return;
    setError(null);
    setBusy("plan");
    try {
      const res = await fetch("/api/articles/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meta: metaPayload(), sources: sourcesPayload() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Plan indisponible");
      setPlan(json.data.plan);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de plan");
    } finally {
      setBusy(null);
    }
  };

  const savePlan = async () => {
    if (!article) return;
    if (plan.length === 0) {
      setError("Le plan est vide — proposez-en un ou ajoutez des sections.");
      return;
    }
    setError(null);
    setBusy("save-plan");
    try {
      const res = await fetch(`/api/articles/${article.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, status: "plan" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Enregistrement refusé");
      setArticle((prev) => (prev ? { ...prev, status: "plan" } : prev));
      setSections(plan.map((p) => ({ ...p, content: "", sources: [] })));
      setStep(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur d'enregistrement du plan");
    } finally {
      setBusy(null);
    }
  };

  // ── Étape 4 : génération section par section ──
  const persistSections = async (rows: SectionRow[], status?: string) => {
    if (!article) return;
    const res = await fetch(`/api/articles/${article.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sections: rows, ...(status ? { status } : {}) }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => null);
      throw new Error(json?.error ?? "Enregistrement des sections refusé");
    }
    setArticle((prev) => (prev && status ? { ...prev, status } : prev));
  };

  const generateSection = async (sectionId: string) => {
    if (!article) return;
    if (analysis && analysis.studies.length >= 2 && angleProposals.length > 0 && !angleChosen) {
      setError(
        "Plusieurs études sont détectées et des angles ont été proposés : choisissez UN angle avant de générer (étape 2) — le fractionnement en plusieurs articles reste une décision explicite."
      );
      setStep(1);
      return;
    }
    setError(null);
    setGeneratingId(sectionId);
    try {
      const res = await fetch("/api/articles/section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meta: metaPayload(), plan, sectionId, sources: sourcesPayload() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Génération impossible");
      setTranslations((prev) => {
        if (!(sectionId in prev)) return prev;
        const { [sectionId]: _stale, ...rest } = prev;
        void _stale;
        return rest;
      });
      const next = sections.map((s) =>
        s.id === sectionId
          ? { ...s, content: json.data.content as string, sources: (json.data.usedSources ?? []) as SectionRow["sources"] }
          : s
      );
      setSections(next);
      await persistSections(next, "generated");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de génération");
    } finally {
      setGeneratingId(null);
    }
  };

  const updateSectionContent = (id: string, content: string) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, content } : s)));
    // Le contenu d'origine change : la traduction stockée est obsolète, on la retire.
    setTranslations((prev) => {
      if (!(id in prev)) return prev;
      const { [id]: _stale, ...rest } = prev;
      void _stale;
      return rest;
    });
  };

  const saveSections = async () => {
    setError(null);
    setBusy("save");
    try {
      await persistSections(sections);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur d'enregistrement");
    } finally {
      setBusy(null);
    }
  };

  const saveVersion = async () => {
    if (!article) return;
    setError(null);
    setBusy("version");
    try {
      const label = `Version du ${new Date().toLocaleString("fr-FR")}`;
      // Le serveur snapshotte l'état AVANT modification : on soumet l'état
      // courant avec snapshotVersion → la version créée = état pré-version.
      const res = await fetch(`/api/articles/${article.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections, snapshotVersion: true, versionLabel: label }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Version refusée");
      setArticle((prev) => (prev ? { ...prev, sections: JSON.stringify(sections) } : prev));
      await loadArticleVersions(article.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de version");
    } finally {
      setBusy(null);
    }
  };

  const loadArticleVersions = async (id: string) => {
    const res = await fetch(`/api/articles/${id}`);
    const json = await res.json();
    if (res.ok) {
      setArticle((prev) => (prev && json.data ? { ...prev, versions: json.data.versions } : prev));
    }
  };

  const restoreVersion = async (versionSections: string) => {
    setError(null);
    try {
      const rows = JSON.parse(versionSections) as SectionRow[];
      await persistSections(rows);
      setSections(rows);
      setTranslations({});
      setTranslationNotice(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Restauration impossible");
    }
  };

  const exportDocx = async () => {
    if (!article) return;
    setError(null);
    setBusy("export");
    try {
      const res = await fetch("/api/articles/export-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: article.id }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error ?? "Export refusé");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${article.title.replace(/[^\p{L}\p{N} _-]/gu, "").slice(0, 60) || "article"}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur d'export");
    } finally {
      setBusy(null);
    }
  };

  const deleteArticle = async (id: string) => {
    try {
      await fetch(`/api/articles/${id}`, { method: "DELETE" });
      if (article?.id === id) {
        setArticle(null);
        setStep(0);
      }
      await loadArticles();
    } catch {
      setError("Suppression impossible.");
    }
  };

  // ── Option C : traduction distincte (copie — l'original reste intact) ──
  const translateSection = async (sectionId: string) => {
    if (!article || busy !== null) return;
    const section = sections.find((s) => s.id === sectionId);
    if (!section || !section.content.trim()) return;
    setError(null);
    setBusy(`translate-${sectionId}`);
    try {
      const res = await fetch("/api/articles/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: article.title, targetLang: translateTarget, content: section.content }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Traduction impossible");
      setTranslations((prev) => ({ ...prev, [sectionId]: json.data.translated as string }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de traduction");
    } finally {
      setBusy(null);
    }
  };

  const translateWholeArticle = async () => {
    if (!article || busy !== null) return;
    const targets = sections.filter((s) => s.content.trim());
    if (targets.length === 0) return;
    setError(null);
    setBusy("translate-all");
    try {
      for (const s of targets) {
        const res = await fetch("/api/articles/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: article.title, targetLang: translateTarget, content: s.content }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error ?? "Traduction impossible");
        const translated = json.data.translated as string;
        setTranslations((prev) => ({ ...prev, [s.id]: translated }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de traduction (sections déjà traduites conservées)");
    } finally {
      setBusy(null);
    }
  };

  const translatedRows = (): SectionRow[] =>
    sections.map((s) => (translations[s.id]?.trim() ? { ...s, content: translations[s.id] } : s));

  const saveTranslatedCopy = async () => {
    if (!article || busy !== null) return;
    if (!sections.some((s) => translations[s.id]?.trim())) return;
    setError(null);
    setBusy("save-copy");
    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thesisId: article.thesisId,
          title: `${article.title} (copie ${langLabel(translateTarget)})`,
          articleType: article.articleType,
          discipline: article.discipline,
          targetLang: translateTarget,
          targetWords: article.targetWords,
          biblioStyle: article.biblioStyle,
          targetJournal: article.targetJournal,
          journalGuide: article.journalGuide,
          authors: article.authors,
          angle: article.angle,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Création de la copie refusée");
      const copy = json.data as { id: string };
      const missing = sections.filter((s) => s.content.trim() && !translations[s.id]?.trim()).length;
      const put = await fetch(`/api/articles/${copy.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, sections: translatedRows(), status: "generated" }),
      });
      if (!put.ok) {
        const pj = await put.json().catch(() => null);
        throw new Error(pj?.error ?? "Enregistrement de la copie refusé");
      }
      setTranslationNotice(
        "Copie traduite enregistrée comme NOUVEL article — l'original reste intact." +
          (missing > 0
            ? ` ${missing} section${missing > 1 ? "s" : ""} non traduite${missing > 1 ? "s" : ""} conservée${missing > 1 ? "s" : ""} dans la langue d'origine.`
            : "")
      );
      await loadArticles();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de sauvegarde de la copie");
    } finally {
      setBusy(null);
    }
  };

  const saveTranslatedVersion = async () => {
    if (!article || busy !== null) return;
    if (!sections.some((s) => translations[s.id]?.trim())) return;
    setError(null);
    setBusy("save-version-tr");
    try {
      const res = await fetch(`/api/articles/${article.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sections: translatedRows(),
          snapshotVersion: true,
          versionLabel: `Avant traduction (${langLabel(article.targetLang)}) — ${new Date().toLocaleString("fr-FR")}`,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Enregistrement refusé");
      setSections(translatedRows());
      setArticle((prev) => (prev ? { ...prev, sections: JSON.stringify(translatedRows()) } : prev));
      await loadArticleVersions(article.id);
      setTranslationNotice(
        "Brouillon remplacé par la traduction — le texte d'origine est archivé dans les versions et restaurable."
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de version");
    } finally {
      setBusy(null);
    }
  };

  const copyTranslatedAll = async () => {
    const parts = sections
      .filter((s) => translations[s.id]?.trim())
      .map((s) => `## ${s.heading}\n\n${translations[s.id]}`);
    if (parts.length === 0) return;
    try {
      await navigator.clipboard.writeText(parts.join("\n\n"));
      setTranslationNotice("Copie traduite copiée dans le presse-papiers.");
    } catch {
      setError("Copie presse-papiers indisponible dans ce contexte.");
    }
  };

  const toComplete = countToComplete(sections);
  const generatedCount = sections.filter((s) => s.content.trim().length > 0).length;
  const translatedCount = sections.filter((s) => translations[s.id]?.trim()).length;
  const untranslatedFilled = sections.filter((s) => s.content.trim() && !translations[s.id]?.trim()).length;

  // ── Rendu ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl p-4 sm:p-6 space-y-4">
        <header className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
            <FileText className="h-6 w-6 shrink-0" aria-hidden="true" />
            Brouillon d&apos;article scientifique
          </h1>
          <p className="text-sm text-muted-foreground">
            Synthèse adaptée aux normes de la discipline — à partir du contenu de
            votre projet et/ou d&apos;un mémoire ou thèse importé. Ce n&apos;est pas une
            simple réduction automatique du document source.
          </p>
        </header>

        {/* Articles existants */}
        {articles.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Vos brouillons d&apos;articles</CardTitle>
              <p className="text-xs text-muted-foreground">
                {articles.length} article{articles.length > 1 ? "s" : ""} ·{" "}
                {articles.reduce((n, a) => n + a.sectionsCount, 0)} section(s) ·{" "}
                {articles.reduce((n, a) => n + a.toComplete, 0)} repère(s) à compléter ou vérifier
              </p>
            </CardHeader>
            <CardContent className="space-y-2 max-h-64 overflow-y-auto">
              {articles.map((a) => (
                <div key={a.id} className="flex items-start justify-between gap-2 rounded-md border p-2">
                  <button
                    className="text-left text-sm font-medium hover:underline min-w-0 flex-1"
                    onClick={() => void openArticle(a.id)}
                  >
                    {a.title}
                    <span className="mt-1 flex flex-wrap items-center gap-1">
                      <Badge variant="outline" className="text-[10px] font-normal px-1.5 py-0">
                        {a.articleType}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] font-normal px-1.5 py-0">
                        {a.status}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] font-normal px-1.5 py-0">
                        {a.sectionsCount} section{a.sectionsCount > 1 ? "s" : ""}
                      </Badge>
                      {a.toComplete > 0 && (
                        <Badge
                          variant="outline"
                          className="text-[10px] font-normal px-1.5 py-0 text-amber-600 border-amber-400"
                        >
                          {a.toComplete} à compléter/vérifier
                        </Badge>
                      )}
                    </span>
                  </button>
                  <Button variant="ghost" size="icon" onClick={() => void deleteArticle(a.id)} aria-label={`Supprimer ${a.title}`}>
                    <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Progression */}
        <ol className="flex flex-wrap gap-1.5 text-xs" aria-label="Étapes">
          {STEPS.map((label, i) => (
            <li key={label}>
              <span
                className={
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 " +
                  (i === step ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground")
                }
              >
                {i + 1}. {label}
              </span>
            </li>
          ))}
        </ol>

        {error && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* ── Étape 1 : Sources ── */}
        {step === 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">1. Choisir les sources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  { id: "chapters", label: "Chapitres de la thèse", checked: includeChapters, set: setIncludeChapters, disabled: !activeThesisId },
                  { id: "cadrage", label: "Cadrage (problématique, objectifs)", checked: includeCadrage, set: setIncludeCadrage, disabled: !activeThesisId },
                  { id: "refs", label: "Références bibliographiques", checked: includeReferences, set: setIncludeReferences, disabled: false },
                  { id: "exp", label: "Expérimentations (résultats)", checked: includeExperiments, set: setIncludeExperiments, disabled: false },
                  { id: "notes", label: "Carnet de recherche", checked: includeNotebook, set: setIncludeNotebook, disabled: false },
                ].map((c) => (
                  <label key={c.id} className={"flex items-center gap-2 rounded-md border p-3 text-sm " + (c.disabled ? "opacity-50" : "cursor-pointer")}>
                    <Checkbox checked={c.checked} onCheckedChange={(v) => c.set(v === true)} disabled={c.disabled} />
                    {c.label}
                  </label>
                ))}
              </div>
              {!activeThesisId && (
                <p className="text-xs text-muted-foreground">
                  Aucune thèse active : les éléments liés à la thèse sont désactivés.
                </p>
              )}

              <div className="rounded-md border p-3 space-y-2">
                <p className="text-sm font-medium flex items-center gap-1.5">
                  <FileUp className="h-4 w-4" aria-hidden="true" />
                  Importer un mémoire ou une thèse (DOCX, PDF, TXT/MD — 50 Mo max)
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input ref={fileRef} type="file" accept=".docx,.pdf,.txt,.md" className="flex-1" aria-label="Fichier à importer" />
                  <Button onClick={() => void importFile()} disabled={busy === "import"}>
                    {busy === "import" ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" aria-hidden="true" /> : null}
                    Importer et extraire
                  </Button>
                </div>
                {imports.map((d) => {
                  const hasOcrLimits = parseLimits(d.limits).some((l) => l.kind === "ocr");
                  const job = ocrJob && ocrJob.docId === d.id ? ocrJob : null;
                  const ocrActive = job?.status === "pending" || job?.status === "running";
                  const anotherOcrActive =
                    ocrJob !== null &&
                    ocrJob.docId !== d.id &&
                    (ocrJob.status === "pending" || ocrJob.status === "running");
                  return (
                  <div key={d.id} className="rounded-md border p-2.5 space-y-1.5 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium break-all">
                        {d.filename}{" "}
                        <Badge variant="secondary">{d.fileType.toUpperCase()}</Badge>
                        {d.scanned && (
                          <Badge variant="outline" className="ml-1 text-amber-600 border-amber-400">
                            probablement scanné
                          </Badge>
                        )}
                        {hasOcrLimits && (
                          <Badge variant="outline" className="ml-1 text-emerald-700 border-emerald-400">
                            OCR — relecture requise
                          </Badge>
                        )}
                      </span>
                      <Button variant="ghost" size="icon" onClick={() => void removeImport(d.id)} aria-label={`Retirer ${d.filename}`}>
                        <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {d.pages ? `${d.pages} pages · ` : ""}
                      {d.textLength ?? "—"} caractères extraits
                    </p>
                    {parseLimits(d.limits).map((l, i) => (
                      <p key={i} className={l.kind === "ocr" ? "text-xs text-emerald-700 flex gap-1" : "text-xs text-amber-600 flex gap-1"}>
                        <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" aria-hidden="true" />
                        {l.detail}
                      </p>
                    ))}
                    {d.fileType === "pdf" && d.scanned && !hasOcrLimits && (
                      <div className="rounded-md border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40 p-2 space-y-1.5">
                        <p className="text-xs font-medium">Pages scannées — OCR disponible (exécution asynchrone, un seul OCR à la fois)</p>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Select
                            value={ocrLang[d.id] ?? "fra"}
                            onValueChange={(v) => setOcrLang((prev) => ({ ...prev, [d.id]: v }))}
                          >
                            <SelectTrigger className="w-full sm:w-40 h-8 text-xs" aria-label="Langue de l'OCR">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fra">Français</SelectItem>
                              <SelectItem value="eng">Anglais</SelectItem>
                              <SelectItem value="ara">Arabe</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void launchOcr(d)}
                            disabled={busy === `ocr-${d.id}` || anotherOcrActive || ocrActive}
                          >
                            {busy === `ocr-${d.id}` || ocrActive ? (
                              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" aria-hidden="true" />
                            ) : null}
                            Lancer l&apos;OCR (plafond 30 pages)
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Les pages sans texte sont reconnues en arrière-plan et ajoutées dans un bloc « TEXTE OCR » marqué — relecture humaine exigée ensuite.
                        </p>
                      </div>
                    )}
                    {job && ocrActive && (
                      <div className="space-y-1" aria-live="polite">
                        <Progress value={typeof job.progress === "number" ? job.progress : 5} />
                        <p className="text-xs text-muted-foreground">
                          {job.progressNote ?? "OCR en cours…"}
                        </p>
                      </div>
                    )}
                    {job && job.status === "failed" && (
                      <p className="text-xs text-destructive" role="alert">
                        Échec de l&apos;OCR : {job.error ?? "motif non précisé"}
                      </p>
                    )}
                    {ocrNotice && !ocrJob && hasOcrLimits && (
                      <p className="text-xs text-emerald-700" aria-live="polite">{ocrNotice}</p>
                    )}
                    {d.preview && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground">Aperçu de l&apos;extraction (confirmez-la)</summary>
                        <pre className="mt-1 max-h-40 overflow-y-auto whitespace-pre-wrap rounded bg-muted p-2">{d.preview}</pre>
                      </details>
                    )}
                  </div>
                  );
                })}
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => void analyzeNow()}
                disabled={busy === "analyze"}
              >
                {busy === "analyze" ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" aria-hidden="true" /> : <Search className="h-4 w-4 mr-1.5" aria-hidden="true" />}
                Analyser les sources (rapport : volumes, sections, études, manquants)
              </Button>
              {analysis && (
                <div className="rounded-md border p-3 space-y-2 text-sm" aria-live="polite">
                  <p className="font-medium">
                    Rapport d&apos;analyse — {analysis.totalChars.toLocaleString("fr-FR")} caractères · qualité : {analysis.quality}
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-0.5">
                    {analysis.bySource.map((s, i) => (
                      <li key={i}>
                        {s.label} ({s.kind}) — {s.chars.toLocaleString("fr-FR")} car.
                      </li>
                    ))}
                  </ul>
                  {analysis.headings.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Sections repérées ({analysis.headings.length}) :</span>{" "}
                      {analysis.headings.slice(0, 8).join(" · ")}
                      {analysis.headings.length > 8 ? "…" : ""}
                    </p>
                  )}
                  {analysis.studies.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Études détectées :</span> {analysis.studies.length}
                    </p>
                  )}
                  {analysis.missing.map((m, i) => (
                    <p key={i} className="text-xs text-amber-600 flex gap-1">
                      <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" aria-hidden="true" />
                      {m}
                    </p>
                  ))}
                  {fragmentation?.risk && (
                    <p className="text-xs text-amber-600 font-medium">{fragmentation.message}</p>
                  )}
                </div>
              )}

              <Button
                className="w-full"
                onClick={() => setStep(1)}
                disabled={!includeChapters && !includeCadrage && !includeReferences && !includeExperiments && !includeNotebook && imports.length === 0}
              >
                Continuer vers les consignes
                <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ── Étape 2 : Consignes ── */}
        {step === 1 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">2. Définir les consignes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="ar-title">Titre de l&apos;article *</Label>
                <Input id="ar-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre provisoire de l'article…" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Type d&apos;article</Label>
                  <Select value={articleType} onValueChange={setArticleType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="empirique">Étude empirique</SelectItem>
                      <SelectItem value="qualitatif">Étude qualitative</SelectItem>
                      <SelectItem value="quantitatif">Étude quantitative</SelectItem>
                      <SelectItem value="theorique">Article théorique</SelectItem>
                      <SelectItem value="revue">Revue de littérature</SelectItem>
                      <SelectItem value="cas">Étude de cas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ar-discipline">Discipline / domaine</Label>
                  <Input id="ar-discipline" value={discipline} onChange={(e) => setDiscipline(e.target.value)} placeholder="ex. Urbanisme & TIC" />
                </div>
                <div className="space-y-1.5">
                  <Label>Langue de rédaction</Label>
                  <Select value={targetLang} onValueChange={setTargetLang}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">Anglais</SelectItem>
                      <SelectItem value="ar">Arabe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ar-words">Longueur cible (mots)</Label>
                  <Input id="ar-words" type="number" min={500} max={30000} value={targetWords} onChange={(e) => setTargetWords(Number(e.target.value) || 6000)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Style bibliographique</Label>
                  <Select value={biblioStyle} onValueChange={setBiblioStyle}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="APA">APA</SelectItem>
                      <SelectItem value="IEEE">IEEE</SelectItem>
                      <SelectItem value="Vancouver">Vancouver</SelectItem>
                      <SelectItem value="Chicago">Chicago</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ar-journal">Revue cible</Label>
                  <Input id="ar-journal" value={targetJournal} onChange={(e) => setTargetJournal(e.target.value)} placeholder="Nom de la revue (optionnel)" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ar-guide">Consignes de la revue / guide auteur (collées ici)</Label>
                <Textarea id="ar-guide" value={journalGuide} onChange={(e) => setJournalGuide(e.target.value)} rows={3} placeholder="Consignes spécifiques de la revue (optionnel)…" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="ar-authors">Auteurs / affiliations</Label>
                  <Input id="ar-authors" value={authors} onChange={(e) => setAuthors(e.target.value)} placeholder="Prénom Nom, affiliation…" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ar-angle">Angle / contribution</Label>
                  <div className="flex gap-2">
                    <Input id="ar-angle" value={angle} onChange={(e) => { setAngle(e.target.value); setAngleChosen(true); }} placeholder="Ce que l'article met en avant…" />
                    <Button variant="outline" onClick={() => void proposeAngles()} disabled={busy === "angles"} className="shrink-0">
                      {busy === "angles" ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" aria-hidden="true" /> : <Wand2 className="h-4 w-4 mr-1.5" aria-hidden="true" />}
                      Proposer des angles
                    </Button>
                  </div>
                </div>
              </div>
              {angleProposals.length > 0 && (
                <div className="space-y-2" role="radiogroup" aria-label="Choix de l'angle">
                  <p className="text-xs font-medium">Choisissez UN angle (obligatoire avant génération quand plusieurs études sont détectées) :</p>
                  {angleProposals.map((a, i) => (
                    <label key={i} className="flex items-start gap-2 rounded-md border p-3 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="angle-choice"
                        className="mt-1"
                        checked={angle === a.angle}
                        onChange={() => { setAngle(a.angle); setAngleChosen(true); }}
                      />
                      <span>
                        <span className="font-medium">{a.angle}</span>
                        <span className="block text-xs text-muted-foreground">{a.rationale}</span>
                        <span className="block text-xs text-muted-foreground">Couvre : {a.coverage}</span>
                      </span>
                    </label>
                  ))}
                  {fragmentation?.risk && (
                    <p className="text-xs text-amber-600 font-medium">{fragmentation.message}</p>
                  )}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Si la thèse contient plusieurs études, un seul angle sera retenu pour cet article — le fractionnement en plusieurs articles se fait explicitement, jamais automatiquement.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(0)}>
                  <ChevronLeft className="h-4 w-4 mr-1" aria-hidden="true" /> Retour
                </Button>
                <Button onClick={() => void createArticle()} disabled={busy === "create"} className="flex-1">
                  {busy === "create" ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" aria-hidden="true" /> : null}
                  Créer l&apos;article (enregistré séparément de sa source)
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Étape 3 : Plan ── */}
        {step === 2 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">3. Valider un plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!article ? (
                <p className="text-sm text-muted-foreground">Créez d&apos;abord l&apos;article (étape 2).</p>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={() => void proposePlan()} disabled={busy === "plan"} className="flex-1">
                      {busy === "plan" ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" aria-hidden="true" /> : <Wand2 className="h-4 w-4 mr-1.5" aria-hidden="true" />}
                      Proposer un plan (IA, à partir des sources)
                    </Button>
                    <Button variant="ghost" onClick={() => setPlan((prev) => [...prev, { id: `s${prev.length + 1}-${Date.now()}`, heading: "Nouvelle section", brief: "" }])}>
                      <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" /> Ajouter une section
                    </Button>
                  </div>
                  {plan.map((row, i) => (
                    <div key={row.id} className="rounded-md border p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{i + 1}</Badge>
                        <Input
                          value={row.heading}
                          onChange={(e) => setPlan((prev) => prev.map((p) => (p.id === row.id ? { ...p, heading: e.target.value } : p)))}
                          aria-label={`Titre de la section ${i + 1}`}
                          className="flex-1"
                        />
                        <Button variant="ghost" size="icon" onClick={() => setPlan((prev) => prev.filter((p) => p.id !== row.id))} aria-label={`Retirer la section ${i + 1}`}>
                          <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
                        </Button>
                      </div>
                      <Textarea
                        value={row.brief ?? ""}
                        onChange={(e) => setPlan((prev) => prev.map((p) => (p.id === row.id ? { ...p, brief: e.target.value } : p)))}
                        placeholder="Ce que cette section couvre (modifiable)…"
                        rows={2}
                        aria-label={`Contenu attendu de la section ${i + 1}`}
                      />
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      <ChevronLeft className="h-4 w-4 mr-1" aria-hidden="true" /> Consignes
                    </Button>
                    <Button onClick={() => void savePlan()} disabled={busy === "save-plan" || plan.length === 0} className="flex-1">
                      {busy === "save-plan" ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" aria-hidden="true" /> : null}
                      Valider le plan et passer à la génération
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── Étape 4 : Génération ── */}
        {step === 3 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">4. Générer le brouillon (section par section)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={plan.length > 0 ? (generatedCount / plan.length) * 100 : 0} aria-label="Progression de la génération" />
              <p className="text-xs text-muted-foreground">
                {generatedCount}/{plan.length} sections générées. Chaque section est générée séparément — les autres ne sont pas touchées.
              </p>
              {sections.map((s, i) => (
                <div key={s.id} className="rounded-md border p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{i + 1}. {s.heading}</p>
                    <Button
                      size="sm"
                      variant={s.content ? "outline" : "default"}
                      onClick={() => void generateSection(s.id)}
                      disabled={generatingId !== null}
                    >
                      {generatingId === s.id ? (
                        <Loader2 className="h-4 w-4 mr-1.5 animate-spin" aria-hidden="true" />
                      ) : s.content ? (
                        <RefreshCw className="h-4 w-4 mr-1.5" aria-hidden="true" />
                      ) : (
                        <Wand2 className="h-4 w-4 mr-1.5" aria-hidden="true" />
                      )}
                      {generatingId === s.id ? "Génération…" : s.content ? "Régénérer" : "Générer"}
                    </Button>
                  </div>
                  <Textarea
                    value={s.content}
                    onChange={(e) => updateSectionContent(s.id, e.target.value)}
                    rows={s.content ? 8 : 3}
                    placeholder="Génération lancée, ou rédigez/collez ici librement…"
                    aria-label={`Contenu de la section ${s.heading}`}
                  />
                  {s.sources.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Sources utilisées :</span>{" "}
                      {s.sources.map((src) => `${src.label} (${src.kind})`).join(" ; ")}
                    </p>
                  )}
                </div>
              ))}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ChevronLeft className="h-4 w-4 mr-1" aria-hidden="true" /> Plan
                </Button>
                <Button onClick={() => void saveSections()} disabled={busy === "save"} variant="outline" className="flex-1">
                  {busy === "save" ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4 mr-1.5" aria-hidden="true" />}
                  Enregistrer le brouillon
                </Button>
                <Button onClick={() => { void saveSections(); setStep(4); }} className="flex-1">
                  Relecture &amp; export <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Étape 5 : Relecture ── */}
        {step === 4 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">5. Relire, versionner, exporter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-md border border-amber-400/50 bg-amber-50 dark:bg-amber-950/30 p-3 text-sm text-amber-800 dark:text-amber-300">
                {DISCLAIMER}
                {toComplete > 0 && (
                  <p className="mt-1.5 font-medium">
                    {toComplete} repère{toComplete > 1 ? "s" : ""} « à compléter / à vérifier » à traiter avant soumission.
                  </p>
                )}
              </div>
              <div className="rounded-md border p-3 space-y-2">
                <p className="text-sm font-medium flex items-center gap-1.5">
                  <Languages className="h-4 w-4" aria-hidden="true" />
                  Traduction (copie distincte)
                </p>
                <p className="text-xs text-muted-foreground">
                  La traduction est enregistrée à part : les sections originales restent intactes. Sens,
                  données, unités et citations préservés — aucun contenu ajouté, repères
                  « [À compléter par l'auteur] » conservés tels quels.
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <Select value={translateTarget} onValueChange={setTranslateTarget}>
                    <SelectTrigger className="sm:w-44" aria-label="Langue cible de la traduction">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">Anglais</SelectItem>
                      <SelectItem value="ar">Arabe</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={() => void translateWholeArticle()}
                    disabled={busy !== null || generatedCount === 0}
                  >
                    {busy === "translate-all" ? (
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" aria-hidden="true" />
                    ) : (
                      <Languages className="h-4 w-4 mr-1.5" aria-hidden="true" />
                    )}
                    {busy === "translate-all"
                      ? `Traduction… ${translatedCount}/${generatedCount}`
                      : "Traduire l'article entier"}
                  </Button>
                </div>
              </div>
              {sections.map((s, i) => (
                <div key={s.id} className="rounded-md border p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium min-w-0 truncate">{i + 1}. {s.heading}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="shrink-0"
                      onClick={() => void translateSection(s.id)}
                      disabled={busy !== null || !s.content.trim()}
                      aria-label={`Traduire la section ${s.heading} en ${langLabel(translateTarget)}`}
                    >
                      {busy === `translate-${s.id}` ? (
                        <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" aria-hidden="true" />
                      ) : (
                        <Languages className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                      )}
                      Traduire
                    </Button>
                  </div>
                  <Textarea value={s.content} onChange={(e) => updateSectionContent(s.id, e.target.value)} rows={6} aria-label={`Relire la section ${s.heading}`} />
                  {s.sources.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Sources : {s.sources.map((src) => `${src.label} (${src.kind})`).join(" ; ")}
                    </p>
                  )}
                </div>
              ))}
              {translatedCount > 0 && (
                <div className="rounded-md border border-primary/40 p-3 space-y-2" aria-live="polite">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-sm font-medium flex items-center gap-1.5">
                      <Languages className="h-4 w-4" aria-hidden="true" />
                      Copie traduite ({langLabel(translateTarget)})
                      <Badge variant="secondary">original intact</Badge>
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => void copyTranslatedAll()} disabled={busy !== null}>
                        <Copy className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                        Copier
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setTranslations({});
                          setTranslationNotice(null);
                        }}
                        disabled={busy !== null}
                      >
                        Effacer
                      </Button>
                    </div>
                  </div>
                  {sections
                    .filter((s) => translations[s.id]?.trim())
                    .map((s) => (
                      <div key={s.id} className="rounded-md border p-2.5 space-y-1.5">
                        <p className="text-xs font-medium text-muted-foreground">{s.heading}</p>
                        <Textarea
                          value={translations[s.id]}
                          onChange={(e) => setTranslations((prev) => ({ ...prev, [s.id]: e.target.value }))}
                          rows={5}
                          aria-label={`Traduction de la section ${s.heading}`}
                        />
                      </div>
                    ))}
                  {untranslatedFilled > 0 && (
                    <p className="text-xs text-amber-600">
                      {untranslatedFilled} section{untranslatedFilled > 1 ? "s" : ""} non traduite{untranslatedFilled > 1 ? "s" : ""} : elle{untranslatedFilled > 1 ? "s" : ""} sera conservée{untranslatedFilled > 1 ? "s" : ""} dans la langue d&apos;origine dans la copie.
                    </p>
                  )}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={() => void saveTranslatedCopy()} disabled={busy !== null} className="flex-1">
                      {busy === "save-copy" ? (
                        <Loader2 className="h-4 w-4 mr-1.5 animate-spin" aria-hidden="true" />
                      ) : (
                        <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
                      )}
                      Enregistrer comme nouvel article (copie traduite)
                    </Button>
                    <Button variant="outline" onClick={() => void saveTranslatedVersion()} disabled={busy !== null} className="flex-1">
                      {busy === "save-version-tr" ? (
                        <Loader2 className="h-4 w-4 mr-1.5 animate-spin" aria-hidden="true" />
                      ) : (
                        <History className="h-4 w-4 mr-1.5" aria-hidden="true" />
                      )}
                      Enregistrer comme version
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    « Version » : le brouillon devient la traduction et le texte d&apos;origine est archivé
                    dans l&apos;historique (restaurable ci-dessous). « Nouvel article » : l&apos;original n&apos;est
                    jamais touché.
                  </p>
                  {translationNotice && <p className="text-xs text-emerald-600 font-medium">{translationNotice}</p>}
                </div>
              )}
              {article && article.versions && article.versions.length > 0 && (
                <div className="rounded-md border p-3 space-y-1.5">
                  <p className="text-sm font-medium flex items-center gap-1.5">
                    <History className="h-4 w-4" aria-hidden="true" /> Versions enregistrées
                  </p>
                  {article.versions.map((v) => (
                    <div key={v.id} className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-muted-foreground">
                        {v.label ?? "Version"} — {new Date(v.createdAt).toLocaleString("fr-FR")}
                      </span>
                      <Button size="sm" variant="ghost" onClick={() => void restoreVersion(v.sections)}>
                        Restaurer
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setStep(3)}>
                  <ChevronLeft className="h-4 w-4 mr-1" aria-hidden="true" /> Génération
                </Button>
                <Button variant="outline" onClick={() => void saveSections()} disabled={busy === "save"} className="flex-1">
                  {busy === "save" ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4 mr-1.5" aria-hidden="true" />}
                  Enregistrer les modifications
                </Button>
                <Button variant="outline" onClick={() => void saveVersion()} disabled={busy === "version"} className="flex-1">
                  {busy === "version" ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" aria-hidden="true" /> : <History className="h-4 w-4 mr-1.5" aria-hidden="true" />}
                  Enregistrer une version
                </Button>
                <Button onClick={() => void exportDocx()} disabled={busy === "export"} className="flex-1">
                  {busy === "export" ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" aria-hidden="true" /> : <Download className="h-4 w-4 mr-1.5" aria-hidden="true" />}
                  Exporter en DOCX
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
