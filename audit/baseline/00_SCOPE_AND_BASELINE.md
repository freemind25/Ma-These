# 00 — Périmètre et Baseline (Phase 0)

**Audit** : BASELINE AUDIT v1.0 — audit exhaustif préproduction
**Norme suivie** : PROMPT MAÎTRE — AUDIT GLOBAL DE RÉFÉRENCE (978 lignes, fourni par le propriétaire)
**Règle d'or appliquée** : audit **sans modification** (étape 1 du processus en 3 temps du propriétaire : constat → validation → corrections). Aucune anomalie n'est corrigée dans ce cycle ; tout est enregistré dans le registre 09.

---

## 1. Identification

| Champ | Valeur |
|---|---|
| Application | **ThesisFrame** (« Ma Thèse ») v1.10.8 (package.json) |
| Commit audité | `2156a8f` — branche `main` (origine `origin/main` synchronisée 0/0) |
| Date/heure de la baseline | 2026-10-09 14:58 UTC |
| Environnement | Sandbox de développement Next.js 16 (`bun run dev`, port 3000), prévisualisation navigateur ; cible réelle : **Tauri v2 desktop Windows** (non testable ici — voir limites §6) |
| Commande de lancement | `bun run dev` → `next dev -p 3000` (dev.log) |
| Base de données | SQLite via Prisma (`db/custom.db`, base propriétaire locale, **skip-worktree** verrouillé — contient corpus 248 Mo, état LOCAL non commité) |
| Serveur au démarrage de l'audit | Opérationnel (GET / → 200, 164 ms) ; log = polling worker Job uniquement, **aucune erreur** |
| État git | Propre (seul fichier modifié : `.zscripts/dev.pid`, artefact du serveur) |
| Invariants vérifiés | Lignes rouges `theses-en-ligne/search/route.ts`, `arxiv/search/route.ts`, `app-sidebar.tsx` : **0 diff** ✓ |

## 2. Objectif fonctionnel et utilisateurs

Application **mono-utilisateur** d'assistance à la rédaction de thèses de doctorat (cible : l'auteur/propriétaire), utilisable en desktop Tauri (mode principal) et en web preview. Couvre : rédaction (éditeur, IA), structuration (plan, cadrage, feuille de route), recherche (articles, thèses en ligne, bases académiques, veille), méthodologie & vérification, outils IA, exports (PDF, DOCX).

**Modèle d'authentification** : **aucun** — application locale mono-utilisateur, sans compte ni session. Les contrôles d'authentification/isolation multi-utilisateurs du référentiel sont marqués **Non applicable (N/A)** avec justification, non « non vérifiés ».

## 3. Cartographie technologique

| Couche | Technologie |
|---|---|
| Front | Next.js 16 App Router, React, TypeScript, Tailwind 4, shadcn/ui, Zustand (état), single page + 47 vues commutées côté client (`src/app/page.tsx`, switch `currentView`) |
| Backend | Routes API Next.js (~50 groupes sous `src/app/api/`), worker in-process (table `Job`), z-ai-web-dev-sdk (LLM/VLM), Tesseract OCR (vendor/tessdata, worker in-process) |
| Données | Prisma + SQLite (db/custom.db) ; imports documentaires (PDF/DOCX/RAR extraits) |
| IA | 26 fournisseurs déclarés (`src/lib/ai/ai-types.ts`), clés env-only (`hardcoded-keys.ts` = 100 % `process.env`, vérifié — post-T14), clés utilisateur via UI |
| Desktop | Tauri v2 (src-tauri/), build Windows non exécutable dans le sandbox |
| Intégrations externes | OpenAlex (+ clé premium), CrossRef, HAL, arXiv, theses.fr, Overpass/OSM, APInex (402 = check-in requis), Deep Research LLM |

## 4. Inventaire des fonctionnalités (registre)

Source d'inventory : `NAVIGATION_ITEMS` (47 ids, `src/lib/stores/app-store.ts`), switch de `page.tsx` (40+ modules importés), routes API (~50), notice `docs/NOTICE-UTILISATION.md` (44 modules documentés, 26 modes d'écriture IA, 26 fournisseurs). Catégories : Principal(3), Rédaction(8), Structure & Planification(5), Recherche & Sources(10), Méthodologie & Vérification(12), IA & Outils(7), Export(2).

Registre complet avec criticité et tests : voir **08_TEST_MATRIX.md** (les 47 items y sont listés avec verdicts). Fonctionnalités confirmées par le code : toutes les 47 vues ont un module importé et un `case` dans le switch (aucune vue morte au niveau routage). Statut d'implémentation réelle : déterminé par tests réels §Phase 1/2.

## 5. Baseline des tests automatisés

- Suite : `vitest` — 63 fichiers / 1 452 tests, état **vert** au dernier run prouvé (audit prod-readiness 2026-09-18, ré-exécuté ci-dessous).
- Lint : `bun run lint` — 0 erreur / ~230 warnings (no-explicit-any majoritaire) à la date du précédent audit ; re-mesure ci-dessous.
- Build : `bun run build` interdit dans cet environnement (règle environnement) — la preuve de build la plus récente = audit 2026-09-18 (vert, commit `e17e233` puis suivants). Réserve maintenue.

## 6. Limites de l'environnement (connues et nommées dès la Phase 0)

1. **Build Tauri Windows / pipeline CI** : pas de cargo, pas de `.github/`, pas de Windows → **non vérifiable** (réserve R-CI du précédent audit, toujours ouverte).
2. **`bun run build`** : interdit par les règles d'exécution de l'environnement → vérification de build reposant sur la preuve du 2026-09-18.
3. **Endpoints externes géographiquement bloqués** : Overpass (HTTP 000) — retest effectué dans ce cycle.
4. **DB propriétaire en production locale** : les tests destructifs sont interdits dessus ; les tests de mutation passent par l'UI sur des objets de test dédiés (chapitres/sections « AUDIT- »), supprimés après preuve.
5. **Mono-utilisateur** : pas de création de 2 comptes (N/A par conception — application locale sans auth).
6. **Preuves visuelles** : captures agent-browser authentiques référencées dans `evidence/`.

## 7. Livrables prévus (arborescence)

```
audit/baseline/
  README.md
  00_SCOPE_AND_BASELINE.md       (ce document)
  01_FUNCTIONAL_AUDIT.md
  02_THESIS_WORKFLOW_AUDIT.md
  03_ARCHITECTURE_AND_CODE_AUDIT.md
  04_SECURITY_AUDIT.md
  05_RELIABILITY_PERFORMANCE_AUDIT.md
  06_GOVERNANCE_AUDIT.md
  07_USER_EXPERIENCE_AUDIT.md
  08_TEST_MATRIX.md
  09_FINDINGS_REGISTER.md
  10_REMEDIATION_ROADMAP.md
  11_REVALIDATION_REPORT.md
  BASELINE_AUDIT_REPORT.md
  evidence/                       (JSON/captures/logs expurgés, un fichier par preuve)
  diagrams/                       (architecture réelle)
```
