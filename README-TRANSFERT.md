# Paquet fix-c2-ecarts — correctifs C2 (O1 + E2 + E3)

Base exigée : commit audité 13810b7 (présent dans votre clone Windows c2-r2).

## Contenu
- fix-c2-ecarts.bundle — git bundle (branche fix/c2-ecarts = main du sandbox)
- SHA256SUMS — empreintes de contrôle

## Commits transportés (au-dessus de 13810b7)
- 58c0866 fix(c2-O1): arrêt propre du serveur node à la fermeture + purge orphelin au boot
- d35dc0a fix(c2-E2): erreurs DB explicites côté serveur + toasts visibles côté client
- d689b75 fix(c2-E3): migration de schéma SQLite à la mise à jour (non destructive)
- (+ commits de style console.warn et commits de bookkeeping sandbox inoffensifs)

## Application sur Windows (dans le clone c2-r2, arrêté sur 13810b7)
  git bundle verify "C:\chemin\fix-c2-ecarts.bundle"
  git fetch "C:\chemin\fix-c2-ecarts.bundle" fix/c2-ecarts:fix/c2-ecarts
  git checkout fix/c2-ecarts
  (vérifier: git log --oneline -6 → les commits fix(c2-O1/E2/E3) visibles)

Puis build R3 (toolchain déjà prête): cd ~ && cd c2-r2(ou Desktop/c2-r2) · bun install · bun run tauri build
→ installeur NSIS dans src-tauri/target/release/bundle/nsis/
