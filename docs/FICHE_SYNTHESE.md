# FICHE SYNTHÈSE — Journal de bord du projet

> **Emplacement de référence :** `/docs/FICHE_SYNTHESE.md`
> Ce fichier centralise l'historique des jalons du projet. Il permet de revenir rapidement au contexte exact d'une étape en cas de bug, de régression, de reprise après interruption, ou de question ultérieure.

---

## 🔒 Instruction permanente pour l'agent Z.ai — Discipline fiche synthèse

**À charger dans le contexte persistant de l'agent (pas dans un prompt ponctuel), pour être appliquée à chaque session.**

Le fichier `/docs/FICHE_SYNTHESE.md` est un journal de bord obligatoire du projet. Applique cette règle **sans exception, à chaque tâche** :

**Avant de commencer une tâche :**
Lis les 2-3 dernières entrées de `/docs/FICHE_SYNTHESE.md` pour récupérer le contexte du dernier jalon (décisions prises, points de vigilance, dette technique en attente).

**Avant de considérer une tâche comme terminée**, pose-toi systématiquement cette question et réponds-y explicitement dans ta dernière réponse à l'utilisateur :
*"Cette tâche constitue-t-elle un jalon significatif (fonctionnalité livrée, migration, correction majeure, décision d'architecture) ?"*

- **Si oui** → crée une nouvelle entrée en haut de ce fichier selon le modèle standard (voir plus bas), **avant** de proposer un commit ou de clore la tâche. Ne considère jamais un jalon comme terminé si la fiche n'a pas été mise à jour dans le même commit.
- **Si non** (correction mineure, typo, refactor cosmétique) → indique explicitement "Pas de mise à jour de fiche nécessaire pour cette tâche" pour que ce ne soit pas un oubli silencieux, mais une décision consciente.

**Format de commit :** si la fiche est mise à jour, elle doit être incluse dans le **même commit** que le code du jalon — jamais dans un commit séparé "à faire plus tard".

Cette règle prime sur la rapidité d'exécution : mieux vaut une tâche légèrement plus longue avec une fiche à jour qu'une tâche rapide sans traçabilité.

---

## Journal des jalons

## [2025-07-XX] — Ajout des ressources visuelles RB (15 infographies académiques)

**Statut :** ✅ terminé

**Objectif de l'étape**
Intégrer 15 infographies académiques (fichier RB.rar) dans l'application : 6 sur la méthodologie de recherche + 9 sur les approches de l'urbanisme.

**Ce qui a été fait**
- Extraction du RAR (15 JPG, 4 MB total)
- Analyse du contenu via VLM (z-ai vision) pour identifier le sujet de chaque image
- Copie des images dans `public/resources/rb/`
- Création du data file `src/data/rb-resources.ts` avec métadonnées structurées (titre, description, catégorie)
- Création du module `src/modules/resource-gallery/resource-gallery-page.tsx` (291 lignes)
  - Grille responsive (1/2/3 colonnes) avec Cards
  - Filtre par catégorie (Toutes / Méthodologie / Urbanisme)
  - Lightbox avec navigation clavier (Escape, ArrowLeft, ArrowRight)
  - Badges de catégorie colorés (emerald = méthodologie, amber = urbanisme)
- Intégration dans `app-store.ts` (ViewId `resource-gallery`, badge "Nouveau", catégorie "ressources")
- Intégration dans `page.tsx` via lazy loading avec correction du named export (`.then(m => ({ default: m.ResourceGalleryPage }))`)

**Décisions techniques prises**
- Images statiques dans `/public/` (pas de next/image pour les JPGs externes)
- Named export + transform en default pour compatibilité avec `createLazyPanel`
- 2 catégories de ressources : méthodologie de recherche (research gaps, literature review, statistical tests, frameworks) + urbanisme (de la cité-jardin 1898 à la smart city XXIe)

**Points de vigilance / dette technique**
- ⚠️ 2 warnings ESLint `@next/next/no-img-element` (prévisibles pour les `<img>` dans `/public`)
- ⚠️ Les descriptions sont générées par VLM — elles pourraient être affinées manuellement

**Dépendances et prérequis**
- Aucune dépendance externe

