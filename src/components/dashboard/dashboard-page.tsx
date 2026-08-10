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
import { useAppStore } from "@/lib/stores/app-store";
import {
  FileText,
  BookOpen,
  Sparkles,
  ArrowRight,
  Plus,
  Lightbulb,
  Target,
  TrendingUp,
  CheckCircle2,
  Circle,
} from "lucide-react";

export function DashboardPage() {
  const { setCurrentView } = useAppStore();

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
          value="0"
          description="Aucune thèse chargée"
          accent="blue"
        />
        <StatCard
          icon={BookOpen}
          label="Références"
          value="0"
          description="Bibliothèque vide"
          accent="emerald"
        />
        <StatCard
          icon={Sparkles}
          label="Générations IA"
          value="0"
          description="Assistant prêt"
          accent="amber"
        />
        <StatCard
          icon={TrendingUp}
          label="Progression"
          value="0%"
          description="Commencez votre thèse"
          accent="teal"
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
              icon={Lightbulb}
              label="Méthodologie"
              description="Guides de recherche"
              onClick={() => setCurrentView("methodology")}
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
              done={false}
              onClick={() => setCurrentView("editor")}
            />
            <StepItem
              number={2}
              label="Structurer le plan"
              done={false}
              onClick={() => setCurrentView("thesis-plan")}
            />
            <StepItem
              number={3}
              label="Rédiger les chapitres"
              done={false}
              onClick={() => setCurrentView("editor")}
            />
            <StepItem
              number={4}
              label="Gérer les références"
              done={false}
              onClick={() => setCurrentView("references")}
            />
            <StepItem
              number={5}
              label="Réviser avec l'IA"
              done={false}
              onClick={() => setCurrentView("ai-writing")}
            />
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span>Progression</span>
                <span>0 / 5 étapes</span>
              </div>
              <Progress value={0} className="h-2" />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
              description="7 guides : approche, problématique, variables, collecte de données..."
              status="Prêt"
              onClick={() => setCurrentView("methodology")}
            />
            <ModuleCard
              title="Articles scientifiques"
              description="Guide IMRaD, checklist de soumission, boîte à outils..."
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
              description="Générateur de template LaTeX personnalisé"
              status="Prêt"
              onClick={() => setCurrentView("thesis-plan")}
            />
            <ModuleCard
              title="Outils IA"
              description="Humanizer, consensus multi-sources, notebook, visualisation"
              status="IA"
              onClick={() => setCurrentView("ai-tools")}
            />
            <ModuleCard
              title="Bases de données"
              description="7 ressources académiques : HAL, Elsevier, Anna's Archive..."
              status="Prêt"
              onClick={() => setCurrentView("academic-db")}
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
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  description: string;
  accent: string;
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
            <span className="text-2xl font-bold tabular-nums">{value}</span>
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
      className={`h-auto w-full justify-start gap-3 p-4 ${primary ? "" : ""}`}
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
  return (
    <button
      onClick={onClick}
      className="flex flex-col gap-2 rounded-lg border border-border p-4 text-left hover:bg-muted/50 hover:border-primary/20 transition-all group"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium group-hover:text-primary transition-colors">
          {title}
        </span>
        <Badge
          variant={status === "IA" ? "default" : "secondary"}
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
