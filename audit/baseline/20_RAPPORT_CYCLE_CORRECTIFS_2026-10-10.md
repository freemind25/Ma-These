# 20 — RAPPORT DE CYCLE « CORRECTIFS AUTORISÉS » — audit-final-v1.2

**Date** : 2026-10-10 · **Cycle** : audit-final-v1.2 · **Statut global maintenu** : **GO SOUS CONDITIONS** (aucune mise en production, aucune ouverture aux premiers utilisateurs, aucune diffusion externe)
**Commit des correctifs testé et poussé** : `6f853ac` (`6f853ac5ae2b332a5966f59b4b1d8e4ca8e216b5`)
**Commits de documentation/poussés après ce rapport** : voir §8 (hashes exacts).

---

## 1. Correctifs exécutés (périmètre strictement autorisé)

### 1.1 Isolation multi-thèses — AUD-ISO-001/002/003/004 (aucune migration de schéma)

| Correctif | Fichiers | Contenu |
|---|---|---|
| **AUD-ISO-001 (P1)** | `src/modules/thesis-plan/thesis-plan-page.tsx` | La vue Plan lit/écrit **uniquement la thèse active** (`useAppStore().activeThesisId`) — plus aucun `theses[0]` ; état vide explicite « Aucune thèse active » si le store est vide |
| **AUD-ISO-002** | `cadrage-page.tsx`, `boite-doctorale-page.tsx`, `equilibre-chapitres-page.tsx` | Sélecteurs : défaut = **thèse active du store**, **plus aucun repli silencieux `theses[0]`** ; réalignement automatique au changement de thèse active ; état vide avec sélecteur de secours |
| **AUD-ISO-003** | `boite-doctorale-page.tsx` | **Fin de l'auto-création à la simple visite** : le payload template initial est marqué « déjà sauvegardé » ; le POST n'a lieu qu'à la 1ʳᵉ modification réelle, toujours sur la thèse affichée ; plus de re-PUT silencieux à la visite d'une toolbox existante |
| **AUD-ISO-004 / AUD-FUNC-007** | `src/app/api/thesis/route.ts` (+ test unitaire) | `GET /api/thesis` : `partId` + `sortOrder` ajoutés au `select` des chapitres → badges « N chap. » par partie, chips de détachement et tri fonctionnels après reload |

