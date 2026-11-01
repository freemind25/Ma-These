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
; The uninstaller has the same lock problem, hence PREUNINSTALL.
;
; Implementation note: the PowerShell helper is WRITTEN AT RUNTIME with
; FileWrite instead of being extracted with File - tauri-bundler copies
; only this .nsh into its nsis workdir, so ${__FILEDIR__} points to a
; directory where companion files do not exist (CI failure of 1.10.19
; attempt 1: File "...update-helper.ps1" -> no files found). Keeping the
; helper inline makes the hook self-contained. NSIS escaping: $$ emits a
; literal $ (PowerShell variables), $\r$\n emits CRLF. ASCII-only.
; ================================================================

Var MatheseHelperResult
Var MatheseFh

!macro _MatheseWriteHelper
  FileOpen $MatheseFh "$PLUGINSDIR\mathese-update-helper.ps1" w
  FileWrite $MatheseFh "param([string]$$InstallDir,[string]$$ExcludeName='mathese.exe')$\r$\n"
  FileWrite $MatheseFh "$$ErrorActionPreference='SilentlyContinue'$\r$\n"
  FileWrite $MatheseFh "$$prefix=$$InstallDir.TrimEnd('\')+'\'$\r$\n"
  FileWrite $MatheseFh "$$exclude=$$ExcludeName.ToLowerInvariant()$\r$\n"
  FileWrite $MatheseFh "$$found=$$false$\r$\n"
  FileWrite $MatheseFh "Get-CimInstance Win32_Process | ForEach-Object {$\r$\n"
  FileWrite $MatheseFh "$$exePath=$$_.ExecutablePath$\r$\n"
  FileWrite $MatheseFh "if ($$exePath) {$\r$\n"
  FileWrite $MatheseFh "$$name=[System.IO.Path]::GetFileName($$exePath).ToLowerInvariant()$\r$\n"
  FileWrite $MatheseFh "if ($$exePath.StartsWith($$prefix,[System.StringComparison]::OrdinalIgnoreCase) -and $$name -ne $$exclude) {$\r$\n"
  FileWrite $MatheseFh "$$found=$$true$\r$\n"
  FileWrite $MatheseFh "Stop-Process -Id $$_.ProcessId -Force$\r$\n"
  FileWrite $MatheseFh "}$\r$\n"
  FileWrite $MatheseFh "}$\r$\n"
  FileWrite $MatheseFh "}$\r$\n"
  FileWrite $MatheseFh "if ($$found) { Start-Sleep -Milliseconds 800 }$\r$\n"
  FileWrite $MatheseFh "exit 0$\r$\n"
  FileClose $MatheseFh
!macroend

!macro _MatheseKillServerOrphans
  InitPluginsDir
  !insertmacro _MatheseWriteHelper
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
