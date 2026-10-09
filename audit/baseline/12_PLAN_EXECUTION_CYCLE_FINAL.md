# Plan d'exécution séquencé — Clôture de l'audit v1.1 et préparation du GO final

**Projet** : ThesisFrame / Ma Thèse · **Cycle** : `audit-final-v1.2` · **2026-10-10**
**Références** : instructions définitives du propriétaire (IM 2026-10-10) · `BASELINE_AUDIT_REPORT.md` v1.0 (immuable) · `BASELINE_AUDIT_REPORT_v1.1.md` (historique du cycle C-1..C-4) · `12_PLAN_EXECUTION_CYCLE_FINAL.md` (le présent document).

**État vérifié du dépôt au moment du plan** : `HEAD == origin/main == 9705038`, arbre propre, lignes rouges 0 diff, `db/custom.db` skip-worktree intacte, suite 1 658/1 658 verts, lint 0 erreur.

## 0. Prise d'acte et confirmations de conformité

1. **Verdict maintenu : GO SOUS CONDITIONS.** Ni mise en production, ni ouverture aux premiers utilisateurs, ni diffusion publique ou à des tiers avant satisfaction des critères de sortie §8 des instructions et validation explicite du propriétaire.
2. **Immuabilité** : la v1.0 ne sera jamais modifiée rétroactivement ; la v1.1 reste l'historique du cycle C-1..C-4 ; les corrections documentaires demandées (golden paths, registre) seront portées par la **v1.2**, produite à l'issue de cette vague.
3. **Références bibliographiques** : la décision produit (« références rattachées à chaque thèse ») est prise en compte. **Aucune migration ne sera exécutée avant une autorisation distincte** — seule la proposition technique sera produite (Lot B).
4. Le présent plan est structuré selon la demande : **(1)** vérifications/opérations déjà autorisées · **(2)** plan technique de migration des références (accord préalable requis) · **(3)** validations propriétaire (web/Windows) · **(4)** preuves attendues avant demande de GO final.

---

## 1. LOT A — Vérifications et opérations déjà autorisées (démarrage immédiat)

Tout ce lot est de la **validation, de la sécurisation documentaire et de la préparation** : aucune modification de schéma, aucune donnée réelle détruite, aucune diffusion. Exécution développeur dans l'environnement actuel.

### A1 — Pass UI réel des 33 vues restantes (C-19) → inventaire consolidé des 47 vues
- **Source d'exécution** : `08_TEST_MATRIX.md` (33 vues ◻️ non exécutées ; 8 ✅ ; 6 ⚠️ partielles dont le statut sera consolidé).
- **Méthode** : application réelle (agent-browser), par lots de 8 à 10 vues, pour **chaque** vue : identification de la vue et de ses fonctionnalités principales ; parcours pertinents en UI réelle ; états normaux, erreurs et interactions critiques ; persistance quand applicable ; effets sur les autres thèses quand applicable ; actions destructives, confirmations et annulations ; résultat consigné avec captures/anomalies/statut final. Objets de test préfixés `AUDIT-`, nettoyage complet, état propriétaire restauré après chaque lot.
- **Vues dépendantes de services externes** (Overpass ; APInex Playground) : traitement individuel — cause précise, conséquence, proposition de résolution. La clé APInex fournie par le propriétaire (IM) sera restaurée dans `.env.local` local (jamais commité, **jamais reproduite dans les preuves**) pour tenter la vue en conditions réelles ; si le service est indisponible, la vue sera déclarée **non testable pour cause extérieure**, jamais validée par inspection du code.
- **Livrable** : inventaire consolidé des **47 vues** (validée / partiellement validée / échouée / non testée — chacune avec preuve), version v1.2 de la matrice + JSON de preuve + captures. Critère de sortie : couverture effective des 47 vues, correction et revalidation de toute anomalie bloquante découverte.

### A2 — Test UI réel des 13 actions destructives restantes
Les 3 actions déjà testées en UI réelle (référence, thèse, chapitre) ne sont pas reprises. Les **13 restantes** (vérifiées par code seulement en v1.1 — registre `evidence/c3-revalidation.json`) seront **chacune** testées en UI réelle :

