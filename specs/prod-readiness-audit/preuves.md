# Preuves — prod-readiness-audit

Méthode : chaque point = commande réelle exécutée, sortie collée, horodatée (fuseau sandbox Etc/GMT-1). Toute preuve impossible en sandbox est une **réserve nommée** (MD-1), jamais simulée.

## Groupe A — Build & CI (2026-09-18, ~12:30-12:45)

### T1 + T1b — `bun run build` : ÉCHEC initial, puis SUCCÈS après corrections minimales

**1re exécution — ÉCHEC (exit 1)** — découverte majeure de l'audit : deux erreurs TypeScript bloquent le build de HEAD `2a8a4e3` (la suite vitest ne typechecke pas, le serveur de dev non plus) :

```
bun run build > /tmp/p1-build.log 2>&1 ; echo "EXIT=$?"     → EXIT=1
✓ Compiled successfully in 25.4s
  Running TypeScript ...
Failed to compile.

./src/lib/veille/run-check.ts:290:5
Type error: Type 'Date | null' is not assignable to type 'Date'.
    > 290 |     checkedAt: updated.lastCheckedAt,

./src/modules/veille-academique/veille-academique-page.tsx:275:41   (2e exécution, 1er point corrigé)
Type error: Type '(id: string) => Promise<boolean>' is not assignable
to type '() => Promise<boolean>'.
```

**T1b — corrections minimales** (annoncées conformément au mandat : « les corrections nécessaires deviennent des tâches dans les groupes correspondants »), commit `e17e233` :
- `src/lib/veille/run-check.ts` l.277-293 : l'horodatage `new Date()` est capturé une fois (`const checkedAt`), écrit et retourné — mêmes valeurs exactes, suppression de l'accès nullable `updated.lastCheckedAt` (introduit au cycle `veille-check-auto` T2).
- `src/modules/veille-academique/veille-academique-page.tsx` l.275 : `onCheck={() => runCheck(selected.id)}` — aligné sur le pattern existant l.308 (`VeilleDetail` attend `() => Promise<boolean>`, cf. l.471) ; régression introduite au cycle `veille-academique` (vue détail).

**3e exécution — SUCCÈS (exit 0)** :

```
bun run build > /tmp/p1-build3.log 2>&1 ; echo "EXIT=$?"    → EXIT=0
▲ Next.js 16.1.3 (Turbopack)
✓ Compiled successfully in 26.4s
  Running TypeScript ...
   [routes listées : ƒ /api/… complet, ƒ Proxy (Middleware)]
○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

**Warnings consignés (MD-3)** — 0 warning bloquant, 2 notes :
1. `⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.` — non bloquant ; le renommage `src/middleware.ts` → `proxy.ts` est une correction **hors périmètre** (transverse) → **recommandation** au rapport final.
2. `Experiments (use with caution): serverActions` — configuration volontaire (`next.config.ts`), consignée.

Effet secondaire documenté : le build écrase `.next/` utilisé par le serveur de dev (page `/` en 000) → redémarrage selon la procédure `docs/EXPLOITATION-SERVEUR.md` (kill + relance), santé prouvée : `curl /` → 200, `curl /api/stats` → 200.

### T2 — Propreté git : ✓ CONFORME

```
git status --short (après commit T1b)      → (vide)
git ls-files -s | rg '^100755' | rg -v '\.zscripts' → (vide)  NB755-hors-zscripts: 0
git show --stat 0348dcb | tail -1          → 419 files changed, 114 insertions(+)
git branch --show-current                  → main
```

Le mandat mentionnait « chmod 410 fichiers » ; le chiffre réel prouvé est **419** (MD-6). Aucun mode 755 hors `.zscripts/*.sh` — la normalisation est bien committée.

### T3 — CI / build Tauri Windows : ✓ RÉSERVE NOMMÉE (preuve impossible ici, MD-1)

```
ls -d .github                    → ls: cannot access '.github': No such file or directory
git remote -v                    → (sortie vide — aucun remote configuré)
rg -n 'build-desktop' scripts/build-tauri-prep.sh
  → 3:# Utilisé par .github/workflows/build-desktop.yml (tauri-action beforeBuildCommand)
which cargo rustc                 → (sortie vide — toolchain Rust absente)
git branch --show-current         → main
```

**Réserve P2** — le point du mandat (« le pipeline GitHub Actions passe de bout en bout, .exe généré et lancé au moins une fois ») est **impossible à prouver depuis ce sandbox** : aucun workflow versionné, aucun remote git, toolchain Rust/Windows absente (même `cargo check` impossible). Preuve manquante exacte : un run CI vert du workflow `build-desktop.yml` (URL du run GitHub) **ou** un build NSIS sur machine Windows avec lancement de l'exe. **Questions au propriétaire (recette)** : (1) le workflow `build-desktop.yml` existe-t-il dans un dépôt distant (le script de préparation le référence) ? (2) si oui, une URL de run vert peut-elle être fournie comme preuve ? (3) si non, sa création est une correction candidate **hors périmètre** de ce cycle (nouvelle annonce requise).

Constat associé (hygiène, sans modification) : binaires versionnés dans git — `upload/LR.rar`, `upload/res.pdf`, `db/custom.db`, `db/urbanisme-test.db`.

### Dépendances du groupe A vérifiées

- Commit T1b : `e17e233` — 2 fichiers, +7/−4.
- Lignes rouges : `theses-en-ligne/search/route.ts`, `arxiv/search/route.ts`, `app-sidebar.tsx` — non touchés (le diff du commit le prouve).
