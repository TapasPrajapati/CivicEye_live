// Theme Toggle
const themeToggle = document.getElementById("theme-toggle");
const body = document.body;

themeToggle.addEventListener("click", () => {
  body.classList.toggle("dark-theme");
  themeToggle.textContent = body.classList.contains("dark-theme") ? "☀️" : "🌙";
});
