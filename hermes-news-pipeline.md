# Hermes News Pipeline — Daily Workflow Documentation

> **Purpose:** This document maps the complete daily news pipeline — from raw scraping to TV screen display and Slack broadcasts.  
> **Date:** 2026-05-22  
> **Repository:** To be added to Ake's repo as `docs/news-pipeline.md`

---

## Architecture Overview

The pipeline runs as a **three-agent system** orchestrated by cron jobs, with the Obsidian vault as the central data store.

```
┌─────────────────────────────────────────────────────────────┐
│                     DAILY NEWS PIPELINE                      │
├──────────────┬──────────────────┬────────────────────────────┤
│  03:00 UTC   │   05:30 UTC      │  06:00 / 09:30 / 13:00    │
│  COLLECTOR   │   NEWSFEED       │  PUBLISHER (Ceryx)         │
│              │                  │                            │
│  HN ─────┐   │                  │                            │
│  TLDR ───┤   │  Vault ──► JSON  │  Vault ──► Slack Webhook  │
│  Substack┤──►│         ──► Git  │                            │
│  Kode24 ─┤   │         ──► TV   │  #eva-ops (Discord)       │
│  Reddit ─┘   │                  │                            │
│              │                  │                            │
│  Output:     │  Output:         │  Output:                   │
│  Vault .md   │  /data/YYYY-     │  3 Slack slots/day         │
│              │  MM-DD/*.json    │                            │
└──────────────┴──────────────────┴────────────────────────────┘
```

---

## Agent 1: Ceryx Collector (03:00 UTC, Mon–Fri)

**Cron Job ID:** `bc3abaf68f61`  
**Model:** DeepSeek-V4-Pro (Azure Foundry)  
**Toolsets:** `terminal`, `web`, `file`, `browser`  
**Cron Skill:** `ceryx-collector`  
**Deliver:** Discord `#taskforce-hq`

### What It Does

Scrapes 5 data sources and writes a structured markdown file to the Obsidian vault:

```
/root/Documents/Obsidian Vault/daily/YYYY-MM-DD.md
```

### Data Sources

| # | Source | Tool/Method | Output |
|---|--------|-------------|--------|
| 1 | **Hacker News** | `web_extract` on `https://news.ycombinator.com/` → open actual article URLs | 5–7 news items |
| 2 | **TLDR Newsletters** (AI, InfoSec, Dev, base) | `himalaya` CLI → `curl` to follow redirect links | 3–5 news items |
| 3 | **Simplifying AI / Substack** | `curl` on RSS feeds (`almosttimely.substack.com/feed`, `addyo.substack.com/feed`, `excellentprompts.substack.com/feed`) | 1–2 AI tips |
| 4 | **Kode24 (Norwegian tech news)** | `himalaya` CLI → inbox scan for `@kode24.no` | 2 best Norwegian stories |
| 5 | **Reddit r/ProgrammerHumor** | **Composio MCP** → `COMPOSIO_SEARCH_TOOLS` → `COMPOSIO_MULTI_EXECUTE_TOOL` with `REDDIT_GET_R_TOP` | 1 meme (highest score, SFW) |

### Tools Required Per Source

#### Source 1: Hacker News
- `web_extract` — fetch HN front page and actual article pages
- `curl` — extract `og:image` / `twitter:image` from article pages
- `terminal` — image URL verification via `curl -sI`

#### Source 2: TLDR Newsletters
- `terminal` → `himalaya search not AND subject "TLDR" -m 5` (email retrieval)
- `terminal` → `curl -sI -o /dev/null -w '%{url_effective}' "REDIRECT_URL"` (follow redirects)
- `web_extract` — open actual article pages
- `curl` — extract `og:image`

#### Source 3: Substack
- `terminal` → `curl -sL` on RSS feeds (XML parsing)
- `curl` — extract `<media:content url="...">` from RSS for images

#### Source 4: Kode24
- `terminal` → `himalaya` CLI — inbox scan
- `web_extract` — open Kode24 article pages
- `curl` — image extraction

