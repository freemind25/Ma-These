"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Briefcase,
  GraduationCap,
  CalendarDays,
  FileText,
  Users,
  Link2,
  CheckCircle2,
  Circle,
  Clock,
  Upload,
  Plus,
  Trash2,
  ExternalLink,
  Phone,
  Mail,
  StickyNote,
  Target,
  TrendingUp,
  Loader2,
  Save,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
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

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

interface ChecklistPhase {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: ChecklistItem[];
}

interface Milestone {
  id: string;
  title: string;
  date: string;
  type: "jalon" | "echeance" | "reunion";
  done: boolean;
}

interface RequiredDocument {
  id: string;
  name: string;
  description: string;
  status: "absent" | "en_cours" | "soumis";
  notes: string;
}

interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  notes: string;
}

interface UsefulLink {
  id: string;
  title: string;
  url: string;
  category: string;
  description: string;
}

interface Thesis {
  id: string;
  title: string;
  author?: string;
  discipline?: string;
}

interface DoctoralToolboxData {
  id: string;
  thesisId: string;
  checklist: string;
  milestones: string;
  documents: string;
  contacts: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ═══════════════════════════════════════
// Initial Data
// ═══════════════════════════════════════

const INITIAL_PHASES: ChecklistPhase[] = [
  {
    id: "inscription",
    title: "Inscription",
    icon: <GraduationCap className="h-4 w-4" />,
    items: [
      { id: "ins-1", label: "Constitution du dossier d'inscription", checked: false },
      { id: "ins-2", label: "Lettre de recommandation du directeur de thèse", checked: false },
      { id: "ins-3", label: "Attestation de master ou équivalent", checked: false },
      { id: "ins-4", label: "Lettre de motivation", checked: false },
      { id: "ins-5", label: "Projet de recherche préliminaire (3-5 pages)", checked: false },
      { id: "ins-6", label: "Avis favorable de la commission doctorale", checked: false },
      { id: "ins-7", label: "Inscription administrative auprès du secrétariat", checked: false },
    ],
  },
  {
    id: "cours",
    title: "Cours et formation",
    icon: <BookIcon className="h-4 w-4" />,
    items: [
      { id: "cours-1", label: "Inscription aux enseignements méthodologiques", checked: false },
      { id: "cours-2", label: "Suivi du séminaire doctoral", checked: false },
      { id: "cours-3", label: "Formation à la recherche (module obligatoire)", checked: false },
      { id: "cours-4", label: "Formation éthique de la recherche", checked: false },
      { id: "cours-5", label: "Participation aux conférences et journées d'étude", checked: false },
      { id: "cours-6", label: "Validation des crédits de formation", checked: false },
      { id: "cours-7", label: "Formation aux outils bibliographiques (Zotero, EndNote)", checked: false },
    ],
  },
  {
    id: "recherche",
    title: "Recherche",
    icon: <Target className="h-4 w-4" />,
    items: [
      { id: "rech-1", label: "Revue de littérature approfondie", checked: false },
      { id: "rech-2", label: "Cadre théorique et conceptualisation", checked: false },
      { id: "rech-3", label: "Formulation des questions/hypothèses de recherche", checked: false },
      { id: "rech-4", label: "Choix et justification de la méthodologie", checked: false },
      { id: "rech-5", label: "Collecte de données (terrain, enquête, archives)", checked: false },
      { id: "rech-6", label: "Analyse des données", checked: false },
      { id: "rech-7", label: "Rédaction d'au moins un article scientifique", checked: false },
      { id: "rech-8", label: "Présentation dans un congrès national ou international", checked: false },
    ],
  },
  {
    id: "redaction",
    title: "Rédaction",
    icon: <FileText className="h-4 w-4" />,
    items: [
      { id: "red-1", label: "Plan détaillé de la thèse validé par le directeur", checked: false },
      { id: "red-2", label: "Introduction générale", checked: false },
      { id: "red-3", label: "Chapitres de revue de littérature", checked: false },
      { id: "red-4", label: "Chapitres méthodologiques", checked: false },
      { id: "red-5", label: "Chapitres de résultats et analyse", checked: false },
      { id: "red-6", label: "Discussion et synthèse", checked: false },
      { id: "red-7", label: "Conclusion générale et perspectives", checked: false },
    ],
  },
  {
    id: "soutenance",
    title: "Soutenance",
    icon: <GraduationCap className="h-4 w-4" />,
    items: [
      { id: "sout-1", label: "Premier manuscrit complet remis au directeur", checked: false },
      { id: "sout-2", label: "Relecture et corrections après retour du directeur", checked: false },
      { id: "sout-3", label: "Demande d'autorisation de soutenance", checked: false },
      { id: "sout-4", label: "Constitution du rapport préalable par les rapporteurs", checked: false },
      { id: "sout-5", label: "Dépôt du manuscrit final (format institutionnel)", checked: false },
      { id: "sout-6", label: "Planification de la séance de soutenance", checked: false },
      { id: "sout-7", label: "Préparation de la présentation orale", checked: false },
      { id: "sout-8", label: "Soutenance de la thèse", checked: false },
      { id: "sout-9", label: "Dépôt de la version finale en ligne (thèse.fr / archive)", checked: false },
    ],
  },
];

const INITIAL_MILESTONES: Milestone[] = [
  { id: "ms-1", title: "Date prévue de première inscription doctorale", date: "2024-09-15", type: "jalon", done: true },
  { id: "ms-2", title: "Validation du sujet de thèse", date: "2024-12-20", type: "jalon", done: true },
  { id: "ms-3", title: "Réunion de suivi n°1 avec le directeur", date: "2025-02-10", type: "reunion", done: true },
  { id: "ms-4", title: "Fin de la phase de cours doctoral", date: "2025-06-30", type: "echeance", done: false },
  { id: "ms-5", title: "Réunion de suivi n°2 — État d'avancement", date: "2025-06-15", type: "reunion", done: false },
  { id: "ms-6", title: "Soumission article scientifique", date: "2025-09-01", type: "echeance", done: false },
  { id: "ms-7", title: "Réunion de suivi n°3 — Bilan mi-parcours", date: "2025-12-10", type: "reunion", done: false },
  { id: "ms-8", title: "Achèvement de la collecte de données", date: "2026-03-31", type: "echeance", done: false },
  { id: "ms-9", title: "Premier manuscrit complet", date: "2026-07-01", type: "jalon", done: false },
  { id: "ms-10", title: "Demande d'autorisation de soutenance", date: "2026-09-01", type: "jalon", done: false },
  { id: "ms-11", title: "Dépôt du manuscrit final", date: "2026-10-15", type: "echeance", done: false },
  { id: "ms-12", title: "Date proposée de soutenance", date: "2026-12-10", type: "jalon", done: false },
];

const INITIAL_DOCUMENTS: RequiredDocument[] = [
  { id: "doc-1", name: "Page de titre", description: "Page de garde conforme au template de l'établissement", status: "absent", notes: "" },
  { id: "doc-2", name: "Page de signatures", description: "Signatures du directeur, du doyen et du président de l'université", status: "absent", notes: "" },
  { id: "doc-3", name: "Avis d'éthique (CER)", description: "Avis du comité d'éthique de la recherche si requis", status: "absent", notes: "" },
  { id: "doc-4", name: "CV du candidat", description: "Curriculum vitae académique actualisé", status: "absent", notes: "" },
  { id: "doc-5", name: "Lettre du directeur de thèse", description: "Lettre officielle d'encadrement et d'approbation", status: "absent", notes: "" },
  { id: "doc-6", name: "Relevés de notes (Master)", description: "Copies certifiées conformes des relevés de notes", status: "absent", notes: "" },
  { id: "doc-7", name: "Attestation d'inscription", description: "Attestation d'inscription en année de doctorat", status: "absent", notes: "" },
  { id: "doc-8", name: "Fiche de renseignements doctoraux", description: "Formulaire officiel de l'école doctorale", status: "absent", notes: "" },
  { id: "doc-9", name: "Rapports préalables des rapporteurs", description: "Deux rapports écrits par les rapporteurs du jury", status: "absent", notes: "" },
  { id: "doc-10", name: "Résumé (fr/en, 300 mots)", description: "Résumés en français et en anglais de la thèse", status: "absent", notes: "" },
  { id: "doc-11", name: "Mots-clés (fr/en)", description: "Liste de mots-clés en français et en anglais", status: "absent", notes: "" },
  { id: "doc-12", name: "Plan de la thèse", description: "Table des matières détaillée", status: "absent", notes: "" },
  { id: "doc-13", name: "Bibliographie complète", description: "Liste complète des références citées", status: "absent", notes: "" },
  { id: "doc-14", name: "Annexes", description: "Documents complémentaires (tableaux, figures, preuves)", status: "absent", notes: "" },
  { id: "doc-15", name: "Résumé des formations suivies", description: "Attestations de formation doctorale validée", status: "absent", notes: "" },
  { id: "doc-16", name: "Déclaration de non-plagiat", description: "Attestation sur l'honneur de travail original", status: "absent", notes: "" },
];

const INITIAL_CONTACTS: Contact[] = [
  {
    id: "ct-1",
    name: "",
    role: "Directeur de thèse",
    email: "",
    phone: "",
    notes: "",
  },
  {
    id: "ct-2",
    name: "",
    role: "Co-directeur (le cas échéant)",
    email: "",
    phone: "",
    notes: "",
  },
  {
    id: "ct-3",
    name: "",
    role: "Rapporteur du jury",
    email: "",
    phone: "",
    notes: "",
  },
  {
    id: "ct-4",
    name: "",
    role: "Secrétariat école doctorale",
    email: "",
    phone: "",
    notes: "",
  },
];

const INITIAL_LINKS: UsefulLink[] = [
  {
    id: "lk-1",
    title: "Modèle de thèse (template Word/LaTeX)",
    url: "https://www.theses.fr/",
    category: "Modèles",
    description: "Templates officiels pour la mise en page de votre manuscrit de thèse",
  },
  {
    id: "lk-2",
    title: "Guide de mise en forme APA 7e édition",
    url: "https://apastyle.apa.org/",
    category: "Normes",
    description: "Guide complet des normes de citation et de mise en forme APA",
  },
  {
    id: "lk-3",
    title: "thèses.fr — Portail des thèses en France",
    url: "https://www.theses.fr/",
    category: "Institutionnel",
    description: "Annuaire national des thèses soutenues et en cours",
  },
  {
    id: "lk-4",
    title: "HAL — Archive ouverte",
    url: "https://hal.science/",
    category: "Archivage",
    description: "Dépôt légal des thèses et articles en accès ouvert",
  },
  {
    id: "lk-5",
    title: "ANR — Appels à projets",
    url: "https://anr.fr/fr/appels-a-projets/",
    category: "Financement",
    description: "Bourses et financements de recherche doctorale et post-doctorale",
  },
  {
    id: "lk-6",
    title: "ERIC — École doctorale (générique)",
    url: "https://www.ens-lyon.fr/eric",
    category: "Institutionnel",
    description: "Informations et règlements de l'école doctorale",
  },
  {
    id: "lk-7",
    title: "Sudoc — Catalogue du Système Universitaire de Documentation",
    url: "https://www.sudoc.abes.fr/",
    category: "Bibliothèque",
    description: "Accès aux ressources documentaires des bibliothèques universitaires",
  },
  {
    id: "lk-8",
    title: "Outil de gestion de références — Zotero",
    url: "https://www.zotero.org/",
    category: "Outils",
    description: "Logiciel gratuit de gestion bibliographique",
  },
];

// ═══════════════════════════════════════
// Helper Components
// ═══════════════════════════════════════

function BookIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}

