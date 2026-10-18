use std::io::Write;
use tauri::Manager;

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

/// Windows: hide console window for child processes
#[cfg(target_os = "windows")]
const CREATE_NO_WINDOW: u32 = 0x08000000;

const SERVER_PORT: u16 = 14325;
const SERVER_STARTUP_TIMEOUT_SECS: u64 = 60;

// --- C2-R5 : journal persistant, horodaté, avec rotation ---
const LOG_ROTATE_MAX_BYTES: u64 = 5 * 1024 * 1024; // 5 Mo
const LOG_KEEP_ARCHIVES: usize = 10;
const SERVER_STOP_TIMEOUT_SECS: u64 = 10;

/// C2-R5 (A1) : horodatage local [AAAA-MM-JJ HH:MM:SS] pour le journal.
fn ts_now() -> String {
    chrono::Local::now().format("[%Y-%m-%d %H:%M:%S]").to_string()
}

fn wait_for_server(port: u16, timeout_secs: u64) -> bool {
    let addr = format!("127.0.0.1:{}", port);
    let start = std::time::Instant::now();
    while start.elapsed().as_secs() < timeout_secs {
        if std::net::TcpStream::connect(&addr).is_ok() {
            std::thread::sleep(std::time::Duration::from_secs(2));
            return true;
        }
        std::thread::sleep(std::time::Duration::from_millis(500));
    }
    false
}

macro_rules! diag {
    ($log_file:expr, $($arg:tt)*) => {{
        let msg = format!($($arg)*);
        eprintln!("[Ma Thèse] {}", msg);
        if let Some(ref mut f) = $log_file {
            let _ = writeln!(f, "{} {}", ts_now(), msg);
            let _ = f.flush();
        }
    }};
}

/// Strip le préfixe Windows extended-length path \\?\ \/
fn strip_extended_length_prefix(p: &std::path::Path) -> std::path::PathBuf {
    let s = p.to_string_lossy();
    let cleaned = s
        .strip_prefix("\\\\?\\")
        .or_else(|| s.strip_prefix(r"//?/"))
        .unwrap_or(&s);
    std::path::PathBuf::from(cleaned)
}

/// C2-A2 : taille du zip serveur (octets). Combinée à la version dans le
/// marqueur .app-version, elle déclenche la ré-extraction même à version
/// identique si le code serveur embarqué a changé (mise à jour à version
/// égale — écart C2-A2).
fn server_zip_size(zip_path: &std::path::Path) -> Result<u64, String> {
    std::fs::metadata(zip_path)
        .map(|m| m.len())
        .map_err(|e| format!("lecture de standalone.zip impossible: {}", e))
}

/// C2-A3 : migrer les sauvegardes du schéma historique (standalone/backups,
/// détruit à chaque ré-extraction) vers <install>/backups, hors de la zone
/// ré-extractable. Idempotent : un fichier déjà migré n'est pas écrasé (le
/// doublon legacy est supprimé, la copie cible est conservée). La présence
/// de fichiers non migrés bloque l'extraction (jamais destructif).
fn migrate_legacy_backups(
    resource_dir: &std::path::Path,
    log_file: &mut Option<std::fs::File>,
) {
    let legacy_dir = resource_dir.join("standalone").join("backups");
    let target_dir = resource_dir.join("backups");
    if !legacy_dir.is_dir() {
        return;
    }
    diag!(log_file, "C2-A3: migration de {:?} vers {:?}", legacy_dir, target_dir);
    if let Err(e) = std::fs::create_dir_all(&target_dir) {
        diag!(log_file, "C2-A3: création de {:?} impossible: {}", target_dir, e);
        return;
    }
    let mut moved = 0usize;
    let mut kept = 0usize;
    let mut failed = 0usize;
    if let Ok(entries) = std::fs::read_dir(&legacy_dir) {
        for entry in entries.flatten() {
            let from = entry.path();
            let name = match from.file_name() {
                Some(n) => n.to_os_string(),
                None => continue,
            };
            let to = target_dir.join(&name);
            if to.exists() {
                // Déjà migré : supprimer le doublon legacy (la copie cible
                // est conservée).
                if std::fs::remove_file(&from).is_ok() {
                    kept += 1;
                } else {
                    failed += 1;
                    diag!(log_file, "C2-A3: doublon legacy non supprimable: {:?}", from);
                }
                continue;
            }
            // Même volume : rename suffit ; repli copie + suppression.
            let ok = std::fs::rename(&from, &to).is_ok()
                || (std::fs::copy(&from, &to).is_ok() && std::fs::remove_file(&from).is_ok());
            if ok {
                moved += 1;
            } else {
                failed += 1;
                diag!(log_file, "C2-A3: migration impossible: {:?}", from);
            }
        }
    }
    if failed == 0 {
        if let Err(e) = std::fs::remove_dir(&legacy_dir) {
            diag!(log_file, "C2-A3: répertoire legacy non supprimé: {}", e);
        }
    }
    diag!(
        log_file,
        "C2-A3: migration sauvegardes terminée ({} déplacés, {} déjà présents, {} échecs)",
        moved,
        kept,
        failed
    );
}

