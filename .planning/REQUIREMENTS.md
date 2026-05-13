# Requirements: Infoskjerm News Display

**Defined:** 2026-05-13
**Core Value:** Users can review and approve daily news content in under 3 minutes, with one-click approval that updates the TV display within 5 minutes

## v1 Requirements

### Display & Layout

- [ ] **DISP-01**: TV screen displays header with date, time, and logo
- [ ] **DISP-02**: Main carousel rotates through 7+ news items with 15-second display per item
- [ ] **DISP-03**: Each news item shows: large image, headline (2 lines max), summary text (5-6 lines), QR code, source name
- [ ] **DISP-04**: Progress bar animates smoothly across 15-second display window
- [ ] **DISP-05**: Footer shows queue preview of next 3 items (30 chars max each)
- [ ] **DISP-06**: 600ms cross-fade transitions between news items
- [ ] **DISP-07**: Birthday card displays (if available) with "Gratulerer med Dagen" message in carousel rotation
- [ ] **DISP-08**: Fallback UI for missing images: show source name as text instead

### Data Management

- [ ] **DATA-01**: active.json pointer file determines which date's news is displayed
- [ ] **DATA-02**: Page loads data from data/{date}/ folder (up to 7+ JSON files)
- [ ] **DATA-03**: News sorted by priority field (1-7+)
- [ ] **DATA-04**: Birthday card is optional (404 response skips, shows fallback instead)

### User Interactions (Preview Mode)

- [ ] **UI-01**: test.html preview page defaults to tomorrow's date
- [ ] **UI-02**: test.html shows red warning banner (PREVIEW MODE)
- [ ] **UI-03**: User can override preview date via ?date=YYYY-MM-DD URL param
- [ ] **UI-04**: Arrow keys skip between items (no 15-second wait)
- [ ] **UI-05**: Click item to pause carousel, click again to resume
- [ ] **UI-06**: "Godkjenn" (Approve) button links to GitHub mobile editor for active.json
- [ ] **UI-07**: User can edit/delete offending news JSON files before approving

### Polling & Auto-Updates

- [ ] **POLL-01**: Every 5 minutes, fetch active.json with cache-buster param (?t={timestamp})
- [ ] **POLL-02**: If date changed in active.json, full page reload
- [ ] **POLL-03**: If date unchanged, do nothing
- [ ] **POLL-04**: Failed fetches retry 3× with exponential backoff (1s, 3s, 9s)
- [ ] **POLL-05**: Show warning indicator if fetch fails 3× in a row
- [ ] **POLL-06**: Last known good state always displayed (never blank screen)

### QR Codes

- [ ] **QR-01**: 200×200px QR code generated per news item
- [ ] **QR-02**: Encodes source_url field
- [ ] **QR-03**: Rounded dots, M error correction
- [ ] **QR-04**: Generated fresh per carousel item (client-side via qr-code-styling CDN)

### Styling & Design

- [ ] **STYLE-01**: Dark theme: #0A0F1A background, #F5F7FA text, #FF6B35 accent
- [ ] **STYLE-02**: Inter font family from Google Fonts CDN
- [ ] **STYLE-03**: TV-readable sizes: Headlines 64-72px, Summary 32-36px, Queue 24px
- [ ] **STYLE-04**: No cursor, no text selection (TV-optimized CSS)
- [ ] **STYLE-05**: Tailwind CSS via CDN for layout and utility styles
- [ ] **STYLE-06**: Custom CSS animations for progress bar and carousel transitions
- [ ] **STYLE-07**: Responsive dimensions: 1920×1080 landscape, 80px header, 120px footer

### Deployment

- [ ] **DEPLOY-01**: Hosted on GitHub Pages from main branch
- [ ] **DEPLOY-02**: All static files (HTML, CSS, JS, JSON) served directly
- [ ] **DEPLOY-03**: No build step required (vanilla JS + CDN only)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Content Scheduling

- User can specify start/end dates for news items (weekday-only rules, holiday handling)
- System respects timezone-aware scheduling for different office locations

### Analytics & Monitoring

- Track view counts and engagement per news item
- Dashboard showing content performance heatmaps
- Email alerts if content approval queue backs up

### Multi-Screen Management

- Support multiple TVs showing different content based on location/department
- Centralized content distribution to screens
- Per-screen scheduling rules

### Admin Dashboard

- Web-based UI for uploading content, previewing, approving (instead of GitHub mobile UI)
- Drag-and-drop image uploads
- Rich text editor for news summaries

### Mobile Companion App

- Mobile app for approvers to review content on-the-go
- Push notifications for pending approvals
- Analytics view on mobile

## Out of Scope

| Feature | Reason |
|---------|--------|
| Video playback | Incompatible with 15-second dwell times; bandwidth/licensing complexity adds risk |
| Real-time chat/comments | Moderation burden; distracts from core purpose of news display |
| Complex animations | Performance inconsistent on TV hardware; reduces text readability |
| Social media feeds | Requires constant moderation; content ownership risks |
| Custom JavaScript in content | Security risk; breaks isolated content model |
| Gamification/leaderboards | Out of scope; different product entirely |
| Machine learning recommendations | Premature; requires data unavailable in v1 |
| Multi-screen orchestration | Network sync unreliable; recommend external tools |
| Advanced permission hierarchies | Overkill; typical office has 1-2 approvers |
| Push notifications to devices | Blurs signage/interaction boundary |
| Real-time multi-language support | Norwegian only for v1 |
| Weather widget | Not core to news display value |
| Accessibility compliance | Not required for v1 (office display); planned for v2 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DISP-01 through DISP-08 | Phase 1 | Pending |
| DATA-01 through DATA-04 | Phase 1 | Pending |
| UI-01 through UI-07 | Phase 2 | Pending |
| POLL-01 through POLL-06 | Phase 1 | Pending |
| QR-01 through QR-04 | Phase 3 | Pending |
| STYLE-01 through STYLE-07 | Phase 1 | Pending |
| DEPLOY-01 through DEPLOY-03 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 31 total
- Mapped to phases: (pending roadmap)
- Unmapped: (pending roadmap)

---

*Requirements defined: 2026-05-13*
*Last updated: 2026-05-13 after research completion*
