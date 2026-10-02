# Notice d'utilisation — Ma Thèse

| | |
|---|---|
| **Produit** | Ma Thèse (ThesisFrame) — plateforme IA de rédaction de thèses et mémoires |
| **Version documentée** | 1.10.8 |
| **Date** | 28 septembre 2026 |
| **Audience** | Utilisateurs finaux : doctorants, étudiants de master, encadrants |
| **Compléments** | Note de présentation : `docs/NOTE-PRESENTATION.md` · Guide intégré : menu **?** de l'en-tête |
| **Méthode** | Document rédigé d'après le code source de l'application — les libellés entre guillemets sont ceux affichés à l'écran |

> Cette notice décrit **les 44 modules de l'application, un par un**, avec leur usage pas à pas. Utilisez la table des matières ci-dessous pour naviguer ; dans l'application, la recherche de la barre latérale reste le moyen le plus rapide d'ouvrir un module.

---

## Table des matières

1. [Installation et premier lancement](#1-installation-et-premier-lancement)
2. [Découvrir l'interface](#2-découvrir-linterface)
3. [Configurer le fournisseur IA](#3-configurer-le-fournisseur-ia)
4. [Créer et structurer votre thèse](#4-créer-et-structurer-votre-thèse)
5. [Rédiger avec l'IA](#5-rédiger-avec-lia)
6. [Recherche et sources](#6-recherche-et-sources)
7. [Méthodologie et vérification](#7-méthodologie-et-vérification)
8. [IA et outils complémentaires](#8-ia-et-outils-complémentaires)
9. [Exporter votre thèse](#9-exporter-votre-thèse)
10. [Vos données : persistance, sauvegarde, confidentialité](#10-vos-données--persistance-sauvegarde-confidentialité)
11. [Bonnes pratiques](#11-bonnes-pratiques)
12. [Dépannage (FAQ)](#12-dépannage-faq)
13. [Glossaire](#13-glossaire)

---

## 1. Installation et premier lancement

### 1.1 Application de bureau (Windows 10/11 x64) — recommandé

1. Téléchargez `Ma.These_1.10.8_x64-setup.exe` depuis la page **Releases** du dépôt GitHub.
2. Exécutez l'installeur — **aucun droit administrateur n'est requis**.
3. Lancez **Ma Thèse** depuis le menu Démarrer ou le raccourci bureau.

Vos données (thèses, chapitres, références, notes) sont enregistrées **localement** dans une base SQLite : elles restent sur votre machine (voir §10).

### 1.2 Application web (développeurs / auto-hébergement)

```bash
bun install        # installer les dépendances
bun run db:push    # initialiser la base Prisma/SQLite (première fois uniquement)
bun run dev        # serveur de développement → http://localhost:3000
```

### 1.3 Premier lancement

Au premier démarrage, le **Tableau de bord** affiche :

- le bandeau d'accueil « Bienvenue sur Ma Thèse » (compatible **Mendeley**, **Zotero**, **EndNote**) ;
- **4 statistiques** : « Chapitres », « Références », « Mots rédigés », « Progression » — alimentées automatiquement dès que vous travaillez ;
- **« Actions rapides »** — 4 boutons : « Créer une thèse », « Assistant IA », « Références », « Carnet de recherche » ;
- **« Démarrage rapide »** — le parcours en 5 étapes avec barre « Progression — N / 5 étapes » (chaque étape se coche automatiquement dès que l'action correspondante existe : thèse créée, chapitre planifié, mots rédigés, références importées, chapitre terminé) ;
- **« Modules disponibles »** — 14 cartes d'accès direct ;
- **« Ressources pédagogiques »** — 2 infographies doctorales cliquables (« Bien choisir son directeur de thèse », « Article de recherche vs article de revue »), ouvertes en plein format au clic.

> Le parcours conseillé est détaillé au §4. Règle d'or : **créez d'abord votre thèse** dans l'Éditeur — la plupart des modules (Cadrage, RAG, Exports, Feuille de route, Onglet Recherche…) s'attachent à la thèse active.

---

## 2. Découvrir l'interface

| Zone | Rôle |
|---|---|
| **Barre latérale gauche** | Navigation : **44 modules** organisés en **7 catégories** (Principal, Rédaction, Structure & Planification, Recherche & Sources, Méthodologie & Vérification, IA & Outils, Export), avec **champ de recherche** « Rechercher un module… » filtrant sur les noms et descriptions |
| **En-tête** | Bouton d'ouverture/fermeture de la barre latérale (Ctrl+B), fil d'Ariane « Ma Thèse › module courant », menu **Aide** (?), menu **Paramètres** (engrenage) |
| **Contenu central** | Zone de travail du module actif |
| **Pied de page** | Logo, version et rappel du produit |
| **Bandeau de transparence** | Affiché uniquement quand vous utilisez un fournisseur IA autre que Z.ai (voir §3.4) |

### 2.1 Menu Aide (?)

Trois entrées : « Guide d'utilisation » (guide intégré searchable en 8 catégories), « Raccourcis clavier », « À propos de Ma Thèse ».

### 2.2 Menu Paramètres (engrenage)

Deux entrées : « Fournisseur IA » (avec le badge du fournisseur actif, ex. « ZAI ») et « GitHub » (ouvre le dépôt du projet).

### 2.3 Thème clair / sombre

Bouton en **bas de la barre latérale** : bascule « Mode clair » / « Mode sombre ». Le thème par défaut suit votre système.

### 2.4 Badges de la barre latérale

Certaines entrées portent un badge : **IA** (fonction IA intégrée), **RAG** (interrogation de votre propre thèse), **API** (appelle une API externe), **OA** (Open Access). Les 6 catégories (hors « Principal ») sont **repliables**.

### 2.5 Raccourcis clavier

| Raccourci | Action |
|---|---|
| **Ctrl+B** | Ouvrir/fermer la barre latérale (et **gras** dans l'éditeur) |
| **Alt+←** / **Alt+→** | Module précédent / suivant |
| **Ctrl+S** | Sauvegarder (éditeur) |
| **Ctrl+Shift+S** | Sauvegarder sous… (éditeur) |
| **Ctrl+I**, **Ctrl+U** | Italique, souligné (éditeur) |
| **Tab** / **Échap** | Accepter / ignorer la prédiction IA de l'éditeur |
| **Entrée** | Envoyer (chats) · valider (renommages inline) · traduire avec Ctrl+Entrée (Traducteur) |
| **Maj+Entrée** | Saut de ligne dans les chats |
| **M** | « Tout marquer comme vu » dans le détail d'une veille |

**Astuce** : la recherche de la barre latérale est le moyen le plus rapide d'ouvrir un module — tapez par exemple « grammaire », « PRISMA » ou « veille ».

---

## 3. Configurer le fournisseur IA

L'IA est au cœur de l'application (rédaction, vérifications, RAG, prédictions). Menu **Paramètres** (engrenage) → « Fournisseur IA ».

### 3.1 Les 26 fournisseurs supportés (dont 22 gratuits)

| Catégorie affichée | Fournisseurs |
|---|---|
| **« SDK Natif »** | **Z.ai** — intégré, **aucune clé à saisir**, prêt à l'emploi (défaut) |
| **« Premium »** (clé requise) | OpenAI, Anthropic (Claude), Mistral AI, RoutesMe (multi-modèles, offre gratuite « GLM 5.2-Free, 2 000 tokens/jour »), KiraAI (7 modèles gratuits + payants) |
| **« Gratuit »** (tier gratuit) | Google Gemini, Groq, Cerebras, GitHub Models, Cloudflare Workers AI, HuggingFace Router, NVIDIA NIM, Cohere, SiliconFlow |
| **« Agrégateurs gratuits »** | OpenRouter, Pollinations, Kilo, Routeway, AINative Studio, Aion Labs, Requesty, SEA-LION, TokenRouter |
| **« Gateway »** | OmniRoute — passerelle IA auto-hébergée (352 fournisseurs, failover, `npx omniroute`) |
| **« Personnalisé »** | Tout endpoint compatible OpenAI (votre infrastructure, proxy local…) — champ « URL de base » requis |

### 3.2 Procédure de configuration

1. Dans le dialogue « Fournisseur IA », choisissez le fournisseur dans la liste groupée par catégorie.
2. Renseignez la « Clé API » (masquable). Pour **Z.ai**, l'encadré vert indique « Aucune clé à saisir. Le serveur utilisera automatiquement la clé intégrée. »
3. Choisissez le « Modèle » : la liste se charge automatiquement après saisie de la clé (badge **FREE** sur les modèles gratuits, bouton ↻ pour rafraîchir).
4. Cliquez **« Tester »** → « Connecté ! » confirme la connexion.
5. Cliquez **« Sauvegarder »** → toast « Fournisseur IA : {nom} ».

> Un fournisseur gratuit est la configuration la plus courante : Google Gemini ou Groq offrent des tiers généreux. Les fournisseurs marqués « sans clé » (Pollinations, Kilo) nécessitent désormais un compte gratuit chez leur éditeur.

### 3.3 Circuit breaker

Si un fournisseur tombe en panne (erreurs 429/5xx), l'application réessaie puis **bascule automatiquement** sur un fournisseur de repli : votre session d'écriture n'est pas interrompue. Les erreurs d'authentification (401/403) s'affichent immédiatement — corrigez la clé.

### 3.4 Confidentialité

- La clé API est stockée **côté serveur dans un cookie sécurisé** (httpOnly) — jamais dans le navigateur, jamais dans l'installateur.
- Le **bandeau de transparence** en haut de page vous informe quand un fournisseur externe est actif : « Vos textes sont envoyés à {fournisseur} pour traitement. Votre clé API est stockée côté serveur (cookie sécurisé). Aucune sauvegarde de vos contenus par ThesisFrame. » Il se ferme (✕) et reste masqué.
- En mode bureau (Tauri) avec le fournisseur Z.ai, l'application bascule automatiquement sur Mistral pour garantir un service opérationnel hors environnement cloud.

---

## 4. Créer et structurer votre thèse

### 4.1 Créer une thèse — Éditeur de thèse

Ouvrez **Éditeur de thèse** (catégorie Principal). Sans thèse active, le panneau « Mes thèses » s'affiche.

1. Cliquez **« Nouvelle thèse »**.
2. Dans le dialogue « Créer une nouvelle thèse », remplissez : **« Titre de la thèse »*** et **« Auteur / Doctorant »*** (obligatoires), puis optionnellement « Sous-titre », « Institution », « Discipline », « Email », « Laboratoire », « Directeur / Directrice de thèse ». Ces informations alimentent la page de couverture des exports.
3. Cliquez **« Créer la thèse »**.

La carte de la thèse affiche ensuite : titre, auteur, « N chapitres », total de mots, badge de statut (« Brouillon » / « En cours » / « Révision » / « Terminée ») et barre de progression. L'icône corbeille supprime une thèse (définitif).

### 4.2 Éditeur de thèse — le cœur de l'écriture

Trois zones : **onglets de chapitres**, **en-tête de chapitre**, **éditeur riche**.

**Gérer les chapitres**

- Bouton **« + »** : crée « Chapitre N » (numérotation romaine I., II., III.… jusqu'à XX).
- Onglet de chapitre : numéro, titre, compteur de mots, icône de statut.
- En-tête de chapitre : **titre éditable en cliquant** (Entrée = valider, Échap = annuler) ; compteur « N mots » ; **statut** au choix parmi « Non commencé », « En cours », « Brouillon », « En révision », « Terminé » ; boutons **↑ / ↓** pour réordonner ; corbeille pour supprimer.

**Écrire**

- Éditeur riche (TipTap) avec barre d'outils : Annuler/Refaire, « Titre 1/2/3 », Gras/Italique/Souligné/Barré, « Code en ligne », Alignements (gauche, centre, droite, justifier), listes à puces et numérotées, « Citation », séparateur, « Surligner », « Lien », et bascule **« Prédiction IA (Tab pour accepter) »**.
- **Sauvegarde automatique** : 2,5 s après la dernière frappe ; indicateur « Sauvegardé » / « Sauvegarde... » / « Erreur » dans la barre d'état ; bouton « Sauvegarder » pour forcer ; avertissement si vous fermez l'onglet avec des modifications non enregistrées.
- Compteurs temps réel « N mots » / « N caractères ».

**Prédiction IA (ghost text)**

- Après une pause de frappe d'une seconde (≥ 15 caractères), une suggestion grisée apparaît : **Tab** pour l'accepter, **Échap** pour l'ignorer, popup cliquable pour voir jusqu'à 2 alternatives.

**Historique et comparaison de versions**

1. Cliquez **« Historique »** dans l'en-tête du chapitre.
2. Chaque sauvegarde qui **modifie** le contenu crée une version (libellée « jj/mm/aaaa hh:mm — N mots »).
3. Sélectionnez une « Version récente (après) » et une « Version ancienne (avant) » : le **diff mot à mot** s'affiche (ajouts en vert, suppressions en rouge barré) avec badges « +N mots » / « −N mots ».

### 4.3 Cadrage de thèse — les 12 champs fondateurs

Module **Cadrage de thèse**. Sélectionnez la thèse si vous en avez plusieurs, puis **« Créer le cadrage »**.

**Les 12 champs** : « Thématique générale », « Problématique », « Question(s) de recherche », « Objectifs », « Hypothèses (si applicable) », « Type de recherche », « Méthodologie envisagée », « Type de revue de littérature », « Cadre théorique / conceptuel », « Mots-clés », « Contribution attendue / originalité », « Type de thèse / contraintes institutionnelles ».

**3 onglets** :

1. **« Cadrage »** — remplissez chaque champ puis **« Sauvegarder »** (sauvegarde champ par champ, badge « Non sauvegardé » sinon). Options par champ : bouton verrou **« Verrouiller »** (champ figé), et si une **« Générer un premier jet IA »** a été lancée, chaque proposition s'affiche en encadré ambre « Proposition IA : » avec boutons « Accepter » / « Ignorer ». Bouton **« Valider ce cadrage »** (désactivé sous 25 % de remplissage) : crée un instantané versionné.
2. **« Vérification »** — **« Lancer la vérification de cohérence »** (minimum 3 champs remplis) : l'IA analyse 6 axes (alignement problématique↔questions, objectifs↔méthodologie, cadre théorique↔thématique, clarté des hypothèses, type de recherche↔méthodologie, cohérence globale) et formule des remarques — sans jamais corriger à votre place.
3. **« Historique »** — chaque validation crée un instantané consultable champ par champ (« Version du {date} »).

### 4.4 Plan de thèse

Module **Plan de thèse** — deux colonnes.

**Colonne « Structure actuelle »** : choisissez le mode **« Par chapitres »** ou **« Par parties »**.

- *Par chapitres* : liste des chapitres avec statut, progression et compte de mots.
- *Par parties* : créez des parties (« Titre de la nouvelle partie… » + « Ajouter »), renommez-les (crayon), réordonnez-les (**boutons fléchés ↑/↓**), rattachez/détachez des chapitres, créez un chapitre directement dans une partie (« Ajouter un chapitre »).

**Colonne « Générateur de template »** — produisez un squelette **LaTeX** complet :

1. Choisissez la « Discipline » (8 valeurs : Lettres et Sciences Humaines, Sciences Exactes, Sciences et Techniques du Génie, Sciences de la Vie et de la Terre, Droit et Sciences Politiques, Sciences Économiques et de Gestion, Informatique, Sciences de la Santé).
2. Choisissez le « Nombre de chapitres » (1 à 15) et le « Mode de structure » (« Classique » / « Par parties »).
3. **« Générer le template »** → classe `these`, A4 12 pt, babel french, page de garde, Résumé/Abstract, table des matières, chapitres titrés automatiquement (Introduction Générale, Revue de Littérature…), bibliographie natbib, annexes.
4. **« Copier »** → collez le résultat dans votre éditeur LaTeX.

### 4.5 Équilibre chapitres

Module **Équilibre chapitres** (badge IA) — analyse la répartition du volume :

- **Jauge « Équilibre »** en % : Excellent ≥ 90, Bon ≥ 80, Moyen ≥ 60, Déséquilibré ≥ 40, Très déséquilibré < 40.
- **« Comparaison visuelle des chapitres »** : barres proportionnelles avec marqueur d'objectif ; icône crayon pour fixer un « Objectif en mots » par chapitre (suivi « X/Y mots (Z %) »).
- **« Détail par chapitre et objectifs »** : écart par rapport à la moyenne (marqué « OK » si ≤ 10 %).
- **« Calculateur de rythme d'écriture »** : saisissez la « Date limite de la thèse » → « Jours restants », « Mots / jour » requis, badge « Réaliste » (≤ 2 000 mots/jour) ou « Intense ».
- **« Recommandations IA »** : « Générer les recommandations » → diagnostic, objectifs suggérés, priorités et plan de rythme sur 3 mois.

### 4.6 Feuille de Route Agile

Module **Feuille de Route Agile** — organisez la thèse en sprints :

1. **« Nouveau sprint »** : titre (ex. « Sprint 3 — Rédaction chapitre 2 »), « Phase de thèse » parmi « Cadrage », « Revue », « Rédaction », « Révision », « Finalisation », description optionnelle.
2. **« Nouvelle story »** : titre, description, « Priorité » (« Critique », « Haute », « Moyenne », « Basse »), « Story points » (0–100).
3. Onglet **« Tableau Kanban »** : déplacez les stories entre les 4 colonnes « À faire », « En cours », « En revue », « Terminé » (boutons fléchés sur chaque carte) ; statut persisté en base.
4. Onglet **« Statistiques »** : progression globale, répartition par priorité, phase active expliquée.
5. **« Générer le prochain sprint »** (IA) : propose 4 à 6 stories à partir de la phase et des stories existantes.

---

## 5. Rédiger avec l'IA

### 5.1 Assistant IA — les 26 modes d'écriture

Module **Assistant IA** (onglets « Modes d'écriture » et « Chat Directeur »).

**Flux standard** : sélectionnez un mode → collez votre contexte dans la zone de saisie (placeholder spécifique à chaque mode) → **« Générer »** → la réponse s'affiche **en streaming** (bouton « Arrêter » pour interrompre) → **« Copier »** pour récupérer le texte.

**Les 26 modes** :

| Mode | Usage |
|---|---|
| « Rédaction scientifique » | Rédiger un passage académique à partir d'un sujet |
| « Revue de littérature » | Synthétiser des travaux sur un thème |
| « Relecture critique » | Critique constructrice d'un texte collé |
| « Paraphrase académique » | Reformuler en conservant le sens |
| « Rédaction de résumé » | Résumé structuré (contexte, méthode, résultats, conclusion) |
| « Génération d'hypothèses » | Hypothèses depuis un cadre théorique |
| « Aide méthodologique » | Conseils selon l'objet de recherche |
| « Construction théorique » | Mobiliser concepts et théories |
| « Documents de supervision » | Documents destinés au directeur |
| « Correcteur grammatical » | Correction orthographe/grammaire/style |
| « Préparation soutenance » | Préparer la défense orale |
| « Harper — Traitement de texte » | Résumer/paraphraser/extraire (voir §5.3) |
| « Reformulation académique » | Réécrire un texte ou une référence |
| « Déblocage de l'écriture » | Stratégies contre la page blanche |
| « Plan de révision » | Exploiter les commentaires des relecteurs |
| « Génération libre IA » | Tout autre besoin |
| « Amélioration et recommandations » | Plan d'amélioration de votre situation |
| « Revue de littérature (SLR) » | Approche systématique |
| « Auto-édition 8C » | Audit selon les 8 critères (voir §5.7) |
| « Expliquer un concept » | Comprendre un concept méthodologique |
| « Vérification de sources » | Évaluer si des sources soutiennent des affirmations |
| « Argumentation bilatérale » | Pour et contre d'une affirmation |
| « Problématique de recherche » | Affiner votre problématique |
| « Démarche empirique » | Concevoir l'empirie (terrain, données) |
| « Interprétation de résultats » | Interpréter tableaux, statistiques, entretiens |
| « Recherche approfondie » | **Mode spécial** : rapport documenté avec sources — choisissez la source « Web » ou « Académique (OpenAlex) » (jusqu'à 2 passes de continuation automatiques si la réponse est tronquée) |

Le mode **« Chat Directeur »** simule votre direction de thèse (« Pr. Jean-Marc Renaud — Simulateur de direction de thèse ») : le contexte (titre, auteur, directeur, institution, discipline, liste des chapitres) est envoyé automatiquement. Entrée envoie, Maj+Entrée saute une ligne ; pendant le calcul : « Le professeur réfléchit... ».

> Les conversations ne sont pas persistées : **copiez** les résultats utiles dans vos chapitres.

### 5.2 Mon IA de thèse (RAG)

Module **Mon IA de thèse** (badge RAG) — interrogez **votre propre travail** :

1. Sélectionnez une thèse (avertissement « Aucune thèse sélectionnée » sinon).
2. Cliquez **« Indexer ma thèse »** → toast « Indexation terminée : N chunks créés » ; la barre affiche « N chunks indexés (N chapitres, N références, N notes, N cadrages) ». Réindexez après des modifications importantes.
3. Posez votre question — 5 suggestions cliquables sont proposées (« Quels sont les principaux thèmes de ma thèse ? », « Quelles lacunes identifiez-vous ? »…).
4. La réponse, en Markdown, cite ses sources avec **badges colorés** : « Chapitre » (vert), « Réf. » (bleu), « Note » (ambre), « Cadrage » (violet).

### 5.3 Harper — Résumeur & Paraphraseur

Module **Harper** (badge IA). Collez un texte (minimum 20 caractères) puis choisissez l'un des **6 onglets** :

| Onglet | Action | Options |
|---|---|---|
| « Résumer » | Résumé concis | « Longueur : » « Court (~100 mots) » / « Moyen (~250 mots) » / « Détaillé (~500 mots) » |
| « Paraphraser » | Réécriture | « Style : » « Académique formel » / « Vulgarisé » / « Résumé exécutif » / « Citation » |
| « Points clés » | Extraction d'arguments | liste numérotée (max 10) |
| « Abstract » | Abstract 150–300 mots | 3ᵉ personne, structure standard |
| « Mots-clés » | Concepts clés | max 15, avec catégorie et définition |
| « Comparaison » | Original ↔ résumé côte à côte | badge de réduction |

Chaque résultat se copie (« Copier ») ; l'« Historique récent » conserve les **5 dernières opérations** et les restaure au clic (mémoire de session).

### 5.4 Grammaire — correcteur académique

Module **Grammaire** (badge IA). Collez votre texte (≥ 5 mots) et lancez **« Analyser le texte »** :

- **4 statistiques** : « Mots », « Phrases », « Erreurs », « Lisibilité » (score /100 : « Excellent » ≥ 70 → « Difficile ») ;
- détail « Orthographe / Grammaire / Style / Ponctuation » ;
- **3 onglets de résultats** : « Erreurs détectées » (cartes dépliables : original → correction + suggestion), « Texte corrigé » (bouton « Copier le texte »), « Conseils académiques » (16 conseils de formulation, structure, style, ponctuation) ;
- deux textes d'exemple fautifs sont fournis (« Introduction de thèse », « Méthodologie ») pour tester.

### 5.5 Phrasier Académique — 101 phrases prêtes à l'emploi

Module **Phrasier Académique** — banque francisée inspirée du Manchester Academic Phrasebank (« 101 phrases · 7 sections · 10 fonctions ») :

1. Filtrez par **section** (« Introduction », « Revue de littérature », « Problématique », « Méthodologie », « Résultats », « Discussion », « Conclusion ») et/ou par **fonction** (« Ouvrir », « Argumenter », « Citer », « Nuancer », « Transitionner », « Conclure », « Comparer », « Définir », « Exemplifier », « Structurer »), ou recherchez un texte (« ces résultats », « en revanche »…).
2. Cliquez sur une phrase → **copiée dans le presse-papiers** (toast « Phrase copiée dans le presse-papiers ») ; collez-la dans l'éditeur et remplacez les éléments entre accolades {X}.
3. Dépliez la carte pour l'« Exemple d'utilisation » et le « Registre : » (Formel / Classique / Neutre).

### 5.6 Déblocage écriture

Module **Déblocage écriture** — 4 onglets :

- **« Diagnostic »** : cochez vos blocages parmi 8 (« Page blanche », « Syndrome de l'imposteur », « Perfectionnisme paralysant », « Manque de motivation », « Surcharge d'informations », « Procrastination », « Doute sur la contribution », « Fatigue intellectuelle ») puis **« Obtenir des stratégies IA »** → 5 stratégies concrètes par blocage.
- **« Exercices »** : « Écriture libre chronométrée » (5/10/15 min, compteur de mots), « Phrases d'amorce » (IA), « Brainstorm textuel » (idées reliées à une idée centrale).
- **« Suivi »** : objectif quotidien de mots, statistiques (jours actifs, série, graphe 7 jours), historique. *(Session uniquement.)*
- **« Pomodoro »** : cycles 25 min / 5 min, anneau de progression, objectif « 4 sessions » par jour.

### 5.7 Auto-édition 8C

Module **Auto-édition 8C** (badge IA) — d'après Gastel & Day. **4 onglets** :

1. **« Analyse IA »** — collez votre texte (20 à 50 000 caractères) puis **« Analyser les 8C »** : l'IA évalue parallèlement **« Conformité », « Exhaustivité », « Composition », « Exactitude », « Clarté », « Cohérence », « Concision », « Courtoisie »** (badge « Valeur ajoutée unique »). Score global /100 (« Excellent » ≥ 75, « À améliorer » ≥ 50, « Critique » < 50), rapport détaillé par critère, historique des 5 dernières analyses.
   Sous-section **« Vérifications publication »** (3 outils) : « Cohérence intro / discussion » (questions orphelines, résultats orphelins, structure en entonnoir), « Qualité d'un tableau » (le tableau vaut-il une phrase ?), « Redondance texte / tableau ».
2. **« Checklist 8C »** — diagnostic manuel : 27 items cochables répartis sur les 8 critères (« N/27 »).
3. **« Checklist article »** — 7 points de contrôle de soumission (titre, résumé, introduction, méthode reproductible, ordre des résultats, discussion, auteurs).
4. **« Langue seconde »** — analyse de la structure des paragraphes : chaque paragraphe s'ouvre-t-il sur une phrase d'ancrage directe ? (min. 50 caractères).

### 5.8 Brouillon de chapitre — un premier jet structuré, chapitre par chapitre

Module **Brouillon de chapitre** (badge IA, catégorie Rédaction). Là où l'Assistant IA assiste à l'échelle d'un passage, ce module produit un premier jet **d'un chapitre entier** : introduction du chapitre, sections de développement avec sous-titres, conclusion. Le brouillon est ancré dans le titre du chapitre, le cadrage actif et les titres des autres chapitres de votre thèse. Les citations proviennent **uniquement des références que vous avez choisies** dans votre bibliothèque, au format « (Auteur, année) » ; sans sélection, aucune citation n'est produite — aucune référence inventée.

**Flux pas à pas :**

1. Ouvrez **« Brouillon de chapitre »** (catégorie Rédaction). Sans thèse active ou sans chapitre, un état vide clair s'affiche (créez/sélectionnez la thèse ou ajoutez des chapitres d'abord) — aucun appel IA n'est lancé.
2. **« Chapitre cible »** : choisissez le chapitre dans le menu déroulant (le total de mots actuel du chapitre est rappelé le cas échéant).
3. **« Longueur cible (mots) »** : préremplie avec l'objectif du chapitre s'il est défini et ≥ 500 mots, sinon 2 000 ; modifiable de 300 à 8 000.
4. **« Références autorisées (0/20) »** : recherchez par titre, auteur ou année, puis cochez jusqu'à **20 références** de votre bibliothèque (liste déroulante avec défilement). Ce sont les seules références citables du brouillon.
5. **« Générer le brouillon »** : le texte s'écrit en direct dans l'aperçu ; **« Arrêter »** interrompt à tout moment (le brouillon partiel reste affiché et copiable).
6. Vérifiez l'aperçu mis en forme (introduction, sections, conclusion) et le compteur **« X mots / cible Y »** ; les références sélectionnées restent rappelées sous l'aperçu.
7. **« Copier »** place le brouillon dans le presse-papiers, ou **« Insérer dans le chapitre »** : une confirmation explicite rappelle que « Le contenu actuel du chapitre sera remplacé. Une version est automatiquement sauvegardée dans l'historique du chapitre. » — confirmez par **« Remplacer le contenu »**.
8. Après insertion : le chapitre reflète le nouveau contenu (compteur de mots recalculé à l'identique de l'éditeur) et l'état antérieur reste consultable dans l'**historique de versions** du chapitre depuis l'éditeur de thèse.

**Persistance :** le brouillon lui-même vit en mémoire de session (copiez-le avant de quitter le module) ; le contenu inséré est enregistré en base avec l'état antérieur versionné automatiquement par l'historique natif du chapitre.

---

## 6. Recherche et sources

### 6.1 Références — bibliothèque bibliographique

Module **Références**. Boutons d'en-tête : « Export BibTeX », « Importer », « Ajouter ».

**Importer** (dialogue « Importer des références ») :

1. Choisissez le « Format du fichier » : « Auto-détection », « BibTeX (.bib) », « RIS (.ris) », « CSL-JSON (.json) ».
2. Glissez-déposez le fichier (ou cliquez pour parcourir). Un aperçu des 500 premiers caractères s'affiche.
3. **« Importer »** → résultat « Import terminé » : « Total / Importées / Ignorées » + « Format détecté ».
4. L'aide intégrée rappelle la marche à suivre depuis Mendeley (« File → Export → Format BibTeX ou RIS »), Zotero (« File → Export Library ») et EndNote (« File → Export → Format RIS »).
5. Limites : 10 Mo et **500 références par import** ; les entrées sans titre sont ignorées.

**Ajouter manuellement** : « Type », « Auteurs » (séparés par ;), « Titre », « Année », « Journal / Éditeur », « DOI », « Mots-clés » (séparés par ,), « Notes » — 55 types disponibles via le filtre (« Article (journal) », « Livre », « Thèse de doctorat », « Mémoire de master », « Page web »…).

**Tableau** : favoris (étoile), filtres « Tous les types » / « Toutes les sources » (Mendeley, Zotero, BibTeX, RIS, CSL-JSON, Manuel), recherche plein texte.

**Exporter** : « Export BibTeX » télécharge `references.bib` (tri auteurs/année) — prêt pour LaTeX/Zotero.

### 6.2 Bases de données — arXiv en direct + annuaire de 27 ressources

Module **Bases de données**, deux parties :

**a) Recherche arXiv en direct** (prépublications Open Access) :

1. Saisissez la requête (astuce : « mettez une expression entre guillemets pour une recherche exacte »), tri « Pertinence » / « Plus récents », **« Rechercher »**.
2. Résultats par 15 (« N résultat(s) sur arXiv — affichage X–Y », bouton « Charger plus ») : titre, date, auteurs, abstract dépliable, badges de catégories.
3. Par résultat : « Ajouter aux références » (→ devient « Ajoutée », import direct dans votre bibliothèque), « BibTeX » (copie), « PDF » (ouvre le PDF arXiv).
4. « suivre cette recherche » crée une **veille** arXiv (voir §6.7).

**b) Annuaire — 27 ressources en 5 catégories** : « Archives ouvertes » (HAL, arXiv, PubMed Central, SSRN, OpenAlex), « Moteurs de recherche » (Google Scholar, Semantic Scholar, BASE, Dimensions), « Éditeurs & Bases » (ScienceDirect, Springer, Wiley, Taylor & Francis, Sage, IEEE Xplore, ACM), « Bibliothèques numériques » (CAIRN, Persée, JSTOR, Project MUSE, ERIC), « Outils spécialisés » (Scopus, Web of Science, DBLP, MathSciNet, zbMATH, IngentaConnect). Chaque carte indique le pays, la description et l'accès (« Gratuit » / « Abonnement » / « Open Access ») + bouton « Visiter ».

### 6.3 Thèses en ligne — HAL

Module **Thèses en ligne** (source HAL, archives-ouvertes.fr) :

1. Recherchez (« Rechercher des thèses... (ex : architecture urbaine) »).
2. Filtres : **« Discipline »** (11 taxonomies HAL : Sciences humaines et sociales, Informatique, Sciences de l'ingénieur, Sciences du vivant, Sciences de l'environnement, Planète et Univers, Mathématiques, Physique, Chimie, Sciences cognitives), « Année min / max », tri (« Plus récentes » / « Plus anciennes » / « Plus pertinentes »).
3. Résultats : titre FR + EN, année, auteurs, abstract (300 caractères, « Lire la suite »), domaines, mots-clés ; pagination.
4. « suivre cette recherche » crée une veille HAL (filtres inclus).
5. **« Autres sources (8) »** : liens vers theses.fr, ETHOS (British Library), OATD, BASE, NDLTD, MIT DSpace, Harvard DASH, Shodhganga.

### 6.4 Explorateur Thèses — theses.fr

Module **Explorateur Thèses** (API officielle ABES). **3 onglets** :

- **« Recherche »** : requête libre + « Filtres avancés » (« Disciplines » séparées par virgules, « Langue » (Français/Anglais), « Statut » (« Soutenue » / « En cours »), années, tri en 6 options dont « Auteur (A → Z) »). Cartes : titres, directeurs (« Dir. : … »), badge discipline coloré, statut, établissement, sujets RAMEAU. Boutons « Voir sur theses.fr » et « Détails » (école(s) doctorale(s), rapporteurs, examinateurs, président du jury, DOI, NNT, accès au document).
- **« Statistiques »** : total live des thèses recensées + recherches rapides par discipline.
- **« Chercheurs »** : recherche de personnes (« Dupont, Marie ») avec rôle et nombre de thèses.

### 6.5 Journaux OA — revues en accès ouvert

Module **Journaux OA** (OpenAlex + DOAJ interrogés en parallèle). Encart « Principe DORA » : ne réduisez pas une revue à un seul chiffre.

1. Recherchez (« ex. sociologie, machine learning »), filtrez par source (« Toutes » / « OpenAlex » / « DOAJ ») et par domaine (23 disciplines).
2. Résultats : éditeur, ISSN, pays, « APC » (frais de publication), **type d'accès : Or / Diamant / Hybride / Bronze / Vert** ; bouton « Site web ».
3. **« Classer par IA »** : l'IA classe les 10 premiers résultats selon la pertinence pour votre recherche.
4. **« Exporter CSV »** : fichier `journaux-oa-<requête>.csv` (Nom, Éditeur, ISSN, Domaines, Type OA, Pays, Source, Page d'accueil, APC).
5. Section **« Évaluer la légitimité d'une revue »** : cochez les signaux observés — 5 « Signaux d'alerte (prédatrices) » (« Promesses irréalistes », « Métriques fabriquées »…) vs 3 « Signaux de légitimité » (« Indexation reconnue »…) — verdict automatique (vert / ambre « vérification approfondie » / rouge « Fort risque de revue prédatrice »).

### 6.6 Bibliothèque — livres gratuits

Module **Bibliothèque** — « Recherchez des livres sur 7 sources gratuites en une seule requête » : **Project Gutenberg** (70 000+ livres du domaine public), **Open Library** (prêt numérique Internet Archive), **Standard Ebooks** (éditions soignées) — les 3 interrogeables directement ; **ManyBooks, PDF Drive, PDF Coffee, PDF Room** (recherche préremplie sur le site externe).

1. Saisissez titre, auteur, sujet ou ISBN ; choisissez la source ou « Toutes les sources API ».
2. Résultats groupés par source : couverture, titre, auteurs, année, badge « eBook ».
3. Dialogue détail : éditions, téléchargements, ISBN, langues, sujets, et boutons « Voir sur le site », « Lire en ligne », « PDF », « EPUB », « Tous les formats ».

### 6.7 Veille académique — alertes HAL et arXiv

Module **Veille académique**. Les veilles se créent **depuis les modules de recherche** : bouton « suivre cette recherche » dans « Thèses en ligne » (HAL) ou « Bases de données » (arXiv).

- Chaque veille : badge source, compteur vert « N nouveau(x) », « Dernière vérification », interrupteur **« Auto »** (vérification automatique **toutes les 6 heures**), bouton **« Vérifier »** (1ᵉʳ relevé = base de référence ; ensuite : « N nouveau(x) résultat(s) » ou « Aucun nouveau résultat »), renommage (crayon), suppression avec confirmation.
- **Vue détail** : résultats bordés de vert s'ils sont nouveaux, « Relevé le … », liens « Ouvrir », « Marquer comme vu », et raccourci **M** = « Tout marquer comme vu ».

### 6.8 Recherche plein texte — dans vos chapitres

Module **Recherche plein texte** — cherchez dans tout ce que vous avez rédigé :

- 3 cartes d'index (« Documents indexés », « Mots indexés », « Dernière mise à jour ») ;
- filtres : chapitre ciblé (« Tous les chapitres »), dates de début/fin ;
- **« Recherche avancée (opérateurs booléens) »** : `urbanisme AND durabilité`, `architecture OR urbanisme`, `méthodologie NOT qualitative` ;
- résultats avec **surlignage jaune** des termes, score de pertinence (« Très pertinent » → « Peu pertinent »), « Recherches récentes » (15 dernières, cliquables).

### 6.9 Onglet Recherche — votre espace d'investigation

Module **Onglet Recherche** (lié à la thèse active) — organisez chaque piste de recherche dans un onglet persistant :

- Saisissez un sujet dans « Rechercher un sujet et ouvrir dans un nouvel onglet… » : l'onglet est créé avec 2 liens préremplis (« Google Scholar — {sujet} », « OpenAlex — {sujet} »).
- Chaque onglet contient : « **Notes** » (sauvegarde automatique), « **Liens rapides » » (titre + URL), « **Citations clés** » (texte + auteur), « **Tâches à faire** » (cases à cocher).
- Actions d'onglet : « Renommer », « Épingler » / « Désépingler », « Dupliquer », « Effacer ».
- **« Résumé de session »** : synthèse de tous les onglets (liens, citations, % de tâches).

### 6.10 Vérification Citations — 5 registres + recalcul statistique

Module **Vérification Citations** (badge API). **2 onglets** :

**« Vérification Citations »** — vérifiez chaque référence contre **Crossref, OpenAlex, Semantic Scholar, DOAJ et PubMed** :

1. Collez vos références (une par ligne, max 50 ; DOI détectés automatiquement).
2. **« Vérifier les citations »** → résumé en 4 tuiles : « Vérifiés », « Non trouvés », « Rétractés », « Incohérents ».
3. Chaque citation : verdict coloré + détails par registre (latence, titre, DOI, journal, citations, Open Access) + lien.
4. Les **rétractations** sont signalées par un toast dédié — indispensable avant soumission.

**« Recalcul Statistiques »** — contrôlez vos valeurs p (méthode statcheck, « **aucun modèle IA impliqué — calcul mathématique déterministe** ») :

1. Collez le texte de vos résultats (formats détectés : `t(45) = 3.21, p < .01`, `F(2, 87) = 4.56, p = .013`, `χ²(3) = 12.4`, `r(120) = 0.35`).
2. **« Recalculer »** → tuiles « Corrects / Incohérents / Erreurs graves », fourchette attendue par test, taille d'effet avec libellé et écriture APA suggérée.

---

## 7. Méthodologie et vérification

### 7.1 Méthodologie — guides de référence

Module **Méthodologie** — 5 volets dépliables : « Paradigmes de recherche » (Qualitatif / Quantitatif / Mixte : forces, limites, exemples), « Démarche méthodologique » (timeline en 7 étapes, de « Problématique » à « Conclusion »), « Outils de collecte » (Entretiens, Questionnaires, Observation, Analyse documentaire — avec conseils), « Techniques d'analyse » (thématique, contenu, statistique, Grounded Theory), « Checklist méthodologique » (10 cases à cocher avec progression). *(Checklist de session.)*

### 7.2 Analyse du champ — cartographie IA

Module **Analyse du champ** (badge IA) :

1. Remplissez « Sujet de recherche » (obligatoire), « Discipline », « Mots-clés », « Questions de recherche » (une par ligne) puis **« Lancer l'analyse »**.
2. Explorez les **6 onglets de résultats** : « État de l'art », « Auteurs & Théories », « Lacunes » (avec astuce d'exploitation), « Carte conceptuelle » (arbre auto-généré, enrichissable manuellement : « Ajouter un nœud racine », « Ajouter un sous-nœud »), « Paysage littéraire » (courants, débats, approches), « Positionnement » (4 champs préremplis par l'IA : Originalité, Ancrage théorique, Approche méthodologique, Contribution — synthèse générée quand les 4 sont remplis).
3. **« Exporter »** copie un rapport Markdown complet dans le presse-papiers.

### 7.3 Outils SLR — revue systématique (PRISMA)

Module **Outils SLR** — 6 onglets :

- **« PRISMA »** : diagramme 2020 éditable en 4 étapes (« Identification », « Dépistage », « Admissibilité », « Inclus ») avec sous-compteurs ; alerte si les totaux divergent.
- **« Protocole »** : cadre **PICO/PICOS** (5 champs + question de recherche générée), critères d'inclusion/exclusion (dialogue « Nouveau critère »), « Stratégie de recherche » (15 bases basculables : Web of Science, Scopus, PubMed, HAL, CAIRN…), mots-clés, période ; « Assistant IA — Protocole » génère un protocole complet.
- **« Criblage »** : tableau d'articles avec décisions « Inclure ✓ / Exclure ✗ / Peut-être ? » et notes.
- **« Extraction »** : template de **14 champs** (auteurs, cadre méthodologique, échantillon, résultats, limites…) ; « Exporter en CSV ».
- **« Qualité »** : grilles **CASP (10 items)** ou **JBI** avec observations.
- **« Suivi »** : entonnoir de sélection, répartition du criblage, résumé du protocole.

### 7.4 Génération Hypothèses — formuler et pré-enregistrer

Module **Génération Hypothèses** (badge IA). **3 onglets** :

1. **« Hypothèses »** : saisissez la « Question de recherche » → l'IA produit H1, sous-hypothèses (H1a, H1b…), variables (VI/VD), H0, hypothèses rivales et plan de test (chaque hypothèse doit être falsifiable). Bouton « Vers pré-enregistrement » reporte H1 dans le formulaire.
2. **« Opérationnel »** : « Opérationnaliser » → définitions opérationnelles, indicateurs, instruments, plan de collecte, variables de contrôle, matrice de codification.
3. **« Pré-enregistrement »** (standard COS/OSF) : question, hypothèses, « Test statistique » (18 options : Test t de Student, ANOVA, Chi-carré, Régression, Corrélation de Pearson, Mann-Whitney U, SEM…), taille d'échantillon, seuil α (0.05), critères d'inclusion/exclusion ; **« Exporter en Markdown »** télécharge `pre-enregistrement-recherche.md`.

### 7.5 Vérification méthodologique — audit complet

Module **Vérification méthodologique** (badge IA). **5 onglets** :

- **« Audit »** : 8 sections × 4 critères = **32 critères** cliquables, chacun cyclant « Conforme → Partiellement → Non conforme → Non évalué » (critères « Critique » pondérés ×3). Score /100 : « Excellent » ≥ 80, « Satisfaisant » ≥ 60, « À améliorer » ≥ 40, « Critique ».
- **« Vérification IA »** : collez votre méthodologie → score global, « Forces identifiées », « Faiblesses détectées », « Recommandations », « Risques identifiés » (biais, validité interne/externe).
- **« Cohérence »** : 7 champs (question, paradigme, approche, collecte, échantillon, analyse, cadre théorique) — minimum 2 remplis — l'IA vérifie 5 axes d'alignement.
- **« Suivi »** : score circulaire global, détail par section, statistiques de l'audit.
- **« Rapport »** : « Télécharger le rapport » (`audit-methodo-AAAA-MM-JJ.txt`) avec détail par critère.

### 7.6 Vérification cartographique — données spatiales

Module **Vérification cartographique** (badge IA) — pour les thèses avec analyse spatiale/urbaine :

1. Renseignez le « Site d'étude » et le « Type d'analyse » (référentiel « Diagnostic morphologique complet » : 4 phases, 38 éléments attendus).
2. Onglet **« Éléments »** : ajoutez vos éléments (nom, type, nature « Spatial / Bibliographique / Donnée d'enquête / Document », phase, source, date) ; compteur « X élément(s) sur Y attendu(s) ».
3. Onglet **« Vérification »** : **Module A — « Vérification de complétude »** (règles déterministes : « Cadrage incomplet », « Éléments manquants », ou validation totale) ; **Module B — « Questionneur socratique »** (l'IA pose uniquement des **questions ouvertes** sur vos choix de données — filtrage strict des affirmations).
4. Onglet **« Carto MCP »** : 9 outils géographiques MCP (géocodage Nominatim, validation de CRS, calcul de superficie, altitude…) + « Enrichir les éléments avec le MCP géographique ».
5. Onglet **« Explorateur »** : recherche d'infrastructures OpenStreetMap (« hôpitaux à Paris… ») avec carte intégrée.

### 7.7 Vérification Cohérence — le Sceau de vérité

Module **Vérification Cohérence** (badge IA) — contrôle la cohérence interne de votre texte :

1. Choisissez le **mode** : « Analyse globale », « Introduction ↔ Discussion », « Méthodologie ↔ Résultats » ou « Analyse trio ».
2. Collez vos sections (badges « Requis » / « Optionnel », ≥ 20 caractères chacune).
3. Filtrez éventuellement les **6 catégories** (terminologique, argumentative, numérique, intro↔discussion, référentielle, structurelle — **22 contrôles** au total : « Définitions contradictoires », « Confusion corrélation/causalité », « Question de recherche orpheline », « Citation fantôme », « Chiffres incohérents »…).
4. **« Lancer l'analyse de cohérence »** → bannière **« Sceau de cohérence accordé »** (vert) ou **« refusé »** (rouge) : le sceau est accordé si le **score global ≥ 70/100** ; échecs groupés par catégorie avec sévérité (« Critique / Majeur / Mineur »), extrait cité et « Suggestion ».

### 7.8 Alignement Preuves — citations ↔ références

Module **Alignement Preuves** (badge IA) — **audit 100 % déterministe** (aucune IA) sur une thèse complète :

- **« Score d'alignement global »** (anneau coloré) + stats « X citations / Y références / Z appariées » ;
- sous-vues : « **Chapitres** » (score par chapitre selon la densité citations/1000 mots : « Bon / Attention / Critique »), « **Citations orphelines** » (citées mais absentes de la bibliographie), « **Références inutilisées** » (jamais citées), « **Routing** » (cartographie référence → chapitres).

### 7.9 Expérimentations — journal de traçabilité

Module **Expérimentations** — tracez vos hypothèses jusqu'aux verdicts :

1. **« Nouvelle expérimentation »** : titre, « Question / hypothèse testée », « Réf. hypothèse » (H1…), tags, protocole.
2. Ajoutez des **runs** (« baseline », « var-A lr=0.01 »…) : configuration, « Métriques (une par ligne : nom: valeur) » (ex. `rmse: 0.42`), résultat, « Lien preuve », statut, verdict (« Confirmé / Réfuté / Non concluant »).
3. À la clôture (statut « Conclue ») : rédigez la « Conclusion » et attribuez le « Verdict global… » (« Hypothèse soutenue » / « Réfutée » / « Non concluante »).
4. Tout est persisté en base — c'est la traçabilité exigée par un comité ou un directeur rigoureux.

### 7.10 Soutenance — préparation de la soutenance orale

Module **Soutenance** (lié à la thèse active). **3 onglets** : « Slides », « Discours », « Questions du jury ». Les artefacts sont générés par IA à partir du contenu réel de votre thèse (titre, auteur, discipline, directeur, cadrage actif, chapitres) avec le fournisseur configuré (section 3).

- **Onglet « Slides »** — le plan de diapositives de la présentation : chaque diapositive est affichée en carte numérotée avec son titre et ses points de contenu (6 points maximum par diapositive, dans l'esprit des bonnes pratiques de présentation). Boutons : « Générer les slides », « Copier le plan » (format texte lisible : « Diapositive 1 — Titre » puis ses points), « Régénérer les slides ».
- **Onglet « Discours »** — le texte oral complet, calibré sur une « Durée cible » au choix (10, 15 ou 20 minutes ; 15 par défaut) et structuré selon la progression d'une soutenance : salutations du jury, problématique, méthodologie, résultats, limites, conclusion, remerciements. Boutons : « Générer le discours », « Copier le discours », « Régénérer le discours ». Le texte s'affiche dans un bloc déroulant avec la durée enregistrée (« Durée enregistrée : N minutes »).
- **Onglet « Questions du jury »** — une simulation de 10 questions regroupées par famille (Fond théorique, Méthodologie, Résultats, Limites et perspectives, Ouverture). Chaque question est accompagnée d'un « Angle de réponse » suggéré, ancré dans votre thèse. Boutons : « Générer 10 questions », « Copier les questions », « Régénérer les questions ».

Flux recommandé :

1. Activez votre thèse (Éditeur de thèse) puis ouvrez **Soutenance** dans la catégorie « Méthodologie & Vérification ».
2. Générez le plan de slides, lisez-le, puis copiez-le comme base de travail de votre support de présentation.
3. Choisissez la « Durée cible » puis générez le discours ; relisez-le à voix haute et copiez-le pour le répéter.
4. Générez les questions du jury et préparez une réponse pour chacune en suivant les angles suggérés.
5. Chaque bouton de régénération demande une confirmation (« Relancer la génération ? ») : la nouvelle génération **remplace** l'artefact enregistré.

Sans thèse active, le module affiche « Aucune thèse active » et vous invite à en choisir une dans l'éditeur. Un artefact jamais généré s'affiche en état vide avec son bouton de génération. Tout est **persisté par thèse** (`soutenance`) : slides, discours et questions sont restaurés à la réouverture du module et survivent à la fermeture de l'application.

---

## 8. IA et outils complémentaires

### 8.1 Outils IA — carnet de recherche et consensus

Module **Outils IA** (badge IA). **3 onglets** :

- **« Carnet de recherche »** : « Sources de recherche » (titre, auteurs, année, type « Article / Livre / Thèse / Rapport », URL, notes) et « Notes et questions » (question, réponse, tags, source associée) — **persistés en base**.
- **« Consensus IA »** : soumettez un texte à plusieurs perspectives simultanément (« Rédaction », « Revue critique », « Suggestion ») puis consultez la « Synthèse comparative ».
- **« Visualisation »** : carte conceptuelle, réseau d'auteurs, chronologie — **« Bientôt disponible »** (alimentez le carnet en attendant).

### 8.2 APInex Playground — chat multi-modèles

Module **APInex Playground** (badge API, « 1 clé · 7 fournisseurs ») — nécessite une clé serveur `APINEX_API_KEY` :

- **Chat** avec rendu Markdown, interrupteur « Recherche web » (≈ 600 tokens/appel, sources citées [n]), streaming avec « Arrêter » ;
- **Modèles** : catalogue dynamique groupé par fournisseurs (Free, OpenAI, Anthropic, Gemini, DeepSeek, Zhipu, Moonshot, xAI), badge « GRATUIT », défaut `free/glm-5.3-flash` ;
- **Réglages** : « Température » (0→2), « Tokens max » (256→4096), « Prompt système » ;
- cartes de suivi : « Solde disponible », « Dépensé / Réservé », « Modèles actifs ».

### 8.3 RoutesMe — comparaison multi-modèles

Module **RoutesMe** (badge IA). **2 onglets** : « Comparaison » et « Historique ».

1. Sélectionnez 2 à 4 modèles parmi les tuiles (« GPT-4 », « Claude », « Mistral », « Llama »).
2. Chargez un « Modèle de prompt doctoral » parmi 8 (« Revue de littérature », « Choix méthodologique », « Rédaction de résumé (abstract) », « Génération d'hypothèses », « Construction théorique », « Relecture critique », « Préparation soutenance », « Rapport de supervision ») ou écrivez votre prompt.
3. **« Lancer la comparaison »** → les réponses s'affichent côte à côte avec temps de réponse ; **« Élire »** désigne la « Meilleure réponse » (badge trophée).

> Utile pour choisir le style académique qui vous convient sur les passages critiques. L'historique conserve les 10 dernières comparaisons (session).

### 8.4 Article → Code — reproductibilité Python

Module **Article → Code** (badge IA). Collez le texte d'un article (≥ 200 caractères), choisissez le fournisseur IA et le modèle, puis **« Generer le code »** : pipeline en 3 étapes (Planification → Analyse → Code) avec architecture **Mermaid**, `config.yaml`, `requirements.txt` et fichiers Python commentés. **« Telecharger »** exporte `paper2code_output.txt` (tout concaténé).

### 8.5 Diagrammes — visuels de thèse

Module **Diagrammes** — **5 types** : « Organigramme », « Chronologie », « Tableau comparatif », « Carte conceptuelle », « Processus ».

- **« Constructeur »** : ajoutez nœuds (« Libellé », « Description », « Date / Période »), connexions (« Étape source », « Étape destination », « Étiquette »), critères et colonnes.
- **« Modèles »** : 5 modèles prêts (« Structure de thèse », « Flux méthodologique », « Calendrier doctoral », « Comparaison qualitative / quantitative », « Carte conceptuelle — IA en recherche »).
- **« Générer par IA »** (description → diagramme), **« Télécharger PNG »** (`diagramme-<horodatage>.png`), **« Exporter »** (copie Markdown). *(État de session — exportez avant de changer de vue.)*

### 8.6 APA Composer — normes APA 7ᵉ édition

Module **APA Composer**. **5 onglets** :

- **« Composer »** : choisissez le type (« Article de revue », « Livre », « Chapitre de livre », « Site web », « Thèse / Mémoire »), remplissez les champs — l'**aperçu en direct** affiche la « Référence complète (APA 7e éd.) », la « Citation entre parenthèses » `(Dupont, 2024)` et la « Citation narrative » `Dupont (2024)`.
- **« Liste de références »** : liste triée alphabétiquement, « Copier toute la liste APA ».
- **« Import groupé »** : collez du BibTeX (@article, @book, @phdthesis…) pour conversion automatique.
- **« Exporter »** : liste APA + « Export BibTeX » (compatible Zotero, Mendeley, EndNote).
- **« Assistant IA »** : collez une référence mal formatée, l'IA la convertit en APA 7.

### 8.7 Traducteur

Module **Traducteur** (LibreTranslate, open source, aucune clé). 28 langues sources (« Détecter automatiquement » inclus), 27 langues cibles, paires rapides (« FR → EN », « EN → FR »…), boutons « Coller », « Inverser », « Copier la traduction », raccourci **Ctrl+Entrée** pour traduire. Bascule automatique entre 3 instances publiques en cas de panne.

### 8.8 Livres-compétences — développement doctoral

Module **Livres-compétences** : **8 catégories, 34 compétences** (Rédaction académique, Méthodologie, Analyse de données, Communication scientifique, Veille bibliographique, Éthique de la recherche, Gestion de projet, Technologies numériques) :

- **« Auto-evaluation »** : évaluez chaque compétence (« Débutant / Intermédiaire / Avancé / Expert ») → « Score global de compétence » /100 (Expert ≥ 90 → Débutant) ;
- **« Ressources »** : 2 références bibliographiques par compétence ;
- **« Progression »** : forces, axes d'amélioration, historique des évaluations ;
- **« IA »** : plan d'apprentissage personnalisé (priorités P1/P2/P3) ;
- **« Bibliothèque »** : ressources partagées persistées en base.

### 8.9 Boîte doctorale — administration du doctorat

Module **Boîte doctorale** (lié à la thèse active). **5 onglets** :

- **« Checklist »** — 5 phases cochables : « Inscription » (7 items : dossier, lettre du directeur, attestation de master…), « Cours et formation » (7), « Recherche » (8, dont « Rédaction d'au moins un article scientifique »), « Rédaction » (7, du « Plan détaillé validé par le directeur » à la « Conclusion générale »), « Soutenance » (9, de la remise du manuscrit au « Dépôt de la version finale en ligne (thèse.fr / archive) »).
- **« Calendrier »** — jalons datés typés « Jalon / Échéance / Réunion » (12 exemples préchargés, de la première inscription à la soutenance), cases « fait ».
- **« Documents »** — 16 pièces administratives avec statut « Absent / En cours / Soumis » et notes (page de titre, avis d'éthique (CER), rapports des rapporteurs, « Déclaration de non-plagiat »…).
- **« Contacts »** — annuaire (Directeur de thèse, Co-directeur, Rapporteur du jury, Secrétariat école doctorale).
- **« Liens »** — 8 ressources utiles (templates, guide APA, theses.fr, HAL, ANR, Sudoc, Zotero).

Tout est **persisté par thèse** (`doctoral-toolbox`) — c'est votre dossier administratif vivant.

---

## 9. Exporter votre thèse

### 9.1 Export PDF

Module **Export PDF**. **3 onglets** :

1. **« Configuration »** : sélectionnez la thèse et les « Chapitres à exporter » (tous pré-cochés, boutons « Tout sélectionner » / « Tout désélectionner ») ; vérifiez les « Métadonnées de la thèse » (titre, sous-titre, auteur, directeur, établissement, année, laboratoire, discipline — affichées sur la couverture) ; réglez « Options de mise en forme » : « Taille de la police » (10/11/12 pt), « Interligne » (1.0/1.5/2.0), « Marges » (« Réduites (1,5 cm) », « Normales (2,5 cm) », « Larges (3,5 cm) »), cases « Page de couverture », « Table des matières », « Numéros de page », « Notes de bas de page ». A4, Times New Roman, paragraphe justifié.
   - **« Notes de bas de page »** (désactivée par défaut) : les citations reconnues au format « (Auteur, année) » ou « Auteur (année) » et correspondant à une référence de votre bibliothèque reçoivent un exposant numéroté, et la référence complète formatée APA est listée dans une section « Notes » en fin de document (dans l'ordre de première apparition, une note unique par référence). Une citation sans correspondance reste inchangée. Valable pour les voies « Imprimer / Sauvegarder PDF » et « Télécharger PDF ».
2. **« Aperçu »** : rendu avant export.
3. **« Exporter »** : 3 voies — **« Imprimer / Sauvegarder PDF »** (boîte d'impression du navigateur, la plus fidèle), **« Télécharger PDF »** (fichier généré, toast « PDF téléchargé avec succès »), **« Télécharger HTML »** (fichier `.html` nommé d'après le titre).

### 9.2 Export DOCX

Module **Export DOCX** — document **Word** avec de vrais styles éditables (Titre 1/2/3, Normal) :

- « Structure du document » : « Page de garde », « Table des matières » (numérotation i, ii, iii — mise à jour par clic droit dans Word), « Références » (bibliographie APA triée), « Notes de bas de page » (citations reconnues « (Auteur, année) » transformées en vraies notes Word avec la référence complète APA en bas de page — une note unique par référence, citations sans correspondance intactes, désactivé par défaut) ;
- « Typographie » : police 11/12/13 pt, interligne 1.15/1.5/2.0, marges 1,5/2,5/3,5 cm ;
- « En-tête et pied de page » : « Texte d'en-tête » (prérempli avec le titre), numéros de page ;
- chapitres numérotés (« I. Introduction, 1.1 Contexte... »), paragraphe justifié avec alinéa français, gras/italique préservés.

Cliquez **« Générer le document DOCX »** → fichier nommé `auteur_titre….docx` (toast « Document DOCX généré avec succès (N mots) »).

---

## 10. Vos données : persistance, sauvegarde, confidentialité

### 10.1 Ce qui est sauvegardé en base (SQLite locale)

Thèses, chapitres (contenu + versions), parties, cadrages (champs, suggestions, verrous, versions), références, sources et notes du carnet de recherche, sprints et stories, veilles et leurs résultats, onglets de recherche, boîte doctorale, expérimentations et runs, éléments et sessions de vérification cartographique, préparation de soutenance (slides, discours, questions du jury).

### 10.2 Ce qui vit en mémoire de session (non persisté)

Conversations (Assistant IA, Chat Directeur, RAG, APInex), historique Harper, checklists (8C, article, méthodologique), suivi d'écriture et Pomodoro, analyses (Grammaire, Champ, SLR, Méthodo, Cohérence, Hypothèses, RoutesMe, Diagrammes, APA Composer, Équilibre objectifs, Article → Code), résultats de Vérification Citations.

> **Règle** : dès qu'un résultat vous convient, **copiez-le** dans un chapitre ou exportez-le (Markdown, CSV, PNG, PDF, DOCX).

### 10.3 Sauvegarde de vos données

Votre patrimoine = le fichier de base (`db/*.db`). Copiez-le régulièrement (clé USB, cloud personnel) — l'application étant locale, cette copie est votre seule assurance contre une panne machine.

### 10.4 Confidentialité

Données locales ; clés API en cookie serveur sécurisé ; bandeau de transparence dès qu'un fournisseur IA externe est utilisé (§3.4) ; aucun hébergement de vos contenus par ThesisFrame.

---

## 11. Bonnes pratiques

1. **Commencez par le cadrage** (§4.3) : les modules de vérification s'appuient sur un cadrage clair.
2. **Sauvegardez `db/*.db`** régulièrement (§10.3).
3. **Faites vérifier tôt et souvent** : « Vérification de cohérence » (sceau ≥ 70) et « Alignement Preuves » après chaque chapitre, pas seulement à la fin.
4. **Utilisez l'Auto-édition 8C et la Grammaire** avant de soumettre un chapitre à votre directeur.
5. **Indexez régulièrement le RAG** après vos modifications pour des réponses à jour.
6. **Activez la veille** dès le début de la thèse (« suivre cette recherche » dans HAL/arXiv).
7. **Comparez les modèles** (RoutesMe) sur les passages critiques : les IA diffèrent sensiblement en style académique.
8. **Vérifiez vos citations** (« Vérification Citations ») avant chaque soumission — les rétractations existent.
9. **Exploitez le calculateur de rythme** (§4.5) dès que votre date limite est connue.
10. **Préparez la soutenance avec la Boîte doctorale** : la checklist de 38 items couvre l'administratif de bout en bout.

---

## 12. Dépannage (FAQ)

| Problème | Solution |
|---|---|
| L'IA ne répond pas | Paramètres → « Fournisseur IA » → « Tester ». Le **circuit breaker** bascule normalement tout seul ; sinon changez de fournisseur (22 gratuits). Erreur 401/403 : clé invalide — resaisissez-la. |
| Quota IA épuisé | Choisissez un autre fournisseur gratuit (Gemini, Groq, Cerebras…) ou votre propre clé OpenRouter. |
| « Configurez un fournisseur IA » (Questionneur socratique) | Aucun fournisseur actif : ouvrez Paramètres → « Fournisseur IA » et sauvegardez une configuration. |
| Une recherche académique échoue | Les API publiques (HAL, Overpass, theses.fr…) peuvent être momentanément indisponibles ; réessayez. Journaux OA continue sur la source restante avec bandeau d'avertissement. |
| « Entrez un terme de recherche » | Champs de recherche vides : saisissez au moins 2 caractères (4 dans l'Explorateur OSM). |
| « Maximum 50 citations par requête » | Vérification Citations : traitez vos références en lots de 50 maximum. |
| « Fichier trop volumineux (max 10 Mo) » ou « Trop de références (N). Maximum : 500 » | Import de références : scindez le fichier ou importez en plusieurs fois. |
| « Aucun résultat » dans une recherche | Élargissez la requête, changez de filtres ou de source (le bouton « Réinitialiser » remet les filtres à zéro). |
| Mes cases à cocher ont disparu | Les checklists de diagnostic (8C, article, méthodologie, SLR…) sont de session : notez-les ou exportez avant de fermer. |
| Ma thèse a disparu | La base est locale : vérifiez la machine/profil utilisés et restaurez votre sauvegarde de `db/*.db` (§10.3). |
| « Aucune thèse sélectionnée » (RAG, Onglet Recherche, Exports…) | Ces modules s'attachent à la thèse active : ouvrez l'Éditeur et sélectionnez votre thèse. |
| « Le tableau pourrait être remplacé par une phrase » | C'est un verdict — pas une erreur : l'outil « Qualité d'un tableau » vous signale un tableau peu informatif. |
| Thème illisible | Basculez en bas de la barre latérale : « Mode clair » / « Mode sombre ». |
| Bug ou comportement anormal | Guide intégré (**?**), puis dépôt GitHub (Issues). |

---

## 13. Glossaire

| Terme | Définition |
|---|---|
| **RAG** | *Retrieval-Augmented Generation* : l'IA répond en s'appuyant sur le contenu indexé de *votre* thèse (chapitres, références, notes, cadrages) |
| **SLR** | *Systematic Literature Review* : revue de littérature systématique (protocole PRISMA) |
| **PRISMA** | Standard de rapport pour les revues systématiques : diagramme de flux Identification → Dépistage → Admissibilité → Inclus |
| **CASP / JBI** | Grilles d'évaluation de la qualité des études (Critical Appraisal Skills Programme / Joanna Briggs Institute) |
| **PICO/PICOS** | Cadre de question de recherche : Population, Intervention, Comparaison, Résultats, (Contexte) |
| **8C** | Les 8 critères d'auto-édition de Gastel & Day : Conformité, Exhaustivité, Composition, Exactitude, Clarté, Cohérence, Concision, Courtoisie |
| **IMRaD** | Structure d'article : Introduction, Methods, Results and Discussion |
| **Sceau de vérité (Truthmark)** | Indicateur de cohérence interne : accordé si le score de cohérence atteint 70/100 |
| **Alignement des preuves** | Cohérence entre citations du texte et références bibliographiques (densité citations/1000 mots) |
| **Circuit breaker** | Bascule automatique entre fournisseurs IA en cas de panne (3 échecs → ouverture, rétablissement après refroidissement) |
| **Statcheck** | Recalcul déterministe des valeurs p rapportées (méthode de Nuijten et al., 2016) |
| **MCP** | *Model Context Protocol* : protocole d'outils (ici : 9 outils géographiques — géocodage, CRS, superficies…) |
| **OA** | *Open Access* : publications en accès libre (Or, Diamant, Hybride, Bronze, Vert) |
| **APC** | *Article Processing Charge* : frais de publication d'une revue en accès ouvert |
| **HAL / theses.fr / OpenAlex / DOAJ / Crossref** | Plateformes académiques publiques interrogées par l'application (dépôt français, thèses françaises ABES, index bibliographique, revues OA, registre DOI) |
| **BibTeX / RIS / CSL-JSON** | Formats d'échange de références bibliographiques |
| **APA 7ᵉ édition** | Normes de citation et de mise en forme de l'American Psychological Association |
| **Pomodoro** | Technique de travail par périodes chronométrées (25 min / 5 min) |
| **Kanban / Sprint / Story** | Vocabulaire agile : tableau à colonnes, itération de travail, unité de besoin |
| **Pré-enregistrement (COS/OSF)** | Enregistrement public d'hypothèses et de plan d'analyse *avant* la collecte de données |
| **Circuit de la veille** | Requête HAL ou arXiv suivie automatiquement (vérification toutes les 6 heures) avec détection des nouveaux résultats |
