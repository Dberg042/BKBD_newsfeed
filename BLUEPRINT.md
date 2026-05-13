# Infoskjerm News Display — Project Blueprint

**For:** Office TV info screen replacing infoskjermen.no/omvisning/
**Stack:** Vanilla HTML/CSS/JS + Tailwind CDN, hosted on GitHub Pages
**Display:** 1920x1080 landscape TV, 3+ meters viewing distance
**News source:** Norwegian tech news (tldr.tech, kode24.no) via Hermes agent

---

## 1. Project Goal

Build a static info screen that displays 7+ Norwegian IT/tech news items in a rotating carousel with one optional birthday card. News content is pushed daily by the Hermes agent as JSON files. The screen runs unattended on a TV and updates automatically when a new day's content is approved.

---

## 2. Architecture Overview

```
Hermes Agent (06:00 daily)
       │
       │ commits JSON to repo
       ▼
data/YYYY-MM-DD/news-01.json ... news-07.json + birthday.json
       │
       │ (User reviews via test.html on phone at 07:30)<>
       │ (User edits active.json to point to today)
       ▼
data/active.json  ← single source of truth
       │
       ▼
index.html (TV) reads active.json → loads date folder → displays carousel
```

**Key principle:** `active.json` is a pointer file. Approval = changing one line in this file via GitHub mobile app.

---

## 3. Repository Structure

```
infoskjerm-news/
├── index.html              # Production screen (TV opens this)
├── test.html               # Preview screen (User reviews on phone)
├── css/
│   └── style.css           # Custom styles supplementing Tailwind CDN
├── js/
│   ├── app.js              # Main app logic, data loading, polling
│   ├── carousel.js         # News rotation, progress bar, queue preview
│   └── qr.js               # Client-side QR code generation
├── data/
│   ├── active.json         # Pointer: {"date": "2026-05-13"}
│   └── 2026-05-13/
│       ├── news-01.json
│       ├── news-02.json
│       ├── news-03.json
│       ├── news-04.json
│       ├── news-05.json
│       ├── news-06.json
│       ├── news-07.json
│       └── birthday.json   # Optional, omit if no birthdays
└── README.md               # Hermes integration spec
```

**Retention:** Never delete old date folders. Repo will grow ~8 JSON files per day, fine for years.

---

## 4. JSON Schemas

### `data/active.json`
```json
{
  "date": "2026-05-13",
  "approved_at": "2026-05-13T07:32:00Z",
  "approved_by": "User"
}
```

### `data/YYYY-MM-DD/news-XX.json`
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

**Field notes:**
- `id` matches filename for traceability
- `image_url` must be HTTPS, publicly accessible (no auth)
- `source_url` is what the QR code encodes
- `priority` determines display order (1 = first)
- `summary` should be 2-3 sentences, ~200-300 chars (TV-readable length)

### `data/YYYY-MM-DD/birthday.json` (optional)
```json
{
  "type": "birthday",
  "names": ["Lars Olsen", "Aisha Khan"],
  "message": "Gratulerer med dagen! 🎉"
}
```

If the file doesn't exist, the birthday card slot shows a neutral "Today's date / weather / company logo" fallback panel — never empty space.

---

