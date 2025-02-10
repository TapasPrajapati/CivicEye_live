// Initialize Lucide icons
lucide.createIcons();

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');

    // Toggle password visibility
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Toggle icon
        const icon = togglePassword.querySelector('i');
        icon.setAttribute('data-lucide', type === 'password' ? 'eye' : 'eye-off');
        lucide.createIcons();
    });

    // Handle form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = loginForm.querySelector('.btn-primary');
        const email = document.getElementById('email').value;
        const password = passwordInput.value;
        const remember = document.getElementById('remember').checked;

        // Disable button and show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i data-lucide="loader"></i> Signing in...';
        lucide.createIcons();

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Redirect to dashboard (replace with actual authentication logic)
            window.location.href = '../../index.html';
        } catch (error) {
            alert('Invalid credentials. Please try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign In';
        }
    });
});