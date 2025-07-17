// Geolocation functionality
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      var lat = position.coords.latitude;
      var lng = position.coords.longitude;
      var mapUrl =
        "https://maps.google.com/maps?q=" +
        lat +
        "," +
        lng +
        "&z=15&output=embed";
      document.getElementById("mapIframe").src = mapUrl;
    },
    function (error) {
      console.error("Error getting location: ", error);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
} else {
  console.error("Geolocation is not supported by this browser.");
}

// Handle User Registration
document
  .querySelector("#userForm .submit-btn")
  .addEventListener("click", async (e) => {
    e.preventDefault();

    const userData = {
      name: document.getElementById("userName").value,
      age: document.getElementById("userAge").value,
      mobile: document.getElementById("userMobile").value,
      email: document.getElementById("userEmail").value,
      password: document.getElementById("userPassword").value,
    };

    try {
      const response = await fetch(
        "http://localhost:5000/api/users/register/user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      if (response.ok) {
        alert("Registration successful!");
        loginModal.classList.remove("active");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });

// Handle Police Registration
document
  .querySelector("#policeForm .submit-btn")
  .addEventListener("click", async (e) => {
    e.preventDefault();

    const policeData = {
      policeId: document.getElementById("policeId").value,
      batchNo: document.getElementById("batchNo").value,
      rank: document.getElementById("rank").value,
      phone: document.getElementById("policePhone").value,
      station: document.getElementById("station").value,
      email: document.getElementById("policeEmail").value,
      password: document.getElementById("policePassword").value,
    };

    try {
      const response = await fetch(
        "http://localhost:5000/api/police/register/police",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(policeData),
        }
      );

      if (response.ok) {
        alert("Police registration successful!");
        loginModal.classList.remove("active");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });

// Modal handling
const openLoginBtn = document.getElementById("openLoginBtn");
const userLoginModal = document.getElementById("userLoginModal");
const showLoginBtn = document.getElementById("showLogin");
const loginModal = document.getElementById("loginModal");

// Show login modal
openLoginBtn.addEventListener("click", () => {
  userLoginModal.classList.add("active");
});

// Hide login modal when clicking outside
userLoginModal.addEventListener("click", function (e) {
  if (e.target === userLoginModal) {
    userLoginModal.classList.remove("active");
  }
});

// Show register modal
showLoginBtn.addEventListener("click", function () {
  loginModal.classList.add("active");
});

// Hide register modal when clicking outside
loginModal.addEventListener("click", function (e) {
  if (e.target === loginModal) {
    loginModal.classList.remove("active");
  }
});

// Switch between login and register forms
function showLoginForm() {
  loginModal.classList.remove("active");
  userLoginModal.classList.add("active");
}

// Role toggle functionality
const roleToggle = document.getElementById("roleToggle");
const flipCard = document.getElementById("flipCard");

roleToggle.addEventListener("change", function () {
  flipCard.classList.toggle("flipped");

  const userLabel = document.querySelector(".toggle-switch span:first-child");
  const policeLabel = document.querySelector(".toggle-switch span:last-child");

  if (this.checked) {
    userLabel.style.color = "#000080";
    policeLabel.style.color = "#987456";
  } else {
    userLabel.style.color = "#000000";
    policeLabel.style.color = "#666";
  }
});

// Profile elements
const profileSection = document.getElementById("profileSection");
const profileBtn = document.getElementById("profileBtn");
const profileModal = document.getElementById("profileModal");
const profileContent = document.getElementById("profileContent");

// Login form submission
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email-input").value;
  const password = document.getElementById("password-input").value;

  try {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      // Store user data and token
      localStorage.setItem('token', data.token);
      localStorage.setItem('userData', JSON.stringify(data));
      
      alert("Login successful!");
      userLoginModal.classList.remove("active");
      updateUIForLoggedInUser(data);
    } else {
      alert("Invalid credentials");
    }
  } catch (error) {
    console.error("Error:", error);
  }
});

// Load profile data into modal
function loadProfileData(userData) {
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
  
  // Add police-specific fields if user is police
  if (userData.type === 'police') {
    html += `
      <p><strong>Rank:</strong> ${userData.data.rank || 'N/A'}</p>
      <p><strong>Station:</strong> ${userData.data.station || 'N/A'}</p>
      <p><strong>Police ID:</strong> ${userData.data.policeId || 'N/A'}</p>
    `;
  } else {
    // Add user-specific fields
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
  
  // Add logout event listener
  document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
}

// Handle logout functionality
function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userData');
  
  // Show login/register buttons
  document.querySelectorAll('.login-btn, .register-btn').forEach(btn => {
    btn.style.display = 'block';
  });
  
  // Hide profile section
  const profileSection = document.getElementById('profileSection');
  if (profileSection) profileSection.style.display = 'none';
  
  // Close any open modals
  const profileModal = document.getElementById('profileModal');
  if (profileModal) profileModal.style.display = 'none';
  
  document.getElementById("userLoginModal").classList.remove("active");
  
  // Reload the page to reset UI
  window.location.reload();
}

// Check authentication status
async function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  try {
    const response = await fetch("http://localhost:5000/api/auth/verify", {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      return false;
    }
  } catch (error) {
    console.error("Auth check failed:", error);
    return false;
  }
}

// Update UI for logged in user
function updateUIForLoggedInUser(userData) {
  // Hide login/register buttons
  const openLoginBtn = document.getElementById("openLoginBtn");
  const showLoginBtn = document.getElementById("showLogin");
  if (openLoginBtn) openLoginBtn.style.display = 'none';
  if (showLoginBtn) showLoginBtn.style.display = 'none';
  
  // Show profile section
  const profileSection = document.getElementById('profileSection');
  if (profileSection) {
    profileSection.style.display = 'block';
    
    // Update profile icon
    const profileIcon = document.getElementById('profileIcon');
    if (profileIcon) {
      profileIcon.textContent = userData.data.name.charAt(0).toUpperCase();
      profileIcon.onclick = () => {
        const profileModal = document.getElementById('profileModal');
        if (profileModal) {
          profileModal.style.display = 'block';
          loadProfileData(userData);
        }
      };
    }
  }
  
  // Update navigation based on user type
  if (userData.type === 'police') {
    // Show police-specific navigation items if needed
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
  // Initialize Lucide icons
  lucide.createIcons();
  
  // Check authentication status
  // const userData = await checkAuth();
  // if (userData) {
  //   updateUIForLoggedInUser(userData);
  // }
  
  // Close profile modal when clicking X
  document.querySelector('.close')?.addEventListener('click', function() {
    document.getElementById('profileModal').style.display = 'none';
  });

  // Close profile modal when clicking outside
  window.addEventListener('click', function(event) {
    const modal = document.getElementById('profileModal');
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
});