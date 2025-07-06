import { API_BASE_URL } from './api.js';

const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const forgotForm = document.getElementById('forgot-form');
const resetForm = document.getElementById('reset-form');
const resultDiv = document.getElementById('reset-result');

let emailForReset = '';

forgotForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('reset-email').value.trim();
  resultDiv.textContent = '';
  resultDiv.className = 'result-message';
  try {
    const res = await fetch(`${API_BASE_URL}/request-reset`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (res.ok) {
      resultDiv.textContent = "Reset code sent! Check your email.";
      resultDiv.classList.add('success');
      step1.style.display = 'none';
      step2.style.display = '';
      emailForReset = email;
    } else {
      resultDiv.textContent = data.error || "Error. Try again.";
      resultDiv.classList.add('error');
    }
  } catch (err) {
    resultDiv.textContent = "Network error. Try again.";
    resultDiv.classList.add('error');
  }
});

resetForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const code = document.getElementById('reset-code').value.trim();
  const password = document.getElementById('reset-password').value;
  const confirm = document.getElementById('reset-confirm').value;
  resultDiv.textContent = '';
  resultDiv.className = 'result-message';

  if (password !== confirm) {
    resultDiv.textContent = "Passwords do not match!";
    resultDiv.classList.add('error');
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/reset-password`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ email: emailForReset, code, password })
    });
    const data = await res.json();
    if (res.ok) {
      resultDiv.textContent = "Password updated! Redirecting to login...";
      resultDiv.classList.add('success');
      setTimeout(() => window.location.href = "login.html", 2000);
    } else {
      resultDiv.textContent = data.error || "Error. Try again.";
      resultDiv.classList.add('error');
    }
  } catch (err) {
    resultDiv.textContent = "Network error. Try again.";
    resultDiv.classList.add('error');
  }
});