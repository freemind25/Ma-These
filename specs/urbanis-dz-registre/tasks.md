# Tâches — Registre juridique structuré URBANIS-DZ

## Groupe A — Schéma
- [ ] T1 — Ajouter le modèle `LegalRef` (11 champs §7 : domaine, reference, joradp, statut, textesLies, portee, questions, autorites, derniereVerification, niveauConfiance + enabled opt-in strict, timestamps, index domaine) · preuve : db:push additif, diff avant/après, survie 58 compétences / 7 chapitres / stamps prouvée.

## Groupe B — IA / prompts + tests [DÉPEND DE Groupe A]
- [ ] T2 — Créer `src/lib/ai/legal-refs.ts` : `LegalRefInput`, budgets (contenu 8 000 / index 1 500), `selectLegalRefs`, `buildLegalRefsIndex`, `buildLegalRefsSection` (null si 0 ; garde-fous : appui documentaire, jamais une autorisation, jamais une citation bibliographique, vigilances conservées) · preuve : vitest verts.
- [ ] T3 — Étendre `src/lib/ai/knowledge-stamp.ts` : `KnowledgeStamp.legalRefs?` (optionnel), paramètre `legalRefs` de `buildKnowledgeStamp`, summary/detail étendus · preuve : ancien stamp sans legalRefs toujours valide (test).
- [ ] T4 — Créer `src/lib/ai/legal-refs.test.ts` + extension `knowledge-stamp.test.ts` : sélection budget, index tronqué propre, section nulle, garde-fous, stamp additif · preuve : vitest verts.

## Groupe C — Backend [DÉPEND DE Groupe B]
- [ ] T5 — Créer `src/app/api/legal-refs/route.ts` (GET liste + search/domaine, POST zod, DELETE ?id/{ids}) et `[id]/route.ts` (GET, PUT) — calque book-skills avec `.nullish()` · preuve : curl 201/200/400/404.
- [ ] T6 — Injection `ai-writing/stream` : si `mode === "expertise-urbaine-dz"` → section registre après compétences livres + legalRefs au stamp ; sinon prompt et stamp byte-identiques · preuve : test non-régression (autre mode, 0 active).

## Groupe D — UI [DÉPEND DE Groupe C]
- [ ] T7 — Onglet « Registre juridique » dans `livres-competences-page.tsx` : liste (référence, domaine, statut, JORADP, niveau de confiance, dernière vérification), dialog création/édition (11 champs), interrupteur « Utilisée par l'IA », suppression · preuve : recette navigateur.
- [ ] T8 — `knowledge-stamp-block.tsx` : afficher les legalRefs dans le détail quand présentes · preuve : ancien stamp affiché sans régression.

## Groupe E — Données initiales [DÉPEND DE Groupe A]
- [ ] T9 — `scripts/seed-legal-refs.ts` : alimentation §3+§4 du pack (36 entrées attendues, vigilances verbatim, idempotent) · preuve : comptage en base, extrait d'entrée.

## Groupe F — Non-régression / docs [DÉPEND DE Groupe D + E]
- [ ] T10 — Suite complète + lint + lignes rouges · preuve : vitest ≥ 71 fichiers verts, lint 0 erreur / 231 warnings, 0 diff.
- [ ] T11 — `docs/ARCHITECTURE-CONNAISSANCE.md` : section « 6 quinquies — Registre juridique URBANIS-DZ » · preuve : lecture.
- [ ] T12 — Recette navigateur déléguée (CA-1.1→1.3, CA-2.1→2.3, CA-3.1→3.2, mobile 390 px, 0 erreur console) + convergence · preuve : preuves.md + captures.
