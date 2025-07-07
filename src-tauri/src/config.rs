use std::fs;
use std::path::PathBuf;

/// Reads the API base URL from src-tauri/api_url.txt or returns a default.
pub fn get_api_url() -> String {
    let path = PathBuf::from("api_url.txt");
    fs::read_to_string(&path)
        .expect("Could not read src-tauri/api_url.txt! Please provide your API URL in this file.")
        .trim()
        .to_string()
}