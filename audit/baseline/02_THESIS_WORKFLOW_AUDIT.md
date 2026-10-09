# 02 — Audit Métier : Assistance à la Rédaction de Thèse (Phase 2)

## 7.1 Gestion des projets de recherche

| Contrôle | Résultat | Verdict |
|---|---|---|
| Thèse existante : titre, auteur, 7 chapitres structurés (I→VII), progression affichée | ui-02/ui-03 ; DB | ✅ |
| Organisation chapitres : onglets triés, ajout, déplacement (↑↓), statut (Non commencé/Brouillon…), historique | ChapterTabs + ChapterHeader rendus ; mutations non exécutées (données propriétaire) | ⚠️ partiellement vérifié |
| **Multi-thèses** | Impossible via l'UI une fois une thèse active (AUD-FUNC-002) | ❌ CASSÉ |
| Ordre/sections/parts | Colonnes partId + sortOrder en DB (30 modèles, schema.prisma) ; UI « Plan de thèse » non testée en profondeur | ⚠️ NON VÉRIFIÉ (détail) |

## 7.2 Rédaction et édition

| Contrôle | Résultat | Verdict |
|---|---|---|
| Éditeur riche : titres H1-H3, gras/italique/souligné/barré, code, alignements, listes, quote | Toolbar rendue (ui-03) ; tiptap actif | ✅ |
| Sauvegarde | Autosave + Sauvegarder ; 2 295 mots comptés en DB = persistance réelle des sessions antérieures | ✅ (indirect) |
| Perte de texte (changement vue/onglet/refresh) | Reload pendant l'éditeur → retour dashboard, contenu NON perdu (DB) ; pas de perte constatée | ✅ |
| Historique chapitre | « Historique » bouton présent (chapter-history-dialog.tsx) ; non exécuté | ⚠️ NON VÉRIFIÉ |

## 7.3 Génération par IA

| Contrôle | Résultat | Preuve | Verdict |
|---|---|---|---|
| 27 modes affichés et sélectionnables | Mode « Rédaction scientifique » sélectionné | ui-09/ui-10 | ✅ |
| Génération réelle de bout en bout | Texte pertinent généré (durabilité urbaine, intégrant le contexte du prompt test), stream 200 en 2,2 s | ui-11 ; dev.log `POST /api/ai-writing/stream 200` | ✅ |
| Traçabilité provenance | **Sceau affiché** : « Provenance des savoirs : noyau de connaissance v2026-10-03 — aucune compétence livre active » | ui-11 (texte) | ✅ |
| Requête vide/invalide | Validation serveur 400 propre (ai-writing route.ts l.35-50) | code + POST observé | ✅ |
| Indication des limites IA | Bannière data + sceau ; libellés honnêtes (« MeiliSearch (simulation) », « repère(s) à compléter ou vérifier ») | UI | ✅ |
| Annulation d'une génération | NON VÉRIFIÉ (non testé) | — | ⚠️ NON VÉRIFIÉ |
| RAG « Mon IA de thèse » | Indexation 12 chunks (10 ch., 1 réf., 1 notes) ; réponse exacte **avec citation de source** « [Chapitre 1 - Introduction générale et problématique] », ancrée dans les extraits | UI live | ✅ |
| Risque mélange de projets | Mono-thèse active ; RAG délimité par `--- Extrait N [Source] ---` (audit 04, C6) | code | ✅ |

## 7.4 Sources, références et citations

| Contrôle | Résultat | Verdict |
|---|---|---|
| Création/import de références | Création manuelle ✅ (201) ; imports BibTeX/RIS/CSL-JSON/Mendeley/Zotero annoncés — import NON exécuté (fichiers de test non préparés) | ⚠️ partiel |
| Doublons | Pas de contrôle de doublon observé à la création (2e réf. identique acceptée — non testé activement) | ⚠️ à investiguer |
| Références introuvables / générées vs vérifiées | Champs `source` (manual/import…) distingués dans le modèle + badges source à l'UI | ✅ (mécanisme) |
| Export BibTeX | Bouton présent ; non exécuté | ⚠️ NON VÉRIFIÉ |
| Recherche académique (OpenAlex/CrossRef/HAL, thèses.fr) | Thèses en ligne ✅ (135 résultats) ; Journaux OA et Bases de données non exécutés (quota/latence externes) | ⚠️ partiel |

## 7.5 Analyse documentaire et imports

| Contrôle | Résultat | Preuve | Verdict |
|---|---|---|---|
| Corpus de 16 documents importés (3 corpus + 4 tests + 9 PDF RAR) | Présent en DB (248 Mo, skip-worktree local) ; pipeline import+OCR récemment prouvé (cycle import-rar-ressources : 9×201, OCR 8/9 done, confiances 26-81 %, 1 failed honnête) | specs/import-rar-ressources/preuves.md | ✅ (preuves de cycle du 2026-10-08) |
| Validation type/taille | Liste blanche extension + **magic bytes** + 50 Mo (413/415 différenciés) | audit 03/04 | ✅ |
| Affichage du corpus dans l'UI | Non localisé dans les vues testées (plein texte = chapitres seulement ; Bibliothèque = livres) — l'accès UI au corpus OCR reste à clarifier | parcours UI | ⚠️ DÉGRADÉ (découvrabilité) |
| OCR : PDF numérisés | Pris en charge (Tesseract, planOcrPages = pages sans texte seulement, fusion non destructive) ; cas d'échec honnête documenté | specs + worklog | ✅ |

## 7.6 Export et qualité documentaire

| Contrôle | Résultat | Preuve | Verdict |
|---|---|---|---|
| DOCX généré = fichier Word valide | `Microsoft Word 2007+`, 26 entrées ZIP, 38 paragraphes, contenu intégral chap. I, accents/apostrophes corrects (l&apos;) | /tmp/audit-export2.docx analysé | ✅ |
| **« Table des matières » annoncée** | **ABSENTE** (0 champ TOC, 0 sdt, 0 hyperlink) | XML | ⚠️ AUD-EXPORT-001 |
| **« Styles APA » annoncés** | **Aucun style appliqué** (0 pStyle, 0 Heading) — gras/tailles en formatage direct (b×15, sz 24/28/32) | XML | ⚠️ idem |
| **« Numérotation » annoncée** | **Absente** (0 numPr, 0 saut de page) | XML | ⚠️ idem |
| Export PDF | Vue présente ; non exécutée ce cycle (précédemment prouvée dans cycles antérieurs) | — | ⚠️ NON VÉRIFIÉ (ce cycle) |
| Cohérence affiché ↔ exporté | Contenu = chapitres réels, aucune troncature observée (38 blocs) | comparaison | ✅ |

**Synthèse Phase 2** : le cœur métier (rédaction, IA générative, RAG ancré, recherche thèses, exports) est **réellement fonctionnel**. Défauts : multi-thèses ❌, promesses de formatage DOCX non tenues ⚠️, découvrabilité du corpus importé ⚠️, imports de références et annulations non vérifiés.
