"use client";

import { lazy, Suspense, Component, type ReactNode, type ErrorInfo } from "react";
import { useAppStore } from "@/lib/stores/app-store";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { ModulePlaceholder } from "@/components/layout/module-placeholder";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

// ── Existing module pages (already fully implemented) ──
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { EditorPage } from "@/modules/editor/editor-page";
import { AiWritingPage } from "@/modules/ai-writing/ai-writing-page";
import { MethodologyPage } from "@/modules/methodology/methodology-page";
import { ArticlesPage } from "@/modules/articles/articles-page";
import { ReferencesPage } from "@/modules/references/references-page";
import { ThesisPlanPage } from "@/modules/thesis-plan/thesis-plan-page";
import { AiToolsPage } from "@/modules/ai-tools/ai-tools-page";
import { AcademicDbPage } from "@/modules/academic-db/academic-db-page";

// ── Error boundary for lazy-loaded panels ──
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class PanelErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[PanelErrorBoundary]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium">Module en cours de chargement</p>
              <p className="text-sm mt-1 text-muted-foreground">
                Ce module a été restauré du dépôt original et est en cours d&apos;intégration.
                Veuillez réessayer ou consultez un autre module.
              </p>
              {this.state.error && (
                <p className="text-xs mt-2 font-mono opacity-50">{this.state.error.message}</p>
              )}
            </AlertDescription>
          </Alert>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Skeleton fallback for lazy panels ──
function LazyFallback() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

// ── Lazy load factory ──
function createLazyPanel(importFn: () => Promise<{ default: React.ComponentType<any> }>) {
  const LazyComponent = lazy(importFn);
  return function SafeLazyPanel(props?: Record<string, unknown>) {
    return (
      <PanelErrorBoundary>
        <Suspense fallback={<LazyFallback />}>
          <LazyComponent {...props} />
        </Suspense>
      </PanelErrorBoundary>
    );
  };
}

// ── New panels from these-frame (lazy-loaded for performance) ──
const CadragePanel = createLazyPanel(() => import("@/components/thesis/cadrage-panel"));
const DirecteurChat = createLazyPanel(() => import("@/components/thesis/directeur-chat"));
const LiteratureSearch = createLazyPanel(() => import("@/components/thesis/literature-search"));
const RecherchePanel = createLazyPanel(() => import("@/components/thesis/recherche-panel"));
const ChapterBalance = createLazyPanel(() => import("@/components/thesis/chapter-balance"));
const GrammarChecker = createLazyPanel(() => import("@/components/thesis/grammar-checker"));
const HarperChecker = createLazyPanel(() => import("@/components/thesis/harper-checker"));
const ThesisSearch = createLazyPanel(() => import("@/components/thesis/thesis-search"));
const AgileRoadmap = createLazyPanel(() => import("@/components/thesis/agile-roadmap"));
const AutomationPanel = createLazyPanel(() => import("@/components/thesis/automation-panel"));
const WritingUnblock = createLazyPanel(() => import("@/components/thesis/writing-unblock-panel"));
const ResourcesPanel = createLazyPanel(() => import("@/components/thesis/resources-panel"));
const BookSkillsPanel = createLazyPanel(() => import("@/components/thesis/book-skills-panel"));
const ResearchResourcesPanel = createLazyPanel(() => import("@/components/thesis/research-resources-panel"));
const FieldAnalysis = createLazyPanel(() => import("@/components/thesis/research-field-analysis-panel"));
const ApaComposer = createLazyPanel(() => import("@/components/thesis/apa-results-composer"));
const SlrProtocol = createLazyPanel(() => import("@/components/thesis/slr-protocol-panel"));
const DoctoralToolkit = createLazyPanel(() => import("@/components/thesis/doctoral-toolkit-panel"));
const BoxDrivePanel = createLazyPanel(() => import("@/components/thesis/box-drive-panel"));
const RoutesMePanel = createLazyPanel(() => import("@/components/thesis/routesme-panel"));
const VerificationPanel = createLazyPanel(() => import("@/components/thesis/verification-panel"));
const UsageGuidePanel = createLazyPanel(() => import("@/components/thesis/usage-guide-panel"));
const OfficeExport = createLazyPanel(() => import("@/components/thesis/office-export-tab"));
const IthyResearch = createLazyPanel(() => import("@/components/thesis/ithy-research"));
const AutoEdition = createLazyPanel(() => import("@/components/thesis/auto-edition-8c"));
const JournalFinder = createLazyPanel(() => import("@/components/thesis/journal-finder"));
const ExportPdf = createLazyPanel(() => import("@/components/thesis/export-pdf-tab"));
const CloudDriveBackup = createLazyPanel(() => import("@/components/thesis/cloud-drive-backup"));
const LicenseAdminPanel = createLazyPanel(() => import("@/components/thesis/license-admin-panel"));
const AuthProviderPanel = createLazyPanel(() => import("@/components/thesis/auth-provider-panel"));
const MendeleyPanel = createLazyPanel(() => import("@/components/thesis/references-tab"));

