use crate::models::*;
use crate::storage::*;
use tauri::command;

#[command]
pub async fn login_command(payload: LoginRequest) -> Result<LoginResponse, String> {
    use crate::config::get_api_url;

    let client = reqwest::Client::new();
    let base_url = get_api_url();
    let api_url = format!("{}/login", base_url);

    let response = client
        .post(&api_url)
        .json(&payload)
        .send()
        .await;

    match response {
        Ok(resp) => {
            let status = resp.status();
            let text = resp.text().await.unwrap_or_default();

            // Try parsing a successful response
            if let Ok(data) = serde_json::from_str::<LoginResponse>(&text) {
                return Ok(data);
            }

            // Parse error message if available
            let error_msg = if let Ok(json) = serde_json::from_str::<serde_json::Value>(&text) {
                json.get("error").and_then(|e| e.as_str()).unwrap_or("").to_string()
            } else {
                "".to_string()
            };

            // Show user-friendly errors based on status and error content
            let (user_error, need_confirmation) = match status.as_u16() {
                400 | 401 => (
                    "Invalid email or password. Please try again.".to_string(),
                    None,
                ),
                403 => {
                    if error_msg.contains("not verified") {
                        (
                            "Your account is not verified. A new confirmation code has been sent to your email."
                                .to_string(),
                            Some(true),
                        )
                    } else {
                        ("Access denied.".to_string(), None)
                    }
                }
                500 => (
                    "Server error. Please try again later.".to_string(),
                    None,
                ),
                _ => (
                    "An unexpected error occurred. Please try again.".to_string(),
                    None,
                ),
            };

            Ok(LoginResponse {
                success: false,
                token: None,
                user: None,
                error: Some(user_error),
                need_confirmation,
            })
        }
        Err(_) => {
            Err("Unable to connect to the server. Please check your internet connection.".to_string())
        }
    }
}

#[tauri::command]
pub async fn signup_command(payload: SignupRequest) -> Result<SignupResponse, String> {
    use crate::config::get_api_url;
    let client = reqwest::Client::new();
    let api_url = format!("{}/signup", get_api_url());

    let response = client.post(&api_url).json(&payload).send().await;

    match response {
        Ok(resp) => {
            let status = resp.status();
            let text = resp.text().await.unwrap_or_default();

            // If successful, try to parse normally
            if let Ok(data) = serde_json::from_str::<SignupResponse>(&text) {
                return Ok(data);
            }

            // Parse error message
            let error_msg = if let Ok(json) = serde_json::from_str::<serde_json::Value>(&text) {
                json.get("error").and_then(|e| e.as_str()).unwrap_or("").to_string()
            } else { "".to_string() };

            // Show user-friendly errors based on status
            let user_error = match status.as_u16() {
                400 => match error_msg.as_str() {
                    "Invalid email format" => "Please enter a valid email address.",
                    "Password does not meet requirements" => "Password must be at least 8 characters, including uppercase, lowercase, number, and special character.",
                    "Username must be between 3 and 20 characters" => "Username must be 3–20 characters.",
                    "Full name must be between 2 and 50 characters" => "Please enter your full name (2–50 characters).",
                    _ => "Please check your input and try again.",
                }.to_string(),
                409 => match error_msg.as_str() {
                    "Email already registered" => "This email is already registered.",
                    "Username already taken" => "This username is already taken.",
                    _ => "Account already exists.",
                }.to_string(),
                500 => "Server error during signup. Please try again later.".to_string(),
                _ => "Signup failed. Please check your details and try again.".to_string(),
            };

            Ok(SignupResponse {
                success: false,
                message: None,
                error: Some(user_error),
            })
        }
        Err(_) => Err("Unable to connect to the server. Please check your internet connection.".to_string()),
    }
}

