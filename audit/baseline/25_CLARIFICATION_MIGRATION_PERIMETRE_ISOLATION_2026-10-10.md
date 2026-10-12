# 25 — CLARIFICATION MIGRATION RÉELLE : périmètre exact, conséquences applicatives, risques inter-thèses et cycle de complétion de l'isolation

**Cycle :** audit-final-v1.2 · **Date :** 2026-10-10 · **Statut : DOCUMENT DE CLARIFICATION — aucune exécution.**
**Objet :** répondre au point 1 de la 3ᵉ décision du propriétaire (2026-10-10) : « Je suspends mon GO jusqu'à clarification écrite du périmètre réel de cette migration » — conséquences précises de la situation des **8 consommateurs applicatifs**, risques de **lecture ou modification inter-thèses**, et **cycle nécessaire** pour terminer l'isolation applicative.
**Enregistrements de choix du propriétaire (retranscrits, non exécutés) :** option **B** privilégiée pour l'isolation 7-bis (zéro écriture de test sur la base réelle) — ce choix ne vaut pas autorisation de migration ; **aucune modification de `db/custom.db` ni de `prisma/schema.prisma`** avant GO écrit spécifique.
**Fondements :** `specs/ref-thesis-scoping/proposition-technique.md` (§0 état vérifié, §2 règles API, §4 tests, §6 effort) · doc 21 §5.2 (précision d'honnêteté, condition 3 du GO) · répétition générale `18_REPETITION_GENERALE_MIGRATION_REFS.md` (16/16 isolation sur copie, double rollback).

---

## §1 — Ce que la migration fait et ne fait pas (périmètre réel)

### 1.1 Ce qu'elle fait (5 opérations, doc 21 §1)

1. **Schéma** (étapes 4-5) : ajout de `Reference.thesisId String?` + relation `Thesis` avec `onDelete: Cascade` + `@@index([thesisId])` — puis `db push` (~1 s démontré sur copie).
2. **Attribution des données** (étape 6) : les **4 références existantes** reçoivent `thesisId = cmsmyrdfs0000pa2sews4vo90` (« Urbanisme durable »), journal d'attribution horodaté, 0 attribution heuristique.
3. **Contrôles de cohérence** (étape 7) : comptages 4==4, 0 dangling, integrity ok, 0 violation FK, diff vs export réversible = `thesisId` seul.
4. **Isolation au niveau DONNÉES** (étape 7-bis — **option B retenue**) : preuve par (i) la répétition 16/16 sur copie byte-identique (`evidence/rehearsal-refs.json`) et (ii) la suite vitest du cycle applicatif (§4). **Aucune thèse jetable, aucune écriture de test sur la base réelle.**
5. **TNR + re-pass UI** (étape 8) : 1 658 verts + parcours inchangés — preuve que **le comportement applicatif est strictement identique avant/après**.

### 1.2 Ce qu'elle ne fait pas

- **Aucun changement de comportement des 8 consommateurs applicatifs** (API + vues). Après la migration, chaque consommateur s'exécute exactement comme aujourd'hui : il ne mentionne pas `thesisId`, ne le filtre pas, ne le transmet pas. C'est la « précision d'honnêteté » du doc 21 §5.2 — la migration livre le **socle de données** (colonne, index, cascade, attribution tracée), **pas** l'isolation fonctionnelle.
- **Aucune règle d'API nouvelle** : pas de 400 « thesisId obligatoire », pas de garde 404 inter-thèses — ces règles (proposition §2) relèvent du cycle applicatif §4, qui exige une autorisation de code distincte (red line « aucune modification de code » en vigueur).
- **Aucune UI nouvelle** : ni filtre « par thèse », ni marqueur de visibilité — les vues continuent d'afficher la bibliothèque telle qu'elle est.

### 1.3 État d'arrivée concret (fin de la fenêtre de migration)

| Objet | Avant | Après migration |
|---|---|---|
| 4 références du propriétaire | `thesisId NULL` (globales) | `thesisId = "cmsmyrdfs…"` (attribuées, journalisé) |
| Nouvelles références créées après migration | `thesisId NULL` | **toujours `thesisId NULL`** (les consommateurs ne transmettent pas de thèse) |
| Suppression d'une thèse | les références globales survivent (aucun lien) | les références **de la thèse supprimée** sont emportées (Cascade) — les globales survivent |
| Comportement UI/API (8 consommateurs) | bibliothèque globale partagée | **identique** (bibliothèque globale partagée) |
| Performance | index `type`, `year` | + index `thesisId` (inutile tant que non utilisé par les requêtes) |

**En une phrase : la migration rattache les 4 références existantes à la thèse au niveau des données et prépare le terrain, sans changer ce que voit ou fait l'application.**

---

## §2 — Les 8 consommateurs et leur comportement exact après migration (inchangé)

Liste fermée audité (proposition §0, fait mesuré cycle C-2 v1.1 : `GET /api/references` filtre `type/search/source/favorites` uniquement — aucun filtre thèse) :

| # | Consommateur | Rôle | Comportement après migration (inchangé) |
|---|---|---|---|
| 1 | Vue **références** (`references-page`) | liste / création / suppression / favoris | affiche **toutes** les références de toutes les thèses ; toute création naît `thesisId NULL` |
| 2 | Vue **arXiv/veille → sauvegarde bibliothèque** | enregistrement de résultats en références | crée des références **globales** (`thesisId NULL`) |
| 3 | Vue **brouillon de chapitre** (insertion de citations) | sélection d'une ref pour citation | propose **toutes** les références, toutes thèses confondues |
| 4 | Vue **export PDF** | bibliographie du document | construite sur **toutes** les références |
| 5 | API `POST /api/references/import` | import BibTeX/RIS/CSL-JSON | crée sans `thesisId` (→ NULL) |
| 6 | API `GET /api/references/bibtex` | export BibTeX | exporte **toutes** les références |
| 7 | API `PUT/DELETE /api/references/[id]` | modification/suppression par id | aucune garde de contexte thèse (opère sur n'importe quelle ref) |
| 8 | **Export DOCX** (bibliographie interne, GP-7) | bibliographie du document Word | construite sur **toutes** les références |

---

## §3 — Conséquences précises et risques inter-thèses (état intermédiaire, jusqu'au cycle §4)

**Risque préalable important : dans l'état actuel — 1 seule thèse (« Urbanisme durable ») — AUCUN des risques R1-R4 ci-dessous ne peut se matérialiser.** Ils naissent au moment où une 2ᵉ thèse existe. La migration elle-même ne les crée pas (le comportement est inchangé) ; elle les laisse simplement en l'état tant que le cycle applicatif n'est pas exécuté.

| # | Risque | Mécanisme exact (factuel) | Plausibilité | Impact réel | Gravité pondérée |
|---|---|---|---|---|---|
| R1 | **Lecture inter-thèses** | toute vue/API liste toutes les refs (pas de filtre `thesisId`) : la bibliographie d'une thèse B peut inclure les refs de la thèse A | **Certain** dès qu'une 2ᵉ thèse existe | mélange de bibliographies, confusion de travail ; aucune fuite externe (app locale mono-utilisateur, loopback uniquement) | Confort / qualité de données — **pas sécurité** |
| R2 | **Modification/suppression inter-thèses par id** | `PUT/DELETE /api/references/[id]` sans garde de contexte : depuis n'importe quel contexte, il est possible de modifier ou supprimer une ref attribuée à une autre thèse | Possible (nécessite une action volontaire sur une ref « étrangère ») | perte effective d'une ref d'une autre thèse (suppression confirmée par dialogue, mais le dialogue n'indique pas la thèse propriétaire) ; récupérable par restauration DB (procédure A3 prouvée) | **Modéré** — le principal risque opérationnel du état intermédiaire |
| R3 | **Créations globales récurrentes** | toute nouvelle ref (UI, import, arXiv) naît `thesisId NULL` : la population « non attribuée » se remet à croître, recréant partiellement l'état « global » que la migration corrige | **Certain** dès la 1ʳᵉ création en multi-thèses | incohérence de données croissante ; ces refs ne sont pas emportées par la cascade et restent visibles partout | Faible-moyen — dégrade progressivement le bénéfice de la migration |
| R4 | **Cascade asymétrique devenue active** | après la migration, supprimer une thèse (flux UI, dialogue confirmé) emporte **ses** références (Cascade) — une ref de A est donc supprimable en cascade en supprimant A, même si l'utilisateur travaille « dans » B | Conditionnel (suppression de thèse, action rare et confirmée) | perte des refs de la thèse supprimée — comportement voulu (aligné chapitres/documents) mais **nouveau** à connaître | Faible (action confirmée + rare) — **changement de sémantique à connaître, pas un défaut** |
| R5 | **Confusion d'attribution à l'avenir** | si la migration est exécutée alors que plusieurs thèses existent, le script n'attribue RIEN automatiquement : toutes les refs restent NULL et sont listées dans le rapport d'ambiguïté (règle impérative du propriétaire, doc 21 §1) | — | aucune perte, mais résolution manuelle nécessaire (filtre « non attribuées » prévu au cycle) | Faible (état actuel : 1 thèse → cas univoque 4/0/0 attendu) |

**Ce qui n'est PAS un risque nouveau :** aucune exposition réseau (loopback only), aucune perte des 4 refs existantes (contrôles étape 7 + rollback prouvé §4 doc 21), aucun changement des 7 golden paths (étape 8 : TNR + re-pass UI inchangés), aucune écriture de test sur la base réelle (option B).

**Bilan honnête :** la migration seule **ne réduit aucun des risques R1-R4** (le socle de données ne filtre pas les requêtes) et **ne les aggrave pas** (comportement applicatif inchangé) — à la seule exception de R4, changement de sémantique voulu (cascade) qui devient actif. La valeur de la migration est : attribution tracée des 4 refs, index, cascade cohérente, réversibilité prouvée, et **prérequis indispensable** du cycle applicatif (une API ne peut pas filtrer sur une colonne inexistante).

---

## §4 — Cycle nécessaire pour terminer l'isolation applicative

Cycle `ref-thesis-scoping` (proposition §2/§4/§6) — **exige une autorisation de code distincte** (red line à lever pour ce périmètre) et une fenêtre :

| Phase | Contenu | Effort |
|---|---|---|
| **P1 — API** (0,5-1 j) | Règles proposition §2 : **création** (`POST /api/references`, `/import`, `/bibtex`) : `thesisId` **obligatoire** (zod) + contrôle d'existence (FK) → 400 si absent/inconnu · **lecture** (`GET`) : filtre `thesisId` obligatoire → 400 si absent, la réponse ne contient jamais les refs d'une autre thèse · **modification/suppression** (`PUT/DELETE /api/references/[id]`) : garde de contexte, mismatch → **404** (pas de fuite d'existence) · schémas zod sur tout le groupe `references` (contribue aussi à réduire AUD-SEC-004, lot 1) · **binding `activeThesisId`** côté serveur de contexte, jamais `theses[0]` (leçon AUD-ISO-001) | 0,5-1 j |
| **P2 — UI** (0,5-1 j) | Les 4 vues consommatrices (références, arXiv→bibliothèque, brouillon-chapitre, export PDF) transmettent `activeThesisId` (store) ; listes/imports/exports scopés ; l'export DOCX (bibliographie interne) scopé par thèse | 0,5-1 j |
| **P3 — Tests d'isolation** (0,5 j) | **12-16 tests vitest** (proposition §4) : réf créée dans A invisible via `GET ?thesisId=B` et visible via A · `PUT/DELETE` réf A avec contexte B → 404 (réf intacte) · `POST` sans `thesisId` → 400 · import/bibtex/DOCX scopés · recherche et favoris filtrés · suite totale : 1 658 → ~1 670+ verts. **C'est la preuve d'isolation de l'option B** (zéro écriture de test sur la base réelle) | 0,5 j |
| **P4 — Revalidation** (0,5 j) | Re-pass UI réelle sur les 4 vues + GP-3/GP-7 **à 2 thèses présentes** (protocole `isolation-multitheses.json`) · preuves consignées · registre 09 + v1.2 mis à jour · nouveau tag candidat si le propriétaire l'exige | 0,5 j |
| **Total** | | **2-3 j** (cohérent avec l'estimation v1.0, roadmap 10 action C-17) |

**Critères de fin du cycle** : 0 route du groupe `references` sans schéma zod · 12-16 tests d'isolation verts · TNR global vert · re-pass UI 2 thèses sans croisement (lecture comme écriture) · 0 création hors contexte possible · preuves consignées.

**Positionnement — deux fenêtres possibles (au choix du propriétaire, même effort total) :**
- **Fenêtre unique** : migration (doc 21, étapes 0-8) PUIS cycle applicatif P1-P4 dans la même session → l'état intermédiaire §2/§3 n'est jamais « exposé » à l'usage ; une seule revalidation finale.
- **Deux fenêtres** : migration seule (état intermédiaire documenté ci-dessus, sans risque tant qu'une seule thèse existe), puis cycle applicatif séparément → plus de points de contrôle, mais deux revalidations.
- Dans les deux cas, la **red line actuelle** impose le GO écrit du propriétaire sur chaque étape avant exécution.

---

## §5 — Checklist de décision mise à jour (remplace §6 du doc 21 sur ce point)

- [ ] **GO écrit spécifique** sur la migration réelle (doc 21 §1-§5) — clarifié par le présent document (périmètre, conséquences, risques, cycle)
- [ ] **Option B enregistrée** pour l'isolation 7-bis (déjà retenue par le propriétaire — zéro écriture de test sur la base réelle ; preuves : répétition 16/16 sur copie + suite vitest P3)
- [ ] **Autorisation distincte du cycle applicatif P1-P4** (levée de la red line code pour le périmètre `references` uniquement) + choix de la fenêtre (unique ou deux)
- [ ] Fenêtre d'exécution coordonnée (serveur port 3000 arrêté pendant les étapes 0-7 de la migration)
- [ ] Après exécution : réception journal d'attribution + rapport d'ambiguïté + preuves SHA + verdict PASS + captures UI (inchangé, doc 21 §6)

**En l'absence de GO : rien n'est exécuté** — base réelle en l'état (SHA consigné dans `resv-db-final-state.json`), aucun amendement de `prisma/schema.prisma` commité.

---

*Livrable de la vague 5 (cycle audit-final-v1.2). Aucune modification de code, aucune écriture base, aucune migration — document de clarification uniquement. Sources : proposition-technique.md §0/§2/§4/§6-bis · doc 21 §5.2 · evidence/rehearsal-refs.json (16/16, ambiguïtés 4/0/0 en run 2) · evidence/isolation-multitheses.json (protocole 2 thèses) · registre 09 AUD-ISO-001 (leçon binding).*
