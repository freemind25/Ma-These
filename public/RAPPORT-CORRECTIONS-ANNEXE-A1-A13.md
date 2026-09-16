# RAPPORT — Corrections de l'annexe technique A.1–A.13 (ThesisFrame)

**Mission** : traitement des anomalies du test de production réelle jusqu'à résolution définitive — pas de contournement, pas d'atténuation partielle ; preuve d'exécution réelle post-correction pour chaque point.
**Date** : 16/09/2026 · **Version corrigée** : ThesisFrame v1.10.7 (sandbox de développement)
**Protocole appliqué** : vérification obligatoire, preuve avant affirmation, audit forensique.

---

## Synthèse

| Point | Objet | Statut final |
|---|---|---|
| A.1 | Route HAL (construction d'URL) | ✅ corrigé à la racine — preuve 200 réel |
| A.2 | Budget OpenAlex épuisé | ✅ corrigé à la racine — repli CrossRef+HAL prouvé en conditions réelles |
| A.3 | Rapport web sans Sources / tronqué | ✅ corrigé à la racine — Sources garanties + continuation, prouvés |
| A.4 | Historique/diff des chapitres | ✅ corrigé à la racine — ChapterVersion + diff natif dans l'app, prouvés |
| A.5 | « Cinq sous-domaines » | ✅ décision formalisée et documentée |
| A.6 | Stack SIG cible | ✅ décision formalisée et documentée |
| A.7 | Expiration Overpass | ✅ corrigé à la racine — reprise backoff déclenchée en réel |
| A.8 | Processus d'arrière-plan tués | ✅ corrigé à la racine — file persistante + reprise orphelins, prouvés |
| A.9 | Timeout directeur-chat | ✅ corrigé à la racine — timeout explicite + relance automatique, prouvés |
| A.10 | Arrêt du serveur | ✅ investigation menée — cause externe identifiée, procédure documentée |
| A.11 | Naming drift `directeurThese.js` | ✅ documentation vérifiée et décision consignée |
| A.12 | Squelette 7 chapitres | ✅ documentation mise à jour (référence officielle) |
| A.13 | Bilan inverse (ce qui a fonctionné) | — aucune action requise |

**Aucun point du bloc 1 n'est resté au stade du contournement. Les cinq points du bloc 2 sont tranchés et documentés dans le dépôt (`CONTEXT-PROJET.md`, § « Décisions d'architecture »).**

---

## BLOC 1 — BLOQUANTS

### A.1 — Route HAL ✅ corrigé à la racine

**Causes racines corrigées** (fichier `src/app/api/theses-en-ligne/search/route.ts` + page module) :
1. `fq.join("&fq=")` passé comme *valeur* d'un seul paramètre → remplacé par un `params.append("fq", …)` par filtre (paramètres `fq` répétés natifs).
2. `sort=publicationDateY_i+desc` encodé `%2B` → normalisation en espace, encodage final `%20` (`params.toString().replace(/\+/g, "%20")`).
3. **Cause additionnelle découverte pendant la correction** : le filtre domaine interrogeait `domain_s` avec des codes inexistants chez HAL (`sci`, `sm`, `chimie`, `stat`, `cca`). Les thèses HAL indexent leurs domaines dans `level0_domain_s` avec la taxonomie réelle (`shs`, `sdv`, `spi`, `info`, `phys`, `chim`, `sdu`, `math`, `sde`, `scco` — vérifié par facette Solr sur `docType_s:THESE`). Filtre et codes corrigés, interface de sélection alignée.

**Preuve post-correction** (rejeu de la requête exacte qui échouait — domaine + tri, côté client inchangé) :
```
GET /api/theses-en-ligne/search?q=urbanisme&domain=shs&sort=publicationDateY_i+desc
→ HTTP 200, numFound 802, résultats HAL réels (titres, années, URLs theses.hal.science)
GET /api/theses-en-ligne/search?q=ville%20intelligente&sort=score+desc
→ HTTP 200, numFound 149, résultats réels
```
Avant correction : HTTP 500 (« Cannot read properties of undefined (reading 'docs') »).

### A.2 — Budget OpenAlex épuisé ✅ corrigé à la racine

