# Tasks — build-desktop-pipeline

- [x] T1 — Créer `.github/workflows/build-desktop.yml` conforme au plan §1-§2 · preuve : fichier versionné + YAML parsé sans erreur
- [x] T2 — Vérifier les 3 contrats croisés (conf→script→next.config) et les consigner dans preuves.md · preuve : extraits cités
- [x] T3 — Valider le garde-fou drift dans la CI : comportement prouvé (0/2), step `if` explicite · preuve : sortie locale des 2 mesures
- [x] T4 — Verdict : le workflow est prêt ; le run vert reste réserve nommée (preuve manquante : URL d'un run ; acteur : propriétaire après push du dépôt)

  Suivi 2026-09-18 (délégation via clé fournie) : clé rejetée par GitHub (HTTP 401 Bad credentials ×3, 2 schémas ; format `ghp_` correct) — prérequis inchangé : une clé valide, scopes `repo` + `workflow`. Script de push prêt hors dépôt ; mesures dans preuves.md § Suivi.

Dépendances : T1 → T2/T3/T4.

## Verdict

**CONVERGÉ (prête pour la CI)** — workflow versionné + YAML valide + 7 contrats croisés prouvés + garde-fou drift prouvé dans les deux sens (0/2). Réserve unique : le run vert (invérifiable en sandbox, acteur propriétaire après push). Recommandation : signature Authenticode hors périmètre.
