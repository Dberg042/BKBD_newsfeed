# Project State: Infoskjerm News Display

**Current Date:** 2026-05-13
**Project Status:** Initialized, Ready for Phase 1
**Current Phase:** (Planning Phase 1)

## Project Reference

See: `.planning/PROJECT.md`

**Core Value:** Users can review and approve daily news content in under 3 minutes, with one-click approval that updates the TV display within 5 minutes.

**Current Focus:** Phase 1 - MVP Carousel Foundation

---

## What This Is

A static HTML/CSS/JavaScript news carousel for office TV displays that shows rotating Norwegian tech news items from kode24.no and tldr.tech. News is pushed daily by a Hermes agent, approved manually by a user via their phone, and displayed automatically on a 1920×1080 TV with optional birthday cards.

---

## Active Phase: Phase 1 - MVP Carousel Foundation

**Goal:** Build core carousel display with polling, approval workflow, and TV-ready styling

**Status:** Planning
**Requirements:** 26/31 v1 requirements

**Key Components to Build:**
- index.html: Main TV display with Tailwind layout
- css/style.css: Progress bar, transitions, TV-optimized CSS
- js/app.js: Data loading, polling, error recovery, state management
- js/carousel.js: Timer, rotation logic, progress animation
- Sample data in data/2026-05-13/: Test JSON files

**Success Criteria (from ROADMAP.md):**
1. Carousel rotates through 7+ items with 15-second dwell and 600ms cross-fade
2. Displays header, image, headline, summary, source, queue preview
3. Polls active.json every 5 minutes; reloads on date change
4. Fallback to last known good state; warning indicator on failures
5. Image fallback: show source text if image missing
6. Dark theme with TV-readable typography (headlines 64-72px, summary 32-36px)
7. Smooth progress bar, no cursor, no text selection
8. <1s load time on GitHub Pages

---

## Completed Artifacts

✓ `.planning/PROJECT.md` — Project overview and requirements hypothesis
✓ `.planning/config.json` — YOLO mode, coarse granularity, parallel execution, research+plan-check+verifier enabled
✓ `.planning/research/` — 5 research documents:
  - STACK.md: Vanilla JS + Tailwind CDN + GitHub Pages validated as optimal
  - FEATURES.md: Table stakes, differentiators, anti-features mapped
  - ARCHITECTURE.md: Component structure and data flow documented
  - PITFALLS.md: 5 critical pitfalls identified with prevention strategies
  - SUMMARY.md: Research synthesis confirming no blockers for Phase 1
✓ `.planning/REQUIREMENTS.md` — 31 v1 requirements organized by category
✓ `.planning/ROADMAP.md` — 4-phase structure with 100% requirement coverage
✓ `.planning/.codebase/` — 7 existing codebase documents

---

## Next Steps

1. `/clear` and run `/gsd-discuss-phase 1` to gather context for Phase 1 planning
2. Create Phase 1 plan with specific tasks, dependencies, and success criteria
3. Execute Phase 1: Build MVP carousel with all 8 success criteria
4. Move to Phase 2: Preview & approval workflow

---

## Key Decisions (from PROJECT.md)

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| active.json as single source of truth | Simplifies approval — user changes one line to approve | — Pending |
| Client-side QR generation | No backend needed, faster display, future customization | — Pending |
| 15-second display per item | Readable from distance, shows 7 items in ~2 minutes | — Pending |
| Vanilla JS (no framework) | Minimal dependencies, easier to deploy on GitHub Pages | — Pending |
| Hermes pushes to data/ folder | Audit trail in git, revert old content if needed | — Pending |

---

## Known Constraints

- **No npm packages:** Vanilla JS only, CDN dependencies for Tailwind/QR
- **GitHub Pages:** Static hosting only, no server-side logic
- **Manual approval:** User must explicitly edit active.json (feature, not limitation)
- **5-minute polling:** GitHub Pages CDN compatibility constraint
- **1920×1080 only:** TV-specific display dimensions

---

*Last updated: 2026-05-13 after initialization*
*Next phase transition: After Phase 1 completes, move PROJECT.md requirements to Validated*
