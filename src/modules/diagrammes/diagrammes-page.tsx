"use client";

import { useState, useCallback } from "react";
import {
  GitFork,
  Plus,
  Trash2,
  Copy,
  Check,
  Sparkles,
  ChevronDown,
  ArrowRight,
  ArrowDown,
  GripVertical,
  FileText,
  Clock,
  GitBranch,
  Brain,
  Workflow,
  Edit3,
  LayoutTemplate,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import html2canvas from "html2canvas-pro";
import { useAiConfig } from "@/hooks/use-ai-config";

// ═══════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════

export type DiagramType =
  | "organigramme"
  | "chronologie"
  | "comparatif"
  | "concept"
  | "processus";

interface DiagramNode {
  id: string;
  label: string;
  description?: string;
  parentId?: string;
  date?: string;
  step?: number;
}

interface DiagramConnection {
  from: string;
  to: string;
  label?: string;
}

interface ComparatifColumn {
  id: string;
  header: string;
}

interface ComparatifRow {
  id: string;
  criterion: string;
  cells: Record<string, string>;
}

interface DiagramTemplate {
  id: string;
  name: string;
  description: string;
  type: DiagramType;
  nodes: DiagramNode[];
  connections: DiagramConnection[];
  columns?: ComparatifColumn[];
  rows?: ComparatifRow[];
}

interface DiagramState {
  type: DiagramType;
  title: string;
  nodes: DiagramNode[];
  connections: DiagramConnection[];
  columns: ComparatifColumn[];
  rows: ComparatifRow[];
}

const DIAGRAM_TYPES: { value: DiagramType; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: "organigramme",
    label: "Organigramme",
    icon: <GitBranch className="h-4 w-4" />,
    description: "Hiérarchie et structure organisationnelle",
  },
  {
    value: "chronologie",
    label: "Chronologie",
    icon: <Clock className="h-4 w-4" />,
    description: "Événements sur une ligne temporelle",
  },
  {
    value: "comparatif",
    label: "Tableau comparatif",
    icon: <FileText className="h-4 w-4" />,
    description: "Comparaison multi-critères en tableau",
  },
  {
    value: "concept",
    label: "Carte conceptuelle",
    icon: <Brain className="h-4 w-4" />,
    description: "Carte de concepts et relations",
  },
  {
    value: "processus",
    label: "Processus",
    icon: <Workflow className="h-4 w-4" />,
    description: "Flux d'étapes séquentielles",
  },
];

// ═══════════════════════════════════════════════
// Templates
// ═══════════════════════════════════════════════

function uid(): string {
  return Math.random().toString(36).substring(2, 9);
}

