# Procédure C2 — Build desktop Windows Tauri + smoke test CSP (propriétaire) + gabarit

**À exécuter par le propriétaire sur une machine Windows disposant de l'environnement de compilation (Rust + WebView2).** L'installeur ne sera distribué qu'après réussite complète. Résultats à rapporter **séparément** du web.

## 1. Préparation

1. Commit destiné à la distribution (fourni au moment voulu) ; environnement : Windows 10/11, Rust stable, Node/Bun, WebView2 Runtime.
2. Vérifier la configuration durcie attendue (cycle C-4, commit `93d8d08`) :
   - `src-tauri/capabilities/*.json` : **`core:default` seul** — aucune permission `shell:allow-open` / `shell:allow-execute`.
   - `src-tauri/tauri.conf.json` : CSP explicite (default-src 'self' ; script-src 'self' 'unsafe-inline' ; object-src 'none' ; frame-ancestors 'none').

## 2. Build + installeur

```bash
bun install
bun run tauri build        # ou : cd src-tauri && cargo tauri build
```
- ✅ Attendu : compilation Rust OK ; génération de l'installeur (`*.msi` / `*-setup.exe` sous `src-tauri/target/release/bundle/`).
- Archiver les versions (Tauri, Rust, Node/Bun) et les sorties complètes.

## 3. Installation + smoke test (environnement de test)

1. Installer l'application depuis l'installeur ; la lancer.
2. Vérifier le **serveur Next standalone** : démarrage correct (fenêtre visible), aucune erreur au démarrage ; navigation initiale.
3. **Parcours critiques** (même checklist que C1 §4 : rédaction, création/changement de thèse, références + confirmation, IA stream, RAG cité, thèses en ligne, export DOCX, persistance F5).
4. **Vérification explicite CSP/capabilities** :
   - Aucune fonctionnalité attendue bloquée par la CSP (images/polices locales OK, scripts inline Next OK).
   - Console devtools : aucune violation CSP inattendue (les violations éventuelles sont notées et qualifiées).
   - **Aucune permission shell réintroduite** : coller le contenu des capabilities de l'installeur/depuis le dépôt et comparer à la liste attendue (`core:default` seul).
5. Comportement à l'arrêt : fermeture propre, arrêt du serveur Next embarqué (pas de processus orphelin `node`/`next-server` visible dans le gestionnaire des tâches après fermeture).
6. Journaux/erreurs au démarrage et à l'arrêt : noter tout événement.

## 4. Gabarit de preuve (à archiver dans `audit/baseline/evidence/c2-build-windows.json` + captures)

```json
{
  "commit_teste": "<hash>",
  "date": "<date>",
  "versions": {"tauri": "…", "rust": "…", "node_ou_bun": "…", "windows": "…"},
  "build": {"commande": "…", "installeur": "chemin + taille", "resultat": "OK/échec"},
  "installation": "OK/échec",
  "smoke_test": {"démarrage": "…", "parcours_critiques": [{"n": 1, "resultat": "…"}],
                 "csp": {"violations": "aucune / liste qualifiée"},
                 "capabilities_actuelles": ["core:default"],
                 "permissions_shell": "aucune"},
  "arret": "fermeture propre, aucun processus orphelin",
  "captures": ["c2-*.png"],
  "conclusion": "DESKTOP_WINDOWS_VALIDE / PROBLEMES: …"
}
```

**Règles** : aucune donnée sensible dans les preuves ; objets de test préfixés `AUDIT-C2-` et nettoyés ; tout écart CSP/capabilities est signalé immédiatement au développeur (signalement point 10 des instructions).
