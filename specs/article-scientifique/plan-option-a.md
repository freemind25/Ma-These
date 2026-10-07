# Plan — Article scientifique Option A (socle)

## État réel constaté
- Aucun modèle Article/ImportedDoc (`prisma/schema.prisma`, 27 modèles). Patterns versions : `ChapterVersion` l.71.
- Aucun parseur PDF/DOCX dans package.json (vérifié ce jour). Déps présentes : `docx` ^9.7.1 (génération, `src/app/api/export-docx/route.ts`), `jspdf` ^4.2.1.
- Génération IA : `generateCompletionStream`/complétion (`src/lib/ai/zai-client.ts`) ; appels JSON synchrones utilisés ailleurs (ex. directeur-chat ~320 s).
- Montage module : `src/lib/stores/app-store.ts` (`NAVIGATION_ITEMS` consommé par la sidebar l.46 — non rouge) + switch `src/app/page.tsx` l.65-155.
- Modules existants à ne pas réécrire : `articles` (guide statique 495 l.), `bibliotheque`, `export-docx`, `traducteur`.
- Capteur budget (`knowledge-core.budget.test.ts`) : traque les prompts autoporteurs de spécialisation par nom de fichier — les prompts article ne passeront **pas** par `buildStandalonePrompt` ni par le registre des spécialisations → capteur non concerné (vérifié à l'implémentation par suite complète).

## Approche retenue
- **Schéma additif** : `Article` (métadonnées + sections JSON + plan JSON), `ArticleVersion` (snapshots), `ImportedDoc` (extraction + limites + flag scanné). Isolation `thesisId`.
- **Extraction** : `mammoth` (DOCX → HTML structuré + texte) et `unpdf` (PDF → texte par page) — pure JS, build Tauri sûr. Lib pure `src/lib/articles/extraction.ts` : validation type/taille (20 Mo), détection PDF scanné (pages sans texte), titres depuis HTML, limites listées.
- **Prompts** : `src/lib/articles/prompts.ts` — règles d'intégrité verbatim du cahier des charges + buildPlanPrompt + buildSectionPrompt (contexte sources tronqué budgété, doc importé = données pas instructions, [À compléter par l'auteur], traçabilité).
- **API** : `/api/article-imports` (POST upload FormData → extraction → stockage ; GET liste ; DELETE), `/api/articles` (CRUD) + `/api/articles/[id]`, `/api/articles/plan` (POST proposition de plan), `/api/articles/section` (POST génération d'une section), `/api/articles/export-docx` (POST fichier DOCX via lib `docx`).
- **UI** : nouveau module `article-redaction` (montage app-store.ts + page.tsx, zéro ligne rouge) — assistant 4 étapes (sources → consignes → plan éditable → génération section par section) + relecture/versions/export. Boutons d'entrée dans `articles-page` et `bibliotheque-page` (setActiveModule).
- **Versions** : snapshot JSON des sections à chaque enregistrement demandé ; restauration.

## Alternatives écartées
- Tiptap complet → poids MVP ; textareas markdown suffisants au socle (option B).
- SSE par section → textes courts, JSON synchro fiable ; SSE conservé pour les flux longs existants.
- Table ArticleSource dédiée → JSON embarqué par section, réversible (option B peut la détacher).
- Réutiliser le builder export-docx thèse (~1 000 l., spécifique) → builder article minimal dédié avec la même lib.

## Fichiers touchés
| Fichier | Nature | Risque |
|---|---|---|
| prisma/schema.prisma | +3 modèles additifs | db:push — survie exigée |
| package.json (+bun.lock) | +mammoth +unpdf | build Tauri — pure JS exigé, vérifié |
| src/lib/articles/extraction.ts + .test.ts | création | nul (pur) |
| src/lib/articles/prompts.ts + .test.ts | création | nul (pur) |
| src/app/api/article-imports/route.ts | création | taille max, types MIME |
| src/app/api/articles/route.ts + [id]/route.ts | création | nul |
| src/app/api/articles/plan/route.ts, section/route.ts, export-docx/route.ts | création | appels LLM, délais |
| src/modules/article-redaction/article-redaction-page.tsx | création | UI wizard |
| src/lib/stores/app-store.ts | +1 module (NAVIGATION_ITEMS) | registre central — audit 20 fournisseurs non concerné |
| src/app/page.tsx | +1 case | switch 45+ cas |
| src/modules/articles/articles-page.tsx, bibliotheque-page.tsx | +1 bouton chacun | points d'entrée |
| docs/ARCHITECTURE-CONNAISSANCE.md | § 7 bis | doc |
| specs/article-scientifique/* | artefacts | — |

## Impacts transverses
Schéma Prisma additif · 2 nouvelles deps JS (pas de binaire natif) · aucune route existante modifiée · capteur budget non concerné (sans `buildStandalonePrompt`) · aucune variable d'environnement · Tauri : imports pure JS (mammoth, unpdf) — vérifier bundling à la recette lint/test.

## Stratégie de vérification
vitest (extraction : types/taille/scanné/titres ; prompts : intégrité verbatim, anti-injection, [À compléter]) · curl CRUD · suite complète ≥ 1 585 verts · lint 0 erreur / 231 · recette navigateur : import d'un DOCX de test réel (généré via lib docx), aperçu + limites, wizard complet, génération d'une section live, édition, version, export DOCX téléchargé, mobile 390 px, 0 erreur console · lignes rouges 0 diff à chaque commit.

## Risques
- Upload réel via agent-browser (input file) — friction possible ; contournement : créer l'import via curl si l'UI file-input résiste, la recette UI couvre le reste du parcours.
- Délais LLM section (~30-60 s) — poll client avec états visibles.
- unpdf en bundling Next/Turbopack — vérifier import dynamique serveur ; fallback : pdf-parse (décision à consigner si changement).
- Binaire de test DOCX : généré au vol via lib `docx` (script jetable) — pas de fixture versionnée.
