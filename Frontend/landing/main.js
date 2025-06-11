// Initialize Lucide icons
lucide.createIcons();

document.addEventListener("DOMContentLoaded", function () {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll("nav li a");

  navLinks.forEach((link) => {
    const linkPath = new URL(link.href, window.location.origin).pathname;
    if (linkPath === currentPath) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // Sidebar functionality
  const sidebar = document.getElementById("sidebar");
  const openNav = document.getElementById("openNav");
  const closeNav = document.getElementById("closeNav");

  if (openNav) {
    openNav.addEventListener("click", () => {
      sidebar.classList.add("open");
    });
  }

  if (closeNav) {
    closeNav.addEventListener("click", () => {
      sidebar.classList.remove("open");
    });
  }

  // Close sidebar when clicking outside on mobile
  document.addEventListener("click", (e) => {
    if (
      window.innerWidth <= 1024 &&
      sidebar.classList.contains("open") &&
      !sidebar.contains(e.target) &&
      !openNav.contains(e.target)
    ) {
      sidebar.classList.remove("open");
    }
  });

  // Emergency button pulse animation
  const emergencyBtn = document.querySelector(".btn-emergency");
  if (emergencyBtn) {
    emergencyBtn.addEventListener("mouseenter", () => {
      emergencyBtn.style.animation = "pulse 1s infinite";
    });
    emergencyBtn.addEventListener("mouseleave", () => {
      emergencyBtn.style.animation = "none";
    });
  }

  // Add CSS animation for pulse effect
  const style = document.createElement("style");
  style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        @keyframes ticker-scroll {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
        }
    `;
  document.head.appendChild(style);

  // Quick action buttons hover effect
  const actionBtns = document.querySelectorAll(".action-btn");
  actionBtns.forEach((btn) => {
    btn.addEventListener("mouseenter", () => {
      btn.style.transform = "translateY(-2px)";
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "translateY(0)";
    });
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  // News API Integration with Infinite Scroll
  const API_KEYS = {
    newsAPI: "a9c94c80e2f845d2ae73c571aa3fc47d",
    gNewsAPI: "0c3ae25fc00868efc577222f72dbe04e",
  };

  const newsTicker = document.getElementById("newsTicker");

  if (newsTicker) {
    // Track current news items
    let currentNewsItems = [];
    let tickerAnimation;

    async function fetchNewsAPI() {
      try {
        const response = await fetch(
          `https://newsapi.org/v2/top-headlines?q=crime&country=in&pageSize=10&apiKey=${API_KEYS.newsAPI}`
        );
        const data = await response.json();
        return (
          data.articles?.map((article) => ({
            title: article.title,
            source: "NewsAPI",
            isBreaking: true,
            url: article.url,
          })) || []
        );
      } catch (error) {
        console.error("NewsAPI Error:", error);
        return [];
      }
    }

    async function fetchGNews() {
      try {
        const response = await fetch(
          `https://gnews.io/api/v4/top-headlines?q=crime&country=in&max=10&token=${API_KEYS.gNewsAPI}`
        );
        const data = await response.json();
        return (
          data.articles?.map((article) => ({
            title: article.title,
            source: "GNews",
            isBreaking: false,
            url: article.url,
          })) || []
        );
      } catch (error) {
        console.error("GNews Error:", error);
        return [];
      }
    }

    function getFallbackNews() {
      return [
        {
          title:
            "Local authorities report decrease in street crimes this month",
          source: "Local News",
          isBreaking: false,
          url: "#",
        },
        {
          title:
            "Cybercrime task force makes major arrest in financial fraud case",
          source: "Police Bulletin",
          isBreaking: true,
          url: "#",
        },
      ];
    }

    async function getCombinedNews() {
      try {
        const [newsApiResults, gNewsResults] = await Promise.all([
          fetchNewsAPI(),
          fetchGNews(),
        ]);

        const combinedNews = [...newsApiResults, ...gNewsResults];
        return combinedNews.length > 0
          ? combinedNews.sort(() => Math.random() - 0.5)
          : getFallbackNews();
      } catch (error) {
        console.error("Error combining news:", error);
        return getFallbackNews();
      }
    }

    function createTickerItem(item) {
      const element = document.createElement("div");
      element.className = "ticker-headline";
      element.innerHTML = `
                <span class="breaking-news">${
                  item.isBreaking ? "BREAKING" : "UPDATE"
                }</span>
                <span class="headline-text">${item.title}</span>
                <span class="news-source">(${item.source})</span>
            `;
      element.addEventListener("click", () => {
        window.open(item.url, "_blank");
      });
      return element;
    }

    function initializeTicker() {
      // Clear existing content
      newsTicker.innerHTML = "";

      // Create a wrapper for seamless looping
      const tickerWrapper = document.createElement("div");
      tickerWrapper.className = "ticker-wrapper";

      // Add all news items twice for infinite effect
      currentNewsItems.forEach((item) => {
        tickerWrapper.appendChild(createTickerItem(item));
      });
      currentNewsItems.forEach((item) => {
        tickerWrapper.appendChild(createTickerItem(item));
      });

      newsTicker.appendChild(tickerWrapper);

      // Set animation duration based on item count
      const duration = currentNewsItems.length * 3;
      tickerWrapper.style.animation = `ticker-scroll ${duration}s linear infinite`;

      // Pause on hover
      newsTicker.addEventListener("mouseenter", () => {
        tickerWrapper.style.animationPlayState = "paused";
      });
      newsTicker.addEventListener("mouseleave", () => {
        tickerWrapper.style.animationPlayState = "running";
      });
    }

    async function updateNewsFeed() {
      currentNewsItems = await getCombinedNews();
      initializeTicker();
    }

    // Initialize and refresh periodically
    updateNewsFeed();
    setInterval(updateNewsFeed, 30); // Refresh every 5 minutes
  }
});
