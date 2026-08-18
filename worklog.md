---
Task ID: 1
Agent: Main
Task: Fix Mistral AI provider integration — error parsing, dynamic models, UI info

Work Log:
- Investigated Mistral API connectivity from sandbox — confirmed reachable (HTTP 401 with invalid key)
- Discovered root cause: Mistral API returns errors in different format than OpenAI
  - OpenAI: `{"error": {"type": "...", "message": "..."}}`
  - Mistral: `{"object": "error", "message": "...", "code": "..."}` (top-level)
  - Mistral /models: `{"detail": "Invalid API Key"}`
- Fixed error parsing in `src/app/api/ai-test/route.ts` to handle both formats
- Fixed error parsing in `src/lib/ai/zai-client.ts` to handle both formats
- Fixed error parsing in `src/app/api/ai-models/route.ts` for auth errors
- Added "mistral" to DYNAMIC_MODEL_PROVIDERS in `src/lib/ai/ai-types.ts`
- Updated `getProviderFields()` to mark Mistral as dynamicModels provider
- Added Mistral-specific UI in `src/components/layout/app-header.tsx`:
  - Provider description with Mistral branding
  - Console link (console.mistral.ai) 
  - Info banner with key format hint
- Updated `handleProviderChange` to auto-set base URL for all known providers
- Added toast notifications for model fetch errors
- Added auto-select first model when fetched list doesn't contain current selection

Stage Summary:
- Mistral API key errors now properly parsed and shown in French
- Mistral models auto-fetched from /v1/models endpoint (like RoutesMe)
- Clear UI guidance for Mistral: console link, key format (no sk- prefix)
- All providers (OpenAI, Anthropic, Mistral, RoutesMe) auto-set base URL on selection
- Lint passes with 0 errors, 8 warnings (all pre-existing)

---
Task ID: 2
Agent: Main
Task: End-to-end verification with agent browser

Work Log:
- Opened app at http://localhost:3000/ — rendered correctly
- Opened AI Config dialog, selected Mistral AI provider
- Verified no 401 error toast on selection (fixed auto-fetch without API key)
- Verified Mistral-specific UI elements:
  - Provider description: "↯ Mistral AI — API compatible OpenAI"
  - Correct placeholder: "xxxxxxxxxxxxxxxxxxxxxxxx" (not "sk-...")
  - Console link: "console.mistral.ai" (shown twice)
  - Info banner with model descriptions and key format hint
  - Test button disabled when no key entered
  - Model dropdown shows "Choisir un modèle" with refresh button
- Closed browser, all tests passed

Stage Summary:
- All Mistral integration fixes verified in browser
- Error parsing correctly handles Mistral format (top-level message/detail)
- Dynamic model fetching only triggers when API key is present
- UI shows clear guidance for Mistral users

---
Task ID: 3
Agent: Main
Task: Test Mistral API with user's key and fix model sorting

Work Log:
- User provided Mistral API key for testing
- Direct curl tests confirmed Mistral API works from sandbox:
  - GET /v1/models → 55+ models returned
  - POST /v1/chat/completions → valid response from mistral-small-latest
- Internal API routes also work:
  - POST /api/ai-test → {"ok":true,"provider":"mistral","model":"mistral-small-latest"}
  - GET /api/ai-models → list of 55+ models
- Browser E2E test: Opened AI config → Selected Mistral → Entered key → Models auto-loaded → Test passed ("Connecté !")
- Improved model sorting in /api/ai-models:
  - Three-tier sorting: top models → chat models → utility models
  - Top tier (manual priority): mistral-small-latest, mistral-medium-latest, mistral-large-latest, gpt-4o-mini, etc.
  - Utility models (embed, ocr, tts, etc.) pushed to bottom
  - mistral-small-latest now auto-selected by default

Stage Summary:
- Mistral integration fully working end-to-end
- User's key confirmed valid, test passes with "Connecté !"
- Model list properly sorted: chat models first, utility models at bottom
- mistral-small-latest auto-selected as default model
- All previous fixes (error parsing, dynamic fetch, UI) verified working

---
Task ID: 2
Agent: Backend RAG Builder
Task: Build RAG backend (schema, service, API routes)

Work Log:
- Added DocumentChunk model to Prisma schema
- Ran db:push successfully
- Created rag-service.ts with chunkText, indexThesisContent, retrieveChunks, generateRagResponse
- Created /api/thesis-rag route with index and query actions
- Ran lint (0 errors)

Stage Summary:
- DocumentChunk table created with sourceType, sourceId, content, metadata
- RAG service handles chunking, indexing, retrieval, and generation
- API route exposes POST /api/thesis-rag with index and query actions
---
Task ID: 3
Agent: Frontend RAG Builder
Task: Build RAG frontend module "Mon IA de thèse"

Work Log:
- Created thesis-rag-page.tsx with chat UI, indexing, and query flow
- Registered "thesis-rag" in ViewId, NAVIGATION_ITEMS, and page.tsx router
- Lint passed (0 errors)

Stage Summary:
- Chat module with indexed document search
- Suggestion chips for quick questions
- Source badges with color coding per type
- Sticky input bar, auto-scroll, responsive layout

---
Task ID: main
Agent: Main orchestrator
Task: Build "Mon IA de thèse" RAG module end-to-end

Work Log:
- Analyzed all existing data sources: Chapter (plainText), Reference (abstract/notes), NotebookEntry (Q&A), ThesisCadrageField (values)
- Designed RAG architecture: keyword-based retrieval, no external vector DB, SQLite-only
- Backend agent: Created DocumentChunk Prisma model, rag-service.ts, /api/thesis-rag route
- Frontend agent: Created thesis-rag-page.tsx chat UI, registered in navigation + page router
- Verified lint: 0 errors, 8 pre-existing warnings
- Browser E2E test: module renders correctly with all UI elements
  - Title with Brain icon gradient
  - Warning banner when no thesis selected
  - Index bar with stats display
  - Chat area with empty state and 5 suggestion chips
  - Sticky input bar with Send button
  - Source badges (chapter=emerald, reference=sky, notebook=amber, cadrage=violet)

Stage Summary:
- NEW MODULE: "Mon IA de thèse" — RAG-based chat that indexes thesis content and answers questions with cited sources
- 4 data sources indexed: Chapters, References, NotebookEntries, Cadrage fields
- Backend: chunking, keyword retrieval, AI response with context injection
- Frontend: professional chat UI with markdown rendering, source badges, suggestion chips
- Zero disruption: new module only, no existing code modified (except app-store.ts and page.tsx for registration)

---
Task ID: 4
Agent: Main orchestrator
Task: Implement usage guide in "?" button next to Configuration

Work Log:
- Created `src/components/layout/usage-guide-dialog.tsx` — comprehensive guide with 7 categories, 31 sections covering all modules
- Created `src/components/layout/about-dialog.tsx` — About dialog with version info, tech stack, stats
- Created `src/components/layout/shortcuts-dialog.tsx` — Keyboard shortcuts dialog with 4 groups
- Updated `src/components/layout/app-header.tsx` — wired all 3 dropdown menu items to their dialogs, added icons (BookOpen, Keyboard, Info)
- Guide features: search filter, accordion navigation by category, keyword matching, responsive layout
- Categories: Démarrage rapide, Rédaction, Assistants IA, Bibliographie, Méthodologie, Qualité, Organisation, Export
- Lint: 0 errors, 8 pre-existing warnings (no new warnings)
- Browser E2E verified: all 3 dialogs open correctly from "?" dropdown menu

Stage Summary:
- "Guide d'utilisation" — searchable, accordion-based, 31 documented modules across 7 categories
- "Raccourcis clavier" — 4 groups (Navigation, Éditeur, Fenêtre, Aide) with styled kbd elements
- "À propos de ThesisFrame" — version, stats (30+ modules, 5 IA providers), tech stack badges, GitHub link
- Zero disruption to existing functionality

---
Task ID: 5
Agent: Main orchestrator
Task: Implement AI-powered text prediction (ghost text + popup) in thesis editor

Work Log:
- Analyzed GitHub repo DivanshiJain2005/text-prediction (LSTM-based Python) — adapted concept for Next.js using AI providers
- Created `src/app/api/text-prediction/route.ts` — API endpoint for academic text completion (French-tuned system prompt, returns primary + 2 alternatives, format: "primary|||alt1|||alt2")
- Created `src/modules/editor/extensions/ai-prediction.ts` — TipTap extension with ProseMirror plugin:
  - Ghost text widget decoration (grey italic text after cursor)
  - Loading dots animation while API call in progress
  - Debounced (1s) API call on typing pause
  - Tab key to accept suggestion, Esc to dismiss
  - AbortController for cancelling in-flight requests on cursor movement
  - Plugin state machine: suggestion → loading → idle, with proper clearing on doc/selection changes
- Created `src/modules/editor/components/prediction-popup.tsx` — Floating popup (React Portal) near cursor:
  - Shows primary suggestion with Sparkles icon (clickable)
  - Up to 2 alternative completions (clickable)
  - Tab hint + Esc/X dismiss button
  - Fade in/out animation
- Updated `src/modules/editor/components/tiptap-editor.tsx` — Added AiPrediction extension + PredictionPopup component
- Updated `src/modules/editor/components/editor-toolbar.tsx` — Added Sparkles toggle button (AI prediction on/off)
- Fixed SSR error: guarded `this.editor` access in isEnabled getter and toggleEnabled
- Lint: 0 errors, 8 pre-existing warnings (no new)
- Browser E2E: editor renders correctly, toolbar includes prediction toggle, no runtime errors

Stage Summary:
- NEW FEATURE: AI text prediction in thesis editor (like Gmail Smart Compose)
- Architecture: TipTap extension (ProseMirror plugin) → API route → configured AI provider
- Ghost text: inline grey italic text appears after cursor when user pauses typing
- Popup: floating card with primary + alternative suggestions, Tab to accept, Esc to dismiss
- Toggle: Sparkles button in toolbar to enable/disable prediction
- Works with all configured providers (Z.ai, Mistral, OpenAI, Anthropic, RoutesMe, Custom)
- Zero modification to existing editor functionality

---
Task ID: 6
Agent: Main orchestrator
Task: Push commits, update FICHE_SYNTHESE, create GitHub release v1.3.0

Work Log:
- Pushed 4 commits to origin/main (3 existing + 1 fiche update)
- Updated FICHE_SYNTHESE.md comprehensively:
  - Date: 28 juin → 10 juillet 2025
  - Journal des jalons: +7 new entries (RoutesMe, Mistral fix, RAG, Guide, Text prediction)
  - Stack: Tiptap 6 → 7 extensions (AI prediction)
  - API routes: 36 → 39 (+ai-models, +thesis-rag, +text-prediction)
  - Modules: 27 → 29 (+thesis-rag, editor prediction feature)
  - DB models: 14 → 15 (+DocumentChunk for RAG)
  - New module 2.29: Mon IA de thèse — RAG
  - Updated 2.2 Editor: text prediction feature
  - New sections 3.8 (RAG) and 3.9 (Text Prediction)
  - Architecture IA: dynamic model providers, dual error parsing
  - Critical files: +rag-service.ts, +ai-prediction.ts
- Created GitHub release v1.3.0 via API (authenticated)
  - Tag: v1.3.0, target: main
  - Title: "v1.3.0 — RAG, Prédiction IA, Mistral, Guide"
  - Comprehensive release notes with all features, improvements, architecture changes, and file lists
  - Release ID: 371380716
  - URL: https://github.com/freemind25/Ma-These/releases/tag/v1.3.0

Stage Summary:
- All commits pushed to origin/main
- FICHE_SYNTHESE updated to v1.3.0 with all new features documented
- GitHub release v1.3.0 published with full changelog

---
Task ID: 7
Agent: Main orchestrator
Task: Restore Tauri v2 integration for Windows .exe/.msi desktop build

