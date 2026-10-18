# C2-R5 — Rapport de phase : correctifs de journalisation (EX-1..EX-4)

Date : 2026-10-18 · Branche : fix/c2-ecarts · Versions : 1.10.10 -> 1.10.11
Commits : 5427e96 (correctif lanceur), 4d9e2e2 (bump 1.10.11)

## 1. Objectif
Corriger les déficits de journalisation EX-1..EX-4 relevés à l'audit C2, livrer une build unique et la valider en conditions réelles (tests T1-T7).

## 2. Correctifs (commit 5427e96, src-tauri/src/lib.rs, +108/-8)
- EX-1 : journal persistant en append (OpenOptions), état Tauri LogPath(PathBuf)
- EX-2 : horodatage [YYYY-MM-DD HH:MM:SS] via chrono::Local, macro diag!
- EX-3 : rotation a 5 MiB, archives server.log.%Y%m%d-%H%M%S, retention 10, purge des plus anciennes
- EX-4 : arret journalisé en deux temps (taskkill gracieux, deadline 10 s via try_wait, puis taskkill /T /F) + message durée d'extraction

## 3. Livrable scellé
Ma Thèse_1.10.11_x64-setup.exe — 109 270 891 octets — SHA256 5337dcfca01855064eec8aea1e7e43e1aa9f9d14ff02323b10483752bfef165a (re-vérifié en séance)

## 4. Validation T1-T7 : 8/8 PASS en conditions réelles
- T1 append : marqueur ligne 193 < section 1.10.11 ligne 194, pas d'écrasement
- T2 horodatage : 14 lignes horodatées
- T3 arrêt journalisé : séquence complète en 3 lignes ; T3b zéro node.exe résiduel (3 cycles)
- T4 durée : extraction réelle 97 s, message « ~1 à 2 min » présent
- T5 rotation : journal 18,9 Mo archivé -> server.log.20261018-152112
- T6 rétention : 13->10 puis 11->10, purges des plus anciennes
- T7 skip : « standalone v1.10.11 (zip 76830133 octets) déjà extrait, skip » cohérent avec le marqueur version+taille

## 5. Incidents de séance (élucidés)
- verif1 collé pendant la deadline d'arrêt -> faux FAIL T3/T3b, recollage après 15 s -> PASS
- verif2 trop laxiste (archives factices 2024, ligne 1.10.10 héritée) -> garde-fou strict VERIF2-BIS, puis T5/T7 réels PASS
- gonflage prep2 exécuté avant le 1er lancement -> journal réparé par troncature (sauvegarde conservée puis supprimée)
Détail chronologique complet : voir C2-R5-journal-de-seance-T1-T7.txt (même dossier)

## 6. État final de la machine
App 1.10.11 installée ; archives réelles conservées (server.log.20261018-152112, 18 900 573 o ; server.log.20261018-152910, 6 300 815 o) ; nettoyage effectué (standalone.avant-R5, factices 2024 excédentaires, sauvegardes).

## 7. Limites connues (backlog R6, non bloquantes)
Arrêt gracieux sans effet sur node.exe (kill forcé systématique à 10 s) ; polices Google distantes (échec build hors réseau) ; portabilité du script de prep ; staticVCRuntime ; artefacts non trackés (régularisés par la présente consignation).

## 8. Conclusion
Phase R5 close : 8/8 PASS, build 1.10.11 scellée, machine en état de référence. Clôture technique C2 soumise aux 4 vérifications ciblées du conseiller : restauration des sauvegardes après mise à jour, fermeture pendant activité réelle du job-worker, hygiène du dépôt (présente étape), autres conditions de clôture de l'audit initial.

<!-- FIN RAPPORT C2-R5 -->