#### Source 5: Reddit (Composio MCP)
- `mcp_composio_linkedin_COMPOSIO_SEARCH_TOOLS` — discover Reddit tools
- `mcp_composio_linkedin_COMPOSIO_MULTI_EXECUTE_TOOL` — execute `REDDIT_GET_R_TOP`

### Output Format (Vault File)

```markdown
# Daily News — 2026-05-22
> collected_at: 2026-05-22T03:00:00Z
> sources: Google, Bloomberg, Kode24, Addy Osmani
> total_news: 8 | tips: 1 | memes: 1

## news

## [[Google]] Gemini Intelligence unveiled at Android Show 2026
- **url:** https://blog.google/products/android/gemini-intelligence/
- **source:** Google
- **priority:** 870
- **image:** https://storage.googleapis.com/gweb-uniblog-publish-prod/images/...
- **summary:** Google avduket Gemini Intelligence på The Android Show 2026...
- **category:** AI
- **status:** available

[... more news items sorted by priority descending ...]

## ai-tips

## 💡 AI-tips: Title
- **url:** https://substack.com/...
- **source:** Addy Osmani
- **tip:** Concrete, actionable advice. 3-5 sentences.
- **why_it_matters:** Why relevant for Norwegian IT consultants
- **status:** available

## memes

## 😂 Meme: Reddit title
- **image_url:** https://i.redd.it/....jpg
- **source:** r/ProgrammerHumor
- **permalink:** https://reddit.com{permalink}
- **score:** 4200
- **nsfw:** false
- **harmful:** false
- **status:** available
```

### Quality Control (Before Write)

| Check | Rule |
|-------|------|
| Language | All summaries in Norwegian bokmål |
| Summary length | 200–300 characters, complete sentences |
| Image URL | `curl -sI` must return 200 OK; drop field if 404 |
| Source URL | HEAD must return 200 OK; drop story if 404 |
| No ads | Skip sponsored content, clickbait |
| Deduplication | Same story in HN + TLDR → keep best version |
| Diversity | Spread across AI / DevOps / Security / Business |
| Minimum count | 4 news items minimum; target 8–10 |
| Bouvet priority | Any Bouvet mention → `priority: 950`, placed FIRST |

---

## Agent 2: Newsfeed (05:30 UTC, Mon–Fri)

**Cron Job ID:** `688f4cdaf700`  
**Model:** DeepSeek-V4-Pro (Azure Foundry)  
**Toolsets:** `terminal`, `file`  
**Cron Skill:** `newsfeed`  
**Working Directory:** `/root/newsfeed`  
**Deliver:** Discord `#taskforce-hq`

### What It Does

Reads the vault file written by Ceryx Collector, selects the 10 highest-priority news items, converts them to JSON, and pushes to GitHub Pages for TV screen display.

### Input
- `/root/Documents/Obsidian Vault/daily/YYYY-MM-DD.md` (written by Collector)

### Output
- GitHub repo: `https://github.com/Dberg042/BKBD_newsfeed`
- Data folder: `/root/newsfeed/data/YYYY-MM-DD/` containing:
  - `news-PRIORITY.json` files (one per news item)
  - `manifest.json` (sorted array of filenames)
- Updated: `/root/newsfeed/data/active.json` (`date_test` field only)

### Tools Used

| Tool | Purpose |
|------|---------|
| `terminal` → `git pull --rebase` | Sync repo before writing |
| `terminal` → `mkdir`, shell scripting | Create date folder, JSON generation |
| `write_file` | Write individual `news-PRIORITY.json` files |
| `terminal` → `python3` | Build `manifest.json`, update `active.json` |
| `terminal` → `git add/commit/push` | Two-commit push to GitHub |
| `patch` / `terminal` → `sed` | Mark vault items as `status: newsfeed` |
| `send_message` | Discord notification to `#taskforce-hq` |

### JSON Output Schema

```json
{
  "id": "news-870",
  "title": "Google avduker Gemini Intelligence",
  "summary": "Google avduket Gemini Intelligence på The Android Show 2026...",
  "image_url": "https://storage.googleapis.com/gweb-uniblog-publish-prod/images/...",
  "source_url": "https://blog.google/products/android/gemini-intelligence/",
  "source_name": "Google",
  "published_at": "2026-05-22T06:00:00Z",
  "priority": 870
}
```