**Correction dans l'application elle-même** (pas dans un prompt d'agent) :
- Nouveau module `src/lib/research/academic-fallback.ts` : repli automatique **CrossRef + HAL avec triangulation des DOI**, déduplication par DOI normalisé, puis **curation déterministe identique** (`curateWorks` — même seuil, même scoring que la voie OpenAlex).
- Pipeline `deep-research` (extrait dans `src/lib/research/deep-research-pipeline.ts`) : détection de l'échec OpenAlex par requête (code 429, message budget/rate-limit, erreur réseau) → bascule automatique ; **notice visible** en tête de rapport (raison + fournisseurs + sources curées + DOI corroborés) ; **aucun message d'erreur brut** remonté à l'utilisateur ; l'état du repli est exposé dans `steps.fallback` de la réponse API.
- Garde HAL (découverte de la preuve) : HAL répond parfois **200 + numFound 0 sans erreur** quand des requêtes se succèdent trop vite — les appels HAL sont désormais sérialisés avec cadence minimale (4 s) et reprise unique sur résultat vide.

**Preuve post-correction** (recherche académique en conditions réelles, 169 s) :
```
POST /api/deep-research (sourceMode: "academic")
→ HTTP 200 — steps.fallback: { triggered: true,
    reason: "OpenAlex indisponible (budget API épuisé / rate-limit)",
    providers: ["CrossRef", "HAL"], crossRefHits: 60, sourcesCurated: 15 }
  curation : 15 sources « BON », score moyen 0,82
→ rapport de 24 829 caractères débutant par la notice :
  « > **Repli automatique** : OpenAlex indisponible (…) la recherche a été
  menée via CrossRef + HAL avec triangulation des DOI (15 sources curées…) »
```
Contribution HAL vérifiée séparément (8 sources sur une requête à couverture HAL).

### A.3 — Rapport web sans Sources et tronqué ✅ corrigé à la racine

**Corrections** (`deep-research-pipeline.ts`) :
1. Limite de génération relevée : `maxTokens` 10 000 → 12 000 pour le rapport final.
2. Prompt système renforcé : section `### Sources` **obligatoire** en fin ; phrases **toujours complètes** ; consigne de fermeture propre si la limite approche.
3. **Validation post-génération** : (a) détection de troncation (fin sans ponctuation terminale) → **passes de continuation** automatiques (max 2) reprenant exactement au point d'arrêt ; (b) absence de section Sources → **relance automatique** dédiée alimentée par la liste RÉELLE des sources consultées ; si la relance est inexploitable → **ajout déterministe** de la liste réelle (sans LLM — aucune invention possible). Le mécanisme réellement déclenché est consigné dans `steps.sourcesGuarantee`.
4. Contradiction du prompt harmonisée : citations `[n]` dans le corps, liens Markdown `[n] [Titre](URL)` dans les Sources (l'ancien prompt exigeait simultanément `[Titre](URL)` dans le corps et `[n]` + Sources — contradiction source de l'anomalie).

**Preuve post-correction** (rapport web réel, 157 s) :
```
POST /api/deep-research (sourceMode: "web")
→ HTTP 200 — rapport 24 524 caractères
→ logs serveur : « Rapport probablement tronqué (passe de continuation 1/2) »
   puis « Section Sources absente — relance automatique demandée »
→ rapport final : section « ### Sources » présente, 16 entrées réelles avec URLs,
   corps complet (la continuation a refermé la phrase coupée), fin propre.
```

---

## BLOC 2 — ÉCARTS STRUCTURELS (décisions + implémentation)

### A.4 — Historique/diff des chapitres ✅ corrigé à la racine

