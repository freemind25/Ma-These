# 23 — Dossier AUD-SEC-004 : constat à jour, justification du résiduel et options de traitement

**Cycle** : audit-final-v1.2 — réponse à l'exigence propriétaire 6.4 (« aucun défaut sécurité laissé ouvert » : traiter OU justifier explicitement)
**Source** : 04_SECURITY_AUDIT.md §8 (AUD-SEC-004, pondérée Basse) · registre 09 l.99-100 + l.154 · 22_RAPPORT_POUR_DEV §AUD-SEC-004
**Portée de ce document** : mesure à HEAD, modèle de menace, contrôles compensatoires, analyse de risque résiduel, plan de traitement progressif, décision demandée. **Aucune modification de code effectuée ni proposée sans décision** (red line cycle v1.2).
**Mise à jour 2026-10-10 (3ᵉ décision propriétaire)** : les options A/B/C (§6) sont présentées au propriétaire avec risques, charge estimée, couverture réelle et conséquences sur le GO final. Préférence exprimée : un traitement complet si réalisable dans un périmètre maîtrisé, sinon plan priorisé + justification des risques résiduels. **Aucune option n'est considérée comme acceptée avant décision écrite.**
**Mise à jour 2026-10-11 — DÉCISION FORMALISÉE (confirmation écrite du propriétaire)** : **D1 = C-B** (lot 1 sur les 10 routes destructives, revalidation complète + nouveau candidat — **bloqué** jusqu'à levée expresse P7 + GO spécifique) · **D4 = D4-accept** (réévaluation obligatoire avant toute diffusion large, inscrite au registre) · **D5 = D5-accept** (paramétrage des 2 raw SQL GET reporté au backlog v1.3, sous-tâche P3). Traçabilité D6 exécutée : registre 09 + doc 04 + doc 23/31/35. Détail d'exécution : doc 35 (périmètre §2, fichiers §3, tests §4, calendrier §5, refigeage §6).

---

## 1. Constat à jour (recompte exact à HEAD)

### 1.1 Méthode (reproductible)

```
find src/app/api -name "route.ts"                        → 99 fichiers
grep -rlE "import .* from ['\"](zod|zod/v4)['\"]"        → 58 fichiers avec zod
grep -rl "api-schemas" (dans src/app/api/**/route.ts)    → 23 fichiers, TOUS inclus dans les 58
grep -n "catch" / "typeof body" / "db.<modèle>.<write>"  → classification par route
```

Mesure croisée au commit baseline `2156a8f` (v1.0) : 99 fichiers route.ts, 58 avec zod, 23 avec api-schemas (recouvrement total) — **identique à HEAD**. Les 2 seules routes modifiées depuis la baseline (`thesis/route.ts` : select + partId/sortOrder, AUD-FUNC-007 ; `paper2code/generate/route.ts` : 503 JSON explicite, A1L3B-01 — commit `fb60ae1`) ne changent pas la posture de validation.

### 1.2 Chiffres exacts à HEAD

| Indicateur | v1.0 (audit 03 §2.7) | **Recompte à HEAD** |
|---|---|---|
| Fichiers `route.ts` sous `src/app/api` | « 98 » | **99** (identique au commit baseline ; le « 98 » v1.0 était une sous-estimation de comptage) |
| Avec zod (`from "zod"` ou `"zod/v4"`) | 58 | **58** (55 `zod/v4` + 3 `zod`) |
| Avec schémas partagés `@/lib/api-schemas` | 23 (recouvrement partiel annoncé) | **23, recouvrement TOTAL** (tous les 23 importent aussi zod) |
| **Sans zod ni api-schemas** | **« 40/98 »** | **41/99** |

L'écart « 40/98 » → « 41/99 » est un écart de convention de comptage documenté, pas une régression : le ratio réel est stable (41 % des routes sans schéma déclaré à la baseline comme à HEAD).

### 1.3 Les 41 routes sans schéma, par criticité

**Catégorie D — mutantes avec écriture base (10 routes)** — surface la plus sensible :

| Route | Méthodes mutantes | Écritures DB (lignes) | Validation existante |
|---|---|---|---|
| `article-imports` | POST, DELETE | `ImportedDoc.create` (l.121) / `.delete` (l.195) | **Chaîne upload dédiée réelle** : MIME liste blanche + magic bytes + double contrôle taille 50 Mo (audit 04 §2, verdict ✅ CONFORME) |
| `references/import` | POST | `Reference.create` (l.105, batch BibTeX/RIS/CSL-JSON) | Parsers dédiés (src/lib/parsers), sans bornes déclarées |
| `research-tabs/[id]` | PUT, DELETE | `ResearchTab.update` (l.51) / `.delete` (l.89) | Garde d'existence → 404 (l.41-44) ; normalisation fallback JSON.stringify |
| `thesis/[id]/research-tabs` | POST | `ResearchTab.create` (l.56) | Contrôles typeof partiels (4) |
| `thesis/[id]/doctoral-toolbox` | POST, PUT | `DoctoralToolbox.create` (l.53) / `.update` (l.95) | Normalisation défensive typeof + fallback JSON.stringify (l.56-59, 99-108), garde 404 — pas de rejet de payload |
| `veille` | POST | `SavedSearch.create` (l.104) | **Validation manuelle réelle** : typeof + trim + enum source + 400 explicites (l.61-99) |
| `veille/[id]` | DELETE, PATCH | `SavedSearch.update` (l.58) / `.delete` (l.89) | Partielle (1 typeof) |
| `veille/[id]/results` | PATCH | `SavedSearchResult.updateMany` **scoppé** `savedSearchId` (l.70, 85) | 400 explicites (l.61-64, 92) ; updateMany borné à la veille parente |
| `veille/[id]/check` | POST (indirect) | via `runCheckForSavedSearch` → `savedSearchResult.createMany/deleteMany`, `savedSearch.update` (lib/veille/run-check.ts l.214/245/272/281) | Garde d'existence côté lib |
| `types-analyse/seed` | POST | `TypeAnalyseMethodologique.create` (l.106) | Aucune garde relevée |

**Catégorie C — POST calcul / appel externe, SANS écriture base (15 routes)** : `ai-test` (le contre-exemple v1.0 : `{}` accepté en 200, audit 04 T1), `alignement-preuves`, `apinex/chat`, `apinex/web-search`, `articles/export-docx`, `citation-check`, `coherence-check`, `deep-research`, `directeur-chat`, `export-docx`, `geo-mcp`, `osm-infra`, `paper2code/generate`, `stats-recompute` (calcul statcheck pur, sans DB), `text-prediction`, `thesis-rag`, `translate`, `verification-publication`. Une requête malformée ne peut y produire qu'un 400/500 ou un appel externe dégradé — aucune persistance.

**Catégorie L — GET lecture seule (16 routes)** : `ai-keys`, `ai-models`, `ai-probe`, `apinex/balance`, `apinex/models`, `arxiv/search` (cache mémoire uniquement — le `cache.delete` l.244 est un Map en process, pas la base), `books`, `chapters/[id]/versions`, `jobs/[id]`, `journaux-oa`, `references/bibtex`, `route.ts` (index API), `search`, `stats`, `theses-en-ligne/search`, `theses/stats`. Plusieurs valident déjà leurs searchParams manuellement (`arxiv/search` : 3 contrôles ; `theses-en-ligne/search` : 4 ; `books` : garde zod d'URL vide → 400, prouvé en UI réelle — reserved-views-revalidation.json).

**Synthèse** : 10/41 routes mutantes (24 %), dont 4 avec validation manuelle réelle ou chaîne upload dédiée ; 15/41 sans écriture ; 16/41 en lecture. Les 58 routes avec zod couvrent l'essentiel du CRUD métier persistant (thèses, chapitres, parties, cadrages, références, sources, sprints/stories, entrées carnet — schémas partagés client/serveur testés, `api-schemas.test.ts`).

---

## 2. Modèle de menace honnête

### 2.1 Qui peut atteindre ces routes ?

- **Dev/preview web** : serveur Next sur `localhost:3000` — interfaces de loopback uniquement.
- **Desktop Tauri (cible de distribution)** : le serveur Next standalone est spawné avec `HOSTNAME=127.0.0.1`, port 14325 (`src-tauri/src/lib.rs` l.11, l.15, l.214-215) — **écoute loopback exclusivement, jamais 0.0.0.0**.
- Donc : la webview de l'app, le navigateur local de l'utilisateur, et tout processus déjà exécuté sur la machine. **Pas d'exposition réseau multi-tenant, pas d'authentification multi-utilisateurs — par conception** (baseline §2 ; contrôles N/A explicitement posés dans 04 §8 : auth, sessions, isolation multi-users, rate-limiting par utilisateur, CSRF inter-sites classique).

**Vecteur distant unique honnêtement identifiable** : un site web visité dans le navigateur de la machine peut émettre des requêtes vers `http://127.0.0.1:14325` (ou `:3000` en dev) pendant que le serveur tourne (requêtes dites « cross-origin locales »). Précisions factuelles : (a) les réponses ne sont pas lisibles par le site distant (aucun header CORS permissif relevé), (b) l'écriture exigerait de deviner les contrats exacts et les identifiants cuid, (c) **une validation zod ne corrige PAS ce vecteur** — elle valide la forme du payload, pas son origine ; le contrôle pertinent serait une vérification d'origine (header Origin/Host) côté serveur, absente aujourd'hui (constat documenté, hors périmètre AUD-SEC-004, voir §4-S3 et §6-D4).

### 2.2 Que produit une requête malformée ? (vérifié, pas supposé)

| Effet redouté | Réalité constatée | Preuve |
|---|---|---|
| Injection SQL | **Prisma paramétré** : payload SQL traité comme littéral (T3 live : `search=' OR 1=1--` → 200, count 0, pas d'erreur). SQL brut = 2 `SELECT` `$queryRawUnsafe` (`book-skills/route.ts` l.19, `legal-refs/route.ts` l.17) avec échappement manuel `'`→`''` — mitigation standard en contexte chaîne SQLite, moins robuste qu'un paramétrage ; ces 2 routes SONT dans les 58 avec zod (point d'attention distinct, §6-D5). Un `$executeRawUnsafe` (`VACUUM INTO`, `lib/backup.ts` l.36) reçoit un chemin serveur, jamais une entrée requête | 04 §4 T3 + lecture code HEAD |
| Crash du process | Handlers enveloppés try/catch sur **39/41** routes sans zod ; les 2 exceptions (`ai-keys`, `route.ts`) sont des GET statiques sans entrée. Next.js encapsule de toute façon les exceptions de handler → réponse 500, le process survit (prouvé en exploitation : 2 OOM vagues 2 liés à la mémoire, jamais à un payload) | grep catch ×41 + 04 T1 |
| Fuite de détails internes | Réponses d'erreur = message générique JSON ; aucune stack dans les réponses live (T1/T3). Réserve AUD-SEC-007 séparée (certains `error.message` bruts côté IA, P3 non bloquant local) | 04 §8 |
| Corruption de base | Prisma valide à l'exécution contre le schéma : type ou champ inconnu dans `data` → `PrismaClientValidationError` → catch → 500 JSON, **aucune écriture partielle** ; `where` inexistant → 404 (gardes présentes, échantillon `research-tabs/[id]` l.41-44) ou erreur Prisma P2025 capturée ; DELETE ciblés par id unique — **aucun deleteMany/updateMany non scoppé dans les 10 routes mutantes** (le seul updateMany, `veille/[id]/results`, est borné `savedSearchId`) | Lecture code HEAD + comportement Prisma 6 |
| Écriture de valeurs aberrantes | Possible sur les champs « normalisés » par fallback (`JSON.stringify(body.x)` dans doctoral-toolbox, research-tabs) : un objet arbitraire est sérialisé en texte — problème de **qualité de données**, pas de sécurité ; en mono-utilisateur, l'auteur de la donnée aberrante est l'utilisateur lui-même | l.56-59 doctoral-toolbox |
| Limite honnête de TypeScript strict | `strict: true` (tsconfig.json) protège le code interne, mais à la frontière HTTP les corps sont typés par cast (`as` — `thesis-rag` l.12-15, `export-docx` l.923) : **TS ne garantit rien sur un payload entrant**. La validation effective à la frontière = runtime Prisma + gardes manuelles, pas le compilateur | tsconfig + lectures |

### 2.3 Conclusion du modèle de menace

La surface exploitée par AUD-SEC-004 n'est **pas démontrable comme exploitable à distance** (loopback only, pas d'auth à contourner, pas d'élévation possible : l'attaquant potentiel est déjà sur la machine ou est l'utilisateur). Les conséquences plausibles d'un payload malformé sont bornées : 400/500 JSON, rejet Prisma sans écriture partielle, ou donnée aberrante auto-infligée. La pondération **Basse** de la v1.0 est confirmée.

---

## 3. Contrôles compensatoires existants

1. **Typage Prisma + validation d'exécution** : toute écriture passe par le client typé ; types/champs invalides → erreur de validation → 500 JSON générique, transaction non exécutée. Requêtes paramétrées prouvées en live (04 T3).
2. **TypeScript `strict: true`** : cohérence interne des 30 modèles et des 99 routes (limite documentée §2.2 sur les casts d'entrée).
3. **Middleware transverse** (`src/middleware.ts`, matcher `/api/:path*`) : rate-limiting des routes IA (429 JSON gracieux + Retry-After) — limite l'abuso de coût (appels fournisseurs) même sans validation de forme.
4. **Gardes applicatives réelles dans les routes mutantes sans zod** : chaîne upload complète `article-imports` (liste blanche MIME, magic bytes, double contrôle de taille — auditée ✅ 04 §2) ; validations manuelles 400 `veille` (enum source, champs requis), `veille/[id]/results` (`{ids}|{all}`) ; gardes 404 d'existence sur les routes `[id]` ; normalisation défensive doctoral-toolbox/research-tabs.
5. **Correction isofix cycle vague 3** (`6f853ac`) : gardes null-safety sur les sélecteurs de thèse (côté UI) — le cycle a durci la cohérence applicative globale, y compris autour des endpoints thèse (AUD-ISO-001..004 clos, preuve isolation-fix.json).
6. **Schémas partagés éprouvés là où ils existent** : `api-schemas.ts` utilisé côté client (formulaires) ET serveur (routes) — le motif de duplication est déjà éliminé sur 23 routes, ce qui rend l'extension mécanique (§5).
7. **Backups et restauration prouvés** : DB (sauvegarde vérifiée, restauration démontrée — v1.2 §A3) et `upload/` (20 fichiers, SHA 100 %) — l'impact d'une corruption éventuelle est borné par une procédure de restauration réellement testée.

---

## 4. Analyse de risque résiduel

| Scénario | Plausibilité | Impact | Verdict |
|---|---|---|---|
| **S1** — Payload malformé émis volontairement/accidentellement en local (curl, script, dev) | Certain si tenté | 400/500 JSON ; rejet Prisma sans écriture partielle ; process survit | **Négligeable** — comportement dégradé propre, prouvé live (T1) |
| **S2** — Processus malveillant déjà exécuté sur la machine appelle les routes | Hors périmètre API | Machine déjà compromise à ce stade (clés env, base, FS lisibles directement) | **Hors périmètre** — le contrôle API n'ajoute rien face à un attaquant local |
| **S3** — Site web distant pilote des requêtes vers 127.0.0.1 pendant l'exécution (cf. §2.1) | Faible : cible peu connue, non distribuée massivement, fenêtre = durée d'usage, contrats + cuid à deviner, réponses illisibles (pas de CORS) | Écriture/suppression de données de thèse locales ; pas d'élévation, pas d'exfiltration lisibles ; restauration possible (A3) | **Basse** — risque réel mais borné ; **zod ne le traite pas** (voir D4 : vérification d'origine = contrôle pertinent, décision séparée) |
| **S4** — Dérive de contrat front/back (coût documenté, pas hypothétique) | **Prouvé ×2** : A1L2A-01 (400 Agile) et A1L3A-03 (400 Hypothèses) étaient des désalignements de payload | P2 fonctionnelles, corrigées au cycle 3 | **Le bénéfice principal du schéma zod est ici** : prévention de régression de contrat (schémas partagés client/serveur), bien plus que défense intrusion |

**Verdict argumenté** : le risque sécurité résiduel d'AUD-SEC-004, pondéré par le contexte réel (mono-utilisateur local, loopback, pas d'auth par conception, backups prouvés), est **Basse et non bloquant GO** au titre de l'exploitabilité. La règle 6.4 (« aucun défaut sécurité laissé ouvert ») est satisfaite par la justification SI le propriétaire accepte explicitement ce résiduel documenté ; l'honnêteté du dossier impose toutefois de distinguer : (a) la robustesse de forme (traitée par zod, §5) — bénéfice surtout qualité/contrat (S4) ; (b) le vecteur d'origine locale S3 — non traité par zod, décision D4 séparée ; (c) les 2 raw SQL GET D5 — mitigés par échappement manuel, paramétrage recommandé au prochain cycle touchant ces routes.

---

## 5. Plan de traitement progressif (SI le propriétaire exige le traitement — options B/C)

**Stratégie transversale** : étendre le motif existant — schémas zod réutilisables dans `src/lib/api-schemas.ts` (convention `createXSchema`/`updateXSchema`, partagés client+serveur, testés dans `api-schemas.test.ts`) + **helper commun** de parsing (p. ex. `parseBody(request, schema)` → 400 `{error, details: flatten()}`), pour ne plus dupliquer le bloc `ZodError → 400` (motif de référence : `references/route.ts` l.55-65). Aucune modification de comportement métier : schémas calqués sur les gardes manuelles existantes (les remplacer quand elles existent, les créer quand elles n'existent pas).

| Lot | Périmètre (routes) | Contenu | Effort estimé |
|---|---|---|---|
| **Lot 1 — destructives** (écriture DB) | Les 10 routes catégorie D (§1.3) | Schémas POST/PUT/PATCH/DELETE + garde d'existence systématique ; remplacer les typeof manuels (veille, doctoral-toolbox, research-tabs) ; conserver la chaîne upload `article-imports` (y adjoindre uniquement un schéma de métadonnées) | **0,5-1 j** (schémas courts, 4 routes déjà partiellement validées) |
| **Lot 2 — POST calcul/IA sans écriture** | Les 15 routes catégorie C | Bornes de longueur (motif `ai-writing` : prompt 10-50 k, contexte ≤ 100 k), enums fournisseurs, contre-exemple `ai-test` en premier (l'écart v1.0 T1) | **1-1,5 j** (bornes à calibrer par route, 26 fournisseurs) |
| **Lot 3 — GET lecture** | Les 16 routes catégorie L | Schémas searchParams (pages/limit plafonnés, enums) — bénéfice robustesse/contrat | **0,5-1 j** |

**Critère de fin** : `grep -rlE "from ['\"](zod|zod/v4)['\"]" src/app/api --include=route.ts | wc -l` = 99 (0 route sans schéma) · tests unitaires des nouveaux schémas (motif `api-schemas.test.ts`) · TNR 1 658+/1 658+ verts · lint 0 erreur · rejeu des 7 golden paths · aucun changement de comportement observable aux payloads valides (comparaison avant/après sur les routes mutantes). Effort total **2-3 j** — cohérent avec l'estimation v1.0 (roadmap 10, action C-17).

---

## 6. Décision demandée au propriétaire

**Option A — Justification acceptée (statu quo documenté)** : le présent dossier constitue la justification explicite exigée par la règle 6.4 ; AUD-SEC-004 passe à « résiduel documenté, accepté », plan §5 différé post-GO (v1.3). Aucun impact délai. *Recommandation de l'auditeur : défendable sur pièces — l'exploitabilité n'est pas démontrée, les conséquences sont bornées et les backups prouvés.*

**Option B — Traitement lot 1 avant GO** : schématisation zod des 10 routes destructives uniquement (§5 lot 1, 0,5-1 j), lots 2-3 différés post-GO. Nécessite : autorisation de modification de code (red line actuelle), fenêtre, TNR + GP rejoués. Impact délai : ~1 j + revalidation.

**Option C — Traitement complet avant GO** : lots 1+2+3 (2-3 j), critère de fin §5. Impact délai : ~3 j + revalidation complète.

**Points exigeant une décision explicite (liste exhaustive)** :

1. **D1 — Choix de l'option** : A / B / C (§6 ci-dessus).
2. **D2 — Si A** : validation de l'inscription du plan §5 au backlog post-GO (v1.3), lots 1→2→3 dans cet ordre.
3. **D3 — Si B ou C** : levée explicite de la red line « aucune modification de code » pour ce périmètre, fenêtre d'exécution, et rejeu TNR + 7 GP sur le nouveau candidat (le candidat applicatif actuel `7dff2c6` — tag `candidat-app-audit-v1.2` — serait déplacé ; refigeage + nouveau tag exigés).
4. **D4 — Vecteur d'origine locale S3 (distinct de zod)** : accepter comme résiduel documenté (recommandé tant que l'app n'est pas diffusée largement — aucune élévation, données locales, restauration prouvée), OU exiger une vérification d'origine (header Origin/Host) avant GO/diffusion large. Une décision « zod » seule ne clôt pas ce point.
5. **D5 — Raw SQL GET** (`book-skills/route.ts` l.19, `legal-refs/route.ts` l.17, échappement manuel `'`→`''`) : accepté tel quel en local (recommandé, risque non démontré), OU paramétrage exigé au prochain cycle touchant ces routes (à inscrire au registre comme sous-tâche P3).
6. **D6 — Traçabilité documentaire** : après décision, mise à jour du registre 09 (statut final), du 04 (colonne Action) et du présent dossier (ligne « décision ») par l'orchestrateur.

---

*Preuves citées : mesures par grep/find reproductibles (§1.1), lectures de code ligne-à-ligne HEAD, 04_SECURITY_AUDIT.md (T1/T3, §2, §8), evidence/reserved-views-revalidation.json, evidence/isolation-fix.json, evidence/a2-lot*.json, tsconfig.json, src-tauri/src/lib.rs, src/middleware.ts. Aucune modification de code, aucune écriture base, aucun commit effectué par ce dossier.*