/// Extraire standalone.zip avec PowerShell.
/// Vérifie la version pour forcer la ré-extraction lors d'une mise à jour.
fn extract_standalone(
    resource_dir: &std::path::Path,
    log_file: &mut Option<std::fs::File>,
) -> Result<std::path::PathBuf, String> {
    let zip_path = resource_dir.join("standalone.zip");
    let standalone_dir = resource_dir.join("standalone");
    let version_file = standalone_dir.join(".app-version");
    let current_version = env!("CARGO_PKG_VERSION");

    if !zip_path.exists() {
        return Err(format!("standalone.zip introuvable: {:?}", zip_path));
    }
    let zip_len = server_zip_size(&zip_path)?;

    // C2-A2 : décision d'extraction basée sur version + taille du zip —
    // une même version avec un zip serveur différent (code corrigé) est
    // redéployée au lieu d'être ignorée.
    let needs_extract =
        if standalone_dir.join("server.js").exists() && standalone_dir.join("node_modules").exists() {
            let marker = std::fs::read_to_string(&version_file).unwrap_or_default();
            let marker = marker.trim();
            let (extracted_version, extracted_len) = match marker.split_once('|') {
                Some((v, l)) => (v, l.parse::<u64>().unwrap_or(0)),
                None => (marker, 0u64),
            };
            if extracted_version == current_version && extracted_len == zip_len {
                diag!(
                    log_file,
                    "standalone v{} (zip {} octets) déjà extrait, skip",
                    current_version,
                    zip_len
                );
                false
            } else {
                diag!(
                    log_file,
                    "standalone v{} (zip {}) détecté, mise à jour vers v{} (zip {})...",
                    extracted_version,
                    extracted_len,
                    current_version,
                    zip_len
                );
                true
            }
        } else {
            true
        };

    if needs_extract {
        // C2-A3 : migrer les sauvegardes AVANT toute suppression. Si des
        // fichiers n'ont pas pu être migrés, annuler l'extraction plutôt
        // que de détruire des sauvegardes (jamais destructif).
        migrate_legacy_backups(resource_dir, log_file);
        if resource_dir.join("standalone").join("backups").exists() {
            return Err(
                "C2-A3: sauvegardes non migrées dans standalone/backups — extraction annulée pour ne pas les détruire"
                    .to_string(),
            );
        }

        // Supprimer l'ancien standalone avant extraction
        if standalone_dir.exists() {
            diag!(log_file, "Suppression de l'ancien standalone...");
            // C2-A2 : suppression stricte (1 réessai) — jamais d'arbre mixte
            // ancien/nouveau en cas d'échec silencieux.
            if std::fs::remove_dir_all(&standalone_dir).is_err() {
                std::thread::sleep(std::time::Duration::from_secs(1));
                if let Err(e) = std::fs::remove_dir_all(&standalone_dir) {
                    return Err(format!("suppression de l'ancien standalone impossible: {}", e));
                }
            }
        }

        let extract_started = std::time::Instant::now();
        diag!(log_file, "Extraction de standalone.zip... (premier lancement ~1 à 2 min)");

        let zip_win = zip_path.display().to_string().replace('/', "\\");
        let dest_win = resource_dir.display().to_string().replace('/', "\\");

        let output = {
            let mut c = std::process::Command::new("powershell");
            c.args([
                "-NoProfile",
                "-NonInteractive",
                &format!(
                    "Expand-Archive -LiteralPath '{}' -DestinationPath '{}' -Force",
                    zip_win, dest_win
                ),
            ]);
            #[cfg(target_os = "windows")]
            c.creation_flags(CREATE_NO_WINDOW);
            c.output()
        }
        .map_err(|e| format!("powershell spawn failed: {}", e))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(format!("Expand-Archive failed: {}", stderr));
        }
        diag!(
            log_file,
            "C2-A2: Expand-Archive terminé en {}s",
            extract_started.elapsed().as_secs()
        );

        // C2-A2 : vérifier le résultat de l'extraction AVANT d'écrire le
        // marqueur (sinon une extraction incomplète serait déclarée à jour).
        if !standalone_dir.join("server.js").exists()
            || !standalone_dir.join("node_modules").exists()
        {
            return Err(
                "extraction incomplète : server.js ou node_modules absent après Expand-Archive"
                    .to_string(),
            );
        }

        // C2-A2 : marqueur = version + taille du zip, écrit puis relu —
        // une écriture ratée ne doit plus boucler l'extraction en silence.
        let marker_text = format!("{}|{}", current_version, zip_len);
        std::fs::write(&version_file, &marker_text).map_err(|e| {
            format!(
                "écriture du marqueur impossible ({}): {}",
                version_file.display(),
                e
            )
        })?;
        diag!(log_file, "C2-A2: marqueur écrit ({})", marker_text);
    }

    Ok(standalone_dir)
}