**Comment tester / vérifier que ça marche**
- Naviguer vers "Ressources visuelles" dans la sidebar (catégorie Ressources)
- 15 images affichées en grille, 6 Méthodologie + 9 Urbanisme
- Filtre catégorie fonctionnel (Toutes=15, Méthodologie=6, Urbanisme=9)
- Lightbox : clic image → dialogue plein écran, navigation ← →, Escape ferme

**Problèmes rencontrés et solutions**
- Lazy import échouait car le composant utilisait un named export, pas default → corrigé avec `.then(m => ({ default: m.ResourceGalleryPage }))`

---

## [2025-07-XX] — Création de la fiche synthèse et consolidation rétrospective

**Statut :** 🟡 partiel — consolidation en cours des jalons passés

**Objectif de l'étape**
Créer le fichier `/docs/FICHE_SYNTHESE.md` et y consigner rétrospectivement tous les jalons accomplis depuis le début du projet MaTh-se (fork de ThesisFrame).

**Ce qui a été fait**
- Création du répertoire `/docs/` et du fichier `FICHE_SYNTHESE.md`
- Relecture complète du `worklog.md` (12 entrées, ~350 lignes)
- Documentation rétrospective des jalons significatifs manquants

**Décisions techniques prises**
- Adoption du format de fiche synthèse comme journal de bord permanent du projet
- Le worklog.md reste le journal détaillé des tâches agent par agent ; la fiche synthèse est le résumé décisionnel par jalon

**Points de vigilance / dette technique**
- ⚠️ Plusieurs jalons passés n'ont pas été consignés à mesure — cette session rattrape le retard
- ⚠️ Le bug `$queryRaw` dans knowledge-search.ts (`.replace is not a function`) a été corrigé (`$queryRawUnsafe`) mais l'erreur apparaît encore dans les logs anciens
- ⚠️ 236 warnings ESLint pré-existants dans les fichiers restaurés du dépôt original — à traiter progressivement
- ⚠️ Liens vers plateformes de piratage identifiés dans des routes API du dépôt original — **remédiation prioritaire non confirmée**
- ⚠️ Vulnérabilités OAuth Mendeley (C1 à C8) dans le dépôt original — statut de correction à vérifier
- ⚠️ Migration Auth.js v5 annoncée mais non vérifiable dans le dépôt

**Dépendances et prérequis**
- Prisma 28 modèles, SQLite
- z-ai-web-dev-sdk pour les fonctionnalités IA
- Supabase (PostgreSQL) configuré pour le module GIS (non encore porté)
- Clé GLM/Z.ai (chat.z.ai) pour les modules IA

**Comment tester / vérifier que ça marche**
- `bun run dev` sur port 3000, toutes les vues accessibles via sidebar
- `curl /api/ping` → 200
- Agent Browser pour vérification end-to-end

**Problèmes rencontrés et solutions**
- Le worklog contenait 12 entrées détaillées mais aucune n'avait été consolidée dans une fiche synthèse
- Consolidation rétrospective effectuée ci-dessous

---

## [2025-07-XX] — Fonctionnalités SurfSense (Base de connaissances, Mémoire recherche, Citations)

**Statut :** ✅ terminé

**Objectif de l'étape**
Intégrer les fonctionnalités inspirées de SurfSense (MODSetter/SurfSense) : base de connaissances avec recherche hybride, mémoire de recherche inter-sessions, et extraction de citations.

**Ce qui a été fait**
- 4 modèles Prisma ajoutés (KnowledgeDocument, KnowledgeChunk, Citation, ResearchMemory) — 28 modèles total
- 4 lib files créés : `document-parser.ts`, `knowledge-search.ts`, `research-memory.ts`, `citation-extractor.ts`
- 5 routes API créées : `knowledge/documents`, `knowledge/documents/[id]`, `knowledge/search`, `memory`, `citations`
- 2 composants frontend : `knowledge-base-panel.tsx`, `research-memory-panel.tsx`
- 2 ViewIds ajoutés (knowledge-base, research-memory) avec badge "Nouveau"
- Correction de 3 bugs : import Z→z (casing), tokenizer/ngrams implémentés localement, `$queryRaw`→`$queryRawUnsafe`

**Décisions techniques prises**
- Recherche hybride : LIKE FTS + scoring par unigram/bigram (adaptation SQLite du pattern SurfSense BM25/pgvector)
- Mémoire de recherche : 8 catégories (theme, methodologie, problématique, reference, hypothese, cadre, result, note) avec importance 1-10 et expiration automatique
- Pas de vector DB (pas de pgvector) — tout en SQLite FTS5 + scoring in-memory