## 5. Screen Layout (1920x1080)

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo]                  Tirsdag 13. mai 2026          [Clock]      │  80px
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                                                                │ │
│  │         NEWS IMAGE (1600×500)                                  │ │
│  │                                                                │ │
│  ├────────────────────────────────────────────────────────────────┤ │
│  │                                                                │ │
│  │  HEADLINE (64-72px, bold)                              [QR]    │ │
│  │  Two lines max                                        200px    │ │
│  │                                                                │ │
│  │  Summary text in 32-36px (5-6 lines)                   Kode24  │ │
│  │                                                                │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  ▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  60% │  Progress
│  Neste: → AI-regulering i EU  → Equinor satser  → Telenor utvider │  Queue
└─────────────────────────────────────────────────────────────────────┘
```

**Dimensions:**
- Header: 80px
- Main content area: ~880px (image ~1600px + text ~380px on left)
- Footer (progress + queue): 120px
- Main column (news): 1600px wide
- Outer padding: 40px

---

## 6. Carousel Behavior

- **Display duration:** 15 seconds per news item
- **Total cycle:** 7 × 15s = 105 seconds, then loops infinitely+ Bonus for birthday
- **Transition:** 600ms cross-fade between items
- **Progress bar:** Smooth linear animation, 15s to fill, resets on new item
- **Queue preview:** Shows next 3 items as truncated headlines (max 30 chars each)
- **Birthday card:** Birthday Cake as image, Headline "Gratulerer med Dagen ¤name"

**Edge cases:**
- If only 5 news JSONs exist instead of 7 or 7+, cycle through what's available
- If 0 news JSONs, show "Ingen nyheter tilgjengelig i dag" with last good date noted
- If image fails to load, show source name as text fallback in placeholder area

---

## 7. Data Loading & Polling

**On page load:**
1. Fetch `data/active.json`
2. Read `date` field
3. Fetch `data/{date}/news-01.json` through `news-07.json` in parallel
4. Fetch `data/{date}/birthday.json` (404 is fine, skip)
5. Sort by `priority` field
6. Start carousel

**Polling:**
- Every 5 minutes, re-fetch `active.json`
- If `date` changed → full page reload (`location.reload()`)
- If unchanged → do nothing
- Add cache-buster query param: `active.json?t={timestamp}` to bypass GitHub Pages CDN

**Auto-recovery:**
- If fetch fails, retry 3× with exponential backoff (1s, 3s, 9s)
- After all retries fail, show last known good state + small "⚠ Connection issue" indicator
- Never show a blank screen

---

## 8. QR Code Implementation

Use `qr-code-styling` library via CDN:
```html
<script src="https://cdn.jsdelivr.net/npm/qr-code-styling@1.6.0-rc.1/lib/qr-code-styling.js"></script>
```

**Specs:**
- Size: 200×200px
- Error correction: M (handles small obstructions)
- Encode: `source_url` field
- Style: rounded dots, dark color matching theme
- Optional: company logo in center (if available as PNG)

**Generated fresh per news item** when carousel switches — no pre-generation needed.

---

## 9. test.html — Preview Mode

Same code as `index.html`, but with these differences:

1. **Default date:** Tomorrow (auto-computed) instead of reading `active.json`
2. **URL override:** `?date=2026-05-14` to preview a specific day
3. **Visual indicator:** Red banner at top — `⚠ PREVIEW MODE — Viser nyheter for 14.05.2026`
4. **Approve button:** Top-right, links directly to GitHub mobile edit URL:
   ```
   https://github.com/{user}/{repo}/edit/main/data/active.json
   ```
   real git adress, adjust accordingly: https://github.com/Dberg042/BKBD_newsfeed.git
5. **Manual navigation:** Left/right arrow keys skip between news items (instead of waiting 15s each)
6. **Inspection mode:** Click any news to pause carousel, click again to resume

---

## 10. Daily Workflow (User's Side)

**06:00** — Hermes commits `data/2026-05-14/` with 7 news + optional birthday
**07:30** — User opens `https://{user}.github.io/infoskjerm-news/test.html` on phone
**07:30-07:33** — Reviews 7 news, skips with arrow keys, checks for absurd content
**07:33** — If approved:
  - Taps "Godkjenn" button
  - GitHub mobile opens `active.json` editor
  - Changes `"date": "2026-05-13"` → `"date": "2026-05-14"`
  - Commits ("Approve news for 14.05.2026")
**07:38** — TV polls `active.json`, sees new date, reloads — new content live

If something looks wrong: edit/delete the offending news JSON in GitHub mobile, then approve.

---

## 11. Hermes Integration Contract(External Self Evolving and Learning Agent)
Create an skill md file for Hermes
**Schedule:** Daily at 06:00 Europe/Oslo

**Sources:**
- Primary: kode24.no
- Secondary: tldr.tech from newsletter (filtered to IT/tech/data only)
- Language: Norwegian (translate from English if needed)

