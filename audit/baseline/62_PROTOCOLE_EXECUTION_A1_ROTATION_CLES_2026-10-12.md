# 62 — PROTOCOLE D'EXÉCUTION A1 (ROTATION DES CLÉS P1) — BILAN INITIAL AVANT ROTATION

- **Date** : 2026-10-12, 17:10 UTC (vague 37)
- **Cycle** : `audit-final-v1.2`
- **Autorisation propriétaire enregistrée** : « J'autorise exclusivement l'action A1 du document 61 : la rotation des clés P1 compromises ou exposées. » — Périmètre : (1) révocation des anciens identifiants + génération des nouveaux via les consoles officielles ; (2) vérification du fonctionnement sans jamais afficher ni transmettre les valeurs secrètes ; (3) consignation des statuts, dates et preuves de révocation et de validation ; (4) signalement de tout impact sur les services AVANT toute modification supplémentaire. Bilan de rotation présenté au propriétaire avant de poursuivre.
- **Hors périmètre (exclusions explicites de l'autorisation)** : BFG, commit, tag, push, `db:push`, restauration, build, déploiement, finalisation R2, C2, fenêtre S1-S4, neutralisation des releases, GO MEP — chaque action hors périmètre attendra une autorisation écrite distincte.
- **Red lines de gel inchangées** : 0 écriture `.git`/bases/sauvegardes/preuves/`repo.tar` · 0 commit/tag/push · 0 `db:push`.

---

## 1. Bilan initial — état de chaque clé AVANT rotation (consolidé, aucune valeur reproduite)

| # | Clé / actif | Statut avant rotation (documenté) | Preuve / référence consignée | Valeur résidente dans le sandbox |
|---|---|---|---|---|
| K-1a | `OPENALEX_API_KEY` — génération A (ancienne) | **À confirmer : active** — dernier contrôle documenté HTTP 200 (« toujours active ») ; une rotation partielle a ensuite été rapportée mais la révocation effective de la génération A **n'est pas prouvée** | security-openalex-rotation-1 ; doc 57 (sécurité externe) | Non — présente uniquement dans l'historique Git (commits `1359333`→`0543a4f` + dossiers de preuves historiques, occurrences complètes masquées) |
| K-1b | `OPENALEX_API_KEY` — génération B (fournie 2026-10-08) | **Compromise par transport** (messagerie en clair) ; disparue du sandbox au rollback du 12:57 UTC ; état côté serveur inconnu | worklog (restauration `.env.local`, biblio-restauration) | Non (`.env.local` absent) |
| K-2a | `APINEX_API_KEY` — génération A (historique) | **À confirmer : révocation non prouvée** — exposée dans l'historique Git de `.env` (commits `04dc5ab`, `763ee5d`, dépôt privé) ; cadre de confirmation doc 40 **non retourné par le propriétaire à ce jour** | doc 40 (cadre préalable, statut « confirmation non reçue ») | Non — historique Git uniquement |
| K-2b | `APINEX_API_KEY` — génération B (rotation-cles) | **Compromise par transport** (messagerie) ; installée puis perdue au rollback | worklog rotation-cles-journaux-oa-fix | Non |
| K-3 | PAT GitHub — génération 1 | **Invalide** (HTTP 401 constaté) ; suppression éventuelle dans la liste des tokens non vérifiée | build-desktop-pipeline-2 | Non |
| K-4 | PAT GitHub — génération 2 | **À révoquer impérativement** — valide (scopes `repo`, `workflow`), transmise en clair par messagerie, utilisée pour push/releases ; révocation non prouvée | build-desktop-pipeline-3/4/5 | Non (askpass éphémère `/tmp` disparu, jamais dans `.git/config`) |
| K-5 | PAT GitHub — génération 3 (actuelle) | **À renouveler** — opérationnelle à la création, transmise par chat ; état actuel non revérifié depuis | rotation-cles-journaux-oa-fix | Non |
| K-6 | Certificat Authenticode | Inexistant (`certificateThumbprint: null`) — hors rotation, acquisition séparée (A8) | doc 60 §3 | — |
| K-7 | Paire updater Tauri | Inexistante (updater non configuré) — conditionnelle (A8) | doc 60 §3 | — |

**Synthèse initiale** : 5 générations de clés à révoquer/confirmer (K-1a, K-2a, K-3 par hygiène, K-4 impératif, K-1b/K-2b compromises par transport), 1 à renouveler (K-5). **Aucune valeur n'est résidente dans le sandbox** — toutes les opérations sont des actes externes (consoles) + vérifications.

---

## 2. Baseline mesurée avant rotation (2026-10-12, ~16:50-17:10 UTC, lecture seule)

| Mesure | Résultat | Interprétation |
|---|---|---|
| Empreintes `custom.db` / `urbanisme-test.db` / `repo.tar` | `756c0158…8126d` / `6b72e1dc…65fb8` / `cb7e5eab…9272` | **Gel intact pendant la rotation** ✅ |
| OpenAlex API **sans clé** | HTTP **429** | Quota anonyme épuisé depuis l'IP du sandbox (comportement documenté) ; **aucune clé n'est utilisée** ; la bascule automatique CrossRef/HAL (mécanisme A.2, prouvé) couvre l'application |
| GitHub API anonyme | HTTP **403** | Rate-limit/blocage anonyme depuis l'IP partagée du sandbox — sans signification de rotation |
| `git ls-remote origin` **sans credential** | `Authentication failed` (terminal prompt désactivé) | **Preuve : aucun credential Git résident** — la rotation n'a aucun secret à neutraliser côté sandbox |
| `.env.local` / `.git-credentials` / traces askpass | Absents | Idem |
| Variables d'environnement sensibles | Aucune | Idem |

---

## 3. Impacts sur les services — signalés AVANT toute modification (directive, point 4)

| Service | Impact de la fenêtre de rotation | Couverture |
|---|---|---|
| OpenAlex | Entre la révocation et l'installation de la nouvelle clé au poste desktop : quota anonyme uniquement (déjà en 429 sur certaines IPs) | Bascule automatique CrossRef/HAL prouvée (A.2) — dégradation de quota, pas de coupure ; l'application reste fonctionnelle |
| APINex | Fournisseur IA optionnel indisponible entre la révocation et l'installation de la nouvelle clé | Bascule vers les autres fournisseurs configurés au poste desktop ; aucune fonctionnalité critique dépendante |
| GitHub | **Aucun impact pendant le gel** : aucun push prévu (interdit), aucune Action déclenchée ; les releases **déjà publiées** (v1.10.7/v1.10.8) ne sont pas affectées par la révocation d'un PAT | Le prochain push (A6, soumis à autorisation) utilisera le PAT renouvelé |
| Sandbox / audit | Aucune clé n'est utilisée par aucun flux local | Zéro impact local |
| Autres | Aucune autre clé exposée (inventaire négatif doc 60 §6) | — |

**Aucune modification supplémentaire ne sera faite avant votre retour** sur le choix du mode de vérification (§5) et l'exécution des consoles (§6).

---

## 4. Répartition des rôles (imposée par la technique, sans exception)

- **Consoles officielles (révocation + génération) : vous, propriétaire.** Ces consoles requièrent la session de votre compte (identifiant, mot de passe, 2FA). L'agent n'a pas ces sessions et **ne les demandera jamais** — aucun mot de passe ne doit transiter par ce canal, sous aucun prétexte. Durée estimée : 5-10 minutes au total (§6).
- **Agent (moi) : vérifications, consignation, bilan.** Contrôles de résidus, tests que vous me confiez selon le mode choisi, enregistrement des statuts/dates/preuves, bilan final.

Précision factuelle : même muni du PAT actuel, l'API GitHub ne permet pas de révoquer un autre PAT personnel (gestion réservée à la session web du compte) — la révocation K-4 ne peut être effectuée que par vous.

---

## 5. Modes de vérification du fonctionnement (sans jamais afficher ni transmettre les valeurs)

### Mode S — « secrets jamais partagés » (RECOMMANDÉ)
1. Vous effectuez les révocations/générations aux consoles (§6).
2. Vous testez vous-même : OpenAlex/APINex directement dans la console (badge/équivalent « clé valide ») ; PAT : `git ls-remote https://github.com/freemind25/ThesisFrame.git` au poste avec le nouveau token (entré au clavier, jamais collé ici).
3. Vous me transmettez **les résultats et captures SANS valeur** (statut, date, référence de ticket/écran) à chaque étape.
4. Je consigne le bilan final, contrôle les résidus du sandbox, et vous présente le bilan de rotation.
→ **Aucune valeur ne quitte jamais votre poste.** Conformité maximale au point 2 de votre autorisation.

### Mode T — « tests centralisés dans le sandbox » (si vous le préférez)
1. Vous déposez les valeurs dans **un seul fichier** à créer sous `/home/sync/upload/rotation-cles-20261012/` (canal déjà utilisé), nommé p. ex. `valeurs.txt` chmod 600.
2. J'exécute les tests en mémoire uniquement : lecture dans une variable locale, requêtes API, `git ls-remote` avec le PAT via variable d'environnement éphémère — **jamais de `echo`, jamais de valeur dans un log, un document ou une réponse**.
3. Je vous signale la fin des tests ; **vous supprimez le fichier** (ou m'en donnez l'autorisation écrite).
4. Limites assumées : le fichier transite par le canal OSS ; une valeur exposée à un tiers devrait être re-tournée.
### Règle inchangée dans tous les cas
Toute valeur qui transiterait en clair dans la messagerie est réputée compromise → **re-rotation immédiate après usage** (règle déjà consignée, doc 60 §5.1).

---

## 6. Ordre d'exécution proposé (5-10 minutes, consoles officielles)

| Étape | Console | Action | Preuve à me transmettre (sans valeur) |
|---|---|---|---|
| 1 | github.com/settings/tokens | **Révoquer la génération 2** (impératif) ; supprimer la génération 1 si encore listée | Capture/écran « token révoqué » + horodatage |
| 2 | github.com/settings/personal-access-tokens (fine-grained) | **Créer le remplaçant** de la génération 3 : dépôt unique `freemind25/ThesisFrame`, permissions minimales (Contents RW, Actions, Workflows), **expiration ≤ 90 jours** | Horodatage + nom du token (pas sa valeur) |
| 3 | Au poste : `git ls-remote https://github.com/freemind25/ThesisFrame.git` avec le nouveau token | Test réel de la chaîne Git (un 200 API ne suffit pas — leçon consignée) | « ls-remote vert » + horodatage |
| 4 | openalex.org → paramètres API | **Régénérer** (invalide de fait toute génération antérieure) ; confirmer dans la console que l'ancienne n'est plus active | Horodatage + statut console |
| 5 | Console APINex (cadre doc 40 §3 : auteur = propriétaire, objet = révocation/rotation avec invalidation de l'ancienne, date, justificatif sans valeur) | **Révoquer/régénérer** ; test console (« balance »/statut clé) | Horodatage + justificatif |
| 6 | (après 1-5) | Me transmettre les preuves → **je consigne le bilan final (§7)**, re-vérifie les résidus du sandbox, et vous le présente AVANT de poursuivre | — |

---

## 7. Modèle de bilan final (à remplir étape par étape, aucune valeur)

| Clé | Action | Date (UTC) | Preuve (capture/référence) | Statut après | Vérification fonctionnelle | Impact constaté |
|---|---|---|---|---|---|---|
| K-3 PAT gen.1 | Suppression hygiène | | | | n/a (invalide) | aucun |
| K-4 PAT gen.2 | **Révocation** | | | | n/a | aucun (gel) |
| K-5 PAT gen.3 | Remplacement fine-grained | | | | ls-remote vert | aucun (gel) |
| K-1a OpenAlex gen.A | Révocation (via régénération) | | | | 401/403 attendu sur l'ancienne | quota anonyme + bascule prouvée |
| K-1b OpenAlex gen.B | Invalidation (via régénération) | | | | idem | idem |
| K-2a APINex gen.A | Révocation (doc 40 §3) | | | | test console ancienne | provider optionnel |
| K-2b APINex gen.B | Invalidation (via régénération) | | | | test console nouvelle | provider optionnel |

Le bilan sera complété, daté, déposé sur le canal visible et **présenté au propriétaire avant toute poursuite** — conformément à l'autorisation.

---

## 8. Corrections de consignation (rigueur)

- Les mentions « ~17:30 UTC » portées dans les documents 60 et 61 sont des **estimations postérieures erronées** : les mesures réelles de la vague 36 ont été prises entre ~16:50 et ~17:05 UTC, celles de la présente vague à 17:10 UTC (horodatage plateforme de référence). La présente entrée de worklog fait foi ; les heures exactes de chaque mesure restent celles du journal de session.
- Aucun autre contenu des documents 60/61 n'est modifié ; le présent document complète la série.

---

## 9. Hors périmètre — verrouillés jusqu'à autorisation écrite distincte

Restauration/lignée Git (A2-A3), finalisation R2 (A4), fenêtre S1-S4 (A5), neutralisation des releases (A6), C2 (A7), actifs cryptographiques K-6/K-7 (A8), GO MEP (A9), Option B (A10) — **aucun n'est touché**. Par défaut, **aucune clé n'est installée/stockée dans le sandbox** ; toute exception (p. ex. `.env.local` local pour un test applicatif) fera l'objet d'une demande explicite préalable.

---

*Document de protocole et bilan initial — aucun acte de rotation n'a été exécuté par l'agent à la date du présent document ; les consoles restent la voie exclusive de révocation/génération.*
