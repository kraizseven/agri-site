const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// API keys
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const GNEWS_API_KEY = process.env.GNEWS_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// News sources configuration
const newsSources = {
  general: {
    name: 'General News',
    sources: [
      {
        name: 'NewsAPI',
        endpoint: `https://newsapi.org/v2/top-headlines?category=general&country=us&apiKey=${NEWS_API_KEY}`
      },
      {
        name: 'GNews',
        endpoint: `https://gnews.io/api/v4/top-headlines?category=general&lang=en&token=${GNEWS_API_KEY}`
      }
    ]
  },
  technology: {
    name: 'Technology',
    sources: [
      {
        name: 'NewsAPI',
        endpoint: `https://newsapi.org/v2/top-headlines?category=technology&apiKey=${NEWS_API_KEY}`
      },
      {
        name: 'GNews',
        endpoint: `https://gnews.io/api/v4/top-headlines?category=technology&lang=en&token=${GNEWS_API_KEY}`
      }
    ]
  },
  business: {
    name: 'Business',
    sources: [
      {
        name: 'NewsAPI',
        endpoint: `https://newsapi.org/v2/top-headlines?category=business&apiKey=${NEWS_API_KEY}`
      },
      {
        name: 'GNews',
        endpoint: `https://gnews.io/api/v4/top-headlines?category=business&lang=en&token=${GNEWS_API_KEY}`
      }
    ]
  },
  sports: {
    name: 'Sports',
    sources: [
      {
        name: 'NewsAPI',
        endpoint: `https://newsapi.org/v2/top-headlines?category=sports&apiKey=${NEWS_API_KEY}`
      },
      {
        name: 'GNews',
        endpoint: `https://gnews.io/api/v4/top-headlines?category=sports&lang=en&token=${GNEWS_API_KEY}`
      }
    ]
  },
  health: {
    name: 'Health',
    sources: [
      {
        name: 'NewsAPI',
        endpoint: `https://newsapi.org/v2/top-headlines?category=health&apiKey=${NEWS_API_KEY}`
      },
      {
        name: 'GNews',
        endpoint: `https://gnews.io/api/v4/top-headlines?category=health&lang=en&token=${GNEWS_API_KEY}`
      }
    ]
  }
};

// Utility function to normalize articles from different sources
function normalizeArticle(article, source) {
  return {
    title: article.title,
    description: article.description || article.content?.substring(0, 150) + '...',
    url: article.url,
    urlToImage: article.urlToImage || article.image,
    publishedAt: article.publishedAt || article.publishedAt,
    source: {
      name: article.source?.name || source || 'Unknown'
    },
    author: article.author || 'Unknown'
  };
}

// Fetch articles from multiple sources
async function fetchFromMultipleSources(category) {
  const categoryConfig = newsSources[category];
  if (!categoryConfig) return [];

  const promises = categoryConfig.sources.map(async (source) => {
    try {
      const response = await axios.get(source.endpoint, {
        timeout: 10000
      });
      
      let articles = [];
      if (source.name === 'NewsAPI') {
        articles = response.data.articles || [];
      } else if (source.name === 'GNews') {
        articles = response.data.articles || [];
      }
      
      return articles.map(article => normalizeArticle(article, source.name));
    } catch (error) {
      console.error(`Error fetching from ${source.name}:`, error.message);
      return [];
    }
  });

  const results = await Promise.all(promises);
  const allArticles = results.flat();
  
  // Remove duplicates and sort by date
  const uniqueArticles = allArticles.filter((article, index, self) => 
    index === self.findIndex(a => a.title === article.title)
  );
  
  return uniqueArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

// API Routes
app.get('/api/categories', (req, res) => {
  const categories = Object.keys(newsSources).map(key => ({
    id: key,
    name: newsSources[key].name
  }));
  res.json(categories);
});

app.get('/api/news/:category', async (req, res) => {
  const category = req.params.category;
  
  try {
    const articles = await fetchFromMultipleSources(category);
    res.json({
      category: newsSources[category]?.name || 'Unknown',
      articles: articles.slice(0, 20), // Limit to 20 articles
      total: articles.length
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

app.get('/api/search', async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Search query required' });
  }

  try {
    const searchPromises = [
      axios.get(`https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`),
      axios.get(`https://gnews.io/api/v4/search?q=${encodeURIComponent(q)}&lang=en&token=${GNEWS_API_KEY}`)
    ];

    const results = await Promise.allSettled(searchPromises);
    let allArticles = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const articles = result.value.data.articles || [];
        const sourceName = index === 0 ? 'NewsAPI' : 'GNews';
        allArticles.push(...articles.map(article => normalizeArticle(article, sourceName)));
      }
    });

    // Remove duplicates
    const uniqueArticles = allArticles.filter((article, index, self) => 
      index === self.findIndex(a => a.title === article.title)
    );

    res.json({
      query: q,
      articles: uniqueArticles.slice(0, 20),
      total: uniqueArticles.length
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`News aggregator server running on port ${PORT}`);
});

module.exports = app;
