# Méthodologie de recherche — Fondamentaux pédagogiques (Salkind)

> Source : Salkind, *100 Questions (and Answers) About Research Methods* (2012)
> Orientation : explicatif, niveau doctoral débutant.

---

## 1. Les 10 concepts les plus mal compris par les débutants

### 1.1 Hypothèse nulle
**Expliquer :** Énoncé d'égalité (pas de différence, pas de relation). Point de départ neutre et repère de comparaison — on ne la teste jamais directement, on l'infère via les résultats de l'hypothèse de recherche.
**Analogie :** Le présompté innocent dans un procès : on part de « pas d'effet » jusqu'à preuve du contraire.
**Confusion :** La croire inutile. Sans elle, aucun critère de décision.

### 1.2 Hypothèse directionnelle vs non directionnelle
**Expliquer :** Non directionnelle = « il y a une différence » ; directionnelle = « le groupe A > le groupe B ». La directionnelle est plus puissante (test unilatéral) mais plus risquée si la direction est inverse.
**Analogie :** Non directionnelle = « il y aura du vent » ; directionnelle = « le vent soufflera du nord ».
**Confusion :** Toujours formuler une directionnelle. La précision doit être justifiée par la littérature.

### 1.3 Significativité ≠ signification pratique
**Expliquer :** Un résultat peut être significatif (p < .05) sans être « meaningful ». Salkind : étude à 400 k$ montrant un gain de 0,2 point sur 100 — significatif, mais sans pertinence pratique.
**Analogie :** Une balance ultra-précise détecte une perte de 2 g. Statistiquement vrai, cliniquement insignifiant.
**Confusion :** Confondre p < .05 avec « le résultat compte ». Toujours compléter par la taille de l'effet.

### 1.4 Erreur de type I vs type II
**Expliquer :** Type I = rejeter une hypothèse nulle vraie (faux positif, contrôlé par alpha). Type II = accepter une hypothèse nulle fausse (faux négatif, réduit par un plus grand échantillon).
**Analogie :** Type I = condamner un innocent ; Type II = relâcher un coupable.
**Confusion :** Penser que .05 = « 5 % de chance que H₁ soit vraie ». C'est 5 % de chance de rejeter H₀ alors qu'elle est vraie.

### 1.5 Puissance statistique
**Expliquer :** Puissance = 1 – β = capacité à rejeter une hypothèse nulle fausse. Dépend de : taille de l'effet attendue, taille de l'échantillon, seuil alpha.
**Analogie :** La puissance d'un microscope : plus le grossissement (échantillon) est élevé, plus on distingue les détails.
**Confusion :** La confondre avec la significativité. Un résultat non significatif peut manquer de puissance, pas d'effet.

### 1.6 Erreur d'échantillonnage
**Expliquer :** Différence inévitable entre la statistique d'un échantillon et le paramètre de la population. Diminue quand la variabilité intra-échantillon est faible et quand n augmente.
**Analogie :** Goûter une cuillère de soupe bien remuée : l'échantillon représente bien le pot.
**Confusion :** Penser qu'un gros échantillon élimine toute erreur.

### 1.7 Validité interne vs externe
**Expliquer :** Interne = le résultat est dû à la manipulation (contrôle). Externe = le résultat se généralise (application). Plus de contrôle → plus d'interne, potentiellement moins d'externe.
**Analogie :** Laboratoire stérile (interne) vs vraie vie (externe).
**Confusion :** Penser qu'on peut maximiser les deux simultanément. C'est un compromis.

### 1.8 Fiabilité ≠ validité
**Expliquer :** Fiabilité = cohérence dans le temps (score observé ≈ score vrai). Validité = mesure ce qu'elle prétend mesurer. Fiable avant d'être valide ; fiable ne signifie pas valide.
**Analogie :** Une balance toujours constante est fiable. Si elle mesure la température, elle est fiable mais non valide.
**Confusion :** Penser qu'un instrument « bien fait » est forcément valide.

### 1.9 Variable indépendante et dépendante
**Expliquer :** VI = manipulée ou catégorisée (niveaux du traitement). VD = résultat mesuré. VD = f(VI₁, VI₂, …). Les VI doivent être indépendantes entre elles.
**Analogie :** VI = bouton de volume ; VD = niveau sonore.
**Confusion :** Appeler « VI » toute variable de l'étude. Seules les variables manipulées/comparées sont des VI.

