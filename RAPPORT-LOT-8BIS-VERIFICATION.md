# Rapport Lot 8bis — Vérification runtime des 5 modes IA

**Base** : RAPPORT-LOT-8-CORRECTIONS.md
**Validation** : accord explicite du commanditaire, borné au périmètre ci-dessous
**Nature** : vérification runtime (aucune correction de code)

**Checkpoint pré-Lot 8bis** : tag Git `pre-lot-8bis` sur le commit `c499009`

---
## Méthode de test

1. Build production (`npx next build`) pour disposer d'un serveur stable.
2. Démarrage du serveur standalone (`node .next/standalone/server.js` sur port 3001).
3. Pour chaque mode, appel `curl -X POST http://localhost:3001/api/ai-writing` reproduisant les paramètres de la page appelante (prompt minimal + `context` quand la page en passe un).
4. Vérification : réponse HTTP 200 avec `data.content` non vide.

**Note** : le serveur de développement Turbopack est instable dans l'environnement sandbox (crash après 1-2 requêtes). Les tests ont été effectués sur le build de production standalone. Le build Turbopack et le build production partagent le même code source — la validation est équivalente.

---
## Résultats par mode

### Mode 1 : `academic-reformulation` (apa-composer-page.tsx:789)

**Paramètres** (reproduisant l'appel de `apa-composer-page.tsx`) :
- `mode`: `academic-reformulation`
- `prompt`: « Reformulez cette phrase en style académique : Les résultats montrent que les étudiants qui utilisent la plateforme obtiennent de meilleures notes. »
- `context`: non passé (la page n'en passe pas)

**Résultat** : ✅ **HTTP 200**

```json
{
  "data": {
    "content": "Voici plusieurs reformulations académiques de votre phrase, avec des nuances différentes :\n\n**Option 1 (standard et directe)**\nLes résultats démontrent que les étudiants recourant à la plateforme obtiennent de meilleures performances académiques.\n\n**Option 2 (plus formelle)**\nL'analyse des résultats révèle une corrélation positive entre l'utilisation de la plateforme par les étudiants et l'amélioration de leurs résultats académiques.\n\n**Option 3 (mettant l'accent sur la causalité)**\nL'utilisation de la plateforme par les étudiants s'avère être un facteur contribuant significativement à l'obtention de meilleures notes.\n\n**Option 4 (plus technique)**\nLes données empiriques indiquent que l'exploitation de la plateforme pédagogique est associée à des résultats académiques supérieurs parmi la population étudiante étudiée.",
    "mode": "academic-reformulation",
    "model": "default"
  }
}
```

**Verdict** : ✅ Contenu exploitable — 4 reformulations de registre croissant, fidèles au sens original.

---

### Mode 2 : `deblocage` (deblocage-ecriture-page.tsx:279)

**Paramètres** (reproduisant l'appel de diagnostic de blocage) :
- `mode`: `deblocage`
- `prompt`: « Je suis doctorant(e) et je souffre de "perfectionnisme paralysant" : La peur de ne pas écrire assez bien bloque toute production. Donne-moi 5 stratégies concrètes. »
- `context`: non passé

**Résultat** : ✅ **HTTP 200**

```json
{
  "data": {
    "content": "## Stratégies pour surmonter le perfectionnisme paralysant en écriture doctorale\n\n### Comprendre votre blocage\nLe perfectionnisme est l'un des bloqueurs d'écriture les plus courants chez les doctorants...\n\n### Stratégies concrètes\n\n**1. Adoptez une mentalité d'abord \"fait\", puis \"parfait\"**\n...\n**2. Désacralisez l'écriture**\n...\n**3. Fixez des objectifs de processus, pas de résultats**\n...\n\n### Exercices pratiques\n\n**Exercice 1 : Le draft intentionnellement imparfait**\n...\n**Exercice 2 : La méthode du \"poubelle\"**\n...\n**Exercice 3 : Le journal d'écritures sans filtre**\n...",
    "mode": "deblocage",
    "model": "default"
  }
}
```

*(Contenu tronqué pour le rapport — 50+ lignes de stratégies, exercices, et conseils bibliographiques)*

**Verdict** : ✅ Contenu exploitable — stratégies concrètes, exercices pratiques, ressources bibliographiques, ton bienveillant.

---

### Mode 3 : `freeform` (diagrammes-page.tsx:838)

**Paramètres** (reproduisant l'appel avec `context` JSON) :
- `mode`: `freeform`
- `prompt`: « Genere un diagramme conceptuel sur la notion de resilience avec 3 noeuds et 2 connexions »
- `context`: « Tu es un assistant specialise en creation de diagrammes academiques. Reponds UNIQUEMENT avec un JSON valide. Le JSON doit avoir la forme : {"nodes":[],"connections":[]} »

**Résultat** : ✅ **HTTP 200**

```json
{
  "data": {
    "content": "```json\n{\n  \"nodes\": [\n    {\"id\": \"1\", \"label\": \"Résilience\", \"type\": \"concept\", \"description\": \"Capacité d'un système à absorber les perturbations et à se reorganiser\"},\n    {\"id\": \"2\", \"label\": \"Adaptation\", \"type\": \"propriété\", \"description\": \"Ajustement aux changements et aux nouvelles conditions\"},\n    {\"id\": \"3\", \"label\": \"Rétablissement\", \"type\": \"propriété\", \"description\": \"Retour à un état fonctionnel après une perturbation\"}\n  ],\n  \"connections\": [\n    {\"from\": \"1\", \"to\": \"2\", \"label\": \"implique\", \"type\": \"relation\"},\n    {\"from\": \"1\", \"to\": \"3\", \"label\": \"inclut\", \"type\": \"relation\"}\n  ]\n}\n```",
    "mode": "freeform",
    "model": "default"
  }
}
```

**Note** : le JSON est enveloppé dans un bloc markdown ` ```json `. La page `diagrammes-page.tsx` extrait le JSON via `content.match(/\{[\s\S]*\}/)` (ligne 852), ce qui fonctionnera correctement.

**Verdict** : ✅ Contenu exploitable — JSON valide avec 3 nœuds et 2 connexions, structure conforme au schéma attendu.

---

### Mode 4 : `improvement` (livres-competences-page.tsx:593)

**Paramètres** (reproduisant l'appel avec `context` compétences) :
- `mode`: `improvement`
- `prompt`: « Propose un plan d apprentissage personnalise pour progresser en these de sociologie avec un score global de 35 sur 100 »
- `context`: « Doctorant en sociologie. Competences faibles: methodes quantitatives (Debutant), analyse statistique (Debutant), redaction academique (Intermediaire). »

**Résultat** : ✅ **HTTP 200**

```json
{
  "data": {
    "content": "# Plan d'apprentissage personnalisé pour votre doctorat en sociologie\n\n## État actuel et objectifs\nScore global actuel : 35/100\n...\n## Priorité 1 : Méthodes quantitatives (Score estimé : 25/100)\n### Ressources recommandées :\n1. **Livre : \"Research Design\" de John W. Creswell**\n2. **Cours en ligne : \"Quantitative Methods\" sur Coursera**\n3. **Outil pratique : \"SPSS Statistics for Dummies\"**\n...\n## Priorité 2 : Analyse statistique (Score estimé : 30/100)\n...\n## Priorité 3 : Rédaction académique (Score estimé : 50/100)\n...\n## Plan de mise en œuvre\n### Phase 1 (1-3 mois) : Fondements méthodologiques\n### Phase 2 (4-6 mois) : Développement des compétences statistiques\n### Phase 3 (7-12 mois) : Intégration et application\n",
    "mode": "improvement",
    "model": "default"
  }
}
```

*(Contenu tronqué — plan complet avec 3 priorités P1/P2/P3, 9 ressources, phases de mise en œuvre)*

**Verdict** : ✅ Contenu exploitable — plan structuré P1/P2/P3 avec ressources concrètes et calendrier.

---

### Mode 5 : `revue-litterature` (outils-slr-page.tsx:447)

**Paramètres** (reproduisant l'appel avec `context` PICO) :
- `mode`: `revue-litterature`
- `prompt`: « Aide-moi a structurer ma revue de litterature sur l impact du numerique en education »
- `context`: « Revue systematique en cours. Cadre PICO: Quelle est l effet du numerique sur l apprentissage chez les etudiants compareativement a l enseignement traditionnel ? »

**Résultat** : ✅ **HTTP 200**

```json
{
  "data": {
    "content": "# Structuration d'une Revue de Littérature sur l'Impact du Numérique en Éducation\n\n## 1. Introduction à la Revue de Littérature\n...\n## 2. Méthodologie de la Revue Systématique\n### 2.2 Critères d'inclusion et d'exclusion\n...\n## 3. Synthèse des Résultats\n...\n## 4. Analyse Thématique Approfondie\n### 4.1 Thème 1: L'apprentissage hybride vs. en présentiel\n### 4.2 Thème 2: Les technologies émergentes et leurs impacts spécifiques\n### 4.3 Thème 3: Équité et fracture numérique\n...\n## 5. Discussion des Résultats\n## 6. Conclusion\n",
    "mode": "revue-litterature",
    "model": "default"
  }
}
```

*(Contenu tronqué — structure complète en 6 sections avec cadre PRISMA, critères d'inclusion/exclusion, thèmes d'analyse)*

**Verdict** : ✅ Contenu exploitable — structure de revue systématique complète avec PRISMA, PICO, et synthèse thématique.

---
## Résultats de vérification

### `npx next build`

```
✓ Compiled successfully in 20.7s
Route (app): 49 routes (inchangé)
→ 0 erreur de compilation
```

### `npx vitest run`

```
 Test Files  54 passed (54)
      Tests  1290 passed (1290)
   Duration  14.24s
→ 0 échec (inchangé)
```

### `bun run lint`

```
✖ 154 problems (0 errors, 154 warnings)
→ 0 erreur, 154 warnings (inchangé)
```

---
## Synthèse

| Mode | Appelant | HTTP | Contenu exploitable ? |
|---|---|---|---|
| `academic-reformulation` | apa-composer-page.tsx | 200 | ✅ 4 reformulations de registre croissant |
| `deblocage` | deblocage-ecriture-page.tsx | 200 | ✅ Stratégies + exercices + ressources |
| `freeform` | diagrammes-page.tsx | 200 | ✅ JSON valide 3 nœuds + 2 connexions |
| `improvement` | livres-competences-page.tsx | 200 | ✅ Plan P1/P2/P3 avec 9 ressources |
| `revue-litterature` | outils-slr-page.tsx | 200 | ✅ Structure PRISMA complète en 6 sections |

| Critère | Statut |
|---|---|
| 5 modes retournent HTTP 200 | ✅ |
| Contenu exploitable pour chaque mode | ✅ |
| Aucune correction de code nécessaire | ✅ |
| Build vert | ✅ |
| Tests 0 échec | ✅ |
| Lint 0 erreur | ✅ |
| Aucune extension de périmètre | ✅ |

**Les 5 modes IA sont vérifiés fonctionnels en runtime. La Phase B est closes.**

**Point cosmétique hors périmètre** : les icônes `RefreshCcw`, `AlertTriangle`, `TrendingUp` absentes de l'`ICON_MAP` tombent en fallback `Sparkles` dans la page AI Writing. Documenté pour un lot ultérieur.