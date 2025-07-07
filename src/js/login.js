import { API_BASE_URL } from './api.js';

document.getElementById('google-login-btn').addEventListener('click', () => {
  // Build the Google OAuth URL using API_BASE_URL (remove trailing slash if needed)
  let base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const oauthUrl = `${base}/auth/google`;

  const oauthWin = window.open(
    oauthUrl,
    'GoogleLogin',
    'width=500,height=600'
  );
});

// Listen for token from OAuth popup
window.addEventListener('message', async (event) => {
  // Optional: check event.origin if you want to validate source
  if (event.data && event.data.token) {
    // You now have the encrypted JWT token!
    // Store securely with Tauri invoke
    try {
      await window.__TAURI__.tauri.invoke('store_token_securely', { token: event.data.token });
      // Optionally fetch user profile here
      // Redirect to dashboard
      window.location.href = 'dashboard.html';
    } catch (e) {
      document.getElementById('login-result').textContent = "Google login error: " + (e.message || "Unknown error");
      document.getElementById('login-result').classList.add('error');
    }
  }
}, false);

// Wait for Tauri to be ready
window.addEventListener('DOMContentLoaded', async () => {
    // Import invoke function
    const { invoke } = window.__TAURI__.tauri;
    
    const form = document.getElementById('login-form');
    const container = document.querySelector('.login-container');
    const resultDiv = document.getElementById('login-result');

    // Check if elements exist
    if (!form || !container || !resultDiv) {
        console.error('Required DOM elements not found');
        return;
    }

    // Check auth status when page loads
    await checkAuthStatus();

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Add loading state
        container.classList.add('loading');
        resultDiv.textContent = '';
        resultDiv.className = 'result-message';

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        try {
            const data = await invoke('login_command', { payload: { email, password } });

            // Remove loading state
            container.classList.remove('loading');

            if (data.success) {
                resultDiv.textContent = 'Login successful! Redirecting to dashboard...';
                resultDiv.classList.add('success');
                container.classList.add('success-login');

                // Store token securely using Tauri's secure storage
                if (data.token) {
                    await invoke('store_token_securely', { token: data.token });
                }

                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 2000);

            } else if (data.needConfirmation) {
                resultDiv.textContent = data.error || "Account not verified. Please check your email.";
                resultDiv.classList.add('error');
                
                // Store pending email securely
                await invoke('store_pending_email', { email: email });
                
                setTimeout(() => {
                    window.location.href = 'confirm.html';
                }, 1500);

            } else {
                resultDiv.textContent = data.error || "Login failed. Please check your credentials.";
                resultDiv.classList.add('error');
                container.style.animation = 'shake 0.5s ease-in-out';
                setTimeout(() => {
                    container.style.animation = '';
                }, 500);
            }
        } catch (err) {
            container.classList.remove('loading');
            resultDiv.textContent = "App error. Please try again.";
            resultDiv.classList.add('error');
            console.error('Login error:', err);
        }
    });

    // Helper function to check if user is already logged in
    async function checkAuthStatus() {
        try {
            const token = await invoke('get_stored_token');
            if (token) {
                // User is already logged in, redirect to dashboard
                window.location.href = 'dashboard.html';
            }
        } catch (err) {
            // No token stored or error retrieving it, stay on login page
            console.log('No existing auth token');
        }
    }
});

// Add event listeners for the links
document.getElementById('signup-link').addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = 'signup.html';
});

document.getElementById('forgot-password-link').addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = 'forgot.html';
});

// Input field animations
document.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('focus', function () {
        this.parentElement.style.transform = 'scale(1.02)';
    });

    input.addEventListener('blur', function () {
        this.parentElement.style.transform = 'scale(1)';
    });
});

// Add shake animation keyframes
const style = document.createElement('style');
style.textContent = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
    `;
document.head.appendChild(style);