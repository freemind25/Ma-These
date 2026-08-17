use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let handle = app.handle().clone();

            #[cfg(target_os = "windows")]
            {
                use tauri::utils::platform::current_exe;
                let exe = current_exe().unwrap();
                let exe_dir = exe.parent().unwrap();

                // Database setup
                let db_path = exe_dir.join("data").join("custom.db");
                if let Some(data_dir) = db_path.parent() {
                    std::fs::create_dir_all(data_dir).ok();
                }
                if db_path.exists() {
                    std::env::set_var("DATABASE_URL", format!("file:{}", db_path.display()));
                }

                // Locate the bundled standalone server
                let resource_dir = handle.path().resource_dir().unwrap();
                let standalone_dir = resource_dir.join("standalone");
                let server_path = standalone_dir.join("server.js");

                if server_path.exists() {
                    let port = "14325";
                    let host = "127.0.0.1";

                    let _child = std::process::Command::new("node")
                        .arg(&server_path)
                        .env("PORT", port)
                        .env("HOSTNAME", host)
                        .env("NODE_ENV", "production")
                        .env("DATABASE_URL", std::env::var("DATABASE_URL").unwrap_or_default())
                        .current_dir(&standalone_dir)
                        .stdout(std::process::Stdio::null())
                        .stderr(std::process::Stdio::null())
                        .spawn();

                    // Wait for server to start
                    std::thread::sleep(std::time::Duration::from_secs(4));

                    // Navigate to the local server
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.navigate(
                            tauri::Url::parse(&format!("http://{}:{}", host, port)).unwrap()
                        );
                    }
                }
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running ThesisFrame");
}
