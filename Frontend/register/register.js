// Initialize Lucide icons
lucide.createIcons();

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    // Toggle password visibility
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Toggle icon
        const icon = togglePassword.querySelector('i');
        icon.setAttribute('data-lucide', type === 'password' ? 'eye' : 'eye-off');
        lucide.createIcons();
    });

    // Password strength checker
    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const strength = checkPasswordStrength(password);
        updatePasswordStrength(strength);
    });

    // Handle form submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = registerForm.querySelector('.btn-primary');
        
        // Validate passwords match
        if (passwordInput.value !== confirmPasswordInput.value) {
            alert('Passwords do not match');
            return;
        }

        // Disable button and show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i data-lucide="loader"></i> Creating Account...';
        lucide.createIcons();

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Redirect to login
            window.location.href = '../login/login.html';
        } catch (error) {
            alert('An error occurred. Please try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Account';
        }
    });
});

function checkPasswordStrength(password) {
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);
    const length = password.length;

    if (length < 8) return 'weak';
    if (hasLower && hasUpper && hasNumber && hasSpecial && length >= 12) return 'strong';
    if ((hasLower || hasUpper) && hasNumber) return 'medium';
    return 'weak';
}

function updatePasswordStrength(strength) {
    const container = document.querySelector('.password-strength');
    if (!container) {
        const div = document.createElement('div');
        div.className = `password-strength ${strength}`;
        div.textContent = `Password strength: ${strength}`;
        passwordInput.parentElement.insertAdjacentElement('afterend', div);
    } else {
        container.className = `password-strength ${strength}`;
        container.textContent = `Password strength: ${strength}`;
    }
}