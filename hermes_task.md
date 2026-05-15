# Hermes — Daily News Curation Agent

**Schedule:** Daily at 21:00 UTC
**Output:** Norwegian-language tech news bulletin as JSON files
**Target audience:** Norwegian IT consultants, developers, AI/data professionals
**Repository:** https://github.com/Dberg042/BKBD_newsfeed
Alwasy, first pull the repo, sync the repo and make it updated with latest commit.
---

## Mission

Curate 4-10 high-quality tech news items from three sources, write them as Norwegian-language JSON files, and commit them to the repository. Quality matters more than quantity.

---

## Working Directory
Pull the repository, and memorize its location.
Find "data" folder in repo

Inside, create today's date folder using format `YYYY-MM-DD` (UTC date at runtime).
Example: `date/2026-05-15/`

All JSON files for the day go inside this folder.

---

## Sources & Priority Order

Process sources in this order. Stop collecting once you have 10 high-quality items.

### Source 1: Kode24 Newsletter (Norwegian)
- Check inbox for unread emails from `@kode24.no`
- Read the newsletter content
- Select **2 most relevant stories** based on:
  - Topics: AI, software development, consulting industry, advisor roles, data platforms
  - **Bouvet mentions get automatic priority** — if any story mentions Bouvet, include it
  - Market shifts, industry-shaping events, thought-provoking analysis
  - **Reject:** ads, sponsored content, clickbait, lifestyle pieces unrelated to tech work
- For each selected story:
  - Click through to the actual article
  - Extract: title, summary, first relevant image URL, source URL
  - Source name: `Kode24`

