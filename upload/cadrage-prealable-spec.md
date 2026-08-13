# Spécification développeur — Module « Cadrage préalable du projet de thèse »
### ThesisFrame — assistant IA de scoping initial

---

## 1. Objectif du module

À l'ouverture d'un nouveau projet de rédaction, avant que le doctorant n'entre dans le squelette IMRaD verrouillé, l'application doit proposer un **cadrage préalable** : un document de synthèse court, structuré, et explicitement **provisoire**, qui capture les paramètres fondamentaux du projet de recherche.

Ce cadrage a trois fonctions :
1. **Pour le doctorant** : l'obliger à expliciter dès le départ des choix (question, méthode, type de revue de littérature) qui sont trop souvent laissés implicites et découverts — douloureusement — au moment de la rédaction du chapitre méthodologie.
2. **Pour l'application** : servir de document de référence stable auquel `directeurThese.js` peut comparer le texte rédigé au fil des chapitres, pour signaler les dérives (ex. : une méthodologie qualitative annoncée mais des résultats rédigés comme si l'étude était quantitative).
3. **Pour le directeur de thèse humain** : donner un objet de discussion court et lisible en début d'encadrement, plutôt que d'attendre le premier chapitre complet.

**Point de doctrine à respecter strictement** : ce module a un rôle différent de `directeurThese.js`. `directeurThese.js` **critique sans jamais générer de contenu définitif**. Le module de cadrage, lui, **peut proposer un premier jet de suggestions** à partir d'une brève description libre fournie par le rédacteur — mais toute suggestion générée doit être visuellement marquée comme *brouillon à valider*, jamais insérée comme texte final, et rester 100 % modifiable. Ne jamais laisser les deux logiques se confondre dans l'interface ni dans le prompt système.

---

## 2. Déclenchement et emplacement

- Affiché automatiquement à la création d'un nouveau projet, avant le premier écran de rédaction.
- Reste accessible en permanence ensuite via un panneau latéral rétractable « Cadrage du projet », visible depuis n'importe quel chapitre — cohérent avec le principe d'aide contextuelle qui entoure la zone de rédaction plutôt qu'un guide de référence séparé.
- Le rédacteur peut ignorer l'étape initiale (« Compléter plus tard ») mais un badge « Cadrage incomplet » reste visible tant que les champs obligatoires ne sont pas remplis.

---

## 3. Flux d'interaction (UX)

