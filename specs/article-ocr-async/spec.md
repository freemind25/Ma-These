# OCR des pages scannées + exécution asynchrone (article scientifique)

Spec du cycle d'implémentation — reprend la proposition validée par le propriétaire (« lancez », IM, en réponse au point d'arrêt de `etude.md` § 7, Décision 1). Option 1 de l'étude : OCR serveur pure JS, exécution asynchrone via la file de tâches existante.

## Problème

Les PDF de mémoires/thèses scannés (pages images, sans couche texte) sont aujourd'hui importés avec leurs pages scannées **ignorées** : la limite honnête affiche « L'OCR n'est pas disponible dans cette itération ». Un PDF entièrement scanné est même refusé à l'import. Le doctorant doit retaper le texte à la main — exactement ce que l'outil devait éviter. Par ailleurs, l'OCR est une opération longue (plusieurs secondes par page) : elle ne doit pas bloquer une requête HTTP ni mourir avec le processus (motif qui a motivé la file de tâches persistante).

## Utilisateur concerné

Doctorant (seul rôle concerné — l'import et le wizard article sont son périmètre).

## Comportement attendu

**Prérequis de faisabilité (conséquence directe de US-1)** : un PDF **entièrement scanné** doit pouvoir être importé (texte quasi vide + marqueur « scanné » + limites honnêtes), au lieu d'être rejeté — sinon aucun OCR ne serait jamais lançable sur ces documents. Le rejet 422 reste valable pour les documents non scannés sans texte exploitable.

**US-1** — En tant que doctorant, je veux lancer un OCR sur les pages d'un PDF importé reconnues sans texte, en choisissant la langue (français / anglais / arabe), afin d'exploiter un mémoire scanné sans le retaper.
- CA-1.1 Étant donné un PDF importé avec pages détectées « scannées », quand je clique « Lancer l'OCR » (langue au choix), alors un job est créé (statut visible pending → running → done/failed) et l'UI affiche la progression par page.
- CA-1.2 Étant donné un job OCR terminé, alors le texte obtenu est inséré dans le document importé dans un **bloc distinct et marqué** (« texte OCR — relecture requise »), avec la confiance moyenne rapportée, sans écraser le texte existant.
- CA-1.3 Étant donné un texte OCR produit, alors la limite « scanned » est mise à jour (pages résolues / restantes) et la traçabilité par section peut le citer comme source avec mention OCR.
- CA-1.4 Étant donné n'importe quel contenu OCR, il est traité **exclusivement comme données** (même règle anti-injection que le document importé) — jamais comme instructions pour les prompts.
- CA-1.5 Étant donné une exécution OCR, le worker traite **1 page à la fois** et libère le moteur entre les pages ; un plafond de pages par job (défaut : 30, configurable) est appliqué et annoncé ; un seul job OCR actif à la fois (garde anti-empilement).
- CA-1.6 Étant donné une machine hors ligne, l'OCR fonctionne : les données de langue (fra, eng, ara) sont embarquées localement, aucun téléchargement à l'exécution.
- CA-1.7 Étant donné un job OCR, il reprend après redémarrage du serveur (comportement existant de la file) ou échoue avec message lisible.

## Hors périmètre

Correction automatique du texte OCR ; OCR de PDF vectoriels (inutile — texte déjà extractible) ; interfaces de retouche d'image ; détection de langue automatique (langue choisie à l'UI) ; traduction du texte OCR dans le même job ; emballage Tauri des données de langue (mesuré ici, packaging dans le cycle build-desktop).

## Zones floues

Aucune — la décision propriétaire (« lancez ») clôt le point d'arrêt de `etude.md` § 7 (option 1 recommandée, spec § 5 validée telle quelle).
