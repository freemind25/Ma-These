# Module PUBLICATION — Source distillée

**Sources :** Gastel & Day, How to Write and Publish a Scientific Paper (9e éd., 2022) — 6 fiches de `src/data/corpus-publication.ts` + 4 checks de `src/app/api/verification-publication/route.ts`

---

## 1. CYCLE DE PUBLICATION DU DOCTORANT

### Quand publier pendant la thèse

- SI le doctorant est en année 1-2 (phase exploratoire) → prioriser la rédaction des chapitres de la thèse ; ne pas soumettre d'articles hâtifs qui manquent de maturité
- SI un chapitre de résultats contient un finding original, autonome et statistiquement solide → ce chapitre est un candidat pour extraction en article
- SI le doctorant est en thèse par articles → chaque chapitre doit correspondre à un article soumis ou accepté, avec un chapitre de synthèse additionnel
- SI la thèse est traditionnelle (chapitres thématiques) → extraire 1-2 articles des résultats les plus significatifs après soutenance ou en fin de rédaction

### Articulation thèse ↔ articles

- SI plusieurs chapitres exploitent un même jeu de données → un seul article (règle anti-salami) — les comités de lecture évaluent le contenu, pas le nombre
- SI les résultats forment un ensemble cohérent couvrant un sous-thème → un article de synthèse est envisageable (nécessite au moins 2 chapitres publiés comme base)
- SI l'article est soumis avant la soutenance → le chapitre de thèse correspondant doit être compatible (pas de contradiction entre les versions)
- SI l'article est accepté avec révisions majeures → intégrer les révisions dans le chapitre de thèse pour maintenir la cohérence
- SI un article est publié → le chapitre de thèse correspondant doit le mentionner et peut s'appuyer dessus sans paraphrase excessive

---

## 2. CHOIX DE REVUE

### Critères de décision

- SI la revue cible est choisie AVANT la rédaction → le manuscrit sera calibré dès le départ (format, longueur, style), réduisant les révisions post-rédaction
- SI les travaux de référence du sous-champ sont régulièrement publiés dans cette revue → bon indicateur d'adéquation de scope et de lectorat
- SI la revue est indexée dans Scopus, Web of Science ou DOAJ → signal positif de légitimité (non suffisant seul)
- SI la revue n'est indexée dans aucune base reconnue → signal négatif à investiguer
- SI APC (frais de publication) > budget disponible → contacter la revue pour demander une exonération (waiver) AVANT soumission
- SI la revue est très récente (< 2 ans) et non adossée à une société savante ou institution reconnue → vérifier la légitimité avec attention
- SI le facteur d'impact est utilisé comme critère principal → DORA s'y oppose : évaluer sur le contenu, l'adéquation au champ et la qualité éditoriale, pas sur un seul chiffre

### Signaux de revue prédatrice (5 signaux de détection)

1. SI la revue garantit la publication en quelques jours, quel que soit le contenu → alerte prédatrice
2. SI le site web de la revue est truffé de fautes typographiques ou d'incohérences visuelles → alerte
3. SI la revue présente une métrique d'impact propriétaire non reconnue par la communauté scientifique → alerte
4. SI absence d'articles de qualité vérifiable, voire absence totale d'articles publiés → alerte
5. SI sollicitations agressives et non ciblées par e-mail (spam de soumission) → alerte

### Signaux de légitimité

- SI la revue est référencée dans les bibliothèques universitaires → signal positif
- SI des articles de qualité connus du chercheur y sont publiés → signal positif
- SI la revue est adossée à une société savante reconnue → signal positif

---

## 3. ÉTHIQUE DE PUBLICATION

### Paraphrase suffisante : critères opérationnels