/// C2-O1 : handle du processus serveur node.exe, conservé dans l'état Tauri
/// pour permettre un arrêt propre à la fermeture de l'application.
/// (Remplace `std::mem::forget(child)` qui laissait un node.exe orphelin
/// occuper SERVER_PORT après chaque fermeture → EADDRINUSE au redémarrage.)
struct ServerChild(std::sync::Mutex<Option<std::process::Child>>);

/// C2-R5 (A4) : chemin du journal, partagé avec le gestionnaire d'arrêt
/// (le fichier est réouvert en mode ajout au moment de journaliser l'arrêt).
struct LogPath(std::path::PathBuf);

/// C2-O1 : arrête un éventuel node.exe orphelin d'une session précédente qui
/// écouterait déjà SERVER_PORT (versions ≤ 1.10.9 : process jamais tué).
fn kill_port_orphan(port: u16, log_file: &mut Option<std::fs::File>) {
    #[cfg(target_os = "windows")]
    {
        let out = std::process::Command::new("netstat")
            .args(["-ano", "-p", "tcp"])
            .creation_flags(CREATE_NO_WINDOW)
            .output();
        if let Ok(o) = out {
            let text = String::from_utf8_lossy(&o.stdout);
            let needle = format!(":{}", port);
            let mut seen: std::collections::HashSet<String> = Default::default();
            for line in text.lines() {
                if line.contains("LISTENING") && line.contains(&needle) {
                    if let Some(pid) = line.split_whitespace().last() {
                        if pid.chars().all(|c| c.is_ascii_digit()) && seen.insert(pid.to_string()) {
                            diag!(log_file, "C2-O1: arrêt de l'orphelin pid={} (port {})", pid, port);
                            let _ = std::process::Command::new("taskkill")
                                .args(["/PID", pid, "/T", "/F"])
                                .creation_flags(CREATE_NO_WINDOW)
                                .output();
                        }
                    }
                }
            }
        }
    }
    #[cfg(not(target_os = "windows"))]
    let _ = (port, log_file);
}

