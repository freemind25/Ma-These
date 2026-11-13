# Paper2Code — import PDF de l'article source

## Problème

Dans le module « Article → Code » (`src/modules/paper2code/paper2code-page.tsx`), la carte
« Article source » (CardDescription l.216) exige du chercheur qu'il colle manuellement le
texte complet d'un article : « Collez le texte complet d'un article (methodologie,
experiences, hyperparametres). » Un article scientifique fait typiquement 30 000–80 000
caractères : le copier-coller depuis un PDF est fastidieux, source d'erreurs (troncature,
perte de mise en forme, oublis de sections) et peu professionnel. Un import direct du
fichier PDF est le geste naturel.

## Utilisateur concerné

Doctorant (unique utilisateur de ce module).

## Comportement attendu

US-1 — En tant que doctorant, je veux importer un fichier PDF d'article dans « Article →
Code », afin de remplir le champ source sans copier-coller manuel.
  CA-1.1 Étant donné la carte « Article source », quand je glisse-dépose un PDF (ou que je
         clique sur la zone et choisis un fichier), alors le texte extrait remplit le champ
         « Texte de l'article » et le compteur de caractères s'actualise.
  CA-1.2 Étant donné un PDF valide contenant du texte, quand l'import réussit, alors le nom
         du fichier et le nombre de pages sont affichés, et un toast confirme l'extraction.
  CA-1.3 Étant donné un PDF dont certaines pages sont sans texte extractible (scanné),
         quand l'import réussit, alors un avertissement visible liste les pages vides et
         recommande le collage manuel ou un PDF textuel — sans bloquer l'import.
  CA-1.4 Étant donné un fichier non-PDF (extension ou contenu), quand j'essaie de
         l'importer, alors une erreur explicite est affichée (toast + message) et le champ
         reste inchangé.
  CA-1.5 Étant donné un PDF > 50 Mo, quand j'essaie de l'importer, alors une erreur 413
         lisible s'affiche (pré-contrôle, sans parsing).
  CA-1.6 Étant donné le champ rempli par import, quand je clique « Generer le code »,
         alors la génération utilise ce texte (comportement identique au collage).
  CA-1.7 Le collage manuel reste possible et inchangé.

## Hors périmètre

- Aucune persistance : le texte extrait n'est pas enregistré en base (flux éphémère,
  cohérent avec l'existant — le collage non plus n'est pas persisté).
- Pas d'OCR (l'OCR async existe pour les sources de mémoire, hors périmètre ici).
- Pas d'import DOCX/TXT dans ce module (demande explicite : PDF).
- Aucune modification de la pipeline de génération `/api/paper2code/generate`.

## Zones floues

Aucune — la demande du propriétaire (« un simple import du fichier au format pdf ») fixe
le format unique PDF ; les garde-fous réutilisent les règles de la maison
(`src/lib/articles/extraction.ts`) : 50 Mo, magic bytes, détection scanné.
