/**
 * Carousel Module with error handling, image fallback, and JSON validation
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
    state.isAnimating = true;
    const container = document.getElementById('carousel-container');
    const currentItem = container ? container.querySelector('.carousel-item') : null;
    if (currentItem) currentItem.classList.add('carousel-fade-out');
    setTimeout(() => {
      state.currentIndex = (state.currentIndex + 1) % state.newsItems.length;
      renderItem(state.currentIndex);
      state.isAnimating = false;
    }, 300);
  }

  function prev() {
    if (state.newsItems.length === 0) return;
    state.isAnimating = true;
    const container = document.getElementById('carousel-container');
    const currentItem = container ? container.querySelector('.carousel-item') : null;
    if (currentItem) currentItem.classList.add('carousel-fade-out');
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

    let carouselItem = container.querySelector('.carousel-item');
    if (!carouselItem) {
      carouselItem = document.createElement('div');
      carouselItem.className = 'carousel-item';
      container.innerHTML = '';
      container.appendChild(carouselItem);
    }

    let contentHTML = '';
    if (item.type === 'birthday') {
      contentHTML = '<div class="birthday-card"><h2 class="birthday-title">Gratulerer med dagen!</h2><div class="birthday-names">' + (item.names ? item.names.join(', ') : '') + '</div><p class="birthday-message">' + (item.message || '') + '</p></div>';
    } else {
      const imageUrl = item.image_url || '';
      const sourceName = item.source_name || 'Kilde';
      const title = item.title || '';
      const summary = item.summary || '';
      const sourceUrl = item.source_url || '';

      contentHTML = '<div class="carousel-content">' +
        '<div class="carousel-image-wrapper">' +
        '<img src="' + imageUrl + '" alt="' + title + '" class="carousel-image" />' +
        '<div class="image-fallback" style="display: none;">' +
        '<span class="fallback-text">' + sourceName + '</span>' +
        '</div>' +
        '</div>' +
        '<div class="carousel-text">' +
        '<h2 class="carousel-headline">' + title + '</h2>' +
        '<p class="carousel-summary">' + summary + '</p>' +
        '</div>' +
        '<div class="carousel-meta">' +
        '<div id="qr-code" class="qr-code"></div>' +
        '<span class="source-name">' + sourceName + '</span>' +
        '</div>' +
        '</div>';

      setTimeout(() => { generateQRCode(sourceUrl); }, 0);
    }

    carouselItem.innerHTML = contentHTML;

    // Attach image error handler after rendering
    const img = carouselItem.querySelector('.carousel-image');
    if (img) {
      img.onerror = function() {
        img.style.display = 'none';
        const fallback = carouselItem.querySelector('.image-fallback');
        if (fallback) fallback.style.display = 'flex';
        console.warn('Image failed to load:', img.src);
      };
      if (img.src) {
        img.onload = function() {
          img.classList.add('loaded');
        };
      }
    }

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

  function showNoNewsMessage() {
    const container = document.getElementById('no-news-message');
    if (container) {
      container.style.display = 'flex';
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
