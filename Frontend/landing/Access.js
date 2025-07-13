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

      const openLoginBtn = document.getElementById("openLoginBtn");
      const userLoginModal = document.getElementById("userLoginModal");

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

      // Close login modal on form submit
      document
        .querySelector("#userLoginModal form")
        .addEventListener("submit", (e) => {
          e.preventDefault();
          userLoginModal.classList.remove("active");
        });
      const showLoginBtn = document.getElementById("showLogin");
      const loginModal = document.getElementById("loginModal");

      // Show modal on button click
      showLoginBtn.addEventListener("click", function () {
        loginModal.classList.add("active");
      });

      // Hide modal when clicking outside the inner container
      loginModal.addEventListener("click", function (e) {
        if (e.target === loginModal) {
          loginModal.classList.remove("active");
        }
      });
      function showLoginForm() {
        loginModal.classList.remove("active");

        userLoginModal.classList.add("active");
      }
      // ---------- Existing Role Toggle Code ----------
      const roleToggle = document.getElementById("roleToggle");
      const flipCard = document.getElementById("flipCard");

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

      const profileSection = document.getElementById("profileSection");
      const profileBtn = document.getElementById("profileBtn");
      const profileModal = document.getElementById("profileModal");
      const profileContent = document.getElementById("profileContent");

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

      document
        .getElementById("loginForm")
        .addEventListener("submit", async (e) => {
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
              localStorage.setItem("userData", JSON.stringify(data));
              alert("Login successful!"); // Show success message
              userLoginModal.classList.remove("active");
              profileSection.style.display = "block";
              openLoginBtn.style.display = "none";
              showLogin.style.display = "none";
            } else {
              alert("Invalid credentials"); // Show error message
            }
          } catch (error) {
            console.error("Error:", error);
          }
        });

      // Show profile modal
      profileBtn.addEventListener("click", async () => {
        const userData = JSON.parse(localStorage.getItem("userData"));
        const { type, data } = userData;

        try {
          const response = await fetch(
            // ${data._id}
            "http://localhost:5000//api/auth/profile/:id"
          );
          if (response.ok) {
            const profileData = await response.json();
            profileContent.innerHTML = `
                <p><strong>Name:</strong> ${profileData.name}</p>
                <p><strong>Email:</strong> ${profileData.email}</p>
                ${
                  type === "user"
                    ? `
                    <p><strong>Age:</strong> ${profileData.age}</p>
                    <p><strong>Mobile:</strong> ${profileData.mobile}</p>
                `
                    : `
                    <p><strong>Rank:</strong> ${profileData.rank}</p>
                    <p><strong>Station:</strong> ${profileData.station}</p>
                    <p><strong>Phone:</strong> ${profileData.phone}</p>
                `
                }
            `;
            profileModal.classList.add("active");
          }
        } catch (error) {
          console.error("Error:", error);
        }
      });

      // Hide profile modal when clicking outside
      profileModal.addEventListener("click", function (e) {
        if (e.target === profileModal) {
          profileModal.classList.remove("active");
        }
      });
   