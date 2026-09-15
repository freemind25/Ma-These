"use client";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe, Search, ExternalLink } from "lucide-react";
import { useState, useMemo } from "react";

interface Database {
  name: string;
  url: string;
  description: string;
  category: string;
  accessType: "Gratuit" | "Abonnement" | "Open Access";
  country: string;
}

const DATABASES: Database[] = [
  // Archives ouvertes
  {
    name: "HAL",
    url: "https://hal.science",
    description:
      "Archive ouverte pluridisciplinaire française pour le dépôt et la diffusion de publications scientifiques.",
    category: "Archives ouvertes",
    accessType: "Gratuit",
    country: "France",
  },
  {
    name: "arXiv",
    url: "https://arxiv.org",
    description:
      "Archive ouverte de prépublications en physique, mathématiques, informatique et biologie quantitative.",
    category: "Archives ouvertes",
    accessType: "Open Access",
    country: "International",
  },
  {
    name: "PubMed Central",
    url: "https://www.ncbi.nlm.nih.gov/pmc",
    description:
      "Archive d'articles en libre accès dans le domaine des sciences biomédicales et de la vie.",
    category: "Archives ouvertes",
    accessType: "Open Access",
    country: "États-Unis",
  },
  {
    name: "SSRN",
    url: "https://www.ssrn.com",
    description:
      "Réseau de recherche en sciences sociales proposant des prépublications et working papers en ligne.",
    category: "Archives ouvertes",
    accessType: "Gratuit",
    country: "États-Unis",
  },
  {
    name: "OpenAlex",
    url: "https://openalex.org",
    description:
      "Catalogue ouvert de la recherche mondiale offrant des métadonnées et des liens entre auteurs, publications et institutions.",
    category: "Archives ouvertes",
    accessType: "Open Access",
    country: "International",
  },

  // Moteurs de recherche
  {
    name: "Google Scholar",
    url: "https://scholar.google.com",
    description:
      "Moteur de recherche généraliste pour la littérature académique, couvrant toutes les disciplines.",
    category: "Moteurs de recherche",
    accessType: "Gratuit",
    country: "International",
  },
  {
    name: "Semantic Scholar",
    url: "https://www.semanticscholar.org",
    description:
      "Moteur de recherche académique propulsé par l'IA, développé par l'Allen Institute for AI.",
    category: "Moteurs de recherche",
    accessType: "Gratuit",
    country: "États-Unis",
  },
  {
    name: "BASE",
    url: "https://www.base-search.net",
    description:
      "Moteur de recherche Bielefeld Academic Search Engine indexant des documents académiques en accès ouvert.",
    category: "Moteurs de recherche",
    accessType: "Gratuit",
    country: "Allemagne",
  },
  {
    name: "Dimensions",
    url: "https://app.dimensions.ai",
    description:
      "Plateforme de recherche liant publications, subventions, brevets et essais cliniques.",
    category: "Moteurs de recherche",
    accessType: "Gratuit",
    country: "Royaume-Uni",
  },

  // Éditeurs & Bases
  {
    name: "Elsevier / ScienceDirect",
    url: "https://www.sciencedirect.com",
    description:
      "Plus grande plateforme d'édition scientifique proposant des articles de revues et des ouvrages de référence.",
    category: "Éditeurs & Bases",
    accessType: "Abonnement",
    country: "Pays-Bas",
  },
  {
    name: "Springer",
    url: "https://link.springer.com",
    description:
      "Éditeur majeur en sciences, technologie, médecine et sciences humaines et sociales.",
    category: "Éditeurs & Bases",
    accessType: "Abonnement",
    country: "Allemagne",
  },
  {
    name: "Wiley",
    url: "https://onlinelibrary.wiley.com",
    description:
      "Éditeur scientifique proposant des revues, livres et bases de données en sciences et sciences humaines.",
    category: "Éditeurs & Bases",
    accessType: "Abonnement",
    country: "États-Unis",
  },
  {
    name: "Taylor & Francis",
    url: "https://www.tandfonline.com",
    description:
      "Éditeur académique couvrant les sciences sociales, les humanités et les sciences techniques.",
    category: "Éditeurs & Bases",
    accessType: "Abonnement",
    country: "Royaume-Uni",
  },
  {
    name: "Sage",
    url: "https://journals.sagepub.com",
    description:
      "Éditeur indépendant de revues en sciences sociales, méthodologie et médecine.",
    category: "Éditeurs & Bases",
    accessType: "Abonnement",
    country: "États-Unis",
  },
  {
    name: "IEEE Xplore",
    url: "https://ieeexplore.ieee.org",
    description:
      "Bibliothèque numérique de l'IEEE couvrant l'ingénierie, l'informatique et les technologies.",
    category: "Éditeurs & Bases",
    accessType: "Abonnement",
    country: "États-Unis",
  },
  {
    name: "ACM Digital Library",
    url: "https://dl.acm.org",
    description:
      "Bibliothèque numérique de l'ACM pour l'informatique et les sciences de l'information.",
    category: "Éditeurs & Bases",
    accessType: "Abonnement",
    country: "États-Unis",
  },

  // Bibliothèques numériques
  {
    name: "CAIRN",
    url: "https://www.cairn.info",
    description:
      "Plateforme francophone de publications en sciences humaines et sociales : revues, livres et magazines.",
    category: "Bibliothèques numériques",
    accessType: "Abonnement",
    country: "France",
  },
  {
    name: "Persée",
    url: "https://www.persee.fr",
    description:
      "Portail de revues scientifiques françaises en sciences humaines et sociales, en accès libre.",
    category: "Bibliothèques numériques",
    accessType: "Gratuit",
    country: "France",
  },
  {
    name: "JSTOR",
    url: "https://www.jstor.org",
    description:
      "Bibliothèque numérique interdisciplinaire offrant l'accès à des milliers de revues académiques et de livres.",
    category: "Bibliothèques numériques",
    accessType: "Abonnement",
    country: "États-Unis",
  },
  {
    name: "Project MUSE",
    url: "https://muse.jhu.edu",
    description:
      "Bibliothèque numérique spécialisée en sciences humaines et sociales avec un accent sur les revues universitaires.",
    category: "Bibliothèques numériques",
    accessType: "Abonnement",
    country: "États-Unis",
  },
  {
    name: "ERIC",
    url: "https://eric.ed.gov",
    description:
      "Base de données de l'Institute of Education Sciences dédiée à la littérature en sciences de l'éducation.",
    category: "Bibliothèques numériques",
    accessType: "Gratuit",
    country: "États-Unis",
  },

  // Outils spécialisés
  {
    name: "Scopus",
    url: "https://www.scopus.com",
    description:
      "Base de données bibliographique multidisciplinaire de Elsevier avec indicateurs de citation.",
    category: "Outils spécialisés",
    accessType: "Abonnement",
    country: "Pays-Bas",
  },
  {
    name: "Web of Science",
    url: "https://www.webofscience.com",
    description:
      "Plateforme d'indexation et de citation de Clarivate Analytics couvrant plus de 21 000 revues.",
    category: "Outils spécialisés",
    accessType: "Abonnement",
    country: "États-Unis",
  },
  {
    name: "DBLP",
    url: "https://dblp.org",
    description:
      "Bibliographie en informatique indexant articles de conférences, thèses et rapports techniques.",
    category: "Outils spécialisés",
    accessType: "Gratuit",
    country: "Allemagne",
  },
  {
    name: "MathSciNet",
    url: "https://mathscinet.ams.org",
    description:
      "Base de données de l'American Mathematical Society couvrant la littérature en mathématiques.",
    category: "Outils spécialisés",
    accessType: "Abonnement",
    country: "États-Unis",
  },
  {
    name: "zbMATH",
    url: "https://zbmath.org",
    description:
      "Portail de référence international pour les mathématiques et l'informatique théorique.",
    category: "Outils spécialisés",
    accessType: "Abonnement",
    country: "Allemagne",
  },
  {
    name: "IngentaConnect",
    url: "https://www.ingentaconnect.com",
    description:
    "Plateforme de recherche donnant accès à des milliers de publications académiques en sciences et humanités.",
    category: "Outils spécialisés",
    accessType: "Abonnement",
    country: "Royaume-Uni",
  },
];

