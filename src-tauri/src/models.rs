use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginResponse {
    pub success: bool,
    pub token: Option<String>,
    pub user: Option<serde_json::Value>,
    pub error: Option<String>,
    #[serde(rename = "needConfirmation")]
    pub need_confirmation: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SignupRequest {
    pub name: String,
    pub username: String,
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SignupResponse {
    pub success: bool,
    pub message: Option<String>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ConfirmRequest {
    pub email: String,
    pub code: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ConfirmResponse {
    pub success: bool,
    pub message: Option<String>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RequestResetRequest {
    pub email: String,
}
#[derive(Debug, Serialize, Deserialize)]
pub struct GenericResponse {
    pub success: bool,
    pub message: Option<String>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ResetPasswordRequest {
    pub email: String,
    pub code: String,
    pub password: String,
}