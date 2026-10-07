# Plan — Mode « Expertise urbaine (URBANIS-DZ) »

## État réel constaté
- `src/lib/ai/specializations/index.ts` : 27 spécialisations ré-exportées (l.8-36) + registre `SPECIALIZATION_PROMPTS: Record<string, string>` (l.70+) mappant `WritingMode.id → prompt`. Ajout d'un mode = 1 fichier + 2 lignes de registre.
- `src/lib/ai/specializations/analyse.ts` : gabarit type — `buildPrompt({ modules: [...], specialization: ... })`.
- `src/lib/ai/prompt-builder.ts` : `buildPrompt` assemble noyau (modules sélectionnés, TOUS si omis) + spécialisation (l.88-98) ; `buildStandalonePrompt` retourne la spécialisation **sans noyau** (l.101-104) — conçu pour les prompts autoporteurs.
- `src/lib/ai/knowledge-core.ts` : 13 modules (`KnowledgeModule`, l.53-67) ; `KNOWLEDGE_CORE_VERSION = "2026-10-03"` (l.47) ; noyau complet ≈ 21 794 tok / 22 000 (AGENTS.md) — **à ne pas toucher**.
- `src/data/ai-writing-modes.ts` : métadonnées `WRITING_MODES` (id, label, description, icon, placeholder, temperature, category ; `systemPrompt: ""` déprécié). Dernier id : `deep-research` (l.280).
- `src/app/api/ai-writing/stream/route.ts` : le mode est retrouvé dans `WRITING_MODES` (l.32, erreur sinon), prompt = `SPECIALIZATION_PROMPTS[mode]` (l.49, erreur 400 sinon), température issue des métadonnées (l.94). Aucune whitelist au-delà — l'ajout data+registre suffit côté backend.
- `src/modules/ai-writing/ai-writing-page.tsx` : `ICON_MAP` fixe (l.41-56 : 11 icônes lucide) consommé en l.240 (`ICON_MAP[mode.icon] || Sparkles`) — une nouvelle icône exige 2 lignes (import + clé). Modes chargés via `useQuery` (l.96-106).
- `src/lib/ai/post-compaction-digestion.test.ts` : précédent de test de câblage par liste de modes (l.55-95) — vérifie présence dans `SPECIALIZATION_PROMPTS` et taille.
- Canal « compétences livres » actif sur ai-writing (`ai-writing/stream/route.ts` l.62-63) — cohabite avec tout prompt de spécialisation ; la règle d'intégrité « jamais source de citations » sera rappelée dans la passerelle du prompt.

## Approche retenue
1. **1 mode unique** `expertise-urbaine-dz` : le pack est conçu comme UNE instruction système dont l'agent route lui-même les modes M1-M7 — ne pas éclater en 7 modes ThesisFrame.
2. **Fichier** `src/lib/ai/specializations/urbanis-dz.ts` : `URBANIS_DZ_PROMPT = buildStandalonePrompt(<§2 verbatim> + <passerelle>)`. §2 (4 837 car.) retranscrit fidèlement depuis le pack ; passerelle d'intégration ajoutée APRÈS le pack, clairement intitulée « CONTEXTE D'INTÉGRATION (ThesisFrame) » (3 puces : usage thèse, intégrité citations compétences livres, langue). Total ≈ 5 400 car. ≈ 1 300 tok — autoporteur, zéro impact noyau.
3. **Registre** : export + entrée `SPECIALIZATION_PROMPTS` dans `index.ts`.
4. **Data** : entrée `WRITING_MODES` (label « Expertise urbaine (URBANIS-DZ) », icon `Building2`, category `analysis`, temperature `0.4` — rigueur factuelle, alignée sur peer-review ; description et placeholder portent la mention non-opposabilité/JORADP).
5. **UI** : `Building2` dans `ICON_MAP` + note conditionnelle sous la zone de saisie quand le mode est actif : « Avis technique non opposable — toute règle juridique doit être vérifiée au JORADP » (ambre, discret).
6. **Tests** `urbanis-dz.test.ts` : invariants structurels (12 règles dures, M1-M7, RISQUES, FORMAT DE SORTIE, passerelle), autoporteur (CA-2.2), câblage data+registre, garde-fou taille (≤ 7 000 car.), snapshot anti-dérive.
7. **Docs** : section « 6 quater » dans `docs/ARCHITECTURE-CONNAISSANCE.md` (canal, budget, provenance : pack v1.1, date, version).

