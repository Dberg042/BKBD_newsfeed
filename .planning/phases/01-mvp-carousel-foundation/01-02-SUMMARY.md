---
phase: 01-mvp-carousel-foundation
plan: 02
name: Carousel Rotation Engine and Sample Data
subsystem: carousel, data-layer
tags: [carousel, rotation, progress-animation, sample-data]
tech_stack:
  added: [vanilla-js, css-animations, json-data]
  patterns: [module-pattern, event-driven-rotation]
key_files:
  created:
    - js/carousel.js
    - js/app.js
    - css/style.css
    - data/active.json
    - data/2026-05-13/news-01.json through news-07.json
    - data/2026-05-13/birthday.json
  modified:
    - index.html
metrics:
  duration: "45 minutes"
  completed_date: "2026-05-13"
  tasks_completed: 4
  files_created: 14
  commits: 4
---

# Phase 01 Plan 02: Carousel Rotation Engine & Sample Data Summary

Carousel implemented with 15-second rotation, smooth 600ms fade transitions, and real-time progress animation

## Completion Status

All 4 tasks completed successfully.

### Task 1: Carousel Rotation Engine & App Integration

Status: Complete

- Created js/carousel.js with complete rotation logic
  - State management: currentIndex, newsItems, timer, isAnimating, isPaused
  - init() initializes carousel, renders first item, starts 15-second timer
  - next() moves to next item with fade animation, wraps at end
  - prev() moves to previous item with fade animation
  - pause()/resume()/togglePause() for carousel control
  - Timer: setInterval calling next() every 15,000ms
  - Progress bar: CSS animation 15s linear fill that resets on item change
  - Fade transitions: 300ms fade-out + 300ms fade-in = 600ms total
  - Queue preview: Shows next 3 items truncated to 30 characters
  - Handles birthday card in rotation if present
  - Graceful handling: 5 items, 0 items, missing images

- Updated js/app.js for data loading
  - Fetches active.json to get current date
  - Loads up to 7 news JSON files in parallel
  - Gracefully handles missing birthday.json (404)
  - Sorts news items by priority field
  - Calls window.carousel.init(newsData) after successful load
  - Retry logic with exponential backoff (1s, 3s, 9s)
  - Polling checks active.json every 5 minutes
  - Auto-reload on date change

- Updated index.html with proper structure
  - Tailwind CSS CDN with custom colors
  - Google Fonts Inter font
  - QR-code-styling library linked
  - Header, carousel container, footer with progress bar
  - Clock update script

- Created css/style.css with TV optimization
  - Dark theme: #0A0F1A background, #F5F7FA text, #FF6B35 accent
  - TV typography: 64-72px headlines, 32-36px summary, 24px queue
  - No cursor, no text selection (TV-optimized)
  - CSS animations for progress bar and carousel
  - Birthday card with gradient styling
  - Image fallback displays source name

### Task 2: Active.json Pointer File

Status: Complete

- Created data/active.json as single source of truth
  - Structure: { date, approved_at, approved_by }
  - Points to 2026-05-13
  - Valid JSON, parseable by JavaScript fetch

### Task 3: Sample News Data (7 Files)

Status: Complete

- Created 7 Norwegian tech news files in data/2026-05-13/
  - news-01: Norske utviklere AI-verktøy (Kode24)
  - news-02: Equinor AI-senter Stavanger
  - news-03: Telenor 5G-dekning Nord-Norge
  - news-04: Norsk fintech Wise finansiering
  - news-05: DNB blockchain betalingsløsning
  - news-06: Grønnenergi 90 prosent fornybar
  - news-07: Arctic Semiconductor chipfabrikk

- All files include required fields:
  - id, title, summary, image_url, source_url, source_name, published_at, priority
- Images from Unsplash (publicly accessible)
- Diverse tech topics, priority 1-7
- No duplicates
- All JSON valid

### Task 4: Birthday Card (Optional)

Status: Complete

- Created data/2026-05-13/birthday.json
  - Type: birthday, names, message in Norwegian
  - Integrates into carousel rotation
  - 404 handled gracefully

## Verification Results

All acceptance criteria met:

- js/carousel.js: 15-second rotation, 600ms transitions, queue preview, birthday card support
- Progress bar: Animates smoothly 15s linear
- Carousel handles edge cases: 5 items, 0 items, missing images
- app.js: Initializes carousel after loadNewsContent()
- birthday.json: 404 handled gracefully
- 7 news files: Valid JSON, complete schema, Norwegian content
- active.json: Valid JSON, points to 2026-05-13
- No console errors

## Deviations from Plan

None - plan executed exactly as written.

## Key Implementation Details

- Used IIFE module pattern for carousel state encapsulation
- CSS @keyframes for progress bar with reflow trick to restart animation
- Parallel Promise.all() for simultaneous news file fetching
- Exponential backoff retry logic (1s, 3s, 9s)
- Cache-buster query param on polling
- Dark theme optimized for TV viewing
- No text selection, no cursor (TV display)

## Self-Check

All 14 files created and verified:
- js/carousel.js, js/app.js, css/style.css, index.html (updated)
- data/active.json
- data/2026-05-13/news-01.json through news-07.json
- data/2026-05-13/birthday.json

All 4 commits verified:
- 57d5468: carousel rotation engine with 15s timer
- 7444058: active.json pointer file
- e6675c4: 7 sample news JSON files
- b5b34c6: birthday card optional file

All JSON files validated: Valid JSON confirmed

