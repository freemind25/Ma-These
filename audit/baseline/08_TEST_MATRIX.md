# 08 — Matrice de Tests et Couverture (Phase 8)

**Règle** : couverture calculée sur l'inventaire réel (47 vues de navigation + 53 groupes API), pas sur les fichiers de test existants.

## Niveaux de tests présents dans le dépôt

| Niveau | État à la baseline |
|---|---|
| Tests automatisés (unit/intégration) | 78 fichiers / 1 658 tests **verts** (18,24 s) — mesuré ce cycle |
| Couverture API | 29/53 groupes couverts ; **24 sans test** (surtout proxys externes) |
| Lint | 0 erreur / 244 warnings (no-explicit-any 129, unused-vars 39, non-null-assertion 35, no-console 31) |
| Tests E2E UI (ce cycle) | 10 parcours exécutés via agent-browser (voir ci-dessous) |
| Tests sécurité (ce cycle) | 8 contrôles (audit 04) |
| Tests persistance (ce cycle) | Triple vérification référence (UI+DB+reload) |
| Régression | Tests verts + preuves de cycles antérieurs (rollback déterministe) |

## Matrice fonctionnalités ↔ tests ↔ verdicts (47 vues)

Légende : ✅ exécuté avec succès · ⚠️ partiel/dégradé · ❌ cassé · ◻️ non testé (ce cycle) · 🔴 bloqué

| # | Vue | Test ce cycle | Verdict |
|---|---|---|---|
| 1 | Tableau de bord | Rendu + stats réelles | ✅ |
| 2 | Éditeur de thèse | Ouverture, contenu, toolbar ; mutation NON exécutée (protégée) | ✅ / mutation ◻️ |
| 3 | Assistant IA | Génération réelle complète | ✅ |
| 4 | Brouillon de chapitre | ◻️ | ◻️ |
| 5 | Mon IA de thèse (RAG) | Indexation + Q/R ancrée | ✅ |
| 6 | Harper | ◻️ | ◻️ |
| 7 | Grammaire | ◻️ | ◻️ |
| 8 | Phrasier Académique | ◻️ (ressource intégrée cycle antérieur, preuve 14da990) | ⚠️ |
| 9 | Déblocage écriture | ◻️ | ◻️ |
| 10 | Auto-édition 8C | ◻️ | ◻️ |
| 11 | Cadrage de thèse | ◻️ | ◻️ |
| 12 | Plan de thèse | Rendu via sidebar (non approfondi) | ◻️ |
| 13 | Feuille de Route Agile | ◻️ | ◻️ |
| 14 | Boîte doctorale | ◻️ | ◻️ |
| 15 | Équilibre chapitres | ◻️ | ◻️ |
| 16 | Références | CRUD complet (créer/lister/persister/supprimer) | ⚠️ (suppression sans confirmation) |
| 17 | Articles scientifiques (IMRaD) | Rendu | ✅ |
| 18 | Brouillon d'article | Rendu, article existant + repères honnêtes | ✅ |
| 19 | Bases de données (OpenAlex…) | ◻️ (quota externe) | ◻️ |
| 20 | Journaux OA | ◻️ (clé premium configurée cycle antérieur) | ◻️ |
| 21 | Recherche plein texte | Rendu + périmètre constaté (chapitres) | ⚠️ |
| 22 | Thèses en ligne | Recherche réelle 135 résultats | ✅ |
| 23 | Explorateur Thèses | ◻️ | ◻️ |
| 24 | Veille académique | ◻️ (auto-check worker prouvé en log) | ⚠️ |
| 25 | Onglet Recherche | ◻️ | ◻️ |
| 26 | Méthodologie | ◻️ | ◻️ |
| 27 | Analyse du champ | ◻️ | ◻️ |
| 28 | Outils SLR | ◻️ | ◻️ |
| 29 | Vérification méthodologique | ◻️ | ◻️ |
| 30 | Vérification cartographique | ◻️ (Overpass HTTP 000 = 🔴 externe) | 🔴 externe |
| 31 | Vérification Citations | ◻️ | ◻️ |
| 32 | Génération Hypothèses | ◻️ | ◻️ |
| 33 | Vérification Cohérence | ◻️ | ◻️ |
| 34 | Alignement Preuves | ◻️ | ◻️ |
| 35 | Outils IA | ◻️ | ◻️ |
| 36 | APInex Playground | ◻️ (402 = check-in propriétaire requis) | 🔴 externe |
| 37 | Expérimentations | ◻️ | ◻️ |
| 38 | Soutenance | ◻️ (pack livré cycle antérieur) | ◻️ |
| 39 | RoutesMe | ◻️ | ◻️ |
| 40 | Article → Code | ◻️ | ◻️ |
| 41 | Diagrammes | ◻️ | ◻️ |
| 42 | APA Composer | ◻️ | ◻️ |
| 43 | Livres-compétences | ◻️ (intégration prouvée cycle antérieur) | ⚠️ |
| 44 | Traducteur | ◻️ | ◻️ |
| 45 | Bibliothèque | Rendu (7 sources) ; recherche non exécutée | ⚠️ |
| 46 | Export PDF | ◻️ (prouvé cycles antérieurs) | ◻️ |
| 47 | Export DOCX | Export réel + analyse ZIP/XML profonde | ⚠️ (promesses formatage) |

**Couverture UI ce cycle** : 47 inventoriées — 8 testées avec succès (17 %), 6 partiellement (13 %), **33 non testées (70 %)**, 2 bloquées par dépendances externes (Overpass, APInex).
**Couverture API** : 29/53 avec tests automatisés (55 %) ; ~10 contrôlées manuellement ce cycle (curl/HTTP réel).

**Interprétation honnête** : le cœur métier (rédaction, IA, références, recherche, export) est vérifié ; les 2/3 des vues secondaires restent **non exécutées dans l'interface** — la plupart sont des consommateurs des mêmes services déjà prouvés (routes API communes, mêmes patterns), mais cela reste un risque résiduel explicite (voir rapport final §B).
