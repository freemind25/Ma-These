# 31 — NOTE D'ARBITRAGE AUD-SEC-004 — JUSTIFICATION C-A COMPLÈTE + DÉCISIONS D4 / D5

**Cycle :** audit-final-v1.2 · vague 7 · **Date :** 2026-10-11
**Statut : DÉCISION FORMALISÉE LE 2026-10-11 (confirmation écrite du propriétaire, voir §9) : D1 = C-B · D4 = D4-accept · D5 = D5-accept — lot 1 bloqué jusqu'à levée expresse P7 + GO spécifique.** [Historique : PRÉSENTÉ POUR ARBITRAGE — AUCUNE OPTION PRÉSUMÉE ACCEPTÉE.] Répond à l'orientation ③ du propriétaire (5ᵉ décision, 2026-10-11) : « Présentez la justification C-A complète ainsi que les éléments D4 et D5 pour arbitrage. Aucune remédiation de code ne doit être engagée avant ma décision écrite sur l'option retenue et son périmètre exact. »
**Source détaillée :** doc 23 (constat, modèle de menace, contrôles compensatoires, risque résiduel, plan de traitement) — le présent dossier en fait la synthèse **auto-suffisante** pour décision, avec les références de preuve exactes.

---

## §1 — Le constat, en chiffres vérifiés (recompte exact à HEAD, reproductible — doc 23 §1)

```
find src/app/api -name "route.ts"                  → 99 fichiers
grep -rlE "import .* from ['\"](zod|zod/v4)['\"]"  → 58 avec zod (dont les 23 avec api-schemas partagés)
41/99 routes sans schéma zod déclaré
```

Répartition des 41 :
| Catégorie | Nombre | Nature | Points saillants |
|---|---|---|---|
| **D — mutantes avec écriture base** | **10** | surface la plus sensible | 4 avec validation manuelle réelle ou chaîne upload audité ✅ ; `veille` a une validation manuelle complète (typeof + trim + enum → 400 explicites) ; **0 deleteMany/updateMany non scoppé** (le seul updateMany est borné `savedSearchId`) |
| **C — POST calcul/IA sans écriture** | **15** | requête malformée → 400/500 ou appel externe dégradé | aucune persistance possible |
| **L — GET lecture seule** | **16** | lecture | plusieurs valident déjà leurs searchParams manuellement (arxiv ×3, theses-en-ligne ×4, books garde zod prouvée en UI réelle) |

Les 58 routes avec zod couvrent l'essentiel du CRUD métier persistant (thèses, chapitres, parties, cadrages, références, sources, sprints, carnet) — schémas partagés client/serveur, testés (`api-schemas.test.ts`).
Mesure croisée au commit baseline v1.0 (`2156a8f`) : **identique** — écart « 40/98 » → « 41/99 » = convention de comptage documentée, pas une régression.

## §2 — Le modèle de menace honnête (doc 23 §2 — points clés)

1. **Surface exposée** : app **mono-utilisateur locale**. Dev = `localhost:3000` ; desktop Tauri (cible de distribution) = serveur standalone spawné sur **`127.0.0.1:14325`** (`src-tauri/src/lib.rs`) — **loopback exclusivement, jamais 0.0.0.0**. Par conception : pas d'auth multi-utilisateurs, pas d'exposition réseau (contrôles N/A posés explicitement en v1.0, audit 04 §8).
2. **Vecteur distant unique identifiable** : un site web visité dans le navigateur de la machine peut émettre des requêtes cross-origin **vers 127.0.0.1** pendant l'exécution (S3, cf. D4). Précisions factuelles : réponses **non lisibles** par le site distant (aucun CORS permissif) ; écriture exigerait de deviner contrats exacts + identifiants cuid ; **une validation zod ne corrige PAS ce vecteur** (elle valide la forme du payload, pas son origine).
3. **Effets d'un payload malformé (vérifiés, pas supposés)** : 400/500 JSON propre (39/41 routes try/catch + encapsulation Next) · rejet Prisma **sans écriture partielle** (`PrismaClientValidationError` → transaction non exécutée) · 0 injection SQL démontrée (paramétrage Prisma prouvé live T3 ; 2 `$queryRawUnsafe` GET avec échappement manuel — cf. D5) · pas d'élévation possible (l'attaquant est déjà sur la machine ou est l'utilisateur).

## §3 — Les contrôles compensatoires existants (doc 23 §3, 7 items)

