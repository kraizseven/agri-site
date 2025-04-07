document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const navLinksContainer = document.getElementById('navLinks');
    const newsContainer = document.getElementById('newsContainer');
    const categoryTitle = document.getElementById('categoryTitle');
    const sourceFilter = document.getElementById('sourceFilter');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  
    // Current category
    let currentCategory = 'general';
    let currentArticles = [];
  
    // Initialize the app
    init();
  
    function init() {
      loadCategories();
      loadNews(currentCategory);
      setupEventListeners();
    }
  
    // Fetch and display categories
    async function loadCategories() {
      try {
        const response = await fetch('/api/categories');
        const categories = await response.json();
        
        // Render navigation links
        navLinksContainer.innerHTML = categories.map(category => `
          <li>
            <a href="#" class="nav-link ${category.id === currentCategory ? 'active' : ''}" 
               data-category="${category.id}">${category.name}</a>
          </li>
        `).join('');
        
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    }
  
    // Fetch and display news articles
    async function loadNews(category) {
      try {
        // Show loading indicator
        loadingIndicator.style.display = 'flex';
        newsContainer.innerHTML = '';
        
        const response = await fetch(`/api/news/${category}`);
        const data = await response.json();
        
        currentArticles = data.articles;
        categoryTitle.textContent = data.category;
        
        renderArticles(currentArticles);
        updateSourceFilter(currentArticles);
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
          link.classList.remove('active');
          if (link.dataset.category === category) {
            link.classList.add('active');
          }
        });
        
      } catch (error) {
        console.error('Error loading news:', error);
        newsContainer.innerHTML = `
          <div class="error-message">
            <p>Failed to load news. Please try again later.</p>
          </div>
        `;
      } finally {
        loadingIndicator.style.display = 'none';
      }
    }
  
    // Render articles to the DOM
    function renderArticles(articles) {
      if (articles.length === 0) {
        newsContainer.innerHTML = `
          <div class="no-articles">
            <p>No articles found for this category.</p>
          </div>
        `;
        return;
      }
      
      newsContainer.innerHTML = articles.map(article => `
        <div class="news-card">
          ${article.image ? `
            <img src="${article.image}" alt="${article.title}" class="news-image" 
                 onerror="this.src='https://via.placeholder.com/300x180?text=No+Image'">
          ` : `
            <img src="https://via.placeholder.com/300x180?text=No+Image" alt="No image available" class="news-image">
          `}
          <div class="news-content">
            <h3 class="news-title">${article.title}</h3>
            <p class="news-description">${article.description || 'No description available.'}</p>
            <div class="news-meta">
              <span>${article.source}</span>
              <span>${article.publishedAt}</span>
            </div>
            <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="read-more">Read More</a>
          </div>
        </div>
      `).join('');
    }
  
    // Update source filter options
    function updateSourceFilter(articles) {
      const sources = [...new Set(articles.map(article => article.source))];
      
      sourceFilter.innerHTML = `
        <option value="all">All Sources</option>
        ${sources.map(source => `
          <option value="${source}">${source}</option>
        `).join('')}
      `;
    }
  
    // Filter articles by source
    function filterArticlesBySource(source) {
      if (source === 'all') {
        renderArticles(currentArticles);
      } else {
        const filteredArticles = currentArticles.filter(article => article.source === source);
        renderArticles(filteredArticles);
      }
    }
  
    // Set up event listeners
    function setupEventListeners() {
      // Navigation links
      navLinksContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('nav-link')) {
          e.preventDefault();
          const category = e.target.dataset.category;
          currentCategory = category;
          loadNews(category);
        }
      });
      
      // Source filter
      sourceFilter.addEventListener('change', function() {
        filterArticlesBySource(this.value);
      });
      
      // Mobile menu toggle
      mobileMenuBtn.addEventListener('click', function() {
        navLinksContainer.classList.toggle('active');
      });
      
      // Close mobile menu when clicking outside
      document.addEventListener('click', function(e) {
        if (!e.target.closest('nav') && !e.target.closest('.mobile-menu')) {
          navLinksContainer.classList.remove('active');
        }
      });
    }
  });