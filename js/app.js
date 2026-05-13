// Infoskjerm News Display
window.APP = {
  config: { pollingInterval: 300000, retryAttempts: 3, retryDelays: [1000, 3000, 9000], dataFolder: 'data' },
  state: { lastKnownGood: null, lastFetchDate: null, currentNews: [], failureCount: 0, isPolling: false, isLoading: false },
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
  async loadNewsContent(dateOverride) {
    if (this.state.isLoading) return;
    this.state.isLoading = true;
    try {
      let date = dateOverride || await this.fetchActiveDate();
      if (!date) { this.showFallback(); return; }
      const promises = [];
      for (let i = 1; i <= 7; i++) {
        promises.push(this.fetchNewsItem(date, 'news-' + String(i).padStart(2, '0') + '.json'));
      }
      const results = await Promise.all(promises);
      const newsItems = results.filter(item => item !== null);
      if (newsItems.length === 0) { this.showFallback(); return; }
      newsItems.sort((a, b) => (a.priority || 999) - (b.priority || 999));
      this.state.currentNews = newsItems;
      this.state.lastFetchDate = date;
      this.state.lastKnownGood = { items: newsItems, date };
      this.state.failureCount = 0;
      try { localStorage.setItem('APP_lastKnownGood', JSON.stringify(this.state.lastKnownGood)); } catch (e) {}
      this.displayCarousel(newsItems);
      this.hideFallback();
    } catch (e) {
      this.state.failureCount++;
      if (this.state.failureCount >= 3) this.showWarning('Connection issue');
    } finally {
      this.state.isLoading = false;
    }
  },
  async fetchNewsItem(date, filename, retryCount = 0) {
    try {
      const resp = await fetch('data/' + date + '/' + filename);
      if (resp.status === 404) return null;
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      return await resp.json();
    } catch (e) {
      if (retryCount < this.config.retryAttempts) {
        await new Promise(r => setTimeout(r, this.config.retryDelays[retryCount]));
        return this.fetchNewsItem(date, filename, retryCount + 1);
      }
      return null;
    }
  },
  displayCarousel(newsItems) {
    if (newsItems.length === 0) return;
    this.showItem(newsItems[0], 0, newsItems.length);
    this.updateQueuePreview(newsItems);
  },
  showItem(item, index, total) {
    const h = document.getElementById('carousel-headline');
    const s = document.getElementById('carousel-summary');
    const src = document.getElementById('carousel-source');
    const ci = document.getElementById('current-item');
    const ti = document.getElementById('total-items');
    if (h) h.textContent = item.title || item.headline || 'Loading...';
    if (s) s.textContent = item.summary || 'No summary';
    if (src) src.textContent = item.source_name || 'Source';
    if (ci) ci.textContent = index + 1;
    if (ti) ti.textContent = total;
    const img = document.getElementById('carousel-image');
    if (img && item.image_url) {
      img.src = item.image_url;
      img.onload = () => img.classList.add('loaded');
      img.onerror = () => {
        img.classList.remove('loaded');
        const fb = document.getElementById('image-fallback');
        if (fb) fb.classList.add('visible');
      };
    }
    if (window.QRCodeStyling && item.source_url) this.genQR(item.source_url);
  },
  genQR(url) {
    try {
      const qrc = document.getElementById('qr-code');
      if (!qrc || !window.QRCodeStyling) return;
      qrc.innerHTML = '';
      const q = new window.QRCodeStyling({
        width: 200, height: 200, data: url, margin: 10,
        qrOptions: { errorCorrectionLevel: 'M' },
        dotsOptions: { color: '#FF6B35', type: 'rounded' },
        backgroundOptions: { color: '#1A2233' }
      });
      q.append(qrc);
    } catch (e) {}
  },
  updateQueuePreview(items) {
    const qp = document.getElementById('queue-preview');
    if (!qp) return;
    qp.innerHTML = '';
    items.slice(1, 4).forEach((item) => {
      const div = document.createElement('div');
      div.className = 'text-sm text-[#A0A8B8] truncate';
      div.textContent = '→ ' + (item.title || item.headline || 'Item');
      qp.appendChild(div);
    });
  },
  showFallback() {
    const fb = document.getElementById('fallback-state');
    if (fb) fb.classList.add('visible');
  },
  hideFallback() {
    const fb = document.getElementById('fallback-state');
    if (fb) fb.classList.remove('visible');
  },
  showWarning(msg) {
    let w = document.querySelector('.warning-indicator');
    if (!w) {
      w = document.createElement('div');
      w.className = 'warning-indicator';
      document.body.appendChild(w);
    }
    w.textContent = 'Warning: ' + msg;
    w.classList.add('visible');
    setTimeout(() => w.classList.remove('visible'), 5000);
  },
  startPolling() {
    if (this.state.isPolling) return;
    this.state.isPolling = true;
    setInterval(() => this.checkUpdates(), this.config.pollingInterval);
  },
  async checkUpdates() {
    const nd = await this.fetchActiveDate();
    if (nd && nd !== this.state.lastFetchDate) location.reload();
  }
};
document.addEventListener('DOMContentLoaded', () => window.APP.init());
if (document.readyState === 'complete' || document.readyState === 'interactive') window.APP.init();