## Alternatives écartées
- **buildPrompt avec modules noyau** : le noyau complet (21 794 tok) dépasserait tout plafond ; même un sous-ensemble (ex. `writing-process`) diluerait la doctrine du pack et mixe deux styles. Écarté — l'agent urbain a sa propre doctrine (C0) autoporteuse.
- **3 modes séparés (diagnostic / conformité / prospective)** : multiplierait les prompts et forcerait un découpage du §2 ; le pack route déjà M1-M7 en interne. Écarté — 1 mode.
- **Copier §3/§4 (référentiels juridiques) dans le prompt** : +6 350 car. pour des textes datés dont la vérification JORADP est de toute façon exigée par la règle 3 ; relèverait de l'Option B (registre structuré). Écarté.
- **Voie rapide** : 4 fichiers touchés (prompt, registre, data, page) > 1 fichier — hors critères. Cycle complet.

## Fichiers touchés
| Fichier | Nature | Risque |
|---|---|---|
| src/lib/ai/specializations/urbanis-dz.ts | création | prompt verbatim — fidélité au pack, tests de structure |
| src/lib/ai/specializations/index.ts | +2 lignes | registre — test générique de câblage à ne pas casser |
| src/lib/ai/specializations/urbanis-dz.test.ts | création | vitest, aucun effet runtime |
| src/data/ai-writing-modes.ts | +11 lignes | 1 entrée — le compteur « N modes » de la page se met à jour seul (l.66) |
| src/lib/ai/knowledge-core.budget.test.ts | +0/-0 (1 mot) | liste `allowedStandalone` l.173 — inscription du **nom de fichier** `urbanis-dz` (le rapport mesure les spécialisations par fichier, pas par id de mode ; le prompt autoporteur sans clé `modules:` doit y être déclaré). Écart Article 4 : fichier non anticipé au plan, découvert par le test T6 ; première tentative avec l'id de mode corrigée en nom de fichier après lecture du mécanisme (`measureBudget`, l.57-102) |
| src/modules/ai-writing/ai-writing-page.tsx | ~10 lignes | ICON_MAP + note conditionnelle — rien d'autre |
| docs/ARCHITECTURE-CONNAISSANCE.md | +section | doc |

## Impacts transverses
- Aucun schéma Prisma, aucune ligne rouge, aucune variable d'environnement, aucun build Tauri.
- Budget : le mode n'embarque pas le noyau → ~1 300 tok, sans effet sur la marge full core.
- La recette déléguée du banc d'essai T1-T7 reste partielle : seuls des comportements structuraux sont testables en vitest ; CA-1.2/1.3 vérifiés live en recette (comportement LLM, non déterministe — constat honnête consigné).

## Stratégie de vérification
`bun run test:run` (suite complète, baseline 70 fichiers / 1 558 verts + nouveaux), `bun run lint` (0 erreur / 231 warnings), recette navigateur agent-browser : sélection du mode → note visible (CA-1.4) → génération live type banc d'essai T4 (CA-1.2/1.3) → bloc « Provenance des savoirs » toujours présent (CA-2.3) → mobile 390 px sans scroll horizontal → 0 erreur console → captures `test-snapshots/urbanis-dz-*.png`.

## Risques
- Fidélité de retranscription du §2 (guillemets « », flèches →) — mitigée par les tests d'invariants + snapshot.
- Oubli de l'icône dans ICON_MAP → fallback `Sparkles` silencieux — mitigé par ajout explicite + recette visuelle.
- Le test générique `post-compaction-digestion.test.ts` ne couvre pas tous les modes — aucune rupture attendue ; vérifié en non-régression.
- Comportement LLM live non déterministe — les CA-1.2/1.3 sont recettés qualitativement, pas en vitest.
