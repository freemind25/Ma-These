use tauri::Manager;

const SERVER_PORT: u16 = 14325;
const SERVER_STARTUP_TIMEOUT_SECS: u64 = 30;

/// Attend que le serveur Next.js accepte des connexions TCP sur le port donné.
/// Plus fiable qu'un sleep fixe : le serveur peut démarrer en 1s ou 15s selon la machine.
fn wait_for_server(port: u16, timeout_secs: u64) -> bool {
    let addr = format!("127.0.0.1:{}", port);
    let start = std::time::Instant::now();
    while start.elapsed().as_secs() < timeout_secs {
        if std::net::TcpStream::connect(&addr).is_ok() {
            // Le port est ouvert, mais le serveur HTTP peut ne pas être prêt.
            // Petite pause pour laisser le handler HTTP s'initialiser.
            std::thread::sleep(std::time::Duration::from_millis(500));
            return true;
        }
        std::thread::sleep(std::time::Duration::from_millis(500));
    }
    false
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

                // --- Database setup ---
                let db_path = exe_dir.join("data").join("custom.db");
                if let Some(data_dir) = db_path.parent() {
                    let _ = std::fs::create_dir_all(data_dir);
                }
                let database_url = format!("file:{}", db_path.display());
                std::env::set_var("DATABASE_URL", &database_url);

                // Si la DB n'existe pas, copier le template depuis resources
                let resource_dir = handle.path().resource_dir().unwrap();
                let bundled_db = resource_dir.join("db").join("custom.db");
                if !db_path.exists() && bundled_db.exists() {
                    if let Some(data_dir) = db_path.parent() {
                        let _ = std::fs::create_dir_all(data_dir);
                    }
                    let _ = std::fs::copy(&bundled_db, &db_path);
                }

                // --- Locate server files ---
                let node_exe = resource_dir.join("node.exe");
                let server_dir = resource_dir.join("standalone");
                let server_js = server_dir.join("server.js");

                if !node_exe.exists() || !server_js.exists() {
                    eprintln!("[Ma Thèse] Server files not found:");
                    eprintln!("  node.exe: {:?}", node_exe);
                    eprintln!("  server.js: {:?}", server_js);
                    return Ok(());
                }

                // --- Start Node.js server (sidecar) ---
                let port = SERVER_PORT;

                let mut cmd = std::process::Command::new(&node_exe);
                cmd.arg(&server_js)
                    .env("PORT", port.to_string())
                    .env("HOSTNAME", "127.0.0.1")
                    .env("NODE_ENV", "production")
                    .env("DATABASE_URL", &database_url);

                // Variables d'environnement pour les API intégrées.
                // - OPENALEX_API_KEY : clé partagée (non sensible, dans le code source)
                // - Les clés IA (OpenAI, Anthropic…) sont configurées par le docteur via l'UI → DB
                for (key, default) in [
                    ("OPENALEX_API_KEY", "qsdRrHIuOptAWiFw3ErWLr"),
                    ("CORE_API_KEY", ""),
                ] {
                    // Priorité : env existante > valeur par défaut
                    if std::env::var(key).is_err() && !default.is_empty() {
                        cmd.env(key, default);
                    }
                }

                cmd.current_dir(&server_dir)
                    .stdout(std::process::Stdio::piped())
                    .stderr(std::process::Stdio::piped());

                let child = match cmd.spawn() {
                    Ok(c) => c,
                    Err(e) => {
                        eprintln!("[Ma Thèse] Failed to start server: {}", e);
                        return Ok(());
                    }
                };

                // --- Attendre que le serveur soit prêt (poll TCP) ---
                // Remplace le sleep(4s) fragile par un poll avec timeout.
                let server_ready = wait_for_server(port, SERVER_STARTUP_TIMEOUT_SECS);

                if server_ready {
                    if let Some(window) = app.get_webview_window("main") {
                        let url = format!("http://127.0.0.1:{}", port);
                        let _ = window.navigate(tauri::Url::parse(&url).unwrap());
                    }
                } else {
                    eprintln!(
                        "[Ma Thèse] Server did not start within {}s",
                        SERVER_STARTUP_TIMEOUT_SECS
                    );
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.navigate(
                            tauri::Url::parse(
                                concat!(
                                    "data:text/html,",
                                    "<html><body style='display:flex;align-items:center;justify-content:center;height:100vh;",
                                    "font-family:system-ui;background:#fff'>",
                                    "<div style='text-align:center'>",
                                    "<h2 style='color:#dc2626'>Erreur de démarrage</h2>",
                                    "<p>Le serveur Ma Thèse n'a pas pu démarrer.</p>",
                                    "<p style='color:#64748b;font-size:14px'>",
                                    "Vérifiez que les fichiers standalone et node.exe sont présents.</p>",
                                    "</div></body></html>"
                                )
                            ).unwrap()
                        );
                    }
                }

                // Le processus enfant est « oublié » intentionnellement :
                // il vit aussi longtemps que l'application Tauri.
                // Quand l'app se ferme, le child est killé automatiquement.
                std::mem::forget(child);
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Ma Thèse");
}
