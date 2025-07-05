import { API_BASE_URL } from './api.js';

const form = document.getElementById('signup-form');
const container = document.querySelector('.signup-container');
const resultDiv = document.getElementById('result');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Add loading state
    container.classList.add('loading');
    resultDiv.textContent = '';
    resultDiv.className = 'result-message';

    const name = document.getElementById('name').value.trim();
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                username,
                email,
                password
            })
        });

        const data = await response.json();

        // Remove loading state
        container.classList.remove('loading');

        if (response.ok) {
            resultDiv.textContent = data.message || 'Account created successfully!';
            resultDiv.classList.add('success');

            // Reset form on success
            form.reset();

            // Optional: Auto-redirect to login after 2 seconds
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            resultDiv.textContent = data.error || "Signup failed";
            resultDiv.classList.add('error');
        }
    } catch (err) {
        container.classList.remove('loading');
        resultDiv.textContent = "Network error. Please try again.";
        resultDiv.classList.add('error');
    }
});

// Switch to login page using event listener (no inline onclick)
document.getElementById('login-link').addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = 'login.html';
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

const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirm-password');
const strengthBar = document.getElementById('password-strength-bar');
const submitBtn = document.getElementById('submit-btn');

// Requirement indicators
const reqLength = document.getElementById('length');
const reqUpper = document.getElementById('upper');
const reqLower = document.getElementById('lower');
const reqNumber = document.getElementById('number');
const reqSpecial = document.getElementById('special');
const confirmMsg = document.getElementById('confirm-msg');

function checkPasswordStrength(pwd) {
    let score = 0;
    // 8+ chars
    if (pwd.length >= 8) {
        score++;
        reqLength.className = 'valid';
    } else {
        reqLength.className = 'invalid';
    }
    // uppercase
    if (/[A-Z]/.test(pwd)) {
        score++;
        reqUpper.className = 'valid';
    } else {
        reqUpper.className = 'invalid';
    }
    // lowercase
    if (/[a-z]/.test(pwd)) {
        score++;
        reqLower.className = 'valid';
    } else {
        reqLower.className = 'invalid';
    }
    // number
    if (/\d/.test(pwd)) {
        score++;
        reqNumber.className = 'valid';
    } else {
        reqNumber.className = 'invalid';
    }
    // special char
    if (/[^A-Za-z0-9]/.test(pwd)) {
        score++;
        reqSpecial.className = 'valid';
    } else {
        reqSpecial.className = 'invalid';
    }

    // Update strength bar
    const percent = (score / 5) * 100;
    strengthBar.style.width = percent + "%";
    if (score <= 2) strengthBar.style.background = "red";
    else if (score === 3) strengthBar.style.background = "orange";
    else if (score === 4) strengthBar.style.background = "#ffd600";
    else strengthBar.style.background = "limegreen";

    return score === 5;
}

function checkConfirm() {
    if (!confirmPassword.value) {
        confirmMsg.textContent = '';
        return false;
    }
    if (confirmPassword.value === password.value) {
        confirmMsg.textContent = 'Passwords match!';
        confirmMsg.className = 'requirements valid';
        return true;
    } else {
        confirmMsg.textContent = 'Passwords do not match';
        confirmMsg.className = 'requirements invalid';
        return false;
    }
}

// Enable submit button only when all requirements are met
function updateSubmit() {
    submitBtn.disabled = !(checkPasswordStrength(password.value) && checkConfirm());
}

password.addEventListener('input', () => {
    checkPasswordStrength(password.value);
    updateSubmit();
    checkConfirm();
});
confirmPassword.addEventListener('input', () => {
    checkConfirm();
    updateSubmit();
});

// Optional: initial disable on page load
updateSubmit();