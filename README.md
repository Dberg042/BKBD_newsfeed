# Infoskjerm News Display

A static HTML/CSS/JavaScript news carousel for TV displays showing rotating Norwegian tech news. No server code, no build step, pure GitHub Pages deployment.

## Overview

- 7+ rotating news items, 15-second per item
- Dark theme optimized for TV viewing from 3+ meters
- Automatic daily updates via Hermes agent
- Manual approval workflow via GitHub mobile app
- Graceful error handling for missing images and network failures
- Never shows blank screen (last known good fallback)

## Architecture

Data Flow:
1. Hermes commits news to `data/YYYY-MM-DD/` at 06:00 daily
2. User reviews via `test.html` on phone
3. User edits `data/active.json` to point to new date
4. TV polls `active.json` every 5 minutes
5. On date change, page reloads with new content

Single source of truth: `data/active.json` contains only date pointer.

## Deployment

### GitHub Pages Setup
1. Enable Pages in repo settings (main branch, root)
2. GitHub builds and deploys automatically
3. Access: `https://USERNAME.github.io/BKBD_newsfeed/`

### TV Configuration
1. Open `index.html` on TV browser
2. Fullscreen (F11)
3. No cursor, no text selection - TV-optimized
4. Auto-updates when active.json changes

### Manual Approval
1. Hermes commits daily news at 06:00
2. User opens `test.html` on phone
3. Review 7 items (arrow keys to skip)
4. Tap "Godkjenn" to edit active.json in GitHub
5. Change date, commit
6. TV reloads within 5 minutes

## Static Files Only

No server code, no npm, no build tools:
- index.html (TV display)
- test.html (preview mode)
- css/style.css (all styles)
- js/app.js (data loading, polling)
- js/carousel.js (rotation, progress)
- data/active.json (date pointer)
- data/YYYY-MM-DD/*.json (news from Hermes)

All external dependencies HTTPS only:
- Tailwind CDN
- Google Fonts
- QR-Code-Styling CDN

## Error Handling

### Image Fallback
Missing image? Shows source_name as centered 36px text instead.

### Malformed JSON
Invalid JSON skipped silently, carousel loads valid items only.

### Network Failures
Retry with exponential backoff (1s, 3s, 9s).
After 3 failures: show warning overlay "Tilkoblingsproblem - Viser lagret innhold"
Display last known good content with warning.
Never blank screen.

### Missing Data
No news available? Show fallback message, display last known content.

## Hermes Integration

**Output format:** Create `data/YYYY-MM-DD/` with:
- news-01.json through news-07.json
- birthday.json (optional, only on birthdays)

**News item schema:**
```json
{
  "id": "news-01",
  "title": "Headline here",
  "summary": "200-300 chars, Norwegian",
  "image_url": "https://example.com/img.jpg",
  "source_url": "https://source.com/article",
  "source_name": "Kode24",
  "published_at": "2026-05-13T06:00:00Z",
  "priority": 1
}
```

**Quality requirements:**
- image_url: HTTPS, publicly accessible, returns 200 OK
- summary: complete sentences in Norwegian, 200-300 chars
- source_name: 5-20 chars
- priority: 1-7 (display order)
- No duplicates across 3-day lookback
- Diverse topics

**Hermes must NOT:**
- Modify data/active.json (user approval gate)
- Modify index.html, test.html, or source code

## Performance

- Sub-1s page load on GitHub Pages
- 5-minute polling interval (GitHub CDN compatible)
- Cache-buster on polling: ?t=TIMESTAMP
- GPU-accelerated transitions
- <10MB total size

## TV Display Specs

- Resolution: 1920×1080 landscape
- Viewing: 3+ meters away
- Typography: Headlines 64px, Summary 32px
- Colors: #0A0F1A bg, #F5F7FA text, #FF6B35 accent
- No cursor, no text selection
- 600ms smooth transitions
- 15s progress bar per item

## Testing

**Local test:**
1. Open index.html in browser
2. Verify data/active.json points to valid date folder
3. Check Network tab for polling cycles

**Network error test:**
1. Go offline in DevTools
2. Wait 5 min for polling
3. See warning after 3 failures
4. Go online, warning disappears

**Image fallback test:**
1. Edit news JSON with invalid image_url
2. Refresh page
3. See source_name as text fallback

## Troubleshooting

**Blank screen?**
- Check browser console for errors
- Verify data/active.json valid JSON
- Verify data/YYYY-MM-DD/ folder exists

**Not rotating?**
- Check JavaScript errors in console
- Verify js/carousel.js loaded
- Check browser has JS enabled

**Images missing?**
- Verify image_url is HTTPS and 200 OK
- Fallback text should appear instead

**Polling stuck?**
- Check Network tab: should see active.json every 5 min
- Try hard refresh: Ctrl+Shift+R (Cmd+Shift+R on Mac)
- Cache-buster (?t=...) should force fresh fetch

## Status

Production ready. No known limitations for v1 scope. Static deployment on GitHub Pages.

GitHub: https://github.com/Dberg042/BKBD_newsfeed
