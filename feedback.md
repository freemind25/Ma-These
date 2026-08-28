# Processus de feedback — De la divergence à la convergence

> **Version :** v1.8.4 | 28 août 2026
> **Statut :** actif
> **Lié :** AGENTS.md règle #9, docs/ARCHITECTURE-CONNAISSANCE.md §7

---

## Principe

Toute divergence de comportement entre modes IA, ou tout retour utilisateur signalant une incohérence, n'est **jamais** corrigé dans un prompt individuel. C'est un signal d'un **trou dans le knowledge-core**.

Ce document définit le processus pour capturer, trier, corriger et valider.

---

## 1. Capture — Comment un signal est identifié

### Sources possibles

| Source | Exemple | Fiabilité |
|--------|---------|-----------|
| **Retour utilisateur direct** | « Le mode grammaire me dit X mais le directeur me dit le contraire » | ⭐⭐⭐ Fort — vécu réel |
| **Test de validation** | T4 : citation littérale traitée différemment par 2 modes | ⭐⭐⭐ Fort — reproductible |
| **Audit de prompts** | T6 : scan systématique des 9 routes → doublon détecté | ⭐⭐⭐ Fort — exhaustif |
| **Revue de code** | Un contributeur repère une règle dupliquée | ⭐⭐ Moyen — dépend du réviseur |
| **Auto-observation** | L'agent IA lui-même signale une incohérence | ⭐ Faible — à vérifier |

### Format de signalement

Quand un signal est identifié, le documenter ainsi :

```
SIGNAL [date]
Source : [utilisateur / test / audit / revue]
Modes concernés : [liste des modes qui divergent]
Description : [ce qui est observé, citation exacte si possible]
Exemple concret : [le texte soumis + la réponse de chaque mode]
```

---

## 2. Triage — Est-ce un trou du noyau ?

### Critère de décision

| Question | OUI → Noyau | NON → Autre |
|----------|-------------|-------------|
| La règle manquante serait utile à un **autre** mode ? | ✅ knowledge-core | ❌ Spécialisation locale |
| Le contenu est du **savoir métier** (règle, critère, norme) ? | ✅ knowledge-core | ❌ Rôle/format → shared-prompts.ts |
| La correction impacte le **token budget** ? | ✅ knowledge-core (mesurer) | ❌ Ne concerne pas le noyau |

### Décisions possibles

| Décision | Action | Fichier cible |
|----------|--------|--------------|
| **TROU NOYAU** | Ajouter/modifier une règle dans un module | `knowledge-core.ts` |
| **DUPLICATION** | Extraire vers shared-prompts.ts ou le noyau | `shared-prompts.ts` ou `knowledge-core.ts` |
| **FORMAT LOCAL** | Ajuster le format de sortie dans la spécialisation | `specializations/*.ts` ou route |
| **FAUX POSITIF** | Documenter pourquoi ce n'est pas un trou | worklog.md |
| **BESOIN INFO** | Demander plus de contexte au signalant | — |

---

## 3. Correction — Comment modifier le noyau

### Étapes obligatoires

1. **Identifier le module cible** — quel module de connaissance est concerné ?
   - Référence : les 11 modules listés dans AGENTS.md
   - Si aucun module existant ne convient → évaluer si un nouveau module est justifié

2. **Vérifier la règle de migration**
   - > Un critère migre vers le noyau si un AUTRE mode pourrait en avoir besoin.
   - Si la réponse est non → la correction va dans la spécialisation, pas le noyau.

3. **Rédiger la correction**
   - Style : phrase courte, affirmative, un seul concept par ligne
   - Source : citer l'ouvrage de référence si applicable (Kumar, Ollhoff, White…)
   - Pas de jargon interne — un nouveau contributeur doit comprendre

4. **Retirer les duplications**
   - Rechercher le concept dans toutes les spécialisations et routes
   - `rg "concept_clé" src/` pour vérifier
   - Supprimer toute occurrence redondante