- SI la structure de phrase est identique à la source avec seulement quelques mots remplacés par des synonymes → paraphrase INSUFFISANTE (c'est du plagiat déguisé)
- SI le paragraphe est rédigé sans consulter la source, puis vérifié pour exactitude après coup → méthode valide de paraphase
- SI la méthodologie est standard et partagée entre publications d'un même auteur → similarité de formulation acceptable (seul cas légitime de similarité élevée)
- SI doute sur la nécessité de guillemets pour une reprise littérale → en mettre (mieux vaut sur-citer que sous-citer)
- SI un logiciel de détection de similarité est disponible → l'utiliser en amont de la soumission

### Cas limite — citation littérale avec guillemets

- SI citation littérale entre guillemets + source complète citée (auteur, année, page) → PERMIS, mais exceptionnel
- Règle de dosage : la norme académique est la paraphrase ; la citation directe se réserve aux définitions, formulations canoniques, ou énoncés que la paraphrase dénaturerait
- SI reprise de formulation sans guillemets, même avec source citée → plagiat de paraphrase insuffisante
- En cas de doute sur la nécessité d'une citation littérale : privilégier la paraphrase + référence, ou demander au directeur — SI le texte repris est la formulation de référence du concept, la citation littérale est justifiée

### Plagiat, auto-plagiat, salami science : définitions opérationnelles

- SI un même résultat est présenté comme nouveau dans deux publications distinctes → auto-plagiat
- SI un même travail est découpé artificiellement en plusieurs publications minimales → salami science
  - Signal de détection : SI les articles partagent la même méthode, les mêmes données et ne diffèrent que par un sous-ensemble de résultats → salami probable
- SI un manuscrit est soumis simultanément à deux revues ou plus → non éthique
- SI des données sont inventées (dry-labbing) → faute sans degré, aucune tolérance
- SI des points aberrants sont omis sans le signaler dans le texte → non éthique
- SI des figures accentuent artificiellement les résultats (axes tronqués, échelles manipulées) → non éthique

### Authorship : critères de contribution (ICMJE)

Pour figurer comme auteur, les 4 critères suivants doivent être TOUS remplis :
1. Contribution substantielle à la conception, l'acquisition de données, l'analyse OU l'interprétation
2. Rédaction de l'article ou révision critique pour le contenu intellectuel important
3. Approbation finale de la version à publier
4. Accord d'être responsable de tous les aspects du travail (intégrité, exactitude)

- SI une personne ne remplit pas les 4 critères → ne pas la lister comme auteur (remerciements si contribution réelle)
- SI une personne est listée comme auteur sans contribution réelle → auteur fantôme (ghost authorship, non éthique)

### Déclarations de conformité éthique

- SI la recherche implique des sujets humains ou animaux → déclaration d'approbation du comité d'éthique obligatoire dans la section Méthodologie
- SI un conflit d'intérêts potentiel existe (financier, conseil, propriété intellectuelle) → déclaration explicite obligatoire
- SI aucun conflit d'intérêts → déclarer explicitement « Les auteurs déclarent n'avoir aucun conflit d'intérêts. »

---

## 4. VÉRIFICATION DU MANUSCRIT AVANT SOUMISSION

### Cohérence introduction ↔ discussion

Principe : l'introduction pose des questions ; la discussion doit y répondre.

- SI l'introduction pose N questions/hypothèses → la discussion doit répondre explicitement aux N
  - Méthode de détection : lister chaque question de l'intro, vérifier une à une la présence d'une réponse dans la discussion
- SI un résultat discuté n'est relié à aucune question de l'introduction → résultat orphelin (signal d'incohérence structurelle)
- SI une question de l'introduction n'est pas traitée dans la discussion → lacune à combler
- SI la discussion ne suit pas un entonnoir inversé (résultats spécifiques → mise en relation avec travaux antérieurs → implications → limites → questions ouvertes) → structure à revoir

### Redondance texte ↔ tableaux/figures

- SI le texte énumère chaque valeur numérique déjà présente dans le tableau → redondance (supprimer les valeurs du texte, garder un renvoi au tableau)
  - Exemple à éviter : « Le Tableau 1 montre que X = 28,8 %, Y = 15,3 % et Z = 56,0 % »
  - Préférer : « X a inhibé Y (Tableau 1). »
- SI le texte interprète une tendance visible dans le tableau ou la figure → acceptable (apporte une lecture que le tableau seul ne donne pas)
- SI le texte dit « comme le montre le Tableau X » ou équivalent → renvoi normal, pas redondance
- SI le tableau peut être reformulé en une phrase sans perte d'information → supprimer le tableau, garder la phrase

### Qualité des tableaux : signaux de tableau inutile

- SI une colonne contient > 70 % de valeurs identiques ou de zéros → cette colonne peut être résumée en une phrase
- SI > 70 % des cellules contiennent des symboles binaires (+/−, +/-) → le tableau apporte peu d'information quantitative
- SI le tableau présente uniquement des résultats non significatifs → le tableau crédibilise mal le document (vérifier que ces résultats sont justifiés dans le texte)
- SI le tableau ne croise pas plusieurs variables ou conditions → vérifier qu'une phrase ne suffit pas

### Structure IMRAD : erreurs fréquentes par section

**Introduction :**
- SI le vide comblé (research gap) n'est pas explicité → l'article manque d'orientation
- SI l'objectif n'est pas formulé clairement → le lecteur ne sait pas ce que l'étude vise à démontrer

**Méthode :**
- SI la méthode ne permettrait pas la réplication par un pair → incomplète (manque de détails sur les instruments, procédures ou analyses)

**Résultats :**
- SI des résultats sont présentés mais ne sont pas discutés dans la section Discussion → résultats orphelins (transférer vers la discussion ou supprimer)
- SI un niveau de précision trompeur est rapporté (ex. « 28,8136 % » pour 17/59 cas) → adapter la précision à la taille réelle de l'échantillon
- SI seuls les résultats positifs sont rapportés et les non-effets omis → biais de reporting

**Discussion :**
- SI la discussion utilise des formulations vagues ou alambiquées (« camouflage à l'encre de seiche ») pour masquer un doute → manquer de transparence ; les relecteurs le remarqueront
- SI les limites de l'étude ne sont pas nommées et leur impact discuté → manquer de rigueur ; un relecteur les remarquera systématiquement
- SI les forces de l'étude ne sont pas mentionnées → le lecteur ne peut pas juger de la portée réelle

**Résumé :**
- SI le résumé ne correspond pas au contenu du corps du texte → incohérence majeure (le résumé est souvent lu seul)

---

## Points de vigilance

- Les 5 signaux prédateurs de ce module COMPLÈTENT (sans doublonner) les signaux structurels du module Éthique (APC opaques, comité fantôme, non-indexation Scopus/WoS/DOAJ)
- Les critères de redondance texte/tableau sont une EXTENSION OPÉRATIONNELLE du module Cohérence (qui pose le principe général) vers la détection concrète en contexte de publication
- La structure IMRAD est une perspective publication-ready, distincte de la structure de thèse du module Writing-process
- Les critères d'authorship (ICMJE) sont propres à ce module et n'existent dans aucun autre module
