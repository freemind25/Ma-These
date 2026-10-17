#!/usr/bin/env bash
# =====================================================================
# c2-r2-precontroles-v2.sh — Précontrôles formels avant build C2 (v2)
# Régularisation A1 (demande du conseiller) — sortie littérale datée.
# Exécution : bash c2-r2-precontroles-v2.sh   (à la racine du dépôt)
# =====================================================================
set -u
PASS=0; FAIL=0
ok()   { echo "PASS  $1"; PASS=$((PASS+1)); }
ko()   { echo "FAIL  $1"; FAIL=$((FAIL+1)); }
info() { echo "INFO  $1"; }

echo "==============================================================="
echo " C2-R4 — précontrôles v2 — $(date '+%Y-%m-%d %H:%M:%S %z')"
echo "==============================================================="

# P0 — dépôt git
if git rev-parse --show-toplevel >/dev/null 2>&1; then
  ok "P0 dépôt git : $(git rev-parse --show-toplevel)"
else
  ko "P0 racine de dépôt introuvable — lancer à la racine du dépôt"
  echo "VERDICT: ECHEC (PASS=$PASS FAIL=$FAIL)"
  exit 1
fi

# P1 — branche attendue
BR="$(git rev-parse --abbrev-ref HEAD)"
if [ "$BR" = "fix/c2-ecarts" ]; then ok "P1 branche : $BR"; else ko "P1 branche inattendue : $BR"; fi

# P2 — fichiers suivis non modifiés
if [ -z "$(git status --porcelain --untracked-files=no)" ]; then
  ok "P2 aucun fichier suivi modifié"
else
  ko "P2 fichiers suivis modifiés détectés :"
  git status --porcelain --untracked-files=no | sed 's/^/      /'
fi

# P3 — tag candidat intact (non déplacé, non réécrit)
TAGC="$(git rev-list -1 candidat-app-audit-v1.2-R2 2>/dev/null || true)"
case "$TAGC" in
  13810b7*) ok "P3 tag candidat-app-audit-v1.2-R2 intact -> $TAGC" ;;
  "")       ko "P3 tag candidat-app-audit-v1.2-R2 introuvable" ;;
  *)        ko "P3 tag candidat déplacé/modifié : $TAGC" ;;
esac

# P4 — identité de l'arbre (enregistrée comme preuve de build)
TREE="$(git rev-parse HEAD^{tree})"
HEADS="$(git rev-parse HEAD)"
info "P4 HEAD        = $HEADS"
info "P4 HEAD^{tree} = $TREE"

# P5 — les 5 correctifs C2-R2 présents dans l'histoire
for c in 5ae5afd 0a28617 4afe744 3bc19e9 ffcc954; do
  if git merge-base --is-ancestor "$c" HEAD 2>/dev/null; then
    ok "P5 correctif $c présent (ancêtre de HEAD)"
  else
    ko "P5 correctif $c ABSENT de l'histoire"
  fi
done

# P6 — correctifs C2-R4 (A2/A3) présents dans le code du lanceur
if grep -q "fn migrate_legacy_backups" src-tauri/src/lib.rs; then ok "P6 A3 migration sauvegardes présente (migrate_legacy_backups)"; else ko "P6 A3 migrate_legacy_backups absente"; fi
if grep -q "TF_BACKUP_DIR" src-tauri/src/lib.rs; then ok "P6 A3 redirection TF_BACKUP_DIR présente"; else ko "P6 A3 TF_BACKUP_DIR absent"; fi
if grep -q "split_once" src-tauri/src/lib.rs; then ok "P6 A2 marqueur version+taille présent (split_once)"; else ko "P6 A2 split_once absent"; fi

# P7 — cohérence des versions (bump par build correctif)
VT="$(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' src-tauri/tauri.conf.json | head -1)"
VC="$(sed -n 's/^version = *"\([^"]*\)".*/\1/p' src-tauri/Cargo.toml | head -1)"
VP="$(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' package.json | head -1)"
if [ -n "$VT" ] && [ "$VT" = "$VC" ] && [ "$VC" = "$VP" ]; then
  ok "P7 versions cohérentes : $VT (conf=cargo=pkg)"
else
  ko "P7 versions divergentes : conf=$VT cargo=$VC pkg=$VP"
fi

# P8 — reflog récent (traçabilité, enregistrement)
info "P8 reflog (5 derniers) :"
git reflog -5 | sed 's/^/      /'

# P9 — inventaire des non-suivis (hors arbre commité)
UNTR="$(git status --porcelain | grep '^??' || true)"
if [ -n "$UNTR" ]; then info "P9 non-suivis (hors arbre commité) :"; echo "$UNTR" | sed 's/^/      /'; else info "P9 aucun non-suivi"; fi

echo "==============================================================="
if [ "$FAIL" -eq 0 ]; then
  echo "VERDICT: SUCCES (PASS=$PASS FAIL=$FAIL)"
  exit 0
else
  echo "VERDICT: ECHEC (PASS=$PASS FAIL=$FAIL)"
  exit 1
fi
