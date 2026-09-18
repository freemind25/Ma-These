# Veille académique — déclenchement automatique des vérifications via la file de tâches

## Problème

Les vérifications de veille sont 100 % manuelles (bouton « Vérifier » par veille — décision n°3 de `specs/veille-academique/spec.md` l.42 ; hors périmètre l.34 « périodique ou à l'ouverture — itération ultérieure »). Conséquence observée : si le doctorant n'ouvre pas l'application ou ne pense pas à cliquer, les compteurs de nouveautés ne reflètent pas l'état réel des sources — la veille ne « veille » pas vraiment. L'application dispose déjà d'une file de tâches persistante avec worker intégré au serveur (`src/lib/jobs/worker.ts`, démarré par `src/instrumentation.ts`) : c'est le mécanisme naturel d'un déclenchement automatique, sans processus externe.

## Utilisateur concerné

Doctorant (rôle principal — la veille est sa fonctionnalité).

## Comportement attendu

US-1 — En tant que doctorant, je veux **activer la vérification automatique** d'une veille, afin que ses compteurs de nouveautés restent à jour sans action de ma part.
  CA-1.1 Chaque veille de la liste propose un réglage de vérification automatique, désactivé par défaut.
  CA-1.2 Étant donné le réglage activé, quand je recharge la liste (ou l'application), alors l'état activé est conservé.
  CA-1.3 Étant donné une veille en vérification automatique, quand l'intervalle planifié est écoulé depuis sa dernière vérification, alors une vérification est déclenchée automatiquement — preuve observable : la date « dernière vérification » se rafraîchit sans clic.

US-2 — En tant que doctorant, je veux qu'une **vérification automatique se comporte exactement comme une manuelle**, afin de ne pas apprendre deux sémantiques.
  CA-2.1 Une vérification automatique applique les mêmes règles que la manuelle : premier relevé = base de référence sans « nouveau » ; relevés suivants = inconnus marqués « nouveau » ; rétention fenêtre 200 ; horodatage de la dernière vérification.
  CA-2.2 Étant donné une veille dont une vérification est déjà en attente ou en cours dans la file, alors aucune seconde vérification n'est empilée pour la même veille pendant ce temps.
  CA-2.3 Étant donné une source injoignable lors d'une vérification automatique, alors l'échec est enregistré dans la file de tâches (statut consultable) et la veille conserve son état antérieur (compteur et horodatage intacts), sans perturber les autres veilles ni l'application.

## Hors périmètre (cette itération)

- Fréquence configurable (par veille ou globale) — intervalle fixe, constant du code.
- Notifications externes (e-mail, push) — toujours hors périmètre ; le signal reste le compteur non-vus dans l'application.
- Relances automatiques en cascade après échec (retry dédié) — l'échéance suivante retente naturellement.
- Déclenchement « à l'ouverture de l'application » — variante non retenue (la périodicité couvre le besoin sans rafale au démarrage).
- Réglage auto dans la vue détail — le réglage vit dans la liste.

## Décisions de clarification (conservatrices, modifiables à la recette)

Mandat du propriétaire : « go pour les deux propositions » (2026-09-18). Micro-décisions tranchées par le choix le plus conservateur :

1. **Opt-in par veille** : champ de réglage désactivé par défaut — aucune requête vers HAL/arXiv sans consentement explicite (quotas externes préservés).
2. **Intervalle fixe 6 heures** : constante du code, non configurable cette itération — cadence raisonnable pour des publications académiques, exposition limitée aux quotas.
3. **Premier relevé automatique autorisé** : une veille jamais vérifiée mais activée en auto déclenchera son premier relevé (base de référence, aucun « nouveau » — même règle CA-2.1 de la spec d'origine).
4. **Anti-empilement** : au plus un job de vérification en attente/en cours par veille.
5. **Échec sans retry dédié** : échec consigné dans la file, veille intacte, prochaine échéance retentera.
