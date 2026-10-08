# Architecture de la Gestion des Connaissances

> ThesisFrame v1.9.0 — Guide pour contributeurs (humains ou IA)
> Dernière mise à jour : 3 octobre 2026 (digestion Snyder 2019 — revues de littérature)

---

## 1. Vue d'ensemble

ThesisFrame est un outil de rédaction de thèse avec **21 modes d'écriture IA** alimentés par un **socle unique de connaissances** distillé de 7 ouvrages de référence en méthodologie et rédaction académique.

Le problème que cette architecture résout : en l'absence de centralisation, chaque mode IA développait son propre « savoir » inline, entraînant contradictions, oublis et comportements incohérents.

---

## 2. Arborescence des fichiers IA

```
src/lib/ai/
├── knowledge-core.ts         ← ★ SOCLE UNIQUE DE VÉRITÉ (savoir métier)
├── shared-prompts.ts         ← Prompts RÔLE/FORMAT réutilisables
├── prompt-builder.ts         ← Assembleur : injection sélective du noyau + calibration niveau
├── ai-provider.ts            ← Détection provider, URL, headers
├── ai-types.ts               ← Types + 18 providers dynamiques
├── zai-client.ts             ← Client IA (completion + stream + fallback)
├── hardcoded-keys.ts         ← Clés via env vars
├── prompt-builder.ts         ← Construit le system prompt final
├── knowledge-core/
│   └── modules/              ← fichiers .md (sources brutes distillées)
│       ├── grant-writing.md
│       ├── methodology-design.md
│       ├── publication.md
│       ├── literature-review.md
│       ├── writing-process.md
│       ├── methodology-basics.md
│       ├── data-analysis.md
│       ├── methods-mixtes-sandelowski.md   ← digestion 2026-09-28
│       ├── methodes-methodologie-uwa.md    ← digestion 2026-09-28
│       └── revue-litterature-snyder.md     ← digestion 2026-10-03
└── specializations/          ← 19 fichiers (1 par mode d'écriture)
    ├── index.ts              ← Registry : SPECIALIZATION_PROMPTS[modeId]
    ├── directeur.ts          ← Mode « directeur de thèse »
    ├── scientific-writing.ts ← Écriture scientifique
    ├── peer-review.ts        ← Relecture par les pairs
    ├── literature-review.ts  ← Revue de littérature
    ├── grammaire.ts          ← Correction grammaticale
    ├── defense.ts            ← Préparation soutenance
    └── ... (13 autres)

src/data/
├── ai-writing-modes.ts       ← Métadonnées modes (label, icon, temp) — PAS de systemPrompt
└── directeur-prompt.ts       ← DÉPRÉCIÉ → utiliser specializations/directeur.ts

src/app/api/
├── ai-writing/route.ts       ← Utilise SPECIALIZATION_PROMPTS + prompt-builder
├── ai-writing/stream/route.ts← Streaming SSE, même pattern
├── directeur-chat/route.ts   ← Mode directeur via SPECIALIZATION_PROMPTS
├── coherence-check/route.ts  ← Option B (noyau + grille scoring locale)
├── verification-publication/route.ts ← Option B
├── verification-carto/route.ts ← shared-prompts.ts (SOCRATIC_QUESTIONER_PROMPT)
├── types-analyse/seed/route.ts ← shared-prompts.ts
└── ...
```

---

## 3. Les trois couches de prompts

### Couche 1 — Savoir métier (`knowledge-core.ts`)

**C'est la seule source de vérité.** Contient les règles, critères et grilles méthodologiques digérées de 7 ouvrages.

- 11 modules de connaissance sélectionnables
- ~3 900 tokens pour le noyau complet
- Injection sélective : chaque spécialisation déclare les modules dont elle a besoin

**Règle absolue :** Si un contenu est du savoir métier (règle, critère, grille, norme), il va ici. Partout ailleurs, c'est une duplication.

### Couche 2 — Rôle et format (`specializations/` + `shared-prompts.ts`)

Les spécialisations définissent :
- **Le rôle** de l'IA pour ce mode (ex : « Tu es un directeur de thèse bienveillant mais exigeant »)
- **La tâche** spécifique (ex : « Révise ce paragraphe en te concentrant sur… »)
- **Le format de sortie** attendu (ex : JSON structuré, liste de questions, etc.)

