"use client";

import React, { Suspense } from "react";
import { useAppStore } from "@/lib/stores/app-store";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Direct imports for core modules (fast load)
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { EditorPage } from "@/modules/editor/editor-page";

// Lazy loading factory for heavier modules
function createLazyPanel(
  loader: () => Promise<{ default: React.ComponentType }>
) {
  return React.lazy(loader);
}

const MethodologyPage = createLazyPanel(() =>
  import("@/modules/methodology/methodology-page").then((m) => ({
    default: m.MethodologyPage,
  }))
);

const ReferencesPage = createLazyPanel(() =>
  import("@/modules/references/references-page").then((m) => ({
    default: m.ReferencesPage,
  }))
);

const AcademicDbPage = createLazyPanel(() =>
  import("@/modules/academic-db/academic-db-page").then((m) => ({
    default: m.AcademicDbPage,
  }))
);

const MendeleyPage = createLazyPanel(() =>
  import("@/modules/mendeley/mendeley-page").then((m) => ({
    default: m.MendeleyPage,
  }))
);

const ArticlesPage = createLazyPanel(() =>
  import("@/modules/articles/articles-page").then((m) => ({
    default: m.ArticlesPage,
  }))
);

const ThesisPlanPage = createLazyPanel(() =>
  import("@/modules/thesis-plan/thesis-plan-page").then((m) => ({
    default: m.ThesisPlanPage,
  }))
);

const CadragePage = createLazyPanel(() =>
  import("@/modules/cadrage/cadrage-page").then((m) => ({
    default: m.CadragePage,
  }))
);

const AiWritingPage = createLazyPanel(() =>
  import("@/modules/ai-writing/ai-writing-page").then((m) => ({
    default: m.AiWritingPage,
  }))
);

const AiToolsPage = createLazyPanel(() =>
  import("@/modules/ai-tools/ai-tools-page").then((m) => ({
    default: m.AiToolsPage,
  }))
);

const IaAssistantsPage = createLazyPanel(() =>
  import("@/modules/ia-assistants/ia-assistants-page").then((m) => ({
    default: m.IaAssistantsPage,
  }))
);

const AiConfigPage = createLazyPanel(() =>
  import("@/modules/ai-config/ai-config-page").then((m) => ({
    default: m.AiConfigPage,
  }))
);

const CloudDrivePage = createLazyPanel(() =>
  import("@/modules/cloud-drive/cloud-drive-page").then((m) => ({
    default: m.CloudDrivePage,
  }))
);

const BoxDrivePage = createLazyPanel(() =>
  import("@/modules/box-drive/box-drive-page").then((m) => ({
    default: m.BoxDrivePage,
  }))
);

// Error boundary for lazy-loaded modules
class PanelErrorBoundary extends React.Component<
  { children: React.ReactNode; name?: string },
  { hasError: boolean; error?: Error }
> {
  state = { hasError: false, error: undefined as Error | undefined };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="max-w-md">
            <CardHeader>
              <p className="text-sm font-medium text-destructive">
                Erreur de chargement{this.props.name ? ` — ${this.props.name}` : ""}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {this.state.error?.message || "Module indisponible"}
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}

function PanelLoader() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    </div>
  );
}

function WrappedPanel({
  children,
  name,
}: {
  children: React.ReactNode;
  name?: string;
}) {
  return (
    <PanelErrorBoundary name={name}>
      <Suspense fallback={<PanelLoader />}>{children}</Suspense>
    </PanelErrorBoundary>
  );
}

function CurrentView() {
  const { currentView } = useAppStore();

  switch (currentView) {
    // Principal — direct imports (fast)
    case "dashboard":
      return <DashboardPage />;
    case "editor":
      return <EditorPage />;

    // Recherche — lazy loaded
    case "methodology":
      return (
        <WrappedPanel name="Méthodologie">
          <MethodologyPage />
        </WrappedPanel>
      );
    case "references":
      return (
        <WrappedPanel name="Références">
          <ReferencesPage />
        </WrappedPanel>
      );
    case "academic-db":
      return (
        <WrappedPanel name="Bases de données">
          <AcademicDbPage />
        </WrappedPanel>
      );
    case "mendeley":
      return (
        <WrappedPanel name="Mendeley">
          <MendeleyPage />
        </WrappedPanel>
      );

    // Rédaction — lazy loaded
    case "articles":
      return (
        <WrappedPanel name="Articles scientifiques">
          <ArticlesPage />
        </WrappedPanel>
      );
    case "thesis-plan":
      return (
        <WrappedPanel name="Plan de thèse">
          <ThesisPlanPage />
        </WrappedPanel>
      );
    case "cadrage":
      return (
        <WrappedPanel name="Cadrage">
          <CadragePage />
        </WrappedPanel>
      );

    // IA & Outils — lazy loaded
    case "ai-writing":
      return (
        <WrappedPanel name="Écriture IA">
          <AiWritingPage />
        </WrappedPanel>
      );
    case "ai-tools":
      return (
        <WrappedPanel name="Outils IA">
          <AiToolsPage />
        </WrappedPanel>
      );
    case "ia-assistants":
      return (
        <WrappedPanel name="Assistants IA">
          <IaAssistantsPage />
        </WrappedPanel>
      );
    case "ai-config":
      return (
        <WrappedPanel name="Configuration IA">
          <AiConfigPage />
        </WrappedPanel>
      );

    // Stockage — lazy loaded
    case "cloud-drive":
      return (
        <WrappedPanel name="Cloud Drive">
          <CloudDrivePage />
        </WrappedPanel>
      );
    case "box-drive":
      return (
        <WrappedPanel name="Box Drive">
          <BoxDrivePage />
        </WrappedPanel>
      );

    default:
      return <DashboardPage />;
  }
}

export default function Home() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <CurrentView />
        </main>
        <AppFooter />
      </SidebarInset>
    </SidebarProvider>
  );
}