const TEMPLATES: DiagramTemplate[] = [
  {
    id: "tpl-structure-these",
    name: "Structure de thèse",
    description: "Organigramme type d'une thèse académique",
    type: "organigramme",
    nodes: [
      { id: "n1", label: "Thèse", description: "Document principal" },
      { id: "n2", label: "Partie liminaire", parentId: "n1" },
      { id: "n3", label: "Introduction", parentId: "n2" },
      { id: "n4", label: "Problématique", parentId: "n2" },
      { id: "n5", label: "Corps du mémoire", parentId: "n1" },
      { id: "n6", label: "Chapitre 1 — Cadre théorique", parentId: "n5" },
      { id: "n7", label: "Chapitre 2 — Méthodologie", parentId: "n5" },
      { id: "n8", label: "Chapitre 3 — Résultats", parentId: "n5" },
      { id: "n9", label: "Chapitre 4 — Discussion", parentId: "n5" },
      { id: "n10", label: "Conclusion", parentId: "n1" },
      { id: "n11", label: "Bibliographie", parentId: "n1" },
      { id: "n12", label: "Annexes", parentId: "n1" },
    ],
    connections: [],
  },
  {
    id: "tpl-methodo-flow",
    name: "Flux méthodologique",
    description: "Processus de recherche doctoral",
    type: "processus",
    nodes: [
      { id: "s1", label: "Revue de littérature", step: 1 },
      { id: "s2", label: "Formulation des hypothèses", step: 2 },
      { id: "s3", label: "Collecte de données", step: 3 },
      { id: "s4", label: "Analyse des données", step: 4 },
      { id: "s5", label: "Interprétation", step: 5 },
      { id: "s6", label: "Rédaction & discussion", step: 6 },
    ],
    connections: [
      { from: "s1", to: "s2", label: "identifier les lacunes" },
      { from: "s2", to: "s3", label: "définir le plan" },
      { from: "s3", to: "s4", label: "données brutes" },
      { from: "s4", to: "s5", label: "résultats statistiques" },
      { from: "s5", to: "s6", label: "conclusions" },
    ],
  },
  {
    id: "tpl-timeline-doctorale",
    name: "Calendrier doctoral",
    description: "Chronologie des étapes d'une thèse (3 ans)",
    type: "chronologie",
    nodes: [
      { id: "t1", label: "Inscription doctorale", date: "Année 1 — Semestre 1" },
      { id: "t2", label: "Revue de littérature", date: "Année 1 — Semestre 2" },
      { id: "t3", label: "Cadrage méthodologique", date: "Année 2 — Semestre 1" },
      { id: "t4", label: "Collecte & analyse", date: "Année 2 — Semestre 2" },
      { id: "t5", label: "Rédaction", date: "Année 3 — Semestre 1" },
      { id: "t6", label: "Soutenance", date: "Année 3 — Semestre 2" },
    ],
    connections: [],
  },
  {
    id: "tpl-comparatif-methodes",
    name: "Comparaison qualitative / quantitative",
    description: "Tableau comparatif des approches de recherche",
    type: "comparatif",
    nodes: [],
    connections: [],
    columns: [
      { id: "c1", header: "Critère" },
      { id: "c2", header: "Qualitative" },
      { id: "c3", header: "Quantitative" },
    ],
    rows: [
      {
        id: "r1",
        criterion: "Objectif",
        cells: { c2: "Comprendre en profondeur", c3: "Mesurer et quantifier" },
      },
      {
        id: "r2",
        criterion: "Échantillon",
        cells: { c2: "Petit, non représentatif", c3: "Grand, représentatif" },
      },
      {
        id: "r3",
        criterion: "Outils",
        cells: { c2: "Entretiens, observation", c3: "Questionnaires, tests" },
      },
      {
        id: "r4",
        criterion: "Analyse",
        cells: { c2: "Thématique, phénoménologique", c3: "Statistique, inférentielle" },
      },
      {
        id: "r5",
        criterion: "Résultats",
        cells: { c2: "Descriptions riches, contexte", c3: "Généralisables, chiffrés" },
      },
    ],
  },
  {
    id: "tpl-concept-ia",
    name: "Carte conceptuelle — IA en recherche",
    description: "Concept map sur l'intelligence artificielle en recherche académique",
    type: "concept",
    nodes: [
      { id: "root", label: "IA en recherche", description: "Concept central" },
      { id: "c1", label: "NLP", parentId: "root", description: "Traitement du langage" },
      { id: "c2", label: "ML supervisé", parentId: "root", description: "Classification, régression" },
      { id: "c3", label: "LLM", parentId: "root", description: "Génération de texte" },
      { id: "c4", label: "Analyse sentiment", parentId: "c1" },
      { id: "c5", label: "Résumé automatique", parentId: "c1" },
      { id: "c6", label: "Régression", parentId: "c2" },
      { id: "c7", label: "Classification", parentId: "c2" },
      { id: "c8", label: "Génération", parentId: "c3" },
      { id: "c9", label: "Assistance", parentId: "c3" },
    ],
    connections: [],
  },
];

// ═══════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════

function createEmptyDiagram(type: DiagramType): DiagramState {
  return {
    type,
    title: "",
    nodes: type === "comparatif" ? [] : [{ id: uid(), label: "Nouveau nœud", parentId: undefined }],
    connections: [],
    columns: type === "comparatif" ? [{ id: "c1", header: "Critère" }, { id: "c2", header: "Option A" }] : [],
    rows: type === "comparatif" ? [{ id: uid(), criterion: "Nouveau critère", cells: { c2: "" } }] : [],
  };
}

function getChildren(nodes: DiagramNode[], parentId: string): DiagramNode[] {
  return nodes.filter((n) => n.parentId === parentId);
}

// ═══════════════════════════════════════════════
// Renderers (text-based HTML/CSS)
// ═══════════════════════════════════════════════

