use std::io::Write;
use tauri::Manager;

const SERVER_PORT: u16 = 14325;
const SERVER_STARTUP_TIMEOUT_SECS: u64 = 60;

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
            let _ = writeln!(f, "{}", msg);
            let _ = f.flush();
        }
    }};
}

/// Strip le préfixe Windows extended-length path \\?\ \/
fn strip_extended_length_prefix(p: &std::path::Path) -> std::path::PathBuf {
    let s = p.to_string_lossy();
    let cleaned = s
        .strip_prefix(r"\\?\")
        .or_else(|| s.strip_prefix(r"//?/"))
        .unwrap_or(&s);
    std::path::PathBuf::from(cleaned)
}

/// Extraire standalone.zip avec PowerShell.
/// Le zip contient un dossier standalone/ au niveau racine.
/// On l'extrait dans resource_dir/ ce qui crée resource_dir/standalone/.
fn extract_standalone(resource_dir: &std::path::Path, log_file: &mut Option<std::fs::File>) -> Result<std::path::PathBuf, String> {
    let zip_path = resource_dir.join("standalone.zip");
    let standalone_dir = resource_dir.join("standalone");

    if !zip_path.exists() {
        return Err(format!("standalone.zip introuvable: {:?}", zip_path));
    }

    // Si déjà extrait, skip
    if standalone_dir.join("server.js").exists() && standalone_dir.join("node_modules").exists() {
        diag!(log_file, "standalone déjà extrait, skip");
        return Ok(standalone_dir);
    }

    diag!(log_file, "Extraction de standalone.zip... (premier lancement ~30-60s)");

    let zip_win = zip_path.display().to_string().replace('/', "\\");
    let dest_win = resource_dir.display().to_string().replace('/', "\\");

    let output = std::process::Command::new("powershell")
        .args([
            "-NoProfile",
            "-NonInteractive",
            &format!(
                "Expand-Archive -LiteralPath '{}' -DestinationPath '{}' -Force",
                zip_win, dest_win
            ),
        ])
        .output()
        .map_err(|e| format!("powershell spawn failed: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Expand-Archive failed: {}", stderr));
    }

    diag!(log_file, "Extraction terminée");
    Ok(standalone_dir)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let handle = app.handle().clone();

            #[cfg(target_os = "windows")]
            {
                let exe = std::env::current_exe().unwrap();
                let exe_dir = exe.parent().unwrap();

                // --- Log file ---
                let log_path = exe_dir.join("server.log");
                let mut log_file: Option<std::fs::File> = std::fs::File::create(&log_path).ok();

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
                                '<p>{}.</p>'+
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

                let mut cmd = std::process::Command::new(&node_exe);
                cmd.arg(&server_js)
                    .env("PORT", port.to_string())
                    .env("HOSTNAME", "127.0.0.1")
                    .env("NODE_ENV", "production")
                    .env("DATABASE_URL", &database_url);

                for (key, default) in [
                    ("OPENALEX_API_KEY", "qsdRrHIuOptAWiFw3ErWLr"),
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

                std::mem::forget(child);
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Ma Thèse");
}
