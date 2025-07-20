// Profile Dropdown Functionality (Google Chrome Style)
const profileDropdownUtils = {
  // Create profile dropdown (Google Chrome style)
  createProfileDropdown: function(profileBtn, userData) {
    // Remove existing dropdown if any
    const existingDropdown = document.getElementById('profileDropdown');
    if (existingDropdown) existingDropdown.remove();
    
    // Create dropdown container
    const dropdown = document.createElement('div');
    dropdown.id = 'profileDropdown';
    dropdown.className = 'profile-dropdown';
    
    // Create dropdown content
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
    
    if (userData.type === 'police') {
      dropdownHTML += `
        <div class="detail-item">
          <span class="detail-label">Rank:</span>
          <span class="detail-value">${userData.data.rank || 'N/A'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Station:</span>
          <span class="detail-value">${userData.data.station || 'N/A'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Police ID:</span>
          <span class="detail-value">${userData.data.policeId || 'N/A'}</span>
        </div>
      `;
    } else {
      dropdownHTML += `
        <div class="detail-item">
          <span class="detail-label">Mobile:</span>
          <span class="detail-value">${userData.data.mobile || userData.data.phone || 'N/A'}</span>
        </div>
        ${userData.data.age ? `
        <div class="detail-item">
          <span class="detail-label">Age:</span>
          <span class="detail-value">${userData.data.age}</span>
        </div>
        ` : ''}
      `;
    }
    
    dropdownHTML += `
      </div>
      <div class="dropdown-divider"></div>
      <button class="dropdown-my-cases" id="dropdownMyCases">
        <i data-lucide="folder-open"></i>
        My Cases
      </button>
      <div class="dropdown-divider"></div>
      <button class="dropdown-logout" id="dropdownLogout">
        <i data-lucide="log-out"></i>
        Logout
      </button>
    `;
    
    dropdown.innerHTML = dropdownHTML;
    document.body.appendChild(dropdown);
    
    // Position dropdown relative to profile button
    this.positionDropdown(profileBtn, dropdown);
    
    // Add event listeners
    this.setupDropdownEvents(profileBtn, dropdown, userData);
    
    // Initialize Lucide icons
    if (window.lucide) {
      lucide.createIcons();
    }
  },
  
  // Position dropdown relative to profile button
  positionDropdown: function(profileBtn, dropdown) {
    const btnRect = profileBtn.getBoundingClientRect();
    
    // Position dropdown to the right of the button
    dropdown.style.position = 'fixed';
    dropdown.style.top = `${btnRect.bottom + 8}px`;
    dropdown.style.right = `${window.innerWidth - btnRect.right}px`;
    dropdown.style.zIndex = '1001';
  },
  
  // Setup dropdown event listeners
  setupDropdownEvents: function(profileBtn, dropdown, userData) {
    let isVisible = false;
    let hideTimeout;
    
    // Show dropdown on hover
    profileBtn.addEventListener('mouseenter', () => {
      clearTimeout(hideTimeout);
      dropdown.style.display = 'block';
      dropdown.style.opacity = '1';
      dropdown.style.transform = 'translateY(0)';
      isVisible = true;
    });
    
    // Hide dropdown when mouse leaves
    profileBtn.addEventListener('mouseleave', () => {
      hideTimeout = setTimeout(() => {
        if (!dropdown.matches(':hover')) {
          dropdown.style.opacity = '0';
          dropdown.style.transform = 'translateY(-10px)';
          setTimeout(() => {
            dropdown.style.display = 'none';
          }, 200);
          isVisible = false;
        }
      }, 100);
    });
    
    // Keep dropdown visible when hovering over it
    dropdown.addEventListener('mouseenter', () => {
      clearTimeout(hideTimeout);
    });
    
    // Hide dropdown when mouse leaves dropdown
    dropdown.addEventListener('mouseleave', () => {
      dropdown.style.opacity = '0';
      dropdown.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        dropdown.style.display = 'none';
      }, 200);
      isVisible = false;
    });
    
    // Close button
    const closeBtn = dropdown.querySelector('#dropdownClose');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        dropdown.style.opacity = '0';
        dropdown.style.transform = 'translateY(-10px)';
        setTimeout(() => {
          dropdown.style.display = 'none';
        }, 200);
      });
    }
    
    // My Cases button
    const myCasesBtn = dropdown.querySelector('#dropdownMyCases');
    if (myCasesBtn) {
      myCasesBtn.addEventListener('click', () => {
        window.location.href = '/Frontend/my-cases/my-cases.html';
      });
    }
    
    // Logout button
    const logoutBtn = dropdown.querySelector('#dropdownLogout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.handleLogout();
      });
    }
  },
  
  // Handle logout
  handleLogout: function() {
    // Clear client-side data
    if (window.authUtils) {
      authUtils.clearAuthData();
    }
    
    // Optional: Invalidate token on server
    const authData = window.authUtils ? authUtils.getAuthData() : null;
    if (authData && authData.token) {
      fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${authData.token}`
        }
      }).catch(error => console.error("Logout error:", error));
    }
    
    // Reload the page
    window.location.reload();
  },
  
  // Update UI for logged-in user
  updateUIForLoggedInUser: function(userData) {
    // Hide login/register buttons
    const openLoginBtn = document.getElementById("openLoginBtn");
    const showLoginBtn = document.getElementById("showLogin");
    if (openLoginBtn) openLoginBtn.style.display = 'none';
    if (showLoginBtn) showLoginBtn.style.display = 'none';
    
    // Show profile section
    const profileSection = document.getElementById('profileSection');
    if (profileSection) {
      profileSection.style.display = 'block';
      
      // Update profile button with user initial
      const profileBtn = document.getElementById('profileBtn');
      if (profileBtn) {
        const initial = userData.data.name.charAt(0).toUpperCase();
        profileBtn.innerHTML = `<span class="profile-initial">${initial}</span>`;
        
        // Create hover dropdown instead of click modal
        this.createProfileDropdown(profileBtn, userData);
      }
    }
    
    // Auto-fill user details in forms if available
    this.autoFillUserData(userData);
  },
  
  // Auto-fill user data in forms
  autoFillUserData: function(userData) {
    // Report form
    const nameField = document.getElementById('name');
    const emailField = document.getElementById('email');
    const phoneField = document.getElementById('phone');
    
    if (nameField) nameField.value = userData.data.name || '';
    if (emailField) emailField.value = userData.data.email || '';
    if (phoneField) phoneField.value = userData.data.mobile || userData.data.phone || '';
    
    // Make fields read-only if they're auto-filled
    if (nameField && nameField.value) nameField.readOnly = true;
    if (emailField && emailField.value) emailField.readOnly = true;
    if (phoneField && phoneField.value) phoneField.readOnly = true;
  }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
  // Check if authUtils is available
  if (window.authUtils) {
    // Check authentication status
    const userData = await authUtils.checkAuth();
    if (userData) {
      profileDropdownUtils.updateUIForLoggedInUser(userData);
    }
  }
  
  // Close dropdown when clicking outside
  document.addEventListener('click', function(e) {
    const profileDropdown = document.getElementById('profileDropdown');
    const profileBtn = document.getElementById('profileBtn');
    
    if (profileDropdown && !profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
      profileDropdown.style.opacity = '0';
      profileDropdown.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        profileDropdown.style.display = 'none';
      }, 200);
    }
  });

  // Initialize Lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }
});

// Make profileDropdownUtils available globally
window.profileDropdownUtils = profileDropdownUtils; 