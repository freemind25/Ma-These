"use client";

import { useState } from "react";
import { FlaskConical } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

/* ═══════════════════════════════════════
   Data — Paradigmes de recherche
   ═══════════════════════════════════════ */

const PARADIGMS = [
  {
    title: "Qualitatif",
    badge: "Interprétatif",
    description:
      "Explore les significations, les expériences et les perceptions des individus dans leur contexte naturel.",
    strengths: [
      "Profondeur de compréhension des phénomènes",
      "Flexibilité et adaptabilité du protocole",
      "Richesse des données contextuelles",
    ],
    weaknesses: [
      "Difficulté de généralisation",
      "Subjectivité du chercheur",
      "Temps de collecte et d'analyse important",
    ],
    examples: "Études de cas, entretiens semi-directifs, observations participantes, analyse de discours",
  },
  {
    title: "Quantitatif",
    badge: "Positiviste",
    description:
      "Mesure et quantifie les phénomènes à l'aide de données numériques et de méthodes statistiques.",
    strengths: [
      "Reproductibilité et objectivité",
      "Généralisation par inférence statistique",
      "Mesure précise des variables",
    ],
    weaknesses: [
      "Réductionnisme des phénomènes complexes",
      "Déconnexion avec le contexte vécu",
      "Dépendance aux instruments de mesure",
    ],
    examples: "Sondages, expérimentations, analyses longitudinales, modélisation statistique",
  },
  {
    title: "Mixte",
    badge: "Pragmatiste",
    description:
      "Combine les approches qualitatives et quantitatives pour une compréhension plus complète du phénomène étudié.",
    strengths: [
      "Triangulation des résultats",
      "Complémentarité des perspectives",
      "Robustesse méthodologique renforcée",
    ],
    weaknesses: [
      "Complexité de conception et de mise en œuvre",
      "Exigences compétences multiples du chercheur",
      "Volume de données important à traiter",
    ],
    examples: "Design séquentiel explicatif, design convergent parallèle, design exploratoire séquentiel",
  },
];

/* ═══════════════════════════════════════
   Data — Démarche méthodologique (steps)
   ═══════════════════════════════════════ */

const METHODOLOGY_STEPS = [
  {
    number: 1,
    title: "Problématique",
    description:
      "Formuler la question de recherche de manière précise et circonscrite. Identifier les enjeux théoriques et pratiques.",
  },
  {
    number: 2,
    title: "Revue de littérature",
    description:
      "Recenser, analyser et synthétiser les travaux existants sur le sujet. Identifier les lacunes et les perspectives.",
  },
  {
    number: 3,
    title: "Cadre théorique",
    description:
      "Définir les concepts clés, les théories de référence et le modèle conceptuel qui guideront la recherche.",
  },
  {
    number: 4,
    title: "Collecte de données",
    description:
      "Concevoir les instruments, définir l'échantillon et procéder à la collecte selon le protocole établi.",
  },
  {
    number: 5,
    title: "Analyse des données",
    description:
      "Traiter, coder et interpréter les données recueillies à l'aide des méthodes d'analyse choisies.",
  },
  {
    number: 6,
    title: "Discussion",
    description:
      "Mettre en perspective les résultats avec la littérature, discuter les implications et les limites.",
  },
  {
    number: 7,
    title: "Conclusion",
    description:
      "Synthétiser les apports, répondre à la problématique, ouvrir de nouvelles perspectives de recherche.",
  },
];

/* ═══════════════════════════════════════
   Data — Outils de collecte
   ═══════════════════════════════════════ */

import {
  MessageSquare,
  ClipboardList,
  Eye,
  FileSearch,
  Lightbulb,
} from "lucide-react";