Hors périmètre (non touchés, conformément à l'autorisation) : AUD-ISO-005 (onglet recherche), AUD-ISO-006 (signal UI données globales), AUD-ISO-007 (stats dashboard) — restent P3 documentés.

### 1.2 Correctifs fonctionnels P2

| Correctif | Fichiers | Contenu |
|---|---|---|
| **A1L2A-01 — IA vue Agile** | `feuille-route-agile-page.tsx` | Contrat aligné sur `/api/ai-writing` : `{mode:"freeform", prompt}` (avant : `sprint_planning`/`input` inexistantes → 400 zod) + lecture correcte de la réponse `data.data.content` |
| **A1L3A-03/04 — IA vue Hypothèses** | `generation-hypotheses-page.tsx` | `{prompt, mode:"hypothesis"}` (mode valide de WRITING_MODES/SPECIALIZATION_PROMPTS) + **garde anti-transfert** : un output d'erreur (❌) ne peut plus être copié dans le pré-enregistrement |
| **A1L3B-01 — article→code sans clés** | `src/app/api/paper2code/generate/route.ts` | `getApiKey` protégé : **503 JSON explicite** (« Aucune clé API pour <fournisseur>… ») au lieu d'un 500 à corps vide ; **cause externe (configuration) distinguée du défaut applicatif** dans le message affiché |
| **A1L2B-02 — notifications/toasts** | `src/app/layout.tsx` | **Toaster shadcn monté** (racine, aux côtés de sonner) → les toasts `use-toast` d'environ 10 modules deviennent visibles |

**Aucune dépendance externe indisponible n'a été traitée comme défaut applicatif** : traduction LibreTranslate (mortes) et APInex (clé requise) restent classées « non testable cause extérieure » ; paper2code sans clé retourne désormais 503 *configuration* — ce comportement est volontaire et documenté.

---

## 2. Validation UI réelle — isolation à 2 thèses (preuves avant/après)

**Preuve machine** : `audit/baseline/evidence/isolation-fix.json` + 25 captures `isofix-*.png` + `isolation-fix-db-before/after.json` (30 tables). **Commit lié aux preuves : `6f853ac`.**
**Méthode** : thèse jetable B « AUDIT-FIX — Thèse isolation 2 thèses » (id `cmv2k9ph80000netcid6vm74l`) créée via le dialogue du dashboard ; thèse propriétaire « Urbanisme durable » (`cmsmyrdfs0000pa2sews4vo90`) **jamais écrite** ; configuration décisive obtenue en fin de session : `activeThesisId = propriétaire` **alors que `theses[0] = B`** (exactement celle qui exposait la P1).

### 2.1 Résultats par opération (seule la thèse active est lue/modifiée)

| Opération | Résultat | Preuve |
|---|---|---|
| Plan **sans** thèse active | « Aucune thèse active », 0 écriture (avant : theses[0] silencieux) | isofix-01 |
| Plan, active = B | Affiche B ; PUT structureMode + POST parts/chapters **sur l'id de B uniquement** | isofix-06, réseau |
| Plan, active = propriétaire, theses[0] = B (**test décisif**) | Affiche « Urbanisme durable », **0 occurrence de B dans le DOM**, 0 écriture | **isofix-13** |
| Cadrage, active = B | Bouton B sélectionné (bg-primary) ; cadrage créé → `ThesisCadrage.thesisId = B` + 12 champs | isofix-09, DB |
| Cadrage, active = propriétaire | « Aucun cadrage » (celui de B invisible), bouton propriétaire sélectionné | isofix-14 |
| Boîte doctorale, visite seule (2 contextes) | **0 POST/PUT** en 4,5–5 s (avant : auto-création sur theses[0]) ; résidu propriétaire affiché sans réécriture | isofix-03/15, DB |
| Boîte doctorale, 1ʳᵉ modification réelle | POST 201 **sur B uniquement** → nouvelle ligne `thesisId=B` ; résidu propriétaire intact (timestamps inchangés) | isofix-10, DB |
| Équilibre, active = B / propriétaire | Chapitres de la thèse active affichés ; vue lecture seule | isofix-11 |
| Chapitre rattaché à une partie (AUD-FUNC-007) | Après reload complet : badge « 1 chap. » + « 1 chapitre rattaché à des parties » + chip « Chapitre VIII » cliquable (avant : « 0 chap. » permanent, détachement inatteignable) | **isofix-08**, DB `partId` vérifié |

### 2.2 Avant/après état propriétaire

- **Diff DB avant/après session : VIDE sur 30 tables** (cleanup via flux UI confirmés : DELETE thèse B 200 → cascade vérifiée : partie, chapitre VIII, cadrage + 12 champs, toolbox B, sprint jetable supprimés).
- Résidu DoctoralToolbox propriétaire `cmv26kryu001oq7vhdotgwrc1` : **intact** (createdAt = updatedAt = 09:17:21.942).
- updatedAt thèse propriétaire inchangé (2026-08-10T08:22:35.464Z) ; 4 références globales intactes ; témoins (NotebookEntry, LegalRef, Job, ImportedDoc) inchangés.

---

## 3. Commits testés et poussés + TNR

| Élément | Résultat |
|---|---|
| Commit correctifs | `6f853ac` — 10 fichiers, +218/−39 (liste exacte dans le message de commit) |
| **Vitest** | **1 658/1 658 verts** (78 fichiers, ~17,5 s) — `route.test.ts` mis à jour pour refléter le contrat corrigé (partId+sortOrder) |
| **Lint** | **0 erreur / 247 warnings = baseline exacte** (25 warnings adventices éliminés : les scripts d'outillage d'audit `audit/baseline/tools/**` créés ce cycle sont exclus du périmètre ESLint — 1 ligne dans `eslint.config.mjs`, aucun code app modifié) |
| TNR UI | GP-2 (création thèse + auto-activation) rejouée ; suppression de thèse par dialogue confirmé conforme (2ᵉ application C-2) ; vue Soutenance (garde activeThesisId) et Export PDF (sélecteur explicite) non affectées par les changements |

---

## 4. État des anomalies P1/P2 et risques résiduels

| Fiche | État | Justification du risque résiduel |
|---|---|---|
| **AUD-ISO-001 (P1)** | **CORRIGÉE + VALIDÉE** (isofix-13 décisif) | — |
| AUD-ISO-002 | **CORRIGÉE + VALIDÉE** | — |
| AUD-ISO-003 | **CORRIGÉE + VALIDÉE** (code) | Le **résidu INITIAL_* reste en base** — cf. §6 ; suppression proposée, décision propriétaire |
| AUD-ISO-004 (AUD-FUNC-007) | **CORRIGÉE + VALIDÉE** | — |
| A1L2A-01 (IA Agile) | **CORRIGÉE + VALIDÉE** | La suggestion IA en mode `freeform` peut retourner un format non structuré (JSON libre) — cosmétique, fonctionnalité opérationnelle |
| A1L3A-03/04 (IA Hypothèses) | **CORRIGÉES + VALIDÉES** | — |
| A1L3B-01 (article→code) | **CORRIGÉE + VALIDÉE** (robustesse) | L'usage réel avec clé reste subordonné à la fourniture de clés par le propriétaire (raccordement zai = arbitrage restant) |
| A1L2B-02 (toasts) | **CORRIGÉE + VALIDÉE** | Validation exhaustive vue par vue non requise (mécanisme central unique) |
| AUD-ISO-005/006/007 + P3/P4 (~20 fiches) | **OUVERTES P3/P4** | Aucune bloquante ; cycle P3 à planifier ; détaillées au registre 09 |

**P1/P2 ouvertes à ce jour : 0.**

---

## 5. Migration références — répétition générale (T3) : EXÉCUTÉE, EN ATTENTE DE VOTRE VALIDATION

**Livrables** : `audit/baseline/18_REPETITION_GENERALE_MIGRATION_REFS.md` + `evidence/rehearsal-refs.json` + `evidence/rehearsal-refs-export-before.json` (export réversible) + scripts réutilisables `audit/baseline/tools/rehearsal-refs/`.

**Résultats clés** (base réelle **invulnérée**, SHA-256 identique avant/milieu/fin de session) :
- Push du schéma amendé (`Reference.thesisId String?` + Cascade + index) sur **copie** : 19 ms, données intactes.
- Migration sur copie : **4/4 références attribuées au propriétaire (cas univoque)**, 0 ambiguë, journal d'attribution, **idempotence prouvée** ; branche « ambigu → NULL + listée » exercée en scénario multi-thèses.
- **Isolation 2 thèses : 16/16 PASS** (0 fuite croisée, globales visibles des deux, cascade DELETE correcte, UPDATE cross-contexte = 0 ligne).
- **Rollback doublement démontré** : rollback chirurgical via journal (identité stricte avec l'export) ET restauration byte-identique (SHA copie = SHA original).
- Verdict de faisabilité : **GO conditionnel FAVORABLE** — durée estimée 30-45 min hors re-pass UI, plan d'exécution final en 10 étapes avec critères d'arrêt.

**Aucune migration sur la base réelle ne sera lancée avant votre validation explicite** du doc 18 (conformément à votre directive §3 : « Je validerai alors explicitement le passage sur la base réelle »).

---

## 6. BFG (T4) et résidu DoctoralToolbox (T5)

### 6.1 Plan BFG — PRÊT, NON EXÉCUTÉ
`audit/baseline/13_PURGE_GIT_PLAN.md` §7 « version exécutable prête — v1.2 » : périmètre confirmé (`.env` uniquement, commits `04dc5ab`/`763ee5d`, 10 commits de périmètre, refs main + tags v1.10.7/v1.10.8, 253 commits), procédure 7 étapes à commandes exactes, contrôles post-purge bloquants (scan no-old-secret, clone frais, TNR, C1/C2), critères de réussite/arrêt/rollback. **Aucune réécriture d'historique ni force-push exécuté.** En attente de vos 3 conditions : (i) confirmation de révocation de l'ancienne clé, (ii) validation du plan, (iii) fenêtre de coordination. Toute clé nouvelle : canal sécurisé, jamais dans preuves/logs/Git.

### 6.2 Résidu DoctoralToolbox — DOCUMENTÉ, NON SUPPRIMÉ
`audit/baseline/19_RESIDU_DOCTORALTOOLBOX.md` + export réversible `evidence/residu-doctoral-toolbox-export.json` + scripts prêts non exécutés (`tools/delete-doctoral-toolbox.ts`, `restore-doctoral-toolbox.ts`, dry-run par défaut, garde anti-données-utilisateur) :
- **1 seule ligne** (`cmv26kryu001oq7vhdotgwrc1`), liée à la thèse propriétaire, créée 2026-10-10T09:17:21.942, **jamais modifiée depuis**.
- Comparaison programmatique 6/6 champs : **template INITIAL_* PUR** (5 phases / 38 items non cochés, 12 jalons, 16 documents « absent », 4 contacts vides, notes vides) → **aucune donnée utilisateur concernée**.
- Suppression possible sans risque mais **non exécutée** — procédure ciblée + rollback fournis, décision propriétaire (arbitrage ⑤).

---

## 7. Clarifications de traçabilité demandées (§6 de votre message)

### 7.1 Différence entre `HEAD = 476862c` et `HEAD = 4e17b39`
Ce sont **deux commits consécutifs de fin de vague 2-bis**, le second étant le parent du premier — aucun écart de contenu de code (aucun des deux ne modifie `src/`) :
- `476862c` (*test*) : commit du **lot 4b** — preuves UI des 3 dernières vues (46 Export PDF, 30 Carto, 36 APInex), e/a1-lot4b.json + 25 captures, clôture du registre A1.
- `4e17b39` (*docs*, HEAD au moment de votre message) : **clôture documentaire** de la vague 2-bis — registre +31 fiches, v1.2 §1-bis, tasks W2-1..W2-7, et le rapport de fin de lot `17_RAPPORT_FIN_DE_LOT_2026-10-10.md` qui vous a été transmis.
En résumé : `476862c` = preuves du dernier lot ; `4e17b39` = consolidation documentaire au-dessus. Les deux pointent le même état applicatif.

### 7.2 Décompte des vues : « 33 annoncées » vs « 8 + 26 »
**Vous avez raison : la somme des entrées de lots est 34, pas 33** — le « 33/33 » consigné était une **erreur d'addition** dans les rapports (8 lot 1 + 5 lot 2a + 4 lot 2b + 5 lot 3a + 4 lot 3b + 5 lot 4a + 3 lot 4b = **34**), déjà repérée partiellement lors de la réconciliation « 25 → 26 » de W2-1. Le compte est corrigé dans le registre 09 : **34/34 vues de lots traitées**. Historique de la confusion : le compte « reste 25 » du lot 1 provenait d'une énumération interne approximative ; l'inventaire exhaustif W2-1 (`evidence/a1-inventory-restantes.json`) a établi **26 vues restantes nommées** (toutes traitées ensuite) ; l'addition finale a ensuite été mal reportée (33 au lieu de 34) sans qu'aucune vue ne soit ajoutée ni retirée.

### 7.3 Inventaire canonique des 47 vues (statuts consolidés v1.0 + v1.2)

| Statut | Nb | Vues |
|---|---|---|
| **Validées UI réelle** | **39** | v1.0 (7) : 1 Tableau de bord, 2 Éditeur (GP-1), 3 Assistant IA (GP-4), 5 RAG (GP-5), 17 Articles IMRaD, 18 Brouillon d'article, 22 Thèses en ligne (GP-6) — A1 v1.2 (32) : 4 Brouillon chapitre, 6 Harper, 7 Grammaire, 8 Phrasier, 9 Déblocage, 10 Auto-édition 8C, 11 Cadrage, 12 Plan, 13 Agile, 14 Boîte doctorale, 15 Équilibre, 25 Onglet recherche, 26 Méthodologie, 27 Analyse du champ, 28 Outils SLR, 29 Vérif. méthodologique, 30 Vérif. cartographique, 31 Vérif. citations, 32 Hypothèses, 33 Vérif. cohérence, 34 Alignement preuves, 35 Outils IA, 37 Expérimentations, 38 Soutenance, 39 RoutesMe, 40 Article→code, 41 Diagrammes, 42 APA, 19 Bases de données, 20 Journaux OA, 23 Explorateur thèses, 46 Export PDF |
| **Non testables — cause externe** | **2** | 44 Traducteur (3 instances LibreTranslate publiques mortes/à clé — échec déterministe documenté), 36 APInex (clé `APINEX_API_KEY` nouvelle requise ; le 402 de v1.0 est devenu 500 config_error pré-upstream, traité en 503 propre) |
| **Réservées ⚠️ (v1.0, non re-testées v1.2)** | **6** | 16 Références (réserve v1.0 « suppression sans confirmation » **levée** par C-3 + GP-3 + A2 lot 1 ; migration par thèse = §5), 21 Recherche plein texte, 24 Veille académique (API éprouvée lot 4a), 43 Livres-compétences, 45 Bibliothèque, 47 Export DOCX (réserve « promesses formatage » ; GP-7 TNR v1.1 ✓) |

Réconciliation : 39 + 2 + 6 = **47** ✓. Les 6 réservées sont des réserves documentées (non des échecs) ; leur re-pass rapide peut être ajouté au cycle final si vous le souhaitez.

---

## 8. Registre des commits du cycle (tous poussés sur origin/main, sans force-push)

| Commit | Contenu |
|---|---|
| `6f853ac` | Correctifs isolation (AUD-ISO-001..004) + P2 (A1L2A-01, A1L3A-03/04, A1L3B-01, A1L2B-02) + test unitaire AUD-FUNC-007 |
| *commit preuves/docs* | isofix.json + 25 captures + db before/after + registre 09 corrigé + docs 13/18/19 + rapport 20 + worklog |

*(hash exact du commit de documentation renseigné au moment du push — voir le message de push)*

---

## 9. Ce qu'il reste pour le GO final (rappel des critères)

1. **Votre validation explicite** de la migration références sur la base réelle (§5 — répétition générale terminée, plan d'exécution final au doc 18).
2. **C1/C2** : builds web + Windows sur le commit candidat final (procédures 14/15 déjà livrées — à exécuter côté propriétaire).
3. **Rejeu des 7 golden paths + TNR** sur ce commit candidat (GP-1..GP-7, procédure déjà outillée).
4. **BFG** : révocation confirmée + validation du plan §7 + fenêtre de coordination (aucune exécution avant).
5. Décision résidu DoctoralToolbox (procédure prête, §6.2).
6. Clôture ou justification formelle des 6 vues réservées ⚠️ (optionnel : re-pass rapide) et des P3/P4 (aucune bloquante).

**Invariants maintenus sur tout le cycle** : fichiers rouges 0 diff, aucune migration de schéma, db skip-worktree intacte, état propriétaire préservé (diff DB VIDE), aucun secret dans les preuves, commits conventionnels poussés sans force-push.
