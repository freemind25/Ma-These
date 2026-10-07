# Tâches — Registre juridique structuré URBANIS-DZ

## Groupe A — Schéma
- [x] T1 — Ajouter le modèle `LegalRef` (11 champs §7 : domaine, reference, joradp, statut, textesLies, portee, questions, autorites, derniereVerification, niveauConfiance + enabled opt-in strict, timestamps, index domaine) · preuve : db:push additif, diff avant/après, survie 58 compétences / 7 chapitres / stamps prouvée.

## Groupe B — IA / prompts + tests [DÉPEND DE Groupe A]
- [x] T2 — Créer `src/lib/ai/legal-refs.ts` : `LegalRefInput`, budgets (contenu 8 000 / index 1 500), `selectLegalRefs`, `buildLegalRefsIndex`, `buildLegalRefsSection` (null si 0 ; garde-fous : appui documentaire, jamais une autorisation, jamais une citation bibliographique, vigilances conservées) · preuve : vitest verts.
- [x] T3 — Étendre `src/lib/ai/knowledge-stamp.ts` : `KnowledgeStamp.legalRefs?` (optionnel), paramètre `legalRefs` de `buildKnowledgeStamp`, summary/detail étendus · preuve : ancien stamp sans legalRefs toujours valide (test).
- [x] T4 — Créer `src/lib/ai/legal-refs.test.ts` + extension `knowledge-stamp.test.ts` : sélection budget, index tronqué propre, section nulle, garde-fous, stamp additif · preuve : vitest verts.

## Groupe C — Backend [DÉPEND DE Groupe B]
- [x] T5 — Créer `src/app/api/legal-refs/route.ts` (GET liste + search/domaine, POST zod, DELETE ?id/{ids}) et `[id]/route.ts` (GET, PUT) — calque book-skills avec `.nullish()` · preuve : curl 201/200/400/404.
- [x] T6 — Injection `ai-writing/stream` : si `mode === "expertise-urbaine-dz"` → section registre après compétences livres + legalRefs au stamp ; sinon prompt et stamp byte-identiques · preuve : test non-régression (autre mode, 0 active).

## Groupe D — UI [DÉPEND DE Groupe C]
- [x] T7 — Onglet « Registre juridique » dans `livres-competences-page.tsx` : liste (référence, domaine, statut, JORADP, niveau de confiance, dernière vérification), dialog création/édition (11 champs), interrupteur « Utilisée par l'IA », suppression · preuve : recette navigateur.
- [x] T8 — `knowledge-stamp-block.tsx` : afficher les legalRefs dans le détail quand présentes · preuve : ancien stamp affiché sans régression.

## Groupe E — Données initiales [DÉPEND DE Groupe A]
- [x] T9 — `scripts/seed-legal-refs.ts` : alimentation §3+§4 du pack (27 entrées réelles (§3:13 + §4:14 — estimation 36 de l'analyse corrigée sur le verbatim du pack), vigilances verbatim, idempotent) · preuve : comptage en base, extrait d'entrée.

## Groupe F — Non-régression / docs [DÉPEND DE Groupe D + E]
- [x] T10 — Suite complète + lint + lignes rouges · preuve : vitest ≥ 71 fichiers verts, lint 0 erreur / 231 warnings, 0 diff.
- [x] T11 — `docs/ARCHITECTURE-CONNAISSANCE.md` : section « 6 quinquies — Registre juridique URBANIS-DZ » · preuve : lecture.
- [x] T12 — Recette navigateur déléguée (CA-1.1→1.3, CA-2.1→2.3, CA-3.1→3.2, mobile 390 px, 0 erreur console) + convergence · preuve : preuves.md + captures.

## Convergence — 2026-10-07

Critères d'acceptation satisfaits : **8/8** (CA-1.1→1.3, CA-2.1→2.3, CA-3.1→3.2 — aucune manquante)
Écarts au plan : 2 consignés — (1) 27 entrées seedées au lieu des ~36 estimées (le verbatim du pack fait foi) ; (2) `.gitignore` inscrit au plan Article 4 (`scripts/*` ignoré — exception `!scripts/seed-legal-refs.ts` ajoutée) ; (3) défaut trouvé en recette corrigé dans le groupe : POST 500 (`statut` NOT NULL recevait `null`) — POST laisse le défaut s'appliquer, PUT vide → « à vérifier », prouvé curl 201.
Dette introduite : aucune. La suppression en masse (?id/{ids}) est livrée côté API, l'UI expose la suppression unitaire (suffisant au registre).
Verdict : **CONVERGÉ** (recette navigateur déléguée, révisable à la recette du propriétaire)
