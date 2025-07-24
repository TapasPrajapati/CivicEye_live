// auth_passing.js - Authentication System
const authUtils = {
  // Session configuration
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  WARNING_TIME: 5 * 60 * 1000, // 5 minutes before timeout

  // Store authentication data
  setAuthData: function (token, userData) {
    const authData = {
      token,
      userData,
      timestamp: new Date().getTime(),
    };
    sessionStorage.setItem("authData", JSON.stringify(authData));
  },

  // Retrieve valid auth data
  getAuthData: function () {
    const authString = sessionStorage.getItem("authData");
    if (!authString) return null;

    const authData = JSON.parse(authString);
    const currentTime = new Date().getTime();

    // Check if session expired
    if (currentTime - authData.timestamp > this.SESSION_TIMEOUT) {
      this.clearAuthData();
      return null;
    }

    // Update timestamp to extend session
    authData.timestamp = currentTime;
    sessionStorage.setItem("authData", JSON.stringify(authData));

    return authData;
  },

  // Clear authentication data
  clearAuthData: function () {
    sessionStorage.removeItem("authData");
  },

  // Verify authentication with server
  checkAuth: async function () {
    const authData = this.getAuthData();
    if (!authData) return false;

    try {
      const response = await fetch("http://localhost:5000/api/auth/verify", {
        headers: {
          Authorization: `Bearer ${authData.token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        return authData.userData;
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    }

    this.clearAuthData();
    return false;
  },

  // Update UI for logged-in user
  updateUIForLoggedInUser: function (userData) {
    // Hide login/register buttons
    const openLoginBtn = document.getElementById("openLoginBtn");
    const showLoginBtn = document.getElementById("showLogin");
    if (openLoginBtn) openLoginBtn.style.display = "none";
    if (showLoginBtn) showLoginBtn.style.display = "none";

    // Show profile section
    const profileSection = document.getElementById("profileSection");
    if (profileSection) {
      profileSection.style.display = "block";

      // Update profile button with user initial
      const profileBtn = document.getElementById("profileBtn");
      if (profileBtn) {
        const initial = userData.data.name.charAt(0).toUpperCase();
        profileBtn.innerHTML = `<span class="profile-initial">${initial}</span>`;

        // Create hover dropdown
        this.createProfileDropdown(profileBtn, userData);
      }
    }

    // Auto-fill user details in forms if available
    this.autoFillUserData(userData);
  },

  // Auto-fill user data in forms
  autoFillUserData: function (userData) {
    const nameField = document.getElementById("name");
    const emailField = document.getElementById("email");
    const phoneField = document.getElementById("phone");

    if (nameField) nameField.value = userData.data.name || "";
    if (emailField) emailField.value = userData.data.email || "";
    if (phoneField)
      phoneField.value = userData.data.mobile || userData.data.phone || "";

    // Make fields read-only if they're auto-filled
    if (nameField && nameField.value) nameField.readOnly = true;
    if (emailField && emailField.value) emailField.readOnly = true;
    if (phoneField && phoneField.value) phoneField.readOnly = true;
  },

  // Create profile dropdown
  createProfileDropdown: function (profileBtn, userData) {
    const existingDropdown = document.getElementById("profileDropdown");
    if (existingDropdown) existingDropdown.remove();

    const dropdown = document.createElement("div");
    dropdown.id = "profileDropdown";
    dropdown.className = "profile-dropdown";

    const initial = userData.data.name.charAt(0).toUpperCase();
    let dropdownHTML = `
      <div class="dropdown-header">
        <div class="dropdown-avatar">
          <span class="avatar-initial">${initial}</span>
        </div>
        <div class="dropdown-user-info">
          <div class="user-name">${userData.data.name}</div>
          <div class="user-email">${userData.data.email}</div>
        </div>
        <button class="dropdown-close" id="dropdownClose">
          <i data-lucide="x"></i>
        </button>
      </div>
      <div class="dropdown-divider"></div>
      <div class="dropdown-details">
    `;

    if (userData.type === "police") {
      dropdownHTML += `
        <div class="detail-item">
          <span class="detail-label">Rank:</span>
          <span class="detail-value">${userData.data.rank || "N/A"}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Station:</span>
          <span class="detail-value">${userData.data.station || "N/A"}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Police ID:</span>
          <span class="detail-value">${userData.data.policeId || "N/A"}</span>
        </div>
      `;
    } else {
      dropdownHTML += `
        <div class="detail-item">
          <span class="detail-label">Mobile:</span>
          <span class="detail-value">${userData.data.mobile || userData.data.phone || "N/A"
        }</span>
        </div>
        ${userData.data.age
          ? `
        <div class="detail-item">
          <span class="detail-label">Age:</span>
          <span class="detail-value">${userData.data.age}</span>
        </div>
        `
          : ""
        }
      `;
    }

    dropdownHTML += `
      </div>
      <div class="dropdown-divider"></div>
      <button class="dropdown-logout" id="dropdownLogout">
        <i data-lucide="log-out"></i>
        Logout
      </button>
    `;

    dropdown.innerHTML = dropdownHTML;
    document.body.appendChild(dropdown);

    // Position dropdown
    this.positionDropdown(profileBtn, dropdown);

    // Add event listeners
    this.setupDropdownEvents(profileBtn, dropdown);
  },

  // Position dropdown relative to profile button
  positionDropdown: function (profileBtn, dropdown) {
    const btnRect = profileBtn.getBoundingClientRect();
    dropdown.style.position = "fixed";
    dropdown.style.top = `${btnRect.bottom + 8}px`;
    dropdown.style.right = `${window.innerWidth - btnRect.right}px`;
    dropdown.style.zIndex = "1001";
  },

  // Setup dropdown event listeners
  setupDropdownEvents: function (profileBtn, dropdown) {
    let isVisible = false;
    let hideTimeout;

    profileBtn.addEventListener("mouseenter", () => {
      clearTimeout(hideTimeout);
      dropdown.style.display = "block";
      dropdown.style.opacity = "1";
      dropdown.style.transform = "translateY(0)";
      isVisible = true;
    });

    profileBtn.addEventListener("mouseleave", () => {
      hideTimeout = setTimeout(() => {
        if (!dropdown.matches(":hover")) {
          dropdown.style.opacity = "0";
          dropdown.style.transform = "translateY(-10px)";
          setTimeout(() => {
            dropdown.style.display = "none";
          }, 200);
          isVisible = false;
        }
      }, 100);
    });

    dropdown.addEventListener("mouseenter", () => {
      clearTimeout(hideTimeout);
    });

    dropdown.addEventListener("mouseleave", () => {
      dropdown.style.opacity = "0";
      dropdown.style.transform = "translateY(-10px)";
      setTimeout(() => {
        dropdown.style.display = "none";
      }, 200);
      isVisible = false;
    });

    // Close button
    const closeBtn = dropdown.querySelector("#dropdownClose");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        dropdown.style.opacity = "0";
        dropdown.style.transform = "translateY(-10px)";
        setTimeout(() => {
          dropdown.style.display = "none";
        }, 200);
      });
    }

    // Logout button
    const logoutBtn = dropdown.querySelector("#dropdownLogout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        this.handleLogout();
      });
    }
  },

  // Handle logout
  handleLogout: function () {
    this.clearAuthData();

    const authData = this.getAuthData();
    if (authData && authData.token) {
      fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      }).catch((error) => console.error("Logout error:", error));
    }

    window.location.reload();
  },

  // Show session expiration warning
  showSessionWarning: function () {
    setTimeout(() => {
      if (this.getAuthData()) {
        const extend = confirm(
          "Your session will expire in 5 minutes. Would you like to stay logged in?"
        );
        if (extend) {
          const authData = this.getAuthData();
          if (authData) {
            this.setAuthData(authData.token, authData.userData);
            this.showSessionWarning();
          }
        } else {
          this.handleLogout();
        }
      }
    }, this.SESSION_TIMEOUT - this.WARNING_TIME);
  },

  // Initialize inactivity timer
  initInactivityTimer: function () {
    let inactivityTimer;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        this.handleLogout();
      }, this.SESSION_TIMEOUT);
    };

    ["click", "mousemove", "keypress", "scroll", "touchstart"].forEach(
      (event) => {
        document.addEventListener(event, resetTimer);
      }
    );

    resetTimer();
  },
};

// Initialize authentication when DOM is loaded
document.addEventListener("DOMContentLoaded", async function () {
  authUtils.initInactivityTimer();

  const userData = await authUtils.checkAuth();
  if (userData) {
    authUtils.updateUIForLoggedInUser(userData);
    authUtils.showSessionWarning();
  }

  // Close dropdown when clicking outside
  document.addEventListener("click", function (e) {
    const profileDropdown = document.getElementById("profileDropdown");
    const profileBtn = document.getElementById("profileBtn");

    if (
      profileDropdown &&
      profileBtn &&
      !profileBtn.contains(e.target) &&
      !profileDropdown.contains(e.target)
    ) {
      profileDropdown.style.opacity = "0";
      profileDropdown.style.transform = "translateY(-10px)";
      setTimeout(() => {
        profileDropdown.style.display = "none";
      }, 200);
    }
  });

  // Initialize Lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }
});

// Make authUtils available globally
window.authUtils = authUtils;
