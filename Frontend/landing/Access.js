// Fixed Access.js - Use ONLY authUtils for consistency
// Geolocation functionality (unchanged)
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

// Backend API URL
const API_BASE_URL = "https://civiceye-4-q1te.onrender.com";

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", async function () {
  console.log("DOM Content Loaded - Initializing login functionality");

  // Initialize Lucide icons
  lucide.createIcons();

  // Modal handling
  const openLoginBtn = document.getElementById("openLoginBtn");
  const userLoginModal = document.getElementById("userLoginModal");
  const showLoginBtn = document.getElementById("showLogin");
  const loginModal = document.getElementById("loginModal");

  // Show login modal
  if (openLoginBtn) {
    openLoginBtn.addEventListener("click", () => {
      console.log("Login button clicked");
      if (userLoginModal) {
        userLoginModal.classList.add("active");
      }
    });
  }

  // Hide login modal when clicking outside
  if (userLoginModal) {
    userLoginModal.addEventListener("click", function (e) {
      if (e.target === userLoginModal) {
        userLoginModal.classList.remove("active");
      }
    });
  }

  // Show register modal
  if (showLoginBtn) {
    showLoginBtn.addEventListener("click", function () {
      console.log("Register button clicked");
      if (loginModal) {
        loginModal.classList.add("active");
      }
    });
  }

  // Hide register modal when clicking outside
  if (loginModal) {
    loginModal.addEventListener("click", function (e) {
      if (e.target === loginModal) {
        loginModal.classList.remove("active");
      }
    });
  }

  // Switch between login and register forms
  function showLoginForm() {
    loginModal.classList.remove("active");
    userLoginModal.classList.add("active");
  }

  // Make showLoginForm globally available
  window.showLoginForm = showLoginForm;

  // Handle User Registration
  const userForm = document.querySelector("#userForm .submit-btn");
  if (userForm) {
    userForm.addEventListener("click", async (e) => {
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
          `${API_BASE_URL}/api/users/register/user`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
          }
        );

        if (response.ok) {
          alert("Registration successful! Please login.");
          loginModal.classList.remove("active");
          // Show login modal after successful registration
          userLoginModal.classList.add("active");
        } else {
          const errorData = await response.json();
          alert(`Registration failed: ${errorData.message || "Please try again."}`);
        }
      } catch (error) {
        console.error("Registration error:", error);
        alert("Registration failed. Please try again.");
      }
    });
  }

  // Handle Police Registration
  const policeForm = document.querySelector("#policeForm .submit-btn");
  if (policeForm) {
    policeForm.addEventListener("click", async (e) => {
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
          `${API_BASE_URL}/api/police/register/police`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(policeData),
          }
        );

        if (response.ok) {
          alert("Police registration successful! Please login.");
          loginModal.classList.remove("active");
          // Show login modal after successful registration
          userLoginModal.classList.add("active");
        } else {
          const errorData = await response.json();
          alert(`Registration failed: ${errorData.message || "Please try again."}`);
        }
      } catch (error) {
        console.error("Police registration error:", error);
        alert("Registration failed. Please try again.");
      }
    });
  }

  // Login form submission - FIXED to use authUtils consistently
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email-input").value;
      const password = document.getElementById("password-input").value;

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Login successful:", data);

          // Use authUtils to store auth data consistently
          authUtils.setAuthData(data.token, data);

          alert("Login successful!");
          userLoginModal.classList.remove("active");
          
          // Update UI immediately
          authUtils.updateUIForLoggedInUser(data);

          // Clear the form
          loginForm.reset();

          console.log("Login process completed");
        } else {
          const errorData = await response.json();
          alert(`Login failed: ${errorData.message || "Invalid credentials"}`);
        }
      } catch (error) {
        console.error("Login error:", error);
        alert("Login failed. Please check your connection and try again.");
      }
    });
  }

  // Role toggle functionality
  const roleToggle = document.getElementById("roleToggle");
  const flipCard = document.getElementById("flipCard");

  if (roleToggle && flipCard) {
    roleToggle.addEventListener("change", function () {
      flipCard.classList.toggle("flipped");

      const userLabel = document.querySelector(
        ".toggle-switch span:first-child"
      );
      const policeLabel = document.querySelector(
        ".toggle-switch span:last-child"
      );

      if (this.checked) {
        userLabel.style.color = "#000080";
        policeLabel.style.color = "#987456";
      } else {
        userLabel.style.color = "#000000";
        policeLabel.style.color = "#666";
      }
    });
  }

  // Close profile modal when clicking X
  document.querySelector(".close")?.addEventListener("click", function () {
    document.getElementById("profileModal").style.display = "none";
  });

  // Close profile modal when clicking outside
  window.addEventListener("click", function (event) {
    const modal = document.getElementById("profileModal");
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  console.log("Login functionality initialization complete");
});