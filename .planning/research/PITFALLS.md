---
name: PITFALLS
description: Common failures and prevention strategies for TV display systems
date: [2026-05-13]
---

# Pitfalls Research: Infoskjerm

## Critical Pitfalls (Phase 1 Must Address)

### 1. Memory Leaks in Long-Running Carousels
**What goes wrong:** JavaScript closures holding onto DOM references, event listeners never unbound, intervals/timeouts not cleared.

**Warning signs:** Page becomes sluggish after 24+ hours, memory usage climbs in browser devtools.

**Prevention:** 
- Clear intervals/timeouts on teardown
- Unbind all event listeners before reflow
- Use WeakMap for cached references

**Recovery:** Auto-restart browser nightly via cron job.

**Phase:** Build cleanup logic into carousel.js (Phase 3).

---

### 2. Image Loading Failures
**What goes wrong:** Missing images, 404s, slow networks cause blank spots or broken layouts.

**Warning signs:** News items display without images, layout shifts, user sees broken links.

**Prevention:**
- Validate image URLs before commit (Hermes should HEAD-check)
- Use fallback: show source name as text if image fails
- Set aggressive timeouts (2-3s max wait)
- Lazy-load images on carousel transition

**Recovery:** Fall back gracefully; show source name in placeholder area.

**Phase:** Implement image fallback in Phase 3 (carousel.js).

---

### 3. Content Approval Race Conditions
**What goes wrong:** User approving (editing active.json) while Hermes pushing new content causes inconsistent state.

**Warning signs:** Some news items missing, mix of two different dates shown, approval records don't match git history.

**Prevention:**
- atomic.json writes (Hermes commits to data/{date}/, User edits active.json)
- Keep active.json separate from data files
- Use git commit order to establish precedence
- Never merge user/Hermes changes

**Recovery:** Hermes conflict resolution: if active.json timestamp > data files, don't overwrite.

**Phase:** Document workflow in Phase 2; test in Phase 4.

---

### 4. Polling Desynchronization
**What goes wrong:** Carousel timer drifts, polling interval slips, browser tab goes inactive, page gets out of sync.

**Warning signs:** Carousel skips items, progress bar resets unexpectedly, polling stops after page has been open 24+ hours.

**Prevention:**
- Use `setInterval` + wall-clock time checks (not just counter increments)
- Resume polling aggressively if tab becomes active (Page Visibility API)
- Reset timers on visibility change
- Log all polling events for debugging

**Recovery:** Force full page reload if out of sync detected.

**Phase:** Implement robust timing in Phase 2 (app.js polling loop).

---

### 5. Permanent Content Corruption
**What goes wrong:** Bad JSON from Hermes breaks parser, corrupts state, page won't recover without manual intervention.

**Warning signs:** Page shows error message, carousel stops, needs TV reboot to recover.

**Prevention:**
- Validate JSON schema before displaying (Hermes should validate)
- Graceful JSON parse errors: skip bad items, keep showing last good state
- Never let bad data crash the page
- Log all parse errors to console for operator visibility

**Recovery:** Skip bad item, keep carousel running with remaining items.

**Phase:** Implement JSON validation in Phase 2 (app.js).

---

## Moderate Pitfalls (Phase 2-3 Should Address)

### 6. Auto-Restart/Recovery After Failures
**What goes wrong:** Page fails, browser doesn't auto-recover, TV goes blank for hours until operator notices.

**Prevention:**
- Implement Service Worker to detect failures
- Auto-reload page if fetch fails 5+ times
- Set browser auto-refresh via browser config (some kiosk modes support this)

---

### 7. GPU Acceleration / CSS Rendering
**What goes wrong:** Smooth 600ms transitions become janky on cheap TV hardware, carousel stalls.

**Prevention:**
- Use GPU-accelerated properties: `transform: translateZ()`, `opacity` (not position/left)
- Test on actual TV hardware if possible
- Avoid expensive repaints (images, shadows, blur)

---

### 8. Aspect Ratio / Image Scaling Issues
**What goes wrong:** Images from different sources have different aspect ratios, layout breaks, content clips unexpectedly.

**Prevention:**
- Enforce image size requirements in Hermes validation
- Use CSS `object-fit: cover` for consistent aspect ratio
- Test with various image sizes before deploying

---

### 9. Text Legibility at Distance
**What goes wrong:** Headlines/summaries are unreadable from 3+ meters, office users complain.

**Prevention:**
- Use large font sizes (64-72px headlines, 32-36px body)
- High contrast (dark background, light text)
- Test readability at 3m distance during Phase 1
- Use variable font (Inter) for crisp rendering at all sizes

---

## Anti-Patterns to Avoid

- **Synchronous DOM manipulation** — Blocks rendering, causes jank
- **Tight coupling to JSON schema** — Changes break everything
- **Polling without cache-busting** — GitHub Pages CDN serves stale content
- **No fallback states** — Blank screen = product failure
- **Infinite loops in error handlers** — Page becomes unresponsive
- **Storing state in DOM attributes** — Lost on refresh, hard to debug

---

## Risk Ranking

| Pitfall | Severity | Likelihood | Phase to Address |
|---------|----------|------------|-----------------|
| Memory leaks | HIGH | HIGH | Phase 3 (carousel.js) |
| Image failures | HIGH | MEDIUM | Phase 3 (fallback UI) |
| Race conditions | MEDIUM | LOW | Phase 2 (document workflow) |
| Polling drift | HIGH | MEDIUM | Phase 2 (robust timing) |
| Corruption | HIGH | LOW | Phase 2 (validation) |
| GPU performance | MEDIUM | MEDIUM | Phase 4 (hardware test) |
| Legibility | MEDIUM | LOW | Phase 1 (design validation) |

---

*Research completed: 2026-05-13*
*Source: TV display systems experience, polling pattern pitfalls, unattended display best practices*