**Points de vigilance / dette technique**
- ⚠️ La recherche FTS5 n'utilise pas de vrais stemmers français — le LIKE est un fallback basique
- ⚠️ Pas d'embedding vectoriel réel — la qualité de recherche sémantique est limitée vs pgvector
- ⚠️ Les composants sont enveloppés dans ErrorBoundary pour dégradation gracieuse

**Dépendances et prérequis**
- `bun run db:push` pour les 4 nouveaux modèles
- Aucun service externe requis

**Comment tester / vérifier que ça marche**
- GET/POST `/api/knowledge/documents` → 200
- GET/POST `/api/memory` → 200
- GET `/api/citations?action=stats` → 200
- POST `/api/knowledge/search` → 200 (recherche hybride)

**Problèmes rencontrés et solutions**
- `$queryRaw` Prisma retourne un objet, pas une string → corrigé avec `$queryRawUnsafe`
- tokenizer/ngrams importés de thesis-rag.ts n'existent pas → implémentés localement dans knowledge-search.ts

---

## [2025-07-XX] — Création des 78 route.ts wrappers API

**Statut :** ✅ terminé

**Objectif de l'étape**
Créer les fichiers `route.ts` manquants pour que les 78 `handler.ts` téléchargés depuis these-frame soient accessibles via l'API Next.js App Router.

**Ce qui a été fait**
- Analyse des 78 handler.ts pour identifier les exports nommés exacts (GET, POST, PUT, DELETE, PATCH, dynamic, PHASES)
- Création de 78 route.ts avec re-export simple : `export { GET, POST } from "./handler"`
- Organisation en 10 catégories : Auth & License (17), Mendeley (5), Cloud Drive (5), Box Drive (5), Cadrage (5), AI & Assistants (16), Recherche & Academic DB (12), Notebook (3), Export & Office (6), Utilities (5)
- Cas spéciaux : `download/route.ts` exporte `dynamic` + `GET` ; `agile-roadmap/route.ts` exporte `PHASES` + `GET, POST, PATCH, DELETE`

**Décisions techniques prises**
- Re-export pur sans logique supplémentaire — les handlers sont déjà compatibles App Router
- Aucun fichier existant modifié

**Points de vigilance / dette technique**
- ⚠️ Les handlers contiennent des imports de modules qui n'existent pas forcément dans MaTh-se (dépendances circulaires potentielles)
- ⚠️ Certains handlers utilisent des env vars qui ne sont pas configurées (Mendeley, Auth0, Stytch, Box, Google Drive)

**Comment tester / vérifier que ça marche**
- `/api/ping` → 200, `/api/ai-status` → 200, `/api/auth/status` → 200
- `/api/cadrage` → 400 (body requis, donc normal)
- `/api/mendeley/documents` → 401 (token manquant, donc normal)

---

## [2025-07-XX] — Restauration massive des fonctionnalités these-frame → MaTh-se

**Statut :** ✅ terminé

**Objectif de l'étape**
Restaurer TOUTES les fonctionnalités manquantes du dépôt original `these-frame` dans le fork `MaTh-se`, sans casser l'existant.

