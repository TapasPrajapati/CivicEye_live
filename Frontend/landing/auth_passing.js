// auth.js - Complete Authentication System
const authUtils = {
  // Session configuration
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  WARNING_TIME: 5 * 60 * 1000,     // 5 minutes before timeout
  
  // Store authentication data
  setAuthData: function(token, userData) {
    const authData = {
      token,
      userData,
      timestamp: new Date().getTime()
    };
    sessionStorage.setItem('authData', JSON.stringify(authData));
  },
  
  // Retrieve valid auth data
  getAuthData: function() {
    const authString = sessionStorage.getItem('authData');
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
    sessionStorage.setItem('authData', JSON.stringify(authData));
    
    return authData;
  },
  
  // Clear authentication data
  clearAuthData: function() {
    sessionStorage.removeItem('authData');
  },
  
  // Verify authentication with server
  checkAuth: async function() {
    const authData = this.getAuthData();
    if (!authData) return false;
    
    try {
      const response = await fetch("http://localhost:5000/api/auth/verify", {
        headers: { 
          'Authorization': `Bearer ${authData.token}`,
          'Content-Type': 'application/json'
        }
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
        
        // Add click handler to show profile modal
        profileBtn.onclick = () => {
          this.showProfileModal(userData);
        };
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
  },
  
  // Show profile modal
  showProfileModal: function(userData) {
    // Remove existing modal if any
    const existingModal = document.getElementById('profileModal');
    if (existingModal) existingModal.remove();
    
    // Create new modal
    const profileModal = document.createElement('div');
    profileModal.id = 'profileModal';
    profileModal.className = 'profile-modal';
    profileModal.innerHTML = `
      <div class="modal-content">
        <span class="close">&times;</span>
        <div id="profileContent"></div>
      </div>
    `;
    document.body.appendChild(profileModal);
    this.loadProfileData(userData);
    
    // Add close handler
    document.querySelector('.profile-modal .close').onclick = () => {
      profileModal.remove();
    };
  },
  
  // Load profile data into modal
  loadProfileData: function(userData) {
    const profileContent = document.getElementById('profileContent');
    if (!profileContent) return;
    
    let html = `
      <div class="profile-header">
        <div class="profile-icon">${userData.data.name.charAt(0).toUpperCase()}</div>
        <h2>${userData.data.name}</h2>
      </div>
      <div class="profile-details">
        <p><strong>Email:</strong> ${userData.data.email}</p>
    `;
    
    if (userData.type === 'police') {
      html += `
        <p><strong>Rank:</strong> ${userData.data.rank || 'N/A'}</p>
        <p><strong>Station:</strong> ${userData.data.station || 'N/A'}</p>
        <p><strong>Police ID:</strong> ${userData.data.policeId || 'N/A'}</p>
      `;
    } else {
      html += `
        <p><strong>Mobile:</strong> ${userData.data.mobile || userData.data.phone || 'N/A'}</p>
        ${userData.data.age ? `<p><strong>Age:</strong> ${userData.data.age}</p>` : ''}
      `;
    }
    
    html += `
      </div>
      <button class="logout-btn" id="logoutBtn">Logout</button>
    `;
    
    profileContent.innerHTML = html;
    document.getElementById('logoutBtn').addEventListener('click', () => this.handleLogout());
  },
  
  // Handle logout
  handleLogout: function() {
    // Clear client-side data
    this.clearAuthData();
    
    // Optional: Invalidate token on server
    const authData = this.getAuthData();
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
  
  // Show session expiration warning
  showSessionWarning: function() {
    setTimeout(() => {
      if (this.getAuthData()) { // Only if still logged in
        const extend = confirm('Your session will expire in 5 minutes. Would you like to stay logged in?');
        if (extend) {
          // Reset the session timer
          const authData = this.getAuthData();
          if (authData) {
            this.setAuthData(authData.token, authData.userData);
            this.showSessionWarning(); // Reset the warning timer
          }
        } else {
          this.handleLogout();
        }
      }
    }, this.SESSION_TIMEOUT - this.WARNING_TIME);
  },
  
  // Initialize inactivity timer
  initInactivityTimer: function() {
    let inactivityTimer;
    
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        this.handleLogout();
      }, this.SESSION_TIMEOUT);
    };
    
    // Reset on user activity
    ['click', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, resetTimer);
    });
    
    resetTimer();
  }
};

// Initialize authentication when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
  // Initialize activity monitoring
  authUtils.initInactivityTimer();
  
  // Check authentication status
  const userData = await authUtils.checkAuth();
  if (userData) {
    authUtils.updateUIForLoggedInUser(userData);
    authUtils.showSessionWarning();
  }
  
  // Close modal when clicking outside
  document.addEventListener('click', function(e) {
    const profileModal = document.getElementById('profileModal');
    if (profileModal && e.target === profileModal) {
      profileModal.remove();
    }
  });

  // Initialize Lucide icons
  lucide.createIcons();
});

// Make authUtils available globally
window.authUtils = authUtils;