# Phase 01 Plan 01: MVP Carousel Foundation Summary

**Phase:** 01-mvp-carousel-foundation  
**Plan:** 01-01  
**Subsystem:** Display & Layout  
**Status:** Complete  
**Completed:** 2026-05-13

---

## One-liner

Built production-ready carousel display with dark TV theme, data pipeline, and 5-minute polling for automatic content updates.

---

## Tasks Completed

| Task | Name | Status | Files | Commit |
|------|------|--------|-------|--------|
| 1 | Create index.html with Tailwind layout | ✓ Complete | index.html | acae0c7 |
| 2 | Create test.html preview mode | ✓ Complete | test.html | acae0c7 |
| 3 | Create css/style.css dark theme | ✓ Complete | css/style.css | acae0c7 |
| 4 | Create js/app.js data pipeline | ✓ Complete | js/app.js | acae0c7 |

---

## Deliverables

### index.html (Production Display)
- Tailwind CSS v4 CDN integration with dark theme configuration
- Header: 80px with date/time/logo (IDs: header-date, header-time)
- Carousel container with 16:9 aspect ratio card layout
- Image column (66% width) with fallback text display
- Content column (33% width) with headline, summary, source, QR placeholder
- Footer: 120px with progress bar animation and queue preview
- All required element IDs present: carousel-image, carousel-headline, carousel-summary, carousel-source, qr-code, progress-bar, queue-preview, fallback-state

### test.html (Preview Mode)
- Identical structure to index.html
- Red PREVIEW MODE banner at top with dynamic date display
- Godkjenn button (top-right) linking to GitHub editor for active.json
- Supports ?date=YYYY-MM-DD URL parameter for preview date override
- Default preview date is tomorrow (auto-computed)
- 14px top margin on header to accommodate banner

### css/style.css (Styling & Animations)
- CSS variables for all theme colors (#0A0F1A, #F5F7FA, #FF6B35 accent)
- Global styles: cursor: none, user-select: none (TV-optimized)
- Typography: Headlines 64-72px, Summary 32-36px, Queue 24px
- Progress bar keyframe animation: 15s linear fill
- Carousel fade transitions: 600ms cross-fade
- Image fallback styling with gradient background
- Warning indicator styling (red background, 5s auto-hide)
- Line clamping utilities for text truncation
- Responsive adjustments for <1920px viewport
- No cursor, no text selection enforced throughout

### js/app.js (Data Pipeline & Polling)
- `window.APP` object with full state management
- `fetchActiveDate()`: Fetches active.json with cache-buster ?t parameter
- `loadNewsContent()`: Loads 7 news JSON files in parallel
- `fetchNewsItem()`: Individual news fetch with 404 handling (optional items)
- Exponential backoff retry logic: 1s, 3s, 9s delays (3 attempts max)
- `displayCarousel()`: Updates DOM with current item data
- `showItem()`: Renders headline, summary, source, image, QR code
- `genQR()`: Generates QR code using qr-code-styling library
- `updateQueuePreview()`: Shows next 3 items in footer
- `startPolling()`: 5-minute interval polling with document.hidden check
- `checkUpdates()`: Detects date changes in active.json, triggers full reload
- localStorage fallback: `APP_lastKnownGood` cache for error recovery
- Error handling: Shows fallback after 3 consecutive failures
- Clock update: Displays current date/time formatted in Norwegian (no-NO)
- DOMContentLoaded + immediate init for pre-loaded pages

---

## Requirements Coverage

All 14 requirements from plan frontmatter addressed:

| Requirement | Status | Implementation |
|-------------|--------|-----------------|
| DISP-01 | ✓ | index.html header with date/time/logo |
| DISP-02 | ✓ | Carousel structure with image/headline/summary/source/QR |
| DISP-04 | ✓ | Footer with progress bar and queue preview |
| DISP-06 | ✓ | Dark theme with TV-readable typography |
| DATA-01 | ✓ | active.json fetch with cache-buster |
| DATA-02 | ✓ | Parallel news JSON loading with priority sort |
| DATA-03 | ✓ | Optional birthday.json handling (404 skip) |
| POLL-01 | ✓ | 5-minute polling interval |
| POLL-02 | ✓ | Page reload on active.json date change |
| POLL-03 | ✓ | Exponential backoff retry (1s, 3s, 9s) |
| STYLE-01 | ✓ | Dark theme colors and no-cursor styling |
| STYLE-05 | ✓ | 600ms fade animation keyframes |
| DEPLOY-01 | ✓ | No build tools, vanilla JS + CDN only |
| DEPLOY-02 | ✓ | GitHub Pages compatible (static files) |

---

## Must-Have Artifacts

| Artifact | Status | Path | Provides |
|----------|--------|------|----------|
| index.html | ✓ | index.html | Production TV display structure |
| test.html | ✓ | test.html | Preview mode for content review |
| css/style.css | ✓ | css/style.css | Dark theme, animations, TV typography |
| js/app.js | ✓ | js/app.js | Data loading, polling, error recovery |

---

## Acceptance Criteria Met

- ✓ index.html renders with dark theme, all required IDs present
- ✓ test.html shows PREVIEW MODE banner and Godkjenn button
- ✓ Browser console has no errors (clean app.js)
- ✓ CSS styles apply correctly (dark colors, typography sizes, animations)
- ✓ No cursor visible (user-select: none enforced)
- ✓ Text not selectable (-webkit-user-select: none, etc.)
- ✓ app.js exports window.APP with required functions
- ✓ Fetches with cache-buster query params (?t=timestamp)
- ✓ Exponential backoff retry implemented
- ✓ Polls every 5 minutes (300000ms interval)
- ✓ Reloads on date change
- ✓ Shows fallback after 3 failures
- ✓ Never displays blank screen (lastKnownGood localStorage fallback)

---

## Deviations from Plan

**None** — Plan executed exactly as written. All 4 tasks completed with full feature implementation.

---

## Known Stubs

**None** — All placeholders have proper data binding.

---

## Files Created

- index.html (6.6 KB)
- test.html (6.4 KB)
- css/style.css (6.9 KB)
- js/app.js (6.2 KB)

**Total:** ~26 KB new code

---

## Commit

- **Hash:** acae0c7
- **Message:** feat(01-mvp-carousel-foundation): create carousel foundation
- **Files changed:** 4
- **Insertions:** 756

---

**Self-Check:** PASSED
- ✓ All 4 files exist with required content
- ✓ Commit acae0c7 verified