`shared-prompts.ts` contient les prompts de rôle réutilisables par plusieurs routes (pas du savoir métier).

### Couche 3 — Assemblage et calibration (`prompt-builder.ts`)

Le prompt-builder assemble le system prompt final en deux temps :

```
1. [Savoir du noyau (modules sélectionnés)] + [Prompt de spécialisation (rôle + tâche + format)]
2. [Calibration par niveau doctorant]  ← post-injection (optionnel)
```

La calibration adapte le **comportement** (ton, granularité, pédagogie) sans modifier le savoir ni les spécialisations. Voir §12 pour le détail.

---

## 4. Les 11 modules de connaissance

| Module | Source(s) | Tokens | Injecté par |
|--------|-----------|--------|-------------|
| `style` | White | ~580 | Tous modes rédactionnels |
| `ethics` | Kumar, Salkind | ~280 | directeur, paraphrase, academic-reformulation |
| `coherence` | White, existant | ~520 | directeur, peer-review, revision-plan, defense, coherence-check |
| `auto-edition` | Existant | ~180 | auto-edition-8c |
| `peer-review` | Existant | ~380 | peer-review, revision-plan |
| `methodology` | Kumar, Salkind, Sandelowski (2000), STUDYSmarter (UWA) | ~4 470 | directeur, hypothesis, methodology, revue-litterature |
| `writing-process` | White | ~310 | directeur, scientific-writing, theory, revision-plan |
| `literature-review` | Ollhoff, Snyder (2019) | ~3 094 | literature-review, revue-litterature |
| `data-analysis` | Rae & Wong | ~310 | (disponible, pas encore injecté) |
| `grant-writing` | Smith & Works | ~340 | (disponible, pas encore injecté) |
| `publication` | Gastel & Day | ~380 | directeur, abstract, verification-publication |

> **Jetons — note de mesure (2026-10-03) :** la colonne « Tokens » ci-dessus conserve des estimations historiques ; la mesure faisant foi est le capteur `src/lib/ai/knowledge-core.budget.test.ts` (full core ~21 794 tokens mesurés / budget 22 000 — marge ~206 tok ; méthodologie ~4 470 / plafond 5 000, toujours le plus grand module).

### Détail du module `coherence` (v1.8.3 — enrichi)

5 sous-catégories :
1. **Terminologique** — uniformité des termes, glissement sémantique
2. **Numérique** — cohérence des données chiffrées
3. **Introduction-Discussion** — écho entre ouverture et conclusion
4. **Référentielle** — complétude des citations, pas de citation fantôme
5. **Argumentative** *(ajouté v1.8.3)* — contradiction interne, affirmation non étayée, confusion corrélation/causalité, sur-généralisation

---

## 5. Patterns de factorisation

### Pattern A — Digestion totale
Le noyau couvre 100% du savoir. La spécialisation ne contient aucun savoir métier.

**Exemples :** `ai-writing`, `ai-writing/stream`, `directeur-chat`

```typescript
// Route : rien de spécifique, tout vient du noyau
const systemPrompt = buildSystemPrompt(modeId, context)
```

### Pattern B — Noyau + scoring local
Le savoir vient du noyau. Le format de sortie (grille de scoring, pondérations) reste dans la route car il est spécifique à cette route.

**Exemples :** `verification-publication`, `coherence-check`

```typescript
// Route : injecte le savoir du noyau, puis ajoute sa grille
const knowledgeBase = getKnowledgeCore(["publication"])
const systemPrompt = `Savoir de référence (knowledge-core) :
──
${knowledgeBase}
──
Grille de contrôle structurée (dérivée des principes du noyau) :
${PUBLICATION_CHECKS}`
```

### Pattern C — Shared prompt (rôle/format)
Un prompt de rôle est partagé entre plusieurs routes, mais ce n'est pas du savoir métier.

**Exemples :** `verification-carto`, `types-analyse/seed`

