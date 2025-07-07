document.addEventListener('DOMContentLoaded', () => {
  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');
  const forgotForm = document.getElementById('forgot-form');
  const resetForm = document.getElementById('reset-form');
  const resultDiv = document.getElementById('reset-result');

  let emailForReset = '';

  // Helper to show messages and always make result visible
  function showResult(msg, type = "info") {
    resultDiv.textContent = msg;
    resultDiv.className = `result-message ${type}`;
    resultDiv.style.display = "";
  }

  // Helper to hide result message
  function hideResult() {
    resultDiv.textContent = "";
    resultDiv.style.display = "none";
  }

  // ---- STEP 1: Request reset code ----
  forgotForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideResult();

    const email = document.getElementById('reset-email').value.trim();

    if (!email) {
      showResult("Please enter your email.", "error");
      return;
    }

    try {
      // Tauri backend: request_reset_command should send the email and return {success, error}
      const data = await window.__TAURI__.tauri.invoke('request_reset_command', { payload: { email } });

      if (data.success) {
        showResult("Reset code sent! Check your email.", "success");
        step1.style.display = 'none';
        step2.style.display = '';
        emailForReset = email;
      } else {
        showResult(data.error || "Error. Try again.", "error");
      }
    } catch (err) {
      showResult("App error. Try again.", "error");
      console.error(err);
    }
  });

  // ---- STEP 2: Submit new password + code ----
  resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideResult();

    const code = document.getElementById('reset-code').value.trim();
    const password = document.getElementById('reset-password').value;
    const confirm = document.getElementById('reset-confirm').value;

    if (!code) {
      showResult("Enter the verification code.", "error");
      return;
    }

    if (!password || !confirm) {
      showResult("Enter and confirm your new password.", "error");
      return;
    }

    if (password !== confirm) {
      showResult("Passwords do not match!", "error");
      return;
    }

    try {
      // Tauri backend: reset_password_command should return {success, error}
      const data = await window.__TAURI__.tauri.invoke('reset_password_command', {
        payload: { email: emailForReset, code, password }
      });

      if (data.success) {
        showResult("Password updated! Redirecting to login...", "success");
        setTimeout(() => window.location.href = "login.html", 2000);
      } else {
        showResult(data.error || "Error. Try again.", "error");
      }
    } catch (err) {
      showResult("App error. Try again.", "error");
      console.error(err);
    }
  });
});