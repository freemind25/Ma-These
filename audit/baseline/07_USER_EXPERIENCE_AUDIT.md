# 07 — Audit Expérience Utilisateur (Phase 7)

**Méthode** : parcours exploratoires exécutés sans assistance dans l'interface réelle (viewport desktop 1280×720 puis mobile 390×844).

## 12.1 Compréhension et utilisabilité

| Contrôle | Résultat observé | Verdict |
|---|---|---|
| Clarté des écrans testés | Dashboard, éditeur, références, IA, exports : hiérarchie claire, libellés français cohérents, cartes et tableaux lisibles | ✅ |
| Cohérence de navigation | Sidebar catégorisée (7 catégories, compteurs), recherche de module, breadcrumb « Ma Thèse > <vue> » | ✅ |
| Indicateurs de progression | OCR : états de job visibles ; génération : stream + « Résultat » ; export : absence de feedback visuel après clic (pas de spinner/succès capté sous le bouton) | ⚠️ (feedback export) |
| Messages d'aide | Bouton « ? » header + notice 22 pages accessible | ✅ |
| Gestion des erreurs UI | Erreurs API traduites en messages métier (constat sur exports/IA) | ✅ |
| États vides | « Aucune référence » illustré ; « Aucun document indexé » avec CTA « Indexer ma thèse » | ✅ |

## 12.2 Bloqueurs et irritants découverts (parcours exploratoire réel)

1. **Blocage fonctionnel** : impossible de créer une deuxième thèse / retourner à la liste des thèses une fois une thèse ouverte (AUD-FUNC-002 ❌) — un nouvel utilisateur qui explore ne comprend pas pourquoi « Créer une thèse » ré-ouvre l'ancienne.
2. **Danger** : suppression de référence en 1 clic sans confirmation ni annulation (AUD-FUNC-003 ⚠️) — le clic test de l'auditeur a réellement supprimé l'objet, preuve que l'accident est trivial.
3. **Dérection perdue** : reload → retour dashboard forcé ; l'utilisateur re-ouvre « Éditeur » et atterrit directement dans la thèse (activeThesisId persisté) — comportement non documenté et incohérent (AUD-FUNC-004).
4. **Élément décoratif/bruit** : `\n` littéral sous la carte thèse (AUD-FUNC-001) ; badge « 2 Issues » en dev (hydratation) ; footer version faux (v1.2.0).
5. **Découvrabilité du corpus** : les 16 documents importés/OCR n'ont pas de point d'entrée évident dans les vues testées (Recherche plein texte = chapitres seulement) (AUD-UX-001).
6. **Overlay « Livrable du test de production »** : panneau flottant persistant sur toutes les vues, recouvre du contenu en desktop ET mobile (fermeture possible via ×) — artefact de test exposé en permanence (AUD-UX-002 ⚠️, à retirer ou conditionner avant production).

## 12.3 Accessibilité

| Contrôle | Résultat | Verdict |
|---|---|---|
| Sémantique HTML | Erreur de structure réelle détectée : `<div>` dans `<p>` (hydratation, stack AppSidebar) | ⚠️ AUD-HYD-001 |
| Navigation clavier | NON VÉRIFIÉ systématiquement (composants shadcn/Radix = base accessible, non auditée à l'usage) | ⚠️ NON VÉRIFIÉ |
| Contraste / focus visible | Non mesuré (audit WCAG complet hors périmètre de ce cycle) | ⚠️ NON VÉRIFIÉ |
| Responsive | Mobile 390 px : contenu fluide, sidebar superposable, pied de page présent ; panneau flottant recouvre partiellement | ✅ avec réserve AUD-UX-002 |
| Référentiel | Aucune conformité WCAG déclarée ni mesurée — niveau réel inconnu | ⚠️ |

## 12.4 Pied de page (règle sticky)

Présent sur toutes les vues testées, en bas de flux (pas de flottement constaté sur écrans courts testés) ; version affichée fausse (AUD-DOC-001).

**Synthèse Phase 7** : UX générale soignée et en français cohérent ; 1 blocage fonctionnel, 1 danger de suppression, 1 artefact de test permanent à retirer avant diffusion, accessibilité non évaluée.
