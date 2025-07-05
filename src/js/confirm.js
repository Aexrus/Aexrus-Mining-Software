import { API_BASE_URL } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const userEmailDisplay = document.getElementById('user-email');
    const form = document.getElementById('confirm-form');
    const resultDiv = document.getElementById('result');
    const verifyBtn = document.getElementById('verify-btn');
    const btnText = verifyBtn.querySelector('.btn-text');
    const btnSpinner = verifyBtn.querySelector('.btn-spinner');
    const confirmationSection = document.getElementById('confirmation-section');

    // Get email from localStorage or use fallback
    const email = getStoredEmail();

    if (email) {
        userEmailDisplay.textContent = email;
    } else {
        userEmailDisplay.textContent = 'your email address';
    }

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Show loading state
        setLoadingState(true);
        clearResult();

        const code = document.getElementById('code').value.trim();

        if (!email) {
            showResult("No email found. Please sign up again.", 'error');
            setLoadingState(false);
            return;
        }

        if (!code) {
            showResult("Please enter the confirmation code.", 'error');
            setLoadingState(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code })
            });

            const data = await response.json();

            if (response.ok) {
                showResult(data.message || "Email verified! You can now log in.", 'success');
                confirmationSection.classList.add('success-animation');

                // Remove stored email after successful verification
                removeStoredEmail();

                // Redirect after success
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 2000);
            } else {
                showResult(data.error || "Verification failed. Please try again.", 'error');
                confirmationSection.classList.add('error-animation');

                // Remove error animation after it completes
                setTimeout(() => {
                    confirmationSection.classList.remove('error-animation');
                }, 600);
            }
        } catch (err) {
            console.error('Network error:', err);
            showResult("Network error. Please check your connection and try again.", 'error');
            confirmationSection.classList.add('error-animation');

            setTimeout(() => {
                confirmationSection.classList.remove('error-animation');
            }, 600);
        }

        setLoadingState(false);
    });

    // Helper functions
    function setLoadingState(isLoading) {
        verifyBtn.disabled = isLoading;
        btnText.style.display = isLoading ? "none" : "inline";
        btnSpinner.style.display = isLoading ? "inline-block" : "none";
    }

    function showResult(message, type) {
        resultDiv.textContent = message;
        resultDiv.className = `result-message show ${type}`;
    }

    function clearResult() {
        resultDiv.textContent = '';
        resultDiv.className = 'result-message';
    }

    function getStoredEmail() {
        try {
            // Try to get from localStorage first
            const stored = localStorage.getItem('pending_email');
            if (stored) return stored;

            // Fallback: check URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            const emailParam = urlParams.get('email');
            if (emailParam) {
                // Store in localStorage for consistency
                localStorage.setItem('pending_email', emailParam);
                return emailParam;
            }

            return null;
        } catch (error) {
            console.error('Error accessing localStorage:', error);
            return null;
        }
    }

    function removeStoredEmail() {
        try {
            localStorage.removeItem('pending_email');
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    }

    // Clear result when user starts typing
    document.getElementById('code').addEventListener('input', () => {
        if (resultDiv.classList.contains('show')) {
            clearResult();
        }
    });

    // Handle successful animation completion
    confirmationSection.addEventListener('animationend', (e) => {
        if (e.animationName === 'successPulse') {
            confirmationSection.classList.remove('success-animation');
        }
    });
});

// For development/testing purposes - you can remove this in production
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('Development mode: Using demo API endpoints');
    // You can add demo/mock functionality here if needed
}