# Roadmap: Infoskjerm News Display

**Created:** 2026-05-13
**Phases:** 4 (coarse granularity)
**Coverage:** 31/31 v1 requirements

---

## Phase 1: MVP Carousel Foundation

**Goal:** Build core carousel display with polling, approval workflow, and TV-ready styling

**Requirements:** DISP-01,02,04,05,06,08 | DATA-01,02,03,04 | POLL-01-06 | STYLE-01-07 | DEPLOY-01-03 (26 total)

**Success Criteria:**
1. User views TV carousel rotating through 7+ news items with 15-second dwell and 600ms cross-fade transitions
2. Carousel displays header (date, time, logo), image, headline (2 lines), summary (5-6 lines), source name, queue preview (next 3 items)
3. TV polls active.json every 5 minutes; full page reload if date changed, continues if unchanged
4. Network failure shows last known good content indefinitely; warning indicator appears after 3 failed fetches
5. Missing images gracefully show source text fallback; malformed JSON items skip without breaking carousel
6. Dark theme displays with TV-readable sizes (headlines 64-72px, summary 32-36px) legible from 3+ meters
7. Progress bar animates smoothly over 15 seconds; no cursor visible; text not selectable
8. Page loads in <1 second; deployed and accessible on GitHub Pages

---

## Phase 2: Preview & Approval Workflow

**Goal:** Build test.html preview mode and GitHub approval workflow for content review

**Requirements:** UI-01,02,03,04,05,06,07 (7 total)

**Success Criteria:**
1. test.html defaults to tomorrow's date with red "PREVIEW MODE" banner at top
2. User can override date via ?date=YYYY-MM-DD URL parameter
3. Arrow keys skip between items without 15-second wait; click item pauses carousel, click resumes
4. "Godkjenn" (Approve) button opens GitHub mobile editor for active.json; user can edit/delete news JSON files before approving
5. Preview page renders identically to production carousel (same styles, same data loading)
6. User completes full approval workflow (review + edit + approve) in under 3 minutes

---

## Phase 3: Differentiators

**Goal:** Add QR codes and birthday cards for engagement and personalization

**Requirements:** DISP-03,07 | QR-01,02,03,04 (6 total)

**Success Criteria:**
1. 200×200px QR code generates per item, encodes source_url, uses rounded dots and M error correction
2. QR code displays without layout shift; positioned consistently with headline/summary/source
3. Birthday card displays in rotation with "Gratulerer med Dagen" message; 404 gracefully skips, shows fallback panel
4. QR code generation is client-side via qr-code-styling CDN with <50ms latency per item
5. Operator sees approval status indicator: shows date mismatch when active.json points to different date than displayed

---

## Phase 4: Polish & Deployment

**Goal:** Validate performance, hardware compatibility, memory stability, and edge cases

**Success Criteria:**
1. Carousel runs continuously for 8+ hours without memory leaks; consistent performance over time
2. CSS transitions are GPU-accelerated; smooth on actual TV hardware (no jank or frame drops)
3. Text legibility verified at 3+ meters viewing distance; fonts, sizes, contrast ratios meet spec
4. Image aspect ratios handled consistently with CSS object-fit; no distortion or unexpected layout
5. Service Worker (or auto-reload strategy) prevents extended blank-screen outages; recovery from 24h+ network loss

---

## Requirement Mapping

| Requirement | Phase | Status |
|-------------|-------|--------|
| DISP-01 | 1 | Pending |
| DISP-02 | 1 | Pending |
| DISP-03 | 3 | Pending |
| DISP-04 | 1 | Pending |
| DISP-05 | 1 | Pending |
| DISP-06 | 1 | Pending |
| DISP-07 | 3 | Pending |
| DISP-08 | 1 | Pending |
| DATA-01 | 1 | Pending |
| DATA-02 | 1 | Pending |
| DATA-03 | 1 | Pending |
| DATA-04 | 1 | Pending |
| UI-01 | 2 | Pending |
| UI-02 | 2 | Pending |
| UI-03 | 2 | Pending |
| UI-04 | 2 | Pending |
| UI-05 | 2 | Pending |
| UI-06 | 2 | Pending |
| UI-07 | 2 | Pending |
| POLL-01 | 1 | Pending |
| POLL-02 | 1 | Pending |
| POLL-03 | 1 | Pending |
| POLL-04 | 1 | Pending |
| POLL-05 | 1 | Pending |
| POLL-06 | 1 | Pending |
| QR-01 | 3 | Pending |
| QR-02 | 3 | Pending |
| QR-03 | 3 | Pending |
| QR-04 | 3 | Pending |
| STYLE-01 | 1 | Pending |
| STYLE-02 | 1 | Pending |
| STYLE-03 | 1 | Pending |
| STYLE-04 | 1 | Pending |
| STYLE-05 | 1 | Pending |
| STYLE-06 | 1 | Pending |
| STYLE-07 | 1 | Pending |
| DEPLOY-01 | 1 | Pending |
| DEPLOY-02 | 1 | Pending |
| DEPLOY-03 | 1 | Pending |

**Coverage:** 31/31 requirements mapped ✓

---

*Roadmap created: 2026-05-13*
*Next: Phase 1 planning and execution*