function OrganigrammeRenderer({ nodes }: { nodes: DiagramNode[] }) {
  const roots = nodes.filter((n) => !n.parentId);

  function renderNode(node: DiagramNode, depth: number) {
    const children = getChildren(nodes, node.id);
    const hasChildren = children.length > 0;

    return (
      <div key={node.id} className="flex flex-col items-center">
        <div
          className={cn(
            "rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-colors min-w-[140px] text-center",
            "bg-white dark:bg-zinc-900 border-amber-300 dark:border-amber-600 text-amber-900 dark:text-amber-200",
            depth === 0 && "border-2 border-amber-500 dark:border-amber-400 bg-amber-50 dark:bg-amber-950/40 font-semibold px-6 py-3"
          )}
        >
          {node.label}
          {node.description && (
            <p className="text-[11px] text-amber-700/60 dark:text-amber-400/60 mt-0.5 font-normal">
              {node.description}
            </p>
          )}
        </div>
        {hasChildren && (
          <>
            <div className="w-0.5 h-4 bg-amber-300 dark:bg-amber-700" />
            <div className="flex gap-6 relative">
              {children.length > 1 && (
                <div className="absolute top-0 left-[50%] right-[50%] h-0.5 bg-amber-300 dark:bg-amber-700 -translate-x-1/2" 
                  style={{ 
                    left: `${50 - (50 / children.length)}%`, 
                    right: `${50 - (50 / children.length)}%`,
                    width: `${100 - (100 / children.length)}%`,
                    marginLeft: `${(100 / children.length) / 2}%`
                  }} 
                />
              )}
              {children.map((child) => (
                <div key={child.id} className="flex flex-col items-center relative">
                  <div className="w-0.5 h-4 bg-amber-300 dark:bg-amber-700" />
                  {renderNode(child, depth + 1)}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex justify-center py-6 overflow-x-auto">
      <div className="flex flex-col items-center gap-1">
        {roots.map((root) => renderNode(root, 0))}
      </div>
    </div>
  );
}

function ChronologieRenderer({ nodes }: { nodes: DiagramNode[] }) {
  const sorted = [...nodes].sort((a, b) => {
    if (a.date && b.date) return a.date.localeCompare(b.date);
    return 0;
  });

  return (
    <div className="relative py-8 px-4">
      {/* Vertical line */}
      <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-emerald-300 dark:bg-emerald-700" />

      <div className="flex flex-col gap-8">
        {sorted.map((node, idx) => (
          <div key={node.id} className="flex items-start gap-6 relative">
            {/* Dot */}
            <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white font-bold text-sm shadow-md">
              {idx + 1}
            </div>

            {/* Date label */}
            <div className="flex flex-col gap-1 pt-1">
              {node.date && (
                <Badge
                  variant="secondary"
                  className="w-fit bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-0 text-[11px] font-semibold"
                >
                  {node.date}
                </Badge>
              )}
              <div className="rounded-lg border border-emerald-200 dark:border-emerald-700 bg-white dark:bg-zinc-900 px-4 py-3 shadow-sm">
                <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                  {node.label}
                </p>
                {node.description && (
                  <p className="text-xs text-muted-foreground mt-1">{node.description}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComparatifRenderer({
  columns,
  rows,
}: {
  columns: ComparatifColumn[];
  rows: ComparatifRow[];
}) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={col.id}
                className={cn(
                  "text-sm font-semibold bg-teal-50 dark:bg-teal-950/30 text-teal-800 dark:text-teal-200 border-b-2 border-teal-200 dark:border-teal-800",
                  col.id === "c1" && "min-w-[160px]"
                )}
              >
                {col.header}
              </TableHead>
            ))}
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium text-sm bg-muted/30">
                {row.criterion}
              </TableCell>
              {columns.filter((c) => c.id !== "c1").map((col) => (
                <TableCell key={col.id} className="text-sm">
                  {row.cells[col.id] || "—"}
                </TableCell>
              ))}
              <TableCell className="w-10">
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground/40" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ConceptMapRenderer({ nodes }: { nodes: DiagramNode[] }) {
  const roots = nodes.filter((n) => !n.parentId);

  function renderNode(node: DiagramNode, depth: number, isLast: boolean, isRoot: boolean) {
    const children = getChildren(nodes, node.id);

    const bgColors = [
      "bg-violet-50 dark:bg-violet-950/30 border-violet-300 dark:border-violet-700 text-violet-900 dark:text-violet-200",
      "bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200",
      "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200",
      "bg-teal-50 dark:bg-teal-950/30 border-teal-300 dark:border-teal-700 text-teal-900 dark:text-teal-200",
    ];
    const colorClass = isRoot
      ? "bg-violet-100 dark:bg-violet-900/40 border-violet-400 dark:border-violet-500 text-violet-900 dark:text-violet-100 font-semibold"
      : bgColors[Math.min(depth, bgColors.length - 1)];

    return (
      <div key={node.id}>
        <div className="flex items-center gap-3 py-1.5">
          {/* Tree connector */}
          <div className="flex items-center gap-2 shrink-0">
            {depth > 0 && (
              <>
                <div className="w-4 h-px bg-violet-300 dark:bg-violet-700" />
                {children.length > 0 ? (
                  <ChevronDown className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400 dark:bg-violet-600" />
                )}
              </>
            )}
          </div>

          {/* Node */}
          <div
            className={cn(
              "rounded-lg border px-3 py-2 text-sm transition-colors inline-flex items-center gap-2",
              colorClass
            )}
          >
            {node.label}
            {node.description && (
              <span className="text-[10px] opacity-60 font-normal ml-1">
                ({node.description})
              </span>
            )}
          </div>
        </div>

        {/* Children */}
        {children.length > 0 && (
          <div className="ml-4 border-l border-violet-200 dark:border-violet-800 pl-2">
            {children.map((child, i) => (
              <div key={child.id}>
                {renderNode(child, depth + 1, i === children.length - 1, false)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="py-4 px-2">
      {roots.map((root) => renderNode(root, 0, true, true))}
    </div>
  );
}

function ProcessusRenderer({ nodes, connections }: { nodes: DiagramNode[]; connections: DiagramConnection[] }) {
  const sorted = [...nodes].sort((a, b) => (a.step || 0) - (b.step || 0));

  return (
    <div className="flex flex-col items-center py-8 gap-2">
      {sorted.map((node, idx) => {
        const conn = connections.find((c) => c.from === node.id || c.to === node.id);
        return (
          <div key={node.id} className="flex flex-col items-center gap-2">
            {/* Step number + box */}
            <div className="relative">
              <div className="absolute -top-3 -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white text-[11px] font-bold shadow-sm z-10">
                {idx + 1}
              </div>
              <div
                className={cn(
                  "rounded-lg border-2 border-rose-300 dark:border-rose-700 bg-white dark:bg-zinc-900 px-6 py-3 shadow-sm min-w-[200px] text-center"
                )}
              >
                <p className="text-sm font-medium text-rose-900 dark:text-rose-100">
                  {node.label}
                </p>
                {node.description && (
                  <p className="text-xs text-muted-foreground mt-1">{node.description}</p>
                )}
              </div>
            </div>

            {/* Arrow + connection label */}
            {idx < sorted.length - 1 && (
              <div className="flex flex-col items-center gap-1 py-1">
                <ArrowDown className="h-5 w-5 text-rose-400 dark:text-rose-600" />
                {conn && conn.label && (
                  <span className="text-[10px] text-muted-foreground italic max-w-[160px] text-center">
                    {conn.label}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════
// Export helpers
// ═══════════════════════════════════════════════

function exportDiagramAsMarkdown(diagram: DiagramState): string {
  let md = `# ${diagram.title || "Diagramme"}\n\n`;

  switch (diagram.type) {
    case "organigramme": {
      md += "## Organigramme\n\n";
      const roots = diagram.nodes.filter((n) => !n.parentId);
      function nodeToMd(node: DiagramNode, indent: number) {
        const prefix = "  ".repeat(indent);
        md += `${prefix}- ${node.label}`;
        if (node.description) md += ` — _${node.description}_`;
        md += "\n";
        getChildren(diagram.nodes, node.id).forEach((c) => nodeToMd(c, indent + 1));
      }
      roots.forEach((r) => nodeToMd(r, 0));
      break;
    }
    case "chronologie": {
      md += "## Chronologie\n\n";
      [...diagram.nodes]
        .sort((a, b) => (a.date || "").localeCompare(b.date || ""))
        .forEach((n, i) => {
          md += `${i + 1}. **${n.date || "?"}** — ${n.label}`;
          if (n.description) md += ` : ${n.description}`;
          md += "\n";
        });
      break;
    }
    case "comparatif": {
      md += "## Tableau comparatif\n\n";
      md += `| ${diagram.columns.map((c) => c.header).join(" | ")} |\n`;
      md += `| ${diagram.columns.map(() => "---").join(" | ")} |\n`;
      diagram.rows.forEach((r) => {
        md += `| ${r.criterion} | ${diagram.columns.filter((c) => c.id !== "c1").map((c) => r.cells[c.id] || "—").join(" | ")} |\n`;
      });
      break;
    }
    case "concept": {
      md += "## Carte conceptuelle\n\n";
      const roots = diagram.nodes.filter((n) => !n.parentId);
      function conceptToMd(node: DiagramNode, indent: number) {
        const prefix = "  ".repeat(indent);
        md += `${prefix}- ${node.label}`;
        if (node.description) md += ` (${node.description})`;
        md += "\n";
        getChildren(diagram.nodes, node.id).forEach((c) => conceptToMd(c, indent + 1));
      }
      roots.forEach((r) => conceptToMd(r, 0));
      break;
    }
    case "processus": {
      md += "## Processus\n\n";
      [...diagram.nodes]
        .sort((a, b) => (a.step || 0) - (b.step || 0))
        .forEach((n, i) => {
          md += `${i + 1}. ${n.label}`;
          if (n.description) md += ` — _${n.description}_`;
          md += "\n";
          const conn = diagram.connections.find((c) => c.from === n.id);
          if (conn?.label) md += `   ↳ *${conn.label}*\n`;
        });
      break;
    }
  }

  return md;
}

// ═══════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════

export function DiagrammesPage() {
  const { withAiConfig } = useAiConfig();
  const [activeTab, setActiveTab] = useState<string>("builder");
  const [diagram, setDiagram] = useState<DiagramState>(
    createEmptyDiagram("organigramme")
  );
  const [copied, setCopied] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<DiagramNode | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDate, setEditDate] = useState("");

  // ---- Node operations ----

  const addNode = useCallback(
    (parentId?: string) => {
      const newNode: DiagramNode = {
        id: uid(),
        label: "Nouveau nœud",
        parentId,
        ...(diagram.type === "chronologie" ? { date: "" } : {}),
        ...(diagram.type === "processus"
          ? { step: diagram.nodes.length + 1 }
          : {}),
      };
      setDiagram((prev) => ({ ...prev, nodes: [...prev.nodes, newNode] }));
    },
    [diagram.type, diagram.nodes.length]
  );

  const removeNode = useCallback(
    (id: string) => {
      setDiagram((prev) => ({
        ...prev,
        nodes: prev.nodes.filter((n) => n.id !== id && n.parentId !== id),
        connections: prev.connections.filter(
          (c) => c.from !== id && c.to !== id
        ),
      }));
      if (selectedNodeId === id) setSelectedNodeId(null);
    },
    [selectedNodeId]
  );

  const updateNode = useCallback(
    (id: string, updates: Partial<DiagramNode>) => {
      setDiagram((prev) => ({
        ...prev,
        nodes: prev.nodes.map((n) =>
          n.id === id ? { ...n, ...updates } : n
        ),
      }));
    },
    []
  );

  // ---- Comparatif operations ----

  const addColumn = useCallback(() => {
    const id = uid();
    setDiagram((prev) => ({
      ...prev,
      columns: [...prev.columns, { id, header: `Option ${prev.columns.length}` }],
      rows: prev.rows.map((r) => ({ ...r, cells: { ...r.cells, [id]: "" } })),
    }));
  }, []);

  const removeColumn = useCallback((colId: string) => {
    if (colId === "c1") return; // don't remove criterion column
    setDiagram((prev) => ({
      ...prev,
      columns: prev.columns.filter((c) => c.id !== colId),
      rows: prev.rows.map((r) => {
        const cells = { ...r.cells };
        delete cells[colId];
        return { ...r, cells };
      }),
    }));
  }, []);

  const updateColumn = useCallback((colId: string, header: string) => {
    setDiagram((prev) => ({
      ...prev,
      columns: prev.columns.map((c) =>
        c.id === colId ? { ...c, header } : c
      ),
    }));
  }, []);

  const addRow = useCallback(() => {
    setDiagram((prev) => ({
      ...prev,
      rows: [
        ...prev.rows,
        {
          id: uid(),
          criterion: "",
          cells: Object.fromEntries(
            prev.columns.filter((c) => c.id !== "c1").map((c) => [c.id, ""])
          ),
        },
      ],
    }));
  }, []);

  const removeRow = useCallback((rowId: string) => {
    setDiagram((prev) => ({
      ...prev,
      rows: prev.rows.filter((r) => r.id !== rowId),
    }));
  }, []);

  const updateRowCriterion = useCallback(
    (rowId: string, criterion: string) => {
      setDiagram((prev) => ({
        ...prev,
        rows: prev.rows.map((r) =>
          r.id === rowId ? { ...r, criterion } : r
        ),
      }));
    },
    []
  );

  const updateCell = useCallback(
    (rowId: string, colId: string, value: string) => {
      setDiagram((prev) => ({
        ...prev,
        rows: prev.rows.map((r) =>
          r.id === rowId ? { ...r, cells: { ...r.cells, [colId]: value } } : r
        ),
      }));
    },
    []
  );

  // ---- Connection operations ----

  // ---- Template loading ----

  const loadTemplate = useCallback((template: DiagramTemplate) => {
    setDiagram({
      type: template.type,
      title: template.name,
      nodes: [...template.nodes],
      connections: [...template.connections],
      columns: [...(template.columns || [])],
      rows: (template.rows || []).map((r) => ({
        ...r,
        cells: { ...r.cells },
      })),
    });
    toast.success(`Modèle « ${template.name} » chargé`);
  }, []);

  // ---- Diagram type change ----

  const changeType = useCallback((type: DiagramType) => {
    setDiagram(createEmptyDiagram(type));
    setSelectedNodeId(null);
  }, []);

  // ---- AI generation ----

  const handleAiGenerate = useCallback(async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);

    try {
      const systemPrompt = `Tu es un assistant spécialisé en création de diagrammes académiques pour des thèses de doctorat.
L'utilisateur décrit un diagramme et tu dois générer sa structure en JSON.
Réponds UNIQUEMENT avec un JSON valide (pas de markdown, pas de commentaires).
Le JSON doit avoir la forme :
{
  "nodes": [{"id": "n1", "label": "...", "description": "...", "parentId": null, "date": "...", "step": 1}],
  "connections": [{"from": "n1", "to": "n2", "label": "..."}],
  "columns": [{"id": "c1", "header": "Critère"}, {"id": "c2", "header": "Option A"}],
  "rows": [{"id": "r1", "criterion": "...", "cells": {"c2": "..."}}]
}
Pour un organigramme : utilise parentId pour la hiérarchie.
Pour une chronologie : utilise le champ date.
Pour un processus : utilise le champ step et les connections.
Pour un tableau comparatif : utilise columns et rows.
Pour une carte conceptuelle : utilise parentId.`;

      const res = await fetch("/api/ai-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(withAiConfig({
          mode: "freeform",
          prompt: aiPrompt,
          context: systemPrompt,
        })),
      });

      if (!res.ok) {
        throw new Error("Erreur lors de la génération");
      }

      const data = await res.json();
      const content: string = data?.data?.content || "";

      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("La réponse IA ne contient pas de JSON valide");
      }

      const parsed = JSON.parse(jsonMatch[0]);

      setDiagram((prev) => ({
        ...prev,
        title: prev.title || aiPrompt.slice(0, 60),
        nodes: (parsed.nodes || []).map((n: Record<string, unknown>) => ({
          id: (n.id as string) || uid(),
          label: (n.label as string) || "Nœud",
          description: (n.description as string) || undefined,
          parentId: (n.parentId as string) || undefined,
          date: (n.date as string) || undefined,
          step: (n.step as number) || undefined,
        })),
        connections: (parsed.connections || []).map(
          (c: Record<string, unknown>) => ({
            from: c.from as string,
            to: c.to as string,
            label: (c.label as string) || undefined,
          })
        ),
        columns: (parsed.columns || prev.columns).map(
          (c: Record<string, unknown>) => ({
            id: (c.id as string) || uid(),
            header: (c.header as string) || "Colonne",
          })
        ),
        rows: (parsed.rows || prev.rows).map(
          (r: Record<string, unknown>) => ({
            id: (r.id as string) || uid(),
            criterion: (r.criterion as string) || "",
            cells: (r.cells as Record<string, string>) || {},
          })
        ),
      }));

      setAiDialogOpen(false);
      setAiPrompt("");
      toast.success("Diagramme généré avec succès");
    } catch (err) {
      console.error("[Diagrammes] AI error:", err);
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de la génération IA"
      );
    } finally {
      setAiLoading(false);
    }
  }, [aiPrompt, withAiConfig]);

  // ---- Export ----

  const handleCopy = useCallback(() => {
    const md = exportDiagramAsMarkdown(diagram);
    navigator.clipboard.writeText(md);
    setCopied(true);
    toast.success("Diagramme copié dans le presse-papiers");
    setTimeout(() => setCopied(false), 2000);
  }, [diagram]);

  const handleExportPng = useCallback(async () => {
    const el = document.getElementById("diagram-render-area");
    if (!el) {
      toast.error("Aucun diagramme à exporter");
      return;
    }
    try {
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff' });
      const link = document.createElement("a");
      link.download = `diagramme-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Diagramme exporté en PNG");
    } catch {
      toast.error("Erreur lors de l'export PNG");
    }
  }, []);

  // ---- Edit node dialog ----

  const openEditDialog = useCallback((node: DiagramNode) => {
    setEditingNode(node);
    setEditLabel(node.label);
    setEditDesc(node.description || "");
    setEditDate(node.date || "");
  }, []);

  const saveEditNode = useCallback(() => {
    if (!editingNode) return;
    updateNode(editingNode.id, {
      label: editLabel,
      description: editDesc || undefined,
      date: editDate || undefined,
    });
    setEditingNode(null);
  }, [editingNode, editLabel, editDesc, editDate, updateNode]);

  // ---- Connection editor ----

  const [connectionDialogOpen, setConnectionDialogOpen] = useState(false);
  const [connFrom, setConnFrom] = useState("");
  const [connTo, setConnTo] = useState("");
  const [connLabel, setConnLabel] = useState("");

  const addConnection = useCallback(() => {
    if (!connFrom || !connTo || connFrom === connTo) return;
    setDiagram((prev) => ({
      ...prev,
      connections: [
        ...prev.connections,
        { from: connFrom, to: connTo, label: connLabel || undefined },
      ],
    }));
    setConnFrom("");
    setConnTo("");
    setConnLabel("");
    setConnectionDialogOpen(false);
  }, [connFrom, connTo, connLabel]);

  const currentTypeConfig = DIAGRAM_TYPES.find((t) => t.value === diagram.type);

  // ═══════════════════════════════════════════════
  // JSX
  // ═══════════════════════════════════════════════

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
            <GitFork className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Diagrammes</h1>
            <p className="text-sm text-muted-foreground">
              Créez des diagrammes visuels pour votre thèse
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* AI generate */}
          <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span className="hidden sm:inline">Générer par IA</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un diagramme par IA</DialogTitle>
                <DialogDescription>
                  Décrivez le diagramme que vous souhaitez créer. L'IA générera
                  automatiquement la structure.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-2">
                <div className="flex flex-col gap-2">
                  <Label>Type de diagramme actuel</Label>
                  <Badge variant="secondary" className="w-fit">
                    {currentTypeConfig?.icon} {currentTypeConfig?.label}
                  </Badge>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="ai-prompt">Description du diagramme</Label>
                  <Textarea
                    id="ai-prompt"
                    placeholder="Ex : Organigramme de la structure d'un mémoire de master en sciences de l'éducation avec les parties théoriques et pratiques..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setAiDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleAiGenerate}
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="gap-2 bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {aiLoading ? (
                    <>
                      <Skeleton className="h-4 w-4 rounded-full" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Générer
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Export */}
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExportPng}>
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Télécharger PNG</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleCopy}>
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">{copied ? "Copié !" : "Exporter"}</span>
          </Button>
        </div>
      </div>

      {/* Tabs: Builder | Templates */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="builder" className="gap-1.5">
            <Edit3 className="h-3.5 w-3.5" />
            Constructeur
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-1.5">
            <LayoutTemplate className="h-3.5 w-3.5" />
            Modèles
          </TabsTrigger>
        </TabsList>

        {/* ═══ BUILDER TAB ═══ */}
        <TabsContent value="builder">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Controls */}
            <div className="flex flex-col gap-4 lg:col-span-1">
              {/* Type selector */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Type de diagramme</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <Select
                    value={diagram.type}
                    onValueChange={(v) => changeType(v as DiagramType)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIAGRAM_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          <div className="flex items-center gap-2">
                            {t.icon}
                            <span>{t.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-2">
                    {currentTypeConfig?.description}
                  </p>
                </CardContent>
              </Card>

              {/* Title */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Titre du diagramme</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <Input
                    placeholder="Entrez un titre..."
                    value={diagram.title}
                    onChange={(e) =>
                      setDiagram((prev) => ({ ...prev, title: e.target.value }))
                    }
                  />
                </CardContent>
              </Card>

              {/* Node management */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">
                      {diagram.type === "comparatif" ? "Critères" : "Nœuds"}
                    </CardTitle>
                    <Badge variant="secondary" className="text-[10px]">
                      {diagram.type === "comparatif"
                        ? `${diagram.rows.length} critères`
                        : `${diagram.nodes.length} nœuds`}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ScrollArea className="max-h-72">
                    <div className="flex flex-col gap-2">
                      {diagram.type === "comparatif" ? (
                        <>
                          {diagram.rows.map((row) => (
                            <div
                              key={row.id}
                              className="flex items-center gap-2 rounded-md border px-2 py-1.5 text-sm"
                            >
                              <GripVertical className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <Input
                                className="h-7 text-xs"
                                value={row.criterion}
                                placeholder="Critère..."
                                onChange={(e) =>
                                  updateRowCriterion(row.id, e.target.value)
                                }
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500"
                                onClick={() => removeRow(row.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full gap-1.5 mt-1"
                            onClick={addRow}
                          >
                            <Plus className="h-3 w-3" />
                            Ajouter un critère
                          </Button>
                        </>
                      ) : (
                        <>
                          {diagram.nodes.map((node) => (
                            <div
                              key={node.id}
                              className={cn(
                                "flex items-center gap-2 rounded-md border px-2 py-1.5 text-sm cursor-pointer transition-colors",
                                selectedNodeId === node.id
                                  ? "border-amber-400 dark:border-amber-600 bg-amber-50 dark:bg-amber-950/20"
                                  : "hover:bg-muted/50"
                              )}
                              onClick={() => setSelectedNodeId(node.id)}
                            >
                              <GripVertical className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs truncate font-medium">
                                  {node.label}
                                </p>
                                {node.parentId && (
                                  <p className="text-[10px] text-muted-foreground">
                                    → parent:{" "}
                                    {diagram.nodes.find((n) => n.id === node.parentId)
                                      ?.label || "?"}
                                  </p>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 shrink-0 text-muted-foreground hover:text-amber-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditDialog(node);
                                }}
                              >
                                <Edit3 className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 shrink-0 text-muted-foreground hover:text-red-500"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeNode(node.id);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full gap-1.5 mt-1"
                            onClick={() => addNode(selectedNodeId || undefined)}
                          >
                            <Plus className="h-3 w-3" />
                            Ajouter un nœud
                            {selectedNodeId && " (enfant)"}
                          </Button>
                        </>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Comparatif: Column management */}
              {diagram.type === "comparatif" && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">Colonnes</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-col gap-2">
                      {diagram.columns.map((col) => (
                        <div
                          key={col.id}
                          className="flex items-center gap-2 rounded-md border px-2 py-1.5 text-sm"
                        >
                          <Input
                            className="h-7 text-xs"
                            value={col.header}
                            onChange={(e) => updateColumn(col.id, e.target.value)}
                          />
                          {col.id !== "c1" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500"
                              onClick={() => removeColumn(col.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-1.5 mt-1"
                        onClick={addColumn}
                      >
                        <Plus className="h-3 w-3" />
                        Ajouter une colonne
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Processus: Connection management */}
              {diagram.type === "processus" && (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold">Connexions</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 gap-1 text-[11px]"
                        onClick={() => setConnectionDialogOpen(true)}
                      >
                        <Plus className="h-2.5 w-2.5" />
                        Ajouter
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-col gap-2">
                      {diagram.connections.length === 0 && (
                        <p className="text-xs text-muted-foreground italic">
                          Aucune connexion définie
                        </p>
                      )}
                      {diagram.connections.map((conn, i) => {
                        const fromNode = diagram.nodes.find((n) => n.id === conn.from);
                        const toNode = diagram.nodes.find((n) => n.id === conn.to);
                        return (
                          <div
                            key={i}
                            className="flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs"
                          >
                            <span className="font-medium truncate">
                              {fromNode?.label || "?"}
                            </span>
                            <ArrowRight className="h-3 w-3 text-rose-400 shrink-0" />
                            <span className="font-medium truncate">
                              {toNode?.label || "?"}
                            </span>
                            {conn.label && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] ml-auto shrink-0"
                              >
                                {conn.label}
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right: Diagram preview */}
            <div className="lg:col-span-2">
              <Card className="min-h-[400px]">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {diagram.title || "Diagramme sans titre"}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {currentTypeConfig?.icon} {currentTypeConfig?.label}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {diagram.title && (
                        <Badge variant="outline" className="text-[10px]">
                          {diagram.type}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4">
                  <div id="diagram-render-area">
                    {diagram.type === "organigramme" && (
                      <OrganigrammeRenderer nodes={diagram.nodes} />
                    )}
                    {diagram.type === "chronologie" && (
                      <ChronologieRenderer nodes={diagram.nodes} />
                    )}
                    {diagram.type === "comparatif" && (
                      <div className="space-y-4">
                        <ComparatifRenderer
                          columns={diagram.columns}
                          rows={diagram.rows}
                        />
                        {/* Editable cells below */}
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-[11px] text-muted-foreground font-normal">
                                  Critère
                                </TableHead>
                                {diagram.columns
                                  .filter((c) => c.id !== "c1")
                                  .map((col) => (
                                    <TableHead
                                      key={col.id}
                                      className="text-[11px] text-muted-foreground font-normal"
                                    >
                                      {col.header}
                                    </TableHead>
                                  ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {diagram.rows.map((row) => (
                                <TableRow key={row.id}>
                                  <TableCell className="font-medium text-sm">
                                    {row.criterion}
                                  </TableCell>
                                  {diagram.columns
                                    .filter((c) => c.id !== "c1")
                                    .map((col) => (
                                      <TableCell key={col.id}>
                                        <Input
                                          className="h-8 text-xs"
                                          placeholder="..."
                                          value={row.cells[col.id] || ""}
                                          onChange={(e) =>
                                            updateCell(
                                              row.id,
                                              col.id,
                                              e.target.value
                                            )
                                          }
                                        />
                                      </TableCell>
                                    ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                    {diagram.type === "concept" && (
                      <ConceptMapRenderer nodes={diagram.nodes} />
                    )}
                    {diagram.type === "processus" && (
                      <ProcessusRenderer
                        nodes={diagram.nodes}
                        connections={diagram.connections}
                      />
                    )}

                    {/* Empty state */}
                    {(diagram.type !== "comparatif" && diagram.nodes.length === 0) && (
                      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                        <GitFork className="h-12 w-12 mb-4 opacity-20" />
                        <p className="text-sm">Ajoutez des nœuds pour commencer</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ═══ TEMPLATES TAB ═══ */}
        <TabsContent value="templates">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEMPLATES.map((tpl) => {
              const typeConfig = DIAGRAM_TYPES.find((t) => t.value === tpl.type);
              return (
                <Card
                  key={tpl.id}
                  className="cursor-pointer hover:shadow-md transition-shadow group"
                  onClick={() => {
                    loadTemplate(tpl);
                    setActiveTab("builder");
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 shrink-0">
                        {typeConfig?.icon}
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        {typeConfig?.label}
                      </Badge>
                    </div>
                    <CardTitle className="text-sm font-semibold group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                      {tpl.name}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {tpl.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {tpl.type === "comparatif" ? (
                        <span>{tpl.columns?.length || 0} colonnes</span>
                      ) : (
                        <span>{tpl.nodes.length} nœuds</span>
                      )}
                      {tpl.connections.length > 0 && (
                        <span>{tpl.connections.length} connexions</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Empty templates hint */}
          <Card className="mt-6">
            <CardContent className="flex items-center gap-3 py-4">
              <Sparkles className="h-5 w-5 text-amber-500 shrink-0" />
              <div>
                <p className="text-sm font-medium">Besoin d'un diagramme personnalisé ?</p>
                <p className="text-xs text-muted-foreground">
                  Utilisez la fonction &quot;Générer par IA&quot; pour créer un diagramme à
                  partir d'une description en langage naturel.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ═══════════════════════════════════════ */}
      {/* Edit Node Dialog */}
      {/* ═══════════════════════════════════════ */}
      <Dialog
        open={editingNode !== null}
        onOpenChange={(open) => {
          if (!open) setEditingNode(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le nœud</DialogTitle>
            <DialogDescription>
              Modifiez le libellé et la description de ce nœud.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label>Libellé</Label>
              <Input
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                placeholder="Nom du nœud..."
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Description (optionnel)</Label>
              <Input
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Description courte..."
              />
            </div>
            {diagram.type === "chronologie" && (
              <div className="flex flex-col gap-2">
                <Label>Date / Période</Label>
                <Input
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  placeholder="Ex : Année 1 — Semestre 1"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingNode(null)}>
              Annuler
            </Button>
            <Button onClick={saveEditNode} className="bg-amber-600 hover:bg-amber-700 text-white">
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════ */}
      {/* Connection Dialog (Processus) */}
      {/* ═══════════════════════════════════════ */}
      <Dialog
        open={connectionDialogOpen}
        onOpenChange={setConnectionDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une connexion</DialogTitle>
            <DialogDescription>
              Reliez deux étapes du processus avec une étiquette optionnelle.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label>Étape source</Label>
              <Select value={connFrom} onValueChange={setConnFrom}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  {diagram.nodes.map((n) => (
                    <SelectItem key={n.id} value={n.id}>
                      {n.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Étape destination</Label>
              <Select value={connTo} onValueChange={setConnTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  {diagram.nodes.map((n) => (
                    <SelectItem key={n.id} value={n.id}>
                      {n.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Étiquette (optionnel)</Label>
              <Input
                value={connLabel}
                onChange={(e) => setConnLabel(e.target.value)}
                placeholder="Ex : valide puis..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConnectionDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={addConnection}
              disabled={!connFrom || !connTo || connFrom === connTo}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              <ArrowRight className="h-4 w-4 mr-1.5" />
              Relier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
