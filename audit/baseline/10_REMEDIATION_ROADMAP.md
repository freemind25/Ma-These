# 10 — Plan de Correction Priorisé (Phase 10)

**Principe** : aucun correctif appliqué dans ce cycle (audit constat). Ce plan sera exécuté UNIQUEMENT après validation du rapport par le propriétaire (étape 2 du processus), dans une phase distincte, avec revalidation (Phase 11).

Ordre imposé par le référentiel : secrets/données → pertes de données → parcours essentiels → intégrations IA → persistance → robustesse/perf → ergonomie → dette.

## P0 — BLOQUANT
**Aucun.** Aucune vulnérabilité critique exploitée, aucune perte de données constatée en usage normal, aucun parcours de travail quotidien cassé. (Le verdict global reste GO SOUS CONDITIONS — voir rapport final §K.)

## P1 — CRITIQUE (avant toute ouverture à des utilisateurs)

| ID | Anomalie | Solution proposée | Effort | Risque régression | Critères d'acceptation |
|---|---|---|---|---|---|
| C-1 | AUD-GOV-001 (sauvegarde) | Backup automatique daté de `db/custom.db` au boot serveur + rotation 7 jours ; commande restore documentée ; copie hors arbre git | 0,5-1 j | Faible | Restore complet démontré depuis un backup daté (thèse + corpus lisibles) |
| C-2 | AUD-FUNC-002 (multi-thèses) | CTA « Créer une thèse » → ouvre `CreateThesisDialog` ; bouton « Mes thèses / changer » dans l'éditeur | 0,5 j | Faible | Créer une 2e thèse via l'UI + revenir à la liste + ré-ouvrir la 1re |
| C-3 | AUD-FUNC-003 (suppression sans confirmation) | AlertDialog shadcn avant `deleteRef.mutate` (et audit des autres Trash2 du dépôt) | 0,5 j | Faible | Toute suppression exige confirmation ; TNR suppression confirmée OK |
| C-4 | AUD-SEC-001 + 005 (Tauri) | Retirer `shell:allow-execute`/`allow-open` des capabilities ; CSP explicite dans tauri.conf.json | 0,5 j (compile à retester sous Windows — réserve) | Moyen (build desktop) | App web inchangée + capabilities minimales ; build Windows à valider par le propriétaire |

## P2 — IMPORTANT (avant lancement si possible)

| ID | Anomalie | Solution | Effort | Critères |
|---|---|---|---|---|
| C-5 | AUD-EXPORT-001 | Appliquer pStyle Heading1/2 + champ TOC + numPr dans le générateur DOCX (ou rectifier l'annonce UI — décision produit) | 0,5-1 j | Document Word avec styles + TOC générant une pagination |
| C-6 | AUD-UX-002 (panneau livrable permanent) | Conditionner par flag/paramètre | 0,1 j | Plus de recouvrement en usage normal |
| C-7 | AUD-UX-001 (corpus non découvrable) | Vue « Corpus » (liste ImportedDoc + statuts OCR + recherche) ou intégration à la recherche plein texte | 1-2 j | Les 16 documents visibles et interrogeables depuis l'UI |
| C-8 | AUD-HYD-001 (hydratation div>p) | Localiser via stack + corriger la sémantique | 0,25 j | 0 erreur hydratation ; badge dev « Issues » vide |
| C-9 | AUD-SEC-002/003 (historique .env) | `git rm --cached .env` + purge BFG + force-push (coordination propriétaire) + révoke APINex | 0,5 j + action externe | `git log -S '<valeur>'` vide sur tout l'historique |
| C-10 | AUD-REL-001 (Overpass) | Timeouts fetch (10 s) + retry 2 borné | 0,25 j | Indisponibilité échoue < 15 s avec message |
| C-11 | AUD-FUNC-004 (persistance état) | Persister currentView (même store) | 0,1 j | F5 → même vue restaurée |
| C-12 | AUD-FUNC-005 (double POST) | Reproduire, isoler le double event, bloquer isPending | 0,25-0,5 j | 1 clic = 1 POST 201 (5 essais) |

## P3 — AMÉLIORATIONS

| ID | Anomalie | Action |
|---|---|---|
| C-13 | AUD-FUNC-001 | Supprimer le `\n` littéral (editor-page.tsx:204) — 1 ligne |
| C-14 | AUD-DOC-001 | Footer lit package.json version |
| C-15 | AUD-DOC-002 | Ré-aligner notice ↔ comptage réel des modes |
| C-16 | AUD-DATA-001 | Purger les références de test résiduelles (accord propriétaire) |
| C-17 | AUD-SEC-004/006/007 | Schémas zod sur routes restantes ; encadrer le champ `context` ; messages d'erreur génériques côté IA |
| C-18 | Dette (audit 03) | Retirer route scaffold `/api` « Hello world! » ; Prisma log query conditionnel (dev seulement) ; `db:seed` script cassé à réparer/retirer ; pagination des listes (references/entries/articles) |
| C-19 | Vues non testées (33/47) | Pass d'exploration UI complémentaire avant diffusion large |
| C-20 | CI | Créer le pipeline (lint + vitest + build web) — prérequis au build desktop récurrent |

## Dépendances
C-1 avant tout usage par des tiers ; C-2/C-3 indépendants ; C-4 indépendant mais sa validation finale exige le build Windows (propriétaire) ; C-9 exige coordination push/révoke (propriétaire) ; C-7 avant toute communication sur « la bibliothèque de corpus ».

## Estimation globale
P1 ≈ 2-2,5 j · P2 ≈ 3,5-4,5 j · P3 ≈ 1-2 j + CI. Fourchettes honnêtes ; « à estimer après investigation » pour C-9 (purge historique) et C-4 (validation Windows).
