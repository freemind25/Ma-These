# Tâches — Provenance des savoirs (brouillon, à valider avec la spec/plan)

## Groupe A — Schéma [BLOQUANT]
- [ ] T1 — Ajouter `stamp String?` (JSON) sur `Chapter` et `ChapterVersion` · `prisma/schema.prisma` · preuve : `bun run db:push` additif, comptes de lignes avant/après identiques (survie des données), diff schéma minimal.

## Groupe B — IA / lib pur
- [ ] T2 — Déclarer la constante `KNOWLEDGE_CORE_VERSION` en tête de `knowledge-core.ts` · preuve : import lint-clean, valeur documentée.
- [ ] T3 — Créer `src/lib/ai/knowledge-stamp.ts` pur (`buildKnowledgeStamp`) + tests unitaires (0 skill, intégral, index-only, sérialisation) · preuve : vitest verts.

## Groupe C — Backend / routes API [DÉPEND DE Groupe A + B]
- [ ] T4 — Vérifier la tolérance du parser client aux événements de stream inconnus (lecture du code ; ajuster si besoin) · preuve : chemins + lignes cités, ajustement documenté.
- [ ] T5 — Émettre l'événement `stamp` en fin de stream dans `chapter-draft/stream` · preuve : curl/lecture du stream, stamp présent, prompt inchangé (tests byte-identité verts).
- [ ] T6 — Émettre l'événement `stamp` dans `ai-writing/stream` · preuve : idem.
- [ ] T7 — PUT `chapters/[id]` : zod + `stamp` nullish ; archivage du stamp courant sur la version créée, puis affectation du nouveau (ou null = saisie manuelle) · preuve : curl avec/sans stamp, cas sans changement de contenu.
- [ ] T8 — GET `chapters/[id]/versions` renvoie `stamp` · preuve : curl.

## Groupe D — Frontend / UI [DÉPEND DE Groupe C]
- [ ] T9 — Brouillon : afficher la trace sous l'aperçu (noyau version + compétences avec mode, « aucune compétence livre active »), transmettre le stamp à l'insertion · preuve : navigateur, CA-1.1/1.2/1.3 + CA-2.1.
- [ ] T10 — Historique : état courant en tête + stamps par version, résumé + détail dépliable, « saisie manuelle » · preuve : navigateur, CA-2.1/2.2/2.3.
- [ ] T11 — Assistant d'écriture : afficher la trace sous le résultat (non persistée) · preuve : navigateur, CA-3.1.
- [ ] T12 — Recette responsive (390 px sans scroll horizontal, 0 erreur console) · preuve : captures desktop + mobile.

## Groupe E — Docs / non-régression
- [ ] T13 — `ARCHITECTURE-CONNAISSANCE.md` : section version du noyau (valeur, date, périmètre du changement) · preuve : lecture.
- [ ] T14 — Suite complète + lint · preuve : vitest 0 échec (baseline + nouveaux), lint 0 erreur / 231 warnings.
