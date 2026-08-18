"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  MapPin,
  Plus,
  Trash2,
  ShieldCheck,
  Brain,
  MessageCircle,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  History,
  Search,
  HelpCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAiConfig } from "@/hooks/use-ai-config";

/* ═══════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════ */

interface ReferentielElement {
  typeElement: string;
  label: string;
}

interface ReferentielPhase {
  id: string;
  label: string;
  elements: ReferentielElement[];
}

interface ReferentielData {
  prealable?: {
    id?: string;
    label?: string;
    elements: ReferentielElement[];
  };
  phases?: ReferentielPhase[];
}

interface TypeAnalyse {
  id: string;
  discipline: string;
  nom: string;
  elementsAttendus: string;
  promptQuestionneur?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ElementAnalyse {
  id: string;
  nom: string;
  typeElement: string;
  natureElement: string;
  sousAnalyse: string | null;
  source: string;
  dateSource: string | null;
  geojson: string | null;
  styleConfig: string | null;
  chapitreId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CompletudeResult {
  complet: boolean;
  etape: "prealable" | "analyse";
  manquants: { typeElement: string; label: string }[];
  bloquant: boolean;
  presents?: string[];
}

interface QuestionneurResult {
  questions: string[];
  filtered: number;
  total: number;
}

interface SessionVerification {
  id: string;
  siteEtudeId: string;
  typeAnalyseId: string;
  elementsManquants: string;
  questionsPosees: string;
  reponses: string | null;
  createdAt: string;
}

const NATURE_OPTIONS = [
  { value: "spatial", label: "Spatial" },
  { value: "bibliographique", label: "Bibliographique" },
  { value: "donnee_enquete", label: "Donnée d'enquête" },
  { value: "document", label: "Document" },
] as const;

const NATURE_COLORS: Record<string, string> = {
  spatial: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  bibliographique: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  donnee_enquete: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  document: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
};

/* ═══════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════ */

export function VerificationCartoPage() {
  const { withAiConfig, aiConfig } = useAiConfig();

  // ─── Core state ───
  const [siteEtudeId, setSiteEtudeId] = useState("");
  const [activeTab, setActiveTab] = useState("elements");
  const [initialized, setInitialized] = useState(false);

  // ─── Referential state ───
  const [typesAnalyse, setTypesAnalyse] = useState<TypeAnalyse[]>([]);
  const [selectedTypeAnalyseId, setSelectedTypeAnalyseId] = useState<string>("");

  // ─── Elements state ───
  const [elements, setElements] = useState<ElementAnalyse[]>([]);

  // ─── Form state ───
  const [formNom, setFormNom] = useState("");
  const [formTypeElement, setFormTypeElement] = useState("");
  const [formNatureElement, setFormNatureElement] = useState("");
  const [formSousAnalyse, setFormSousAnalyse] = useState("");
  const [formSource, setFormSource] = useState("");
  const [formDateSource, setFormDateSource] = useState("");

  // ─── Verification state ───
  const [completudeResult, setCompletudeResult] = useState<CompletudeResult | null>(null);
  const [questionneurResult, setQuestionneurResult] = useState<QuestionneurResult | null>(null);
  const [loadingCompletude, setLoadingCompletude] = useState(false);
  const [loadingQuestionneur, setLoadingQuestionneur] = useState(false);

  // ─── History state ───
  const [sessions, setSessions] = useState<SessionVerification[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // ─── Loading state ───
  const [loadingInit, setLoadingInit] = useState(true);
  const [submittingElement, setSubmittingElement] = useState(false);

  // ─── Derived: parsed referential ───
  const referentiel = useMemo<ReferentielData>(() => {
    const ta = typesAnalyse.find((t) => t.id === selectedTypeAnalyseId);
    if (!ta) return { phases: [] };
    try {
      return JSON.parse(ta.elementsAttendus) as ReferentielData;
    } catch {
      return { phases: [] };
    }
  }, [typesAnalyse, selectedTypeAnalyseId]);

  // ─── Derived: all available typeElements from referential ───
  const availableTypeElements = useMemo(() => {
    const all: ReferentielElement[] = [];
    if (referentiel.prealable) {
      all.push(...referentiel.prealable.elements);
    }
    if (referentiel.phases) {
      referentiel.phases.forEach((p) => all.push(...p.elements));
    }
    return all;
  }, [referentiel]);

  // ─── Derived: phases for sousAnalyse select ───
  const availablePhases = useMemo(() => {
    const phases: { id: string; label: string }[] = [];
    if (referentiel.prealable?.id) {
      phases.push({
        id: referentiel.prealable.id,
        label: referentiel.prealable.label || "Cadrage",
      });
    }
    if (referentiel.phases) {
      referentiel.phases.forEach((p) => phases.push({ id: p.id, label: p.label }));
    }
    return phases;
  }, [referentiel]);

  // ─── Derived: elements grouped by sousAnalyse ───
  const elementsGroupedByPhase = useMemo(() => {
    const grouped: Record<string, ElementAnalyse[]> = {};
    // Initialize all phases
    availablePhases.forEach((p) => {
      grouped[p.id] = [];
    });
    // Also have an "Autres" group
    grouped["__autres__"] = [];

    // Map phase id -> phase label
    const phaseMap: Record<string, string> = {};
    availablePhases.forEach((p) => {
      phaseMap[p.id] = p.label;
    });

    // Group elements by their sousAnalyse
    elements.forEach((el) => {
      const phase = el.sousAnalyse || "__autres__";
      if (!grouped[phase]) grouped[phase] = [];
      grouped[phase].push(el);
    });

    return { grouped, phaseMap };
  }, [elements, availablePhases]);

  // ─── Derived: typeElements already added (for completude) ───
  const typeElementsRenseignes = useMemo(() => {
    return elements.map((e) => e.typeElement);
  }, [elements]);

  // ─── Selected typeAnalyse object ───
  const selectedTypeAnalyse = useMemo(() => {
    return typesAnalyse.find((t) => t.id === selectedTypeAnalyseId);
  }, [typesAnalyse, selectedTypeAnalyseId]);

  // ─── Is AI configured? ───
  const isAiConfigured = useMemo(() => {
    return aiConfig && aiConfig.provider !== "zai";
  }, [aiConfig]);

  /* ═══════════════════════════════════════
     Initialization
     ═══════════════════════════════════════ */

  useEffect(() => {
    async function init() {
      setLoadingInit(true);
      try {
        // 1. Seed referential (idempotent)
        await fetch("/api/types-analyse/seed", { method: "POST" });

        // 2. Load types-analyse and elements-analyse in parallel
        const [typesRes, elementsRes] = await Promise.all([
          fetch("/api/types-analyse?discipline=analyse_urbaine"),
          fetch("/api/elements-analyse"),
        ]);

        const typesData = await typesRes.json();
        const elementsData = await elementsRes.json();

        const types: TypeAnalyse[] = typesData.data || [];
        const elems: ElementAnalyse[] = elementsData.data || [];

        setTypesAnalyse(types);
        setElements(elems);

        // Use the first typeAnalyse as default
        if (types.length > 0 && !selectedTypeAnalyseId) {
          setSelectedTypeAnalyseId(types[0].id);
        }
      } catch (err) {
        console.error("[VerificationCarto] Init error:", err);
      } finally {
        setLoadingInit(false);
        setInitialized(true);
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ═══════════════════════════════════════
     CRUD: Add element
     ═══════════════════════════════════════ */

  const handleAddElement = useCallback(async () => {
    if (!formNom.trim() || !formTypeElement || !formNatureElement || !formSource.trim()) return;

    setSubmittingElement(true);
    try {
      const body: Record<string, unknown> = {
        nom: formNom.trim(),
        typeElement: formTypeElement,
        natureElement: formNatureElement,
        sousAnalyse: formSousAnalyse || undefined,
        source: formSource.trim(),
        dateSource: formDateSource ? new Date(formDateSource).toISOString() : undefined,
      };

      const res = await fetch("/api/elements-analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur lors de la création");
      }

      const data = await res.json();
      setElements((prev) => [...prev, data.data]);

      // Reset form
      setFormNom("");
      setFormTypeElement("");
      setFormNatureElement("");
      setFormSousAnalyse("");
      setFormSource("");
      setFormDateSource("");
    } catch (err) {
      console.error("[VerificationCarto] Add element error:", err);
    } finally {
      setSubmittingElement(false);
    }
  }, [formNom, formTypeElement, formNatureElement, formSousAnalyse, formSource, formDateSource]);

  /* ═══════════════════════════════════════
     CRUD: Delete element
     ═══════════════════════════════════════ */

  const handleDeleteElement = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/elements-analyse/${id}`, { method: "DELETE" });
      if (res.ok) {
        setElements((prev) => prev.filter((e) => e.id !== id));
      }
    } catch (err) {
      console.error("[VerificationCarto] Delete error:", err);
    }
  }, []);

  /* ═══════════════════════════════════════
     Module A: Completude (rule-based, NO AI)
     ═══════════════════════════════════════ */

  const handleCompletude = useCallback(async () => {
    if (!siteEtudeId.trim() || !selectedTypeAnalyseId) return;

    setLoadingCompletude(true);
    setCompletudeResult(null);
    try {
      const res = await fetch("/api/verification-carto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "completude",
          siteEtudeId: siteEtudeId.trim(),
          typeAnalyseId: selectedTypeAnalyseId,
          typeElementsRenseignes,
        }),
      });

      const data = await res.json();
      if (data.data) {
        setCompletudeResult(data.data);
      }
    } catch (err) {
      console.error("[VerificationCarto] Completude error:", err);
    } finally {
      setLoadingCompletude(false);
    }
  }, [siteEtudeId, selectedTypeAnalyseId, typeElementsRenseignes]);

  /* ═══════════════════════════════════════
     Module B: Questionneur socratique (AI)
     ═══════════════════════════════════════ */

  const handleQuestionneur = useCallback(async () => {
    if (!siteEtudeId.trim() || !selectedTypeAnalyseId || elements.length === 0) return;

    setLoadingQuestionneur(true);
    setQuestionneurResult(null);
    try {
      const elemsPayload = elements.map((e) => ({
        typeElement: e.typeElement,
        nom: e.nom,
        source: e.source,
        dateSource: e.dateSource,
      }));

      const body = withAiConfig({
        action: "questionneur",
        siteEtudeId: siteEtudeId.trim(),
        typeAnalyseId: selectedTypeAnalyseId,
        elements: elemsPayload,
        typeAnalyseNom: selectedTypeAnalyse?.nom,
      });

      const res = await fetch("/api/verification-carto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.data) {
        setQuestionneurResult(data.data);
      }
    } catch (err) {
      console.error("[VerificationCarto] Questionneur error:", err);
    } finally {
      setLoadingQuestionneur(false);
    }
  }, [siteEtudeId, selectedTypeAnalyseId, elements, selectedTypeAnalyse, withAiConfig]);

  /* ═══════════════════════════════════════
     History
     ═══════════════════════════════════════ */

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const params = new URLSearchParams();
      if (siteEtudeId.trim()) params.set("siteEtudeId", siteEtudeId.trim());
      if (selectedTypeAnalyseId) params.set("typeAnalyseId", selectedTypeAnalyseId);

      const res = await fetch(`/api/verification-carto?${params.toString()}`);
      const data = await res.json();
      setSessions(data.data || []);
    } catch (err) {
      console.error("[VerificationCarto] History error:", err);
    } finally {
      setLoadingHistory(false);
    }
  }, [siteEtudeId, selectedTypeAnalyseId]);

  // Load history when switching to historique tab
  useEffect(() => {
    if (activeTab === "historique" && initialized) {
      loadHistory();
    }
  }, [activeTab, initialized, loadHistory]);

  /* ═══════════════════════════════════════
     Helpers
     ═══════════════════════════════════════ */

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const formatShortDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getTypeElementLabel = (te: string) => {
    return availableTypeElements.find((e) => e.typeElement === te)?.label || te;
  };

  const getPhaseLabel = (phaseId: string | null) => {
    if (!phaseId) return "Non assigné";
    return elementsGroupedByPhase.phaseMap[phaseId] || phaseId;
  };

  const getSessionSummary = (session: SessionVerification) => {
    try {
      const manquants = JSON.parse(session.elementsManquants);
      if (manquants && manquants.bloquant) {
        return `Cadrage incomplet — ${manquants.manquants?.length || 0} élément(s) manquant(s) (bloquant)`;
      }
      if (manquants && manquants.complet) {
        return "Complétude vérifiée — tous les éléments sont renseignés";
      }
      if (manquants && manquants.manquants?.length > 0) {
        return `Éléments manquants — ${manquants.manquants.length} élément(s) à compléter`;
      }
    } catch {
      // not completude
    }
    try {
      const questions = JSON.parse(session.questionsPosees);
      if (Array.isArray(questions) && questions.length > 0) {
        return `${questions.length} question(s) méthodologique(s) posée(s)`;
      }
    } catch {
      // not questionneur
    }
    return "Session de vérification";
  };

  const getSessionActionType = (session: SessionVerification) => {
    try {
      const manquants = JSON.parse(session.elementsManquants);
      if (manquants && ("bloquant" in manquants || "complet" in manquants)) {
        return "completude";
      }
    } catch {
      // not completude
    }
    try {
      const questions = JSON.parse(session.questionsPosees);
      if (Array.isArray(questions)) {
        return "questionneur";
      }
    } catch {
      // not questionneur
    }
    return "verification";
  };

  /* ═══════════════════════════════════════
     Render
     ═══════════════════════════════════════ */

  if (loadingInit) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        <span className="ml-3 text-sm text-muted-foreground">
          Chargement du référentiel…
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <MapPin className="size-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            Vérification méthodologique
          </h1>
        </div>
        <p className="text-sm text-muted-foreground ml-9">
          Vérifiez la complétude de vos données d'analyse selon un référentiel disciplinaire
        </p>
      </div>

      {/* ─── Site d'étude + Type d'analyse ─── */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="site-etude" className="text-sm font-medium">
                Site d'étude
              </Label>
              <Input
                id="site-etude"
                placeholder="Ex: Quartier de la Gare, Montpellier"
                value={siteEtudeId}
                onChange={(e) => setSiteEtudeId(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Type d'analyse</Label>
              <Select
                value={selectedTypeAnalyseId}
                onValueChange={setSelectedTypeAnalyseId}
              >
                <SelectTrigger className="w-full max-w-sm">
                  <SelectValue placeholder="Sélectionner un type d'analyse" />
                </SelectTrigger>
                <SelectContent>
                  {typesAnalyse.map((ta) => (
                    <SelectItem key={ta.id} value={ta.id}>
                      {ta.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Tabs ─── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="elements" className="gap-2">
            <Plus className="size-4" />
            Éléments
            {elements.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {elements.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="verification" className="gap-2">
            <ShieldCheck className="size-4" />
            Vérification
          </TabsTrigger>
          <TabsTrigger value="historique" className="gap-2">
            <History className="size-4" />
            Historique
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════════════════════════
           Tab 1: Éléments (CRUD)
           ═══════════════════════════════════ */}
        <TabsContent value="elements" className="space-y-6 mt-4">
          {/* Add Element Form */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Ajouter un élément</CardTitle>
              <CardDescription>
                Renseignez les données collectées pour votre site d'étude
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="el-nom" className="text-xs font-medium">
                    Nom de l'élément <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="el-nom"
                    placeholder="Ex: Trame viaire principale"
                    value={formNom}
                    onChange={(e) => setFormNom(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium">
                    Type d'élément <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formTypeElement}
                    onValueChange={setFormTypeElement}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner…" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTypeElements.map((te) => (
                        <SelectItem key={te.typeElement} value={te.typeElement}>
                          {te.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium">
                    Nature <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formNatureElement}
                    onValueChange={setFormNatureElement}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner…" />
                    </SelectTrigger>
                    <SelectContent>
                      {NATURE_OPTIONS.map((n) => (
                        <SelectItem key={n.value} value={n.value}>
                          {n.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium">Phase / Sous-analyse</Label>
                  <Select
                    value={formSousAnalyse}
                    onValueChange={setFormSousAnalyse}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner…" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePhases.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="el-source" className="text-xs font-medium">
                    Source <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="el-source"
                    placeholder="Ex: OSM, GADM, IGN"
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="el-date" className="text-xs font-medium">
                    Date de la source
                  </Label>
                  <Input
                    id="el-date"
                    type="date"
                    value={formDateSource}
                    onChange={(e) => setFormDateSource(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-4">
                <Button
                  onClick={handleAddElement}
                  disabled={
                    submittingElement ||
                    !formNom.trim() ||
                    !formTypeElement ||
                    !formNatureElement ||
                    !formSource.trim()
                  }
                  className="gap-2"
                >
                  {submittingElement ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Plus className="size-4" />
                  )}
                  Ajouter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Elements List */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    Éléments renseignés
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {elements.length === 0
                      ? "Aucun élément ajouté. Commencez par renseigner vos données ci-dessus."
                      : `${elements.length} élément(s) sur ${availableTypeElements.length} attendu(s) dans le référentiel`}
                  </CardDescription>
                </div>
                {elements.length > 0 && (
                  <Badge variant="outline" className="text-xs shrink-0">
                    {typeElementsRenseignes.length} / {availableTypeElements.length}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {elements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="size-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">
                    Aucun élément collecté pour le moment.
                  </p>
                  <p className="text-xs mt-1">
                    Utilisez le formulaire ci-dessus pour ajouter vos données d'analyse.
                  </p>
                </div>
              ) : (
                <Accordion
                  type="multiple"
                  defaultValue={Object.keys(elementsGroupedByPhase.grouped).filter(
                    (k) => k !== "__autres__" && elementsGroupedByPhase.grouped[k]?.length > 0
                  )}
                  className="max-h-[32rem] overflow-y-auto"
                >
                  {/* Phases with elements */}
                  {Object.entries(elementsGroupedByPhase.grouped).map(
                    ([phaseId, phaseElements]) => {
                      if (phaseId === "__autres__" && phaseElements.length === 0) return null;
                      const label =
                        phaseId === "__autres__"
                          ? "Non assignés"
                          : getPhaseLabel(phaseId);
                      const count = phaseElements.length;

                      return (
                        <AccordionItem key={phaseId} value={phaseId}>
                          <AccordionTrigger className="text-sm hover:no-underline">
                            <span className="flex items-center gap-2">
                              <span className="font-medium">{label}</span>
                              <Badge variant="secondary" className="text-xs">
                                {count}
                              </Badge>
                            </span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 pl-1">
                              {phaseElements.map((el) => (
                                <div
                                  key={el.id}
                                  className="flex items-start justify-between gap-3 rounded-md border p-3 hover:bg-muted/50 transition-colors"
                                >
                                  <div className="flex-1 min-w-0 space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-sm font-medium truncate">
                                        {el.nom}
                                      </span>
                                      <Badge
                                        variant="outline"
                                        className={
                                          NATURE_COLORS[el.natureElement] || ""
                                        }
                                      >
                                        {NATURE_OPTIONS.find(
                                          (n) => n.value === el.natureElement
                                        )?.label || el.natureElement}
                                      </Badge>
                                      <Badge variant="secondary" className="text-xs">
                                        {getTypeElementLabel(el.typeElement)}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                      <span>Source : {el.source}</span>
                                      {el.dateSource && (
                                        <span>
                                          Date : {formatShortDate(el.dateSource)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="shrink-0 text-muted-foreground hover:text-destructive"
                                    onClick={() => handleDeleteElement(el.id)}
                                    aria-label={`Supprimer ${el.nom}`}
                                  >
                                    <Trash2 className="size-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    }
                  )}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════
           Tab 2: Vérification (Module A + B)
           ═══════════════════════════════════ */}
        <TabsContent value="verification" className="space-y-6 mt-4">
          {/* Module A — Complétude */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary" />
                <div>
                  <CardTitle className="text-base">
                    Module A — Vérification de complétude
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Comparaison rule-based de vos éléments avec le référentiel (aucune IA utilisée)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleCompletude}
                disabled={loadingCompletude || !siteEtudeId.trim() || !selectedTypeAnalyseId}
                className="gap-2"
              >
                {loadingCompletude ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ShieldCheck className="size-4" />
                )}
                Vérifier la complétude
              </Button>

              {!siteEtudeId.trim() && (
                <p className="text-xs text-muted-foreground">
                  Veuillez renseigner un site d'étude pour lancer la vérification.
                </p>
              )}

              {/* Completude Results */}
              {completudeResult && (
                <div className="space-y-3">
                  {completudeResult.bloquant ? (
                    /* BLOCKING — Red alert */
                    <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30 p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <XCircle className="size-5 text-red-600 dark:text-red-400" />
                        <span className="font-semibold text-red-800 dark:text-red-300">
                          Cadrage incomplet
                        </span>
                      </div>
                      <p className="text-sm text-red-700 dark:text-red-400">
                        Les phases suivantes ne sont pas évaluées tant que le cadrage n'est
                        pas complet.
                      </p>
                      <ul className="space-y-1 ml-6">
                        {completudeResult.manquants.map((m, i) => (
                          <li
                            key={m.typeElement || i}
                            className="text-sm text-red-700 dark:text-red-400 list-disc"
                          >
                            {m.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : completudeResult.complet ? (
                    /* COMPLETE — Green success */
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/30 p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                          Tous les éléments attendus sont renseignés.
                        </span>
                      </div>
                      {completudeResult.presents && completudeResult.presents.length > 0 && (
                        <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-2">
                          {completudeResult.presents.length} élément(s) présent(s) sur le
                          référentiel.
                        </p>
                      )}
                    </div>
                  ) : (
                    /* INCOMPLETE but not blocking — Amber warning */
                    <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30 p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400" />
                        <span className="font-semibold text-amber-800 dark:text-amber-300">
                          Éléments manquants pour ce type d'analyse
                        </span>
                      </div>

                      {/* Group missing by phase */}
                      {(() => {
                        const missingByPhase: Record<string, { typeElement: string; label: string }[]> = {};
                        // Check prealable
                        if (referentiel.prealable) {
                          const preElements = referentiel.prealable.elements;
                          const preMissing = completudeResult.manquants.filter((m) =>
                            preElements.some(
                              (e) => e.typeElement === m.typeElement
                            )
                          );
                          if (preMissing.length > 0) {
                            missingByPhase[referentiel.prealable.label || "Cadrage"] = preMissing;
                          }
                        }
                        // Check phases
                        if (referentiel.phases) {
                          referentiel.phases.forEach((phase) => {
                            const phaseMissing = completudeResult.manquants.filter((m) =>
                              phase.elements.some(
                                (e) => e.typeElement === m.typeElement
                              )
                            );
                            if (phaseMissing.length > 0) {
                              missingByPhase[phase.label] = phaseMissing;
                            }
                          });
                        }

                        return Object.entries(missingByPhase).map(
                          ([phaseLabel, items]) => (
                            <div key={phaseLabel} className="ml-2">
                              <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">
                                {phaseLabel}
                              </p>
                              <ul className="space-y-1 ml-4">
                                {items.map((m, i) => (
                                  <li
                                    key={m.typeElement || i}
                                    className="text-sm text-amber-700 dark:text-amber-400 list-disc"
                                  >
                                    {m.label}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )
                        );
                      })()}

                      {completudeResult.presents && completudeResult.presents.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-amber-200 dark:border-amber-800">
                          <p className="text-xs text-amber-600 dark:text-amber-500">
                            {completudeResult.presents.length} élément(s) présent(s) sur le
                            référentiel.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* Module B — Questionneur socratique */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Brain className="size-5 text-primary" />
                <div>
                  <CardTitle className="text-base">
                    Module B — Questionneur socratique
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Questions méthodologiques générées par IA pour interroger vos choix
                    de données
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleQuestionneur}
                disabled={
                  loadingQuestionneur ||
                  !siteEtudeId.trim() ||
                  !selectedTypeAnalyseId ||
                  elements.length === 0 ||
                  !isAiConfigured
                }
                className="gap-2"
              >
                {loadingQuestionneur ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Brain className="size-4" />
                )}
                Poser des questions méthodologiques
              </Button>

              {!isAiConfigured && (
                <p className="text-xs text-muted-foreground">
                  Configurez un fournisseur IA dans les paramètres pour utiliser le
                  questionneur socratique.
                </p>
              )}
              {isAiConfigured && elements.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Ajoutez au moins un élément dans l'onglet « Éléments » pour utiliser le
                  questionneur.
                </p>
              )}

              {/* Questionneur Results */}
              {questionneurResult && (
                <div className="space-y-3">
                  {questionneurResult.questions.length > 0 ? (
                    <ul className="space-y-3">
                      {questionneurResult.questions.map((q, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 rounded-md border p-3 bg-muted/30"
                        >
                          <MessageCircle className="size-4 mt-0.5 shrink-0 text-primary" />
                          <span className="text-sm leading-relaxed">{q}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <HelpCircle className="size-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">
                        Aucune question valide générée. Le modèle n'a pas respecté le
                        format attendu.
                      </p>
                    </div>
                  )}

                  {questionneurResult.filtered > 0 && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <AlertTriangle className="size-3" />
                      {questionneurResult.filtered} question(s) filtrée(s) par les
                      garde-fous
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════
           Tab 3: Historique
           ═══════════════════════════════════ */}
        <TabsContent value="historique" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {siteEtudeId.trim()
                ? `Sessions pour « ${siteEtudeId} »`
                : "Toutes les sessions de vérification"}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={loadHistory}
              disabled={loadingHistory}
              className="gap-2"
            >
              {loadingHistory ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Search className="size-4" />
              )}
              Actualiser
            </Button>
          </div>

          {loadingHistory ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
              <span className="ml-3 text-sm text-muted-foreground">
                Chargement de l'historique…
              </span>
            </div>
          ) : sessions.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <History className="size-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Aucune session de vérification enregistrée.</p>
                  <p className="text-xs mt-1">
                    Lancez une vérification depuis l'onglet « Vérification » pour voir
                    l'historique ici.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 max-h-[32rem] overflow-y-auto">
              {sessions.map((session) => {
                const actionType = getSessionActionType(session);
                const summary = getSessionSummary(session);

                return (
                  <Card key={session.id} className="hover:bg-muted/30 transition-colors">
                    <CardContent className="py-4 px-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant={
                                actionType === "completude"
                                  ? "outline"
                                  : actionType === "questionneur"
                                    ? "secondary"
                                    : "default"
                              }
                              className="text-xs"
                            >
                              {actionType === "completude"
                                ? "Complétude"
                                : actionType === "questionneur"
                                  ? "Questionneur"
                                  : "Vérification"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(session.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{summary}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
