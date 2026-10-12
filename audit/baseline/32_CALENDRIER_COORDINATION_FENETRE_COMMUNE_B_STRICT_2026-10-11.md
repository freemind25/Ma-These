# 32 — CALENDRIER ET COORDINATION DE LA FENÊTRE COMMUNE — VARIANTE B-STRICT RETENUE

**Cycle :** audit-final-v1.2 · vague 8 · **Date :** 2026-10-11
**Statut : DOSSIER PRÉSENTÉ POUR EXAMEN PRÉALABLE — AUCUNE EXÉCUTION, AUCUN GO PRÉSUMÉ.** Répond au point 1 de la 6ᵉ décision propriétaire (2026-10-11) : « Avant toute exécution, merci de me fournir : le calendrier proposé et les conditions de coordination ; la confirmation des préconditions de démarrage ; la procédure de sauvegarde et les contrôles d'intégrité qui seront exécutés ; les critères d'arrêt et la procédure de retour arrière ; la confirmation que la base réelle ne recevra aucune écriture de test ; la liste des preuves qui me seront remises avant toute décision de clôture. »
**Décisions enregistrées (6ᵉ décision) :** variante **B-strict** retenue pour la re-pass UI · fenêtre organisée en **plusieurs sessions coordonnées** · **application inutilisée** entre la migration et la fin de la revalidation.
**Fondements :** doc 30 (pré-requis finaux — séquence §6, sauvegarde §3, intégrité §5, arrêt §7, rollback §8) · doc 21 · doc 25 · doc 27-A/C.

---

## §1 — Verrouillage de la variante B-strict (effet sur la séquence doc 30)

Votre choix remplace la variante (i) « 2 thèses jetables » par **B-strict**, désormais **verrouillée** dans la séquence :

| Élément | Réglage B-strict (définitif sauf nouvelle instruction) |
|---|---|
| Preuve d'isolation à 2 thèses | **Harnais Vitest uniquement** (12-16 tests d'isolation P3, instances de base dédiées du harnais de test) |
| Création de thèse de test sur `db/custom.db` | **Aucune** — ni durable, ni jetable, même avec suppression et preuve diff |
| Re-pass UI | **Mono-thèse** (la thèse réelle « Urbanisme durable »), en **consultation** : 4 vues consommatrices + sélection de thèse + export DOCX |
| Golden paths mutatifs (GP-1..GP-7) | Rejoués **sur le harnais de test** (jamais en écriture mutante sur la base réelle) — la couverture mutative en UI réelle du candidat reste celle, déjà consignée, des preuves `v4r-*` du candidat figé `7dff2c6` |
| Autres écritures sur la base réelle | Aucune écriture de test. Seules écritures tolérées : **la migration elle-même** (étapes M-4/M-5/M-6) et, si vous les exercez, vos **usages réels** après clôture |

