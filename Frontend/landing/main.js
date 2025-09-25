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

  const newsTicker = document.getElementById("news-ticker");
  const API_BASE_URL = "https://civiceye-4-q1te.onrender.com"; // Your backend URL

  if (newsTicker) {
    let currentNewsItems = [];
    let isFetching = false;
    let lastFetchTime = 0;
    let cleanupTicker = null;

    async function fetchWithTimeout(url, options = {}, timeout = 20000) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    }

    // Updated to fetch news through your backend
    async function fetchNewsFromBackend() {
      try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/api/news/crime-news`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        return data.articles?.map(article => ({
          title: article.title,
          source: article.source || "News Source",
          isBreaking: article.isBreaking || false,
          url: article.url || "#",
          timestamp: new Date(article.publishedAt || Date.now()),
        })) || [];
      } catch (error) {
        console.error("Backend news fetch error:", error);
        return [];
      }
    }

    function getFallbackNews() {
      return [
        {
          title: "Local authorities report decrease in street crimes this month",
          source: "Local News",
          isBreaking: false,
          url: "#",
          timestamp: new Date(),
        },
        {
          title: "Cybercrime task force makes major arrest in financial fraud case",
          source: "Police Bulletin",
          isBreaking: true,
          url: "#",
          timestamp: new Date(),
        },
        {
          title: "Community policing initiative shows positive results",
          source: "City Update",
          isBreaking: false,
          url: "#",
          timestamp: new Date(),
        },
        {
          title: "New safety measures implemented in downtown area",
          source: "Safety Alert",
          isBreaking: false,
          url: "#",
          timestamp: new Date(),
        }
      ];
    }

    async function getCombinedNews() {
      if (isFetching) return currentNewsItems;
      isFetching = true;

      try {
        console.log("Fetching latest crime news from backend...");
        const newsItems = await fetchNewsFromBackend();
        
        console.log(`Fetched ${newsItems.length} news items`);

        if (newsItems.length === 0) {
          console.log("Using fallback news");
          return getFallbackNews();
        }

        // Remove duplicates based on title
        const uniqueNews = newsItems.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.title === item.title)
        );

        // Sort by timestamp (newest first)
        uniqueNews.sort((a, b) => b.timestamp - a.timestamp);
        
        // Mark first 2 items as breaking news
        uniqueNews.slice(0, 2).forEach((item) => (item.isBreaking = true));

        return uniqueNews;
      } catch (error) {
        console.error("Error fetching news:", error);
        return getFallbackNews();
      } finally {
        isFetching = false;
        lastFetchTime = Date.now();
      }
    }

    // Rest of the ticker functions remain the same
    function createTickerItem(item) {
      const element = document.createElement("div");
      element.className = "ticker-headline";
      const timeAgo = getTimeAgo(item.timestamp);

      element.innerHTML = `
        <span class="breaking-news">${item.isBreaking ? "BREAKING" : "UPDATE"}</span>
        <span class="headline-text">${item.title}</span>
        <span class="news-meta">
          <span class="news-source">${item.source}</span>
          <span class="news-time">${timeAgo}</span>
        </span>
      `;

      element.addEventListener("click", () => {
        if (item.url && item.url !== "#") {
          window.open(item.url, "_blank");
        }
      });

      return element;
    }

    function getTimeAgo(date) {
      const seconds = Math.floor((new Date() - date) / 1000);
      if (seconds < 60) return "Just now";
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    }

    function initializeTicker() {
      if (cleanupTicker) cleanupTicker();

      newsTicker.innerHTML = "";
      const tickerWrapper = document.createElement("div");
      tickerWrapper.className = "ticker-wrapper";

      // Double the content for seamless scrolling
      currentNewsItems.forEach((item) =>
        tickerWrapper.appendChild(createTickerItem(item))
      );
      currentNewsItems.forEach((item) =>
        tickerWrapper.appendChild(createTickerItem(item))
      );

      newsTicker.appendChild(tickerWrapper);

      const duration = Math.max(currentNewsItems.length * 4, 20); // Minimum 20s
      tickerWrapper.style.animation = `ticker-scroll ${duration}s linear infinite`;

      const handleMouseEnter = () =>
        (tickerWrapper.style.animationPlayState = "paused");
      const handleMouseLeave = () =>
        (tickerWrapper.style.animationPlayState = "running");

      newsTicker.addEventListener("mouseenter", handleMouseEnter);
      newsTicker.addEventListener("mouseleave", handleMouseLeave);

      cleanupTicker = () => {
        newsTicker.removeEventListener("mouseenter", handleMouseEnter);
        newsTicker.removeEventListener("mouseleave", handleMouseLeave);
      };
    }

    async function updateNewsFeed() {
      const timeSinceLastFetch = Date.now() - lastFetchTime;
      const minRefreshInterval = 5 * 60 * 1000; // 5 minutes

      if (timeSinceLastFetch < minRefreshInterval && currentNewsItems.length > 0) {
        console.log(
          `Skipping fetch - ${Math.floor(timeSinceLastFetch / 1000)}s since last fetch`
        );
        return;
      }

      console.log("Updating news feed...");
      currentNewsItems = await getCombinedNews();
      initializeTicker();
    }

    // Initialize immediately
    updateNewsFeed();

    // Set interval to check every 10 minutes
    const checkInterval = setInterval(updateNewsFeed, 10 * 60 * 1000);

    // Refresh when window gains focus (if it's been a while)
    window.addEventListener("focus", () => {
      const timeSinceLastFetch = Date.now() - lastFetchTime;
      if (timeSinceLastFetch > 5 * 60 * 1000) { // 5 minutes
        updateNewsFeed();
      }
    });

    // Cleanup on page unload
    window.addEventListener("beforeunload", () => {
      clearInterval(checkInterval);
      if (cleanupTicker) cleanupTicker();
    });
  }
});
