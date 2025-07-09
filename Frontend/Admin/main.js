// Initialize Lucide icons
lucide.createIcons();

// Main initialization function
function initAdminDashboard() {
  // Set active navigation based on current page
  setActiveNav();

  // Initialize sidebar functionality
  initSidebar();

  // Initialize responsive behavior
  initResponsiveSidebar();

  // Initialize notification system
  updateNotificationBadge();

  // Set up search functionality
  initSearch();

  // Other initializations
  updateStats();
}

// Set active navigation based on current page
function setActiveNav() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll(".nav-links li a");

  navLinks.forEach((link) => {
    if (link.href && new URL(link.href).pathname === currentPath) {
      link.classList.add("active");
      link.parentElement.classList.add("active");
    } else {
      link.classList.remove("active");
      link.parentElement.classList.remove("active");
    }
  });
}

// Sidebar functionality
function initSidebar() {
  const sidebar = document.getElementById("sidebar");
  const openNav = document.getElementById("openNav");
  const closeNav = document.getElementById("closeNav");
  const mainContent = document.querySelector(".main-content");

  if (openNav) {
    openNav.addEventListener("click", () => {
      sidebar.classList.remove("collapsed");
      mainContent.style.marginLeft = "280px"; // Or use CSS variable --sidebar-width
    });
  }

  if (closeNav) {
    closeNav.addEventListener("click", () => {
      sidebar.classList.add("collapsed");
      mainContent.style.marginLeft = "0";
    });
  }

  // Close sidebar when clicking outside on mobile
  document.addEventListener("click", (e) => {
    if (
      window.innerWidth <= 1024 &&
      !sidebar.classList.contains("collapsed") &&
      !sidebar.contains(e.target) &&
      e.target !== openNav
    ) {
      sidebar.classList.add("collapsed");
      mainContent.style.marginLeft = "0";
    }
  });
}

// Responsive sidebar behavior
function initResponsiveSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");

  function handleResize() {
    if (window.innerWidth <= 768) {
      sidebar.classList.add("collapsed");
      mainContent.style.marginLeft = "70px";
    } else {
      sidebar.classList.remove("collapsed");
      mainContent.style.marginLeft = "280px";
    }
  }

  // Initial check
  handleResize();

  // Add resize listener
  window.addEventListener("resize", handleResize);
}

// Notification system
let notificationCount = 3;
function updateNotificationBadge() {
  const badge = document.querySelector(".badge");
  if (badge) {
    badge.textContent = notificationCount;
    badge.style.display = notificationCount > 0 ? "block" : "none";

    // Add click handler for notifications
    document.querySelector(".notifications").addEventListener("click", () => {
      console.log("Toggle notifications panel");
      // Implement actual notification panel toggle here
    });
  }
}

// Search functionality
function initSearch() {
  const searchInput = document.querySelector(".search-bar input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase();
      console.log(`Searching for: ${searchTerm}`);
      // Implement actual search functionality here
    });
  }
}

// Mock data for statistics
const mockStats = {
  totalFIRs: {
    today: 42,
    thisWeek: 287,
    thisMonth: 1150,
  },
  usersRegistered: 2543,
  crimesResolved: 1562,
  pendingCases: 128,
};

// Update statistics display
function updateStats() {
  console.log("Updating admin statistics");
  // Implement actual stats update here
  console.log(mockStats);
}

// Auto-update timestamps (if needed)
function updateTimestamps() {
  const times = document.querySelectorAll(".time");
  times.forEach((time) => {
    // Update relative time (implement as needed)
  });
}

// Initialize timestamps update interval
setInterval(updateTimestamps, 60000); // Update every minute

// Initialize the dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", initAdminDashboard);
