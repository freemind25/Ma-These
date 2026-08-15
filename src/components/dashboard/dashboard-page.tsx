"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/lib/stores/app-store";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  BookOpen,
  Sparkles,
  ArrowRight,
  Plus,
  Target,
  TrendingUp,
  CheckCircle2,
  Circle,
  FlaskConical,
  Newspaper,
  ListTree,
  Wrench,
  Globe,
  Brain,
  Unlock,
  GitBranch,
  Compass,
  SpellCheck,
  Scale,
} from "lucide-react";

// ═══ Stats types ═══
interface DashboardStats {
  totalTheses: number;
  totalChapters: number;
  totalWords: number;
  totalReferences: number;
  totalSources: number;
  completedChapters: number;
  activeSprints: number;
  progressPercent: number;
}

function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error("Erreur de chargement");
      const json = await res.json();
      return json.data as DashboardStats;
    },
    staleTime: 15 * 1000,
  });
}

// ═══ Module icons map ═══
const MODULE_ICONS: Record<string, React.ElementType> = {
  "Éditeur de thèse": FileText,
  "Assistant IA": Sparkles,
  "Méthodologie": FlaskConical,
  "Articles scientifiques": Newspaper,
  "Références": BookOpen,
  "Plan de thèse": ListTree,
  "Outils IA": Wrench,
  "Bases de données": Globe,
  "Déblocage écriture": Unlock,
  "Outils SLR": GitBranch,
  "Analyse du champ": Compass,
  "Grammaire": SpellCheck,
  "Équilibre chapitres": Scale,
};

