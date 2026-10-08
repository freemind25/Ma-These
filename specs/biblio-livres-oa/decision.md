# Décision — point d'arrêt « livres OA » (DOAB + OpenEdition Books)

Date : 2026-10-08 · Décision prise par délégation du propriétaire (IM « prenez la
décision concernant le point 4 et 5 », 2026-10-08) · Statut : **point d'arrêt CLOS**

## 1. Faits mesurés (2026-10-08, curl direct)

| Test | Résultat |
|---|---|
| `GET directory.doabooks.org/server/api/discover/search/objects?query=…` | **HTTP 404** (page HTML d'erreur) |
| `POST …/discover/search/objects` | **HTTP 404** |
| Ancienne API `GET /rest/search?query=…` | **HTTP 403** |
| `GET /server/api` (découverte) | **HTTP 404** |
| OAI-PMH `GET /oai/request?verb=Identify` | **HTTP 200** — protocole de récolte (ListRecords), **aucune capacité de recherche par requête** |

Conclusion factuelle : **DOAB n'expose pas d'API de recherche exploitable** depuis
l'application (REST fermée/404 ; OAI-PMH = moissonnage intégral, sans requête).
OpenEdition Books : pas d'API de recherche ouverte simple, et son contenu est
partiellement agrégé dans l'index DOAB.

## 2. Décision

**Option retenue : non-intégration de DOAB et d'OpenEdition Books comme sources
dédiées** — motifs :

1. **Pas d'API de recherche** : une intégration exigerait un moissonnage local
   (OAI-PMH) avec stockage/indexation côté app — coût et maintenance injustifiés
   pour un besoin non démontré en recette réelle.
2. **Couverture déjà assurée** : OpenAlex (intégrée, clé premium active depuis
   2026-10-08) indexe les livres et chapitres — le client `searchWorks` de
   `src/lib/research/openalex.ts` supporte nativement le filtre
   `type:book,book-chapter` (paramètre `filter` du contrat `OpenAlexSearchParams`).
   La recherche de livres OA est donc disponible **sans nouvelle source**.
3. **Discipline d'ingénierie** (précédent academictorrents, option A) : chaque
   source intégrée = coût permanent (maintenance, quotas, UI) justifié seulement
   par un manque démontré.

## 3. Réversibilité

Nouveau cycle d'étude si : (a) DOAB rouvre une API de recherche REST publique, ou
(b) une recette réelle démontre un trou de couverture francophone SHS non couvert
par OpenAlex. Extension sans nouvelle source possible à tout moment : ajouter le
filtre `type:book` aux appels `searchWorks` existants.
