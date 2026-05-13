window.APP = {
  config: { 
    pollingInterval: 300000, 
    retryAttempts: 3, 
    retryDelays: [1000, 3000, 9000], 
    dataFolder: 'data',
    failureThreshold: 3
  },
  state: { 
    lastKnownGood: null, 
    lastFetchDate: null, 
    currentNews: [], 
    consecutiveFailures: 0, 
    isPolling: false, 
    isLoading: false,
    hasShownWarning: false
  },

  async init() {
    try {
      const saved = localStorage.getItem('APP_lastKnownGood');
      if (saved) {
        this.state.lastKnownGood = JSON.parse(saved);
      }
    } catch (e) {}
    
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);
    await this.loadNewsContent();
    this.startPolling();
  },

  updateClock() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = now
      .toLocaleDateString('no-NO', options)
      .split(' ')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
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
        const delay = this.config.retryDelays[retryCount];
        console.warn('Active.json retry ' + (retryCount + 1) + ' in ' + delay + 'ms');
        await new Promise(r => setTimeout(r, delay));
        return this.fetchActiveDate(retryCount + 1);
      }
      console.error('Active.json failed after 3 attempts');
      return null;
    }
  },

  validateNewsItem(item) {
    if (!item || typeof item !== 'object') {
      return false;
    }
    if (!item.title && !item.headline) {
      return false;
    }
    return true;
  },

  async loadNewsContent(dateStr = null) {
    if (this.state.isLoading) return;
    this.state.isLoading = true;
    try {
      // Use provided date string, or fetch from active.json if null (backward compatible)
      let date = dateStr || await this.fetchActiveDate();
      if (!date) { 
        this.handleFetchFailure();
        return; 
      }
      
      const promises = [];
      for (let i = 1; i <= 7; i++) {
        promises.push(this.fetchNewsItem(date, 'news-' + String(i).padStart(2, '0') + '.json'));
      }
      promises.push(this.fetchNewsItem(date, 'birthday.json'));
      
      const results = await Promise.all(promises);
      const newsItems = results.filter(item => item !== null && this.validateNewsItem(item));
      
      if (newsItems.length === 0) {
        this.handleFetchFailure();
        return; 
      }
      
      newsItems.sort((a, b) => (a.priority || 999) - (b.priority || 999));
      this.state.currentNews = newsItems;
      this.state.lastFetchDate = date;
      this.state.lastKnownGood = { items: newsItems, date };
      this.state.consecutiveFailures = 0;
      this.state.hasShownWarning = false;
      this.hideErrorIndicator();
      
      try { 
        localStorage.setItem('APP_lastKnownGood', JSON.stringify(this.state.lastKnownGood)); 
      } catch (e) {}
      
      this.displayCarousel(newsItems);
      this.hideFallback();
    } catch (e) {
      console.error('Error loading news:', e);
      this.handleFetchFailure();
    } finally {
      this.state.isLoading = false;
    }
  },

  handleFetchFailure() {
    this.state.consecutiveFailures++;
    console.warn('Consecutive failures: ' + this.state.consecutiveFailures);
    
    if (this.state.consecutiveFailures >= this.config.failureThreshold && !this.state.hasShownWarning) {
      this.showErrorIndicator();
      this.state.hasShownWarning = true;
    }
    
    if (this.state.lastKnownGood && this.state.lastKnownGood.items && this.state.lastKnownGood.items.length > 0) {
      this.displayCarousel(this.state.lastKnownGood.items);
    } else {
      this.showFallback();
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
        const delay = this.config.retryDelays[retryCount];
        await new Promise(r => setTimeout(r, delay));
        return this.fetchNewsItem(date, filename, retryCount + 1);
      }
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
      const html = '<div style="text-align:center;padding:32px;background:rgba(15,20,32,0.95);border-radius:8px;border-top:4px solid #FF6B35">' +
        '<div style="font-size:64px;margin-bottom:20px">X</div>' +
        '<h2 style="font-size:48px;color:#F5F7FA;margin-bottom:16px">Tilkoblingsproblem</h2>' +
        '<p style="font-size:28px;color:#D0D8E0">Viser lagret innhold</p>' +
        '</div>';
      indicator.innerHTML = html;
      indicator.style.display = 'flex';
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
    if (document.hidden) return;
    const nd = await this.fetchActiveDate();
    if (nd && nd !== this.state.lastFetchDate) {
      location.reload();
    }
  }
};

document.addEventListener('DOMContentLoaded', () => window.APP.init());
if (document.readyState === 'complete' || document.readyState === 'interactive') window.APP.init();
