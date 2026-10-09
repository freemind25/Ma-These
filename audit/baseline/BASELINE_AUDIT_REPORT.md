# BASELINE_AUDIT_REPORT — ThesisFrame (Ma Thèse)

**Audit de référence v1.0 — avant mise en production**
Norme : PROMPT MAÎTRE — AUDIT GLOBAL DE RÉFÉRENCE (processus propriétaire en 3 temps ; présent rapport = étape 1, **constat sans correction**)
Version audité : **ThesisFrame v1.10.8** · commit **`2156a8f`** (main) · **2026-10-09**
Environnement : sandbox Next.js dev (`bun run dev`, port 3000), tests via interface réelle (agent-browser/Chromium), curl, SQLite lecture-seule, agents d'audit statiques.

---

## A. Résumé exécutif

**Objectif** : établir l'état des lieux fidèle, prouvé et reproductible de ThesisFrame avant ouverture aux premiers utilisateurs, avec verdict défendable sur preuves.

**Méthode** : parcours exécutés dans l'application RÉELLE (18 captures authentiques `evidence/ui-*.png`), vérifications de persistance en base, tests HTTP non destructifs, mesure des performances, deux audits statiques indépendants (architecture/code, sécurité) avec commandes exécutées et sorties collées. Aucune fonctionnalité n'est déclarée conforme sur la seule lecture de son code. Aucune correction appliquée.

