#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

// This is the function that will be called from JS
#[tauri::command]
fn say_hi() -> String {
    "Hi".to_string()
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![say_hi])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}