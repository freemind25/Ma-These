# GO `RESYNC-TESTDB` — Autorisation écrite du propriétaire — reçue 2026-10-11

**Nature :** autorisation d'exécution écrite, signée par le propriétaire dans la conversation (message intégral ci-dessous, reproduit mot pour mot sans aucun ajout ni retrait).
**Réception :** 2026-10-11 ~20:45-20:50 UTC · **Référence protocole :** doc 46 v3.3 (§7 GO, §2 préconditions, §2bis rupture option A, §3 push, §4 contrôles, §5 validation, §5bis ordre à 12 étapes) · **Consignation :** doc 46 §2.1 (décision horodatée).
**Exécution autorisée :** uniquement sur `db/urbanisme-test.db` · aucune action distante, mise en production ou distribution.

---

## Autorisation d'exécution — Resynchronisation de la base de test R2

Je vous autorise à exécuter **la resynchronisation de `db/urbanisme-test.db` exclusivement**, conformément au protocole du dossier 46 v3.3, déjà validé.

Cette autorisation est limitée aux actions explicitement énumérées ci-dessous.

### 1. Actions autorisées

**A. Préparation et sécurisation**
- Vérifier les conditions préalables prévues par le dossier 46.
- Vérifier les empreintes SHA-256, l'état Git, l'arrêt du serveur et la disponibilité d'une sauvegarde indépendante vérifiée.
- Vérifier le lien physique entre la base de test et le fichier de staging.
- Si les conditions du protocole sont réunies, rompre ce lien côté dépôt en remplaçant atomiquement le fichier du dépôt par une copie indépendante, tout en préservant le contenu du staging.
- Produire les preuves préalables prévues par le protocole.

**B. Resynchronisation**
- Exécuter la commande de synchronisation du schéma uniquement sur `db/urbanisme-test.db`, après validation de tous les prérequis.
- Appliquer exclusivement les changements de schéma prévus dans le dossier 46 v3.3.
- Arrêter immédiatement l'opération en cas de divergence, d'erreur ou de résultat inattendu.

**C. Vérifications après exécution**
- Vérifier que `db/custom.db` est restée strictement inchangée.
- Vérifier l'intégrité SQLite et l'absence de violations de clés étrangères.
- Comparer le contenu des tables préexistantes avec le snapshot de référence.
- Vérifier les cinq nouvelles tables attendues, leur vacuité et les six index prévus.
- Exécuter deux fois le contrôle de dérive du schéma et confirmer un code de sortie égal à zéro à chaque exécution.
- Vérifier l'état du fichier de staging et les changements Git.
- Produire le compte rendu et les preuves prévues dans le dossier 46.

**D. Finalisation locale**
Si et seulement si tous les contrôles sont conformes :
- préparer le changement Git limité à `db/urbanisme-test.db` ;
- valider les preuves ;
- créer le commit et le tag applicatif R2 prévus par le dossier 46 ;
- mettre à jour les documents de traçabilité expressément prévus par ce dossier ;
- créer le commit documentaire et le tag documentaire R2, dans l'ordre prévu.

### 2. Actions expressément interdites par cette autorisation

Vous n'êtes pas autorisé à :
- modifier, migrer ou synchroniser `db/custom.db` ;
- modifier les données réelles de l'application ;
- lancer le protocole S1 ;
- modifier le schéma Prisma ou les outils gelés pour contourner un échec ;
- supprimer ou modifier le fichier de staging, ses données ou ses sauvegardes ;
- supprimer des journaux SQLite de récupération ou improviser une restauration ;
- réécrire l'historique Git, utiliser BFG ou effectuer un force-push ;
- pousser des commits ou des tags vers un dépôt distant ;
- déployer, distribuer ou mettre l'application en production ;
- lever les autres blocages de sécurité ou autoriser les lots de développement distincts.

### 3. Gestion obligatoire des anomalies

Si un contrôle préalable échoue, si une empreinte diffère, si le contenu des tables diverge ou si une erreur survient :

1. Arrêtez l'opération.
2. Ne tentez pas de corriger automatiquement l'écart.
3. Préservez la base, les sauvegardes et les éventuels journaux SQLite.
4. Documentez l'anomalie et les preuves disponibles.
5. Présentez-moi le résultat et attendez mes instructions avant toute reprise ou restauration.

Un échec ne constitue pas une autorisation d'élargir le périmètre.

### 4. Règle de conduite

Le dossier 46 v3.3 et les outils gelés des vagues 27–28 constituent les références opérationnelles.

Ne relancez pas une nouvelle vague d'audit et ne répétez pas les vérifications déjà validées, sauf si l'exécution révèle une anomalie concrète nécessitant un contrôle ciblé. Ne modifiez aucun outil gelé et n'ajoutez pas de tâches préventives sans nécessité démontrée.

### 5. Compte rendu final

Présentez :
- les contrôles préalables et leurs résultats ;
- les empreintes avant/après des bases et du fichier de staging ;
- les résultats des comparaisons de contenu et des contrôles SQLite ;
- les deux résultats du contrôle de dérive ;
- la liste exacte des fichiers modifiés ;
- les commits, tags et preuves effectivement créés ;
- le verdict : **CONFORME**, **CONFORME SOUS RÉSERVES** ou **ÉCHEC — ARRÊT**.

**Aucune action distante, mise en production ou distribution n'est autorisée. La présente autorisation porte uniquement sur la resynchronisation locale de la base de test et sa finalisation locale conditionnelle, selon le dossier 46 v3.3.**