function StatusBadge({ status }: { status: "absent" | "en_cours" | "soumis" }) {
  const config = {
    absent: { label: "Absent", variant: "outline" as const, className: "text-muted-foreground border-muted-foreground/30" },
    en_cours: { label: "En cours", variant: "secondary" as const, className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
    soumis: { label: "Soumis", variant: "default" as const, className: "bg-emerald-600 text-white" },
  };
  const c = config[status];
  return <Badge variant={c.variant} className={c.className}>{c.label}</Badge>;
}

function MilestoneTypeBadge({ type }: { type: "jalon" | "echeance" | "reunion" }) {
  const config = {
    jalon: { label: "Jalon", className: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300" },
    echeance: { label: "Échéance", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
    reunion: { label: "Réunion", className: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300" },
  };
  const c = config[type];
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

// ═══════════════════════════════════════
// Loading skeleton
// ═══════════════════════════════════════

function LoadingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 p-6">
      <Skeleton className="h-10 w-80" />
      <Skeleton className="h-4 w-96" />
      <Skeleton className="h-32 w-full" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

// ═══════════════════════════════════════
// Serialization helpers
// ═══════════════════════════════════════

function serializeChecklist(phases: ChecklistPhase[]): string {
  const map: Record<string, ChecklistItem[]> = {};
  for (const phase of phases) {
    map[phase.id] = phase.items;
  }
  return JSON.stringify(map);
}

function deserializeChecklist(json: string): ChecklistPhase[] {
  try {
    const map = JSON.parse(json) as Record<string, ChecklistItem[]>;
    return INITIAL_PHASES.map((phase) => {
      const storedItems = map[phase.id];
      if (!storedItems || !Array.isArray(storedItems)) return phase;
      return { ...phase, items: storedItems };
    });
  } catch {
    return INITIAL_PHASES;
  }
}

function safeParse<T>(json: string, fallback: T): T {
  try {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) return parsed as T;
    return fallback;
  } catch {
    return fallback;
  }
}

// ═══════════════════════════════════════
// Main Component
// ═══════════════════════════════════════

export function BoiteDoctoralePage() {
  const queryClient = useQueryClient();

  // ── Fetch theses ──
  const { data: theses, isLoading: thesesLoading } = useQuery<Thesis[]>({
    queryKey: ["thesis"],
    queryFn: async () => {
      const res = await fetch("/api/thesis");
      if (!res.ok) throw new Error("Erreur lors du chargement des thèses");
      const json = await res.json();
      return json.data as Thesis[];
    },
    staleTime: 10 * 1000,
  });

  // ── Thesis selection ──
  const [selectedThesisId, setSelectedThesisId] = useState<string | null>(null);

  const selectedThesis = useMemo(() => {
    if (!theses || theses.length === 0) return null;
    const id = selectedThesisId || theses[0].id;
    return theses.find((t) => t.id === id) || theses[0];
  }, [theses, selectedThesisId]);

  const thesisId = selectedThesis?.id ?? null;

  // ── Fetch toolbox data ──
  const { data: toolboxData, isLoading: toolboxLoading } = useQuery<DoctoralToolboxData | null>({
    queryKey: ["doctoral-toolbox", thesisId],
    queryFn: async () => {
      if (!thesisId) return null;
      const res = await fetch(`/api/thesis/${thesisId}/doctoral-toolbox`);
      if (!res.ok) throw new Error("Erreur lors du chargement de la boîte doctorale");
      const json = await res.json();
      return json.data as DoctoralToolboxData | null;
    },
    enabled: !!thesisId,
    staleTime: 5 * 1000,
  });

  // Track whether a toolbox record exists in DB
  const toolboxExists = !!toolboxData;
  const toolboxExistsRef = useRef(toolboxExists);
  useEffect(() => {
    toolboxExistsRef.current = toolboxExists;
  }, [toolboxExists]);

  // ── Local State (initialized from DB or INITIAL_* constants) ──
  const [phases, setPhases] = useState<ChecklistPhase[]>(INITIAL_PHASES);
  const [milestones, setMilestones] = useState<Milestone[]>(INITIAL_MILESTONES);
  const [documents, setDocuments] = useState<RequiredDocument[]>(INITIAL_DOCUMENTS);
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [notes, setNotes] = useState("");

  // Sync local state from fetched DB data
  const initializedThesisRef = useRef<string | null>(null);
  useEffect(() => {
    if (!thesisId || toolboxLoading) return;
    // Re-initialize when switching thesis
    if (initializedThesisRef.current !== thesisId) {
      initializedThesisRef.current = thesisId;
      if (toolboxData) {
        setPhases(deserializeChecklist(toolboxData.checklist));
        setMilestones(safeParse<Milestone[]>(toolboxData.milestones, INITIAL_MILESTONES));
        setDocuments(safeParse<RequiredDocument[]>(toolboxData.documents, INITIAL_DOCUMENTS));
        setContacts(safeParse<Contact[]>(toolboxData.contacts, INITIAL_CONTACTS));
        setNotes(toolboxData.notes || "");
      } else {
        setPhases(INITIAL_PHASES);
        setMilestones(INITIAL_MILESTONES);
        setDocuments(INITIAL_DOCUMENTS);
        setContacts(INITIAL_CONTACTS);
        setNotes("");
      }
    }
  }, [thesisId, toolboxData, toolboxLoading]);

  // ── Save status ──
  const [savingStatus, setSavingStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // ── Auto-save with 1.5s debounce ──
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef = useRef(false);
  const lastSavedRef = useRef("");

  const doSave = useCallback(async () => {
    if (!thesisId || isSavingRef.current) return;

    const payload = {
      checklist: serializeChecklist(phases),
      milestones: JSON.stringify(milestones),
      documents: JSON.stringify(documents),
      contacts: JSON.stringify(contacts),
      notes,
    };
    const payloadStr = JSON.stringify(payload);
    if (payloadStr === lastSavedRef.current) return;

    isSavingRef.current = true;
    setSavingStatus("saving");

    try {
      if (toolboxExistsRef.current) {
        // PUT update
        const res = await fetch(`/api/thesis/${thesisId}/doctoral-toolbox`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Erreur lors de la sauvegarde");
      } else {
        // POST create
        const res = await fetch(`/api/thesis/${thesisId}/doctoral-toolbox`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Erreur lors de la création");
        toolboxExistsRef.current = true;
      }

      lastSavedRef.current = payloadStr;
      setSavingStatus("saved");
      await queryClient.invalidateQueries({ queryKey: ["doctoral-toolbox", thesisId] });
      setTimeout(() => setSavingStatus("idle"), 2000);
    } catch {
      setSavingStatus("error");
      toast.error("Erreur lors de la sauvegarde de la boîte doctorale");
      setTimeout(() => setSavingStatus("idle"), 3000);
    } finally {
      isSavingRef.current = false;
    }
  }, [thesisId, phases, milestones, documents, contacts, notes, queryClient]);

  // Debounce effect — triggers 1.5s after any state change
  useEffect(() => {
    if (!thesisId || toolboxLoading) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      doSave();
    }, 1500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [thesisId, phases, milestones, documents, contacts, notes, toolboxLoading, doSave]);

  // ── Checklist handlers ──
  const toggleItem = (phaseId: string, itemId: string) => {
    setPhases((prev) =>
      prev.map((phase) =>
        phase.id === phaseId
          ? {
              ...phase,
              items: phase.items.map((item) =>
                item.id === itemId ? { ...item, checked: !item.checked } : item
              ),
            }
          : phase
      )
    );
  };

  // ── Milestones State ──
  const toggleMilestone = (id: string) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, done: !m.done } : m))
    );
  };

  // ── Documents State ──
  const cycleDocStatus = (id: string) => {
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        const next = d.status === "absent" ? "en_cours" : d.status === "en_cours" ? "soumis" : "absent";
        return { ...d, status: next };
      })
    );
  };

  const updateDocNotes = (id: string, notes: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, notes } : d))
    );
  };

  // ── Contacts State ──
  const updateContact = (id: string, field: keyof Contact, value: string) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const addContact = () => {
    const newContact: Contact = {
      id: `ct-${Date.now()}`,
      name: "",
      role: "Autre",
      email: "",
      phone: "",
      notes: "",
    };
    setContacts((prev) => [...prev, newContact]);
  };

  const removeContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  // ── Links State (static) ──
  const [links] = useState<UsefulLink[]>(INITIAL_LINKS);

  // ── Progress Calculations ──
  const totalItems = useMemo(() => phases.reduce((sum, p) => sum + p.items.length, 0), [phases]);
  const checkedItems = useMemo(() => phases.reduce((sum, p) => sum + p.items.filter((i) => i.checked).length, 0), [phases]);
  const overallProgress = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  const phaseProgress = useMemo(() => {
    const map: Record<string, number> = {};
    for (const phase of phases) {
      const total = phase.items.length;
      const done = phase.items.filter((i) => i.checked).length;
      map[phase.id] = total > 0 ? Math.round((done / total) * 100) : 0;
    }
    return map;
  }, [phases]);

  const docsSubmitted = documents.filter((d) => d.status === "soumis").length;
  const docsTotal = documents.length;
  const milestonesDone = milestones.filter((m) => m.done).length;
  const milestonesTotal = milestones.length;

  const progressColor = overallProgress >= 75 ? "text-emerald-600" : overallProgress >= 40 ? "text-amber-600" : "text-rose-600";

  // ═══════════════════════════════════════
  // Render — loading & empty states
  // ═══════════════════════════════════════

  if (thesesLoading) return <LoadingSkeleton />;

  if (!theses || theses.length === 0) {
    return (
      <div className="max-w-6xl mx-auto flex flex-col gap-6 p-6">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">Aucune thèse disponible</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Créez d&apos;abord une thèse dans l&apos;éditeur pour utiliser la boîte doctorale.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // Render — main content
  // ═══════════════════════════════════════
  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 p-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 text-white">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Boîte doctorale</h1>
            <p className="text-sm text-muted-foreground">
              Votre boîte à outils complète pour le parcours doctoral
            </p>
          </div>
        </div>
      </div>

      {/* ── Thesis Selector ── */}
      {theses.length > 1 && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium">Thèse :</span>
          {theses.map((t) => (
            <Button
              key={t.id}
              variant={t.id === selectedThesis?.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedThesisId(t.id)}
            >
              {t.title}
            </Button>
          ))}
        </div>
      )}

      {/* ── Saving indicator ── */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground h-4">
        {savingStatus === "saving" && (
          <>
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Sauvegarde...</span>
          </>
        )}
        {savingStatus === "saved" && (
          <>
            <Save className="h-3 w-3 text-emerald-600" />
            <span className="text-emerald-600">Sauvegardé</span>
          </>
        )}
        {savingStatus === "error" && (
          <>
            <span className="text-rose-600">Erreur de sauvegarde</span>
          </>
        )}
      </div>

      {/* ── Suivi global ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-rose-500" />
              <CardTitle className="text-lg">Suivi global</CardTitle>
            </div>
            <span className={`text-3xl font-bold ${progressColor}`}>{overallProgress}%</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={overallProgress} className="h-3" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="flex flex-col gap-1 rounded-lg border p-3">
              <span className="text-xs text-muted-foreground">Étapes validées</span>
              <span className="text-lg font-semibold">
                {checkedItems}<span className="text-sm font-normal text-muted-foreground">/{totalItems}</span>
              </span>
            </div>
            <div className="flex flex-col gap-1 rounded-lg border p-3">
              <span className="text-xs text-muted-foreground">Jalons atteints</span>
              <span className="text-lg font-semibold">
                {milestonesDone}<span className="text-sm font-normal text-muted-foreground">/{milestonesTotal}</span>
              </span>
            </div>
            <div className="flex flex-col gap-1 rounded-lg border p-3">
              <span className="text-xs text-muted-foreground">Documents soumis</span>
              <span className="text-lg font-semibold">
                {docsSubmitted}<span className="text-sm font-normal text-muted-foreground">/{docsTotal}</span>
              </span>
            </div>
            <div className="flex flex-col gap-1 rounded-lg border p-3">
              <span className="text-xs text-muted-foreground">Phases complétées</span>
              <span className="text-lg font-semibold">
                {Object.values(phaseProgress).filter((v) => v === 100).length}<span className="text-sm font-normal text-muted-foreground">/{phases.length}</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Phase Progress Bars ── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {phases.map((phase) => {
          const pct = phaseProgress[phase.id] ?? 0;
          const isComplete = pct === 100;
          return (
            <div
              key={phase.id}
              className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${isComplete ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800" : ""}`}
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${isComplete ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"}`}>
                {phase.icon}
              </div>
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <span className="text-xs font-medium truncate">{phase.title}</span>
                <div className="flex items-center gap-2">
                  <Progress value={pct} className="h-1.5 flex-1" />
                  <span className="text-[10px] font-medium text-muted-foreground w-8 text-right">{pct}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Separator />

      {/* ── Tabs ── */}
      <Tabs defaultValue="checklist" className="w-full">
        <TabsList className="w-full justify-start flex-wrap h-auto gap-1 bg-transparent p-0">
          <TabsTrigger
            value="checklist"
            className="data-[state=active]:bg-rose-100 data-[state=active]:text-rose-900 dark:data-[state=active]:bg-rose-900/30 dark:data-[state=active]:text-rose-300"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Checklist
          </TabsTrigger>
          <TabsTrigger
            value="calendrier"
            className="data-[state=active]:bg-rose-100 data-[state=active]:text-rose-900 dark:data-[state=active]:bg-rose-900/30 dark:data-[state=active]:text-rose-300"
          >
            <CalendarDays className="h-4 w-4 mr-2" />
            Calendrier
          </TabsTrigger>
          <TabsTrigger
            value="documents"
            className="data-[state=active]:bg-rose-100 data-[state=active]:text-rose-900 dark:data-[state=active]:bg-rose-900/30 dark:data-[state=active]:text-rose-300"
          >
            <FileText className="h-4 w-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger
            value="contacts"
            className="data-[state=active]:bg-rose-100 data-[state=active]:text-rose-900 dark:data-[state=active]:bg-rose-900/30 dark:data-[state=active]:text-rose-300"
          >
            <Users className="h-4 w-4 mr-2" />
            Contacts
          </TabsTrigger>
          <TabsTrigger
            value="liens"
            className="data-[state=active]:bg-rose-100 data-[state=active]:text-rose-900 dark:data-[state=active]:bg-rose-900/30 dark:data-[state=active]:text-rose-300"
          >
            <Link2 className="h-4 w-4 mr-2" />
            Liens utiles
          </TabsTrigger>
        </TabsList>

        {/* ══════════════════════════════════ */}
        {/* TAB: Checklist doctorale           */}
        {/* ══════════════════════════════════ */}
        <TabsContent value="checklist" className="mt-4">
          <Accordion type="multiple" defaultValue={["inscription", "cours", "recherche", "redaction", "soutenance"]}>
            {phases.map((phase) => {
              const pct = phaseProgress[phase.id] ?? 0;
              const done = phase.items.filter((i) => i.checked).length;
              return (
                <AccordionItem key={phase.id} value={phase.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 flex-1 mr-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        {phase.icon}
                      </div>
                      <div className="flex flex-col items-start gap-0.5 flex-1">
                        <span className="font-semibold text-sm">{phase.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {done}/{phase.items.length} étapes — {pct}%
                        </span>
                      </div>
                      <Progress value={pct} className="h-2 w-20 hidden sm:block" />
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-1 pt-1">
                      {phase.items.map((item) => (
                        <label
                          key={item.id}
                          className={`flex items-center gap-3 rounded-md px-3 py-2.5 cursor-pointer transition-colors hover:bg-muted/50 ${item.checked ? "opacity-70" : ""}`}
                        >
                          <Checkbox
                            checked={item.checked}
                            onCheckedChange={() => toggleItem(phase.id, item.id)}
                          />
                          <span className={`text-sm ${item.checked ? "line-through text-muted-foreground" : ""}`}>
                            {item.label}
                          </span>
                          {item.checked && <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto shrink-0" />}
                        </label>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </TabsContent>

        {/* ══════════════════════════════════ */}
        {/* TAB: Calendrier doctoral           */}
        {/* ══════════════════════════════════ */}
        <TabsContent value="calendrier" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Jalons et échéances</CardTitle>
              <CardDescription>
                Suivez les dates clés de votre parcours doctoral. Cliquez pour marquer comme accompli.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-[600px] overflow-y-auto pr-1 space-y-2">
                {milestones.map((ms) => (
                  <div
                    key={ms.id}
                    className={`flex items-start gap-3 rounded-lg border p-3 transition-colors cursor-pointer hover:bg-muted/50 ${ms.done ? "opacity-60 bg-emerald-50/50 dark:bg-emerald-950/20" : ""}`}
                    onClick={() => toggleMilestone(ms.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleMilestone(ms.id); } }}
                  >
                    <div className="mt-0.5">
                      {ms.done ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-sm font-medium ${ms.done ? "line-through text-muted-foreground" : ""}`}>
                          {ms.title}
                        </span>
                        <MilestoneTypeBadge type={ms.type} />
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDate(ms.date)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══════════════════════════════════ */}
        {/* TAB: Documents requis               */}
        {/* ══════════════════════════════════ */}
        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Documents requis</CardTitle>
                  <CardDescription className="mt-1">
                    Suivez l'état de chaque document obligatoire. Cliquez pour changer le statut.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Upload className="h-4 w-4" />
                  <span>{docsSubmitted}/{docsTotal} soumis</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[600px] overflow-y-auto pr-1 space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                        <span className="text-sm font-medium">{doc.name}</span>
                        <span className="text-xs text-muted-foreground">{doc.description}</span>
                      </div>
                      <button
                        onClick={() => cycleDocStatus(doc.id)}
                        className="shrink-0"
                        aria-label={`Changer le statut de ${doc.name}`}
                      >
                        <StatusBadge status={doc.status} />
                      </button>
                    </div>
                    <Input
                      placeholder="Notes (optionnel)..."
                      value={doc.notes}
                      onChange={(e) => updateDocNotes(doc.id, e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══════════════════════════════════ */}
        {/* TAB: Contacts institutionnels       */}
        {/* ══════════════════════════════════ */}
        <TabsContent value="contacts" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Contacts institutionnels</CardTitle>
                  <CardDescription className="mt-1">
                    Conservez les coordonnées de votre encadrement et de l'administration.
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={addContact}>
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[600px] overflow-y-auto pr-1 space-y-3">
                {contacts.map((contact) => (
                  <div key={contact.id} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="outline" className="shrink-0">
                        <Users className="h-3 w-3 mr-1" />
                        {contact.role}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-rose-600"
                        onClick={() => removeContact(contact.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Nom complet"
                      value={contact.name}
                      onChange={(e) => updateContact(contact.id, "name", e.target.value)}
                    />
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div className="relative">
                        <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="Courriel"
                          className="pl-9"
                          value={contact.email}
                          onChange={(e) => updateContact(contact.id, "email", e.target.value)}
                        />
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="tel"
                          placeholder="Téléphone"
                          className="pl-9"
                          value={contact.phone}
                          onChange={(e) => updateContact(contact.id, "phone", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <StickyNote className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Textarea
                        placeholder="Notes (rôle spécifique, disponibilité, remarques)..."
                        className="pl-9 min-h-[60px] text-sm resize-none"
                        value={contact.notes}
                        onChange={(e) => updateContact(contact.id, "notes", e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══════════════════════════════════ */}
        {/* TAB: Liens utiles                  */}
        {/* ══════════════════════════════════ */}
        <TabsContent value="liens" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Liens utiles</CardTitle>
              <CardDescription>
                Ressources sélectionnées pour votre parcours doctoral.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-[600px] overflow-y-auto pr-1 space-y-2">
                {links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50 group"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground group-hover:bg-rose-100 group-hover:text-rose-600 dark:group-hover:bg-rose-900/30 dark:group-hover:text-rose-400 transition-colors">
                      <Link2 className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium group-hover:text-rose-700 dark:group-hover:text-rose-300 transition-colors">
                          {link.title}
                        </span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {link.category}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground line-clamp-2">
                        {link.description}
                      </span>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
