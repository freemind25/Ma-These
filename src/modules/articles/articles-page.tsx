"use client";

import { useState } from "react";
import { Newspaper, FileText, PenTool, BarChart3, ClipboardCheck, ListChecks, Lightbulb, Target, BookOpen, ArrowRight, CheckCircle2, Beaker, MessageSquare, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";

// ─── IMRaD Guide Data ───────────────────────────────────────────────

interface IMRaDSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  badge: string;
  cards: { title: string; items: string[] }[];
}

const IMRAD_SECTIONS: IMRaDSection[] = [
  {
    id: "introduction",
    title: "Introduction",
    icon: <Target className="h-4 w-4" />,
    badge: "Contexte & Problématique",
    cards: [
      {
        title: "Accroche et contexte",
        items: [
          "Commencer par une affirmation large mais pertinente sur le domaine de recherche",
          "Citer les travaux fondateurs (2-3 références clés) pour ancrer le contexte",
          "Resserrer progressivement vers la problématique spécifique de l'article",
          "Éviter les généralités vides ; chaque phrase doit apporter une information",
        ],
      },
      {
        title: "Question de recherche",
        items: [
          "Formuler clairement la ou les questions de recherche à la fin de l'introduction",
          "Présenter les objectifs principaux et secondaires de l'étude",
          "Annoncer brièvement l'approche méthodologique retenue",
          "Indiquer l'apport attendu et la position par rapport à l'état de l'art",
        ],
      },
      {
        title: "Plan de l'article",
        items: [
          "L'introduction représente généralement 10-15 % du texte total",
          "Utiliser l'entonnoir : large → spécifique → question → plan",
          "Ne pas introduire de résultats ou de conclusions dans cette section",
          "Éviter les redondances avec l'abstract",
        ],
      },
    ],
  },
  {
    id: "methodologie",
    title: "Méthodologie",
    icon: <Beaker className="h-4 w-4" />,
    badge: "Matériels & Méthodes",
    cards: [
      {
        title: "Matériels et données",
        items: [
          "Décrire en détail les matériaux, logiciels, bases de données utilisés",
          "Préciser les critères d'inclusion et d'exclusion pour les échantillons",
          "Indiquer les versions des logiciels et bibliothèques employés",
          "Fournir les caractéristiques démographiques ou techniques de l'échantillon",
        ],
      },
      {
        title: "Protocole expérimental",
        items: [
          "Détailler chaque étape du protocole de manière reproductible",
          "Justifier les choix méthodologiques par rapport aux alternatives existantes",
          "Préciser les variables indépendantes, dépendantes et de contrôle",
          "Décrire les tests statistiques utilisés et les seuils de significativité",
        ],
      },
      {
        title: "Reproductibilité",
        items: [
          "Fournir suffisamment de détails pour qu'un autre chercheur puisse reproduire l'étude",
          "Mentionner les approbations éthiques et les numéros de protocole",
          "Indiquer si le code source ou les données sont disponibles en accès ouvert",
          "Décrire les mesures prises pour limiter les biais potentiels",
        ],
      },
    ],
  },
  {
    id: "resultats",
    title: "Résultats",
    icon: <BarChart3 className="h-4 w-4" />,
    badge: "Présentation des données",
    cards: [
      {
        title: "Organisation des résultats",
        items: [
          "Présenter les résultats dans un ordre logique (chronologique, thématique)",
          "Commencer par les résultats principaux, puis les résultats secondaires",
          "Ne pas interpréter les résultats : se limiter à la description factuelle",
          "Utiliser le passé composé ou le passé simple pour rapporter les observations",
        ],
      },
      {
        title: "Figures et tableaux",
        items: [
          "Chaque figure doit être auto-suffisante : légende complète, axes identifiés",
          "Numéroter les figures et tableaux séquentiellement selon leur ordre d'apparition",
          "Éviter la redondance entre le texte et les tableaux/figures",
          "Privilégier la qualité visuelle : résolution minimale de 300 dpi pour les images",
        ],
      },
      {
        title: "Statistiques et données quantitatives",
        items: [
          "Rapporter les effectifs (n), moyennes, écarts-types et intervalles de confiance",
          "Utiliser des notations statistiques standardisées (p < 0,05, r = 0,72…)",
          "Présenter les résultats non significatifs avec la même rigueur que les autres",
          "Inclure les analyses de sensibilité si pertinent",
        ],
      },
    ],
  },
  {
    id: "discussion",
    title: "Discussion",
    icon: <MessageSquare className="h-4 w-4" />,
    badge: "Interprétation & Perspectives",
    cards: [
      {
        title: "Interprétation des résultats",
        items: [
          "Résumer les principaux résultats sans les répéter un par un",
          "Comparer les résultats obtenus avec ceux de la littérature existante",
          "Expliquer les convergences et les divergences avec les études antérieures",
          "Proposer des mécanismes d'explication pour les résultats inattendus",
        ],
      },
      {
        title: "Limites de l'étude",
        items: [
          "Identifier honnêtement les faiblesses et limites de la méthodologie",
          "Discuter l'impact potentiel des limites sur la validité des conclusions",
          "Éviter de minimiser les limites : les évaluateurs les repéreront",
          "Distinguer les limites inhérentes à l'étude de celles dues aux contraintes pratiques",
        ],
      },
      {
        title: "Perspectives et travaux futurs",
        items: [
          "Proposer des directions de recherche découlant naturellement des résultats",
          "Suggérer des améliorations méthodologiques pour des études ultérieures",
          "Évoquer les implications pratiques ou théoriques des findings",
          "Conclure par une synthèse ouverte qui invite à la poursuite de la réflexion",
        ],
      },
    ],
  },
];

