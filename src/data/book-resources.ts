// ═══════════════════════════════════════
// ThesisFrame — Ressources bibliothèque (Books)
// ═══════════════════════════════════════

export interface BookResource {
  id: string;
  title: string;
  authors: string;
  year: number;
  edition?: string;
  description: string;
  coverSrc: string;
  pdfSrc: string;
  pages?: number;
  fileSize: string;
  category: BookCategory;
  tags: string[];
  isbn?: string;
  publisher?: string;
}

export type BookCategory = "supervision" | "methodology" | "writing" | "phd-guide";

export interface BookCategoryInfo {
  id: BookCategory | "all";
  label: string;
  description: string;
}

export const BOOK_CATEGORIES: BookCategoryInfo[] = [
  { id: "all", label: "Tous les ouvrages", description: "L'intégralité de la bibliothèque" },
  { id: "supervision", label: "Supervision", description: "Guide du superviseur et relations directeur-doctorant" },
  { id: "methodology", label: "Méthodologie", description: "Construction de la problématique et questions de recherche" },
  { id: "writing", label: "Rédaction", description: "Normes de rédaction, styles et mise en forme académique" },
  { id: "phd-guide", label: "Guide du doctorant", description: "Conseils pratiques pour réussir sa thèse" },
];

export const BOOK_RESOURCES: BookResource[] = [
  {
    id: "good-supervisor",
    title: "The Good Supervisor",
    authors: "Gina Wisker",
    year: 2012,
    edition: "2nd Edition",
    description:
      "Guide complet de la supervision de recherche postgraduate et undergraduate. Couvre les compétences clés du bon superviseur : communication, feedback constructif, gestion de la relation directeur-doctorant, accompagnement à travers les difficultés, et développement professionnel du superviseur.",
    coverSrc: "/resources/books/cover-good-supervisor.png",
    pdfSrc: "/resources/books/The Good Supervisor Supervising Postgraduate and Undergraduate Research for Doctoral Theses and Dissertations (Wisker, Gina) (z-library.sk, 1lib.sk, z-lib.sk).pdf",
    pages: 304,
    fileSize: "53 MB",
    category: "supervision",
    tags: ["supervision", "feedback", "mentorat", "communication", "HDR"],
    publisher: "Palgrave Macmillan",
    isbn: "978-0230369267",
  },
  {
    id: "doctoral-supervisors",
    title: "A Handbook for Doctoral Supervisors",
    authors: "Stan Taylor, Margaret Kiley",
    year: 2018,
    edition: "3rd Edition",
    description:
      "Manuel de référence pour les superviseurs de thèses doctorales. Aborde les défis contemporains de la supervision : encadrement de doctorants internationaux, supervision à distance, éthique de la recherche, gestion des comités de thèse, et préparation à la soutenance.",
    coverSrc: "/resources/books/cover-doctoral-supervisors.png",
    pdfSrc: "/resources/books/A Handbook for Doctoral Supervisors (Thrd Edition) (Stan Taylor, Margaret Kiley) (z-library.sk, 1lib.sk, z-lib.sk).pdf",
    pages: 256,
    fileSize: "4.8 MB",
    category: "supervision",
    tags: ["supervision", "doctorat", "éthique", "soutenance", "international"],
    publisher: "Routledge",
    isbn: "978-1138568066",
  },
  {
    id: "turabian-manual",
    title: "A Manual for Writers of Term Papers, Theses, and Dissertations",
    authors: "Kate L. Turabian",
    year: 2018,
    edition: "9th Edition",
    description:
      "L'ouvrage de référence absolu pour la rédaction académique en style Chicago. Couvre la structure des documents académiques, les normes de citation (notes de bas de page et bibliographie), la présentation des tableaux et figures, les abréviations, et les exigences éditoriales des thèses.",
    coverSrc: "/resources/books/cover-turabian.png",
    pdfSrc: "/resources/books/A Manual for Writers of Term Papers, Theses, and Dissertations (Kate L. Turabian) (z-library.sk, 1lib.sk, z-lib.sk).pdf",
    pages: 416,
    fileSize: "4.3 MB",
    category: "writing",
    tags: ["rédaction", "Chicago style", "citations", "bibliographie", "normes"],
    publisher: "University of Chicago Press",
    isbn: "978-0226494939",
  },
  {
    id: "research-questions",
    title: "Constructing Research Questions: Doing Interesting Research",
    authors: "Mats Alvesson, Jörgen Sandberg",
    year: 2013,
    edition: "1st Edition",
    description:
      "Guide méthodologique pour formuler des questions de recherche originales et fécondes. Présente 5 stratégies de construction : gap-spotting, problématization, analogy, contextualization et critique. Illustre comment transformer une idée vague en une problématique de recherche rigoureuse et publiable.",
    coverSrc: "/resources/books/cover-research-questions.png",
    pdfSrc: "/resources/books/Constructing Research Questions Doing Interesting Research (Mats Alvesson, Jorgen Sandberg) (z-library.sk, 1lib.sk, z-lib.sk).pdf",
    pages: 176,
    fileSize: "4.4 MB",
    category: "methodology",
    tags: ["problématique", "questions de recherche", "gap-spotting", "méthodologie", "originalité"],
    publisher: "SAGE Publications",
    isbn: "978-1446256003",
  },
  {
    id: "how-to-phd",
    title: "How to Get a PhD",
    authors: "Estelle Phillips, Derek S. Pugh",
    year: 2015,
    edition: "4th Edition",
    description:
      "Le guide pratique incontournable pour les doctorants. Couvre l'ensemble du parcours doctoral : choix du sujet et du directeur, gestion du temps, rédaction de la thèse, préparation à la soutenance, gestion du stress, publication d'articles, et planification de carrière après le doctorat.",
    coverSrc: "/resources/books/cover-how-to-phd.png",
    pdfSrc: "/resources/books/How to Get a PhD - 4th edition (Study Skills) (Estelle Phillips, Derek.S. Pugh) (z-library.sk, 1lib.md, z-lib.sk).pdf",
    pages: 280,
    fileSize: "779 KB",
    category: "phd-guide",
    tags: ["doctorat", "soutenance", "rédaction", "gestion du temps", "carrière"],
    publisher: "Open University Press",
    isbn: "978-0335263250",
  },
];
