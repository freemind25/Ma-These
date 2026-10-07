# Plan — Option B

## État réel constaté
Option A livrée (cycle n°15) : wizard 5 étapes, /api/articles/plan+section, analyse inexistante, angle = champ libre non guidé, versions listées+restaurables.

## Approche
1. `src/lib/articles/analysis.ts` (pure) : analyzeSources (volume par source, titres, études via kind=experiment, manquants, qualité) + fragmentationRisk.
2. prompts.ts : buildAnglesPrompt + parseAnglesResponse (JSON [{angle, rationale, coverage}]).
3. Routes : /api/articles/analyze (POST, pur) ; /api/articles/angles (POST, IA).
4. UI : bouton « Analyser les sources » (étape 1) → panneau rapport ; bouton « Proposer des angles » (étape 2) → cartes + sélection (obligatoire si ≥ 2 études) ; blocage génération sans angle (message).
5. Tests analysis + parse angles ; suite ; recette API+UI ; docs.

## Fichiers touchés
| Fichier | Nature | Risque |
|---|---|---|
| src/lib/articles/analysis.ts + test | création | nul |
| src/lib/articles/prompts.ts (+angles) | modification | tests existants préservés |
| src/app/api/articles/analyze/route.ts, angles/route.ts | création | IA angles |
| src/modules/article-redaction/article-redaction-page.tsx | modification (étapes 1-2 enrichies) | wizard existant |
| specs + docs | artefacts | — |

## Vérification
vitest ; curl analyze (rapport réel sur le mémoire de recette) ; curl angles (IA live) ; UI : panneau + cartes + blocage sans angle ; suite complète ; lignes rouges.