const COLLECTION_TOOLS = [
  {
    icon: MessageSquare,
    title: "Entretiens",
    description:
      "Échanges approfondis avec les participants permettant d'explorer leurs représentations, expériences et points de vue.",
    tips: [
      "Préparer un guide d'entretien semi-structuré",
      "Enregistrer (avec consentement) et retranscrire fidèlement",
      "Privilégier un cadre propice et confidentiel",
    ],
  },
  {
    icon: ClipboardList,
    title: "Questionnaires",
    description:
      "Outils standardisés pour recueillir des données auprès d'un grand nombre de répondants de manière structurée.",
    tips: [
      "Pré-tester le questionnaire sur un échantillon réduit",
      "Alterner questions fermées et ouvertes",
      "Garantir l'anonymat et le consentement éclairé",
    ],
  },
  {
    icon: Eye,
    title: "Observation",
    description:
      "Immersion directe dans le terrain pour recueillir des données comportementales et contextuelles en temps réel.",
    tips: [
      "Définir une grille d'observation précise",
      "Maintenir une distance réflexive constante",
      "Prendre des notes de terrain systématiques",
    ],
  },
  {
    icon: FileSearch,
    title: "Analyse documentaire",
    description:
      "Exploitation systématique de documents existants (archives, rapports, publications, corpus textuels) comme source de données.",
    tips: [
      "Définir des critères d'inclusion et d'exclusion clairs",
      "Utiliser une grille d'analyse codifiée",
      "Croiser les sources pour trianguler les informations",
    ],
  },
];

/* ═══════════════════════════════════════
   Data — Techniques d'analyse
   ═══════════════════════════════════════ */

const ANALYSIS_TECHNIQUES = [
  {
    title: "Analyse thématique",
    badge: "Qualitatif",
    description:
      "Identification, analyse et report des thèmes récurrents dans les données qualitatives. Méthode flexible applicable à divers cadres théoriques.",
    details: "Six phases : familiarisation → codage initial → recherche de thèmes → révision → définition → rédaction.",
  },
  {
    title: "Analyse de contenu",
    badge: "Qualitatif",
    description:
      "Analyse systématique et objective du contenu des communications pour en inférer des significations et des catégories.",
    details: "Peut être quantitative (fréquence des unités) ou qualitative (signification latente).",
  },
  {
    title: "Analyse statistique",
    badge: "Quantitatif",
    description:
      "Application de méthodes statistiques descriptives et inférentielles pour résumer, modéliser et tester les données numériques.",
    details: "Includes : tests d'hypothèses, régressions, analyses factorielles, modèles mixtes.",
  },
  {
    title: "Grounded Theory",
    badge: "Qualitatif",
    description:
      "Approche inductive visant à faire émerger une théorie ancrée dans les données, sans a priori théorique. Codage itératif et comparaison constante.",
    details: "Processus itératif : codage ouvert → codage axial → codage sélectif → théorisation saturée.",
  },
];

/* ═══════════════════════════════════════
   Data — Checklist
   ═══════════════════════════════════════ */

const CHECKLIST_ITEMS = [
  "Problématique formulée clairement",
  "Revue de littérature exhaustive",
  "Cadre théorique défini",
  "Hypothèses ou questions de recherche explicitées",
  "Méthode de collecte choisie et justifiée",
  "Échantillon défini avec critères d'inclusion",
  "Instruments de collecte validés",
  "Méthode d'analyse des données précisée",
  "Considérations éthiques adressées",
  "Calendrier de recherche établi",
];

/* ═══════════════════════════════════════
   Component
   ═══════════════════════════════════════ */

