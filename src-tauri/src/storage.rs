use std::path::PathBuf;
use std::fs;

pub fn get_app_data_dir() -> Result<PathBuf, String> {
    tauri::api::path::app_data_dir(&tauri::Config::default())
        .ok_or_else(|| "Failed to get app data directory".to_string())
}

pub fn write_file(file_name: &str, content: &str) -> Result<(), String> {
    let mut path = get_app_data_dir()?;
    if !path.exists() {
        fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    }
    path.push(file_name);
    fs::write(&path, content).map_err(|e| e.to_string())
}

pub fn read_file(file_name: &str) -> Result<String, String> {
    let mut path = get_app_data_dir()?;
    path.push(file_name);
    if !path.exists() {
        return Err("File not found".to_string());
    }
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

pub fn remove_file(file_name: &str) -> Result<(), String> {
    let mut path = get_app_data_dir()?;
    path.push(file_name);
    if path.exists() {
        fs::remove_file(&path).map_err(|e| e.to_string())?;
    }
    Ok(())
}