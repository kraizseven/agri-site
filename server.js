const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// API Keys (in a real app, use environment variables)
const NEWS_API_KEY = process.env.NEWS_API_KEY || 'your_newsapi_key';
const NYT_API_KEY = process.env.NYT_API_KEY || 'your_nytapi_key';

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// News API endpoints
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
    const response = await axios.get(newsSources[category].endpoint);
    const articles = response.data.articles.map(article => ({
      title: article.title,
      description: article.description,
      url: article.url,
      image: article.urlToImage,
      source: article.source.name,
      publishedAt: new Date(article.publishedAt).toLocaleDateString()
    }));
    
    res.json({
      category: newsSources[category].name,
      articles
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
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

// Fallback route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});