#!/bin/bash
# c2-r5-seance.sh — Séance de tests T1-T7 (audit C2, phase R5)
RAPP=~/Desktop/c2-r2/c2-r5-rapport-T1-T7.txt
ENVF=~/.r5-install-dir
log() { echo "$@" | tee -a "$RAPP"; }
LOCAPP=$(cygpath "$LOCALAPPDATA" 2>/dev/null || echo "$LOCALAPPDATA")
DIR() { cat "$ENVF"; }
JLOG() { echo "$(DIR)/server.log"; }
find_install() {
  for d in "$LOCAPP/Ma Thèse" "$LOCAPP/Programs/Ma Thèse" "/c/Program Files/Ma Thèse" "/c/Program Files (x86)/Ma Thèse"; do
    [ -x "$d/mathese.exe" ] && { echo "$d"; return 0; }
  done
  local hit; hit=$(ls -d "$LOCAPP"/*/mathese.exe "$LOCAPP/Programs"/*/mathese.exe "/c/Program Files"/*/mathese.exe 2>/dev/null | head -1)
  [ -n "$hit" ] && { dirname "$hit"; return 0; }
  return 1
}
cmd_loc() {
  local d
  if d=$(find_install); then
    echo "$d" > "$ENVF"
    log "--- loc $(date '+%F %T') ---"
    log "[loc] Installation : $d"
    log "[loc] server.log présent : $([ -f "$d/server.log" ] && echo oui || echo NON) ; taille : $(wc -c < "$d/server.log" 2>/dev/null || echo 0) octets"
  else
    echo "INSTALLATION INTROUVABLE"; exit 1
  fi
}
precheck() {
  if tasklist | grep -qi "mathese.exe"; then echo "REFUS: l'application tourne encore — ferme-la d'abord."; exit 1; fi
}
cmd_prep1() {
  precheck
  log "--- prep1 $(date '+%F %T') ---"
  echo ">>> TEST-R5-T1 marqueur continuité $(date '+%F %T')" >> "$(JLOG)"
  log "[prep1] marqueur T1 ajouté ; journal : $(wc -c < "$(JLOG)") octets / $(wc -l < "$(JLOG)") lignes"
}
cmd_verif1() {
  log "--- verif1 (T1,T2,T3,T4) $(date '+%F %T') ---"
  local jl; jl=$(JLOG)
  local lm ln; lm=$(grep -n "TEST-R5-T1" "$jl" | head -1 | cut -d: -f1); ln=$(grep -n "v1.10.11 démarrage" "$jl" | head -1 | cut -d: -f1)
  if [ -n "$lm" ] && [ -n "$ln" ] && [ "$lm" -lt "$ln" ]; then
    log "PASS T1 : append confirmé (marqueur ligne $lm < section 1.10.11 ligne $ln — pas d'écrasement)"
  else log "FAIL T1 : marqueur/ordre incohérent (lm=$lm ln=$ln)"; fi
  local n; n=$(grep -cE '^\[[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\]' "$jl")
  [ "$n" -gt 0 ] && log "PASS T2 : $n lignes horodatées" || log "FAIL T2 : aucune ligne horodatée"
  grep -q "premier lancement ~1 à 2 min" "$jl" && log "PASS T4 : message « ~1 à 2 min » présent" || log "FAIL T4 : message absent"
  if grep -q "C2-R5: fermeture de l'application" "$jl" && grep -qE "C2-R5: serveur node.exe \(pid=[0-9]+\) arrêté" "$jl"; then
    log "PASS T3 : arrêt journalisé :"; grep -E "C2-R5:" "$jl" | tail -3 | sed 's/^/    /'
  else log "FAIL T3 : lignes d'arrêt C2-R5 absentes (app fermée ?)"; fi
  local nl
  nl=$(powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | ForEach-Object { \$_.CommandLine }" 2>/dev/null | grep -ci "server\.js")
  [ "${nl:-0}" -eq 0 ] && log "PASS T3b : zéro node.exe résiduel (server.js)" || log "FAIL T3b : $nl node.exe résiduel(aux) — commandlines ci-dessus"
}
cmd_prep2() {
  precheck
  log "--- prep2 $(date '+%F %T') ---"
  dd if=/dev/zero bs=1M count=6 2>/dev/null | tr '\0' 'x' >> "$(JLOG)"
  log "[prep2] journal porté à $(wc -c < "$(JLOG)") octets"
}
cmd_verif2() {
  log "--- verif2 (T5,T7) $(date '+%F %T') ---"
  local jl; jl=$(DIR)/server.log
  local arch; arch=$(ls "$jl".* 2>/dev/null | wc -l)
  if [ "$arch" -ge 1 ]; then
    log "PASS T5 : rotation — $arch archive(s) ; contenues :"
    ls -l "$jl".* | sed 's/^/    /'
  else log "FAIL T5 : aucune archive"; fi
  if grep -q "déjà extrait, skip" "$jl"; then
    log "PASS T7 : réutilisation :"; grep "déjà extrait, skip" "$jl" | tail -1 | sed 's/^/    /'
  else log "FAIL T7 : pas de « déjà extrait, skip »"; fi
  grep -E "v1\.10\.11 \(zip" "$jl" | tail -1 | sed 's/^/    [marqueur zip] /'
}
cmd_prep3() {
  precheck
  log "--- prep3 $(date '+%F %T') ---"
  local i jl; jl=$(JLOG)
  for i in 1 2 3 4 5 6 7 8 9 10 11 12; do echo "archive factice T6 #$i" > "$jl.20240101-0000$i"; done
  dd if=/dev/zero bs=1M count=6 2>/dev/null | tr '\0' 'x' >> "$jl"
  log "[prep3] 12 archives 2024 créées ; journal regrossi à $(wc -c < "$jl") octets"
}
cmd_verif3() {
  log "--- verif3 (T6) $(date '+%F %T') ---"
  local jl; jl=$(DIR)/server.log
  local arch; arch=$(ls "$jl".* 2>/dev/null | wc -l)
  if [ "$arch" -eq 10 ] && [ ! -f "$jl.20240101-000001" ] && [ ! -f "$jl.20240101-000003" ] && [ -f "$jl.20240101-000004" ]; then
    log "PASS T6 : rétention 10 — les 3 archives 2024 les plus anciennes purgées (#1..#3 absentes, #4 présente)"
  else log "FAIL T6 : $arch archives (attendu 10) — état :"; ls "$jl".* | head -4 | sed 's/^/    /'; fi
}
case "${1:-}" in
  loc) cmd_loc ;; prep1) cmd_prep1 ;; verif1) cmd_verif1 ;;
  prep2) cmd_prep2 ;; verif2) cmd_verif2 ;; prep3) cmd_prep3 ;; verif3) cmd_verif3 ;;
  *) echo "usage: $0 loc|prep1|verif1|prep2|verif2|prep3|verif3" ;;
esac
