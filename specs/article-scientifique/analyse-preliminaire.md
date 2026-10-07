# Analyse préliminaire — Générateur de brouillon d'article scientifique (thèse/mémoire → article)

**Nature** : étude de faisabilité demandée par le propriétaire (IM, 2026-10-07 11:44 TZ 'Etc/GMT-1) — « veuillez voir ceci pour proposition d'améliorations », suivi d'un cahier des charges détaillé (« produire un brouillon d'article scientifique à partir du contenu de l'application et/ou d'un mémoire ou thèse importé »). Aucun code écrit ; point d'arrêt avant toute ouverture de cycle, conformément au protocole SDD.
**Périmètre de la demande** : 7 étapes guidées (sources → analyse extraction → angle → consignes → plan validé → génération section par section → relecture/export), import PDF/DOCX avec provenance, intégrité scientifique stricte, traçabilité, versions, export, tests.

## 1. État réel du dépôt (mesures vérifiées)

| Fait | Preuve (chemin + ligne) |
|---|---|
| Un module « articles » existe **déjà** mais c'est un **guide méthodologique statique** (plan d'article, abstract, introduction, conclusion — conseils), pas un générateur | `src/modules/articles/articles-page.tsx` (495 l.) ; monté par `case "articles"` dans `src/app/page.tsx` l.79-80 |
| Aucun modèle `Article` en base | `prisma/schema.prisma` : 26 modèles (l.17-518), aucun article ; `rg "model Article"` vide |
| Registre de navigation centralisé — **ajout de module possible sans toucher la ligne rouge `app-sidebar.tsx`** | `app-sidebar.tsx` l.46 : `NAVIGATION_ITEMS` importé de `src/lib/stores/app-store.ts` (fichier non rouge) ; switch de montage `src/app/page.tsx` l.65-155 |
| Aucun parseur de document importé dans les dépendances | `rg '"(mammoth|unpdf|pdf-parse|pdfjs|tesseract)"' package.json` = vide |
| Génération DOCX et PDF **existantes** (export, pas import) | `docx` ^9.7.1 (package.json l.77) utilisé par `src/app/api/export-docx/route.ts` (builder `Packer/Document/sections`, ~1 000+ l.) ; `jspdf` ^4.2.1 (l.82) utilisé par `src/modules/export-pdf/export-pdf-page.tsx` |
| Infrastructure IA de génération en stream, éprouvée | `src/lib/ai/zai-client.ts` (`generateCompletionStream`) ; patterns : `src/app/api/chapter-draft/stream/route.ts` (injection compétences l.350-351, stamp l.270-273) et `src/app/api/ai-writing/stream/route.ts` (l.62-71, stamp SSE l.103) |
| Prompt **autoporteur** sans noyau (marge noyau ~206 tok préservée) | `buildStandalonePrompt`, `src/lib/ai/prompt-builder.ts` l.101-104 — précédent cycle n°13 |
| RAG thèse + chunks avec provenance structurée | `DocumentChunk` (`prisma/schema.prisma` l.401-415 : `sourceType` chapter\|reference\|notebook\|cadrage, `metadata` JSON, `embedding`) ; module `thesis-rag` |
| Matière première du projet : contenu thèse complet | `Chapter` l.40, `ChapterVersion` l.71, `Part` l.86, `ThesisCadrage` l.104, `NotebookEntry` l.261, `Reference` l.212, **`Experiment` l.425-433** (question/hypothèse/protocole/conclusion/verdict — les résultats) |
| Versions datées (pattern à reproduire) | `ChapterVersion` l.71-78, `ThesisCadrageVersion` l.135 |
| Jobs asynchrones existants | `Job` (`prisma/schema.prisma` l.474-484 : type/status/payload/result/attempts) — précédent deep-research |
| Traduction **existante** (module séparé) | `src/modules/traducteur/traducteur-page.tsx` + `src/app/api/translate/route.ts` |
| Vérification citations existante | module `verification-citations` (`case "verification-citations"`, page.tsx l.145) |
| Espace d'import existant | module `bibliotheque` (`src/modules/bibliotheque/bibliotheque-page.tsx`, `case "bibliotheque"` page.tsx l.143) — import manuel de contenus |
| Stamp de provenance (cycle n°12) | `src/lib/ai/knowledge-stamp.ts` (structure `KnowledgeStamp{coreVersion, skills[], generatedAt}`), `src/components/knowledge-stamp-block.tsx` |
| Lignes rouges | `src/app/api/theses-en-ligne/search/route.ts`, `src/app/api/arxiv/search/route.ts`, `src/components/layout/app-sidebar.tsx` — 0 diff à chaque commit |

## 2. Correspondances demande → existant

