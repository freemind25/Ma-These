# Compétences livres vivantes — injection de la base utilisateur dans les prompts IA

## Problème

Observé sur le dépôt (vérifié, pas supposé) :

1. La bibliothèque « Livres & compétences » permet de stocker des savoirs (titre, auteur, contenu, tags) mais **ce contenu n'atteint jamais l'IA** : aucune génération (brouillon de chapitre, assistant d'écriture) ne le lit. La base est une bibliothèque de consultation humaine sans aucun effet sur l'assistance IA — une compétence morte.
2. Il n'existe **aucune interface de création ni d'édition** : l'onglet Bibliothèque ne permet que de consulter (œil) et supprimer (poubelle). Une ressource ne peut être ajoutée que par appel API direct.
3. Il n'existe ni champ d'usage (« quand ce savoir s'applique »), ni provenance, ni contrôle par ressource de ce que l'IA peut mobiliser.
4. Anomalie d'affichage observée : le nombre de mots d'une ressource s'affiche **négatif** (ex. « −1001 mots » pour une ressource de 5 000 caractères) — un caractère parasite précède le calcul.

Comparaison d'écosystème (skills.sh / find-skills, Vercel) ayant déclenché le cycle : un savoir qui n'est jamais chargé ne sert à rien ; une description d'usage explicite décide quand le charger ; le contenu intégral ne se charge que dans une économie de contexte maîtrisée.

## Utilisateur concerné

Doctorant (propriétaire de la thèse).

## Comportement attendu

**US-1 — Renseigner l'usage et la provenance d'une compétence.** En tant que doctorant, je veux créer et éditer une ressource avec une description d'usage et une provenance, afin de dire à l'IA et à moi-même quand ce savoir s'applique et d'où il vient.

- CA-1.1 Étant donné l'onglet Bibliothèque, quand je crée une ressource (titre + contenu obligatoires ; description, provenance, tags optionnels), alors elle apparaît dans la liste avec ces informations.
- CA-1.2 Étant donné une ressource existante, quand je l'édite (tous champs), alors les modifications survivent à un rechargement de la vue.
- CA-1.3 La suppression existante continue de fonctionner après confirmation.

**US-2 — Contrôler l'injection IA ressource par ressource.** En tant que doctorant, je veux un interrupteur « utilisée par l'IA » par ressource, afin de décider explicitement ce que l'IA peut mobiliser.

- CA-2.1 Étant donné une ressource nouvellement créée, alors l'interrupteur est **désactivé par défaut** : aucune ressource n'entre dans l'IA sans décision explicite.
- CA-2.2 Étant donné une ressource activée, un indicateur visible (« Injectée ») apparaît sur sa carte ; désactivée, l'indicateur « Hors IA » apparaît.
- CA-2.3 Étant donné l'interrupteur basculé, quand je recharge la vue, alors l'état activé/désactivé est conservé.

**US-3 — L'IA mobilise les compétences actives.** En tant que doctorant, quand je génère du contenu (brouillon de chapitre, assistant d'écriture), l'IA reçoit un index léger des ressources actives et le contenu intégral d'une sélection tenue dans un budget fixe.

- CA-3.1 Étant donné **0 ressource active**, quand je génère, alors le prompt envoyé à l'IA est strictement identique à l'actuel (aucune section ajoutée) — non-régression byte-identique.
- CA-3.2 Étant donné ≥ 1 ressource active, quand je génère un brouillon de chapitre ou un texte via l'assistant d'écriture, alors le prompt système contient une section « COMPÉTENCES LIVRES » listant l'index (titre, description d'usage, tags) et le contenu intégral des ressources sélectionnées.
- CA-3.3 Étant donné des ressources actives dont le contenu cumulé dépasse le budget d'injection, alors la sélection s'arrête au moment où le budget serait dépassé ; les ressources non retenues restent visibles dans l'index avec la mention « contenu non injecté (budget) ».
- CA-3.4 Étant donné des ressources désactivées, elles n'apparaissent ni dans l'index ni dans le contenu injecté.
- CA-3.5 La section instruit l'IA de mobiliser ces savoirs comme **appui rédactionnel et méthodologique** et de ne **jamais les citer comme sources bibliographiques** (aucune citation autorisée par ce canal).
- CA-3.6 La reprise sur troncature d'un brouillon (prompt de continuation) n'embarque pas les compétences livres.

**US-4 — Affichage fiable.** En tant que doctorant, je veux un nombre de mots correct sur les cartes de ressources.

- CA-4.1 Étant donné une ressource de N caractères, la carte affiche un nombre de mots entier positif cohérent avec N/5.

## Hors périmètre

- Stamp de version des savoirs dans les métadonnées de génération (Sceau de vérité) — reporté : chantier transverse à tous les flux de génération, à spécifier séparément.
- Injection dans les flux d'analyse (vérification de cohérence, chat directeur, vérification publication) — le socle méthodologique de ces flux est déjà servi par le noyau de connaissance.
- Marketplace, import externe automatisé, recommandation par popularité — contraires à la revue humaine préalable.
- Recherche sémantique de sélection des ressources (une sélection déterministe simple suffit pour cette itération).

## Zones floues — tranchées sous délégation (révisables à la recette)

Le propriétaire étant injoignable (problème de connexion) a délégué l'exécution complète : « vous êtes le spécialiste, faites pour le mieux… terminez toutes les actions avant de revenir pour moi pour avis » (IM, session du jour). Conformément au précédent `veille-academique`, les choix suivants sont pris **au plus conservateur, dérivés du texte même de la spec**, et restent modifiables à la recette :

1. **Opt-in strict par défaut** (CA-2.1) — rien n'entre dans l'IA sans action explicite du propriétaire ; les ressources déjà existantes restent hors IA jusqu'à activation manuelle.
2. **Sélection déterministe, sans IA de sélection** — les ressources actives sont classées de la plus récemment mise à jour à la plus ancienne, et le contenu est injecté dans cet ordre jusqu'au plafond. Prévisible, testable, sans coût de token supplémentaire de sélection.
3. **Budget d'injection fixé au plan et prouvé** — plafond dur en caractères (index et contenu), mentionné dans chaque preuve d'injection.
4. **Les compétences livres ne sont jamais une source de citations** (CA-3.5) — elles appuient la rédaction mais ne rejoignent pas la bibliographie autorisée ; règle cohérente avec la discipline de citation existante.
5. **Périmètre d'injection v1** — brouillon de chapitre + assistant d'écriture (flux génératifs principaux). Les flux d'analyse restent au noyau de connaissance.
