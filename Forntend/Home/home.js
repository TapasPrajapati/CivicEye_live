// Initialize Lucide icons (do this *once* at the beginning)
lucide.createIcons();
async function fixSidebarVisibility() {
  const sidebar = $0.parentElement;
  await setElementStyles(sidebar, {
    transform: 'none',
    left: '0px',
  });
}
fixSidebarVisibility();
document.addEventListener('DOMContentLoaded', () => {
    const openNav = document.getElementById('openNav');
    const closeNav = document.getElementById('closeNav');
    const mainContent = document.querySelector('.main-content');
    const closeButton = document.querySelector('#sidebar .close-button');
    const sidebar = document.getElementById('sidebar');

    // Open sidebar
    openNav.addEventListener('click', () => {
        sidebar.classList.add('open');
    });

    // Close sidebar 
    closeNav.addEventListener('click', () => {
        sidebar.classList.remove('open');
    });

    closeButton.addEventListener('click',()=>{
      sidebar.style.display = 'none';
    })

    // Close sidebar if clicked outside on smaller screens
    window.addEventListener('click', (event) => {
        if (
            window.innerWidth <= 1024 &&
            sidebar.classList.contains('open') &&
            !sidebar.contains(event.target) &&
            !openNav.contains(event.target)
        ) {
            sidebar.classList.remove('open');
        }
    });

    // Smooth scroll for anchor links (no changes needed here)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Handle window resize (improved)
    window.addEventListener('resize', () => {
        // Check if the sidebar is open and the window is resized to larger than 1024px
        if (sidebar.classList.contains('open') && window.innerWidth > 1024) {
            sidebar.classList.remove('open');
        }
    });
});
