# FIX-UPD-1 - Ma These NSIS installer helper (called by installer-hooks.nsh).
#
# Kills every process whose executable lives inside $InstallDir, EXCEPT the
# app main binary ($ExcludeName): the NSIS template handles the main binary
# itself (CheckIfAppIsRunning - MessageBox in interactive mode, silent kill
# in passive/silent mode).
#
# Why this exists: the Tauri updater plugin closes the app with
# std::process::exit(0) right after spawning the installer, which bypasses
# the app's graceful shutdown (RunEvent::Exit). The embedded Next.js server
# (node.exe) then survives as an orphan and keeps a write lock on
# <install>\node.exe, making the installer's file copy step fail with
# "Error opening file for writing".
#
# ASCII-only on purpose: NSIS extracts this file at compile time and
# PowerShell 5.1 expects UTF-8 with BOM (or ANSI) for non-ASCII content.

param(
    [Parameter(Mandatory = $true)][string]$InstallDir,
    [string]$ExcludeName = 'mathese.exe'
)

$ErrorActionPreference = 'SilentlyContinue'

$prefix = $InstallDir.TrimEnd('\') + '\'
$exclude = $ExcludeName.ToLowerInvariant()
$found = $false

Get-CimInstance Win32_Process | ForEach-Object {
    $exePath = $_.ExecutablePath
    if ($exePath) {
        $name = [System.IO.Path]::GetFileName($exePath).ToLowerInvariant()
        if ($exePath.StartsWith($prefix, [System.StringComparison]::OrdinalIgnoreCase) -and $name -ne $exclude) {
            $found = $true
            Stop-Process -Id $_.ProcessId -Force
        }
    }
}

if ($found) { Start-Sleep -Milliseconds 800 }

exit 0
