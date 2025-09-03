/* Consolidated JavaScript for CivicEye contact page */

/* Form validation and submission handling */
document
  .getElementById("contact-form")
  .addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent default form submission
    const form = e.target;
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const message = form.message.value.trim();
    const messageEl = document.querySelector(".form-message");
    const submitBtn = form.querySelector(".submit-btn");

    // Validate required fields
    if (!name || !email || !message) {
      messageEl.textContent = "Please fill in all required fields.";
      messageEl.classList.add("error");
      return;
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      messageEl.textContent = "Please enter a valid email address.";
      messageEl.classList.add("error");
      return;
    }

    // Simulate form submission (no backend)
    submitBtn.classList.add("loading");
    submitBtn.disabled = true;
    messageEl.textContent = "";

    setTimeout(() => {
      console.log("Form Data:", { name, email, phone, message }); // Log form data to console
      messageEl.textContent =
        "Thank you for your message! We’ll get back to you soon.";
      messageEl.classList.remove("error");
      messageEl.classList.add("success");
      submitBtn.classList.remove("loading");
      submitBtn.disabled = false;
      form.reset(); // Reset form fields
    }, 1500);
  });

// Smooth scroll to form on hero button click
document.querySelector(".hero-btn").addEventListener("click", () => {
  document
    .querySelector(".form-container")
    .scrollIntoView({ behavior: "smooth" });
});

// FAQ accordion toggle
document.querySelectorAll(".faq-question").forEach((button) => {
  button.addEventListener("click", () => {
    const answer = button.nextElementSibling;
    const isActive = answer.classList.contains("active");

    // Close all answers
    document.querySelectorAll(".faq-answer").forEach((ans) => {
      ans.classList.remove("active");
    });

    // Toggle current answer
    if (!isActive) {
      answer.classList.add("active");
    }
  });
});

// FAQ search functionality
document.getElementById("faq-search").addEventListener("input", function (e) {
  const searchTerm = e.target.value.toLowerCase();
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const question = item
      .querySelector(".faq-question")
      .textContent.toLowerCase();
    const answer = item.querySelector(".faq-answer").textContent.toLowerCase();

    // Show or hide FAQ items based on search term
    if (question.includes(searchTerm) || answer.includes(searchTerm)) {
      item.style.display = "block";
      item.classList.add("highlight");
      setTimeout(() => item.classList.remove("highlight"), 1000); // Highlight briefly
    } else {
      item.style.display = "none";
    }
  });
});