#[tauri::command]
pub async fn confirm_email_command(payload: ConfirmRequest) -> Result<ConfirmResponse, String> {
    use crate::config::get_api_url;
    let client = reqwest::Client::new();
    let api_url = format!("{}/confirm", get_api_url());
    let response = client.post(&api_url).json(&payload).send().await;

    match response {
        Ok(resp) => {
            let status = resp.status();
            let text = resp.text().await.unwrap_or_default();

            if let Ok(data) = serde_json::from_str::<ConfirmResponse>(&text) {
                return Ok(data);
            }

            let error_msg = if let Ok(json) = serde_json::from_str::<serde_json::Value>(&text) {
                json.get("error").and_then(|e| e.as_str()).unwrap_or("").to_string()
            } else { "".to_string() };

            let user_error = match status.as_u16() {
                400 => match error_msg.as_str() {
                    "Missing email or code" => "Please provide both your email and the confirmation code.",
                    "Invalid confirmation code" => "The code you entered is incorrect.",
                    "Confirmation code expired" => "Your confirmation code has expired. Please request a new one.",
                    _ => "Invalid request. Please check your details.",
                }.to_string(),
                404 => "No account found with that email.".to_string(),
                500 => "Server error during confirmation. Please try again later.".to_string(),
                _ => "Verification failed. Please try again.".to_string(),
            };

            Ok(ConfirmResponse {
                success: false,
                message: None,
                error: Some(user_error),
            })
        }
        Err(_) => Err("Unable to connect to the server. Please check your internet connection.".to_string()),
    }
}

#[tauri::command]
pub async fn request_reset_command(payload: RequestResetRequest) -> Result<GenericResponse, String> {
    use crate::config::get_api_url;
    let client = reqwest::Client::new();
    let api_url = format!("{}/request-reset", get_api_url());
    let response = client.post(&api_url).json(&payload).send().await;

    match response {
        Ok(resp) => {
            let status = resp.status();
            let text = resp.text().await.unwrap_or_default();

            if let Ok(data) = serde_json::from_str::<GenericResponse>(&text) {
                return Ok(data);
            }

            let user_error = match status.as_u16() {
                400 => "Please enter your email.".to_string(),
                404 => "No user found with that email.".to_string(),
                500 => "Server error during password reset. Please try again later.".to_string(),
                _ => "Failed to send reset code. Please try again.".to_string(),
            };

            Ok(GenericResponse {
                success: false,
                message: None,
                error: Some(user_error),
            })
        }
        Err(_) => Err("Unable to connect to the server. Please check your internet connection.".to_string()),
    }
}

#[tauri::command]
pub async fn reset_password_command(payload: ResetPasswordRequest) -> Result<GenericResponse, String> {
    use crate::config::get_api_url;
    let client = reqwest::Client::new();
    let api_url = format!("{}/reset-password", get_api_url());
    let response = client.post(&api_url).json(&payload).send().await;

    match response {
        Ok(resp) => {
            let status = resp.status();
            let text = resp.text().await.unwrap_or_default();

            if let Ok(data) = serde_json::from_str::<GenericResponse>(&text) {
                return Ok(data);
            }

            let error_msg = if let Ok(json) = serde_json::from_str::<serde_json::Value>(&text) {
                json.get("error").and_then(|e| e.as_str()).unwrap_or("").to_string()
            } else { "".to_string() };

            let user_error = match status.as_u16() {
                400 => match error_msg.as_str() {
                    "All fields required" => "Please fill in all fields.",
                    "Password does not meet requirements" => "Password must be at least 8 characters, including uppercase, lowercase, number, and special character.",
                    "Invalid code" => "The code you entered is incorrect.",
                    "Code expired" => "Your reset code has expired. Please request a new one.",
                    _ => "Invalid request. Please check your input.",
                }.to_string(),
                404 => "No account found with that email.".to_string(),
                500 => "Server error while resetting password. Please try again later.".to_string(),
                _ => "Could not reset your password. Please try again.".to_string(),
            };

            Ok(GenericResponse {
                success: false,
                message: None,
                error: Some(user_error),
            })
        }
        Err(_) => Err("Unable to connect to the server. Please check your internet connection.".to_string()),
    }
}

#[command]
pub async fn store_token_securely(token: String) -> Result<(), String> {
    write_file("auth_token", &token)
}

#[command]
pub async fn get_stored_token() -> Result<String, String> {
    read_file("auth_token")
}

#[command]
pub async fn store_pending_email(email: String) -> Result<(), String> {
    write_file("pending_email", &email)
}

#[command]
pub async fn get_pending_email() -> Result<String, String> {
    read_file("pending_email")
}

#[command]
pub async fn clear_auth_data() -> Result<(), String> {
    remove_file("auth_token")?;
    remove_file("pending_email")?;
    Ok(())
}