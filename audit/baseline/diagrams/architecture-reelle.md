# Architecture réelle — ThesisFrame (constat du 2026-10-09, commit 2156a8f)

```
┌──────────────────────────────────────────────────────────────────────┐
│ CLIENT : Navigateur (preview) / Tauri v2 WebView (cible Windows)     │
│                                                                      │
│  SPA unique — src/app/page.tsx                                       │
│   • 47 imports statiques de vues · switch currentView (47 cases)     │
│   • Sidebar (lignes rouges) : 47 NAVIGATION_ITEMS / 7 catégories     │
│   • État : Zustand (persist PARTIEL : activeThesisId ≠ currentView)  │
│   • TanStack Query (server state) · tiptap (éditeur)                 │
│                                                                      │
│        │ fetch("/api/…") — même origine                              │
└────────┼─────────────────────────────────────────────────────────────┘
         ▼
┌──────────────────────────────────────────────────────────────────────┐
│ PROCESS NODE UNIQUE — next dev -p 3000 (prod : standalone)           │
│                                                                      │
│  98 route.ts · 53 groupes API (+ scaffold racine)                    │
│   • validation : zod (58) + api-schemas.ts partagé (23) + manuel(40) │
│   • codes honnêtes : 400×152, 500×150, 404×45, 502×23, 413/415/422   │
│                                                                      │
│  ┌────────────────┐   ┌──────────────────────────────────────────┐   │
│  │ Prisma (db.ts) │   │ WORKER IN-PROCESS (instrumentation.ts)   │   │
│  │ singleton      │   │ • anti-doublon globalThis · sweep 60 s   │   │
│  │ log:['query']  │   │ • claim atomique updateMany              │   │
│  └───────┬────────┘   │ • reprise orphelins au boot              │   │
│          ▼            │ • OCR Tesseract in-process (≤200 p/job,  │   │
│  ┌────────────────┐   │   anti-stack, cleanup par page)          │   │
│  │ SQLite         │   └──────────────────────────────────────────┘   │
│  │ db/custom.db   │                                                  │
│  │ 30 modèles     │   AI : z-ai-web-dev-sdk + 26 fournisseurs        │
│  │ corpus 248 Mo  │   (hardcoded-keys.ts = 100 % process.env)        │
│  │ (PDF en blobs) │                                                  │
│  └────────────────┘                                                  │
└──────────┬───────────────────────────────────────────────────────────┘
           ▼ services externes (HTTPS)
   LLM ×26 (OpenRouter, Groq, Gemini, Mistral…) · OpenAlex(premium)/
   CrossRef/HAL · HAL thèses · arXiv · livres ×7 · APInex(402 check-in)
   · Overpass/OSM (HTTP 000 ici) — ⚠ aucun timeout applicatif
```

## Points de défaillance unique (SPOF)
1. **db/custom.db** — unique copie, aucun backup outillé (AUD-GOV-001).
2. **Process Node unique** — API + worker + OCR dans un même process (assumé mono-utilisateur ; une fuite mémoire/panic affecte tout).
3. **Machine locale 4 Go** — RSS serveur 2 560 Mo mesuré ; pic OCR 2,66 Go (géré).

## Frontières de confiance
- API locale **sans auth** (N/A par conception) : toute entité locale peut appeler les routes (accepté pour un app desktop personnelle).
- Contenus importés (articles/PDF) → prompts LLM : **délimités** (RAG « --- Extrait N --- ») mais champ `context` utilisateur brut (AUD-SEC-006).
- Distribution Tauri : webview sur-permissionnée (shell:allow-execute, CSP null) — AUD-SEC-001/005, à durcir avant packaging.

## Couplages notables
- Vues → API communes (references, jobs, thesis) : couplage par routes REST, pas de couche service dédiée — acceptable, patterns homogènes.
- Worker ↔ API : table Job partagée (polling), claim atomique — correct.
- SKU mono-thèse implicite : `activeThesisId` global au store (cause de AUD-FUNC-002).
