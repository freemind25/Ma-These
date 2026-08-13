# FICHE SYNTHÈSE — Journal de bord du projet

> **Emplacement de référence :** `/docs/FICHE_SYNTHESE.md`
> Ce fichier centralise l'historique des jalons du projet. Il permet de revenir rapidement au contexte exact d'une étape en cas de bug, de régression, de reprise après interruption, ou de question ultérieure.

---

## 🔒 Instruction permanente pour l'agent Z.ai — Discipline fiche synthèse

**À charger dans le contexte persistant de l'agent (pas dans un prompt ponctuel), pour être appliquée à chaque session.**

Le fichier `/docs/FICHE_SYNTHESE.md` est un journal de bord obligatoire du projet. Applique cette règle **sans exception, à chaque tâche** :

**Avant de commencer une tâche :**
Lis les 2-3 dernières entrées de `/docs/FICHE_SYNTHESE.md` pour récupérer le contexte du dernier jalon (décisions prises, points de vigilance, dette technique en attente).

**Avant de considérer une tâche comme terminée**, pose-toi systématiquement cette question et réponds-y explicitement dans ta dernière réponse à l'utilisateur :
*"Cette tâche constitue-t-elle un jalon significatif (fonctionnalité livrée, migration, correction majeure, décision d'architecture) ?"*

- **Si oui** → crée une nouvelle entrée en haut de ce fichier selon le modèle standard (voir plus bas), **avant** de proposer un commit ou de clore la tâche. Ne considère jamais un jalon comme terminé si la fiche n'a pas été mise à jour dans le même commit.
- **Si non** (correction mineure, typo, refactor cosmétique) → indique explicitement "Pas de mise à jour de fiche nécessaire pour cette tâche" pour que ce ne soit pas un oubli silencieux, mais une décision consciente.

**Format de commit :** si la fiche est mise à jour, elle doit être incluse dans le **même commit** que le code du jalon — jamais dans un commit séparé "à faire plus tard".

Cette règle prime sur la rapidité d'exécution : mieux vaut une tâche légèrement plus longue avec une fiche à jour qu'une tâche rapide sans traçabilité.

---

## Journal des jalons

## [2026-08-12] — État des lieux général du projet (entrée d'amorçage)

**Statut :** 🟡 partiel — synthèse rétrospective, à affiner par le Dev à la prochaine session

**Objectif de l'étape**
Poser une première fiche de référence consolidant l'état connu du projet ThesisFrame avant mise en place de la discipline "fiche synthèse à chaque jalon".

**Ce qui a été fait**
- Structure du mémoire à deux couches : squelette IMRaD verrouillé (exigences institutionnelles UC3) + contenu disciplinaire éditable.
- Module `directeurThese.js` (superviseur IA) avec system prompt strict interdisant la génération de contenu à la place du doctorant.
- Pipeline desktop Tauri v2 (Windows) générant un installeur NSIS via GitHub Actions.
- Migration base de données : SQLite éphémère → Supabase PostgreSQL (migration intentionnelle et confirmée).
- Intégration GIS/cartographie avancée : PostGIS, serveur de tuiles Martin, MapLibre GL.
- Module de vérification méthodologique : contrôle de complétude à base de règles + module de questionnement socratique (GLM/Z.ai).
- Onglet "Recherche" : recherche documentaire externe (OpenAlex/CrossRef/HAL) + gestion bibliographique (Mendeley OAuth) + sous-onglet revue de littérature.
- Fonctionnalité d'historique de chapitres / snapshots + diff au mot près (librairie `diff`), livrée sous forme de patchs git.
- Correctif d'échec de déploiement Vercel appliqué directement via git (commit `df30714`).

**Décisions techniques prises**
- Choix Supabase PostgreSQL comme base persistante définitive (over SQLite/LibSQL).
- GLM/Z.ai comme backend IA de référence sur l'ensemble de l'écosystème S@dim (choix délibéré et récurrent).
- Séparation stricte squelette institutionnel verrouillé / contenu disciplinaire libre.

