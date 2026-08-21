# RAPPORT-LOT-11-DECISIONS.md

> **Lot 11 — Décisions E2 + E-Cat : nettoyage architectural et archivage roadmap**
> Périmètre : (1) suppression routes `/api/ai-config/*` orphelines + modèle Prisma `AiToolConfig` (décision E2), (2) archivage Horizon 2/3 dans ROADMAP.md (décision E-Cat).

---

## 0. Gouvernance

### 0.1 — Checkpoint Git

- **Tag** : `pre-e2-ecat`
- **Commit** : `d94eebe639c5c37dceb11b9463dabdb4aed0021f`

### 0.2 — Vérification qualité

| Vérification | Résultat |
|---|---|
| `npx next build` | ✅ Compiled successfully — 47 routes |
| `npx vitest run` | ✅ 52 fichiers, **1 263 tests** passants, 0 échec (−29 = tests des routes supprimées) |
| `bun run lint` | ✅ 0 erreur, 122 warnings (−32 = warnings dans les fichiers supprimés) |

### 0.3 — Extensions de périmètre

Aucune.

---

## 1. Décision E2 — Suppression des routes ai-config orphelines

### 1.1 — Fait établi avant décision

- `rg 'from.*api/ai-config' src/` → 0 résultat (aucun composant frontend n'importe les routes)
- `rg 'AiToolConfig' src/` → 0 résultat (aucun code source ne référence le modèle Prisma)
- Le hook `use-ai-config.ts` utilise exclusivement `localStorage` — aucune appel fetch vers `/api/ai-config`

### 1.2 — Éléments supprimés

| Élément | Chemin |
|---|---|
| Route GET/PUT/DELETE | `src/app/api/ai-config/route.ts` |
| Route GET/PUT/DELETE par ID | `src/app/api/ai-config/[id]/route.ts` |
| Test route principale | `src/app/api/ai-config/route.test.ts` |
| Test route par ID | `src/app/api/ai-config/[id]/route.test.ts` |
| Modèle Prisma | `AiToolConfig` (9 champs) dans `prisma/schema.prisma:237-245` |

### 1.3 — Impact

| Métrique | Avant | Après | Delta |
|---|---|---|---|
| Routes API | 49 | 47 | −2 |
| Tests | 1 292 | 1 263 | −29 |
| Fichiers test | 54 | 52 | −2 |
| Modèles Prisma | 20 | 19 | −1 |
| Lint warnings | 154 | 122 | −32 |

---

## 2. Décision E-Cat — Archivage Horizon 2/3

### 2.1 — Éléments archivés dans ROADMAP.md

Bannière d'archivage ajoutée en tête de ROADMAP.md, listant :
- Epic 1.2 (Authentification & Licences)
- Epic 6.2 (Visualisation SVG 6 types)
- Epic 6.3 tâches 6.3.2 (Export Office), 6.3.3 (Excalidraw)
- Epic 7.2 (Sécurité — auth, rate limiting, CSRF)
- Epic 7.3 tâches 7.3.5 (PostgreSQL), 7.3.6 (CI/CD), 7.3.7 (Monitoring)

Justification : périmètre SaaS multi-utilisateur, incompatible avec le cas d'usage actuel (outil mono-utilisateur local).

### 2.2 — DT fermées par renoncement

| DT | Élément | Statut |
|---|---|---|
| DT-06 | Dualité AI config | ✅ Résolu par suppression (décision E2) |
| DT-08 | RoutesMe simule le multi-modèle | ✅ Fermé par renoncement (E-Cat) |
| DT-09 | CustomBookSkill jamais utilisé | ✅ Fermé par renoncement (E-Cat) |
| DT-10 | Fiches corpus jamais consultables | ✅ Fermé par renoncement (E-Cat) |

---

## 3. Mises à jour documentaires

| Document | Modification |
|---|---|
| `ETAT-PROJET-THESISFRAME.md` §3 | DT-06/08/09/10 déplacés vers « résolus ». DT ouvertes : 2 (DT-05, DT-07) |
| `ETAT-PROJET-THESISFRAME.md` §4 | « Décisions en attente » → « Décisions tranchées » avec E2 (suppression) et E-Cat (archivage) |
| `ETAT-PROJET-THESISFRAME.md` §5 | Ligne Lot 11 ajoutée |
| `ETAT-PROJET-THESISFRAME.md` §6 | Routes 47, tests 1 263, 52 fichiers, 122 warnings, 19 modèles, 2 DT ouvertes, 0 décisions en attente |
| `ROADMAP.md` | Bannière d'archivage en tête, items Horizon 2/3 listés |

---

## 4. Bilan

| Item | Statut |
|---|---|
| E2 (suppression ai-config) | ✅ Exécuté |
| E-Cat (archivage Horizon 2/3) | ✅ Exécuté |
| DT-06 | ✅ Résolu (suppression) |
| DT-08, DT-09, DT-10 | ✅ Fermés (renoncement) |
| Build | ✅ Compiled successfully |
| Tests | ✅ 1 263 passants, 0 échec |
| Lint | ✅ 0 erreur, 122 warnings |
| Décisions en attente | 0 |
| DT ouvertes | 2 (DT-05, DT-07) |
| Extensions de périmètre | Aucune |
| Commit | `PLACEHOLDER_HASH` |
