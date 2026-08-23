use tauri::Manager;

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

                // Database setup
                let db_path = exe_dir.join("data").join("custom.db");
                if let Some(data_dir) = db_path.parent() {
                    std::fs::create_dir_all(data_dir).ok();
                }
                if db_path.exists() {
                    std::env::set_var(
                        "DATABASE_URL",
                        format!("file:{}", db_path.display()),
                    );
                }

                // Locate bundled resources
                let resource_dir = handle.path().resource_dir().unwrap();

                // Find node.exe
                let node_exe = resource_dir.join("node.exe");
                let server_dir = resource_dir.join("standalone");
                let server_js = server_dir.join("server.js");

                if node_exe.exists() && server_js.exists() {
                    let port = 14325u16;

                    let _child = std::process::Command::new(&node_exe)
                        .arg(&server_js)
                        .env("PORT", port.to_string())
                        .env("HOSTNAME", "127.0.0.1")
                        .env("NODE_ENV", "production")
                        .env(
                            "DATABASE_URL",
                            std::env::var("DATABASE_URL").unwrap_or_default(),
                        )
                        .current_dir(&server_dir)
                        .stdout(std::process::Stdio::null())
                        .stderr(std::process::Stdio::null())
                        .spawn()
                        .expect("failed to start Ma Thèse server");

                    // Wait for the server to start
                    std::thread::sleep(std::time::Duration::from_secs(4));

                    // Navigate the main window to the local server
                    if let Some(window) = app.get_webview_window("main") {
                        let url = format!("http://127.0.0.1:{}", port);
                        let _ = window.navigate(tauri::Url::parse(&url).unwrap());
                    }
                } else {
                    eprintln!("Server files not found:");
                    eprintln!("  node.exe: {:?}", node_exe);
                    eprintln!("  server.js: {:?}", server_js);
                }
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Ma Thèse");
}
