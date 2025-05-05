document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const navLinksContainer = document.getElementById('navLinks');
    const newsContainer = document.getElementById('newsContainer');
    const categoryTitle = document.getElementById('categoryTitle');
    const topicSearch = document.getElementById('topicSearch');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const signupModal = document.getElementById('signupModal');
    const closeModalBtn = document.getElementById('closeModal');
    const signupButton = document.getElementById('signupButton');
  
    // Current category
    let currentCategory = 'general';
    let currentArticles = [];
  
    // Initialize the app
    init();
  
    function init() {
      loadCategories();
      loadNews(currentCategory);
      setupEventListeners();
      applyDarkModeFromStorage();
      setupSignupPopupTimer();
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
        
        // Prepend login button at the top left corner
        const loginListItem = document.createElement('li');
        loginListItem.innerHTML = '<a href="#" class="nav-link" id="loginButton">Login</a>';
        navLinksContainer.prepend(loginListItem);
        
        // Add event listener for login button (optional: can be extended)
        const loginButton = document.getElementById('loginButton');
        loginButton.addEventListener('click', function(e) {
          e.preventDefault();
          // For now, just show the signup modal on login click
          showSignupModal();
        });
        
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
  
    // Set up event listeners
    function setupEventListeners() {
      // Navigation links
      navLinksContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('nav-link')) {
          e.preventDefault();
          const category = e.target.dataset.category;
          currentCategory = category;
          loadNews(category);
          topicSearch.value = ''; // Clear search on category change
        }
      });
      
      // Topic search input - call backend search API
      topicSearch.addEventListener('input', async function() {
        const searchTerm = this.value.trim();
        if (searchTerm === '') {
          // If empty, reload current category articles
          loadNews(currentCategory);
          return;
        }
        loadingIndicator.style.display = 'flex';
        newsContainer.innerHTML = '';
        try {
          const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
          const data = await response.json();
          if (data.articles && data.articles.length > 0) {
            renderArticles(data.articles);
          } else {
            newsContainer.innerHTML = `
              <div class="no-articles">
                <p>No results found.</p>
              </div>
            `;
          }
        } catch (error) {
          console.error('Error searching news:', error);
          newsContainer.innerHTML = `
            <div class="error-message">
              <p>Failed to search news. Please try again later.</p>
            </div>
          `;
        } finally {
          loadingIndicator.style.display = 'none';
        }
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

      // Dark mode toggle
      darkModeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
          localStorage.setItem('darkMode', 'enabled');
        } else {
          localStorage.setItem('darkMode', 'disabled');
        }
      });

      // Modal close button
      closeModalBtn.addEventListener('click', function() {
        hideSignupModal();
      });

      // Signup button in modal
      signupButton.addEventListener('click', function() {
        // For now, just hide modal on signup click
        hideSignupModal();
        alert('Thank you for signing up!');
      });

      // Close modal when clicking outside modal content
      window.addEventListener('click', function(event) {
        if (event.target === signupModal) {
          hideSignupModal();
        }
      });
    }

    // Show signup modal
    function showSignupModal() {
      signupModal.style.display = 'block';
    }

    // Hide signup modal
    function hideSignupModal() {
      signupModal.style.display = 'none';
    }

    // Setup timer to show signup popup after 3 minutes (180000 ms)
    function setupSignupPopupTimer() {
      setTimeout(() => {
        showSignupModal();
      }, 180000);
    }

    // Apply dark mode from localStorage on page load
    function applyDarkModeFromStorage() {
      const darkModeSetting = localStorage.getItem('darkMode');
      if (darkModeSetting === 'enabled') {
        document.body.classList.add('dark-mode');
      }
    }
  });

