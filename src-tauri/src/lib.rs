use std::io::Write;
use tauri::Manager;

const SERVER_PORT: u16 = 14325;
const SERVER_STARTUP_TIMEOUT_SECS: u64 = 30;

/// Attend que le serveur Next.js accepte des connexions TCP puis réponde en HTTP.
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

/// Macro de log diagnostique
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

/// Strip le préfixe Windows extended-length path \\?\ \\/  
/// Tauri resource_dir() retourne ce préfixe, mais Node.js ne le gère pas
/// dans sa résolution de modules → EISDIR sur la racine du disque.
fn strip_extended_length_prefix(p: &std::path::Path) -> std::path::PathBuf {
    let s = p.to_string_lossy();
    let cleaned = s
        .strip_prefix(r"\\?\")
        .or_else(|| s.strip_prefix(r"//?/"))
        .unwrap_or(&s);
    std::path::PathBuf::from(cleaned)
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

                // --- Log file pour diagnostique ---
                let log_path = exe_dir.join("server.log");
                let mut log_file: Option<std::fs::File> = std::fs::File::create(&log_path).ok();

                diag!(log_file, "=== Ma Thèse v{} démarrage ===", env!("CARGO_PKG_VERSION"));
                diag!(log_file, "exe: {:?}", exe);
                diag!(log_file, "exe_dir: {:?}", exe_dir);

                // --- Database setup ---
                let db_path = exe_dir.join("data").join("custom.db");
                if let Some(data_dir) = db_path.parent() {
                    let _ = std::fs::create_dir_all(data_dir);
                }
                let database_url = format!("file:{}", db_path.display());
                std::env::set_var("DATABASE_URL", &database_url);
                diag!(log_file, "DATABASE_URL: {}", database_url);

                // --- Resource dir (avec nettoyage du préfixe \\?\) ---
                let resource_dir_raw = match handle.path().resource_dir() {
                    Ok(r) => r,
                    Err(e) => {
                        diag!(log_file, "FATAL: resource_dir() failed: {}", e);
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.eval(
                                "document.body.innerHTML = '<div style=\'display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui;background:#fff\'>'+
                                '<div style=\'text-align:center\'>'+
                                '<h2 style=\'color:#dc2626\'>Erreur interne</h2>'+
                                '<p style=\'color:#64748b;font-size:14px\'>resource_dir() a échoué.</p>'+
                                '</div></div>';"
                            );
                        }
                        return Ok(());
                    }
                };
                let resource_dir = strip_extended_length_prefix(&resource_dir_raw);
                diag!(log_file, "resource_dir (raw): {:?}", resource_dir_raw);
                diag!(log_file, "resource_dir (cleaned): {:?}", resource_dir);

                // Copie DB template
                let bundled_db = resource_dir.join("db").join("custom.db");
                if !db_path.exists() && bundled_db.exists() {
                    if let Some(data_dir) = db_path.parent() {
                        let _ = std::fs::create_dir_all(data_dir);
                    }
                    let _ = std::fs::copy(&bundled_db, &db_path);
                    diag!(log_file, "DB template copiée: {:?}", db_path);
                }

                // --- Locate server files ---
                let node_exe = resource_dir.join("node.exe");
                let server_dir = resource_dir.join("standalone");
                let server_js = server_dir.join("server.js");

                diag!(log_file, "node.exe: {:?} (exists={})", node_exe, node_exe.exists());
                diag!(log_file, "server.js: {:?} (exists={})", server_js, server_js.exists());

                if !node_exe.exists() || !server_js.exists() {
                    diag!(log_file, "FATAL: fichiers serveur introuvables");
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.eval(&format!(
                            "document.body.innerHTML = '<div style=\'display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui;background:#fff\'>'+
                            '<div style=\'text-align:center;max-width:600px;padding:2em\'>'+
                            '<h2 style=\'color:#dc2626\'>Fichiers serveur introuvables</h2>'+
                            '<p><code>node.exe</code> : {}</p>'+
                            '<p><code>server.js</code> : {}</p>'+
                            '</div></div>';",
                            node_exe.display(),
                            server_js.display()
                        ));
                    }
                    return Ok(());
                }

                // --- Start Node.js server (sidecar) ---
                let port = SERVER_PORT;
                diag!(log_file, "Démarrage node.exe sur le port {}...", port);
                diag!(log_file, "Commande: {} {}", node_exe.display(), server_js.display());
                diag!(log_file, "CWD: {}", server_dir.display());

                let mut cmd = std::process::Command::new(&node_exe);
                cmd.arg(&server_js)
                    .env("PORT", port.to_string())
                    .env("HOSTNAME", "127.0.0.1")
                    .env("NODE_ENV", "production")
                    .env("DATABASE_URL", &database_url);

                // Variables d'environnement pour les API intégrées
                for (key, default) in [
                    ("OPENALEX_API_KEY", "qsdRrHIuOptAWiFw3ErWLr"),
                    ("CORE_API_KEY", ""),
                ] {
                    if std::env::var(key).is_err() && !default.is_empty() {
                        cmd.env(key, default);
                    }
                }

                // stdout/stderr vers server.log (JAMAIS piped sans lecteur)
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
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.eval(&format!(
                                "document.body.innerHTML = '<div style=\'display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui;background:#fff\'>'+
                                '<div style=\'text-align:center\'>'+
                                '<h2 style=\'color:#dc2626\'>Erreur de démarrage</h2>'+
                                '<p>{}</p>'+
                                '</div></div>';",
                                e
                            ));
                        }
                        return Ok(());
                    }
                };

                diag!(log_file, "node.exe lancé (pid={:?}), attente du serveur...", child.id());

                // --- Attendre que le serveur soit prêt ---
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
                            '<p style=\'color:#64748b;font-size:14px\'>Timeout après 30s. Consultez server.log.</p>'+
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
