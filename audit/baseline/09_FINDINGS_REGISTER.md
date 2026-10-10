# 09 — Registre des Anomalies (Phase 9)

Statuts de preuve : **confirmée** (reproduite/preuves suffisantes) · probable · à investiguer · non vérifiée. Gravités pondérées par le contexte réel : application **locale mono-utilisateur** (desktop Tauri + web preview), données = thèse personnelle.

---

## AUD-FUNC-001 — Texte « \n » littéral affiché dans la liste des thèses
- **Domaine** : Fonctionnel / UI · **Fonctionnalité** : Éditeur de thèse (liste)
- **Verdict** : ⚠️ DÉGRADÉ · **Preuve** : confirmée
- **Gravité** : Faible · **Priorité** : P3
- **Étapes** : Tableau de bord → Éditeur de thèse → sous la carte de thèse, le texte « \n » s'affiche.
- **Attendu** : rien · **Observé** : « \n » rendu comme texte.
- **Cause racine (confirmée)** : `src/modules/editor/editor-page.tsx:204` — `<ThesisListPanel />\n` (backslash-n littéral dans le JSX, vérifié par `cat -A`).
- **Preuves** : evidence/ui-02-editor.png ; commande sed/cat.
- **Correction** : supprimer le `\n` littéral (1 ligne). **Critères** : plus de « \n » visible. **TNR** : rendu liste inchangé.

