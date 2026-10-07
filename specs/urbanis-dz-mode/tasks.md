# Tâches — Mode « Expertise urbaine (URBANIS-DZ) »

## Groupe A — IA / prompts + test dédié
- [x] T1 — Créer `src/lib/ai/specializations/urbanis-dz.ts` : `URBANIS_DZ_PROMPT = buildStandalonePrompt(<§2 du pack verbatim> + <passerelle « CONTEXTE D'INTÉGRATION (ThesisFrame) » 3 puces>)` · preuve : taille mesurée ≤ 7 000 car., grep des marqueurs.
- [x] T2 — Enregistrer la spécialisation dans `index.ts` (export + entrée `SPECIALIZATION_PROMPTS['expertise-urbaine-dz']`) · preuve : import lint-clean, résolution du registre.
- [x] T3 — Créer `src/lib/ai/specializations/urbanis-dz.test.ts` : invariants structurels (12 règles dures, M1-M7, RISQUES, FORMAT DE SORTIE, passerelle), autoporteur (CA-2.2), garde-fou ≤ 7 000 car., snapshot anti-dérive · preuve : vitest verts.

## Groupe B — Données / UI [DÉPEND DE Groupe A]
- [x] T4 — Ajouter l'entrée `expertise-urbaine-dz` dans `WRITING_MODES` (`src/data/ai-writing-modes.ts`) : label, description avec « avis technique non opposable », placeholder, icon `Building2`, category `analysis`, temperature `0.4`, systemPrompt `""` + bloc « câblage mode + registre » (CA-1.1) dans `urbanis-dz.test.ts` · preuve : vitest verts + lint.
- [x] T5 — UI `ai-writing-page.tsx` : importer + enregistrer `Building2` dans `ICON_MAP` ; note conditionnelle ambre sous la zone de saisie quand le mode est actif (« Avis technique non opposable — toute règle juridique doit être vérifiée au JORADP ») · preuve : recette navigateur CA-1.4.

## Groupe C — Non-régression / docs [DÉPEND DE Groupe B]
- [x] T6 — Suite complète + lint · preuve : vitest 0 échec (baseline 70/1 558 + nouveaux), lint 0 erreur / 231 warnings, lignes rouges 0 diff.
- [x] T7 — `docs/ARCHITECTURE-CONNAISSANCE.md` : section « 6 quater » (mode URBANIS-DZ : source pack v1.1, canal autoporteur sans noyau, intégrité citations, non-opposabilité/JORADP) · preuve : lecture.

## Convergence — 2026-10-07

Critères d'acceptation satisfaits : **7/7** (CA-1.1→1.4, CA-2.1→2.3 — aucune manquante)
Écarts au plan : 2 consignés — (1) bloc « câblage » du test déplacé de T3 vers T4 (ordonnancement : l'assertion exige l'entrée data) ; (2) `src/lib/ai/knowledge-core.budget.test.ts` inscrit au plan Article 4 (capteur préexistant exigeant la déclaration des autoporteurs par nom de fichier).
Dette introduite : aucune. Le banc d'essai T1-T7 du pack n'est couvert en vitest que structurellement (invariants du prompt) ; les comportements T4/T7 sont vérifiés live en recette (LLM non déterministe, non automatisable en unitaire) — constaté comme limite, pas comme dette.
Verdict : **CONVERGÉ** — recette déléguée 7/7 CA (8 contrôles navigateur, banc d'essai T4 live, mobile 390 px, 0 erreur console) ; **validé par le propriétaire** (« ok et enchainer », 2026-10-07 11:25) — cycle clos.
