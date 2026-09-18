# FICHE SYNTHESE — ThesisFrame

Tenue à jour à la fin de chaque session (protocole SDD — `skills/sdd-thesisframe/SKILL.md`, « Rendu de fin de session »).

---

## Session du 2026-09-17 — Activation du protocole SDD

**Slug traité** : aucun cycle spec → plan cette session ; session d'audit et d'activation du protocole.

**État de convergence** : n/a (aucun cycle lancé).

**Décisions prises** :

- Protocole SDD **adopté** après audit factuel du document : 8 affirmations exactes, 1 obsolète (`ChapterVersion` existe — `prisma/schema.prisma` l.69 — là où le texte affirmait que `Chapter` n'avait pas d'historique), 1 inexacte pour cet environnement (sous-agents réels disponibles), 1 règle à adapter (`db:push` vs migration Prisma).
- Skill installé et versionné : `skills/sdd-thesisframe/SKILL.md`, avec les 6 amendements validés (correction `ChapterVersion` ; règle Prisma `db:push` avec preuve d'intégrité ; voie rapide ; politique sous-agents ; outils de preuve listés ; nommage `name: sdd-thesisframe`).
- Incohérence de nommage résolue : l'exemplaire audité (`upload/SKILL(2).md` l.2) portait `name: sdd-Ma Thèse` ; l'exemplaire du propriétaire (`name: sdd-thesisframe`) fait foi ; fichier installé aligné.
- Voie rapide : ≤ 20 lignes, 1 fichier, aucun impact transverse — en cas de doute, cycle complet.
- Sous-agents : implémentation séquentielle stricte ; exploration parallèle admise avec citations chemin + lignes.
- `CONSTITUTION.md` créé (7 articles) — **en attente de validation du propriétaire** (point d'arrêt Étape 0).

**Points ouverts pour la session suivante** :

1. **Validation de `CONSTITUTION.md`** par le propriétaire — bloquant pour tout premier cycle spec → plan.
2. Première fonctionnalité à passer par le cycle complet (Étape 1 — spécifier). Aucune tâche en vol : `openresearch-integration-1` (arXiv + journal d'expérimentations) livrée et validée.

---

## Session du 2026-09-18 — Clôture du cycle n°1 (hal-search-encoding) + voie rapide (ai-types-provider-count)

**Slug(s) traité(s)** : `hal-search-encoding` (clôture, Étape 6) · `ai-types-provider-count` (voie rapide).

**État de convergence** :

- `hal-search-encoding` : **CONVERGÉ** (verdict du 2026-09-18 dans `specs/hal-search-encoding/tasks.md`) — Groupe A recetté par le propriétaire, T1 cochée après recette, test de non-régression 14/14 verts, `route.ts` intacte, cycle n°1 clos.
- `ai-types-provider-count` : clos (voie rapide, commit `e6eeb82`) — chiffre figé 18 → 20 aligné sur le catalogue ; suite complète **1428/1428 verts** (62 fichiers), aucun échec résiduel.

**Décisions prises** :

- Vérification préalable exigée par le propriétaire menée sur preuve avant tout correctif : `DYNAMIC_MODEL_PROVIDERS` (`src/lib/ai/ai-types.ts` l.201-206) = 20 entrées, 20 uniques, 0 inconnu du catalogue ; 26 providers catalogués, 0 orphelin. **Le 20 n'est pas un symptôme.**
- Hypothèse « routesme + apinex » **corrigée sur preuve** : `routesme` est légitime et pleinement câblé mais présent dès la création du catalogue ; `apinex` n'a jamais figuré dans `ai-types.ts` (`git log -S 'apinex'` vide) — c'est une gateway distincte hors catalogue (`src/lib/apinex/apinex-client.ts`, routes `/api/apinex/*`). Le test `ai-types.test.ts` est né périmé au commit externe `1359333` (2026-09-15, catalogue 20 + assertion 18 dans le même commit) — il n'a jamais été vert ; dernier commit le touchant (`6463078`, 2026-09-16) : mode fichier uniquement.
- Le test de non-régression HAL (`src/app/api/theses-en-ligne/search/route.test.ts`, 14 tests) fige durablement les trois mécanismes de l'annexe A.1 : fq répétés natifs, normalisation du tri `%2B`/`+` → espace, encodage final `%20`.
- Mode de `CONSTITUTION.md` : décision du propriétaire (« chore: restauration des permissions, chmod 644 ») exécutée en voie rapide — 100755 → 100644, blob inchangé `cf93007…` (commit `8334a86`, `specs/constitution-mode/`). Point ouvert soldé.

**Points ouverts pour la session suivante** :

1. Aucune tâche en vol, aucun cycle ouvert ; suite de tests intégralement verte ; permissions de `CONSTITUTION.md` restaurées (100644, commit `8334a86`).
2. Modes git : **normalisation exécutée le 2026-09-18** (commit `0348dcb`, 416 changements de mode purs, `.zscripts/*.sh` seuls en 755, build + 1428 tests + rendu navigateur vérifiés) — T1 `specs/git-mode-normalization/` **proposée à la recette**. Config locale `core.fileMode=false` posée (2 fichiers `upload/` sur fuse.ossfs : mode corrigé à l'index seul, bits FS 777 immuables).
3. **Nouveau chantier ouvert** : `veille-academique` (Étape 1 — `specs/veille-academique/spec.md` rédigée) — **4 questions `[À CLARIFIER]` adressées au propriétaire** (point d'arrêt Étape 2).
4. Note opérationnelle sandbox : un processus fils de session est moissonné entre deux commandes ; pour un service persistant, lancer via double-fork `setsid -f` (survie prouvée le 2026-09-18).
