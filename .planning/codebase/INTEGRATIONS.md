---
name: INTEGRATIONS
description: External APIs, services, databases, and third-party integrations
date: [2026-05-13]
---

# External Integrations

## Primary Integration: Hermes Agent

**Status:** Not yet implemented. Core integration for daily news delivery.

### Hermes Agent (Daily News Provider)

**Schedule:** 06:00 UTC (Europe/Oslo timezone) daily

**Data Delivery Method:**
- Commits JSON files to repository `/data/YYYY-MM-DD/` folder
- Creates 7+ news JSON files: `news-01.json` through `news-07.json`
- Optionally creates `birthday.json` if there are birthdays that day
- Commits with message: "News update: YYYY-MM-DD"
- Pushes to `main` branch

**News Sources:**
- **Primary:** kode24.no (Norwegian tech news)
- **Secondary:** tldr.tech newsletter (filtered to IT/tech/data topics, translated to Norwegian if needed)

**Quality Requirements:**
- Summary: 200-300 characters, complete sentences, Norwegian language
- Image URL: must return 200 OK on HEAD request before committing
- No duplicate stories across 3-day window
- Mix of priorities (don't publish 7 AI stories in a row)

**Output JSON Schema:**

```json
{
  "id": "news-01",
  "title": "Norske utviklere tar i bruk AI-verktøy raskere enn EU-snittet",
  "summary": "En ny undersøkelse fra Kode24 viser at 73% av norske utviklere bruker AI-assistenter daglig...",
  "image_url": "https://kode24.no/images/article-12345.jpg",
  "source_url": "https://kode24.no/artikkel/12345",
  "source_name": "Kode24",
  "published_at": "2026-05-13T06:00:00Z",
  "priority": 1
}
```

### Hermes Integration Contract

**Critical Constraint:** Hermes MUST NOT modify `active.json`. That file is the manual approval gate controlled by the user.

**Success Criteria:**
- All 7+ JSON files created successfully
- birthday.json created only if birthdays exist (omit file if no birthdays), birthday database will be on hermes server. She will push it. 
- All image URLs are HTTPS and publicly accessible
- No duplicate headlines with previous 3 days
- Commit and push completed within 5 minutes

---

## Secondary Integration: GitHub Pages

**Purpose:** Static site hosting

**URL:** `https://github.com/Dberg042/BKBD_newsfeed` (configured for GitHub Pages on `main` branch)

**Features:**
- Serves static files (index.html, CSS, JS, JSON data)
- CDN caching for images and assets
- HTTPS support included
- No server-side processing needed

---

## Tertiary Integrations: External CDN Services

### Tailwind CSS CDN
**URL:** https://cdn.tailwindcss.com
**Purpose:** Styling framework (no build step)
**Status:** Always-on, no configuration

### Jsdelivr CDN (QR Code Library)
**URL:** https://cdn.jsdelivr.net/npm/qr-code-styling@1.6.0-rc.1/lib/qr-code-styling.js
**Purpose:** Client-side QR code generation
**Status:** Always-on, no configuration

### Google Fonts CDN
**URL:** https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap
**Purpose:** Inter typeface for Scandinavian text rendering
**Status:** Always-on, no configuration

---

## Data Polling & Sync Mechanism

**active.json Polling:**
- Interval: Every 5 minutes
- Method: Fetch with cache-buster query param (`active.json?t={timestamp}`)
- Trigger: If `date` field changes, full page reload (`location.reload()`)
- Purpose: User's approval gate — changing this file approves new content

**Retry Logic (Fetch Failures):**
- Retry up to 3 times with exponential backoff (1s, 3s, 9s)
- Fallback: Display last known good state + warning indicator
- Never show blank screen

---

## No Direct Integrations (Not in v1)

The following are explicitly out of scope for the first version:

- **Database:** All data is JSON in git (no persistent database)
- **Authentication:** No login/auth system
- **Weather API:** Not integrated
- **Analytics:** No view tracking or metrics
- **Push Notifications:** No alerts if Hermes fails
- **Admin Dashboard:** Manual GitHub mobile UI for approval
- **Email:** No notifications

---

## User Approval Workflow

**Manual approval via GitHub Mobile:**

1. User opens `test.html` on phone at 07:30. Test page should be mobil friendly.
2. Reviews 7 news items (can skip with arrow keys)
3. If approved, opens GitHub mobile and edits `data/active.json`
4. Changes `"date": "2026-05-13"` → `"date": "2026-05-14"`
5. Commits from phone
6. TV detects change on next 5-minute poll, reloads with new content

**No auto-approval** — manual review prevents absurd content from reaching the TV.

---

## Error Handling & Fallbacks

| Failure Scenario | Handling |
|---|---|
| Image URL returns 404/403 | Show source name as text fallback in image area |
| Birthday.json missing (404) | Skip this, show only news, if birtday json exist show it |
| news-XX.json partially missing | Cycle through available news only (may show <7 items) |
| All news JSONs missing | Show "Ingen nyheter tilgjengelig i dag" message |
| Fetch fails 3× in a row | Display last known good carousel state + warning indicator |
| active.json unreachable | Continue displaying cached content, retry on next poll |

---

*Last updated: [2026-05-13]*