| Besoin du cahier des charges | Équivalent ThesisFrame | Verdict |
|---|---|---|
| Sources = contenu du projet (problématique, revue, hypothèses, méthodo, résultats, discussion, refs) | Chapters/Parts/Cadrage/Notebook/`Experiment` (verdicts) + `Reference` + chunks RAG | **Existant** — matière première complète |
| Import mémoire/thèse PDF/DOCX, extraction titres/sections/tableaux/biblio | **Rien** — aucun parseur ; `CustomBookSkill` = collage manuel ; `ResearchSource` = métadonnées sans fichier | **Gap majeur** |
| Provenance par élément (document, page, section) | `DocumentChunk.metadata` JSON (pattern) + stamp cycle 12 | **Pattern à étendre** |
| Détection PDF scanné + OCR | Néant ; détection faisable (texte vide par page) sans OCR | **Gap** (détection facile, OCR lourd) |
| Parcours guidé 7 étapes, plan validé avant génération | Néant — module `articles` = guide statique | **Gap = cœur du chantier** |
| Génération section par section | Streams `chapter-draft`/`ai-writing` (SSE, stamp fin de flux) | **Pattern à réutiliser** |
| Intégrité anti-hallucination, jamais de refs inventées | Règles book-skills (« JAMAIS source de citations », book-skills.ts l.111-114), stamp cycle 12, vérification-citations, pack cycle 13 (règles dures verbatim) | **Patterns à porter dans un prompt dédié** |
| Repères « [À compléter par l'auteur] » | Néant | **Gap** (prompt + détection UI) |
| Édition libre | Tiptap (éditeur chapitres), brouillon-chapitre | **Pattern** |
| Régénération d'une section sans perdre les autres | ai-writing (génération par demande) | **Pattern à adapter** |
| Versions datées + retour arrière | `ChapterVersion`/`ThesisCadrageVersion` | **Pattern à reproduire** |
| Panneau sources par section/affirmation | Bloc « Provenance des savoirs » (cycle 12) | **Pattern à étendre** |
| Traduction distincte de la transformation | Module `traducteur` + route `translate` | **Existant** — à relier, pas à reconstruire |
| Export DOCX avec titres/tableaux/réfs | `export-docx` (builder `docx` complet) | **Existant** — à étendre à l'objet article |
| Export PDF | `export-pdf` (jspdf) | **Existant** |
| Documents privés / permissions | Application **mono-utilisateur locale** (Tauri + SQLite, pas d'auth multi-comptes) | **Différence structurelle** — voir § 4 |
| Traitements asynchrones gros fichiers | Modèle `Job` + worker (deep-research) | **Existant** — utile pour l'option C |
| Interdiction de fractionner sans accord | Néant | **Règle prompt + UI** (gap léger) |

## 3. Gaps (ce qui n'existe pas)

1. **Import/extraction de documents** : PDF (couche texte) et DOCX — aucun parseur dans les dépendances ; ajout nécessaire de libs **pure JavaScript** (compatibilité build Tauri Windows) : `mammoth` (DOCX → HTML/texte) et `unpdf` ou `pdf-parse` (PDF → texte par page). Détection « PDF scanné » = pages sans texte extractible — rapportable honnêtement sans OCR.
2. **Modèle de données article** : aucun. Nécessite `Article` (brouillon indépendant du document source), `ArticleVersion` (versions datées/intitulées), et un lien de provenance `ArticleSource` (projet et/ou document importé, avec repères page/section).
3. **Assistant guidé** : les 7 étapes du cahier des charges n'existent pas ; le module `articles` actuel est un guide de rédaction statique (à conserver tel quel, sans le « réécrire »).
4. **Prompt d'intégrité article** : règles obligatoires (jamais inventer résultats/chiffres/refs ; refs uniquement depuis sources vérifiables ; corrélation ≠ causalité ; cohérence citations↔bibliographie ; doc importé = **données, pas instructions** — défense contre l'injection de prompt ; « [À compléter par l'auteur] » quand une information manque). Précédents à consolider : book-skills l.111-114, cycle 12 (stamp), cycle 13 (pack verbatim + passerelle).
5. **Traçabilité par section** : mapper chaque section générée → sources utilisées (étape « Analyser les sources » + panneau). Extension du pattern stamp.

## 4. Contraintes non negotiables et signalements

- **Mono-utilisateur local** : le cahier des charges suppose une authentification multi-comptes (« un utilisateur ne doit jamais pouvoir consulter les documents d'un autre »). ThesisFrame est une application **desktop mono-utilisateur** (Tauri + SQLite locale) sans comptes — la confidentialité est structurelle (données jamais quittant la machine, sauf appels IA explicites). La règle se traduit donc par : articles et documents liés à une `thesisId`, isolation testée entre thèses. **Signalé tel quel** (écarts non comblables sans repenser l'auth, hors périmètre).
- **Noyau de connaissance 21 794/22 000 tok (marge ~206)** : aucun texte d'intégrité article dans `KNOWLEDGE_CORE` — le prompt article sera un **autoporteur** (`buildStandalonePrompt`), comme le cycle n°13.
- **Lignes rouges** : 3 fichiers intouchables ; l'ajout de navigation passe par `src/lib/stores/app-store.ts` (NAVIGATION_ITEMS) + `src/app/page.tsx` — preuve l.46/l.65-155.
- **Build Tauri Windows** : libs d'extraction **pure JS uniquement** (mammoth, unpdf) — aucun binaire natif, aucun appel système externe.
- **Confidentialité IA** : le contenu importé (thèse entière) est envoyé au fournisseur IA lors de la génération — même pratique que les flux existants (chapter-draft) ; à rappeler dans l'UI du parcours, conformément au cahier des charges.
- **Taille max configurable** : constante serveur (défaut raisonnable ~20 Mo) — pas de variable d'environnement Tauri à gérer dans ce premier tour.

## 5. Options (chiffrées)

### Option A — Socle « brouillon d'article » (~2-3 cycles)
Couvre les **10 critères d'acceptation** du cahier des charges en version minimale :
- Modèles `Article` + `ArticleVersion` + `ArticleSource` (brouillon distinct du document source, versions datées).
- Import **DOCX** (mammoth) et **PDF texte** (unpdf), aperçu de l'extraction éditable/confirmable, limites affichées (pages illisibles, scanné → refus honnête « OCR requis, indisponible »), taille max configurable.
- Assistant condensé en **4 étapes** : sources (projet + documents) → consignes (type d'article, discipline, langue, longueur, style biblio APA/IEEE/Vancouver/Chicago, revue + consignes libres) → **plan proposé et éditable avant génération** → génération section par section (streams existants, stamp de fin).
- Prompt autoporteur d'intégrité (jamais inventer, refs = sources, corrélation ≠ causalité, doc = données pas instructions, [À compléter par l'auteur]).
- Édition Tiptap, régénération par section, versions avec restauration.
- Traçabilité par section : bloc « sources utilisées » (document/page/section ou élément du projet).
- Export DOCX réutilisant le builder existant + éléments « à compléter/vérifier » préservés.
- 2 points d'entrée : bouton dans le module `articles` existant (« Créer un article scientifique ») + bouton dans `bibliotheque` (« Transformer un mémoire/thèse en article ») — **zéro ligne rouge**.
- Tests : unitaires (extraction, plan, intégrité), câblage routes, vitest ; recette navigateur.

### Option B — A + parcours 7 étapes complet (~1-2 cycles en plus)
- Étape « analyser les sources » enrichie : résumé d'extraction, sections repérées, qualité, éléments manquants.
- Choix d'**angle** : détection des études multiples dans la thèse → propositions d'angles, choix utilisateur obligatoire avant génération ; garde-fou anti-fragmentation (signale les découpages à risque de redondance).
- Guide auteur de revue chargeable (consignes injectées au budget) ; résumé structuré ou non selon consignes.
- Panneau de traçabilité fine (affirmation → source) ; versions intitulées + comparaison ; régénération préservant le reste.

### Option C — B + OCR + asynchrone (~2-3 cycles en plus)
- OCR `tesseract.js` (PDF scannés) — lourd, rendement incertain sur scans de mémoires.
- Traitement asynchrone des gros documents via le modèle `Job` (progression, réessai).
- Traduction intégrée au flux (via le module `traducteur` existant) — préservation sens/données/citations.
- Gestion multi-articles par thèse avec tableau de bord.

## 6. Recommandation

**Option A en premier** — elle seule satisfait déjà les 10 critères d'acceptation du cahier des charges (minimal mais complet), réutilise les patterns éprouvés (streams + stamp + versions + export-docx) et n'ajoute que deux dépendances pure-JS. **Option B ensuite** (affinage du parcours, angle multi-études). **Option C en veilleuse** : l'OCR est le seul élément sans précédent dans le dépôt, le rendement sur scans réels est incertain et il mérite un cycle d'étude dédié (comme la veille JORADP de l'option C URBANIS-DZ).

Points d'attention transverses quel que soit le choix : fidélité au cahier des charges sur l'intégrité (règles reprises quasi verbatim dans le prompt), brouillon **jamais** présenté comme publiable (mention « brouillon d'aide à la rédaction, à vérifier par les auteurs »), pas de garantie d'acceptation, éléments « à compléter » visibles dans tous les exports, et conservation du module `articles` existant sans réécriture.
