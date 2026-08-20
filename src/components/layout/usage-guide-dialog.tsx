"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Search,
  Sparkles,
  Brain,
  FileText,
  LayoutDashboard,
  BookOpen,
  FlaskConical,
  Newspaper,
  Globe,
  Library,
  Wrench,
  Route,
  Unlock,
  GitBranch,
  Compass,
  FileCheck,
  ShieldCheck,
  Briefcase,
  Cloud,
  GitCompareArrows,
  Type,
  SpellCheck,
  FileDown,
  Scale,
  GitFork,
  ListTree,
  SearchIcon,
  ClipboardCheck,
  PanelLeftOpen,
  Bot,
  ArrowRight,
  Lightbulb,
  GraduationCap,
} from "lucide-react";
import { useState, useMemo } from "react";

// ═══════════════════════════════════════
// Data: Guide sections organised by category
// ═══════════════════════════════════════

interface GuideSection {
  id: string;
  title: string;
  icon: React.ElementType;
  keywords: string[];
  content: React.ReactNode;
}

interface GuideCategory {
  id: string;
  label: string;
  emoji: string;
  sections: GuideSection[];
}

const GUIDE_CATEGORIES: GuideCategory[] = [
  // ─── DÉMARRAGE ───
  {
    id: "demarrage",
    label: "Démarrage rapide",
    emoji: "🚀",
    sections: [
      {
        id: "intro",
        title: "Bienvenue dans ThesisFrame",
        icon: GraduationCap,
        keywords: [
          "theframe",
          "introduction",
          "demarrage",
          "debut",
          "premier pas",
          "commencer",
          "bienvenue",
        ],
        content: (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>ThesisFrame</strong> est votre environnement de travail doctoral
              tout-en-un. Il regroupe tous les outils nécessaires pour mener votre
              thèse de A à Z : rédaction, recherche bibliographique, méthodologie,
              IA, et export.
            </p>
            <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
              <p className="text-sm font-medium flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                Pour commencer en 4 étapes
              </p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Créez une thèse depuis le Tableau de bord</li>
                <li>Structurez votre plan dans « Plan de thèse »</li>
                <li>Configurez votre fournisseur IA (⚙️ → Fournisseur IA)</li>
                <li>Utilisez l&apos;Assistant IA pour rédiger vos chapitres</li>
              </ol>
            </div>
          </div>
        ),
      },
      {
        id: "config-ia",
        title: "Configuration du fournisseur IA",
        icon: Bot,
        keywords: [
          "ia",
          "ai",
          "fournisseur",
          "config",
          "api",
          "cle",
          "openai",
          "mistral",
          "anthropic",
          "routesme",
          "zai",
          "provider",
          "modele",
          "configuration",
          "parametres",
        ],
        content: (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              ThesisFrame fonctionne avec plusieurs fournisseurs d&apos;IA. Pour
              activer les fonctionnalités IA (rédaction, RAG, correction…), vous
              devez configurer un fournisseur.
            </p>
            <div className="space-y-2">
              <p className="text-sm font-medium">Étapes :</p>
              <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
                <li>
                  Cliquez sur l&apos;icône <strong>⚙️ Paramètres</strong> dans
                  l&apos;en-tête
                </li>
                <li>Sélectionnez « Fournisseur IA »</li>
                <li>Choisissez votre fournisseur dans la liste</li>
                <li>Entrez votre clé API</li>
                <li>Cliquez sur <strong>Tester</strong> pour vérifier la connexion</li>
                <li>Cliquez sur <strong>Sauvegarder</strong></li>
              </ol>
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium">Fournisseurs disponibles :</p>
              <div className="grid gap-2">
                <div className="rounded-md border p-2.5">
                  <p className="text-sm font-medium">Z.ai (intégré)</p>
                  <p className="text-xs text-muted-foreground">
                    Fonctionne immédiatement, aucune configuration requise. Accès limité.
                  </p>
                </div>
                <div className="rounded-md border p-2.5">
                  <p className="text-sm font-medium">Mistral AI ↯</p>
                  <p className="text-xs text-muted-foreground">
                    Modèles français (Large, Medium, Small). Obtenez votre clé sur{" "}
                    <span className="text-sky-600 dark:text-sky-400">console.mistral.ai</span>.
                    Crédits gratuits disponibles.
                  </p>
                </div>
                <div className="rounded-md border p-2.5">
                  <p className="text-sm font-medium">RoutesMe ⚡</p>
                  <p className="text-xs text-muted-foreground">
                    1 clé = 20+ modèles (GLM, GPT, Claude, DeepSeek…). Obtenez sur{" "}
                    <span className="text-amber-600 dark:text-amber-400">routesme.online</span>.
                  </p>
                </div>
                <div className="rounded-md border p-2.5">
                  <p className="text-sm font-medium">OpenAI / Anthropic</p>
                  <p className="text-xs text-muted-foreground">
                    GPT et Claude. Nécessite une clé API OpenAI ou Anthropic.
                  </p>
                </div>
                <div className="rounded-md border p-2.5">
                  <p className="text-sm font-medium">Personnalisé</p>
                  <p className="text-xs text-muted-foreground">
                    Toute API compatible OpenAI (base URL + clé + modèle).
                  </p>
                </div>
              </div>
            </div>
          </div>
        ),
      },
    ],
  },

  // ─── RÉDACTION ───
  {
    id: "redaction",
    label: "Rédaction & Structure",
    emoji: "✍️",
    sections: [
      {
        id: "dashboard",
        title: "Tableau de bord",
        icon: LayoutDashboard,
        keywords: [
          "dashboard",
          "tableau de bord",
          "vue d'ensemble",
          "statistiques",
          "accueil",
          "home",
          "overview",
        ],
        content: (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Le <strong>Tableau de bord</strong> est votre point d&apos;entrée.
              Il affiche un résumé de votre thèse : nombre de chapitres, références,
              progression globale, et accès rapide à toutes les actions.
            </p>
            <div className="rounded-lg border bg-muted/50 p-3">
              <p className="text-sm font-medium">Actions disponibles :</p>
              <ul className="text-sm text-muted-foreground space-y-1 mt-1.5">
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3" /> Créer une nouvelle thèse
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3" /> Ouvrir une thèse existante
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3" /> Voir les statistiques de progression
                </li>
              </ul>
            </div>
          </div>
        ),
      },
      {
        id: "editor",
        title: "Éditeur de thèse",
        icon: FileText,
        keywords: [
          "editeur",
          "editor",
          "rediger",
          "ecrire",
          "chapitre",
          "section",
          "texte",
          "word",
          "edition",
        ],
        content: (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              L&apos;<strong>Éditeur de thèse</strong> vous permet de rédiger vos
              chapitres directement dans l&apos;application. Il offre un éditeur de
              texte riche avec mise en forme et sauvegarde automatique.
            </p>
            <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
              <p className="text-sm font-medium">Fonctionnalités :</p>
              <ul className="text-sm text-muted-foreground space-y-1.5">
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3" /> Éditeur de texte riche (gras,
                  italique, titres, listes…)
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3" /> Structure en chapitres et sections
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3" /> Sauvegarde automatique en base de
                  données
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3" /> Compteur de mots et de caractères
                </li>
              </ul>
            </div>
          </div>
        ),
      },
      {
        id: "thesis-plan",
        title: "Plan de thèse",
        icon: ListTree,
        keywords: [
          "plan",
          "structure",
          "template",
          "latex",
          "organisation",
          "chapitres",
          "table des matieres",
          "sommaire",
        ],
        content: (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Le <strong>Plan de thèse</strong> vous aide à structurer votre manuscrit.
              Définissez vos parties, chapitres et sections pour organiser votre travail.
            </p>
            <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
              <p className="text-sm font-medium">Structure typique :</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>📄 Introduction générale</li>
                <li>📚 Revue de littérature (2-3 chapitres)</li>
                <li>🔬 Cadre méthodologique</li>
                <li>📊 Résultats (2-3 chapitres)</li>
                <li>💡 Discussion</li>
                <li>📝 Conclusion générale</li>
                <li>📋 Bibliographie</li>
              </ul>
            </div>
          </div>
        ),
      },
      {
        id: "equilibre",
        title: "Équilibre des chapitres",
        icon: Scale,
        keywords: [
          "equilibre",
          "balance",
          "repartition",
          "chapitres",
          "proportion",
          "taille",
          "mots",
          "analyse",
        ],
        content: (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              L&apos;outil <strong>Équilibre chapitres</strong> (IA) analyse la
              répartition des mots entre vos chapitres pour vous aider à identifier les
              déséquilibres. Idéal pour s&apos;assurer que votre thèse est bien
              proportionnée.
            </p>
          </div>
        ),
      },
    ],
  },

  // ─── ASSISTANTS IA ───
  {
    id: "assistants-ia",
    label: "Assistants IA",
    emoji: "🤖",
    sections: [
      {
        id: "ai-writing",
        title: "Assistant IA d'écriture",
        icon: Sparkles,
        keywords: [
          "assistant ia",
          "ai writing",
          "sparkles",
          "modes",
          "generation",
          "redaction assistee",
          "paraphrase",
          "reformulation",
          "reecriture",
          "completion",
          "suggestion",
          "idees",
          "brainstorming",
          "introduction",
          "conclusion",
          "transition",
        ],
        content: (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              L&apos;<strong>Assistant IA</strong> propose plusieurs modes d&apos;écriture
              assistée pour chaque étape de votre rédaction. Sélectionnez le mode
              adapté et laissez l&apos;IA vous aider.
            </p>
            <div className="space-y-2">
              <p className="text-sm font-medium">Modes de l'éditeur :</p>
              <div className="grid gap-1.5">
                {[
                  { mode: "Générer", desc: "Génère du contenu à partir d&apos;un prompt" },
                  { mode: "Améliorer", desc: "Améliore le style et la clarté d&apos;un texte" },
                  { mode: "Résumer", desc: "Crée un résumé concis d&apos;un passage" },
                  { mode: "Développer", desc: "Développe et enrichit un paragraphe" },
                  { mode: "Paraphraser", desc: "Reformule en gardant le sens" },
                  { mode: "Corriger", desc: "Corrige les erreurs de grammaire et style" },
                  { mode: "Structurer", desc: "Structure des notes en plan organisé" },
                  { mode: "Traduire", desc: "Traduit vers/depuis une autre langue" },
                  { mode: "Academiciser", desc: "Transforme en style académique" },
                  { mode: "Transition", desc: "Génère des transitions entre sections" },
                ].map((item) => (
                  <div key={item.mode} className="rounded-md border p-2 flex gap-2">
                    <Badge variant="secondary" className="shrink-0 text-[10px] h-5">
                      {item.mode}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ),
      },
      {
        id: "thesis-rag",
        title: "Mon IA de thèse (RAG)",
        icon: Brain,
        keywords: [
          "rag",
          "mon ia",
          "ia de these",
          "contextuelle",
          "interroger",
          "questions",
          "reponses",
          "sources",
          "citations",
          "chunks",
          "index",
          "indexation",
        ],
        content: (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>Mon IA de thèse</strong> est votre assistant contextuel. Il
              indexe automatiquement le contenu de vos chapitres, références, notes du
              carnet de recherche et cadrage, puis répond à vos questions avec des{" "}
              <strong>citations exactes</strong> de vos sources.
            </p>
            <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
              <p className="text-sm font-medium">Comment ça marche :</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>
                  <strong>Indexer</strong> — Cliquez sur « Indexer la thèse » pour
                  analyser tout votre contenu
                </li>
                <li>
                  <strong>Questionner</strong> — Posez une question en français dans la
                  barre de saisie
                </li>
                <li>
                  <strong>Citer</strong> — L&apos;IA répond en référençant les passages
                  pertinents de votre thèse
                </li>
              </ol>
            </div>
            <div className="rounded-lg border p-2.5 space-y-1">
              <p className="text-xs font-medium">Sources indexées :</p>
              <div className="flex flex-wrap gap-1">
                <Badge className="text-[10px]" variant="outline" style={{ borderColor: "var(--color-emerald-500, #10b981)", color: "var(--color-emerald-500, #10b981)" }}>
                  📄 Chapitres
                </Badge>
                <Badge className="text-[10px]" variant="outline" style={{ borderColor: "var(--color-sky-500, #0ea5e9)", color: "var(--color-sky-500, #0ea5e9)" }}>
                  📚 Références
                </Badge>
                <Badge className="text-[10px]" variant="outline" style={{ borderColor: "var(--color-amber-500, #f59e0b)", color: "var(--color-amber-500, #f59e0b)" }}>
                  📓 Carnet de recherche
                </Badge>
                <Badge className="text-[10px]" variant="outline" style={{ borderColor: "var(--color-violet-500, #8b5cf6)", color: "var(--color-violet-500, #8b5cf6)" }}>
                  🎯 Cadrage
                </Badge>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: "harper",
        title: "Harper (Résumeur IA)",
        icon: Type,
        keywords: [
          "harper",
          "resume",
          "paraphrase",
          "extraction",
          "reformuler",
          "summarize",
        ],
        content: (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>Harper</strong> est un outil IA polyvalent qui vous aide à{" "}
              résumer, paraphraser et extraire les points clés de n&apos;importe quel
              texte académique. Idéal pour traiter vos lectures et notes rapidement.
            </p>
          </div>
        ),
      },
      {
        id: "grammaire",
        title: "Correcteur grammatical",
        icon: SpellCheck,
        keywords: [
          "grammaire",
          "correcteur",
          "orthographe",
          "spellcheck",
          "correction",
          "typographie",
        ],
        content: (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Le <strong>correcteur grammatical IA</strong> analyse votre texte pour
              détecter les erreurs de grammaire, d&apos;orthographe et de typographie
              spécifiques à l&apos;écriture académique française. Il propose des
              corrections et explications.
            </p>
          </div>
        ),
      },
      {
        id: "routesme-comparison",
        title: "RoutesMe (Comparaison multi-modèles)",
        icon: GitCompareArrows,
        keywords: [
          "routesme",
          "comparaison",
          "multi-modeles",
          "benchmark",
          "modeles ia",
          "gpt",
          "claude",
          "deepseek",
          "glm",
        ],
        content: (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>RoutesMe</strong> vous permet de comparer les réponses de
              plusieurs modèles IA simultanément. Envoyez le même prompt à GPT, Claude,
              GLM, DeepSeek et autres, puis comparez les résultats côte à côte.
            </p>
            <div className="rounded-lg border bg-muted/50 p-3">
              <p className="text-sm font-medium flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                Astuce
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Utilisez RoutesMe pour choisir le meilleur modèle pour chaque tâche :
                rédaction, analyse, traduction…
              </p>
            </div>
          </div>
        ),
      },
    ],
  },

  // ─── RECHERCHE BIBLIOGRAPHIQUE ───
  {
    id: "biblio",
    label: "Recherche bibliographique",
    emoji: "📚",
    sections: [
      {
        id: "references",
        title: "Gestion des références",
        icon: BookOpen,
        keywords: [
          "references",
          "bibliographie",
          "bibtex",
          "citation",
          "source",
          "livre",
          "article",
          "export",
        ],
        content: (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Le module <strong>Références</strong> est votre gestionnaire
              bibliographique intégré. Ajoutez, organisez et exportez vos références
              en format BibTeX ou APA.
            </p>
            <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
              <p className="text-sm font-medium">Fonctionnalités :</p>
              <ul className="text-sm text-muted-foreground space-y-1.5">
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3" /> Ajout manuel ou par DOI
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3" /> Catégorisation par tags et
                  collections
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3" /> Export BibTeX / APA
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3" /> Notes et annotations
                </li>
              </ul>
            </div>
          </div>
        ),
      },
      {
        id: "articles",
        title: "Articles scientifiques",
        icon: Newspaper,
        keywords: [
          "articles",
          "publication",
          "rédaction",
          "soumission",
          "journal",
          "paper",
        ],
        content: (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Le module <strong>Articles scientifiques</strong> vous aide à rédiger et
              préparer vos articles pour publication. Il inclut des templates et des
              conseils pour le formatage selon les normes des revues.
            </p>
          </div>
        ),
      },
      {
        id: "academic-db",
        title: "Bases de données académiques",
        icon: Globe,
        keywords: [
          "bases de donnees",
          "academic",
          "ressources",
          "hal",
          "google scholar",
          "pubmed",
          "scopus",
          "web of science",
        ],
        content: (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Les <strong>Bases de données académiques</strong> regroupent les liens
              directs vers les principales plateformes de recherche : HAL, Google
              Scholar, PubMed, Scopus, Web of Science, etc.
            </p>
          </div>
        ),
      },
      {
        id: "journaux-oa",
        title: "Journaux Open Access (OA)",
        icon: Library,
        keywords: [
          "open access",
          "oa",
          "journaux",
          "doaj",
          "openalex",
          "gratuit",
          "csv",
          "export",
          "publication",
        ],
        content: (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>Journaux OA</strong> vous permet de rechercher des journaux en
              accès libre via OpenAlex et DOAJ. Filtrez par discipline, facteur
              d&apos;impact, et exportez les résultats en CSV.
            </p>
          </div>
        ),
      },
      {
        id: "recherche-plein-texte",
        title: "Recherche plein texte",
        icon: SearchIcon,
        keywords: [
          "recherche plein texte",
          "full text",
          "search",
          "chercher",
          "trouver",
          "chapitres",
          "occurrences",
        ],
        content: (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              La <strong>Recherche plein texte</strong> vous permet de chercher un
              mot ou une expression dans tous vos chapitres. Résultats avec contexte et
              navigation directe vers les occurrences.
            </p>
          </div>
        ),
      },
      {
        id: "onglet-recherche",
        title: "Onglet Recherche",
        icon: PanelLeftOpen,
        keywords: [
          "onglet",
          "recherche",
          "navigation",
          "organiser",
          "onglets",
          "tabs",
        ],
        content: (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              L&apos;<strong>Onglet Recherche</strong> vous permet d&apos;ouvrir
              plusieurs sources en onglets pour organiser vos recherches
              bibliographiques sans perdre le fil.
            </p>
          </div>
        ),
      },
    ],
  },

  // ─── MÉTHODOLOGIE ───
  {
    id: "methodologie",
    label: "Méthodologie",
    emoji: "🔬",
    sections: [
      {
        id: "methodology",
        title: "Guides méthodologiques",
        icon: FlaskConical,
        keywords: [
          "methodologie",
          "guide",
          "qualitatif",
          "quantitatif",
          "mixte",
          "methodes",
          "approche",
        ],
        content: (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Le module <strong>Méthodologie</strong> propose des guides, checklists et
              outils pour chaque étape de votre démarche méthodologique : choix de
              méthode, échantillonnage, collecte et analyse de données.
            </p>
          </div>
        ),
      },
      {
        id: "outils-slr",
        title: "Outils SLR (Revue systématique)",
        icon: GitBranch,
        keywords: [
          "slr",
          "revue systematique",
          "systematic review",
          "prisma",
          "criblage",
          "extraction",
          "protocol",
          "inclusion",
          "exclusion",
        ],
        content: (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Les <strong>Outils SLR</strong> vous guident dans la conduite d&apos;une
              revue systématique de littérature : diagramme PRISMA, critères
              d&apos;inclusion/exclusion, grille d&apos;extraction et synthèse.
            </p>
            <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
              <p className="text-sm font-medium">Étapes PRISMA :</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Identification (bases de données)</li>
                <li>Criblage (titre et abstract)</li>
                <li>Éligibilité (texte intégral)</li>
                <li>Inclusion (articles retenus)</li>
              </ol>
            </div>
          </div>
        ),
      },
      {
        id: "verification-methodo",
        title: "Vérification méthodologique (IA)",
        icon: ShieldCheck,
        keywords: [
          "verification",
          "audit",
          "coherence",
          "methodologique",
          "qualite",
          "rigueur",
          "analyse critique",
        ],
        content: (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              La <strong>Vérification méthodologique IA</strong> audite votre chapitre
              pour vérifier la cohérence, la rigueur et la qualité méthodologique.
              Elle détecte les biais, les incohérences et les lacunes argumentaires.
            </p>
          </div>
        ),
      },
      {
        id: "analyse-champ",
        title: "Analyse du champ de recherche (IA)",
        icon: Compass,
        keywords: [
          "analyse champ",
          "cartographie",
          "positionnement",
          "lacet",
          "gap",
          "lacune",
          "recherche",
        ],
        content: (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              L&apos;<strong>Analyse du champ de recherche</strong> utilise l&apos;IA
              pour cartographier votre domaine, identifier les tendances, les lacunes et
              vous aider à positionner votre travail.
            </p>
          </div>
        ),
      },
      {
        id: "apa",
        title: "APA Composer",
        icon: FileCheck,
        keywords: [
          "apa",
          "composer",
          "norme",
          "citation",
          "style",
          "7e edition",
          "formatage",
          "bibliographie",
          "in-text",
        ],
        content: (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>APA Composer</strong> vous aide à formater vos citations et
              références selon la norme APA 7e édition. Génère automatiquement les
              citations in-text et la bibliographie.
            </p>
          </div>
        ),
      },
    ],
  },

  // ─── QUALITÉ ───
  {
    id: "qualite",
    label: "Qualité & Évaluation",
    emoji: "✅",
    sections: [
      {
        id: "auto-edition",
        title: "Auto-édition 8 Critères (IA)",
        icon: ClipboardCheck,
        keywords: [
          "auto-edition",
          "8 criteres",
          "auto-evaluation",
          "qualite",
          "evaluation",
          "critique",
          "feedback",
        ],
        content: (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              L&apos;<strong>Auto-édition 8 Critères</strong> évalue votre texte selon
              8 dimensions de qualité académique avec l&apos;IA : clarté, cohérence,
              originalité, argumentation, etc.
            </p>
            <div className="rounded-lg border bg-muted/50 p-3">
              <p className="text-sm font-medium">Les 8 critères :</p>
              <div className="grid grid-cols-2 gap-1 mt-1.5 text-xs text-muted-foreground">
                <span>1. Clarté de l&apos;expression</span>
                <span>2. Cohérence argumentaire</span>
                <span>3. Originalité</span>
                <span>4. Rigueur scientifique</span>
                <span>5. Qualité des sources</span>
                <span>6. Structure logique</span>
                <span>7. Style académique</span>
                <span>8. Pertinence des exemples</span>
              </div>
            </div>
          </div>
        ),
      },
    ],
  },

  // ─── ORGANISATION ───
  {
    id: "organisation",
    label: "Organisation & Productivité",
    emoji: "📋",
    sections: [
      {
        id: "feuille-route",
        title: "Feuille de Route Agile",
        icon: Route,
        keywords: [
          "agile",
          "kanban",
          "sprint",
          "tache",
          "to-do",
          "progression",
          "suivi",
          "planning",
          "backlog",
        ],
        content: (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              La <strong>Feuille de Route Agile</strong> adapte la méthodologie agile à
              votre thèse. Organisez vos tâches en sprints, suivez votre progression
              avec un tableau Kanban, et atteignez vos objectifs étape par étape.
            </p>
            <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
              <p className="text-sm font-medium">Fonctionnalités :</p>
              <ul className="text-sm text-muted-foreground space-y-1.5">
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3" /> Tableau Kanban (À faire → En cours → Terminé)
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3" /> Sprints et deadlines
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3" /> Suivi de progression par module
                </li>
              </ul>
            </div>
          </div>
        ),
      },
      {
        id: "boite-doctorale",
        title: "Boîte doctorale",
        icon: Briefcase,
        keywords: [
          "boite doctorale",
          "checklist",
          "calendrier",
          "documents",
          "suivi doctoral",
          "soutenance",
          "deadlines",
          "ecole doctorale",
          "administration",
        ],
        content: (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              La <strong>Boîte doctorale</strong> regroupe tout ce dont vous avez
              besoin pour gérer les aspects administratifs de votre doctorat :
              checklists, calendrier des étapes, documents administratifs, préparation de
              soutenance.
            </p>
          </div>
        ),
      },
      {
        id: "deblocage",
        title: "Déblocage écriture",
        icon: Unlock,
        keywords: [
          "deblocage",
          "blocage",
          "ecriture",
          "pomodoro",
          "exercice",
          "motivation",
          "productivite",
          "freewriting",
        ],
        content: (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Le <strong>Déblocage écriture</strong> offre des stratégies concrètes
              pour surmonter le syndrome de la page blanche. Inclut la technique
              Pomodoro, des exercices d&apos;écriture libre et des stratégies
              anti-procrastination.
            </p>
          </div>
        ),
      },
      {
        id: "livres-competences",
        title: "Livres-compétences",
        icon: BookOpen,
        keywords: [
          "livres",
          "competences",
          "developpement",
          "formation",
          "skills",
          "doctoral",
        ],
        content: (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Les <strong>Livres-compétences</strong> vous permettent de suivre et
              développer vos compétences doctorales (rédaction, méthodologie,
              communication, etc.) au fil de votre parcours.
            </p>
          </div>
        ),
      },
      {
        id: "ai-tools",
        title: "Outils IA (Notebook, Consensus…)",
        icon: Wrench,
        keywords: [
          "outils ia",
          "notebook",
          "consensus",
          "visualisation",
          "carnet",
          "ia",
        ],
        content: (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Les <strong>Outils IA</strong> regroupent plusieurs fonctionnalités
              avancées : Notebook de recherche IA, analyse de consensus, visualisation
              de données et outils de traitement.
            </p>
          </div>
        ),
      },
    ],
  },

  // ─── EXPORT & STOCKAGE ───
  {
    id: "export",
    label: "Export & Stockage",
    emoji: "📦",
    sections: [
      {
        id: "export-pdf",
        title: "Export PDF",
        icon: FileDown,
        keywords: [
          "export",
          "pdf",
          "impression",
          "mise en forme",
          "document",
          "generer",
          "telecharger",
        ],
        content: (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              L&apos;<strong>Export PDF</strong> génère un document PDF professionnel
              de votre thèse avec mise en forme automatique : marges, pagination,
              en-têtes, et table des matières.
            </p>
          </div>
        ),
      },
      {
        id: "diagrammes",
        title: "Diagrammes visuels",
        icon: GitFork,
        keywords: [
          "diagrammes",
          "organigramme",
          "chronologie",
          "flux",
          "schema",
          "visuel",
          "graphique",
        ],
        content: (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Les <strong>Diagrammes</strong> vous permettent de créer des visuels pour
              votre thèse : organigrammes, chronologies, diagrammes de flux, cartes
              conceptuelles.
            </p>
          </div>
        ),
      },
      {
        id: "box-cloud",
        title: "Box Cloud",
        icon: Cloud,
        keywords: [
          "cloud",
          "stockage",
          "sauvegarde",
          "box",
          "backup",
          "fichier",
          "synchro",
        ],
        content: (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>Box Cloud</strong> offre un stockage cloud sécurisé pour vos
              fichiers de thèse. Sauvegardez, synchronisez et accédez à vos documents
              depuis n&apos;importe où.
            </p>
          </div>
        ),
      },
    ],
  },
];

// ═══════════════════════════════════════
// Component
// ═══════════════════════════════════════

export function UsageGuideDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter sections by search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return GUIDE_CATEGORIES;
    const q = searchQuery.toLowerCase().trim();
    return GUIDE_CATEGORIES.map((cat) => ({
      ...cat,
      sections: cat.sections.filter((s) =>
        s.keywords.some((k) => k.includes(q)) ||
        s.title.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.sections.length > 0);
  }, [searchQuery]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <GraduationCap className="h-5 w-5 text-primary" />
            Guide d&apos;utilisation ThesisFrame
          </DialogTitle>
          <DialogDescription className="mt-1">
            Découvrez tous les modules et fonctionnalités disponibles pour votre thèse.
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="px-6 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher un module ou une fonctionnalité…"
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Scrollable content */}
        <ScrollArea className="flex-1 px-6 pb-4" style={{ maxHeight: "calc(85vh - 180px)" }}>
          <div className="pt-3 space-y-4">
            {filteredCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Aucun résultat pour « {searchQuery} »
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Essayez un autre terme de recherche.
                </p>
              </div>
            ) : (
              <Accordion
                type="multiple"
                defaultValue={
                  searchQuery.trim()
                    ? filteredCategories.map((c) => c.id)
                    : ["demarrage"]
                }
                className="w-full"
              >
                {filteredCategories.map((cat) => (
                  <AccordionItem key={cat.id} value={cat.id}>
                    <AccordionTrigger className="hover:no-underline py-2.5">
                      <span className="flex items-center gap-2 text-sm font-semibold">
                        <span>{cat.emoji}</span>
                        {cat.label}
                        <Badge variant="secondary" className="text-[10px] ml-1 h-5">
                          {cat.sections.length}
                        </Badge>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-2">
                      <div className="space-y-1">
                        {cat.sections.map((section) => (
                          <div
                            key={section.id}
                            className="rounded-lg border p-4 transition-colors hover:bg-muted/30"
                          >
                            <div className="flex items-start gap-2.5 mb-2">
                              <section.icon className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                              <h4 className="text-sm font-semibold">{section.title}</h4>
                            </div>
                            <div className="ml-6.5">{section.content}</div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t px-6 py-3 flex items-center justify-between text-xs text-muted-foreground bg-muted/30 shrink-0">
          <span>ThesisFrame v1.2.0 — {GUIDE_CATEGORIES.reduce((acc, c) => acc + c.sections.length, 0)} modules documentés</span>
          <a
            href="https://github.com/freemind25/Ma-These"
            target="_blank"
            rel="noopener"
            className="hover:text-foreground underline underline-offset-2"
          >
            GitHub ↗
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