| # | Action | Fichier |
|---|--------|---------|
| 1 | Suppression d'une source IA | `ai-tools-page.tsx` |
| 2 | Suppression d'une note IA | `ai-tools-page.tsx` |
| 3 | Suppression d'une expérimentation | `experimentations-page.tsx` |
| 4 | Suppression d'un run d'expérimentation | `experimentations-page.tsx` |
| 5 | Suppression d'un élément d'analyse carto | `verification-carto-page.tsx` |
| 6 | Suppression d'une partie de plan | `thesis-plan-page.tsx` |
| 7 | Fermeture d'onglet de recherche (DELETE persisté) | `onglet-recherche-page.tsx` |
| 8 | Effacement du contenu d'onglet (PUT save) | `onglet-recherche-page.tsx` |
| 9 | Suppression d'un article | `article-redaction-page.tsx` |
| 10 | Suppression d'un document source importé | `article-redaction-page.tsx` |
| 11 | Suppression d'une entrée du registre juridique | `registre-juridique-tab.tsx` |
| 12 | Suppression d'une story (feuille de route agile) | `feuille-route-agile-page.tsx` |
| 13 | Suppression d'un sprint (cascade) | `feuille-route-agile-page.tsx` |

Pour chacune, contrôle des six points exigés : ① aucune suppression avant confirmation (réseau : 0 requête destructive à l'ouverture du dialogue) ; ② **Annuler = 0 requête + 0 modification persistée** (comptage DB avant/après) ; ③ Confirmer déclenche **uniquement** la suppression prévue (endpoint et périmètre exacts) ; ④ cascades conformes au comportement attendu ; ⑤ l'interface reflète le résultat ; ⑥ erreurs gérées sans perte silencieuse. L'inspection du code complète mais ne remplace pas.
- **Livrable** : registre des actions destructives complété (16/16 en UI réelle), preuve JSON par action + captures.

### A3 — Preuve de restauration des fichiers sources `upload/`
- **Protocole strictement non destructif** (aucun essai sur l'unique copie des données réelles) : ① échantillon représentatif + jeu de test contrôlé (fichiers `AUDIT-`) copiés hors arbre ; ② sauvegarde via les outils C-1 ; ③ **restauration vers un répertoire de test isolé** ; ④ comparaison restauré↔originaux : noms, nombre, tailles, **empreintes SHA-256** ; ⑤ **cohérence base↔fichiers** : chaque ImportedDoc référencé retrouve son fichier, aucun orphelin ni référence cassée après restauration conjointe DB + fichiers (en réutilisant la preuve `c1-restore-test.json`) ; ⑥ procédure complète, résultats et limites documentés.
- **Livrable** : JSON de preuve (comparaison empreintes + cohérence), procédure dans `docs/SAUVEGARDE-RESTAURATION.md`.

### A4 — Réconciliation des golden paths (6 vs 7)
- **Constat** : la v1.0 (§L.2) annonce « 6 golden paths » ; la v1.1 (§3) reprend « Six » mais énumère 7 items (GP-1..GP-7). L'export DOCX (GP-7) était couvert en v1.0 via la vue 47, puis a été numéroté GP-7 lors du TNR v1.1 sans harmonisation du texte.
- **Résolution** : liste canonique numérotée — **GP-1..GP-6 = périmètre initial v1.0** (rédaction ; création de thèse ; références CRUD ; génération IA ; RAG cité ; thèses en ligne) ; **GP-7 export DOCX = ajouté au TNR v1.1** (couvert en v1.0 comme vue 47). **Total canonique = 7** (aucun parcours supprimé). Harmonisation partout : synthèse v1.2, preuves (`tnr-golden-paths.json` annoté d'un champ périmètre), captures, critères de sortie.

### A5 — Audit non destructif de l'historique git + préparation de la purge (AUD-SEC-002/003)
Étapes 5.1 à 5.4 des instructions (lecture seule, autorisées dès maintenant) :
1. **Sauvegarde vérifiée du dépôt** (clone miroir + bundle), inventaire branches / tags / remotes / clones concernés.
2. Vérification que `.env` est couvert par les règles d'exclusion et qu'**aucun secret ne reste dans les fichiers actuellement suivis**.
3. **Scan de l'historique** (branches, tags, références) pour localiser précisément les objets contenant les secrets identifiés AUD-SEC-002/003 — localisation par commit/fichier, sans reproduction des valeurs.
4. Statut de **révocation/rotation** documenté — la confirmation APINex auprès du fournisseur est une action propriétaire (Lot C3).
5. **Plan de purge BFG exact** (éléments à purger, commandes, fenêtre de coordination, contrôles post-réécriture) préparé et soumis — **l'exécution de la réécriture et le force-push relèvent du Lot C3** (coordination obligatoire).
- Aucune clé, valeur de secret ou donnée sensible ne figurera dans les rapports de preuve.

### A6 — Actualisation du registre des anomalies (P2/P3) et réévaluation AUD-UX-002
- Chaque fiche ouverte renseignée : priorité, impact, reproductibilité, contournement, responsable, décision de correction.
- **Réévaluation AUD-UX-002 (panneau flottant « Livrable du test »)** : observé en v1.1 interceptant des clics sur le bouton Générer (hit-test, GP-4). Qualification proposée : **défaut perturbant un parcours essentiel → non rétrogradable en risque résiduel**. Correction ciblée proposée **dans ce cycle** (neutralisation du hit-test / repliable, correctif UI local sans valeur architecturale), justifiée au registre ; le propriétaire peut la retirer du périmètre à la revue du présent plan. Si la correction est faite : revalidation GP-4 complète.
- Aucun défaut compromettant sécurité, intégrité des données ou parcours critique ne restera ouvert au moment du GO final.

### A7 — Traçabilité et squelette v1.2
- Chaque preuve reliée au **commit réellement testé** (hash dans les JSON de preuve) ; tableau de conformité des 11 critères (statut / preuve / commit / limite / décision) tenu à jour au fil de l'eau ; chiffres de référence v1.1 (1 658 tests verts, lint 0 erreur) comme point de comparaison — tout écart expliqué, toute régression pertinente corrigée avant validation.

---

## 2. LOT B — Proposition technique « références rattachées à chaque thèse » (livrable seul — aucune exécution)

Conformément à la décision produit et à la limite d'autorisation : **proposition soumise à autorisation distincte, aucune modification de modèle ou de données avant accord**.

Contenu exact de la proposition (document `specs/ref-thesis-scoping/proposition-technique.md` + SDD complet) :
1. **Schéma** : ajout `thesisId` au modèle `Reference` (Prisma), relation vers `Thesis`, choix documenté `onDelete` (Cascade proposé : la suppression d'une thèse emporte ses références — l'alternative SetNull et son risque de références orphelines seront chiffrés), index `@@index([thesisId])`.
2. **Contraintes d'intégrité et API** : filtrage systématique par thèse (liste, création, lecture, modification, suppression, recherche, export bibliographique), schémas zod, refus hors périmètre ; vérification de l'isolation de chaque opération.
3. **Migration de données sûre et réversible** : sauvegarde vérifiée préalable (outils C-1) + export JSON des références ; **traitement des références existantes** : attribution à la thèse concernée ; **détection des ambiguïtés** (cas multi-thèses) et stratégie pour les cas non attribuables automatiquement (mise à l'écart consultable, décision explicite) ; **procédure de retour arrière** testée.
4. **Tests automatisés d'isolation** : une référence d'une thèse n'est ni visible ni modifiable depuis une autre thèse (CRUD + recherche + export), tests négatifs API ; aucun comportement de partage sauf fonctionnalité explicitement conçue et autorisée.
5. **Risques, effort, critères de validation** : impact sur les vues consommatrices (références, export DOCX, APA Composer, vérification citations…), plan TNR, critères d'acceptation.
6. **Explicitation** : le GO final ne sera pas sollicité tant que ce point n'est pas mis en œuvre puis revalidé, **ou** qu'une décision de report formelle et explicite n'est pas prise par le propriétaire. Aucun report ne sera supposé.

---

## 3. LOT C — Validations à réaliser par le propriétaire (procédures préparées par le développeur)

**Constat honnête et contraignant** : l'environnement de développement actuel **interdit le build de production** (règle d'environnement documentée — `00_SCOPE_AND_BASELINE.md` §B) et ne dispose **ni de Windows ni de la chaîne cargo**. Ces validations ne peuvent donc pas être exécutées ici ; elles sont **préparées** (procédures, checklists, gabarits de preuve) pour exécution propriétaire. La preuve de build du 18 septembre 2026 est réputée non valable pour le commit final. Si le propriétaire préfère, un pipeline CI (item C-20) peut porter le build web — décision distincte.

### C1 — Build web de production (propriétaire, sur le commit final destiné à la distribution)
- Procédure pas-à-pas fournie (prérequis, commandes, temps attendus) ; vérifications : build sans erreur ; démarrage de l'application issue du build dans un environnement représentatif ; parcours critiques testés (consultation/rédaction, création et changement de thèse, références, génération IA, RAG avec citations, recherche de thèses, export DOCX) ; persistance, journaux, erreurs serveur, régressions.
- Gabarit de preuve fourni : commit testé, commandes + sorties, captures, logs — archivés dans `audit/baseline/evidence/`.
- **Calendrier** : exécution uniquement lorsque le commit final est atteint (après Lots A et B exécutés/autorisés).

### C2 — Build desktop Windows Tauri + smoke test (propriétaire, machine Windows)
- Procédure pas-à-pas fournie (prérequis Rust/Windows, build, installeur, installation, lancement en environnement de test).
- Smoke test fourni : démarrage et arrêt propres du serveur Next standalone, navigation, persistance, erreurs ; **vérification explicite que la CSP durcie et les capabilities minimales n'empêchent aucune fonctionnalité attendue** (checklist fonctionnalité par fonctionnalité, croisement avec C-4) ; confirmation qu'aucune permission shell non nécessaire n'a été réintroduite (liste des capabilities attendues fournie, à comparer à l'installeur).
- Gabarit de preuve : versions, commit, résultats build + smoke, captures — archivés.
- **Aucun installeur Windows ne sera distribué avant la réussite de ces contrôles.** Les résultats web et desktop seront rapportés **séparément** ; la réussite de l'un ne vaut pas validation de l'autre.

### C3 — Purge de l'historique git (exécution coordonnée développeur ↔ propriétaire)
- Prérequis : A5 terminé (localisation précise, sauvegarde vérifiée, plan BFG prêt) ; **révocation/rotation APINex confirmée par le propriétaire auprès du fournisseur**.
- Exécution en **fenêtre synchronisée** : coordination branches distantes, collaborateurs et clones pour éviter la réintroduction de l'ancien historique ; réécriture BFG/méthode équivalente ; force-push coordonné ; **contrôles post-réécriture** (scan : aucun secret concerné accessible dans l'historique publié ; références et clones réalignés).
- Documentation du résultat, des éventuels secrets résiduels et des mesures correctives — sans reproduction des secrets.

---

## 4. LOT D — Preuves attendues avant la demande de GO final (tableau de conformité)

| # | Critère de sortie (instructions §8) | Lot | Preuve attendue | Responsable | Statut |
|---|---|---|---|---|---|
| 1 | 33 vues testées ; 47 vues avec statut explicite et preuves | A1 | Matrice v1.2 + JSON + captures 47/47 | Développeur | À faire |
| 2 | 13 actions destructives testées en UI réelle | A2 | Registre 16/16 UI + JSON + captures | Développeur | À faire |
| 3 | Restauration `upload/` démontrée, cohérente avec la base | A3 | JSON SHA-256 + cohérence DB↔fichiers | Développeur | À faire |
| 4 | Références par thèse : mise en œuvre + revalidation **après autorisation distincte**, ou report formel accepté | B → exécution future | Proposition + (si autorisée) migration + tests isolation | Propriétaire (autorisation) / Développeur | Proposition à produire |
| 5 | Build web production vert sur commit final + parcours critiques | C1 | Gabarit rempli : commandes, sorties, captures, commit | Propriétaire | Procédure à préparer |
| 6 | Build Windows + smoke test CSP durcie (si desktop distribué) | C2 | Gabarit rempli : build, installeur, smoke | Propriétaire | Procédure à préparer |
| 7 | Purge git + sécurisation secrets prouvées avant diffusion à des tiers | A5 + C3 | Scan pré/post, sauvegarde dépôt, confirmation révocation APINex | Développeur + Propriétaire | Audit à faire |
| 8 | Suite automatisée + TNR au vert, sans régression bloquante | A1–A3, à chaque changement | Sorties test:run + lint + golden paths 7 | Développeur | Référence 1 658/1 658 |
| 9 | Anomalies recensées, risques acceptés justifiés, aucun défaut bloquant ouvert | A6 | Registre actualisé + qualification AUD-UX-002 | Développeur | À faire |
| 10 | Incohérences documentaires corrigées ; preuves liées au commit testé | A4 + A7 | Liste canonique 7 golden paths + hashes dans preuves | Développeur | À faire |
| 11 | Rapport **v1.2** avec tableau de conformité complet | Fin de cycle | `BASELINE_AUDIT_REPORT_v1.2.md` | Développeur | Squelette prévu |

**Squelette v1.2** : résultats avant/après de chaque vérification, preuves liées aux commits, tests exécutés, anomalies restantes, régressions éventuelles, tableau de conformité des 11 critères, **recommandation motivée : GO final ou maintien du GO SOUS CONDITIONS**.

---

## 5. Séquencement et dépendances (vagues)

| Vague | Contenu | Dépendances |
|---|---|---|
| **1 — immédiat** | A4 (golden paths), A5①–④ (audit historique non destructif), A6 (registre + AUD-UX-002), B (proposition technique références), A7 (squelette v1.2) ; démarrage A1 par lots ; remise des procédures C1/C2 au propriétaire | Aucune (lecture/documentaire/UI) |
| **2 — exécution UI** | A1 (33 vues, par lots de 8-10), A2 (13 actions destructives), A3 (restauration `upload/`) | Vague 1 démarrée ; serveur + données propriétaire intactes |
| **3 — propriétaire** | C1 (build web sur commit final), C2 (build Windows + smoke), C3 (purge BFG coordonnée + révocation APINex) | Vague 2 terminée ; commit final atteint ; autorisation distincte pour la migration références si retenue |
| **4 — clôture** | (si autorisée) migration références + revalidation ; TNR globaux + 7 golden paths ; rapport **v1.2** + tableau de conformité ; **recommandation motivée GO final / maintien** | Vagues 1-3 + décisions propriétaire |

Estimation développeur : ~6 à 9 sessions de travail (A1 étant le poste principal). Aucune échéance n'est prise sous responsabilité propriétaire.

---

## 6. Règles d'exécution (rappel et engagement)

1. Aucune migration des références bibliographiques avant autorisation distincte (Lot B = proposition seule).
2. Aucune opération destructive sur les données réelles sans sauvegarde vérifiée et procédure de restauration disponible (outils C-1 ; restauration toujours en répertoire de test isolé).
3. Aucune diffusion web ou desktop avant les validations du mode de distribution concerné ; aucun installeur Windows avant C2 réussi.
4. Les vues non testées, actions destructives non testées et purge des secrets ne seront jamais déclarés clos sans preuves ; aucune vue validée par simple inspection du code.
5. La v1.0 n'est jamais modifiée rétroactivement ; la v1.1 reste l'historique C-1..C-4 ; la v1.2 portera les corrections.
6. Signalement immédiat de toute perte de données, exposition de secret, régression bloquante ou découverte remettant en cause la sécurité de la distribution.
7. Invariants maintenus à chaque commit : lignes rouges 0 diff, `db/custom.db` skip-worktree, push vérifié (`git log origin/main..HEAD`), aucune clé/secret dans les preuves, lint distinguant erreurs et warnings de baseline, suite 1 658 tests comme référence.

## 7. Livrables de fin de cycle (correspondance avec la demande)

| Livrable demandé | Où |
|---|---|
| 1. `BASELINE_AUDIT_REPORT_v1.2.md` | Fin de vague 4 |
| 2. Inventaire 47 vues + preuves | A1 (matrice v1.2 + evidence/) |
| 3. Preuves 13 actions destructives | A2 (registre + evidence/) |
| 4. Preuves restauration `upload/` + cohérence base | A3 |
| 5. Plan de migration références (autorisation distincte) | Lot B |
| 6. Preuves build + smoke web et Windows | C1/C2 (gabarits propriétaire, archivés evidence/) |
| 7. Preuves purge git + sécurisation secrets | A5 + C3 |
| 8. Registre d'anomalies actualisé + risques résiduels | A6 |
| 9. Recommandation motivée (GO final ou maintien) | v1.2, §conformité |

---
*Document produit par le développeur en réponse aux instructions définitives du propriétaire (IM 2026-10-10). Le verdict demeure GO SOUS CONDITIONS ; la fin d'un cycle de développement ne vaut pas autorisation de mise en production.*