// ── SurfSense-inspired panels ──
const KnowledgeBasePanel = createLazyPanel(() => import("@/components/thesis/knowledge-base-panel"));
const ResearchMemoryPanel = createLazyPanel(() => import("@/components/thesis/research-memory-panel"));

// ── Resource gallery (RB infographics) ──
const ResourceGallery = createLazyPanel(() => import("@/modules/resource-gallery/resource-gallery-page").then(m => ({ default: m.ResourceGalleryPage })));

function CurrentView() {
  const { currentView } = useAppStore();

  switch (currentView) {
    // ── Existing fully-implemented modules ──
    case "dashboard":
      return <DashboardPage />;
    case "editor":
      return <EditorPage />;
    case "ai-writing":
      return <AiWritingPage />;
    case "methodology":
      return <MethodologyPage />;
    case "articles":
      return <ArticlesPage />;
    case "references":
      return <ReferencesPage />;
    case "thesis-plan":
      return <ThesisPlanPage />;
    case "ai-tools":
      return <AiToolsPage />;
    case "academic-db":
      return <AcademicDbPage />;

    // ── Restored panels from these-frame ──
    case "cadrage":
      return <CadragePanel />;
    case "directeur-chat":
      return <DirecteurChat />;
    case "literature-search":
      return <LiteratureSearch />;
    case "recherche":
      return <RecherchePanel />;
    case "chapter-balance":
      return <ChapterBalance />;
    case "grammar-checker":
      return <GrammarChecker />;
    case "harper-checker":
      return <HarperChecker />;
    case "thesis-search":
      return <ThesisSearch />;
    case "agile-roadmap":
      return <AgileRoadmap />;
    case "automation":
      return <AutomationPanel />;
    case "writing-unblock":
      return <WritingUnblock />;
    case "resources":
      return <ResourcesPanel />;
    case "book-skills":
      return <BookSkillsPanel />;
    case "research-resources":
      return <ResearchResourcesPanel />;
    case "field-analysis":
      return <FieldAnalysis />;
    case "apa-composer":
      return <ApaComposer />;
    case "slr-protocol":
      return <SlrProtocol />;
    case "doctoral-toolkit":
      return <DoctoralToolkit />;
    case "box-drive":
      return <BoxDrivePanel />;
    case "routesme":
      return <RoutesMePanel />;
    case "verification":
      return <VerificationPanel />;
    case "usage-guide":
      return <UsageGuidePanel />;
    case "office-export":
      return <OfficeExport />;
    case "ithy-research":
      return <IthyResearch />;
    case "auto-edition":
      return <AutoEdition />;
    case "journal-finder":
      return <JournalFinder />;
    case "export-pdf":
      return <ExportPdf />;
    case "cloud-drive":
      return <CloudDriveBackup />;
    case "license":
      return <LicenseAdminPanel />;
    case "auth-providers":
      return <AuthProviderPanel />;
    case "mendeley":
      return <MendeleyPanel />;

    // ── SurfSense-inspired features ──
    case "knowledge-base":
      return <KnowledgeBasePanel />;
    case "research-memory":
      return <ResearchMemoryPanel />;

    // ── Resource gallery ──
    case "resource-gallery":
      return <ResourceGallery />;

    // ── Fallback ──
    default:
      return <ModulePlaceholder />;
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
