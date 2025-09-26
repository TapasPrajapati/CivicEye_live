const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/crime-news", async (req, res) => {
  try {
    const response = await axios.get("https://gnews.io/api/v4/search", {
      params: {
        q: "crime OR police OR law OR FIR",
        lang: "en",
        country: "in", // India news
        max: 10,
        apikey: process.env.GNEWS_API_KEY,
      },
    });

    const articles = response.data.articles.map(article => ({
      title: article.title,
      source: article.source.name,
      publishedAt: article.publishedAt,
      url: article.url,
      image: article.image,
      isBreaking: true,
    }));

    res.json({ articles });
  } catch (error) {
    console.error("Error fetching GNews:", error.message);
    res.status(500).json({ error: "Failed to fetch latest GNews articles" });
  }
});

module.exports = router;