1. Typage Prisma + validation d'exécution (rejet sans écriture partielle) · 2. TypeScript `strict: true` (limite documentée sur les casts d'entrée HTTP) · 3. Middleware transverse : **rate-limiting des routes IA** (429 + Retry-After) · 4. **Gardes réelles** : chaîne upload complète `article-imports` (MIME liste blanche + magic bytes + double contrôle 50 Mo — auditée ✅), validations manuelles `veille`, gardes 404 sur les routes `[id]` · 5. Cycle isofix vague 3 (`6f853ac`) : gardes null-safety sélecteurs de thèse · 6. Motif schémas partagés déjà opérationnel sur 23 routes (extension mécanique) · 7. **Backups + restauration prouvés** (DB : cycle A3 ; `upload/` : 20 fichiers SHA 100 %) — l'impact d'une corruption éventuelle est borné par une procédure testée.

## §4 — Analyse de risque résiduel (doc 23 §4)

| Scénario | Plausibilité | Impact | Verdict |
|---|---|---|---|
| S1 — payload malformé local (curl, script, dev) | certain si tenté | 400/500 propre, rejet Prisma sans écriture partielle | **Négligeable** (prouvé live T1) |
| S2 — processus malveillant déjà sur la machine | hors périmètre API | machine déjà compromise à ce stade | **Hors périmètre** |
| S3 — site distant → 127.0.0.1 (D4) | faible (cible peu connue, fenêtre = durée d'usage, contrats + cuid à deviner, réponses illisibles) | écriture/suppression de données locales ; pas d'élévation, pas d'exfiltration lisible ; restauration possible (A3) | **Basse** — réel mais borné ; **zod ne le traite pas** |
| S4 — dérive de contrat front/back | **prouvée ×2** (A1L2A-01, A1L3A-03 — P2 corrigées) | dysfonctionnements applicatifs | **le bénéfice principal de zod est ici** (prévention de régression, schémas partagés) |

---

## §5 — LA JUSTIFICATION C-A COMPLÈTE (option A — « résiduel documenté, accepté »)

**Argumentaire, dans l'ordre de la règle 6.4** (« aucun défaut de sécurité laissé ouvert au GO final : traiter OU justifier explicitement ») :

1. **L'exploitabilité n'est pas démontrée.** Aucun chemin d'attaque distant plausible : loopback only, pas d'auth à contourner, pas d'élévation, réponses illisibles cross-origin, identifiants cuid à deviner. Le seul vecteur (S3) est pondéré **Basse** et **n'est de toute façon pas traité par zod** — schématiser les 41 routes ne réduirait pas S3 d'un millimètre.
2. **Les conséquences sont bornées et prouvées.** Un payload malformé produit un rejet propre (400/500, rejet Prisma sans écriture partielle, process survit) — vérifié live (T1/T3), pas supposé. Aucun deleteMany/updateMany non scoppé dans les 10 routes mutantes.
3. **Les contrôles compensatoires couvrent l'essentiel de la surface sensible** : chaîne upload audité ✅, validations manuelles réelles, gardes 404, rate-limiting IA, backups prouvés (restauration testée).
4. **Le bénéfice réel de zod est la prévention de régression de contrat (S4)** — un bénéfice de **qualité**, précieux mais non urgent : les 2 dérives contractuelles historiques ont été des P2 fonctionnelles corrigées, pas des failles de sécurité.
5. **L'engagement de traitement est pris et outillé** : le plan progressif (§6) est inscrit au backlog v1.3 dans l'ordre 1→2→3, avec le lot 1 **déjà spécifié route par route** (doc 27-B, extraction du code faite le 2026-10-11) — l'exécution ultérieure n'aura aucun coût de préparation.
6. **La pondération Basse de la v1.0 est confirmée** par le recompte indépendant à HEAD (§1) et par le modèle de menace §2.

**Ce que C-A implique concrètement** : AUD-SEC-004 passe au statut « résiduel documenté, accepté » au registre 09 ; le plan §6 est inscrit au backlog v1.3 (sans engagement de date au-delà de la priorisation) ; **impact délai GO : zéro** ; traçabilité D6 (registre 09 + doc 04 + doc 23) à ma charge immédiatement après votre décision.

## §6 — Le plan de traitement inscrit au backlog v1.3 (si C-A : différé ; si C-B/C-C : exécution partielle/totale)

| Lot | Périmètre | Contenu | Effort | Statut de préparation |
|---|---|---|---|---|
| **Lot 1 — destructives** | les 10 routes D | schémas zod + `parseBody(request, schema)` (motif partagé, remplace les typeof manuels, chaîne upload conservée) | 0,5-1 j | **spécifié route par route** (doc 27-B, payloads extraits du code) |
| **Lot 2 — POST calcul/IA** | les 15 routes C | bornes de longueur (motif `ai-writing`), enums fournisseurs, contre-exemple `ai-test` en premier | 1-1,5 j | bornes à calibrer par route |
| **Lot 3 — GET lecture** | les 16 routes L | schémas searchParams (plafonds, enums) | 0,5-1 j | motif standard |

**Critère de fin global** : 0 route sans zod (`grep` = 99) · tests des schémas verts · TNR 1 658+ · lint 0 erreur · 7 GP rejoués · payloads valides → réponses identiques (comparaison avant/après).

---

## §7 — DÉCISION D4 : vecteur d'origine locale S3 (indépendant de zod)

**Le fait** : un site web visité dans le navigateur de la machine peut émettre des requêtes vers `127.0.0.1:14325` (desktop) ou `:3000` (dev) pendant l'exécution. Les réponses ne sont pas lisibles (pas de CORS), mais une **écriture/suppression en aveugle** est concevable si les contrats et cuid sont devinés.

**Le contrôle pertinent** (si vous l'exigez) : vérification d'origine côté serveur — middleware (existant : `src/middleware.ts`, matcher `/api/:path*`) rejetant toute requête dont l'`Origin`/`Host` n'appartient pas à une liste d'origines légitimes (webview Tauri, localhost dev). Effort estimé : **~0,5 j + tests** (attention à la liste d'origines exacte de la webview Tauri sur Windows — à calibrer en C2 ; un contrôle mal calibré peut casser l'app).

**Options D4 :**
- **D4-accept (recommandé à ce stade)** : résiduel documenté, accepté tant que l'app n'est **pas diffusée largement** — données locales mono-utilisateur, pas d'élévation, restauration prouvée. Réévaluation exigée **avant toute diffusion large** (critère à inscrire au registre).
- **D4-contrôle** : implémenter la vérification d'origine **avant GO** (ou avant diffusion large à date fixée) — +~0,5 j de fenêtre code + revalidation.

## §8 — DÉCISION D5 : 2 raw SQL GET (`book-skills`, `legal-refs`)

**Le fait** : 2 routes GET en **lecture seule** utilisent `$queryRawUnsafe` avec construction de chaîne et **échappement manuel `'` → `''`** (mitigation standard en contexte SQLite, moins robuste qu'un paramétrage). Les 2 routes **sont** dans les 58 avec zod. Aucune écriture, aucune exploitation démontrée (T3 : payload SQL traité comme littéral).

**Options D5 :**
- **D5-accept (recommandé)** : accepté tel quel en local — risque non démontré, lecture seule, échappement en place. Inscription au registre comme **sous-tâche P3** : « paramétrage au prochain cycle touchant ces routes » (règle d'hygiène sans urgence).
- **D5-paramètre** : paramétrage exigé **avant GO** — ~0,5 h de modification ciblée, mais constitue une **modification de code** (red line P7 : exige levée explicite + revalidation + refigeage candidat).

## §9 — Formulaire de décision (une réponse explicite par point — aucune présomption)

| # | Question | Options |
|---|---|---|
| **D1** | AUD-SEC-004 | ☐ **C-A** justification acceptée, plan §6 différé v1.3 · ☐ **C-B** lot 1 avant GO (~1 j + refigeage) · ☐ **C-C** complet avant GO (~3 j + refigeage) |
| **D4** | vecteur d'origine locale | ☐ **D4-accept** résiduel documenté (réévaluation avant diffusion large) · ☐ **D4-contrôle** vérification Origin/Host avant GO / avant diffusion large |
| **D5** | 2 raw SQL GET | ☐ **D5-accept** + sous-tâche registre P3 · ☐ **D5-paramètre** avant GO (levée red line requise) |
| **D6** | traçabilité | après décision : mise à jour registre 09 + doc 04 + doc 23/31 par l'orchestrateur (à ma charge) |

**▶ DÉCISION FORMALISÉE — confirmation écrite du propriétaire (2026-10-11)** : D1 = **C-B** (lot 1, 10 routes destructives, revalidation complète + nouveau candidat) · D4 = **D4-accept** (réévaluation obligatoire avant toute diffusion large) · D5 = **D5-accept** (paramétrage des 2 routes GET reporté au backlog, sous-tâche P3). **D6 exécutée le jour même** : registre 09, doc 04, docs 23/31/35. **Le lot 1 reste bloqué** : aucune modification de code avant la levée expresse et écrite de la red line P7 (périmètre exact : doc 35 §3) et un GO spécifique distinct. Dossier d'exécution : doc 35.

**Articulation** : C-A ⇒ zéro impact sur la fenêtre commune (doc 30). C-B/C-C ⇒ le lot 1 peut partager la fenêtre de la phase C (doc 30 §6.2) avec le cycle d'isolation — **un seul refigeage candidat** ; votre choix de fenêtre reste requis.

---
*Preuves : doc 23 (§1.1 méthode reproductible, §2.2 effets vérifiés, références T1/T3, `04_SECURITY_AUDIT.md`, `src-tauri/src/lib.rs`, `src/middleware.ts`) · doc 27-B (spécification lot 1 extraite du code) · registre 09 (S4 : A1L2A-01, A1L3A-03 corrigées). Aucune modification de code, aucune écriture base — présentation d'arbitrage uniquement.*