```typescript
// shared-prompts.ts — RÔLE/FORMAT uniquement
export const SOCRATIC_QUESTIONER_PROMPT = `Tu poses UNIQUEMENT des questions ouvertes...`

// Route : importe le shared prompt
import { SOCRATIC_QUESTIONER_PROMPT } from "@/lib/ai/shared-prompts"
```

---

## 6. Règle de décision : qu'est-ce qui va dans le noyau ?

> **Un critère migre vers le noyau si un AUTRE mode (directeur, peer-review, defense) pourrait en avoir besoin.**

| Type de contenu | Destination | Raison |
|-----------------|-------------|--------|
| Critère de qualité réutilisable | `knowledge-core.ts` | Plusieurs modes en bénéficient |
| Grille de scoring spécifique | Route locale | Format de sortie propre à cette route |
| Rôle / persona réutilisable | `shared-prompts.ts` | Pas du savoir métier |
| Tâche spécifique | `specializations/` | Contexte d'utilisation propre au mode |

---

## 6 bis. Canal « Compétences livres » (2026-10-03)

Canal d'injection **séparé du noyau** (qui est au plafond de budget) : les ressources de la base
`CustomBookSkill` activées par l'utilisateur (`enabled: true` — opt-in strict) alimentent les
prompts des flux génératifs.

- **Bibliothèque pure** : `src/lib/ai/book-skills.ts` — `selectBookSkills` (déterministe, récence
  d'abord, plafond **12 000 caractères** de contenu), `buildBookSkillsIndex` (plafond **1 500
  caractères**, mention « contenu non injecté (budget) »), `buildBookSkillsSection` (**null si 0
  ressource active** → prompt byte-identique).
- **Accès serveur** : `src/lib/ai/book-skills-server.ts` — `getActiveBookSkills()`
  (`enabled: true`, ordre `updatedAt desc`).
- **Points d'injection (v1)** : `/api/chapter-draft/stream` (3e paramètre de `buildSystemPrompt`,
  avant le contexte de thèse ; prompt de continuation inchangé) et `/api/ai-writing` + `/api/ai-writing/stream`
  (message système dédié après le prompt de spécialisation, avant le contexte).
- **Règle d'intégrité** : la section instruit l'IA que ces savoirs sont un appui rédactionnel et
  **JAMAIS une source de citations** — aucune référence bibliographique n'en est tirée.
- **Coût** : 0 token quand aucune ressource active ; ≤ ~3 400 tokens sinon (plafonds ci-dessus).
- Champs de la ressource : `description` (quand l'utiliser), `source` (provenance),
  `enabled` (opt-in IA). Spécification : `specs/competences-livres-vivantes/`.

## 6 ter. Version du noyau et « Provenance des savoirs » (2026-10-03)

**Version du noyau** : la constante `KNOWLEDGE_CORE_VERSION` (`src/lib/ai/knowledge-core.ts`,
tête de fichier) identifie le socle. **À incrémenter à chaque évolution du noyau** (module ajouté,
contenu édité, ingestion, compaction) et à consigner ici :

| Version | Date | Changement |
|---|---|---|
| `2026-10-03` | 2026-10-03 | Valeur initiale — 13 modules, 65 382 car. / ~21 794 tok |

**Stamp « Provenance des savoirs »** (`specs/sceau-provenance-savoirs/`) : chaque génération du
brouillon de chapitre et de l'assistant d'écriture émet un événement SSE `stamp` **en fin de flux,
HORS prompt** (`src/lib/ai/knowledge-stamp.ts` — pur : `buildKnowledgeStamp` dérive du noyau et de
la sélection réelle des compétences livres le mode « integral » / « index-only »). Le bloc UI
partagé `src/components/knowledge-stamp-block.tsx` l'affiche (résumé + détail dépliable) dans
l'aperçu du brouillon, sous le résultat de l'assistant d'écriture, et dans l'historique du chapitre
(état actuel + par version). Persistance : colonne `stamp` (JSON) sur `Chapter` et
`ChapterVersion` — `PUT /api/chapters/[id]` l'écrit avec le contenu qu'il décrit ; absent =
« saisie manuelle ». Le stamp n'entre **jamais** dans le prompt (non-régression byte-identique).

---

## 6 quater. Mode « Expertise urbaine (URBANIS-DZ) » (2026-10-07)

**Source** : pack URBANIS-DZ v1.1 fourni par le propriétaire (`upload/URBANIS-DZ_Pack_construction_agent.pdf`,
analyse dans `specs/urbanis-dz-integration/`, cycle dans `specs/urbanis-dz-mode/`). L'instruction
système du pack (§ 2 : 12 règles dures, cadrage, modes M1-M7, protocole risques, format de sortie,
style) est retranscrite **verbatim** dans `src/lib/ai/specializations/urbanis-dz.ts` —
**prompt autoporteur** (`buildStandalonePrompt`) : il n'embarque **pas** le noyau de connaissance
(~1 300 tok, sans effet sur la marge full core) et porte sa propre doctrine.

**Passerelle d'intégration** (seul ajout hors pack, consigné) : usage thèse, règle d'intégrité
« les compétences livres sont un appui, jamais une source de citations », langue de la demande.

**Garde-fous** : tests d'invariants + snapshot anti-dérive (`urbanis-dz.test.ts` — 12 règles, M1-M7,
JORADP, protocole risques, budget ≤ 7 000 car., câblage `SPECIALIZATION_PROMPTS`/`WRITING_MODES`).
L'UI affiche une note permanente quand le mode est actif : « Avis technique non opposable — toute
règle juridique doit être vérifiée au JORADP » (règle 8 du pack). Le stamp « Provenance des
savoirs » (§ 6 ter) continue de s'appliquer à ce mode (canal compétences livres inchangé).

