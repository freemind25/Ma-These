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