**Output:**
1. Create folder `data/YYYY-MM-DD/` (tomorrow's date)
2. Write 7+ files: `news-01.json` through `news-07.json` (priority 1-7+)
3. Write `birthday.json` ONLY if there's a birthday today (otherwise omit entirely)
4. Commit with message: `News update: YYYY-MM-DD`
5. Push to `main` branch
6. **DO NOT modify `active.json`** — that's User's manual approval gate

**Quality requirements:**
- Summary: 200-300 chars, complete sentences, Norwegian
- Image URL: must return 200 OK on HEAD request before committing
- No duplicate stories across days (check previous 3 days' headlines)
- Mix of priorities — don't put 7 AI stories in a row

---

## 12. Design Language

**Use the `frontend-design` skill** (Anthropic's official design skill at `/mnt/skills/public/frontend-design/`). Do NOT use the `ui-ux-pro-max-skill` repo — it's a third-party package with unclear quality.

**Design principles:**

- **TV-readable from 3 meters:**
  - Headlines: 64-72px bold
  - Summary: 32-36px regular
  - Queue labels: 24px
  - Body text minimum: 28px

- **High contrast:**
  - Dark theme: near-black background (#0A0F1A), high-contrast white text (#F5F7FA)
  - One accent color for progress bar, QR border, source tags (suggested: warm orange #FF6B35 or Norwegian blue #003D7A)

- **Typography:**
  - Inter (variable font, handles Norwegian å/ø/æ cleanly)
  - Self-host via Google Fonts: `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">`

- **Motion:**
  - Calm fade transitions (600ms)
  - Progress bar smooth linear animation
  - No bouncing, no parallax, no "Apple Keynote" effects
  - TV runs 24/7 — flashy motion becomes irritating fast

- **Information hierarchy:**
  - Eye flow: top-left logo → big image → headline → summary → QR → source
  - QR sits bottom-right of news card, clearly distinct from content
  - Source name as small tag, not buried

- **Birthday card:**
  - Subtly warmer tone (small accent illustration or soft gradient)
  - Same typography family for cohesion
  - Doesn't compete visually with news (smaller text, calmer)

- **No clutter:**
  - No weather widgets unless requested later
  - No social media icons
  - No ticker tape
  - Goal: looks like a Scandinavian newspaper, not a Times Square billboard

---

## 13. Tailwind CSS Setup

Use Tailwind CDN (no build step):
```html
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          'bg-primary': '#0A0F1A',
          'text-primary': '#F5F7FA',
          'accent': '#FF6B35',
        },
        fontFamily: {
          'sans': ['Inter', 'sans-serif'],
        },
      }
    }
  }
</script>
```

Custom CSS in `css/style.css` for:
- Progress bar animation keyframes
- Carousel fade transitions
- Any TV-specific overrides (cursor: none, user-select: none, etc.)

---

## 14. Deliverables Checklist for Claude Code

- [ ] `index.html` — production TV display
- [ ] `test.html` — preview/review mode
- [ ] `css/style.css` — custom styles
- [ ] `js/app.js` — data loading, polling, init
- [ ] `js/carousel.js` — rotation logic, progress bar, queue
- [ ] `js/qr.js` — QR generation per item
- [ ] `data/active.json` — sample pointer
- [ ] `data/2026-05-13/` — sample folder with 7 fUser news + 1 birthday for testing
- [ ] `README.md` — Hermes contract + deployment instructions
- [ ] GitHub Pages enabled on `main` branch

---

## 15. Out of Scope (For Now)

These are NOT in v1, can be added later:
- Weather widget
- Multi-language support
- Multiple TV screens with different content
- Analytics / view tracking
- Admin dashboard
- Push notifications when Hermes fails
- Auto-approval (defeats the manual review purpose)

---

## Final Prompt to Give Claude Code

```
Read BLUEPRINT.md in this repo. Build the complete infoskjerm-news project according to the spec.

Use the frontend-design skill from /mnt/skills/public/frontend-design/ for visual design decisions.

Key constraints:
- Vanilla JS only, Tailwind via CDN, no build step
- Must work on GitHub Pages
- TV display 1920x1080 landscape, viewed from 3+ meters
- Norwegian language UI
- Generate sample data in data/2026-05-13/ so I can test locally by opening index.html

Deliver all files listed in section 14 of the blueprint.
```