**Hors périmètre acté** : registre juridique structuré (Option B), veille JORADP (Option C),
référentiels § 3/§ 4 du pack non injectés dans le prompt.

## 6 quinquies. Registre juridique URBANIS-DZ (2026-10-07, cycle urbanis-dz-registre)

**Source** : § 3 (référentiel juridique minimal, 13 entrées) et § 4 (sous-référentiel risques,
14 entrées) du pack URBANIS-DZ v1.1, structurés selon le format du § 7 (11 champs) — modèle
Prisma `LegalRef` (`prisma/schema.prisma`), alimentation initiale par `scripts/seed-legal-refs.ts`
(27 entrées, vigilances conservées **verbatim**, idempotent).

**Canal d'injection** (`src/lib/ai/legal-refs.ts` + `legal-refs-server.ts`) : mécanique calquée
sur les compétences livres (§ 6 bis) — sélection déterministe (ordre `updatedAt desc`), plafond
de contenu **8 000 car.** (le registre complet ≈ 6 350 car. y tient), index léger **1 500 car.**
avec mention « contenu non injecté (budget) ». Le texte injecté d'une entrée est **composé depuis
ses champs** (pas de contenu libre) et les vigilances du pack ne sont jamais converties en
affirmation de statut.

**Périmètre d'injection (décision déléguée n°1, révisable)** : le registre nourrit **uniquement**
le mode `expertise-urbaine-dz` de l'assistant d'écriture (message système dédié après les
compétences livres) — les autres modes, les chapitres et les autres flux restent **byte-identiques**
(tests de non-régression). Garde-fous du bloc : appui documentaire, jamais une autorisation,
jamais une citation bibliographique, rappel permanent « avis non opposable — vérifier au JORADP ».

**Sceau de provenance** : le stamp (§ 6 ter) est étendu **additivement** — champ optionnel
`legalRefs` (`[{id, reference, mode}]`), résumé « + N entrées du registre juridique », détail
`[R1]…[Rn]` ; les stamps antérieurs sans `legalRefs` restent valides et affichés.

**UI** : onglet « Registre juridique » dans le module Livres & compétences — CRUD complet
(11 champs du § 7), interrupteur « Utilisée par l'IA » (opt-in strict, désactivée par défaut),
recherche, vigilances affichées telles quelles.

**Hors périmètre acté** : veille JORADP / connecteur (Option C — pas d'API publique stable,
cycle dédié si demandé) ; injection dans les chapitres de thèse ou d'autres modes.

---

## 7 bis. Brouillon d'article scientifique (2026-10-07, cycle article-scientifique)