**Points de vigilance / dette technique**
- ⚠️ Liens vers plateformes de piratage trouvés dans des routes API — **remédiation prioritaire non confirmée comme résolue**.
- ⚠️ Vulnérabilités identifiées sur l'intégration OAuth Mendeley (référencées C1 à C8) — statut de correction à vérifier.
- ⚠️ Migration Auth.js v5 annoncée par un développeur mais **non vérifiable dans le dépôt** — à auditer.
- Le token GitHub temporaire utilisé pour le commit `df30714` devait être révoqué — à confirmer que c'est fait.
- Système de structure de thèse (mode parties + chapitres) partiellement implémenté seulement.

**Dépendances et prérequis**
- Supabase (PostgreSQL) configuré et accessible.
- Serveur de tuiles Martin + PostGIS opérationnels pour le module GIS.
- Clé/API GLM/Z.ai (chat.z.ai) valide pour le module socratique et le superviseur IA.
- OAuth Mendeley configuré (sous réserve des vulnérabilités C1–C8 à corriger avant mise en production).
- Pipeline GitHub Actions pour le build Tauri/NSIS.

**Comment tester / vérifier que ça marche**
- À compléter par le Dev : commandes de build Tauri, script de vérification Supabase, test du module socratique.

**Commit(s) associé(s)**
- `df30714` — correctif déploiement Vercel.

**Problèmes rencontrés et solutions**
- Échec de déploiement Vercel → patché directement en production via git, sans passer par le flux normal (à documenter précisément par le Dev : cause racine du échec).

---

*(À partir de cette entrée, chaque nouveau jalon doit être ajouté au-dessus, selon le modèle défini dans les instructions ci-dessous.)*

---

## Instruction permanente pour le Dev — Fiche synthèse de jalon (ThesisFrame)

À chaque étape de travail significative (jalon, sprint, fonctionnalité livrée, correction majeure, migration), ajoute une nouvelle entrée **en haut** de ce fichier, selon le modèle suivant. Une fiche distincte peut être ouverte par grand module (ex. `FICHE_SYNTHESE_GIS.md`, `FICHE_SYNTHESE_RECHERCHE.md`) si le volume devient trop important pour un seul fichier.

**Modules actuellement suivis :** noyau thesis-writing, module GIS (PostGIS/Martin/MapLibre), module socratique/vérification méthodologique, onglet Recherche (OpenAlex/CrossRef/HAL/Mendeley), pipeline desktop Tauri, sécurité (Mendeley OAuth, secrets API).

```
## [Date] — [Nom du jalon / fonctionnalité]

**Statut :** ✅ terminé / 🟡 partiel / 🔴 bloqué

**Objectif de l'étape**
(1-2 phrases)

**Ce qui a été fait**
- Changements concrets (fichiers, modules, fonctions clés)

**Décisions techniques prises**
- Choix et justification

**Points de vigilance / dette technique**
- Ce qui reste fragile ou temporaire

**Dépendances et prérequis**
- Env vars, migrations, clés API, services externes

**Comment tester / vérifier que ça marche**
- Commande(s) ou étapes

**Commit(s) associé(s)**
- Hash(s)

**Problèmes rencontrés et solutions**
- Cause + fix, le cas échéant
```

**Règles de discipline :**
1. Ne jamais écraser une entrée précédente — toujours empiler chronologiquement, la plus récente en haut.
2. Mettre à jour la fiche **avant** de considérer le jalon comme clos.
3. Rester concis (15-20 lignes/jalon max, sauf cas complexe type migration de base de données ou refonte de sécurité).
4. En cas de jalon bloqué, documenter l'état exact : ce qui a été tenté, ce qui ne marche pas, piste envisagée.
5. En début de session, relire les 2-3 dernières entrées avant toute modification de code.
6. Toute information sur l'établissement/le pays doit rester absente de ce fichier si celui-ci est amené à être partagé hors contexte interne (cf. consigne S@dim sur les livrables).
