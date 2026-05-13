/**
 * Main App Module
 * Handles data loading, polling, and carousel initialization
 */

const app = (() => {
  let state = {
    currentDate: null,
    newsData: [],
    lastFetch: null,
    retryCount: 0,
    maxRetries: 3,
  };

  /**
   * Initialize the application
   */
  async function init() {
    console.log('App: Initializing...');
    await loadNewsContent();
    startPolling();
  }

  /**
   * Load news content from active.json and date folder
   */
  async function loadNewsContent() {
    try {
      // Fetch active.json to get current date
      const activeResponse = await fetch('data/active.json');
      if (!activeResponse.ok) throw new Error('Failed to fetch active.json');
      
      const activeData = await activeResponse.json();
      state.currentDate = activeData.date;
      
      console.log('App: Loading news for date:', state.currentDate);

      // Fetch all news files for this date
      const newsFiles = ['news-01', 'news-02', 'news-03', 'news-04', 'news-05', 'news-06', 'news-07'];
      const newsPromises = newsFiles.map(filename =>
        fetch(`data/${state.currentDate}/${filename}.json`)
          .then(res => res.ok ? res.json() : null)
          .catch(() => null)
      );

      const newsItems = await Promise.all(newsPromises);
      
      // Filter out null items and sort by priority
      state.newsData = newsItems
        .filter(item => item !== null)
        .sort((a, b) => (a.priority || 999) - (b.priority || 999));

      // Try to fetch birthday.json
      try {
        const birthdayResponse = await fetch(`data/${state.currentDate}/birthday.json`);
        if (birthdayResponse.ok) {
          const birthdayData = await birthdayResponse.json();
          state.newsData.push(birthdayData);
          console.log('App: Birthday card loaded');
        }
      } catch (error) {
        console.log('App: No birthday card found (404 is expected)');
      }

      console.log('App: Loaded ' + state.newsData.length + ' news items');
      
      // Initialize carousel with loaded news data
      if (window.carousel && state.newsData.length > 0) {
        window.carousel.init(state.newsData);
        state.retryCount = 0;
      }

      return true;
    } catch (error) {
      console.error('App: Error loading news content:', error);
      state.retryCount++;
      
      if (state.retryCount < state.maxRetries) {
        const delay = Math.pow(3, state.retryCount - 1) * 1000; // 1s, 3s, 9s
        console.log('App: Retrying in ' + (delay / 1000) + 's...');
        await new Promise(resolve => setTimeout(resolve, delay));
        return loadNewsContent();
      }
      
      return false;
    }
  }

  /**
   * Start polling active.json every 5 minutes
   */
  function startPolling() {
    // Poll every 5 minutes
    setInterval(async () => {
      console.log('App: Polling active.json...');
      try {
        const timestamp = new Date().getTime();
        const response = await fetch('data/active.json?t=' + timestamp);
        if (!response.ok) throw new Error('Failed to fetch active.json');
        
        const activeData = await response.json();
        
        if (activeData.date !== state.currentDate) {
          console.log('App: Date changed from ' + state.currentDate + ' to ' + activeData.date);
          console.log('App: Reloading page...');
          location.reload();
        }
      } catch (error) {
        console.error('App: Polling error:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    getState: () => state,
  };
})();
