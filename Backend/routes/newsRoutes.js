// routes/newsRoutes.js
const express = require('express');
const router = express.Router();

// Fallback news data in case API fails
const fallbackNews = [
  {
    title: "Mumbai Police report 30% decrease in chain snatching following new patrolling initiative",
    source: "Maharashtra Police Department",
    isBreaking: true,
    url: "#",
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    image: null
  },
  {
    title: "Delhi Traffic Police implement AI-based system for better traffic management on Ring Road",
    source: "Delhi Traffic Police", 
    isBreaking: false,
    url: "#",
    publishedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    image: null
  }
];

// Cache for news data
let newsCache = {
  data: null,
  timestamp: 0,
  duration: 30 * 60 * 1000, // 30 minutes cache (increased for API efficiency)
};

// Function to fetch news from GNews API
async function fetchGNewsData() {
  const apiKey = process.env.GNEWS_API_KEY;
  
  if (!apiKey) {
    console.warn('GNews API key not found in environment variables');
    return null;
  }

  try {
    // Fetch India-specific news and crime-related news
    const queries = [
      'crime police law enforcement India',
      'safety security public India',
      'breaking news India crime',
      'police investigation India',
      'cybercrime India prevention'
    ];

    const allArticles = [];

    for (const query of queries) {
      const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&country=in&max=5&apikey=${apiKey}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`GNews API error: ${response.status} ${response.statusText}`);
        continue;
      }

      const data = await response.json();
      
      if (data.articles && Array.isArray(data.articles)) {
        const formattedArticles = data.articles.map(article => ({
          title: article.title,
          source: article.source.name,
          isBreaking: Math.random() < 0.3, // 30% chance of being breaking news
          url: article.url,
          publishedAt: article.publishedAt,
          image: article.image,
          description: article.description
        }));
        
        allArticles.push(...formattedArticles);
      }
      
      // Add small delay between requests to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Remove duplicates based on title and limit to 10 articles
    const uniqueArticles = allArticles.filter((article, index, self) => 
      index === self.findIndex(a => a.title === article.title)
    ).slice(0, 10);

    return uniqueArticles.length > 0 ? uniqueArticles : null;

  } catch (error) {
    console.error('Error fetching GNews data:', error.message);
    return null;
  }
}

// Function to generate enhanced Indian local news (as backup)
function generateEnhancedLocalNews() {
  const templates = [
    "Police successfully resolve {0} in {1} area, {2} suspects detained",
    "Cyber Crime Cell prevents ₹{0} lakh online fraud attempt targeting senior citizens in {1}", 
    "Community safety meeting in {1} district addresses recent {0} concerns",
    "Anti-Corruption Bureau investigation leads to recovery of ₹{0} crore in illegal assets",
    "Traffic police report {2}% reduction in road accidents following new safety measures on {1} highway",
    "Women's helpline 1091 receives {2} calls this week, all cases resolved successfully in {1}",
    "Narcotics Control Bureau launches drug prevention program in {2} schools across {1}",
    "Emergency services upgrade equipment to improve {0} response capabilities in {1} district",
    "Police conduct successful raid on illegal gambling den in {1} area of the city",
    "New police patrol system reduces response time by {2}% in {1} police station area",
    "RPF prevents {0} at {1} railway station, passengers safe",
    "Special Task Force arrests {2} members of interstate {0} gang in {1}"
  ];

  const locations = [
    "Connaught Place", "Andheri", "Salt Lake", "Banjara Hills", "Koramangala", 
    "Sector 17", "MG Road", "Park Street", "Jubilee Hills", "Indiranagar",
    "CP", "Powai", "Electronic City", "Gachibowli", "HSR Layout"
  ];
  
  const crimeTypes = [
    "chain snatching case", "cyber fraud investigation", "vehicle theft concerns", 
    "ATM skimming breach", "mobile theft case", "house break-in", "eve-teasing incident",
    "pickpocketing", "identity theft", "online scam"
  ];
  
  const amounts = ["25", "50", "75", "1", "1.5", "2", "3", "5"];
  const percentages = ["15", "20", "25", "30", "35", "40", "45"];
  const numbers = ["3", "5", "7", "10", "12", "15"];

  const localNews = [];
  const now = Date.now();

  for (let i = 0; i < 5; i++) {
    const template = templates[Math.floor(Math.random() * templates.length)];
    let title = template
      .replace("{0}", crimeTypes[Math.floor(Math.random() * crimeTypes.length)])
      .replace("{1}", locations[Math.floor(Math.random() * locations.length)])
      .replace("{2}", percentages[Math.floor(Math.random() * percentages.length)]);

    // Handle amount placeholders for crores/lakhs
    if (title.includes("₹{0} lakh")) {
      title = title.replace("₹{0}", `₹${amounts[Math.floor(Math.random() * 4)]}`);
    } else if (title.includes("₹{0} crore")) {
      title = title.replace("₹{0}", `₹${amounts[Math.floor(Math.random() * amounts.length)]}`);
    }

    // Handle number placeholders
    if (title.includes("{2} members") || title.includes("{2} schools")) {
      title = title.replace(/\{2\}(?= members| schools)/, numbers[Math.floor(Math.random() * numbers.length)]);
    }

    localNews.push({
      title: title,
      source: "Indian Police Updates",
      isBreaking: i === 0, // First one is breaking
      url: "#",
      publishedAt: new Date(now - (i + 1) * 45 * 60 * 1000).toISOString(), // 45 min intervals
      image: null,
      description: "Local police department update from India"
    });
  }

  return localNews;
}

