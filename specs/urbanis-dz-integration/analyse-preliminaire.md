# Analyse préliminaire — Intégration URBANIS-DZ dans ThesisFrame

**Nature** : étude de faisabilité demandée par le propriétaire (IM, 2026-10-07) — « analysez le contenu du document … voir la possibilité d'une potentielle intégration dans l'application ». Aucun code écrit ; aucune ouverture de cycle tant que l'option n'est pas choisie (point d'arrêt Étape 0).
**Source analysée** : `upload/URBANIS-DZ_Pack_construction_agent.pdf` (v1.1, 5 pages, texte extrait **18 761 car.**). Remarque : `upload/Agent-Urbaniste-DZ.pdf` (931 Ko) existe aussi dans upload/ — non analysé ici, probablement la source documentaire liée.

## 1. Ce qu'est le pack (mesures réelles)

| Section | Taille (car.) | Contenu |
|---|---|---|
| §1 Architecture (10 couches C0-C7, T1-T2) | ~1 900 | Système documentaire couches séparées |
| §2 Instruction système | **4 837** | Identité + 12 règles dures (VÉRITÉ, SOURCE, DROIT/JORADP, ÉCHELLE, TROIS REGISTRES, NON-COMPLAISANCE, NO-OPPOSABILITÉ, FONCIER, RISQUES, PERSONNES, LIMITES) + cadrage + modes M1-M7 + format de sortie avec bloc de traçabilité |
| §3 Référentiel juridique minimal | 2 815 | ~20 textes DZ (loi 90-29, 04-05, décrets 91-175/177/178, 08-15, 06-06, SNAT, patrimoine, foncier 23-17, 11-04, collectivités, 03-10, 18-07/25-11) avec statut/vigilance |
| §4 Sous-référentiel risques | 3 535 | ~16 textes (loi 24-04, décrets 25-132/25-63/25-60/25-61/25-62, 24-198, RPA99/DTR, 23-21, 06-198, 07-144/145, 03-451, déchets 01-19/25-02) |
| §5 Protocole risques obligatoire | 1 178 | Grille Aléa / Exposition / Vulnérabilité / Capacité de réponse / Décision |
| §6 Gabarit note de conformité | ~1 000 | 10 rubriques + TRAÇABILITÉ |
| §7 Format registre juridique | ~900 | 11 champs : ID, Domaine, Référence, JORADP, Statut, Textes liés, Portée, Questions couvertes, Autorités, Dernière vérification, Niveau de confiance |
| §8 Banc d'essai T1-T7 | ~1 100 | 7 tests de non-complaisance (population, article 52 bis, réforme vs droit, pente sans plan, « jamais inondé », usine lointaine, note de justification imposée) |
| §9 Déploiement | ~700 | 8 étapes (registre, indexation JORADP, livrables pilotes, corpus local, veille mensuelle) |

## 2. Correspondances avec l'existant (chemins réels)

| Couche pack | Équivalent ThesisFrame | Verdict |
|---|---|---|
| T1 Provenance (obligatoire pour tout livrable) | **Cycle 12 sceau-provenance-savoirs** : `KNOWLEDGE_CORE_VERSION`, stamp par génération, bloc `src/components/knowledge-stamp-block.tsx`, « saisie manuelle » | **Déjà livré** — le pack demande exactement ce mécanisme |
| C4 Corpus local (documents, provenance, confidentialité) | `CustomBookSkill` (`prisma/schema.prisma` l.319-332 : title, author, content, tags, description, source, enabled opt-in) ; injection budgetée `src/lib/ai/book-skills.ts` (12 000/1 500 car.) | **Déjà livré** (58 ressources) |
| C0/C2 Doctrine + méthodes → prompt d'agent | Mécanisme **27 spécialisations** : `src/data/ai-writing-modes.ts` (métadonnées) + `src/lib/ai/specializations/index.ts` (SPECIALIZATION_PROMPTS, l.70+) | **Mécanisme existant** — le pack est un candidat naturel à de nouveaux modes |
| T2 Évaluation / banc d'essai | Pratique SDD (vitest + recette navigateur + preuves) | Transposable en tests d'évals du mode |
| Bloc de traçabilité + « avis technique non opposable » | Stamp sous l'aperçu (cycle 12) + disclaimers à ajouter | À compléter (1 ligne d'UI) |
| Intégrité citations (« JAMAIS source de citations » book-skills) | Règle 1-2 VÉRITÉ/SOURCE du pack | Même famille, compatible |

