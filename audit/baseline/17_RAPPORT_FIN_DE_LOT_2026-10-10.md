# RAPPORT DE FIN DE LOT — Vague 2-bis du cycle `audit-final-v1.2`

**Date :** 2026-10-10 · **Destinataire :** propriétaire (point de contrôle demandé) · **Baseline de début :** `7e22841` · **HEAD :** `476862c` (pushé, arbre propre)
**Verdict en vigueur :** GO SOUS CONDITIONS — aucune mise en production, ouverture aux premiers utilisateurs ou diffusion externe. Le GO final reste décidé après examen des preuves et clôture/justification des 11 critères.
**Invariants vérifiés à chaque session :** fichiers rouges 0 diff · `db/custom.db` skip-worktree intacte · état propriétaire préservé (diff 30 tables vide, preuves `*-db-before/after.json`) · v1.0/v1.1 immuables · TNR 1 658/1 658 verts + lint 0 erreur au contrôle final (11:30).

---

## 1. Vues testées et restantes (priorité #1)

**Le périmètre A1 est CLÔTURÉ : 33/33 vues traitées** (8 au lot 1 en vague 1 + 26 en vague 2-bis, inventaire exhaustif `evidence/a1-inventory-restantes.json` — la réconciliation du compte « 25 » vs 26 nommées y est documentée, aucune vue exclue).

| Lot | Vues | Résultat | Preuve / commit |
|---|---|---|---|
| 1 (vague 1) | 4, 6, 7, 8, 9, 10, 11, 12 — Rédaction/Structure | 8/8 validées (dont 1 P2 AUD-FUNC-007) | `a1-lot1.json` / `bc71223` |
| 2a | 13 agile, 14 boîte doctorale, 15 équilibre, 25 onglet recherche, 37 expérimentations | 3 validées, 2 avec réserves documentées | `a1-lot2a.json` + 44 captures / `8161a70` |
| 2b | 26 méthodologie, 27 analyse du champ, 28 SLR, 35 outils IA | 4/4 validées (3 en état démo non persisté — consigné) | `a1-lot2b.json` + 26 captures / `bc0d2d7` |
| 3a | 29 vérif méthodologique, 31 citations, 32 hypothèses, 33 cohérence, 34 preuves | 5/5 validées (dont **IA vue 32 cassée** — A1L3A-03 P2) ; vue 31 : **registres réels** Crossref/OpenAlex/PubMed | `a1-lot3a.json` + 22 captures / `39e44a6` |
| 3b | 38 soutenance, 40 article→code, 41 diagrammes, 42 APA | 4/4 validées (vue 40 **inutilisable sans clé** — A1L3B-01 P2) ; vue 38 = **contre-exemple isolation correcte** (activeThesisId) | `a1-lot3b.json` + 28 captures / `6f00b97` |
| 4a | 19 bases de données, 20 journaux OA, 23 explorateur thèses, 39 routesme, 44 traducteur | 4 validées avec **services externes réels** (arXiv 482 résultats ; OpenAlex ; theses.fr 486 905 thèses) + **44 NON TESTABLE cause extérieure** (LibreTranslate publics morts — 503 propre) | `a1-lot4a.json` + 38 captures / `3fd0f2f` |
| 4b | 46 export PDF, 30 carto (Overpass), 36 APInex | 46 **export réel vérifié** (%PDF 4 pages/41,7 Mo hors arbre) ; 30 **Overpass réel via failover** (23 hôpitaux Alger) ; 36 **NON TESTABLE cause extérieure** (clé APInex nouvelle requise) | `a1-lot4b.json` + 25 captures / `476862c` |

**Bilan : 24 validées en UI réelle + 2 non testables pour cause extérieure (44, 36)** — distinction exigée appliquée : aucune vue validée par revue de code seule ; les revues sont consignées comme compléments sourcés. **Reste : 0 vue du périmètre A1** ; la consolidation 47/47 (statuts v1.0 réintégrés) est faite en vague 4 avec le TNR final.

## 2. État du risque multi-thèses (priorité #2) — AUDIT W2-2