Conséquence assumée : la re-pass UI B-strict ne couvre pas de mutation en UI réelle post-migration ; cette couverture est reportée sur le harnais Vitest + TNR. Si vous souhaitez malgré tout un contrôle mutatif en UI réelle (avec protocole de restauration à l'identique comme en vague 4), il devra être demandé séparément — il n'est **pas prévu** par défaut.

## §2 — Calendrier proposé (4 sessions coordonnées + clôture)

Jours ouvrés relatifs au GO écrit. Créneaux par défaut **9h00–12h00, heure GMT-1** (adaptables). Durée totale d'inutilisation de l'app estimée : **2 à 4 jours ouvrés** — un enchaînement serré est recommandé pour minimiser cette période ; l'espacement entre sessions est toutefois libre (la base reste gelée entre les sessions).

| Session | Quand | Durée | Contenu (référence doc 30) | Point d'arrêt remis au propriétaire |
|---|---|---|---|---|
| **S1 — Gel + migration** | J0 (dès GO) | 60–90 min | Pré-conditions §2 · sauvegarde + contrôles bloquants §3 · migration M étapes 2-7 (export → schéma commit dédié → db push → attribution → consistency-check) | **PA1** : SHAs, inventaire avant/après, verdict PASS — la base est en état M |
| **S2 — Cycle applicatif P1** | J1 | 0,5–1 j | P1 API : thesisId obligatoire (zod + FK), filtre GET, gardes PUT/DELETE, binding `activeThesisId` | **PA2** : diff du commit dédié, tests ciblés verts |
| **S3 — Cycle applicatif P2+P3** | J2 | 0,5–1 j | P2 UI (4 vues + DOCX scopés) · P3 tests vitest d'isolation (12-16, **preuve B-strict**) | **PA3** : résultats tests d'isolation, 0 route `references` sans zod |
| **S4 — Revalidation + consignation** | J3 | 0,5–1 j | Phase R : TNR complète (~1 670 verts) · lint 0 erreur · GP rejoués sur harnais · re-pass UI mono-thèse en consultation · consignation · refigeage candidat + nouveau tag | **PA4** : rapport de fenêtre + paquet de preuves complet (§7) → votre **décision de clôture écrite** |

**Contrôle de continuité** (nouveau, entre chaque session) : à l'ouverture de chaque session Sn (n≥2), re-vérification bloquante : SHA de `db/custom.db` identique à celui consigné à la clôture de la session précédente · `git status` propre · aucun serveur actif. Toute divergence → ARRÊT et signalement.

**Reprise d'usage** : uniquement après remise du rapport final S4 et **votre accord exprès de clôture**. Entre S1 et cet accord, l'application reste **inutilisée et fermée** (votre engagement confirmé).

## §3 — Conditions de coordination

1. **Préavis** : 24 h avant chaque session (S1 fixée par votre GO) ; date/horaire confirmés par message écrit.
2. **Mode de poursuite — à choisir dans votre GO** :
   - **Mode A (par défaut)** : arrêt à chaque point d'arrêt PA1→PA4 ; poursuite uniquement sur votre accord écrit (« GO S2 », etc.) ;
   - **Mode B (enchaînement)** : vous pré-autorisez l'enchaînement S1→S4 ; arrêt immédiat et signalement à la moindre divergence des critères §5, quelle qu'en soit la nature. Aucune anomalie n'est « traversée » en mode B.
3. **Pouvoirs pendant la fenêtre** : je pilote les sessions ; vous n'êtes sollicité qu'aux points d'arrêt, en cas d'anomalie, et pour l'accord de reprise d'usage.
4. **Droit de retrait** : vous pouvez interrompre la fenêtre à tout moment ; l'état le plus avancé est documenté (état M = cohérent, doc 25 §3 ; état C = base M + code en commits dédiés non poussés) ; rollback §8 sur votre demande.
5. **Échec en phase C** : la base reste en état M (cohérent, non annulé automatiquement) ; décision de poursuite/rollback vous revient ; aucun correctif improvisé.
6. **Traçabilité horaire** : journal de fenêtre horodaté (débuts, fins, contrôles, verdicts) remis avec le rapport final.

## §4 — Confirmation des préconditions de démarrage (doc 30 §2, reprises intégralement)

Les **6 pré-conditions bloquantes** du doc 30 §2 seront re-vérifiées à l'ouverture de S1, une à une, et consignées : GO écrit couvrant séquence/sauvegarde/arrêt/rollback/B-strict · serveur port 3000 arrêté et aucun utilisateur actif · `git rev-parse HEAD` = `7dff2c6c98f8be59edb64b34f8a1eb021745a435` + arbre propre + empreinte arbre `8ae37eda…87e75e` re-calculée · état logique Reference 4 / Thesis 1 / 0 violation FK (inventaire lecture seule) · aucune 2ᵉ thèse créée · scripts éprouvés `rehearsal-refs/` présents et inchangés (hashes consignés). **Toute condition non remplie = session S1 non démarrée.**

## §5 — Sauvegarde, contrôles d'intégrité, critères d'arrêt, retour arrière (confirmations)

- **Sauvegarde (doc 30 §3)** : copie horodatée `cp --preserve=timestamps` dans `audit/baseline/evidence/backups/` **avant toute écriture**, contrôles bloquants : double SHA identique base/copie, inventaire exécuté sur la copie (4/1/30 tables), `PRAGMA integrity_check` = `ok`. Capacité de restauration déjà prouvée (cycle A3 + voie 7b répétition).
- **Contrôles d'intégrité (doc 30 §5)** : le tableau bloquant par étape (M-1 à R) est repris tel quel : rowCount 4 à l'export, comptages identiques après db push, `rowsUpdated` = 4 / 0 ambiguïtés / 0 dangling, verdict **PASS** du consistency-check avec diff = `thesisId` seul, 12-16 tests d'isolation verts, TNR/lint/GP verts.
- **Critères d'arrêt (doc 30 §7)** : toute divergence de comptage, tout `integrity_check ≠ ok`, toute violation FK, tout dangling ≠ 0, tout test en échec, toute divergence d'empreinte → **ARRÊT IMMÉDIAT**, aucun correctif improvisé, signalement, puis rollback avant toute autre action.
- **Retour arrière (doc 30 §8)** : voie **7b restauration byte-identique** par défaut (SHA re-vérifié → copie → re-contrôles) ; voie 7a inverse chirurgical (journal-guidé) disponible avant phase C ; retour code par abandon/`git revert` des commits dédiés — **jamais** d'amend/rebase/force sur le candidat figé.

## §6 — Confirmation : la base réelle ne recevra aucune écriture de test

**Confirmé, par construction de la variante B-strict** (§1) : la preuve d'isolation à deux thèses s'exécute exclusivement sur le harnais Vitest ; aucune thèse de test (ni durable ni jetable) n'est créée sur `db/custom.db` ; l'étape 7-bis « option B » reste sans écriture ; la re-pass UI est mono-thèse en consultation ; les GP mutatifs sont rejoués sur le harnais. Les seules écritures sur `db/custom.db` pendant la fenêtre sont celles, réelles et intentionnelles, de **la migration elle-même** (M-4/M-5/M-6), précédées de la sauvegarde bloquante et couvertes par le retour arrière §8. Les fichiers rouges (`db/custom.db` hors migration GO, `db/urbanisme-test.db`, `.env`, `audit/baseline/evidence/`) restent intouchés hors ce périmètre.

## §7 — Liste des preuves remises avant toute décision de clôture

Remises en un **paquet unique à PA4**, avant votre décision de clôture (formats JSON/texte/captures, horodatés) :

| # | Preuve | Session |
|---|---|---|
| 1 | `migration-reelle-shas.json` : SHA base avant/après, SHA sauvegarde, tailles, horodatages | S1 |
| 2 | Inventaires avant/après (lecture seule) + export réversible des 4 références | S1 |
| 3 | Journal d'attribution (4 entrées, motif CAS_UNIVOQUE) + rapport d'ambiguïté (0 attendu) | S1 |
| 4 | Verdict **PASS** `consistency-check` (sortie complète) | S1 |
| 5 | Commit dédié du schéma (diff 4 lignes) + sorties `prisma db push` | S1 |
| 6 | Commits dédiés du cycle applicatif (diffs P1/P2/P3) | S2-S3 |
| 7 | Résultats 12-16 tests vitest d'isolation (preuve B-strict) + « 0 route `references` sans zod » | S3 |
| 8 | TNR ~1 670 verts + lint 0 erreur + 7 GP rejoués sur harnais (journaux) | S4 |
| 9 | Captures re-pass UI mono-thèse (4 vues consommatrices + DOCX) | S4 |
| 10 | Nouveau tag candidat + empreinte arbre re-calculée + registre 09 + v1.2 mis à jour | S4 |
| 11 | Journal de fenêtre horodaté + rapport de déroulé (temps réel vs estimé, écarts éventuels) | S4 |

**Aucune décision de clôture ne vous sera proposée sans la totalité de ce paquet.** Les preuves intermédiaires (PA1-PA3) vous sont également transmises à chaque point d'arrêt.

## §8 — Ce que votre GO écrit devra couvrir (rappel, aucune exécution sans lui)

- [ ] GO sur le dossier doc 30 (séquence, sauvegarde, intégrité, arrêt, rollback) **+ B-strict verrouillée (§1 ci-dessus)**
- [ ] Calendrier : dates S1-S4 (ou créneau J0 retenu) + créneaux horaires
- [ ] Mode de coordination : **A** (arrêt à chaque PA) ou **B** (enchaînement autorisé sauf anomalie)
- [ ] Confirmation de l'engagement d'inutilisation de l'app entre S1 et l'accord de clôture
- [ ] (rappel) décision AUD-SEC-004 **indépendante** — si C-B choisi, le lot 1 peut être articulé à la phase C (un seul refigeage) ; à préciser dans le même GO ou séparément

**En l'absence de GO : rien n'est exécuté** — base réelle en l'état, candidat figé, calendrier conservé en préparation.
