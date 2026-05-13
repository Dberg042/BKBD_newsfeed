---
name: FEATURES
description: Table stakes vs differentiators for TV news carousel displays
date: [2026-05-13]
---

# Features Research: Infoskjerm

## Table Stakes (Must-Have)

Features users expect in TV news carousel systems:

1. **Carousel rotation** with fixed 15-30 second dwell per item
2. **Content fallback** when offline/stale (blank screen = product failure)
3. **Real-time polling** for content updates (5 minutes intervals-once a day-5 minutes more than enough)
4. **Staleness indicator** (shows "Updated 2m ago")
5. **HTML/CSS rendering** (responsive, no custom video codecs)
6. **Manual approval workflow** (governance requirement for enterprise)
7. **Live preview** before going active (test.html pattern)
8. **Error messaging** on screen (operators need diagnostics)
9. **Local caching** (survive restarts, network outages)
10. **Timestamp metadata** on every item
11. **Simple content management** (upload JSON, preview, approve)
12. **Graceful degradation** (always show something, never blank)

## Differentiators (Should-Have)

High-value, lower-complexity features that set this product apart:

1. **Interactive approval workflow** — test.html → active.json pattern is elegant and unique; most competitors lack this
2. **Per-item QR codes** — drives engagement, provides analytics vector
3. **Birthday card integration** — personal touch with high perceived value for office displays
4. **Real-time updates without reload** — seamless carousel updates via polling
5. **Item-level timing control** — different dwell times per item
6. **Branded white-label interface** — CSS customization for different offices
7. **Accessibility compliance** — WCAG 2.1 AA for nearby viewers
8. **Connection status visibility** — operators see network state without interrupting display

## Anti-Features (Don't Build)

Tempting features that add complexity without ROI:

1. **Video playback** — Incompatible with 15-second dwell; bandwidth/licensing complexity
2. **Real-time chat/comments** — Moderation burden; distracts from purpose
3. **Complex animations** — Performance inconsistent; looks dated; reduces readability
4. **Social media feeds** — Requires moderation; content ownership risks
5. **Custom JavaScript in content** — Security risk; breaks isolated content model
6. **Gamification/leaderboards** — Out of scope; different product entirely
7. **Machine learning recommendations** — Premature; requires data unavailable in v1
8. **Multi-screen orchestration** — Sync unreliable; use external tools
9. **Advanced permission hierarchies** — Overkill; typical office has 1-2 approvers
10. **Push notifications to devices** — Blurs signage/interaction boundary

## Feature Dependencies

**Phase 1 must have:**
- Carousel (core feature)
- Polling (content refresh)
- Fallback states (reliability)
- Approval workflow (governance)

**Phase 2 should have:**
- test.html preview (user review)
- Error messaging (operator visibility)
-Create example test data 3 news, 1 birthday 
**Phase 3 can add:**
- QR codes (once approval proven)
- Birthday cards (data source decided)
- Real-time updates (optimization)

## Hidden Complexity

Areas requiring careful implementation despite seeming simple:

- **Race conditions** during content approval (user approving while Hermes pushing)
- **Timezone handling** for scheduled content (dates vary by location)
- **Cache invalidation** (GitHub Pages CDN interactions)
- **Approval bottlenecks** (when user unavailable, content queues)
- **Image loading failures** (404s, timeouts, slow networks)

---

*Research completed: 2026-05-13*
*Source: Domain pattern analysis, digital signage best practices*
