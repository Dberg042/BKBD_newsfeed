// Infoskjerm News Display - with error handling, JSON validation, warning indicator
window.APP = {
  config: { 
    pollingInterval: 300000, 
    retryAttempts: 3, 
    retryDelays: [1000, 3000, 9000], 
    dataFolder: 'data' 
  },
  state: { 
    lastKnownGood: null, 
    lastFetchDate: null, 
    currentNews: [], 
    failureCount: 0, 
    isPolling: false, 
    isLoading: false 
  },

  async init() {
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);
    await this.loadNewsContent();
    this.startPolling();
  },

  updateClock() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = now.toLocaleDateString('no-NO', options);
    const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    const hd = document.getElementById('header-date');
    const ht = document.getElementById('header-time');
    if (hd) hd.textContent = dateStr;
    if (ht) ht.textContent = timeStr;
  },

  async fetchActiveDate(retryCount = 0) {
    try {
      const resp = await fetch('data/active.json?t=' + Date.now());
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const data = await resp.json();
      return data.date || new Date().toISOString().split('T')[0];
    } catch (e) {
      if (retryCount < this.config.retryAttempts) {
        await new Promise(r => setTimeout(r, this.config.retryDelays[retryCount]));
        return this.fetchActiveDate(retryCount + 1);
      }
      return null;
    }
  },

  validateNewsItem(item) {
    // Validate that item has required fields
    if (!item || typeof item !== 'object') {
      console.warn('Invalid news item: not an object');
      return false;
    }
    // Allow items with at least title and source_name
    if (!item.title && !item.headline) {
      console.warn('Invalid news item: missing title');
      return false;
    }
    return true;
  },

  async loadNewsContent(dateOverride) {
    if (this.state.isLoading) return;
    this.state.isLoading = true;
    try {
      let date = dateOverride || await this.fetchActiveDate();
      if (!date) { 
        this.showFallback(); 
        return; 
      }
      const promises = [];
      for (let i = 1; i <= 7; i++) {
        promises.push(this.fetchNewsItem(date, 'news-' + String(i).padStart(2, '0') + '.json'));
      }
      // Also try to load birthday.json
      promises.push(this.fetchNewsItem(date, 'birthday.json'));
      
      const results = await Promise.all(promises);
      const newsItems = results.filter(item => item !== null && this.validateNewsItem(item));
      
      if (newsItems.length === 0) { 
        this.showFallback(); 
        return; 
      }
      
      newsItems.sort((a, b) => (a.priority || 999) - (b.priority || 999));
      this.state.currentNews = newsItems;
      this.state.lastFetchDate = date;
      this.state.lastKnownGood = { items: newsItems, date };
      this.state.failureCount = 0;
      this.hideErrorIndicator();
      try { 
        localStorage.setItem('APP_lastKnownGood', JSON.stringify(this.state.lastKnownGood)); 
      } catch (e) {}
      this.displayCarousel(newsItems);
      this.hideFallback();
    } catch (e) {
      console.error('Error loading news:', e);
      this.state.failureCount++;
      if (this.state.failureCount >= 3) {
        this.showErrorIndicator();
      }
    } finally {
      this.state.isLoading = false;
    }
  },

  async fetchNewsItem(date, filename, retryCount = 0) {
    try {
      const resp = await fetch('data/' + date + '/' + filename);
      if (resp.status === 404) return null;
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const data = await resp.json();
      return data;
    } catch (e) {
      if (retryCount < this.config.retryAttempts) {
        await new Promise(r => setTimeout(r, this.config.retryDelays[retryCount]));
        return this.fetchNewsItem(date, filename, retryCount + 1);
      }
      console.warn('Failed to fetch ' + filename + ':', e.message);
      return null;
    }
  },

  displayCarousel(newsItems) {
    if (newsItems.length === 0) return;
    window.carousel.init(newsItems);
  },

  showFallback() {
    const fb = document.getElementById('fallback-state');
    if (fb) fb.style.display = 'flex';
  },

  hideFallback() {
    const fb = document.getElementById('fallback-state');
    if (fb) fb.style.display = 'none';
  },

  showErrorIndicator() {
    const indicator = document.getElementById('fallback-state');
    if (indicator) {
      indicator.style.display = 'flex';
      indicator.innerHTML = '<div class="error-message"><div class="warning-icon">⚠</div><h2>Tilkoblingsproblem</h2><p>Viser lagret innhold.</p></div>';
      indicator.style.backgroundColor = 'rgba(10, 15, 26, 0.9)';
      indicator.style.borderTop = '4px solid #FF6B35';
    }
  },

  hideErrorIndicator() {
    const indicator = document.getElementById('fallback-state');
    if (indicator) {
      indicator.style.display = 'none';
    }
  },

  startPolling() {
    if (this.state.isPolling) return;
    this.state.isPolling = true;
    setInterval(() => this.checkUpdates(), this.config.pollingInterval);
  },

  async checkUpdates() {
    const nd = await this.fetchActiveDate();
    if (nd && nd !== this.state.lastFetchDate) {
      location.reload();
    }
  }
};

document.addEventListener('DOMContentLoaded', () => window.APP.init());
if (document.readyState === 'complete' || document.readyState === 'interactive') window.APP.init();
