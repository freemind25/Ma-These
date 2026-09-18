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