/// C2-R5 (A1) : rotation du journal si trop volumineux : server.log est
/// renommé en server.log.<date> et seules les LOG_KEEP_ARCHIVES archives
/// les plus récentes sont conservées.
fn rotate_log_if_large(log_path: &std::path::Path) {
    let meta = match std::fs::metadata(log_path) {
        Ok(m) => m,
        Err(_) => return,
    };
    if meta.len() < LOG_ROTATE_MAX_BYTES {
        return;
    }
    let name = match log_path.file_name() {
        Some(n) => n.to_string_lossy().to_string(),
        None => return,
    };
    let dir = match log_path.parent() {
        Some(d) => d.to_path_buf(),
        None => return,
    };
    let stamp = chrono::Local::now().format("%Y%m%d-%H%M%S");
    let archived = dir.join(format!("{}.{}", name, stamp));
    let _ = std::fs::rename(log_path, &archived);
    let prefix = format!("{}.", name);
    let mut archives: Vec<std::path::PathBuf> = std::fs::read_dir(&dir)
        .map(|rd| {
            rd.filter_map(|e| e.ok())
                .map(|e| e.path())
                .filter(|p| {
                    p.file_name()
                        .map(|n| n.to_string_lossy().starts_with(&prefix))
                        .unwrap_or(false)
                })
                .collect()
        })
        .unwrap_or_default();
    archives.sort();
    while archives.len() > LOG_KEEP_ARCHIVES {
        let oldest = archives.remove(0);
        let _ = std::fs::remove_file(oldest);
    }
}

