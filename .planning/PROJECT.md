# Infoskjerm News Display

## What This Is

A static HTML/CSS/JavaScript news carousel for office TV displays that shows rotating Norwegian tech news items from kode24.no and tldr.tech. News is pushed daily by a Hermes agent, approved manually by a user via their phone, and displayed automatically on a 1920×1080 TV with optional birthday cards.

## Core Value

Users can review and approve daily news content in under 3 minutes, with one-click approval that updates the TV display within 5 minutes.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Display & Layout**
- [ ] TV screen displays header with date, time, and logo
- [ ] Main carousel rotates through 7+ news items with 15-second display per item
- [ ] Each news item shows: large image, headline (2 lines max), summary text (5-6 lines), QR code, source name
- [ ] Progress bar animates smoothly across 15-second display window
- [ ] Footer shows queue preview of next 3 items (30 chars max each)
- [ ] 600ms cross-fade transitions between news items
- [ ] Birthday card displays (if available) with "Gratulerer med Dagen" message in carousel rotation
- [ ] Fallback UI for missing images: show source name as text instead

**Data Management**
- [ ] active.json pointer file determines which date's news is displayed
- [ ] Page loads data from data/{date}/ folder (up to 7+ JSON files)
- [ ] News sorted by priority field (1-7+)
- [ ] Birthday card is optional (404 response skips, shows fallback instead)

**User Interactions (Preview Mode)**
- [ ] test.html preview page defaults to tomorrow's date
- [ ] test.html shows red warning banner (PREVIEW MODE)
- [ ] User can override preview date via ?date=YYYY-MM-DD URL param
- [ ] Arrow keys skip between items (no 15-second wait)
- [ ] Click item to pause carousel, click again to resume
- [ ] "Godkjenn" (Approve) button links to GitHub mobile editor for active.json
- [ ] User can edit/delete offending news JSON files before approving

**Polling & Auto-Updates**
- [ ] Every 5 minutes, fetch active.json with cache-buster param (?t={timestamp})
- [ ] If date changed in active.json, full page reload
- [ ] If date unchanged, do nothing
- [ ] Failed fetches retry 3× with exponential backoff (1s, 3s, 9s)
- [ ] Show warning indicator if fetch fails 3× in a row
- [ ] Last known good state always displayed (never blank screen)

**QR Codes**
- [ ] 200×200px QR code generated per news item
- [ ] Encodes source_url field
- [ ] Rounded dots, M error correction
- [ ] Generated fresh per carousel item (client-side via qr-code-styling CDN)

**Styling & Design**
- [ ] Dark theme: #0A0F1A background, #F5F7FA text, #FF6B35 accent
- [ ] Inter font family from Google Fonts CDN
- [ ] TV-readable sizes: Headlines 64-72px, Summary 32-36px, Queue 24px
- [ ] No cursor, no text selection (TV-optimized CSS)
- [ ] Tailwind CSS via CDN for layout and utility styles
- [ ] Custom CSS animations for progress bar and carousel transitions
- [ ] Responsive dimensions: 1920×1080 landscape, 80px header, 120px footer

**Deployment**
- [ ] Hosted on GitHub Pages from main branch
- [ ] All static files (HTML, CSS, JS, JSON) served directly
- [ ] No build step required (vanilla JS + CDN only)

### Out of Scope

- Real-time collaboration (manual approval is intentional review gate)
- Mobile app (web-first, preview on phone is sufficient)
- Weather widget (not core to news display)
- Analytics or view tracking (keep simple)
- Admin dashboard (GitHub mobile UI is the admin interface)
- Auto-approval (users must manually review)
- Multi-language support (Norwegian only for v1)
- Multiple TV screens with different content (single-screen v1)
- Push notifications if Hermes fails (no alerts)

## Context

**Tech Ecosystem:**
- Static hosting via GitHub Pages (no server needed)
- Vanilla JavaScript (no framework) with async/await, fetch API, DOM manipulation
- Tailwind CSS via CDN for rapid layout
- qr-code-styling library via CDN for QR generation
- Data storage as JSON files in git (single source of truth in active.json)

**User Workflow:**
- 06:00 — Hermes agent commits daily news JSON to data/YYYY-MM-DD/
- 07:30 — User opens test.html on phone to review 7 news items
- 07:33 — User edits active.json via GitHub mobile UI to point to new date
- 07:38 — TV polls active.json, detects date change, reloads with new content

**Design Language:**
- Scandinavian minimalist (calm, high contrast, no flash)
- 3+ meter viewing distance (TV-sized typography)
- Newspaper-like layout (image, headline, summary, source)
- Smooth 600ms transitions (no jarring or animated distractions)

## Constraints

- **Tech Stack**: Vanilla JS, Tailwind CDN, no build tools, no npm packages
- **Platform**: GitHub Pages static hosting only
- **Display**: 1920×1080 landscape, 3+ meters viewing distance
- **Language**: Norwegian UI and content
- **Data**: JSON files in git, never delete old date folders
- **Approval**: Manual one-click approval via GitHub mobile (no auto-approval)
- **Performance**: Sub-second page load, 5-minute polling interval

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| active.json as single source of truth | Simplifies approval — user changes one line to approve | — Pending |
| Client-side QR generation | No backend needed, faster display, future customization | — Pending |
| 15-second display per item | Readable on TV from distance, shows 7 items in ~2 minutes | — Pending |
| Vanilla JS (no framework) | Minimal dependencies, easier to deploy on GitHub Pages | — Pending |
| Hermes pushes to data/ folder | Audit trail in git, revert old content if needed | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-13 after initialization*
