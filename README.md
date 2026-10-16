# C2 — Paquet de correctifs `fix/c2-ecarts` (branche temporaire)

> ⚠️ Cette branche contient **uniquement les fichiers de correctifs (diffs)**.
> Le candidat audité **13810b7** (v1.10.9) n'est **PAS** inclus — aucun commit parent.
> Branche à **supprimer** après téléchargement des fichiers.

## Fichiers

| Fichier | Taille | sha256 |
|---|---|---|
| `fix-c2-ecarts.patchs.mbox` | 49 259 o | `c9fdcfb1d78cfc7596d9dee2a9e23999d56da91e2712953f7a45e9f474bc95dc` |
| `fix-c2-ecarts.patchs.mbox.gz.b64` (secours) | 15 822 o | `aef217e83d9ba14bebd2b6da72b0a894bfd089ed50e6955a1f249c52025b2ab3` |
| `fix-c2-ecarts.bundle` (alternative au mbox) | 65 724 o | `c5680fca01fe645ab5e38c273c7f2b0d668eae638ec1590ae440789f4100458a` |
| `SHA256SUMS` | 219 o | `0ba7e3ada049bd89356fc6af9a8f2718fe9c9d1e633d03865440f8c0265af45f` |
| `SHA256SUMS-PATCHS` | 782 o | `c2f35aee0107261e014cd556144293677b7837431552b1f9d8cea0d40ad61196` |
| `README-TRANSFERT.md` | consignes détaillées | — |

Contenu des correctifs : **O1** (arrêt propre du serveur node à la fermeture + purge orphelin au boot), **E2** (erreurs DB explicites côté serveur, toutes visibles côté client), **E3** (migration de schéma SQLite non destructive à la mise à jour) + 2 commits de style.

## Sur Windows (Git Bash)

1. Télécharger les fichiers ci-dessus depuis cette page (bouton de téléchargement sur chaque fichier, ou lien « Raw »).
2. Vérifier le mbox :
   ```bash
   sha256sum fix-c2-ecarts.patchs.mbox
   # attendu : c9fdcfb1d78cfc7596d9dee2a9e23999d56da91e2712953f7a45e9f474bc95dc
   ```
3. Dans le clone `c2-r2` (arrêté sur **13810b7**, arbre propre) :
   ```bash
   cd ~/c2-r2    # ou ~/Desktop/c2-r2
   git status                  # rien de pendu
   git rev-parse --short HEAD  # 13810b7
   git switch -c fix/c2-ecarts 13810b7
   git -c user.name="vous" -c user.email="vous@local" am -3 /c/Users/<vous>/Downloads/fix-c2-ecarts.patchs.mbox
   # attendu : 5/5 patches appliqués sans conflit
   ```
4. **Vérification décisive** (seule l'égalité d'ARBRE fait foi — les SHA de commits diffèrent, c'est normal) :
   ```bash
   git rev-parse 'HEAD^{tree}'
   # attendu : 336e6eda0f43a6aa915f9fd520d796558aa35949
   ```
5. **Build R3** :
   ```bash
   bun install
   bun run tauri build
   # installeur : src-tauri/target/release/bundle/nsis/
   ```
6. Installer par-dessus l'ancienne version, puis contrôles :
   - **c2-R1** : fermer l'app → 0 `node.exe` résiduel au Gestionnaire des tâches ; kill brutal → relance OK (purge orphelin).
   - **c2-R2** : créer une donnée → fermer → relancer → donnée toujours là ; erreurs DB lisibles dans l'interface si incident.
   - **c2-R3** : mise à jour par-dessus l'ancienne version → données préservées (migration non destructive).

**Ne pas pousser `fix/c2-ecarts` vers GitHub** tant que le verdict C2 n'est pas levé — la publication de la v1.10.9 sur Ma-These se fera après validation, selon votre protocole push-release.
