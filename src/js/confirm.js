document.addEventListener('DOMContentLoaded', async () => {
    // Elements
    const userEmailDisplay = document.getElementById('user-email');
    const form = document.getElementById('confirm-form');
    const resultDiv = document.getElementById('result');
    const verifyBtn = document.getElementById('verify-btn');
    const btnText = verifyBtn.querySelector('.btn-text');
    const btnSpinner = verifyBtn.querySelector('.btn-spinner');
    const confirmationSection = document.getElementById('confirmation-section');

    // Get email from backend
    let email = '';
    try {
        email = await window.__TAURI__.tauri.invoke('get_pending_email');
        if (email) {
            userEmailDisplay.textContent = email;
        } else {
            userEmailDisplay.textContent = 'your email address';
        }
    } catch (err) {
        userEmailDisplay.textContent = 'your email address';
        email = '';
    }

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
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
            // Call Tauri backend (Rust) to verify
            const data = await window.__TAURI__.tauri.invoke('confirm_email_command', {
                payload: { email, code }
            });

            if (data.success) {
                showResult(data.message || "Email verified! You can now log in.", 'success');
                confirmationSection.classList.add('success-animation');

                // Remove stored email after success
                await window.__TAURI__.tauri.invoke('clear_auth_data');

                setTimeout(() => {
                    window.location.href = "login.html";
                }, 2000);
            } else {
                showResult(data.error || "Verification failed. Please try again.", 'error');
                confirmationSection.classList.add('error-animation');
                setTimeout(() => {
                    confirmationSection.classList.remove('error-animation');
                }, 600);
            }
        } catch (err) {
            showResult("App error. Please try again.", 'error');
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