**Principaux constats** :
1. Le **cœur métier fonctionne réellement de bout en bout** : rédaction (thèse 7 chapitres/2 295 mots persistée), génération IA (27 modes, stream 200, sceau de provenance des savoirs affiché), RAG ancré avec citations de source, recherche de thèses en ligne (135 résultats), imports documentaires avec OCR (preuves du cycle 2026-10-08), export DOCX (fichier Word valide, contenu intégral, accents corrects).
2. **1 parcours cassé confirmé** : la **création d'une nouvelle thèse** (et l'accès à la liste des thèses) est **impossible via l'UI** dès qu'une thèse active existe — et ce cas est le cas normal (l'ID de thèse active est persisté). Le CTA « Créer une thèse » du tableau de bord ré-ouvre l'ancienne thèse (AUD-FUNC-002).
3. **1 risque de données majeur** : **aucune sauvegarde outillée** de la base (thèse + corpus 248 Mo, unique copie locale) ; le seul incident de perte de l'historique (rollback 2026-10-08) a été évité de justesse par des copies manuelles (AUD-GOV-001).
4. **Suppression sans confirmation** sur les références : constatée *de facto* pendant l'audit — un clic a détruit l'objet de test instantanément et irréversiblement (AUD-FUNC-003).
5. Sécurité : **0 vulnérabilité critique/élevée** en contexte mono-utilisateur ; 2 moyennes (sur-permissions Tauri avant distribution ; clé APINex réelle dans l'historique git poussé sur GitHub — rotée depuis, purgable).
6. Qualité : 1 658 tests verts, lint 0 erreur, worker/OCR prouvés résilients ; dette modérée et non bloquante (244 warnings lint, 40 routes sans schéma, pas de pagination).

**Risques majeurs** : perte de données (pas de backup) ; fonctionnalité multi-thèses inaccessible ; suppression destructrice accidentelle ; distribution d'un binaire Tauri sur-permissionné si packaging sans correctif.

**Verdict global** : **GO SOUS CONDITIONS** — détaillé en §K.

**Corrections indispensables avant ouverture** (plan §J / roadmap §10) :
- **C-1** Procédure de sauvegarde/restauration de la DB (P1)
- **C-2** Réparer le parcours « créer/changer de thèse » (P1)
- **C-3** Confirmation avant toute suppression (P1)
- **C-4** Durcissement Tauri (capabilities minimales + CSP) **avant tout packaging/distribution** (P1)

## B. Périmètre et limites

**Audité** : les 47 vues (inventaire exhaustif en 08_TEST_MATRIX), dont 14 exécutées dans l'UI (8 pleinement, 6 partiellement) couvrant le cœur métier ; 53 groupes d'API (29 couverts par les 1 658 tests automatisés ; ~10 contrôlées manuellement ce cycle) ; DB (30 modèles) ; worker de jobs ; sécurité applicative ; gouvernance ; UX ; performance mesurée.

**Non audité / non vérifié (nommé)** :
- **33 vues sur 47 non exécutées** dans l'interface ce cycle (vues méthodologie/outils secondaires ; la plupart consomment les mêmes services déjà prouvés — risque résiduel explicite, action C-19).
- **Build Tauri Windows + pipeline CI** : impossible dans l'environnement (pas de cargo/Windows/.github) — réserve récurrente R-CI ; validation finale = propriétaire.
- **Build de production web** : interdit dans cet environnement ; dernière preuve = audit 2026-09-18 (vert).
- Imports de références (BibTeX/RIS), export PDF, annulation de génération IA, 2 onglets simultanés : non exécutés.
- Accessibilité (WCAG) : non mesurée — niveau réel inconnu.
- Overpass et APInex : dépendances externes indisponibles (HTTP 000 / 402 check-in).

**Limites de l'évaluation** : app mono-utilisateur → contrôles auth/sessions/isolation = N/A par conception (documentés comme tels, pas « non vérifiés ») ; les tests destructifs sur la base de production ont été exclus — les mutations réelles ont porté sur des objets de test `AUDIT-` supprimés après preuve.

## C. Tableau de synthèse

| Domaine | Items inventoriés | Contrôles exécutés | Non exécutés | ✅ Conformes | ⚠️ Dégradés | ❌ Cassés | Anomalies confirmées | À investiguer | Corrections restantes |
|---|---|---|---|---|---|---|---|---|---|
| Fonctionnel (Phase 1) | 23 contrôles | 20 | 3 | 12 | 7 | 1 | 5 | 1 | C-2, C-3, C-8, C-11, C-12, C-13 |
| Métier thèse (Phase 2) | 26 contrôles | 19 | 7 | 13 | 9 | 1* | 2 | 1 | C-5, C-7 |
| Architecture & code (Phase 3) | 18 | 18 | 0 | 11 | 7 | 0 | 7 | 0 | C-17, C-18, C-20 |
| Sécurité (Phase 4) | 14 | 12 | 2 (build Tauri) | 8 | 5 | 0 | 5 | 1 | C-4, C-9, C-17 |
| Fiabilité & perf (Phase 5) | 13 | 11 | 2 | 8 | 3 | 1* (gov) | 2 | 1 | C-1, C-10 |
| Gouvernance (Phase 6) | 18 | 18 | 0 | 11 | 6 | 1 (sauvegarde) | 2 | 0 | C-1, C-9, C-14…C-16 |
| UX (Phase 7) | 12 | 10 | 2 | 6 | 5 | 0 | 3 | 0 | C-6, C-7, C-8 |

*les ❌ se recoupent (multi-thèses ; sauvegarde classée DÉGRADÉ fortegravité alignée ❌ logique de domaine).*

**Totaux** : 17 fiches d'anomalies — **1 ❌ CASSÉ · 15 ⚠️ DÉGRADÉ · 0 autre ❌** · 0 vulnérabilité Critique/Élevée confirmée · **4 corrections P1** (C-1…C-4), 8 P2, 8 P3.

## D. Registre détaillé des contrôles

Voir les documents de phase (chaque item y figure avec critère, méthode, résultat, verdict, preuve) :
01_FUNCTIONAL_AUDIT.md · 02_THESIS_WORKFLOW_AUDIT.md · 03_ARCHITECTURE_AND_CODE_AUDIT.md · 04_SECURITY_AUDIT.md · 05_RELIABILITY_PERFORMANCE_AUDIT.md · 06_GOVERNANCE_AUDIT.md · 07_USER_EXPERIENCE_AUDIT.md · 08_TEST_MATRIX.md.

## E. Cartographie de l'architecture (réelle)

Voir `03_ARCHITECTURE_AND_CODE_AUDIT.md §1` et `diagrams/architecture-reelle.md`. Synthèse :
Navigateur/Tauri (SPA 47 vues, Zustand persist partiel) → 98 routes API (zod 58 + schemas partagés 23 + manuel 40*) → Prisma/SQLite (30 modèles, corpus 248 Mo en blobs) → worker in-process (jobs OCR/veille, claim atomique, sweep 60 s) → services externes (LLM ×26 fournisseurs, OpenAlex/CrossRef/HAL, HAL thèses, livres).

**Points de fragilité** : process Node unique (tout-in-un) ; DB = point de défaillance unique **sans backup** ; CORS/CSP absents (acceptables en local, à durcir avant distribution) ; frontière de confiance locale ; pas de file de jobs externe (assumé, adapté au mono-utilisateur).

## F. Analyse de sécurité

Détail complet : 04_SECURITY_AUDIT.md.
- **Réussis (preuves)** : 0 clé en dur (hardcoded-keys = 100 % env) ; uploads avec magic bytes + 50 Mo + zéro écriture FS ; injection SQL inefficace (Prisma paramétré, testé `' OR 1=1--` → 200/0) ; XSS : 1 seul dangerouslySetInnerHTML (CSS statique dev) ; SSRF : aucune route ne fetch une URL utilisateur ; RAG délimité contre l'injection de prompt (vérifié en UI) ; erreurs API sans fuite de stack.
- **Confirmées** : AUD-SEC-001 sur-permissions Tauri (`shell:allow-execute/open` inutilisés par le front + CSP null — gravité Moyenne, P1 avant distribution) ; AUD-SEC-002/003 clé APINex réelle dans l'historique git de `.env` (poussée sur GitHub ; rotée ; purge BFG recommandée).
- **Limites de couverture** : build Tauri non testable ici ; fuzzing non réalisé (hors périmètre) ; 40 routes sans schéma déclaré = surface à durcir progressivement.

## G. Analyse de robustesse et performance

Mesures réelles (05) : GET / 164 ms · références 33 ms · stats 68 ms · jobs 711 ms · stream IA 2,2 s · thèses en ligne 1,51 s · export DOCX 691 ms (16,5 Ko/38 ¶) · **RSS next-server 2 560 Mo** sur machine 4 Go (marge réelle mais gérée : fix OOM + 9 jobs OCR consécutifs à 2,66 Go sans incident). Reprise après crash prouvée (rollback déterministe 2026-10-08 : corpus 12/12 reconstruit, OCR identique à l'octet). Fragilité : Overpass sans timeout (HTTP 000) ; sauvegarde absente.

## H. Analyse des parcours utilisateurs

| Parcours | Étapes exécutées | Résultat | Blocages |
|---|---|---|---|
| Consulter/rédiger sa thèse | dashboard → éditeur → onglets chapitres → contenu → (mutation protégée) | ✅ fluide | — |
| Créer une NOUVELLE thèse | dashboard → « Créer une thèse » | ❌ | **ré-ouvre l'ancienne thèse, aucun dialogue** (AUD-FUNC-002) |
| Références CRUD | créer (8 champs, accents) → lister → F5 → supprimer | ⚠️ | suppression sans confirmation (AUD-FUNC-003) ; 1 double POST suspect |
| Génération IA | choisir mode → prompt → générer → résultat + sceau provenance | ✅ | — |
| RAG thèse | indexer (12 chunks) → question → réponse citée | ✅ | — |
| Recherche thèses en ligne | saisir → 135 résultats avec métadonnées | ✅ | — |
| Export DOCX | sélection thèse → options → générer → fichier Word valide | ⚠️ | TOC/styles/numérotation annoncés absents (AUD-EXPORT-001) |

## I. Registre des anomalies

**17 fiches** dans `09_FINDINGS_REGISTER.md` (IDs AUD-FUNC-001…006, AUD-HYD-001, AUD-EXPORT-001, AUD-REL-001, AUD-GOV-001, AUD-SEC-001…008, AUD-DOC-001/002, AUD-DATA-001, AUD-UX-001/002), chacune avec reproduction, preuve, cause racine, correction recommandée, critères d'acceptation et TNR. Aucune fiche ne mélange des anomalies indépendantes.

## J. Plan de correction

`10_REMEDIATION_ROADMAP.md` : **P0 aucun** ; **P1 = C-1 (sauvegarde DB), C-2 (multi-thèses), C-3 (confirmation suppression), C-4 (Tauri capabilities+CSP)** ; P2 = 8 items (C-5…C-12) ; P3 = 8 items (C-13…C-20). Efforts : P1 ≈ 2-2,5 j ; P2 ≈ 3,5-4,5 j ; P3 ≈ 1-2 j + CI. Ordre imposé : données → pertes → parcours essentiels → intégrations → persistance → robustesse → ergonomie → dette. **Exécution subordonnée à votre validation (étape 2)**.

## K. Verdict de préparation à la production

### **GO SOUS CONDITIONS**

Justification : aucun bloquant P0 ; le cœur métier est prouvé fonctionnel dans l'interface réelle ; la qualité d'ingénierie (tests, worker, traçabilité) est au niveau ; les défauts restants sont localisés, reproduits et corrigeables rapidement.

**Conditions (à satisfaire avant ouverture aux premiers utilisateurs)** :
1. **C-1 Sauvegarde DB automatisée + restore démontré** (la perte de la thèse/corpus est aujourd'hui un incident à un clic de `db:push` près).
2. **C-2 Parcours « créer/changer de thèse » réparé** (fonctionnalité principale annoncée, actuellement cassée).
3. **C-3 Confirmation avant suppression** (références, puis audit des autres points destructifs).
4. **C-4 Capabilities Tauri minimales + CSP** (si distribution d'un installeur).

**Risques résiduels acceptés à ce stade (à confirmer par le propriétaire)** : 33 vues non exécutées en UI ; build Windows non prouvable ici ; dépendances externes variables ; dette P3. *L'acceptation formelle de ces risques relève du propriétaire du produit, conformément au référentiel d'audit.*

**Interdiction de verdict GO pleine** : les contrôles essentiels listés en §B (33 vues, build desktop) restent non exécutés — un GO complet exige le pass C-19 + preuve de build.

## L. Critères de sortie (clôture de l'audit)

1. Les 4 conditions P1 (C-1…C-4) corrigées, **revalidées dans l'interface réelle** avec preuves (Phase 11 remplie).
2. TNR : suite 1 658 tests verte + re-parcours des 6 golden paths de ce cycle.
3. Registre mis à jour (statuts « corrigée, revalidée »).
4. Pass UI des 33 vues restantes (C-19) exécuté ou accepté explicitement comme risque.
5. Preuve de build web vert du HEAD corrigé ; (si distribution) build Windows validé par le propriétaire.
6. Update de ce rapport en **v1.1** (revalidation) — la v1.0 reste la référence immuable.

## M. Référence pour les audits futurs

- **Commit de référence** : `2156a8f` (main) — ThesisFrame 1.10.8 — 2026-10-09
- **Inventaire** : 47 vues / 53 groupes API / 30 modèles DB (08_TEST_MATRIX.md)
- **Métriques de référence** (à comparer aux prochaines audits) : perf §G ; RSS 2 560 Mo ; 1 658 tests verts ; lint 0 err/244 warn ; 29/53 API testées
- **Anomalies ouvertes** : 17 fiches (09) ; **risques acceptés** : §K ; **limitations connues** : §B
- **Reproductibilité** : commandes de test documentées dans chaque livrable ; captures evidence/ui-01…ui-18 ; DB de test = objets préfixés `AUDIT-` (supprimés)
- Version du rapport : **Baseline Audit v1.0** (document immuable, à ne pas modifier après validation — les corrections produiront la v1.1)

---
*Preuves : aucune preuve inventée ; chaque verdict est adossé à une capture, une sortie de commande, une requête HTTP journalisée ou une vérification DB datée du 2026-10-09. Les secrets éventuels sont masqués (aucune valeur de clé copiée dans ce dossier).*
