"use client";

import { useAppStore } from "@/lib/stores/app-store";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { DataBanner } from "@/components/layout/data-banner";
import { useAiConfig } from "@/hooks/use-ai-config";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { EditorPage } from "@/modules/editor/editor-page";
import { CadragePage } from "@/modules/cadrage/cadrage-page";
import { ReferencesPage } from "@/modules/references/references-page";
import { AiWritingPage } from "@/modules/ai-writing/ai-writing-page";
import { MethodologyPage } from "@/modules/methodology/methodology-page";
import { ArticlesPage } from "@/modules/articles/articles-page";
import { ThesisPlanPage } from "@/modules/thesis-plan/thesis-plan-page";
import { AiToolsPage } from "@/modules/ai-tools/ai-tools-page";
import { AcademicDbPage } from "@/modules/academic-db/academic-db-page";
import { DeblocageEcriturePage } from "@/modules/deblocage-ecriture/deblocage-ecriture-page";
import { JournauxOaPage } from "@/modules/journaux-oa/journaux-oa-page";
import { RecherchePleinTextePage } from "@/modules/recherche-plein-texte/recherche-plein-texte-page";
import { AutoEditionPage } from "@/modules/auto-edition/auto-edition-page";
import { FeuilleRouteAgilePage } from "@/modules/feuille-route-agile/feuille-route-agile-page";
import { AnalyseChampRecherchePage } from "@/modules/analyse-champ-recherche/analyse-champ-recherche-page";
import { OutilsSlrPage } from "@/modules/outils-slr/outils-slr-page";
import { ApaComposerPage } from "@/modules/apa-composer/apa-composer-page";
import { VerificationMethodoPage } from "@/modules/verification-methodo/verification-methodo-page";
import { BoiteDoctoralePage } from "@/modules/boite-doctorale/boite-doctorale-page";
import { RoutesMePage } from "@/modules/routesme/routesme-page";
import { LivresCompetencesPage } from "@/modules/livres-competences/livres-competences-page";
import { OngletRecherchePage } from "@/modules/onglet-recherche/onglet-recherche-page";
import { GrammairePage } from "@/modules/grammaire/grammaire-page";
import { ExportPdfPage } from "@/modules/export-pdf/export-pdf-page";
import { EquilibreChapitresPage } from "@/modules/equilibre-chapitres/equilibre-chapitres-page";
import { DiagrammesPage } from "@/modules/diagrammes/diagrammes-page";
import { HarperPage } from "@/modules/harper/harper-page";
import { ThesisRagPage } from "@/modules/thesis-rag/thesis-rag-page";
import { VerificationCartoPage } from "@/modules/verification-carto/verification-carto-page";
import { Paper2CodePage } from "@/modules/paper2code/paper2code-page";
import { ExportDocxPage } from "@/modules/export-docx/export-docx-page";
import { AlignementPreuvesPage } from "@/modules/alignement-preuves/alignement-preuves-page";
import { PhrasebookPage } from "@/modules/phrasebook/phrasebook-page";
import { ThesesEnLignePage } from "@/modules/theses-en-ligne/theses-en-ligne-page";
import { VerificationCoherencePage } from "@/modules/verification-coherence/verification-coherence-page";
import { ExplorateurThesesPage } from "@/modules/explorateur-theses/explorateur-theses-page";
import { TraducteurPage } from "@/modules/traducteur/traducteur-page";
import { BibliothequePage } from "@/modules/bibliotheque/bibliotheque-page";
import { VerificationCitationsPage } from "@/modules/verification-citations/verification-citations-page";
import { GenerationHypothesesPage } from "@/modules/generation-hypotheses/generation-hypotheses-page";
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
    case "cadrage":
      return <CadragePage />;
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
    case "journaux-oa":
      return <JournauxOaPage />;
    case "recherche-plein-texte":
      return <RecherchePleinTextePage />;
    case "auto-edition":
      return <AutoEditionPage />;
    case "feuille-route-agile":
      return <FeuilleRouteAgilePage />;
    case "deblocage-ecriture":
      return <DeblocageEcriturePage />;
    case "outils-slr":
      return <OutilsSlrPage />;
    case "analyse-champ-recherche":
      return <AnalyseChampRecherchePage />;
    case "apa-composer":
      return <ApaComposerPage />;
    case "verification-methodo":
      return <VerificationMethodoPage />;
    case "boite-doctorale":
      return <BoiteDoctoralePage />;
    case "routesme":
      return <RoutesMePage />;
    case "livres-competences":
      return <LivresCompetencesPage />;
    case "onglet-recherche":
      return <OngletRecherchePage />;
    case "grammaire":
      return <GrammairePage />;
    case "export-pdf":
      return <ExportPdfPage />;
    case "equilibre-chapitres":
      return <EquilibreChapitresPage />;
    case "diagrammes":
      return <DiagrammesPage />;
    case "harper":
      return <HarperPage />;
    case "thesis-rag":
      return <ThesisRagPage />;
    case "verification-carto":
      return <VerificationCartoPage />;
    case "paper2code":
      return <Paper2CodePage />;
    case "export-docx":
      return <ExportDocxPage />;
    case "alignement-preuves":
      return <AlignementPreuvesPage />;
    case "phrasebook":
      return <PhrasebookPage />;
    case "theses-en-ligne":
      return <ThesesEnLignePage />;
    case "verification-coherence":
      return <VerificationCoherencePage />;
    case "explorateur-theses":
      return <ExplorateurThesesPage />;
    case "traducteur":
      return <TraducteurPage />;
    case "bibliotheque":
      return <BibliothequePage />;
    case "verification-citations":
      return <VerificationCitationsPage />;
    case "generation-hypotheses":
      return <GenerationHypothesesPage />;
    default:
      return <DashboardPage />;
  }
}

export default function Home() {
  const { aiConfig } = useAiConfig();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-h-screen">
        <AppHeader />
        <DataBanner provider={aiConfig.provider} />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <CurrentView />
        </main>
        <AppFooter />
      </SidebarInset>
    </SidebarProvider>
  );
}