## AUD-FUNC-002 — Parcours « créer une nouvelle thèse » impossible une fois une thèse active
- **Statut v1.1 (2026-10-09)** : ✅ **CORRIGÉE, REVALIDÉE** (commit `6436ed7`) — CTA → `CreateThesisDialog` (mode contrôlé) + bouton « Changer de thèse » dans l'éditeur ; vérifié en UI réelle (création 2ᵉ thèse 201, changement, isolation chapitres, cleanup en cascade sans orphelin) ; preuves `evidence/c2-*.png` + `c2-revalidation.json`. **Fait produit soumis au propriétaire** : `Reference` est globale par conception (sans `thesisId`) — l'isolation références/thèse relève d'un arbitrage produit, non d'un bug.
- **Domaine** : Fonctionnel · **Fonctionnalité** : gestion multi-thèses / CTA « Créer une thèse »
- **Verdict** : ❌ CASSÉ · **Preuve** : confirmée
- **Gravité** : Élevée (fonction annoncée inopérante) · **Priorité** : **P1**
- **Préconditions** : une thèse active existe (cas normal : activeThesisId persisté en localStorage).
- **Étapes** : (1) ouvrir l'app avec la thèse existante ; (2) Tableau de bord → cliquer « Créer une thèse » ; (3) observer.
- **Attendu** : dialogue de création de thèse. **Observé** : navigation vers l'éditeur qui ré-ouvre l'ANCIENNE thèse ; aucun dialogue ; aucun moyen UI de revenir à la liste (le retour n'existe que dans le sens liste→dashboard).
- **Cause racine (confirmée)** : dashboard-page.tsx:192 `onClick={() => setCurrentView("editor")}` sans désélection ; `setActiveThesisId(null)` n'existe que dans `useDeleteThesis` (use-thesis.ts:167) ; `CreateThesisDialog` uniquement rendu par `ThesisListPanel` (thesis-list-panel.tsx:38), lui-même seulement rendu si `!activeThesisId`.
- **Impact** : la capacité multi-thèses annoncée est inaccessible ; contournement = supprimer la thèse active (inacceptable) ou vider le localStorage.
- **Preuves** : ui-05-create-dialog.png ; greps cités.
- **Correction** : le CTA ouvre `CreateThesisDialog` (ou désélectionne puis liste) ; ajouter un bouton « Changer de thèse » dans l'éditeur. **Critères** : créer une 2e thèse via l'UI puis revenir à la liste. **TNR** : réouverture de la thèse active inchangée.

## AUD-FUNC-003 — Suppression de référence sans confirmation ni annulation
- **Statut v1.1 (2026-10-09)** : ✅ **CORRIGÉE, REVALIDÉE** (commit `f1b5ec5`) — composant partagé `ConfirmDeleteDialog` appliqué à 16 actions destructives (références, thèses, chapitres, sources, notes, expérimentations, analyses, plan, onglets, articles, ImportedDoc, registre juridique, stories/sprints) ; vérifié en UI réelle : **Annuler = 0 requête + 0 modification DB, Confirmer = DELETE 200** ; inventaire complet dans `evidence/c3-revalidation.json` (2 déjà conformes, ~20 actions d'état local non persistant documentées sans traitement).
- **Domaine** : Fonctionnel/UX · **Fonctionnalité** : Références
- **Verdict** : ⚠️ DÉGRADÉ · **Preuve** : confirmée (reproduite involontairement pendant l'audit)
- **Gravité** : Moyenne (perte de données unitaire, irréversible) · **Priorité** : **P1**
- **Étapes** : Références → cliquer l'icône poubelle d'une ligne.
- **Observé** : suppression immédiate (DELETE 200), aucun dialogue de confirmation, pas d'undo ; objet disparu de la DB.
- **Cause racine (confirmée)** : references-page.tsx:350 `onClick={() => deleteRef.mutate(ref.id)}` direct.
- **Impact** : un clic malheureux détruit une référence bibliographique définitivement.
- **Correction** : AlertDialog de confirmation (shadcn) avant mutation, ou undo toast 5 s. **Critères** : suppression exige une confirmation explicite. **TNR** : suppression confirmée fonctionne toujours (200).

## AUD-FUNC-004 — Persistance d'état incohérente (vue vs thèse active)
- **Domaine** : Fonctionnel/UX · **Fonctionnalité** : navigation
- **Verdict** : ⚠️ DÉGRADÉ · **Preuve** : confirmée
- **Gravité** : Faible · **Priorité** : P2
- **Étapes** : ouvrir l'éditeur sur une thèse → F5.
- **Observé** : retour forcé au tableau de bord (currentView non persisté) MAIS « Éditeur de thèse » ré-ouvre directement la thèse (activeThesisId persisté, app-store.ts:486).
- **Impact** : perte de contexte utilisateur ; comportement non documenté, combiné à AUD-FUNC-002 pour masquer la liste.
- **Correction** : persister aussi currentView, ou cohérent : ne rien persister. **Critères** : après F5, l'utilisateur retrouve sa vue.

## AUD-FUNC-005 — Double soumission suspectée sur création de référence
- **Domaine** : Fiabilité · **Fonctionnalité** : Références (création)
- **Verdict** : ⚠️ DÉGRADÉ — NON VÉRIFIÉ (une occurrence journalisée) · **Preuve** : probable
- **Gravité** : Faible-Moyenne · **Priorité** : P2
- **Observé** : dev.log montre `POST /api/references 400` immédiatement suivi de `POST … 201` pour un seul clic « Ajouter ».
- **Hypothèses** (à investiguer) : validation rate au 1er envoi (ex. type non sérialisé) puis retry ; ou double event handler.
- **Correction** : reproduire avec Network panel ; garder un seul POST par soumission ; désactiver le bouton pendant isPending.
- **Critères** : un clic = exactement une requête 201.

## AUD-HYD-001 — Erreur d'hydratation : `<div>` imbriqué dans `<p>`
- **Domaine** : Qualité/Accesibilité · **Fonctionnalité** : layout sidebar/header
- **Verdict** : ⚠️ DÉGRADÉ · **Preuve** : confirmée (console + badge « 2 Issues » Next.js)
- **Gravité** : Faible-Moyenne (rendu affecté en SSR/hydratation, a11y) · **Priorité** : P2
- **Preuve** : console agent-browser : « In HTML, `<div>` cannot be a descendant of `<p>`. This will cause a hydration error. » stack → AppSidebar/SidebarProvider.
- **Cause racine** : à localiser (composant rendant un div dans un p, probablement dans une zone sidebar/header).
- **Correction** : corriger la sémantique. **Critères** : 0 erreur hydratation au chargement ; badge Issues vide.

## AUD-EXPORT-001 — DOCX : promesses UI non tenues (TOC, styles APA, numérotation)
- **Domaine** : Métier/Export · **Fonctionnalité** : Export DOCX
- **Verdict** : ⚠️ DÉGRADÉ · **Preuve** : confirmée (analyse XML du fichier réellement produit)
- **Gravité** : Moyenne · **Priorité** : P2
- **Observé** : fichier Word valide avec contenu intégral et accents corrects, MAIS 0 champ TOC, 0 style de paragraphe (pStyle vide, aucun Heading), 0 numérotation (numPr), 0 saut de page — titres en gras/taille directes.
- **Impact** : l'utilisateur doit reconstruire sommaire/styles dans Word ; l'annonce « styles APA, table des matières et numérotation » (module export) n'est pas vérifiée.
- **Correction** : soit appliquer pStyle Heading 1-2 + champ TOC + numPr, soit corriger le texte de l'UI. **Critères** : document exporté ouvert dans Word = styles + TOC visibles.

## AUD-REL-001 — Overpass inatteignable et sans timeout applicatif
- **Domaine** : Fiabilité · **Fonctionnalité** : Vérification cartographique / osm-infra
- **Verdict** : ⚠️ DÉGRADÉ — environnement indisponible · **Preuve** : confirmée (HTTP 000 ×retest)
- **Gravité** : Moyenne (si fonctionnalité utilisée) · **Priorité** : P2
- **Observé** : endpoints Overpass HTTP 000 depuis le sandbox (réserve connue) ; audit 03 confirme l'absence de timeouts dans osm-infra.ts.
- **Correction** : timeouts + retry borné (A.7 recommandation récurrente). **Critères** : une indisponibilité Overpass échoue en < 15 s avec message clair.

## AUD-GOV-001 — Aucune sauvegarde outillée de la base de données
- **Statut v1.1 (2026-10-09)** : ✅ **CORRIGÉE, REVALIDÉE** (commit `1682dcd`) — sauvegarde initiale pré-modification vérifiée (VACUUM INTO 213 Mo ×2 emplacements + upload 244 Mo) ; backup quotidien auto au boot (+ re-check 6 h) avec rotation 7 j et miroir hors arbre ; script restore avec copie de sécurité ; **restauration réelle en environnement de test prouvée complète** (integrity ok, diff stats live↔restaurée VIDE) ; procédure documentée `docs/SAUVEGARDE-RESTAURATION.md` ; preuves `evidence/c1-*.json`.
- **Domaine** : Gouvernance/Données · **Fonctionnalité** : persistance globale
- **Verdict** : ⚠️ DÉGRADÉ · **Preuve** : confirmée (audit 03 + historique)
- **Gravité** : **Élevée** (risque de perte totale : unique copie locale de la thèse + corpus 248 Mo) · **Priorité** : **P1**
- **Constat** : pas de backup planifié, pas de procédure documentée ; seul precedent = copie manuelle /tmp lors du rollback 2026-10-08 (qui a réellement failli coûter le corpus) ; `db:push --accept-data-loss` en script standard aggrave le risque.
- **Correction** : procédure de sauvegarde automatique (copie datée au démarrage du serveur, rotation 7j) + export manuel dans l'UI. **Critères** : démonstration restore complète depuis un backup daté.

## AUD-SEC-001 — Sur-permissions Tauri (`shell:allow-execute`/`allow-open`, CSP null)
- **Statut v1.1 (2026-10-09)** : 🟡 **CORRIGÉE, NON REVALIDÉE CÔTÉ DESKTOP** (commit `93d8d08`) — capabilities minimales (`core:default` seul, plugin shell jamais utilisé par le front) + CSP explicite (+ devCsp HMR) justifiée par la topologie runtime (webview = origine serveur Next standalone) ; web inchangé (200, lint 0 err) ; **revalidation = build Windows + smoke test par le propriétaire AVANT toute distribution** (test impossible dans l'environnement, documenté `evidence/c4-tauri-hardening.json`).
- **Domaine** : Sécurité · **Verdict** : ⚠️ DÉGRADÉ · **Preuve** : confirmée (capabilities lues) · **Gravité** : Moyenne (chaîne XSS→exécution théorique ; front n'utilise pas le plugin) · **Priorité** : **P1 avant packaging/distribution**
- **Correction** : retirer les permissions shell inutilisées, définir une CSP explicite. **Critères** : capabilities minimales ; CSP définie ; l'app fonctionne.

## AUD-SEC-002 — Clé APINex réelle dans l'historique git (poussée sur GitHub)
- **Domaine** : Sécurité · **Verdict** : ⚠️ DÉGRADÉ · **Preuve** : confirmée (commits-snapshots UUID) · **Gravité** : Moyenne (clé rotée depuis ; historique purgable) · **Priorité** : P2
- **Correction** : purge BFG du fichier `.env` dans l'historique + `git rm --cached .env` (AUD-SEC-003) + révoke APINex chez le fournisseur. **Critères** : `git log -S` ne trouve plus la valeur.

## AUD-SEC-004/005/006/007 — Basses (groupées ici, détaillées dans 04)
- 004 : 40/98 routes API sans schéma déclaré (`ai-test` accepte `{}` en 200) — P3.
- 005 : CSP null (tauri.conf.json:27) — chevauche AUD-SEC-001 — P1 packaging.
- 006 : champ `context` d'ai-writing inséré brut dans le prompt (self-injection utilisateur, risque faible en mono-utilisateur) — P3.
- 007 : `error.message` brut renvoyé par certaines routes IA (fuite d'info interne) — P3.

## AUD-DOC-001 — Version affichée fausse (« Ma Thèse v1.2.0 »)
- **Verdict** : ⚠️ DÉGRADÉ · confirmée · app-footer.tsx:15 en dur vs package.json 1.10.8 · **Priorité** : P3
- **Correction** : lire la version de package.json. **Critères** : footer = version réelle.

## AUD-DOC-002 — Divergences de comptage (27 modes UI vs 26 notice)
- **Verdict** : ⚠️ DÉGRADÉ · probable (UI vérifiée, notice à re-compter) · **Priorité** : P3

## AUD-DATA-001 — Données de test résiduelles en base de production
- **Verdict** : ⚠️ DÉGRADÉ · confirmée (« Test Author T4 », « Test Reference for E2E Testing », « Smith, J.; Doe, A. » visibles à l'UI) · **Gravité** : Faible · **Priorité** : P3
- **Correction** : nettoyage validé par le propriétaire + convention d'objets de test (préfixe AUDIT-/TEST- + purge).

## AUD-UX-001 — Corpus OCR (16 documents) sans point d'entrée découvrable
- **Verdict** : ⚠️ DÉGRADÉ · confirmée (parcours des vues recherche/bibliothèque) · **Priorité** : P2
- **Correction** : ajouter une vue/section « Corpus » listant les ImportedDoc (avec statuts OCR), ou intégrer le corpus à la recherche plein texte.

## AUD-UX-002 — Panneau flottant « Livrable du test de production » permanent
- **Verdict** : ⚠️ DÉGRADÉ · confirmée (visible sur toutes les vues, recouvre du contenu desktop/mobile) · **Priorité** : P2 (avant diffusion)
- **Correction** : conditionner l'affichage (flag) ou le retirer du shell principal.
- **Mise à jour v1.2 (cycle audit-final-v1.2, autorisation propriétaire point 6)** : 🟡→✅ **corrigée, revalidée**. Réévaluation préalable : qualifiée **bloquante parcours GP-4** (hit-test sur le bouton Générer observé en v1.1) — non rétrogradable en risque résiduel. Correctif ciblé 1 fichier : pastille repliée par défaut (surface minimale, pointer-events confinés), panneau dépliable sur clic explicite, dismissal X inchangé. Revalidation UI réelle (agent-browser, clics réels) : hit-test du bouton Générer = lui-même (plus aucun recouvrement), **clic direct → POST /api/ai-writing/stream 200 → Résultat affiché** ; déplier/plier/masquer/persistance OK. Preuve : `evidence/ux2-revalidation.json` + 4 captures `ux2-*.png`. TNR : 1 658/1 658 verts, lint 0 erreur, rouges 0 diff.

## AUD-FUNC-006 (observation) — « Recherche plein texte » = chapitres seulement (étiqueté « MeiliSearch (simulation) »)
- **Verdict** : ⚠️ DÉGRADÉ · confirmée · **Priorité** : P3 (périmètre à annoncer clairement ou intégrer le corpus).

---

## Compte du registre
**17 fiches** : 1 ❌ CASSÉ (AUD-FUNC-002) · 15 ⚠️ DÉGRADÉ · 0 autre ❌. P1 : AUD-FUNC-002, AUD-FUNC-003, AUD-GOV-001, AUD-SEC-001(+005). P2 : AUD-FUNC-004/005, AUD-HYD-001, AUD-EXPORT-001, AUD-REL-001, AUD-SEC-002, AUD-UX-001/002. P3 : reste.

**Mise à jour v1.1 (cycle audit-remediation-p1)** : les 4 fiches P1 sont traitées — 3 **corrigées, revalidées** (AUD-FUNC-002, AUD-FUNC-003, AUD-GOV-001) + 1 **corrigée, non revalidée côté desktop** (AUD-SEC-001, build Windows propriétaire requis). Les 13 autres fiches restent ouvertes (P2/P3, hors périmètre de l'autorisation propriétaire).

---

## Tableau de gestion v1.2 (cycle audit-final-v1.2 — exigences propriétaire point 6.4)

Chaque fiche ouverte : priorité · impact · reproducibilité · contournement · responsable · décision de correction. Fiches traitées rappelées en tête. Aucun défaut compromettant sécurité, intégrité des données ou parcours critique ne restera ouvert au GO final.

| Fiche | Prio | Impact | Reproductibilité | Contournement | Responsable | Décision de correction |
|---|---|---|---|---|---|---|
| AUD-UX-002 | P2 | **corrigée, revalidée ce cycle** (`03037e2`) : pastille repliée, hit-test propre, GP-4 revalidé clic direct | — | — | développeur | close (preuve `ux2-revalidation.json`) |
| AUD-FUNC-004 (persistance de vue au rechargement) | P2 | Faible : la vue active n'est pas toujours restaurée après F5 — l'utilisateur re-clique ; aucune perte de données | Oui (F5 sur vue secondaire) | Re-clic sur la vue | Développeur (cycle P2 distinct) | Correction en cycle autorisé dédié ; non bloquante GO (aucune perte d'intégrité) |
| AUD-FUNC-005 (400 si année vide / double POST suspecté) | P2 | Confusion utilisateur à la création de référence sans année ; double POST suspecté à instruire | Oui (formulaire sans année) | Saisir l'année | Développeur (cycle P2) | Instruction + correction cycle P2 ; à instruire avant GO (qualité perçue du parcours références) |
| AUD-HYD-001 (`<div>` dans `<p>` — hydratation) | P2 | Warning console au chargement de certaines vues ; aucun dysfonctionnement fonctionnel observé | Oui (console au boot) | Aucun nécessaire | Développeur (cycle P2) | Correction triviale (imbrication balises) en cycle P2 ; non bloquante |
| AUD-EXPORT-001 (DOCX sans TOC/styles réels) | P2 | Qualité du livrable thèse : export valide mais sans TOC/styles Word natifs | Oui (export + ouverture Word) | Post-traitement manuel Word | Développeur (cycle fonctionnel dédié) | Correction proposée en cycle distinct avant diffusion large ; non bloquante sécurité/intégrité — décision à expliciter au GO |
| AUD-REL-001 (Overpass sans timeout) | P2 | Vue carto peut rester en attente si service externe indisponible | Oui (service hors ligne) | Recharger la vue | Développeur (cycle P2) | Ajout timeout + message d'état en cycle P2 ; vue 30 traitée individuellement au pass A1 |
| AUD-SEC-002/003 (purge historique git) | P2 | Secret APINex dans l'historique publié (`.env`, commits porteurs localisés) | N/A (historique) | Aucun — purge requise | Développeur + Propriétaire | Plan prêt (`13_PURGE_GIT_PLAN.md`) ; exécution vague 3 coordonnée ; révocation confirmée par le propriétaire = prérequis ; **critère de sortie n° 7 avant toute diffusion à des tiers** |
| AUD-UX-001 (corpus OCR 16 docs non découvrable) | P2 | Fonctionnalité attendue absente : les ImportedDoc sont accessibles seulement indirectement | Oui (parcours recherche/bibliothèque) | Navigation indirecte | Développeur (proposition v1.2) | Conception d'une entrée « Corpus » proposée dans v1.2 ; arbitrage propriétaire ; non bloquant si explicitement reporté |
| AUD-FUNC-001 (`\n` littéral — éditeur, ligne 204) | P3 | Cosmétique : `\n` affiché au lieu du saut de ligne | Oui (rendu éditeur) | Saisie sans \n littéral | Développeur (cycle P3) | Correction triviale au prochain cycle touchant l'éditeur ; non bloquant |
| AUD-DOC-001/002 (versions/cohérence docs) | P3 | Documentation incohérente (versions, comptage modèles) | Oui (lecture docs) | — | Développeur | Correction documentaire portée par la v1.2 (clôture du cycle) |
| AUD-DATA-001 (données de test résiduelles) | P3 | Propreté des données avant diffusion | Oui (inventaire DB) | — | Développeur | Nettoyage contrôlé (avec sauvegarde vérifiée préalable) avant diffusion ; consigné en vague 4 |
| AUD-SEC-004 (40 routes sans schéma zod) | P3 | Durcissement défensif des entrées API ; app mono-utilisateur en local : pas d'exploitabilité démontrée | Oui (audit statique) | — | Développeur (cycle P3) | **À traiter ou à justifier explicitement avant GO** (règle point 6.4 : aucun défaut sécurité laissé ouvert) — plan de schématisation progressive en v1.2 |
| **NOUVELLE v1.2 — AUD-FUNC-007** (Plan de thèse : chapitres rattachés jamais affichés) | P2 | Les chapitres attachés à une partie n'apparaissent pas dans les blocs (badge « 0 chap. ») alors que l'attachement persiste en DB ; détachement inatteignable en UI | Oui (pass A1 lot 1c — attachement puis reload) | Gestion via l'éditeur (GET /api/thesis/[id] retourne partId) | Développeur (cycle P2) | Cause : GET /api/thesis select réduit sans partId vs GET /api/thesis/[id] complet — incohérence entre endpoints ; correction P2 ciblée proposée (aligner le select) ; découverte du pass A1 (preuve a1-lot1.json) |
| AUD-SEC-006 (injection de contexte prompt) | P3 | Robustesse des prompts IA ; usage mono-utilisateur | Oui (audit statique) | — | Développeur (cycle P3) | Traitement P3 ; justifié explicitement au GO si reporté |
| AUD-SEC-007 (messages d'erreur nus) | P3 | Fuites d'information potentielles en verbose ; usage local | Oui (audit statique) | — | Développeur (cycle P3) | Traitement P3 ; non bloquant usage local |

**Vague 2-bis (pass A1 lots 2-4 + audit isolation W2-2) — nouvelles fiches consolidées** (preuves : `evidence/isolation-multitheses.json`, `evidence/a1-lot2a/2b/3a/3b/4a/4b.json`, commits `6e79e6e`→`476862c`) :

| Fiche | Prio | Impact | Reproductibilité | Contournement | Responsable | Décision de correction |
|---|---|---|---|---|---|---|
| **AUD-ISO-001 (P1) — vue Plan écrit sur theses[0]** | **P1** | **Écriture cross-thèse PROUVÉE** : bascule « Par parties » → PUT sur la thèse theses[0] (updatedAt desc), ≠ thèse active ; si l'ordre updatedAt avait été inversé, l'écriture serait tombée sur le propriétaire | Oui (W2-2, test décisif, capture iso-05) | Aucun fiable (comportement invisible) | Développeur — **arbitrage propriétaire requis** | Correctif minimal prêt (1 fichier : Plan → activeThesisId) ; **à corriger avant GO** (critère #9 : aucun défaut bloquant ouvert) |
| AUD-ISO-002 (sélecteurs locaux défaut theses[0]) | P2 | Cadrage/Boîte doctorale/Équilibre : affichage/écriture potentielle sur une autre thèse que l'active | Oui (W2-2 + lots 2a) | Sélectionner manuellement la bonne thèse | Développeur (cycle P2) | Correction avec AUD-ISO-001 (même classe) |
| AUD-ISO-003 (auto-création DoctoralToolbox sur theses[0], non supprimable) | P2 | Toolbox template auto-créée à la simple visite ; **1 résidu template INITIAL_* documenté sur le propriétaire** (aucune donnée utilisateur ; aucun endpoint DELETE) | Oui (W2-2 + W2-3a sur propriétaire) | Aucun (pas d'UI de suppression) | Développeur + arbitrage propriétaire | Correctif (binding activeThesisId) + décision sur le résidu (DELETE ciblé hors audit / laissée documentée) |
| AUD-ISO-004 (= AUD-FUNC-007 consolidée — cause racine route.ts:16) | P2 | Voir AUD-FUNC-007 ; correctif minimal 1 ligne (select + partId/sortOrder) — à coupler à AUD-ISO-001 | Oui (W2-2 repro UI) | Éditeur | Développeur | Correction P2 ciblée autorisable avec AUD-ISO-001 |
| AUD-ISO-005 (onglet recherche : sélecteur in-view mute le store global + race auto-création ×3) | P3 | Auto-création non idempotente : 3 onglets dupliqués observés (12.994/13.009/13.020) ; mutation du store global depuis une vue | Oui (W2-3a-fin) | Suppression manuelle via flux confirmé | Développeur (cycle P3) | Idempotence + binding à revoir |
| AUD-ISO-006 (8 familles de données globales sans signal UI) | P3 | Références, Agile, Expérimentations, Outils IA… visibles de tous les contextes — trompeur multi-thèses | Oui (C-2, W2-2, W2-5a) | — | Propriétaire (produit) | Résolu en partie si migration références autorisée ; reste = signal UI |
| AUD-ISO-007 (stats dashboard agrégées toutes thèses) | P3 | Chiffres dashboard non thèse-scopés | Oui (W2-2) | — | Développeur (cycle P3) | Traitement P3 |
| A1L2A-01 (IA Feuille de Route Agile 400) | P2 | Génération IA de la vue 13 inutilisable : client {content,mode} vs serveur {prompt} (zod 400), ×2 observés | Oui (a1-lot2a captures) | — | Développeur (cycle P2) | Alignement de contrat ; même classe qu'A1L3A-03 |
| A1L2A-03 (Équilibre : objectifs non persistés) | P2 | Objectifs perdus au reload (0 écriture réseau) | Oui (2× constaté) | Re-saisie | Développeur (cycle P2/P3) | Persistance à concevoir |
| A1L3A-03 (Génération Hypothèses IA cassée) | P2 | Double incompatibilité de contrat (stream exige {prompt} + mode inexistant dans WRITING_MODES) → 400 déterministe ; cascade A1L3A-04 : texte d'erreur transféré dans H1 du pré-enregistrement | Oui (a1-lot3a, cause prouvée) | — | Développeur — **à corriger avant GO** (fonctionnalité vendue inutilisable) | Alignement contrat + garde d'erreur |
| A1L3B-01 (Article→Code inutilisable sans clé) | P2 | 500 corps vide : 5 fournisseurs sans clé (getApiKey jeté hors try/catch → erreur masquée « Unexpected end of JSON input ») ; n'exploite pas withAiConfig | Oui (a1-lot3b) | — | Développeur + arbitrage clés propriétaire | Robustesse (try/catch + message) OU raccordement zai — arbitrage |
| A1L2B-02 (toasts use-toast invisibles ~10 modules) | P2 | Feedback utilisateur absent (gardes silencieuses, alertes non affichées) — `<Toaster>` shadcn jamais monté (layout ne monte que sonner) ; matérialisée vues 27/29/31/32 + revue sur 13/38/36 | Oui (a1-lot2b + 3a + 4a/4b) | — | Développeur — correctif 1 ligne à arbitrer | Monter le Toaster shadcn OU basculer les modules sur sonner |
| A1L2B-01/03/04, A1L2A-04 (états locaux non persistés : checklist métho, analyse du champ, atelier SLR démo, rythme équilibre) | P3 | Recharge = perte ; analyse du champ reconsomme 1 IA à chaque visite | Oui (reload prouvé par vue) | — | Développeur (cycle P3) | Persistance à concevoir ou état démo assumé |
| A1L3A-01/02, A1L3B-02/03, A1L4A-01/02, A1L4B-01/02, A1L2B-05/06/07, A1L3A-05 (P3/P4 divers) | P3/P4 | Gardes silencieuses, citations APA tronquées au 1er auteur, import BibTeX fragile (mono-ligne rejeté), filtre domaine Journaux OA inutilisable, filtre statut explorateur non appliqué, parseur osm pluriel, geo-enrich échec silencieux, coquille PICO, pas d'édition sources/notes IA, delete sans res.ok, badge IA inexact | Oui (preuves par lot) | Voir fiches JSON | Développeur (cycles P3/P4) | Traitement P3/P4, aucune bloquante |

**Compte v1.2 après vague 2-bis** : **18 + 31 fiches vagues 2-bis** — 1 **P1 nouvelle (AUD-ISO-001, écriture cross-thèse prouvée — arbitrage propriétaire requis)** · 6 P2 nouvelles (AUD-ISO-002/003/004, A1L2A-01, A1L3A-03, A1L3B-01, A1L2B-02) · reste P3/P4. **État du risque multi-thèses : structurellement sain (FK+Cascade prouvées) mais couche UI défaillante sur 5 modules (theses[0]) — correctifs prêts, autorisation en attente.** Registre A1 : **33/33 vues du périmètre traitées** (24 validées UI réelle + 2 non testables cause extérieure [44 Traducteur, 36 APInex] + répartitions lot 1/2/3/4 avec réserves documentées).