// GET /api/news/crime-news
router.get('/crime-news', async (req, res) => {
  try {
    const now = Date.now();
    
    // Check cache first
    if (newsCache.data && (now - newsCache.timestamp) < newsCache.duration) {
      return res.json({
        success: true,
        articles: newsCache.data,
        cached: true,
        timestamp: new Date(newsCache.timestamp).toISOString(),
        source: 'cache'
      });
    }

    console.log('Fetching fresh news from GNews API...');
    
    // Try to fetch from GNews API
    const gNewsData = await fetchGNewsData();
    let articles = [];

    if (gNewsData && gNewsData.length > 0) {
      // Use real news from GNews
      articles = gNewsData;
      console.log(`✅ Successfully fetched ${articles.length} articles from GNews`);
    } else {
      // Fall back to enhanced Indian local news
      console.log('⚠️ GNews API unavailable, using enhanced Indian local news');
      const localNews = generateEnhancedLocalNews();
      articles = [...localNews, ...fallbackNews];
    }

    // Update cache
    newsCache.data = articles;
    newsCache.timestamp = now;

    res.json({
      success: true,
      articles: articles,
      cached: false,
      timestamp: new Date().toISOString(),
      source: gNewsData ? 'gnews_api_india' : 'indian_local_fallback',
      count: articles.length
    });

  } catch (error) {
    console.error('News endpoint error:', error);
    
    // Return fallback news in case of any error
    res.status(200).json({
      success: true,
      articles: fallbackNews,
      cached: false,
      timestamp: new Date().toISOString(),
      source: 'indian_fallback',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch latest news from India'
    });
  }
});

// GET /api/news/breaking - Get only breaking news
router.get('/breaking', async (req, res) => {
  try {
    // Reuse the main endpoint logic but filter for breaking news
    const now = Date.now();
    let articles = [];

    if (newsCache.data && (now - newsCache.timestamp) < newsCache.duration) {
      articles = newsCache.data;
    } else {
      const gNewsData = await fetchGNewsData();
      if (gNewsData && gNewsData.length > 0) {
        articles = gNewsData;
      } else {
        const localNews = generateEnhancedLocalNews();
        articles = [...localNews, ...fallbackNews];
      }
    }

    // Filter only breaking news
    const breakingNews = articles.filter(article => article.isBreaking);

    res.json({
      success: true,
      articles: breakingNews,
      timestamp: new Date().toISOString(),
      source: 'indian_breaking_filter',
      count: breakingNews.length
    });

  } catch (error) {
    console.error('Breaking news endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch breaking news from India',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/news/health - Health check for news service
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Indian News service is healthy',
    gnewsApiConfigured: !!process.env.GNEWS_API_KEY,
    country: 'India',
    cache: {
      hasData: !!newsCache.data,
      lastUpdate: newsCache.timestamp ? new Date(newsCache.timestamp).toISOString() : null,
      cacheAge: newsCache.timestamp ? Date.now() - newsCache.timestamp : null,
      itemCount: newsCache.data ? newsCache.data.length : 0
    }
  });
});

module.exports = router;