# Codebase Concerns

**Analysis Date:** 2026-05-13

## Project Maturity

**Early-Stage Implementation:**
- Status: Blueprint only — no implementation files exist yet
- Files: BLUEPRINT.md describes architecture, but index.html, test.html, js/ directory, css/, and data/ structure are not yet implemented
- Impact: Project is in planning phase; all deliverables from section 14 are outstanding
- Fix approach: Execute against BLUEPRINT.md spec to generate all production files

---

## Critical Implementation Gaps

### Missing Core Files

**App Logic:**
- Missing: js/app.js — data loading, polling, active.json updates
- Missing: js/carousel.js — rotation logic, progress bar, queue preview
- Missing: js/qr.js — QR code generation
- Impact: Cannot load news data, rotate items, or display QR codes

**HTML Templates:**
- Missing: index.html (production TV display)
- Missing: test.html (preview/approval mode)
- Current: Only skeleton "Hello World" in index.html exists
- Impact: No functional UI on TV or approval phone

**Styling:**
- Missing: css/style.css
- Impact: No custom animations, progress bar, or carousel transitions

**Data Structure:**
- Missing: data/active.json pointer file
- Missing: data/2026-05-13/ folder with sample news JSONs and birthday.json
- Impact: App cannot initialize

---

## Architectural Concerns

### Data Loading Reliability

**Problem:** Polling every 5 minutes with 3 retries (1s, 3s, 9s backoff) not yet implemented

**Risk:** 
- Network failures on 24/7 TV display need robust fallback
- No error handling framework defined
- Cache-busting with ?t={timestamp} must bypass GitHub Pages CDN

**Recommendation:** 
- Implement retry logic with exponential backoff in app.js
- Store last successful data fetch in localStorage as fallback
- Add visual indicator ("⚠ Connection issue") when using fallback

### Image Loading Failures

**Problem:** Section 6 specifies "If image fails to load, show source name as text fallback"

**Risk:** 
- No image error handling coded yet
- Articles may reference broken URLs
- News card becomes empty if image fails silently

**Recommendation:**
- Implement img error handler to swap in source name as fallback text
- Validate image URLs in Hermes integration before commit

### Birthday Card Handling

**Problem:** Section 6: "If birthday.json missing, show neutral fallback — never empty space"

**Risk:**
- No logic to handle 404 gracefully
- May leave visual gap or crash

**Recommendation:**
- Handle 404 gracefully in carousel.js
- Insert fallback "Today's date / weather / company logo" panel
- Pre-define fallback card HTML/styling

---

## Security Concerns

### External Image URLs

**Problem:** image_url must be HTTPS and publicly accessible, but no validation exists yet

**Risk:**
- Malicious URLs could be committed by Hermes agent
- No CSP (Content Security Policy) headers defined
- Mixed content could break display

**Recommendation:**
- Add Content-Security-Policy header or meta tag to restrict images to HTTPS only
- Hermes integration must validate all image URLs before commit
- Consider allowlist of trusted domains

### QR Code Encoding

**Problem:** Section 8 specifies fresh QR generation per item; source_url encoded directly

**Risk:**
- No URL validation before encoding
- Malicious URLs in news JSON could be scanned by viewers
- No way to revoke bad QR codes after deploy

**Recommendation:**
- Validate source_url is HTTPS and contains source_name domain match
- Consider shortening service if QR codes need tracking/revocation

---

## Performance Bottlenecks

### Image Download Size

**Problem:** BLUEPRINT specifies 1600×500 pixel images with no compression or lazy-load strategy

**Risk:**
- 1600×500 images from external sources could be 200KB–1MB each
- Multiple large images in memory on 24/7 TV
- GitHub Pages CDN may be slow for high-res images

**Current state:** No optimization configured

**Improvement path:**
- Implement image lazy-loading (load only current and next 2 items)
- Add width/height attributes to prevent layout shift
- Consider requesting smaller image sizes via query params if source supports
- Monitor browser memory usage during long carousel cycles

### JSON Polling Overhead

**Problem:** Every 5 minutes fetch active.json; if changed, reload entire page

**Risk:**
- Full page reload interrupts carousel mid-rotation
- Brief blank screen during reload
- Jarring UX if polling happens during news display

**Current state:** Not yet implemented

**Improvement path:**
- Stagger polling to avoid reloads during display (poll at cycle end)
- Implement smooth transition: load new content in background, swap when carousel loops
- Use Service Worker to cache active.json aggressively

### QR Generation Performance

**Problem:** Fresh QR generation per item creates new DOM element and library instance on every carousel swap

**Risk:**
- qr-code-styling library initialization may be slow on each transition
- 15-second display per item × 7 items = 7 QR generations per cycle
- Performance degrades if library is large or device is slow

