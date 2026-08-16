use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // On Windows, set the app user model id for proper taskbar grouping
            #[cfg(target_os = "windows")]
            {
                use tauri::utils::platform::current_exe;
                let exe = current_exe().unwrap();
                let exe_dir = exe.parent().unwrap();
                let db_path = exe_dir.join("data").join("custom.db");

                // Ensure data directory exists
                if let Some(data_dir) = db_path.parent() {
                    std::fs::create_dir_all(data_dir).ok();
                }

                // Set DATABASE_URL env var pointing to bundled database
                if db_path.exists() {
                    std::env::set_var("DATABASE_URL", format!("file:{}", db_path.display()));
                }
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running ThesisFrame");
}