export function DashboardPage() {
  const { setCurrentView } = useAppStore();
  const { data: stats, isLoading } = useDashboardStats();

  // Determine completed steps
  const stepsCompleted = [
    stats && stats.totalTheses > 0,
    stats && stats.totalChapters > 0,
    stats && stats.totalWords > 0,
    stats && stats.totalReferences > 0,
    stats && stats.completedChapters > 0,
  ];
  const completedCount = stepsCompleted.filter(Boolean).length;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto w-full">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Bienvenue sur ThesisFrame
        </h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Votre assistant intelligent pour la rédaction de thèses de doctorat.
          Structurez votre travail, rédigez avec l&apos;IA et gérez vos références bibliographiques.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          label="Chapitres"
          value={isLoading ? "—" : String(stats?.totalChapters ?? 0)}
          description={
            stats && stats.totalChapters > 0
              ? `${stats.completedChapters} terminés`
              : "Aucune thèse chargée"
          }
          accent="blue"
          isLoading={isLoading}
        />
        <StatCard
          icon={BookOpen}
          label="Références"
          value={isLoading ? "—" : String(stats?.totalReferences ?? 0)}
          description={
            stats && stats.totalReferences > 0
              ? "Bibliothèque active"
              : "Bibliothèque vide"
          }
          accent="emerald"
          isLoading={isLoading}
        />
        <StatCard
          icon={Sparkles}
          label="Mots rédigés"
          value={isLoading ? "—" : (stats?.totalWords ?? 0).toLocaleString("fr-FR")}
          description={
            stats && stats.totalWords > 0
              ? "Assistant IA prêt"
              : "Assistant IA prêt"
          }
          accent="amber"
          isLoading={isLoading}
        />
        <StatCard
          icon={TrendingUp}
          label="Progression"
          value={isLoading ? "—" : `${stats?.progressPercent ?? 0}%`}
          description={
            stats && stats.progressPercent > 0
              ? `${stats.completedChapters}/${stats.totalChapters} chapitres`
              : "Commencez votre thèse"
          }
          accent="teal"
          isLoading={isLoading}
        />
      </div>

      {/* Main Actions & Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Actions rapides
            </CardTitle>
            <CardDescription>
              Commencez par créer une thèse ou explorez les outils disponibles
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ActionButton
              icon={Plus}
              label="Créer une thèse"
              description="Nouveau projet de thèse"
              onClick={() => setCurrentView("editor")}
              primary
            />
            <ActionButton
              icon={Sparkles}
              label="Assistant IA"
              description="10 modes d'écriture"
              onClick={() => setCurrentView("ai-writing")}
            />
            <ActionButton
              icon={BookOpen}
              label="Références"
              description="Gérer la bibliographie"
              onClick={() => setCurrentView("references")}
            />
            <ActionButton
              icon={Brain}
              label="Carnet de recherche"
              description="Sources et notes"
              onClick={() => setCurrentView("ai-tools")}
            />
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Démarrage rapide
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <StepItem
              number={1}
              label="Cadrage de la thèse"
              done={!!stepsCompleted[0]}
              onClick={() => setCurrentView("editor")}
            />
            <StepItem
              number={2}
              label="Structurer le plan"
              done={!!stepsCompleted[1]}
              onClick={() => setCurrentView("thesis-plan")}
            />
            <StepItem
              number={3}
              label="Rédiger les chapitres"
              done={!!stepsCompleted[2]}
              onClick={() => setCurrentView("editor")}
            />
            <StepItem
              number={4}
              label="Gérer les références"
              done={!!stepsCompleted[3]}
              onClick={() => setCurrentView("references")}
            />
            <StepItem
              number={5}
              label="Réviser avec l'IA"
              done={!!stepsCompleted[4]}
              onClick={() => setCurrentView("ai-writing")}
            />
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span>Progression</span>
                <span>{completedCount} / 5 étapes</span>
              </div>
              <Progress value={(completedCount / 5) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Modules disponibles
          </CardTitle>
          <CardDescription>
            Explorez les fonctionnalités de ThesisFrame
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <ModuleCard
              title="Éditeur de thèse"
              description="Éditeur riche avec structuration par chapitres et sauvegarde automatique"
              status="Prêt"
              onClick={() => setCurrentView("editor")}
            />
            <ModuleCard
              title="Assistant IA"
              description="10 modes spécialisés : rédaction, revue de littérature, peer review..."
              status="IA"
              onClick={() => setCurrentView("ai-writing")}
            />
            <ModuleCard
              title="Méthodologie"
              description="Paradigmes, démarche, outils de collecte et checklist méthodologique"
              status="Prêt"
              onClick={() => setCurrentView("methodology")}
            />
            <ModuleCard
              title="Articles scientifiques"
              description="Guide IMRaD, checklist de soumission, boîte à outils rédaction"
              status="Prêt"
              onClick={() => setCurrentView("articles")}
            />
            <ModuleCard
              title="Références"
              description="CRUD bibliographique, export BibTeX, recherche et filtrage"
              status="Prêt"
              onClick={() => setCurrentView("references")}
            />
            <ModuleCard
              title="Plan de thèse"
              description="Visualisation du plan, générateur de template LaTeX personnalisé"
              status="Prêt"
              onClick={() => setCurrentView("thesis-plan")}
            />
            <ModuleCard
              title="Outils IA"
              description="Carnet de recherche, consensus multi-sources, visualisation"
              status="IA"
              onClick={() => setCurrentView("ai-tools")}
            />
            <ModuleCard
              title="Bases de données"
              description="27 ressources académiques : HAL, Google Scholar, Persée, CAIRN..."
              status="Prêt"
              onClick={() => setCurrentView("academic-db")}
            />
            <ModuleCard
              title="Déblocage écriture"
              description="Diagnostic, exercices, Pomodoro et suivi d'écriture quotidienne"
              status="Prêt"
              onClick={() => setCurrentView("deblocage-ecriture")}
            />
            <ModuleCard
              title="Outils SLR"
              description="Revue systématique : diagramme PRISMA, criblage, extraction de données"
              status="Prêt"
              onClick={() => setCurrentView("outils-slr")}
            />
            <ModuleCard
              title="Analyse du champ"
              description="Cartographie IA du champ de recherche, lacunes et positionnement"
              status="IA"
              onClick={() => setCurrentView("analyse-champ-recherche")}
            />
            <ModuleCard
              title="Grammaire"
              description="Correcteur grammatical IA : orthographe, grammaire, style, ponctuation"
              status="IA"
              onClick={() => setCurrentView("grammaire")}
            />
            <ModuleCard
              title="Équilibre chapitres"
              description="Analysez la répartition, fixez des objectifs et recommandations IA"
              status="IA"
              onClick={() => setCurrentView("equilibre-chapitres")}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══ Sub-components ═══

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  accent,
  isLoading,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  description: string;
  accent: string;
  isLoading?: boolean;
}) {
  const accentClasses: Record<string, string> = {
    blue: "bg-chart-1/10 text-chart-1",
    emerald: "bg-chart-2/10 text-chart-2",
    amber: "bg-chart-4/10 text-chart-4",
    teal: "bg-chart-5/10 text-chart-5",
  };

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {label}
            </span>
            {isLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <span className="text-2xl font-bold tabular-nums">{value}</span>
            )}
            <span className="text-xs text-muted-foreground">{description}</span>
          </div>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${accentClasses[accent] ?? "bg-muted"}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActionButton({
  icon: Icon,
  label,
  description,
  onClick,
  primary,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <Button
      variant={primary ? "default" : "outline"}
      className="h-auto w-full justify-start gap-3 p-4"
      onClick={onClick}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          primary
            ? "bg-primary-foreground/20"
            : "bg-muted"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex flex-col items-start gap-0.5 text-left">
        <span className="text-sm font-medium">{label}</span>
        <span
          className={`text-xs ${primary ? "text-primary-foreground/70" : "text-muted-foreground"}`}
        >
          {description}
        </span>
      </div>
      <ArrowRight className="ml-auto h-4 w-4 opacity-50" />
    </Button>
  );
}

function StepItem({
  number: _number,
  label,
  done,
  onClick,
}: {
  number: number;
  label: string;
  done: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full text-left group hover:bg-muted/50 rounded-md p-1.5 -mx-1.5 transition-colors"
    >
      {done ? (
        <CheckCircle2 className="h-5 w-5 text-chart-2 shrink-0" />
      ) : (
        <Circle className="h-5 w-5 text-muted-foreground/40 shrink-0" />
      )}
      <span
        className={`text-sm ${
          done
            ? "text-muted-foreground line-through"
            : "text-foreground group-hover:text-primary"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

function ModuleCard({
  title,
  description,
  status,
  onClick,
}: {
  title: string;
  description: string;
  status: string;
  onClick: () => void;
}) {
  const Icon = MODULE_ICONS[title] || FileText;

  return (
    <button
      onClick={onClick}
      className="flex flex-col gap-2 rounded-lg border border-border p-4 text-left hover:bg-muted/50 hover:border-primary/20 transition-all group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary/60" />
          <span className="text-sm font-medium group-hover:text-primary transition-colors">
            {title}
          </span>
        </div>
        <Badge
          variant={status === "IA" ? "default" : status === "Prêt" ? "secondary" : "outline"}
          className="shrink-0 text-[10px] h-5"
        >
          {status}
        </Badge>
      </div>
      <span className="text-xs text-muted-foreground leading-relaxed">
        {description}
      </span>
    </button>
  );
}
