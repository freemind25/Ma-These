"use client";

import { useAppStore } from "@/lib/stores/app-store";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { EditorPage } from "@/modules/editor/editor-page";
import { ReferencesPage } from "@/modules/references/references-page";
import { AiWritingPage } from "@/modules/ai-writing/ai-writing-page";
import { MethodologyPage } from "@/modules/methodology/methodology-page";
import { ArticlesPage } from "@/modules/articles/articles-page";
import { ThesisPlanPage } from "@/modules/thesis-plan/thesis-plan-page";
import { AiToolsPage } from "@/modules/ai-tools/ai-tools-page";
import { AcademicDbPage } from "@/modules/academic-db/academic-db-page";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";

function CurrentView() {
  const { currentView } = useAppStore();

  switch (currentView) {
    case "dashboard":
      return <DashboardPage />;
    case "editor":
      return <EditorPage />;
    case "ai-writing":
      return <AiWritingPage />;
    case "references":
      return <ReferencesPage />;
    case "methodology":
      return <MethodologyPage />;
    case "articles":
      return <ArticlesPage />;
    case "thesis-plan":
      return <ThesisPlanPage />;
    case "ai-tools":
      return <AiToolsPage />;
    case "academic-db":
      return <AcademicDbPage />;
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
