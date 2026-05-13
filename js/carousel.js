window.carousel = (() => {
  let state = {
    currentIndex: 0,
    newsItems: [],
    timer: null,
    isAnimating: false,
    isPaused: false,
  };

  function init(newsItems) {
    if (!newsItems || newsItems.length === 0) {
      showNoNewsMessage();
      return;
    }
    state.newsItems = newsItems;
    state.currentIndex = 0;
    state.isAnimating = false;
    state.isPaused = false;
    renderItem(0);
    startTimer();
  }

  function startTimer() {
    if (state.timer) clearInterval(state.timer);
    state.timer = setInterval(() => {
      if (!state.isPaused) next();
    }, 15000);
  }

  function next() {
    if (state.newsItems.length === 0) return;
    if (state.isAnimating) return;
    state.isAnimating = true;
    const item = document.querySelector('.carousel-item');
    if (item) item.classList.add('fade-out');
    setTimeout(() => {
      state.currentIndex = (state.currentIndex + 1) % state.newsItems.length;
      renderItem(state.currentIndex);
      state.isAnimating = false;
    }, 600);
  }

  function prev() {
    if (state.newsItems.length === 0) return;
    if (state.isAnimating) return;
    state.isAnimating = true;
    const item = document.querySelector('.carousel-item');
    if (item) item.classList.add('fade-out');
    setTimeout(() => {
      state.currentIndex = (state.currentIndex - 1 + state.newsItems.length) % state.newsItems.length;
      renderItem(state.currentIndex);
      state.isAnimating = false;
    }, 600);
  }

  function pause() { state.isPaused = true; }
  function resume() { state.isPaused = false; }
  function togglePause() { state.isPaused ? resume() : pause(); }

  function renderItem(index) {
    if (!state.newsItems[index]) return;
    const item = state.newsItems[index];
    const container = document.getElementById('carousel-container');
    if (!container) return;

    let html = '';
    
    if (item.type === 'birthday') {
      html = `
        <div class="carousel-item birthday-card">
          <div class="birthday-card-image">
            <div class="birthday-icon">🎉</div>
          </div>
          <div class="birthday-card-content">
            <h2 class="birthday-title">Gratulerer med dagen!</h2>
            <div class="birthday-names">${(item.names || []).join(', ')}</div>
            <p class="birthday-message">${item.message || ''}</p>
          </div>
        </div>
      `;
    } else {
      const imageUrl = item.image_url || '';
      const sourceName = item.source_name || 'Source';
      const title = item.title || '';
      const summary = item.summary || '';
      const sourceUrl = item.source_url || '';

      html = `
        <div class="carousel-item">
          <div class="carousel-wrapper">
            <div class="carousel-image-section">
              <img 
                src="${imageUrl}" 
                alt="${title}" 
                class="carousel-image"
                onerror="handleImageError(this)"
              />
              <div class="image-fallback">
                <div class="fallback-text">${sourceName}</div>
              </div>
              <div class="qr-overlay">
                <div id="qr-code"></div>
                <p class="qr-overlay-text">SCAN ME</p>
              </div>
            </div>
            <div class="carousel-content">
              <div class="carousel-content-top">
                <div class="carousel-headline-row">
                  <h2 class="carousel-headline">${title}</h2>
                </div>
                <p class="carousel-summary">${summary}</p>
              </div>
              <div class="carousel-meta">
                <span class="source-name">${sourceName}</span>
              </div>
            </div>
          </div>
        </div>
      `;

      setTimeout(() => { generateQRCode(sourceUrl); }, 0);
    }

    container.innerHTML = html;

    const img = container.querySelector('.carousel-image');
    if (img && img.src) {
      if (img.complete) {
        img.classList.add('loaded');
      } else {
        img.onload = () => img.classList.add('loaded');
      }
    }

    updateProgressBar();
    updateQueuePreview(index);
    updateItemCounter();
  }

  function handleImageError(img) {
    img.style.display = 'none';
    const fallback = img.parentElement?.querySelector('.image-fallback');
    if (fallback) fallback.classList.add('visible');
  }

  function updateProgressBar() {
    const bar = document.getElementById('progress-bar');
    if (!bar) return;
    bar.style.animation = 'none';
    void bar.offsetWidth;
    bar.style.animation = 'progress-fill 15s linear forwards';
  }

  function updateItemCounter() {
    const current = document.getElementById('current-item');
    const total = document.getElementById('total-items');
    if (current) current.textContent = state.currentIndex + 1;
    if (total) total.textContent = state.newsItems.length;
  }

  function updateQueuePreview(currentIndex) {
    const preview = document.getElementById('queue-preview');
    if (!preview) return;
    
    const items = [];
    for (let i = 1; i <= 3; i++) {
      const idx = (currentIndex + i) % state.newsItems.length;
      const nextItem = state.newsItems[idx];
      if (nextItem) {
        let title = nextItem.title || '';
        if (nextItem.type === 'birthday') {
          title = 'Gratulerer' + (nextItem.names?.[0] ? ' - ' + nextItem.names[0] : '');
        }
        items.push(title.substring(0, 40) + (title.length > 40 ? '...' : ''));
      } else {
        items.push('Kommer snart');
      }
    }

    while (items.length < 3) {
      items.push('Kommer snart');
    }
    
    preview.innerHTML = items.map(item => `<div class="queue-item">${item}</div>`).join('');
  }

  function generateQRCode(url) {
    const container = document.getElementById('qr-code');
    if (!container || !window.QRCodeStyling) return;
    
    try {
      const qr = new QRCodeStyling({
        width: 160,
        height: 160,
        data: url || 'https://example.com',
        margin: 8,
        dotsOptions: { color: '#FF6B35', type: 'rounded' },
        backgroundOptions: { color: 'transparent' },
        cornersSquareOptions: { type: 'rounded' },
        cornersDotOptions: { type: 'rounded', color: '#FF6B35' },
      });
      container.innerHTML = '';
      qr.append(container);
    } catch (e) {
      console.warn('QR generation failed:', e);
    }
  }

  function showNoNewsMessage() {
    const el = document.getElementById('no-news-message');
    if (el) el.classList.add('visible');
  }

  function getState() {
    return {
      currentIndex: state.currentIndex,
      itemCount: state.newsItems.length,
      isPaused: state.isPaused,
      isAnimating: state.isAnimating,
    };
  }

  window.handleImageError = handleImageError;

  return { init, next, prev, pause, resume, togglePause, getState };
})();
