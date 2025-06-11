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
    gNewsAPI: "0c3ae25fc00868efc577222f72dbe04e", // Removed backticks
  };

  const newsTicker = document.getElementById("news-ticker");

  if (newsTicker) {
    let currentNewsItems = [];
    let isFetching = false;
    let lastFetchTime = 0;
    let cleanupTicker = null; // To store cleanup function

    async function fetchWithTimeout(url, options = {}, timeout = 8000) {
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

    async function fetchNewsAPI() {
      try {
        const response = await fetchWithTimeout(
          `https://newsapi.org/v2/top-headlines?q=crime&country=in&pageSize=15&apiKey=${API_KEYS.newsAPI}`
        );
        const data = await response.json();
        return (
          data.articles?.map((article) => ({
            title: article.title,
            source: "NewsAPI",
            isBreaking: true,
            url: article.url,
            timestamp: new Date(article.publishedAt),
          })) || []
        );
      } catch (error) {
        console.error("NewsAPI Error:", error);
        return [];
      }
    }

    async function fetchGNews() {
      try {
        const response = await fetchWithTimeout(
          `https://gnews.io/api/v4/top-headlines?q=crime&country=in&max=15&token=${API_KEYS.gNewsAPI}`
        );
        const data = await response.json();
        return (
          data.articles?.map((article) => ({
            // Fixed variable name from articles to article
            title: article.title,
            source: "GNews",
            isBreaking: false,
            url: article.url,
            timestamp: new Date(article.publishedAt),
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
          timestamp: new Date(),
        },
        {
          title:
            "Cybercrime task force makes major arrest in financial fraud case",
          source: "Police Bulletin",
          isBreaking: true,
          url: "#",
          timestamp: new Date(),
        },
      ];
    }

    async function getCombinedNews() {
      if (isFetching) return currentNewsItems;
      isFetching = true;

      try {
        console.log("Fetching latest crime news...");
        const [newsApiResults, gNewsResults] = await Promise.allSettled([
          fetchNewsAPI(),
          fetchGNews(),
        ]);

        const combinedNews = [
          ...(newsApiResults.status === "fulfilled"
            ? newsApiResults.value
            : []),
          ...(gNewsResults.status === "fulfilled" ? gNewsResults.value : []),
        ];

        console.log(`Fetched ${combinedNews.length} news items`);

        if (combinedNews.length === 0) {
          console.log("Using fallback news");
          return getFallbackNews();
        }

        const uniqueNews = combinedNews.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.title === item.title)
        );

        uniqueNews.sort((a, b) => b.timestamp - a.timestamp);
        uniqueNews.slice(0, 3).forEach((item) => (item.isBreaking = true));

        return uniqueNews;
      } catch (error) {
        console.error("Error combining news:", error);
        return getFallbackNews();
      } finally {
        isFetching = false;
        lastFetchTime = Date.now();
      }
    }

    function createTickerItem(item) {
      const element = document.createElement("div");
      element.className = "ticker-headline";
      const timeAgo = getTimeAgo(item.timestamp);

      element.innerHTML = `
            <span class="breaking-news">${
              item.isBreaking ? "BREAKING" : "UPDATE"
            }</span>
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
      // Clean up previous ticker if exists
      if (cleanupTicker) cleanupTicker();

      newsTicker.innerHTML = "";
      const tickerWrapper = document.createElement("div");
      tickerWrapper.className = "ticker-wrapper";

      currentNewsItems.forEach((item) =>
        tickerWrapper.appendChild(createTickerItem(item))
      );
      currentNewsItems.forEach((item) =>
        tickerWrapper.appendChild(createTickerItem(item))
      );

      newsTicker.appendChild(tickerWrapper);

      const duration = currentNewsItems.length * 3;
      tickerWrapper.style.animation = `ticker-scroll ${duration}s linear infinite`;

      const handleMouseEnter = () =>
        (tickerWrapper.style.animationPlayState = "paused");
      const handleMouseLeave = () =>
        (tickerWrapper.style.animationPlayState = "running");

      newsTicker.addEventListener("mouseenter", handleMouseEnter);
      newsTicker.addEventListener("mouseleave", handleMouseLeave);

      // Store cleanup function
      cleanupTicker = () => {
        newsTicker.removeEventListener("mouseenter", handleMouseEnter);
        newsTicker.removeEventListener("mouseleave", handleMouseLeave);
      };
    }

    async function updateNewsFeed() {
      const timeSinceLastFetch = Date.now() - lastFetchTime;
      const minRefreshInterval = 2 * 60 * 1000;

      if (timeSinceLastFetch < minRefreshInterval) {
        console.log(
          `Skipping fetch - ${Math.floor(
            timeSinceLastFetch / 1000
          )}s since last fetch`
        );
        return;
      }

      console.log("Updating news feed...");
      currentNewsItems = await getCombinedNews();
      initializeTicker();
    }

    // Initialize immediately
    updateNewsFeed();

    // Set interval to check every 30 seconds
    const checkInterval = setInterval(updateNewsFeed, 10 * 60 * 1000);

    // Also refresh when window gains focus
    window.addEventListener("focus", updateNewsFeed);
  }
});