**Implémentation** :
- Schéma Prisma : table **`ChapterVersion`** (contenu HTML, plainText, wordCount, auteur, horodatage) sur le même schéma que `ThesisCadrageVersion`, relation cascade, index.
- `PUT /api/chapters/[id]` : toute sauvegarde **modifiant réellement le contenu** crée une version (les sauvegardes de statut/feedback ne polluent pas l'historique) ; la réponse porte `versionId`.
- `GET /api/chapters/[id]/versions` : historique consultable (50 dernières).
- Diff **mot à mot natif** : `src/lib/word-diff.ts` — LCS sur jetons, zéro dépendance externe (plus de calcul difflib hors outil), repli paragraphe au-delà de 3 000 jetons, statistiques +X/−Y.
- Interface : bouton **« Historique »** dans l'en-tête de chaque chapitre → dialogue de comparaison (sélection de deux versions, diff colorisé supprimé/ajouté, statistiques).

**Preuve post-correction** (application réelle) :
```
PUT  #1 (contenu modifié) → 200, versionId cmu3s…
PUT  #2 (contenu modifié) → 200, versionId cmu3s…
GET  /api/chapters/{id}/versions → 2 versions horodatées (480 et 481 mots, auteur « doctorant »)
UI  (Agent Browser) : dialogue « Historique du chapitre » ouvert sur le chapitre I :
     sélecteurs 07:51 — 1460 mots vs 07:47 — 481 mots, badge +997 mots / −18 mots,
     diff colorisé (suppressions rouges barrées / insertions vertes) rendu nativement.
Diff natif (bun, zéro dépendance) : wordDiff → segments del/add corrects, stats +4/−4.
```
*Note d'intégrité* : la première sauvegarde de preuve a tronqué le chapitre I de la base de test (préfixe de vérification + `original[:3000]`) ; le chapitre a été **reconstruit intégralement depuis le livrable md de la thèse** (1 460 mots, correspondance textuelle vérifiée sur 2 967 caractères) et les totaux de la thèse sont revenus à **7 chapitres / 7 162 mots** (valeur d'origine).

### A.5 — « Cinq sous-domaines disciplinaires » ✅ décision formalisée et documentée

