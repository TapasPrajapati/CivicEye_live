// Live Chat Button
const chatButton = document.getElementById("chat-button");
const chatWindow = document.getElementById("chat-window");

chatButton.addEventListener("click", () => {
  chatWindow.style.display = "block";
  chatButton.textContent = "Minimize Chat";
  chatButton.addEventListener("click", () => {
    if (chatWindow.style.display === "block") {
      chatWindow.style.display = "none";
      chatButton.textContent = "Start Live Chat";
    } else {
      chatWindow.style.display = "block";
      chatButton.textContent = "Minimize Chat";
    }
  });
});