Work Log:
- Verified old repo had Tauri v2 (scripts tauri:dev/tauri:build, deps @tauri-apps/api v2, @tauri-apps/cli v2)
- Added Tauri deps to package.json: @tauri-apps/api ^2, @tauri-apps/plugin-shell ^2, @tauri-apps/cli ^2
- Added scripts: tauri, tauri:dev, tauri:build, build:tauri
- Created src-tauri/ directory with complete Tauri v2 setup:
  - Cargo.toml (tauri v2, serde, shell plugin)
  - build.rs (tauri_build)
  - tauri.conf.json (window 1400x900, NSIS FR/EN, MSI, resources db/* + public/*)
  - capabilities/default.json (core:default, shell:allow-open, shell:allow-execute)
  - src/main.rs (windows_subsystem="windows")
  - src/lib.rs (setup: Windows DB path, data dir creation, env var)
- Generated icons via sharp: 32x32, 128x128, 128x128@2x, icon.png (512), icon.ico
- Updated next.config.ts: images.unoptimized = true (Tauri compatibility)
- Updated .gitignore: src-tauri/target/, src-tauri/gen/, scripts/, *.exe, *.msi
- Created TAURI_BUILD.md: complete build guide (prerequisites, build steps, artifacts, structure)
- Updated FICHE_SYNTHESE:
  - §1.1 Stack: added Rust (Tauri v2), Desktop shell, Tauri plugins
  - §1.2 Structure: added src-tauri/ tree, TAURI_BUILD.md, Caddyfile
  - §3.2 Distribution desktop: full architecture, workflow, artifacts, scripts, prerequisites
  - Renumbered §3.3→§3.10 accordingly
  - §4.4 Config Next.js: added images.unoptimized
  - §4.5 Config Tauri v2: tauri.conf.json, capabilities, Cargo.toml, scripts
- Updated GitHub release v1.3.0: new name "RAG, Prédiction IA, Tauri Desktop", added desktop section

Stage Summary:
- Tauri v2 integration fully restored with all config files
- 16 files committed (6 new, 10 modified)
- FICHE_SYNTHESE updated across 6 sections (1.1, 1.2, 3.2, 3.3-3.10, 4.4, 4.5)
- Release v1.3.0 updated with Tauri desktop section
- Lint: 0 errors, 15 warnings (all pre-existing)
---
Task ID: 8
Agent: Main orchestrator
Task: Build verification-carto module (Module A rule-based + Module B socratic questioner)

Work Log:
- Added 3 Prisma models: ElementAnalyse, TypeAnalyseMethodologique, SessionVerification
- Pushed schema to SQLite DB successfully
- Created API routes: /api/elements-analyse (CRUD), /api/types-analyse (CRUD + seed), /api/verification-carto (Module A + B + sessions)
- Created referential seed: analyse_urbaine with 4 phases, 37 typeElements, socratic prompt
- Built frontend module: verification-carto-page.tsx (~1229 lines, 3 tabs)
- Registered module in app-store.ts and page.tsx
- Lint: 0 errors, 9 pre-existing warnings
- API tests: all 7 endpoints verified (seed, list types, create elements, list elements, completude blocking, completude phases, sessions)
- Module A correctly implements: prerequisite blocking, phase evaluation, rule-based (no LLM)

Stage Summary:
- NEW MODULE: Vérification cartographique — methodological completeness checker + socratic questioner
- Module A: rule-based list comparison (no AI), prerequisite blocking, 37 elements in 5 phases
- Module B: LLM-powered socratic questioner with strict guardrails (no declarative sentences)
- Referential: analyse_urbaine with BENYOUCEF/PANERAI methodology (cadrage, anatomie, physiologie, transversales)
- Generalized architecture: adding a new discipline = adding one row in TypeAnalyseMethodologique

---
Task ID: 2
Agent: fullstack-dev
Task: Fix auto-edition module with correct 8C criteria, interactive checklists, and scientific article checklist

Work Log:
- Analyzed existing auto-edition-page.tsx: had 8 WRONG criteria (Clarté, Cohérence, Concision, Correction, Complétude, Crédibilité, Cohésion, Contextualisation)
- Read fiche 05 (auto-edition-8c) from corpus-publication.ts to extract correct 8C definitions, diagnostic questions, and scientific checklist
- Replaced all 8 criteria with correct Gastel & Day 8C:
  1. Conformité (Shield) — compliance with templates/terminology conventions
  2. Exhaustivité (Layers) — completeness of expected elements
  3. Composition (Workflow) — appropriate overall structure
  4. Exactitude (CheckCircle) — correctness in text, tables, figures, references
  5. Clarté (Eye) — ambiguous terms defined, abbreviations explained
  6. Cohérence (Link) — consistent numbers across text/tables, stable terminology
  7. Concision (Minimize2) — no redundancies or tangential content
  8. Courtoisie (Heart) — neutral tone toward prior work, inclusive language
- Restructured component with 3 Tabs (shadcn/ui Tabs):
  - Tab 1 "Analyse IA": Kept existing AI scoring with parallel analysis via /api/ai-writing (mode: peer-review), 8 criteria cards, progress, accordion report, history
  - Tab 2 "Checklist 8C": Interactive manual diagnostic checklist — each C has diagnostic question as header + 2-4 sub-item checkboxes, progress bar, reading method guidance card at top
  - Tab 3 "Checklist article": 7-item scientific article specialized checklist with numbered items, checkboxes, progress bar, completion message
- Added "Valeur ajoutée unique" rose-colored badge on Courtoisie in both AI analysis grid/cards and checklist 8C, since it's not covered by standard grammar checkers
- Added Info card at top of Tab 2: "Vérifier les 8C en passes successives. La dernière passe doit être linéaire, du début à la fin."
- Embedded diagnostic questions from fiche 05 directly in CHECKLIST_8C constant (avoided importing corpus-publication.ts due to single-line file causing TypeScript module resolution issues)
- Fixed Unicode box-drawing character (═) in JSX comments causing TS1005 parse errors — removed offending comment lines
- Used existing shadcn/ui components: Card, Tabs, TabsList, TabsTrigger, TabsContent, Checkbox, Badge, Progress, Accordion, Separator
- Used Lucide icons: Eye, Link, Minimize2, CheckCircle, Layers, Shield, Workflow, Heart, Sparkles, FileText, Info, ClipboardCheck, BookOpenCheck, Star
- Lint: 0 errors, 9 pre-existing warnings (all pre-existing, none new)
- TypeScript: 0 new errors (1 pre-existing in types-analyse/route.ts)

Stage Summary:
- Rewrote auto-edition-page.tsx: 3 tabs, correct 8C criteria (Gastel & Day), interactive checklists
- Tab 1 (Analyse IA): Parallel AI scoring of 8 correct criteria with progress, grid, accordion, history
- Tab 2 (Checklist 8C): Manual diagnostic tool with 8 groups, 26 sub-items, progress bar, reading method guidance
- Tab 3 (Checklist article): 7-item scientific article specialized checklist with progress
- Courtoisie highlighted with "Valeur ajoutée unique" badge (rose-colored) in both AI and checklist tabs
- Diagnostic questions sourced from fiche 05 (auto-edition-8c) questionsDiagnostics, embedded in component

---
Task ID: 3
Agent: Main orchestrator
Task: Enrich directeur-chat system with corpus-aware contextual fiche injection

Work Log:
- Read existing directeur-chat API route (src/app/api/directeur-chat/route.ts) — simple POST with system prompt, thesis context, conversation history, AI completion
- Read directeur-prompt.ts — 5 sections (personality, role, feedback method, constraints)
- Read corpus-publication.ts — 6 fiches with exported functions: detectRelevantFiches(), getFichesContentForPrompt(), getAllFiches(), getFicheById()
- Enriched DIRECTEUR_SYSTEM_PROMPT in directeur-prompt.ts with:
  - Doctrine note in CONTRAINTES: "corpus doctrinal injecté en contexte doit être utilisé EN CRITIQUE, JAMAIS EN GÉNÉRATION DE CONTENU DE SUBSTITUTION"
  - New section "CRITÈRES SUPPLÉMENTAIRES (corpus publication scientifique)" with 4 topic-specific triggers:
    - Ethics/plagiarism: paraphrase insuffisance, salami science, ethical declarations, auto-plagiat
    - Results/discussion: intro/discussion coherence, text/table redundancy, orphan results or discussions
    - Non-native speaker: "fond avant forme" principle, reassurance on content vs language, practical resources
    - Journal choice: predatory signals, DORA principles, indexing verification (Scopus/WoS/DOAJ)
  - Always rule: critique only, NEVER generate substitution content, point to fiches without quoting verbatim
- Modified directeur-chat API route:
  - Added imports for detectRelevantFiches and getFichesContentForPrompt from @/data/corpus-publication
  - Extracts latest user message from conversation history (reverse search for role=user)
  - Calls detectRelevantFiches() on latest user message
  - If fiches detected, appends getFichesContentForPrompt() output to the system prompt
  - All existing functionality preserved (thesis context, conversation history, provider config, error handling)
- Created new API route /api/corpus-publication/route.ts:
  - GET: Returns all 6 fiches via getAllFiches()
  - POST { message: string, maxFiches?: number }: Returns detected fiche IDs + their full objects + formatted prompt content
  - Zod validation on POST body, proper error handling
- Lint: 0 errors, 9 pre-existing warnings (no new)
- Dev server: running normally, no compilation errors

Stage Summary:
- Directeur-chat now corpus-aware: relevant fiches automatically injected into system prompt based on user message content
- System prompt enriched with 4 topic-specific criteria zones (ethics, results/discussion, non-native, journal choice) + always-on critique-only doctrine
- New API route /api/corpus-publication with GET (all fiches) and POST (signal detection + content retrieval)
- Zero disruption: all existing directeur-chat functionality preserved unchanged

---
Task ID: 4
Agent: Main
Task: Add predatory journal detection to journaux-oa module

Work Log:
- Read worklog.md for project context and existing journaux-oa-page.tsx implementation
- Added DORA principle info callout at top of page (sky/blue styling with Info icon)
- Added collapsible section "Évaluer la légitimité d'une revue" using shadcn/ui Collapsible component
- Created ALERT_SIGNALS constant (5 items): unrealistic promises, dubious website, fabricated metrics, no verifiable articles, aggressive solicitation
- Created LEGITIMACY_SIGNALS constant (3 items): recognized indexing, university catalog, trusted authors
- Built reactive verdict card with 3 levels: green (0 alerts), amber (1-2 alerts), red (3+ alerts)
- Legitimacy count displayed in verdict: "X/3 signaux de légitimité confirmés"
- Warning checkboxes use destructive/red styling (red borders, backgrounds, text)
- Legitimacy checkboxes use emerald/green styling (green borders, backgrounds, text)
- Used shadcn/ui components: Card, Checkbox, Collapsible/CollapsibleTrigger/CollapsibleContent, Separator, Button, Badge
- Used Lucide icons: AlertTriangle (red), ShieldCheck (green), Info (blue), ChevronDown, CheckCircle2, TriangleAlert, XCircle
- State management: local useState for alertChecks and legitimacyChecks, verdict computed via useMemo
- All existing functionality preserved: search, filters, AI ranking, CSV export, journal cards, skeleton loader
- Lint: 0 errors, 9 warnings (all pre-existing)

Stage Summary:
- NEW FEATURE: Predatory journal detection section in Journaux OA module
- DORA principle callout at top of page with Info icon and blue styling
- Collapsible "Évaluer la légitimité d'une revue" section with:
  - 5 alert signal checkboxes (red/destructive styling) with helper descriptions
  - 3 legitimacy signal checkboxes (emerald/green styling) with helper descriptions
  - Reactive verdict card: green/amber/red based on alert count
  - Legitimacy count indicator
- Zero disruption: all existing search, filter, rank, export functionality unchanged

---
Task ID: 5
Agent: Main
Task: Create /api/verification-publication route with 4 publication verification actions

Work Log:
- Read worklog.md for project context and existing patterns
- Read ai-writing/route.ts to understand generateCompletion usage (messages, temperature, providerConfig)
- Read zai-client.ts to understand AiMessage, AiCompletionOptions, AiProviderConfig types
- Created src/app/api/verification-publication/route.ts with 4 actions:
  - Action 1 "intro-discussion-coherence": LLM-based analysis of intro/discussion coherence
    - Extracts research questions/hypotheses from introduction
    - Checks if discussion explicitly answers each question
    - Identifies orphan results in discussion
    - Evaluates inverted funnel structure (specific → broader)
    - Returns: questions[], orphanResults[], funnelStructure{}, overallCoherence (0-10)
  - Action 2 "table-quality": Rule-based + LLM hybrid
    - Rule-based: parseTable() handles markdown, tab-separated, CSV formats
    - Signal 1: Identical column values (>70% threshold)
    - Signal 2: Binary symbols (+, -, +/-) >70% of data cells
    - Signal 3: Non-significant results ("non significatif", "ns", "p > 0.05")
    - LLM: asks if table could be replaced by a sentence without information loss
    - Returns: signals[], llmVerdict{}, overallScore (0-10)
  - Action 3 "paragraph-structure": LLM-based paragraph analysis
    - Splits text into paragraphs by double newline
    - LLM identifies paragraphs without direct topic sentence opening
    - LLM detects paragraphs that circle around the point
    - Returns: paragraphs[] with index, preview (80 chars), hasDirectOpening, issue
  - Action 4 "text-table-redundancy": LLM-based redundancy check
    - LLM checks if text redundantly reformulates table/figure content
    - Distinguishes acceptable interpretation vs pure data repetition
    - Returns: isRedundant, redundantPhrases[], suggestion
- All actions: robust JSON parsing (strips markdown code blocks), proper error handling, French error messages
- Used NextRequest/NextResponse, generateCompletion with providerConfig
- Lint: 0 errors, 9 pre-existing warnings (no new)

Stage Summary:
- NEW API: POST /api/verification-publication with 4 verification actions
- intro-discussion-coherence: full LLM analysis of question/answer coherence between intro and discussion
- table-quality: 3 rule-based signals (identical columns, binary symbols, non-significant) + LLM justification verdict
- paragraph-structure: L2 writing support detecting paragraphs needing topic sentence restructure
- text-table-redundancy: detects redundant data reformulation between text and tables/figures
- All responses JSON with robust parsing, French error messages, _aiConfig support

---
Task ID: 6
Agent: Main
Task: Add L2 support features to auto-edition module and integrate verification-publication API

Work Log:
- Read existing auto-edition-page.tsx (3 tabs: Analyse IA, Checklist 8C, Checklist article, 1192 lines)
- Read worklog.md for project context and verification-publication API (4 actions created in Task 5)
- Added imports: useToast, Dialog components, Collapsible components, new Lucide icons (ArrowRightLeft, Table2, CopyX, ChevronDown, XCircle, Languages, AlignLeft)
- Added 5 new TypeScript interfaces: ParagraphResult, IntroDiscussionResult, TableQualitySignal, TableQualityResult, RedundancyResult
- Added state management for Tab 4 (L2): l2StructureText, l2IsAnalyzing, l2ParagraphResults, l2FondFormeChecks
- Added state management for Tab 1 verification dialogs: intro/discussion texts + results, table content + results, redundancy texts + results, 3 dialog open states
- Changed TabsList from grid-cols-3 to grid-cols-4, added Tab 4 trigger with Languages icon
- Added Tab 4 "Langue seconde & structure" with:
  - Section A: "Fond avant forme" info card (sky/blue background) with principle explanation, 2 checkboxes, progress indicator
  - Section B: "Analyse de la structure des paragraphes" — Textarea + "Analyser les paragraphes" button calling POST /api/verification-publication action "paragraph-structure"
  - Results display: paragraph list with number, preview (80 chars), green checkmark / red X for hasDirectOpening, amber warning for issues
- Added Tab 1 "Vérifications publication" collapsible section with 3 Dialog-based tools:
  1. "Cohérence intro/discussion" (ArrowRightLeft icon) — 2 textareas + verify button → shows questions with green/red X, orphan results, funnel structure score
  2. "Qualité d'un tableau" (Table2 icon) — 1 textarea + analyze button → shows 3 color signals (green/gray/red), LLM verdict
  3. "Redondance texte/tableau" (CopyX icon) — 2 textareas + verify button → shows verdict + redundant phrases
- All 3 dialog features use useAiConfig withAiConfig pattern, loading states with Loader2, error handling with toast
- Fixed JSX parsing error: missing closing `}` in template literal className expression on LLM Verdict div
- Lint: 0 errors, 9 pre-existing warnings (no new)

Stage Summary:
- Tab 4 "Langue seconde & structure" added to auto-edition module
- Section A: "Fond avant forme" principle card with 2 checkboxes + progress (content-first editing philosophy)
- Section B: AI-powered paragraph structure analysis via /api/verification-publication paragraph-structure action
- Tab 1 enriched: "Vérifications publication" collapsible with 3 dialog-based verification tools
- Cohérence intro/discussion: checks question/answer mapping + inverted funnel structure
- Qualité d'un tableau: 3 rule-based signals + LLM verdict on table value
- Redondance texte/tableau: detects redundant data reformulation between text and tables/figures
- Zero disruption: all existing 3 tabs and functionality preserved unchanged---
Task ID: 1
Agent: Main
Task: Créer le corpus de données publication scientifique (6 fiches structurées + orchestration)

Work Log:
- Créé src/data/corpus-publication.ts avec 6 fiches (ethique, choisir-revue, resultats-discussion, tableaux-figures, auto-edition-8c, langue-seconde)
- Chaque fiche contient: id, titre, source, signaux (keywords), contenu markdown, questionsDiagnostics, pointsIntegration
- Implémenté detectRelevantFiches() pour le routage contextuel basé sur les signaux
- Implémenté getFichesContentForPrompt() pour l'injection dans les prompts système
- Ajouté CORPUS_ORCHESTRATION_RULES (max 2 fiches, pair complémentaire 03/04, doctrine critique-only)

Stage Summary:
- Fichier créé: src/data/corpus-publication.ts (30KB)
- 6 fiches structurées avec détection de signaux
- Système d'orchestration opérationnel

---
Task ID: 2
Agent: fullstack-dev
Task: Corriger le module auto-édition avec les vrais 8C + checklist interactive + checklist scientifique

Work Log:
- Remplacé les 8 critères faux (Clarté/Cohérence/Concision/Correction/Complétude/Crédibilité/Cohésion/Contextualisation) par les vrais (Conformité/Exhaustivité/Composition/Exactitude/Clarté/Cohérence/Concision/Courtoisie)
- Ajouté 3 onglets: Analyse IA, Checklist 8C, Checklist article
- Tab 2: checklist interactive manuelle avec 26 sous-items, barre de progression, guide de méthode de relecture
- Tab 3: 7 items de la checklist scientifique spécialisée
- Badge "Valeur ajoutée unique" sur la Courtoisie

Stage Summary:
- Fichier modifié: src/modules/auto-edition/auto-edition-page.tsx (1927 lignes)
- 0 erreurs lint

---
Task ID: 3
Agent: fullstack-dev
Task: Enrichir directeur-chat avec injection contextuelle du corpus + API corpus

Work Log:
- Modifié src/data/directeur-prompt.ts: ajout section CRITÈRES SUPPLÉMENTAIRES (ethique, resultats/discussion, L2, choix revue)
- Modifié src/app/api/directeur-chat/route.ts: détection automatique des fiches pertinentes + injection dans le prompt système
- Créé src/app/api/corpus-publication/route.ts: GET (toutes fiches) + POST (détection + contenu)

Stage Summary:
- 2 fichiers modifiés, 1 créé
- Le directeur-chat injecte désormais automatiquement le contenu des fiches pertinentes
- 0 erreurs lint

---
Task ID: 4
Agent: fullstack-dev
Task: Ajouter la détection de revues prédatrices dans journaux-oa

Work Log:
- Ajouté un bandeau info DORA en haut du module
- Ajouté section collapsible « Évaluer la légitimité d'une revue »
- 5 signaux d'alerte (checkboxes rouges) + 3 signaux de légitimité (checkboxes verts)
- Verdict réactif: vert (0 alertes), ambre (1-2), rouge (3+)

Stage Summary:
- Fichier modifié: src/modules/journaux-oa/journaux-oa-page.tsx (887 lignes)
- 0 erreurs lint

---
Task ID: 5
Agent: fullstack-dev
Task: Créer l'API de vérification publication

Work Log:
- Créé src/app/api/verification-publication/route.ts avec 4 actions:
  1. intro-discussion-coherence (LLM): extraction questions, vérification réponses, entonnoir inversé
  2. table-quality (rules + LLM): 3 signaux rule-based + verdict LLM
  3. paragraph-structure (LLM): détection paragraphes sans phrase d'ouverture directe
  4. text-table-redundancy (LLM): détection redondance texte/tableau

Stage Summary:
- Fichier créé: src/app/api/verification-publication/route.ts (20KB)
- 0 erreurs lint

---
Task ID: 6
Agent: fullstack-dev
Task: Ajouter le support L2 et les vérifications publication au module auto-édition

Work Log:
- Ajouté Tab 4 « Langue seconde & structure » avec:
  - Section « Fond avant forme » (carte info + 2 checkboxes + progression)
  - Section « Analyse structure paragraphes » (textarea + appel API paragraph-structure + résultats)
- Ajouté section collapsible « Vérifications publication » dans Tab 1 avec 3 Dialog:
  1. Cohérence intro/discussion (2 textareas + résultats questions/orphan/entonnoir)
  2. Qualité d'un tableau (1 textarea + 3 signaux + verdict LLM)
  3. Redondance texte/tableau (2 textareas + verdict + phrases redondantes)

Stage Summary:
- Fichier modifié: src/modules/auto-edition/auto-edition-page.tsx
- 0 erreurs lint, 0 nouvelles warnings
- Serveur de dév fonctionnel

---
Task ID: 1-a
Agent: Explore
Task: Exhaustive inventory of all API routes

Work Log:
- Read all 39 route.ts files under src/app/api/
- Checked for Supabase references (none found — app uses Prisma with SQLite)
- Checked for z-ai-web-dev-sdk usage (3 files: ai-test route, zai-client.ts, ai-types.ts)
- Checked for external API calls (3 routes make outbound fetch: ai-test, ai-models, journaux-oa)
- Checked for route.ts files outside src/app/api/ (none found)
- Documented every route: HTTP methods, description, implementation status, dependencies

Stage Summary:
- 39 route files found across 24 URL paths
- 0 stubs/placeholders, 1 minimal health-check (/api)
- 3 routes use external services: OpenAlex API, DOAJ API, z-ai-web-dev-sdk
- No Supabase usage; all DB operations via Prisma/SQLite
- Full structured inventory appended below

---
## EXHAUSTIVE API ROUTE INVENTORY (39 files, 24 URL paths)

### 1. /api (root)
| # | File Path | Methods | Description | Status | Key Dependencies |
|---|-----------|---------|-------------|--------|-----------------|
| 1 | src/app/api/route.ts | GET | Health check — returns `{message: "Hello, world!"}` | **Stub/Placeholder** | next/server |

### 2. /api/thesis-rag
| # | File Path | Methods | Description | Status | Key Dependencies |
|---|-----------|---------|-------------|--------|-----------------|
| 2 | src/app/api/thesis-rag/route.ts | POST | RAG pipeline: action="index" (chunk & store thesis content) or action="query" (retrieve + AI answer) | **Fully implemented** | @/lib/rag/rag-service (db, zai-client), AiProviderConfig |

### 3. /api/chapters/[id]
| # | File Path | Methods | Description | Status | Key Dependencies |
|---|-----------|---------|-------------|--------|-----------------|
| 3 | src/app/api/chapters/[id]/route.ts | PUT, DELETE | Update or delete a single chapter | **Fully implemented** | db (Prisma), @/lib/api-schemas (updateChapterSchema), zod/v4 |

### 4. /api/elements-analyse
| # | File Path | Methods | Description | Status | Key Dependencies |
|---|-----------|---------|-------------|--------|-----------------|
| 4 | src/app/api/elements-analyse/route.ts | GET, POST | List analysis elements (filter by natureElement, sousAnalyse) or create one | **Fully implemented** | db, zod/v4 |

### 5. /api/elements-analyse/[id]
| # | File Path | Methods | Description | Status | Key Dependencies |
|---|-----------|---------|-------------|--------|-----------------|
| 5 | src/app/api/elements-analyse/[id]/route.ts | GET, PATCH, DELETE | Get, update (partial), or delete a single element | **Fully implemented** | db, zod/v4 |

### 6. /api/stats
| # | File Path | Methods | Description | Status | Key Dependencies |
|---|-----------|---------|-------------|--------|-----------------|
| 6 | src/app/api/stats/route.ts | GET | Dashboard aggregated statistics (thesis count, chapters, word count, references, active sprints, progress %) | **Fully implemented** | db (Prisma) |

### 7. /api/geo-mcp
| # | File Path | Methods | Description | Status | Key Dependencies |
|---|-----------|---------|-------------|--------|-----------------|
| 7 | src/app/api/geo-mcp/route.ts | GET, POST | GET: health/list_tools (MCP tool discovery). POST: invoke a geographic MCP tool | **Fully implemented** | @/lib/geo-mcp-tools (GEO_MCP_TOOLS, callGeoMcpTool) |

### 8. /api/sprints
| # | File Path | Methods | Description | Status | Key Dependencies |
|---|-----------|---------|-------------|--------|-----------------|
| 8 | src/app/api/sprints/route.ts | GET, POST | List sprints (filter by phase/status) or create a sprint | **Fully implemented** | db, @/lib/api-schemas (createSprintSchema), zod/v4 |

### 9. /api/sprints/[id]
| # | File Path | Methods | Description | Status | Key Dependencies |
|---|-----------|---------|-------------|--------|-----------------|
| 9 | src/app/api/sprints/[id]/route.ts | GET, PUT, DELETE | Get sprint with stories, update sprint fields, delete sprint (cascade deletes stories) | **Fully implemented** | db, @/lib/api-schemas (updateSprintSchema), zod/v4 |

### 10. /api/sprints/[id]/stories
| # | File Path | Methods | Description | Status | Key Dependencies |
|---|-----------|---------|-------------|--------|-----------------|
| 10 | src/app/api/sprints/[id]/stories/route.ts | GET, POST | List stories for a sprint, or create a story in a sprint | **Fully implemented** | db, @/lib/api-schemas (createStorySchema), zod/v4 |

### 11. /api/ai-test
| # | File Path | Methods | Description | Status | Key Dependencies |
|---|-----------|---------|-------------|--------|-----------------|
| 11 | src/app/api/ai-test/route.ts | POST | Test AI provider connectivity (z.ai SDK or OpenAI/Anthropic/Mistral API). Parses errors in OpenAI + Mistral formats. | **Fully implemented** | **z-ai-web-dev-sdk**, @/lib/ai/ai-provider (detectBackend, getBaseUrl), AiProviderConfig |

### 12. /api/cadrages/fields/[fieldId]
| # | File Path | Methods | Description | Status | Key Dependencies |
|---|-----------|---------|-------------|--------|-----------------|
| 12 | src/app/api/cadrages/fields/[fieldId]/route.ts | PUT, DELETE | Update or delete a specific cadrage field | **Fully implemented** | db, @/lib/api-schemas (updateCadrageFieldSchema), zod/v4 |

### 13. /api/cadrages/[id]
| # | File Path | Methods | Description | Status | Key Dependencies |
|---|-----------|---------|-------------|--------|-----------------|
| 13 | src/app/api/cadrages/[id]/route.ts | PUT, DELETE | Update cadrage label/isActive (deactivates other cadrages if activating), or delete cadrage | **Fully implemented** | db, @/lib/api-schemas (updateCadrageSchema), zod/v4 |

### 14. /api/cadrages/[id]/fields
| # | File Path | Methods | Description | Status | Key Dependencies |
|---|-----------|---------|-------------|--------|-----------------|
| 14 | src/app/api/cadrages/[id]/fields/route.ts | GET, POST | List fields for a cadrage, or add a field | **Fully implemented** | db, @/lib/api-schemas (createCadrageFieldSchema), zod/v4 |

### 15. /api/cadrages/[id]/versions
| # | File Path | Methods | Description | Status | Key Dependencies |
|---|-----------|---------|-------------|--------|-----------------|
| 15 | src/app/api/cadrages/[id]/versions/route.ts | GET, POST | List versions (snapshots) for a cadrage, or snapshot all fields as a new version | **Fully implemented** | db, zod/v4 |

### 16. /api/directeur-chat
| # | File Path | Methods | Description | Status | Key Dependencies |
|---|-----------|---------|-------------|--------|-----------------|
| 16 | src/app/api/directeur-chat/route.ts | POST | Chat with AI thesis director. Auto-detects relevant publication corpus fiches and injects them into system prompt. | **Fully implemented** | @/lib/ai/zai-client (generateCompletion), @/data/directeur-prompt (DIRECTEUR_SYSTEM_PROMPT), @/data/corpus-publication (detectRelevantFiches, getFichesContentForPrompt), AiProviderConfig, zod/v4 |

### 17. /api/entries
| # | File Path | Methods | Description | Status | Key Dependencies |
|---|-----------|---------|-------------|--------|-----------------|
| 17 | src/app/api/entries/route.ts | GET, POST | List all notebook entries (filter by search/tags), or create a standalone entry | **Fully implemented** | db, @/lib/api-schemas (createNotebookEntrySchema), zod/v4 |

### 18. /api/entries/[id]
| # | File Path | Methods | Description | Status | Key Dependencies |
|---|-----------|---------|-------------|--------|-----------------|
| 18 | src/app/api/entries/[id]/route.ts | PUT, DELETE | Update or delete a notebook entry | **Fully implemented** | db, @/lib/api-schemas (updateNotebookEntrySchema), zod/v4 |

### 19. /api/ai-config
| # | File Path | Methods | Description | Status | Key Dependencies |
|---|-----------|---------|-------------|--------|-----------------|
| 19 | src/app/api/ai-config/route.ts | GET, POST | List all AI tool configurations, or create one | **Fully implemented** | db, @/lib/api-schemas (createAiConfigSchema), zod/v4 |

### 20. /api/ai-config/[id]
| # | File Path | Methods | Description | Status | Key Dependencies |
|---|-----------|---------|-------------|--------|-----------------|
| 20 | src/app/api/ai-config/[id]/route.ts | PUT, DELETE | Update or delete an AI tool configuration | **Fully implemented** | db, @/lib/api-schemas (updateAiConfigSchema), zod/v4 |

### 21. /api/ai-writing
| # | File Path | Methods | Description | Status | Key Dependencies |
|---|-----------|---------|-------------|--------|-----------------|
| 21 | src/app/api/ai-writing/route.ts | GET, POST | GET: list available writing modes. POST: generate AI writing assistance using a selected mode | **Fully implemented** | @/lib/ai/zai-client (generateCompletion), @/data/ai-writing-modes (WRITING_MODES), AiProviderConfig, zod/v4 |

### 22. /api/text-prediction
| # | File Path | Methods | Description | Status | Key Dependencies |
|---|-----------|---------|-------------|--------|-----------------|
| 22 | src/app/api/text-prediction/route.ts | POST | AI text prediction for academic editor. Returns primary completion + 2 alternatives (|||-separated) | **Fully implemented** | @/lib/ai/zai-client (generateCompletion), AiProviderConfig |

### 23. /api/references/import
| # | File Path | Methods | Description | Status | Key Dependencies |
|---|-----------|---------|-------------|--------|-----------------|
| 23 | src/app/api/references/import/route.ts | POST | Bulk import references from .bib, .ris, or CSL-JSON files (multipart/form-data). Max 10 MB, 500 refs. | **Fully implemented** | db, @/lib/parsers (parseBibTex, parseRIS, parseCSLJSON, detectFormat) |

### 24. /api/references
| # | File Path | Methods | Description | Status | Key Dependencies |
|---|-----------|---------|-------------|--------|-----------------|
| 24 | src/app/api/references/route.ts | GET, POST | List references (filter by type/search/source/favorites), or create a reference | **Fully implemented** | db, @/lib/api-schemas (createReferenceSchema), zod/v4 |

### 25. /api/references/[id]
| # | File Path | Methods | Description | Status | Key Dependencies |
|---|-----------|---------|-------------|--------|-----------------|
| 25 | src/app/api/references/[id]/route.ts | PUT, DELETE | Update or delete a reference | **Fully implemented** | db, @/lib/api-schemas (updateReferenceSchema), zod/v4 |

### 26. /api/references/bibtex
| # | File Path | Methods | Description | Status | Key Dependencies |
|---|-----------|---------|-------------|--------|-----------------|
| 26 | src/app/api/references/bibtex/route.ts | GET | Export all references as BibTeX file (text/plain, attachment header) | **Fully implemented** | db |

### 27. /api/thesis
| # | File Path | Methods | Description | Status | Key Dependencies |
|---|-----------|---------|-------------|--------|-----------------|
| 27 | src/app/api/thesis/route.ts | GET, POST | List all theses (with chapter summaries), or create a thesis with 7 default chapters | **Fully implemented** | db, @/lib/api-schemas (createThesisSchema), zod/v4 |

### 28. /api/thesis/[id]
| # | File Path | Methods | Description | Status | Key Dependencies |
|---|-----------|---------|-------------|--------|-----------------|
| 28 | src/app/api/thesis/[id]/route.ts | GET, PUT, DELETE | Get thesis (with chapters, parts, active cadrages), update thesis metadata, or delete thesis | **Fully implemented** | db, @/lib/api-schemas (updateThesisSchema), zod/v4 |

### 29. /api/thesis/[id]/chapters
| # | File Path | Methods | Description | Status | Key Dependencies |
|---|-----------|---------|-------------|--------|-----------------|
| 29 | src/app/api/thesis/[id]/chapters/route.ts | GET, POST | List chapters for a thesis, or create a new chapter (auto-increments number) | **Fully implemented** | db, @/lib/api-schemas (createChapterSchema), zod/v4 |

### 30. /api/thesis/[id]/cadrages
| # | File Path | Methods | Description | Status | Key Dependencies |
|---|-----------|---------|-------------|--------|-----------------|
| 30 | src/app/api/thesis/[id]/cadrages/route.ts | GET, POST | List cadrages for a thesis (with fields), or create cadrage with initial fields (transaction: deactivates other active cadrages) | **Fully implemented** | db, @/lib/api-schemas (createCadrageSchema), zod/v4 |

### 31. /api/corpus-publication
| # | File Path | Methods | Description | Status | Key Dependencies |
|---|-----------|---------|-------------|--------|-----------------|
| 31 | src/app/api/corpus-publication/route.ts | GET, POST | GET: return all 6 publication corpus fiches (static data). POST: detect relevant fiches for a message | **Fully implemented** | @/data/corpus-publication (getAllFiches, detectRelevantFiches, getFichesContentForPrompt, getFicheById), zod/v4 |

### 32. /api/sources
| # | File Path | Methods | Description | Status | Key Dependencies |
|---|-----------|---------|-------------|--------|-----------------|
| 32 | src/app/api/sources/route.ts | GET, POST | List research sources (filter by type/search, includes entry count), or create a source | **Fully implemented** | db, @/lib/api-schemas (createResearchSourceSchema), zod/v4 |

### 33. /api/sources/[id]
| # | File Path | Methods | Description | Status | Key Dependencies |
|---|-----------|---------|-------------|--------|-----------------|
| 33 | src/app/api/sources/[id]/route.ts | GET, PUT, DELETE | Get source with entries, update source, or delete source (entries lose sourceId via SetNull) | **Fully implemented** | db, @/lib/api-schemas (updateResearchSourceSchema), zod/v4 |

### 34. /api/sources/[id]/entries
| # | File Path | Methods | Description | Status | Key Dependencies |
|---|-----------|---------|-------------|--------|-----------------|
| 34 | src/app/api/sources/[id]/entries/route.ts | GET, POST | List entries for a source (verifies source exists), or create entry linked to source | **Fully implemented** | db, @/lib/api-schemas (createNotebookEntrySchema), zod/v4 |

### 35. /api/verification-carto
| # | File Path | Methods | Description | Status | Key Dependencies |
|---|-----------|---------|-------------|--------|-----------------|
| 35 | src/app/api/verification-carto/route.ts | GET, POST | GET: list verification sessions. POST: 4 actions — "completude" (rule-based completeness check), "questionneur" (LLM Socratic questions), "save-session" (persist session), "geo-enrich" (MCP geographic enrichment) | **Fully implemented** | db, @/lib/ai/zai-client, @/lib/geo-mcp-client (geocode, validateCoords, elevation, bbox, area, geojson validation), zod/v4 |

### 36. /api/ai-models
| # | File Path | Methods | Description | Status | Key Dependencies |
|---|-----------|---------|-------------|--------|-----------------|
| 36 | src/app/api/ai-models/route.ts | GET | Fetch available models from an OpenAI-compatible /models endpoint. 5-min in-memory cache. Tiers models (top/chat/utility). | **Fully implemented** | External fetch to provider /models endpoint |

### 37. /api/types-analyse
| # | File Path | Methods | Description | Status | Key Dependencies |
|---|-----------|---------|-------------|--------|-----------------|
| 37 | src/app/api/types-analyse/route.ts | GET, POST | List methodological analysis types (filter by discipline), or create one | **Fully implemented** | db, zod/v4 |

### 38. /api/types-analyse/seed
| # | File Path | Methods | Description | Status | Key Dependencies |
|---|-----------|---------|-------------|--------|-----------------|
| 38 | src/app/api/types-analyse/seed/route.ts | POST | Seed the "analyse_urbaine" methodological referential (idempotent — skips if already exists) | **Fully implemented** | db |

### 39. /api/verification-publication
| # | File Path | Methods | Description | Status | Key Dependencies |
|---|-----------|---------|-------------|--------|-----------------|
| 39 | src/app/api/verification-publication/route.ts | POST | 4 publication verification actions: "intro-discussion-coherence" (LLM), "table-quality" (rule-based + LLM hybrid), "paragraph-structure" (LLM), "text-table-redundancy" (LLM) | **Fully implemented** | @/lib/ai/zai-client (generateCompletion), AiProviderConfig |

### 40. /api/journaux-oa
| # | File Path | Methods | Description | Status | Key Dependencies |
|---|-----------|---------|-------------|--------|-----------------|
| 40 | src/app/api/journaux-oa/route.ts | GET | Search OA journals from OpenAlex and/or DOAJ APIs. Normalized results, sorted by relevance. | **Fully implemented** | **External: api.openalex.org**, **External: api.doaj.org** (fetch) |

### 41. /api/stories/[id]
| # | File Path | Methods | Description | Status | Key Dependencies |
|---|-----------|---------|-------------|--------|-----------------|
| 41 | src/app/api/stories/[id]/route.ts | PUT, DELETE | Update or delete a single agile story | **Fully implemented** | db, @/lib/api-schemas (updateStorySchema), zod/v4 |

### 42. /api/search
| # | File Path | Methods | Description | Status | Key Dependencies |
|---|-----------|---------|-------------|--------|-----------------|
| 42 | src/app/api/search/route.ts | GET | Full-text search across all chapters (boolean: AND, OR, NOT). Returns snippets with relevance scoring. No query → stats only. | **Fully implemented** | db |

---
## SUMMARY

### External Service Dependencies
| Service | Routes Using It | Protocol |
|---------|----------------|----------|
| z-ai-web-dev-sdk (sandbox AI) | ai-test, directeur-chat, ai-writing, text-prediction, verification-carto, verification-publication, thesis-rag | SDK (not HTTP) |
| OpenAI-compatible APIs (OpenAI, Anthropic, Mistral, RoutesMe) | ai-test, ai-models | HTTPS fetch |
| OpenAlex (api.openalex.org) | journaux-oa | HTTPS fetch |
| DOAJ (api.doaj.org) | journaux-oa | HTTPS fetch |
| Geo MCP tools (local) | geo-mcp, verification-carto | Local function calls |

### Supabase Usage
- **NONE** — the application uses Prisma ORM with SQLite (local file-based database). No Supabase client, SDK, or configuration found anywhere in the codebase.

### Implementation Status
- **Fully implemented**: 38 of 39 routes
- **Stub/Placeholder**: 1 route (/api root — health check)
- **Partially implemented**: 0 routes

### HTTP Method Distribution
- GET: 17 routes
- POST: 18 routes
- PUT: 12 routes
- DELETE: 14 routes
- PATCH: 1 route (elements-analyse/[id])
- Total exported handler functions: 62

---
Task ID: 1-b
Agent: Explore
Task: Exhaustive inventory of every frontend module, page, and component

Work Log:
- Read /worklog.md for prior context
- Explored /src/app/ (layout.tsx, page.tsx, 49 API routes)
- Explored /src/lib/stores/app-store.ts (single Zustand store, 27 ViewIds)
- Explored /src/components/ (5 layout components, 1 dashboard, 47 shadcn/ui primitives, 2 providers)
- Explored /src/modules/ (27 module pages + 6 editor sub-components + 2 editor hooks + 1 editor extension)
- Explored /src/hooks/ (use-ai-config, use-mobile, use-toast)
- Explored /src/data/ (ai-writing-modes, directeur-prompt, corpus-publication)
- Verified all 27 NAVIGATION_ITEMS map 1:1 to actual page components in page.tsx (NO stubs, ModulePlaceholder exists but unused)
- Confirmed routing is client-side SPA via Zustand `currentView` state (no Next.js file-based routing for pages)
- Traced all fetch("/api/...") calls across 23 module files + dashboard + header
- Checked state management pattern per module

Stage Summary:
APPLICATION ARCHITECTURE:
- Single-page app: one page.tsx with `CurrentView` switch on Zustand store's `currentView`
- No /src/stores/ directory; Zustand store lives at /src/lib/stores/app-store.ts
- All 27 views are FULLY IMPLEMENTED (no stubs, no placeholders)
- Navigation is sidebar-based (AppSidebar) with collapsible icon mode

=== APP SHELL ===

1. /src/app/layout.tsx
   - Root layout: Geist fonts, ThemeProvider (dark/light/system), QueryProvider (React Query), Sonner toaster
   - HTML lang="fr", metadata: "ThesisFrame — Assistant de thèse"
   - Status: ✅ FULLY IMPLEMENTED

2. /src/app/page.tsx
   - Single client-side page. Renders: SidebarProvider > AppSidebar + AppHeader + CurrentView + AppFooter
   - 27-case switch mapping ViewId → component
   - Status: ✅ FULLY IMPLEMENTED

3. /src/components/layout/app-sidebar.tsx
   - Sidebar with: logo, NAVIGATION_ITEMS list, theme toggle (light/dark)
   - Icons from lucide-react via ICON_MAP, badges (IA, OA, RAG)
   - State: useAppStore (currentView, setCurrentView)
   - Status: ✅ FULLY IMPLEMENTED

4. /src/components/layout/app-header.tsx
   - Top bar: SidebarTrigger, breadcrumb (ThesisFrame > current module label)
   - Help dropdown: Usage Guide, Shortcuts, About dialogs
   - Settings dropdown: AI Config dialog, GitHub link
   - AI Config Dialog: provider select (zai/openai/anthropic/mistral/routesme/custom), API key input, model select (static or dynamic fetch), base URL, test connection button
   - API calls: /api/ai-test, /api/ai-models
   - State: Zustand (aiProvider), localStorage (thesisframe-ai-config)
   - Status: ✅ FULLY IMPLEMENTED

5. /src/components/layout/app-footer.tsx
   - Simple footer: "ThesisFrame v1.0.0" + tagline
   - Status: ✅ FULLY IMPLEMENTED

6. /src/components/layout/usage-guide-dialog.tsx
   - Modal with searchable accordion guide covering all modules
   - Status: ✅ FULLY IMPLEMENTED

7. /src/components/layout/about-dialog.tsx
   - Modal: app version, description, GitHub link, credits
   - Status: ✅ FULLY IMPLEMENTED

8. /src/components/layout/shortcuts-dialog.tsx
   - Modal listing keyboard shortcuts (editor, navigation, global)
   - Status: ✅ FULLY IMPLEMENTED

9. /src/components/layout/module-placeholder.tsx
   - Generic placeholder with "coming soon" message
   - Status: ✅ IMPLEMENTED but UNUSED (no module references it)

10. /src/components/theme-provider.tsx
    - next-themes wrapper for dark/light/system
    - Status: ✅ FULLY IMPLEMENTED

11. /src/components/providers/query-provider.tsx
    - React Query (TanStack Query) client provider with 30s staleTime
    - Status: ✅ FULLY IMPLEMENTED

=== ZUSTAND STORE ===

12. /src/lib/stores/app-store.ts
    - Single Zustand store with persist middleware
    - State: currentView (ViewId), sidebarOpen, theme, activeThesisId, activeChapterId, aiProvider
    - Actions: setCurrentView, toggleSidebar, setSidebarOpen, setActiveThesisId, setActiveChapterId, setAiProvider
    - Persisted to localStorage (key: thesisframe-app-store): theme, aiProvider, sidebarOpen
    - NAVIGATION_ITEMS: 27 items with id/label/icon/description/badge
    - ViewId union type with 27 values
    - Status: ✅ FULLY IMPLEMENTED

=== CUSTOM HOOKS ===

13. /src/hooks/use-ai-config.ts
    - Reads/saves AI provider config from localStorage (key: thesisframe-ai-config)
    - useSyncExternalStore for cross-tab sync + custom event (ai-config-changed)
    - Returns: aiConfig, withAiConfig (merges config into API body), saveConfig
    - Used by: 15+ AI-powered modules
    - Status: ✅ FULLY IMPLEMENTED

14. /src/hooks/use-mobile.ts
    - Media query hook for mobile detection
    - Status: ✅ FULLY IMPLEMENTED (standard shadcn)

15. /src/hooks/use-toast.ts
    - Toast hook (shadcn/ui pattern)
    - Status: ✅ FULLY IMPLEMENTED (standard shadcn)

=== DASHBOARD ===

16. /src/components/dashboard/dashboard-page.tsx
    - Welcome section, 4 stat cards (chapters, references, words, progress)
    - Quick actions: Créer thèse, Assistant IA, Références, Carnet de recherche
    - Getting started: 5-step progress tracker (cadrage → plan → rédaction → références → IA)
    - Module overview: 14 module cards with status badges (Prêt/IA)
    - API calls: GET /api/stats
    - State: Zustand (setCurrentView), React Query (useDashboardStats)
    - Interactive: 6 buttons navigate to other modules, module cards clickable
    - Status: ✅ FULLY IMPLEMENTED

=== MODULE 1: ÉDITEUR DE THÈSE ===

17. /src/modules/editor/editor-page.tsx
    - Thesis chapter editor with auto-save (2.5s debounce)
    - Shows ThesisListPanel when no thesis selected, or TiptapEditor + ChapterTabs + ChapterHeader when active
    - API calls: (via hooks) GET /api/thesis, GET /api/thesis/:id, PUT /api/chapters/:id
    - State: Zustand (activeThesisId, activeChapterId), React Query (useThesis, useUpdateChapter)
    - Status: ✅ FULLY IMPLEMENTED

18. /src/modules/editor/components/tiptap-editor.tsx
    - Rich text editor using TipTap with 9 extensions (StarterKit, Underline, TextAlign, Highlight, Link, Placeholder, CharacterCount, Typography, AiPrediction)
    - Toolbar: undo/redo, H1-H3, bold/italic/underline/strike/code, alignment, lists, blockquote, HR, highlight, link, AI prediction toggle
    - Status bar: save indicator (idle/saving/saved/error), word count, character count, manual save button
    - AI prediction: ghost text inline, Tab to accept, Esc to dismiss
    - Status: ✅ FULLY IMPLEMENTED

19. /src/modules/editor/components/editor-toolbar.tsx
    - 20 toolbar buttons with tooltips (undo, redo, H1-H3, bold, italic, underline, strike, code, align L/C/R/J, bullet list, ordered list, blockquote, HR, highlight, link, AI prediction toggle)
    - Status: ✅ FULLY IMPLEMENTED

20. /src/modules/editor/components/chapter-tabs.tsx
    - Horizontal scrollable tab bar for chapters with status icons (circle/clock/loader/file/check), roman numerals, word counts
    - Status: ✅ FULLY IMPLEMENTED

21. /src/modules/editor/components/chapter-header.tsx
    - Editable chapter title (inline edit with Enter/Escape), word count display, status dropdown (5 states), delete button
    - Status: ✅ FULLY IMPLEMENTED

22. /src/modules/editor/components/thesis-list-panel.tsx
    - Grid of thesis cards with: title, subtitle, author, institution, chapter count, word count, status badge, progress bar, delete button
    - Empty state with graduation cap icon
    - CreateThesisDialog trigger button
    - API calls: (via hooks) GET /api/thesis, DELETE /api/thesis/:id
    - State: React Query (useTheses, useDeleteThesis)
    - Status: ✅ FULLY IMPLEMENTED

23. /src/modules/editor/components/create-thesis-dialog.tsx
    - Modal form: title, author, subtitle, institution, discipline, director name
    - Validation: title and author required
    - API calls: (via hook) POST /api/thesis
    - State: React Query (useCreateThesis), local form state
    - Status: ✅ FULLY IMPLEMENTED

24. /src/modules/editor/hooks/use-thesis.ts
    - Types: Thesis, ThesisChapter (10+ fields each)
    - Query keys factory: thesisKeys.all/lists/detail/chapters
    - Hooks: useTheses, useThesis, useCreateThesis, useUpdateThesis, useDeleteThesis, useUpdateChapter, useCreateChapter, useDeleteChapter
    - API calls: GET/POST /api/thesis, GET/PUT/DELETE /api/thesis/:id, PUT/DELETE /api/chapters/:id, POST /api/thesis/:id/chapters
    - Status: ✅ FULLY IMPLEMENTED

25. /src/modules/editor/hooks/use-auto-save.ts
    - Generic auto-save hook with debounce, deduplication, status tracking (idle/saving/saved/error)
    - Also exports useDebounce utility
    - Status: ✅ FULLY IMPLEMENTED

26. /src/modules/editor/extensions/ai-prediction.ts
    - TipTap extension for AI ghost text prediction
    - Debounced (1000ms, min 15 chars, 400 char context) fetch to /api/text-prediction
    - Tab key to accept, Escape to dismiss, toggle via toolbar
    - State: ProseMirror PluginState (suggestion, prevFrom, decoSet, loading, enabled)
    - Status: ✅ FULLY IMPLEMENTED

=== MODULE 2: ASSISTANT IA ===

27. /src/modules/ai-writing/ai-writing-page.tsx
    - Two tabs: "Modes d'écriture" (10 AI writing modes) and "Chat Directeur"
    - Writing panel: mode selector sidebar (10 cards), textarea input, generate button, result display with copy
    - Directeur Chat: chat UI with Pr. Jean-Marc Renaud persona, message bubbles, auto-scroll, Enter to send
    - API calls: GET/POST /api/ai-writing, POST /api/directeur-chat
    - State: React Query, local form/chat state, useAiConfig
    - Data source: /src/data/ai-writing-modes.ts (10 modes with system prompts)
    - Status: ✅ FULLY IMPLEMENTED

=== MODULE 3: MON IA DE THÈSE (RAG) ===

28. /src/modules/thesis-rag/thesis-rag-page.tsx
    - Chat interface to query thesis content via RAG
    - Index stats display (chunks, chapters, references, notebooks, cadrages, tokens)
    - Markdown rendering for AI responses, source badges (chapter/reference/notebook/cadrage)
    - API calls: GET/POST /api/thesis-rag
    - State: local chat messages state, useAiConfig, useAppStore
    - Status: ✅ FULLY IMPLEMENTED

=== MODULE 4: MÉTHODOLOGIE ===

29. /src/modules/methodology/methodology-page.tsx
    - Accordion with 5 sections: Paradigmes (3 cards), Démarche (7 steps), Outils de collecte (4 tools), Techniques d'analyse (4 techniques), Checklist (10 items)
    - Interactive: checkboxes with progress bar
    - State: local useState (checked items)
    - API calls: NONE (pure content/reference)
    - Status: ✅ FULLY IMPLEMENTED

=== MODULE 5: ARTICLES SCIENTIFIQUES ===

30. /src/modules/articles/articles-page.tsx
    - 3 tabs: Guide IMRaD (4 sections, 12 cards), Boîte à outils (4 writing tools), Checklist de soumission (4 categories, 19 items)
    - IMRaD: Introduction, Méthodologie, Résultats, Discussion with 3 sub-cards each
    - Interactive: submission checklist with progress tracking
    - State: local useState (checked items)
    - API calls: NONE (pure content/reference)
    - Status: ✅ FULLY IMPLEMENTED

=== MODULE 6: RÉFÉRENCES ===

31. /src/modules/references/references-page.tsx (~700 lines)
    - Full bibliographic reference manager
    - Features: search, filter by type, create/edit/delete references, favorite toggle, import (BibTeX/RIS/CSL-JSON file upload), export BibTeX, export all as BibTeX
    - Reference types: 30+ types (article, book, inbook, inproceedings, phdthesis, etc.)
    - Table view with columns: type icon, title, authors, year, journal, DOI, actions
    - API calls: GET/POST /api/references, PUT/DELETE /api/references/:id, POST /api/references/import, GET /api/references/bibtex
    - State: React Query (useQuery/useMutation/useQueryClient), local form state
    - Status: ✅ FULLY IMPLEMENTED

=== MODULE 7: PLAN DE THÈSE ===

32. /src/modules/thesis-plan/thesis-plan-page.tsx
    - Two-panel layout: left shows current thesis structure (chapter tree with status, word count, progress), right is LaTeX template generator
    - Template generator: discipline select (8 options), chapter count (1-15), structure mode (classique/par parties), generate + copy button
    - API calls: GET /api/thesis (via useTheses hook)
    - State: React Query, local form state, useAppStore
    - Status: ✅ FULLY IMPLEMENTED

=== MODULE 8: OUTILS IA ===

33. /src/modules/ai-tools/ai-tools-page.tsx (~1084 lines)
    - Research notebook with 3 tabs: Sources, Notebook (Q&A), Consensus (multi-source comparison)
    - Sources: create/edit/delete research sources (article/book/thesis/report), manage entries
    - Notebook: ask questions about sources with AI, generate answers
    - Consensus: compare 2-4 sources on same question with AI synthesis
    - API calls: GET/POST /api/sources, PUT/DELETE /api/sources/:id, GET/POST /api/entries, DELETE /api/entries/:id, GET/POST /api/sources/:id/entries
    - State: React Query, local form/chat state, useAiConfig
    - Status: ✅ FULLY IMPLEMENTED

=== MODULE 9: BASES DE DONNÉES ===

34. /src/modules/academic-db/academic-db-page.tsx
    - Directory of 27 academic databases (HAL, Google Scholar, Persée, CAIRN, etc.)
    - Search/filter by name, category, access type (Gratuit/Abonnement/Open Access)
    - Each card: name, country, description, category badge, access type badge, external link button
    - State: local useState (search, category filter)
    - API calls: NONE (static data with external links)
    - Status: ✅ FULLY IMPLEMENTED

=== MODULE 10: JOURNAUX OA ===

35. /src/modules/journaux-oa/journaux-oa-page.tsx (~888 lines)
    - OpenAlex + DOAJ journal search for open access publishing
    - Features: search journals by title, filter by APC, country, language, year
    - Results: journal cards with metrics, collapsible details, AI analysis of journal fit
    - Export search results as CSV
    - API calls: GET /api/journaux-oa
    - State: React Query, local search/filter state, useAiConfig
    - Status: ✅ FULLY IMPLEMENTED

=== MODULE 11: RECHERCHE PLEIN TEXTE ===

36. /src/modules/recherche-plein-texte/recherche-plein-texte-page.tsx (~596 lines)
    - Full-text search across thesis chapters
    - Features: search input, chapter/thesis filters, relevance scoring, snippet highlighting
    - Results: cards with chapter info, highlighted snippet, score, AI-powered search refinement
    - Search history with recent queries
    - API calls: GET /api/search, POST /api/search (AI refinement)
    - State: React Query, local search/filter/history state, useAiConfig
    - Status: ✅ FULLY IMPLEMENTED

=== MODULE 12: AUTO-ÉDITION 8C ===

37. /src/modules/auto-edition/auto-edition-page.tsx (~1928 lines)
    - Self-evaluation tool with 8 quality criteria for thesis chapters
    - Features: 8C checklist with progress, diagnostic questions, AI analysis per criterion, actionable recommendations
    - Tabs/checklist UI with accordion sections, collapsible AI results
    - API calls: POST /api/auto-edition (inferred, uses AI via useAiConfig)
    - State: local useState (checked items, AI results), useAiConfig
    - Status: ✅ FULLY IMPLEMENTED

=== MODULE 13: FEUILLE DE ROUTE AGILE ===

38. /src/modules/feuille-route-agile/feuille-route-agile-page.tsx (~1055 lines)
    - Agile project management: Kanban board, sprints, stories
    - Features: create/edit/delete sprints, manage stories within sprints, drag between columns (À faire/En cours/Terminé), sprint progress, AI story generation
    - Tabs: Sprints, Board (Kanban), Progression
    - API calls: GET/POST /api/sprints, PUT/DELETE /api/sprints/:id, GET/POST /api/sprints/:id/stories, PUT/DELETE /api/stories/:id
    - State: React Query, local form/kanban state, useAiConfig
    - Status: ✅ FULLY IMPLEMENTED

=== MODULE 14: DÉBLOCAGE ÉCRITURE ===

39. /src/modules/deblocage-ecriture/deblocage-ecriture-page.tsx (~1341 lines)
    - Writing unblock tool with 4 tabs
    - Features: diagnostic quiz (5 writing block types), exercises per block type, Pomodoro timer (25/5), daily writing tracker with stats
    - Interactive: quiz with branching, exercise forms, timer start/pause/reset, daily word count logging
    - API calls: POST /api/deblocage (AI exercises/guidance via useAiConfig)
    - State: local useState (quiz state, timer, daily stats), useAiConfig
    - Status: ✅ FULLY IMPLEMENTED

=== MODULE 15: OUTILS SLR ===

40. /src/modules/outils-slr/outils-slr-page.tsx (~1564 lines)
    - Systematic Literature Review toolkit
    - Features: PRISMA flow diagram (4 phases: identification/screening/eligibility/included), article screening with include/exclude decisions, data extraction table, CSV export, AI screening assistance
    - Tabs: Diagramme PRISMA, Criblage, Extraction
    - API calls: GET/POST /api/slr (screening/extraction via useAiConfig)
    - State: local useState (articles, phases, extraction data), useAiConfig
    - Status: ✅ FULLY IMPLEMENTED

=== MODULE 16: ANALYSE DU CHAMP DE RECHERCHE ===

41. /src/modules/analyse-champ-recherche/analyse-champ-recherche-page.tsx (~1335 lines)
    - AI-powered research field analysis and positioning
    - Features: form (topic, discipline, keywords, questions), AI generates: key concepts, research gaps, theoretical frameworks, positioning recommendations
    - Tabs: Analyse, Positionnement, Lacunes
    - Interactive: form submission, copy results, regenerate
    - API calls: POST /api/analyse-champ (AI via useAiConfig)
    - State: local useState (form data, results), useAiConfig
    - Status: ✅ FULLY IMPLEMENTED

=== MODULE 17: APA COMPOSER ===

42. /src/modules/apa-composer/apa-composer-page.tsx (~1422 lines)
    - APA 7th edition citation formatter
    - Features: manual citation form (20+ fields per type), reference list management, AI-assisted citation formatting, BibTeX import
    - Tabs: Créer, Bibliographie, Import
    - Reference types: 15+ (journal article, book, chapter, website, thesis, etc.)
    - API calls: POST /api/apa-composer (AI formatting via useAiConfig)
    - State: local useState (citations, form data), useAiConfig
    - Status: ✅ FULLY IMPLEMENTED

=== MODULE 18: VÉRIFICATION MÉTHODOLOGIQUE ===

43. /src/modules/verification-methodo/verification-methodo-page.tsx (~1357 lines)
    - AI-powered methodological audit tool
    - Features: paste thesis text, AI analyzes 8+ dimensions (coherence, theoretical framework, data analysis, etc.), scores each dimension, provides improvement suggestions
    - Tabs: Audit, Recommandations, Synthèse
    - Interactive: textarea input, generate audit, copy/export results
    - API calls: POST /api/verification-methodo (AI via useAiConfig)
    - State: local useState (input text, audit results), useAiConfig
    - Status: ✅ FULLY IMPLEMENTED

=== MODULE 19: BOÎTE DOCTORALE ===

44. /src/modules/boite-doctorale/boite-doctorale-page.tsx (~838 lines)
    - Doctoral toolkit: checklist, calendar view, document tracker, doctoral follow-up
    - Features: 4 tabs (Checklist, Calendrier, Documents, Suivi), configurable checklist items, progress tracking
    - State: local useState (checklist items, tabs, documents)
    - API calls: NONE (purely client-side organizational tool)
    - Status: ✅ FULLY IMPLEMENTED

=== MODULE 20: BOX CLOUD ===

45. /src/modules/box-cloud/box-cloud-page.tsx (~835 lines)
    - Simulated cloud storage interface for thesis files
    - Features: folder/file browser, grid/list view toggle, upload simulation, search, create folders, rename, delete, file size display, breadcrumb navigation
    - State: local useState (files, folders, view mode) — all client-side, no backend persistence
    - API calls: NONE (simulated/local-only)
    - Status: ✅ FULLY IMPLEMENTED (client-side simulation)

=== MODULE 21: ROUTESME ===

46. /src/modules/routesme/routesme-page.tsx (~35.8KB)
    - Multi-model AI comparison tool
    - Features: 2-4 model comparison side-by-side, writing mode selection, vote for best response, response time tracking, token estimation, comparison history
    - Tabs: Comparison, History
    - Simulated models with colors and names
    - API calls: POST /api/routesme (AI via useAiConfig)
    - State: local useState (models, results, history), useAiConfig, useToast
    - Data source: /src/data/ai-writing-modes.ts (WRITING_MODES)
    - Status: ✅ FULLY IMPLEMENTED

=== MODULE 22: LIVRES-COMPÉTENCES ===

47. /src/modules/livres-competences/livres-competences-page.tsx (~1176 lines)
    - Doctoral skills tracker with book/competence metaphor
    - Features: 8 skill domains (Rédaction, Méthodologie, Analyse, Communication, Gestion, Technologie, Langues, Veille), each with sub-competencies and progress
    - AI-powered skill assessment and recommendations
    - Select target level (Master/Doctorat/Post-doc)
    - API calls: POST /api/livres-competences (AI via useAiConfig)
    - State: local useState (skills, levels, assessments), useAiConfig
    - Status: ✅ FULLY IMPLEMENTED

=== MODULE 23: ONGLET RECHERCHE ===

48. /src/modules/onglet-recherche/onglet-recherche-page.tsx (~41.4KB)
    - Tabbed research organizer (local-only, no backend)
    - Features: create/rename/delete/pin research tabs, per-tab: notes (textarea), quick links (title + URL), key quotes (text + author), todo checklist
    - Each tab is a self-contained research workspace
    - State: local useState (tabs array) — NOT persisted to localStorage (ephemeral)
    - API calls: NONE (purely client-side)
    - Status: ✅ FULLY IMPLEMENTED

=== MODULE 24: GRAMMAIRE ===

49. /src/modules/grammaire/grammaire-page.tsx (~661 lines)
    - AI-powered French grammar checker for academic writing
    - Features: textarea input, AI analyzes for errors (orthographe/grammaire/style/ponctuation), error list with corrections, statistics (word count, sentence count, readability score), corrected text display, copy corrected text
    - Tabs: Correction, Statistiques, Conseils
    - API calls: POST /api/grammaire (AI via useAiConfig)
    - State: local useState (input text, results), useMutation, useAiConfig
    - Status: ✅ FULLY IMPLEMENTED

=== MODULE 25: EXPORT PDF ===

50. /src/modules/export-pdf/export-pdf-page.tsx (~1171 lines)
    - PDF export with preview and configuration
    - Features: select thesis, configure export options (include title page, TOC, chapters selection, author info), preview formatted output, download PDF
    - Tabs: Configuration, Aperçu, Export
    - API calls: GET /api/thesis (for thesis list), POST /api/export-pdf (generate PDF)
    - State: React Query, local form state
    - Status: ✅ FULLY IMPLEMENTED

=== MODULE 26: ÉQUILIBRE CHAPITRES ===

51. /src/modules/equilibre-chapitres/equilibre-chapitres-page.tsx (~839 lines)
    - AI-powered chapter balance analyzer
    - Features: loads thesis chapters, shows word count distribution with bar chart, target word count setting per chapter, AI recommendations for rebalancing
    - Visual: progress bars, trend indicators (up/down/balanced), overall balance score
    - API calls: GET /api/thesis (for chapters), POST /api/equilibre-chapitres (AI via useAiConfig)
    - State: React Query, local state (target word counts, AI results), useAiConfig
    - Status: ✅ FULLY IMPLEMENTED

=== MODULE 27: DIAGRAMMES ===

52. /src/modules/diagrammes/diagrammes-page.tsx (~1642 lines)
    - Visual diagram generator for thesis
    - Features: 3 diagram types (Organigramme, Chronologie, Flux), add/edit/delete nodes, connections between nodes, AI-assisted diagram generation, export as text/JSON
    - Canvas-like node editor with connection lines
    - API calls: POST /api/diagrammes (AI generation via useAiConfig)
    - State: local useState (nodes, connections, diagram type), useAiConfig
    - Status: ✅ FULLY IMPLEMENTED

=== MODULE 28: HARPER ===

53. /src/modules/harper/harper-page.tsx (~916 lines)
    - AI text processing tool (summarizer, paraphraser, extractor)
    - Features: 4 modes (Résumer, Paraphraser, Extraire mots-clés, Analyser le style), input textarea, output with copy, processing history
    - Tabs: Traitement, Historique
    - API calls: POST /api/harper (AI via useAiConfig)
    - State: local useState (input, output, mode, history), useMutation, useAiConfig
    - Status: ✅ FULLY IMPLEMENTED

=== MODULE 29: VÉRIFICATION CARTOGRAPHIQUE ===

54. /src/modules/verification-carto/verification-carto-page.tsx (~67.3KB)
    - Cartographic completeness verification + Socratic AI questioner
    - Features: référentiel (framework) management with phases/elements, completeness checklist per phase, AI-powered Socratic questioning to verify cartographic rigor
    - Tabs: Référentiel, Vérification, Questionnaire Socratique
    - API calls: GET/POST /api/verification-carto, GET/POST/PUT/DELETE /api/elements-analyse, GET /api/types-analyse
    - State: local useState (référentiel, elements, verification results, chat messages), useAiConfig
    - Status: ✅ FULLY IMPLEMENTED

=== DATA FILES ===

55. /src/data/ai-writing-modes.ts — 10 writing modes with French system prompts (used by ai-writing and routesme)
56. /src/data/directeur-prompt.ts — System prompt for directeur chat persona
57. /src/data/corpus-publication.ts — Publication corpus data

=== UI COMPONENTS (shadcn/ui) ===

57 primitive components in /src/components/ui/:
accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input, input-otp, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, skeleton, slider, sonner, switch, table, tabs, textarea, toast, toaster, toggle, toggle-group, tooltip
- All standard shadcn/ui, no custom modifications detected
- Status: ✅ ALL STANDARD (not inventoried in detail)

=== SUMMARY STATISTICS ===
- Total module pages: 27 (all in /src/modules/)
- Total layout components: 5 (in /src/components/layout/)
- Total dashboard components: 1 (in /src/components/dashboard/)
- Total provider components: 2 (theme-provider, query-provider)
- Total editor sub-components: 6 (in /src/modules/editor/components/)
- Total editor hooks: 2 (in /src/modules/editor/hooks/)
- Total editor extensions: 1 (ai-prediction)
- Total Zustand stores: 1 (app-store)
- Total custom hooks: 3 (use-ai-config, use-mobile, use-toast)
- Total data files: 3
- Total UI primitives: 57 (shadcn/ui)
- Modules with API calls: 24 of 27
- Modules using AI (useAiConfig): 15 (ai-writing, thesis-rag, auto-edition, deblocage-ecriture, outils-slr, analyse-champ-recherche, apa-composer, verification-methodo, grammaire, equilibre-chapitres, diagrammes, harper, verification-carto, journaux-oa, routesme, livres-competences)
- Modules with NO API calls (pure client-side): 3 (methodology, articles, boite-doctorale)
- Modules with NO API calls (local-only simulation): 2 (box-cloud, onglet-recherche)
- Modules that are reference/content-only: 2 (methodology, articles)
- All 27 views accessible from sidebar: YES
- ModulePlaceholder component: exists but UNUSED
- No stub or partial modules found
- Next.js API routes: 49 route files---
Task ID: 1-d
Agent: Explore
Task: Read ALL 7 spec files and produce detailed structured analysis

Work Log:
- Read worklog.md for project context
- Read all 7 spec files in /home/z/my-project/upload/files-extracted/
  - INDEX-routage.md (routing/orchestration index)
  - 01-ethique-publication-scientifique.md
  - 02-choisir-revue-eviter-predateurs.md
  - 03-ecrire-resultats-discussion.md
  - 04-tableaux-figures-quand-et-comment.md
  - 05-auto-edition-8C.md
  - 06-ecrire-en-langue-seconde-international.md
- Produced detailed per-file analysis of functionality, UI, detection logic, and corpus fiche content

# COMPREHENSIVE STRUCTURED ANALYSIS OF ALL 7 SPEC FILES

## Overview
These 7 files form a new corpus titled **"Rédaction et publication d'articles scientifiques"**, synthesized from Gastel & Day, *How to Write and Publish a Scientific Paper* (9th ed., 2022). This is the **third corpus** for ThesisFrame (after the generic doctoral writing corpus and the architecture/urbanisme methodology corpus). It targets PhD students doing article-based theses or converting thesis chapters into publications.

---

## FILE 1: INDEX-routage.md — Routing & Orchestration Index

### What it specifies:
- **Routing table**: Maps 6 trigger contexts/signals to specific fiche files with concrete trigger examples
- **Orchestration principle**: 1-2 fiches loaded per interaction, never the full corpus
- **Detection signals per fiche** (keywords/concepts that trigger loading):
  | Signal | Fiche | Trigger Examples |
  |---|---|---|
  | Plagiarism, paraphrase, authorship, article-based thesis | 01 | Keywords: plagiat, paraphrase, conflit d'intérêt, comité d'éthique |
  | Journal selection, predatory journal solicitation | 02 | Explicit journal choice request, suspicious email mention |
  | Writing/blocked on results or discussion chapter | 03 | Active chapter = results or discussion; incoherent discussion flagged |
  | Table or figure insertion/conception question | 04 | Table inserted in editor, or table with high proportion of identical values |
  | Proofreading or revision request | 05 | "Correction" mode activated, explicit pre-submission review request |
  | Non-native francophone, international publication target | 06 | Second-language signal detected, explicit international publication mention |

### Orchestration rules:
1. **Fiche 05** (8C framework) has **highest priority for concrete UI implementation** — structured checklist, not just prompt content
2. **Fiches 03 & 04** share a common principle (never reformulate in text what a table/figure shows) — check complementarity before loading both
3. This corpus feeds `directeurThese.js` with additional criteria (intro/discussion coherence check, insufficient paraphrase detection) — **read-only critique, never content generation/substitution**

### UI elements: None directly (this is a routing/config file)
### Detection logic: Keyword/context-based routing triggers defined in the table
### Corpus fiche content: None (this IS the index, not a content fiche)

---

## FILE 2: 01-ethique-publication-scientifique.md — Scientific Publication Ethics

### What it specifies:
- **Exactitude & fabrication**: Zero tolerance for data invention ("dry-labbing"); warns about partial deviations (omitting outliers, accentuating figures); recommends involving a statistician at study design stage
- **Originality & "salami science"**: Results must be new; no simultaneous submission to multiple journals; no excessive slicing of one study into multiple publications to inflate count
- **Credit & paraphrase** (flagged as "the most useful rule to tool"):
  - Every non-original idea/formulation must be cited
  - Insufficient paraphrase: mere word changes ≠ legitimate paraphrase; must restructure thought
  - Recommended method: draft without looking at source, verify accuracy after
  - Direct quotes rare in scientific articles; paraphrase is the norm
  - When in doubt about quotation marks, use them
  - Self-plagiarism exception: identical standard methodology sections across author's own papers are acceptable
  - Similarity detection software recommended for pre-submission self-check
- **Human/animal subjects**: Ethics committee approval required BEFORE study starts; must be declared in document
- **Conflict of interest**: Any external engagement that could affect objectivity must be declared

### UI elements: None directly
### Detection/analysis logic mandated:
1. **`directeurThese.js` criteria** — detect insufficient paraphrase, check for missing ethics compliance declaration in methodology sections involving human/animal subjects
2. **"Correction" mode actionable instruction** — the paraphrase test (write without looking, then verify)
3. **Thesis type field attachment** — anti-salami-science principle linked to "type de thèse" field in initial framing

### Corpus fiche content: Ethics rules (fabrication, salami science, paraphrase, ethics declarations, conflicts of interest)

---

## FILE 3: 02-choisir-revue-eviter-predateurs.md — Journal Selection & Predatory Journal Avoidance

### What it specifies:
- **Decide early**: Choose journal BEFORE writing, not after — allows calibring tone, detail level, and format from the first draft
- **Evaluating legitimacy & scope**:
  - Look at where known reference works in your sub-field are published
  - Impact factor: useful but limited; doesn't indicate probability of THIS article being cited; never comparable across disciplines
  - DORA movement: never reduce evaluation to a single number; consider consultations, downloads, press mentions, real article citations
  - Caution with very new journals not backed by a scholarly society
- **Open access**: Author-pays model; fee waivers often available on request
- **Predatory journal detection — 5 concrete warning signals**:
  1. Too-good-to-be-true promises (guaranteed publication in days)
  2. Website full of typos or visual inconsistencies
  3. Fabricated metrics (proprietary "impact index" not officially recognized)
  4. Absence of verifiable quality articles, or no articles at all
  5. Aggressive, non-targeted email solicitations to submit
- **Legitimacy signals**: Indexed in major bibliographic databases, referenced in university libraries, contains known quality articles

### UI elements: None directly (but specifies a future "publication" module)
### Detection/analysis logic mandated:
1. **Pre-submission checklist** for a future "publication" module — objective, verifiable criteria
2. **Thesis type field attachment** — for article-based theses, this check should appear at each planned submission step
3. **Structuring module integration** — if a chapter is destined to become an article, target journal and format constraints should be declared at chapter conception, not after writing

### Corpus fiche content: Journal selection methodology, predatory journal signals, open access considerations

---

## FILE 4: 03-ecrire-resultats-discussion.md — Writing Results & Discussion Without Confusing Them

### What it specifies:
- **Results: select, don't accumulate**:
  - Present representative data, not exhaustive/repetitive data
  - Watch for false statistical precision (e.g., "28.8136%" when it's 17/59)
  - Report non-effects too, not just effects
- **Avoid text/table/figure redundancy** ("the most frequent error"):
  - Never repeat in text what a table/figure already clearly shows
  - Bad: "Table 1 clearly shows that X inhibits growth of Y."
  - Good: "X inhibited the growth of Y (table 1)."
  - Don't sacrifice clarity for conciseness (pronoun antecedents must be clear)
- **Discussion: the hardest section**:
  - Many articles rejected due to poor discussion even when data is valid
   - Avoid "cuttlefish ink camouflage" — vague, convoluted formulations hiding uncertainty
  - First person acceptable: "we conclude that" > impersonal convolutions
- **Inverted funnel structure**: Specific results → relation to prior work (agreements/disagreements) → theoretical/practical implications → study limitations → open questions for future research
- **Actionable coherence test**: Introduction poses questions (even implicitly); Discussion MUST answer them explicitly
- **Acknowledge strengths AND limitations**:
  - Don't hide limitations out of modesty — reviewers will find them anyway
  - Name limitations and discuss their real impact on conclusions

### UI elements:
- Inverted funnel structure as **visual guide in contextual help** of the writing module

### Detection/analysis logic mandated:
1. **`directeurThese.js` cross-chapter check** — introduction/discussion coherence: does each question posed in intro find an explicit answer in discussion?
2. **Automated text/table redundancy detection** — flag sentences that reformulate in words what an adjacent table or figure already shows

### Corpus fiche content: Results writing principles, discussion structure, redundancy avoidance, inverted funnel model

---

## FILE 5: 04-tableaux-figures-quand-et-comment.md — When (and When Not) to Use Tables/Figures

### What it specifies:
- **Not everything deserves a table** — common misconception that all numerical data must be tabulated
- **Three signals a table should NOT exist as-is**:
  1. **Columns filled with zeros or identical values** — can be reduced to one sentence (e.g., "growth was only observed between 20°C and 40°C")
  2. **Columns filled with repeated binary symbols (+/−)** — if result reduces to "species X grows in aerobic conditions, species Y does not", a sentence suffices
  3. **Multiple tables for statistically non-significant results** — presenting non-significant results in table format discredits the whole document
- **General principle**: If a table or column can be reformulated as a sentence without information loss, it MUST be a sentence, not a table
- **When a table IS justified**: Repetitive, multivariate, or comparative data where sentence form would be unreadable — multiple variables crossed over multiple conditions
- **Shared principle with tables AND figures**: Never reformulate in text what a table/figure already shows (links to fiche 03)

### UI elements: None directly
### Detection/analysis logic mandated:
1. **Automated check on tables inserted in the editor** — detect high proportion of identical values or repeated binary symbols, suggest reformulating as a sentence (suggestion, NOT automatic correction)
2. **Integration into "correction" mode** as a control point, at same level as text/table redundancy check from fiche 03

### Corpus fiche content: Three anti-pattern signals for unnecessary tables, table justification criteria, redundancy principle

---

## FILE 6: 05-auto-edition-8C.md — Self-Editing: The 8C Framework

### What it specifies:
- **Why 8 dimensions**: Unstructured review always misses problems; traditional publishing uses "4C" (clarity, coherence, cohesion/consistency, correction); this extends to 8C for scientific self-revision
- **The 8 C's with diagnostic questions**:
  1. **Conformité (compliance)** — Does text follow formal requirements (journal template, disciplinary conventions)? Ethics compliance documented for human/animal subjects?
  2. **Exhaustivité (completeness)** — All expected elements present? Each section contains all information it should (e.g., replication-sufficient method details)?
  3. **Composition** — Overall structure appropriate? Each section logically organized? Clear anchor sentences? Natural idea flow?
  4. **Exactitude (correctness)** — All information correct (text, tables, figures, references)? Reasoning valid end-to-end? Grammar/spelling/punctuation correct?
  5. **Clarté (clarity)** — Ambiguous terms defined? Abbreviations explained on first use? Pronoun antecedents always identifiable? Overlong/complex sentences flagged and restructured?
  6. **Cohérence (consistency)** — Information consistent throughout (same number in text and table)? Abstract exactly matches body text? Terminology stable (no floating synonyms)?
  7. **Concision** — Longer words have shorter equivalents? Verbose turns condensable? Redundancies/tangential content to remove? **WARNING**: never at expense of clarity or meaning
  8. **Courtoisie (courtesy)** — Neutral tone toward prior work cited (prefer "previous research did not explore X" over suggestions of failure/negligence)? Inclusive, respectful language about population groups?
- **The final C is Communication** — success on all 8 dimensions = effective communication
- **Recommended review method**:
  - Check all 8C in one pass is impractical — use successive phases targeting subsets
  - Final pass must be linear (start to finish) — catch problems in reader's encounter order
  - Change physical perspective: read aloud, change font/layout before review
- **Specialized scientific checklist** (beyond generic 8C):
  - Title faithfully and concisely reflects content?
  - Abstract exactly matches body text, appropriate length?
  - Introduction provides sufficient context and clearly indicates the research gap?
  - Method provides enough info for replication AND critical evaluation?
  - Results presented in logical order, appropriate detail?
  - Discussion explicitly answers questions posed in introduction?
  - All qualifying authors listed, auxiliary contributions properly acknowledged?

### UI elements:
- **INTERACTIVE CHECKLIST in "correction" mode of the writing module**: 8 checkable categories, each with diagnostic questions as sub-items
- **"Courtesy" point highlighted specifically in the interface** rather than buried in generic linguistic review (value-add vs. traditional grammar checkers like LanguageTool/Grammalecte)

### Detection/analysis logic mandated:
- Diagnostic-assisted tool (checklist), NOT automatic text rewriting — consistent with established doctrine of never generating substitution content

### Corpus fiche content: Complete 8C framework with diagnostic questions, review methodology, specialized scientific checklist

---

## FILE 7: 06-ecrire-en-langue-seconde-international.md — Writing Science in a Second Language for International Readership

### What it specifies:
- **Content over stylistic elegance**: Non-native writers often focus on language polish at expense of substance. If content is informative, well-organized, clear — grammar/expression issues are fixable afterward. If essential information is missing, disorganized, or unclear — no linguistic correction can compensate. **Priority for non-native writer support: substance before form, ALWAYS**
- **Editor/corrector as ally, not judge**: Serious journals/institutions want to publish the best science regardless of linguistic origin; many provide extra support to non-native authors when scientific content is solid
- **Cultural differences to know explicitly**:
  1. **Level of detail** — varies across cultures; observe detail level of already-published texts in target context, don't assume own level is universal
  2. **Directness of expression** — some traditions circle around the main point; dominant international journal convention expects opening topic sentence stating the main idea directly, followed by development. Presented as genre convention, NOT as absolute error
  3. **Relationship to time/deadlines** — international journals expect rapid response; if deadline can't be met, inform editor/jury early rather than let silence build
  4. **Relationship to literal quotation** — some academic traditions tolerate broader re-use of existing formulations; international journals expect nearly all text in author's own words, with literal reuse clearly marked by quotation marks and citation
- **Concrete strategies**:
  - Systematically observe paragraph structure of published texts in target context before writing
  - Respond quickly to corrector/reviewer questions; ask for clarification when unsure rather than guessing
  - Never assume a corrector is necessarily right just because they're a language expert — author remains responsible for final accuracy

### UI elements: None directly
### Detection/analysis logic mandated:
1. **"Correction" mode display ordering** — signal structure/clarity/content problems FIRST, then surface language issues — NEVER the inverse
2. **Paragraph structure detection** — detect paragraphs that "circle around" the main point without stating it in an opening sentence; present as genre convention of target context, not as absolute error
3. **Supervision module tone calibration** — for non-native francophone writers or those unfamiliar with Western academic conventions: explicitly reassure about substance/form distinction before listing surface corrections

### Corpus fiche content: Content-before-form principle, cultural differences in academic writing, concrete second-language writing strategies

---

## CROSS-CUTTING SUMMARY: Implementation Requirements Across All 7 Files

### New/Enhanced Functionalities Required:
| # | Feature | Source File(s) | Module Affected |
|---|---|---|---|
| 1 | **8C Interactive Checklist** in correction mode | 05 | Writing module (correction mode) |
| 2 | **Text/table redundancy detection** | 03, 04 | Writing module (correction mode) |
| 3 | **Introduction/discussion coherence cross-check** | 03 | directeurThese.js |
| 4 | **Insufficient paraphrase detection** | 01 | directeurThese.js |
| 5 | **Missing ethics declaration detection** | 01 | directeurThese.js |
| 6 | **Unnecessary table detection** (3 signals) | 04 | Writing module (correction mode) |
| 7 | **Paragraph topic-sentence detection** | 06 | Writing module (correction mode) |
| 8 | **Correction display ordering** (content before form) | 06 | Writing module (correction mode) |
| 9 | **Predatory journal pre-submission checklist** | 02 | Future "publication" module |
| 10 | **Target journal field at chapter conception** | 02 | Structuring module |
| 11 | **Anti-salami-science vigilance** linked to thesis type | 01 | Initial framing (cadrage) |
| 12 | **Paraphrase test instruction** in correction mode | 01 | Writing module (correction mode) |

### UI Elements Specified:
1. 8C interactive checklist (8 checkable categories with sub-items) in correction mode
2. "Courtesy" point highlighted distinctly (not buried in generic review)
3. Inverted funnel visual guide in contextual help for discussion section
4. Correction display: content/structure issues BEFORE surface language issues
5. Paragraph structure feedback presented as genre convention, not absolute error

### Key Architectural Doctrine (repeated across files):
- `directeurThese.js` operates in **read-only critique mode only** — never generates substitution content
- All detection = suggestion/flagging, never automatic rewriting
- Corpus fiches loaded 1-2 per interaction, never all at once
- Consistent with existing ThesisFrame design philosophy

### Predominant Source:
All 7 files synthesized from a single reference: Gastel, B. & Day, R.A., *How to Write and Publish a Scientific Paper* (9th ed., 2022)

Stage Summary:
- All 7 spec files read and analyzed in full
- Corpus covers: ethics, journal selection, results/discussion writing, tables/figures, self-editing (8C), second-language writing
- INDEX defines keyword-based routing for loading 1-2 fiches per interaction
- 12 concrete implementation features identified across all files
- 5 UI elements specified (checklist, visual guides, display ordering)
- 3 detection/analysis logic items for directeurThese.js
- Fiche 05 (8C) flagged as highest priority for concrete UI implementation
- All features align with existing read-only critique doctrine
