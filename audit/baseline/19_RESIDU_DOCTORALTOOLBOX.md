# 19 — Résidu DoctoralToolbox « INITIAL_* » — caractérisation, preuve de non-donnée-utilisateur, procédure de suppression ciblée PROPOSÉE (T5, cycle audit-final-v1.2)

**Statut : DOCUMENTATION + PROCÉDURE PROPOSÉE — AUCUNE exécution.** La base réelle `db/custom.db` n'a été accédée qu'en **LECTURE SEULE** (client Prisma one-shot, requêtes `findMany` exclusivement, script temporaire `/tmp` supprimé après exécution). La suppression proposée ci-dessous relève d'une **décision du propriétaire** (§3.0) ; les scripts fournis sont **prêts mais NON exécutés**.

---

## 1. Documentation du résidu

### 1.1 Provenance

| Élément | Détail |
|---|---|
| Cause | **Auto-création applicative** d'une DoctoralToolbox sur `theses[0]` (tri `updatedAt desc`) à la simple **visite** de la vue 14 « Boîte doctorale », même lorsque la thèse active en était une autre — anomalie **AUD-ISO-003** (P2), sélecteur local défaut `theses[0]` — **AUD-ISO-002** (P2) |
| Matérialisation | W2-3a sous-session 2 (contrôle de clôture de la vue 14, 2026-10-10 ~09:17) : `POST /api/thesis/cmsmyrdfs…/doctoral-toolbox` → **201**, `DoctoralToolbox` 0→1 en DB (preuves : `evidence/a1-lot2a-db-after.json`, audit réseau `a1-lot2a-network-recovered.json`, capture `a1-lot2a-fin-14-boite-autocreation-proprietaire.png`) |
| Consolidation | Fiche **A1L2A-02** (P2) dans `evidence/a1-lot2a.json` — « cas irréversible côté utilisateur » : **aucune voie UI de suppression** (aucun endpoint DELETE dans le module, pas de poubelle globale) |
| Correctif applicatif | **AUD-ISO-002/003 corrigés au commit `6f853ac`** (« plus d'auto-création à la simple visite ; 1ʳᵉ modification réelle = POST sur la thèse affichée uniquement ; sélecteur défaut = thèse active »). Le résidu en base **précède** ce correctif et n'est pas auto-résorbable |
| Date d'observation initiale | 2026-10-10 (W2-3a, commit de consolidation `8161a70`) ; re-vérifiée à chaque session suivante (« résidu documenté, non touché » — W2-3b → W2-5b) |
| Caractérisation T5 (ce document) | 2026-10-10, lecture seule one-shot, export `evidence/residu-doctoral-toolbox-export.json` |

### 1.2 État réel en base (lecture seule, T5)

- **Nombre de lignes DoctoralToolbox : UNE seule** (comptage total = 1, thèses totales = 1).
- Ligne unique :

| Champ | Valeur |
|---|---|
| `id` | `cmv26kryu001oq7vhdotgwrc1` |
| `thesisId` | `cmsmyrdfs0000pa2sews4vo90` — **la thèse propriétaire « Urbanisme durable »** (auteur Marie Dupont) — confirmé |
| `createdAt` | `2026-10-10T09:17:21.942Z` |
| `updatedAt` | `2026-10-10T09:17:21.942Z` — **identique à `createdAt`** : la ligne n'a **jamais été modifiée** depuis sa création (aucune édition utilisateur, aucun re-PUT debouncé) |
| Tailles brutes | checklist 3 229 o · milestones 1 317 o · documents 2 265 o · contacts 366 o · notes 0 o |
| Thèse liée | intacte : 7 chapitres, 2 295 mots, `updatedAt` thèse **inchangé** `2026-08-10T08:22:35.464Z` (la création de la toolbox ne modifie pas la thèse) |

- Cohérence temporelle : `createdAt` = 09:17:21 s'insère exactement dans la fenêtre SS2 documentée au worklog W2-3a (09:10–09:25) — provenance confirmée par trois sources indépendantes (DB, journal réseau CDP archivé, worklog).

### 1.3 Preuves

1. `evidence/residu-doctoral-toolbox-export.json` — export intégral réversible de la ligne (valeurs brutes telles que stockées) + comparaison champ par champ (généré T5, lecture seule).
2. `evidence/a1-lot2a-db-before.json` (DoctoralToolbox = 0, 08:42) et `evidence/a1-lot2a-db-after.json` (DoctoralToolbox = 1) — le résidu y a été observé pour la première fois.
3. `evidence/a1-lot2a.json` §vue 14 + fiche A1L2A-02 (POST 201 sur le propriétaire, absence de DELETE).
4. Worklog W2-2 (1ʳᵉ démonstration live du binding `theses[0]`), W2-3a+fin (matérialisation sur le propriétaire), W2-3b→W2-5b (résidu inchangé à chaque session).
5. Commits : `8161a70` (consolidation/documentarisation), `6f853ac` (correctif AUD-ISO-002/003 — `git show 6f853ac` confirme que les constantes `INITIAL_*` ne sont pas touchées, seuls les bindings/auto-créations le sont).

---

## 2. Preuve que le contenu est le template `INITIAL_*` et non une donnée utilisateur

Méthode : extraction **programmatique** (regex) des constantes `INITIAL_PHASES` (l.124-198), `INITIAL_MILESTONES` (l.200-213), `INITIAL_DOCUMENTS` (l.215-232), `INITIAL_CONTACTS` (l.234-267) de `src/modules/boite-doctorale/boite-doctorale-page.tsx` (aucune transcription manuelle), puis comparaison canonique (insensible à l'ordre des clés) avec le contenu DB parsé. Le module sérialise exactement ces constantes au POST initial (`serializeChecklist(INITIAL_PHASES)` + `JSON.stringify(INITIAL_MILESTONES/DOCUMENTS/CONTACTS)`, notes `""`) — cf. `boite-doctorale-page.tsx` §« Initial Data » et route `POST /api/thesis/[id]/doctoral-toolbox`.

**Tableau de comparaison champ par champ :**

| Champ DB | Template `INITIAL_*` (source) | Contenu DB réel | Identique octet/canonique ? |
|---|---|---|---|
| `checklist` (3 229 o) | 5 phases (`inscription`, `cours`, `recherche`, `redaction`, `soutenance`), **38 items** tous `checked: false` | 5 phases, mêmes clés dans le même ordre, **38 items tous `checked: false`**, ids/labels identiques | ✅ **deep-equal true** |
| `milestones` (1 317 o) | 12 jalons `ms-1`…`ms-12` ; `done: true` uniquement pour `ms-1`, `ms-2`, `ms-3` (dates/titres/types du template) | 12 jalons, ids/titres/dates/types identiques ; `done: true` exactement `ms-1`, `ms-2`, `ms-3` | ✅ **deep-equal true** |
| `documents` (2 265 o) | 16 documents `doc-1`…`doc-16`, `status: "absent"`, `notes: ""` | 16 documents, `status` = « absent » pour les 16, 0 note | ✅ **deep-equal true** |
| `contacts` (366 o) | 4 contacts `ct-1`…`ct-4`, `name/email/phone/notes` tous **vides**, `role` = libellés du template | 4 contacts, 0 champ renseigné (rôles = libellés template) | ✅ **deep-equal true** |
| `notes` (0 o) | `""` | `""` | ✅ **deep-equal true** |
| `updatedAt` vs `createdAt` | — (conséquence attendue d'une auto-création non suivie d'édition) | **identiques** (`2026-10-10T09:17:21.942Z`) | ✅ cohérent avec l'absence totale d'édition |

**Verdict : `TEMPLATE_PUR`** — le résidu est **strictement le template par défaut du module**, **aucune édition utilisateur** (0 item coché, 0 document non « absent », 0 contact renseigné, notes vides, jamais ré-enregistré). **Données utilisateur concernées : NON.**

*Réconciliation de comptage : le worklog W2-3a mentionnait « 37 items non cochés » ; le comptage réel est **38** (7+7+8+7+9 — la phase « Cours et formation » comporte 7 items, non 6 ; erreur arithmétique de la session antérieure). Conclusion inchangée : tous non cochés, template pur.*

*Conséquence de la clause « IMPORTANT » de la mission : le contenu ne contenant **aucune** donnée hors template, la procédure de suppression ciblée ci-dessous est **envisageable sans risque** ; si une re-vérification future détectait tout écart (les scripts le testent octet par octet et abandonnent), le statu quo serait conservé et le cas requalifié « données utilisateur potentielles — suppression NON recommandée ».*

---

## 3. Procédure de suppression ciblée — PROPOSÉE (NON exécutée)

### 3.0 Décision requise du propriétaire

Trois options, déjà posées à l'arbitrage v1.2 (`BASELINE_AUDIT_REPORT_v1.2.md` §3, arbitrage ⑤) :
- **A — Conserver** le résidu tel quel, documenté (statu quo — zéro risque, la toolbox est fonctionnelle et « à remplir » par l'utilisateur) ;
- **B — Supprimer** via la procédure ciblée ci-dessous (hygiène DB, retour à l'état antérieur à l'incident A1L2A-02) ;
- **C — Supprimer** puis laisser le correctif `6f853ac` prévenir toute récidive (état cible cohérent avec le correctif : pas de toolbox tant que l'utilisateur n'a pas réellement modifié la boîte doctorale).

La procédure ci-dessous n'est exécutable que sur **décision explicite** (B ou C).

### 3.1 Sauvegarde préalable (obligatoire avant toute suppression)

1. **Export JSON réversible — déjà produit** : `evidence/residu-doctoral-toolbox-export.json` (valeurs brutes de la ligne, id inclus — base du rollback).
2. **Copie de la base** (répétable à froid, lecture simple de fichier) :
   ```bash
   cp db/custom.db /tmp/custom-avant-purge-residu-$(date +%Y%m%d-%H%M%S).db
   # puis vérifier la copie : intégrité + comptage sur la COPIE uniquement
   DATABASE_URL="file:/tmp/<copie>.db" bun run audit/baseline/tools/delete-doctoral-toolbox.ts   # dry-run sur la copie
   ```
3. **Répétition sur copie recommandée** : les scripts acceptent une `DATABASE_URL` explicite — répéter la suppression **sur la copie** avant de toucher à la base réelle (le dry-run sur la base réelle est lui-même sans écriture).

### 3.2 Suppression par id exact

Script prêt (NON exécuté) : `audit/baseline/tools/delete-doctoral-toolbox.ts`
- dry-run par défaut ; exécution réelle : `bun run audit/baseline/tools/delete-doctoral-toolbox.ts --execute`.
- Commande Prisma précise utilisée (double critère exact, décompte attendu = 1) :
  ```ts
  await prisma.doctoralToolbox.deleteMany({
    where: { id: "cmv26kryu001oq7vhdotgwrc1", thesisId: "cmsmyrdfs0000pa2sews4vo90" },
  }); // deleted.count DOIT valoir exactement 1
  ```
- Gardes intégrées (abandon automatique sinon) : compte total = 1 ; id + thesisId correspondent aux constantes ; **les 5 champs en base sont identiques octet pour octet à l'export de référence** (anti-données-utilisateur) ; thèse existante.

### 3.3 Contrôles post-suppression

Automatisés par le script, complétés par un comptage global si souhaité :
1. `DoctoralToolbox` count = **0** ;
2. thèse `cmsmyrdfs0000pa2sews4vo90` intacte : titre « Urbanisme durable », 7 chapitres, **`updatedAt` thèse inchangé** (`2026-08-10T08:22:35.464Z` — la suppression d'une ligne liée ne modifie pas la thèse) ;
3. aucune autre table concernée (suppression d'une seule ligne sans cascade descendante — DoctoralToolbox n'a pas de dépendants) ;
4. UI : re-visiter la vue 14 → la boîte doctorale repasse à l'état « template non enregistré » ; avec le correctif `6f853ac`, aucune ré-création à la simple visite.

### 3.4 Rollback (deux niveaux)

1. **Ré-insertion ciblée** depuis l'export JSON (script prêt, NON exécuté) :
   ```bash
   bun run audit/baseline/tools/restore-doctoral-toolbox.ts --execute
   ```
   — `create` avec **id, thesisId, createdAt et les 5 champs bruts identiques** à l'export (jamais d'upsert ; refuse si une ligne existe déjà). Seule limite, par conception Prisma : le champ `updatedAt` (@updatedAt) vaudra l'horodatage de la restauration.
2. **Restauration globale** : recopie de la sauvegarde `db/custom.db` faite en §3.1 (uniquement hors activité du serveur, après arrêt — opération propriétaire).

### 3.5 Conditions d'exécution

- Décision propriétaire enregistrée (B ou C) ;
- serveur dev en activité normale autorisée (SQLite gère la concurrence) — recommandé : exécuter hors période d'édition active ;
- consigner l'exécution (avant/après) dans le worklog et, le cas échéant, dans `BASELINE_AUDIT_REPORT_v1.2.md` (arbitrage ⑤) ;
- **aucun** `db:push`, aucune migration, aucune autre écriture : la procédure ne touche que cette ligne.

---

## 4. Traçabilité des scripts

| Script | Statut | Rôle |
|---|---|---|
| `audit/baseline/tools/delete-doctoral-toolbox.ts` | PRÊT — **NON exécuté** | dry-run par défaut, gardes anti-données-utilisateur, `deleteMany` à double critère exact, contrôles post |
| `audit/baseline/tools/restore-doctoral-toolbox.ts` | PRÊT — **NON exécuté** | rollback : ré-insertion à l'identique depuis l'export JSON (create, jamais upsert), contrôle d'identité octet pour octet |

*Invariants T5 : lecture seule de `db/custom.db` (findMany uniquement) · scripts temporaires `/tmp` supprimés · DATABASE_URL jamais journalisé · aucun secret dans les preuves · aucun commit · aucun fichier rouge touché · serveur dev non redémarré.*
