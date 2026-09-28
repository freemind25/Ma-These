# Notice d'utilisation — Ma Thèse

| | |
|---|---|
| **Produit** | Ma Thèse (ThesisFrame) — plateforme IA de rédaction de thèses et mémoires |
| **Version documentée** | 1.10.8 |
| **Date** | 19 septembre 2026 |
| **Audience** | Utilisateurs finaux : doctorants, étudiants de master, encadrants |
| **Complément** | Note de présentation : `docs/NOTE-PRESENTATION.md` · Guide intégré : icône **?** de l'en-tête |

---

## Table des matières

1. [Installation et premier lancement](#1-installation-et-premier-lancement)
2. [Découvrir l'interface](#2-découvrir-linterface)
3. [Configurer le fournisseur IA](#3-configurer-le-fournisseur-ia)
4. [Le parcours recommandé en 5 étapes](#4-le-parcours-recommandé-en-5-étapes)
5. [Guide des modules](#5-guide-des-modules)
6. [Bonnes pratiques](#6-bonnes-pratiques)
7. [Dépannage (FAQ)](#7-dépannage-faq)
8. [Glossaire](#8-glossaire)

---

## 1. Installation et premier lancement

### 1.1 Application de bureau (Windows 10/11 x64) — recommandé

1. Téléchargez `Ma.These_1.10.8_x64-setup.exe` depuis la page **Releases** du dépôt GitHub.
2. Exécutez l'installeur — **aucun droit administrateur n'est requis**.
3. Lancez **Ma Thèse** depuis le menu Démarrer ou le raccourci bureau.

Vos données (thèse, références, notes) sont enregistrées **localement** dans un fichier de base SQLite — elles restent sur votre machine.

### 1.2 Application web (développeurs / auto-hébergement)

```bash
bun install                                  # installer les dépendances
bun run dev                                  # serveur de développement → http://localhost:3000
```

> La base de données doit être initialisée avant le premier lancement : `bun run db:push` (Prisma/SQLite).

### 1.3 Premier lancement

Au premier démarrage, le **tableau de bord** affiche :
- vos **statistiques** (chapitres, références, mots rédigés, progression) ;
- les **actions rapides** (Créer une thèse, Assistant IA, Références, Carnet de recherche) ;
- le parcours de **démarrage en 5 étapes** avec barre de progression ;
- la section **Ressources pédagogiques** (infographies cliquables).

## 2. Découvrir l'interface

| Zone | Rôle |
|---|---|
| **Barre latérale gauche** | Navigation : 34 modules organisés en 7 catégories, avec **champ de recherche** (« Rechercher un module… ») pour retrouver un outil par son nom |
| **En-tête** | Fil d'Ariane (module courant), icône **?** (guide d'utilisation intégré), icône **engrenage** (paramètres : fournisseur IA, thème) |
| **Contenu central** | Zone de travail du module actif |
| **Pied de page** | Version de l'application et rappel du produit |

**Thème clair / sombre** : réglable dans les paramètres (engrenage), avec mode « système » qui suit votre Windows.

**Astuce** : la recherche de la barre latérale est le moyen le plus rapide d'ouvrir un module — tapez par exemple « grammaire » ou « SLR ».

## 3. Configurer le fournisseur IA

L'IA est au cœur de l'application (rédaction, vérifications, RAG). Ma Thèse supporte **22 fournisseurs**, dont 16 gratuits :

1. Ouvrez **Paramètres** (engrenage) → **Fournisseur IA**.
2. Choisissez un fournisseur :
   - **Z.ai (natif)** — fonctionne **sans clé API**, prêt à l'emploi ;
   - **Fournisseurs gratuits** — Google Gemini, Groq, Cerebras, OpenRouter, GitHub Models, NVIDIA NIM, Cohere, Cloudflare, HuggingFace, SiliconFlow, Pollinations, Kilo, Routeway, AINative, Aion, Requesty, SEA-LION ;
   - **Fournisseurs payants** — OpenAI (GPT-4o, o3-mini), Anthropic (Claude), Mistral AI, RoutesMe ;
   - **Personnalisé** — tout endpoint compatible OpenAI (votre infrastructure, un proxy local…).
3. Renseignez la clé API du fournisseur choisi (sauf Z.ai), puis testez la connexion.

**Circuit breaker** : si un fournisseur tombe en panne, l'application bascule automatiquement sur un fournisseur de repli — votre session d'écriture n'est pas interrompue.

> **Confidentialité** : vos clés sont stockées localement, jamais dans l'installateur. Les contenus envoyés à l'IA ne transitent que vers le fournisseur que vous avez choisi.

## 4. Le parcours recommandé en 5 étapes

Le tableau de bord suit votre progression sur ces 5 étapes :

### Étape 1 — Cadrer la thèse (module « Cadrage de thèse »)
Définissez le sujet, la problématique, les objectifs et le cadre préalable du projet de recherche. Ce cadrage alimentera les modules en aval (plan, hypothèses, vérifications).

### Étape 2 — Structurer le plan (module « Plan de thèse »)
Construisez parties et chapitres par glisser-déposer ; générez si besoin un **template LaTeX** personnalisé.

### Étape 3 — Rédiger les chapitres (module « Éditeur de thèse »)
Écrivez dans l'éditeur riche : **sauvegarde automatique**, compteur de mots en temps réel, réorganisation des chapitres, et **Mon IA de thèse** (RAG) pour interroger votre propre travail.

### Étape 4 — Gérer les références (module « Références »)
Importez depuis **Mendeley, Zotero, BibTeX, RIS, CSL-JSON**, ou ajoutez par **DOI / ISBN / URL** (récupération automatique des métadonnées). Export BibTeX disponible.

### Étape 5 — Réviser avec l'IA (module « Assistant IA »)
Utilisez les **21 modes d'écriture** : rédaction scientifique, revue de littérature, reformulation, résumé, traduction académique, calibration de style, vérification des citations… Le mode le mieux adapté à votre prompt est **suggéré automatiquement**.

## 5. Guide des modules

### 5.1 Principal

**Tableau de bord** — Vue d'ensemble : statistiques de progression, actions rapides, parcours en 5 étapes, ressources pédagogiques (infographies en plein format au clic).

**Éditeur de thèse** — Le cœur de l'écriture :
- structure en parties et chapitres avec **glisser-déposer** ;
- **auto-save** et compteur de mots en temps réel ;
- **RAG contextuel** : posez des questions sur votre thèse, l'IA répond en vous citant votre propre contenu ;
- recherche plein texte dans les chapitres.

### 5.2 Rédaction (7 modules)

| Module | À quoi il sert | Comment l'utiliser |
|---|---|---|
| **Assistant IA** (21 modes) | Rédaction assistée spécialisée | Choisissez un mode (ou laissez la suggestion automatique), collez votre contexte, ajustez le ton, générez puis révissez |
| **Mon IA de thèse** (RAG) | Interroger votre thèse | Posez vos questions en langage naturel ; l'IA s'appuie sur vos chapitres |
| **Harper** | Résumer, paraphraser, extraire | Collez un texte, choisissez l'action, obtenez une version condensée/reformulée |
| **Grammaire** | Correcteur académique IA | Soumettez un passage : orthographe, grammaire, style, ponctuation |
| **Phrasier académique** | Phrases prêtes à l'emploi | Sélectionnez la section (introduction, méthodo, discussion…) et piochez des formulations standard |
| **Déblocage écriture** | Vaincre la page blanche | Exercices guidés, minuteur **Pomodoro**, stratégies anti-blocage, suivi d'écriture quotidienne |
| **Auto-édition 8C** | Auto-évaluation qualité | Soumettez un chapitre à l'audit des **8 critères** et suivez les recommandations |

### 5.3 Structure & Planification (5 modules)

| Module | À quoi il sert |
|---|---|
| **Cadrage de thèse** | Formaliser sujet, problématique, objectifs, cadre préalable |
| **Plan de thèse** | Construire le plan (drag-and-drop) et générer un template **LaTeX** |
| **Feuille de route agile** | Organiser le travail en **Kanban**, sprints et user stories |
| **Boîte doctorale** | Checklist doctorale, calendrier, documents administratifs |
| **Équilibre chapitres** (IA) | Analyser la répartition du volume entre chapitres et recevoir des recommandations d'équilibrage |

### 5.4 Recherche & Sources (10 modules)

| Module | À quoi il sert |
|---|---|
| **Références** | Bibliothèque bibliographique : import BibTeX/RIS/CSL-JSON, Mendeley, Zotero, EndNote ; ajout par DOI/ISBN/URL ; export BibTeX |
| **Articles scientifiques** | Rédiger un article : guide **IMRaD**, checklist de soumission, boîte à outils |
| **Bases de données** | Accès à **27 ressources académiques** (HAL, Google Scholar, Persée, CAIRN…) |
| **Journaux OA** | Recherche OpenAlex + DOAJ, export CSV |
| **Thèses en ligne** | Explorer les thèses via **HAL** et sources associées |
| **Explorateur Thèses** | Rechercher dans les thèses françaises (API officielle **theses.fr**) |
| **Veille académique** | Suivre vos requêtes **HAL + arXiv** et être alerté des nouveaux résultats |
| **Recherche plein texte** | Chercher dans le contenu de vos chapitres |
| **Onglet Recherche** | Navigation par onglets pour organiser plusieurs recherches |
| **Bibliothèque** | Trouver des livres sur **7 sources gratuites** |

### 5.5 Méthodologie & Vérification (10 modules)

| Module | À quoi il sert |
|---|---|
| **Méthodologie** | Guides (paradigmes, démarche, collecte) + checklist méthodologique |
| **Analyse du champ** (IA) | Cartographie du champ de recherche : lacunes, positionnement |
| **Outils SLR** | Revue systématique : diagramme **PRISMA**, criblage, extraction de données |
| **Vérification méthodologique** (IA) | Audit de cohérence de la démarche |
| **Vérification cartographique** (IA) | Complétude spatiale + **questionneur socratique** |
| **Vérification Citations** | Contrôler les références contre **5 registres académiques** |
| **Génération d'hypothèses** (IA) | Formuler des hypothèses testables, pré-enregistrer la recherche |
| **Vérification de cohérence** (IA) | Contrôle de cohérence interne de la thèse (« sceau de vérité ») |
| **Alignement preuves** (IA) | Cohérence citations ↔ références, chapitre par chapitre |
| **Expérimentations** | Journal d'expérimentations : hypothèses, exécutions, preuves, verdicts |

### 5.6 IA & Outils (8 modules)

| Module | À quoi il sert |
|---|---|
| **Outils IA** | Carnet de recherche (sources et notes), **consensus multi-sources**, visualisation |
| **APInex Playground** | Chat multi-modèles (OpenAI, Claude, Gemini…) + recherche web |
| **RoutesMe** | **Comparaison** des réponses de plusieurs modèles IA côte à côte |
| **Article → Code** (IA) | Transformer un article scientifique en **code Python reproductible** |
| **Diagrammes** | Diagrammes visuels : organigramme, chronologie, flux |
| **APA Composer** | Mise en forme **APA 7ᵉ édition** |
| **Livres-compétences** | Suivi et développement des compétences doctorales |
| **Traducteur** | Traduction automatique open source (LibreTranslate) |

### 5.7 Export (2 modules)

| Module | À quoi il sert |
|---|---|
| **Export PDF** | Générer un PDF de la thèse avec mise en forme professionnelle |
| **Export DOCX** | Générer un document **Word** formaté : styles APA, table des matières |

## 6. Bonnes pratiques

1. **Commencez par le cadrage** : les modules de vérification s'appuient sur un cadrage clair.
2. **Sauvegardez votre fichier de base** (`db/*.db`) régulièrement (copie externe, clé USB, cloud personnel) — c'est votre seul patrimoine de données.
3. **Faites vérifier tôt et souvent** : lancez « Vérification de cohérence » et « Alignement preuves » après chaque chapitre, pas seulement à la fin.
4. **Utilisez le Phrasier et l'Auto-édition 8C** avant de soumettre un chapitre à votre directeur.
5. **Activez la veille académique** dès le début de la thèse pour ne rien manquer dans votre champ.
6. **Comparez les modèles** (RoutesMe) sur les passages critiques : les IA diffèrent sensiblement en style académique.

## 7. Dépannage (FAQ)

| Problème | Solution |
|---|---|
| L'IA ne répond pas | Vérifiez le fournisseur dans ⚙️ Paramètres → Fournisseur IA ; le **circuit breaker** bascule normalement tout seul — sinon changez de fournisseur (16 gratuits disponibles) |
| Quota IA épuisé | Choisissez un fournisseur gratuit (Gemini, Groq, Cerebras…) ou renseignez votre propre clé |
| Une recherche académique échoue | Certaines API publiques (ex. Overpass) peuvent être momentanément inaccessibles ; réessayez — les autres sources restent utilisables |
| Ma thèse a disparu | La base est locale : vérifiez que vous utilisez la même machine/profil ; restaurez votre sauvegarde de `db/*.db` |
| Thème illisible | ⚙️ Paramètres → thème (clair / sombre / système) |
| Bug ou comportement anormal | Consultez le guide intégré (**?**) ; signalez via le dépôt GitHub (Issues) |

## 8. Glossaire

| Terme | Définition |
|---|---|
| **RAG** | *Retrieval-Augmented Generation* : l'IA répond en s'appuyant sur le contenu de *votre* thèse |
| **SLR** | *Systematic Literature Review* : revue de littérature systématique (protocole PRISMA) |
| **Circuit breaker** | Mécanisme de bascule automatique entre fournisseurs IA en cas de panne |
| **IMRaD** | Structure d'article : Introduction, Methods, Results and Discussion |
| **OA** | *Open Access* : publications en accès libre (OpenAlex, DOAJ) |
| **BibTeX / RIS / CSL-JSON** | Formats d'échange de références bibliographiques |
| **Pomodoro** | Technique de travail par périodes chronométrées (25 min / 5 min) |
