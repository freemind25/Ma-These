# Procédure C1 — Build web de production (propriétaire) + gabarit de preuve

**À exécuter par le propriétaire sur le commit final destiné à la distribution** (les preuves du 18/09/2026 ne valent pas pour le commit final). L'environnement de développement du projet interdit le build de production — d'où l'exécution propriétaire (ou CI si cette option est retenue, C-20).

## 1. Préparation

1. Noter le commit destiné à la distribution (fourni par le développeur au moment voulu) : `git checkout <commit>` — vérifier `git status` propre.
2. Prérequis : Bun installé, dépendances à jour (`bun install`), pas de serveur de dev sur le port 3000.

## 2. Build

```bash
bun run build          # ou la commande documentée du projet si elle évolue
```
- ✅ Attendu : fin sans erreur (warnings lint tolérés s'ils sont au niveau baseline 247).
- Archiver la sortie complète (copier-coller dans le gabarit).

## 3. Démarrage du build de production

```bash
bun run start          # ou : bun ./build/server.js selon la procédure documentée
```
- ✅ Attendu : serveur démarré, HTTP 200 sur `/`.
- Vérifier les journaux au démarrage (backup au boot, worker) — aucune erreur bloquante.

## 4. Parcours critiques (dans le navigateur, sur le build de production)

| # | Parcours | Résultat attendu |
|---|---|---|
| 1 | Consultation/rédaction — ouvrir la thèse, éditer un chapitre, F5 | contenu persisté |
| 2 | Créer une nouvelle thèse (CTA dashboard → dialogue) puis Changer de thèse | 2 thèses, bascule propre, retour à la thèse réelle intacte |
| 3 | Références — créer puis supprimer avec confirmation (Annuler = rien) | CRUD isolé, confirmation active |
| 4 | Génération IA (Assistant IA, mode Rédaction de résumé) | clic direct sur Générer, stream 200, Résultat affiché |
| 5 | RAG — indexer puis question | réponse « d'après les extraits » avec citation |
| 6 | Recherche thèses en ligne | résultats réels (HAL), 200 |
| 7 | Export DOCX | téléchargement, fichier Word valide |
| 8 | Persistance générale | F5 sur chaque vue testée ; données intactes |

- Noter tout écart, erreur console, erreur serveur (journaux).

## 5. Gabarit de preuve à retourner (à archiver dans `audit/baseline/evidence/c1-build-web.json` + captures)

```json
{
  "commit_teste": "<hash>",
  "date": "<date>",
  "machine": "<os, ram>",
  "commandes": [{"cmd": "bun run build", "resultat": "OK/échec", "duree": "…"},
                {"cmd": "bun run start", "resultat": "200 sur /", "logs": "extrait"}],
  "parcours_critiques": [{"n": 1, "resultat": "OK/échec", "note": "…"}],
  "erreurs_serveur": "aucune / liste",
  "captures": ["c1-*.png"],
  "conclusion": "BUILD_WEB_PRODUCTION_VALIDE / PROBLEMES: …"
}
```

**Règles** : aucune donnée sensible dans les preuves ; les objets de test créés seront préfixés `AUDIT-C1-` et nettoyés ; le développeur fournit le hash du commit final et reste disponible pour corriger tout écart constaté avant revalidation.
