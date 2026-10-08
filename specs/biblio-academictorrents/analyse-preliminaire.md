# Analyse préliminaire — « ajouter cette bibliothèque : https://academictorrents.com »

Date : 2026-10-08 · Déclencheur : demande propriétaire (IM) · Statut : **analyse — zéro code** · Issue : POINT D'ARRÊT (décision propriétaire requise)

## 1. Demande

« ajouter cette bibliothèque : https://academictorrents.com » (IM, 2026-10-08). Même procédure que pour oceanofpdf.com (worklog `biblio-oceanofpdf-refus`) : vérification factuelle d'abord, aucun code avant décision.

## 2. Faits vérifiés (recherches web + docs officielles, résultats bruts conservés en session)

### 2.1 Nature de la plateforme — LÉGITIME

- Wikipedia : « Academic Torrents is a website which enables the sharing of research data using the BitTorrent protocol. The site was founded in November 2013 ».
- Papier pair-évalué : Cohen (Joseph Paul) & Lo (Henry Z.), « Academic Torrents: A Community-Maintained Distributed Repository », XSEDE '14 (ACM), cité 48× (semanticscholar.org, dl.acm.org).
- Papier « Academic Torrents: Scalable Data Distribution » (arXiv 1603, ADS) — utilisé notamment pour la distribution d'ImageNet.
- Site officiel : « A distributed system for sharing enormous datasets - for researchers, by researchers. Making over 419.44TB of research data available ».
- **Conclusion : plateforme académique reconnue, pas un site de piraterie** — distinction capitale d'avec oceanofpdf.com.

### 2.2 Contenu du catalogue — MIXTE (légitime + shadow libraries)

- Datasets de recherche légitimes en très grand volume (419 To annoncés).
- MAIS la plateforme référence/héberge aussi des artifacts centraux des shadow libraries :
  - « Sci-Hub SQL Database (2020-05-30) » — `academictorrents.com/details/4b13244559282f9650a382f70506dc4c516215e2` (résultat de recherche brut consigné) ;
  - collections LibGen / corpus de livres contrefaits cités dans la littérature récente (SAGE, juin 2026 : corpus « nearly 200 000 books, many of them copyrighted » issu de la shadow library Bibliotik ; torrents Anna's Archive/LibGen ~119 To, r/DataHoarder).
- de Rosnay (Westminster Papers, 2021) : « Academic Torrents provides a solution to host the papers without risking any liability for copyright infringement » — l'architecture pair-à-pair est précisément ce qui permet la diffusion sans hébergement central responsable.
- La licence d'une entrée est déclarée par l'uploader, **non vérifiable** par le consommateur.

### 2.3 API et récupération du contenu — BitTorrent obligatoire

- Docs officielles (`academictorrents.com/docs/api.html`) : endpoints `apiv2/entry` (upload d'une entrée) et `apiv2/test` — **aucun endpoint de recherche documenté** ; ancre « database access » (accès base/dump).
- Client officiel `at-python` (GitHub) : « add a hash from academictorrents.com … and download datasets into your project » — téléchargement via le tracker = BitTorrent.
- Docs `downloading.html` : recommandation `aria2c` + fichiers `.torrent` — protocole pair-à-pair, **pas de téléchargement HTTP direct général**.

## 3. Verdict technique pour ThesisFrame — intégration NON RETENUE en l'état

Trois motifs indépendants, chacun suffisant :

1. **Transport incompatible** : l'application consomme des documents en HTTP (import fichier, sources API renvoyant PDF/texte). Academic Torrents ne distribue QUE par BitTorrent — il faudrait un client pair-à-pair embarqué (ports entrants, longueurs indéterminées, disque, bande passante) : incompatible avec l'application navigateur et avec le sandbox, hors du modèle architectural (docs § 7 bis).
2. **Provenance non traçable** : le sceau de provenance (cycle sceau-provenance-savoirs, validé propriétaire 2026-10-04) exige de savoir d'où vient un document et sous quelle licence. Sur Academic Torrents, la licence déclarée n'est pas vérifiable et le catalogue mélange légitime et contrefait (Sci-Hub/LibGen) à l'échelle des entrées — l'intégration d'une recherche y achopperait sur l'exigence centrale de traçabilité.
3. **Aucun endpoint de recherche public** : l'apiv2 documentée couvre l'upload/test ; il n'existe pas d'API de recherche à consommer côté serveur.

## 4. Distinction consignée d'avec oceanofpdf.com (2026-10-08)

- oceanofpdf : **site de piraterie** (constaté) → refus de principe.
- academictorrents : **plateforme légitime** → le refus d'intégration n'est PAS un verdict sur la plateforme ; c'est une **inadéquation d'usage** (transport BitTorrent, absence d'API de recherche) + l'**exigence de traçabilité** que le catalogue mixte ne permet pas de satisfaire pour une source de documents de thèse.
- Cohérence avec la position propriétaire consignée (recette n° 2) : aucune restriction technique sur les documents déjà détenus ; l'intégration d'une source, elle, reste un choix d'ingénierie documenté.
- Le contenu ouvert légitime d'Academic Torrents (dumps arXiv, PubMed Central OA, datasets) est déjà couvert par les sources intégrées : theses.fr, arXiv, CORE, OpenAlex (+ DOAJ côté journaux) ; les livres OA par DOAB/OpenEdition (point d'arrêt en cours).

## 5. Options soumises au point d'arrêt

- **A (recommandée) — Non-intégration, consignée** : les besoins légitimes correspondants sont couverts par les sources existantes ; zéro code.
- **B — Intégration « métadonnées + lien sortant »** : sans objet en l'état (pas d'API de recherche) et pointerait vers des magnets de légalité mixte → non recommandée.
- **C — Usage manuel hors application** (si le besoin réel est un grand dataset de recherche, pas un document de thèse) : `at-python`/aria2c sur la machine du propriétaire — hors périmètre de ThesisFrame, non développé.

## 6. Point d'arrêt

Décision propriétaire attendue : **A** (recommandée), B, C, ou instruction contraire. Aucun code, aucune spec d'implémentation tant que la décision n'est pas rendue.