## 3. Gaps (ce qui n'existe pas)

1. **Registre juridique structuré** (§7) : `CustomBookSkill.source` est une chaîne libre ; aucun champ JORADP/statut/dernière vérification/niveau de confiance. → nécessiterait un modèle Prisma dédié (`LegalRef`).
2. **Vérification JORADP / veille juridique** (§9 ét. 3 et 8) : nos connecteurs veille = HAL, arXiv, theses-en-ligne (lignes rouges — ne pas toucher). Pas d'API JORADP publique stable connue ; scraping = fragilité.
3. **Modes métier M1-M7** : les 27 modes actuels sont académiques génériques ; aucun spécialisé urbanisme DZ.
4. **Non-complaisance durcie** (T7 : refuser de justifier une décision déjà arrêtée) : absente des prompts actuels.

## 4. Contraintes non négociables

- **Budget full core 21 794/22 000 tok (marge ~206)** : aucune ingestion dans KNOWLEDGE_CORE. Le pack passera exclusivement par un canal dédié (prompt de spécialisation ou book-skills).
- **Budget book-skills contenu 12 000 car.** : le pack complet (18 761) ne tient pas en intégral ; l'instruction système seule (4 837) tient ; §3+§4 (6 350) tiendraient mais monopoliseraient le budget contre les 58 ressources.
- **Périmètre produit** : ThesisFrame est un outil de thèse ; le propriétaire travaille précisément sur une thèse urbanisme/TIC/IA (`upload/prompt-production-these-urbanisme-tic-ia.md`, thèse « Urbanisme durable » active) — la pertinence d'usage est réelle, pas hypothétique.

## 5. Options (chiffrées)

### Option A — Mode spécialisé « expertise urbaine DZ » [RECOMMANDÉE, ~1 cycle]
- 1 à 3 entrées dans `WRITING_MODES` + prompts dans `SPECIALIZATION_PROMPTS` : instruction système §2 (4 837 car. ≈ 1 300 tok, dans un prompt dédié hors noyau) + gabarits §5/§6 pour les modes conformité/diagnostic.
- Mention « Avis technique non opposable — vérifier au JORADP » portée par le prompt + l'UI.
- Banc d'essai T1-T7 en tests vitest (évals de prompt : distinguer réforme annoncée/droit applicable, refus de conclusion sans POS/PDAU, non-complaisance).
- Zéro migration, zéro ligne rouge, zéro noyau. Réversible.

### Option B — A + registre juridique structuré (~2-3 cycles)
- Modèle `LegalRef` (11 champs §7) + UI gestion + alimentation initiale manuelle des ~36 textes §3+§4 + injection sélective réutilisant la mécanique book-skills (sélection par domaine/questions, plafond, index/intégral) + extension du sceau (les refs injectées apparaissent dans la provenance).

### Option C — A + B + connecteur veille JORADP (4+ cycles)
- Faisabilité incertaine (pas d'API publique stable ; scraping fragile). À étudier dans un cycle séparé dédié au connecteur, jamais en annexe d'un autre cycle.

## 6. Recommandation

**Option A en premier** (1 cycle SDD complet : spec → plan → tâches → implémentation → recette), puis B si l'usage réel le justifie, C en veilleuse. Points d'attention transverses quel que soit le choix : fidélité des règles dures au prompt (TROIS REGISTRES, NON-COMPLAISANCE, DROIT EN PROJET), disclaimer non-opposabilité visible, aucune donnée personnelle (règle 11, cohérente avec la confidentialité locale de ThesisFrame).
