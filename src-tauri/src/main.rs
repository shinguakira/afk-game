// Thin desktop wrapper: load the built web client in a native window.
// All game logic lives in the frontend; saves use localStorage in the webview.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running Idle Engineer");
}