### Source 2: TLDR Newsletters (English → translate to Norwegian)
Check in this order: `TLDR AI`, `TLDR InfoSec`, `TLDR Dev`, then base `TLDR`.
- Select 4-8 stories relevant to consultants working in development, infosec, cloud, AI
- **Priority topics:** Microsoft Cloud, .NET, React, Python, npm, JavaScript, security vulnerabilities, supply chain, AI tooling
- **Reject ads** (TLDR clearly marks sponsored content — skip those)
- For each story:
  - Use the summary from the newsletter (don't fetch the source unless summary is incomplete)
  - Extract source URL from the newsletter link
  - In most cases you need to follow article link and extract first/relevant image under the topic title 
  - Source name: whoever published the original (e.g., `TanStack`, `Microsoft`, `GitHub`)
  - **Image:** Only include if the newsletter contains one for that story. If no image, omit the `image_url` field entirely — do not invent or substitute.

### Source 3: Simplifying AI Newsletter (English → translate to Norwegian)
- Find today's edition
- For each story, for some story does have a paragraph and like **"Why it matters"**, end of the story
- Select stories where "Why it matters" reveals genuine industry impact (not hype)
- Use the newsletter content directly — if possible
- Extract the image URL from the newsletter HTML if present
- Source name: original publisher (e.g., `Google`, `OpenAI`, `Anthropic`)
- If you cannot found story image, follow the link to get relevant link.

---

## JSON Schema

Each news item is a separate file: `news-XXX.json` where XXX is the priority score (001-999).

```json
{
  "id": "news-XXX",
  "title": "Norwegian headline",
  "summary": "Norwegian summary, 200-300 characters, complete sentences.",
  "image_url": "https://...",
  "source_url": "https://...",
  "source_name": "Publisher name",
  "published_at": "2026-05-15T06:00:00Z",
  "priority": XXX
}
```

**Field rules:**
- `id` and filename must match (e.g., `news-850.json` has `"id": "news-850"`)
- `title` and `summary` MUST be in Norwegian
- `summary`: 200-300 characters, complete sentences, no truncation with "..."
- `image_url`: omit field entirely if no image available — do not use placeholder
- `priority`: integer 1-999, **higher = more important** (this maps to display order downstream)
- `published_at`: ISO 8601 UTC timestamp from the original source

---

## Priority Scoring Guide

Use these anchors when assigning priority:

| Range | Meaning | Example |
|-------|---------|---------|
| 900-999 | Critical / Bouvet-mentioned / major industry event | Bouvet news, major security breach |
| 700-899 | High relevance to consultants | New Microsoft cloud feature, AI tool launch |
| 500-699 | Solid tech news, worth knowing | Framework release, language update |
| 300-499 | Interesting but niche | Specific library update, regional news |
| 1-299 |Maybe usefull |

**Spread your scores.** Don't give everything 800+. The downstream system sorts by priority.

---

## Quality Control (Before Committing)

Run these checks on every JSON file. **If any fails, fix or drop the item.**

### Per-item checks:
1. ✅ **Language:** Is `title` and `summary` actually in Norwegian? (not English with Norwegian words)
2. ✅ **Summary length:** Between 200 and 300 characters?
3. ✅ **Image URL (if present):** Does HEAD request return 200 OK?
4. ✅ **Source URL:** Does HEAD request return 200 OK?
5. ✅ **No ads:** Re-check the content isn't sponsored/promotional
6. ✅ **Schema:** All required fields present, types correct?
7. ✅ **ID match:** Filename matches `id` field?
8. ✅ **Priority unique:** No two files have the same priority score (rename if collision)

### Cross-item checks:
9. ✅ **Deduplication:** Compare today's items against the same days' JSON files in the folder. If the same story appears, drop the duplicate.
10. ✅ **Count:** Minimum 4 items, maximum 10 items. If over 10, drop lowest-priority items. If under 4, log a warning but proceed.
11. ✅ **Diversity:** Not all items should be about the same topic (e.g., not 7 AI stories in a row). If imbalanced, prefer dropping lower-priority items in the dominant category.

### Final check:
12. ✅ **Folder content:** Only valid JSON files in the date folder. No partial writes, no temp files.

---

## Commit & Push

Once quality control passes:

1. Target repo: `https://github.com/Dberg042/BKBD_newsfeed.git`
2. Target path: `data/YYYY-MM-DD/` (mirror your workspace folder structure)
3. Commit message format: `News update: YYYY-MM-DD (source: hermes)`
4. Push to `main` branch
5. **Do NOT touch `data/active.json`** 

---

## Notification

After successful push, send a message to Discord channel `taskforce-hq`:

```
✅ News bulletin published for YYYY-MM-DD
📰 Items: N news stories
🏆 Top stories:
  - [priority] Title 1
  - [priority] Title 2
  - [priority] Title 3
🔗 https://github.com/Dberg042/BKBD_newsfeed/tree/main/data/YYYY-MM-DD
```

If something fails, send:

```
⚠️ News bulletin FAILED for YYYY-MM-DD
Reason: [error description]
Stage: [collection / quality-check / commit / push]
Items collected before failure: N
```

---

## Failure Handling

- **No emails from Kode24:** Skip Source 1, continue with Sources 2 and 3
- **TLDR newsletter missing:** Skip and continue. Log which one was missing.
- **Simplifying AI missing:** Skip and continue.
- **Less than 4 items total after all sources:** Still commit what you have, flag in Discord notification
- **Image URL returns 404:** Drop the image field, keep the story
- **Source URL returns 404:** Drop the entire story (broken link make the news feed code on TV is worse)
- **Git push fails:** Retry 3× with 30-second backoff. If still fails, notify Discord with error details, leave JSONs in workspace for manual recovery
- **0 stories collected:** Do not commit empty folder. Notify Discord.

---

## Examples (for reference only — do not copy verbatim)

### Example: Bouvet mention from Kode24
*Source content (Norwegian):*
> "Som sportsansvarlig i Bouvet Øst, Andreas Haugan Aursand, uttalte til kode24: ..."

*Result:*
```json
{
  "id": "news-920",
  "title": "Bouvet Øst satser på sport som rekrutteringsverktøy",
  "summary": "Andreas Haugan Aursand, sportsansvarlig i Bouvet Øst, forteller til Kode24 hvordan selskapet bruker sportslige aktiviteter strategisk for å tiltrekke og beholde utviklertalenter i et stramt arbeidsmarked.",
  "image_url": "https://image-www.kode24.no/262959.webp?imageId=262959&x=2.85&y=32.15&cropw=90.76&croph=67.32&width=1972&height=750&format=webp",
  "source_url": "https://kode24.no/artikkel/...",
  "source_name": "Kode24",
  "published_at": "2026-05-15T08:00:00Z",
  "priority": 920
}
```

### Example: TLDR InfoSec without image
*Source content:*
> "Postmortem: TanStack npm supply-chain compromise..."

*Result:*
```json
{
  "id": "news-780",
  "title": "TanStack npm-pakker kompromittert i forsyningskjedeangrep",
  "summary": "En angriper utnyttet pull_request_target-workflow, GitHub Actions cache-forgiftning og OIDC-tokentyveri til å publisere 84 ondsinnede versjoner av 42 TanStack-pakker. Skadelig kode hentet ut sky-, Kubernetes-, Vault- og GitHub-legitimasjon under installasjon.",
  "source_url": "https://tanstack.com/blog/npm-supply-chain-compromise-postmortem",
  "source_name": "TanStack",
  "published_at": "2026-05-14T12:00:00Z",
  "priority": 780
}
```
*Note: no `image_url` field because newsletter didn't include one for this item.*

### Example: Simplifying AI with image
*Result:*
```json
{
  "id": "news-870",
  "title": "Google avduker Gemini Intelligence",
  "summary": "Google avduket Gemini Intelligence på The Android Show 2026, og markerer Androids overgang fra et operativsystem til et «intelligenssystem». Gemini kan nå lese skjermen, navigere i apper og fullføre oppgaver med flere steg autonomt.",
  "image_url": "https://storage.googleapis.com/gweb-uniblog-publish-prod/images/Bento_Blog_header-_5.6.26_.width-1200.format-webp.webp",
  "source_url": "https://blog.google/products-and-platforms/platforms/android/gemini-intelligence/",
  "source_name": "Google",
  "published_at": "2026-05-14T15:19:00Z",
  "priority": 870
}
```

---

## Summary of Critical Rules

- 🇳🇴 All `title` and `summary` fields in Norwegian
- 📏 Summary: 200-300 characters
- 🚫 No ads, no clickbait, no sponsored content
- 🖼️ No image URL = no image field (don't fake it)
- 🎯 4-10 items per day, quality over quantity
- 🔍 Quality check before commit, not after push
- 📢 Always notify Discord, success or failure
- 🚪 Never touch `active.json` — that's Ake's gate