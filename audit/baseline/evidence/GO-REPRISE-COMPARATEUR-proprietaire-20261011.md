# DÉCISION DU PROPRIÉTAIRE — Levée de gel ciblée du comparateur + reprise contrôlée R2 — reçue 2026-10-11

**Nature :** décision écrite du propriétaire dans la conversation (message intégral ci-dessous, reproduit mot pour mot sans aucun ajout ni retrait).
**Objet :** autorisation de l'**option 1** du doc 49 (rapport d'anomalie R2) : correction du faux positif §4.3bis du comparateur de contenu gelé v2.1 → v2.2, puis reprise contrôlée du protocole doc 46 v3.3 au contrôle §4.3bis sur l'état déjà obtenu — **sans relancer `db:push`** — puis finalisation §5bis étapes 6-12 si tous les contrôles bloquants réussissent.

---

## Décision du propriétaire — Autorisation ciblée après l'arrêt §4.3bis

J'autorise la **levée de gel ciblée du comparateur de contenu**, conformément à l'option 1 du rapport d'anomalie du dossier 49.

Cette autorisation est strictement limitée à la correction du faux positif identifié après la resynchronisation de `db/urbanisme-test.db` et à la reprise contrôlée du protocole du dossier 46 v3.3.

### 1. Correction autorisée

Vous êtes autorisé à :

- examiner le comparateur gelé v2.1 et le rapport d'anomalie ;
- produire une version corrigée v2.2 permettant de comparer correctement les données préexistantes lorsque le DDL prévu ajoute des colonnes ;
- ignorer uniquement les différences structurelles correspondant aux colonnes explicitement ajoutées par le DDL gelé et dûment vérifiées ;
- continuer à comparer exactement toutes les colonnes préexistantes, ligne par ligne ;
- maintenir la détection des modifications de valeurs, suppressions ou ajouts de lignes, différences de types, valeurs `NULL`, BLOB, nombres et autres anomalies déjà couvertes par les tests ;
- ajouter des tests ciblés couvrant les colonnes ajoutées, les valeurs `NULL`, les valeurs non nulles et les véritables divergences de données ;
- exécuter l'intégralité de la suite de tests de régression existante ;
- calculer et documenter les nouvelles empreintes SHA-256 des outils et des preuves modifiés.

**Interdiction :** ne modifiez pas les données, le snapshot de référence ou les résultats attendus dans le seul but de faire réussir le comparateur. Ne masquez aucune divergence réelle.

### 2. Conditions de validation

Avant toute reprise du protocole :

1. Vérifiez que les tests existants réussissent intégralement.
2. Vérifiez que les tests ciblés détectent les divergences réelles et acceptent uniquement les différences structurelles explicitement autorisées.
3. Confirmez que la comparaison des colonnes préexistantes reste exacte.
4. Documentez la cause du faux positif, la correction appliquée, les résultats des tests et les nouvelles empreintes.
5. Mettez à jour les éléments de traçabilité nécessaires, sans réécrire les preuves historiques des vagues 27 et 28.

Si un test échoue ou si une divergence reste inexpliquée, arrêtez-vous et présentez-moi les résultats. Aucune reprise ne sera alors autorisée.

### 3. Reprise du protocole R2

Après validation complète de la correction, vous êtes autorisé à :

- reprendre au contrôle §4.3bis du dossier 46 v3.3 ;
- exécuter le comparateur corrigé sur l'état actuel de `db/urbanisme-test.db` ;
- poursuivre les contrôles post-opération qui restent à effectuer ou à confirmer selon le dossier 46 ;
- si tous les contrôles bloquants réussissent, reprendre la finalisation à l'étape 6, conformément à l'ordre prévu au §5bis ;
- créer les commits et tags locaux R2 prévus par le protocole, uniquement après validation de toutes les conditions requises.

**Ne relancez pas `db:push` et ne répétez pas la resynchronisation.** Cette autorisation concerne la validation de l'état déjà obtenu.

### 4. Limites impératives

Cette autorisation ne permet pas :

- de modifier `db/custom.db` ou les données réelles ;
- de modifier ou supprimer le fichier de staging ou sa sauvegarde ;
- de changer le schéma Prisma ou le DDL gelé pour contourner un échec ;
- de restaurer une sauvegarde sans nouvelle décision écrite ;
- de réécrire l'historique Git, d'utiliser BFG ou d'effectuer un force-push ;
- d'effectuer un push distant ;
- de déployer ou distribuer l'application ;
- de lever les autres blocages de sécurité.

En cas de divergence réelle, d'erreur ou de résultat inattendu, arrêtez-vous, préservez l'état actuel et documentez les faits. Ne corrigez pas automatiquement les données.

### 5. Compte rendu attendu

Fournissez un rapport synthétique comprenant :

- la cause racine confirmée ;
- les fichiers modifiés et leurs empreintes avant/après ;
- les résultats des tests de régression et des nouveaux tests ;
- le résultat du contrôle §4.3bis ;
- les autres contrôles post-opération et leur état ;
- les commits et tags locaux éventuellement créés ;
- le verdict final : **CONFORME**, **CONFORME SOUS RÉSERVES** ou **ÉCHEC — ARRÊT**.

Ne relancez pas une nouvelle vague d'audit et ne répétez pas les vérifications déjà validées, sauf anomalie concrète nécessitant un contrôle ciblé.

**Cette décision autorise exclusivement la correction du comparateur et la reprise locale contrôlée de R2. Elle ne constitue pas une autorisation de push distant, de mise en production ou de distribution.**

*Consigne complémentaire du propriétaire (même message) : conserver le snapshot historique intact. La correction doit porter sur la logique du comparateur, et non sur la référence de données, afin que les contrôles continuent de détecter les pertes ou modifications réelles. SQLite permet l'ajout de colonnes sans réécrire le contenu des lignes existantes dans les cas ordinaires documentés ; cela rend l'hypothèse du faux positif plausible, mais c'est bien la validation par les tests qui doit autoriser la reprise.*
