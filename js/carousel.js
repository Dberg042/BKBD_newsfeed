/**
 * Carousel Module
 */
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
      console.warn('Carousel: No news items provided');
      showFallbackMessage();
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
    const currentItem = document.getElementById('carousel-item');
    if (currentItem) currentItem.classList.add('carousel-fade-out');
    state.isAnimating = true;
    setTimeout(() => {
      state.currentIndex = (state.currentIndex + 1) % state.newsItems.length;
      renderItem(state.currentIndex);
      state.isAnimating = false;
    }, 300);
  }

  function prev() {
    if (state.newsItems.length === 0) return;
    const currentItem = document.getElementById('carousel-item');
    if (currentItem) currentItem.classList.add('carousel-fade-out');
    state.isAnimating = true;
    setTimeout(() => {
      state.currentIndex = (state.currentIndex - 1 + state.newsItems.length) % state.newsItems.length;
      renderItem(state.currentIndex);
      state.isAnimating = false;
    }, 300);
  }

  function pause() { state.isPaused = true; }
  function resume() { state.isPaused = false; }
  function togglePause() { state.isPaused ? resume() : pause(); }

  function renderItem(index) {
    if (!state.newsItems[index]) return;
    const item = state.newsItems[index];
    const container = document.getElementById('carousel-container');
    if (!container) return;

    let carouselItem = document.getElementById('carousel-item');
    if (!carouselItem) {
      carouselItem = document.createElement('div');
      carouselItem.id = 'carousel-item';
      carouselItem.className = 'carousel-item';
      container.appendChild(carouselItem);
    }

    let contentHTML = '';
    if (item.type === 'birthday') {
      contentHTML = '<div class="birthday-card"><h2 class="birthday-title">Gratulerer med dagen!</h2><div class="birthday-names">' + (item.names ? item.names.join(', ') : '') + '</div><p class="birthday-message">' + (item.message || '') + '</p></div>';
    } else {
      const imageHTML = item.image_url ? '<img src="' + item.image_url + '" alt="' + item.title + '" class="carousel-image" onerror="this.style.display=\'none\'; document.querySelector(\'.image-fallback\').style.display=\'flex\';" />' : '';
      const fallbackHTML = '<div class="image-fallback" style="display: none;"><span class="fallback-text">' + (item.source_name || 'Kilde') + '</span></div>';
      contentHTML = '<div class="carousel-content"><div class="carousel-image-wrapper">' + imageHTML + fallbackHTML + '</div><div class="carousel-text"><h2 class="carousel-headline">' + (item.title || '') + '</h2><p class="carousel-summary">' + (item.summary || '') + '</p></div><div class="carousel-meta"><div id="qr-code" class="qr-code"></div><span class="source-name">' + (item.source_name || 'Kilde') + '</span></div></div>';
      setTimeout(() => { generateQRCode(item.source_url); }, 0);
    }

    carouselItem.innerHTML = contentHTML;
    carouselItem.classList.remove('carousel-fade-out');
    carouselItem.classList.add('carousel-fade-in');
    updateProgressBar();
    updateQueuePreview(index);
    setTimeout(() => { carouselItem.classList.remove('carousel-fade-in'); }, 300);
  }

  function updateProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    if (!progressBar) return;
    progressBar.style.animation = 'none';
    void progressBar.offsetWidth;
    progressBar.style.animation = 'progress-fill 15s linear forwards';
  }

  function updateQueuePreview(currentIndex) {
    const queuePreview = document.getElementById('queue-preview');
    if (!queuePreview) return;
    const nextItems = [];
    for (let i = 1; i <= 3; i++) {
      const nextIndex = (currentIndex + i) % state.newsItems.length;
      const nextItem = state.newsItems[nextIndex];
      if (nextItem) {
        let headline = nextItem.title || '';
        if (nextItem.type === 'birthday') {
          headline = 'Gratulerer med dagen' + (nextItem.names && nextItem.names[0] ? ' - ' + nextItem.names[0] : '');
        }
        headline = headline.substring(0, 30);
        if (headline.length === 30) headline += '...';
        nextItems.push(headline);
      }
    }
    queuePreview.textContent = 'Neste: → ' + nextItems.join(' → ');
  }

  function generateQRCode(url) {
    const qrContainer = document.getElementById('qr-code');
    if (!qrContainer || !window.QRCodeStyling) return;
    try {
      const qr = new QRCodeStyling({
        width: 200,
        height: 200,
        data: url || '',
        margin: 10,
        dotsOptions: { color: '#FF6B35', type: 'rounded' },
        backgroundOptions: { color: '#0A0F1A' },
        cornersSquareOptions: { type: 'rounded' },
        cornersDotOptions: { type: 'rounded' },
      });
      qrContainer.innerHTML = '';
      qr.append(qrContainer);
    } catch (error) {
      console.error('QR Code generation error:', error);
    }
  }

  function showFallbackMessage() {
    const container = document.getElementById('carousel-container');
    if (container) {
      container.innerHTML = '<div class="fallback-message"><h2>Ingen nyheter tilgjengelig i dag</h2><p>Carousel vil lastes når nyheter er tilgjengelig.</p></div>';
    }
  }

  function getState() {
    return {
      currentIndex: state.currentIndex,
      itemCount: state.newsItems.length,
      isPaused: state.isPaused,
      isAnimating: state.isAnimating,
    };
  }

  return { init, next, prev, pause, resume, togglePause, getState };
})();
