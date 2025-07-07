#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod models;
mod storage;
mod commands;
mod config;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::login_command,
            commands::signup_command,
            commands::confirm_email_command,
            commands::store_token_securely,
            commands::request_reset_command,
            commands::reset_password_command,
            commands::get_stored_token,
            commands::store_pending_email,
            commands::get_pending_email,
            commands::clear_auth_data
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}