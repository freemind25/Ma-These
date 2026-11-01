; ================================================================
; installer-hooks.nsh - Ma These NSIS installer hooks (FIX-UPD-1)
; ================================================================
; Root cause fixed here: the Tauri updater plugin spawns this installer
; then closes the app with std::process::exit(0), which BYPASSES the
; graceful shutdown handler (RunEvent::Exit) that stops the embedded
; Next.js server. node.exe survives as an orphan and keeps a write lock
; on <install>\node.exe -> "Error opening file for writing" while the
; installer overwrites that file (observed on 1.10.17 -> 1.10.18).
;
; This hook kills every process whose executable lives in $INSTDIR,
; EXCEPT the main binary (${MAINBINARYNAME}.exe): the NSIS template
; already handles it right after this hook (CheckIfAppIsRunning:
; MessageBox in interactive mode, silent kill in passive/silent mode).
; Covers both in-app self-updates launched from versions WITHOUT the
; Rust-side fix (stop_server_for_update) and manual setup.exe runs.
;
; The uninstaller has the same lock problem (files must be removable),
; hence the PREUNINSTALL hook.
; ================================================================

Var MatheseHelperResult

!macro _MatheseKillServerOrphans
  InitPluginsDir
  File "/oname=$PLUGINSDIR\mathese-update-helper.ps1" "${__FILEDIR__}\update-helper.ps1"
  ; Two passes: catch any process that appeared between the two scans.
  nsExec::Exec `powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$PLUGINSDIR\mathese-update-helper.ps1" -InstallDir "$INSTDIR" -ExcludeName "${MAINBINARYNAME}.exe"`
  Pop $MatheseHelperResult
  Sleep 500
  nsExec::Exec `powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$PLUGINSDIR\mathese-update-helper.ps1" -InstallDir "$INSTDIR" -ExcludeName "${MAINBINARYNAME}.exe"`
  Pop $MatheseHelperResult
!macroend

!macro NSIS_HOOK_PREINSTALL
  ; Kill orphaned embedded-server processes BEFORE the template's
  ; CheckIfAppIsRunning and BEFORE any File copy (node.exe write lock).
  !insertmacro _MatheseKillServerOrphans
!macroend

!macro NSIS_HOOK_PREUNINSTALL
  ; Same lock problem on uninstall: kill orphans before file removal.
  !insertmacro _MatheseKillServerOrphans
!macroend