**Current state:** Not yet implemented; library size/performance unknown

**Improvement path:**
- Profile QR generation time; if >100ms, consider pre-generating all 7 QRs at load time
- Cache library instance, reuse across items
- Measure on target TV hardware before deploy

---

## Testing & Validation Gaps

### No Test Data Setup

**Untested area:** 
- Fetch logic for active.json, news JSONs, birthday.json
- Retry logic with exponential backoff
- Cache-buster query param implementation

**Files:** js/app.js (not yet created)

**Risk:** 
- Polling failures go undetected until production
- Retry logic may not work as designed
- Cache-busting may fail silently

**Priority:** High

**Recommendation:**
- Create data/2026-05-13/ with 7 sample news items covering:
  - Normal article (image + summary)
  - Missing image (test fallback)
  - Very long headline (test truncation)
  - Non-ASCII characters (test Norwegian å/ø/æ)
- Create optional data/2026-05-13/birthday.json for happy path
- Create alternate folder without birthday.json to test fallback

### No Browser Compatibility Testing

**Untested area:**
- TV may run old browser (Chromium-based, but version unknown)
- Mobile approval (test.html) may be iOS Safari or Android Chrome

**Files:** No specification in BLUEPRINT

**Risk:**
- Fetch API, async/await may not work on old TV browser
- Flex layout may break on older CSS support
- QR library may have polyfill dependencies

**Priority:** High

**Recommendation:**
- Specify minimum browser versions in README
- Test on actual TV hardware before go-live
- Test on target phone OS for approval workflow

### No QR Code Scanning Validation

**Untested area:**
- Generated QR codes point to source_url
- No test that they actually scan and resolve

**Files:** js/qr.js (not yet created)

**Risk:**
- QR fails silently if URL is bad or encode fails
- User tries to scan broken QR in front of office

**Priority:** Medium

**Recommendation:**
- Add manual QR scan test step to approval workflow
- Consider QR validation: decode generated QR and verify URL match
- Test with real QR scanner on phone before deployment

---

## Fragile Areas

### Hermes Integration Contract

**Files:** BLUEPRINT.md section 11 (no separate SKILL.md created yet)

**Why fragile:**
- No formal Hermes skill file exists in .claude/skills/ yet
- Contract relies on manual date folder creation (data/YYYY-MM-DD/)
- Risk of off-by-one-day errors if Hermes generates tomorrow's folder vs. today's
- Birthday detection logic not specified (how does Hermes determine birthdays?)
- No fallback behavior if Hermes fails or schedule drifts

**Safe modification:**
- Before Hermes integration goes live, create formal SKILL.md in .claude/skills/hermes-newsfeed/
- Define exact schedule (06:00 Europe/Oslo), output format, error handling, retry policy
- Add validation step: Hermes must verify all 7 files exist and are valid JSON before commit
- Document birthday data source and update frequency

### Active.json as Single Source of Truth

**Files:** data/active.json

**Why fragile:**
- User manual edit on GitHub mobile app is error-prone
- If date format is wrong (2026-5-13 vs 2026-05-13), app cannot find folder
- No validation that the date points to an existing folder with news
- If user edits to a future date by mistake, TV goes blank until they fix it

**Safe modification:**
- Validate active.json date format strictly (YYYY-MM-DD)
- In app.js, verify the date folder exists before loading; fall back to previous good state if invalid
- Add warning in test.html if selected date has no news folder yet
- Consider adding "Verify folder exists" step to approval checklist

### Carousel Timer State

**Files:** js/carousel.js (not yet created)

**Why fragile:**
- 15-second timer per item can drift if JavaScript execution is slow or paused
- If page reload happens mid-transition, timer state is lost (carousel restarts at item 0)
- If user pauses carousel in test.html (inspection mode), no clear way to resume cleanly

**Safe modification:**
- Use requestAnimationFrame with explicit elapsed time tracking, not relying on callback precision
- Store carousel index and last item start time in localStorage for recovery
- In test.html, implement clear pause/resume UI with visual state indicator
- Test pause/resume doesn't cause double-playback or skipped items

---

## Missing Critical Features

### No Fallback Content for Failed Updates

**Problem:** If Hermes fails to commit daily update, or active.json points to non-existent date, spec says "show last known good state + warning"

**Risk:** Currently no mechanism to store or display fallback

**Blocks:** Users cannot review/approve news if app crashes or Hermes fails silently

**Recommendation:**
- Implement localStorage cache of last 7 successful news fetches
- Fallback UI: show last known good carousel with visible "⚠ Today's news not available yet, showing yesterday" banner
- Still poll every 5 minutes to recover gracefully when Hermes recovers

### No Admin Notification for Hermes Failures

**Problem:** If Hermes fails to generate news (source API down, etc.), user gets no alert

