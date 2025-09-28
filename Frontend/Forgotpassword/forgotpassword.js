document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const emailForm = document.getElementById('emailForm');
  const verificationForm = document.getElementById('verificationForm');
  const passwordForm = document.getElementById('passwordForm');
  const emailInput = document.getElementById('email');
  const emailDisplay = document.getElementById('emailDisplay');
  const codeInputs = document.querySelectorAll('.code-input');
  const verificationCode = document.getElementById('verificationCode');
  const newPasswordInput = document.getElementById('newPassword');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const toggleNewPassword = document.getElementById('toggleNewPassword');
  const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
  const strengthProgress = document.querySelector('.strength-progress');
  const strengthValue = document.getElementById('strengthValue');
  const passwordMatch = document.getElementById('passwordMatch');
  const sendCodeBtn = document.getElementById('sendCodeBtn');
  const verifyCodeBtn = document.getElementById('verifyCodeBtn');
  const resetPasswordBtn = document.getElementById('resetPasswordBtn');
  const backToLogin = document.getElementById('backToLogin');
  const backToEmail = document.getElementById('backToEmail');
  const resendCode = document.getElementById('resendCode');
  const countdown = document.getElementById('countdown');
  const successLoginBtn = document.getElementById('successLoginBtn');
  const BACKEND_URL = 'https://civiceye-4-q1te.onrender.com'; 
  
  // State variables
  let currentStep = 1;
  let userEmail = '';
  let verificationToken = '';
  let countdownInterval;
  let resendTimeout = 60;
  
  // Initialize the page
  init();
  
  function init() {
    // Set up event listeners
    setupEventListeners();
    
    // Check if there's an email in session storage (for page refresh)
    const savedEmail = sessionStorage.getItem('resetEmail');
    if (savedEmail) {
      userEmail = savedEmail;
      emailInput.value = userEmail;
      goToStep(2);
    }
  }
  
  function setupEventListeners() {
    // Email form submission
    emailForm.addEventListener('submit', handleEmailSubmit);
    
    // Verification code input handling
    codeInputs.forEach(input => {
      input.addEventListener('input', handleCodeInput);
      input.addEventListener('keydown', handleCodeNavigation);
      input.addEventListener('paste', handleCodePaste);
    });
    
    // Verification form submission
    verificationForm.addEventListener('submit', handleVerificationSubmit);
    
    // Password form submission
    passwordForm.addEventListener('submit', handlePasswordSubmit);
    
    // Password visibility toggles
    toggleNewPassword.addEventListener('click', () => togglePasswordVisibility(newPasswordInput, toggleNewPassword));
    toggleConfirmPassword.addEventListener('click', () => togglePasswordVisibility(confirmPasswordInput, toggleConfirmPassword));
    
    // Password strength checking
    newPasswordInput.addEventListener('input', checkPasswordStrength);
    confirmPasswordInput.addEventListener('input', checkPasswordMatch);
    
    // Navigation
    backToLogin.addEventListener('click', handleBackToLogin);
    backToEmail.addEventListener('click', handleBackToEmail);
    resendCode.addEventListener('click', handleResendCode);
    successLoginBtn.addEventListener('click', handleBackToLogin);
  }
  
  // Form submission handlers
  async function handleEmailSubmit(e) {
    e.preventDefault();
    
    userEmail = emailInput.value.trim();
    
    if (!validateEmail(userEmail)) {
      showMessage('Please enter a valid email address.', 'error');
      return;
    }
    
    try {
      setButtonLoading(sendCodeBtn, true);
      
      // API call to request password reset
      const response = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: userEmail })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Save email to session storage in case of page refresh
        sessionStorage.setItem('resetEmail', userEmail);
        
        // Show success message and move to next step
        showMessage('Verification code sent to your email.', 'success');
        setTimeout(() => {
          goToStep(2);
          startCountdown();
        }, 1500);
      } else {
        throw new Error(data.message || 'Failed to send verification code');
      }
    } catch (error) {
      showMessage(error.message || 'An error occurred. Please try again.', 'error');
    } finally {
      setButtonLoading(sendCodeBtn, false);
    }
  }
  
  async function handleVerificationSubmit(e) {
    e.preventDefault();
    
    const code = Array.from(codeInputs).map(input => input.value).join('');
    
    if (code.length !== 6) {
      showMessage('Please enter the complete 6-digit code.', 'error');
      return;
    }
    
    try {
      setButtonLoading(verifyCodeBtn, true);
      
      // API call to verify code
      const response = await fetch(`${BACKEND_URL}/api/auth/verify-reset-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: userEmail, 
          code: code 
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        verificationToken = data.token;
        goToStep(3);
      } else {
        throw new Error(data.message || 'Invalid verification code');
      }
    } catch (error) {
      showMessage(error.message || 'Verification failed. Please try again.', 'error');
    } finally {
      setButtonLoading(verifyCodeBtn, false);
    }
  }
  
  async function handlePasswordSubmit(e) {
    e.preventDefault();
    
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (newPassword !== confirmPassword) {
      showMessage('Passwords do not match.', 'error');
      return;
    }
    
    if (!isPasswordStrong(newPassword)) {
      showMessage('Please choose a stronger password.', 'error');
      return;
    }
    
    try {
      setButtonLoading(resetPasswordBtn, true);
      
      // API call to reset password
      const response = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${verificationToken}`
        },
        body: JSON.stringify({ 
          email: userEmail, 
          newPassword: newPassword 
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Clear stored email and show success
        sessionStorage.removeItem('resetEmail');
        
        // Hide form and show success message
        document.getElementById('step3').style.display = 'none';
        document.getElementById('successMessage').style.display = 'block';
      } else {
        throw new Error(data.message || 'Failed to reset password');
      }
    } catch (error) {
      showMessage(error.message || 'An error occurred. Please try again.', 'error');
    } finally {
      setButtonLoading(resetPasswordBtn, false);
    }
  }
  
  // Helper functions
  function goToStep(step) {
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(el => {
      el.classList.remove('active');
    });
    
    // Update progress indicator
    document.querySelectorAll('.progress-indicator .step').forEach(el => {
      el.classList.remove('active');
    });
    
    // Show current step and update progress
    document.getElementById(`step${step}`).classList.add('active');
    document.querySelector(`.progress-indicator .step[data-step="${step}"]`).classList.add('active');
    
    currentStep = step;
    
    // Step-specific initialization
    if (step === 2) {
      emailDisplay.textContent = userEmail;
      // Focus on first code input
      setTimeout(() => codeInputs[0].focus(), 100);
    } else if (step === 3) {
      // Focus on password field
      setTimeout(() => newPasswordInput.focus(), 100);
    }
  }
  
  function handleCodeInput(e) {
    const input = e.target;
    const index = parseInt(input.getAttribute('data-index'));
    
    // Move to next input if current input has a value
    if (input.value.length === 1 && index < 5) {
      codeInputs[index + 1].focus();
    }
    
    // Update the hidden input with the complete code
    updateVerificationCode();
    
    // Enable verify button if all inputs are filled
    const allFilled = Array.from(codeInputs).every(input => input.value.length === 1);
    verifyCodeBtn.disabled = !allFilled;
    
    // Add filled class for styling
    if (input.value.length === 1) {
      input.classList.add('filled');
    } else {
      input.classList.remove('filled');
    }
  }
  
  function handleCodeNavigation(e) {
    const input = e.target;
    const index = parseInt(input.getAttribute('data-index'));
    
    // Handle backspace
    if (e.key === 'Backspace' && input.value === '' && index > 0) {
      codeInputs[index - 1].focus();
    }
  }
  
  function handleCodePaste(e) {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, 6);
    
    // Fill inputs with pasted data
    for (let i = 0; i < pasteData.length; i++) {
      if (i < codeInputs.length) {
        codeInputs[i].value = pasteData[i];
        codeInputs[i].classList.add('filled');
      }
    }
    
    // Focus on next empty input or last input
    if (pasteData.length < 6) {
      codeInputs[pasteData.length].focus();
    } else {
      codeInputs[5].focus();
    }
    
    updateVerificationCode();
    
    // Enable verify button if all inputs are filled
    const allFilled = Array.from(codeInputs).every(input => input.value.length === 1);
    verifyCodeBtn.disabled = !allFilled;
  }
  
  function updateVerificationCode() {
    verificationCode.value = Array.from(codeInputs).map(input => input.value).join('');
  }
  
  function startCountdown() {
    clearInterval(countdownInterval);
    resendCode.style.pointerEvents = 'none';
    resendCode.style.opacity = '0.5';
    resendTimeout = 60;
    
    updateCountdownText();
    
    countdownInterval = setInterval(() => {
      resendTimeout--;
      updateCountdownText();
      
      if (resendTimeout <= 0) {
        clearInterval(countdownInterval);
        resendCode.style.pointerEvents = 'auto';
        resendCode.style.opacity = '1';
        countdown.textContent = '';
      }
    }, 1000);
  }
  
  function updateCountdownText() {
    const seconds = resendTimeout.toString().padStart(2, '0');
    countdown.textContent = `(00:${seconds})`;
  }
  
  async function handleResendCode(e) {
    e.preventDefault();
    
    try {
      // API call to resend code
      const response = await fetch(`${BACKEND_URL}/api/auth/resend-reset-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: userEmail })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showMessage('Verification code resent to your email.', 'success');
        startCountdown();
      } else {
        throw new Error(data.message || 'Failed to resend verification code');
      }
    } catch (error) {
      showMessage(error.message || 'An error occurred. Please try again.', 'error');
    }
  }
  
  function checkPasswordStrength() {
    const password = newPasswordInput.value;
    let strength = 0;
    let message = 'None';
    
    if (password.length >= 8) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;
    
    // Update progress bar
    strengthProgress.style.width = `${strength}%`;
    
    // Update text and color
    if (strength <= 20) {
      strengthProgress.style.background = '#ef4444';
      message = 'Weak';
    } else if (strength <= 60) {
      strengthProgress.style.background = '#f59e0b';
      message = 'Medium';
    } else {
      strengthProgress.style.background = '#10b981';
      message = 'Strong';
    }
    
    strengthValue.textContent = message;
  }
  
  function checkPasswordMatch() {
    const password = newPasswordInput.value;
    const confirm = confirmPasswordInput.value;
    
    if (confirm.length === 0) {
      passwordMatch.textContent = '';
      passwordMatch.className = 'password-match';
      return;
    }
    
    if (password === confirm) {
      passwordMatch.textContent = 'Passwords match';
      passwordMatch.className = 'password-match';
      passwordMatch.style.color = '#10b981';
    } else {
      passwordMatch.textContent = 'Passwords do not match';
      passwordMatch.className = 'password-match';
      passwordMatch.style.color = '#ef4444';
    }
  }
  
  function togglePasswordVisibility(input, button) {
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';

  // Find icon (works even if lucide replaced <i> with <svg>)
  const icon = button.querySelector('[data-lucide]');
  if (!icon) return; // safety check

  icon.setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
  lucide.createIcons();
}

  
  function handleBackToLogin(e) {
    e.preventDefault();
    // Redirect to login page
    window.location.href = '/Frontend/landing/index.html';
  }
  
  function handleBackToEmail(e) {
    e.preventDefault();
    goToStep(1);
  }
  
  function setButtonLoading(button, isLoading) {
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');
    
    if (isLoading) {
      btnText.style.opacity = '0';
      btnLoader.style.display = 'block';
      button.disabled = true;
    } else {
      btnText.style.opacity = '1';
      btnLoader.style.display = 'none';
      button.disabled = false;
    }
  }
  
  function showMessage(text, type) {
    // Remove any existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message element
    const message = document.createElement('div');
    message.className = `message ${type}`;
    
    // Add appropriate icon based on message type
    let iconName = 'info';
    if (type === 'error') iconName = 'alert-circle';
    if (type === 'success') iconName = 'check-circle';
    
    message.innerHTML = `
      <i data-lucide="${iconName}"></i>
      <span>${text}</span>
    `;
    
    // Insert message at the top of the current step
    const currentStepEl = document.getElementById(`step${currentStep}`);
    currentStepEl.insertBefore(message, currentStepEl.firstChild);
    
    // Render icons
    lucide.createIcons();
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (message.parentNode) {
        message.style.opacity = '0';
        message.style.transition = 'opacity 0.3s ease';
        setTimeout(() => message.remove(), 300);
      }
    }, 5000);
}

  
  // Validation functions
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
  
  function isPasswordStrong(password) {
    // At least 8 characters, one uppercase, one lowercase, one number
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return strongRegex.test(password);
  }
});