// Sidebar toggle functionality
const sidebar = document.querySelector('.sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');

sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
});



// Navigation handling
document.querySelectorAll('.nav-links li').forEach(item => {
    item.addEventListener('click', () => {
        // Remove active class from all items
        document.querySelectorAll('.nav-links li').forEach(i => i.classList.remove('active'));
        // Add active class to clicked item
        item.classList.add('active');
        // Handle page navigation (to be implemented)
        const page = item.dataset.page;
        console.log(`Navigating to ${page}`);
    });
});

// Notifications handling
document.querySelector('.notifications').addEventListener('click', () => {
    // Toggle notifications panel (to be implemented)
    console.log('Toggle notifications panel');
});

// Mock data for statistics
const mockStats = {
    totalFIRs: {
        today: 25,
        thisWeek: 156,
        thisMonth: 642
    },
    usersRegistered: 1234,
    crimesResolved: 789,
    pendingCases: 45
};

// Update statistics
function updateStats() {
    // Update statistics (to be implemented with real data)
    console.log('Statistics updated');
}

// Search functionality
const searchInput = document.querySelector('.search-bar input');
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    // Implement search functionality
    console.log(`Searching for: ${searchTerm}`);
});

// Initialize dashboard
function initDashboard() {
    updateStats();
    // Add any other initialization logic here
}

// Call initialization function when page loads
document.addEventListener('DOMContentLoaded', initDashboard);

// Responsive sidebar toggle (for mobile devices)
function initResponsiveSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (window.innerWidth <= 768) {
        sidebar.classList.add('collapsed');
        mainContent.style.marginLeft = '70px';
    }
}

// Window resize handling
window.addEventListener('resize', () => {
    initResponsiveSidebar();
});

// Auto-update timestamps
function updateTimestamps() {
    const times = document.querySelectorAll('.time');
    times.forEach(time => {
        // Update relative time (to be implemented)
    });
}

setInterval(updateTimestamps, 60000); // Update every minute

// Mock notification system
let notificationCount = 3;
function updateNotificationBadge() {
    const badge = document.querySelector('.badge');
    badge.textContent = notificationCount;
    badge.style.display = notificationCount > 0 ? 'block' : 'none';
}

// Initial setup
updateNotificationBadge();