// ─── Writing Tools Data ──────────────────────────────────────────────

interface WritingTool {
  title: string;
  icon: React.ReactNode;
  tips: string[];
}

const WRITING_TOOLS: WritingTool[] = [
  {
    title: "Structurer un abstract",
    icon: <FileText className="h-5 w-5 text-primary" />,
    tips: [
      "Rédiger l'abstract en dernier, une fois l'article terminé",
      "Suivre la structure IMRaD condensée : contexte, méthode, résultats, conclusion",
      "Objectif : 150-300 mots selon la revue cible",
      "Éviter les acronymes non définis, les références et les abréviations",
      "Inclure les résultats chiffrés clés (ex. : « une amélioration de 23 % »)",
      "Rédiger des phrases complètes, éviter les telegraphic style",
    ],
  },
  {
    title: "Rédiger une introduction efficace",
    icon: <PenTool className="h-5 w-5 text-primary" />,
    tips: [
      "La première phrase doit captiver : un fait surprenant, un enjeu majeur",
      "Cibler 3-5 paragraphes pour une introduction d'article standard",
      "Placer la question de recherche dans le dernier paragraphe",
      "Équilibrer citations : ni trop (revue de littérature), ni trop peu (manque de fondement)",
      "Éviter « Dans cet article, nous allons… » : préférez le présent (« Cet article propose… »)",
      "Relire l'introduction après avoir terminé l'article pour vérifier la cohérence",
    ],
  },
  {
    title: "Présenter des résultats",
    icon: <BarChart3 className="h-5 w-5 text-primary" />,
    tips: [
      "Utiliser des verbes de description neutres : « montre », « indique », « suggère »",
      "Intégrer chaque tableau/figure dans le flux narratif du texte",
      "Préférer les graphiques aux tableaux quand la tendance est plus importante que les valeurs exactes",
      "Grouper les résultats par thème plutôt que par type d'analyse",
      "Mettre en évidence les résultats statistiquement significatifs",
      "Harmoniser le nombre de décimales dans tout le manuscrit",
    ],
  },
  {
    title: "Formuler une conclusion",
    icon: <CheckCircle2 className="h-5 w-5 text-primary" />,
    tips: [
      "Ne pas répéter le résumé des résultats : la conclusion apporte une perspective",
      "Répondre explicitement à la question de recherche formulée dans l'introduction",
      "Rappeler l'apport principal en 1-2 phrases percutantes",
      "Ouvrir sur les implications pratiques, théoriques ou méthodologiques",
      "Garder la conclusion courte : 1-2 paragraphes pour un article standard",
      "Éviter d'introduire de nouvelles informations ou références",
    ],
  },
];

