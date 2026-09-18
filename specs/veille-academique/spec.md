# Veille académique — alertes sur requêtes sauvegardées

## Problème

Le doctorant relance régulièrement les mêmes recherches (catalogues académiques déjà intégrés à l'application) pour suivre les publications nouvelles de son champ. Aujourd'hui il doit : (1) se souvenir de ses requêtes de veille, (2) les ressaisir à chaque fois, (3) se rappeler mentalement quels résultats il a déjà vus. Rien ne lui signale qu'une publication nouvelle correspondant à sa veille est apparue. C'est la continuation directe des capacités de recherche récemment livrées et stabilisées (recherche thèses en ligne testée et épinglée par non-régression ; recherche arXiv intégrée).

## Utilisateur concerné

Doctorant (rôle principal — usage quotidien). Directeur de thèse : lecture possible des veilles partagées (secondaire, à confirmer au clarification).

## Comportement attendu

US-1 — En tant que doctorant, je veux **suivre une recherche** (l'enregistrer comme veille), afin de ne plus la ressaisir à chaque session.
  CA-1.1 Étant donné une recherche exécutée avec ses filtres, quand j'active « suivre cette recherche », alors elle apparaît dans ma liste de veilles avec un libellé éditable.
  CA-1.2 Étant donné une veille existante, quand je la supprime, alors elle disparaît de la liste et aucune de ses données résiduelles n'est présentée comme veille.
  CA-1.3 La liste de veilles est vide au premier usage, avec un état vide explicite invitant à créer la première depuis une recherche.

US-2 — En tant que doctorant, je veux **vérifier les nouveautés** d'une veille, afin de voir uniquement ce qui est apparu depuis la dernière vérification.
  CA-2.1 Étant donné une veille jamais vérifiée, quand je la vérifie, alors tous ses résultats actuels sont enregistrés comme base de référence et aucun n'est marqué « nouveau ».
  CA-2.2 Étant donné une veille déjà vérifiée, quand je la vérifie à nouveau, alors les résultats absents de la vérification précédente sont marqués « nouveau » et les autres ne le sont pas.
  CA-2.3 Étant donné une vérification sans aucun nouveau résultat, quand elle se termine, alors un état vide explicite (« aucun nouveau résultat depuis le … ») s'affiche.
  CA-2.4 La date et l'heure de la dernière vérification sont visibles pour chaque veille.

US-3 — En tant que doctorant, je veux **ne plus être dérangé par l'ancien**, afin que seul le neuf ressorte à chaque vérification.
  CA-3.1 Étant donné des résultats marqués « nouveau », quand je les consulte / marque comme vus, alors ils ne réapparaissent plus comme nouveaux aux vérifications suivantes.
  CA-3.2 Le nombre de nouveautés non consultées est visible par veille dans la liste (compteur).

## Hors périmètre (cette itération)

- Notifications externes (e-mail, push, webhooks) — tout reste dans l'application.
- Résumés ou analyses IA des nouveautés.
- Partage multi-utilisateurs des veilles (sauf décision contraire au clarification).
- Import/export des veilles.

## Zones floues

[À CLARIFIER] Sources couvertes : HAL seulement, HAL + arXiv, ou toute source de recherche déjà intégrée au catalogue de l'application ?
[À CLARIFIER] Marquage « vu » : par résultat individuel, ou global par veille (tout ce qui est présenté lors d'une vérification devient vu d'un coup) ?
[À CLARIFIER] Une vérification automatique (ex. déclenchée à l'ouverture de l'application, ou périodique en tâche de fond) est-elle souhaitée dès cette itération, ou le déclenchement 100 % manuel suffit-il ?
[À CLARIFIER] Rétention : combien de résultats conserver par veille (fenêtre glissante, ex. 200 derniers) pour éviter la croissance illimitée ?

---
Point d'arrêt Étape 2 : questions groupées ci-dessus, adressées au propriétaire le 2026-09-18. Aucune réponse inventée ; la spec sera mise à jour et les marqueurs retirés après réponses, puis passage à l'Étape 3 (plan, après lecture du code concerné).