const CATEGORIES = [
  "Archives ouvertes",
  "Moteurs de recherche",
  "Éditeurs & Bases",
  "Bibliothèques numériques",
  "Outils spécialisés",
];

const ACCESS_COLORS: Record<Database["accessType"], string> = {
  Gratuit: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  Abonnement: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  "Open Access": "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
};

export function AcademicDbPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return DATABASES.filter((db) => {
      const matchesSearch =
        search === "" ||
        db.name.toLowerCase().includes(search.toLowerCase()) ||
        db.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || db.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [search, categoryFilter]);

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Globe className="h-6 w-6 text-primary" />
          Bases de données académiques
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ressources en ligne pour la recherche
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une base de données..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-auto min-w-[200px]">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        {filtered.length} base{filtered.length !== 1 ? "s" : ""} de données affichée{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Database grid by category */}
      {filtered.length > 0 ? (
        <div className="flex flex-col gap-8">
          {CATEGORIES.map((cat) => {
            const catDbs = filtered.filter((db) => db.category === cat);
            if (catDbs.length === 0) return null;
            return (
              <section key={cat}>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {cat}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {catDbs.map((db) => (
                    <DatabaseCard key={db.name} db={db} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Globe className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <h3 className="text-sm font-medium">Aucun résultat</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Aucune base de données ne correspond à votre recherche
          </p>
        </div>
      )}
    </div>
  );
}

function DatabaseCard({ db }: { db: Database }) {
  return (
    <div className="rounded-lg border p-4 hover:bg-muted/50 transition-colors flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-bold leading-tight">{db.name}</h3>
        <span className="text-[10px] text-muted-foreground whitespace-nowrap mt-0.5">
          {db.country}
        </span>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
        {db.description}
      </p>

      <div className="flex flex-wrap items-center gap-2 mt-auto">
        <Badge variant="secondary" className="text-[10px]">
          {db.category}
        </Badge>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${ACCESS_COLORS[db.accessType]}`}
        >
          {db.accessType}
        </span>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full gap-2 text-xs mt-1"
        asChild
      >
        <a href={db.url} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="h-3.5 w-3.5" />
          Visiter
        </a>
      </Button>
    </div>
  );
}
