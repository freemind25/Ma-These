# 05 — Audit Robustesse, Fiabilité et Performance (Phase 5)

## 10.1 Gestion des erreurs (constats réels)

| Scénario provoqué/observé | Comportement | Verdict |
|---|---|---|
| API appelée avec paramètres manquants (export-docx `{}`) | 400 + JSON d'erreur métier explicite, pas de stack leak | ✅ |
| Injection SQL dans query string (`' OR 1=1--`) | 200, traitée en littéral (Prisma paramétré), count 0 | ✅ |
| Endpoint IA indisponible / mode inconnu | 400 sémantique (« Mode d'écriture non trouvé » + liste), bascule stream fonctionnelle | ✅ |
| Service externe Overpass (géomatique) | **HTTP 000 — inatteignable depuis l'environnement** (retest ce cycle) ; timeouts absents dans osm-infra.ts (audit 03) | ⚠️ DÉGRADÉ (AUD-REL-001) |
| Crash serveur pendant la session d'audit | Aucun : dev.log sans erreur fatale sur l'ensemble du parcours (uniquement polling worker) | ✅ |
| Erreur 404 route inexistante | Standard Next.js (non testée explicitement — contrôles priorisés) | ⚠️ NON VÉRIFIÉ |

## 10.2 Concurrence et opérations répétées

| Contrôle | Résultat | Verdict |
|---|---|---|
| Anti-doublon worker Job | Démarrage unique (instrumentation.ts, garde globalThis), claim atomique `updateMany … startedAt < cutoff`, sweep 60 s, reprise des orphelins au boot | ✅ (code + preuves cycles antérieurs) |
| Anti-stack OCR | Garde globale « un job OCR à la fois » prouvée sur 9 jobs enchaînés (cycle 2026-10-08, RSS plat) | ✅ |
| Double-clic / double soumission | **Un `POST 400` suivi de `POST 201` observé** sur création référence (1 clic) → suspicion de double event, reproduite une fois, à investiguer | ⚠️ à investiguer (AUD-FUNC-005) |
| Deux onglets même projet | NON VÉRIFIÉ (hors budget du cycle) | ⚠️ NON VÉRIFIÉ |

## 10.3 Performance (mesures réelles de ce cycle, 2026-10-09)

| Mesure | Valeur mesurée | Condition |
|---|---|---|
| GET `/` (premier rendu) | 164 ms (compile 3 ms) | dev local |
| GET `/api/references` | 33 ms | 4 refs |
| GET `/api/stats` | 68 ms | — |
| GET `/api/jobs?limit=3` | 711 ms | jointures jobs |
| POST `/api/references` | 21 ms | création |
| POST `/api/ai-writing/stream` | 2,2 s (génération LLM complète) | stream |
| GET `/api/theses-en-ligne/search` | 1,51 s | API externe HAL/theses.fr |
| POST `/api/export-docx` | 691 ms → fichier 16,5 Ko (38 ¶) | thèse 2 295 mots |
| RSS next-server | **2 560 Mo** | machine 4 Go (3 477 utilisés, 269 libres) |
| Pic OCR antérieur (9 jobs, 127 p.) | 2,66 Go, aucun OOM, aucun redémarrage | cycle import-rar 2026-10-08 |

**Seuils** : aucun seuil contractuel n'existe ; valeurs ci-dessus = **référence baseline v1.0** pour comparaisons futures. Lecture : temps de réponse bons hors endpoints externes ; la marge mémoire (2,56/4 Go) est **réelle mais gérée** (fix OOM + purge prouvés) — surveiller à l'ajout de fonctionnalités gourmandes. Documents volumineux : PDF 25,8 Mo max testé OK (imports RAR) ; limite 50 Mo codée (413).

## 10.4 Résilience et récupération

| Contrôle | Résultat | Verdict |
|---|---|---|
| Reprise après crash (worker) | Reprise des jobs orphelins au boot prouvée en cycle antérieur (rollback 2026-10-08 : corpus 12/12 reconstruit, OCR déterministe identique à l'octet) | ✅ |
| Interruption pendant traitement OCR | Job reste en DB, statut failed/pending honnête, reprise possible ; échec honnête documenté (« aucune image exploitable ») | ✅ |
| Sauvegarde/restauration DB | **AUCUNE procédure automatisée documentée** ; la seule restauration réelle = manuelle (/tmp) lors du rollback 2026-10-08 ; **db:push --accept-data-loss** en script standard = risque documenté | ❌→⚠️ AUD-GOV-001 (DÉGRADÉ, domaine le plus fragile) |
| Quota IA dépassé | Bascule OpenRouter backup + OpenAlex→CrossRef/HAL observées en direct (audit 2026-09-18) | ✅ |
| Boucles de réessai | Retry bornés (directeur-chat timeout borné testé 18/18, audit antérieur) | ✅ |

**Synthèse Phase 5** : robustesse réelle bonne (worker, OCR, reprise, quotas), deux fragilités : **pas de sauvegarde DB outillée** (le seul incident de perte réel de l'historique : rollback du 2026-10-08) et **Overpass sans timeout** (service indisponible → risque de blocage si activé).
