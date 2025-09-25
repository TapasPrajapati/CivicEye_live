/* CivicEye Contact Page JavaScript */

// Attach submit handler
document.getElementById("contact-form").addEventListener("submit", async function (e) {
  e.preventDefault();

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

  // Show loading state
  submitBtn.classList.add("loading");
  submitBtn.disabled = true;
  messageEl.textContent = "";
  messageEl.classList.remove("error", "success");

  try {
    // 🔗 Send to backend (Render)
    const response = await fetch("https://civiceye-4-q1te.onrender.com/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, message }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      messageEl.textContent = "✅ Thank you for your message! We’ll get back to you soon.";
      messageEl.classList.add("success");
      form.reset();
    } else {
      messageEl.textContent = data.error || "❌ Something went wrong. Please try again.";
      messageEl.classList.add("error");
    }
  } catch (err) {
    console.error("Contact form error:", err);
    messageEl.textContent = "❌ Network error. Please check your connection.";
    messageEl.classList.add("error");
  } finally {
    submitBtn.classList.remove("loading");
    submitBtn.disabled = false;
  }
});

/* Smooth scroll to form on hero button click */
document.querySelector(".hero-btn").addEventListener("click", () => {
  document.querySelector(".form-container").scrollIntoView({ behavior: "smooth" });
});

/* FAQ accordion toggle */
document.querySelectorAll(".faq-question").forEach((button) => {
  button.addEventListener("click", () => {
    const answer = button.nextElementSibling;
    const isActive = answer.classList.contains("active");

    // Close all answers
    document.querySelectorAll(".faq-answer").forEach((ans) => ans.classList.remove("active"));

    // Toggle current answer
    if (!isActive) answer.classList.add("active");
  });
});

/* FAQ search functionality */
document.getElementById("faq-search").addEventListener("input", function (e) {
  const searchTerm = e.target.value.toLowerCase();
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question").textContent.toLowerCase();
    const answer = item.querySelector(".faq-answer").textContent.toLowerCase();

    if (question.includes(searchTerm) || answer.includes(searchTerm)) {
      item.style.display = "block";
      item.classList.add("highlight");
      setTimeout(() => item.classList.remove("highlight"), 1000);
    } else {
      item.style.display = "none";
    }
  });
});