export function MethodologyPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggleCheck = (item: string) => {
    setChecked((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  const checkedCount = CHECKLIST_ITEMS.filter((item) => checked[item]).length;
  const progressPercent = Math.round(
    (checkedCount / CHECKLIST_ITEMS.length) * 100
  );

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto w-full">
      {/* ─── Header ─── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <FlaskConical className="h-6 w-6 text-primary" />
          Méthodologie de recherche
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Guide complet des approches, outils et bonnes pratiques méthodologiques
          pour votre thèse de doctorat
        </p>
      </div>

      <Separator />

      {/* ─── Accordion ─── */}
      <Accordion
        type="multiple"
        defaultValue={["paradigms"]}
        className="flex flex-col gap-4"
      >
        {/* ═══ 1. Paradigmes de recherche ═══ */}
        <AccordionItem value="paradigms" className="border rounded-lg px-4">
          <AccordionTrigger className="text-base font-semibold hover:no-underline">
            Paradigmes de recherche
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground mb-4">
              Chaque paradigme repose sur des épistémologies distinctes. Le choix
              du paradigme détermine la nature des données et les méthodes
              d'analyse.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PARADIGMS.map((p) => (
                <Card key={p.title} className="flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{p.title}</CardTitle>
                      <Badge variant="secondary" className="text-[10px]">
                        {p.badge}
                      </Badge>
                    </div>
                    <CardDescription>{p.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3 flex-1">
                    <div>
                      <p className="text-xs font-medium mb-1.5 text-chart-1">
                        Forces
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {p.strengths.map((s) => (
                          <li key={s} className="flex items-start gap-1.5">
                            <span className="text-chart-1 mt-0.5">+</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-medium mb-1.5 text-chart-4">
                        Limites
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {p.weaknesses.map((w) => (
                          <li key={w} className="flex items-start gap-1.5">
                            <span className="text-chart-4 mt-0.5">−</span>
                            {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Separator />
                    <p className="text-[11px] text-muted-foreground">
                      <span className="font-medium">Ex :</span> {p.examples}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ═══ 2. Démarche méthodologique ═══ */}
        <AccordionItem value="steps" className="border rounded-lg px-4">
          <AccordionTrigger className="text-base font-semibold hover:no-underline">
            Démarche méthodologique
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground mb-6">
              Les étapes clés de la recherche doctorale, de la formulation du
              problème à la rédaction de la conclusion.
            </p>
            <div className="relative pl-8">
              {/* Vertical line */}
              <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />

              <div className="flex flex-col gap-6">
                {METHODOLOGY_STEPS.map((step) => (
                  <div key={step.number} className="relative flex gap-4">
                    {/* Step circle */}
                    <div className="absolute -left-8 top-0 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold z-10">
                      {step.number}
                    </div>
                    <Card className="flex-1">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{step.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">
                          {step.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ═══ 3. Outils de collecte ═══ */}
        <AccordionItem value="tools" className="border rounded-lg px-4">
          <AccordionTrigger className="text-base font-semibold hover:no-underline">
            Outils de collecte
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground mb-4">
              Les principaux instruments de collecte de données, chacun adapté à
              des objectifs de recherche spécifiques.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {COLLECTION_TOOLS.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Card key={tool.title}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" />
                        {tool.title}
                      </CardTitle>
                      <CardDescription>{tool.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start gap-2 mb-2">
                        <Lightbulb className="h-3.5 w-3.5 text-chart-2 mt-0.5 shrink-0" />
                        <p className="text-xs font-medium text-chart-2">
                          Conseils
                        </p>
                      </div>
                      <ul className="text-xs text-muted-foreground space-y-1.5 pl-5">
                        {tool.tips.map((tip) => (
                          <li key={tip} className="flex items-start gap-1.5">
                            <span className="text-chart-2 mt-1 h-1 w-1 rounded-full bg-current shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ═══ 4. Techniques d'analyse ═══ */}
        <AccordionItem value="analysis" className="border rounded-lg px-4">
          <AccordionTrigger className="text-base font-semibold hover:no-underline">
            Techniques d'analyse
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground mb-4">
              Les méthodes d'analyse couramment utilisées en recherche, selon la
              nature des données recueillies.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ANALYSIS_TECHNIQUES.map((tech) => (
                <Card key={tech.title}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{tech.title}</CardTitle>
                      <Badge variant="outline" className="text-[10px]">
                        {tech.badge}
                      </Badge>
                    </div>
                    <CardDescription>{tech.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[11px] text-muted-foreground">
                      <span className="font-medium">En détail :</span>{" "}
                      {tech.details}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ═══ 5. Checklist méthodologique ═══ */}
        <AccordionItem value="checklist" className="border rounded-lg px-4">
          <AccordionTrigger className="text-base font-semibold hover:no-underline">
            Checklist méthodologique
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Vérifiez que votre démarche méthodologique couvre l'ensemble des
                éléments essentiels avant de débuter votre recherche.
              </p>

              {/* Progress */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Progression de la checklist
                  </span>
                  <span className="font-medium">
                    {checkedCount} / {CHECKLIST_ITEMS.length} — {progressPercent}%
                  </span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>

              <Separator />

              {/* Checklist items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CHECKLIST_ITEMS.map((item) => (
                  <label
                    key={item}
                    className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors hover:bg-accent has-[data-state=checked]:bg-chart-1/5 has-[data-state=checked]:border-chart-1/30"
                  >
                    <Checkbox
                      checked={checked[item] || false}
                      onCheckedChange={() => toggleCheck(item)}
                    />
                    <span className="text-sm leading-tight">{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