- **Isolation structurelle : SAIN.** FK `thesisId` + `Cascade` prouvées en DB (thèse jetable créée puis supprimée via UI : 0 orphelin, diff vide).
- **Couche UI : DÉFAILLANTE sur 5 modules — écriture cross-thèse PROUVÉE (AUD-ISO-001, P1).** La vue Plan lit/écrit `theses[0]` (thèse la plus récemment modifiée) au lieu de la thèse active : test décisif — bascule « Par parties » → `PUT /api/thesis/{theses[0]}` 200 sur la MAUVAISE thèse (la jetable à ce moment ; le propriétaire aurait été touché si l'ordre updatedAt avait été inversé). Même famille : sélecteurs Cadrage/Boîte doctorale/Équilibre (AUD-ISO-002), auto-création DoctoralToolbox sur theses[0] (AUD-ISO-003 — **1 résidu template INITIAL_* documenté sur le propriétaire**, non supprimable via UI, 0 donnée utilisateur), AUD-FUNC-007 consolidée (AUD-ISO-004 — cause racine `GET /api/thesis` route.ts:16, correctif 1 ligne).
- **Correctifs prêts, NON exécutés (en attente de votre autorisation)** : ① Plan → `activeThesisId` (1 fichier, corrige AUD-ISO-001) ; ② select `partId/sortOrder` dans GET /api/thesis (1 ligne, corrige AUD-ISO-004/AUD-FUNC-007) ; ③ binding des 3 sélecteurs (même classe). Aucune migration de schéma — conformes à votre restriction.
- Preuve : `evidence/isolation-multitheses.json` + 23 captures `iso-*.png` + commit `6e79e6e`.

## 3. Anomalies découvertes (registre mis à jour — +31 fiches vague 2-bis)

| Gravité | Fiches | Résumé |
|---|---|---|
| **P1 (1)** | AUD-ISO-001 | Écriture cross-thèse prouvée (vue Plan) — **arbitrage requis** |
| **P2 (6)** | AUD-ISO-002/003/004 · A1L2A-01 (IA agile 400) · A1L3A-03 (IA hypothèses cassée) · A1L3B-01 (paper2code 500 vide, clés absentes) · A1L2B-02 (toasts invisibles ~10 modules, `use-toast` sans `<Toaster>` monté — correctif 1 ligne) | Correctifs identifiés, non exécutés sans autorisation |
| P3/P4 (24) | états locaux non persistés (checklist métho, analyse du champ, SLR démo, rythme), filtres inopérants (journaux OA domaine, explorateur statut), APA tronquée/BibTeX fragile, parseur osm pluriel, geo-enrich échec silencieux, gardes silencieuses, etc. | Aucune bloquante parcours critique |

Toutes fiches : impact, reproductibilité, contournement, responsable, décision — `09_FINDINGS_REGISTER.md` §Vague 2-bis.

## 4. Preuves et commits associés

9 commits poussés cette vague : `0a424ae` (inventaire) → `6e79e6e`+`2df1613` (isolation) → `8161a70` (lot 2a) → `bc0d2d7` (lot 2b) → `39e44a6` (lot 3a) → `6f00b97` (lot 3b) → `3fd0f2f` (lot 4a) → `476862c` (lot 4b). Chaque vue/action est traçable : JSON de preuve (7 nouveaux) + **~250 captures** `a1-lot*/iso-*` + comptages DB avant/après + audits réseau (récupéré 823 requêtes lot 2a). TNR : **1 658/1 658 verts, lint 0 erreur** (contrôle final 11:30, référence `e504b35`).

## 5. Proposition migration références — soumise à votre décision (priorité #3)

`specs/ref-thesis-scoping/proposition-technique.md` (amendée §6-bis) couvre vos 5 exigences : **attribution des références existantes** (§3.3 : cas univoque actuel = 4 réf → thèse unique avec journal ; multi-thèses = rapport d'ambiguïté + attribuées à la thèse active + non-attribuables conservées `null` avec filtre dédié) · **risques** (§5 : oubli consommateur, db:push SQLite, orphelins, régression UX — mesures associées) · **sauvegarde** (§3.1-3.2 : backup C-1 vérifié + export JSON réversible + répétition générale sur copie avant push réel) · **tests d'isolation** (§4 : 12-16 tests vitest ; §6-bis : nouveau test exigé — vue références liée à `activeThesisId`, jamais theses[0], vérifié avec 2 thèses) · **rollback** (§3.4 : restauration C-1 prouvée ou inverse surgical via export JSON, testé avant push). Effort 2-3 j ; fenêtre recommandée : après votre autorisation, avant les builds C1/C2. **Décisions attendues : GO / report formel (§7).** Aucune exécution sans votre autorisation distincte.

## 6. Statut du plan BFG (priorité #4)

- **Prêt, NON exécuté** : `13_PURGE_GIT_PLAN.md` + audit `evidence/a5-git-audit.json` (clé APINex localisée dans `.env` historique, porteurs `04dc5ab`/`763ee5d` ; 0 PAT ; sauvegarde dépôt vérifiée bundle 78 Mo + miroir 155 Mo ; `.env` désuit `6158f4e`).
- **Conformément à votre instruction : aucune réécriture d'historique, aucun force-push.** Exécution subordonnée à : votre confirmation de révocation APINex auprès du fournisseur + votre validation du plan + fenêtre de coordination.
- Aucun secret dans les preuves ; aucune clé réutilisée (la clé historiquement exposée reste interdite).

## 7. Prochaines validations requises (priorités #4/#5 + arbitrages)

**De votre côté (Lot C — hors environnement de dev, procédures livrées) :**
1. **C1** build web production sur le commit final candidat (procédure `14_PROCEDURE_BUILD_WEB.md`) — candidat actuel : `476862c` (ou post-correctifs si vous les autorisez).
2. **C2** build Windows + smoke CSP (procédure `15_PROCEDURE_BUILD_WINDOWS.md`) — résultats rapportés séparément du web.
3. **C3** coordination purge BFG après confirmation révocation APINex.
4. Fourniture d'une **clé APInex nouvelle** (vue 36) si vous souhaitez la tester en conditions réelles.

**Arbitrages attendus de votre part :**
| # | Décision | Objet |
|---|---|---|
| ① | Autorisation correctifs isolation (recommandé avant GO) | AUD-ISO-001 (P1) + 002/003/004 — 2 fichiers, sans migration de schéma |
| ② | Autorisation correctifs fonctionnels P2 | A1L2A-01 + A1L3A-03 (contrats IA), A1L3B-01 (robustesse clés), A1L2B-02 (toasts, 1 ligne) |
| ③ | GO / report formel migration références | §5 ci-dessus |
| ④ | Clé APInex nouvelle | vue 36 |
| ⑤ | Résidu DoctoralToolbox (template, 0 donnée) | DELETE ciblé hors audit ou conservé documenté |

Puis (vague 4, côté dev) : revalidation des correctifs autorisés · TNR globaux + **7 golden paths** en UI réelle · consolidation 47/47 · finalisation v1.2 avec **recommandation motivée GO final / maintien GO SOUS CONDITIONS**.

---

*Rapport fondé sur les preuves référencées ; le propriétaire reste libre de les examiner directement dans le dépôt (`audit/baseline/evidence/`, 300+ fichiers) et l'historique des commits.*