5. **Mesurer l'impact token**
   - Compter les tokens du module modifié
   - Vérifier que le full core reste ≤ 4 500 et chaque mode ≤ son budget
   - Si dépassement : merger ou condenser, ne jamais supprimer un module entier

---

## 4. Validation — Prouver la convergence

### Checklist avant de considérer la correction terminée

- [ ] `bun run lint` → 0 erreurs
- [ ] `bun run test:run` → tous les tests passent (0 failure)
- [ ] `rg "ancienne_formulation" src/` → 0 résultat (si suppression)
- [ ] Token budget vérifié (full core ≤ 4 500)
- [ ] Au moins 2 modes concernés testés manuellement avec le même input
- [ ] Les réponses convergent (même position, même niveau de détail)

### Test de convergence (si applicable)

Reproduire le scénario qui a révélé le trou :
1. Soumettre le même texte au(x) mode(s) qui divergeaient
2. Vérifier que les réponses sont maintenant cohérentes
3. Documenter le résultat dans le worklog

---

## 5. Documentation — Tracer la correction

### Worklog

Chaque correction est enregistrée dans `worklog.md` :

```
---
Task ID: <numéro>
Agent: <nom>
Task: Feedback — <description courte>

Work Log:
- Signal : <source, date, description>
- Triage : <décision + justification>
- Correction : <module modifié, avant/après>
- Impact token : <avant → après>
- Validation : <résultats tests + convergence>

Stage Summary:
- <résumé en 2-3 lignes>
```

### AGENTS.md

Si la correction change l'architecture (nouveau module, nouveau fichier, changement de pattern) : mettre à jour AGENTS.md et incrémenter la version.

---

## 6. Cas d'usage typiques

### Cas A — Divergence inter-modes (type T4)
```
Signal : Le directeur tolère les citations littérales longues,
        le peer-review les signale comme plagiat potentiel.
Triage : TROU NOYAU — les deux modes ont besoin de la même règle.
Correction : Ajouter dans module coherence/référentielle :
  « Citation littérale > 40 mots = bloc indenté obligatoire + référence.
   Sans bloc indenté = signal de plagiat potentiel à vérifier. »
Validation : Tester les deux modes avec un texte contenant une citation de 60 mots.
Résultat : Les deux modes signalent désormais le même besoin de bloc indenté.
```

### Cas B — Duplication détectée par audit (type T6)
```
Signal : PROMPT_GENERIQUE identique dans verification-carto et types-analyse/seed.
Triage : DUPLICATION — c'est du rôle/format, pas du savoir.
Correction : Extraire dans shared-prompts.ts → SOCRATIC_QUESTIONER_PROMPT.
Validation : grep PROMPT_GENERIQUE → 0 résultat. Lint + tests OK.
```

### Cas C — Retour utilisateur (type nouveau)
```
Signal : « Le mode hypothesis me demande un design expérimental
        alors que ma thèse est qualitative. »
Triage : TROU NOYAU — le module methodology ne distingue pas
          les exigences qualitatives vs quantitatives.
Correction : Ajouter dans module methodology :
  « Recherche qualitative : pas de design expérimental requis.
   Vérifier la saturation théorique, la triangulation, et la transferabilité.
   Recherche quantitative : design expérimental ou quasi-expérimental requis. »
Validation : Tester hypothesis + methodology avec un cadrage qualitatif.
```

---

## 7. Ce que ce processus N'EST PAS

- ❌ Un ticket system — pas de Jira, pas de board. Le worklog suffit.
- ❌ Un processus automatisé — chaque correction est humainement validée.
- ❌ Un registre de bugs — les divergences ne sont pas des bugs, ce sont des **signaux d'apprentissage du système**.
- ❌ Une porte d'entrée pour du contenu non académique — seules les corrections issues de sources méthodologiques validées vont dans le noyau.
