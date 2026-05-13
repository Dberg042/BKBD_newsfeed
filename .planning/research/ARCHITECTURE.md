---
name: ARCHITECTURE
description: System architecture and component structure for TV display
date: [2026-05-13]
---

# Architecture Research: Infoskjerm

## System Overview

**Data flow:** Hermes (external) → Git repository (active.json + date folders) → Client app → TV display

The architecture is deliberately simple: stateless client that reads from git, with approval gate via active.json pointer file.

## Component Structure

### Data Loading Layer (app.js)
- Fetches `active.json` to determine current date
- Polls active.json every 5 minutes for date changes
- Parallel-fetches up to 8 JSON files from data/{date}/ folder
- Implements retry logic: exponential backoff (1s, 3s, 9s)
- Caches last known good state for fallback
- Manages polling cycle with cache-busting (?t={timestamp})

### State Management
- Single source of truth: current date from active.json
- Carousel state: current item index, timer, loaded items
- Error state: connection status, fallback messages
- No complex state mutations; mostly read-only

### Carousel Engine (carousel.js)
- 15-second timer per item (configurable)
- 600ms cross-fade transitions between items
- Progress bar animation (smooth linear over 15s)
- Queue preview (next 3 items)
- Birthday card handling (optional, skipped if not found)

### Rendering Layer (HTML/DOM)
- Vanilla DOM manipulation (no VDOM framework)
- CSS animations for smooth transitions
- Responsive grid layout at 1920×1080
- Tailwind utility classes for styling

### QR Code Generator (qr.js)
- Generates 200×200px QR codes client-side
- Encodes source_url field from news item
- Uses qr-code-styling library via CDN
- Fresh generation per carousel item (no caching)

## Key Design Decisions

### 1. JSON Files in Git (Not API)
- **Why:** No backend infrastructure needed, complete audit trail, easy rollback, local testability
- **Trade-off:** Polling latency (5 minutes); acceptable for news carousel
- **Not a limitation:** Intentional architecture choice for governance

### 2. active.json Pointer (Not Direct Selection)
- **Why:** Single source of truth, approval gate, atomic updates
- **User flow:** Edit one line in active.json to activate new content
- **Benefits:** Prevents race conditions, clear approval record in git

### 3. 5-Minute Polling Interval
- **Why:** Fast enough for user expectations, slow enough to avoid CDN throttling
- **Cache-busting:** Query params (?t={timestamp}) bypass GitHub Pages CDN
- **Fallback:** Last known good state if all retries fail

### 4. Multi-Level Error Recovery
1. **Retry logic:** Exponential backoff (1s, 3s, 9s)
2. **Last known good state:** Keep showing old content if updates fail
3. **Fallback message:** "No news available" if nothing ever loads
4. **Visual indicator:** Warning badge shows connection status

## Build Dependencies

Build order matters for testing:

**Phase 1: Foundation**
- index.html (HTML structure)
- test.html (preview clone)
- style.css (Tailwind setup, keyframes)

**Phase 2: Data Layer**
- app.js (fetch, polling, state, retry logic)
- Sample data files (data/2026-05-13/)

**Phase 3: Display Logic**
- carousel.js (timer, transitions, progress bar)
- qr.js (QR generation)

**Phase 4: Polish**
- Connection warning UI
- Image fallback states
- Layout verification

## Critical Patterns

- **Separation of concerns:** Data, state, display are separate
- **Graceful degradation:** Always show something, never blank screen
- **Polling with fallback:** Retry logic + cache-busting + last known good state
- **Stateless client:** No persistent backend, rely on git as source of truth
- **Testing in isolation:** Each component can be tested separately

## Performance Characteristics

- Initial load: <1 second
- Memory footprint: 3-5MB (vs React 15-20MB)
- Carousel transitions: <50ms (GPU-accelerated CSS)
- Polling overhead: <1KB per check
- Image loading: Lazy (on carousel transition)

---

*Research completed: 2026-05-13*
*Source: Digital signage architecture patterns, polling system best practices*
