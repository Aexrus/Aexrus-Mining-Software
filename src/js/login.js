import { API_BASE_URL } from './api.js';

const form = document.getElementById('login-form');
const container = document.querySelector('.login-container');
const resultDiv = document.getElementById('login-result');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Add loading state
    container.classList.add('loading');
    resultDiv.textContent = '';
    resultDiv.className = 'result-message';

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        // Remove loading state
        container.classList.remove('loading');

        if (response.ok) {
            resultDiv.textContent = 'Login successful! Redirecting to dashboard...';
            resultDiv.classList.add('success');
            container.classList.add('success-login');

            // Store token (Note: In production, consider more secure storage)
            // For Tauri apps, you might want to use Tauri's secure storage
            // localStorage.setItem('token', data.token);

            // Simulate redirect after success
            setTimeout(() => {
                // In a real app, redirect to dashboard
                resultDiv.textContent = 'Welcome to your mining dashboard!';
            }, 2000);

        } else {
            resultDiv.textContent = data.error || "Login failed. Please check your credentials.";
            resultDiv.classList.add('error');

            // Shake animation on error
            container.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                container.style.animation = '';
            }, 500);
        }
    } catch (err) {
        container.classList.remove('loading');
        resultDiv.textContent = "Network error. Please check your connection.";
        resultDiv.classList.add('error');
    }
});

// Add event listeners for the links
document.getElementById('signup-link').addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = 'signup.html';
});

document.getElementById('forgot-password-link').addEventListener('click', function (e) {
    e.preventDefault();
    // Handle forgot password functionality
    alert('Forgot password feature would be implemented here');
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