**Ce qui a été fait**
- Phase 1 : 12 modèles Prisma ajoutés (MendeleyConfig, CloudDriveConnection, AuthProvider, AuthAccount, WarrantPolicy, ElementAnalyse, TypeAnalyseMethodologique, SessionVerification, SourceBibliographique, SourceChapitre, FicheLecture, RechercheSauvegardee) + extension de LicenseKey/Activation
- Phase 2 : 25 fichiers de données téléchargés (chapters-structure, academic-databases, methodology-guide, thesis-writing-guide, usage-guide, resources, etc.)
- Phase 3 : 29 fichiers lib téléchargés (zai.ts, ai-router.ts, conversation-store.ts, license.ts, google-drive.ts, box-drive.ts, thesis-rag.ts, auth-providers/, types/)
- Phase 4 : 50 composants téléchargés (cadrage-panel, export-pdf, chapter-balance, cloud-drive, literature-search, mendeley, journal-finder, grammar-checker, etc.)
- Phase 5 : 96 handlers API téléchargés (export-pdf, mendeley/*, academy-db/*, cloud-drive/*, verification/*, recherche/*, etc.)
- Phase 6 : 42 ViewIds dans app-store.ts, sidebar catégorisée (8 catégories), page.tsx avec lazy loading + ErrorBoundary
- Phase 7 : Correction de 2 erreurs ESLint (routesme-panel, provider-settings-dialog)
- Phase 8 : Vérification Agent Browser (42 items nav, dashboard OK)

**Décisions techniques prises**
- Architecture modulaire : chaque panneau restauré est lazy-loaded avec ErrorBoundary
- Pas de modification des modules existants — tout est additif
- 8 catégories de navigation : Principal, Recherche, Rédaction, IA & Outils, Export & Sauvegarde, Analyse, Ressources, Administration

**Points de vigilance / dette technique**
- ⚠️ 236+ warnings ESLint dans les fichiers restaurés (majoritairement `any`, imports non utilisés, types manquants)
- ⚠️ Certains composants restaurés ont des dépendances non résolues (composants inline, stores spécifiques)
- ⚠️ Les 42 vues sont toutes dans un seul `page.tsx` via switch/case — le fichier est volumineux (250 lignes)
- ⚠️ Plusieurs composants utilisent des imports de `@/lib/*` qui n'ont pas les mêmes exports que dans these-frame

**Dépendances et prérequis**
- `bun run db:push` pour les 12 nouveaux modèles (24 total après cette étape)
- Tous les composants sont lazy-loaded — pas de dépendance de build bloquante

---

## [2025-07-XX] — Analyse comparative these-frame vs MaTh-se

**Statut :** ✅ terminé

**Objectif de l'étape**
Comparer exhaustivement le dépôt original these-frame avec le fork MaTh-se pour identifier toutes les fonctionnalités manquantes.

**Ce qui a été fait**
- Exploration complète de MaTh-se (57 fichiers src, 12 modèles Prisma, 27 routes API, 9 vues)
- Fetch de l'arborescence complète de these-frame (200+ fichiers src, 20+ modèles, 80+ handlers, 40+ composants)
- Analyse des différences : 12 modèles, 25 data files, 29 lib files, 50 composants, 96 routes API manquants

**Décisions techniques prises**
- Approche phase par phase : Prisma → Data → Lib → Components → API → Integration
- Architecture modulaire de MaTh-se conservée (pas de retour au monolithique these-frame)

**Points de vigilance / dette technique**
- Différence fondamentale d'architecture : these-frame est monolithique (35+ dialog panels dans page.tsx), MaTh-se est modulaire (module pages séparées)

---

## [2025-07-XX] — Intégration de 5 modules + Dashboard dynamique

**Statut :** ✅ terminé

**Objectif de l'étape**
Intégrer les 5 nouveaux modules dans `page.tsx` et mettre à jour le Dashboard avec des données réelles.

**Ce qui a été fait**
- `page.tsx` : remplacement de tous les ModulePlaceholder par les vrais imports (MethodologyPage, ArticlesPage, ThesisPlanPage, AiToolsPage, AcademicDbPage)
- Dashboard : badges module mis à jour de "Planifié" à "Prêt" pour les 5 modules
- Correction bug references-page.tsx : year envoyé en string → parseInt() pour matcher le schema Zod
- Vérification Agent Browser : 9 vues rendues correctement, 0 erreurs console
- CRUD référence testé end-to-end (POST /api/references 201)

**Décisions techniques prises**
- Dashboard montre les données réelles depuis SQLite via Prisma (stats auto-refresh 15s)

**Points de vigilance / dette technique**
- 2 "IA" + 6 "Prêt" + 0 "Planifié" dans le dashboard — tous les modules principaux sont opérationnels

---

## [2025-07-XX] — Création de 5 modules pages

**Statut :** ✅ terminé

**Objectif de l'étape**
Créer 5 pages de modules complettes : Méthodologie, Articles scientifiques, Plan de thèse, Outils IA, Bases de données académiques.

**Ce qui a été fait**
- `academic-db-page.tsx` : 27 bases de données dans 5 catégories, filtrage par recherche et catégorie, badges d'accès
- `methodology-page.tsx` : 5 sections accordion (paradigmes, démarche, outils, techniques, checklist), stepper 7 étapes, checklist interactive avec Progress
- `articles-page.tsx` : 3 onglets (Guide IMRaD, Boîte à outils, Checklist soumission), checklist avec barre de progression
- `thesis-plan-page.tsx` : arbre des chapitres (roman numerals, status badges, Progress), générateur de template LaTeX (classique/par parties)
- `ai-tools-page.tsx` : 3 onglets (Carnet CRUD, Consensus IA multi-modèle, Visualisation placeholder)

**Décisions techniques prises**
- Toutes les pages suivent le pattern existant : `max-w-6xl mx-auto, flex flex-col gap-6 p-6`
- Texte entièrement en français
- Palette oklch (chart-1, chart-2, chart-4) — pas de bleu/indigo

---

## [2025-07-XX] — Fondation API et Dashboard

**Statut :** ✅ terminé

**Objectif de l'étape**
Poser les fondations techniques : QueryClientProvider, schémas Zod partagés, routes CRUD complètes, Dashboard avec vraies données.

**Ce qui a été fait**
- `query-provider.tsx` : TanStack Query provider (staleTime 30s)
- `api-schemas.ts` : schémas Zod partagés pour validation server + client
- 15 routes CRUD : cadrages, fields, versions, sources, entries, sprints, stories, ai-config, stats
- Dashboard : stat cards dynamiques (chapitres, références, mots, % progression), module cards avec badges
- Correction ESLint : 0 erreurs (de 0 erreurs initiales → fixes sur composants existants)
- Vérification Agent Browser : Dashboard (27 éléments), Editor, References, AI Writing

**Décisions techniques prises**
- TanStack Query comme solution de server state (staleTime 30s pour données de thèse)
- Zod pour validation partagée : un seul schema.ts importable côté server et client

**Points de vigilance / dette technique**
- Les stats du dashboard s'auto-refresh toutes les 15 secondes — attention à la charge en production

---

## [2026-08-12] — État des lieux général du projet (entrée d'amorçage)

**Statut :** 🟡 partiel — synthèse rétrospective, à affiner par le Dev à la prochaine session

**Objectif de l'étape**
Poser une première fiche de référence consolidant l'état connu du projet ThesisFrame avant mise en place de la discipline "fiche synthèse à chaque jalon".

**Ce qui a été fait**
- Structure du mémoire à deux couches : squelette IMRaD verrouillé (exigences institutionnelles UC3) + contenu disciplinaire éditable.
- Module `directeurThese.js` (superviseur IA) avec system prompt strict interdisant la génération de contenu à la place du doctorant.
- Pipeline desktop Tauri v2 (Windows) générant un installeur NSIS via GitHub Actions.
- Migration base de données : SQLite éphémère → Supabase PostgreSQL (migration intentionnelle et confirmée).
- Intégration GIS/cartographie avancée : PostGIS, serveur de tuiles Martin, MapLibre GL.
- Module de vérification méthodologique : contrôle de complétude à base de règles + module de questionnement socratique (GLM/Z.ai).
- Onglet "Recherche" : recherche documentaire externe (OpenAlex/CrossRef/HAL) + gestion bibliographique (Mendeley OAuth) + sous-onglet revue de littérature.
- Fonctionnalité d'historique de chapitres / snapshots + diff au mot près (librairie `diff`), livrée sous forme de patchs git.
- Correctif d'échec de déploiement Vercel appliqué directement via git (commit `df30714`).

**Décisions techniques prises**
- Choix Supabase PostgreSQL comme base persistante définitive (over SQLite/LibSQL).
- GLM/Z.ai comme backend IA de référence sur l'ensemble de l'écosystème S@dim (choix délibéré et récurrent).
- Séparation stricte squelette institutionnel verrouillé / contenu disciplinaire libre.

**Points de vigilance / dette technique**
- ⚠️ Liens vers plateformes de piratage trouvés dans des routes API — **remédiation prioritaire non confirmée comme résolue**.
- ⚠️ Vulnérabilités identifiées sur l'intégration OAuth Mendeley (référencées C1 à C8) — statut de correction à vérifier.
- ⚠️ Migration Auth.js v5 annoncée par un développeur mais **non vérifiable dans le dépôt** — à auditer.
- Le token GitHub temporaire utilisé pour le commit `df30714` devait être révoqué — à confirmer que c'est fait.
- Système de structure de thèse (mode parties + chapitres) partiellement implémenté seulement.

**Dépendances et prérequis**
- Supabase (PostgreSQL) configuré et accessible.
- Serveur de tuiles Martin + PostGIS opérationnels pour le module GIS.
- Clé/API GLM/Z.ai (chat.z.ai) valide pour le module socratique et le superviseur IA.
- OAuth Mendeley configuré (sous réserve des vulnérabilités C1–C8 à corriger avant mise en production).
- Pipeline GitHub Actions pour le build Tauri/NSIS.

**Comment tester / vérifier que ça marche**
- À compléter par le Dev : commandes de build Tauri, script de vérification Supabase, test du module socratique.

**Commit(s) associé(s)**
- `df30714` — correctif déploiement Vercel.

**Problèmes rencontrés et solutions**
- Échec de déploiement Vercel → patché directement en production via git, sans passer par le flux normal (à documenter précisément par le Dev : cause racine du échec).

---

*(À partir de cette entrée, chaque nouveau jalon doit être ajouté au-dessus, selon le modèle défini dans les instructions ci-dessous.)*

---

## Instruction permanente pour le Dev — Fiche synthèse de jalon (ThesisFrame)

À chaque étape de travail significative (jalon, sprint, fonctionnalité livrée, correction majeure, migration), ajoute une nouvelle entrée **en haut** de ce fichier, selon le modèle suivant. Une fiche distincte peut être ouverte par grand module (ex. `FICHE_SYNTHESE_GIS.md`, `FICHE_SYNTHESE_RECHERCHE.md`) si le volume devient trop important pour un seul fichier.

**Modules actuellement suivis :** noyau thesis-writing, module GIS (PostGIS/Martin/MapLibre), module socratique/vérification méthodologique, onglet Recherche (OpenAlex/CrossRef/HAL/Mendeley), pipeline desktop Tauri, sécurité (Mendeley OAuth, secrets API), base de connaissances SurfSense, mémoire de recherche inter-sessions.

**Vue d'ensemble de l'architecture :**
- **Framework** : Next.js 16 App Router, TypeScript, Tailwind CSS 4, shadcn/ui (New York)
- **Base de données** : Prisma ORM + SQLite (28 modèles) — Supabase PostgreSQL prévu pour GIS
- **State** : Zustand (client), TanStack Query (server)
- **IA** : z-ai-web-dev-sdk (LLM, VLM, TTS, ASR, Image Gen, Web Search)
- **Auth** : Auth0, Stytch, Warrant (multi-provider)
- **Export** : PDF, DOCX, PPTX, XLSX, LaTeX, BibTeX
- **42 vues** dans 8 catégories (Principal, Recherche, Rédaction, IA & Outils, Export & Sauvegarde, Analyse, Ressources, Administration)

```
## [Date] — [Nom du jalon / fonctionnalité]

**Statut :** ✅ terminé / 🟡 partiel / 🔴 bloqué

**Objectif de l'étape**
(1-2 phrases)

**Ce qui a été fait**
- Changements concrets (fichiers, modules, fonctions clés)

**Décisions techniques prises**
- Choix et justification

**Points de vigilance / dette technique**
- Ce qui reste fragile ou temporaire

**Dépendances et prérequis**
- Env vars, migrations, clés API, services externes

**Comment tester / vérifier que ça marche**
- Commande(s) ou étapes

**Commit(s) associé(s)**
- Hash(s)

**Problèmes rencontrés et solutions**
- Cause + fix, le cas échéant
```

**Règles de discipline :**
1. Ne jamais écraser une entrée précédente — toujours empiler chronologiquement, la plus récente en haut.
2. Mettre à jour la fiche **avant** de considérer le jalon comme clos.
3. Rester concis (15-20 lignes/jalon max, sauf cas complexe type migration de base de données ou refonte de sécurité).
4. En cas de jalon bloqué, documenter l'état exact : ce qui a été tenté, ce qui ne marche pas, piste envisagée.
5. En début de session, relire les 2-3 dernières entrées avant toute modification de code.
6. Toute information sur l'établissement/le pays doit rester absente de ce fichier si celui-ci est amené à être partagé hors contexte interne (cf. consigne S@dim sur les livrables).