/// C2-R5 (A4) : réouvrir le journal en mode ajout (pour journaliser l'arrêt).
fn reopen_log(log_path: &std::path::Path) -> Option<std::fs::File> {
    std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(log_path)
        .ok()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(ServerChild(std::sync::Mutex::new(None)))
        .setup(|app| {
            let handle = app.handle().clone();

            #[cfg(target_os = "windows")]
            {
                let exe = std::env::current_exe().unwrap();
                let exe_dir = exe.parent().unwrap();

                // --- Log file (C2-R5 : mode ajout + rotation, plus d'écrasement) ---
                let log_path = exe_dir.join("server.log");
                rotate_log_if_large(&log_path);
                let mut log_file: Option<std::fs::File> = reopen_log(&log_path);
                handle.manage(LogPath(log_path.clone()));

                diag!(log_file, "=== Ma Thèse v{} démarrage ===", env!("CARGO_PKG_VERSION"));
                diag!(log_file, "exe: {:?}", exe);
                diag!(log_file, "exe_dir: {:?}", exe_dir);

                // --- Database ---
                let db_path = exe_dir.join("data").join("custom.db");
                if let Some(data_dir) = db_path.parent() {
                    let _ = std::fs::create_dir_all(data_dir);
                }
                let database_url = format!("file:{}", db_path.display());
                std::env::set_var("DATABASE_URL", &database_url);

                // --- Resource dir ---
                let resource_dir_raw = handle.path().resource_dir().unwrap();
                let resource_dir = strip_extended_length_prefix(&resource_dir_raw);
                diag!(log_file, "resource_dir: {:?}", resource_dir);

                // DB template
                let bundled_db = resource_dir.join("db").join("custom.db");
                if !db_path.exists() && bundled_db.exists() {
                    if let Some(data_dir) = db_path.parent() {
                        let _ = std::fs::create_dir_all(data_dir);
                    }
                    let _ = std::fs::copy(&bundled_db, &db_path);
                }

                // --- Extract standalone.zip ---
                let server_dir = match extract_standalone(&resource_dir, &mut log_file) {
                    Ok(d) => d,
                    Err(e) => {
                        diag!(log_file, "FATAL: {}", e);
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.eval(&format!(
                                "document.body.innerHTML = '<div style=\'display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui;background:#fff\'>'+
                                '<div style=\'text-align:center;max-width:600px;padding:2em\'>'+
                                '<h2 style=\'color:#dc2626\'>Erreur d\'installation</h2>'+
                                '<p>{}</p>'+
                                '<p style=\'color:#64748b;font-size:14px\'>Réinstallez l\'application.</p>'+
                                '</div></div>';",
                                e.replace("'", "&#39;")
                            ));
                        }
                        return Ok(());
                    }
                };

                let node_exe = resource_dir.join("node.exe");
                let server_js = server_dir.join("server.js");

                diag!(log_file, "node.exe: {:?} (exists={})", node_exe, node_exe.exists());
                diag!(log_file, "server.js: {:?} (exists={})", server_js, server_js.exists());
                diag!(log_file, "node_modules: {:?} (exists={})", server_dir.join("node_modules"), server_dir.join("node_modules").exists());

                if !node_exe.exists() || !server_js.exists() {
                    diag!(log_file, "FATAL: fichiers serveur introuvables");
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.eval(
                            "document.body.innerHTML = '<div style=\'display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui;background:#fff\'>'+
                            '<div style=\'text-align:center\'>'+
                            '<h2 style=\'color:#dc2626\'>Fichiers serveur introuvables</h2>'+
                            '</div></div>';"
                        );
                    }
                    return Ok(());
                }

                // --- Start Node.js ---
                let port = SERVER_PORT;
                diag!(log_file, "Démarrage node.exe sur le port {}...", port);

                // C2-O1 : si un orphelin d'une session précédente écoute déjà le
                // port, l'arrêter AVANT le spawn (sinon le nouveau serveur échoue
                // en EADDRINUSE et l'app se raccroche silencieusement à l'ancien).
                if std::net::TcpStream::connect(&format!("127.0.0.1:{}", port)).is_ok() {
                    diag!(log_file, "C2-O1: port {} déjà occupé — orphelin probable", port);
                    kill_port_orphan(port, &mut log_file);
                    std::thread::sleep(std::time::Duration::from_millis(500));
                }

                // C2-A3 : répertoire des sauvegardes hors de standalone/ (zone
                // ré-extractable) — cf. src/lib/backup.ts (TF_BACKUP_DIR).
                let backup_dir = resource_dir.join("backups");
                let _ = std::fs::create_dir_all(&backup_dir);

                let mut cmd = std::process::Command::new(&node_exe);
                #[cfg(target_os = "windows")]
                cmd.creation_flags(CREATE_NO_WINDOW);
                cmd.arg(&server_js)
                    .env("PORT", port.to_string())
                    .env("HOSTNAME", "127.0.0.1")
                    .env("NODE_ENV", "production")
                    .env("TAURI", "true")
                    .env("DATABASE_URL", &database_url)
                    // C2-A3 : les sauvegardes quotidiennes vont dans
                    // <install>/backups (TF_BACKUP_DIR prime sur le défaut
                    // process.cwd()/backups — cf. src/lib/backup.ts).
                    .env("TF_BACKUP_DIR", backup_dir.to_string_lossy().to_string())
                    // C2-E3 : chemin du template de base embarqué — référence de
                    // migration au boot (cf. src/lib/db/schema-migrate.ts). La base
                    // utilisateur y est comparée et le DIFF appliqué en DDL
                    // idempotents après sauvegarde (jamais destructif).
                    .env("TAURI_TEMPLATE_DB", bundled_db.to_string_lossy().to_string());

                // T14 (C-D2, option a env-only) : les clés API ne sont plus
                // embarquées dans le binaire — la variable d'environnement
                // OPENALEX_API_KEY (si définie sur la machine) est transmise
                // telle quelle au process Next.js. Sans elle : quota anonyme
                // OpenAlex + bascule automatique CrossRef/HAL (mécanisme A.2).
                // Boucle conservée pour transmettre toute valeur fournie par
                // l'environnement sans l'écraser (CORE_API_KEY, etc.).
                for (key, default) in [
                    ("OPENALEX_API_KEY", ""),
                    ("CORE_API_KEY", ""),
                ] {
                    if std::env::var(key).is_err() && !default.is_empty() {
                        cmd.env(key, default);
                    }
                }

                if let Some(ref f) = log_file {
                    cmd.stdout(std::process::Stdio::from(f.try_clone().unwrap()))
                        .stderr(std::process::Stdio::from(f.try_clone().unwrap()));
                } else {
                    cmd.stdout(std::process::Stdio::null())
                        .stderr(std::process::Stdio::null());
                }

                cmd.current_dir(&server_dir);

                let child = match cmd.spawn() {
                    Ok(c) => c,
                    Err(e) => {
                        diag!(log_file, "FATAL: spawn failed: {}", e);
                        return Ok(());
                    }
                };

                diag!(log_file, "node.exe lancé (pid={:?}), attente du serveur...", child.id());

                // --- Timeout augmenté à 60s (extraction zip + démarrage Next.js) ---
                let server_ready = wait_for_server(port, SERVER_STARTUP_TIMEOUT_SECS);

                if server_ready {
                    diag!(log_file, "Serveur prêt, navigation vers http://127.0.0.1:{}", port);
                    if let Some(window) = app.get_webview_window("main") {
                        let url = format!("http://127.0.0.1:{}", port);
                        let _ = window.navigate(tauri::Url::parse(&url).unwrap());
                    }
                } else {
                    diag!(log_file, "FATAL: serveur non prêt après {}s", SERVER_STARTUP_TIMEOUT_SECS);
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.eval(
                            "document.body.innerHTML = '<div style=\'display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui;background:#fff\'>'+
                            '<div style=\'text-align:center\'>'+
                            '<h2 style=\'color:#dc2626\'>Le serveur n\'a pas démarré</h2>'+
                            '<p style=\'color:#64748b;font-size:14px\'>Consultez server.log.</p>'+
                            '</div></div>';"
                        );
                    }
                }

                // C2-O1 : conserver le handle pour l'arrêt propre à la fermeture
                // (remplace std::mem::forget — cf. struct ServerChild).
                let state = app.state::<ServerChild>();
                *state.0.lock().unwrap() = Some(child);
            }

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while running Ma Thèse")
        .run(|app, event| {
            // C2-R5 (A4) : arrêt du serveur embarqué, journalisé, en deux temps
            // (tentative d'arrêt doux, puis forcé après SERVER_STOP_TIMEOUT_SECS).
            // (RunEvent::Exit couvre la fermeture de la dernière fenêtre.)
            if let tauri::RunEvent::Exit = event {
                if let Some(state) = app.try_state::<ServerChild>() {
                    if let Ok(mut guard) = state.0.lock() {
                        if let Some(mut child) = guard.take() {
                            let pid = child.id();
                            let mut log_file: Option<std::fs::File> = app
                                .try_state::<LogPath>()
                                .and_then(|lp| reopen_log(&lp.0));
                            diag!(log_file, "C2-R5: fermeture de l'application, arrêt du serveur node.exe (pid={})...", pid);
                            #[cfg(target_os = "windows")]
                            {
                                let _ = std::process::Command::new("taskkill")
                                    .args(["/PID", &pid.to_string(), "/T"])
                                    .creation_flags(CREATE_NO_WINDOW)
                                    .output();
                            }
                            #[cfg(not(target_os = "windows"))]
                            let _ = child.kill();
                            let deadline = std::time::Instant::now()
                                + std::time::Duration::from_secs(SERVER_STOP_TIMEOUT_SECS);
                            let mut stopped = false;
                            while std::time::Instant::now() < deadline {
                                match child.try_wait() {
                                    Ok(Some(_)) | Err(_) => {
                                        stopped = true;
                                        break;
                                    }
                                    Ok(None) => {
                                        std::thread::sleep(std::time::Duration::from_millis(200));
                                    }
                                }
                            }
                            if stopped {
                                diag!(log_file, "C2-R5: serveur node.exe (pid={}) arrêté", pid);
                            } else {
                                diag!(log_file, "C2-R5: serveur node.exe (pid={}) toujours actif après {}s, arrêt forcé", pid, SERVER_STOP_TIMEOUT_SECS);
                                #[cfg(target_os = "windows")]
                                {
                                    let _ = std::process::Command::new("taskkill")
                                        .args(["/PID", &pid.to_string(), "/T", "/F"])
                                        .creation_flags(CREATE_NO_WINDOW)
                                        .output();
                                }
                                #[cfg(not(target_os = "windows"))]
                                let _ = child.kill();
                                let _ = child.wait();
                                diag!(log_file, "C2-R5: serveur node.exe (pid={}) arrêté (forcé)", pid);
                            }
                        }
                    }
                }
            }
        });
}