**Étape 1 — Pitch libre.**
Champ de texte libre : *« Décrivez votre projet en quelques phrases : sujet, terrain, ce que vous cherchez à comprendre ou démontrer. »* (3–5 phrases suffisent, pas d'exigence de forme académique à ce stade.)

**Étape 2 — Premier jet assisté.**
L'IA génère une proposition initiale pour chaque champ du cadrage (section 4), à partir du pitch. Chaque champ généré est visuellement marqué (bandeau ou icône « Suggestion IA — à valider »), jamais indiscernable d'un contenu validé par l'utilisateur.

**Étape 3 — Édition champ par champ.**
Le rédacteur modifie chaque champ librement. Un bouton discret « Reformuler avec l'IA » permet de régénérer un champ isolément sans toucher aux autres. Aucun champ n'est verrouillé.

**Étape 4 — Vérification de cohérence.**
Avant validation, l'IA exécute une passe de cohérence interne (section 5.3) et affiche les tensions détectées sous forme de remarques, sans jamais réécrire automatiquement le champ concerné.

**Étape 5 — Validation (non définitive).**
Bouton « Valider ce cadrage ». Cela fige une version horodatée dans l'historique (section 6) mais **n'empêche pas** de rouvrir et modifier le cadrage plus tard — une thèse évolue, le cadrage doit pouvoir évoluer avec elle. Chaque validation crée une nouvelle version, l'ancienne reste consultable.

---

## 4. Champs du cadrage — liste enrichie

Pour chaque champ ci-dessous : **définition**, **pourquoi ce champ compte**, et **question/prompt d'amorçage** à poser au rédacteur si le pitch initial ne suffit pas à le renseigner.

### 4.1 Thématique générale
- *Définition* : le champ disciplinaire et le sujet général, en une phrase.
- *Pourquoi* : ancre tout le reste ; sert aussi à pré-configurer le vocabulaire de suggestion (architecture, urbanisme, patrimoine, mobilités, etc.).
- *Prompt d'amorçage* : « En une phrase, de quoi traite votre recherche ? »

### 4.2 Problématique
- *Définition* : la tension, le manque ou le problème non résolu qui justifie la recherche — **distinct de la question de recherche**, qui en est la formulation opérationnelle.
- *Pourquoi* : c'est le champ le plus souvent absent ou confondu avec le simple contexte chez les rédacteurs peu expérimentés. Une thématique sans problématique explicite ne justifie aucune recherche.
- *Logique attendue* : suivre la progression *territoire → créneau → occupation du créneau* — ce que l'on sait déjà (territoire), ce qui manque ou pose problème (créneau/problématique), ce que la thèse se propose de faire (occupation, renvoyée au champ objectifs).
- *Prompt d'amorçage* : « Qu'est-ce qui, dans l'état actuel des connaissances ou des pratiques, ne fonctionne pas, manque, ou reste contesté ? »
- *Garde-fou IA* : si le pitch ne contient qu'un contexte général sans tension identifiable, l'IA doit le signaler explicitement plutôt que d'inventer une problématique de toutes pièces.

### 4.3 Question(s) de recherche
- *Définition* : la ou les questions précises, opérationnalisables, auxquelles la thèse répond.
- *Pourquoi* : sert de test de cohérence permanent — toute méthodologie, tout objectif doit pouvoir s'y rattacher explicitement.
- *Bonne pratique* : privilégier une question principale + 2–3 sous-questions plutôt qu'une liste non hiérarchisée.
- *Prompt d'amorçage* : « Si votre thèse ne répondait qu'à une seule question, laquelle serait-ce ? »

### 4.4 Objectifs
- *Définition* : objectif général (souvent reformulation actionnable de la question principale) + objectifs spécifiques (déclinaison opérationnelle, un par sous-question ou par étape empirique).
- *Pourquoi* : sert de feuille de route pour le plan de thèse et de critère de vérification en fin de rédaction (« chaque objectif a-t-il été traité ? »).

### 4.5 Hypothèses (si applicable)
- *Définition* : propositions à tester, pertinentes surtout en recherche quantitative ou hypothético-déductive ; à rendre optionnel/masquable pour les recherches qualitatives exploratoires ou compréhensives, où l'on parlera plutôt d'hypothèses de travail ou de propositions théoriques provisoires.
- *Garde-fou* : ne pas forcer ce champ comme obligatoire — imposer des hypothèses formelles à une recherche qualitative exploratoire est une erreur méthodologique fréquente à éviter dans l'outil lui-même.

### 4.6 Type de recherche
- *Options* : quantitative / qualitative / mixte / recherche par le projet ou recherche-action (fréquent en architecture et urbanisme — à prévoir comme catégorie propre, pas comme sous-cas des deux premières).
- *Champ complémentaire obligatoire* : **justification du choix** en 1–2 phrases (« pourquoi ce type de recherche est-il adapté à la question posée ? ») — le type seul sans justification n'a pas de valeur diagnostique pour `directeurThese.js`.

### 4.7 Méthodologie envisagée
- *Sous-champs* :
  - Méthode(s) de collecte (entretiens, corpus documentaire, relevés de terrain, enquête, étude de cas, analyse morphologique, SIG, etc.)
  - Unité d'analyse (pourquoi ce cas, ce corpus, ce site, cet échantillon — justifiée, pas seulement nommée)
  - Terrain(s)/corpus envisagé(s)
  - Limites méthodologiques anticipées
- *Pourquoi* : c'est le champ que `directeurThese.js` utilisera le plus pour détecter les dérives de rédaction (ex. : un chapitre de résultats rédigé sur un ton quantitatif alors que la méthodologie déclarée est qualitative).

### 4.8 Type de revue de littérature
- *Options à proposer* : revue narrative, revue systématique (PRISMA), scoping review, revue thématique/critique, méta-synthèse qualitative.
- *Pourquoi* : détermine des exigences très différentes en amont (protocole enregistré pour une systématique, absence de protocole formel pour une narrative) — un doctorant qui ne sait pas encore lequel choisir doit être orienté par une question, pas par une liste sèche.
- *Prompt d'amorçage si indécis* : « Voulez-vous couvrir exhaustivement tout ce qui existe sur un sous-champ précis avec une méthode reproductible (→ systématique), ou construire un dialogue argumenté entre les positions théoriques majeures de votre domaine (→ narrative/thématique) ? »

### 4.9 Cadre théorique / conceptuel
- *Définition* : le ou les cadres, concepts ou auteurs de référence mobilisés pour interpréter les données.
- *Garde-fou IA impératif* : l'IA ne doit **jamais inventer ou halluciner des noms d'auteurs, de théories ou de références bibliographiques précises** dans ce champ. Elle peut suggérer des *catégories* de cadres pertinents pour la thématique (ex. « cadre relevant de la morphologie urbaine » ou « approche par les communs urbains ») sans jamais nommer d'auteur ou de titre précis qu'elle n'a pas de moyen de vérifier — cette vérification reste la responsabilité du doctorant et de son directeur.

### 4.10 Mots-clés
- *Définition* : 5 à 8 termes, en français et si pertinent dans la langue de publication cible, utiles à l'indexation et à la recherche documentaire.
- *Bonne pratique* : distinguer mots-clés « disciplinaires larges » (ex. urbanisme, patrimoine) et mots-clés « spécifiques au projet » (ex. le nom du terrain, un concept opératoire précis) — utile ensuite pour la revue de littérature et l'indexation finale de la thèse.

### 4.11 Contribution attendue / originalité
- *Définition* : ce que la thèse apportera qui n'existe pas encore (empirique, théorique, méthodologique ou pratique).
- *Pourquoi* : c'est la reformulation, en fin de cadrage, de « l'occupation du créneau » — le champ le plus directement réutilisable ensuite pour la conclusion de la thèse.

### 4.12 Type de thèse / contraintes institutionnelles
- *Options* : thèse classique monographique, thèse par articles/compilation, thèse par thème, format spécifique imposé par le règlement UC3/IGTU.
- *Pourquoi* : conditionne directement la structure du squelette IMRaD verrouillé déjà implémenté — ce champ doit être renseigné avant que l'utilisateur n'entre dans les chapitres, pour configurer le bon gabarit.

### 4.13 Statut de validation
- Champ système (non éditable manuellement) : `provisoire` / `validé le [date]` / `révisé le [date]`. Piloté par le bouton de validation (étape 5 du flux).

---

## 5. Comportement attendu de l'IA

### 5.1 Génération initiale
- À partir du seul pitch libre, générer une proposition pour chacun des champs 4.1 à 4.12.
- Ton des suggestions : hypothèses de travail, jamais affirmatif définitif (« Il pourrait s'agir de… », « Une problématique possible serait… »).
- Si le pitch est trop pauvre pour renseigner un champ avec un minimum de fiabilité, l'IA doit le laisser vide et poser la question d'amorçage correspondante plutôt que de produire une suggestion creuse ou générique.

### 5.2 Reformulation ciblée
- Sur demande, ne régénérer que le champ demandé, en tenant compte des autres champs déjà validés par l'utilisateur (cohérence croisée, ne pas repartir uniquement du pitch initial une fois que l'utilisateur a modifié des champs).

### 5.3 Vérification de cohérence (avant validation)
Vérifications minimales à implémenter, avec un message explicatif à chaque fois (jamais une correction automatique silencieuse) :
- Le type de recherche déclaré (4.6) correspond-il au vocabulaire de la méthodologie décrite (4.7) ? (ex. : « échantillon représentatif », « mesurer », « corréler » signalent un vocabulaire quantitatif — à confronter à un type « qualitatif » déclaré.)
- Chaque objectif spécifique (4.4) se rattache-t-il à au moins une sous-question (4.3) ?
- Le type de revue de littérature choisi (4.8) est-il cohérent avec l'ampleur du champ décrit en 4.1/4.2 (une revue systématique sur un sujet extrêmement large est signalée comme un risque de calendrier, pas bloquée) ?
- Le champ hypothèses (4.5) est-il rempli alors que le type de recherche (4.6) est qualitatif exploratoire ? → signaler la tension, ne pas l'interdire (certaines recherches qualitatives testent bien des propositions théoriques).

### 5.4 Frontière stricte avec `directeurThese.js`
- Le module de cadrage ne doit jamais être invoqué pour générer du contenu de chapitre.
- `directeurThese.js`, lui, doit pouvoir **lire** le cadrage validé (dernière version) en lecture seule, pour comparer la cohérence du texte rédigé au fil des chapitres à ce qui a été déclaré — mais ne doit jamais le modifier.

---

## 6. Modèle de données (proposition)

```json
{
  "cadrage": {
    "projet_id": "string",
    "version": "integer",
    "statut": "provisoire | valide | revise",
    "date_derniere_modification": "ISO 8601",
    "thematique": "string",
    "problematique": "string",
    "questions_recherche": {
      "principale": "string",
      "secondaires": ["string"]
    },
    "objectifs": {
      "general": "string",
      "specifiques": ["string"]
    },
    "hypotheses": ["string"],
    "type_recherche": {
      "type": "quantitative | qualitative | mixte | recherche_projet",
      "justification": "string"
    },
    "methodologie": {
      "methodes_collecte": ["string"],
      "unite_analyse": "string",
      "justification_unite_analyse": "string",
      "terrain_corpus": "string",
      "limites_anticipees": "string"
    },
    "revue_litterature": {
      "type": "narrative | systematique | scoping | thematique | meta_synthese",
      "justification": "string"
    },
    "cadre_theorique": "string",
    "mots_cles": {
      "disciplinaires": ["string"],
      "specifiques_projet": ["string"]
    },
    "contribution_attendue": "string",
    "type_these": "classique | par_articles | par_theme | format_specifique",
    "champs_generes_par_ia": ["liste des noms de champs encore marqués comme suggestion non validée"],
    "historique_versions": [
      { "version": "integer", "date": "ISO 8601", "snapshot": "objet cadrage complet à cette date" }
    ]
  }
}
```

---

## 7. Prompt système — proposition pour le modèle IA du module de cadrage

*(à adapter selon le backend retenu — GLM/Z.ai en cohérence avec la stack actuelle du projet)*

```
Tu es l'assistant de cadrage initial de ThesisFrame, un outil d'aide à la rédaction de thèses
en architecture et urbanisme pour l'IGTU — Université Constantine 3.

Ton rôle est STRICTEMENT DIFFÉRENT de celui du module directeurThese : tu génères des
PROPOSITIONS DE BROUILLON pour un cadrage de recherche provisoire, jamais du contenu de
chapitre final. Chaque suggestion que tu produis doit être formulée comme une hypothèse de
travail modifiable, jamais comme une affirmation définitive.

Règles impératives :
1. Ne jamais inventer de noms d'auteurs, de titres d'ouvrages, de théories nommées précises,
   ou de références bibliographiques. Tu peux évoquer des catégories ou familles d'approches
   (ex. "une approche par la morphologie urbaine"), jamais des sources précises non vérifiées.
2. Si les informations fournies par le rédacteur sont insuffisantes pour proposer un champ
   avec un minimum de fiabilité, laisse le champ vide et formule une question de relance
   précise plutôt qu'une suggestion générique ou creuse.
3. Adapte le vocabulaire méthodologique au champ disciplinaire déclaré (architecture,
   urbanisme, patrimoine, mobilités, etc.).
4. Distingue toujours clairement, dans ta sortie structurée, la problématique (le manque ou
   la tension qui justifie la recherche) de la question de recherche (sa formulation
   opérationnelle) — ne fusionne jamais ces deux champs.
5. Signale toute incohérence entre les champs (type de recherche déclaré vs. vocabulaire
   méthodologique utilisé, objectifs non rattachés à une question) sous forme de remarque
   distincte, jamais en corrigeant silencieusement le champ concerné.
6. Réponds uniquement au format JSON strict correspondant au schéma de cadrage fourni,
   sans préambule ni texte hors structure.
```

---

## 8. Points de vigilance pour le développeur

- **Ne jamais indexer une suggestion IA comme donnée validée** dans les statistiques ou exports du projet tant que le champ n'a pas été explicitement validé ou édité par l'utilisateur (traçabilité académique — utile en cas de question d'intégrité scientifique posée par le jury ou l'école doctorale).
- **Historiser systématiquement** chaque validation (section 6) : un cadrage qui évolue est normal et attendu dans un projet doctoral, la traçabilité des versions a une valeur en soi lors de la soutenance (montrer l'évolution du questionnement).
- **Rendre le cadrage exportable** (PDF/texte) pour qu'il puisse être partagé tel quel avec le directeur de thèse humain en dehors de l'application.
- **Ne jamais rendre un champ obligatoire de façon rigide** si la logique méthodologique du rédacteur le justifie (ex. hypothèses en qualitatif exploratoire, section 4.5) — préférer l'alerte de cohérence au blocage.