// ─── Submission Checklist Data ───────────────────────────────────────

interface ChecklistCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: string[];
}

const CHECKLIST_CATEGORIES: ChecklistCategory[] = [
  {
    id: "avant-soumission",
    title: "Avant soumission",
    icon: <ClipboardCheck className="h-4 w-4 text-primary" />,
    items: [
      "Lire attentivement les instructions aux auteurs de la revue cible",
      "Vérifier que le sujet correspond au périmètre éditorial de la revue",
      "Relire l'article en entier pour corriger coquilles et incohérences",
      "Faire relire par au moins un collègue avant soumission",
      "S'assurer que tous les co-auteurs ont lu et approuvé le manuscrit",
    ],
  },
  {
    id: "format",
    title: "Format",
    icon: <FileText className="h-4 w-4 text-primary" />,
    items: [
      "Respecter le nombre de pages/mots maximum autorisé par la revue",
      "Appliquer le template de mise en page exigé (IEEE, APA, Springer…)",
      "Vérifier la résolution des figures (≥ 300 dpi, format vectoriel si possible)",
      "S'assurer que les tableaux tiennent sur la largeur d'une colonne ou d'une page",
      "Convertir le document au format demandé (PDF, LaTeX, Word…)",
    ],
  },
  {
    id: "contenu",
    title: "Contenu",
    icon: <BookOpen className="h-4 w-4 text-primary" />,
    items: [
      "L'abstract respecte la limite de mots et contient les mots-clés",
      "Toutes les références citées dans le texte sont présentes dans la bibliographie (et inversement)",
      "Les figures et tableaux sont numérotés et référencés dans le texte",
      "Les unités de mesure suivent le système international (SI)",
      "Les abréviations sont définies à leur première occurrence",
    ],
  },
  {
    id: "finalisation",
    title: "Finalisation",
    icon: <ListChecks className="h-4 w-4 text-primary" />,
    items: [
      "Préparer la lettre d'accompagnement (cover letter) personnalisée pour la revue",
      "Rédiger les suggestions de relecteurs (3-5 experts du domaine, hors conflit d'intérêts)",
      "Vérifier les formulaires de déclaration de conflits d'intérêts",
      "S'assurer que les données complémentaires sont prêtes (code, données, matériels supplémentaires)",
    ],
  },
];

// ─── Component ───────────────────────────────────────────────────────

