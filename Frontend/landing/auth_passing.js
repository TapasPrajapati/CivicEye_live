// Fixed auth_passing.js - Use ONLY sessionStorage consistently
const authUtils = {
  // Session configuration
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  WARNING_TIME: 5 * 60 * 1000, // 5 minutes before timeout

  // Store authentication data (ONLY sessionStorage)
  setAuthData: function (token, userData) {
    const authData = {
      token,
      userData,
      timestamp: new Date().getTime(),
    };
    sessionStorage.setItem("authData", JSON.stringify(authData));
    console.log("Auth data stored in sessionStorage:", authData);
  },

  // Retrieve valid auth data
  getAuthData: function () {
    const authString = sessionStorage.getItem("authData");
    if (!authString) return null;

    try {
      const authData = JSON.parse(authString);
      const currentTime = new Date().getTime();

      // Check if session expired
      if (currentTime - authData.timestamp > this.SESSION_TIMEOUT) {
        console.log("Session expired, clearing auth data");
        this.clearAuthData();
        return null;
      }

      // Update timestamp to extend session
      authData.timestamp = currentTime;
      sessionStorage.setItem("authData", JSON.stringify(authData));

      return authData;
    } catch (error) {
      console.error("Error parsing auth data:", error);
      this.clearAuthData();
      return null;
    }
  },

  // Clear authentication data
  clearAuthData: function () {
    sessionStorage.removeItem("authData");
    // Also clear any old localStorage data for migration
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    console.log("Auth data cleared");
  },

  // Verify authentication with server
  checkAuth: async function () {
    const authData = this.getAuthData();
    if (!authData) {
      console.log("No auth data found");
      return false;
    }

    try {
      const response = await fetch("https://civiceye-4-q1te.onrender.com/api/auth/verify", {
        headers: {
          Authorization: `Bearer ${authData.token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        console.log("Auth verification successful");
        return authData.userData;
      } else {
        console.log("Auth verification failed:", response.status);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    }

    this.clearAuthData();
    return false;
  },

  updateUIForLoggedInUser: function (userData) {
    console.log("Updating UI for logged in user:", userData);

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

    if (nameField && userData.data.name) {
      nameField.value = userData.data.name;
      nameField.readOnly = true;
    }
    if (emailField && userData.data.email) {
      emailField.value = userData.data.email;
      emailField.readOnly = true;
    }
    if (phoneField && (userData.data.mobile || userData.data.phone)) {
      phoneField.value = userData.data.mobile || userData.data.phone;
      phoneField.readOnly = true;
    }
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
          <span class="detail-value">${userData.data.mobile || userData.data.phone || "N/A"}</span>
        </div>
        ${userData.data.age ? `
        <div class="detail-item">
          <span class="detail-label">Age:</span>
          <span class="detail-value">${userData.data.age}</span>
        </div>
        ` : ""}
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
    console.log("Logging out user");
    
    // Clear auth data first
    this.clearAuthData();

    // Show login/register buttons
    const openLoginBtn = document.getElementById("openLoginBtn");
    const showLoginBtn = document.getElementById("showLogin");
    if (openLoginBtn) openLoginBtn.style.display = "block";
    if (showLoginBtn) showLoginBtn.style.display = "block";

    // Hide profile section
    const profileSection = document.getElementById("profileSection");
    if (profileSection) profileSection.style.display = "none";

    // Remove dropdown
    const dropdown = document.getElementById("profileDropdown");
    if (dropdown) dropdown.remove();

    // Close any open modals
    const modals = document.querySelectorAll(".login-modal");
    modals.forEach(modal => modal.classList.remove("active"));

    // Reload the page to reset everything
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }
};

// Initialize authentication when DOM is loaded
document.addEventListener("DOMContentLoaded", async function () {
  console.log("Initializing authentication system");

  const userData = await authUtils.checkAuth();
  if (userData) {
    console.log("User is logged in:", userData);
    authUtils.updateUIForLoggedInUser(userData);
  } else {
    console.log("User is not logged in");
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