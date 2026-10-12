# 04 — Audit Sécurité (Phase 4, version condensée avec preuves)

**Audit** : BASELINE AUDIT v1.0 — phase 4 (sécurité)
**App** : ThesisFrame v1.10.8 — commit audité `2156a8f` · serveur de test : dev local `localhost:3000` (HTTP 200 vérifié avant tests)
**Contexte pondérant** : application **mono-utilisateur locale sans auth par conception** (baseline §2), cible desktop Tauri Windows, documents « ne quittent pas la machine » ; dépôt distant `github.com/freemind25/ThesisFrame` (les secrets dans l'historique git quittent donc la machine).
**Mode** : lecture seule. Tests HTTP = non destructifs (lecture + 1 ping IA 5 tokens sur `/api/ai-test`, aucune écriture données).

---

## 1. Secrets

| Mesure | Commande | Résultat |
|---|---|---|
| Clés littérales dans le code | `grep -rnE 'sk-[A-Za-z0-9]{10,}\|ghp_[A-Za-z0-9]{20,}\|AKIA[A-Z0-9]{12,}\|xox[baprs]-' src src-tauri` | **0 occurrence** (le seul `sk-` est un commentaire doc `hardcoded-keys.ts:73`) |
| `hardcoded-keys.ts` | lecture (80 l.) | **100 % `process.env`** avec `\|\| undefined` (9 refs env, 0 valeur littérale) — conforme au postulat baseline §3 |
| Mentions `ghp_` dans HEAD | `git grep -c 'ghp_' HEAD` | 4 hits — **tous documentaires** : longueurs mesurées = 4 car. (préfixe seul, aucun token complet) ; worklog:1261 « aucune clé réelle dans les fichiers suivis » |
| `.env` versionné | `git ls-files --error-unmatch .env` | ⚠️ **`.env` est TRACKÉ** (committé avant la règle `.gitignore` `.env*` l.34 ; gitignore ne dé-track pas) — contenu HEAD = 1 seule ligne `DATABASE_URL` (aucune clé actuellement) |
| Historique git | `git log -S 'ghp_' --oneline` + extraction de toutes les versions historiques de `.env` | ⚠️ **Une clé réelle `APINEX_API_KEY=` (format `sk-…`, 53 car.) figure dans l'historique de `.env`**, introduite/rejouée par les commits-snapshots UUID (04dc5ab, b25f426, 763ee5d, 7260947) — poussée sur origin (0/0 synchronisé). Rotation documentée ensuite (`ec0ae93` : « rotation clés GitHub/APINex/OpenAlex installée hors dépôt »), mais l'ancienne valeur reste dans les blobs GitHub |

**Verdict C1** : ✅ code propre / ⚠️ **historique git pollué** (AUD-SEC-003).

---

## 2. Upload — `src/app/api/article-imports/route.ts` (201 l.)

| Contrôle | Preuve (lignes) | Résultat |
|---|---|---|
| Type MIME / extension | `detectFileType(file.name, file.type)` → 415 si inconnu (l.51-57) | ✅ liste blanche DOCX/PDF/TXT-MD |
| Magic bytes | `checkMagicBytes(buffer, fileType)` → 415 « corrompu ou renommé » (l.65-70) | ✅ le contenu doit correspondre au format déclaré |
| Taille max | pré-contrôle `content-length` → 413 AVANT parsing (l.33-41) + `validateFileSize` (l.59-62) ; `MAX_IMPORT_BYTES = 50 Mo` (`extraction.ts:10`) | ✅ double contrôle (transport + fichier) |
| Path traversal | `grep -rnE 'writeFile\|createWriteStream\|appendFile' src/app/api src/lib` → **0 écriture FS** ; `filename` stocké en base comme chaîne, **jamais utilisé comme chemin** | ✅ **N/A — pas de surface** (stockage base uniquement : `ImportedDoc.data Bytes` réservé aux PDF, l.124-126) |
| Stockage | `db.importedDoc.create({ data: { …, data: fileType === "pdf" ? buffer : null } })` (l.124-133) | ⚠️ PDF en blob SQLite (jusqu'à 50 Mo/import, corpus 248 Mo en base) — cohérent avec la promesse « documents ne quittent pas la machine », mais amplifie le risque de perte DB (audit 03 §5) |

**Verdict C2** : ✅ CONFORME — validation d'entrée exemplaire, pas de surface traversal ; réserve documentaire sur le stockage blob (non-sécuritaire).

---

## 3. XSS

- `grep -rn 'dangerouslySetInnerHTML' src --include='*.tsx'` → **1 occurrence** : `src/components/ui/chart.tsx:83` — injecte du **CSS de thème** construit depuis `THEMES` + `colorConfig` du composant (configuration **développeur, statique par graphique**, pas une donnée utilisateur/importée). Motif shadcn standard.
- Rendu markdown : `react-markdown` utilisé dans 4 fichiers ; **aucun `rehype-raw`, `allowDangerousHtml` ni `dangerouslyAllowSvg`** (grep 0 hit) → HTML échappé par défaut.
- Générateur maison `markdown-to-html.ts` (cycle 4-b) : liste blanche h2/h3/p/ul/ol/li/strong/em/blockquote + **échappement HTML systématique** (testé : `<script>`, `<div>`) — 18 tests dédiés.
- Éditeur Tiptap : rend le HTML des chapitres stocké en base — contenu produit par l'éditeur lui-même et le convertisseur échappé → **self-XSS uniquement** en mono-utilisateur.
- CSP webview : **absente** (`csp: null`, voir §7) — pas de filet de défense en profondeur côté Tauri.

**Verdict C3** : ✅ CONFORME (1 point d'injection, source statique, aucun contenu externe) — réserve CSP (AUD-SEC-005).

---

## 4. Validation API — tests HTTP réels (non destructifs, exécutés)

| Test | Commande | Résultat | Analyse |
|---|---|---|---|
| T1 `POST /api/ai-test` `{}` | `curl -X POST -d '{}'` | **HTTP 200** `{"ok":true,"response":"[object Object]"}` | Pas de 400 (corps vide accepté, provider par défaut « zai », ping IA réel 5 tokens) ; **aucune stack trace ni détail interne dans la réponse** ⚠️ mineur : validation d'entrée absente sur cette route (parse manuel, sans zod) + gestion de réponse SDK laxiste (`[object Object]`) |
| T2 `GET /api/references` | `curl` | **HTTP 200**, `{"meta":{"count":4}}` | Liste lisible, contrat `{data, meta}` respecté |
| T3 `GET /api/references?search=' OR 1=1--` | `curl` (payload URL-encodé sur le paramètre réellement lu, `search` ; contrôle avec `q=` exclu — param non lu par la route) | **HTTP 200, `meta.count = 0`** (vs 4 sans payload) | Le payload est traité comme **littéral** dans Prisma `contains` (requêtes paramétrées) : **pas d'injection SQL**, pas d'erreur 500, pas de stack leak. Contrôle croisé : apostrophes appariées → 0 item, comportement identique à une recherche sans résultat |

**Verdict C4** : ✅ CONFORME (Prisma paramétré prouvé en live ; pas de fuite de stack) — réserve mineure : `/api/ai-test` sans schéma de validation.

---

## 5. SSRF

- `grep 'searchParams.get("url")\|body.url\|payload.url…' src/app/api` → **0 route ne lit une URL depuis la requête**.
- Tous les `fetch` externes utilisent des **hôtes constants** (ou surchargeables par variables d'environnement serveur, pas par requête) : OpenAlex, CORE, CrossRef/HAL, theses.fr (`encodeURIComponent(id)` sur les segments variables), APINex (`APINEX_BASE_URL` env), Nominatim/Overpass (constantes), open-meteo.
- Seul hôte variable : `${baseUrl}/translate` — `baseUrl` provient de la **configuration IA** (env serveur ou cookie utilisateur), jamais du corps de requête arbitraire.
- Les proxies « recherche web » passent par le SDK z-ai / APInex tools (côté fournisseur), pas par un fetch d'URL utilisateur.

**Verdict C5** : ✅ CONFORME — aucune surface SSRF identifiée (aucune route ne fetch une URL fournie par l'utilisateur).

---

## 6. Injection prompt (contenu importé dans les prompts IA)

| Module | Délimitation / marquage | Preuve |
|---|---|---|
| `ai-writing` — compétences livres | ✅ **Délimité et contraint** : en-têtes `──── L1 : titre ────` par ressource + bloc d'instructions explicites (« Ces savoirs sont un appui… Ils ne sont JAMAIS une source de citations… En cas de conflit, ces règles priment ») | `src/lib/ai/book-skills.ts:90-120` (`buildBookSkillsSection`) |
| `thesis-rag` — chunks indexés | ✅ **Délimité par extrait avec étiquette de source** : `--- Extrait N [Chapitre X - Titre] / [Réf: Auteur, Année] / [Carnet: …] ---` + system prompt « réponds UNIQUEMENT sur les extraits fournis », « cite tes sources » | `src/lib/rag/rag-service.ts` (`generateRagResponse`, `RAG_SYSTEM_PROMPT` l.87) |
| `ai-writing` — champ `context` (100 k car.) | ⚠️ **Inséré brut** comme message system (« CONTEXTE ADDITIONNEL DE LA THÈSE : … ») sans délimiteur fermé ni consigne anti-instruction | `src/app/api/ai-writing/route.ts:64-69` |

Contexte de risque : le contenu délimité provient du **corpus du propriétaire lui-même** (imports/OCR) — en mono-utilisateur, une injection via corpus = l'utilisateur s'injecte ses propres documents (confusion de prompt locale, pas d'élévation). Aucune donnée tierce non médiatisée n'entre dans les prompts sans marquage.

**Verdict C6** : ✅ CONFORME (délimitation + consignes présentes sur RAG et book-skills) — ⚠️ mineur sur `context` brut (AUD-SEC-006).

---

## 7. Tauri (desktop)

- `src-tauri/capabilities/default.json` (unique capability, fenêtre `main`) :
  ```json
  "permissions": ["core:default", "shell:allow-open", "shell:allow-execute"]
  ```
- `tauri.conf.json` §security : **`"csp": null`** (l.26-27) — aucune Content-Security-Policy.
- Usage réel du plugin shell côté front : `grep -rn '@tauri-apps/plugin-shell' src` → **0 usage**. `shell:allow-execute` est donc **une sur-permission inutilisée** (violation du moindre privilège) ; combinée à `csp: null`, elle ouvre une chaîne théorique XSS webview → exécution de commandes.
- Côté Rust : `std::process::Command::new("powershell")` limité à `Expand-Archive -LiteralPath '<zip>' -DestinationPath '<resource_dir>'` au premier lancement — chemins **contrôlés par l'app** (resources), `-NonInteractive`, `CREATE_NO_WINDOW` ; pas d'entrée utilisateur dans la commande (`src-tauri/src/lib.rs:96-110`).

**Verdict C7** : ⚠️ DÉGRADÉ (durcissement requis avant packaging) — AUD-SEC-001/005.

---

## 8. Registre des vulnérabilités (gravité pondérée contexte mono-utilisateur local)

| ID | Titre | Gravité absolue | Gravité pondérée (local mono-user) | Preuve | Action |
|---|---|---|---|---|---|
| AUD-SEC-001 | `shell:allow-execute` accordé à la webview alors que le front n'utilise jamais le plugin shell (sur-permission) | Élevée | **Moyenne** | `src-tauri/capabilities/default.json` + grep 0 usage | Retirer la permission (ou scope strict) avant packaging |
| AUD-SEC-002 | Clé API réelle (`APINEX_API_KEY` sk-…53 car.) dans l'historique git de `.env`, poussée sur GitHub | Élevée | **Moyenne** | `git log -S 'APINEX_API_KEY=' -- .env` → 4 commits (snapshots UUID) ; valeur caractérisée sans impression | Révoquer/rotater côté APINex (déjà rotatée selon worklog `ec0ae93`) + purge d'historique (BFG) ou archivage du dépôt |
| AUD-SEC-003 | `.env` tracké dans git (committé avant la règle `.env*`) — mécanisme qui a permis AUD-SEC-002 | Moyenne | **Basse-Moyenne** | `git ls-files --error-unmatch .env` = suivi ; HEAD:.env = 1 ligne DATABASE_URL | `git rm --cached .env` + vérifier `.gitignore` |
| AUD-SEC-004 | Routes API sans schéma de validation (40/98 fichiers sans zod/api-schemas ; ex. `/api/ai-test` accepte `{}` en 200) | Moyenne | **Basse** | Tests live T1 (200 sur corps vide) + mesure audit 03 §2.7 | Étendre zod/api-schemas progressivement (priorité routes IA) — **DÉCISION FORMALISÉE 2026-10-11 : D1=C-B (lot 1 sur les 10 routes destructives — bloqué jusqu'à levée P7 + GO spécifique) · lots 2-3 backlog v1.3 · D4=D4-accept (réévaluation obligatoire avant toute diffusion large) · D5=D5-accept (paramétrage des 2 raw SQL GET au backlog, P3)** — recompte à HEAD : 41/99 (doc 23 §1) ; dossier d'exécution doc 35 ; registre 09 |
| AUD-SEC-005 | CSP absente dans la webview Tauri (`csp: null`) | Moyenne | **Basse-Moyenne** | `tauri.conf.json:26-27` | Définir une CSP stricte (défense en profondeur, cf. AUD-SEC-001) |
| AUD-SEC-006 | Champ `context` de `/api/ai-writing` inséré brut dans le prompt (sans délimiteur ni consigne), 100 k car. | Basse | **Basse (self-injection)** | `ai-writing/route.ts:64-69` vs RAG/book-skills délimités | Encadrer avec délimiteurs + consigne (reprendre le motif RAG) |
| AUD-SEC-007 | Messages d'erreur internes renvoyés bruts (`error.message`) sur plusieurs routes IA (`ai-writing` l.100, `thesis-rag` l.54) | Basse | **Basse (client = propriétaire)** | Tests live : aucune stack dans les réponses observées ; code source | Génériquer les 500 |
| AUD-SEC-008 | Fichiers uploadés (PDF ≤ 50 Mo) stockés en blob dans SQLite, sans sauvegarde documentée | N/A sécurité (confidentialité ✅ : documents locaux) | **Info** | `article-imports/route.ts:124-133` ; audit 03 §5 | Couvert par la remédiation sauvegarde DB (audit 03) |

**Contrôles N/A explicites** (par conception, baseline §2) : authentification/sessions/mots de passe, isolation multi-utilisateurs, rate-limiting par utilisateur, CSRF inter-sites (API locale, pas de cookie d'authentification ; le cookie de config IA est httpOnly). **Contrôles réussis** : secrets en code (0), magic bytes + taille upload, Prisma paramétré (prouvé live), absence de SSRF, délimitation des corpus dans les prompts, échappement markdown, 0 écriture FS (pas de traversal).

**Bilan** : 0 vulnérabilité Critique/Élevée pondérée ; 2 Moyennes (sur-permission shell Tauri, secret historique dans git) ; 5 Basses ; 1 Info ; aucune exploitable à distance — la surface d'attaque externe de l'app est limitée aux fournisseurs IA/académiques appelés avec des hôtes constants.
