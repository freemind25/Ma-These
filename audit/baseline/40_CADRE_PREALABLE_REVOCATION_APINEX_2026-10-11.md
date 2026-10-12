# 40 — CADRE PRÉALABLE — CONFIRMATION DE RÉVOCATION DE L'ANCIENNE CLÉ APINex (AVANT TOUTE RÉÉCRITURE D'HISTORIQUE)

**Cycle :** audit-final-v1.2 · vague 15 · **Date :** 2026-10-11
**Statut : CADRE PRÉPARÉ — CONFIRMATION NON REÇUE.** Répond au point 3 de la confirmation documentaire du propriétaire (2026-10-11) : « La confirmation de révocation de l'ancienne clé APINex avant toute opération de réécriture de l'historique. »
**Fondements :** `13_PURGE_GIT_PLAN.md` (plan de purge v1.2, en attente de ses 3 conditions — §7.1) · doc 28 décision ⑥ · audit A5 (`evidence/a5-git-audit.json`).

---

## §1 — Contexte factuel (vérifié, inchangé)

- La **clé APINex historique** (variable `APINEX_API_KEY` — **nom seul consigné, jamais la valeur**) a été exposée dans l'historique git via le fichier `.env`, suivi depuis le commit initial.
- L'historique est **publié sur origin** (`github.com/freemind25/ThesisFrame`).
- Le plan de purge (BFG / `git filter-repo`, doc 13 v1.2 §7) est **prêt et non exécuté** — aucune réécriture, aucun force-push, à ce jour.
- `.env` est désuivi ; le secret n'est plus suivi à HEAD depuis `6158f4e` (protection HEAD par défaut de BFG suffisante, doc 13 §7.2 étape 3).
- Red line P9 en vigueur : **aucune opération BFG / réécriture d'historique / force-push sans GO écrit spécifique.**

## §2 — Pourquoi la révocation doit PRÉCÉDER toute purge

La purge retire le secret de l'historique **mais ne désactive pas la clé elle-même**. Si l'ancienne clé n'est pas révoquée au préalable, elle reste utilisable par quiconque l'a extraite — la purge ne sert alors à rien (doc 13 §7.1 : condition (i) « obligatoire AVANT la publication, sinon la purge ne sert à rien »). La révocation est donc la **première des trois conditions** du plan, devant : (ii) l'approbation explicite du plan BFG et (iii) la fenêtre de coordination.

## §3 — Contenu attendu de la confirmation (à émettre par le propriétaire)

| Élément | Attendu |
|---|---|
| **Auteur de l'acte** | le propriétaire (ou toute personne mandatée par lui), auprès du fournisseur APINex |
| **Objet** | révocation (ou rotation avec invalidation de l'ancienne) de **la clé historique exposée** — l'ancienne clé uniquement |
| **Date de l'acte** | date explicite |
| **Justificatif** | capture ou référence (ticket, identifiant de confirmation) — **sans jamais inclure la valeur de la clé** |
| **Canal** | document remis au dépôt d'audit ou message écrit dans la session (la valeur de la nouvelle clé, si rotation, ne transitera que par **canal sécurisé** — jamais dans le dépôt ni l'historique, doc 28 décision ⑥) |

**Règle de confidentialité absolue (doc 13 §7.6)** : la valeur de la clé n'est jamais écrite dans un document, une preuve, un log ou une commande ; seul le motif public `sk-apx…` sert de format de scan.

## §4 — Vérifications effectuées à la réception

1. **Conformité formelle** : les 5 éléments du §3 sont-ils présents et explicites ?
2. **Portée** : la confirmation vise bien **l'ancienne clé exposée** (et, le cas échéant, documente le remplacement) ?
3. **Consignation** : le document de confirmation est archivé (preuve horodatée), le registre 09 et le doc 13 (statut de la condition (i)) sont mis à jour, le rapport v1.2 le mentionne.
4. **Effet** : la condition (i) du plan est réputée **satisfaite** — les conditions (ii) approbation du plan et (iii) fenêtre coordonnée restent à obtenir **séparément**.

## §5 — Ce que la confirmation ne débloque PAS seule (points d'arrêt)

- Aucune exécution de BFG, aucune réécriture d'historique, aucun force-push (red line P9) : après réception de la confirmation, le plan §7 du doc 13 est **soumis pour approbation formelle** (condition ii), puis la **fenêtre** est coordonnée (condition iii) — chaque étape fait l'objet d'une autorisation écrite distincte.
- Aucun lien avec les GO applicatifs : la révocation de clé est un acte de sécurité externe, **indépendant** des GO A (fenêtre commune) et GO B (lot 1), qui ne préjuge ni l'un ni l'autre.
- Si un écart est constaté dans la confirmation (portée différente, justification absente, suspicion de clé toujours active) → **signalement immédiat** au propriétaire et maintien du gel.

## §6 — Statu quo

Confirmation **non reçue** à ce jour. Maintien intégral : aucune réécriture d'historique, aucun BFG, aucun force-push, aucun push ; la liste de push (doc 38) reste en attente et sera re-vérifiée (E3) avant toute opération.

---
*Cadre préalable — ne constitue ni un GO ni une exécution. Statu quo conservatoire intégral maintenu.*
