const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

/*
const Documentation(){
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

  // Simple hardcoded user database for demonstration
  const users = [
    {
      email: 'user@example.com',
      password: 'password123' // In real apps, passwords must be hashed and stored securely
    }
  ];

  // Login API endpoint
  app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      // Login successful
      return res.json({ message: 'Login successful' });
    } else {
      // Login failed
      return res.status(401).json({ error: 'Invalid email or password' });
    }
  });

    
  // Simple hardcoded user database for demonstration
  const users = [
    {
      email: 'user@example.com',
      password: 'password123' // In real apps, passwords must be hashed and stored securely
    }
  ];

  // Login API endpoint
  app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      // Login successful
      return res.json({ message: 'Login successful' });
    } else {
      // Login failed
      return res.status(401).json({ error: 'Invalid email or password' });
    }
  });

  // Fallback route
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
*/

const app = express();
const PORT = process.env.PORT || 3000;

// API Keys called from environment variable
const NEWS_API_KEY = process.env.NEWS_API_KEY || 'your_newsapi_key';
const NYT_API_KEY = process.env.NYT_API_KEY || '';

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

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
  console.log(`Server running on http://localhost:${PORT}`);
});
