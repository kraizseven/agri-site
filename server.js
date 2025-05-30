const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
// API keys
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const GNEWS_API_KEY = process.env.GNEWS_API_KEY;

// Add validation
if (!NEWS_API_KEY || !GNEWS_API_KEY) {
  console.error('Missing required API keys');
  process.exit(1);
}

// Add error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// News API end-points
const newsSources = {
  general: {
    name: 'General Technology',
    endpoint: `https://newsapi.org/v2/top-headlines?category=technology&apiKey=${NEWS_API_KEY}`
  },
  ai: {
    name: 'Artificial Intelligence',
    endpoint: `https://newsapi.org/v2/everything?q=artificial+intelligence&apiKey=${NEWS_API_KEY}`
  },
  programming: {
    name: 'Programming',
    endpoint: `https://newsapi.org/v2/everything?q=programming+OR+coding+OR+developer&apiKey=${NEWS_API_KEY}`
  },
  gadgets: {
    name: 'Gadgets',
    endpoint: `https://newsapi.org/v2/everything?q=gadgets+OR+smartphones+OR+wearables&apiKey=${NEWS_API_KEY}`
  },
  cybersecurity: {
    name: 'Cybersecurity',
    endpoint: `https://newsapi.org/v2/everything?q=cybersecurity+OR+hacking+OR+privacy&apiKey=${NEWS_API_KEY}`
  },
  startups: {
    name: 'Tech Startups',
    endpoint: `https://newsapi.org/v2/everything?q=startups+OR+venture+capital+OR+tech+funding&apiKey=${NEWS_API_KEY}`
  }
};

// Route to fetch news by category
app.get('/api/news/:category', async (req, res) => {
  const category = req.params.category;
  
  if (!newsSources[category]) {
    return res.status(404).json({ error: 'Category not found' });
  }

  try {
    console.log(`Fetching news for category: ${category}`);
    const response = await axios.get(newsSources[category].endpoint);
    
    if (!response.data || !response.data.articles) {
      return res.status(500).json({ error: 'Invalid API response' });
    }
    
    const articles = response.data.articles.map(article => ({
      title: article.title,
      description: article.description,
      url: article.url,
      image: article.urlToImage,
      source: article.source?.name || 'Unknown',
      publishedAt: new Date(article.publishedAt).toLocaleDateString()
    }));
    
    res.json({
      category: newsSources[category].name,
      articles
    });
  } catch (error) {
    console.error('Error fetching news:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch news',
      details: error.response?.data?.message || error.message
    });
  }
});

// Route to get all categories
app.get('/api/categories', (req, res) => {
  const categories = Object.keys(newsSources).map(key => ({
    id: key,
    name: newsSources[key].name
  }));
  res.json(categories);
});

// New route to search news across multiple APIs
app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: 'Missing search query' });
  }

  try {
    // First try NewsAPI
    const newsApiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&lang=en&apiKey=${NEWS_API_KEY}`;
    let response = await axios.get(newsApiUrl);
    let articles = response.data.articles;

    if (!articles || articles.length === 0) {
      // If no results, try NYT API
      const gnewsURLcl = `https://gnews.io/api/v4/search?=${encodeURIComponent(query)}&lang=en&api-key=${GNEWS_API_KEY}`;
      response = await axios.get(gnewsURLcl);
      const docs = response.data.response.docs;
      if (!docs || docs.length === 0) {
        return res.json({ articles: [], message: 'No results found' });
      }
      articles = docs.map(doc => ({
        title: doc.headline.main,
        description: doc.abstract,
        url: doc.web_url,
        image: doc.multimedia.length > 0 ? `https://www.gnews.io/${doc.multimedia[0].url}` : null,
        source: 'New York Times',
        publishedAt: new Date(doc.pub_date).toLocaleDateString()
      }));
    } else {
      articles = articles.map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        image: article.urlToImage,
        source: article.source.name,
        publishedAt: new Date(article.publishedAt).toLocaleDateString()
      }));
    }

    res.json({ articles });
  } catch (error) {
    console.error('Error searching news:', error);
    res.status(500).json({ error: 'Failed to search news' });
  }
});

// Simple hardcoded user database for demonstration
const users = [
  {
    email: 'user@example.com',
    //password: 'password123' // In real apps, passwords must be hashed and stored securely
  }
];

// Login API endpoint
app.post('/api/login', (req, res) => {
  const email = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const user = users.find(u => u.email === email );
  if (user) {
    // Login successful
    return res.json({ message: 'successful' });
  } else {
    // Login failed
    return res.status(401).json({ error: 'Invalid email ' });
  }
});

// Fallback route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
