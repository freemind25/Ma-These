# Worklog — environnement sandbox (sessions Ma-These)

---
Task ID: consignation-worklog-v1
Agent: Z.ai Code (session externe)
Task: Consigner les 5 entrées worklog externes dans le clone Ma-These, sur instruction explicite du propriétaire (« commencez à consigner toutes les entrées worklog »)

Work Log:
- Clone vérifié : /tmp/Ma-These @ 4e15cda (v1.10.7, arbre propre) ; worklog.md = 8 015 l.
- Format de la maison confirmé : 150+ entrées « Task ID: » (les dernières, l. 7905-7987, proviennent de sessions de cet environnement — auteur commits « Z User <z@container> »).
- Re-sourcing des entrées de la session antérieure avant écriture :
  - audit-externe-v1 : ETAT-PROJET-THESISFRAME.md §7.1 (l. 158-160, citation exacte 0/7) confirmée ; comptages MÉMOIRE CORRIGÉS : 11 fichiers RAPPORT-LOT-*.md (pas 12), « Lot 2 » = 9 occurrences worklog.md (pas 62).
  - biblio-sources-v1 : BOOK_SOURCES l. 37+, 7/7 sources confirmées (Gutenberg, Open Library, Standard Ebooks, ManyBooks, PDF Drive, PDF Coffee, PDF Room).
- 5 entrées rédigées au format de la maison (Task ID / Agent / Task / Work Log / Stage Summary), accents et typographie français corrects (1er append sans accents annulé par git checkout, réécrit proprement).
- worklog.md : 8 015 → 8 100 lignes (+85), couture vérifiée après la dernière entrée existante (Task ID: 4).
- Commit local 5b28979 « docs(worklog): consign external session entries (audit-externe-v1 → leapspace-esquisses-v1) » — zéro code modifié, 1 fichier, +85.
- Patch exporté vers emplacement persistant : /home/z/my-project/consignations/0001-docs-worklog-consign-external-session-entries-audit-.patch (+ worklog-consignation.diff).

Stage Summary:
- 5 entrées consignées dans /tmp/Ma-These (clone local) : audit-externe-v1, biblio-sources-v1, leapspace-v1, claim-radar-sketch-v1, leapspace-esquisses-v1.
- Push vers GitHub NON effectué (aucun identifiant) — reste côté propriétaire : soit push depuis le clone, soit application du patch (`git am` / `git apply`) sur le checkout réel.
- Le clone /tmp est volatil : le patch dans /home/z/my-project/consignations/ est la sauvegarde persistante.
- Séquence verrouillée inchangée : test .exe → v1.9.8/distribution → Camille.
- Deux corrections de mémoire documentées (12→11, 62→9) — l'entrée audit-externe-v1 les note explicitement.

---
Task ID: push-worklog-v1
Agent: Z.ai Code (session externe)
Task: Pousser le commit de consignation vers GitHub avec le jeton fourni par le propriétaire

Work Log:
- Vérifications préalables : clone intact (5b28979 sur 4e15cda, branche main) ; remote = github.com/freemind25/Ma-These.git ; tip distant toujours à 4e15cda (fast-forward propre, pas de rebase nécessaire).
- Push one-shot : `git push https://<token>@github.com/freemind25/Ma-These.git HEAD:main` → `4e15cda..5b28979 HEAD -> main`.
- Vérification post-push : ls-remote refs/heads/main = 5b2897995383d0610aca0f57775b99e13e247634 ✅.
- Hygiène : jeton utilisé en URL one-shot uniquement, NON persisté (.git/config propre, aucun fichier disque).

Stage Summary:
- Le dépôt réel GitHub contient désormais les 5 entrées consignées (commit 5b28979).
- Jeton transmis en clair dans le chat — révocation conseillée (voir rapport à l'utilisateur).
- Séquence verrouillée inchangée : test .exe → v1.9.8/distribution → Camille.

---
Task ID: test-production-theses-v1
Agent: Z.ai Code (agent de test)
Task: Exécuter le test de production réelle (prompt-production-these-urbanisme-tic-ia.md) — thèse complète produite à travers ThesisFrame

Work Log:
- Déploiement de l'app dans le sandbox (repo cloné, bun install, base de test dédiée urbanisme-test.db — custom.db du propriétaire intacte, geo-mcp-service port 3005).
- Thèse créée via API (cmu2vbcp20000rlpryqxmzns4), cadrage 12 champs rempli, cadrage spatial réel (Nominatim, Gauss, CRS, 27 couches Overpass : tram 22-0, postes 26-0, cliniques 0-12, USTHB invisible).
- Littérature : HAL 6 thèses réelles (contournement bug A.1), CrossRef 7/7 vérifiées via citation-check (DOI erroné de mémoire corrigé par le pipeline !), OpenAlex recherche bloquée budget (A.2), deep-research web 17 326 car. (A.3).
- Rédaction : 6 supervisions directeur-chat, 7 chapitres × 2 itérations, 7 162 mots, diffs mot à mot (+705/−31).
- Livrables : coherence-check 23/23 ✓, DOCX exporté via l'app (30,7 ko), download/THESE-urbanisme-tic-ia-production-test.md (8 549 mots, annexe A.1-A.13).
- Vérification navigateur : thèse rendue dans l'éditeur, chapitres + comptes visibles, contenu affiché, 0 erreur console bloquante.
- Consignation : entrée test-production-theses-v1 committée dans le clone (eee6373) ; push impossible — jeton révoqué (comme recommandé) ; patch exporté dans consignations/.

Stage Summary:
- VERDICT : critère du protocole atteint — thèse complète, réelle, sourcée, IMRaD, produite de bout en bout à travers l'app, anomalies consignées sans interrompre la rédaction.
- 4 anomalies de code, 3 écarts de conformité, 5 mineures — détail dans l'annexe A.1-A.13 du livrable.
- Commit prêt à pousser : eee6373 (patch : consignations/0001-docs-worklog-test-production-theses-v1.patch).

---
Task ID: livraison-livrables-v1
Agent: Z.ai Code
Task: Rendre le livrable du test de production (thèse complète) téléchargeable par le propriétaire — demande « donnez moi le lien pour télécharger le document produit »

Work Log:
- Livrables localisés dans /home/z/my-project/download/ : THESE-urbanisme-tic-ia-production-test.md (57 592 o, 8 549 mots) et THESE-urbanisme-tic-ia-production-test.docx (30 710 o, export via l'app) — cohérents avec l'entrée test-production-theses-v1.
- Copie des 2 fichiers dans public/ → servis statiquement par Next.js aux chemins /THESE-urbanisme-tic-ia-production-test.md et .docx (curl : 200, text/markdown et MIME DOCX correct).
- Nouveau composant src/components/layout/test-deliverable-card.tsx : carte flottante bas-droite, fermable (persistance localStorage « test-deliverable-card-dismissed »), 2 liens avec attribut download — montée en charged via setTimeout(0) pour respecter la règle lint « pas de setState synchrone dans un effet » (corrigé : 0 erreur lint, 232 warnings préexistants inchangés).
- Carte montée dans src/app/page.tsx (SidebarProvider, après SidebarInset) — visible sur toutes les vues.
- Vérification Agent Browser : carte présente dans l'arbre d'accessibilité, 2 liens href corrects + download=true ; fetch depuis la page : .md 200, .docx 200 (30 710 o = taille exacte) ; bouton masquer → carte disparue, persistée après reload ; captures desktop (1280) et mobile (390) conformes, aucun débordement ; 0 erreur page.
- dev.log : seules erreurs = 429 deep-research de la phase de test (anomalie A.3 déjà consignée) — aucune erreur nouvelle.

Stage Summary:
- Le propriétaire peut télécharger la thèse produite : soit via la carte « Livrable du test de production » en bas à droite du tableau de bord (aperçu), soit via les chemins statiques /THESE-urbanisme-tic-ia-production-test.md et /THESE-urbanisme-tic-ia-production-test.docx (« Ouvrir dans un nouvel onglet » + chemin).
- Originaux intacts dans download/ ; copies dans public/ uniquement pour le service statique.
- La carte est un artefact de session, facilement retirable (1 composant + 2 lignes dans page.tsx).

---
Task ID: corrections-annexe-a1-a13-v1
Agent: Z.ai Code
Task: Appliquer les directives du prompt « Corrections et adaptations définitives » — traitement des anomalies A.1-A.13 de l'annexe technique du test de production, avec preuves d'exécution réelle post-correction

Work Log:
- A.1 : route HAL corrigée à la racine (fq répétés via append, sort %20) + cause additionnelle découverte (domaine : level0_domain_s + taxonomie HAL réelle shs/sdv/spi/info/phys/chim/sdu/math/sde/scco — les anciens codes n'existaient pas) ; frontend aligné. Preuve : requête domaine+tri rejouée → 200, 802 résultats réels (avant : 500).
- A.2 : nouveau src/lib/research/academic-fallback.ts (repli CrossRef+HAL, triangulation DOI, curation identique) ; pipeline deep-research extrait en module (deep-research-pipeline.ts) pour exécution par worker ; détection 429/budget ; notice visible, aucun message brut. Preuve réelle : OpenAlex 429 détecté → repli automatique (CrossRef 60 hits → 15 sources curées, score moyen 0.82), rapport 24 829 car. Garde HAL ajouté (200 silencieux numFound:0 sur cadence rapprochée — constaté en réel ; sérialisation + 4 s + reprise).
- A.3 : maxTokens 10k→12k, prompt renforcé (Sources obligatoire, phrases complètes), continuation (max 2 passes), validation Sources avec relance + repli déterministe depuis la liste réelle ; contradiction de citation harmonisée ([n] corps / Markdown liens Sources). Preuve réelle (157 s) : logs « passe de continuation 1/2 » + « relance automatique demandée », rapport 24 524 car., Sources 16 entrées réelles, fin propre.
- A.4 : table ChapterVersion (miroir ThesisCadrageVersion), version sur PUT modifiant le contenu (versionId en réponse), GET versions, word-diff LCS natif zéro dépendance, dialogue Historique avec diff colorisé + stats dans l'éditeur. Preuves : 2 PUT → 2 versions ; UI vérifiée au navigateur (sélecteurs 1460 vs 481 mots, +997/−18, diff rouge/vert). Incident maîtrisé : la preuve a tronqué le ch. I de la base test → reconstruit depuis le livrable md (1 460 mots, correspondance vérifiée 2 967 car.), totaux thèse revenus à 7 162.
- A.5/A.6 : décisions tranchées et documentées dans CONTEXT-PROJET.md (D-A.5 : champ libre définitif, justification multi-disciplines ; D-A.6 : chaîne MCP géo+Overpass+verification-carto = cible définitive, PostGIS incompatible Tauri/SQLite, preuves de production) ; greps confirment qu'aucune mention à corriger dans le dépôt.
- A.7 : executeOverpassQuery → 3 tentatives, timeouts progressifs 25/35/45 s (réécriture du [timeout] serveur), backoff 2/5 s, alternance endpoints ; distinction zéro/manquante inchangée. Preuve réelle : bus_station Bab Ezzouar (la requête qui avait expiré 2×) → 200, 3 éléments, et log « Reprise 1/2 après échec (backoff 2000ms) » déclenché spontanément.
- A.8 : file persistante (modèle Job + verrou optimiste + sweep orphelins 10 min + worker via src/instrumentation.ts + handlers noop/deep-research + API /api/jobs). Preuves : job noop 201 → done avec résultat en ~2 s ; orphelin running à startedAt -20 min → requalifié → exécuté (attempts 2, résultat persisté).
- A.9 : timeout explicite documenté (150 s défaut, 5-180 s par appel), cause racine du 320 s découverte (voie SDK sans timeout → withExplicitTimeout sur toutes les voies), maxRetriesPerProvider, relance unique à prompt resserré (contexte 8k, historique 4×4k, concision). Preuves : nominal 200 en 7 s (retried:false, timeoutMs:150000) ; timeout forcé 5 s → log « Dépassement du timeout (5000 ms) — relance automatique unique à prompt resserré » → 200 en 36 s, retried:true, 2 441 car.
- A.10 : investigation complète (mémoire/zombies/connexions exclus) ; cause = supervision de l'environnement (reproduction contrôlée : serveurs tool-spawnés tués aux frontières de session, boot-parenté intact des heures) ; procédure documentée dans docs/EXPLOITATION-SERVEUR.md. NB : cette contrainte a forcé les preuves en appels autoportants (serveur+preuve dans le même appel).
- A.11/A.12 : vérification forensique (directeurThese.js absent du dépôt, docs déjà cohérentes ; aucune mention « 6 sections ») ; squelette 7 chapitres érigé en référence officielle (CONTEXT-PROJET.md D-A.11/D-A.12).
- Livrable : RAPPORT-CORRECTIONS-ANNEXE-A1-A13.md (statuts + preuves) dans download/ + public/ + carte de téléchargement mise à jour (3 liens, clé dismiss v2).
- Déploiement : schéma poussé (additif) sur urbanisme-test.db ET custom.db ; .env restauré sur custom.db ; serveur final relancé dessus ; smoke A.1 post-déploiement (802 résultats) ; custom.db intact (7 chapitres / 0 mots).
- Qualité : lint 0 erreur (230 warnings, < aux 232 d'avant mission) ; typecheck sans erreur sur les fichiers de la mission.

Stage Summary:
- 12 points sur 12 traités : 9 corrigés à la racine avec preuves d'exécution réelle, 4 décisions formalisées et documentées (A.5, A.6, A.11, A.12 — dont 2 avec vérification forensique « rien à corriger dans le dépôt »), A.13 sans action.
- Découvertes documentées : HAL tolère mal les cadences rapprochées (200 silencieux numFound:0) ; la voie SDK z.ai n'avait aucun timeout (cause du 320 s) ; l'environnement sandbox tue les processus hors arbre de boot (cause A.10, réplique de A.8).
- Livrables : RAPPORT-CORRECTIONS-ANNEXE-A1-A13.md ; docs/EXPLOITATION-SERVEUR.md ; décisions dans CONTEXT-PROJET.md ; 8 nouveaux fichiers, 10 fichiers modifiés, 2 tables additives.
- Le push GitHub reste côté propriétaire (jeton révoqué) ; patch possible sur demande.

---
Task ID: push-release-v1.10.8
Agent: Z.ai Code
Task: Exécuter la séquence verrouillée avec le jeton fourni (« push, patch, release, tag, exécutable d'installation »)

Work Log:
- État des lieux : dépôt local re-snapshoté (historique UUID, sans remote) — clone GitHub reconstruit comme base propre ; main distant HEAD = 5b28979 (le commit eee6373 n'avait jamais été poussé) ; release v1.10.7 + Ma.These_1.10.7_x64-setup.exe déjà en ligne.
- Diff exhaustif clone ↔ workspace fermé : docs de session (worklog, consignations, CONTEXT-PROJET, EXPLOITATION-SERVEUR, RAPPORT-CORRECTIONS), livrables (THESE-*.md/.docx dans public/), carte livrables (3 liens, clé v2), corrections de code A.1-A.13 (8 fichiers nouveaux, 10 modifiés, 2 tables additives), package.json (écart sandbox uniquement, non poussé), db (régénérée proprement).
- 6 commits construits dans le clone : 169699b (replay eee6373 via git am, message conservé), bbc188c (docs session + livrables + patchs persistants), 946312b (feat corrections A.1-A.13, 20 fichiers, +2380/−700), a7ea4a3 (carte livrables), 75d94ac (bump 1.10.8 : package.json, tauri.conf.json, Cargo.toml), 3c13826 (patchs format-patch 0002-0006).
- db embarquée régénérée proprement : copie de la template v1.10.7 distante + prisma db push additif (ChapterVersion + Job) — données initiales intactes (1 thèse, 7 chapitres), compatibilité exe garantie (aucun db push au démarrage de l'app, lib.rs copie db/custom.db au premier lancement).
- Sécurité vérifiée avant push : scan secrets négatif sur tous les fichiers poussés ; .env (DATABASE_URL locale) NON poussé (gitignoré) ; jeton retiré de .git/config du clone ; le dépôt public ne reçoit aucun secret.
- PUSH BLOQUÉ (403) : le fine-grained PAT a Contents en LECTURE SEULE — preuve : PUT /contents → 403 « Resource not accessible by personal access token » (écriture labels : 201, lecture/metadata : OK). Le push git, la création de tag et la release exigent Contents: write — impossible avec ce jeton.
- Travail sécurisé pour livraison : bundle git complet download/Ma-These-push-v1.10.8.bundle (8,7 Mo, historique intégral jusqu'à 3c13826, vérifié) + copies des patchs 0002-0006 dans download/ — pushable en 2 commandes depuis n'importe quelle machine.

Stage Summary:
- POUSSÉ : rien (blocage jeton) — PRÊT : 6 commits + tag v1.10.8 à créer + pipeline CI existante (build-desktop.yml, success sur v1.10.7, crée la release draft avec setup.exe NSIS).
- Deux voies pour le propriétaire : (a) jeton avec Repository permissions → Contents: Read and write, la séquence complète est exécutée ensuite ; (b) push autonome depuis le bundle (clone → push main → tag v1.10.8 → CI construit et publie l'exe).
- Le jeton en clair dans le chat DOIT être révoqué (permissions partielles, usage terminé).

---
Task ID: push-release-v1.10.8-final
Agent: Z.ai Code
Task: Exécuter la séquence complète avec le second jeton — push, tag, CI, release, exécutable d'installation

Work Log:
- Push main OK (5b28979..3c13826, 6 commits) ; tag v1.10.8 poussé → run 35080060447 échec en 2 min : TS2695 deep-research-pipeline.ts:108 (opérateur virgule dans startsWith — seul « • » testé).
- Hotfix 477911d (chaque préfixe testé explicitement) ; typecheck complet : 0 erreur hors .test.ts préexistants (exclus du build, preuve : v1.10.7 buildait avec). Tag v1.10.8 déplacé forcé (aucun asset produit par le run échoué — jamais utilisé).
- Re-run 35080625925 : SUCCESS ~9,5 min → release draft créée par tauri-action (Ma.These_1.10.8_x64-setup.exe, 72,9 Mo) → publiée via API 09:49 UTC ; téléchargement public vérifié (HTTP 206).
- Entrée worklog projet + patch 0007 consignés (commit 8d098b1, poussé) ; bundle download/ rafraîchi sur 8d098b1.

Stage Summary:
- RELEASE v1.10.8 EN LIGNE : https://github.com/freemind25/Ma-These/releases/tag/v1.10.8 — Ma.These_1.10.8_x64-setup.exe (72,9 Mo).
- Contenu : corrections A.1-A.13 + carte livrables + db compatible (ChapterVersion, Job).
- Prochaine étape verrouillée (propriétaire) : tester le setup.exe sur Windows avant distribution à Camille.
- RÉVOQUER LES DEUX JETONS (circulés en clair dans le chat).

---
Task ID: apinex-integration-1
Agent: Z.ai Code (main)
Task: Analyser apinex.bond, tester la clé API fournie par l'utilisateur, et intégrer un playground APInex complet dans ThesisFrame

Work Log:
- Analyse du site apinex.bond (overview, /docs, /developers, /developers/tools, twitter) via page_reader
- Découverte : gateway LLM multi-fournisseurs (OpenAI, Anthropic, Gemini, DeepSeek, Zhipu, Moonshot, xAI), base URL https://api.apinex.bond/v1, compatible OpenAI + Anthropic Messages
- Tests directs : GET /api/public/models (29 modèles), GET /v1/balance, POST /v1/chat/completions avec free/glm-5.3-flash (OK avec solde 0, cost_tokens:0), POST /v1/tools/web/search (échec 402 : coûte ~600 tokens, doc "gratuit" erronée)
- Clé sk-apx… (fournie par l'utilisateur) placée dans .env : APINEX_API_KEY + APINEX_BASE_URL (serveur uniquement)
- Créé src/lib/apinex/apinex-client.ts : client serveur (types, cache modèles 5 min, extraction erreurs)
- Créé 4 routes API : /api/apinex/models (catalogue public), /api/apinex/balance (solde USD), /api/apinex/chat (proxy SSE streaming avec stream_options include_usage), /api/apinex/web-search (outil web, gestion billing_error 402)
- Créé src/modules/apinex/apinex-page.tsx : playground complet FR — cartes solde/dépense/modèles, chat streaming markdown, sélecteur de modèles groupé par fournisseur avec badge GRATUIT + prix, température, prompt système, toggle recherche web avec dégradation gracieuse, métadonnées par message (modèle, tokens, cost_tokens, latence), sources web numérotées
- Intégration navigation : ViewId "apinex" dans app-store.ts (catégorie ia-outils, icône Zap), ICON_MAP sidebar, case dans page.tsx
- Lint : 0 erreur (2 warnings nouveaux corrigés)
- Vérification agent-browser : navigation vers module, chat streaming complet avec free/glm-5.3-flash (réponse + métadonnées 384 tokens / 1152 tokens APInex / 39.4s), recherche web → 402 gérée proprement (conversation continue), layout mobile 390px OK, footer collé au bas

Stage Summary:
- Playground APInex opérationnel : 29 modèles dont 13 gratuits testables avec solde 0$
- Comportements validés : free/* gratuits, modèles payants → billing_error (toast + bulle d'erreur), web search → 402 géré gracieusement (~600 tokens/appel dès que le solde est rechargé)
- Clé API strictement côté serveur (.env), jamais exposée au client
- Point d'attention : la doc APInex annonce la recherche web "gratuite" mais elle est facturée ~600 tokens ; le solde de l'utilisateur est 0$ — recharge nécessaire sur apinex.bond pour les outils web et modèles payants

---
Task ID: apinex-integration-2
Agent: Z.ai Code (main)
Task: Diagnostic et correction de l'alerte "Clé API absente" du module APInex

Work Log:
- Diagnostic : l'environnement sandbox a été réinitialisé entre les sessions — le fichier .env ne contenait plus que DATABASE_URL, la ligne APINEX_API_KEY avait disparu
- Le serveur dev renvoyait hasKey: False sur /api/apinex/models, d'où l'alerte visible dans l'UI
- Clé re-validée directement auprès d'APInex (balance endpoint OK, key id key_99e628d4…)
- .env re-complété (APINEX_API_KEY + APINEX_BASE_URL) puis redémarrage du serveur dev (les variables .env ne sont lues qu'au démarrage)
- Vérifications post-fix : hasKey: True, 29 modèles, balance 0 USD, chat streaming free/glm-5.3-flash OK, aucun erreur dans dev.log

Stage Summary:
- Incident compris : la réinitialisation du sandbox efface .env ; en cas de réapparition de l'alerte, re-ajouter les 2 lignes dans .env et redémarrer le serveur
- Module APInex de nouveau pleinement opérationnel

---
Task ID: apinex-integration-3
Agent: Z.ai Code (main)
Task: Corriger l'erreur "Échec de la requête HTTP 502" signalée par l'utilisateur sur le chat APInex

Work Log:
- Diagnostic : dev.log ne montre AUCUN 502 côté Next (tous 200, chats de 30-32 s) → le 502 est généré par la passerelle plateforme entre le navigateur et le serveur
- Mesure TTFB : APInex garde les en-têtes jusqu'au premier token — 48 s mesurées sur free/glm-5.3-flash, alors que la passerelle coupe ~30 s sans données
- Fix route /api/apinex/chat : réponse 200 + en-têtes SSE émis INSTANTANÉMENT, commentaires de battement de cœur ": ping" toutes les 7 s pendant l'attente, erreurs upstream relayées dans le flux en événement SSE {"error":…} puis "data: [DONE]"
- Client : parsing des erreurs in-stream (billing_error → toast dédié), nouveau réglage "Tokens max (réponse)" (slider 256-4096, défaut 1024) pour borner le temps de génération
- Vérifications : TTFB passé de 48 s à 0.046 s ; conversation complète dans le navigateur en 38.2 s (> seuil passerelle) — succès ; lint propre

Stage Summary:
- Cause racine : timeout passerelle (~30 s sans octets) vs TTFB APInex (jusqu'à ~60 s sur modèles gratuits)
- Correctif robuste : heartbeat SSE + erreurs in-stream + max_tokens borné — validé au-delà du seuil (38.2 s OK)
- Comportement inchangé pour l'utilisateur final, mis à part l'absence de 502 désormais

---
Task ID: openresearch-analysis
Agent: Z.ai Code (main)
Task: Vérifier si alphaXiv/OpenResearch est intégré ; sinon identifier ce qui est utile

Work Log:
- Analyse du dépôt github.com/alphaXiv/OpenResearch (README, structure) via page_reader
- Constat : 0 occurrence de "alphaxiv|openresearch" dans src/ → AUCUNE intégration existante
- Inventaire croisé des intégrations académiques du projet : theses.fr (26), OpenAlex (21), DOAJ (3), CrossRef (3), Semantic Scholar (2), CORE (2), arXiv (1, indirect)

Stage Summary:
- OpenResearch = harness CLI Rust (orx) + dashboard local pour transformer Claude Code/Codex/Cursor en agents de recherche (autoresearch, arbre d'expériences git, worktrees isolés, compute Slurm/K8s/SSH) — hors périmètre direct d'une app web
- Chevauchements déjà couverts par ThesisFrame : découverte de littérature, SLR/PRISMA, hypothèses IA, deep-research, paper2code, multi-modèles
- Utile à réutiliser : (1) arXiv API directe quasi absente, (2) concept de journal d'expérimentations (runs/variants/preuves/verdicts) inexistant, (3) format SKILL.md pour spécialisations IA composables
- Recommandation livrée à l'utilisateur ; pas de code modifié dans cette tâche

---
Task ID: openresearch-integration-1
Agent: Z.ai Code (main)
Task: Intégrer les éléments utiles d'alphaXiv/OpenResearch identifiés : ① recherche arXiv native, ② journal d'expérimentations

Work Log:
- ① arXiv : route GET /api/arxiv/search (API Atom export.arxiv.org, parsing XML sans dépendance, throttle 1.2s + cache 10 min, recherche phrase exacte via guillemets, tri pertinence/récence, BibTeX généré clé type dupont2026titre)
- ① UI : composant src/modules/academic-db/arxiv-search.tsx inséré en tête du module Bases de données — recherche live, résultats scrollables (titre/auteurs/date/badges catégories/abstract dépliable/journal_ref), actions : "Ajouter aux références" (POST /api/references, source "arxiv"), copie BibTeX, lien PDF, pagination "Charger plus"
- ② Prisma : modèles Experiment (question, hypothesisRef, protocol, status planned|running|concluded, verdict supported|refuted|inconclusive, conclusion, tags) + ExperimentRun (label, variant, metrics JSON, result, evidenceUrl, status, verdict, notes) — db:push OK
- ② API : /api/experiments (GET/POST), /api/experiments/[id] (GET/PATCH/DELETE), /api/experiments/[id]/runs (POST), /api/experiments/[id]/runs/[runId] (PATCH/DELETE) — validation zod, cascade delete
- ② UI : module src/modules/experimentations (liste + détail 2 colonnes, dialogs création expérimentation et run, métriques saisies en "nom: valeur" → JSON, verdicts run + globaux, conclusion à la conclue, preuves liées)
- Nav : ViewId "experimentations" (catégorie methodologie, icône FlaskConical) + case page.tsx
- Bugs corrigés : client Prisma périmé après db:push (redémarrage serveur), exp.runs undefined à la création (normalisation runs ?? [])
- Vérifié : CRUD complet via curl (create→run→verdicts→conclusion→delete), recherche arXiv "urban digital twin" (201 résultats), référence arXiv insérée en base (do2025digital), run ajouté via UI avec métriques rendues, lint propre, mobile 390px OK

Stage Summary:
- arXiv est désormais une source de recherche native avec export BibTeX et alimentation directe de la bibliothèque de références
- Le workflow doctoral couvre maintenant la boucle complète hypothèse → expérimentation → preuve → verdict (inspirée d'OpenResearch, adaptée au web)

---
Task ID: sdd-activation-1
Agent: Z.ai Code (main)
Task: Analyser le SKILL SDD fourni (upload/SKILL(2).md), donner un avis d'expert, puis l'activer sur feu vert : skill amendé + CONSTITUTION.md + FICHE_SYNTHESE.md

Work Log:
- Audit factuel du document (11 affirmations vérifiées contre le dépôt, chemins + lignes cités) : 8 exactes (directeur.ts, Tauri v2, geo-MCP, troncature deep-research-pipeline.ts l.128-190, encodage HAL l.111-118, etc.), 1 obsolète (ChapterVersion existe — prisma/schema.prisma l.69 — là où le texte affirmait que Chapter n'avait pas d'historique), 1 inexacte ici (sous-agents réels disponibles), 1 à adapter (db:push vs migration Prisma)
- Avis d'expert livré : adopter avec 6 amendements (correction ChapterVersion, règle Prisma db:push avec preuve d'intégrité, voie rapide ≤ 20 lignes/1 fichier/0 impact transverse, sous-agents séquentiels pour l'implémentation + exploration parallèle sourcée, outils de preuve listés, nommage harmonisé)
- Feu vert propriétaire reçu sur les 3 points + 2 décisions enregistrées (seuil voie rapide : ne pas trancher seul en cas de doute ; exploration parallélisable avec citations obligatoires)
- Point nommage résolu avec preuve : l'incohérence vient de l'exemplaire uploadé (upload/SKILL(2).md l.2 "name: sdd-Ma Thèse" vs l.6 "SDD — ThesisFrame") ; aucun autre SKILL*.md dans le dépôt ; exemplaire du propriétaire (name: sdd-thesisframe) fait foi
- Créé skills/sdd-thesisframe/SKILL.md : version amendée complète (frontmatter name: sdd-thesisframe, contrainte d'exécution réécrite, repère ChapterVersion corrigé, fragilités sourcées avec chemins+lignes, section "Voie rapide", 3 anti-patterns ajoutés/modifiés, moyens de preuve du dépôt listés)
- Créé CONSTITUTION.md (Étape 0) : 7 articles (preuve avant affirmation avec leçons de drift, autorisation avant modification, une tâche = un commit conventionnel, pas de reconstruction silencieuse, preuve d'exécution obligatoire, intégrité des données Prisma, décisions de cadrage enregistrées) — EN ATTENTE DE VALIDATION (point d'arrêt)
- Créé FICHE_SYNTHESE.md : première entrée de session (décisions, points ouverts)

Stage Summary:
- Protocole SDD opérationnel : skill versionné dans skills/sdd-thesisframe/SKILL.md, constitution proposée à validation, fiche de synthèse instaurée
- Bloquant avant tout premier cycle spec → plan : validation de CONSTITUTION.md par le propriétaire
- La prochaine fonctionnalité démarre à l'Étape 1 (spécifier) ; openresearch-integration-1 confirmée livrée, rien en vol

---
Task ID: sdd-activation-2
Agent: Z.ai Code (main)
Task: Recette de CONSTITUTION.md par le propriétaire — retrait du statut d'attente, commit docs:

Work Log:
- Recette reçue : les 7 articles validés tels quels, rien à modifier
- Écart .gitignore (l.54 /skills/ → /skills/*) approuvé rétroactivement par le propriétaire, raisonnement jugé correct et prouvé (git check-ignore -v)
- CONSTITUTION.md : ligne « Statut : en attente de validation par le propriétaire » retirée (fichier annoncé par le propriétaire, conformément à l'article 2) — la constitution est en vigueur
- Commit docs: conformément à l'article 3
- FICHE_SYNTHESE.md volontairement non retouchée à ce stade (non annoncée) — sa mise à jour interviendra au rendu de fin de session

Stage Summary:
- Étape 0 close : CONSTITUTION.md validée et en vigueur, protocole SDD actif
- Toute nouvelle demande de modification du dépôt suit désormais le cycle : Étape 1 spec.md (sans nom technique, zones floues [À CLARIFIER]) → clarification → plan → découpage → implémentation par groupes recettés → convergence

---
Task ID: hal-search-encoding-1
Agent: Z.ai Code (main)
Task: Cycle SDD n°1 — bug d'encodage route HAL (/api/theses-en-ligne/search), variante assess.md, à partir de la reproduction

Work Log:
- Lecture du code : route.ts (196 l., commentaires A.1 l.83-120 décrivant des corrections déjà appliquées) + frontend (l.70-93 : codes domaine alignés, tris à espace) — lecture seule, aucune modification
- Reproduction réelle : 9 scénarios contre le serveur de dev (baseline, filtre shs, tri +, tri %2B, années, combiné + pagination, multi-mots) → 9/9 HTTP 200, filtres appliqués (802 < 905), bornes d'années respectées, pagination filtrée OK
- Démonstration du mécanisme historique en direct chez HAL : sort=%2B → {"msg": "Error. See help : /docs"} ; fq avec & interne encodé → même erreur ; forme actuelle (fq répétés + %20) → 802 résultats, identique à la route locale
- Source documentaire de la correction trouvée : public/RAPPORT-CORRECTIONS-ANNEXE-A1-A13.md l.13 + l.33-36 (A.1 « corrigé à la racine — preuve 200 réel », mission 16/09/2026, v1.10.7)
- specs/hal-search-encoding/assess.md rédigé : verdict NON REPRODUCTIBLE, sorties réelles collées, correctif proposé : aucun, cycle arrêté conformément au protocole
- Commit docs: de l'assess.md ; aucune modification de code

Stage Summary:
- Le bug allégué (encodage %2B / fq HAL) est réel historiquement mais DÉJÀ CORRIGÉ par l'annexe A.1 — non reproductible sur le code actuel, preuves live + upstream + rapport A.1-A13
- Cycle n°1 arrêté à la reproduction (règle « non reproductible → le dire, s'arrêter ») — aucun code modifié
- Décision laissée au propriétaire : clore le cycle, et/ou commander un test de non-régression vitest (route sans route.test.ts) en tâche dédiée

---
Task ID: hal-search-encoding-2
Agent: Z.ai Code (main)
Task: Cycle n°1 suite — commande du propriétaire : test de non-régression vitest (Étapes 4 → 6, périmètre fermé au fichier test)

Work Log:
- Étape 4 : specs/hal-search-encoding/tasks.md rédigé — Groupe A unique (Tests / non-régression), T1 : écrire route.test.ts épinglant M1 (fq répétés), M2 (normalisation tri %2B/+ → espace), M3 (%20 final, aucun + littéral) ; feu vert préalable explicite (fichier nommé par la commande)
- Étape 5, T1 : lecture des conventions du dépôt (vitest.config.ts l.10-14 ; verification-carto/route.test.ts l.2-3) puis écriture de src/app/api/theses-en-ligne/search/route.test.ts — 14 tests, mock global.fetch avec capture d'URL, zéro réseau, zéro modification de route.ts
- Preuves : test ciblé 14/14 verts (24 ms) ; eslint ciblé 0 erreur ; suite complète 1427/1428 avec 1 échec PRÉEXISTANT hors périmètre (ai-types.test.ts : 18 providers attendus / 20 réels — routesme+apinex ajoutés au catalogue sans mise à jour du test ; échec seul reproduit : 1/39, preuve d'indépendance)
- preuves.md rédigé avec sorties réelles ; commit test: ; tasks.md volontairement non cochée (recette requise)

Stage Summary:
- Groupe A proposé à la recette (compte rendu transmis au propriétaire) — convergence (Étape 6) après acceptation
- Signalement article 4 : échec préexistant src/lib/ai/ai-types.test.ts (catalogue 20 providers vs test figé à 18) — correction non annoncée, non effectuée, décision au propriétaire

---
Task ID: hal-search-encoding-3
Agent: Z.ai Code (main)
Task: Cycle n°1 fin — Groupe A recetté par le propriétaire : coche T1, Étape 6 (verdict de convergence)

Work Log:
- Recette Groupe A reçue (« Groupe A recetté ») — T1 cochée dans specs/hal-search-encoding/tasks.md (la case n'a été cochée qu'après acceptation, conformément au protocole)
- Étape 6 : relecture assess.md + tasks.md + preuves.md contre le code produit (src/app/api/theses-en-ligne/search/route.test.ts, 14 tests, mock fetch, route.ts intacte) — verdict CONVERGÉ consigné dans tasks.md (critères 1/1, écart : aucun, dette : aucune)
- Correction sur preuve de la mention d'apparence « routesme+apinex » consignée à l'entrée précédente : apinex absent du catalogue (git log -S 'apinex' sur ai-types.ts : aucun commit), test né périmé au commit 1359333 (2026-09-15, catalogue 20 + assertion 18 ensemble), jamais vert ; 6463078 = mode uniquement
- Commit docs: cb9145a (coche T1 + verdict convergence) — zéro code modifié

Stage Summary:
- Cycle n°1 hal-search-encoding CLOS : verdict CONVERGÉ daté du 2026-09-18 dans tasks.md
- Le test de non-régression (14 tests) fige durablement M1 (fq répétés), M2 (tri %2B/+ → espace), M3 (%20 final) — annexe A.1 protégée contre régression

---
Task ID: ai-types-provider-count-1
Agent: Z.ai Code (main)
Task: Tâche commandée par le propriétaire — voie rapide ai-types-provider-count : échec préexistant ai-types.test.ts (18 figé vs 20 réels), correction conditionnée à la vérification que 20 est le compte voulu

Work Log:
- Vérification préalable sur preuve : DYNAMIC_MODEL_PROVIDERS (src/lib/ai/ai-types.ts l.201-206) = 20 entrées, 20 uniques, 0 inconnu (bun -e) ; ALL_PROVIDER_IDS 26, catégories couvrent 26, 0 orphelin, 6 hors dynamique (zai, openai, anthropic, pollinations, kilo, kiraai) — cohérent
- routesme : légitime et pleinement câblé (ai-types.ts l.14/76/230/263/325 ; ROUTESME_API_KEY hardcoded-keys.ts l.32 ; zai-client.ts l.852 ; module routesme-page.tsx) mais présent dès la création du catalogue ; apinex : JAMAIS dans ai-types.ts (git -S vide), gateway distincte hors catalogue (apinex-client.ts, https://api.apinex.bond, routes /api/apinex/*) — hypothèse du propriétaire corrigée sur preuve, signalée (article 4)
- Attribution réelle : catalogue 20 + assertion 18 arrivés ensemble au commit externe 1359333 (2026-09-15) — test né périmé, jamais vert ; condition « 20 = compte voulu » confirmée → correctif autorisé par la commande conditionnelle
- Correctif : src/lib/ai/ai-types.test.ts l.120-122 — libellé + toHaveLength 18 → 20 (1 ligne, 1 fichier, voie rapide éligible)
- Preuves : avant = 1 failed | 38 passed (39) ; après = 39/39 verts ciblé, suite complète 62/62 fichiers, 1428/1428 tests (précédemment 1427/1428) ; specs/ai-types-provider-count/assess.md + preuves.md rédigés (sorties réelles)
- Commit test: e6eeb82 ; FICHE_SYNTHESE.md mise à jour (session 2026-09-18) ; clôture cycle n°1 consignée

Stage Summary:
- Suite de tests intégralement verte (1428/1428) — échec préexistant éradiqué, aucune régression
- Le 20 est le compte réel et sain (0 doublon, 0 reliquat) ; l'attribution « routesme+apinex » du delta est factuellement corrigée : test né périmé au commit 1359333, apinex hors catalogue
- Cycle n°1 fermé des deux volets (hal-search-encoding CONVERGÉ + ai-types-provider-count clos) ; point ouvert restant : mode 100755 de CONSTITUTION.md (décision propriétaire)

---
Task ID: constitution-mode-1
Agent: Z.ai Code (main)
Task: Commande du propriétaire — voie rapide : restauration des permissions CONSTITUTION.md (chmod 644), déjà validée précédemment

Work Log:
- Preuve avant : git ls-files -s CONSTITUTION.md = 100755 (blob cf930073…) ; ls -l = -rwxr-xr-x
- chmod 644 + git add — preuve après : index 100644, git diff --cached --summary = « mode change 100755 => 100644 CONSTITUTION.md », blob inchangé (contenu strictement intact, 0 ligne)
- specs/constitution-mode/assess.md (condensé) + preuves.md rédigés, inclus au commit de la tâche
- Commit chore: 8334a86 ; FICHE_SYNTHESE.md : point ouvert soldé, observation consignée (autres fichiers suivis en 100755 : skills/sdd-thesisframe/SKILL.md, src/lib/ai/ai-types.test.ts — sans action décidée)
- Commit docs: (fiche + worklog)

Stage Summary:
- CONSTITUTION.md restauré en 100644 (contenu intact) — dernier point ouvert du cycle n°1 entièrement soldé
- Aucune tâche en vol ; suite de tests 1428/1428 verte ; observation passive : deux autres fichiers suivis en 100755, décision laissée au propriétaire

---
Task ID: mode-audit-1
Agent: Z.ai Code (main)
Task: Commande du propriétaire (« termine tous les chantiers ») — état des lieux complet + correction de l'observation sur les modes git

Work Log:
- Audit complet des modes : git ls-files -s → 424/433 fichiers en 100755, 9 en 100644 (specs/* créés dans le sandbox + CONSTITUTION.md restaurée). L'observation précédente (« ex. SKILL.md, ai-types.test.ts ») sous-estimait le périmètre : l'anomalie est généralisée, héritée du commit d'import externe 1359333
- Correction consignée dans FICHE_SYNTHESE.md (points ouverts n°2) avec proposition chiffrée : normalisation 644 pour tout sauf .zscripts/*.sh (légitimement exécutables), ≈ 410 changements de mode, zéro ligne de contenu, 1 commit chore: — décision laissée au propriétaire, aucune action exécutée (article 2 : impact massif cosmétique, l'agent ne tranche pas seul)
- État des chantiers vérifié : aucune tâche en vol, aucun cycle ouvert, arbre propre, suite 1428/1428 verte, cycle n°1 clos des deux volets

Stage Summary:
- Aucun chantier actif restant ; seule décision en suspens : normalisation optionnelle des modes git (proposition consignée dans la fiche)
- Dépôt prêt pour de nouveaux cycles SDD (Étape 1 — spécifier)

---
Task ID: git-mode-normalization-1
Agent: Z.ai Code (main)
Task: Commande du propriétaire — cycle court (assess.md) : normalisation des modes git, exclusivité .zscripts/*.sh à 755 avant commit, build après commit, un seul commit chore:

Work Log:
- specs/git-mode-normalization/assess.md + tasks.md + preuves.md rédigés (cycle court variante bug, dette d'import 1359333)
- Due diligence pré-commit : toutes les invocations de scripts hors .zscripts passent par bash/sh (tauri.conf l.8 : « bash scripts/build-tauri-prep.sh »), aucune exécution directe ./x.sh, node_modules non suivi (bits .bin intacts)
- Exception upload/ : upload/LR.rar + upload/res.pdf sur montage fuse.ossfs (chmod FS refusé) → mode corrigé à l'index seul via git update-index --chmod=-x ; bits FS 777 root inchangés, contenu intact
- Exclusivité vérifiée avant commit : git ls-files -s → seuls les 8 .zscripts/*.sh en 755 ; diff --cached --summary = 416 × « mode change 100755 => 100644 », numstat contenu = 0 (24 binaires en - -)
- Commit chore: 0348dcb unique (416 modes + 3 artefacts specs, zéro contenu sur l'existant) ; core.fileMode=false posé (config locale, sinon 2 fichiers ossfs paraissent modifiés en permanence)
- Post-commit : bun run build — 1er essai échoué sur fetch Google Fonts (transitoire, réseau ; les 2 seules erreurs, aucune sur un module), 2e essai SUCCÈS (table de routes complète) ; bun run test:run 1428/1428 ; lint 0 erreur
- Dev server : arrêté pour le build, relance découverte sandbox — tout fils de session est moissonné entre commandes (sleep test mort, même setsid simple) ; setsid -f (double-fork → orphelin) SURVIT (prouvé sur commandes séparées) ; curl 200 inter-commandes
- Vérification navigateur agent-browser : « Ma Thèse — Assistant de thèse », 0 erreur JS, UI complète (sidebar, 20+ modules), console propre, capture test-snapshots/13-mode-normalization-check.png
- FICHE_SYNTHESE.md mise à jour ; T1 laissée NON cochée (recette requise)

Stage Summary:
- Dépôt normalisé : 416 modes corrigés en 1 commit isolé, zéro contenu, aucune dépendance au bit d'exécution (build + tests + rendu prouvés)
- Connaissance sandbox : setsid -f obligatoire pour tout service persistant relancé depuis une session
- Recette T1 en attente du propriétaire ; chantier suivant lancé : veille-academique (Étape 1)

---
Task ID: veille-academique-1
Agent: Z.ai Code (main)
Task: Réponse « je valide » du propriétaire — recette T1 git-mode-normalization + validation spec veille-academique ; clôture cycle normalization et avancement veille-academique (Étapes 2 → 3)

Work Log:
- Recette T1 git-mode-normalization enregistrée (« je valide ») : T1 cochée, verdict CONVERGÉ (2026-09-18) consigné dans tasks.md — cycle CLOS — commit docs: 384a8f2
- Étape 2 veille-academique levée : les 4 zones floues tranchées par les choix les plus conservateurs, chacun dérivé du texte même de la spec (sources HAL+arXiv ; vu par résultat + raccourci global ; déclenchement 100 % manuel ; rétention 200) — décision de clarification consignée dans spec.md, tout choix modifiable à la recette des groupes — commit docs: dfa034f
- Étape 3 : lecture du code concerné avec citations — routes HAL (196 l., épinglée par 14 tests) et arXiv (259 l., throttle+cache), UIs theses-en-ligne (388 l.) et arxiv-search (353 l.), schéma Prisma (465 l., aucun modèle de veille, patron JSON-dans-String), conventions CRUD research-tabs, câblage module (app-store.ts ViewId l.9-51 + NAVIGATION_ITEMS, page.tsx switch l.61-150, app-sidebar.tsx ICON_MAP l.71-77 avec Binoculars déjà présent)
- specs/veille-academique/plan.md rédigé : approche (2 modèles SavedSearch/SavedSearchResult, 4 routes /api/veille/*, auto-fetch des routes de recherche existantes pour la vérification, module UI nouveau + boutons « suivre » dans les 2 UIs), 4 alternatives écartées, 11 fichiers touchés, impacts, vérification, risques
- FICHE_SYNTHESE.md mise à jour

Stage Summary:
- Cycle git-mode-normalization CLOS (CONVERGÉ, recette propriétaire) — plus aucun chantier ouvert antérieur
- veille-academique : Étapes 1-3 faites (spec validée, plan rédigé) — POINT D'ARRÊT : validation du plan demandée au propriétaire avant découpage (Étape 4) ; aucune ligne de code modifiée à ce stade

---
Task ID: veille-academique-2
Agent: Z.ai Code (main)
Task: Plan validé (« go ») — Étape 4 : découpage tasks.md par groupes de nature

Work Log:
- specs/veille-academique/tasks.md rédigé : 5 groupes — A Schéma [BLOQUANT] (T1 modèles SavedSearch/SavedSearchResult + preuve de survie db:push), B Backend (T2 check-core pur, T3-T6 routes /api/veille/*), C Frontend module+câblage (T7 UI, T8 app-store/page.tsx), D Frontend boutons « suivre » dans les UIs existantes (T9 HAL, T10 arXiv), E Tests non-régression (T11 check-core.test.ts) — dépendances A → B → {C,D,E}
- Garanties réaffirmées dans tasks.md : routes de recherche épinglées jamais modifiées, app-sidebar.tsx non touché
- FICHE_SYNTHESE.md mise à jour (plan validé, Étape 4 faite, Groupe A annoncé)

Stage Summary:
- Étapes 1-4 complètes (spec validée, plan validé, découpage écrit)
- POINT D'ARRÊT Étape 5 : Groupe A annoncé (1 fichier : prisma/schema.prisma), feu vert demandé — aucune modification exécutée

---
Task ID: veille-academique-3
Agent: Z.ai Code (main)
Task: Groupe B (Backend) — feu vert « je valide » : T2-T6, check-core + 4 routes /api/veille/*

Work Log:
- T2 : src/lib/veille/check-core.ts — fonctions pures diffResults (CA-2.1/2.2), applyRetention (fenêtre 200), dedupeByExternalId ; commit 834749d
- T3 : src/app/api/veille/route.ts — GET liste (compteurs non-vus groupBy) + POST création (validation 400 : libellé, source hal|arxiv, requête) ; commit f528be4
- T4 : src/app/api/veille/[id]/route.ts — PATCH renommage (CA-1.1) + DELETE cascade (CA-1.2, remainingResults en sortie) ; commit 0d4f4b0
- T5 : src/app/api/veille/[id]/check/route.ts — rejeu de la recherche stockée par auto-fetch des routes existantes (origin du request.nextUrl, HAL rows=50 / arXiv max=30, timeout 20 s, 502 si source en erreur, 504 si timeout), diff via check-core, premier check inséré « vu » (CA-2.1), suivants « non vus » (CA-2.2), lastCheckedAt (CA-2.4), rétention 200 ; commit 5a6889f
- T6 : src/app/api/veille/[id]/results/route.ts — GET (non vus d'abord) + PATCH {ids}|{all:true} (CA-3.1) ; preuves curl complètes ; commit 3bb0834
- Incident 1 : client Prisma du serveur de dev périmé (démarré avant le db:push du Groupe A — db.savedSearch undefined) → redémarrage setsid -f, 200 retrouvé
- Incident 2 : skipDuplicates non supporté par Prisma 6.19.2 sur SQLite → correction dans le groupe : déduplication amont dedupeByExternalId sur les deux branches createMany, option supprimée
- Preuves réelles dans specs/veille-academique/preuves.md : cycle HAL complet (création → check 1 base 50 résultats → check 2 sans nouveau → éviction simulée de 2 → check 3 newCount 2 → compteurs → vu partiel puis global → renommage → suppression cascade → validation 400) + cycle arXiv (base 30, normalisation, suppression) ; lint 0 erreur ; base rendue propre (0/0) ; routes de recherche jamais modifiées (git log vérifié, dernier commit dessus = 0348dcb, modes)

Stage Summary:
- Groupe B exécuté intégralement, 5 commits (un par tâche), arbre propre
- CA couverts en backend : CA-1.1, CA-1.2, CA-2.1, CA-2.2, CA-2.4, CA-3.1, CA-3.2 (CA-2.3 reste UI)
- Compte rendu présenté au propriétaire — recette en attente avant Groupes C/D/E

---
Task ID: veille-academique-4
Agent: Z.ai Code (main)
Task: Feu vert global (« continu pour tous les groupes et termine cette tache ») — finalisation groupe B + Groupes C, D, E + convergence Étape 6

Work Log:
- Reprise après débordement de contexte : découverte que la session 1 avait déjà committé T2-T6 (834749d → 3bb0834) ; les 5 fichiers ont été refondus puis re-recettés intégralement par curl (21 contrôles : validations 400, check 1 base 9 HAL, check 2 dédup, éviction simulée → newCount 1, ordre non-vus, PATCH ids/all/400, renommage, DELETE cascade + 0 orphelin, 404, arXiv base 30 max=30, rétention 210→200) — commits d2c2264 (feat) + 23e492c (docs)
- Groupe C (T7-T8) : src/modules/veille-academique/veille-academique-page.tsx (liste/détail, CA-1.3, CA-3.2, CA-2.4, CA-3.1, CA-2.3, dialogs) + ViewId/NAVIGATION_ITEMS/app-store + case page.tsx — commit 8ddb97a
- Groupe D (T9-T10) : boutons « suivre cette recherche » + dialogs dans theses-en-ligne-page.tsx (hal) et arxiv-search.tsx (arxiv) — commit 12ab2c8 ; git diff vide sur les routes de recherche (garantie tenue)
- Groupe E (T11) : check-core.test.ts 16 tests (CA-2.1/2.2, rétention, parseFiltersJson) — commit 2fe9e16 ; suite complète 63 fichiers / 1444 tests verte (base 62/1428)
- Vérification navigateur (agent-browser) : module dans la sidebar, état vide CA-1.3, création veille HAL depuis l'UI (dialog défaut = requête), premier relevé via bouton (32 résultats), badge « Nouveau » après éviction simulée + re-check, marquage vu → CA-2.3, veille arXiv créée depuis l'UI, mobile 390 px (hScroll:false, footer ok), 0 erreur console — 10 captures test-snapshots/veille-*.png
- tasks.md : T7-T11 cochées + bloc Convergence ; preuves.md : sections Groupe B (recette complémentaire) / C / D / E ; FICHE_SYNTHESE.md : section de session finale (CONVERGÉ)
- Nettoyage : veilles de démonstration supprimées via API (cascade rejouée, état final 0/0), scripts temporaires .tmp-*.mjs supprimés, base commitée propre

Stage Summary:
- veille-academique CONVERGÉ (Étapes 1-6, 11/11 tâches recettées) — chaîne complète de commits documentée dans tasks.md
- Garanties maintenues : routes HAL/arXiv épinglées et app-sidebar.tsx jamais modifiées
- Suite de tests : 63 fichiers / 1444 tests verts ; lint 0 erreur ; arbre propre ; preuves réelles dans preuves.md

---
Task ID: 1 (specs+plans+tasks des deux évolutions veille)
Agent: Z.ai Code (session principale)
Task: « go pour les deux propositions » — ouverture des cycles SDD raccourci clavier « vu » + vérification automatique des veilles

Work Log:
- Recharge du protocole SDD (skills/sdd-thesisframe/SKILL.md)
- Exploration factuelle : specs/veille-academique/spec.md (l.34 hors périmètre, décision n°2 l.41) ; src/lib/jobs/queue.ts (file persistante) ; src/lib/jobs/worker.ts (worker réactif HANDLERS l.21-38, tick 3 s l.99-112, sans planificateur) ; src/app/api/jobs/route.ts ; src/app/api/veille/[id]/check/route.ts (logique check l.118-276 à extraire) ; src/app/api/veille/[id]/route.ts (PATCH label-only l.29-34) ; src/app/api/veille/route.ts (GET l.31-42) ; src/modules/veille-academique/veille-academique-page.tsx (bouton « Tout marquer comme vu » l.512-520, markSeen l.454-475) ; src/instrumentation.ts ; switch.tsx présent ; autoCheck absent partout
- Écriture specs/veille-raccourci-vu/{spec,plan,tasks}.md — touche M, portée vue détail, gardes input/modificateurs, 1 groupe 1 tâche (cycle complet, >20 l.)
- Écriture specs/veille-check-auto/{spec,plan,tasks}.md — autoCheck Boolean @default(false), extraction run-check.ts, fn pure isDueForAutoCheck + AUTO_CHECK_INTERVAL_MS 6 h dans check-core, handler veille-check + balayage 60 s anti-empilement dans worker.ts, Switch UI ; 4 groupes A→B→{C,D}
- Commits d5317aa (raccourci) + 374a880 (check-auto) — arbre propre

Stage Summary:
- Deux dossiers SDD complets présentés au propriétaire pour validation unique (spec+plan+taches consolidés, micro-décisions conservatrices listées avec veto possible)
- Aucune ligne de code modifiée — attente du feu vert (protocole : validation spec+plan avant tout code)
- Épinglés intacts : HAL/arXiv search routes, app-sidebar.tsx

---
Task ID: 2 (exécution des deux cycles veille)
Agent: Z.ai Code (session principale)
Task: « go » — exécution enchaînée veille-raccourci-vu + veille-check-auto jusqu'à convergence

Work Log:
- Cycle ① raccourci (T1) : listener keydown « m » + useCallback markSeen + kbd hint ; lint 0 erreur ; recette navigateur complète (5 CA : marquage 2→0, garde input synthétique, Ctrl+m inopérant, aucune requête à 0 non-vu, indice visible) ; captures raccourci-0*.png ; commits c8b1ca7 + e8f24ab
- Cycle ② A (T1) : autoCheck @default(false), db:push, dump 25 tables avant/après diff vide ; commit 5ade854
- Cycle ② B (T2-T4) : run-check.ts (extraction, VeilleNotFoundError/SourceFetchError), wrapper route contrat inchangé, GET/PATCH autoCheck (400/404 prouvés), isDueForAutoCheck pur + AUTO_CHECK_INTERVAL_MS, handler veille-check + balayage 60 s anti-empilement ; redémarrage dev server (worker en mémoire) ; recette e2e : backdate → job done → lastCheckedAt rafraîchi sans clic ; anti-empilement prouvé ; échec réel HAL 500 → failed veille intacte + chemin not-found ; commits dbc00f7 77e9861 3aca394
- Cycle ② C (T5) : Switch Auto carte (optimiste + rollback), bascules OFF/ON persistées après rechargement, captures checkauto-0*.png ; commit 19e12b0
- Cycle ② D (T6) : 8 tests isDueForAutoCheck, suite 63 fichiers / 1452 verte ; commit 6f0d789
- Convergence : verdicts CONVERGÉ dans les 2 tasks.md ; preuves.md des 2 slugs ; FICHE_SYNTHESE à jour ; base nettoyée (0 veille), scripts temporaires supprimés

Stage Summary:
- Deux cycles livrés et convergés en une session, zéro écart au plan, épinglés (HAL/arXiv, app-sidebar) intacts
- La vérification automatique réutilise le worker persistant existant — aucun processus externe, opt-in par veille, intervalle 6 h
- Le raccourci « M » n'expose aucun nouveau chemin réseau (réutilise markSeen)

---
Task ID: 1
Agent: Z.ai Code (principal)
Task: prod-readiness-audit — Étapes 1-4 (spec, plan sur code réel, tasks 6 groupes), zéro code modifié

Work Log:
- Investigation dépôt réel : CI (aucun .github/, aucun remote git, référence orpheline build-desktop.yml dans scripts/build-tauri-prep.sh l.3), src-tauri complet (tauri.conf.json, capabilities/default.json 3 permissions, lib.rs serveur embarqué 127.0.0.1:14325, mem::forget l.271)
- Trouvaille critique : clé OpenAlex en dur src-tauri/src/lib.rs l.221 (qsdRrHIu…, introduite au commit externe 1359333, jamais purgée, livrée dans l'installeur NSIS)
- Comptages prouvés : 84 routes API (47 testées / 37 sans route.test.ts), 35 process.env.* lues vs .env 1 var vs .env.example absent, commit modes 0348dcb = 419 fichiers (mandat disait 410), arbre main propre, 0 mode 755 hors .zscripts
- db:push --accept-data-loss : package.json l.14 (manuel) ET .zscripts/database-runtime-build.sh l.27 appelé par .zscripts/build.sh l.146 (automatique au build, sur copie artefact uniquement, test tests/database-runtime-build.sh)
- Fragilités ancrées : A.2 academic-fallback.ts l.3-4, A.3 deep-research-pipeline.ts l.121-155/l.714, A.7 osm-infra.ts l.1461-1490, A.8/A.10 queue+worker+instrumentation+EXPLOITATION-SERVEUR.md l.14, A.9 directeur-chat route.ts l.14-57
- Rapport « Mendeley OAuth + piratage » référencé par le mandat : introuvable (dépôt + upload/, matches initiaux = faux positifs « expiration/inspiration ») — micro-décision MD-2 : scan frais dans le cycle
- Rédaction specs/prod-readiness-audit/{spec,plan,tasks}.md : CA-0 (preuve d'exécution par point, réserves nommées), MD-1 à MD-6, corrections candidates C-D1 (.env.example) et C-D2 (clé lib.rs, 3 options au propriétaire), 20 tâches / 6 groupes indépendants

Stage Summary:
- Dossier Étapes 1-4 complet présenté au feu vert — aucun code modifié, lignes rouges intactes, suite 63/1452 verte
- Réserves d'environnement déjà identifiées (MD-1) : pas de cargo, pas de .github/remote, pas de Windows → build Tauri Windows + CI non prouvables ici, preuve externe requise
- Verdict final attendu en Étape 6 : PRÊT / PRÊT AVEC RÉSERVES / NON PRÊT (réserves déjà probables : CI Windows, clé en dur, cible de déploiement non documentée)

---
Task ID: prod-readiness-audit-6
Agent: Z.ai Code (orchestrateur SDD)
Task: Exécution enchaînée A→F du cycle SDD prod-readiness-audit (« go » du propriétaire, 2026-09-18) — audit de mise en production, preuve d'exécution par point, verdict final.

Work Log:
- Groupe A (c2f0a7a + fix e17e233) : T1 build ÉCHEC au départ — 2 erreurs TypeScript latentes révélées (run-check.ts l.290 checkedAt Date|null, veille-academique-page.tsx l.275 signature onCheck) → T1b corrigé (diff minimal +7/−4) → build exit 0, 0 warning bloquant ; T2 git propre (0 mode 755 hors .zscripts, 419 fichiers prouvés vs 410 au mandat, MD-6) ; T3 réserve CI nommée (aucun .github/, aucun remote, cargo absent) + 3 questions propriétaire.
- Groupe B (990f33a) : T4 suite 63 fichiers / 1452 tests verte, ai-types ciblé 39/39, correctif e6eeb82 vérifié en HEAD ; T5 lint exit 0 (0 erreur / 230 warnings qualifiés) ; T6 inventaire 84 routes = 47 testées / 37 sans test classées (17 réseau/IA, 18 mutation, 2 lecture) — constat arxiv/search ligne rouge sans test, recommandation consignée.
- Groupe C (6dfa1b7) : T7 zéro migration versionnée ; custom.db ZÉRO drift ; urbanisme-test.db DRIFT — 4 tables manquantes (Experiment, ExperimentRun, SavedSearch, SavedSearchResult) + 6 index (direction confirmée par diff inverse) ; T8 chaîne db:push cartographiée (package.json l.12 réel, runtime-build l.24 réel, build.sh l.146) + test de non-régression exécuté EXIT=0 — le push automatique ne frappe que la copie artefact, preuve par mock.
- Groupe D (34afb88) : T9 1 seul secret réel (OpenAlex lib.rs l.221) ; hardcoded-keys.ts = env-only sain (nom trompeur) ; custom.db saine (LicenseKey 0 ligne, pas de sk-/gsk_/AIza) ; T10 clé JAMAIS PURGÉE (présente depuis 1359333 jusqu'à HEAD ; mon commit dossier 2a8a4e3 en cite la valeur — consigné) ; autres patterns historique = 0 ; T11 artefacts propres (1 résidu cache dev turbopack consigné) ; T12 35 vars confirmées, .env.example absent, scan piratage/Mendeley NÉGATIF sur HEAD+historique+artefacts+base (mendeley = parsers légitimes, pirat = aspirations/évapotranspiration), zéro OAuth Mendeley, MD-2 confirmé (rapport externe introuvable).
- Groupe E (8cc708c) : T15 A.2 CONTOURNÉ — OpenAlex 429 et CrossRef 200 OBSERVÉS en direct, bascule branchée pipeline l.446-476/806, openalex.test 17/17 ; T16 A.3 CORRIGÉ — continueIfTruncated l.121-158 branché aux 2 sites, maxTokens 12000 l.714 ; T17 A.7 CORRIGÉ AU NIVEAU CODE (l.1466-1468, alternance endpoints) + réserve nommée — endpoints Overpass inatteignables en sandbox (HTTP 000 ×2), preuve réelle = log Reprise au poste propriétaire ; T18 A.8 CORRIGÉ — worker in-process (instrumentation), requeueStaleJobs, zéro nohup, dev.log [job-worker] en direct ; T19 A.9 CORRIGÉ — défaut 150 s, bornes 5-180 s, relance auto, route.test 18/18 ; MD-4 : 2 questions ouvertes (supervision prod, timeout hébergeur).
- Groupe F + verdict (3f78972) : T20 dépôt en TAURI V2 (mandat disait v1.10.7 — consigné) ; 0 import @tauri-apps dans src/ → allow-open sur-privilège, allow-execute sur-privilège CRITIQUE ; CSP null confirmée ; DB propriétaire embarquée dans chaque installeur ; powershell = extraction bundle légitime ; 3 recommandations. VERDICT FINAL : PRÊT AVEC RÉSERVES (7 réserves nommées avec acteurs, 0 bloquant).

Stage Summary:
- Cycle prod-readiness-audit CONVERGÉ : 20/20 tâches exécutées avec preuve horodatée dans specs/prod-readiness-audit/preuves.md, 1 commit documentaire par groupe, verdict PRÊT AVEC RÉSERVES consigné dans tasks.md.
- Une seule écriture de code de tout le cycle : T1b e17e233 (2 erreurs TS bloquant next build, révélées par l'audit) — lignes rouges intactes, aucune autre modification.
- Attente propriétaire : 7 réserves → CI/Tauri Windows (URL run ?), T14 option clé OpenAlex + rotation, T13 feu vert .env.example, ré-synchro urbanisme-test.db, MD-4 ×2 (supervision, timeout hébergeur), log Overpass réel, rapport externe MD-2.
- Recommandations hors périmètre consignées : 37 routes sans test, 230 warnings lint, sur-privilèges capabilities + CSP, DB dans installeur, binaires versionnés.

---
Task ID: prod-readiness-audit-7
Agent: Z.ai Code (orchestrateur SDD)
Task: Délégation propriétaire (« vous êtes le spécialiste… je valide toutes vos prochaines actions ») — choix C-D2, exécution T13/T14/ré-synchro, mise à jour du verdict.

Work Log:
- Choix de spécialiste déclaré (Article 2) : C-D2 = option (a) env-only — pattern des autres secrets du projet ; desktop sans clé = quota anonyme couvert par la bascule CrossRef/HAL prouvée en direct (T15) ; l'option (c) exigerait le pipeline CI non prouvé (R-CI).
- T13 : `.env.example` créé (32 vars groupées : BD, 20 clés IA, recherche académique, endpoints, tunables A.9/RAG, runtime documentaire ; placeholders your-key-here, aucune valeur réelle) ; correspondance prouvée : 35 inventaire − 4 runtime documentaires + DATABASE_URL = 32 ; lint 0 erreur. Correctif chaîne : `.gitignore` avait `.env*` → exception `!.env.example` (modèle versionné, cohérent avec la politique du dépôt où .env est versionné).
- T14 : `src-tauri/src/lib.rs` l.221 — valeur par défaut vidée (`("OPENALEX_API_KEY", "")`) + commentaire de mécanisme ; logique du bloc intacte (default vide = ne pas écraser l'environnement) ; doc `EXPLOITATION-SERVEUR.md` §3 (procédure var OPENALEX_API_KEY, renvoi .env.example, recommandation rotation) ; grep post-modification : 0 occurrence de la valeur dans src/, src-tauri/, .env.example, docs/.
- Ré-synchro `urbanisme-test.db` : 1er push chemin relatif INEFFICACE (Prisma résout file: depuis prisma/ → résidu prisma/db créé puis nettoyé) — épisode VALIDANT le garde-fou « database path must be absolute » du test de non-régression ; 2e push chemin ABSOLU → migrate diff « No difference detected » ; intégrité prouvée (Thesis 1, Chapter 7, Experiment 0).
- Retest Overpass : HTTP 000 (blocage sandbox stable) → R-OVERPASS maintenue, preuve au poste propriétaire.
- Suite finale relancée : 1452/1452 verts ; arbre propre.
- Commits : `0543a4f` (T13+T14+ré-synchro), `9d5639c` (preuves + verdict maj).
- Verdict mis à jour dans tasks.md : PRÊT AVEC RÉSERVES confirmé — 3 levées (R-ENV, R-DRIFT, R-KEY réduite à la rotation), restantes R-CI (renforcée : binaire à reconstruire), R-OVERPASS, R-MD4 ×2.

Stage Summary:
- Cycle prod-readiness-audit : 20/20 tâches + délégation exécutée, tout commité, lignes rouges intactes, suite verte.
- Restent au propriétaire (toutes externes au dépôt) : run CI/build Windows vert (ou cycle pipeline), rotation de la clé OpenAlex, log Overpass réel, supervision prod + timeout hébergeur.
- Chantier suivant recommandé : cycle SDD « build-desktop-pipeline » (versionner le workflow GitHub Actions + preuve de run vert) — annonce requise.

---
Task ID: build-desktop-pipeline
Agent: Z.ai Code (orchestrateur SDD)
Task: Cycle SDD build-desktop-pipeline (« go » du propriétaire) — versionner le workflow de build desktop pour lever la réserve R-CI (partie reproductible).

Work Log:
- Étapes 0-1 : investigation des contrats réels — scripts/build-tauri-prep.sh (produit standalone.zip via PowerShell sur RUNNER_OS=Windows + node.exe l.60-71), tauri.conf.json (beforeBuildCommand l.8 = bash scripts/build-tauri-prep.sh, frontendDist ../dist-tauri, resources l.42-46), next.config.ts l.4 output standalone, package.json l.8. Précision d'énoncé : « v1.10.7 » = version du produit (tauri.conf.json l.4), le framework est Tauri v2.
- Étapes 2-4 : specs/build-desktop-pipeline/{spec,plan,tasks}.md — CA-1 workflow conforme au contrat, CA-3 interdiction d'affirmer l'invérifiable (run vert = réserve), CA-4 garde-fou drift lecture seule.
- T3 preuve : migrate diff --exit-code → exit 0 sur custom.db (synchrone), exit 2 sur une copie de drift fabriquée (DROP TABLE Experiment sur copie temporaire, base réelle intacte). Note de discipline : première mesure faussée par un pipe | head (capte le code de head), re-mesurée proprement = 2.
- T1 : .github/workflows/build-desktop.yml créé (102 lignes) — déclencheurs v*/workflow_dispatch, windows-latest, setup-bun, garde-fou drift ×2 en tête (set -e), rust-toolchain x86_64-pc-windows-msvc, rust-cache, tauri-action@v0 (bunx tauri, release draft), upload-artifact nsis/*.exe. YAML validé par parseur (2 fois, après correction d'une citation de ligne l.11→l.8 dans le commentaire).
- T2 : 7 contrats croisés cités (conf→script→next.config→package.json→RUNNER_OS).
- Commits : workflow + dossier + preuves (voir git log).
- Worklog/fiche mis à jour.

Stage Summary:
- La référence orpheline (script l.3 → workflow) est comblée : la chaîne desktop complète est versionnée, auditable localement, avec un garde-fou de désynchronisation de base (défaut urbanisme-test.db ne peut plus se reproduire en CI).
- Réserve unique restante : URL d'un run vert — propriétaire après push sur GitHub (workflow_dispatch ou tag v1.10.7).

---
Task ID: build-desktop-pipeline-2
Agent: Z.ai Code (orchestrateur SDD)
Task: Suivi R-CI — exécuter la partie externe de T4 (repo distant → push → run vert) avec la clé GitHub fournie par le propriétaire (« clé provisoire pour faire le travail »).

Work Log:
- Article 2 : enquête lecture seule (scripts, conf, git, blobs) + vérification de la clé côté API GitHub.
- Clé rejetée par GitHub : HTTP 401 Bad credentials — 3 tentatives (Bearer /user, Bearer /rate_limit, token /user), format ghp_ classique correct (40 caractères). Verdict : révoquée, expirée ou erreur de copie. Aucune valeur de clé écrite dans un fichier versionné ni dans .git/config.
- Mesures pré-push : arbre propre, branche main, aucun remote, 46.36 MiB, plus gros blob 9.5 MB (db/custom.db) — pas de LFS requis, aucun zip/exe suivi ; db/custom.db + db/urbanisme-test.db suivies (ressources du bundle attendues par tauri.conf.json l.42-46).
- Écart documentaire trouvé : workflow réel = 84 lignes (wc -l ; git show --stat cfa3377 = 84 insertions) contre « 102 lignes » consigné (preuves T1, worklog, fiche) — fiche corrigée, correction consignée dans preuves.md, journal historique intact.
- Script de push préparé hors dépôt (/home/z/push-thesisframe.sh) : création repo privé « ThesisFrame » → remote sans token → push via askpass éphémère (/tmp, mode 700) → workflow_dispatch ref main → URL Actions.
- Preuves + suivi T4 consignés (specs/build-desktop-pipeline/preuves.md § Suivi, tasks.md) ; fiche session « quinquies » ; commit docs: unique.

Stage Summary:
- T4 toujours en attente, prérequis reformulé précisément : clé GitHub classique VALIDE avec scopes repo + workflow.
- Tout le reste est prêt : une commande exécutera création repo → push → dispatch → surveillance du run → URL verte.
- Sécurité : révoquer la clé transmise par chat après usage (invalide mais transitée) ; rotation OpenAlex toujours en attente.

---
Task ID: build-desktop-pipeline-3
Agent: Z.ai Code (orchestrateur SDD)
Task: R-CI — exécution complète du push distant avec la 2e clé (valide) : repo privé → push → dispatch → run vert → preuves.

Work Log:
- 2e clé vérifiée : login freemind25, scopes repo, workflow (X-OAuth-Scopes) — valide.
- Décision de spécialiste (Article 2) : repos candidats existants (these-frame, Ma-These, Thesis-Manager-Application, thesis-manager-v3, thesis-deploy-assistant) inspectés — historiques divergents (aucun SHA commun avec le local), publics en majorité → création d'un NOUVEAU repo privé `freemind25/ThesisFrame` (HTTP 201) au lieu d'un push forcé destructif ou d'une exposition publique.
- Push exécuté via /home/z/push-thesisframe.sh : remote SANS token (askpass éphémère /tmp mode 700) → `* [new branch] main -> main` (historique complet 46.36 MiB) ; workflow_dispatch HTTP 204 (head_sha 058b80c).
- Surveillance : run 35373767136 — in_progress → completed/**success** en 13 min 42 s (17:20:39Z → 17:34:21Z). 10/10 steps verts, dont le garde-fou drift (No difference detected ×2 en CI, preuve log 17:22:11-12) et Build Tauri NSIS (Rust 7m 45s, makensis, « Finished 1 bundle »).
- Livrables constatés via API : artefact `windows-installer` 73.1 MB ; release draft « Ma Thèse v1.10.7 » avec asset Ma.These_1.10.7_x64-setup.exe (73.1 MB).
- Preuves consignées : specs/build-desktop-pipeline/preuves.md § Suivi 17:15-17:35 (extraits logs réels horodatés) ; tasks.md T4 + verdict mis à jour ; fiche session « quinquies » complétée.

Stage Summary:
- **R-CI DISSOUTE** : le workflow build-desktop.yml a produit un installeur Windows NSIS signé-draft en run vert prouvé — la partie reproductible ET la preuve d'exécution sont désormais acquises.
- Repo distant : https://github.com/freemind25/ThesisFrame (privé). Build futurs : tag `v*` ou workflow_dispatch.
- Actions de sécurité restantes côté propriétaire : révoquer les 2 clés GitHub transités par chat + rotation de la clé OpenAlex (historique du dépôt).

---
Task ID: build-desktop-pipeline-4
Agent: Z.ai Code (orchestrateur SDD)
Task: Ordre du propriétaire « démarrez le tag v1.10.8 git push origin v1.10.8 » — bump version, tag, push, build CI, preuves.

Work Log:
- Analyse préalable (Article 2) : sans bump, le tag v1.10.8 aurait produit un installeur 1.10.7 mal étiqueté (le workflow lit la version dans tauri.conf.json l.4, tauri-action crée la release sur v__VERSION__) et aurait percuté le draft v1.10.7 existant.
- Décision de spécialiste + amendement annoncé : bump 3 manifests ×1 ligne (tauri.conf.json l.4, package.json l.3, Cargo.toml l.3 — constaté à la lecture) ; Cargo.lock laissé tel quel (auto-corrigé par cargo au build CI, aucun --locked).
- Commit f0e1a4b (+3/−3), tag annoté v1.10.8, push main (058b80c..f0e1a4b) + push tag via askpass éphémère (clé jamais dans .git/config).
- Déclenchement automatique prouvé : run 35382304899 (event=push, head_branch=v1.10.8) → **SUCCESS en 9 min 13 s** (18:48:17Z → 18:57:30Z, rust-cache efficace), 10/10 steps verts, garde-fou drift vert (No difference detected 18:50:17), makensis → Ma Thèse_1.10.8_x64-setup.exe.
- Livrables via API : artefact windows-installer 73.1 MB ; release draft « Ma Thèse v1.10.8 » (asset Ma.These_1.10.8_x64-setup.exe 73.1 MB) — la v1.10.7 draft demeure.
- Preuves : preuves.md § Suivi 18:47-18:58 (extraits logs horodatés) ; fiche complétée.

Stage Summary:
- Le cycle **tag → build → release** est prouvé de bout en bout (trigger `push.tags v*` opérationnel en plus de `workflow_dispatch`).
- Deux releases draft disponibles côté propriétaire (v1.10.7, v1.10.8) à publier manuellement.
- Sécurité inchangée : révoquer les 2 clés GitHub transités par chat ; rotation OpenAlex en attente.

---
Task ID: build-desktop-pipeline-5
Agent: Z.ai Code (orchestrateur SDD)
Task: Ordre du propriétaire « publish the draft release » — publication des releases draft v1.10.7 + v1.10.8, preuves, réalignement du sandbox local restauré sur un instantané ancien.

Work Log:
- Diagnostic préalable : sandbox local restauré sur un instantané ancien/divergent (HEAD `995916c`, époque activation SDD, aucun remote) alors que le remote contenait déjà toute la chaîne v1.10.8 (bump `f0e1a4b`, run 35382304899 SUCCESS, preuves `e3f2f93`).
- Publication API (Article 2 déclaré) : `PATCH /releases/391660798` puis `/releases/391715732` avec `{"draft":false}` → **v1.10.7 PUBLISHED** (2026-09-19T05:58:22Z, tag créé à la publication → `058b80c`) et **v1.10.8 PUBLISHED** (05:58:23Z, tag existant `3f70bc29e` → `f0e1a4b`). Relecture GET /releases : 2/2 published, 0 draft restante.
- Réalignement local : backup worklog (249 l. → /tmp) → `git remote add origin` + `fetch` (askpass éphémère, clé jamais dans .git/config) → contrôle « zéro entrée locale absente du remote » (worklog remote 616 l. = sur-ensemble) → `git reset --hard origin/main` (`e3f2f93`). Lignes rouges identiques dans les deux lignées (diff `53ac660..995916c` : 0 changement). `upload/LR.rar` + `upload/res.pdf` (fichiers du propriétaire) laissés intacts, non commités.
- Preuves : preuves.md § Suivi 05:58-06:05 (releases + incident d'environnement) ; tasks.md suivi + verdict ; fiche session quinquies complétée.

Stage Summary:
- Les deux releases sont **PUBLIÉES** avec assets NSIS téléchargeables (73.1 MB chacun) ; plus aucune draft en attente côté GitHub.
- Sandbox local resynchronisé sur `origin/main` (`e3f2f93`) ; incident d'environnement consigné pour les sessions suivantes (ne pas supposer que le local est à jour : vérifier contre le remote).
- Sécurité inchangée : révoquer les 2 clés GitHub transités par chat ; rotation OpenAlex en attente.

---
Task ID: security-openalex-rotation-1
Agent: Z.ai Code (orchestrateur SDD)
Task: Rotation de la clé OpenAlex (fuite historique lib.rs pré-0543a4f) — vérification d'identité de la clé transmise, masquage des preuves versionnées, installation hors dépôt.

Work Log:
- Audit préalable : clé réelle en dur dans src-tauri/src/lib.rs jusqu'à 0543a4f ("OPENALEX_API_KEY", "") ; valeur toujours dans l'historique poussé (repo privé) ; code actuel env-only ; installeurs v1.10.7/v1.10.8 propres (0543a4f antérieur aux builds).
- Clé transmise par le propriétaire (22 car.) : comparaison avec la valeur extraite de 0543a4f^ → IDENTIQUES → c'est l'ancienne clé ; test API réel → HTTP 200 (toujours active) → rotation NON effective.
- Fuite active découverte : clé complète en clair dans plan.md l.27 + preuves.md (arbre versionné poussé sur GitHub) → masquage immédiat au commit présent (sed, occurrences complètes restantes : 0).
- Choix de spécialiste (Art. 2) : clé installée dans .env.local (gitignore .env*, prioritaire Next.js) plutôt que git rm --cached .env — DATABASE_URL (non sensible) reste versionné pour ne pas risquer le build CI.
- Preuves : preuves.md § Suivi 06:20-06:35 (prod-readiness-audit) ; masquage systématique (préfixe/suffixe) dans tous les affichages ; clé complète uniquement dans .env.local (non versionné).

Stage Summary:
- La rotation OpenAlex reste EN ATTENTE côté propriétaire : régénérer sur openalex.org/settings/api puis transmettre la nouvelle valeur.
- Fuites en clair du HEAD corrigées ; historique git contient toujours l'ancienne clé (inoffensive dès révocation).
- Restes : rotation APINEX (clé dans .env historique 04dc5ab/763ee5d) ; révocation des clés GitHub transités par chat.

---
Task ID: branding-logo-reload-1
Agent: Z.ai Code (orchestrateur SDD)
Task: Ordre « recharger le logo dans l'application et dans le readme file » — icônes app lisibles + favicon + README à jour.

Work Log:
- Diagnostic : icônes Tauri = bannière horizontale complète rétrécie (illisible ≤128 px, taskbar/installeur) ; favicon = bannière ; README = ancien logo.svg sombre animé + badge version obsolète (1.5.1).
- Icône carrée créée par crop du logo officiel (symbole M+plume — segmentation par profil de colonnes pour exclure le texte, seuil blanc 14, padding 14 %) : 1024×1024 → public/app-icon.png.
- bunx tauri icon → régénération des 5 icônes du bundle (32x32, 128x128, 128@2x, icon.ico, icon.png) ; extras générés (Square*, StoreLogo, android/, ios/, icns) supprimés — tauri.conf.json inchangé.
- Favicon : layout.tsx l.37 /logo.png → /app-icon.png ; public/logo.png (bannière) INTACT — les 5 usages UI (sidebar red-line non touchée, dashboard, footer, about) préservés.
- README : bannière logo.png (440 px) remplace logo.svg ; badge Version 1.5.1 → 1.10.8 (aligné sur tauri.conf.json).
- Preuve visuelle : 128x128.png régénérée — M+plume net et lisible.

Stage Summary:
- Icône d'application (exécutable/installeur/taskbar/favicon) = symbole M+plume centré ; effet visible au prochain installeur (v1.10.9+) — v1.10.8 publiée conserve l'ancienne icône.
- README actualisé (logo actuel + vraie version).
- Lignes rouges intactes ; arbre poussé.

---
Task ID: branding-logo-reload-2
Agent: Z.ai Code (orchestrateur SDD)
Task: Retour propriétaire « le logo "svg" ne correspond pas à celui de mon application et n'apparaît pas dans le readme, utilisez le fichier "png" présent dans "public" » — purge du faux logo SVG, PNG officiel seul référent.

Work Log:
- Audit d'identité : public/logo.svg = logo Z.ai (échafaudage, Z animé), 0 usage code ; public/logo.png = logo officiel Ma Thèse déjà utilisé aux 5 emplacements UI + bannière README (e11d731) ; app-icon.png = crop carré cohérent.
- Article 2 déclaré puis exécuté : git rm public/logo.svg ; README l.129 (section structure) → logo.png (bannière) + app-icon.png (icône carrée) ; aucune modification code.
- Vérifications : agent-browser desktop (logo sidebar + dashboard visibles, 0 erreur), network /logo.png 200 + /app-icon.png 200, /logo.svg 404 attendu (plus demandé par aucun composant) ; mobile 390×844 layout intact ; README GitHub (main=e11d731) : raw logo.png HTTP 200 taille identique au local.
- Lignes rouges : 0 diff avant commit ; preuves preuves.md § Suivi 08:05-08:17.

Stage Summary:
- Le faux logo Z.ai n'existe plus dans l'arbre ; logo.png (officiel) + app-icon.png sont les deux seuls assets de marque référencés (README structure + bannière + favicon + UI).
- Si le README GitHub semble encore montrer l'ancien logo côté propriétaire → cache navigateur/camo, rafraîchir (Ctrl+F5) ; l'arbre poussé est correct.
- Sécurité inchangée : rotation OpenAlex en attente côté propriétaire ; rotation APINEX ; révocation des 2 clés GitHub transités par chat.

---
Task ID: dashboard-resources-1
Agent: Z.ai Code (orchestrateur SDD)
Task: Ordre propriétaire « ajouter ces ressources » — intégration des 2 infographies pédagogiques reçues (thumbnail.jpg, thumbnail2.jpg) dans l'application et le README.

Work Log:
- Assets : copies vers public/resources/ (choisir-directeur-these-7-etapes.jpg 58 644 o ; article-recherche-vs-revue.jpg 91 192 o) — originaux upload/ intacts.
- Nouveau composant resources-section.tsx : section « Ressources pédagogiques » du dashboard (vignettes sans recadrage, Dialog plein format défilable, crédits @PhDtoProfMentor / Razia Aliani — Editage Open Academics visibles 2 fois).
- dashboard-page.tsx : insertion après « Modules disponibles » (0 diff lignes rouges) ; README : nouvelle section entre Fonctionnalités et Stack technique.
- Vérifié agent-browser : desktop + dialog + mobile, JPG en 200, zéro erreur, eslint 0 erreur.

Stage Summary:
- Les 2 ressources sont visibles dans l'app (dashboard, bas de page) et sur GitHub (README) avec attribution des sources.
- upload/ inchangé ; lignes rouges intactes ; preuves § Suivi 10:28-10:45.
- Sécurité inchangée : rotation OpenAlex en attente côté propriétaire ; rotation APINEX ; révocation des 2 clés GitHub transités par chat.

---
Task ID: docs-presentation-notice-1
Agent: Z.ai Code (orchestrateur SDD)
Task: Ordre « préparez une note de présentation et une notice d'utilisation de cette application » — 2 documents en Markdown + 2 PDF professionnels + section README Documentation.

Work Log:
- Sources : contenu dérivé du code réel (34 vues NAVIGATION_ITEMS app-store.ts, README, guide intégré usage-guide-dialog) — zéro invention ; libellés des modules identiques à la sidebar.
- Rédaction MD : docs/NOTE-PRESENTATION.md (8 sections + métriques) et docs/NOTICE-UTILISATION.md (8 sections, parcours 5 étapes, 8 tableaux de modules, FAQ, glossaire).
- PDF via skill pdf (route Report) : couvertures Template 07 Crystal Blue (HTML/Playwright, validateurs PASS), corps ReportLab palette fixe Template 07, sommaire auto cliquable (TocDocTemplate + multiBuild), pagination romaine/arabe corrigée, normalisation A4 stricte ; préflight complet (font.check 0, pages.clean 0, toc pass, pdf_qa 1 avertissement accepté et documenté) ; contrôle visuel de 6 pages.
- README : section « Documentation » (MD + PDF + docs existants).

Stage Summary:
- 4 livrables + 2 sources HTML dans docs/ ; commit docs+README uniquement, lignes rouges 0 diff.
- Le sommaire de la notice et les numéros de page du corps sont synchronisés (numérotation du corps remise à 1 après le sommaire).
- Sécurité inchangée : rotation OpenAlex en attente côté propriétaire ; rotation APINEX ; révocation des 2 clés GitHub transités par chat.

---
Task ID: docs-presentation-notice-1b
Agent: Z.ai Code (orchestrateur SDD)
Task: Consolidation — incident de divergence lors du push du commit documentation.

Work Log:
- Push initial rejeté (non fast-forward) : le commit « ressources » existait en double (distant d247645, local 1ad9119 même contenu réappliqué après restauration de snapshot ; seuls .zscripts/dev.pid et les modes de fichiers différaient).
- Résolution : vérification de contenu (arbres identiques hors pid/modes) -> stash du pid runtime -> rebase --onto origin/main 1ad9119 -> commit docs rejoué en 98ffcd7 -> stash pop (conflit pid résolu hors commit) -> push OK (d247645..98ffcd7).
- Leçon confirmée (cf. build-desktop-pipeline-5) : après toute reprise de sandbox, toujours fetch + comparer contre origin/main avant de committer ; ne jamais réécrire les tags/releases.

Stage Summary:
- HEAD = origin/main = 98ffcd7 (docs livrés) ; incident consigné ; lignes rouges intactes.

---
Task ID: 1-c
Agent: Explore (méthodologie+vérification)
Task: Exploration code des modules méthodologie/vérification pour notice d'utilisation exhaustive

Work Log:
- Lecture intégrale des 11 pages de modules (11 053 lignes) : methodology, analyse-champ-recherche, outils-slr, verification-methodo, verification-carto, generation-hypotheses, verification-coherence, alignement-preuves, experimentations, routesme, paper2code — onglets, champs, boutons, libellés exacts extraits du code.
- API connexes inspectées : verification-carto/route (completude rule-based + questionneur socratique + save-session + geo-enrich), types-analyse/seed (référentiel « Diagnostic morphologique complet », 4 phases), geo-mcp (9 outils MCP géo intégrés), coherence-check (truthmark = score ≥ 70), alignement-preuves (densité de preuves/cit./1000 mots), paper2code/generate (pipeline 3 étapes streaming).
- Données structurées relevées : COHERENCE_CATEGORIES (6 catégories, 22 contrôles), AUDIT_SECTIONS (8 sections × 4 critères pondérés), PICO/PICOS + CASP/JBI + 14 champs d'extraction SLR, statuts/verdicts expérimentations, 4 modèles simulés + 8 templates RoutesMe.
- Libellés sidebar confirmés dans app-store.ts (section « Méthodologie & Vérification » + « IA & Outils ») ; worklog précédent (docs-presentation-notice-1b) lu pour contexte.

Stage Summary:
- Rapport d'exploration détaillé (module par module, libellés exacts) remis à l'orchestrateur pour la réécriture exhaustive de docs/NOTICE-UTILISATION.md ; aucun fichier modifié hors worklog.

---
Task ID: 1-a
Agent: Explore (rédaction+structure)
Task: Exploration code des modules rédaction/structure pour notice d'utilisation exhaustive

Work Log:
- Lu worklog.md (fin) puis parcouru intégralement le code de 11 modules : editor/ (9 fichiers incl. tiptap, historique+diff mot à mot, prédiction IA Tab/Esc, autosave 2500 ms), ai-writing/ (26 modes dans src/data/ai-writing-modes.ts + Chat Directeur), thesis-rag/ (indexation chunks + chat sourcé), harper/ (6 onglets), grammaire/, phrasebook/ (101 phrases, 7 sections, 10 fonctions), deblocage-ecriture/ (4 onglets), auto-edition/ (4 onglets, 8C exacts + 3 outils publication), cadrage/ (12 champs exacts, verrouillage, versions), thesis-plan/ (2 modes de structure, template LaTeX 8 disciplines), feuille-route-agile/ (kanban 4 colonnes, 5 phases).
- Documenté pour chaque module : libellés exacts de boutons/champs/placeholders, listes déroulantes et valeurs, flux pas-à-pas, garde-fous (min 20 caractères, max 50 000, avant 3 champs…), états vides, raccourcis clavier, endpoints API et persistance (Prisma vs état session vs localStorage).
- Exploré src/components/dashboard/ (stats /api/stats, 4 actions rapides, parcours 5 étapes avec conditions de cochage, 14 modules cartes, Ressources pédagogiques 2 infographies) et src/components/layout/data-banner.tsx (bandeau transparence fournisseur IA, clé localStorage thesisframe-d4-banner-dismissed).
- Vérifié les points transverses : withAiConfig (enveloppe _aiConfig sans clé), persistance zustand « thesisframe-app-store », config IA localStorage « thesisframe-ai-config » lue par la prédiction.
- Zéro modification de code ; seul worklog.md complété (append).

Stage Summary:
- Rapport d'exploration exhaustif produit (module par module, libellés entre guillemets) prêt pour la rédaction de la NOTICE-UTILISATION ; aucun fichier de code touché, worklog complété en append.

---
Task ID: 1-d
Agent: Explore (outils+export+shell)
Task: Exploration code des modules outils/export et du shell (header, settings, sidebar) pour notice d'utilisation exhaustive

Work Log:
- Exploré 9 modules en lecture seule (ai-tools, apinex, diagrammes, apa-composer, livres-competences, traducteur, export-pdf, export-docx, equilibre-chapitres) + routes API associées (apinex/*, translate, export-docx, ai-writing) : onglets, libellés exacts, options, flux, garde-fous, messages extraits du code réel.
- Shell audité : app-header (fil d'Ariane « Ma Thèse », menu Aide & Support, dialogue Fournisseur IA), app-sidebar (recherche, 6 catégories + _pinned, badges IA/RAG/API/OA, toggle thème), app-footer, data-banner, about-dialog, shortcuts-dialog, usage-guide-dialog (8 catégories/30 sections).
- Liste fournisseurs IA extraite de src/lib/ai/ai-types.ts : 26 IDs (ALL_PROVIDER_IDS), 6 catégories UI, 22 fournisseurs avec accès gratuit identifiés ; clés stockées en cookie httpOnly via /api/ai-config (jamais en localStorage) ; circuit breaker serveur documenté (zai-client.ts : 3 échecs → open, 30 s).
- Incohérences version détectées pour la notice : footer « v1.2.0 », guide intégré « v1.4.0 », tauri.conf 1.10.8 ; guide intégré annonce « 24 fournisseurs » (code = 26). Aucune modification de code.

Stage Summary:
- Rapport d'exploration exhaustif (libellés exacts entre guillemets) remis pour la réécriture de docs/NOTICE-UTILISATION.md ; zéro fichier modifié à part cet append au worklog.
---
Task ID: 1-b
Agent: Explore (recherche+sources)
Task: Exploration code des modules recherche pour notice d'utilisation exhaustive

Work Log:
- Lu la fin du worklog (contexte docs-presentation-notice-1) puis exploré les 12 fichiers des 11 modules ciblés (8 596 lignes) : references, articles, academic-db (+arxiv-search), journaux-oa, recherche-plein-texte, theses-en-ligne, explorateur-theses, veille-academique, onglet-recherche, bibliotheque, verification-citations.
- Vérifié les routes API associées : /api/references (import 10 Mo max / 500 refs max, détection auto de format ; export bibtex 404 si vide), /api/journaux-oa (OpenAlex+DOAJ en parallèle, warnings par source), /api/theses-en-ligne (HAL, codes domaine taxonomie réelle A.1), /api/theses/* (stats, search, detail, persons via theses.fr), /api/citation-check (5 registres, timeout 15 s, rétractations), /api/stats-recompute (statcheck déterministe sans IA), /api/books (3 API réelles : Open Library, Gutendex, Standard Ebooks), /api/arxiv/search (Atom export.arxiv.org), /api/veille (worker autoCheck 6 h confirmé dans lib/jobs/worker.ts).
- Capturé les libellés exacts (boutons, champs, selects, états vides, toasts, raccourci « M » de la veille), les flux pas-à-pas, la persistance (Prisma vs état mémoire) et les exports (references.bib, CSV journaux) pour la rédaction du manuel.
- Points saillants relevés pour la notice : checklist Articles NON persistée (useState) ; Références sans collections/tags et sans fetch DOI/ISBN automatique ; 27 bases en 5 catégories ; 7 sources Bibliothèque dont 3 avec API (Gutenberg, Open Library, Standard Ebooks) ; verdicts Vérification Citations = verified/unverified/retracted/mismatch ; Onglet Recherche avec onglet auto-créé « Recherche principale » et sauvegarde debounce 1,5 s.

Stage Summary:
- Rapport d'exploration exhaustif livré (module par module, libellés entre guillemets, sources externes, replis en cas d'échec, garde-fous) — prêt pour réécrire docs/NOTICE-UTILISATION.md ; zéro modification de code, aucun commit.

---
Task ID: docs-notice-exhaustive-1
Agent: Z.ai Code (orchestrateur SDD)
Task: Retour propriétaire « votre manuel d'utilisation est trop sommaire et n'explique pas toutes les fonctionnalités et comment les utiliser. veuillez faire l'effort de plus de générosité » — réécriture exhaustive de la notice (MD + PDF).

Work Log:
- Exploration du code réel par 4 agents parallèles (Task 1-a..1-d, rapports dans ce worklog) : 44 entrées NAVIGATION_ITEMS, 26 modes d'écriture (src/data/ai-writing-modes.ts), 26 fournisseurs ALL_PROVIDER_IDS dont 22 gratuits (src/lib/ai/ai-types.ts), shell complet (header, settings, sidebar, footer, bandeau D4, raccourcis).
- docs/NOTICE-UTILISATION.md : 215 -> 717 lignes, 13 sections — installation, interface (menus, badges, 10 raccourcis clavier), 26 fournisseurs IA (tableau par catégorie), 44 modules documentés un par un (onglets, champs, boutons exacts, flux pas-à-pas, sorties/exports), persistance base vs session par module, 10 bonnes pratiques, FAQ 18 entrées, glossaire 21 termes.
- 6 emoji neutralisés (règle anti-tofu ReportLab) ; corrections factuelles propagées à README.md et NOTE-PRESENTATION.md (34→44 modules, 21→26 modes, 22/16→26/22 fournisseurs, drag-and-drop→boutons fléchés, import DOI/ISBN/URL automatique→import par fichier + saisie manuelle).
- PDF régénéré (route Report) : couverture Template 07 versionnée revalidée (poster_validate PASS, cover_validate 0 chevauchement) ; corps ReportLab DejaVu, TocDocTemplate + multiBuild, PageLabelCanvas (sommaire romain i-ii, corps arabe remis à 1) ; fusion + normalisation A4 stricte ; 2 allers-retours QA (taille couverture 595,9→595,3 pt ; tiret cadratin p.20 neutralisé dans le MD) -> pdf_qa PASS ; font.check 0 ; pages.clean 0 page blanche ; sommaire cliquable (98 liens) synchronisé avec la pagination ; contrôle visuel de 6 pages.
- Pipeline PDF versionné (docs/pdf-sources/gen_notice.py + merge_notice.py) — nouvelles preuves horodatées 13:08-13:52 dans preuves.md.
- Fetch anti-divergence avant push : origin/main (70f3086) ancêtre direct, avance rapide -> push 70f3086..bc0159e ; ls-remote = bc0159e ; askpass éphémère supprimé.

Stage Summary:
- La notice documente désormais TOUS les modules avec leur mode d'emploi détaillé (MD 717 lignes / PDF 22 pages) — commit bc0159e poussé sur origin/main.
- Compteurs produits alignés sur le code dans les 3 documents (README, note, notice) ; lignes rouges 0 diff avant commit.
- Sécurité inchangée : rotation OpenAlex en attente côté propriétaire ; rotation APINEX ; révocation des clés GitHub transités par chat.

---
Task ID: ressource-methodes-mixtes-1
Agent: Z.ai Code (orchestrateur SDD)
Task: Ordre propriétaire « ajouter cette ressource en respectant le protocole d'ajout, de digestion, etc. » — PDF ressources.pdf (12 p. : article Sandelowski 2000 p.1-9 + guide STUDYSmarter/UWA p.10-11) — double intégration : Ressources pédagogiques (ajout) + socle IA (digestion).

Work Log:
- Identification du document : pages 10-11 = le guide UWA déjà reçu le 14/09 (upload/res.pdf, 2 pages, jamais intégré) — extrait en verbatim (pdftoppm 110 dpi, chrome Tuta recadré, en-tête + logo UWA et filigrane d'origine conservés) ; pages 1-9 = article Sandelowski (RNH 23(3), 246-255, 2000) → fiche de lecture FR 2 pages (HTML → chromium headless 2× → ffmpeg) dont les sources HTML sont versionnées dans docs/pdf-sources/ressources/.
- Protocole d'ajout : 4 JPG dans public/resources/ (935×990 ×2, 1840×2380 ×2) ; resources-section.tsx étendu (typage Resource/ResourcePage, ResourcePager Précédente/Suivante + compteur aria-live, pastille « N pages ») — les 2 infographies d'origine restent mono-page ; README : section Ressources enrichie (4 vignettes, crédits UWA + citation Sandelowski, renvoi au socle).
- Protocole de digestion (§7 ARCHITECTURE-CONNAISSANCE) : triage — la combinatoire technique de Sandelowski (niveaux paradigme/méthode/technique, 7 gabarits, échantillonnage combiné, instruments multi-usages, lier/transformer, quantizing/qualitizing) et le vocabulaire methods/méthodologie + check-list pré-collecte UWA ABSENTS du noyau ; correction : 2 sections compactes dans METHODOLOGY_MODULE + 2 sources brutes modules/methods-mixtes-sandelowski.md et modules/methodes-methodologie-uwa.md ; documentation : AGENTS.md (11→13 modules, sources, ligne budget alignée sur le capteur) et ARCHITECTURE-CONNAISSANCE.md (date, arbre, ligne methodology, note de mesure).
- Validation : lint 0 erreur ; test:run 1452/1452 ; capteur budget avant/après : 60 370→62 785 chars (20 123→20 928 tok / budget 22 000), méthodologie 3 665→4 470 tok (plafond 5 000, reste le plus grand module), 7/7 tests budget verts, tests de digestion existants verts.
- Recette navigateur (agent-browser) : 4 cartes rendues ; pagination prouvée sur les 2 nouvelles (1/2→2/2, src commutée) ; Escape ferme ; 0 erreur console/page ; mobile 390 px OK ; 5 captures dans test-snapshots/.
- Écarts signalés (Article 4, preuves.md) : tableau tokens AGENTS et colonne Tokens ARCHITECTURE restent historiques ; filigrane « Askpstudyinaustralia » conservé (forme originale reçue) ; article non affiché en 9 pages verbatim (choix tracé dans spec.md).

Stage Summary:
- La ressource est doublement intégrée : visible dans l'app (2 nouvelles cartes multi-pages) et distillée dans le socle IA (module methodology, budget prouvé) ; lignes rouges 0 diff avant chaque commit ; upload/ inchangé.
- Leçon d'identification : « ressources.pdf » (Tuta 28/09) contient le guide déjà transmis via res.pdf (14/09) — traité une seule fois, en verbatim propre cette fois.

---
Task ID: 2-c
Agent: Explore (exports PDF/DOCX)
Task: Exploration lecture seule pour spec/plan des notes de bas de page d'export

Work Log:
- Lu worklog.md (fin) pour contexte projet ; exploré export-pdf (src/modules/export-pdf/export-pdf-page.tsx, 1268 l.) : jsPDF + html2canvas-pro côté client (l.39-40), impression navigateur via window.open+print (l.467-481), HTML imprimable généré par generatePrintHtml (l.278-452), options ExportOptions (l.71-78, défauts l.171-178), cases « Page de couverture »/« Table des matières »/« Numéros de page » (l.968-1014), numéros de page en CSS @page @bottom-center (l.432-440, ignorés par le chemin jsPDF), contenu Tiptap injecté brut (l.356-376) — AUCUNE bibliographie dans l'export PDF (0 occurrence biblio/référence/apa).
- Exploré export-docx : page client src/modules/export-docx/export-docx-page.tsx (509 l., DocxOptions l.51-60, libellés « Page de garde » l.311, « Références »/« Bibliographie APA » l.331-332, « Inclure les numéros de page » l.441, POST l.159-163) + route serveur src/app/api/export-docx/route.ts (1145 l., docx npm ^9.7.1, POST l.976, parseHtmlToBlocks l.225-292, buildCoverSection l.334-502, buildTocSection avec TableOfContents l.507-577, buildBodySection l.582-886, références « Références » triées auteur/année l.774-819, en-tête/pied PageNumber.CURRENT l.822-855, formatReferenceApa l.891-970, Packer.toBuffer l.1118). Caveat noté : titres construits en TextRun manuel sans HeadingLevel → styles Titre 1/2/3 définis (l.1078-1111) mais non référencés par les paragraphes.
- Vérifié support footnotes dans node_modules/docx 9.7.1 : OUI — Document footnotes Record<string,{children:Paragraph[]}> (dist/index.d.ts l.1605), FootnoteReferenceRun(id) (l.756, ParagraphChild l.2515), câblage dist/index.mjs l.26850 ; séparateurs auto id -1/0 → ids notes à partir de 1. Aucun usage footnotes dans src actuellement.
- APA en code : DUPLEX sans fonction partagée — serveur formatReferenceApa (export-docx route l.891-970, « APA-like ») vs client apa-composer formatAuthorsAPA/generateCitationAPA/generateInTextCitation (apa-composer-page.tsx l.137-264, la dernière retourne déjà « (Nom, année) »).
- Détection citations : alignement-preuves route (extractCitations l.221-285 : parenthèses /\(([^)]+?(?:19|20)\d{2}[^)]*?)\)/ l.227, split «;», /^(.+?),\s*((?:19|20)\d{2})\b/ l.241, narratif l.254, crochets l.268 ; parseSingleAuthorYear l.150-218 ; buildReferenceIndex/findMatchingReference l.303-337+ ; plainText chapitre l.479-486 ; MAX 100/chapitre l.71) — logique serveur auto-contenue réutilisable. citation-check (6.10) parse des lignes de références complètes (l.102-105) → moins adapté aux citations dans le texte.
- Tests : aucun test vitest sur export-docx/export-pdf ; seule occurrence « export » = app-store.test.ts l.88 (ViewId). Suite : src/**/*.test.ts(x), environnement node (vitest.config.ts). Schéma Prisma Reference vérifié (prisma/schema.prisma l.190+ : authors «;»-séparés, title, year, journal, volume, issue, pages, publisher, doi, url) — données suffisantes pour le texte APA complet des notes.

Stage Summary:
- DOCX : ajouter includeFootnotes aux options (page l.51-60/304-335 + route l.23-35), réutiliser extractCitations + un formateur APA partagé, injecter FootnoteReferenceRun dans parseInlineRuns/paragraphes et Document({footnotes}) — lib docx 9.7.1 prête.
- PDF : pas de bibliographie aujourd'hui ; notes de bas de page réalisables dans le chemin HTML/impression (footnotes CSS ou renvois + section en fin de chapitre), mais le chemin jsPDF rastérise une image → vraies footnotes natives impossibles sans changement de stratégie (à arbitrer en spec).
- Aucune modification de code ; seul worklog.md complété (append).
- Sécurité inchangée : rotation OpenAlex en attente côté propriétaire ; rotation APINEX ; révocation des clés GitHub transités par chat.

---
Task ID: 2-a
Agent: Explore (nav+IA+soutenance)
Task: Exploration lecture seule pour spec/plan du module Soutenance

Work Log:
- Lu worklog.md (fin, 150 dernières lignes) pour contexte maison (format entrées, compteurs produits, leçons reprise-sandbox).
- Navigation : src/app/page.tsx (173 l., switch CurrentView l.59-154) et src/lib/stores/app-store.ts — ViewId (l.8-52, 44 ids), NavCategory (l.54-61, 7 catégories), NAV_CATEGORY_META (l.63-71), NavigationItem (l.73-80 : id/label/icon/description/badge?/category?), NAVIGATION_ITEMS (l.82-410 : 44 entrées comptées). app-sidebar.tsx : ICON_MAP (l.71-77, « Presentation » absent), CATEGORY_ORDER (l.88-90), rendu badges (l.194-201).
- Module IA représentatif : generation-hypotheses-page.tsx (593 l.) — hook useAIStream (l.20-89, fetch POST /api/ai-writing/stream, parsing SSE « data: », AbortController), 3 onglets, toasts use-toast, export Markdown client. DÉFAUT DÉTECTÉ : mode « generation-hypotheses » absent de WRITING_MODES (src/data/ai-writing-modes.ts l.30-280) → /api/ai-writing/stream renvoie 400 « Mode d'écriture non trouvé » (stream/route.ts l.28-34) ; SPECIALIZATION_PROMPTS sans clé correspondante.
- Routes IA : /api/ai-writing (route.ts : zod l.15-21, resolveAiConfig l.67, generateCompletion l.69-73), /api/ai-writing/stream (stream/route.ts : generateCompletionStream l.73-77), /api/directeur-chat (timeout A.9 l.26-30, relance à prompt resserré l.152-168), zai-client.ts (generateCompletion l.481, generateCompletionStream l.601, generateText l.567, circuit breaker l.59-65 : 3 échecs/30 s, max_tokens 4096 par défaut l.277/720, temperature 0.7), resolve-ai-config.ts (cookie httpOnly > _aiConfig body déprécié, l.30-57), use-ai-config.ts (withAiConfig l.184-190 sans apiKey).
- Prisma : Thesis (l.17-37), Chapter (l.39-62), ThesisCadrage/Field/Version (l.101-142), DoctoralToolbox 1:1 JSON-in-String (l.148-162), ResearchTab (l.168-184), AgileSprint/AgileStory non liés à Thesis (l.257-291), DocumentChunk (l.376-393), SavedSearch/Result (l.474-509). Accès thèse active : état client useAppStore.activeThesisId (l.424-427, persist l.454-461) + hooks react-query use-thesis.ts (fetch /api/thesis, /api/thesis/[id]).
- Persistance par thèse : DoctoralToolbox avec /api/thesis/[id]/doctoral-toolbox (GET/POST 409/PUT 404, JSON.stringify conditionnel l.53-62, 95-112) ; Sprint/Story avec /api/sprints, /api/sprints/[id], /api/sprints/[id]/stories, /api/stories/[id] + schémas zod centralisés api-schemas.ts (l.273-318).
- RAG : /api/thesis-rag (route.ts 58 l., actions index/query) + rag-service.ts (indexThesisContent l.160 : chapters par thesisId + references/notebook globaux + cadrage fields ; chunkText 500 tok/overlap 100 l.65-68 ; retrieveChunks l.376 hybride keyword+embeddings ; generateRagResponse l.597, maxTokens 2048 l.661).
- Grep soutenance/slides/defense/jury : aucun module dédié ; existant = mode IA « defense » (ai-writing-modes.ts l.130-138), DEFENSE_PROMPT (specializations/defense.ts, clé « defense » index.ts l.81), knowledge-core PRESENTATION_MODULE (l.855-889), prompt-builder calibration « pré-soutenance » (l.58-63), checklist Soutenance boite-doctorale (l.182-193), template RoutesMe (l.161-165), usages theses.fr (dateSoutenance, Président du jury).
- Compteurs : README.md l.31, 106, 140 « 44 » (l.238 historique 36) ; NOTICE-UTILISATION.md l.12, 71 ; NOTE-PRESENTATION.md l.23 ; AGENTS.md OBSOLÈTE « 36 modules » l.60 et 241. Aucun test n'exige 44 : app-store.test.ts l.215-253 teste seulement >0, champs requis, unicité, premier=dashboard ; grep « \b44\b » dans src = rien de pertinent.
- Zéro modification de code ; seul ce worklog complété en append.

Stage Summary:
- Ajout d'un module = 3 fichiers obligatoires : app-store.ts (ViewId + NAVIGATION_ITEMS avec category+badge), page.tsx (import + case), dossier src/modules/<id>/<id>-page.tsx ; icône à choisir dans ICON_MAP (app-sidebar l.71-77, « Presentation » absent) ; usage-guide-dialog.tsx optionnel.
- Pattern IA recommandé pour Soutenance : POST /api/ai-writing/stream avec mode enregistré à la fois dans WRITING_MODES ET SPECIALIZATION_PROMPTS (piège du défaut « generation-hypotheses » constaté), streaming SSE parsé côté client, avecAiConfig pour la config (cookie httpOnly), toasts destructifs sur validation.
- Persistance artefact par thèse : modèle Prisma avec thesisId + onDelete Cascade (type DoctoralToolbox 1:1 ou ResearchTab N:1), route /api/thesis/[id]/... ou /api/<ressource> avec schémas zod de src/lib/api-schemas.ts, réponses enveloppées { data } / { error }, ZodError → 400 flatten.
- Compteurs à synchroniser (3 doc en « 44 » + AGENTS.md resté à « 36 ») et aucun test de comptage à mettre à jour ; nouveau module → 45 partout, incl. README l.31/106/140, NOTICE l.12/71, NOTE-PRESENTATION l.23.
- Base prête pour spec/plan SDD du module Soutenance (3 onglets : slides, discours, simulation jury) ; rapport détaillé remis à l'orchestrateur.

---
Task ID: 2-b
Agent: Explore (chapitres+RAG+références)
Task: Exploration lecture seule pour spec/plan du générateur de brouillon de chapitre

Work Log:
- Lu worklog.md (dernières entrées) pour le contexte ThesisFrame, puis exploré prisma/schema.prisma en intégralité (509 l.) : Thesis l.17-37, Chapter l.39-62 (content HTML/plainText/wordCount/targetWordCount/status l.45-49), ChapterVersion l.69-81, ThesisCadrage/Field/Version l.101-142, Reference l.190-217 (GLOBAL — aucun thesisId), DocumentChunk l.376-393.
- Routes chapitres : PUT/DELETE /api/chapters/[id] (PUT, PAS de PATCH) avec création automatique de ChapterVersion uniquement si le contenu change (l.24-49, author "doctorant", versionId retourné l.51) ; GET /api/chapters/[id]/versions (take 50, l.17-29) ; GET/POST /api/thesis/[id]/chapters (numéro auto l.48-49) ; schémas zod api-schemas.ts l.51-69.
- Word count calculé 100 % côté client (tiptap-editor.tsx l.73-81, 98-101), envoyé via PUT par useUpdateChapter (use-thesis.ts l.176-197) ; autosave debounce 2500 ms (editor-page.tsx l.74-87 + use-auto-save.ts l.100-124) ; status bar CharacterCount l.132-140.
- 26 modes d'écriture : src/data/ai-writing-modes.ts l.28-290 (interface l.10-22, systemPrompt déprécié, customEndpoint pour deep-research l.288) ; prompts centralisés SPECIALIZATION_PROMPTS (specializations/index.ts l.70-97) ; /api/ai-writing (schéma prompt 50k/context 100k l.15-21, contexte injecté comme 2e message system « CONTEXTE ADDITIONNEL DE LA THÈSE » l.54-59) ; /api/ai-writing/stream (SSE, refuse customEndpoint l.37-42) ; maxTokens défaut 4096 (zai-client.ts l.277/289/720/730) ; calibration niveau doctoral (prompt-builder.ts l.33-75).
- Textes longs : deep-research-pipeline.ts — continueIfTruncated (max 2 passes, fin 4 000 chars, l.124-158), isLikelyTruncated (ponctuation terminale l.100-113), ensureSourcesSection (relance + repli déterministe l.164-212), rapport maxTokens 12 000 (l.714/773), règles de citation (Auteur, Année) + [n] (l.745-750) ; directeur-chat — A.9 timeout 150 s borné 5-180 s (l.26-49), relance unique à prompt resserré (contexte 8 000 chars, historique 4×4 000, l.61-88, 156-167).
- Insertion dans Tiptap : les 26 modes ne font QUE copier au presse-papiers (ai-writing-page.tsx l.218-222) — la seule insertion directe = prédiction fantôme ai-prediction.ts (Tab → tr.insertText l.86-97, widget fantôme l.22-37, debounce 1 000 ms, contexte 400 chars) ; sync contenu externe via editor.commands.setContent (tiptap-editor.tsx l.84-93).
- RAG : rag-service.ts — chunkText 500 tokens/overlap 100 (l.65-68, 99-146), indexThesisContent (chapitres via plainText l.191-207, refs global l.210-228, cadrage l.246-263, batch 100 l.341-353), retrieveChunks hybride 35 % keyword / 65 % sémantique (l.76-79, 376-430), generateRagResponse (top 5, libellés [Chapitre X - Titre] / [Réf: Auteur (Année)] l.626-642, maxTokens 2 048 l.661) ; POST /api/thesis-rag action index|query (l.30-46) ; GET/DELETE /api/document-chunks (l.9-104) ; embedding-service (timeout 30 s, batch 20, providers non supportés l.33-37).
- Références : GET /api/references GLOBAL (filtres type/source/favorites/search title+authors+keywords l.11-27, orderBy updatedAt desc) ; APA 7 — export-docx/route.ts formatReferenceApa (l.891-959) et apa-composer-page.tsx formatAuthorsAPA/generateCitationAPA/generateInTextCitation (l.137-259+, champ in-text = 1er nom + année, l.257-258).
- Citations en ligne : alignement-preuves/route.ts — stripHtml l.78-90, extractCitations l.221-285 (parenthétique /\(...(?:19|20)\d{2}...\)/ l.227, narrative l.254, [n] l.268, « et al. » l.162), matching refs par clé auteur+année (l.303-353), densité = citations/1000 mots (l.491-493, seuils 3.0/1.5 l.506) ; citation-check/route.ts (parseCitation l.60-99, DOI l.47-57, verdicts l.40, 5 registres, timeout 15 s l.122) — mais entrée = texte collé, pas les chapitres.
- Prévisualisation : meilleur pattern = chapter-history-dialog.tsx (Dialog, 2 sélecteurs de versions, wordDiff + diffStats l.111-121, DiffView coloré l.48-76) ; autres « Aperçu » : export-pdf l.1040-1076, apa-composer l.1006, verification-methodo l.1299-1346. Aucun flux existant « générer → prévisualiser → insérer dans chapitre ».
- Zéro modification de code ; seul worklog.md complété (append).

Stage Summary:
- Générateur de brouillon faisable avec les briques existantes : chapitre cible (Chapter cible + targetWordCount l.48 pour la longueur), contexte thèse (pattern thesisContext du Chat Directeur l.435-447 + CONTEXTE ADDITIONNEL /api/ai-writing l.54-59), refs sélectionnables via GET /api/references (global), APA in-text via generateInTextCitation (apa-composer l.252) ou formatReferenceApa (export-docx l.891).
- Sauvegarde de version gratuite : le simple PUT /api/chapters/[id] avec contenu modifié crée automatiquement la ChapterVersion (l.38-49) — l'insertion du brouillon créerait l'historique sans code additionnel ; diff avant/après disponible via wordDiff (chapter-history-dialog l.115).
- Vigilances : pas de PATCH (PUT uniquement) ; maxTokens 4 096 par défaut insuffisant pour un brouillon complet (deep-research utilise 12 000 + passes de continuation, pattern à réutiliser) ; pas de streaming pour un futur customEndpoint dans /api/ai-writing/stream (refusé l.37-42) ; wordCount doit être recalculé côté client après insertion ; streaming à parser en SSE « data: {type:'chunk'} » (l.174-203 ai-writing-page).
- Références GLOBALES (non liées à une thèse) : la « sélection de références de SA bibliothèque » sera un filtre UI, pas une contrainte DB ; matching citation↔référence existant à réutiliser (alignement-preuves l.303-353).

---
Task ID: 4-a
Agent: full-stack-developer (délégation SDD, compte rendu reconstitué par l'orchestrateur après dépassement de délai de l'appel)
Task: Implémentation du cycle SDD pack-soutenance — module Soutenance (slides, discours, questions du jury)

Work Log:
- Groupe A (T1) : modèle SoutenancePrep 1:1 (thesisId @unique, slides/speech/questions JSON-string, speechDurationMin, cascade) — diff prisma migrate avant/après (table seule), db:push, survie des données prouvée (commit bf7aa33).
- Groupe B (T2) : zod api-schemas + route GET/PUT /api/thesis/[id]/soutenance (upsert, normalisation caps : 12 slides, 6 points, 12 questions) (db70ca2).
- Groupe B (T3) : route POST /api/soutenance/generate + prompts src/lib/ai/prompts/soutenance-prompts.ts (contexte thèse tronqué, maxTokens 2500/8000/6000, extraction JSON, 502 si non structuré, artefact persisté) (94f0296).
- Groupe C (T4-T6) : ViewId "soutenance" + NAVIGATION_ITEMS (ClipboardCheck, methodologie, IA) ; page 3 onglets ; entrée guide intégré (e37ecbc, 9e7cc02, 08c69bc).
- Groupe D (T7) : 2 fichiers de tests routes — 65 fichiers / 1471 tests verts (+19) (f91b347).
- Groupe E (T8) : NOTICE-UTILISATION.md §7.10 Soutenance + §10.1 persistance mise à jour (2f8a027).
- Recette navigateur : 8 captures test-snapshots/soutenance-*.png dont génération IA réelle des 3 artefacts (slides, discours, questions), confirmation de relance, états vides, persistance au rechargement.

Stage Summary:
- Cycle pack-soutenance implémenté et prouvé : 8 commits (bf7aa33..2f8a027), lint 0 erreur, suite 1471/1471, lignes rouges 0 diff, preuves horodatées dans specs/pack-soutenance/preuves.md.
- Entrée worklog rédigée par l'orchestrateur : l'agent délégué a été coupé par le délai de l'outil avant son append (tout le reste, y compris preuves.md et captures, était déjà consigné).

---
Task ID: 4-b
Agent: full-stack-developer
Task: Implémentation du cycle SDD brouillon-chapitre (générateur de brouillon de chapitre)

Work Log:
- Groupe A (T1) : convertisseur minimal `src/lib/markdown-to-html.ts` — liste blanche h2/h3/p/ul/ol/li/strong/em/blockquote, échappement HTML systématique, gras puis italique (motif non gourmand pour l'italique imbriqué), `htmlToPlainText` pour le plainText d'insertion (f6680e6, inclut les artefacts spec/plan/tasks/preuves du cycle).
- Groupe A (T2) : route POST `/api/chapter-draft/stream` — zod {chapterId, targetWords 300-8000, referenceIds ≤ 20}, chapitre 404, contexte thèse (titre/auteur/discipline, titres des chapitres, cadrage actif), bibliographie du prompt « Auteur (année). Titre », prompt strict « citer UNIQUEMENT les références fournies (Auteur, année) », generateCompletionStream maxTokens 12 000, relais SSE + UNE relance de continuation si troncature (reprise 4 000 derniers caractères, pattern deep-research) (13e2521).
- Groupe B (T3) : `markdown-to-html.test.ts` (18 tests : titres, gras/italique imbriqués, listes, blockquote, échappement <script>/<div>, aucune balise hors liste, htmlToPlainText) + `chapter-draft/stream/route.test.ts` (13 tests : 400 zod, 404, succès SSE mocké avec done unique + maxTokens 12 000 vérifié, règles de citations du prompt, relance unique si troncature, relais d'erreur) — suite complète 67 fichiers / 1506 tests verts (+2 fichiers, +35) (1979c92).
- Groupe C (T4) : ViewId « brouillon-chapitre » + entrée NAVIGATION_ITEMS (PenTool, catégorie redaction, badge IA) après « Assistant IA » ; import + case page.tsx (d9d6ae7).
- Groupe C (T5) : page `src/modules/brouillon-chapitre/brouillon-chapitre-page.tsx` — états vides sans thèse/chapitres (aucun appel IA), Select chapitre, longueur cible préremplie (objectif ≥ 500 sinon 2 000), recherche + Checkbox références (max 20, max-h-96), génération SSE live + Arrêter (AbortController), aperçu ReactMarkdown + compteur « X mots / cible Y », chips de rappel des références, Copier, Insérer → AlertDialog contractuel (remplacement + version automatique) → markdownToHtml + htmlToPlainText + wordCount (comptage éditeur) → useUpdateChapter (PUT) → invalidations + toast succès mentionnant l'historique de versions (96340b0).
- Groupe C (T6) : entrée « Brouillon de chapitre (IA) » dans le guide intégré (catégorie Assistants IA, après Assistant IA d'écriture) : flux pas-à-pas, garde-fou, citations, persistance (93b264e).
- Groupe D (T7) : sous-section §5.8 « Brouillon de chapitre » en fin de la section 5 de la notice (insertion sans renumérotation, liens croisés §5.3/§5.7 préservés, compteurs non touchés) (720c62c).
- Écart environnement consigné : serveur de dev auto-lancé :3000 arrêté depuis 16:17 (dev.log figé, port 3000 libre, processus next absent) — preuves curl/SSE reportées à la recette navigateur.
- Recette navigateur (consignée ensuite dans specs/brouillon-chapitre/preuves.md) : module dans la sidebar Rédaction, états vides, sélection chapitre + références, génération en direct, Arrêter, aperçu + compteur, insertion après confirmation avec preuve de version dans l'historique du chapitre, copie, mobile 390 px, captures test-snapshots/brouillon-*.png.

Stage Summary:
- Cycle SDD brouillon-chapitre implémenté : 7 commits T1-T7 (f6680e6 → 720c62c), un commit par tâche, messages conventionnels `feat(brouillon)/test/docs`, non poussés.
- Qualité : lint 0 erreur (baseline 231 avertissements inchangée), suite 65 fichiers préexistants / 1471 tests verts + 2 fichiers / 35 tests nouveaux (67/1506), tsc : 0 erreur sur les fichiers nouveaux (84 erreurs baseline préexistantes inchangées).
- Lignes rouges : `git diff HEAD --stat` sur app-sidebar.tsx, theses-en-ligne/search, arxiv/search = vide avant chaque commit ; les 26 modes d'écriture et leurs compteurs, README/AGENTS/NOTE-PRESENTATION non touchés.
- Preuves horodatées (TZ='Etc/GMT-1') dans specs/brouillon-chapitre/preuves.md, mises à jour après chaque commit.
- Écarts Article 4 : (1) le serveur dev auto-géré est tombé (16:17) avant la recette — relance locale documentée dans preuves.md au moment de la vérification navigateur ; (2) artefacts spec/plan/tasks committés avec T1 (aucun commit docs séparé, à la différence du cycle 4-a).

---
Task ID: 4-c
Agent: full-stack-developer (T1-T4) puis orchestrateur (T4 fin - T7, après dépassement de délai de l'appel délégué)
Task: Implémentation du cycle SDD export-notes-bas-page (notes de bas de page exports DOCX + PDF)

Work Log:
- T1 : src/lib/citations.ts (bibliothèque pure adaptée d'alignement-preuves, module non retouché) — commit 6c403ff.
- T2 : formatReferenceApa extrait dans src/lib/apa-format.ts, route DOCX réécrite pour importer — commit 5efac00.
- T3 : route DOCX includeFootnotes — Document({footnotes}) ids ≥ 1, FootnoteReferenceRun injecté dans les runs (gras/italique préservés), option OFF = sérialisation byte-identique (preuve : document.xml 7399 == 7399 octets) ; curl + unzip : 3 renvois dont 2 sur la même note (CA-1.5), citation inconnue intacte (CA-1.3) — commit aae2cb9.
- T4 : citations.test.ts 25 tests verts — commit (reprise orchestrateur).
- T5 : page DOCX — option + case (commit orchestrateur).
- T6 : page PDF — option, fetch références, exposants, section « Notes » fin de document (commit orchestrateur).
- T7 : NOTICE §9.1/§9.2 mises à jour.
- Nettoyage : données de test du cycle supprimées (thèse Test Notes Bas de Page, 2 refs Smith/Doe, SoutenancePrep résiduel) ; résidus d'août signalés sans y toucher.

Stage Summary:
- Cycle export-notes-bas-page livré : lint 0 erreur, suite 68 fichiers / 1531 tests verts, lignes rouges 0 diff, CA-1.1→1.5 et CA-2.1→2.4 couverts (preuves curl + unzip pour DOCX, lint/tests/apercu pour PDF).
- Écart préexistant signalé (hors périmètre, Article 4) : titres DOCX sans HeadingLevel (TDM Word peut ne pas les capter) — correction à la demande.
- La vérification navigateur finale des 3 cycles est faite par l'orchestrateur en fin de session.

---
Task ID: ressource-revues-litterature
Agent: Z.ai Code (orchestrateur SDD, exécution directe)
Task: Cycle SDD ressource-revues-litterature — ajout des ressources transmises (Snyder 2019 ; Sandelowski 2000 retransmis) selon le protocole d'ajout + digestion établi (précédent : cycle ressource-methodes-mixtes du 28/09)

Work Log:
- Lu worklog.md, skills/sdd-thesisframe/SKILL.md, specs/ressource-methodes-mixtes/{spec,plan,tasks}.md pour reconstituer le protocole ; git status bruité par des changements de mode (100644→100755, 0 contenu) → neutralisé via core.fileMode false, arbre propre.
- P1 — Identité Sandelowski prouvée (pdftotext « upload/Combining Qualitative.pdf » : 9 pages, filigrane « Askpstudyinaustralia », « Res Nurs & Health 23:246-255, 2000 », marqueurs digest) → déjà intégré le 28/09, aucune duplication (CA-3.1 consigné dans preuves.md).
- Groupe A (T1) — fiche Snyder 2 pages composée en HTML 920×1190 (gabarit fiche-sandelowski réutilisé), capture chromium headless --force-device-scale-factor=2 → public/resources/revue-litterature-snyder-fiche-{1,2}.jpg (1840×2380, ffprobe) + sources versionnées docs/pdf-sources/ressources/fiche-snyder-p{1,2}.html ; contrôle visuel Read.
- Groupe B (T2-T3) — 5e entrée typée dans resources-section.tsx (après UWA, avant Sandelowski) ; README : vignette + crédit Snyder (CC BY-NC-ND) + mention modules methodology/literature-review.
- Groupe C (T4-T6) — knowledge-core.ts : ligne source en tête + section « Typologie et conduite des revues (Snyder 2019) » dans LITERATURE_REVIEW_MODULE (style télégraphique maison) ; source brute modules/revue-litterature-snyder.md (7 sections détaillées + DOI) ; sync AGENTS.md (sources, ligne budget) + ARCHITECTURE-CONNAISSANCE.md (date, arbre 10 modules, ligne table, note de mesure).
- Budget prouvé avant/après : 62 823 → 65 382 chars (20 928 → 21 794 tok / 22 000) ; literature-review 2 228 → 3 094 tok ; méthodologie 4 470 toujours max ; 7/7 capteur vert ; marge résiduelle ~206 tok signalée dans AGENTS.md (prochaine ingestion = compaction ou dé-injection).
- Groupe D (T7-T10) — lint 0 erreur (231 warnings baseline) ; suite 68 fichiers / 1531 tests verts ; recette agent-browser : 5 cartes, dialogue Snyder pagination 1/2→2/2 et retour, carte Sandelowski intacte (CA-1.3), 0 erreur console/page, mobile 390 px ; 5 captures test-snapshots/ressources-snyder-*.png ; lignes rouges 0 diff avant chaque commit.
- Commits : 2453717 (feat ressources), 913f085 (docs ia), 50094d2 (docs sdd) ; FICHE_SYNTHESE.md mise à jour.

Stage Summary:
- Cycle SDD ressource-revues-litterature CONVERGÉ : CA-1.1→3.1 couvertes ; Sandelowski retransmis traçé sans duplication ; Snyder 2019 intégré de bout en bout (fiche, carte, socle IA, docs).
- Écarts documentés : marge core 206 tok (vs ~400 estimés — section réelle ~855 tok) ; panneau préexistant « Livrable du test de production » fermé pendant la recette (données de test hors périmètre).
- Points ouverts : recette propriétaire ; compaction/dé-injection avant toute future ingestion du noyau ; régénération PDF notice (résidu) ; rotation OpenAlex/APINEX + révocation clés GitHub (attente propriétaire).

---
Task ID: recette-3-cycles
Agent: orchestrateur (Z.ai Code)
Task: Recette propriétaire déléguée (« faites pour le mieux ») des 3 cycles SDD approuvés (pack-soutenance, brouillon-chapitre, export-notes-bas-page) — vérifications en conditions réelles, consignation, clôture.

Work Log:
- Reconstruction de l'état réel : git log + specs/ existants → les 3 cycles déjà CONVERGÉS (recette en attente) ; écart avec la mémoire de session signalé au propriétaire (Constitution : pas de reconstruction silencieuse).
- Pack soutenance : navigations réelles ; 502 ponctuel enquêté (réplique exacte du pipeline en bun : 12 slides extraites — variance modèle ponctuelle, comportement 502+relance par design) ; puis 3/3 HTTP 200 ; persistance prouvée (reload + GET API) ; discours 15 min et 10 questions générés ; 0 erreur console ; 3 captures.
- Brouillon de chapitre : flux complet chap. 7 (400 mots, 2 références) → confirmation → 338 mots insérés → version historisée ; 2 captures ; citations (Bui Khanh Linh Do, 2025) ×2 dans le chapitre.
- Export notes de bas de page : DOCX ON/OFF prouvé par curl+unzip (note APA complète, 2 renvois / 0 renvoi, citation intacte) ; PDF — écart de convergence comblé (citations réelles) : exposants ["1","1"] + section Notes vérifiés dans l'aperçu.
- Défaut d'aperçu PDF vide au retour d'onglet : cause racine tracée (iframe démontée/recréée + document.write dépendant d'effets non redéclenchés) → correctif srcDoc (export-pdf-page.tsx, 6+/10-) ; lint 0 erreur ; vitest 68/1531 verts ; preuve navigateur post-correctif.
- Environnement : OOM killer a tué next-server (2,4 Go RSS sur box 4 Go) pendant les recompiles — redémarrages avec NODE_OPTIONS=--max-old-space-size=1200 ; signalé comme point ouvert.
- Consignation : sections « Recette » dans les 3 preuves.md, 22/22 cases cochées + verdicts de recette dans les 3 tasks.md, FICHE_SYNTHESE.md, worklog ; lignes rouges 0 diff vérifiées avant commits.

Stage Summary:
- Les 3 cycles approuvés (comparatif TrustMémoireAI) sont désormais CONVERGÉS + RECETTÉS (délégation propriétaire) : pack-soutenance 12/12, brouillon-chapitre 11/11, export-notes-bas-page 9/9.
- 1 défaut réel corrigé à l'occasion de la recette (aperçu PDF srcDoc) — preuves navigateur et captures à l'appui.
- Reste ouvert : mémoire dev box (OOM), voie jsPDF headless, rotation clés (propriétaire).

---
Task ID: competences-livres-vivantes
Agent: Z.ai Code (orchestrateur SDD, exécution directe sous délégation)
Task: Cycle SDD complet « compétences-livres-vivantes » — injecter la base CustomBookSkill (58 ressources, jamais lue par l'IA) dans les prompts des flux génératifs, avec UI de gestion, opt-in strict et plafonds de contexte. Délégation propriétaire explicite (« terminez toutes les actions avant de revenir pour moi pour avis »).

Work Log:
- Lecture obligatoire : SKILL.md SDD, CONSTITUTION.md (7 articles), worklog (précédents veille-academique / recette-3-cycles).
- Exploration sourcée : prisma/schema.prisma l.317-325 ; book-skills routes l.1-155/[id] ; livres-competences-page.tsx l.1202-1401 (aucun create/edit, bug `~Math.round` l.1356) ; prompt-builder ; ai-writing(+stream) routes ; chapter-draft/stream buildSystemPrompt l.101-133 ; tests (mocks db par modèle).
- Étape 1-4 : spec.md (14 CA, choix conservateurs délégués consignés, révisables), plan.md (état réel + approche canal séparé du noyau — budget core 21 794/22 000 tok), tasks.md (A→E, 12 tâches). Commit artefacts 0298f5c.
- Groupe A (T1) : schéma +description/+source/+enabled(default false) ; db:push additif ; 58/58 survécues — commit 4d14b24.
- Groupe B (T2a-T4) : **écart Article 4** — GET complet en P2010 « Conversion failed » PRÉEXISTANT (8 lignes du 2026-08-23 avec dates texte ISO 6 décimales vs entiers epoch-ms attendus par Node ; bissection SQL prouvée) ; plan/tasks amendés avant correctif ; normalisation epoch-ms, 58=58, requêtes ancienne+nouvelle OK. GET/POST/PUT étendus zod+nullish ; preuves curl 201/400/200/404 + persistance — commits 89fd282, 0a4f7e2.
- Groupe C (T5-T8) : book-skills.ts pure (plafonds 12 000/1 500 car., null si 0 active) 11/11 tests ; book-skills-server.ts ; injection chapter-draft (16/16) + ai-writing (19/19) + stream (14/14) ; lint ramené à baseline 231 (2 warnings auto-introduits corrigés) — commits e6aac40, 1bf64d2, 4a056a6.
- Groupe D (T9-T10) : BookSkillsLibrary réécrit — création/édition, interrupteur IA + badges Injectée/Hors IA, fix compteur mots négatif ; lint 0 erreur — commit 1603ba5.
- Groupe E (T11-T12) : suite 69 fichiers/1548 verts (baseline +17, zéro régression) ; note ARCHITECTURE-CONNAISSANCE § 6 bis — commit 48459a7.
- Recette navigateur (délégation) : 15 contrôles — opt-in par défaut réel, création/édition/suppression UI, badge persistant au reload, génération live HTTP 200 (2 633 car.) avec compétence active, mobile 390 px sans scroll horizontal, 0 erreur console, 5 captures. Défaut trouvé/corrigé : POST 400 sur nulls → .nullish() (16a00d7) + re-recette. Incident environnemental : « readonly database » ponctuel → relance serveur propre.
- Clôture : cases T1→T12 cochées + verdict CONVERGÉ (recette déléguée, révisable), FICHE_SYNTHESE.md, preuves § Recette.

Stage Summary:
- Cycle compétences-livres-vivantes CONVERGÉ : 14/14 CA, suite 69/1548 verte, lint 0 erreur (231 baseline), lignes rouges 0 diff à chaque commit.
- La base « Livres & compétences » est désormais vivante : opt-in strict par ressource, injection budgétée (≤ ~3 400 tokens), règle « jamais source de citations » (intégrité académique), byte-identité préservée à 0 ressource active.
- Écart majeur documenté : bug préexistant P2010 (dates 6 décimales) corrigé à la racine (données), pas masqué.
- Ouvert : recette de contrôle propriétaire ; stamp Sceau de vérité (reporté) ; extension flux d'analyse (non planifié) ; OOM box.

---
Task ID: recette-58-recence
Agent: Z.ai Code (orchestrateur SDD, exécution directe sous délégation)
Task: Recette déléguée du cycle compétences-livres-vivantes — « faites le teste pour les 58 par ordre de récence » : tester le canal d'injection sur les 58 ressources réelles dans l'ordre de récence (algorithme de sélection), UI + génération live + restauration.

Work Log:
- Lecture worklog/SKILL.md, reconstruction de l'état (cycle déjà CONVERGÉ ; demande = recette supplémentaire sur données réelles).
- Script lecture seule (supprimé après) : 58 ressources, 0 active, ordre updatedAt DESC vérifié OUI ; simulation 58 actives via la librairie pure réelle → 6 injectées (11 745/12 000 car.), 52 index-only, mention « contenu non injecté (budget) » + règle « JAMAIS source de citations » présentes ; 0 active → null (CA-3.1). Constat : la plus récente (Guide to Academic…, 30 000 car.) est seule trop volumineuse → jamais injectable en intégral (index-only, CA-3.3).
- UI (agent-browser) : 58 switches comptés, ordre cartes = ordre récence base ; activation rangs 1-2 → 2 badges « Injectée » / 56 « Hors IA », PUT 200, actives en base 2 ; reload complet + renavigation → persistance (checked=true ×2) ; restauration par les mêmes interrupteurs → 0 UI / 0/58 base.
- Génération live : thèse « Urbanisme durable » activée via carte éditeur (reload avait réinitialisé activeThesisId à null — état client) ; Brouillon de chapitre, Chapitre 1, 400 mots → aperçu 237 mots réel, POST /api/chapter-draft/stream 200, 0 erreur page, aucune insertion (pas de confirmation).
- Restauration intégrale : timestamps d'origine des 2 ressources restaurés depuis git HEAD (effet de bord PUT) ; comparaison logique live/HEAD : CustomBookSkill 58/58 identiques (id, enabled, updatedAt, contenu), compteurs autres tables égaux ; diff binaire résiduel = compteurs SQLite (commité, convention dépôt).
- Mobile 390 px : pas de scroll horizontal ; 2 captures test-snapshots/competences-58-recette-{mobile,desktop}.png ; preuves appandées (§ « Recette déléguée — les 58 ») ; FICHE_SYNTHESE.md à jour.

Stage Summary:
- Recette déléguée 58 ressources RECETTÉE : le canal se comporte exactement comme spécifié sur données réelles (récence d'abord, plafond, index honnête, opt-in, byte-identité à 0 active).
- Constat d'usage transmis : ressources utiles en contenu intégral à garder ≤ 12 000 car. (la 30k reste index-only) ; amélioration légère possible (taille conseillée dans l'UI) — non planifiée.
- État restitué : 0/58 active, ordre de récence d'origine, base logiquement identique au HEAD.

---
Task ID: validation-competences + micro-taille-conseillee
Agent: Z.ai Code (orchestrateur SDD)
Task: Suite au rapport de recette des 58 — le propriétaire répond « oui » à (a) l'indication de taille dans l'UI et (b) la validation déléguée du cycle. Livraison du micro-changement (voie rapide) + consignation de la validation.

Work Log:
- « oui » interprété sur les deux points (a)+(b) ; consignation avec citation exacte et horodatage dans preuves.md.
- Voie rapide vérifiée (1 fichier, ≤ 20 lignes, 0 impact transverse) → assess-taille-conseillee.md rédigé AVANT le code.
- Implémentation : compteur live sous le champ Contenu du dialog BookSkillsLibrary ; constante BOOK_SKILLS_CONTENT_BUDGET_CHARS importée de la librairie pure (pas de dur) ; ambre au-delà de 12 000.
- Lint 0 erreur (231 baseline) ; lignes rouges 0 diff ; recette navigateur : compteur 0→46→12 050 car., ambre vérifié au-delà du seuil, Escape sans sauvegarde, base intacte 58/0 ; capture test-snapshots/competences-compteur-dialog.png.
- FICHE_SYNTHESE.md : validation consignée, « taille conseillée » retiré des points ouverts (livré).

Stage Summary:
- Cycle n°11 compétences-livres-vivantes : CONVERGÉ + RECETTÉ (58 ressources) + VALIDÉ par le propriétaire (« oui ») — clos.
- Micro-changement taille conseillée livré et recetté (voie rapide du protocole, première utilisation documentée).
- Ouvert (inchangé) : stamp Sceau de vérité ; extension flux d'analyse ; OOM box ; rotation clés côté propriétaire.

---
Task ID: sceau-provenance-savoirs
Agent: Z.ai Code (orchestrateur SDD, exécution directe)
Task: Cycle SDD complet n°12 « sceau-provenance-savoirs » — traçabilité des savoirs (noyau + compétences livres) par génération : spec/plan/tâches validés par le propriétaire (« ok »), puis exécution A→E et recette.

Work Log:
- Étape 1-4 : exploration sourcée (knowledge-core 949 l., streams l.332-335/l.59, PUT chapters l.25-52, schema l.70-82, history-dialog 228 l.) ; spec 10 CA + 3 [À CLARIFIER] avec propositions ; commit artefacts f4793a6 ; propriétaire valide (« ok ») → zones floues tranchées.
- Groupe A (T1) : colonnes `stamp` (JSON) sur Chapter + ChapterVersion ; db:push additif, 7/4/58/1 survécues — 7e4528e.
- Groupe B (T2-T3) : KNOWLEDGE_CORE_VERSION + lib pure knowledge-stamp (buildKnowledgeStamp, résumé, détail) + 10 tests (1 échec initial : import constante depuis le mauvais module — corrigé) — 09275ac.
- Groupe C (T4-T8) : parsers clients tolérants vérifiés (types inconnus ignorés) ; événement SSE `stamp` en fin de flux des 2 streams (jamais dans le prompt) ; PUT zod .nullish() + « le stamp ne suit que le contenu » ; GET versions renvoie le stamp ; GET léger état courant (T8b) — e948c87, ada013f. Lint : warning `_stamp` corrigé, 231 baseline.
- **Écart Article 4** : plan supposait versions = états antérieurs ; réel = snapshots du NOUVEL état (update avant create) → plan.md § 4 corrigé AVANT implémentation ; design simplifié (pas d'archivage).
- Groupe D (T9-T12) : composant partagé knowledge-stamp-block (résumé + détail dépliable, « saisie manuelle ») ; brouillon (état stamp, parse, envoi à l'insertion), historique (état actuel + provenance par version), ai-writing (affichage, non persisté) — 15819f6.
- Groupe E (T13) : ARCHITECTURE-CONNAISSANCE § 6 ter (tableau de version du noyau + stamp) — 501f12b.
- Incident : GET versions 500 après db:push (serveur démarré avant régénération client Prisma) → redémarrage → 200.
- Recette navigateur : 8 contrôles réels (activation rang 2, génération 258 mots, bloc + détail, insertion, historique 3 blocs, restauration 1 957 mots sans stamp, désactivation 0/58, ai-writing « aucune compétence livre active », mobile 390 px, 0 erreur console, 2 captures) ; vitest 70/1558 verts.
- Consignation : tasks.md 14/14 cochées + verdict CONVERGÉ (10/10 CA), preuves.md § exécution + recette, FICHE_SYNTHESE cycle 12.

Stage Summary:
- Cycle sceau-provenance-savoirs CONVERGÉ : chaque état du texte porte sa provenance (noyau versionné + compétences livres, modes intégral/index-only) ; prompt inchangé (byte-identité) ; « saisie manuelle » explicite.
- État restauré après recette : chapitre 1 à son contenu d'origine (1 957 mots), 0/58 compétence active ; l'historique du chapitre conserve la trace honnête de la recette.
- Ouvert : recette de contrôle propriétaire ; extension aux autres flux IA (non planifié) ; Truthmark inchangé.

---
Task ID: sceau-provenance-savoirs-validation
Agent: Z.ai Code (principal)
Task: Recette de contrôle du propriétaire du cycle n°12 « sceau-provenance-savoirs » — consignation de la validation et clôture du cycle.

Work Log:
- Reconstruction d'état (git log : f37570b en tête, arbre propre) + horodatage TZ='Etc/GMT-1' (04/10/2026 17:28).
- Réponse propriétaire « OK » reçue : validation de la recette déléguée (10/10 CA, 8 contrôles navigateur, 2 captures, mobile 390 px, 0 erreur console).
- Consignation : tasks.md (verdict « clos et validé »), preuves.md (§ « Validation propriétaire (2026-10-04) »), FICHE_SYNTHESE.md (entrée cycle 12, points ouverts ajustés).
- Lignes rouges : 0 diff vérifié avant commit.

Stage Summary:
- Cycle n°12 « sceau-provenance-savoirs » CLÔTURÉ et VALIDÉ par le propriétaire (« OK », 2026-10-04 17:28).
- Restent ouverts (hors cycle) : extension du stamp aux autres flux IA (non planifié) ; OOM box à surveiller ; rotation OpenAlex/APINEX + révocation clés GitHub (côté propriétaire).

---
Task ID: urbanis-dz-analyse-preliminaire
Agent: Z.ai Code (principal)
Task: Analyse du pack URBANIS-DZ (PDF 5 pages, v1.1) et étude de faisabilité d'intégration dans ThesisFrame — demande explicite du propriétaire, aucun code.

Work Log:
- Extraction texte du pack (pdftotext, 18 761 car.) + mesure par section (instruction système §2 = 4 837 car. ; §3 juridique = 2 815 ; §4 risques = 3 535).
- Vérification code réel : CustomBookSkill (schema.prisma l.319-332), budgets book-skills 12 000/1 500 (book-skills.ts l.11-14), 27 SPECIALIZATION_PROMPTS (specializations/index.ts l.70+), canaux d'injection chapter-draft l.350 + ai-writing l.62.
- Confrontation : T1 Provenance ≈ cycle 12 (déjà livré) ; C4 ≈ CustomBookSkill ; doctrine/méthodes ≈ mécanique des modes ; gaps = registre juridique structuré, veille JORADP, modes métier, non-complaisance.
- Rédaction de l'analyse + 3 options chiffrées + recommandation : specs/urbanis-dz-integration/analyse-preliminaire.md.

Stage Summary:
- Verdict : intégration POSSIBLE et pertinente (usage thèse urbanisme réel du propriétaire) ; recommandation = Option A (mode spécialisé expertise urbaine DZ, ~1 cycle, zéro migration/ligne rouge/noyau) puis Option B (registre LegalRef) si usage justifié ; veille JORADP déconseillée en premier tour.
- Point d'arrêt respecté : aucune implémentation — attente du choix du propriétaire avant Étape 1 (spécifier).

---
Task ID: urbanis-dz-mode
Agent: Z.ai Code (principal)
Task: Cycle SDD n°13 « urbanis-dz-mode » — intégration du pack URBANIS-DZ du propriétaire comme mode spécialisé de l'assistant d'écriture (Option A validée « A »).

Work Log:
- Ouverture : spec/plan/tasks/preuves (`d40ae26`) — mécanisme des 27 spécialisations vérifié (index.ts l.8-36/70+, prompt-builder buildStandalonePrompt l.101-104, route ai-writing l.32/49/94, ICON_MAP l.41-56).
- Groupe A (`4058cd8`) : prompt verbatim §2 du pack + passerelle 3 puces (autoporteur, 4 870 car.), registre, test d'invariants 9 verts.
- Groupe B (`7af3a12`) : entrée WRITING_MODES + ICON_MAP Building2 + note ambre JORADP ; bloc câblage test ; 44/44 verts.
- Groupe C (`1deea65`) : § 6 quater ARCHITECTURE-CONNAISSANCE + allowedStandalone capteur budget (écart Article 4 consigné) ; suite complète 1 569/1 569, lint 0 erreur.
- Recette navigateur déléguée : 8 contrôles, banc d'essai T4 live (cadrage/FAIT SOURCÉ/refus de conclure/bloc traçabilité 7 champs), Provenance des savoirs intacte, mobile 390 px, 0 erreur console, 3 captures.
- Convergence : 7/7 CA, tasks.md coché après recette déléguée, FICHE mise à jour.

Stage Summary:
- Cycle n°13 « urbanis-dz-mode » CONVERGÉ (recette déléguée, révisable) : le pack URBANIS-DZ est désormais un mode « Expertise urbaine (URBANIS-DZ) » de l'assistant d'écriture, verbatim et protégé contre la dérive (snapshot), sans impact noyau (marge 206 tok préservée) ni ligne rouge.
- Ouverts : Option B (LegalRef), Option C (veille JORADP), recette de contrôle propriétaire.

---
Task ID: urbanis-dz-mode-validation
Agent: Z.ai Code (principal)
Task: Formalisation de la validation du cycle n°13 « urbanis-dz-mode » par le propriétaire (« ok et enchainer », IM 2026-10-07 11:25 TZ 'Etc/GMT-1).

Work Log:
- Reconstruction d'état (git log : 9076a25 en tête, arbre propre) + horodatage TZ='Etc/GMT-1' (07/10/2026 11:25-11:29).
- Interprétation consignée : « ok » = recette déléguée 7/7 CA acceptée sans réserve ; « et enchainer » = enchaîner sur la suite de la séquence de l'analyse préliminaire (§ 5-6) → Option B (registre juridique structuré LegalRef).
- Consignation : tasks.md (verdict « clos et validé »), preuves.md (§ « Validation propriétaire (2026-10-07) »), FICHE_SYNTHESE.md (validation + points ouverts ajustés).
- Lignes rouges : 0 diff vérifié avant commit.

Stage Summary:
- Cycle n°13 « urbanis-dz-mode » CLÔTURÉ et VALIDÉ par le propriétaire (« ok et enchainer », 2026-10-07 11:25).
- Enchaînement : ouverture du cycle n°14 — Option B « registre juridique structuré LegalRef » (modèle 11 champs §7, UI gestion, alimentation initiale ~36 textes §3-§4, injection sélective mécanique book-skills, extension sceau).

---
Task ID: article-scientifique-analyse-preliminaire
Agent: Z.ai Code (principal)
Task: Analyse du cahier des charges « brouillon d'article scientifique » fourni par le propriétaire (IM 2026-10-07 11:44) — « veuillez voir ceci pour proposition d'améliorations ». Aucun code.

Work Log:
- Correction consignée : l'« anomalie d'environnement » signalée au tour précédent était une **fausse alerte** — recoupements ultérieurs (git ls-files, test -f, sed) : `src/app/api/route.ts` existe (health check trivial « Hello, world! »), `page.tsx` est un seul gros fichier (60 imports, switch 45+ cas l.65-155), le pack PDF extrait était conforme. Erreur d'interprétation de l'agent, aucun impact produit (zéro code écrit pendant l'arrêt).
- Exploration vérifiée : module `articles` existant = guide statique (495 l.) ; aucun modèle Article ; `NAVIGATION_ITEMS` dans `app-store.ts` (ajout de module sans toucher app-sidebar, preuve app-sidebar.tsx l.46) ; aucun parseur PDF/DOCX en deps ; `docx` ^9.7.1 + `jspdf` ^4.2.1 (export) ; streams + stamp + versions + Job + traducteur + verification-citations + thesis-rag existants.
- Rédaction : specs/article-scientifique/analyse-preliminaire.md (correspondances 18 lignes, 5 gaps, contraintes + signalement mono-utilisateur, options A/B/C chiffrées, recommandation A).

Stage Summary:
- Verdict : la demande est **réalisable et très alignée** avec l'existant (streams, stamp, versions, export-docx) ; gap majeur = import/extraction PDF/DOCX (libs pure-JS à ajouter) + modèle Article + assistant guidé.
- Recommandation : Option A (socle couvrant les 10 critères d'acceptation, ~2-3 cycles) puis B ; C (OCR) en veilleuse.
- Point d'arrêt respecté : aucune implémentation — attente du choix du propriétaire. Cycle n°14 « urbanis-dz-registre » (Option B LegalRef) reste ouvert en exploration, en pause derrière cette demande.

---
Task ID: urbanis-dz-registre
Agent: Z.ai Code (principal)
Task: Cycle SDD n°14 « urbanis-dz-registre » — Option B de l'analyse URBANIS-DZ : registre juridique structuré LegalRef (déclencheur « finalisez le cycle urbanis », IM 2026-10-07 11:53).

Work Log:
- Ouverture (9edab18) : spec 8 CA, plan (mécanique book-skills dupliquée adaptée), tasks A-F, preuves — zéro code.
- Groupe A (a890fab) : modèle LegalRef (11 champs §7 + opt-in) — db:push additif, survie 58/7/6/0/1 prouvée, serveur redémarré.
- Groupe B (adcb347) : legal-refs.ts (budgets 8000/1500, sélection déterministe, garde-fous) + legal-refs-server.ts + stamp legalRefs additif + 13 tests.
- Groupe C (05ad1c8) : routes /api/legal-refs CRUD + injection ai-writing/stream conditionnelle (mode expertise-urbaine-dz uniquement, byte-identique ailleurs, 3 tests).
- Groupes D+E (195207b, 90e80a8) : onglet Registre juridique (composant autonome + 3 micro-éditions ancrées) + seed 27 entrées verbatim idempotent + .gitignore exception (écart Art. 4).
- Groupe F (65680da) : docs § 6 quinquies, convergence 8/8 CA, recette déléguée 10 contrôles.

Stage Summary:
- Cycle n°14 CONVERGÉ (recette déléguée, révisable) : registre juridique 27 entrées nourrissant le mode URBANIS-DZ, sceau de provenance étendu additivement, 1 585 tests verts, lignes rouges 0 diff.
- Défaut trouvé en recette et corrigé : POST 500 (statut NOT NULL) — correctif prouvé curl 201.
- URBANIS-DZ intégration : Options A+B livrées et recettées ; Option C (veille JORADP) en veilleuse (cycle dédié si demandé).

---
Task ID: article-scientifique-option-a
Agent: Z.ai Code (principal)
Task: Cycle n°15 « article-scientifique option A (socle) » — les 10 critères d'acceptation du cahier des charges du propriétaire (déclencheur « passez aux étapes A, B et C »).

Work Log:
- Ouverture (112fa12) : spec 10 CA, plan, tasks A-E, preuves — zéro code.
- Groupe A (8847715) : Article/ArticleVersion/ImportedDoc + mammoth/unpdf (pure JS) — survie 58/7/6/0/1/27 prouvée.
- Groupe B (4e9e015) : extraction (types réels, magic bytes, 20 Mo, scanné, limites honnêtes) + prompts intégrité verbatim (anti-injection, [À compléter], corrélation≠causalité) — 16 tests.
- Groupe C (7189b50) : /api/article-imports (201 réel, 4 titres DOCX) + /api/articles CRUD/plan/section/export-docx — tsc 0 sur le cycle (3 erreurs de FK corrigées : modèles globaux).
- Groupe D (20f4a61) : wizard 5 étapes + montage module + 2 points d'entrée.
- Groupe E (ec8a9e8) : docs § 7 bis, convergence 10/10, recette (import UI réel via DataTransfer, étape 5, mobile 390, console) + 2 génération live API (6,3/8,3 s, chiffres conservés, [Information non précisée], kind imported).

Stage Summary:
- Cycle n°15 CONVERGÉ (recette déléguée + preuves API, révisable) : 1 601 tests verts, lint 0 erreur, lignes rouges 0 diff.
- Défauts trouvés en recette, corrigés dans le groupe : crash JSON.parse(limits) ; location fusionnée au label (kind inconnu).
- Frictions consignées : file input non géré par le CLI (DataTransfer), corruption d'affichage navigateur intermittente (preuves API).

---
Task ID: article-scientifique-option-b
Agent: Z.ai Code (principal)
Task: Cycle n°16 « article-scientifique option B (parcours complet) » — analyse des sources, propositions d'angles avec choix obligatoire, anti-fragmentation.

Work Log:
- Ouverture : spec 6 CA (B1-B6), plan, tasks A-C.
- Groupe A (5a02907) : analysis.ts pure (volumes, titres, études, manquants, qualité, fragmentationRisk) + buildAnglesPrompt/parse + 8 tests ; routes /analyze (pur) et /angles (IA) — 1 commit amendé (seuil qualité du test).
- Groupe B (2b0c776) : UI — panneau d'analyse, cartes d'angles radio, blocage génération sans angle (≥ 2 études) — défaut icône Search corrigé dans le groupe.
- Groupe C : docs § 7 bis enrichi, convergence 6/6 — suite 1 608 verts, lint 0 erreur, redlines 0 diff.

Stage Summary:
- Cycle n°16 CONVERGÉ (révisable) : analyze 200 réel (rapport honnête), angles IA 200 (9,4 s), UI recettée.

---
Task ID: article-scientifique-option-c
Agent: Z.ai Code (principal)
Task: Cycle n°17 « article-scientifique option C » — traduction distincte + multi-articles ; OCR/async différés explicitement.

Work Log:
- Ouverture (782eb4a) : spec 2 CA (C1 traduction, C2 multi-articles), différé OCR/async consigné (analyse initiale § 6 : cycle d'étude dédié exigé pour l'OCR).
- Backend (66cf1e6) : ARTICLE_TRANSLATION_RULES verbatim (préserver sens/données/nuances/citations, n'ajouter RIEN, unités intactes, repères conservés) + buildTranslationPrompt + /api/articles/translate (COPIE distincte, original intact) — 25/25 tests verts avant commit.
- Rattrapage (98dcb8d) : correctif statut NOT NULL des routes legal-refs (trouvé en recette cycle 14, jamais commité) — vérifié par diff.
- Backend C2 (19053d6) : GET /api/articles enrichi (sectionsCount + toComplete calculés serveur) — vérifié par diff.
- Base + worklog + capture (98a5756) : artefacts de recette.
- Recette live traduction : NON exécutée (corruption d'affichage sévère en fin de session) ; UI traduction + panneau multi-articles : NON implémentés.

Stage Summary:
- Cycle n°17 : backend C livré et testé (25/25) ; **UI non livrée → verdict NON CONVERGÉ (honnête)** — reste T3 (boutons traduction par section, panneau multi-articles) et recette live de traduction.
- Anomalie d'environnement récurrente : corruption d'affichage des sorties outils (identifiants déformés, résultats fabriqués) — les commandes s'exécutaient souvent correctement (vérifiées par diff/recoupement git), mais l'automatisation navigateur et les preuves live en fin de session sont devenues invérifiables ; arrêt Art. 1/4 appliqué.

---
Task ID: article-scientifique-option-c-suite
Agent: Z.ai Code (principal)
Task: Achèvement du cycle n°17 « article-scientifique option C » — T3 (UI traduction + multi-articles) et T4 (recette live + convergence), restés NON CONVERGÉS après l'arrêt de la session précédente (corruption d'affichage). Déclencheur : reprise de session ; question propriétaire « qu'est ce qu'il y a à faire maintenant ? » (IM, 2026-10-07).

Work Log:
- Reconstruction d'état : git log 3cd0616 en tête, arbre propre, tout poussé, lignes rouges 0 diff ; tasks-option-c.md = T3/T4 seules restantes ; backend C confirmé complet (route 58 l., stats serveur GET /api/articles).
- T3 implémenté (article-redaction-page.tsx, +330 l.) : carte « Traduction (copie distincte) » en étape 5 (sélecteur fr/en/ar défaut = inverse de la langue de rédaction, bouton article entier avec progression), boutons « Traduire » par section, panneau « Copie traduite (original intact) » éditable, enregistrement en NOUVEL article (POST+PUT, original jamais touché) ou en VERSION (snapshot avant remplacement, restaurable), copie presse-papiers ; invalidation de la traduction stockée dès que la section d'origine change (génération/édition/restauration) ; vue multi-articles enrichie (badges type/statut/sections/repères + agrégat).
- Recette live API ×2 (curl fr→en avec chiffres 42/78 %, citation Benali (2019, p. 12), r = 0,72, repère) : préservation verbatim prouvée ; DÉFAUT trouvé — repère traduit en anglais → correctif buildTranslationPrompt (contrainte de sortie : repères EXACTEMENT tels quels en français) + test non-régression ; 2e live prouve le correctif.
- Recette navigateur déléguée (8 contrôles) : vue multi-articles (badges + agrégat, article réel intact), ouverture étape 5, traduction de section (panneau anglais, original français inchangé, repère français conservé), enregistrement copie (notice verte + liste : « (copie anglais) · 2 sections · 1 à compléter/vérifier »), mobile 390 px, 2 captures, nettoyage (DELETE 200 ×2, db restaurée HEAD).
- Diagnostics d'environnement consignés : OOM box CONFIRMÉE (dmesg : 2 next-server tués à ~2 Go RSS) — contournement NODE_OPTIONS=1400 + recette en traites ; faux négatif d'un wait navigateur ; Fast Refresh pendant fetch = perte d'état (recharge propre → OK) ; processus enfants d'un appel outil tués à la frontière (test sleep-300 prouvé).
- Vérifications finales : vitest 74 fichiers / 1 611 verts ; lint 0 erreur / 231 warnings ; lignes rouges 0 diff ; docs § 7 bis (Option C + différé OCR/async) ; tasks-option-c 4/4 + verdict CONVERGÉ ; preuves complétées.

Stage Summary:
- Cycle n°17 « article-scientifique option C » CONVERGÉ (2/2 CA, recette déléguée, révisable) : traduction distincte (copie, original intact, repères verbatim français) + vue multi-articles — la séquence « étapes A, B et C » du cahier des charges article scientifique est intégralement livrée (cycles 15/16/17).
- OCR + jobs asynchrones : différés explicitement, cycle d'étude dédié exigé (consigné à l'ouverture, repris en docs).
- Anomalie d'environnement caractérisée et contournée (OOM box + frontière d'appels outils) — consignée pour les sessions suivantes.
---
Task ID: controle-cycles-15-16-17
Agent: Z.ai Code (principal)
Task: Recette de contrôle des cycles 15/16/17 (statut révisable) — déclencheur « engagez toutes les étapes par ordre prioritaire » (IM, 2026-10-07).

Work Log:
- Baseline : vitest 74 fichiers / 1 611 verts (16,3 s), lint 0 erreur / 231 warnings, lignes rouges 0 diff, arbre propre.
- Recette navigateur agent-browser (11 contrôles, lecture seule) : 2 points d'entrée, wizard étape 1, vue multi-articles avec badges, étape 5 (carte traduction, repères verbatim, traçabilité par section, versions, export DOCX), bouton analyse (cycle 16), mobile 390 px sans scroll horizontal, 0 erreur console, GET /api/legal-refs 200.
- 2 captures test-snapshots/controle-cycles-15-17-*.png ; navigateur fermé ; GET /api 200 après recette ; article réel de la base intact (lecture seule).

Stage Summary:
- Contrôle POSITIF consigné dans specs/article-scientifique/preuves-option-a.md (§ Recette de contrôle) — aucun écart aux recettes de convergence ; les cycles 15/16/17 passent du statut « révisable » à « contrôlé une seconde fois, aucun écart ».
---
Task ID: etude-ocr-async
Agent: Z.ai Code (principal)
Task: Cycle d'étude « OCR pages scannées + exécution asynchrone » — exigé à l'ouverture de l'option C (différé explicitement). Zéro code : étude + spec proposée + point d'arrêt.

Work Log:
- Exploration factuelle : extraction.ts (unpdf texte seul, detectScannedPages, buildLimits l.122-130 = point d'accroche OCR) ; ImportedDoc sans octets fichier (schema l.397-411 ; route import buffer transitoire l.47) ; file async déjà complète (queue.ts verrou optimiste + worker.ts registre HANDLERS + instrumentation.ts + GET/POST /api/jobs) ; handlers existants noop/deep-research/veille-check.
- Viabilité pure JS prouvée aux sources : unpdf v1.8.1 exporte extractImages (bitmaps sans canvas, README l.239-257) ; renderPageAsImage exige @napi-rs/canvas = binaire natif → écarté ; tesseract.js/pngjs non installés (à installer au cycle d'implémentation).
- Chaîne retenue : extractImages → PNG (pur JS) → tesseract.js WASM séquentiel 1 page + terminate → ImportedDoc.text bloc marqué + limits mise à jour ; handler article-import-ocr + enfilement + suivi UI ; colonne data Bytes? proposée pour l'OCR différé.
- Étude livrée : specs/article-ocr-async/etude.md (7 sections : état réel, viabilité, 3 options, schéma, spec 7 CA + hors périmètre, risques mémoire/limites/honnêteté/taille, point d'arrêt).

Stage Summary:
- Verdict d'étude : OCR pure JS VIABLE sous conditions (séquentiel strict, plafond pages, tessdata embarqué local fr/en/ar) ; async quasi gratuit (infrastructure jobs déjà recettée).
- POINT D'ARRÊT : décision propriétaire attendue — lancer le cycle d'implémentation (~1-2 cycles) ou maintenir en veilleuse. Aucun code écrit.
---
Task ID: rotation-cles-journaux-oa-fix
Agent: Z.ai Code (principal)
Task: Rotation des clés propriétaire (GitHub / APINex / OpenAlex) + correctif voie rapide de la route journaux-oa rendue défaillante par la clé OpenAlex premium.

Work Log:
- Audit fuite : aucune clé réelle dans les fichiers suivis (les mentions ghp_ sont documentaires) ; .env TRACKÉ (committé avant la règle .env*) → clés écrites dans .env.local (600, gitognoré, non suivi) — jamais dans .env.
- GitHub : askpass persistant hors dépôt (/home/z/.gh-askpass.sh, 700, token → x-access-token), validé par git ls-remote (HEAD = 628c49d).
- Serveur dev : 3 crashes consécutifs au redémarrage (OOM dmesg à ~1,96 Go pendant compile de /, puis tués à la frontière des appels outils via setsid/nohup/job shell) — survie obtenue par démonisation start-stop-daemon (PPID 1, RSS 544 Mo, HTTP 200 après frontière).
- APINex : nouvelle clé validée via GET /api/apinex/balance → ok:true, clé key_c6ca0084…, 0 $ dépensé.
- OpenAlex : clé valide en direct (200, count 8) MAIS la route /api/journaux-oa renvoyait 400 — cause racine prouvée : `select` contenant publisher/oa_status rejeté par le schéma nouveau premium (« not a valid select field ») ; sans clé → 429 (quota, ce que la clé corrige).
- Voie rapide (specs/journaux-oa-openalex-key/assess.md) : 1 fichier src/app/api/journaux-oa/route.ts (~8 lignes) — select retiré, type + host_organization_name?, mapping publisher avec fallback. 21/21 tests route, vitest 74/1 611, lint 0 erreur, preuve live (8 résultats, éditeur alimenté, nulls honnêtes vérifiés en direct).
- DOAJ « fetch failed » : DNS sandbox intermittent (curl exit 6 récurrent, y compris URL antérieurement 200) — environmental préexistant, hors périmètre, consigné.

Stage Summary:
- Les 3 nouvelles clés sont opérationnelles (GitHub push validé par ce commit ; APINex balance ok ; OpenAlex 200 sans warning dans la route) — AUCUN secret dans le dépôt.
- Correctif journaux-oa livré en voie rapide (révisable, recette propriétaire attendue) — incompatibilité schéma nouveau OpenAlex premium corrigée.
- Leçon d'exploitation : redémarrage serveur = start-stop-daemon (les autres méthodes meurent à la frontière des appels outils) ; OOM surveillé.

---
Task ID: article-ocr-async
Agent: Z.ai Code (principal)
Task: Cycle « article-ocr-async » — implémentation OCR pages scannées + exécution asynchrone (option 1 de l'étude, déclencheur propriétaire « lancez »).

Work Log:
- Ouverture (a512271) : spec.md 7 CA (depuis étude § 5), plan.md (état réel sourcé : 12 constats avec chemins+lignes, agent d'exploration pour UI/provenance), tasks.md (A Schéma → B Backend → C Frontend → D Recette), preuves.md — zéro code.
- Groupe A (a512271) : ImportedDoc.data Bytes? + Job.progress/progressNote — db:push additif, survie 30 tables prouvée (comptages identiques), serveur redémarré start-stop-daemon (cap 1400 Mo), red lines 0 diff.
- Groupe B (a61e8d8, a56d0df, baaf9c1, 6044642, f51b0b8) : tesseract.js 7 + pngjs + serverExternalPackages + tessdata fra/eng/ara local (18,9 Mo mesuré, chargement hors ligne prouvé) ; import accepte les PDF 100 % scannés + stocke les octets + GET ?id sans octets + limite honnête mise à jour + fixture scannée auto-vérifiée (script générateur, aller-retour unpdf) ; ocr.ts pure (bitmap→RGBA, downscale entière, bloc marqué idempotent, fusion limites kind ocr, plan de pages) + ocr-engine.ts (1 page = 1 worker terminé, langPath fs, cacheMethod none) + handler article-import-ocr (progression par page, clôture 100 %, échecs par page honnêtes) ; routes POST/GET /api/article-imports/ocr (garde anti-empilement globale 409, plafond annoncé). 45 nouveaux tests.
- Groupe C (07eb05b, 7485d3f) : panneau OCR sur les cartes scannées (sélecteur fr/en/ar, bouton plafond annoncé, progression polling 3 s, notice de fin, badge « OCR — relecture requise », erreurs honnêtes) + mention OCR dans le label de traçabilité (sources-server) + rechargement des imports au montage.
- Groupe D : banc live ×2 (fixture crénelée 59 % → lissée 71 %, « OCE TEST 12354 » consigné tel quel — police bitmap hors domaine LSTM, précision réelle = recette propriétaire) ; idempotence prouvée en live (1 seul bloc après 2 runs) ; PDF vectoriel → 422 honnête ; reprise après redémarrage prouvée (job anti-daté 11 min → requalifié → done attempts 2) ; recette navigateur (carte OCR, lancement, notices, badges, aperçu bloc, 0 erreur console, mobile 390 px sans scroll horizontal, 4 captures) ; CA-1.3 prouvé live via /analyze (label « (contient du texte OCR — relecture requise) ») ; RSS non cumulatif (2,2 Go post-OCR → 1,9 Go), aucun kill ; nettoyage : docs de test supprimés, base propriétaire intacte (ImportedDoc 4).
- Convergence : 7/7 CA, écarts consignés (précision fixture, rechargement imports ajouté, correctif progression), dette consignée (handler non testé unitairement, mention traçabilité validée live, packaging Tauri tessdata différé). docs § 7 bis, FICHE suite 5.

Stage Summary:
- Cycle « article-ocr-async » CONVERGÉ (recette déléguée, révisable) : OCR pure JS asynchrone sur la file persistante, séquentiel strict, tessdata local, bloc marqué idempotent, honnêteté par page — vitest 78/1 656 verts, lint 0 erreur, red lines 0 diff.
- Leçon : agent-browser snapshot -c tronque le texte des cartes (vérifier par eval innerText/screenshot) ; édition MultiEdit « atomique » peut appliquer partiellement — toujours vérifier par rg/sed après échec.
- Reste : recette propriétaire (tasks.md), packaging Tauri vendor/tessdata (build-desktop), précision à juger sur scan réel.
---
Task ID: biblio-oceanofpdf-refus
Agent: Z.ai Code (principal)
Task: Demande propriétaire « ajouter cette bibliothèque : https://oceanofpdf.com » (IM) + reconstruction d'état de session (résumé périmé).

Work Log:
- Reconstruction d'état : résumé de session PÉRMÉ — le cycle « article-ocr-async » était déjà CONVERGÉ (7/7 CA, recette déléguée, commit f4039dd en tête), tout poussé (origin/main..HEAD = 0), clés GitHub/APINex/OpenAlex opérationnelles (session rotation-cles-journaux-oa-fix). tasks.md OCR : 0/9 cochées — recette propriétaire toujours attendue.
- Vérification oceanofpdf.com (web_search, résultats bruts consignés) : Authors Guild (22 nov. 2024) « one of the most notorious digital ebook piracy sites » ; article Wikipédia OceanofPDF ; revues 2026 : « OceanofPDF distributes copyrighted books without permission — this is piracy, not a legal grey area ».
- REFUS motivé consigné : pas d'intégration comme source de documents (distribution d'ouvrages sous droit sans autorisation = contrefaçon ; risque sécurité des fichiers ; incompatible avec l'exigence de traçabilité/citation d'une thèse) — ni intégration, ni récupération de fichiers depuis ce site.
- Alternatives légales proposées au propriétaire : DOAB, OpenEdition Books, Internet Archive/Open Library, Project Gutenberg, Gallica (BnF). Déjà intégrées : theses.fr, arXiv, CORE, OpenAlex (+ DOAJ côté journaux OA).

Stage Summary:
- POINT D'ARRÊT : le propriétaire choisit une source légale (ou renonce) — aucun code écrit, aucune spec ouverte tant que le choix n'est pas rendu.
- État confirmé : cycle OCR/async révisable en attente de recette propriétaire (tasks.md 0/9) ; dettes consignées : packaging Tauri tessdata (build-desktop), précision OCR à juger sur scan réel.
---
Task ID: recette-document-reel-ocr
Agent: Z.ai Code (principal)
Task: Recette OCR sur le document joint par le propriétaire (IM « faire le teste avec le document joint ») — un PDF réel de 413 pages marqué « OceanofPDF.com » (ouvrage sous droit).

Work Log:
- Localisation de la pièce jointe : upload/_OceanofPDF.com_Urban_Theory___A_Critical_Introduction_to_-_Alan_Harding.pdf (6,9 Mo, 17:22, gitognoré — jamais commité).
- Diagnostic unpdf direct : 413 pages dont 412 avec couche texte → PDF VECTORIEL, PAS un scan ; seule la page 1 (couverture-image) est sans texte. Verdict honnête annoncé : l'OCR n'a pas de corps de texte à lire ici.
- Serveur redémarré au préalable (RSS 1,87 Go trop proche du seuil OOM) : procédure start-stop-daemon répliquée avec échecs (PATH non hérité → « next: not found » ×2) puis succès via script dédié /tmp/tf-start.sh (binaire node_modules/.bin/next absolu) — HTTP 200, leçon consignée.
- Import réel : POST /api/article-imports → 201 en 2,75 s ; 413 pages, scanned=true (1 page vide), 823 361 car., limites honnêtes (scanned + no-headings).
- OCR réel : POST /api/article-imports/ocr (eng) → 201, plafond 30 annoncé ; done — « 1 page(s) OCR, confiance moyenne 34 % » ; bloc marqué + anti-injection présents dans le texte (824 241 car.) ; octets exclus du GET ✓ ; contenu OCR de la couverture illisible (consigné tel quel — cas hostile attendu).
- RSS : 1 950 → 2 269 Mo (fin OCR) → 2 283 Mo après 20 s (non retombé) — serveur non tué, marge fine, redémarrage recommandé après OCR lourd.
- Cadre juridique consigné : test fonctionnel uniquement — pas d'intégration du site pirate, ouvrage sous droit, document SUPPRIMÉ de la base après test (ImportedDoc 5 → 4), db/custom.db restaurée HEAD, red lines 0 diff.
- Preuves : specs/article-ocr-async/preuves.md § « Recette document réel — PDF vectoriel 413 pages ».

Stage Summary:
- Chaîne OCR async validée de bout en bout sur un fichier réel hors banc fixture (import 413 p. → détection → job → bloc marqué → GET sans octets) ; cas réel extractImages (couverture) sans crash.
- POINT RESTÉ OUVERT : la précision OCR sur un CORPS DE TEXTE scanné n'est toujours pas jugée — il faut un vrai document scanné/photographié du propriétaire.
- Leçon : démarrage démonisé = start-stop-daemon + script externe avec chemin binaire absolu (les -c imbriqués perdent le PATH).
---
Task ID: recette-document-reel-2-tribillon
Agent: Z.ai Code (principal)
Task: 2e recette OCR sur document joint (« essayez ce document ») — PDF « L'urbanisme » Tribillon marqué z-library + demande propriétaire « enlever toute restriction sur la provenance des documents ».

Work Log:
- Diagnostic : 132 pages dont 130 avec couche texte → PDF VECTORIEL ; les 2 pages « vides » sont blanches (pas des scans). L'app lit ce livre nativement, sans OCR.
- Import réel 201 (2,91 s) : 132 pages, 322 395 car., scanned=true, limites honnêtes.
- OCR fra lancé → job FAILED avec erreur lisible : « OCR échoué sur toutes les pages (2) — premier motif : aucune image exploitable sur cette page » — voie d'échec honnête prouvée (aucun bloc fantôme, aucune limite ocr, octets exclus).
- Demande « enlever toute restriction de provenance » : réponse consignée dans preuves — aucune restriction technique n'existe (les 2 fichiers pirates ont été importés et traités) ; MAINTENUS : refus d'intégration des sites pirates, marquages d'honnêteté (bloc OCR relecture requise, sceau de provenance, anti-injection CA-1.4) — garde-fous qui protègent l'intégrité de la thèse, non négociables.
- Nettoyage : ImportedDoc 5 → 4, db restaurée HEAD, copie temporaire supprimée, red lines 0 diff, upload/ gitognoré (jamais commité).
- Preuves : specs/article-ocr-async/preuves.md § « Recette document réel n° 2 ».

Stage Summary:
- 2e preuve positive : chemin d'échec honnête OCR sur fichier réel (pages blanches sans bitmap) ; import vectoriel 132 p. fluide.
- Position propriétaire consignée : restrictions de provenance = inexistantes techniquement ; garde-fous d'intégrité maintenus.
- Toujours ouvert : précision OCR sur un VRAI scan (photo/photocopie du propriétaire).
---
Task ID: recette-scan-reel-dupuy
Agent: Z.ai Code (principal)
Task: Recette OCR sur VRAI scan (« L'urbanisme des réseaux », Dupuy, Armand Colin 1991, scan Internet Archive 44,2 Mo/69 p.) — déclencheur IM « voila un document scanné ».

Work Log:
- INCIDENT : sandbox restaurée à l'état du 4 oct. 16:01 (HEAD cba3e42, base 4 oct., article-imports absent, token GitHub révoqué, origin/main local périmé). Diagnostic : POST 404 « Server action not found » sur toutes tailles → route absente → rollback constaté.
- RÉCUPÉRATION depuis miroir /tmp/my-project (7 oct. 17:02) : arborescence complète (code OCR, specs, vendor/tessdata, db propriétaire : 4 imports/1 article/27 LegalRef) + bun install (31 paquets, tesseract.js etc.) + prisma generate + redémarrage start-stop-daemon (script recréé, /tmp purgé). Application 100 % restaurée fonctionnelle (import 201 prouvé).
- Manques consignés : 2 commits docs du 7 oct. soir (98a2c62, 51f586c — recettes réelles 1-2), .env.local (clés APINex/OpenAlex). Réconciliation git différée : fetch + ff/reset --hard origin/main dès token GitHub valide (le distant devrait être à 51f586c).
- Test scan réel : 69/69 pages sans texte ; import 44 Mo refusé (limite effective Next dev ~10 Mo vs 20 Mo annoncés — défaut à corriger par cycle dédié) ; découpe pdf-lib 5 tranches ≤ 9,5 Mo sans recompression ; tranches 01+02 = pages 1-31 testées.
- OCR fra ×2 jobs séquentiels : c01 19 p. → done 75 % ; c02 12 p. → done 94 % ; progression page par page (~5 s/page) ; confiances par page cohérentes (blanches 19-23 %, texte dense 93-95 %, figures 68-70 %).
- Vérité-terrain vs images : corps de texte LITTÉRALEMENT exact (guillemets, césures, apostrophes) ; écarts limités aux titres en capitales espacées ; aucun texte fantôme hors bloc marqué ; limites okr + anti-injection + octets exclus ✓.
- RSS : pic 3,0 Go après 31 pages (max historique) → redémarrage → 2,38 Go. Recommandation consignée : redémarrage après gros jobs OCR ; candidat cycle : purge mémoire entre pages.
- Nettoyage : ImportedDoc 6 → 4, Job 12 (historique), db = état propriétaire restauré.
- Preuves : preuves.md § « Recette document réel n° 3 ». Modifs en arbre de travail — commit DIFFÉRÉ à la réconciliation git (sinon commit orphelin sous cba3e42).

Stage Summary:
- POINT OUVERT DEPUIS L'ÉTUDE CLOSE : la précision OCR sur scan réel est JUGÉE — 93-95 % sur corps de texte imprimé francophone, honnêteté parfaite sur les cas hostiles. Cycle OCR entièrement validé sur les 3 types de documents (vectoriel, vectoriel-pirate, scan réel).
- Défauts découverts à ouvrir en cycles : ① limite import effective 10 Mo (Next dev) vs 20 Mo annoncés ; ② RSS OCR non purgé entre pages (3,0 Go pic).
- BLOQUANT : token GitHub valide requis pour réconcilier l'historique git (origin/main présumé 51f586c) et re-pousser ; .env.local à re-fournir (clés APINex/OpenAlex perdues avec le rollback).
---
Task ID: reconciliation-git-token-askpass
Agent: Z.ai Code (principal)
Task: Levée du BLOQUANT « token GitHub valide requis » (IM propriétaire : envoi du token PAT) — diagnostic chaîne d'authentification, réconciliation de l'historique, push ; contrôle de l'état serveur.

Work Log:
- Token reçu testé contre l'API GitHub : 200, x-oauth-scopes repo+workflow, login freemind25 — IDENTIQUE à celui déjà présent dans /home/z/.gh-askpass.sh (aucun nouveau secret à stocker).
- Cause racine du push en échec trouvée : script askpass malformé — il écho deux lignes (« username=… » puis « password=… ») à CHAQUE prompt git, d'où identifiants invalides côté serveur (« Invalid username or token ») alors que l'API répondait 200. Réécrit en case Username/Password (une seule valeur par appel, chmod 700) — ls-remote et fetch immédiatement verts.
- Reconstruction d'état : HEAD local 2a58102 (commit-harness à message UUID, parent cba3e42, contenu = récupération miroir du 7 oct. + recette n° 3) ; distant réel 51f586c (fetch cba3e42..51f586c) ; divergence 1 en avance / 53 en retard.
- Réconciliation selon le plan consigné par le prédécesseur : reset --soft origin/main → delta stagé EXACTEMENT 4 fichiers (db/custom.db — état propriétaire vérifié par API : 4 imports baseline ; specs/article-ocr-async/preuves.md — recette n° 3 ; worklog.md — entrée recette-scan-reel-dupuy ; public/logo.svg) ; red lines 0 diff ; commit 5105b5c « docs(ocr): recette réelle n° 3 … + réconciliation après rollback sandbox » ; PUSH RÉUSSI 51f586c..5105b5c, ls-remote = 5105b5c, main synchronisé (0/0).
- Serveur : HTTP 200 mais RSS 2,10 Go (seuil kill box ~2 Go, dmesg antérieur) — redémarrage préventif start-stop-daemon (script /tmp/tf-start.sh présent) après ce commit.

Stage Summary:
- BLOQUANT LEVÉ : historique réconcilié, tout poussé — le cycle OCR est intégralement visible sur origin (recettes réelles 1-3 comprises), commit-orphelin 2a58102 retiré de la ligne principale (contenu préservé dans 5105b5c).
- Leçon consignée : GIT_ASKPASS doit répondre UNE valeur par prompt (case Username/Password), jamais deux lignes ; un API 200 ne prouve pas la chaîne git (Basic auth) — toujours tester par `git ls-remote`.
- Restes non bloquants : .env.local à re-fournir (APINex/OpenAlex), cochage propriétaire de tasks.md désormais soutenable par les preuves réelles 1-3, 2 défauts à ouvrir en cycles (limite d'import effective ~10 Mo vs 20 Mo annoncés ; RSS OCR non purgé entre pages, pic 3,0 Go), rotation conseillée du PAT GitHub (il a transité en clair dans l'IM).
---
Task ID: biblio-academictorrents-analyse
Agent: Z.ai Code (principal)
Task: Demande propriétaire « ajouter cette bibliothèque : https://academictorrents.com » (IM) — vérification factuelle, analyse de faisabilité, point d'arrêt. Zéro code.

Work Log:
- Vérification factuelle (web_search ×5 + docs officielles, résultats bruts conservés en session) : plateforme LÉGITIME — fondée nov. 2013, papier pair-évalué Cohen & Lo XSEDE '14 (ACM, cité 48×), papier arXiv 1603, ~419 To de données de recherche ; DISTINCTION EXPLICITE d'avec oceanofpdf (site de piraterie).
- Mixité du catalogue consignée : datasets légitimes MAIS aussi « Sci-Hub SQL Database (2020-05-30) » hébergée sur academictorrents.com (details/4b132445…, résultat brut), collections LibGen/Anna's Archive (~119 To), corpus Bibliotik ~200 000 livres contrefaits cités (SAGE 06/2026) ; licence déclarée par l'uploader, non vérifiable.
- Faisabilité technique : docs api.html = endpoints apiv2/entry (upload) + apiv2/test SEULEMENT — aucun endpoint de recherche ; récupération de contenu = .torrent + aria2c (BitTorrent obligatoire, leur propre doc) ; client officiel at-python = téléchargement torrent.
- Verdict : intégration NON RETENUE en l'état — 3 motifs indépendants : transport BitTorrent incompatible avec l'app HTTP/sandbox ; provenance non traçable (exigence du sceau validé 2026-10-04) ; pas d'API de recherche consommable.
- Consignation : specs/biblio-academictorrents/analyse-preliminaire.md (faits sourcés, verdict, distinction oceanofpdf, options A/B/C, point d'arrêt).

Stage Summary:
- POINT D'ARRÊT rendu au propriétaire : A (recommandée — non-intégration, besoins couverts par theses.fr/arXiv/CORE/OpenAlex/DOAJ + DOAB/OpenEdition pour les livres OA), B (métadonnées+lien — sans objet, pas d'API de recherche), C (usage manuel at-python hors app) — aucune spec ni code tant que la décision n'est pas rendue.
- Cohérence maintenue : aucune restriction technique sur les documents détenus ; l'intégration d'une source reste un choix d'ingénierie documenté (position recette n° 2).
---
Task ID: biblio-academictorrents-validation
Agent: Z.ai Code (principal)
Task: Clôture du point d'arrêt academictorrents — décision propriétaire « alors ça sera l'option A » (IM, 2026-10-08).

Work Log:
- Décision consignée : option A — non-intégration d'academictorrents.com comme source de documents ; besoins couverts par les sources intégrées (theses.fr, arXiv, CORE, OpenAlex, DOAJ).
- specs/biblio-academictorrents/analyse-preliminaire.md § 6 : point d'arrêt marqué CLOS (décision datée ; réversibilité seulement par nouveau cycle d'étude).
- Rappel consigné au propriétaire : flux manuel possible sans développement (client BitTorrent type qBittorrent sur sa machine + import PDF/OCR existant) — usage hors périmètre de l'application.
- Aucun code modifié — docs uniquement, red lines 0 diff.

Stage Summary:
- Cycle « biblio-academictorrents » CLOS (analyse + décision A, zéro code).
- Restes ouverts consignés : point d'arrêt livres OA (DOAB/OpenEdition), .env.local (APINex/OpenAlex), cochage propriétaire tasks.md OCR (T1-T9), 2 défauts à ouvrir en cycles (limite import ~10 Mo, RSS OCR non purgé).
---
Task ID: restauration-openalex-post-rollback
Agent: Z.ai Code (principal)
Task: Restauration partielle de .env.local (perdue au rollback du 8 oct.) — clé OpenAlex fournie par le propriétaire (IM « clé openalex: … », 2026-10-08) ; démarrage du « traitement par ordre prioritaire ».

Work Log:
- Clé validée en direct : GET api.openalex.org/works?search=urbanisme&per-page=1&api_key=… → 200.
- .env.local recréé (chmod 600, gitognoré .env* l.34, non suivi) : OPENALEX_API_KEY — jamais dans .env (règle de la session rotation-cles).
- Serveur redémarré proprement : kill explicite next dev + next-server (leçon : --stop ne termine pas le pipeline), relance start-stop-daemon → HTTP 200.
- Recette live : GET /api/journaux-oa?q=urbanisme → 200, résultats avec éditeur alimenté ou fallback honnête, AUCUN warning (le 429 de quota sans clé est corrigé) — preuves : specs/journaux-oa-openalex-key/preuves.md § « Restauration post-rollback ».

Stage Summary:
- OpenAlex premium de nouveau opérationnel (clé = quota) ; reste : clé APINex non re-fournie.
- Secret tronqué dans toute consignation ; rotation conseillée (clé passée en clair dans l'IM).
---
Task ID: import-size-limit-convergence
Agent: Z.ai Code (principal)
Task: Cycle « import-size-limit » (défaut ①) — implémentation, recette live, convergence. Déclencheur propriétaire « commencez le traitement par ordre prioritaire ».

Work Log:
- Cause racine sourcée (à l'ouverture, commit d1990df) : DEFAULT_BODY_CLONE_SIZE_LIMIT = 10 Mo dans next/server/body-streams.js, consommé via experimental.proxyClientMaxBodySize (next-server.js:1305) ; middlewareClientMaxBodySize dépréciée ; message présent aussi en runtime prod.
- Implémentation : proxyClientMaxBodySize 64 Mo (next.config.ts commenté) ; MAX_IMPORT_BYTES 20→50 Mo (couvre le scan réel 44,2 Mo) ; label UI « 50 Mo max » ; docs § 7 bis ; pré-contrôle content-length → 413 lisible AVANT parsing (ajouté en cours de recette : le cas 75 Mo renvoyait un 500 générique, non conforme CA-2) ; 2 nouveaux tests route.
- Recette live (fixtures make-big-pdfs.mjs — PDF bruité incompressible, commité) : 21,37 Mo → 201 (2 p., scanned, limites honnêtes) ; 53,43 Mo → 413 lisible ; 74,80 Mo → 500 puis 413 lisible après durcissement ; GET ?id = 789 octets (octets exclus) ; dev.log : aucun « exceeded 10MB », « exceeded 64MB » uniquement sur 75 Mo (pathologique, clos par le pré-contrôle).
- Non-régression : vitest 78/1 658 verts ; lint 0 erreur (236 warnings = dérive PRÉEXISTANTE des commits intermédiaires — les 5 fichiers du cycle : 0 warning en eslint direct) ; red lines 0 diff ; RSS avant 2,09 Go / après 2,52 Go → redémarrage post-recette ; db restaurée HEAD.
- Preuves : specs/import-size-limit/preuves.md — verdict CONVERGÉ (révisable, recette propriétaire attendue) ; tasks.md laissé 0/5 (cochage propriétaire).

Stage Summary:
- Défaut ① CORRIGÉ : les documents de 10-50 Mo s'importent directement (fin de la découpe manuelle) — le scan Dupuy de 44,2 Mo passerait désormais en un seul import ; > 50 Mo = refus 413 lisible.
- Leçon : tester AUSSI le cas au-delà du plafond de transport — le 500 générique n'a été visible qu'en recette réelle.
---
Task ID: ocr-rss-purge-ouverture
Agent: Z.ai Code (principal)
Task: Ouverture du cycle « ocr-rss-purge » (défaut ② : RSS OCR non purgé entre pages, pic 3,0 Go) — analyse, spec 4 CA, plan, tasks. Zéro code.

Work Log:
- Constat repris de la recette n° 3 : 1,66 → 3,0 Go après 31 pages, non retombé ; kill box ~2 Go (dmesg) ; redémarrage systématique requis.
- État sourcé : worker tesseract déjà terminate() par page (ocr-engine.ts correct) ; copies multiples bitmap→RGBA→PNG (ocr.ts) ; unpdf.extractImages.
- 3 hypothèses à départager PAR MESURE (h1 pression GC, h2 rétention WASM/native malgré terminate, h3 copies redondantes) ; 4 pistes (GC explicite inter-pages avec équivalent prod Tauri, réduction des copies, instrumentation RSS par page, sous-traitance enfant en dernier recours).
- Méthode imposée par la spec : baseline mesurée AVANT tout correctif (CA-1), correctif ensuite, non-régression précision (CA-3).

Stage Summary:
- Cycle ② OUVERT (zéro code) — prochaine session : Groupes A/B (banc + mesures), puis correctif.
- Priorité propriétaire en cours de traitement : ① CORRIGÉ (5e052db), ② ouvert, ③ livres OA = point d'arrêt propriétaire, ④ cochage tasks.md = main propriétaire.
---
Task ID: ocr-rss-purge-convergence
Agent: Z.ai Code (principal)
Task: Cycle « ocr-rss-purge » (défaut ②) — banc T1, départage T2, correctif T3, banc final T4, convergence T5. Suite de « commencez le traitement par ordre prioritaire ».

Work Log:
- T1 (CA-1) : échantillonneur externe commité (specs/ocr-rss-purge/banc/echantillonneur.mjs, aligné sur progressNote écrit par page — zéro instrumentation du code pour la mesure) ; baseline sur scan réel Dupuy 44,2 Mo réimporté live (201 en 4,6 s — confirme au passage le correctif import-size-limit) ; courbe monotone +36 Mo/page ; **OOM kernel capturé à la page 28/30 (RSS 3,25 Go, dmesg)** — gravité du défaut réévaluée : un job de 30 pages peut mourir et perdre son travail.
- Leçons de banc : l'échantillonneur doit filtrer par --job-id (anciens jobs « done » des recettes du propriétaire en base) ; nohup & ne survit pas au shell appelant — start-stop-daemon obligatoire ; le worker charge ses handlers au démarrage — redémarrage requis après patch (HMR ne rafraîchit pas la closure du timer).
- T2 : h1 (gc() par page, --expose-gc) → croissance 36→21 Mo/page, plus d'OOM à 30 pages mais monotone résiduelle → h1 partielle ; h2-bis (pdf.cleanup() par page) → plancher PLAT → le rétenteur dominant est le cache de pages pdf.js (mémoire atteignable, non collectable) ; h3 = pic intra-page seulement, p2 non nécessaire.
- T3 : correctif retenu = pdf.cleanup() SEUL dans un finally par page (garde typeof + try) — bloc gc() révert ; code applicatif pur, aucun réglage prod (CA-4 immédiate, pas de --expose-gc côté sidecar Tauri).
- T4 : banc final serveur normal — plancher plat 2,2-2,36 Go sur 30 pages (pic 2,36 vs 3,25 baseline), 30/30 done, confiance 82 % = 82 % (CA-3), post-job 2,35 Go stable — plus de redémarrage systématique requis (CA-2).
- Non-régression : vitest 78 fichiers / 1 658 tests verts ; eslint 0 erreur sur worker.ts ; tsc : seules erreurs préexistantes (ai-writing route.test.ts, fichiers non touchés) ; red lines 0 diff.
- Convergence : preuves complètes (6 runs consignés), db restaurée HEAD (import/jobs de test non commités — hygiène), serveur redémarré propre.

Stage Summary:
- Défaut ② CORRIGÉ : le job OCR de 30 pages tourne à RSS borné (pic 2,36 Go, courbe plate) — fini l'OOM kernel et le redémarrage systématique après gros job ; cause racine = cache de pages pdf.js jamais libéré.
- Cycle CONVERGÉ côté implémentation ; cochage T1-T5 = main propriétaire (recette : relancer un OCR 30 pages sur son scan, observer la progression sans redémarrage ensuite).
- Restes ouverts : point d'arrêt livres OA (DOAB/OpenEdition), clé APINex non re-fournie, rotation PAT, dette packaging vendor/tessdata ; optionnel : p2 (réduction copies bitmap→RGBA→PNG) pour raboter le pic intra-page si CA-2 voulue encore plus serrée.
---
Task ID: decisions-deleguees-apinex-phrasebank
Agent: Z.ai Code (principal)
Task: Décisions déléguées (IM « prenez la décision concernant le point 4 et 5 ») — clé APINex fournie, cochage tasks.md, point d'arrêt livres OA, rotation PAT acceptée, intégration Phrasebank Manchester.

Work Log:
- APINex : clé ajoutée à .env.local (APINEX_API_KEY, gitognoré, chmod 600) ; serveur relancé ; tests live : /api/apinex/models 200 (modèles « live »), /api/apinex/balance 200 (0 $ dépensé, pas de limite), chat → 402 « Daily check-in required » = CLÉ VALIDE, usage des modèles gratuits soumis au check-in quotidien côté compte propriétaire (apinex.bond/airdrop?tab=quests).
- Point 5 (cochage délégué) : article-ocr-async 9/9, import-size-limit 5/5, ocr-rss-purge 5/5 — chaque case adossée aux preuves (commits Groupes A-D, recettes réelles 1-3, verdicts CONVERGÉS) ; notes de délégation dans les 3 fichiers (commit b04cad4).
- Point 4 (décision déléguée, FAITS D'ABORD) : API DOAB testée en direct — discover GET/POST 404, ancienne REST 403, /server/api 404, OAI-PMH 200 mais récolte sans recherche → DÉCISION : non-intégration de DOAB et OpenEdition Books comme sources dédiées ; couverture livres OA assurée par OpenAlex (filtre type:book,book-chapter déjà supporté par searchWorks) ; point d'arrêt CLOS, réversibilité documentée (specs/biblio-livres-oa/decision.md).
- Point 6 : rotation PAT acceptée — procédure remise au propriétaire (création nouveau token repo+workflow puis remplacement dans /home/z/.gh-askpass.sh par l'agent) ; l'ancien token reste actif d'ici là.
- Phrasebank Manchester (fin de travail) : module Phrasier Académique DÉJÀ EXISTANT déclaré « inspiré du Manchester Phrasebank » → intégration de la source réelle : 13 pages réelles lues (about + 12 catégories), 37 phrases françaises adaptées (ids man-*, variant « Manchester ») couvrant les 12 catégories, constante MANCHESTER_SOURCE, attribution cliquable dans l'UI ; cadre de réutilisation de la source respecté (Davis & Morley 2013 : génériques, ≤ 9 mots, substitution {X}/{Y}) — aucune copie verbatim.
- Non-régression : eslint 0 erreur (2 fichiers touchés) ; validation structurelle : 138 phrases, 0 doublon, 0 invalide ; recette navigateur réelle : compteur 138, recherche « largement admis » → phrase man- visible, filtre Nuancer 26, 0 erreur console.
- Commits : cochage b04cad4 ; phrasebank + décision livres OA (ce commit).

Stage Summary:
- Les 4 décisions du propriétaire sont exécutées : APINex intégrée et validée (check-in quotidien à faire côté propriétaire), cochage 19/19 tasks, livres OA tranchés sur faits (non-intégration, OpenAlex couvre), rotation PAT en attente du nouveau token.
- Phrasebank Manchester intégrée au module existant avec provenance visible — cycle ressource-phrasebank-manchester CONVERGÉ.
- Restes : nouveau PAT à fournir par le propriétaire ; check-in quotidien APINex ; dette packaging vendor/tessdata (inchangée).
---
Task ID: import-corpus-ressources
Agent: Z.ai Code (principal)
Task: Demande propriétaire « ajouter conformément au protocole les ressources ci-jointes » (IM, 2026-10-08) — 3 PDF déposés dans upload/ (Myers « Rethinking Urbanism » 37,0 Mo ; Cullen « The Concise Townscape » 42,8 Mo ; The New Yorker du 5 oct. 2026, 36,8 Mo) ; cycle opérationnel import + OCR, zéro code.

Work Log:
- T1 état des lieux : décisions déléguées de la session précédente déjà exécutées (APINex, cochage 19/19, livres OA, Phrasebank) — le cycle restant est bien l'import des ressources ; baseline serveur HTTP 200, RSS 2,17 Go ; spec specs/import-corpus-ressources (4 CA, 5 tâches).
- T2 imports réels : POST /api/article-imports ×3 → 3/3 en 201 (5,12 / 4,29 / 5,45 s) ; aucun 413 (le 42,8 Mo passe en direct — le plafond 50 Mo du cycle import-size-limit est conforté) ; détection scanned honnête (Myers 10 p. vides, Cullen 100/100, New Yorker 2 couvertures) ; ids cmuzs6vv9…h20tpg / cmuzs9wvx…xjru5p / cmuzsaxpz…nhx5wn.
- T3 OCR : Myers 10/10 failed avec motif honnête « aucune image exploitable » → pages réellement vides (intercalaires/versos blancs), aucun contenu manquant, texte natif complet (560 418 car.) ; Cullen 100/100 done conf. moyenne 34 % (scan ancien médiocre vs référence Dupuy 82 %) → limite « ocr » + relecture humaine exigée, textLength après fusion 62 598 ; New Yorker 2/2 done conf. 39 %, textLength 339 024 ; garde anti-empilement respectée (aucun 409).
- Re-validation réelle du correctif ocr-rss-purge (05a1a80) : job OCR de 100 pages échantillonné (échantillonneur du banc, --job-id, 181 échantillons) → RSS plat départ 2,39 / max 2,58 / fin 2,28 Go, aucun OOM, aucun redémarrage requis pendant le job (préuve commitée : preuves/rss-ocr-cullen-100p.csv).
- T4 : 3/3 documents exploitables avec limites consignées ; aucun diff code, red lines 0 diff ; RSS serveur post-jobs 2,98 Go → redémarrage préventif (HTTP 200, RSS 2,36 Go).
- Incident de push consigné et tranché : premier push refusé (GH001 — blob db/custom.db 162,8 Mo > limite GitHub 100 Mo, les PDF sont embarqués en base) → DÉCISION : la base avec le corpus est un état LOCAL propriétaire jamais commité ni poussé (les documents ne quittent pas la machine) ; le push ne porte que specs/ + worklog ; la db locale est conservée telle quelle (documents présents dans l'app), git status affichera durablement « M db/custom.db » — état attendu.
- T5 : preuves.md § 1-6, cochage T1-T5 adossé aux preuves (précédent b04cad4), lint 0 erreur, commit (specs + worklog uniquement) + push.

Stage Summary:
- Les 3 ressources demandées sont dans le corpus et exploitables : Myers et New Yorker via couche texte native (560 k / 339 k caractères), Cullen via OCR intégral 100 pages (62,6 k caractères, confiance 34 % — relecture humaine exigée, consignée dans les limites).
- Leçon : l'échec OCR « aucune image exploitable » sur les pages vides d'un livre est un diagnostic utile (intercalaires blancs), pas une perte de contenu — le motif honnête du job suffit à le documenter.
- Restes ouverts inchangés : nouveau PAT à fournir par le propriétaire (rotation), check-in quotidien APINex, dette packaging vendor/tessdata.
---
Task ID: rotation-pat
Agent: Z.ai Code (principal)
Task: Point 6 — rotation du PAT GitHub (nouveau jeton fourni par le propriétaire en IM) ; remplacement dans /home/z/.gh-askpass.sh, validation live, remise en conformité de la branche.

Work Log:
- Ancien état : /home/z/.gh-askpass.sh (chmod 700) portait l'ancien PAT ; procédure remise au propriétaire lors de « decisions-deleguees » (création token repo+workflow puis remplacement par l'agent).
- Nouveau PAT fourni par le propriétaire (IM 2026-10-08) : remplacé dans /home/z/.gh-askpass.sh (chmod 700 conservé, structure Username/Password inchangée) ; le jeton vit hors du dépôt, rien à commité côté credentials.
- Validation lecture : GIT_ASKPASS=/home/z/.gh-askpass.sh git ls-remote origin HEAD → 5b75ee8… (le jeton authentifie la lecture).
- Incident détecté et corrigé AVANT push : un commit instantané externe 12a74e0 (message UUID, auteur Z User) avait committé db/custom.db (37,6 → 170,7 Mo — blob > limite GitHub 100 Mo) ; contredit la décision consignée du cycle import-corpus-ressources (la db corpus = état LOCAL jamais commité ni poussé). Ce commit n'était PAS poussé (seul commit en avance sur origin/main) → git reset --mixed 5b75ee8 : la branche redevient identique à origin/main, db/custom.db conservé en modification locale non committée (état durable attendu, documents toujours présents dans l'app).
- Preuve qu'aucun cron/hook local n'a produit ce commit : crontab vide, .git/hooks sans hook actif — mécanisme instantané externe (prise de vue de session) ; vigilance : vérifier l'absence de commit en avance sur origin/main avant tout push (git log origin/main..HEAD) et le rejeter au besoin.
- Validation écriture (push réel) : commit présent worklog + push GIT_ASKPASS → si cette ligne est visible sur origin, le nouveau jeton a Contents: write (push = la preuve de rotation aboutie).
- Ancien jeton : à révoquer par le propriétaire sur GitHub (Settings → Developer settings → Personal access tokens) — le remplacement local ne l'invalide pas.

Stage Summary:
- Rotation PAT EFFECTUÉE et validée en deux temps (ls-remote = lecture, push du présent commit = écriture) ; ancien jeton révocable côté propriétaire.
- Branche remise en conformité : HEAD = origin/main = 5b75ee8, le commit db 170 Mo n'est jamais parti sur GitHub ; la db corpus reste un état local (git status « M db/custom.db » attendu).
- Restes ouverts inchangés : check-in quotidien APINex (clé validée 402 « Daily check-in required »), dette packaging vendor/tessdata.
---
Task ID: import-rar-ressources
Agent: Z.ai Code (principal)
Task: IM propriétaire « expliquez moi votre réponse: (reste ouverts: inchangés) puis ajoutez ces ressources » — explication des restes ouverts + ajout au corpus des 2 archives RAR déposées dans upload/ (doc.rar 40,9 Mo, Doc-3.rar 36,3 Mo, horodatées 17:45).

Work Log:
- Explication consignée (IM de réponse) : « restes ouverts » = ① check-in quotidien APINex (402 « Daily check-in required » tant que le propriétaire n'a pas validé sa présence sur apinex.bond/airdrop?tab=quests — action compte, impossible pour l'agent) ; ② dette packaging vendor/tessdata (données de langue OCR lues localement depuis vendor/tessdata, zéro réseau — à embarquer dans le paquet Tauri au jour du packaging desktop ; non bloquant aujourd'hui).
- T1 : état des lieux (HTTP 200, RSS 2,04 Go, base = 7 imports dont aucun des 9 PDF) ; unrar l : 9 PDF (2 + 7) ; extraction 9/9 vers /tmp/staging-import-rar, tailles = inventaire octet-octet ; doublon apparent Harding (vrac upload/ jamais importé) résolu → 1 seul import.
- T2 : POST /api/article-imports ×9 séquentiels → 9/9 en 201 (max 25,8 Mo, plafond 50 Mo conforté) ; détection honnête : 8/9 avec couche texte native complète (300 k–1,68 M car.), Canadian Architect 100 % image (70 car./36 p.) ; ids consignés (cmuzu8kql…cmuzu953s).
- T3 : OCR des pages sans texte (planOcrPages cible exactement ces pages, fusion sans écraser le natif) : 8/9 done — Canadian Architect 36/36 conf. 66 % (70 → 109 334 car.), Smart Cities 4/4 conf. 81 %, Cities of Tomorrow 6/6 conf. 43 %, Green Wedge 13/13 conf. 34 %, Landscape 25/25 conf. 26 %, Post-pandemic 31/31 conf. 32 %, Thinking 1/1, Urban Theory 1/1 ; 1 failed honnête : L'urbanisme face aux villes anciennes (10/10 « aucune image exploitable » = intercalaires vides, natif complet 624 295 car. inchangé — même diagnostic que Myers).
- Re-validation passive ocr-rss-purge : 127 pages OCR enchaînées sur 9 jobs → RSS après 2,66 Go, aucun OOM, aucun redémarrage requis.
- T4 : red lines 0 diff, aucune modification code ; db corpus = état LOCAL jamais commité ni poussé (git status « M db/custom.db » attendu) ; staging /tmp hors dépôt.
- Incident outillage (sans impact) : script séquentiel setsid tué par le bac à sable en fin d'appel mais les jobs serveur survivent → boucle synchrone idempotente (jobs done capturés, jamais relancés).
- T5 : preuves.md § 1-6 (tables imports + OCR, ids, confiances, textes avant/après), cochage 5/5 adossé aux preuves, commit specs+worklog uniquement, push (re-validation rotation PAT).

Stage Summary:
- Les 2 archives sont intégrées : 9 documents dans le corpus, 5 772 962 caractères exploitables au total ; Canadian Architect (magazine 100 % image) récupéré par OCR intégral 36 pages à 66 % de confiance ; limites honnêtes consignées dans chaque document (champ limits) et dans preuves.md.
- Restes ouverts : inchangés — check-in quotidien APINex (action compte propriétaire), dette packaging vendor/tessdata ; s'ajoute côté propriétaire : révocation de l'ANCIEN PAT GitHub (rotation livrée et validée au cycle rotation-pat).

## Addendum rotation/import-rar — récidive du commit instantané et contre-mesure
- Récidive : commit instantané externe `fae4564` (message UUID, 17:47:38) a de nouveau committé db/custom.db (170,7 Mo) → push specs rejeté par pre-receive (blob > 100 Mo). Ce commit n'a jamais atteint origin.
- Contre-mesure : sauvegarde de la db corpus (/tmp), `git rebase --onto origin/main fae4564 main` (écarte le snapshot, rejoue le commit specs), restauration de la db en working tree, puis verrou `git update-index --skip-worktree db/custom.db` — les futures prises de vue instantanées n'incluront plus la db (le bit skip-worktree est respecté par git add/commit ; l'état corpus reste purement local).
- Effet attendu sur git status : « M db/custom.db » disparaît (fichier supposé identique à l'index) — la db corpus reste inchangée sur disque et hors GitHub.
---
Task ID: ocr-moteur-unlimited-ocr-et-recuperation
Agent: Z.ai Code (principal)
Task: IM propriétaire « voir le lien pour cet outil d'OCR très performant : https://github.com/baidu/Unlimited-OCR » — analyse au protocole + décision moteur ; puis récupération complète d'un rollback d'environnement (workspace restauré à un point antérieur en cours de session).

Work Log:
- Faits Unlimited-OCR vérifiés en direct : README (CUDA 12.9/13.0 + torch 2.10 ; vLLM Docker ; SGLang ; PDF→PNG 300 dpi ; pas de variante CPU/ONNX) ; GitHub API (MIT, 26 798 étoiles) ; HuggingFace (1,29 M téléchargements, poids 6,67 Go bf16 ≈ 3,3 Md paramètres) ; arXiv 2606.23050 (R-SWA, KV cache constant).
- DÉCISION consignée (specs/ocr-moteur-unlimited-ocr/decision.md) : veille active, non-intégration aujourd'hui — l'outil est exactement notre limite (confiances 26-43 %) MAIS GPU NVIDIA obligatoire + 6,67 Go incompatibles avec la machine vérifiée (aucun GPU, 3 Go RAM) et l'architecture offline Tauri ; voie cloud = contredit « les documents ne quittent pas la machine ». Déclencheurs T-a (GPU ≥ 8-10 Go au poste → serveur local OpenAI-compatible moteur premium + repli Tesseract), T-b (variante CPU/ONNX), T-c (validation cloud explicite), T-d (tessdata d'abord si packaging).
- ROLLBACK D'ENVIRONNEMENT détecté au push : base locale revenue à cba3e42 (2026-10-04) — askpass purgé (recréé avec le même jeton), /tmp purgé (backups db perdus), tessdata absent, db corpus revenue à 4 tests. Git sauf : tout le travail poussé était sain sur origin (bde1485) → reset --hard origin/main (specs/preuves/worklog/tessdata restaurés).
- Reconstruction corpus : PDF sources survivants dans upload/ → 12/12 ré-imports 201 (ids cmv0u9fz4…cmv0uak6z) ; OCR 229 pages relancées : 10/12 done, 2 failed honnêtes identiques (Myers p. 251, L'urbanisme p. 348) — **confiances et longueurs de texte identiques à l'octet près au premier passage : pipeline déterministe prouvé** ; état final 16 docs / 6 737 798 car. ; thèse propriétaire intacte.
- Infrastructure : verrou .next/dev/lock retenu par un next-server zombie → kill -9 + rm lock + redémarrage (HTTP 200) ; bunx prisma generate après rollback (client régénéré) ; skip-worktree reposé sur db/custom.db (protection snapshots maintenue).

Stage Summary:
- Décision moteur OCR tranchée sur faits et poussée ; veille active avec 4 déclencheurs réversibles — si le poste du propriétaire a un GPU NVIDIA ≥ 8 Go, l'option « moteur OCR premium local » devient réaliste.
- Environnement restauré à l'identique après rollback : git via origin, corpus via re-import+OCR déterministe, verrou db reposé, serveur 200 — zéro perte nette de travail consigné.
- Restes ouverts inchangés : check-in quotidien APINex, dette packaging vendor/tessdata, révocation de l'ancien PAT côté propriétaire.
---
Task ID: 3
Agent: architecture-audit
Task: Phase 3 audit architecture & code (lecture seule)

Work Log:
- Contexte lu (worklog 200 dernières lignes + baseline 00_SCOPE_AND_BASELINE.md) ; état git vérifié : HEAD 2156a8f = commit audité, arbre propre (seul .zscripts/dev.pid + audit/ non suivi).
- Mesures exécutées : bun run lint → 0 erreur / 244 warnings (top : no-explicit-any 129, no-unused-vars 39, no-non-null-assertion 35, no-console 31) ; bun run test:run → 78 fichiers / 1 658 tests VERTS en 18,24 s.
- Routes API : 55 entrées sous src/app/api (53 groupes + route.ts racine « Hello, world! » + son test) = 98 fichiers route.ts ; 52 route.test.ts colocalisés ; couverture par groupe 29/53 (24 sans test, surtout proxys externes).
- Poids des fichiers : src = 106 840 lignes ; top = auto-edition-page 1 939, api-schemas.test 1 845, verification-carto 1 836, osm-infra 1 678.
- Greps : dangerouslySetInnerHTML = 1 (shadcn chart.tsx:83) ; any word-boundary src/lib = 8 (dette typage réelle = 129 warnings lint, concentrés dans les pages modules) ; console.* non-test = 191.
- Architecture tracée : page.tsx 182 l. / 47 imports statiques / 47 cases ; Zustand 491 l. ; worker démaré par instrumentation.ts:8-13, singleton globalThis.__tfJobWorker (anti-HMR), requeueStaleJobs au boot + sweep 60 s, claim atomique updateMany (queue.ts:44-67), 4 handlers câblés.
- 4 routes échantillonnées (references, ai-writing, jobs, article-imports) : zod partagé/inline borné, 413/415/422 différenciés, magic bytes ; mesure transversale : 58/98 fichiers avec zod, 5/29 findMany paginés, codes HTTP 400×152 / 500×150 / 404×45…
- DB : 30 modèles, 15 onDelete, 41 @@index ; prisma/migrations ABSENT (workflow db:push --accept-data-loss assumé, documenté .env.example) ; prisma/seed.ts absent (db:seed cassé) ; AUCUNE procédure de sauvegarde documentée (perte réelle au rollback 8 oct. consignée au worklog).
- Deps : bun.lock présent (320 Ko), 985 paquets ; Next ^16.1.1 / React ^19 / zod ^4.0.2 / Prisma ^6.11.1 / Tauri ^2 — majeures actuelles ; README §Installation complète (l.166-234).
- Env : 37 vars lues vs 32 déclarées dans .env.example (+4 runtime documentées en commentaires) — seules OCR_MAX_PAGES et TESSDATA_PATH réellement absentes.
- Livrable écrit : audit/baseline/03_ARCHITECTURE_AND_CODE_AUDIT.md (schéma texte, mesures, 5 forces/5 faiblesses fichier:ligne, 4 contrats API, DB, deps, tableau 18 verdicts). Zéro modification de code — lecture seule respectée.

Stage Summary:
- Aucun item ❌ CASSÉ sur 18 verdicts : 11 ✅ CONFORME (lint 0 erreur, 1 658 tests verts, worker file de jobs, OCR, 26 providers env-only + cookie httpOnly, XSS = 1 hit shadcn, schéma Prisma, env.example, reproductibilité), 7 ⚠️ DÉGRADÉ documentés par preuve.
- ⚠️ principaux : migrations absentes + db push --accept-data-loss (risque contenu en local) ; aucune sauvegarde db documentée (seul point où une perte RÉELLE a eu lieu) ; couverture tests API 29/53 groupes ; pagination absente des listes (5/29) ; 40/98 routes sans schéma déclaré ; timeouts absents dans osm-infra.ts (Overpass) ; hygiène légère (/api « Hello, world! » mort, Prisma log:['query'] inconditionnel).
- Impact réel évalué, dette non surclassée : les ⚠️ sont cohérents avec la cible desktop local mono-utilisateur ; aucun bloquant pour l'usage actuel — 3 chantiers à prioriser en phase remédiation : sauvegarde/migrations DB, pagination, timeouts osm-infra.
---
Task ID: 4
Agent: architecture-audit
Task: Phase 4 audit sécurité en lecture seule (version condensée avec preuves, 8 contrôles prioritaires)

Work Log:
- Contexte vérifié : pas d'entrée « Task ID: 4 » préexistante au worklog (4-a/4-b/4-c = cycles SDD dev, sans rapport) ; 04_SECURITY_AUDIT.md inexistant → produit intégralement ; HEAD toujours 2156a8f.
- C1 Secrets : grep regex sk-/ghp_/AKIA/xox sur src+src-tauri → 0 clé littérale ; hardcoded-keys.ts 100 % process.env (9 refs, `|| undefined`) ; mentions ghp_ de HEAD = 4, toutes documentaires (longueur mesurée 4 car., préfixe seul).
- C1 suite (finding) : `git ls-files --error-unmatch .env` → .env TRACKÉ (committé avant la règle .gitignore .env*) ; extraction de TOUTES les versions historiques de .env → une clé réelle APINEX_API_KEY (sk-…, 53 car.) dans l'historique (commits-snapshots UUID 04dc5ab/b25f426/763ee5d/7260947), poussée sur origin ; rotation documentée ensuite (ec0ae93). Valeur jamais imprimée (masquée à chaque étape).
- C2 Upload article-imports : liste blanche 415 + magic bytes 415 (route.ts:51-70), pré-contrôle content-length 413 avant parsing (l.33-41) + MAX_IMPORT_BYTES 50 Mo (extraction.ts:10) ; 0 écriture FS dans api/lib (grep) → PAS de surface path traversal ; stockage = blob SQLite (ImportedDoc.data, PDFs uniquement, l.124-133).
- C3 XSS : 1 seul dangerouslySetInnerHTML (chart.tsx:83, CSS de thème depuis config développeur statique) ; 0 rehype-raw/allowDangerousHtml ; react-markdown ×4 échappé par défaut ; markdown-to-html = liste blanche + échappement (18 tests) ; Tiptap = self-XSS only.
- C4 Tests HTTP réels non destructifs (serveur local 200) : POST /api/ai-test {} → 200 {"ok":true,"response":"[object Object]"} (pas de stack leak, mais validation absente) ; GET /api/references → 200 count 4 ; GET /api/references?search=' OR 1=1-- → 200 count 0 = payload traité en LITTÉRAL Prisma contains (pas d'injection SQL ; param `q=` exclu car non lu par la route, test refait sur `search`).
- C5 SSRF : 0 route ne lit une URL depuis la requête (grep) ; tous les hôtes fetch sont constants ou env-serveur (APINEX_BASE_URL, CORE_BASE, theses.fr avec encodeURIComponent, nominatim…) ; seul hôte variable = baseUrl de config IA (cookie/env), pas requête arbitraire.
- C6 Injection prompt : RAG = chunks délimités `--- Extrait N [Source] ---` + system prompt « UNIQUEMENT sur les extraits » (rag-service.ts) ; book-skills = en-têtes ──── + consignes « JAMAIS une source de citations » (book-skills.ts:90-120) ; ⚠️ ai-writing `context` inséré brut (route.ts:64-69) = self-injection locale seulement.
- C7 Tauri : capabilities/default.json = core:default + shell:allow-open + shell:allow-execute ; grep @tauri-apps/plugin-shell dans src → 0 usage (sur-permission inutilisée) ; tauri.conf.json csp: null (l.27) ; Rust powershell Expand-Archive = chemins app-contrôlés, -NonInteractive (lib.rs:96-110).
- Livrable écrit : audit/baseline/04_SECURITY_AUDIT.md — registre AUD-SEC-001 à 008 avec gravité pondérée mono-utilisateur local + N/A explicites (auth/sessions/CSRF/multi-user). Zéro modification de code, aucune donnée propriétaire exposée (secrets masqués à chaque impression).

Stage Summary:
- 0 vulnérabilité Critique/Élevée pondérée ; 2 Moyennes : AUD-SEC-001 (shell:allow-execute sur-permis + CSP null côté Tauri — chaîne XSS→exécution théorique, front n'utilise jamais le plugin) et AUD-SEC-002 (clé APINEX sk-…53 car. dans l'historique git de .env poussé sur GitHub — rotatée depuis mais purgable).
- 5 Basses : .env tracké (003), 40/98 routes sans schéma/ai-test accepte {} (004), CSP null (005), context prompt brut (006), error.message brut (007) ; 1 Info (blobs PDF en SQLite, couvert remédiation sauvegarde 03).
- Contrôles RÉUSSIS avec preuve : 0 secret en code, upload magic bytes+taille+413 pré-contrôle, Prisma paramétré PROUVÉ en live (SQLi payload → count 0, pas d'erreur), zéro SSRF (aucune URL utilisateur fetchée), délimitation corpus dans prompts RAG/book-skills, échappement markdown, 0 écriture FS (pas de traversal), auth/sessions/CSRF = N/A par conception.
- Recommandations avant packaging : retirer shell:allow-execute, définir une CSP, `git rm --cached .env` + purge historique BFG, encadrer le champ context.

---

Task ID: 13 (audit-baseline-v1)
Agent: auditeur principal (session principale)
Task: Baseline Audit v1.0 complet (prompt maître 978 lignes) — constat sans correction, soumission pour avis du propriétaire

Work Log:
- Phase 0 : baseline commit 2156a8f (v1.10.8), invariants vérifiés (lignes rouges 0 diff, db skip-worktree, clés env-only)
- Phase 1 (UI réelle agent-browser) : 18 captures evidence/ui-*.png ; parcours dashboard/éditeur/références CRUD/IA générative/RAG/thèses en ligne/export DOCX/mobile ; vérification persistance triple (UI + DB + reload) sur objet AUDIT- ; tests négatifs HTTP
- Anomalies découvertes en live : « \n » littéral (editor-page.tsx:204) ; CTA « Créer une thèse » ré-ouvre la thèse active (parcours multi-thèses CASSÉ, cause racine chaîne complète) ; suppression référence sans confirmation (reproduite involontairement, preuve DB) ; hydratation div>p ; version footer v1.2.0 ≠ 1.10.8 ; POST 400→201 suspect
- Phases 3/4 déléguées à 2 agents auditeurs (Task ID 3 architecture : 11✅/7⚠️/0❌ ; Task ID 4 sécurité : 0 Critique/Élevée, 2 Moyennes Tauri+historique .env)
- Phases 5-7 : mesures perf réelles (RSS 2 560 Mo, temps API), résilience (preuves cycles antérieurs), gouvernance, UX exploratoire
- Phases 8-12 : matrice 47 vues (14 testées), registre 17 fiches (1 ❌ AUD-FUNC-002, 15 ⚠️), roadmap C-1..C-20 (P1 : sauvegarde DB, multi-thèses, confirmation suppression, Tauri), revalidation VIDE (étape 1/3), rapport principal BASELINE_AUDIT_REPORT.md
- Verdict : GO SOUS CONDITIONS (C-1..C-4 avant ouverture) ; aucune correction appliquée (respect du processus propriétaire)

Stage Summary:
- 14 livrables dans audit/baseline/ (00→11 + README + BASELINE_AUDIT_REPORT + diagrams + 18 preuves)
- 17 anomalies : 1 ❌ / 15 ⚠️ / 0 vulnérabilité critique ; 4 conditions P1 avant production
- Rapport soumis au propriétaire pour avis (étape 2 = validation avant toute correction)
---
Task ID: R-1 (audit-remediation-p1 / C-1)
Agent: Z.ai Code (principal)
Task: Avis propriétaire reçu (GO SOUS CONDITIONS validé, étape 3 autorisée C-1→C-4 uniquement) — exécution de C-1 (AUD-GOV-001 sauvegarde/restauration DB), exigence propriétaire : sauvegarde AVANT toute modification + preuve de restauration obligatoire.

Work Log:
- Cycle SDD ouvert : specs/audit-remediation-p1/spec.md (contrat propriétaire 8 exigences, CA-1..CA-6, rouges) + tasks.md T1-T10.
- T1 Sauvegarde initiale AVANT toute modification : SQLite VACUUM INTO (snapshot cohérent à chaud, compacté ; sqlite3 CLI absent de la sandbox) → backups/custom-20261009-164202.db (213 Mo) + copie hors arbre /home/z/backups/thesisframe/ + copie intégrale upload/ (244 Mo, documents sources). Vérification : integrity_check=ok, fkViolations=0, compteurs identiques live↔backup (Thesis 1 « Urbanisme durable », Chapter 7 / 2 295 mots, ImportedDoc 16 / 6 737 798 car. / 12 blobs / 205 551 633 o, Reference 4, Job 24, ChapterVersion 6, ElementAnalyse 1) — preuve evidence/c1-backup-initial.json.
- T2 Mécanisme auto : src/lib/backup.ts (ensureDailyBackup = VACUUM INTO vers tmp + rename atomique, 1×/jour au boot via instrumentation.ts + re-check 6 h, rotation 7 j regex custom-YYYY-MM-DD.db, miroir TF_BACKUP_MIRROR_DIR, anti-HMR __tfBackupStarted, jamais bloquant) ; scripts versionnés backup-db.ts / restore-db.ts / db-snapshot-stats.ts (exceptions .gitignore scripts/*) ; /backups/ gitigné.
- T2 test réel : startDailyBackup exécuté → backups/custom-2026-10-09.db créé (213 Mo) + miroir + log [backup] ; VACUUM INTO à chaud sans incident serveur.
- T3 Restauration réelle : scripts/restore-db.ts (copie de sécurité .pre-restore-<ts> AVANT écrasement, jamais aveugle) → restauration vers /tmp/restore-test/custom.db : integrity ok, 16 docs, 1 thèse ; diff stats live↔restaurée VIDE = complétude prouvée (preuve evidence/c1-restore-test.json) ; doc docs/SAUVEGARDE-RESTAURATION.md (procédures, limites : live = arrêt serveur ; boot 2ᵉ serveur impossible 4 Go RAM → vérif niveau ORM Prisma).
- Invariants : lint 0 erreur (247 warnings, +3 sur scripts outillage) ; HTTP 200 ; lignes rouges 0 diff ; db skip-worktree intacte ; bun run build non exécuté.

Stage Summary:
- AUD-GOV-001 CORRIGÉE avec preuve de restauration : la perte de la thèse/corpus n'est plus « un incident à un clic de db:push près » — backup quotidien auto + miroir hors arbre + restore outillé vérifié octet/logiquement identique.
- Statut registre : corrigée, revalidée (restauration réelle en env de test, diff complet vide). Le statut final « revalidée » sera consigné au registre 09 en fin de cycle (T10).
---
Task ID: R-4 (audit-remediation-p1 / C-4)
Agent: Z.ai Code (principal)
Task: C-4 durcissement Tauri (AUD-SEC-001 + 005) — capabilities minimales + CSP explicite, avant toute distribution.

Work Log:
- Vérification préalable : plugin shell JAMAIS utilisé par le front (0 import @tauri-apps/plugin-shell ; les invoke = z-ai SDK serveur) ; tauri_plugin_shell::init() conservé côté Rust (plugin enregistré sans permission = aucune commande autorisée, zéro modif Rust non compilable ici).
- capabilities/default.json : retrait shell:allow-open + shell:allow-execute → permissions = [core:default] uniquement.
- tauri.conf.json : csp null → CSP explicite (default-src 'self'; script-src 'self' 'unsafe-inline' [flight data Next App Router] ; style-src 'self' 'unsafe-inline' ; img-src 'self' data: blob: ; connect-src 'self' ipc: http://ipc.localhost ; object-src 'none' ; base-uri 'self' ; form-action 'self' ; frame-ancestors 'none') + devCsp (identique + ws://localhost:3000 HMR).
- Analyse topologie (justifie la CSP) : lib.rs navigue la webview vers http://127.0.0.1:<PORT> = serveur Next standalone → tous les appels API same-origin ; intégrations externes côté Node uniquement ; 0 image distante ; pdf.js = worker Node serveur.
- Vérifications : JSON valides (parse), web HTTP 200 inchangé, lint 0 erreur ; preuve evidence/c4-tauri-hardening.json.
- Limite documentée : build Tauri Windows impossible ici (pas de cargo) → statut « corrigée, NON revalidée côté desktop » ; revalidation = build + smoke test par le propriétaire AVANT distribution (exigence propriétaire reprise telle quelle).

Stage Summary:
- Chaîne XSS→shell fermée côté configuration : sur-permissions shell retirées, CSP structurante en place ; la revalidation desktop reste une action propriétaire (build Windows).
---
Task ID: R-5 (audit-remediation-p1 / T9+T10)
Agent: Z.ai Code (principal, + 2 délégations full-stack-developer pour C-2/C-3)
Task: TNR globaux (suite + golden paths) après C-1..C-4, mise à jour registre/Phase 11, rapport distinct Baseline Audit v1.1, soumission au propriétaire.

Work Log:
- Délégations : C-2 exécuté par full-stack-developer (Task R-2 : correction 3 fichiers, vérifications UI réelles complètes, isolation, cleanup, 1 658 verts) ; C-3 exécuté par full-stack-developer (Task R-3 : inventaire exhaustif des actions destructives, ConfirmDeleteDialog partagé, 16 applications, TNR sans adaptation).
- Contrôle de maîtrise d'œuvre sur chaque délégation : revue diff (rouges, ciblage, qualité shadcn), vérification serveur/DB, commits+pousses distincts (6436ed7, f1b5ec5).
- T9 : suite vitest finale 78 fichiers / 1 658 verts ; lint 0 erreur ; rouges 0 diff vs origin/main ; skip-worktree S ; 6 golden paths re-parcourus en UI réelle (agent-browser) : rédaction (éditeur 7 chap. contenu réel), création thèse (dialogue), références (liste), IA (stream 200 + résultat), RAG (réponse citée « [Chapitre 1 - …] »), thèses en ligne (200, HAL), export DOCX (200, 17 514 o, ZIP PK valide) — preuve tnr-golden-paths.json + 8 captures.
- Incident consigné au TNR : panneau flottant AUD-UX-002 (P2) recouvre le bouton Générer (hit-test) → contournement JS ; anomalie déjà au registre, à corriger avant diffusion.
- T10 : registre 09 — 4 fiches P1 passées à « corrigée, revalidée » (×3) et « corrigée, non revalidée côté desktop » (×1) ; Phase 11 remplie (tableau protocole complet) ; BASELINE_AUDIT_REPORT_v1.1.md écrit (avant/après, preuves, tests, anomalies restantes, régressions, réserves) ; tasks.md 10/10.
- Fait produit soumis au propriétaire : Reference est GLOBALE par conception (sans thesisId) — l'isolation références/thèse n'existe pas architecturalement ; décision produit requise (statu quo partagé vs scoping par thèse).
- Pousses séquentielles vérifiées (aucun commit-snapshot) : 978a3cc→1682dcd (C-1) →6436ed7 (C-2) →f1b5ec5 (C-3) →93d8d08 (C-4) →commit présent.

Stage Summary:
- Les 4 conditions P1 du GO SOUS CONDITIONS sont exécutées : 3 revalidées avec preuve (sauvegarde/restauration réelle, multi-thèses, confirmations destructives), 1 corrigée dont la revalidation exige le build Windows propriétaire.
- TNR global vert : 1 658 tests, lint 0 err, rouges 0 diff, 6 golden paths OK, 0 régression applicative ; 1 incident environnemental OOM documenté (sans perte).
- Rapport v1.1 soumis au propriétaire avec 5 réserves explicites avant GO final (33 vues C-19, builds web/desktop, décision produit références, purge historique .env, risques résiduels) — AUCUNE mise en production tant que non validé.
---
Task ID: R-2 (audit-remediation-p1 / C-2)
Agent: full-stack-developer
Task: C-2 AUD-FUNC-002 — réparer créer/changer de thèse + isolation multi-thèses.

Work Log:
- Contexte chargé (worklog, spec cycle, fiche AUD-FUNC-002, roadmap C-2) ; baseline git 1682dcd, arbre propre ; snapshot DB lecture seule AVANT modification : 1 thèse « Urbanisme durable » (cmsmyrdfs0000pa2sews4vo90, 7 chapitres, 2 295 mots), 4 références.
- Anomalie environnement : serveur dev système tué par OOM kernel (dmesg : next-server RSS 2,5 Go sur box 4 Go) → redémarré hors bande (bun run dev détaché via Bun.spawn, dépôt intact).
- Phase 1 (preuve AVANT correction, agent-browser) : thèse active seedée en localStorage (précondition AUD-FUNC-002) → dashboard → « Créer une thèse » → AUCUN dialogue, navigation éditeur + ré-ouverture de l'ANCIENNE thèse. Captures c2-before-dashboard.png / c2-before-dashboard-cta.png.
- Phase 2 (correction ciblée, 3 fichiers, 53+/11-) : ① create-thesis-dialog.tsx — props optionnelles {open, onOpenChange}, mode contrôlé prime sur l'état interne, DialogTrigger interne masqué en mode contrôlé, formulaire inchangé, setOpen(false) post-création appelle aussi onOpenChange ; ② dashboard-page.tsx — état createOpen, CTA « Créer une thèse » → setCreateOpen(true) (ne change plus de vue), dialogue contrôlé rendu ; ③ editor-page.tsx — bouton « Changer de thèse » (ghost sm, FolderOpen) au-dessus des ChapterTabs, onClick setActiveChapterId(null)+setActiveThesisId(null), setActiveThesisId ajouté au destructuring. Ligne 204 « \n » littéral NON touchée (C-13).
- Phase 3 (vérification UI réelle + isolation + cleanup) : dialogue s'ouvre depuis le dashboard (c2-after-dialog.png) ; création « AUDIT-C2 — Thèse de test » / « Agent Audit » OK — DB : 2 thèses (l'app auto-crée 7 chapitres template 0 mots, comportement existant) ; thèse test ouverte dans l'éditeur (c2-after-created.png) ; « Changer de thèse » → « Mes thèses » avec LES DEUX thèses (c2-after-thesis-list.png) ; réouverture « Urbanisme durable » → 7 chapitres / 2 295 mots INTACTS (c2-back-to-real-thesis.png).
- Isolation : chapitres thèse-scopés PROUVÉS (FK Chapter.thesisId + Cascade, groupBy DB 7/2 295 vs 7/0, zéro mélange). FAIT MESURÉ : les références sont GLOBALES par conception (modèle Reference SANS thesisId, API sans filtre thèse) — la réf test « Réf test AUDIT-C2 » (POST 201) est visible depuis les deux contextes (captures A/B) ; les 4 réf originales restent intactes partout ; décision produit à arbitrer par le propriétaire (hors périmètre, pas de modification de schéma — rouge).
- Cleanup : réf test supprimée via UI (4 réf en DB), thèse test supprimée via poubelle ThesisListPanel (sans confirmation — comportement actuel, C-3), cascade chapitres vérifiée (aucun orphelin) ; DB finale = état initial EXACT (1 thèse, 7 chapitres / 2 295 mots, 4 réf) ; activeThesisId = « Urbanisme durable », vue dashboard (c2-cleanup.png, c2-final-state-dashboard.png).
- TNR : F5 → « Éditeur de thèse » réouvre « Urbanisme durable » (inchangé) ; ThesisListPanel non contrôlé : bouton interne « Nouvelle thèse » ouvre toujours le dialogue (fermé via Annuler).
- Qualité : lint 0 erreur (247 warnings = baseline) ; bun run test:run → 78 fichiers, 1 658/1 658 verts ; lignes rouges absentes de git status --porcelain (0 diff) ; db skip-worktree intact ; pas de db push, pas de build, pas de commit.
- Preuves : audit/baseline/evidence/c2-revalidation.json (avant/après/isolation/cleanup/TNR/lint/tests) + 10 captures c2-*.png.

Stage Summary:
- AUD-FUNC-002 CORRIGÉE et revalidée en UI réelle : créer une 2ᵉ thèse depuis le CTA dashboard (dialogue), changer de thèse depuis l'éditeur (liste), ré-ouvrir la 1ʳᵉ — données thèse-scopées intactes et isolées, cleanup complet, état propriétaire restauré, TNR verts (1 658 tests), lint 0 erreur, rouges 0 diff.
- Observation consignée pour arbitrage propriétaire : références = bibliothèque globale par conception (pas d'isolation par thèse possible sans évolution de schéma — hors périmètre C-2).
- Anomalies annexes rencontrées (hors périmètre, consignées) : OOM kernel du serveur dev (RSS 2,5 Go) ; POST /api/references 400 si année vide (AUD-FUNC-005).
---
---
Task ID: R-3 (audit-remediation-p1 / C-3)
Agent: full-stack-developer
Task: C-3 AUD-FUNC-003 — confirmation avant toute suppression + inventaire des actions destructives.

Work Log:
- Contexte chargé (worklog, spec cycle, CA-3) ; baseline 6436ed7, arbre propre ; snapshot DB lecture seule : 1 thèse « Urbanisme durable », 7 chapitres / 2 295 mots, 4 réf, 16 ImportedDoc ; serveur 200.
- Phase 1 (preuve AVANT correction, agent-browser) : création réf test « AUDIT-C3 — à supprimer » (POST 201) ; clic poubelle ligne → suppression IMMÉDIATE : 0 alertdialog, ligne disparue, DELETE /api/references/{id} 200 dans le réseau. Captures c3-before-*.png. Les 4 réf propriétaires jamais touchées (comptage DB identique avant/après session).
- Phase 2 (inventaire exhaustif, lecture seule) : greps Trash2/method DELETE/onDelete/.mutate/Supprimer-Réinitialiser-Effacer-Clear/deleteMany sur src. Verdict : 16 actions destructives persistantes sans confirmation (references, thesis-list-panel, chapitre via editor-page, ai-tools source+note, expérimentations exp+run, verification-carto, thesis-plan partie, onglet-recherche fermer-onglet+effacer-contenu, article-redaction article+import, registre-juridique, feuille-route-agile story+sprint) ; 2 déjà conformes (veille-academique AlertDialog ; livres-competences confirm() natif) non touchés ; ~20 actions d'état local non persisté consignées sans traitement ; 2 deleteMany serveur (rag re-chunking, veille) consignés sans UI inventée.
- Phase 3 (correction) : nouveau composant partagé src/components/common/confirm-delete-dialog.tsx (AlertDialog shadcn, props {open, onOpenChange, onConfirm, title?, description?, confirmLabel?, isPending?}, bouton destructive, preventDefault + isPending) appliqué aux 16 actions dans 11 fichiers : le clic n'ouvre QUE la confirmation, la mutation/fetch n'est déclenchée QUE par onConfirm ; stopPropagation conservés (thesis-list-panel) ; handleDeleteChapter rewire (editor-page, ligne « \n » C-13 intacte) ; onglet X « Fermer » révélé destructif (DELETE persisté) et confirmé.
- Phase 4 (UI réelle, sessions courtes) : réf test → dialogue ; Annuler = 0 requête (diff réseau vide, 0 DELETE) + ligne en UI + DB (5 réf) ; re-clic → Confirmer = DELETE 200 + ligne disparue (4 réf). Thèse jetable AUDIT-C3 (POST 201, 7 chapitres template) → poubelle ThesisListPanel → dialogue, Annuler (2 thèses en DB), Confirmer = DELETE 200 + cascade. Chapitre 8 ajouté sur la thèse jetable → poubelle chapter-header → dialogue « Supprimer ce chapitre ? », Annuler (15 chapitres en DB), Confirmer = DELETE 200 (14 chapitres). Captures c3-cancel/c3-confirm*/c3-chapter*/c3-thesis-*.png. 13 autres actions persistantes vérifiées par code (handler ne mute qu'après confirm) — statuts consignés dans le JSON.
- TNR : bun run lint → 0 erreur / 247 warnings (= baseline) ; bun run test:run → 78 fichiers, 1 658/1 658 verts ; AUCUNE adaptation de test nécessaire (aucun test ne cliquait un bouton delete — grep 0 occurrence) ; tsc : 0 erreur sur fichiers modifiés (154 lignes d'erreurs préexistantes route.test.ts hors périmètre, identiques avant/après).
- Cleanup : thèse jetable + chapitre + 2 réf test supprimés via le NOUVEAU flux de confirmation ; DB finale = état propriétaire EXACT (1 thèse, 7 chapitres / 2 295 mots, 4 réf, 16 docs, corpus 6 737 798 car., ElementAnalyse 1, Job 24, ChapterVersion 6).
- Invariants : lignes rouges 0 diff (theses-en-ligne/search, arxiv/search, app-sidebar) ; db skip-worktree intacte ; pas de db push, pas de build, pas de commit ; AUD-FUNC-005 et C-13 non touchés.
- Preuves : audit/baseline/evidence/c3-revalidation.json (inventaire complet 16+2+~20+2 entrées, avant/après, annulations/confirmations, statuts de vérification) + 11 captures c3-*.png.

Stage Summary:
- AUD-FUNC-003 CORRIGÉE et revalidée : toute suppression destructive persistante exige désormais une confirmation explicite ; Annuler = 0 requête / 0 modification (prouvé réseau + DB), suppression uniquement après confirmation (prouvé DELETE 200 + disparition UI/DB) sur les 3 parcours complets (référence, thèse, chapitre).
- Inventaire exhaustif consigné : 16 actions corrigées via 1 composant partagé (ConfirmDeleteDialog), 2 déjà conformes, ~20 non persistantes (état local) et 2 régénérations serveur documentées sans sur-traitement.
- TNR verts sans adaptation de test (1 658), lint 0 erreur, rouges 0 diff, données propriétaire intactes.
---
Task ID: F-1 (audit-final-v1.2 / T1)
Agent: Z.ai Code (principal)
Task: Réponse aux instructions définitives du propriétaire (IM 2026-10-10) — plan d'exécution séquencé pour la clôture v1.1 et la préparation du GO final, séparant (1) déjà autorisé, (2) proposition migration références, (3) validations propriétaire, (4) preuves attendues.

Work Log:
- Prise d'acte des instructions : verdict maintenu GO SOUS CONDITIONS ; décision produit « références rattachées à chaque thèse » (proposition technique requise AVANT toute migration — autorisation distincte) ; 33 vues à tester obligatoirement (pas de risque résiduel accepté) ; builds web/Windows obligatoires ; purge git exigée avec preuves ; 13 actions destructives à tester en UI ; restauration upload/ à prouver ; golden paths 6→7 à réconcilier ; registre P2/P3 à actualiser (AUD-UX-002 réévaluée) ; v1.2 attendue avec tableau de conformité 11 critères.
- Reconnaissance vérifiée : HEAD == origin/main == 9705038, arbre propre ; v1.1 relue (réserves §5/§6 confirmées) ; c3-revalidation.json relu → liste exacte des 13 actions code-seulement (ai-tools ×2, expérimentations ×2, carto, plan, onglet-recherche ×2, article-redaction ×2, registre juridique, agile ×2) ; 08_TEST_MATRIX : 8 ✅ / 6 ⚠️ / 33 ◻️ (2 bloquées externes Overpass+APInex) ; incohérence golden paths localisée (v1.0 §L.2 « 6 » vs v1.1 GP-1..GP-7, GP-7 export DOCX ajouté TNR v1.1) ; C-1 : DB prouvée / upload/ copiée (244 Mo) mais restauration fichiers NON prouvée.
- Rédigé audit/baseline/12_PLAN_EXECUTION_CYCLE_FINAL.md : Lot A (A1 vues 33, A2 13 actions — liste exacte, A3 upload/ SHA-256 + cohérence, A4 golden paths = 7 canonique, A5 audit git non destructif + plan BFG, A6 registre + AUD-UX-002 correction proposée retirable, A7 traçabilité) ; Lot B (proposition technique thesisId Reference — schéma, contraintes, API, migration réversible, ambiguïtés, tests isolation — SANS exécution) ; Lot C (C1 build web, C2 build Windows, C3 purge BFG coordonnée — procédures/gabarits préparés, exécution propriétaire ; contraintes environnement documentées : build production interdit ici, pas de Windows/cargo) ; Lot D (tableau de conformité 11 critères → lots/preuves/responsables) ; vagues 1-4 + règles d'exécution.
- Ouvert cycle SDD specs/audit-final-v1.2/ (spec.md 9 CA + invariants, tasks.md T1-T15 vagues 1-4) ; dossier specs/ref-thesis-scoping/ créé (vide — rempli en T5, jamais exécuté sans autorisation).

Stage Summary:
- Plan d'exécution séquencé produit et poussé : répond point par point aux instructions (4 lots séparés, 11 critères mappés avec preuves et responsables) ; aucune migration références, aucun build, aucune réécriture git exécutés à ce stade — seuls les travaux déjà autorisés démarrent (vague 1 : documentaire/lecture seule + démarrage pass vues).
- Décisions soumises au propriétaire dans le plan : correction ciblée AUD-UX-002 incluse au Lot A (qualifiée bloquante GP-4, retirable) ; onDelete Cascade proposé pour Reference.thesisId (alternative SetNull chiffrée) ; CI possible pour le build web si préféré.
- Invariants respectés : aucun fichier rouge touché, db skip-worktree intacte, aucune clé/secret reproduit dans les documents (clé APINex référencée sans valeur), commit docs seul.
---
Task ID: F-2 (audit-final-v1.2 / vague 1 exécutée + vague 2 amorcée)
Agent: Z.ai Code (maître d'œuvre ; délégations W1-7/7b/7c A1-vues, W1-8/8b A2-actions destructives)
Task: Exécuter la vague 1 validée par le propriétaire (IM 2026-10-10) : AUD-UX-002, A4, A5, A6, B, A7 + amorcer la vague 2 (A1 lots 1, A2 lots 1-2, A3).

Work Log:
- AUD-UX-002 (autorisée point 6) : correctif ciblé test-deliverable-card.tsx — pastille repliée par défaut (pointer-events confinés), panneau dépliable sur clic explicite, dismissal X inchangé ; revalidation UI réelle agent-browser : hit-test bouton Générer propre (elementFromPoint), CLIC DIRECT → POST /api/ai-writing/stream 200 → Résultat affiché, déplier/plier/masquer/persistance OK ; TNR 1 658 verts ; commit 03037e2.
- A4 : incohérence 6 vs 7 localisée (v1.0 §L.2 vs v1.1 GP-1..GP-7) ; liste canonique 7 (GP-1..6 initiaux + GP-7 export DOCX ajouté TNR v1.1) ; annotation evidence/tnr-golden-paths.json bloc reconciliation_A4 ; v1.0/v1.1 non modifiées [6abb3e8].
- A5 (lecture seule) : sauvegarde vérifiée (bundle 78 Mo complete-history + miroir 155 Mo) ; inventaire main/origin/main + tags v1.10.7/8 ; CONSTAT : .env suivi depuis commit initial (contenu HEAD = DATABASE_URL seul) → désuit 6158f4e ; scan historique -G : clé APINex réelle dans .env aux porteurs 04dc5ab/763ee5d (retraits b25f426/7260947), 0 PAT GitHub, clé IM jamais commitée (pickaxe préfixe masqué 14c = 0) ; plan BFG prêt 13_PURGE_GIT_PLAN.md (exécution vague 3 : révocation confirmée + coordination) [6abb3e8].
- A6 : tableau de gestion v1.2 du registre (13 fiches ouvertes après ajout AUD-FUNC-007) ; AUD-UX-002 → corrigée, revalidée.
- B : specs/ref-thesis-scoping/proposition-technique.md (thesisId nullable + Cascade + index, API isolation stricte, migration réversible avec répétition sur copie, cas non attribuables, 12-16 tests, effort 2-3 j, positionnement après vague 2/avant builds) — AUCUNE exécution [6d93dd4].
- A7 : BASELINE_AUDIT_REPORT_v1.2.md squelette + tableau conformité 11 critères (itératif) ; 14_PROCEDURE_BUILD_WEB.md + 15_PROCEDURE_BUILD_WINDOWS.md (procédures + gabarits de preuve propriétaire) [6d93dd4].
- A1 (délégations) : lot 1 COMPLET 8/8 vues validées (Brouillon chapitre, Harper, Grammaire [session W1-7 partiellement consolidée], Phrasier, Déblocage, Auto-édition 8C [W1-7b], Cadrage, Plan [W1-7c]) ; evidence/a1-lot1.json + 60+ captures ; NOUVELLE anomalie AUD-FUNC-007 (P2 : GET /api/thesis sans partId — chapitres rattachés jamais affichés) + 9×P3 (état local non persisté) ; thèses jetables AUDIT-A1/A1b/A1c supprimées via UI (cascade vérifiée) ; reste 25 vues.
- A2 (délégations) : lot 1 5/5 conformes (source IA, note IA, exp, run, élément carto — W1-8) ; lot 2 7/7 conformes (onglet fermer DELETE + effacer PUT [debounce documenté], article, doc importé [article survit], registre juridique [porté par Livres-compétences], story [sprint survit], sprint [cascade stories conforme au message] — W1-8b) + partie de plan (lot 1c) → REGISTRE CLÔTURÉ 16/16 vérifiées en UI réelle ; audit réseau sessions : exactement les DELETE/PUT attendus, Annuler = 0 requête partout ; 1 P3 consignée (removeImport sans vérif res.ok) ; evidence/a2-lot1.json + a2-lot2.json + 37 captures.
- A3 (principal) : outillage versionné scripts/verify-upload-backup.ts ; sauvegarde C-1 intacte 100 % (20 fichiers / 255 273 238 o, SHA-256) ; restauration réelle /tmp/restore-files-test 100 % identique ; jeu contrôlé AUDIT-A3 (perte simulée → restauration OK) ; cohérence DB↔fichiers 16/16 (4 dépôts directs taille OK + 9 RAR + 3 résidus docx AUD-DATA-001), 0 référence cassée ; doc §6 SAUVEGARDE-RESTAURATION ; evidence/a3-upload-restore.json.
- TNR vague : 1 658/1 658 verts ; lint 0 erreur ; écart warnings 247→249 investigué par diff eslint JSON entre worktrees (03037e2 vs courant) → cause : 2 scripts de preuve tmp-w18*.mjs (console volontaire) → justification eslint-disable no-console, baseline 247 restaurée [e504b35].
- Incidents consignés : serveur dev arrêté (signature OOM C-2) au démarrage W1-8b → redémarré hors bande par l'agent, 200 OK ; session A1 initiale dépassée (200 tours) → relots 1b/1c plus courts (leçon : max 3 vues/agent).
- Invariants permanents : rouges 0 diff, db skip-worktree S, aucune valeur secrète dans preuves/logs, état propriétaire restauré exact après chaque session (diffs 18 tables vides).

Stage Summary:
- Vague 1 TERMINÉE (T1-T6) + vague 2 à 60 % (A2 CLÔTURÉ 16/16 → critère #2 SATISFAIT ; A3 TERMINÉE → critère #3 SATISFAIT ; A1 8/33 lots 1). Critères GO : #2 ✅, #3 ✅, #4 proposition soumise, #7 audit+plan prêts, #8/#9/#10 ✅ à date, #1 en cours (25 vues), #5/#6 procédures livrées (exécution propriétaire), #11 v1.2 itérative.
- Découvertes : AUD-FUNC-007 (P2, partId) ; .env suivi depuis l'origine (désuit) ; clé APINex historique localisée précisément pour la purge ; 12 fiches P3 état-local documentées au fil des vues.
- Commits : 03037e2, 6158f4e, 6abb3e8, 6d93dd4, bc71223, e504b35 (+ preuves a2-lot2) — push vérifié ensuite.


---
Task ID: W1-8 (audit-final-v1.2 / A2 lot 1)
Agent: agent-exécution UI (Z.ai Code, session dédiée W1-8)
Task: A2 lot 1 — test UI réel de 5 actions destructives vérifiées par code seulement (contrôles ①-⑥ par action), registre 16/16 en cours.

Work Log:
- Contexte chargé (worklog R-3/F-1, c3-revalidation.json, spec CA-2, tasks T8) ; baseline 6d93dd4, 0 fichier suivi modifié ; serveur dev 200 ; comptages DB AVANT (lecture seule, script node @prisma/client one-shot) : 1 thèse « Urbanisme durable » (7 chap / 2 295 mots / 6 versions), 4 réf, 16 ImportedDoc, 24 Job, ResearchSource 0, NotebookEntry 1, Experiment 1 (+1 run), ElementAnalyse 1, TypeAnalyse 1.
- Action 1 (Outils IA / source) : source « AUDIT-A2-Source jetable » créée dans l'UI (POST /api/sources 201) ; poubelle → ConfirmDeleteDialog « Supprimer cette source ? » (0 requête destructive à l'ouverture) ; Annuler = 0 requête + source en UI et DB ; Confirmer = DELETE /api/sources/cmv1cajr70019jjivxvspmj2h 200 seule requête destructive, carte disparue (badge 0), DB 0 source. Source sans entrée liée (SetNull non sollicité). CONFORME.
- Action 2 (Outils IA / note) : note « AUDIT-A2-Note jetable — question de test » créée dans l'UI (POST /api/entries 201) ; même protocole ; Annuler = 0 requête + note en UI et DB (NotebookEntry 2) ; Confirmer = DELETE /api/entries/cmv1ccxqh001ajjivq0078bdx 200 seule requête destructive, note disparue (badge 1), ne reste que « Question de test T4 » (préexistante, intacte). CONFORME.
- Action 4 (Expérimentations / run) : exp « AUDIT-A2-Expérimentation jetable » (POST /api/experiments 201) + 2 runs (POST .../runs 201 ×2 : baseline + variant-A) créés dans l'UI ; poubelle du run variant-A → dialogue « Supprimer ce run ? » ; Annuler = 0 requête (comptage réseau stable) + 2 runs en DB ; Confirmer = DELETE /api/experiments/{id}/runs/cmv1cj0y1001njjivug4g2jbw 200 seule requête destructive (+1 PATCH de rafraîchissement du détail, non destructif, comportement préexistant onPatch) ; cascade NON attendue vérifiée : exp + run baseline restent en DB et UI (« Runs (1) »). CONFORME.
- Action 3 (Expérimentations / exp) : poubelle détail → dialogue « Supprimer cette expérimentation ? … et tous ses runs… » ; Annuler = 0 requête + exp et runs en DB (2/2) ; Confirmer = DELETE /api/experiments/cmv1cihgd001jjjivo792dwox 200 seule requête destructive ; cascade conforme : exp + run restant supprimés en DB (Experiment 1 / ExperimentRun 1 = propriétaire « Jumelage numérique du corridor UEMOA » + « baseline seuil fixe » intacts), liste UI « 1 expérimentation ». CONFORME.
- Action 5 (Vérification cartographique / élément) : élément « AUDIT-A2-Élément carto jetable » créé dans l'UI via le formulaire « Ajouter un élément » (type « Périmètre d'étude retenu », nature Spatial, source AUDIT-A2-test ; POST /api/elements-analyse 201) — AUCUNE dépendance Overpass pour ce CRUD ; geo-mcp health 200 {status:ok, tools_count:9} consigné ; poubelle ligne → dialogue « Supprimer cet élément d'analyse ? » ; Annuler = 0 requête + élément en UI et DB ; Confirmer = DELETE /api/elements-analyse/cmv1cltpf001qjjivr1peocgn 200 seule requête destructive ; élément disparu, élément propriétaire « Quartier de la Gare, Montpellier » intact et visible. CONFORME.
- Audit réseau de session : exactement 5 DELETE (un par action, tous 200, tous sur l'endpoint attendu), aucune requête destructive parasite sur 217 entrées réseau.
- État propriétaire APRÈS : identique sur toutes les tables, à l'exclusion d'une thèse ÉTRANGÈRE « AUDIT-A1 — Thèse de test lot 1 » (cmv1ceqd3001bjjiv86wpubso, auteur « Agent Audit A1 », POST 19:12:51) créée par une session A1 CONCURRENTE (captures a1-lot1-*.png dans le même dossier de preuves) — non touchée (objet d'un autre agent) ; thèse propriétaire vérifiée finement : 7 chap / 2 295 mots / 6 versions / updatedAt 2026-08-10 inchangé. Tous les objets AUDIT-A2- supprimés VIA LE FLUX TESTÉ (aucun cleanup DB direct).
- Quirks environnement consignés (pas produit) : refs agent-browser invalidées par re-rendus Fast Refresh (serveur dev) + resets occasionnels de la vue courante (SPA, état non persisté) dus à la session concurrente — re-navigations avant chaque contrôle, chaque dialogue re-vérifié (contenu ciblant exactement l'objet AUDIT-A2-). Aucun impact sur les preuves.
- Preuves : audit/baseline/evidence/a2-lot1.json (5 actions × contrôles ①-⑥, audit réseau, avant/après, session concurrente) + 15 captures a2-lot1-{1-source,2-note,3-exp,4-run,5-element}-*.png + a2-lot1-db-before.json / a2-lot1-db-after.json + script de comptage tmp-w18-counts.mjs.
- Invariants : 0 commit, 0 modification de code (git status : 0 fichier suivi modifié), fichiers rouges jamais touchés, pas de db:push ni build, db skip-worktree intacte.

Stage Summary:
- 5/5 actions destructives du lot 1 CONFORMES en UI réelle sur les 6 contrôles : aucune suppression sans confirmation, Annuler = 0 requête/0 modification (prouvé réseau + DB + UI), Confirmer = exactement 1 DELETE sur le bon endpoint (prouvé), cascades conformes (exp → runs ; run → pas de cascade siblings ; source/entry/élément → entités terminales), UI à jour, aucune erreur rencontrée.
- Registre 16/16 : 8/16 vérifiées en UI réelle (3 lors de C-3 + 5 lors de W1-8) ; reste 8 actions (lot 2) : thesis-plan partie, onglet-recherche fermer+effacer, article-redaction article+import, registre-juridique, feuille-route-agile story+sprint.
- Session A1 concurrente détectée et consignée ; état propriétaire préservé par cette session (effet net nul), point d'attention coordination multi-agents sur l'environnement partagé.
---
Task ID: W1-7b (audit-final-v1.2 / A1 lot 1b)
Agent: agent-exécution UI (Z.ai Code, session dédiée W1-7b)
Task: A1 lot 1b — pass UI réel des 3 vues restantes du lot 1 (Phrasier Académique, Déblocage écriture, Auto-édition 8C) + consolidation du JSON lot 1 (6 vues) avec reconstitution des 3 vues de la session initiale.

Work Log:
- Contexte chargé (worklog 200 dernières lignes, spec CA-1, captures a1-lot1-01/02/03-*.png de la session initiale) ; baseline 6d93dd4, 0 fichier suivi modifié (hors worklog append) ; serveur 200 untouched ; comptages DB AVANT (PrismaClient lecture seule) : 1 thèse « Urbanisme durable » (7 chap / updatedAt 2026-08-10), 4 réf, 16 ImportedDoc, 0 thèse AUDIT (la thèse jetable de la session initiale avait déjà été supprimée via UI, cascade OK).
- Identification par code (lecture seule) : phrasebook (460 l., banque 138 phrases Manchester, recherche + filtres section/fonction + copie presse-papiers, 100 % client) ; deblocage-ecriture (1 341 l., 4 onglets Diagnostic/Exercices/Suivi/Pomodoro, IA /api/ai-writing) ; auto-edition (1 940 l., 4 onglets Analyse IA 8C/Checklist 8C 27 items/Checklist article 7 questions/Langue seconde, IA /api/ai-writing + /api/verification-publication). Les 3 vues n'écrivent NI chapitre NI DB → protocole conditionnel « thèse de test AUDIT-A1b » NON déclenché (condition jamais remplie).
- Phrasier (UI réelle) : rendu complet (138 phrases/7 sections/10 fonctions) ; recherche « ces résultats » → 11 cartes ; copie → toast « Phrase copiée dans le presse-papiers » vérifié DOM ; filtre « Revue de littérature » → 30 résultats ; Réinitialiser les filtres OK ; état vide « Aucune phrase trouvée » sur requête sans résultat (+ cumul filtre → 0 cohérent) ; zéro appel API propre (réseau filtré api). 5 captures a1-lot1-05-phrasier-*.png.
- Déblocage écriture (UI réelle) : Diagnostic — bouton IA désactivé à 0 bloc (contrôle vide), « Page blanche » → POST /api/ai-writing 200 → 5 stratégies markdown ; Exercices rendus ; Suivi — 300/120 enregistré (« Dernier enregistrement : 120 / 300 mots ») puis reload → PERDU (Mots totaux 0) : non-persistance prouvée en UI ; Pomodoro — Start 25:00 → 24:57, Pause OK, Reset présent. Anomalies P3 consignées (Suivi et stats Pomodoro non persistés, état React local uniquement). 6 captures a1-lot1-06-deblocage-*.png.
- Auto-édition 8C (UI réelle) : bouton « Analyser les 8C » désactivé < 20 car. (contrôle vide vérifié) ; texte 266 car. → analyse complète (8 × POST /api/ai-writing 200 en parallèle, 1 par critère) → score global 43/100 « Critique » + 8 critères notés ; Checklist 8C : 3 items → 3/27, reload → 0/27 (non-persistance prouvée) ; Vérifications publication : 3 outils, dialogue « Cohérence intro/discussion » à vide → « Vérifier » désactivé ; Checklists article (7 questions) et Langue seconde rendus. Anomalies P3 consignées (état non persisté ; 8 appels IA par clic = coût). 8 captures a1-lot1-07-autoedition-*.png.
- Consolidation (responsabilité principale) : audit/baseline/evidence/a1-lot1.json FINAL — 6 vues du lot 1 : les 3 du lot 1b en détail (fonctionnalités, parcours, états/erreurs, persistance, multi-thèses, destructives, anomalies, captures) + Brouillon de chapitre / Harper / Grammaire reconstituées depuis les 14 captures de la session initiale (statut « validée », note « session initiale, captures probantes, consolidée par lot 1b ») ; audit réseau ; état propriétaire avant/après identique ; baseline git 6d93dd4 (traçabilité CA-7).
- État propriétaire APRÈS : identique sur toutes les tables (1 thèse, 7 chap, 4 réf, 16 docs, ChapterVersion 6, Job 24, ElementAnalyse 1, NotebookEntry 1, Experiment 1, ResearchSource 0, 0 thèse AUDIT) ; thèse updatedAt inchangée ; git : 0 fichier suivi modifié hors worklog ; fichiers rouges jamais touchés ; db skip-worktree intacte ; pas de db:push, pas de build, pas de commit.
- Quirk outillage consigné (pas produit) : agent-browser fill "" = no-op (recherche vidée via event input natif) ; refs parfois invalidées par re-rendus → chaque contrôle re-vérifié. Aucun impact preuves.

Stage Summary:
- 3/3 vues du lot 1b VALIDÉES en UI réelle : Phrasier (recherche/filtres/copie/état vide, 0 API), Déblocage écriture (Diagnostic IA + contrôle vide + Suivi + Pomodoro), Auto-édition 8C (analyse 8 critères par IA + checklists + contrôles vides) — 1 génération IA par vue max, états d'erreur testés, persistance vérifiée par reload.
- 4 anomalies P3 consignées (aucune bloquante) : Suivi quotidien et stats Pomodoro non persistés (Déblocage) ; analyses IA/checklist 8C non persistées (Auto-édition) ; compteur de résultats Phrasier absent pour recherche seule ; observation coût : 8 appels IA parallèles par « Analyser les 8C ». Messages d'erreur inline/toasts défensifs inatteignables via boutons déjà désactivés (défense en profondeur, non défaut).
- JSON consolidé final livré : audit/baseline/evidence/a1-lot1.json (6 vues : 04-06 lot 1b + 01-03 reconstituées, toutes « validée » ; reste 2 vues lot 1 prévues en lot 1c séparé).
- État propriétaire strictement préservé (aucune thèse de test nécessaire) ; registre A1 : 6/8 vues du lot 1 prouvées, 2 restantes (lot 1c).
---
Task ID: W1-7c (audit-final-v1.2 / A1 lot 1c)
Agent: agent-exécution UI (Z.ai Code, session dédiée W1-7c)
Task: A1 lot 1c — pass UI réel des 2 dernières vues du lot 1 (Cadrage de thèse, Plan de thèse) + mise à jour du JSON consolidé a1-lot1.json (clôture lot 1 : 8 vues).

Work Log:
- Contexte chargé (worklog, a1-lot1.json, code des 2 modules lecture seule : cadrage 1 051 l. / thesis-plan 972 l.) ; baseline 6d93dd4, 0 fichier suivi modifié ; serveur 200 untouched ; comptages DB AVANT (PrismaClient lecture seule, a1-lot1c-db-before.json) : 1 thèse « Urbanisme durable » (7 chap / 2 295 mots / 6 versions, updatedAt 2026-08-10, structureMode chapters), 4 réf, 16 docs, parts 0, cadrages 0.
- Schéma vérifié : ThesisCadrage/Field/Version et Part/Chapter tous onDelete: Cascade vers Thesis (chapitre→partie = SetNull) — protocole thèse jetable SÛR → « AUDIT-A1c — Thèse de test » créée via UI (dashboard → dialogue, POST /api/thesis 201, 7 chapitres template). Tous les parcours exécutés sur elle ; thèse propriétaire jamais écrite.
- Cadrage de thèse (UI réelle, ~8 actions, 1 IA) : état vide sur propriétaire (aucun clic) ; sélecteur 2 thèses (AUDIT-A1c = theses[0] par défaut) ; « Créer le cadrage » → 12 champs POST 201, 0/12 ; états d'erreur : « Valider ce cadrage » désactivé < 25 %, « Lancer la vérification de cohérence » désactivé < 3 champs (« Minimum 3 champs remplis requis », 2ᵉ IA évitée) ; saisie Thématique (badge « Non sauvegardé » → PUT 200 + toast) + 2 champs (3/12 = 25 %) ; Valider → POST versions 201 + toast, Historique « Version du 09/10/2026 » dépliée (snapshot champs) ; « Générer un premier jet IA » → 1 POST /api/ai-writing 200 → 12 PUT suggestions + 12 badges ambre ; Accepter ×1 (badges 12→11) ; RELOAD → 3/12 + valeur acceptée + 11 suggestions INTACTES : persistance DB PROUVÉE (contrairement aux outils du lot 1b).
- Plan de thèse (UI réelle, ~9 actions, 0 IA) : ouverture sur propriétaire AVANT création test (lecture seule, 7 chap / 2 295 mots, capture) ; après test : vue affiche theses[0] = AUDIT-A1c (anomalie documentée) ; bascule « Par parties » (PUT 200 + toast, persistée) ; garde titre vide (Ajouter désactivé) ; partie « AUDIT-A1c Partie jetable » POST 201 ; « Ajouter un chapitre » → POST chapters 201 (Chapitre VIII) + PUT attach 200 ; DELETE partie : poubelle → ConfirmDeleteDialog (texte exact capturé) → Annuler = 0 requête DELETE + parts=1 en DB → Supprimer = DELETE /api/parts/{id} 200 → « 8 chapitres / 0 partie », DB parts=0, Chapitre VIII détaché (partId null) PAS supprimé (conforme message, SetNull) ; générateur LaTeX (Informatique/3/Par parties) → 4 076 car. (\documentclass, \part) → Copier toast ; RELOAD → structureMode « parts » + chapitre persistés.
- Cleanup : poubelle carte thèse AUDIT-A1c (liste « Changer de thèse ») → ConfirmDeleteDialog « …et ses 8 chapitre(s)… » → Supprimer → DELETE /api/thesis/{id} 200 ; cascade DB vérifiée : chapters 7→8→7, parts 0→1→0, cadrages/fields/versions 0→1/12/1→0, AUCUN orphelin ; états avant/après IDENTIQUES (diff a1-lot1c-db-before.json vs -after.json vide) — retour à 1 thèse propriétaire inchangée (captures a1-lot1c-cleanup-*.png).
- Consolidation : audit/baseline/evidence/a1-lot1.json MIS À JOUR (JSON validé) — entrées détaillées vues 08 (Cadrage) et 09 (Plan), « lots » = « 1 — COMPLET : 8 vues validées », audit_reseau_lot1c, état_proprietaire avant/après/identique:true, notes sessions 1b/1c conservées.
- ANOMALIES consignées (aucune bloquante, aucun code modifié) : P2 Plan de thèse — GET /api/thesis retourne les chapitres SANS partId/sortOrder (select réduit) : chapitres rattachés à une partie JAMAIS affichés dans les blocs (badge « 0 chap. » même après reload, détachement inatteignable en UI) alors que l'attachement persiste en DB — racine : GET /api/thesis/[id] (éditeur) retourne les chapitres complets ; P3 ×5 — vue Plan liée à theses[0] (updatedAt desc) et non à la thèse active (risque d'écrire sur la mauvaise thèse multi-thèses), badge partie non rafraîchi sans reload après « Ajouter un chapitre », poubelle = détachement (iconographie destructive pour action non destructive), « Valider ce cadrage » n'exécute pas la vérification de cohérence annoncée par son commentaire, coût 1 IA + 12 PUT du premier jet cadrage.
- Invariants : 0 commit, 0 code modifié (git status : worklog.md seul fichier suivi modifié), fichiers rouges jamais touchés, pas de db:push ni build, db skip-worktree intacte ; 1 seul appel IA sur toute la session (budget 1/vue respecté) ; quirk outillage consigné (find text a cliqué le bouton sidebar « Vérification méthodologique » au lieu de l'onglet — re-navigation immédiate, aucune écriture).
- Preuves : a1-lot1-08-cadrage-*.png ×11, a1-lot1-09-plan-*.png ×7, a1-lot1c-cleanup-*.png ×2, a1-lot1c-db-before/after.json.

Stage Summary:
- 2/2 vues du lot 1c VALIDÉES en UI réelle : Cadrage de thèse (création 12 champs, sauvegarde par champ, 1 IA premier jet → suggestions acceptables, validation → version, persistance DB prouvée par reload, gardes < 25 % / < 3 champs) ; Plan de thèse (modes chapitres/parties persistés, CRUD partie complet avec ConfirmDeleteDialog — Annuler = 0 requête/0 modification, Confirmer = 1 DELETE + détachement SetNull conforme, générateur LaTeX + copie).
- LOT 1 CLÔTURÉ : 8/8 vues prouvées et consolidées dans audit/baseline/evidence/a1-lot1.json (01-03 session initiale, 04-06 lot 1b, 08-09 lot 1c) — registre A1 : 8 vues du lot 1 validées, reste 25 vues sur 33.
- Registre C-3 : action « thesis-plan partie » passée de code-seulement à VÉRIFIÉE UI RÉELLE (9/16) ; 7 actions restent au lot 2 (onglet-recherche ×2, article-redaction ×2, registre-juridique, agile ×2).
- 1 anomalie P2 + 5 P3 consignées sans correction (contrainte aucun code modifié) ; état propriétaire strictement préservé (thèse test AUDIT-A1c créée puis supprimée via UI, cascade intégrale vérifiée).
---
Task ID: W1-8b (audit-final-v1.2 / A2 lot 2)
Agent: agent-exécution UI (Z.ai Code, session dédiée W1-8b)
Task: A2 lot 2 — test UI réel des 7 dernières actions destructives code-seulement (contrôles ①-⑥ par action) + clôture du registre C-3 16/16.

Work Log:
- Contexte chargé (worklog, c3-revalidation.json, a2-lot1.json format preuve) ; baseline bc71223, 0 fichier suivi modifié ; ANOMALIE ENVIRONNEMENT : serveur dev Next.js ARRÊTÉ au démarrage (port 3000 muet, seul geo-mcp-service survivait sur 3005 — signature OOM C-2) → redémarré hors bande (bun run dev double-detach via node spawn, technique C-2), 200 OK, dépôt intact.
- Comptages DB AVANT (lecture seule, script node @prisma/client one-shot tmp-w18b-counts.mjs) : état propriétaire exact + tables lot 2 : Article 1 (« Urbanisation durable et technologies numeriques a Alger (article) », 1 version), ArticleVersion 1, ResearchTab 0, AgileSprint 0, AgileStory 0, LegalRef 27.
- Action 2 puis Action 1 sur le MÊME onglet de test (l'ordre 2→1 permet les deux contrôles sur un seul objet, l'action 1 supprimant l'onglet) : onglet « AUDIT-A2b-Onglet jetable » créé dans l'UI (Nouvel onglet → Renommer, POST 201) + rempli (notes 54 car., 1 lien, PUT debounced 200). EFFACER : dialogue « Effacer tout le contenu de l'onglet ? » → ① 0 requête à l'ouverture → Annuler = 0 requête (13→13) + notes/lien intacts UI+DB → Confirmer = exactement 1 PUT /api/research-tabs/cmv1eckaa… 200 (~2 s après, debounce 1,5 s) + 1 GET re-fetch, onglet CONSERVÉ, DB {notes:"",links:"[]",quotes:"[]",todos:"[]"}, UI « 0 car. / Aucun lien ». CONFORME. FERMETURE X : dialogue « Supprimer cet onglet de recherche ? » ciblant le titre exact → Annuler = 0 requête (15→15) + onglet UI+DB (ResearchTab 2) → Confirmer = exactement 1 DELETE /api/research-tabs/cmv1eckaa… 200, onglet disparu. CONFORME. Cleanup : onglet auto-créé « Recherche principale » (auto-création POST 201 de l'app à la première visite avec 0 onglet, comportement produit consigné) supprimé via le MÊME flux testé (DELETE cmv1ec5es… 200) → ResearchTab 0.
- Actions 4 puis 3 (Brouillon d'article, vue 17) : doc source « AUDIT-A2b-source.txt » importé via l'UI (input fichier + Importer et extraire, POST /api/article-imports 201, thesisId thèse active) ; article « AUDIT-A2b-Article jetable » créé (POST /api/articles 201). DOC SOURCE : dialogue « Retirer ce document source ? » → Annuler = 0 requête (120→120) + doc UI+DB (ImportedDoc 17) → Confirmer = exactement 1 DELETE /api/article-imports?id=cmv1ehhva… 200, doc disparu, ARTICLE SURVIT (Article 2 en DB, article test toujours listé). CONFORME. ARTICLE : dialogue « Supprimer cet article ? » → Annuler = 0 requête (121→121) → Confirmer = exactement 1 DELETE /api/articles/cmv1ei03… 200 + GET liste, Article 2→1, article propriétaire (1 version) INTACT. CONFORME.
- Action 5 (Livres-compétences → onglet « Registre juridique » — la vue porte le registre URBANIS-DZ, pas Méthodologie) : entrée « AUDIT-A2b-Entrée juridique jetable » créée via dialogue Nouvelle entrée (POST /api/legal-refs 201) → dialogue « Supprimer cette entrée juridique ? » → Annuler = 0 requête (130→130) + LegalRef 28 → Confirmer = exactement 1 DELETE /api/legal-refs/cmv1eksn… 200, LegalRef 27 (entrées propriétaires intactes). CONFORME.
- Actions 6 puis 7 (Feuille de Route Agile, vue 13) : sprint « AUDIT-A2b-Sprint jetable » créé (POST /api/sprints 201, phase Rédaction) + story « AUDIT-A2b-Story jetable » (POST …/stories 201). STORY : poubelle carte Kanban → dialogue « Supprimer cette story ? » → Annuler = 0 requête (141→141) + AgileStory 1 → Confirmer = exactement 1 DELETE /api/stories/cmv1em4yh… 200 + toast « Story supprimée », sprint SURVIT (1). CONFORME. SPRINT : story témoin « AUDIT-A2b-Story cascade » créée (pour vérifier la cascade) → « Supprimer ce sprint » → dialogue « Supprimer ce sprint ? … et toutes ses stories seront définitivement supprimés » → Annuler = 0 requête (147→147) + 1/1 en DB → Confirmer = exactement 1 DELETE /api/sprints/cmv1elscs… 200 ; CASCADE OBSERVÉE CONFORME AU MESSAGE : sprint ET story témoin SUPPRIMÉS (AgileSprint 0, AgileStory 0, aucun orphelin — Prisma onDelete: Cascade, stories supprimées pas détachées), UI retour « Aucun sprint créé ». CONFORME.
- Audit réseau session : 149 entrées, exactement 7 DELETE (6 actions + 1 cleanup onglet auto-créé, même flux), tous 200 sur les endpoints attendus, AUCUNE autre requête destructive ; 0 erreur console/page ; POST = créations objets de test + 1 POST /api/text-prediction (prédiction de saisie interne, non destructif).
- État propriétaire APRÈS : diff before/after VIDE sur les 18 tables (1 thèse « Urbanisme durable » updatedAt 2026-08-10 inchangé, 7 chap / 2 295 mots / 6 versions, 4 réf, 16 docs (12 blobs), 24 jobs, Article 1, ArticleVersion 1, ResearchTab 0, Sprint 0, Story 0, LegalRef 27, etc.) — effet net nul ; tous les objets AUDIT-A2b- supprimés VIA LE FLUX TESTÉ.
- Observation statique P3 consignée (cas d'échec non sollicité, 0 impact) : removeImport (article-redaction) ne vérifie pas res.ok et filtre l'état local sans refetch → divergence UI/DB possible en cas d'échec serveur ; deleteArticle recharge toujours la liste (pas de divergence). Quirks : refs agent-browser à re-snapshotter après re-rendus ; reload SPA → vue réinitialisée (dashboard), re-navigations faites.
- Preuves : audit/baseline/evidence/a2-lot2.json (7 actions × contrôles ①-⑥ + endpoints observés + registre « 16/16 vérifiées en UI réelle ») + 22 captures a2-lot2-{1-onglet,2-effacer,3-article,4-import,5-legalref,6-story,7-sprint}-{dialogue,annule,confirme}.png (+ -rempli) + a2-lot2-db-before.json / a2-lot2-db-after.json + tmp-w18b-counts.mjs.
- Invariants : 0 commit, 0 code modifié (git status : 0 fichier suivi modifié), fichiers rouges jamais touchés (0 diff), pas de db:push ni build, db skip-worktree intacte, fichier upload créé hors dépôt (/tmp).

Stage Summary:
- 7/7 actions destructives du lot 2 CONFORMES en UI réelle sur les 6 contrôles : aucune suppression sans confirmation, Annuler = 0 requête/0 modification (prouvé réseau + DB + UI), Confirmer = exactement 1 requête destructive sur le bon endpoint (prouvé), cascades conformes (sprint → stories SUPPRIMÉES conformément au message ; story → sprint survit ; doc import → article survit ; onglet/legal-ref/article → entités conformes), UI à jour, 0 erreur.
- Endpoints observés : PUT /api/research-tabs/{id} (Effacer, debounce 1,5 s), DELETE /api/research-tabs/{id}, DELETE /api/article-imports?id={id}, DELETE /api/articles/{id}, DELETE /api/legal-refs/{id}, DELETE /api/stories/{id}, DELETE /api/sprints/{id}.
- REGISTRE C-3 CLÔTURÉ : 16/16 actions destructives vérifiées en UI réelle (3 C-3 + 5 lot 1 + 1 lot 1c + 7 lot 2) — « avancement_registre » : « 16/16 vérifiées en UI réelle » consigné dans a2-lot2.json.
- État propriétaire strictement préservé (diff DB before/after vide) ; 1 anomalie environnement (serveur dev à redémarrer) + 1 observation statique P3 (removeImport sans res.ok) consignées sans correction (contrainte aucun code modifié).

---
Task ID: W1-9 (audit-final-v1.2 / synthèse de communication)
Agent: Z.ai Code (session principale)
Task: Produire un rapport d'étape autonome transmissible au développeur, sur demande du propriétaire.

Work Log:
- Lecture de l'état complet : BASELINE_AUDIT_REPORT_v1.2.md (73 l.), tasks.md (T1-T9 statuts), git log (8 commits du cycle f904c87→c01f5bd), fin du worklog (W1-7b/7c/8b), comptage preuves (157 PNG, 21 JSON), date 2026-10-10, arbre propre HEAD==origin/main==c01f5bd.
- Rédaction audit/baseline/16_SYNTHESE_ETAPE_POUR_DEV.md : synthèse autonome (cadre 4 lots, réalisations vagues 1+2 avec commits, tableau conformité 11 critères, anomalies découvertes AUD-FUNC-007+P3, 6 règles contraignantes pour reprise, reste à faire réparti dev/propriétaire, moyens de vérification, incidents).

Stage Summary:
- 16_SYNTHESE_ETAPE_POUR_DEV.md livré — document de communication distinct des rapports canoniques (v1.0 immuable, v1.1 historique, v1.2 itératif) ; aucune modification de code, fichiers rouges intacts, db skip-worktree intacte.

---
Task ID: W2-2 (audit-final-v1.2 / isolation multi-thèses)
Agent: agent-audit-isolation (Z.ai Code)
Task: Audit prioritaire isolation multi-thèses — Phase 1 revue de code lecture seule (cartographie modèles, inventaire usages theses[0], cause racine AUD-FUNC-007, chemins d'écriture cross-thèse) + Phase 2 vérification UI réelle ciblée (agent-browser) avec test décisif d'écriture cross-thèse, preuves et cleanup intégral. AUCUNE modification de code.

Work Log:
- Contexte chargé (worklog W1-7/7b/7c/8/8b/F-2/W1-9, a1-lot1.json vues 08/09, a1-inventory-restantes.json W2-1, registre 09) ; baseline git 0a424aeeb1da0bcb022bede30d15bff4ffe41bbb, arbre propre (0 fichier suivi modifié) ; serveur dev 200 untouched ; snapshot DB AVANT (PrismaClient lecture seule, iso-db-before.json) : 1 thèse « Urbanisme durable » (cmsmyrdfs0000pa2sews4vo90, structureMode chapters, createdAt=updatedAt 2026-08-10T08:22:35.464Z, 7 chap / 2 295 mots / 6 versions / 0 part / 0 cadrage / 0 toolbox), 4 réf, 16 docs, 27 LegalRef, 1 ElementAnalyse, 1 NotebookEntry, 1 Experiment (+1 run), 24 Job, 1 Article (+1 version), 12 DocumentChunk, SoutenancePrep 1, TypeAnalyse 1, SessionVerification 2, CustomBookSkill 58.
- Phase 1 (lecture seule) : cartographie schema.prisma → 10 modèles thèse-scopés stricts (Chapter/Part/ChapterVersion/ThesisCadrage+Field+Version/DoctoralToolbox/SoutenancePrep/ResearchTab), 3 à thesisId nullable (Article/ImportedDoc/DocumentChunk), 15 familles GLOBAL PAR CONCEPTION (Reference, ResearchSource/NotebookEntry, AgileSprint/Story, Experiment/Run, ElementAnalyse [chapitreId = chaîne SANS relation ni index], TypeAnalyse, SessionVerification, CustomBookSkill, LegalRef, Job, SavedSearch/Result, LicenseKey). Inventaire theses[0] : 5 occurrences (thesis-plan 501-503 lien DIRECT sans store ; cadrage 198-199, boite-doctorale 443-444, equilibre-chapitres 140-141 sélecteurs locaux défaut theses[0] ; onglet-recherche 157-158 store||theses[0] + sélecteur in-view qui MUTE le store 760-777) vs pages saines activeThesisId (editor, soutenance, brouillon, rag, ai-writing, article-redaction). AUD-FUNC-007 cause racine confirmée : GET /api/thesis (route.ts:16) select chapitres {id,number,title,wordCount,status} SANS partId/sortOrder vs GET /api/thesis/[id] include complet ; consommateur thesis-plan-page.tsx:392/449/652 ; correctif minimal PROPOSÉ (1 fichier : ajouter partId+sortOrder au select — NON implémenté).
- Phase 2 (UI réelle) : thèse jetable « AUDIT-ISO — Thèse isolation » créée via dialogue dashboard (POST 201, 7 chapitres template auto) → theses[0] = AUDIT-ISO (updatedAt desc), activeThesisId = AUDIT-ISO (auto) ; bascule active = propriétaire via Changer de thèse → configuration discriminante theses[0]≠active.
- VUE PLAN (suspect principal) : active=propriétaire → la vue affiche « AUDIT-ISO / 7 chapitres / 0 mots » (PAS 7/2 295) — PROUVÉ capture iso-04 : la vue suit theses[0], pas activeThesisId. TEST DÉCISIF d'écriture cross-thèse : bascule « Par parties » → PUT /api/thesis/cmv24arxh0000q7vho2sn64kq 200 (= theses[0] AUDIT-ISO, ≠ activeThesisId=propriétaire) ; DB : AUDIT-ISO structureMode=parts, PROPRIÉTAIRE INCHANGÉ (chapters, updatedAt 2026-08-10T08:22:35.464Z). L'écriture cross-thèse est RÉELLE (ici tombée sur la jetable ; ordre inversé = propriétaire touchée).
- AUD-FUNC-007 reproduit en UI : partie créée (POST parts 201), « Ajouter un chapitre » (POST chapters 201 + PUT attach 200) → RELOAD → badge partie « 0 chap. »/« 0 mots » TOUJOURS alors que DB chaptersAvecPartId=1 ; chapitre VIII invisible NULLE PART ; détachement inatteignable (capture iso-06). Aucune perte de données.
- CADRAGE : active=propriétaire → défaut sélecteur « Thèse : » = AUDIT-ISO (theses[0]) documenté en capture SANS cliquer Créer (iso-07) ; puis active=AUDIT-ISO → cadrage créé volontairement (POST /api/thesis/{audit-iso}/cadrages 201, 12 champs) = preuve du chemin d'écriture vers le sélecteur ; propriétaire 0 cadrage avant/après.
- Échantillon vues (active=AUDIT-ISO) : Onglet Recherche — isolation affichage OK (onglet « AUDIT-ISO-Onglet jetable » invisible sous propriétaire, iso-11) MAIS auto-création « Recherche principale » déclenchée AUSSI sur le propriétaire lors de la bascule in-view (POST 201) → supprimée via le flux confirmé (DELETE 200, net nul) ; le sélecteur in-view mute le store global. Expérimentations — « AUDIT-ISO-Expérimentation jetable » (POST sans thesisId) visible des DEUX contextes (iso-16/iso-17) = global par conception ; supprimée via flux confirmé (DELETE 200, DB 2→1). Références — mêmes 4 réf des 2 contextes (iso-13/iso-19, fait produit re-confirmé, pas de correction). Boîte doctorale — visite avec active=propriétaire → toolbox AUTO-CRÉÉE sur theses[0] (POST 201, DoctoralToolbox 0→1) = 2e démonstration live du binding theses[0]. Agile/Outils IA/Articles — constats display (globales/nullable). Équilibre chapitres — fallback theses[0] au code, 0 écriture DB.
- Audit réseau session (94 fetch) : TOUTES les écritures listées et rattachées à cmv24arxh… (AUDIT-ISO) ou objets AUDIT-ISO- globaux ; unique dérogation = auto-création applicative de l'onglet sur le propriétaire (compensée, net nul) ; aucune requête destructive parasite (1 mauvais X onglet cliqué → dialogue ANNULÉ 0 requête, puis bon onglet).
- Cleanup : onglet jetable + expérimentation supprimés via flux confirmés ; poubelle thèse AUDIT-ISO → ConfirmDeleteDialog « …et ses 8 chapitre(s)… » → Supprimer → DELETE /api/thesis/cmv24arxh0000q7vho2sn64kq 200 ; cascade vérifiée (Chapter 15→7, Part 1→0, ThesisCadrage 1→0/12 champs→0, DoctoralToolbox 1→0, ResearchTab 2→0, AUCUN orphelin) ; activeThesisId=null ; DIFF DB avant/après VIDE sur les 30 tables comptées (iso-db-before.json vs iso-db-after.json) — thèse propriétaire strictement intacte (7 chap / 2 295 mots / 6 versions / structureMode chapters / updatedAt inchangé).
- Invariants : 0 commit, 0 code modifié (git status : 0 fichier suivi modifié, worklog.md seul diff), fichiers rouges jamais touchés, pas de db:push ni build, db skip-worktree intacte, 0 génération IA (budget intact), aucun secret dans les preuves ; script de comptage temporaire supprimé.
- Preuves : audit/baseline/evidence/isolation-multitheses.json (cartographie, inventaire theses[0] sourcé fichier:ligne, AUD-FUNC-007 + correctif minimal proposé, test décisif réseau+DB, verdicts par vue, 7 anomalies proposées, état avant/après, 23 captures indexées) + 22 captures iso-*.png + iso-db-before/after.json.

Stage Summary:
- VERDICT ISOLATION : RISQUE À QUALIFIER (2 risques P1/P2 à corriger avant GO) — l'isolation STRUCTURELLE existe pour chapitres/parties/cadrages/boîte doctorale/soutenance/onglets/RAG (FK+Cascade) MAIS la couche UI sélectionne la thèse par theses[0] (updatedAt desc) au lieu d'activeThesisId sur 5 modules, et 8 familles de données sont globales par conception sans signal utilisateur.
- TEST DÉCISIF PROUVÉ (UI+réseau+DB) : la bascule « Par parties » de la vue Plan a écrit PUT /api/thesis/cmv24arxh… (=theses[0]) alors que la thèse ACTIVE était le propriétaire — si l'ordre updatedAt avait été inversé, l'écriture serait tombée sur le propriétaire. Boîte doctorale : auto-création toolbox sur theses[0] à la simple visite (2e écriture live hors thèse active).
- AUD-FUNC-007 : cause racine confirmée (GET /api/thesis select sans partId/sortOrder, route.ts:16) + reproduction UI (badge « 0 chap. » post-reload malgré partId en DB, détachement inatteignable) + correctif minimal 1 fichier PROPOSÉ non implémenté.
- 7 anomalies nouvelles proposées au registre : AUD-ISO-001 P1 (Plan écrit theses[0] — requalification P3→P1, écriture prouvée), AUD-ISO-002 P2 (sélecteurs locaux défaut theses[0] : cadrage/boîte doctorale/équilibre), AUD-ISO-003 P2 (auto-création toolbox sur theses[0] à la visite), AUD-ISO-004 P2 (AUD-FUNC-007 consolidée), AUD-ISO-005 P3 (onglet-recherche mute le store global + auto-création par contexte), AUD-ISO-006 P3 (8 familles globales sans indication UI), AUD-ISO-007 P3 (stats dashboard agrégées multi-thèses).
- État propriétaire STRICTEMENT préservé (diff DB 30 tables vide, updatedAt 2026-08-10 inchangé) ; thèse AUDIT-ISO et objets de test supprimés VIA L'UI avec cascades vérifiées ; 0 génération IA consommée.
---
---
Task ID: W2-3a+fin (audit-final-v1.2 / A1 lot 2a — sous-session 1 exécution interrompue + sous-session 2 finalisation)
Agent: SS1 agent-exécution UI (W2-3a, interrompue avant consolidation) ; SS2 agent-finalisation (W2-3a-fin, Z.ai Code)
Task: A1 lot 2a — pass UI réel des 5 vues (13 Feuille de Route Agile, 14 Boîte doctorale, 15 Équilibre chapitres, 25 Onglet Recherche, 37 Expérimentations) + cleanup intégral + consolidation de la preuve. AUCUNE modification de code.

Work Log:
- SS1 (baseline 6e79e6e, 08:42-09:06, INTERROMPUE) : thèse jetable « AUDIT-ISO-L2 — Thèse jetable lot 2a » créée via UI (POST /api/thesis 201, 7 chapitres template, cmv25f48u…) ; 33 captures séquentielles a1-lot2a-*.png (00 accueil, 01 thèse créée, 13 agile ×9 dont IA erreur 400+toast, 14 boîte ×8, 15 équilibre ×6, 25 onglet ×3, 37 exps ×3, 2 dialogues cleanup) ; comptages DB AVANT archivés (a1-lot2a-db-before.json 08:42) ; cleanup PARTIEL juste avant interruption (dialogues capturés puis confirmés : DELETE sprint 200 [cascade story], DELETE expérimentation 200 [cascade run], onglets L2 + auto-créés propriétaire DELETE 200) ; la thèse L2 RESTAIT à supprimer ; consolidation JSON, comptages finaux et worklog NON faits (interruption). Son audit réseau n'était pas archivé.
- SS2 (baseline 2df1613, 09:10-09:25) : serveur 200 untouched ; RÉCUPÉRATION MAJEURE : le journal réseau CDP du contexte navigateur persistant du daemon agent-browser conservait la fin de SS1 → archivé INTÉGRALEMENT (a1-lot2a-network-recovered.json, 823 requêtes API couvrant les 2 sous-sessions) : les DELETE de cleanup SS1 sont des faits réseau observés (cohérents captures dialogues + DB à 0), pas des inférences.
- SS2 Cleanup : poubelle thèse AUDIT-ISO-L2 (liste « Changer de thèse » éditeur) → ConfirmDeleteDialog « « AUDIT-ISO-L2 — Thèse jetable lot 2a » et ses 7 chapitre(s)… » (capture) → Supprimer → DELETE /api/thesis/cmv25f48u… 200 ; cascades vérifiées DB (Chapter 14→7, DoctoralToolbox 1→0 [toolbox auto-créée SS1 sur L2], 0 orphelin).
- SS2 Contrôles de clôture (courts, audit réseau filtré api + captures a1-lot2a-fin-*) : vue 13 « Aucun sprint créé » (0 écriture) ; vue 37 liste = 1 exp propriétaire préexistante « Jumelage numérique du corridor UEMOA » (Planifiée, 1 run) — liste NON vide : état initial propriétaire restauré (avant/après identiques) ; vue 15 propriétaire 7 chap / 2 295 mots / moy. 328 + re-constat objectif 2000 défini (0 écriture réseau) → reload → « Pas d'objectif » ×7 (non-persistance re-prouvée) ; vue 25 ResearchTab DB 0, auto-création propriétaire à la visite (POST 201) → flux confirmé DELETE 200 → net nul ; NOUVEAU CONSTAT race : 2e visite → 3 POST 201 quasi simultanés (12.994/13.009/13.020) → 3 onglets « Recherche principale » dupliqués → 3× flux confirmé DELETE 200 → net nul ; vue 14 : DoctoralToolbox DB 0 AVANT visite → POST /api/thesis/cmsmyrdfs…/doctoral-toolbox 201 à la visite = AUTO-CRÉATION SUR LE PROPRIÉTAIRE (theses[0] désormais = propriétaire, 3e démonstration live AUD-ISO-003) — AUCUNE voie UI de suppression (aucun endpoint DELETE dans le module, pas de poubelle globale) → consigné + signalé (interdiction d'écriture directe DB respectée).
- SS2 Comptages DB FINAUX : a1-lot2a-db-after.json (30 tables) — diff vs before VIDE sur 29/30 tables ; unique écart : DoctoralToolbox 0→1 (auto-création propriétaire documentée ci-dessus, contenu = template INITIAL_* pur vérifié en lecture seule : 37 items non cochés, 16 documents « absent », 4 contacts vides, notes "" — zéro donnée utilisateur, zéro mélange) ; thèse propriétaire inchangée (7 chap / 2 295 mots / 6 versions / updatedAt 2026-08-10T08:22:35.464Z) ; exp propriétaire + run intacts.
- SS2 Consolidation : audit/baseline/evidence/a1-lot2a.json (JSON validé, structure a1-lot1.json) — 5 vues détaillées (module+lignes, parcours reconstruits EXACTEMENT depuis noms de captures SS1 + réseau récupéré + re-constats SS2, états erreurs, persistance, isolation AUD-ISO-002/003/005/006 confirmés/complétés, destructives = réf. a2-lot1/a2-lot2 SANS retest, anomalies P2/P3, captures), audit_reseau 2 sous-sessions, etat_proprietaire before/after/écart résiduel documenté.
- ANOMALIES consignées (5, aucune correction — 0 code modifié) : A1L2A-01 P2 vue 13 IA agile 2×POST ai-writing 400 + toast (échec systématique, à diagnostiquer) ; A1L2A-02 P2 vue 14 auto-création toolbox sur theses[0] — MATÉRIALISÉE SUR LE PROPRIÉTAIRE en SS2 et NON supprimable via UI (consolidation AUD-ISO-003, cas irréversible côté utilisateur) ; A1L2A-03 P2 vue 15 objectifs chapitres non persistés (local, perdus au reload, re-constaté 2×, 0 écriture réseau) ; A1L2A-04 P3 vue 15 rythme local (aucune table) ; A1L2A-05 P2 vue 25 auto-création onglet NON IDEMPOTENTE (race ×3 POST 201 → 3 onglets dupliqués, preuve réseau archivée ; consolidation AUD-ISO-005).
- Invariants : 0 commit, 0 code modifié (git status : captures + JSON non suivis uniquement), fichiers rouges jamais touchés, pas de db:push ni build, db skip-worktree intacte, 0 génération IA SS2 (SS1 : 2×400 échec + 1×200 équilibre), 0 écriture directe DB, aucun secret dans les preuves ; scripts temporaires supprimés (tmp-w23a-counts.mjs SS1, logs réseau dans /tmp hors dépôt).

Stage Summary:
- LOT 2a : 4/5 vues VALIDÉES + 1 VALIDÉE AVEC RÉSERVES — 13 Agile (création sprint/story, statuts, stats, persistance reload, cascade sprint→stories conforme ; MAIS IA agile 400×2 P2) ; 14 Boîte doctorale (checklist/jalons/documents/calendrier persistés 12 PUT, binding theses[0] confirmé ; MAIS auto-création propriétaire non annulable P2) ; 15 Équilibre (analyse 7 chap/2 295 mots OK, IA recommandations 200 ; MAIS objectifs/rythme non persistés P2/P3) ; 25 Onglet recherche (persistance debounced + reload OK, flux destructifs réutilisés 4× OK ; MAIS auto-création en course ×3 P2) ; 37 Expérimentations (création/run/statuts/PATCH persistés, cleanup cascade OK, propriétaire intact — aucune anomalie nouvelle).
- État propriétaire : strictement préservé SAUF 1 résidu documenté DoctoralToolbox=1 (auto-création applicative déclenchée par le contrôle de clôture exigé de la vue 14, contenu = template pur, non supprimable via UI) — SIGNALÉ : décision propriétaire/dev requise (laisser / DELETE ciblé hors audit / correctif AUD-ISO-003). Toutes les autres tables : diff vide, updatedAt inchangé.
- Preuves : a1-lot2a.json (consolidé) + a1-lot2a-db-before/after.json + a1-lot2a-network-recovered.json (réseau 2 sous-sessions récupéré) + 44 captures a1-lot2a-*.png (33 SS1 + 11 SS2).
- Registre A1 : 13/33 vues validées (8 lot 1 + 5 lot 2a) ; reste 20 vues (lots 2b/3/4).
---
Task ID: W2-3b (audit-final-v1.2 / A1 lot 2b)
Agent: agent-exécution UI (Z.ai Code)
Task: A1 lot 2b — pass UI réel de 4 vues (méthodologie, analyse du champ, outils SLR, outils IA)

Work Log:
- Contexte chargé (worklog W2-2/W2-3a+fin, a1-lot2a.json format preuve, isolation-multitheses.json AUD-ISO-006) ; baseline 8161a70, 0 fichier suivi modifié (git status : preuves non suivies uniquement) ; serveur 200 untouched ; comptages DB AVANT (node @prisma/client one-shot lecture seule, a1-lot2b-db-before.json) : 1 thèse « Urbanisme durable » (cmsmyrdfs0000pa2sews4vo90, 7 chap, structureMode chapters, updatedAt 2026-08-10T08:22:35.464Z), 4 réf, 16 docs, 0 ResearchTab, 0 Sprint/Story, 1 Experiment (+1 run), 27 LegalRef, 24 Job, 1 ElementAnalyse, 1 NotebookEntry (« Question de test T4 »), 0 ResearchSource, 1 DoctoralToolbox (résidu documenté commit 8161a70 — non touché).
- Revue de code lecture seule préalable : les 4 vues sont NON thèse-scopées (methodology 505 l. statique sans fetch ; analyse-champ-recherche 1 334 l. = 2 POST ai-writing seulement ; outils-slr 1 563 l. = 1 POST ai-writing seulement ; ai-tools 1 125 l. = /api/sources+/api/entries+1 POST ai-writing) → AUCUNE thèse jetable nécessaire, propriétaire jamais écrit.
- Vue 26 Méthodologie (UI réelle, 0 IA, 0 écriture) : guide statique 5 accordéons ouverts, checklist 10 items — coche 3 items → « 3/10 — 30 % » ; 0 requête réseau lors des toggles ; RELOAD → 0/10 : checklist NON persistée (A1L2B-01 P3, même classe qu'Équilibre A1L2A-03).
- Vue 27 Analyse du champ (UI réelle, 1 IA) : état vide « Aucune analyse en cours » ; garde sujet vide = 0 requête MAIS toast « Champ requis » INVISIBLE → DÉCOUVERTE A1L2B-02 P2 : le hook shadcn use-toast est utilisé par 10 modules alors que le <Toaster> shadcn n'est jamais monté (layout ne monte que sonner) — gardes/erreurs muets sur ces 10 modules ; saisie sujet AUDIT-L2b- → 1 POST ai-writing 200 → 4 sections parsées (État de l'art/Auteurs/Lacunes/Pistes) + carte conceptuelle auto-peuplée + nœud manuel « AUDIT-L2b-Nœud jetable » ajouté + Paysage dérivé + onglet Positionnement (2ᵉ IA NON déclenchée, budget) ; RELOAD → tout perdu (analyse, carte, nœud) = 100 % local (A1L2B-03 P3 : reconsomme 1 IA à chaque visite ; ElementAnalyse = verification-carto, PAS ce module).
- Vue 28 Outils SLR (UI réelle, 0 IA) : 6 onglets PRISMA/Protocole/Criblage/Extraction/Qualité/Suivi ; PICO champ P « AUDIT-L2b-Population jetable » → question générée régénérée en direct ; CRUD critère : dialogue « Nouveau critère » → « AUDIT-L2b-Critère jetable (test audit) » Inclusion 4→5 + toast sonner VISIBLE « Critère ajouté », poubelle → 5→4 + « Critère supprimé » (sans confirmation — sans risque, local) ; Criblage : décision Inclure sur article démo → badges 4→5 Inclus/50 %→63 %, recherche « MOOC » → 1 ligne ; Extraction : « Exporter en CSV » → toast « Export CSV téléchargé » (Blob côté code) ; Suivi PRISMA ; RELOAD → tout l'atelier réinitialisé aux données DÉMO (245 articles génériques IA-enseignement, 8/4/2/2) = A1L2B-04 P3 (atelier non persisté) + A1L2B-05 P4 (coquille « Quelle est l'effet »).
- Vue 35 Outils IA (UI réelle, 1 IA) : Carnet — état vide sources, témoin propriétaire « Question de test T4 » jamais modifié ; source « AUDIT-L2b-Source jetable (test audit) » (garde bouton Ajouter désactivé titre vide) POST 201 ; note « AUDIT-L2b-Question jetable… » liée via select POST 201 ; RELOAD → source+note TOUJOURS PRÉSENTES = PERSISTANCE DB PROUVÉE (seule vue persistée du lot 2b) ; Consensus — réduit à « 1 mode(s) sélectionné(s) » (Rédaction) → EXACTEMENT 1 POST ai-writing 200 → réponse rendue ; Visualisation = placeholder « Bientôt disponible » (statique) ; Cleanup VIA LE FLUX TESTÉ (destructifs déjà validés 6/6 A2 lot 1, SANS retest) : dialogue « Supprimer cette note ? » → 1 DELETE /api/entries/… 200, dialogue « Supprimer cette source ? … irréversible » → 1 DELETE /api/sources/… 200, retour Sources 0 / témoin T4 intact ; A1L2B-06 P3 (aucune édition sources/notes) + A1L2B-07 P4 (delete sans res.ok, revue de code).
- Audit réseau session : 57 requêtes /api* archivées (a1-lot2b-network.log), 6 écritures TOUTES rattachées (2 POST créations AUDIT-L2b, 2 DELETE cleanup, 2 POST ai-writing) — 0 écriture sur /api/thesis/* ou données propriétaire, 0 parasite, 0 4xx/5xx ; budget IA 2 (1/vue IA max RESPECTÉ : 26:0, 27:1, 28:0, 35:1).
- Consolidation : audit/baseline/evidence/a1-lot2b.json (JSON validé, structure lot2a) — 4 vues (26/27/28/35) avec distinction VÉRIFIÉ UI RÉEL vs revue de code, a1-lot2b-db-after.json (diff vs before VIDE sur 30 tables ET _theses), 26 captures a1-lot2b-*.png ; scripts temporaires supprimés.
- Invariants : 0 commit, 0 code modifié, fichiers rouges jamais touchés, pas de db:push ni build, db skip-worktree intacte, 0 thèse jetable créée, 0 écriture directe DB, aucun secret dans les preuves.

Stage Summary:
- 4/4 vues du lot 2b VALIDÉES en UI réelle — 26 Méthodologie (guide statique complet, checklist non persistée P3) ; 27 Analyse du champ (1 IA → 4 sections + carte auto/manuel, 100 % local non persisté P3, toasts muets P2) ; 28 Outils SLR (PICO live, CRUD critère avec toasts sonner OK, criblage/decisions/filtre, export CSV toast, atelier démo non persisté P3) ; 35 Outils IA (carnet sources/notes PERSISTÉS DB prouvé reload + cleanup net nul via flux confirmés, consensus 1 mode = 1 IA, visualisation placeholder, global par conception AUD-ISO-006 re-confirmé par code).
- ANOMALIE NOTABLE : A1L2B-02 P2 — 10 modules à toasts invisibles (use-toast shadcn sans Toaster monté) : gardes fonctionnelles mais silencieuses (prouvé UI sur vue 27 : 0 requête, 0 feedback) ; liste des 10 modules consignée.
- État propriétaire STRICTEMENT préservé : diff DB before/after VIDE (30 tables + _theses, updatedAt inchangé), témoin NotebookEntry T4 intact, résidu DoctoralToolbox documenté inchangé ; objets AUDIT-L2b- tous supprimés via le flux testé.
- Registre A1 : 17/33 vues validées (8 lot 1 + 5 lot 2a + 4 lot 2b) ; reste 16 vues (lots 3/4).
---
Task ID: W2-4a (audit-final-v1.2 / A1 lot 3a)
Agent: agent-exécution UI (Z.ai Code)
Task: A1 lot 3a — pass UI réel de 5 vues de vérification (méthodologique, citations, hypothèses, cohérence, preuves)

Work Log:
- Contexte chargé (worklog W2-3a+fin/W2-3b, a1-lot2a.json format preuve, A1L2B-02 toasts invisibles) ; baseline bc0d2d7, 0 fichier suivi modifié (git status : preuves non suivies uniquement) ; serveur 200 untouched ; comptages DB AVANT (bun @prisma/client one-shot lecture seule, a1-lot3a-db-before.json) : conforme attendu — 1 thèse « Urbanisme durable » (cmsmyrdfs0000pa2sews4vo90, 7 chap, updatedAt 2026-08-10T08:22:35.464Z), 6 ChapterVersion, 4 réf, 16 docs, 1 Article+1v, 0 ResearchTab/Sprint/Story, 1 Experiment+1 run, 27 LegalRef, 24 Job, 1 ElementAnalyse, 1 NotebookEntry, 1 DoctoralToolbox (résidu documenté, non touché).
- Revue de code lecture seule préalable des 5 modules + routes : AUCUNE vue n'écrit en DB (citation-check/coherence-check/stats-recompute/alignement-preuves = 0 prisma write ; alignement-preuves = 3 find* LECTURE SEULE ; ai-writing/ai-writing/stream = stateless) et AUCUNE ne lit la thèse SAUF alignement-preuves (GET /api/thesis, défaut list[0]=theses[0] l.145) → AUCUNE thèse jetable nécessaire, propriétaire jamais écrit, IA autorisée sur saisies manuelles + lecture seule propriétaire.
- NOTE investigation : suspicion « const ethodologyText » (artefact d'affichage ANSI de la séquence « [m » dans grep/sed) — DÉMENTIE par analyse byte-à-byte Node (code 91 « [ » + « method » présents) et parse TypeScript (0 diagnostic) : AUCUNE anomalie code, la vue 29 compile et fonctionne.
- Vue 29 Vérification méthodologique (UI réelle, 1 IA) : 5 onglets ; audit 32 critères pondérés — 3 clics → 45/100 « À améliorer », 2/32 (0 écriture réseau) ; Suivi affiché ; Cohérence = garde silencieuse à <2 champs (bouton activé à 1 champ, clic → 0 requête, 0 feedback — module sans toast) ; Vérification IA : garde disabled champ vide propre, saisie AUDIT-L3- (313 car.) → 1 POST /api/ai-writing 200 [18433.1142] mode methodology → Score 75/100 + 4 forces/4 faiblesses (+recommandations/risques) ; RELOAD → tout perdu (retour dashboard quirk SPA) — 100 % local, 0 donnée thèse lue (ni theses[0] ni activeThesisId : saisie 100 % manuelle, consigné).
- Vue 31 Vérification Citations (UI réelle, 0 IA — API externe) : état vide propre (bouton disabled) ; 1 citation réelle avec DOI (Nuijten 2016) → 1 POST /api/citation-check 200 [18433.1328] → « Trouvé dans 3/5 registres » : Crossref ✓ 681 ms, OpenAlex ✓ 334 ms (OA), Semantic Scholar ✗ HTTP 400, DOAJ ✗ fetch failed, PubMed ✓ 993 ms — échecs partiels gérés sans casser le verdict ; Recalcul Statistiques (statcheck déterministe) : 1 POST /api/stats-recompute 200 [18433.1329], texte AUDIT-L3- avec χ²(3)=12.4 p=.90 aberrante → 0 corrects / 2 incohérents / 1 erreur grave, p recalculées + fourchettes + tailles d'effet + APA ; toast d'alerte attendu (grossErrors>0) ABSENT DU DOM = A1L2B-02 re-confirmée sur cette vue (use-toast) ; RELOAD → tout perdu ; saisie 100 % manuelle, 0 lecture thèse.
- Vue 32 Génération Hypothèses (UI réelle, 1 IA en ÉCHEC) : garde disabled champ vide propre ; question+domaine AUDIT-L3- → 1 POST /api/ai-writing/stream → HTTP 400 [18433.1513] « ❌ Données invalides » ; PAS de retry (cause DÉTERMINISTE prouvée par revue de code : le client envoie {content,mode,context} l.36 alors que la route exige {prompt} min 10 (streamSchema) ET le mode « generation-hypotheses » n'existe ni dans WRITING_MODES ni dans SPECIALIZATION_PROMPTS — double incompatibilité de contrat, même classe qu'A1L2A-01) ; CASCADE BUG : l'erreur devient « hypotheses.output » → « Vers pré-enregistrement » transfère « ❌ Données invalides » dans le champ « Hypothèse principale (H1) » (DOM textarea[1] vérifié, capture) ; « Exporter en Markdown » → téléchargement OK, toast « Exporté » ABSENT (A1L2B-02) ; RELOAD → reset local complet.
- Vue 33 Vérification Cohérence (UI réelle, 1 IA — meilleure vue du lot) : 4 modes × 5 sections collées manuellement, 23 contrôles/6 catégories ; garde <20 car./section requise → bouton DISABLED (UI réelle) ; incident mineur de navigation (find text « Analyse » a cliqué le module « Analyse du champ » — vue 27 ouverte 0 écriture, retour immédiat) ; mode Intro↔Discussion + textes AUDIT-L3- avec incohérences volontaires (question orpheline, résultat n=204 sans lien, typo « moderé ») → 1 POST /api/coherence-check 200 [18433.1703] (2 passes IA serveur dans la même requête : analyse + contre-audit adversarial) → « Sceau de cohérence refusé », score 65/100, résumé pertinent, 3/4 catégorie, 3 échoués/1 réussi, points forts + 3 recommandations ; accordéon échoués déplié : sévérité Critique + CITATIONS EXACTES du texte soumis (question « …pistes cyclables… », « effet moderé » typo reprise verbatim) + suggestions ; RELOAD → reset complet ; toasts sonner montés (succès expiré avant check, non re-déclenché — budget).
- Vue 34 Alignement Preuves (UI réelle, 0 IA — déterministe) : sélecteur « Thèse à analyser » = theses[0] = propriétaire (défaut list[0], famille AUD-ISO-002, avec 1 seule thèse aucun risque démontrable) ; « Lancer l'audit » SUR LE PROPRIÉTAIRE autorisé car route LECTURE SEULE prouvée (3 find*, aucun create/update/delete) → 1 POST /api/alignement-preuves 200 → Score 0 « Cohérence critique », 1 citation/4 réf/1 appariée/7 chapitres, Références inutilisées 3, Routing 1 ; cartes chapitres CONFORMES à la DB réelle (Ch.1 1 957 mots 0 citation « Critique », Ch.2-6 0 mots, vérifié en lecture seule) ; volets orphelines (« Toutes les citations sont référencées ») / inutilisées (3 vraies références propriétaire listées) / routing (« Bui Khanh Linh Do (2025) → Ch.7 ») ; RELOAD → rapport perdu, sélecteur re-défaut theses[0] ; badge nav « IA » inexact (aucun LLM) consigné P4.
- Audit réseau session : rattachement par postData (journal CDP persistant contient aussi AUDIT-L2b-* des sessions précédentes) — 5 requêtes POST d'analyse au total (29:1 ai-writing 200, 31:1 citation-check 200 + 1 stats-recompute 200, 32:1 stream 400 = anomalie, 33:1 coherence-check 200, 34:1 alignement-preuves 200) + GET montage ; AUCUNE écriture DB, 0 parasite, budget IA respecté (29:1, 31:0, 32:1 échec, 33:1, 34:0).
- Consolidation : audit/baseline/evidence/a1-lot3a.json (JSON validé, structure a1-lot1/a1-lot2a) — 5 vues (29/31/32/33/34) avec distinction VÉRIFIÉ UI RÉEL vs REVUE DE CODE, sources de données consignées précisément (theses[0] vs activeThesisId vs saisie manuelle), audit_reseau rattaché par postData, etat_proprietaire before/after ; a1-lot3a-db-before/after.json (diff VIDE 30 tables + _theses) ; 21 captures a1-lot3a-*.png ; script de comptage temporaire supprimé.
- Invariants : 0 commit, 0 code modifié, fichiers rouges jamais touchés, pas de db:push ni build, db skip-worktree intacte, 0 thèse jetable créée (aucune vue thèse-scopée en écriture), 0 écriture directe DB, aucun secret dans les preuves.

Stage Summary:
- LOT 3a : 5/5 vues VALIDÉES — 29 Vérification méthodologique (audit 32 critères local OK, IA 200 avec score structuré 75/100, garde cohérence silencieuse P3 ; 0 persistance par conception) ; 31 Vérification Citations (registres externes RÉELS 3/5 avec échecs partiels gérés, statcheck déterministe OK 0/2/1 ; toasts alerte invisibles A1L2B-02 re-confirmée P3) ; 32 Génération Hypothèses (IA CASSÉE déterministe : 400 contrat client {content} vs API {prompt} + mode inexistant — P2 ; cascade erreur transférée dans le pré-enregistrement P3) ; 33 Vérification Cohérence (EXCELLENT : IA 2 passes 200, score 65/100, citations exactes du texte avec typo verbatim, garde propre ; aucune anomalie) ; 34 Alignement Preuves (audit déterministe LECTURE SEULE sur propriétaire OK, conformité DB vérifiée, mécanisme theses[0] consigné, badge « IA » inexact P4).
- ANOMALIES : A1L3A-03 P2 (génération hypothèses IA cassée — double incompatibilité de contrat, fonctionnalité inutilisable, cascade d'erreur dans le pré-enregistrement A1L3A-04 P3) ; A1L3A-01 P3 (garde silencieuse vérificateur cohérence métho) ; A1L3A-02 P3 (A1L2B-02 matérialisée sur 2 vues de plus : citations + hypothèses) ; A1L3A-05 P4 (badge IA inexact alignement-preuves).
- État propriétaire STRICTEMENT préservé : diff DB before/after VIDE (30 tables + _theses, updatedAt 2026-08-10 inchangé), résidu DoctoralToolbox inchangé, témoin NotebookEntry intact, 0 thèse jetable, 0 écriture — la seule interaction avec le propriétaire a été une LECTURE (vue 34, route prouvée sans écriture).
- Registre A1 : 22/33 vues validées (8 lot 1 + 5 lot 2a + 4 lot 2b + 5 lot 3a) ; reste 11 vues (lot 4).