**Risk:** TV silently shows yesterday's news, or blank screen; user unaware

**Blocks:** Cannot guarantee fresh news delivery or detect infrastructure issues early

**Recommendation (Post-MVP):**
- Add webhook or notification mechanism (email, Slack) if Hermes fails to commit by 07:00
- Consider alternate data source or manual override path if primary source (kode24.no) is down

---

## Dependencies at Risk

### Tailwind CDN (No Build)

**Risk:** 
- Depends on jsdelivr CDN for Tailwind script: https://cdn.tailwindcss.com
- If CDN is down, styling is completely lost
- No offline fallback; TV would render unstyled HTML

**Impact:** High — display would be unusable

**Mitigation:** 
- Already accepts this risk (BLUEPRINT explicitly chooses CDN over build step for simplicity)
- Consider adding Service Worker with aggressive Tailwind caching
- Monitor CDN uptime; have fallback CSS inline in HTML for critical layout

### qr-code-styling Library

**Risk:**
- Third-party CDN library: https://cdn.jsdelivr.net/npm/qr-code-styling@1.6.0-rc.1/
- Version is rc.1 (release candidate), not stable
- No fallback if library fails to load or has breaking changes

**Impact:** Medium — QR codes not displayed, but news still readable

**Mitigation:**
- Pin specific version in CDN URL (already done correctly)
- Consider switching to stable alternative if library is widely used
- Test library on target TV before production deploy

### Inter Font (Google Fonts)

**Risk:**
- BLUEPRINT section 12: uses Google Fonts CDN
- If Google Fonts CDN down, font fails; browser falls back to sans-serif (Arial, Helvetica)
- May render poorly at TV scale (3+ meters viewing distance)

**Impact:** Low-Medium — typography quality degrades, but readable

**Mitigation:**
- Self-host Inter font as local fallback (already suggested in BLUEPRINT section 12, but not yet implemented)
- Download Inter-Regular.woff2, Inter-SemiBold.woff2, Inter-Bold.woff2 and serve from repo
- Use @font-face with local fallback

---

## Deployment Readiness

### GitHub Pages Configuration Not Yet Documented

**Problem:** BLUEPRINT section 14 states "GitHub Pages enabled on main branch" as deliverable, but no setup documented

**Risk:**
- Pages deployment may fail silently or with no error message
- CORS headers may not allow cross-origin fetch of news JSONs
- Cache headers may prevent fresh news from loading
- Active content never appears on TV despite user approval

**Current state:** GitHub Pages URL not yet tested; deployment path unclear

**Recommendation:**
- Add .github/workflows/pages.yml to enable automatic GitHub Pages builds
- Test deployed site is accessible at https://dberg042.github.io/BKBD_newsfeed/ before user approval
- Verify CORS headers allow fetch from same origin (should be automatic)
- Add cache-control headers via GitHub Pages or _config.yml:
  - data/active.json: Cache-Control: no-cache (check freshness every request)
  - data/*/news-*.json: Cache-Control: max-age=86400 (cache 1 day)
  - index.html: Cache-Control: no-cache (check for updates on each load)

### No Operational Runbook

**Problem:** BLUEPRINT describes daily approval workflow, but no operational documentation exists

**Risk:**
- If user is unavailable or goes on vacation, no clear handoff for backup
- No documented procedure for emergency rollback (delete bad news JSON)
- No troubleshooting guide if TV goes blank or news disappears
- Hermes failure mode not documented (who to alert, what to do)

**Current state:** No OPERATIONS.md or runbook

**Recommendation (Post-MVP but important):**
- Create OPERATIONS.md with:
  - Daily approval checklist (what to look for in test.html)
  - Emergency rollback: delete data/YYYY-MM-DD/ folder, point active.json to previous good date
  - Troubleshooting: "TV blank" → check active.json date, verify folder exists, check for 404s
  - Hermes failure: (missing news files by 07:00) → manually create placeholder news JSONs or point to previous day
  - Vacation handoff: step-by-step for backup approver
  - Contact: Hermes agent info, GitHub repo owner, IT support
- Document in README or separate .docs/ folder

---

## Known Limitations

### No Multi-Screen Support

**Current design:** Single active.json for single TV

**Limitation:** If office adds second TV, both must show same content (no independent schedules)

**Recommendation (Future):** Design for multiple TVs post-MVP, with active-tv1.json, active-tv2.json approach or admin dashboard

### No Analytics or View Tracking

**Current design:** No tracking of what's displayed, when carousel restarts, or carousel skip events

**Limitation:** No data on user engagement, whether news is actually being watched

**Recommendation (Future):** Add optional analytics beacon (if privacy acceptable) to count view duration, which items get skipped, when page reloads

---

**Concerns audit: 2026-05-13**