- **Décision prise** : aligner la **documentation sur le code** — le champ libre `discipline` (string) est le **choix définitif** ; pas de liste fermée.
- **Justification** : ThesisFrame est multi-disciplines — une enum de cinq sous-domaines d'urbanisme briserait la généralité du produit ; le champ alimente le contexte IA où le texte libre est plus riche que toute taxonomie fermée ; la thèse de test a déclaré son option dans ce champ sans aucune friction. Implémenter l'enum exigerait en outre une migration des thèses existantes et un composant de sélection, pour un bénéfice négatif hors domaine urbanisme.
- **Conséquence documentaire** : consignée dans `CONTEXT-PROJET.md` (§ D-A.5). Vérification forensique : aucune mention de « cinq sous-domaines » dans la documentation du dépôt (l'écart provenait du protocole de test externe) — rien à retirer dans le code.

### A.6 — Stack SIG cible ✅ décision formalisée et documentée

- **Décision prise** : aligner la **documentation sur le code** — la chaîne actuelle est la **cible définitive** : MCP géographique (Nominatim, superficies de Gauss, vérification CRS) + couche Overpass + module verification-carto. **Pas de PostGIS/Martin/MapLibre GL.**
- **Justification** : (1) portabilité desktop — l'app embarque SQLite (Tauri), PostGIS exigerait un serveur PostgreSQL incompatible avec la distribution hors-ligne ; (2) la chaîne actuelle a fait ses preuves en production réelle (27/28 couches extraites, superficies 2,25/14,71 km², CRS WGS84 vérifié) ; (3) les tuiles vectorielles ne servent aucun usage actuel. Un plan de migration daté n'aurait donc aucun porteur de valeur.
- **Conséquence documentaire** : consignée dans `CONTEXT-PROJET.md` (§ D-A.6). Vérification : aucune mention PostGIS/Martin/MapLibre dans la documentation du dépôt à corriger.

### A.11 — Naming drift `directeurThese.js` ✅ documentation vérifiée, décision consignée

- Vérification forensique : `directeurThese.js` ne correspond à **aucun fichier du dépôt** ; la documentation projet référençait déjà le réel — `ROADMAP.md` (route `directeur/route.ts`), `CONTEXT-PROJET.md` (`specializations/directeur.ts`, avec mention explicite « directeur-prompt.ts : déprécié → specializations/directeur.ts »).
- La dérive provenait du **protocole de test externe** (document d'entrée, hors dépôt) — corrigé par la présente décision, consignée dans `CONTEXT-PROJET.md` (§ D-A.11). Aucun changement de code requis — conformément à la directive.

### A.12 — Squelette IMRaD : 7 chapitres ✅ documentation mise à jour

- **Décision** : le squelette **7 chapitres** est la référence officielle documentée — Introduction, Revue de littérature, **Cadre théorique** (chapitre III propre), Méthodologie, Résultats, Discussion, Conclusion — conformément au code (`src/app/api/thesis/route.ts`, création du squelette).
- Consigné dans `CONTEXT-PROJET.md` (§ D-A.12) : « toute description du squelette en "6 sections" est invalidée ». Vérification : aucune mention « 6 sections » dans la documentation du dépôt.

---

## BLOC 3 — QUALITÉ ET ROBUSTESSE

### A.7 — Expiration de requêtes Overpass ✅ corrigé à la racine

**Correction** (`src/lib/osm-infra.ts`, `executeOverpassQuery`) : **3 tentatives** (1 initiale + 2 reprises — exigence « au moins deux » satisfaite), **timeout progressif** 25 s → 35 s → 45 s (le `[timeout:NN]` serveur de la requête est réécrit à chaque tentative), **backoff** 2 s puis 5 s, alternance des endpoints. La distinction « zéro réel » vs « donnée manquante déclarée » reste portée par l'appelant, **inchangée** (conforme à la directive qui la juge correcte).

**Preuve post-correction** — la reprise s'est déclenchée **spontanément en conditions réelles** :
```
POST /api/osm-infra {"type":"bus_station","location":"Bab Ezzouar, Alger","radius":3}
   ← LA requête qui avait expiré deux fois pendant le test
→ HTTP 200 en 16,6 s — 3 éléments réels extraits (stations nommées + coordonnées)
→ log serveur : « [Overpass] Reprise 1/2 après échec (backoff 2000ms) : fetch failed »
```
Sans la correction, cette requête aurait de nouveau été « donnée manquante déclarée » ; la reprise a récupéré la donnée.

### A.8 — Processus d'arrière-plan non persistants ✅ corrigé à la racine

**Correction** : file de tâches **persistante** remplaçant le lancement `nohup` ad hoc :
- Modèle Prisma **`Job`** (type, statut, payload/result JSON, tentatives, horodatages) — les jobs survivent au processus qui les a créés.
- Worker dédié (`src/lib/jobs/worker.ts`, démarré par `src/instrumentation.ts` au boot du serveur) : revendication atomique (verrou optimiste), registre de handlers (`noop`, `deep-research` — le pipeline long est désormais exécutable hors requête HTTP), **sweep des orphelins** (jobs `running` sans processus depuis > 10 min → requalifiés `pending`), au démarrage ET périodiquement.
- API : `POST /api/jobs` (soumission, 201), `GET /api/jobs` (suivi), `GET /api/jobs/[id]` (état + résultat).

**Preuves post-correction** (application réelle) :
```
1. Soumission : POST /api/jobs {"type":"noop","payload":{"demo":"preuve-A8","valeur":42}}
   → 201 {"id":"cmu3shpyh0000spkhew06kqcp","status":"pending"}
   → 5 s plus tard : status=done, result={"ok":true,"echo":{…}} persisté (worker l'a exécuté)

2. Reprise après crash : job inséré en base status=running, startedAt = il y a 20 min
   (simulation d'un processus tué — exactement le scénario nohup de l'annexe)
   → sweep du worker : requalifié pending → exécuté → status=done,
     attempts=2, result persisté (« ✅ JOB ORPHELIN → requalifié puis exécuté »)
```
La propriété que `nohup` ne fournissait pas — la survie indépendante de la session
qui a déclenché l'opération — est démontrée par la reprise effective d'un orphelin.

### A.9 — Timeout d'un appel directeur-chat ✅ corrigé à la racine

**Corrections** (`src/app/api/directeur-chat/route.ts` + `src/lib/ai/zai-client.ts`) :
1. **Timeout explicite et documenté** : `DIRECTEUR_TIMEOUT_MS` = 150 s par défaut (env surchargeable), borné par schéma 5–180 s, surchargeable par appel (`timeoutMs` dans la requête) ; consigné dans la réponse (`data.timeoutMs`).
2. **Cause racine du 320 s découverte** : la voie par défaut (backend z.ai via SDK) n'exposait **aucun** timeout — seule la voie HTTP était bornée à 60 s. Correction : `withExplicitTimeout()` encadre désormais **toutes** les voies (SDK compris) ; option `maxRetriesPerProvider` pour un budget total prévisible.
3. **Relance automatique à prompt resserré** (une seule) en cas de dépassement : contexte de thèse tronqué à 8 000 car., historique plafonné aux 4 derniers messages (4 000 car. chacun), consigne de concision (~600 mots) — exactement le geste manuel qui avait débloqué le test. Traçée dans `data.retried` et les logs.

**Preuves post-correction** (conditions réelles) :
```
1. Appel nominal : 200 en 7 s — retried:false, timeoutMs:150000, réponse 1 708 caractères
2. Dépassement provoqué (timeoutMs:5000) :
   log : « [directeur-chat] Dépassement du timeout (5000 ms) — relance automatique
          unique à prompt resserré (120000 ms) »
   → 200 en 36 s — retried:true — réponse propre de 2 441 caractères,
     aucune erreur brute exposée
```

### A.10 — Arrêt du serveur de développement ✅ investigation menée, procédure documentée

**Investigation** (rapport complet : `docs/EXPLOITATION-SERVEUR.md`) :
- **Mémoire** : 4 Go, ~524 Mo utilisés au repos ; serveur au pic ~1,8 Go (44 %) sous la limite ; aucune trace OOM ; le serveur booté a tenu des heures à ce niveau.
- **Processus zombie** : arbre de boot sain, un unique `defunct` hérité du démarrage, sans conséquence.
- **Limite de connexions** : SQLite = fichier local, des dizaines de redémarrages/reconnexions le même jour sans épuisement.
- **Cause identifiée par reproduction contrôlée** : l'environnement d'exécution **tue les processus lancés hors de son arbre de boot** — reproduit plusieurs fois durant cette session de corrections (serveurs relancés via `nohup`/`setsid` tués à la frontière de session, dont une en cours de tâche), alors que le serveur parenté au boot du sandbox a fonctionné des heures sans incident. **Aucune cause applicative** dans ThesisFrame.
- Le log de l'incident initial (16/09) a tourné au reboot du conteneur — la reproduction contrôlée a tenu lieu de preuve, conformément à l'exigence d'investigation avant clôture.

**Mesure palliative assumée** : procédure de redémarrage documentée (`docs/EXPLOITATION-SERVEUR.md`) — vérification, libération du port, relance avec `DATABASE_URL` explicite, healthcheck `/api/stats` ; note de reprise : le worker de la file (A.8) repart au boot et récupère les jobs orphelins, donc **les opérations longues ne sont plus perdues par un arrêt**.

---

## Modifications du dépôt

**Code** :
- `src/app/api/theses-en-ligne/search/route.ts` (A.1), `src/modules/theses-en-ligne/theses-en-ligne-page.tsx` (A.1)
- `src/lib/research/academic-fallback.ts` (A.2, nouveau), `src/lib/research/deep-research-pipeline.ts` (A.2+A.3, nouveau — pipeline extrait de la route), `src/app/api/deep-research/route.ts` (wrapper mince)
- `src/lib/word-diff.ts` (A.4, nouveau), `src/app/api/chapters/[id]/route.ts` (A.4), `src/app/api/chapters/[id]/versions/route.ts` (A.4, nouveau), `src/modules/editor/components/chapter-history-dialog.tsx` (A.4, nouveau), `src/modules/editor/components/chapter-header.tsx` (A.4)
- `src/lib/osm-infra.ts` (A.7)
- `src/lib/jobs/queue.ts` + `src/lib/jobs/worker.ts` + `src/instrumentation.ts` + `src/app/api/jobs/…` (A.8, nouveaux)
- `src/lib/ai/zai-client.ts` + `src/app/api/directeur-chat/route.ts` (A.9)
- `prisma/schema.prisma` : tables `ChapterVersion` (A.4) et `Job` (A.8) — **additives, aucune donnée touchée** (poussées sur custom.db et urbanisme-test.db)

**Documentation** :
- `CONTEXT-PROJET.md` : § « Décisions d'architecture — corrections de l'annexe technique » (D-A.5, D-A.6, D-A.11, D-A.12)
- `docs/EXPLOITATION-SERVEUR.md` : investigation A.10 + procédure de redémarrage (nouveau)

**Qualité** : lint **0 erreur** (230 warnings, tous préexistants ou documentés — moins qu'avant la mission : 232) ; typecheck : aucune erreur dans les fichiers modifiés/créés (les erreurs tsc listées sont dans des fichiers de test préexistants, hors périmètre).

**Traçabilité** : toutes les corrections sont marquées en marge du code (« A.1 (annexe technique)… » → « A.9 (annexe technique)… ») pour l'audit.
