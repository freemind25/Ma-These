# Preuves — sceau-provenance-savoirs

## Ouverture du cycle (2026-10-03, 19:55)

- Déclencheur : propriétaire — « ok pour la prochaine étape » (IM, 19:52 env.), la prochaine étape annoncée étant le stamp Sceau de vérité (reporté par la spec du cycle 11, § Hors périmètre).
- Statut à l'ouverture : spec.md + plan.md + tasks.md rédigés après exploration sourcée (chemins + lignes cités dans plan.md § État réel constaté). **Aucune ligne de code** — points d'arrêt du protocole respectés, en attente de validation du propriétaire (3 [À CLARIFIER] avec propositions conservatrices).
- Exploration clé : knowledge-core.ts (949 l., pas de version) ; chapter-draft/stream l.332-335 ; ai-writing/stream l.59 ; chapters/[id]/route.ts l.25-52 (version = état antérieur) ; schema l.70-82 (pas de métadonnées) ; chapter-history-dialog.tsx (228 l.) ; ai-writing l.391 (copie seule).

## Exécution et recette (2026-10-03, 16:39-17:04 — horodatages box)

### Commits par groupe
| Groupe | Tâches | Commit |
|---|---|---|
| A — Schéma | T1 | `7e4528e` |
| B — IA/lib pur | T2-T3 | `09275ac` |
| C — Backend | T4-T8 (+T8b) | `e948c87`, `ada013f` |
| D — UI | T9-T12 | `15819f6` |
| E — Docs | T13 | `501f12b` |

### Preuves d'exécution (extraits réels)
- **T1** — db:push additif ; PRAGMA : `Chapter.stamp: PRÉSENTE`, `ChapterVersion.stamp: PRÉSENTE` ; comptes avant/après **7 / 4 / 58 / 1 identiques** (survie des données).
- **T3** — vitest : `Test Files 3 passed (3) / Tests 28 passed` (stamp 10 + budget + book-skills).
- **T4** — parsers clients vérifiés : brouillon `brouillon-chapitre-page.tsx` l.213-235 (seuls `chunk`/`error` traités) et ai-writing l.194-205 — **types inconnus ignorés** → événement `stamp` sûr.
- **T5/T6** — stamp émis en fin de stream, hors prompt ; prompts inchangés (tests byte-identité du cycle 11 restants verts : suite complète 70 fichiers / **1558 tests verts**, baseline 1548 + 10).
- **T7** — PUT : `stamp` zod `.nullish()` max 16 000 ; logique « le stamp ne suit que le contenu ».
- **T8b** — `GET /api/chapters/[id]` → `{"id":"…","stamp":null}` (état courant léger).
- **T14** — lint `✖ 231 problems (0 errors, 231 warnings)` = baseline exacte (1 warning auto-introduit `_stamp` corrigé en route vers le commit C).
- Lignes rouges : `git diff HEAD --stat` sur les 3 fichiers protégés = **0 diff avant chaque commit**.

### Incident d'environnement (résolu)
Le premier `GET …/versions` après db:push renvoyait **500** : le serveur dev, démarré avant la régénération du client Prisma, ne connaissait pas la colonne `stamp`. Redémarrage du serveur (NODE_OPTIONS=--max-old-space-size=1200) → GET **200**. Aucun défaut produit.

### Recette navigateur (délégation propriétaire, 16:55-17:03)
1. **CA-2.x préparation** — compétence rang 2 activée via interrupteur UI (`actives: 1`).
2. **CA-1.1** — génération brouillon chapitre 1 (400 mots cibles → 258 mots) : bloc sous l'aperçu « **Provenance des savoirs : noyau de connaissance v2026-10-03 + 1 compétence livre** » ; détail déplié : « **[L1] How to Write and Publish a Scientific Paper (8e ed.) — injectée en intégral** » + « généré le 04/10/2026 15:58 ».
3. **CA-2.1** — insertion confirmée (« Remplacer le contenu ») → API : `chapter.stamp = {"coreVersion":"2026-10-03","skills":[{"id":"7a4cf5f65db34bfc8015",…}` ; versions 2→3, la plus récente (257 mots) porte le stamp.
4. **CA-2.2/2.3** — dialog Historique du chapitre : bloc « État actuel » tracé ; liste « Provenance des savoirs par version » : `04/10/2026 16:00 — noyau … + 1 compétence livre` / `02/10/2026 17:23 — saisie manuelle` / `02/10/2026 17:21 — saisie manuelle`.
5. **Restauration** — PUT du contenu d'origine (1 957 mots, sans stamp) → état courant `stamp: null` (« saisie manuelle », exact) ; désactivation de la compétence → **0/58 actives**.
6. **CA-1.2 + CA-3.1** — assistant d'écriture (mode Revue de littérature, 0 compétence active) : bloc sous le résultat « **noyau de connaissance v2026-10-03 — aucune compétence livre active** ».
7. **T12** — mobile 390×844 : `pas de scroll horizontal (OK)` ; 0 erreur page (`agent-browser errors` vide) ; captures `test-snapshots/sceau-provenance-aiwriting-desktop.png` + `-mobile.png`.
8. **CA-3.2** — l'assistant d'écriture n'émet aucun PUT (copie manuelle) : non-persistance par construction.

### Écarts documentés
- Plan § 4 corrigé avant implémentation (versions = snapshots du NOUVEL état — vérifié sur `chapters/[id]/route.ts` l.25-52).
- 1 fichier ajouté hors table du plan : `src/components/knowledge-stamp-block.tsx` (bloc partagé, même format sur les 3 surfaces — exigence CA-1.1/2.x/3.1).
- Nouvelle version créée par la restauration (1 957 mots, « saisie manuelle ») : trace honnête de la recette dans l'historique du chapitre 1.

```
### Compte rendu de recette — sceau-provenance-savoirs
Tâches recettées : T1→T14 (tous les groupes, cases cochées)
Vérifications exécutées : vitest 70/1558 verts, lint 0 erreur/231 baseline, recette navigateur 8 contrôles, mobile 390 px, 0 erreur console
CA couvertes : 10/10
Défauts trouvés : 0 produit (1 incident environnement Prisma client résolu par redémarrage)
Écart au plan : documenté (sémantique versions + composant partagé)
Statut : RECETTÉE (délégation) — CONVERGÉ
```

### Validation propriétaire (2026-10-04)

Après la recette déléguée (10/10 CA, révisable), le propriétaire a été invité à la recette de contrôle : test guidé dans le Preview Panel (activer une compétence livre → générer un brouillon → sceau sous l'aperçu → insérer → historique) ou accord simple.

Réponse du propriétaire : **« OK »** (IM, 2026-10-04 17:28 TZ 'Etc/GMT-1') — recette déléguée acceptée, aucune réserve, aucune correction demandée.

**Cycle n°12 « sceau-provenance-savoirs » clos et validé.**