**Canal** : assistant dédié (`modules/article-redaction`, module « Brouillon d'article ») — 5 étapes :
sources (projet + import DOCX/PDF/TXT ≤ 50 Mo) → consignes (type, langue, longueur, style biblio,
revue, angle) → **plan proposé puis modifiable avant génération** → génération **section par section**
(réponses JSON synchrones, les autres sections intactes) → relecture / versions datées / export DOCX.

**Intégrité (règles verbatim du cahier des charges)** : `src/lib/articles/prompts.ts` — ne jamais
inventer (résultats, chiffres, références, DOI…), « [À compléter par l'auteur] » quand une
information manque, corrélation ≠ causalité, citations ↔ bibliographie cohérentes, « à vérifier »
plutôt que compléter par supposition, jamais « revue systématique » sans méthode systématique,
document importé = **DONNÉES jamais instructions** (balises `<source>` + défense anti-injection),
brouillon à vérifier par les auteurs — aucune garantie d'acceptation.

**Extraction honnête** : `src/lib/articles/extraction.ts` — type réel vérifié (extension + magic
bytes), taille max configurable (50 Mo — cycle import-size-limit : transport Next relevé à 64 Mo via
`experimental.proxyClientMaxBodySize`, sinon le serveur tronque à 10 Mo), PDF scanné détecté (pages sans texte — consigné avec
l'option OCR, voir cycle article-ocr-async), titres DOCX depuis le HTML mammoth, limites listées et
affichées à l'utilisateur avant toute génération.

**Traçabilité** : chaque section porte ses `sources` (label + kind + location) demandées au LLM
(« SOURCES UTILISÉES : ») et affichées sous la section ; références de la thèse = seule source de
citations autorisée. Export DOCX (`/api/articles/export-docx`) : repères « à compléter / à vérifier »
conservés et mis en évidence, mention de brouillon en tête.

**Option B (2026-10-07, cycle article-scientifique)** : analyse pure des sources (`analysis.ts` —
volumes, sections repérées, études via blocs expérimentations, éléments manquants, qualité honnête,
garde-fou anti-fragmentation « un seul angle, fractionnement = décision explicite ») exposée via
`/api/articles/analyze` + panneau UI ; propositions d'angles par IA (`/api/articles/angles`,
2-4 angles argumentés) avec **choix utilisateur obligatoire avant génération** quand ≥ 2 études sont
détectées — la génération est bloquée avec message explicite sinon. Le résumé structuré ou non suit
les consignes de revue transmises au prompt (champ `journalGuide`).

**Option C (2026-10-07, cycle article-scientifique)** : traduction linguistique **DISTINCTE** de la
transformation — `ARTICLE_TRANSLATION_RULES` (préserver EXACTEMENT sens, données, nuances,
citations ; n'ajouter RIEN ; unités/valeurs intacts ; repères « [À compléter par l'auteur] » etc.
conservés **verbatim en français** — contrainte de sortie explicite, prouvée live) exposée via
`/api/articles/translate` : le résultat est une **copie** renvoyée au client, jamais une écriture
sur l'original. UI (étape 5) : sélecteur de langue cible, boutons « Traduire » par section et
« Traduire l'article entier » (section par section, progression affichée), panneau « Copie traduite »
(badge « original intact », sections non traduites signalées), enregistrement en **nouvel article**
(original jamais touché) ou en **version** (original archivé et restaurable). La traduction stockée
est invalidée dès que la section d'origine change (génération, édition, restauration).
**Vue multi-articles** : la carte « Vos brouillons d'articles » affiche par article titre, type,
statut, nombre de sections et repères « à compléter/vérifier » (calculés serveur par `GET
/api/articles`) + un agrégat.

**OCR asynchrone (2026-10-07, cycle article-ocr-async)** : les pages scannées d'un PDF importé
sont désormais reconnaissables. Chaîne pure JS (étude § 2-4 validée) : `unpdf extractImages`
(bitmap décodé sans canvas) → PNG `pngjs` → `tesseract.js` v7 **WASM** — 1 page = 1 worker créé
puis `terminate()` (séquentiel strict, box OOM), réduction entière au-dessus de 9 Mpx, tessdata
fra/eng/ara embarqué localement (`vendor/tessdata`, 18,9 Mo mesuré, zéro réseau — `langPath` fs +
`cacheMethod: none`). Exécution via la file de tâches persistante : handler `article-import-ocr`
(« src/lib/jobs/worker.ts ») avec progression par page (`Job.progress`/`progressNote`, clôturée à
100 %), plafond 30 pages/job (env `OCR_MAX_PAGES`), garde anti-empilement GLOBALE (409). Les
octets du PDF sont conservés à l'import (`ImportedDoc.data Bytes?`, PDFs seuls — un PDF 100 %
scanné est désormais accepté au lieu d'être refusé 422) et les octets ne sortent JAMAIS via l'API
(`GET ?id` les exclut). Le texte OCR est inséré dans un **bloc marqué idempotent** (« TEXTE OCR —
RECONNAISSANCE AUTOMATIQUE (relecture requise) », confiance moyenne par page, règle
DONNÉES-strictement, ré-OCR = remplacement du bloc, texte natif jamais touché) ; la limite
« scanned » devient une limite `kind: "ocr"` (pages traitées, sans image, hors plafond, confiance)
qui déclenche la mention « contient du texte OCR — relecture requise » dans le label de
traçabilité (`sources-server.ts`). UI (étape 1) : panneau OCR sur les cartes scannées (sélecteur
fr/en/ar, bouton plafond annoncé, progression 3 s, notice de fin, badge, erreurs honnêtes) ; les
imports récents sont rechargés au montage (survivent au rechargement). Routes :
`POST/GET /api/article-imports/ocr`. Honnêteté : les pages sans image exploitable ou sans texte
reconnu sont consignées par page (jamais de texte fantôme) ; un PDF déjà extractible renvoie 422
« l'OCR est inutile » ; la précision dépend du scan — relecture humaine exigée par design.

**Périmètre** : le brouillon est stocké **séparément** de ses sources (`Article`/`ArticleVersion`,
isolation `thesisId`) ; les imports sont re-extractables et supprimables (`ImportedDoc`). Livrées :
analyse/angles (option B), traduction distincte (option C), OCR asynchrone (cycle
article-ocr-async — voir ci-dessus). **Reste différé** : emballage Tauri du dossier `vendor/tessdata`
(cycle build-desktop — `output: standalone` ne copie pas `vendor/` tel quel, résolution par chemins
candidats en place).

---

## 7. Processus de digestion et feedback

Quand un cas limite ou une divergence est identifié, il suit le processus formel documenté dans `feedback.md` :

1. **Capture** — documenter le signal (source, modes concernés, description)
2. **Triage** — est-ce un trou du noyau ? une duplication ? un faux positif ?
3. **Correction** — ajouter dans `knowledge-core.ts` si le critère est réutilisable
4. **Retirer** toute duplication dans les spécialisations/routes
5. **Validation** — `bun run test:run` + `bun run lint` + vérification convergence inter-modes
6. **Documentation** — enregistrer dans le worklog

Voir `feedback.md` pour le détail complet (tableau de triage, checklist validation, cas d'usage).

---

## 8. RAG Sémantique

### Architecture
- **Embeddings** : stockés en JSON string par chunk (modèle `DocumentChunk` Prisma)
- **Recherche** : hybride — 65% sémantique / 35% mot-clé (configurable via `RAG_KEYWORD_WEIGHT` / `RAG_SEMANTIC_WEIGHT`)
- **Filtrage** : par `thesisId` + `embedding IS NOT NULL`
- **Providers supportés** : OpenAI, Mistral, Google, Groq, OpenRouter

### Validation (T3)
- Provider testé : Mistral / mistral-embed
- Query sans mot-clé commun → retrieval sémantique fonctionne
- Score types : hybrid × 3, semantic × 2, keyword × 0
- Script : `scripts/test-rag-semantic.ts`

### Limitation connue
Pas d'index vectoriel natif (parsing JSON à chaque requête). Adapté pour ~400 chunks (1 thèse). Pour monter en volume, migrer vers sqlite-vec.

---

## 9. Audit des routes IA — Résultat final (9/9)

| Route | Fichier | Pattern | Statut |
|-------|---------|---------|--------|
| deep-research | api/deep-research/route.ts | — (standalone) | ✅ CLEAN |
| paper2code | api/paper2code/generate/route.ts | — (standalone) | ✅ CLEAN |
| text-prediction | api/text-prediction/route.ts | — (standalone) | ✅ CLEAN |
| thesis-rag | lib/rag/rag-service.ts | — (standalone) | ✅ CLEAN |
| coherence-check | api/coherence-check/route.ts | **Option B** | ✅ FACTORISÉ |
| verification-carto | api/verification-carto/route.ts | **Shared prompt** | ✅ FACTORISÉ |
| verification-publication | api/verification-publication/route.ts | **Option B** | ✅ FACTORISÉ |
| ai-writing + stream | api/ai-writing/route.ts | **Digestion A** | ✅ FACTORISÉ |
| directeur-chat | api/directeur-chat/route.ts | **Digestion A** | ✅ FACTORISÉ |

---

## 10. Cas d'étude : la séquence diagnostic → correction → convergence

Cette séquence (worklog Tasks 5→6→7→8) est un exemple rare et documenté de convergence d'un système de prompts multi-modes :

1. **Diagnostic (T6)** : audit systématique des 9 routes IA → identification de 2 doublons résiduels
2. **Correction noyau (T7)** : coherence-check (Option B) + verification-carto (shared-prompts) → 9/9 factorisés
3. **Convergence (T4)** : découverte qu'un cas limite (citation littérale) causait des réponses divergentes entre modes → correction dans le noyau, tous les modes convergent
4. **Validation RAG (T3)** : test end-to-end avec embeddings réels (Mistral) → retrieval sémantique confirmée

**Leçon :** toute divergence inter-modes est un signal d'un trou dans le knowledge-core, pas d'un bug de prompt.

---

## 11. Checklist pour tout contributeur

- [ ] J'ai lu `AGENTS.md` (règles de développement)
- [ ] J'ai lu `CONTEXT-PROJET.md` (mémoire du projet)
- [ ] J'ai lu `feedback.md` (processus de remontée des divergences)
- [ ] Je comprends la différence SAVOIR vs RÔLE/FORMAT
- [ ] Mon savoir métier va dans `knowledge-core.ts` (si réutilisable)
- [ ] Mon rôle/format va dans `specializations/` ou `shared-prompts.ts`
- [ ] Je n'ai créé aucune duplication avec le noyau
- [ ] `bun run lint` → 0 erreurs
- [ ] `bun run test:run` → tous les tests passent
- [ ] J'ai mis à jour le worklog

---

## 12. Calibration par niveau doctorant (v1.9.0)

### Principe

Trois niveaux adaptent le comportement de l'IA **sans modifier le savoir** :

| Niveau | Type `DoctoralLevel` | Effet |
|--------|---------------------|-------|
| Débutant | `'debutant'` | Ton encouragé, explications pas à pas, choix méthodologiques justifiés |
| Intermédiaire | `'intermediaire'` | Ton professionnel, équilibré, signale les points d'attention |
| Avancé | `'avance'` | Ton expert, concis, macro-niveau, hypothèse de maîtrise des bases |

### Design decision

La calibration est en **post-injection** dans `prompt-builder.ts` via `getLevelCalibration(level?)` :

```typescript
// prompt-builder.ts
export type DoctoralLevel = 'debutant' | 'intermediaire' | 'avance'

export function getLevelCalibration(level?: DoctoralLevel): string {
  // Retourne ~110 tokens de calibration, ou '' si pas de niveau
}
```

**Pourquoi la post-injection ?** Le savoir (knowledge-core) ne change pas par niveau — la vérité méthodologique est la même pour un débutant et un expert. Seul le COMMENT l'IA communique et applique ce savoir change.

### Routes impactées

- `/api/ai-writing` — champ `doctoralLevel` optionnel dans le schema Zod
- `/api/ai-writing/stream` — même pattern
- `/api/directeur-chat` — même pattern (après fiches corpus)

### Impact token

- +~110 tokens quand le niveau est fourni
- 0 token quand non fourni (champ optionnel, zéro breaking change)
- Le token budget du noyau n'est pas impacté
