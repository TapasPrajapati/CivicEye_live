// Initialize Lucide icons
lucide.createIcons();

document.addEventListener('DOMContentLoaded', function () {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('nav li a');

    navLinks.forEach(link => {
        const linkPath = new URL(link.href, window.location.origin).pathname;
        if (linkPath === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Sidebar functionality
    const sidebar = document.getElementById('sidebar');
    const openNav = document.getElementById('openNav');
    const closeNav = document.getElementById('closeNav');

    if (openNav) {
        openNav.addEventListener('click', () => {
            sidebar.classList.add('open');
        });
    }

    if (closeNav) {
        closeNav.addEventListener('click', () => {
            sidebar.classList.remove('open');
        });
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 1024 &&
            sidebar.classList.contains('open') &&
            !sidebar.contains(e.target) &&
            !openNav.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    });

    // Emergency button pulse animation
    const emergencyBtn = document.querySelector('.btn-emergency');
    if (emergencyBtn) {
        emergencyBtn.addEventListener('mouseenter', () => {
            emergencyBtn.style.animation = 'pulse 1s infinite';
        });
        emergencyBtn.addEventListener('mouseleave', () => {
            emergencyBtn.style.animation = 'none';
        });
    }

    // Add CSS animation for pulse effect
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);

    // Quick action buttons hover effect
    const actionBtns = document.querySelectorAll('.action-btn');
    actionBtns.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'translateY(-2px)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translateY(0)';
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

