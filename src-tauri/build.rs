// FIX-UPD-1 : déclare les commandes applicatives afin que tauri-build
// génère les permissions ACL `allow-$command` (snake_case). Sans manifeste
// applicatif, toute commande custom est REFUSÉE depuis l'origine remote du
// webview (http://127.0.0.1:14325 — cf. tauri webview/mod.rs : « remote
// content can never reach custom commands unless an explicit remote
// capability has been configured for them ») et l'arrêt du serveur avant
// l'installation d'une MAJ échouerait en silence.
fn main() {
    tauri_build::try_build(
        tauri_build::Attributes::new()
            .app_manifest(tauri_build::AppManifest::new().commands(&["stop_server_for_update"])),
    )
    .expect("échec du build Tauri (tauri_build::try_build)");
}
