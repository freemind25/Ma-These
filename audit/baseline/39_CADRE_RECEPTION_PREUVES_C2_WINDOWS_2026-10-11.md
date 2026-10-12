# 39 — CADRE DE RÉCEPTION ET DE VÉRIFICATION DES 8 PREUVES C2 WINDOWS

**Cycle :** audit-final-v1.2 · vague 15 · **Date :** 2026-10-11
**Statut : CADRE PRÉPARÉ — PREUVES NON REÇUES.** Répond au point 2 de la confirmation documentaire du propriétaire (2026-10-11) : « Les huit preuves C2 Windows, dès qu'elles seront disponibles, avec contrôle des empreintes et signalement immédiat de tout écart. »
**Fondements :** doc 24 (check-list C2 Windows complète, §7 = liste des preuves, §8 = gabarit) · 5ᵉ décision propriétaire point ④ : « vérification des 8 preuves à réception, aucun succès déclaré avant vérification complète ».

---

## §1 — Objet

Le C2 (build Windows Tauri + smoke CSP) est exécuté **par le propriétaire sur sa machine Windows**, sur le candidat exact **`7dff2c6c98f8be59edb64b34f8a1eb021745a435`** (tag `candidat-app-audit-v1.2`, jamais déplacé). Le présent cadre fixe **ce qui sera contrôlé à la réception des preuves**, avant toute consignation d'un succès. Rappel : la check-list à utiliser pour l'exécution est **le doc 24 uniquement** (jamais `evidence/c2-windows-checklist-pre-remplie.md`, préparée sur `fb60ae1`, obsolète).

## §2 — Les 8 preuves attendues et leurs critères de contrôle

| # | Preuve (doc 24 §7) | Format attendu | Contrôle effectué à la réception |
|---|---|---|---|
| 1 | **`c2-build-windows.json`** | gabarit doc 24 §8 rempli **intégralement** — aucun champ « [À COMPLÉTER] » | conformité champ à champ au gabarit ; `commit_teste` = `7dff2c6c98f8be59edb64b34f8a1eb021745a435` ; conclusion = `DESKTOP_WINDOWS_VALIDE` ou `PROBLEMES: <liste>` |
| 2 | **Captures `c2-01` … `c2-13`** | fin de build · installeur (dossier nsis/, nom + taille) · premier démarrage · GP-1→GP-8 (8 captures) · CSP/capabilities · arrêt processus | présence des 13 captures ; lisibilité ; cohérence avec les résultats déclarés dans le JSON (chaque GP déclaré PASS doit avoir sa capture) |
| 3 | **Versions relevées** | Tauri, Rust (`rustc`), Bun, Node, Windows (`winver`) | présence des 5 relevés ; aucune exigence de version épinglée (aucune dans le dépôt) — les valeurs sont consignées telles quelles |
| 4 | **Empreinte d'arbre obtenue** + `git rev-parse HEAD` + `git status` | sorties brutes de la machine Windows | **empreinte = `8ae37edab22fea51f6a4a13a16cd21a8f78c3d55f81c61851e343d43f987e75e`** (référence du développeur) ; `HEAD` = `7dff2c6c98f8be59edb64b34f8a1eb021745a435` ; arbre propre. **Tout écart = ARRÊT + signalement immédiat** (si divergence d'empreinte `git archive` : rapporter les deux empreintes — le hash complet du commit + `git status` propre restent le critère décisif, annexe doc 24) |
| 5 | **Pré-contrôles drift DB** | 2 exit codes (`custom.db` et `urbanisme-test.db`) | **exit 0 et 0** (aucun drift) — exit 2 = drift = ARRÊT |
| 6 | **Chemin + taille de l'installeur** | chemin `src-tauri/target/release/bundle/nsis/` (ou variante CI `x86_64-pc-windows-msvc/`) | motif attendu **`Ma Thèse_1.10.8_x64-setup.exe`** (nom exact confirmé à la sortie réelle) ; **aucun `.msi` attendu** (targets = `["nsis"]`) |
| 7 | **Déclaration d'écarts** | liste explicite, **même mineure** | toute anomalie, violation CSP, comportement inattendu — la déclaration vide doit être explicite (« aucun écart constaté ») |
| 8 | **Confirmation de nettoyage** | déclaration écrite | objets `AUDIT-C2-` supprimés via les flux UI ; thèse réelle intacte |

## §3 — Protocole de contrôle (séquence, à la réception)

1. **Complétude** : les 8 items sont-ils tous présents ? (un item manquant = demande de complément, aucune vérification déclarée).
2. **Identité du candidat** (item 4) : empreinte + hash + arbre propre — **contrôle premier et bloquant**.
3. **Cohérence croisée** : chaque champ du JSON (item 1) recoupé avec les captures (item 2), les versions (item 3), l'installeur (item 6) et le drift DB (item 5) ; CSP et capabilities comparées aux valeurs exactes attendues (doc 24 §5.2 : CSP production ligne 27 du `tauri.conf.json` ; capabilities = `core:default` seul, windows `["main"]`, aucune permission shell).
4. **Verdict** : `DESKTOP_WINDOWS_VALIDE` ssi tous les contrôles PASS (GP-4/GP-5 « N/A-environnement » avec échec propre admis, explicitement notés) ; sinon `PROBLEMES: <liste>`.
5. **Consignation** : registre 09 (fiche C2) + rapport v1.2 + archivage des preuves dans `audit/baseline/evidence/` (naming `c2-*`) — par le développeur (cf. doc 37 §7).

## §4 — Règle d'écarts (impérative)

- **Tout écart → ARRÊT + signalement immédiat** au propriétaire (exigence répétée du propriétaire : « signalement immédiat de tout écart »).
- **Aucun succès déclaré avant vérification complète** des 8 preuves.
- **Aucun correctif de code ni de configuration** pendant ni après l'exécution : le C2 porte strictement sur l'arbre de `7dff2c6` ; tout écart remonte en signalement, décision au propriétaire.
- Un écart de sécurité (CSP, capabilities, processus orphelin) est **prioritaire** et interrompt tout le reste.

## §5 — Effet du C2 sur le GO final

Le C2 est le **dernier critère GO non exécuté** (décision ④, doc 28). Il n'autorise rien par lui-même : il alimente le paquet de preuves sur lequel le propriétaire fondera son accord écrit final (mise en production / premiers utilisateurs / diffusion restent interdits avant cet accord).

## §6 — Statu quo

Preuves **non reçues** à ce jour — aucun verdict C2 n'existe, aucun succès n'est déclaré. Rappels doc 24 §9 toujours en vigueur : aucune diffusion du binaire, base locale de la machine de test uniquement (ne jamais remplacer `db/custom.db` du poste réel), objets de test `AUDIT-C2-` créés puis nettoyés, résultats C2 rapportés **séparément** du volet web C1.

---
*Cadre de vérification — ne constitue ni un GO ni une exécution. Statu quo conservatoire intégral maintenu.*