### 1.10 Taille de l'effet
**Expliquer :** Ampleur de la différence, indépendante de n. Petit (0–.20), modéré (.20–.50), grand (> .50). Toujours reporter avec p.
**Analogie :** Significativité = « il y a un écart » ; taille de l'effet = « cet écart est grand/petit ».
**Confusion :** Ne rapporter que p. Un p minuscule avec un énorme n peut masquer un effet trivial.

---

## 2. Statistiques descriptives vs inférentielles

Règle : décrire avant d'inférer.

**Descriptives :**
- Nominale → mode | Ordinale/asymétrique → médiane | Intervalle/ratio ≈ normale → moyenne
- Dispersion : étendue (rapide), écart-type (complément de la moyenne), variance (base pour ANOVA)

**Inférentielles — SI/ALORS :**

| SI ta question… | ALORS… | Condition |
|---|---|---|
| 2 groupes diffèrent-ils ? | **t-test** | VD quantitative, n > 30 |
| 3+ groupes, 1 facteur ? | **ANOVA unifacteur** | VD quantitative |
| 3+ groupes, 2+ facteurs ? | **ANOVA multifactorielle** | VD quantitative |
| Relation entre 2 variables ? | **Corrélation de Pearson** | Quantitatives, linéaire |
| Prédire Y depuis X ? | **Régression** | Une ou plusieurs VI |
| 1 groupe vs une norme ? | **Test Z** | Distribution normale connue |
| Facteurs latents ? | **Analyse factorielle** | Données d'échelle |
| Nominales/ordinales, petit n ? | **Non paramétrique** | Chi-carré, Mann-Whitney, Friedman |

**Erreurs classiques :** corrélation ≠ causalité ; p n'est pas la probabilité de H₁ ; toujours vérifier le niveau de mesure avant de choisir le test.

---

## 3. Formulation de l'hypothèse

### Critères (Salkind, Q32)
1. **Déclarative** (pas interrogative)
2. **Relation claire** entre variables
3. **Ancrée** dans la théorie/littérature
4. **Brève et directe**
5. **Testable** — variables mesurables objectivement
6. **Compréhensible** — le lecteur saisit direction et implications

### Avant / Après

| ❌ Mauvais | ✅ Bon |
|---|---|
| « Les nageurs sont-ils plus forts ? » | « Les nageurs de compétition obtiendront des scores de force supérieurs aux coureurs sur l'échelle X. » |
| « Est-ce que lire aide les enfants ? » | « Les enfants dont les parents lisent ≥ 3 h/semaine auront des scores de compréhension supérieurs à ceux dont les parents ne lisent pas. » |
| « L'anxiété et la performance » | « Les étudiants anxieux (STAI > 60) obtiendront des scores d'examen inférieurs aux étudiants peu anxieux. » |

### Règle pour l'IA
SI hypothèse en forme de question → reformuler en déclaratif : variables opérationnalisées + direction + instrument.

---

## 4. Éthique — angles spécifiques de Salkind

**IRB :** Pas une formalité. Groupe diversifié approbant *avant* la recherche. Approbation exigée par l'institution et les financeurs. Dossier minimal : lieu, financement, résumé, population, méthodes, risques, conflits d'intérêts.

**Consentement éclairé :** Origine médicale (années 1950). Formulaire compréhensible (pas de jargon), temps de lecture suffisant. Requis : objectif, droit de refus, procédures, durées, risques, bénéfices, alternatives, confidentialité.

**Assentiment des enfants :** Consentement par procuration (parents). Pour enfants > 6 ans, Salkind recommande un formulaire d'assentiment en langage adapté — démarche de respect, pas document légal.

**Déception :** Si nécessaire, débriefing obligatoire de tous les participants. L'IRB vérifie ce point.

**Violations historiques :** Salkind cite 7 cas dont Tuskegee, Willowbrook, Milgram, et Watson/Crick (vol des données de Franklin). **Angle unique** : classer Watson/Crick comme violation éthique ancre l'éthique au-delà du terrain médical.

**Seuil .05 :** Salkind rappelle que .05 n'a **aucune base mathématique formelle**. Convention de R.A. Fisher, issue de siècles de travail actuariel. Les logiciels fournissant le p exact, cette coupure est devenue moins pertinente.