### Critical Rules
- **No external scraping** — vault only
- **No empty folders** — if vault missing or 0 items: Discord failure, exit
- **Bouvet items (900+ priority)** always included
- **`active.json`**: Only update `date_test` — NEVER touch `date` (Ake's production gate)
- **Two commits**: news bundle first, then active.json
- **Vault patching**: After success, mark used items `status: newsfeed`

---

## Agent 3: Ceryx Publisher (06:00 / 09:30 / 13:00 UTC, Mon–Fri)

**Cron Job IDs:** `d7406412b79d` (06:00), `c7842704bb49` (09:30), `26cd4e1b94cc` (13:00)  
**Retry:** `62e7bd8a2f53` (06:30, if 06:00 failed)  
**Model:** DeepSeek-V4-Pro (Azure Foundry)  
**Toolsets:** `terminal`, `file`  
**Cron Skill:** `ceryx-publisher`  
**Deliver:** Discord `#eva-ops`

### What It Does

Reads the vault, distributes news items across 3 daily Slack broadcast slots, and publishes them via Slack webhook with a playful Ceryx persona (Norwegian bokmål).

### 3-Slot Distribution

| Slot | Time (UTC) | News Count | Extras | Tone |
|------|-----------|------------|--------|------|
| Slot 1 | 06:00 | 3–4 (highest priority) | 1 meme | Morning kickoff ☕️ |
| Slot 2 | 09:30 | 3–4 (mid priority) | 1 AI-tip | Mid-morning brain food 🚀 |
| Slot 3 | 13:00 | Remaining (2–4) | Closing | Afternoon wrap-up 🥂 |

### Workflow

#### Plan Mode (06:00 run only)
1. Read vault → parse all `## news`, `## ai-tips`, `## memes`
2. Sort by priority descending → distribute across 3 slots
3. Write plan file: `daily/YYYY-MM-DD_ceryx.md`
4. Publish Slot 1 → Slack webhook + mark plan in ONE atomic step

#### Scheduled Runs (09:30, 13:00)
1. Check plan file exists
2. If missing → catch-up mode (build plan, publish ALL slots)
3. Read plan → publish assigned slot + mark plan

### Tools Used

| Tool | Purpose |
|------|---------|
| `read_file` / `terminal` → `cat` | Read vault and plan files |
| `write_file` | Write plan file (`_ceryx.md`) |
| `terminal` → `python3 << 'PYEOF'` | **Send + Mark atomically**: `urllib` POST to Slack webhook, then `re` patch plan file (same script) |
| `patch` | Mark plan items as `[x] slack-published` |
| `send_message` | Discord notification to `#eva-ops` |

### Slack Delivery

Uses `python3` with `urllib.request` → Slack Incoming Webhook (blocks format).

**Webhook URL:** `https://hooks.slack.com/services/T024XURJ2/B0B4XAHL3HB/...`

### Persona

Ceryx — Consulenthus' news herald. Playful, curious, slightly mischievous. Norwegian bokmål. Each message includes news links + Norwegian summaries + a short Ceryx one-liner (wink/joke/curious aside related to the story).

---

## Dependency Chain

```
Ceryx Collector (03:00)
    │
    │  Writes: daily/YYYY-MM-DD.md (vault)
    │
    ├──► Newsfeed (05:30) ──► GitHub Pages (TV screen)
    │         │
    │         │  Marks: status → newsfeed
    │         │
    └──► Ceryx Publisher (06:00)
              │
              │  Writes: daily/YYYY-MM-DD_ceryx.md (plan)
              │  Marks: [x] slack-published
              │
              ├──► Slot 1 → Slack (06:00)
              ├──► Slot 2 → Slack (09:30)
              └──► Slot 3 → Slack (13:00)
```

**Status field isolation:** Newsfeed owns `status` in the main vault file. Publisher owns its separate `_ceryx.md` plan file. They do not conflict.

---

## Tools Summary (Complete Inventory)

### External APIs & Services

| Service | Tool/Method | Used By |
|---------|-------------|---------|
| **Hacker News** | `web_extract` (headless browser) | Collector |
| **TLDR Newsletters** | `himalaya` CLI (IMAP email) + `curl` | Collector |
| **Substack RSS** | `curl` (HTTP GET) | Collector |
| **Kode24** | `himalaya` CLI (IMAP email) | Collector |
| **Reddit** | **Composio MCP** (`REDDIT_GET_R_TOP`) | Collector |
| **Slack** | Python `urllib` → Incoming Webhook | Publisher |
| **GitHub** | `git` CLI (push to `Dberg042/BKBD_newsfeed`) | Newsfeed |
| **Discord** | `send_message` tool | All agents |

### CLI Tools

| Tool | Purpose | Used By |
|------|---------|---------|
| `himalaya` | Email retrieval (TLDR, Kode24) | Collector |
| `curl` | Image/source URL verification, redirect following, RSS fetching | Collector |
| `git` | Repo sync, commit, push | Newsfeed |
| `python3` | JSON generation, manifest building, Slack webhook POST | Newsfeed, Publisher |
| `sed` / `patch` | Vault/plan file status updates | Newsfeed, Publisher |

### Hermes Built-in Tools

| Tool | Purpose | Used By |
|------|---------|---------|
| `web_extract` | Fetch web pages as markdown | Collector |
| `web_search` | Search fallback (if needed) | Collector |
| `write_file` | Write vault files, JSON files, plan files | All |
| `read_file` | Read vault, plan files | Newsfeed, Publisher |
| `patch` | Targeted file edits (status updates) | Newsfeed, Publisher |
| `terminal` | Shell commands (`curl`, `git`, `python3`, `himalaya`) | All |
| `send_message` | Discord notifications | All |
| `browser_navigate` / `browser_snapshot` | Dynamic page scraping (fallback) | Collector |

### Composio MCP Integration

| MCP Tool | Purpose |
|----------|---------|
| `COMPOSIO_SEARCH_TOOLS` | Discover available Reddit tools |
| `COMPOSIO_MULTI_EXECUTE_TOOL` | Execute `REDDIT_GET_R_TOP` |
| `REDDIT_GET_R_TOP` | Fetch top r/ProgrammerHumor posts |

**Connection:** Reddit account `u/Striking-Edi` connected via Composio.

---

## Cron Schedule (UTC)

```
03:00  Ceryx Collector     — bc3abaf68f61  (Mon–Fri)  → #taskforce-hq
05:30  Newsfeed             — 688f4cdaf700  (Mon–Fri)  → #taskforce-hq
06:00  Ceryx Publisher S1   — d7406412b79d  (Mon–Fri)  → #eva-ops
06:30  Ceryx Retry (if 06 fail) — 62e7bd8a2f53  (Mon–Fri)  → #eva-ops
09:30  Ceryx Publisher S2   — c7842704bb49  (Mon–Fri)  → #eva-ops
13:00  Ceryx Publisher S3   — 26cd4e1b94cc  (Mon–Fri)  → #eva-ops
```

---

## Key Design Decisions

1. **Vault as single source of truth.** Collector writes; Newsfeed and Publisher read — never scrape externally.
2. **Status field isolation.** Newsfeed owns `status` in the main vault. Publisher owns its separate `_ceryx.md` plan file. No conflicts.
3. **Send+Mark atomicity (Publisher).** Python script sends to Slack and patches plan file in one `terminal()` call — prevents desync if agent context is cut short.
4. **Tirith-safe heredocs.** Publisher uses `python3 << 'PYEOF'` (not `cat | python3`) and unicode escapes for emoji to avoid security-scan stalls.
5. **Actual sources, never aggregators.** Collector always resolves to the real publisher (Google, Bloomberg, Kode24) — never "HN" or "TLDR".
6. **Norwegian bokmål throughout.** Target audience: Norwegian IT consultants and developers.
7. **Bouvet priority rule.** Any story mentioning Bouvet → `priority: 950`, always placed first.