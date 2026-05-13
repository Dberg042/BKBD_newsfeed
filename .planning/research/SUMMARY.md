---
name: SUMMARY
description: Research synthesis for Infoskjerm project
date: [2026-05-13]
---

# Research Summary: Infoskjerm News Display

## Overview

Research into TV display systems, carousel implementations, and large-screen digital signage patterns confirms that the Infoskjerm project is well-designed and ready for execution. The tech stack is optimal, the architecture is sound, and critical pitfalls have been identified for mitigation.

**Research Confidence:** HIGH across all dimensions

---

## Key Findings

### Stack (HIGH confidence)

**Validated stack choices:**
- Vanilla JavaScript: Optimal for single-purpose carousel, eliminates 40-50KB framework overhead
- Tailwind CSS v4 CDN: Industry standard 2025+, proven on static sites, zero build step
- GitHub Pages: Perfect integration with Hermes workflow, 99.9% SLA, free
- qr-code-styling v1.6+: Lightweight, modern, well-maintained
- Google Fonts Inter: Excellent Norwegian character support, variable font for crisp rendering

**Performance targets are achievable:**
- Initial load: <1 second
- Memory footprint: 3-5MB
- Carousel transitions: <50ms (GPU-accelerated)
- Polling overhead: negligible

**No technology blockers for v1.**

---

### Features (MEDIUM-HIGH confidence)

**Table stakes (must-have in Phase 1):**
- Carousel with 15-30 second dwell per item
- Content fallback when offline/stale
- Real-time polling for updates (5-minute intervals)
- Manual approval workflow (governance)
- Live preview before activation (test.html)
- Error messaging and operator visibility

**Differentiators (Phase 2-3):**
- Interactive approval workflow (test.html → active.json pattern)
- Per-item QR codes (engagement + analytics)
- Birthday card integration (personal touch)
- Real-time updates without reload
- Connection status visibility

**Anti-features (explicitly DON'T build):**
- Video playback (incompatible with 15s dwell)
- Chat/comments (moderation burden)
- Complex animations (performance + readability issues)
- Social media feeds (content ownership risks)
- Multi-screen orchestration (sync unreliable)

**Feature dependencies suggest phased build:**
- Phase 1: Carousel + fallback + polling + approval
- Phase 2: Preview + error messaging
- Phase 3: QR + birthdays + real-time updates
- Phase 4: Scale + analytics

---

### Architecture (HIGH confidence)

**System is deliberately simple and sound:**
- Data flow: Git (source of truth) → Client app → TV display
- Component separation: Data loading, state, carousel logic, rendering
- active.json pointer provides approval gate and prevents race conditions
- JSON-in-git is not a limitation; it's an intentional design for governance

**Build order has clear gates:**
1. Foundation (HTML/CSS, Tailwind)
2. Data layer (fetch, polling, retry logic)
3. Display logic (carousel, QR generation)
4. Polish (error states, layout verification)

**Error recovery is multi-level:**
1. Exponential backoff retry (1s, 3s, 9s)
2. Last known good state fallback
3. Absolute fallback message
4. Operator visibility via warning indicators

**No architectural risk for v1.**

---

### Pitfalls (HIGH confidence)

**Critical issues to address in Phase 1-2:**

1. **Memory leaks** — Long-running carousels need cleanup; prevent with proper interval/listener management
2. **Image loading failures** — Implement fallback UI (show source name if image missing)
3. **Content race conditions** — Keep active.json separate from data/ files to prevent conflicts
4. **Polling desynchronization** — Use wall-clock time checks, not just counter increments
5. **JSON corruption** — Validate schema, gracefully skip bad items, never crash

**Moderate issues for Phase 3-4:**
- GPU acceleration testing (smooth transitions on TV hardware)
- Text legibility at 3+ meters (large fonts, high contrast)
- Aspect ratio / image scaling (enforce sizes, use object-fit)
- Auto-recovery from extended outages (Service Worker, auto-reload)

**All pitfalls are preventable with documented strategies.**

---

## Roadmap Implications

### Phase 1: MVP Carousel Foundation
- Build carousel rotation, polling, approval workflow
- Implement fallback states and error recovery (critical)
- Design for 1920×1080 with 64-72px headlines
- Table stakes features only
- Test with sample data

### Phase 2: Preview & Approval Workflow
- Solidify test.html preview mode
- Implement active.json editing workflow
- Add error messaging and operator visibility
- Test content approval flow end-to-end

### Phase 3: Differentiators
- QR code generation (once approval workflow proven)
- Birthday card integration (requires data source decision)
- Real-time updates optimization
- Connection status indicators

### Phase 4: Polish & Deployment
- Hardware testing (actual TV, test legibility)
- Auto-restart / recovery strategies
- Accessibility compliance (WCAG 2.1 AA)
- Performance optimization

---

## Open Questions

1. **Birthday data source:** Manual CSV, HR API, or Slack integration? Scope decision needed.
Aswer:This is hermes's job not Code agent. 
2. **QR code usage:** What should QR codes link to? Without use cases, feature adds zero value.
Aswer:QR code is for user, they can get the links and  read news details, Scan code on mobile and read details. 
3. **Real-time requirement:** Is 5-minute polling acceptable, or must updates be near-instant?
A:5 is okey
4. **Screen hardware:** Specific TV models to target? Affects rendering/performance testing.
Not important, infoskjerm app handles that.
5. **Content scheduling:** Do offices need timezone-aware scheduling, or is "weekday only" sufficient?
A:yes weekday only.
---

## Confidence Assessment

| Dimension | Confidence | Blockers? |
|-----------|-----------|----------|
| Tech Stack | HIGH | No |
| Features & Prioritization | MEDIUM-HIGH | No |
| Architecture | HIGH | No |
| Pitfalls & Prevention | HIGH | No |
| **Overall** | **HIGH** | **No** |

**Recommendation:** Proceed directly to requirements definition and roadmap creation. No additional research needed for Phase 1 planning.

---

*Research Summary: 2026-05-13*
*Ready for: REQUIREMENTS.md → ROADMAP.md → Phase 1 Planning*
