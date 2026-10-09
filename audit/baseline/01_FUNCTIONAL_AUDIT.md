# 01 — Audit Fonctionnel Exhaustif (Phase 1)

**Méthode** : parcours exécutés dans l'interface RÉELLE via agent-browser (Chromium headless), preuves = captures `evidence/ui-*.png` + journal dev.log + vérification DB directe. Aucune fonctionnalité déclarée conforme sur la seule lecture du code.

## 1.1 Chargement et navigation

| Contrôle | Résultat observé | Preuve | Verdict |
|---|---|---|---|
| Chargement initial `/` | 200, rendu complet, stats réelles (7 chapitres, 4 réf., 2 295 mots) | ui-01-dashboard.png ; dev.log `GET / 200 in 164ms` | ✅ CONFORME |
| Navigation sidebar (47 items, 7 catégories) | Toutes les vues testées se rendent (éditeur, références, IA, thèses en ligne, bibliothèque, plein texte, brouillon article, export DOCX, RAG) | ui-02…ui-17 | ✅ CONFORME (échantillon 10/47 vues, voir matrice) |
| Recherche de module dans la sidebar | Champ présent, filtrage implémenté (code l.107-116) | code | ⚠️ filtrage non exécuté en UI → NON VÉRIFIÉ (détail) |
| Erreurs console au parcours | 0 erreur fatale ; 1 warning logo (ratio) ; 1 warning tiptap « duplicate extensions link/underline » ; **1 erreur hydratation `<div>` dans `<p>`** (badge « 2 Issues ») | console agent-browser ; AUD-HYD-001 | ⚠️ DÉGRADÉ |
| Retour arrière / état | Reload → retour forcé au tableau de bord (currentView non persisté) MAIS activeThesisId persisté (Zustand persist l.486) → incohérent | AUD-FUNC-004 | ⚠️ DÉGRADÉ |

## 1.2 Parcours « Thèses » (création/édition)

| Contrôle | Résultat observé | Preuve | Verdict |
|---|---|---|---|
| Liste des thèses | Rendue avec carte thèse réelle (Urbanisme durable, 7 ch., 2 295 mots) | ui-02 | ✅ |
| **Créer une nouvelle thèse (thèse active existante)** | CTA dashboard « Créer une thèse » → `setCurrentView("editor")` → l'éditeur ré-ouvre la thèse active persistée. **Aucun chemin UI** vers le dialogue de création ; `setActiveThesisId(null)` n'existe que dans le succès de suppression | ui-05 ; dashboard-page.tsx:192 ; use-thesis.ts:167 ; thesis-list-panel.tsx:66 (unique point de sélection) | ❌ **CASSÉ** (AUD-FUNC-002) |
| Édition (éditeur tiptap) | Onglets chapitres, barre d'outils complète, contenu réel affiché, autosave + bouton Sauvegarder présents | ui-03/ui-04 | ✅ (sauvegarde effective prouvée indirectement : 2 295 mots en DB, mots recomptés) |
| Bouton Sauvegarder | Présent ; test de modification volontairement NON exécuté (données propriétaire) | — | ⚠️ NON VÉRIFIÉ sur mutation réelle (contenu protégé) |

## 1.3 Parcours « Références » (CRUD complet exécuté)

| Contrôle | Résultat observé | Preuve | Verdict |
|---|---|---|---|
| Liste + filtres | Table 4 refs, recherche, filtres type/source rendus | ui-06 | ✅ |
| Création (formulaire 8 champs, accents/apostrophes) | Dialogue OK, soumission → réf. visible immédiatement | ui-07 ; dev.log `POST /api/references 201` | ✅ |
| Persistance triple | DB (id `cmv14wssa…`, accents intacts) + survit au reload UI | json preuve + test reload | ✅ |
| **Suppression** | **Un clic poubelle = suppression immédiate, AUCUNE confirmation, irréversible** (constaté en live : la réf. test a disparu au premier clic) | references-page.tsx:350 (`deleteRef.mutate` direct) ; DB re-vérifiée vide ; `DELETE … 200` | ⚠️ DÉGRADÉ (AUD-FUNC-003) |
| Double soumission | dev.log : `POST 400` immédiatement suivi de `POST 201` pour un seul clic « Ajouter » | dev.log | ⚠️ à investiguer (AUD-FUNC-005) |

## 1.4 Parcours « Recherche externe »

| Contrôle | Résultat observé | Preuve | Verdict |
|---|---|---|---|
| Thèses en ligne (route ligne rouge) | Recherche « urbanisme durable » → **135 thèses trouvées (page 1/9)**, résultat réel avec métadonnées complètes (auteur, résumé, disciplines) | ui-15 ; `GET /api/theses-en-ligne/search … 200 in 1510ms` | ✅ CONFORME |
| Bibliothèque (7 sources livres) | Vue rendue, recherche non exécutée (sources externes variables) | ui-16 | ⚠️ NON VÉRIFIÉ (dépendance externe) |
| Recherche plein texte | Vue rendue ; **indexe uniquement les chapitres de thèse** (7 docs, 2 295 mots), étiqueté « MeiliSearch (simulation) » honnêtement | ui-plein-texte | ⚠️ DÉGRADÉ (périmètre : le corpus OCR de 16 documents n'y est pas interrogeable) |

## 1.5 Formulaires et validations (§6.3)

- Champs obligatoires marqués `*` (références) ; validation serveur prouvée (400 « Paramètres manquants » sur export-docx sans args ; 400 ai-writing).
- Accents/apostrophes : acceptés et persistés sans corruption (référence test : « l'urbanisme à l'épreuve des accents » ✓ en DB).
- Caractères spéciaux dans la recherche externes : `?q=` URL-encodé correctement (urbanisme+durable).
- Limites de longueur : NON VÉRIFIÉ (non testé — priorité P3).

## 1.6 Tests négatifs exécutés (§6.5)

| Scénario | Résultat | Verdict |
|---|---|---|
| API export-docx avec body `{}` | 400 JSON propre « Paramètres manquants : thesisId et options sont requis. » (pas de stack) | ✅ |
| API references avec `' OR 1=1--` | 200, count 0 — Prisma paramétré (payload traité en littéral) | ✅ |
| Action destructive non désirée (clic poubelle) | Suppression immédiate sans confirmation → constatée involontairement en live (AUD-FUNC-003) | ❌→⚠️ |
| API ai-writing 400 (validation mode) puis bascule stream 200 | Comportement observé, bénin si voulu ; à documenter | ⚠️ observation |

**Synthèse Phase 1** : 12 contrôles ✅ · 7 ⚠️ (dont 2 DÉGRADÉS significatifs AUD-FUNC-003/004 et 1 hydratation) · **1 ❌ CASSÉ (AUD-FUNC-002 création de thèse)** · 3 NON VÉRIFIÉS (nommés).