export function ArticlesPage() {
  // Checklist state: Record<categoryId, Record<itemIndex, boolean>>
  const [checked, setChecked] = useState<Record<string, Record<number, boolean>>>({});

  const toggleItem = (categoryId: string, index: number) => {
    setChecked((prev) => {
      const cat = prev[categoryId] ?? {};
      return {
        ...prev,
        [categoryId]: {
          ...cat,
          [index]: !cat[index],
        },
      };
    });
  };

  const isItemChecked = (categoryId: string, index: number): boolean => {
    return checked[categoryId]?.[index] ?? false;
  };

  // Calculate progress
  const totalItems = CHECKLIST_CATEGORIES.reduce((sum, cat) => sum + cat.items.length, 0);
  const checkedCount = CHECKLIST_CATEGORIES.reduce(
    (sum, cat) =>
      sum + cat.items.filter((_, i) => isItemChecked(cat.id, i)).length,
    0,
  );
  const progressPercent = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Newspaper className="h-6 w-6 text-primary" />
          Articles scientifiques
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Guide IMRaD, rédaction et soumission
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="imrad" className="w-full">
        <TabsList>
          <TabsTrigger value="imrad" className="gap-1.5">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Guide IMRaD</span>
            <span className="sm:hidden">IMRaD</span>
          </TabsTrigger>
          <TabsTrigger value="outils" className="gap-1.5">
            <Lightbulb className="h-4 w-4" />
            <span className="hidden sm:inline">Boîte à outils</span>
            <span className="sm:hidden">Outils</span>
          </TabsTrigger>
          <TabsTrigger value="checklist" className="gap-1.5">
            <ClipboardCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Checklist de soumission</span>
            <span className="sm:hidden">Checklist</span>
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Guide IMRaD ── */}
        <TabsContent value="imrad" className="mt-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground mb-2">
              La structure IMRaD (Introduction, Méthodologie, Résultats, Discussion) est le format standard
              pour la plupart des articles scientifiques. Explorez chaque section pour des conseils détaillés.
            </p>
            <Accordion type="multiple" className="w-full">
              {IMRAD_SECTIONS.map((section) => (
                <AccordionItem key={section.id} value={section.id}>
                  <AccordionTrigger className="text-base">
                    <span className="flex items-center gap-2">
                      {section.icon}
                      {section.title}
                      <Badge variant="secondary" className="ml-2 text-xs font-normal">
                        {section.badge}
                      </Badge>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-2">
                      {section.cards.map((card, ci) => (
                        <Card key={ci} className="border shadow-none">
                          <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm font-semibold">{card.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <ul className="space-y-2">
                              {card.items.map((item, ii) => (
                                <li key={ii} className="flex gap-2 text-sm text-muted-foreground">
                                  <ArrowRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary/60" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </TabsContent>

        {/* ── Tab 2: Boîte à outils ── */}
        <TabsContent value="outils" className="mt-4">
          <p className="text-sm text-muted-foreground mb-4">
            Conseils pratiques pour chaque étape clé de la rédaction d'un article scientifique.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {WRITING_TOOLS.map((tool, i) => (
              <Card key={i} className="shadow-none">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    {tool.icon}
                    {tool.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <ul className="space-y-2">
                    {tool.tips.map((tip, ti) => (
                      <li key={ti} className="flex gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary/60" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── Tab 3: Checklist de soumission ── */}
        <TabsContent value="checklist" className="mt-4">
          <div className="flex flex-col gap-4">
            {/* Progress header */}
            <Card className="shadow-none">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium">Progression de la soumission</span>
                    <span className="text-sm text-muted-foreground">
                      {checkedCount} / {totalItems} items vérifiés
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </div>
                <Badge variant={progressPercent === 100 ? "default" : "secondary"} className="shrink-0">
                  {progressPercent === 100 ? "Prêt à soumettre" : `${progressPercent} %`}
                </Badge>
              </CardContent>
            </Card>

            {/* Categories grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              {CHECKLIST_CATEGORIES.map((category) => {
                const catChecked = category.items.filter((_, i) => isItemChecked(category.id, i)).length;
                return (
                  <Card key={category.id} className="shadow-none">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-semibold flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          {category.icon}
                          {category.title}
                        </span>
                        <Badge variant="outline" className="text-xs font-normal">
                          {catChecked}/{category.items.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="space-y-3">
                        {category.items.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <Checkbox
                              id={`${category.id}-${idx}`}
                              checked={isItemChecked(category.id, idx)}
                              onCheckedChange={() => toggleItem(category.id, idx)}
                              className="mt-0.5"
                            />
                            <Label
                              htmlFor={`${category.id}-${idx}`}
                              className={`text-sm leading-snug cursor-pointer transition-colors ${
                                isItemChecked(category.id, idx)
                                  ? "line-through text-muted-foreground"
                                  : "text-foreground"
                              }`}
                            >
                              {item}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
