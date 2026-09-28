# Note de présentation — Ma Thèse

| | |
|---|---|
| **Produit** | Ma Thèse (ThesisFrame) — plateforme IA de rédaction de thèses et mémoires universitaires |
| **Version** | 1.10.8 |
| **Date** | 19 septembre 2026 |
| **Public de cette note** | Établissements, directions de thèse, bibliothèques universitaires, doctorants et étudiants de master |
| **Document associé** | Notice d'utilisation complète : `docs/NOTICE-UTILISATION.md` |

---

## 1. En une phrase

**Ma Thèse** est un environnement de travail doctoral tout-en-un — disponible en application de bureau (Windows) et en application web — qui accompagne le doctorant **de l'idée à l'impact** : cadrage, plan, rédaction assistée par IA, recherche bibliographique, vérifications méthodologiques et export professionnel.

## 2. Le problème adressé

Le parcours doctoral est fragmenté : le candidat jongle entre un traitement de texte, des gestionnaires de références, des bases de données académiques, des outils d'IA génériques et des notes dispersées. Chaque outil additionnel augmente la charge cognitive et le risque d'incohérence (citations non alignées, plan qui dérive, méthodologie fragile).

## 3. La solution

Ma Thèse réunit dans une seule application cohérente **44 modules** organisés en 7 familles, autour d'un cœur central : **votre thèse**. L'IA n'y est pas un gadget : elle est contextuelle (elle lit votre propre travail), paramétrable (26 fournisseurs, dont 22 gratuits) et surtout **vérifiée** — des modules entiers sont consacrés au contrôle de cohérence méthodologique, cartographique et bibliographique.

## 4. Public cible

- **Doctorants** (toutes disciplines), du projet de recherche à la soutenance ;
- **Étudiants de master** pour mémoires et dissertations ;
- **Encadrants et laboratoires** qui veulent un suivi structuré (plan, sprints, vérifications) ;
- **Bibliothèques universitaires / services d'appui à la recherche** (veille, bases de données, SLR).

## 5. Les 7 familles de fonctionnalités

| Famille | Contenu |
|---|---|
| **Principal** | Tableau de bord (statistiques de progression, actions rapides, ressources pédagogiques) · Éditeur de thèse |
| **Rédaction** | Assistant IA (26 modes d'écriture : rédaction scientifique, revue de littérature, reformulation, résumé, préparation de soutenance…) · Mon IA de thèse (RAG : interrogez votre propre thèse) · Harper (résumeur/paraphraseur/extracteur) · Grammaire (correcteur IA académique) · Phrasier académique (phrases prêtes par section) · Déblocage écriture (exercices, Pomodoro) · Auto-édition 8C (8 critères de qualité) |
| **Structure & Planification** | Cadrage de thèse · Plan de thèse (+ template LaTeX) · Feuille de route agile (Kanban, sprints) · Boîte doctorale (checklist, calendrier, documents) · Équilibre des chapitres (IA) |
| **Recherche & Sources** | Références (import BibTeX, RIS, CSL-JSON ; compatible Mendeley, Zotero, EndNote ; export BibTeX) · Articles scientifiques (guide IMRaD) · Bases de données (27 ressources : HAL, Persée, CAIRN…) · Journaux Open Access (OpenAlex + DOAJ) · Thèses en ligne (HAL) · Explorateur Thèses (API theses.fr) · Veille académique (HAL + arXiv, alertes) · Recherche plein texte · Bibliothèque (7 sources de livres) |
| **Méthodologie & Vérification** | Guides méthodologiques · Analyse du champ (cartographie IA) · Outils SLR (PRISMA, criblage, extraction) · Vérification méthodologique · Vérification cartographique (questionneur socratique) · Vérification Citations (5 registres académiques) · Génération d'hypothèses · Vérification de cohérence · Alignement preuves (citations/références par chapitre) · Expérimentations (journal hypothèses/runs/preuves) |
| **IA & Outils** | Carnet de recherche, consensus multi-sources, visualisation · APInex Playground (chat multi-modèles + recherche web) · RoutesMe (comparaison multi-modèles) · Article → Code (Python reproductible) · Diagrammes · APA Composer (7ᵉ édition) · Livres-compétences · Traducteur |
| **Export** | Export PDF professionnel · Export DOCX Word formaté (styles APA, table des matières) |

## 6. Points forts différenciants

1. **IA multi-fournisseurs avec résilience** : 26 fournisseurs configurables (Z.ai natif sans clé, OpenAI, Anthropic, Mistral, Gemini, Groq… + endpoint personnalisé OpenAI-compatible), **circuit breaker** avec bascule automatique en cas de panne d'un fournisseur.
2. **IA contextuelle (RAG)** : l'assistant interroge *votre* thèse — réponses ancrées dans votre contenu, pas génériques.
3. **Culture de la vérification** : 6 modules de contrôle (méthodologique, cartographique, citations, cohérence, preuves, hypothèses) — rares dans les outils d'écriture IA.
4. **Souveraineté des données** : base **SQLite locale** (fichier `db/`), aucune donnée de thèse sur un serveur tiers ; fonctionne hors cloud pour le stockage.
5. **Double distribution** : installateur Windows signé NSIS (~73 Mo) et application web — même base de code Next.js 16.
6. **Qualité outillée** : suite de tests de 1 318 tests ; pipeline CI complet (build → installeur → release GitHub).

## 7. Architecture en bref

| Couche | Technologie |
|---|---|
| Frontend | Next.js 16 (App Router), TypeScript 5, Tailwind CSS 4, shadcn/ui, TipTap |
| Backend | API Routes Next.js (50+ routes), Prisma ORM |
| Données | SQLite locale (fichier, chiffrable par sauvegarde système) |
| IA | z-ai-web-dev-sdk (natif) + 21 fournisseurs externes configurables |
| Bureau | Tauri v2 (installeur Windows NSIS) |
| Qualité | Vitest (1 318 tests), ESLint, CI GitHub Actions |

## 8. Confidentialité et sécurité

- La thèse, les références et les notes restent dans le **fichier de base local** de la machine de l'utilisateur.
- Les clés API des fournisseurs IA sont optionnelles (sauf usage intensif) et stockées dans la configuration locale, jamais dans l'installateur.
- Aucune télémétrie de contenu ; les recherches académiques interrogent les API publiques officielles (HAL, theses.fr, OpenAlex, DOAJ, arXiv, CORE).

## 9. Obtention et déploiement

- **Bureau (Windows 10/11 x64)** : `Ma.These_1.10.8_x64-setup.exe` depuis la page *Releases* du dépôt GitHub — installation sans droits administrateur.
- **Web** : dépôt du projet, `bun install` puis `bun run dev` (développement) ou build de production ; la notice détaille les deux voies.
- Mise à jour : nouvelle release versionnée à chaque cycle (v1.10.7, v1.10.8…), mêmes canaux.

## 10. Accompagnement

- **Guide intégré** : icône d'aide (?) de l'en-tête de l'application — guide consultable en contexte, avec recherche.
- **Notice d'utilisation** : `docs/NOTICE-UTILISATION.md` (+ version PDF) — installation, configuration, parcours recommandé, guide de chaque module, dépannage.
- **Ressources pédagogiques** intégrées au tableau de bord (infographies : choix du directeur de thèse, article de recherche vs revue).
