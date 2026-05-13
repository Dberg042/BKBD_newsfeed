---
name: STACK
description: Technology stack, runtime, frameworks, and dependencies
date: [2026-05-13]
---

# Technology Stack

## Overview

Static HTML/CSS/JavaScript news carousel for office TV display, hosted on GitHub Pages. No build step required.

## Languages & Runtime

- **Primary Language:** HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Runtime Environment:** Browser (client-side only)
- **Target Platform:** GitHub Pages static hosting
- **Display Target:** 1920×1080 landscape TV at 3+ meters viewing distance

## Frameworks & Libraries

- **Frontend Framework:** Vanilla JavaScript (no framework)
- **CSS Framework:** Tailwind CSS 3+ via CDN
- **QR Code Library:** qr-code-styling v1.6.0 via CDN
- **Typography:** Inter variable font via Google Fonts CDN
- **Build Tools:** None (static files only)

## Dependencies

All external dependencies are loaded via CDN at runtime:

```html
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.jsdelivr.net/npm/qr-code-styling@1.6.0-rc.1/lib/qr-code-styling.js"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
```

**No npm packages, package.json, or build tools required.**

## Project Structure

```
BKBD_newsfeed/
├── index.html              # Production TV display screen
├── test.html               # Preview/review mode (user's phone)
├── css/
│   └── style.css           # Custom styles, animations, TV overrides
├── js/
│   ├── app.js              # Main app: data loading, polling, initialization
│   ├── carousel.js         # Carousel: rotation, progress bar, queue preview
│   └── qr.js               # QR code generation per news item
├── data/
│   ├── active.json         # Pointer: {"date": "YYYY-MM-DD"} (single source of truth)
│   └── YYYY-MM-DD/         # Date-specific folders (e.g., 2026-05-13/)
│       ├── news-01.json
│       ├── news-02.json
│       ├── ...
│       ├── news-07.json
│       └── birthday.json   # Optional, omitted if no birthdays
├── README.md               # Hermes agent integration spec
└── BLUEPRINT.md            # Project specification
```

## Key Technologies

### HTML5 & CSS3
- Semantic HTML for screen layout
- CSS Grid and Flexbox for responsive dimensions
- CSS animations for carousel transitions (600ms cross-fade)
- CSS custom properties for dark theme colors

### Tailwind CSS (CDN)
- Custom theme extension in `<script>` tag
- Colors: dark background (#0A0F1A), light text (#F5F7FA), accent (#FF6B35)
- Typography: Inter font family
- Utility-first approach for layout and spacing

### Vanilla JavaScript
- **Async/await** for data loading with cache-busting
- **fetch API** for data retrieval from GitHub Pages
- **Promise.all()** for parallel news JSON loading
- **Exponential backoff** for retry logic (1s, 3s, 9s)
- **setInterval** for 5-minute polling of active.json
- DOM manipulation for carousel and QR updates

### QR Code Generation
- Client-side only via qr-code-styling library
- Generated fresh per carousel item (no pre-generation)
- 200×200px with rounded dots, M error correction
- Encodes `source_url` field from news JSON

## Data Storage

- **Data Format:** JSON (human-readable, GitHub-friendly)
- **Storage:** GitHub repository `/data` folder
- **Retention:** Never delete old date folders (cumulative growth ~8 files/day)
- **Approval Mechanism:** Manual edit of `active.json` via GitHub mobile UI

## Performance Characteristics

- **Initial Load:** Fetch active.json, then parallel fetch of up to 8 JSON files
- **Caching:** Cache-buster query params (`?t={timestamp}`) to bypass GitHub Pages CDN
- **Polling:** Every 5 minutes for `active.json` changes (full page reload if date changes)
- **Carousel:** 15 seconds per item, 600ms fade transitions
- **Fallbacks:** Last known good state if fetch fails after 3 retries

## Browser Compatibility

- Modern browsers supporting ES6+, fetch API, CSS Grid/Flexbox
- Desktop/laptop (no mobile requirements beyond admin review on test.html)
- No IE11 support needed

## Deployment

- **Host:** GitHub Pages (static files)
- **Branch:** `main`
- **URL:** `https://{user}.github.io/BKBD_newsfeed/`
- **Setup:** Enable Pages in GitHub repo settings

---

*Last updated: [2026-05-13]*
